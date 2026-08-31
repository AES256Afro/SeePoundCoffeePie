import { describe, expect, it } from 'vitest'
import {
  academyConceptIds,
  academyCourseForId,
  academyCourseForRoute,
  academyCourseIds,
  academyCourseOwnsModule,
  academyCourses,
  academyManifest,
  academyModuleForId,
  academyModuleForRoute,
  academyModuleIds,
  academyModuleOwnsUnit,
  academyModuleUnitIds,
  academyModules,
  academyPathForId,
  academyPathForSlug,
  academyPathIds,
  academyPathOwnsCourse,
  academyPaths,
  academyPreparationPageForId,
  academyPreparationPageForRoute,
  academyPreparationPageIds,
  academyPreparationPages,
  academyUnitForId,
  academyUnitForRoute,
  academyUnitIds,
  academyUnits,
} from './academy-manifest'

function objectKeys(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(objectKeys)
  if (!value || typeof value !== 'object') return []
  return Object.entries(value).flatMap(([key, child]) => [key, ...objectKeys(child)])
}

describe('open academy manifest', () => {
  it('publishes exactly two paths and only the two reviewed courses', () => {
    expect(academyPathIds).toEqual(['LM-100', 'RVF-PATH'])
    expect(academyPaths.map((path) => path.slug)).toEqual([
      'models-from-zero',
      'reality-versus-fiction',
    ])
    expect(academyCourseIds).toEqual(['LM-101', 'RVF-100'])
    expect(academyCourses.map((course) => course.title)).toEqual([
      'What a model is',
      'Programming on screen and at work',
    ])
    expect(academyManifest.paths).toHaveLength(2)
    expect(academyManifest.courses).toHaveLength(2)
    expect(academyManifest.modules).toHaveLength(3)
    expect(academyManifest.units).toHaveLength(8)
    expect(academyManifest.preparationPages).toHaveLength(4)
  })

  it('publishes the exact LM-101 and RVF-100 module and unit boundaries', () => {
    expect(academyCourseForId('LM-101')?.moduleIds).toEqual(['LM-101-M1', 'LM-101-M2'])
    expect(academyModuleUnitIds['LM-101-M1']).toEqual(['LM-101-U1', 'LM-101-U2', 'LM-101-U3'])
    expect(academyModuleUnitIds['LM-101-M2']).toEqual(['LM-101-U4', 'LM-101-U5', 'LML-101'])
    expect([
      ...academyModuleUnitIds['LM-101-M1'],
      ...academyModuleUnitIds['LM-101-M2'],
    ]).toHaveLength(6)
    expect(academyModuleUnitIds['LM-101-M2'].at(-1)).toBe('LML-101')
    expect(academyUnitForId('LML-101')?.title).toBe('Model or Not')

    expect(academyCourseForId('RVF-100')?.moduleIds).toEqual(['RVF-100-M1'])
    expect(academyModuleForId('RVF-100-M1')?.title).toBe('Build and execution')
    expect(academyModuleUnitIds['RVF-100-M1']).toEqual(['RVF-101', 'RVF-102'])
  })

  it('keeps every published record directly open with complete plain metadata', () => {
    const records = [
      ...academyPaths,
      ...academyCourses,
      ...academyModules,
      ...academyUnits,
      ...academyPreparationPages,
    ]

    for (const record of records) {
      expect(record.access).toBe('open')
      for (const field of ['id', 'slug', 'title', 'summary', 'outcome', 'time', 'activity', 'platform'] as const) {
        expect(record[field].trim(), `${record.id}.${field}`).not.toBe('')
      }
    }

    expect(academyPreparationPages.every((page) => (
      page.content.length > 0 && page.content.every((paragraph) => paragraph.trim().length > 0)
    ))).toBe(true)
  })

  it('offers all three optional preparation choices without changing access', () => {
    for (const course of academyCourses) {
      expect(course.optionalPreparation.map((choice) => choice.kind)).toEqual([
        'start',
        'refresher',
        'short-context',
      ])
      expect(course.optionalPreparation.map((choice) => choice.label)).toEqual([
        'Start now',
        'Review a refresher',
        'Read the short context',
      ])

      for (const choice of course.optionalPreparation) {
        if (choice.destination.kind === 'unit') {
          expect(academyUnitForId(choice.destination.id)?.courseId).toBe(course.id)
        } else {
          expect(academyPreparationPageForId(choice.destination.id)?.courseId).toBe(course.id)
        }
      }
    }
  })

  it('uses unique global record, preparation choice, and concept IDs', () => {
    const recordIds = [
      ...academyPathIds,
      ...academyCourseIds,
      ...academyModuleIds,
      ...academyUnitIds,
      ...academyPreparationPageIds,
    ]
    const preparationChoiceIds = academyCourses.flatMap((course) => (
      course.optionalPreparation.map((choice) => choice.id)
    ))
    const slugs = [
      ...academyPaths,
      ...academyCourses,
      ...academyModules,
      ...academyUnits,
      ...academyPreparationPages,
    ].map((record) => record.slug)

    expect(new Set(recordIds).size).toBe(recordIds.length)
    expect(new Set(preparationChoiceIds).size).toBe(preparationChoiceIds.length)
    expect(new Set(academyConceptIds).size).toBe(academyConceptIds.length)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('contains no learner identity, diagnosis, lock, or prerequisite fields', () => {
    const keys = objectKeys(academyManifest).map((key) => key.toLowerCase())
    expect(keys).not.toEqual(expect.arrayContaining([
      'diagnosis',
      'disability',
      'identity',
      'learnerprofile',
      'learnertype',
      'lock',
      'locked',
      'prerequisite',
      'prerequisites',
    ]))

    const learnerText = JSON.stringify(academyManifest)
    expect(learnerText).not.toMatch(/\b(?:adhd|audhd|autism|autistic|diagnosis|medicalized)\b/i)
  })

  it('resolves exact ownership and rejects mixed academy routes', () => {
    expect(academyPathForId('LM-100')?.slug).toBe('models-from-zero')
    expect(academyPathForSlug('reality-versus-fiction')?.id).toBe('RVF-PATH')
    expect(academyPathOwnsCourse('LM-100', 'LM-101')).toBe(true)
    expect(academyPathOwnsCourse('LM-100', 'RVF-100')).toBe(false)
    expect(academyCourseOwnsModule('LM-101', 'LM-101-M2')).toBe(true)
    expect(academyCourseOwnsModule('LM-101', 'RVF-100-M1')).toBe(false)
    expect(academyModuleOwnsUnit('LM-101-M2', 'LML-101')).toBe(true)
    expect(academyModuleOwnsUnit('LM-101-M1', 'LML-101')).toBe(false)

    expect(academyCourseForRoute('models-from-zero', 'what-a-model-is')?.id).toBe('LM-101')
    expect(academyCourseForRoute('models-from-zero', 'programming-on-screen-and-at-work')).toBeUndefined()
    expect(academyModuleForRoute('models-from-zero', 'what-a-model-is', 'capability-and-limits')?.id).toBe('LM-101-M2')
    expect(academyModuleForRoute('reality-versus-fiction', 'what-a-model-is', 'capability-and-limits')).toBeUndefined()
    expect(academyUnitForRoute(
      'models-from-zero',
      'what-a-model-is',
      'capability-and-limits',
      'model-or-not',
    )?.id).toBe('LML-101')
    expect(academyUnitForRoute(
      'models-from-zero',
      'what-a-model-is',
      'learned-behavior',
      'model-or-not',
    )).toBeUndefined()
    expect(academyPreparationPageForRoute(
      'models-from-zero',
      'what-a-model-is',
      'computer-words-refresher',
    )?.id).toBe('LM-101-P1')
    expect(academyPreparationPageForRoute(
      'models-from-zero',
      'what-a-model-is',
      'software-work-refresher',
    )).toBeUndefined()
  })
})
