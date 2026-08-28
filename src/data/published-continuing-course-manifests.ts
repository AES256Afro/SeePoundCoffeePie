import type { CourseId } from '../types'
import { controlledContinuingCourseRegistrations } from './controlled-continuing-course-publication'

export interface PublishedContinuingCourseModuleManifest {
  id: string
  lessonIds: readonly string[]
  conceptIds: readonly string[]
}

export interface PublishedContinuingCourseManifest {
  courseId: CourseId
  modules: readonly PublishedContinuingCourseModuleManifest[]
}

export const publishedContinuingCourseManifests: readonly PublishedContinuingCourseManifest[] = Object.freeze(
  controlledContinuingCourseRegistrations.map((registration) => registration.manifest),
)

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
