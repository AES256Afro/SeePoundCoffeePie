import { describe, expect, it } from 'vitest'
import { basePublishedContinuingCourseRegistrations } from './continuing-course-publications.base'
import {
  courseDefinitions,
} from './course-registry'
import { foundationMissionLessonIds } from './foundation-curriculum-index'
import {
  createLearningSurface,
  type LearningSurfaceInput,
  type PublishedContinuingCourseRegistration,
} from './learning-surface'
import { publishedLearningSequences } from './learning-sequence'
import { initialProgress } from '../lib/progress'

const practicalPython = basePublishedContinuingCourseRegistrations[0]
if (!practicalPython) throw new Error('Practical Python registration is missing.')
const foundationCourseDefinitions = courseDefinitions.filter((definition) => (
  definition.kind === 'foundation'
))
const publishedLearningSurface = createLearningSurface({
  foundationCourseDefinitions,
  foundationModuleLessonIds: foundationMissionLessonIds,
  learningSequences: publishedLearningSequences,
  continuingCourseRegistrations: basePublishedContinuingCourseRegistrations,
})

function createTestSurface(
  overrides: Partial<LearningSurfaceInput> = {},
) {
  return createLearningSurface({
    foundationCourseDefinitions,
    foundationModuleLessonIds: foundationMissionLessonIds,
    learningSequences: publishedLearningSequences,
    continuingCourseRegistrations: basePublishedContinuingCourseRegistrations,
    ...overrides,
  })
}

function registrationWith(
  changes: Partial<PublishedContinuingCourseRegistration>,
): PublishedContinuingCourseRegistration {
  return { ...practicalPython, ...changes }
}

describe('learning surface', () => {
  it('assembles the current five-course surface without changing public IDs or order', () => {
    expect(publishedLearningSurface.courseDefinitions.map((definition) => definition.id)).toEqual([
      'python-foundations',
      'cpp-foundations',
      'csharp-foundations',
      'java-foundations',
      'python-data-tools',
    ])
    expect(publishedLearningSurface.courseDefinitions).toEqual(courseDefinitions)
    expect(publishedLearningSurface.courseDefinition('python-data-tools')?.language).toBe('python')
    expect(publishedLearningSurface.courseDefinitionForSlug('python-data-tools')?.id)
      .toBe('python-data-tools')
    expect(publishedLearningSurface.foundationCourseId('python')).toBe('python-foundations')
    expect(publishedLearningSurface.continuingCourseIdsForLanguage('python'))
      .toEqual(['python-data-tools'])
    expect(publishedLearningSurface.learningUnitsForLanguage('python').at(-1)).toEqual({
      kind: 'course',
      stage: 'continuing',
      courseId: 'python-data-tools',
    })
    expect(publishedLearningSurface.continuingCourseManifests.map((manifest) => manifest.courseId))
      .toEqual(['python-data-tools'])
  })

  it('keeps lookup, ownership, and prerequisite helpers fail closed', () => {
    const empty = initialProgress('python')

    expect(publishedLearningSurface.courseDefinition('unknown-course')).toBeUndefined()
    expect(publishedLearningSurface.courseDefinitionForSlug('unknown-course')).toBeUndefined()
    expect(publishedLearningSurface.continuingCourseManifest('unknown-course')).toBeUndefined()
    expect(publishedLearningSurface.continuingCourseContentRequest('unknown-course')).toBeUndefined()
    expect(publishedLearningSurface.continuingCourseModuleRequest(
      'python-data-tools',
      'unknown-module',
    )).toBeUndefined()
    expect(publishedLearningSurface.learningUnitsForLanguage('ruby' as never)).toEqual([])
    expect(publishedLearningSurface.courseOwnsMission('unknown-course', 'anything')).toBe(false)
    expect(publishedLearningSurface.courseOwnsLesson('unknown-course', 'anything')).toBe(false)
    expect(publishedLearningSurface.courseMissionLessonIds('unknown-course', 'anything')).toEqual([])
    expect(publishedLearningSurface.courseIsComplete('unknown-course', empty)).toBe(false)
    expect(publishedLearningSurface.courseIsAvailable('unknown-course', empty)).toBe(false)
    expect(publishedLearningSurface.missingCoursePrerequisites('unknown-course', empty)).toEqual([])

    expect(publishedLearningSurface.courseMissionLessonIds(
      'python-data-tools',
      'py-data-return-values',
    )).toEqual(practicalPython.manifest.modules[0]?.lessonIds)
    expect(publishedLearningSurface.courseMissionOwnsLesson(
      'python-data-tools',
      'py-data-return-values',
      'pydata1-return-purpose',
    )).toBe(true)
    expect(publishedLearningSurface.missingCoursePrerequisites('python-data-tools', empty))
      .toHaveLength(2)
  })

  it('owns an independent continuing-content request cache per surface', async () => {
    const content = await practicalPython.loadContent()
    let contentLoads = 0
    const countedRegistration = registrationWith({
      loadContent: async () => {
        contentLoads += 1
        return content
      },
    })
    const firstSurface = createTestSurface({
      continuingCourseRegistrations: [countedRegistration],
    })
    const secondSurface = createTestSurface({
      continuingCourseRegistrations: [countedRegistration],
    })

    const firstContentRequest = firstSurface.continuingCourseContentRequest('python-data-tools')
    expect(firstSurface.continuingCourseContentRequest('python-data-tools')).toBe(firstContentRequest)
    expect((await firstContentRequest)?.id).toBe('python-data-tools')
    expect(contentLoads).toBe(1)

    expect((await firstSurface.continuingCourseModuleRequest(
      'python-data-tools',
      'py-data-return-values',
    ))?.id).toBe('py-data-return-values')
    expect(contentLoads).toBe(1)

    expect((await secondSurface.continuingCourseContentRequest('python-data-tools'))?.id)
      .toBe('python-data-tools')
    expect((await secondSurface.continuingCourseModuleRequest(
      'python-data-tools',
      'py-data-return-values',
    ))?.id).toBe('py-data-return-values')
    expect(contentLoads).toBe(2)
  })

  it('rejects duplicate course IDs, slugs, module IDs, and lesson IDs', () => {
    const pythonFoundation = foundationCourseDefinitions[0]
    const cppFoundation = foundationCourseDefinitions[1]
    if (!pythonFoundation || !cppFoundation) throw new Error('Foundation fixtures are missing.')

    expect(() => createTestSurface({
      foundationCourseDefinitions: [
        pythonFoundation,
        { ...cppFoundation, id: pythonFoundation.id },
        ...foundationCourseDefinitions.slice(2),
      ],
    })).toThrow(/Duplicate course ID/iu)

    expect(() => createTestSurface({
      foundationCourseDefinitions: [
        pythonFoundation,
        { ...cppFoundation, slug: pythonFoundation.slug },
        ...foundationCourseDefinitions.slice(2),
      ],
    })).toThrow(/Duplicate course slug/iu)

    expect(() => createTestSurface({
      foundationCourseDefinitions: [
        pythonFoundation,
        {
          ...cppFoundation,
          missionIds: [pythonFoundation.missionIds[0]!, ...cppFoundation.missionIds.slice(1)],
        },
        ...foundationCourseDefinitions.slice(2),
      ],
    })).toThrow(/Duplicate module ID/iu)

    expect(() => createTestSurface({
      foundationCourseDefinitions: [
        pythonFoundation,
        {
          ...cppFoundation,
          lessonIds: [pythonFoundation.lessonIds[0]!, ...cppFoundation.lessonIds.slice(1)],
        },
        ...foundationCourseDefinitions.slice(2),
      ],
    })).toThrow(/Duplicate lesson ID/iu)

    const firstModule = practicalPython.manifest.modules[0]
    const secondModule = practicalPython.manifest.modules[1]
    if (!firstModule || !secondModule) throw new Error('Continuing fixtures are missing.')
    expect(() => createTestSurface({
      continuingCourseRegistrations: [registrationWith({
        manifest: {
          ...practicalPython.manifest,
          modules: [firstModule, firstModule, ...practicalPython.manifest.modules.slice(2)],
        },
      })],
    })).toThrow(/Duplicate module in python-data-tools/iu)

    expect(() => createTestSurface({
      continuingCourseRegistrations: [registrationWith({
        manifest: {
          ...practicalPython.manifest,
          modules: [
            firstModule,
            {
              ...secondModule,
              lessonIds: [firstModule.lessonIds[0]!, ...secondModule.lessonIds.slice(1)],
            },
            ...practicalPython.manifest.modules.slice(2),
          ],
        },
      })],
    })).toThrow(/Duplicate lesson in python-data-tools/iu)
  })

  it('validates the complete foundation and learning-sequence boundary', () => {
    const pythonFoundation = foundationCourseDefinitions[0]
    const pythonSequence = publishedLearningSequences[0]
    if (!pythonFoundation || !pythonSequence) throw new Error('Foundation fixtures are missing.')

    expect(() => createTestSurface({
      foundationCourseDefinitions: [
        { ...pythonFoundation, kind: 'continuing' },
        ...foundationCourseDefinitions.slice(1),
      ],
    })).toThrow(/Base course must be a foundation course/iu)

    expect(() => createTestSurface({
      learningSequences: [...publishedLearningSequences, pythonSequence],
    })).toThrow(/Duplicate learning sequence/iu)

    expect(() => createTestSurface({
      foundationCourseDefinitions: [
        {
          ...pythonFoundation,
          lessonIds: [...pythonFoundation.lessonIds].reverse(),
        },
        ...foundationCourseDefinitions.slice(1),
      ],
    })).toThrow(/Foundation lesson ownership/iu)

    expect(() => createTestSurface({
      foundationCourseDefinitions: foundationCourseDefinitions.slice(0, -1),
    })).toThrow(/does not match its learning sequence|course coverage/iu)
  })

  it('validates registration identity, manifest order, sequence anchor, and prerequisites', () => {
    expect(() => createTestSurface({
      continuingCourseRegistrations: [registrationWith({
        definition: { ...practicalPython.definition, kind: 'foundation' },
      })],
    })).toThrow(/Continuing kind/iu)

    expect(() => createTestSurface({
      continuingCourseRegistrations: [registrationWith({
        language: 'cpp',
      })],
    })).toThrow(/Continuing language/iu)

    expect(() => createTestSurface({
      continuingCourseRegistrations: [registrationWith({
        manifest: {
          ...practicalPython.manifest,
          modules: [...practicalPython.manifest.modules].reverse(),
        },
      })],
    })).toThrow(/Module order/iu)

    const firstModule = practicalPython.manifest.modules[0]
    if (!firstModule) throw new Error('Continuing fixture is missing.')
    expect(() => createTestSurface({
      continuingCourseRegistrations: [registrationWith({
        manifest: {
          ...practicalPython.manifest,
          modules: [
            { ...firstModule, lessonIds: [...firstModule.lessonIds].reverse() },
            ...practicalPython.manifest.modules.slice(1),
          ],
        },
      })],
    })).toThrow(/Lesson order/iu)

    expect(() => createTestSurface({
      continuingCourseRegistrations: [registrationWith({
        sequenceAfter: { language: 'python', projectId: 'missing-project' },
      })],
    })).toThrow(/Missing anchor/iu)

    expect(() => createTestSurface({
      continuingCourseRegistrations: [registrationWith({
        definition: {
          ...practicalPython.definition,
          prerequisites: [
            { kind: 'course', id: 'python-data-tools', label: 'Complete this course first' },
          ],
        },
      })],
    })).toThrow(/Anchor prerequisites|Prerequisite order/iu)
  })

  it('returns null when loaded content identity or order does not match registration', async () => {
    const content = await practicalPython.loadContent()
    const wrongContentSurface = createTestSurface({
      continuingCourseRegistrations: [registrationWith({
        loadContent: async () => ({
          ...content,
          missions: [...content.missions].reverse(),
        }),
      })],
    })
    await expect(wrongContentSurface.continuingCourseContentRequest('python-data-tools'))
      .resolves.toBeNull()
    await expect(wrongContentSurface.continuingCourseModuleRequest(
      'python-data-tools',
      'py-data-return-values',
    )).resolves.toBeNull()
  })
})
