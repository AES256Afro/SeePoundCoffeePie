import type { CourseDefinition } from './course-registry'
import type {
  ContinuingCourseContent,
  PublishedContinuingCourseManifest,
  PublishedContinuingCourseRegistration,
} from './learning-surface'
import { pythonDataToolsManifest } from './python-data-tools-manifest'

const pythonDataToolsCourseManifest: PublishedContinuingCourseManifest = Object.freeze({
  courseId: 'python-data-tools',
  modules: Object.freeze(Object.entries(pythonDataToolsManifest).map(([id, lessons]) => Object.freeze({
    id,
    lessonIds: Object.freeze(lessons.map((lesson) => lesson.id)),
    conceptIds: Object.freeze([...new Set(lessons.map((lesson) => lesson.conceptId))]),
  }))),
})

const pythonDataToolsDefinition: CourseDefinition = Object.freeze({
  id: 'python-data-tools',
  slug: 'python-data-tools',
  language: 'python',
  shortName: 'Practical Python',
  title: 'Practical Python: Data Tools',
  description: 'Turn familiar Python building blocks into useful tools that clean, organize, total, and filter information.',
  outcome: 'Build and explain a small Supply Tracker that turns inconsistent item names and quantities into a reliable report.',
  kind: 'continuing',
  level: 'Beginner II',
  symbol: 'pi',
  symbolLabel: 'Pi',
  completionReviewLabel: 'Your Supply Tracker',
  missionIds: Object.freeze(pythonDataToolsCourseManifest.modules.map((module) => module.id)),
  lessonIds: Object.freeze(pythonDataToolsCourseManifest.modules.flatMap((module) => module.lessonIds)),
  moduleTitles: Object.freeze([
    'Functions that return answers',
    'Cleaning and normalizing text',
    'Lists that grow and change',
    'Dictionaries and named data',
    'Totals and filters',
    'Build a Supply Tracker',
  ]),
  moduleKinds: Object.freeze([
    'lessons',
    'lessons',
    'lessons',
    'lessons',
    'lessons',
    'capstone',
  ] as const),
  prerequisites: Object.freeze([
    { kind: 'course', id: 'python-foundations', label: 'Complete Python Foundations' },
    {
      kind: 'project',
      id: 'first-interactive-program',
      label: 'Complete Your First Interactive Program',
      path: '/projects/python/first-interactive-program',
    },
  ] as const),
})

async function loadPythonDataToolsContent(): Promise<ContinuingCourseContent> {
  const module = await import('./python-data-tools-course')
  return module.pythonDataToolsCourse
}

export const basePublishedContinuingCourseRegistrations: readonly PublishedContinuingCourseRegistration[] = Object.freeze([
  Object.freeze({
    definition: pythonDataToolsDefinition,
    language: 'python',
    manifest: pythonDataToolsCourseManifest,
    sequenceAfter: Object.freeze({
      language: 'python',
      projectId: 'first-interactive-program',
    }),
    loadContent: loadPythonDataToolsContent,
  }),
])

export const controlledContinuingCourseRegistrations = basePublishedContinuingCourseRegistrations
