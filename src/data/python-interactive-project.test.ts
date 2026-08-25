/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  pythonInteractiveProject,
  type ProjectScaffoldingLevel,
} from './python-interactive-project'
import { pythonInteractiveProjectServerAssessment } from './python-interactive-project.server'
import { pythonInteractiveProjectManifest } from './python-interactive-project-manifest'
import {
  evaluateProjectStructuralChecks,
  type PythonAnalysis,
} from '../lib/runner-assignments'

const checkpoints = pythonInteractiveProject.checkpoints
const exercises = checkpoints.map((checkpoint) => checkpoint.exercise)
const clientModuleSource = readFileSync(new URL('./python-interactive-project.ts', import.meta.url), 'utf8')
const serverModuleSource = readFileSync(new URL('./python-interactive-project.server.ts', import.meta.url), 'utf8')

const referencePythonAnalysis: PythonAnalysis = {
  version: 1,
  parsed: true,
  straight_line: true,
  assignments: [
    { target: 'price_per_cup', occurrence: 1, kind: 'integer', value: 3 },
    { target: 'name', occurrence: 1, kind: 'input' },
    { target: 'cups_text', occurrence: 1, kind: 'input' },
    { target: 'cups', occurrence: 1, kind: 'int_name', name: 'cups_text' },
    { target: 'total', occurrence: 1, kind: 'multiply_names', names: ['cups', 'price_per_cup'] },
  ],
  print_fstrings: [{ occurrence: 1, fields: ['name', 'cups', 'total'] }],
}

describe('Phase 4A Python interactive project', () => {
  it('defines one bookmarkable twelve-checkpoint Python project', () => {
    expect(pythonInteractiveProject.id).toBe('first-interactive-program')
    expect(pythonInteractiveProject.language).toBe('python')
    expect(pythonInteractiveProject.route).toBe('/projects/python/first-interactive-program')
    expect(checkpoints).toHaveLength(12)

    const checkpointIds = checkpoints.map((checkpoint) => checkpoint.id)
    const exerciseIds = exercises.map((exercise) => exercise.id)
    expect(new Set(checkpointIds).size).toBe(checkpointIds.length)
    expect(new Set(exerciseIds).size).toBe(exerciseIds.length)
    expect(exerciseIds).toEqual(checkpointIds)
    expect(checkpoints.map((checkpoint) => checkpoint.order)).toEqual(
      Array.from({ length: 12 }, (_, index) => index + 1),
    )
  })

  it('keeps the first-load project manifest aligned with the route-loaded curriculum', () => {
    expect({
      id: pythonInteractiveProject.id,
      language: pythonInteractiveProject.language,
      title: pythonInteractiveProject.title,
      subtitle: pythonInteractiveProject.subtitle,
      description: pythonInteractiveProject.description,
      outcome: pythonInteractiveProject.outcome,
      duration: pythonInteractiveProject.duration,
      route: pythonInteractiveProject.route,
    }).toEqual({
      id: pythonInteractiveProjectManifest.id,
      language: pythonInteractiveProjectManifest.language,
      title: pythonInteractiveProjectManifest.title,
      subtitle: pythonInteractiveProjectManifest.subtitle,
      description: pythonInteractiveProjectManifest.description,
      outcome: pythonInteractiveProjectManifest.outcome,
      duration: pythonInteractiveProjectManifest.duration,
      route: pythonInteractiveProjectManifest.route,
    })
    expect(pythonInteractiveProject.checkpoints.map((checkpoint) => ({
      id: checkpoint.id,
      order: checkpoint.order,
      title: checkpoint.title,
      conceptId: checkpoint.exercise.conceptId,
      xp: checkpoint.exercise.xp,
    }))).toEqual(pythonInteractiveProjectManifest.checkpoints)
  })

  it('covers every promised beginner concept in a deliberate order', () => {
    expect(exercises.map((exercise) => exercise.conceptId)).toEqual([
      'project-python-print',
      'project-python-strings',
      'project-python-variables',
      'project-python-integers',
      'project-python-arithmetic',
      'project-python-input',
      'project-python-input-as-text',
      'project-python-int-conversion',
      'project-python-f-strings',
      'project-python-traceback',
      'project-python-assembly',
      'project-python-final-interactive-program',
    ])

    const firstDeclaration = new Map<string, number>()
    for (const checkpoint of checkpoints) {
      for (const term of checkpoint.newTerms) {
        expect(firstDeclaration.has(term.term), `${term.term} must be introduced only once`).toBe(false)
        firstDeclaration.set(term.term, checkpoint.order)
      }
    }

    expect(Object.fromEntries(firstDeclaration)).toMatchObject({
      program: 1,
      console: 1,
      print: 1,
      string: 1,
      variable: 3,
      integer: 4,
      operator: 5,
      input: 6,
      'return value': 7,
      conversion: 8,
      'int()': 8,
      'f-string': 9,
      traceback: 10,
      ValueError: 10,
      'test case': 12,
      'hidden check': 12,
    })
  })

  it('gives beginners explanations, analogies, vocabulary, guides, hints, recaps, and XP', () => {
    for (const checkpoint of checkpoints) {
      const { exercise } = checkpoint
      expect(checkpoint.objective.length, `${checkpoint.id} needs a clear objective`).toBeGreaterThan(35)
      expect(exercise.explanation.length, `${checkpoint.id} needs a patient explanation`).toBeGreaterThan(100)
      expect(exercise.analogy.length, `${checkpoint.id} needs a memorable analogy`).toBeGreaterThan(80)
      expect(exercise.hint.length, `${checkpoint.id} needs a useful hint`).toBeGreaterThan(35)
      expect(exercise.recap.length, `${checkpoint.id} needs a retrieval recap`).toBeGreaterThan(55)
      expect(exercise.xp, `${checkpoint.id} needs a positive XP reward`).toBeGreaterThan(0)

      for (const term of checkpoint.newTerms) {
        expect(term.term.trim(), `${checkpoint.id} has a blank term`).not.toBe('')
        expect(term.meaning.length, `${term.term} needs a plain definition`).toBeGreaterThan(30)
      }

      if (exercise.type === 'code' || exercise.type === 'bugfix') {
        expect(exercise.focus?.length, `${checkpoint.id} needs one bounded job`).toBeGreaterThan(45)
        expect(exercise.codeGuide?.length, `${checkpoint.id} needs a code guide`).toBeGreaterThanOrEqual(4)
        for (const item of exercise.codeGuide ?? []) {
          expect(item.code.trim()).not.toBe('')
          expect(item.plain.length).toBeGreaterThan(35)
        }
      }
    }
  })

  it('fades from blanks to complete learner-authored lines', () => {
    const scaffoldRank: Record<ProjectScaffoldingLevel, number> = {
      guided: 0,
      supported: 1,
      independent: 2,
    }
    const ranks = checkpoints.map((checkpoint) => scaffoldRank[checkpoint.scaffolding])

    expect(ranks.every((rank, index) => index === 0 || rank >= ranks[index - 1])).toBe(true)
    expect(checkpoints.slice(-2).every((checkpoint) => checkpoint.scaffolding === 'independent')).toBe(true)

    const codeExercises = exercises.filter((exercise) => exercise.type === 'code')
    const codeWithBlanks = codeExercises.filter((exercise) => exercise.starterCode?.includes('_____'))
    const codeWithoutBlanks = codeExercises.filter((exercise) => !exercise.starterCode?.includes('_____'))

    expect(codeWithBlanks.map((exercise) => exercise.id)).toEqual([
      'project-py-print',
      'project-py-variable',
      'project-py-integer',
      'project-py-arithmetic',
      'project-py-input',
    ])
    expect(codeWithoutBlanks.map((exercise) => exercise.id)).toEqual([
      'project-py-conversion',
      'project-py-f-string',
      'project-py-assembly',
      'project-py-final',
    ])
    expect(codeWithoutBlanks.length).toBeGreaterThanOrEqual(3)
  })

  it('makes the final checkpoint a multi-line interactive calculator', () => {
    const finalCheckpoint = checkpoints.at(-1)
    const finalExercise = finalCheckpoint?.exercise
    const source = pythonInteractiveProjectServerAssessment.referenceSolution

    expect(finalCheckpoint?.id).toBe('project-py-final')
    expect(finalExercise?.type).toBe('code')
    expect(finalExercise?.starterCode).not.toContain('_____')
    expect(finalCheckpoint?.requirements).toHaveLength(7)
    expect(finalCheckpoint?.requirements?.join(' ')).toContain('customer name')
    expect(finalCheckpoint?.requirements?.join(' ')).toContain('cup count')
    expect(finalCheckpoint?.requirements?.join(' ')).toContain('int()')
    expect(finalCheckpoint?.requirements?.join(' ')).toContain('multiplying')
    expect(finalCheckpoint?.requirements?.join(' ')).toContain('f-string')

    expect(source).toContain('name = input(')
    expect(source).toContain('cups_text = input(')
    expect(source).toContain('cups = int(cups_text)')
    expect(source).toContain('total = cups * price_per_cup')
    expect(source).toContain('print(f"{name}, your {cups} cup order costs ${total}.")')
    expect(source.split('\n').length).toBeGreaterThanOrEqual(7)

    expect(evaluateProjectStructuralChecks(
      pythonInteractiveProjectServerAssessment,
      referencePythonAnalysis,
    ).every((check) => check.passed)).toBe(true)
  })

  it('keeps hidden cases in the server export and exposes only a safe client summary', () => {
    const finalCheckpoint = checkpoints.at(-1)
    const assessment = pythonInteractiveProjectServerAssessment
    const summary = finalCheckpoint?.assessmentSummary
    const serializedClientProject = JSON.stringify(pythonInteractiveProject)

    expect(assessment.testCases).toHaveLength(4)
    expect(assessment.testCases.filter((testCase) => testCase.visibility === 'hidden')).toHaveLength(3)
    expect(summary?.hiddenTestCount).toBe(3)
    expect(summary?.structuralCheckCount).toBe(assessment.structuralChecks.length)
    expect(summary?.visibleTestCase.visibility).toBe('visible')
    expect(summary?.visibleTestCase.stdin).toBe(finalCheckpoint?.practiceStdin)
    expect(serializedClientProject).not.toContain(assessment.referenceSolution)

    for (const hiddenCase of assessment.testCases.filter((testCase) => testCase.visibility === 'hidden')) {
      expect(serializedClientProject).not.toContain(hiddenCase.stdin)
      expect(serializedClientProject).not.toContain(hiddenCase.expectedStdout)
    }
  })

  it('keeps private grading values out of the client module source', () => {
    const privateMarkers = [
      'Morgan',
      'Riley',
      'Sam Lee',
      'final-hidden-one-cup',
      'final-hidden-seven-cups',
      'final-hidden-spaced-name',
      'referenceSolution',
      'name = input("What is your name?\\\\n")',
      "validation: 'python-assignment-integer'",
    ]

    for (const marker of privateMarkers) {
      expect(clientModuleSource, `client module must not contain ${marker}`).not.toContain(marker)
      expect(serverModuleSource, `server module must own ${marker}`).toContain(marker)
    }
    expect(clientModuleSource).not.toContain('python-interactive-project.server')
  })

  it('uses diverse server-owned inputs and internally consistent expected outputs', () => {
    const testCases = pythonInteractiveProjectServerAssessment.testCases
    const ids = testCases.map((testCase) => testCase.id)
    const inputs = testCases.map((testCase) => testCase.stdin)

    expect(new Set(ids).size).toBe(ids.length)
    expect(new Set(inputs).size).toBe(inputs.length)

    const parsedCases = testCases.map((testCase) => {
      const [name, cupsText] = testCase.stdin.trimEnd().split('\n')
      return { testCase, name, cups: Number(cupsText) }
    })

    expect(parsedCases.map(({ cups }) => cups)).toEqual([2, 1, 7, 0])
    expect(parsedCases.some(({ name }) => name.includes(' '))).toBe(true)

    for (const { testCase, name, cups } of parsedCases) {
      expect(Number.isInteger(cups)).toBe(true)
      expect(testCase.expectedStdout).toContain(`${name}, your ${cups} cup order costs $${cups * 3}.`)
      expect(testCase.purpose.length).toBeGreaterThan(45)
    }
  })

  it('keeps every learner-facing string in the ASCII character set', () => {
    expect(JSON.stringify(pythonInteractiveProject)).toMatch(/^[\x20-\x7E]*$/u)
  })
})
