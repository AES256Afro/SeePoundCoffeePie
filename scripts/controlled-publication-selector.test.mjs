import path from 'node:path'
import { describe, expect, it } from 'vitest'

import {
  controlledPublicationSources,
  productionControlledPublicationSources,
} from './controlled-course-publication.mjs'
import {
  controlledPublicationAppSelection,
  controlledPublicationReplacement,
  controlledPublicationSelector,
} from './controlled-publication-selector.mjs'

describe('controlled publication Vite selector', () => {
  it('maps the complete production source set to fail-closed implementations', () => {
    const selection = controlledPublicationAppSelection(productionControlledPublicationSources)

    expect(path.basename(selection.continuingCourses.selected))
      .toBe('continuing-course-publications.base.ts')
    expect(path.basename(selection.codebookContributions.selected))
      .toBe('codebook-publication.base.ts')
    expect(path.basename(selection.runnerAssignments.selected))
      .toBe('runner-publication.base.ts')
  })

  it('maps all three selectors together for the reviewed candidate state', () => {
    const selection = controlledPublicationAppSelection(controlledPublicationSources('published'))

    expect(Object.values(selection).map(({ selected }) => path.basename(selected))).toEqual([
      'continuing-course-publications.with-cpp.ts',
      'codebook-publication.with-cpp.ts',
      'runner-publication.with-cpp.ts',
    ])
  })

  it('rejects missing, additional, and outside-project source sets', () => {
    expect(() => controlledPublicationAppSelection({})).toThrow(/exact reviewed source set/iu)
    expect(() => controlledPublicationAppSelection({
      ...productionControlledPublicationSources,
      unexpected: 'src/data/other.ts',
    })).toThrow(/exact reviewed source set/iu)
    expect(() => controlledPublicationAppSelection({
      ...productionControlledPublicationSources,
      runnerAssignments: '../outside.ts',
    })).toThrow(/inside the project/iu)
  })

  it('replaces only an exact selector path after Vite resolves it', async () => {
    const sources = controlledPublicationSources('published')
    const selection = controlledPublicationAppSelection(sources)
    const target = selection.codebookContributions
    const plugin = controlledPublicationSelector(sources, 'test-controlled-publication')
    const context = {
      resolve: async (source) => ({
        id: source === './controlled-codebook-publication'
          ? `${target.selector}?resolved`
          : '/src/not-controlled.ts',
      }),
    }

    expect(controlledPublicationReplacement(selection, target.selector)).toBe(target.selected)
    expect(controlledPublicationReplacement(selection, `${target.selector}.backup`)).toBeNull()
    await expect(plugin.resolveId.call(
      context,
      './controlled-codebook-publication',
      '/src/data/codebook.ts',
      {},
    )).resolves.toBe(target.selected)
    await expect(plugin.resolveId.call(
      context,
      './other',
      '/src/data/codebook.ts',
      {},
    )).resolves.toBeNull()
  })
})
