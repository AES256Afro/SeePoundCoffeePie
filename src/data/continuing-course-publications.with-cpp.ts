import { basePublishedContinuingCourseRegistrations } from './continuing-course-publications.base'
import { cppCollectionsRecordsManifest } from './cpp-collections-records-manifest'
import type { CourseDefinition } from './course-registry'
import type {
  ContinuingCourseContent,
  PublishedContinuingCourseManifest,
  PublishedContinuingCourseRegistration,
} from './learning-surface'

const candidateCourseId = 'cpp-collections-records' as const
const candidateModuleTitles = Object.freeze([
  'Functions that return answers',
  'Vectors that grow and change',
  'Structs that group a record',
  'References that update records',
  'Totals and low-stock filters',
  'Build a Workshop Stock Report',
])

const candidateManifest: PublishedContinuingCourseManifest = Object.freeze({
  courseId: candidateCourseId,
  modules: Object.freeze(Object.entries(cppCollectionsRecordsManifest).map(([id, lessons]) => Object.freeze({
    id,
    lessonIds: Object.freeze(lessons.map((lesson) => lesson.id)),
    conceptIds: Object.freeze([...new Set(lessons.map((lesson) => lesson.conceptId))]),
  }))),
})

const candidateDefinition: CourseDefinition = Object.freeze({
  id: candidateCourseId,
  slug: candidateCourseId,
  language: 'cpp',
  shortName: 'Practical C++',
  title: 'Practical C++: Collections and Records',
  description: 'Use functions, vectors, structs, references, totals, and filters in small C++ programs.',
  outcome: 'Build and explain a Workshop Stock Report that stores part records, updates quantities, totals units, and identifies low-stock parts.',
  kind: 'continuing',
  level: 'Beginner II',
  symbol: 'eye',
  symbolLabel: 'Eye',
  completionReviewLabel: 'Your Workshop Stock Report',
  missionIds: Object.freeze(candidateManifest.modules.map((module) => module.id)),
  lessonIds: Object.freeze(candidateManifest.modules.flatMap((module) => module.lessonIds)),
  moduleTitles: candidateModuleTitles,
  moduleKinds: Object.freeze(candidateModuleTitles.map((_title, index) => (
    index === candidateModuleTitles.length - 1 ? 'capstone' : 'lessons'
  ))),
  prerequisites: Object.freeze([
    {
      kind: 'course',
      id: 'cpp-foundations',
      label: 'Complete C++ Foundations',
    },
    {
      kind: 'project',
      id: 'first-compiled-program',
      label: 'Complete Your First Compiled Program',
      path: '/projects/cpp/first-compiled-program',
    },
  ] as const),
})

async function loadCandidateContent(): Promise<ContinuingCourseContent> {
  const module = await import('./cpp-collections-records-course-packed')
  return {
    id: candidateCourseId,
    language: 'cpp',
    missions: [...await module.loadCppCollectionsRecordsCourse(cppCollectionsRecordsManifest)],
  }
}

export const candidateCppContinuingCourseRegistration: PublishedContinuingCourseRegistration = Object.freeze({
  definition: candidateDefinition,
  language: 'cpp',
  manifest: candidateManifest,
  sequenceAfter: Object.freeze({
    language: 'cpp',
    projectId: 'first-compiled-program',
  }),
  loadContent: loadCandidateContent,
})

export const controlledContinuingCourseRegistrations: readonly PublishedContinuingCourseRegistration[] = Object.freeze([
  ...basePublishedContinuingCourseRegistrations,
  candidateCppContinuingCourseRegistration,
])
