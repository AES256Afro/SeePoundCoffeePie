import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

import {
  assertNoEmittedSourceMaps,
  assetHasExpectedPlacement,
  assetNamesContainingAllMarkers,
  assetNamesReferencedByHtml,
  headroomFraction,
} from './bundle-release-guards.mjs'

const temporaryDirectories = []

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => (
    rm(directory, { recursive: true, force: true })
  )))
})

async function createTemporaryBundle() {
  const directory = await mkdtemp(path.join(tmpdir(), 'bundle-release-guards-'))
  temporaryDirectories.push(directory)
  return directory
}

describe('bundle release guards', () => {
  it('accepts a recursive browser bundle without source maps', async () => {
    const bundle = await createTemporaryBundle()
    const nestedAssets = path.join(bundle, 'assets', 'nested')
    await mkdir(nestedAssets, { recursive: true })
    await writeFile(path.join(bundle, 'index.html'), '<script src="/assets/index.js"></script>')
    await writeFile(path.join(nestedAssets, 'lesson.js'), 'export {}')

    await expect(assertNoEmittedSourceMaps(bundle)).resolves.toBeUndefined()
  })

  it('recursively rejects every emitted source map and reports its relative path', async () => {
    const bundle = await createTemporaryBundle()
    const nestedAssets = path.join(bundle, 'assets', 'nested')
    await mkdir(nestedAssets, { recursive: true })
    await writeFile(path.join(bundle, 'index.js.map'), '{}')
    await writeFile(path.join(nestedAssets, 'lesson.css.MAP'), '{}')

    await expect(assertNoEmittedSourceMaps(bundle)).rejects.toThrow(
      /assets\/nested\/lesson\.css\.MAP, index\.js\.map/u,
    )
  })

  it('finds entry, modulepreload, and stylesheet assets without including images', () => {
    const html = [
      '<script type="module" src="/assets/index-123.js"></script>',
      '<link rel="modulepreload" href="/assets/shared-456.js">',
      '<link rel="stylesheet" href="/assets/index-789.css">',
      '<img src="/assets/social-card.jpg">',
    ].join('\n')

    expect([...assetNamesReferencedByHtml(html, 'js')]).toEqual([
      'index-123.js',
      'shared-456.js',
    ])
    expect([...assetNamesReferencedByHtml(html, 'css')]).toEqual(['index-789.css'])
  })

  it('requires every reviewed marker to occur in the same emitted asset', () => {
    const assets = new Map([
      ['initial.js', 'python marker only'],
      ['foundation.js', 'python marker and java marker'],
      ['styles.css', 'python marker and java marker'],
    ])

    expect(assetNamesContainingAllMarkers(
      assets,
      ['python marker', 'java marker'],
      'js',
    )).toEqual(['foundation.js'])
  })

  it('reports positive and negative budget headroom as fractions', () => {
    expect(headroomFraction(85, 100)).toBe(0.15)
    expect(headroomFraction(110, 100)).toBe(-0.1)
  })

  it('distinguishes reviewed initial assets from reviewed lazy assets', () => {
    const initialAssets = new Set(['index.js', 'index.css'])

    expect(assetHasExpectedPlacement('index.css', initialAssets, 'initial')).toBe(true)
    expect(assetHasExpectedPlacement('lesson.css', initialAssets, 'initial')).toBe(false)
    expect(assetHasExpectedPlacement('lesson.css', initialAssets, 'lazy')).toBe(true)
    expect(assetHasExpectedPlacement('index.css', initialAssets, 'lazy')).toBe(false)
  })
})
