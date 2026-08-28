import { spawn } from 'node:child_process'
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { build } from 'vite'

import { assetNamesReferencedByHtml } from './bundle-release-guards.mjs'
import {
  inspectPracticalCppCandidateAssets,
  practicalCppServerOwnedMarkers,
} from './practical-cpp-candidate-app-guards.mjs'
import {
  controlledPublicationAppSelection,
} from './controlled-publication-selector.mjs'
import {
  inspectPracticalCppCandidateSitemap,
} from './practical-cpp-candidate-sitemap.mjs'
import {
  practicalCppCandidatePublication,
} from './practical-cpp-candidate-publication.mjs'
import {
  practicalCppPrivateJavaScriptMarkers,
} from './unpublished-cpp-release-boundary.mjs'

const projectRoot = fileURLToPath(new URL('../', import.meta.url))
const candidateBuildRoot = path.join(
  projectRoot,
  '.vite',
  'practical-cpp-candidate-app',
)
const candidateDataPath = path.join(
  projectRoot,
  'src/data/cpp-collections-records-course-packed.generated.json',
)
const candidateServerAssessmentPath = path.join(
  projectRoot,
  'src/data/cpp-collections-records.server.ts',
)
const candidateConfigPath = path.join(
  projectRoot,
  'scripts/practical-cpp-candidate.vite.config.mjs',
)
const existingBundleGatePath = path.join(projectRoot, 'scripts/check-bundle-size.mjs')
const publicSitemapPath = path.join(projectRoot, 'public/sitemap.xml')
const candidateAppSelection = controlledPublicationAppSelection(
  practicalCppCandidatePublication.sources,
)

const catalogServerOwnedCandidateMarkers = Object.freeze(
  practicalCppPrivateJavaScriptMarkers.map(({ value }) => value),
)

async function serverOwnedCandidateMarkers() {
  const source = await readFile(candidateServerAssessmentPath, 'utf8')
  return practicalCppServerOwnedMarkers({
    catalogMarkers: catalogServerOwnedCandidateMarkers,
    serverAssessmentSource: source,
  })
}

async function filesBelow(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const location = path.join(directory, entry.name)
    if (entry.isDirectory()) files.push(...await filesBelow(location))
    else files.push(location)
  }
  return files
}

function normalizedBuildOutput(result) {
  if (Array.isArray(result)) {
    throw new Error('The complete Practical C++ candidate app emitted an unexpected multi-build result.')
  }
  if (!result || !('output' in result)) {
    throw new Error('The complete Practical C++ candidate app did not return a finished build.')
  }
  return result
}

function assertCompleteCandidateModuleGraph(result) {
  const moduleIds = new Set(result.output.flatMap((output) => (
    output.type === 'chunk' ? Object.keys(output.modules).map((id) => id.split('?', 1)[0]) : []
  )))
  const requiredModulePaths = [
    path.join(projectRoot, 'src/main.tsx'),
    path.join(projectRoot, 'src/App.tsx'),
    candidateAppSelection.continuingCourses.selected,
    candidateAppSelection.codebookContributions.selected,
    path.join(projectRoot, 'src/data/cpp-collections-records-course-packed.ts'),
  ]
  for (const requiredModulePath of requiredModulePaths) {
    if (!moduleIds.has(requiredModulePath)) {
      throw new Error(
        `The complete Practical C++ candidate app is missing ${path.relative(projectRoot, requiredModulePath)}.`,
      )
    }
  }

  for (const { selector } of Object.values(candidateAppSelection)) {
    if (moduleIds.has(selector)) {
      throw new Error(
        `The candidate build loaded its default selector instead of replacing ${path.relative(projectRoot, selector)}.`,
      )
    }
  }

  const forbiddenModulePaths = [
    path.join(projectRoot, 'src/data/cpp-collections-records.server.ts'),
    path.join(projectRoot, 'src/data/cpp-collections-records-runner-publication.ts'),
    path.join(projectRoot, 'src/runner-coordinator.ts'),
  ]
  for (const forbiddenModulePath of forbiddenModulePaths) {
    if (moduleIds.has(forbiddenModulePath)) {
      throw new Error(
        `Private server module ${path.relative(projectRoot, forbiddenModulePath)} entered the candidate browser graph.`,
      )
    }
  }
}

async function runExistingBundleGate() {
  await new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      [
        existingBundleGatePath,
        '--root',
        candidateBuildRoot,
        '--profile',
        'practical-cpp-candidate',
      ],
      { cwd: projectRoot, stdio: 'inherit' },
    )
    child.once('error', reject)
    child.once('exit', (code, signal) => {
      if (code === 0) resolve()
      else reject(new Error(
        signal
          ? `The complete Practical C++ candidate bundle gate stopped after signal ${signal}.`
          : `The complete Practical C++ candidate bundle gate exited with code ${code}.`,
      ))
    })
  })
}

export async function checkPracticalCppCandidateAppBundle() {
  if (catalogServerOwnedCandidateMarkers.length !== 4) {
    throw new Error('The Practical C++ private marker catalog is incomplete for a candidate app build.')
  }
  const privateMarkers = await serverOwnedCandidateMarkers()
  const publicSitemapBeforeBuild = await readFile(publicSitemapPath)

  const result = normalizedBuildOutput(await build({
    configFile: candidateConfigPath,
    root: projectRoot,
    logLevel: 'silent',
    build: {
      emptyOutDir: true,
      outDir: candidateBuildRoot,
      write: true,
    },
  }))
  assertCompleteCandidateModuleGraph(result)
  const publicSitemapAfterBuild = await readFile(publicSitemapPath)
  if (!publicSitemapAfterBuild.equals(publicSitemapBeforeBuild)) {
    throw new Error('The candidate build changed public/sitemap.xml.')
  }

  const files = await filesBelow(candidateBuildRoot)
  const assets = new Map(await Promise.all(files.map(async (file) => [
    path.relative(candidateBuildRoot, file).split(path.sep).join('/'),
    await readFile(file),
  ])))
  const index = assets.get('index.html')
  if (!index) throw new Error('The complete Practical C++ candidate app is missing index.html.')
  const indexText = index.toString('utf8')
  const initialAssetNames = new Set([
    ...assetNamesReferencedByHtml(indexText, 'js'),
    ...assetNamesReferencedByHtml(indexText, 'css'),
  ])
  const evidence = inspectPracticalCppCandidateAssets({
    assets,
    authoredTeachingData: await readFile(candidateDataPath),
    initialAssetNames,
    privateMarkers,
  })
  const candidateSitemap = assets.get('sitemap.xml')?.toString('utf8')
  if (!candidateSitemap) {
    throw new Error('The complete Practical C++ candidate app is missing sitemap.xml.')
  }
  const sitemapEvidence = inspectPracticalCppCandidateSitemap(candidateSitemap)

  await runExistingBundleGate()
  console.log(
    `Complete Practical C++ candidate app passed with ${evidence.candidateTeachingAssetName} `
    + `behind ${evidence.owningJavaScriptAssetName}; all ${privateMarkers.length} reviewed `
    + `server-owned markers were absent; the unchanged public sitemap was projected to `
    + `${sitemapEvidence.lessonCount} canonical candidate lessons.`,
  )
  return Object.freeze({ ...evidence, sitemap: sitemapEvidence })
}

if (path.resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) {
  await checkPracticalCppCandidateAppBundle()
}
