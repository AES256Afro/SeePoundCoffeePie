import { readdir, readFile, stat } from 'node:fs/promises'
import { gzipSync } from 'node:zlib'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import {
  assetHasExpectedPlacement,
  assetNamesContainingAllMarkers,
  assetNamesReferencedByHtml,
  headroomFraction,
  REQUIRED_INITIAL_HEADROOM,
} from './bundle-release-guards.mjs'

function selectedBundleOptions(arguments_) {
  if (arguments_.length === 0) {
    return { profile: 'production', root: new URL('../dist/', import.meta.url) }
  }
  const values = new Map()
  for (let index = 0; index < arguments_.length; index += 2) {
    const option = arguments_[index]
    const value = arguments_[index + 1]
    if (!option?.startsWith('--') || !value || values.has(option)) {
      throw new Error(
        'Usage: node scripts/check-bundle-size.mjs '
        + '[--root <built-site-directory>] [--profile production|practical-cpp-candidate]',
      )
    }
    values.set(option, value)
  }
  if ([...values.keys()].some((option) => option !== '--root' && option !== '--profile')) {
    throw new Error('The bundle checker received an unknown option.')
  }
  const profile = values.get('--profile') ?? 'production'
  if (profile !== 'production' && profile !== 'practical-cpp-candidate') {
    throw new Error(`Unknown bundle profile: ${profile}.`)
  }
  const directory = path.resolve(values.get('--root') ?? 'dist')
  return {
    profile,
    root: pathToFileURL(directory.endsWith(path.sep) ? directory : `${directory}${path.sep}`),
  }
}

const { profile: bundleProfile, root } = selectedBundleOptions(process.argv.slice(2))
const budgets = {
  // The first-load budget stays tight. Route-loaded teaching content gets a separate total cap.
  initial: {
    javascript: { raw: 485_000, gzip: 132_000 },
    // The initial stylesheet owns the shared shell, course catalog, continuing
    // course overview, and portfolio presentation. Lesson and project workspace
    // styles remain behind their lazy route boundary.
    css: { raw: 72_500, gzip: 13_500 },
    html: { raw: 5_000, gzip: 2_000 },
  },
  total: {
    // Phase 5A adds one reviewed 30-lesson course, its route shell, and a
    // separately loaded Codebook. The first-load limits above do not move.
    // Each new lazy boundary also receives an exact asset cap below.
    javascript: { raw: 765_000, gzip: 218_000 },
    css: { raw: 87_000, gzip: 17_500 },
    html: { raw: 5_000, gzip: 2_000 },
    // Reviewed, inert teaching payloads may leave executable JavaScript only
    // when they remain separately visible in transfer accounting.
    teachingData: { raw: 54_000, gzip: 15_000 },
  },
}

// This is the explicit sum of the reviewed total JavaScript, CSS, HTML, and
// teaching-data limits above. Keep the category caps and aggregate cap aligned
// so moving bytes between file types cannot make transferred bytes disappear.
const aggregateTransferBudget = { raw: 911_000, gzip: 252_500 }
const summedCategoryBudget = Object.values(budgets.total).reduce(
  (sum, budget) => ({
    raw: sum.raw + budget.raw,
    gzip: sum.gzip + budget.gzip,
  }),
  { raw: 0, gzip: 0 },
)
if (
  aggregateTransferBudget.raw !== summedCategoryBudget.raw
  || aggregateTransferBudget.gzip !== summedCategoryBudget.gzip
) {
  throw new Error('The aggregate transfer budget must equal the reviewed total category caps.')
}

const reviewedAssetBudgets = [
  {
    label: 'portfolio route javascript',
    pattern: /^PortfolioPage-.*\.js$/u,
    raw: 15_000,
    gzip: 6_000,
  },
  {
    label: 'practical python route javascript',
    pattern: /^PythonDataToolsRoute-.*\.js$/u,
    raw: 11_000,
    gzip: 4_000,
  },
  {
    label: 'practical python teaching content',
    pattern: /^python-data-tools-course-.*\.js$/u,
    raw: 50_000,
    gzip: 14_000,
  },
  {
    label: 'codebook route javascript',
    pattern: /^CodebookRoute-.*\.js$/u,
    // The unpublished candidate's already-reviewed ceiling includes its C++
    // examples. The ordinary production build keeps the tighter Phase 5A cap.
    raw: bundleProfile === 'practical-cpp-candidate' ? 38_000 : 30_000,
    gzip: bundleProfile === 'practical-cpp-candidate' ? 12_000 : 10_000,
  },
  {
    label: 'foundation teaching content',
    pattern: /^foundation-curriculum-packed\.generated-[A-Za-z0-9_-]{6,}\.js$/u,
    raw: 120_000,
    gzip: 30_000,
  },
  {
    label: 'combined initial application css',
    extension: 'css',
    markers: [
      '.workshop-topbar',
      '.portfolio-hero__identity',
      '.course-hero--continuing',
    ],
    placement: 'initial',
    raw: 56_000,
    gzip: 10_750,
  },
  {
    label: 'combined learning workspace css',
    extension: 'css',
    markers: [
      '.lesson-header',
      '.project-run-report__guidance',
    ],
    placement: 'lazy',
    raw: 32_000,
    gzip: 6_500,
  },
]

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
  if (fileName.endsWith('.json')) return 'teachingData'
  return null
}

function categoryLabel(kind) {
  return kind === 'teachingData' ? 'teaching data' : kind
}

function kilobytes(bytes) {
  return `${(bytes / 1_000).toFixed(2)} kB`
}

function percentage(value) {
  return `${(value * 100).toFixed(2)}%`
}

const totals = {
  javascript: { raw: 0, gzip: 0 },
  css: { raw: 0, gzip: 0 },
  html: { raw: 0, gzip: 0 },
  teachingData: { raw: 0, gzip: 0 },
}
const fileSizes = new Map()
const fileContents = new Map()
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
  fileContents.set(fileName, contents)
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
const initialAssetNames = new Set([
  ...assetNamesReferencedByHtml(indexContents, 'js'),
  ...assetNamesReferencedByHtml(indexContents, 'css'),
])
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
    const label = categoryLabel(kind)
    const rawHeadroom = headroomFraction(sizes.raw, budget.raw)
    const gzipHeadroom = headroomFraction(sizes.gzip, budget.gzip)
    console.log(
      `${scope} ${label}: ${kilobytes(sizes.raw)} raw (${percentage(rawHeadroom)} headroom), `
      + `${kilobytes(sizes.gzip)} gzip (${percentage(gzipHeadroom)} headroom)`,
    )
    if (sizes.raw > budget.raw) failures.push(`${scope} ${label} raw size exceeds ${kilobytes(budget.raw)}`)
    if (sizes.gzip > budget.gzip) failures.push(`${scope} ${label} gzip size exceeds ${kilobytes(budget.gzip)}`)
    if (scope === 'initial' && (kind === 'javascript' || kind === 'css')) {
      if (rawHeadroom < REQUIRED_INITIAL_HEADROOM) {
        failures.push(
          `${scope} ${kind} raw headroom is ${percentage(rawHeadroom)}; `
          + `at least ${percentage(REQUIRED_INITIAL_HEADROOM)} is required`,
        )
      }
      if (gzipHeadroom < REQUIRED_INITIAL_HEADROOM) {
        failures.push(
          `${scope} ${kind} gzip headroom is ${percentage(gzipHeadroom)}; `
          + `at least ${percentage(REQUIRED_INITIAL_HEADROOM)} is required`,
        )
      }
    }
  }
}

check('initial', initial)
check('total', totals)

const aggregateTransfer = Object.values(totals).reduce(
  (sum, sizes) => ({
    raw: sum.raw + sizes.raw,
    gzip: sum.gzip + sizes.gzip,
  }),
  { raw: 0, gzip: 0 },
)
const aggregateRawHeadroom = headroomFraction(aggregateTransfer.raw, aggregateTransferBudget.raw)
const aggregateGzipHeadroom = headroomFraction(aggregateTransfer.gzip, aggregateTransferBudget.gzip)
console.log(
  `aggregate total transfer: ${kilobytes(aggregateTransfer.raw)} raw `
  + `(${percentage(aggregateRawHeadroom)} headroom), ${kilobytes(aggregateTransfer.gzip)} gzip `
  + `(${percentage(aggregateGzipHeadroom)} headroom)`,
)
if (aggregateTransfer.raw > aggregateTransferBudget.raw) {
  failures.push(`aggregate total transfer raw size exceeds ${kilobytes(aggregateTransferBudget.raw)}`)
}
if (aggregateTransfer.gzip > aggregateTransferBudget.gzip) {
  failures.push(`aggregate total transfer gzip size exceeds ${kilobytes(aggregateTransferBudget.gzip)}`)
}

for (const budget of reviewedAssetBudgets) {
  const matchingNames = budget.pattern
    ? [...fileSizes.keys()].filter((fileName) => budget.pattern.test(fileName))
    : assetNamesContainingAllMarkers(fileContents, budget.markers, budget.extension)
  const matches = matchingNames.map((fileName) => [fileName, fileSizes.get(fileName)])
  const placement = budget.placement ?? 'lazy'
  if (matches.length !== 1) {
    failures.push(`${budget.label} must be emitted as exactly one ${placement} asset`)
    continue
  }
  const [fileName, sizes] = matches[0]
  console.log(`${budget.label}: ${kilobytes(sizes.raw)} raw, ${kilobytes(sizes.gzip)} gzip`)
  if (!assetHasExpectedPlacement(fileName, initialAssetNames, placement)) {
    failures.push(
      placement === 'initial'
        ? `${budget.label} must be part of the initial asset graph`
        : `${budget.label} must not be part of the initial asset graph`,
    )
  }
  if (sizes.raw > budget.raw) failures.push(`${budget.label} raw size exceeds ${kilobytes(budget.raw)}`)
  if (sizes.gzip > budget.gzip) failures.push(`${budget.label} gzip size exceeds ${kilobytes(budget.gzip)}`)
}

if (failures.length > 0) {
  console.error('\nBundle budget failed:')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exitCode = 1
} else {
  console.log('Bundle budget passed.')
}
