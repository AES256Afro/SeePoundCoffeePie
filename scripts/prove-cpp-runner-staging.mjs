import { execFileSync } from 'node:child_process'
import { resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

import {
  cppRunnerReleaseMetadata,
  readActiveDeploymentVersion,
  readContainerSnapshot,
  safeCommandOutput,
  verifiedReleaseCommit,
  verifyVersionMetadata,
} from './deploy-cpp-runner.mjs'
import { deploymentEnvironments } from './deploy-public-site.mjs'
import {
  CPP_STAGING_REGRESSION_CHECKS,
  cppStagingRegressionProofPath,
  createCppStagingRegressionProof,
  invalidateCppStagingRegressionProof,
  writeCppStagingRegressionProof,
} from './cpp-runner-staging-proof.mjs'
import { assertReviewedRunnerStatus } from './runner-deployment-checks.mjs'

const projectRoot = fileURLToPath(new URL('../', import.meta.url))
const wranglerPath = fileURLToPath(new URL('../node_modules/.bin/wrangler', import.meta.url))
const commitPattern = /^[0-9a-f]{40}$/u

function sameRecord(left, right) {
  return JSON.stringify(left) === JSON.stringify(right)
}

export function parseCppStagingRegressionArgs(argv) {
  if (argv.length !== 0) {
    throw new Error('The staging regression proof command does not accept options or alternate environments.')
  }
  return { environmentName: 'staging' }
}

export function parseSuccessfulExactCommitCi(raw, commit) {
  if (!commitPattern.test(commit)) {
    throw new Error('Hosted CI verification requires the exact 40-character commit SHA.')
  }
  let runs
  try {
    runs = JSON.parse(raw)
  } catch {
    throw new Error('GitHub returned unreadable hosted CI status JSON.')
  }
  if (!Array.isArray(runs)) {
    throw new Error('GitHub did not return a hosted CI run list.')
  }
  const successful = runs.filter((run) => (
    run
    && typeof run === 'object'
    && run.workflowName === 'CI'
    && run.event === 'push'
    && run.status === 'completed'
    && run.conclusion === 'success'
    && run.headSha === commit
    && Number.isSafeInteger(run.databaseId)
    && run.databaseId > 0
  )).sort((left, right) => right.databaseId - left.databaseId)
  if (successful.length === 0) {
    throw new Error('The exact release commit does not have a successful completed CI push run.')
  }
  return {
    conclusion: 'success',
    event: 'push',
    headSha: commit,
    runId: successful[0].databaseId,
    status: 'completed',
    workflow: 'CI',
  }
}

export function verifyHostedCi(commit, run = safeCommandOutput) {
  const raw = run('gh', [
    'run',
    'list',
    '--workflow',
    'ci.yml',
    '--branch',
    'main',
    '--commit',
    commit,
    '--event',
    'push',
    '--status',
    'success',
    '--limit',
    '20',
    '--json',
    'databaseId,headSha,status,conclusion,event,workflowName',
  ])
  return parseSuccessfulExactCommitCi(raw, commit)
}

export function stagingRunnerKvPutArgs(enabled) {
  if (typeof enabled !== 'boolean') {
    throw new Error('The staging runner window requires one exact Boolean state.')
  }
  return [
    'kv',
    'key',
    'put',
    'enabled',
    String(enabled),
    '--binding',
    'RUNNER_CONFIG',
    '--remote',
    '--config',
    deploymentEnvironments.staging.config,
  ]
}

function stagingRunnerKvGetArgs() {
  return [
    'kv',
    'key',
    'get',
    'enabled',
    '--binding',
    'RUNNER_CONFIG',
    '--remote',
    '--config',
    deploymentEnvironments.staging.config,
  ]
}

export function setStagingRunnerEnabled(enabled) {
  safeCommandOutput(wranglerPath, stagingRunnerKvPutArgs(enabled))
}

export async function requireStagingRunnerState(enabled, {
  attempts = 30,
  fetchImpl = fetch,
  sleep = (milliseconds) => new Promise((resolvePromise) => setTimeout(resolvePromise, milliseconds)),
} = {}) {
  const expectedValue = String(enabled)
  const actualValue = safeCommandOutput(wranglerPath, stagingRunnerKvGetArgs())
  if (actualValue !== expectedValue) {
    throw new Error(`Staging RUNNER_CONFIG.enabled is not exactly ${expectedValue}.`)
  }

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetchImpl(
        new URL('/api/runner/status', deploymentEnvironments.staging.origin),
        { redirect: 'manual', signal: AbortSignal.timeout(10_000) },
      )
      const body = await response.json()
      assertReviewedRunnerStatus({
        body,
        httpStatus: response.status,
        label: 'staging',
        requireEnabled: enabled,
      })
      const confirmedValue = safeCommandOutput(wranglerPath, stagingRunnerKvGetArgs())
      if (confirmedValue !== expectedValue) {
        throw new Error(`Staging RUNNER_CONFIG.enabled changed while proving ${expectedValue}.`)
      }
      return
    } catch {
      if (attempt < attempts) await sleep(1_000)
    }
  }
  throw new Error(`The public staging runner endpoint did not become ${enabled ? 'enabled' : 'paused'}.`)
}

export function runStagingRegressionCheck(command, run = execFileSync) {
  const match = /^npm run (?<script>[a-z0-9:-]+)$/u.exec(command)
  if (!match?.groups?.script || !CPP_STAGING_REGRESSION_CHECKS.includes(command)) {
    throw new Error('The staging regression proof attempted an unreviewed command.')
  }
  try {
    run('npm', ['run', match.groups.script], {
      cwd: projectRoot,
      stdio: 'inherit',
    })
  } catch {
    throw new Error(`The reviewed staging regression command failed: ${command}`)
  }
}

export function assertStagingReleaseUnchanged({
  baselineContainers,
  baselineWorkerVersion,
  currentContainers,
  currentWorkerVersion,
}) {
  if (currentWorkerVersion !== baselineWorkerVersion) {
    throw new Error('The active staging Worker changed during the recorded regression run.')
  }
  if (!sameRecord(currentContainers, baselineContainers)) {
    throw new Error('The complete staging runner snapshot changed during the recorded regression run.')
  }
}

function isTransientContainerReadinessError(error) {
  return error instanceof Error
    && /^Runner application [a-z0-9-]+ is (?:active|provisioning), not ready\.$/u.test(error.message)
}

export async function waitForStableStagingRelease({
  baselineContainers,
  baselineWorkerVersion,
  metadata,
}, {
  attempts = 60,
  readActiveDeploymentVersion: readWorkerVersion,
  readContainerSnapshot: readContainers,
  requiredSamples = 2,
  sleep,
  verifyVersionMetadata: verifyMetadata,
}) {
  if (
    !Number.isSafeInteger(attempts)
    || attempts < 1
    || !Number.isSafeInteger(requiredSamples)
    || requiredSamples < 1
    || requiredSamples > attempts
  ) {
    throw new Error('The staging readiness wait needs valid attempt and sample counts.')
  }

  let stableSamples = 0
  let lastReadinessError
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const currentWorkerVersion = readWorkerVersion('staging')
    if (currentWorkerVersion !== baselineWorkerVersion) {
      throw new Error('The active staging Worker changed during the recorded regression run.')
    }
    verifyMetadata('staging', currentWorkerVersion, metadata)
    try {
      const currentContainers = readContainers('staging')
      assertStagingReleaseUnchanged({
        baselineContainers,
        baselineWorkerVersion,
        currentContainers,
        currentWorkerVersion,
      })
      stableSamples += 1
      if (stableSamples >= requiredSamples) {
        return {
          containers: currentContainers,
          workerVersion: currentWorkerVersion,
        }
      }
    } catch (error) {
      if (!isTransientContainerReadinessError(error)) throw error
      stableSamples = 0
      lastReadinessError = error
    }
    if (attempt < attempts) await sleep(2_000)
  }

  throw new Error(
    'The staging runner applications did not return to two stable ready snapshots.',
    { cause: lastReadinessError },
  )
}

export function defaultCppStagingRegressionDependencies() {
  return {
    invalidateProof: invalidateCppStagingRegressionProof,
    log: (...values) => console.log(...values),
    now: () => Date.now(),
    readActiveDeploymentVersion,
    readContainerSnapshot,
    requireStagingRunnerState,
    runStagingRegressionCheck,
    setStagingRunnerEnabled,
    sleep: (milliseconds) => new Promise((resolvePromise) => setTimeout(resolvePromise, milliseconds)),
    verifiedReleaseCommit,
    verifyHostedCi,
    verifyVersionMetadata,
    writeProof: (proof, nowMilliseconds) => writeCppStagingRegressionProof(
      proof,
      { nowMilliseconds },
    ),
  }
}

async function pauseAndProveStaging(dependencies) {
  const failures = []
  try {
    dependencies.setStagingRunnerEnabled(false)
  } catch (error) {
    failures.push(error)
  }
  try {
    await dependencies.requireStagingRunnerState(false)
  } catch (error) {
    failures.push(error)
  }
  if (failures.length > 0) {
    throw new AggregateError(failures, 'Staging could not be proved paused after its regression window.')
  }
}

export async function runCppStagingRegressionProof(
  argv = process.argv.slice(2),
  dependencyOverrides = {},
) {
  parseCppStagingRegressionArgs(argv)
  const dependencies = {
    ...defaultCppStagingRegressionDependencies(),
    ...dependencyOverrides,
  }
  const commit = dependencies.verifiedReleaseCommit()
  const ci = dependencies.verifyHostedCi(commit)
  dependencies.invalidateProof()
  await dependencies.requireStagingRunnerState(false)

  const metadata = cppRunnerReleaseMetadata(commit)
  const baselineWorkerVersion = dependencies.readActiveDeploymentVersion('staging')
  dependencies.verifyVersionMetadata('staging', baselineWorkerVersion, metadata)
  const baselineContainers = dependencies.readContainerSnapshot('staging')

  let regressionError
  let pauseError
  try {
    dependencies.setStagingRunnerEnabled(true)
    await dependencies.requireStagingRunnerState(true)
    for (const command of CPP_STAGING_REGRESSION_CHECKS) {
      dependencies.log(`Running ${command}.`)
      dependencies.runStagingRegressionCheck(command)
    }
  } catch (error) {
    regressionError = error
  } finally {
    try {
      await pauseAndProveStaging(dependencies)
    } catch (error) {
      pauseError = error
    }
  }
  if (regressionError || pauseError) {
    throw new AggregateError(
      [regressionError, pauseError].filter(Boolean),
      'The staging regression proof failed and no proof was recorded.',
    )
  }

  const stableRelease = await waitForStableStagingRelease({
    baselineContainers,
    baselineWorkerVersion,
    metadata,
  }, dependencies)
  const finalWorkerVersion = stableRelease.workerVersion
  const finalContainers = stableRelease.containers
  const finalCommit = dependencies.verifiedReleaseCommit()
  if (finalCommit !== commit) {
    throw new Error('The exact clean remote release commit changed during the staging regression run.')
  }

  const nowMilliseconds = dependencies.now()
  const proof = createCppStagingRegressionProof({
    ci,
    commit,
    completedAt: new Date(nowMilliseconds).toISOString(),
    containers: finalContainers,
    workerVersion: finalWorkerVersion,
  })
  dependencies.writeProof(proof, nowMilliseconds)
  dependencies.log(
    `Recorded the passed staging regression proof at ${cppStagingRegressionProofPath()}.`,
  )
  return proof
}

export async function main(argv = process.argv.slice(2)) {
  return runCppStagingRegressionProof(argv)
}

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : ''
if (import.meta.url === invokedPath) {
  await main()
}
