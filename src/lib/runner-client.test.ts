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
      { stdin: 'Ada\n', purpose: 'run' },
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
  })

  it('surfaces the safe API error and retry signal', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json(
      { error: 'The training queue is full. Try again shortly.', retryable: true },
      { status: 503 },
    )))

    await expect(runExercise('py-print', 'python', 'print(1)')).rejects.toEqual(
      expect.objectContaining<Partial<RunnerClientError>>({
        message: 'The training queue is full. Try again shortly.',
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
        message: 'The live runner could not be reached. Your code was not marked wrong. Please try again.',
        retryable: true,
      }),
    )
  })

  it('does not blame learner code when the runner returns incomplete JSON', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('{"grant":', {
      headers: { 'Content-Type': 'application/json' },
    })))

    await expect(runExercise('py-print', 'python', 'print(1)')).rejects.toEqual(
      expect.objectContaining<Partial<RunnerClientError>>({
        message: 'The live runner sent an incomplete response. Your code was not marked wrong. Please try again.',
        retryable: true,
      }),
    )
  })
})
