// @vitest-environment jsdom

import { describe, expect, it, vi } from 'vitest'
import {
  createPortfolioExport,
  PORTFOLIO_HTML_MAX_BYTES,
  PORTFOLIO_INTEGRITY_NOTE,
  PORTFOLIO_SOURCE_MAX_BYTES,
  portfolioFileName,
  type PortfolioSnapshot,
} from './portfolio-export'

function snapshot(overrides: Partial<PortfolioSnapshot> = {}): PortfolioSnapshot {
  return {
    callsign: 'Careful Cadet',
    languageLabel: 'Python',
    projectTitle: 'Coffee Counter',
    subtitle: 'A small interactive ordering program.',
    description: 'The program asks a customer two questions and calculates a total.',
    outcome: 'A complete browser-saved Python program.',
    overviewSteps: [
      { title: 'Display a welcome', description: 'Use print to explain what happens next.' },
      { title: 'Read an order', description: 'Store the customer input under clear names.' },
    ],
    sourceFileName: 'coffee-counter.py',
    source: 'print("Coffee counter ready.")',
    ...overrides,
  }
}

describe('standalone portfolio export', () => {
  it('escapes hostile callsign, metadata, and source as inert text', () => {
    const hostileCallsign = '</title><script>globalThis.pwned=true</script>'
    const hostileSource = [
      '</pre><img src="https://attacker.invalid/pixel" onerror="globalThis.pwned=true">',
      '</style><link rel="stylesheet" href="https://attacker.invalid/style.css">',
      '& < > " \'',
      'https://attacker.invalid/plain-text-only',
    ].join('\n')
    const result = createPortfolioExport(snapshot({
      callsign: hostileCallsign,
      description: '<iframe src="https://attacker.invalid"></iframe>',
      source: hostileSource,
    }), 'first-interactive-program')

    expect(result.ok).toBe(true)
    if (!result.ok) return

    const document = new DOMParser().parseFromString(result.html, 'text/html')
    expect(document.querySelector('bdi')?.textContent).toBe(hostileCallsign)
    expect(document.querySelector('code')?.textContent).toBe(hostileSource)
    expect(document.querySelectorAll('script,link,img,iframe,object,embed,form,base')).toHaveLength(0)
    expect(document.querySelectorAll('a')).toHaveLength(0)
    expect([...document.querySelectorAll('*')].some((element) => (
      [...element.attributes].some((attribute) => attribute.name.toLowerCase().startsWith('on'))
    ))).toBe(false)
    expect(document.querySelector('style')?.textContent).not.toMatch(/url\s*\(|@import/iu)
    expect(result.html.indexOf('Content-Security-Policy')).toBeLessThan(result.html.indexOf('<style>'))
    expect(result.html.indexOf('name="referrer"')).toBeLessThan(result.html.indexOf('<style>'))
    expect(document.querySelector('meta[http-equiv="Content-Security-Policy"]')?.getAttribute('content')).toContain("default-src 'none'")
    expect(document.querySelector('meta[name="referrer"]')?.getAttribute('content')).toBe('no-referrer')
  })

  it('keeps the complete integrity disclosure and never calls the source verified', () => {
    const result = createPortfolioExport(snapshot(), 'first-interactive-program')
    expect(result.ok).toBe(true)
    if (!result.ok) return

    const document = new DOMParser().parseFromString(result.html, 'text/html')
    const visibleText = document.body.textContent ?? ''
    expect(visibleText).toContain(PORTFOLIO_INTEGRITY_NOTE)
    expect(visibleText).toContain('Displayed name: Careful Cadet')
    expect(visibleText).toContain('Saved code')
    expect(visibleText).not.toMatch(/callsign|current source|final source|null byte|byte portfolio limit/iu)
    expect(document.querySelector('pre')?.getAttribute('aria-label')).toBe('Saved code for coffee-counter.py')
    expect(result.html).not.toMatch(/verified source|certified|proof of skill|proof of authorship/iu)
  })

  it('enforces source byte limits without truncating multibyte text', () => {
    const exactAscii = createPortfolioExport(snapshot({ source: 'x'.repeat(PORTFOLIO_SOURCE_MAX_BYTES) }), 'first-interactive-program')
    const overAscii = createPortfolioExport(snapshot({ source: 'x'.repeat(PORTFOLIO_SOURCE_MAX_BYTES + 1) }), 'first-interactive-program')
    const exactUnicode = createPortfolioExport(snapshot({ source: 'é'.repeat(PORTFOLIO_SOURCE_MAX_BYTES / 2) }), 'first-interactive-program')
    const overUnicode = createPortfolioExport(snapshot({ source: 'é'.repeat((PORTFOLIO_SOURCE_MAX_BYTES / 2) + 1) }), 'first-interactive-program')

    expect(exactAscii.ok).toBe(true)
    expect(exactUnicode.ok).toBe(true)
    expect(overAscii).toMatchObject({ ok: false, message: 'The saved code is too large to include in a portfolio download.' })
    expect(overUnicode).toMatchObject({ ok: false, message: 'The saved code is too large to include in a portfolio download.' })
  })

  it('rejects blank source, null bytes, directional controls, unsafe callsign controls, and oversized output', () => {
    expect(createPortfolioExport(snapshot({ source: '   ' }), 'first-interactive-program')).toMatchObject({
      ok: false,
      message: 'The saved code in this browser is empty.',
    })
    expect(createPortfolioExport(snapshot({ source: 'print("safe")\0' }), 'first-interactive-program')).toMatchObject({
      ok: false,
      message: 'The saved code contains a hidden character that cannot be included safely. Remove it before downloading.',
    })
    expect(createPortfolioExport(snapshot({ source: 'print("Visual\u202espoof")' }), 'first-interactive-program')).toMatchObject({
      ok: false,
      message: 'The saved code contains hidden text formatting that changes how characters appear. Remove it before downloading.',
    })
    expect(createPortfolioExport(snapshot({ source: 'print("Visual\u2067spoof")' }), 'first-interactive-program')).toMatchObject({
      ok: false,
      message: 'The saved code contains hidden text formatting that changes how characters appear. Remove it before downloading.',
    })
    expect(createPortfolioExport(snapshot({ callsign: 'Visual\u202eSpoof' }), 'first-interactive-program')).toMatchObject({
      ok: false,
      message: 'The displayed name includes a line break or hidden character. Use one line of visible text.',
    })
    expect(createPortfolioExport(snapshot({ description: 'z'.repeat(PORTFOLIO_HTML_MAX_BYTES) }), 'first-interactive-program')).toMatchObject({
      ok: false,
      message: 'The portfolio page is too large to download safely.',
    })
  })

  it('uses plain learner-facing messages without changing the saved field names', () => {
    expect(createPortfolioExport(snapshot({ callsign: '' }), 'first-interactive-program')).toMatchObject({
      ok: false,
      message: 'Add a displayed name before preparing a portfolio page.',
    })
    expect(createPortfolioExport(snapshot(), '../private')).toMatchObject({
      ok: false,
      message: 'This project cannot be prepared as a download.',
    })

    const errors = [
      createPortfolioExport(snapshot({ callsign: '' }), 'first-interactive-program'),
      createPortfolioExport(snapshot({ source: '   ' }), 'first-interactive-program'),
      createPortfolioExport(snapshot({ source: 'print("safe")\0' }), 'first-interactive-program'),
      createPortfolioExport(snapshot({ source: 'x'.repeat(PORTFOLIO_SOURCE_MAX_BYTES + 1) }), 'first-interactive-program'),
    ]
    const visibleMessages = errors.flatMap((result) => result.ok ? [] : [result.message]).join(' ')
    expect(visibleMessages).not.toMatch(/callsign|source|final source|null byte|byte portfolio limit/iu)
  })

  it('keeps legitimate Unicode callsigns and worst-case escaped source readable', () => {
    const result = createPortfolioExport(snapshot({
      callsign: 'مريم ☕ José',
      source: '&'.repeat(PORTFOLIO_SOURCE_MAX_BYTES),
    }), 'first-interactive-program')

    expect(result.ok).toBe(true)
    if (!result.ok) return
    const document = new DOMParser().parseFromString(result.html, 'text/html')
    expect(document.querySelector('bdi')?.getAttribute('dir')).toBe('auto')
    expect(document.querySelector('bdi')?.textContent).toBe('مريم ☕ José')
    expect(document.querySelector('code')?.textContent).toBe('&'.repeat(PORTFOLIO_SOURCE_MAX_BYTES))
  })

  it('derives one bounded ASCII filename only from the allowlisted project slug', () => {
    expect(portfolioFileName('first-interactive-program')).toBe(
      'seepoundcoffeepie-first-interactive-program-portfolio.html',
    )
    expect(portfolioFileName('../private')).toBeNull()
    expect(portfolioFileName('two..dots')).toBeNull()
    expect(portfolioFileName('Capital-Letters')).toBeNull()
    expect(portfolioFileName('a'.repeat(101))).toBeNull()

    const result = createPortfolioExport(snapshot({
      callsign: '../../callsign.html',
      projectTitle: 'Title.exe',
    }), 'first-interactive-program')
    expect(result).toMatchObject({
      ok: true,
      filename: 'seepoundcoffeepie-first-interactive-program-portfolio.html',
    })
  })

  it('ignores excluded application fields and performs no browser or network writes', () => {
    const fetchMock = vi.fn()
    const localWrite = vi.fn()
    const sessionWrite = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: { setItem: localWrite },
    })
    Object.defineProperty(window, 'sessionStorage', {
      configurable: true,
      value: { setItem: sessionWrite },
    })
    const historyWrite = vi.spyOn(window.history, 'replaceState')
    const extendedSnapshot = {
      ...snapshot(),
      githubEmail: 'EXCLUDED_GITHUB_EMAIL_SENTINEL',
      accessToken: 'EXCLUDED_TOKEN_SENTINEL',
      runnerStderr: 'EXCLUDED_STDERR_SENTINEL',
      practiceInput: 'EXCLUDED_STDIN_SENTINEL',
      xp: 'EXCLUDED_XP_SENTINEL',
    }

    try {
      const result = createPortfolioExport(extendedSnapshot, 'first-interactive-program')
      expect(result.ok).toBe(true)
      if (!result.ok) return
      expect(result.html).not.toMatch(/EXCLUDED_(?:GITHUB|TOKEN|STDERR|STDIN|XP)/u)
      expect(fetchMock).not.toHaveBeenCalled()
      expect(localWrite).not.toHaveBeenCalled()
      expect(sessionWrite).not.toHaveBeenCalled()
      expect(historyWrite).not.toHaveBeenCalled()
    } finally {
      vi.unstubAllGlobals()
      vi.restoreAllMocks()
    }
  })
})
