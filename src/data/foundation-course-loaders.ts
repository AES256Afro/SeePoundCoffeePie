import {
  publishedFoundationCourseId,
  publishedLearningSequences,
} from './learning-sequence'
import type { CourseId, LanguageId, LanguageTrack } from '../types'

export interface FoundationCourseContent {
  courseId: CourseId
  track: LanguageTrack
}

export interface FoundationCourseLoader {
  courseId: CourseId
  language: LanguageId
  load: () => Promise<FoundationCourseContent>
}

async function loadFoundationCourse(
  courseId: CourseId,
  language: LanguageId,
): Promise<FoundationCourseContent> {
  const module = await import('./foundation-curriculum-packed.generated')
  const track = module.tracks.find((candidate) => candidate.id === language)
  if (!track) throw new Error(`Foundation curriculum is missing: ${courseId}.`)
  return { courseId, track }
}

const defineFoundationCourseLoader = (
  courseId: CourseId,
  language: LanguageId,
): Readonly<FoundationCourseLoader> => Object.freeze({
  courseId,
  language,
  load: () => loadFoundationCourse(courseId, language),
})

const registeredFoundationCourseLoaders: readonly FoundationCourseLoader[] = Object.freeze([
  defineFoundationCourseLoader('python-foundations', 'python'),
  defineFoundationCourseLoader('cpp-foundations', 'cpp'),
  defineFoundationCourseLoader('csharp-foundations', 'csharp'),
  defineFoundationCourseLoader('java-foundations', 'java'),
])

const loaderByCourseId = new Map<CourseId, FoundationCourseLoader>(
  registeredFoundationCourseLoaders.map((registration) => [registration.courseId, registration]),
)

const registryMatchesSequence = registeredFoundationCourseLoaders.every((registration, index) => {
  const sequence = publishedLearningSequences[index]
  if (!sequence) return false
  const courseId = publishedFoundationCourseId(sequence.language)
  return courseId === registration.courseId && sequence.language === registration.language
})

if (
  registeredFoundationCourseLoaders.length !== publishedLearningSequences.length
  || loaderByCourseId.size !== registeredFoundationCourseLoaders.length
  || !registryMatchesSequence
) {
  throw new Error('Foundation-course loaders do not match the public sequence.')
}

export const foundationCourseLoaders = registeredFoundationCourseLoaders

const requestByCourseId = new Map<string, Promise<FoundationCourseContent | null>>()

export function foundationCourseContentRequest(
  courseId: string,
): Promise<FoundationCourseContent | null> | undefined {
  const cached = requestByCourseId.get(courseId)
  if (cached) return cached

  const registration = loaderByCourseId.get(courseId as CourseId)
  if (!registration) return undefined
  const request = registration.load().then(
    (content) => (
      content.courseId === registration.courseId
      && content.track.id === registration.language
        ? content
        : null
    ),
    () => null,
  )
  requestByCourseId.set(courseId, request)
  return request
}

export function foundationCourseContentRequestForLanguage(
  language: LanguageId,
): Promise<FoundationCourseContent | null> | undefined {
  const courseId = publishedFoundationCourseId(language)
  return courseId ? foundationCourseContentRequest(courseId) : undefined
}
