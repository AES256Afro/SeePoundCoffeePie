import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cppCollectionsRecordsServerAssessment } from './data/cpp-collections-records.server'
import {
  runnerAssignmentRevision,
  type CppAnalysis,
  type CppCollectionsAnalysis,
  type RunnerAssignment,
} from './lib/runner-assignments'
import type { RunnerResult } from './lib/runner-contract'

const mocks = vi.hoisted(() => ({
  getSandbox: vi.fn(),
  assignment: null as RunnerAssignment | null,
}))

vi.mock('@cloudflare/sandbox', () => ({
  Sandbox: class {},
  getSandbox: mocks.getSandbox,
}))

vi.mock('./lib/runner-assignments', async (importOriginal) => {
  const original = await importOriginal<typeof import('./lib/runner-assignments')>()
  return {
    ...original,
    findRunnerAssignment: (exerciseId: string) => (
      exerciseId === 'private-cpp-collections-assessment'
        ? mocks.assignment ?? undefined
        : original.findRunnerAssignment(exerciseId)
    ),
  }
})

import { RunnerCoordinator } from './runner-coordinator'

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

function assignment(): RunnerAssignment {
  return {
    exerciseId: 'private-cpp-collections-assessment',
    language: 'cpp',
    kind: 'academy',
    expectedOutput: cppCollectionsRecordsServerAssessment.testCases[0].expectedStdout,
    assessment: cppCollectionsRecordsServerAssessment,
    exercise: {
      id: 'private-cpp-collections-assessment',
      conceptId: 'private-cpp-collections-assessment',
      eyebrow: 'Private runner test',
      title: 'Private runner test',
      explanation: 'Server-only test assignment.',
      analogy: 'Server-only test assignment.',
      type: 'code',
      prompt: 'Complete the private test.',
      starterCode: 'int main() { return 0; }',
      focus: 'Complete the private test.',
      codeGuide: [],
      checks: [],
      output: cppCollectionsRecordsServerAssessment.testCases[0].expectedStdout,
      hint: 'Private test.',
      recap: 'Private test.',
      xp: 0,
    },
  }
}

const privateAssignmentRevision = await runnerAssignmentRevision(assignment())

function analysis(overrides: Partial<CppCollectionsAnalysis> = {}): CppCollectionsAnalysis {
  return {
    version: 1,
    profile: 'cpp-collections-records-workshop-report-v1',
    analyzed: true,
    parsed: true,
    authored_frame: true,
    part_record: true,
    restock: true,
    total_units: true,
    low_stock: true,
    supplied_harness: true,
    ...overrides,
  }
}

function ordinaryCppAnalysis(): CppAnalysis {
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

function supervisorResult(outcome: RunnerResult['outcome'], stdout: string, stderr = ''): string {
  return JSON.stringify({
    outcome,
    stdout,
    stderr,
    exit_code: outcome === 'completed' ? 0 : 1,
    duration_ms: 4,
    truncated: false,
    limit: null,
    cpp_analysis: ordinaryCppAnalysis(),
  })
}

function record() {
  return {
    id: 'cppcollectionsrunnercase000001',
    ownerId: 'owner-identifier-that-is-long-enough',
    ipHash: 'ip-hash-that-is-long-enough',
    exerciseId: 'private-cpp-collections-assessment',
    assignmentRevision: privateAssignmentRevision,
    language: 'cpp' as const,
    source: 'private source',
    stdin: 'caller input must be ignored',
    purpose: 'check' as const,
    status: 'running' as const,
    createdAt: 1,
    startedAt: 2,
    attempts: 1,
  }
}

function coordinator(storage: MemoryStorage) {
  return new RunnerCoordinator(
    { storage } as never,
    { RUNNER_PYTHON: {}, RUNNER_CPP: {}, RUNNER_CSHARP: {}, RUNNER_JAVA: {} } as never,
  ) as unknown as { execute(value: ReturnType<typeof record>): Promise<void> }
}

function storedResult(storage: MemoryStorage, runId: string): RunnerResult {
  const completed = storage.data.get(`run:${runId}`) as { result: Omit<RunnerResult, 'stdout' | 'stderr'> }
  return {
    ...completed.result,
    stdout: storage.data.get(`output:${runId}`) as string ?? '',
    stderr: storage.data.get(`error:${runId}`) as string ?? '',
  }
}

beforeEach(() => {
  mocks.getSandbox.mockReset()
  mocks.assignment = assignment()
  vi.spyOn(console, 'info').mockImplementation(() => undefined)
  vi.spyOn(console, 'error').mockImplementation(() => undefined)
})

afterEach(() => {
  mocks.assignment = null
  vi.restoreAllMocks()
})

describe('private C++ Workshop Stock Report coordination', () => {
  it('runs the fixed root-only analyzer before ordinary C++ execution and keeps facts private', async () => {
    const storage = new MemoryStorage()
    const sandbox = {
      writeFile: vi.fn(async () => undefined),
      exec: vi.fn(async (command: string) => ({
        success: true,
        stdout: command.includes('CppCollectionsAnalyzer.py')
          ? JSON.stringify(analysis())
          : supervisorResult('completed', cppCollectionsRecordsServerAssessment.testCases[0].expectedStdout),
      })),
      destroy: vi.fn(async () => undefined),
    }
    mocks.getSandbox.mockReturnValue(sandbox)
    const queued = record()

    await coordinator(storage).execute(queued)

    expect(sandbox.exec.mock.calls.map(([command]) => command)).toEqual([
      '/usr/bin/python3 -I -B /opt/runner/CppCollectionsAnalyzer.py /workspace/source.txt',
      '/opt/runner/supervisor.py cpp',
    ])
    const result = storedResult(storage, queued.id)
    expect(result.outcome).toBe('completed')
    expect(result.tests).toHaveLength(7)
    expect(result.tests.every((test) => test.passed)).toBe(true)
    expect(JSON.stringify(result)).not.toMatch(/cpp-collections-records-workshop-report-v1|authored_frame|part_record|supplied_harness/u)
  })

  it.each([
    ['missing', ''],
    ['malformed JSON', '{'],
    ['extra key', JSON.stringify({ ...analysis(), unexpected: true })],
    ['wrong profile', JSON.stringify({ ...analysis(), profile: 'wrong-profile' })],
    ['not analyzed', JSON.stringify(analysis({ analyzed: false, parsed: false }))],
  ])('fails as a system error when the analyzer envelope is %s', async (_label, envelope) => {
    const storage = new MemoryStorage()
    const sandbox = {
      writeFile: vi.fn(async () => undefined),
      exec: vi.fn(async () => ({ success: true, stdout: envelope })),
      destroy: vi.fn(async () => undefined),
    }
    mocks.getSandbox.mockReturnValue(sandbox)
    const queued = record()

    await coordinator(storage).execute(queued)

    const result = storedResult(storage, queued.id)
    expect(sandbox.exec).toHaveBeenCalledOnce()
    expect(result.outcome).toBe('system_error')
    expect(result.tests).toHaveLength(7)
    expect(result.tests.every((test) => !test.passed)).toBe(true)
    expect(JSON.stringify(result)).not.toContain('cpp-collections-records-workshop-report-v1')
  })

  it('lets parsed false reach the compiler so the learner receives its syntax diagnostic', async () => {
    const storage = new MemoryStorage()
    const sandbox = {
      writeFile: vi.fn(async () => undefined),
      exec: vi.fn(async (command: string) => ({
        success: true,
        stdout: command.includes('CppCollectionsAnalyzer.py')
          ? JSON.stringify(analysis({ parsed: false, authored_frame: false, part_record: false, restock: false, total_units: false, low_stock: false, supplied_harness: false }))
          : supervisorResult('compile_error', '', 'expected a closing brace'),
      })),
      destroy: vi.fn(async () => undefined),
    }
    mocks.getSandbox.mockReturnValue(sandbox)
    const queued = record()

    await coordinator(storage).execute(queued)

    const result = storedResult(storage, queued.id)
    expect(result.outcome).toBe('compile_error')
    expect(result.stderr).toContain('expected a closing brace')
    expect(result.tests.every((test) => !test.passed)).toBe(true)
  })
})
