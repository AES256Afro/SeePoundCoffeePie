export type PrivateCourseCatalogState = 'published' | 'unpublished'
export type PrivateCourseReleaseState = PrivateCourseCatalogState | 'unavailable'

export interface PrivateCourseBrowserMarker {
  readonly kind: string
  readonly value: string
}

export interface PrivateCourseReleaseEntry {
  readonly id: string
  readonly state: PrivateCourseCatalogState
  readonly coursePath: string
  readonly lessonPrefix: string
  readonly lessonPath: string
  readonly lessonIds: readonly string[]
  readonly browserMarkers: readonly PrivateCourseBrowserMarker[]
}

export const privateCourseReleaseCatalog: readonly PrivateCourseReleaseEntry[]
export function privateCourseReleaseState(courseId: string): PrivateCourseReleaseState
export function privateCourseIsPublished(courseId: string): boolean

export const unpublishedCppCourseId: string
export const unpublishedCppCoursePath: string
export const unpublishedCppLessonPrefix: string
export const unpublishedCppLessonPath: string
export const unpublishedCppLessonIds: readonly string[]
export const unpublishedCppJavaScriptMarkers: readonly PrivateCourseBrowserMarker[]
