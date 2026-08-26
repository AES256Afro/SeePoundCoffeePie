import { describe, expect, it } from 'vitest'
import { durableCurriculumV1 } from './durable-curriculum-v1'
import {
  courseDefinitions,
  courseIsAvailable,
  courseIsComplete,
  foundationCourseId,
  missingCoursePrerequisites,
} from './course-registry'
import { initialProgress } from '../lib/progress'

describe('course registry', () => {
  it('owns five unique courses and allows two distinct Python courses', () => {
    expect(courseDefinitions).toHaveLength(5)
    expect(new Set(courseDefinitions.map((course) => course.id)).size).toBe(5)
    expect(new Set(courseDefinitions.map((course) => course.slug)).size).toBe(5)
    expect(courseDefinitions.filter((course) => course.language === 'python').map((course) => course.id)).toEqual([
      'python-foundations',
      'python-data-tools',
    ])
    expect(foundationCourseId('python')).toBe('python-foundations')
  })

  it('keeps every durable foundation mission and lesson under its original owner', () => {
    const registered = new Map<string, readonly string[]>(courseDefinitions.flatMap((course) => (
      course.missionIds.map((missionId) => [
        `${course.language}/${missionId}`,
        course.lessonIds,
      ] as const)
    )))
    for (const [owner, lessons] of Object.entries(durableCurriculumV1)) {
      const course = courseDefinitions.find((candidate) => (
        candidate.language === owner.split('/')[0]
        && candidate.missionIds.includes(owner.split('/')[1])
      ))
      expect(course?.lessonIds).toEqual(expect.arrayContaining([...lessons]))
      expect(registered.has(owner)).toBe(true)
    }
  })

  it('requires both Python Foundations and the interactive project', () => {
    const foundation = courseDefinitions.find((course) => course.id === 'python-foundations')
    if (!foundation) throw new Error('Python Foundations is missing.')
    const empty = initialProgress('python')
    const courseOnly = { ...empty, completedMissions: [...foundation.missionIds] }
    const projectOnly = { ...empty, completedProjects: ['first-interactive-program'] }
    const both = { ...courseOnly, completedProjects: ['first-interactive-program'] }

    expect(missingCoursePrerequisites('python-data-tools', empty)).toHaveLength(2)
    expect(courseIsAvailable('python-data-tools', courseOnly)).toBe(false)
    expect(courseIsAvailable('python-data-tools', projectOnly)).toBe(false)
    expect(courseIsAvailable('python-data-tools', both)).toBe(true)
    expect(courseIsComplete('python-foundations', courseOnly)).toBe(true)
    expect(courseIsComplete('python-data-tools', courseOnly)).toBe(false)
  })

  it('declares six modules and thirty lessons for every current course', () => {
    for (const course of courseDefinitions) {
      expect(course.missionIds).toHaveLength(6)
      expect(course.lessonIds).toHaveLength(30)
      expect(course.moduleTitles).toHaveLength(6)
      expect(course.moduleKinds).toHaveLength(6)
    }
  })
})
