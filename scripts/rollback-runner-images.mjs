import { createHash } from 'node:crypto'
import { readFileSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { isAbsolute, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath, pathToFileURL } from 'node:url'

import {
  cppRunnerPublicationAlias,
  cppRunnerReleaseMetadata,
  currentCommit,
  readActiveDeploymentVersion,
  readContainerSnapshot,
  readReadyContainerSnapshot,
  requirePausedRunner,
  requirePausedRunnerEndpoint,
  runWranglerDeploy,
  verifiedReleaseCommit,
  verifyCandidateRunnerBoundary,
  verifyVersionMetadata,
  verifyWranglerSupport,
} from './deploy-cpp-runner.mjs'
import {
  deploymentEnvironments,
  environmentContainerSnapshot,
  parseWranglerVersionId,
  waitForExpectedValue,
} from './deploy-public-site.mjs'

const projectRoot = fileURLToPath(new URL('../', import.meta.url))
const commitPattern = /^[0-9a-f]{40}$/u
const digestPattern = /^sha256:[0-9a-f]{64}$/iu
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/iu
const cloudflareRegistryImagePattern = (
  /^registry\.cloudflare\.com\/(?<accountPrefix>[A-Za-z0-9_-]+)\/(?<repositoryName>[A-Za-z0-9_-]+)@(?<digest>sha256:[0-9a-f]{64})$/iu
)
const evidenceKeys = [
  'beforeContainers',
  'candidateWorkerVersion',
  'environment',
  'previousWorkerVersion',
  'releaseCommit',
  'version',
].sort()
const runnerClassSuffixes = new Map([
  ['RunnerCppSandbox', 'runnercppsandbox'],
  ['RunnerCsharpSandbox', 'runnercsharpsandbox'],
  ['RunnerJavaSandbox', 'runnerjavasandbox'],
  ['RunnerPythonSandbox', 'runnerpythonsandbox'],
])
const runnerClassImages = new Map([
  ['RunnerCppSandbox', './Dockerfile.runner.cpp'],
  ['RunnerCsharpSandbox', './Dockerfile.runner.csharp'],
  ['RunnerJavaSandbox', './Dockerfile.runner.java'],
  ['RunnerPythonSandbox', './Dockerfile.runner.python'],
])

function sameRecord(left, right) {
  return JSON.stringify(left) === JSON.stringify(right)
}

function canonicalRunnerTargetDigests(targetDigests) {
  if (!targetDigests || typeof targetDigests !== 'object' || Array.isArray(targetDigests)) {
    throw new Error('Runner rollback target digests must be an exact per-class object.')
  }
  const classNames = [...runnerClassSuffixes.keys()].sort()
  if (!sameRecord(Object.keys(targetDigests).sort(), classNames)) {
    throw new Error('Runner rollback target digests do not contain the reviewed four runner classes.')
  }
  return Object.fromEntries(classNames.map((className) => {
    const digest = targetDigests[className]
    if (typeof digest !== 'string' || !digestPattern.test(digest)) {
      throw new Error(`Runner rollback target digest for ${className} is invalid.`)
    }
    return [className, digest.toLowerCase()]
  }))
}

function runnerTargetDigests(snapshot, environmentName) {
  const canonical = canonicalSnapshot(snapshot, environmentName)
  return canonicalRunnerTargetDigests(Object.fromEntries(
    [...runnerClassSuffixes.entries()].map(([className, suffix]) => {
      const row = canonical.find(({ name }) => name.endsWith(suffix))
      return [className, cloudflareRunnerImageReference(row.image, row.name).digest]
    }),
  ))
}

function runnerTargetFingerprint(targetDigests) {
  return createHash('sha256')
    .update(JSON.stringify(canonicalRunnerTargetDigests(targetDigests)))
    .digest('hex')
}

export function cloudflareRunnerImageReference(image, expectedName) {
  if (typeof image !== 'string' || typeof expectedName !== 'string') {
    throw new Error('Runner rollback images must use the Cloudflare registry account namespace.')
  }
  const match = cloudflareRegistryImagePattern.exec(image)
  if (!match?.groups || match.groups.repositoryName !== expectedName) {
    throw new Error(
      `Runner rollback image ${expectedName} must use its exact registry.cloudflare.com account repository.`,
    )
  }
  return {
    accountPrefix: match.groups.accountPrefix,
    digest: match.groups.digest.toLowerCase(),
    repository: image.slice(0, image.lastIndexOf('@')),
  }
}

function canonicalSnapshot(snapshot, environmentName) {
  if (!Array.isArray(snapshot)) throw new Error('Rollback evidence does not contain a runner snapshot.')
  const canonical = environmentContainerSnapshot(
    snapshot.map((row) => ({ ...row, state: 'ready' })),
    environmentName,
  )
  for (const row of canonical) cloudflareRunnerImageReference(row.image, row.name)
  return canonical
}

export function parseRunnerImageRollbackArgs(argv, workingDirectory = process.cwd()) {
  const [environmentName, ...options] = argv
  if (!Object.hasOwn(deploymentEnvironments, environmentName)) {
    throw new Error('Choose exactly one runner rollback environment: production or staging.')
  }
  const dryRunFlags = options.filter((option) => option === '--dry-run')
  const evidencePaths = options.filter((option) => option !== '--dry-run')
  if (dryRunFlags.length > 1 || evidencePaths.length !== 1) {
    throw new Error('Provide exactly one rollback evidence JSON file and, optionally, one --dry-run flag.')
  }
  return {
    dryRun: dryRunFlags.length === 1,
    environmentName,
    evidencePath: resolve(workingDirectory, evidencePaths[0]),
  }
}

export function validateRunnerRollbackEvidence(rawEvidence, environmentName) {
  if (!rawEvidence || typeof rawEvidence !== 'object' || Array.isArray(rawEvidence)) {
    throw new Error('Runner rollback evidence must be a JSON object.')
  }
  if (!sameRecord(Object.keys(rawEvidence).sort(), evidenceKeys)) {
    throw new Error('Runner rollback evidence has missing or unreviewed fields.')
  }
  if (rawEvidence.version !== 1 || rawEvidence.environment !== environmentName) {
    throw new Error(`Runner rollback evidence is not version 1 evidence for ${environmentName}.`)
  }
  if (!commitPattern.test(rawEvidence.releaseCommit)) {
    throw new Error('Runner rollback evidence does not contain an exact release commit.')
  }
  if (
    !uuidPattern.test(rawEvidence.candidateWorkerVersion)
    || !uuidPattern.test(rawEvidence.previousWorkerVersion)
    || rawEvidence.candidateWorkerVersion.toLowerCase()
      === rawEvidence.previousWorkerVersion.toLowerCase()
  ) {
    throw new Error('Runner rollback evidence does not contain distinct valid Worker versions.')
  }
  return {
    beforeContainers: canonicalSnapshot(rawEvidence.beforeContainers, environmentName),
    candidateWorkerVersion: rawEvidence.candidateWorkerVersion.toLowerCase(),
    environment: environmentName,
    previousWorkerVersion: rawEvidence.previousWorkerVersion.toLowerCase(),
    releaseCommit: rawEvidence.releaseCommit,
    version: 1,
  }
}

export function runnerImageRollbackTargetProof(environmentName, evidence) {
  const validatedEvidence = validateRunnerRollbackEvidence(evidence, environmentName)
  return {
    releaseCommit: validatedEvidence.releaseCommit,
    targetDigests: runnerTargetDigests(validatedEvidence.beforeContainers, environmentName),
  }
}

export function loadRunnerRollbackPlan(environmentName, evidencePath) {
  let rawEvidence
  let baseConfig
  try {
    rawEvidence = JSON.parse(readFileSync(evidencePath, 'utf8'))
    const configName = deploymentEnvironments[environmentName].config ?? 'wrangler.jsonc'
    baseConfig = JSON.parse(readFileSync(resolve(projectRoot, configName), 'utf8'))
  } catch {
    throw new Error('The rollback evidence or environment configuration could not be read as JSON.')
  }
  return {
    baseConfig,
    evidence: validateRunnerRollbackEvidence(rawEvidence, environmentName),
  }
}

function absoluteProjectPath(value) {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error('The environment configuration contains an invalid project path.')
  }
  return isAbsolute(value) ? value : resolve(projectRoot, value)
}

export function buildExactDigestRollbackConfig(environmentName, baseConfig, evidence) {
  const validatedEvidence = validateRunnerRollbackEvidence(evidence, environmentName)
  const config = structuredClone(baseConfig)
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    throw new Error('The environment configuration is not a JSON object.')
  }
  if (!Array.isArray(config.containers) || config.containers.length !== runnerClassSuffixes.size) {
    throw new Error('The environment configuration must declare exactly four runner containers.')
  }
  const classes = config.containers.map(({ class_name: className }) => className)
  if (
    new Set(classes).size !== runnerClassSuffixes.size
    || [...runnerClassSuffixes.keys()].some((className) => !classes.includes(className))
  ) {
    throw new Error('The environment configuration does not have the reviewed four runner classes.')
  }
  const expectedInstances = deploymentEnvironments[environmentName].runnerInstances
  for (const container of config.containers) {
    if (
      container.image !== runnerClassImages.get(container.class_name)
      || container.instance_type !== 'basic'
      || container.max_instances !== expectedInstances
    ) {
      throw new Error(`The environment configuration has an unreviewed mapping for ${container.class_name}.`)
    }
  }

  config.containers = config.containers.map((container) => {
    const suffix = runnerClassSuffixes.get(container.class_name)
    const target = validatedEvidence.beforeContainers.find(({ name }) => name.endsWith(suffix))
    return {
      ...container,
      image: target.image,
    }
  })
  delete config.$schema
  config.main = absoluteProjectPath(config.main)
  if (config.assets?.directory) {
    config.assets.directory = absoluteProjectPath(config.assets.directory)
  }
  if (Array.isArray(config.d1_databases)) {
    config.d1_databases = config.d1_databases.map((database) => (
      database.migrations_dir
        ? { ...database, migrations_dir: absoluteProjectPath(database.migrations_dir) }
        : database
    ))
  }
  return config
}

export function runnerImageRollbackMetadata(commit, targetProof) {
  if (!commitPattern.test(commit)) {
    throw new Error('A runner-image rollback requires the exact 40-character commit SHA.')
  }
  if (!targetProof || !commitPattern.test(targetProof.releaseCommit)) {
    throw new Error('Runner-image rollback metadata requires the exact forward release commit.')
  }
  const targetFingerprint = runnerTargetFingerprint(targetProof.targetDigests)
  return {
    message: `Release ${targetProof.releaseCommit}; target-set ${targetFingerprint}.`,
    tag: `runner-images-rollback-${commit}`,
  }
}

export function buildRunnerImageRollbackWranglerArgs(
  environmentName,
  { commit, configPath, dryRun = false, targetProof } = {},
) {
  if (!Object.hasOwn(deploymentEnvironments, environmentName)) {
    throw new Error(`Unknown runner rollback environment: ${environmentName}`)
  }
  if (typeof configPath !== 'string' || !isAbsolute(configPath)) {
    throw new Error('The runner rollback requires an absolute generated configuration path.')
  }
  const metadata = runnerImageRollbackMetadata(commit, targetProof)
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

export function assertRollbackTargetsApplicable(currentSnapshot, targetSnapshot, environmentName) {
  const current = canonicalSnapshot(currentSnapshot, environmentName)
  const target = canonicalSnapshot(targetSnapshot, environmentName)
  let changedImages = 0
  for (const targetRow of target) {
    const currentRow = current.find(({ name }) => name === targetRow.name)
    if (currentRow.id !== targetRow.id) {
      throw new Error(`Runner application ${targetRow.name} no longer has the rollback evidence ID.`)
    }
    if (currentRow.instances !== targetRow.instances) {
      throw new Error(`Runner application ${targetRow.name} no longer has the rollback evidence instance count.`)
    }
    const currentImage = cloudflareRunnerImageReference(currentRow.image, currentRow.name)
    const targetImage = cloudflareRunnerImageReference(targetRow.image, targetRow.name)
    if (
      targetImage.repository !== currentImage.repository
      || targetImage.accountPrefix !== currentImage.accountPrefix
    ) {
      throw new Error(
        `Runner application ${targetRow.name} rollback evidence does not match its current Cloudflare registry repository.`,
      )
    }
    if (currentRow.image !== targetRow.image) changedImages += 1
  }
  if (changedImages === 0) {
    throw new Error('Every runner image already matches the exact rollback snapshot. No rollback was started.')
  }
  return { current, target }
}

export function runnerImageRollbackComplete(currentSnapshot, targetSnapshot, afterSnapshot, environmentName) {
  const { current, target } = assertRollbackTargetsApplicable(
    currentSnapshot,
    targetSnapshot,
    environmentName,
  )
  const after = canonicalSnapshot(afterSnapshot, environmentName)
  for (const targetRow of target) {
    const currentRow = current.find(({ name }) => name === targetRow.name)
    const afterRow = after.find(({ name }) => name === targetRow.name)
    if (
      afterRow.id !== targetRow.id
      || afterRow.instances !== targetRow.instances
      || afterRow.image !== targetRow.image
    ) {
      return false
    }
    if (currentRow.image === targetRow.image) {
      if (!sameRecord(afterRow, currentRow)) return false
      continue
    }
    if (
      afterRow.version <= currentRow.version
      || Date.parse(afterRow.updated_at) <= Date.parse(currentRow.updated_at)
    ) {
      return false
    }
  }
  return true
}

export async function waitForRunnerImageRollback({
  current,
  target,
  environmentName,
  readReadySnapshot,
  attempts = 180,
  delayMilliseconds = 5_000,
  stableSamples = 2,
  sleep = (milliseconds) => new Promise((resolvePromise) => setTimeout(resolvePromise, milliseconds)),
}) {
  assertRollbackTargetsApplicable(current, target, environmentName)
  let stableSnapshot
  let stableCount = 0
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const after = await readReadySnapshot()
    if (after && runnerImageRollbackComplete(current, target, after, environmentName)) {
      if (stableSnapshot && sameRecord(stableSnapshot, after)) {
        stableCount += 1
      } else {
        stableSnapshot = after
        stableCount = 1
      }
      if (stableCount >= stableSamples) return after
    } else {
      stableSnapshot = undefined
      stableCount = 0
    }
    if (attempt < attempts) await sleep(delayMilliseconds)
  }
  throw new Error('The exact-digest runner rollback did not reach two stable ready snapshots.')
}

export function runnerImageRollbackFailureGuidance(
  environmentName,
  previousWorkerVersion,
  currentContainers,
  { activeVersion, rollbackCandidateVersion } = {},
) {
  const config = deploymentEnvironments[environmentName].config
  const configOption = config ? ` --config ${config}` : ''
  const safeWorkerRollback = Boolean(
    activeVersion
    && rollbackCandidateVersion
    && activeVersion === rollbackCandidateVersion
  )
  const workerGuidance = safeWorkerRollback
    ? `Worker rollback command: npx wrangler rollback ${previousWorkerVersion} --yes --message "Restore the Worker that was active before the failed exact-digest rollback"${configOption}`
    : 'Do not run a Worker rollback command. The active Worker could not be proven to be this rollback candidate; stop and coordinate with the owner of the active release.'
  return [
    `Worker active before rollback: ${previousWorkerVersion}`,
    `Keep the ${environmentName} code checker paused.`,
    workerGuidance,
    'A Worker rollback does not restore or prove container image digests.',
    'Preserve and compare this complete pre-rollback runner snapshot:',
    JSON.stringify(currentContainers, null, 2),
    'Do not reopen execution until one Worker version and all four exact image digests form a verified compatible set.',
  ].join('\n')
}

export async function withTemporaryRollbackConfig(config, action) {
  const directory = mkdtempSync(resolve(tmpdir(), 'spcp-runner-rollback-'))
  const configPath = resolve(directory, 'wrangler.rollback.json')
  try {
    writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`, { mode: 0o600 })
    return await action(configPath)
  } finally {
    rmSync(directory, { force: true, recursive: true })
  }
}

export function defaultRunnerImageRollbackDependencies() {
  return {
    currentCommit,
    error: (...values) => console.error(...values),
    loadRunnerRollbackPlan,
    log: (...values) => console.log(...values),
    parseWranglerVersionId,
    readActiveDeploymentVersion,
    readContainerSnapshot,
    readReadyContainerSnapshot,
    requirePausedRunner,
    requirePausedRunnerEndpoint,
    runWranglerDeploy,
    verifiedReleaseCommit,
    verifyCandidateRunnerBoundary,
    verifyVersionMetadata,
    verifyWranglerSupport,
    waitForActiveVersion: (options) => waitForExpectedValue(options),
    waitForRollback: (options) => waitForRunnerImageRollback(options),
    withTemporaryRollbackConfig,
  }
}

export async function proveSameCommitStagingRollback(commit, targetProof, dependencies) {
  dependencies.requirePausedRunner('staging')
  await dependencies.requirePausedRunnerEndpoint('staging')
  const version = dependencies.readActiveDeploymentVersion('staging')
  dependencies.verifyVersionMetadata(
    'staging',
    version,
    runnerImageRollbackMetadata(commit, targetProof),
  )
  const containers = dependencies.readContainerSnapshot('staging')
  const stagingTargetDigests = runnerTargetDigests(containers, 'staging')
  if (!sameRecord(stagingTargetDigests, canonicalRunnerTargetDigests(targetProof.targetDigests))) {
    throw new Error(
      'The staging rollback does not have the exact per-class target digests required for production.',
    )
  }
  return {
    containers,
    version,
  }
}

export async function runRunnerImageRollback(
  argv = process.argv.slice(2),
  dependencyOverrides = {},
) {
  const dependencies = {
    ...defaultRunnerImageRollbackDependencies(),
    ...dependencyOverrides,
  }
  const { dryRun, environmentName, evidencePath } = parseRunnerImageRollbackArgs(argv)
  const { baseConfig, evidence } = dependencies.loadRunnerRollbackPlan(environmentName, evidencePath)
  const rollbackConfig = buildExactDigestRollbackConfig(environmentName, baseConfig, evidence)
  const targetProof = runnerImageRollbackTargetProof(environmentName, evidence)
  dependencies.verifyCandidateRunnerBoundary()
  dependencies.verifyWranglerSupport()

  if (dryRun) {
    const commit = dependencies.currentCommit()
    await dependencies.withTemporaryRollbackConfig(rollbackConfig, async (configPath) => {
      dependencies.runWranglerDeploy(buildRunnerImageRollbackWranglerArgs(environmentName, {
        commit,
        configPath,
        dryRun: true,
        targetProof,
      }))
    })
    dependencies.log(`Exact-digest ${environmentName} runner rollback dry run passed. No remote state changed.`)
    return
  }

  const commit = dependencies.verifiedReleaseCommit()
  const metadata = runnerImageRollbackMetadata(commit, targetProof)
  let stagingProof = environmentName === 'production'
    ? await proveSameCommitStagingRollback(commit, targetProof, dependencies)
    : undefined

  dependencies.requirePausedRunner(environmentName)
  await dependencies.requirePausedRunnerEndpoint(environmentName)
  const activeBefore = dependencies.readActiveDeploymentVersion(environmentName)
  if (activeBefore !== evidence.candidateWorkerVersion) {
    throw new Error('The evidence candidate is not the active Worker. No rollback was started.')
  }
  dependencies.verifyVersionMetadata(
    environmentName,
    activeBefore,
    cppRunnerReleaseMetadata(evidence.releaseCommit),
  )
  const currentContainers = dependencies.readContainerSnapshot(environmentName)
  const { current, target } = assertRollbackTargetsApplicable(
    currentContainers,
    evidence.beforeContainers,
    environmentName,
  )

  dependencies.log(`Restoring all ${environmentName} runner images to exact recorded digests.`)
  dependencies.log(`Exact rollback commit: ${commit}`)
  dependencies.log(`Worker active before rollback: ${activeBefore}`)
  dependencies.log(JSON.stringify(target, null, 2))

  let rollbackCandidateVersion
  try {
    if (stagingProof) {
      const currentStagingProof = await proveSameCommitStagingRollback(
        commit,
        targetProof,
        dependencies,
      )
      if (
        currentStagingProof.version !== stagingProof.version
        || !sameRecord(currentStagingProof.containers, stagingProof.containers)
      ) {
        throw new Error('The same-commit staging rollback proof changed after production preflight.')
      }
      stagingProof = currentStagingProof
    }
    dependencies.requirePausedRunner(environmentName)
    await dependencies.requirePausedRunnerEndpoint(environmentName)
    if (dependencies.readActiveDeploymentVersion(environmentName) !== activeBefore) {
      throw new Error(`The active ${environmentName} Worker changed after rollback preflight.`)
    }
    dependencies.verifyVersionMetadata(
      environmentName,
      activeBefore,
      cppRunnerReleaseMetadata(evidence.releaseCommit),
    )
    const mutationContainers = dependencies.readContainerSnapshot(environmentName)
    if (!sameRecord(mutationContainers, current)) {
      throw new Error(`The ${environmentName} runner applications changed after rollback preflight.`)
    }
    const mutationCommit = dependencies.verifiedReleaseCommit()
    if (mutationCommit !== commit) {
      throw new Error('The rollback commit changed after preflight. No deployment was started.')
    }

    await dependencies.withTemporaryRollbackConfig(rollbackConfig, async (configPath) => {
      const deployOutput = dependencies.runWranglerDeploy(
        buildRunnerImageRollbackWranglerArgs(environmentName, {
          commit,
          configPath,
          targetProof,
        }),
      )
      rollbackCandidateVersion = dependencies.parseWranglerVersionId(deployOutput)
    })
    if (!rollbackCandidateVersion || rollbackCandidateVersion === activeBefore) {
      throw new Error('Wrangler did not create a new Worker version for the exact-digest rollback.')
    }
    await dependencies.waitForActiveVersion({
      attempts: 60,
      delayMilliseconds: 2_000,
      expected: rollbackCandidateVersion,
      label: `The active ${environmentName} rollback Worker version`,
      read: () => dependencies.readActiveDeploymentVersion(environmentName),
    })
    dependencies.verifyVersionMetadata(environmentName, rollbackCandidateVersion, metadata)
    dependencies.requirePausedRunner(environmentName)
    await dependencies.requirePausedRunnerEndpoint(environmentName)
    const restored = await dependencies.waitForRollback({
      current,
      environmentName,
      target,
      readReadySnapshot: () => dependencies.readReadyContainerSnapshot(environmentName),
    })
    dependencies.requirePausedRunner(environmentName)
    await dependencies.requirePausedRunnerEndpoint(environmentName)
    const finalActive = dependencies.readActiveDeploymentVersion(environmentName)
    if (finalActive !== rollbackCandidateVersion) {
      throw new Error(`Another ${environmentName} Worker became active during exact-digest rollback.`)
    }
    dependencies.verifyVersionMetadata(environmentName, finalActive, metadata)
    dependencies.log(JSON.stringify(restored, null, 2))
    dependencies.log(`Exact-digest ${environmentName} runner rollback completed while execution stayed paused.`)
  } catch (error) {
    let activeVersion
    try {
      activeVersion = dependencies.readActiveDeploymentVersion(environmentName)
    } catch {
      activeVersion = undefined
    }
    dependencies.error(`Exact-digest ${environmentName} runner rollback or its proof failed.`)
    if (rollbackCandidateVersion) {
      dependencies.error(`Rollback candidate Worker version: ${rollbackCandidateVersion}`)
    }
    dependencies.error(runnerImageRollbackFailureGuidance(
      environmentName,
      activeBefore,
      current,
      { activeVersion, rollbackCandidateVersion },
    ))
    throw error
  }
}

export async function main(argv = process.argv.slice(2)) {
  return runRunnerImageRollback(argv)
}

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : ''
if (import.meta.url === invokedPath) {
  await main()
}
