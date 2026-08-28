import { createHash } from 'node:crypto'
import {
  chmodSync,
  lstatSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  deploymentEnvironments,
  environmentContainerSnapshot,
} from './deploy-public-site.mjs'

const projectRoot = fileURLToPath(new URL('../', import.meta.url))
const defaultGitDirectory = resolve(projectRoot, '.git')
const commitPattern = /^[0-9a-f]{40}$/u
const digestPattern = /^sha256:[0-9a-f]{64}$/iu
const fingerprintPattern = /^[0-9a-f]{64}$/u
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/iu
const proofTopLevelKeys = [
  'checks',
  'ci',
  'commit',
  'completedAt',
  'containerFingerprint',
  'containers',
  'cppDigest',
  'environment',
  'schema',
  'status',
  'version',
  'worker',
].sort()
const proofContainerKeys = [
  'digest',
  'id',
  'instances',
  'name',
  'updatedAt',
  'version',
].sort()
const proofCiKeys = [
  'conclusion',
  'event',
  'headSha',
  'runId',
  'status',
  'workflow',
].sort()
const proofWorkerKeys = ['message', 'tag', 'version'].sort()
const stagingContainerNames = [
  'runnercppsandbox',
  'runnercsharpsandbox',
  'runnerjavasandbox',
  'runnerpythonsandbox',
].map((suffix) => `${deploymentEnvironments.staging.containerPrefix}${suffix}`).sort()

export const CPP_STAGING_REGRESSION_PROOF_FILENAME = 'cpp-runner-staging-regression-proof.json'
export const CPP_STAGING_REGRESSION_PROOF_SCHEMA = 'see-pound-coffee-pie/cpp-runner-staging-regression-proof'
export const CPP_STAGING_REGRESSION_PROOF_VERSION = 1
export const CPP_STAGING_REGRESSION_PROOF_MAX_AGE_MS = 24 * 60 * 60 * 1_000
export const CPP_STAGING_REGRESSION_CHECKS = Object.freeze([
  'npm run check:site:staging:enabled',
  'npm run check:runner:staging',
  'npm run check:runner:project:staging',
  'npm run check:runner:cpp-project:staging',
  'npm run check:runner:cpp-collections:staging',
  'npm run check:runner:csharp-project:staging',
  'npm run check:runner:java-project:staging',
  'npm run check:runner:python-data-tools:staging',
])

function sameRecord(left, right) {
  return JSON.stringify(left) === JSON.stringify(right)
}

function hasExactKeys(value, expectedKeys) {
  return value
    && typeof value === 'object'
    && !Array.isArray(value)
    && sameRecord(Object.keys(value).sort(), expectedKeys)
}

function releaseMetadata(commit) {
  return {
    message: `Practical C++ runner release from exact commit ${commit}.`,
    tag: `runner-cpp-${commit}`,
  }
}

function exactIsoTimestamp(value, label) {
  const match = typeof value === 'string'
    ? /^(?<date>\d{4}-\d{2}-\d{2})T(?<hour>[01]\d|2[0-3]):(?<minute>[0-5]\d):(?<second>[0-5]\d)(?<fraction>\.\d{1,9})?Z$/u.exec(value)
    : null
  if (!match?.groups) {
    throw new Error(`${label} must be an exact ISO timestamp.`)
  }

  const fractionDigits = match.groups.fraction?.slice(1) ?? ''
  const millisecondDigits = `${fractionDigits}000`.slice(0, 3)
  const millisecondTimestamp = [
    match.groups.date,
    'T',
    match.groups.hour,
    ':',
    match.groups.minute,
    ':',
    match.groups.second,
    '.',
    millisecondDigits,
    'Z',
  ].join('')
  const milliseconds = Date.parse(millisecondTimestamp)
  if (!Number.isFinite(milliseconds) || new Date(milliseconds).toISOString() !== millisecondTimestamp) {
    throw new Error(`${label} must be an exact ISO timestamp.`)
  }
  return milliseconds
}

function canonicalProofContainers(containers) {
  if (!Array.isArray(containers) || containers.length !== stagingContainerNames.length) {
    throw new Error('The staging regression proof must contain exactly four runner applications.')
  }
  const canonical = [...containers].sort((left, right) => String(left?.name).localeCompare(String(right?.name)))
  if (!sameRecord(canonical.map(({ name } = {}) => name), stagingContainerNames)) {
    throw new Error('The staging regression proof does not contain the exact four staging runner applications.')
  }

  const ids = new Set()
  return canonical.map((row) => {
    if (!hasExactKeys(row, proofContainerKeys)) {
      throw new Error('A staging regression proof runner application has missing or unreviewed fields.')
    }
    if (!uuidPattern.test(row.id) || ids.has(row.id.toLowerCase())) {
      throw new Error(`The staging runner application ${row.name} has an invalid or duplicate ID.`)
    }
    ids.add(row.id.toLowerCase())
    if (!digestPattern.test(row.digest)) {
      throw new Error(`The staging runner application ${row.name} has an invalid image digest.`)
    }
    if (row.instances !== deploymentEnvironments.staging.runnerInstances) {
      throw new Error(`The staging runner application ${row.name} has the wrong instance count.`)
    }
    if (!Number.isSafeInteger(row.version) || row.version < 1) {
      throw new Error(`The staging runner application ${row.name} has an invalid application version.`)
    }
    exactIsoTimestamp(row.updatedAt, `The staging runner application ${row.name} update time`)
    return {
      digest: row.digest.toLowerCase(),
      id: row.id.toLowerCase(),
      instances: row.instances,
      name: row.name,
      updatedAt: row.updatedAt,
      version: row.version,
    }
  })
}

export function cppStagingProofContainers(liveSnapshot) {
  if (!Array.isArray(liveSnapshot)) {
    throw new Error('The live staging runner snapshot is unreadable.')
  }
  const canonical = environmentContainerSnapshot(
    liveSnapshot.map((row) => ({ ...row, state: 'ready' })),
    'staging',
  )
  return canonicalProofContainers(canonical.map((row) => {
    const digest = row.image.match(/@(?<digest>sha256:[0-9a-f]{64})$/iu)?.groups?.digest
    if (!digest) {
      throw new Error(`The staging runner application ${row.name} does not have an exact image digest.`)
    }
    return {
      digest,
      id: row.id,
      instances: row.instances,
      name: row.name,
      updatedAt: row.updated_at,
      version: row.version,
    }
  }))
}

export function cppStagingContainerFingerprint(containers) {
  return createHash('sha256')
    .update(JSON.stringify(canonicalProofContainers(containers)))
    .digest('hex')
}

export function cppStagingRegressionProofFingerprint(proof) {
  return createHash('sha256').update(JSON.stringify(proof)).digest('hex')
}

export function createCppStagingRegressionProof({
  ci,
  commit,
  completedAt,
  containers,
  workerVersion,
}) {
  if (!commitPattern.test(commit)) {
    throw new Error('A staging regression proof requires the exact 40-character commit SHA.')
  }
  const proofContainers = cppStagingProofContainers(containers)
  const cpp = proofContainers.find(({ name }) => name.endsWith('runnercppsandbox'))
  const metadata = releaseMetadata(commit)
  return validateCppStagingRegressionProof({
    checks: [...CPP_STAGING_REGRESSION_CHECKS],
    ci: {
      conclusion: ci?.conclusion,
      event: ci?.event,
      headSha: ci?.headSha,
      runId: ci?.runId,
      status: ci?.status,
      workflow: ci?.workflow,
    },
    commit,
    completedAt,
    containerFingerprint: cppStagingContainerFingerprint(proofContainers),
    containers: proofContainers,
    cppDigest: cpp.digest,
    environment: 'staging',
    schema: CPP_STAGING_REGRESSION_PROOF_SCHEMA,
    status: 'passed',
    version: CPP_STAGING_REGRESSION_PROOF_VERSION,
    worker: {
      message: metadata.message,
      tag: metadata.tag,
      version: workerVersion,
    },
  }, {
    expectedCommit: commit,
    nowMilliseconds: Date.parse(completedAt),
  })
}

export function validateCppStagingRegressionProof(rawProof, {
  expectedCommit,
  expectedContainers,
  expectedWorkerVersion,
  nowMilliseconds = Date.now(),
} = {}) {
  if (!hasExactKeys(rawProof, proofTopLevelKeys)) {
    throw new Error('The staging regression proof has missing or unreviewed fields.')
  }
  if (
    rawProof.version !== CPP_STAGING_REGRESSION_PROOF_VERSION
    || rawProof.schema !== CPP_STAGING_REGRESSION_PROOF_SCHEMA
    || rawProof.environment !== 'staging'
    || rawProof.status !== 'passed'
  ) {
    throw new Error('The staging regression proof has the wrong schema, version, environment, or status.')
  }
  if (!commitPattern.test(rawProof.commit) || (expectedCommit && rawProof.commit !== expectedCommit)) {
    throw new Error('The staging regression proof does not match the exact release commit.')
  }
  const completedMilliseconds = exactIsoTimestamp(
    rawProof.completedAt,
    'The staging regression proof completion time',
  )
  if (
    !Number.isFinite(nowMilliseconds)
    || completedMilliseconds > nowMilliseconds
    || nowMilliseconds - completedMilliseconds > CPP_STAGING_REGRESSION_PROOF_MAX_AGE_MS
  ) {
    throw new Error('The staging regression proof is stale or dated in the future.')
  }
  if (
    !Array.isArray(rawProof.checks)
    || !sameRecord(rawProof.checks, CPP_STAGING_REGRESSION_CHECKS)
  ) {
    throw new Error('The staging regression proof does not contain the exact reviewed check list.')
  }
  if (
    !hasExactKeys(rawProof.ci, proofCiKeys)
    || rawProof.ci.workflow !== 'CI'
    || rawProof.ci.event !== 'push'
    || rawProof.ci.status !== 'completed'
    || rawProof.ci.conclusion !== 'success'
    || rawProof.ci.headSha !== rawProof.commit
    || !Number.isSafeInteger(rawProof.ci.runId)
    || rawProof.ci.runId < 1
  ) {
    throw new Error('The staging regression proof does not contain a successful exact-commit CI run.')
  }

  const metadata = releaseMetadata(rawProof.commit)
  if (
    !hasExactKeys(rawProof.worker, proofWorkerKeys)
    || !uuidPattern.test(rawProof.worker.version)
    || rawProof.worker.tag !== metadata.tag
    || rawProof.worker.message !== metadata.message
    || (expectedWorkerVersion && rawProof.worker.version.toLowerCase() !== expectedWorkerVersion.toLowerCase())
  ) {
    throw new Error('The staging regression proof does not match the exact active Worker metadata.')
  }

  const containers = canonicalProofContainers(rawProof.containers)
  const containerFingerprint = cppStagingContainerFingerprint(containers)
  if (
    !fingerprintPattern.test(rawProof.containerFingerprint)
    || rawProof.containerFingerprint !== containerFingerprint
  ) {
    throw new Error('The staging regression proof container fingerprint is invalid.')
  }
  const cpp = containers.find(({ name }) => name.endsWith('runnercppsandbox'))
  if (!digestPattern.test(rawProof.cppDigest) || rawProof.cppDigest.toLowerCase() !== cpp.digest) {
    throw new Error('The staging regression proof C++ digest does not match its four-container snapshot.')
  }
  if (expectedContainers) {
    const liveContainers = cppStagingProofContainers(expectedContainers)
    if (!sameRecord(containers, liveContainers)) {
      throw new Error('The live staging runner applications no longer match the recorded regression proof.')
    }
  }

  return {
    checks: [...CPP_STAGING_REGRESSION_CHECKS],
    ci: {
      conclusion: 'success',
      event: 'push',
      headSha: rawProof.commit,
      runId: rawProof.ci.runId,
      status: 'completed',
      workflow: 'CI',
    },
    commit: rawProof.commit,
    completedAt: rawProof.completedAt,
    containerFingerprint,
    containers,
    cppDigest: cpp.digest,
    environment: 'staging',
    schema: CPP_STAGING_REGRESSION_PROOF_SCHEMA,
    status: 'passed',
    version: CPP_STAGING_REGRESSION_PROOF_VERSION,
    worker: {
      message: metadata.message,
      tag: metadata.tag,
      version: rawProof.worker.version.toLowerCase(),
    },
  }
}

export function cppStagingRegressionProofPath(gitDirectory = defaultGitDirectory) {
  return resolve(gitDirectory, CPP_STAGING_REGRESSION_PROOF_FILENAME)
}

function requireGitDirectory(gitDirectory) {
  let stat
  try {
    stat = lstatSync(gitDirectory)
  } catch {
    throw new Error('The repository .git directory is unavailable for staging regression proof storage.')
  }
  if (!stat.isDirectory() || stat.isSymbolicLink()) {
    throw new Error('The staging regression proof must be stored in the repository .git directory.')
  }
}

export function invalidateCppStagingRegressionProof({ gitDirectory = defaultGitDirectory } = {}) {
  requireGitDirectory(gitDirectory)
  rmSync(cppStagingRegressionProofPath(gitDirectory), { force: true })
}

export function writeCppStagingRegressionProof(proof, {
  gitDirectory = defaultGitDirectory,
  nowMilliseconds = Date.now(),
} = {}) {
  requireGitDirectory(gitDirectory)
  const validated = validateCppStagingRegressionProof(proof, { nowMilliseconds })
  const targetPath = cppStagingRegressionProofPath(gitDirectory)
  const temporaryPath = resolve(
    gitDirectory,
    `.${CPP_STAGING_REGRESSION_PROOF_FILENAME}.${process.pid}.${nowMilliseconds}.tmp`,
  )
  try {
    writeFileSync(temporaryPath, `${JSON.stringify(validated, null, 2)}\n`, {
      flag: 'wx',
      mode: 0o600,
    })
    chmodSync(temporaryPath, 0o600)
    renameSync(temporaryPath, targetPath)
    chmodSync(targetPath, 0o600)
  } finally {
    rmSync(temporaryPath, { force: true })
  }
  return targetPath
}

export function loadCppStagingRegressionProof({ gitDirectory = defaultGitDirectory } = {}) {
  requireGitDirectory(gitDirectory)
  const proofPath = cppStagingRegressionProofPath(gitDirectory)
  let stat
  try {
    stat = lstatSync(proofPath)
  } catch {
    throw new Error('No readable staging regression proof exists for this production release.')
  }
  if (!stat.isFile() || stat.isSymbolicLink() || (stat.mode & 0o777) !== 0o600) {
    throw new Error('The staging regression proof is not a regular mode-0600 file.')
  }
  let text
  try {
    text = readFileSync(proofPath, 'utf8')
  } catch {
    throw new Error('No readable staging regression proof exists for this production release.')
  }
  try {
    return JSON.parse(text)
  } catch {
    throw new Error('The staging regression proof does not contain readable JSON.')
  }
}
