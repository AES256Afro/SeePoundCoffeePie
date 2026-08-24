import { describe, expect, it } from 'vitest'
import { handleRequest } from './worker'

const htmlEnv = {
  ASSETS: {
    fetch: async () => new Response('<!doctype html><title>SeePoundCoffeePie</title>', {
      headers: { 'Content-Type': 'text/html; charset=UTF-8' },
    }),
  },
}

describe('production Worker', () => {
  it('redirects www to the canonical HTTPS host while preserving the path', async () => {
    const response = await handleRequest(
      new Request('https://www.seepoundcoffeepie.com/codebook?from=crew'),
      htmlEnv,
    )

    expect(response.status).toBe(308)
    expect(response.headers.get('Location')).toBe(
      'https://seepoundcoffeepie.com/codebook?from=crew',
    )
  })

  it('adds browser security headers to the application shell', async () => {
    const response = await handleRequest(
      new Request('https://seepoundcoffeepie.com/'),
      htmlEnv,
    )

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Security-Policy')).toContain("frame-ancestors 'none'")
    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff')
    expect(response.headers.get('X-Frame-Options')).toBe('DENY')
    expect(response.headers.get('Cache-Control')).toBe('public, max-age=0, must-revalidate')
  })

  it('allows long immutable caching for hashed production assets', async () => {
    const assetEnv = {
      ASSETS: {
        fetch: async () => new Response('compiled asset', {
          headers: { 'Content-Type': 'text/javascript' },
        }),
      },
    }
    const response = await handleRequest(
      new Request('https://seepoundcoffeepie.com/assets/index-AbCd1234.js'),
      assetEnv,
    )

    expect(response.headers.get('Cache-Control')).toBe(
      'public, max-age=31536000, immutable',
    )
  })
})
