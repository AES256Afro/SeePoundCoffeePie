const origin = (process.argv[2] ?? '').replace(/\/$/u, '')
if (!origin.startsWith('https://')) {
  throw new Error('Pass the HTTPS academy origin as the first argument.')
}

const exerciseId = 'project-py-final'
let learnerCookie = ''

const correctSource = [
  'price_per_cup = 3',
  'print("Welcome to the Coffee Counter!")',
  'name = input("What is your name?\\n")',
  'cups_text = input("How many cups would you like?\\n")',
  'cups = int(cups_text)',
  'total = cups * price_per_cup',
  'print(f"{name}, your {cups} cup order costs ${total}.")',
].join('\n')

const decoySource = [
  '# price_per_cup = 3',
  '# name = input("unused")',
  '# cups_text = input("unused")',
  '# cups = int(cups_text)',
  '# total = cups * price_per_cup',
  '# print(f"{name}, your {cups} cup order costs ${total}.")',
  'if False: price_per_cup = 3',
  'if False: name = input("unused")',
  'if False: cups_text = input("unused")',
  'if False: cups = int(cups_text)',
  'if False: total = cups * price_per_cup',
  'if False: print(f"{name}, your {cups} cup order costs ${total}.")',
  'print("Welcome to the Coffee Counter!")',
  'person = input("What is your name?\\n")',
  'amount = int(input("How many cups would you like?\\n"))',
  'cost = amount + amount + amount',
  'print(f"{person}, your {amount} cup order costs ${cost}.")',
].join('\n')

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

async function responseJson(response, label) {
  const body = await response.json().catch(() => null)
  if (!response.ok) throw new Error(`${label} failed (${response.status}): ${JSON.stringify(body)}`)
  return body
}

async function grant() {
  const response = await fetch(`${origin}/api/runner/grants`, {
    method: 'POST',
    headers: {
      Origin: origin,
      'Content-Type': 'application/json',
      ...(learnerCookie ? { Cookie: learnerCookie } : {}),
    },
    body: JSON.stringify({ exerciseId }),
  })
  const setCookies = response.headers.getSetCookie?.() ?? []
  const guest = setCookies.find((cookie) => cookie.startsWith('__Host-spp_runner_guest='))
  if (guest) learnerCookie = guest.split(';', 1)[0]
  const body = await responseJson(response, 'project grant')
  assert(typeof body.grant === 'string', 'project grant returned no signed value')
  return body.grant
}

async function run(source, purpose, stdin = '') {
  const signedGrant = await grant()
  const accepted = await responseJson(await fetch(`${origin}/api/runner/runs`, {
    method: 'POST',
    headers: {
      Origin: origin,
      Cookie: learnerCookie,
      'Content-Type': 'application/json',
      'X-Runner-Grant': signedGrant,
    },
    body: JSON.stringify({ version: 1, language: 'python', source, stdin, purpose }),
  }), `project ${purpose} submission`)
  assert(accepted.status === 'queued' && typeof accepted.runId === 'string', 'project submission returned an invalid queue receipt')

  const deadline = Date.now() + 300_000
  while (Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, Math.max(300, accepted.pollAfterMs ?? 650)))
    const result = await responseJson(await fetch(
      `${origin}/api/runner/runs/${encodeURIComponent(accepted.runId)}`,
      { headers: { Cookie: learnerCookie, Accept: 'application/json' } },
    ), `project ${purpose} result`)
    if (result.status === 'queued' || result.status === 'running') continue
    return result
  }
  throw new Error(`project ${purpose} did not finish within five minutes`)
}

function assertProtectedResult(result) {
  const serialized = JSON.stringify(result)
  const privateMarkers = [
    'Morgan',
    'Riley',
    'Sam Lee',
    'final-hidden-one-cup',
    'final-hidden-seven-cups',
    'final-hidden-spaced-name',
  ]
  for (const marker of privateMarkers) {
    assert(!serialized.includes(marker), `protected project value escaped in the result: ${marker}`)
  }
}

const status = await responseJson(await fetch(`${origin}/api/runner/status`), 'runner status')
assert(status.enabled === true, 'runner kill switch is not enabled')

const practice = await run('print(input())', 'run', 'Practice value\n')
assert(practice.outcome === 'completed', `project practice run returned ${practice.outcome}`)
assert(practice.stdout === 'Practice value\n', 'project practice run returned the wrong console output')
assert(Array.isArray(practice.tests) && practice.tests.length === 0, 'project practice run exposed grading checks')
console.log('pass project practice: caller input ran without grading or progress tests')

const decoy = await run(decoySource, 'check')
assert(decoy.outcome === 'completed', `project decoy check returned ${decoy.outcome}`)
assert(Array.isArray(decoy.tests) && decoy.tests.length === 10, 'project decoy check returned the wrong test count')
assert(decoy.tests.slice(0, 4).every((test) => test.passed), 'project decoy did not prove all protected behavior cases')
assert(decoy.tests.slice(4).every((test) => !test.passed), 'commented code satisfied a protected structural requirement')
assertProtectedResult(decoy)
console.log('pass project integrity: behavior aliases passed while commented required code was rejected')

const complete = await run(correctSource, 'check')
assert(complete.outcome === 'completed', `complete project check returned ${complete.outcome}`)
assert(Array.isArray(complete.tests) && complete.tests.length === 10, 'complete project check returned the wrong test count')
assert(complete.tests.every((test) => test.passed), 'complete project did not pass all four cases and six requirements')
assertProtectedResult(complete)
console.log(`pass project assessment: all 10 checks passed in ${complete.durationMs} ms`)

console.log('Phase 4A project runner checks passed.')
