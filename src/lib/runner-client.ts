import type { LanguageId } from '../types'
import {
  RUNNER_API_VERSION,
  type RunnerAccepted,
  type RunnerPending,
  type RunnerResult,
} from './runner-contract'

const MAX_WAIT_MS = 45_000
const MIN_POLL_MS = 200
const MAX_POLL_MS = 2_000

export type RunnerClientStatus = 'requesting' | 'queued' | 'running'

export class RunnerClientError extends Error {
  readonly retryable: boolean

  constructor(message: string, retryable = false) {
    super(message)
    this.name = 'RunnerClientError'
    this.retryable = retryable
  }
}

async function readJson(response: Response): Promise<Record<string, unknown>> {
  try {
    return await response.json() as Record<string, unknown>
  } catch {
    throw new RunnerClientError('The training runner returned an unreadable response. Please try again.', true)
  }
}

async function expectJson(response: Response): Promise<Record<string, unknown>> {
  const body = await readJson(response)
  if (!response.ok) {
    const message = typeof body.error === 'string'
      ? body.error
      : 'The training runner could not start this check. Please try again.'
    throw new RunnerClientError(message, body.retryable === true || response.status >= 500)
  }
  return body
}

function isAccepted(value: Record<string, unknown>): value is Record<string, unknown> & RunnerAccepted {
  return value.version === RUNNER_API_VERSION
    && typeof value.runId === 'string'
    && value.status === 'queued'
    && typeof value.pollAfterMs === 'number'
}

function isPending(value: Record<string, unknown>): value is Record<string, unknown> & RunnerPending {
  return value.version === RUNNER_API_VERSION
    && typeof value.runId === 'string'
    && (value.status === 'queued' || value.status === 'running')
    && typeof value.pollAfterMs === 'number'
}

function isResult(value: Record<string, unknown>): value is Record<string, unknown> & RunnerResult {
  return value.version === RUNNER_API_VERSION
    && typeof value.runId === 'string'
    && ['completed', 'compile_error', 'runtime_error', 'limit_exceeded', 'system_error'].includes(String(value.outcome))
    && typeof value.stdout === 'string'
    && typeof value.stderr === 'string'
    && Array.isArray(value.tests)
    && Boolean(value.diagnostic)
}

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

export async function runExercise(
  exerciseId: string,
  language: LanguageId,
  source: string,
  onStatus?: (status: RunnerClientStatus) => void,
): Promise<RunnerResult> {
  onStatus?.('requesting')
  const grantBody = await expectJson(await fetch('/api/runner/grants', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ exerciseId, language }),
  }))
  if (typeof grantBody.grant !== 'string') {
    throw new RunnerClientError('The training runner did not issue a valid run pass. Please try again.', true)
  }

  const acceptedBody = await expectJson(await fetch('/api/runner/runs', {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      'X-Runner-Grant': grantBody.grant,
    },
    body: JSON.stringify({ version: RUNNER_API_VERSION, language, source }),
  }))
  if (!isAccepted(acceptedBody)) {
    throw new RunnerClientError('The training runner did not return a valid queue receipt. Please try again.', true)
  }

  onStatus?.('queued')
  const startedAt = Date.now()
  let pollAfterMs = acceptedBody.pollAfterMs
  while (Date.now() - startedAt < MAX_WAIT_MS) {
    await wait(Math.min(MAX_POLL_MS, Math.max(MIN_POLL_MS, pollAfterMs)))
    const body = await expectJson(await fetch(`/api/runner/runs/${encodeURIComponent(acceptedBody.runId)}`, {
      credentials: 'same-origin',
      headers: { Accept: 'application/json' },
    }))
    if (isResult(body)) return body
    if (!isPending(body)) {
      throw new RunnerClientError('The training runner returned an unknown run state. Please try again.', true)
    }
    onStatus?.(body.status)
    pollAfterMs = body.pollAfterMs
  }
  throw new RunnerClientError('This run is taking longer than expected. Wait a moment, then run it again.', true)
}
