import { foundationConceptIds } from '../data/foundation-concept-ids'
import {
  academyConceptIds,
  academyModuleIds,
  academyModuleUnitIds,
  academyUnitIds,
} from '../data/academy-manifest'
import {
  foundationLessonIds,
  foundationMissionIds,
  foundationMissionLessonIds,
} from '../data/foundation-curriculum-index'
import { foundationTrackMetadata } from '../data/foundation-track-metadata'
import {
  cppCollectionsRecordsLessons,
  cppCollectionsRecordsManifest,
  cppCollectionsRecordsMissionIds,
} from '../data/cpp-collections-records-manifest'
import { projectManifests } from '../data/project-manifests'
import {
  pythonDataToolsLessons,
  pythonDataToolsManifest,
  pythonDataToolsMissionIds,
} from '../data/python-data-tools-manifest'
import type { ConceptProgress, LanguageId, LearnerProgress } from '../types'

const languages = new Set<LanguageId>(foundationTrackMetadata.map((track) => track.id))
const missionIds = new Set([
  ...foundationMissionIds,
  ...pythonDataToolsMissionIds,
  ...cppCollectionsRecordsMissionIds,
  ...academyModuleIds,
])
const lessonIds = new Set([
  ...foundationLessonIds,
  ...pythonDataToolsLessons.map((lesson) => lesson.id),
  ...cppCollectionsRecordsLessons.map((lesson) => lesson.id),
  ...academyUnitIds,
])
const projectIds = new Set(projectManifests.map((project) => project.id))
const projectCheckpointIds = new Set(projectManifests.flatMap((project) => (
  project.checkpoints.map((checkpoint) => checkpoint.id)
)))
const conceptIds = new Set([
  ...foundationConceptIds,
  ...projectManifests.flatMap((project) => project.checkpoints.map((checkpoint) => checkpoint.conceptId)),
  ...pythonDataToolsLessons.map((lesson) => lesson.conceptId),
  ...cppCollectionsRecordsLessons.map((lesson) => lesson.conceptId),
  ...academyConceptIds,
])
const datePattern = /^\d{4}-\d{2}-\d{2}$/u

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function isSafeCount(value: unknown): value is number {
  return Number.isSafeInteger(value) && Number(value) >= 0
}

export function isDateKey(value: unknown): value is string {
  if (typeof value !== 'string' || !datePattern.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  const parsed = new Date(Date.UTC(year, month - 1, day))
  return parsed.getUTCFullYear() === year
    && parsed.getUTCMonth() === month - 1
    && parsed.getUTCDate() === day
}

function readConceptProgress(value: unknown): ConceptProgress | null {
  if (!isRecord(value)) return null
  if (!Number.isInteger(value.strength) || Number(value.strength) < 0 || Number(value.strength) > 5) return null
  if (!isSafeCount(value.correct) || !isSafeCount(value.incorrect) || !isDateKey(value.dueAt)) return null

  return {
    strength: Number(value.strength),
    correct: value.correct,
    incorrect: value.incorrect,
    dueAt: value.dueAt,
  }
}

function readCompletionIds(value: unknown, knownIds: ReadonlySet<string>): string[] | null {
  if (value === undefined) return []
  if (!Array.isArray(value) || !value.every((id) => typeof id === 'string' && knownIds.has(id))) return null
  if (new Set(value).size !== value.length) return null
  return [...value]
}

function normalizedCompletionIds(
  value: unknown,
  fallback: string[],
  knownIds: ReadonlySet<string>,
): string[] {
  if (!Array.isArray(value)) return [...fallback]
  return [...new Set(value.filter((id): id is string => typeof id === 'string' && knownIds.has(id)))]
}

function normalizedConceptProgress(
  value: unknown,
  fallback: Record<string, ConceptProgress>,
): Record<string, ConceptProgress> {
  if (!isRecord(value)) return { ...fallback }
  const normalized: Record<string, ConceptProgress> = {}
  for (const [conceptId, concept] of Object.entries(value)) {
    if (!conceptIds.has(conceptId)) continue
    const parsed = readConceptProgress(concept)
    if (parsed) normalized[conceptId] = parsed
  }
  return normalized
}

function lessonsFromCompletedMissions(completedMissions: string[]): string[] {
  const completed = new Set(completedMissions)
  const foundationLessons = [...foundationMissionLessonIds].flatMap(([missionId, lessonIds]) => (
    completed.has(missionId) ? lessonIds : []
  ))
  const dataToolsLessons = Object.entries(pythonDataToolsManifest).flatMap(([missionId, lessons]) => (
    completed.has(missionId) ? lessons.map((lesson) => lesson.id) : []
  ))
  const collectionsRecordsLessons = Object.entries(cppCollectionsRecordsManifest)
    .flatMap(([missionId, lessons]) => (
      completed.has(missionId) ? lessons.map((lesson) => lesson.id) : []
    ))
  const academyLessons = Object.entries(academyModuleUnitIds).flatMap(([moduleId, unitIds]) => (
    completed.has(moduleId) ? unitIds : []
  ))
  return [...foundationLessons, ...dataToolsLessons, ...collectionsRecordsLessons, ...academyLessons]
}

function withCompletedMissionLessons(completedLessons: string[], completedMissions: string[]): string[] {
  return [...new Set([
    ...completedLessons,
    ...lessonsFromCompletedMissions(completedMissions),
  ])]
}

export function parseLearnerProgress(value: unknown): LearnerProgress | null {
  if (!isRecord(value)) return null
  if (typeof value.callsign !== 'string' || value.callsign.length > 80) return null
  if (typeof value.activeLanguage !== 'string' || !languages.has(value.activeLanguage as LanguageId)) return null
  if (!Number.isInteger(value.dailyGoal) || Number(value.dailyGoal) < 1 || Number(value.dailyGoal) > 120) return null
  if (!isSafeCount(value.xp) || !isSafeCount(value.dailyXp) || !isSafeCount(value.starShards) || !isSafeCount(value.streak)) return null
  if (value.dailyXpDate !== null && !isDateKey(value.dailyXpDate)) return null
  if (value.lastStudyDate !== null && !isDateKey(value.lastStudyDate)) return null
  if (typeof value.onboardingComplete !== 'boolean') return null

  if (!Array.isArray(value.completedMissions)) return null
  const completedMissions = readCompletionIds(value.completedMissions, missionIds)
  const completedLessons = readCompletionIds(value.completedLessons, lessonIds)
  const completedProjectCheckpoints = readCompletionIds(value.completedProjectCheckpoints, projectCheckpointIds)
  const completedProjects = readCompletionIds(value.completedProjects, projectIds)
  if (!completedMissions || !completedLessons || !completedProjectCheckpoints || !completedProjects) return null

  if (!isRecord(value.conceptProgress)) return null
  const restoredConcepts: Record<string, ConceptProgress> = {}
  for (const [conceptId, concept] of Object.entries(value.conceptProgress)) {
    if (!conceptIds.has(conceptId)) return null
    const restored = readConceptProgress(concept)
    if (!restored) return null
    restoredConcepts[conceptId] = restored
  }

  return {
    callsign: value.callsign,
    activeLanguage: value.activeLanguage as LanguageId,
    dailyGoal: Number(value.dailyGoal),
    xp: value.xp,
    dailyXp: value.dailyXp,
    dailyXpDate: value.dailyXpDate as string | null,
    starShards: value.starShards,
    streak: value.streak,
    lastStudyDate: value.lastStudyDate as string | null,
    completedLessons: withCompletedMissionLessons(completedLessons, completedMissions),
    completedMissions,
    completedProjectCheckpoints,
    completedProjects,
    conceptProgress: restoredConcepts,
    onboardingComplete: value.onboardingComplete,
  }
}

export function normalizeLocalLearnerProgress(
  value: unknown,
  fallback: LearnerProgress,
): LearnerProgress {
  if (!isRecord(value)) return { ...fallback, conceptProgress: { ...fallback.conceptProgress } }

  const completedMissions = normalizedCompletionIds(value.completedMissions, fallback.completedMissions, missionIds)
  const completedLessons = normalizedCompletionIds(
    value.completedLessons,
    fallback.completedLessons,
    lessonIds,
  )

  return {
    callsign: typeof value.callsign === 'string' && value.callsign.length <= 80
      ? value.callsign
      : fallback.callsign,
    activeLanguage: typeof value.activeLanguage === 'string' && languages.has(value.activeLanguage as LanguageId)
      ? value.activeLanguage as LanguageId
      : fallback.activeLanguage,
    dailyGoal: Number.isInteger(value.dailyGoal) && Number(value.dailyGoal) >= 1 && Number(value.dailyGoal) <= 120
      ? Number(value.dailyGoal)
      : fallback.dailyGoal,
    xp: isSafeCount(value.xp) ? value.xp : fallback.xp,
    dailyXp: isSafeCount(value.dailyXp) ? value.dailyXp : fallback.dailyXp,
    dailyXpDate: value.dailyXpDate === null || isDateKey(value.dailyXpDate)
      ? value.dailyXpDate
      : fallback.dailyXpDate,
    starShards: isSafeCount(value.starShards) ? value.starShards : fallback.starShards,
    streak: isSafeCount(value.streak) ? value.streak : fallback.streak,
    lastStudyDate: value.lastStudyDate === null || isDateKey(value.lastStudyDate)
      ? value.lastStudyDate
      : fallback.lastStudyDate,
    completedLessons: withCompletedMissionLessons(completedLessons, completedMissions),
    completedMissions,
    completedProjectCheckpoints: normalizedCompletionIds(
      value.completedProjectCheckpoints,
      fallback.completedProjectCheckpoints,
      projectCheckpointIds,
    ),
    completedProjects: normalizedCompletionIds(value.completedProjects, fallback.completedProjects, projectIds),
    conceptProgress: normalizedConceptProgress(value.conceptProgress, fallback.conceptProgress),
    onboardingComplete: typeof value.onboardingComplete === 'boolean'
      ? value.onboardingComplete
      : fallback.onboardingComplete,
  }
}
