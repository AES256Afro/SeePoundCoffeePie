import type { LanguageId } from '../types'

export const RUNNER_API_VERSION = 1 as const

export type RunnerPurpose = 'run' | 'check'

export const RUNNER_LIMITS = Object.freeze({
  sourceBytes: 20_000,
  stdinBytes: 4_000,
  stdoutBytes: 64_000,
  stderrBytes: 64_000,
  wallTimeMs: 5_000,
  compileWallTimeMs: 8_000,
  cpuTimeMs: 2_000,
  compileCpuTimeMs: 4_000,
  memoryMiB: 256,
  compileMemoryMiB: 768,
  processCount: 32,
  compileProcessCount: 128,
  writableBytes: 33_554_432,
  compileWritableBytes: 134_217_728,
})

export interface RunnerRequest {
  version: typeof RUNNER_API_VERSION
  language: LanguageId
  source: string
  stdin?: string
  purpose?: RunnerPurpose
}

export type RunnerOutcome =
  | 'completed'
  | 'compile_error'
  | 'runtime_error'
  | 'limit_exceeded'
  | 'system_error'

export type RunnerRunStatus = 'queued' | 'running' | 'complete'

export interface RunnerTestResult {
  name: string
  visibility: 'visible' | 'hidden'
  passed: boolean
  message: string
}

export interface RunnerDiagnostic {
  title: string
  explanation: string
  suggestion: string
  line: number | null
}

export interface RunnerAccepted {
  version: typeof RUNNER_API_VERSION
  runId: string
  status: 'queued'
  pollAfterMs: number
}

export interface RunnerPending {
  version: typeof RUNNER_API_VERSION
  runId: string
  status: 'queued' | 'running'
  pollAfterMs: number
}

export interface RunnerResult {
  version: typeof RUNNER_API_VERSION
  runId: string
  outcome: RunnerOutcome
  stdout: string
  stderr: string
  exitCode: number | null
  durationMs: number
  truncated: boolean
  limit: string | null
  tests: RunnerTestResult[]
  diagnostic: RunnerDiagnostic
}

export type RunnerRequestIssue =
  | 'invalid_body'
  | 'unexpected_field'
  | 'unsupported_version'
  | 'unsupported_language'
  | 'empty_source'
  | 'source_too_large'
  | 'invalid_stdin'
  | 'stdin_too_large'
  | 'null_byte'

export type RunnerRequestValidation =
  | { ok: true; request: RunnerRequest }
  | { ok: false; issue: RunnerRequestIssue; message: string }

const languages = new Set<LanguageId>(['python', 'cpp', 'csharp', 'java'])
const requestFields = new Set(['version', 'language', 'source', 'stdin', 'purpose'])
const encoder = new TextEncoder()

function utf8Bytes(value: string): number {
  return encoder.encode(value).byteLength
}

export function validateRunnerRequest(input: unknown): RunnerRequestValidation {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { ok: false, issue: 'invalid_body', message: 'Send one JSON object describing the code to run.' }
  }

  const body = input as Record<string, unknown>
  const unexpectedField = Object.keys(body).find((field) => !requestFields.has(field))
  if (unexpectedField) {
    return {
      ok: false,
      issue: 'unexpected_field',
      message: `Remove the unsupported field "${unexpectedField}". The code checker chooses compiler commands and settings.`,
    }
  }

  if (body.version !== RUNNER_API_VERSION) {
    return { ok: false, issue: 'unsupported_version', message: `Use runner request version ${RUNNER_API_VERSION}.` }
  }

  if (typeof body.language !== 'string' || !languages.has(body.language as LanguageId)) {
    return {
      ok: false,
      issue: 'unsupported_language',
      message: 'Choose one supported language: python, cpp, csharp, or java.',
    }
  }

  if (typeof body.source !== 'string' || !body.source.trim()) {
    return { ok: false, issue: 'empty_source', message: 'Add at least one code instruction before running it.' }
  }

  if (body.source.includes('\0')) {
    return { ok: false, issue: 'null_byte', message: 'Source code cannot contain a null byte.' }
  }

  if (utf8Bytes(body.source) > RUNNER_LIMITS.sourceBytes) {
    return {
      ok: false,
      issue: 'source_too_large',
      message: `Source code must be ${RUNNER_LIMITS.sourceBytes.toLocaleString()} UTF-8 bytes or smaller.`,
    }
  }

  if (body.stdin !== undefined && typeof body.stdin !== 'string') {
    return { ok: false, issue: 'invalid_stdin', message: 'Program input must be text.' }
  }

  const stdin = body.stdin as string | undefined
  if (stdin?.includes('\0')) {
    return { ok: false, issue: 'null_byte', message: 'Program input cannot contain a null byte.' }
  }

  if (stdin !== undefined && utf8Bytes(stdin) > RUNNER_LIMITS.stdinBytes) {
    return {
      ok: false,
      issue: 'stdin_too_large',
      message: `Program input must be ${RUNNER_LIMITS.stdinBytes.toLocaleString()} UTF-8 bytes or smaller.`,
    }
  }

  if (body.purpose !== undefined && body.purpose !== 'run' && body.purpose !== 'check') {
    return {
      ok: false,
      issue: 'invalid_body',
      message: 'Choose either Run or Check work.',
    }
  }

  return {
    ok: true,
    request: {
      version: RUNNER_API_VERSION,
      language: body.language as LanguageId,
      source: body.source,
      ...(stdin === undefined ? {} : { stdin }),
      ...(body.purpose === undefined ? {} : { purpose: body.purpose as RunnerPurpose }),
    },
  }
}
