import { describe, expect, it } from 'vitest'
import { courseDefinitions } from './course-registry'
import {
  publishedContinuingCourseContentRequest,
  publishedContinuingCourseContentRequestForLanguage,
  publishedContinuingCourseLoaders,
} from './published-continuing-course-loaders'
import { publishedContinuingCourseManifests } from './published-continuing-course-manifests'

describe('published continuing-course loaders', () => {
  it('registers exactly one loader for every published continuing course', () => {
    const loaderIds = publishedContinuingCourseLoaders.map((registration) => registration.courseId)
    const publishedIds = publishedContinuingCourseManifests.map((manifest) => manifest.courseId)
    const continuingDefinitionIds = courseDefinitions
      .filter((definition) => definition.kind === 'continuing')
      .map((definition) => definition.id)

    expect(loaderIds).toEqual(publishedIds)
    expect(loaderIds).toEqual(continuingDefinitionIds)
    expect(new Set(loaderIds).size).toBe(loaderIds.length)
  })

  it('does not expose a loader for the unpublished C++ course', () => {
    expect(publishedContinuingCourseContentRequest('cpp-collections-records')).toBeUndefined()
    expect(JSON.stringify(publishedContinuingCourseLoaders.map(({ courseId }) => courseId)))
      .not.toContain('cpp-collections-records')
  })

  it('loads Practical Python through its isolated content request', async () => {
    const content = await publishedContinuingCourseContentRequest('python-data-tools')

    expect(content?.id).toBe('python-data-tools')
    expect(content?.missions).toHaveLength(6)
    expect(content?.missions.at(-1)?.id).toBe('py-data-supply-tracker')
    expect(await publishedContinuingCourseContentRequestForLanguage('python')).toBe(content)
    expect(publishedContinuingCourseContentRequestForLanguage('cpp')).toBeUndefined()
  })
})
