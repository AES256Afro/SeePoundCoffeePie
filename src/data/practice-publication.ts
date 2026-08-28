import type { LanguageTrack, LearnerProgress } from '../types'
import type { LearningSurface } from './learning-surface'

export type PracticePublicationSurface = Pick<
  LearningSurface,
  | 'continuingCourseIdsForLanguage'
  | 'continuingCourseContentRequest'
  | 'courseDefinition'
  | 'courseIsAvailable'
>

export type PracticeTrackLoadResult =
  | {
      ok: true
      track: LanguageTrack
    }
  | {
      ok: false
      reason: 'continuing-content-unavailable'
      courseId: string
    }

/**
 * Builds the language-wide Practice track from the exact selected learning
 * surface. Continuing content is included only when its course prerequisites
 * are currently satisfied. The Practice selector still decides which completed
 * modules and concepts are eligible.
 */
export async function loadPracticeTrackForSurface(
  surface: PracticePublicationSurface,
  foundationTrack: LanguageTrack,
  progress: LearnerProgress,
): Promise<PracticeTrackLoadResult> {
  const eligibleCourses = surface
    .continuingCourseIdsForLanguage(foundationTrack.id)
    .flatMap((courseId) => {
      if (!surface.courseIsAvailable(courseId, progress)) return []
      const definition = surface.courseDefinition(courseId)
      if (!definition) return []
      const completedMissionIds: string[] = []
      for (const missionId of definition.missionIds) {
        if (!progress.completedMissions.includes(missionId)) break
        completedMissionIds.push(missionId)
      }
      return completedMissionIds.length > 0
        ? [{ courseId, completedMissionIds }]
        : []
    })

  if (eligibleCourses.length === 0) {
    return { ok: true, track: foundationTrack }
  }

  const loaded = await Promise.all(eligibleCourses.map(async ({
    courseId,
    completedMissionIds,
  }) => {
    const request = surface.continuingCourseContentRequest(courseId)
    if (!request) return { courseId, completedMissionIds, content: null }
    try {
      return { courseId, completedMissionIds, content: await request }
    } catch {
      return { courseId, completedMissionIds, content: null }
    }
  }))
  const unavailable = loaded.find(({ courseId, completedMissionIds, content }) => (
    !content
    || content.id !== courseId
    || content.language !== foundationTrack.id
    || content.missions.some((mission) => mission.language !== foundationTrack.id)
    || completedMissionIds.some((missionId, index) => (
      content.missions[index]?.id !== missionId
    ))
  ))
  if (unavailable) {
    return {
      ok: false,
      reason: 'continuing-content-unavailable',
      courseId: unavailable.courseId,
    }
  }

  return {
    ok: true,
    track: {
      ...foundationTrack,
      missions: [
        ...foundationTrack.missions,
        ...loaded.flatMap(({ completedMissionIds, content }) => (
          content?.missions.slice(0, completedMissionIds.length) ?? []
        )),
      ],
    },
  }
}
