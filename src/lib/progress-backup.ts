import type { LearnerProgress } from '../types'
import { parseLearnerProgress } from './progress-schema'

export { parseLearnerProgress } from './progress-schema'

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

const encoder = new TextEncoder()

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
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
