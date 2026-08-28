import { describe, expect, it } from 'vitest'
import { tracks } from './curriculum'
import { durableCurriculumV1 } from './durable-curriculum-v1'
import { foundationConceptIds } from './foundation-concept-ids'
import {
  foundationLessonMetadataById,
  foundationLessonIds,
  foundationMissionIds,
  foundationMissionLessonIds,
} from './foundation-curriculum-index'
import {
  foundationTrackMetadata,
  foundationTrackMetadataByLanguage,
} from './foundation-track-metadata'

function fingerprint(value: string): string {
  let hash = 2_166_136_261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16_777_619)
  }
  return (hash >>> 0).toString(16).padStart(8, '0')
}

describe('compact foundation registries', () => {
  it('exactly matches every concept in the full foundation curriculum', () => {
    const fullConceptIds = new Set(tracks.flatMap((track) => (
      track.missions.flatMap((mission) => mission.exercises.map((exercise) => exercise.conceptId))
    )))

    expect(new Set(foundationConceptIds).size).toBe(foundationConceptIds.length)
    expect([...foundationConceptIds].sort()).toEqual([...fullConceptIds].sort())
    expect(Object.isFrozen(foundationConceptIds)).toBe(true)
  })

  it('keeps compact track copy and presentation values aligned with full tracks', () => {
    expect(Object.isFrozen(foundationTrackMetadata)).toBe(true)
    expect(foundationTrackMetadata.every(Object.isFrozen)).toBe(true)
    expect(foundationTrackMetadata).toHaveLength(tracks.length)

    foundationTrackMetadata.forEach((metadata) => {
      const track = tracks.find((candidate) => candidate.id === metadata.id)
      const capstone = track?.missions.at(-1)

      expect(track).toBeDefined()
      expect(foundationTrackMetadataByLanguage(metadata.id)).toBe(metadata)
      expect(metadata).toMatchObject({
        accent: track?.accent,
        accentSoft: track?.accentSoft,
        description: track?.description,
        id: track?.id,
        shortName: track?.shortName,
      })
      expect(metadata.capstoneTitle).toBe(capstone?.title)
      expect(metadata.capstoneDescription).toBe(capstone?.description)
    })
  })

  it('derives exact mission and lesson ownership from the durable ID manifest', () => {
    const fullMissions = tracks.flatMap((track) => track.missions)
    const fullMissionIds = fullMissions.map((mission) => mission.id)
    const fullLessonIds = fullMissions.flatMap((mission) => (
      mission.exercises.map((exercise) => exercise.id)
    ))

    expect([...foundationMissionIds].sort()).toEqual([...fullMissionIds].sort())
    expect([...foundationLessonIds].sort()).toEqual([...fullLessonIds].sort())
    tracks.forEach((track) => {
      track.missions.forEach((mission) => {
        const lessonIds = mission.exercises.map((exercise) => exercise.id)
        const lessonMetadata = mission.exercises.map((exercise) => [
          exercise.id,
          exercise.conceptId,
          exercise.xp,
        ])
        expect(foundationMissionLessonIds.get(mission.id)).toEqual(lessonIds)
        const owner = `${track.id}/${mission.id}` as keyof typeof durableCurriculumV1
        expect(durableCurriculumV1[owner]).toEqual(lessonMetadata)
        lessonMetadata.forEach((metadata) => {
          expect(foundationLessonMetadataById.get(metadata[0] as string)).toEqual(metadata)
        })
      })
    })

    const semanticLessonMapping = fullMissions.flatMap((mission) => (
      mission.exercises.map((exercise) => (
        `${mission.language}/${mission.id}:${exercise.id}:${exercise.conceptId}:${exercise.title}`
      ))
    )).join('\n')
    expect(fingerprint(semanticLessonMapping)).toBe('50f062bf')
  })

  it('keeps the eager registry data below five kilobytes before minification', () => {
    const serialized = JSON.stringify({ foundationConceptIds, foundationTrackMetadata })
    expect(serialized.length).toBeLessThan(5_000)
  })
})
