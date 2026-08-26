import type {
  ServerOwnedProjectAssessment,
  ServerOwnedProjectStructuralCheck,
} from './project-assessment'
import type { ProjectTestCase } from './project-types'

export const javaPicnicProjectId = 'picnic-planner'
export const javaPicnicProjectFinalCheckpointId = 'project-java-final'

const visibleTestCase: ProjectTestCase = {
  id: 'final-visible-ten-guests',
  name: 'A ten-person picnic',
  visibility: 'visible',
  stdin: 'Alex Kim\n10\n',
  expectedStdout: [
    'What is your name?',
    'How many guests are coming?',
    'Table: Large',
    'Supply: Blankets',
    'Supply: Cups',
    'Supply: Napkins',
    'Picnic: Alex Kim | Guests: 10',
  ].join('\n'),
  purpose: 'Shows the complete large-table path with an organizer name containing a space.',
}

const hiddenTestCases: ProjectTestCase[] = [
  {
    id: 'final-hidden-one-guest',
    name: 'A one-person picnic',
    visibility: 'hidden',
    stdin: 'Maren Holt\n1\n',
    expectedStdout: [
      'What is your name?',
      'How many guests are coming?',
      'Table: Small',
      'Supply: Blankets',
      'Supply: Cups',
      'Supply: Napkins',
      'Picnic: Maren Holt | Guests: 1',
    ].join('\n'),
    purpose: 'Checks a small ordinary count and proves that the program uses organizer input instead of the visible example.',
  },
  {
    id: 'final-hidden-below-large-table',
    name: 'A picnic just below the large-table boundary',
    visibility: 'hidden',
    stdin: 'Ivo Chen\n7\n',
    expectedStdout: [
      'What is your name?',
      'How many guests are coming?',
      'Table: Small',
      'Supply: Blankets',
      'Supply: Cups',
      'Supply: Napkins',
      'Picnic: Ivo Chen | Guests: 7',
    ].join('\n'),
    purpose: 'Checks the value immediately below the large-table threshold so the comparison cannot be too permissive.',
  },
  {
    id: 'final-hidden-large-table-boundary',
    name: 'A picnic at the large-table boundary',
    visibility: 'hidden',
    stdin: 'Tess Alvarez\n8\n',
    expectedStdout: [
      'What is your name?',
      'How many guests are coming?',
      'Table: Large',
      'Supply: Blankets',
      'Supply: Cups',
      'Supply: Napkins',
      'Picnic: Tess Alvarez | Guests: 8',
    ].join('\n'),
    purpose: 'Checks the exact large-table boundary so greater-than cannot replace greater-than-or-equal.',
  },
]

const structuralChecks: ServerOwnedProjectStructuralCheck[] = [
  {
    validation: 'java-scanner-import',
    message: 'Import java.util.Scanner exactly once so the taught short Scanner class name remains available.',
  },
  {
    validation: 'java-main-frame',
    message: 'Keep one public Main class with one exact public static void main(String[] args) entry point.',
  },
  {
    validation: 'java-print-picnic',
    message: 'Define static void printPicnic with String name and int guests, then print both parameters in the summary.',
  },
  {
    validation: 'java-scanner-setup',
    message: 'Create exactly one Scanner named scanner from System.in as the first statement inside main.',
  },
  {
    validation: 'java-supplies-array',
    message: 'Declare supplies once as a String array containing Blankets, Cups, and Napkins in that order.',
  },
  {
    validation: 'java-console-inputs',
    message: 'Prompt in order, read guestName with scanner.nextLine, and parse guestCount from the next complete line.',
  },
  {
    validation: 'java-table-branch',
    message: 'Use one if and else that selects a large table at eight or more guests and a small table otherwise.',
  },
  {
    validation: 'java-supply-foreach',
    message: 'Use one enhanced for loop with String supply in supplies and print the current supply inside its body.',
  },
  {
    validation: 'java-main-statement-order',
    message: 'Keep exactly the nine taught main statements in order and finish by calling printPicnic with both stored values.',
  },
]

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

// Import this value only from Worker-owned runner code and server-side tests.
export const javaPicnicProjectServerAssessment: ServerOwnedProjectAssessment = {
  language: 'java',
  referenceSolution,
  structuralChecks,
  testCases: [visibleTestCase, ...hiddenTestCases],
}
