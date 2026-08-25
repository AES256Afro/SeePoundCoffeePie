import { describe, expect, it } from 'vitest'
import { tracks } from '../data/curriculum'
import { orderedChoices } from './choice-order'

const choiceExercises = tracks.flatMap((track) => (
  track.missions.flatMap((mission) => mission.exercises)
)).filter((exercise) => exercise.type === 'choice' || exercise.type === 'prediction')

describe('stable answer ordering', () => {
  it('preserves every authored answer while changing only its display position', () => {
    for (const exercise of choiceExercises) {
      expect(orderedChoices(exercise).map((choice) => choice.id).sort()).toEqual(
        exercise.choices?.map((choice) => choice.id).sort(),
      )
      expect(orderedChoices(exercise)).toEqual(orderedChoices(exercise))
    }
  })

  it('does not teach learners that the first visible answer is always correct', () => {
    const correctPositions = choiceExercises.map((exercise) => (
      orderedChoices(exercise).findIndex((choice) => choice.id === exercise.correctChoice)
    ))
    const counts = correctPositions.reduce<Record<number, number>>((totals, position) => ({
      ...totals,
      [position]: (totals[position] ?? 0) + 1,
    }), {})

    expect(new Set(correctPositions).size).toBeGreaterThanOrEqual(3)
    expect(Math.max(...Object.values(counts))).toBeLessThan(choiceExercises.length / 2)
  })
})
