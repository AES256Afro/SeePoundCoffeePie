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
]
const teachingMarkers = [
  'A sequence of instructions that a computer follows.',
  'C++ source code does not run directly.',
]

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
for (const teachingMarker of teachingMarkers) {
  if (entry.contents.includes(teachingMarker)) {
    throw new Error(`Full project teaching content ${teachingMarker} leaked into the first-load JavaScript asset.`)
  }
  if (!emittedAssets.some(({ name, contents }) => name !== entry.name && contents.includes(teachingMarker))) {
    throw new Error(`The route-loaded project teaching content ${teachingMarker} is missing from the production assets.`)
  }
}

console.log(`Project bundle boundary passed across ${emittedAssets.length} emitted JavaScript and CSS assets.`)
