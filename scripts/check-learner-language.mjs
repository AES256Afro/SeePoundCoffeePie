import { execFileSync } from 'node:child_process'
import { existsSync, lstatSync, readFileSync } from 'node:fs'

const rules = [
  ['obvious language', /\bobvious(?:ly)?\b/iu],
  ['trivial language', /\btrivial(?:ly)?\b/iu],
  ['assumed knowledge', /\b(?:as you (?:already )?know|you already know|you should know|everyone knows)\b/iu],
  ['dismissive certainty', /\bstraightforward\b/iu],
  ['minimized definition', /\bsimply means\b/iu],
  ['minimized instruction', /\b(?:just|simply) (?:run|type|click|press|enter|use|choose|select|copy|paste|install|open|write)\b/iu],
  ['easy judgment', /\b(?:(?:this|that|it) is easy|easy enough)\b/iu],
]

const selfTests = [
  'This is obviously correct.',
  'You already know what a shell is.',
  'Just run this command.',
  'Mutation simply means change.',
]

for (const example of selfTests) {
  if (!rules.some(([, pattern]) => pattern.test(example))) {
    throw new Error(`Learner-language rule self-test did not detect: ${example}`)
  }
}

const paths = execFileSync(
  'git',
  ['ls-files', '--cached', '--others', '--exclude-standard', '-z', 'src'],
).toString('utf8').split('\0').filter(Boolean)

const learnerSourcePaths = paths.filter((path) => {
  if (!/\.(?:ts|tsx)$/u.test(path)) return false
  if (/\.(?:test|server)\.(?:ts|tsx)$/u.test(path)) return false
  if (/\.generated\.(?:ts|tsx)$/u.test(path)) return false
  if (path === 'src/worker.ts' || path === 'src/cloudflare-runtime.d.ts' || path === 'src/types.ts') return false
  if (path.startsWith('src/runner-coordinator')) return false
  return true
})

const decoder = new TextDecoder('utf-8', { fatal: true })
const findings = []

for (const path of learnerSourcePaths) {
  if (!existsSync(path) || !lstatSync(path).isFile()) continue

  let content
  try {
    content = decoder.decode(readFileSync(path))
  } catch {
    continue
  }

  content.split(/\r?\n/u).forEach((line, index) => {
    if (line.includes('learner-language-allow')) return

    for (const [label, pattern] of rules) {
      if (pattern.test(line)) {
        findings.push(`${path}:${index + 1}: ${label}`)
      }
    }
  })
}

if (findings.length > 0) {
  throw new Error(
    `No-assumed-knowledge language check failed:\n${findings.join('\n')}\n` +
    'Rewrite the learner-facing copy to define the idea or give the missing context. ' +
    'Use learner-language-allow only when a lesson deliberately quotes and explains the phrase.',
  )
}

console.log(
  `No-assumed-knowledge language check passed across ${learnerSourcePaths.length} learner-facing source files.`,
)
