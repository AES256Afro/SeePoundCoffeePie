import type { ConceptProgress, LearnerProgress } from '../types'

export const PROGRESS_RECORD_VERSION = 1 as const

export interface RemoteProgressRecord {
  version: typeof PROGRESS_RECORD_VERSION
  revision: number
  updatedAt: string
  progress: LearnerProgress
}

export type ProgressSyncState =
  | 'guest'
  | 'checking'
  | 'needs-choice'
  | 'saving'
  | 'synced'
  | 'offline'
  | 'local-only'
  | 'error'

export type SaveProgressResult =
  | { ok: true; record: RemoteProgressRecord }
  | { ok: false; conflicted: boolean; conflict: RemoteProgressRecord | null; message: string }

const dateValue = (value: string | null): number => value ? Date.parse(`${value}T00:00:00Z`) : 0

function laterDate(left: string | null, right: string | null): string | null {
  return dateValue(left) >= dateValue(right) ? left : right
}

function mergeConcept(
  local: ConceptProgress | undefined,
  remote: ConceptProgress | undefined,
): ConceptProgress | undefined {
  if (!local) return remote
  if (!remote) return local
  const strongest = local.strength >= remote.strength ? local : remote
  return {
    strength: Math.max(local.strength, remote.strength),
    correct: Math.max(local.correct, remote.correct),
    incorrect: Math.max(local.incorrect, remote.incorrect),
    dueAt: strongest.dueAt,
  }
}

export function mergeLearnerProgress(
  local: LearnerProgress,
  remote: LearnerProgress,
): LearnerProgress {
  const conceptIds = [...new Set([
    ...Object.keys(local.conceptProgress),
    ...Object.keys(remote.conceptProgress),
  ])].sort()
  const conceptProgress: Record<string, ConceptProgress> = {}
  for (const conceptId of conceptIds) {
    const merged = mergeConcept(local.conceptProgress[conceptId], remote.conceptProgress[conceptId])
    if (merged) conceptProgress[conceptId] = merged
  }

  const latestDaily = dateValue(local.dailyXpDate) >= dateValue(remote.dailyXpDate) ? local : remote
  const latestStudy = dateValue(local.lastStudyDate) >= dateValue(remote.lastStudyDate) ? local : remote
  return {
    callsign: local.callsign.trim() || remote.callsign,
    activeLanguage: local.activeLanguage,
    dailyGoal: local.dailyGoal,
    xp: Math.max(local.xp, remote.xp),
    dailyXp: latestDaily.dailyXpDate === local.dailyXpDate && local.dailyXpDate === remote.dailyXpDate
      ? Math.max(local.dailyXp, remote.dailyXp)
      : latestDaily.dailyXp,
    dailyXpDate: laterDate(local.dailyXpDate, remote.dailyXpDate),
    starShards: Math.max(local.starShards, remote.starShards),
    streak: Math.max(local.streak, remote.streak),
    lastStudyDate: laterDate(local.lastStudyDate, remote.lastStudyDate),
    completedMissions: [...new Set([
      ...remote.completedMissions,
      ...local.completedMissions,
    ])].sort(),
    conceptProgress,
    onboardingComplete: local.onboardingComplete || remote.onboardingComplete || latestStudy.onboardingComplete,
  }
}

export function hasMeaningfulProgress(progress: LearnerProgress): boolean {
  return progress.onboardingComplete
    || progress.xp > 0
    || progress.completedMissions.length > 0
    || Object.keys(progress.conceptProgress).length > 0
}

export function progressRecordsMatch(left: LearnerProgress, right: LearnerProgress): boolean {
  return JSON.stringify(left) === JSON.stringify(right)
}

async function readJson(response: Response): Promise<Record<string, unknown>> {
  if (!response.headers.get('Content-Type')?.includes('application/json')) return {}
  return response.json() as Promise<Record<string, unknown>>
}

export async function fetchRemoteProgress(signal?: AbortSignal): Promise<RemoteProgressRecord | null> {
  const response = await fetch('/api/progress', {
    credentials: 'same-origin',
    headers: { Accept: 'application/json' },
    signal,
  })
  const body = await readJson(response)
  if (response.status === 401) throw new Error('Sign in again to synchronize progress.')
  if (!response.ok) throw new Error(typeof body.error === 'string' ? body.error : 'Saved progress could not be checked.')
  return (body.record ?? null) as RemoteProgressRecord | null
}

export async function saveRemoteProgress(
  progress: LearnerProgress,
  revision: number,
): Promise<SaveProgressResult> {
  const response = await fetch('/api/progress', {
    method: 'PUT',
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ version: PROGRESS_RECORD_VERSION, revision, progress }),
  })
  const body = await readJson(response)
  if (response.ok) return { ok: true, record: body.record as RemoteProgressRecord }
  return {
    ok: false,
    conflicted: response.status === 409,
    conflict: response.status === 409 ? (body.record as RemoteProgressRecord | null) : null,
    message: typeof body.error === 'string' ? body.error : 'Progress could not be saved to the account.',
  }
}

export async function deleteRemoteProgress(): Promise<void> {
  const response = await fetch('/api/progress', {
    method: 'DELETE',
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ confirmation: 'DELETE MY LEARNING DATA' }),
  })
  const body = await readJson(response)
  if (!response.ok) {
    throw new Error(typeof body.error === 'string' ? body.error : 'Saved learning data could not be deleted.')
  }
}
