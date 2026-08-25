import { tracks } from '../data/curriculum'
import { projectManifests } from '../data/project-manifests'
import type { ConceptProgress, LanguageId, LearnerProgress } from '../types'

export const PROGRESS_BACKUP_FORMAT = 'seepoundcoffeepie-progress' as const
export const PROGRESS_BACKUP_VERSION = 1 as const
export const PROGRESS_BACKUP_MAX_BYTES = 512_000

interface ProgressBackupEnvelope {
  format: typeof PROGRESS_BACKUP_FORMAT
  version: typeof PROGRESS_BACKUP_VERSION
  exportedAt: string
  progress: LearnerProgress
}

export type ProgressBackupParseResult =
  | { ok: true; progress: LearnerProgress; exportedAt: string }
  | { ok: false; message: string }

const languages = new Set<LanguageId>(tracks.map((track) => track.id))
const missionIds = new Set(tracks.flatMap((track) => track.missions.map((mission) => mission.id)))
const projectIds = new Set(projectManifests.map((project) => project.id))
const projectCheckpointIds = new Set(projectManifests.flatMap((project) => (
  project.checkpoints.map((checkpoint) => checkpoint.id)
)))
const conceptIds = new Set([
  ...tracks.flatMap((track) => (
    track.missions.flatMap((mission) => mission.exercises.map((exercise) => exercise.conceptId))
  )),
  ...projectManifests.flatMap((project) => project.checkpoints.map((checkpoint) => checkpoint.conceptId)),
])
const encoder = new TextEncoder()
const datePattern = /^\d{4}-\d{2}-\d{2}$/u

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function isSafeCount(value: unknown): value is number {
  return Number.isSafeInteger(value) && Number(value) >= 0
}

function isDateKey(value: unknown): value is string {
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

export function parseLearnerProgress(value: unknown): LearnerProgress | null {
  if (!isRecord(value)) return null
  if (typeof value.callsign !== 'string' || value.callsign.length > 80) return null
  if (typeof value.activeLanguage !== 'string' || !languages.has(value.activeLanguage as LanguageId)) return null
  if (!Number.isInteger(value.dailyGoal) || Number(value.dailyGoal) < 1 || Number(value.dailyGoal) > 120) return null
  if (!isSafeCount(value.xp) || !isSafeCount(value.dailyXp) || !isSafeCount(value.starShards) || !isSafeCount(value.streak)) return null
  if (value.dailyXpDate !== null && !isDateKey(value.dailyXpDate)) return null
  if (value.lastStudyDate !== null && !isDateKey(value.lastStudyDate)) return null
  if (typeof value.onboardingComplete !== 'boolean') return null

  if (!Array.isArray(value.completedMissions) || !value.completedMissions.every((id) => (
    typeof id === 'string' && missionIds.has(id)
  ))) return null
  if (new Set(value.completedMissions).size !== value.completedMissions.length) return null

  const completedProjectCheckpoints = readCompletionIds(value.completedProjectCheckpoints, projectCheckpointIds)
  const completedProjects = readCompletionIds(value.completedProjects, projectIds)
  if (!completedProjectCheckpoints || !completedProjects) return null

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
    completedMissions: [...value.completedMissions] as string[],
    completedProjectCheckpoints,
    completedProjects,
    conceptProgress: restoredConcepts,
    onboardingComplete: value.onboardingComplete,
  }
}

export function serializeProgressBackup(progress: LearnerProgress, now = new Date()): string {
  const envelope: ProgressBackupEnvelope = {
    format: PROGRESS_BACKUP_FORMAT,
    version: PROGRESS_BACKUP_VERSION,
    exportedAt: now.toISOString(),
    progress,
  }
  return `${JSON.stringify(envelope, null, 2)}\n`
}

export function parseProgressBackup(text: string): ProgressBackupParseResult {
  if (encoder.encode(text).byteLength > PROGRESS_BACKUP_MAX_BYTES) {
    return { ok: false, message: 'That file is too large to be a SeePoundCoffeePie progress backup.' }
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    return { ok: false, message: 'That file is not valid JSON. Choose an unchanged SeePoundCoffeePie backup file.' }
  }

  if (!isRecord(parsed) || parsed.format !== PROGRESS_BACKUP_FORMAT) {
    return { ok: false, message: 'That file is not a SeePoundCoffeePie progress backup.' }
  }
  if (parsed.version !== PROGRESS_BACKUP_VERSION) {
    return { ok: false, message: `This app supports progress backup version ${PROGRESS_BACKUP_VERSION}.` }
  }
  if (typeof parsed.exportedAt !== 'string' || !Number.isFinite(Date.parse(parsed.exportedAt))) {
    return { ok: false, message: 'The backup is missing a valid export date.' }
  }

  const progress = parseLearnerProgress(parsed.progress)
  if (!progress) {
    return { ok: false, message: 'The backup contains missing, unknown, or unsafe progress values and was not restored.' }
  }

  return { ok: true, progress, exportedAt: parsed.exportedAt }
}
