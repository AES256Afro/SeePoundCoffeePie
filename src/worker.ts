interface AssetFetcher {
  fetch(request: Request): Promise<Response>
}

interface WorkerEnv {
  ASSETS: AssetFetcher
  GITHUB_CLIENT_ID?: string
  GITHUB_CLIENT_SECRET?: string
  SESSION_SECRET?: string
}

interface GitHubUser {
  id: string
  login: string
  name: string | null
}

interface SessionPayload {
  user: GitHubUser
  issuedAt: number
  expiresAt: number
}

type ExternalFetch = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>

const CANONICAL_HOST = 'seepoundcoffeepie.com'
const CANONICAL_ORIGIN = `https://${CANONICAL_HOST}`
const CALLBACK_URL = `${CANONICAL_ORIGIN}/api/auth/github/callback`
const GITHUB_API_VERSION = '2026-03-10'
const OAUTH_COOKIE_AGE = 10 * 60
const SESSION_COOKIE_AGE = 7 * 24 * 60 * 60
const OAUTH_STATE_COOKIE = '__Host-spp_oauth_state'
const PKCE_COOKIE = '__Host-spp_oauth_pkce'
const SESSION_COOKIE = '__Host-spp_session'
const PKCE_VERIFIER_PATTERN = /^[A-Za-z0-9._~-]{43,128}$/u
const encoder = new TextEncoder()

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/u, '')
}

function base64UrlToBytes(value: string): Uint8Array<ArrayBuffer> {
  const base64 = value.replaceAll('-', '+').replaceAll('_', '/')
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
  const binary = atob(padded)
  const bytes = new Uint8Array(new ArrayBuffer(binary.length))
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }
  return bytes
}

function randomBase64Url(byteLength: number): string {
  const bytes = new Uint8Array(byteLength)
  crypto.getRandomValues(bytes)
  return bytesToBase64Url(bytes)
}

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(value))
  return bytesToBase64Url(new Uint8Array(digest))
}

function parseCookies(request: Request): Map<string, string> {
  const cookies = new Map<string, string>()
  for (const part of (request.headers.get('Cookie') ?? '').split(';')) {
    const separator = part.indexOf('=')
    if (separator < 1) continue
    const name = part.slice(0, separator).trim()
    const value = part.slice(separator + 1).trim()
    cookies.set(name, value)
  }
  return cookies
}

function secureCookie(name: string, value: string, maxAge: number): string {
  return `${name}=${value}; Path=/; Max-Age=${maxAge}; Secure; HttpOnly; SameSite=Lax`
}

function clearCookie(name: string): string {
  return secureCookie(name, '', 0)
}

function appendCookies(headers: Headers, cookies: string[]): void {
  for (const cookie of cookies) headers.append('Set-Cookie', cookie)
}

function redirect(location: string, cookies: string[] = []): Response {
  const headers = new Headers({
    'Cache-Control': 'no-store',
    Location: location,
    'Referrer-Policy': 'no-referrer',
  })
  appendCookies(headers, cookies)
  return new Response(null, { status: 302, headers })
}

function json(body: unknown, status = 200, cookies: string[] = []): Response {
  const headers = new Headers({
    'Cache-Control': 'no-store',
    'Content-Type': 'application/json; charset=UTF-8',
    'Referrer-Policy': 'no-referrer',
    'X-Content-Type-Options': 'nosniff',
  })
  appendCookies(headers, cookies)
  return new Response(JSON.stringify(body), { status, headers })
}

function methodNotAllowed(allowed: string): Response {
  const response = json({ error: 'Method not allowed.' }, 405)
  response.headers.set('Allow', allowed)
  return response
}

function hasAuthSecrets(env: WorkerEnv): env is WorkerEnv & Required<Pick<WorkerEnv, 'GITHUB_CLIENT_ID' | 'GITHUB_CLIENT_SECRET' | 'SESSION_SECRET'>> {
  return Boolean(
    env.GITHUB_CLIENT_ID
    && env.GITHUB_CLIENT_SECRET
    && env.SESSION_SECRET
    && env.SESSION_SECRET.length >= 32,
  )
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  )
}

async function createSession(payload: SessionPayload, secret: string): Promise<string> {
  const encodedPayload = bytesToBase64Url(encoder.encode(JSON.stringify(payload)))
  const signature = await crypto.subtle.sign('HMAC', await hmacKey(secret), encoder.encode(encodedPayload))
  return `${encodedPayload}.${bytesToBase64Url(new Uint8Array(signature))}`
}

async function readSession(value: string | undefined, secret: string): Promise<SessionPayload | null> {
  if (!value) return null
  const parts = value.split('.')
  if (parts.length !== 2) return null

  try {
    const [encodedPayload, encodedSignature] = parts
    const valid = await crypto.subtle.verify(
      'HMAC',
      await hmacKey(secret),
      base64UrlToBytes(encodedSignature),
      encoder.encode(encodedPayload),
    )
    if (!valid) return null

    const payload = JSON.parse(new TextDecoder().decode(base64UrlToBytes(encodedPayload))) as SessionPayload
    if (
      typeof payload?.user?.id !== 'string'
      || typeof payload.user.login !== 'string'
      || (payload.user.name !== null && typeof payload.user.name !== 'string')
      || typeof payload.issuedAt !== 'number'
      || typeof payload.expiresAt !== 'number'
      || payload.expiresAt <= Math.floor(Date.now() / 1000)
    ) return null

    return payload
  } catch {
    return null
  }
}

function basicAuthorization(clientId: string, clientSecret: string): string {
  const bytes = encoder.encode(`${clientId}:${clientSecret}`)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return `Basic ${btoa(binary)}`
}

async function startGitHubAuth(env: WorkerEnv): Promise<Response> {
  if (!hasAuthSecrets(env)) return json({ error: 'GitHub sign-in is not configured.' }, 503)

  const state = randomBase64Url(32)
  const verifier = randomBase64Url(48)
  const authorizeUrl = new URL('https://github.com/login/oauth/authorize')
  authorizeUrl.searchParams.set('client_id', env.GITHUB_CLIENT_ID)
  authorizeUrl.searchParams.set('redirect_uri', CALLBACK_URL)
  authorizeUrl.searchParams.set('response_type', 'code')
  authorizeUrl.searchParams.set('state', state)
  authorizeUrl.searchParams.set('code_challenge', await sha256(verifier))
  authorizeUrl.searchParams.set('code_challenge_method', 'S256')

  return redirect(authorizeUrl.toString(), [
    secureCookie(OAUTH_STATE_COOKIE, state, OAUTH_COOKIE_AGE),
    secureCookie(PKCE_COOKIE, verifier, OAUTH_COOKIE_AGE),
  ])
}

function authFailure(reason: string): Response {
  const url = new URL('/', CANONICAL_ORIGIN)
  url.searchParams.set('auth', 'error')
  url.searchParams.set('reason', reason)
  return redirect(url.toString(), [clearCookie(OAUTH_STATE_COOKIE), clearCookie(PKCE_COOKIE)])
}

async function exchangeGitHubCode(
  code: string,
  verifier: string,
  env: WorkerEnv & Required<Pick<WorkerEnv, 'GITHUB_CLIENT_ID' | 'GITHUB_CLIENT_SECRET' | 'SESSION_SECRET'>>,
  externalFetch: ExternalFetch,
): Promise<string | null> {
  const response = await externalFetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'SeePoundCoffeePie',
    },
    body: new URLSearchParams({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: CALLBACK_URL,
      code_verifier: verifier,
    }),
  })
  if (!response.ok) return null

  const data = await response.json() as { access_token?: unknown }
  return typeof data.access_token === 'string' && data.access_token ? data.access_token : null
}

async function fetchGitHubUser(accessToken: string, externalFetch: ExternalFetch): Promise<GitHubUser | null> {
  const response = await externalFetch('https://api.github.com/user', {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${accessToken}`,
      'User-Agent': 'SeePoundCoffeePie',
      'X-GitHub-Api-Version': GITHUB_API_VERSION,
    },
  })
  if (!response.ok) return null

  const data = await response.json() as { id?: unknown; login?: unknown; name?: unknown }
  if ((typeof data.id !== 'number' && typeof data.id !== 'string') || typeof data.login !== 'string') return null

  return {
    id: String(data.id),
    login: data.login,
    name: typeof data.name === 'string' && data.name.trim() ? data.name.trim() : null,
  }
}

async function revokeGitHubGrant(
  accessToken: string,
  env: WorkerEnv & Required<Pick<WorkerEnv, 'GITHUB_CLIENT_ID' | 'GITHUB_CLIENT_SECRET' | 'SESSION_SECRET'>>,
  externalFetch: ExternalFetch,
): Promise<boolean> {
  const headers = {
    Accept: 'application/vnd.github+json',
    Authorization: basicAuthorization(env.GITHUB_CLIENT_ID, env.GITHUB_CLIENT_SECRET),
    'Content-Type': 'application/json',
    'User-Agent': 'SeePoundCoffeePie',
    'X-GitHub-Api-Version': GITHUB_API_VERSION,
  }
  const body = JSON.stringify({ access_token: accessToken })
  const grantResponse = await externalFetch(
    `https://api.github.com/applications/${encodeURIComponent(env.GITHUB_CLIENT_ID)}/grant`,
    {
      method: 'DELETE',
      headers,
      body,
    },
  )
  if (grantResponse.status === 204) return true

  const tokenResponse = await externalFetch(
    `https://api.github.com/applications/${encodeURIComponent(env.GITHUB_CLIENT_ID)}/token`,
    { method: 'DELETE', headers, body },
  )
  return tokenResponse.status === 204
}

async function completeGitHubAuth(request: Request, env: WorkerEnv, externalFetch: ExternalFetch): Promise<Response> {
  if (!hasAuthSecrets(env)) return authFailure('not-configured')

  const url = new URL(request.url)
  if (url.searchParams.has('error')) return authFailure('cancelled')

  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const cookies = parseCookies(request)
  const expectedState = cookies.get(OAUTH_STATE_COOKIE)
  const verifier = cookies.get(PKCE_COOKIE)
  if (
    !code
    || !state
    || !expectedState
    || state !== expectedState
    || !verifier
    || !PKCE_VERIFIER_PATTERN.test(verifier)
  ) {
    return authFailure('invalid-request')
  }

  const accessToken = await exchangeGitHubCode(code, verifier, env, externalFetch)
  if (!accessToken) return authFailure('github-exchange')

  const user = await fetchGitHubUser(accessToken, externalFetch).catch(() => null)
  const grantRevoked = await revokeGitHubGrant(accessToken, env, externalFetch).catch(() => false)
  if (!user) return authFailure('github-profile')
  if (!grantRevoked) return authFailure('github-cleanup')

  const now = Math.floor(Date.now() / 1000)
  const session = await createSession({
    user,
    issuedAt: now,
    expiresAt: now + SESSION_COOKIE_AGE,
  }, env.SESSION_SECRET)

  return redirect(`${CANONICAL_ORIGIN}/?auth=success`, [
    clearCookie(OAUTH_STATE_COOKIE),
    clearCookie(PKCE_COOKIE),
    secureCookie(SESSION_COOKIE, session, SESSION_COOKIE_AGE),
  ])
}

async function sessionResponse(request: Request, env: WorkerEnv): Promise<Response> {
  if (!env.SESSION_SECRET) return json({ authenticated: false, user: null })

  const value = parseCookies(request).get(SESSION_COOKIE)
  const session = await readSession(value, env.SESSION_SECRET)
  if (!session) {
    return json(
      { authenticated: false, user: null },
      200,
      value ? [clearCookie(SESSION_COOKIE)] : [],
    )
  }
  return json({ authenticated: true, user: session.user })
}

function logout(request: Request): Response {
  if (request.headers.get('Origin') !== CANONICAL_ORIGIN) {
    return json({ error: 'The logout request must come from the canonical site.' }, 403)
  }
  return json({ authenticated: false, user: null }, 200, [clearCookie(SESSION_COOKIE)])
}

async function authRequest(
  request: Request,
  env: WorkerEnv,
  externalFetch: ExternalFetch,
): Promise<Response> {
  const url = new URL(request.url)

  if (url.pathname === '/api/auth/github/start') {
    if (request.method !== 'GET') return methodNotAllowed('GET')
    return startGitHubAuth(env)
  }
  if (url.pathname === '/api/auth/github/callback') {
    if (request.method !== 'GET') return methodNotAllowed('GET')
    try {
      return await completeGitHubAuth(request, env, externalFetch)
    } catch {
      return authFailure('server-error')
    }
  }
  if (url.pathname === '/api/auth/session') {
    if (request.method !== 'GET') return methodNotAllowed('GET')
    return sessionResponse(request, env)
  }
  if (url.pathname === '/api/auth/logout') {
    if (request.method !== 'POST') return methodNotAllowed('POST')
    return logout(request)
  }
  return json({ error: 'Auth endpoint not found.' }, 404)
}

function withBrowserSecurityHeaders(response: Response, url: URL): Response {
  const headers = new Headers(response.headers)

  headers.set(
    'Content-Security-Policy',
    "default-src 'self'; base-uri 'self'; connect-src 'self'; font-src 'self'; form-action 'self'; frame-ancestors 'none'; img-src 'self' data:; object-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; upgrade-insecure-requests",
  )
  headers.set('Cross-Origin-Opener-Policy', 'same-origin')
  headers.set('Permissions-Policy', 'camera=(), geolocation=(), microphone=()')
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  headers.set('Strict-Transport-Security', 'max-age=15552000')
  headers.set('X-Content-Type-Options', 'nosniff')
  headers.set('X-Frame-Options', 'DENY')

  if (url.pathname.startsWith('/assets/')) {
    headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  } else if (headers.get('Content-Type')?.includes('text/html')) {
    headers.set('Cache-Control', 'public, max-age=0, must-revalidate')
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

export async function handleRequest(
  request: Request,
  env: WorkerEnv,
  externalFetch: ExternalFetch = fetch,
): Promise<Response> {
  const url = new URL(request.url)

  if (url.protocol !== 'https:' || url.hostname === `www.${CANONICAL_HOST}`) {
    url.protocol = 'https:'
    url.hostname = CANONICAL_HOST
    return Response.redirect(url.toString(), 308)
  }

  if (url.pathname.startsWith('/api/auth/')) {
    if (url.hostname !== CANONICAL_HOST) {
      url.hostname = CANONICAL_HOST
      return Response.redirect(url.toString(), 308)
    }
    return authRequest(request, env, externalFetch)
  }

  return withBrowserSecurityHeaders(await env.ASSETS.fetch(request), url)
}

export default {
  fetch(request: Request, env: WorkerEnv): Promise<Response> {
    return handleRequest(request, env)
  },
}
