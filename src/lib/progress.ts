import { pythonInteractiveProjectManifest as pythonInteractiveProject } from '../data/python-interactive-project-manifest'
import type { ConceptProgress, LanguageId, LearnerProgress } from '../types'

const REVIEW_INTERVALS = [0, 1, 3, 7, 14, 30]
const projectCheckpointIds = new Set(pythonInteractiveProject.checkpoints.map((checkpoint) => checkpoint.id))
const projectIds: ReadonlySet<string> = new Set([pythonInteractiveProject.id])

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

  return daysApart === 1 ? Math.max(1, current.streak + 1) : 1
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
    correct: previous.correct + (correct ? 1 : 0),
    incorrect: previous.incorrect + (correct ? 0 : 1),
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
    xp: current.xp + (correct ? earnedXp : 0),
    dailyXp: earnedToday + (correct ? earnedXp : 0),
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
    starShards: current.starShards + (alreadyCompleted ? 0 : 25),
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
  if (projectId !== pythonInteractiveProject.id) return current
  const checkpoint = pythonInteractiveProject.checkpoints.find((candidate) => candidate.id === checkpointId)
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
    starShards: current.starShards + 50,
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
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return initialProgress()
    const storedProgress = parsed as Partial<LearnerProgress>
    return {
      ...initialProgress(),
      ...storedProgress,
      completedProjectCheckpoints: knownIds(storedProgress.completedProjectCheckpoints, projectCheckpointIds),
      completedProjects: knownIds(storedProgress.completedProjects, projectIds),
    }
  } catch {
    return initialProgress()
  }
}

export function saveProgress(progress: LearnerProgress): void {
  window.localStorage.setItem('see-pound-coffee-pie-progress', JSON.stringify({
    ...progress,
    completedProjectCheckpoints: knownIds(progress.completedProjectCheckpoints, projectCheckpointIds),
    completedProjects: knownIds(progress.completedProjects, projectIds),
  }))
}
