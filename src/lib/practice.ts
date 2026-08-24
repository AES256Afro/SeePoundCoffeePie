import type {
  ConceptProgress,
  LanguageTrack,
  LearnerProgress,
  Mission,
} from '../types'
import { isDue } from './progress'

export interface DueConceptReview {
  id: string
  progress: ConceptProgress
  missionTitles: string[]
}

export interface PracticeRecommendation {
  mission: Mission
  dueConcepts: DueConceptReview[]
  coveredConceptIds: string[]
  mode: 'start' | 'due' | 'optional'
}

function conceptIdsForMission(mission: Mission): string[] {
  return [...new Set(mission.exercises.map((exercise) => exercise.conceptId))]
}

export function buildPracticeExercises(mission: Mission, conceptIds: string[]) {
  if (conceptIds.length === 0) return mission.exercises

  return conceptIds
    .map((conceptId) => mission.exercises.find((exercise) => exercise.conceptId === conceptId))
    .filter((exercise): exercise is Mission['exercises'][number] => Boolean(exercise))
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
): PracticeRecommendation {
  const implementedMissions = track.missions.filter((mission) => mission.exercises.length > 0)
  const starterMission = implementedMissions[0] ?? track.missions[0]
  const trackConceptIds = new Set(implementedMissions.flatMap(conceptIdsForMission))
  const dueConcepts = Object.entries(progress.conceptProgress)
    .filter(([id, concept]) => trackConceptIds.has(id) && isDue(concept, now))
    .map(([id, concept]) => ({
      id,
      progress: concept,
      missionTitles: implementedMissions
        .filter((mission) => conceptIdsForMission(mission).includes(id))
        .map((mission) => mission.title),
    }))
    .sort((left, right) => (
      left.progress.dueAt.localeCompare(right.progress.dueAt)
      || left.progress.strength - right.progress.strength
      || left.id.localeCompare(right.id)
    ))

  const completedMissions = implementedMissions.filter((mission) => (
    progress.completedMissions.includes(mission.id)
  ))

  if (completedMissions.length === 0) {
    return {
      mission: starterMission,
      dueConcepts,
      coveredConceptIds: [],
      mode: 'start',
    }
  }

  const dueById = new Map(dueConcepts.map((concept) => [concept.id, concept]))
  const candidates = completedMissions.map((mission) => {
    const coveredConceptIds = conceptIdsForMission(mission).filter((id) => dueById.has(id))
    const urgency = coveredConceptIds.reduce((score, id) => (
      score + (6 - (dueById.get(id)?.progress.strength ?? 5))
    ), 0)
    const oldestDueAt = coveredConceptIds
      .map((id) => dueById.get(id)?.progress.dueAt ?? '9999-12-31')
      .sort()[0] ?? '9999-12-31'

    return { mission, coveredConceptIds, urgency, oldestDueAt }
  }).sort((left, right) => (
    right.coveredConceptIds.length - left.coveredConceptIds.length
    || right.urgency - left.urgency
    || left.oldestDueAt.localeCompare(right.oldestDueAt)
    || right.mission.chapter - left.mission.chapter
  ))

  const bestDueCandidate = candidates[0]
  if (bestDueCandidate.coveredConceptIds.length > 0) {
    return {
      mission: bestDueCandidate.mission,
      dueConcepts,
      coveredConceptIds: bestDueCandidate.coveredConceptIds,
      mode: 'due',
    }
  }

  const latestCompletedMission = [...completedMissions]
    .sort((left, right) => right.chapter - left.chapter)[0]

  return {
    mission: latestCompletedMission,
    dueConcepts,
    coveredConceptIds: [],
    mode: 'optional',
  }
}
