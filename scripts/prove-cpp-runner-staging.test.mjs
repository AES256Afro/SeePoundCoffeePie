import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'

import { afterEach, describe, expect, it, vi } from 'vitest'

import { environmentContainerSnapshot } from './deploy-public-site.mjs'
import {
  CPP_STAGING_REGRESSION_CHECKS,
  CPP_STAGING_REGRESSION_PROOF_FILENAME,
  CPP_STAGING_REGRESSION_PROOF_MAX_AGE_MS,
  CPP_STAGING_REGRESSION_PROOF_SCHEMA,
  cppStagingRegressionProofPath,
  createCppStagingRegressionProof,
  invalidateCppStagingRegressionProof,
  loadCppStagingRegressionProof,
  validateCppStagingRegressionProof,
  writeCppStagingRegressionProof,
} from './cpp-runner-staging-proof.mjs'
import {
  parseCppStagingRegressionArgs,
  parseSuccessfulExactCommitCi,
  requireStagingRunnerState,
  runCppStagingRegressionProof,
  stagingRunnerKvPutArgs,
  waitForStableStagingRelease,
} from './prove-cpp-runner-staging.mjs'

const commit = '716bd4acacbcaf892e7710cde3f38451bf9d2c90'
const workerVersion = '11111111-1111-4111-8111-111111111111'
const nowMilliseconds = Date.parse('2026-08-28T12:00:00.000Z')
const stagingNames = [
  'runnerpythonsandbox',
  'runnercppsandbox',
  'runnercsharpsandbox',
  'runnerjavasandbox',
].map((suffix) => `see-pound-coffee-pie-phase2-staging-${suffix}`)
const temporaryDirectories = []

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { force: true, recursive: true })
  }
})

function stagingSnapshot() {
  return environmentContainerSnapshot(stagingNames.map((name, index) => ({
    id: `00000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`,
    image: `registry.cloudflare.com/account/${name}@sha256:${String(index + 1).repeat(64)}`,
    instances: 2,
    name,
    state: 'ready',
    updated_at: index === 0
      ? '2026-08-28T01:00:00.000000064Z'
      : `2026-08-28T0${index + 1}:00:00.000Z`,
    version: index + 1,
  })), 'staging')
}

function validProof(overrides = {}) {
  return createCppStagingRegressionProof({
    ci: {
      conclusion: 'success',
      event: 'push',
      headSha: commit,
      runId: 33000000001,
      status: 'completed',
      workflow: 'CI',
    },
    commit,
    completedAt: new Date(nowMilliseconds).toISOString(),
    containers: stagingSnapshot(),
    workerVersion,
    ...overrides,
  })
}

describe('recorded Practical C++ staging proof contract', () => {
  it('accepts no arguments and pins one exact KV enable or pause mutation', () => {
    expect(parseCppStagingRegressionArgs([])).toEqual({ environmentName: 'staging' })
    expect(() => parseCppStagingRegressionArgs(['production'])).toThrow(/does not accept/iu)
    expect(stagingRunnerKvPutArgs(true)).toEqual([
      'kv',
      'key',
      'put',
      'enabled',
      'true',
      '--ttl',
      '900',
      '--binding',
      'RUNNER_CONFIG',
      '--remote',
      '--config',
      'wrangler.staging.jsonc',
    ])
    expect(stagingRunnerKvPutArgs(false)[4]).toBe('false')
    expect(stagingRunnerKvPutArgs(false)).not.toContain('--ttl')
    expect(() => stagingRunnerKvPutArgs('false')).toThrow(/Boolean/iu)
  })

  it('waits past the default KV cache window within the wall-clock deadline', async () => {
    let elapsedMilliseconds = 0
    const sleep = vi.fn(async (milliseconds) => {
      elapsedMilliseconds += milliseconds
    })
    const readKvValue = vi.fn(() => 'true')
    let fetchCount = 0
    const fetchImpl = vi.fn(async () => {
      fetchCount += 1
      const enabled = elapsedMilliseconds >= 61_000
      return new Response(JSON.stringify({
        configured: true,
        enabled,
        languages: ['python', 'cpp', 'csharp', 'java'],
        paused: !enabled,
        version: 1,
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      })
    })

    await expect(requireStagingRunnerState(true, {
      fetchImpl,
      now: () => elapsedMilliseconds,
      readKvValue,
      sleep,
    })).resolves.toBeUndefined()

    expect(fetchImpl).toHaveBeenCalledTimes(62)
    expect(sleep).toHaveBeenCalledTimes(61)
    expect(readKvValue).toHaveBeenCalledTimes(124)
  })

  it.each([true, false])(
    'aborts immediately when KV changes during a mismatched public %s-state attempt',
    async (enabled) => {
      const expectedValue = String(enabled)
      const readKvValue = vi.fn()
        .mockReturnValueOnce(expectedValue)
        .mockReturnValueOnce(String(!enabled))
      const sleep = vi.fn(async () => undefined)

      await expect(requireStagingRunnerState(enabled, {
        fetchImpl: async () => new Response(JSON.stringify({
          configured: true,
          enabled: !enabled,
          languages: ['python', 'cpp', 'csharp', 'java'],
          paused: enabled,
          version: 1,
        }), {
          headers: { 'Content-Type': 'application/json' },
          status: 200,
        }),
        readKvValue,
        sleep,
      })).rejects.toThrow(new RegExp(`changed while proving ${expectedValue}`, 'iu'))

      expect(readKvValue).toHaveBeenCalledTimes(2)
      expect(sleep).not.toHaveBeenCalled()
    },
  )

  it('does not fetch when an authoritative KV read consumes the deadline', async () => {
    let elapsedMilliseconds = 0
    const fetchImpl = vi.fn()
    const failure = await requireStagingRunnerState(true, {
      fetchImpl,
      now: () => elapsedMilliseconds,
      readKvValue: (remainingMilliseconds) => {
        expect(remainingMilliseconds).toBe(120_000)
        elapsedMilliseconds = 120_001
        return 'true'
      },
      sleep: vi.fn(async () => undefined),
    }).catch((error) => error)

    expect(failure).toBeInstanceOf(Error)
    expect(failure.message).toMatch(/did not become enabled/iu)
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  it('does not accept public success when the confirming KV read passes the deadline', async () => {
    let elapsedMilliseconds = 0
    const readKvValue = vi.fn()
      .mockReturnValueOnce('true')
      .mockImplementationOnce(() => {
        elapsedMilliseconds = 120_001
        return 'true'
      })

    await expect(requireStagingRunnerState(true, {
      fetchImpl: async () => new Response(JSON.stringify({
        configured: true,
        enabled: true,
        languages: ['python', 'cpp', 'csharp', 'java'],
        paused: false,
        version: 1,
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }),
      now: () => elapsedMilliseconds,
      readKvValue,
      sleep: vi.fn(async () => undefined),
    })).rejects.toThrow(/did not become enabled/iu)

    expect(readKvValue).toHaveBeenCalledTimes(2)
  })

  it('bounds repeated request timeouts by one absolute two-minute deadline', async () => {
    let elapsedMilliseconds = 0
    const requestTimeouts = []
    const sleep = vi.fn(async (milliseconds) => {
      elapsedMilliseconds += milliseconds
    })

    await expect(requireStagingRunnerState(true, {
      createAbortSignal: (milliseconds) => ({ timeoutMilliseconds: milliseconds }),
      fetchImpl: async (_url, options) => {
        const requestTimeout = options.signal.timeoutMilliseconds
        requestTimeouts.push(requestTimeout)
        elapsedMilliseconds += requestTimeout
        throw new Error('simulated request timeout')
      },
      now: () => elapsedMilliseconds,
      readKvValue: () => 'true',
      sleep,
    })).rejects.toThrow(/did not become enabled/iu)

    expect(elapsedMilliseconds).toBe(120_000)
    expect(requestTimeouts.every((milliseconds) => milliseconds <= 10_000)).toBe(true)
    expect(requestTimeouts.at(-1)).toBeLessThanOrEqual(10_000)
  })

  it('preserves the final public-state failure after exhausting the wait', async () => {
    let elapsedMilliseconds = 0
    const sleep = vi.fn(async (milliseconds) => {
      elapsedMilliseconds += milliseconds
    })
    const failure = await requireStagingRunnerState(true, {
      fetchImpl: async () => new Response(JSON.stringify({
        configured: true,
        enabled: false,
        languages: ['python', 'cpp', 'csharp', 'java'],
        paused: true,
        version: 1,
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }),
      now: () => elapsedMilliseconds,
      pollMilliseconds: 1,
      readKvValue: () => 'true',
      sleep,
      timeoutMilliseconds: 2,
    }).catch((error) => error)

    expect(failure).toBeInstanceOf(Error)
    expect(failure.message).toMatch(/did not become enabled/iu)
    expect(failure.cause).toBeInstanceOf(Error)
    expect(failure.cause.message).toMatch(/not configured and enabled/iu)
    expect(sleep).toHaveBeenCalledTimes(2)
  })

  it('accepts only a successful completed CI push run for the exact commit', () => {
    const run = {
      conclusion: 'success',
      databaseId: 33000000001,
      event: 'push',
      headSha: commit,
      status: 'completed',
      workflowName: 'CI',
    }
    expect(parseSuccessfulExactCommitCi(JSON.stringify([run]), commit)).toEqual({
      conclusion: 'success',
      event: 'push',
      headSha: commit,
      runId: 33000000001,
      status: 'completed',
      workflow: 'CI',
    })
    expect(() => parseSuccessfulExactCommitCi(JSON.stringify([
      { ...run, conclusion: 'failure' },
      { ...run, event: 'workflow_dispatch' },
      { ...run, headSha: 'a'.repeat(40) },
    ]), commit)).toThrow(/successful completed CI push/iu)
  })

  it('creates an exact, public-safe, four-container proof for the fixed check list', () => {
    const proof = validProof()
    expect(proof).toMatchObject({
      checks: [...CPP_STAGING_REGRESSION_CHECKS],
      commit,
      environment: 'staging',
      schema: CPP_STAGING_REGRESSION_PROOF_SCHEMA,
      status: 'passed',
      version: 1,
      worker: { version: workerVersion },
    })
    expect(proof.containers).toHaveLength(4)
    expect(proof.containers.every((container) => (
      Object.keys(container).sort().join(',') === 'digest,id,instances,name,updatedAt,version'
    ))).toBe(true)
    expect(proof.cppDigest).toBe(
      proof.containers.find(({ name }) => name.endsWith('runnercppsandbox')).digest,
    )
    expect(proof.containerFingerprint).toMatch(/^[0-9a-f]{64}$/u)
    expect(JSON.stringify(proof)).not.toMatch(/cookie|grant|secret|token|learner source|analyzer|profile/iu)
  })

  it.each([
    ['without a fraction on a valid leap day', '2024-02-29T01:02:03Z'],
    ['with one fractional digit', '2026-08-28T01:02:03.4Z'],
    ['with nine fractional digits', '2026-08-28T01:02:03.243000064Z'],
  ])('preserves a strict Cloudflare update timestamp %s', (_label, timestamp) => {
    const containers = stagingSnapshot()
    containers[0].updated_at = timestamp

    const proof = validProof({ containers })

    expect(proof.containers.find(({ name }) => name === containers[0].name)?.updatedAt).toBe(timestamp)
  })

  it('keeps sub-millisecond update differences in fingerprints and live equality', () => {
    const recordedContainers = stagingSnapshot()
    recordedContainers[0].updated_at = '2026-08-28T01:02:03.243000064Z'
    const changedContainers = structuredClone(recordedContainers)
    changedContainers[0].updated_at = '2026-08-28T01:02:03.243000065Z'

    const recordedProof = validProof({ containers: recordedContainers })
    const changedProof = validProof({ containers: changedContainers })

    expect(recordedProof.containerFingerprint).not.toBe(changedProof.containerFingerprint)
    expect(() => validateCppStagingRegressionProof(recordedProof, {
      expectedCommit: commit,
      expectedContainers: changedContainers,
      nowMilliseconds,
    })).toThrow(/no longer match/iu)
  })

  it.each([
    ['extra field', (proof) => { proof.private = true }],
    ['wrong schema', (proof) => { proof.schema = 'unreviewed' }],
    ['failed status', (proof) => { proof.status = 'failed' }],
    ['wrong check order', (proof) => { proof.checks.reverse() }],
    ['failed CI', (proof) => { proof.ci.conclusion = 'failure' }],
    ['wrong CI commit', (proof) => { proof.ci.headSha = 'a'.repeat(40) }],
    ['wrong Worker metadata', (proof) => { proof.worker.tag = 'runner-cpp-unreviewed' }],
    ['wrong snapshot fingerprint', (proof) => { proof.containerFingerprint = '0'.repeat(64) }],
    ['wrong C++ digest', (proof) => { proof.cppDigest = `sha256:${'f'.repeat(64)}` }],
    ['extra container field', (proof) => { proof.containers[0].image = 'private' }],
    ['invalid calendar update time', (proof) => {
      proof.containers[0].updatedAt = '2026-02-29T01:00:00.000000064Z'
    }],
    ['offset update time', (proof) => {
      proof.containers[0].updatedAt = '2026-08-28T01:00:00.000000064+00:00'
    }],
    ['empty-fraction update time', (proof) => {
      proof.containers[0].updatedAt = '2026-08-28T01:00:00.Z'
    }],
    ['over-precise update time', (proof) => {
      proof.containers[0].updatedAt = '2026-08-28T01:00:00.0000000640Z'
    }],
    ['leap-second update time', (proof) => {
      proof.containers[0].updatedAt = '2026-08-28T01:00:60.000000064Z'
    }],
    ['lowercase UTC update time', (proof) => {
      proof.containers[0].updatedAt = '2026-08-28T01:00:00.000000064z'
    }],
  ])('rejects a proof with %s', (_label, mutate) => {
    const proof = structuredClone(validProof())
    mutate(proof)
    expect(() => validateCppStagingRegressionProof(proof, {
      expectedCommit: commit,
      nowMilliseconds,
    })).toThrow()
  })

  it('rejects stale, future, wrong-commit, wrong-Worker, and changed-live-snapshot proofs', () => {
    const proof = validProof()
    expect(() => validateCppStagingRegressionProof(proof, {
      expectedCommit: commit,
      nowMilliseconds: nowMilliseconds + CPP_STAGING_REGRESSION_PROOF_MAX_AGE_MS + 1,
    })).toThrow(/stale/iu)
    expect(() => validateCppStagingRegressionProof(proof, {
      expectedCommit: commit,
      nowMilliseconds: nowMilliseconds - 1,
    })).toThrow(/future/iu)
    expect(() => validateCppStagingRegressionProof(proof, {
      expectedCommit: 'a'.repeat(40),
      nowMilliseconds,
    })).toThrow(/release commit/iu)
    expect(() => validateCppStagingRegressionProof(proof, {
      expectedCommit: commit,
      expectedWorkerVersion: '22222222-2222-4222-8222-222222222222',
      nowMilliseconds,
    })).toThrow(/active Worker metadata/iu)

    const changed = stagingSnapshot()
    changed.find(({ name }) => name.endsWith('runnercppsandbox')).version += 1
    expect(() => validateCppStagingRegressionProof(proof, {
      expectedCommit: commit,
      expectedContainers: changed,
      nowMilliseconds,
    })).toThrow(/no longer match/iu)
  })

  it('writes atomically under the supplied Git directory with mode 0600 and can invalidate it', () => {
    const gitDirectory = mkdtempSync(resolve(tmpdir(), 'spcp-staging-proof-test-'))
    temporaryDirectories.push(gitDirectory)
    const proof = validProof()
    const proofPath = writeCppStagingRegressionProof(proof, {
      gitDirectory,
      nowMilliseconds,
    })

    expect(proofPath).toBe(resolve(gitDirectory, CPP_STAGING_REGRESSION_PROOF_FILENAME))
    expect(cppStagingRegressionProofPath(gitDirectory)).toBe(proofPath)
    expect(statSync(proofPath).mode & 0o777).toBe(0o600)
    expect(loadCppStagingRegressionProof({ gitDirectory })).toEqual(
      JSON.parse(readFileSync(proofPath, 'utf8')),
    )

    invalidateCppStagingRegressionProof({ gitDirectory })
    expect(existsSync(proofPath)).toBe(false)
  })
})

describe('guarded Practical C++ staging regression orchestration', () => {
  function dependencies(overrides = {}) {
    const events = []
    const snapshot = stagingSnapshot()
    return {
      events,
      invalidateProof: vi.fn(() => events.push('proof:invalidate')),
      log: vi.fn(),
      now: vi.fn(() => nowMilliseconds),
      readActiveDeploymentVersion: vi.fn(() => {
        events.push('worker:read')
        return workerVersion
      }),
      readContainerSnapshot: vi.fn(() => {
        events.push('containers:read')
        return structuredClone(snapshot)
      }),
      requireStagingRunnerState: vi.fn(async (enabled) => {
        events.push(`state:${enabled}`)
      }),
      runStagingRegressionCheck: vi.fn((command) => events.push(`check:${command}`)),
      setStagingRunnerEnabled: vi.fn((enabled) => events.push(`set:${enabled}`)),
      sleep: vi.fn(async () => undefined),
      verifiedReleaseCommit: vi.fn(() => commit),
      verifyHostedCi: vi.fn(() => ({
        conclusion: 'success',
        event: 'push',
        headSha: commit,
        runId: 33000000001,
        status: 'completed',
        workflow: 'CI',
      })),
      verifyVersionMetadata: vi.fn(),
      writeProof: vi.fn(() => events.push('proof:write')),
      ...overrides,
    }
  }

  it('opens one controlled window, runs every exact check, pauses in finally, and writes last', async () => {
    const deps = dependencies()
    const proof = await runCppStagingRegressionProof([], deps)

    expect(proof.status).toBe('passed')
    expect(deps.setStagingRunnerEnabled.mock.calls.map(([enabled]) => enabled)).toEqual([true, false])
    expect(deps.requireStagingRunnerState.mock.calls.map(([enabled]) => enabled)).toEqual([
      false,
      true,
      false,
    ])
    expect(deps.runStagingRegressionCheck.mock.calls.map(([command]) => command)).toEqual(
      CPP_STAGING_REGRESSION_CHECKS,
    )
    expect(deps.readActiveDeploymentVersion).toHaveBeenCalledTimes(3)
    expect(deps.readContainerSnapshot).toHaveBeenCalledTimes(3)
    expect(deps.verifyVersionMetadata).toHaveBeenCalledTimes(3)
    expect(deps.verifiedReleaseCommit).toHaveBeenCalledTimes(2)
    expect(deps.writeProof).toHaveBeenCalledOnce()
    expect(deps.events.at(-1)).toBe('proof:write')
    expect(deps.events.indexOf('proof:invalidate')).toBeLessThan(deps.events.indexOf('set:true'))
    expect(deps.events.indexOf('set:false')).toBeGreaterThan(
      deps.events.indexOf(`check:${CPP_STAGING_REGRESSION_CHECKS.at(-1)}`),
    )
    expect(deps.events.indexOf('set:false')).toBeLessThan(
      deps.events.findIndex((event, index) => (
        index > deps.events.indexOf(`check:${CPP_STAGING_REGRESSION_CHECKS.at(-1)}`)
        && event === 'worker:read'
      )),
    )
  })

  it('always attempts and proves pause after a check failure and records no proof', async () => {
    const deps = dependencies({
      runStagingRegressionCheck: vi.fn((command) => {
        deps.events.push(`check:${command}`)
        if (command === 'npm run check:runner:cpp-collections:staging') {
          throw new Error('fixed regression failure')
        }
      }),
    })

    await expect(runCppStagingRegressionProof([], deps)).rejects.toThrow(/no proof was recorded/iu)
    expect(deps.setStagingRunnerEnabled.mock.calls.map(([enabled]) => enabled)).toEqual([true, false])
    expect(deps.requireStagingRunnerState).toHaveBeenLastCalledWith(false)
    expect(deps.writeProof).not.toHaveBeenCalled()
  })

  it('records no proof if pause cannot be proved', async () => {
    const deps = dependencies({
      requireStagingRunnerState: vi.fn(async (enabled) => {
        deps.events.push(`state:${enabled}`)
        if (!enabled && deps.events.includes('set:false')) throw new Error('still enabled')
      }),
    })

    await expect(runCppStagingRegressionProof([], deps)).rejects.toThrow(/no proof was recorded/iu)
    expect(deps.setStagingRunnerEnabled).toHaveBeenLastCalledWith(false)
    expect(deps.writeProof).not.toHaveBeenCalled()
  })

  it('records no proof if the Worker or complete snapshot changes before or after pause', async () => {
    const changed = stagingSnapshot()
    changed.find(({ name }) => name.endsWith('runnercppsandbox')).version += 1
    const deps = dependencies({
      readContainerSnapshot: vi.fn()
        .mockReturnValueOnce(stagingSnapshot())
        .mockReturnValueOnce(stagingSnapshot())
        .mockReturnValueOnce(changed),
    })

    await expect(runCppStagingRegressionProof([], deps)).rejects.toThrow(/complete staging runner snapshot changed/iu)
    expect(deps.setStagingRunnerEnabled).toHaveBeenLastCalledWith(false)
    expect(deps.writeProof).not.toHaveBeenCalled()
  })

  it.each(['active', 'provisioning'])(
    'waits through exact %s readiness after pause without weakening exact equality',
    async (transientState) => {
      const transientReadiness = new Error(
        `Runner application see-pound-coffee-pie-phase2-staging-runnerjavasandbox is ${transientState}, not ready.`,
      )
      const deps = dependencies({
        readContainerSnapshot: vi.fn()
          .mockReturnValueOnce(stagingSnapshot())
          .mockImplementationOnce(() => { throw transientReadiness })
          .mockReturnValueOnce(stagingSnapshot())
          .mockReturnValueOnce(stagingSnapshot()),
      })

      const proof = await runCppStagingRegressionProof([], deps)

      expect(proof.status).toBe('passed')
      expect(deps.setStagingRunnerEnabled).toHaveBeenLastCalledWith(false)
      expect(deps.requireStagingRunnerState).toHaveBeenLastCalledWith(false)
      expect(deps.readContainerSnapshot).toHaveBeenCalledTimes(4)
      expect(deps.sleep).toHaveBeenCalledTimes(2)
      expect(deps.sleep).toHaveBeenCalledWith(2_000)
      expect(deps.writeProof).toHaveBeenCalledOnce()
    },
  )

  it('rejects an unreviewed container readiness state without retrying', async () => {
    const unreviewedReadiness = new Error(
      'Runner application see-pound-coffee-pie-phase2-staging-runnerjavasandbox is failed, not ready.',
    )
    const deps = dependencies({
      readContainerSnapshot: vi.fn()
        .mockReturnValueOnce(stagingSnapshot())
        .mockImplementationOnce(() => { throw unreviewedReadiness }),
    })

    await expect(runCppStagingRegressionProof([], deps)).rejects.toThrow(
      /is failed, not ready/iu,
    )
    expect(deps.setStagingRunnerEnabled).toHaveBeenLastCalledWith(false)
    expect(deps.requireStagingRunnerState).toHaveBeenLastCalledWith(false)
    expect(deps.readContainerSnapshot).toHaveBeenCalledTimes(2)
    expect(deps.sleep).not.toHaveBeenCalled()
    expect(deps.writeProof).not.toHaveBeenCalled()
  })

  it('retries only reviewed readiness states and fails immediately for changed release state', async () => {
    const baseline = stagingSnapshot()
    const changed = stagingSnapshot()
    changed.find(({ name }) => name.endsWith('runnercppsandbox')).image = (
      changed.find(({ name }) => name.endsWith('runnercppsandbox')).image
        .replace(/sha256:[0-9a-f]{64}$/u, `sha256:${'f'.repeat(64)}`)
    )
    const readContainerSnapshot = vi.fn()
      .mockReturnValueOnce(baseline)
      .mockReturnValueOnce(changed)
    const deps = dependencies({ readContainerSnapshot })

    await expect(runCppStagingRegressionProof([], deps)).rejects.toThrow(
      /complete staging runner snapshot changed/iu,
    )
    expect(readContainerSnapshot).toHaveBeenCalledTimes(2)
    expect(deps.sleep).not.toHaveBeenCalled()
    expect(deps.writeProof).not.toHaveBeenCalled()
  })

  it('does not mask a changed Worker when containers are also provisioning', async () => {
    const provisioning = new Error(
      'Runner application see-pound-coffee-pie-phase2-staging-runnerjavasandbox is provisioning, not ready.',
    )
    const readContainerSnapshot = vi.fn()
      .mockReturnValueOnce(stagingSnapshot())
      .mockImplementationOnce(() => { throw provisioning })
    const deps = dependencies({
      readActiveDeploymentVersion: vi.fn()
        .mockReturnValueOnce(workerVersion)
        .mockReturnValueOnce('22222222-2222-4222-8222-222222222222'),
      readContainerSnapshot,
    })

    await expect(runCppStagingRegressionProof([], deps)).rejects.toThrow(
      /active staging Worker changed/iu,
    )
    expect(deps.verifyVersionMetadata).toHaveBeenCalledOnce()
    expect(readContainerSnapshot).toHaveBeenCalledOnce()
    expect(deps.sleep).not.toHaveBeenCalled()
    expect(deps.writeProof).not.toHaveBeenCalled()
  })

  it('rejects invalid staging readiness wait bounds before reading live state', async () => {
    const deps = dependencies()

    await expect(waitForStableStagingRelease({
      baselineContainers: stagingSnapshot(),
      baselineWorkerVersion: workerVersion,
      metadata: {},
    }, {
      ...deps,
      attempts: 1,
      requiredSamples: 2,
    })).rejects.toThrow(/attempt and sample counts/iu)
    expect(deps.readContainerSnapshot).not.toHaveBeenCalled()
  })

  it('does not open staging or record a proof without a clean remote commit and successful CI', async () => {
    const dirty = dependencies({
      verifiedReleaseCommit: vi.fn(() => { throw new Error('dirty') }),
    })
    await expect(runCppStagingRegressionProof([], dirty)).rejects.toThrow(/dirty/iu)
    expect(dirty.setStagingRunnerEnabled).not.toHaveBeenCalled()
    expect(dirty.writeProof).not.toHaveBeenCalled()

    const failedCi = dependencies({
      verifyHostedCi: vi.fn(() => { throw new Error('CI failed') }),
    })
    await expect(runCppStagingRegressionProof([], failedCi)).rejects.toThrow(/CI failed/iu)
    expect(failedCi.invalidateProof).not.toHaveBeenCalled()
    expect(failedCi.setStagingRunnerEnabled).not.toHaveBeenCalled()
    expect(failedCi.writeProof).not.toHaveBeenCalled()
  })

  it('records no proof when the clean remote commit changes during the regression window', async () => {
    const changedCommit = dependencies({
      verifiedReleaseCommit: vi.fn()
        .mockReturnValueOnce(commit)
        .mockReturnValueOnce('a'.repeat(40)),
    })

    await expect(runCppStagingRegressionProof([], changedCommit)).rejects.toThrow(/commit changed/iu)
    expect(changedCommit.setStagingRunnerEnabled).toHaveBeenLastCalledWith(false)
    expect(changedCommit.requireStagingRunnerState).toHaveBeenLastCalledWith(false)
    expect(changedCommit.writeProof).not.toHaveBeenCalled()
  })
})
