import { cppCompiledProject } from './cpp-compiled-project'
import type {
  ServerOwnedProjectAssessment,
  ServerOwnedProjectStructuralCheck,
} from './project-assessment'
import type { ProjectTestCase } from './project-types'

const finalCheckpoint = cppCompiledProject.checkpoints.find((checkpoint) => (
  checkpoint.id === 'project-cpp-final'
))
const visibleTestCase = finalCheckpoint?.assessmentSummary?.visibleTestCase

if (!visibleTestCase) {
  throw new Error('The final C++ project needs one visible server test case.')
}

const structuralChecks: ServerOwnedProjectStructuralCheck[] = [
  {
    validation: 'cpp-required-headers',
    headers: ['iostream', 'string'],
    message: 'Include both <iostream> for console streams and <string> for the observer name.',
  },
  {
    validation: 'cpp-main-return-zero',
    message: 'Keep one int main() program frame and finish it with return 0;.',
  },
  {
    validation: 'cpp-declaration-integer',
    target: 'points_per_detail',
    value: 5,
    statement: 1,
    message: 'Declare points_per_detail once as an int initialized to 5.',
  },
  {
    validation: 'cpp-declaration-string',
    target: 'observer_name',
    statement: 4,
    message: 'Declare observer_name once as a std::string.',
  },
  {
    validation: 'cpp-getline',
    target: 'observer_name',
    statement: 5,
    message: 'Read the complete name with std::getline(std::cin, observer_name).',
  },
  {
    validation: 'cpp-integer-extraction',
    target: 'details',
    initialValue: 0,
    declarationStatement: 7,
    inputStatement: 8,
    message: 'Declare details once as int details = 0; and read it with std::cin >> details;.',
  },
  {
    validation: 'cpp-declaration-multiply-names',
    target: 'focus_points',
    names: ['details', 'points_per_detail'],
    statement: 9,
    message: 'Declare focus_points from details * points_per_detail.',
  },
  {
    validation: 'cpp-output-chain',
    requiredFields: ['observer_name', 'details', 'focus_points'],
    statement: 10,
    message: 'Use one std::cout report that retrieves observer_name, details, and focus_points.',
  },
]

const hiddenTestCases: ProjectTestCase[] = [
  {
    id: 'final-hidden-one-detail',
    name: 'The smallest ordinary observation',
    visibility: 'hidden',
    stdin: 'Morgan\n1\n',
    expectedStdout: [
      'Welcome to the Observation Desk!',
      'What is your name?',
      'How many details did you notice?',
      'Morgan, you recorded 1 details and earned 5 focus points.',
    ].join('\n'),
    purpose: 'Proves that the program uses the supplied count instead of printing the visible example.',
  },
  {
    id: 'final-hidden-seven-details',
    name: 'A larger observation',
    visibility: 'hidden',
    stdin: 'Riley\n7\n',
    expectedStdout: [
      'Welcome to the Observation Desk!',
      'What is your name?',
      'How many details did you notice?',
      'Riley, you recorded 7 details and earned 35 focus points.',
    ].join('\n'),
    purpose: 'Proves that multiplication works for a different nontrivial value.',
  },
  {
    id: 'final-hidden-spaced-name',
    name: 'A spaced name and zero count',
    visibility: 'hidden',
    stdin: 'Sam Lee\n0\n',
    expectedStdout: [
      'Welcome to the Observation Desk!',
      'What is your name?',
      'How many details did you notice?',
      'Sam Lee, you recorded 0 details and earned 0 focus points.',
    ].join('\n'),
    purpose: 'Checks a name containing a space and confirms that zero is handled as an integer.',
  },
]

const referenceSolution = [
  '#include <iostream>',
  '#include <string>',
  '',
  'int main() {',
  '    int points_per_detail = 5;',
  '',
  '    std::cout << "Welcome to the Observation Desk!\\n";',
  '    std::cout << "What is your name?\\n";',
  '    std::string observer_name;',
  '    std::getline(std::cin, observer_name);',
  '',
  '    std::cout << "How many details did you notice?\\n";',
  '    int details = 0;',
  '    std::cin >> details;',
  '',
  '    int focus_points = details * points_per_detail;',
  '    std::cout << observer_name << ", you recorded " << details',
  '              << " details and earned " << focus_points',
  '              << " focus points.\\n";',
  '',
  '    return 0;',
  '}',
].join('\n')

// Import this value only from Worker-owned runner code and server-side tests.
export const cppCompiledProjectServerAssessment: ServerOwnedProjectAssessment = {
  language: 'cpp',
  referenceSolution,
  structuralChecks,
  testCases: [visibleTestCase, ...hiddenTestCases],
}
