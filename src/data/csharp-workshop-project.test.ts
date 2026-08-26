/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { evaluateExercise } from '../lib/evaluator'
import {
  csharpWorkshopProject,
  type CsharpWorkshopProjectCheckpoint,
} from './csharp-workshop-project'
import { csharpWorkshopProjectManifest } from './csharp-workshop-project-manifest'
import type { ProjectScaffoldingLevel } from './project-types'

const checkpoints = csharpWorkshopProject.checkpoints
const exercises = checkpoints.map((checkpoint) => checkpoint.exercise)
const clientModuleSource = readFileSync(new URL('./csharp-workshop-project.ts', import.meta.url), 'utf8')

const finalSource = [
  'using System;',
  '',
  'void PrintBadge(string name, int visits)',
  '{',
  '    Console.WriteLine($"Badge: {name} | Visits: {visits}");',
  '}',
  '',
  'string[] areas = { "Studio", "Lab", "Library" };',
  '',
  'Console.WriteLine("What is your name?");',
  'string guestName = Console.ReadLine() ?? "";',
  '',
  'Console.WriteLine("How many visits have you completed?");',
  'int visitCount = int.Parse(Console.ReadLine() ?? "0");',
  '',
  'if (visitCount >= 3)',
  '{',
  '    Console.WriteLine("Access: Member");',
  '}',
  'else',
  '{',
  '    Console.WriteLine("Access: Guest");',
  '}',
  '',
  'foreach (string area in areas)',
  '{',
  '    Console.WriteLine($"Area: {area}");',
  '}',
  '',
  'PrintBadge(guestName, visitCount);',
].join('\n')

function manifestShape(project: typeof csharpWorkshopProject) {
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

describe('Phase 4C C# community workshop project curriculum', () => {
  it('defines one bookmarkable twelve-checkpoint C# project', () => {
    expect(csharpWorkshopProject.id).toBe('workshop-check-in')
    expect(csharpWorkshopProject.language).toBe('csharp')
    expect(csharpWorkshopProject.route).toBe('/projects/csharp/workshop-check-in')
    expect(csharpWorkshopProject.downloadFileName).toBe('community-workshop-check-in.cs')
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
    expect(manifestShape(csharpWorkshopProject)).toEqual(manifestShape({
      ...csharpWorkshopProjectManifest,
      checkpoints: [] as CsharpWorkshopProjectCheckpoint[],
    }))
    expect(checkpoints.map((checkpoint) => ({
      id: checkpoint.id,
      order: checkpoint.order,
      title: checkpoint.title,
      conceptId: checkpoint.exercise.conceptId,
      xp: checkpoint.exercise.xp,
    }))).toEqual(csharpWorkshopProjectManifest.checkpoints)
  })

  it('teaches the complete workshop program in a deliberate C# sequence', () => {
    expect(exercises.map((exercise) => exercise.conceptId)).toEqual([
      'project-csharp-dotnet-build-run',
      'project-csharp-console-output',
      'project-csharp-readline-fallback',
      'project-csharp-integer-parsing',
      'project-csharp-string-interpolation',
      'project-csharp-string-array',
      'project-csharp-if-else',
      'project-csharp-foreach',
      'project-csharp-method-parameters',
      'project-csharp-program-order',
      'project-csharp-assembly',
      'project-csharp-final-check-in',
    ])

    const allCopy = JSON.stringify(csharpWorkshopProject)
    expect(allCopy).toContain('.NET')
    expect(allCopy).toContain('top-level instructions')
    expect(allCopy).toContain('using System;')
    expect(allCopy).toContain('Console.ReadLine() ??')
    expect(allCopy).toContain('int.Parse')
    expect(allCopy).toContain('string[] areas')
    expect(allCopy).toContain('foreach')
    expect(allCopy).toContain('PrintBadge')
    expect(allCopy).not.toContain('spaceship')
    expect(allCopy).not.toContain('captain')
    expect(allCopy).not.toContain('int main()')
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
      'source code': 1,
      '.NET': 1,
      compiler: 1,
      runtime: 1,
      'top-level instruction': 1,
      'using directive': 2,
      namespace: 2,
      Console: 2,
      string: 3,
      'Console.ReadLine': 3,
      null: 3,
      'null-coalescing operator': 3,
      int: 4,
      'int.Parse': 4,
      'string interpolation': 5,
      array: 6,
      condition: 7,
      'if statement': 7,
      else: 7,
      foreach: 8,
      iteration: 8,
      method: 9,
      parameter: 9,
      argument: 9,
      'dependency order': 10,
      'test case': 12,
      'hidden check': 12,
    })
    expect(checkpoints[10].newTerms).toEqual([])
  })

  it('gives absolute beginners bounded jobs, patient explanations, and line-by-line code guides', () => {
    for (const checkpoint of checkpoints) {
      const { exercise } = checkpoint
      expect(checkpoint.objective.length, `${checkpoint.id} needs a clear objective`).toBeGreaterThan(65)
      expect(exercise.explanation.length, `${checkpoint.id} needs a patient explanation`).toBeGreaterThan(155)
      expect(exercise.analogy.length, `${checkpoint.id} needs a memorable analogy`).toBeGreaterThan(120)
      expect(exercise.hint.length, `${checkpoint.id} needs a useful hint`).toBeGreaterThan(65)
      expect(exercise.recap.length, `${checkpoint.id} needs a retrieval recap`).toBeGreaterThan(95)
      expect(exercise.xp, `${checkpoint.id} needs a positive XP reward`).toBeGreaterThan(0)

      for (const term of checkpoint.newTerms) {
        expect(term.term.trim(), `${checkpoint.id} has a blank term`).not.toBe('')
        expect(term.meaning.length, `${term.term} needs a plain definition`).toBeGreaterThan(55)
      }

      if (exercise.type === 'code' || exercise.type === 'bugfix') {
        expect(exercise.focus?.length, `${checkpoint.id} needs one bounded job`).toBeGreaterThan(85)
        expect(exercise.codeGuide?.length, `${checkpoint.id} needs a code guide`).toBeGreaterThanOrEqual(5)
        expect(exercise.starterCode, `${checkpoint.id} needs C# source`).toContain('using System;')
        expect(exercise.output, `${checkpoint.id} needs expected visible output`).not.toBeUndefined()
        for (const item of exercise.codeGuide ?? []) {
          expect(item.code.trim()).not.toBe('')
          expect(item.plain.length).toBeGreaterThan(65)
        }
      }
    }
  })

  it('uses ten editable checkpoints and two retrieval checkpoints while fading scaffolding', () => {
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
      'project-csharp-output',
      'project-csharp-name-input',
      'project-csharp-number-input',
      'project-csharp-interpolation',
      'project-csharp-array',
    ])
    expect(editable.filter((exercise) => !exercise.starterCode?.includes('_____')).map((exercise) => exercise.id)).toEqual([
      'project-csharp-access',
      'project-csharp-foreach',
      'project-csharp-method',
      'project-csharp-assembly',
      'project-csharp-final',
    ])
  })

  it('accepts the intended answer for every checkpoint', () => {
    const accessSource = checkpoints[6].exercise.starterCode!.replace(
      '// Choose and print the correct access level.',
      'if (visitCount >= 3)\n{\n    Console.WriteLine("Access: Member");\n}\nelse\n{\n    Console.WriteLine("Access: Guest");\n}',
    )
    const foreachSource = checkpoints[7].exercise.starterCode!.replace(
      '// Visit and print every area.',
      'foreach (string area in areas)\n{\n    Console.WriteLine($"Area: {area}");\n}',
    )
    const methodSource = checkpoints[8].exercise.starterCode!.replace(
      '// Define PrintBadge here.',
      'void PrintBadge(string name, int visits)\n{\n    Console.WriteLine($"Badge: {name} | Visits: {visits}");\n}',
    )
    const intendedAnswers: Record<string, string> = {
      'project-csharp-dotnet-path': 'a',
      'project-csharp-output': checkpoints[1].exercise.starterCode!.replace('_____', 'Console.WriteLine'),
      'project-csharp-name-input': checkpoints[2].exercise.starterCode!.replace('_____', 'Console.ReadLine() ?? ""'),
      'project-csharp-number-input': checkpoints[3].exercise.starterCode!.replace('_____', 'int.Parse(Console.ReadLine() ?? "0")'),
      'project-csharp-interpolation': checkpoints[4].exercise.starterCode!.replace('_____', '$"Badge: {guestName} | Visits: {visitCount}"'),
      'project-csharp-array': checkpoints[5].exercise.starterCode!.replace('_____', '{ "Studio", "Lab", "Library" }'),
      'project-csharp-access': accessSource,
      'project-csharp-foreach': foreachSource,
      'project-csharp-method': methodSource,
      'project-csharp-order': checkpoints[9].exercise.correctOrder!.join('|'),
      'project-csharp-assembly': finalSource,
      'project-csharp-final': finalSource,
    }

    for (const [exerciseId, answer] of Object.entries(intendedAnswers)) {
      const exercise = exercises.find((candidate) => candidate.id === exerciseId)
      expect(exercise, `${exerciseId} must exist`).toBeDefined()
      expect(evaluateExercise(exercise!, answer), `${exerciseId} should accept its intended answer`).toMatchObject({
        correct: true,
      })
    }
  })

  it('repeats earlier values in later decisions, loops, methods, assembly, and the final program', () => {
    expect(checkpoints[2].exercise.starterCode).toContain('guestName')
    expect(checkpoints[4].exercise.focus).toContain('{guestName}')
    expect(checkpoints[3].exercise.starterCode).toContain('visitCount')
    expect(checkpoints[6].exercise.starterCode).toContain('visitCount')
    expect(checkpoints[5].exercise.starterCode).toContain('areas')
    expect(checkpoints[7].exercise.starterCode).toContain('areas')
    expect(checkpoints[8].exercise.starterCode).toContain('PrintBadge(guestName, visitCount)')
    expect(checkpoints[9].exercise.correctOrder).toContain('print-badge-call')
    expect(checkpoints[10].exercise.starterCode).toContain('void PrintBadge')
  })

  it('defines the exact final top-level source contract and visible behavior', () => {
    const checkpoint = checkpoints.at(-1)
    const exercise = checkpoint?.exercise

    expect(checkpoint?.id).toBe('project-csharp-final')
    expect(exercise?.id).toBe('project-csharp-final')
    expect(exercise?.type).toBe('code')
    expect(exercise?.starterCode).not.toContain('_____')
    expect(checkpoint?.requirements).toHaveLength(9)
    expect(evaluateExercise(exercise!, finalSource)).toMatchObject({ correct: true })

    expect(finalSource).toBe([
      'using System;',
      '',
      'void PrintBadge(string name, int visits)',
      '{',
      '    Console.WriteLine($"Badge: {name} | Visits: {visits}");',
      '}',
      '',
      'string[] areas = { "Studio", "Lab", "Library" };',
      '',
      'Console.WriteLine("What is your name?");',
      'string guestName = Console.ReadLine() ?? "";',
      '',
      'Console.WriteLine("How many visits have you completed?");',
      'int visitCount = int.Parse(Console.ReadLine() ?? "0");',
      '',
      'if (visitCount >= 3)',
      '{',
      '    Console.WriteLine("Access: Member");',
      '}',
      'else',
      '{',
      '    Console.WriteLine("Access: Guest");',
      '}',
      '',
      'foreach (string area in areas)',
      '{',
      '    Console.WriteLine($"Area: {area}");',
      '}',
      '',
      'PrintBadge(guestName, visitCount);',
    ].join('\n'))

    expect(checkpoint?.practiceStdin).toBe('Alex Kim\n4\n')
    expect(exercise?.output).toBe([
      'What is your name?',
      'How many visits have you completed?',
      'Access: Member',
      'Area: Studio',
      'Area: Lab',
      'Area: Library',
      'Badge: Alex Kim | Visits: 4',
    ].join('\n'))
  })

  it('publishes one visible example and only counts private grading material', () => {
    const checkpoint = checkpoints.at(-1)
    const summary = checkpoint?.assessmentSummary
    const serializedClientProject = JSON.stringify(csharpWorkshopProject)

    expect(summary?.visibleTestCase).toEqual({
      id: 'final-visible-returning-member',
      name: 'A returning workshop member',
      visibility: 'visible',
      stdin: 'Alex Kim\n4\n',
      expectedStdout: [
        'What is your name?',
        'How many visits have you completed?',
        'Access: Member',
        'Area: Studio',
        'Area: Lab',
        'Area: Library',
        'Badge: Alex Kim | Visits: 4',
      ].join('\n'),
      purpose: 'Shows one complete returning-member check-in before the official check uses other visitor details.',
    })
    expect(summary?.hiddenTestCount).toBe(3)
    expect(summary?.structuralCheckCount).toBe(8)
    expect(serializedClientProject).not.toContain('referenceSolution')
    expect(serializedClientProject).not.toContain('structuralChecks')
    expect(serializedClientProject).not.toContain('final-hidden-')
    expect(clientModuleSource).not.toContain('csharp-workshop-project.server')
  })

  it('keeps the curriculum human-readable and free of the prohibited dash character', () => {
    const completeSource = [
      readFileSync(new URL('./csharp-workshop-project-manifest.ts', import.meta.url), 'utf8'),
      clientModuleSource,
    ].join('\n')
    expect(completeSource).not.toContain('\u2014')
    expect(completeSource).not.toContain('embark')
    expect(completeSource).not.toContain('delve')
    expect(completeSource).not.toContain('cosmic')
  })
})
