import { describe, expect, it } from 'vitest'

import {
  CPP_COLLECTIONS_EXPECTED_OUTPUT,
  assertCppCollectionsAccepted,
  assertCppCollectionsAuthenticResult,
  assertCppCollectionsGrant,
  assertCppCollectionsMalformedResult,
  assertCppCollectionsPending,
  assertCppCollectionsPublicEnvelope,
  assertCppCollectionsRejectedResult,
  assertCppCollectionsSafeResult,
  assertCppCollectionsStatus,
  buildCppCollectionsProbeSources,
  checkCppCollectionsRunner,
  responseJson,
} from './check-runner-cpp-collections.mjs'

const referenceSource = [
  '#include <iostream>',
  '#include <string>',
  '#include <vector>',
  '',
  'struct Part { std::string name; int quantity; };',
  'void restock() {}',
  'int total_units() { return 17; }',
  'int main() {',
  '    restock(parts, "bolts", 3);',
  '    restock(parts, "cables", 1);',
  '    return 0;',
  '}',
].join('\n')

function tests(passed = false) {
  return [
    {
      name: 'Visible lesson example',
      visibility: 'visible',
      passed: true,
      message: 'Your program produced the expected result for the visible example.',
    },
    ...Array.from({ length: 6 }, (_, index) => ({
      name: `Required lesson code ${index + 1} of 6`,
      visibility: 'hidden',
      passed,
      message: passed
        ? 'This required part of the lesson is present in your code.'
        : 'This required part of the lesson is not present yet. Review the task and try again.',
    })),
  ]
}

function result(overrides = {}) {
  return {
    version: 1,
    runId: 'runner-result-identifier-000001',
    outcome: 'completed',
    stdout: `${CPP_COLLECTIONS_EXPECTED_OUTPUT}\n`,
    stderr: '',
    exitCode: 0,
    durationMs: 18,
    truncated: false,
    limit: null,
    tests: tests(false),
    diagnostic: {
      title: 'Program finished',
      explanation: 'The program ran.',
      suggestion: 'Continue.',
      line: null,
    },
    ...overrides,
  }
}

describe('Practical C++ deployed runner probe sources', () => {
  it('builds distinct adversarial sources without changing the authentic source', () => {
    const sources = buildCppCollectionsProbeSources(referenceSource)

    expect(sources.correctSource).toBe(referenceSource)
    expect(sources.hardcodedCommentDecoy).toContain('// {"version":1,"profile":"wrong-profile"')
    expect(sources.unreachableRequiredCode).toContain('return 0;\n    restock(parts, "bolts", 3);')
    expect(sources.behaviorAlias).toContain('struct Item')
    expect(sources.movedHarnessStatements).toContain([
      'restock(parts, "cables", 1);',
      '    restock(parts, "bolts", 3);',
    ].join('\n'))
    expect(sources.malformedSource.endsWith('}')).toBe(false)
  })
})

describe('Practical C++ deployed runner probe result validation', () => {
  it('accepts the public-safe rejected and authentic result shapes', () => {
    const rejected = result()
    const authentic = result({ tests: tests(true) })

    expect(() => assertCppCollectionsRejectedResult(rejected, 'rejected source', 'submitted source')).not.toThrow()
    expect(() => assertCppCollectionsAuthenticResult(authentic, 'submitted source')).not.toThrow()
  })

  it('accepts a sanitized compile failure with no passed checks', () => {
    const malformed = result({
      outcome: 'compile_error',
      stdout: '',
      stderr: 'expected a closing brace',
      tests: tests(false).map((test) => ({ ...test, passed: false })),
    })

    expect(() => assertCppCollectionsMalformedResult(malformed, 'malformed source')).not.toThrow()
  })

  it.each([
    ['profile', { diagnostic: { title: 'cpp-collections-records-workshop-report-v1', explanation: '', suggestion: '', line: null } }],
    ['structural fact', { diagnostic: { title: '"authored_frame":true', explanation: '', suggestion: '', line: null } }],
    ['submitted source', { diagnostic: { title: 'private learner source', explanation: '', suggestion: '', line: null } }],
  ])('rejects a response that exposes %s', (_label, leaked) => {
    expect(() => assertCppCollectionsSafeResult(
      result(leaked),
      'unsafe result',
      'private learner source',
    )).toThrow(/exposed|returned submitted/iu)
  })

  it.each([
    ['private case identifier', { visibleTest: { id: 'workshop-stock-report-visible' } }],
    ['validation identifier', { check: 'cpp-collections-supplied-harness' }],
    ['structural fact key', { supplied_harness: false }],
    ['protected message', { message: 'Have low_stock collect each part name whose quantity is below the supplied limit.' }],
    ['internal path', { diagnostic: '/opt/runner/CppCollectionsAnalyzer.py' }],
    ['temporary path', { diagnostic: '/tmp/private-result.json' }],
    ['bare workspace path', { diagnostic: '/workspace' }],
    ['profile key', { profile: 'redacted' }],
    ['analyzed key', { analyzed: true }],
    ['parsed key', { parsed: true }],
    ['submitted source', { diagnostic: 'private learner source' }],
  ])('rejects %s in any public response envelope', (_label, envelope) => {
    expect(() => assertCppCollectionsPublicEnvelope(
      envelope,
      'unsafe public envelope',
      'private learner source',
    )).toThrow(/exposed|returned submitted/iu)
  })

  it('rejects an unexpected public test-summary shape', () => {
    const unsafe = result({
      tests: tests(false).map((test, index) => index === 1 ? { ...test, internal: true } : test),
    })

    expect(() => assertCppCollectionsSafeResult(unsafe, 'unsafe result')).toThrow(/unsafe response shape/iu)
  })

  it.each([
    ['unknown top-level source field', { sourceLines: ['private learner source'] }],
    ['unknown encoded source field', { sourceBase64: Buffer.from('private learner source').toString('base64') }],
    ['unknown analysis object', { analysis: { note: 'public-looking' } }],
  ])('rejects %s before it can extend the public result schema', (_label, extra) => {
    expect(() => assertCppCollectionsSafeResult(
      result(extra),
      'unsafe result',
      'private learner source',
    )).toThrow(/unsafe response shape/iu)
  })

  it.each([
    ['string outcome', { outcome: 'completed\nprivate server value' }],
    ['object outcome', { outcome: { value: 'completed' } }],
    ['negative duration', { durationMs: -1 }],
    ['infinite duration', { durationMs: Number.POSITIVE_INFINITY }],
    ['fractional duration', { durationMs: 1.5 }],
  ])('rejects an invalid %s using a fixed error', (_label, invalid) => {
    expect(() => assertCppCollectionsSafeResult(result(invalid), 'unsafe result')).toThrow(
      /unexpected outcome|invalid duration/iu,
    )
  })

  it('rejects submitted source returned as JSON escapes or base64', () => {
    const source = 'unique_private_source_line();\nreturn 42;'
    for (const leaked of [
      JSON.stringify(source).slice(1, -1),
      Buffer.from(source).toString('base64'),
      Buffer.from(source).toString('base64url'),
      Buffer.from(source).toString('hex'),
      encodeURIComponent(source),
      'unique_private_source_line();',
    ]) {
      expect(() => assertCppCollectionsPublicEnvelope(
        { error: leaked },
        'unsafe response',
        source,
      )).toThrow(/submitted learner source/iu)
    }
  })

  it('rejects source split into short chunks across valid public message fields', () => {
    const source = 'chunk01();chunk02();chunk03();chunk04();chunk05();chunk06();chunk07();'
    const chunks = source.match(/.{1,10}/gu)
    const split = result({
      tests: tests(false).map((test, index) => ({ ...test, message: chunks[index] })),
    })

    expect(() => assertCppCollectionsSafeResult(split, 'split source result', source)).toThrow(
      /submitted learner source/iu,
    )
  })

  it('rejects hex source and encoded credential values inside an exact result schema', () => {
    const source = 'unique_private_source_line();'
    const cookieValue = 'private-cookie-value-1234567890'
    expect(() => assertCppCollectionsSafeResult(result({
      diagnostic: {
        title: 'Check result',
        explanation: Buffer.from(source).toString('hex'),
        suggestion: 'Try again.',
        line: null,
      },
    }), 'hex source result', source)).toThrow(/submitted learner source/iu)
    expect(() => assertCppCollectionsPublicEnvelope(result({
      diagnostic: {
        title: 'Check result',
        explanation: Buffer.from(cookieValue).toString('base64'),
        suggestion: 'Try again.',
        line: null,
      },
    }), 'encoded credential result', '', [cookieValue])).toThrow(/request credentials/iu)
  })

  it('rejects adversarial output that passes every protected requirement', () => {
    expect(() => assertCppCollectionsRejectedResult(
      result({ tests: tests(true) }),
      'false positive',
      'submitted source',
    )).toThrow(/passed every protected requirement/iu)
  })
})

describe('Practical C++ deployed runner probe response schemas', () => {
  it('accepts only the reviewed status, grant, queue, and pending envelopes', () => {
    expect(() => assertCppCollectionsStatus({
      configured: true,
      enabled: true,
      paused: false,
      version: 1,
      languages: ['python', 'cpp', 'csharp', 'java'],
    })).not.toThrow()
    expect(() => assertCppCollectionsGrant({
      version: 1,
      grant: 'g'.repeat(80),
      expiresIn: 300,
      language: 'cpp',
      visibleTest: { name: 'Visible console check', expectedOutput: CPP_COLLECTIONS_EXPECTED_OUTPUT },
    })).not.toThrow()
    const accepted = {
      version: 1,
      runId: 'runner-result-identifier-000001',
      status: 'queued',
      pollAfterMs: 650,
    }
    expect(() => assertCppCollectionsAccepted(accepted, 'submission')).not.toThrow()
    expect(() => assertCppCollectionsPending(
      { ...accepted, status: 'running' },
      'poll',
      accepted.runId,
    )).not.toThrow()
  })

  it.each([
    ['status', () => assertCppCollectionsStatus({ configured: true, enabled: true, paused: false, version: 1, languages: ['cpp'], internal: true })],
    ['grant', () => assertCppCollectionsGrant({ version: 1, grant: 'g'.repeat(80), expiresIn: 300, language: 'cpp', visibleTest: { name: 'Visible console check', expectedOutput: CPP_COLLECTIONS_EXPECTED_OUTPUT }, profileId: 'x' })],
    ['accepted receipt', () => assertCppCollectionsAccepted({ version: 1, runId: 'runner-result-identifier-000001', status: 'queued', pollAfterMs: 650, sourceLines: [] }, 'submission')],
    ['pending receipt', () => assertCppCollectionsPending({ version: 1, runId: 'runner-result-identifier-000001', status: 'running', pollAfterMs: 650, parsed: false }, 'poll', 'runner-result-identifier-000001')],
  ])('rejects an extended %s envelope', (_label, validate) => {
    expect(validate).toThrow(/unsafe response shape/iu)
  })
})

describe('Practical C++ raw response scanning', () => {
  function response(body, { ok = true, status = 200 } = {}) {
    return {
      ok,
      status,
      text: async () => body,
    }
  }

  it.each([
    ['grant', 'CppCollectionsAnalyzer.py'],
    ['submission', '/tmp/private-result.json'],
    ['queued poll', '"profile":"secret"'],
    ['running poll', '"parsed":true'],
    ['compile-error result', 'cpp-collections-supplied-harness'],
    ['final result', Buffer.from('unique_private_source_line();').toString('base64')],
  ])('scans a non-2xx %s body before reporting the HTTP status', async (label, leak) => {
    await expect(responseJson(
      response(JSON.stringify({ error: leak }), { ok: false, status: 500 }),
      label,
      label === 'final result' ? 'unique_private_source_line();' : '',
    )).rejects.toThrow(/exposed|submitted learner source/iu)
  })

  it.each([
    ['grant', 'CppCollectionsAnalyzer.py'],
    ['submission', '/workspace'],
    ['poll', 'parsed'],
  ])('scans a non-JSON %s body before reporting unreadable JSON', async (label, leak) => {
    await expect(responseJson(response(`runner failed: ${leak}`), label)).rejects.toThrow(/exposed/iu)
  })

  it('does not include response text in ordinary HTTP or JSON errors', async () => {
    await expect(responseJson(
      response(JSON.stringify({ error: 'ordinary private value' }), { ok: false, status: 503 }),
      'submission',
    )).rejects.toThrow('submission failed with HTTP 503')
    await expect(responseJson(response('ordinary private value'), 'poll')).rejects.toThrow(
      'poll returned unreadable JSON',
    )
  })
})

describe('Practical C++ network-stage scanning', () => {
  const learnerCookie = '__Host-spp_runner_guest=private-cookie-value-1234567890'
  const signedGrant = `signed.${'g'.repeat(80)}`
  const runId = 'runner-result-identifier-000001'
  const statusBody = {
    configured: true,
    enabled: true,
    paused: false,
    version: 1,
    languages: ['python', 'cpp', 'csharp', 'java'],
  }
  const grantBody = {
    version: 1,
    grant: signedGrant,
    expiresIn: 300,
    language: 'cpp',
    visibleTest: { name: 'Visible console check', expectedOutput: CPP_COLLECTIONS_EXPECTED_OUTPUT },
  }
  const acceptedBody = { version: 1, runId, status: 'queued', pollAfterMs: 650 }

  function fakeResponse(body, { cookie = false, ok = true, status = 200, raw = false } = {}) {
    return {
      headers: {
        get: () => cookie ? learnerCookie : null,
        getSetCookie: () => cookie ? [`${learnerCookie}; Path=/; Secure; HttpOnly`] : [],
      },
      ok,
      status,
      text: async () => raw ? body : JSON.stringify(body),
    }
  }

  function fetchSequence(responses) {
    let index = 0
    return async () => {
      const response = responses[index]
      index += 1
      if (!response) throw new Error('The fake response sequence was exhausted.')
      return response
    }
  }

  const encodedPrivateMarkers = [
    ['base64', Buffer.from('cpp-collections-records-workshop-report-v1').toString('base64')],
    ['base64url', Buffer.from('cpp-collections-records-workshop-report-v1').toString('base64url')],
    ['hex', Buffer.from('cpp-collections-records-workshop-report-v1').toString('hex')],
    ['URI', encodeURIComponent('/opt/runner/CppCollectionsAnalyzer.py')],
  ]

  const encodedPrivateStageCases = encodedPrivateMarkers.flatMap(([encoding, marker]) => [
    [`grant ${encoding}`, [
      fakeResponse(statusBody),
      fakeResponse({ ...grantBody, grant: `signed.${marker}` }, { cookie: true }),
    ]],
    [`submission ${encoding}`, [
      fakeResponse(statusBody),
      fakeResponse(grantBody, { cookie: true }),
      fakeResponse({ ...acceptedBody, runId: `${runId}${marker}` }),
    ]],
    [`pending ${encoding}`, [
      fakeResponse(statusBody),
      fakeResponse(grantBody, { cookie: true }),
      fakeResponse(acceptedBody),
      fakeResponse({ ...acceptedBody, runId: `${runId}${marker}` }),
    ]],
    [`result ${encoding}`, [
      fakeResponse(statusBody),
      fakeResponse(grantBody, { cookie: true }),
      fakeResponse(acceptedBody),
      fakeResponse(result({ diagnostic: {
        title: 'Check result',
        explanation: marker,
        suggestion: 'Try again.',
        line: null,
      } })),
    ]],
  ])

  it.each(encodedPrivateStageCases)(
    'rejects exact-schema %s responses that encode private runner data',
    async (_stage, responses) => {
      await expect(checkCppCollectionsRunner('https://academy.example', {
        fetch: fetchSequence(responses),
        log: () => {},
        now: () => 1,
        sleep: async () => {},
      })).rejects.toThrow(/exposed/iu)
    },
  )

  it.each([
    ['grant', [
      fakeResponse(statusBody),
      fakeResponse('CppCollectionsAnalyzer.py', { cookie: true, raw: true }),
    ]],
    ['submission', [
      fakeResponse(statusBody),
      fakeResponse(grantBody, { cookie: true }),
      fakeResponse({ error: '/tmp/private-result.json' }, { ok: false, status: 500 }),
    ]],
    ['queued poll', [
      fakeResponse(statusBody),
      fakeResponse(grantBody, { cookie: true }),
      fakeResponse(acceptedBody),
      fakeResponse({ ...acceptedBody, profile: 'private' }),
    ]],
    ['running poll', [
      fakeResponse(statusBody),
      fakeResponse(grantBody, { cookie: true }),
      fakeResponse(acceptedBody),
      fakeResponse({ ...acceptedBody, status: 'queued' }),
      fakeResponse({ ...acceptedBody, status: 'running', parsed: true }),
    ]],
    ['terminal result', [
      fakeResponse(statusBody),
      fakeResponse(grantBody, { cookie: true }),
      fakeResponse(acceptedBody),
      fakeResponse(result({ diagnostic: {
        title: 'CppCollectionsAnalyzer.py',
        explanation: '',
        suggestion: '',
        line: null,
      } })),
    ]],
  ])('fails closed when the %s response leaks private data', async (_stage, responses) => {
    const logged = []
    let clock = 0
    await expect(checkCppCollectionsRunner('https://academy.example', {
      fetch: fetchSequence(responses),
      log: (...values) => logged.push(values.join(' ')),
      now: () => {
        clock += 1
        return clock
      },
      sleep: async () => {},
    })).rejects.toThrow(/exposed/iu)
    expect(logged.join('\n')).not.toContain(learnerCookie)
    expect(logged.join('\n')).not.toContain(signedGrant)
    expect(logged.join('\n')).not.toContain(runId)
  })

  it.each([
    ['learner cookie', learnerCookie],
    ['signed grant', signedGrant],
  ])('rejects a queue response that echoes the %s', async (_label, secret) => {
    await expect(checkCppCollectionsRunner('https://academy.example', {
      fetch: fetchSequence([
        fakeResponse(statusBody),
        fakeResponse(grantBody, { cookie: true }),
        fakeResponse({ error: secret }, { ok: false, status: 500 }),
      ]),
      log: () => {},
      now: () => 1,
      sleep: async () => {},
    })).rejects.toThrow(/exposed request credentials/iu)
  })

  it.each([
    ['base64', Buffer.from(learnerCookie.slice(learnerCookie.indexOf('=') + 1)).toString('base64')],
    ['base64url', Buffer.from(learnerCookie.slice(learnerCookie.indexOf('=') + 1)).toString('base64url')],
    ['hex', Buffer.from(learnerCookie.slice(learnerCookie.indexOf('=') + 1)).toString('hex')],
    ['URI encoding', encodeURIComponent(learnerCookie.slice(learnerCookie.indexOf('=') + 1))],
  ])('rejects a grant that contains the %s-encoded learner cookie value', async (_label, encodedCookie) => {
    await expect(checkCppCollectionsRunner('https://academy.example', {
      fetch: fetchSequence([
        fakeResponse(statusBody),
        fakeResponse({ ...grantBody, grant: `signed.${encodedCookie}` }, { cookie: true }),
      ]),
      log: () => {},
      now: () => 1,
      sleep: async () => {},
    })).rejects.toThrow(/exposed request credentials/iu)
  })

  it('accepts the complete real-shaped network sequence without exposing protected messages', async () => {
    const responses = [fakeResponse(statusBody)]
    for (let index = 0; index < 6; index += 1) {
      const currentRunId = `runner-result-identifier-${String(index).padStart(6, '0')}`
      responses.push(
        fakeResponse({ ...grantBody, grant: `signed.${'g'.repeat(70)}${index}` }, { cookie: true }),
        fakeResponse({ ...acceptedBody, runId: currentRunId }),
      )
      if (index === 4) {
        responses.push(fakeResponse(result({
          runId: currentRunId,
          outcome: 'compile_error',
          stdout: '',
          stderr: 'expected a closing brace',
          exitCode: 1,
          tests: tests(false).map((test) => ({ ...test, passed: false })),
          diagnostic: {
            title: 'C++ needs one more closing brace',
            explanation: 'The compiler reached the end before this block closed.',
            suggestion: 'Add the missing closing brace and run the check again.',
            line: null,
          },
        })))
      } else {
        responses.push(fakeResponse(result({
          runId: currentRunId,
          tests: index === 5 ? tests(true) : tests(false),
        })))
      }
    }
    const logged = []
    let clock = 0
    await expect(checkCppCollectionsRunner('https://academy.example', {
      fetch: fetchSequence(responses),
      log: (...values) => logged.push(values.join(' ')),
      now: () => {
        clock += 1
        return clock
      },
      sleep: async () => {},
    })).resolves.toBeUndefined()
    expect(logged.at(-1)).toBe('Practical C++ deployed runner checks passed.')
    for (const privateMessage of [
      'Keep the three supplied headers',
      'Have restock update',
      'Have total_units add',
      'Have low_stock collect',
    ]) {
      expect(logged.join('\n')).not.toContain(privateMessage)
    }
  })
})
