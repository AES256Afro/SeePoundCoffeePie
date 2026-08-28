import { describe, expect, it } from 'vitest'

import {
  assertReviewedPublishedGrant,
  assertReviewedRunnerStatus,
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
  it('accepts a grant only in enabled mode', () => {
    expect(() => assertReviewedPublishedGrant({
      body: { grant: 'signed-grant', language: 'python' },
      exerciseId: 'py-print',
      hasSetCookie: true,
      httpStatus: 200,
      label: 'test',
      requireEnabled: true,
    })).not.toThrow()
  })

  it('accepts an explicit paused response without a grant or cookie', () => {
    expect(() => assertReviewedPublishedGrant({
      body: { error: 'The code checker is paused right now. Try again later.' },
      exerciseId: 'py-print',
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
      hasSetCookie,
      httpStatus: body.grant ? 200 : 503,
      label: 'test',
      requireEnabled: false,
    })).toThrow(/paused test code checker/iu)
  })
})
