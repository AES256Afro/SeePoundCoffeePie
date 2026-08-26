const origin = (process.argv[2] ?? '').replace(/\/$/u, '')
if (!origin.startsWith('https://')) {
  throw new Error('Pass the HTTPS academy origin as the first argument.')
}

const exerciseId = 'project-csharp-final'
let learnerCookie = ''

const correctSource = [
  'using System;',
  '',
  'void PrintBadge(string name, int visits)',
  '{',
  '    Console.WriteLine($"Badge: {name} | Visits: {visits}");',
  '}',
  '',
  'string[] areas = { "Studio", "Lab", "Library" };',
  '',
  'Console.WriteLine("What is your name?");',
  'string guestName = Console.ReadLine() ?? "";',
  '',
  'Console.WriteLine("How many visits have you completed?");',
  'int visitCount = int.Parse(Console.ReadLine() ?? "0");',
  '',
  'if (visitCount >= 3)',
  '{',
  '    Console.WriteLine("Access: Member");',
  '}',
  'else',
  '{',
  '    Console.WriteLine("Access: Guest");',
  '}',
  '',
  'foreach (string area in areas)',
  '{',
  '    Console.WriteLine($"Area: {area}");',
  '}',
  '',
  'PrintBadge(guestName, visitCount);',
].join('\n')

const visibleStdout = [
  'What is your name?',
  'How many visits have you completed?',
  'Access: Member',
  'Area: Studio',
  'Area: Lab',
  'Area: Library',
  'Badge: Alex Kim | Visits: 4',
].join('\n')

const hardcodedVisibleSource = [
  'using System;',
  '',
  'Console.WriteLine("What is your name?");',
  'Console.WriteLine("How many visits have you completed?");',
  'Console.WriteLine("Access: Member");',
  'Console.WriteLine("Area: Studio");',
  'Console.WriteLine("Area: Lab");',
  'Console.WriteLine("Area: Library");',
  'Console.WriteLine("Badge: Alex Kim | Visits: 4");',
].join('\n')

const hiddenInputs = [
  'Maren Holt\n0\n',
  'Ivo Chen\n2\n',
  'Tess Alvarez\n3\n',
]

const hiddenOutputs = [
  [
    'What is your name?',
    'How many visits have you completed?',
    'Access: Guest',
    'Area: Studio',
    'Area: Lab',
    'Area: Library',
    'Badge: Maren Holt | Visits: 0',
  ].join('\n'),
  [
    'What is your name?',
    'How many visits have you completed?',
    'Access: Guest',
    'Area: Studio',
    'Area: Lab',
    'Area: Library',
    'Badge: Ivo Chen | Visits: 2',
  ].join('\n'),
  [
    'What is your name?',
    'How many visits have you completed?',
    'Access: Member',
    'Area: Studio',
    'Area: Lab',
    'Area: Library',
    'Badge: Tess Alvarez | Visits: 3',
  ].join('\n'),
]

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
  const body = await responseJson(response, 'C# project grant')
  assert(typeof body.grant === 'string', 'C# project grant returned no signed value')
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
    body: JSON.stringify({ version: 1, language: 'csharp', source, stdin, purpose }),
  }), `C# project ${purpose} submission`)
  assert(
    accepted.status === 'queued' && typeof accepted.runId === 'string',
    'C# project submission returned an invalid queue receipt',
  )

  const deadline = Date.now() + 300_000
  while (Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, Math.max(300, accepted.pollAfterMs ?? 650)))
    const result = await responseJson(await fetch(
      `${origin}/api/runner/runs/${encodeURIComponent(accepted.runId)}`,
      { headers: { Cookie: learnerCookie, Accept: 'application/json' } },
    ), `C# project ${purpose} result`)
    if (result.status === 'queued' || result.status === 'running') continue
    return result
  }
  throw new Error(`C# project ${purpose} did not finish within five minutes`)
}

function assertProtectedResult(result) {
  const serialized = JSON.stringify(result)
  const privateMarkers = [
    'Maren Holt',
    'Ivo Chen',
    'Tess Alvarez',
    'final-hidden-zero-visits',
    'final-hidden-below-member',
    'final-hidden-member-boundary',
    'A first workshop visit',
    'A visit just below member access',
    'A visit at the member boundary',
    ...hiddenInputs,
    ...hiddenOutputs,
  ]

  for (const marker of privateMarkers) {
    const escapedMarker = JSON.stringify(marker).slice(1, -1)
    assert(!serialized.includes(marker), `protected C# project value escaped in the result: ${marker}`)
    assert(!serialized.includes(escapedMarker), `encoded C# project value escaped in the result: ${marker}`)
  }

  const escapedReferenceSource = JSON.stringify(correctSource).slice(1, -1)
  assert(!serialized.includes(correctSource), 'C# reference source escaped in the public result')
  assert(!serialized.includes(escapedReferenceSource), 'encoded C# reference source escaped in the public result')
  assert(!serialized.includes('PrintBadge(guestName, visitCount);'), 'C# reference call escaped in the public result')
  assert(!serialized.includes('csharp_analysis'), 'trusted C# analysis escaped in the public result')
  for (const factKey of [
    'usings',
    'local_functions',
    'arrays',
    'inputs',
    'writes',
    'conditionals',
    'foreach_loops',
    'calls',
  ]) {
    assert(!serialized.includes(`"${factKey}"`), `trusted C# ${factKey} facts escaped in the public result`)
  }
  assert(!Object.prototype.hasOwnProperty.call(result, 'source'), 'submitted C# source escaped in the public result')
}

function assertPublicTestShape(result, label) {
  assert(Array.isArray(result.tests) && result.tests.length === 12, `${label} returned the wrong test count`)
  const expectedNames = [
    'Visible project example',
    'Hidden project case 1',
    'Hidden project case 2',
    'Hidden project case 3',
    ...Array.from({ length: 8 }, (_, index) => `Required project code ${index + 1} of 8`),
  ]
  assert(
    result.tests.every((test, index) => test.name === expectedNames[index]),
    `${label} exposed an unexpected test name`,
  )
  assert(result.tests[0].visibility === 'visible', `${label} did not identify the visible example`)
  assert(
    result.tests.slice(1).every((test) => test.visibility === 'hidden'),
    `${label} exposed an official check as visible`,
  )
  for (const test of result.tests) {
    assert(
      JSON.stringify(Object.keys(test).sort()) === JSON.stringify(['message', 'name', 'passed', 'visibility']),
      `${label} returned an unsafe test-result shape`,
    )
    assert(typeof test.passed === 'boolean' && typeof test.message === 'string', `${label} returned an invalid test`)
  }
  assertProtectedResult(result)
}

const status = await responseJson(await fetch(`${origin}/api/runner/status`), 'runner status')
assert(status.enabled === true, 'runner kill switch is not enabled')

const hardcoded = await run(hardcodedVisibleSource, 'check')
assert(hardcoded.outcome === 'completed', `C# hardcoded-output check returned ${hardcoded.outcome}`)
assertPublicTestShape(hardcoded, 'C# hardcoded-output check')
assert(hardcoded.tests[0].passed, 'hardcoded C# output did not reproduce the visible example')
assert(
  hardcoded.tests.slice(1, 4).every((test) => !test.passed),
  'hardcoded C# output passed a hidden behavior case',
)
assert(!hardcoded.tests.every((test) => test.passed), 'hardcoded C# output completed the protected project')
console.log('pass C# project integrity: visible hardcoding was rejected by hidden behavior and source checks')

const complete = await run(correctSource, 'check')
assert(complete.outcome === 'completed', `complete C# project check returned ${complete.outcome}`)
assertPublicTestShape(complete, 'complete C# project check')
assert(complete.tests.every((test) => test.passed), 'complete C# project did not pass all 12 checks')
assert(complete.stdout.trimEnd() === visibleStdout, 'complete C# project returned the wrong visible stdout')
console.log(`pass C# project assessment: all 12 public-safe checks passed in ${complete.durationMs} ms`)

console.log('Phase 4C C# project runner checks passed.')
