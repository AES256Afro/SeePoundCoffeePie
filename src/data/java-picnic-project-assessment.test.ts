/// <reference types="node" />

import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { javaPicnicProject } from './java-picnic-project'
import {
  javaPicnicProjectFinalCheckpointId,
  javaPicnicProjectId,
  javaPicnicProjectServerAssessment,
} from './java-picnic-project.server'

const serverModuleSource = readFileSync(
  new URL('./java-picnic-project.server.ts', import.meta.url),
  'utf8',
)

const referenceSolution = [
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

function expectedOutput(name: string, guests: number): string {
  return [
    'What is your name?',
    'How many guests are coming?',
    guests >= 8 ? 'Table: Large' : 'Table: Small',
    'Supply: Blankets',
    'Supply: Cups',
    'Supply: Napkins',
    `Picnic: ${name} | Guests: ${guests}`,
  ].join('\n')
}

describe('Phase 4D Java picnic project server assessment', () => {
  it('targets the public project and final checkpoint without importing client curriculum', () => {
    expect(javaPicnicProjectId).toBe('picnic-planner')
    expect(javaPicnicProjectFinalCheckpointId).toBe('project-java-final')
    expect(javaPicnicProjectServerAssessment.language).toBe('java')
    expect(javaPicnicProjectServerAssessment.referenceSolution).toBe(referenceSolution)
    expect(serverModuleSource).not.toMatch(/from ['"]\.\/java-picnic-project['"]/u)
    expect(serverModuleSource).not.toContain('assessmentSummary')
  })

  it('owns one visible case followed by three private boundary cases', () => {
    const { testCases } = javaPicnicProjectServerAssessment

    expect(testCases).toHaveLength(4)
    expect(testCases.map((testCase) => testCase.visibility)).toEqual([
      'visible',
      'hidden',
      'hidden',
      'hidden',
    ])
    expect(testCases[0]).toEqual({
      id: 'final-visible-ten-guests',
      name: 'A ten-person picnic',
      visibility: 'visible',
      stdin: 'Alex Kim\n10\n',
      expectedStdout: expectedOutput('Alex Kim', 10),
      purpose: 'Shows the complete large-table path with an organizer name containing a space.',
    })
    expect(testCases.slice(1).map((testCase) => [testCase.id, testCase.name])).toEqual([
      ['final-hidden-one-guest', 'A one-person picnic'],
      ['final-hidden-below-large-table', 'A picnic just below the large-table boundary'],
      ['final-hidden-large-table-boundary', 'A picnic at the large-table boundary'],
    ])

    const parsedCases = testCases.map((testCase) => {
      const [name, guestsText] = testCase.stdin.trimEnd().split('\n')
      return { name, testCase, guests: Number(guestsText) }
    })

    expect(parsedCases.map(({ guests }) => guests)).toEqual([10, 1, 7, 8])
    expect(parsedCases.map(({ guests }) => guests >= 8)).toEqual([true, false, false, true])
    expect(parsedCases.every(({ name }) => name.includes(' '))).toBe(true)
    expect(new Set(testCases.map((testCase) => testCase.id)).size).toBe(testCases.length)
    expect(new Set(testCases.map((testCase) => testCase.stdin)).size).toBe(testCases.length)

    for (const { name, testCase, guests } of parsedCases) {
      expect(Number.isInteger(guests)).toBe(true)
      expect(testCase.expectedStdout).toBe(expectedOutput(name, guests))
      expect(testCase.purpose.length).toBeGreaterThan(60)
    }
  })

  it('keeps every private organizer out of client-owned Java project sources', () => {
    const publicModuleUrls = [
      new URL('./java-picnic-project-manifest.ts', import.meta.url),
      new URL('./java-picnic-project.ts', import.meta.url),
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

  it('defines nine stable structural requirements for trusted Java facts', () => {
    const { structuralChecks } = javaPicnicProjectServerAssessment
    const validationIds = structuralChecks.map((check) => check.validation)

    expect(validationIds).toEqual([
      'java-scanner-import',
      'java-main-frame',
      'java-print-picnic',
      'java-scanner-setup',
      'java-supplies-array',
      'java-console-inputs',
      'java-table-branch',
      'java-supply-foreach',
      'java-main-statement-order',
    ])
    expect(new Set(validationIds).size).toBe(validationIds.length)
    expect(structuralChecks).toHaveLength(9)

    for (const check of structuralChecks) {
      expect(Object.keys(check).sort()).toEqual(['message', 'validation'])
      expect(check.message.length).toBeGreaterThan(70)
      expect(check.message).toMatch(/^[\x20-\x7E]*$/u)
      expect(check).not.toHaveProperty('analysis')
      expect(check).not.toHaveProperty('facts')
      expect(check).not.toHaveProperty('syntaxTree')
      for (const privateName of ['Maren Holt', 'Ivo Chen', 'Tess Alvarez']) {
        expect(check.message).not.toContain(privateName)
      }
    }
  })

  it('pins the exact class member and nine-statement main order', () => {
    const sourceShapes = [
      'static void printPicnic(String name, int guests)',
      'public static void main(String[] args)',
      'Scanner scanner = new Scanner(System.in);',
      'String[] supplies = { "Blankets", "Cups", "Napkins" };',
      'System.out.println("What is your name?");',
      'String guestName = scanner.nextLine();',
      'System.out.println("How many guests are coming?");',
      'int guestCount = Integer.parseInt(scanner.nextLine());',
      'if (guestCount >= 8)',
      'for (String supply : supplies)',
      'printPicnic(guestName, guestCount);',
    ]
    const offsets = sourceShapes.map((shape) => referenceSolution.indexOf(shape))

    expect(offsets.every((offset) => offset >= 0)).toBe(true)
    expect(offsets).toEqual([...offsets].sort((left, right) => left - right))
    expect(referenceSolution.match(/Scanner scanner =/gu)).toHaveLength(1)
    expect(referenceSolution.match(/System\.out\.println\(/gu)).toHaveLength(6)
    expect(referenceSolution.match(/scanner\.nextLine\(\)/gu)).toHaveLength(2)
    expect(referenceSolution.match(/printPicnic\(/gu)).toHaveLength(2)
  })

  it('aligns the public visible example without exposing private tests or reference source', () => {
    const publicSummary = javaPicnicProject.checkpoints.at(-1)?.assessmentSummary
    const [visibleCase] = javaPicnicProjectServerAssessment.testCases
    const serializedPublicProject = JSON.stringify(javaPicnicProject)

    expect(publicSummary?.visibleTestCase).toMatchObject({
      id: visibleCase.id,
      name: visibleCase.name,
      visibility: 'visible',
      stdin: visibleCase.stdin,
      expectedStdout: visibleCase.expectedStdout,
    })
    expect(publicSummary).toMatchObject({
      hiddenTestCount: 3,
      structuralCheckCount: 9,
    })
    expect(serializedPublicProject).not.toContain(referenceSolution)
    expect(serializedPublicProject).not.toContain('final-hidden-')
  })

  it('keeps result objects minimal and all server-authored values ASCII-only', () => {
    for (const testCase of javaPicnicProjectServerAssessment.testCases) {
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

    expect(JSON.stringify(javaPicnicProjectServerAssessment)).toMatch(/^[\x20-\x7E]*$/u)
    expect(serverModuleSource).not.toContain('\u2014')
  })
})
