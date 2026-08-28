import {
  expect,
  test as base,
  type ConsoleMessage,
  type Page,
} from '@playwright/test'

const APP_ORIGIN = 'http://127.0.0.1:4197'
const FIXED_NOW = '2026-08-27T12:00:00.000Z'
const PROGRESS_KEY = 'see-pound-coffee-pie-progress-v3'
const COMPLETION_JOURNAL_KEY = 'see-pound-coffee-pie-completed-lessons-v3'
const RESET_BARRIER_KEY = 'see-pound-coffee-pie-progress-v3-reset'

export const PYTHON_FOUNDATION_MISSION_IDS = [
  'py-first-spark',
  'py-signal-protocol',
  'py-cargo-logic',
  'py-looping-orbit',
  'py-function-foundry',
  'py-void-wyrm',
] as const

interface ConceptProgressRecord {
  correct: number
  dueAt: string
  incorrect: number
  strength: number
}

export interface BrowserProgress {
  activeLanguage: 'python' | 'cpp' | 'csharp' | 'java'
  callsign: string
  completedLessons: string[]
  completedMissions: string[]
  completedProjectCheckpoints: string[]
  completedProjects: string[]
  conceptProgress: Record<string, ConceptProgressRecord>
  dailyGoal: number
  dailyXp: number
  dailyXpDate: string | null
  lastStudyDate: string | null
  onboardingComplete: boolean
  starShards: number
  streak: number
  xp: number
}

type ProgressOverrides = Partial<BrowserProgress>
type SeedProgress = (overrides?: ProgressOverrides) => Promise<void>

interface BrowserFixtures {
  _closedLoopbackGuard: void
  _fixedClock: void
  seedProgress: SeedProgress
}

const baseProgress: BrowserProgress = {
  activeLanguage: 'python',
  callsign: 'Browser Learner',
  completedLessons: [],
  completedMissions: [],
  completedProjectCheckpoints: [],
  completedProjects: [],
  conceptProgress: {},
  dailyGoal: 10,
  dailyXp: 0,
  dailyXpDate: null,
  lastStudyDate: null,
  onboardingComplete: true,
  starShards: 0,
  streak: 0,
  xp: 0,
}

function diagnostic(message: ConsoleMessage): string {
  const location = message.location()
  const suffix = location.url ? ` (${location.url}:${location.lineNumber ?? 0})` : ''
  return `${message.text()}${suffix}`
}

export const test = base.extend<BrowserFixtures>({
  _closedLoopbackGuard: [async ({ context, page }, use) => {
    const unexpectedApiRequests: string[] = []
    const unexpectedExternalRequests: string[] = []
    const pageErrors: string[] = []
    const consoleErrors: string[] = []

    page.on('pageerror', (error) => pageErrors.push(error.message))
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(diagnostic(message))
    })

    await context.route('**/*', async (route) => {
      const request = route.request()
      let url: URL
      try {
        url = new URL(request.url())
      } catch {
        unexpectedExternalRequests.push(`${request.method()} ${request.url()}`)
        await route.abort('blockedbyclient')
        return
      }

      if (url.origin !== APP_ORIGIN) {
        unexpectedExternalRequests.push(`${request.method()} ${url.origin}${url.pathname}`)
        await route.abort('blockedbyclient')
        return
      }

      if (url.pathname === '/api/auth/session' && request.method() === 'GET') {
        await route.fulfill({
          body: JSON.stringify({ authenticated: false, user: null }),
          contentType: 'application/json',
          status: 200,
        })
        return
      }

      if (url.pathname.startsWith('/api/')) {
        unexpectedApiRequests.push(`${request.method()} ${url.pathname}`)
        await route.fulfill({
          body: JSON.stringify({ error: 'Browser acceptance tests do not call live APIs.' }),
          contentType: 'application/json',
          status: 503,
        })
        return
      }

      await route.continue()
    })

    await use()

    expect.soft(unexpectedApiRequests, 'unexpected API requests').toEqual([])
    expect.soft(unexpectedExternalRequests, 'unexpected external-origin requests').toEqual([])
    expect.soft(pageErrors, 'uncaught page errors').toEqual([])
    expect.soft(consoleErrors, 'browser console errors').toEqual([])
  }, { auto: true }],

  _fixedClock: [async ({ page }, use) => {
    await page.clock.setFixedTime(FIXED_NOW)
    await use()
  }, { auto: true }],

  seedProgress: async ({ page }, use) => {
    await use(async (overrides = {}) => {
      const progress: BrowserProgress = {
        ...baseProgress,
        ...overrides,
        completedLessons: [...(overrides.completedLessons ?? baseProgress.completedLessons)],
        completedMissions: [...(overrides.completedMissions ?? baseProgress.completedMissions)],
        completedProjectCheckpoints: [
          ...(overrides.completedProjectCheckpoints ?? baseProgress.completedProjectCheckpoints),
        ],
        completedProjects: [...(overrides.completedProjects ?? baseProgress.completedProjects)],
        conceptProgress: {
          ...baseProgress.conceptProgress,
          ...overrides.conceptProgress,
        },
      }

      await page.addInitScript(({ completionJournalKey, progressKey, progressRecord, resetBarrierKey }) => {
        window.localStorage.clear()
        window.sessionStorage.clear()
        window.localStorage.setItem('spcp-theme', 'workshop')
        window.localStorage.setItem(resetBarrierKey, JSON.stringify({ version: 1, active: true }))
        window.localStorage.setItem(progressKey, JSON.stringify(progressRecord))
        window.localStorage.setItem(
          completionJournalKey,
          JSON.stringify(progressRecord.completedLessons),
        )
      }, {
        completionJournalKey: COMPLETION_JOURNAL_KEY,
        progressKey: PROGRESS_KEY,
        progressRecord: progress,
        resetBarrierKey: RESET_BARRIER_KEY,
      })
    })
  },
})

export { expect, type Page }
