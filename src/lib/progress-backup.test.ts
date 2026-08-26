import { describe, expect, it } from 'vitest'
import { cppCollectionsRecordsManifest } from '../data/cpp-collections-records-manifest'
import { pythonInteractiveProject } from '../data/python-interactive-project'
import { cppCompiledProject } from '../data/cpp-compiled-project'
import { trackById } from '../data/curriculum'
import { initialProgress } from './progress'
import {
  PROGRESS_BACKUP_FORMAT,
  PROGRESS_BACKUP_MAX_BYTES,
  parseProgressBackup,
  serializeProgressBackup,
} from './progress-backup'

const exportedAt = new Date('2026-08-24T15:30:00.000Z')
const completedJavaMissionIds = ['java-coffee-protocol', 'java-routing-orders']
const completedJavaLessonIds = trackById('java').missions
  .filter((mission) => completedJavaMissionIds.includes(mission.id))
  .flatMap((mission) => mission.exercises.map((exercise) => exercise.id))

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
    completedLessons: completedJavaLessonIds,
    completedMissions: completedJavaMissionIds,
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

  it('migrates version 1 backups without lesson or project arrays', () => {
    const envelope = JSON.parse(serializeProgressBackup(initialProgress(), exportedAt))
    delete envelope.progress.completedLessons
    delete envelope.progress.completedProjectCheckpoints
    delete envelope.progress.completedProjects

    expect(parseProgressBackup(JSON.stringify(envelope))).toEqual({
      ok: true,
      progress: initialProgress(),
      exportedAt: exportedAt.toISOString(),
    })
  })

  it('backfills lesson IDs when a legacy backup contains completed missions', () => {
    const envelope = JSON.parse(serializeProgressBackup(completedProgress(), exportedAt))
    delete envelope.progress.completedLessons

    const parsed = parseProgressBackup(JSON.stringify(envelope))
    expect(parsed).toMatchObject({ ok: true })
    if (parsed.ok) {
      expect(parsed.progress.completedLessons).toEqual(completedJavaLessonIds)
      expect(parsed.progress.completedMissions).toEqual(completedJavaMissionIds)
    }
  })

  it('round-trips partial lesson completion without completing a mission', () => {
    const progress = {
      ...initialProgress('python'),
      callsign: 'Partial Cadet',
      completedLessons: ['py-console', 'py-print'],
    }

    expect(parseProgressBackup(serializeProgressBackup(progress, exportedAt))).toEqual({
      ok: true,
      progress,
      exportedAt: exportedAt.toISOString(),
    })
  })

  it('rejects unknown or duplicate completed lesson IDs', () => {
    const unknownLesson = JSON.parse(serializeProgressBackup(completedProgress(), exportedAt))
    unknownLesson.progress.completedLessons.push('unknown-lesson')
    expect(parseProgressBackup(JSON.stringify(unknownLesson))).toMatchObject({ ok: false })

    const duplicateLesson = JSON.parse(serializeProgressBackup(completedProgress(), exportedAt))
    duplicateLesson.progress.completedLessons.push(completedJavaLessonIds[0])
    expect(parseProgressBackup(JSON.stringify(duplicateLesson))).toMatchObject({ ok: false })
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

  it('round-trips Phase 5B completion and review state in backup version 1', () => {
    const moduleId = 'cpp-records-updates'
    const moduleLessons = cppCollectionsRecordsManifest[moduleId]
    const progress = {
      ...initialProgress('cpp'),
      xp: 280,
      completedLessons: moduleLessons.map((lesson) => lesson.id),
      completedMissions: [moduleId],
      conceptProgress: {
        'cpp-reference-updates': {
          strength: 2,
          correct: 3,
          incorrect: 1,
          dueAt: '2026-08-29',
        },
      },
    }
    const serialized = serializeProgressBackup(progress, exportedAt)

    expect(JSON.parse(serialized)).toMatchObject({
      format: PROGRESS_BACKUP_FORMAT,
      version: 1,
    })
    expect(parseProgressBackup(serialized)).toEqual({
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
