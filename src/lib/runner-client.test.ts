import { afterEach, describe, expect, it, vi } from 'vitest'
import { runExercise, RunnerClientError } from './runner-client'
import { RUNNER_API_VERSION } from './runner-contract'

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('runExercise', () => {
  it('gets a scoped grant, queues source, and polls to a real result', async () => {
    vi.useFakeTimers()
    const controller = new AbortController()
    const statuses: string[] = []
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(Response.json({ grant: 'signed-grant' }))
      .mockResolvedValueOnce(Response.json({
        version: RUNNER_API_VERSION,
        runId: 'run_12345678901234567890',
        status: 'queued',
        pollAfterMs: 200,
      }))
      .mockResolvedValueOnce(Response.json({
        version: RUNNER_API_VERSION,
        runId: 'run_12345678901234567890',
        status: 'running',
        pollAfterMs: 200,
      }))
      .mockResolvedValueOnce(Response.json({
        version: RUNNER_API_VERSION,
        runId: 'run_12345678901234567890',
        outcome: 'completed',
        stdout: 'Signal online\n',
        stderr: '',
        exitCode: 0,
        durationMs: 23,
        truncated: false,
        limit: null,
        tests: [{ name: 'Visible console check', visibility: 'visible', passed: true, message: 'Matched.' }],
        diagnostic: { title: 'Program finished', explanation: 'It ran.', suggestion: 'Continue.', line: null },
      }))
    vi.stubGlobal('fetch', fetchMock)

    const promise = runExercise(
      'py-print',
      'python',
      'print("Signal online")',
      (status) => statuses.push(status),
      { stdin: 'Ada\n', purpose: 'run', signal: controller.signal },
    )
    await vi.runAllTimersAsync()
    const result = await promise

    expect(result.stdout).toBe('Signal online\n')
    expect(statuses).toEqual(['requesting', 'queued', 'running'])
    expect(fetchMock).toHaveBeenNthCalledWith(2, '/api/runner/runs', expect.objectContaining({ method: 'POST' }))
    const submission = JSON.parse(fetchMock.mock.calls[1][1].body)
    expect(fetchMock.mock.calls[1][1].headers).toMatchObject({ 'X-Runner-Grant': 'signed-grant' })
    expect(submission).toMatchObject({
      version: 1,
      language: 'python',
      source: 'print("Signal online")',
      stdin: 'Ada\n',
      purpose: 'run',
    })
    expect(submission).not.toHaveProperty('command')
    for (const [, request] of fetchMock.mock.calls) {
      expect(request).toEqual(expect.objectContaining({ signal: controller.signal }))
    }
  })

  it('stops before the next poll when the request is cancelled during the wait', async () => {
    vi.useFakeTimers()
    const controller = new AbortController()
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(Response.json({ grant: 'signed-grant' }))
      .mockResolvedValueOnce(Response.json({
        version: RUNNER_API_VERSION,
        runId: 'run_cancelled_during_poll_wait_123',
        status: 'queued',
        pollAfterMs: 2_000,
      }))
    vi.stubGlobal('fetch', fetchMock)

    const promise = runExercise(
      'py-print',
      'python',
      'print("Signal online")',
      undefined,
      { signal: controller.signal },
    )
    await vi.advanceTimersByTimeAsync(0)
    expect(fetchMock).toHaveBeenCalledTimes(2)

    controller.abort()

    await expect(promise).rejects.toEqual(expect.objectContaining({ name: 'AbortError' }))
    await vi.runAllTimersAsync()
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('does not make a grant request when the signal is already cancelled', async () => {
    const controller = new AbortController()
    controller.abort()
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    await expect(runExercise(
      'py-print',
      'python',
      'print(1)',
      undefined,
      { signal: controller.signal },
    )).rejects.toEqual(expect.objectContaining({ name: 'AbortError' }))
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('preserves cancellation while reading a response body', async () => {
    const controller = new AbortController()
    const response = Response.json({ grant: 'signed-grant' })
    vi.spyOn(response, 'json').mockImplementation(async () => {
      controller.abort()
      throw new DOMException('The operation was aborted.', 'AbortError')
    })
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response))

    await expect(runExercise(
      'py-print',
      'python',
      'print(1)',
      undefined,
      { signal: controller.signal },
    )).rejects.toEqual(expect.objectContaining({ name: 'AbortError' }))
  })

  it('shows a plain retry message when the code checker is busy', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json(
      { error: 'The training queue is full. Try again shortly.', retryable: true },
      { status: 503 },
    )))

    await expect(runExercise('py-print', 'python', 'print(1)')).rejects.toEqual(
      expect.objectContaining<Partial<RunnerClientError>>({
        message: 'The code checker is busy. Try again shortly.',
        retryable: true,
      }),
    )
  })

  it('does not show an unknown technical server message', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json(
      { error: 'Internal coordinator lease mismatch.' },
      { status: 500 },
    )))

    await expect(runExercise('py-print', 'python', 'print(1)')).rejects.toEqual(
      expect.objectContaining<Partial<RunnerClientError>>({
        message: 'The code checker could not complete this check. Try again.',
        retryable: true,
      }),
    )
  })

  it('does not blame learner code when the API route returns a page instead of JSON', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('<!doctype html><title>Local preview</title>', {
      headers: { 'Content-Type': 'text/html' },
    })))

    await expect(runExercise('py-print', 'python', 'print(1)')).rejects.toEqual(
      expect.objectContaining<Partial<RunnerClientError>>({
        message: 'The code checker could not be reached. Your code was not marked wrong. Please try again.',
        retryable: true,
      }),
    )
  })

  it('does not blame learner code when the code checker returns incomplete data', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('{"grant":', {
      headers: { 'Content-Type': 'application/json' },
    })))

    await expect(runExercise('py-print', 'python', 'print(1)')).rejects.toEqual(
      expect.objectContaining<Partial<RunnerClientError>>({
        message: 'The code checker sent an incomplete response. Your code was not marked wrong. Please try again.',
        retryable: true,
      }),
    )
  })
})
