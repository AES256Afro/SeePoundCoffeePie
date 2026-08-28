import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { javaPicnicProjectServerAssessment } from './data/java-picnic-project.server'
import {
  findRunnerAssignment,
  runnerAssignmentRevision,
  type JavaAnalysis,
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
  language: 'java'
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

const javaAssignment = findRunnerAssignment('project-java-final')
if (!javaAssignment) throw new Error('Missing Java test runner assignment.')
const javaAssignmentRevision = await runnerAssignmentRevision(javaAssignment)

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

function emptyJavaAnalysis(): JavaAnalysis {
  return {
    version: 1,
    analyzed: false,
    parsed: false,
    straight_line: false,
    imports: [],
    class_signature: false,
    main_methods: [],
    static_methods: [],
    scanner_declarations: [],
    arrays: [],
    inputs: [],
    writes: [],
    conditionals: [],
    foreach_loops: [],
    calls: [],
  }
}

function referenceJavaAnalysis(): JavaAnalysis {
  return {
    version: 1,
    analyzed: true,
    parsed: true,
    straight_line: true,
    imports: ['java.util.Scanner'],
    class_signature: true,
    main_methods: [{ occurrence: 1, member: 2 }],
    static_methods: [{
      occurrence: 1,
      member: 1,
      name: 'printPicnic',
      return_type: 'void',
      parameters: [
        { position: 1, name: 'name', type: 'String' },
        { position: 2, name: 'guests', type: 'int' },
      ],
      output: { parts: ['Picnic: ', ' | Guests: ', ''], fields: ['name', 'guests'] },
    }],
    scanner_declarations: [{
      occurrence: 1,
      statement: 1,
      target: 'scanner',
      kind: 'scanner_system_in',
    }],
    arrays: [{
      occurrence: 1,
      statement: 2,
      target: 'supplies',
      element_type: 'String',
      values: ['Blankets', 'Cups', 'Napkins'],
    }],
    inputs: [
      {
        occurrence: 1,
        statement: 4,
        target: 'guestName',
        kind: 'scanner_next_line',
        receiver: 'scanner',
      },
      {
        occurrence: 2,
        statement: 6,
        target: 'guestCount',
        kind: 'integer_parse_scanner_next_line',
        receiver: 'scanner',
      },
    ],
    writes: [
      { occurrence: 1, statement: 3, text: 'What is your name?' },
      { occurrence: 2, statement: 5, text: 'How many guests are coming?' },
    ],
    conditionals: [{
      occurrence: 1,
      statement: 7,
      left: 'guestCount',
      operator: '>=',
      right: 8,
      when_true: 'Table: Large',
      when_false: 'Table: Small',
    }],
    foreach_loops: [{
      occurrence: 1,
      statement: 8,
      element_type: 'String',
      target: 'supply',
      collection: 'supplies',
      output: { parts: ['Supply: ', ''], fields: ['supply'] },
    }],
    calls: [{
      occurrence: 1,
      statement: 9,
      target: 'printPicnic',
      arguments: ['guestName', 'guestCount'],
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
    ...(analysis === undefined ? {} : { java_analysis: analysis }),
  })
}

function queuedRun(source: string, purpose: RunnerPurpose): TestQueuedRun {
  return {
    id: 'javaprojectrunnercase0000000001',
    ownerId: 'owner-identifier-that-is-long-enough',
    ipHash: 'ip-hash-that-is-long-enough',
    exerciseId: 'project-java-final',
    assignmentRevision: javaAssignmentRevision,
    language: 'java',
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

describe('trusted Java project analysis coordination', () => {
  it('requests compiler-tree facts only for the first official case and passes all checks', async () => {
    const storage = new MemoryStorage()
    const files = new Map<string, string>()
    const sandbox = {
      writeFile: vi.fn(async (path: string, value: string) => files.set(path, value)),
      exec: vi.fn(async (command: string) => {
        const stdin = files.get('/workspace/stdin.txt') ?? ''
        const testCase = javaPicnicProjectServerAssessment.testCases.find((candidate) => (
          candidate.stdin === stdin
        ))
        const analysis = command.endsWith(' --project-analysis')
          ? referenceJavaAnalysis()
          : emptyJavaAnalysis()
        return {
          success: true,
          stdout: supervisorResult('completed', testCase?.expectedStdout ?? 'wrong case', analysis),
        }
      }),
      destroy: vi.fn(async () => undefined),
    }
    sandboxMocks.getSandbox.mockReturnValue(sandbox)
    const record = queuedRun(javaPicnicProjectServerAssessment.referenceSolution, 'check')

    await coordinatorWith(storage).execute(record)

    expect(sandbox.exec.mock.calls.map(([command]) => command)).toEqual([
      '/opt/runner/supervisor.py java --project-analysis',
      '/opt/runner/supervisor.py java',
      '/opt/runner/supervisor.py java',
      '/opt/runner/supervisor.py java',
    ])
    expect(sandboxMocks.getSandbox).toHaveBeenCalledTimes(4)
    expect(sandbox.destroy).toHaveBeenCalledTimes(4)
    const result = storedResult(storage, record.id)
    expect(result.outcome).toBe('completed')
    expect(result.tests).toHaveLength(13)
    expect(result.tests.every((test) => test.passed)).toBe(true)
    expect(result.stdout).toBe(javaPicnicProjectServerAssessment.testCases[0].expectedStdout)
    expect(JSON.stringify(result)).not.toMatch(/java_analysis|static_methods|Maren Holt|Ivo Chen|Tess Alvarez/u)
  })

  it('uses a non-analyzed Java envelope for an ordinary practice run', async () => {
    const storage = new MemoryStorage()
    const sandbox = {
      writeFile: vi.fn(async () => undefined),
      exec: vi.fn(async () => ({
        success: true,
        stdout: supervisorResult('completed', 'Practice output', emptyJavaAnalysis()),
      })),
      destroy: vi.fn(async () => undefined),
    }
    sandboxMocks.getSandbox.mockReturnValue(sandbox)
    const record = queuedRun('public class Main {}', 'run')

    await coordinatorWith(storage).execute(record)

    expect(sandbox.exec).toHaveBeenCalledWith('/opt/runner/supervisor.py java', { timeout: 20_000 })
    const result = storedResult(storage, record.id)
    expect(result.outcome).toBe('completed')
    expect(result.stdout).toBe('Practice output')
    expect(result.tests).toEqual([])
    expect(JSON.stringify(result)).not.toContain('java_analysis')
  })

  it.each([
    ['missing', undefined],
    ['not analyzed when requested', emptyJavaAnalysis()],
    ['wrong version', { ...referenceJavaAnalysis(), version: 2 }],
    ['unknown root field', { ...referenceJavaAnalysis(), unexpected: true }],
    ['nonsequential write occurrence', {
      ...referenceJavaAnalysis(),
      writes: [{ occurrence: 2, statement: 3, text: 'What is your name?' }],
    }],
    ['facts in a non-analyzed envelope', {
      ...emptyJavaAnalysis(),
      imports: ['java.util.Scanner'],
    }],
    ['parsed without a straight-line frame', {
      ...emptyJavaAnalysis(),
      analyzed: true,
      parsed: true,
    }],
    ['parsed facts without a straight-line frame', {
      ...referenceJavaAnalysis(),
      straight_line: false,
    }],
    ['an incomplete straight-line frame', {
      ...referenceJavaAnalysis(),
      calls: [],
    }],
    ['invalid output cardinality', {
      ...referenceJavaAnalysis(),
      static_methods: [{
        ...referenceJavaAnalysis().static_methods[0],
        output: { parts: ['Picnic: '], fields: ['name', 'guests'] },
      }],
    }],
  ])('fails closed when requested Java analysis is %s', async (_name, analysis) => {
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
    const record = queuedRun('public class Main {}', 'check')

    await coordinatorWith(storage).execute(record)

    const result = storedResult(storage, record.id)
    expect(sandbox.exec).toHaveBeenCalledOnce()
    expect(result.outcome).toBe('system_error')
    expect(result.tests).toHaveLength(13)
    expect(result.tests.every((test) => !test.passed)).toBe(true)
    expect(JSON.stringify(result)).not.toContain('java_analysis')
  })

  it('keeps an analyzed but unparsed Java envelope as a compiler failure', async () => {
    const storage = new MemoryStorage()
    const analysis = { ...emptyJavaAnalysis(), analyzed: true }
    const sandbox = {
      writeFile: vi.fn(async () => undefined),
      exec: vi.fn(async () => ({
        success: true,
        stdout: supervisorResult('compile_error', '', analysis, "';' expected"),
      })),
      destroy: vi.fn(async () => undefined),
    }
    sandboxMocks.getSandbox.mockReturnValue(sandbox)
    const record = queuedRun('public class Main {', 'check')

    await coordinatorWith(storage).execute(record)

    const result = storedResult(storage, record.id)
    expect(result.outcome).toBe('compile_error')
    expect(result.tests).toHaveLength(13)
    expect(result.tests.every((test) => !test.passed)).toBe(true)
    expect(result.stderr).toContain("';' expected")
  })
})
