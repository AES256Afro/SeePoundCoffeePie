import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { evaluateExercise, evaluateExerciseChecks } from '../lib/evaluator'
import {
  cppCollectionsRecordsDraftModules,
  cppCollectionsRecordsReturnValuesModule,
  cppCollectionsRecordsSummariesModule,
  cppCollectionsRecordsStructsModule,
  cppCollectionsRecordsUpdatesModule,
  cppCollectionsRecordsVectorsModule,
  cppCollectionsRecordsWorkshopReportModule,
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

  it('publishes both authored edits through the current runner registry', async () => {
    const { findRunnerAssignment } = await import('../lib/runner-assignments')
    for (const exercise of exercises.filter((candidate) => (
      candidate.type === 'bugfix' || candidate.type === 'code'
    ))) {
      expect(findRunnerAssignment(exercise.id)).toMatchObject({
        exerciseId: exercise.id,
        language: 'cpp',
        expectedOutput: exercise.output,
      })
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

  it('keeps both Module 2 edits bounded, checkable, and in the runner registry', async () => {
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
    for (const exercise of editable) {
      expect(findRunnerAssignment(exercise.id)).toMatchObject({
        exerciseId: exercise.id,
        language: 'cpp',
        expectedOutput: exercise.output,
      })
    }
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

  it('authors Modules 5 and 6 against their design-locked manifests', () => {
    const authoredModules = [
      cppCollectionsRecordsSummariesModule,
      cppCollectionsRecordsWorkshopReportModule,
    ]

    for (const [index, module] of authoredModules.entries()) {
      const planned = cppCollectionsRecordsPlan.modules[index + 4]
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

  it('defines Module 5 summary vocabulary before requiring the ordered and editable work', () => {
    const exercises = cppCollectionsRecordsSummariesModule.exercises
    const accumulatorIntroduction = exercises[1].explanation
    const filterIntroduction = exercises[4].explanation
    const learnerSource = exercises.flatMap((exercise) => [
      exercise.displayCode ?? '',
      exercise.starterCode ?? '',
      ...(exercise.codeGuide?.map((entry) => entry.code) ?? []),
    ]).join('\n')

    expect(accumulatorIntroduction).toContain('accumulator')
    expect(accumulatorIntroduction).toContain('Initialize it once before the loop')
    expect(accumulatorIntroduction).toContain('total = total + part.quantity')
    expect(exercises[2].explanation).toContain('Aggregation')
    expect(filterIntroduction).toContain('filter')
    expect(filterIntroduction).toContain('result collection')
    expect(filterIntroduction).toContain('by value')
    expect(filterIntroduction).toContain('copy')
    expect(learnerSource).not.toContain('+=')
    expect(learnerSource).not.toMatch(/\bauto\b/u)
    expect(learnerSource).not.toContain('using namespace')
  })

  it('keeps both new ordering interactions complete, shuffled, and exactly checkable', () => {
    const orderingExercises = [
      cppCollectionsRecordsSummariesModule.exercises[2],
      cppCollectionsRecordsWorkshopReportModule.exercises[2],
    ]

    for (const exercise of orderingExercises) {
      const itemIds = exercise.orderItems?.map((item) => item.id) ?? []
      expect(new Set(itemIds)).toEqual(new Set(exercise.correctOrder))
      expect(itemIds, exercise.id + ' should not begin already solved').not.toEqual(exercise.correctOrder)
      expect(evaluateExercise(exercise, exercise.correctOrder?.join('|') ?? '')).toMatchObject({
        correct: true,
        output: exercise.output,
      })
      expect(evaluateExercise(exercise, itemIds.join('|')).correct).toBe(false)
    }
  })

  it('accepts the authentic Module 5 solutions and rejects both supplied mistakes', () => {
    const exercises = cppCollectionsRecordsSummariesModule.exercises
    const repair = exercises[3]
    const build = exercises[4]
    const repairedSource = repair.starterCode?.replace(
      '    for (Part part : parts) {\n        int total = 0;',
      '    int total = 0;\n    for (Part part : parts) {',
    ) ?? ''
    const completedSource = build.starterCode
      ?.replace('_____', 'part.quantity < limit')
      .replace('_____', 'names.push_back(part.name)') ?? ''

    expect(evaluateExerciseChecks(repair, repairedSource).every((check) => check.passed)).toBe(true)
    expect(evaluateExerciseChecks(repair, repair.starterCode ?? '').some((check) => !check.passed)).toBe(true)
    expect(evaluateExerciseChecks(build, completedSource).every((check) => check.passed)).toBe(true)
    expect(evaluateExerciseChecks(build, build.starterCode ?? '').some((check) => !check.passed)).toBe(true)
    expect(repair.output).toBe('14')
    expect(build.output).toBe('seals\nclips')
  })

  it('defines Module 6 responsibility and boundary rules before the capstone requires them', () => {
    const exercises = cppCollectionsRecordsWorkshopReportModule.exercises
    const planningIntroduction = exercises[1].explanation
    const boundaryRepair = exercises[3]
    const capstone = exercises[4]

    expect(planningIntroduction).toContain('helper responsibility')
    expect(planningIntroduction).toContain('Data flow')
    expect(exercises[2].explanation).toContain('Dependency order')
    expect(boundaryRepair.explanation).toContain('strictly less than')
    expect(boundaryRepair.explanation).toContain('equal to the limit is not included')
    expect(capstone.explanation).toContain('by value')
    expect(capstone.explanation).toContain('copies')
    expect(capstone.explanation).toContain('does not introduce const-reference syntax')
    expect(capstone.starterCode?.match(/_____/gu)).toHaveLength(5)
    expect(capstone.checks).toHaveLength(5)
  })

  it('accepts the authentic Module 6 repairs and rejects incorrect source', () => {
    const exercises = cppCollectionsRecordsWorkshopReportModule.exercises
    const repair = exercises[3]
    const capstone = exercises[4]
    const repairedSource = repair.starterCode?.replace(
      'part.quantity > limit',
      'part.quantity < limit',
    ) ?? ''
    const completedSource = capstone.starterCode
      ?.replace('_____', 'part.quantity = part.quantity + amount;')
      .replace('_____', 'total = total + part.quantity;')
      .replace('_____', 'part.quantity < limit')
      .replace('_____', 'names.push_back(part.name);')
      .replace('_____', 'total_units(parts)') ?? ''
    const incorrectSources = [
      capstone.starterCode ?? '',
      completedSource.replace(
        'part.quantity = part.quantity + amount;',
        'part.quantity = amount;',
      ),
      completedSource.replace(
        'total = total + part.quantity;',
        'total = part.quantity;',
      ),
      completedSource.replace('part.quantity < limit', 'part.quantity <= limit'),
      completedSource.replace(
        'names.push_back(part.name);',
        'names.push_back("seals");',
      ),
      completedSource.replace('total_units(parts)', '17'),
    ]

    expect(evaluateExerciseChecks(repair, repairedSource).every((check) => check.passed)).toBe(true)
    expect(evaluateExerciseChecks(repair, repair.starterCode ?? '').some((check) => !check.passed)).toBe(true)
    expect(evaluateExerciseChecks(capstone, completedSource).every((check) => check.passed)).toBe(true)
    for (const incorrectSource of incorrectSources) {
      expect(
        evaluateExerciseChecks(capstone, incorrectSource).some((check) => !check.passed),
        'Each incomplete or incorrect capstone source should fail at least one public check.',
      ).toBe(true)
    }
    expect(repair.output).toBe('Low stock: seals')
    expect(capstone.output).toBe('Parts: 3\nTotal units: 17\nLow stock: seals')
  })

  it('compiles and runs all four new authentic C++20 solutions', () => {
    const module5Repair = cppCollectionsRecordsSummariesModule.exercises[3]
    const module5Build = cppCollectionsRecordsSummariesModule.exercises[4]
    const module6Repair = cppCollectionsRecordsWorkshopReportModule.exercises[3]
    const module6Capstone = cppCollectionsRecordsWorkshopReportModule.exercises[4]
    const authenticSources = [
      {
        exercise: module5Repair,
        source: module5Repair.starterCode?.replace(
          '    for (Part part : parts) {\n        int total = 0;',
          '    int total = 0;\n    for (Part part : parts) {',
        ) ?? '',
      },
      {
        exercise: module5Build,
        source: module5Build.starterCode
          ?.replace('_____', 'part.quantity < limit')
          .replace('_____', 'names.push_back(part.name)') ?? '',
      },
      {
        exercise: module6Repair,
        source: module6Repair.starterCode?.replace(
          'part.quantity > limit',
          'part.quantity < limit',
        ) ?? '',
      },
      {
        exercise: module6Capstone,
        source: module6Capstone.starterCode
          ?.replace('_____', 'part.quantity = part.quantity + amount;')
          .replace('_____', 'total = total + part.quantity;')
          .replace('_____', 'part.quantity < limit')
          .replace('_____', 'names.push_back(part.name);')
          .replace('_____', 'total_units(parts)') ?? '',
      },
    ]
    const buildDirectory = mkdtempSync(path.join(tmpdir(), 'seepoundcoffeepie-cpp-records-'))

    try {
      for (const { exercise, source } of authenticSources) {
        const sourcePath = path.join(buildDirectory, `${exercise.id}.cpp`)
        const executablePath = path.join(buildDirectory, exercise.id)
        writeFileSync(sourcePath, source, 'utf8')
        execFileSync('c++', ['-std=c++20', sourcePath, '-o', executablePath], {
          encoding: 'utf8',
          timeout: 15_000,
        })
        const output = execFileSync(executablePath, [], {
          encoding: 'utf8',
          timeout: 5_000,
        }).trimEnd()
        expect(output, `${exercise.id} should produce its authored output`).toBe(exercise.output)
      }
    } finally {
      rmSync(buildDirectory, { recursive: true, force: true })
    }
  }, 30_000)

  it('publishes only the twelve editable exercises through the current runner registry', async () => {
    const { findRunnerAssignment } = await import('../lib/runner-assignments')

    for (const exercise of draftedExercises) {
      if (exercise.type === 'bugfix' || exercise.type === 'code') {
        expect(findRunnerAssignment(exercise.id)).toMatchObject({
          exerciseId: exercise.id,
          language: 'cpp',
          expectedOutput: exercise.output,
        })
      } else {
        expect(findRunnerAssignment(exercise.id)).toBeUndefined()
      }
    }
  })

  it('keeps the six published authored modules ordered', () => {
    expect(cppCollectionsRecordsDraftModules.map((module) => module.id)).toEqual([
      'cpp-records-return-values',
      'cpp-records-vectors',
      'cpp-records-structs',
      'cpp-records-updates',
      'cpp-records-summaries',
      'cpp-records-workshop-report',
    ])
    expect(draftedExercises).toHaveLength(30)
    expect(draftedExercises.reduce((total, exercise) => total + exercise.xp, 0)).toBe(420)

    const editableExercises = draftedExercises.filter((candidate) => (
      candidate.type === 'bugfix' || candidate.type === 'code'
    ))
    expect(editableExercises).toHaveLength(12)

    for (const exercise of editableExercises) {
      expect(exercise.starterCode?.length, `${exercise.id} needs starter source`).toBeGreaterThan(150)
      expect(exercise.focus?.length, `${exercise.id} needs a focus boundary`).toBeGreaterThan(70)
      expect(exercise.codeGuide?.length, `${exercise.id} needs a line guide`).toBeGreaterThanOrEqual(4)
      expect(exercise.checks?.length, `${exercise.id} needs visible checks`).toBeGreaterThanOrEqual(3)
      expect(exercise.output, `${exercise.id} needs expected output`).toBeTruthy()
    }
  })
})
