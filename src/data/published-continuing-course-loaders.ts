import { controlledContinuingCourseRegistrations } from './controlled-continuing-course-publication'
import {
  publishedContinuingCourseIdsForLanguage,
  publishedLearningSequences,
} from './learning-sequence'
import type { PublishedContinuingCourseRegistration } from './learning-surface'
import type { CourseId, LanguageId, Mission } from '../types'

export interface ContinuingCourseContent {
  id: CourseId
  language: LanguageId
  missions: Mission[]
}

export interface PublishedContinuingCourseLoader {
  courseId: CourseId
  language: LanguageId
  load: () => Promise<ContinuingCourseContent>
}

const registrationByCourseId = new Map<CourseId, PublishedContinuingCourseRegistration>()
for (const registration of controlledContinuingCourseRegistrations) {
  if (registrationByCourseId.has(registration.definition.id)) {
    throw new Error(`Duplicate continuing-course loader: ${registration.definition.id}.`)
  }
  registrationByCourseId.set(registration.definition.id, registration)
}

const sequencedCourseIds = publishedLearningSequences.flatMap((sequence) => (
  publishedContinuingCourseIdsForLanguage(sequence.language)
))
if (
  registrationByCourseId.size !== sequencedCourseIds.length
  || sequencedCourseIds.some((courseId) => !registrationByCourseId.has(courseId))
) {
  throw new Error('Continuing-course loaders must exactly match the public learning sequence.')
}

export const publishedContinuingCourseLoaders: readonly PublishedContinuingCourseLoader[] = Object.freeze(
  sequencedCourseIds.map((courseId) => {
    const registration = registrationByCourseId.get(courseId)
    if (!registration) throw new Error(`Continuing-course loader is missing: ${courseId}.`)
    return Object.freeze({
      courseId,
      language: registration.language,
      load: registration.loadContent,
    })
  }),
)

export function continuingCourseContentMatchesRegistration(
  content: ContinuingCourseContent,
  registration: PublishedContinuingCourseRegistration,
): boolean {
  if (
    content.id !== registration.definition.id
    || content.language !== registration.language
    || content.missions.length !== registration.manifest.modules.length
  ) return false

  return content.missions.every((mission, moduleIndex) => {
    const manifestModule = registration.manifest.modules[moduleIndex]
    return Boolean(
      manifestModule
      && mission.id === manifestModule.id
      && mission.language === registration.language
      && mission.exercises.length === manifestModule.lessonIds.length
      && mission.exercises.every((exercise, lessonIndex) => (
        exercise.id === manifestModule.lessonIds[lessonIndex]
      )),
    )
  })
}

const contentRequestByCourseId = new Map<string, Promise<ContinuingCourseContent | null>>()

export function publishedContinuingCourseContentRequest(
  courseId: string,
): Promise<ContinuingCourseContent | null> | undefined {
  const cached = contentRequestByCourseId.get(courseId)
  if (cached) return cached

  const registration = registrationByCourseId.get(courseId as CourseId)
  if (!registration) return undefined

  const request = registration.loadContent().then(
    (content) => continuingCourseContentMatchesRegistration(content, registration) ? content : null,
    () => null,
  )
  contentRequestByCourseId.set(courseId, request)
  return request
}

export function publishedContinuingCourseContentRequestsForLanguage(
  language: LanguageId,
): readonly Promise<ContinuingCourseContent | null>[] {
  return publishedContinuingCourseIdsForLanguage(language).flatMap((courseId) => {
    const request = publishedContinuingCourseContentRequest(courseId)
    return request ? [request] : []
  })
}
