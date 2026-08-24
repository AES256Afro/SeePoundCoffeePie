import { describe, expect, it } from 'vitest'
import { evaluateRunnerAssignment, findRunnerAssignment, runnerAssignmentCount } from './runner-assignments'

describe('server-owned runner assignments', () => {
  it('covers every authored editable exercise with real output', () => {
    expect(runnerAssignmentCount()).toBe(48)
    expect(findRunnerAssignment('py-print')).toMatchObject({ language: 'python', expectedOutput: 'Signal online' })
    expect(findRunnerAssignment('java-galley-report')).toMatchObject({ language: 'java' })
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
})
