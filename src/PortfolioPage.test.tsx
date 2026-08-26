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

describe('browser-local portfolio preview', () => {
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

  it('keeps an unfinished project unavailable and links to its first unfinished checkpoint', async () => {
    saveProgress({ completedProjectCheckpoints: checkpointIds.slice(0, 3) })

    render(<App />)

    const heading = await screen.findByRole('heading', { name: 'Your First Interactive Program portfolio preview' })
    await waitFor(() => expect(document.activeElement).toBe(heading))
    expect(screen.getByRole('heading', { name: 'Finish the project before preparing a portfolio copy.' })).toBeTruthy()
    expect(screen.getByText('3 of 12 checkpoints are complete in this learner record. A draft or bookmark alone does not count as completion.')).toBeTruthy()
    expect(screen.getByRole('link', { name: /Resume the project/iu }).getAttribute('href')).toBe(
      `/projects/python/first-interactive-program/${checkpointIds[3]}`,
    )
    expect(screen.queryByRole('button', { name: 'Download portfolio page' })).toBeNull()
  })

  it('explains why a synchronized completion without local source cannot be exported', async () => {
    saveProgress({
      completedProjectCheckpoints: checkpointIds,
      completedProjects: [pythonInteractiveProject.id],
    })

    render(<App />)

    expect(await screen.findByRole('heading', {
      name: 'This browser has the completion record, but not the final source.',
    })).toBeTruthy()
    expect(screen.getByText(/Project source is intentionally not synchronized between browsers/iu)).toBeTruthy()
    expect(screen.getByRole('link', { name: /Open the final checkpoint/iu }).getAttribute('href')).toBe(
      `/projects/python/first-interactive-program/${finalCheckpoint.id}`,
    )
  })

  it('previews current source and downloads only after an explicit disclosure confirmation', async () => {
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

    const heading = await screen.findByRole('heading', { name: 'Your First Interactive Program portfolio preview' })
    const portfolioPage = heading.closest('main')
    expect(portfolioPage).not.toBeNull()
    expect(document.title).toBe('Your First Interactive Program Portfolio | SeePoundCoffeePie')
    expect(screen.getByText(/Sharing or bookmarking this URL shares only the route/iu)).toBeTruthy()
    expect(screen.getByText(/may be different from the source used during the last check/iu)).toBeTruthy()
    expect(screen.getByText(/The app does not add your GitHub login/iu)).toBeTruthy()
    expect(screen.getByText(/callsign and source are included exactly as shown/iu)).toBeTruthy()
    expect(screen.getByLabelText(`Final source for ${pythonInteractiveProject.downloadFileName}`).textContent).toBe(finalSource)
    expect(screen.getAllByText(/not a certificate/iu).length).toBeGreaterThan(0)
    expect(within(portfolioPage!).queryByText('9,999')).toBeNull()
    expect(within(portfolioPage!).queryByText('365')).toBeNull()

    const downloadButton = screen.getByRole('button', { name: 'Download portfolio page' }) as HTMLButtonElement
    expect(downloadButton.disabled).toBe(true)
    expect(click).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('checkbox', { name: /I reviewed the callsign and source/iu }))
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
    expect(screen.getByRole('status').textContent).toContain('Your browser started the download')
    expect(document.activeElement).toBe(downloadButton)
  })

  it('requires a new confirmation when the reviewed callsign changes', () => {
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
    const confirmation = screen.getByRole('checkbox', { name: /I reviewed the callsign and source/iu }) as HTMLInputElement
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

    expect((screen.getByRole('checkbox', { name: /I reviewed the callsign and source/iu }) as HTMLInputElement).checked).toBe(false)
    expect((screen.getByRole('button', { name: 'Download portfolio page' }) as HTMLButtonElement).disabled).toBe(true)
  })
})
