import { describe, expect, it } from 'vitest'
import {
  completeMission,
  dateKey,
  initialProgress,
  isDue,
  nextStreak,
  recordAttempt,
  updateConcept,
} from './progress'

describe('progress helpers', () => {
  it('formats local dates as stable day keys', () => {
    expect(dateKey(new Date(2026, 7, 4, 23, 59))).toBe('2026-08-04')
  })

  it('starts, continues, and preserves a same-day streak', () => {
    const starting = initialProgress()
    expect(nextStreak(starting, new Date(2026, 7, 20))).toBe(1)

    const yesterday = { ...starting, streak: 4, lastStudyDate: '2026-08-19' }
    expect(nextStreak(yesterday, new Date(2026, 7, 20))).toBe(5)

    const sameDay = { ...starting, streak: 5, lastStudyDate: '2026-08-20' }
    expect(nextStreak(sameDay, new Date(2026, 7, 20, 21, 30))).toBe(5)
  })

  it('restarts a streak after a missed calendar day', () => {
    const progress = { ...initialProgress(), streak: 18, lastStudyDate: '2026-08-17' }
    expect(nextStreak(progress, new Date(2026, 7, 20))).toBe(1)
  })

  it('moves correct concepts farther out and mistakes back to today', () => {
    const now = new Date(2026, 7, 20)
    const first = updateConcept(undefined, true, now)
    expect(first).toMatchObject({ strength: 1, correct: 1, incorrect: 0, dueAt: '2026-08-21' })

    const second = updateConcept(first, true, now)
    expect(second).toMatchObject({ strength: 2, dueAt: '2026-08-23' })

    const missed = updateConcept(second, false, now)
    expect(missed).toMatchObject({ strength: 1, correct: 2, incorrect: 1, dueAt: '2026-08-20' })
    expect(isDue(missed, now)).toBe(true)
  })

  it('awards XP once per recorded success and tracks today', () => {
    const now = new Date(2026, 7, 20)
    const updated = recordAttempt(initialProgress(), 'python-output', true, 12, now)
    expect(updated.xp).toBe(12)
    expect(updated.dailyXp).toBe(12)
    expect(updated.dailyXpDate).toBe('2026-08-20')
  })

  it('strengthens a repaired concept without awarding its exercise XP twice', () => {
    const now = new Date(2026, 7, 20)
    const missed = recordAttempt(initialProgress(), 'java-runtime', false, 0, now)
    const corrected = recordAttempt(missed, 'java-runtime', true, 8, now)
    const retrievedAgain = recordAttempt(corrected, 'java-runtime', true, 0, now)

    expect(retrievedAgain.xp).toBe(8)
    expect(retrievedAgain.dailyXp).toBe(8)
    expect(retrievedAgain.conceptProgress['java-runtime']).toMatchObject({
      strength: 2,
      correct: 2,
      incorrect: 1,
      dueAt: '2026-08-23',
    })
  })

  it('awards mission shards only on first completion', () => {
    const now = new Date(2026, 7, 20)
    const first = completeMission(initialProgress(), 'py-first-spark', now)
    const replay = completeMission(first, 'py-first-spark', now)
    expect(first.completedMissions).toEqual(['py-first-spark'])
    expect(first.starShards).toBe(25)
    expect(replay.completedMissions).toEqual(['py-first-spark'])
    expect(replay.starShards).toBe(25)
  })
})
