import { describe, expect, it } from 'vitest'
import { courseDefinitions } from './course-registry'
import {
  definePublishedLearningSequences,
  publishedContinuingCourseIdsForLanguage,
  publishedFoundationCourseId,
  publishedLearningSequences,
  publishedLearningUnitsForLanguage,
  publishedProjectUnit,
  publishedProjectUnitAfterCourse,
  publishedProjectUnitsForLanguage,
} from './learning-sequence'
import {
  orderProjectManifestsForLearningSequence,
  projectManifestByRoute,
  projectManifests,
  projectRouteKey,
} from './project-manifests'
import { guidedProjectLoaders, loadGuidedProject } from './project-registry'
import { publishedContinuingCourseLoaders } from './published-continuing-course-loaders'
import type { CourseId, LanguageId } from '../types'

describe('public learning sequence', () => {
  it('declares the existing Python transition in one explicit order', () => {
    expect(publishedLearningUnitsForLanguage('python')).toEqual([
      { kind: 'course', stage: 'foundation', courseId: 'python-foundations' },
      {
        kind: 'project',
        projectId: 'first-interactive-program',
        prerequisiteCourseId: 'python-foundations',
      },
      { kind: 'course', stage: 'continuing', courseId: 'python-data-tools' },
    ])
    expect(publishedFoundationCourseId('python')).toBe('python-foundations')
    expect(publishedProjectUnitAfterCourse('python', 'python-foundations')?.projectId)
      .toBe('first-interactive-program')
    expect(publishedContinuingCourseIdsForLanguage('python')).toEqual(['python-data-tools'])
  })

  it('declares the published C++ transition in one explicit order', () => {
    expect(publishedLearningUnitsForLanguage('cpp')).toEqual([
      { kind: 'course', stage: 'foundation', courseId: 'cpp-foundations' },
      {
        kind: 'project',
        projectId: 'first-compiled-program',
        prerequisiteCourseId: 'cpp-foundations',
      },
      { kind: 'course', stage: 'continuing', courseId: 'cpp-collections-records' },
    ])
    expect(publishedFoundationCourseId('cpp')).toBe('cpp-foundations')
    expect(publishedProjectUnitAfterCourse('cpp', 'cpp-foundations')?.projectId)
      .toBe('first-compiled-program')
    expect(publishedContinuingCourseIdsForLanguage('cpp')).toEqual(['cpp-collections-records'])
  })

  it('orders project manifests from the learning sequence, not registration order', () => {
    const reversed = [...projectManifests].reverse()
    const ordered = orderProjectManifestsForLearningSequence(reversed)

    expect(ordered.map((project) => projectRouteKey(project.language, project.id))).toEqual([
      'python:first-interactive-program',
      'cpp:first-compiled-program',
      'csharp:workshop-check-in',
      'java:picnic-planner',
    ])
  })

  it('keeps course, project manifest, and project loader coverage exact', async () => {
    const courseIds = new Set(courseDefinitions.map((course) => course.id))
    const projectKeys = publishedLearningSequences.flatMap((sequence) => (
      publishedProjectUnitsForLanguage(sequence.language).map((unit) => (
        projectRouteKey(sequence.language, unit.projectId)
      ))
    ))

    for (const sequence of publishedLearningSequences) {
      for (const unit of sequence.units) {
        if (unit.kind === 'course') expect(courseIds.has(unit.courseId)).toBe(true)
      }
    }
    expect(projectManifests.map((project) => projectRouteKey(project.language, project.id)))
      .toEqual(projectKeys)
    expect(guidedProjectLoaders.map((loader) => projectRouteKey(loader.language, loader.projectId)))
      .toEqual(projectKeys)

    for (const manifest of projectManifests) {
      const loaded = await loadGuidedProject(manifest.language, manifest.id)
      expect(loaded?.id).toBe(manifest.id)
      expect(loaded?.language).toBe(manifest.language)
    }
  })

  it('fails closed for unknown and mismatched runtime identifiers', async () => {
    const unknownLanguage = 'ruby' as LanguageId
    const unknownCourse = 'unknown-course' as CourseId

    expect(publishedLearningUnitsForLanguage(unknownLanguage)).toEqual([])
    expect(publishedContinuingCourseIdsForLanguage(unknownLanguage)).toEqual([])
    expect(publishedFoundationCourseId(unknownLanguage)).toBeUndefined()
    expect(publishedProjectUnit('python', 'missing-project')).toBeUndefined()
    expect(publishedProjectUnitAfterCourse('python', unknownCourse)).toBeUndefined()
    expect(projectManifestByRoute('cpp', 'first-interactive-program')).toBeUndefined()
    await expect(loadGuidedProject('cpp', 'first-interactive-program')).resolves.toBeUndefined()
  })

  it('rejects duplicate or ambiguous sequence declarations', () => {
    expect(() => definePublishedLearningSequences([
      {
        language: 'python',
        units: [{ kind: 'course', stage: 'foundation', courseId: 'python-foundations' }],
      },
      {
        language: 'python',
        units: [{ kind: 'course', stage: 'foundation', courseId: 'python-foundations' }],
      },
    ])).toThrow(/Duplicate learning sequence/iu)

    expect(() => definePublishedLearningSequences([{
      language: 'python',
      units: [
        { kind: 'course', stage: 'foundation', courseId: 'python-foundations' },
        { kind: 'course', stage: 'continuing', courseId: 'python-foundations' },
      ],
    }])).toThrow(/Duplicate published learning unit/iu)

    expect(() => definePublishedLearningSequences([{
      language: 'python',
      units: [
        { kind: 'course', stage: 'foundation', courseId: 'python-foundations' },
        {
          kind: 'project',
          projectId: 'first-interactive-program',
          prerequisiteCourseId: 'python-data-tools',
        },
      ],
    }])).toThrow(/must follow its prerequisite course/iu)
  })

  it('publishes Practical C++ in both its sequence and loader registry', () => {
    expect(publishedContinuingCourseLoaders.map((loader) => loader.courseId)).toEqual([
      'python-data-tools',
      'cpp-collections-records',
    ])
    expect(publishedLearningUnitsForLanguage('cpp').at(-1)).toEqual({
      kind: 'course',
      stage: 'continuing',
      courseId: 'cpp-collections-records',
    })
  })
})
