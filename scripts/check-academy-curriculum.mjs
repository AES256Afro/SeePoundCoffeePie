import assert from 'node:assert/strict'
import { existsSync, lstatSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repositoryRoot = fileURLToPath(new URL('../', import.meta.url))

const planningArtifacts = [
  'MILESTONES.md',
  'docs/curriculum/README.md',
  'docs/curriculum/ACADEMY_EXPANSION_BLUEPRINT.md',
  'docs/curriculum/LOCAL_MODELS_LLM_CURRICULUM.md',
  'docs/curriculum/NO_ASSUMED_KNOWLEDGE_STANDARD.md',
  'docs/curriculum/REALITY_VS_FICTION_CURRICULUM.md',
  'docs/curriculum/course-packets/README.md',
  'docs/curriculum/course-packets/MODELS_FROM_ZERO_FIRST_RELEASE.md',
  'docs/curriculum/course-packets/REALITY_CHECKS_FIRST_RELEASE.md',
]

const localModelsPath = 'docs/curriculum/LOCAL_MODELS_LLM_CURRICULUM.md'
const realityCurriculumPath = 'docs/curriculum/REALITY_VS_FICTION_CURRICULUM.md'
const modelsPacketPath = 'docs/curriculum/course-packets/MODELS_FROM_ZERO_FIRST_RELEASE.md'
const realityPacketPath = 'docs/curriculum/course-packets/REALITY_CHECKS_FIRST_RELEASE.md'

const expectedLocalPathCourses = new Map([
  ['LM-100', 6],
  ['LM-200', 5],
  ['LM-300', 6],
  ['LM-400', 5],
  ['LM-500', 5],
  ['LM-600', 4],
  ['LM-700', 6],
  ['LM-800', 6],
  ['LM-900', 4],
  ['LM-1000', 5],
  ['LM-1100', 5],
  ['LM-1200', 5],
  ['LM-1300', 3],
])

const expectedLocalInventory = {
  paths: 13,
  courses: 65,
  coreLabs: 65,
  extensionLabs: 45,
  totalLabs: 110,
  portfolioProjects: 13,
  capstones: 5,
  credentials: 3,
}

const expectedRealityCourseComparisons = new Map([
  ['RVF-100', 6],
  ['RVF-200', 8],
  ['RVF-300', 8],
  ['RVF-400', 8],
  ['RVF-500', 9],
])

const expectedModelsPacketOutlineUnits = new Map([
  [1, 6],
  [2, 7],
  [3, 6],
  [4, 7],
  [5, 8],
  [6, 6],
])

const expectedModelsPacketCourseIds = new Set([
  'LM-101',
  'LM-102',
  'LM-103',
  'LM-104',
  'LM-105',
  'LM-106',
])

const expectedModelsPacketLabIds = new Set([
  'LML-101',
  'LML-102',
  'LML-103',
  'LML-104',
  'LML-105',
  'LML-106',
])

const expectedRealityPacketComparisons = new Map([
  ['PRG-RF', 6],
  ['LNX-RF', 7],
  ['CYB-RF', 7],
  ['NET-RF', 8],
  ['AI-RF', 7],
])

const expectedModelsPacketInventory = {
  courses: 6,
  coreLabs: 6,
  outlineGroups: 6,
  unitOutlines: 40,
  draftChecks: 6,
  deferredCapstones: 1,
  optionalLabs: 1,
}

const expectedRealityPacketInventory = {
  modules: 5,
  comparisons: 35,
}

const forbiddenCharacter = String.fromCodePoint(0x2014)
const fenceCharacter = String.fromCodePoint(96)
const openingFencePattern = new RegExp(
  '^ {0,3}((?:' + fenceCharacter + '){3,}|~{3,})(.*)$',
)
const closingFencePattern = new RegExp(
  '^ {0,3}((?:' + fenceCharacter + '){3,}|~{3,})[ \\t]*$',
)

function lineNumberForIndex(content, index) {
  return content.slice(0, index).split(/\r?\n/u).length
}

function splitPipeRow(line) {
  const trimmed = line.trim()
  if (!trimmed.startsWith('|') || !trimmed.endsWith('|')) return []

  return trimmed
    .slice(1, -1)
    .split('|')
    .map((cell) => cell.trim().replaceAll('**', ''))
}

function sectionBetween(content, startHeading, endHeading) {
  const start = content.indexOf(startHeading)
  if (start < 0) return ''

  const afterStart = start + startHeading.length
  const end = endHeading
    ? content.indexOf(endHeading, afterStart)
    : content.length

  return content.slice(afterStart, end < 0 ? content.length : end)
}

function inspectFences(content) {
  const lines = content.split(/\r?\n/u)
  const outsideFence = []
  let openFence = null
  let pairs = 0

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]

    if (openFence) {
      outsideFence.push(false)
      const closing = line.match(closingFencePattern)
      if (
        closing
        && closing[1][0] === openFence.character
        && closing[1].length >= openFence.length
      ) {
        openFence = null
        pairs += 1
      }
      continue
    }

    const opening = line.match(openingFencePattern)
    if (opening) {
      openFence = {
        character: opening[1][0],
        length: opening[1].length,
        line: index + 1,
      }
      outsideFence.push(false)
      continue
    }

    outsideFence.push(true)
  }

  return { lines, outsideFence, openFence, pairs }
}

function extractInlineLinks(line, lineNumber) {
  const links = []
  const openingPattern = /!?\[[^\]\n]*\]\(/gu
  let match

  while ((match = openingPattern.exec(line)) !== null) {
    let cursor = match.index + match[0].length
    while (cursor < line.length && /[ \t]/u.test(line[cursor])) cursor += 1

    const destinationStart = cursor
    let destination = ''

    if (line[cursor] === '<') {
      cursor += 1
      const valueStart = cursor
      let escaped = false

      while (cursor < line.length) {
        const character = line[cursor]
        if (!escaped && character === '>') break
        escaped = !escaped && character === '\\'
        if (character !== '\\') escaped = false
        cursor += 1
      }

      if (cursor < line.length && line[cursor] === '>') {
        destination = line.slice(valueStart, cursor)
      }
    } else {
      let depth = 0
      let escaped = false

      while (cursor < line.length) {
        const character = line[cursor]
        if (!escaped && character === '(') {
          depth += 1
        } else if (!escaped && character === ')') {
          if (depth === 0) break
          depth -= 1
        } else if (!escaped && depth === 0 && /[ \t]/u.test(character)) {
          break
        }

        if (character === '\\' && !escaped) {
          escaped = true
        } else {
          escaped = false
        }
        cursor += 1
      }

      destination = line.slice(destinationStart, cursor)
    }

    links.push({
      destination,
      line: lineNumber,
      column: destinationStart + 1,
    })

    openingPattern.lastIndex = Math.max(openingPattern.lastIndex, cursor)
  }

  return links
}

function extractMarkdownLinks(content) {
  const fenceInspection = inspectFences(content)
  const links = []

  fenceInspection.lines.forEach((line, index) => {
    if (!fenceInspection.outsideFence[index]) return

    links.push(...extractInlineLinks(line, index + 1))

    const reference = line.match(
      /^ {0,3}\[[^\]]+\]:[ \t]*(?:<([^>]+)>|([^ \t]+))/u,
    )
    if (reference) {
      const destination = reference[1] ?? reference[2] ?? ''
      links.push({
        destination,
        line: index + 1,
        column: line.indexOf(destination) + 1,
      })
    }
  })

  return links
}

function isRelativeMarkdownDestination(destination) {
  if (destination === '') return true
  if (destination.startsWith('#')) return false
  if (destination.startsWith('/')) return false
  if (destination.startsWith('//')) return false
  return !/^[A-Za-z][A-Za-z0-9+.-]*:/u.test(destination)
}

function resolveRelativeMarkdownDestination(sourcePath, destination) {
  const pathOnly = destination.split(/[?#]/u, 1)[0]
  if (pathOnly === '') return null

  let decodedPath
  try {
    decodedPath = decodeURIComponent(pathOnly)
  } catch {
    return { error: 'contains invalid percent encoding' }
  }

  const absolutePath = path.resolve(
    repositoryRoot,
    path.dirname(sourcePath),
    decodedPath,
  )
  const relativeToRepository = path.relative(repositoryRoot, absolutePath)

  if (
    relativeToRepository === '..'
    || relativeToRepository.startsWith('..' + path.sep)
    || path.isAbsolute(relativeToRepository)
  ) {
    return { error: 'escapes the repository' }
  }

  return { absolutePath, relativeToRepository }
}

function canonicalDeclarations(artifactPath, content) {
  const declarations = []
  const lines = content.split(/\r?\n/u)

  lines.forEach((line, index) => {
    let match

    if (artifactPath === localModelsPath) {
      match = line.match(
        /^\|\s*(LM-\d{3,4}):[^|]*\|.*\*\*(LML-\d+)\b/u,
      )
      if (match) {
        declarations.push({
          id: match[1],
          kind: 'course',
          artifactPath,
          line: index + 1,
        })
      }
    }

    if (artifactPath === realityCurriculumPath) {
      match = line.match(/^##\s+(RVF-\d{3}):/u)
      if (match) {
        declarations.push({
          id: match[1],
          kind: 'course',
          artifactPath,
          line: index + 1,
        })
      }

      match = line.match(/^###\s+(RVF-\d{3}):/u)
      if (match) {
        declarations.push({
          id: match[1],
          kind: 'comparison',
          artifactPath,
          line: index + 1,
        })
      }
    }

    if (artifactPath === realityPacketPath) {
      match = line.match(
        /^###\s+((?:PRG|LNX|CYB|NET|AI)-RF-\d{2}):/u,
      )
      if (match) {
        declarations.push({
          id: match[1],
          kind: 'comparison',
          artifactPath,
          line: index + 1,
        })
      }
    }
  })

  return declarations
}

function expectedSequentialIds(prefix, start, count, width) {
  return Array.from({ length: count }, (_, index) => (
    prefix + String(start + index).padStart(width, '0')
  ))
}

function setDifference(left, right) {
  return [...left].filter((value) => !right.has(value)).sort()
}

function compareSets(actual, expected) {
  return {
    missing: setDifference(expected, actual),
    unexpected: setDifference(actual, expected),
  }
}

function localCoursePathId(courseId) {
  const numeric = Number(courseId.slice(3))
  return 'LM-' + String(Math.floor(numeric / 100) * 100)
}

function addCountIssue(issues, artifactPath, label, actual, expected) {
  if (actual === expected) return
  issues.push({
    artifactPath,
    line: 1,
    message: label + ' count drift: expected ' + expected + ', found ' + actual,
  })
}

function addSetIssues(issues, artifactPath, label, actual, expected) {
  const difference = compareSets(actual, expected)
  if (difference.missing.length > 0) {
    issues.push({
      artifactPath,
      line: 1,
      message: label + ' missing: ' + difference.missing.join(', '),
    })
  }
  if (difference.unexpected.length > 0) {
    issues.push({
      artifactPath,
      line: 1,
      message: label + ' unexpected: ' + difference.unexpected.join(', '),
    })
  }
}

function parseLocalModelsInventory(content, issues) {
  const lines = content.split(/\r?\n/u)
  const pathHeadings = new Set()
  const courseDeclarations = []
  const labIds = []

  lines.forEach((line, index) => {
    let match = line.match(/^## Path (LM-\d{3,4}):/u)
    if (match) pathHeadings.add(match[1])

    match = line.match(
      /^\|\s*(LM-\d{3,4}):[^|]*\|.*\*\*(LML-(\d+))\b/u,
    )
    if (!match) return

    courseDeclarations.push({
      id: match[1],
      line: index + 1,
    })
    labIds.push({
      id: match[2],
      line: index + 1,
    })

    if (match[1].slice(3) !== match[3]) {
      issues.push({
        artifactPath: localModelsPath,
        line: index + 1,
        message: 'course ' + match[1] + ' uses mismatched core lab ' + match[2],
      })
    }
  })

  const mapSection = sectionBetween(
    content,
    '## Curriculum map',
    '## Path LM-100:',
  )
  const declaredPathCourses = new Map()
  for (const line of mapSection.split(/\r?\n/u)) {
    const match = line.match(
      /^\|\s*(LM-\d{3,4}):[^|]*\|\s*(\d+)\s*\|/u,
    )
    if (match) declaredPathCourses.set(match[1], Number(match[2]))
  }

  addCountIssue(
    issues,
    localModelsPath,
    'Local Models path heading',
    pathHeadings.size,
    expectedLocalInventory.paths,
  )
  addCountIssue(
    issues,
    localModelsPath,
    'Local Models course',
    courseDeclarations.length,
    expectedLocalInventory.courses,
  )
  addCountIssue(
    issues,
    localModelsPath,
    'Local Models core lab',
    new Set(labIds.map(({ id }) => id)).size,
    expectedLocalInventory.coreLabs,
  )

  addSetIssues(
    issues,
    localModelsPath,
    'Local Models path headings',
    pathHeadings,
    new Set(expectedLocalPathCourses.keys()),
  )
  addSetIssues(
    issues,
    localModelsPath,
    'Local Models curriculum-map paths',
    new Set(declaredPathCourses.keys()),
    new Set(expectedLocalPathCourses.keys()),
  )

  const actualCoursesByPath = new Map()
  for (const { id } of courseDeclarations) {
    const pathId = localCoursePathId(id)
    actualCoursesByPath.set(pathId, (actualCoursesByPath.get(pathId) ?? 0) + 1)
  }

  for (const [pathId, expectedCount] of expectedLocalPathCourses) {
    const declaredCount = declaredPathCourses.get(pathId) ?? 0
    const actualCount = actualCoursesByPath.get(pathId) ?? 0
    addCountIssue(
      issues,
      localModelsPath,
      pathId + ' declared course',
      declaredCount,
      expectedCount,
    )
    addCountIssue(
      issues,
      localModelsPath,
      pathId + ' authored course',
      actualCount,
      expectedCount,
    )
  }

  const expectedCourseIds = new Set()
  for (const [pathId, count] of expectedLocalPathCourses) {
    const base = Number(pathId.slice(3))
    for (const id of expectedSequentialIds('LM-', base + 1, count, String(base).length)) {
      expectedCourseIds.add(id)
    }
  }
  addSetIssues(
    issues,
    localModelsPath,
    'Local Models course IDs',
    new Set(courseDeclarations.map(({ id }) => id)),
    expectedCourseIds,
  )

  const inventorySection = sectionBetween(
    content,
    '## Core guided lab inventory',
    '### Lab package structure',
  )
  let summedCoreLabs = 0
  let summedExtensionLabs = 0
  let declaredTotalCore = null
  let declaredTotalExtensions = null
  let declaredTotalLabs = null

  for (const line of inventorySection.split(/\r?\n/u)) {
    const cells = splitPipeRow(line)
    if (cells.length < 4) continue

    if (cells[0] === 'Total') {
      declaredTotalCore = Number(cells[1])
      declaredTotalExtensions = Number(cells[2])
      const totalMatch = cells[3].match(/^(\d+)\s/u)
      declaredTotalLabs = totalMatch ? Number(totalMatch[1]) : null
      continue
    }

    if (/^\d+$/u.test(cells[1]) && /^\d+$/u.test(cells[2])) {
      summedCoreLabs += Number(cells[1])
      summedExtensionLabs += Number(cells[2])
    }
  }

  addCountIssue(
    issues,
    localModelsPath,
    'Local Models lab-inventory core sum',
    summedCoreLabs,
    expectedLocalInventory.coreLabs,
  )
  addCountIssue(
    issues,
    localModelsPath,
    'Local Models lab-inventory extension sum',
    summedExtensionLabs,
    expectedLocalInventory.extensionLabs,
  )
  addCountIssue(
    issues,
    localModelsPath,
    'Local Models declared core-lab total',
    declaredTotalCore,
    expectedLocalInventory.coreLabs,
  )
  addCountIssue(
    issues,
    localModelsPath,
    'Local Models declared extension-lab total',
    declaredTotalExtensions,
    expectedLocalInventory.extensionLabs,
  )
  addCountIssue(
    issues,
    localModelsPath,
    'Local Models declared full-lab total',
    declaredTotalLabs,
    expectedLocalInventory.totalLabs,
  )
  addCountIssue(
    issues,
    localModelsPath,
    'Local Models calculated full-lab total',
    summedCoreLabs + summedExtensionLabs,
    expectedLocalInventory.totalLabs,
  )

  const portfolioNumbers = lines
    .map((line) => line.match(/^### Portfolio project (\d+):/u))
    .filter(Boolean)
    .map((match) => Number(match[1]))
  addCountIssue(
    issues,
    localModelsPath,
    'Local Models portfolio project',
    portfolioNumbers.length,
    expectedLocalInventory.portfolioProjects,
  )
  addSetIssues(
    issues,
    localModelsPath,
    'Local Models portfolio project numbers',
    new Set(portfolioNumbers.map(String)),
    new Set(expectedSequentialIds('', 1, expectedLocalInventory.portfolioProjects, 1)),
  )

  const capstoneSection = sectionBetween(
    content,
    '### Integrated capstones',
    '## Progress, evidence, assessments, and credentials',
  )
  const capstones = capstoneSection
    .split(/\r?\n/u)
    .filter((line) => /^\d+\.\s+\*\*/u.test(line))
  addCountIssue(
    issues,
    localModelsPath,
    'Local Models integrated capstone',
    capstones.length,
    expectedLocalInventory.capstones,
  )

  const credentialNumbers = lines
    .map((line) => line.match(/^### Applied skill credential (\d+):/u))
    .filter(Boolean)
    .map((match) => Number(match[1]))
  addCountIssue(
    issues,
    localModelsPath,
    'Local Models applied credential',
    credentialNumbers.length,
    expectedLocalInventory.credentials,
  )
  addSetIssues(
    issues,
    localModelsPath,
    'Local Models applied credential numbers',
    new Set(credentialNumbers.map(String)),
    new Set(expectedSequentialIds('', 1, expectedLocalInventory.credentials, 1)),
  )

  const scaleSection = sectionBetween(
    content,
    '## Curriculum scale',
    '## Learning rhythm',
  )
  const scale = new Map()
  for (const line of scaleSection.split(/\r?\n/u)) {
    const cells = splitPipeRow(line)
    if (cells.length === 2) scale.set(cells[0], cells[1])
  }
  const expectedScaleRows = new Map([
    ['Open learning paths', '13'],
    ['Substantial courses', '65'],
    ['Core guided labs', '65, one per course'],
    ['Path portfolio projects', '13'],
    ['Integrated capstones', '5'],
    ['Applied skill credentials', '3'],
  ])
  for (const [label, expectedValue] of expectedScaleRows) {
    const actualValue = scale.get(label)
    if (actualValue !== expectedValue) {
      issues.push({
        artifactPath: localModelsPath,
        line: 1,
        message: 'Local Models scale row "' + label + '" expected "' + expectedValue
          + '", found "' + String(actualValue) + '"',
      })
    }
  }

  return {
    paths: pathHeadings.size,
    courses: courseDeclarations.length,
    coreLabs: new Set(labIds.map(({ id }) => id)).size,
    extensionLabs: summedExtensionLabs,
    totalLabs: summedCoreLabs + summedExtensionLabs,
    portfolioProjects: portfolioNumbers.length,
    capstones: capstones.length,
    credentials: credentialNumbers.length,
  }
}

function parseRealityInventory(content, issues) {
  const lines = content.split(/\r?\n/u)
  const courseHeadings = []
  const comparisonHeadings = []

  lines.forEach((line, index) => {
    let match = line.match(/^##\s+(RVF-\d{3}):/u)
    if (match) courseHeadings.push({ id: match[1], line: index + 1 })

    match = line.match(/^###\s+(RVF-\d{3}):/u)
    if (match) comparisonHeadings.push({ id: match[1], line: index + 1 })
  })

  addCountIssue(
    issues,
    realityCurriculumPath,
    'Reality versus Fiction course',
    courseHeadings.length,
    expectedRealityCourseComparisons.size,
  )
  addCountIssue(
    issues,
    realityCurriculumPath,
    'Reality versus Fiction comparison',
    comparisonHeadings.length,
    [...expectedRealityCourseComparisons.values()]
      .reduce((sum, count) => sum + count, 0),
  )

  const courseMapSection = sectionBetween(
    content,
    '## Course map',
    '### Hierarchy and module stopping points',
  )
  const declaredCourseCounts = new Map()
  for (const line of courseMapSection.split(/\r?\n/u)) {
    const cells = splitPipeRow(line)
    if (
      cells.length === 5
      && /^RVF-\d{3}$/u.test(cells[0])
      && /^\d+$/u.test(cells[2])
    ) {
      declaredCourseCounts.set(cells[0], Number(cells[2]))
    }
  }

  addSetIssues(
    issues,
    realityCurriculumPath,
    'Reality versus Fiction course-map IDs',
    new Set(declaredCourseCounts.keys()),
    new Set(expectedRealityCourseComparisons.keys()),
  )
  addSetIssues(
    issues,
    realityCurriculumPath,
    'Reality versus Fiction course headings',
    new Set(courseHeadings.map(({ id }) => id)),
    new Set(expectedRealityCourseComparisons.keys()),
  )

  const expectedComparisonIds = new Set()
  for (const [courseId, expectedCount] of expectedRealityCourseComparisons) {
    const declaredCount = declaredCourseCounts.get(courseId) ?? 0
    addCountIssue(
      issues,
      realityCurriculumPath,
      courseId + ' declared comparison',
      declaredCount,
      expectedCount,
    )

    const base = Number(courseId.slice(4))
    for (const id of expectedSequentialIds('RVF-', base + 1, expectedCount, 3)) {
      expectedComparisonIds.add(id)
    }
  }

  addSetIssues(
    issues,
    realityCurriculumPath,
    'Reality versus Fiction comparison headings',
    new Set(comparisonHeadings.map(({ id }) => id)),
    expectedComparisonIds,
  )

  const hierarchySection = sectionBetween(
    content,
    '### Hierarchy and module stopping points',
    '## RVF-100:',
  )
  const moduleRows = []
  const referencedComparisons = []

  for (const line of hierarchySection.split(/\r?\n/u)) {
    const cells = splitPipeRow(line)
    if (cells.length !== 3 || !/^RVF-\d{3}$/u.test(cells[0])) continue

    const ids = cells[2].match(/RVF-\d{3}/gu) ?? []
    moduleRows.push({ courseId: cells[0], ids })
    referencedComparisons.push(...ids)

    for (const id of ids) {
      if (id.slice(0, 5) !== cells[0].slice(0, 5)) {
        issues.push({
          artifactPath: realityCurriculumPath,
          line: lineNumberForIndex(content, content.indexOf(line)),
          message: 'hierarchy row for ' + cells[0] + ' contains ' + id,
        })
      }
    }
  }

  addCountIssue(
    issues,
    realityCurriculumPath,
    'Reality versus Fiction hierarchy module',
    moduleRows.length,
    20,
  )
  addCountIssue(
    issues,
    realityCurriculumPath,
    'Reality versus Fiction hierarchy comparison reference',
    referencedComparisons.length,
    expectedComparisonIds.size,
  )
  addSetIssues(
    issues,
    realityCurriculumPath,
    'Reality versus Fiction hierarchy comparison IDs',
    new Set(referencedComparisons),
    expectedComparisonIds,
  )

  const hierarchyReferenceCounts = new Map()
  for (const id of referencedComparisons) {
    hierarchyReferenceCounts.set(id, (hierarchyReferenceCounts.get(id) ?? 0) + 1)
  }
  for (const [id, count] of hierarchyReferenceCounts) {
    if (count !== 1) {
      issues.push({
        artifactPath: realityCurriculumPath,
        line: 1,
        message: 'hierarchy references ' + id + ' ' + count + ' times',
      })
    }
  }

  return {
    courses: courseHeadings.length,
    modules: moduleRows.length,
    comparisons: comparisonHeadings.length,
    byCourse: Object.fromEntries(declaredCourseCounts),
  }
}

function parseModelsPacketInventory(content, issues) {
  const lines = content.split(/\r?\n/u)
  const unitHeadings = []

  lines.forEach((line, index) => {
    const match = line.match(/^### Unit (\d+)\.(\d+):/u)
    if (match) {
      unitHeadings.push({
        id: match[1] + '.' + match[2],
        module: Number(match[1]),
        unit: Number(match[2]),
        line: index + 1,
      })
    }
  })

  const courseMapSection = sectionBetween(
    content,
    '## Canonical LM-100 course map',
    '## Course access and publication boundary',
  )
  const courseIds = new Set()
  const coreLabIds = new Set()
  for (const line of courseMapSection.split(/\r?\n/u)) {
    const courseMatch = line.match(/^\| `?(LM-10[1-6]):/u)
    if (courseMatch) courseIds.add(courseMatch[1])

    const labMatch = line.match(/`(LML-10[1-6])\b/u)
    if (labMatch) coreLabIds.add(labMatch[1])
  }

  addSetIssues(
    issues,
    modelsPacketPath,
    'Models From Zero canonical course IDs',
    courseIds,
    expectedModelsPacketCourseIds,
  )
  addSetIssues(
    issues,
    modelsPacketPath,
    'Models From Zero canonical core lab IDs',
    coreLabIds,
    expectedModelsPacketLabIds,
  )

  const expectedUnitIds = new Set()
  for (const [groupNumber, expectedCount] of expectedModelsPacketOutlineUnits) {
    const actualCount = unitHeadings
      .filter(({ module }) => module === groupNumber)
      .length
    addCountIssue(
      issues,
      modelsPacketPath,
      'Models From Zero working outline group ' + groupNumber + ' unit',
      actualCount,
      expectedCount,
    )

    for (let unitNumber = 1; unitNumber <= expectedCount; unitNumber += 1) {
      expectedUnitIds.add(groupNumber + '.' + unitNumber)
    }
  }

  addSetIssues(
    issues,
    modelsPacketPath,
    'Models From Zero unit headings',
    new Set(unitHeadings.map(({ id }) => id)),
    expectedUnitIds,
  )

  const outlineGroups = new Set(unitHeadings.map(({ module }) => module))
  const draftChecks = lines
    .filter((line) => /^Draft formative check:/u.test(line))
    .length
  const deferredCapstones = lines
    .filter((line) => /^## Deferred appendix C: Phase 26 design capstone\s*$/u.test(line))
    .length
  const optionalLabs = lines
    .filter((line) => /^### Unit \d+\.\d+: Optional first local-model lab\s*$/u.test(line))
    .length

  addCountIssue(
    issues,
    modelsPacketPath,
    'Models From Zero canonical course',
    courseIds.size,
    expectedModelsPacketInventory.courses,
  )
  addCountIssue(
    issues,
    modelsPacketPath,
    'Models From Zero canonical core lab',
    coreLabIds.size,
    expectedModelsPacketInventory.coreLabs,
  )
  addCountIssue(
    issues,
    modelsPacketPath,
    'Models From Zero working outline group',
    outlineGroups.size,
    expectedModelsPacketInventory.outlineGroups,
  )
  addCountIssue(
    issues,
    modelsPacketPath,
    'Models From Zero working unit outline',
    unitHeadings.length,
    expectedModelsPacketInventory.unitOutlines,
  )
  addCountIssue(
    issues,
    modelsPacketPath,
    'Models From Zero draft formative check',
    draftChecks,
    expectedModelsPacketInventory.draftChecks,
  )
  addCountIssue(
    issues,
    modelsPacketPath,
    'Models From Zero deferred capstone',
    deferredCapstones,
    expectedModelsPacketInventory.deferredCapstones,
  )
  addCountIssue(
    issues,
    modelsPacketPath,
    'Models From Zero optional local lab',
    optionalLabs,
    expectedModelsPacketInventory.optionalLabs,
  )

  const inventoryMatch = content.match(
    /body contains (\d+) working unit outlines and (\d+) draft formative checks/u,
  )
  if (!inventoryMatch) {
    issues.push({
      artifactPath: modelsPacketPath,
      line: 1,
      message: 'Models From Zero authoring inventory declaration is missing or malformed',
    })
  } else {
    const declared = inventoryMatch.slice(1).map(Number)
    const expected = [
      expectedModelsPacketInventory.unitOutlines,
      expectedModelsPacketInventory.draftChecks,
    ]
    declared.forEach((value, index) => {
      addCountIssue(
        issues,
        modelsPacketPath,
        'Models From Zero authoring inventory declaration field ' + (index + 1),
        value,
        expected[index],
      )
    })
  }

  return {
    courses: courseIds.size,
    coreLabs: coreLabIds.size,
    outlineGroups: outlineGroups.size,
    unitOutlines: unitHeadings.length,
    draftChecks,
    deferredCapstones,
    optionalLabs,
  }
}

function parseRealityPacketInventory(content, issues) {
  const lines = content.split(/\r?\n/u)
  const moduleHeadings = lines
    .map((line) => line.match(/^## Module (\d+):/u))
    .filter(Boolean)
    .map((match) => Number(match[1]))
  const comparisonIds = lines
    .map((line) => line.match(/^### ((?:PRG|LNX|CYB|NET|AI)-RF-\d{2}):/u))
    .filter(Boolean)
    .map((match) => match[1])

  addCountIssue(
    issues,
    realityPacketPath,
    'Reality Checks packet module',
    moduleHeadings.length,
    expectedRealityPacketInventory.modules,
  )
  addCountIssue(
    issues,
    realityPacketPath,
    'Reality Checks packet comparison',
    comparisonIds.length,
    expectedRealityPacketInventory.comparisons,
  )

  const expectedIds = new Set()
  const byFamily = {}
  for (const [family, count] of expectedRealityPacketComparisons) {
    expectedSequentialIds(family + '-', 1, count, 2)
      .forEach((id) => expectedIds.add(id))
    byFamily[family] = comparisonIds.filter((id) => id.startsWith(family + '-')).length
    addCountIssue(
      issues,
      realityPacketPath,
      'Reality Checks ' + family + ' comparison',
      byFamily[family],
      count,
    )
  }

  addSetIssues(
    issues,
    realityPacketPath,
    'Reality Checks packet comparison IDs',
    new Set(comparisonIds),
    expectedIds,
  )

  return {
    modules: moduleHeadings.length,
    comparisons: comparisonIds.length,
    byFamily,
  }
}

function runSelfChecks() {
  const balancedBackticks = fenceCharacter.repeat(3)
    + 'text\nvalue\n'
    + fenceCharacter.repeat(3)
  const balancedTildes = '~~~~js\nvalue\n~~~~'
  const unbalanced = fenceCharacter.repeat(3) + '\nvalue'

  assert.equal(inspectFences(balancedBackticks).openFence, null)
  assert.equal(inspectFences(balancedBackticks).pairs, 1)
  assert.equal(inspectFences(balancedTildes).openFence, null)
  assert.equal(inspectFences(unbalanced).openFence?.line, 1)

  const links = extractMarkdownLinks(
    '[relative](../guide.md#part) [external](https://example.com/a_(b)) '
      + '[anchor](#part)\n'
      + '[reference]: <folder/file%20name.md>\n'
      + fenceCharacter.repeat(3) + '\n[ignored](missing.md)\n'
      + fenceCharacter.repeat(3),
  )
  assert.deepEqual(
    links.map(({ destination }) => destination),
    ['../guide.md#part', 'https://example.com/a_(b)', '#part', 'folder/file%20name.md'],
  )
  assert.equal(isRelativeMarkdownDestination('../guide.md#part'), true)
  assert.equal(isRelativeMarkdownDestination('https://example.com'), false)
  assert.equal(isRelativeMarkdownDestination('#part'), false)
  assert.deepEqual(splitPipeRow('| RVF-100 | Subject | 6 |'), ['RVF-100', 'Subject', '6'])
  assert.equal(localCoursePathId('LM-1005'), 'LM-1000')
}

runSelfChecks()

const issues = []
const contents = new Map()
let relativeLinkCount = 0
let fencePairCount = 0
const declarations = []

for (const artifactPath of planningArtifacts) {
  const absolutePath = path.join(repositoryRoot, artifactPath)
  if (!existsSync(absolutePath) || !lstatSync(absolutePath).isFile()) {
    issues.push({
      artifactPath,
      line: 1,
      message: 'required planning artifact is missing',
    })
    continue
  }

  const content = readFileSync(absolutePath, 'utf8')
  contents.set(artifactPath, content)

  let forbiddenIndex = content.indexOf(forbiddenCharacter)
  while (forbiddenIndex >= 0) {
    issues.push({
      artifactPath,
      line: lineNumberForIndex(content, forbiddenIndex),
      message: 'contains forbidden U+2014',
    })
    forbiddenIndex = content.indexOf(forbiddenCharacter, forbiddenIndex + 1)
  }

  const fenceInspection = inspectFences(content)
  fencePairCount += fenceInspection.pairs
  if (fenceInspection.openFence) {
    issues.push({
      artifactPath,
      line: fenceInspection.openFence.line,
      message: 'has an unclosed Markdown fence',
    })
  }

  for (const link of extractMarkdownLinks(content)) {
    if (!isRelativeMarkdownDestination(link.destination)) continue
    relativeLinkCount += 1

    if (link.destination === '') {
      issues.push({
        artifactPath,
        line: link.line,
        message: 'has an empty relative Markdown link destination',
      })
      continue
    }

    const resolved = resolveRelativeMarkdownDestination(
      artifactPath,
      link.destination,
    )
    if (!resolved) continue
    if (resolved.error) {
      issues.push({
        artifactPath,
        line: link.line,
        message: 'relative Markdown link "' + link.destination + '" '
          + resolved.error,
      })
      continue
    }

    if (!existsSync(resolved.absolutePath)) {
      issues.push({
        artifactPath,
        line: link.line,
        message: 'broken relative Markdown link "' + link.destination
          + '" resolves to missing "' + resolved.relativeToRepository + '"',
      })
    }
  }

  declarations.push(...canonicalDeclarations(artifactPath, content))
}

const declarationsById = new Map()
for (const declaration of declarations) {
  const previous = declarationsById.get(declaration.id) ?? []
  previous.push(declaration)
  declarationsById.set(declaration.id, previous)
}
for (const [id, matchingDeclarations] of declarationsById) {
  if (matchingDeclarations.length < 2) continue
  const locations = matchingDeclarations
    .map(({ artifactPath, line }) => artifactPath + ':' + line)
    .join(', ')
  issues.push({
    artifactPath: matchingDeclarations[0].artifactPath,
    line: matchingDeclarations[0].line,
    message: 'duplicate canonical ID ' + id + ' at ' + locations,
  })
}

const localModels = contents.has(localModelsPath)
  ? parseLocalModelsInventory(contents.get(localModelsPath), issues)
  : null
const realityCurriculum = contents.has(realityCurriculumPath)
  ? parseRealityInventory(contents.get(realityCurriculumPath), issues)
  : null
const modelsPacket = contents.has(modelsPacketPath)
  ? parseModelsPacketInventory(contents.get(modelsPacketPath), issues)
  : null
const realityPacket = contents.has(realityPacketPath)
  ? parseRealityPacketInventory(contents.get(realityPacketPath), issues)
  : null

issues.sort((left, right) => (
  left.artifactPath.localeCompare(right.artifactPath)
  || left.line - right.line
  || left.message.localeCompare(right.message)
))

if (issues.length > 0) {
  console.error(
    'Academy curriculum validation failed with '
      + issues.length
      + ' issue(s):\n'
      + issues
        .map(({ artifactPath, line, message }) => (
          '- ' + artifactPath + ':' + line + ': ' + message
        ))
        .join('\n'),
  )
  process.exitCode = 1
} else {
  console.log('Academy curriculum validation passed.')
  console.log(
    '- planning artifacts: ' + planningArtifacts.length
      + '; relative Markdown links: ' + relativeLinkCount
      + '; balanced fence pairs: ' + fencePairCount,
  )
  console.log(
    '- Local Models: ' + localModels.paths + ' paths, '
      + localModels.courses + ' courses, '
      + localModels.coreLabs + ' core labs, '
      + localModels.extensionLabs + ' extension labs, '
      + localModels.totalLabs + ' total labs, '
      + localModels.portfolioProjects + ' portfolio projects, '
      + localModels.capstones + ' capstones, '
      + localModels.credentials + ' credentials.',
  )
  console.log(
    '- Reality versus Fiction: ' + realityCurriculum.courses + ' courses, '
      + realityCurriculum.modules + ' modules, '
      + realityCurriculum.comparisons + ' comparisons '
      + '(6, 8, 8, 8, 9).',
  )
  console.log(
    '- Models From Zero packet: ' + modelsPacket.courses + ' canonical courses, '
      + modelsPacket.coreLabs + ' canonical L0 core labs, '
      + modelsPacket.outlineGroups + ' working outline groups, '
      + modelsPacket.unitOutlines + ' working unit outlines, '
      + modelsPacket.draftChecks + ' draft formative checks, '
      + modelsPacket.deferredCapstones + ' deferred capstone, '
      + modelsPacket.optionalLabs + ' optional local lab.',
  )
  console.log(
    '- Reality Checks packet: ' + realityPacket.modules + ' modules, '
      + realityPacket.comparisons + ' comparisons '
      + '(6 programming, 7 Linux, 7 cybersecurity, 8 networking, 7 AI).',
  )
  console.log(
    '- canonical declarations: ' + declarations.length
      + '; duplicate canonical IDs: 0; forbidden U+2014: 0.',
  )
}
