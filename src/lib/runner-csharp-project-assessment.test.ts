import { describe, expect, it } from 'vitest'
import { csharpWorkshopProject } from '../data/csharp-workshop-project'
import { csharpWorkshopProjectServerAssessment } from '../data/csharp-workshop-project.server'
import {
  evaluateProjectRunnerAssignment,
  evaluateProjectStructuralChecks,
  findRunnerAssignment,
  runnerInputCases,
  type CsharpAnalysis,
} from './runner-assignments'

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
    writes: [
      { occurrence: 1, statement: 3, text: 'What is your name?' },
      { occurrence: 2, statement: 5, text: 'How many visits have you completed?' },
    ],
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

function finalAssignment() {
  const assignment = findRunnerAssignment('project-csharp-final')
  if (!assignment) throw new Error('The final C# project needs a runner assignment.')
  return assignment
}

describe('server-owned C# project evaluation', () => {
  it('registers all ten editable checkpoints and protects the final assessment', () => {
    const editable = csharpWorkshopProject.checkpoints.filter(({ exercise }) => (
      exercise.type === 'code' || exercise.type === 'bugfix'
    ))

    expect(editable).toHaveLength(10)
    for (const checkpoint of editable) {
      expect(findRunnerAssignment(checkpoint.exercise.id)).toMatchObject({
        exerciseId: checkpoint.exercise.id,
        language: 'csharp',
        kind: 'project',
      })
    }
    expect(finalAssignment().projectAssessment).toBe(csharpWorkshopProjectServerAssessment)
  })

  it('uses learner input for Run and four server-owned cases for the final Check', () => {
    const nameCheckpoint = findRunnerAssignment('project-csharp-name-input')
    expect(nameCheckpoint).toBeDefined()
    expect(runnerInputCases(nameCheckpoint!, 'run', 'Chris\n')).toEqual(['Chris\n'])
    expect(runnerInputCases(nameCheckpoint!, 'check', 'Ignored\n')).toEqual(['Alex Kim\n'])

    expect(runnerInputCases(finalAssignment(), 'check', 'Ignored too\n')).toEqual(
      csharpWorkshopProjectServerAssessment.testCases.map((testCase) => testCase.stdin),
    )
  })

  it('accepts all four behavior cases and all eight trusted Roslyn requirements', () => {
    const evaluation = evaluateProjectRunnerAssignment(
      finalAssignment(),
      csharpWorkshopProjectServerAssessment.testCases.map((testCase) => ({
        outcome: 'completed' as const,
        stdout: testCase.expectedStdout,
      })),
      referenceCsharpAnalysis(),
    )

    expect(evaluation.tests).toHaveLength(12)
    expect(evaluation.tests.every((test) => test.passed)).toBe(true)
    expect(evaluation.visibleStdout).toBe(
      csharpWorkshopProjectServerAssessment.testCases[0].expectedStdout,
    )
  })

  it('fails every structural requirement when trusted analysis is unavailable', () => {
    const unavailable: CsharpAnalysis = {
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
    for (const analysis of [null, unavailable, { ...referenceCsharpAnalysis(), straight_line: false }]) {
      const results = evaluateProjectStructuralChecks(csharpWorkshopProjectServerAssessment, analysis)
      expect(results).toHaveLength(8)
      expect(results.every((result) => !result.passed)).toBe(true)
    }
  })

  it('evaluates every C# requirement from exact, bounded facts', () => {
    const mutations: Array<(analysis: CsharpAnalysis) => void> = [
      (analysis) => { analysis.usings = [] },
      (analysis) => { analysis.local_functions[0].parameters[1].name = 'count' },
      (analysis) => { analysis.arrays[0].values = ['Studio', 'Library', 'Lab'] },
      (analysis) => { analysis.inputs[1].fallback = '' },
      (analysis) => { analysis.conditionals[0].right = 4 },
      (analysis) => { analysis.foreach_loops[0].collection = 'rooms' },
      (analysis) => { analysis.calls[0].arguments = ['visitCount', 'guestName'] },
      (analysis) => { analysis.calls[0].statement = 8 },
    ]

    for (const [index, mutate] of mutations.entries()) {
      const analysis = referenceCsharpAnalysis()
      mutate(analysis)
      const results = evaluateProjectStructuralChecks(csharpWorkshopProjectServerAssessment, analysis)
      expect(results[index], `C# structural check ${index + 1}`).toMatchObject({ passed: false })
    }
  })

  it('rejects hardcoded visible behavior and never exposes private case values', () => {
    const visibleOutput = csharpWorkshopProjectServerAssessment.testCases[0].expectedStdout
    const evaluation = evaluateProjectRunnerAssignment(
      finalAssignment(),
      csharpWorkshopProjectServerAssessment.testCases.map(() => ({
        outcome: 'completed' as const,
        stdout: visibleOutput,
      })),
      referenceCsharpAnalysis(),
    )
    const serialized = JSON.stringify(evaluation)

    expect(evaluation.tests[0]).toMatchObject({ visibility: 'visible', passed: true })
    expect(evaluation.tests.slice(1, 4).every((test) => !test.passed)).toBe(true)
    expect(evaluation.tests.slice(4).every((test) => test.passed)).toBe(true)
    expect(serialized).not.toMatch(/Maren Holt|Ivo Chen|Tess Alvarez/u)
    expect(serialized).not.toContain(csharpWorkshopProjectServerAssessment.referenceSolution)
  })
})
