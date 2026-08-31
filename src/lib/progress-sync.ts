import { projectManifests } from '../data/project-manifests'
import { academyModuleUnitIds, academyUnitIds } from '../data/academy-manifest'
import {
  foundationLessonIds,
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
import type { ConceptProgress, LearnerProgress } from '../types'
import { parseLearnerProgress } from './progress-schema'

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

const projectIds = new Set(projectManifests.map((project) => project.id))
const lessonIds = new Set([
  ...foundationLessonIds,
  ...pythonDataToolsLessons.map((lesson) => lesson.id),
  ...cppCollectionsRecordsLessons.map((lesson) => lesson.id),
  ...academyUnitIds,
])
const missionLessonIds = new Map([
  ...foundationMissionLessonIds,
  ...Object.entries(pythonDataToolsManifest).map(([missionId, lessons]) => (
    [missionId, lessons.map((lesson) => lesson.id)] as const
  )),
  ...Object.entries(cppCollectionsRecordsManifest).map(([missionId, lessons]) => (
    [missionId, lessons.map((lesson) => lesson.id)] as const
  )),
  ...Object.entries(academyModuleUnitIds),
])
const projectCheckpointIds = new Set(projectManifests.flatMap((project) => (
  project.checkpoints.map((checkpoint) => checkpoint.id)
)))

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
  const dueAt = local.strength > remote.strength
    ? local.dueAt
    : remote.strength > local.strength
      ? remote.dueAt
      : local.dueAt <= remote.dueAt ? local.dueAt : remote.dueAt
  return {
    strength: Math.max(local.strength, remote.strength),
    correct: Math.max(local.correct, remote.correct),
    incorrect: Math.max(local.incorrect, remote.incorrect),
    dueAt,
  }
}

function completionIds(
  value: unknown,
  knownIds: ReadonlySet<string>,
): string[] {
  if (!Array.isArray(value)) return []
  return [...new Set(value.filter((id): id is string => typeof id === 'string' && knownIds.has(id)))]
}

function completedLessonsFor(progress: LearnerProgress): string[] {
  return [...new Set([
    ...completionIds(progress.completedLessons, lessonIds),
    ...progress.completedMissions.flatMap((missionId) => missionLessonIds.get(missionId) ?? []),
  ])]
}

function withCompletionDefaults(progress: LearnerProgress): LearnerProgress {
  return {
    ...progress,
    completedLessons: completedLessonsFor(progress),
    completedProjectCheckpoints: completionIds(
      progress.completedProjectCheckpoints,
      projectCheckpointIds,
    ),
    completedProjects: completionIds(progress.completedProjects, projectIds),
  }
}

function canonicalProgress(progress: LearnerProgress): LearnerProgress {
  const normalized = withCompletionDefaults(progress)
  return {
    callsign: normalized.callsign,
    activeLanguage: normalized.activeLanguage,
    dailyGoal: normalized.dailyGoal,
    xp: normalized.xp,
    dailyXp: normalized.dailyXp,
    dailyXpDate: normalized.dailyXpDate,
    starShards: normalized.starShards,
    streak: normalized.streak,
    lastStudyDate: normalized.lastStudyDate,
    completedLessons: [...normalized.completedLessons].sort(),
    completedMissions: [...normalized.completedMissions].sort(),
    completedProjectCheckpoints: [...normalized.completedProjectCheckpoints].sort(),
    completedProjects: [...normalized.completedProjects].sort(),
    conceptProgress: Object.fromEntries(
      Object.entries(normalized.conceptProgress).sort(([left], [right]) => left.localeCompare(right)),
    ),
    onboardingComplete: normalized.onboardingComplete,
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
    completedLessons: [...new Set([
      ...completedLessonsFor(remote),
      ...completedLessonsFor(local),
    ])].sort(),
    completedMissions: [...new Set([
      ...remote.completedMissions,
      ...local.completedMissions,
    ])].sort(),
    completedProjectCheckpoints: [...new Set([
      ...completionIds(remote.completedProjectCheckpoints, projectCheckpointIds),
      ...completionIds(local.completedProjectCheckpoints, projectCheckpointIds),
    ])].sort(),
    completedProjects: [...new Set([
      ...completionIds(remote.completedProjects, projectIds),
      ...completionIds(local.completedProjects, projectIds),
    ])].sort(),
    conceptProgress,
    onboardingComplete: local.onboardingComplete || remote.onboardingComplete || latestStudy.onboardingComplete,
  }
}

export function hasMeaningfulProgress(progress: LearnerProgress): boolean {
  return progress.onboardingComplete
    || progress.xp > 0
    || completedLessonsFor(progress).length > 0
    || progress.completedMissions.length > 0
    || completionIds(progress.completedProjectCheckpoints, projectCheckpointIds).length > 0
    || completionIds(progress.completedProjects, projectIds).length > 0
    || Object.keys(progress.conceptProgress).length > 0
}

export function progressRecordsMatch(left: LearnerProgress, right: LearnerProgress): boolean {
  return JSON.stringify(canonicalProgress(left)) === JSON.stringify(canonicalProgress(right))
}

async function readJson(response: Response): Promise<Record<string, unknown>> {
  if (!response.headers.get('Content-Type')?.includes('application/json')) return {}
  return response.json() as Promise<Record<string, unknown>>
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function parseRemoteProgressRecord(value: unknown): RemoteProgressRecord | null {
  if (!isRecord(value)) return null
  if (value.version !== PROGRESS_RECORD_VERSION) return null
  if (!Number.isSafeInteger(value.revision) || Number(value.revision) < 0) return null
  if (typeof value.updatedAt !== 'string' || !Number.isFinite(Date.parse(value.updatedAt))) return null
  const progress = parseLearnerProgress(value.progress)
  if (!progress) return null
  return {
    version: PROGRESS_RECORD_VERSION,
    revision: Number(value.revision),
    updatedAt: value.updatedAt,
    progress,
  }
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
  if (body.record === null || body.record === undefined) return null
  const record = parseRemoteProgressRecord(body.record)
  if (!record) throw new Error('Saved progress returned an invalid learning record.')
  return record
}

export async function saveRemoteProgress(
  progress: LearnerProgress,
  revision: number,
): Promise<SaveProgressResult> {
  const normalizedProgress = withCompletionDefaults(progress)
  const response = await fetch('/api/progress', {
    method: 'PUT',
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ version: PROGRESS_RECORD_VERSION, revision, progress: normalizedProgress }),
  })
  const body = await readJson(response)
  if (response.ok) {
    const record = parseRemoteProgressRecord(body.record)
    return record
      ? { ok: true, record }
      : { ok: false, conflicted: false, conflict: null, message: 'Saved progress returned an invalid learning record.' }
  }
  return {
    ok: false,
    conflicted: response.status === 409,
    conflict: response.status === 409 ? parseRemoteProgressRecord(body.record) : null,
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
