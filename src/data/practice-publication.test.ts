import { readFileSync } from 'node:fs'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  ADAPTIVE_PRACTICE_MAX_ITEMS,
  ADAPTIVE_PRACTICE_MAX_ITEMS_PER_MISSION,
  buildAdaptivePracticeSession,
  resolveAdaptivePracticeSession,
} from '../lib/practice'
import { loadOrCreatePracticeSession } from '../lib/practice-session'
import { initialProgress, recordAttempt } from '../lib/progress'
import type { ConceptProgress, LanguageTrack, LearnerProgress } from '../types'
import { basePublishedContinuingCourseRegistrations } from './continuing-course-publications.base'
import {
  candidateCppContinuingCourseRegistration,
  controlledContinuingCourseRegistrations,
} from './continuing-course-publications.with-cpp'
import { courseDefinitions } from './course-registry'
import { trackById } from './curriculum'
import { foundationMissionLessonIds } from './foundation-curriculum-index'
import { createLearningSurface } from './learning-surface'
import {
  definePublishedLearningSequences,
  publishedLearningSequences,
} from './learning-sequence'
import { loadPracticeTrackForSurface } from './practice-publication'
import { pythonDataToolsCourse } from './python-data-tools-course'

const now = new Date('2026-08-27T12:00:00')
const candidateCourseId = candidateCppContinuingCourseRegistration.definition.id
const candidateMissionIds = new Set(
  candidateCppContinuingCourseRegistration.definition.missionIds,
)
const foundationCourseDefinitions = courseDefinitions.filter((definition) => (
  definition.kind === 'foundation'
))
const candidateLearningSequences = definePublishedLearningSequences(
  publishedLearningSequences.map((sequence) => sequence.language === 'cpp'
    ? {
        ...sequence,
        units: [
          ...sequence.units,
          { kind: 'course', stage: 'continuing', courseId: candidateCourseId } as const,
        ],
      }
    : sequence),
)
const baseSurface = createLearningSurface({
  foundationCourseDefinitions,
  foundationModuleLessonIds: foundationMissionLessonIds,
  learningSequences: publishedLearningSequences,
  continuingCourseRegistrations: basePublishedContinuingCourseRegistrations,
})
const candidateSurface = createLearningSurface({
  foundationCourseDefinitions,
  foundationModuleLessonIds: foundationMissionLessonIds,
  learningSequences: candidateLearningSequences,
  continuingCourseRegistrations: controlledContinuingCourseRegistrations,
})
const candidatePayload = JSON.parse(readFileSync(
  new URL('./cpp-collections-records-course-packed.generated.json', import.meta.url),
  'utf8',
)) as unknown

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

function concept(
  strength: number,
  dueAt: string,
  correct = 1,
  incorrect = 0,
): ConceptProgress {
  return { strength, correct, incorrect, dueAt }
}

function futureFoundationConcepts(track: LanguageTrack): Record<string, ConceptProgress> {
  return Object.fromEntries([...new Set(track.missions.flatMap((mission) => (
    mission.exercises.map((exercise) => exercise.conceptId)
  )))].map((conceptId) => [conceptId, concept(5, '2026-09-30', 5)]))
}

function cppReadyProgress(
  completedCandidateMissions: readonly string[] = [],
): LearnerProgress {
  const foundation = trackById('cpp')
  return {
    ...initialProgress('cpp'),
    completedMissions: [
      ...foundation.missions.map((mission) => mission.id),
      ...completedCandidateMissions,
    ],
    completedProjects: ['first-compiled-program'],
    conceptProgress: futureFoundationConcepts(foundation),
  }
}

async function candidateCppPracticeTrack(
  progress: LearnerProgress,
): Promise<LanguageTrack> {
  const result = await loadPracticeTrackForSurface(
    candidateSurface,
    trackById('cpp'),
    progress,
  )
  if (!result.ok) throw new Error(`Candidate Practice content failed: ${result.courseId}`)
  return result.track
}

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn(async () => Response.json(candidatePayload)))
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('controlled Practical C++ Practice publication', () => {
  it('keeps the base production surface at five courses with foundation-only C++ Practice', async () => {
    const foundation = trackById('cpp')
    const progress = cppReadyProgress([...candidateMissionIds])
    const result = await loadPracticeTrackForSurface(baseSurface, foundation, progress)

    expect(courseDefinitions.map((definition) => definition.id)).toEqual([
      'python-foundations',
      'cpp-foundations',
      'csharp-foundations',
      'java-foundations',
      'python-data-tools',
    ])
    expect(baseSurface.continuingCourseIdsForLanguage('cpp')).toEqual([])
    expect(result).toEqual({ ok: true, track: foundation })
    expect(JSON.stringify(result)).not.toContain(candidateCourseId)
  })

  it('does not load or expose candidate missions while either course prerequisite is missing', async () => {
    const foundation = trackById('cpp')
    const progress = {
      ...initialProgress('cpp'),
      completedMissions: [candidateCppContinuingCourseRegistration.definition.missionIds[0]],
    }
    const result = await loadPracticeTrackForSurface(candidateSurface, foundation, progress)

    expect(candidateSurface.courseIsAvailable(candidateCourseId, progress)).toBe(false)
    expect(result).toEqual({ ok: true, track: foundation })
    expect(vi.mocked(fetch)).not.toHaveBeenCalled()
  })

  it('ignores a recorded later module when an earlier candidate module is incomplete', async () => {
    const laterMissionId = candidateCppContinuingCourseRegistration.definition.missionIds[1]
    const foundation = trackById('cpp')
    const result = await loadPracticeTrackForSurface(
      candidateSurface,
      foundation,
      cppReadyProgress([laterMissionId]),
    )

    expect(result).toEqual({ ok: true, track: foundation })
    expect(vi.mocked(fetch)).not.toHaveBeenCalled()
  })

  it('admits Practical C++ work only after the exact module completion record exists', async () => {
    const firstMissionId = candidateCppContinuingCourseRegistration.definition.missionIds[0]
    const secondMissionId = candidateCppContinuingCourseRegistration.definition.missionIds[1]
    const progressBefore = cppReadyProgress()
    const trackBefore = await candidateCppPracticeTrack(progressBefore)
    const candidateContent = await candidateSurface.continuingCourseContentRequest(candidateCourseId)
    const firstMission = candidateContent?.missions.find((mission) => mission.id === firstMissionId)
    const secondMission = candidateContent?.missions.find((mission) => mission.id === secondMissionId)
    if (!firstMission || !secondMission) throw new Error('Candidate Practice missions are missing.')
    const partialOnly = {
      ...progressBefore,
      completedLessons: firstMission.exercises.map((exercise) => exercise.id),
      conceptProgress: {
        ...progressBefore.conceptProgress,
        ...Object.fromEntries(firstMission.exercises.map((exercise) => (
          [exercise.conceptId, concept(0, '2026-08-27')]
        ))),
      },
    }

    const before = buildAdaptivePracticeSession(trackBefore, partialOnly, now)
    expect(before.items.some((item) => candidateMissionIds.has(item.missionId))).toBe(false)
    expect(resolveAdaptivePracticeSession(
      trackBefore,
      partialOnly,
      [firstMission.exercises[0].id],
      now,
    )).toEqual({ ok: false, reason: 'unknown-item' })

    const completedFirst = {
      ...partialOnly,
      completedMissions: [...partialOnly.completedMissions, firstMissionId],
    }
    const trackAfter = await candidateCppPracticeTrack(completedFirst)
    const after = buildAdaptivePracticeSession(trackAfter, completedFirst, now)
    const candidateItems = after.items.filter((item) => candidateMissionIds.has(item.missionId))

    expect(trackAfter.missions.filter((mission) => candidateMissionIds.has(mission.id)).map((mission) => mission.id))
      .toEqual([firstMissionId])
    expect(candidateItems.length).toBeGreaterThan(0)
    expect(new Set(candidateItems.map((item) => item.missionId))).toEqual(new Set([firstMissionId]))
    expect(after.items.some((item) => item.missionId === secondMissionId)).toBe(false)
    expect(resolveAdaptivePracticeSession(
      trackAfter,
      completedFirst,
      [firstMission.exercises[0].id],
      now,
    )).toMatchObject({ ok: true })
    expect(resolveAdaptivePracticeSession(
      trackAfter,
      completedFirst,
      [secondMission.exercises[0].id],
      now,
    )).toEqual({ ok: false, reason: 'unknown-item' })
  })

  it('selects a deterministic C++-only queue within every existing bound', async () => {
    const progress = cppReadyProgress([...candidateMissionIds])
    const track = await candidateCppPracticeTrack(progress)
    const first = buildAdaptivePracticeSession(track, progress, now)
    const second = buildAdaptivePracticeSession(track, progress, now)
    const missionCounts = first.items.reduce<Record<string, number>>((counts, item) => ({
      ...counts,
      [item.missionId]: (counts[item.missionId] ?? 0) + 1,
    }), {})

    expect(first.items.map((item) => item.exercise.id)).toEqual(
      second.items.map((item) => item.exercise.id),
    )
    expect(first.items).toHaveLength(ADAPTIVE_PRACTICE_MAX_ITEMS)
    expect(first.items.every((item) => item.exercise.id.startsWith('cpp'))).toBe(true)
    expect(first.items.every((item) => item.exercise.xp > 0)).toBe(true)
    expect(new Set(first.items.map((item) => item.exercise.id)).size).toBe(first.items.length)
    expect(new Set(first.items.map((item) => item.conceptId)).size).toBe(first.items.length)
    expect(Math.max(...Object.values(missionCounts))).toBeLessThanOrEqual(
      ADAPTIVE_PRACTICE_MAX_ITEMS_PER_MISSION,
    )
  })

  it('restores an eligible stored candidate queue and replaces it after eligibility is removed', async () => {
    const firstMissionId = candidateCppContinuingCourseRegistration.definition.missionIds[0]
    const progress = cppReadyProgress([firstMissionId])
    const track = await candidateCppPracticeTrack(progress)
    const storage = memoryStorage()
    const first = loadOrCreatePracticeSession(track, progress, storage, now)
    const firstIds = first.items.map((item) => item.exercise.id)
    const changed = {
      ...progress,
      conceptProgress: Object.fromEntries(Object.entries(progress.conceptProgress).map(([id, value]) => [
        id,
        { ...value, strength: 4, dueAt: '2026-10-10' },
      ])),
    }
    const changedTrack = await candidateCppPracticeTrack(changed)
    const restored = loadOrCreatePracticeSession(changedTrack, changed, storage, now)

    expect(firstIds.some((exerciseId) => exerciseId.startsWith('cpprecords1-'))).toBe(true)
    expect(restored.items.map((item) => item.exercise.id)).toEqual(firstIds)

    const noLongerEligible = {
      ...changed,
      completedMissions: changed.completedMissions.filter((id) => id !== firstMissionId),
    }
    const fallback = loadOrCreatePracticeSession(
      changedTrack,
      noLongerEligible,
      storage,
      now,
    )
    const rewritten = JSON.parse(
      storage.getItem('see-pound-coffee-pie-practice-session:cpp') ?? '{}',
    ) as { exerciseIds?: string[] }

    expect(fallback.items.every((item) => !candidateMissionIds.has(item.missionId))).toBe(true)
    expect(rewritten.exerciseIds).toEqual(fallback.items.map((item) => item.exercise.id))
    expect(rewritten.exerciseIds).not.toEqual(firstIds)
  })

  it('updates candidate concept review state with zero learner rewards or completions', async () => {
    const progress: LearnerProgress = {
      ...cppReadyProgress([...candidateMissionIds]),
      xp: 137,
      dailyXp: 11,
      dailyXpDate: '2026-08-27',
      starShards: 42,
      streak: 6,
      lastStudyDate: '2026-08-26',
      completedProjectCheckpoints: ['project-cpp-compiler-path'],
    }
    const track = await candidateCppPracticeTrack(progress)
    const session = buildAdaptivePracticeSession(track, progress, now)
    const reviewed = session.items.reduce<LearnerProgress>((current, item) => (
      recordAttempt(current, item.conceptId, true, 0, now)
    ), progress)

    expect(session.items.some((item) => candidateMissionIds.has(item.missionId))).toBe(true)
    expect(session.items.every((item) => item.exercise.xp > 0)).toBe(true)
    expect({
      xp: reviewed.xp,
      dailyXp: reviewed.dailyXp,
      starShards: reviewed.starShards,
      streak: reviewed.streak,
      lastStudyDate: reviewed.lastStudyDate,
      completedLessons: reviewed.completedLessons,
      completedMissions: reviewed.completedMissions,
      completedProjectCheckpoints: reviewed.completedProjectCheckpoints,
      completedProjects: reviewed.completedProjects,
    }).toEqual({
      xp: progress.xp,
      dailyXp: progress.dailyXp,
      starShards: progress.starShards,
      streak: progress.streak,
      lastStudyDate: progress.lastStudyDate,
      completedLessons: progress.completedLessons,
      completedMissions: progress.completedMissions,
      completedProjectCheckpoints: progress.completedProjectCheckpoints,
      completedProjects: progress.completedProjects,
    })
    for (const item of session.items) {
      expect(reviewed.conceptProgress[item.conceptId]?.correct).toBeGreaterThan(
        progress.conceptProgress[item.conceptId]?.correct ?? 0,
      )
    }
  })

  it('preserves foundation-only languages and the contiguous Practical Python Practice track', async () => {
    const java = trackById('java')
    const javaResult = await loadPracticeTrackForSurface(
      candidateSurface,
      java,
      initialProgress('java'),
    )
    expect(javaResult).toEqual({ ok: true, track: java })

    const python = trackById('python')
    const firstDataMission = pythonDataToolsCourse.missions[0]
    const pythonProgress = {
      ...initialProgress('python'),
      completedMissions: [
        ...python.missions.map((mission) => mission.id),
        firstDataMission.id,
      ],
      completedProjects: ['first-interactive-program'],
      conceptProgress: futureFoundationConcepts(python),
    }
    const pythonResult = await loadPracticeTrackForSurface(
      candidateSurface,
      python,
      pythonProgress,
    )
    if (!pythonResult.ok) throw new Error('Practical Python Practice content failed to load.')
    const session = buildAdaptivePracticeSession(pythonResult.track, pythonProgress, now)

    expect(pythonResult.track.missions.map((mission) => mission.id)).toEqual([
      ...python.missions.map((mission) => mission.id),
      firstDataMission.id,
    ])
    expect(session.items.some((item) => item.missionId === firstDataMission.id)).toBe(true)
    expect(session.items.every((item) => item.exercise.id.startsWith('py'))).toBe(true)
  })

  it('reports a selected continuing-content failure instead of silently dropping the course', async () => {
    const progress = cppReadyProgress([
      candidateCppContinuingCourseRegistration.definition.missionIds[0],
    ])
    const failingSurface = {
      ...candidateSurface,
      continuingCourseContentRequest: (courseId: string) => (
        courseId === candidateCourseId
          ? Promise.resolve(null)
          : candidateSurface.continuingCourseContentRequest(courseId)
      ),
    }
    const result = await loadPracticeTrackForSurface(
      failingSurface,
      trackById('cpp'),
      progress,
    )

    expect(result).toEqual({
      ok: false,
      reason: 'continuing-content-unavailable',
      courseId: candidateCourseId,
    })
  })
})
