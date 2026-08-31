import { projectManifests } from '../data/project-manifests'
import { academyModuleUnitIds, academyUnits } from '../data/academy-manifest'
import {
  foundationLessonIds,
  foundationLessonMetadataById,
  foundationMissionLessonIds,
} from '../data/foundation-curriculum-index'
import {
  cppCollectionsRecordsLessons,
  cppCollectionsRecordsManifest,
} from '../data/cpp-collections-records-manifest'
import {
  pythonDataToolsLessons,
  pythonDataToolsManifest,
} from '../data/python-data-tools-manifest'
import type { ConceptProgress, LanguageId, LearnerProgress } from '../types'
import { normalizeLocalLearnerProgress } from './progress-schema'
import { mergeLearnerProgress } from './progress-sync'

const REVIEW_INTERVALS = [0, 1, 3, 7, 14, 30]

export interface LessonCompletionMetadata {
  conceptId: string
  id: string
  xp: number
}

const registeredContinuingLessons = [
  ...pythonDataToolsLessons,
  ...cppCollectionsRecordsLessons,
]
const continuingLessonsById = new Map<string, LessonCompletionMetadata>(
  registeredContinuingLessons.map((lesson) => [lesson.id, lesson]),
)
const academyLessonsById = new Map<string, LessonCompletionMetadata>(
  academyUnits.map(({ conceptId, id, xp }) => [id, { conceptId, id, xp }]),
)
const lessonIds: ReadonlySet<string> = new Set([
  ...foundationLessonIds,
  ...continuingLessonsById.keys(),
  ...academyLessonsById.keys(),
])
if (
  continuingLessonsById.size !== registeredContinuingLessons.length
  || registeredContinuingLessons.some((lesson) => foundationLessonIds.has(lesson.id))
  || academyLessonsById.size !== academyUnits.length
  || academyUnits.some((lesson) => (
    foundationLessonIds.has(lesson.id) || continuingLessonsById.has(lesson.id)
  ))
) {
  throw new Error('Registered lesson IDs must be globally unique.')
}
const missionLessons = new Map([
  ...foundationMissionLessonIds,
  ...Object.entries(pythonDataToolsManifest).map(([missionId, missionLessons]) => (
    [missionId, missionLessons.map((lesson) => lesson.id)] as const
  )),
  ...Object.entries(cppCollectionsRecordsManifest).map(([missionId, missionLessons]) => (
    [missionId, missionLessons.map((lesson) => lesson.id)] as const
  )),
  ...Object.entries(academyModuleUnitIds),
])
const projectCheckpointIds = new Set(projectManifests.flatMap((project) => (
  project.checkpoints.map((checkpoint) => checkpoint.id)
)))
const projectIds: ReadonlySet<string> = new Set(projectManifests.map((project) => project.id))
const legacyProgressStorageKey = 'see-pound-coffee-pie-progress'
const phase5aProgressStorageKey = 'see-pound-coffee-pie-progress-v2'
const progressStorageKey = 'see-pound-coffee-pie-progress-v3'
const legacyLessonCompletionJournalKey = 'see-pound-coffee-pie-completed-lessons-v1'
const phase5aLessonCompletionJournalKey = 'see-pound-coffee-pie-completed-lessons-v2'
const lessonCompletionJournalKey = 'see-pound-coffee-pie-completed-lessons-v3'
const progressResetBarrierKey = 'see-pound-coffee-pie-progress-v3-reset'

interface SaveProgressOptions {
  reset?: boolean
}

function addSafeCount(current: number, increment: number): number {
  const safeCurrent = Number.isSafeInteger(current) && current >= 0 ? current : 0
  if (!Number.isSafeInteger(increment) || increment <= 0) return safeCurrent
  return safeCurrent > Number.MAX_SAFE_INTEGER - increment
    ? Number.MAX_SAFE_INTEGER
    : safeCurrent + increment
}

function knownIds(value: unknown, allowed: ReadonlySet<string>): string[] {
  if (!Array.isArray(value)) return []
  return [...new Set(value.filter((id): id is string => typeof id === 'string' && allowed.has(id)))]
}

export function dateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export function nextStreak(current: LearnerProgress, now: Date): number {
  if (!current.lastStudyDate) return 1

  const today = dateKey(now)
  if (current.lastStudyDate === today) return Math.max(1, current.streak)

  const [lastYear, lastMonth, lastDay] = current.lastStudyDate.split('-').map(Number)
  const lastUtc = Date.UTC(lastYear, lastMonth - 1, lastDay)
  const todayUtc = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
  const daysApart = Math.round((todayUtc - lastUtc) / 86_400_000)

  return daysApart === 1 ? Math.max(1, addSafeCount(current.streak, 1)) : 1
}

export function initialProgress(activeLanguage: LanguageId = 'python'): LearnerProgress {
  return {
    callsign: '',
    activeLanguage,
    dailyGoal: 10,
    xp: 0,
    dailyXp: 0,
    dailyXpDate: null,
    starShards: 0,
    streak: 0,
    lastStudyDate: null,
    completedLessons: [],
    completedMissions: [],
    completedProjectCheckpoints: [],
    completedProjects: [],
    conceptProgress: {},
    onboardingComplete: false,
  }
}

export function updateConcept(
  existing: ConceptProgress | undefined,
  correct: boolean,
  now: Date,
): ConceptProgress {
  const previous = existing ?? {
    strength: 0,
    correct: 0,
    incorrect: 0,
    dueAt: dateKey(now),
  }
  const strength = correct
    ? Math.min(REVIEW_INTERVALS.length - 1, previous.strength + 1)
    : Math.max(0, previous.strength - 1)
  const interval = correct ? REVIEW_INTERVALS[strength] : 0

  return {
    strength,
    correct: addSafeCount(previous.correct, correct ? 1 : 0),
    incorrect: addSafeCount(previous.incorrect, correct ? 0 : 1),
    dueAt: dateKey(addDays(now, interval)),
  }
}

export function recordAttempt(
  current: LearnerProgress,
  conceptId: string,
  correct: boolean,
  earnedXp: number,
  now = new Date(),
): LearnerProgress {
  const today = dateKey(now)
  const earnedToday = current.dailyXpDate === today ? current.dailyXp : 0
  return {
    ...current,
    xp: addSafeCount(current.xp, correct ? earnedXp : 0),
    dailyXp: addSafeCount(earnedToday, correct ? earnedXp : 0),
    dailyXpDate: today,
    conceptProgress: {
      ...current.conceptProgress,
      [conceptId]: updateConcept(current.conceptProgress[conceptId], correct, now),
    },
  }
}

export function recordLessonSuccess(
  current: LearnerProgress,
  lesson: LessonCompletionMetadata,
  awardXp = true,
  now = new Date(),
): LearnerProgress {
  const foundationLesson = foundationLessonMetadataById.get(lesson.id)
  const continuingLesson = continuingLessonsById.get(lesson.id)
  const academyLesson = academyLessonsById.get(lesson.id)
  const registeredConceptId = foundationLesson?.[1] ?? continuingLesson?.conceptId ?? academyLesson?.conceptId
  const registeredXp = foundationLesson?.[2] ?? continuingLesson?.xp ?? academyLesson?.xp
  if (
    registeredConceptId === undefined
    || registeredConceptId !== lesson.conceptId
    || registeredXp !== lesson.xp
  ) return current
  const completedLessons = knownIds(current.completedLessons, lessonIds)
  const alreadyCompleted = completedLessons.includes(lesson.id)
  const withAttempt = recordAttempt(
    current,
    lesson.conceptId,
    true,
    awardXp && !alreadyCompleted ? lesson.xp : 0,
    now,
  )
  return {
    ...withAttempt,
    completedLessons: alreadyCompleted
      ? completedLessons
      : [...completedLessons, lesson.id],
  }
}

export function completeMission(
  current: LearnerProgress,
  missionId: string,
  now = new Date(),
): LearnerProgress {
  const completedMissionLessons = missionLessons.get(missionId)
  if (!completedMissionLessons) return current
  const alreadyCompleted = current.completedMissions.includes(missionId)
  return {
    ...current,
    completedLessons: [...new Set([
      ...knownIds(current.completedLessons, lessonIds),
      ...completedMissionLessons,
    ])],
    completedMissions: alreadyCompleted
      ? current.completedMissions
      : [...current.completedMissions, missionId],
    starShards: addSafeCount(current.starShards, alreadyCompleted ? 0 : 25),
    streak: nextStreak(current, now),
    lastStudyDate: dateKey(now),
  }
}

export function completeProjectCheckpoint(
  current: LearnerProgress,
  projectId: string,
  checkpointId: string,
  now = new Date(),
): LearnerProgress {
  const project = projectManifests.find((candidate) => candidate.id === projectId)
  const checkpoint = project?.checkpoints.find((candidate) => candidate.id === checkpointId)
  const completedCheckpoints = knownIds(current.completedProjectCheckpoints, projectCheckpointIds)
  if (!checkpoint || completedCheckpoints.includes(checkpointId)) return current

  const withAttempt = recordAttempt(
    current,
    checkpoint.conceptId,
    true,
    checkpoint.xp,
    now,
  )
  return {
    ...withAttempt,
    completedProjectCheckpoints: [...completedCheckpoints, checkpointId],
  }
}

export function completeProject(
  current: LearnerProgress,
  projectId: string,
  now = new Date(),
): LearnerProgress {
  const completedProjects = knownIds(current.completedProjects, projectIds)
  if (!projectIds.has(projectId) || completedProjects.includes(projectId)) return current
  return {
    ...current,
    completedProjects: [...completedProjects, projectId],
    starShards: addSafeCount(current.starShards, 50),
    streak: nextStreak(current, now),
    lastStudyDate: dateKey(now),
  }
}

export function isDue(concept: ConceptProgress, now = new Date()): boolean {
  return concept.dueAt <= dateKey(now)
}

function storedProgress(key: string): LearnerProgress | null {
  try {
    const stored = window.localStorage.getItem(key)
    if (stored === null) return null
    const parsed: unknown = JSON.parse(stored)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null
    return normalizeLocalLearnerProgress(parsed, initialProgress())
  } catch {
    return null
  }
}

function storedCompletionJournal(key: string): string[] {
  try {
    return knownIds(JSON.parse(window.localStorage.getItem(key) ?? '[]'), lessonIds)
  } catch {
    return []
  }
}

function resetBarrierIsActive(): boolean {
  try {
    const parsed: unknown = JSON.parse(
      window.localStorage.getItem(progressResetBarrierKey) ?? 'null',
    )
    return Boolean(
      parsed
      && typeof parsed === 'object'
      && !Array.isArray(parsed)
      && (parsed as Record<string, unknown>).version === 1
      && (parsed as Record<string, unknown>).active === true,
    )
  } catch {
    return false
  }
}

export function loadProgress(): LearnerProgress {
  const resetBarrier = resetBarrierIsActive()
  const current = storedProgress(progressStorageKey)
  const restored = resetBarrier
    ? current ?? initialProgress()
    : [
        current,
        storedProgress(phase5aProgressStorageKey),
        storedProgress(legacyProgressStorageKey),
      ].reduce<LearnerProgress | null>((merged, candidate) => {
        if (!candidate) return merged
        return merged ? mergeLearnerProgress(merged, candidate) : candidate
      }, null) ?? initialProgress()
  const journalKeys = resetBarrier
    ? [lessonCompletionJournalKey]
    : [
        lessonCompletionJournalKey,
        phase5aLessonCompletionJournalKey,
        legacyLessonCompletionJournalKey,
      ]
  return {
    ...restored,
    completedLessons: [...new Set([
      ...restored.completedLessons,
      ...journalKeys.flatMap(storedCompletionJournal),
    ])],
  }
}

export function saveProgress(
  progress: LearnerProgress,
  options: SaveProgressOptions = {},
): void {
  try {
    if (options.reset) {
      window.localStorage.setItem(progressResetBarrierKey, JSON.stringify({
        version: 1,
        active: true,
      }))
    }
    const completedLessons = knownIds(progress.completedLessons, lessonIds)
    // This separate journal survives writes from an already-open pre-Phase 4F
    // tab, which knows the main key but cannot preserve per-lesson progress.
    const serializedLessons = JSON.stringify(completedLessons)
    const serializedProgress = JSON.stringify({
      ...progress,
      completedLessons,
      completedProjectCheckpoints: knownIds(progress.completedProjectCheckpoints, projectCheckpointIds),
      completedProjects: knownIds(progress.completedProjects, projectIds),
    })
    window.localStorage.setItem(lessonCompletionJournalKey, serializedLessons)
    window.localStorage.setItem(progressStorageKey, serializedProgress)
    // Keep writing the V2 and legacy keys for already-open tabs and related
    // local tools. New code always reads V3 first, so an older tab cannot erase
    // Phase 5B IDs from the authoritative local record.
    window.localStorage.setItem(phase5aLessonCompletionJournalKey, serializedLessons)
    window.localStorage.setItem(phase5aProgressStorageKey, serializedProgress)
    window.localStorage.setItem(legacyLessonCompletionJournalKey, serializedLessons)
    window.localStorage.setItem(legacyProgressStorageKey, serializedProgress)
  } catch {
    // React state remains usable when the browser refuses or runs out of local storage.
  }
}
