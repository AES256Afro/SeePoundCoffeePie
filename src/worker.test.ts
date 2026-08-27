import { describe, expect, it, vi } from 'vitest'

vi.mock('@cloudflare/sandbox', () => ({
  Sandbox: class {},
  getSandbox: vi.fn(),
}))

import worker, { handleRequest } from './worker'
import { cppCollectionsRecordsManifest } from './data/cpp-collections-records-manifest'
import { cppCollectionsRecordsLessons } from './data/cpp-collections-records-plan'
import { trackById } from './data/curriculum'
import { initialProgress } from './lib/progress'

const htmlEnv = {
  ASSETS: {
    fetch: async () => new Response('<!doctype html><title>SeePoundCoffeePie</title>', {
      headers: { 'Content-Type': 'text/html; charset=UTF-8' },
    }),
  },
  GITHUB_CLIENT_ID: 'test-client-id',
  GITHUB_CLIENT_SECRET: 'test-client-secret',
  SESSION_SECRET: 'a-test-session-secret-that-is-long-enough-for-hmac',
  LEARNER_DATA_SECRET: 'a-separate-learning-data-secret-for-stable-owner-ids',
}
const testVerifier = 'v'.repeat(43)
const firstPythonLessonIds = trackById('python').missions[0].exercises.map((exercise) => exercise.id)

function setCookies(response: Response): string[] {
  const headers = response.headers as Headers & { getSetCookie?: () => string[] }
  return headers.getSetCookie?.() ?? [response.headers.get('Set-Cookie') ?? '']
}

function cookieValue(response: Response, name: string): string | null {
  const cookie = setCookies(response).find((value) => value.startsWith(`${name}=`))
  return cookie?.slice(name.length + 1).split(';', 1)[0] ?? null
}

class MemoryD1 implements D1Database {
  row: {
    owner_id: string
    schema_version: number
    revision: number
    progress_json: string
    created_at: string
    updated_at: string
  } | null = null

  prepare(query: string): D1PreparedStatement {
    let values: unknown[] = []
    return {
      bind: (...nextValues: unknown[]) => {
        values = nextValues
        return this.prepareWithValues(query, values)
      },
      first: async () => null,
      run: async () => ({ success: true, meta: { changes: 0 } }),
    }
  }

  private prepareWithValues(query: string, values: unknown[]): D1PreparedStatement {
    return {
      bind: () => this.prepareWithValues(query, values),
      first: async <T>() => {
        if (!query.startsWith('SELECT') || !this.row || this.row.owner_id !== values[0]) return null
        return {
          revision: this.row.revision,
          progress_json: this.row.progress_json,
          updated_at: this.row.updated_at,
        } as T
      },
      run: async () => {
        let changes = 0
        if (query.startsWith('INSERT')) {
          if (!this.row) {
            this.row = {
              owner_id: String(values[0]),
              schema_version: Number(values[1]),
              revision: Number(values[2]),
              progress_json: String(values[3]),
              created_at: String(values[4]),
              updated_at: String(values[5]),
            }
            changes = 1
          }
        } else if (query.startsWith('UPDATE')) {
          const ownerId = String(values[3])
          const revision = Number(values[4])
          if (this.row?.owner_id === ownerId && this.row.revision === revision) {
            this.row.revision = Number(values[0])
            this.row.progress_json = String(values[1])
            this.row.updated_at = String(values[2])
            changes = 1
          }
        } else if (query.startsWith('DELETE')) {
          if (this.row?.owner_id === values[0]) {
            this.row = null
            changes = 1
          }
        }
        return { success: true, meta: { changes } }
      },
    }
  }
}

async function sessionCookieFor(userId = 314): Promise<string> {
  const externalFetch = vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input)
    if (url.endsWith('/login/oauth/access_token')) return Response.json({ access_token: `token-${userId}` })
    if (url === 'https://api.github.com/user') {
      return Response.json({ id: userId, login: `cadet-${userId}`, name: `Cadet ${userId}` })
    }
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
  return cookieValue(response, '__Host-spp_session') ?? ''
}

function progressFixture() {
  return {
    ...initialProgress('python'),
    callsign: 'Synced Cadet',
    onboardingComplete: true,
    xp: 25,
    starShards: 25,
    completedMissions: ['py-first-spark'],
    conceptProgress: {
      'python-print': { strength: 1, correct: 1, incorrect: 0, dueAt: '2026-08-26' },
    },
  }
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

  it('does not mistake Cloudflare runtime context for the outbound fetch function', async () => {
    const externalFetch = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      if (url === 'https://github.com/login/oauth/access_token') {
        return Response.json({ access_token: 'temporary-runtime-token' })
      }
      if (url === 'https://api.github.com/user') {
        return Response.json({ id: 314, login: 'cadet-pie', name: 'Cadet Pie' })
      }
      if (url === 'https://api.github.com/applications/test-client-id/grant') {
        return new Response(null, { status: 204 })
      }
      throw new Error(`Unexpected GitHub request: ${url}`)
    })
    vi.stubGlobal('fetch', externalFetch)

    try {
      const runtimeFetch = worker.fetch as unknown as (
        request: Request,
        env: typeof htmlEnv,
        context: { waitUntil(promise: Promise<unknown>): void },
      ) => Promise<Response>
      const response = await runtimeFetch(
        new Request('https://seepoundcoffeepie.com/api/auth/github/callback?code=abc&state=test-state', {
          headers: {
            Cookie: `__Host-spp_oauth_state=test-state; __Host-spp_oauth_pkce=${testVerifier}`,
          },
        }),
        htmlEnv,
        { waitUntil: () => undefined },
      )

      expect(response.status).toBe(302)
      expect(response.headers.get('Location')).toBe('https://seepoundcoffeepie.com/?auth=success')
      expect(externalFetch).toHaveBeenCalledTimes(3)
    } finally {
      vi.unstubAllGlobals()
    }
  })

  it('turns an unexpected OAuth provider failure into a safe redirect', async () => {
    const response = await handleRequest(
      new Request('https://seepoundcoffeepie.com/api/auth/github/callback?code=abc&state=test-state', {
        headers: {
          Cookie: `__Host-spp_oauth_state=test-state; __Host-spp_oauth_pkce=${testVerifier}`,
        },
      }),
      htmlEnv,
      vi.fn().mockRejectedValue(new Error('Simulated provider outage')),
    )

    expect(response.status).toBe(302)
    expect(response.headers.get('Location')).toBe(
      'https://seepoundcoffeepie.com/?auth=error&reason=server-error',
    )
    expect(setCookies(response).join('\n')).toContain('__Host-spp_oauth_state=')
    expect(setCookies(response).join('\n')).toContain('__Host-spp_oauth_pkce=')
    expect(setCookies(response).join('\n')).toContain('Max-Age=0')
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

  it('creates, reads, updates, and deletes one authenticated learning record', async () => {
    const sessionCookie = await sessionCookieFor()
    const database = new MemoryD1()
    const progressEnv = { ...htmlEnv, LEARNER_DB: database }
    const headers = {
      Cookie: `__Host-spp_session=${sessionCookie}`,
      Origin: 'https://seepoundcoffeepie.com',
      'Content-Type': 'application/json',
    }
    const created = await handleRequest(
      new Request('https://seepoundcoffeepie.com/api/progress', {
        method: 'PUT',
        headers,
        body: JSON.stringify({ version: 1, revision: 0, progress: { ...progressFixture(), ignored: 'removed' } }),
      }),
      progressEnv,
    )
    expect(created.status).toBe(200)
    await expect(created.json()).resolves.toMatchObject({
      record: { version: 1, revision: 1, progress: { callsign: 'Synced Cadet', xp: 25 } },
    })
    expect(database.row?.progress_json).not.toContain('ignored')

    const loaded = await handleRequest(
      new Request('https://seepoundcoffeepie.com/api/progress', {
        headers: { Cookie: `__Host-spp_session=${sessionCookie}` },
      }),
      progressEnv,
    )
    await expect(loaded.json()).resolves.toMatchObject({ record: { revision: 1, progress: { xp: 25 } } })

    const updated = await handleRequest(
      new Request('https://seepoundcoffeepie.com/api/progress', {
        method: 'PUT',
        headers,
        body: JSON.stringify({ version: 1, revision: 1, progress: { ...progressFixture(), xp: 40 } }),
      }),
      progressEnv,
    )
    await expect(updated.json()).resolves.toMatchObject({ record: { revision: 2, progress: { xp: 40 } } })

    const deleted = await handleRequest(
      new Request('https://seepoundcoffeepie.com/api/progress', {
        method: 'DELETE',
        headers,
        body: JSON.stringify({ confirmation: 'DELETE MY LEARNING DATA' }),
      }),
      progressEnv,
    )
    await expect(deleted.json()).resolves.toEqual({ deleted: true, recordsRemoved: 1 })
  })

  it('reads an old version 1 D1 row without rewriting it, then persists the inferred lesson closure on save', async () => {
    const sessionCookie = await sessionCookieFor()
    const database = new MemoryD1()
    const progressEnv = { ...htmlEnv, LEARNER_DB: database }
    const headers = {
      Cookie: `__Host-spp_session=${sessionCookie}`,
      Origin: 'https://seepoundcoffeepie.com',
      'Content-Type': 'application/json',
    }
    const created = await handleRequest(
      new Request('https://seepoundcoffeepie.com/api/progress', {
        method: 'PUT',
        headers,
        body: JSON.stringify({ version: 1, revision: 0, progress: progressFixture() }),
      }),
      progressEnv,
    )
    expect(created.status).toBe(200)
    expect(database.row).not.toBeNull()

    const legacyProgress = JSON.parse(database.row!.progress_json) as Record<string, unknown>
    delete legacyProgress.completedLessons
    database.row!.progress_json = JSON.stringify(legacyProgress)

    const loaded = await handleRequest(
      new Request('https://seepoundcoffeepie.com/api/progress', {
        headers: { Cookie: `__Host-spp_session=${sessionCookie}` },
      }),
      progressEnv,
    )
    expect(loaded.status).toBe(200)
    const loadedBody = await loaded.json() as {
      record: { version: number; revision: number; progress: ReturnType<typeof progressFixture> }
    }
    expect(loadedBody.record).toMatchObject({ version: 1, revision: 1 })
    expect(loadedBody.record.progress.completedLessons).toEqual(firstPythonLessonIds)
    expect(JSON.parse(database.row!.progress_json)).not.toHaveProperty('completedLessons')

    const saved = await handleRequest(
      new Request('https://seepoundcoffeepie.com/api/progress', {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          version: 1,
          revision: loadedBody.record.revision,
          progress: loadedBody.record.progress,
        }),
      }),
      progressEnv,
    )
    expect(saved.status).toBe(200)
    await expect(saved.json()).resolves.toMatchObject({ record: { revision: 2 } })
    expect(JSON.parse(database.row!.progress_json)).toMatchObject({
      completedLessons: firstPythonLessonIds,
      completedMissions: ['py-first-spark'],
    })
  })

  it('preserves partial lesson progress when a pre-Phase 4F client omits the new field', async () => {
    const sessionCookie = await sessionCookieFor()
    const database = new MemoryD1()
    const progressEnv = { ...htmlEnv, LEARNER_DB: database }
    const headers = {
      Cookie: `__Host-spp_session=${sessionCookie}`,
      Origin: 'https://seepoundcoffeepie.com',
      'Content-Type': 'application/json',
    }
    const partialLesson = firstPythonLessonIds[0]
    const currentProgress = {
      ...initialProgress('python'),
      callsign: 'Rolling Upgrade Cadet',
      onboardingComplete: true,
      completedLessons: [partialLesson],
    }
    const created = await handleRequest(
      new Request('https://seepoundcoffeepie.com/api/progress', {
        method: 'PUT',
        headers,
        body: JSON.stringify({ version: 1, revision: 0, progress: currentProgress }),
      }),
      progressEnv,
    )
    expect(created.status).toBe(200)

    const legacyProgress: Record<string, unknown> = { ...currentProgress, xp: 9 }
    delete legacyProgress.completedLessons
    const legacySave = await handleRequest(
      new Request('https://seepoundcoffeepie.com/api/progress', {
        method: 'PUT',
        headers,
        body: JSON.stringify({ version: 1, revision: 1, progress: legacyProgress }),
      }),
      progressEnv,
    )

    expect(legacySave.status).toBe(200)
    await expect(legacySave.json()).resolves.toMatchObject({
      record: {
        revision: 2,
        progress: { xp: 9, completedLessons: [partialLesson] },
      },
    })
    expect(JSON.parse(database.row!.progress_json)).toMatchObject({
      xp: 9,
      completedLessons: [partialLesson],
    })

    const explicitClear = await handleRequest(
      new Request('https://seepoundcoffeepie.com/api/progress', {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          version: 1,
          revision: 2,
          progress: {
            ...currentProgress,
            completedLessons: [],
            completedMissions: [],
          },
        }),
      }),
      progressEnv,
    )

    expect(explicitClear.status).toBe(200)
    await expect(explicitClear.json()).resolves.toMatchObject({
      record: { revision: 3, progress: { completedLessons: [], completedMissions: [] } },
    })
    expect(JSON.parse(database.row!.progress_json)).toMatchObject({
      completedLessons: [],
      completedMissions: [],
    })
  })

  it('rejects unknown and duplicate persisted lesson identifiers', async () => {
    const sessionCookie = await sessionCookieFor()
    const headers = {
      Cookie: `__Host-spp_session=${sessionCookie}`,
      Origin: 'https://seepoundcoffeepie.com',
      'Content-Type': 'application/json',
    }

    for (const completedLessons of [
      ['not-an-authored-lesson'],
      [firstPythonLessonIds[0], firstPythonLessonIds[0]],
    ]) {
      const database = new MemoryD1()
      const response = await handleRequest(
        new Request('https://seepoundcoffeepie.com/api/progress', {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            version: 1,
            revision: 0,
            progress: { ...progressFixture(), completedLessons },
          }),
        }),
        { ...htmlEnv, LEARNER_DB: database },
      )

      expect(response.status).toBe(400)
      await expect(response.json()).resolves.toEqual({
        error: 'The learning record contains missing, unknown, or unsafe values.',
      })
      expect(database.row).toBeNull()
    }
  })

  it('stores and returns Phase 5B identifiers through the unchanged version 1 record', async () => {
    const sessionCookie = await sessionCookieFor()
    const database = new MemoryD1()
    const progressEnv = { ...htmlEnv, LEARNER_DB: database }
    const headers = {
      Cookie: `__Host-spp_session=${sessionCookie}`,
      Origin: 'https://seepoundcoffeepie.com',
      'Content-Type': 'application/json',
    }
    const moduleId = 'cpp-records-summaries'
    const moduleLessons = cppCollectionsRecordsManifest[moduleId]
    const progress = {
      ...initialProgress('cpp'),
      callsign: 'Compatibility Cadet',
      completedLessons: moduleLessons.map((lesson) => lesson.id),
      completedMissions: [moduleId],
      conceptProgress: {
        'cpp-record-aggregation': {
          strength: 2,
          correct: 3,
          incorrect: 1,
          dueAt: '2026-08-29',
        },
      },
      onboardingComplete: true,
    }
    const created = await handleRequest(
      new Request('https://seepoundcoffeepie.com/api/progress', {
        method: 'PUT',
        headers,
        body: JSON.stringify({ version: 1, revision: 0, progress }),
      }),
      progressEnv,
    )

    expect(created.status).toBe(200)
    await expect(created.json()).resolves.toMatchObject({
      version: 1,
      record: {
        version: 1,
        revision: 1,
        progress: {
          completedLessons: moduleLessons.map((lesson) => lesson.id),
          completedMissions: [moduleId],
          conceptProgress: progress.conceptProgress,
        },
      },
    })
    expect(database.row?.schema_version).toBe(1)

    const loaded = await handleRequest(
      new Request('https://seepoundcoffeepie.com/api/progress', {
        headers: { Cookie: `__Host-spp_session=${sessionCookie}` },
      }),
      progressEnv,
    )
    expect(loaded.status).toBe(200)
    await expect(loaded.json()).resolves.toMatchObject({
      version: 1,
      record: {
        version: 1,
        revision: 1,
        progress: {
          completedLessons: moduleLessons.map((lesson) => lesson.id),
          completedMissions: [moduleId],
          conceptProgress: progress.conceptProgress,
        },
      },
    })
  })

  it('requires authentication and same-origin confirmation for account progress changes', async () => {
    const database = new MemoryD1()
    const unauthenticated = await handleRequest(
      new Request('https://seepoundcoffeepie.com/api/progress'),
      { ...htmlEnv, LEARNER_DB: database },
    )
    expect(unauthenticated.status).toBe(401)

    const sessionCookie = await sessionCookieFor()
    const rejected = await handleRequest(
      new Request('https://seepoundcoffeepie.com/api/progress', {
        method: 'PUT',
        headers: {
          Cookie: `__Host-spp_session=${sessionCookie}`,
          Origin: 'https://malicious.example',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ version: 1, revision: 0, progress: progressFixture() }),
      }),
      { ...htmlEnv, LEARNER_DB: database },
    )
    expect(rejected.status).toBe(403)
    expect(database.row).toBeNull()
  })

  it('returns the newer account revision on conflict and isolates records between users', async () => {
    const database = new MemoryD1()
    const firstSession = await sessionCookieFor(314)
    const secondSession = await sessionCookieFor(2718)
    const progressEnv = { ...htmlEnv, LEARNER_DB: database }
    const writeHeaders = {
      Cookie: `__Host-spp_session=${firstSession}`,
      Origin: 'https://seepoundcoffeepie.com',
      'Content-Type': 'application/json',
    }
    await handleRequest(
      new Request('https://seepoundcoffeepie.com/api/progress', {
        method: 'PUT',
        headers: writeHeaders,
        body: JSON.stringify({ version: 1, revision: 0, progress: progressFixture() }),
      }),
      progressEnv,
    )
    const conflict = await handleRequest(
      new Request('https://seepoundcoffeepie.com/api/progress', {
        method: 'PUT',
        headers: writeHeaders,
        body: JSON.stringify({ version: 1, revision: 0, progress: { ...progressFixture(), xp: 999 } }),
      }),
      progressEnv,
    )
    expect(conflict.status).toBe(409)
    await expect(conflict.json()).resolves.toMatchObject({ record: { revision: 1, progress: { xp: 25 } } })

    const otherLearner = await handleRequest(
      new Request('https://seepoundcoffeepie.com/api/progress', {
        headers: { Cookie: `__Host-spp_session=${secondSession}` },
      }),
      progressEnv,
    )
    await expect(otherLearner.json()).resolves.toEqual({ version: 1, record: null })
  })

  it('reports the runner kill switch without creating a learner identity', async () => {
    const response = await handleRequest(
      new Request('https://seepoundcoffeepie.com/api/runner/status'),
      { ...htmlEnv, RUNNER_ENABLED: 'false' },
    )

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      enabled: false,
      version: 1,
      languages: ['python', 'cpp', 'csharp', 'java'],
    })
    expect(response.headers.get('Set-Cookie')).toBeNull()
  })

  it('does not issue runner grants for any unpublished Phase 5B editable lesson', async () => {
    const runnerEnv = {
      ...htmlEnv,
      RUNNER_ENABLED: 'true',
      RUNNER_CONTROL: {
        getByName: vi.fn(),
      },
    }
    const editableLessonIds = cppCollectionsRecordsLessons
      .filter((lesson) => lesson.runnerBacked)
      .map((lesson) => lesson.id)
    expect(editableLessonIds).toHaveLength(12)

    for (const exerciseId of editableLessonIds) {
      const response = await handleRequest(
        new Request('https://seepoundcoffeepie.com/api/runner/grants', {
          method: 'POST',
          headers: {
            Origin: 'https://seepoundcoffeepie.com',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ exerciseId }),
        }),
        runnerEnv,
      )
      expect(response.status, exerciseId).toBe(404)
      await expect(response.json()).resolves.toEqual({
        error: 'This page does not have a code check yet.',
      })
    }
    expect(runnerEnv.RUNNER_CONTROL.getByName).not.toHaveBeenCalled()
  })

  it('issues a scoped guest grant and submits only validated source to the coordinator', async () => {
    const coordinatorFetch = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      const internal = JSON.parse(String(init?.body))
      expect(internal.exerciseId).toBe('py-print')
      expect(internal.request).toEqual({ version: 1, language: 'python', source: 'print("Signal online")' })
      expect(internal.ownerId).toMatch(/^[A-Za-z0-9_-]{40,}$/u)
      expect(internal.ipHash).toMatch(/^[A-Za-z0-9_-]{40,}$/u)
      return Response.json({ version: 1, runId: internal.runId, status: 'queued', pollAfterMs: 650 })
    })
    const runnerEnv = {
      ...htmlEnv,
      RUNNER_ENABLED: 'true',
      RUNNER_CONTROL: {
        getByName: vi.fn(() => ({ fetch: coordinatorFetch })),
      },
    }
    const originHeaders = {
      Origin: 'https://seepoundcoffeepie.com',
      'Content-Type': 'application/json',
    }
    const grantResponse = await handleRequest(
      new Request('https://seepoundcoffeepie.com/api/runner/grants', {
        method: 'POST',
        headers: originHeaders,
        body: JSON.stringify({ exerciseId: 'py-print', language: 'python' }),
      }),
      runnerEnv,
    )
    expect(grantResponse.status).toBe(200)
    const grantBody = await grantResponse.json() as { grant: string }
    const guestCookie = cookieValue(grantResponse, '__Host-spp_runner_guest')
    expect(grantBody.grant).toMatch(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/u)
    expect(guestCookie).toBeTruthy()

    const runResponse = await handleRequest(
      new Request('https://seepoundcoffeepie.com/api/runner/runs', {
        method: 'POST',
        headers: {
          ...originHeaders,
          Cookie: `__Host-spp_runner_guest=${guestCookie}`,
          'CF-Connecting-IP': '192.0.2.4',
          'X-Runner-Grant': grantBody.grant,
        },
        body: JSON.stringify({ version: 1, language: 'python', source: 'print("Signal online")' }),
      }),
      runnerEnv,
    )

    expect(runResponse.status).toBe(200)
    await expect(runResponse.json()).resolves.toMatchObject({ status: 'queued' })

    const unreadableResponse = await handleRequest(
      new Request('https://seepoundcoffeepie.com/api/runner/runs', {
        method: 'POST',
        headers: {
          ...originHeaders,
          Cookie: `__Host-spp_runner_guest=${guestCookie}`,
          'X-Runner-Grant': grantBody.grant,
        },
        body: 'not a code check',
      }),
      runnerEnv,
    )
    expect(unreadableResponse.status).toBe(400)
    await expect(unreadableResponse.json()).resolves.toEqual({
      error: 'The code checker could not read this run. Start the check again.',
    })
    expect(coordinatorFetch).toHaveBeenCalledOnce()
  })

  it('exposes only the visible Supply Tracker output in its short-lived runner grant', async () => {
    const runnerEnv = {
      ...htmlEnv,
      RUNNER_ENABLED: 'true',
      RUNNER_CONTROL: {
        getByName: vi.fn(() => ({ fetch: vi.fn() })),
      },
    }
    const response = await handleRequest(
      new Request('https://seepoundcoffeepie.com/api/runner/grants', {
        method: 'POST',
        headers: {
          Origin: 'https://seepoundcoffeepie.com',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ exerciseId: 'pydata6-supply-tracker' }),
      }),
      runnerEnv,
    )

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body).toMatchObject({
      version: 1,
      language: 'python',
      visibleTest: {
        name: 'Visible console check',
        expectedOutput: 'Products: 2\nTotal units: 17\nRestock: markers',
      },
    })
    const serialized = JSON.stringify(body)
    expect(serialized).not.toContain('python-data-tools-supply-tracker-v1')
    expect(serialized).not.toContain('supply-tracker-visible-report')
    expect(serialized).not.toContain('authored_frame')
    expect(serialized).not.toContain('structuralChecks')
    expect(serialized).not.toContain('referenceSolution')
  })

  it('rejects cross-site grants and learner-selected commands before the coordinator', async () => {
    const coordinatorFetch = vi.fn()
    const runnerEnv = {
      ...htmlEnv,
      RUNNER_ENABLED: 'true',
      RUNNER_CONTROL: {
        getByName: vi.fn(() => ({ fetch: coordinatorFetch })),
      },
    }
    const crossSite = await handleRequest(
      new Request('https://seepoundcoffeepie.com/api/runner/grants', {
        method: 'POST',
        headers: { Origin: 'https://malicious.example', 'Content-Type': 'application/json' },
        body: JSON.stringify({ exerciseId: 'py-print' }),
      }),
      runnerEnv,
    )
    expect(crossSite.status).toBe(403)
    await expect(crossSite.json()).resolves.toEqual({
      error: 'Reload this page before starting the check again.',
    })

    const invalid = await handleRequest(
      new Request('https://seepoundcoffeepie.com/api/runner/runs', {
        method: 'POST',
        headers: {
          Origin: 'https://seepoundcoffeepie.com',
          'Content-Type': 'application/json',
          'X-Runner-Grant': 'invalid.invalid',
        },
        body: JSON.stringify({ version: 1, language: 'python', source: 'print(1)', command: 'sh' }),
      }),
      runnerEnv,
    )
    expect(invalid.status).toBe(401)
    await expect(invalid.json()).resolves.toEqual({
      error: 'This check expired. Start the check again.',
    })
    expect(coordinatorFetch).not.toHaveBeenCalled()
  })
})
