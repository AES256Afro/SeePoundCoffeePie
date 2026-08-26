import { describe, expect, it } from 'vitest'
import { courseDefinitions } from './course-registry'
import {
  publishedContinuingCourseLessonIds,
  publishedContinuingCourseManifest,
  publishedContinuingCourseManifests,
} from './published-continuing-course-manifests'
import { pythonDataToolsManifest } from './python-data-tools-manifest'

describe('published continuing-course manifests', () => {
  it('contains only the released Practical Python course', () => {
    expect(publishedContinuingCourseManifests.map((manifest) => manifest.courseId)).toEqual([
      'python-data-tools',
    ])
    expect(JSON.stringify(publishedContinuingCourseManifests)).not.toContain('cpp-collections-records')
  })

  it('preserves the exact module-to-lesson ownership without teaching copy', () => {
    const manifest = publishedContinuingCourseManifest('python-data-tools')
    expect(manifest?.modules).toEqual(
      Object.entries(pythonDataToolsManifest).map(([id, lessons]) => ({
        id,
        lessonIds: lessons.map((lesson) => lesson.id),
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
    expect(continuingDefinitions).toHaveLength(1)
    for (const definition of continuingDefinitions) {
      const manifest = publishedContinuingCourseManifest(definition.id)
      expect(manifest?.modules.map((module) => module.id)).toEqual(definition.missionIds)
      expect(manifest?.modules.flatMap((module) => module.lessonIds)).toEqual(definition.lessonIds)
    }
  })
})
