import { tracks } from '../data/curriculum'
import type {
  ExerciseType,
  LanguageId,
  LanguageTrack,
  LearnerProgress,
} from '../types'
import { missionAvailability } from './missions'

export type CourseSymbol = 'pi' | 'eye' | 'hash' | 'coffee'
export type CourseStatus = 'not-started' | 'in-progress' | 'complete'
export type CourseAvailability = 'available' | 'locked' | 'coming-soon'
export type CourseModuleKind = 'lessons' | 'guided-project'

export interface CourseLessonModel {
  id: string
  conceptId: string
  moduleId: string
  number: number
  title: string
  eyebrow: string
  prompt: string
  type: ExerciseType
  completed: boolean
  current: boolean
  availability: CourseAvailability
}

export interface CourseModuleModel {
  id: string
  courseId: LanguageId
  number: number
  title: string
  sourceTitle: string
  subtitle: string
  description: string
  duration: string
  kind: CourseModuleKind
  lessonCount: number
  completedLessonCount: number
  progressPercent: number
  completed: boolean
  current: boolean
  availability: CourseAvailability
  currentLessonId: string | null
  lessons: CourseLessonModel[]
}

export interface CourseCardModel {
  id: LanguageId
  slug: string
  title: string
  shortName: string
  symbol: CourseSymbol
  symbolLabel: string
  description: string
  outcome: string
  level: 'Beginner'
  moduleCount: number
  lessonCount: number
  completedModuleCount: number
  completedLessonCount: number
  progressPercent: number
  status: CourseStatus
  active: boolean
  currentModuleId: string | null
  currentModuleTitle: string | null
  currentLessonId: string | null
  currentLessonTitle: string | null
  actionLabel: 'Start course' | 'Continue course' | 'Review course'
}

export interface CourseModel extends CourseCardModel {
  modules: CourseModuleModel[]
}

interface CourseCopy {
  slug: string
  title: string
  symbol: CourseSymbol
  symbolLabel: string
  outcome: string
  moduleTitles: readonly [string, string, string, string, string, string]
}

const SHARED_MODULE_TITLES = [
  'Reading code and variables',
  'Decisions',
  'Collections',
  'Loops',
  'Functions',
  'Guided project',
] as const

const COURSE_COPY: Record<LanguageId, CourseCopy> = {
  python: {
    slug: 'python-foundations',
    title: 'Python Foundations',
    symbol: 'pi',
    symbolLabel: 'Pi',
    outcome: 'Write readable scripts and build a small text adventure.',
    moduleTitles: SHARED_MODULE_TITLES,
  },
  cpp: {
    slug: 'cpp-foundations',
    title: 'C++ Foundations',
    symbol: 'eye',
    symbolLabel: 'Eye',
    outcome: 'Understand compiled programs and build a tactical simulator.',
    moduleTitles: SHARED_MODULE_TITLES,
  },
  csharp: {
    slug: 'csharp-foundations',
    title: 'C# Foundations',
    symbol: 'hash',
    symbolLabel: 'Hash mark',
    outcome: 'Build structured console programs and a small encounter system.',
    moduleTitles: [
      'Reading code and variables',
      'Decisions',
      'Collections',
      'Loops',
      'Methods',
      'Guided project',
    ],
  },
  java: {
    slug: 'java-foundations',
    title: 'Java Foundations',
    symbol: 'coffee',
    symbolLabel: 'Coffee cup',
    outcome: 'Build portable console programs and an expedition planner.',
    moduleTitles: [
      'Reading code and variables',
      'Decisions',
      'Collections',
      'Loops',
      'Methods',
      'Guided project',
    ],
  },
}

function percentage(completed: number, total: number): number {
  if (total === 0) return 0
  return Math.round((completed / total) * 100)
}

function courseHasRecordedActivity(track: LanguageTrack, progress: LearnerProgress): boolean {
  const conceptIds = new Set(track.missions.flatMap((mission) => (
    mission.exercises.map((exercise) => exercise.conceptId)
  )))

  return Object.keys(progress.conceptProgress).some((conceptId) => conceptIds.has(conceptId))
}

function moduleAvailability(
  track: LanguageTrack,
  moduleIndex: number,
  completedMissionIds: string[],
): CourseAvailability {
  if (completedMissionIds.includes(track.missions[moduleIndex].id)) return 'available'

  const availability = missionAvailability(track, moduleIndex, completedMissionIds)
  if (availability === 'available') return 'available'
  if (availability === 'coming-soon') return 'coming-soon'
  return 'locked'
}

function resolveCurrentLocation(
  track: LanguageTrack,
  progress: LearnerProgress,
  activeExerciseId?: string,
): { moduleIndex: number; lessonIndex: number } | null {
  if (activeExerciseId) {
    const activeModuleIndex = track.missions.findIndex((mission) => (
      mission.exercises.some((exercise) => exercise.id === activeExerciseId)
    ))
    const activeModule = track.missions[activeModuleIndex]
    const canOpenActiveModule = activeModuleIndex >= 0
      && moduleAvailability(track, activeModuleIndex, progress.completedMissions) === 'available'

    if (activeModule && canOpenActiveModule) {
      return {
        moduleIndex: activeModuleIndex,
        lessonIndex: activeModule.exercises.findIndex((exercise) => exercise.id === activeExerciseId),
      }
    }
  }

  const moduleIndex = track.missions.findIndex((mission) => (
    mission.exercises.length > 0 && !progress.completedMissions.includes(mission.id)
  ))
  if (moduleIndex < 0) return null

  const availability = moduleAvailability(track, moduleIndex, progress.completedMissions)
  if (availability !== 'available') return null
  return { moduleIndex, lessonIndex: 0 }
}

/**
 * Builds the new course presentation without changing the stored learning model.
 * Mission IDs remain module IDs and exercise IDs remain lesson IDs, so existing
 * routes, evaluator assignments, backups, and completed mission records continue
 * to refer to the same curriculum objects.
 */
export function buildCourseModel(
  track: LanguageTrack,
  progress: LearnerProgress,
  activeExerciseId?: string,
): CourseModel {
  const copy = COURSE_COPY[track.id]
  const currentLocation = resolveCurrentLocation(track, progress, activeExerciseId)
  const completedModuleCount = track.missions.filter((mission) => (
    progress.completedMissions.includes(mission.id)
  )).length
  const lessonCount = track.missions.reduce((sum, mission) => sum + mission.exercises.length, 0)
  const completedLessonCount = track.missions.reduce((sum, mission) => (
    progress.completedMissions.includes(mission.id) ? sum + mission.exercises.length : sum
  ), 0)

  const modules = track.missions.map((mission, moduleIndex): CourseModuleModel => {
    const completed = progress.completedMissions.includes(mission.id)
    const availability = moduleAvailability(track, moduleIndex, progress.completedMissions)
    const current = currentLocation?.moduleIndex === moduleIndex
    const completedLessonCountForModule = completed ? mission.exercises.length : 0
    const lessons = mission.exercises.map((exercise, lessonIndex): CourseLessonModel => ({
      id: exercise.id,
      conceptId: exercise.conceptId,
      moduleId: mission.id,
      number: lessonIndex + 1,
      title: exercise.title,
      eyebrow: exercise.eyebrow,
      prompt: exercise.prompt,
      type: exercise.type,
      completed,
      current: current && currentLocation.lessonIndex === lessonIndex,
      availability,
    }))

    return {
      id: mission.id,
      courseId: track.id,
      number: moduleIndex + 1,
      title: copy.moduleTitles[moduleIndex] ?? mission.title,
      sourceTitle: mission.title,
      subtitle: mission.subtitle,
      description: mission.description,
      duration: mission.duration,
      kind: moduleIndex === track.missions.length - 1 ? 'guided-project' : 'lessons',
      lessonCount: mission.exercises.length,
      completedLessonCount: completedLessonCountForModule,
      progressPercent: percentage(completedLessonCountForModule, mission.exercises.length),
      completed,
      current,
      availability,
      currentLessonId: current
        ? mission.exercises[currentLocation.lessonIndex]?.id ?? null
        : null,
      lessons,
    }
  })

  const currentModule = currentLocation ? modules[currentLocation.moduleIndex] : null
  const currentLesson = currentModule?.lessons[currentLocation?.lessonIndex ?? -1] ?? null
  const complete = completedModuleCount === track.missions.length && track.missions.length > 0
  const hasActivity = completedModuleCount > 0
    || courseHasRecordedActivity(track, progress)
    || Boolean(activeExerciseId && currentLocation)
  const status: CourseStatus = complete ? 'complete' : hasActivity ? 'in-progress' : 'not-started'

  return {
    id: track.id,
    slug: copy.slug,
    title: copy.title,
    shortName: track.shortName,
    symbol: copy.symbol,
    symbolLabel: copy.symbolLabel,
    description: track.description,
    outcome: copy.outcome,
    level: 'Beginner',
    moduleCount: track.missions.length,
    lessonCount,
    completedModuleCount,
    completedLessonCount,
    progressPercent: percentage(completedLessonCount, lessonCount),
    status,
    active: progress.activeLanguage === track.id,
    currentModuleId: currentModule?.id ?? null,
    currentModuleTitle: currentModule?.title ?? null,
    currentLessonId: currentLesson?.id ?? null,
    currentLessonTitle: currentLesson?.title ?? null,
    actionLabel: complete ? 'Review course' : hasActivity ? 'Continue course' : 'Start course',
    modules,
  }
}

export function buildCourseModels(
  progress: LearnerProgress,
  activeExerciseId?: string,
): CourseModel[] {
  return tracks.map((track) => buildCourseModel(track, progress, activeExerciseId))
}

export function buildCourseCards(
  progress: LearnerProgress,
  activeExerciseId?: string,
): CourseCardModel[] {
  return buildCourseModels(progress, activeExerciseId).map((course) => {
    const { modules, ...card } = course
    void modules
    return card
  })
}

export function courseSlugFor(language: LanguageId): string {
  return COURSE_COPY[language].slug
}

export function coursePath(language: LanguageId): string {
  return `/courses/${courseSlugFor(language)}`
}

export function languageForCourseSlug(slug: string): LanguageId | undefined {
  return tracks.find((candidate) => COURSE_COPY[candidate.id].slug === slug)?.id
}

export function courseBySlug(
  slug: string,
  progress: LearnerProgress,
  activeExerciseId?: string,
): CourseModel | undefined {
  const language = languageForCourseSlug(slug)
  const track = language ? tracks.find((candidate) => candidate.id === language) : undefined
  return track ? buildCourseModel(track, progress, activeExerciseId) : undefined
}
