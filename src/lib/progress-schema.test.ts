import { describe, expect, it } from 'vitest'
import { initialProgress } from './progress'
import { normalizeLocalLearnerProgress, parseLearnerProgress } from './progress-schema'

function validProgress() {
  return {
    ...initialProgress('java'),
    callsign: 'Schema Cadet',
    xp: 42,
    dailyXp: 8,
    dailyXpDate: '2026-08-25',
    starShards: 25,
    streak: 2,
    lastStudyDate: '2026-08-25',
    completedMissions: ['java-coffee-protocol'],
    conceptProgress: {
      'java-variables': {
        strength: 2,
        correct: 3,
        incorrect: 1,
        dueAt: '2026-08-28',
      },
    },
    onboardingComplete: true,
  }
}

describe('learner progress schema', () => {
  it('strictly parses the existing version 1 learner shape', () => {
    const progress = validProgress()
    expect(parseLearnerProgress(progress)).toEqual(progress)
  })

  it('keeps the version 1 migration for omitted project completion arrays', () => {
    const progress: Record<string, unknown> = { ...validProgress() }
    delete progress.completedProjectCheckpoints
    delete progress.completedProjects

    expect(parseLearnerProgress(progress)).toMatchObject({
      completedProjectCheckpoints: [],
      completedProjects: [],
    })
  })

  it.each([
    ['missing mission list', () => {
      const progress: Record<string, unknown> = { ...validProgress() }
      delete progress.completedMissions
      return progress
    }],
    ['unknown mission', () => ({ ...validProgress(), completedMissions: ['unknown-mission'] })],
    ['duplicate mission', () => ({
      ...validProgress(),
      completedMissions: ['java-coffee-protocol', 'java-coffee-protocol'],
    })],
    ['unknown concept', () => ({
      ...validProgress(),
      conceptProgress: {
        ...validProgress().conceptProgress,
        'unknown-concept': validProgress().conceptProgress['java-variables'],
      },
    })],
    ['malformed concept', () => ({ ...validProgress(), conceptProgress: { 'java-variables': null } })],
    ['invalid calendar date', () => ({
      ...validProgress(),
      conceptProgress: {
        'java-variables': {
          ...validProgress().conceptProgress['java-variables'],
          dueAt: '2026-02-31',
        },
      },
    })],
    ['unsafe count', () => ({
      ...validProgress(),
      conceptProgress: {
        'java-variables': {
          ...validProgress().conceptProgress['java-variables'],
          correct: Number.MAX_SAFE_INTEGER + 1,
        },
      },
    })],
  ])('rejects %s in synchronized and backup records', (_name, buildProgress) => {
    expect(parseLearnerProgress(buildProgress())).toBeNull()
  })

  it('normalizes a partially damaged browser record field by field', () => {
    const normalized = normalizeLocalLearnerProgress({
      ...validProgress(),
      xp: -1,
      completedMissions: ['java-coffee-protocol', 'unknown-mission', 'java-coffee-protocol'],
      conceptProgress: {
        'java-variables': validProgress().conceptProgress['java-variables'],
        'java-conditions': { strength: 99, correct: 1, incorrect: 0, dueAt: '2026-08-25' },
        'unknown-concept': { strength: 1, correct: 1, incorrect: 0, dueAt: '2026-08-25' },
      },
    }, initialProgress())

    expect(normalized.xp).toBe(0)
    expect(normalized.callsign).toBe('Schema Cadet')
    expect(normalized.completedMissions).toEqual(['java-coffee-protocol'])
    expect(normalized.conceptProgress).toEqual({
      'java-variables': validProgress().conceptProgress['java-variables'],
    })
  })
})
