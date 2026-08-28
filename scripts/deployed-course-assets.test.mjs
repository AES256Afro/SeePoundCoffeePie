import { describe, expect, it } from 'vitest'

import {
  assertReviewedApplicationEntry,
  assertReviewedInitialCourseRegistry,
  assertReviewedPracticalPythonAssets,
} from './deployed-course-assets.mjs'

const origin = 'https://example.com'

function lazyPracticalPythonGraph() {
  return new Map([
    [`${origin}/assets/index-abc123.js`, 'const heading = "Your first programming lesson"'],
    [
      `${origin}/assets/shared-registry123.js`,
      [
        'const python = ["python-data-tools", "Practical Python: Data Tools"]',
        'const cpp = ["cpp-collections-records", "Practical C++: Collections and Records"]',
      ].join('\n'),
    ],
    [
      `${origin}/assets/PythonDataToolsRoute-route123.js`,
      'const lazyCourse = import("./python-data-tools-course-data123.js")',
    ],
    [
      `${origin}/assets/python-data-tools-course-data123.js`,
      'const example = "Products: 2"',
    ],
  ])
}

const shell = [
  '<script type="module" src="/assets/index-abc123.js"></script>',
  '<link rel="modulepreload" href="/assets/shared-registry123.js">',
].join('\n')

describe('deployed course asset contracts', () => {
  it('accepts an entry without lazy course identifiers', () => {
    expect(() => assertReviewedApplicationEntry({
      asset: 'const heading = "Your first programming lesson"',
      contentType: 'application/javascript; charset=utf-8',
      httpStatus: 200,
      label: 'Staging',
      requiredMarkers: ['Your first programming lesson'],
    })).not.toThrow()
  })

  it('accepts course registries in an HTML-referenced modulepreload', () => {
    const graph = lazyPracticalPythonGraph()
    const initialAssetUrls = assertReviewedInitialCourseRegistry({
      assets: graph,
      html: shell,
      label: 'Staging',
    })

    expect(initialAssetUrls).toEqual(new Set([
      `${origin}/assets/index-abc123.js`,
      `${origin}/assets/shared-registry123.js`,
    ]))
    expect(() => assertReviewedPracticalPythonAssets(
      graph,
      'Staging',
      initialAssetUrls,
    )).not.toThrow()
  })

  it('rejects registries found only in lazy assets or a missing initial asset', () => {
    const lazyOnlyGraph = lazyPracticalPythonGraph()
    lazyOnlyGraph.set(`${origin}/assets/shared-registry123.js`, 'const shared = true')
    lazyOnlyGraph.set(
      `${origin}/assets/PythonDataToolsRoute-route123.js`,
      [
        'const python = ["python-data-tools", "Practical Python: Data Tools"]',
        'const cpp = ["cpp-collections-records", "Practical C++: Collections and Records"]',
      ].join('\n'),
    )
    expect(() => assertReviewedInitialCourseRegistry({
      assets: lazyOnlyGraph,
      html: shell,
      label: 'Staging',
    })).toThrow(/initial JavaScript graph is missing/iu)

    const missingInitialGraph = lazyPracticalPythonGraph()
    missingInitialGraph.delete(`${origin}/assets/shared-registry123.js`)
    expect(() => assertReviewedInitialCourseRegistry({
      assets: missingInitialGraph,
      html: shell,
      label: 'Staging',
    })).toThrow(/missing or ambiguous/iu)
  })

  it('requires the Practical Python route and teaching-content assets separately', () => {
    const graph = lazyPracticalPythonGraph()
    const initialAssetUrls = assertReviewedInitialCourseRegistry({
      assets: graph,
      html: shell,
      label: 'Staging',
    })

    graph.delete(`${origin}/assets/python-data-tools-course-data123.js`)
    expect(() => assertReviewedPracticalPythonAssets(graph, 'Staging', initialAssetUrls))
      .toThrow(/teaching-content asset/iu)
  })

  it('rejects duplicate or unreviewed Practical Python lazy assets', () => {
    const duplicateGraph = lazyPracticalPythonGraph()
    const initialAssetUrls = assertReviewedInitialCourseRegistry({
      assets: duplicateGraph,
      html: shell,
      label: 'Production',
    })
    duplicateGraph.set(
      `${origin}/assets/PythonDataToolsRoute-other123.js`,
      'const lazyCourse = import("./python-data-tools-course-data123.js")',
    )
    expect(() => assertReviewedPracticalPythonAssets(
      duplicateGraph,
      'Production',
      initialAssetUrls,
    ))
      .toThrow(/one unique Practical Python route asset/iu)

    const wrongContentGraph = lazyPracticalPythonGraph()
    wrongContentGraph.set(
      `${origin}/assets/python-data-tools-course-data123.js`,
      'const example = "unreviewed"',
    )
    expect(() => assertReviewedPracticalPythonAssets(
      wrongContentGraph,
      'Production',
      initialAssetUrls,
    ))
      .toThrow(/does not match Phase 5A/iu)

    const initialTeachingGraph = lazyPracticalPythonGraph()
    const initialTeachingHtml = `${shell}\n<link rel="modulepreload" href="/assets/python-data-tools-course-data123.js">`
    const expandedInitialAssetUrls = assertReviewedInitialCourseRegistry({
      assets: initialTeachingGraph,
      html: initialTeachingHtml,
      label: 'Production',
    })
    expect(() => assertReviewedPracticalPythonAssets(
      initialTeachingGraph,
      'Production',
      expandedInitialAssetUrls,
    )).toThrow(/entered the initial JavaScript graph/iu)
  })

  it('rejects an invalid entry response or required shell marker', () => {
    for (const entry of [
      { asset: 'valid', contentType: 'application/javascript', httpStatus: 404 },
      { asset: 'valid', contentType: 'text/plain', httpStatus: 200 },
      { asset: 'missing', contentType: 'application/javascript', httpStatus: 200 },
    ]) {
      expect(() => assertReviewedApplicationEntry({
        ...entry,
        label: 'Staging',
        requiredMarkers: ['valid'],
      })).toThrow(/application entry/iu)
    }
  })
})
