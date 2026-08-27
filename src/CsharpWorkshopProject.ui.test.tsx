// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { csharpWorkshopProject } from './data/csharp-workshop-project'
import { trackById } from './data/curriculum'
import { saveProjectDraft } from './lib/project-drafts'
import { initialProgress } from './lib/progress'
import { runExercise } from './lib/runner-client'

vi.mock('./lib/runner-client', () => ({
  runExercise: vi.fn(async () => ({
    version: 1,
    runId: 'run_csharp_ui_123456789012345',
    outcome: 'completed',
    stdout: [
      'What is your name?',
      'How many visits have you completed?',
      'Access: Member',
      'Area: Studio',
      'Area: Lab',
      'Area: Library',
      'Badge: Alex Kim | Visits: 4',
    ].join('\n'),
    stderr: '',
    exitCode: 0,
    durationMs: 22,
    truncated: false,
    limit: null,
    tests: [],
    diagnostic: {
      title: 'Program finished',
      explanation: 'The C# program ran.',
      suggestion: 'Continue when the output looks right.',
      line: null,
    },
  })),
}))

const progressKey = 'see-pound-coffee-pie-progress'
const csharpMissionIds = trackById('csharp').missions.map((mission) => mission.id)

const completedSource = [
  'using System;',
  '',
  'void PrintBadge(string name, int visits)',
  '{',
  '    Console.WriteLine($"Badge: {name} | Visits: {visits}");',
  '}',
  '',
  'string[] areas = { "Studio", "Lab", "Library" };',
  '',
  'Console.WriteLine("What is your name?");',
  'string guestName = Console.ReadLine() ?? "";',
  '',
  'Console.WriteLine("How many visits have you completed?");',
  'int visitCount = int.Parse(Console.ReadLine() ?? "0");',
  '',
  'if (visitCount >= 3)',
  '{',
  '    Console.WriteLine("Access: Member");',
  '}',
  'else',
  '{',
  '    Console.WriteLine("Access: Guest");',
  '}',
  '',
  'foreach (string area in areas)',
  '{',
  '    Console.WriteLine($"Area: {area}");',
  '}',
  '',
  'PrintBadge(guestName, visitCount);',
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

function saveCsharpGraduate(overrides: Partial<ReturnType<typeof initialProgress>> = {}) {
  window.localStorage.setItem(progressKey, JSON.stringify({
    ...initialProgress('csharp'),
    callsign: 'Workshop Graduate',
    onboardingComplete: true,
    completedMissions: csharpMissionIds,
    ...overrides,
  }))
}

describe('C# guided project UI', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: createMemoryStorage(),
    })
    Object.defineProperty(window, 'scrollTo', {
      configurable: true,
      value: vi.fn(),
    })
    window.history.replaceState({}, '', '/projects/csharp/workshop-check-in')
    saveCsharpGraduate()
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ authenticated: false, user: null })))
  })

  afterEach(() => {
    cleanup()
    window.history.replaceState({}, '', '/')
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('opens the unlocked C# overview with its identity and twelve-step plan', async () => {
    render(<App />)

    expect(await screen.findByRole('heading', { level: 1, name: 'Community Workshop Check-In' })).toBeTruthy()
    expect(screen.getByText('12 steps')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'C# Foundations' }).getAttribute('href')).toBe('/courses/csharp-foundations')
    expect(screen.getByRole('link', { name: /Start project/iu }).getAttribute('href')).toBe(
      '/projects/csharp/workshop-check-in/project-csharp-dotnet-path',
    )

    const checkpointHeading = screen.getByRole('heading', { name: '12 project steps' })
    const checkpointSection = checkpointHeading.closest('section')
    expect(checkpointSection).not.toBeNull()
    expect(within(checkpointSection!).getAllByRole('listitem')).toHaveLength(12)
    expect(screen.getByRole('progressbar', { name: 'Project progress' }).getAttribute('aria-valuetext')).toBe(
      '0 of 12 steps complete',
    )
    expect(document.title).toBe('Community Workshop Check-In | SeePoundCoffeePie')
  })

  it('opens the unlocked final deep link in the C# editor and sends Run to the C# runner', async () => {
    const priorCheckpoints = csharpWorkshopProject.checkpoints.slice(0, -1).map((checkpoint) => checkpoint.id)
    saveCsharpGraduate({ completedProjectCheckpoints: priorCheckpoints })
    window.history.replaceState({}, '', '/projects/csharp/workshop-check-in/project-csharp-final')

    render(<App />)

    const heading = await screen.findByRole('heading', { level: 1, name: 'Open the Community Workshop' })
    await waitFor(() => expect(document.activeElement).toBe(heading))
    expect(screen.getByText('community-workshop-check-in.cs')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Download .cs' })).toBeTruthy()
    expect(screen.getByText('Run output')).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'New terms' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Explanation' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Requirements' })).toBeTruthy()
    expect(screen.getByText('Task')).toBeTruthy()

    const checkpointNavigation = screen.getByRole('navigation', { name: 'Project steps' })
    expect(within(checkpointNavigation).getAllByRole('link')).toHaveLength(12)
    expect(within(checkpointNavigation).getByRole('link', {
      name: /Step 12: Open the Community Workshop.*Current step, not complete/iu,
    }).getAttribute('aria-current')).toBe('step')
    expect(screen.getByRole('progressbar', { name: 'Project completion' }).getAttribute('aria-valuetext')).toBe(
      '11 of 12 steps complete',
    )
    expect(screen.getByText('Step 12 of 12')).toBeTruthy()
    expect((screen.getByRole('textbox', { name: 'Run input' }) as HTMLTextAreaElement).value).toBe(
      'Alex Kim\n4\n',
    )

    fireEvent.click(screen.getByRole('button', { name: 'Run' }))

    expect(await screen.findByText(/Badge: Alex Kim \| Visits: 4/u, { selector: 'pre' })).toBeTruthy()
    expect(vi.mocked(runExercise)).toHaveBeenCalledWith(
      'project-csharp-final',
      'csharp',
      expect.stringContaining('using System;'),
      expect.any(Function),
      { purpose: 'run', stdin: 'Alex Kim\n4\n' },
    )
    expect(document.title).toBe('Open the Community Workshop | SeePoundCoffeePie')
  })

  it('downloads the completed final draft with the C# filename and MIME type', async () => {
    saveCsharpGraduate({
      completedProjectCheckpoints: csharpWorkshopProject.checkpoints.map((checkpoint) => checkpoint.id),
      completedProjects: [csharpWorkshopProject.id],
    })
    expect(saveProjectDraft(
      csharpWorkshopProject.id,
      'project-csharp-final',
      completedSource,
      window.localStorage,
    )).toBe(true)

    const createObjectUrl = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:csharp-project')
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)
    let downloadedFileName = ''
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function captureDownload(this: HTMLAnchorElement) {
      downloadedFileName = this.download
    })

    render(<App />)

    const downloadButton = await screen.findByRole('button', { name: 'Download community-workshop-check-in.cs' })
    expect(screen.getByRole('link', { name: /Review project/iu })).toBeTruthy()
    expect(screen.queryByRole('link', { name: /Continue project/iu })).toBeNull()
    expect(screen.getByRole('link', { name: /Prepare portfolio page/iu }).getAttribute('href')).toBe(
      '/portfolio/csharp/workshop-check-in',
    )
    expect(screen.getByRole('progressbar', { name: 'Project progress' }).getAttribute('aria-valuenow')).toBe('100')
    fireEvent.click(downloadButton)

    expect(downloadedFileName).toBe('community-workshop-check-in.cs')
    expect(createObjectUrl).toHaveBeenCalledTimes(1)
    const downloadedBlob = createObjectUrl.mock.calls[0]?.[0]
    expect(downloadedBlob).toBeInstanceOf(Blob)
    expect((downloadedBlob as Blob).type).toBe('text/x-csharp;charset=utf-8')
  })
})
