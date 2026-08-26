import { readdir, readFile, stat } from 'node:fs/promises'
import { gzipSync } from 'node:zlib'
import path from 'node:path'

const root = new URL('../dist/', import.meta.url)
const budgets = {
  // The first-load budget stays tight. Route-loaded teaching content gets a separate total cap.
  initial: {
    javascript: { raw: 485_000, gzip: 132_000 },
    css: { raw: 70_000, gzip: 13_000 },
    html: { raw: 5_000, gzip: 2_000 },
  },
  total: {
    // Phase 4C adds a third complete route-loaded curriculum. The small
    // manifests remain on the initial page, while each full language project
    // stays in its own on-demand chunk.
    javascript: { raw: 615_000, gzip: 168_000 },
    css: { raw: 70_000, gzip: 13_000 },
    html: { raw: 5_000, gzip: 2_000 },
  },
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
const fileSizes = new Map()
const failures = []

const files = await filesBelow(root)
for (const file of files) {
  const fileName = path.basename(file.pathname)
  const kind = category(fileName)
  if (!kind) continue

  const contents = await readFile(file)
  const raw = (await stat(file)).size
  const gzip = gzipSync(contents).byteLength
  fileSizes.set(fileName, { kind, raw, gzip })
  totals[kind].raw += raw
  totals[kind].gzip += gzip
}

const initial = {
  javascript: { raw: 0, gzip: 0 },
  css: { raw: 0, gzip: 0 },
  html: { raw: 0, gzip: 0 },
}
const indexFile = files.find((file) => path.basename(file.pathname) === 'index.html')
if (!indexFile) throw new Error('dist/index.html is missing.')
const indexContents = await readFile(indexFile, 'utf8')
const initialAssetNames = new Set(
  [...indexContents.matchAll(/(?:src|href)="[^"]*\/([^/"?]+\.(?:js|css))(?:\?[^" ]*)?"/giu)]
    .map((match) => match[1]),
)
for (const assetName of initialAssetNames) {
  const sizes = fileSizes.get(assetName)
  if (!sizes) throw new Error(`Initial asset ${assetName} is missing from dist.`)
  initial[sizes.kind].raw += sizes.raw
  initial[sizes.kind].gzip += sizes.gzip
}
const htmlSizes = fileSizes.get('index.html')
if (htmlSizes) initial.html = { raw: htmlSizes.raw, gzip: htmlSizes.gzip }

function check(scope, sizesByKind) {
  for (const [kind, sizes] of Object.entries(sizesByKind)) {
    const budget = budgets[scope][kind]
    console.log(`${scope} ${kind}: ${kilobytes(sizes.raw)} raw, ${kilobytes(sizes.gzip)} gzip`)
    if (sizes.raw > budget.raw) failures.push(`${scope} ${kind} raw size exceeds ${kilobytes(budget.raw)}`)
    if (sizes.gzip > budget.gzip) failures.push(`${scope} ${kind} gzip size exceeds ${kilobytes(budget.gzip)}`)
  }
}

check('initial', initial)
check('total', totals)

if (failures.length > 0) {
  console.error('\nBundle budget failed:')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exitCode = 1
} else {
  console.log('Bundle budget passed.')
}
