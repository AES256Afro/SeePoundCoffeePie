import { readFile } from 'node:fs/promises'

import {
  assertReviewedApplicationEntry,
  assertReviewedInitialCourseRegistry,
  assertReviewedPracticalPythonAssets,
} from './deployed-course-assets.mjs'
import { inspectDeployedJavaScriptChunkGraph } from './deployed-javascript-graph.mjs'
import {
  assertReviewedPublishedGrant,
  assertReviewedRunnerStatus,
  assertReviewedTeachingOnlyGrantRejection,
} from './runner-deployment-checks.mjs'
import {
  practicalCppServerOwnedMarkers,
} from './practical-cpp-candidate-app-guards.mjs'
import {
  inspectPracticalCppCandidateSitemap,
  practicalCppCandidateLessonUrls,
} from './practical-cpp-candidate-sitemap.mjs'
import {
  privateCourseIsPublished,
  privateCourseReleaseState,
  practicalCppPrivateJavaScriptMarkers,
  practicalCppRunnerBackedLessonIds,
  practicalCppTeachingOnlyLessonIds,
  unpublishedCppCourseId,
  unpublishedCppCoursePath,
  unpublishedCppLessonPath,
} from './unpublished-cpp-release-boundary.mjs'

if (
  privateCourseReleaseState(unpublishedCppCourseId) !== 'published'
  || !privateCourseIsPublished(unpublishedCppCourseId)
) {
  throw new Error('The staging boundary check requires Practical C++ to be published.')
}

const practicalCppPrivateMarkers = practicalCppServerOwnedMarkers({
  catalogMarkers: practicalCppPrivateJavaScriptMarkers.map(({ value }) => value),
  serverAssessmentSource: await readFile(
    new URL('../src/data/cpp-collections-records.server.ts', import.meta.url),
    'utf8',
  ),
})
const practicalCppTeachingData = await readFile(
  new URL('../src/data/cpp-collections-records-course-packed.generated.json', import.meta.url),
)

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
const publishedRunnerExerciseId = 'py-print'

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
assertReviewedApplicationEntry({
  asset: entry,
  contentType: entryResponse.headers.get('content-type') ?? '',
  httpStatus: entryResponse.status,
  label: 'Staging',
  requiredMarkers: ['Your first programming lesson'],
})

const deployedJavaScriptAssets = await inspectDeployedJavaScriptChunkGraph({
  allowedOrigin: base.origin,
  entryAsset: entry,
  entryAssetUrl: new URL(entryPath, base),
  request,
})
const initialJavaScriptAssetUrls = assertReviewedInitialCourseRegistry({
  assets: deployedJavaScriptAssets,
  html: shell,
  label: 'Staging',
})
for (const [assetUrl, asset] of deployedJavaScriptAssets) {
  for (const marker of practicalCppPrivateMarkers) {
    if (asset.includes(marker)) {
      throw new Error(
        `The staging JavaScript chunk graph exposes a private Practical C++ server marker in ${new URL(assetUrl).pathname}.`,
      )
    }
  }
}

assertReviewedPracticalPythonAssets(
  deployedJavaScriptAssets,
  'Staging',
  initialJavaScriptAssetUrls,
)

const practicalCppLoaders = [...deployedJavaScriptAssets].filter(([assetUrl]) => (
  /\/assets\/cpp-collections-records-course-packed-[A-Za-z0-9_-]+\.js$/u.test(
    new URL(assetUrl).pathname,
  )
))
if (practicalCppLoaders.length !== 1) {
  throw new Error('Staging does not contain one unique Practical C++ teaching-data loader.')
}
const [practicalCppLoaderUrl, practicalCppLoaderAsset] = practicalCppLoaders[0]
if (initialJavaScriptAssetUrls.has(practicalCppLoaderUrl)) {
  throw new Error('The Practical C++ teaching-data loader entered the initial staging graph.')
}
const practicalCppJsonNames = [...practicalCppLoaderAsset.matchAll(
  /cpp-collections-records-course-packed\.generated-[A-Za-z0-9_-]{6,}\.json/gu,
)].map((match) => match[0])
if (new Set(practicalCppJsonNames).size !== 1) {
  throw new Error('The staging Practical C++ loader does not own exactly one teaching-data asset.')
}
const [practicalCppJsonName] = practicalCppJsonNames
const practicalCppJsonOwners = [...deployedJavaScriptAssets].filter(([, asset]) => (
  asset.includes(practicalCppJsonName)
))
if (
  practicalCppJsonOwners.length !== 1
  || practicalCppJsonOwners[0][0] !== practicalCppLoaderUrl
  || [...initialJavaScriptAssetUrls].some((assetUrl) => (
    deployedJavaScriptAssets.get(assetUrl)?.includes(practicalCppJsonName)
  ))
) {
  throw new Error('The staging Practical C++ teaching data is not isolated behind its reviewed lazy loader.')
}
const practicalCppJsonResponse = await request(`/assets/${practicalCppJsonName}`)
const practicalCppJson = Buffer.from(await practicalCppJsonResponse.arrayBuffer())
if (
  practicalCppJsonResponse.status !== 200
  || !(practicalCppJsonResponse.headers.get('content-type') ?? '').includes('json')
  || !practicalCppJson.equals(practicalCppTeachingData)
) {
  throw new Error('The staging Practical C++ teaching data does not match the reviewed generated asset.')
}
for (const marker of practicalCppPrivateMarkers) {
  if (practicalCppJson.includes(marker)) {
    throw new Error('The staging Practical C++ teaching data exposes a private server-owned marker.')
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
assertReviewedRunnerStatus({
  body: status,
  httpStatus: statusResponse.status,
  label: 'staging',
  requireEnabled,
})

const publishedGrantResponse = await request('/api/runner/grants', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Origin: base.origin,
  },
  body: JSON.stringify({ exerciseId: publishedRunnerExerciseId }),
})
const publishedGrant = await publishedGrantResponse.json()
assertReviewedPublishedGrant({
  body: publishedGrant,
  exerciseId: publishedRunnerExerciseId,
  expectedLanguage: 'python',
  hasSetCookie: publishedGrantResponse.headers.has('set-cookie'),
  httpStatus: publishedGrantResponse.status,
  label: 'staging',
  requireEnabled,
})

const progressResponse = await request('/api/progress')
if (progressResponse.status !== 401) {
  throw new Error(`Unsigned staging progress returned ${progressResponse.status}, not 401.`)
}

async function requestRunnerGrant(exerciseId) {
  const response = await request('/api/runner/grants', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: base.origin,
    },
    body: JSON.stringify({ exerciseId }),
  })
  let body
  try {
    body = await response.json()
  } catch {
    throw new Error(`The staging runner returned unreadable JSON while checking ${exerciseId}.`)
  }
  return { body, response }
}

for (const exerciseId of practicalCppRunnerBackedLessonIds) {
  const { body, response } = await requestRunnerGrant(exerciseId)
  assertReviewedPublishedGrant({
    body,
    exerciseId,
    expectedLanguage: 'cpp',
    hasSetCookie: response.headers.has('set-cookie'),
    httpStatus: response.status,
    label: 'staging',
    requireEnabled,
  })
}

for (const exerciseId of practicalCppTeachingOnlyLessonIds) {
  const { body, response } = await requestRunnerGrant(exerciseId)
  assertReviewedTeachingOnlyGrantRejection({
    body,
    exerciseId,
    hasSetCookie: response.headers.has('set-cookie'),
    httpStatus: response.status,
    label: 'staging',
  })
}

const sitemapResponse = await request('/sitemap.xml')
const sitemap = await sitemapResponse.text()
if (
  sitemapResponse.status !== 200
  || !sitemap.includes('<loc>https://seepoundcoffeepie.com/courses/python-data-tools</loc>')
) {
  throw new Error('The staging sitemap does not preserve the reviewed public course boundary.')
}
const practicalCppSitemap = inspectPracticalCppCandidateSitemap(sitemap)

for (const practicalCppLessonUrl of practicalCppCandidateLessonUrls) {
  const path = new URL(practicalCppLessonUrl).pathname
  const response = await request(path)
  const body = await response.text()
  if (response.status !== 200 || !body.includes(expectedTitle) || !body.includes('<div id="root"></div>')) {
    throw new Error(`Staging route ${path} did not return the application shell.`)
  }
}

console.log(`Staging site verification passed for ${base.origin}, the Practical Python and Practical C++ lazy assets, a ${deployedJavaScriptAssets.size}-asset JavaScript chunk graph, exact ${practicalCppSitemap.lessonCount}-lesson C++ sitemap, six representative routes, all ${practicalCppCandidateLessonUrls.length} C++ lesson routes, account shell, configured ${requireEnabled ? 'enabled code checker with reviewed Python and C++ grants' : 'paused code checker with executable grants rejected'}, ${practicalCppRunnerBackedLessonIds.length} runner-backed C++ assignments, and ${practicalCppTeachingOnlyLessonIds.length} teaching-only C++ assignments rejected with 404.`)
