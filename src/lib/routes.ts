import type { LanguageId } from '../types'
import type { CourseId } from '../types'
import { projectManifests } from '../data/project-manifests'
import {
  courseDefinition,
  courseDefinitionForSlug,
  courseMissionOwnsLesson,
  foundationCourseId,
} from '../data/course-registry'

export type RoutePage =
  | 'landing'
  | 'home'
  | 'start'
  | 'courses'
  | 'course'
  | 'academy'
  | 'practice'
  | 'practice-session'
  | 'codebook'
  | 'profile'
  | 'settings'
  | 'lesson'
  | 'project'
  | 'portfolio'
  | 'not-found'

export interface AppRoute {
  page: RoutePage
  language?: LanguageId
  courseId?: CourseId
  missionId?: string
  exerciseId?: string
  projectId?: string
  checkpointId?: string
  practice?: boolean
  practiceStep?: number
  conceptIds: string[]
}

const languageIds: LanguageId[] = ['python', 'cpp', 'csharp', 'java']

const projectIdsByLanguage = projectManifests.reduce<Partial<Record<LanguageId, string[]>>>(
  (projects, project) => {
    const ids = projects[project.language] ?? []
    ids.push(project.id)
    projects[project.language] = ids
    return projects
  },
  {},
)

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

function courseIdFor(value: CourseId | LanguageId): CourseId {
  return languageIds.includes(value as LanguageId)
    ? foundationCourseId(value as LanguageId)
    : value as CourseId
}

export function courseSlug(course: CourseId | LanguageId): string {
  return courseDefinition(courseIdFor(course)).slug
}

export function coursePath(course: CourseId | LanguageId): string {
  return `${coursesPath()}/${courseSlug(course)}`
}

export function foundationCoursePath(language: LanguageId): string {
  return coursePath(foundationCourseId(language))
}

export function lessonPath(course: CourseId | LanguageId, missionId: string, exerciseId: string): string {
  return `/learn/${courseSlug(course)}/${encodeURIComponent(missionId)}/${encodeURIComponent(exerciseId)}`
}

export function projectPath(language: LanguageId, projectId: string, checkpointId?: string): string {
  const project = `/projects/${language}/${encodeURIComponent(projectId)}`
  return checkpointId ? `${project}/${encodeURIComponent(checkpointId)}` : project
}

export function portfolioPath(language: LanguageId, projectId: string): string {
  return `/portfolio/${language}/${encodeURIComponent(projectId)}`
}

export function practicePath(language: LanguageId): string {
  return `/practice/${language}`
}

export function practiceSessionPath(language: LanguageId, step = 1): string {
  return step <= 1
    ? `${practicePath(language)}/session`
    : `${practicePath(language)}/session/${step}`
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
    const course = courseDefinitionForSlug(segments[1])
    return course
      ? { page: 'course', language: course.language, courseId: course.id, conceptIds: emptyConcepts }
      : { page: 'not-found', conceptIds: emptyConcepts }
  }

  if (segments.length === 4 && segments[0] === 'learn') {
    const course = courseDefinitionForSlug(segments[1])
    if (!course || !courseMissionOwnsLesson(course.id, segments[2], segments[3])) {
      return { page: 'not-found', conceptIds: emptyConcepts }
    }
    return {
      page: 'lesson',
      language: course.language,
      courseId: course.id,
      missionId: segments[2],
      exerciseId: segments[3],
      practice: false,
      conceptIds: emptyConcepts,
    }
  }

  if (segments[0] === 'projects' && (segments.length === 3 || segments.length === 4)) {
    const projectLanguage = languageFromSegment(segments[1])
    const projectId = segments[2]
    const knownProject = projectLanguage
      ? projectIdsByLanguage[projectLanguage]?.includes(projectId)
      : false

    if (!projectLanguage || !knownProject) return { page: 'not-found', conceptIds: emptyConcepts }
    return {
      page: 'project',
      language: projectLanguage,
      projectId,
      checkpointId: segments[3],
      conceptIds: emptyConcepts,
    }
  }

  if (segments[0] === 'portfolio' && segments.length === 3) {
    if (search) return { page: 'not-found', conceptIds: emptyConcepts }
    const projectLanguage = languageFromSegment(segments[1])
    const projectId = segments[2]
    const knownProject = projectLanguage
      ? projectIdsByLanguage[projectLanguage]?.includes(projectId)
      : false

    if (!projectLanguage || !knownProject) return { page: 'not-found', conceptIds: emptyConcepts }
    return {
      page: 'portfolio',
      language: projectLanguage,
      projectId,
      conceptIds: emptyConcepts,
    }
  }

  const area = segments[0]
  const language = languageFromSegment(segments[1])
  if (!language) return { page: 'not-found', conceptIds: emptyConcepts }

  if (segments.length === 2 && area === 'academy') return { page: 'academy', language, conceptIds: emptyConcepts }
  if (segments.length === 2 && area === 'practice') return { page: 'practice', language, conceptIds: emptyConcepts }
  if (segments.length === 2 && area === 'codebook') return { page: 'codebook', language, conceptIds: emptyConcepts }

  if (
    area === 'practice'
    && segments[2] === 'session'
    && (segments.length === 3 || segments.length === 4)
  ) {
    if (search) return { page: 'not-found', conceptIds: emptyConcepts }
    const stepText = segments[3]
    if (stepText && !/^[2-5]$/u.test(stepText)) {
      return { page: 'not-found', conceptIds: emptyConcepts }
    }
    return {
      page: 'practice-session',
      language,
      practice: true,
      practiceStep: stepText ? Number(stepText) : 1,
      conceptIds: emptyConcepts,
    }
  }

  if (segments.length === 4 && segments[2] === 'missions' && (area === 'academy' || area === 'practice')) {
    const params = new URLSearchParams(search)
    const rawConcepts = params.get('concepts')
    const conceptParameters = params.getAll('concepts')
    const conceptIds = rawConcepts ? rawConcepts.split(',') : []
    if (
      search.length > 1_024
      || conceptParameters.length > 1
      || conceptIds.length > 5
      || conceptIds.some((conceptId) => !conceptId || conceptId.length > 100)
      || new Set(conceptIds).size !== conceptIds.length
      || [...params.keys()].some((key) => key !== 'concepts')
    ) return { page: 'not-found', conceptIds: emptyConcepts }
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
