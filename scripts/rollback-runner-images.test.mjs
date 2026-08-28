import { describe, expect, it, vi } from 'vitest'

import { environmentContainerSnapshot } from './deploy-public-site.mjs'
import {
  cppRunnerPublicationAlias,
  cppRunnerReleaseMetadata,
  runnerRollbackEvidence,
} from './deploy-cpp-runner.mjs'
import {
  assertRollbackTargetsApplicable,
  buildExactDigestRollbackConfig,
  buildRunnerImageRollbackWranglerArgs,
  cloudflareRunnerImageReference,
  parseRunnerImageRollbackArgs,
  runRunnerImageRollback,
  runnerImageRollbackComplete,
  runnerImageRollbackFailureGuidance,
  runnerImageRollbackMetadata,
  runnerImageRollbackTargetProof,
  validateRunnerRollbackEvidence,
  waitForRunnerImageRollback,
} from './rollback-runner-images.mjs'

const commit = '716bd4acacbcaf892e7710cde3f38451bf9d2c90'
const releaseCommit = '816bd4acacbcaf892e7710cde3f38451bf9d2c91'
const previousWorkerVersion = '11111111-1111-4111-8111-111111111111'
const candidateWorkerVersion = '22222222-2222-4222-8222-222222222222'
const rollbackWorkerVersion = '33333333-3333-4333-8333-333333333333'
const stagingRollbackVersion = '44444444-4444-4444-8444-444444444444'
const wranglerCommand = ['npx', 'wrangler'].join(' ')
const suffixes = [
  'runnerpythonsandbox',
  'runnercppsandbox',
  'runnercsharpsandbox',
  'runnerjavasandbox',
]

function snapshot(environmentName, digestOffset = 0) {
  const environment = environmentName === 'staging'
    ? { instances: 2, prefix: 'see-pound-coffee-pie-phase2-staging-' }
    : { instances: 4, prefix: 'see-pound-coffee-pie-' }
  return environmentContainerSnapshot(suffixes.map((suffix, index) => {
    const number = index + 1 + digestOffset
    const name = `${environment.prefix}${suffix}`
    return {
      id: `00000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`,
      image: `registry.cloudflare.com/account/${name}@sha256:${number.toString(16).repeat(64)}`,
      instances: environment.instances,
      name,
      state: 'ready',
      updated_at: `2026-08-2${index + 1}T12:00:00.000Z`,
      version: index + 1,
    }
  }), environmentName)
}

function evidence(environmentName = 'staging') {
  return runnerRollbackEvidence({
    beforeContainers: snapshot(environmentName),
    candidateWorkerVersion,
    environmentName,
    previousWorkerVersion,
    releaseCommit,
  })
}

function currentSnapshot(environmentName = 'staging') {
  const current = structuredClone(snapshot(environmentName))
  const cpp = current.find(({ name }) => name.endsWith('runnercppsandbox'))
  cpp.image = cpp.image.replace(/sha256:[0-9a-f]{64}$/u, `sha256:${'a'.repeat(64)}`)
  cpp.updated_at = '2026-08-28T12:00:00.000Z'
  cpp.version += 1
  return current
}

function restoredSnapshot(environmentName = 'staging') {
  const target = snapshot(environmentName)
  const current = currentSnapshot(environmentName)
  return target.map((row) => row.name.endsWith('runnercppsandbox')
    ? {
        ...row,
        updated_at: '2026-08-29T12:00:00.000Z',
        version: current.find(({ name }) => name === row.name).version + 1,
      }
    : row)
}

function baseConfig(environmentName = 'staging') {
  const instances = environmentName === 'staging' ? 2 : 4
  return {
    $schema: './node_modules/wrangler/config-schema.json',
    assets: { directory: './dist' },
    containers: [
      { class_name: 'RunnerPythonSandbox', image: './Dockerfile.runner.python', instance_type: 'basic', max_instances: instances },
      { class_name: 'RunnerCppSandbox', image: './Dockerfile.runner.cpp', instance_type: 'basic', max_instances: instances },
      { class_name: 'RunnerCsharpSandbox', image: './Dockerfile.runner.csharp', instance_type: 'basic', max_instances: instances },
      { class_name: 'RunnerJavaSandbox', image: './Dockerfile.runner.java', instance_type: 'basic', max_instances: instances },
    ],
    d1_databases: [{ migrations_dir: 'migrations' }],
    main: './src/worker.ts',
  }
}

describe('exact-digest rollback inputs', () => {
  it('requires one exact environment, one evidence file, and at most one dry-run flag', () => {
    expect(parseRunnerImageRollbackArgs(['staging', './evidence.json'], '/repo')).toEqual({
      dryRun: false,
      environmentName: 'staging',
      evidencePath: '/repo/evidence.json',
    })
    expect(parseRunnerImageRollbackArgs([
      'production',
      '--dry-run',
      './evidence.json',
    ], '/repo').dryRun).toBe(true)
    expect(() => parseRunnerImageRollbackArgs(['preview', './evidence.json'])).toThrow(/production or staging/iu)
    expect(() => parseRunnerImageRollbackArgs(['staging'])).toThrow(/exactly one rollback evidence/iu)
    expect(() => parseRunnerImageRollbackArgs(['staging', 'one.json', 'two.json'])).toThrow(/exactly one/iu)
    expect(() => parseRunnerImageRollbackArgs([
      'staging',
      '--dry-run',
      '--dry-run',
      'one.json',
    ])).toThrow(/exactly one/iu)
  })

  it('accepts only exact, environment-specific, digest-pinned evidence', () => {
    const valid = evidence('production')
    expect(validateRunnerRollbackEvidence(valid, 'production')).toEqual(valid)
    expect(() => validateRunnerRollbackEvidence({ ...valid, environment: 'staging' }, 'production'))
      .toThrow(/version 1 evidence for production/iu)
    expect(() => validateRunnerRollbackEvidence({ ...valid, surprise: true }, 'production'))
      .toThrow(/unreviewed fields/iu)
    const tampered = structuredClone(valid)
    tampered.beforeContainers[0].image = './Dockerfile.runner.python'
    expect(() => validateRunnerRollbackEvidence(tampered, 'production')).toThrow(/digest-pinned/iu)

    const externalRegistry = structuredClone(valid)
    externalRegistry.beforeContainers[0].image = externalRegistry.beforeContainers[0].image
      .replace('registry.cloudflare.com/account/', 'docker.io/attacker/')
    expect(() => validateRunnerRollbackEvidence(externalRegistry, 'production'))
      .toThrow(/registry\.cloudflare\.com/iu)
  })

  it('parses only the expected Cloudflare account repository', () => {
    const row = snapshot('staging')[0]
    expect(cloudflareRunnerImageReference(row.image, row.name)).toMatchObject({
      accountPrefix: 'account',
      repository: `registry.cloudflare.com/account/${row.name}`,
    })
    expect(() => cloudflareRunnerImageReference(
      row.image.replace(`/${row.name}@`, '/another-runner@'),
      row.name,
    )).toThrow(/exact registry\.cloudflare\.com account repository/iu)
  })

  it('generates a temporary config that pins all four exact registry image digests', () => {
    const plan = evidence('staging')
    const config = buildExactDigestRollbackConfig('staging', baseConfig(), plan)
    expect(config.$schema).toBeUndefined()
    expect(config.main).toMatch(/^\//u)
    expect(config.assets.directory).toMatch(/^\//u)
    expect(config.d1_databases[0].migrations_dir).toMatch(/^\//u)
    expect(config.containers.map(({ image }) => image).sort()).toEqual(
      plan.beforeContainers.map(({ image }) => image).sort(),
    )
    expect(config.containers.every(({ max_instances: instances }) => instances === 2)).toBe(true)
  })

  it('uses strict immediate rollout, exact metadata, and the published runner alias', () => {
    const configPath = '/tmp/runner-image-restore.json'
    const targetProof = runnerImageRollbackTargetProof('staging', evidence('staging'))
    const args = buildRunnerImageRollbackWranglerArgs('staging', {
      commit,
      configPath,
      dryRun: true,
      targetProof,
    })
    expect(args).toEqual(expect.arrayContaining([
      '--containers-rollout',
      'immediate',
      '--strict',
      '--alias',
      cppRunnerPublicationAlias,
      '--config',
      configPath,
      '--dry-run',
    ]))
    const metadata = runnerImageRollbackMetadata(commit, targetProof)
    expect(args[args.indexOf('--tag') + 1]).toBe(metadata.tag)
    expect(args[args.indexOf('--message') + 1]).toBe(metadata.message)
    expect(() => buildRunnerImageRollbackWranglerArgs('staging', {
      commit,
      configPath: 'relative.json',
      targetProof,
    })).toThrow(/absolute/iu)
    expect(() => runnerImageRollbackMetadata(commit)).toThrow(/forward release commit/iu)
  })

  it('binds rollback metadata to the forward release and environment-neutral per-class targets', () => {
    const stagingProof = runnerImageRollbackTargetProof('staging', evidence('staging'))
    const productionProof = runnerImageRollbackTargetProof('production', evidence('production'))
    expect(stagingProof).toEqual(productionProof)

    const metadata = runnerImageRollbackMetadata(commit, productionProof)
    const args = buildRunnerImageRollbackWranglerArgs('production', {
      commit,
      configPath: '/tmp/runner-image-restore.json',
      targetProof: productionProof,
    })
    expect(args[args.indexOf('--tag') + 1]).toBe(metadata.tag)
    expect(args[args.indexOf('--message') + 1]).toBe(metadata.message)

    const differentTargets = structuredClone(productionProof)
    differentTargets.targetDigests.RunnerCppSandbox = `sha256:${'f'.repeat(64)}`
    expect(runnerImageRollbackMetadata(commit, differentTargets)).not.toEqual(metadata)
    expect(runnerImageRollbackMetadata(commit, {
      ...productionProof,
      releaseCommit: 'a'.repeat(40),
    })).not.toEqual(metadata)
  })
})

describe('exact-digest rollback proof', () => {
  it('requires stable IDs and at least one image that needs restoration', () => {
    const target = snapshot('staging')
    expect(assertRollbackTargetsApplicable(currentSnapshot(), target, 'staging').target).toEqual(target)
    expect(() => assertRollbackTargetsApplicable(target, target, 'staging')).toThrow(/already matches/iu)
    const changedId = currentSnapshot()
    changedId[0].id = '99999999-9999-4999-8999-999999999999'
    expect(() => assertRollbackTargetsApplicable(changedId, target, 'staging')).toThrow(/evidence ID/iu)

    const crossAccount = structuredClone(target)
    crossAccount[0].image = crossAccount[0].image.replace(
      'registry.cloudflare.com/account/',
      'registry.cloudflare.com/another-account/',
    )
    expect(() => assertRollbackTargetsApplicable(currentSnapshot(), crossAccount, 'staging'))
      .toThrow(/current Cloudflare registry repository/iu)
  })

  it('restores changed images while requiring unaffected runners to remain byte-for-byte unchanged', () => {
    const current = currentSnapshot()
    const target = snapshot('staging')
    const restored = restoredSnapshot()
    expect(runnerImageRollbackComplete(current, target, restored, 'staging')).toBe(true)

    const collateral = structuredClone(restored)
    collateral.find(({ name }) => name.endsWith('runnerjavasandbox')).version += 1
    expect(runnerImageRollbackComplete(current, target, collateral, 'staging')).toBe(false)
  })

  it('waits for two identical ready restored snapshots', async () => {
    const restored = restoredSnapshot()
    const readReadySnapshot = vi.fn()
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(restored)
      .mockResolvedValueOnce(restored)
    await expect(waitForRunnerImageRollback({
      current: currentSnapshot(),
      environmentName: 'staging',
      readReadySnapshot,
      sleep: vi.fn(),
      target: snapshot('staging'),
    })).resolves.toEqual(restored)
    expect(readReadySnapshot).toHaveBeenCalledTimes(3)
  })

  it('prints a Worker rollback command only if this rollback candidate is still active', () => {
    const safe = runnerImageRollbackFailureGuidance(
      'staging',
      candidateWorkerVersion,
      currentSnapshot(),
      { activeVersion: rollbackWorkerVersion, rollbackCandidateVersion: rollbackWorkerVersion },
    )
    expect(safe).toContain(`${wranglerCommand} rollback ${candidateWorkerVersion}`)
    const superseded = runnerImageRollbackFailureGuidance(
      'staging',
      candidateWorkerVersion,
      currentSnapshot(),
      { activeVersion: stagingRollbackVersion, rollbackCandidateVersion: rollbackWorkerVersion },
    )
    expect(superseded).toContain('Do not run a Worker rollback command')
    expect(superseded).not.toContain(`${wranglerCommand} rollback`)
  })
})

describe('fail-closed rollback orchestration', () => {
  function dependencies(environmentName = 'staging', overrides = {}) {
    const current = currentSnapshot(environmentName)
    const target = snapshot(environmentName)
    const restored = restoredSnapshot(environmentName)
    return {
      currentCommit: vi.fn(() => commit),
      error: vi.fn(),
      loadRunnerRollbackPlan: vi.fn(() => ({
        baseConfig: baseConfig(environmentName),
        evidence: evidence(environmentName),
      })),
      log: vi.fn(),
      parseWranglerVersionId: vi.fn(() => rollbackWorkerVersion),
      readActiveDeploymentVersion: vi.fn()
        .mockReturnValueOnce(candidateWorkerVersion)
        .mockReturnValueOnce(candidateWorkerVersion)
        .mockReturnValue(rollbackWorkerVersion),
      readContainerSnapshot: vi.fn(() => current),
      readReadyContainerSnapshot: vi.fn(() => restored),
      requirePausedRunner: vi.fn(),
      requirePausedRunnerEndpoint: vi.fn().mockResolvedValue(undefined),
      runWranglerDeploy: vi.fn(() => `Current Version ID: ${rollbackWorkerVersion}`),
      verifiedReleaseCommit: vi.fn(() => commit),
      verifyCandidateRunnerBoundary: vi.fn(),
      verifyVersionMetadata: vi.fn(),
      verifyWranglerSupport: vi.fn(),
      waitForActiveVersion: vi.fn().mockResolvedValue(rollbackWorkerVersion),
      waitForRollback: vi.fn().mockResolvedValue(restored),
      withTemporaryRollbackConfig: vi.fn(async (_config, action) => action('/tmp/runner-image-restore.json')),
      ...overrides,
    }
  }

  it('keeps dry-run local and performs no Cloudflare reads', async () => {
    const deps = dependencies()
    deps.requirePausedRunner.mockImplementation(() => { throw new Error('remote read') })
    await expect(runRunnerImageRollback([
      'staging',
      '--dry-run',
      'evidence.json',
    ], deps)).resolves.toBeUndefined()
    expect(deps.runWranglerDeploy).toHaveBeenCalledOnce()
    expect(deps.runWranglerDeploy.mock.calls[0][0]).toContain('--dry-run')
    expect(deps.verifiedReleaseCommit).not.toHaveBeenCalled()
    expect(deps.readActiveDeploymentVersion).not.toHaveBeenCalled()
  })

  it('repeats clean-main, active Worker, metadata, and four-container proof before mutation', async () => {
    const deps = dependencies()
    await expect(runRunnerImageRollback(['staging', 'evidence.json'], deps)).resolves.toBeUndefined()
    expect(deps.verifiedReleaseCommit).toHaveBeenCalledTimes(2)
    expect(deps.readActiveDeploymentVersion).toHaveBeenCalledTimes(3)
    expect(deps.readContainerSnapshot).toHaveBeenCalledTimes(2)
    expect(deps.verifyVersionMetadata).toHaveBeenCalledWith(
      'staging',
      candidateWorkerVersion,
      cppRunnerReleaseMetadata(releaseCommit),
    )
    expect(deps.runWranglerDeploy).toHaveBeenCalledOnce()
    expect(deps.verifiedReleaseCommit.mock.invocationCallOrder[1])
      .toBeLessThan(deps.runWranglerDeploy.mock.invocationCallOrder[0])
  })

  it.each([
    ['initial git gate', { verifiedReleaseCommit: vi.fn(() => { throw new Error('dirty') }) }],
    ['KV pause gate', { requirePausedRunner: vi.fn(() => { throw new Error('enabled') }) }],
    ['endpoint pause gate', { requirePausedRunnerEndpoint: vi.fn(() => Promise.reject(new Error('open'))) }],
    ['candidate metadata', { verifyVersionMetadata: vi.fn(() => { throw new Error('wrong release') }) }],
    ['container read', { readContainerSnapshot: vi.fn(() => { throw new Error('unavailable') }) }],
  ])('never mutates Cloudflare after a failed %s', async (_label, override) => {
    const deps = dependencies('staging', override)
    await expect(runRunnerImageRollback(['staging', 'evidence.json'], deps)).rejects.toThrow()
    expect(deps.runWranglerDeploy).not.toHaveBeenCalled()
  })

  it('refuses a changed commit immediately before mutation', async () => {
    const deps = dependencies('staging', {
      verifiedReleaseCommit: vi.fn()
        .mockReturnValueOnce(commit)
        .mockReturnValueOnce('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'),
    })
    await expect(runRunnerImageRollback(['staging', 'evidence.json'], deps))
      .rejects.toThrow(/rollback commit changed/iu)
    expect(deps.runWranglerDeploy).not.toHaveBeenCalled()
  })

  it('requires and repeats a same-commit staging rollback before production mutation', async () => {
    const productionCurrent = currentSnapshot('production')
    const productionRestored = restoredSnapshot('production')
    const stagingContainers = restoredSnapshot('staging')
    let productionVersionReads = 0
    const deps = dependencies('production', {
      readActiveDeploymentVersion: vi.fn((environmentName) => {
        if (environmentName === 'staging') return stagingRollbackVersion
        productionVersionReads += 1
        return productionVersionReads <= 2 ? candidateWorkerVersion : rollbackWorkerVersion
      }),
      readContainerSnapshot: vi.fn((environmentName) => (
        environmentName === 'staging' ? stagingContainers : productionCurrent
      )),
      waitForRollback: vi.fn().mockResolvedValue(productionRestored),
    })
    await expect(runRunnerImageRollback(['production', 'evidence.json'], deps)).resolves.toBeUndefined()
    expect(deps.verifyVersionMetadata).toHaveBeenCalledWith(
      'staging',
      stagingRollbackVersion,
      runnerImageRollbackMetadata(
        commit,
        runnerImageRollbackTargetProof('production', evidence('production')),
      ),
    )
    expect(deps.verifyVersionMetadata).toHaveBeenCalledTimes(6)
  })

  it('refuses production when the same rollback commit staged a different forward release', async () => {
    const productionCurrent = currentSnapshot('production')
    const stagingContainers = restoredSnapshot('staging')
    const unrelatedStagingEvidence = evidence('staging')
    unrelatedStagingEvidence.releaseCommit = 'a'.repeat(40)
    const unrelatedStagingMetadata = runnerImageRollbackMetadata(
      commit,
      runnerImageRollbackTargetProof('staging', unrelatedStagingEvidence),
    )
    const deps = dependencies('production', {
      readActiveDeploymentVersion: vi.fn((environmentName) => (
        environmentName === 'staging' ? stagingRollbackVersion : candidateWorkerVersion
      )),
      readContainerSnapshot: vi.fn((environmentName) => (
        environmentName === 'staging' ? stagingContainers : productionCurrent
      )),
      verifyVersionMetadata: vi.fn((environmentName, _version, expectedMetadata) => {
        if (environmentName === 'staging' && expectedMetadata.message !== unrelatedStagingMetadata.message) {
          throw new Error('staging rollback metadata mismatch')
        }
      }),
    })

    await expect(runRunnerImageRollback(['production', 'evidence.json'], deps))
      .rejects.toThrow(/metadata mismatch/iu)
    expect(deps.runWranglerDeploy).not.toHaveBeenCalled()
  })

  it('refuses production when staging restored a different per-class target digest set', async () => {
    const productionCurrent = currentSnapshot('production')
    const stagingContainers = restoredSnapshot('staging')
    const stagingCpp = stagingContainers.find(({ name }) => name.endsWith('runnercppsandbox'))
    stagingCpp.image = stagingCpp.image.replace(/sha256:[0-9a-f]{64}$/u, `sha256:${'f'.repeat(64)}`)
    const deps = dependencies('production', {
      readActiveDeploymentVersion: vi.fn((environmentName) => (
        environmentName === 'staging' ? stagingRollbackVersion : candidateWorkerVersion
      )),
      readContainerSnapshot: vi.fn((environmentName) => (
        environmentName === 'staging' ? stagingContainers : productionCurrent
      )),
    })

    await expect(runRunnerImageRollback(['production', 'evidence.json'], deps))
      .rejects.toThrow(/exact per-class target digests/iu)
    expect(deps.runWranglerDeploy).not.toHaveBeenCalled()
  })

  it('does not emit a rollback command when another Worker supersedes the rollback candidate', async () => {
    const unrelatedVersion = '55555555-5555-4555-8555-555555555555'
    const deps = dependencies('staging', {
      readActiveDeploymentVersion: vi.fn()
        .mockReturnValueOnce(candidateWorkerVersion)
        .mockReturnValueOnce(candidateWorkerVersion)
        .mockReturnValue(unrelatedVersion),
    })
    await expect(runRunnerImageRollback(['staging', 'evidence.json'], deps))
      .rejects.toThrow(/another staging Worker/iu)
    const errors = deps.error.mock.calls.flat().join('\n')
    expect(errors).toContain('Do not run a Worker rollback command')
    expect(errors).not.toContain(`${wranglerCommand} rollback`)
  })
})
