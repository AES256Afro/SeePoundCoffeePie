import { describe, expect, it, vi } from 'vitest'
import { pythonInteractiveProject } from '../data/python-interactive-project'
import { cppCompiledProject } from '../data/cpp-compiled-project'
import { trackById } from '../data/curriculum'
import {
  completeMission,
  completeProject,
  completeProjectCheckpoint,
  dateKey,
  initialProgress,
  isDue,
  loadProgress,
  nextStreak,
  recordAttempt,
  recordLessonSuccess,
  saveProgress,
  updateConcept,
} from './progress'

describe('progress helpers', () => {
  const firstPythonLessonIds = trackById('python').missions[0].exercises.map((exercise) => exercise.id)
  const firstJavaLessonIds = trackById('java').missions[0].exercises.map((exercise) => exercise.id)

  it('starts with no lesson or project completion metadata', () => {
    expect(initialProgress()).toMatchObject({
      completedLessons: [],
      completedProjectCheckpoints: [],
      completedProjects: [],
    })
  })

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

  it('records a completed lesson once while later retrievals only strengthen memory', () => {
    const now = new Date(2026, 7, 20)
    const first = recordLessonSuccess(initialProgress(), 'py-print', true, now)
    const replay = recordLessonSuccess(first, 'py-print', true, now)

    expect(first.completedLessons).toEqual(['py-print'])
    expect(first.xp).toBe(12)
    expect(first.dailyXp).toBe(12)
    expect(first.conceptProgress['python-print']).toMatchObject({
      strength: 1,
      correct: 1,
      incorrect: 0,
    })
    expect(replay.completedLessons).toEqual(['py-print'])
    expect(replay.xp).toBe(12)
    expect(replay.dailyXp).toBe(12)
    expect(replay.conceptProgress['python-print']).toMatchObject({
      strength: 2,
      correct: 2,
      incorrect: 0,
    })
  })

  it('can persist a first lesson completion without awarding XP', () => {
    const now = new Date(2026, 7, 20)
    const updated = recordLessonSuccess(initialProgress(), 'py-print', false, now)

    expect(updated.completedLessons).toEqual(['py-print'])
    expect(updated.xp).toBe(0)
    expect(updated.dailyXp).toBe(0)
    expect(updated.conceptProgress['python-print'].correct).toBe(1)
    expect(recordLessonSuccess(updated, 'unknown-lesson', true, now)).toBe(updated)
  })

  it('awards mission shards only on first completion', () => {
    const now = new Date(2026, 7, 20)
    const first = completeMission(initialProgress(), 'py-first-spark', now)
    const replay = completeMission(first, 'py-first-spark', now)
    expect(first.completedMissions).toEqual(['py-first-spark'])
    expect(first.completedLessons).toEqual(firstPythonLessonIds)
    expect(first.starShards).toBe(25)
    expect(replay.completedMissions).toEqual(['py-first-spark'])
    expect(replay.starShards).toBe(25)
  })

  it('awards checkpoint XP and one concept update only on first completion', () => {
    const now = new Date(2026, 7, 26)
    const checkpoint = pythonInteractiveProject.checkpoints[0]
    const first = completeProjectCheckpoint(
      initialProgress(),
      pythonInteractiveProject.id,
      checkpoint.id,
      now,
    )
    const replay = completeProjectCheckpoint(first, pythonInteractiveProject.id, checkpoint.id, now)

    expect(first.completedProjectCheckpoints).toEqual([checkpoint.id])
    expect(first.xp).toBe(checkpoint.exercise.xp)
    expect(first.dailyXp).toBe(checkpoint.exercise.xp)
    expect(first.dailyXpDate).toBe('2026-08-26')
    expect(first.conceptProgress[checkpoint.exercise.conceptId]).toMatchObject({
      strength: 1,
      correct: 1,
      incorrect: 0,
    })
    expect(replay).toBe(first)
    expect(completeProjectCheckpoint(first, 'unknown-project', checkpoint.id, now)).toBe(first)
    expect(completeProjectCheckpoint(first, pythonInteractiveProject.id, 'unknown-checkpoint', now)).toBe(first)
  })

  it('tracks C++ project progress independently without changing Python completion', () => {
    const now = new Date(2026, 7, 26)
    const cppCheckpoint = cppCompiledProject.checkpoints[0]
    const pythonCheckpoint = pythonInteractiveProject.checkpoints[0]
    const withPython = completeProjectCheckpoint(
      initialProgress('cpp'),
      pythonInteractiveProject.id,
      pythonCheckpoint.id,
      now,
    )
    const withCpp = completeProjectCheckpoint(
      withPython,
      cppCompiledProject.id,
      cppCheckpoint.id,
      now,
    )
    const replay = completeProjectCheckpoint(
      withCpp,
      cppCompiledProject.id,
      cppCheckpoint.id,
      now,
    )

    expect(withCpp.completedProjectCheckpoints).toEqual([pythonCheckpoint.id, cppCheckpoint.id])
    expect(withCpp.conceptProgress[pythonCheckpoint.exercise.conceptId]).toBeDefined()
    expect(withCpp.conceptProgress[cppCheckpoint.exercise.conceptId]).toBeDefined()
    expect(withCpp.xp).toBe(pythonCheckpoint.exercise.xp + cppCheckpoint.exercise.xp)
    expect(replay).toBe(withCpp)
  })

  it('awards 50 shards and advances the study streak only on first project completion', () => {
    const starting = {
      ...initialProgress(),
      streak: 3,
      lastStudyDate: '2026-08-25',
    }
    const first = completeProject(starting, pythonInteractiveProject.id, new Date(2026, 7, 26))
    const replay = completeProject(first, pythonInteractiveProject.id, new Date(2026, 7, 27))

    expect(first.completedProjects).toEqual([pythonInteractiveProject.id])
    expect(first.starShards).toBe(50)
    expect(first.streak).toBe(4)
    expect(first.lastStudyDate).toBe('2026-08-26')
    expect(replay).toBe(first)
    expect(completeProject(starting, 'unknown-project', new Date(2026, 7, 26))).toBe(starting)
  })

  it('preserves separate Python and C++ project completion rewards', () => {
    const now = new Date(2026, 7, 26)
    const pythonComplete = completeProject(initialProgress(), pythonInteractiveProject.id, now)
    const bothComplete = completeProject(pythonComplete, cppCompiledProject.id, now)

    expect(bothComplete.completedProjects).toEqual([
      pythonInteractiveProject.id,
      cppCompiledProject.id,
    ])
    expect(bothComplete.starShards).toBe(100)
    expect(completeProject(bothComplete, cppCompiledProject.id, now)).toBe(bothComplete)
  })

  it('saturates progress counters before they exceed safe integer storage', () => {
    const maximum = Number.MAX_SAFE_INTEGER
    const now = new Date(2026, 7, 26)
    const today = dateKey(now)
    const attempted = recordAttempt({
      ...initialProgress(),
      xp: maximum - 2,
      dailyXp: maximum - 1,
      dailyXpDate: today,
    }, 'python-print', true, 8, now)
    const concept = updateConcept({
      strength: 5,
      correct: maximum,
      incorrect: maximum,
      dueAt: today,
    }, true, now)
    const moduleComplete = completeMission({
      ...initialProgress(),
      starShards: maximum - 10,
      streak: maximum,
      lastStudyDate: '2026-08-25',
    }, 'py-first-spark', now)
    const projectComplete = completeProject({
      ...initialProgress(),
      starShards: maximum - 10,
    }, pythonInteractiveProject.id, now)

    expect(attempted.xp).toBe(maximum)
    expect(attempted.dailyXp).toBe(maximum)
    expect(concept.correct).toBe(maximum)
    expect(concept.incorrect).toBe(maximum)
    expect(moduleComplete.starShards).toBe(maximum)
    expect(moduleComplete.streak).toBe(maximum)
    expect(projectComplete.starShards).toBe(maximum)
  })

  it('migrates old browser records without lesson or project arrays', () => {
    const legacyProgress: Record<string, unknown> = { ...initialProgress('java') }
    legacyProgress.completedMissions = ['java-coffee-protocol']
    delete legacyProgress.completedLessons
    delete legacyProgress.completedProjectCheckpoints
    delete legacyProgress.completedProjects
    const localStorage = {
      getItem: vi.fn(() => JSON.stringify({ ...legacyProgress, callsign: 'Legacy Cadet' })),
      setItem: vi.fn(),
    }
    vi.stubGlobal('window', { localStorage })

    try {
      expect(loadProgress()).toMatchObject({
        callsign: 'Legacy Cadet',
        activeLanguage: 'java',
        completedLessons: firstJavaLessonIds,
        completedMissions: ['java-coffee-protocol'],
        completedProjectCheckpoints: [],
        completedProjects: [],
      })
    } finally {
      vi.unstubAllGlobals()
    }
  })

  it('allowlists browser progress and drops malformed concept entries without crashing practice', () => {
    const stored = {
      ...initialProgress('python'),
      callsign: 'Safe Cadet',
      xp: -10,
      dailyGoal: 999,
      completedMissions: ['py-first-spark', 'unknown-mission', 'py-first-spark'],
      completedLessons: ['py-print', 'unknown-lesson', 'py-print'],
      completedProjectCheckpoints: ['unknown-checkpoint'],
      completedProjects: ['unknown-project'],
      conceptProgress: {
        'python-variables': {
          strength: 2,
          correct: 3,
          incorrect: 1,
          dueAt: '2026-08-28',
        },
        'python-conditions': null,
        'unknown-concept': {
          strength: 5,
          correct: 999,
          incorrect: 0,
          dueAt: '2099-01-01',
        },
      },
      rawAnswer: 'do not retain me',
    }
    const localStorage = {
      getItem: vi.fn(() => JSON.stringify(stored)),
      setItem: vi.fn(),
    }
    vi.stubGlobal('window', { localStorage })

    try {
      const loaded = loadProgress()
      expect(loaded).toMatchObject({
        callsign: 'Safe Cadet',
        activeLanguage: 'python',
        dailyGoal: 10,
        xp: 0,
        completedMissions: ['py-first-spark'],
        completedProjectCheckpoints: [],
        completedProjects: [],
        conceptProgress: {
          'python-variables': {
            strength: 2,
            correct: 3,
            incorrect: 1,
            dueAt: '2026-08-28',
          },
        },
      })
      expect(new Set(loaded.completedLessons)).toEqual(new Set(firstPythonLessonIds))
      expect(loaded).not.toHaveProperty('rawAnswer')
      expect(() => Object.values(loaded.conceptProgress).map((concept) => isDue(concept))).not.toThrow()
    } finally {
      vi.unstubAllGlobals()
    }
  })

  it('uses safe defaults when the browser record has invalid scalar and date types', () => {
    const localStorage = {
      getItem: vi.fn(() => JSON.stringify({
        ...initialProgress('java'),
        callsign: ['not text'],
        activeLanguage: 'ruby',
        dailyXp: Number.MAX_SAFE_INTEGER + 1,
        dailyXpDate: '2026-02-31',
        lastStudyDate: 42,
        onboardingComplete: 'yes',
      })),
      setItem: vi.fn(),
    }
    vi.stubGlobal('window', { localStorage })

    try {
      expect(loadProgress()).toEqual(initialProgress())
    } finally {
      vi.unstubAllGlobals()
    }
  })

  it('keeps progress usable when the browser refuses a local storage write', () => {
    const localStorage = {
      setItem: vi.fn(() => {
        throw new DOMException('Storage is unavailable', 'QuotaExceededError')
      }),
    }
    vi.stubGlobal('window', { localStorage })

    try {
      expect(() => saveProgress({ ...initialProgress(), callsign: 'Memory only' })).not.toThrow()
      expect(localStorage.setItem).toHaveBeenCalledOnce()
    } finally {
      vi.unstubAllGlobals()
    }
  })

  it('drops unknown lesson IDs before writing browser progress', () => {
    const localStorage = {
      setItem: vi.fn(),
    }
    vi.stubGlobal('window', { localStorage })

    try {
      saveProgress({
        ...initialProgress(),
        completedLessons: ['py-print', 'unknown-lesson', 'py-print'],
      })
      const mainRecordCall = localStorage.setItem.mock.calls.find(
        ([key]) => key === 'see-pound-coffee-pie-progress',
      )
      const lessonJournalCall = localStorage.setItem.mock.calls.find(
        ([key]) => key === 'see-pound-coffee-pie-completed-lessons-v1',
      )
      expect(mainRecordCall).toBeTruthy()
      expect(lessonJournalCall).toBeTruthy()
      const stored = JSON.parse(mainRecordCall?.[1] ?? '{}')
      expect(stored.completedLessons).toEqual(['py-print'])
      expect(JSON.parse(lessonJournalCall?.[1] ?? '[]')).toEqual(['py-print'])
    } finally {
      vi.unstubAllGlobals()
    }
  })

  it('recovers lesson completion after an older tab overwrites the legacy browser record', () => {
    const values = new Map<string, string>()
    const localStorage = {
      getItem: vi.fn((key: string) => values.get(key) ?? null),
      setItem: vi.fn((key: string, value: string) => values.set(key, value)),
    }
    vi.stubGlobal('window', { localStorage })

    try {
      saveProgress({
        ...initialProgress('python'),
        callsign: 'Current Tab Cadet',
        completedLessons: ['py-console'],
      })

      const legacyRecord = {
        ...initialProgress('python'),
        callsign: 'Older Tab Cadet',
      } as Record<string, unknown>
      delete legacyRecord.completedLessons
      values.set('see-pound-coffee-pie-progress', JSON.stringify(legacyRecord))

      expect(loadProgress()).toMatchObject({
        callsign: 'Older Tab Cadet',
        completedLessons: ['py-console'],
      })

      saveProgress(initialProgress('python'))
      expect(loadProgress().completedLessons).toEqual([])
    } finally {
      vi.unstubAllGlobals()
    }
  })
})
