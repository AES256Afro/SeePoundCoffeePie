import { describe, expect, it } from 'vitest'
import { trackById } from '../data/curriculum'
import { initialProgress } from './progress'
import { clearPracticeSession, loadOrCreatePracticeSession } from './practice-session'

const now = new Date('2026-08-24T12:00:00')

function memoryStorage(): Storage {
  const records = new Map<string, string>()
  return {
    get length() { return records.size },
    clear() { records.clear() },
    getItem(key) { return records.get(key) ?? null },
    key(index) { return [...records.keys()][index] ?? null },
    removeItem(key) { records.delete(key) },
    setItem(key, value) { records.set(key, String(value)) },
  }
}

function completedPythonProgress() {
  const track = trackById('python')
  const missions = track.missions.slice(0, 2)
  const concepts = [...new Set(missions.flatMap((mission) => (
    mission.exercises.map((exercise) => exercise.conceptId)
  )))]
  return {
    ...initialProgress('python'),
    completedMissions: missions.map((mission) => mission.id),
    conceptProgress: Object.fromEntries(concepts.map((id) => [id, {
      strength: 1,
      correct: 1,
      incorrect: 0,
      dueAt: '2026-08-24',
    }])),
  }
}

describe('ephemeral adaptive practice session', () => {
  it('freezes only authored exercise IDs in session storage', () => {
    const track = trackById('python')
    const progress = completedPythonProgress()
    const storage = memoryStorage()

    const first = loadOrCreatePracticeSession(track, progress, storage, now)
    const storedText = storage.getItem('see-pound-coffee-pie-practice-session:python') ?? ''
    const stored = JSON.parse(storedText)

    expect(stored).toEqual({
      version: 1,
      language: 'python',
      exerciseIds: first.items.map((item) => item.exercise.id),
    })
    expect(storedText).not.toMatch(/answer|source|stdin|stdout|diagnostic|concept/iu)
  })

  it('restores the same validated queue after aggregate progress changes', () => {
    const track = trackById('python')
    const progress = completedPythonProgress()
    const storage = memoryStorage()
    const first = loadOrCreatePracticeSession(track, progress, storage, now)
    const changed = {
      ...progress,
      conceptProgress: Object.fromEntries(Object.entries(progress.conceptProgress).map(([id, value]) => [id, {
        ...value,
        strength: 5,
        dueAt: '2026-09-30',
      }])),
    }

    const restored = loadOrCreatePracticeSession(track, changed, storage, now)

    expect(restored.items.map((item) => item.exercise.id)).toEqual(
      first.items.map((item) => item.exercise.id),
    )
  })

  it('discards a tampered or no-longer-eligible queue and builds a safe replacement', () => {
    const track = trackById('python')
    const progress = completedPythonProgress()
    const storage = memoryStorage()
    storage.setItem('see-pound-coffee-pie-practice-session:python', JSON.stringify({
      version: 1,
      language: 'python',
      exerciseIds: ['java1-runtime', 'java1-runtime'],
    }))

    const session = loadOrCreatePracticeSession(track, progress, storage, now)

    expect(session.items.length).toBeGreaterThan(0)
    expect(session.items.every((item) => item.missionId.startsWith('py-'))).toBe(true)
    expect(new Set(session.items.map((item) => item.exercise.id)).size).toBe(session.items.length)
  })

  it.each([
    [[]],
    [['duplicate', 'duplicate']],
    [['one', 'two', 'three', 'four', 'five', 'six']],
    [['x'.repeat(101)]],
  ])('rejects malformed stored exercise IDs before resolving them: %j', (exerciseIds) => {
    const track = trackById('python')
    const progress = completedPythonProgress()
    const storage = memoryStorage()
    storage.setItem('see-pound-coffee-pie-practice-session:python', JSON.stringify({
      version: 1,
      language: 'python',
      exerciseIds,
    }))

    const session = loadOrCreatePracticeSession(track, progress, storage, now)
    const rewritten = JSON.parse(
      storage.getItem('see-pound-coffee-pie-practice-session:python') ?? '{}',
    )

    expect(session.items.length).toBeGreaterThan(0)
    expect(rewritten.exerciseIds).toEqual(session.items.map((item) => item.exercise.id))
    expect(rewritten.exerciseIds).not.toEqual(exerciseIds)
  })

  it('clears a completed session without touching another language', () => {
    const storage = memoryStorage()
    storage.setItem('see-pound-coffee-pie-practice-session:python', '{}')
    storage.setItem('see-pound-coffee-pie-practice-session:java', '{}')

    clearPracticeSession('python', storage)

    expect(storage.getItem('see-pound-coffee-pie-practice-session:python')).toBeNull()
    expect(storage.getItem('see-pound-coffee-pie-practice-session:java')).toBe('{}')
  })

  it('still builds an in-memory review when session storage is unavailable', () => {
    const session = loadOrCreatePracticeSession(
      trackById('python'),
      completedPythonProgress(),
      null,
      now,
    )

    expect(session.items.length).toBeGreaterThan(0)
    expect(() => clearPracticeSession('python', null)).not.toThrow()
  })
})
