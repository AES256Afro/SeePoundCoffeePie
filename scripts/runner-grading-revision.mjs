import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')

export const runnerGradingSourcePaths = Object.freeze([
  'Dockerfile.runner.cpp',
  'Dockerfile.runner.csharp',
  'Dockerfile.runner.java',
  'Dockerfile.runner.python',
  'runner/CppCollectionsAnalyzer.py',
  'runner/CsharpProjectAnalyzer.cs',
  'runner/JavaProjectAnalyzer.java',
  'runner/PythonDataToolsAnalyzer.py',
  'runner/supervisor.py',
  'src/lib/evaluator.ts',
  'src/lib/runner-assignments.ts',
  'src/lib/runner-contract.ts',
  'src/runner-coordinator.ts',
  'wrangler.jsonc',
  'wrangler.staging.jsonc',
])

function normalizedGradingSource(path, contents) {
  if (path !== 'src/lib/runner-assignments.ts') return contents
  return contents.replace(
    /(export const RUNNER_GRADING_BEHAVIOR_REVISION =\s*)'sha256:[a-f0-9]{64}'/u,
    "$1'sha256:<normalized>'",
  )
}

function hashEntry(hash, label, contents) {
  hash.update(label)
  hash.update('\0')
  hash.update(String(Buffer.byteLength(contents)))
  hash.update('\0')
  hash.update(contents)
  hash.update('\0')
}

export async function computeRunnerGradingBehaviorRevision() {
  const hash = createHash('sha256')
  for (const path of runnerGradingSourcePaths) {
    const contents = normalizedGradingSource(
      path,
      await readFile(resolve(projectRoot, path), 'utf8'),
    )
    hashEntry(hash, path, contents)
  }

  const packageLock = JSON.parse(await readFile(resolve(projectRoot, 'package-lock.json'), 'utf8'))
  const sandboxPackage = packageLock.packages?.['node_modules/@cloudflare/sandbox']
  hashEntry(hash, '@cloudflare/sandbox', JSON.stringify({
    version: sandboxPackage?.version ?? null,
    resolved: sandboxPackage?.resolved ?? null,
    integrity: sandboxPackage?.integrity ?? null,
  }))
  return `sha256:${hash.digest('hex')}`
}

if (
  process.argv[1]
  && import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  console.log(await computeRunnerGradingBehaviorRevision())
}
