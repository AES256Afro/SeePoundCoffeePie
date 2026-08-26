export const PORTFOLIO_SOURCE_MAX_BYTES = 20_000
export const PORTFOLIO_HTML_MAX_BYTES = 256 * 1_024
export const PORTFOLIO_MIME_TYPE = 'text/html;charset=utf-8'

export const PORTFOLIO_INTEGRITY_NOTE = 'Portfolio snapshot, not a certificate. This file shows the callsign and source currently saved in one browser. The source may have changed after the last project check. SeePoundCoffeePie has not verified identity, authorship, originality, or the current correctness of this source.'

export interface PortfolioSnapshot {
  callsign: string
  languageLabel: string
  projectTitle: string
  subtitle: string
  description: string
  outcome: string
  overviewSteps: Array<{
    title: string
    description: string
  }>
  sourceFileName: string
  source: string
}

export type PortfolioExportResult =
  | {
    ok: true
    filename: string
    html: string
    mimeType: typeof PORTFOLIO_MIME_TYPE
  }
  | {
    ok: false
    message: string
  }

const encoder = new TextEncoder()

function hasBidirectionalControl(value: string): boolean {
  for (const character of value) {
    const codePoint = character.codePointAt(0) ?? 0
    if (
      (codePoint >= 0x202a && codePoint <= 0x202e)
      || (codePoint >= 0x2066 && codePoint <= 0x2069)
    ) return true
  }
  return false
}

function hasUnsafeSingleLineControl(value: string): boolean {
  for (const character of value) {
    const codePoint = character.codePointAt(0) ?? 0
    if (
      codePoint <= 31
      || (codePoint >= 127 && codePoint <= 159)
    ) return true
  }
  return hasBidirectionalControl(value)
}

function byteLength(value: string): number {
  return encoder.encode(value).byteLength
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function validSnapshot(snapshot: PortfolioSnapshot): string | null {
  if (!snapshot.callsign.trim()) return 'Add a callsign before preparing a portfolio page.'
  if (snapshot.callsign.length > 80 || hasUnsafeSingleLineControl(snapshot.callsign)) {
    return 'The callsign contains characters that are not safe for a single-line portfolio heading.'
  }
  if (!snapshot.source.trim()) return 'The final source saved in this browser is empty.'
  if (snapshot.source.includes('\0')) return 'The final source contains a null byte and cannot be exported safely.'
  if (hasBidirectionalControl(snapshot.source)) {
    return 'The final source contains invisible directional controls that can disguise how code is displayed. Remove those controls before exporting.'
  }
  if (byteLength(snapshot.source) > PORTFOLIO_SOURCE_MAX_BYTES) {
    return `The final source is larger than the ${PORTFOLIO_SOURCE_MAX_BYTES.toLocaleString()} byte portfolio limit.`
  }
  const authoredValues = [
    snapshot.languageLabel,
    snapshot.projectTitle,
    snapshot.subtitle,
    snapshot.description,
    snapshot.outcome,
    snapshot.sourceFileName,
    ...snapshot.overviewSteps.flatMap((step) => [step.title, step.description]),
  ]
  if (authoredValues.some((value) => typeof value !== 'string' || !value.trim())) {
    return 'The project description is incomplete, so the portfolio page could not be prepared.'
  }
  if (snapshot.overviewSteps.length === 0 || snapshot.overviewSteps.length > 20) {
    return 'The project summary contains an unsupported number of steps.'
  }
  return null
}

export function portfolioFileName(projectId: string): string | null {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(projectId)) return null
  const filename = `seepoundcoffeepie-${projectId}-portfolio.html`
  return filename.length <= 100 ? filename : null
}

export function createPortfolioExport(
  snapshot: PortfolioSnapshot,
  projectId: string,
): PortfolioExportResult {
  const snapshotError = validSnapshot(snapshot)
  if (snapshotError) return { ok: false, message: snapshotError }

  const filename = portfolioFileName(projectId)
  if (!filename) return { ok: false, message: 'The project identifier cannot be used for a safe download filename.' }

  const steps = snapshot.overviewSteps.map((step) => (
    `<li><strong>${escapeHtml(step.title)}</strong><span>${escapeHtml(step.description)}</span></li>`
  )).join('')
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'none'; connect-src 'none'; img-src 'none'; font-src 'none'; media-src 'none'; object-src 'none'; frame-src 'none'; child-src 'none'; worker-src 'none'; manifest-src 'none'; base-uri 'none'; form-action 'none'; style-src 'unsafe-inline'">
<meta name="referrer" content="no-referrer">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(snapshot.projectTitle)} portfolio snapshot</title>
<style>
:root{color-scheme:light;--ink:#20221f;--muted:#5f625c;--paper:#f6f2e9;--surface:#fffdf8;--rule:#cfc7b7;--teal:#176b63;--code:#111b18;--code-text:#eaf3ef}*{box-sizing:border-box}body{margin:0;color:var(--ink);background:var(--paper);font:16px/1.65 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}main{width:min(100% - 2rem,62rem);margin:0 auto;padding:clamp(2rem,6vw,5rem) 0}header{padding-bottom:2rem;border-bottom:1px solid var(--rule)}.eyebrow{margin:0 0 .5rem;color:var(--teal);font-size:.78rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase}h1,h2{font-family:Georgia,"Times New Roman",serif;line-height:1.15}h1{max-width:18ch;margin:.2rem 0 .7rem;font-size:clamp(2.35rem,7vw,4.5rem)}h2{margin:0 0 .75rem;font-size:1.65rem}.byline{color:var(--muted)}section{padding:2rem 0;border-bottom:1px solid var(--rule)}ol{display:grid;gap:.9rem;margin:1rem 0 0;padding:0;list-style:none}li{display:grid;grid-template-columns:minmax(9rem,.35fr) 1fr;gap:1rem}li span,p{color:var(--muted)}pre{max-width:100%;margin:1rem 0 0;padding:1.25rem;overflow:auto;color:var(--code-text);background:var(--code);border-radius:6px;font:14px/1.7 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;white-space:pre}.notice{padding:1.1rem;color:#704d12;background:#fff5d8;border:1px solid #d4b563;border-radius:6px}.notice p{margin:0;color:inherit}@media(max-width:38rem){li{grid-template-columns:1fr;gap:.15rem}}@media print{body{background:#fff}main{width:100%;padding:0}.notice,pre{break-inside:avoid}pre{white-space:pre-wrap;overflow-wrap:anywhere}}
</style>
</head>
<body>
<main>
<header><p class="eyebrow">SeePoundCoffeePie learner portfolio</p><h1>${escapeHtml(snapshot.projectTitle)}</h1><p>${escapeHtml(snapshot.subtitle)}</p><p class="byline">Prepared by <bdi dir="auto">${escapeHtml(snapshot.callsign)}</bdi> · ${escapeHtml(snapshot.languageLabel)}</p></header>
<section><h2>What I built</h2><p>${escapeHtml(snapshot.description)}</p><p><strong>Outcome:</strong> ${escapeHtml(snapshot.outcome)}</p><ol>${steps}</ol></section>
<section><h2>Current source</h2><p>This is the exact source that was saved in the exporting browser for <strong>${escapeHtml(snapshot.sourceFileName)}</strong>.</p><pre aria-label="Final source for ${escapeHtml(snapshot.sourceFileName)}"><code>${escapeHtml(snapshot.source)}</code></pre></section>
<section class="notice" aria-label="Snapshot limits"><h2>What this file does and does not show</h2><p>${escapeHtml(PORTFOLIO_INTEGRITY_NOTE)}</p></section>
</main>
</body>
</html>`

  if (byteLength(html) > PORTFOLIO_HTML_MAX_BYTES) {
    return { ok: false, message: 'The prepared portfolio page is larger than the safe document limit.' }
  }

  return {
    ok: true,
    filename,
    html,
    mimeType: PORTFOLIO_MIME_TYPE,
  }
}
