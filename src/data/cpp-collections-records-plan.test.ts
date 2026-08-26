import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'

import { courseDefinitionForSlug, courseDefinitions } from './course-registry'
import {
  cppCollectionsRecordsLessons,
  cppCollectionsRecordsPlan,
} from './cpp-collections-records-plan'
import {
  cppCollectionsRecordsLessons as cppCollectionsRecordsProgressLessons,
  cppCollectionsRecordsManifest,
  cppCollectionsRecordsMissionIds,
} from './cpp-collections-records-manifest'
import { projectManifests } from './project-manifests'
import { tracks } from './curriculum'
import { parseAppRoute } from '../lib/routes'

const expectedModuleIds = [
  'cpp-records-return-values',
  'cpp-records-vectors',
  'cpp-records-structs',
  'cpp-records-updates',
  'cpp-records-summaries',
  'cpp-records-workshop-report',
]

const expectedLessonTypeSequences = [
  ['prediction', 'choice', 'prediction', 'bugfix', 'code'],
  ['prediction', 'choice', 'prediction', 'bugfix', 'code'],
  ['prediction', 'choice', 'prediction', 'bugfix', 'code'],
  ['prediction', 'choice', 'prediction', 'bugfix', 'code'],
  ['prediction', 'choice', 'ordering', 'bugfix', 'code'],
  ['prediction', 'choice', 'ordering', 'bugfix', 'code'],
]

const phasePlanDocument = readFileSync(
  new URL('../../docs/PHASE_5B_PLAN.md', import.meta.url),
  'utf8',
)

describe('Phase 5B Practical C++ course plan', () => {
  it('reserves one complete six-module and thirty-lesson curriculum', () => {
    expect(cppCollectionsRecordsPlan.status).toBe('unpublished')
    expect(cppCollectionsRecordsPlan.id).toBe('cpp-collections-records')
    expect(cppCollectionsRecordsPlan.language).toBe('cpp')
    expect(cppCollectionsRecordsPlan.modules.map((module) => module.id)).toEqual(expectedModuleIds)
    expect(cppCollectionsRecordsPlan.modules).toHaveLength(6)
    expect(cppCollectionsRecordsLessons).toHaveLength(30)
    expect(new Set(cppCollectionsRecordsLessons.map((lesson) => lesson.id)).size).toBe(30)
  })

  it('keeps the compact progress manifest identical to the unpublished plan', () => {
    expect(cppCollectionsRecordsMissionIds).toEqual(expectedModuleIds)
    expect(Object.keys(cppCollectionsRecordsManifest)).toEqual(expectedModuleIds)
    expect(cppCollectionsRecordsProgressLessons).toEqual(
      cppCollectionsRecordsLessons.map((currentLesson) => ({
        conceptId: currentLesson.conceptId,
        id: currentLesson.id,
        missionId: currentLesson.moduleId,
        xp: currentLesson.xp,
      })),
    )
  })

  it('keeps every planned identifier separate from published courses and projects', () => {
    const publishedIds = new Set([
      ...courseDefinitions.flatMap((course) => [
        course.id,
        course.slug,
        ...course.missionIds,
        ...course.lessonIds,
      ]),
      ...projectManifests.flatMap((project) => [
        project.id,
        ...project.checkpoints.map((checkpoint) => checkpoint.id),
      ]),
    ])
    const plannedIds = [
      cppCollectionsRecordsPlan.id,
      ...expectedModuleIds,
      ...cppCollectionsRecordsLessons.map((lesson) => lesson.id),
    ]

    expect(new Set(plannedIds).size).toBe(plannedIds.length)
    for (const id of plannedIds) expect(publishedIds.has(id), id).toBe(false)
  })

  it('requires both completed C++ prerequisites in the publication contract', () => {
    expect(cppCollectionsRecordsPlan.prerequisites).toEqual([
      { kind: 'course', id: 'cpp-foundations', label: 'Complete C++ Foundations' },
      {
        kind: 'project',
        id: 'first-compiled-program',
        label: 'Complete Your First Compiled Program',
        path: '/projects/cpp/first-compiled-program',
      },
    ])
  })

  it('uses the beginner-first exercise rhythm and exact XP budget', () => {
    cppCollectionsRecordsPlan.modules.forEach((module, index) => {
      expect(module.lessons.map((currentLesson) => currentLesson.type), module.id)
        .toEqual(expectedLessonTypeSequences[index])
      expect(module.lessons.reduce((total, currentLesson) => total + currentLesson.xp, 0), module.id)
        .toBe(70)
      expect(module.lessons[0].retrieves.length, `${module.id} must begin with retrieval`).toBeGreaterThan(0)
    })

    expect(cppCollectionsRecordsLessons.reduce((total, currentLesson) => total + currentLesson.xp, 0))
      .toBe(420)
  })

  it('plans exactly twelve runner-backed edits and keeps them aligned with editable lesson types', () => {
    const runnerBacked = cppCollectionsRecordsLessons.filter((currentLesson) => currentLesson.runnerBacked)
    expect(runnerBacked).toHaveLength(12)
    for (const currentLesson of cppCollectionsRecordsLessons) {
      expect(currentLesson.runnerBacked, currentLesson.id)
        .toBe(currentLesson.type === 'bugfix' || currentLesson.type === 'code')
    }
  })

  it('keeps the incomplete course outside every public route and registry', () => {
    expect(courseDefinitionForSlug(cppCollectionsRecordsPlan.slug)).toBeUndefined()
    expect(courseDefinitions.some((course) => String(course.id) === cppCollectionsRecordsPlan.id)).toBe(false)
    expect(parseAppRoute('/courses/cpp-collections-records').page).toBe('not-found')
    expect(parseAppRoute(
      '/learn/cpp-collections-records/cpp-records-return-values/cpprecords1-retrieve-call',
    ).page).toBe('not-found')
    expect(cppCollectionsRecordsPlan.publicationBlockers).toHaveLength(10)
    expect(cppCollectionsRecordsPlan.publicationPolicy).toContain('outside the public registry')
  })

  it('records a bounded capstone and deliberately excludes premature C++ complexity', () => {
    expect(cppCollectionsRecordsPlan.finalAssessment.behavior).toHaveLength(4)
    expect(cppCollectionsRecordsPlan.finalAssessment.protectedStructure).toHaveLength(6)
    expect(cppCollectionsRecordsPlan.finalAssessment.analyzer).toContain('server-owned pinned Clang AST')
    expect(cppCollectionsRecordsPlan.intentionalExclusions).toEqual(expect.arrayContaining([
      'raw pointers',
      'manual memory allocation',
      'new and delete',
      'iterators',
      'file access',
      'build systems',
      'network access',
      'object-oriented design',
    ]))
  })

  it('provides a reviewable objective and concept trail for every lesson', () => {
    for (const currentLesson of cppCollectionsRecordsLessons) {
      expect(currentLesson.title.length, `${currentLesson.id} needs a title`).toBeGreaterThan(8)
      expect(currentLesson.objective.length, `${currentLesson.id} needs an objective`).toBeGreaterThan(40)
      expect(currentLesson.conceptId, `${currentLesson.id} needs a concept`).toMatch(/^cpp-/u)
      expect(currentLesson.retrieves.length + currentLesson.introduces.length, currentLesson.id)
        .toBeGreaterThan(0)
    }
  })

  it('retrieves only concepts owned by a prerequisite or an earlier planned lesson', () => {
    const availableConcepts = new Set([
      ...tracks.flatMap((track) => track.missions.flatMap((mission) => (
        mission.exercises.map((exercise) => exercise.conceptId)
      ))),
      ...projectManifests.flatMap((project) => (
        project.checkpoints.map((checkpoint) => checkpoint.conceptId)
      )),
    ])

    for (const currentLesson of cppCollectionsRecordsLessons) {
      for (const conceptId of currentLesson.retrieves) {
        expect(availableConcepts.has(conceptId), `${currentLesson.id} retrieves unknown ${conceptId}`).toBe(true)
      }
      availableConcepts.add(currentLesson.conceptId)
    }
  })

  it('keeps the durable implementation plan aligned with the reviewed phase document', () => {
    expect(phasePlanDocument).toContain(`Course ID | \`${cppCollectionsRecordsPlan.id}\``)
    expect(phasePlanDocument).toContain(`Canonical course route | \`${cppCollectionsRecordsPlan.route}\``)
    expect(phasePlanDocument).toContain('exactly 30 authored lessons')
    expect(phasePlanDocument).toContain('420 possible first-completion XP')
    expect(phasePlanDocument).toContain('Total units: 17')

    for (const module of cppCollectionsRecordsPlan.modules) {
      expect(phasePlanDocument, `Phase plan is missing module ${module.id}`).toContain(module.id)
      for (const currentLesson of module.lessons) {
        expect(phasePlanDocument, `Phase plan is missing lesson ${currentLesson.id}`).toContain(currentLesson.id)
        expect(phasePlanDocument, `Phase plan is missing concept ${currentLesson.conceptId}`)
          .toContain(currentLesson.conceptId)
      }
    }
  })
})
