import { projectManifests } from '../data/project-manifests'
import type { ConceptProgress, LanguageId, LearnerProgress } from '../types'
import { normalizeLocalLearnerProgress } from './progress-schema'

const REVIEW_INTERVALS = [0, 1, 3, 7, 14, 30]
const projectCheckpointIds = new Set(projectManifests.flatMap((project) => (
  project.checkpoints.map((checkpoint) => checkpoint.id)
)))
const projectIds: ReadonlySet<string> = new Set(projectManifests.map((project) => project.id))

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

export function completeMission(
  current: LearnerProgress,
  missionId: string,
  now = new Date(),
): LearnerProgress {
  const alreadyCompleted = current.completedMissions.includes(missionId)
  return {
    ...current,
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
  try {
    const stored = window.localStorage.getItem('see-pound-coffee-pie-progress')
    if (!stored) return initialProgress()
    const parsed: unknown = JSON.parse(stored)
    return normalizeLocalLearnerProgress(parsed, initialProgress())
  } catch {
    return initialProgress()
  }
}

export function saveProgress(progress: LearnerProgress): void {
  try {
    window.localStorage.setItem('see-pound-coffee-pie-progress', JSON.stringify({
      ...progress,
      completedProjectCheckpoints: knownIds(progress.completedProjectCheckpoints, projectCheckpointIds),
      completedProjects: knownIds(progress.completedProjects, projectIds),
    }))
  } catch {
    // React state remains usable when the browser refuses or runs out of local storage.
  }
}
