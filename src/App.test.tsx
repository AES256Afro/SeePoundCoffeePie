// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { dateKey, initialProgress } from './lib/progress'
import { serializeProgressBackup } from './lib/progress-backup'

const progressKey = 'see-pound-coffee-pie-progress'

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
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  async function openFirstEditableStep() {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Start First Spark' }))
    fireEvent.click(screen.getByRole('button', { name: /Shows text from the program/iu }))
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
    expect(editor.getAttribute('aria-keyshortcuts')).toBe('Control+Enter Meta+Enter')
  })

  it('keeps Tab available for normal keyboard navigation', async () => {
    const editor = await openFirstEditableStep()
    const tabWasNotCancelled = fireEvent.keyDown(editor, { key: 'Tab' })

    expect(tabWasNotCancelled).toBe(true)
    expect(screen.getByLabelText('Code editor keyboard controls').textContent).toContain('Tab moves out of the editor normally')
    await waitFor(() => {
      expect((screen.getByRole('button', { name: 'Sign in' }) as HTMLButtonElement).disabled).toBe(false)
    })
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

    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Practice bay' }))

    const reviewButton = screen.getByRole('button', { name: 'Review Routing Orders' })
    expect(screen.getByText('BEST MATCH · MISSION 02')).toBeTruthy()
    fireEvent.click(reviewButton)

    expect(await screen.findByRole('heading', { name: 'Ask a routing question' })).toBeTruthy()
    expect(screen.getByText('FOCUSED REVIEW · 1 OF 1')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: /^A true and falseJava writes/iu }))
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

  it('restores a validated local progress backup from the Cadet Record', async () => {
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
    fireEvent.click(screen.getByRole('button', { name: 'Cadet record' }))
    fireEvent.change(screen.getByLabelText('Choose progress backup file'), {
      target: { files: [backup] },
    })

    expect(await screen.findByRole('heading', { name: 'Restored Cadet' })).toBeTruthy()
    expect(screen.getAllByText('140').length).toBeGreaterThan(0)
    expect(screen.getByText(/Progress restored from the backup created/iu)).toBeTruthy()
    await waitFor(() => {
      expect(JSON.parse(window.localStorage.getItem(progressKey) ?? '{}')).toMatchObject(restored)
    })
  })
})
