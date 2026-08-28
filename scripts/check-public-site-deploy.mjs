import { execFileSync } from 'node:child_process'
import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import {
  buildCppRunnerWranglerArgs,
  cppRunnerPublicationAlias,
} from './deploy-cpp-runner.mjs'
import { buildWranglerDeployArgs } from './deploy-public-site.mjs'
import { CPP_STAGING_REGRESSION_CHECKS } from './cpp-runner-staging-proof.mjs'
import { stagingRunnerKvPutArgs } from './prove-cpp-runner-staging.mjs'
import {
  buildRunnerImageRollbackWranglerArgs,
  runnerImageRollbackMetadata,
} from './rollback-runner-images.mjs'

const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
const requiredScripts = {
  deploy: 'npm run deploy:site',
  'deploy:dry-run': 'npm run build && node scripts/deploy-public-site.mjs production --dry-run',
  'deploy:site': 'npm run check:release && node scripts/deploy-public-site.mjs production',
  'deploy:site:staging': 'npm run check:release && node scripts/deploy-public-site.mjs staging',
  'deploy:staging': 'npm run deploy:site:staging',
  'deploy:staging:dry-run': 'npm run build && node scripts/deploy-public-site.mjs staging --dry-run',
  'deploy:runner:cpp:production': 'npm run check:release && node scripts/deploy-cpp-runner.mjs production',
  'deploy:runner:cpp:production:dry-run': 'npm run build && node scripts/deploy-cpp-runner.mjs production --dry-run',
  'deploy:runner:cpp:staging': 'npm run check:release && node scripts/deploy-cpp-runner.mjs staging',
  'deploy:runner:cpp:staging:dry-run': 'npm run build && node scripts/deploy-cpp-runner.mjs staging --dry-run',
  'prove:runner:cpp:staging': 'node scripts/prove-cpp-runner-staging.mjs',
  'rollback:runner:images:production': 'npm run check:release && node scripts/rollback-runner-images.mjs production',
  'rollback:runner:images:production:dry-run': 'npm run build && node scripts/rollback-runner-images.mjs production --dry-run',
  'rollback:runner:images:staging': 'npm run check:release && node scripts/rollback-runner-images.mjs staging',
  'rollback:runner:images:staging:dry-run': 'npm run build && node scripts/rollback-runner-images.mjs staging --dry-run',
}

for (const [name, expected] of Object.entries(requiredScripts)) {
  const actual = packageJson.scripts?.[name]
  if (actual !== expected) {
    throw new Error(`The ${name} script must use the reviewed public-site deployment wrapper. Expected: ${expected}`)
  }
}

const wranglerMutationPattern = /\bwrangler\b[^\n]*(?:\bdeploy\b|\brollback\b|\bversions\s+upload\b)|(?:\bdeploy\b|\brollback\b|\bversions\s+upload\b)[^\n]*\bwrangler\b/iu
for (const [name, command] of Object.entries(packageJson.scripts ?? {})) {
  if (wranglerMutationPattern.test(command)) {
    throw new Error(`The ${name} package script bypasses the reviewed public-site deployment wrapper.`)
  }
}

const mutationScanDirectories = [
  { directory: new URL('../.github/workflows/', import.meta.url), extensions: ['.yml', '.yaml'] },
  { directory: new URL('./', import.meta.url), extensions: ['.js', '.mjs', '.sh'] },
]
const allowedMutationHelpers = new Set([
  fileURLToPath(new URL('./check-public-site-deploy.mjs', import.meta.url)),
  fileURLToPath(new URL('./deploy-cpp-runner.mjs', import.meta.url)),
  fileURLToPath(new URL('./deploy-public-site.mjs', import.meta.url)),
  fileURLToPath(new URL('./prove-cpp-runner-staging.mjs', import.meta.url)),
  fileURLToPath(new URL('./rollback-runner-images.mjs', import.meta.url)),
])
for (const { directory, extensions } of mutationScanDirectories) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (!entry.isFile() || !extensions.some((extension) => entry.name.endsWith(extension))) continue
    const fileUrl = new URL(entry.name, directory)
    const filePath = fileURLToPath(fileUrl)
    if (allowedMutationHelpers.has(filePath)) continue
    if (wranglerMutationPattern.test(readFileSync(fileUrl, 'utf8'))) {
      throw new Error(`${entry.name} contains a direct Wrangler deployment mutation outside the reviewed wrapper.`)
    }
  }
}

for (const environmentName of ['production', 'staging']) {
  for (const dryRun of [false, true]) {
    const args = buildWranglerDeployArgs(environmentName, { dryRun })
    const rolloutIndex = args.indexOf('--containers-rollout')
    if (rolloutIndex < 0 || args[rolloutIndex + 1] !== 'none') {
      throw new Error(`The ${environmentName} public-site deployment does not freeze runner container rollouts.`)
    }
    const aliasIndex = args.indexOf('--alias')
    if (
      aliasIndex < 0
      || args[aliasIndex + 1]
        !== '../data/controlled-runner-publication:./src/data/runner-publication.with-cpp.ts'
    ) {
      throw new Error(`The ${environmentName} public-site deployment does not pin the published runner registry.`)
    }
  }
}

const expectedStagingRegressionChecks = [
  'npm run check:site:staging:enabled',
  'npm run check:runner:staging',
  'npm run check:runner:project:staging',
  'npm run check:runner:cpp-project:staging',
  'npm run check:runner:cpp-collections:staging',
  'npm run check:runner:csharp-project:staging',
  'npm run check:runner:java-project:staging',
  'npm run check:runner:python-data-tools:staging',
]
if (JSON.stringify(CPP_STAGING_REGRESSION_CHECKS) !== JSON.stringify(expectedStagingRegressionChecks)) {
  throw new Error('The recorded Practical C++ staging proof does not run the exact full regression set.')
}
for (const [enabled, expectedValue] of [[true, 'true'], [false, 'false']]) {
  const args = stagingRunnerKvPutArgs(enabled)
  if (
    args.join(' ') !== [
      'kv key put enabled',
      expectedValue,
      '--binding RUNNER_CONFIG --remote --config wrangler.staging.jsonc',
    ].join(' ')
  ) {
    throw new Error('The recorded Practical C++ staging proof does not use the reviewed KV window.')
  }
}

const exactRunnerReleaseCommit = '0'.repeat(40)
const cppRunnerReleaseConfigPath = '/tmp/reviewed-cpp-runner-release.json'
for (const environmentName of ['production', 'staging']) {
  for (const dryRun of [false, true]) {
    const args = buildCppRunnerWranglerArgs(environmentName, {
      commit: exactRunnerReleaseCommit,
      configPath: cppRunnerReleaseConfigPath,
      dryRun,
    })
    const rolloutIndex = args.indexOf('--containers-rollout')
    if (rolloutIndex < 0 || args[rolloutIndex + 1] !== 'immediate') {
      throw new Error(`The ${environmentName} Practical C++ runner release is not an immediate rollout.`)
    }
    const aliasIndex = args.indexOf('--alias')
    const configIndex = args.indexOf('--config')
    if (aliasIndex < 0 || args[aliasIndex + 1] !== cppRunnerPublicationAlias) {
      throw new Error(`The ${environmentName} Practical C++ runner release does not pin the published runner registry.`)
    }
    if (!args.includes('--strict')) {
      throw new Error(`The ${environmentName} Practical C++ runner release is not strict.`)
    }
    if (configIndex < 0 || args[configIndex + 1] !== cppRunnerReleaseConfigPath) {
      throw new Error(`The ${environmentName} Practical C++ runner release does not use its generated configuration.`)
    }
    const tagIndex = args.indexOf('--tag')
    const messageIndex = args.indexOf('--message')
    if (
      tagIndex < 0
      || args[tagIndex + 1] !== `runner-cpp-${exactRunnerReleaseCommit}`
      || messageIndex < 0
      || !args[messageIndex + 1].includes(exactRunnerReleaseCommit)
    ) {
      throw new Error(`The ${environmentName} Practical C++ runner release does not record the exact commit.`)
    }
  }
}

const rollbackConfigPath = '/tmp/reviewed-runner-image-rollback.json'
const rollbackTargetProof = {
  releaseCommit: '1'.repeat(40),
  targetDigests: {
    RunnerCppSandbox: `sha256:${'2'.repeat(64)}`,
    RunnerCsharpSandbox: `sha256:${'3'.repeat(64)}`,
    RunnerJavaSandbox: `sha256:${'4'.repeat(64)}`,
    RunnerPythonSandbox: `sha256:${'5'.repeat(64)}`,
  },
}
const rollbackMetadata = runnerImageRollbackMetadata(exactRunnerReleaseCommit, rollbackTargetProof)
for (const environmentName of ['production', 'staging']) {
  for (const dryRun of [false, true]) {
    const args = buildRunnerImageRollbackWranglerArgs(environmentName, {
      commit: exactRunnerReleaseCommit,
      configPath: rollbackConfigPath,
      dryRun,
      targetProof: rollbackTargetProof,
    })
    const rolloutIndex = args.indexOf('--containers-rollout')
    const aliasIndex = args.indexOf('--alias')
    const configIndex = args.indexOf('--config')
    const tagIndex = args.indexOf('--tag')
    const messageIndex = args.indexOf('--message')
    if (rolloutIndex < 0 || args[rolloutIndex + 1] !== 'immediate') {
      throw new Error(`The ${environmentName} exact-digest rollback is not an immediate rollout.`)
    }
    if (!args.includes('--strict')) {
      throw new Error(`The ${environmentName} exact-digest rollback is not strict.`)
    }
    if (aliasIndex < 0 || args[aliasIndex + 1] !== cppRunnerPublicationAlias) {
      throw new Error(`The ${environmentName} exact-digest rollback does not pin the published runner registry.`)
    }
    if (configIndex < 0 || args[configIndex + 1] !== rollbackConfigPath) {
      throw new Error(`The ${environmentName} exact-digest rollback does not use its generated configuration.`)
    }
    if (
      tagIndex < 0
      || args[tagIndex + 1] !== rollbackMetadata.tag
      || messageIndex < 0
      || args[messageIndex + 1] !== rollbackMetadata.message
    ) {
      throw new Error(`The ${environmentName} exact-digest rollback does not record the exact commit.`)
    }
    if (args.includes('--dry-run') !== dryRun) {
      throw new Error(`The ${environmentName} exact-digest rollback dry-run mode is not exact.`)
    }
  }
}

const wranglerPath = fileURLToPath(new URL('../node_modules/.bin/wrangler', import.meta.url))
const wranglerHelp = execFileSync(wranglerPath, ['deploy', '--help'], { encoding: 'utf8' })
if (!wranglerHelp.includes('--containers-rollout') || !wranglerHelp.includes('without building or updating any Containers')) {
  throw new Error('The pinned Wrangler version does not support the reviewed container-free deployment mode.')
}

const expectedRunners = {
  RunnerCppSandbox: { binding: 'RUNNER_CPP', image: './Dockerfile.runner.cpp' },
  RunnerCsharpSandbox: { binding: 'RUNNER_CSHARP', image: './Dockerfile.runner.csharp' },
  RunnerJavaSandbox: { binding: 'RUNNER_JAVA', image: './Dockerfile.runner.java' },
  RunnerPythonSandbox: { binding: 'RUNNER_PYTHON', image: './Dockerfile.runner.python' },
}

for (const [configName, expectedInstances] of [
  ['wrangler.jsonc', 4],
  ['wrangler.staging.jsonc', 2],
]) {
  const config = JSON.parse(readFileSync(new URL(`../${configName}`, import.meta.url), 'utf8'))
  if (!Array.isArray(config.containers) || config.containers.length !== 4) {
    throw new Error(`${configName} must declare exactly four runner containers.`)
  }
  const classes = config.containers.map((container) => container.class_name)
  if (new Set(classes).size !== 4) {
    throw new Error(`${configName} contains a duplicate runner class.`)
  }
  for (const [className, expected] of Object.entries(expectedRunners)) {
    const container = config.containers.find((candidate) => candidate.class_name === className)
    if (
      !container
      || container.image !== expected.image
      || container.instance_type !== 'basic'
      || container.max_instances !== expectedInstances
    ) {
      throw new Error(`${configName} has an unreviewed container mapping for ${className}.`)
    }
    const matchingBindings = config.durable_objects?.bindings?.filter((binding) => (
      binding.name === expected.binding && binding.class_name === className
    )) ?? []
    if (matchingBindings.length !== 1) {
      throw new Error(`${configName} does not bind ${expected.binding} exactly once to ${className}.`)
    }
  }
}

const cppImage = readFileSync(new URL('../Dockerfile.runner.cpp', import.meta.url), 'utf8')
if (!cppImage.includes('CppCollectionsAnalyzer.py')) {
  throw new Error('The private C++ analyzer marker is missing, so the public-site freeze check no longer proves the intended boundary.')
}

for (const environmentName of ['production', 'staging']) {
  const dryRun = execFileSync(
    wranglerPath,
    buildWranglerDeployArgs(environmentName, { dryRun: true }),
    {
      encoding: 'utf8',
      env: {
        ...process.env,
        CLOUDFLARE_API_TOKEN: 'intentionally-invalid-public-site-dry-run',
        WRANGLER_DOCKER_BIN: '/bin/false',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  )
  if (!dryRun.includes('--dry-run: exiting now.')) {
    throw new Error(`The ${environmentName} public-site canary did not complete its Wrangler dry run.`)
  }
}

console.log('Public-site deployment contract passed. Default releases pin the published runner registry, freeze all runner container images, and both dry runs succeed with Docker disabled.')
