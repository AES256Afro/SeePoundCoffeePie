import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  academyConceptIds,
  academyModuleUnitIds,
  academyUnitIds,
} from '../data/academy-manifest'
import { initialProgress } from './progress'
import { normalizeLocalLearnerProgress, parseLearnerProgress } from './progress-schema'
import {
  fetchRemoteProgress,
  mergeLearnerProgress,
  progressRecordsMatch,
} from './progress-sync'

const academyConcept = {
  strength: 1,
  correct: 1,
  incorrect: 0,
  dueAt: '2026-09-01',
}

describe('academy progress integration', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('strictly preserves academy unit, module, and concept IDs', () => {
    const moduleId = 'LM-101-M1'
    const progress = {
      ...initialProgress('python'),
      completedMissions: [moduleId],
      conceptProgress: {
        [academyConceptIds[0]]: academyConcept,
      },
    }

    expect(parseLearnerProgress(progress)).toMatchObject({
      completedMissions: [moduleId],
      completedLessons: academyModuleUnitIds[moduleId],
      conceptProgress: progress.conceptProgress,
    })
  })

  it('rejects unknown identifiers and filters them from tolerant local recovery', () => {
    const validUnitId = academyUnitIds[0]
    const validConceptId = academyConceptIds[0]
    const unknownProgress = {
      ...initialProgress('python'),
      completedLessons: [validUnitId, 'LM-999-U1'],
    }

    expect(parseLearnerProgress(unknownProgress)).toBeNull()

    const normalized = normalizeLocalLearnerProgress({
      ...unknownProgress,
      conceptProgress: {
        [validConceptId]: academyConcept,
        'unknown-academy-concept': academyConcept,
      },
    }, initialProgress('python'))

    expect(normalized.completedLessons).toEqual([validUnitId])
    expect(normalized.conceptProgress).toEqual({ [validConceptId]: academyConcept })
  })

  it('merges academy unit progress from two devices without inventing module completion', () => {
    const local = {
      ...initialProgress('python'),
      completedLessons: ['LM-101-U1'],
    }
    const remote = {
      ...initialProgress('python'),
      completedLessons: ['LM-101-U2'],
    }

    const merged = mergeLearnerProgress(local, remote)

    expect(merged.completedLessons).toEqual(['LM-101-U1', 'LM-101-U2'])
    expect(merged.completedMissions).toEqual([])
  })

  it('treats a completed academy module as equivalent to its explicit unit closure', () => {
    const moduleId = 'RVF-100-M1'
    const missionOnly = {
      ...initialProgress('python'),
      completedMissions: [moduleId],
    }
    const explicit = {
      ...missionOnly,
      completedLessons: [...academyModuleUnitIds[moduleId]].reverse(),
    }

    expect(progressRecordsMatch(missionOnly, explicit)).toBe(true)
    expect(mergeLearnerProgress(initialProgress('python'), missionOnly)).toMatchObject({
      completedMissions: [moduleId],
      completedLessons: academyModuleUnitIds[moduleId],
    })
  })

  it('rejects an unknown academy-like ID returned by remote synchronization', async () => {
    const invalidRecord = {
      version: 1,
      revision: 1,
      updatedAt: '2026-08-31T12:00:00.000Z',
      progress: {
        ...initialProgress('python'),
        completedLessons: ['LM-101-U1', 'LM-999-U1'],
      },
    }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ record: invalidRecord })))

    await expect(fetchRemoteProgress()).rejects.toThrow('Saved progress returned an invalid learning record.')
  })
})
