import { describe, expect, it } from 'vitest'
import {
  foundationCourseContentRequest,
  foundationCourseContentRequestForLanguage,
  foundationCourseLoaders,
} from './foundation-course-loaders'
import { publishedLearningSequences } from './learning-sequence'
import type { LanguageId } from '../types'

describe('foundation-course loaders', () => {
  it('covers the four published foundation courses in learning-sequence order', () => {
    expect(foundationCourseLoaders.map((loader) => [loader.language, loader.courseId])).toEqual([
      ['python', 'python-foundations'],
      ['cpp', 'cpp-foundations'],
      ['csharp', 'csharp-foundations'],
      ['java', 'java-foundations'],
    ])
    expect(foundationCourseLoaders).toHaveLength(publishedLearningSequences.length)
  })

  it('loads exact foundation content and rejects unknown identifiers', async () => {
    const content = await foundationCourseContentRequest('python-foundations')

    expect(content?.courseId).toBe('python-foundations')
    expect(content?.track.id).toBe('python')
    expect(content?.track.missions).toHaveLength(6)
    expect(await foundationCourseContentRequestForLanguage('python')).toBe(content)
    expect(foundationCourseContentRequest('python-data-tools')).toBeUndefined()
    expect(foundationCourseContentRequest('cpp-collections-records')).toBeUndefined()
    expect(foundationCourseContentRequestForLanguage('ruby' as LanguageId)).toBeUndefined()
  })
})
