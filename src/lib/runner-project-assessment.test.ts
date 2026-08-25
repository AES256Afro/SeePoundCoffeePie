import { describe, expect, it } from 'vitest'
import { pythonInteractiveProject } from '../data/python-interactive-project'
import { pythonInteractiveProjectServerAssessment } from '../data/python-interactive-project.server'
import {
  aggregateRunnerDurationMs,
  evaluateProjectStructuralChecks,
  evaluateProjectRunnerAssignment,
  findRunnerAssignment,
  runnerInputCases,
} from './runner-assignments'

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
      `print(${JSON.stringify(visibleOutput)})`,
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
      pythonInteractiveProjectServerAssessment.referenceSolution,
    )

    expect(evaluation.tests).toHaveLength(10)
    expect(evaluation.tests.slice(0, 4).every((test) => test.passed)).toBe(true)
    expect(evaluation.tests.slice(4).every((test) => test.visibility === 'hidden' && test.passed)).toBe(true)
    expect(evaluation.tests.every((test) => test.passed)).toBe(true)
  })

  it('ignores required-looking code in comments, strings, and indented unreachable suites', () => {
    const requiredLookingText = [
      '# price_per_cup = 3',
      '# name = input("What is your name?")',
      '# cups_text = input("How many cups?")',
      '# cups = int(cups_text)',
      '# total = cups * price_per_cup',
      '# print(f"{name}, {cups}, {total}")',
      'decoy = \'name = input("unused") cups = int(cups_text) total = cups * price_per_cup\'',
      'if False:',
      '    price_per_cup = 3',
      '    name = input("unused")',
      '    cups_text = input("unused")',
      '    cups = int(cups_text)',
      '    total = cups * price_per_cup',
      '    print(f"{name}, {cups}, {total}")',
      'if False: price_per_cup = 3',
      'if False: name = input("unused")',
      'if False: cups_text = input("unused")',
      'if False: cups = int(cups_text)',
      'if False: total = cups * price_per_cup',
      'if False: print(f"{name}, {cups}, {total}")',
    ].join('\n')

    const results = evaluateProjectStructuralChecks(
      pythonInteractiveProjectServerAssessment,
      requiredLookingText,
    )

    expect(results).toHaveLength(6)
    expect(results.every((check) => !check.passed)).toBe(true)
  })

  it('rejects the exact one-line unreachable-suite bypass against passing behavior cases', () => {
    const source = [
      'if False: price_per_cup = 3',
      'if False: name = input("unused")',
      'if False: cups_text = input("unused")',
      'if False: cups = int(cups_text)',
      'if False: total = cups * price_per_cup',
      'if False: print(f"{name}, {cups}, {total}")',
      'print("Behavior is supplied by aliases in this regression.")',
    ].join('\n')
    const executions = pythonInteractiveProjectServerAssessment.testCases.map((testCase) => ({
      outcome: 'completed' as const,
      stdout: testCase.expectedStdout,
    }))
    const evaluation = evaluateProjectRunnerAssignment(finalAssignment(), executions, source)

    expect(evaluation.tests.slice(0, 4).every((test) => test.passed)).toBe(true)
    expect(evaluation.tests.slice(4).every((test) => !test.passed)).toBe(true)
    expect(evaluation.tests.every((test) => test.passed)).toBe(false)
  })

  it('does not serialize hidden inputs, hidden outputs, or the reference solution', () => {
    const executions = pythonInteractiveProjectServerAssessment.testCases.map((testCase) => ({
      outcome: 'completed' as const,
      stdout: testCase.expectedStdout,
    }))
    const evaluation = evaluateProjectRunnerAssignment(
      finalAssignment(),
      executions,
      pythonInteractiveProjectServerAssessment.referenceSolution,
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
