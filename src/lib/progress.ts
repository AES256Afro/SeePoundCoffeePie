import { projectManifests } from '../data/project-manifests'
import { tracks } from '../data/curriculum'
import type { ConceptProgress, LanguageId, LearnerProgress } from '../types'
import { normalizeLocalLearnerProgress } from './progress-schema'

const REVIEW_INTERVALS = [0, 1, 3, 7, 14, 30]
const lessons = tracks.flatMap((track) => track.missions.flatMap((mission) => (
  mission.exercises.map((exercise) => ({
    conceptId: exercise.conceptId,
    id: exercise.id,
    missionId: mission.id,
    xp: exercise.xp,
  }))
)))
const lessonsById = new Map(lessons.map((lesson) => [lesson.id, lesson]))
const lessonIds: ReadonlySet<string> = new Set(lessonsById.keys())
const missionLessons = new Map(tracks.flatMap((track) => track.missions.map((mission) => (
  [mission.id, mission.exercises.map((exercise) => exercise.id)] as const
))))
const projectCheckpointIds = new Set(projectManifests.flatMap((project) => (
  project.checkpoints.map((checkpoint) => checkpoint.id)
)))
const projectIds: ReadonlySet<string> = new Set(projectManifests.map((project) => project.id))
const progressStorageKey = 'see-pound-coffee-pie-progress'
const lessonCompletionJournalKey = 'see-pound-coffee-pie-completed-lessons-v1'

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
  lessonId: string,
  awardXp = true,
  now = new Date(),
): LearnerProgress {
  const lesson = lessonsById.get(lessonId)
  if (!lesson) return current
  const completedLessons = knownIds(current.completedLessons, lessonIds)
  const alreadyCompleted = completedLessons.includes(lessonId)
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
      : [...completedLessons, lessonId],
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

export function loadProgress(): LearnerProgress {
  let restored = initialProgress()
  try {
    const stored = window.localStorage.getItem(progressStorageKey)
    if (stored) {
      const parsed: unknown = JSON.parse(stored)
      restored = normalizeLocalLearnerProgress(parsed, initialProgress())
    }
  } catch {
    restored = initialProgress()
  }

  try {
    const journal = JSON.parse(window.localStorage.getItem(lessonCompletionJournalKey) ?? '[]')
    return {
      ...restored,
      completedLessons: [...new Set([
        ...restored.completedLessons,
        ...knownIds(journal, lessonIds),
      ])],
    }
  } catch {
    return restored
  }
}

export function saveProgress(progress: LearnerProgress): void {
  try {
    const completedLessons = knownIds(progress.completedLessons, lessonIds)
    // This separate journal survives writes from an already-open pre-Phase 4F
    // tab, which knows the main key but cannot preserve per-lesson progress.
    window.localStorage.setItem(lessonCompletionJournalKey, JSON.stringify(completedLessons))
    window.localStorage.setItem(progressStorageKey, JSON.stringify({
      ...progress,
      completedLessons,
      completedProjectCheckpoints: knownIds(progress.completedProjectCheckpoints, projectCheckpointIds),
      completedProjects: knownIds(progress.completedProjects, projectIds),
    }))
  } catch {
    // React state remains usable when the browser refuses or runs out of local storage.
  }
}
