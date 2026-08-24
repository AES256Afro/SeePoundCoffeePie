import { describe, expect, it, vi } from 'vitest'
import { handleRequest } from './worker'

const htmlEnv = {
  ASSETS: {
    fetch: async () => new Response('<!doctype html><title>SeePoundCoffeePie</title>', {
      headers: { 'Content-Type': 'text/html; charset=UTF-8' },
    }),
  },
  GITHUB_CLIENT_ID: 'test-client-id',
  GITHUB_CLIENT_SECRET: 'test-client-secret',
  SESSION_SECRET: 'a-test-session-secret-that-is-long-enough-for-hmac',
}
const testVerifier = 'v'.repeat(43)

function setCookies(response: Response): string[] {
  const headers = response.headers as Headers & { getSetCookie?: () => string[] }
  return headers.getSetCookie?.() ?? [response.headers.get('Set-Cookie') ?? '']
}

function cookieValue(response: Response, name: string): string | null {
  const cookie = setCookies(response).find((value) => value.startsWith(`${name}=`))
  return cookie?.slice(name.length + 1).split(';', 1)[0] ?? null
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
      ...htmlEnv,
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

  it('starts GitHub OAuth with state, an exact callback, and PKCE', async () => {
    const response = await handleRequest(
      new Request('https://seepoundcoffeepie.com/api/auth/github/start'),
      htmlEnv,
    )

    expect(response.status).toBe(302)
    const location = new URL(response.headers.get('Location') ?? '')
    expect(location.origin + location.pathname).toBe('https://github.com/login/oauth/authorize')
    expect(location.searchParams.get('client_id')).toBe('test-client-id')
    expect(location.searchParams.get('redirect_uri')).toBe(
      'https://seepoundcoffeepie.com/api/auth/github/callback',
    )
    expect(location.searchParams.get('state')).toMatch(/^[A-Za-z0-9_-]{40,}$/u)
    expect(location.searchParams.get('code_challenge')).toMatch(/^[A-Za-z0-9_-]{40,}$/u)
    expect(location.searchParams.get('code_challenge_method')).toBe('S256')
    expect(location.searchParams.has('scope')).toBe(false)

    const cookies = setCookies(response).join('\n')
    expect(cookies).toContain('__Host-spp_oauth_state=')
    expect(cookies).toContain('__Host-spp_oauth_pkce=')
    expect(cookies).toContain('Max-Age=600')
    expect(cookies).toContain('Secure')
    expect(cookies).toContain('HttpOnly')
    expect(cookies).toContain('SameSite=Lax')
    expect(cookies).not.toContain('Domain=')
  })

  it('rejects a callback with mismatched state before contacting GitHub', async () => {
    const externalFetch = vi.fn()
    const response = await handleRequest(
      new Request('https://seepoundcoffeepie.com/api/auth/github/callback?code=abc&state=wrong', {
        headers: { Cookie: `__Host-spp_oauth_state=expected; __Host-spp_oauth_pkce=${testVerifier}` },
      }),
      htmlEnv,
      externalFetch,
    )

    expect(response.status).toBe(302)
    expect(response.headers.get('Location')).toBe(
      'https://seepoundcoffeepie.com/?auth=error&reason=invalid-request',
    )
    expect(externalFetch).not.toHaveBeenCalled()
  })

  it('creates a signed local session and discards the temporary GitHub grant', async () => {
    const externalFetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)
      if (url === 'https://github.com/login/oauth/access_token') {
        expect(String(init?.body)).toContain(`code_verifier=${testVerifier}`)
        expect(String(init?.body)).toContain('redirect_uri=https%3A%2F%2Fseepoundcoffeepie.com%2Fapi%2Fauth%2Fgithub%2Fcallback')
        return Response.json({ access_token: 'temporary-github-token' })
      }
      if (url === 'https://api.github.com/user') {
        expect(new Headers(init?.headers).get('Authorization')).toBe('Bearer temporary-github-token')
        return Response.json({ id: 314, login: 'cadet-pie', name: 'Cadet Pie' })
      }
      if (url === 'https://api.github.com/applications/test-client-id/grant') {
        expect(init?.method).toBe('DELETE')
        expect(init?.body).toBe(JSON.stringify({ access_token: 'temporary-github-token' }))
        return new Response(null, { status: 204 })
      }
      throw new Error(`Unexpected GitHub request: ${url}`)
    })

    const callback = await handleRequest(
      new Request('https://seepoundcoffeepie.com/api/auth/github/callback?code=abc&state=test-state', {
        headers: {
          Cookie: `__Host-spp_oauth_state=test-state; __Host-spp_oauth_pkce=${testVerifier}`,
        },
      }),
      htmlEnv,
      externalFetch,
    )

    expect(callback.status).toBe(302)
    expect(callback.headers.get('Location')).toBe('https://seepoundcoffeepie.com/?auth=success')
    expect(externalFetch).toHaveBeenCalledTimes(3)

    const sessionCookie = cookieValue(callback, '__Host-spp_session')
    expect(sessionCookie).toBeTruthy()
    expect(sessionCookie).not.toContain('temporary-github-token')
    expect(setCookies(callback).join('\n')).toContain('Max-Age=604800')

    const session = await handleRequest(
      new Request('https://seepoundcoffeepie.com/api/auth/session', {
        headers: { Cookie: `__Host-spp_session=${sessionCookie}` },
      }),
      htmlEnv,
    )

    expect(session.status).toBe(200)
    await expect(session.json()).resolves.toEqual({
      authenticated: true,
      user: { id: '314', login: 'cadet-pie', name: 'Cadet Pie' },
    })
    expect(session.headers.get('Cache-Control')).toBe('no-store')

    const [payload, signature] = sessionCookie?.split('.') ?? []
    const tamperedSignature = `${signature?.startsWith('A') ? 'B' : 'A'}${signature?.slice(1)}`
    const tamperedSession = await handleRequest(
      new Request('https://seepoundcoffeepie.com/api/auth/session', {
        headers: { Cookie: `__Host-spp_session=${payload}.${tamperedSignature}` },
      }),
      htmlEnv,
    )
    await expect(tamperedSession.json()).resolves.toEqual({ authenticated: false, user: null })
    expect(setCookies(tamperedSession).join('\n')).toContain('Max-Age=0')
  })

  it('revokes the temporary grant even when the GitHub profile request fails', async () => {
    const requestedUrls: string[] = []
    const externalFetch = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      requestedUrls.push(url)
      if (url.endsWith('/login/oauth/access_token')) {
        return Response.json({ access_token: 'temporary-token-after-profile-error' })
      }
      if (url === 'https://api.github.com/user') return new Response(null, { status: 502 })
      if (url.endsWith('/applications/test-client-id/grant')) return new Response(null, { status: 204 })
      throw new Error(`Unexpected GitHub request: ${url}`)
    })

    const response = await handleRequest(
      new Request('https://seepoundcoffeepie.com/api/auth/github/callback?code=abc&state=test-state', {
        headers: {
          Cookie: `__Host-spp_oauth_state=test-state; __Host-spp_oauth_pkce=${testVerifier}`,
        },
      }),
      htmlEnv,
      externalFetch,
    )

    expect(response.headers.get('Location')).toBe(
      'https://seepoundcoffeepie.com/?auth=error&reason=github-profile',
    )
    expect(requestedUrls).toContain('https://api.github.com/applications/test-client-id/grant')
    expect(setCookies(response).join('\n')).not.toContain('__Host-spp_session=')
  })

  it('requires a canonical same-origin request to sign out', async () => {
    const rejected = await handleRequest(
      new Request('https://seepoundcoffeepie.com/api/auth/logout', {
        method: 'POST',
        headers: { Origin: 'https://malicious.example' },
      }),
      htmlEnv,
    )
    expect(rejected.status).toBe(403)

    const accepted = await handleRequest(
      new Request('https://seepoundcoffeepie.com/api/auth/logout', {
        method: 'POST',
        headers: { Origin: 'https://seepoundcoffeepie.com' },
      }),
      htmlEnv,
    )
    expect(accepted.status).toBe(200)
    expect(setCookies(accepted).join('\n')).toContain('__Host-spp_session=')
    expect(setCookies(accepted).join('\n')).toContain('Max-Age=0')
  })

  it('fails closed when required OAuth secrets are missing', async () => {
    const response = await handleRequest(
      new Request('https://seepoundcoffeepie.com/api/auth/github/start'),
      { ASSETS: htmlEnv.ASSETS },
    )

    expect(response.status).toBe(503)
    await expect(response.json()).resolves.toEqual({ error: 'GitHub sign-in is not configured.' })
  })
})
