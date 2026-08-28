import { readFileSync } from 'node:fs'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { courseDefinitions } from './course-registry'
import { basePublishedContinuingCourseRegistrations } from './continuing-course-publications.base'
import {
  continuingCourseContentMatchesRegistration,
  publishedContinuingCourseContentRequest,
  publishedContinuingCourseContentRequestsForLanguage,
  publishedContinuingCourseLoaders,
} from './published-continuing-course-loaders'
import { publishedContinuingCourseManifests } from './published-continuing-course-manifests'

const cppPayload = JSON.parse(readFileSync(
  new URL('./cpp-collections-records-course-packed.generated.json', import.meta.url),
  'utf8',
)) as unknown

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn(async () => Response.json(cppPayload)))
})

afterEach(() => {
  vi.unstubAllGlobals()
})

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

  it('loads the published Practical C++ course through its isolated content request', async () => {
    const content = await publishedContinuingCourseContentRequest('cpp-collections-records')

    expect(content?.id).toBe('cpp-collections-records')
    expect(content?.language).toBe('cpp')
    expect(content?.missions).toHaveLength(6)
    expect(content?.missions.flatMap((mission) => mission.exercises)).toHaveLength(30)
    expect(content?.missions.at(-1)?.id).toBe('cpp-records-workshop-report')
    expect(await Promise.all(publishedContinuingCourseContentRequestsForLanguage('cpp')))
      .toEqual([content])
  })

  it('loads Practical Python through its isolated content request', async () => {
    const content = await publishedContinuingCourseContentRequest('python-data-tools')

    expect(content?.id).toBe('python-data-tools')
    expect(content?.missions).toHaveLength(6)
    expect(content?.missions.at(-1)?.id).toBe('py-data-supply-tracker')
    expect(await Promise.all(publishedContinuingCourseContentRequestsForLanguage('python'))).toEqual([content])
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
