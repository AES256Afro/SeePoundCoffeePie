import type { LanguageId } from '../types'
import type { CourseId } from '../types'
import type { CourseDefinition } from '../data/course-registry'
import type {
  AcademyCourseId,
  AcademyModuleId,
  AcademyPathId,
  AcademyPreparationPageId,
  AcademyUnitId,
} from '../data/academy-manifest'
import {
  academyCourseForId,
  academyCourseForRoute,
  academyCourseOwnsModule,
  academyCourseOwnsPreparationPage,
  academyModuleForId,
  academyModuleForRoute,
  academyModuleOwnsUnit,
  academyPathForId,
  academyPathForSlug,
  academyPathOwnsCourse,
  academyPreparationPageForId,
  academyPreparationPageForRoute,
  academyUnitForId,
  academyUnitForRoute,
} from '../data/academy-manifest'
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
  | 'academy-path'
  | 'academy-course'
  | 'academy-module'
  | 'academy-unit'
  | 'academy-preparation'
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
  academyPathId?: AcademyPathId
  academyCourseId?: AcademyCourseId
  academyModuleId?: AcademyModuleId
  academyUnitId?: AcademyUnitId
  academyPreparationPageId?: AcademyPreparationPageId
  missionId?: string
  exerciseId?: string
  projectId?: string
  checkpointId?: string
  practice?: boolean
  practiceStep?: number
  conceptIds: string[]
}

export interface AppRouteCourseOwnership {
  courseDefinitionForSlug: (
    slug: string,
  ) => Pick<CourseDefinition, 'id' | 'language'> | undefined
  courseMissionOwnsLesson: (
    courseId: CourseId,
    missionId: string,
    lessonId: string,
  ) => boolean
}

export type AppRouteParser = (pathname: string, search?: string) => AppRoute

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

function decodePathSegments(pathname: string): string[] | undefined {
  if (pathname === '/') return []
  const rawSegments = pathname.split('/').slice(1)
  const decodedSegments: string[] = []

  for (const segment of rawSegments) {
    let decoded: string
    try {
      decoded = decodeURIComponent(segment)
    } catch {
      return undefined
    }

    if (decoded.includes('/') || decoded.includes('\\') || decoded.includes('\0')) {
      return undefined
    }
    decodedSegments.push(decoded)
  }

  return decodedSegments
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

export function learningPathPath(pathId: AcademyPathId): string {
  const path = academyPathForId(pathId)
  if (!path) throw new Error(`Unknown academy path: ${pathId}`)
  return `/paths/${encodeURIComponent(path.slug)}`
}

export function academyCoursePath(pathId: AcademyPathId, courseId: AcademyCourseId): string {
  const course = academyCourseForId(courseId)
  if (!course || !academyPathOwnsCourse(pathId, courseId)) {
    throw new Error(`Academy path ${pathId} does not contain course ${courseId}`)
  }
  return `${learningPathPath(pathId)}/${encodeURIComponent(course.slug)}`
}

export function academyModulePath(
  pathId: AcademyPathId,
  courseId: AcademyCourseId,
  moduleId: AcademyModuleId,
): string {
  const module = academyModuleForId(moduleId)
  if (!module || !academyCourseOwnsModule(courseId, moduleId)) {
    throw new Error(`Academy course ${courseId} does not contain module ${moduleId}`)
  }
  return `${academyCoursePath(pathId, courseId)}/${encodeURIComponent(module.slug)}`
}

export function academyUnitPath(
  pathId: AcademyPathId,
  courseId: AcademyCourseId,
  moduleId: AcademyModuleId,
  unitId: AcademyUnitId,
): string {
  const unit = academyUnitForId(unitId)
  if (!unit || !academyModuleOwnsUnit(moduleId, unitId)) {
    throw new Error(`Academy module ${moduleId} does not contain unit ${unitId}`)
  }
  return `${academyModulePath(pathId, courseId, moduleId)}/${encodeURIComponent(unit.slug)}`
}

export function academyPreparationPath(
  pathId: AcademyPathId,
  courseId: AcademyCourseId,
  preparationPageId: AcademyPreparationPageId,
): string {
  const page = academyPreparationPageForId(preparationPageId)
  if (!page || !academyCourseOwnsPreparationPage(courseId, preparationPageId)) {
    throw new Error(`Academy course ${courseId} does not contain preparation page ${preparationPageId}`)
  }
  return `${academyCoursePath(pathId, courseId)}/preparation/${encodeURIComponent(page.slug)}`
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

export function createAppRouteParser(
  courseOwnership: AppRouteCourseOwnership,
): AppRouteParser {
  return (pathname: string, search = ''): AppRoute => {
    const emptyConcepts: string[] = []
    const hasEmptyPathSegment = pathname !== '/' && (
      !pathname.startsWith('/')
      || pathname.endsWith('/')
      || pathname.includes('//')
    )
    if (hasEmptyPathSegment) return { page: 'not-found', conceptIds: emptyConcepts }

    const segments = decodePathSegments(pathname)
    if (!segments) return { page: 'not-found', conceptIds: emptyConcepts }

    if (segments.length === 0) return { page: 'landing', conceptIds: emptyConcepts }
    if (segments.length === 1 && segments[0] === 'home') return { page: 'home', conceptIds: emptyConcepts }
    if (segments.length === 1 && segments[0] === 'start') return { page: 'start', conceptIds: emptyConcepts }
    if (segments.length === 1 && segments[0] === 'courses') return { page: 'courses', conceptIds: emptyConcepts }
    if (segments.length === 1 && segments[0] === 'profile') return { page: 'profile', conceptIds: emptyConcepts }
    if (segments.length === 1 && segments[0] === 'settings') return { page: 'settings', conceptIds: emptyConcepts }

    if (segments[0] === 'paths') {
      if (search) return { page: 'not-found', conceptIds: emptyConcepts }

      if (segments.length === 2) {
        const path = academyPathForSlug(segments[1])
        return path
          ? { page: 'academy-path', academyPathId: path.id, conceptIds: emptyConcepts }
          : { page: 'not-found', conceptIds: emptyConcepts }
      }

      if (segments.length === 3) {
        const result = academyCourseForRoute(segments[1], segments[2])
        return result
          ? {
              page: 'academy-course',
              academyPathId: result.pathId,
              academyCourseId: result.id,
              conceptIds: emptyConcepts,
            }
          : { page: 'not-found', conceptIds: emptyConcepts }
      }

      if (segments.length === 4) {
        const result = academyModuleForRoute(segments[1], segments[2], segments[3])
        return result
          ? {
              page: 'academy-module',
              academyPathId: result.pathId,
              academyCourseId: result.courseId,
              academyModuleId: result.id,
              conceptIds: emptyConcepts,
            }
          : { page: 'not-found', conceptIds: emptyConcepts }
      }

      if (segments.length === 5 && segments[3] === 'preparation') {
        const result = academyPreparationPageForRoute(
          segments[1],
          segments[2],
          segments[4],
        )
        return result
          ? {
              page: 'academy-preparation',
              academyPathId: result.pathId,
              academyCourseId: result.courseId,
              academyPreparationPageId: result.id,
              conceptIds: emptyConcepts,
            }
          : { page: 'not-found', conceptIds: emptyConcepts }
      }

      if (segments.length === 5) {
        const result = academyUnitForRoute(
          segments[1],
          segments[2],
          segments[3],
          segments[4],
        )
        return result
          ? {
              page: 'academy-unit',
              academyPathId: result.pathId,
              academyCourseId: result.courseId,
              academyModuleId: result.moduleId,
              academyUnitId: result.id,
              conceptIds: emptyConcepts,
            }
          : { page: 'not-found', conceptIds: emptyConcepts }
      }

      return { page: 'not-found', conceptIds: emptyConcepts }
    }

    if (segments.length === 2 && segments[0] === 'courses') {
      const course = courseOwnership.courseDefinitionForSlug(segments[1])
      return course
        ? { page: 'course', language: course.language, courseId: course.id, conceptIds: emptyConcepts }
        : { page: 'not-found', conceptIds: emptyConcepts }
    }

    if (segments.length === 4 && segments[0] === 'learn') {
      if (search) return { page: 'not-found', conceptIds: emptyConcepts }
      const course = courseOwnership.courseDefinitionForSlug(segments[1])
      if (
        !course
        || !courseOwnership.courseMissionOwnsLesson(course.id, segments[2], segments[3])
      ) {
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
}

const productionAppRouteParser = createAppRouteParser({
  courseDefinitionForSlug,
  courseMissionOwnsLesson,
})

export function parseAppRoute(pathname: string, search = ''): AppRoute {
  return productionAppRouteParser(pathname, search)
}
