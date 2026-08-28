import { execFileSync } from 'node:child_process'
import { existsSync, lstatSync, readFileSync } from 'node:fs'

const forbidden = String.fromCodePoint(0x2014)
const paths = execFileSync(
  'git',
  ['ls-files', '--cached', '--others', '--exclude-standard', '-z'],
).toString('utf8').split('\0').filter(Boolean)
const decoder = new TextDecoder('utf-8', { fatal: true })
const findings = []

for (const path of paths) {
  if (!existsSync(path)) continue
  if (!lstatSync(path).isFile()) continue

  const bytes = readFileSync(path)
  if (bytes.includes(0)) continue

  let content
  try {
    content = decoder.decode(bytes)
  } catch {
    continue
  }

  content.split(/\r?\n/u).forEach((line, index) => {
    if (line.includes(forbidden)) findings.push(`${path}:${index + 1}`)
  })
}

if (findings.length > 0) {
  throw new Error(`Forbidden U+2014 character found at:\n${findings.join('\n')}`)
}

console.log(`Text-style verification passed across ${paths.length} tracked and release-candidate files.`)
