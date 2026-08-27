import { inspectDeployedJavaScriptChunkGraph } from './deployed-javascript-graph.mjs'
import {
  unpublishedCppCoursePath,
  unpublishedCppJavaScriptMarkers,
  unpublishedCppLessonIds,
  unpublishedCppLessonPath,
  unpublishedCppLessonPrefix,
} from './unpublished-cpp-release-boundary.mjs'

const cliArgs = process.argv.slice(2)
const requireEnabled = cliArgs.includes('--require-enabled')
const unknownFlags = cliArgs.filter((arg) => arg.startsWith('--') && arg !== '--require-enabled')
if (unknownFlags.length > 0) throw new Error(`Unknown staging check option: ${unknownFlags[0]}`)
const origin = cliArgs.find((arg) => !arg.startsWith('--'))
  ?? 'https://see-pound-coffee-pie-phase2-staging.chris-c39.workers.dev'
const base = new URL(origin)
if (base.protocol !== 'https:' || base.pathname !== '/' || base.search || base.hash) {
  throw new Error('The staging check needs one HTTPS origin without a path, query, or hash.')
}

const expectedTitle = '<title>SeePoundCoffeePie | Programming from the beginning.</title>'

async function request(path, init = {}) {
  return fetch(new URL(path, base), { redirect: 'manual', ...init })
}

const shellResponse = await request('/')
const shell = await shellResponse.text()
if (
  shellResponse.status !== 200
  || !shell.includes(expectedTitle)
  || !shell.includes('<div id="root"></div>')
) {
  throw new Error('Staging did not return the SeePoundCoffeePie application shell.')
}

const requiredHeaders = {
  'content-security-policy': "frame-ancestors 'none'",
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
}
for (const [name, marker] of Object.entries(requiredHeaders)) {
  if (!(shellResponse.headers.get(name) ?? '').includes(marker)) {
    throw new Error(`Staging is missing the expected ${name} header.`)
  }
}

const entryPath = shell.match(/<script[^>]+src="([^"]+\.js)"[^>]*><\/script>/u)?.[1]
if (!entryPath) throw new Error('Staging did not name its JavaScript entry asset.')
const entryResponse = await request(entryPath)
const entry = await entryResponse.text()
if (
  entryResponse.status !== 200
  || !(entryResponse.headers.get('content-type') ?? '').includes('javascript')
  || !entry.includes('Your first programming lesson')
  || !entry.includes('python-data-tools')
) {
  throw new Error('Staging does not contain the reviewed teaching-first application entry.')
}

const deployedJavaScriptAssets = await inspectDeployedJavaScriptChunkGraph({
  allowedOrigin: base.origin,
  entryAsset: entry,
  entryAssetUrl: new URL(entryPath, base),
  request,
})
for (const [assetUrl, asset] of deployedJavaScriptAssets) {
  for (const marker of unpublishedCppJavaScriptMarkers) {
    if (asset.includes(marker.value)) {
      throw new Error(
        `The staging JavaScript chunk graph exposes unpublished Phase 5B ${marker.kind} in ${new URL(assetUrl).pathname}.`,
      )
    }
  }
}

for (const path of [
  '/courses',
  '/settings',
  '/courses/python-foundations',
  '/learn/python-foundations/py-first-spark/py-print',
  unpublishedCppCoursePath,
  unpublishedCppLessonPath,
]) {
  const response = await request(path)
  const body = await response.text()
  if (response.status !== 200 || !body.includes(expectedTitle) || !body.includes('<div id="root"></div>')) {
    throw new Error(`Staging route ${path} did not return the application shell.`)
  }
}

const statusResponse = await request('/api/runner/status')
const status = await statusResponse.json()
if (statusResponse.status !== 200 || status?.enabled !== requireEnabled || status?.version !== 1) {
  throw new Error(`The staging code checker is not ${requireEnabled ? 'enabled' : 'paused'} at the reviewed version.`)
}

const progressResponse = await request('/api/progress')
if (progressResponse.status !== 401) {
  throw new Error(`Unsigned staging progress returned ${progressResponse.status}, not 401.`)
}

for (const exerciseId of unpublishedCppLessonIds) {
  const response = await request('/api/runner/grants', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: base.origin,
    },
    body: JSON.stringify({ exerciseId }),
  })
  const body = await response.json()
  const safelyRejected = response.status === 404
    && ['That exercise does not support live execution.', 'This page does not have a code check yet.'].includes(body?.error)
  const safelyPaused = response.status === 503
    && ['Live code execution is temporarily paused.', 'The code checker is paused right now. Try again later.'].includes(body?.error)
  if (
    (!safelyRejected && !(safelyPaused && !requireEnabled))
    || typeof body?.grant === 'string'
    || response.headers.has('set-cookie')
  ) {
    throw new Error(`The unpublished staging exercise ${exerciseId} crossed the run-grant boundary.`)
  }
}

if (!requireEnabled) {
  console.warn('Staging verification warning: the code checker was paused, so absence of unpublished Phase 5B runner assignments was not proven.')
}

const sitemapResponse = await request('/sitemap.xml')
const sitemap = await sitemapResponse.text()
if (
  sitemapResponse.status !== 200
  || !sitemap.includes('<loc>https://seepoundcoffeepie.com/courses/python-data-tools</loc>')
  || sitemap.includes(`<loc>https://seepoundcoffeepie.com${unpublishedCppCoursePath}</loc>`)
  || sitemap.includes(`<loc>https://seepoundcoffeepie.com${unpublishedCppLessonPrefix}`)
) {
  throw new Error('The staging sitemap does not preserve the reviewed public and unpublished course boundary.')
}

console.log(`Staging site verification passed for ${base.origin}, the teaching-first entry, a ${deployedJavaScriptAssets.size}-asset JavaScript chunk graph, six routes, account shell, ${requireEnabled ? `enabled code checker with all ${unpublishedCppLessonIds.length} unpublished lesson assignments rejected` : 'paused code checker; assignment absence not proven'}, and sitemap.`)
