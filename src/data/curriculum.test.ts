import { describe, expect, it } from 'vitest'
import { findExercise, tracks } from './curriculum'

describe('beginner curriculum scaffolding', () => {
  it('gives every editable exercise one clear focus and a plain-language code guide', () => {
    const codeExercises = tracks.flatMap((track) => (
      track.missions.flatMap((mission) => mission.exercises.filter((exercise) => exercise.type === 'code'))
    ))

    expect(codeExercises).toHaveLength(24)
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

    expect(bugFixes).toHaveLength(8)
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

  it('keeps every authored exercise identifiable and fully teachable', () => {
    const exercises = tracks.flatMap((track) => track.missions.flatMap((mission) => mission.exercises))
    const ids = exercises.map((exercise) => exercise.id)

    expect(exercises).toHaveLength(60)
    expect(new Set(ids).size).toBe(ids.length)
    for (const exercise of exercises) {
      expect(exercise.explanation.length, `${exercise.id} needs a real explanation`).toBeGreaterThan(70)
      expect(exercise.analogy.length, `${exercise.id} needs a memorable analogy`).toBeGreaterThan(50)
      expect(exercise.hint.length, `${exercise.id} needs a useful hint`).toBeGreaterThan(20)
      expect(exercise.recap.length, `${exercise.id} needs a retrieval recap`).toBeGreaterThan(30)
      expect(exercise.xp).toBeGreaterThan(0)
    }
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
