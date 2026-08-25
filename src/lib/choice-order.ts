import type { Exercise } from '../types'

type Choice = NonNullable<Exercise['choices']>[number]

function stableSeed(value: string): number {
  let hash = 2_166_136_261
  for (const character of value) {
    hash ^= character.codePointAt(0) ?? 0
    hash = Math.imul(hash, 16_777_619)
  }
  return hash >>> 0
}

function nextSeed(seed: number): number {
  let value = seed || 0x9e3779b9
  value ^= value << 13
  value ^= value >>> 17
  value ^= value << 5
  return value >>> 0
}

export function orderedChoices(exercise: Pick<Exercise, 'id' | 'choices'>): Choice[] {
  const choices = [...(exercise.choices ?? [])]
  let seed = stableSeed(exercise.id)

  for (let index = choices.length - 1; index > 0; index -= 1) {
    seed = nextSeed(seed)
    const destination = seed % (index + 1)
    ;[choices[index], choices[destination]] = [choices[destination], choices[index]]
  }

  return choices
}
