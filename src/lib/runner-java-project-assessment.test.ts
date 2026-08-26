import { describe, expect, it } from 'vitest'
import { javaPicnicProject } from '../data/java-picnic-project'
import { javaPicnicProjectServerAssessment } from '../data/java-picnic-project.server'
import {
  evaluateProjectRunnerAssignment,
  evaluateProjectStructuralChecks,
  findRunnerAssignment,
  runnerInputCases,
  type JavaAnalysis,
} from './runner-assignments'

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
      output: {
        parts: ['Picnic: ', ' | Guests: ', ''],
        fields: ['name', 'guests'],
      },
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
    writes: [
      { occurrence: 1, statement: 3, text: 'What is your name?' },
      { occurrence: 2, statement: 5, text: 'How many guests are coming?' },
    ],
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

function finalAssignment() {
  const assignment = findRunnerAssignment('project-java-final')
  if (!assignment) throw new Error('The final Java project needs a runner assignment.')
  return assignment
}

describe('server-owned Java project evaluation', () => {
  it('registers all ten editable checkpoints and protects the final assessment', () => {
    const editable = javaPicnicProject.checkpoints.filter(({ exercise }) => (
      exercise.type === 'code' || exercise.type === 'bugfix'
    ))

    expect(editable).toHaveLength(10)
    for (const checkpoint of editable) {
      expect(findRunnerAssignment(checkpoint.exercise.id)).toMatchObject({
        exerciseId: checkpoint.exercise.id,
        language: 'java',
        kind: 'project',
      })
    }
    expect(finalAssignment().projectAssessment).toBe(javaPicnicProjectServerAssessment)
  })

  it('uses learner input for Run and four server-owned cases for the final Check', () => {
    const nameCheckpoint = findRunnerAssignment('project-java-name-input')
    expect(nameCheckpoint).toBeDefined()
    expect(runnerInputCases(nameCheckpoint!, 'run', 'Chris\n')).toEqual(['Chris\n'])
    expect(runnerInputCases(nameCheckpoint!, 'check', 'Ignored\n')).toEqual(['Alex Kim\n'])

    expect(runnerInputCases(finalAssignment(), 'check', 'Ignored too\n')).toEqual(
      javaPicnicProjectServerAssessment.testCases.map((testCase) => testCase.stdin),
    )
  })

  it('accepts all four behavior cases and all nine trusted Java requirements', () => {
    const evaluation = evaluateProjectRunnerAssignment(
      finalAssignment(),
      javaPicnicProjectServerAssessment.testCases.map((testCase) => ({
        outcome: 'completed' as const,
        stdout: testCase.expectedStdout,
      })),
      referenceJavaAnalysis(),
    )

    expect(evaluation.tests).toHaveLength(13)
    expect(evaluation.tests.every((test) => test.passed)).toBe(true)
    expect(evaluation.visibleStdout).toBe(
      javaPicnicProjectServerAssessment.testCases[0].expectedStdout,
    )
  })

  it('fails every structural requirement when trusted analysis is unavailable', () => {
    for (const analysis of [null, emptyJavaAnalysis(), { ...referenceJavaAnalysis(), straight_line: false }]) {
      const results = evaluateProjectStructuralChecks(javaPicnicProjectServerAssessment, analysis)
      expect(results).toHaveLength(9)
      expect(results.every((result) => !result.passed)).toBe(true)
    }
  })

  it('evaluates every Java requirement from exact, bounded facts', () => {
    const mutations: Array<(analysis: JavaAnalysis) => void> = [
      (analysis) => { analysis.imports = [] },
      (analysis) => { analysis.main_methods[0].member = 1 },
      (analysis) => { analysis.static_methods[0].parameters[1].name = 'count' },
      (analysis) => { analysis.scanner_declarations[0].target = 'input' },
      (analysis) => { analysis.arrays[0].values = ['Blankets', 'Napkins', 'Cups'] },
      (analysis) => { analysis.inputs[1].receiver = 'reader' },
      (analysis) => { analysis.conditionals[0].right = 9 },
      (analysis) => { analysis.foreach_loops[0].collection = 'items' },
      (analysis) => { analysis.calls[0].arguments = ['guestCount', 'guestName'] },
    ]

    for (const [index, mutate] of mutations.entries()) {
      const analysis = referenceJavaAnalysis()
      mutate(analysis)
      const results = evaluateProjectStructuralChecks(javaPicnicProjectServerAssessment, analysis)
      expect(results[index], `Java structural check ${index + 1}`).toMatchObject({ passed: false })
    }
  })

  it('rejects hardcoded visible behavior and never exposes private case values', () => {
    const visibleOutput = javaPicnicProjectServerAssessment.testCases[0].expectedStdout
    const evaluation = evaluateProjectRunnerAssignment(
      finalAssignment(),
      javaPicnicProjectServerAssessment.testCases.map(() => ({
        outcome: 'completed' as const,
        stdout: visibleOutput,
      })),
      referenceJavaAnalysis(),
    )
    const serialized = JSON.stringify(evaluation)

    expect(evaluation.tests[0]).toMatchObject({ visibility: 'visible', passed: true })
    expect(evaluation.tests.slice(1, 4).every((test) => !test.passed)).toBe(true)
    expect(evaluation.tests.slice(4).every((test) => test.passed)).toBe(true)
    expect(serialized).not.toMatch(/Maren Holt|Ivo Chen|Tess Alvarez/u)
    expect(serialized).not.toContain(javaPicnicProjectServerAssessment.referenceSolution)
  })
})
