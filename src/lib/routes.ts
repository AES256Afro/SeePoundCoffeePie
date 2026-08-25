import type { LanguageId } from '../types'

export type RoutePage =
  | 'landing'
  | 'home'
  | 'start'
  | 'courses'
  | 'course'
  | 'academy'
  | 'practice'
  | 'codebook'
  | 'profile'
  | 'settings'
  | 'lesson'
  | 'not-found'

export interface AppRoute {
  page: RoutePage
  language?: LanguageId
  missionId?: string
  exerciseId?: string
  practice?: boolean
  conceptIds: string[]
}

const languageIds: LanguageId[] = ['python', 'cpp', 'csharp', 'java']

const courseSlugs: Record<LanguageId, string> = {
  python: 'python-foundations',
  cpp: 'cpp-foundations',
  csharp: 'csharp-foundations',
  java: 'java-foundations',
}

const languagesByCourseSlug = Object.fromEntries(
  Object.entries(courseSlugs).map(([language, slug]) => [slug, language]),
) as Record<string, LanguageId>

function languageFromSegment(value: string | undefined): LanguageId | undefined {
  return languageIds.find((language) => language === value)
}

function safeDecode(segment: string): string {
  try {
    return decodeURIComponent(segment)
  } catch {
    return segment
  }
}

export function academyPath(language: LanguageId): string {
  return `/academy/${language}`
}

export function homePath(): string {
  return '/home'
}

export function coursesPath(): string {
  return '/courses'
}

export function courseSlug(language: LanguageId): string {
  return courseSlugs[language]
}

export function coursePath(language: LanguageId): string {
  return `${coursesPath()}/${courseSlug(language)}`
}

export function lessonPath(language: LanguageId, missionId: string, exerciseId: string): string {
  return `/learn/${courseSlug(language)}/${encodeURIComponent(missionId)}/${encodeURIComponent(exerciseId)}`
}

export function practicePath(language: LanguageId): string {
  return `/practice/${language}`
}

export function codebookPath(language: LanguageId): string {
  return `/codebook/${language}`
}

export function missionPath(language: LanguageId, missionId: string): string {
  return `${academyPath(language)}/missions/${encodeURIComponent(missionId)}`
}

export function practiceMissionPath(language: LanguageId, missionId: string, conceptIds: string[]): string {
  const search = new URLSearchParams()
  if (conceptIds.length > 0) search.set('concepts', conceptIds.join(','))
  const query = search.toString()
  return `${practicePath(language)}/missions/${encodeURIComponent(missionId)}${query ? `?${query}` : ''}`
}

export function pagePath(page: 'academy' | 'practice' | 'codebook', language: LanguageId): string {
  if (page === 'practice') return practicePath(language)
  if (page === 'codebook') return codebookPath(language)
  return academyPath(language)
}

export function parseAppRoute(pathname: string, search = ''): AppRoute {
  const segments = pathname.split('/').filter(Boolean).map(safeDecode)
  const emptyConcepts: string[] = []

  if (segments.length === 0) return { page: 'landing', conceptIds: emptyConcepts }
  if (segments.length === 1 && segments[0] === 'home') return { page: 'home', conceptIds: emptyConcepts }
  if (segments.length === 1 && segments[0] === 'start') return { page: 'start', conceptIds: emptyConcepts }
  if (segments.length === 1 && segments[0] === 'courses') return { page: 'courses', conceptIds: emptyConcepts }
  if (segments.length === 1 && segments[0] === 'profile') return { page: 'profile', conceptIds: emptyConcepts }
  if (segments.length === 1 && segments[0] === 'settings') return { page: 'settings', conceptIds: emptyConcepts }

  if (segments.length === 2 && segments[0] === 'courses') {
    const courseLanguage = languagesByCourseSlug[segments[1]]
    return courseLanguage
      ? { page: 'course', language: courseLanguage, conceptIds: emptyConcepts }
      : { page: 'not-found', conceptIds: emptyConcepts }
  }

  if (segments.length === 4 && segments[0] === 'learn') {
    const courseLanguage = languagesByCourseSlug[segments[1]]
    if (!courseLanguage) return { page: 'not-found', conceptIds: emptyConcepts }
    return {
      page: 'lesson',
      language: courseLanguage,
      missionId: segments[2],
      exerciseId: segments[3],
      practice: false,
      conceptIds: emptyConcepts,
    }
  }

  const area = segments[0]
  const language = languageFromSegment(segments[1])
  if (!language) return { page: 'not-found', conceptIds: emptyConcepts }

  if (segments.length === 2 && area === 'academy') return { page: 'academy', language, conceptIds: emptyConcepts }
  if (segments.length === 2 && area === 'practice') return { page: 'practice', language, conceptIds: emptyConcepts }
  if (segments.length === 2 && area === 'codebook') return { page: 'codebook', language, conceptIds: emptyConcepts }

  if (segments.length === 4 && segments[2] === 'missions' && (area === 'academy' || area === 'practice')) {
    const params = new URLSearchParams(search)
    const conceptIds = (params.get('concepts') ?? '').split(',').filter(Boolean)
    return {
      page: 'lesson',
      language,
      missionId: segments[3],
      practice: area === 'practice',
      conceptIds,
    }
  }

  return { page: 'not-found', conceptIds: emptyConcepts }
}
