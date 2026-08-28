import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'

import { build } from 'vite'

const projectRoot = fileURLToPath(new URL('../', import.meta.url))
const candidateDataPath = path.join(
  projectRoot,
  'src/data/cpp-collections-records-course-packed.generated.json',
)
const continuingSourcePath = path.join(
  projectRoot,
  'src/data/continuing-course-publications.with-cpp.ts',
)
const codebookSourcePath = path.join(
  projectRoot,
  'src/data/codebook-publication.with-cpp.ts',
)

const candidateBundleBudgets = Object.freeze({
  javascript: Object.freeze({ raw: 70_000, gzip: 21_000 }),
  teachingData: Object.freeze({ raw: 54_000, gzip: 15_000 }),
  aggregate: Object.freeze({ raw: 124_000, gzip: 36_000 }),
})
const serverOwnedMarkers = Object.freeze([
  'CppCollectionsAnalyzer.py',
  'SESSION_SECRET',
  'RUNNER_',
  'expectedStdout',
  'final-hidden',
  'projectCheckStdin',
])

function sizes(contents) {
  const buffer = Buffer.isBuffer(contents) ? contents : Buffer.from(contents)
  return Object.freeze({
    raw: buffer.byteLength,
    gzip: gzipSync(buffer).byteLength,
  })
}

function totalSizes(rows) {
  return rows.reduce((total, row) => ({
    raw: total.raw + row.raw,
    gzip: total.gzip + row.gzip,
  }), { raw: 0, gzip: 0 })
}

function enforceBudget(label, measured, budget) {
  if (measured.raw > budget.raw || measured.gzip > budget.gzip) {
    throw new Error(
      `${label} is ${measured.raw} raw and ${measured.gzip} gzip bytes; `
      + `the reviewed limit is ${budget.raw} raw and ${budget.gzip} gzip bytes.`,
    )
  }
}

export async function checkCppContentCandidateBundle() {
  const virtualEntry = 'virtual:practical-cpp-publication-candidate'
  const resolvedEntry = `\0${virtualEntry}`
  const result = await build({
    configFile: false,
    root: projectRoot,
    logLevel: 'silent',
    plugins: [{
      name: 'practical-cpp-publication-candidate',
      resolveId(id) {
        return id === virtualEntry ? resolvedEntry : null
      },
      load(id) {
        if (id !== resolvedEntry) return null
        return [
          `import { controlledContinuingCourseRegistrations } from ${JSON.stringify(continuingSourcePath)}`,
          `import { controlledCodebookContributions } from ${JSON.stringify(codebookSourcePath)}`,
          'globalThis.__SPCP_CPP_PUBLICATION_CANDIDATE__ = {',
          '  continuing: controlledContinuingCourseRegistrations,',
          '  codebook: controlledCodebookContributions,',
          '}',
        ].join('\n')
      },
    }],
    build: {
      write: false,
      rollupOptions: {
        input: virtualEntry,
        output: {
          assetFileNames: 'assets/[name]-[hash][extname]',
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
        },
      },
    },
  })
  if (Array.isArray(result)) {
    throw new Error('The Practical C++ candidate build emitted an unexpected multi-build result.')
  }

  const output = result.output
  const javascript = output
    .filter((item) => item.type === 'chunk')
    .map((item) => ({ fileName: item.fileName, ...sizes(item.code) }))
  const jsonAssets = output.filter((item) => (
    item.type === 'asset' && item.fileName.endsWith('.json')
  ))
  if (jsonAssets.length !== 1) {
    throw new Error('The Practical C++ candidate must emit exactly one teaching-data JSON asset.')
  }
  const [jsonAsset] = jsonAssets
  if (!/^assets\/cpp-collections-records-course-packed\.generated-[A-Za-z0-9_-]{6,}\.json$/u.test(jsonAsset.fileName)) {
    throw new Error(`The Practical C++ teaching-data asset is not content hashed: ${jsonAsset.fileName}.`)
  }
  const emittedData = Buffer.from(jsonAsset.source)
  const authoredData = readFileSync(candidateDataPath)
  if (!emittedData.equals(authoredData)) {
    throw new Error('The emitted Practical C++ teaching-data asset differs from the reviewed generated source.')
  }
  const emittedDataText = emittedData.toString('utf8')
  for (const marker of serverOwnedMarkers) {
    if (emittedDataText.includes(marker)) {
      throw new Error(`Server-owned assessment marker ${marker} leaked into Practical C++ teaching data.`)
    }
  }

  const entry = output.find((item) => item.type === 'chunk' && item.isEntry)
  if (!entry || entry.code.includes(jsonAsset.fileName)) {
    throw new Error('The Practical C++ teaching data must stay behind its lazy loader boundary.')
  }
  const referencingChunks = output.filter((item) => (
    item.type === 'chunk' && item.code.includes(path.basename(jsonAsset.fileName))
  ))
  if (referencingChunks.length !== 1 || referencingChunks[0].isEntry) {
    throw new Error('Exactly one lazy loader chunk must own the Practical C++ teaching-data URL.')
  }

  const javascriptTotal = totalSizes(javascript)
  const teachingData = sizes(emittedData)
  const aggregate = {
    raw: javascriptTotal.raw + teachingData.raw,
    gzip: javascriptTotal.gzip + teachingData.gzip,
  }
  enforceBudget('Candidate JavaScript', javascriptTotal, candidateBundleBudgets.javascript)
  enforceBudget('Candidate teaching data', teachingData, candidateBundleBudgets.teachingData)
  enforceBudget('Candidate aggregate transfer', aggregate, candidateBundleBudgets.aggregate)

  console.log(
    `Practical C++ controlled bundle: ${javascriptTotal.raw} raw/${javascriptTotal.gzip} gzip JavaScript, `
    + `${teachingData.raw} raw/${teachingData.gzip} gzip teaching data, `
    + `${aggregate.raw} raw/${aggregate.gzip} gzip aggregate.`,
  )
  return Object.freeze({ aggregate, javascript: javascriptTotal, teachingData })
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : ''
if (invokedPath === fileURLToPath(import.meta.url)) await checkCppContentCandidateBundle()
