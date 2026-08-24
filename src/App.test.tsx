// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { dateKey, initialProgress } from './lib/progress'

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

    expect(await screen.findByRole('heading', { name: 'Read the galley count' })).toBeTruthy()
  })
})
