import { describe, expect, it } from 'vitest'

import {
  controlledCoursePublication,
  controlledPublicationSources,
  productionControlledPublication,
  productionControlledCourseRoutes,
  productionControlledPublicationSources,
  publicControlledCourseRoutes,
} from './controlled-course-publication.mjs'

const baseSources = {
  continuingCourses: 'src/data/continuing-course-publications.base.ts',
  codebookContributions: 'src/data/codebook-publication.base.ts',
  runnerAssignments: 'src/data/runner-publication.base.ts',
}

const practicalCppSources = {
  continuingCourses: 'src/data/continuing-course-publications.with-cpp.ts',
  codebookContributions: 'src/data/codebook-publication.with-cpp.ts',
  runnerAssignments: 'src/data/runner-publication.with-cpp.ts',
}

describe('controlled course publication source selection', () => {
  it('selects every candidate source only for the exact published state', () => {
    expect(controlledPublicationSources('published')).toEqual(practicalCppSources)
  })

  it.each([
    ['unpublished', 'unpublished'],
    ['unavailable', 'unavailable'],
    ['missing', undefined],
    ['null', null],
    ['mixed case', 'Published'],
    ['boolean', true],
    ['object', { state: 'published' }],
  ])('fails closed for %s state', (_label, state) => {
    expect(controlledPublicationSources(state)).toEqual(baseSources)
  })

  it('selects every reviewed Practical C++ source in production', () => {
    expect(productionControlledPublication).toEqual({
      routes: [
        '/courses/cpp-collections-records',
        '/learn/cpp-collections-records/cpp-records-return-values/cpprecords1-retrieve-call',
      ],
      sources: practicalCppSources,
    })
    expect(productionControlledPublicationSources).toEqual(practicalCppSources)
  })
})

describe('controlled course route projection', () => {
  const candidate = {
    id: 'cpp-collections-records',
    coursePath: '/courses/cpp-collections-records',
    lessonPrefix: '/learn/cpp-collections-records/',
    lessonPath: '/learn/cpp-collections-records/cpp-records-return-values/cpprecords1-retrieve-call',
  }

  it('projects the reviewed Practical C++ routes in production', () => {
    expect(productionControlledCourseRoutes).toEqual([
      candidate.coursePath,
      candidate.lessonPath,
    ])
  })

  it('projects the course and first canonical lesson only when published', () => {
    const publication = controlledCoursePublication([{ ...candidate, state: 'published' }])
    expect(publication).toEqual({
      routes: [candidate.coursePath, candidate.lessonPath],
      sources: practicalCppSources,
    })
    expect(publicControlledCourseRoutes([{ ...candidate, state: 'published' }])).toEqual(publication.routes)
  })

  it.each([
    ['unpublished', [{ ...candidate, state: 'unpublished' }]],
    ['unknown', [{ ...candidate, state: 'unexpected' }]],
    ['missing state', [candidate]],
    ['wrong course path', [{ ...candidate, state: 'published', coursePath: '/courses/other' }]],
    ['wrong lesson prefix', [{ ...candidate, state: 'published', lessonPrefix: '/learn/other/' }]],
    ['wrong lesson path', [{ ...candidate, state: 'published', lessonPath: '/learn/other' }]],
    ['duplicate candidate ID', [
      { ...candidate, state: 'published' },
      { ...candidate, state: 'unpublished' },
    ]],
    ['missing catalog', undefined],
    ['malformed catalog', { ...candidate, state: 'published' }],
  ])('fails closed for a %s route catalog', (_label, catalog) => {
    expect(controlledCoursePublication(catalog)).toEqual({
      routes: [],
      sources: baseSources,
    })
    expect(publicControlledCourseRoutes(catalog)).toEqual([])
  })
})
