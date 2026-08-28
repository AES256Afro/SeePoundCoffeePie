import { describe, expect, it } from 'vitest'
import { courseDefinitions } from './course-registry'
import {
  publishedContinuingCourseLessonIds,
  publishedContinuingCourseManifest,
  publishedContinuingCourseManifests,
} from './published-continuing-course-manifests'
import { pythonDataToolsManifest } from './python-data-tools-manifest'
import { cppCollectionsRecordsManifest } from './cpp-collections-records-manifest'

describe('published continuing-course manifests', () => {
  it('contains both released continuing courses', () => {
    expect(publishedContinuingCourseManifests.map((manifest) => manifest.courseId)).toEqual([
      'python-data-tools',
      'cpp-collections-records',
    ])
  })

  it('preserves exact Practical C++ module, lesson, and concept ownership', () => {
    const manifest = publishedContinuingCourseManifest('cpp-collections-records')
    expect(manifest?.modules).toEqual(
      Object.entries(cppCollectionsRecordsManifest).map(([id, lessons]) => ({
        id,
        lessonIds: lessons.map((lesson) => lesson.id),
        conceptIds: [...new Set(lessons.map((lesson) => lesson.conceptId))],
      })),
    )
    expect(publishedContinuingCourseLessonIds(
      'cpp-collections-records',
      'cpp-records-workshop-report',
    )).toEqual([
      'cpprecords6-trace-stock-update',
      'cpprecords6-plan-report',
      'cpprecords6-order-report',
      'cpprecords6-fix-low-stock-check',
      'cpprecords6-workshop-stock-report',
    ])
  })

  it('preserves exact module, lesson, and concept ownership without teaching copy', () => {
    const manifest = publishedContinuingCourseManifest('python-data-tools')
    expect(manifest?.modules).toEqual(
      Object.entries(pythonDataToolsManifest).map(([id, lessons]) => ({
        id,
        lessonIds: lessons.map((lesson) => lesson.id),
        conceptIds: [...new Set(lessons.map((lesson) => lesson.conceptId))],
      })),
    )
    expect(publishedContinuingCourseLessonIds(
      'python-data-tools',
      'py-data-return-values',
    )).toEqual([
      'pydata1-retrieve-call',
      'pydata1-return-purpose',
      'pydata1-predict-result',
      'pydata1-fix-return',
      'pydata1-subtotal',
    ])
    expect(publishedContinuingCourseLessonIds(
      'python-data-tools',
      'not-a-module',
    )).toBeUndefined()
  })

  it('provides compact ownership for every published continuing definition', () => {
    const continuingDefinitions = courseDefinitions.filter((course) => course.kind === 'continuing')
    expect(continuingDefinitions).toHaveLength(2)
    for (const definition of continuingDefinitions) {
      const manifest = publishedContinuingCourseManifest(definition.id)
      expect(manifest?.modules.map((module) => module.id)).toEqual(definition.missionIds)
      expect(manifest?.modules.flatMap((module) => module.lessonIds)).toEqual(definition.lessonIds)
    }
  })
})
