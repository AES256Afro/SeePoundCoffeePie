import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const projectRoot = fileURLToPath(new URL('../', import.meta.url))
const wranglerPath = fileURLToPath(new URL('../node_modules/.bin/wrangler', import.meta.url))
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/iu
const digestImagePattern = /@sha256:[0-9a-f]{64}$/iu

const containerSuffixes = [
  'runnercppsandbox',
  'runnercsharpsandbox',
  'runnerjavasandbox',
  'runnerpythonsandbox',
]

export const deploymentEnvironments = {
  production: {
    config: null,
    containerPrefix: 'see-pound-coffee-pie-',
    origin: 'https://seepoundcoffeepie.com',
    runnerInstances: 4,
    workerName: 'see-pound-coffee-pie',
  },
  staging: {
    config: 'wrangler.staging.jsonc',
    containerPrefix: 'see-pound-coffee-pie-phase2-staging-',
    origin: 'https://see-pound-coffee-pie-phase2-staging.chris-c39.workers.dev',
    runnerInstances: 2,
    workerName: 'see-pound-coffee-pie-phase2-staging',
  },
}

export function parseDeploymentArgs(argv) {
  const [environmentName, ...flags] = argv
  if (!(environmentName in deploymentEnvironments)) {
    throw new Error('Choose exactly one deployment environment: production or staging.')
  }
  const unknownFlags = flags.filter((flag) => flag !== '--dry-run')
  if (unknownFlags.length > 0 || flags.filter((flag) => flag === '--dry-run').length > 1) {
    throw new Error(`Unsupported public-site deployment option: ${unknownFlags[0] ?? '--dry-run'}`)
  }
  return {
    dryRun: flags.includes('--dry-run'),
    environmentName,
  }
}

export function deploymentMetadata(commit) {
  const shortCommit = commit.slice(0, 12).replace(/[^a-zA-Z0-9]/gu, '') || 'local'
  return {
    message: `Public site only from ${shortCommit}; runner images preserved.`,
    shortCommit,
    tag: `public-site-${shortCommit}`,
  }
}

export function buildWranglerDeployArgs(environmentName, { commit = 'local', dryRun = false } = {}) {
  const environment = deploymentEnvironments[environmentName]
  if (!environment) throw new Error(`Unknown deployment environment: ${environmentName}`)

  const metadata = deploymentMetadata(commit)
  const args = [
    'deploy',
    '--containers-rollout',
    'none',
    '--strict',
    '--old-asset-ttl',
    '900',
    '--tag',
    metadata.tag,
    '--message',
    metadata.message,
  ]
  if (dryRun) args.push('--dry-run')
  if (environment.config) args.push('--config', environment.config)
  return args
}

function expectedContainerNames(environmentName) {
  const environment = deploymentEnvironments[environmentName]
  if (!environment) throw new Error(`Unknown deployment environment: ${environmentName}`)
  return containerSuffixes.map((suffix) => `${environment.containerPrefix}${suffix}`).sort()
}

function assertValidContainerRow(row, environmentName) {
  const environment = deploymentEnvironments[environmentName]
  if (!row || typeof row !== 'object') {
    throw new Error(`Cloudflare returned an unreadable ${environmentName} runner application.`)
  }
  if (row.state !== 'ready') {
    throw new Error(`Runner application ${row.name ?? 'unknown'} is ${row.state ?? 'in an unknown state'}, not ready.`)
  }
  if (typeof row.id !== 'string' || !uuidPattern.test(row.id)) {
    throw new Error(`Runner application ${row.name} has an invalid application ID.`)
  }
  if (
    typeof row.image !== 'string'
    || !digestImagePattern.test(row.image)
    || !row.image.includes(`/${row.name}@sha256:`)
  ) {
    throw new Error(`Runner application ${row.name} does not use its own digest-pinned image.`)
  }
  if (row.instances !== environment.runnerInstances) {
    throw new Error(`Runner application ${row.name} reports ${row.instances ?? 'unknown'} instances, not ${environment.runnerInstances}.`)
  }
  if (!Number.isSafeInteger(row.version) || row.version < 1) {
    throw new Error(`Runner application ${row.name} has an invalid application version.`)
  }
  if (typeof row.updated_at !== 'string' || !Number.isFinite(Date.parse(row.updated_at))) {
    throw new Error(`Runner application ${row.name} has an invalid update time.`)
  }
}

export function environmentContainerSnapshot(rows, environmentName) {
  if (!Array.isArray(rows)) throw new Error('Cloudflare returned an unreadable container list.')
  const expectedNames = expectedContainerNames(environmentName)
  const selected = rows
    .filter((row) => expectedNames.includes(row?.name))
    .sort((left, right) => left.name.localeCompare(right.name))
  const selectedNames = selected.map((row) => row.name)
  const uniqueNames = new Set(selectedNames)

  if (
    selected.length !== expectedNames.length
    || uniqueNames.size !== expectedNames.length
    || expectedNames.some((name) => !uniqueNames.has(name))
  ) {
    const missingNames = expectedNames.filter((name) => !uniqueNames.has(name))
    const duplicateNames = selectedNames.filter((name, index) => selectedNames.indexOf(name) !== index)
    throw new Error([
      `Expected exactly four unique ${environmentName} runner applications.`,
      `Missing: ${missingNames.join(', ') || 'none'}.`,
      `Duplicates: ${[...new Set(duplicateNames)].join(', ') || 'none'}.`,
    ].join(' '))
  }

  for (const row of selected) assertValidContainerRow(row, environmentName)
  const selectedIds = selected.map((row) => row.id)
  if (new Set(selectedIds).size !== selectedIds.length) {
    throw new Error(`The ${environmentName} runner application list contains a duplicate application ID.`)
  }

  return selected.map((row) => ({
    id: row.id,
    image: row.image,
    instances: row.instances,
    name: row.name,
    updated_at: row.updated_at,
    version: row.version,
  }))
}

export function assertContainerSnapshotUnchanged(before, after) {
  if (JSON.stringify(before) !== JSON.stringify(after)) {
    throw new Error([
      'A runner application changed during the public-site deployment.',
      `Before: ${JSON.stringify(before)}`,
      `After: ${JSON.stringify(after)}`,
      'Keep the runner closed until the change has been reviewed.',
    ].join('\n'))
  }
}

export function parseWranglerVersionId(outputText) {
  const matches = [...outputText.matchAll(/Current Version ID:\s*([0-9a-f-]{36})/giu)]
  const versionIds = [...new Set(matches.map((match) => match[1].toLowerCase()))]
  if (versionIds.length !== 1 || !uuidPattern.test(versionIds[0])) {
    throw new Error('Wrangler did not report exactly one valid Worker version ID for this deployment.')
  }
  return versionIds[0]
}

export async function waitForExpectedValue({
  attempts = 20,
  delayMilliseconds = 1_000,
  expected,
  label,
  read,
  sleep = (milliseconds) => new Promise((resolvePromise) => setTimeout(resolvePromise, milliseconds)),
}) {
  let observed
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    observed = await read()
    if (observed === expected) return observed
    if (attempt < attempts) await sleep(delayMilliseconds)
  }
  throw new Error(`${label} did not become ${expected}. Last observed value: ${observed ?? 'unknown'}.`)
}

export async function verifyStableContainerSnapshot({
  baseline,
  readSnapshot,
  samples = 3,
  delayMilliseconds = 1_500,
  sleep = (milliseconds) => new Promise((resolvePromise) => setTimeout(resolvePromise, milliseconds)),
}) {
  let latest = baseline
  for (let sample = 0; sample < samples; sample += 1) {
    latest = await readSnapshot()
    assertContainerSnapshotUnchanged(baseline, latest)
    if (sample + 1 < samples) await sleep(delayMilliseconds)
  }
  return latest
}

export function wranglerDeploySpawnOptions() {
  return {
    cwd: projectRoot,
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'pipe'],
  }
}

function output(command, args) {
  return execFileSync(command, args, {
    cwd: projectRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'inherit'],
  }).trim()
}

function wranglerJson(args) {
  const raw = output(wranglerPath, args)
  try {
    return JSON.parse(raw)
  } catch {
    throw new Error(`Cloudflare returned unreadable JSON for: wrangler ${args.join(' ')}`)
  }
}

function configArgs(environmentName) {
  const config = deploymentEnvironments[environmentName]?.config
  return config ? ['--config', config] : []
}

function readContainerSnapshot(environmentName) {
  return environmentContainerSnapshot(
    wranglerJson(['containers', 'list', '--json', ...configArgs(environmentName)]),
    environmentName,
  )
}

function readActiveDeploymentVersion(environmentName) {
  const status = wranglerJson(['deployments', 'status', '--json', ...configArgs(environmentName)])
  const active = status?.versions?.find((version) => version.percentage === 100)
  if (!active?.version_id || !uuidPattern.test(active.version_id)) {
    throw new Error(`Cloudflare did not report one valid active ${environmentName} Worker version.`)
  }
  return active.version_id.toLowerCase()
}

function verifyVersionMetadata(environmentName, versionId, expectedMetadata) {
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
    throw new Error(`Worker version ${versionId} does not carry the expected commit tag and public-site message.`)
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

function requirePausedRunner(environmentName) {
  const enabled = runnerConfigValue(environmentName)
  if (enabled !== 'false') {
    throw new Error([
      `Pause the ${environmentName} code checker before deploying Worker code.`,
      `Cloudflare reported RUNNER_CONFIG.enabled as ${JSON.stringify(enabled)}.`,
      'The public-site deployment procedure documents the exact pause and restore commands.',
    ].join('\n'))
  }
}

async function requirePausedRunnerEndpoint(environmentName) {
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
  if (response.status !== 200 || status?.enabled !== false || status?.version !== 1) {
    throw new Error(`The ${environmentName} code-checker status endpoint did not remain paused at version 1.`)
  }
}

function verifyWranglerSupport() {
  if (!existsSync(wranglerPath)) {
    throw new Error('Install the pinned project dependencies before deploying: npm ci')
  }
  const help = output(wranglerPath, ['deploy', '--help'])
  if (!help.includes('--containers-rollout') || !help.includes('without building or updating any Containers')) {
    throw new Error('The installed Wrangler version cannot prove a container-free public-site deployment.')
  }
}

function verifiedReleaseCommit() {
  const status = output('git', ['status', '--porcelain=v1'])
  if (status) throw new Error('Commit or restore every local change before a public-site deployment.')

  const branch = output('git', ['branch', '--show-current'])
  if (branch !== 'main') throw new Error(`Public-site deployments must come from main, not ${branch || 'a detached checkout'}.`)

  const localCommit = output('git', ['rev-parse', 'HEAD'])
  const remoteLine = output('git', ['ls-remote', 'origin', 'refs/heads/main'])
  const remoteCommit = remoteLine.split(/\s+/u)[0]
  if (!remoteCommit || remoteCommit !== localCommit) {
    throw new Error('Local main and origin/main must match exactly before a public-site deployment.')
  }
  return localCommit
}

function runWranglerDeploy(args) {
  const result = spawnSync(wranglerPath, args, wranglerDeploySpawnOptions())
  if (result.stdout) process.stdout.write(result.stdout)
  if (result.stderr) process.stderr.write(result.stderr)
  if (result.error) throw result.error
  if (result.status !== 0) throw new Error(`Wrangler deployment failed with exit code ${result.status ?? 'unknown'}.`)
  return `${result.stdout ?? ''}\n${result.stderr ?? ''}`
}

function rollbackCommand(environmentName, previousVersion) {
  const config = deploymentEnvironments[environmentName].config
  const configOption = config ? ` --config ${config}` : ''
  return `npx wrangler rollback ${previousVersion} --yes --message "Restore the previous active Worker version"${configOption}`
}

export async function main(argv = process.argv.slice(2)) {
  const { dryRun, environmentName } = parseDeploymentArgs(argv)
  verifyWranglerSupport()

  if (dryRun) {
    runWranglerDeploy(buildWranglerDeployArgs(environmentName, { dryRun: true }))
    console.log(`Public-site ${environmentName} dry run passed. Runner images were excluded from the rollout.`)
    return
  }

  const commit = verifiedReleaseCommit()
  const metadata = deploymentMetadata(commit)
  requirePausedRunner(environmentName)
  const beforeVersion = readActiveDeploymentVersion(environmentName)
  const beforeContainers = readContainerSnapshot(environmentName)

  console.log(`Deploying public-site assets and Worker code to ${environmentName} from ${commit.slice(0, 12)}.`)
  console.log(`Previous active Worker version: ${beforeVersion}`)
  console.log(`Preserving ${beforeContainers.length} ready runner applications at their current image versions.`)

  let candidateVersion
  try {
    const deployOutput = runWranglerDeploy(buildWranglerDeployArgs(environmentName, { commit }))
    candidateVersion = parseWranglerVersionId(deployOutput)
    await waitForExpectedValue({
      expected: candidateVersion,
      label: `The active ${environmentName} Worker version`,
      read: () => readActiveDeploymentVersion(environmentName),
    })
    verifyVersionMetadata(environmentName, candidateVersion, metadata)
    requirePausedRunner(environmentName)
    await requirePausedRunnerEndpoint(environmentName)
    await verifyStableContainerSnapshot({
      baseline: beforeContainers,
      readSnapshot: () => readContainerSnapshot(environmentName),
    })
  } catch (error) {
    console.error('Public-site deployment or its post-deployment proof failed.')
    console.error(`Previous active Worker version: ${beforeVersion}`)
    if (candidateVersion) console.error(`Candidate Worker version: ${candidateVersion}`)
    console.error(`Keep the ${environmentName} code checker paused while investigating.`)
    console.error(`Rollback command: ${rollbackCommand(environmentName, beforeVersion)}`)
    throw error
  }

  console.log(`Public-site ${environmentName} deployment completed.`)
  console.log(`Previous Worker version: ${beforeVersion}`)
  console.log(`Current Worker version: ${candidateVersion}`)
  console.log('The runner stayed paused, and all four runner application IDs, images, versions, instance counts, and update times remained unchanged across three checks.')
}

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : ''
if (import.meta.url === invokedPath) {
  await main()
}
