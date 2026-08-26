/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { evaluateExercise } from '../lib/evaluator'
import {
  javaPicnicProject,
  type JavaPicnicProjectCheckpoint,
} from './java-picnic-project'
import { javaPicnicProjectManifest } from './java-picnic-project-manifest'
import type { ProjectScaffoldingLevel } from './project-types'

const checkpoints = javaPicnicProject.checkpoints
const exercises = checkpoints.map((checkpoint) => checkpoint.exercise)
const clientModuleSource = readFileSync(new URL('./java-picnic-project.ts', import.meta.url), 'utf8')

const finalSource = [
  'import java.util.Scanner;',
  '',
  'public class Main {',
  '    static void printPicnic(String name, int guests) {',
  '        System.out.println("Picnic: " + name + " | Guests: " + guests);',
  '    }',
  '',
  '    public static void main(String[] args) {',
  '        Scanner scanner = new Scanner(System.in);',
  '        String[] supplies = { "Blankets", "Cups", "Napkins" };',
  '',
  '        System.out.println("What is your name?");',
  '        String guestName = scanner.nextLine();',
  '',
  '        System.out.println("How many guests are coming?");',
  '        int guestCount = Integer.parseInt(scanner.nextLine());',
  '',
  '        if (guestCount >= 8) {',
  '            System.out.println("Table: Large");',
  '        } else {',
  '            System.out.println("Table: Small");',
  '        }',
  '',
  '        for (String supply : supplies) {',
  '            System.out.println("Supply: " + supply);',
  '        }',
  '',
  '        printPicnic(guestName, guestCount);',
  '    }',
  '}',
].join('\n')

function manifestShape(project: typeof javaPicnicProject) {
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

describe('Phase 4D Java community picnic project curriculum', () => {
  it('defines one bookmarkable twelve-checkpoint Java project and downloadable source file', () => {
    expect(javaPicnicProject.id).toBe('picnic-planner')
    expect(javaPicnicProject.language).toBe('java')
    expect(javaPicnicProject.route).toBe('/projects/java/picnic-planner')
    expect(javaPicnicProject.downloadFileName).toBe('Main.java')
    expect(javaPicnicProject.downloadLabel).toContain('.java')
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

  it('keeps the public manifest aligned with the route-loaded curriculum data', () => {
    expect(manifestShape(javaPicnicProject)).toEqual(manifestShape({
      ...javaPicnicProjectManifest,
      checkpoints: [] as JavaPicnicProjectCheckpoint[],
    }))
    expect(checkpoints.map((checkpoint) => ({
      id: checkpoint.id,
      order: checkpoint.order,
      title: checkpoint.title,
      conceptId: checkpoint.exercise.conceptId,
      xp: checkpoint.exercise.xp,
    }))).toEqual(javaPicnicProjectManifest.checkpoints)
  })

  it('explains the complete Java frame and build path before asking the learner to edit', () => {
    const first = checkpoints[0]
    const explanation = first.exercise.explanation

    expect(first.exercise.type).toBe('choice')
    expect(first.exercise.starterCode).toBeUndefined()
    expect(checkpoints.findIndex((checkpoint) => checkpoint.exercise.type === 'code')).toBe(1)
    expect(explanation).toContain('Main.java')
    expect(explanation).toContain('javac')
    expect(explanation).toContain('Main.class bytecode')
    expect(explanation).toContain('JVM')
    expect(explanation).toContain('public class Main')
    expect(explanation).toContain('public static void main(String[] args)')
    expect(explanation).toContain('case-sensitive')
    expect(explanation).toContain('parentheses and brackets')
    expect(explanation).toContain('braces group')
    expect(explanation).toContain('semicolon closes')
    expect(explanation).toContain('You will not edit this supplied frame yet')
  })

  it('teaches the complete picnic program in a deliberate Java sequence', () => {
    expect(exercises.map((exercise) => exercise.conceptId)).toEqual([
      'project-java-compile-run-cycle',
      'project-java-console-output',
      'project-java-scanner-line-input',
      'project-java-integer-parsing',
      'project-java-string-concatenation',
      'project-java-string-array',
      'project-java-if-else',
      'project-java-enhanced-for',
      'project-java-static-method-parameters',
      'project-java-program-order',
      'project-java-assembly',
      'project-java-final-picnic-planner',
    ])

    const allCopy = JSON.stringify(javaPicnicProject)
    expect(allCopy).toContain('Scanner scanner = new Scanner(System.in)')
    expect(allCopy).toContain('scanner.nextLine()')
    expect(allCopy).toContain('Integer.parseInt')
    expect(allCopy).toContain('String[] supplies')
    expect(allCopy).toContain('if (guestCount >= 8)')
    expect(allCopy).toContain('for (String supply : supplies)')
    expect(allCopy).toContain('static void printPicnic')
    expect(allCopy).toContain('parameter')
    expect(allCopy).toContain('argument')
    expect(allCopy).toContain('dependency order')
    expect(allCopy).not.toContain('spaceship')
    expect(allCopy).not.toContain('captain')
    expect(allCopy).not.toContain('droid')
  })

  it('introduces each project term once before independent assembly', () => {
    const firstDeclaration = new Map<string, number>()
    for (const checkpoint of checkpoints) {
      for (const term of checkpoint.newTerms) {
        expect(firstDeclaration.has(term.term), `${term.term} must be introduced only once`).toBe(false)
        firstDeclaration.set(term.term, checkpoint.order)
      }
    }

    expect(Object.fromEntries(firstDeclaration)).toMatchObject({
      '.java source file': 1,
      javac: 1,
      bytecode: 1,
      JVM: 1,
      class: 1,
      'entry point': 1,
      'case-sensitive': 1,
      semicolon: 1,
      braces: 1,
      Scanner: 3,
      variable: 3,
      String: 3,
      nextLine: 3,
      int: 4,
      'Integer.parseInt': 4,
      concatenation: 5,
      array: 6,
      condition: 7,
      'if statement': 7,
      else: 7,
      'enhanced for loop': 8,
      method: 9,
      static: 9,
      parameter: 9,
      argument: 9,
      'dependency order': 10,
      'test case': 12,
      'hidden check': 12,
    })
    expect(checkpoints[10].newTerms).toEqual([])
  })

  it('gives absolute beginners bounded jobs, patient explanations, and line guides', () => {
    for (const checkpoint of checkpoints) {
      const { exercise } = checkpoint
      expect(checkpoint.objective.length, `${checkpoint.id} needs a clear objective`).toBeGreaterThan(65)
      expect(exercise.explanation.length, `${checkpoint.id} needs a patient explanation`).toBeGreaterThan(150)
      expect(exercise.analogy.length, `${checkpoint.id} needs a memorable analogy`).toBeGreaterThan(115)
      expect(exercise.hint.length, `${checkpoint.id} needs a useful hint`).toBeGreaterThan(60)
      expect(exercise.recap.length, `${checkpoint.id} needs a retrieval recap`).toBeGreaterThan(90)
      expect(exercise.xp).toBeGreaterThan(0)

      for (const term of checkpoint.newTerms) {
        expect(term.term.trim()).not.toBe('')
        expect(term.meaning.length, `${term.term} needs a plain definition`).toBeGreaterThan(55)
      }

      if (exercise.type === 'code' || exercise.type === 'bugfix') {
        expect(exercise.focus?.length, `${checkpoint.id} needs one bounded job`).toBeGreaterThan(80)
        expect(exercise.codeGuide?.length, `${checkpoint.id} needs a code guide`).toBeGreaterThanOrEqual(5)
        expect(exercise.starterCode, `${checkpoint.id} needs Java source`).toContain('public class Main')
        expect(exercise.output, `${checkpoint.id} needs expected output`).not.toBeUndefined()
        for (const item of exercise.codeGuide ?? []) {
          expect(item.code.trim()).not.toBe('')
          expect(item.plain.length).toBeGreaterThan(60)
        }
      }
    }
  })

  it('uses ten editable checkpoints, one choice, and one ordering while fading support', () => {
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
    expect(exercises.filter((exercise) => exercise.type === 'choice')).toHaveLength(1)
    expect(exercises.filter((exercise) => exercise.type === 'ordering')).toHaveLength(1)
    expect(editable.filter((exercise) => exercise.starterCode?.includes('_____')).map((exercise) => exercise.id)).toEqual([
      'project-java-output',
      'project-java-name-input',
      'project-java-number-input',
      'project-java-summary-line',
      'project-java-array',
    ])
    expect(editable.filter((exercise) => !exercise.starterCode?.includes('_____')).map((exercise) => exercise.id)).toEqual([
      'project-java-table',
      'project-java-foreach',
      'project-java-method',
      'project-java-assembly',
      'project-java-final',
    ])
  })

  it('accepts the intended answer for every checkpoint', () => {
    const tableSource = checkpoints[6].exercise.starterCode!.replace(
      '// Choose and print the correct table size.',
      'if (guestCount >= 8) {\n            System.out.println("Table: Large");\n        } else {\n            System.out.println("Table: Small");\n        }',
    )
    const foreachSource = checkpoints[7].exercise.starterCode!.replace(
      '// Visit and print every supply.',
      'for (String supply : supplies) {\n            System.out.println("Supply: " + supply);\n        }',
    )
    const methodSource = checkpoints[8].exercise.starterCode!.replace(
      '// Define printPicnic here.',
      'static void printPicnic(String name, int guests) {\n        System.out.println("Picnic: " + name + " | Guests: " + guests);\n    }',
    )
    const intendedAnswers: Record<string, string> = {
      'project-java-build-path': 'a',
      'project-java-output': checkpoints[1].exercise.starterCode!.replace('_____', 'System.out.println'),
      'project-java-name-input': checkpoints[2].exercise.starterCode!.replace('_____', 'scanner.nextLine()'),
      'project-java-number-input': checkpoints[3].exercise.starterCode!.replace('_____', 'Integer.parseInt(scanner.nextLine())'),
      'project-java-summary-line': checkpoints[4].exercise.starterCode!.replace('_____', '"Picnic: " + guestName + " | Guests: " + guestCount'),
      'project-java-array': checkpoints[5].exercise.starterCode!.replace('_____', '{ "Blankets", "Cups", "Napkins" }'),
      'project-java-table': tableSource,
      'project-java-foreach': foreachSource,
      'project-java-method': methodSource,
      'project-java-order': checkpoints[9].exercise.correctOrder!.join('|'),
      'project-java-assembly': finalSource,
      'project-java-final': finalSource,
    }

    for (const [exerciseId, answer] of Object.entries(intendedAnswers)) {
      const exercise = exercises.find((candidate) => candidate.id === exerciseId)
      expect(exercise, `${exerciseId} must exist`).toBeDefined()
      expect(evaluateExercise(exercise!, answer), `${exerciseId} should accept its intended answer`).toMatchObject({
        correct: true,
      })
    }
  })

  it('defines the exact protected final source contract and visible behavior', () => {
    const checkpoint = checkpoints.at(-1)
    const exercise = checkpoint?.exercise

    expect(checkpoint?.id).toBe('project-java-final')
    expect(exercise?.id).toBe('project-java-final')
    expect(exercise?.type).toBe('code')
    expect(exercise?.starterCode).not.toContain('_____')
    expect(checkpoint?.requirements).toHaveLength(11)
    expect(evaluateExercise(exercise!, finalSource)).toMatchObject({ correct: true })
    expect(checkpoint?.practiceStdin).toBe('Alex Kim\n10\n')
    expect(exercise?.output).toBe([
      'What is your name?',
      'How many guests are coming?',
      'Table: Large',
      'Supply: Blankets',
      'Supply: Cups',
      'Supply: Napkins',
      'Picnic: Alex Kim | Guests: 10',
    ].join('\n'))
    expect(checkpoint?.assessmentSummary).toMatchObject({
      hiddenTestCount: 3,
      structuralCheckCount: 9,
    })
    expect(checkpoint?.assessmentSummary?.visibleTestCase.stdin).toBe(checkpoint?.practiceStdin)
  })

  it('keeps private grading material out of client-owned Java source', () => {
    const serializedClientProject = JSON.stringify(javaPicnicProject)

    expect(serializedClientProject).not.toContain('referenceSolution')
    expect(serializedClientProject).not.toContain('structuralChecks')
    expect(serializedClientProject).not.toContain('final-hidden-')
    expect(clientModuleSource).not.toContain('java-picnic-project.server')
  })

  it('keeps the project practical, human-readable, and free of the prohibited dash', () => {
    const completeSource = [
      readFileSync(new URL('./java-picnic-project-manifest.ts', import.meta.url), 'utf8'),
      clientModuleSource,
    ].join('\n')

    expect(completeSource).not.toContain('\u2014')
    expect(completeSource).not.toContain('embark')
    expect(completeSource).not.toContain('delve')
    expect(completeSource).not.toContain('cosmic')
    expect(completeSource).not.toContain('spaceship')
    expect(completeSource).toContain('Community Picnic Planner')
  })
})
