export function assertReviewedRunnerStatus({
  body,
  httpStatus,
  label,
  requireEnabled,
}) {
  if (
    httpStatus !== 200
    || body?.version !== 1
    || body?.configured !== true
    || body?.enabled !== requireEnabled
    || body?.paused !== !requireEnabled
  ) {
    throw new Error(
      `The ${label} code checker is not configured and ${requireEnabled ? 'enabled' : 'paused'} at the reviewed version.`,
    )
  }
}

export function assertReviewedPublishedGrant({
  body,
  exerciseId,
  expectedLanguage,
  hasSetCookie,
  httpStatus,
  label,
  requireEnabled,
}) {
  if (requireEnabled) {
    if (
      httpStatus !== 200
      || typeof body?.grant !== 'string'
      || body?.language !== expectedLanguage
    ) {
      throw new Error(`The enabled ${label} code checker did not grant ${exerciseId}.`)
    }
    return
  }

  if (
    httpStatus !== 503
    || body?.error !== 'The code checker is paused right now. Try again later.'
    || typeof body?.grant === 'string'
    || hasSetCookie
  ) {
    throw new Error(`The paused ${label} code checker issued or attempted a public runner grant.`)
  }
}

export function assertReviewedTeachingOnlyGrantRejection({
  body,
  exerciseId,
  hasSetCookie,
  httpStatus,
  label,
}) {
  const reviewedErrors = [
    'That exercise does not support live execution.',
    'This page does not have a code check yet.',
  ]
  if (
    httpStatus !== 404
    || !reviewedErrors.includes(body?.error)
    || typeof body?.grant === 'string'
    || hasSetCookie
  ) {
    throw new Error(
      `The teaching-only ${label} exercise ${exerciseId} crossed the public runner boundary.`,
    )
  }
}
