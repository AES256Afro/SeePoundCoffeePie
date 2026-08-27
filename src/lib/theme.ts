export type ThemeId = 'workshop' | 'hex' | 'terminal' | 'schematic'

const STORAGE_KEY = 'spcp-theme'
const DEFAULT_THEME: ThemeId = 'workshop'

const VALID_THEMES: ThemeId[] = ['workshop', 'hex', 'terminal', 'schematic']

const THEME_CSS: Record<Exclude<ThemeId, 'workshop'>, string> = {
  hex: '[data-theme="hex"]{--paper:#0a0a0f;--paper-deep:#111118;--surface:#161620;--surface-muted:#0c0c14;--ink:#e8ecf1;--muted:#5a6070;--rule:rgba(94,234,212,0.08);--rule-strong:rgba(94,234,212,0.15);--teal:#5eead4;--teal-dark:#3cc9b3;--teal-soft:rgba(94,234,212,0.08);--amber:#f0a050;--amber-soft:rgba(240,160,80,0.08);--brick:#ff6b6b;--brick-soft:rgba(255,107,107,0.08);--violet:#b967ff;--violet-soft:rgba(185,103,255,0.08);--code:#0f0f16;--code-muted:#1a1a24;--code-text:#c8cdd5;--shadow:0 12px 32px rgba(0,0,0,0.4)}',
  terminal: '[data-theme="terminal"]{--paper:#050505;--paper-deep:#080808;--surface:#0a0a0a;--surface-muted:#070707;--ink:#e0e0e0;--muted:#444;--rule:rgba(0,255,65,0.12);--rule-strong:rgba(0,255,65,0.2);--teal:#00ff41;--teal-dark:#00cc33;--teal-soft:rgba(0,255,65,0.08);--amber:#ff6b35;--amber-soft:rgba(255,107,53,0.08);--brick:#ff4444;--brick-soft:rgba(255,68,68,0.08);--violet:#b967ff;--violet-soft:rgba(185,103,255,0.08);--code:#000;--code-muted:#0a0a0a;--code-text:#b0b0b0;--shadow:0 12px 32px rgba(0,0,0,0.5)}',
  schematic: '[data-theme="schematic"]{--paper:#e8edf2;--paper-deep:#dde3ea;--surface:#fff;--surface-muted:#f0f4f8;--ink:#1e2a3a;--muted:#6b7b8f;--rule:#c5cdd6;--rule-strong:#a0aab8;--teal:#1a3a5c;--teal-dark:#0f2842;--teal-soft:rgba(26,58,92,0.08);--amber:#b35400;--amber-soft:rgba(179,84,0,0.08);--brick:#a84e3f;--brick-soft:rgba(168,78,63,0.08);--violet:#6a1b9a;--violet-soft:rgba(106,27,154,0.08);--code:#f4f6f9;--code-muted:#e8edf2;--code-text:#1e2a3a;--shadow:0 12px 32px rgba(26,58,92,0.08)}',
}

const STYLE_ID = 'spcp-theme-style'

function injectThemeCss(theme: ThemeId): void {
  let style = document.getElementById(STYLE_ID) as HTMLStyleElement | null
  if (theme === 'workshop') {
    if (style) style.remove()
    return
  }
  if (!style) {
    style = document.createElement('style')
    style.id = STYLE_ID
    document.head.appendChild(style)
  }
  style.textContent = THEME_CSS[theme]
}

export function isValidTheme(value: unknown): value is ThemeId {
  return typeof value === 'string' && VALID_THEMES.includes(value as ThemeId)
}

export function getTheme(): ThemeId {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored && isValidTheme(stored)) return stored
  } catch {
    // localStorage may be unavailable or restricted
  }
  return DEFAULT_THEME
}

export function setTheme(theme: ThemeId): void {
  try {
    document.documentElement.dataset.theme = theme
    window.localStorage.setItem(STORAGE_KEY, theme)
    injectThemeCss(theme)
  } catch {
    // localStorage may be unavailable or restricted
  }
}

export function initTheme(): void {
  const theme = getTheme()
  document.documentElement.dataset.theme = theme
  injectThemeCss(theme)
}

export const themeMeta: Record<ThemeId, { label: string; description: string }> = {
  workshop: { label: 'Workshop', description: 'Warm light - the original.' },
  hex: { label: 'Hex', description: 'Dark engineering grid.' },
  terminal: { label: 'Terminal', description: 'Console black and green.' },
  schematic: { label: 'Schematic', description: 'Blueprint paper.' },
}
