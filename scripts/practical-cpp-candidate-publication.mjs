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

// The isolated complete-app checks keep consuming this validated publication
// decision. Once production is published, tests require this historical
// candidate projection to remain exactly equal to the production projection.
export const practicalCppCandidatePublication = controlledCoursePublication(
  candidateReleaseCatalog,
)
