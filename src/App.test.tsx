// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { cppCompiledProject } from './data/cpp-compiled-project'
import { trackById } from './data/curriculum'
import * as foundationCourseLoader from './data/foundation-course-loaders'
import * as practicePublicationLoader from './data/practice-publication'
import { pythonInteractiveProject } from './data/python-interactive-project'
import { saveProjectDraft } from './lib/project-drafts'
import { dateKey, initialProgress } from './lib/progress'
import { serializeProgressBackup } from './lib/progress-backup'
import { runExercise } from './lib/runner-client'

vi.mock('./lib/runner-client', () => ({
  runExercise: vi.fn(async () => ({
    version: 1,
    runId: 'run_12345678901234567890',
    outcome: 'completed',
    stdout: 'Signal online\n',
    stderr: '',
    exitCode: 0,
    durationMs: 18,
    truncated: false,
    limit: null,
    tests: [
      { name: 'Visible console check', visibility: 'visible', passed: true, message: 'The output matched.' },
      { name: 'Finish without a language error', visibility: 'hidden', passed: true, message: 'The program finished.' },
    ],
    diagnostic: { title: 'Program finished', explanation: 'The program ran.', suggestion: 'Continue.', line: null },
  })),
}))

const progressKey = 'see-pound-coffee-pie-progress'
const progressV2Key = 'see-pound-coffee-pie-progress-v2'
const progressV3Key = 'see-pound-coffee-pie-progress-v3'
const pythonMissionIds = trackById('python').missions.map((mission) => mission.id)
const cppMissionIds = trackById('cpp').missions.map((mission) => mission.id)
const practicalPythonTitle = 'Practical Python: Data Tools'
const practicalPythonFirstMissionId = 'py-data-return-values'
const practicalPythonFirstLessonId = 'pydata1-retrieve-call'
const practicalPythonFirstLessonTitle = 'Trace a familiar function call'
const practicalPythonCoursePath = '/courses/python-data-tools'
const practicalPythonFirstLessonPath = `/learn/python-data-tools/${practicalPythonFirstMissionId}/${practicalPythonFirstLessonId}`
const practicalPythonPrerequisiteLabels = [
  'Complete Python Foundations',
  'Complete Your First Interactive Program',
] as const
const practicalCppTitle = 'Practical C++: Collections and Records'
const practicalCppCoursePath = '/courses/cpp-collections-records'
const practicalCppFirstLessonPath = '/learn/cpp-collections-records/cpp-records-return-values/cpprecords1-retrieve-call'
const practicalCppPrerequisiteLabels = [
  'Complete C++ Foundations',
  'Complete Your First Compiled Program',
] as const

const phase5aTestLiterals = [
  practicalPythonTitle,
  practicalPythonFirstMissionId,
  practicalPythonFirstLessonId,
  practicalPythonFirstLessonTitle,
  practicalPythonCoursePath,
  practicalPythonFirstLessonPath,
  ...practicalPythonPrerequisiteLabels,
]

function createMemoryStorage(): Storage {
  const values = new Map<string, string>()

  return {
    get length() {
      return values.size
    },
    clear() {
      values.clear()
    },
    getItem(key) {
      return values.get(key) ?? null
    },
    key(index) {
      return [...values.keys()][index] ?? null
    },
    removeItem(key) {
      values.delete(key)
    },
    setItem(key, value) {
      values.set(key, String(value))
    },
  }
}

function storeTestProgress(progress: ReturnType<typeof initialProgress>): void {
  const serialized = JSON.stringify(progress)
  window.localStorage.setItem(progressKey, serialized)
  window.localStorage.setItem(progressV2Key, serialized)
  window.localStorage.setItem(progressV3Key, serialized)
}

describe('beginner lesson interactions', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/academy/python')
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: createMemoryStorage(),
    })
    Object.defineProperty(window, 'scrollTo', {
      configurable: true,
      value: vi.fn(),
    })
    window.localStorage.clear()
    window.sessionStorage.clear()
    window.localStorage.setItem(progressKey, JSON.stringify({
      ...initialProgress('python'),
      callsign: 'Test Cadet',
      onboardingComplete: true,
    }))
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ authenticated: false, user: null })))
  })

  afterEach(() => {
    cleanup()
    window.history.replaceState({}, '', '/')
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  async function openFirstEditableStep() {
    render(<App />)
    fireEvent.click(await screen.findByRole('link', { name: /Meet the console/iu }))
    fireEvent.click(await screen.findByRole('radio', { name: /Shows text from the program/iu }))
    fireEvent.click(screen.getByRole('button', { name: 'Check answer' }))
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    return screen.getByRole('textbox', { name: 'Code editor' })
  }

  it('bypasses an old cached redirect when checking the current session', async () => {
    const fetchMock = vi.mocked(fetch)

    render(<App />)

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/auth/session', {
        cache: 'no-store',
        credentials: 'same-origin',
        headers: { Accept: 'application/json' },
      })
    })
  })

  it('persists a passed lesson, resumes at the next lesson, and does not award replay XP', async () => {
    await openFirstEditableStep()
    await waitFor(() => {
      const stored = JSON.parse(window.localStorage.getItem(progressKey) ?? '{}')
      expect(stored.completedLessons).toEqual(['py-console'])
      expect(stored.xp).toBe(8)
    })

    fireEvent.click(screen.getByRole('button', { name: 'Exit lesson' }))
    expect(await screen.findByRole('heading', { name: 'Python Foundations' })).toBeTruthy()
    cleanup()

    window.history.replaceState({}, '', '/courses/python-foundations')
    render(<App />)
    expect(await screen.findByText('1 of 5 lessons complete')).toBeTruthy()
    expect(screen.getByText('1 of 30 lessons complete')).toBeTruthy()
    expect(screen.getByText('3% of course')).toBeTruthy()
    const nextLesson = screen.getByRole('link', { name: /Print your first message.*Next lesson/iu })
    expect(nextLesson.getAttribute('aria-current')).toBe('step')
    expect(nextLesson.getAttribute('href')).toBe('/learn/python-foundations/py-first-spark/py-print')

    const completedLesson = screen.getByRole('link', { name: /Meet the console.*Complete/iu })
    fireEvent.click(completedLesson)
    fireEvent.click(await screen.findByRole('radio', { name: /Shows text from the program/iu }))
    fireEvent.click(screen.getByRole('button', { name: 'Check answer' }))

    await waitFor(() => {
      const stored = JSON.parse(window.localStorage.getItem(progressKey) ?? '{}')
      expect(stored.completedLessons).toEqual(['py-console'])
      expect(stored.xp).toBe(8)
      expect(stored.conceptProgress['python-console'].correct).toBe(2)
    })
  })

  it('runs an editor check with Ctrl+Enter and announces the result', async () => {
    const editor = await openFirstEditableStep()
    fireEvent.change(editor, {
      target: { value: '# Show a message\nprint("Signal online")' },
    })
    fireEvent.keyDown(editor, { key: 'Enter', ctrlKey: true })

    expect(await screen.findByText('Correct')).toBeTruthy()
    expect(screen.getByText('Signal online', { selector: 'pre' })).toBeTruthy()
    const runResults = screen.getByLabelText('Run results')
    expect(runResults.textContent).not.toMatch(/Checked in \d+ ms/iu)
    expect(runResults.textContent).not.toContain('fresh sandbox destroyed after run')
    expect(screen.getAllByRole('status').filter((status) => status.textContent?.trim())).toHaveLength(1)
    expect(editor.getAttribute('aria-keyshortcuts')).toBe('Control+Enter Meta+Enter')
    expect(screen.getByRole('button', { name: 'Exit lesson' })).toBeTruthy()
  })

  it('keeps Tab available for normal keyboard navigation', async () => {
    const editor = await openFirstEditableStep()
    const tabWasNotCancelled = fireEvent.keyDown(editor, { key: 'Tab' })

    expect(tabWasNotCancelled).toBe(true)
    expect(editor.getAttribute('wrap')).toBe('off')
    expect(editor.getAttribute('autocapitalize')).toBe('off')
    expect(editor.getAttribute('autocorrect')).toBe('off')
    expect(screen.getByLabelText('Code editor keyboard controls').textContent).toContain('Tab moves out of the editor normally')
  })

  it('uses plain teaching labels in the editable lesson workspace', async () => {
    await openFirstEditableStep()

    expect(screen.getByText('Task', { selector: 'small' })).toBeTruthy()
    expect(screen.getByText('Change this', { selector: 'small' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'What the code means' })).toBeTruthy()
    expect(screen.getByText('Output')).toBeTruthy()
    expect(screen.queryByText(/SHIPBOARD VERSION/iu)).toBeNull()
    expect(screen.queryByText(/LIVE ISOLATED RUNNER/iu)).toBeNull()
    expect(screen.queryByText(/REAL CONSOLE OUTPUT/iu)).toBeNull()
    expect(screen.queryByText(/fresh sandbox destroyed/iu)).toBeNull()
  })

  it('ignores a runner response after routing to another exercise', async () => {
    type RunResult = Awaited<ReturnType<typeof runExercise>>
    let finishRun!: (result: RunResult) => void
    let runSignal: AbortSignal | undefined
    const delayedRun = new Promise<RunResult>((resolve) => {
      finishRun = resolve
    })
    vi.mocked(runExercise).mockImplementationOnce((_exerciseId, _language, _source, onStatus, options) => {
      runSignal = options?.signal
      onStatus?.('running')
      return delayedRun
    })
    const editor = await openFirstEditableStep()
    fireEvent.change(editor, {
      target: { value: '# Show a message\nprint("Signal online")' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Check my code' }))
    fireEvent.click(screen.getByRole('button', { name: 'Back' }))

    expect(await screen.findByRole('heading', { name: 'Meet the console' })).toBeTruthy()
    expect(runSignal?.aborted).toBe(true)
    await act(async () => {
      finishRun({
        version: 1,
        runId: 'run_stale_response_1234567890',
        outcome: 'completed',
        stdout: 'Signal online\n',
        stderr: '',
        exitCode: 0,
        durationMs: 18,
        truncated: false,
        limit: null,
        tests: [
          { name: 'Visible console check', visibility: 'visible', passed: true, message: 'The output matched.' },
          { name: 'Finish without a language error', visibility: 'hidden', passed: true, message: 'The program finished.' },
        ],
        diagnostic: { title: 'Program finished', explanation: 'The program ran.', suggestion: 'Continue.', line: null },
      })
      await delayedRun
    })

    const firstAnswer = screen.getByRole('radio', { name: /Shows text from the program/iu }) as HTMLInputElement
    const firstCheck = screen.getByRole('button', { name: 'Check answer' }) as HTMLButtonElement
    expect(screen.queryByText('Correct')).toBeNull()
    expect(screen.queryByLabelText('Run results')).toBeNull()
    expect(firstAnswer.disabled).toBe(false)
    expect(firstCheck.disabled).toBe(false)
  })

  it('ignores a runner response after using Back inside legacy practice', async () => {
    type RunResult = Awaited<ReturnType<typeof runExercise>>
    let finishRun!: (result: RunResult) => void
    let runSignal: AbortSignal | undefined
    const delayedRun = new Promise<RunResult>((resolve) => {
      finishRun = resolve
    })
    vi.mocked(runExercise).mockImplementationOnce((_exerciseId, _language, _source, onStatus, options) => {
      runSignal = options?.signal
      onStatus?.('running')
      return delayedRun
    })
    window.localStorage.setItem(progressKey, JSON.stringify({
      ...initialProgress('python'),
      callsign: 'Legacy Practice Cadet',
      onboardingComplete: true,
      xp: 120,
      dailyXp: 20,
      dailyXpDate: dateKey(new Date()),
      starShards: 25,
      completedMissions: ['py-first-spark'],
    }))
    window.history.replaceState(
      {},
      '',
      '/practice/python/missions/py-first-spark?concepts=python-console,python-print',
    )

    render(<App />)
    fireEvent.click(await screen.findByRole('radio', { name: /Shows text from the program/iu }))
    fireEvent.click(screen.getByRole('button', { name: 'Check answer' }))
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

    const editor = await screen.findByRole('textbox', { name: 'Code editor' })
    await waitFor(() => {
      const stored = JSON.parse(window.localStorage.getItem(progressKey) ?? '{}')
      expect(stored.conceptProgress['python-console']).toMatchObject({ correct: 1, incorrect: 0 })
    })
    const progressBeforeRun = JSON.parse(window.localStorage.getItem(progressKey) ?? '{}')
    fireEvent.change(editor, {
      target: { value: '# Show a message\nprint("Signal online")' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Check my code' }))
    fireEvent.click(screen.getByRole('button', { name: 'Back' }))

    expect(await screen.findByRole('heading', { name: 'Meet the console' })).toBeTruthy()
    expect(runSignal?.aborted).toBe(true)
    await act(async () => {
      finishRun({
        version: 1,
        runId: 'run_stale_legacy_practice_1234567890',
        outcome: 'completed',
        stdout: 'Signal online\n',
        stderr: '',
        exitCode: 0,
        durationMs: 18,
        truncated: false,
        limit: null,
        tests: [
          { name: 'Visible console check', visibility: 'visible', passed: true, message: 'The output matched.' },
          { name: 'Finish without a language error', visibility: 'hidden', passed: true, message: 'The program finished.' },
        ],
        diagnostic: { title: 'Program finished', explanation: 'The program ran.', suggestion: 'Continue.', line: null },
      })
      await delayedRun
    })

    const progressAfterRun = JSON.parse(window.localStorage.getItem(progressKey) ?? '{}')
    expect(progressAfterRun).toEqual(progressBeforeRun)
    expect(progressAfterRun.xp).toBe(120)
    expect(progressAfterRun.dailyXp).toBe(20)
    expect(progressAfterRun.starShards).toBe(25)
    expect(progressAfterRun.conceptProgress['python-print']).toBeUndefined()
    expect(screen.queryByText('Correct')).toBeNull()
    expect(screen.queryByLabelText('Run results')).toBeNull()
    expect(screen.getByRole('button', { name: 'Check answer' })).toBeTruthy()
  })

  it('ignores a runner response after exiting the lesson', async () => {
    type RunResult = Awaited<ReturnType<typeof runExercise>>
    let finishRun!: (result: RunResult) => void
    let runSignal: AbortSignal | undefined
    const delayedRun = new Promise<RunResult>((resolve) => {
      finishRun = resolve
    })
    vi.mocked(runExercise).mockImplementationOnce((_exerciseId, _language, _source, onStatus, options) => {
      runSignal = options?.signal
      onStatus?.('running')
      return delayedRun
    })
    const editor = await openFirstEditableStep()
    await waitFor(() => {
      const stored = JSON.parse(window.localStorage.getItem(progressKey) ?? '{}')
      expect(stored.xp).toBe(8)
      expect(stored.conceptProgress['python-print']).toBeUndefined()
    })
    const progressBeforeExit = JSON.parse(window.localStorage.getItem(progressKey) ?? '{}')
    fireEvent.change(editor, {
      target: { value: '# Show a message\nprint("Signal online")' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Check my code' }))
    fireEvent.click(screen.getByRole('button', { name: 'Exit lesson' }))

    expect(await screen.findByRole('heading', { name: 'Python Foundations' })).toBeTruthy()
    expect(runSignal?.aborted).toBe(true)
    await act(async () => {
      finishRun({
        version: 1,
        runId: 'run_after_exit_123456789012',
        outcome: 'completed',
        stdout: 'Signal online\n',
        stderr: '',
        exitCode: 0,
        durationMs: 18,
        truncated: false,
        limit: null,
        tests: [
          { name: 'Visible console check', visibility: 'visible', passed: true, message: 'The output matched.' },
          { name: 'Finish without a language error', visibility: 'hidden', passed: true, message: 'The program finished.' },
        ],
        diagnostic: { title: 'Program finished', explanation: 'The program ran.', suggestion: 'Continue.', line: null },
      })
      await delayedRun
    })

    const progressAfterExit = JSON.parse(window.localStorage.getItem(progressKey) ?? '{}')
    expect(progressAfterExit).toEqual(progressBeforeExit)
    expect(screen.getByRole('heading', { name: 'Python Foundations' })).toBeTruthy()
    expect(screen.queryByText('Correct')).toBeNull()
    expect(screen.queryByLabelText('Run results')).toBeNull()
  })

  it('repairs a missed adaptive answer without awarding XP, shards, or completion', async () => {
    const routingMission = trackById('java').missions[1]
    const routingConcepts = [...new Set(routingMission.exercises.map((exercise) => exercise.conceptId))]
    const conceptProgress = Object.fromEntries(routingConcepts.map((id) => [id, {
      strength: 4,
      correct: 1,
      incorrect: 0,
      dueAt: '2026-09-30',
    }]))
    conceptProgress['java-booleans'] = {
      strength: 1,
      correct: 1,
      incorrect: 1,
      dueAt: dateKey(new Date()),
    }
    window.localStorage.setItem(progressKey, JSON.stringify({
      ...initialProgress('java'),
      callsign: 'Test Cadet',
      onboardingComplete: true,
      xp: 80,
      dailyXp: 20,
      dailyXpDate: dateKey(new Date()),
      starShards: 25,
      completedMissions: ['java-routing-orders'],
      conceptProgress,
    }))
    window.history.replaceState({}, '', '/academy/java')

    render(<App />)
    fireEvent.click(screen.getByRole('link', { name: 'Practice' }))

    const reviewLink = await screen.findByRole('link', { name: 'Start 2-question review' })
    expect(reviewLink.getAttribute('href')).toBe('/practice/java/session')
    expect(screen.getByRole('heading', { name: 'Questions' })).toBeTruthy()
    const reviewPlan = screen.getByRole('list', { name: 'Practice questions' })
    expect(within(reviewPlan).getAllByRole('listitem')).toHaveLength(2)
    expect(screen.getByText(/does not change course completion or rewards/iu)).toBeTruthy()
    const practiceExplainer = screen.getByText('How Practice chooses questions').closest('details')
    expect(practiceExplainer?.open).toBe(false)
    fireEvent.click(reviewLink)

    expect(await screen.findByRole('heading', { name: 'Meet a true-or-false value' })).toBeTruthy()
    expect(screen.getByText('Practice, question 1 of 2')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Exit practice' })).toBeTruthy()

    fireEvent.click(screen.getByRole('radio', { name: /up and downThose can/iu }))
    fireEvent.click(screen.getByRole('button', { name: 'Check answer' }))
    expect(screen.getByText('Try again')).toBeTruthy()
    fireEvent.click(screen.getByRole('radio', { name: /true and falseJava writes/iu }))
    fireEvent.click(screen.getByRole('button', { name: 'Check answer' }))
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

    expect(await screen.findByRole('heading', { name: 'Predict what the code displays' })).toBeTruthy()
    fireEvent.click(screen.getByRole('radio', { name: /Pods: 12Java joins/iu }))
    fireEvent.click(screen.getByRole('button', { name: 'Check answer' }))
    fireEvent.click(screen.getByRole('button', { name: 'Review missed questions' }))

    expect(await screen.findByRole('heading', { name: 'Meet a true-or-false value' })).toBeTruthy()
    expect(screen.getByText('Try again, question 1 of 1')).toBeTruthy()
    fireEvent.click(screen.getByRole('radio', { name: /true and falseJava writes/iu }))
    fireEvent.click(screen.getByRole('button', { name: 'Check answer' }))
    fireEvent.click(screen.getByRole('button', { name: 'Finish review' }))

    expect(screen.getByText('Practice complete')).toBeTruthy()
    expect(screen.getByText('ideas reviewed')).toBeTruthy()
    expect(screen.queryByText('XP earned')).toBeNull()
    expect(screen.queryByText('star shards')).toBeNull()
    await waitFor(() => {
      const stored = JSON.parse(window.localStorage.getItem(progressKey) ?? '{}')
      expect(stored.starShards).toBe(25)
      expect(stored.xp).toBe(80)
      expect(stored.dailyXp).toBe(20)
      expect(stored.completedMissions).toEqual(['java-routing-orders'])
      expect(stored.conceptProgress['java-booleans']).toMatchObject({
        strength: 2,
        correct: 3,
        incorrect: 2,
      })
    })
    const durableRecord = window.localStorage.getItem(progressKey) ?? ''
    expect(durableRecord).not.toContain('up and down')
    expect(durableRecord).not.toContain('true and false')
    expect(durableRecord).not.toContain('Pods: 12')
  })

  it('clears practice feedback when browser history revisits routed questions', async () => {
    const routingMission = trackById('java').missions[1]
    const routingConcepts = [...new Set(routingMission.exercises.map((exercise) => exercise.conceptId))]
    const conceptProgress = Object.fromEntries(routingConcepts.map((id) => [id, {
      strength: 4,
      correct: 1,
      incorrect: 0,
      dueAt: '2026-09-30',
    }]))
    conceptProgress['java-booleans'] = {
      strength: 1,
      correct: 1,
      incorrect: 1,
      dueAt: dateKey(new Date()),
    }
    window.localStorage.setItem(progressKey, JSON.stringify({
      ...initialProgress('java'),
      callsign: 'History Cadet',
      onboardingComplete: true,
      completedMissions: ['java-routing-orders'],
      conceptProgress,
    }))
    window.history.replaceState({}, '', '/practice/java')

    render(<App />)
    fireEvent.click(await screen.findByRole('link', { name: 'Start 2-question review' }))
    fireEvent.click(await screen.findByRole('radio', { name: /true and falseJava writes/iu }))
    fireEvent.click(screen.getByRole('button', { name: 'Check answer' }))
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

    expect(await screen.findByRole('heading', { name: 'Predict what the code displays' })).toBeTruthy()
    const wrongAnswer = screen.getByRole('radio', { name: /Pods: podCountWithout quotes/iu }) as HTMLInputElement
    fireEvent.click(wrongAnswer)
    fireEvent.click(screen.getByRole('button', { name: 'I need a hint' }))
    fireEvent.click(screen.getByRole('button', { name: 'Check answer' }))
    expect(screen.getByText('Try again')).toBeTruthy()
    expect(wrongAnswer.checked).toBe(true)

    window.history.back()

    expect(await screen.findByRole('heading', { name: 'Meet a true-or-false value' })).toBeTruthy()
    await waitFor(() => expect(screen.queryByText('Try again')).toBeNull())
    const firstAnswer = screen.getByRole('radio', { name: /true and falseJava writes/iu }) as HTMLInputElement
    const firstCheck = screen.getByRole('button', { name: 'Check answer' }) as HTMLButtonElement
    expect(firstAnswer.checked).toBe(true)
    expect(firstAnswer.disabled).toBe(false)
    expect(firstCheck.disabled).toBe(false)
    expect(screen.queryByText('Hint')).toBeNull()

    window.history.forward()

    expect(await screen.findByRole('heading', { name: 'Predict what the code displays' })).toBeTruthy()
    await waitFor(() => expect(screen.queryByText('Try again')).toBeNull())
    const restoredWrongAnswer = screen.getByRole('radio', { name: /Pods: podCountWithout quotes/iu }) as HTMLInputElement
    const secondCheck = screen.getByRole('button', { name: 'Check answer' }) as HTMLButtonElement
    expect(restoredWrongAnswer.checked).toBe(true)
    expect(restoredWrongAnswer.disabled).toBe(false)
    expect(secondCheck.disabled).toBe(false)
    expect(screen.queryByText('Hint')).toBeNull()
  })

  it('requires every selected question before a direct final practice step can finish', async () => {
    const routingMission = trackById('java').missions[1]
    const routingConcepts = [...new Set(routingMission.exercises.map((exercise) => exercise.conceptId))]
    const conceptProgress = Object.fromEntries(routingConcepts.map((id) => [id, {
      strength: 4,
      correct: 1,
      incorrect: 0,
      dueAt: '2026-09-30',
    }]))
    conceptProgress['java-booleans'] = {
      strength: 1,
      correct: 1,
      incorrect: 1,
      dueAt: dateKey(new Date()),
    }
    window.localStorage.setItem(progressKey, JSON.stringify({
      ...initialProgress('java'),
      callsign: 'Direct Step Cadet',
      onboardingComplete: true,
      completedMissions: ['java-routing-orders'],
      conceptProgress,
    }))
    window.history.replaceState({}, '', '/practice/java/session/2')

    const firstRender = render(<App />)
    expect(await screen.findByRole('heading', { name: 'Predict what the code displays' })).toBeTruthy()
    firstRender.unmount()

    render(<App />)
    fireEvent.click(await screen.findByRole('radio', { name: /Pods: 12Java joins/iu }))
    fireEvent.click(screen.getByRole('button', { name: 'Check answer' }))
    expect(screen.queryByText('Practice complete')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

    expect(window.location.pathname).toBe('/practice/java/session')
    expect(await screen.findByRole('heading', { name: 'Meet a true-or-false value' })).toBeTruthy()
    fireEvent.click(screen.getByRole('radio', { name: /up and downThose can describe/iu }))
    fireEvent.click(screen.getByRole('button', { name: 'Check answer' }))
    expect(screen.getByText('Try again')).toBeTruthy()
    fireEvent.click(screen.getByRole('radio', { name: /true and falseJava writes/iu }))
    fireEvent.click(screen.getByRole('button', { name: 'Check answer' }))
    fireEvent.click(screen.getByRole('button', { name: 'Review missed questions' }))

    expect(screen.getByText('Try again, question 1 of 1')).toBeTruthy()
    const repairedAnswer = screen.getByRole('radio', { name: /true and falseJava writes/iu }) as HTMLInputElement
    expect(repairedAnswer.checked).toBe(false)
    fireEvent.click(repairedAnswer)
    fireEvent.click(screen.getByRole('button', { name: 'Check answer' }))
    fireEvent.click(screen.getByRole('button', { name: 'Finish review' }))

    expect(screen.getByText('Practice complete')).toBeTruthy()
    expect(screen.getByText('questions completed').previousSibling?.textContent).toBe('2')
  })

  it('requires every first-time lesson before repair or module completion from a direct final URL', async () => {
    window.localStorage.setItem(progressKey, JSON.stringify({
      ...initialProgress('python'),
      callsign: 'Direct Lesson Cadet',
      onboardingComplete: true,
    }))
    window.history.replaceState({}, '', '/learn/python-foundations/py-first-spark/py-launch')

    render(<App />)
    const editor = await screen.findByRole('textbox', { name: 'Code editor' })
    fireEvent.click(screen.getByRole('button', { name: 'Check my code' }))
    expect(screen.getByText('Try again')).toBeTruthy()
    fireEvent.change(editor, {
      target: {
        value: 'ship_name = "Wayfarer"\npower_cells = 3\n\nprint("Ship:", ship_name)\nprint("Cells:", power_cells)',
      },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Check my code' }))

    expect(await screen.findByText('Correct')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Complete remaining lessons' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Review missed questions' })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Complete remaining lessons' }))

    expect(await screen.findByRole('heading', { name: 'Meet the console' })).toBeTruthy()
    expect(screen.queryByText(/Try again, question/iu)).toBeNull()
    expect(screen.queryByText('Module complete')).toBeNull()
    await waitFor(() => {
      const stored = JSON.parse(window.localStorage.getItem(progressKey) ?? '{}')
      expect(stored.completedMissions).toEqual([])
      expect(stored.conceptProgress['python-output-and-variables']).toMatchObject({
        correct: 1,
        incorrect: 1,
      })
    })
  })

  it('offers a no-repeat finish action after exiting a fully passed module', async () => {
    const firstMission = trackById('python').missions[0]
    window.localStorage.setItem(progressKey, JSON.stringify({
      ...initialProgress('python'),
      callsign: 'Almost Finished Cadet',
      onboardingComplete: true,
      completedLessons: firstMission.exercises.slice(0, -1).map((exercise) => exercise.id),
    }))
    window.history.replaceState({}, '', '/learn/python-foundations/py-first-spark/py-launch')

    render(<App />)
    const editor = await screen.findByRole('textbox', { name: 'Code editor' })
    fireEvent.change(editor, {
      target: { value: 'ship_name = "Wayfarer"\npower_cells = 3\n\nprint("Ship:", ship_name)\nprint("Cells:", power_cells)' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Check my code' }))
    expect(await screen.findByText('Correct')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Exit lesson' }))

    expect(await screen.findByRole('heading', { name: 'Python Foundations' })).toBeTruthy()
    await waitFor(() => {
      const stored = JSON.parse(window.localStorage.getItem(progressKey) ?? '{}')
      expect(stored.completedLessons).toEqual(firstMission.exercises.map((exercise) => exercise.id))
      expect(stored.completedMissions).toEqual([])
      expect(stored.starShards).toBe(0)
    })
    expect(screen.getByText('5 of 5 lessons complete')).toBeTruthy()
    expect(screen.getByText('Every lesson is complete.')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /Finish module/iu }))

    await waitFor(() => {
      const stored = JSON.parse(window.localStorage.getItem(progressKey) ?? '{}')
      expect(stored.completedMissions).toEqual(['py-first-spark'])
      expect(stored.starShards).toBe(25)
    })
    const completionNotice = await screen.findByRole('status')
    expect(completionNotice.textContent).toContain(
      'Module complete. Module 2 is ready.',
    )
    const nextModule = screen.getByRole('button', { name: /Module 2.*Decisions/iu })
    expect(nextModule.getAttribute('aria-expanded')).toBe('true')
    await waitFor(() => expect(document.activeElement).toBe(nextModule))

    act(() => {
      window.history.pushState({}, '', '/courses/java-foundations')
      window.dispatchEvent(new PopStateEvent('popstate'))
    })

    const javaHeading = await screen.findByRole('heading', { name: 'Java Foundations' })
    expect(screen.queryByText('Module complete. Module 2 is ready.')).toBeNull()
    expect(screen.getByRole('button', { name: /Module 1.*Reading code and variables/iu }).getAttribute('aria-expanded')).toBe('true')
    await waitFor(() => expect(document.activeElement).toBe(javaHeading))
  })

  it('updates concept scheduling without awarding replay rewards for a completed module', async () => {
    const progressBeforeReplay = {
      ...initialProgress('python'),
      callsign: 'Replay Cadet',
      onboardingComplete: true,
      xp: 240,
      dailyXp: 30,
      dailyXpDate: dateKey(new Date()),
      starShards: 75,
      completedMissions: ['py-first-spark'],
      conceptProgress: {
        'python-output-and-variables': {
          strength: 2,
          correct: 3,
          incorrect: 1,
          dueAt: dateKey(new Date()),
        },
      },
    }
    window.localStorage.setItem(progressKey, JSON.stringify(progressBeforeReplay))
    window.history.replaceState({}, '', '/learn/python-foundations/py-first-spark/py-launch')

    render(<App />)
    const editor = await screen.findByRole('textbox', { name: 'Code editor' })
    fireEvent.change(editor, {
      target: { value: 'ship_name = "Wayfarer"\npower_cells = 3\n\nprint("Ship:", ship_name)\nprint("Cells:", power_cells)' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Check my code' }))
    expect(await screen.findByText('Correct')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Finish module' }))

    expect(screen.getByText('Module complete')).toBeTruthy()
    expect(screen.getByText('lessons completed').previousSibling?.textContent).toBe('5')
    expect(screen.queryByText('XP earned')).toBeNull()
    expect(screen.queryByText('star shards')).toBeNull()
    await waitFor(() => {
      const stored = JSON.parse(window.localStorage.getItem(progressKey) ?? '{}')
      expect(stored.xp).toBe(progressBeforeReplay.xp)
      expect(stored.dailyXp).toBe(progressBeforeReplay.dailyXp)
      expect(stored.starShards).toBe(progressBeforeReplay.starShards)
      expect(stored.completedMissions).toEqual(progressBeforeReplay.completedMissions)
      expect(stored.conceptProgress['python-output-and-variables']).toMatchObject({
        strength: 3,
        correct: 4,
        incorrect: 1,
      })
    })
  })

  it('links a new learner to the normal first lesson instead of a non-completing practice replay', async () => {
    window.history.replaceState({}, '', '/practice/python')

    render(<App />)

    expect(await screen.findByRole('heading', { name: 'Finish a module to use Practice' })).toBeTruthy()
    expect((await screen.findByRole('link', { name: 'Start your first lesson' })).getAttribute('href')).toBe(
      '/learn/python-foundations/py-first-spark/py-console',
    )
    expect(screen.queryByRole('link', { name: /question review/iu })).toBeNull()
  })

  it('keeps the learner-home review count scoped to the active language', async () => {
    window.localStorage.setItem(progressKey, JSON.stringify({
      ...initialProgress('python'),
      callsign: 'Language Cadet',
      onboardingComplete: true,
      completedMissions: ['java-routing-orders'],
      conceptProgress: {
        'java-booleans': {
          strength: 1,
          correct: 1,
          incorrect: 1,
          dueAt: dateKey(new Date()),
        },
      },
    }))
    window.history.replaceState({}, '', '/home')

    render(<App />)

    expect(await screen.findByRole('heading', { name: 'Nothing to review yet' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Open practice' }).getAttribute('href')).toBe('/practice/python')

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'java' } })

    expect(await screen.findByRole('heading', { name: /ideas? (?:is|are) ready/iu })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Start practice' }).getAttribute('href')).toBe('/practice/java')
  })

  it('counts review concepts from the published continuing-course manifest', async () => {
    const foundation = trackById('python')
    storeTestProgress({
      ...initialProgress('python'),
      callsign: 'Review Cadet',
      onboardingComplete: true,
      completedMissions: [
        ...foundation.missions.map((mission) => mission.id),
        practicalPythonFirstMissionId,
      ],
      completedProjects: ['first-interactive-program'],
      conceptProgress: Object.fromEntries(foundation.missions.flatMap((mission) => (
        mission.exercises.flatMap((exercise) => (
          ['python-parameters-and-calls', 'python-return-values', 'python-returned-calculations']
            .includes(exercise.conceptId)
            ? []
            : [[exercise.conceptId, {
                strength: 4,
                correct: 4,
                incorrect: 0,
                dueAt: '2099-01-01',
              }]]
        ))
      ))),
    })
    window.history.replaceState({}, '', '/home')

    render(<App />)

    expect(await screen.findByRole('heading', { name: '3 ideas are ready' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Start practice' }).getAttribute('href')).toBe('/practice/python')
  })

  it('does not count an orphaned Practical C++ module record as eligible review material', async () => {
    storeTestProgress({
      ...initialProgress('cpp'),
      callsign: 'Compatibility Cadet',
      onboardingComplete: true,
      completedMissions: ['cpp-records-return-values'],
    })
    window.history.replaceState({}, '', '/home')

    render(<App />)

    expect(await screen.findByRole('heading', { name: 'Nothing to review yet' })).toBeTruthy()
    expect(screen.getByText(practicalCppTitle, { selector: 'b' })).toBeTruthy()
  })

  it('restores a frozen practice queue at its bookmarkable step URL after remount', async () => {
    const routingMission = trackById('java').missions[1]
    const routingConcepts = [...new Set(routingMission.exercises.map((exercise) => exercise.conceptId))]
    const conceptProgress = Object.fromEntries(routingConcepts.map((id) => [id, {
      strength: 4,
      correct: 1,
      incorrect: 0,
      dueAt: '2026-09-30',
    }]))
    conceptProgress['java-booleans'] = {
      strength: 1,
      correct: 1,
      incorrect: 1,
      dueAt: dateKey(new Date()),
    }
    window.localStorage.setItem(progressKey, JSON.stringify({
      ...initialProgress('java'),
      callsign: 'Bookmark Cadet',
      onboardingComplete: true,
      completedMissions: ['java-routing-orders'],
      conceptProgress,
    }))
    window.history.replaceState({}, '', '/practice/java')

    const firstRender = render(<App />)
    fireEvent.click(await screen.findByRole('link', { name: 'Start 2-question review' }))
    fireEvent.click(await screen.findByRole('radio', { name: /true and falseJava writes/iu }))
    fireEvent.click(screen.getByRole('button', { name: 'Check answer' }))
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

    expect(window.location.pathname).toBe('/practice/java/session/2')
    expect(await screen.findByRole('heading', { name: 'Predict what the code displays' })).toBeTruthy()
    expect(screen.getByRole('progressbar', { name: 'Practice progress' }).getAttribute('aria-valuetext')).toBe('Question 2 of 2')

    firstRender.unmount()
    render(<App />)

    expect(await screen.findByRole('heading', { name: 'Predict what the code displays' })).toBeTruthy()
    expect(screen.getByText('Practice, question 2 of 2')).toBeTruthy()
  })

  it('does not let a direct or legacy practice route unlock unfinished material', async () => {
    window.history.replaceState({}, '', '/practice/python/session')
    const direct = render(<App />)

    expect(await screen.findByRole('heading', { name: 'Finish a module before starting practice' })).toBeTruthy()
    direct.unmount()

    window.history.replaceState({}, '', '/practice/python/missions/py-first-spark?concepts=python-console')
    render(<App />)

    expect(await screen.findByRole('heading', { name: 'Complete Code and variables before reviewing it' })).toBeTruthy()
  })

  it('rejects unknown and mixed legacy practice concepts instead of broadening the review', async () => {
    window.localStorage.setItem(progressKey, JSON.stringify({
      ...initialProgress('java'),
      callsign: 'Route Cadet',
      onboardingComplete: true,
      completedMissions: ['java-routing-orders'],
    }))

    window.history.replaceState({}, '', '/practice/java/missions/java-routing-orders?concepts=bogus')
    const unknownOnly = render(<App />)
    expect(await screen.findByRole('heading', { name: 'We could not find that page' })).toBeTruthy()
    unknownOnly.unmount()

    window.history.replaceState({}, '', '/practice/java/missions/java-routing-orders?concepts=java-booleans,bogus')
    render(<App />)
    expect(await screen.findByRole('heading', { name: 'We could not find that page' })).toBeTruthy()
  })

  it('restores a validated local progress backup from Settings', async () => {
    const restored = {
      ...initialProgress('csharp'),
      callsign: 'Restored Cadet',
      xp: 140,
      starShards: 50,
      completedMissions: ['cs-shield', 'cs-command-logic'],
      onboardingComplete: true,
    }
    const backup = new File(
      [serializeProgressBackup(restored, new Date('2026-08-24T15:30:00.000Z'))],
      'seepoundcoffeepie-progress.json',
      { type: 'application/json' },
    )
    Object.defineProperty(backup, 'text', {
      configurable: true,
      value: async () => serializeProgressBackup(restored, new Date('2026-08-24T15:30:00.000Z')),
    })
    vi.spyOn(window, 'confirm').mockReturnValue(true)

    render(<App />)
    fireEvent.click(screen.getByRole('link', { name: 'Settings' }))
    fireEvent.change(screen.getByLabelText('Choose progress backup file'), {
      target: { files: [backup] },
    })

    expect(await screen.findByText(/Progress restored from the backup created/iu)).toBeTruthy()
    fireEvent.click(screen.getByRole('link', { name: 'Learner record' }))
    expect(await screen.findByRole('heading', { name: 'Restored Cadet' })).toBeTruthy()
    expect(screen.getAllByText('140').length).toBeGreaterThan(0)
    await waitFor(() => {
      const stored = JSON.parse(window.localStorage.getItem(progressKey) ?? '{}')
      const restoredFields: Partial<typeof restored> = { ...restored }
      delete restoredFields.completedLessons
      const expectedLessonIds = trackById('csharp').missions
        .filter((mission) => restored.completedMissions.includes(mission.id))
        .flatMap((mission) => mission.exercises.map((exercise) => exercise.id))
      expect(stored).toMatchObject(restoredFields)
      expect(new Set(stored.completedLessons)).toEqual(new Set(expectedLessonIds))
    })
  })

  it('clears every frozen practice queue when learning progress is reset', async () => {
    const sessionPrefix = 'see-pound-coffee-pie-practice-session'
    const languages = ['python', 'cpp', 'csharp', 'java'] as const
    languages.forEach((language) => {
      window.sessionStorage.setItem(`${sessionPrefix}:${language}`, JSON.stringify({
        version: 1,
        language,
        exerciseIds: [`${language}-example`],
      }))
    })
    vi.spyOn(window, 'confirm').mockReturnValue(true)

    render(<App />)
    fireEvent.click(screen.getByRole('link', { name: 'Settings' }))
    expect(screen.getByText(/Saved project code and check summaries stay in this browser/iu)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Reset learning progress' }))

    await waitFor(() => expect(window.location.pathname).toBe('/start'))
    expect(screen.getByText('How familiar does programming feel right now?')).toBeTruthy()
    languages.forEach((language) => {
      expect(window.sessionStorage.getItem(`${sessionPrefix}:${language}`)).toBeNull()
    })
    await waitFor(() => {
      expect(JSON.parse(window.localStorage.getItem(progressKey) ?? '{}')).toEqual(initialProgress())
      expect(JSON.parse(
        window.localStorage.getItem('see-pound-coffee-pie-progress-v3-reset') ?? '{}',
      )).toEqual({ version: 1, active: true })
    })
  })

  it('shows independent foundation and continuing-course records without erasing other progress', async () => {
    window.localStorage.setItem(progressKey, JSON.stringify({
      ...initialProgress('python'),
      callsign: 'Route Cadet',
      completedMissions: [...pythonMissionIds, practicalPythonFirstMissionId, 'java-coffee-protocol'],
      onboardingComplete: true,
    }))

    render(<App />)
    fireEvent.click(screen.getByRole('link', { name: 'Learner record' }))

    expect(screen.getByRole('heading', { name: 'Courses' })).toBeTruthy()
    expect(screen.getByText('6 courses. Later-course progress is tracked separately from beginner courses.')).toBeTruthy()
    expect(await screen.findByLabelText('Python Foundations 100% complete')).toBeTruthy()
    expect(await screen.findByLabelText(`${practicalPythonTitle} 17% complete`)).toBeTruthy()
    expect(await screen.findByLabelText('Java Foundations 17% complete')).toBeTruthy()
    const practicalRecord = screen.getByText(practicalPythonTitle, { selector: 'b' }).closest('article')
    expect(practicalRecord).toBeTruthy()
    expect(within(practicalRecord as HTMLElement).getByText('Continuing course')).toBeTruthy()
    const practicalCppRecord = screen.getByText(practicalCppTitle, { selector: 'b' }).closest('article')
    expect(practicalCppRecord).toBeTruthy()
    expect(within(practicalCppRecord as HTMLElement).getByText('Continuing course')).toBeTruthy()
    const cppRecord = screen.getByText('C++ Foundations', { selector: 'b' }).closest('article')
    expect(cppRecord).toBeTruthy()
    fireEvent.click(within(cppRecord as HTMLElement).getByRole('button', { name: 'Start course' }))

    expect(await screen.findByRole('heading', { name: 'C++ Foundations' })).toBeTruthy()
    await waitFor(() => {
      const stored = JSON.parse(window.localStorage.getItem(progressKey) ?? '{}')
      expect(stored.activeLanguage).toBe('cpp')
      expect(stored.completedMissions).toEqual([
        ...pythonMissionIds,
        practicalPythonFirstMissionId,
        'java-coffee-protocol',
      ])
    })
  })

  it('changes the daily goal without locking or resetting learning progress', async () => {
    window.localStorage.setItem(progressKey, JSON.stringify({
      ...initialProgress('python'),
      callsign: 'Goal Cadet',
      xp: 70,
      starShards: 25,
      completedMissions: ['py-first-spark'],
      onboardingComplete: true,
    }))

    render(<App />)
    fireEvent.click(screen.getByRole('link', { name: 'Settings' }))
    const fifteenPoints = screen.getByRole('button', { name: '15 points' })
    expect(fifteenPoints.getAttribute('aria-pressed')).toBe('false')
    fireEvent.click(fifteenPoints)

    expect(fifteenPoints.getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByText(/Missing it never locks a lesson/iu)).toBeTruthy()
    await waitFor(() => {
      const stored = JSON.parse(window.localStorage.getItem(progressKey) ?? '{}')
      expect(stored).toMatchObject({
        dailyGoal: 15,
        xp: 70,
        starShards: 25,
        completedMissions: ['py-first-spark'],
      })
    })
  })

  it('asks before saving guest progress to the account', async () => {
    window.history.replaceState({}, '', '/settings')
    let savedBody: { revision: number; progress: ReturnType<typeof initialProgress> } | null = null
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)
      if (url === '/api/auth/session') {
        return Response.json({ authenticated: true, user: { id: '314', login: 'sync-cadet', name: 'Sync Cadet' } })
      }
      if (url === '/api/progress' && (!init?.method || init.method === 'GET')) {
        return Response.json({ version: 1, record: null })
      }
      if (url === '/api/progress' && init?.method === 'PUT') {
        savedBody = JSON.parse(String(init.body))
        return Response.json({
          version: 1,
          record: {
            version: 1,
            revision: 1,
            updatedAt: '2026-08-25T14:00:00.000Z',
            progress: savedBody?.progress,
          },
        })
      }
      throw new Error(`Unexpected request: ${url}`)
    })
    vi.stubGlobal('fetch', fetchMock)

    render(<App />)

    expect(await screen.findByRole('heading', { name: /Save this browser’s progress to your account/iu })).toBeTruthy()
    expect(screen.queryByText(/Nothing will be overwritten/iu)).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Save progress to account' }))

    expect(await screen.findByText(/Progress saved to your account at/iu)).toBeTruthy()
    expect(savedBody).toMatchObject({
      revision: 0,
      progress: { callsign: 'Test Cadet', onboardingComplete: true },
    })
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('can use an existing account record on this browser without overwriting it', async () => {
    window.history.replaceState({}, '', '/settings')
    const remoteProgress = {
      ...initialProgress('java'),
      callsign: 'Cloud Cadet',
      xp: 160,
      starShards: 50,
      completedMissions: ['java-coffee-protocol'],
      onboardingComplete: true,
    }
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)
      if (url === '/api/auth/session') {
        return Response.json({ authenticated: true, user: { id: '314', login: 'cloud-cadet', name: null } })
      }
      if (url === '/api/progress' && (!init?.method || init.method === 'GET')) {
        return Response.json({
          version: 1,
          record: { version: 1, revision: 4, updatedAt: '2026-08-25T13:00:00.000Z', progress: remoteProgress },
        })
      }
      throw new Error(`Unexpected request: ${url}`)
    })
    vi.stubGlobal('fetch', fetchMock)

    render(<App />)
    expect(await screen.findByRole('heading', { name: 'Choose which progress to keep' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Use progress saved to account' }))
    fireEvent.click(screen.getByRole('link', { name: /Learner record for cloud-cadet/iu }))

    expect(await screen.findByRole('heading', { name: 'Cloud Cadet' })).toBeTruthy()
    expect(screen.getAllByText('160').length).toBeGreaterThan(0)
    expect(fetchMock.mock.calls.filter(([, init]) => init?.method === 'PUT')).toHaveLength(0)
  })

  it('deletes only progress saved to the account and keeps the browser copy', async () => {
    window.history.replaceState({}, '', '/settings')
    const localProgress = {
      ...initialProgress('python'),
      callsign: 'Test Cadet',
      onboardingComplete: true,
    }
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)
      if (url === '/api/auth/session') {
        return Response.json({ authenticated: true, user: { id: '314', login: 'delete-cadet', name: null } })
      }
      if (url === '/api/progress' && (!init?.method || init.method === 'GET')) {
        return Response.json({
          version: 1,
          record: { version: 1, revision: 2, updatedAt: '2026-08-25T13:00:00.000Z', progress: localProgress },
        })
      }
      if (url === '/api/progress' && init?.method === 'DELETE') {
        return Response.json({ deleted: true })
      }
      throw new Error(`Unexpected request: ${url}`)
    })
    vi.stubGlobal('fetch', fetchMock)
    vi.spyOn(window, 'confirm').mockReturnValue(true)

    render(<App />)
    expect(await screen.findByText(/Progress saved to your account at/iu)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Delete saved account progress' }))

    expect(await screen.findByText(/Saved account progress deleted/iu)).toBeTruthy()
    const deleteCall = fetchMock.mock.calls.find(([, init]) => init?.method === 'DELETE')
    expect(deleteCall?.[1]).toMatchObject({ method: 'DELETE', credentials: 'same-origin' })
    expect(String(deleteCall?.[1]?.body)).toContain('DELETE MY LEARNING DATA')
    expect(JSON.parse(window.localStorage.getItem(progressKey) ?? '{}')).toMatchObject({ callsign: 'Test Cadet' })
  })

  it('always shows the public launch page at the root, even with saved progress', () => {
    window.history.replaceState({}, '', '/')

    render(<App />)

    expect(screen.getByRole('heading', { name: 'Learn Python, C++, C#, or Java from the beginning' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Continue as Test Cadet' }).getAttribute('href')).toBe('/home')
    expect(screen.queryByRole('heading', { name: 'Welcome back, Test Cadet.' })).toBeNull()
    expect(document.title).toBe('SeePoundCoffeePie | Programming from the beginning.')
  })

  it('keeps Home on Python Foundations before the learner graduates', async () => {
    window.history.replaceState({}, '', '/home')

    render(<App />)

    expect(await screen.findByRole('heading', { name: 'Welcome back, Test Cadet.' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Meet the console' })).toBeTruthy()
    expect(screen.getByRole('link', { name: /Continue lesson/iu }).getAttribute('href')).toBe(
      '/learn/python-foundations/py-first-spark/py-console',
    )
    expect(screen.getByRole('heading', { name: 'Your courses' })).toBeTruthy()
    expect(screen.getByRole('link', { name: /Browse all courses/iu }).getAttribute('href')).toBe('/courses')
    expect(document.title).toBe('Learning Home | SeePoundCoffeePie')
  })

  it('hands a Python graduate from the learning home into the guided project', async () => {
    window.localStorage.setItem(progressKey, JSON.stringify({
      ...initialProgress('python'),
      callsign: 'Project Cadet',
      onboardingComplete: true,
      completedMissions: pythonMissionIds,
    }))
    window.history.replaceState({}, '', '/home')

    const { unmount } = render(<App />)

    expect(await screen.findByText('Your next step')).toBeTruthy()
    expect(screen.getByRole('heading', { name: pythonInteractiveProject.title })).toBeTruthy()
    expect(screen.getByRole('link', { name: /Start project/iu }).getAttribute('href')).toBe(
      '/projects/python/first-interactive-program',
    )

    unmount()
    const continuedProjectProgress = JSON.stringify({
      ...initialProgress('python'),
      callsign: 'Project Cadet',
      onboardingComplete: true,
      completedMissions: pythonMissionIds,
      completedProjectCheckpoints: [pythonInteractiveProject.checkpoints[0].id],
    })
    window.localStorage.setItem(progressKey, continuedProjectProgress)
    window.localStorage.setItem(progressV2Key, continuedProjectProgress)
    window.localStorage.setItem(progressV3Key, continuedProjectProgress)

    render(<App />)

    expect(await screen.findByText('Continue your project')).toBeTruthy()
    expect(screen.getByText('1 of 12 project steps complete. Your browser saved the code for your next step.')).toBeTruthy()
    expect(screen.getByRole('link', { name: /Continue project/iu }).getAttribute('href')).toBe(
      '/projects/python/first-interactive-program/project-py-string',
    )
  })

  it('moves Home from the completed Python project into Practical Python', async () => {
    storeTestProgress({
      ...initialProgress('python'),
      callsign: 'Practical Cadet',
      onboardingComplete: true,
      completedMissions: [...pythonMissionIds],
      completedProjects: [pythonInteractiveProject.id],
    })
    window.history.replaceState({}, '', '/home')

    render(<App />)

    expect(await screen.findByText('Your next course')).toBeTruthy()
    const practicalHeading = screen.getByRole('heading', { name: practicalPythonTitle })
    const practicalPanel = practicalHeading.closest('section')
    expect(practicalPanel).toBeTruthy()
    expect(screen.getByText('Next module: Functions that return answers.')).toBeTruthy()
    expect(within(practicalPanel as HTMLElement).getByRole('link', { name: /Start course/iu }).getAttribute('href')).toBe(
      practicalPythonFirstLessonPath,
    )
    expect(screen.queryByRole('heading', { name: pythonInteractiveProject.title })).toBeNull()
  })

  it('hands a C++ graduate from the learning home into the compiled project', async () => {
    window.localStorage.setItem(progressKey, JSON.stringify({
      ...initialProgress('cpp'),
      callsign: 'C++ Cadet',
      onboardingComplete: true,
      completedMissions: cppMissionIds,
    }))
    window.history.replaceState({}, '', '/home')

    render(<App />)

    expect(await screen.findByText('Your next step')).toBeTruthy()
    expect(screen.getByRole('heading', { name: cppCompiledProject.title })).toBeTruthy()
    expect(screen.getByRole('link', { name: /Start project/iu }).getAttribute('href')).toBe(
      '/projects/cpp/first-compiled-program',
    )
  })

  it('moves Home from the completed C++ project into Practical C++', async () => {
    storeTestProgress({
      ...initialProgress('cpp'),
      callsign: 'Practical C++ Cadet',
      onboardingComplete: true,
      completedMissions: cppMissionIds,
      completedProjects: [cppCompiledProject.id],
    })
    window.history.replaceState({}, '', '/home')

    render(<App />)

    expect(await screen.findByText('Your next course')).toBeTruthy()
    const practicalHeading = screen.getByRole('heading', { name: practicalCppTitle })
    const practicalPanel = practicalHeading.closest('section')
    expect(practicalPanel).toBeTruthy()
    expect(within(practicalPanel as HTMLElement).getByRole('link', { name: /Start course/iu }).getAttribute('href'))
      .toBe(practicalCppFirstLessonPath)
    expect(screen.queryByRole('heading', { name: cppCompiledProject.title })).toBeNull()
  })

  it('lists six separate course cards with canonical course links', () => {
    window.history.replaceState({}, '', '/courses')

    render(<App />)

    const courseGrid = screen.getByRole('region', { name: 'Courses' })
    expect(within(courseGrid).getAllByRole('article')).toHaveLength(6)
    expect(within(courseGrid).getByRole('heading', { name: 'Python Foundations' })).toBeTruthy()
    expect(within(courseGrid).getByRole('heading', { name: 'C++ Foundations' })).toBeTruthy()
    expect(within(courseGrid).getByRole('heading', { name: 'C# Foundations' })).toBeTruthy()
    expect(within(courseGrid).getByRole('heading', { name: 'Java Foundations' })).toBeTruthy()
    expect(within(courseGrid).getByRole('heading', { name: practicalPythonTitle })).toBeTruthy()
    expect(within(courseGrid).getByRole('heading', { name: practicalCppTitle })).toBeTruthy()
    expect(screen.getByText('The 4 foundation courses start from the beginning. Each next-step course lists the earlier work you need before starting. Your progress is saved separately for each course.')).toBeTruthy()
    expect(screen.getAllByRole('link', { name: /^Start course/iu }).map((link) => link.getAttribute('href'))).toEqual([
      '/courses/python-foundations',
      '/courses/cpp-foundations',
      '/courses/csharp-foundations',
      '/courses/java-foundations',
    ])
    expect(screen.getAllByRole('link', { name: /^View course/iu }).map((link) => link.getAttribute('href'))).toEqual([
      practicalPythonCoursePath,
      practicalCppCoursePath,
    ])
    expect(document.title).toBe('Courses | SeePoundCoffeePie')
  })

  it('lists both prerequisites inside the locked Practical Python catalog card', () => {
    window.history.replaceState({}, '', '/courses')

    render(<App />)

    const practicalCard = screen.getByRole('heading', { name: practicalPythonTitle }).closest('article')
    expect(practicalCard).toBeTruthy()
    expect(within(practicalCard as HTMLElement).getByText('Complete the items below to start')).toBeTruthy()
    for (const label of practicalPythonPrerequisiteLabels) {
      expect(within(practicalCard as HTMLElement).getByText(label)).toBeTruthy()
    }
    expect(within(practicalCard as HTMLElement).getByRole('link', { name: /^View course/iu }).getAttribute('href')).toBe(
      practicalPythonCoursePath,
    )
  })

  it('lists both prerequisites inside the locked Practical C++ catalog card', () => {
    window.history.replaceState({}, '', '/courses')

    render(<App />)

    const practicalCard = screen.getByRole('heading', { name: practicalCppTitle }).closest('article')
    expect(practicalCard).toBeTruthy()
    expect(within(practicalCard as HTMLElement).getByText('Complete the items below to start')).toBeTruthy()
    for (const label of practicalCppPrerequisiteLabels) {
      expect(within(practicalCard as HTMLElement).getByText(label)).toBeTruthy()
    }
    expect(within(practicalCard as HTMLElement).getByRole('link', { name: /^View course/iu }).getAttribute('href')).toBe(
      practicalCppCoursePath,
    )
  })

  it.each([
    ['neither prerequisite complete', [], [], practicalPythonPrerequisiteLabels, false],
    [
      'only Python Foundations complete',
      pythonMissionIds,
      [],
      [practicalPythonPrerequisiteLabels[1]],
      false,
    ],
    [
      'only the interactive project complete',
      [],
      [pythonInteractiveProject.id],
      [practicalPythonPrerequisiteLabels[0]],
      false,
    ],
    [
      'both prerequisites complete',
      pythonMissionIds,
      [pythonInteractiveProject.id],
      [],
      true,
    ],
  ] as const)(
    'enforces the %s state on the direct first Practical Python lesson route',
    async (_state, completedMissions, completedProjects, missingLabels, unlocked) => {
      storeTestProgress({
        ...initialProgress('python'),
        callsign: 'Prerequisite Cadet',
        onboardingComplete: true,
        completedMissions: [...completedMissions],
        completedProjects: [...completedProjects],
      })
      window.history.replaceState({}, '', practicalPythonFirstLessonPath)

      await act(async () => {
        render(<App />)
      })

      const expectedHeading = unlocked
        ? practicalPythonFirstLessonTitle
        : `${practicalPythonFirstLessonTitle} is still ahead`
      expect(await screen.findByRole('heading', { name: expectedHeading })).toBeTruthy()

      if (unlocked) {
        expect(screen.queryByText('Lesson locked')).toBeNull()
        return
      }

      for (const label of practicalPythonPrerequisiteLabels) {
        if ((missingLabels as readonly string[]).includes(label)) expect(screen.getByText(label)).toBeTruthy()
        else expect(screen.queryByText(label)).toBeNull()
      }
      expect(screen.getByRole('link', { name: 'Return to Practical Python' }).getAttribute('href')).toBe(
        practicalPythonCoursePath,
      )
    },
  )

  it('previews all six Practical Python modules while the course is locked', async () => {
    window.history.replaceState({}, '', practicalPythonCoursePath)

    render(<App />)

    const courseHeading = await screen.findByRole('heading', { level: 1, name: practicalPythonTitle })
    expect(courseHeading).toBeTruthy()
    expect(screen.getByText('Complete both items below to start')).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Complete these first' })).toBeTruthy()
    for (const label of practicalPythonPrerequisiteLabels) {
      expect(screen.getByText(label)).toBeTruthy()
    }
    const outline = screen.getByRole('region', { name: 'Modules' })
    expect(within(outline).getAllByRole('button')).toHaveLength(6)
    expect(within(outline).getByRole('button', { name: /Functions that return answers/iu })).toBeTruthy()
    expect(within(outline).getByRole('button', { name: /Build a Supply Tracker/iu })).toBeTruthy()
    await waitFor(() => {
      expect(document.title).toBe(`${practicalPythonTitle} | SeePoundCoffeePie`)
      expect(document.activeElement).toBe(courseHeading)
    })
  })

  it('gives a continuing course one main landmark and one skip-link target', async () => {
    window.history.replaceState({}, '', practicalPythonCoursePath)

    render(<App />)

    expect(await screen.findByRole('heading', { level: 1, name: practicalPythonTitle })).toBeTruthy()
    const mainLandmarks = screen.getAllByRole('main')
    expect(mainLandmarks).toHaveLength(1)
    expect(mainLandmarks[0].id).toBe('main-content')
    expect(document.querySelectorAll('#main-content')).toHaveLength(1)
    expect(screen.getByRole('link', { name: 'Skip to main content' }).getAttribute('href')).toBe('#main-content')
  })

  it('reports partial catalog progress in lessons instead of completed modules', () => {
    window.localStorage.setItem(progressKey, JSON.stringify({
      ...initialProgress('python'),
      callsign: 'Partial Course Cadet',
      onboardingComplete: true,
      completedLessons: ['py-console'],
    }))
    window.history.replaceState({}, '', '/courses')

    render(<App />)

    const pythonCard = screen.getByRole('heading', { name: 'Python Foundations' }).closest('article')
    expect(pythonCard).toBeTruthy()
    expect(within(pythonCard as HTMLElement).getByText('1 of 30 lessons complete')).toBeTruthy()
    expect(within(pythonCard as HTMLElement).queryByText(/modules complete/iu)).toBeNull()
  })

  it('keeps Python Foundations complete and its guided project unlocked after Data Tools exists', async () => {
    storeTestProgress({
      ...initialProgress('python'),
      callsign: 'Foundation Graduate',
      onboardingComplete: true,
      completedMissions: [...pythonMissionIds],
    })
    window.history.replaceState({}, '', '/courses')

    render(<App />)

    const foundationCard = screen.getByRole('heading', { name: 'Python Foundations' }).closest('article')
    expect(foundationCard).toBeTruthy()
    expect(within(foundationCard as HTMLElement).getByText('Course complete')).toBeTruthy()
    expect(within(foundationCard as HTMLElement).getByRole('progressbar', {
      name: 'Python Foundations progress',
    }).getAttribute('aria-valuenow')).toBe('100')

    const practicalCard = screen.getByRole('heading', { name: practicalPythonTitle }).closest('article')
    expect(practicalCard).toBeTruthy()
    expect(within(practicalCard as HTMLElement).queryByText(practicalPythonPrerequisiteLabels[0])).toBeNull()
    expect(within(practicalCard as HTMLElement).getByText(practicalPythonPrerequisiteLabels[1])).toBeTruthy()

    act(() => {
      window.history.pushState({}, '', '/projects/python/first-interactive-program')
      window.dispatchEvent(new PopStateEvent('popstate'))
    })

    expect(await screen.findByRole('heading', { name: pythonInteractiveProject.title })).toBeTruthy()
    expect(screen.queryByRole('heading', {
      name: 'Finish Python Foundations, then build without training wheels.',
    })).toBeNull()
    expect(screen.getByRole('link', { name: /Start project/iu }).getAttribute('href')).toBe(
      '/projects/python/first-interactive-program/project-py-print',
    )
  })

  it('keeps projects out of All courses and shows both project collections after selecting Projects', () => {
    window.history.replaceState({}, '', '/courses')

    render(<App />)

    expect(screen.getByRole('navigation', { name: 'Course filters' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Open navigation' }).getAttribute('aria-controls')).toBe('primary-navigation')
    expect(screen.getByRole('button', { name: 'Open navigation' }).getAttribute('aria-expanded')).toBe('false')
    expect(screen.getByRole('button', { name: 'All courses' }).getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByRole('region', { name: 'Courses' })).toBeTruthy()
    expect(screen.queryByRole('region', { name: 'Projects' })).toBeNull()
    expect(screen.queryByRole('link', { name: /Your First Interactive Program/iu })).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Projects' }))

    expect(screen.getByRole('button', { name: 'Projects' }).getAttribute('aria-pressed')).toBe('true')
    expect(screen.queryByRole('region', { name: 'Courses' })).toBeNull()
    const projects = screen.getByRole('region', { name: 'Projects' })
    expect(within(projects).getAllByRole('link')).toHaveLength(8)
    expect(within(projects).getAllByText(/final project$/iu)).toHaveLength(4)
    expect(screen.getByRole('link', { name: /Your First Interactive Program/iu }).getAttribute('href')).toBe(
      '/projects/python/first-interactive-program',
    )
    expect(screen.getByRole('link', { name: /Your First Compiled Program/iu }).getAttribute('href')).toBe(
      '/projects/cpp/first-compiled-program',
    )
    expect(screen.getByRole('link', { name: /Community Workshop Check-In/iu }).getAttribute('href')).toBe(
      '/projects/csharp/workshop-check-in',
    )
    expect(screen.getByRole('link', { name: /Community Picnic Planner/iu }).getAttribute('href')).toBe(
      '/projects/java/picnic-planner',
    )
  })

  it('keeps the active language control available as a real labeled select', async () => {
    window.history.replaceState({}, '', '/courses')

    render(<App />)

    const languageSelect = screen.getByRole('combobox', { name: 'Active language' }) as HTMLSelectElement
    expect(languageSelect.value).toBe('python')
    expect(languageSelect.options).toHaveLength(4)

    fireEvent.change(languageSelect, { target: { value: 'cpp' } })

    expect(languageSelect.value).toBe('cpp')
    await waitFor(() => {
      const saved = JSON.parse(window.localStorage.getItem(progressKey) ?? '{}')
      expect(saved.activeLanguage).toBe('cpp')
    })
  })

  it('shows the compiled project after the C++ course outline', async () => {
    window.history.replaceState({}, '', '/courses/cpp-foundations')

    render(<App />)

    expect(await screen.findByRole('heading', { name: 'C++ Foundations' })).toBeTruthy()
    expect(screen.getByRole('region', { name: 'Modules' })).toBeTruthy()
    expect(screen.queryByText('Course outline')).toBeNull()
    expect(screen.queryByRole('heading', { name: 'What you will learn' })).toBeNull()
    expect(screen.getByRole('heading', { name: cppCompiledProject.title })).toBeTruthy()
    expect(screen.getByText(/downloadable C\+\+ source file/iu)).toBeTruthy()
    expect(screen.getByRole('link', { name: /Preview project/iu }).getAttribute('href')).toBe(
      '/projects/cpp/first-compiled-program',
    )
  })

  it('shows the picnic project after the Java course outline', async () => {
    window.history.replaceState({}, '', '/courses/java-foundations')

    render(<App />)

    expect(await screen.findByRole('heading', { name: 'Java Foundations' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Community Picnic Planner' })).toBeTruthy()
    expect(screen.getByText(/downloadable \.java source file/iu)).toBeTruthy()
    expect(screen.getByRole('link', { name: /Preview project/iu }).getAttribute('href')).toBe(
      '/projects/java/picnic-planner',
    )
  })

  it('keeps the project overview locked until Python Foundations is complete', async () => {
    window.history.replaceState({}, '', '/projects/python/first-interactive-program')

    render(<App />)

    expect(await screen.findByRole('heading', { name: 'Your First Interactive Program' })).toBeTruthy()
    expect(screen.getByRole('heading', {
      name: 'Complete Python Foundations to start this project.',
    })).toBeTruthy()
    expect(screen.queryByRole('textbox', { name: 'Project code editor' })).toBeNull()
    expect(screen.getByRole('progressbar', { name: 'Project progress' }).getAttribute('aria-valuenow')).toBe('0')
    expect(screen.getByRole('link', { name: /Continue Python Foundations/iu }).getAttribute('href')).toBe(
      '/courses/python-foundations',
    )
    expect(document.title).toBe('Your First Interactive Program | SeePoundCoffeePie')
  })

  it('keeps the C++ project overview locked until C++ Foundations is complete', async () => {
    window.history.replaceState({}, '', '/projects/cpp/first-compiled-program')

    render(<App />)

    expect(await screen.findByRole('heading', { name: cppCompiledProject.title })).toBeTruthy()
    expect(screen.getByRole('heading', {
      name: 'Complete C++ Foundations to start this project.',
    })).toBeTruthy()
    expect(screen.queryByRole('textbox', { name: 'Project code editor' })).toBeNull()
    expect(screen.getByRole('link', { name: /Continue C\+\+ Foundations/iu }).getAttribute('href')).toBe(
      '/courses/cpp-foundations',
    )
    expect(document.title).toBe('Your First Compiled Program | SeePoundCoffeePie')
  })

  it('opens an unlocked project checkpoint at its canonical deep link with accessible controls', async () => {
    window.localStorage.setItem(progressKey, JSON.stringify({
      ...initialProgress('python'),
      callsign: 'Test Cadet',
      onboardingComplete: true,
      completedMissions: pythonMissionIds,
    }))
    window.history.replaceState({}, '', '/projects/python/first-interactive-program/project-py-print')

    render(<App />)

    const projectHeading = await screen.findByRole('heading', { level: 1, name: 'Let the program speak' })
    expect(projectHeading).toBeTruthy()
    await waitFor(() => expect(document.activeElement).toBe(projectHeading))
    expect(window.location.pathname).toBe('/projects/python/first-interactive-program/project-py-print')
    expect(document.title).toBe('Let the program speak | SeePoundCoffeePie')
    expect(screen.getByRole('link', { name: 'Back to project overview' }).getAttribute('href')).toBe(
      '/projects/python/first-interactive-program',
    )
    const completion = screen.getByRole('progressbar', { name: 'Project completion' })
    expect(completion.getAttribute('aria-valuenow')).toBe('0')
    expect(completion.getAttribute('aria-valuetext')).toBe('0 of 12 steps complete')
    expect(screen.getByText('Step 1 of 12')).toBeTruthy()
    const checkpointNavigation = screen.getByRole('navigation', { name: 'Project steps' })
    expect(within(checkpointNavigation).getAllByRole('listitem')).toHaveLength(12)
    expect(screen.getByRole('link', { name: /Step 1: Let the program speak.*Current step, not complete/iu }).getAttribute('aria-current')).toBe('step')
    expect(screen.getByText(/Step 2: Recognize the text\. Locked\./iu)).toBeTruthy()

    const editor = screen.getByRole('textbox', { name: 'Project code editor' })
    expect(editor.getAttribute('aria-keyshortcuts')).toBe('Control+Enter Meta+Enter')
    expect(screen.getByRole('button', { name: 'Run' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Reset code' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Download .py' })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Check work/iu })).toBeTruthy()
    expect(screen.getByLabelText('Program output')).toBeTruthy()
    expect(screen.getByText('I need a hint', { selector: 'summary' })).toBeTruthy()

    fireEvent.change(editor, { target: { value: 'print("Coffee counter ready.")' } })
    fireEvent.click(screen.getByRole('button', { name: 'Run' }))
    await waitFor(() => expect(vi.mocked(runExercise)).toHaveBeenCalled())
    expect(completion.getAttribute('aria-valuenow')).toBe('0')

    fireEvent.click(screen.getByRole('button', { name: /Check work/iu }))
    expect(await screen.findByText('Step complete')).toBeTruthy()
    await waitFor(() => {
      expect(completion.getAttribute('aria-valuenow')).toBe('8')
      expect(completion.getAttribute('aria-valuetext')).toBe('1 of 12 steps complete')
    })
  })

  it('opens an unlocked C++ checkpoint with a C++ editor and download', async () => {
    window.localStorage.setItem(progressKey, JSON.stringify({
      ...initialProgress('cpp'),
      callsign: 'C++ Cadet',
      onboardingComplete: true,
      completedMissions: cppMissionIds,
      completedProjectCheckpoints: cppCompiledProject.checkpoints.slice(0, 2).map((checkpoint) => checkpoint.id),
    }))
    window.history.replaceState({}, '', '/projects/cpp/first-compiled-program/project-cpp-output')

    render(<App />)

    expect(await screen.findByRole('heading', { level: 1, name: 'Send one clear line' })).toBeTruthy()
    expect(screen.getByText(cppCompiledProject.title)).toBeTruthy()
    expect(screen.getByText('observation-desk.cpp')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Download .cpp' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Back to project overview' }).getAttribute('href')).toBe(
      '/projects/cpp/first-compiled-program',
    )
    expect(document.title).toBe('Send one clear line | SeePoundCoffeePie')
  })

  it('explains a C++ compiler failure before offering the exact compiler text', async () => {
    vi.mocked(runExercise).mockResolvedValueOnce({
      version: 1,
      runId: 'run_cpp_compile_error_123456',
      outcome: 'compile_error',
      stdout: '',
      stderr: 'mission.cpp:4:48: error: expected semicolon before return',
      exitCode: 1,
      durationMs: 42,
      truncated: false,
      limit: null,
      tests: [],
      diagnostic: {
        title: 'C++ expected a semicolon',
        explanation: 'One statement does not have a clear ending yet.',
        suggestion: 'Look at the end of the output statement and add one semicolon.',
        line: 4,
      },
    })
    window.localStorage.setItem(progressKey, JSON.stringify({
      ...initialProgress('cpp'),
      callsign: 'C++ Cadet',
      onboardingComplete: true,
      completedMissions: cppMissionIds,
      completedProjectCheckpoints: cppCompiledProject.checkpoints.slice(0, 3).map((checkpoint) => checkpoint.id),
    }))
    window.history.replaceState({}, '', '/projects/cpp/first-compiled-program/project-cpp-semicolon')

    render(<App />)

    expect(await screen.findByRole('heading', { level: 1, name: 'Read your first compiler message' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Run' }))

    expect(await screen.findByText('C++ expected a semicolon')).toBeTruthy()
    expect(screen.getByText('One statement does not have a clear ending yet.')).toBeTruthy()
    expect(screen.getByText(/Look at the end of the output statement and add one semicolon\./u)).toBeTruthy()
    expect(screen.getByText('Look near line 4')).toBeTruthy()
    expect(screen.getByText("Show the language's exact message", { selector: 'summary' })).toBeTruthy()
    expect(screen.getByLabelText('Program output').textContent).not.toContain('mission.cpp')
  })

  it('falls back to the project overview when a known checkpoint is not available yet', async () => {
    window.localStorage.setItem(progressKey, JSON.stringify({
      ...initialProgress('python'),
      callsign: 'Test Cadet',
      onboardingComplete: true,
      completedMissions: pythonMissionIds,
    }))
    window.history.replaceState({}, '', '/projects/python/first-interactive-program/project-py-variable')

    render(<App />)

    expect(await screen.findByRole('heading', { name: 'Your First Interactive Program' })).toBeTruthy()
    expect(screen.queryByRole('textbox', { name: 'Project code editor' })).toBeNull()
    expect(screen.getByRole('link', { name: /Start project/iu }).getAttribute('href')).toBe(
      '/projects/python/first-interactive-program/project-py-print',
    )
    expect(window.location.pathname).toBe('/projects/python/first-interactive-program/project-py-variable')
  })

  it('shows the safe not-found page for an invalid project checkpoint', () => {
    window.history.replaceState({}, '', '/projects/python/first-interactive-program/not-a-checkpoint')

    render(<App />)

    expect(screen.getByRole('heading', { name: 'We could not find that page' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Go to learning home' }).getAttribute('href')).toBe('/home')
    expect(screen.queryByRole('textbox', { name: 'Project code editor' })).toBeNull()
  })

  it('restores a saved project draft when the learner returns to a checkpoint', async () => {
    const savedDraft = '# My saved work\nprint("Coffee counter ready.")'
    window.localStorage.setItem(progressKey, JSON.stringify({
      ...initialProgress('python'),
      callsign: 'Test Cadet',
      onboardingComplete: true,
      completedMissions: pythonMissionIds,
    }))
    expect(saveProjectDraft(
      'first-interactive-program',
      'project-py-print',
      savedDraft,
      window.localStorage,
    )).toBe(true)
    window.history.replaceState({}, '', '/projects/python/first-interactive-program/project-py-print')

    render(<App />)

    expect((await screen.findByRole('textbox', { name: 'Project code editor' }) as HTMLTextAreaElement).value).toBe(savedDraft)
  })

  it('uses a bookmarked course as page context without replacing the saved language preference', async () => {
    window.history.replaceState({}, '', '/courses/java-foundations')

    render(<App />)

    expect(await screen.findByRole('heading', { name: 'Java Foundations' })).toBeTruthy()
    expect((screen.getByRole('combobox', { name: 'Active language' }) as HTMLSelectElement).value).toBe('java')
    expect(screen.getByRole('link', { name: 'Practice' }).getAttribute('href')).toBe('/practice/java')
    expect(screen.getByRole('link', { name: 'Code reference' }).getAttribute('href')).toBe('/codebook/java')
    expect(window.location.pathname).toBe('/courses/java-foundations')
    await waitFor(() => {
      expect(JSON.parse(window.localStorage.getItem(progressKey) ?? '{}').activeLanguage).toBe('python')
    })
  })

  it('keeps canonical lesson context out of the saved preference across browser history', async () => {
    const cppMission = trackById('cpp').missions[0]
    const cppExercise = cppMission.exercises[0]
    const pythonMission = trackById('python').missions[0]
    const pythonExercise = pythonMission.exercises[0]
    storeTestProgress({
      ...initialProgress('python'),
      callsign: 'Bookmark Cadet',
      onboardingComplete: true,
    })
    window.history.replaceState(
      {},
      '',
      `/learn/cpp-foundations/${cppMission.id}/${cppExercise.id}`,
    )

    render(<App />)

    expect(await screen.findByRole('heading', { name: cppExercise.title })).toBeTruthy()
    await waitFor(() => {
      expect(JSON.parse(window.localStorage.getItem(progressKey) ?? '{}').activeLanguage).toBe('python')
    })

    act(() => {
      window.history.pushState(
        {},
        '',
        `/learn/python-foundations/${pythonMission.id}/${pythonExercise.id}`,
      )
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
    expect(await screen.findByRole('heading', { name: pythonExercise.title })).toBeTruthy()

    window.history.back()
    expect(await screen.findByRole('heading', { name: cppExercise.title })).toBeTruthy()
    expect(JSON.parse(window.localStorage.getItem(progressKey) ?? '{}').activeLanguage).toBe('python')

    window.history.forward()
    expect(await screen.findByRole('heading', { name: pythonExercise.title })).toBeTruthy()
    expect(JSON.parse(window.localStorage.getItem(progressKey) ?? '{}').activeLanguage).toBe('python')
  })

  it('keeps legacy lesson routes as explicit language preference changes', async () => {
    const mission = trackById('java').missions[0]
    storeTestProgress({
      ...initialProgress('python'),
      callsign: 'Legacy Route Cadet',
      onboardingComplete: true,
    })
    window.history.replaceState({}, '', `/academy/java/missions/${mission.id}`)

    render(<App />)

    await waitFor(() => {
      expect(JSON.parse(window.localStorage.getItem(progressKey) ?? '{}').activeLanguage).toBe('java')
    })
  })

  it('moves route focus from the loading boundary to the resolved foundation heading', async () => {
    window.history.replaceState({}, '', '/courses/java-foundations')

    render(<App />)

    expect(screen.getByRole('heading', { name: 'Loading course' })).toBeTruthy()
    expect(document.querySelectorAll('#main-content')).toHaveLength(1)
    expect(screen.getAllByRole('main')).toHaveLength(1)

    const heading = await screen.findByRole('heading', { name: 'Java Foundations' })
    await waitFor(() => expect(document.activeElement).toBe(heading))
    expect(document.querySelectorAll('#main-content')).toHaveLength(1)
    expect(screen.getAllByRole('main')).toHaveLength(1)
  })

  it('shows a truthful retry state when foundation content cannot load', async () => {
    vi.spyOn(foundationCourseLoader, 'foundationCourseContentRequestForLanguage')
      .mockReturnValue(Promise.resolve(null))
    window.history.replaceState({}, '', '/home')

    render(<App />)

    expect(screen.getByRole('heading', { name: 'Loading your course' })).toBeTruthy()
    const heading = await screen.findByRole('heading', { name: 'Course could not load' })
    expect(screen.getByText(/Your progress is saved/iu)).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Reload page' })).toBeTruthy()
    expect(screen.queryByRole('heading', { name: 'We could not find that page' })).toBeNull()
    expect(document.querySelectorAll('#main-content')).toHaveLength(1)
    expect(screen.getAllByRole('main')).toHaveLength(1)
    await waitFor(() => expect(document.activeElement).toBe(heading))
  })

  it('moves focus and the title to a truthful Practice load failure', async () => {
    vi.spyOn(practicePublicationLoader, 'loadPracticeTrackForSurface').mockResolvedValue({
      ok: false,
      reason: 'continuing-content-unavailable',
      courseId: 'python-data-tools',
    })
    storeTestProgress({
      ...initialProgress('python'),
      callsign: 'Practice Tester',
      onboardingComplete: true,
    })
    window.history.replaceState({}, '', '/practice/python')

    render(<App />)

    expect(screen.getByRole('heading', { name: 'Loading practice' })).toBeTruthy()
    const heading = await screen.findByRole('heading', { name: 'Practice could not load' })
    expect(screen.getByText(/Your progress is saved/iu)).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Reload page' })).toBeTruthy()
    await waitFor(() => expect(document.activeElement).toBe(heading))
    expect(document.title).toBe('Practice could not load | SeePoundCoffeePie')
  })

  it('updates course context when browser history changes between bookmarked courses', async () => {
    window.history.replaceState({}, '', '/courses/java-foundations')
    render(<App />)

    expect(await screen.findByRole('heading', { name: 'Java Foundations' })).toBeTruthy()
    expect((screen.getByRole('combobox', { name: 'Active language' }) as HTMLSelectElement).value).toBe('java')

    act(() => {
      window.history.pushState({}, '', '/courses/python-foundations')
      window.dispatchEvent(new PopStateEvent('popstate'))
    })

    expect(await screen.findByRole('heading', { name: 'Python Foundations' })).toBeTruthy()
    expect((screen.getByRole('combobox', { name: 'Active language' }) as HTMLSelectElement).value).toBe('python')
    expect(screen.getByRole('link', { name: 'Practice' }).getAttribute('href')).toBe('/practice/python')
    expect(screen.getByRole('link', { name: 'Code reference' }).getAttribute('href')).toBe('/codebook/python')
  })

  it('loads Settings directly and gives every main section a real URL', () => {
    window.history.replaceState({}, '', '/settings')

    render(<App />)

    expect(screen.getByRole('heading', { name: 'Settings' })).toBeTruthy()
    expect(screen.queryByText('Settings', { selector: '.kicker' })).toBeNull()
    expect(screen.getByRole('heading', { name: 'Daily goal' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Progress backup' })).toBeTruthy()
    expect(screen.getByText(/A backup is a small \.json text file/iu)).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Download backup file' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Restore from file' })).toBeTruthy()
    expect(document.title).toBe('Settings | SeePoundCoffeePie')
    expect(screen.getByRole('link', { name: 'Home' }).getAttribute('href')).toBe('/home')
    expect(screen.getByRole('link', { name: 'Courses' }).getAttribute('href')).toBe('/courses')
    expect(screen.getByRole('link', { name: 'Practice' }).getAttribute('href')).toBe('/practice/python')
    expect(screen.getByRole('link', { name: 'Code reference' }).getAttribute('href')).toBe('/codebook/python')
    expect(screen.getByRole('link', { name: 'Learner record' }).getAttribute('href')).toBe('/profile')
    expect(screen.getByRole('link', { name: 'Settings' }).getAttribute('href')).toBe('/settings')
  })

  it('lazy loads the bookmarkable Python Codebook route', async () => {
    window.history.replaceState({}, '', '/codebook/python')

    render(<App />)

    expect(await screen.findByRole('heading', { level: 1, name: 'Code reference' })).toBeTruthy()
    const codebookSearch = screen.getByRole('searchbox', { name: 'Search the code reference' })
    expect(codebookSearch).toBeTruthy()
    expect(screen.getByText(/Showing \d+ of \d+ definitions/iu)).toBeTruthy()
    fireEvent.change(codebookSearch, { target: { value: 'return value' } })
    expect(screen.getByRole('heading', { name: 'Return value' })).toBeTruthy()
    expect(screen.getByText(/\d+ of \d+ available/iu)).toBeTruthy()
    expect(screen.queryByText(/EXAMPLE LOCKED/iu)).toBeNull()
    expect(document.title).toBe('Python Code reference | SeePoundCoffeePie')
  })

  it('opens a bookmarked language school and keeps that school active', async () => {
    window.history.replaceState({}, '', '/academy/java')

    render(<App />)

    expect(await screen.findByRole('heading', { name: 'Java Foundations' })).toBeTruthy()
    await waitFor(() => {
      expect(JSON.parse(window.localStorage.getItem(progressKey) ?? '{}').activeLanguage).toBe('java')
    })
  })

  it('opens an exact lesson from its canonical bookmarkable URL', async () => {
    window.history.replaceState({}, '', '/learn/python-foundations/py-first-spark/py-console')

    render(<App />)

    expect(await screen.findByRole('heading', { name: 'Meet the console' })).toBeTruthy()
    expect(window.location.pathname).toBe('/learn/python-foundations/py-first-spark/py-console')
    expect(document.title).toBe('Meet the console | SeePoundCoffeePie')
  })

  it('sets the direct Practical Python lesson title after the lazy route loads', async () => {
    storeTestProgress({
      ...initialProgress('python'),
      callsign: 'Title Cadet',
      onboardingComplete: true,
      completedMissions: [...pythonMissionIds],
      completedProjects: [pythonInteractiveProject.id],
    })
    window.history.replaceState({}, '', practicalPythonFirstLessonPath)

    render(<App />)

    expect(await screen.findByRole('heading', { name: practicalPythonFirstLessonTitle })).toBeTruthy()
    await waitFor(() => {
      expect(document.title).toBe(`${practicalPythonFirstLessonTitle} | SeePoundCoffeePie`)
    })
  })

  it('updates the canonical lesson URL and title when continuing to the next lesson', async () => {
    window.history.replaceState({}, '', '/learn/python-foundations/py-first-spark/py-console')

    render(<App />)
    fireEvent.click(await screen.findByRole('radio', { name: /Shows text from the program/iu }))
    fireEvent.click(screen.getByRole('button', { name: 'Check answer' }))
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

    expect(await screen.findByRole('heading', { name: 'Print your first message' })).toBeTruthy()
    expect(window.location.pathname).toBe('/learn/python-foundations/py-first-spark/py-print')
    await waitFor(() => {
      expect(document.title).toBe('Print your first message | SeePoundCoffeePie')
    })
  })

  it('keeps Phase 5A integration literals free of em dash characters', () => {
    expect(JSON.stringify(phase5aTestLiterals)).not.toContain(String.fromCodePoint(0x2014))
  })
})
