import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'

import {
  assertNoEmittedSourceMaps,
  assetNamesReferencedByHtml,
} from './bundle-release-guards.mjs'
import {
  inspectPracticalCppCandidateAssets,
  practicalCppServerOwnedMarkers,
} from './practical-cpp-candidate-app-guards.mjs'
import {
  privateCourseIsPublished,
  privateCourseReleaseState,
  practicalCppPrivateJavaScriptMarkers,
  unpublishedCppCourseId,
  unpublishedCppLessonIds,
} from './unpublished-cpp-release-boundary.mjs'

const dist = new URL('../dist/', import.meta.url)
const assets = new URL('assets/', dist)
const genericPrivateMarkers = [
  'Morgan',
  'Riley',
  'Sam Lee',
  'final-hidden-one-cup',
  'final-hidden-seven-cups',
  'final-hidden-spaced-name',
  'The smallest ordinary order',
  'A larger order',
  'A spaced name and zero count',
  'final-hidden-one-detail',
  'final-hidden-seven-details',
  'The smallest ordinary observation',
  'A larger observation',
  'Maren Holt',
  'Ivo Chen',
  'Tess Alvarez',
  'final-hidden-zero-visits',
  'final-hidden-below-member',
  'final-hidden-member-boundary',
  'final-hidden-one-guest',
  'final-hidden-below-large-table',
  'final-hidden-large-table-boundary',
  'python-data-tools-supply-tracker-v1',
  'supply-tracker-visible-report',
  'Keep the four supplied functions and report steps in their taught order without extra or unreachable statements.',
]
const catalogCppPrivateMarkers = practicalCppPrivateJavaScriptMarkers.map(({ value }) => value)
const cppPrivateMarkers = practicalCppServerOwnedMarkers({
  catalogMarkers: catalogCppPrivateMarkers,
  serverAssessmentSource: await readFile(
    new URL('../src/data/cpp-collections-records.server.ts', import.meta.url),
    'utf8',
  ),
})
const privateMarkers = [...genericPrivateMarkers, ...cppPrivateMarkers]
const projectTeachingMarkers = [
  'A sequence of instructions that a computer follows.',
  'C++ source code does not run directly.',
  'Modern C# also permits top-level instructions',
  'Java begins as readable source saved in Main.java.',
]
const foundationAssetPattern = /^foundation-curriculum-packed\.generated-[A-Za-z0-9_-]{6,}\.js$/u
const foundationDecoderMarker = 'Packed foundation curriculum is unreadable.'
const dataToolsTeachingMarker = 'A normalization function applies the same cleanup rule every time.'
const phase5bCompatibilityMarker = 'cpprecords6-workshop-stock-report'
const firstUnpublishedCppLessonId = unpublishedCppLessonIds[0]

if (!firstUnpublishedCppLessonId) {
  throw new Error('The Practical C++ release boundary does not contain a lesson marker.')
}

if (
  privateCourseReleaseState(unpublishedCppCourseId) !== 'published'
  || !privateCourseIsPublished(unpublishedCppCourseId)
) {
  throw new Error('The production bundle check requires Practical C++ to be published.')
}

await assertNoEmittedSourceMaps(dist)

const index = await readFile(new URL('index.html', dist), 'utf8')
const entryMatch = /<script[^>]+src="[^"]*\/([^/"?]+\.js)(?:\?[^" ]*)?"/iu.exec(index)
if (!entryMatch) throw new Error('The production page does not declare a JavaScript entry asset.')
const initialJavaScriptAssetNames = assetNamesReferencedByHtml(index, 'js')

const assetNames = (await readdir(assets)).filter((name) => /\.(?:js|css|json)$/u.test(name))
const emittedAssets = await Promise.all(assetNames.map(async (name) => ({
  name,
  contents: await readFile(new URL(name, assets), 'utf8'),
})))
const emittedAssetsByName = new Map(emittedAssets.map((asset) => [asset.name, asset]))
const initialJavaScriptAssets = [...initialJavaScriptAssetNames].map((name) => {
  const asset = emittedAssetsByName.get(name)
  if (!asset) throw new Error(`The initial JavaScript asset ${name} is missing.`)
  return asset
})
const lazyJavaScriptAssets = emittedAssets.filter(({ name }) => (
  name.endsWith('.js') && !initialJavaScriptAssetNames.has(name)
))

for (const { name, contents } of emittedAssets) {
  for (const marker of privateMarkers) {
    if (contents.includes(marker)) throw new Error(`Private marker ${marker} appeared in ${name}.`)
  }
}

const entry = emittedAssets.find(({ name }) => name === path.basename(entryMatch[1]))
if (!entry) throw new Error(`The entry asset ${entryMatch[1]} is missing.`)
if (!initialJavaScriptAssets.some(({ contents }) => contents.includes(phase5bCompatibilityMarker))) {
  throw new Error('The Phase 5B compatibility manifest is missing from the initial JavaScript graph.')
}
if (!initialJavaScriptAssets.some(({ contents }) => contents.includes(unpublishedCppCourseId))) {
  throw new Error('The published Practical C++ course registry is missing from the initial JavaScript graph.')
}
const cppAssets = new Map([
  ['index.html', index],
  ...emittedAssets.map(({ name, contents }) => [`assets/${name}`, Buffer.from(contents)]),
])
const cppEvidence = inspectPracticalCppCandidateAssets({
  assets: cppAssets,
  authoredTeachingData: await readFile(
    new URL('../src/data/cpp-collections-records-course-packed.generated.json', import.meta.url),
  ),
  initialAssetNames: initialJavaScriptAssetNames,
  privateMarkers: cppPrivateMarkers,
})
for (const teachingMarker of projectTeachingMarkers) {
  const leakingAssets = initialJavaScriptAssets.filter(({ contents }) => contents.includes(teachingMarker))
  if (leakingAssets.length > 0) {
    throw new Error(
      `Full project teaching content ${teachingMarker} leaked into the initial JavaScript graph `
      + `through ${leakingAssets.map(({ name }) => name).join(', ')}.`,
    )
  }
  if (!lazyJavaScriptAssets.some(({ contents }) => contents.includes(teachingMarker))) {
    throw new Error(`The route-loaded project teaching content ${teachingMarker} is missing from the production assets.`)
  }
}

const foundationTeachingAssets = lazyJavaScriptAssets.filter(({ name, contents }) => (
  foundationAssetPattern.test(name) && contents.includes(foundationDecoderMarker)
))
if (foundationTeachingAssets.length !== 1) {
  throw new Error('Published foundation teaching content must appear in exactly one reviewed lazy asset.')
}
if (initialJavaScriptAssets.some(({ name }) => foundationAssetPattern.test(name))) {
  throw new Error('Foundation teaching content leaked into the initial JavaScript graph.')
}

const dataToolsAssets = emittedAssets.filter(({ name, contents }) => (
  name.endsWith('.js') && contents.includes(dataToolsTeachingMarker)
))
const initialDataToolsAssets = initialJavaScriptAssets.filter(({ contents }) => (
  contents.includes(dataToolsTeachingMarker)
))
if (initialDataToolsAssets.length > 0) {
  throw new Error(
    `Practical Python teaching content leaked into the initial JavaScript graph through `
    + `${initialDataToolsAssets.map(({ name }) => name).join(', ')}.`,
  )
}
if (
  dataToolsAssets.length !== 1
  || !/^python-data-tools-course-.*\.js$/u.test(dataToolsAssets[0]?.name ?? '')
) {
  throw new Error('Practical Python teaching content must appear in exactly one reviewed lazy course asset.')
}

console.log(
  `Server-owned assessment bundle boundary passed across ${emittedAssets.length} emitted JavaScript, CSS, and JSON assets, `
  + `${initialJavaScriptAssets.length} initial JavaScript assets, one lazy foundation teaching asset, and published `
  + `Practical C++ data ${cppEvidence.candidateTeachingAssetName} behind ${cppEvidence.owningJavaScriptAssetName}.`,
)
