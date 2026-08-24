import { describe, expect, it } from 'vitest'
import { trackById } from '../data/curriculum'
import { initialProgress } from './progress'
import { buildPracticeExercises, conceptDisplayName, recommendPractice } from './practice'

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

  it('builds one focused exercise for each requested concept', () => {
    const exercises = buildPracticeExercises(python.missions[0], [
      'python-variables',
      'python-output-and-variables',
    ])

    expect(exercises.map((exercise) => exercise.id)).toEqual(['py-string', 'py-launch'])
  })

  it('uses the full mission for optional practice when no concept is due', () => {
    expect(buildPracticeExercises(python.missions[1], [])).toEqual(python.missions[1].exercises)
  })

  it('routes a due index concept into the authored third mission', () => {
    const java = trackById('java')
    const progress = {
      ...initialProgress('java'),
      completedMissions: ['java-coffee-protocol', 'java-routing-orders', 'java-crew-array'],
      conceptProgress: {
        'java-indexes': concept(1),
      },
    }

    const recommendation = recommendPractice(java, progress, now)
    expect(recommendation.mission.id).toBe('java-crew-array')
    expect(buildPracticeExercises(recommendation.mission, recommendation.coveredConceptIds).map((exercise) => exercise.id)).toEqual([
      'java3-first-index',
    ])
  })

  it('routes a due loop concept into the authored fourth mission', () => {
    const java = trackById('java')
    const progress = {
      ...initialProgress('java'),
      completedMissions: ['java-coffee-protocol', 'java-routing-orders', 'java-crew-array', 'java-repeat-brew'],
      conceptProgress: {
        'java-loops': concept(0),
      },
    }

    const recommendation = recommendPractice(java, progress, now)
    expect(recommendation.mission.id).toBe('java-repeat-brew')
    expect(buildPracticeExercises(recommendation.mission, recommendation.coveredConceptIds).map((exercise) => exercise.id)).toEqual([
      'java4-loop-purpose',
    ])
  })

  it('routes a due function concept into the authored fifth mission', () => {
    const java = trackById('java')
    const progress = {
      ...initialProgress('java'),
      completedMissions: [
        'java-coffee-protocol',
        'java-routing-orders',
        'java-crew-array',
        'java-repeat-brew',
        'java-droid-routine',
      ],
      conceptProgress: {
        'java-functions': concept(0),
      },
    }

    const recommendation = recommendPractice(java, progress, now)
    expect(recommendation.mission.id).toBe('java-droid-routine')
    expect(buildPracticeExercises(recommendation.mission, recommendation.coveredConceptIds).map((exercise) => exercise.id)).toEqual([
      'java5-method-purpose',
    ])
  })
})
