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
  portfolioPath,
  practiceMissionPath,
  practicePath,
  practiceSessionPath,
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
    expect(practiceSessionPath('python')).toBe('/practice/python/session')
    expect(practiceSessionPath('python', 3)).toBe('/practice/python/session/3')
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
    expect(projectPath('cpp', 'first-compiled-program', 'project-cpp-final')).toBe(
      '/projects/cpp/first-compiled-program/project-cpp-final',
    )
    expect(projectPath('csharp', 'workshop-check-in', 'project-csharp-final')).toBe(
      '/projects/csharp/workshop-check-in/project-csharp-final',
    )
    expect(projectPath('java', 'picnic-planner', 'project-java-final')).toBe(
      '/projects/java/picnic-planner/project-java-final',
    )
    expect(portfolioPath('python', 'first-interactive-program')).toBe(
      '/portfolio/python/first-interactive-program',
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

  it('parses the private adaptive session route without putting concepts in the URL', () => {
    expect(parseAppRoute('/practice/java/session')).toEqual({
      page: 'practice-session',
      language: 'java',
      practice: true,
      practiceStep: 1,
      conceptIds: [],
    })
    expect(parseAppRoute('/practice/java/session/4')).toEqual({
      page: 'practice-session',
      language: 'java',
      practice: true,
      practiceStep: 4,
      conceptIds: [],
    })
  })

  it('rejects malformed session steps and unsafe legacy practice queries', () => {
    expect(parseAppRoute('/practice/java/session/1').page).toBe('not-found')
    expect(parseAppRoute('/practice/java/session/6').page).toBe('not-found')
    expect(parseAppRoute('/practice/java/session', '?concepts=java-runtime').page).toBe('not-found')
    expect(parseAppRoute(
      '/practice/java/missions/java-routing-orders',
      '?concepts=java-booleans,java-booleans',
    ).page).toBe('not-found')
    expect(parseAppRoute(
      '/practice/java/missions/java-routing-orders',
      '?concepts=one,two,three,four,five,six',
    ).page).toBe('not-found')
    expect(parseAppRoute(
      '/practice/java/missions/java-routing-orders',
      '?concepts=java-booleans&extra=true',
    ).page).toBe('not-found')
    expect(parseAppRoute(
      '/practice/java/missions/java-routing-orders',
      '?concepts=java-booleans&concepts=java-if',
    ).page).toBe('not-found')
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

  it('parses the C++ project and checkpoint deep links', () => {
    expect(parseAppRoute('/projects/cpp/first-compiled-program')).toEqual({
      page: 'project',
      language: 'cpp',
      projectId: 'first-compiled-program',
      checkpointId: undefined,
      conceptIds: [],
    })
    expect(parseAppRoute('/projects/cpp/first-compiled-program/project-cpp-final')).toEqual({
      page: 'project',
      language: 'cpp',
      projectId: 'first-compiled-program',
      checkpointId: 'project-cpp-final',
      conceptIds: [],
    })
  })

  it('parses the C# project and checkpoint deep links', () => {
    expect(parseAppRoute('/projects/csharp/workshop-check-in')).toEqual({
      page: 'project',
      language: 'csharp',
      projectId: 'workshop-check-in',
      checkpointId: undefined,
      conceptIds: [],
    })
    expect(parseAppRoute('/projects/csharp/workshop-check-in/project-csharp-final')).toEqual({
      page: 'project',
      language: 'csharp',
      projectId: 'workshop-check-in',
      checkpointId: 'project-csharp-final',
      conceptIds: [],
    })
  })

  it('parses the Java project and checkpoint deep links', () => {
    expect(parseAppRoute('/projects/java/picnic-planner')).toEqual({
      page: 'project',
      language: 'java',
      projectId: 'picnic-planner',
      checkpointId: undefined,
      conceptIds: [],
    })
    expect(parseAppRoute('/projects/java/picnic-planner/project-java-final')).toEqual({
      page: 'project',
      language: 'java',
      projectId: 'picnic-planner',
      checkpointId: 'project-java-final',
      conceptIds: [],
    })
  })

  it('parses only clean, allowlisted portfolio preview routes', () => {
    expect(parseAppRoute('/portfolio/python/first-interactive-program')).toEqual({
      page: 'portfolio',
      language: 'python',
      projectId: 'first-interactive-program',
      conceptIds: [],
    })
    expect(parseAppRoute('/portfolio/cpp/first-compiled-program')).toMatchObject({
      page: 'portfolio',
      language: 'cpp',
      projectId: 'first-compiled-program',
    })

    expect(parseAppRoute('/portfolio/python/first-compiled-program').page).toBe('not-found')
    expect(parseAppRoute('/portfolio/ruby/first-interactive-program').page).toBe('not-found')
    expect(parseAppRoute('/portfolio/python/not-a-project').page).toBe('not-found')
    expect(parseAppRoute('/portfolio/python/first-interactive-program/extra').page).toBe('not-found')
    expect(parseAppRoute('/portfolio/python/first-interactive-program', '?callsign=Chris').page).toBe('not-found')
    expect(parseAppRoute('/portfolio/python/first%2Finteractive-program').page).toBe('not-found')
    expect(parseAppRoute('/portfolio/python/first-interactive-program%00').page).toBe('not-found')
    expect(parseAppRoute('/portfolio/python/first-interactive-program%ZZ').page).toBe('not-found')
    expect(parseAppRoute(`/portfolio/python/${'a'.repeat(500)}`).page).toBe('not-found')
  })

  it('rejects misspelled languages and unknown paths', () => {
    expect(parseAppRoute('/academy/ruby').page).toBe('not-found')
    expect(parseAppRoute('/projects/java/first-interactive-program').page).toBe('not-found')
    expect(parseAppRoute('/projects/python/first-compiled-program').page).toBe('not-found')
    expect(parseAppRoute('/projects/cpp/first-interactive-program').page).toBe('not-found')
    expect(parseAppRoute('/projects/python/not-a-project').page).toBe('not-found')
    expect(parseAppRoute('/projects/python/first-interactive-program/checkpoint/extra').page).toBe('not-found')
    expect(parseAppRoute('/anything-else').page).toBe('not-found')
  })
})
