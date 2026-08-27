import type { LanguageId } from '../types'
import {
  RUNNER_API_VERSION,
  type RunnerPurpose,
  type RunnerAccepted,
  type RunnerPending,
  type RunnerResult,
} from './runner-contract'

const MAX_WAIT_MS = 45_000
const MIN_POLL_MS = 200
const MAX_POLL_MS = 2_000

export type RunnerClientStatus = 'requesting' | 'queued' | 'running'

export interface RunExerciseOptions {
  stdin?: string
  purpose?: RunnerPurpose
}

export class RunnerClientError extends Error {
  readonly retryable: boolean

  constructor(message: string, retryable = false) {
    super(message)
    this.name = 'RunnerClientError'
    this.retryable = retryable
  }
}

const PLAIN_SERVER_ERRORS: Record<string, string> = {
  'The training queue is full. Try again shortly.': 'The code checker is busy. Try again shortly.',
  'Two runs are already waiting for this learner.': 'Two checks are already waiting. Let one finish, then try again.',
  'The runner is receiving too many requests. Try again in one minute.': 'The code checker is busy. Try again in one minute.',
  'Runner coordinator endpoint not found.': 'The code checker could not complete this check. Try again.',
  'Invalid internal runner request.': 'The code checker could not read this run. Reload the page and try again.',
  'The exercise does not match the selected language.': 'The language for this check changed. Reload the lesson and try again.',
  'Run identifier already exists.': 'The code checker could not start this check. Try again.',
  'Run not found.': 'This check could not be found. Start it again.',
}

function plainServerError(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const translated = PLAIN_SERVER_ERRORS[value]
  if (translated) return translated
  if (/^(?:The code checker|This (?:check|code|page|lesson)|The language for this check|Reload this page)/u.test(value)) {
    return value
  }
  return 'The code checker could not complete this check. Try again.'
}

async function readJson(response: Response): Promise<Record<string, unknown>> {
  const contentType = response.headers.get('Content-Type') ?? ''
  if (!contentType.toLowerCase().includes('application/json')) {
    throw new RunnerClientError('The code checker could not be reached. Your code was not marked wrong. Please try again.', true)
  }
  try {
    return await response.json() as Record<string, unknown>
  } catch {
    throw new RunnerClientError('The code checker sent an incomplete response. Your code was not marked wrong. Please try again.', true)
  }
}

async function expectJson(response: Response): Promise<Record<string, unknown>> {
  const body = await readJson(response)
  if (!response.ok) {
    const message = plainServerError(body.error)
      ?? 'The code checker could not start this check. Please try again.'
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
  options: RunExerciseOptions = {},
): Promise<RunnerResult> {
  onStatus?.('requesting')
  const grantBody = await expectJson(await fetch('/api/runner/grants', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ exerciseId, language }),
  }))
  if (typeof grantBody.grant !== 'string') {
    throw new RunnerClientError('The code checker could not start this run. Please try again.', true)
  }

  const acceptedBody = await expectJson(await fetch('/api/runner/runs', {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      'X-Runner-Grant': grantBody.grant,
    },
    body: JSON.stringify({
      version: RUNNER_API_VERSION,
      language,
      source,
      ...(options.stdin === undefined ? {} : { stdin: options.stdin }),
      ...(options.purpose === undefined ? {} : { purpose: options.purpose }),
    }),
  }))
  if (!isAccepted(acceptedBody)) {
    throw new RunnerClientError('The code checker did not confirm the run. Please try again.', true)
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
      throw new RunnerClientError('The code checker returned an unknown result. Please try again.', true)
    }
    onStatus?.(body.status)
    pollAfterMs = body.pollAfterMs
  }
  throw new RunnerClientError('This run is taking longer than expected. Wait a moment, then run it again.', true)
}
