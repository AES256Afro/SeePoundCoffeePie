import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

export const CPP_COLLECTIONS_EXERCISE_ID = 'cpprecords6-workshop-stock-report'
export const CPP_COLLECTIONS_EXPECTED_OUTPUT = 'Parts: 3\nTotal units: 17\nLow stock: seals'

const expectedTestNames = [
  'Visible lesson example',
  ...Array.from({ length: 6 }, (_, index) => `Required lesson code ${index + 1} of 6`),
]

const acceptedKeys = ['pollAfterMs', 'runId', 'status', 'version']
const diagnosticKeys = ['explanation', 'line', 'suggestion', 'title']
const grantKeys = ['expiresIn', 'grant', 'language', 'version', 'visibleTest']
const pendingKeys = acceptedKeys
const resultKeys = [
  'diagnostic',
  'durationMs',
  'exitCode',
  'limit',
  'outcome',
  'runId',
  'stderr',
  'stdout',
  'tests',
  'truncated',
  'version',
]
const runnerOutcomes = new Set([
  'completed',
  'compile_error',
  'runtime_error',
  'limit_exceeded',
  'system_error',
])
const statusKeys = ['configured', 'enabled', 'languages', 'paused', 'version']
const testKeys = ['message', 'name', 'passed', 'visibility']
const visibleTestKeys = ['expectedOutput', 'name']

const trustedResponseMarkers = [
  'cpp-collections-records-workshop-report-v1',
  'workshop-stock-report-visible',
  'Visible Workshop Stock Report',
  'Checks the exact report produced from the fixed in-memory part records.',
  'cpp_collections_analysis',
  'CppCollectionsAnalyzer.py',
  'authored_frame',
  'part_record',
  'restock',
  'total_units',
  'low_stock',
  'supplied_harness',
  'cpp-collections-authored-frame',
  'cpp-collections-part-record',
  'cpp-collections-restock',
  'cpp-collections-total-units',
  'cpp-collections-low-stock',
  'cpp-collections-supplied-harness',
  'Keep the three supplied headers, Part record, helpers, and main function in their taught order without extra or unreachable code.',
  'Keep Part as the supplied record with one std::string name field and one int quantity field.',
  'Have restock update the matching original Part quantity through the supplied reference loop.',
  'Have total_units add every part quantity to one accumulator and return it after the loop.',
  'Have low_stock collect each part name whose quantity is below the supplied limit.',
  'Keep the three supplied records, two restock calls, three report stages, and return 0 unchanged and reachable.',
]

function responseTextFragments(value) {
  const fragments = [typeof value === 'string' ? value : (JSON.stringify(value) ?? '')]
  const stack = [value]
  while (stack.length > 0) {
    const current = stack.pop()
    if (typeof current === 'string') {
      fragments.push(current)
    } else if (Array.isArray(current)) {
      stack.push(...current)
    } else if (current && typeof current === 'object') {
      stack.push(...Object.keys(current), ...Object.values(current))
    }
  }
  return fragments
}

function responseStringLeaves(value, leaves = []) {
  if (typeof value === 'string') {
    leaves.push(value)
  } else if (Array.isArray(value)) {
    for (const item of value) responseStringLeaves(item, leaves)
  } else if (value && typeof value === 'object') {
    for (const item of Object.values(value)) responseStringLeaves(item, leaves)
  }
  return leaves
}

function responseFreeText(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return responseStringLeaves(value)
  }
  if (
    typeof value.stdout === 'string'
    && typeof value.stderr === 'string'
    && Array.isArray(value.tests)
    && value.diagnostic
    && typeof value.diagnostic === 'object'
  ) {
    return [
      value.stdout,
      value.stderr,
      typeof value.limit === 'string' ? value.limit : '',
      ...value.tests.map((test) => test && typeof test.message === 'string' ? test.message : ''),
      typeof value.diagnostic.title === 'string' ? value.diagnostic.title : '',
      typeof value.diagnostic.explanation === 'string' ? value.diagnostic.explanation : '',
      typeof value.diagnostic.suggestion === 'string' ? value.diagnostic.suggestion : '',
    ]
  }
  return responseStringLeaves(value)
}

function normalizedSensitiveText(value) {
  return value.normalize('NFKC').replace(/[^A-Za-z0-9]+/gu, '').toLowerCase()
}

function sensitiveRepresentations(value, minimumLength = 8) {
  if (typeof value !== 'string' || value.length < minimumLength) return []
  return [...new Set([
    value,
    JSON.stringify(value).slice(1, -1),
    Buffer.from(value, 'utf8').toString('base64'),
    Buffer.from(value, 'utf8').toString('base64url'),
    Buffer.from(value, 'utf8').toString('hex'),
    encodeURIComponent(value),
  ])]
}

function responseContainsSensitiveValue(value, sensitiveValue, minimumLength = 8) {
  const fragments = responseTextFragments(value)
  const freeText = responseFreeText(value)
  const corpora = [
    ...fragments,
    freeText.join(''),
    freeText.join('\n'),
  ]
  const normalizedCorpora = corpora.map(normalizedSensitiveText)
  return sensitiveRepresentations(sensitiveValue, minimumLength).some((representation) => {
    if (corpora.some((corpus) => corpus.includes(representation))) return true
    const normalized = normalizedSensitiveText(representation)
    return normalized.length >= minimumLength
      && normalizedCorpora.some((corpus) => corpus.includes(normalized))
  })
}

function responseContainsPrivateMarker(value, privateMarker) {
  const fragments = responseTextFragments(value)
  return sensitiveRepresentations(privateMarker, 4).some((representation) => (
    fragments.some((fragment) => fragment.includes(representation))
  ))
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

function sameKeys(value, expected) {
  return JSON.stringify(Object.keys(value).sort()) === JSON.stringify(expected)
}

function assertExactObject(value, expectedKeys, label) {
  assert(value && typeof value === 'object' && !Array.isArray(value), `${label} returned no object`)
  assert(sameKeys(value, expectedKeys), `${label} returned an unsafe response shape`)
}

function assertRunId(value, label) {
  assert(
    typeof value === 'string' && /^[A-Za-z0-9_-]{20,80}$/u.test(value),
    `${label} returned no valid run identifier`,
  )
}

function submittedSourceMarkers(submittedSource) {
  if (!submittedSource) return []
  const trimmedLines = submittedSource
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter((line) => line.length >= 16)
  return [...new Set([
    ...sensitiveRepresentations(submittedSource),
    ...trimmedLines,
  ])]
}

export function assertCppCollectionsPublicEnvelope(
  value,
  label,
  submittedSource = '',
  forbiddenValues = [],
  ) {
  const fragments = responseTextFragments(value)
  for (const marker of trustedResponseMarkers) {
    assert(
      !responseContainsPrivateMarker(value, marker),
      `${label} exposed trusted assessment internals`,
    )
  }
  assert(
    !fragments.some((fragment) => (
      /(?:^|[^A-Za-z0-9_])\/(?:workspace|opt\/runner|tmp)(?=$|\/|[^A-Za-z0-9_.-])/iu.test(fragment)
    )),
    `${label} exposed an internal runner path`,
  )
  assert(
    !fragments.some((fragment) => /(?:^|[^A-Za-z0-9_])(?:profile|analyzed|parsed)(?=$|[^A-Za-z0-9_])/iu.test(fragment)),
    `${label} exposed an analyzer envelope`,
  )
  for (const marker of ['/workspace', '/opt/runner', '/tmp', 'profile', 'analyzed', 'parsed']) {
    assert(
      !responseContainsPrivateMarker(value, marker),
      `${label} exposed encoded runner internals`,
    )
  }
  for (const sourceMarker of submittedSourceMarkers(submittedSource)) {
    assert(!responseContainsSensitiveValue(value, sourceMarker), `${label} returned submitted learner source`)
  }
  for (const forbiddenValue of forbiddenValues) {
    assert(
      !responseContainsSensitiveValue(value, forbiddenValue),
      `${label} exposed request credentials`,
    )
  }
}

export function assertCppCollectionsStatus(value) {
  const label = 'runner status'
  assertExactObject(value, statusKeys, label)
  assert(value.version === 1, `${label} returned the wrong version`)
  assert(value.configured === true, `${label} is not configured`)
  assert(value.enabled === true && value.paused === false, 'runner kill switch is not enabled')
  assert(
    JSON.stringify(value.languages) === JSON.stringify(['python', 'cpp', 'csharp', 'java']),
    `${label} returned the wrong language list`,
  )
}

export function assertCppCollectionsGrant(value) {
  const label = 'Practical C++ grant'
  assertExactObject(value, grantKeys, label)
  assert(value.version === 1, `${label} returned the wrong version`)
  assert(value.language === 'cpp', `${label} returned the wrong language`)
  assert(
    typeof value.grant === 'string'
      && value.grant.length >= 40
      && value.grant.length <= 4_096
      && /^[A-Za-z0-9_.-]+$/u.test(value.grant),
    `${label} returned no valid signed value`,
  )
  assert(
    Number.isSafeInteger(value.expiresIn) && value.expiresIn >= 1 && value.expiresIn <= 3_600,
    `${label} returned an invalid expiry`,
  )
  assertExactObject(value.visibleTest, visibleTestKeys, `${label} visible check`)
  assert(value.visibleTest.name === 'Visible console check', `${label} returned the wrong visible-check name`)
  assert(
    value.visibleTest.expectedOutput === CPP_COLLECTIONS_EXPECTED_OUTPUT,
    `${label} returned the wrong visible check`,
  )
}

export function assertCppCollectionsAccepted(value, label) {
  assertExactObject(value, acceptedKeys, label)
  assert(value.version === 1 && value.status === 'queued', `${label} returned an invalid queue receipt`)
  assertRunId(value.runId, label)
  assert(
    Number.isSafeInteger(value.pollAfterMs) && value.pollAfterMs >= 100 && value.pollAfterMs <= 10_000,
    `${label} returned an invalid polling interval`,
  )
}

export function assertCppCollectionsPending(value, label, expectedRunId) {
  assertExactObject(value, pendingKeys, label)
  assert(
    value.version === 1 && (value.status === 'queued' || value.status === 'running'),
    `${label} returned an invalid pending receipt`,
  )
  assertRunId(value.runId, label)
  assert(value.runId === expectedRunId, `${label} returned a different run identifier`)
  assert(
    Number.isSafeInteger(value.pollAfterMs) && value.pollAfterMs >= 100 && value.pollAfterMs <= 10_000,
    `${label} returned an invalid polling interval`,
  )
}

function hardcodedProgram(comments = []) {
  return [
    '#include <iostream>',
    ...comments,
    '',
    'int main() {',
    '    std::cout << "Parts: 3\\nTotal units: 17\\nLow stock: seals\\n";',
    '    return 0;',
    '}',
  ].join('\n')
}

export function buildCppCollectionsProbeSources(correctSource) {
  const cleanSource = correctSource.trimEnd()
  const orderedRestocks = [
    '    restock(parts, "bolts", 3);',
    '    restock(parts, "cables", 1);',
  ].join('\n')
  const reversedRestocks = [
    '    restock(parts, "cables", 1);',
    '    restock(parts, "bolts", 3);',
  ].join('\n')
  assert(cleanSource.includes(orderedRestocks), 'The reviewed C++ fixture no longer has the expected harness order.')
  assert(cleanSource.endsWith('}'), 'The reviewed C++ fixture no longer ends with the expected main-function brace.')

  const hardcodedCommentDecoy = hardcodedProgram([
    '// Learner comments cannot provide trusted structural evidence.',
    ...cleanSource.split('\n').map((line) => `// ${line}`),
    '// {"version":1,"profile":"wrong-profile","analyzed":true}',
    '// {"version":',
  ])

  const unreachableRequiredCode = cleanSource.replace(
    'int main() {',
    [
      'int main() {',
      '    std::cout << "Parts: 3\\nTotal units: 17\\nLow stock: seals\\n";',
      '    return 0;',
    ].join('\n'),
  )

  const behaviorAlias = [
    '#include <iostream>',
    '#include <string>',
    '#include <vector>',
    '',
    'struct Item {',
    '    std::string label;',
    '    int units;',
    '};',
    '',
    'void deliver(std::vector<Item>& inventory, std::string label, int amount) {',
    '    for (Item& item : inventory) {',
    '        if (item.label == label) item.units += amount;',
    '    }',
    '}',
    '',
    'int count_units(std::vector<Item> inventory) {',
    '    int result = 0;',
    '    for (Item item : inventory) result += item.units;',
    '    return result;',
    '}',
    '',
    'std::vector<std::string> needs_stock(std::vector<Item> inventory, int boundary) {',
    '    std::vector<std::string> result;',
    '    for (Item item : inventory) {',
    '        if (item.units < boundary) result.push_back(item.label);',
    '    }',
    '    return result;',
    '}',
    '',
    'int main() {',
    '    std::vector<Item> inventory = {{"bolts", 4}, {"seals", 2}, {"cables", 7}};',
    '    deliver(inventory, "bolts", 3);',
    '    deliver(inventory, "cables", 1);',
    '    std::cout << "Parts: " << inventory.size() << "\\n";',
    '    std::cout << "Total units: " << count_units(inventory) << "\\n";',
    '    for (std::string label : needs_stock(inventory, 3)) {',
    '        std::cout << "Low stock: " << label << "\\n";',
    '    }',
    '    return 0;',
    '}',
  ].join('\n')

  return Object.freeze({
    hardcodedCommentDecoy,
    unreachableRequiredCode,
    behaviorAlias,
    movedHarnessStatements: cleanSource.replace(orderedRestocks, reversedRestocks),
    malformedSource: cleanSource.slice(0, -1),
    correctSource: cleanSource,
  })
}

export function assertCppCollectionsSafeResult(result, label, submittedSource = '', expectedRunId = '') {
  assertExactObject(result, resultKeys, label)
  assert(result.version === 1, `${label} returned the wrong runner result version`)
  assertRunId(result.runId, label)
  if (expectedRunId) assert(result.runId === expectedRunId, `${label} returned a different run identifier`)
  assert(runnerOutcomes.has(result.outcome), `${label} returned an unexpected outcome`)
  assert(typeof result.stdout === 'string' && typeof result.stderr === 'string', `${label} returned invalid console output`)
  assert(result.stdout.length <= 65_536 && result.stderr.length <= 65_536, `${label} returned oversized console output`)
  assert(
    result.exitCode === null
      || (Number.isSafeInteger(result.exitCode) && result.exitCode >= -255 && result.exitCode <= 255),
    `${label} returned an invalid exit code`,
  )
  assert(
    Number.isSafeInteger(result.durationMs) && result.durationMs >= 0 && result.durationMs <= 300_000,
    `${label} returned an invalid duration`,
  )
  assert(typeof result.truncated === 'boolean', `${label} returned an invalid truncation flag`)
  assert(
    result.limit === null || (typeof result.limit === 'string' && result.limit.length <= 80),
    `${label} returned an invalid limit`,
  )
  assert(Array.isArray(result.tests), `${label} returned no test summaries`)
  assert(result.tests.length === expectedTestNames.length, `${label} returned the wrong test count`)
  for (const [index, test] of result.tests.entries()) {
    assertExactObject(test, testKeys, `${label} test summary`)
    assert(test.name === expectedTestNames[index], `${label} exposed an unexpected test name`)
    assert(test.visibility === (index === 0 ? 'visible' : 'hidden'), `${label} returned the wrong test visibility`)
    assert(
      typeof test.passed === 'boolean'
        && typeof test.message === 'string'
        && test.message.length <= 1_000,
      `${label} returned invalid test data`,
    )
  }

  assertExactObject(result.diagnostic, diagnosticKeys, `${label} diagnostic`)
  assert(
    typeof result.diagnostic.title === 'string'
      && result.diagnostic.title.length <= 200
      && typeof result.diagnostic.explanation === 'string'
      && result.diagnostic.explanation.length <= 1_000
      && typeof result.diagnostic.suggestion === 'string'
      && result.diagnostic.suggestion.length <= 1_000
      && (
        result.diagnostic.line === null
        || (Number.isSafeInteger(result.diagnostic.line) && result.diagnostic.line >= 1)
      ),
    `${label} returned an invalid diagnostic`,
  )

  assertCppCollectionsPublicEnvelope(result, label, submittedSource)
}

export function assertCppCollectionsRejectedResult(result, label, submittedSource) {
  assertCppCollectionsSafeResult(result, label, submittedSource)
  assert(result.outcome === 'completed', `${label} returned an unexpected outcome`)
  assert(result.stdout.trimEnd() === CPP_COLLECTIONS_EXPECTED_OUTPUT, `${label} returned the wrong visible output`)
  assert(result.tests[0].passed, `${label} did not pass the visible behavior check`)
  assert(!result.tests.slice(1).every((test) => test.passed), `${label} passed every protected requirement`)
}

export function assertCppCollectionsMalformedResult(result, submittedSource) {
  const label = 'malformed C++ source'
  assertCppCollectionsSafeResult(result, label, submittedSource)
  assert(result.outcome === 'compile_error', `${label} returned an unexpected outcome`)
  assert(result.tests.every((test) => !test.passed), `${label} passed a lesson requirement`)
  assert(result.stderr.length > 0, `${label} returned no compiler guidance`)
  assert(!/\/workspace\/|\/opt\/runner/iu.test(result.stderr), `${label} exposed an internal runner path`)
}

export function assertCppCollectionsAuthenticResult(result, submittedSource) {
  const label = 'authentic C++ solution'
  assertCppCollectionsSafeResult(result, label, submittedSource)
  assert(result.outcome === 'completed', `${label} returned an unexpected outcome`)
  assert(result.stdout.trimEnd() === CPP_COLLECTIONS_EXPECTED_OUTPUT, `${label} returned the wrong visible output`)
  assert(result.tests.every((test) => test.passed), `${label} did not pass all seven requirements`)
}

export async function responseJson(response, label, submittedSource = '', forbiddenValues = []) {
  let rawBody
  try {
    rawBody = await response.text()
  } catch {
    throw new Error(`${label} returned an unreadable response`)
  }
  assertCppCollectionsPublicEnvelope(rawBody, label, submittedSource, forbiddenValues)
  let body
  try {
    body = JSON.parse(rawBody)
  } catch {
    throw new Error(`${label} returned unreadable JSON`)
  }
  assertCppCollectionsPublicEnvelope(body, label, submittedSource, forbiddenValues)
  if (!response.ok) {
    throw new Error(`${label} failed with HTTP ${response.status}`)
  }
  return body
}

export async function checkCppCollectionsRunner(originArgument, dependencyOverrides = {}) {
  const origin = (originArgument ?? '').replace(/\/$/u, '')
  if (!origin.startsWith('https://')) {
    throw new Error('Pass the HTTPS academy origin as the first argument.')
  }

  let learnerCookie = ''
  const fetchRequest = dependencyOverrides.fetch ?? globalThis.fetch
  const log = dependencyOverrides.log ?? ((...values) => console.log(...values))
  const now = dependencyOverrides.now ?? (() => Date.now())
  const sleep = dependencyOverrides.sleep ?? ((milliseconds) => new Promise((resolvePromise) => (
    setTimeout(resolvePromise, milliseconds)
  )))
  const fixture = readFileSync(
    new URL('../runner/fixtures/cpp-collections-reference.cpp.txt', import.meta.url),
    'utf8',
  )
  const sources = buildCppCollectionsProbeSources(fixture)

  async function grant() {
    const response = await fetchRequest(`${origin}/api/runner/grants`, {
      method: 'POST',
      headers: {
        Origin: origin,
        'Content-Type': 'application/json',
        ...(learnerCookie ? { Cookie: learnerCookie } : {}),
      },
      body: JSON.stringify({ exerciseId: CPP_COLLECTIONS_EXERCISE_ID }),
    })
    const setCookies = response.headers.getSetCookie?.()
      ?? [response.headers.get?.('set-cookie')].filter(Boolean)
    const guest = setCookies.find((cookie) => cookie.startsWith('__Host-spp_runner_guest='))
    if (guest) learnerCookie = guest.split(';', 1)[0]
    assert(learnerCookie, 'Practical C++ grant did not establish a learner session')
    const cookieValue = learnerCookie.slice(learnerCookie.indexOf('=') + 1)
    const body = await responseJson(
      response,
      'Practical C++ grant',
      '',
      [learnerCookie, cookieValue],
    )
    assertCppCollectionsGrant(body)
    assert(!body.grant.includes(cookieValue), 'Practical C++ grant reused the learner cookie')
    return body.grant
  }

  async function run(source, label) {
    const signedGrant = await grant()
    const cookieValue = learnerCookie.slice(learnerCookie.indexOf('=') + 1)
    const accepted = await responseJson(await fetchRequest(`${origin}/api/runner/runs`, {
      method: 'POST',
      headers: {
        Origin: origin,
        Cookie: learnerCookie,
        'Content-Type': 'application/json',
        'X-Runner-Grant': signedGrant,
      },
      body: JSON.stringify({
        version: 1,
        language: 'cpp',
        source,
        stdin: '',
        purpose: 'check',
      }),
    }), `${label} submission`, source, [signedGrant, learnerCookie, cookieValue])
    assertCppCollectionsAccepted(accepted, `${label} submission`)

    const deadline = now() + 300_000
    while (now() < deadline) {
      await sleep(Math.max(300, accepted.pollAfterMs))
      const result = await responseJson(await fetchRequest(
        `${origin}/api/runner/runs/${encodeURIComponent(accepted.runId)}`,
        { headers: { Cookie: learnerCookie, Accept: 'application/json' } },
      ), `${label} result`, source, [signedGrant, learnerCookie, cookieValue])
      if (result?.status === 'queued' || result?.status === 'running') {
        assertCppCollectionsPending(result, `${label} result`, accepted.runId)
        continue
      }
      assertCppCollectionsSafeResult(result, label, source, accepted.runId)
      return result
    }
    throw new Error(`${label} did not finish within five minutes`)
  }

  const status = await responseJson(await fetchRequest(`${origin}/api/runner/status`), 'runner status')
  assertCppCollectionsStatus(status)

  const hardcoded = await run(sources.hardcodedCommentDecoy, 'hardcoded comment decoy')
  assertCppCollectionsRejectedResult(hardcoded, 'hardcoded comment decoy', sources.hardcodedCommentDecoy)
  assert(hardcoded.tests.slice(1).every((test) => !test.passed), 'comment or analyzer-envelope text satisfied a protected requirement')
  log('pass Practical C++ integrity: hardcoded output, comments, and analyzer forgeries were rejected')

  const unreachable = await run(sources.unreachableRequiredCode, 'unreachable required code')
  assertCppCollectionsRejectedResult(unreachable, 'unreachable required code', sources.unreachableRequiredCode)
  log('pass Practical C++ integrity: unreachable required code was rejected')

  const alias = await run(sources.behaviorAlias, 'behavior alias')
  assertCppCollectionsRejectedResult(alias, 'behavior alias', sources.behaviorAlias)
  assert(alias.tests.slice(1).every((test) => !test.passed), 'renamed behavior aliases satisfied a protected requirement')
  log('pass Practical C++ integrity: renamed behavior aliases were rejected')

  const movedHarness = await run(sources.movedHarnessStatements, 'moved harness statements')
  assertCppCollectionsRejectedResult(movedHarness, 'moved harness statements', sources.movedHarnessStatements)
  assert(!movedHarness.tests[1].passed, 'moved harness statements satisfied the exact authored frame')
  assert(!movedHarness.tests.at(-1).passed, 'moved harness statements satisfied the protected harness order')
  log('pass Practical C++ integrity: moved supplied statements were rejected')

  const malformed = await run(sources.malformedSource, 'malformed C++ source')
  assertCppCollectionsMalformedResult(malformed, sources.malformedSource)
  log('pass Practical C++ diagnostics: malformed source failed closed with sanitized compiler guidance')

  const complete = await run(sources.correctSource, 'authentic C++ solution')
  assertCppCollectionsAuthenticResult(complete, sources.correctSource)
  log(`pass Practical C++ assessment: all 7 public-safe checks passed in ${complete.durationMs} ms`)

  log('Practical C++ deployed runner checks passed.')
}

const directPath = process.argv[1]
  ? pathToFileURL(resolve(process.argv[1])).href
  : ''

if (directPath === import.meta.url) {
  await checkCppCollectionsRunner(process.argv[2])
}
