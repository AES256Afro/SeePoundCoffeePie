import { describe, expect, it } from 'vitest'

import {
  assertReviewedPublishedGrant,
  assertReviewedRunnerStatus,
  assertReviewedTeachingOnlyGrantRejection,
} from './runner-deployment-checks.mjs'

describe('runner deployment status verification', () => {
  it.each([
    ['enabled', true, { configured: true, enabled: true, paused: false, version: 1 }],
    ['paused', false, { configured: true, enabled: false, paused: true, version: 1 }],
  ])('accepts a configured %s state', (_label, requireEnabled, body) => {
    expect(() => assertReviewedRunnerStatus({
      body,
      httpStatus: 200,
      label: 'test',
      requireEnabled,
    })).not.toThrow()
  })

  it.each([
    ['missing configuration', { configured: false, enabled: false, paused: false, version: 1 }],
    ['wrong enabled state', { configured: true, enabled: false, paused: true, version: 1 }],
    ['ambiguous state', { configured: true, enabled: true, paused: true, version: 1 }],
    ['wrong version', { configured: true, enabled: true, paused: false, version: 2 }],
  ])('rejects %s', (_label, body) => {
    expect(() => assertReviewedRunnerStatus({
      body,
      httpStatus: 200,
      label: 'test',
      requireEnabled: true,
    })).toThrow(/not configured and enabled/iu)
  })
})

describe('published runner grant verification', () => {
  it.each([
    ['Python', 'py-print', 'python'],
    ['C++', 'cpprecords1-fix-return', 'cpp'],
  ])('accepts an enabled %s grant with its reviewed language', (_label, exerciseId, expectedLanguage) => {
    expect(() => assertReviewedPublishedGrant({
      body: { grant: 'signed-grant', language: expectedLanguage },
      exerciseId,
      expectedLanguage,
      hasSetCookie: true,
      httpStatus: 200,
      label: 'test',
      requireEnabled: true,
    })).not.toThrow()
  })

  it('rejects an enabled grant for the wrong language', () => {
    expect(() => assertReviewedPublishedGrant({
      body: { grant: 'signed-grant', language: 'python' },
      exerciseId: 'cpprecords1-fix-return',
      expectedLanguage: 'cpp',
      hasSetCookie: true,
      httpStatus: 200,
      label: 'test',
      requireEnabled: true,
    })).toThrow(/did not grant/iu)
  })

  it('accepts an explicit paused response without a grant or cookie', () => {
    expect(() => assertReviewedPublishedGrant({
      body: { error: 'The code checker is paused right now. Try again later.' },
      exerciseId: 'py-print',
      expectedLanguage: 'python',
      hasSetCookie: false,
      httpStatus: 503,
      label: 'test',
      requireEnabled: false,
    })).not.toThrow()
  })

  it.each([
    ['grant', { grant: 'unexpected' }, false],
    ['cookie', { error: 'The code checker is paused right now. Try again later.' }, true],
    ['wrong response', { error: 'The code checker is unavailable.' }, false],
  ])('rejects a paused response that includes an unexpected %s', (_label, body, hasSetCookie) => {
    expect(() => assertReviewedPublishedGrant({
      body,
      exerciseId: 'py-print',
      expectedLanguage: 'python',
      hasSetCookie,
      httpStatus: body.grant ? 200 : 503,
      label: 'test',
      requireEnabled: false,
    })).toThrow(/paused test code checker/iu)
  })
})

describe('teaching-only runner boundary verification', () => {
  it.each([
    'That exercise does not support live execution.',
    'This page does not have a code check yet.',
  ])('accepts the reviewed 404 response: %s', (error) => {
    expect(() => assertReviewedTeachingOnlyGrantRejection({
      body: { error },
      exerciseId: 'cpprecords1-retrieve-call',
      hasSetCookie: false,
      httpStatus: 404,
      label: 'test',
    })).not.toThrow()
  })

  it.each([
    ['grant', { error: 'That exercise does not support live execution.', grant: 'unexpected' }, false, 404],
    ['cookie', { error: 'That exercise does not support live execution.' }, true, 404],
    ['status', { error: 'That exercise does not support live execution.' }, false, 503],
    ['message', { error: 'Unknown exercise.' }, false, 404],
  ])('rejects an unexpected teaching-only %s response', (_case, body, hasSetCookie, httpStatus) => {
    expect(() => assertReviewedTeachingOnlyGrantRejection({
      body,
      exerciseId: 'cpprecords1-retrieve-call',
      hasSetCookie,
      httpStatus,
      label: 'test',
    })).toThrow(/crossed the public runner boundary/iu)
  })
})
