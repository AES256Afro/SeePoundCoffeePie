import { describe, expect, it, vi } from 'vitest'

import {
  assertContainerSnapshotUnchanged,
  buildWranglerDeployArgs,
  deploymentMetadata,
  environmentContainerSnapshot,
  parseDeploymentArgs,
  parseWranglerVersionId,
  runnerPublicationAlias,
  verifyPublicBundleBoundary,
  verifyStableContainerSnapshot,
  waitForExpectedValue,
  wranglerDeploySpawnOptions,
} from './deploy-public-site.mjs'

const productionNames = [
  'see-pound-coffee-pie-runnerpythonsandbox',
  'see-pound-coffee-pie-runnercppsandbox',
  'see-pound-coffee-pie-runnercsharpsandbox',
  'see-pound-coffee-pie-runnerjavasandbox',
]

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

const containerRows = [
  ...productionNames.map((name, index) => containerRow(name, index + 1)),
  {
    ...containerRow('another-project-runner', 5),
    instances: 1,
  },
]

describe('public-site deployment arguments', () => {
  it('accepts only the two named environments and the dry-run option', () => {
    expect(parseDeploymentArgs(['production'])).toEqual({ dryRun: false, environmentName: 'production' })
    expect(parseDeploymentArgs(['staging', '--dry-run'])).toEqual({ dryRun: true, environmentName: 'staging' })
    expect(() => parseDeploymentArgs(['preview'])).toThrow(/production or staging/iu)
    expect(() => parseDeploymentArgs(['production', '--force'])).toThrow(/unsupported/iu)
  })

  it.each(['production', 'staging'])('always freezes container rollouts for %s', (environmentName) => {
    const args = buildWranglerDeployArgs(environmentName, { commit: '8f3875f36233' })
    expect(args).toEqual(expect.arrayContaining([
      '--containers-rollout',
      'none',
      '--strict',
      '--old-asset-ttl',
      '900',
    ]))
    expect(args).not.toContain('immediate')
    expect(args).not.toContain('gradual')
  })

  it('uses the staging configuration only for staging and tags the exact commit', () => {
    const metadata = deploymentMetadata('8f3875f36233c8238272')
    expect(metadata).toEqual({
      message: 'Public site only from 8f3875f36233; runner images preserved.',
      shortCommit: '8f3875f36233',
      tag: 'public-site-8f3875f36233',
    })
    expect(buildWranglerDeployArgs('production')).not.toContain('wrangler.staging.jsonc')
    expect(buildWranglerDeployArgs('staging')).toEqual(expect.arrayContaining([
      '--config',
      'wrangler.staging.jsonc',
    ]))
  })

  it('pins the checked-in runner publication source for every Worker build', () => {
    const expectedAlias = '../data/controlled-runner-publication:./src/data/runner-publication.with-cpp.ts'
    for (const environmentName of ['production', 'staging']) {
      const args = buildWranglerDeployArgs(environmentName)
      expect(args.slice(args.indexOf('--alias'), args.indexOf('--alias') + 2)).toEqual([
        '--alias',
        expectedAlias,
      ])
    }
    expect(runnerPublicationAlias('src/data/runner-publication.with-cpp.ts')).toBe(
      '../data/controlled-runner-publication:./src/data/runner-publication.with-cpp.ts',
    )
    expect(runnerPublicationAlias('src/data/runner-publication.base.ts')).toBe(
      '../data/controlled-runner-publication:./src/data/runner-publication.base.ts',
    )
    expect(() => runnerPublicationAlias('src/data/unreviewed.ts')).toThrow(/unreviewed/iu)
  })

  it('runs Wrangler without interactive input so strict conflicts cannot be accepted', () => {
    const options = wranglerDeploySpawnOptions()
    expect(options.stdio).toEqual(['ignore', 'pipe', 'pipe'])
    expect(options.encoding).toBe('utf8')
  })

  it('runs the production bundle privacy check before the deployment wrapper can continue', () => {
    const run = vi.fn()
    verifyPublicBundleBoundary(run)

    expect(run).toHaveBeenCalledOnce()
    const [command, args, options] = run.mock.calls[0]
    expect(command).toBe(process.execPath)
    expect(args).toHaveLength(1)
    expect(args[0]).toMatch(/check-project-bundle\.mjs$/u)
    expect(options).toMatchObject({ stdio: 'inherit' })
  })
})

describe('runner application freeze', () => {
  it('records exactly the four ready applications for one environment', () => {
    const snapshot = environmentContainerSnapshot(containerRows, 'production')
    expect(snapshot).toHaveLength(4)
    expect(snapshot.map((row) => row.name)).toEqual([
      'see-pound-coffee-pie-runnercppsandbox',
      'see-pound-coffee-pie-runnercsharpsandbox',
      'see-pound-coffee-pie-runnerjavasandbox',
      'see-pound-coffee-pie-runnerpythonsandbox',
    ])
  })

  it('refuses a missing, duplicate, or non-ready application set', () => {
    expect(() => environmentContainerSnapshot(containerRows.slice(1), 'production')).toThrow(/exactly four unique/iu)
    expect(() => environmentContainerSnapshot([
      containerRows[0],
      containerRows[0],
      containerRows[1],
      containerRows[2],
    ], 'production')).toThrow(/duplicates/iu)
    expect(() => environmentContainerSnapshot(
      containerRows.map((row) => row.name.endsWith('runnercppsandbox') ? { ...row, state: 'deploying' } : row),
      'production',
    )).toThrow(/not ready/iu)
  })

  it('refuses missing fields, mutable images, wrong limits, and duplicate IDs', () => {
    expect(() => environmentContainerSnapshot(
      containerRows.map(({ name, state }) => ({ name, state })),
      'production',
    )).toThrow(/invalid application ID/iu)

    const changedImage = structuredClone(containerRows)
    changedImage[0].image = `registry.cloudflare.com/account/${changedImage[0].name}:latest`
    expect(() => environmentContainerSnapshot(changedImage, 'production')).toThrow(/digest-pinned/iu)

    const changedInstances = structuredClone(containerRows)
    changedInstances[0].instances = 3
    expect(() => environmentContainerSnapshot(changedInstances, 'production')).toThrow(/not 4/iu)

    const duplicateId = structuredClone(containerRows)
    duplicateId[1].id = duplicateId[0].id
    expect(() => environmentContainerSnapshot(duplicateId, 'production')).toThrow(/duplicate application ID/iu)

    const invalidVersion = structuredClone(containerRows)
    invalidVersion[0].version = 0
    expect(() => environmentContainerSnapshot(invalidVersion, 'production')).toThrow(/invalid application version/iu)

    const invalidTime = structuredClone(containerRows)
    invalidTime[0].updated_at = 'not-a-time'
    expect(() => environmentContainerSnapshot(invalidTime, 'production')).toThrow(/invalid update time/iu)
  })

  it('accepts an identical after-deployment snapshot', () => {
    const snapshot = environmentContainerSnapshot(containerRows, 'production')
    expect(() => assertContainerSnapshotUnchanged(snapshot, structuredClone(snapshot))).not.toThrow()
  })

  it('detects an image or application-version change', () => {
    const snapshot = environmentContainerSnapshot(containerRows, 'production')
    const changed = structuredClone(snapshot)
    changed[0].image = changed[0].image.replace(/.$/u, 'f')
    changed[0].version += 1
    expect(() => assertContainerSnapshotUnchanged(snapshot, changed)).toThrow(/runner application changed/iu)
  })

  it('checks the same baseline across a stability window and catches a late mutation', async () => {
    const snapshot = environmentContainerSnapshot(containerRows, 'production')
    const sleep = vi.fn()
    const stableRead = vi.fn().mockResolvedValue(structuredClone(snapshot))
    await expect(verifyStableContainerSnapshot({
      baseline: snapshot,
      readSnapshot: stableRead,
      samples: 3,
      sleep,
    })).resolves.toEqual(snapshot)
    expect(stableRead).toHaveBeenCalledTimes(3)
    expect(sleep).toHaveBeenCalledTimes(2)

    const changed = structuredClone(snapshot)
    changed[0].version += 1
    const lateRead = vi.fn()
      .mockResolvedValueOnce(structuredClone(snapshot))
      .mockResolvedValueOnce(changed)
    await expect(verifyStableContainerSnapshot({
      baseline: snapshot,
      readSnapshot: lateRead,
      samples: 3,
      sleep: vi.fn(),
    })).rejects.toThrow(/runner application changed/iu)
  })
})

describe('exact Worker version proof', () => {
  const firstVersion = '11111111-1111-4111-8111-111111111111'
  const targetVersion = '22222222-2222-4222-8222-222222222222'
  const unrelatedVersion = '33333333-3333-4333-8333-333333333333'

  it('parses exactly one Wrangler-created version ID', () => {
    expect(parseWranglerVersionId(`Uploaded site\nCurrent Version ID: ${targetVersion}\n`)).toBe(targetVersion)
    expect(() => parseWranglerVersionId('Uploaded site without an ID')).toThrow(/exactly one/iu)
    expect(() => parseWranglerVersionId(
      `Current Version ID: ${targetVersion}\nCurrent Version ID: ${unrelatedVersion}`,
    )).toThrow(/exactly one/iu)
  })

  it('waits through stale status but never accepts an unrelated active version', async () => {
    const read = vi.fn()
      .mockResolvedValueOnce(firstVersion)
      .mockResolvedValueOnce(firstVersion)
      .mockResolvedValueOnce(targetVersion)
    const sleep = vi.fn()
    await expect(waitForExpectedValue({
      expected: targetVersion,
      label: 'The active staging Worker version',
      read,
      sleep,
    })).resolves.toBe(targetVersion)
    expect(sleep).toHaveBeenCalledTimes(2)

    await expect(waitForExpectedValue({
      attempts: 2,
      expected: targetVersion,
      label: 'The active production Worker version',
      read: vi.fn().mockResolvedValue(unrelatedVersion),
      sleep: vi.fn(),
    })).rejects.toThrow(new RegExp(unrelatedVersion, 'u'))
  })
})
