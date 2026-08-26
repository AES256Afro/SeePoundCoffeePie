// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { javaPicnicProject } from './data/java-picnic-project'
import { trackById } from './data/curriculum'
import { saveProjectDraft } from './lib/project-drafts'
import { initialProgress } from './lib/progress'
import { runExercise } from './lib/runner-client'

vi.mock('./lib/runner-client', () => ({
  runExercise: vi.fn(async () => ({
    version: 1,
    runId: 'run_java_ui_12345678901234567',
    outcome: 'completed',
    stdout: [
      'What is your name?',
      'How many guests are coming?',
      'Table: Large',
      'Supply: Blankets',
      'Supply: Cups',
      'Supply: Napkins',
      'Picnic: Alex Kim | Guests: 10',
    ].join('\n'),
    stderr: '',
    exitCode: 0,
    durationMs: 24,
    truncated: false,
    limit: null,
    tests: [],
    diagnostic: {
      title: 'Program finished',
      explanation: 'The Java program ran.',
      suggestion: 'Continue when the output looks right.',
      line: null,
    },
  })),
}))

const progressKey = 'see-pound-coffee-pie-progress'
const javaMissionIds = trackById('java').missions.map((mission) => mission.id)

const completedSource = [
  'import java.util.Scanner;',
  '',
  'public class Main {',
  '    static void printPicnic(String name, int guests) {',
  '        System.out.println("Picnic: " + name + " | Guests: " + guests);',
  '    }',
  '',
  '    public static void main(String[] args) {',
  '        Scanner scanner = new Scanner(System.in);',
  '        String[] supplies = { "Blankets", "Cups", "Napkins" };',
  '',
  '        System.out.println("What is your name?");',
  '        String guestName = scanner.nextLine();',
  '',
  '        System.out.println("How many guests are coming?");',
  '        int guestCount = Integer.parseInt(scanner.nextLine());',
  '',
  '        if (guestCount >= 8) {',
  '            System.out.println("Table: Large");',
  '        } else {',
  '            System.out.println("Table: Small");',
  '        }',
  '',
  '        for (String supply : supplies) {',
  '            System.out.println("Supply: " + supply);',
  '        }',
  '',
  '        printPicnic(guestName, guestCount);',
  '    }',
  '}',
].join('\n')

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

function saveJavaGraduate(overrides: Partial<ReturnType<typeof initialProgress>> = {}) {
  window.localStorage.setItem(progressKey, JSON.stringify({
    ...initialProgress('java'),
    callsign: 'Picnic Graduate',
    onboardingComplete: true,
    completedMissions: javaMissionIds,
    ...overrides,
  }))
}

describe('Java guided project UI', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: createMemoryStorage(),
    })
    Object.defineProperty(window, 'scrollTo', {
      configurable: true,
      value: vi.fn(),
    })
    window.history.replaceState({}, '', '/projects/java/picnic-planner')
    saveJavaGraduate()
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ authenticated: false, user: null })))
  })

  afterEach(() => {
    cleanup()
    window.history.replaceState({}, '', '/')
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('opens the unlocked Java overview with its identity and twelve-step plan', async () => {
    render(<App />)

    expect(await screen.findByRole('heading', { level: 1, name: 'Community Picnic Planner' })).toBeTruthy()
    expect(screen.getByText('Java project studio')).toBeTruthy()
    expect(screen.getByText('12 checkpoints')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Java Foundations' }).getAttribute('href')).toBe('/courses/java-foundations')
    expect(screen.getByRole('link', { name: /Start project/iu }).getAttribute('href')).toBe(
      '/projects/java/picnic-planner/project-java-build-path',
    )

    const checkpointHeading = screen.getByRole('heading', { name: 'Twelve small checkpoints' })
    const checkpointSection = checkpointHeading.closest('section')
    expect(checkpointSection).not.toBeNull()
    expect(within(checkpointSection!).getAllByRole('listitem')).toHaveLength(12)
    expect(screen.getByRole('progressbar', { name: 'Project progress' }).getAttribute('aria-valuetext')).toBe(
      '0 of 12 checkpoints complete',
    )
    expect(document.title).toBe('Community Picnic Planner | SeePoundCoffeePie')
  })

  it('keeps the editor locked until Java Foundations is complete', async () => {
    window.localStorage.setItem(progressKey, JSON.stringify({
      ...initialProgress('java'),
      callsign: 'New Java Learner',
      onboardingComplete: true,
    }))

    render(<App />)

    expect(await screen.findByRole('heading', {
      level: 1,
      name: 'Community Picnic Planner',
    })).toBeTruthy()
    expect(screen.getByRole('heading', {
      name: 'Finish Java Foundations, then plan a community picnic.',
    })).toBeTruthy()
    expect(screen.queryByRole('textbox', { name: 'Project code editor' })).toBeNull()
    expect(screen.getByRole('link', { name: /Continue Java Foundations/iu }).getAttribute('href')).toBe(
      '/courses/java-foundations',
    )
  })

  it('opens the unlocked final deep link and sends Run to the Java runner', async () => {
    const priorCheckpoints = javaPicnicProject.checkpoints.slice(0, -1).map((checkpoint) => checkpoint.id)
    saveJavaGraduate({ completedProjectCheckpoints: priorCheckpoints })
    window.history.replaceState({}, '', '/projects/java/picnic-planner/project-java-final')

    render(<App />)

    const heading = await screen.findByRole('heading', { level: 1, name: 'Plan the Community Picnic' })
    await waitFor(() => expect(document.activeElement).toBe(heading))
    expect(screen.getByText('Java project studio')).toBeTruthy()
    expect(screen.getByText('Main.java')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Download .java' })).toBeTruthy()
    expect(screen.getByText('Practice console')).toBeTruthy()

    const checkpointNavigation = screen.getByRole('navigation', { name: 'Project checkpoints' })
    expect(within(checkpointNavigation).getAllByRole('link')).toHaveLength(12)
    expect(within(checkpointNavigation).getByRole('link', {
      name: 'Checkpoint 12: Plan the Community Picnic',
    }).getAttribute('aria-current')).toBe('step')
    expect(screen.getByRole('progressbar', { name: 'Checkpoint progress' }).getAttribute('aria-valuetext')).toBe(
      'Checkpoint 12 of 12',
    )
    expect((screen.getByRole('textbox', { name: 'Practice program input' }) as HTMLTextAreaElement).value).toBe(
      'Alex Kim\n10\n',
    )

    fireEvent.click(screen.getByRole('button', { name: 'Run' }))

    expect(await screen.findByText(/Picnic: Alex Kim \| Guests: 10/u, { selector: 'pre' })).toBeTruthy()
    expect(vi.mocked(runExercise)).toHaveBeenCalledWith(
      'project-java-final',
      'java',
      expect.stringContaining('import java.util.Scanner;'),
      expect.any(Function),
      { purpose: 'run', stdin: 'Alex Kim\n10\n' },
    )
    expect(document.title).toBe('Plan the Community Picnic | SeePoundCoffeePie')
  })

  it('downloads the completed final draft as Main.java with the Java MIME type', async () => {
    saveJavaGraduate({
      completedProjectCheckpoints: javaPicnicProject.checkpoints.map((checkpoint) => checkpoint.id),
      completedProjects: [javaPicnicProject.id],
    })
    expect(saveProjectDraft(
      javaPicnicProject.id,
      'project-java-final',
      completedSource,
      window.localStorage,
    )).toBe(true)

    const createObjectUrl = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:java-project')
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)
    let downloadedFileName = ''
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function captureDownload(this: HTMLAnchorElement) {
      downloadedFileName = this.download
    })

    render(<App />)

    const downloadButton = await screen.findByRole('button', { name: 'Download your program' })
    expect(screen.getByRole('progressbar', { name: 'Project progress' }).getAttribute('aria-valuenow')).toBe('100')
    fireEvent.click(downloadButton)

    expect(downloadedFileName).toBe('Main.java')
    expect(createObjectUrl).toHaveBeenCalledTimes(1)
    const downloadedBlob = createObjectUrl.mock.calls[0]?.[0]
    expect(downloadedBlob).toBeInstanceOf(Blob)
    expect((downloadedBlob as Blob).type).toBe('text/x-java-source;charset=utf-8')
  })
})
