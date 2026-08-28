import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import { renderPackedFoundationCurriculum } from './generate-foundation-curriculum-packed.mjs'

const generatedCurriculumUrl = new URL(
  '../src/data/foundation-curriculum-packed.generated.ts',
  import.meta.url,
)

describe('packed foundation curriculum generation', () => {
  it('reproduces the checked-in module byte for byte', async () => {
    const first = await renderPackedFoundationCurriculum()
    const second = await renderPackedFoundationCurriculum()

    expect(second).toBe(first)
    expect(readFileSync(generatedCurriculumUrl, 'utf8')).toBe(first)
  })
})
