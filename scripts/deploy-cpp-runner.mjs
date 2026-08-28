import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { isAbsolute, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

import {
  deploymentEnvironments,
  environmentContainerSnapshot,
  parseWranglerVersionId,
  waitForExpectedValue,
  wranglerDeploySpawnOptions,
} from './deploy-public-site.mjs'
import {
  cppStagingRegressionProofFingerprint,
  loadCppStagingRegressionProof,
  validateCppStagingRegressionProof,
} from './cpp-runner-staging-proof.mjs'

const projectRoot = fileURLToPath(new URL('../', import.meta.url))
const wranglerPath = fileURLToPath(new URL('../node_modules/.bin/wrangler', import.meta.url))
const candidateRunnerCheckPath = fileURLToPath(
  new URL('./check-practical-cpp-candidate-runner-bundle.mjs', import.meta.url),
)
const runnerImageCheckPath = fileURLToPath(new URL('./check-runner-image.sh', import.meta.url))
const commitPattern = /^[0-9a-f]{40}$/u
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/iu
const cppRunnerNameSuffix = 'runnercppsandbox'
const cloudflareRegistryImagePattern = (
  /^registry\.cloudflare\.com\/(?<accountPrefix>[A-Za-z0-9_-]+)\/(?<repositoryName>[A-Za-z0-9_-]+)@(?<digest>sha256:[0-9a-f]{64})$/iu
)
const runnerClassDefinitions = new Map([
  ['RunnerCppSandbox', { image: './Dockerfile.runner.cpp', suffix: cppRunnerNameSuffix }],
  ['RunnerCsharpSandbox', { image: './Dockerfile.runner.csharp', suffix: 'runnercsharpsandbox' }],
  ['RunnerJavaSandbox', { image: './Dockerfile.runner.java', suffix: 'runnerjavasandbox' }],
  ['RunnerPythonSandbox', { image: './Dockerfile.runner.python', suffix: 'runnerpythonsandbox' }],
])

export const cppRunnerPublicationAlias = [
  '../data/controlled-runner-publication',
  './src/data/runner-publication.with-cpp.ts',
].join(':')

export function parseCppRunnerReleaseArgs(argv) {
  const [environmentName, ...flags] = argv
  if (!Object.hasOwn(deploymentEnvironments, environmentName)) {
    throw new Error('Choose exactly one runner release environment: production or staging.')
  }
  const dryRunFlags = flags.filter((flag) => flag === '--dry-run')
  const unknownFlags = flags.filter((flag) => flag !== '--dry-run')
  if (unknownFlags.length > 0 || dryRunFlags.length > 1) {
    throw new Error(`Unsupported Practical C++ runner release option: ${unknownFlags[0] ?? '--dry-run'}`)
  }
  return {
    dryRun: dryRunFlags.length === 1,
    environmentName,
  }
}

export function cppRunnerReleaseMetadata(commit) {
  if (!commitPattern.test(commit)) {
    throw new Error('A Practical C++ runner release requires the exact 40-character commit SHA.')
  }
  return {
    message: `Practical C++ runner release from exact commit ${commit}.`,
    tag: `runner-cpp-${commit}`,
  }
}

export function runnerRollbackEvidence({
  beforeContainers,
  candidateWorkerVersion,
  environmentName,
  previousWorkerVersion,
  releaseCommit,
}) {
  if (!Object.hasOwn(deploymentEnvironments, environmentName)) {
    throw new Error(`Unknown runner release environment: ${environmentName}`)
  }
  if (!commitPattern.test(releaseCommit)) {
    throw new Error('Runner rollback evidence requires the exact release commit.')
  }
  if (!uuidPattern.test(candidateWorkerVersion) || !uuidPattern.test(previousWorkerVersion)) {
    throw new Error('Runner rollback evidence requires valid candidate and previous Worker versions.')
  }
  if (candidateWorkerVersion.toLowerCase() === previousWorkerVersion.toLowerCase()) {
    throw new Error('Runner rollback evidence requires distinct candidate and previous Worker versions.')
  }
  return {
    beforeContainers: environmentContainerSnapshot(
      beforeContainers.map((row) => ({ ...row, state: 'ready' })),
      environmentName,
    ),
    candidateWorkerVersion: candidateWorkerVersion.toLowerCase(),
    environment: environmentName,
    previousWorkerVersion: previousWorkerVersion.toLowerCase(),
    releaseCommit,
    version: 1,
  }
}

export function buildCppRunnerWranglerArgs(
  environmentName,
  { commit, configPath, dryRun = false } = {},
) {
  if (!Object.hasOwn(deploymentEnvironments, environmentName)) {
    throw new Error(`Unknown runner release environment: ${environmentName}`)
  }
  if (typeof configPath !== 'string' || !isAbsolute(configPath)) {
    throw new Error('The Practical C++ runner release requires an absolute generated configuration path.')
  }

  const metadata = cppRunnerReleaseMetadata(commit)
  const args = [
    'deploy',
    '--containers-rollout',
    'immediate',
    '--strict',
    '--old-asset-ttl',
    '900',
    '--tag',
    metadata.tag,
    '--message',
    metadata.message,
    '--alias',
    cppRunnerPublicationAlias,
    '--config',
    configPath,
  ]
  if (dryRun) args.push('--dry-run')
  return args
}

function absoluteProjectPath(path) {
  return isAbsolute(path) ? path : resolve(projectRoot, path)
}

function assertReviewedRunnerBaseConfig(environmentName, baseConfig) {
  const environment = deploymentEnvironments[environmentName]
  if (!environment || !baseConfig || typeof baseConfig !== 'object' || Array.isArray(baseConfig)) {
    throw new Error(`The ${environmentName} runner configuration is unreadable.`)
  }
  if (baseConfig.name !== environment.workerName) {
    throw new Error(`The ${environmentName} runner configuration targets an unreviewed Worker.`)
  }
  if (!Array.isArray(baseConfig.containers) || baseConfig.containers.length !== runnerClassDefinitions.size) {
    throw new Error(`The ${environmentName} runner configuration does not contain exactly four runner classes.`)
  }
  const classes = baseConfig.containers.map(({ class_name: className }) => className)
  if (new Set(classes).size !== runnerClassDefinitions.size) {
    throw new Error(`The ${environmentName} runner configuration contains duplicate runner classes.`)
  }
  for (const container of baseConfig.containers) {
    const definition = runnerClassDefinitions.get(container.class_name)
    if (
      !definition
      || container.image !== definition.image
      || container.instance_type !== 'basic'
      || container.max_instances !== environment.runnerInstances
    ) {
      throw new Error(
        `The ${environmentName} runner configuration has an unreviewed mapping for ${container.class_name}.`,
      )
    }
  }
}

function absoluteTemporaryConfigPaths(config) {
  delete config.$schema
  config.main = absoluteProjectPath(config.main)
  if (config.assets?.directory) config.assets.directory = absoluteProjectPath(config.assets.directory)
  if (Array.isArray(config.d1_databases)) {
    config.d1_databases = config.d1_databases.map((database) => (
      database.migrations_dir
        ? { ...database, migrations_dir: absoluteProjectPath(database.migrations_dir) }
        : database
    ))
  }
  return config
}

export function cloudflareCurrentRunnerImageReference(image, expectedName) {
  if (typeof image !== 'string' || typeof expectedName !== 'string') {
    throw new Error('Live runner images must use the Cloudflare registry account namespace.')
  }
  const match = cloudflareRegistryImagePattern.exec(image)
  if (!match?.groups || match.groups.repositoryName !== expectedName) {
    throw new Error(
      `Live runner image ${expectedName} must use its exact registry.cloudflare.com account repository.`,
    )
  }
  return {
    accountPrefix: match.groups.accountPrefix,
    digest: match.groups.digest.toLowerCase(),
    repository: image.slice(0, image.lastIndexOf('@')),
  }
}

export function buildCppOnlyReleaseConfig(environmentName, baseConfig, liveSnapshot) {
  assertReviewedRunnerBaseConfig(environmentName, baseConfig)
  const canonical = environmentContainerSnapshot(
    liveSnapshot.map((row) => ({ ...row, state: 'ready' })),
    environmentName,
  )
  const imageReferences = canonical.map((row) => ({
    ...cloudflareCurrentRunnerImageReference(row.image, row.name),
    image: row.image,
    name: row.name,
  }))
  const accountPrefixes = new Set(imageReferences.map(({ accountPrefix }) => accountPrefix))
  if (accountPrefixes.size !== 1) {
    throw new Error(`The live ${environmentName} runner images do not share one Cloudflare registry account.`)
  }

  const config = structuredClone(baseConfig)
  config.containers = config.containers.map((container) => {
    const definition = runnerClassDefinitions.get(container.class_name)
    if (definition.suffix === cppRunnerNameSuffix) {
      return {
        ...container,
        image: absoluteProjectPath(definition.image),
      }
    }
    const live = imageReferences.find(({ name }) => name.endsWith(definition.suffix))
    if (!live) {
      throw new Error(`The live ${environmentName} runner snapshot is missing ${container.class_name}.`)
    }
    return {
      ...container,
      image: live.image,
    }
  })
  return absoluteTemporaryConfigPaths(config)
}

export function buildCppRunnerDryRunConfig(environmentName, baseConfig) {
  assertReviewedRunnerBaseConfig(environmentName, baseConfig)
  const config = structuredClone(baseConfig)
  config.containers = config.containers.map((container) => ({
    ...container,
    image: absoluteProjectPath(container.image),
  }))
  return absoluteTemporaryConfigPaths(config)
}

export function loadCppRunnerBaseConfig(environmentName) {
  const environment = deploymentEnvironments[environmentName]
  if (!environment) throw new Error(`Unknown runner release environment: ${environmentName}`)
  const configPath = resolve(projectRoot, environment.config ?? 'wrangler.jsonc')
  try {
    return JSON.parse(readFileSync(configPath, 'utf8'))
  } catch {
    throw new Error(`The ${environmentName} runner configuration could not be read.`)
  }
}

export async function withTemporaryCppRunnerConfig(config, action) {
  const directory = mkdtempSync(resolve(tmpdir(), 'spcp-cpp-runner-release-'))
  const configPath = resolve(directory, 'wrangler.cpp-release.json')
  try {
    writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`, { mode: 0o600 })
    return await action(configPath)
  } finally {
    rmSync(directory, { force: true, recursive: true })
  }
}

function cppRunner(snapshot) {
  const matches = snapshot.filter(({ name }) => name.endsWith(cppRunnerNameSuffix))
  if (matches.length !== 1) {
    throw new Error('The runner snapshot does not contain exactly one Practical C++ application.')
  }
  return matches[0]
}

function nonCppRunners(snapshot) {
  return snapshot.filter(({ name }) => !name.endsWith(cppRunnerNameSuffix))
}

function sameRecord(left, right) {
  return JSON.stringify(left) === JSON.stringify(right)
}

export function assertNonCppRunnersUnchanged(before, after) {
  const beforeRows = nonCppRunners(before)
  const afterRows = nonCppRunners(after)
  if (!sameRecord(beforeRows, afterRows)) {
    throw new Error([
      'A non-C++ runner application changed during the Practical C++ release.',
      'Keep the code checker paused. This release is allowed to change only the C++ application.',
    ].join('\n'))
  }
}

export function cppRunnerImageDigest(snapshot) {
  const image = cppRunner(snapshot).image
  const match = /@(?<digest>sha256:[0-9a-f]{64})$/iu.exec(image)
  if (!match?.groups?.digest) throw new Error('The C++ runner image does not contain a valid digest.')
  return match.groups.digest.toLowerCase()
}

export function cppRunnerRolloutComplete(before, after, expectedDigest) {
  assertNonCppRunnersUnchanged(before, after)
  const previous = cppRunner(before)
  const current = cppRunner(after)

  if (current.id !== previous.id) {
    throw new Error('The C++ runner application ID changed. Keep the code checker paused.')
  }
  if (current.instances !== previous.instances) {
    throw new Error('The C++ runner instance count changed. Keep the code checker paused.')
  }
  if (current.version < previous.version) {
    throw new Error('The C++ runner application version moved backward.')
  }
  const previousUpdateTime = Date.parse(previous.updated_at)
  const currentUpdateTime = Date.parse(current.updated_at)
  if (currentUpdateTime < previousUpdateTime) {
    throw new Error('The C++ runner update time moved backward.')
  }

  const digestMatches = expectedDigest === undefined
    || cppRunnerImageDigest(after) === expectedDigest.toLowerCase()

  return (
    current.image !== previous.image
    && current.version > previous.version
    && currentUpdateTime > previousUpdateTime
    && digestMatches
  )
}

export async function waitForCppRunnerRollout({
  before,
  readReadySnapshot,
  attempts = 180,
  delayMilliseconds = 5_000,
  expectedDigest,
  stableSamples = 2,
  sleep = (milliseconds) => new Promise((resolvePromise) => setTimeout(resolvePromise, milliseconds)),
}) {
  let stableSnapshot
  let stableCount = 0
  let lastObservation = 'the runner applications were not all ready'

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const current = await readReadySnapshot()
    if (current) {
      if (cppRunnerRolloutComplete(before, current, expectedDigest)) {
        if (stableSnapshot && sameRecord(stableSnapshot, current)) {
          stableCount += 1
        } else {
          stableSnapshot = current
          stableCount = 1
        }
        if (stableCount >= stableSamples) return current
        lastObservation = `the complete C++ snapshot was stable for ${stableCount} sample(s)`
      } else {
        stableSnapshot = undefined
        stableCount = 0
        lastObservation = 'the C++ digest, application version, and update time had not all advanced'
      }
    } else {
      stableSnapshot = undefined
      stableCount = 0
      lastObservation = 'the runner applications were not all ready'
    }
    if (attempt < attempts) await sleep(delayMilliseconds)
  }

  throw new Error(`The Practical C++ runner rollout did not complete. Last observation: ${lastObservation}.`)
}

export function rollbackGuidance(
  environmentName,
  previousVersion,
  beforeContainers,
  { activeVersion, candidateVersion } = {},
) {
  if (!Object.hasOwn(deploymentEnvironments, environmentName)) {
    throw new Error(`Unknown runner release environment: ${environmentName}`)
  }
  const environment = deploymentEnvironments[environmentName]
  if (!uuidPattern.test(previousVersion)) throw new Error('The previous Worker version is invalid.')
  const previousCpp = cppRunner(beforeContainers)
  const configOption = environment.config ? ` --config ${environment.config}` : ''
  const previousImages = beforeContainers
    .map(({ image, name }) => `- ${name}: ${image}`)
    .join('\n')
  const rollbackIsSafe = Boolean(
    candidateVersion
    && activeVersion
    && candidateVersion === activeVersion,
  )
  const workerRollback = rollbackIsSafe
    ? `Worker rollback command: npx wrangler rollback ${previousVersion} --yes --message "Restore the previous Worker after a failed Practical C++ runner release"${configOption}`
    : 'Do not run a Worker rollback command. The active Worker could not be proven to be this release candidate; stop and coordinate with the owner of the active release.'
  return [
    `Previous active Worker version: ${previousVersion}`,
    `Previous C++ image: ${previousCpp.image}`,
    'Previous four-runner image snapshot:',
    previousImages,
    `Keep the ${environmentName} code checker paused.`,
    'A Worker rollback does not prove that the previous C++ image was restored.',
    workerRollback,
    'Compare every runner application with the complete before snapshot and restore every changed image through a separately reviewed environment-specific rollback.',
    'Pin each affected container to its exact recorded registry image URI. Rebuilding old source is not proof that the digest was restored.',
    'Land any source or configuration restoration as a reviewed commit on main. Do not deploy from a detached or unpushed historical checkout.',
    'Do not use this forward-release wrapper as proof of an exact digest rollback.',
    'Do not reopen execution until the Worker and all four images are compatible, all four applications are ready, and the complete regression set passes.',
  ].join('\n')
}

export function assertPausedRunnerStatus(environmentName, responseStatus, status) {
  if (
    responseStatus !== 200
    || status?.configured !== true
    || status?.enabled !== false
    || status?.paused !== true
    || status?.version !== 1
  ) {
    throw new Error(`The ${environmentName} code-checker status endpoint is not configured and paused at version 1.`)
  }
}

export function safeCommandOutput(command, args, run = execFileSync) {
  try {
    return run(command, args, {
      cwd: projectRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim()
  } catch {
    throw new Error('A required local or Cloudflare command failed. Captured command output was suppressed.')
  }
}

function output(command, args) {
  return safeCommandOutput(command, args)
}

function wranglerJson(args) {
  const raw = output(wranglerPath, args)
  try {
    return JSON.parse(raw)
  } catch {
    throw new Error(`Cloudflare returned unreadable JSON for a ${args[0]} status check.`)
  }
}

function configArgs(environmentName) {
  const config = deploymentEnvironments[environmentName]?.config
  return config ? ['--config', config] : []
}

export function currentCommit() {
  const commit = output('git', ['rev-parse', 'HEAD'])
  if (!commitPattern.test(commit)) throw new Error('Git did not report an exact release commit.')
  return commit
}

export function verifiedReleaseCommit() {
  const status = output('git', ['status', '--porcelain=v1', '--untracked-files=all'])
  if (status) throw new Error('Commit or restore every local change before a Practical C++ runner release.')

  const branch = output('git', ['branch', '--show-current'])
  if (branch !== 'main') {
    throw new Error(`Practical C++ runner releases must come from main, not ${branch || 'a detached checkout'}.`)
  }

  const localCommit = currentCommit()
  const trackingCommit = output('git', ['rev-parse', 'origin/main'])
  const remoteLine = output('git', ['ls-remote', 'origin', 'refs/heads/main'])
  const remoteCommit = remoteLine.split(/\s+/u)[0]
  if (localCommit !== trackingCommit || localCommit !== remoteCommit) {
    throw new Error('Local main, origin/main, and the live origin main ref must match exactly before release.')
  }
  return localCommit
}

export function verifyCandidateRunnerBoundary(run = execFileSync) {
  try {
    run(process.execPath, [candidateRunnerCheckPath], {
      cwd: projectRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    })
  } catch {
    throw new Error('The Practical C++ candidate runner boundary check failed. Captured output was suppressed.')
  }
}

export function verifyRunnerImages(commit, run = execFileSync) {
  const prefix = `spcp-${commit.slice(0, 12)}-release`
  try {
    run(runnerImageCheckPath, [prefix], {
      cwd: projectRoot,
      stdio: 'inherit',
    })
  } catch {
    throw new Error('The commit-bound four-image runner validation failed.')
  }
}

export function verifyWranglerSupport() {
  if (!existsSync(wranglerPath)) {
    throw new Error('Install the pinned project dependencies before release: npm ci')
  }
  const help = output(wranglerPath, ['deploy', '--help'])
  if (
    !help.includes('--containers-rollout')
    || !help.includes('immediate')
    || !help.includes('roll out to 100% of instances in one step')
  ) {
    throw new Error('The installed Wrangler version does not support the reviewed immediate container rollout.')
  }
}

function runnerConfigValue(environmentName) {
  return output(wranglerPath, [
    'kv',
    'key',
    'get',
    'enabled',
    '--binding',
    'RUNNER_CONFIG',
    '--remote',
    ...configArgs(environmentName),
  ])
}

export function requirePausedRunner(environmentName) {
  if (runnerConfigValue(environmentName) !== 'false') {
    throw new Error(`Pause the ${environmentName} code checker in RUNNER_CONFIG before release.`)
  }
}

export async function requirePausedRunnerEndpoint(environmentName) {
  const environment = deploymentEnvironments[environmentName]
  const response = await fetch(new URL('/api/runner/status', environment.origin), {
    redirect: 'manual',
    signal: AbortSignal.timeout(10_000),
  })
  let status
  try {
    status = await response.json()
  } catch {
    throw new Error(`The ${environmentName} code-checker status endpoint returned unreadable JSON.`)
  }
  assertPausedRunnerStatus(environmentName, response.status, status)
}

export function readActiveDeploymentVersion(environmentName) {
  const status = wranglerJson(['deployments', 'status', '--json', ...configArgs(environmentName)])
  const active = status?.versions?.find((version) => version.percentage === 100)
  if (!active?.version_id || !uuidPattern.test(active.version_id)) {
    throw new Error(`Cloudflare did not report one valid active ${environmentName} Worker version.`)
  }
  return active.version_id.toLowerCase()
}

export function verifyVersionMetadata(environmentName, versionId, expectedMetadata) {
  const version = wranglerJson([
    'versions',
    'view',
    versionId,
    '--json',
    ...configArgs(environmentName),
  ])
  if (
    version?.id?.toLowerCase() !== versionId
    || version?.annotations?.['workers/tag'] !== expectedMetadata.tag
    || version?.annotations?.['workers/message'] !== expectedMetadata.message
  ) {
    throw new Error(`Worker version ${versionId} does not carry the exact runner-release commit metadata.`)
  }
}

function readContainerRows(environmentName) {
  return wranglerJson(['containers', 'list', '--json', ...configArgs(environmentName)])
}

export function readContainerSnapshot(environmentName) {
  return environmentContainerSnapshot(readContainerRows(environmentName), environmentName)
}

export function readReadyContainerSnapshot(environmentName) {
  try {
    return readContainerSnapshot(environmentName)
  } catch (error) {
    if (error instanceof Error && /not ready/iu.test(error.message)) return null
    throw error
  }
}

export function runWranglerDeploy(args) {
  const result = spawnSync(wranglerPath, args, wranglerDeploySpawnOptions())
  if (result.error) {
    throw new Error('Wrangler runner release could not start. Captured process details were suppressed.')
  }
  if (result.status !== 0) {
    throw new Error(`Wrangler runner release failed with exit code ${result.status ?? 'unknown'}.`)
  }
  return `${result.stdout ?? ''}\n${result.stderr ?? ''}`
}

function printSnapshot(label, snapshot) {
  console.log(`${label}:`)
  console.log(JSON.stringify(snapshot, null, 2))
}

export function defaultCppRunnerReleaseDependencies() {
  return {
    currentCommit,
    error: (...values) => console.error(...values),
    loadStagingRegressionProof: loadCppStagingRegressionProof,
    loadCppRunnerBaseConfig,
    log: (...values) => console.log(...values),
    now: () => Date.now(),
    parseWranglerVersionId,
    printSnapshot,
    readActiveDeploymentVersion,
    readContainerSnapshot,
    readReadyContainerSnapshot,
    requirePausedRunner,
    requirePausedRunnerEndpoint,
    runWranglerDeploy,
    verifiedReleaseCommit,
    verifyCandidateRunnerBoundary,
    verifyRunnerImages,
    verifyVersionMetadata,
    verifyWranglerSupport,
    waitForActiveVersion: (options) => waitForExpectedValue(options),
    waitForRunnerRollout: (options) => waitForCppRunnerRollout(options),
    withTemporaryCppRunnerConfig,
  }
}

export async function proveSameCommitStagingRelease(commit, dependencies) {
  const metadata = cppRunnerReleaseMetadata(commit)
  const recordedProof = dependencies.loadStagingRegressionProof()
  dependencies.requirePausedRunner('staging')
  await dependencies.requirePausedRunnerEndpoint('staging')
  const version = dependencies.readActiveDeploymentVersion('staging')
  dependencies.verifyVersionMetadata('staging', version, metadata)
  const containers = dependencies.readContainerSnapshot('staging')
  const proof = validateCppStagingRegressionProof(recordedProof, {
    expectedCommit: commit,
    expectedContainers: containers,
    expectedWorkerVersion: version,
    nowMilliseconds: dependencies.now(),
  })
  const liveDigest = cppRunnerImageDigest(containers)
  if (liveDigest !== proof.cppDigest) {
    throw new Error('The live staging C++ digest does not match the recorded regression proof.')
  }
  return {
    digest: proof.cppDigest,
    proofFingerprint: cppStagingRegressionProofFingerprint(proof),
    version,
  }
}

export async function runCppRunnerRelease(
  argv = process.argv.slice(2),
  dependencyOverrides = {},
) {
  const dependencies = {
    ...defaultCppRunnerReleaseDependencies(),
    ...dependencyOverrides,
  }
  const { dryRun, environmentName } = parseCppRunnerReleaseArgs(argv)
  dependencies.verifyCandidateRunnerBoundary()
  dependencies.verifyWranglerSupport()

  if (dryRun) {
    const commit = dependencies.currentCommit()
    const dryRunConfig = buildCppRunnerDryRunConfig(
      environmentName,
      dependencies.loadCppRunnerBaseConfig(environmentName),
    )
    await dependencies.withTemporaryCppRunnerConfig(dryRunConfig, async (configPath) => {
      dependencies.runWranglerDeploy(
        buildCppRunnerWranglerArgs(environmentName, { commit, configPath, dryRun: true }),
      )
    })
    dependencies.log(
      `Practical C++ ${environmentName} runner dry run passed for exact commit ${commit}. No remote state changed.`,
    )
    return
  }

  const commit = dependencies.verifiedReleaseCommit()
  const metadata = cppRunnerReleaseMetadata(commit)
  dependencies.verifyRunnerImages(commit)

  let stagingProof = environmentName === 'production'
    ? await proveSameCommitStagingRelease(commit, dependencies)
    : undefined

  dependencies.requirePausedRunner(environmentName)
  await dependencies.requirePausedRunnerEndpoint(environmentName)
  const beforeVersion = dependencies.readActiveDeploymentVersion(environmentName)
  const beforeContainers = dependencies.readContainerSnapshot(environmentName)
  const releaseConfig = buildCppOnlyReleaseConfig(
    environmentName,
    dependencies.loadCppRunnerBaseConfig(environmentName),
    beforeContainers,
  )

  dependencies.log(`Releasing the Practical C++ runner to ${environmentName} from exact commit ${commit}.`)
  dependencies.log(`Previous active Worker version: ${beforeVersion}`)
  if (stagingProof) {
    dependencies.log(`Same-commit staging Worker: ${stagingProof.version}`)
    dependencies.log(`Required staging C++ digest: ${stagingProof.digest}`)
  }
  dependencies.printSnapshot(`Before ${environmentName} runner snapshot`, beforeContainers)

  let candidateVersion
  try {
    dependencies.requirePausedRunner(environmentName)
    await dependencies.requirePausedRunnerEndpoint(environmentName)
    const mutationCommit = dependencies.verifiedReleaseCommit()
    if (mutationCommit !== commit) {
      throw new Error('The release commit changed after preflight. No deployment was started.')
    }
    const mutationActiveVersion = dependencies.readActiveDeploymentVersion(environmentName)
    if (mutationActiveVersion !== beforeVersion) {
      throw new Error(`The active ${environmentName} Worker changed after preflight. No deployment was started.`)
    }
    const mutationContainers = dependencies.readContainerSnapshot(environmentName)
    if (!sameRecord(mutationContainers, beforeContainers)) {
      throw new Error(`The ${environmentName} runner applications changed after preflight. No deployment was started.`)
    }

    const mutationConfig = buildCppOnlyReleaseConfig(
      environmentName,
      dependencies.loadCppRunnerBaseConfig(environmentName),
      mutationContainers,
    )
    if (!sameRecord(mutationConfig, releaseConfig)) {
      throw new Error(`The ${environmentName} generated C++-only release configuration changed after preflight.`)
    }

    if (stagingProof) {
      const currentStagingProof = await proveSameCommitStagingRelease(commit, dependencies)
      if (
        currentStagingProof.version !== stagingProof.version
        || currentStagingProof.digest !== stagingProof.digest
        || currentStagingProof.proofFingerprint !== stagingProof.proofFingerprint
      ) {
        throw new Error('The recorded staging regression proof changed after production preflight. No deployment was started.')
      }
      stagingProof = currentStagingProof
    }

    const deployOutput = await dependencies.withTemporaryCppRunnerConfig(
      mutationConfig,
      async (configPath) => dependencies.runWranglerDeploy(
        buildCppRunnerWranglerArgs(environmentName, { commit, configPath }),
      ),
    )
    candidateVersion = dependencies.parseWranglerVersionId(deployOutput)
    if (candidateVersion === beforeVersion) {
      throw new Error('Wrangler did not create a new Worker version for the runner release.')
    }
    dependencies.log('Save this JSON as the exact-digest rollback evidence for this release:')
    dependencies.log(JSON.stringify(runnerRollbackEvidence({
      beforeContainers,
      candidateWorkerVersion: candidateVersion,
      environmentName,
      previousWorkerVersion: beforeVersion,
      releaseCommit: commit,
    }), null, 2))
    await dependencies.waitForActiveVersion({
      attempts: 60,
      delayMilliseconds: 2_000,
      expected: candidateVersion,
      label: `The active ${environmentName} Worker version`,
      read: () => dependencies.readActiveDeploymentVersion(environmentName),
    })
    dependencies.verifyVersionMetadata(environmentName, candidateVersion, metadata)
    dependencies.requirePausedRunner(environmentName)
    await dependencies.requirePausedRunnerEndpoint(environmentName)

    const afterContainers = await dependencies.waitForRunnerRollout({
      before: beforeContainers,
      expectedDigest: stagingProof?.digest,
      readReadySnapshot: () => dependencies.readReadyContainerSnapshot(environmentName),
    })
    dependencies.requirePausedRunner(environmentName)
    await dependencies.requirePausedRunnerEndpoint(environmentName)
    const finalActiveVersion = dependencies.readActiveDeploymentVersion(environmentName)
    if (finalActiveVersion !== candidateVersion) {
      throw new Error(`Another ${environmentName} Worker version became active during the container rollout.`)
    }
    dependencies.verifyVersionMetadata(environmentName, finalActiveVersion, metadata)
    dependencies.printSnapshot(`After ${environmentName} runner snapshot`, afterContainers)

    dependencies.log(`Practical C++ ${environmentName} runner release completed.`)
    dependencies.log(`Previous Worker version: ${beforeVersion}`)
    dependencies.log(`Current Worker version: ${candidateVersion}`)
    dependencies.log('Python, C#, and Java stayed unchanged. The C++ application kept its ID and advanced to a new digest and application version while the checker remained paused.')
  } catch (error) {
    let activeVersion
    try {
      activeVersion = dependencies.readActiveDeploymentVersion(environmentName)
    } catch {
      activeVersion = undefined
    }
    dependencies.error(`Practical C++ ${environmentName} runner release or its proof failed.`)
    if (candidateVersion) dependencies.error(`Candidate Worker version: ${candidateVersion}`)
    dependencies.error(rollbackGuidance(
      environmentName,
      beforeVersion,
      beforeContainers,
      { activeVersion, candidateVersion },
    ))
    throw error
  }
}

export async function main(argv = process.argv.slice(2)) {
  return runCppRunnerRelease(argv)
}

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : ''
if (import.meta.url === invokedPath) {
  await main()
}
