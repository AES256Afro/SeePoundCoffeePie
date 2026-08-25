import { tracks } from '../data/curriculum'
import { pythonInteractiveProject } from '../data/python-interactive-project'
import {
  pythonInteractiveProjectServerAssessment,
  type ServerOwnedProjectAssessment,
  type ServerOwnedProjectStructuralCheck,
} from '../data/python-interactive-project.server'
import type { Exercise, LanguageId } from '../types'
import { evaluateExerciseChecks } from './evaluator'
import type { RunnerOutcome, RunnerPurpose, RunnerTestResult } from './runner-contract'

export type RunnerAssignmentKind = 'academy' | 'project'

export interface RunnerAssignment {
  exerciseId: string
  language: LanguageId
  expectedOutput: string
  exercise: Exercise
  kind: RunnerAssignmentKind
  projectCheckStdin?: string
  projectAssessment?: ServerOwnedProjectAssessment
}

export interface RunnerProjectCaseExecution {
  outcome: RunnerOutcome
  stdout: string
}

export type PythonAssignmentFact =
  | { target: string; occurrence: number; kind: 'integer'; value: number }
  | { target: string; occurrence: number; kind: 'string' }
  | { target: string; occurrence: number; kind: 'name'; name: string }
  | { target: string; occurrence: number; kind: 'input' }
  | { target: string; occurrence: number; kind: 'int_name'; name: string }
  | { target: string; occurrence: number; kind: 'multiply_names'; names: [string, string] }
  | { target: string; occurrence: number; kind: 'unsupported' }

export interface PythonPrintFStringFact {
  occurrence: number
  fields: string[]
}

export interface PythonAnalysis {
  version: 1
  parsed: boolean
  straight_line: boolean
  assignments: PythonAssignmentFact[]
  print_fstrings: PythonPrintFStringFact[]
}

export interface RunnerProjectEvaluation {
  tests: RunnerTestResult[]
  visibleStdout: string
}

const assignments = new Map<string, RunnerAssignment>()

for (const track of tracks) {
  for (const mission of track.missions) {
    for (const exercise of mission.exercises) {
      if ((exercise.type !== 'code' && exercise.type !== 'bugfix') || exercise.output === undefined) continue
      assignments.set(exercise.id, {
        exerciseId: exercise.id,
        language: track.id,
        expectedOutput: exercise.output,
        exercise,
        kind: 'academy',
      })
    }
  }
}

for (const checkpoint of pythonInteractiveProject.checkpoints) {
  const { exercise } = checkpoint
  if ((exercise.type !== 'code' && exercise.type !== 'bugfix') || exercise.output === undefined) continue
  assignments.set(exercise.id, {
    exerciseId: exercise.id,
    language: pythonInteractiveProject.language,
    expectedOutput: exercise.output,
    exercise,
    kind: 'project',
    projectCheckStdin: checkpoint.practiceStdin ?? '',
    ...(exercise.id === 'project-py-final'
      ? { projectAssessment: pythonInteractiveProjectServerAssessment }
      : {}),
  })
}

export function findRunnerAssignment(exerciseId: string): RunnerAssignment | undefined {
  return assignments.get(exerciseId)
}

export function runnerAssignmentCount(): number {
  return assignments.size
}

function normalizedOutput(value: string): string {
  return value.replaceAll('\r\n', '\n').trimEnd()
}

function checkPythonAnalysisFact(
  analysis: PythonAnalysis,
  check: ServerOwnedProjectStructuralCheck,
): boolean {
  if (check.validation === 'python-print-f-string') {
    return analysis.print_fstrings.some((fact) => (
      check.requiredFields.every((field) => fact.fields.includes(field))
    ))
  }

  const assignments = analysis.assignments.filter((fact) => fact.target === check.target)
  if (assignments.length !== 1 || assignments[0].occurrence !== 1) return false
  const fact = assignments[0]

  switch (check.validation) {
    case 'python-assignment-integer':
      return fact.kind === 'integer' && fact.value === check.value
    case 'python-assignment-input':
      return fact.kind === 'input'
    case 'python-assignment-int-name':
      return fact.kind === 'int_name' && fact.name === check.name
    case 'python-assignment-multiply-names':
      return fact.kind === 'multiply_names'
        && fact.names[0] === check.names[0]
        && fact.names[1] === check.names[1]
  }
}

export function evaluateProjectStructuralChecks(
  assessment: ServerOwnedProjectAssessment,
  analysis: PythonAnalysis | null | undefined,
): Array<{ passed: boolean; message: string }> {
  const trusted = analysis?.version === 1 && analysis.parsed && analysis.straight_line
  return assessment.structuralChecks.map((check) => ({
    passed: trusted ? checkPythonAnalysisFact(analysis, check) : false,
    message: check.message,
  }))
}

export function runnerInputCases(
  assignment: RunnerAssignment,
  purpose: RunnerPurpose,
  callerStdin: string,
): string[] {
  if (assignment.kind !== 'project') return [callerStdin]
  if (purpose === 'run') return [callerStdin]
  if (assignment.projectAssessment) {
    return assignment.projectAssessment.testCases.map((testCase) => testCase.stdin)
  }
  return [assignment.projectCheckStdin ?? '']
}

export function aggregateRunnerDurationMs(durations: number[]): number {
  return durations.reduce((total, duration) => {
    const safeDuration = Number.isFinite(duration) && duration > 0
      ? Math.round(duration)
      : 0
    return Math.min(Number.MAX_SAFE_INTEGER, total + safeDuration)
  }, 0)
}

export function evaluateProjectRunnerAssignment(
  assignment: RunnerAssignment,
  executions: RunnerProjectCaseExecution[],
  analysis: PythonAnalysis | null | undefined,
): RunnerProjectEvaluation {
  const assessment = assignment.projectAssessment
  if (!assessment) return { tests: [], visibleStdout: '' }

  let hiddenCaseNumber = 0
  const caseTests: RunnerTestResult[] = assessment.testCases.map((testCase, index) => {
    const execution = executions[index]
    const completed = execution?.outcome === 'completed'
    const outputMatches = completed
      && normalizedOutput(execution.stdout) === normalizedOutput(testCase.expectedStdout)
    const hiddenNumber = testCase.visibility === 'hidden' ? ++hiddenCaseNumber : 0
    const name = testCase.visibility === 'visible'
      ? 'Visible project example'
      : `Hidden project case ${hiddenNumber}`

    return {
      name,
      visibility: testCase.visibility,
      passed: outputMatches,
      message: outputMatches
        ? testCase.visibility === 'visible'
          ? 'Your program produced the expected result for the visible example.'
          : 'Your program passed this hidden input case.'
        : execution
          ? testCase.visibility === 'visible'
            ? 'Your program did not produce the expected result for the visible example.'
            : 'Your program did not pass this hidden input case.'
          : 'This case could not run because an earlier case did not finish.',
    }
  })
  const structuralResults = evaluateProjectStructuralChecks(assessment, analysis)
  const structuralTests: RunnerTestResult[] = structuralResults.map((check, index) => ({
    name: `Required project code ${index + 1} of ${structuralResults.length}`,
    visibility: 'hidden',
    passed: check.passed,
    message: check.passed
      ? 'This required part of the project is present in your code.'
      : check.message,
  }))
  const visibleIndex = assessment.testCases.findIndex((testCase) => testCase.visibility === 'visible')

  return {
    tests: [...caseTests, ...structuralTests],
    visibleStdout: visibleIndex >= 0 ? executions[visibleIndex]?.stdout ?? '' : '',
  }
}

export function evaluateRunnerAssignment(
  assignment: RunnerAssignment,
  outcome: RunnerOutcome,
  stdout: string,
  source: string,
): RunnerTestResult[] {
  const completed = outcome === 'completed'
  const outputMatches = completed
    && normalizedOutput(stdout) === normalizedOutput(assignment.expectedOutput)
  const scaffoldComplete = !source.includes('_____')
  const authoredCheckResults = evaluateExerciseChecks(assignment.exercise, source)
  const requiredCodeTests: RunnerTestResult[] = authoredCheckResults.map((check, index) => ({
    name: authoredCheckResults.length === 1
      ? 'Required lesson code'
      : `Required lesson code ${index + 1} of ${authoredCheckResults.length}`,
    visibility: 'hidden',
    passed: check.passed,
    message: check.passed
      ? 'This required part of the lesson is present in your code.'
      : check.message,
  }))

  return [
    {
      name: 'Visible console check',
      visibility: 'visible',
      passed: outputMatches,
      message: outputMatches
        ? `The real console output matched: ${assignment.expectedOutput}`
        : `The assignment asked for this exact visible output: ${assignment.expectedOutput}`,
    },
    {
      name: 'Complete the supplied scaffold',
      visibility: 'hidden',
      passed: scaffoldComplete,
      message: scaffoldComplete
        ? 'Every blank identified in the task was completed.'
        : 'At least one supplied _____ blank still needs an answer.',
    },
    {
      name: 'Finish without a language error',
      visibility: 'hidden',
      passed: completed,
      message: completed
        ? 'The program finished normally inside the isolated runner.'
        : 'The same requirement also needs the program to compile and finish normally.',
    },
    ...requiredCodeTests,
  ]
}
