const origin = (process.argv[2] ?? '').replace(/\/$/u, '')
if (!origin.startsWith('https://')) {
  throw new Error('Pass the HTTPS academy origin as the first argument.')
}

const exerciseId = 'project-java-final'
let learnerCookie = ''

const correctSource = [
  'import java.util.Scanner;',
  '',
  'public class Main {',
  '    static void printPicnic(String name, int guests) {',
  '        System.out.println("Picnic: " + name + " | Guests: " + guests);',
  '    }',
  '',
  '    public static void main(String[] args) {',
  '        Scanner scanner = new Scanner(System.in);',
  '        String[] supplies = { "Blankets", "Cups", "Napkins" };',
  '',
  '        System.out.println("What is your name?");',
  '        String guestName = scanner.nextLine();',
  '',
  '        System.out.println("How many guests are coming?");',
  '        int guestCount = Integer.parseInt(scanner.nextLine());',
  '',
  '        if (guestCount >= 8) {',
  '            System.out.println("Table: Large");',
  '        } else {',
  '            System.out.println("Table: Small");',
  '        }',
  '',
  '        for (String supply : supplies) {',
  '            System.out.println("Supply: " + supply);',
  '        }',
  '',
  '        printPicnic(guestName, guestCount);',
  '    }',
  '}',
].join('\n')

const visibleStdout = [
  'What is your name?',
  'How many guests are coming?',
  'Table: Large',
  'Supply: Blankets',
  'Supply: Cups',
  'Supply: Napkins',
  'Picnic: Alex Kim | Guests: 10',
].join('\n')

const hardcodedVisibleSource = [
  'public class Main {',
  '    public static void main(String[] args) {',
  '        System.out.println("What is your name?");',
  '        System.out.println("How many guests are coming?");',
  '        System.out.println("Table: Large");',
  '        System.out.println("Supply: Blankets");',
  '        System.out.println("Supply: Cups");',
  '        System.out.println("Supply: Napkins");',
  '        System.out.println("Picnic: Alex Kim | Guests: 10");',
  '    }',
  '}',
].join('\n')

const hiddenInputs = [
  'Maren Holt\n1\n',
  'Ivo Chen\n7\n',
  'Tess Alvarez\n8\n',
]

const hiddenOutputs = [
  [
    'What is your name?',
    'How many guests are coming?',
    'Table: Small',
    'Supply: Blankets',
    'Supply: Cups',
    'Supply: Napkins',
    'Picnic: Maren Holt | Guests: 1',
  ].join('\n'),
  [
    'What is your name?',
    'How many guests are coming?',
    'Table: Small',
    'Supply: Blankets',
    'Supply: Cups',
    'Supply: Napkins',
    'Picnic: Ivo Chen | Guests: 7',
  ].join('\n'),
  [
    'What is your name?',
    'How many guests are coming?',
    'Table: Large',
    'Supply: Blankets',
    'Supply: Cups',
    'Supply: Napkins',
    'Picnic: Tess Alvarez | Guests: 8',
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
  const body = await responseJson(response, 'Java project grant')
  assert(typeof body.grant === 'string', 'Java project grant returned no signed value')
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
    body: JSON.stringify({ version: 1, language: 'java', source, stdin, purpose }),
  }), `Java project ${purpose} submission`)
  assert(
    accepted.status === 'queued' && typeof accepted.runId === 'string',
    'Java project submission returned an invalid queue receipt',
  )

  const deadline = Date.now() + 300_000
  while (Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, Math.max(300, accepted.pollAfterMs ?? 650)))
    const result = await responseJson(await fetch(
      `${origin}/api/runner/runs/${encodeURIComponent(accepted.runId)}`,
      { headers: { Cookie: learnerCookie, Accept: 'application/json' } },
    ), `Java project ${purpose} result`)
    if (result.status === 'queued' || result.status === 'running') continue
    return result
  }
  throw new Error(`Java project ${purpose} did not finish within five minutes`)
}

function assertProtectedResult(result) {
  const serialized = JSON.stringify(result)
  const privateMarkers = [
    'Maren Holt',
    'Ivo Chen',
    'Tess Alvarez',
    'final-hidden-one-guest',
    'final-hidden-below-large-table',
    'final-hidden-large-table-boundary',
    'A one-person picnic',
    'A picnic just below the large-table boundary',
    'A picnic at the large-table boundary',
    ...hiddenInputs,
    ...hiddenOutputs,
  ]

  for (const marker of privateMarkers) {
    const escapedMarker = JSON.stringify(marker).slice(1, -1)
    assert(!serialized.includes(marker), `protected Java project value escaped in the result: ${marker}`)
    assert(!serialized.includes(escapedMarker), `encoded Java project value escaped in the result: ${marker}`)
  }

  const escapedReferenceSource = JSON.stringify(correctSource).slice(1, -1)
  assert(!serialized.includes(correctSource), 'Java reference source escaped in the public result')
  assert(!serialized.includes(escapedReferenceSource), 'encoded Java reference source escaped in the public result')
  assert(!serialized.includes('printPicnic(guestName, guestCount);'), 'Java reference call escaped in the public result')
  assert(!serialized.includes('java_analysis'), 'trusted Java analysis escaped in the public result')
  assert(!Object.prototype.hasOwnProperty.call(result, 'source'), 'submitted Java source escaped in the public result')
}

function assertPublicTestShape(result, label) {
  assert(Array.isArray(result.tests) && result.tests.length === 13, `${label} returned the wrong test count`)
  const expectedNames = [
    'Visible project example',
    'Hidden project case 1',
    'Hidden project case 2',
    'Hidden project case 3',
    ...Array.from({ length: 9 }, (_, index) => `Required project code ${index + 1} of 9`),
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
assert(hardcoded.outcome === 'completed', `Java hardcoded-output check returned ${hardcoded.outcome}`)
assertPublicTestShape(hardcoded, 'Java hardcoded-output check')
assert(hardcoded.tests[0].passed, 'hardcoded Java output did not reproduce the visible example')
assert(
  hardcoded.tests.slice(1, 4).every((test) => !test.passed),
  'hardcoded Java output passed a hidden behavior case',
)
assert(!hardcoded.tests.every((test) => test.passed), 'hardcoded Java output completed the protected project')
console.log('pass Java project integrity: visible hardcoding was rejected by hidden behavior and source checks')

const complete = await run(correctSource, 'check')
assert(complete.outcome === 'completed', `complete Java project check returned ${complete.outcome}`)
assertPublicTestShape(complete, 'complete Java project check')
assert(complete.tests.every((test) => test.passed), 'complete Java project did not pass all 13 checks')
assert(complete.stdout.trimEnd() === visibleStdout, 'complete Java project returned the wrong visible stdout')
console.log(`pass Java project assessment: all 13 public-safe checks passed in ${complete.durationMs} ms`)

console.log('Phase 4D Java project runner checks passed.')
