import { readFileSync } from 'node:fs'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cppCompiledProjectServerAssessment } from './data/cpp-compiled-project.server'
import { pythonDataToolsServerAssessment } from './data/python-data-tools.server'
import { pythonInteractiveProjectServerAssessment } from './data/python-interactive-project.server'
import {
  findRunnerAssignment,
  RUNNER_ASSIGNMENT_REVISION_VERSION,
  runnerAssignmentRevision,
  type CppAnalysis,
  type PythonAnalysis,
  type PythonDataToolsAnalysis,
} from './lib/runner-assignments'
import type { RunnerPurpose, RunnerResult } from './lib/runner-contract'

const staleAssignmentRevision = `${RUNNER_ASSIGNMENT_REVISION_VERSION}:${'0'.repeat(64)}`
const testSessionSecret = 'a-test-session-secret-that-is-long-enough-for-hmac'

const sandboxMocks = vi.hoisted(() => ({
  getSandbox: vi.fn(),
}))

vi.mock('@cloudflare/sandbox', () => ({
  Sandbox: class {},
  getSandbox: sandboxMocks.getSandbox,
}))

import { RunnerCoordinator } from './runner-coordinator'

interface TestQueuedRun {
  id: string
  ownerId: string
  ipHash: string
  exerciseId: string
  assignmentRevision: string
  language: 'python' | 'cpp'
  source: string
  stdin: string
  purpose: RunnerPurpose
  status: 'running'
  createdAt: number
  startedAt: number
  attempts: number
}

interface TestCompletedRun {
  result: Omit<RunnerResult, 'stdout' | 'stderr'>
}

interface ExecutableCoordinator {
  execute(record: TestQueuedRun): Promise<void>
}

class MemoryStorage {
  readonly data = new Map<string, unknown>()
  alarm: number | null = null

  async get<T>(key: string): Promise<T | undefined> {
    return this.data.get(key) as T | undefined
  }

  async list<T>(options: { prefix: string }): Promise<Map<string, T>> {
    return new Map(
      [...this.data.entries()]
        .filter(([key]) => key.startsWith(options.prefix))
        .map(([key, value]) => [key, value as T]),
    )
  }

  async put(keyOrEntries: string | Record<string, unknown>, value?: unknown): Promise<void> {
    if (typeof keyOrEntries === 'string') {
      this.data.set(keyOrEntries, value)
      return
    }
    for (const [key, entry] of Object.entries(keyOrEntries)) this.data.set(key, entry)
  }

  async delete(keys: string | string[]): Promise<void> {
    for (const key of Array.isArray(keys) ? keys : [keys]) this.data.delete(key)
  }

  async getAlarm(): Promise<number | null> {
    return this.alarm
  }

  async setAlarm(value: number): Promise<void> {
    this.alarm = value
  }
}

function requiredAssignment(exerciseId: string) {
  const assignment = findRunnerAssignment(exerciseId)
  if (!assignment) throw new Error(`Missing test runner assignment ${exerciseId}.`)
  return assignment
}

const pythonProjectRevision = await runnerAssignmentRevision(requiredAssignment('project-py-final'))
const cppProjectRevision = await runnerAssignmentRevision(requiredAssignment('project-cpp-final'))
const pythonDataToolsRevision = await runnerAssignmentRevision(requiredAssignment('pydata6-supply-tracker'))

function supervisorResult(
  outcome: RunnerResult['outcome'],
  stdout: string,
  stderr = '',
  durationMs = 5,
  pythonAnalysis: unknown = emptyPythonAnalysis(),
  cppAnalysis: unknown = undefined,
) {
  return JSON.stringify({
    outcome,
    stdout,
    stderr,
    exit_code: outcome === 'completed' ? 0 : 1,
    duration_ms: durationMs,
    truncated: false,
    limit: null,
    ...(pythonAnalysis === null ? {} : { python_analysis: pythonAnalysis }),
    ...(cppAnalysis === undefined ? {} : { cpp_analysis: cppAnalysis }),
  })
}

function emptyPythonAnalysis(): PythonAnalysis {
  return {
    version: 1,
    parsed: true,
    straight_line: true,
    assignments: [],
    print_fstrings: [],
  }
}

function referencePythonAnalysis(): PythonAnalysis {
  return {
    version: 1,
    parsed: true,
    straight_line: true,
    assignments: [
      { target: 'price_per_cup', occurrence: 1, kind: 'integer', value: 3 },
      { target: 'name', occurrence: 1, kind: 'input' },
      { target: 'cups_text', occurrence: 1, kind: 'input' },
      { target: 'cups', occurrence: 1, kind: 'int_name', name: 'cups_text' },
      { target: 'total', occurrence: 1, kind: 'multiply_names', names: ['cups', 'price_per_cup'] },
    ],
    print_fstrings: [{ occurrence: 1, fields: ['name', 'cups', 'total'] }],
  }
}

function emptyCppAnalysis(): CppAnalysis {
  return {
    version: 1,
    analyzed: false,
    parsed: false,
    straight_line: false,
    headers: [],
    main_signature: false,
    returns_zero: false,
    declarations: [],
    inputs: [],
    cout_chains: [],
  }
}

function referenceCppAnalysis(): CppAnalysis {
  return {
    version: 1,
    analyzed: true,
    parsed: true,
    straight_line: true,
    headers: ['iostream', 'string'],
    main_signature: true,
    returns_zero: true,
    declarations: [
      { target: 'points_per_detail', occurrence: 1, statement: 1, kind: 'integer', value: 5 },
      { target: 'observer_name', occurrence: 1, statement: 4, kind: 'string' },
      { target: 'details', occurrence: 1, statement: 7, kind: 'integer', value: 0 },
      {
        target: 'focus_points',
        occurrence: 1,
        statement: 9,
        kind: 'multiply_names',
        names: ['details', 'points_per_detail'],
      },
    ],
    inputs: [
      { occurrence: 1, statement: 5, kind: 'getline_cin', target: 'observer_name' },
      { occurrence: 2, statement: 8, kind: 'cin_extract', target: 'details' },
    ],
    cout_chains: [
      { occurrence: 1, statement: 2, fields: [] },
      { occurrence: 2, statement: 3, fields: [] },
      { occurrence: 3, statement: 6, fields: [] },
      { occurrence: 4, statement: 10, fields: ['observer_name', 'details', 'focus_points'] },
    ],
  }
}

function cppSupervisorResult(
  outcome: RunnerResult['outcome'],
  stdout: string,
  cppAnalysis: unknown,
  stderr = '',
  durationMs = 5,
) {
  return supervisorResult(outcome, stdout, stderr, durationMs, null, cppAnalysis)
}

function queuedRun(source: string, purpose: RunnerPurpose, stdin = ''): TestQueuedRun {
  return {
    id: 'projectrunnercase000000000001',
    ownerId: 'owner-identifier-that-is-long-enough',
    ipHash: 'ip-hash-that-is-long-enough',
    exerciseId: 'project-py-final',
    assignmentRevision: pythonProjectRevision,
    language: 'python',
    source,
    stdin,
    purpose,
    status: 'running',
    createdAt: 1,
    startedAt: 2,
    attempts: 1,
  }
}

function queuedCppRun(source: string, purpose: RunnerPurpose, stdin = ''): TestQueuedRun {
  return {
    ...queuedRun(source, purpose, stdin),
    id: 'cppprojectrunnercase00000000001',
    exerciseId: 'project-cpp-final',
    assignmentRevision: cppProjectRevision,
    language: 'cpp',
  }
}

function queuedPythonDataToolsRun(source: string, purpose: RunnerPurpose = 'check'): TestQueuedRun {
  return {
    ...queuedRun(source, purpose),
    id: 'pythondatatoolsrunnercase000001',
    exerciseId: 'pydata6-supply-tracker',
    assignmentRevision: pythonDataToolsRevision,
  }
}

function pythonDataToolsAnalysis(
  overrides: Partial<PythonDataToolsAnalysis> = {},
): PythonDataToolsAnalysis {
  return {
    version: 1,
    profile: 'python-data-tools-supply-tracker-v1',
    analyzed: true,
    parsed: true,
    authored_frame: true,
    normalize_name: true,
    add_stock: true,
    total_stock: true,
    low_stock: true,
    harness: true,
    ...overrides,
  }
}

function coordinatorWith(storage: MemoryStorage): ExecutableCoordinator {
  return coordinatorInstance(storage) as unknown as ExecutableCoordinator
}

function coordinatorInstance(storage: MemoryStorage): RunnerCoordinator {
  return new RunnerCoordinator(
    { storage } as never,
    {
      SESSION_SECRET: testSessionSecret,
      RUNNER_PYTHON: {},
      RUNNER_CPP: {},
      RUNNER_CSHARP: {},
      RUNNER_JAVA: {},
    } as never,
  )
}

function storedResult(storage: MemoryStorage, runId: string) {
  const completed = storage.data.get(`run:${runId}`) as TestCompletedRun | undefined
  if (!completed) throw new Error('The coordinator did not store a completed result.')
  return {
    ...completed.result,
    stdout: storage.data.get(`output:${runId}`) as string ?? '',
    stderr: storage.data.get(`error:${runId}`) as string ?? '',
  }
}

beforeEach(() => {
  sandboxMocks.getSandbox.mockReset()
  vi.spyOn(console, 'info').mockImplementation(() => undefined)
  vi.spyOn(console, 'error').mockImplementation(() => undefined)
  vi.spyOn(console, 'warn').mockImplementation(() => undefined)
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('project multi-case sandbox execution', () => {
  it('runs every case in a separate sandbox after output mismatches', async () => {
    const storage = new MemoryStorage()
    const files = new Map<string, string>()
    const visibleOutput = pythonInteractiveProjectServerAssessment.testCases[0].expectedStdout
    const sandbox = {
      writeFile: vi.fn(async (path: string, value: string) => {
        files.set(path, value)
      }),
      exec: vi.fn(async (command: string) => {
        void command
        return { success: true, stdout: supervisorResult('completed', visibleOutput) }
      }),
      destroy: vi.fn(async () => undefined),
    }
    sandboxMocks.getSandbox.mockReturnValue(sandbox)
    const record = queuedRun(`print(${JSON.stringify(visibleOutput)})`, 'check', 'ignored caller input\n')

    await coordinatorWith(storage).execute(record)

    expect(sandboxMocks.getSandbox).toHaveBeenCalledTimes(4)
    expect(sandboxMocks.getSandbox.mock.calls.map(([, id]) => id)).toEqual([
      `run-${record.id}-case-1`,
      `run-${record.id}-case-2`,
      `run-${record.id}-case-3`,
      `run-${record.id}-case-4`,
    ])
    expect(sandbox.exec).toHaveBeenCalledTimes(4)
    expect(sandbox.writeFile.mock.calls.filter(([path]) => path === '/workspace/source.txt')).toHaveLength(4)
    expect(sandbox.writeFile.mock.calls.filter(([path]) => path === '/workspace/stdin.txt')).toHaveLength(4)
    expect(sandbox.exec.mock.calls.every(([command]) => command === '/opt/runner/supervisor.py python')).toBe(true)
    expect(sandbox.destroy).toHaveBeenCalledTimes(4)
    const result = storedResult(storage, record.id)
    expect(result.stdout).toBe(visibleOutput)
    expect(result.stderr).toBe('')
    expect(result.durationMs).toBe(20)
    expect(result.tests[0]).toMatchObject({ visibility: 'visible', passed: true })
    expect(result.tests.slice(1, 4).every((test) => !test.passed)).toBe(true)
    expect(result.tests.every((test) => test.passed)).toBe(false)
  })

  it('passes the reference solution through all cases and structural checks', async () => {
    const storage = new MemoryStorage()
    const files = new Map<string, string>()
    const sandbox = {
      writeFile: vi.fn(async (path: string, value: string) => {
        files.set(path, value)
      }),
      exec: vi.fn(async () => {
        const stdin = files.get('/workspace/stdin.txt') ?? ''
        const testCase = pythonInteractiveProjectServerAssessment.testCases.find((candidate) => (
          candidate.stdin === stdin
        ))
        return {
          success: true,
          stdout: supervisorResult(
            'completed',
            testCase?.expectedStdout ?? 'wrong case',
            '',
            5,
            referencePythonAnalysis(),
          ),
        }
      }),
      destroy: vi.fn(async () => undefined),
    }
    sandboxMocks.getSandbox.mockReturnValue(sandbox)
    const record = queuedRun(pythonInteractiveProjectServerAssessment.referenceSolution, 'check')

    await coordinatorWith(storage).execute(record)

    const result = storedResult(storage, record.id)
    expect(sandbox.exec).toHaveBeenCalledTimes(4)
    expect(sandboxMocks.getSandbox).toHaveBeenCalledTimes(4)
    expect(sandbox.destroy).toHaveBeenCalledTimes(4)
    expect(result.outcome).toBe('completed')
    expect(result.tests).toHaveLength(10)
    expect(result.tests.every((test) => test.passed)).toBe(true)
    expect(result.stdout).toBe(pythonInteractiveProjectServerAssessment.testCases[0].expectedStdout)

    const serialized = JSON.stringify(result)
    expect(serialized).not.toMatch(/Morgan|Riley|Sam Lee|\$3\.|\$21\.|\$0\./u)
    expect(serialized).not.toContain(pythonInteractiveProjectServerAssessment.referenceSolution)
    expect(serialized).not.toContain('python_analysis')
    expect(serialized).not.toContain('print_fstrings')
  })

  it('stops after a hidden runtime failure and removes its private error text', async () => {
    const storage = new MemoryStorage()
    const visibleCase = pythonInteractiveProjectServerAssessment.testCases[0]
    const sandbox = {
      writeFile: vi.fn(async () => undefined),
      exec: vi.fn()
        .mockResolvedValueOnce({
          success: true,
          stdout: supervisorResult(
            'completed',
            visibleCase.expectedStdout,
            '',
            5,
            referencePythonAnalysis(),
          ),
        })
        .mockResolvedValueOnce({
          success: true,
          stdout: supervisorResult(
            'runtime_error',
            '',
            'Morgan caused a private hidden failure.',
            5,
            referencePythonAnalysis(),
          ),
        }),
      destroy: vi.fn(async () => undefined),
    }
    sandboxMocks.getSandbox.mockReturnValue(sandbox)
    const record = queuedRun(pythonInteractiveProjectServerAssessment.referenceSolution, 'check')

    await coordinatorWith(storage).execute(record)

    expect(sandbox.exec).toHaveBeenCalledTimes(2)
    expect(sandboxMocks.getSandbox).toHaveBeenCalledTimes(2)
    expect(sandbox.destroy).toHaveBeenCalledTimes(2)
    const result = storedResult(storage, record.id)
    expect(result.outcome).toBe('runtime_error')
    expect(result.stdout).toBe(visibleCase.expectedStdout)
    expect(result.stderr).toBe('')
    expect(JSON.stringify(result)).not.toContain('Morgan')
    expect(result.tests).toHaveLength(10)
    expect(result.tests.slice(0, 4).map((test) => test.passed)).toEqual([true, false, false, false])
    expect(result.tests.slice(4).every((test) => test.passed)).toBe(true)
  })

  it('runs practice input once without returning grading tests', async () => {
    const storage = new MemoryStorage()
    const files = new Map<string, string>()
    const sandbox = {
      writeFile: vi.fn(async (path: string, value: string) => {
        files.set(path, value)
      }),
      exec: vi.fn(async () => ({ success: true, stdout: supervisorResult('completed', 'Practice output') })),
      destroy: vi.fn(async () => undefined),
    }
    sandboxMocks.getSandbox.mockReturnValue(sandbox)
    const record = queuedRun('print(input())', 'run', 'Chris\n')

    await coordinatorWith(storage).execute(record)

    expect(sandbox.exec).toHaveBeenCalledOnce()
    expect(files.get('/workspace/stdin.txt')).toBe('Chris\n')
    expect(sandbox.destroy).toHaveBeenCalledOnce()
    const result = storedResult(storage, record.id)
    expect(result.stdout).toBe('Practice output')
    expect(result.tests).toEqual([])
  })

  it.each([
    ['missing', null],
    ['wrong version', { ...emptyPythonAnalysis(), version: 2 }],
    ['invalid parsed state', { ...emptyPythonAnalysis(), parsed: false }],
    ['nonsequential assignment occurrence', {
      ...emptyPythonAnalysis(),
      assignments: [{ target: 'name', occurrence: 2, kind: 'input' }],
    }],
    ['unsorted multiplication names', {
      ...emptyPythonAnalysis(),
      assignments: [{
        target: 'total',
        occurrence: 1,
        kind: 'multiply_names',
        names: ['price_per_cup', 'cups'],
      }],
    }],
    ['oversized f-string fact list', {
      ...emptyPythonAnalysis(),
      print_fstrings: Array.from({ length: 33 }, (_, index) => ({
        occurrence: index + 1,
        fields: [],
      })),
    }],
  ])('fails closed when Python analysis is %s', async (_name, pythonAnalysis) => {
    const storage = new MemoryStorage()
    const sandbox = {
      writeFile: vi.fn(async () => undefined),
      exec: vi.fn(async () => ({
        success: true,
        stdout: supervisorResult('completed', 'Behavior output', '', 5, pythonAnalysis),
      })),
      destroy: vi.fn(async () => undefined),
    }
    sandboxMocks.getSandbox.mockReturnValue(sandbox)
    const record = queuedRun('print("Behavior output")', 'check')

    await coordinatorWith(storage).execute(record)

    const result = storedResult(storage, record.id)
    expect(sandbox.exec).toHaveBeenCalledOnce()
    expect(result.outcome).toBe('system_error')
    expect(result.tests).toHaveLength(10)
    expect(result.tests.every((test) => !test.passed)).toBe(true)
    expect(JSON.stringify(result)).not.toContain('python_analysis')
  })
})

describe('queued assignment release boundary', () => {
  it.each([
    ['missing assignment', 'removed-runner-assignment', 'python' as const],
    ['language mismatch', 'project-py-final', 'cpp' as const],
  ])('stores a generic system error without creating a sandbox for a %s', async (
    _label,
    exerciseId,
    language,
  ) => {
    const storage = new MemoryStorage()
    const record: TestQueuedRun = {
      ...queuedRun('source must never enter a sandbox', 'check'),
      id: `failclosedrunnercase${language}00000001`,
      exerciseId,
      language,
    }

    await coordinatorWith(storage).execute(record)

    const result = storedResult(storage, record.id)
    expect(sandboxMocks.getSandbox).not.toHaveBeenCalled()
    expect(result).toMatchObject({
      outcome: 'system_error',
      stdout: '',
      stderr: '',
      exitCode: null,
      durationMs: 0,
      truncated: false,
      limit: null,
      tests: [],
      diagnostic: {
        title: 'The code checker had a problem',
        explanation: 'This was a service problem, not proof that your code is wrong.',
        line: null,
      },
    })
    expect(JSON.stringify(result)).not.toContain(exerciseId)
    expect(JSON.stringify(result)).not.toContain(record.source)
  })

  it('stores a generic system error when queued grading semantics no longer match', async () => {
    const storage = new MemoryStorage()
    const record: TestQueuedRun = {
      ...queuedRun('source must never enter a sandbox', 'check'),
      assignmentRevision: staleAssignmentRevision,
    }

    await coordinatorWith(storage).execute(record)

    const result = storedResult(storage, record.id)
    expect(sandboxMocks.getSandbox).not.toHaveBeenCalled()
    expect(result).toMatchObject({
      outcome: 'system_error',
      stdout: '',
      stderr: '',
      tests: [],
    })
    expect(JSON.stringify(result)).not.toContain(record.assignmentRevision)
    expect(JSON.stringify(result)).not.toContain(record.source)
  })
})

describe('assignment revision coordinator boundary', () => {
  it('returns an opaque keyed assignment binding on a valid pending result', async () => {
    const storage = new MemoryStorage()
    const now = Date.now()
    const record = {
      ...queuedRun('print("private source")', 'check'),
      createdAt: now,
      startedAt: now,
    }
    storage.data.set(`run:${record.id}`, record)

    const response = await coordinatorInstance(storage).fetch(new Request(
      `https://runner.internal/result/${record.id}`,
      { headers: { 'X-Runner-Owner': record.ownerId } },
    ))

    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(testSessionSecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    )
    const signature = await crypto.subtle.sign(
      'HMAC',
      key,
      new TextEncoder().encode(`runner-assignment:${record.assignmentRevision}`),
    )
    const expectedBinding = Buffer.from(signature).toString('base64url')

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({ status: 'running' })
    expect(response.headers.get('X-Runner-Assignment-Id')).toBe(record.exerciseId)
    expect(response.headers.get('X-Runner-Assignment-Binding')).toBe(expectedBinding)
    expect(expectedBinding).toMatch(/^[A-Za-z0-9_-]{43}$/u)
    expect(expectedBinding).not.toContain(record.assignmentRevision)
  })

  it('rejects an internal submission whose revision does not match current grading semantics', async () => {
    const storage = new MemoryStorage()
    const runId = 'revisionmismatchsubmit000001'
    const response = await coordinatorInstance(storage).fetch(new Request('https://runner.internal/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        runId,
        ownerId: 'owner-identifier-that-is-long-enough',
        ipHash: 'ip-hash-that-is-long-enough',
        exerciseId: 'project-py-final',
        assignmentRevision: staleAssignmentRevision,
        request: {
          version: 1,
          language: 'python',
          source: 'print("private source")',
        },
      }),
    }))

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      error: 'This lesson changed while you were working. Reload the page and try again.',
    })
    expect(storage.data.has(`run:${runId}`)).toBe(false)
    expect(storage.data.has('queue')).toBe(false)
  })

  it('persists the verified revision on a queued submission', async () => {
    const storage = new MemoryStorage()
    const runId = 'revisionmatchedsubmit0000001'
    const response = await coordinatorInstance(storage).fetch(new Request('https://runner.internal/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        runId,
        ownerId: 'owner-identifier-that-is-long-enough',
        ipHash: 'ip-hash-that-is-long-enough',
        exerciseId: 'project-py-final',
        assignmentRevision: pythonProjectRevision,
        request: {
          version: 1,
          language: 'python',
          source: 'print("private source")',
        },
      }),
    }))

    expect(response.status).toBe(200)
    expect(storage.data.get(`run:${runId}`)).toMatchObject({
      exerciseId: 'project-py-final',
      assignmentRevision: pythonProjectRevision,
      status: 'queued',
    })
  })

  it.each([
    ['changed', 'project-py-final', staleAssignmentRevision],
    ['removed', 'removed-runner-assignment', pythonProjectRevision],
    ['legacy', 'project-py-final', undefined],
  ])('does not return a completed result for a %s assignment', async (
    _label,
    exerciseId,
    assignmentRevision,
  ) => {
    const storage = new MemoryStorage()
    const runId = `invalidatedresult${_label}000001`
    const ownerId = 'owner-identifier-that-is-long-enough'
    storage.data.set(`run:${runId}`, {
      id: runId,
      ownerId,
      exerciseId,
      assignmentRevision,
      language: 'python',
      status: 'complete',
      createdAt: 1,
      completedAt: 2,
      expiresAt: Date.now() + 60_000,
      result: {
        version: 1,
        runId,
        outcome: 'completed',
        exitCode: 0,
        durationMs: 5,
        truncated: false,
        limit: null,
        tests: [],
        diagnostic: null,
      },
    })
    storage.data.set(`output:${runId}`, 'must not be returned')
    storage.data.set(`error:${runId}`, 'private error')

    const response = await coordinatorInstance(storage).fetch(new Request(
      `https://runner.internal/result/${runId}`,
      { headers: { 'X-Runner-Owner': ownerId } },
    ))

    expect(response.status).toBe(404)
    await expect(response.json()).resolves.toEqual({ error: 'Run not found.' })
    expect(storage.data.has(`run:${runId}`)).toBe(false)
    expect(storage.data.has(`output:${runId}`)).toBe(false)
    expect(storage.data.has(`error:${runId}`)).toBe(false)
  })
})

describe('trusted C++ project analysis coordination', () => {
  it('requests analysis only for the first official case and passes all twelve checks', async () => {
    const storage = new MemoryStorage()
    const files = new Map<string, string>()
    const sandbox = {
      writeFile: vi.fn(async (path: string, value: string) => {
        files.set(path, value)
      }),
      exec: vi.fn(async (command: string) => {
        const stdin = files.get('/workspace/stdin.txt') ?? ''
        const testCase = cppCompiledProjectServerAssessment.testCases.find((candidate) => (
          candidate.stdin === stdin
        ))
        const analysis = command.endsWith(' --project-analysis')
          ? referenceCppAnalysis()
          : emptyCppAnalysis()
        return {
          success: true,
          stdout: cppSupervisorResult(
            'completed',
            testCase?.expectedStdout ?? 'wrong case',
            analysis,
          ),
        }
      }),
      destroy: vi.fn(async () => undefined),
    }
    sandboxMocks.getSandbox.mockReturnValue(sandbox)
    const record = queuedCppRun(cppCompiledProjectServerAssessment.referenceSolution, 'check')

    await coordinatorWith(storage).execute(record)

    expect(sandbox.exec.mock.calls.map(([command]) => command)).toEqual([
      '/opt/runner/supervisor.py cpp --project-analysis',
      '/opt/runner/supervisor.py cpp',
      '/opt/runner/supervisor.py cpp',
      '/opt/runner/supervisor.py cpp',
    ])
    expect(sandboxMocks.getSandbox).toHaveBeenCalledTimes(4)
    expect(sandbox.destroy).toHaveBeenCalledTimes(4)
    const result = storedResult(storage, record.id)
    expect(result.outcome).toBe('completed')
    expect(result.tests).toHaveLength(12)
    expect(result.tests.every((test) => test.passed)).toBe(true)
    expect(result.stdout).toBe(cppCompiledProjectServerAssessment.testCases[0].expectedStdout)
    const serialized = JSON.stringify(result)
    expect(serialized).not.toContain('cpp_analysis')
    expect(serialized).not.toContain('cout_chains')
    expect(serialized).not.toMatch(/Morgan|Riley|Sam Lee|35 focus points/u)
  })

  it('uses the non-analyzed envelope for an ordinary C++ practice run', async () => {
    const storage = new MemoryStorage()
    const sandbox = {
      writeFile: vi.fn(async () => undefined),
      exec: vi.fn(async () => ({
        success: true,
        stdout: cppSupervisorResult('completed', 'Practice output', emptyCppAnalysis()),
      })),
      destroy: vi.fn(async () => undefined),
    }
    sandboxMocks.getSandbox.mockReturnValue(sandbox)
    const record = queuedCppRun('int main() { return 0; }', 'run')

    await coordinatorWith(storage).execute(record)

    expect(sandbox.exec).toHaveBeenCalledWith('/opt/runner/supervisor.py cpp', {
      timeout: 20_000,
    })
    const result = storedResult(storage, record.id)
    expect(result.outcome).toBe('completed')
    expect(result.stdout).toBe('Practice output')
    expect(result.tests).toEqual([])
    expect(JSON.stringify(result)).not.toContain('cpp_analysis')
  })

  it.each([
    ['missing', undefined],
    ['not analyzed when requested', emptyCppAnalysis()],
    ['wrong version', { ...referenceCppAnalysis(), version: 2 }],
    ['duplicate header', { ...referenceCppAnalysis(), headers: ['iostream', 'iostream'] }],
    ['nonsequential declaration occurrence', {
      ...referenceCppAnalysis(),
      declarations: [{
        target: 'details', occurrence: 2, statement: 7, kind: 'integer', value: 0,
      }],
    }],
    ['nonsequential input occurrence', {
      ...referenceCppAnalysis(),
      inputs: [{ occurrence: 2, statement: 8, kind: 'cin_extract', target: 'details' }],
    }],
    ['missing declaration statement', {
      ...referenceCppAnalysis(),
      declarations: [{ target: 'details', occurrence: 1, kind: 'integer', value: 0 }],
    }],
    ['zero input statement', {
      ...referenceCppAnalysis(),
      inputs: [{ occurrence: 1, statement: 0, kind: 'getline_cin', target: 'observer_name' }],
    }],
    ['unsafe output statement', {
      ...referenceCppAnalysis(),
      cout_chains: [{
        occurrence: 1, statement: Number.MAX_SAFE_INTEGER + 1, fields: [],
      }],
    }],
    ['unknown root property', {
      ...referenceCppAnalysis(),
      unexpected: true,
    }],
    ['unknown declaration property', {
      ...referenceCppAnalysis(),
      declarations: [{
        target: 'details', occurrence: 1, statement: 7, kind: 'integer', value: 0, unexpected: true,
      }],
    }],
    ['oversized cout fact list', {
      ...referenceCppAnalysis(),
      cout_chains: Array.from({ length: 17 }, (_, index) => ({
        occurrence: index + 1,
        statement: index + 1,
        fields: [],
      })),
    }],
    ['oversized identifier budget', {
      ...referenceCppAnalysis(),
      cout_chains: Array.from({ length: 16 }, (_, index) => ({
        occurrence: index + 1,
        statement: index + 1,
        fields: Array.from({ length: 16 }, (_unused, fieldIndex) => (
          `field_${'x'.repeat(16)}_${index}_${fieldIndex}`
        )),
      })),
    }],
    ['facts in a non-analyzed envelope', {
      ...emptyCppAnalysis(),
      headers: ['iostream'],
    }],
  ])('fails closed when requested C++ analysis is %s', async (_name, cppAnalysis) => {
    const storage = new MemoryStorage()
    const sandbox = {
      writeFile: vi.fn(async () => undefined),
      exec: vi.fn(async () => ({
        success: true,
        stdout: cppSupervisorResult('completed', 'Behavior output', cppAnalysis),
      })),
      destroy: vi.fn(async () => undefined),
    }
    sandboxMocks.getSandbox.mockReturnValue(sandbox)
    const record = queuedCppRun('int main() { return 0; }', 'check')

    await coordinatorWith(storage).execute(record)

    const result = storedResult(storage, record.id)
    expect(sandbox.exec).toHaveBeenCalledOnce()
    expect(result.outcome).toBe('system_error')
    expect(result.tests).toHaveLength(12)
    expect(result.tests.every((test) => !test.passed)).toBe(true)
    expect(JSON.stringify(result)).not.toContain('cpp_analysis')
  })

  it('keeps an analyzed but unparsed C++ result as a compiler failure', async () => {
    const storage = new MemoryStorage()
    const analysis: CppAnalysis = {
      ...emptyCppAnalysis(),
      analyzed: true,
    }
    const sandbox = {
      writeFile: vi.fn(async () => undefined),
      exec: vi.fn(async () => ({
        success: true,
        stdout: cppSupervisorResult('compile_error', '', analysis, 'expected a semicolon'),
      })),
      destroy: vi.fn(async () => undefined),
    }
    sandboxMocks.getSandbox.mockReturnValue(sandbox)
    const record = queuedCppRun('int main( {', 'check')

    await coordinatorWith(storage).execute(record)

    const result = storedResult(storage, record.id)
    expect(result.outcome).toBe('compile_error')
    expect(result.tests).toHaveLength(12)
    expect(result.tests.every((test) => !test.passed)).toBe(true)
    expect(result.stderr).toContain('expected a semicolon')
  })

  it('rejects an analyzed envelope returned by a later hidden case', async () => {
    const storage = new MemoryStorage()
    const visibleCase = cppCompiledProjectServerAssessment.testCases[0]
    const sandbox = {
      writeFile: vi.fn(async () => undefined),
      exec: vi.fn()
        .mockResolvedValueOnce({
          success: true,
          stdout: cppSupervisorResult('completed', visibleCase.expectedStdout, referenceCppAnalysis()),
        })
        .mockResolvedValueOnce({
          success: true,
          stdout: cppSupervisorResult('completed', 'hidden output', referenceCppAnalysis()),
        }),
      destroy: vi.fn(async () => undefined),
    }
    sandboxMocks.getSandbox.mockReturnValue(sandbox)
    const record = queuedCppRun(cppCompiledProjectServerAssessment.referenceSolution, 'check')

    await coordinatorWith(storage).execute(record)

    const result = storedResult(storage, record.id)
    expect(sandbox.exec).toHaveBeenCalledTimes(2)
    expect(result.outcome).toBe('system_error')
    expect(result.tests.slice(0, 4).map((test) => test.passed)).toEqual([true, false, false, false])
    expect(result.tests.slice(4).every((test) => test.passed)).toBe(true)
  })
})

describe('trusted Python Data Tools lesson analysis coordination', () => {
  const expectedOutput = pythonDataToolsServerAssessment.testCases[0].expectedStdout
  const authenticSource = readFileSync(
    new URL('../runner/fixtures/python-data-tools-reference.python.txt', import.meta.url),
    'utf8',
  ).trimEnd()

  function trustedSandbox(analysis: unknown, sourceOutput = expectedOutput) {
    return {
      writeFile: vi.fn(async () => undefined),
      exec: vi.fn(async (command: string) => {
        if (command === '/usr/bin/python3 -I -B /opt/runner/PythonDataToolsAnalyzer.py /workspace/source.txt') {
          return { success: true, stdout: typeof analysis === 'string' ? analysis : JSON.stringify(analysis) }
        }
        return {
          success: true,
          stdout: supervisorResult(
            'completed',
            sourceOutput,
            '',
            5,
            { ...emptyPythonAnalysis(), straight_line: false },
          ),
        }
      }),
      destroy: vi.fn(async () => undefined),
    }
  }

  it('runs the fixed analyzer before the fixed supervisor in one fresh sandbox', async () => {
    const storage = new MemoryStorage()
    const sandbox = trustedSandbox(pythonDataToolsAnalysis(), `${expectedOutput}\n`)
    sandboxMocks.getSandbox.mockReturnValue(sandbox)
    const record = queuedPythonDataToolsRun(authenticSource)

    await coordinatorWith(storage).execute(record)

    expect(sandboxMocks.getSandbox).toHaveBeenCalledOnce()
    expect(sandbox.exec.mock.calls.map(([command]) => command)).toEqual([
      '/usr/bin/python3 -I -B /opt/runner/PythonDataToolsAnalyzer.py /workspace/source.txt',
      '/opt/runner/supervisor.py python',
    ])
    expect(sandbox.writeFile).toHaveBeenCalledWith('/workspace/source.txt', authenticSource)
    expect(sandbox.writeFile).toHaveBeenCalledWith('/workspace/stdin.txt', '')
    expect(sandbox.destroy).toHaveBeenCalledOnce()
    const result = storedResult(storage, record.id)
    expect(result.outcome).toBe('completed')
    expect(result.stdout).toBe(`${expectedOutput}\n`)
    expect(result.tests).toHaveLength(7)
    expect(result.tests.every((test) => test.passed)).toBe(true)
    const serialized = JSON.stringify(result)
    expect(serialized).not.toContain('python-data-tools-supply-tracker-v1')
    expect(serialized).not.toContain('python_data_tools_analysis')
    expect(serialized).not.toContain('authored_frame')
  })

  it('lets visible output pass while a hardcoded answer fails all protected facts', async () => {
    const storage = new MemoryStorage()
    const sandbox = trustedSandbox(pythonDataToolsAnalysis({
      authored_frame: false,
      normalize_name: false,
      add_stock: false,
      total_stock: false,
      low_stock: false,
      harness: false,
    }))
    sandboxMocks.getSandbox.mockReturnValue(sandbox)
    const record = queuedPythonDataToolsRun(`print(${JSON.stringify(expectedOutput)})`)

    await coordinatorWith(storage).execute(record)

    const result = storedResult(storage, record.id)
    expect(result.outcome).toBe('completed')
    expect(result.tests).toHaveLength(7)
    expect(result.tests[0]).toMatchObject({ visibility: 'visible', passed: true })
    expect(result.tests.slice(1).every((test) => !test.passed)).toBe(true)
  })

  it.each([
    ['missing', ''],
    ['invalid JSON', '{'],
    ['wrong profile', JSON.stringify({ ...pythonDataToolsAnalysis(), profile: 'wrong-profile' })],
    ['extra root key', JSON.stringify({ ...pythonDataToolsAnalysis(), extra: true })],
    ['facts in an unparsed envelope', JSON.stringify(pythonDataToolsAnalysis({
      parsed: false,
      authored_frame: true,
    }))],
    ['not analyzed', JSON.stringify(pythonDataToolsAnalysis({
      analyzed: false,
      parsed: false,
      authored_frame: false,
      normalize_name: false,
      add_stock: false,
      total_stock: false,
      low_stock: false,
      harness: false,
    }))],
    ['oversized', 'x'.repeat(2_049)],
  ])('fails closed without executing learner code when analysis is %s', async (_label, analyzerOutput) => {
    const storage = new MemoryStorage()
    const sandbox = trustedSandbox(analyzerOutput)
    sandboxMocks.getSandbox.mockReturnValue(sandbox)
    const record = queuedPythonDataToolsRun(authenticSource)

    await coordinatorWith(storage).execute(record)

    expect(sandbox.exec).toHaveBeenCalledOnce()
    expect(sandbox.exec).toHaveBeenCalledWith(
      '/usr/bin/python3 -I -B /opt/runner/PythonDataToolsAnalyzer.py /workspace/source.txt',
      { timeout: 5_000 },
    )
    expect(sandbox.destroy).toHaveBeenCalledOnce()
    const result = storedResult(storage, record.id)
    expect(result.outcome).toBe('system_error')
    expect(result.stdout).toBe('')
    expect(result.stderr).toBe('')
    expect(result.tests).toHaveLength(7)
    expect(result.tests.every((test) => !test.passed)).toBe(true)
    expect(JSON.stringify(result)).not.toContain('python_data_tools_analysis')
  })

  it('keeps the trusted analyzer out of an ungraded run request', async () => {
    const storage = new MemoryStorage()
    const sandbox = trustedSandbox(pythonDataToolsAnalysis(), 'Practice output')
    sandbox.exec.mockImplementationOnce(async () => ({
      success: true,
      stdout: supervisorResult('completed', 'Practice output'),
    }))
    sandboxMocks.getSandbox.mockReturnValue(sandbox)
    const record = queuedPythonDataToolsRun('print("Practice output")', 'run')

    await coordinatorWith(storage).execute(record)

    expect(sandbox.exec).toHaveBeenCalledOnce()
    expect(sandbox.exec).toHaveBeenCalledWith('/opt/runner/supervisor.py python', { timeout: 20_000 })
    expect(JSON.stringify(storedResult(storage, record.id))).not.toContain(
      'python-data-tools-supply-tracker-v1',
    )
  })
})
