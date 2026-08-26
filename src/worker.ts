import { findRunnerAssignment } from './lib/runner-assignments'
import { RUNNER_API_VERSION, validateRunnerRequest } from './lib/runner-contract'
import { parseLearnerProgress, PROGRESS_BACKUP_MAX_BYTES } from './lib/progress-backup'
import { PROGRESS_RECORD_VERSION } from './lib/progress-sync'

interface AssetFetcher {
  fetch(request: Request): Promise<Response>
}

interface WorkerEnv {
  ASSETS: AssetFetcher
  GITHUB_CLIENT_ID?: string
  GITHUB_CLIENT_SECRET?: string
  SESSION_SECRET?: string
  LEARNER_DATA_SECRET?: string
  LEARNER_DB?: D1Database
  RUNNER_CONTROL?: Pick<DurableObjectNamespace, 'getByName'>
  RUNNER_CONFIG?: KVNamespace
  RUNNER_ENABLED?: string
  RUNNER_ORIGIN?: string
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

interface RunnerGuestPayload {
  id: string
  expiresAt: number
}

interface RunnerGrantPayload {
  ownerId: string
  exerciseId: string
  language: 'python' | 'cpp' | 'csharp' | 'java'
  expiresAt: number
  nonce: string
}

interface ProgressRow {
  revision: number
  progress_json: string
  updated_at: string
}

type ExternalFetch = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>

const CANONICAL_HOST = 'seepoundcoffeepie.com'
const CANONICAL_ORIGIN = `https://${CANONICAL_HOST}`
const CALLBACK_URL = `${CANONICAL_ORIGIN}/api/auth/github/callback`
const GITHUB_API_VERSION = '2026-03-10'
const OAUTH_COOKIE_AGE = 10 * 60
const SESSION_COOKIE_AGE = 7 * 24 * 60 * 60
const RUNNER_GUEST_COOKIE_AGE = 30 * 24 * 60 * 60
const RUNNER_GRANT_AGE = 5 * 60
const OAUTH_STATE_COOKIE = '__Host-spp_oauth_state'
const PKCE_COOKIE = '__Host-spp_oauth_pkce'
const SESSION_COOKIE = '__Host-spp_session'
const RUNNER_GUEST_COOKIE = '__Host-spp_runner_guest'
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
  return createSignedPayload(payload, secret)
}

async function createSignedPayload(payload: unknown, secret: string): Promise<string> {
  const encodedPayload = bytesToBase64Url(encoder.encode(JSON.stringify(payload)))
  const signature = await crypto.subtle.sign('HMAC', await hmacKey(secret), encoder.encode(encodedPayload))
  return `${encodedPayload}.${bytesToBase64Url(new Uint8Array(signature))}`
}

async function readSignedPayload(value: string | undefined, secret: string): Promise<unknown | null> {
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

    return JSON.parse(new TextDecoder().decode(base64UrlToBytes(encodedPayload))) as unknown
  } catch {
    return null
  }
}

async function readSession(value: string | undefined, secret: string): Promise<SessionPayload | null> {
  const payload = await readSignedPayload(value, secret) as SessionPayload | null
  try {
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

async function hmacTag(value: string, secret: string): Promise<string> {
  const signature = await crypto.subtle.sign('HMAC', await hmacKey(secret), encoder.encode(value))
  return bytesToBase64Url(new Uint8Array(signature))
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

async function progressOwner(request: Request, env: WorkerEnv): Promise<string | null> {
  if (!env.SESSION_SECRET || env.SESSION_SECRET.length < 32 || !env.LEARNER_DATA_SECRET || env.LEARNER_DATA_SECRET.length < 32) return null
  const session = await readSession(parseCookies(request).get(SESSION_COOKIE), env.SESSION_SECRET)
  return session ? hmacTag(`learning:${session.user.id}`, env.LEARNER_DATA_SECRET) : null
}

function progressRecord(row: ProgressRow): {
  version: typeof PROGRESS_RECORD_VERSION
  revision: number
  updatedAt: string
  progress: ReturnType<typeof parseLearnerProgress>
} | null {
  let value: unknown
  try {
    value = JSON.parse(row.progress_json)
  } catch {
    return null
  }
  const progress = parseLearnerProgress(value)
  if (!progress || !Number.isInteger(row.revision) || row.revision < 1) return null
  return {
    version: PROGRESS_RECORD_VERSION,
    revision: row.revision,
    updatedAt: row.updated_at,
    progress,
  }
}

async function readProgressRow(env: WorkerEnv, ownerId: string): Promise<ProgressRow | null> {
  if (!env.LEARNER_DB) return null
  return env.LEARNER_DB.prepare(
    'SELECT revision, progress_json, updated_at FROM learner_progress WHERE owner_id = ?',
  ).bind(ownerId).first<ProgressRow>()
}

async function getProgress(env: WorkerEnv, ownerId: string): Promise<Response> {
  const row = await readProgressRow(env, ownerId)
  if (!row) return json({ version: PROGRESS_RECORD_VERSION, record: null })
  const record = progressRecord(row)
  if (!record) return json({ error: 'The saved learning record could not be read safely.' }, 500)
  return json({ version: PROGRESS_RECORD_VERSION, record })
}

async function writeProgress(request: Request, env: WorkerEnv, ownerId: string): Promise<Response> {
  if (!sameOrigin(request, env)) return json({ error: 'Progress changes require a same-origin request.' }, 403)
  const contentLength = Number(request.headers.get('Content-Length') ?? '0')
  if (Number.isFinite(contentLength) && contentLength > PROGRESS_BACKUP_MAX_BYTES) {
    return json({ error: 'The learning record is too large.' }, 413)
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return json({ error: 'Send the learning record as JSON.' }, 400)
  }
  if (!body || typeof body !== 'object') return json({ error: 'Send one versioned learning record.' }, 400)
  const input = body as { version?: unknown; revision?: unknown; progress?: unknown }
  if (input.version !== PROGRESS_RECORD_VERSION) {
    return json({ error: `This server supports learning record version ${PROGRESS_RECORD_VERSION}.` }, 400)
  }
  if (!Number.isInteger(input.revision) || Number(input.revision) < 0) {
    return json({ error: 'The learning record revision is missing or invalid.' }, 400)
  }
  let progress = parseLearnerProgress(input.progress)
  if (!progress) return json({ error: 'The learning record contains missing, unknown, or unsafe values.' }, 400)
  const includesCompletedLessons = Boolean(
    input.progress
    && typeof input.progress === 'object'
    && !Array.isArray(input.progress)
    && Object.prototype.hasOwnProperty.call(input.progress, 'completedLessons'),
  )

  const expectedRevision = Number(input.revision)
  const current = await readProgressRow(env, ownerId)
  if (current && current.revision !== expectedRevision) {
    return json({
      error: 'This account changed on another device. Review the newer saved record before trying again.',
      record: progressRecord(current),
    }, 409)
  }
  if (!current && expectedRevision !== 0) {
    return json({
      error: 'The saved learning record no longer exists. Review this browser copy before creating it again.',
      record: null,
    }, 409)
  }

  // A pre-Phase 4F client still writes record version 1 but cannot echo the
  // completedLessons field. Preserve partial lesson completion during a rolling
  // client upgrade. Current clients always send the field, including [] when a
  // learner intentionally clears progress.
  if (current && !includesCompletedLessons) {
    const currentProgress = progressRecord(current)?.progress
    if (!currentProgress) {
      return json({ error: 'The saved learning record could not be read safely.' }, 500)
    }
    progress = {
      ...progress,
      completedLessons: [...new Set([
        ...currentProgress.completedLessons,
        ...progress.completedLessons,
      ])],
    }
  }

  const now = new Date().toISOString()
  const serialized = JSON.stringify(progress)
  if (new TextEncoder().encode(serialized).byteLength > PROGRESS_BACKUP_MAX_BYTES) {
    return json({ error: 'The learning record is too large.' }, 413)
  }
  const nextRevision = expectedRevision + 1
  const result = current
    ? await env.LEARNER_DB!.prepare(
        'UPDATE learner_progress SET revision = ?, progress_json = ?, updated_at = ? WHERE owner_id = ? AND revision = ?',
      ).bind(nextRevision, serialized, now, ownerId, expectedRevision).run()
    : await env.LEARNER_DB!.prepare(
        'INSERT OR IGNORE INTO learner_progress (owner_id, schema_version, revision, progress_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      ).bind(ownerId, PROGRESS_RECORD_VERSION, nextRevision, serialized, now, now).run()

  if (result.meta.changes !== 1) {
    const latest = await readProgressRow(env, ownerId)
    return json({
      error: 'This account changed on another device. Review the newer saved record before trying again.',
      record: latest ? progressRecord(latest) : null,
    }, 409)
  }

  return json({
    version: PROGRESS_RECORD_VERSION,
    record: {
      version: PROGRESS_RECORD_VERSION,
      revision: nextRevision,
      updatedAt: now,
      progress,
    },
  })
}

async function deleteProgress(request: Request, env: WorkerEnv, ownerId: string): Promise<Response> {
  if (!sameOrigin(request, env)) return json({ error: 'Progress deletion requires a same-origin request.' }, 403)
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return json({ error: 'Confirm learning-data deletion explicitly.' }, 400)
  }
  if (
    !body
    || typeof body !== 'object'
    || (body as { confirmation?: unknown }).confirmation !== 'DELETE MY LEARNING DATA'
  ) {
    return json({ error: 'Confirm learning-data deletion explicitly.' }, 400)
  }
  const result = await env.LEARNER_DB!.prepare(
    'DELETE FROM learner_progress WHERE owner_id = ?',
  ).bind(ownerId).run()
  return json({ deleted: true, recordsRemoved: result.meta.changes })
}

async function progressRequest(request: Request, env: WorkerEnv): Promise<Response> {
  if (!env.LEARNER_DB) return json({ error: 'Account progress storage is not configured.' }, 503)
  if (!env.LEARNER_DATA_SECRET || env.LEARNER_DATA_SECRET.length < 32) {
    return json({ error: 'Account progress identity is not configured.' }, 503)
  }
  const ownerId = await progressOwner(request, env)
  if (!ownerId) return json({ error: 'Sign in to access saved learning progress.' }, 401)
  if (request.method === 'GET') return getProgress(env, ownerId)
  if (request.method === 'PUT') return writeProgress(request, env, ownerId)
  if (request.method === 'DELETE') return deleteProgress(request, env, ownerId)
  return methodNotAllowed('GET, PUT, DELETE')
}

function runnerOrigin(env: WorkerEnv): string {
  if (!env.RUNNER_ORIGIN) return CANONICAL_ORIGIN
  try {
    const configured = new URL(env.RUNNER_ORIGIN)
    if (configured.protocol === 'https:' && configured.pathname === '/') return configured.origin
  } catch {
    // Fall through to the production origin when configuration is malformed.
  }
  return CANONICAL_ORIGIN
}

function sameOrigin(request: Request, env: WorkerEnv): boolean {
  return request.headers.get('Origin') === runnerOrigin(env)
}

async function runnerEnabled(env: WorkerEnv): Promise<boolean> {
  if (env.RUNNER_CONFIG) {
    const setting = await env.RUNNER_CONFIG.get('enabled')
    if (setting !== null) return setting === 'true'
  }
  return env.RUNNER_ENABLED === 'true'
}

function validGuestPayload(value: unknown): value is RunnerGuestPayload {
  if (!value || typeof value !== 'object') return false
  const payload = value as Partial<RunnerGuestPayload>
  return typeof payload.id === 'string'
    && /^[A-Za-z0-9_-]{30,80}$/u.test(payload.id)
    && typeof payload.expiresAt === 'number'
    && payload.expiresAt > Math.floor(Date.now() / 1000)
}

function validGrantPayload(value: unknown): value is RunnerGrantPayload {
  if (!value || typeof value !== 'object') return false
  const payload = value as Partial<RunnerGrantPayload>
  return typeof payload.ownerId === 'string'
    && payload.ownerId.length >= 32
    && typeof payload.exerciseId === 'string'
    && ['python', 'cpp', 'csharp', 'java'].includes(payload.language ?? '')
    && typeof payload.expiresAt === 'number'
    && payload.expiresAt > Math.floor(Date.now() / 1000)
    && typeof payload.nonce === 'string'
    && payload.nonce.length >= 20
}

async function runnerOwner(
  request: Request,
  env: WorkerEnv,
  createGuest: boolean,
): Promise<{ ownerId: string; cookies: string[] } | null> {
  if (!env.SESSION_SECRET || env.SESSION_SECRET.length < 32) return null
  const cookies = parseCookies(request)
  const session = await readSession(cookies.get(SESSION_COOKIE), env.SESSION_SECRET)
  if (session) {
    return {
      ownerId: await hmacTag(`github:${session.user.id}`, env.SESSION_SECRET),
      cookies: [],
    }
  }

  const guestValue = cookies.get(RUNNER_GUEST_COOKIE)
  const guest = await readSignedPayload(guestValue, env.SESSION_SECRET)
  if (validGuestPayload(guest)) {
    return {
      ownerId: await hmacTag(`guest:${guest.id}`, env.SESSION_SECRET),
      cookies: [],
    }
  }
  if (!createGuest) return null

  const expiresAt = Math.floor(Date.now() / 1000) + RUNNER_GUEST_COOKIE_AGE
  const payload: RunnerGuestPayload = { id: randomBase64Url(32), expiresAt }
  return {
    ownerId: await hmacTag(`guest:${payload.id}`, env.SESSION_SECRET),
    cookies: [secureCookie(
      RUNNER_GUEST_COOKIE,
      await createSignedPayload(payload, env.SESSION_SECRET),
      RUNNER_GUEST_COOKIE_AGE,
    )],
  }
}

async function runnerGrant(request: Request, env: WorkerEnv): Promise<Response> {
  if (!sameOrigin(request, env)) return json({ error: 'Runner grants require a same-origin request.' }, 403)
  if (!env.SESSION_SECRET || env.SESSION_SECRET.length < 32 || !env.RUNNER_CONTROL) {
    return json({ error: 'Live code execution is not configured.' }, 503)
  }
  if (!await runnerEnabled(env)) return json({ error: 'Live code execution is temporarily paused.' }, 503)

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return json({ error: 'Send one exercise identifier.' }, 400)
  }
  const exerciseId = body && typeof body === 'object' && 'exerciseId' in body
    ? (body as { exerciseId?: unknown }).exerciseId
    : null
  if (typeof exerciseId !== 'string') return json({ error: 'Choose one editable academy exercise.' }, 400)

  const assignment = findRunnerAssignment(exerciseId)
  if (!assignment) return json({ error: 'That exercise does not support live execution.' }, 404)
  const owner = await runnerOwner(request, env, true)
  if (!owner) return json({ error: 'The runner could not create a private learner session.' }, 503)

  const payload: RunnerGrantPayload = {
    ownerId: owner.ownerId,
    exerciseId,
    language: assignment.language,
    expiresAt: Math.floor(Date.now() / 1000) + RUNNER_GRANT_AGE,
    nonce: randomBase64Url(18),
  }
  return json({
    version: RUNNER_API_VERSION,
    grant: await createSignedPayload(payload, env.SESSION_SECRET),
    expiresIn: RUNNER_GRANT_AGE,
    language: assignment.language,
    visibleTest: {
      name: 'Visible console check',
      expectedOutput: assignment.expectedOutput,
    },
  }, 200, owner.cookies)
}

async function readRunnerGrant(request: Request, env: WorkerEnv): Promise<RunnerGrantPayload | null> {
  if (!env.SESSION_SECRET) return null
  const header = request.headers.get('X-Runner-Grant')
  const payload = await readSignedPayload(header ?? undefined, env.SESSION_SECRET)
  return validGrantPayload(payload) ? payload : null
}

async function submitRunnerRun(request: Request, env: WorkerEnv): Promise<Response> {
  if (!sameOrigin(request, env)) return json({ error: 'Code runs require a same-origin request.' }, 403)
  if (!env.SESSION_SECRET || !env.RUNNER_CONTROL) return json({ error: 'Live code execution is not configured.' }, 503)
  if (!await runnerEnabled(env)) return json({ error: 'Live code execution is temporarily paused.' }, 503)

  const grant = await readRunnerGrant(request, env)
  const owner = await runnerOwner(request, env, false)
  if (!grant || !owner || grant.ownerId !== owner.ownerId) {
    return json({ error: 'This short-lived run grant is missing or expired. Request a new one.' }, 401)
  }

  const contentLength = Number(request.headers.get('Content-Length') ?? '0')
  if (Number.isFinite(contentLength) && contentLength > 25_000) {
    return json({ error: 'The runner request is too large.' }, 413)
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return json({ error: 'Send the code run as JSON.' }, 400)
  }
  const validation = validateRunnerRequest(body)
  if (!validation.ok) return json({ error: validation.message, issue: validation.issue }, 400)
  if (validation.request.language !== grant.language) {
    return json({ error: 'The run language must match the current exercise.' }, 400)
  }

  const assignment = findRunnerAssignment(grant.exerciseId)
  if (!assignment || assignment.language !== grant.language) {
    return json({ error: 'The run grant no longer matches an academy exercise.' }, 400)
  }

  const address = request.headers.get('CF-Connecting-IP') ?? 'unknown'
  const payload = {
    runId: randomBase64Url(24),
    ownerId: owner.ownerId,
    ipHash: await hmacTag(`runner-ip:${address}`, env.SESSION_SECRET),
    exerciseId: grant.exerciseId,
    request: validation.request,
  }
  const stub = env.RUNNER_CONTROL.getByName('global-v1')
  const response = await stub.fetch('https://runner.internal/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return new Response(response.body, { status: response.status, headers: response.headers })
}

async function runnerResult(request: Request, env: WorkerEnv, runId: string): Promise<Response> {
  if (!env.RUNNER_CONTROL) return json({ error: 'Live code execution is not configured.' }, 503)
  const owner = await runnerOwner(request, env, false)
  if (!owner) return json({ error: 'Run not found.' }, 404)

  const stub = env.RUNNER_CONTROL.getByName('global-v1')
  const response = await stub.fetch(`https://runner.internal/result/${encodeURIComponent(runId)}`, {
    headers: { 'X-Runner-Owner': owner.ownerId },
  })
  return new Response(response.body, { status: response.status, headers: response.headers })
}

async function runnerRequest(request: Request, env: WorkerEnv): Promise<Response> {
  const url = new URL(request.url)
  if (url.pathname === '/api/runner/status') {
    if (request.method !== 'GET') return methodNotAllowed('GET')
    return json({
      enabled: Boolean(env.RUNNER_CONTROL) && await runnerEnabled(env),
      version: RUNNER_API_VERSION,
      languages: ['python', 'cpp', 'csharp', 'java'],
    })
  }
  if (url.pathname === '/api/runner/grants') {
    if (request.method !== 'POST') return methodNotAllowed('POST')
    return runnerGrant(request, env)
  }
  if (url.pathname === '/api/runner/runs') {
    if (request.method !== 'POST') return methodNotAllowed('POST')
    return submitRunnerRun(request, env)
  }
  if (url.pathname.startsWith('/api/runner/runs/')) {
    if (request.method !== 'GET') return methodNotAllowed('GET')
    return runnerResult(request, env, url.pathname.slice('/api/runner/runs/'.length))
  }
  return json({ error: 'Runner endpoint not found.' }, 404)
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

  if (url.pathname === '/api/progress') {
    const expectedOrigin = new URL(runnerOrigin(env))
    if (url.origin !== expectedOrigin.origin) {
      url.protocol = expectedOrigin.protocol
      url.host = expectedOrigin.host
      return Response.redirect(url.toString(), 308)
    }
    try {
      return await progressRequest(request, env)
    } catch {
      return json({ error: 'Saved learning progress is temporarily unavailable. The browser copy was not changed.' }, 500)
    }
  }

  if (url.pathname.startsWith('/api/runner/')) {
    const expectedOrigin = new URL(runnerOrigin(env))
    if (url.origin !== expectedOrigin.origin) {
      url.protocol = expectedOrigin.protocol
      url.host = expectedOrigin.host
      return Response.redirect(url.toString(), 308)
    }
    try {
      return await runnerRequest(request, env)
    } catch {
      return json({ error: 'The academy runner had an infrastructure problem. Learner code was not blamed.' }, 500)
    }
  }

  return withBrowserSecurityHeaders(await env.ASSETS.fetch(request), url)
}

export {
  RunnerCoordinator,
  RunnerCppSandbox,
  RunnerCsharpSandbox,
  RunnerJavaSandbox,
  RunnerPythonSandbox,
} from './runner-coordinator'

export default {
  fetch(request: Request, env: WorkerEnv): Promise<Response> {
    return handleRequest(request, env)
  },
}
