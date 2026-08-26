/// <reference types="node" />

import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  csharpWorkshopProjectFinalCheckpointId,
  csharpWorkshopProjectId,
  csharpWorkshopProjectServerAssessment,
} from './csharp-workshop-project.server'

const serverModuleSource = readFileSync(
  new URL('./csharp-workshop-project.server.ts', import.meta.url),
  'utf8',
)

const referenceSolution = [
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

function expectedOutput(name: string, visits: number): string {
  return [
    'What is your name?',
    'How many visits have you completed?',
    visits >= 3 ? 'Access: Member' : 'Access: Guest',
    'Area: Studio',
    'Area: Lab',
    'Area: Library',
    `Badge: ${name} | Visits: ${visits}`,
  ].join('\n')
}

describe('Phase 4C C# workshop project server assessment', () => {
  it('targets the public project and final checkpoint without importing client curriculum', () => {
    expect(csharpWorkshopProjectId).toBe('workshop-check-in')
    expect(csharpWorkshopProjectFinalCheckpointId).toBe('project-csharp-final')
    expect(csharpWorkshopProjectServerAssessment.language).toBe('csharp')
    expect(csharpWorkshopProjectServerAssessment.referenceSolution).toBe(referenceSolution)
    expect(serverModuleSource).not.toMatch(/from ['"]\.\/csharp-workshop-project['"]/u)
    expect(serverModuleSource).not.toContain('assessmentSummary')
  })

  it('owns one visible case followed by three private boundary cases', () => {
    const { testCases } = csharpWorkshopProjectServerAssessment

    expect(testCases).toHaveLength(4)
    expect(testCases.map((testCase) => testCase.visibility)).toEqual([
      'visible',
      'hidden',
      'hidden',
      'hidden',
    ])
    expect(testCases[0]).toEqual({
      id: 'final-visible-four-visits',
      name: 'A returning workshop member',
      visibility: 'visible',
      stdin: 'Alex Kim\n4\n',
      expectedStdout: expectedOutput('Alex Kim', 4),
      purpose: 'Shows the complete member path with a name containing a space.',
    })

    const parsedCases = testCases.map((testCase) => {
      const [name, visitsText] = testCase.stdin.trimEnd().split('\n')
      return { name, testCase, visits: Number(visitsText) }
    })

    expect(parsedCases.map(({ visits }) => visits)).toEqual([4, 0, 2, 3])
    expect(parsedCases.map(({ visits }) => visits >= 3)).toEqual([true, false, false, true])
    expect(parsedCases.every(({ name }) => name.includes(' '))).toBe(true)
    expect(new Set(testCases.map((testCase) => testCase.id)).size).toBe(testCases.length)
    expect(new Set(testCases.map((testCase) => testCase.stdin)).size).toBe(testCases.length)

    for (const { name, testCase, visits } of parsedCases) {
      expect(Number.isInteger(visits)).toBe(true)
      expect(testCase.expectedStdout).toBe(expectedOutput(name, visits))
      expect(testCase.purpose.length).toBeGreaterThan(45)
    }
  })

  it('keeps every private name out of the client-owned C# project sources', () => {
    const publicModuleUrls = [
      new URL('./csharp-workshop-project-manifest.ts', import.meta.url),
      new URL('./csharp-workshop-project.ts', import.meta.url),
    ]
    const publicSource = publicModuleUrls
      .filter((url) => existsSync(url))
      .map((url) => readFileSync(url, 'utf8'))
      .join('\n')

    for (const privateName of ['Maren Holt', 'Ivo Chen', 'Tess Alvarez']) {
      expect(serverModuleSource).toContain(privateName)
      expect(publicSource, `public project source must not contain ${privateName}`).not.toContain(privateName)
    }
  })

  it('defines eight stable structural requirements for bounded Roslyn facts', () => {
    const { structuralChecks } = csharpWorkshopProjectServerAssessment
    const validationIds = structuralChecks.map((check) => check.validation)

    expect(validationIds).toEqual([
      'csharp-using-system',
      'csharp-print-badge',
      'csharp-areas-array',
      'csharp-console-inputs',
      'csharp-membership-branch',
      'csharp-area-foreach',
      'csharp-print-badge-call',
      'csharp-top-level-order',
    ])
    expect(new Set(validationIds).size).toBe(validationIds.length)
    expect(structuralChecks).toHaveLength(8)

    for (const check of structuralChecks) {
      expect(Object.keys(check).sort()).toEqual(['message', 'validation'])
      expect(check.message.length).toBeGreaterThan(50)
      expect(check.message).toMatch(/^[\x20-\x7E]*$/u)
      expect(check).not.toHaveProperty('analysis')
      expect(check).not.toHaveProperty('facts')
      expect(check).not.toHaveProperty('syntaxTree')
      for (const privateName of ['Maren Holt', 'Ivo Chen', 'Tess Alvarez']) {
        expect(check.message).not.toContain(privateName)
      }
    }
  })

  it('pins the required source shapes to the exact nine-statement program frame', () => {
    const sourceShapes = [
      'void PrintBadge(string name, int visits)',
      'string[] areas = { "Studio", "Lab", "Library" };',
      'Console.WriteLine("What is your name?");',
      'string guestName = Console.ReadLine() ?? "";',
      'Console.WriteLine("How many visits have you completed?");',
      'int visitCount = int.Parse(Console.ReadLine() ?? "0");',
      'if (visitCount >= 3)',
      'foreach (string area in areas)',
      'PrintBadge(guestName, visitCount);',
    ]
    const offsets = sourceShapes.map((shape) => referenceSolution.indexOf(shape))

    expect(offsets.every((offset) => offset >= 0)).toBe(true)
    expect(offsets).toEqual([...offsets].sort((left, right) => left - right))
    expect(referenceSolution.match(/Console\.WriteLine\(/gu)).toHaveLength(6)
    expect(referenceSolution.match(/Console\.ReadLine\(\)/gu)).toHaveLength(2)
    expect(referenceSolution.match(/PrintBadge\(/gu)).toHaveLength(2)
  })

  it('keeps test objects result-safe and all authored values ASCII-only', () => {
    for (const testCase of csharpWorkshopProjectServerAssessment.testCases) {
      expect(Object.keys(testCase).sort()).toEqual([
        'expectedStdout',
        'id',
        'name',
        'purpose',
        'stdin',
        'visibility',
      ])
      expect(testCase).not.toHaveProperty('analysis')
      expect(testCase).not.toHaveProperty('facts')
      expect(testCase).not.toHaveProperty('syntaxTree')
    }

    expect(JSON.stringify(csharpWorkshopProjectServerAssessment)).toMatch(/^[\x20-\x7E]*$/u)
    expect(serverModuleSource).not.toContain('\u2014')
  })
})
