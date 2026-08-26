import { describe, expect, it } from 'vitest'

import { evaluateExercise, evaluateExerciseChecks } from '../lib/evaluator'
import {
  cppCollectionsRecordsDraftModules,
  cppCollectionsRecordsReturnValuesModule,
  cppCollectionsRecordsStructsModule,
  cppCollectionsRecordsUpdatesModule,
  cppCollectionsRecordsVectorsModule,
} from './cpp-collections-records-course-draft'
import { cppCollectionsRecordsPlan } from './cpp-collections-records-plan'

describe('Practical C++ return-values draft module', () => {
  const plannedModule = cppCollectionsRecordsPlan.modules[0]
  const exercises = cppCollectionsRecordsReturnValuesModule.exercises
  const draftedExercises = cppCollectionsRecordsDraftModules.flatMap((module) => module.exercises)

  it('matches the design-locked module manifest exactly', () => {
    expect(cppCollectionsRecordsReturnValuesModule.id).toBe(plannedModule.id)
    expect(exercises.map((exercise) => ({
      id: exercise.id,
      conceptId: exercise.conceptId,
      type: exercise.type,
      xp: exercise.xp,
    }))).toEqual(plannedModule.lessons.map((lesson) => ({
      id: lesson.id,
      conceptId: lesson.conceptId,
      type: lesson.type,
      xp: lesson.xp,
    })))
  })

  it('provides complete learner support before every interaction', () => {
    for (const exercise of draftedExercises) {
      expect(exercise.explanation.length, `${exercise.id} needs an explanation`).toBeGreaterThan(100)
      expect(exercise.analogy.length, `${exercise.id} needs an analogy`).toBeGreaterThan(80)
      expect(exercise.prompt.length, `${exercise.id} needs a prompt`).toBeGreaterThan(30)
      expect(exercise.hint.length, `${exercise.id} needs a hint`).toBeGreaterThan(40)
      expect(exercise.recap.length, `${exercise.id} needs a recap`).toBeGreaterThan(60)
    }
  })

  it('makes each choice and prediction answer reviewable', () => {
    for (const exercise of draftedExercises.filter((candidate) => (
      candidate.type === 'choice' || candidate.type === 'prediction'
    ))) {
      expect(exercise.choices).toHaveLength(3)
      expect(exercise.choices?.every((choice) => Boolean(choice.detail))).toBe(true)
      expect(exercise.choices?.some((choice) => choice.id === exercise.correctChoice)).toBe(true)
      expect(evaluateExercise(exercise, exercise.correctChoice ?? '').correct).toBe(true)
    }
  })

  it('keeps both editable exercises bounded and specifically explained', () => {
    const editable = exercises.filter((exercise) => exercise.type === 'bugfix' || exercise.type === 'code')
    expect(editable).toHaveLength(2)

    for (const exercise of editable) {
      expect(exercise.starterCode?.length, `${exercise.id} needs starter source`).toBeGreaterThan(150)
      expect(exercise.focus?.length, `${exercise.id} needs a focus boundary`).toBeGreaterThan(70)
      expect(exercise.codeGuide?.length, `${exercise.id} needs a line guide`).toBeGreaterThanOrEqual(4)
      expect(exercise.checks?.length, `${exercise.id} needs visible checks`).toBeGreaterThanOrEqual(3)
      expect(exercise.output, `${exercise.id} needs expected output`).toBeTruthy()
    }
  })

  it('accepts the taught return repairs and rejects the original mistakes', () => {
    const repair = exercises[3]
    const build = exercises[4]
    const repairedSource = repair.starterCode?.replace('return price;', 'return total;') ?? ''
    const completedSource = build.starterCode?.replace('_____', 'return price * quantity;') ?? ''

    expect(evaluateExerciseChecks(repair, repairedSource).every((check) => check.passed)).toBe(true)
    expect(evaluateExerciseChecks(repair, repair.starterCode ?? '').some((check) => !check.passed)).toBe(true)
    expect(evaluateExerciseChecks(build, completedSource).every((check) => check.passed)).toBe(true)
    expect(evaluateExerciseChecks(build, build.starterCode ?? '').some((check) => !check.passed)).toBe(true)
  })

  it('keeps the authored module unavailable to the current runner registry by construction', async () => {
    const { findRunnerAssignment } = await import('../lib/runner-assignments')
    for (const exercise of exercises.filter((candidate) => (
      candidate.type === 'bugfix' || candidate.type === 'code'
    ))) {
      expect(findRunnerAssignment(exercise.id)).toBeUndefined()
    }
  })

  it('authors a second complete module without introducing references early', () => {
    const vectorPlan = cppCollectionsRecordsPlan.modules[1]
    expect(cppCollectionsRecordsVectorsModule.id).toBe(vectorPlan.id)
    expect(cppCollectionsRecordsVectorsModule.exercises.map((exercise) => ({
      id: exercise.id,
      conceptId: exercise.conceptId,
      type: exercise.type,
      xp: exercise.xp,
    }))).toEqual(vectorPlan.lessons.map((lesson) => ({
      id: lesson.id,
      conceptId: lesson.conceptId,
      type: lesson.type,
      xp: lesson.xp,
    })))
    const learnerSource = cppCollectionsRecordsVectorsModule.exercises.flatMap((exercise) => [
      exercise.displayCode ?? '',
      exercise.starterCode ?? '',
      ...(exercise.codeGuide?.map((entry) => entry.code) ?? []),
    ]).join('\n')
    expect(learnerSource).not.toMatch(/std::vector\s*<[^>]+>\s*&/u)
    expect(cppCollectionsRecordsVectorsModule.exercises[1].explanation).toContain('dot')
    expect(cppCollectionsRecordsVectorsModule.exercises[1].explanation).toContain('member function')
    expect(cppCollectionsRecordsVectorsModule.exercises[2].explanation).toContain('push_back')
    expect(cppCollectionsRecordsVectorsModule.exercises[2].explanation).toContain('size')
  })

  it('keeps both Module 2 edits bounded, checkable, and outside the runner registry', async () => {
    const editable = cppCollectionsRecordsVectorsModule.exercises.filter((exercise) => (
      exercise.type === 'bugfix' || exercise.type === 'code'
    ))
    const repair = editable[0]
    const build = editable[1]
    const repairedSource = repair.starterCode?.replace(
      'parts.push_back["seals"];',
      'parts.push_back("seals");',
    ) ?? ''
    const completedSource = build.starterCode
      ?.replace('_____', '"seals"')
      .replace('_____', 'push_back') ?? ''
    const { findRunnerAssignment } = await import('../lib/runner-assignments')

    expect(editable).toHaveLength(2)
    expect(evaluateExerciseChecks(repair, repairedSource).every((check) => check.passed)).toBe(true)
    expect(evaluateExerciseChecks(repair, repair.starterCode ?? '').some((check) => !check.passed)).toBe(true)
    expect(evaluateExerciseChecks(build, completedSource).every((check) => check.passed)).toBe(true)
    expect(evaluateExerciseChecks(build, build.starterCode ?? '').some((check) => !check.passed)).toBe(true)
    for (const exercise of editable) expect(findRunnerAssignment(exercise.id)).toBeUndefined()
  })

  it('authors Modules 3 and 4 against their design-locked manifests', () => {
    const authoredModules = [
      cppCollectionsRecordsStructsModule,
      cppCollectionsRecordsUpdatesModule,
    ]

    for (const [index, module] of authoredModules.entries()) {
      const planned = cppCollectionsRecordsPlan.modules[index + 2]
      expect(module.id).toBe(planned.id)
      expect(module.exercises.map((exercise) => ({
        id: exercise.id,
        conceptId: exercise.conceptId,
        type: exercise.type,
        xp: exercise.xp,
      }))).toEqual(planned.lessons.map((lesson) => ({
        id: lesson.id,
        conceptId: lesson.conceptId,
        type: lesson.type,
        xp: lesson.xp,
      })))
    }
  })

  it('teaches the complete record vocabulary before Module 3 asks for field work', () => {
    const exercises = cppCollectionsRecordsStructsModule.exercises
    const recordIntroduction = exercises[1]
    const learnerSource = exercises.flatMap((exercise) => [
      exercise.displayCode ?? '',
      exercise.starterCode ?? '',
      ...(exercise.codeGuide?.map((entry) => entry.code) ?? []),
    ]).join('\n')

    expect(recordIntroduction.explanation).toContain('record')
    expect(recordIntroduction.explanation).toContain('struct')
    expect(recordIntroduction.explanation).toContain('field')
    expect(recordIntroduction.explanation).toContain('aggregate initialization')
    expect(recordIntroduction.explanation).toContain('braces')
    expect(exercises[2].explanation).toContain('dot operator')
    expect(learnerSource).not.toContain('&')
  })

  it('accepts the taught Module 3 edits and rejects both supplied mistakes', () => {
    const exercises = cppCollectionsRecordsStructsModule.exercises
    const repair = exercises[3]
    const build = exercises[4]
    const repairedSource = repair.starterCode?.replace('part.label', 'part.name') ?? ''
    const completedSource = build.starterCode
      ?.replace('_____', '"bolts"')
      .replace('_____', '4') ?? ''

    expect(evaluateExerciseChecks(repair, repairedSource).every((check) => check.passed)).toBe(true)
    expect(evaluateExerciseChecks(repair, repair.starterCode ?? '').some((check) => !check.passed)).toBe(true)
    expect(evaluateExerciseChecks(build, completedSource).every((check) => check.passed)).toBe(true)
    expect(evaluateExerciseChecks(build, build.starterCode ?? '').some((check) => !check.passed)).toBe(true)
    expect(repair.output).toBe('bolts')
    expect(build.output).toBe('bolts: 4')
  })

  it('introduces references in Module 4 only after its copy-based retrieval lesson', () => {
    const exercises = cppCollectionsRecordsUpdatesModule.exercises
    const retrievalSource = [
      exercises[0].displayCode ?? '',
      exercises[0].starterCode ?? '',
    ].join('\n')
    const referenceIntroduction = exercises[1]
    const beforeVectorReference = exercises.slice(0, 4).flatMap((exercise) => [
      exercise.displayCode ?? '',
      exercise.starterCode ?? '',
      ...(exercise.codeGuide?.map((entry) => entry.code) ?? []),
    ]).join('\n')
    const finalLessonSource = [
      exercises[4].starterCode ?? '',
      ...(exercises[4].codeGuide?.map((entry) => entry.code) ?? []),
    ].join('\n')

    expect(retrievalSource).not.toContain('&')
    expect(referenceIntroduction.explanation).toContain('copy')
    expect(referenceIntroduction.explanation).toContain('original')
    expect(referenceIntroduction.explanation).toContain('ampersand')
    expect(referenceIntroduction.explanation).toContain('Part&')
    expect(referenceIntroduction.explanation).toContain('function parameter')
    expect(referenceIntroduction.explanation).toContain('range-based loop variable')
    expect(beforeVectorReference).not.toMatch(/std::vector\s*<\s*Part\s*>\s*&/u)
    expect(finalLessonSource).toMatch(/std::vector\s*<\s*Part\s*>\s*&/u)
  })

  it('accepts the taught Module 4 reference repairs and rejects copy-based source', () => {
    const exercises = cppCollectionsRecordsUpdatesModule.exercises
    const repair = exercises[3]
    const build = exercises[4]
    const repairedSource = repair.starterCode?.replace(
      'for (Part current : parts)',
      'for (Part& current : parts)',
    ) ?? ''
    const completedSource = build.starterCode
      ?.replace('_____', 'part.name == target')
      .replace('_____', 'part.quantity = part.quantity + amount') ?? ''

    expect(evaluateExerciseChecks(repair, repairedSource).every((check) => check.passed)).toBe(true)
    expect(evaluateExerciseChecks(repair, repair.starterCode ?? '').some((check) => !check.passed)).toBe(true)
    expect(evaluateExerciseChecks(build, completedSource).every((check) => check.passed)).toBe(true)
    expect(evaluateExerciseChecks(build, build.starterCode ?? '').some((check) => !check.passed)).toBe(true)
    expect(repair.output).toBe('bolts: 7')
    expect(build.output).toBe('seals: 5')
  })

  it('keeps all four authored modules outside the current runner registry', async () => {
    const { findRunnerAssignment } = await import('../lib/runner-assignments')

    for (const exercise of draftedExercises.filter((candidate) => (
      candidate.type === 'bugfix' || candidate.type === 'code'
    ))) {
      expect(findRunnerAssignment(exercise.id)).toBeUndefined()
    }
  })

  it('keeps the four authored draft modules ordered and unpublished', () => {
    expect(cppCollectionsRecordsDraftModules.map((module) => module.id)).toEqual([
      'cpp-records-return-values',
      'cpp-records-vectors',
      'cpp-records-structs',
      'cpp-records-updates',
    ])
    expect(draftedExercises).toHaveLength(20)
    expect(draftedExercises.reduce((total, exercise) => total + exercise.xp, 0)).toBe(280)

    for (const exercise of draftedExercises.filter((candidate) => (
      candidate.type === 'bugfix' || candidate.type === 'code'
    ))) {
      expect(exercise.starterCode?.length, `${exercise.id} needs starter source`).toBeGreaterThan(150)
      expect(exercise.focus?.length, `${exercise.id} needs a focus boundary`).toBeGreaterThan(70)
      expect(exercise.codeGuide?.length, `${exercise.id} needs a line guide`).toBeGreaterThanOrEqual(4)
      expect(exercise.checks?.length, `${exercise.id} needs visible checks`).toBeGreaterThanOrEqual(3)
      expect(exercise.output, `${exercise.id} needs expected output`).toBeTruthy()
    }
  })
})
