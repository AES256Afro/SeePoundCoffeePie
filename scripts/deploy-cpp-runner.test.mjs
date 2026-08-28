import { existsSync, readFileSync, statSync } from 'node:fs'

import { describe, expect, it, vi } from 'vitest'

import { environmentContainerSnapshot } from './deploy-public-site.mjs'
import {
  CPP_STAGING_REGRESSION_PROOF_MAX_AGE_MS,
  createCppStagingRegressionProof,
} from './cpp-runner-staging-proof.mjs'
import {
  assertNonCppRunnersUnchanged,
  assertPausedRunnerStatus,
  buildCppOnlyReleaseConfig,
  buildCppRunnerWranglerArgs,
  cppRunnerPublicationAlias,
  cppRunnerReleaseMetadata,
  cppRunnerRolloutComplete,
  parseCppRunnerReleaseArgs,
  rollbackGuidance,
  runCppRunnerRelease,
  safeCommandOutput,
  waitForCppRunnerRollout,
  withTemporaryCppRunnerConfig,
} from './deploy-cpp-runner.mjs'

const commit = '716bd4acacbcaf892e7710cde3f38451bf9d2c90'
const proofNowMilliseconds = Date.parse('2026-08-28T12:00:00.000Z')
const recordedStagingVersion = '33333333-3333-4333-8333-333333333333'
const releaseConfigPath = '/tmp/reviewed-cpp-runner-release.json'
const wranglerCommand = ['npx', 'wrangler'].join(' ')
const productionNames = [
  'see-pound-coffee-pie-runnerpythonsandbox',
  'see-pound-coffee-pie-runnercppsandbox',
  'see-pound-coffee-pie-runnercsharpsandbox',
  'see-pound-coffee-pie-runnerjavasandbox',
]
const stagingNames = productionNames.map((name) => name.replace(
  'see-pound-coffee-pie-',
  'see-pound-coffee-pie-phase2-staging-',
))

function containerRow(name, index) {
  return {
    id: `00000000-0000-4000-8000-${String(index).padStart(12, '0')}`,
    image: `registry.cloudflare.com/account/${name}@sha256:${String(index).repeat(64)}`,
    instances: 4,
    name,
    state: 'ready',
    updated_at: `2026-08-26T0${index}:00:00.000Z`,
    version: index,
  }
}

function beforeSnapshot(environmentName = 'production') {
  const names = environmentName === 'staging' ? stagingNames : productionNames
  return environmentContainerSnapshot(
    names.map((name, index) => ({
      ...containerRow(name, index + 1),
      instances: environmentName === 'staging' ? 2 : 4,
    })),
    environmentName,
  )
}

function completedSnapshot(before) {
  return before.map((row) => row.name.endsWith('runnercppsandbox')
    ? {
        ...row,
        image: row.image.replace(/sha256:[0-9a-f]{64}$/u, `sha256:${'a'.repeat(64)}`),
        updated_at: '2026-08-28T12:00:00.000Z',
        version: row.version + 1,
      }
    : { ...row })
}

function baseConfig(environmentName = 'production') {
  const filename = environmentName === 'staging' ? 'wrangler.staging.jsonc' : 'wrangler.jsonc'
  return JSON.parse(readFileSync(new URL(`../${filename}`, import.meta.url), 'utf8'))
}

function stagingRegressionProof({
  completedAt = new Date(proofNowMilliseconds).toISOString(),
  containers = beforeSnapshot('staging'),
  releaseCommit = commit,
  workerVersion = recordedStagingVersion,
} = {}) {
  return createCppStagingRegressionProof({
    ci: {
      conclusion: 'success',
      event: 'push',
      headSha: releaseCommit,
      runId: 33000000001,
      status: 'completed',
      workflow: 'CI',
    },
    commit: releaseCommit,
    completedAt,
    containers,
    workerVersion,
  })
}

describe('Practical C++ runner release arguments', () => {
  it('requires one exact environment and accepts only one dry-run flag', () => {
    expect(parseCppRunnerReleaseArgs(['production'])).toEqual({
      dryRun: false,
      environmentName: 'production',
    })
    expect(parseCppRunnerReleaseArgs(['staging', '--dry-run'])).toEqual({
      dryRun: true,
      environmentName: 'staging',
    })
    expect(() => parseCppRunnerReleaseArgs([])).toThrow(/production or staging/iu)
    expect(() => parseCppRunnerReleaseArgs(['preview'])).toThrow(/production or staging/iu)
    expect(() => parseCppRunnerReleaseArgs(['toString'])).toThrow(/production or staging/iu)
    expect(() => parseCppRunnerReleaseArgs(['production', '--force'])).toThrow(/unsupported/iu)
    expect(() => parseCppRunnerReleaseArgs(['production', '--dry-run', '--dry-run'])).toThrow(/unsupported/iu)
  })

  it('uses an immediate strict rollout and the exact published runner alias', () => {
    const expectedAlias = '../data/controlled-runner-publication:./src/data/runner-publication.with-cpp.ts'
    expect(cppRunnerPublicationAlias).toBe(expectedAlias)
    for (const environmentName of ['production', 'staging']) {
      const args = buildCppRunnerWranglerArgs(environmentName, {
        commit,
        configPath: releaseConfigPath,
      })
      expect(args).toEqual(expect.arrayContaining([
        '--containers-rollout',
        'immediate',
        '--strict',
        '--old-asset-ttl',
        '900',
        '--alias',
        expectedAlias,
      ]))
      expect(args).not.toContain('gradual')
      expect(args).not.toContain('none')
    }
    expect(buildCppRunnerWranglerArgs('production', {
      commit,
      configPath: releaseConfigPath,
    })).not.toContain('wrangler.staging.jsonc')
    expect(buildCppRunnerWranglerArgs('staging', {
      commit,
      configPath: releaseConfigPath,
    })).toEqual(expect.arrayContaining([
      '--config',
      releaseConfigPath,
    ]))
    expect(() => buildCppRunnerWranglerArgs('staging', {
      commit,
      configPath: 'relative.json',
    })).toThrow(/absolute generated configuration/iu)
  })

  it('accepts only an explicitly configured and paused public runner status', () => {
    expect(() => assertPausedRunnerStatus('staging', 200, {
      configured: true,
      enabled: false,
      paused: true,
      version: 1,
    })).not.toThrow()
    expect(() => assertPausedRunnerStatus('staging', 200, {
      configured: false,
      enabled: false,
      paused: false,
      version: 1,
    })).toThrow(/configured and paused/iu)
    expect(() => assertPausedRunnerStatus('production', 200, {
      configured: true,
      enabled: false,
      paused: false,
      version: 1,
    })).toThrow(/configured and paused/iu)
  })

  it('uses the full commit in both release annotations', () => {
    const metadata = cppRunnerReleaseMetadata(commit)
    expect(metadata).toEqual({
      message: `Practical C++ runner release from exact commit ${commit}.`,
      tag: `runner-cpp-${commit}`,
    })
    expect(() => cppRunnerReleaseMetadata(commit.slice(0, 12))).toThrow(/40-character/iu)

    const args = buildCppRunnerWranglerArgs('staging', {
      commit,
      configPath: releaseConfigPath,
      dryRun: true,
    })
    expect(args).toContain('--dry-run')
    expect(args.slice(args.indexOf('--tag'), args.indexOf('--tag') + 2)).toEqual([
      '--tag',
      metadata.tag,
    ])
    expect(args.slice(args.indexOf('--message'), args.indexOf('--message') + 2)).toEqual([
      '--message',
      metadata.message,
    ])
  })
})

describe('C++-only generated release configuration', () => {
  it('pins Python, C#, and Java to their exact live images while only C++ uses its Dockerfile', () => {
    const live = beforeSnapshot('production')
    const config = buildCppOnlyReleaseConfig('production', baseConfig('production'), live)
    const byClass = new Map(config.containers.map((container) => [container.class_name, container]))

    expect(byClass.get('RunnerCppSandbox').image).toMatch(/\/Dockerfile\.runner\.cpp$/u)
    for (const [className, suffix] of [
      ['RunnerCsharpSandbox', 'runnercsharpsandbox'],
      ['RunnerJavaSandbox', 'runnerjavasandbox'],
      ['RunnerPythonSandbox', 'runnerpythonsandbox'],
    ]) {
      expect(byClass.get(className).image).toBe(
        live.find(({ name }) => name.endsWith(suffix)).image,
      )
      expect(byClass.get(className).image).toMatch(/^registry\.cloudflare\.com\/account\//u)
    }
    expect(config.containers.filter(({ image }) => image.includes('Dockerfile.runner'))).toHaveLength(1)
  })

  it('rejects external registries, wrong repositories, and mixed Cloudflare accounts', () => {
    const external = beforeSnapshot('staging')
    external[0].image = external[0].image.replace(
      'registry.cloudflare.com/account/',
      'docker.io/attacker/',
    )
    expect(() => buildCppOnlyReleaseConfig('staging', baseConfig('staging'), external))
      .toThrow(/registry\.cloudflare\.com/iu)

    const wrongRepository = beforeSnapshot('staging')
    wrongRepository[0].image = wrongRepository[0].image.replace(
      `/${wrongRepository[0].name}@`,
      '/attacker-runner@',
    )
    expect(() => buildCppOnlyReleaseConfig('staging', baseConfig('staging'), wrongRepository))
      .toThrow(/own digest-pinned image/iu)

    const mixedAccount = beforeSnapshot('staging')
    mixedAccount[0].image = mixedAccount[0].image.replace(
      'registry.cloudflare.com/account/',
      'registry.cloudflare.com/another-account/',
    )
    expect(() => buildCppOnlyReleaseConfig('staging', baseConfig('staging'), mixedAccount))
      .toThrow(/one Cloudflare registry account/iu)
  })

  it('writes the generated config with mode 0600 and removes it after use', async () => {
    let temporaryPath
    await withTemporaryCppRunnerConfig({ reviewed: true }, async (configPath) => {
      temporaryPath = configPath
      expect(statSync(configPath).mode & 0o777).toBe(0o600)
      expect(JSON.parse(readFileSync(configPath, 'utf8'))).toEqual({ reviewed: true })
    })
    expect(existsSync(temporaryPath)).toBe(false)
  })
})

describe('Practical C++ runner rollout proof', () => {
  it('accepts only a stable-ID C++ digest, version, and update-time advance', () => {
    const before = beforeSnapshot()
    const after = completedSnapshot(before)

    expect(() => assertNonCppRunnersUnchanged(before, after)).not.toThrow()
    expect(cppRunnerRolloutComplete(before, after)).toBe(true)
    expect(cppRunnerRolloutComplete(before, structuredClone(before))).toBe(false)
  })

  it('rejects a change to Python, C#, or Java', () => {
    const before = beforeSnapshot()
    const after = completedSnapshot(before)
    const python = after.find((row) => row.name.endsWith('runnerpythonsandbox'))
    python.version += 1
    expect(() => cppRunnerRolloutComplete(before, after)).toThrow(/non-C\+\+ runner/iu)
  })

  it('rejects a changed C++ application identity or a backward version', () => {
    const before = beforeSnapshot()
    const changedId = completedSnapshot(before)
    const changedIdCpp = changedId.find((row) => row.name.endsWith('runnercppsandbox'))
    changedIdCpp.id = '99999999-9999-4999-8999-999999999999'
    expect(() => cppRunnerRolloutComplete(before, changedId)).toThrow(/application ID changed/iu)

    const backward = completedSnapshot(before)
    const backwardCpp = backward.find((row) => row.name.endsWith('runnercppsandbox'))
    backwardCpp.version = 1
    expect(() => cppRunnerRolloutComplete(before, backward)).toThrow(/moved backward/iu)
  })

  it('does not treat a different timestamp spelling for the same instant as an advance', () => {
    const before = beforeSnapshot()
    const after = completedSnapshot(before)
    const beforeCpp = before.find((row) => row.name.endsWith('runnercppsandbox'))
    const afterCpp = after.find((row) => row.name.endsWith('runnercppsandbox'))
    afterCpp.updated_at = new Date(beforeCpp.updated_at).toISOString().replace('Z', '+00:00')

    expect(afterCpp.updated_at).not.toBe(beforeCpp.updated_at)
    expect(Date.parse(afterCpp.updated_at)).toBe(Date.parse(beforeCpp.updated_at))
    expect(cppRunnerRolloutComplete(before, after)).toBe(false)
  })

  it('waits through provisioning and requires two identical completed samples', async () => {
    const before = beforeSnapshot()
    const after = completedSnapshot(before)
    const readReadySnapshot = vi.fn()
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(structuredClone(before))
      .mockResolvedValueOnce(structuredClone(after))
      .mockResolvedValueOnce(structuredClone(after))
    const sleep = vi.fn()

    await expect(waitForCppRunnerRollout({
      before,
      readReadySnapshot,
      sleep,
    })).resolves.toEqual(after)
    expect(readReadySnapshot).toHaveBeenCalledTimes(4)
    expect(sleep).toHaveBeenCalledTimes(3)
  })

  it('fails immediately if a non-C++ application changes during polling', async () => {
    const before = beforeSnapshot()
    const after = completedSnapshot(before)
    const java = after.find((row) => row.name.endsWith('runnerjavasandbox'))
    java.updated_at = '2026-08-28T12:30:00.000Z'

    await expect(waitForCppRunnerRollout({
      attempts: 2,
      before,
      readReadySnapshot: vi.fn().mockResolvedValue(after),
      sleep: vi.fn(),
    })).rejects.toThrow(/non-C\+\+ runner/iu)
  })

  it('times out when the C++ digest does not change', async () => {
    const before = beforeSnapshot()
    await expect(waitForCppRunnerRollout({
      attempts: 2,
      before,
      readReadySnapshot: vi.fn().mockResolvedValue(structuredClone(before)),
      sleep: vi.fn(),
    })).rejects.toThrow(/did not complete/iu)
  })
})

describe('failure guidance', () => {
  const previousVersion = '11111111-1111-4111-8111-111111111111'
  const candidateVersion = '22222222-2222-4222-8222-222222222222'

  it('prints the previous Worker and C++ image without claiming Worker rollback restores the image', () => {
    const guidance = rollbackGuidance('staging', previousVersion, beforeSnapshot(), {
      activeVersion: candidateVersion,
      candidateVersion,
    })
    expect(guidance).toContain(`Previous active Worker version: ${previousVersion}`)
    expect(guidance).toContain('Previous C++ image: registry.cloudflare.com/')
    expect(guidance).toContain('see-pound-coffee-pie-runnerpythonsandbox: registry.cloudflare.com/')
    expect(guidance).toContain('does not prove that the previous C++ image was restored')
    expect(guidance).toContain('restore every changed image')
    expect(guidance).toContain('exact recorded registry image URI')
    expect(guidance).toContain('Rebuilding old source is not proof')
    expect(guidance).toContain('reviewed commit on main')
    expect(guidance).toContain('Do not use this forward-release wrapper')
    expect(guidance).toContain('--config wrangler.staging.jsonc')
    expect(guidance).toContain('Do not reopen execution')
  })

  it('omits a staging config from production rollback guidance', () => {
    expect(rollbackGuidance('production', previousVersion, beforeSnapshot(), {
      activeVersion: candidateVersion,
      candidateVersion,
    }))
      .not.toContain('wrangler.staging.jsonc')
  })

  it('refuses to print a rollback command after a superseding deployment', () => {
    const guidance = rollbackGuidance('production', previousVersion, beforeSnapshot(), {
      activeVersion: '33333333-3333-4333-8333-333333333333',
      candidateVersion,
    })
    expect(guidance).toContain('Do not run a Worker rollback command')
    expect(guidance).not.toContain(`${wranglerCommand} rollback`)
  })
})

describe('sanitized child-process output', () => {
  it('never includes captured output or command arguments in an error', () => {
    const sentinel = 'https://credential@example.invalid/private-token'
    const run = vi.fn(() => {
      const error = new Error(`Command failed: ${sentinel}`)
      error.stderr = Buffer.from(`secret stderr ${sentinel}`)
      throw error
    })

    let message = ''
    try {
      safeCommandOutput('git', ['ls-remote', sentinel], run)
    } catch (error) {
      message = error.message
    }
    expect(message).toBe('A required local or Cloudflare command failed. Captured command output was suppressed.')
    expect(message).not.toContain(sentinel)
  })
})

describe('fail-closed release orchestration', () => {
  const previousVersion = '11111111-1111-4111-8111-111111111111'
  const candidateVersion = '22222222-2222-4222-8222-222222222222'
  const stagingVersion = recordedStagingVersion

  function dependencies(overrides = {}) {
    const before = beforeSnapshot('staging')
    const after = completedSnapshot(before)
    return {
      currentCommit: vi.fn(() => commit),
      error: vi.fn(),
      loadStagingRegressionProof: vi.fn(() => stagingRegressionProof()),
      loadCppRunnerBaseConfig: vi.fn((environmentName) => baseConfig(environmentName)),
      log: vi.fn(),
      now: vi.fn(() => proofNowMilliseconds),
      parseWranglerVersionId: vi.fn(() => candidateVersion),
      printSnapshot: vi.fn(),
      readActiveDeploymentVersion: vi.fn()
        .mockReturnValueOnce(previousVersion)
        .mockReturnValueOnce(previousVersion)
        .mockReturnValue(candidateVersion),
      readContainerSnapshot: vi.fn(() => before),
      readReadyContainerSnapshot: vi.fn(() => after),
      requirePausedRunner: vi.fn(),
      requirePausedRunnerEndpoint: vi.fn().mockResolvedValue(undefined),
      runWranglerDeploy: vi.fn(() => `Current Version ID: ${candidateVersion}`),
      verifiedReleaseCommit: vi.fn(() => commit),
      verifyCandidateRunnerBoundary: vi.fn(),
      verifyRunnerImages: vi.fn(),
      verifyVersionMetadata: vi.fn(),
      verifyWranglerSupport: vi.fn(),
      waitForActiveVersion: vi.fn().mockResolvedValue(candidateVersion),
      waitForRunnerRollout: vi.fn().mockResolvedValue(after),
      withTemporaryCppRunnerConfig: vi.fn(async (_config, action) => action(releaseConfigPath)),
      ...overrides,
    }
  }

  function productionDependencies(overrides = {}) {
    const staging = beforeSnapshot('staging')
    const production = beforeSnapshot('production')
    let productionVersionReads = 0
    return dependencies({
      loadStagingRegressionProof: vi.fn(() => stagingRegressionProof({ containers: staging })),
      readActiveDeploymentVersion: vi.fn((environmentName) => {
        if (environmentName === 'staging') return stagingVersion
        productionVersionReads += 1
        return productionVersionReads <= 2 ? previousVersion : candidateVersion
      }),
      readContainerSnapshot: vi.fn((environmentName) => (
        environmentName === 'staging' ? staging : production
      )),
      ...overrides,
    })
  }

  it('keeps dry-run local and includes the Wrangler dry-run flag', async () => {
    const deps = dependencies()
    deps.requirePausedRunner.mockImplementation(() => { throw new Error('remote pause read was called') })

    await expect(runCppRunnerRelease(['staging', '--dry-run'], deps)).resolves.toBeUndefined()
    expect(deps.runWranglerDeploy).toHaveBeenCalledOnce()
    expect(deps.runWranglerDeploy.mock.calls[0][0]).toContain('--dry-run')
    expect(deps.runWranglerDeploy.mock.calls[0][0]).toEqual(expect.arrayContaining([
      '--config',
      releaseConfigPath,
    ]))
    expect(deps.withTemporaryCppRunnerConfig).toHaveBeenCalledOnce()
    expect(deps.verifiedReleaseCommit).not.toHaveBeenCalled()
    expect(deps.loadStagingRegressionProof).not.toHaveBeenCalled()
    expect(deps.readActiveDeploymentVersion).not.toHaveBeenCalled()
    expect(deps.readContainerSnapshot).not.toHaveBeenCalled()
  })

  it('runs commit-bound image validation and repeats the exact git gate before mutation', async () => {
    const deps = dependencies()
    await expect(runCppRunnerRelease(['staging'], deps)).resolves.toBeUndefined()

    expect(deps.verifyRunnerImages).toHaveBeenCalledWith(commit)
    expect(deps.verifiedReleaseCommit).toHaveBeenCalledTimes(2)
    expect(deps.loadStagingRegressionProof).not.toHaveBeenCalled()
    expect(deps.runWranglerDeploy).toHaveBeenCalledOnce()
    const order = deps.verifiedReleaseCommit.mock.invocationCallOrder
    expect(order[1]).toBeLessThan(deps.runWranglerDeploy.mock.invocationCallOrder[0])
  })

  it('prevents non-C++ image rebuilds in the exact config passed to Wrangler', async () => {
    let generatedConfig
    const deps = dependencies({
      withTemporaryCppRunnerConfig: vi.fn(async (config, action) => {
        generatedConfig = config
        return action(releaseConfigPath)
      }),
    })

    await expect(runCppRunnerRelease(['staging'], deps)).resolves.toBeUndefined()
    const cpp = generatedConfig.containers.find(({ class_name: className }) => (
      className === 'RunnerCppSandbox'
    ))
    const nonCpp = generatedConfig.containers.filter(({ class_name: className }) => (
      className !== 'RunnerCppSandbox'
    ))
    expect(cpp.image).toMatch(/\/Dockerfile\.runner\.cpp$/u)
    expect(nonCpp).toHaveLength(3)
    expect(nonCpp.every(({ image }) => image.startsWith('registry.cloudflare.com/account/'))).toBe(true)
    expect(generatedConfig.containers.filter(({ image }) => image.includes('Dockerfile.runner')))
      .toHaveLength(1)
    expect(deps.runWranglerDeploy.mock.calls[0][0]).toEqual(expect.arrayContaining([
      '--config',
      releaseConfigPath,
    ]))
  })

  it.each([
    ['initial git gate', { verifiedReleaseCommit: vi.fn(() => { throw new Error('dirty') }) }],
    ['runner image gate', { verifyRunnerImages: vi.fn(() => { throw new Error('image failure') }) }],
    ['KV pause gate', { requirePausedRunner: vi.fn(() => { throw new Error('enabled') }) }],
    ['endpoint pause gate', { requirePausedRunnerEndpoint: vi.fn(() => Promise.reject(new Error('not paused'))) }],
    ['before Worker read', { readActiveDeploymentVersion: vi.fn(() => { throw new Error('no Worker') }) }],
    ['before container read', { readContainerSnapshot: vi.fn(() => { throw new Error('no containers') }) }],
  ])('never deploys after a failed %s', async (_label, override) => {
    const deps = dependencies(override)
    await expect(runCppRunnerRelease(['staging'], deps)).rejects.toThrow()
    expect(deps.runWranglerDeploy).not.toHaveBeenCalled()
  })

  it('never deploys when the live snapshot crosses Cloudflare registry accounts', async () => {
    const tampered = beforeSnapshot('staging')
    tampered[0].image = tampered[0].image.replace(
      'registry.cloudflare.com/account/',
      'registry.cloudflare.com/another-account/',
    )
    const deps = dependencies({ readContainerSnapshot: vi.fn(() => tampered) })
    await expect(runCppRunnerRelease(['staging'], deps))
      .rejects.toThrow(/one Cloudflare registry account/iu)
    expect(deps.runWranglerDeploy).not.toHaveBeenCalled()
  })

  it('refuses a late worktree or ref change immediately before mutation', async () => {
    const deps = dependencies({
      verifiedReleaseCommit: vi.fn()
        .mockReturnValueOnce(commit)
        .mockReturnValueOnce('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'),
    })
    await expect(runCppRunnerRelease(['staging'], deps)).rejects.toThrow(/changed after preflight/iu)
    expect(deps.runWranglerDeploy).not.toHaveBeenCalled()
  })

  it('requires same-commit staging metadata and carries its C++ digest into production proof', async () => {
    const staging = beforeSnapshot('staging')
    const productionBefore = beforeSnapshot()
    const productionAfter = completedSnapshot(productionBefore)
    const stagingDigest = staging.find((row) => row.name.endsWith('runnercppsandbox')).image.split('@')[1]
    productionAfter.find((row) => row.name.endsWith('runnercppsandbox')).image = productionAfter
      .find((row) => row.name.endsWith('runnercppsandbox')).image
      .replace(/sha256:[0-9a-f]{64}$/u, stagingDigest)
    let productionVersionReads = 0
    const deps = dependencies({
      readActiveDeploymentVersion: vi.fn((environmentName) => {
        if (environmentName === 'staging') return stagingVersion
        productionVersionReads += 1
        return productionVersionReads <= 2 ? previousVersion : candidateVersion
      }),
      readContainerSnapshot: vi.fn((environmentName) => (
        environmentName === 'staging' ? staging : productionBefore
      )),
      loadStagingRegressionProof: vi.fn(() => stagingRegressionProof({ containers: staging })),
      waitForRunnerRollout: vi.fn().mockResolvedValue(productionAfter),
    })

    await expect(runCppRunnerRelease(['production'], deps)).resolves.toBeUndefined()
    expect(deps.verifyVersionMetadata).toHaveBeenCalledWith(
      'staging',
      stagingVersion,
      cppRunnerReleaseMetadata(commit),
    )
    expect(deps.verifyVersionMetadata).toHaveBeenCalledTimes(4)
    expect(deps.loadStagingRegressionProof).toHaveBeenCalledTimes(2)
    expect(deps.waitForRunnerRollout.mock.calls[0][0].expectedDigest).toBe(stagingDigest)
    const repeatedProofOrder = deps.loadStagingRegressionProof.mock.invocationCallOrder
    expect(repeatedProofOrder[1]).toBeLessThan(deps.runWranglerDeploy.mock.invocationCallOrder[0])
    expect(repeatedProofOrder[1]).toBeGreaterThan(
      deps.verifiedReleaseCommit.mock.invocationCallOrder.at(-1),
    )
  })

  it('does not deploy production when staging proof fails', async () => {
    const deps = dependencies({
      verifyVersionMetadata: vi.fn((environmentName) => {
        if (environmentName === 'staging') throw new Error('wrong staging commit')
      }),
      readActiveDeploymentVersion: vi.fn(() => stagingVersion),
    })
    await expect(runCppRunnerRelease(['production'], deps)).rejects.toThrow(/wrong staging commit/iu)
    expect(deps.runWranglerDeploy).not.toHaveBeenCalled()
  })

  it.each([
    ['missing', vi.fn(() => { throw new Error('missing staging regression proof') }), /missing staging regression proof/iu],
    [
      'stale',
      vi.fn(() => stagingRegressionProof({
        completedAt: new Date(
          proofNowMilliseconds - CPP_STAGING_REGRESSION_PROOF_MAX_AGE_MS - 1,
        ).toISOString(),
      })),
      /stale/iu,
    ],
    [
      'wrong-commit',
      vi.fn(() => stagingRegressionProof({ releaseCommit: 'a'.repeat(40) })),
      /release commit/iu,
    ],
    [
      'wrong-Worker',
      vi.fn(() => stagingRegressionProof({
        workerVersion: '44444444-4444-4444-8444-444444444444',
      })),
      /active Worker metadata/iu,
    ],
  ])('requires a readable, fresh, same-commit, same-Worker %s proof before production', async (
    _label,
    loadStagingRegressionProof,
    expectedError,
  ) => {
    const deps = productionDependencies({ loadStagingRegressionProof })
    await expect(runCppRunnerRelease(['production'], deps)).rejects.toThrow(expectedError)
    expect(deps.runWranglerDeploy).not.toHaveBeenCalled()
  })

  it('rejects a recorded proof whose complete four-container snapshot or C++ digest changed', async () => {
    const recorded = beforeSnapshot('staging')
    const live = structuredClone(recorded)
    const cpp = live.find(({ name }) => name.endsWith('runnercppsandbox'))
    cpp.image = cpp.image.replace(/sha256:[0-9a-f]{64}$/u, `sha256:${'e'.repeat(64)}`)
    cpp.updated_at = '2026-08-28T11:00:00.000Z'
    cpp.version += 1
    const deps = productionDependencies({
      loadStagingRegressionProof: vi.fn(() => stagingRegressionProof({ containers: recorded })),
      readContainerSnapshot: vi.fn((environmentName) => (
        environmentName === 'staging' ? live : beforeSnapshot('production')
      )),
    })

    await expect(runCppRunnerRelease(['production'], deps)).rejects.toThrow(/no longer match/iu)
    expect(deps.runWranglerDeploy).not.toHaveBeenCalled()
  })

  it('rereads the exact proof after production preflight and refuses a changed record', async () => {
    const staging = beforeSnapshot('staging')
    const first = stagingRegressionProof({ containers: staging })
    const secondCompletedAt = new Date(proofNowMilliseconds + 1_000).toISOString()
    const second = stagingRegressionProof({
      completedAt: secondCompletedAt,
      containers: staging,
    })
    const deps = productionDependencies({
      loadStagingRegressionProof: vi.fn()
        .mockReturnValueOnce(first)
        .mockReturnValueOnce(second),
      now: vi.fn(() => proofNowMilliseconds + 2_000),
      readContainerSnapshot: vi.fn((environmentName) => (
        environmentName === 'staging' ? staging : beforeSnapshot('production')
      )),
    })

    await expect(runCppRunnerRelease(['production'], deps)).rejects.toThrow(/proof changed/iu)
    expect(deps.loadStagingRegressionProof).toHaveBeenCalledTimes(2)
    expect(deps.runWranglerDeploy).not.toHaveBeenCalled()
  })

  it('does not recommend rollback when another Worker supersedes the candidate', async () => {
    const unrelatedVersion = '44444444-4444-4444-8444-444444444444'
    const deps = dependencies({
      readActiveDeploymentVersion: vi.fn()
        .mockReturnValueOnce(previousVersion)
        .mockReturnValue(unrelatedVersion),
    })
    await expect(runCppRunnerRelease(['staging'], deps)).rejects.toThrow(/active staging Worker changed/iu)
    expect(deps.error.mock.calls.flat().join('\n')).toContain('Do not run a Worker rollback command')
    expect(deps.error.mock.calls.flat().join('\n')).not.toContain(`${wranglerCommand} rollback`)
  })
})
