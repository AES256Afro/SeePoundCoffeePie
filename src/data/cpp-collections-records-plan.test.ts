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
  privateCourseIsPublished,
  privateCourseReleaseCatalog,
  privateCourseReleaseState,
  practicalCppPrivateJavaScriptMarkers,
  practicalCppPublicJavaScriptMarkers,
  practicalCppRunnerBackedLessonIds,
  practicalCppTeachingOnlyLessonIds,
  unpublishedCppCourseId,
  unpublishedCppCoursePath,
  unpublishedCppJavaScriptMarkers,
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
  it('publishes only the exact reviewed private course release record', () => {
    expect(privateCourseReleaseCatalog).toHaveLength(1)
    expect(privateCourseReleaseCatalog[0]).toMatchObject({
      id: cppCollectionsRecordsPlan.id,
      state: 'published',
    })
    expect(unpublishedCppCourseId).toBe(cppCollectionsRecordsPlan.id)
    expect(privateCourseReleaseState(unpublishedCppCourseId)).toBe('published')
    expect(privateCourseReleaseState('unknown-private-course')).toBe('unavailable')
    expect(privateCourseIsPublished(unpublishedCppCourseId)).toBe(true)
    expect(privateCourseIsPublished('unknown-private-course')).toBe(false)
    expect(Object.isFrozen(privateCourseReleaseCatalog)).toBe(true)
    expect(Object.isFrozen(privateCourseReleaseCatalog[0])).toBe(true)
  })

  it('publishes one complete six-module and thirty-lesson curriculum', () => {
    expect(cppCollectionsRecordsPlan.status).toBe('published')
    expect(cppCollectionsRecordsPlan.id).toBe('cpp-collections-records')
    expect(cppCollectionsRecordsPlan.language).toBe('cpp')
    expect(cppCollectionsRecordsPlan.modules.map((module) => module.id)).toEqual(expectedModuleIds)
    expect(cppCollectionsRecordsPlan.modules).toHaveLength(6)
    expect(cppCollectionsRecordsLessons).toHaveLength(30)
    expect(new Set(cppCollectionsRecordsLessons.map((lesson) => lesson.id)).size).toBe(30)
  })

  it('keeps the compact progress manifest identical to the published plan', () => {
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
    const teachingOnly = cppCollectionsRecordsLessons.filter((currentLesson) => !currentLesson.runnerBacked)
    expect(runnerBacked).toHaveLength(12)
    expect(teachingOnly).toHaveLength(18)
    expect(practicalCppRunnerBackedLessonIds).toEqual(runnerBacked.map((lesson) => lesson.id))
    expect(practicalCppTeachingOnlyLessonIds).toEqual(teachingOnly.map((lesson) => lesson.id))
    expect(new Set([
      ...practicalCppRunnerBackedLessonIds,
      ...practicalCppTeachingOnlyLessonIds,
    ])).toEqual(new Set(unpublishedCppLessonIds))
    for (const currentLesson of cppCollectionsRecordsLessons) {
      expect(currentLesson.runnerBacked, currentLesson.id)
        .toBe(currentLesson.type === 'bugfix' || currentLesson.type === 'code')
    }
    for (const currentLesson of runnerBacked) {
      expect(findRunnerAssignment(currentLesson.id), currentLesson.id).toMatchObject({
        exerciseId: currentLesson.id,
        language: 'cpp',
      })
    }
    for (const currentLesson of teachingOnly) {
      expect(findRunnerAssignment(currentLesson.id), currentLesson.id).toBeUndefined()
    }
  })

  it('publishes every reviewed C++ course, module, and lesson identifier together', () => {
    const publishedModules = Object.entries(cppCollectionsRecordsManifest)
    const publishedModuleIds = publishedModules.map(([moduleId]) => moduleId)
    const publishedLessonIds = publishedModules.flatMap(([, lessons]) => (
      lessons.map((lesson) => lesson.id)
    ))
    const publishedIds = [cppCollectionsRecordsPlan.id, ...publishedModuleIds, ...publishedLessonIds]
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

    expect(publishedModuleIds).toHaveLength(6)
    expect(publishedLessonIds).toHaveLength(30)
    expect(unpublishedCppCoursePath).toBe(`/courses/${cppCollectionsRecordsPlan.id}`)
    expect(unpublishedCppLessonPrefix).toBe(`/learn/${cppCollectionsRecordsPlan.id}/`)
    expect(unpublishedCppLessonPath).toBe(
      `/learn/${cppCollectionsRecordsPlan.id}/${publishedModuleIds[0]}/${publishedLessonIds[0]}`,
    )
    expect(unpublishedCppLessonIds).toEqual(publishedLessonIds)
    expect(privateCourseReleaseCatalog[0]?.coursePath).toBe(unpublishedCppCoursePath)
    expect(privateCourseReleaseCatalog[0]?.lessonPrefix).toBe(unpublishedCppLessonPrefix)
    expect(privateCourseReleaseCatalog[0]?.lessonPath).toBe(unpublishedCppLessonPath)
    expect(privateCourseReleaseCatalog[0]?.lessonIds).toBe(unpublishedCppLessonIds)
    expect(privateCourseReleaseCatalog[0]?.runnerBackedLessonIds)
      .toBe(practicalCppRunnerBackedLessonIds)
    expect(privateCourseReleaseCatalog[0]?.teachingOnlyLessonIds)
      .toBe(practicalCppTeachingOnlyLessonIds)
    expect(privateCourseReleaseCatalog[0]?.browserMarkers).toBe(unpublishedCppJavaScriptMarkers)
    expect(privateCourseReleaseCatalog[0]?.publicBrowserMarkers)
      .toBe(practicalCppPublicJavaScriptMarkers)
    expect(privateCourseReleaseCatalog[0]?.privateBrowserMarkers)
      .toBe(practicalCppPrivateJavaScriptMarkers)
    expect(practicalCppPublicJavaScriptMarkers).toHaveLength(7)
    expect(practicalCppPrivateJavaScriptMarkers).toHaveLength(4)
    expect(publishedIds).toHaveLength(37)
    expect(new Set(publishedIds).size).toBe(publishedIds.length)

    for (const id of publishedIds) {
      expect(publicIds.has(id), `${id} must enter a public registry`).toBe(true)
      expect(publicSitemap, `${id} enters only the emitted sitemap`).not.toContain(id)
    }

    expect(courseDefinitionForSlug(cppCollectionsRecordsPlan.slug)?.id)
      .toBe(cppCollectionsRecordsPlan.id)
    expect(publishedContinuingCourseContentRequest(cppCollectionsRecordsPlan.id))
      .toBeDefined()
    expect(parseAppRoute(unpublishedCppCoursePath)).toMatchObject({
      page: 'course',
      courseId: cppCollectionsRecordsPlan.id,
    })

    for (const [moduleId, lessons] of publishedModules) {
      for (const lesson of lessons) {
        expect(parseAppRoute(
          `/learn/${cppCollectionsRecordsPlan.id}/${moduleId}/${lesson.id}`,
        ), `${lesson.id} must resolve through its canonical continuing-course route`).toMatchObject({
          page: 'lesson',
          courseId: cppCollectionsRecordsPlan.id,
          missionId: moduleId,
          exerciseId: lesson.id,
        })
        expect(parseAppRoute(
          `/learn/cpp-foundations/${moduleId}/${lesson.id}`,
        ).page, `${lesson.id} must not resolve through the wrong C++ course`)
          .toBe('not-found')
      }
    }

    expect(cppCollectionsRecordsPlan.publicationBlockers).toHaveLength(10)
    expect(cppCollectionsRecordsPlan.publicationPolicy).toContain('Publish this course only')
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
