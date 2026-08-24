import { describe, expect, it } from 'vitest'
import { isRunnerRecordStale, shouldAdvanceDrainAlarm } from './runner-queue-policy'

describe('shouldAdvanceDrainAlarm', () => {
  it('creates an alarm when none exists', () => {
    expect(shouldAdvanceDrainAlarm(null, 1_010)).toBe(true)
  })

  it('moves a later cleanup alarm forward so queued work starts', () => {
    expect(shouldAdvanceDrainAlarm(901_000, 1_010)).toBe(true)
  })

  it('keeps an alarm that will already fire sooner', () => {
    expect(shouldAdvanceDrainAlarm(1_005, 1_010)).toBe(false)
  })
})

describe('runner stale-record policy', () => {
  it('expires queued work from its creation time', () => {
    expect(isRunnerRecordStale('queued', 1_000, null, 121_000, 120_000)).toBe(true)
    expect(isRunnerRecordStale('queued', 1_001, null, 121_000, 120_000)).toBe(false)
  })

  it('expires running work from its start time', () => {
    expect(isRunnerRecordStale('running', 1_000, 5_000, 125_000, 120_000)).toBe(true)
    expect(isRunnerRecordStale('running', 1_000, 5_001, 125_000, 120_000)).toBe(false)
  })
})
