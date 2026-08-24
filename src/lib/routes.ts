import type { LanguageId } from '../types'

export type RoutePage =
  | 'home'
  | 'start'
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
  practice?: boolean
  conceptIds: string[]
}

const languageIds: LanguageId[] = ['python', 'cpp', 'csharp', 'java']

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

  if (segments.length === 0) return { page: 'home', conceptIds: emptyConcepts }
  if (segments.length === 1 && segments[0] === 'start') return { page: 'start', conceptIds: emptyConcepts }
  if (segments.length === 1 && segments[0] === 'profile') return { page: 'profile', conceptIds: emptyConcepts }
  if (segments.length === 1 && segments[0] === 'settings') return { page: 'settings', conceptIds: emptyConcepts }

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
