import type {
  ServerOwnedProjectAssessment,
  ServerOwnedProjectStructuralCheck,
} from './project-assessment'
import type { ProjectTestCase } from './project-types'

export const csharpWorkshopProjectId = 'workshop-check-in'
export const csharpWorkshopProjectFinalCheckpointId = 'project-csharp-final'

const visibleTestCase: ProjectTestCase = {
  id: 'final-visible-four-visits',
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
  purpose: 'Shows the complete member path with a name containing a space.',
}

const hiddenTestCases: ProjectTestCase[] = [
  {
    id: 'final-hidden-zero-visits',
    name: 'A first workshop visit',
    visibility: 'hidden',
    stdin: 'Maren Holt\n0\n',
    expectedStdout: [
      'What is your name?',
      'How many visits have you completed?',
      'Access: Guest',
      'Area: Studio',
      'Area: Lab',
      'Area: Library',
      'Badge: Maren Holt | Visits: 0',
    ].join('\n'),
    purpose: 'Checks the lower numeric boundary and proves that zero remains a valid whole-number input.',
  },
  {
    id: 'final-hidden-below-member',
    name: 'A visit just below member access',
    visibility: 'hidden',
    stdin: 'Ivo Chen\n2\n',
    expectedStdout: [
      'What is your name?',
      'How many visits have you completed?',
      'Access: Guest',
      'Area: Studio',
      'Area: Lab',
      'Area: Library',
      'Badge: Ivo Chen | Visits: 2',
    ].join('\n'),
    purpose: 'Checks the value immediately below the membership threshold so the comparison cannot be too permissive.',
  },
  {
    id: 'final-hidden-member-boundary',
    name: 'A visit at the member boundary',
    visibility: 'hidden',
    stdin: 'Tess Alvarez\n3\n',
    expectedStdout: [
      'What is your name?',
      'How many visits have you completed?',
      'Access: Member',
      'Area: Studio',
      'Area: Lab',
      'Area: Library',
      'Badge: Tess Alvarez | Visits: 3',
    ].join('\n'),
    purpose: 'Checks the exact membership boundary so greater-than cannot replace greater-than-or-equal.',
  },
]

const structuralChecks: ServerOwnedProjectStructuralCheck[] = [
  {
    validation: 'csharp-using-system',
    message: 'Keep using System; so the console types remain available with the taught names.',
  },
  {
    validation: 'csharp-print-badge',
    message: 'Define PrintBadge with string name and int visits, then print both parameters in the badge line.',
  },
  {
    validation: 'csharp-areas-array',
    message: 'Declare the areas string array once with Studio, Lab, and Library in that order.',
  },
  {
    validation: 'csharp-console-inputs',
    message: 'Prompt in order, read guestName with the empty fallback, and parse visitCount with the zero fallback.',
  },
  {
    validation: 'csharp-membership-branch',
    message: 'Use one if and else that grants member access when visitCount is at least 3 and guest access otherwise.',
  },
  {
    validation: 'csharp-area-foreach',
    message: 'Use foreach with string area in areas and print the current area from inside the loop.',
  },
  {
    validation: 'csharp-print-badge-call',
    message: 'Finish by calling PrintBadge with guestName first and visitCount second.',
  },
  {
    validation: 'csharp-top-level-order',
    message: 'Keep exactly the nine taught top-level statements in their workshop check-in order.',
  },
]

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

// Import this value only from Worker-owned runner code and server-side tests.
export const csharpWorkshopProjectServerAssessment: ServerOwnedProjectAssessment = {
  language: 'csharp',
  referenceSolution,
  structuralChecks,
  testCases: [visibleTestCase, ...hiddenTestCases],
}
