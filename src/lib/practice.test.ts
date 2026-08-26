import { describe, expect, it } from 'vitest'
import { trackById } from '../data/curriculum'
import { pythonDataToolsCourse } from '../data/python-data-tools-course'
import type { ConceptProgress, LanguageTrack } from '../types'
import { initialProgress } from './progress'
import {
  ADAPTIVE_PRACTICE_MAX_ITEMS,
  ADAPTIVE_PRACTICE_MAX_ITEMS_PER_MISSION,
  buildAdaptivePracticeSession,
  buildPracticeExercises,
  conceptDisplayName,
  countEligibleDueConcepts,
  resolveAdaptivePracticeSession,
} from './practice'

const now = new Date('2026-08-24T12:00:00')

function concept(
  strength: number,
  dueAt = '2026-08-24',
  correct = 1,
  incorrect = 0,
): ConceptProgress {
  return { strength, correct, incorrect, dueAt }
}

function progressForMissions(track: LanguageTrack, missionIndexes: number[]) {
  const missions = missionIndexes.map((index) => track.missions[index])
  const conceptIds = [...new Set(missions.flatMap((mission) => (
    mission.exercises.map((exercise) => exercise.conceptId)
  )))]
  return {
    ...initialProgress(track.id),
    completedMissions: missions.map((mission) => mission.id),
    conceptProgress: Object.fromEntries(conceptIds.map((id) => (
      [id, concept(4, '2026-09-10')]
    ))),
  }
}

function mergedPythonTrack(): LanguageTrack {
  const foundation = trackById('python')
  return {
    ...foundation,
    missions: [...foundation.missions, ...pythonDataToolsCourse.missions],
  }
}

describe('adaptive practice sessions', () => {
  const pythonFoundations = trackById('python')
  const python = mergedPythonTrack()

  it('starts new learners in Python Foundations across the merged Python track', () => {
    const session = buildAdaptivePracticeSession(python, initialProgress('python'), now)

    expect(session).toMatchObject({
      version: 1,
      language: 'python',
      generatedFor: '2026-08-24',
      mode: 'start',
      items: [],
      dueConcepts: [],
    })
    expect(session.starterMission).toBe(pythonFoundations.missions[0])
    expect(session.starterMission.id).toBe('py-first-spark')
  })

  it('does not unlock Practice from partial lesson completion before the module closes', () => {
    const lesson = python.missions[0].exercises[0]
    const progress = {
      ...initialProgress('python'),
      completedLessons: [lesson.id],
      conceptProgress: {
        [lesson.conceptId]: concept(0),
      },
    }

    const session = buildAdaptivePracticeSession(python, progress, now)

    expect(session.mode).toBe('start')
    expect(session.items).toEqual([])
    expect(session.dueConcepts).toEqual([])
    expect(countEligibleDueConcepts(python, progress, now)).toBe(0)
    expect(resolveAdaptivePracticeSession(python, progress, [lesson.id], now)).toEqual({
      ok: false,
      reason: 'unknown-item',
    })
  })

  it('admits Data Tools exercises only after their exact mission is complete', () => {
    const completedDataMission = pythonDataToolsCourse.missions[0]
    const incompleteDataMission = pythonDataToolsCourse.missions[1]
    const incompleteFoundationMission = pythonFoundations.missions[1]
    const seededMissions = [
      ...pythonDataToolsCourse.missions,
      incompleteFoundationMission,
    ]
    const seededConceptIds = [...new Set(seededMissions.flatMap((mission) => (
      mission.exercises.map((exercise) => exercise.conceptId)
    )))]
    const beforeMissionCompletion = {
      ...initialProgress('python'),
      completedLessons: seededMissions.flatMap((mission) => (
        mission.exercises.map((exercise) => exercise.id)
      )),
      conceptProgress: Object.fromEntries(seededConceptIds.map((id) => (
        [id, concept(0)]
      ))),
    }

    const before = buildAdaptivePracticeSession(python, beforeMissionCompletion, now)

    expect(before.items).toEqual([])
    for (const mission of pythonDataToolsCourse.missions) {
      for (const exercise of mission.exercises) {
        expect(resolveAdaptivePracticeSession(
          python,
          beforeMissionCompletion,
          [exercise.id],
          now,
        )).toEqual({ ok: false, reason: 'unknown-item' })
      }
    }

    const afterMissionCompletion = {
      ...beforeMissionCompletion,
      completedMissions: [completedDataMission.id],
    }
    const after = buildAdaptivePracticeSession(python, afterMissionCompletion, now)
    const completedConceptIds = new Set(
      completedDataMission.exercises.map((exercise) => exercise.conceptId),
    )

    expect(incompleteDataMission.status).toBe('locked')
    expect(incompleteFoundationMission.status).toBe('locked')
    expect(countEligibleDueConcepts(python, afterMissionCompletion, now)).toBe(
      completedConceptIds.size,
    )
    expect(after.items.length).toBeGreaterThan(0)
    expect(new Set(after.items.map((item) => item.missionId))).toEqual(
      new Set([completedDataMission.id]),
    )
    expect(after.items.some((item) => item.missionId === incompleteDataMission.id)).toBe(false)
    expect(after.items.some((item) => item.missionId === incompleteFoundationMission.id)).toBe(false)

    for (const exercise of completedDataMission.exercises) {
      expect(resolveAdaptivePracticeSession(
        python,
        afterMissionCompletion,
        [exercise.id],
        now,
      )).toMatchObject({
        ok: true,
        session: {
          items: [{
            missionId: completedDataMission.id,
            exercise: { id: exercise.id },
          }],
        },
      })
    }
    expect(resolveAdaptivePracticeSession(
      python,
      afterMissionCompletion,
      [incompleteDataMission.exercises[0].id],
      now,
    )).toEqual({ ok: false, reason: 'unknown-item' })
    expect(resolveAdaptivePracticeSession(
      python,
      afterMissionCompletion,
      [incompleteFoundationMission.exercises[0].id],
      now,
    )).toEqual({ ok: false, reason: 'unknown-item' })
  })

  it('builds one bounded review across several completed missions', () => {
    const progress = progressForMissions(python, [0, 1, 2])
    const targetConcepts = [
      python.missions[0].exercises[0].conceptId,
      python.missions[0].exercises[1].conceptId,
      python.missions[1].exercises[0].conceptId,
      python.missions[1].exercises[1].conceptId,
      python.missions[2].exercises[0].conceptId,
    ]
    targetConcepts.forEach((id, index) => {
      progress.conceptProgress[id] = concept(index % 3, `2026-08-${String(19 + index).padStart(2, '0')}`, 2, index)
    })

    const session = buildAdaptivePracticeSession(python, progress, now)
    const missionCounts = session.items.reduce<Record<string, number>>((counts, item) => ({
      ...counts,
      [item.missionId]: (counts[item.missionId] ?? 0) + 1,
    }), {})

    expect(session.mode).toBe('due')
    expect(session.items.length).toBeGreaterThanOrEqual(3)
    expect(session.items.length).toBeLessThanOrEqual(ADAPTIVE_PRACTICE_MAX_ITEMS)
    expect(new Set(session.items.map((item) => item.missionId)).size).toBeGreaterThanOrEqual(2)
    expect(Math.max(...Object.values(missionCounts))).toBeLessThanOrEqual(ADAPTIVE_PRACTICE_MAX_ITEMS_PER_MISSION)
  })

  it('orders due ideas before future weak and fresh ideas', () => {
    const progress = progressForMissions(python, [0, 1, 2])
    const [overdue, dueToday, weakFuture, freshFuture] = [
      python.missions[0].exercises[0].conceptId,
      python.missions[1].exercises[0].conceptId,
      python.missions[2].exercises[0].conceptId,
      python.missions[2].exercises[1].conceptId,
    ]
    progress.conceptProgress[overdue] = concept(3, '2026-08-20')
    progress.conceptProgress[dueToday] = concept(1, '2026-08-24')
    progress.conceptProgress[weakFuture] = concept(2, '2026-08-27')
    progress.conceptProgress[freshFuture] = concept(4, '2026-08-26')

    const session = buildAdaptivePracticeSession(python, progress, now)
    const reasons = session.items.map((item) => item.reason)

    expect(reasons.slice(0, 2)).toEqual(['due', 'due'])
    expect(reasons.indexOf('weak')).toBeGreaterThan(reasons.lastIndexOf('due'))
    expect(session.items[0].conceptId).toBe(overdue)
  })

  it('uses past misses to break otherwise equal priorities', () => {
    const progress = progressForMissions(python, [0])
    const [fewerMisses, moreMisses] = [...new Set(python.missions[0].exercises.map((exercise) => exercise.conceptId))]
    progress.conceptProgress[fewerMisses] = concept(1, '2026-08-20', 2, 1)
    progress.conceptProgress[moreMisses] = concept(1, '2026-08-20', 2, 4)

    const session = buildAdaptivePracticeSession(python, progress, now)

    expect(session.items[0].conceptId).toBe(moreMisses)
  })

  it('uses a weak optional review only when nothing is due', () => {
    const progress = progressForMissions(python, [0])
    const weak = python.missions[0].exercises[0].conceptId
    progress.conceptProgress[weak] = concept(2, '2026-08-27')

    const session = buildAdaptivePracticeSession(python, progress, now)

    expect(session.mode).toBe('weak')
    expect(session.dueConcepts).toEqual([])
    expect(session.items.some((item) => item.conceptId === weak && item.reason === 'weak')).toBe(true)
  })

  it('offers a deterministic fresh review and the next scheduled date when caught up', () => {
    const progress = progressForMissions(python, [0, 1])

    const first = buildAdaptivePracticeSession(python, progress, now)
    const second = buildAdaptivePracticeSession(python, progress, now)

    expect(first.mode).toBe('clear')
    expect(first.nextReviewAt).toBe('2026-09-10')
    expect(first.items.map((item) => item.exercise.id)).toEqual(second.items.map((item) => item.exercise.id))
  })

  it('scopes eligible due concepts to completed missions in the active language', () => {
    const progress = progressForMissions(python, [0])
    const learned = python.missions[0].exercises[0].conceptId
    progress.conceptProgress[learned] = concept(0)
    progress.conceptProgress['java-runtime'] = concept(0)
    progress.conceptProgress['project-python-input'] = concept(0)
    progress.conceptProgress[python.missions[1].exercises[0].conceptId] = concept(0)

    const session = buildAdaptivePracticeSession(python, progress, now)

    expect(countEligibleDueConcepts(python, progress, now)).toBe(session.dueConcepts.length)
    expect(session.items.every((item) => item.exercise.id.startsWith('py-'))).toBe(true)
    expect(session.items.some((item) => item.conceptId === 'java-runtime')).toBe(false)
    expect(session.items.some((item) => item.conceptId.startsWith('project-'))).toBe(false)
    expect(session.items.some((item) => item.missionId === python.missions[1].id)).toBe(false)
  })

  it('uses a safe due-today default for an impossible calendar date', () => {
    const progress = progressForMissions(python, [0])
    const learned = python.missions[0].exercises[0].conceptId
    progress.conceptProgress[learned] = concept(4, '2026-02-31', 9, 2)

    const session = buildAdaptivePracticeSession(python, progress, now)
    const repaired = session.items.find((item) => item.conceptId === learned)

    expect(repaired).toMatchObject({
      reason: 'due',
      progress: { strength: 0, correct: 0, incorrect: 0, dueAt: '2026-08-24' },
    })
  })

  it('never selects the same concept or exercise twice', () => {
    const progress = progressForMissions(python, [0, 1, 2, 3])
    for (const id of Object.keys(progress.conceptProgress)) progress.conceptProgress[id] = concept(0)

    const session = buildAdaptivePracticeSession(python, progress, now)

    expect(new Set(session.items.map((item) => item.conceptId)).size).toBe(session.items.length)
    expect(new Set(session.items.map((item) => item.exercise.id)).size).toBe(session.items.length)
  })

  it.each(['python', 'cpp', 'csharp', 'java'] as const)('builds eligible authored practice for %s', (language) => {
    const track = trackById(language)
    const progress = progressForMissions(track, [0, 1])
    for (const id of Object.keys(progress.conceptProgress)) progress.conceptProgress[id] = concept(1)

    const session = buildAdaptivePracticeSession(track, progress, now)

    expect(session.items.length).toBeGreaterThan(0)
    expect(session.items.every((item) => item.exercise && item.missionId)).toBe(true)
  })

  it('resolves a frozen queue only while every item remains eligible', () => {
    const progress = progressForMissions(python, [0, 1])
    for (const id of Object.keys(progress.conceptProgress)) progress.conceptProgress[id] = concept(1)
    const built = buildAdaptivePracticeSession(python, progress, now)
    const ids = built.items.map((item) => item.exercise.id)

    expect(resolveAdaptivePracticeSession(python, progress, ids, now)).toMatchObject({ ok: true })

    const noCompletedMissions = { ...progress, completedMissions: [] }
    expect(resolveAdaptivePracticeSession(python, noCompletedMissions, ids, now)).toEqual({
      ok: false,
      reason: 'unknown-item',
    })
  })

  it('rejects duplicate, overlong, unknown, duplicate-concept, and overconcentrated queues', () => {
    const progress = progressForMissions(python, [0, 1])
    const firstMission = python.missions[0]
    const firstId = firstMission.exercises[0].id
    const sameConceptIds = firstMission.exercises
      .filter((exercise) => exercise.conceptId === firstMission.exercises[0].conceptId)
      .map((exercise) => exercise.id)
    const distinctFromFirst = firstMission.exercises.filter((exercise, index, exercises) => (
      exercises.findIndex((candidate) => candidate.conceptId === exercise.conceptId) === index
    )).map((exercise) => exercise.id)

    expect(resolveAdaptivePracticeSession(python, progress, [], now)).toEqual({ ok: false, reason: 'empty' })
    expect(resolveAdaptivePracticeSession(python, progress, [firstId, firstId], now)).toEqual({ ok: false, reason: 'duplicate-item' })
    expect(resolveAdaptivePracticeSession(python, progress, Array.from({ length: 6 }, (_, index) => `unknown-${index}`), now)).toEqual({ ok: false, reason: 'too-many-items' })
    expect(resolveAdaptivePracticeSession(python, progress, ['not-authored'], now)).toEqual({ ok: false, reason: 'unknown-item' })
    if (sameConceptIds.length > 1) {
      expect(resolveAdaptivePracticeSession(python, progress, sameConceptIds.slice(0, 2), now)).toEqual({ ok: false, reason: 'duplicate-concept' })
    }
    if (distinctFromFirst.length > ADAPTIVE_PRACTICE_MAX_ITEMS_PER_MISSION) {
      expect(resolveAdaptivePracticeSession(
        python,
        progress,
        distinctFromFirst.slice(0, ADAPTIVE_PRACTICE_MAX_ITEMS_PER_MISSION + 1),
        now,
      )).toEqual({ ok: false, reason: 'too-many-from-one-mission' })
    }
  })

  it('normalizes legacy concept lists in authored order, with one item per concept and a fixed cap', () => {
    const mission = python.missions[0]
    const concepts = mission.exercises.map((exercise) => exercise.conceptId)
    const exercises = buildPracticeExercises(mission, [...concepts, ...concepts, 'python-not-authored'])

    expect(exercises.length).toBeLessThanOrEqual(ADAPTIVE_PRACTICE_MAX_ITEMS)
    expect(new Set(exercises.map((exercise) => exercise.conceptId)).size).toBe(exercises.length)
    expect(exercises.every((exercise) => mission.exercises.includes(exercise))).toBe(true)
  })

  it('turns internal concept IDs into learner-facing names', () => {
    expect(conceptDisplayName(python, 'python-output-and-variables')).toBe('output and variables')
  })
})
