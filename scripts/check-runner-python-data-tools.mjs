import { readFileSync } from 'node:fs'

const origin = (process.argv[2] ?? '').replace(/\/$/u, '')
if (!origin.startsWith('https://')) {
  throw new Error('Pass the HTTPS academy origin as the first argument.')
}

const exerciseId = 'pydata6-supply-tracker'
const expectedOutput = 'Products: 2\nTotal units: 17\nRestock: markers'
let learnerCookie = ''

const correctSource = readFileSync(
  new URL('../runner/fixtures/python-data-tools-reference.python.txt', import.meta.url),
  'utf8',
).trimEnd()

const hardcodedCommentDecoy = [
  '# clean_name = normalize_name(name)',
  '# current = inventory.get(clean_name, 0)',
  '# inventory[clean_name] = current + amount',
  '# total += amount',
  '# names.append(name)',
  `print(${JSON.stringify(expectedOutput)})`,
].join('\n')

const unreachableDecoy = [
  `print(${JSON.stringify(expectedOutput)})`,
  'if False:',
  ...correctSource.split('\n').map((line) => `    ${line}`),
].join('\n')

const encodedSourceDisagreement = [
  '# coding: utf-7',
  `print(${JSON.stringify(expectedOutput)})`,
].join('\n')

const aliasSource = [
  'def normalize_name(name):',
  '    return str.lower(str.strip(name))',
  '',
  'def add_stock(inventory, name, amount):',
  '    key = normalize_name(name)',
  '    inventory[key] = inventory.get(key, 0) + amount',
  '    return inventory[key]',
  '',
  'def total_stock(inventory):',
  '    return sum(inventory.values())',
  '',
  'def low_stock(inventory, limit):',
  '    return [name for name in inventory if inventory[name] < limit]',
  '',
  'inventory = {}',
  'add_stock(inventory, " Markers ", 2)',
  'add_stock(inventory, "markers", 3)',
  'add_stock(inventory, "Paper", 12)',
  '',
  'print("Products:", len(inventory))',
  'print("Total units:", total_stock(inventory))',
  'for name in low_stock(inventory, 6):',
  '    print("Restock:", name)',
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
  const body = await responseJson(response, 'Python Data Tools grant')
  assert(typeof body.grant === 'string', 'Python Data Tools grant returned no signed value')
  return body.grant
}

async function run(source) {
  const signedGrant = await grant()
  const accepted = await responseJson(await fetch(`${origin}/api/runner/runs`, {
    method: 'POST',
    headers: {
      Origin: origin,
      Cookie: learnerCookie,
      'Content-Type': 'application/json',
      'X-Runner-Grant': signedGrant,
    },
    body: JSON.stringify({ version: 1, language: 'python', source, stdin: '', purpose: 'check' }),
  }), 'Python Data Tools submission')
  assert(
    accepted.status === 'queued' && typeof accepted.runId === 'string',
    'Python Data Tools submission returned an invalid queue receipt',
  )

  const deadline = Date.now() + 300_000
  while (Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, Math.max(300, accepted.pollAfterMs ?? 650)))
    const result = await responseJson(await fetch(
      `${origin}/api/runner/runs/${encodeURIComponent(accepted.runId)}`,
      { headers: { Cookie: learnerCookie, Accept: 'application/json' } },
    ), 'Python Data Tools result')
    if (result.status === 'queued' || result.status === 'running') continue
    return result
  }
  throw new Error('Python Data Tools check did not finish within five minutes')
}

function assertSafeResult(result, label) {
  const serialized = JSON.stringify(result)
  for (const marker of [
    'python-data-tools-supply-tracker-v1',
    'python_data_tools_analysis',
    '"authored_frame":',
    '"normalize_name":',
    '"add_stock":',
    '"total_stock":',
    '"low_stock":',
    '"harness":',
  ]) {
    assert(!serialized.includes(marker), `${label} exposed trusted assessment data: ${marker}`)
  }
  assert(Array.isArray(result.tests), `${label} returned no test summaries`)
  for (const test of result.tests) {
    assert(
      JSON.stringify(Object.keys(test).sort()) === JSON.stringify(['message', 'name', 'passed', 'visibility']),
      `${label} returned an unsafe test-summary shape`,
    )
  }
}

function assertRejectedStructure(result, label) {
  assert(result.outcome === 'completed', `${label} returned ${result.outcome}`)
  assert(result.stdout.trimEnd() === expectedOutput, `${label} returned the wrong visible output`)
  assert(Array.isArray(result.tests) && result.tests.length === 7, `${label} returned the wrong test count`)
  assert(result.tests[0].passed, `${label} did not prove the visible behavior check`)
  assert(!result.tests.slice(1).every((test) => test.passed), `${label} satisfied every protected requirement`)
  assertSafeResult(result, label)
}

const status = await responseJson(await fetch(`${origin}/api/runner/status`), 'runner status')
assert(status.enabled === true, 'runner kill switch is not enabled')

const hardcoded = await run(hardcodedCommentDecoy)
assertRejectedStructure(hardcoded, 'hardcoded comment decoy')
assert(hardcoded.tests.slice(1).every((test) => !test.passed), 'comments satisfied a structural fact')
console.log('pass Python Data Tools integrity: hardcoded output and comment decoys were rejected')

const unreachable = await run(unreachableDecoy)
assertRejectedStructure(unreachable, 'unreachable decoy')
assert(unreachable.tests.slice(1).every((test) => !test.passed), 'unreachable code satisfied a structural fact')
console.log('pass Python Data Tools integrity: unreachable required code was rejected')

const encoded = await run(encodedSourceDisagreement)
assertRejectedStructure(encoded, 'encoded-source disagreement')
assert(encoded.tests.slice(1).every((test) => !test.passed), 'a non-UTF-8 cookie satisfied a structural fact')
console.log('pass Python Data Tools integrity: source encoding disagreement was rejected')

const aliases = await run(aliasSource)
assertRejectedStructure(aliases, 'alias implementation')
assert(
  aliases.tests.slice(1).map((test) => test.passed).join(',') === 'true,false,false,false,false,true',
  'alias implementation returned an unexpected protected-fact result',
)
console.log('pass Python Data Tools integrity: behavior aliases did not replace the taught function shapes')

const complete = await run(correctSource)
assert(complete.outcome === 'completed', `complete Python Data Tools check returned ${complete.outcome}`)
assert(complete.stdout.trimEnd() === expectedOutput, 'complete Python Data Tools check returned the wrong output')
assert(Array.isArray(complete.tests) && complete.tests.length === 7, 'complete check returned the wrong test count')
assert(complete.tests.every((test) => test.passed), 'complete check did not pass all seven requirements')
assertSafeResult(complete, 'complete Python Data Tools check')
console.log(`pass Python Data Tools assessment: all 7 checks passed in ${complete.durationMs} ms`)

console.log('Python Data Tools runner checks passed.')
