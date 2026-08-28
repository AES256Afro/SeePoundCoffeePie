import { describe, expect, it } from 'vitest'
import { tracks as authoredTracks } from './curriculum'
import { tracks as packedTracks } from './foundation-curriculum-packed.generated'

describe('packed foundation curriculum runtime', () => {
  it('reconstructs every authored value and object key exactly', () => {
    expect(JSON.stringify(packedTracks)).toBe(JSON.stringify(authoredTracks))
    expect(packedTracks).toEqual(authoredTracks)
  })
})
