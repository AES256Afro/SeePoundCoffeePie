import { describe, expect, it } from 'vitest'
import {
  privateCourseReleaseState,
  practicalCppRunnerBackedLessonIds,
  practicalCppTeachingOnlyLessonIds,
  unpublishedCppCourseId,
  unpublishedCppLessonIds,
} from '../../scripts/unpublished-cpp-release-boundary.mjs'
import {
  createRunnerAssignmentRegistry,
  findRunnerAssignment,
  runnerAssignmentCount,
} from '../lib/runner-assignments'
import { cppCollectionsRecordsLessons } from './cpp-collections-records-plan'
import {
  controlledCppRunnerAssignments,
  cppCollectionsRecordsFinalExerciseId,
} from './cpp-collections-records-runner-publication'
import { CPP_COLLECTIONS_RECORDS_ASSESSMENT_PROFILE } from './cpp-collections-records.server'

const editableLessonIds = cppCollectionsRecordsLessons
  .filter((lesson) => lesson.runnerBacked)
  .map((lesson) => lesson.id)

describe('controlled Practical C++ runner production publication', () => {
  it('publishes only for the exact production state and fails closed otherwise', () => {
    expect(privateCourseReleaseState(unpublishedCppCourseId)).toBe('published')
    expect(controlledCppRunnerAssignments(
      privateCourseReleaseState(unpublishedCppCourseId),
    ).map((assignment) => assignment.exerciseId)).toEqual(editableLessonIds)
    for (const state of [undefined, null, false, 'unavailable', 'unpublished', 'Published']) {
      expect(controlledCppRunnerAssignments(state), String(state)).toEqual([])
    }
  })

  it('builds exactly twelve validated assignments only for the exact published state', () => {
    const candidates = controlledCppRunnerAssignments('published')
    const registry = createRunnerAssignmentRegistry(candidates)

    expect(editableLessonIds).toHaveLength(12)
    expect(candidates.map((assignment) => assignment.exerciseId)).toEqual(editableLessonIds)
    expect(registry.size).toBe(112)
    expect(editableLessonIds.map((exerciseId) => registry.get(exerciseId)?.exerciseId))
      .toEqual(editableLessonIds)
    for (const assignment of candidates) {
      expect(assignment).toMatchObject({
        language: 'cpp',
        kind: 'academy',
        expectedOutput: assignment.exercise.output,
      })
    }
  })

  it('publishes exactly the twelve editable lessons and keeps eighteen teaching lessons local', () => {
    expect(runnerAssignmentCount()).toBe(112)
    expect(createRunnerAssignmentRegistry().size).toBe(112)
    expect(unpublishedCppLessonIds).toEqual(cppCollectionsRecordsLessons.map((lesson) => lesson.id))
    expect(practicalCppRunnerBackedLessonIds).toEqual(editableLessonIds)
    expect(practicalCppTeachingOnlyLessonIds).toHaveLength(18)
    for (const exerciseId of practicalCppRunnerBackedLessonIds) {
      expect(findRunnerAssignment(exerciseId), exerciseId).toMatchObject({
        exerciseId,
        kind: 'academy',
        language: 'cpp',
      })
    }
    for (const exerciseId of practicalCppTeachingOnlyLessonIds) {
      expect(findRunnerAssignment(exerciseId), exerciseId).toBeUndefined()
    }
  })

  it('rejects a duplicate or incomplete candidate before the Worker can start', () => {
    const candidates = controlledCppRunnerAssignments('published')
    expect(() => createRunnerAssignmentRegistry([
      ...candidates,
      candidates[0],
    ])).toThrow(/duplicate runner assignment/iu)
    expect(() => createRunnerAssignmentRegistry([
      ...candidates.slice(0, 1),
      {
        ...candidates[1],
        expectedOutput: 'unreviewed output',
      },
      ...candidates.slice(2),
    ])).toThrow(/inconsistent visible output/iu)
  })

  it('attaches the protected analyzer only to the final stock report', () => {
    const candidates = controlledCppRunnerAssignments('published')
    const protectedAssignments = candidates.filter((assignment) => assignment.assessment)

    expect(protectedAssignments).toHaveLength(1)
    expect(protectedAssignments[0]).toMatchObject({
      exerciseId: cppCollectionsRecordsFinalExerciseId,
      assessment: {
        language: 'cpp',
        analysisProfile: CPP_COLLECTIONS_RECORDS_ASSESSMENT_PROFILE,
      },
    })
    expect(candidates.every((assignment) => assignment.projectAssessment === undefined)).toBe(true)
  })
})
