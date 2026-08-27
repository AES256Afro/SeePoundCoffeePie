import type { CourseId, LanguageId, Mission } from '../types'

export interface ContinuingCourseContent {
  id: CourseId
  missions: Mission[]
}

export interface PublishedContinuingCourseLoader {
  courseId: CourseId
  language: LanguageId
  load: () => Promise<ContinuingCourseContent>
}

export const publishedContinuingCourseLoaders: readonly PublishedContinuingCourseLoader[] = [
  {
    courseId: 'python-data-tools',
    language: 'python',
    load: async () => {
      const module = await import('./python-data-tools-course')
      return module.pythonDataToolsCourse
    },
  },
]

const contentRequestByCourseId = new Map<string, Promise<ContinuingCourseContent | null>>()

export function publishedContinuingCourseContentRequest(
  courseId: string,
): Promise<ContinuingCourseContent | null> | undefined {
  const cached = contentRequestByCourseId.get(courseId)
  if (cached) return cached

  const registration = publishedContinuingCourseLoaders.find((entry) => entry.courseId === courseId)
  if (!registration) return undefined

  const request = registration.load().then(
    (content) => content.id === courseId ? content : null,
    () => null,
  )
  contentRequestByCourseId.set(courseId, request)
  return request
}

export function publishedContinuingCourseContentRequestForLanguage(
  language: LanguageId,
): Promise<ContinuingCourseContent | null> | undefined {
  const registration = publishedContinuingCourseLoaders.find((entry) => entry.language === language)
  return registration ? publishedContinuingCourseContentRequest(registration.courseId) : undefined
}
