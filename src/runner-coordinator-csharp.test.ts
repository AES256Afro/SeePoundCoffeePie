import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { csharpWorkshopProjectServerAssessment } from './data/csharp-workshop-project.server'
import {
  findRunnerAssignment,
  runnerAssignmentRevision,
  type CsharpAnalysis,
} from './lib/runner-assignments'
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
  assignmentRevision: string
  language: 'csharp'
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

const csharpAssignment = findRunnerAssignment('project-csharp-final')
if (!csharpAssignment) throw new Error('Missing C# test runner assignment.')
const csharpAssignmentRevision = await runnerAssignmentRevision(csharpAssignment)

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

function emptyCsharpAnalysis(): CsharpAnalysis {
  return {
    version: 1,
    analyzed: false,
    parsed: false,
    straight_line: false,
    usings: [],
    local_functions: [],
    arrays: [],
    inputs: [],
    writes: [],
    conditionals: [],
    foreach_loops: [],
    calls: [],
  }
}

function referenceCsharpAnalysis(): CsharpAnalysis {
  return {
    version: 1,
    analyzed: true,
    parsed: true,
    straight_line: true,
    usings: ['System'],
    local_functions: [{
      occurrence: 1,
      statement: 1,
      name: 'PrintBadge',
      return_type: 'void',
      parameters: [
        { position: 1, name: 'name', type: 'string' },
        { position: 2, name: 'visits', type: 'int' },
      ],
      interpolation: {
        parts: ['Badge: ', ' | Visits: ', ''],
        fields: ['name', 'visits'],
      },
    }],
    arrays: [{
      occurrence: 1,
      statement: 2,
      target: 'areas',
      element_type: 'string',
      values: ['Studio', 'Lab', 'Library'],
    }],
    inputs: [
      {
        occurrence: 1,
        statement: 4,
        target: 'guestName',
        kind: 'read_line_coalesce_string',
        fallback: '',
      },
      {
        occurrence: 2,
        statement: 6,
        target: 'visitCount',
        kind: 'int_parse_read_line_coalesce_string',
        fallback: '0',
      },
    ],
    writes: [
      { occurrence: 1, statement: 3, text: 'What is your name?' },
      { occurrence: 2, statement: 5, text: 'How many visits have you completed?' },
    ],
    conditionals: [{
      occurrence: 1,
      statement: 7,
      left: 'visitCount',
      operator: '>=',
      right: 3,
      when_true: 'Access: Member',
      when_false: 'Access: Guest',
    }],
    foreach_loops: [{
      occurrence: 1,
      statement: 8,
      element_type: 'string',
      target: 'area',
      collection: 'areas',
      interpolation: { parts: ['Area: ', ''], fields: ['area'] },
    }],
    calls: [{
      occurrence: 1,
      statement: 9,
      target: 'PrintBadge',
      arguments: ['guestName', 'visitCount'],
    }],
  }
}

function supervisorResult(
  outcome: RunnerResult['outcome'],
  stdout: string,
  analysis: unknown,
  stderr = '',
) {
  return JSON.stringify({
    outcome,
    stdout,
    stderr,
    exit_code: outcome === 'completed' ? 0 : 1,
    duration_ms: 5,
    truncated: false,
    limit: null,
    ...(analysis === undefined ? {} : { csharp_analysis: analysis }),
  })
}

function queuedRun(source: string, purpose: RunnerPurpose): TestQueuedRun {
  return {
    id: 'csharpprojectrunnercase00000001',
    ownerId: 'owner-identifier-that-is-long-enough',
    ipHash: 'ip-hash-that-is-long-enough',
    exerciseId: 'project-csharp-final',
    assignmentRevision: csharpAssignmentRevision,
    language: 'csharp',
    source,
    stdin: '',
    purpose,
    status: 'running',
    createdAt: 1,
    startedAt: 2,
    attempts: 1,
  }
}

function coordinatorWith(storage: MemoryStorage): ExecutableCoordinator {
  return new RunnerCoordinator(
    { storage } as never,
    {
      RUNNER_PYTHON: {},
      RUNNER_CPP: {},
      RUNNER_CSHARP: {},
      RUNNER_JAVA: {},
    } as never,
  ) as unknown as ExecutableCoordinator
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

describe('trusted C# project analysis coordination', () => {
  it('requests Roslyn facts only for the first official case and passes all checks', async () => {
    const storage = new MemoryStorage()
    const files = new Map<string, string>()
    const sandbox = {
      writeFile: vi.fn(async (path: string, value: string) => files.set(path, value)),
      exec: vi.fn(async (command: string) => {
        const stdin = files.get('/workspace/stdin.txt') ?? ''
        const testCase = csharpWorkshopProjectServerAssessment.testCases.find((candidate) => (
          candidate.stdin === stdin
        ))
        const analysis = command.endsWith(' --project-analysis')
          ? referenceCsharpAnalysis()
          : emptyCsharpAnalysis()
        return {
          success: true,
          stdout: supervisorResult('completed', testCase?.expectedStdout ?? 'wrong case', analysis),
        }
      }),
      destroy: vi.fn(async () => undefined),
    }
    sandboxMocks.getSandbox.mockReturnValue(sandbox)
    const record = queuedRun(csharpWorkshopProjectServerAssessment.referenceSolution, 'check')

    await coordinatorWith(storage).execute(record)

    expect(sandbox.exec.mock.calls.map(([command]) => command)).toEqual([
      '/opt/runner/supervisor.py csharp --project-analysis',
      '/opt/runner/supervisor.py csharp',
      '/opt/runner/supervisor.py csharp',
      '/opt/runner/supervisor.py csharp',
    ])
    expect(sandboxMocks.getSandbox).toHaveBeenCalledTimes(4)
    expect(sandbox.destroy).toHaveBeenCalledTimes(4)
    const result = storedResult(storage, record.id)
    expect(result.outcome).toBe('completed')
    expect(result.tests).toHaveLength(12)
    expect(result.tests.every((test) => test.passed)).toBe(true)
    expect(result.stdout).toBe(csharpWorkshopProjectServerAssessment.testCases[0].expectedStdout)
    expect(JSON.stringify(result)).not.toMatch(/csharp_analysis|local_functions|Maren Holt|Ivo Chen|Tess Alvarez/u)
  })

  it('uses a non-analyzed C# envelope for an ordinary practice run', async () => {
    const storage = new MemoryStorage()
    const sandbox = {
      writeFile: vi.fn(async () => undefined),
      exec: vi.fn(async () => ({
        success: true,
        stdout: supervisorResult('completed', 'Practice output', emptyCsharpAnalysis()),
      })),
      destroy: vi.fn(async () => undefined),
    }
    sandboxMocks.getSandbox.mockReturnValue(sandbox)
    const record = queuedRun('Console.WriteLine("Practice output");', 'run')

    await coordinatorWith(storage).execute(record)

    expect(sandbox.exec).toHaveBeenCalledWith('/opt/runner/supervisor.py csharp', { timeout: 20_000 })
    const result = storedResult(storage, record.id)
    expect(result.outcome).toBe('completed')
    expect(result.stdout).toBe('Practice output')
    expect(result.tests).toEqual([])
    expect(JSON.stringify(result)).not.toContain('csharp_analysis')
  })

  it.each([
    ['missing', undefined],
    ['not analyzed when requested', emptyCsharpAnalysis()],
    ['wrong version', { ...referenceCsharpAnalysis(), version: 2 }],
    ['unknown root field', { ...referenceCsharpAnalysis(), unexpected: true }],
    ['nonsequential write occurrence', {
      ...referenceCsharpAnalysis(),
      writes: [{ occurrence: 2, statement: 3, text: 'What is your name?' }],
    }],
    ['facts in a non-analyzed envelope', {
      ...emptyCsharpAnalysis(),
      usings: ['System'],
    }],
    ['invalid interpolation cardinality', {
      ...referenceCsharpAnalysis(),
      local_functions: [{
        ...referenceCsharpAnalysis().local_functions[0],
        interpolation: { parts: ['Badge: '], fields: ['name', 'visits'] },
      }],
    }],
  ])('fails closed when requested C# analysis is %s', async (_name, analysis) => {
    const storage = new MemoryStorage()
    const sandbox = {
      writeFile: vi.fn(async () => undefined),
      exec: vi.fn(async () => ({
        success: true,
        stdout: supervisorResult('completed', 'Behavior output', analysis),
      })),
      destroy: vi.fn(async () => undefined),
    }
    sandboxMocks.getSandbox.mockReturnValue(sandbox)
    const record = queuedRun('Console.WriteLine("Behavior output");', 'check')

    await coordinatorWith(storage).execute(record)

    const result = storedResult(storage, record.id)
    expect(sandbox.exec).toHaveBeenCalledOnce()
    expect(result.outcome).toBe('system_error')
    expect(result.tests).toHaveLength(12)
    expect(result.tests.every((test) => !test.passed)).toBe(true)
    expect(JSON.stringify(result)).not.toContain('csharp_analysis')
  })

  it('keeps an analyzed but unparsed C# envelope as a compiler failure', async () => {
    const storage = new MemoryStorage()
    const analysis = { ...emptyCsharpAnalysis(), analyzed: true }
    const sandbox = {
      writeFile: vi.fn(async () => undefined),
      exec: vi.fn(async () => ({
        success: true,
        stdout: supervisorResult('compile_error', '', analysis, 'expected a semicolon'),
      })),
      destroy: vi.fn(async () => undefined),
    }
    sandboxMocks.getSandbox.mockReturnValue(sandbox)
    const record = queuedRun('using System', 'check')

    await coordinatorWith(storage).execute(record)

    const result = storedResult(storage, record.id)
    expect(result.outcome).toBe('compile_error')
    expect(result.tests).toHaveLength(12)
    expect(result.tests.every((test) => !test.passed)).toBe(true)
    expect(result.stderr).toContain('expected a semicolon')
  })
})
