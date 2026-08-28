const practicalCppRunnerBackedIds = Object.freeze([
  'cpprecords1-fix-return',
  'cpprecords1-part-total',
  'cpprecords2-fix-push-back',
  'cpprecords2-add-parts',
  'cpprecords3-fix-field-access',
  'cpprecords3-build-part-record',
  'cpprecords4-fix-copy-update',
  'cpprecords4-restock-part',
  'cpprecords5-fix-total-reset',
  'cpprecords5-low-stock',
  'cpprecords6-fix-low-stock-check',
  'cpprecords6-workshop-stock-report',
])

const practicalCppTeachingOnlyIds = Object.freeze([
  'cpprecords1-retrieve-call',
  'cpprecords1-return-purpose',
  'cpprecords1-predict-result',
  'cpprecords2-retrieve-array',
  'cpprecords2-vector-purpose',
  'cpprecords2-predict-growth',
  'cpprecords3-retrieve-types',
  'cpprecords3-struct-purpose',
  'cpprecords3-predict-fields',
  'cpprecords4-retrieve-vector-loop',
  'cpprecords4-reference-purpose',
  'cpprecords4-predict-update',
  'cpprecords5-retrieve-return',
  'cpprecords5-accumulator-purpose',
  'cpprecords5-order-total',
  'cpprecords6-trace-stock-update',
  'cpprecords6-plan-report',
  'cpprecords6-order-report',
])

const practicalCppPublicBrowserMarkers = Object.freeze([
  { kind: 'course', value: 'cpp-collections-records' },
  { kind: 'teaching content', value: 'A workshop calculator has a label promising a whole-number result.' },
  { kind: 'teaching content', value: 'A vector is a standard C++ collection that can grow after it is created.' },
  {
    kind: 'teaching content',
    value: 'A record keeps related values together. In C++, struct defines a reusable user-defined type for that record shape.',
  },
  {
    kind: 'teaching content',
    value: 'A normal Part parameter or loop variable receives a copy, so changing it does not change the original record.',
  },
  { kind: 'teaching content', value: 'A stock clerk writes zero once at the top of a count sheet' },
  { kind: 'teaching content', value: 'The workshop stations are already built and connected.' },
].map((marker) => Object.freeze(marker)))

const practicalCppPrivateBrowserMarkers = Object.freeze([
  { kind: 'analyzer', value: 'CppCollectionsAnalyzer.py' },
  { kind: 'assessment profile', value: 'cpp-collections-records-workshop-report-v1' },
  { kind: 'server assessment', value: 'workshop-stock-report-visible' },
  {
    kind: 'server assessment requirement',
    value: 'Keep the three supplied headers, Part record, helpers, and main function in their taught order without extra or unreachable code.',
  },
].map((marker) => Object.freeze(marker)))

const practicalCppCourse = Object.freeze({
  id: 'cpp-collections-records',
  state: 'published',
  coursePath: '/courses/cpp-collections-records',
  lessonPrefix: '/learn/cpp-collections-records/',
  lessonPath: '/learn/cpp-collections-records/cpp-records-return-values/cpprecords1-retrieve-call',
  lessonIds: Object.freeze([
    'cpprecords1-retrieve-call',
    'cpprecords1-return-purpose',
    'cpprecords1-predict-result',
    'cpprecords1-fix-return',
    'cpprecords1-part-total',
    'cpprecords2-retrieve-array',
    'cpprecords2-vector-purpose',
    'cpprecords2-predict-growth',
    'cpprecords2-fix-push-back',
    'cpprecords2-add-parts',
    'cpprecords3-retrieve-types',
    'cpprecords3-struct-purpose',
    'cpprecords3-predict-fields',
    'cpprecords3-fix-field-access',
    'cpprecords3-build-part-record',
    'cpprecords4-retrieve-vector-loop',
    'cpprecords4-reference-purpose',
    'cpprecords4-predict-update',
    'cpprecords4-fix-copy-update',
    'cpprecords4-restock-part',
    'cpprecords5-retrieve-return',
    'cpprecords5-accumulator-purpose',
    'cpprecords5-order-total',
    'cpprecords5-fix-total-reset',
    'cpprecords5-low-stock',
    'cpprecords6-trace-stock-update',
    'cpprecords6-plan-report',
    'cpprecords6-order-report',
    'cpprecords6-fix-low-stock-check',
    'cpprecords6-workshop-stock-report',
  ]),
  runnerBackedLessonIds: practicalCppRunnerBackedIds,
  teachingOnlyLessonIds: practicalCppTeachingOnlyIds,
  publicBrowserMarkers: practicalCppPublicBrowserMarkers,
  privateBrowserMarkers: practicalCppPrivateBrowserMarkers,
  browserMarkers: Object.freeze([
    ...practicalCppPublicBrowserMarkers,
    ...practicalCppPrivateBrowserMarkers,
  ]),
})

const practicalCppPartitionIds = [
  ...practicalCppRunnerBackedIds,
  ...practicalCppTeachingOnlyIds,
]
if (
  practicalCppPartitionIds.length !== practicalCppCourse.lessonIds.length
  || new Set(practicalCppPartitionIds).size !== practicalCppCourse.lessonIds.length
  || practicalCppCourse.lessonIds.some((lessonId) => !practicalCppPartitionIds.includes(lessonId))
) {
  throw new Error('The Practical C++ runner-backed and teaching-only partitions must cover the exact lesson manifest.')
}

// This catalog belongs to Node-side release and verification tools only. A
// course becomes public only through a reviewed source change. There is no
// environment-variable switch that can make hidden content available.
export const privateCourseReleaseCatalog = Object.freeze([practicalCppCourse])

export function privateCourseReleaseState(courseId) {
  const state = privateCourseReleaseCatalog.find((course) => course.id === courseId)?.state
  if (state === 'published' || state === 'unpublished') return state
  return 'unavailable'
}

export function privateCourseIsPublished(courseId) {
  return privateCourseReleaseState(courseId) === 'published'
}

// Keep the original exports while deriving every Practical C++ boundary from
// the one private catalog entry. Existing checks and progress compatibility
// can use these names without creating another publication switch.
export const unpublishedCppCourseId = practicalCppCourse.id
export const unpublishedCppCoursePath = practicalCppCourse.coursePath
export const unpublishedCppLessonPrefix = practicalCppCourse.lessonPrefix
export const unpublishedCppLessonPath = practicalCppCourse.lessonPath
export const unpublishedCppLessonIds = practicalCppCourse.lessonIds
export const unpublishedCppJavaScriptMarkers = practicalCppCourse.browserMarkers
export const practicalCppRunnerBackedLessonIds = practicalCppCourse.runnerBackedLessonIds
export const practicalCppTeachingOnlyLessonIds = practicalCppCourse.teachingOnlyLessonIds
export const practicalCppPublicJavaScriptMarkers = practicalCppCourse.publicBrowserMarkers
export const practicalCppPrivateJavaScriptMarkers = practicalCppCourse.privateBrowserMarkers
