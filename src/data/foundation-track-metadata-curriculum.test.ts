import { describe, expect, it } from 'vitest'
import { tracks } from './curriculum'
import { foundationTrackMetadataByLanguage } from './foundation-track-metadata'

describe('compact foundation mission titles', () => {
  it('preserves the readable curriculum labels used by compact routes', () => {
    for (const track of tracks) {
      expect(foundationTrackMetadataByLanguage(track.id)?.missionTitles).toEqual(
        track.missions.map((mission) => mission.title),
      )
    }
  })
})
