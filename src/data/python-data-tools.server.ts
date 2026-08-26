import type {
  ServerOwnedRunnerAssessment,
  ServerOwnedRunnerStructuralCheck,
} from './project-assessment'

export const PYTHON_DATA_TOOLS_ASSESSMENT_PROFILE = 'python-data-tools-supply-tracker-v1' as const

const expectedOutput = [
  'Products: 2',
  'Total units: 17',
  'Restock: markers',
].join('\n')

const structuralChecks: ServerOwnedRunnerStructuralCheck[] = [
  {
    validation: 'python-data-tools-authored-frame',
    message: 'Keep the four supplied functions and report steps in their taught order without extra or unreachable statements.',
  },
  {
    validation: 'python-data-tools-normalize-name',
    message: 'Have normalize_name return name.strip().lower() directly.',
  },
  {
    validation: 'python-data-tools-add-stock',
    message: 'Normalize the name, use inventory.get(clean_name, 0), add the amount, and return the updated quantity.',
  },
  {
    validation: 'python-data-tools-total-stock',
    message: 'Start total once, add every value from inventory.values(), and return total after the loop.',
  },
  {
    validation: 'python-data-tools-low-stock',
    message: 'Collect each inventory name whose quantity is below limit, then return the completed names list.',
  },
  {
    validation: 'python-data-tools-harness',
    message: 'Keep the supplied inventory, three stock updates, summary prints, and low-stock report loop unchanged.',
  },
]

// This assessment stays in Worker-owned code. The browser course exposes the
// visible output and requirements, but never this trusted assessment profile.
export const pythonDataToolsServerAssessment: ServerOwnedRunnerAssessment = {
  language: 'python',
  analysisProfile: PYTHON_DATA_TOOLS_ASSESSMENT_PROFILE,
  structuralChecks,
  testCases: [
    {
      id: 'supply-tracker-visible-report',
      name: 'Visible Supply Tracker report',
      visibility: 'visible',
      stdin: '',
      expectedStdout: expectedOutput,
      purpose: 'Checks the exact report produced by the fixed in-memory lesson data.',
    },
  ],
}
