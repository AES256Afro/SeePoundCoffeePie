import { describe, expect, it } from 'vitest'
import { tracks } from '../data/curriculum'
import { initialProgress } from './progress'
import {
  buildCourseCards,
  buildCourseModel,
  buildCourseModels,
  courseBySlug,
  coursePath,
  courseSlugFor,
  languageForCourseSlug,
} from './course-model'

describe('course presentation model', () => {
  it('presents the four tracks as beginner foundation course cards', () => {
    const cards = buildCourseCards(initialProgress())

    expect(cards.map((card) => ({
      id: card.id,
      slug: card.slug,
      title: card.title,
      symbol: card.symbol,
    }))).toEqual([
      { id: 'python', slug: 'python-foundations', title: 'Python Foundations', symbol: 'pi' },
      { id: 'cpp', slug: 'cpp-foundations', title: 'C++ Foundations', symbol: 'eye' },
      { id: 'csharp', slug: 'csharp-foundations', title: 'C# Foundations', symbol: 'hash' },
      { id: 'java', slug: 'java-foundations', title: 'Java Foundations', symbol: 'coffee' },
    ])

    for (const card of cards) {
      expect(card.level).toBe('Beginner')
      expect(card.moduleCount).toBe(6)
      expect(card.lessonCount).toBe(30)
      expect(card.completedModuleCount).toBe(0)
      expect(card.completedLessonCount).toBe(0)
      expect(card.progressPercent).toBe(0)
      expect(card.actionLabel).toBe('Start course')
      expect('modules' in card).toBe(false)
    }
  })

  it('maps every mission to one display module without changing curriculum IDs', () => {
    const progress = initialProgress()

    for (const track of tracks) {
      const course = buildCourseModel(track, progress)
      expect(course.modules).toHaveLength(6)
      expect(course.modules.map((module) => module.id)).toEqual(
        track.missions.map((mission) => mission.id),
      )
      expect(course.modules.flatMap((module) => module.lessons.map((lesson) => lesson.id))).toEqual(
        track.missions.flatMap((mission) => mission.exercises.map((exercise) => exercise.id)),
      )
      expect(course.modules.every((module) => module.lessonCount === 5)).toBe(true)
      expect(course.modules.at(-1)?.kind).toBe('guided-project')
      expect(course.modules.slice(0, -1).every((module) => module.kind === 'lessons')).toBe(true)
    }
  })

  it('uses plain module labels while retaining the authored mission title', () => {
    const python = buildCourseModel(tracks[0], initialProgress())
    const java = buildCourseModel(tracks[3], initialProgress('java'))

    expect(python.modules.map((module) => module.title)).toEqual([
      'Reading code and variables',
      'Decisions',
      'Collections',
      'Loops',
      'Functions',
      'Guided project',
    ])
    expect(python.modules[0]).toMatchObject({
      id: 'py-first-spark',
      sourceTitle: 'First Spark',
    })
    expect(java.modules[4]).toMatchObject({
      id: 'java-droid-routine',
      title: 'Methods',
      sourceTitle: 'Droid Routine',
    })
  })

  it('derives lesson progress and the next lesson only from completed mission IDs', () => {
    const progress = {
      ...initialProgress('java'),
      completedMissions: ['java-coffee-protocol', 'java-routing-orders'],
    }
    const java = buildCourseModel(tracks[3], progress)

    expect(java).toMatchObject({
      completedModuleCount: 2,
      completedLessonCount: 10,
      lessonCount: 30,
      progressPercent: 33,
      status: 'in-progress',
      currentModuleId: 'java-crew-array',
      currentModuleTitle: 'Collections',
      currentLessonId: 'java3-retrieve-route',
      actionLabel: 'Continue course',
    })
    expect(java.modules[0]).toMatchObject({
      completed: true,
      completedLessonCount: 5,
      progressPercent: 100,
      current: false,
      availability: 'available',
    })
    expect(java.modules[2]).toMatchObject({
      completed: false,
      completedLessonCount: 0,
      progressPercent: 0,
      current: true,
      availability: 'available',
    })
    expect(java.modules[3]).toMatchObject({
      completed: false,
      current: false,
      availability: 'locked',
    })
    expect(java.modules[2].lessons[0]).toMatchObject({
      id: 'java3-retrieve-route',
      current: true,
      completed: false,
    })
  })

  it('does not mistake concept review records for completed lessons', () => {
    const progress = {
      ...initialProgress(),
      conceptProgress: {
        'python-variables': {
          strength: 2,
          correct: 3,
          incorrect: 1,
          dueAt: '2026-08-26',
        },
      },
    }
    const python = buildCourseModel(tracks[0], progress)

    expect(python.status).toBe('in-progress')
    expect(python.completedLessonCount).toBe(0)
    expect(python.progressPercent).toBe(0)
    expect(python.currentLessonId).toBe('py-console')
    expect(python.actionLabel).toBe('Continue course')
  })

  it('can identify an active in-session lesson without persisting invented progress', () => {
    const progress = {
      ...initialProgress(),
      completedMissions: ['py-first-spark'],
    }
    const python = buildCourseModel(tracks[0], progress, 'py2-order-route')

    expect(python.currentModuleId).toBe('py-signal-protocol')
    expect(python.currentLessonId).toBe('py2-order-route')
    expect(python.modules[1].currentLessonId).toBe('py2-order-route')
    expect(python.modules[1].lessons.find((lesson) => lesson.current)?.id).toBe('py2-order-route')
    expect(python.completedLessonCount).toBe(5)
  })

  it('ignores an active exercise in a locked module', () => {
    const python = buildCourseModel(tracks[0], initialProgress(), 'py4-order-loop')

    expect(python.currentModuleId).toBe('py-first-spark')
    expect(python.currentLessonId).toBe('py-console')
    expect(python.modules[3].availability).toBe('locked')
    expect(python.modules[3].lessons.every((lesson) => !lesson.current)).toBe(true)
  })

  it('finishes a course without counting completed missions from other tracks', () => {
    const pythonMissionIds = tracks[0].missions.map((mission) => mission.id)
    const progress = {
      ...initialProgress(),
      completedMissions: [...pythonMissionIds, 'java-coffee-protocol'],
    }
    const [python, cpp] = buildCourseModels(progress)

    expect(python).toMatchObject({
      completedModuleCount: 6,
      completedLessonCount: 30,
      progressPercent: 100,
      status: 'complete',
      currentModuleId: null,
      currentLessonId: null,
      actionLabel: 'Review course',
    })
    expect(cpp).toMatchObject({
      completedModuleCount: 0,
      completedLessonCount: 0,
      progressPercent: 0,
      status: 'not-started',
    })
  })

  it('resolves course slugs and reports the active course', () => {
    const progress = initialProgress('csharp')

    expect(courseBySlug('csharp-foundations', progress)).toMatchObject({
      id: 'csharp',
      title: 'C# Foundations',
      active: true,
    })
    expect(courseBySlug('not-a-course', progress)).toBeUndefined()
    expect(courseSlugFor('csharp')).toBe('csharp-foundations')
    expect(coursePath('csharp')).toBe('/courses/csharp-foundations')
    expect(languageForCourseSlug('csharp-foundations')).toBe('csharp')
    expect(languageForCourseSlug('not-a-course')).toBeUndefined()
    expect(buildCourseCards(progress).filter((course) => course.active).map((course) => course.id)).toEqual(['csharp'])
  })
})
