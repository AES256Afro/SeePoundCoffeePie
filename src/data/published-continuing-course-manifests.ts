import type { CourseId } from '../types'

export interface PublishedContinuingCourseModuleManifest {
  id: string
  lessonIds: readonly string[]
}

export interface PublishedContinuingCourseManifest {
  courseId: CourseId
  modules: readonly PublishedContinuingCourseModuleManifest[]
}

export const publishedContinuingCourseManifests: readonly PublishedContinuingCourseManifest[] = [
  {
    courseId: 'python-data-tools',
    modules: [
      {
        id: 'py-data-return-values',
        lessonIds: [
          'pydata1-retrieve-call',
          'pydata1-return-purpose',
          'pydata1-predict-result',
          'pydata1-fix-return',
          'pydata1-subtotal',
        ],
      },
      {
        id: 'py-data-text-cleanup',
        lessonIds: [
          'pydata2-retrieve-format',
          'pydata2-strip-purpose',
          'pydata2-predict-cleanup',
          'pydata2-fix-method-call',
          'pydata2-normalize-name',
        ],
      },
      {
        id: 'py-data-list-tools',
        lessonIds: [
          'pydata3-retrieve-loop',
          'pydata3-append-purpose',
          'pydata3-predict-length',
          'pydata3-fix-membership',
          'pydata3-add-unique',
        ],
      },
      {
        id: 'py-data-dictionaries',
        lessonIds: [
          'pydata4-retrieve-list-change',
          'pydata4-dictionary-purpose',
          'pydata4-predict-lookup',
          'pydata4-fix-missing-key',
          'pydata4-add-stock',
        ],
      },
      {
        id: 'py-data-summaries',
        lessonIds: [
          'pydata5-retrieve-update',
          'pydata5-accumulator-purpose',
          'pydata5-order-total',
          'pydata5-fix-total-reset',
          'pydata5-low-stock',
        ],
      },
      {
        id: 'py-data-supply-tracker',
        lessonIds: [
          'pydata6-trace-stock-update',
          'pydata6-plan-tracker',
          'pydata6-order-tracker',
          'pydata6-fix-normalized-key',
          'pydata6-supply-tracker',
        ],
      },
    ],
  },
]

const manifestsByCourseId = new Map(
  publishedContinuingCourseManifests.map((manifest) => [manifest.courseId, manifest]),
)

export function publishedContinuingCourseManifest(
  courseId: CourseId,
): PublishedContinuingCourseManifest | undefined {
  return manifestsByCourseId.get(courseId)
}

export function publishedContinuingCourseLessonIds(
  courseId: CourseId,
  moduleId: string,
): readonly string[] | undefined {
  return publishedContinuingCourseManifest(courseId)?.modules.find((module) => (
    module.id === moduleId
  ))?.lessonIds
}
