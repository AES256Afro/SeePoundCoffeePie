import { describe, expect, it } from 'vitest'
import { pythonInteractiveProject } from '../data/python-interactive-project'
import { cppCompiledProject } from '../data/cpp-compiled-project'
import { initialProgress } from './progress'
import {
  PROGRESS_BACKUP_FORMAT,
  PROGRESS_BACKUP_MAX_BYTES,
  parseProgressBackup,
  serializeProgressBackup,
} from './progress-backup'

const exportedAt = new Date('2026-08-24T15:30:00.000Z')

function completedProgress() {
  return {
    ...initialProgress('java'),
    callsign: 'Backup Cadet',
    xp: 617,
    dailyXp: 85,
    dailyXpDate: '2026-08-24',
    starShards: 150,
    streak: 4,
    lastStudyDate: '2026-08-24',
    completedMissions: ['java-coffee-protocol', 'java-routing-orders'],
    completedProjectCheckpoints: [pythonInteractiveProject.checkpoints[0].id],
    completedProjects: [pythonInteractiveProject.id],
    conceptProgress: {
      'java-conditions': {
        strength: 2,
        correct: 3,
        incorrect: 1,
        dueAt: '2026-08-27',
      },
      [pythonInteractiveProject.checkpoints[0].exercise.conceptId]: {
        strength: 1,
        correct: 1,
        incorrect: 0,
        dueAt: '2026-08-25',
      },
    },
    onboardingComplete: true,
  }
}

describe('local progress backups', () => {
  it('round-trips the complete learner record through a versioned envelope', () => {
    const progress = completedProgress()
    const serialized = serializeProgressBackup(progress, exportedAt)
    const parsed = parseProgressBackup(serialized)

    expect(JSON.parse(serialized)).toMatchObject({
      format: PROGRESS_BACKUP_FORMAT,
      version: 1,
      exportedAt: exportedAt.toISOString(),
    })
    expect(parsed).toEqual({ ok: true, progress, exportedAt: exportedAt.toISOString() })
  })

  it.each([
    ['not json', 'not valid JSON'],
    [JSON.stringify({ format: 'another-app', version: 1 }), 'not a SeePoundCoffeePie'],
    [JSON.stringify({ format: PROGRESS_BACKUP_FORMAT, version: 2 }), 'supports progress backup version 1'],
  ])('rejects an unrelated or unreadable file', (text, message) => {
    const result = parseProgressBackup(text)
    expect(result).toMatchObject({ ok: false })
    if (!result.ok) expect(result.message).toContain(message)
  })

  it('rejects unknown mission and concept IDs instead of inflating progress', () => {
    const envelope = JSON.parse(serializeProgressBackup(completedProgress(), exportedAt))
    envelope.progress.completedMissions.push('java-secret-mission')
    envelope.progress.conceptProgress['java-secret-power'] = {
      strength: 5,
      correct: 999,
      incorrect: 0,
      dueAt: '2099-01-01',
    }

    expect(parseProgressBackup(JSON.stringify(envelope))).toMatchObject({ ok: false })
  })

  it('rejects impossible counts, dates, and memory strengths', () => {
    const envelope = JSON.parse(serializeProgressBackup(completedProgress(), exportedAt))
    envelope.progress.xp = -1
    envelope.progress.lastStudyDate = '2026-02-31'
    envelope.progress.conceptProgress['java-conditions'].strength = 99

    expect(parseProgressBackup(JSON.stringify(envelope))).toMatchObject({ ok: false })
  })

  it('rejects duplicate completed missions', () => {
    const envelope = JSON.parse(serializeProgressBackup(completedProgress(), exportedAt))
    envelope.progress.completedMissions.push('java-coffee-protocol')

    expect(parseProgressBackup(JSON.stringify(envelope))).toMatchObject({ ok: false })
  })

  it('migrates version 1 backups without project arrays to empty lists', () => {
    const envelope = JSON.parse(serializeProgressBackup(initialProgress(), exportedAt))
    delete envelope.progress.completedProjectCheckpoints
    delete envelope.progress.completedProjects

    expect(parseProgressBackup(JSON.stringify(envelope))).toEqual({
      ok: true,
      progress: initialProgress(),
      exportedAt: exportedAt.toISOString(),
    })
  })

  it('rejects unknown or duplicate project completion identifiers', () => {
    const unknownCheckpoint = JSON.parse(serializeProgressBackup(completedProgress(), exportedAt))
    unknownCheckpoint.progress.completedProjectCheckpoints.push('unknown-checkpoint')
    expect(parseProgressBackup(JSON.stringify(unknownCheckpoint))).toMatchObject({ ok: false })

    const duplicateCheckpoint = JSON.parse(serializeProgressBackup(completedProgress(), exportedAt))
    duplicateCheckpoint.progress.completedProjectCheckpoints.push(pythonInteractiveProject.checkpoints[0].id)
    expect(parseProgressBackup(JSON.stringify(duplicateCheckpoint))).toMatchObject({ ok: false })

    const unknownProject = JSON.parse(serializeProgressBackup(completedProgress(), exportedAt))
    unknownProject.progress.completedProjects = ['unknown-project']
    expect(parseProgressBackup(JSON.stringify(unknownProject))).toMatchObject({ ok: false })
  })

  it('round-trips C++ and Python project completion in the existing version 1 format', () => {
    const progress = {
      ...completedProgress(),
      completedProjectCheckpoints: [
        pythonInteractiveProject.checkpoints[0].id,
        cppCompiledProject.checkpoints[0].id,
      ],
      completedProjects: [pythonInteractiveProject.id, cppCompiledProject.id],
      conceptProgress: {
        ...completedProgress().conceptProgress,
        [cppCompiledProject.checkpoints[0].exercise.conceptId]: {
          strength: 1,
          correct: 1,
          incorrect: 0,
          dueAt: '2026-08-25',
        },
      },
    }

    expect(parseProgressBackup(serializeProgressBackup(progress, exportedAt))).toEqual({
      ok: true,
      progress,
      exportedAt: exportedAt.toISOString(),
    })
  })

  it('rejects files above the fixed backup byte limit', () => {
    expect(parseProgressBackup('x'.repeat(PROGRESS_BACKUP_MAX_BYTES + 1))).toMatchObject({
      ok: false,
      message: expect.stringContaining('too large'),
    })
  })
})
