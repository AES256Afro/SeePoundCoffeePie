import type { ExerciseType, LanguageId } from '../types'

type PlannedPrerequisite =
  | { kind: 'course'; id: string; label: string }
  | { kind: 'project'; id: string; label: string; path: string }

export interface PlannedCourseLesson {
  id: string
  conceptId: string
  title: string
  objective: string
  type: ExerciseType
  xp: number
  runnerBacked: boolean
  retrieves: readonly string[]
  introduces: readonly string[]
}

export interface PlannedCourseModule {
  id: string
  title: string
  purpose: string
  lessons: readonly PlannedCourseLesson[]
}

export interface PlannedCourse {
  status: 'unpublished'
  id: string
  slug: string
  route: string
  lessonRoute: string
  language: LanguageId
  title: string
  level: string
  outcome: string
  publicationPolicy: string
  publicationBlockers: readonly string[]
  prerequisites: readonly PlannedPrerequisite[]
  intentionalExclusions: readonly string[]
  modules: readonly PlannedCourseModule[]
  finalAssessment: {
    programName: string
    behavior: readonly string[]
    protectedStructure: readonly string[]
    analyzer: string
  }
}

const lesson = (
  id: string,
  conceptId: string,
  title: string,
  objective: string,
  type: ExerciseType,
  xp: number,
  retrieves: readonly string[],
  introduces: readonly string[],
): PlannedCourseLesson => ({
  id,
  conceptId,
  title,
  objective,
  type,
  xp,
  runnerBacked: type === 'bugfix' || type === 'code',
  retrieves,
  introduces,
})

// Phase 5B design-locked identifiers and curriculum intent. This file is not
// imported by the public course registry, route parser, progress schema, or
// runner assignment registry. Its tests deliberately require the course to
// remain unpublished until all teaching copy and protected checks are ready.
export const cppCollectionsRecordsPlan = {
  status: 'unpublished',
  id: 'cpp-collections-records',
  slug: 'cpp-collections-records',
  route: '/courses/cpp-collections-records',
  lessonRoute: '/learn/cpp-collections-records/:module-id/:lesson-id',
  language: 'cpp',
  title: 'Practical C++: Collections and Records',
  level: 'Beginner II',
  outcome:
    'Build and explain a Workshop Stock Report that stores part records, updates quantities, totals units, and identifies low-stock parts.',
  publicationPolicy:
    'Keep this course outside the public registry, routes, runner assignments, progress allowlists, sitemap, and production bundles until every blocker below passes together.',
  publicationBlockers: [
    'all six modules contain complete reviewed learner teaching copy',
    'all twelve editable lessons have registered C++ runner assignments and specific diagnostics',
    'a separate pinned C++ collections AST profile passes adversarial review without weakening the existing C++ project profile',
    'continuing-course routes and lazy loading are generalized beyond Python-specific branches',
    'Practice and Codebook ownership support more than one C++ course without cross-language leakage',
    'the browser compatibility floor advances from V2 to V3 before the new identifiers enter strict progress allowlists',
    'catalog, outline, and direct lesson routes enforce both prerequisites and previous-module order',
    'initial and lazy bundle boundaries pass reviewed raw and gzip budgets',
    'desktop, keyboard, assistive-technology, reduced-motion, and 390-pixel browser checks pass',
    'staging and production runner gates pass with the execution kill switch procedure',
  ],
  prerequisites: [
    { kind: 'course', id: 'cpp-foundations', label: 'Complete C++ Foundations' },
    {
      kind: 'project',
      id: 'first-compiled-program',
      label: 'Complete Your First Compiled Program',
      path: '/projects/cpp/first-compiled-program',
    },
  ],
  intentionalExclusions: [
    'raw pointers',
    'manual memory allocation',
    'new and delete',
    'iterators',
    'custom template definitions',
    'auto type deduction',
    'begin and end iteration calls',
    'using namespace directives',
    'const references',
    'constructors and methods on structs',
    'inheritance and access modifiers',
    'compound assignment operators',
    'address-of expressions',
    'file access',
    'packages and external libraries',
    'build systems',
    'network access',
    'object-oriented design',
  ],
  modules: [
    {
      id: 'cpp-records-return-values',
      title: 'Functions that return answers',
      purpose: 'Extend familiar C++ functions so a caller can store and reuse one calculated result.',
      lessons: [
        lesson(
          'cpprecords1-retrieve-call',
          'cpp-parameters-and-calls',
          'Trace a familiar function call',
          'Retrieve parameters, arguments, function order, and a familiar void function call.',
          'prediction',
          8,
          ['cpp-parameters-and-calls', 'cpp-function-order'],
          [],
        ),
        lesson(
          'cpprecords1-return-purpose',
          'cpp-return-values',
          'Meet a returned answer',
          'Explain that a return statement sends one typed value back to the calling expression.',
          'choice',
          10,
          ['cpp-functions'],
          ['return type', 'return statement', 'returned value'],
        ),
        lesson(
          'cpprecords1-predict-result',
          'cpp-return-values',
          'Use a returned result',
          'Predict a value returned from a function and then stored in a variable.',
          'prediction',
          14,
          ['cpp-return-values', 'cpp-variables'],
          ['function call expression'],
        ),
        lesson(
          'cpprecords1-fix-return',
          'cpp-return-values',
          'Repair the returned subtotal',
          'Change a faulty return statement so the caller receives the calculated subtotal.',
          'bugfix',
          16,
          ['cpp-return-values', 'project-cpp-arithmetic'],
          [],
        ),
        lesson(
          'cpprecords1-part-total',
          'cpp-returned-calculations',
          'Build a reusable part total',
          'Complete a typed function that returns price multiplied by quantity for two different calls.',
          'code',
          22,
          ['cpp-return-values', 'cpp-parameters-and-calls'],
          ['non-void function'],
        ),
      ],
    },
    {
      id: 'cpp-records-vectors',
      title: 'Vectors that grow and change',
      purpose: 'Move from fixed arrays to a standard collection that can receive additional values.',
      lessons: [
        lesson(
          'cpprecords2-retrieve-array',
          'cpp-collections-and-indexes',
          'Recall a fixed parts array',
          'Retrieve array declaration, zero-based indexing, and range-based iteration.',
          'prediction',
          8,
          ['cpp-collections-and-indexes', 'cpp-loops-and-collections'],
          [],
        ),
        lesson(
          'cpprecords2-vector-purpose',
          'cpp-vectors',
          'Meet a growable collection',
          'Explain the vector header, std::vector type, element type, angle brackets, and the dot used for a member-function call.',
          'choice',
          10,
          ['cpp-collections'],
          [
            'vector header',
            'std::vector',
            'element type',
            'angle brackets',
            'dot member access',
            'member function call',
          ],
        ),
        lesson(
          'cpprecords2-predict-growth',
          'cpp-vector-growth',
          'Follow a vector as it grows',
          'Predict the size of a vector after one value is appended.',
          'prediction',
          14,
          ['cpp-vectors'],
          ['push_back', 'size'],
        ),
        lesson(
          'cpprecords2-fix-push-back',
          'cpp-vector-growth',
          'Repair the vector update',
          'Repair a push_back call while keeping the supplied vector declaration and report.',
          'bugfix',
          16,
          ['cpp-vectors', 'cpp-vector-growth'],
          [],
        ),
        lesson(
          'cpprecords2-add-parts',
          'cpp-vector-functions',
          'Add parts to a vector',
          'Complete two statements in main that append the supplied part names to a vector.',
          'code',
          22,
          ['cpp-vector-growth'],
          ['multiple push_back calls'],
        ),
      ],
    },
    {
      id: 'cpp-records-structs',
      title: 'Records with struct',
      purpose: 'Give related values one named record shape and keep part records together in a vector.',
      lessons: [
        lesson(
          'cpprecords3-retrieve-types',
          'cpp-variables',
          'Recall typed storage',
          'Retrieve string and integer declarations before combining those values in one record.',
          'prediction',
          8,
          ['cpp-variables', 'project-cpp-string-declaration', 'project-cpp-integer-declaration'],
          [],
        ),
        lesson(
          'cpprecords3-struct-purpose',
          'cpp-structs',
          'Meet a record shape',
          'Explain that struct defines a reusable type whose fields keep related values together.',
          'choice',
          10,
          ['cpp-variables'],
          ['struct', 'record', 'field', 'user-defined type'],
        ),
        lesson(
          'cpprecords3-predict-fields',
          'cpp-struct-fields',
          'Read a part record',
          'Predict output produced by reading name and quantity fields with the dot operator.',
          'prediction',
          14,
          ['cpp-structs', 'cpp-output'],
          ['dot operator', 'aggregate initialization'],
        ),
        lesson(
          'cpprecords3-fix-field-access',
          'cpp-struct-fields',
          'Repair the field name',
          'Correct one field access while leaving the supplied struct and record value intact.',
          'bugfix',
          16,
          ['cpp-struct-fields'],
          [],
        ),
        lesson(
          'cpprecords3-build-part-record',
          'cpp-record-construction',
          'Build and store a part record',
          'Create one Part value and append it to a vector of Part records.',
          'code',
          22,
          ['cpp-struct-fields', 'cpp-vector-growth'],
          ['vector of records'],
        ),
      ],
    },
    {
      id: 'cpp-records-updates',
      title: 'Updating stored records',
      purpose: 'Show the difference between changing a copy and changing the original record through a reference.',
      lessons: [
        lesson(
          'cpprecords4-retrieve-vector-loop',
          'cpp-vector-functions',
          'Recall a vector loop',
          'Retrieve range-based iteration over a vector of records.',
          'prediction',
          8,
          ['cpp-loops-and-collections', 'cpp-record-construction'],
          [],
        ),
        lesson(
          'cpprecords4-reference-purpose',
          'cpp-references',
          'Meet a reference',
          'Explain that Part& creates another name for the original Part instead of making a copy.',
          'choice',
          10,
          ['cpp-variables', 'cpp-record-construction'],
          ['reference', 'ampersand in a declaration', 'copy'],
        ),
        lesson(
          'cpprecords4-predict-update',
          'cpp-reference-updates',
          'Follow an original record update',
          'Predict how a quantity changes when a loop variable is a Part reference.',
          'prediction',
          14,
          ['cpp-references', 'cpp-struct-fields'],
          ['reference loop variable'],
        ),
        lesson(
          'cpprecords4-fix-copy-update',
          'cpp-reference-updates',
          'Repair the copy mistake',
          'Add the reference marker so a loop updates the stored record rather than a temporary copy.',
          'bugfix',
          16,
          ['cpp-reference-updates'],
          [],
        ),
        lesson(
          'cpprecords4-restock-part',
          'cpp-record-updates',
          'Restock a named part',
          'Complete a function that finds a matching record and adds a supplied amount to its quantity.',
          'code',
          22,
          ['cpp-conditions', 'cpp-reference-updates', 'cpp-parameters-and-calls'],
          ['vector reference parameter', 'record update function'],
        ),
      ],
    },
    {
      id: 'cpp-records-summaries',
      title: 'Totals and low-stock filters',
      purpose: 'Calculate one total and select records that match a visible low-stock rule.',
      lessons: [
        lesson(
          'cpprecords5-retrieve-return',
          'cpp-returned-calculations',
          'Recall a returned calculation',
          'Retrieve a function that returns a calculated integer to its caller.',
          'prediction',
          8,
          ['cpp-returned-calculations'],
          [],
        ),
        lesson(
          'cpprecords5-accumulator-purpose',
          'cpp-accumulators',
          'Meet a running total',
          'Explain how an accumulator starts once, then changes during each loop pass.',
          'choice',
          10,
          ['cpp-loops-and-collections', 'cpp-variables'],
          ['accumulator'],
        ),
        lesson(
          'cpprecords5-order-total',
          'cpp-record-aggregation',
          'Put the total in order',
          'Order initialization, iteration, expanded addition, and return for a record-total function.',
          'ordering',
          14,
          ['cpp-accumulators', 'cpp-return-values'],
          ['aggregation'],
        ),
        lesson(
          'cpprecords5-fix-total-reset',
          'cpp-record-aggregation',
          'Keep the total between passes',
          'Move a faulty accumulator initialization outside the loop so earlier quantities are preserved.',
          'bugfix',
          16,
          ['cpp-record-aggregation'],
          [],
        ),
        lesson(
          'cpprecords5-low-stock',
          'cpp-filtering-records',
          'Collect low-stock names',
          'Complete a function that returns the names of records below a supplied quantity limit.',
          'code',
          22,
          ['cpp-conditions', 'cpp-vector-functions', 'cpp-record-aggregation'],
          ['filter', 'vector return value'],
        ),
      ],
    },
    {
      id: 'cpp-records-workshop-report',
      title: 'Workshop Stock Report capstone',
      purpose: 'Retrieve and assemble familiar return, vector, struct, reference, total, and filter shapes.',
      lessons: [
        lesson(
          'cpprecords6-trace-stock-update',
          'cpp-record-updates',
          'Trace a stock update',
          'Predict the stored quantity after two familiar restock calls update one Part record.',
          'prediction',
          8,
          ['cpp-record-updates', 'cpp-reference-updates'],
          [],
        ),
        lesson(
          'cpprecords6-plan-report',
          'cpp-program-planning',
          'Assign each report job',
          'Match record creation, stock updating, total calculation, filtering, and display to their jobs.',
          'choice',
          10,
          ['cpp-record-construction', 'cpp-record-updates', 'cpp-filtering-records'],
          ['program responsibility'],
        ),
        lesson(
          'cpprecords6-order-report',
          'cpp-record-tool-assembly',
          'Put the report flow in order',
          'Order the familiar definitions, fixed data, update, calculation, filter, and output stages.',
          'ordering',
          14,
          ['cpp-function-order', 'cpp-program-planning'],
          ['dependency order'],
        ),
        lesson(
          'cpprecords6-fix-low-stock-check',
          'cpp-record-tool-debugging',
          'Repair the low-stock boundary',
          'Correct the comparison so a quantity equal to the limit follows the authored rule.',
          'bugfix',
          16,
          ['cpp-filtering-records', 'cpp-comparisons'],
          ['boundary case'],
        ),
        lesson(
          'cpprecords6-workshop-stock-report',
          'cpp-record-tool-capstone',
          'Build the Workshop Stock Report',
          'Complete the familiar update, total, filter, and output statements in one fixed-data program.',
          'code',
          22,
          [
            'cpp-returned-calculations',
            'cpp-record-construction',
            'cpp-record-updates',
            'cpp-record-aggregation',
            'cpp-filtering-records',
          ],
          ['complete data flow'],
        ),
      ],
    },
  ],
  finalAssessment: {
    programName: 'Workshop Stock Report',
    behavior: [
      'prints the number of part records',
      'prints the total number of units after the fixed stock updates',
      'prints every part name whose quantity is below the visible limit',
      'derives every reported value from the fixed vector of Part records',
    ],
    protectedStructure: [
      'declares exactly the taught Part struct shape',
      'stores Part records in the supplied std::vector',
      'updates the original matching record through a Part reference',
      'initializes one total before the quantity loop and accumulates each record quantity',
      'builds and returns the low-stock name vector from the authored comparison',
      'keeps the fixed harness and required call order intact',
    ],
    analyzer: 'A future server-owned pinned Clang AST profile, reviewed before publication.',
  },
} as const satisfies PlannedCourse

export const cppCollectionsRecordsLessons = cppCollectionsRecordsPlan.modules.flatMap(
  (module) => module.lessons.map((currentLesson) => ({ ...currentLesson, moduleId: module.id })),
)
