import { describe, expect, it } from 'vitest'

import {
  deployedJavaScriptChunkUrls,
  inspectDeployedJavaScriptChunkGraph,
} from './deployed-javascript-graph.mjs'

const origin = 'https://example.com'

describe('deployed JavaScript graph inspection', () => {
  it('finds static, side-effect, re-export, and dynamic same-origin asset imports', () => {
    const entryUrl = new URL('/assets/entry.js', origin)
    const asset = [
      'import value from "./static.js"',
      'import "./side-effect.js"',
      'export { value } from "./re-export.js"',
      'const lazy = import("./lazy.js")',
      'import("https://other.example/assets/not-ours.js")',
      'import("../outside.js")',
    ].join('\n')

    expect([...deployedJavaScriptChunkUrls(asset, entryUrl, origin)].sort()).toEqual([
      `${origin}/assets/lazy.js`,
      `${origin}/assets/re-export.js`,
      `${origin}/assets/side-effect.js`,
      `${origin}/assets/static.js`,
    ])
  })

  it('walks lazy grandchildren once and rejects unavailable chunks', async () => {
    const entryUrl = new URL('/assets/entry.js', origin)
    const assets = new Map([
      [`${origin}/assets/child.js`, 'import("./grandchild.js")'],
      [`${origin}/assets/grandchild.js`, 'export const privateMarker = "hidden"'],
    ])
    const requested = []
    const request = async (url) => {
      requested.push(url.href)
      const body = assets.get(url.href)
      return new Response(body ?? 'missing', {
        status: body === undefined ? 404 : 200,
        headers: { 'Content-Type': body === undefined ? 'text/plain' : 'application/javascript' },
      })
    }

    const graph = await inspectDeployedJavaScriptChunkGraph({
      allowedOrigin: origin,
      entryAsset: 'import("./child.js"); import("./child.js")',
      entryAssetUrl: entryUrl,
      request,
    })

    expect([...graph.values()]).toContain('export const privateMarker = "hidden"')
    expect(requested).toEqual([
      `${origin}/assets/child.js`,
      `${origin}/assets/grandchild.js`,
    ])

    await expect(inspectDeployedJavaScriptChunkGraph({
      allowedOrigin: origin,
      entryAsset: 'import("./missing.js")',
      entryAssetUrl: entryUrl,
      request,
    })).rejects.toThrow(/unavailable asset/iu)
  })

  it('fails closed when the graph exceeds its inspection limit', async () => {
    const request = async (url) => new Response(
      `import("./${Number(url.pathname.match(/(\d+)/u)?.[1] ?? 0) + 1}.js")`,
      { headers: { 'Content-Type': 'application/javascript' } },
    )

    await expect(inspectDeployedJavaScriptChunkGraph({
      allowedOrigin: origin,
      entryAsset: 'import("./1.js")',
      entryAssetUrl: new URL('/assets/entry.js', origin),
      maxAssets: 3,
      request,
    })).rejects.toThrow(/3-asset inspection limit/iu)
  })
})
