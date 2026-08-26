// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { cppCompiledProject } from './data/cpp-compiled-project'
import { trackById } from './data/curriculum'
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
const pythonMissionIds = trackById('python').missions.map((mission) => mission.id)
const cppMissionIds = trackById('cpp').missions.map((mission) => mission.id)

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
    fireEvent.click(screen.getByRole('link', { name: /Meet the console/iu }))
    fireEvent.click(screen.getByRole('radio', { name: /Shows text from the program/iu }))
    fireEvent.click(screen.getByRole('button', { name: 'Check answer' }))
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    return screen.getByRole('textbox', { name: 'Code editor' })
  }

  it('runs an editor check with Ctrl+Enter and announces the result', async () => {
    const editor = await openFirstEditableStep()
    fireEvent.change(editor, {
      target: { value: '# Tell the bridge our signal is ready\nprint("Signal online")' },
    })
    fireEvent.keyDown(editor, { key: 'Enter', ctrlKey: true })

    expect(await screen.findByText('System online')).toBeTruthy()
    expect(screen.getByText('Signal online', { selector: 'pre' })).toBeTruthy()
    expect(screen.getByLabelText('Real runner report').textContent).toContain('fresh sandbox destroyed after run')
    expect(editor.getAttribute('aria-keyshortcuts')).toBe('Control+Enter Meta+Enter')
  })

  it('keeps Tab available for normal keyboard navigation', async () => {
    const editor = await openFirstEditableStep()
    const tabWasNotCancelled = fireEvent.keyDown(editor, { key: 'Tab' })

    expect(tabWasNotCancelled).toBe(true)
    expect(screen.getByLabelText('Code editor keyboard controls').textContent).toContain('Tab moves out of the editor normally')
  })

  it('opens the completed mission that best covers the active review queue', async () => {
    window.localStorage.setItem(progressKey, JSON.stringify({
      ...initialProgress('java'),
      callsign: 'Test Cadet',
      onboardingComplete: true,
      completedMissions: ['java-coffee-protocol', 'java-routing-orders'],
      conceptProgress: {
        'java-booleans': {
          strength: 1,
          correct: 1,
          incorrect: 1,
          dueAt: dateKey(new Date()),
        },
      },
    }))
    window.history.replaceState({}, '', '/academy/java')

    render(<App />)
    fireEvent.click(screen.getByRole('link', { name: 'Practice' }))

    const reviewButton = screen.getByRole('button', { name: 'Review Routing Orders' })
    expect(screen.getByText('BEST MATCH · MISSION 02')).toBeTruthy()
    fireEvent.click(reviewButton)

    expect(await screen.findByRole('heading', { name: 'Ask a routing question' })).toBeTruthy()
    expect(screen.getByText('FOCUSED REVIEW · 1 OF 1')).toBeTruthy()

    fireEvent.click(screen.getByRole('radio', { name: /true and falseJava writes/iu }))
    fireEvent.click(screen.getByRole('button', { name: 'Check answer' }))
    fireEvent.click(screen.getByRole('button', { name: 'Finish practice' }))

    expect(screen.getByText('PRACTICE COMPLETE')).toBeTruthy()
    expect(screen.getByText('concepts reviewed')).toBeTruthy()
    expect(screen.queryByText('star shards')).toBeNull()
    await waitFor(() => {
      const stored = JSON.parse(window.localStorage.getItem(progressKey) ?? '{}')
      expect(stored.starShards).toBe(0)
      expect(stored.completedMissions).toEqual(['java-coffee-protocol', 'java-routing-orders'])
    })
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
      expect(JSON.parse(window.localStorage.getItem(progressKey) ?? '{}')).toMatchObject(restored)
    })
  })

  it('shows separate course records and opens another language without erasing progress', async () => {
    window.localStorage.setItem(progressKey, JSON.stringify({
      ...initialProgress('python'),
      callsign: 'Route Cadet',
      completedMissions: ['py-first-spark', 'java-coffee-protocol'],
      onboardingComplete: true,
    }))

    render(<App />)
    fireEvent.click(screen.getByRole('link', { name: 'Learner record' }))

    expect(screen.getByRole('heading', { name: 'Course records' })).toBeTruthy()
    expect(screen.getByLabelText('Python 17% complete')).toBeTruthy()
    expect(screen.getByLabelText('Java 17% complete')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Open C++ Foundations' }))

    expect(await screen.findByRole('heading', { name: 'C++ Foundations' })).toBeTruthy()
    await waitFor(() => {
      const stored = JSON.parse(window.localStorage.getItem(progressKey) ?? '{}')
      expect(stored.activeLanguage).toBe('cpp')
      expect(stored.completedMissions).toEqual(['py-first-spark', 'java-coffee-protocol'])
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
    const fifteenXp = screen.getByRole('button', { name: '15 XP' })
    expect(fifteenXp.getAttribute('aria-pressed')).toBe('false')
    fireEvent.click(fifteenXp)

    expect(fifteenXp.getAttribute('aria-pressed')).toBe('true')
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

  it('asks before migrating guest progress and then synchronizes the chosen browser record', async () => {
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

    expect(await screen.findByText(/Cadet Record synchronized at/iu)).toBeTruthy()
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
    expect(await screen.findByRole('heading', { name: 'Choose which progress to continue' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Use saved account' }))
    fireEvent.click(screen.getByRole('link', { name: /Learner record for cloud-cadet/iu }))

    expect(await screen.findByRole('heading', { name: 'Cloud Cadet' })).toBeTruthy()
    expect(screen.getAllByText('160').length).toBeGreaterThan(0)
    expect(fetchMock.mock.calls.filter(([, init]) => init?.method === 'PUT')).toHaveLength(0)
  })

  it('deletes only the synchronized account record and keeps the browser copy', async () => {
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
    expect(await screen.findByText(/Cadet Record synchronized at/iu)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Delete account learning data' }))

    expect(await screen.findByText(/Account learning data deleted/iu)).toBeTruthy()
    const deleteCall = fetchMock.mock.calls.find(([, init]) => init?.method === 'DELETE')
    expect(deleteCall?.[1]).toMatchObject({ method: 'DELETE', credentials: 'same-origin' })
    expect(String(deleteCall?.[1]?.body)).toContain('DELETE MY LEARNING DATA')
    expect(JSON.parse(window.localStorage.getItem(progressKey) ?? '{}')).toMatchObject({ callsign: 'Test Cadet' })
  })

  it('always shows the public launch page at the root, even with saved progress', () => {
    window.history.replaceState({}, '', '/')

    render(<App />)

    expect(screen.getByRole('heading', { name: 'The code academy for absolute beginners' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Continue as Test Cadet' }).getAttribute('href')).toBe('/home')
    expect(screen.queryByRole('heading', { name: 'Welcome back, Test Cadet.' })).toBeNull()
    expect(document.title).toBe('SeePoundCoffeePie | Programming from the beginning.')
  })

  it('loads the learner home at its own bookmarkable URL', () => {
    window.history.replaceState({}, '', '/home')

    render(<App />)

    expect(screen.getByRole('heading', { name: 'Welcome back, Test Cadet.' })).toBeTruthy()
    expect(screen.getByRole('link', { name: /Browse all courses/iu }).getAttribute('href')).toBe('/courses')
    expect(document.title).toBe('Learning Home | SeePoundCoffeePie')
  })

  it('hands a Python graduate from the learning home into the guided project', () => {
    window.localStorage.setItem(progressKey, JSON.stringify({
      ...initialProgress('python'),
      callsign: 'Project Cadet',
      onboardingComplete: true,
      completedMissions: pythonMissionIds,
    }))
    window.history.replaceState({}, '', '/home')

    const { unmount } = render(<App />)

    expect(screen.getByText('Your next step')).toBeTruthy()
    expect(screen.getByRole('heading', { name: pythonInteractiveProject.title })).toBeTruthy()
    expect(screen.getByRole('link', { name: /Start project/iu }).getAttribute('href')).toBe(
      '/projects/python/first-interactive-program',
    )

    unmount()
    window.localStorage.setItem(progressKey, JSON.stringify({
      ...initialProgress('python'),
      callsign: 'Project Cadet',
      onboardingComplete: true,
      completedMissions: pythonMissionIds,
      completedProjectCheckpoints: [pythonInteractiveProject.checkpoints[0].id],
    }))

    render(<App />)

    expect(screen.getByText('Continue your project')).toBeTruthy()
    expect(screen.getByText('1 of 12 checkpoints complete. Your browser saved the code for your next small step.')).toBeTruthy()
    expect(screen.getByRole('link', { name: /Continue project/iu }).getAttribute('href')).toBe(
      '/projects/python/first-interactive-program/project-py-string',
    )
  })

  it('hands a C++ graduate from the learning home into the compiled project', () => {
    window.localStorage.setItem(progressKey, JSON.stringify({
      ...initialProgress('cpp'),
      callsign: 'C++ Cadet',
      onboardingComplete: true,
      completedMissions: cppMissionIds,
    }))
    window.history.replaceState({}, '', '/home')

    render(<App />)

    expect(screen.getByText('Your next step')).toBeTruthy()
    expect(screen.getByRole('heading', { name: cppCompiledProject.title })).toBeTruthy()
    expect(screen.getByRole('link', { name: /Start project/iu }).getAttribute('href')).toBe(
      '/projects/cpp/first-compiled-program',
    )
  })

  it('lists all four foundation courses with canonical course links', () => {
    window.history.replaceState({}, '', '/courses')

    render(<App />)

    expect(screen.getByRole('heading', { name: 'Python Foundations' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'C++ Foundations' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'C# Foundations' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Java Foundations' })).toBeTruthy()
    expect(screen.getAllByRole('link', { name: /^Start course/iu }).map((link) => link.getAttribute('href'))).toEqual([
      '/courses/python-foundations',
      '/courses/cpp-foundations',
      '/courses/csharp-foundations',
      '/courses/java-foundations',
    ])
    expect(document.title).toBe('Courses | SeePoundCoffeePie')
  })

  it('lists the released Python, C++, and C# projects with canonical catalog links', () => {
    window.history.replaceState({}, '', '/courses')

    render(<App />)

    expect(screen.getByRole('navigation', { name: 'Course filters' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Open navigation' }).getAttribute('aria-controls')).toBe('primary-navigation')
    expect(screen.getByRole('button', { name: 'Open navigation' }).getAttribute('aria-expanded')).toBe('false')
    expect(screen.getByRole('button', { name: 'All courses' }).getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByRole('button', { name: 'Guided projects' })).toBeTruthy()
    expect(screen.getByRole('link', { name: /Your First Interactive Program/iu }).getAttribute('href')).toBe(
      '/projects/python/first-interactive-program',
    )
    expect(screen.getByRole('link', { name: /Your First Compiled Program/iu }).getAttribute('href')).toBe(
      '/projects/cpp/first-compiled-program',
    )
    expect(screen.getByRole('link', { name: /Community Workshop Check-In/iu }).getAttribute('href')).toBe(
      '/projects/csharp/workshop-check-in',
    )
  })

  it('shows the compiled project after the C++ course outline', () => {
    window.history.replaceState({}, '', '/courses/cpp-foundations')

    render(<App />)

    expect(screen.getByRole('heading', { name: 'C++ Foundations' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: cppCompiledProject.title })).toBeTruthy()
    expect(screen.getByText(/downloadable C\+\+ source file/iu)).toBeTruthy()
    expect(screen.getByRole('link', { name: /Preview project/iu }).getAttribute('href')).toBe(
      '/projects/cpp/first-compiled-program',
    )
  })

  it('keeps the project overview locked until Python Foundations is complete', async () => {
    window.history.replaceState({}, '', '/projects/python/first-interactive-program')

    render(<App />)

    expect(await screen.findByRole('heading', { name: 'Your First Interactive Program' })).toBeTruthy()
    expect(screen.getByRole('heading', {
      name: 'Finish Python Foundations, then build without training wheels.',
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
      name: 'Finish C++ Foundations, then build a complete compiled program.',
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
    expect(screen.getByRole('progressbar', { name: 'Checkpoint progress' }).getAttribute('aria-valuenow')).toBe('8')
    expect(screen.getByRole('navigation', { name: 'Project checkpoints' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Checkpoint 1: Let the program speak' }).getAttribute('aria-current')).toBe('step')
    expect(screen.getByText('Checkpoint 2: Recognize the text, locked')).toBeTruthy()

    const editor = screen.getByRole('textbox', { name: 'Project code editor' })
    expect(editor.getAttribute('aria-keyshortcuts')).toBe('Control+Enter Meta+Enter')
    expect(screen.getByRole('button', { name: 'Run' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Reset checkpoint' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Download .py' })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Check checkpoint/iu })).toBeTruthy()
    expect(screen.getByLabelText('Program console')).toBeTruthy()
    expect(screen.getByText('I need a hint', { selector: 'summary' })).toBeTruthy()
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
    expect(screen.getByText('C++ project studio')).toBeTruthy()
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
    expect(screen.getByLabelText('Program console').textContent).not.toContain('mission.cpp')
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

    expect(screen.getByRole('heading', { name: 'That page is not on the academy map' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Return to your learning home' }).getAttribute('href')).toBe('/home')
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

  it('does not change the active language when merely browsing another course', async () => {
    window.history.replaceState({}, '', '/courses/java-foundations')

    render(<App />)

    expect(screen.getByRole('heading', { name: 'Java Foundations' })).toBeTruthy()
    expect(window.location.pathname).toBe('/courses/java-foundations')
    await waitFor(() => {
      expect(JSON.parse(window.localStorage.getItem(progressKey) ?? '{}').activeLanguage).toBe('python')
    })
  })

  it('loads Settings directly and gives every main section a real URL', () => {
    window.history.replaceState({}, '', '/settings')

    render(<App />)

    expect(screen.getByRole('heading', { name: 'Academy settings' })).toBeTruthy()
    expect(document.title).toBe('Settings | SeePoundCoffeePie')
    expect(screen.getByRole('link', { name: 'Home' }).getAttribute('href')).toBe('/home')
    expect(screen.getByRole('link', { name: 'Courses' }).getAttribute('href')).toBe('/courses')
    expect(screen.getByRole('link', { name: 'Practice' }).getAttribute('href')).toBe('/practice/python')
    expect(screen.getByRole('link', { name: 'Codebook' }).getAttribute('href')).toBe('/codebook/python')
    expect(screen.getByRole('link', { name: 'Learner record' }).getAttribute('href')).toBe('/profile')
    expect(screen.getByRole('link', { name: 'Settings' }).getAttribute('href')).toBe('/settings')
  })

  it('opens a bookmarked language school and keeps that school active', async () => {
    window.history.replaceState({}, '', '/academy/java')

    render(<App />)

    expect(screen.getByRole('heading', { name: 'Java Foundations' })).toBeTruthy()
    await waitFor(() => {
      expect(JSON.parse(window.localStorage.getItem(progressKey) ?? '{}').activeLanguage).toBe('java')
    })
  })

  it('opens an exact lesson from its canonical bookmarkable URL', () => {
    window.history.replaceState({}, '', '/learn/python-foundations/py-first-spark/py-console')

    render(<App />)

    expect(screen.getByRole('heading', { name: 'Meet the console' })).toBeTruthy()
    expect(window.location.pathname).toBe('/learn/python-foundations/py-first-spark/py-console')
    expect(document.title).toBe('Meet the console | SeePoundCoffeePie')
  })

  it('updates the canonical lesson URL and title when continuing to the next lesson', async () => {
    window.history.replaceState({}, '', '/learn/python-foundations/py-first-spark/py-console')

    render(<App />)
    fireEvent.click(screen.getByRole('radio', { name: /Shows text from the program/iu }))
    fireEvent.click(screen.getByRole('button', { name: 'Check answer' }))
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

    expect(await screen.findByRole('heading', { name: 'Send your first signal' })).toBeTruthy()
    expect(window.location.pathname).toBe('/learn/python-foundations/py-first-spark/py-print')
    await waitFor(() => {
      expect(document.title).toBe('Send your first signal | SeePoundCoffeePie')
    })
  })
})
