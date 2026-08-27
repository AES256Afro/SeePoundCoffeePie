import type {
  ServerOwnedRunnerAssessment,
  ServerOwnedRunnerStructuralCheck,
} from './project-assessment'

export const CPP_COLLECTIONS_RECORDS_ASSESSMENT_PROFILE = 'cpp-collections-records-workshop-report-v1' as const

const structuralChecks: ServerOwnedRunnerStructuralCheck[] = [
  {
    validation: 'cpp-collections-authored-frame',
    message: 'Keep the three supplied headers, Part record, helpers, and main function in their taught order without extra or unreachable code.',
  },
  {
    validation: 'cpp-collections-part-record',
    message: 'Keep Part as the supplied record with one std::string name field and one int quantity field.',
  },
  {
    validation: 'cpp-collections-restock',
    message: 'Have restock update the matching original Part quantity through the supplied reference loop.',
  },
  {
    validation: 'cpp-collections-total-units',
    message: 'Have total_units add every part quantity to one accumulator and return it after the loop.',
  },
  {
    validation: 'cpp-collections-low-stock',
    message: 'Have low_stock collect each part name whose quantity is below the supplied limit.',
  },
  {
    validation: 'cpp-collections-supplied-harness',
    message: 'Keep the three supplied records, two restock calls, three report stages, and return 0 unchanged and reachable.',
  },
]

export const cppCollectionsRecordsServerAssessment: ServerOwnedRunnerAssessment = {
  language: 'cpp',
  analysisProfile: CPP_COLLECTIONS_RECORDS_ASSESSMENT_PROFILE,
  structuralChecks,
  testCases: [
    {
      id: 'workshop-stock-report-visible',
      name: 'Visible Workshop Stock Report',
      visibility: 'visible',
      stdin: '',
      expectedStdout: 'Parts: 3\nTotal units: 17\nLow stock: seals',
      purpose: 'Checks the exact report produced from the fixed in-memory part records.',
    },
  ],
}
