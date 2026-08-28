import { Resolver } from 'node:dns/promises'
import { readFile } from 'node:fs/promises'
import { request as httpsRequest } from 'node:https'

import {
  inspectDeployedJavaScriptChunkGraph,
  uniqueDeployedJavaScriptAssetByPath,
} from './deployed-javascript-graph.mjs'
import {
  assertReviewedApplicationEntry,
  assertReviewedInitialCourseRegistry,
  assertReviewedPracticalPythonAssets,
} from './deployed-course-assets.mjs'
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
  throw new Error('The production boundary check requires Practical C++ to be published.')
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

const canonical = 'https://seepoundcoffeepie.com/'
const expectedTitle = '<title>SeePoundCoffeePie | Programming from the beginning.</title>'
const socialImageUrl = 'https://seepoundcoffeepie.com/social-card-v7.jpg'
const practicalPythonCourseUrl = 'https://seepoundcoffeepie.com/courses/python-data-tools'
const practicalPythonLessonUrl = 'https://seepoundcoffeepie.com/learn/python-data-tools/py-data-return-values/pydata1-retrieve-call'
const publishedRunnerExerciseId = 'py-print'
const cliArguments = process.argv.slice(2)
const unsupportedArguments = cliArguments.filter((argument) => argument !== '--allow-paused')
if (unsupportedArguments.length > 0) {
  throw new Error(`Unsupported check-live argument: ${unsupportedArguments.join(', ')}`)
}
const allowPaused = cliArguments.includes('--allow-paused')
async function requestWithFreshDns(input, init = {}) {
  try {
    return await fetch(input, init)
  } catch (error) {
    if (error?.cause?.code !== 'ENOTFOUND') throw error

    const url = new URL(input)
    const resolver = new Resolver()
    resolver.setServers(['1.1.1.1'])
    const [address] = await resolver.resolve4(url.hostname)

    return await new Promise((resolve, reject) => {
      const request = httpsRequest(url, {
        method: init.method ?? 'GET',
        headers: init.headers,
        lookup: (_hostname, options, callback) => {
          if (options?.all) {
            callback(null, [{ address, family: 4 }])
          } else {
            callback(null, address, 4)
          }
        },
      }, (incoming) => {
        const chunks = []
        incoming.on('data', (chunk) => chunks.push(chunk))
        incoming.on('end', () => {
          const headers = new Headers()
          for (const [name, value] of Object.entries(incoming.headers)) {
            if (Array.isArray(value)) {
              for (const item of value) headers.append(name, item)
            } else if (value !== undefined) {
              headers.set(name, value)
            }
          }
          resolve(new Response(Buffer.concat(chunks), {
            status: incoming.statusCode,
            statusText: incoming.statusMessage,
            headers,
          }))
        })
      })
      request.on('error', reject)
      if (init.body !== undefined) request.write(init.body)
      request.end()
    })
  }
}

const canonicalOrigin = new URL(canonical).origin

const response = await requestWithFreshDns(canonical, { redirect: 'manual' })
if (response.status !== 200) {
  throw new Error(`Expected ${canonical} to return 200, received ${response.status}`)
}

const body = await response.text()
if (!body.includes(expectedTitle) || !body.includes('<div id="root"></div>')) {
  throw new Error('The canonical domain did not return the SeePoundCoffeePie application shell')
}

const entryAssetPath = body.match(/<script[^>]+src="([^"]+\.js)"[^>]*><\/script>/u)?.[1]
if (!entryAssetPath) {
  throw new Error('The live application shell did not name its JavaScript entry asset')
}

const entryAssetUrl = new URL(entryAssetPath, canonical)
const entryAssetResponse = await requestWithFreshDns(entryAssetUrl, {
  redirect: 'manual',
})
const entryAsset = await entryAssetResponse.text()
assertReviewedApplicationEntry({
  asset: entryAsset,
  contentType: entryAssetResponse.headers.get('content-type') ?? '',
  httpStatus: entryAssetResponse.status,
  label: 'Production',
  requiredMarkers: ['Your first programming lesson'],
})

const deployedJavaScriptAssets = await inspectDeployedJavaScriptChunkGraph({
  allowedOrigin: canonicalOrigin,
  entryAsset,
  entryAssetUrl,
  request: requestWithFreshDns,
})
const initialJavaScriptAssetUrls = assertReviewedInitialCourseRegistry({
  assets: deployedJavaScriptAssets,
  html: body,
  label: 'Production',
})
for (const [assetUrl, asset] of deployedJavaScriptAssets) {
  for (const marker of practicalCppPrivateMarkers) {
    if (asset.includes(marker)) {
      throw new Error(
        `The deployed JavaScript chunk graph exposes a private Practical C++ server marker in ${new URL(assetUrl).pathname}`,
      )
    }
  }
}

assertReviewedPracticalPythonAssets(
  deployedJavaScriptAssets,
  'Production',
  initialJavaScriptAssetUrls,
)

const practicalCppLoader = uniqueDeployedJavaScriptAssetByPath(
  deployedJavaScriptAssets,
  /\/assets\/cpp-collections-records-course-packed-[A-Za-z0-9_-]+\.js$/u,
)
if (!practicalCppLoader) {
  throw new Error('The deployed JavaScript graph does not contain one unique Practical C++ teaching-data loader')
}
const [practicalCppLoaderUrl, practicalCppLoaderAsset] = practicalCppLoader
if (initialJavaScriptAssetUrls.has(practicalCppLoaderUrl)) {
  throw new Error('The Practical C++ teaching-data loader entered the initial application graph')
}
const practicalCppJsonNames = [...practicalCppLoaderAsset.matchAll(
  /cpp-collections-records-course-packed\.generated-[A-Za-z0-9_-]{6,}\.json/gu,
)].map((match) => match[0])
if (new Set(practicalCppJsonNames).size !== 1) {
  throw new Error('The Practical C++ loader does not own exactly one content-hashed teaching-data asset')
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
  throw new Error('The Practical C++ teaching-data asset is not isolated behind its one reviewed lazy loader')
}
const practicalCppJsonResponse = await requestWithFreshDns(
  new URL(`/assets/${practicalCppJsonName}`, canonical),
  { redirect: 'manual' },
)
const practicalCppJson = Buffer.from(await practicalCppJsonResponse.arrayBuffer())
if (
  practicalCppJsonResponse.status !== 200
  || !(practicalCppJsonResponse.headers.get('content-type') ?? '').includes('json')
  || !practicalCppJson.equals(practicalCppTeachingData)
) {
  throw new Error('The deployed Practical C++ teaching data does not exactly match the reviewed generated asset')
}
for (const marker of practicalCppPrivateMarkers) {
  if (practicalCppJson.includes(marker)) {
    throw new Error('The deployed Practical C++ teaching data exposes a private server-owned marker')
  }
}

const sitemapResponse = await requestWithFreshDns(new URL('/sitemap.xml', canonical), { redirect: 'manual' })
const sitemap = await sitemapResponse.text()
if (
  sitemapResponse.status !== 200
  || !(sitemapResponse.headers.get('content-type') ?? '').includes('xml')
  || !sitemap.includes(`<loc>${practicalPythonCourseUrl}</loc>`)
  || !sitemap.includes(`<loc>${practicalPythonLessonUrl}</loc>`)
) {
  throw new Error('The live sitemap does not publish the Practical Python course and first lesson')
}
const practicalCppSitemap = inspectPracticalCppCandidateSitemap(sitemap)

const statusResponse = await requestWithFreshDns(new URL('/api/runner/status', canonical), {
  redirect: 'manual',
})
let runnerStatus
try {
  runnerStatus = await statusResponse.json()
} catch {
  throw new Error('The live code checker status returned unreadable JSON')
}
assertReviewedRunnerStatus({
  body: runnerStatus,
  httpStatus: statusResponse.status,
  label: 'live',
  requireEnabled: !allowPaused,
})

const grantUrl = new URL('/api/runner/grants', canonical)
const grantOrigin = new URL(canonical).origin
const publishedGrantResponse = await requestWithFreshDns(grantUrl, {
  method: 'POST',
  redirect: 'manual',
  headers: {
    Origin: grantOrigin,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ exerciseId: publishedRunnerExerciseId }),
})
let publishedGrantResult
try {
  publishedGrantResult = await publishedGrantResponse.json()
} catch {
  throw new Error(`The live code checker returned unreadable JSON for ${publishedRunnerExerciseId}`)
}
assertReviewedPublishedGrant({
  body: publishedGrantResult,
  exerciseId: publishedRunnerExerciseId,
  expectedLanguage: 'python',
  hasSetCookie: publishedGrantResponse.headers.has('set-cookie'),
  httpStatus: publishedGrantResponse.status,
  label: 'live',
  requireEnabled: !allowPaused,
})

async function requestRunnerGrant(exerciseId) {
  const grantResponse = await requestWithFreshDns(grantUrl, {
    method: 'POST',
    redirect: 'manual',
    headers: {
      Origin: grantOrigin,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ exerciseId }),
  })
  const grantBody = await grantResponse.text()
  let grantResult
  try {
    grantResult = JSON.parse(grantBody)
  } catch {
    throw new Error(`The runner returned unreadable JSON while checking ${exerciseId}`)
  }
  return { grantResponse, grantResult }
}

for (const exerciseId of practicalCppRunnerBackedLessonIds) {
  const { grantResponse, grantResult } = await requestRunnerGrant(exerciseId)
  assertReviewedPublishedGrant({
    body: grantResult,
    exerciseId,
    expectedLanguage: 'cpp',
    hasSetCookie: grantResponse.headers.has('set-cookie'),
    httpStatus: grantResponse.status,
    label: 'live',
    requireEnabled: !allowPaused,
  })
}
for (const exerciseId of practicalCppTeachingOnlyLessonIds) {
  const { grantResponse, grantResult } = await requestRunnerGrant(exerciseId)
  assertReviewedTeachingOnlyGrantRejection({
    body: grantResult,
    exerciseId,
    hasSetCookie: grantResponse.headers.has('set-cookie'),
    httpStatus: grantResponse.status,
    label: 'live',
  })
}
const runnerStateCheck = allowPaused
  ? 'configured runner paused and executable grants rejected with 503'
  : 'configured runner enabled and reviewed Python and C++ grants issued'
const practicalCppGrantCheck = `${runnerStateCheck}; all teaching-only C++ assignments rejected with 404`

const robotsResponse = await requestWithFreshDns(new URL('/robots.txt', canonical), { redirect: 'manual' })
const robots = await robotsResponse.text()
if (
  robotsResponse.status !== 200
  || !robots.includes('Sitemap: https://seepoundcoffeepie.com/sitemap.xml')
) {
  throw new Error('The live robots file does not point to the canonical sitemap')
}

for (const metadata of [
  `<meta property="og:image" content="${socialImageUrl}" />`,
  '<meta property="og:image:width" content="1200" />',
  '<meta property="og:image:height" content="630" />',
  '<meta name="twitter:card" content="summary_large_image" />',
  `<meta name="twitter:image" content="${socialImageUrl}" />`,
]) {
  if (!body.includes(metadata)) {
    throw new Error(`The live site is missing social preview metadata: ${metadata}`)
  }
}

const socialImageResponse = await requestWithFreshDns(socialImageUrl, { redirect: 'manual' })
const socialImageBytes = await socialImageResponse.arrayBuffer()
if (
  socialImageResponse.status !== 200
  || !(socialImageResponse.headers.get('content-type') ?? '').includes('image/jpeg')
  || socialImageBytes.byteLength < 100_000
) {
  throw new Error('The live social preview image is missing, invalid, or incomplete')
}

const requiredHeaders = {
  'content-security-policy': "frame-ancestors 'none'",
  'strict-transport-security': 'max-age=',
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
}

for (const [name, expected] of Object.entries(requiredHeaders)) {
  const value = response.headers.get(name) ?? ''
  if (!value.includes(expected)) {
    throw new Error(`Missing expected ${name} header value: ${expected}`)
  }
}

const wwwResponse = await requestWithFreshDns('https://www.seepoundcoffeepie.com/path-check?source=verify', {
  redirect: 'manual',
})
if (
  wwwResponse.status !== 308
  || wwwResponse.headers.get('location') !== 'https://seepoundcoffeepie.com/path-check?source=verify'
) {
  throw new Error('The www hostname did not redirect to the canonical apex domain')
}

const canonicalRoutes = [
  '/start',
  '/home',
  '/courses',
  '/courses/python-foundations',
  '/courses/python-data-tools',
  unpublishedCppCoursePath,
  '/courses/cpp-foundations',
  '/courses/csharp-foundations',
  '/courses/java-foundations',
  '/projects/python/first-interactive-program',
  '/projects/python/first-interactive-program/project-py-final',
  '/projects/cpp/first-compiled-program',
  '/projects/cpp/first-compiled-program/project-cpp-final',
  '/projects/csharp/workshop-check-in',
  '/projects/csharp/workshop-check-in/project-csharp-final',
  '/projects/java/picnic-planner',
  '/projects/java/picnic-planner/project-java-final',
  '/portfolio/python/first-interactive-program',
  '/portfolio/cpp/first-compiled-program',
  '/portfolio/csharp/workshop-check-in',
  '/portfolio/java/picnic-planner',
  '/learn/python-foundations/py-first-spark/py-console',
  '/learn/python-data-tools/py-data-return-values/pydata1-retrieve-call',
  unpublishedCppLessonPath,
  '/learn/cpp-foundations/cpp-reactor/cpp-compiler',
  '/learn/csharp-foundations/cs-shield/cs-dotnet',
  '/learn/java-foundations/java-coffee-protocol/java-jvm',
  '/practice/java',
  '/practice/java/session',
  '/codebook/csharp',
  '/profile',
  '/settings',
]

const legacyRoutes = [
  '/academy/python',
  '/academy/python/missions/py-first-spark',
]

for (const route of [...canonicalRoutes, ...legacyRoutes]) {
  const spaResponse = await requestWithFreshDns(`https://seepoundcoffeepie.com${route}`, {
    redirect: 'manual',
  })
  if (spaResponse.status !== 200 || !(await spaResponse.text()).includes(expectedTitle)) {
    throw new Error(`SPA navigation fallback did not return the application shell for ${route}`)
  }
}

for (const practicalCppLessonUrl of practicalCppCandidateLessonUrls) {
  const spaResponse = await requestWithFreshDns(practicalCppLessonUrl, { redirect: 'manual' })
  if (spaResponse.status !== 200 || !(await spaResponse.text()).includes(expectedTitle)) {
    throw new Error(`SPA navigation fallback did not return the application shell for ${new URL(practicalCppLessonUrl).pathname}`)
  }
}

console.log(`Live verification passed for Practical Python and Practical C++ assets, a ${deployedJavaScriptAssets.size}-asset JavaScript chunk graph, exact ${practicalCppSitemap.lessonCount}-lesson C++ sitemap, robots, social previews, apex, www redirect, headers, ${canonicalRoutes.length} canonical routes, ${legacyRoutes.length} legacy routes, all ${practicalCppCandidateLessonUrls.length} C++ lesson routes, ${practicalCppRunnerBackedLessonIds.length} runner-backed C++ assignments, and ${practicalCppTeachingOnlyLessonIds.length} teaching-only C++ assignments (${practicalCppGrantCheck}).`)
