// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { PortfolioPage } from './PortfolioPage'
import { pythonInteractiveProject } from './data/python-interactive-project'
import { trackById } from './data/curriculum'
import { saveProjectDraft } from './lib/project-drafts'
import { initialProgress } from './lib/progress'

const progressKey = 'see-pound-coffee-pie-progress'
const portfolioPath = '/portfolio/python/first-interactive-program'
const pythonMissionIds = trackById('python').missions.map((mission) => mission.id)
const checkpointIds = pythonInteractiveProject.checkpoints.map((checkpoint) => checkpoint.id)
const finalCheckpoint = pythonInteractiveProject.checkpoints.at(-1)!
const finalSource = [
  'print("Welcome to the Coffee Counter!")',
  'name = input("What is your name?")',
  'cups = int(input("How many cups would you like?"))',
  'print(f"{name}, your {cups} cup order costs ${cups * 3}.")',
].join('\n')

function createMemoryStorage(): Storage {
  const values = new Map<string, string>()
  return {
    get length() { return values.size },
    clear() { values.clear() },
    getItem(key) { return values.get(key) ?? null },
    key(index) { return [...values.keys()][index] ?? null },
    removeItem(key) { values.delete(key) },
    setItem(key, value) { values.set(key, String(value)) },
  }
}

describe('portfolio page privacy and download', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: createMemoryStorage(),
    })
    Object.defineProperty(window, 'sessionStorage', {
      configurable: true,
      value: createMemoryStorage(),
    })
    window.localStorage.clear()
    window.sessionStorage.clear()
    window.history.replaceState({}, '', portfolioPath)
    Object.defineProperty(window, 'scrollTo', {
      configurable: true,
      value: vi.fn(),
    })
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ authenticated: false, user: null })))
  })

  afterEach(() => {
    cleanup()
    window.localStorage.clear()
    window.sessionStorage.clear()
    window.history.replaceState({}, '', '/')
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  function saveProgress(overrides: Record<string, unknown> = {}) {
    window.localStorage.setItem(progressKey, JSON.stringify({
      ...initialProgress('python'),
      callsign: 'Portfolio Cadet',
      onboardingComplete: true,
      completedMissions: pythonMissionIds,
      ...overrides,
    }))
  }

  it('keeps an unfinished project unavailable and links to its first unfinished step', async () => {
    saveProgress({ completedProjectCheckpoints: checkpointIds.slice(0, 3) })

    render(<App />)

    const heading = await screen.findByRole('heading', { name: 'Your First Interactive Program portfolio' })
    await waitFor(() => expect(document.activeElement).toBe(heading))
    expect(screen.getByRole('heading', { name: 'Finish the project before preparing a portfolio copy.' })).toBeTruthy()
    expect(screen.getByText('3 of 12 steps are complete. A saved draft or bookmark does not finish a step.')).toBeTruthy()
    expect(screen.getByRole('link', { name: /Resume the project/iu }).getAttribute('href')).toBe(
      `/projects/python/first-interactive-program/${checkpointIds[3]}`,
    )
    expect(screen.queryByRole('button', { name: 'Download portfolio page' })).toBeNull()
  })

  it('explains why a finished project without code in this browser cannot be downloaded', async () => {
    saveProgress({
      completedProjectCheckpoints: checkpointIds,
      completedProjects: [pythonInteractiveProject.id],
    })

    render(<App />)

    expect(await screen.findByRole('heading', {
      name: 'This browser knows the project is complete, but it does not have your final code.',
    })).toBeTruthy()
    expect(screen.getByText(/Project code is saved only in the browser where you wrote it/iu)).toBeTruthy()
    expect(screen.getByRole('link', { name: /Open the final step/iu }).getAttribute('href')).toBe(
      `/projects/python/first-interactive-program/${finalCheckpoint.id}`,
    )
  })

  it('previews current code and downloads only after an explicit disclosure confirmation', async () => {
    saveProgress({
      completedProjectCheckpoints: checkpointIds,
      completedProjects: [pythonInteractiveProject.id],
      xp: 9_999,
      streak: 365,
    })
    expect(saveProjectDraft(pythonInteractiveProject.id, finalCheckpoint.id, finalSource)).toBe(true)
    const createObjectUrl = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:portfolio')
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)
    let downloadedFileName = ''
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function capture(this: HTMLAnchorElement) {
      downloadedFileName = this.download
    })

    render(<App />)

    const heading = await screen.findByRole('heading', { name: 'Your First Interactive Program portfolio' })
    const portfolioPage = heading.closest('main')
    expect(portfolioPage).not.toBeNull()
    expect(document.title).toBe('Your First Interactive Program Portfolio | SeePoundCoffeePie')
    expect(screen.queryByText('Portfolio preview')).toBeNull()
    expect(screen.getByText(/Sharing or bookmarking this address does not share your code/iu)).toBeTruthy()
    expect(screen.getByText(/may differ from the code used in your last check/iu)).toBeTruthy()
    const technicalDetails = screen.getByText('Technical privacy details').closest('details') as HTMLDetailsElement | null
    expect(technicalDetails).not.toBeNull()
    expect(technicalDetails?.open).toBe(false)
    expect(within(technicalDetails!).getByText(/The app does not add your GitHub login/iu)).toBeTruthy()
    expect(within(technicalDetails!).getByText(/displayed name and code are included exactly as shown/iu)).toBeTruthy()
    expect(screen.getByLabelText(`Code for ${pythonInteractiveProject.downloadFileName}`).textContent).toBe(finalSource)
    expect(screen.getAllByText(/not a certificate/iu).length).toBeGreaterThan(0)
    expect(within(portfolioPage!).queryByText('9,999')).toBeNull()
    expect(within(portfolioPage!).queryByText('365')).toBeNull()

    const downloadButton = screen.getByRole('button', { name: 'Download portfolio page' }) as HTMLButtonElement
    expect(downloadButton.disabled).toBe(true)
    expect(click).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('checkbox', { name: /I reviewed the displayed name and code/iu }))
    expect(downloadButton.disabled).toBe(false)

    const fetchMock = vi.mocked(fetch)
    fetchMock.mockClear()
    const localWrite = vi.spyOn(window.localStorage, 'setItem')
    downloadButton.focus()
    fireEvent.click(downloadButton)

    expect(fetchMock).not.toHaveBeenCalled()
    expect(localWrite).not.toHaveBeenCalled()
    expect(createObjectUrl).toHaveBeenCalledOnce()
    expect(downloadedFileName).toBe('seepoundcoffeepie-first-interactive-program-portfolio.html')
    expect(screen.getByRole('status').textContent).toContain('Your download started')
    expect(document.activeElement).toBe(downloadButton)
  })

  it('requires a new confirmation when the displayed name changes', () => {
    expect(saveProjectDraft(pythonInteractiveProject.id, finalCheckpoint.id, finalSource)).toBe(true)
    const progress = {
      ...initialProgress('python'),
      callsign: 'First Callsign',
      onboardingComplete: true,
      completedMissions: pythonMissionIds,
      completedProjectCheckpoints: checkpointIds,
      completedProjects: [pythonInteractiveProject.id],
    }
    const { rerender } = render(
      <PortfolioPage
        language="python"
        onNavigate={vi.fn()}
        progress={progress}
        projectId={pythonInteractiveProject.id}
      />,
    )
    const confirmation = screen.getByRole('checkbox', { name: /I reviewed the displayed name and code/iu }) as HTMLInputElement
    const downloadButton = screen.getByRole('button', { name: 'Download portfolio page' }) as HTMLButtonElement

    fireEvent.click(confirmation)
    expect(confirmation.checked).toBe(true)
    expect(downloadButton.disabled).toBe(false)

    rerender(
      <PortfolioPage
        language="python"
        onNavigate={vi.fn()}
        progress={{ ...progress, callsign: 'Synced Callsign' }}
        projectId={pythonInteractiveProject.id}
      />,
    )

    expect((screen.getByRole('checkbox', { name: /I reviewed the displayed name and code/iu }) as HTMLInputElement).checked).toBe(false)
    expect((screen.getByRole('button', { name: 'Download portfolio page' }) as HTMLButtonElement).disabled).toBe(true)
  })

  it('uses displayed name and code wording when the portfolio copy cannot be prepared', () => {
    expect(saveProjectDraft(pythonInteractiveProject.id, finalCheckpoint.id, finalSource)).toBe(true)

    render(
      <PortfolioPage
        language="python"
        onNavigate={vi.fn()}
        progress={{
          ...initialProgress('python'),
          callsign: '',
          onboardingComplete: true,
          completedMissions: pythonMissionIds,
          completedProjectCheckpoints: checkpointIds,
          completedProjects: [pythonInteractiveProject.id],
        }}
        projectId={pythonInteractiveProject.id}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Check your saved code first.' })).toBeTruthy()
    expect(screen.getByText('Add a displayed name before preparing a portfolio page.')).toBeTruthy()
    expect(screen.queryByText(/callsign/iu)).toBeNull()
  })
})
