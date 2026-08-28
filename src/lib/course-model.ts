import {
  courseDefinition,
  courseDefinitionForSlug,
  courseDefinitions,
  courseIsAvailable,
  courseMissionLessonIds,
  foundationCourseId,
  missingCoursePrerequisites,
  type CourseKind,
  type CourseModuleKind,
  type CoursePrerequisite,
  type CourseSymbol,
} from '../data/course-registry'
import type {
  CourseId,
  ExerciseType,
  LanguageId,
  LanguageTrack,
  LearnerProgress,
} from '../types'
import { missionAvailability } from './missions'

export type CourseStatus = 'not-started' | 'in-progress' | 'complete'
export type CourseAvailability = 'available' | 'locked' | 'coming-soon'

export function lessonActivityLabel(type: ExerciseType): string {
  if (type === 'bugfix') return 'Fix a problem'
  if (type === 'choice') return 'Choose an answer'
  if (type === 'prediction') return 'Predict the result'
  if (type === 'ordering') return 'Put steps in order'
  return 'Edit code'
}

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
  courseId: CourseId
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
  id: CourseId
  language: LanguageId
  slug: string
  title: string
  shortName: string
  symbol: CourseSymbol
  symbolLabel: string
  description: string
  outcome: string
  kind: CourseKind
  level: string
  availability: 'available' | 'locked'
  missingPrerequisites: CoursePrerequisite[]
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
  actionLabel: 'Start course' | 'Continue course' | 'Review course' | 'View course'
}

export interface CourseModel extends CourseCardModel {
  modules: CourseModuleModel[]
}

export function resumeLessonId(
  moduleLessonIds: readonly string[],
  completedLessonIds: ReadonlySet<string>,
): string | null {
  return moduleLessonIds.find((lessonId) => !completedLessonIds.has(lessonId))
    ?? moduleLessonIds.at(-1)
    ?? null
}

function percentage(completed: number, total: number): number {
  if (total === 0) return 0
  return Math.round((completed / total) * 100)
}

function completedLessonIds(progress: LearnerProgress): Set<string> {
  const completed = new Set(progress.completedLessons)
  for (const definition of courseDefinitions) {
    for (const missionId of definition.missionIds) {
      if (!progress.completedMissions.includes(missionId)) continue
      courseMissionLessonIds(definition.id, missionId).forEach((lessonId) => completed.add(lessonId))
    }
  }
  return completed
}

function courseHasRecordedActivity(track: LanguageTrack, progress: LearnerProgress): boolean {
  const trackLessonIds = new Set(track.missions.flatMap((mission) => (
    mission.exercises.map((exercise) => exercise.id)
  )))
  if (progress.completedLessons.some((lessonId) => trackLessonIds.has(lessonId))) return true
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
  const completedLessons = completedLessonIds(progress)
  const lessonIndex = track.missions[moduleIndex].exercises.findIndex((exercise) => (
    !completedLessons.has(exercise.id)
  ))
  return {
    moduleIndex,
    lessonIndex: lessonIndex >= 0 ? lessonIndex : track.missions[moduleIndex].exercises.length - 1,
  }
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
  const definition = courseDefinition(foundationCourseId(track.id))
  const completedLessons = completedLessonIds(progress)
  const currentLocation = resolveCurrentLocation(track, progress, activeExerciseId)
  const completedModuleCount = track.missions.filter((mission) => (
    progress.completedMissions.includes(mission.id)
  )).length
  const lessonCount = track.missions.reduce((sum, mission) => sum + mission.exercises.length, 0)
  const completedLessonCount = track.missions.reduce((sum, mission) => (
    sum + mission.exercises.filter((exercise) => completedLessons.has(exercise.id)).length
  ), 0)

  const modules = track.missions.map((mission, moduleIndex): CourseModuleModel => {
    const completed = progress.completedMissions.includes(mission.id)
    const availability = moduleAvailability(track, moduleIndex, progress.completedMissions)
    const current = currentLocation?.moduleIndex === moduleIndex
    const completedLessonCountForModule = mission.exercises.filter((exercise) => (
      completedLessons.has(exercise.id)
    )).length
    const lessons = mission.exercises.map((exercise, lessonIndex): CourseLessonModel => ({
      id: exercise.id,
      conceptId: exercise.conceptId,
      moduleId: mission.id,
      number: lessonIndex + 1,
      title: exercise.title,
      eyebrow: exercise.eyebrow,
      prompt: exercise.prompt,
      type: exercise.type,
      completed: completedLessons.has(exercise.id),
      current: current && currentLocation.lessonIndex === lessonIndex,
      availability,
    }))

    return {
      id: mission.id,
      courseId: definition.id,
      number: moduleIndex + 1,
      title: definition.moduleTitles[moduleIndex] ?? mission.title,
      sourceTitle: mission.title,
      subtitle: mission.subtitle,
      description: mission.description,
      duration: mission.duration,
      kind: definition.moduleKinds[moduleIndex] ?? 'lessons',
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
    id: definition.id,
    language: track.id,
    slug: definition.slug,
    title: definition.title,
    shortName: track.shortName,
    symbol: definition.symbol,
    symbolLabel: definition.symbolLabel,
    description: track.description,
    outcome: definition.outcome,
    kind: definition.kind,
    level: definition.level,
    availability: 'available',
    missingPrerequisites: [],
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
  tracks: readonly LanguageTrack[],
  progress: LearnerProgress,
  activeExerciseId?: string,
): CourseModel[] {
  return tracks.map((track) => buildCourseModel(track, progress, activeExerciseId))
}

export function buildCourseCards(
  progress: LearnerProgress,
): CourseCardModel[] {
  return courseDefinitions.map((definition) => buildRegisteredCourseCard(definition.id, progress))
}

export function courseSlugFor(language: LanguageId): string {
  return courseDefinition(foundationCourseId(language)).slug
}

export function coursePath(language: LanguageId): string {
  return `/courses/${courseSlugFor(language)}`
}

export function languageForCourseSlug(slug: string): LanguageId | undefined {
  return courseDefinitionForSlug(slug)?.language
}

export function courseBySlug(
  slug: string,
  progress: LearnerProgress,
  track?: LanguageTrack,
  activeExerciseId?: string,
): CourseModel | undefined {
  const language = languageForCourseSlug(slug)
  const definition = courseDefinitionForSlug(slug)
  if (definition?.kind !== 'foundation') return undefined
  return track && track.id === language ? buildCourseModel(track, progress, activeExerciseId) : undefined
}

export function buildRegisteredCourseCard(
  courseId: CourseId,
  progress: LearnerProgress,
): CourseCardModel {
  const definition = courseDefinition(courseId)
  const completedMissionIds = new Set(progress.completedMissions)
  const completedLessonIdSet = completedLessonIds(progress)
  const completedModuleCount = definition.missionIds.filter((missionId) => completedMissionIds.has(missionId)).length
  const completedLessonCount = definition.lessonIds.filter((lessonId) => completedLessonIdSet.has(lessonId)).length
  const complete = completedModuleCount === definition.missionIds.length && definition.missionIds.length > 0
  const hasActivity = completedModuleCount > 0 || completedLessonCount > 0
  const available = courseIsAvailable(courseId, progress)
  const currentModuleIndex = complete
    ? -1
    : definition.missionIds.findIndex((missionId) => !completedMissionIds.has(missionId))
  const currentModuleId = currentModuleIndex >= 0 ? definition.missionIds[currentModuleIndex] : null
  const currentLessonId = currentModuleId
    ? resumeLessonId(courseMissionLessonIds(courseId, currentModuleId), completedLessonIdSet)
    : null
  const status: CourseStatus = complete ? 'complete' : hasActivity ? 'in-progress' : 'not-started'

  return {
    id: definition.id,
    language: definition.language,
    slug: definition.slug,
    title: definition.title,
    shortName: definition.shortName,
    symbol: definition.symbol,
    symbolLabel: definition.symbolLabel,
    description: definition.description,
    outcome: definition.outcome,
    kind: definition.kind,
    level: definition.level,
    availability: available ? 'available' : 'locked',
    missingPrerequisites: missingCoursePrerequisites(courseId, progress),
    moduleCount: definition.missionIds.length,
    lessonCount: definition.lessonIds.length,
    completedModuleCount,
    completedLessonCount,
    progressPercent: percentage(completedLessonCount, definition.lessonIds.length),
    status,
    active: progress.activeLanguage === definition.language,
    currentModuleId,
    currentModuleTitle: currentModuleIndex >= 0 ? definition.moduleTitles[currentModuleIndex] ?? null : null,
    currentLessonId,
    currentLessonTitle: null,
    actionLabel: !available
      ? 'View course'
      : complete
        ? 'Review course'
        : hasActivity
          ? 'Continue course'
          : 'Start course',
  }
}
