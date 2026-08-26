import { describe, expect, it, vi } from 'vitest'
import { cppCollectionsRecordsManifest } from '../data/cpp-collections-records-manifest'
import { pythonInteractiveProject } from '../data/python-interactive-project'
import { cppCompiledProject } from '../data/cpp-compiled-project'
import { trackById } from '../data/curriculum'
import { initialProgress } from './progress'
import {
  deleteRemoteProgress,
  fetchRemoteProgress,
  hasMeaningfulProgress,
  mergeLearnerProgress,
  progressRecordsMatch,
  saveRemoteProgress,
} from './progress-sync'

const firstPythonLessonIds = trackById('python').missions[0].exercises.map((exercise) => exercise.id)
const firstJavaLessonIds = trackById('java').missions[0].exercises.map((exercise) => exercise.id)

function recordProgress() {
  return {
    ...initialProgress('python'),
    callsign: 'Local Cadet',
    onboardingComplete: true,
    xp: 42,
    dailyXp: 20,
    dailyXpDate: '2026-08-25',
    starShards: 25,
    streak: 2,
    lastStudyDate: '2026-08-25',
    completedLessons: firstPythonLessonIds,
    completedMissions: ['py-first-spark'],
    completedProjectCheckpoints: [pythonInteractiveProject.checkpoints[0].id],
    completedProjects: [pythonInteractiveProject.id],
    conceptProgress: {
      'python-print': { strength: 2, correct: 3, incorrect: 1, dueAt: '2026-08-28' },
    },
  }
}

describe('durable progress synchronization', () => {
  it('detects real guest progress without treating defaults as a migration', () => {
    expect(hasMeaningfulProgress(initialProgress())).toBe(false)
    expect(hasMeaningfulProgress(recordProgress())).toBe(true)
    expect(hasMeaningfulProgress({
      ...initialProgress(),
      completedProjectCheckpoints: [pythonInteractiveProject.checkpoints[0].id],
    })).toBe(true)
    expect(hasMeaningfulProgress({
      ...initialProgress(),
      completedProjects: [pythonInteractiveProject.id],
    })).toBe(true)
  })

  it('conservatively combines completion and review state without double-counting rewards', () => {
    const local = recordProgress()
    const remote = {
      ...recordProgress(),
      callsign: 'Remote Cadet',
      activeLanguage: 'java' as const,
      xp: 60,
      dailyXp: 12,
      starShards: 50,
      completedLessons: firstJavaLessonIds,
      completedMissions: ['py-first-spark', 'java-coffee-protocol'],
      completedProjectCheckpoints: [pythonInteractiveProject.checkpoints[1].id],
      completedProjects: [pythonInteractiveProject.id],
      conceptProgress: {
        'python-print': { strength: 1, correct: 5, incorrect: 0, dueAt: '2026-08-26' },
        'java-output': { strength: 1, correct: 1, incorrect: 0, dueAt: '2026-08-26' },
      },
    }

    expect(mergeLearnerProgress(local, remote)).toMatchObject({
      callsign: 'Local Cadet',
      activeLanguage: 'python',
      xp: 60,
      dailyXp: 20,
      starShards: 50,
      completedLessons: [...new Set([...firstJavaLessonIds, ...firstPythonLessonIds])].sort(),
      completedMissions: ['java-coffee-protocol', 'py-first-spark'],
      completedProjectCheckpoints: [
        pythonInteractiveProject.checkpoints[0].id,
        pythonInteractiveProject.checkpoints[1].id,
      ],
      completedProjects: [pythonInteractiveProject.id],
      conceptProgress: {
        'python-print': { strength: 2, correct: 5, incorrect: 1, dueAt: '2026-08-28' },
        'java-output': { strength: 1, correct: 1, incorrect: 0, dueAt: '2026-08-26' },
      },
    })
  })

  it('uses the earlier review date when equal-strength records are combined in either direction', () => {
    const local = {
      ...recordProgress(),
      conceptProgress: {
        'python-print': { strength: 2, correct: 3, incorrect: 4, dueAt: '2026-08-30' },
      },
    }
    const remote = {
      ...recordProgress(),
      conceptProgress: {
        'python-print': { strength: 2, correct: 5, incorrect: 1, dueAt: '2026-08-27' },
      },
    }

    const forward = mergeLearnerProgress(local, remote).conceptProgress['python-print']
    const reverse = mergeLearnerProgress(remote, local).conceptProgress['python-print']

    expect(forward).toEqual({
      strength: 2,
      correct: 5,
      incorrect: 4,
      dueAt: '2026-08-27',
    })
    expect(reverse).toEqual(forward)
  })

  it('keeps the strongest schedule and merges concept records associatively', () => {
    const first = {
      ...initialProgress('python'),
      conceptProgress: {
        'python-print': { strength: 1, correct: 7, incorrect: 1, dueAt: '2026-08-20' },
      },
    }
    const second = {
      ...initialProgress('python'),
      conceptProgress: {
        'python-print': { strength: 3, correct: 2, incorrect: 5, dueAt: '2026-09-05' },
      },
    }
    const third = {
      ...initialProgress('python'),
      conceptProgress: {
        'python-print': { strength: 3, correct: 4, incorrect: 3, dueAt: '2026-09-01' },
      },
    }

    const leftGrouped = mergeLearnerProgress(mergeLearnerProgress(first, second), third)
      .conceptProgress['python-print']
    const rightGrouped = mergeLearnerProgress(first, mergeLearnerProgress(second, third))
      .conceptProgress['python-print']

    expect(leftGrouped).toEqual({
      strength: 3,
      correct: 7,
      incorrect: 5,
      dueAt: '2026-09-01',
    })
    expect(rightGrouped).toEqual(leftGrouped)
  })

  it('merges C++ and Python project records without dropping either language', () => {
    const local = {
      ...initialProgress('cpp'),
      completedProjectCheckpoints: [cppCompiledProject.checkpoints[0].id],
      completedProjects: [cppCompiledProject.id],
    }
    const remote = {
      ...initialProgress('python'),
      completedProjectCheckpoints: [pythonInteractiveProject.checkpoints[0].id],
      completedProjects: [pythonInteractiveProject.id],
    }

    expect(mergeLearnerProgress(local, remote)).toMatchObject({
      completedProjectCheckpoints: [
        cppCompiledProject.checkpoints[0].id,
        pythonInteractiveProject.checkpoints[0].id,
      ],
      completedProjects: [cppCompiledProject.id, pythonInteractiveProject.id],
    })
  })

  it('unions partial lesson completion from two devices without inventing module completion', () => {
    const local = {
      ...initialProgress('python'),
      completedLessons: ['py-console'],
    }
    const remote = {
      ...initialProgress('python'),
      completedLessons: ['py-print'],
    }

    const forward = mergeLearnerProgress(local, remote)
    const reverse = mergeLearnerProgress(remote, local)

    expect(forward).toMatchObject({
      completedLessons: ['py-console', 'py-print'],
      completedMissions: [],
    })
    expect(reverse.completedLessons).toEqual(forward.completedLessons)
    expect(reverse.completedMissions).toEqual(forward.completedMissions)
  })

  it('unions additive Phase 5A lesson and module completion without double-counting rewards', () => {
    const local = {
      ...initialProgress('python'),
      xp: 22,
      completedLessons: ['pydata1-retrieve-call'],
    }
    const remote = {
      ...initialProgress('python'),
      xp: 40,
      completedMissions: ['py-data-return-values'],
    }

    const merged = mergeLearnerProgress(local, remote)
    expect(merged.xp).toBe(40)
    expect(merged.completedMissions).toEqual(['py-data-return-values'])
    expect(merged.completedLessons).toEqual([
      'pydata1-fix-return',
      'pydata1-predict-result',
      'pydata1-retrieve-call',
      'pydata1-return-purpose',
      'pydata1-subtotal',
    ])
  })

  it('unions Phase 5B partial and module completion without inventing additive rewards', () => {
    const moduleId = 'cpp-records-vectors'
    const lessonIds = cppCollectionsRecordsManifest[moduleId].map((lesson) => lesson.id)
    const local = {
      ...initialProgress('cpp'),
      xp: 22,
      completedLessons: [lessonIds[0]],
      conceptProgress: {
        'cpp-vectors': { strength: 1, correct: 1, incorrect: 0, dueAt: '2026-08-27' },
      },
    }
    const remote = {
      ...initialProgress('cpp'),
      xp: 70,
      completedMissions: [moduleId],
      conceptProgress: {
        'cpp-vectors': { strength: 2, correct: 3, incorrect: 1, dueAt: '2026-08-30' },
      },
    }

    const merged = mergeLearnerProgress(local, remote)
    expect(merged.xp).toBe(70)
    expect(merged.completedMissions).toEqual([moduleId])
    expect(merged.completedLessons).toEqual([...lessonIds].sort())
    expect(merged.conceptProgress['cpp-vectors']).toEqual({
      strength: 2,
      correct: 3,
      incorrect: 1,
      dueAt: '2026-08-30',
    })
  })

  it('canonically matches Phase 5B module closure with an explicit lesson list', () => {
    const moduleId = 'cpp-records-structs'
    const lessonIds = cppCollectionsRecordsManifest[moduleId].map((lesson) => lesson.id)
    const missionOnly = {
      ...initialProgress('cpp'),
      completedMissions: [moduleId],
    }
    const explicit = {
      ...missionOnly,
      completedLessons: [...lessonIds].reverse(),
    }

    expect(progressRecordsMatch(missionOnly, explicit)).toBe(true)
    expect(hasMeaningfulProgress(missionOnly)).toBe(true)
  })

  it('matches semantically equal records regardless of set and concept insertion order', () => {
    const left = {
      ...recordProgress(),
      completedLessons: [...firstPythonLessonIds].reverse(),
      completedMissions: ['py-first-spark', 'java-coffee-protocol'],
      conceptProgress: {
        'python-print': { strength: 2, correct: 3, incorrect: 1, dueAt: '2026-08-28' },
        'java-output': { strength: 1, correct: 1, incorrect: 0, dueAt: '2026-08-26' },
      },
    }
    const right = {
      ...recordProgress(),
      completedLessons: firstPythonLessonIds,
      completedMissions: ['java-coffee-protocol', 'py-first-spark'],
      conceptProgress: {
        'java-output': { strength: 1, correct: 1, incorrect: 0, dueAt: '2026-08-26' },
        'python-print': { strength: 2, correct: 3, incorrect: 1, dueAt: '2026-08-28' },
      },
    }

    expect(progressRecordsMatch(left, right)).toBe(true)
    expect(progressRecordsMatch(left, { ...right, xp: right.xp + 1 })).toBe(false)
  })

  it('treats a legacy mission-only record as equal to its explicit lesson closure', () => {
    const explicit = recordProgress()
    const legacy: Record<string, unknown> = { ...explicit }
    delete legacy.completedLessons

    expect(progressRecordsMatch(
      legacy as unknown as ReturnType<typeof recordProgress>,
      explicit,
    )).toBe(true)
  })

  it('migrates an old version 1 remote record that omits lesson and project arrays', async () => {
    const legacyProgress: Record<string, unknown> = { ...recordProgress() }
    delete legacyProgress.completedLessons
    delete legacyProgress.completedProjectCheckpoints
    delete legacyProgress.completedProjects
    const record = {
      version: 1 as const,
      revision: 1,
      updatedAt: '2026-08-25T12:00:00.000Z',
      progress: legacyProgress,
    }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ record })))

    try {
      await expect(fetchRemoteProgress()).resolves.toMatchObject({
        progress: {
          completedLessons: firstPythonLessonIds,
          completedProjectCheckpoints: [],
          completedProjects: [],
        },
      })
    } finally {
      vi.unstubAllGlobals()
    }
  })

  it('reads, writes, reports conflicts, and deletes through same-origin account endpoints', async () => {
    const progress = recordProgress()
    const record = { version: 1 as const, revision: 2, updatedAt: '2026-08-25T12:00:00.000Z', progress }
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(Response.json({ record }))
      .mockResolvedValueOnce(Response.json({ record: { ...record, revision: 3 } }))
      .mockResolvedValueOnce(Response.json({ error: 'Conflict', record }, { status: 409 }))
      .mockResolvedValueOnce(Response.json({ deleted: true }))
    vi.stubGlobal('fetch', fetchMock)

    try {
      await expect(fetchRemoteProgress()).resolves.toEqual(record)
      await expect(saveRemoteProgress(progress, 2)).resolves.toMatchObject({ ok: true, record: { revision: 3 } })
      await expect(saveRemoteProgress(progress, 1)).resolves.toMatchObject({ ok: false, conflicted: true, conflict: record })
      await expect(deleteRemoteProgress()).resolves.toBeUndefined()
      expect(fetchMock.mock.calls[1][1]).toMatchObject({ method: 'PUT', credentials: 'same-origin' })
      expect(fetchMock.mock.calls[3][1].body).toContain('DELETE MY LEARNING DATA')
    } finally {
      vi.unstubAllGlobals()
    }
  })
})
