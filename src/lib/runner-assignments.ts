import { tracks } from '../data/curriculum'
import type { Exercise, LanguageId } from '../types'
import type { RunnerOutcome, RunnerTestResult } from './runner-contract'

export interface RunnerAssignment {
  exerciseId: string
  language: LanguageId
  expectedOutput: string
  exercise: Exercise
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
      })
    }
  }
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
  ]
}
