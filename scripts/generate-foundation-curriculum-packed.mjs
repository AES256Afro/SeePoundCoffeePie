import {
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

import { build } from 'vite'

const projectRoot = fileURLToPath(new URL('../', import.meta.url))
const authoredCurriculumPath = path.join(projectRoot, 'src/data/curriculum.ts')
const defaultOutputPath = path.join(
  projectRoot,
  'src/data/foundation-curriculum-packed.generated.ts',
)
const defaultWordCount = 200
const arrayMarker = null
const stringMarker = -1
const stringDelimiter = String.fromCodePoint(1)
const tokenStart = 0x100
const wordPattern = /[A-Za-z_][A-Za-z0-9_:-]*/gu

function fail(message) {
  throw new Error(`Cannot pack the foundation curriculum safely: ${message}`)
}

function assert(condition, message) {
  if (!condition) fail(message)
}

async function loadAuthoredTracks() {
  const temporaryDirectory = mkdtempSync(path.join(tmpdir(), 'foundation-curriculum-'))
  try {
    await build({
      configFile: false,
      logLevel: 'silent',
      publicDir: false,
      build: {
        emptyOutDir: false,
        minify: false,
        outDir: temporaryDirectory,
        ssr: authoredCurriculumPath,
        target: 'node22',
        rollupOptions: {
          output: { entryFileNames: 'curriculum.mjs' },
        },
      },
    })
    const compiledUrl = `${pathToFileURL(path.join(temporaryDirectory, 'curriculum.mjs')).href}?packed=${Date.now()}`
    const authored = await import(compiledUrl)
    assert(Array.isArray(authored.tracks), 'the readable source did not export tracks.')
    return authored.tracks
  } finally {
    rmSync(temporaryDirectory, { force: true, recursive: true })
  }
}

function stringsIn(value, result = []) {
  if (typeof value === 'string') result.push(value)
  else if (Array.isArray(value)) value.forEach((entry) => stringsIn(entry, result))
  else if (value && typeof value === 'object') {
    Object.values(value).forEach((entry) => stringsIn(entry, result))
  }
  return result
}

function wordDictionary(strings, limit) {
  const counts = new Map()
  const firstOccurrence = new Map()
  for (const value of strings) {
    for (const word of value.match(wordPattern) ?? []) {
      if (!firstOccurrence.has(word)) firstOccurrence.set(word, firstOccurrence.size)
      counts.set(word, (counts.get(word) ?? 0) + 1)
    }
  }

  return [...counts.entries()]
    .map(([word, count]) => ({
      count,
      score: count * (word.length - 1) - word.length - 3,
      word,
    }))
    .filter(({ count, score, word }) => count > 1 && score > 0 && word.length > 1)
    .sort((left, right) => (
      right.score - left.score
      || right.count - left.count
      || right.word.length - left.word.length
      || (left.word < right.word ? -1 : left.word > right.word ? 1 : 0)
    ))
    .slice(0, limit)
    .sort((left, right) => firstOccurrence.get(left.word) - firstOccurrence.get(right.word))
    .map(({ word }) => word)
}

function packTracks(tracks, dictionary) {
  const schemas = []
  const schemaIndex = new Map()
  const strings = []
  const dictionaryIndex = new Map(dictionary.map((word, index) => [word, index]))

  const pack = (value) => {
    if (typeof value === 'string') {
      const encoded = value.replace(wordPattern, (word) => {
        const index = dictionaryIndex.get(word)
        return index === undefined ? word : String.fromCodePoint(tokenStart + index)
      })
      assert(!encoded.includes(stringDelimiter), 'a teaching string contains the reserved string delimiter.')
      strings.push(encoded)
      return stringMarker
    }
    if (Array.isArray(value)) return [arrayMarker, ...value.map(pack)]
    if (value && typeof value === 'object') {
      const keys = Object.keys(value)
      const signature = JSON.stringify(keys)
      let index = schemaIndex.get(signature)
      if (index === undefined) {
        index = schemas.length
        schemas.push(keys)
        schemaIndex.set(signature, index)
      }
      return [index, ...keys.map((key) => pack(value[key]))]
    }
    assert(
      value === null || typeof value === 'boolean' || (typeof value === 'number' && value >= 0),
      `the source contains unsupported ${typeof value} data.`,
    )
    return value
  }

  return {
    schemas,
    shape: pack(tracks),
    strings,
  }
}

function generatedModule(dictionary, strings, schemas, shape) {
  const tokenEnd = tokenStart + dictionary.length - 1
  const encodedStrings = strings.join(stringDelimiter)
  const typeImport = "import type { LanguageTrack } from '../types'"
  return `${typeImport}\n\n`
    + `const K=${JSON.stringify(schemas)}\n`
    + `const W=${JSON.stringify(dictionary)}\n`
    + `const S=${JSON.stringify(encodedStrings)}.split(${JSON.stringify(stringDelimiter)})\n`
    + `const P=${JSON.stringify(shape)}\n`
    + `const R=/[\\u${tokenStart.toString(16).padStart(4, '0')}-\\u${tokenEnd.toString(16).padStart(4, '0')}]/gu\n`
    + 'let n=0\n'
    + 'function d(value: unknown): unknown {\n'
    + '  if (value === -1) return S[n++].replace(R, (token) => W[token.charCodeAt(0) - 256])\n'
    + '  if (!Array.isArray(value)) return value\n'
    + '  if (value[0] === null) return value.slice(1).map(d)\n'
    + '  const keys = K[value[0] as number]\n'
    + "  if (!keys) throw new Error('Packed foundation curriculum is unreadable.')\n"
    + '  const result: Record<string, unknown> = {}\n'
    + '  for (let index = 0; index < keys.length; index += 1) result[keys[index]] = d(value[index + 1])\n'
    + '  return result\n'
    + '}\n'
    + 'const decoded = d(P)\n'
    + "if (!Array.isArray(decoded)) throw new Error('Packed foundation curriculum is unreadable.')\n"
    + 'export const tracks = decoded as LanguageTrack[]\n'
}

export async function renderPackedFoundationCurriculum({ wordCount = defaultWordCount } = {}) {
  assert(Number.isInteger(wordCount) && wordCount > 0 && wordCount <= 200, 'word count must be between 1 and 200.')
  const tracks = await loadAuthoredTracks()
  const sourceStrings = stringsIn(tracks)
  for (const value of sourceStrings) {
    for (const character of value) {
      const codePoint = character.codePointAt(0)
      assert(
        codePoint < tokenStart || codePoint >= tokenStart + wordCount,
        'authored text contains a reserved dictionary token.',
      )
    }
  }
  const dictionary = wordDictionary(sourceStrings, wordCount)
  assert(dictionary.length === wordCount, `only ${dictionary.length} useful dictionary words were found.`)
  const packed = packTracks(tracks, dictionary)
  return generatedModule(dictionary, packed.strings, packed.schemas, packed.shape)
}

function parsedArguments(argv) {
  let check = false
  let outputPath = defaultOutputPath
  let wordCount = defaultWordCount
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index]
    if (argument === '--check') check = true
    else if (argument === '--output') outputPath = path.resolve(argv[++index] ?? '')
    else if (argument === '--words') wordCount = Number(argv[++index])
    else fail(`unknown generator argument ${argument}.`)
  }
  return { check, outputPath, wordCount }
}

export async function runGenerator(argv = process.argv.slice(2)) {
  const { check, outputPath, wordCount } = parsedArguments(argv)
  const generated = await renderPackedFoundationCurriculum({ wordCount })
  if (check) {
    const current = readFileSync(outputPath, 'utf8')
    assert(current === generated, `${path.relative(projectRoot, outputPath)} is stale. Run npm run generate:foundation-content.`)
    console.log(`Packed foundation curriculum is deterministic (${Buffer.byteLength(current)} source bytes).`)
    return
  }
  writeFileSync(outputPath, generated, 'utf8')
  console.log(`Generated ${path.relative(projectRoot, outputPath)} with ${wordCount} dictionary words.`)
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : ''
if (invokedPath === fileURLToPath(import.meta.url)) await runGenerator()
