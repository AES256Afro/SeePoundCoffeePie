import { describe, expect, it } from 'vitest'
import { pythonInteractiveProject } from '../data/python-interactive-project'
import { pythonInteractiveProjectServerAssessment } from '../data/python-interactive-project.server'
import {
  aggregateRunnerDurationMs,
  evaluateProjectStructuralChecks,
  evaluateProjectRunnerAssignment,
  findRunnerAssignment,
  runnerInputCases,
  type PythonAnalysis,
} from './runner-assignments'

function emptyPythonAnalysis(straightLine = true): PythonAnalysis {
  return {
    version: 1,
    parsed: true,
    straight_line: straightLine,
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
    print_fstrings: [
      { occurrence: 1, fields: ['name', 'cups', 'total'] },
    ],
  }
}

function finalAssignment() {
  const assignment = findRunnerAssignment('project-py-final')
  if (!assignment) throw new Error('The final Python project needs a runner assignment.')
  return assignment
}

describe('server-owned Python project assessment', () => {
  it('registers every editable project checkpoint with the runner', () => {
    const editableCheckpoints = pythonInteractiveProject.checkpoints.filter(({ exercise }) => (
      exercise.type === 'code' || exercise.type === 'bugfix'
    ))

    expect(editableCheckpoints).toHaveLength(10)
    for (const checkpoint of editableCheckpoints) {
      expect(findRunnerAssignment(checkpoint.exercise.id)).toMatchObject({
        exerciseId: checkpoint.exercise.id,
        language: 'python',
        kind: 'project',
      })
    }
  })

  it('uses caller input for practice runs and server input for official checks', () => {
    const inputCheckpoint = findRunnerAssignment('project-py-input')
    expect(inputCheckpoint).toBeDefined()
    expect(runnerInputCases(inputCheckpoint!, 'run', 'Chris\n')).toEqual(['Chris\n'])
    expect(runnerInputCases(inputCheckpoint!, 'check', 'Do not use this\n')).toEqual(['Avery\n'])

    const expectedOfficialInputs = pythonInteractiveProjectServerAssessment.testCases.map((testCase) => testCase.stdin)
    expect(runnerInputCases(finalAssignment(), 'check', 'Do not use this either\n')).toEqual(expectedOfficialInputs)
  })

  it('rejects hardcoded visible output when the hidden project inputs change', () => {
    const assignment = finalAssignment()
    const visibleOutput = pythonInteractiveProjectServerAssessment.testCases[0].expectedStdout
    const executions = pythonInteractiveProjectServerAssessment.testCases.map(() => ({
      outcome: 'completed' as const,
      stdout: visibleOutput,
    }))
    const evaluation = evaluateProjectRunnerAssignment(
      assignment,
      executions,
      emptyPythonAnalysis(),
    )
    const caseTests = evaluation.tests.slice(0, 4)
    const structuralTests = evaluation.tests.slice(4)

    expect(caseTests[0]).toMatchObject({ visibility: 'visible', passed: true })
    expect(caseTests.slice(1).every((test) => test.visibility === 'hidden' && !test.passed)).toBe(true)
    expect(structuralTests).toHaveLength(6)
    expect(structuralTests.every((test) => !test.passed)).toBe(true)
    expect(evaluation.tests.every((test) => test.passed)).toBe(false)
  })

  it('accepts the reference solution for all four cases and six code requirements', () => {
    const executions = pythonInteractiveProjectServerAssessment.testCases.map((testCase) => ({
      outcome: 'completed' as const,
      stdout: testCase.expectedStdout,
    }))
    const evaluation = evaluateProjectRunnerAssignment(
      finalAssignment(),
      executions,
      referencePythonAnalysis(),
    )

    expect(evaluation.tests).toHaveLength(10)
    expect(evaluation.tests.slice(0, 4).every((test) => test.passed)).toBe(true)
    expect(evaluation.tests.slice(4).every((test) => test.visibility === 'hidden' && test.passed)).toBe(true)
    expect(evaluation.tests.every((test) => test.passed)).toBe(true)
  })

  it('fails closed when parsing fails or the program is not straight-line code', () => {
    const results = evaluateProjectStructuralChecks(
      pythonInteractiveProjectServerAssessment,
      {
        ...referencePythonAnalysis(),
        straight_line: false,
      },
    )
    const parseFailure = evaluateProjectStructuralChecks(
      pythonInteractiveProjectServerAssessment,
      {
        version: 1,
        parsed: false,
        straight_line: false,
        assignments: [],
        print_fstrings: [],
      },
    )
    const missing = evaluateProjectStructuralChecks(
      pythonInteractiveProjectServerAssessment,
      null,
    )

    expect(results).toHaveLength(6)
    expect(results.every((check) => !check.passed)).toBe(true)
    expect(parseFailure.every((check) => !check.passed)).toBe(true)
    expect(missing.every((check) => !check.passed)).toBe(true)
  })

  it('rejects duplicate required assignments against passing behavior cases', () => {
    const executions = pythonInteractiveProjectServerAssessment.testCases.map((testCase) => ({
      outcome: 'completed' as const,
      stdout: testCase.expectedStdout,
    }))
    const analysis = referencePythonAnalysis()
    analysis.assignments.splice(1, 0,
      { target: 'price_per_cup', occurrence: 2, kind: 'integer', value: 3 },
    )
    const evaluation = evaluateProjectRunnerAssignment(finalAssignment(), executions, analysis)

    expect(evaluation.tests.slice(0, 4).every((test) => test.passed)).toBe(true)
    expect(evaluation.tests[4]).toMatchObject({ passed: false })
    expect(evaluation.tests.slice(5).every((test) => test.passed)).toBe(true)
    expect(evaluation.tests.every((test) => test.passed)).toBe(false)
  })

  it('requires exact assignment shapes and direct f-string fields', () => {
    const wrongShapes = referencePythonAnalysis()
    wrongShapes.assignments = [
      { target: 'price_per_cup', occurrence: 1, kind: 'integer', value: 3 },
      { target: 'name', occurrence: 1, kind: 'string' },
      { target: 'cups_text', occurrence: 1, kind: 'input' },
      { target: 'cups', occurrence: 1, kind: 'int_name', name: 'name' },
      { target: 'total', occurrence: 1, kind: 'multiply_names', names: ['cups', 'subtotal'] },
    ]
    wrongShapes.print_fstrings = [{ occurrence: 1, fields: ['name', 'cups'] }]

    expect(evaluateProjectStructuralChecks(
      pythonInteractiveProjectServerAssessment,
      wrongShapes,
    ).map((check) => check.passed)).toEqual([true, false, true, false, false, false])
  })

  it('does not serialize hidden inputs, hidden outputs, or the reference solution', () => {
    const executions = pythonInteractiveProjectServerAssessment.testCases.map((testCase) => ({
      outcome: 'completed' as const,
      stdout: testCase.expectedStdout,
    }))
    const evaluation = evaluateProjectRunnerAssignment(
      finalAssignment(),
      executions,
      referencePythonAnalysis(),
    )
    const serializedResult = JSON.stringify({
      stdout: evaluation.visibleStdout,
      tests: evaluation.tests,
    })

    expect(evaluation.visibleStdout).toBe(
      pythonInteractiveProjectServerAssessment.testCases[0].expectedStdout,
    )

    for (const hiddenCase of pythonInteractiveProjectServerAssessment.testCases.filter((testCase) => (
      testCase.visibility === 'hidden'
    ))) {
      expect(serializedResult).not.toContain(hiddenCase.stdin)
      expect(serializedResult).not.toContain(hiddenCase.expectedStdout)
      expect(serializedResult).not.toContain(hiddenCase.id)
      expect(serializedResult).not.toContain(hiddenCase.name)
      expect(serializedResult).not.toContain(hiddenCase.purpose)
    }
    expect(serializedResult).not.toMatch(/Morgan|Riley|Sam Lee|\$3\.|\$21\.|\$0\./u)
    expect(serializedResult).not.toContain(pythonInteractiveProjectServerAssessment.referenceSolution)
  })

  it('adds durations without accepting negative, infinite, or unsafe totals', () => {
    expect(aggregateRunnerDurationMs([1.4, -5, Number.NaN, Number.POSITIVE_INFINITY, 2.5])).toBe(4)
    expect(aggregateRunnerDurationMs([Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER])).toBe(Number.MAX_SAFE_INTEGER)
  })
})
