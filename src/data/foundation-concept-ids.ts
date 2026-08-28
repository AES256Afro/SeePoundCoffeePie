import { foundationLessonMetadata } from './foundation-curriculum-index'

export const foundationConceptIds: readonly string[] = Object.freeze([
  ...new Set(foundationLessonMetadata.map(([, conceptId]) => conceptId)),
])
