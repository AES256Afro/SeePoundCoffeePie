import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'

const dist = new URL('../dist/', import.meta.url)
const assets = new URL('assets/', dist)
const privateMarkers = [
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
  'cpp-collections-records-workshop-report-v1',
  'workshop-stock-report-visible',
  'Keep the three supplied headers, Part record, helpers, and main function in their taught order without extra or unreachable code.',
  'CppCollectionsAnalyzer.py',
  'cpp-collections-records',
  'A workshop calculator has a label promising a whole-number result.',
  'A vector is a standard C++ collection that can grow after it is created.',
  'A record keeps related values together. In C++, struct defines a reusable user-defined type for that record shape.',
  'A normal Part parameter or loop variable receives a copy, so changing it does not change the original record.',
  'A stock clerk writes zero once at the top of a count sheet',
  'The workshop stations are already built and connected.',
]
const teachingMarkers = [
  'A sequence of instructions that a computer follows.',
  'C++ source code does not run directly.',
  'Modern C# also permits top-level instructions',
  'Java begins as readable source saved in Main.java.',
]
const dataToolsTeachingMarker = 'A normalization function applies the same cleanup rule every time.'
const phase5bCompatibilityMarker = 'cpprecords6-workshop-stock-report'

const index = await readFile(new URL('index.html', dist), 'utf8')
const entryMatch = /<script[^>]+src="[^"]*\/([^/"?]+\.js)(?:\?[^" ]*)?"/iu.exec(index)
if (!entryMatch) throw new Error('The production page does not declare a JavaScript entry asset.')

const assetNames = (await readdir(assets)).filter((name) => /\.(?:js|css)$/u.test(name))
const emittedAssets = await Promise.all(assetNames.map(async (name) => ({
  name,
  contents: await readFile(new URL(name, assets), 'utf8'),
})))

for (const { name, contents } of emittedAssets) {
  for (const marker of privateMarkers) {
    if (contents.includes(marker)) throw new Error(`Private project marker ${marker} appeared in ${name}.`)
  }
}

const entry = emittedAssets.find(({ name }) => name === path.basename(entryMatch[1]))
if (!entry) throw new Error(`The entry asset ${entryMatch[1]} is missing.`)
if (!entry.contents.includes(phase5bCompatibilityMarker)) {
  throw new Error('The Phase 5B identifier-only compatibility manifest is missing from the first-load JavaScript asset.')
}
for (const teachingMarker of teachingMarkers) {
  if (entry.contents.includes(teachingMarker)) {
    throw new Error(`Full project teaching content ${teachingMarker} leaked into the first-load JavaScript asset.`)
  }
  if (!emittedAssets.some(({ name, contents }) => name !== entry.name && contents.includes(teachingMarker))) {
    throw new Error(`The route-loaded project teaching content ${teachingMarker} is missing from the production assets.`)
  }
}

const dataToolsAssets = emittedAssets.filter(({ contents }) => contents.includes(dataToolsTeachingMarker))
if (entry.contents.includes(dataToolsTeachingMarker)) {
  throw new Error('Practical Python teaching content leaked into the first-load JavaScript asset.')
}
if (
  dataToolsAssets.length !== 1
  || !/^python-data-tools-course-.*\.js$/u.test(dataToolsAssets[0]?.name ?? '')
) {
  throw new Error('Practical Python teaching content must appear in exactly one reviewed lazy course asset.')
}

console.log(`Server-owned assessment bundle boundary passed across ${emittedAssets.length} emitted JavaScript and CSS assets.`)
