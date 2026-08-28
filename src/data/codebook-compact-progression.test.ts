import { describe, expect, it } from 'vitest'
import {
  codebookEntries,
  codebookExampleState,
  codebookExampleStateForMissionIds,
} from './codebook'
import { courseDefinition, foundationCourseId } from './course-registry'
import { tracks } from './curriculum'

describe('compact Codebook progression', () => {
  it('matches the readable foundation track result for every entry and language', () => {
    for (const track of tracks) {
      const missionIds = courseDefinition(foundationCourseId(track.id)).missionIds
      const completionSets = [
        [],
        track.missions.map((mission) => mission.id),
        ...track.missions.map((mission) => [mission.id]),
      ]

      for (const entry of codebookEntries) {
        for (const completedMissionIds of completionSets) {
          expect(codebookExampleStateForMissionIds(
            entry,
            track.id,
            missionIds,
            completedMissionIds,
          )).toBe(codebookExampleState(entry, track, completedMissionIds))
        }
      }
    }
  })
})
