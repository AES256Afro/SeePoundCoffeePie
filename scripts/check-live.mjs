import { Resolver } from 'node:dns/promises'
import { request as httpsRequest } from 'node:https'

import { inspectDeployedJavaScriptChunkGraph } from './deployed-javascript-graph.mjs'
import {
  unpublishedCppCoursePath,
  unpublishedCppJavaScriptMarkers,
  unpublishedCppLessonIds,
  unpublishedCppLessonPath,
  unpublishedCppLessonPrefix,
} from './unpublished-cpp-release-boundary.mjs'

const canonical = 'https://seepoundcoffeepie.com/'
const expectedTitle = '<title>SeePoundCoffeePie | Programming from the beginning.</title>'
const socialImageUrl = 'https://seepoundcoffeepie.com/social-card-v7.jpg'
const practicalPythonCourseUrl = 'https://seepoundcoffeepie.com/courses/python-data-tools'
const practicalPythonLessonUrl = 'https://seepoundcoffeepie.com/learn/python-data-tools/py-data-return-values/pydata1-retrieve-call'
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
if (
  entryAssetResponse.status !== 200
  || !(entryAssetResponse.headers.get('content-type') ?? '').includes('javascript')
  || !entryAsset.includes('python-data-tools')
) {
  throw new Error('The deployed application entry does not contain the Practical Python course registry')
}

for (const unpublishedRouteMarker of [unpublishedCppCoursePath, unpublishedCppLessonPrefix]) {
  if (entryAsset.includes(unpublishedRouteMarker)) {
    throw new Error(`The deployed application entry publicly registers the unpublished C++ route ${unpublishedRouteMarker}`)
  }
}

const deployedJavaScriptAssets = await inspectDeployedJavaScriptChunkGraph({
  allowedOrigin: canonicalOrigin,
  entryAsset,
  entryAssetUrl,
  request: requestWithFreshDns,
})
for (const [assetUrl, asset] of deployedJavaScriptAssets) {
  for (const marker of unpublishedCppJavaScriptMarkers) {
    if (asset.includes(marker.value)) {
      throw new Error(
        `The deployed JavaScript chunk graph exposes unpublished Phase 5B ${marker.kind} in ${new URL(assetUrl).pathname}`,
      )
    }
  }
}

async function verifyPracticalPythonAsset(pattern, markers, label) {
  const assetPath = entryAsset.match(pattern)?.[0]
  if (!assetPath) {
    throw new Error(`The deployed application entry does not reference the ${label}`)
  }

  const assetResponse = await requestWithFreshDns(new URL(assetPath, canonical), { redirect: 'manual' })
  const asset = await assetResponse.text()
  const acceptedMarkers = Array.isArray(markers) ? markers : [markers]
  if (
    assetResponse.status !== 200
    || !(assetResponse.headers.get('content-type') ?? '').includes('javascript')
    || !acceptedMarkers.some((marker) => asset.includes(marker))
  ) {
    throw new Error(`The deployed ${label} is missing or does not match Phase 5A`)
  }
}

await verifyPracticalPythonAsset(
  /assets\/PythonDataToolsRoute-[A-Za-z0-9_-]+\.js/u,
  ['Course complete.', 'python-data-tools-course-'],
  'Practical Python route asset',
)
await verifyPracticalPythonAsset(
  /assets\/python-data-tools-course-[A-Za-z0-9_-]+\.js/u,
  'Products: 2',
  'Practical Python teaching-content asset',
)

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

for (const unpublishedRoutePrefix of [unpublishedCppCoursePath, unpublishedCppLessonPrefix]) {
  const unpublishedUrlPrefix = new URL(unpublishedRoutePrefix, canonical).href
  if (sitemap.includes(`<loc>${unpublishedUrlPrefix}`)) {
    throw new Error(`The live sitemap publishes an unpublished C++ route under ${unpublishedRoutePrefix}`)
  }
}

for (const unpublishedRoute of [unpublishedCppCoursePath, unpublishedCppLessonPath]) {
  // Static hosting returns the application shell for unknown browser paths.
  // The route stays private when the shell has no route registration and the
  // sitemap does not publish it.
  const unpublishedUrl = new URL(unpublishedRoute, canonical)
  const unpublishedResponse = await requestWithFreshDns(unpublishedUrl, { redirect: 'manual' })
  const unpublishedBody = await unpublishedResponse.text()
  if (
    unpublishedResponse.status !== 200
    || !unpublishedBody.includes(expectedTitle)
    || !unpublishedBody.includes('<div id="root"></div>')
  ) {
    throw new Error(`The unpublished C++ path did not remain behind the ordinary application fallback: ${unpublishedRoute}`)
  }
}

const grantUrl = new URL('/api/runner/grants', canonical)
const grantOrigin = new URL(canonical).origin
let pausedGrantCheck = false
for (const exerciseId of unpublishedCppLessonIds) {
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
    throw new Error(`The runner returned unreadable JSON while checking unpublished exercise ${exerciseId}`)
  }

  const rejectedAsUnpublished = grantResponse.status === 404
    && [
      'That exercise does not support live execution.',
      'This page does not have a code check yet.',
    ].includes(grantResult?.error)
  const runnerClosed = grantResponse.status === 503
    && [
      'Live code execution is not configured.',
      'Live code execution is temporarily paused.',
      'The code checker is not available right now. Try again later.',
      'The code checker is paused right now. Try again later.',
    ].includes(grantResult?.error)
  const issuedGrant = typeof grantResult?.grant === 'string'
  const setCookie = grantResponse.headers.has('set-cookie')

  if (runnerClosed && !allowPaused && !issuedGrant && !setCookie) {
    throw new Error(
      `The code checker was paused while checking unpublished exercise ${exerciseId}; the default live check requires an enabled runner and a 404 rejection. Use --allow-paused only for an explicitly inconclusive check.`,
    )
  }

  if (
    (!rejectedAsUnpublished && !(allowPaused && runnerClosed))
    || issuedGrant
    || setCookie
  ) {
    throw new Error(`The unpublished C++ exercise ${exerciseId} crossed the public run-grant boundary`)
  }
  if (runnerClosed) pausedGrantCheck = true
}

if (pausedGrantCheck) {
  console.warn('Live verification warning: the code checker was paused, so absence of unpublished Phase 5B runner assignments was not proven.')
}
const hiddenGrantCheck = pausedGrantCheck
  ? 'runner paused; assignment absence not proven'
  : 'runner enabled; all unpublished assignments rejected with 404'

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

console.log(`Live verification passed for Phase 5A assets, a ${deployedJavaScriptAssets.size}-asset JavaScript chunk graph, sitemap, robots, social previews, apex, www redirect, headers, ${canonicalRoutes.length} canonical routes, ${legacyRoutes.length} legacy routes, 2 unpublished C++ route boundaries, and all ${unpublishedCppLessonIds.length} unpublished C++ lesson assignments (${hiddenGrantCheck}).`)
