import { describe, expect, it } from 'vitest'
import { cppCompiledProject } from '../data/cpp-compiled-project'
import { tracks } from '../data/curriculum'
import { csharpWorkshopProject } from '../data/csharp-workshop-project'
import { javaPicnicProject } from '../data/java-picnic-project'
import { pythonDataToolsCourse } from '../data/python-data-tools-course'
import { pythonDataToolsServerAssessment } from '../data/python-data-tools.server'
import { pythonInteractiveProject } from '../data/python-interactive-project'
import {
  evaluateRunnerAssignment,
  findRunnerAssignment,
  registerRunnerAssignment,
  runnerAssignmentCount,
} from './runner-assignments'

const editableAcademyExercises = [
  ...tracks.flatMap((track) => track.missions.flatMap((mission) => mission.exercises)),
  ...pythonDataToolsCourse.missions.flatMap((mission) => mission.exercises),
].filter((exercise) => (
  (exercise.type === 'code' || exercise.type === 'bugfix') && exercise.output !== undefined
))

const editableProjectExercises = [
  pythonInteractiveProject,
  cppCompiledProject,
  csharpWorkshopProject,
  javaPicnicProject,
].flatMap((project) => project.checkpoints.map((checkpoint) => checkpoint.exercise)).filter((exercise) => (
  (exercise.type === 'code' || exercise.type === 'bugfix') && exercise.output !== undefined
))

describe('server-owned runner assignments', () => {
  it('covers every authored editable exercise with real output', () => {
    expect(runnerAssignmentCount()).toBe(100)
    expect(runnerAssignmentCount()).toBe(editableAcademyExercises.length + editableProjectExercises.length)
    expect(findRunnerAssignment('py-print')).toMatchObject({ language: 'python', expectedOutput: 'Signal online' })
    expect(findRunnerAssignment('java-galley-report')).toMatchObject({ language: 'java' })
    expect(findRunnerAssignment('project-py-final')).toMatchObject({ language: 'python', kind: 'project' })
    expect(findRunnerAssignment('project-cpp-final')).toMatchObject({ language: 'cpp', kind: 'project' })
    expect(findRunnerAssignment('project-csharp-final')).toMatchObject({ language: 'csharp', kind: 'project' })
    expect(findRunnerAssignment('project-java-final')).toMatchObject({ language: 'java', kind: 'project' })
  })

  it('registers all twelve Practical Python editable lessons under the Python runtime', () => {
    const exerciseIds = [
      'pydata1-fix-return',
      'pydata1-subtotal',
      'pydata2-fix-method-call',
      'pydata2-normalize-name',
      'pydata3-fix-membership',
      'pydata3-add-unique',
      'pydata4-fix-missing-key',
      'pydata4-add-stock',
      'pydata5-fix-total-reset',
      'pydata5-low-stock',
      'pydata6-fix-normalized-key',
      'pydata6-supply-tracker',
    ]

    expect(exerciseIds.map((exerciseId) => findRunnerAssignment(exerciseId))).toEqual(
      exerciseIds.map((exerciseId) => expect.objectContaining({
        exerciseId,
        language: 'python',
        kind: 'academy',
      })),
    )
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

  it('throws before a duplicate exercise ID can replace its first assignment', () => {
    const assignment = findRunnerAssignment('py-print')
    expect(assignment).toBeDefined()
    const registry = new Map()

    registerRunnerAssignment(registry, assignment!)
    expect(() => registerRunnerAssignment(registry, { ...assignment!, kind: 'project' })).toThrow(
      'Duplicate runner assignment py-print (academy and project).',
    )
    expect(registry.get('py-print')).toBe(assignment)
  })

  it('fails fast on invalid protected-assessment configuration', () => {
    const pythonAssignment = findRunnerAssignment('py-print')
    const cppAssignment = findRunnerAssignment('cpp-reactor-report')
    const projectAssignment = findRunnerAssignment('project-py-final')
    expect(pythonAssignment).toBeDefined()
    expect(cppAssignment).toBeDefined()
    expect(projectAssignment).toBeDefined()

    expect(() => registerRunnerAssignment(new Map(), {
      ...projectAssignment!,
      assessment: pythonDataToolsServerAssessment,
    })).toThrow('declares two protected assessments')
    expect(() => registerRunnerAssignment(new Map(), {
      ...pythonAssignment!,
      assessment: { ...pythonDataToolsServerAssessment, language: 'cpp' },
    })).toThrow('has a mismatched assessment language')
    expect(() => registerRunnerAssignment(new Map(), {
      ...cppAssignment!,
      assessment: { ...pythonDataToolsServerAssessment, language: 'cpp' },
    })).toThrow('has a Python-only assessment profile')
    expect(() => registerRunnerAssignment(new Map(), {
      ...pythonAssignment!,
      assessment: {
        ...pythonDataToolsServerAssessment,
        testCases: pythonDataToolsServerAssessment.testCases.map((testCase) => ({
          ...testCase,
          visibility: 'hidden',
        })),
      },
    })).toThrow('needs exactly one visible assessment case')
  })

  it('turns every authored code requirement into a hidden server check', () => {
    for (const exercise of editableAcademyExercises) {
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

  it('keeps every course and project runner exercise under one global owner', () => {
    const exercises = [...editableAcademyExercises, ...editableProjectExercises]
    const ids = exercises.map((exercise) => exercise.id)

    expect(new Set(ids).size).toBe(ids.length)
    for (const exercise of exercises) {
      expect(findRunnerAssignment(exercise.id)?.exercise).toBe(exercise)
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
