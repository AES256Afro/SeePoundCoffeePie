/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { evaluateExercise } from '../lib/evaluator'
import {
  cppCompiledProject,
  type CppProjectCheckpoint,
} from './cpp-compiled-project'
import { cppCompiledProjectManifest } from './cpp-compiled-project-manifest'
import type { ProjectScaffoldingLevel } from './project-types'

const checkpoints = cppCompiledProject.checkpoints
const exercises = checkpoints.map((checkpoint) => checkpoint.exercise)
const clientModuleSource = readFileSync(new URL('./cpp-compiled-project.ts', import.meta.url), 'utf8')

function manifestShape(project: typeof cppCompiledProject) {
  return {
    id: project.id,
    language: project.language,
    title: project.title,
    subtitle: project.subtitle,
    description: project.description,
    outcome: project.outcome,
    duration: project.duration,
    route: project.route,
    studioLabel: project.studioLabel,
    sourcePrivacyLabel: project.sourcePrivacyLabel,
    downloadFileName: project.downloadFileName,
    downloadLabel: project.downloadLabel,
    prerequisiteTitle: project.prerequisiteTitle,
    prerequisiteDescription: project.prerequisiteDescription,
    overviewTitle: project.overviewTitle,
    overviewSteps: project.overviewSteps,
    completionDescription: project.completionDescription,
  }
}

describe('Phase 4B C++ compiled project curriculum', () => {
  it('defines one bookmarkable twelve-checkpoint C++ project', () => {
    expect(cppCompiledProject.id).toBe('first-compiled-program')
    expect(cppCompiledProject.language).toBe('cpp')
    expect(cppCompiledProject.route).toBe('/projects/cpp/first-compiled-program')
    expect(cppCompiledProject.downloadFileName).toBe('observation-desk.cpp')
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

  it('keeps the public manifest aligned with the route-loaded curriculum', () => {
    expect(manifestShape(cppCompiledProject)).toEqual(manifestShape({
      ...cppCompiledProjectManifest,
      checkpoints: [] as CppProjectCheckpoint[],
    }))
    expect(checkpoints.map((checkpoint) => ({
      id: checkpoint.id,
      order: checkpoint.order,
      title: checkpoint.title,
      conceptId: checkpoint.exercise.conceptId,
      xp: checkpoint.exercise.xp,
    }))).toEqual(cppCompiledProjectManifest.checkpoints)
  })

  it('uses a C++-specific learning sequence instead of copying Python explanations', () => {
    expect(exercises.map((exercise) => exercise.conceptId)).toEqual([
      'project-cpp-compile-run-cycle',
      'project-cpp-program-frame',
      'project-cpp-console-output',
      'project-cpp-compile-diagnostic',
      'project-cpp-string-declaration',
      'project-cpp-integer-declaration',
      'project-cpp-arithmetic',
      'project-cpp-getline-input',
      'project-cpp-stream-extraction',
      'project-cpp-output-chain',
      'project-cpp-assembly',
      'project-cpp-final-compiled-program',
    ])

    const allCopy = JSON.stringify(cppCompiledProject)
    expect(allCopy).toContain('compiler')
    expect(allCopy).toContain('int main()')
    expect(allCopy).toContain('std::getline')
    expect(allCopy).toContain('std::cin')
    expect(allCopy).toContain('std::cout')
    expect(allCopy).not.toContain('f-string')
    expect(allCopy).not.toContain('traceback')
    expect(allCopy).not.toContain('input()')
  })

  it('introduces each piece of project vocabulary exactly once before independent assembly', () => {
    const firstDeclaration = new Map<string, number>()
    for (const checkpoint of checkpoints) {
      for (const term of checkpoint.newTerms) {
        expect(firstDeclaration.has(term.term), `${term.term} must be introduced only once`).toBe(false)
        firstDeclaration.set(term.term, checkpoint.order)
      }
    }

    expect(Object.fromEntries(firstDeclaration)).toMatchObject({
      'source code': 1,
      compiler: 1,
      executable: 1,
      function: 2,
      'entry point': 2,
      brace: 2,
      header: 3,
      'output stream': 3,
      'insertion operator': 3,
      statement: 4,
      semicolon: 4,
      'compile error': 4,
      diagnostic: 4,
      type: 5,
      declaration: 5,
      initialization: 5,
      'std::string': 5,
      integer: 6,
      int: 6,
      operator: 7,
      expression: 7,
      'input stream': 8,
      'std::getline': 8,
      'extraction operator': 9,
      'output chain': 10,
      'test case': 12,
      'hidden check': 12,
    })
    expect(checkpoints[10].newTerms).toEqual([])
  })

  it('gives absolute beginners patient copy, bounded jobs, code guides, hints, and recaps', () => {
    for (const checkpoint of checkpoints) {
      const { exercise } = checkpoint
      expect(checkpoint.objective.length, `${checkpoint.id} needs a clear objective`).toBeGreaterThan(55)
      expect(exercise.explanation.length, `${checkpoint.id} needs a patient explanation`).toBeGreaterThan(130)
      expect(exercise.analogy.length, `${checkpoint.id} needs a memorable analogy`).toBeGreaterThan(115)
      expect(exercise.hint.length, `${checkpoint.id} needs a useful hint`).toBeGreaterThan(55)
      expect(exercise.recap.length, `${checkpoint.id} needs a retrieval recap`).toBeGreaterThan(85)
      expect(exercise.xp, `${checkpoint.id} needs a positive XP reward`).toBeGreaterThan(0)

      for (const term of checkpoint.newTerms) {
        expect(term.term.trim(), `${checkpoint.id} has a blank term`).not.toBe('')
        expect(term.meaning.length, `${term.term} needs a plain definition`).toBeGreaterThan(45)
      }

      if (exercise.type === 'code' || exercise.type === 'bugfix') {
        expect(exercise.focus?.length, `${checkpoint.id} needs one bounded job`).toBeGreaterThan(70)
        expect(exercise.codeGuide?.length, `${checkpoint.id} needs a code guide`).toBeGreaterThanOrEqual(5)
        expect(exercise.starterCode, `${checkpoint.id} needs runnable or deliberately repairable source`).toContain('int main()')
        expect(exercise.output, `${checkpoint.id} needs expected visible output`).not.toBeUndefined()
        for (const item of exercise.codeGuide ?? []) {
          expect(item.code.trim()).not.toBe('')
          expect(item.plain.length).toBeGreaterThan(55)
        }
      }
    }
  })

  it('fades from guided blanks to complete statements and independent assembly', () => {
    const scaffoldRank: Record<ProjectScaffoldingLevel, number> = {
      guided: 0,
      supported: 1,
      independent: 2,
    }
    const ranks = checkpoints.map((checkpoint) => scaffoldRank[checkpoint.scaffolding])
    expect(ranks.every((rank, index) => index === 0 || rank >= ranks[index - 1])).toBe(true)
    expect(checkpoints.slice(-2).every((checkpoint) => checkpoint.scaffolding === 'independent')).toBe(true)

    const editable = exercises.filter((exercise) => exercise.type === 'code' || exercise.type === 'bugfix')
    expect(editable).toHaveLength(10)
    expect(exercises.filter((exercise) => exercise.type === 'choice' || exercise.type === 'prediction')).toHaveLength(2)

    const codeWithBlanks = editable.filter((exercise) => exercise.starterCode?.includes('_____'))
    const codeWithoutBlanks = editable.filter((exercise) => !exercise.starterCode?.includes('_____'))
    expect(codeWithBlanks.map((exercise) => exercise.id)).toEqual([
      'project-cpp-output',
      'project-cpp-string',
      'project-cpp-integer',
      'project-cpp-arithmetic',
      'project-cpp-line-input',
    ])
    expect(codeWithoutBlanks.map((exercise) => exercise.id)).toEqual([
      'project-cpp-semicolon',
      'project-cpp-number-input',
      'project-cpp-report',
      'project-cpp-assembly',
      'project-cpp-final',
    ])
  })

  it('accepts the intended answers for every guided and supported teaching step', () => {
    const intendedAnswers: Record<string, string> = {
      'project-cpp-compiler-path': 'a',
      'project-cpp-program-frame': 'b',
      'project-cpp-output': checkpoints[2].exercise.starterCode!.replace('_____', 'std::cout'),
      'project-cpp-string': checkpoints[4].exercise.starterCode!.replace('_____', '"Avery"'),
      'project-cpp-integer': checkpoints[5].exercise.starterCode!.replace('_____', '5'),
      'project-cpp-arithmetic': checkpoints[6].exercise.starterCode!
        .replace('_____', 'details')
        .replace('_____', 'points_per_detail'),
      'project-cpp-line-input': checkpoints[7].exercise.starterCode!.replace('_____', 'std::getline'),
      'project-cpp-number-input': checkpoints[8].exercise.starterCode!.replace(
        '// Read one whole number into details.',
        'std::cin >> details;',
      ),
      'project-cpp-report': checkpoints[9].exercise.starterCode!.replace(
        '// Display the complete personal report here.',
        'std::cout << observer_name << ", you recorded " << details\n'
          + '              << " details and earned " << focus_points\n'
          + '              << " focus points.\\n";',
      ),
    }

    for (const [exerciseId, answer] of Object.entries(intendedAnswers)) {
      const exercise = exercises.find((candidate) => candidate.id === exerciseId)
      expect(exercise, `${exerciseId} must exist`).toBeDefined()
      expect(evaluateExercise(exercise!, answer), `${exerciseId} should accept its intended answer`).toMatchObject({
        correct: true,
      })
    }
  })

  it('makes a real compile error part of the lesson instead of treating it as failure', () => {
    const checkpoint = checkpoints.find((item) => item.id === 'project-cpp-semicolon')
    expect(checkpoint?.exercise.type).toBe('bugfix')
    expect(checkpoint?.expectedFirstRun).toEqual({
      outcome: 'compile_error',
      diagnosticTitle: 'C++ expected a semicolon',
      explanation: 'The output statement has no semicolon, so the compiler cannot finish building the program yet.',
    })
    expect(checkpoint?.exercise.starterCode).toContain('std::cout << "Details recorded.\\n"\n')
    expect(checkpoint?.exercise.starterCode).not.toContain('std::cout << "Details recorded.\\n";')

    const repaired = checkpoint?.exercise.starterCode?.replace(
      'std::cout << "Details recorded.\\n"',
      'std::cout << "Details recorded.\\n";',
    ) ?? ''
    expect(evaluateExercise(checkpoint!.exercise, repaired).correct).toBe(true)
  })

  it('retrieves full-line text input before typed integer extraction', () => {
    const fullName = checkpoints.find((item) => item.id === 'project-cpp-line-input')
    const number = checkpoints.find((item) => item.id === 'project-cpp-number-input')
    expect(fullName?.practiceStdin).toBe('Alex Kim\n')
    expect(fullName?.exercise.output).toContain('Hello, Alex Kim!')
    expect(fullName?.exercise.starterCode).toContain('std::string observer_name;')
    expect(fullName?.exercise.starterCode).toContain('_____(std::cin, observer_name);')
    expect(number?.practiceStdin).toBe('4\n')
    expect(number?.exercise.starterCode).toContain('int details = 0;')
    expect(number?.exercise.focus).toContain('std::cin >> details;')
  })

  it('publishes one visible final example without client-owned hidden cases or a reference solution', () => {
    const checkpoint = checkpoints.at(-1)
    const exercise = checkpoint?.exercise
    const summary = checkpoint?.assessmentSummary

    expect(checkpoint?.id).toBe('project-cpp-final')
    expect(checkpoint?.requirements).toHaveLength(8)
    expect(exercise?.type).toBe('code')
    expect(exercise?.starterCode).not.toContain('_____')
    expect(exercise?.starterCode).toContain('int points_per_detail = 5;')
    expect(exercise?.starterCode).toContain('int main()')
    expect(summary?.visibleTestCase).toEqual({
      id: 'final-visible-two-details',
      name: 'A two-detail observation',
      visibility: 'visible',
      stdin: 'Avery\n2\n',
      expectedStdout: [
        'Welcome to the Observation Desk!',
        'What is your name?',
        'How many details did you notice?',
        'Avery, you recorded 2 details and earned 10 focus points.',
      ].join('\n'),
      purpose: 'Shows one complete observation before the official check uses different names and counts.',
    })
    expect(summary?.hiddenTestCount).toBe(3)
    expect(summary?.structuralCheckCount).toBe(8)
    expect(checkpoint?.practiceStdin).toBe(summary?.visibleTestCase.stdin)

    for (const privateMarker of [
      'hiddenTestCases',
      'referenceSolution',
      'final-hidden-',
      "visibility: 'hidden'",
      'Morgan',
      'Riley',
    ]) {
      expect(clientModuleSource, `client curriculum must not contain ${privateMarker}`).not.toContain(privateMarker)
    }
  })

  it('keeps every learner-facing value ASCII-only and every authored check syntactically valid', () => {
    expect(JSON.stringify(cppCompiledProject)).toMatch(/^[\x20-\x7E]*$/u)
    expect(JSON.stringify(cppCompiledProject)).not.toContain('\u2014')

    for (const exercise of exercises) {
      for (const check of exercise.checks ?? []) {
        expect(() => new RegExp(check.pattern, check.flags)).not.toThrow()
      }
    }
  })
})
