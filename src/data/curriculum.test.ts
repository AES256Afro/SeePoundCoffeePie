import { describe, expect, it } from 'vitest'
import { findExercise, tracks } from './curriculum'

describe('beginner curriculum scaffolding', () => {
  it('gives every editable exercise one clear focus and a plain-language code guide', () => {
    const codeExercises = tracks.flatMap((track) => (
      track.missions.flatMap((mission) => mission.exercises.filter((exercise) => exercise.type === 'code'))
    ))

    expect(codeExercises).toHaveLength(16)
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
})
