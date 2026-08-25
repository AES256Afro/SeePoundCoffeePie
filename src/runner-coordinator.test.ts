import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { pythonInteractiveProjectServerAssessment } from './data/python-interactive-project.server'
import type { PythonAnalysis } from './lib/runner-assignments'
import type { RunnerPurpose, RunnerResult } from './lib/runner-contract'

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
  language: 'python'
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

  async put(keyOrEntries: string | Record<string, unknown>, value?: unknown): Promise<void> {
    if (typeof keyOrEntries === 'string') {
      this.data.set(keyOrEntries, value)
      return
    }
    for (const [key, entry] of Object.entries(keyOrEntries)) this.data.set(key, entry)
  }
}

function supervisorResult(
  outcome: RunnerResult['outcome'],
  stdout: string,
  stderr = '',
  durationMs = 5,
  pythonAnalysis: unknown = emptyPythonAnalysis(),
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

function queuedRun(source: string, purpose: RunnerPurpose, stdin = ''): TestQueuedRun {
  return {
    id: 'projectrunnercase000000000001',
    ownerId: 'owner-identifier-that-is-long-enough',
    ipHash: 'ip-hash-that-is-long-enough',
    exerciseId: 'project-py-final',
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

function coordinatorWith(storage: MemoryStorage): ExecutableCoordinator {
  const coordinator = new RunnerCoordinator(
    { storage } as never,
    {
      RUNNER_PYTHON: {},
      RUNNER_CPP: {},
      RUNNER_CSHARP: {},
      RUNNER_JAVA: {},
    } as never,
  )
  return coordinator as unknown as ExecutableCoordinator
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
