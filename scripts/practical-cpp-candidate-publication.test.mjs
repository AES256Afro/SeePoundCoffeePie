import path from 'node:path'
import { describe, expect, it } from 'vitest'

import {
  controlledPublicationAppSelection,
  controlledPublicationReplacement,
  controlledPublicationSelector,
} from './controlled-publication-selector.mjs'
import {
  practicalCppCandidatePublication,
} from './practical-cpp-candidate-publication.mjs'

const candidateSelection = controlledPublicationAppSelection(
  practicalCppCandidatePublication.sources,
)

describe('Practical C++ complete-app candidate publication', () => {
  it('couples the reviewed routes to all three candidate sources', () => {
    expect(practicalCppCandidatePublication).toEqual({
      routes: [
        '/courses/cpp-collections-records',
        '/learn/cpp-collections-records/cpp-records-return-values/cpprecords1-retrieve-call',
      ],
      sources: {
        continuingCourses: 'src/data/continuing-course-publications.with-cpp.ts',
        codebookContributions: 'src/data/codebook-publication.with-cpp.ts',
        runnerAssignments: 'src/data/runner-publication.with-cpp.ts',
      },
    })
    expect(Object.isFrozen(practicalCppCandidatePublication)).toBe(true)
    expect(Object.isFrozen(practicalCppCandidatePublication.routes)).toBe(true)
  })

  it('maps only the checked-in publication selectors to reviewed candidate sources', () => {
    expect(path.basename(candidateSelection.continuingCourses.selector))
      .toBe('controlled-continuing-course-publication.ts')
    expect(path.basename(candidateSelection.continuingCourses.selected))
      .toBe('continuing-course-publications.with-cpp.ts')
    expect(path.basename(candidateSelection.codebookContributions.selector))
      .toBe('controlled-codebook-publication.ts')
    expect(path.basename(candidateSelection.codebookContributions.selected))
      .toBe('codebook-publication.with-cpp.ts')
    expect(path.basename(candidateSelection.runnerAssignments.selector))
      .toBe('controlled-runner-publication.ts')
    expect(path.basename(candidateSelection.runnerAssignments.selected))
      .toBe('runner-publication.with-cpp.ts')
  })

  it('fails closed for near matches and preserves an exact selector query match', () => {
    const { selector, selected } = candidateSelection.continuingCourses
    expect(controlledPublicationReplacement(candidateSelection, selector)).toBe(selected)
    expect(controlledPublicationReplacement(candidateSelection, `${selector}?candidate-build`))
      .toBe(selected)
    expect(controlledPublicationReplacement(candidateSelection, `${selector}.backup`)).toBeNull()
    expect(controlledPublicationReplacement(candidateSelection, '')).toBeNull()
  })

  it('replaces a selector only after Vite resolves it to the exact source path', async () => {
    const plugin = controlledPublicationSelector(
      practicalCppCandidatePublication.sources,
      'practical-cpp-candidate-publication',
    )
    const selection = candidateSelection.codebookContributions
    const context = {
      resolve: async (source) => ({
        id: source === './controlled-codebook-publication' ? selection.selector : '/src/other.ts',
      }),
    }

    await expect(plugin.resolveId.call(
      context,
      './controlled-codebook-publication',
      '/src/data/codebook.ts',
      {},
    )).resolves.toBe(selection.selected)
    await expect(plugin.resolveId.call(
      context,
      './other',
      '/src/data/codebook.ts',
      {},
    )).resolves.toBeNull()
  })
})
