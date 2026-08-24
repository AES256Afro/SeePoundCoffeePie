import { describe, expect, it } from 'vitest'
import { trackById } from '../data/curriculum'
import { initialProgress } from './progress'
import { conceptDisplayName, recommendPractice } from './practice'

const now = new Date('2026-08-24T12:00:00')

function concept(strength: number, dueAt = '2026-08-24') {
  return { strength, correct: 1, incorrect: 0, dueAt }
}

describe('practice recommendations', () => {
  const python = trackById('python')

  it('starts with the first mission before the learner has completed one', () => {
    const recommendation = recommendPractice(python, initialProgress('python'), now)

    expect(recommendation.mode).toBe('start')
    expect(recommendation.mission.id).toBe('py-first-spark')
  })

  it('selects the completed mission covering the most due concepts', () => {
    const progress = {
      ...initialProgress('python'),
      completedMissions: ['py-first-spark', 'py-signal-protocol'],
      conceptProgress: {
        'python-variables': concept(0),
        'python-booleans': concept(2),
        'python-comparisons': concept(1),
        'python-conditions': concept(1),
      },
    }

    const recommendation = recommendPractice(python, progress, now)

    expect(recommendation.mode).toBe('due')
    expect(recommendation.mission.id).toBe('py-signal-protocol')
    expect(recommendation.coveredConceptIds).toEqual([
      'python-booleans',
      'python-conditions',
      'python-comparisons',
    ])
  })

  it('prefers the weaker concept when missions cover the same number due', () => {
    const progress = {
      ...initialProgress('python'),
      completedMissions: ['py-first-spark', 'py-signal-protocol'],
      conceptProgress: {
        'python-variables': concept(4),
        'python-booleans': concept(0),
      },
    }

    expect(recommendPractice(python, progress, now).mission.id).toBe('py-signal-protocol')
  })

  it('uses the later completed mission when both teach the same due concept', () => {
    const progress = {
      ...initialProgress('python'),
      completedMissions: ['py-first-spark', 'py-signal-protocol'],
      conceptProgress: {
        'python-output-and-variables': concept(1),
      },
    }

    expect(recommendPractice(python, progress, now).mission.id).toBe('py-signal-protocol')
  })

  it('offers the latest completed mission when no concept is due', () => {
    const progress = {
      ...initialProgress('python'),
      completedMissions: ['py-first-spark', 'py-signal-protocol'],
      conceptProgress: {
        'python-booleans': concept(2, '2026-08-27'),
      },
    }

    const recommendation = recommendPractice(python, progress, now)
    expect(recommendation.mode).toBe('optional')
    expect(recommendation.mission.id).toBe('py-signal-protocol')
  })

  it('keeps another language out of the active review queue', () => {
    const progress = {
      ...initialProgress('python'),
      completedMissions: ['py-first-spark'],
      conceptProgress: {
        'java-runtime': concept(0),
      },
    }

    expect(recommendPractice(python, progress, now).dueConcepts).toEqual([])
  })

  it('turns internal concept IDs into learner-facing names', () => {
    expect(conceptDisplayName(python, 'python-output-and-variables')).toBe('output and variables')
  })
})
