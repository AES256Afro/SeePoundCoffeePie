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

export interface RunnerProjectEvaluation {
  tests: RunnerTestResult[]
  visibleStdout: string
}

interface PythonSourceView {
  topLevelCode: string
  fStrings: string[]
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

function pythonStringStart(source: string, index: number): { prefix: string; quote: string } | null {
  const match = /^([rRuUbBfF]{0,3})("""|'''|"|')/u.exec(source.slice(index))
  if (!match) return null
  const prefix = match[1]
  if (prefix && index > 0 && /[A-Za-z0-9_]/u.test(source[index - 1])) return null
  return { prefix, quote: match[2] }
}

/**
 * Produces the executable top-level view of a beginner Python program.
 * Comments, ordinary string contents, and every indented suite are excluded.
 * F-strings become indexed tokens so their expressions can be checked without
 * allowing code-shaped text inside an unused string to satisfy a requirement.
 */
function pythonSourceView(source: string): PythonSourceView {
  let masked = ''
  const fStrings: string[] = []
  let index = 0

  while (index < source.length) {
    if (source[index] === '#') {
      while (index < source.length && source[index] !== '\n') index += 1
      continue
    }

    const stringStart = pythonStringStart(source, index)
    if (!stringStart) {
      masked += source[index]
      index += 1
      continue
    }

    const tokenLength = stringStart.prefix.length + stringStart.quote.length
    const contentStart = index + tokenLength
    let cursor = contentStart
    while (cursor < source.length && !source.startsWith(stringStart.quote, cursor)) {
      if (source[cursor] === '\\' && stringStart.quote.length === 1) cursor += 2
      else cursor += 1
    }
    const content = source.slice(contentStart, cursor)
    const isFString = stringStart.prefix.toLowerCase().includes('f')
    if (isFString) {
      const stringIndex = fStrings.push(content) - 1
      masked += `__SPPCP_FSTRING_${stringIndex}__`
    } else {
      masked += '__SPPCP_STRING__'
    }
    masked += '\n'.repeat(content.match(/\n/gu)?.length ?? 0)
    index = cursor < source.length ? cursor + stringStart.quote.length : source.length
  }

  return {
    topLevelCode: masked
      .split('\n')
      .filter((line) => line.trim() && !/^\s/u.test(line))
      .join('\n'),
    fStrings,
  }
}

function escapedPattern(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')
}

function topLevelPrintFStringPasses(
  view: PythonSourceView,
  check: ServerOwnedProjectStructuralCheck,
): boolean {
  const printPattern = /^print\s*\(\s*__SPPCP_FSTRING_(\d+)__\s*\)$/u
  for (const line of view.topLevelCode.split('\n')) {
    const match = printPattern.exec(line)
    if (match) {
      const content = view.fStrings[Number(match[1])]
      if (content === undefined) continue
      if ((check.requiredExpressions ?? []).every((expression) => (
        new RegExp(`\\{\\s*${escapedPattern(expression)}\\s*\\}`, 'u').test(content)
      ))) return true
    }
  }
  return false
}

export function evaluateProjectStructuralChecks(
  assessment: ServerOwnedProjectAssessment,
  source: string,
): Array<{ passed: boolean; message: string }> {
  const view = pythonSourceView(source)
  return assessment.structuralChecks.map((check) => ({
    passed: check.validation === 'python-top-level-print-f-string'
      ? topLevelPrintFStringPasses(view, check)
      : new RegExp(check.pattern, check.flags).test(view.topLevelCode),
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
  source: string,
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
  const structuralResults = evaluateProjectStructuralChecks(assessment, source)
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
