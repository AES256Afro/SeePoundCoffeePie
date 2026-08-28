import { controlledCoursePublication } from './controlled-course-publication.mjs'
import {
  privateCourseReleaseCatalog,
  unpublishedCppCourseId,
} from './unpublished-cpp-release-boundary.mjs'

const candidateReleaseCatalog = Object.freeze(privateCourseReleaseCatalog.map((course) => (
  course.id === unpublishedCppCourseId
    ? Object.freeze({ ...course, state: 'published' })
    : course
)))

// The complete candidate build, its bundle inspection, and its browser harness
// all consume this one validated publication decision. Production never imports
// this module, so the checked-in unpublished catalog remains fail closed.
export const practicalCppCandidatePublication = controlledCoursePublication(
  candidateReleaseCatalog,
)
