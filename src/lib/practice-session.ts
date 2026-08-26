import type { LanguageTrack, LearnerProgress } from '../types'
import {
  buildAdaptivePracticeSession,
  resolveAdaptivePracticeSession,
  type AdaptivePracticeSession,
} from './practice'

const SESSION_STORAGE_PREFIX = 'see-pound-coffee-pie-practice-session'
const SESSION_STORAGE_VERSION = 1
const MAX_SESSION_EXERCISES = 5
const MAX_EXERCISE_ID_LENGTH = 100

interface StoredPracticeSession {
  version: typeof SESSION_STORAGE_VERSION
  language: LanguageTrack['id']
  exerciseIds: string[]
}

function storageKey(language: LanguageTrack['id']): string {
  return `${SESSION_STORAGE_PREFIX}:${language}`
}

function readStoredSession(
  storage: Storage,
  language: LanguageTrack['id'],
): StoredPracticeSession | null {
  try {
    const text = storage.getItem(storageKey(language))
    if (!text) return null
    const parsed: unknown = JSON.parse(text)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null
    const record = parsed as Partial<StoredPracticeSession>
    if (
      record.version !== SESSION_STORAGE_VERSION
      || record.language !== language
      || !Array.isArray(record.exerciseIds)
      || record.exerciseIds.length === 0
      || record.exerciseIds.length > MAX_SESSION_EXERCISES
      || !record.exerciseIds.every((id) => (
        typeof id === 'string'
        && id.length > 0
        && id.length <= MAX_EXERCISE_ID_LENGTH
      ))
      || new Set(record.exerciseIds).size !== record.exerciseIds.length
    ) return null
    return {
      version: SESSION_STORAGE_VERSION,
      language,
      exerciseIds: [...record.exerciseIds],
    }
  } catch {
    return null
  }
}

function writeStoredSession(storage: Storage, session: AdaptivePracticeSession): void {
  const record: StoredPracticeSession = {
    version: SESSION_STORAGE_VERSION,
    language: session.language,
    exerciseIds: session.items.map((item) => item.exercise.id),
  }
  storage.setItem(storageKey(session.language), JSON.stringify(record))
}

export function loadOrCreatePracticeSession(
  track: LanguageTrack,
  progress: LearnerProgress,
  storage: Storage | null,
  now = new Date(),
): AdaptivePracticeSession {
  const stored = storage ? readStoredSession(storage, track.id) : null
  if (stored) {
    const resolved = resolveAdaptivePracticeSession(track, progress, stored.exerciseIds, now)
    if (resolved.ok) return resolved.session
  }

  const session = buildAdaptivePracticeSession(track, progress, now)
  try {
    if (session.items.length > 0 && storage) writeStoredSession(storage, session)
    else storage?.removeItem(storageKey(track.id))
  } catch {
    // Ephemeral practice still works when browser session storage is unavailable.
  }
  return session
}

export function clearPracticeSession(
  language: LanguageTrack['id'],
  storage: Storage | null,
): void {
  try {
    storage?.removeItem(storageKey(language))
  } catch {
    // There is no durable learner data in this ephemeral record.
  }
}

export function practiceSessionStorage(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.sessionStorage
  } catch {
    return null
  }
}
