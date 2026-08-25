import { describe, expect, it } from 'vitest'
import { cppCompiledProject } from '../data/cpp-compiled-project'
import { cppCompiledProjectServerAssessment } from '../data/cpp-compiled-project.server'
import { pythonInteractiveProject } from '../data/python-interactive-project'
import { pythonInteractiveProjectServerAssessment } from '../data/python-interactive-project.server'
import {
  aggregateRunnerDurationMs,
  evaluateProjectStructuralChecks,
  evaluateProjectRunnerAssignment,
  findRunnerAssignment,
  runnerInputCases,
  type CppAnalysis,
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

describe('server-owned C++ project assessment', () => {
  function finalCppAssignment() {
    const assignment = findRunnerAssignment('project-cpp-final')
    if (!assignment) throw new Error('The final C++ project needs a runner assignment.')
    return assignment
  }

  it('registers every editable C++ project checkpoint with the runner', () => {
    const editableCheckpoints = cppCompiledProject.checkpoints.filter(({ exercise }) => (
      exercise.type === 'code' || exercise.type === 'bugfix'
    ))

    expect(editableCheckpoints).toHaveLength(10)
    for (const checkpoint of editableCheckpoints) {
      expect(findRunnerAssignment(checkpoint.exercise.id)).toMatchObject({
        exerciseId: checkpoint.exercise.id,
        language: 'cpp',
        kind: 'project',
      })
    }
    expect(finalCppAssignment().projectAssessment).toBe(cppCompiledProjectServerAssessment)
  })

  it('uses visible practice input before switching to four server-owned final cases', () => {
    const inputCheckpoint = findRunnerAssignment('project-cpp-line-input')
    expect(inputCheckpoint).toBeDefined()
    expect(runnerInputCases(inputCheckpoint!, 'run', 'Chris\n')).toEqual(['Chris\n'])
    expect(runnerInputCases(inputCheckpoint!, 'check', 'Do not use this\n')).toEqual(['Alex Kim\n'])

    const officialInputs = cppCompiledProjectServerAssessment.testCases.map((testCase) => testCase.stdin)
    expect(runnerInputCases(finalCppAssignment(), 'check', 'Do not use this either\n')).toEqual(officialInputs)
  })

  it('accepts all behavior cases and all eight trusted C++ structure facts', () => {
    const executions = cppCompiledProjectServerAssessment.testCases.map((testCase) => ({
      outcome: 'completed' as const,
      stdout: testCase.expectedStdout,
    }))
    const evaluation = evaluateProjectRunnerAssignment(
      finalCppAssignment(),
      executions,
      referenceCppAnalysis(),
    )

    expect(evaluation.tests).toHaveLength(12)
    expect(evaluation.tests.every((test) => test.passed)).toBe(true)
    expect(evaluation.visibleStdout).toBe(cppCompiledProjectServerAssessment.testCases[0].expectedStdout)
  })

  it('keeps behavior separate from the six project-specific names and operations', () => {
    const aliasAnalysis = referenceCppAnalysis()
    aliasAnalysis.declarations = [
      { target: 'rule', occurrence: 1, statement: 1, kind: 'integer', value: 5 },
      { target: 'person', occurrence: 1, statement: 4, kind: 'string' },
      { target: 'amount', occurrence: 1, statement: 7, kind: 'integer', value: 0 },
      {
        target: 'score',
        occurrence: 1,
        statement: 9,
        kind: 'multiply_names',
        names: ['amount', 'rule'],
      },
    ]
    aliasAnalysis.inputs = [
      { occurrence: 1, statement: 5, kind: 'getline_cin', target: 'person' },
      { occurrence: 2, statement: 8, kind: 'cin_extract', target: 'amount' },
    ]
    aliasAnalysis.cout_chains[3] = {
      occurrence: 4,
      statement: 10,
      fields: ['person', 'amount', 'score'],
    }
    const executions = cppCompiledProjectServerAssessment.testCases.map((testCase) => ({
      outcome: 'completed' as const,
      stdout: testCase.expectedStdout,
    }))
    const evaluation = evaluateProjectRunnerAssignment(
      finalCppAssignment(),
      executions,
      aliasAnalysis,
    )

    expect(evaluation.tests).toHaveLength(12)
    expect(evaluation.tests.slice(0, 4).every((test) => test.passed)).toBe(true)
    expect(evaluation.tests.slice(4, 6).every((test) => test.passed)).toBe(true)
    expect(evaluation.tests.slice(6).every((test) => !test.passed)).toBe(true)
  })

  it('fails closed when C++ analysis is absent, not analyzed, unparsed, or not straight line', () => {
    const unavailable: CppAnalysis = {
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
    const analyses: Array<CppAnalysis | null> = [
      null,
      unavailable,
      { ...referenceCppAnalysis(), parsed: false, straight_line: false },
      { ...referenceCppAnalysis(), straight_line: false },
    ]

    for (const analysis of analyses) {
      const results = evaluateProjectStructuralChecks(cppCompiledProjectServerAssessment, analysis)
      expect(results).toHaveLength(8)
      expect(results.every((check) => !check.passed)).toBe(true)
    }
  })

  it('evaluates each of the eight C++ structural variants from exact facts', () => {
    const mutations: Array<(analysis: CppAnalysis) => void> = [
      (analysis) => { analysis.headers = ['iostream'] },
      (analysis) => { analysis.returns_zero = false },
      (analysis) => {
        analysis.declarations[0] = {
          target: 'points_per_detail', occurrence: 1, statement: 1, kind: 'integer', value: 4,
        }
      },
      (analysis) => {
        analysis.declarations[1] = {
          target: 'observer_name', occurrence: 1, statement: 4, kind: 'unsupported',
        }
      },
      (analysis) => {
        analysis.inputs[0] = {
          occurrence: 1, statement: 5, kind: 'cin_extract', target: 'observer_name',
        }
      },
      (analysis) => {
        analysis.inputs[1] = {
          occurrence: 2, statement: 8, kind: 'getline_cin', target: 'details',
        }
      },
      (analysis) => {
        analysis.declarations[3] = {
          target: 'focus_points',
          occurrence: 1,
          statement: 9,
          kind: 'multiply_names',
          names: ['details', 'subtotal'],
        }
      },
      (analysis) => {
        analysis.cout_chains[3] = {
          occurrence: 4, statement: 10, fields: ['observer_name', 'details'],
        }
      },
    ]

    for (const [index, mutate] of mutations.entries()) {
      const analysis = referenceCppAnalysis()
      mutate(analysis)
      const results = evaluateProjectStructuralChecks(cppCompiledProjectServerAssessment, analysis)
      expect(results[index], `C++ structural check ${index + 1}`).toMatchObject({ passed: false })
    }
  })

  it('requires the authored statement order and the exact final output field order', () => {
    const reversedHeaders = referenceCppAnalysis()
    reversedHeaders.headers = ['string', 'iostream']
    expect(evaluateProjectStructuralChecks(
      cppCompiledProjectServerAssessment,
      reversedHeaders,
    )[0]).toMatchObject({ passed: false })

    const frameMutations: Array<(analysis: CppAnalysis) => void> = [
      (analysis) => { analysis.declarations[0].statement = 2 },
      (analysis) => { analysis.declarations[1].statement = 3 },
      (analysis) => { analysis.inputs[0].statement = 4 },
      (analysis) => { analysis.cout_chains[2].statement = 5 },
      (analysis) => { analysis.declarations[2].statement = 6 },
      (analysis) => { analysis.inputs[1].statement = 7 },
      (analysis) => { analysis.declarations[3].statement = 8 },
      (analysis) => { analysis.cout_chains[3].statement = 9 },
    ]

    for (const mutate of frameMutations) {
      const analysis = referenceCppAnalysis()
      mutate(analysis)
      const results = evaluateProjectStructuralChecks(cppCompiledProjectServerAssessment, analysis)
      expect(results.every((check) => !check.passed)).toBe(true)
    }

    const reorderedFields = referenceCppAnalysis()
    reorderedFields.cout_chains[3].fields = ['details', 'observer_name', 'focus_points']
    expect(evaluateProjectStructuralChecks(
      cppCompiledProjectServerAssessment,
      reorderedFields,
    )[7]).toMatchObject({ passed: false })
  })

  it('rejects extra declaration, input, or output facts even when required facts remain', () => {
    const extraDeclaration = referenceCppAnalysis()
    extraDeclaration.declarations.push({
      target: 'extra', occurrence: 1, statement: 10, kind: 'integer', value: 1,
    })
    const extraInput = referenceCppAnalysis()
    extraInput.inputs.push({
      occurrence: 3, statement: 10, kind: 'cin_extract', target: 'extra',
    })
    const extraOutput = referenceCppAnalysis()
    extraOutput.cout_chains.push({ occurrence: 5, statement: 11, fields: [] })

    for (const analysis of [extraDeclaration, extraInput, extraOutput]) {
      const results = evaluateProjectStructuralChecks(cppCompiledProjectServerAssessment, analysis)
      expect(results.every((check) => !check.passed)).toBe(true)
    }
  })

  it('rejects duplicate declarations and never exposes private C++ assessment values', () => {
    const analysis = referenceCppAnalysis()
    analysis.declarations.splice(1, 0, {
      target: 'points_per_detail', occurrence: 2, statement: 2, kind: 'integer', value: 5,
    })
    const results = evaluateProjectStructuralChecks(cppCompiledProjectServerAssessment, analysis)
    expect(results[2]).toMatchObject({ passed: false })

    const executions = cppCompiledProjectServerAssessment.testCases.map((testCase) => ({
      outcome: 'completed' as const,
      stdout: testCase.expectedStdout,
    }))
    const evaluation = evaluateProjectRunnerAssignment(finalCppAssignment(), executions, referenceCppAnalysis())
    const serialized = JSON.stringify(evaluation)
    expect(serialized).not.toMatch(/Morgan|Riley|Sam Lee|35 focus points/u)
    expect(serialized).not.toContain(cppCompiledProjectServerAssessment.referenceSolution)
  })
})
