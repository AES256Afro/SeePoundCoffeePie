import { describe, expect, it } from 'vitest'
import { pythonDataToolsServerAssessment } from '../data/python-data-tools.server'
import {
  evaluateProtectedRunnerAssignment,
  evaluateProjectStructuralChecks,
  findRunnerAssignment,
  runnerInputCases,
  type PythonDataToolsAnalysis,
} from './runner-assignments'

const expectedOutput = 'Products: 2\nTotal units: 17\nRestock: markers'

function assignment() {
  const value = findRunnerAssignment('pydata6-supply-tracker')
  if (!value) throw new Error('Supply Tracker needs a runner assignment.')
  return value
}

function analysis(overrides: Partial<PythonDataToolsAnalysis> = {}): PythonDataToolsAnalysis {
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

describe('Python Data Tools runner assessment', () => {
  it('registers the final lesson as a protected academy assignment', () => {
    expect(assignment()).toMatchObject({
      exerciseId: 'pydata6-supply-tracker',
      language: 'python',
      kind: 'academy',
      expectedOutput,
      assessment: pythonDataToolsServerAssessment,
    })
  })

  it('uses server-owned input only for a check and caller input for a run', () => {
    expect(runnerInputCases(assignment(), 'check', 'ignored')).toEqual([''])
    expect(runnerInputCases(assignment(), 'run', 'learner practice\n')).toEqual(['learner practice\n'])
  })

  it('passes one visible behavior check and all six trusted structural checks', () => {
    const evaluation = evaluateProtectedRunnerAssignment(
      assignment(),
      [{ outcome: 'completed', stdout: `${expectedOutput}\n` }],
      analysis(),
    )

    expect(evaluation.visibleStdout).toBe(`${expectedOutput}\n`)
    expect(evaluation.tests).toHaveLength(7)
    expect(evaluation.tests[0]).toMatchObject({
      name: 'Visible lesson example',
      visibility: 'visible',
      passed: true,
    })
    expect(evaluation.tests.slice(1).every((test) => (
      test.name.startsWith('Required lesson code')
      && test.visibility === 'hidden'
      && test.passed
    ))).toBe(true)
  })

  it('rejects hardcoded visible output when protected structure is absent', () => {
    const evaluation = evaluateProtectedRunnerAssignment(
      assignment(),
      [{ outcome: 'completed', stdout: expectedOutput }],
      analysis({
        authored_frame: false,
        normalize_name: false,
        add_stock: false,
        total_stock: false,
        low_stock: false,
        harness: false,
      }),
    )

    expect(evaluation.tests[0]).toMatchObject({ passed: true })
    expect(evaluation.tests.slice(1).every((test) => !test.passed)).toBe(true)
    expect(evaluation.tests.every((test) => test.passed)).toBe(false)
  })

  it.each([
    ['missing', null],
    ['wrong profile', analysis({ profile: 'wrong-profile' as PythonDataToolsAnalysis['profile'] })],
    ['not analyzed', analysis({ analyzed: false, parsed: false })],
    ['not parsed', analysis({ parsed: false })],
  ])('fails all structural checks when trusted analysis is %s', (_label, trustedAnalysis) => {
    const results = evaluateProjectStructuralChecks(
      pythonDataToolsServerAssessment,
      trustedAnalysis,
    )

    expect(results).toHaveLength(6)
    expect(results.every((result) => !result.passed)).toBe(true)
  })

  it('maps every false trusted fact to exactly its own stated requirement', () => {
    const facts: Array<keyof Pick<
      PythonDataToolsAnalysis,
      'authored_frame' | 'normalize_name' | 'add_stock' | 'total_stock' | 'low_stock' | 'harness'
    >> = ['authored_frame', 'normalize_name', 'add_stock', 'total_stock', 'low_stock', 'harness']

    for (const [index, fact] of facts.entries()) {
      const results = evaluateProjectStructuralChecks(
        pythonDataToolsServerAssessment,
        analysis({ [fact]: false }),
      )
      expect(results.map((result) => result.passed)).toEqual(
        facts.map((_candidate, candidateIndex) => candidateIndex !== index),
      )
    }
  })
})
