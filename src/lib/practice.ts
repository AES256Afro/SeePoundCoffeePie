import type {
  ConceptProgress,
  Exercise,
  LanguageTrack,
  LearnerProgress,
  Mission,
} from '../types'
import { dateKey, isDue } from './progress'
import { isDateKey } from './progress-schema'

export const ADAPTIVE_PRACTICE_MAX_ITEMS = 5
export const ADAPTIVE_PRACTICE_MAX_ITEMS_PER_MISSION = 2

export type PracticeReason = 'due' | 'weak' | 'fresh'
export type PracticeMode = 'start' | 'due' | 'weak' | 'clear'

export interface DueConceptReview {
  id: string
  progress: ConceptProgress
  missionTitles: string[]
}

export interface AdaptivePracticeItem {
  conceptId: string
  exercise: Exercise
  missionId: string
  missionTitle: string
  missionChapter: number
  reason: PracticeReason
  progress: ConceptProgress
}

export interface AdaptivePracticeSession {
  version: 1
  language: LanguageTrack['id']
  generatedFor: string
  mode: PracticeMode
  starterMission: Mission
  items: AdaptivePracticeItem[]
  dueConcepts: DueConceptReview[]
  deferredDueCount: number
  nextReviewAt: string | null
}

export type PracticeSessionResolution =
  | { ok: true; session: AdaptivePracticeSession }
  | {
      ok: false
      reason:
        | 'empty'
        | 'too-many-items'
        | 'duplicate-item'
        | 'duplicate-concept'
        | 'unknown-item'
        | 'too-many-from-one-mission'
    }

interface AuthoredPracticeExercise {
  exercise: Exercise
  mission: Mission
  missionIndex: number
  exerciseIndex: number
}

interface PracticeConceptCandidate {
  conceptId: string
  exercises: AuthoredPracticeExercise[]
  progress: ConceptProgress
  reason: PracticeReason
}

function validConceptProgress(value: unknown): value is ConceptProgress {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const concept = value as Partial<ConceptProgress>
  return Number.isInteger(concept.strength)
    && Number(concept.strength) >= 0
    && Number(concept.strength) <= 5
    && Number.isSafeInteger(concept.correct)
    && Number(concept.correct) >= 0
    && Number.isSafeInteger(concept.incorrect)
    && Number(concept.incorrect) >= 0
    && isDateKey(concept.dueAt)
}

function stableSeed(value: string): number {
  let hash = 2_166_136_261
  for (const character of value) {
    hash ^= character.codePointAt(0) ?? 0
    hash = Math.imul(hash, 16_777_619)
  }
  return hash >>> 0
}

function conceptIdsForMission(mission: Mission): string[] {
  return [...new Set(mission.exercises.map((exercise) => exercise.conceptId))]
}

function completedExerciseCatalog(
  track: LanguageTrack,
  progress: LearnerProgress,
): Map<string, AuthoredPracticeExercise[]> {
  const completedMissionIds = new Set(progress.completedMissions)
  const byConcept = new Map<string, AuthoredPracticeExercise[]>()

  track.missions.forEach((mission, missionIndex) => {
    if (
      mission.language !== track.id
      || mission.exercises.length === 0
      || !completedMissionIds.has(mission.id)
    ) return

    mission.exercises.forEach((exercise, exerciseIndex) => {
      const exercises = byConcept.get(exercise.conceptId) ?? []
      exercises.push({ exercise, mission, missionIndex, exerciseIndex })
      byConcept.set(exercise.conceptId, exercises)
    })
  })

  return byConcept
}

function defaultConceptProgress(today: string): ConceptProgress {
  return { strength: 0, correct: 0, incorrect: 0, dueAt: today }
}

function practiceReason(progress: ConceptProgress, now: Date): PracticeReason {
  if (isDue(progress, now)) return 'due'
  if (progress.strength <= 2) return 'weak'
  return 'fresh'
}

function candidateSort(left: PracticeConceptCandidate, right: PracticeConceptCandidate): number {
  const priority: Record<PracticeReason, number> = { due: 0, weak: 1, fresh: 2 }
  return priority[left.reason] - priority[right.reason]
    || left.progress.dueAt.localeCompare(right.progress.dueAt)
    || left.progress.strength - right.progress.strength
    || right.progress.incorrect - left.progress.incorrect
    || (left.exercises[0]?.missionIndex ?? 0) - (right.exercises[0]?.missionIndex ?? 0)
    || (left.exercises[0]?.exerciseIndex ?? 0) - (right.exercises[0]?.exerciseIndex ?? 0)
    || left.conceptId.localeCompare(right.conceptId)
}

function candidateExercisesInDailyOrder(
  candidate: PracticeConceptCandidate,
  language: LanguageTrack['id'],
  today: string,
): AuthoredPracticeExercise[] {
  const authored = [...candidate.exercises].sort((left, right) => (
    left.missionIndex - right.missionIndex
    || left.exerciseIndex - right.exerciseIndex
    || left.exercise.id.localeCompare(right.exercise.id)
  ))
  if (authored.length < 2) return authored

  const start = stableSeed(`${today}|${language}|${candidate.conceptId}`) % authored.length
  return [...authored.slice(start), ...authored.slice(0, start)]
}

function allCandidates(
  track: LanguageTrack,
  progress: LearnerProgress,
  now: Date,
): PracticeConceptCandidate[] {
  const today = dateKey(now)
  return [...completedExerciseCatalog(track, progress).entries()]
    .map(([conceptId, exercises]) => {
      const stored = progress.conceptProgress[conceptId]
      const concept = validConceptProgress(stored) ? stored : defaultConceptProgress(today)
      return {
        conceptId,
        exercises,
        progress: concept,
        reason: practiceReason(concept, now),
      }
    })
    .sort(candidateSort)
}

function asPracticeItem(
  candidate: PracticeConceptCandidate,
  authored: AuthoredPracticeExercise,
): AdaptivePracticeItem {
  return {
    conceptId: candidate.conceptId,
    exercise: authored.exercise,
    missionId: authored.mission.id,
    missionTitle: authored.mission.title,
    missionChapter: authored.mission.chapter,
    reason: candidate.reason,
    progress: candidate.progress,
  }
}

function dueConceptReviews(
  candidates: PracticeConceptCandidate[],
): DueConceptReview[] {
  return candidates
    .filter((candidate) => candidate.reason === 'due')
    .map((candidate) => ({
      id: candidate.conceptId,
      progress: candidate.progress,
      missionTitles: [...new Set(candidate.exercises.map(({ mission }) => mission.title))],
    }))
}

function modeForItems(items: AdaptivePracticeItem[], dueCount: number): PracticeMode {
  if (items.length === 0) return 'start'
  if (dueCount > 0) return 'due'
  if (items.some((item) => item.reason === 'weak')) return 'weak'
  return 'clear'
}

function starterMission(track: LanguageTrack): Mission {
  return track.missions.find((mission) => mission.exercises.length > 0) ?? track.missions[0]
}

function nextReviewDate(candidates: PracticeConceptCandidate[], today: string): string | null {
  return candidates
    .map((candidate) => candidate.progress.dueAt)
    .filter((dueAt) => dueAt > today)
    .sort()[0] ?? null
}

function buildSession(
  track: LanguageTrack,
  candidates: PracticeConceptCandidate[],
  items: AdaptivePracticeItem[],
  now: Date,
): AdaptivePracticeSession {
  const dueConcepts = dueConceptReviews(candidates)
  const selectedDueCount = items.filter((item) => item.reason === 'due').length
  const today = dateKey(now)
  return {
    version: 1,
    language: track.id,
    generatedFor: today,
    mode: modeForItems(items, dueConcepts.length),
    starterMission: starterMission(track),
    items,
    dueConcepts,
    deferredDueCount: Math.max(0, dueConcepts.length - selectedDueCount),
    nextReviewAt: nextReviewDate(candidates, today),
  }
}

export function buildAdaptivePracticeSession(
  track: LanguageTrack,
  progress: LearnerProgress,
  now = new Date(),
): AdaptivePracticeSession {
  const candidates = allCandidates(track, progress, now)
  const missionCounts = new Map<string, number>()
  const items: AdaptivePracticeItem[] = []
  const today = dateKey(now)

  for (const candidate of candidates) {
    if (items.length >= ADAPTIVE_PRACTICE_MAX_ITEMS) break
    const authored = candidateExercisesInDailyOrder(candidate, track.id, today)
      .find(({ mission }) => (
        (missionCounts.get(mission.id) ?? 0) < ADAPTIVE_PRACTICE_MAX_ITEMS_PER_MISSION
      ))
    if (!authored) continue

    items.push(asPracticeItem(candidate, authored))
    missionCounts.set(authored.mission.id, (missionCounts.get(authored.mission.id) ?? 0) + 1)
  }

  return buildSession(track, candidates, items, now)
}

export function resolveAdaptivePracticeSession(
  track: LanguageTrack,
  progress: LearnerProgress,
  exerciseIds: string[],
  now = new Date(),
): PracticeSessionResolution {
  if (exerciseIds.length === 0) return { ok: false, reason: 'empty' }
  if (exerciseIds.length > ADAPTIVE_PRACTICE_MAX_ITEMS) {
    return { ok: false, reason: 'too-many-items' }
  }
  if (new Set(exerciseIds).size !== exerciseIds.length) {
    return { ok: false, reason: 'duplicate-item' }
  }

  const candidates = allCandidates(track, progress, now)
  const candidateByExerciseId = new Map<string, { candidate: PracticeConceptCandidate; authored: AuthoredPracticeExercise }>()
  for (const candidate of candidates) {
    for (const authored of candidate.exercises) {
      candidateByExerciseId.set(authored.exercise.id, { candidate, authored })
    }
  }

  const items: AdaptivePracticeItem[] = []
  const conceptIds = new Set<string>()
  const missionCounts = new Map<string, number>()
  for (const exerciseId of exerciseIds) {
    const match = candidateByExerciseId.get(exerciseId)
    if (!match) return { ok: false, reason: 'unknown-item' }
    if (conceptIds.has(match.candidate.conceptId)) {
      return { ok: false, reason: 'duplicate-concept' }
    }
    const missionCount = (missionCounts.get(match.authored.mission.id) ?? 0) + 1
    if (missionCount > ADAPTIVE_PRACTICE_MAX_ITEMS_PER_MISSION) {
      return { ok: false, reason: 'too-many-from-one-mission' }
    }
    conceptIds.add(match.candidate.conceptId)
    missionCounts.set(match.authored.mission.id, missionCount)
    items.push(asPracticeItem(match.candidate, match.authored))
  }

  return { ok: true, session: buildSession(track, candidates, items, now) }
}

export function countEligibleDueConcepts(
  track: LanguageTrack,
  progress: LearnerProgress,
  now = new Date(),
): number {
  return allCandidates(track, progress, now)
    .filter((candidate) => candidate.reason === 'due').length
}

export function buildPracticeExercises(mission: Mission, conceptIds: string[]) {
  const requested = new Set(conceptIds)
  const seenConcepts = new Set<string>()
  return mission.exercises
    .filter((exercise) => requested.size === 0 || requested.has(exercise.conceptId))
    .filter((exercise) => {
      if (seenConcepts.has(exercise.conceptId)) return false
      seenConcepts.add(exercise.conceptId)
      return true
    })
    .slice(0, ADAPTIVE_PRACTICE_MAX_ITEMS)
}

export function conceptDisplayName(track: LanguageTrack, conceptId: string): string {
  const withoutLanguage = conceptId.startsWith(`${track.id}-`)
    ? conceptId.slice(track.id.length + 1)
    : conceptId
  return withoutLanguage.replaceAll('-', ' ')
}

export function recommendPractice(
  track: LanguageTrack,
  progress: LearnerProgress,
  now = new Date(),
): AdaptivePracticeSession {
  return buildAdaptivePracticeSession(track, progress, now)
}

export function conceptIdsForCompletedMission(mission: Mission): string[] {
  return conceptIdsForMission(mission)
}
