import { describe, expect, it } from 'vitest'
import { findExercise, tracks } from './curriculum'
import { durableCurriculumV1 } from './durable-curriculum-v1'

describe('beginner curriculum scaffolding', () => {
  it('gives every editable exercise one clear focus and a plain-language code guide', () => {
    const codeExercises = tracks.flatMap((track) => (
      track.missions.flatMap((mission) => mission.exercises.filter((exercise) => exercise.type === 'code'))
    ))

    expect(codeExercises).toHaveLength(36)
    for (const exercise of codeExercises) {
      expect(exercise.starterCode, `${exercise.id} needs starter code`).toContain('_____')
      expect(exercise.focus?.length, `${exercise.id} needs a one-job instruction`).toBeGreaterThan(20)
      expect(exercise.codeGuide?.length, `${exercise.id} needs a code guide`).toBeGreaterThanOrEqual(3)
      for (const item of exercise.codeGuide ?? []) {
        expect(item.code.trim()).not.toBe('')
        expect(item.plain.length).toBeGreaterThan(25)
      }
    }
  })

  it('gives every bug-fix exercise one explicit, explained repair', () => {
    const bugFixes = tracks.flatMap((track) => (
      track.missions.flatMap((mission) => mission.exercises.filter((exercise) => exercise.type === 'bugfix'))
    ))

    expect(bugFixes).toHaveLength(12)
    for (const exercise of bugFixes) {
      expect(exercise.starterCode?.length, `${exercise.id} needs faulty starter code`).toBeGreaterThan(40)
      expect(exercise.focus, `${exercise.id} needs a bounded repair instruction`).toMatch(/change/iu)
      expect(exercise.codeGuide?.length, `${exercise.id} must explain its repair`).toBeGreaterThanOrEqual(3)
      expect(exercise.checks?.[0]?.message.length, `${exercise.id} needs specific feedback`).toBeGreaterThan(20)
    }

    for (const track of tracks) {
      const comparisonRepair = track.missions[1].exercises.find((exercise) => exercise.type === 'bugfix')
      expect(comparisonRepair?.codeGuide?.some((item) => item.code.includes('==')), `${track.id} must explain ==`).toBe(true)
      expect(comparisonRepair?.checks?.[0]?.message, `${track.id} needs comparison feedback`).toContain('==')
    }
  })

  it('uses each new exercise shape once per second mission', () => {
    for (const track of tracks) {
      const types = track.missions[1].exercises.map((exercise) => exercise.type)
      expect(types, `${track.id} mission 2 needs varied retrieval`).toEqual([
        'prediction',
        'choice',
        'ordering',
        'bugfix',
        'code',
      ])
    }
  })

  it('soft-lands collections with retrieval, explanation, prediction, repair, and use', () => {
    for (const track of tracks) {
      const types = track.missions[2].exercises.map((exercise) => exercise.type)
      expect(types, `${track.id} mission 3 needs a gentle collection sequence`).toEqual([
        'prediction',
        'choice',
        'prediction',
        'bugfix',
        'code',
      ])
    }
  })

  it('soft-lands loops with retrieval, explanation, prediction, assembly, and use', () => {
    for (const track of tracks) {
      const types = track.missions[3].exercises.map((exercise) => exercise.type)
      expect(types, `${track.id} mission 4 needs a gentle loop sequence`).toEqual([
        'prediction',
        'choice',
        'prediction',
        'ordering',
        'code',
      ])

      const ordering = track.missions[3].exercises[3]
      const initialOrder = ordering.orderItems?.map((item) => item.id) ?? []
      expect(new Set(initialOrder)).toEqual(new Set(ordering.correctOrder))
      expect(initialOrder).not.toEqual(ordering.correctOrder)
    }
  })

  it('soft-lands reusable functions with retrieval, purpose, calls, assembly, and use', () => {
    for (const track of tracks) {
      const types = track.missions[4].exercises.map((exercise) => exercise.type)
      expect(types, `${track.id} mission 5 needs a gentle reusable-code sequence`).toEqual([
        'prediction',
        'choice',
        'prediction',
        'ordering',
        'code',
      ])
    }
  })

  it('finishes each track with recall, planning, assembly, repair, and a capstone', () => {
    for (const track of tracks) {
      const types = track.missions[5].exercises.map((exercise) => exercise.type)
      expect(types, `${track.id} mission 6 needs an integrative capstone sequence`).toEqual([
        'prediction',
        'choice',
        'ordering',
        'bugfix',
        'code',
      ])

      const capstone = track.missions[5].exercises[4]
      expect(capstone.conceptId).toContain('capstone')
      expect(capstone.codeGuide?.length).toBeGreaterThanOrEqual(4)
      expect(capstone.starterCode?.match(/_____/g)).toHaveLength(2)
    }
  })

  it('keeps every authored exercise identifiable and fully teachable', () => {
    const exercises = tracks.flatMap((track) => track.missions.flatMap((mission) => mission.exercises))
    const ids = exercises.map((exercise) => exercise.id)

    expect(exercises).toHaveLength(120)
    expect(new Set(ids).size).toBe(ids.length)
    for (const exercise of exercises) {
      expect(exercise.explanation.length, `${exercise.id} needs a real explanation`).toBeGreaterThan(70)
      expect(exercise.analogy.length, `${exercise.id} needs a memorable analogy`).toBeGreaterThan(50)
      expect(exercise.hint.length, `${exercise.id} needs a useful hint`).toBeGreaterThan(20)
      expect(exercise.recap.length, `${exercise.id} needs a retrieval recap`).toBeGreaterThan(30)
      expect(exercise.xp).toBeGreaterThan(0)
    }
  })

  it('keeps persisted mission and lesson identifiers globally unique with one stable owner', () => {
    const missionIds = tracks.flatMap((track) => track.missions.map((mission) => mission.id))
    const lessonOwners = new Map<string, string[]>()

    for (const track of tracks) {
      for (const mission of track.missions) {
        for (const exercise of mission.exercises) {
          const owners = lessonOwners.get(exercise.id) ?? []
          owners.push(`${track.id}/${mission.id}`)
          lessonOwners.set(exercise.id, owners)
        }
      }
    }

    expect(missionIds).toHaveLength(24)
    expect(new Set(missionIds).size).toBe(missionIds.length)
    expect(lessonOwners.size).toBe(120)
    for (const [lessonId, owners] of lessonOwners) {
      expect(owners, `${lessonId} must belong to exactly one track and mission`).toHaveLength(1)
    }
  })

  it('matches the exact version 1 durable mission and lesson ownership manifest', () => {
    const currentOwnership = Object.fromEntries(tracks.flatMap((track) => (
      track.missions.map((mission) => [
        `${track.id}/${mission.id}`,
        mission.exercises.map((exercise) => exercise.id),
      ])
    )))

    expect(currentOwnership).toEqual(durableCurriculumV1)
  })

  it('authors valid prediction and ordering data for every second mission', () => {
    for (const track of tracks) {
      const prediction = track.missions[1].exercises.find((exercise) => exercise.type === 'prediction')
      const ordering = track.missions[1].exercises.find((exercise) => exercise.type === 'ordering')

      expect(prediction?.displayCode?.length, `${track.id} needs prediction code`).toBeGreaterThan(20)
      expect(prediction?.choices?.some((choice) => choice.id === prediction.correctChoice)).toBe(true)

      const initialOrder = ordering?.orderItems?.map((item) => item.id) ?? []
      expect(initialOrder.length, `${track.id} needs ordering pieces`).toBeGreaterThanOrEqual(4)
      expect(new Set(initialOrder)).toEqual(new Set(ordering?.correctOrder))
      expect(initialOrder).not.toEqual(ordering?.correctOrder)
    }
  })

  it('demystifies Java program scaffolding before asking the learner to edit it', () => {
    const exercise = findExercise('java-output')
    const guide = exercise?.codeGuide?.map((item) => `${item.code} ${item.plain}`).join(' ') ?? ''

    expect(guide).toContain('public class Main')
    expect(guide).toContain('public static void main(String[] args)')
    expect(guide).toContain('You do not need to memorize this line yet')
    expect(guide).toContain('Braces')
    expect(guide).toContain('semicolon')
    expect(guide).toContain('System.out.println')
  })

  it('explains every unfamiliar piece used by the final Java report', () => {
    const exercise = findExercise('java-galley-report')
    const guide = exercise?.codeGuide?.map((item) => item.code).join(' ') ?? ''

    expect(exercise?.focus).toContain('Do not rewrite the surrounding program')
    expect(guide).toContain('String blendName')
    expect(guide).toContain('int podCount')
    expect(guide).toContain('+')
    expect(guide).toContain('System.out.println')
  })

  it('teaches zero-based indexing before each final collection report', () => {
    for (const track of tracks) {
      const mission = track.missions[2]
      const indexLesson = mission.exercises[2]
      const finalReport = mission.exercises[4]
      const guide = finalReport.codeGuide?.map((item) => `${item.code} ${item.plain}`).join(' ') ?? ''

      expect(indexLesson.conceptId).toContain('indexes')
      expect(indexLesson.explanation).toContain('zero')
      expect(guide).toContain('[0]')
      expect(guide).toContain('[2]')
    }
  })
})
