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
import {
  publishedContinuingCourseContentRequest,
  publishedContinuingCourseLoaders,
} from './published-continuing-course-loaders'
import { publishedContinuingCourseManifests } from './published-continuing-course-manifests'
import { projectManifests } from './project-manifests'
import { tracks } from './curriculum'
import { parseAppRoute } from '../lib/routes'
import { findRunnerAssignment } from '../lib/runner-assignments'
import {
  unpublishedCppCoursePath,
  unpublishedCppLessonIds,
  unpublishedCppLessonPath,
  unpublishedCppLessonPrefix,
} from '../../scripts/unpublished-cpp-release-boundary.mjs'

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
const publicSitemap = readFileSync(
  new URL('../../public/sitemap.xml', import.meta.url),
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

  it('keeps every hidden C++ course, module, and lesson identifier outside public surfaces', () => {
    const hiddenModules = Object.entries(cppCollectionsRecordsManifest)
    const hiddenModuleIds = hiddenModules.map(([moduleId]) => moduleId)
    const hiddenLessonIds = hiddenModules.flatMap(([, lessons]) => (
      lessons.map((lesson) => lesson.id)
    ))
    const hiddenIds = [cppCollectionsRecordsPlan.id, ...hiddenModuleIds, ...hiddenLessonIds]
    const publicIds = new Set([
      ...courseDefinitions.flatMap((course) => [
        course.id,
        course.slug,
        ...course.missionIds,
        ...course.lessonIds,
      ]),
      ...publishedContinuingCourseManifests.flatMap((manifest) => [
        manifest.courseId,
        ...manifest.modules.flatMap((module) => [module.id, ...module.lessonIds]),
      ]),
      ...publishedContinuingCourseLoaders.map((loader) => loader.courseId),
      ...tracks.flatMap((track) => track.missions.flatMap((mission) => [
        mission.id,
        ...mission.exercises.map((exercise) => exercise.id),
      ])),
      ...projectManifests.flatMap((project) => [
        project.id,
        ...project.checkpoints.map((checkpoint) => checkpoint.id),
      ]),
    ])

    expect(hiddenModuleIds).toHaveLength(6)
    expect(hiddenLessonIds).toHaveLength(30)
    expect(unpublishedCppCoursePath).toBe(`/courses/${cppCollectionsRecordsPlan.id}`)
    expect(unpublishedCppLessonPrefix).toBe(`/learn/${cppCollectionsRecordsPlan.id}/`)
    expect(unpublishedCppLessonPath).toBe(
      `/learn/${cppCollectionsRecordsPlan.id}/${hiddenModuleIds[0]}/${hiddenLessonIds[0]}`,
    )
    expect(unpublishedCppLessonIds).toEqual(hiddenLessonIds)
    expect(hiddenIds).toHaveLength(37)
    expect(new Set(hiddenIds).size).toBe(hiddenIds.length)

    for (const id of hiddenIds) {
      expect(publicIds.has(id), `${id} must not enter a public registry`).toBe(false)
      expect(courseDefinitionForSlug(id), `${id} must not resolve as a public course`).toBeUndefined()
      expect(
        publishedContinuingCourseContentRequest(id),
        `${id} must not resolve through a public course loader`,
      ).toBeUndefined()
      expect(findRunnerAssignment(id), `${id} must not receive a runner assignment`).toBeUndefined()
      expect(parseAppRoute(`/courses/${id}`).page, `${id} must not resolve as a course route`)
        .toBe('not-found')
      expect(publicSitemap, `${id} must not enter the public sitemap`).not.toContain(id)
    }

    for (const [moduleId, lessons] of hiddenModules) {
      for (const lesson of lessons) {
        expect(parseAppRoute(
          `/learn/${cppCollectionsRecordsPlan.id}/${moduleId}/${lesson.id}`,
        ).page, `${lesson.id} must not resolve through its guessed continuing-course route`)
          .toBe('not-found')
        expect(parseAppRoute(
          `/learn/cpp-foundations/${moduleId}/${lesson.id}`,
        ).page, `${lesson.id} must not resolve through the published C++ course`)
          .toBe('not-found')
      }
    }

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
