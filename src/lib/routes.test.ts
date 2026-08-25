import { describe, expect, it } from 'vitest'
import {
  academyPath,
  codebookPath,
  coursePath,
  coursesPath,
  homePath,
  lessonPath,
  missionPath,
  parseAppRoute,
  practiceMissionPath,
  practicePath,
  projectPath,
} from './routes'

describe('bookmarkable application routes', () => {
  it('builds stable clean URLs for every learner area', () => {
    expect(academyPath('cpp')).toBe('/academy/cpp')
    expect(homePath()).toBe('/home')
    expect(coursesPath()).toBe('/courses')
    expect(coursePath('cpp')).toBe('/courses/cpp-foundations')
    expect(lessonPath('python', 'py-first-spark', 'py-print')).toBe(
      '/learn/python-foundations/py-first-spark/py-print',
    )
    expect(practicePath('csharp')).toBe('/practice/csharp')
    expect(codebookPath('java')).toBe('/codebook/java')
    expect(missionPath('python', 'py-first-spark')).toBe('/academy/python/missions/py-first-spark')
    expect(practiceMissionPath('java', 'java-routing-orders', ['java-booleans'])).toBe(
      '/practice/java/missions/java-routing-orders?concepts=java-booleans',
    )
    expect(projectPath('python', 'first-interactive-program')).toBe(
      '/projects/python/first-interactive-program',
    )
    expect(projectPath('python', 'first-interactive-program', 'read-the-plan')).toBe(
      '/projects/python/first-interactive-program/read-the-plan',
    )
  })

  it('keeps the public home page separate from cadet intake', () => {
    expect(parseAppRoute('/').page).toBe('landing')
    expect(parseAppRoute('/home').page).toBe('home')
    expect(parseAppRoute('/start').page).toBe('start')
  })

  it('parses course catalog, course outline, and individual lesson URLs', () => {
    expect(parseAppRoute('/courses')).toEqual({ page: 'courses', conceptIds: [] })
    expect(parseAppRoute('/courses/java-foundations')).toMatchObject({ page: 'course', language: 'java' })
    expect(parseAppRoute('/learn/csharp-foundations/cs-shield/cs-output')).toEqual({
      page: 'lesson',
      language: 'csharp',
      missionId: 'cs-shield',
      exerciseId: 'cs-output',
      practice: false,
      conceptIds: [],
    })
  })

  it('parses academy pages and focused practice lessons', () => {
    expect(parseAppRoute('/academy/cpp')).toMatchObject({ page: 'academy', language: 'cpp' })
    expect(parseAppRoute('/practice/java/missions/java-routing-orders', '?concepts=java-booleans,java-if')).toEqual({
      page: 'lesson',
      language: 'java',
      missionId: 'java-routing-orders',
      practice: true,
      conceptIds: ['java-booleans', 'java-if'],
    })
  })

  it('parses the Python project and checkpoint deep links', () => {
    expect(parseAppRoute('/projects/python/first-interactive-program')).toEqual({
      page: 'project',
      language: 'python',
      projectId: 'first-interactive-program',
      checkpointId: undefined,
      conceptIds: [],
    })
    expect(parseAppRoute('/projects/python/first-interactive-program/read%20the%20plan')).toEqual({
      page: 'project',
      language: 'python',
      projectId: 'first-interactive-program',
      checkpointId: 'read the plan',
      conceptIds: [],
    })
  })

  it('rejects misspelled languages and unknown paths', () => {
    expect(parseAppRoute('/academy/ruby').page).toBe('not-found')
    expect(parseAppRoute('/projects/java/first-interactive-program').page).toBe('not-found')
    expect(parseAppRoute('/projects/python/not-a-project').page).toBe('not-found')
    expect(parseAppRoute('/projects/python/first-interactive-program/checkpoint/extra').page).toBe('not-found')
    expect(parseAppRoute('/anything-else').page).toBe('not-found')
  })
})
