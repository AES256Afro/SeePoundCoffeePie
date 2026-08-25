import { describe, expect, it, vi } from 'vitest'
import { pythonInteractiveProject } from '../data/python-interactive-project'
import { cppCompiledProject } from '../data/cpp-compiled-project'
import { initialProgress } from './progress'
import {
  deleteRemoteProgress,
  fetchRemoteProgress,
  hasMeaningfulProgress,
  mergeLearnerProgress,
  saveRemoteProgress,
} from './progress-sync'

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

  it('migrates an old version 1 remote record that omits project arrays', async () => {
    const legacyProgress: Record<string, unknown> = { ...recordProgress() }
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
