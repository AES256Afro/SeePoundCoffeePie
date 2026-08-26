import { describe, expect, it } from 'vitest'

import type { Exercise } from '../types'
import { pythonDataToolsCourse } from './python-data-tools-course'
import {
  pythonDataToolsLessons,
  pythonDataToolsManifest,
  pythonDataToolsMissionIds,
} from './python-data-tools-manifest'

const expectedMissionIds = [
  'py-data-return-values',
  'py-data-text-cleanup',
  'py-data-list-tools',
  'py-data-dictionaries',
  'py-data-summaries',
  'py-data-supply-tracker',
]

const expectedTypeSequence: Exercise['type'][] = [
  'prediction',
  'choice',
  'prediction',
  'bugfix',
  'code',
]

const expectedFinalStarter = `def normalize_name(name):
    return name.strip().lower()

def add_stock(inventory, name, amount):
    clean_name = _____
    current = _____
    inventory[clean_name] = _____
    return inventory[clean_name]

def total_stock(inventory):
    total = 0
    for amount in inventory.values():
        total += _____
    return total

def low_stock(inventory, limit):
    names = []
    for name in inventory:
        if inventory[name] < limit:
            _____
    return names

inventory = {}
add_stock(inventory, " Markers ", 2)
add_stock(inventory, "markers", 3)
add_stock(inventory, "Paper", 12)

print("Products:", len(inventory))
print("Total units:", total_stock(inventory))
for name in low_stock(inventory, 6):
    print("Restock:", name)`

const expectedFinalChecks = [
  'clean_name\\s*=\\s*normalize_name\\s*\\(\\s*name\\s*\\)',
  'current\\s*=\\s*inventory\\.get\\s*\\(\\s*clean_name\\s*,\\s*0\\s*\\)',
  'inventory\\s*\\[\\s*clean_name\\s*\\]\\s*=\\s*current\\s*\\+\\s*amount',
  'total\\s*\\+=\\s*amount',
  'names\\.append\\s*\\(\\s*name\\s*\\)',
]

const exercises = pythonDataToolsCourse.missions.flatMap((mission) => mission.exercises)

describe('Practical Python: Data Tools course', () => {
  it('publishes six missions and thirty globally unique lessons', () => {
    expect(pythonDataToolsCourse.id).toBe('python-data-tools')
    expect(pythonDataToolsCourse.language).toBe('python')
    expect(pythonDataToolsCourse.missions).toHaveLength(6)
    expect(pythonDataToolsCourse.missions.map((mission) => mission.id)).toEqual(expectedMissionIds)
    expect(pythonDataToolsCourse.missions.map((mission) => mission.chapter)).toEqual([1, 2, 3, 4, 5, 6])
    expect(pythonDataToolsCourse.missions.map((mission) => mission.status)).toEqual([
      'available',
      'locked',
      'locked',
      'locked',
      'locked',
      'locked',
    ])
    expect(exercises).toHaveLength(30)
    expect(new Set(exercises.map((exercise) => exercise.id)).size).toBe(30)
    expect(
      pythonDataToolsCourse.missions.map((mission) => (
        mission.exercises.reduce((total, exercise) => total + exercise.xp, 0)
      )),
    ).toEqual([70, 70, 70, 70, 70, 70])
    expect(exercises.reduce((total, exercise) => total + exercise.xp, 0)).toBe(420)
  })

  it('matches the compact progress manifest exactly', () => {
    expect(pythonDataToolsMissionIds).toEqual(expectedMissionIds)
    expect(Object.keys(pythonDataToolsManifest)).toEqual(expectedMissionIds)

    const publicLessons = pythonDataToolsCourse.missions.flatMap((mission) =>
      mission.exercises.map((exercise) => ({
        id: exercise.id,
        conceptId: exercise.conceptId,
        xp: exercise.xp,
        missionId: mission.id,
      })),
    )

    expect(publicLessons).toEqual(pythonDataToolsLessons)
  })

  it('uses the planned beginner-first exercise mix', () => {
    for (const mission of pythonDataToolsCourse.missions.slice(0, 4)) {
      expect(mission.exercises.map((exercise) => exercise.type), mission.id).toEqual(expectedTypeSequence)
    }

    for (const mission of pythonDataToolsCourse.missions.slice(4)) {
      expect(mission.exercises.map((exercise) => exercise.type), mission.id).toEqual([
        'prediction',
        'choice',
        'ordering',
        'bugfix',
        'code',
      ])
    }

    const typeCounts = exercises.reduce<Record<Exercise['type'], number>>(
      (counts, exercise) => ({ ...counts, [exercise.type]: counts[exercise.type] + 1 }),
      { choice: 0, prediction: 0, ordering: 0, bugfix: 0, code: 0 },
    )

    expect(typeCounts).toEqual({ choice: 6, prediction: 10, ordering: 2, bugfix: 6, code: 6 })
  })

  it('provides complete learner support for all twelve editable exercises', () => {
    const editable = exercises.filter((exercise) => exercise.type === 'bugfix' || exercise.type === 'code')
    expect(editable).toHaveLength(12)

    for (const exercise of editable) {
      expect(exercise.starterCode?.length, `${exercise.id} needs starter code`).toBeGreaterThan(40)
      expect(exercise.focus?.length, `${exercise.id} needs a focused edit boundary`).toBeGreaterThan(40)
      expect(exercise.codeGuide?.length, `${exercise.id} needs a code guide`).toBeGreaterThanOrEqual(3)
      expect(exercise.checks?.length, `${exercise.id} needs checks`).toBeGreaterThan(0)
      expect(exercise.output?.length, `${exercise.id} needs expected output`).toBeGreaterThan(0)

      for (const item of exercise.codeGuide ?? []) {
        expect(item.code.length, `${exercise.id} has an empty code-guide sample`).toBeGreaterThan(0)
        expect(item.plain.length, `${exercise.id} has a thin code-guide explanation`).toBeGreaterThan(35)
      }

      for (const check of exercise.checks ?? []) {
        expect(check.pattern.length, `${exercise.id} has an empty check pattern`).toBeGreaterThan(0)
        expect(check.message.length, `${exercise.id} has a thin check message`).toBeGreaterThan(20)
        expect(() => new RegExp(check.pattern, check.flags)).not.toThrow()
      }

      if (exercise.type === 'code') {
        expect(exercise.starterCode, `${exercise.id} needs at least one guided blank`).toContain('_____')
      }
    }
  })

  it('keeps every lesson explanatory and every fixed-response exercise answerable', () => {
    for (const exercise of exercises) {
      expect(exercise.explanation.length, `${exercise.id} needs a complete explanation`).toBeGreaterThan(80)
      expect(exercise.analogy.length, `${exercise.id} needs a concrete analogy`).toBeGreaterThan(70)
      expect(exercise.hint.length, `${exercise.id} needs a useful hint`).toBeGreaterThan(35)
      expect(exercise.recap.length, `${exercise.id} needs a retrieval-ready recap`).toBeGreaterThan(45)
      expect(exercise.xp, `${exercise.id} needs positive XP`).toBeGreaterThan(0)

      if (exercise.type === 'choice' || exercise.type === 'prediction') {
        expect(exercise.choices, `${exercise.id} needs three answer choices`).toHaveLength(3)
        expect(
          exercise.choices?.some((choice) => choice.id === exercise.correctChoice),
          `${exercise.id} needs a valid correct choice`,
        ).toBe(true)
      }

      if (exercise.type === 'prediction') {
        expect(exercise.displayCode?.length, `${exercise.id} needs traceable code`).toBeGreaterThan(20)
      }

      if (exercise.type === 'ordering') {
        const itemIds = exercise.orderItems?.map((item) => item.id) ?? []
        expect(itemIds.length, `${exercise.id} needs meaningful ordering pieces`).toBeGreaterThanOrEqual(5)
        expect(new Set(itemIds)).toEqual(new Set(exercise.correctOrder))
        expect(itemIds, `${exercise.id} should not begin already solved`).not.toEqual(exercise.correctOrder)
      }
    }
  })

  it('locks the capstone starter, output, and five public checks to the assessment contract', () => {
    const capstone = exercises.find((exercise) => exercise.id === 'pydata6-supply-tracker')

    expect(capstone?.starterCode).toBe(expectedFinalStarter)
    expect(capstone?.starterCode?.match(/_____/g)).toHaveLength(5)
    expect(capstone?.output).toBe('Products: 2\nTotal units: 17\nRestock: markers')
    expect(capstone?.checks?.map((check) => check.pattern)).toEqual(expectedFinalChecks)
  })

  it('contains no em dash in learner-facing course data', () => {
    expect(JSON.stringify(pythonDataToolsCourse)).not.toContain(String.fromCodePoint(0x2014))
  })
})
