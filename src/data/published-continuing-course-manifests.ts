import type { CourseId } from '../types'
import { pythonDataToolsManifest } from './python-data-tools-manifest'

export interface PublishedContinuingCourseModuleManifest {
  id: string
  lessonIds: readonly string[]
  conceptIds: readonly string[]
}

export interface PublishedContinuingCourseManifest {
  courseId: CourseId
  modules: readonly PublishedContinuingCourseModuleManifest[]
}

export const publishedContinuingCourseManifests: readonly PublishedContinuingCourseManifest[] = [
  {
    courseId: 'python-data-tools',
    modules: Object.entries(pythonDataToolsManifest).map(([id, lessons]) => ({
      id,
      lessonIds: lessons.map((lesson) => lesson.id),
      conceptIds: [...new Set(lessons.map((lesson) => lesson.conceptId))],
    })),
  },
]

const manifestsByCourseId = new Map(
  publishedContinuingCourseManifests.map((manifest) => [manifest.courseId, manifest]),
)

export function publishedContinuingCourseManifest(
  courseId: CourseId,
): PublishedContinuingCourseManifest | undefined {
  return manifestsByCourseId.get(courseId)
}

export function publishedContinuingCourseLessonIds(
  courseId: CourseId,
  moduleId: string,
): readonly string[] | undefined {
  return publishedContinuingCourseManifest(courseId)?.modules.find((module) => (
    module.id === moduleId
  ))?.lessonIds
}
