import { describe, expect, it } from 'vitest'
import type { CourseId } from '../types'
import {
  academyPath,
  codebookPath,
  createAppRouteParser,
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
    expect(coursePath('python-data-tools')).toBe('/courses/python-data-tools')
    expect(lessonPath('python', 'py-first-spark', 'py-print')).toBe(
      '/learn/python-foundations/py-first-spark/py-print',
    )
    expect(lessonPath('python-data-tools', 'py-data-return-values', 'pydata1-return-purpose')).toBe(
      '/learn/python-data-tools/py-data-return-values/pydata1-return-purpose',
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
    expect(parseAppRoute('/courses/java-foundations')).toMatchObject({
      page: 'course', language: 'java', courseId: 'java-foundations',
    })
    expect(parseAppRoute('/courses/python-data-tools')).toMatchObject({
      page: 'course', language: 'python', courseId: 'python-data-tools',
    })
    expect(parseAppRoute('/learn/csharp-foundations/cs-shield/cs-output')).toEqual({
      page: 'lesson',
      language: 'csharp',
      courseId: 'csharp-foundations',
      missionId: 'cs-shield',
      exerciseId: 'cs-output',
      practice: false,
      conceptIds: [],
    })
    expect(parseAppRoute('/learn/python-data-tools/py-data-return-values/pydata1-return-purpose')).toEqual({
      page: 'lesson',
      language: 'python',
      courseId: 'python-data-tools',
      missionId: 'py-data-return-values',
      exerciseId: 'pydata1-return-purpose',
      practice: false,
      conceptIds: [],
    })
    expect(parseAppRoute('/learn/python-foundations/py-data-return-values/pydata1-return-purpose').page).toBe('not-found')
    expect(parseAppRoute('/learn/python-data-tools/py-first-spark/py-console').page).toBe('not-found')
    expect(parseAppRoute(
      '/learn/python-data-tools/py-data-return-values/pydata1-return-purpose',
      '?preview=true',
    ).page).toBe('not-found')
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

  it('rejects duplicate and trailing slashes instead of treating them as canonical URLs', () => {
    const nonCanonicalPaths = [
      '/home/',
      '/courses/',
      '/courses//python-foundations',
      '/courses/python-foundations/',
      '/learn//python-foundations/py-first-spark/py-print',
      '/learn/python-foundations//py-first-spark/py-print',
      '/learn/python-foundations/py-first-spark//py-print',
      '/learn/python-foundations/py-first-spark/py-print/',
    ]

    for (const pathname of nonCanonicalPaths) {
      expect(parseAppRoute(pathname).page, pathname).toBe('not-found')
    }
  })
})

describe('published Practical C++ route ownership', () => {
  it('resolves the exact canonical course and lesson', () => {
    expect(parseAppRoute('/courses/cpp-collections-records')).toEqual({
      page: 'course',
      language: 'cpp',
      courseId: 'cpp-collections-records',
      conceptIds: [],
    })
    expect(parseAppRoute(
      '/learn/cpp-collections-records/cpp-records-return-values/cpprecords1-retrieve-call',
    )).toEqual({
      page: 'lesson',
      language: 'cpp',
      courseId: 'cpp-collections-records',
      missionId: 'cpp-records-return-values',
      exerciseId: 'cpprecords1-retrieve-call',
      practice: false,
      conceptIds: [],
    })
  })

  it('rejects a real lesson under the wrong module and a made-up lesson', () => {
    expect(parseAppRoute(
      '/learn/cpp-collections-records/cpp-records-vectors/cpprecords1-retrieve-call',
    ).page).toBe('not-found')
    expect(parseAppRoute(
      '/learn/cpp-collections-records/cpp-records-return-values/cpprecords1-made-up',
    ).page).toBe('not-found')
  })
})

describe('injected canonical course route ownership', () => {
  const candidateCourseId = 'reviewed-test-course' as CourseId
  const candidateSlug = 'reviewed-test-course'
  const candidateMissionId = 'cpp-records'
  const candidateLessonId = 'cpp-records-create'
  const parseCandidateRoute = createAppRouteParser({
    courseDefinitionForSlug: (slug) => slug === candidateSlug
      ? { id: candidateCourseId, language: 'cpp' }
      : undefined,
    courseMissionOwnsLesson: (courseId, missionId, lessonId) => (
      courseId === candidateCourseId
      && missionId === candidateMissionId
      && lessonId === candidateLessonId
    ),
  })

  it('resolves a candidate continuing course only through explicitly injected ownership', () => {
    expect(parseCandidateRoute(`/courses/${candidateSlug}`)).toEqual({
      page: 'course',
      language: 'cpp',
      courseId: candidateCourseId,
      conceptIds: [],
    })
    expect(parseCandidateRoute(
      `/learn/${candidateSlug}/${candidateMissionId}/${candidateLessonId}`,
    )).toEqual({
      page: 'lesson',
      language: 'cpp',
      courseId: candidateCourseId,
      missionId: candidateMissionId,
      exerciseId: candidateLessonId,
      practice: false,
      conceptIds: [],
    })

    expect(parseAppRoute(`/courses/${candidateSlug}`).page).toBe('not-found')
    expect(parseAppRoute(
      `/learn/${candidateSlug}/${candidateMissionId}/${candidateLessonId}`,
    ).page).toBe('not-found')
  })

  it('fails closed when candidate lesson ownership does not match exactly', () => {
    expect(parseCandidateRoute(
      `/learn/${candidateSlug}/other-mission/${candidateLessonId}`,
    ).page).toBe('not-found')
    expect(parseCandidateRoute(
      `/learn/${candidateSlug}/${candidateMissionId}/other-lesson`,
    ).page).toBe('not-found')
    expect(parseCandidateRoute('/courses/unknown-course').page).toBe('not-found')
    expect(parseCandidateRoute('/learn/unknown-course/unknown-mission/unknown-lesson').page).toBe('not-found')
  })

  it('rejects extra segments, malformed escapes, encoded separators, and NUL bytes', () => {
    const unsafePaths = [
      `/courses//${candidateSlug}`,
      `/courses/${candidateSlug}/`,
      `/learn/${candidateSlug}//${candidateMissionId}/${candidateLessonId}`,
      `/learn/${candidateSlug}/${candidateMissionId}/${candidateLessonId}/`,
      `/courses/${candidateSlug}/extra`,
      `/learn/${candidateSlug}/${candidateMissionId}/${candidateLessonId}/extra`,
      '/courses/cpp-collections-%ZZ',
      `/learn/${candidateSlug}/cpp-records-%ZZ/${candidateLessonId}`,
      `/learn/${candidateSlug}/${candidateMissionId}/cpp-records-%ZZ`,
      '/courses/cpp-collections%2Frecords',
      `/learn/${candidateSlug}/cpp%2Frecords/${candidateLessonId}`,
      `/learn/${candidateSlug}/${candidateMissionId}/cpp-records%2Fcreate`,
      `/courses/${candidateSlug}%00`,
      `/learn/${candidateSlug}/${candidateMissionId}%00/${candidateLessonId}`,
      `/learn/${candidateSlug}/${candidateMissionId}/${candidateLessonId}%00`,
    ]

    for (const pathname of unsafePaths) {
      expect(parseCandidateRoute(pathname).page, pathname).toBe('not-found')
    }
  })

  it('rejects query-bearing canonical candidate lesson URLs', () => {
    expect(parseCandidateRoute(
      `/learn/${candidateSlug}/${candidateMissionId}/${candidateLessonId}`,
      '?preview=true',
    ).page).toBe('not-found')
  })
})
