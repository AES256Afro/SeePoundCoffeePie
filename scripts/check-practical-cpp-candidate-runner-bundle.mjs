import { execFileSync } from 'node:child_process'
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  controlledPublicationSources,
  productionControlledPublicationSources,
} from './controlled-course-publication.mjs'
import { buildWranglerDeployArgs } from './deploy-public-site.mjs'

const projectRoot = fileURLToPath(new URL('../', import.meta.url))
const wranglerPath = fileURLToPath(new URL('../node_modules/.bin/wrangler', import.meta.url))
const candidateSource = controlledPublicationSources('published').runnerAssignments
const defaultSource = productionControlledPublicationSources.runnerAssignments
const protectedCandidateMarker = 'workshop-stock-report-visible'
const requiredCandidateModules = Object.freeze([
  'src/data/cpp-collections-records-course-draft.ts',
  'src/data/cpp-collections-records-runner-publication.ts',
  'src/data/cpp-collections-records.server.ts',
])

function bundleSources(mapPath) {
  const sourceMap = JSON.parse(readFileSync(mapPath, 'utf8'))
  if (!Array.isArray(sourceMap.sources)) {
    throw new Error('Wrangler emitted an unreadable Worker source map.')
  }
  return sourceMap.sources.map((source) => source.replaceAll('\\', '/'))
}

function hasModule(sources, modulePath) {
  return sources.some((source) => source.endsWith(`/${modulePath}`))
}

function dryRunWorker(root, label, runnerPublicationSource, assetsDirectory) {
  const outdir = path.join(root, label)
  mkdirSync(outdir)
  const args = [
    ...buildWranglerDeployArgs('production', {
      dryRun: true,
      runnerPublicationSource,
    }),
    '--assets',
    assetsDirectory,
    '--outdir',
    outdir,
  ]
  const output = execFileSync(wranglerPath, args, {
    cwd: projectRoot,
    encoding: 'utf8',
    env: {
      ...process.env,
      CLOUDFLARE_API_TOKEN: 'intentionally-invalid-candidate-runner-dry-run',
      WRANGLER_DOCKER_BIN: '/bin/false',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  if (!output.includes('--dry-run: exiting now.')) {
    throw new Error(`The ${label} Worker graph did not complete its Wrangler dry run.`)
  }
  return {
    bundle: readFileSync(path.join(outdir, 'worker.js'), 'utf8'),
    sources: bundleSources(path.join(outdir, 'worker.js.map')),
  }
}

export function checkPracticalCppCandidateRunnerBundle() {
  if (defaultSource !== 'src/data/runner-publication.base.ts') {
    throw new Error('The checked-in production runner publication is no longer fail-closed.')
  }
  if (candidateSource !== 'src/data/runner-publication.with-cpp.ts') {
    throw new Error('The reviewed Practical C++ runner candidate source is missing.')
  }

  const temporaryRoot = mkdtempSync(path.join(tmpdir(), 'seepound-cpp-runner-candidate-'))
  const assetsDirectory = path.join(temporaryRoot, 'assets')
  mkdirSync(assetsDirectory)
  writeFileSync(path.join(assetsDirectory, 'index.html'), '<!doctype html><title>Runner build check</title>\n')

  try {
    const defaultBuild = dryRunWorker(
      temporaryRoot,
      'default',
      defaultSource,
      assetsDirectory,
    )
    const candidateBuild = dryRunWorker(
      temporaryRoot,
      'candidate',
      candidateSource,
      assetsDirectory,
    )

    if (defaultBuild.bundle.includes(protectedCandidateMarker)) {
      throw new Error('The default Worker contains the unpublished Practical C++ assessment.')
    }
    for (const modulePath of requiredCandidateModules) {
      if (hasModule(defaultBuild.sources, modulePath)) {
        throw new Error(`The default Worker loaded unpublished runner module ${modulePath}.`)
      }
      if (!hasModule(candidateBuild.sources, modulePath)) {
        throw new Error(`The candidate Worker did not load reviewed runner module ${modulePath}.`)
      }
    }
    if (!candidateBuild.bundle.includes(protectedCandidateMarker)) {
      throw new Error('The candidate Worker is missing its protected Practical C++ assessment.')
    }

    console.log(
      'Practical C++ runner candidate passed a pinned Wrangler dry run while the default Worker remained unpublished.',
    )
  } finally {
    rmSync(temporaryRoot, { force: true, recursive: true })
  }
}

checkPracticalCppCandidateRunnerBundle()
