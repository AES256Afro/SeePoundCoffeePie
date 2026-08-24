import type { LanguageTrack } from '../types'

export type MissionAvailability = 'available' | 'prerequisite' | 'coming-soon'

export function missionAvailability(
  track: LanguageTrack,
  missionIndex: number,
  completedMissionIds: string[],
): MissionAvailability {
  const mission = track.missions[missionIndex]
  if (!mission?.exercises.length) return 'coming-soon'
  if (missionIndex === 0) return 'available'

  const prerequisite = track.missions[missionIndex - 1]
  return prerequisite && completedMissionIds.includes(prerequisite.id)
    ? 'available'
    : 'prerequisite'
}
