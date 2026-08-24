const origin = (process.argv[2] ?? 'https://seepoundcoffeepie.com').replace(/\/$/u, '')

if (!origin.startsWith('https://')) {
  throw new Error('Pass an HTTPS academy origin as the first argument.')
}

const smokeSource = `ship_name = "Wayfarer"
power_cells = 3

print("Ship:", ship_name)
print("Cells:", power_cells)
`

let learnerCookie = ''

async function responseJson(response, label) {
  const body = await response.json().catch(() => null)
  if (!response.ok) {
    const safeError = body && typeof body.error === 'string' ? `: ${body.error}` : ''
    throw new Error(`${label} failed (${response.status})${safeError}`)
  }
  return body
}

function captureGuestCookie(response) {
  const setCookies = response.headers.getSetCookie?.() ?? []
  const guest = setCookies.find((cookie) => cookie.startsWith('__Host-spp_runner_guest='))
  if (guest) learnerCookie = guest.split(';', 1)[0]
}

const status = await responseJson(await fetch(`${origin}/api/runner/status`, {
  headers: { Accept: 'application/json' },
}), 'runner status')

if (status.enabled !== true) {
  throw new Error('The production runner kill switch is not enabled.')
}

const grantResponse = await fetch(`${origin}/api/runner/grants`, {
  method: 'POST',
  headers: {
    Origin: origin,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ exerciseId: 'py-launch' }),
})
captureGuestCookie(grantResponse)
const grant = await responseJson(grantResponse, 'smoke-test grant')

if (typeof grant.grant !== 'string' || !learnerCookie) {
  throw new Error('The smoke-test grant did not establish a signed learner session.')
}

const accepted = await responseJson(await fetch(`${origin}/api/runner/runs`, {
  method: 'POST',
  headers: {
    Origin: origin,
    Cookie: learnerCookie,
    'Content-Type': 'application/json',
    'X-Runner-Grant': grant.grant,
  },
  body: JSON.stringify({
    version: 1,
    language: 'python',
    source: smokeSource,
  }),
}), 'smoke-test submission')

if (accepted.status !== 'queued' || typeof accepted.runId !== 'string') {
  throw new Error('The smoke-test submission did not return a valid queue receipt.')
}

const deadline = Date.now() + 180_000
let result = null

while (Date.now() < deadline) {
  await new Promise((resolve) => setTimeout(resolve, Math.max(300, accepted.pollAfterMs ?? 650)))
  const current = await responseJson(await fetch(
    `${origin}/api/runner/runs/${encodeURIComponent(accepted.runId)}`,
    { headers: { Cookie: learnerCookie, Accept: 'application/json' } },
  ), 'smoke-test result')
  if (current.status === 'queued' || current.status === 'running') continue
  result = current
  break
}

if (!result) throw new Error('The smoke-test run did not finish within three minutes.')
if (result.outcome !== 'completed') {
  throw new Error(`The smoke-test program ended with ${String(result.outcome)}.`)
}
if (!Array.isArray(result.tests) || result.tests.length === 0 || !result.tests.every((test) => test.passed)) {
  throw new Error('The smoke-test program did not pass every server-owned assignment check.')
}
if (result.stdout !== 'Ship: Wayfarer\nCells: 3\n') {
  throw new Error('The smoke-test program returned unexpected output.')
}

console.log(`Production runner smoke test passed in ${result.durationMs} ms.`)
