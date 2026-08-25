import {
  pythonInteractiveProject,
} from './python-interactive-project'
import type { ProjectTestCase } from './project-types'
import type { ServerOwnedProjectAssessment, ServerOwnedProjectStructuralCheck } from './project-assessment'

const finalCheckpoint = pythonInteractiveProject.checkpoints.find((checkpoint) => (
  checkpoint.id === 'project-py-final'
))
const visibleTestCase = finalCheckpoint?.assessmentSummary?.visibleTestCase

if (!visibleTestCase) {
  throw new Error('The final Python project needs one visible server test case.')
}

const structuralChecks: ServerOwnedProjectStructuralCheck[] = [
  {
    validation: 'python-assignment-integer',
    target: 'price_per_cup',
    value: 3,
    message: 'Keep price_per_cup as the integer 3 so every test uses the same price.',
  },
  {
    validation: 'python-assignment-input',
    target: 'name',
    message: 'Ask for the customer name with input(), then store the returned text in name.',
  },
  {
    validation: 'python-assignment-input',
    target: 'cups_text',
    message: 'Ask for the cup count with input(), then store the returned text in cups_text.',
  },
  {
    validation: 'python-assignment-int-name',
    target: 'cups',
    name: 'cups_text',
    message: 'Convert cups_text with int() and store the resulting integer in cups.',
  },
  {
    validation: 'python-assignment-multiply-names',
    target: 'total',
    names: ['cups', 'price_per_cup'],
    message: 'Calculate total by multiplying cups and price_per_cup.',
  },
  {
    validation: 'python-print-f-string',
    requiredFields: ['name', 'cups', 'total'],
    message: 'Use one f-string that includes name, cups, and total in the personalized report.',
  },
]

const hiddenTestCases: ProjectTestCase[] = [
  {
    id: 'final-hidden-one-cup',
    name: 'The smallest ordinary order',
    visibility: 'hidden',
    stdin: 'Morgan\n1\n',
    expectedStdout: [
      'Welcome to the Coffee Counter!',
      'What is your name?',
      'How many cups would you like?',
      'Morgan, your 1 cup order costs $3.',
    ].join('\n'),
    purpose: 'Proves that the program uses the supplied count instead of printing the visible example.',
  },
  {
    id: 'final-hidden-seven-cups',
    name: 'A larger order',
    visibility: 'hidden',
    stdin: 'Riley\n7\n',
    expectedStdout: [
      'Welcome to the Coffee Counter!',
      'What is your name?',
      'How many cups would you like?',
      'Riley, your 7 cup order costs $21.',
    ].join('\n'),
    purpose: 'Proves that the multiplication works for a different nontrivial value.',
  },
  {
    id: 'final-hidden-spaced-name',
    name: 'A spaced name and zero count',
    visibility: 'hidden',
    stdin: 'Sam Lee\n0\n',
    expectedStdout: [
      'Welcome to the Coffee Counter!',
      'What is your name?',
      'How many cups would you like?',
      'Sam Lee, your 0 cup order costs $0.',
    ].join('\n'),
    purpose: 'Checks a name containing a space and confirms that zero is handled as an integer.',
  },
]

const referenceSolution = [
  'price_per_cup = 3',
  'print("Welcome to the Coffee Counter!")',
  'name = input("What is your name?\\n")',
  'cups_text = input("How many cups would you like?\\n")',
  'cups = int(cups_text)',
  'total = cups * price_per_cup',
  'print(f"{name}, your {cups} cup order costs ${total}.")',
].join('\n')

// Import this value only from Worker-owned runner code and server-side tests.
export const pythonInteractiveProjectServerAssessment: ServerOwnedProjectAssessment = {
  language: 'python',
  referenceSolution,
  structuralChecks,
  testCases: [visibleTestCase, ...hiddenTestCases],
}
