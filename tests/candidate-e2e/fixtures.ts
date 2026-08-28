import {
  expect,
  test as base,
  type ConsoleMessage,
  type Page,
  type Request,
  type Response,
} from '@playwright/test'

const APP_ORIGIN = 'http://127.0.0.1:4198'
const FIXED_NOW = '2026-08-27T12:00:00.000Z'
const PROGRESS_KEY = 'see-pound-coffee-pie-progress-v3'
const COMPLETION_JOURNAL_KEY = 'see-pound-coffee-pie-completed-lessons-v3'
const RESET_BARRIER_KEY = 'see-pound-coffee-pie-progress-v3-reset'

export const CPP_FOUNDATION_MISSION_IDS = [
  'cpp-reactor',
  'cpp-hull-logic',
  'cpp-cargo-array',
  'cpp-engine-loop',
  'cpp-command-function',
  'cpp-titan-forge',
] as const

export const CPP_FOUNDATION_CONCEPT_IDS = [
  'cpp-compiler',
  'cpp-output',
  'cpp-variables',
  'cpp-output-and-variables',
  'cpp-booleans',
  'cpp-conditions',
  'cpp-comparisons',
  'cpp-collections',
  'cpp-indexes',
  'cpp-collections-and-indexes',
  'cpp-loops',
  'cpp-iteration',
  'cpp-loops-and-collections',
  'cpp-functions',
  'cpp-parameters-and-calls',
  'cpp-function-order',
  'cpp-functions-and-loops',
  'cpp-program-planning',
  'cpp-capstone-assembly',
  'cpp-capstone-repair',
  'cpp-capstone',
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
  activeLanguage: 'cpp',
  callsign: 'Candidate Learner',
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

function consoleDiagnostic(message: ConsoleMessage): string {
  const location = message.location()
  const suffix = location.url ? ` (${location.url}:${location.lineNumber ?? 0})` : ''
  return `${message.text()}${suffix}`
}

function requestDiagnostic(request: Request): string {
  const failure = request.failure()
  return `${request.method()} ${request.url()}${failure ? `: ${failure.errorText}` : ''}`
}

function responseDiagnostic(response: Response): string {
  return `${response.status()} ${response.request().method()} ${response.url()}`
}

export const test = base.extend<BrowserFixtures>({
  _closedLoopbackGuard: [async ({ context, page }, use) => {
    const consoleErrors: string[] = []
    const failedRequests: string[] = []
    const failedResponses: string[] = []
    const pageErrors: string[] = []
    const unexpectedApiRequests: string[] = []
    const unexpectedExternalRequests: string[] = []

    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(consoleDiagnostic(message))
    })
    page.on('pageerror', (error) => pageErrors.push(error.message))
    page.on('requestfailed', (request) => failedRequests.push(requestDiagnostic(request)))
    page.on('response', (response) => {
      if (response.status() >= 400) failedResponses.push(responseDiagnostic(response))
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
          body: JSON.stringify({ error: 'Candidate browser tests do not call live APIs.' }),
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
    expect.soft(failedRequests, 'failed browser requests').toEqual([])
    expect.soft(failedResponses, 'HTTP error responses').toEqual([])
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
