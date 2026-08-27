import { describe, expect, it } from 'vitest'
import {
  RUNNER_API_VERSION,
  RUNNER_LIMITS,
  validateRunnerRequest,
} from './runner-contract'

describe('isolated runner request contract', () => {
  it.each(['python', 'cpp', 'csharp', 'java'] as const)('accepts a bounded %s source request', (language) => {
    expect(validateRunnerRequest({
      version: RUNNER_API_VERSION,
      language,
      source: 'print("Hello")',
      stdin: 'cadet input',
      purpose: 'run',
    })).toEqual({
      ok: true,
      request: {
        version: RUNNER_API_VERSION,
        language,
        source: 'print("Hello")',
        stdin: 'cadet input',
        purpose: 'run',
      },
    })
  })

  it('preserves an official check purpose without requiring caller input', () => {
    expect(validateRunnerRequest({
      version: RUNNER_API_VERSION,
      language: 'python',
      source: 'print("Ready")',
      purpose: 'check',
    })).toEqual({
      ok: true,
      request: {
        version: RUNNER_API_VERSION,
        language: 'python',
        source: 'print("Ready")',
        purpose: 'check',
      },
    })
  })

  it.each([
    [null, 'invalid_body'],
    [[], 'invalid_body'],
    [{ version: 2, language: 'python', source: 'print(1)' }, 'unsupported_version'],
    [{ version: 1, language: 'javascript', source: 'console.log(1)' }, 'unsupported_language'],
    [{ version: 1, language: 'python', source: '   ' }, 'empty_source'],
    [{ version: 1, language: 'python', source: 'print(1)', stdin: 7 }, 'invalid_stdin'],
    [{ version: 1, language: 'python', source: 'print(1)', purpose: 'publish' }, 'invalid_body'],
  ])('rejects malformed request %#', (input, issue) => {
    expect(validateRunnerRequest(input)).toMatchObject({ ok: false, issue })
  })

  it('rejects caller-controlled command fields', () => {
    const result = validateRunnerRequest({
      version: RUNNER_API_VERSION,
      language: 'python',
      source: 'print("Hello")',
      command: '/bin/sh',
    })

    expect(result).toMatchObject({ ok: false, issue: 'unexpected_field' })
    if (!result.ok) expect(result.message).toContain('code checker chooses')
  })

  it('measures source and input limits as UTF-8 bytes', () => {
    const sourceTooLarge = 'π'.repeat((RUNNER_LIMITS.sourceBytes / 2) + 1)
    const stdinTooLarge = 'π'.repeat((RUNNER_LIMITS.stdinBytes / 2) + 1)

    expect(validateRunnerRequest({
      version: 1,
      language: 'python',
      source: sourceTooLarge,
    })).toMatchObject({ ok: false, issue: 'source_too_large' })

    expect(validateRunnerRequest({
      version: 1,
      language: 'python',
      source: 'print("Ready")',
      stdin: stdinTooLarge,
    })).toMatchObject({ ok: false, issue: 'stdin_too_large' })
  })

  it('rejects null bytes before a request reaches any toolchain', () => {
    expect(validateRunnerRequest({
      version: 1,
      language: 'cpp',
      source: 'int main() {\0}',
    })).toMatchObject({ ok: false, issue: 'null_byte' })
  })
})
