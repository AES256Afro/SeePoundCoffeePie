import { readFile } from 'node:fs/promises'

const origin = (process.argv[2] ?? '').replace(/\/$/u, '')
const onlyLanguage = process.argv[3] ?? ''
if (!origin.startsWith('https://')) {
  throw new Error('Pass the HTTPS staging origin as the first argument.')
}

let learnerCookie = ''

async function responseJson(response, label) {
  const body = await response.json().catch(() => null)
  if (!response.ok) throw new Error(`${label} failed (${response.status}): ${JSON.stringify(body)}`)
  return body
}

async function grant(exerciseId) {
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
  const body = await responseJson(response, `grant ${exerciseId}`)
  if (typeof body.grant !== 'string') throw new Error(`grant ${exerciseId} returned no signed grant`)
  return body.grant
}

async function run(exerciseId, language, source) {
  const accepted = await submit(exerciseId, language, source)
  return poll(accepted, exerciseId)
}

async function submit(exerciseId, language, source) {
  const signedGrant = await grant(exerciseId)
  const accepted = await responseJson(await fetch(`${origin}/api/runner/runs`, {
    method: 'POST',
    headers: {
      Origin: origin,
      Cookie: learnerCookie,
      'Content-Type': 'application/json',
      'X-Runner-Grant': signedGrant,
    },
    body: JSON.stringify({ version: 1, language, source }),
  }), `submit ${exerciseId}`)

  if (accepted.status !== 'queued' || typeof accepted.runId !== 'string') {
    throw new Error(`submit ${exerciseId} returned an invalid queue receipt`)
  }
  return accepted
}

async function poll(accepted, exerciseId) {
  const deadline = Date.now() + 180_000
  while (Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, Math.max(300, accepted.pollAfterMs ?? 650)))
    const response = await fetch(`${origin}/api/runner/runs/${encodeURIComponent(accepted.runId)}`, {
      headers: { Cookie: learnerCookie, Accept: 'application/json' },
    })
    const result = await responseJson(response, `result ${exerciseId}`)
    if (result.status === 'queued' || result.status === 'running') continue
    return result
  }
  throw new Error(`${exerciseId} did not finish before the staging deadline`)
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

async function fixture(name) {
  return readFile(new URL(`../runner/fixtures/${name}`, import.meta.url), 'utf8')
}

const status = await responseJson(await fetch(`${origin}/api/runner/status`), 'runner status')
assert(status.enabled === true, 'staging runner kill switch is not enabled')

const successCases = [
  ['py-launch', 'python', 'hello.python.txt'],
  ['cpp-reactor-report', 'cpp', 'hello.cpp.txt'],
  ['cs-shield-report', 'csharp', 'hello.csharp.txt'],
  ['java-galley-report', 'java', 'hello.java.txt'],
]

let firstRunId = ''
for (const [exerciseId, language, file] of successCases.filter((entry) => !onlyLanguage || entry[1] === onlyLanguage)) {
  const result = await run(exerciseId, language, await fixture(file))
  firstRunId ||= result.runId
  assert(
    result.outcome === 'completed',
    `${language} did not complete: ${result.outcome}, exit ${result.exitCode}, limit ${result.limit}\n${result.stderr}`,
  )
  assert(result.tests.every((test) => test.passed), `${language} did not pass its assignment checks`)
  console.log(`pass staging ${language}: completed in ${result.durationMs} ms`)
}

if (onlyLanguage) process.exit(0)

const network = await run('py-launch', 'python', await fixture('network.python.txt'))
assert(network.outcome === 'runtime_error', `network attempt returned ${network.outcome}`)
assert(
  /Operation not permitted|Errno 1/iu.test(network.stderr),
  `seccomp did not return an explicit permission denial: ${JSON.stringify(network.stderr)}`,
)
console.log('pass staging network: socket syscalls denied by seccomp')

const cpu = await run('py-launch', 'python', await fixture('loop.python.txt'))
assert(cpu.outcome === 'limit_exceeded' && cpu.limit === 'cpu_time', 'CPU loop was not stopped by the CPU limit')
console.log('pass staging CPU: infinite loop stopped')

const markerWriter = `from pathlib import Path\nPath("/tmp/spp-cross-run-marker").write_text("private")\nship_name = "Wayfarer"\npower_cells = 3\nprint("Ship:", ship_name)\nprint("Cells:", power_cells)\n`
const markerReader = `import os\nfrom pathlib import Path\nsecret_names = {"SESSION_SECRET", "GITHUB_CLIENT_SECRET"}\nleaked = Path("/tmp/spp-cross-run-marker").exists() or any(name in os.environ for name in secret_names)\nship_name = "LEAK" if leaked else "Wayfarer"\npower_cells = 3\nprint("Ship:", ship_name)\nprint("Cells:", power_cells)\n`
const written = await run('py-launch', 'python', markerWriter)
const isolated = await run('py-launch', 'python', markerReader)
assert(written.tests.every((test) => test.passed), 'marker setup run failed')
assert(isolated.tests.every((test) => test.passed), 'writable state or a secret-bearing environment variable crossed into the next run')
console.log('pass staging isolation: no writable state or control-plane secret crossed runs')

// Use a fresh signed guest identity so this adversarial group has its own
// per-learner rate window. The same IP and global limits still apply.
learnerCookie = ''

const output = await run('py-launch', 'python', await fixture('output.python.txt'))
assert(output.outcome === 'limit_exceeded' && output.limit === 'stdout_output', 'output flood was not stopped')
assert(output.stdout.length <= 64_000, `bounded stdout returned ${output.stdout.length} characters`)
console.log('pass staging output: flood stopped and response remained capped')

const memory = await run('py-launch', 'python', await fixture('memory.python.txt'))
assert(memory.outcome === 'limit_exceeded' && memory.limit === 'memory', 'memory growth was not stopped')
console.log('pass staging memory: process tree stopped at the memory ceiling')

const disk = await run('py-launch', 'python', await fixture('disk.python.txt'))
assert(disk.outcome === 'limit_exceeded' && disk.limit === 'writable_storage', 'disk growth was not stopped')
console.log('pass staging disk: allocated writable storage remained bounded')

const compileError = await run('cpp-reactor-report', 'cpp', await fixture('invalid.cpp.txt'))
assert(compileError.outcome === 'compile_error', `invalid C++ returned ${compileError.outcome}`)
assert(compileError.diagnostic?.title && compileError.diagnostic.title !== 'The runner had a problem', 'compile error was not translated for a beginner')
assert(!/\/workspace\//u.test(compileError.stderr), 'raw host workspace path escaped diagnostic sanitization')
console.log('pass staging diagnostics: compile failure was sanitized and explained')

// A third simultaneous submission by one guest must be rejected while the
// first two infinite loops are still pending. Poll both accepted runs so this
// test leaves no intentional work behind.
learnerCookie = ''
const pendingOne = await submit('py-launch', 'python', await fixture('loop.python.txt'))
const pendingTwo = await submit('py-launch', 'python', await fixture('loop.python.txt'))
const pendingGrant = await grant('py-launch')
const pendingThird = await fetch(`${origin}/api/runner/runs`, {
  method: 'POST',
  headers: {
    Origin: origin,
    Cookie: learnerCookie,
    'Content-Type': 'application/json',
    'X-Runner-Grant': pendingGrant,
  },
  body: JSON.stringify({
    version: 1,
    language: 'python',
    source: await fixture('loop.python.txt'),
  }),
})
assert(pendingThird.status === 429, `third simultaneous learner run returned ${pendingThird.status}, expected 429`)
const [pendingResultOne, pendingResultTwo] = await Promise.all([
  poll(pendingOne, 'pending loop one'),
  poll(pendingTwo, 'pending loop two'),
])
assert(
  [pendingResultOne, pendingResultTwo].every((result) => result.outcome === 'limit_exceeded'),
  'accepted saturation probes did not terminate at their resource limit',
)
console.log('pass staging saturation: per-learner pending cap rejected the third run')

const stranger = await fetch(`${origin}/api/runner/runs/${encodeURIComponent(firstRunId)}`)
assert(stranger.status === 404, `cross-user result read returned ${stranger.status}, expected 404`)
console.log('pass staging authorization: a different guest cannot read a run result')

console.log('Cloudflare staging runner checks passed.')
