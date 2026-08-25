import { describe, expect, it } from 'vitest'
import { tracks } from '../data/curriculum'
import { evaluateRunnerAssignment, findRunnerAssignment, runnerAssignmentCount } from './runner-assignments'

describe('server-owned runner assignments', () => {
  it('covers every authored editable exercise with real output', () => {
    expect(runnerAssignmentCount()).toBe(58)
    expect(findRunnerAssignment('py-print')).toMatchObject({ language: 'python', expectedOutput: 'Signal online' })
    expect(findRunnerAssignment('java-galley-report')).toMatchObject({ language: 'java' })
    expect(findRunnerAssignment('project-py-final')).toMatchObject({ language: 'python', kind: 'project' })
  })

  it('keeps hidden checks within requirements stated by the lesson', () => {
    const assignment = findRunnerAssignment('py-print')
    expect(assignment).toBeDefined()
    const tests = evaluateRunnerAssignment(assignment!, 'completed', 'Signal online\n', 'print("Signal online")')

    expect(tests).toEqual(expect.arrayContaining([
      expect.objectContaining({ visibility: 'visible', passed: true }),
      expect.objectContaining({ name: 'Complete the supplied scaffold', visibility: 'hidden', passed: true }),
      expect.objectContaining({ name: 'Finish without a language error', visibility: 'hidden', passed: true }),
    ]))
  })

  it('turns every authored code requirement into a hidden server check', () => {
    const editableExercises = tracks.flatMap((track) => (
      track.missions.flatMap((mission) => mission.exercises.filter((exercise) => (
        exercise.type === 'code' || exercise.type === 'bugfix'
      )))
    ))

    for (const exercise of editableExercises) {
      const assignment = findRunnerAssignment(exercise.id)
      expect(assignment, `${exercise.id} needs a server runner assignment`).toBeDefined()

      const tests = evaluateRunnerAssignment(assignment!, 'compile_error', '', '')
      const requiredCodeTests = tests.filter((test) => test.name.startsWith('Required lesson code'))

      expect(requiredCodeTests, `${exercise.id} needs one hidden test per authored check`).toHaveLength(
        exercise.checks?.length ?? 0,
      )
      expect(requiredCodeTests.every((test) => test.visibility === 'hidden')).toBe(true)
    }
  })

  it('rejects a hardcoded Void Wyrm answer that only prints the expected words', () => {
    const assignment = findRunnerAssignment('py6-void-wyrm')
    expect(assignment).toBeDefined()

    const tests = evaluateRunnerAssignment(
      assignment!,
      'completed',
      'Alert: wyrm\n',
      'print("Alert: wyrm")',
    )

    expect(tests.find((test) => test.name === 'Visible console check')).toMatchObject({ passed: true })
    expect(tests.filter((test) => test.name.startsWith('Required lesson code'))).toHaveLength(3)
    expect(tests.filter((test) => test.name.startsWith('Required lesson code')).every((test) => !test.passed)).toBe(true)
    expect(tests.every((test) => test.passed)).toBe(false)
  })

  it('accepts the complete Void Wyrm solution with every required structure', () => {
    const assignment = findRunnerAssignment('py6-void-wyrm')
    expect(assignment).toBeDefined()
    const source = [
      'def report(current_hazard):',
      '    if current_hazard == "wyrm":',
      '        print("Alert:", current_hazard)',
      '',
      'hazards = ["mist", "wyrm", "moon"]',
      '',
      'for hazard in hazards:',
      '    report(hazard)',
    ].join('\n')

    const tests = evaluateRunnerAssignment(assignment!, 'completed', 'Alert: wyrm\n', source)

    expect(tests.filter((test) => test.name.startsWith('Required lesson code'))).toHaveLength(3)
    expect(tests.every((test) => test.passed)).toBe(true)
  })
})
