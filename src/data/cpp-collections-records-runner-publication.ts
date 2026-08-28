import type { RunnerAssignment } from '../lib/runner-assignments'
import { cppCollectionsRecordsDraftModules } from './cpp-collections-records-course-draft'
import { cppCollectionsRecordsServerAssessment } from './cpp-collections-records.server'

export const cppCollectionsRecordsFinalExerciseId = 'cpprecords6-workshop-stock-report'

function authoredCandidateAssignments(): readonly RunnerAssignment[] {
  const assignments: RunnerAssignment[] = []
  for (const mission of cppCollectionsRecordsDraftModules) {
    for (const exercise of mission.exercises) {
      if (
        (exercise.type !== 'code' && exercise.type !== 'bugfix')
        || exercise.output === undefined
      ) continue

      assignments.push(Object.freeze({
        exerciseId: exercise.id,
        language: 'cpp',
        expectedOutput: exercise.output,
        exercise,
        kind: 'academy',
        ...(exercise.id === cppCollectionsRecordsFinalExerciseId
          ? { assessment: cppCollectionsRecordsServerAssessment }
          : {}),
      }))
    }
  }
  return Object.freeze(assignments)
}

export const cppCollectionsRecordsRunnerAssignments = authoredCandidateAssignments()

/**
 * Returns the private runner candidates only for the exact reviewed state.
 * This module is not imported by the production runner registry.
 */
export function controlledCppRunnerAssignments(
  releaseState: unknown,
): readonly RunnerAssignment[] {
  return releaseState === 'published'
    ? cppCollectionsRecordsRunnerAssignments
    : Object.freeze([])
}
