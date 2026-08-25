const origin = (process.argv[2] ?? '').replace(/\/$/u, '')
if (!origin.startsWith('https://')) {
  throw new Error('Pass the HTTPS academy origin as the first argument.')
}

const exerciseId = 'project-cpp-final'
let learnerCookie = ''

const correctSource = [
  '#include <iostream>',
  '#include <string>',
  '',
  'int main() {',
  '    int points_per_detail = 5;',
  '',
  '    std::cout << "Welcome to the Observation Desk!\\n";',
  '    std::cout << "What is your name?\\n";',
  '    std::string observer_name;',
  '    std::getline(std::cin, observer_name);',
  '',
  '    std::cout << "How many details did you notice?\\n";',
  '    int details = 0;',
  '    std::cin >> details;',
  '',
  '    int focus_points = details * points_per_detail;',
  '    std::cout << observer_name << ", you recorded " << details',
  '              << " details and earned " << focus_points',
  '              << " focus points.\\n";',
  '',
  '    return 0;',
  '}',
].join('\n')

const aliasSource = [
  '#include <iostream>',
  '#include <string>',
  '',
  'int main() {',
  '    int rule = 5;',
  '    std::cout << "Welcome to the Observation Desk!\\n";',
  '    std::cout << "What is your name?\\n";',
  '    std::string person;',
  '    std::getline(std::cin, person);',
  '    std::cout << "How many details did you notice?\\n";',
  '    int amount = 0;',
  '    std::cin >> amount;',
  '    int score = amount * rule;',
  '    std::cout << person << ", you recorded " << amount',
  '              << " details and earned " << score',
  '              << " focus points.\\n";',
  '    return 0;',
  '}',
].join('\n')

const unreachableRequiredSource = [
  '#include <iostream>',
  '#include <string>',
  '',
  'int main() {',
  '    int rule = 5;',
  '    std::cout << "Welcome to the Observation Desk!\\n";',
  '    std::cout << "What is your name?\\n";',
  '    std::string person;',
  '    std::getline(std::cin, person);',
  '    std::cout << "How many details did you notice?\\n";',
  '    int amount = 0;',
  '    std::cin >> amount;',
  '    int score = amount * rule;',
  '    std::cout << person << ", you recorded " << amount',
  '              << " details and earned " << score',
  '              << " focus points.\\n";',
  '    return 0;',
  '',
  '    int points_per_detail = 5;',
  '    std::string observer_name;',
  '    std::getline(std::cin, observer_name);',
  '    int details = 0;',
  '    std::cin >> details;',
  '    int focus_points = details * points_per_detail;',
  '    std::cout << observer_name << details << focus_points;',
  '}',
].join('\n')

const macroSource = [
  '#include <iostream>',
  '#include <string>',
  '#define points_per_detail 5',
  '',
  'int main() {',
  '    std::cout << "Welcome to the Observation Desk!\\n";',
  '    std::cout << "What is your name?\\n";',
  '    std::string observer_name;',
  '    std::getline(std::cin, observer_name);',
  '    std::cout << "How many details did you notice?\\n";',
  '    int details = 0;',
  '    std::cin >> details;',
  '    int focus_points = details * points_per_detail;',
  '    std::cout << observer_name << ", you recorded " << details',
  '              << " details and earned " << focus_points',
  '              << " focus points.\\n";',
  '    return 0;',
  '}',
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
  const body = await responseJson(response, 'C++ project grant')
  assert(typeof body.grant === 'string', 'C++ project grant returned no signed value')
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
    body: JSON.stringify({ version: 1, language: 'cpp', source, stdin, purpose }),
  }), `C++ project ${purpose} submission`)
  assert(
    accepted.status === 'queued' && typeof accepted.runId === 'string',
    'C++ project submission returned an invalid queue receipt',
  )

  const deadline = Date.now() + 300_000
  while (Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, Math.max(300, accepted.pollAfterMs ?? 650)))
    const result = await responseJson(await fetch(
      `${origin}/api/runner/runs/${encodeURIComponent(accepted.runId)}`,
      { headers: { Cookie: learnerCookie, Accept: 'application/json' } },
    ), `C++ project ${purpose} result`)
    if (result.status === 'queued' || result.status === 'running') continue
    return result
  }
  throw new Error(`C++ project ${purpose} did not finish within five minutes`)
}

function assertProtectedResult(result) {
  const serialized = JSON.stringify(result)
  const privateMarkers = [
    'Morgan',
    'Riley',
    'Sam Lee',
    'final-hidden-one-detail',
    'final-hidden-seven-details',
    'final-hidden-spaced-name',
  ]
  for (const marker of privateMarkers) {
    assert(!serialized.includes(marker), `protected C++ project value escaped in the result: ${marker}`)
  }
  assert(!serialized.includes('cpp_analysis'), 'trusted C++ analysis escaped in the public result')
  assert(!serialized.includes('"declarations"'), 'trusted C++ declaration facts escaped in the public result')
  assert(!serialized.includes('"main_signature"'), 'trusted C++ main-signature fact escaped in the public result')
}

function assertBehaviorPassed(result, label) {
  assert(result.outcome === 'completed', `${label} returned ${result.outcome}`)
  assert(Array.isArray(result.tests) && result.tests.length === 12, `${label} returned the wrong test count`)
  assert(result.tests.slice(0, 4).every((test) => test.passed), `${label} did not pass all four behavior cases`)
  assertProtectedResult(result)
}

const status = await responseJson(await fetch(`${origin}/api/runner/status`), 'runner status')
assert(status.enabled === true, 'runner kill switch is not enabled')

const practiceSource = [
  '#include <iostream>',
  '#include <string>',
  'int main() {',
  '    std::string message;',
  '    std::getline(std::cin, message);',
  '    std::cout << message << "\\n";',
  '    return 0;',
  '}',
].join('\n')
const practice = await run(practiceSource, 'run', 'Practice value\n')
assert(practice.outcome === 'completed', `C++ project practice run returned ${practice.outcome}`)
assert(practice.stdout === 'Practice value\n', 'C++ project practice run returned the wrong console output')
assert(Array.isArray(practice.tests) && practice.tests.length === 0, 'C++ project practice run exposed grading checks')
assertProtectedResult(practice)
console.log('pass C++ project practice: caller input ran without grading or trusted-analysis output')

const alias = await run(aliasSource, 'check')
assertBehaviorPassed(alias, 'C++ alias check')
assert(alias.tests[4].passed && alias.tests[5].passed, 'valid headers or main frame were not recognized')
assert(alias.tests.slice(6).every((test) => !test.passed), 'renamed substitutes satisfied authored C++ requirements')
console.log('pass C++ project integrity: behavior aliases passed while six authored structures were rejected')

const unreachable = await run(unreachableRequiredSource, 'check')
assertBehaviorPassed(unreachable, 'C++ unreachable-code check')
assert(
  unreachable.tests.slice(4).every((test) => !test.passed),
  'required code after an early return satisfied protected C++ requirements',
)
console.log('pass C++ project integrity: required statements after an early return were rejected')

const macro = await run(macroSource, 'check')
assertBehaviorPassed(macro, 'C++ macro check')
assert(
  macro.tests.slice(4).every((test) => !test.passed),
  'macro-expanded source satisfied protected C++ requirements',
)
console.log('pass C++ project integrity: macro-expanded structural facts failed closed')

const complete = await run(correctSource, 'check')
assertBehaviorPassed(complete, 'complete C++ project check')
assert(complete.tests.every((test) => test.passed), 'complete C++ project did not pass all 12 checks')
console.log(`pass C++ project assessment: all 12 checks passed in ${complete.durationMs} ms`)

console.log('Phase 4B C++ project runner checks passed.')
