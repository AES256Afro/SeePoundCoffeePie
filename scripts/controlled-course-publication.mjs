import {
  privateCourseReleaseCatalog,
} from './unpublished-cpp-release-boundary.mjs'

// This independent release contract intentionally repeats the reviewed public
// identifiers. A publication-state edit cannot silently redefine its own
// expected routes. Any future route change must update and review both sides.
const reviewedPracticalCppPublication = Object.freeze({
  id: 'cpp-collections-records',
  coursePath: '/courses/cpp-collections-records',
  lessonPrefix: '/learn/cpp-collections-records/',
  lessonPath: '/learn/cpp-collections-records/cpp-records-return-values/cpprecords1-retrieve-call',
})

const baseSources = Object.freeze({
  continuingCourses: 'src/data/continuing-course-publications.base.ts',
  codebookContributions: 'src/data/codebook-publication.base.ts',
  runnerAssignments: 'src/data/runner-publication.base.ts',
})

const practicalCppSources = Object.freeze({
  continuingCourses: 'src/data/continuing-course-publications.with-cpp.ts',
  codebookContributions: 'src/data/codebook-publication.with-cpp.ts',
  runnerAssignments: 'src/data/runner-publication.with-cpp.ts',
})

/**
 * Selects controlled browser source files before Vite builds the application.
 * Only the exact source-controlled `published` state selects candidate files.
 * Every missing, unknown, malformed, or unpublished value fails closed.
 */
export function controlledPublicationSources(releaseState) {
  return releaseState === 'published' ? practicalCppSources : baseSources
}

function releasedPracticalCppCourse(releaseCatalog) {
  if (!Array.isArray(releaseCatalog)) return undefined

  const matchingCourses = releaseCatalog.filter((entry) => (
    entry
    && typeof entry === 'object'
    && entry.id === reviewedPracticalCppPublication.id
  ))
  if (matchingCourses.length !== 1) return undefined

  const [course] = matchingCourses
  if (
    !course
    || course.state !== 'published'
    || course.coursePath !== reviewedPracticalCppPublication.coursePath
    || course.lessonPrefix !== reviewedPracticalCppPublication.lessonPrefix
    || course.lessonPath !== reviewedPracticalCppPublication.lessonPath
  ) {
    return undefined
  }

  return course
}

/**
 * Validates one release record once, then derives every public projection from
 * that decision. A bad route cannot select candidate sources without also
 * selecting the matching canonical sitemap routes.
 */
export function controlledCoursePublication(releaseCatalog) {
  const course = releasedPracticalCppCourse(releaseCatalog)
  return Object.freeze({
    sources: course ? practicalCppSources : baseSources,
    routes: course
      ? Object.freeze([
          reviewedPracticalCppPublication.coursePath,
          reviewedPracticalCppPublication.lessonPath,
        ])
      : Object.freeze([]),
  })
}

/**
 * Returns the public route projection for controlled courses. This is used by
 * sitemap and release checks, not by the browser router.
 */
export function publicControlledCourseRoutes(releaseCatalog) {
  return controlledCoursePublication(releaseCatalog).routes
}

export const productionControlledPublication = controlledCoursePublication(
  privateCourseReleaseCatalog,
)

export const productionControlledPublicationSources = productionControlledPublication.sources
export const productionControlledCourseRoutes = productionControlledPublication.routes
