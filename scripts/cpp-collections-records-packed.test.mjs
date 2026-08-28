import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import {
  checkCppCollectionsRecordsPackedCandidate,
  cppCollectionsRecordsPackedBudgets,
} from './check-cpp-collections-records-packed.mjs'
import { renderPackedCoursePayload } from './generate-cpp-collections-records-packed.mjs'

const generatedCourseUrl = new URL(
  '../src/data/cpp-collections-records-course-packed.generated.json',
  import.meta.url,
)

describe('Practical C++ packed teaching candidate', () => {
  it('is the deterministic output of the readable authored course', async () => {
    expect(readFileSync(generatedCourseUrl, 'utf8')).toBe(await renderPackedCoursePayload())
  })

  it('fits both fixed isolated teaching-data limits', () => {
    const sizes = checkCppCollectionsRecordsPackedCandidate()
    expect(sizes.raw).toBeLessThanOrEqual(cppCollectionsRecordsPackedBudgets.raw)
    expect(sizes.gzip).toBeLessThanOrEqual(cppCollectionsRecordsPackedBudgets.gzip)
  })
})
