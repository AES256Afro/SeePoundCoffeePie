import { describe, expect, it } from 'vitest'
import { courseDefinitions } from './course-registry'
import { basePublishedContinuingCourseRegistrations } from './continuing-course-publications.base'
import {
  continuingCourseContentMatchesRegistration,
  publishedContinuingCourseContentRequest,
  publishedContinuingCourseContentRequestsForLanguage,
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
    expect(await Promise.all(publishedContinuingCourseContentRequestsForLanguage('python'))).toEqual([content])
    expect(publishedContinuingCourseContentRequestsForLanguage('cpp')).toEqual([])
  })

  it('rejects content that does not exactly match its selected registration', async () => {
    const registration = basePublishedContinuingCourseRegistrations[0]
    const content = await registration.loadContent()
    const reversed = { ...content, missions: [...content.missions].reverse() }
    const wrongLesson = {
      ...content,
      missions: content.missions.map((mission, index) => index === 0
        ? {
            ...mission,
            exercises: mission.exercises.map((exercise, lessonIndex) => lessonIndex === 0
              ? { ...exercise, id: 'wrong-lesson' }
              : exercise),
          }
        : mission),
    }

    expect(continuingCourseContentMatchesRegistration(content, registration)).toBe(true)
    expect(continuingCourseContentMatchesRegistration(
      { ...content, language: 'cpp' },
      registration,
    )).toBe(false)
    expect(continuingCourseContentMatchesRegistration(reversed, registration)).toBe(false)
    expect(continuingCourseContentMatchesRegistration(wrongLesson, registration)).toBe(false)
  })
})
