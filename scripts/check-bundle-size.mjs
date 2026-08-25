import { readdir, readFile, stat } from 'node:fs/promises'
import { gzipSync } from 'node:zlib'
import path from 'node:path'

const root = new URL('../dist/', import.meta.url)
const budgets = {
  // Semantic labels and focus management compress well. Keep transfer size as the tighter gate.
  javascript: { raw: 465_000, gzip: 125_000 },
  css: { raw: 58_000, gzip: 12_500 },
  html: { raw: 5_000, gzip: 2_000 },
}

async function filesBelow(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const location = new URL(entry.name, directory.href.endsWith('/') ? directory : new URL(`${directory.href}/`))
    if (entry.isDirectory()) files.push(...await filesBelow(new URL(`${location.href}/`)))
    else files.push(location)
  }
  return files
}

function category(fileName) {
  if (fileName.endsWith('.js')) return 'javascript'
  if (fileName.endsWith('.css')) return 'css'
  if (fileName.endsWith('.html')) return 'html'
  return null
}

function kilobytes(bytes) {
  return `${(bytes / 1_000).toFixed(2)} kB`
}

const totals = {
  javascript: { raw: 0, gzip: 0 },
  css: { raw: 0, gzip: 0 },
  html: { raw: 0, gzip: 0 },
}
const failures = []

for (const file of await filesBelow(root)) {
  const fileName = path.basename(file.pathname)
  const kind = category(fileName)
  if (!kind) continue

  const contents = await readFile(file)
  const raw = (await stat(file)).size
  const gzip = gzipSync(contents).byteLength
  totals[kind].raw += raw
  totals[kind].gzip += gzip
}

for (const [kind, sizes] of Object.entries(totals)) {
  const budget = budgets[kind]
  console.log(`${kind}: ${kilobytes(sizes.raw)} raw, ${kilobytes(sizes.gzip)} gzip`)
  if (sizes.raw > budget.raw) failures.push(`${kind} raw size exceeds ${kilobytes(budget.raw)}`)
  if (sizes.gzip > budget.gzip) failures.push(`${kind} gzip size exceeds ${kilobytes(budget.gzip)}`)
}

if (failures.length > 0) {
  console.error('\nBundle budget failed:')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exitCode = 1
} else {
  console.log('Bundle budget passed.')
}
