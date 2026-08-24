import { describe, expect, it } from 'vitest'
import { tracks } from '../data/curriculum'
import { missionAvailability } from './missions'

describe('mission availability', () => {
  const python = tracks[0]

  it('keeps the first implemented mission available', () => {
    expect(missionAvailability(python, 0, [])).toBe('available')
  })

  it('requires the previous mission before opening an implemented next mission', () => {
    const track = {
      ...python,
      missions: python.missions.map((mission, index) => (
        index === 1 ? { ...mission, exercises: python.missions[0].exercises } : mission
      )),
    }

    expect(missionAvailability(track, 1, [])).toBe('prerequisite')
    expect(missionAvailability(track, 1, ['py-first-spark'])).toBe('available')
  })

  it('unlocks an authored third mission after the second is complete', () => {
    expect(missionAvailability(python, 2, ['py-signal-protocol'])).toBe('available')
  })

  it('unlocks an authored fourth mission after the third is complete', () => {
    expect(missionAvailability(python, 3, ['py-cargo-logic'])).toBe('available')
  })

  it('does not unlock curriculum that has not been authored', () => {
    expect(missionAvailability(python, 4, ['py-looping-orbit'])).toBe('coming-soon')
  })
})
