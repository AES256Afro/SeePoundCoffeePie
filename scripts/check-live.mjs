import { Resolver } from 'node:dns/promises'
import { request as httpsRequest } from 'node:https'

const canonical = 'https://seepoundcoffeepie.com/'
const expectedTitle = '<title>SeePoundCoffeePie | Programming from the beginning.</title>'
const socialImageUrl = 'https://seepoundcoffeepie.com/social-card-v7.jpg'
const practicalPythonCourseUrl = 'https://seepoundcoffeepie.com/courses/python-data-tools'
const practicalPythonLessonUrl = 'https://seepoundcoffeepie.com/learn/python-data-tools/py-data-return-values/pydata1-retrieve-call'

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
      request.end()
    })
  }
}

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

const entryAssetResponse = await requestWithFreshDns(new URL(entryAssetPath, canonical), {
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

async function verifyPracticalPythonAsset(pattern, marker, label) {
  const assetPath = entryAsset.match(pattern)?.[0]
  if (!assetPath) {
    throw new Error(`The deployed application entry does not reference the ${label}`)
  }

  const assetResponse = await requestWithFreshDns(new URL(assetPath, canonical), { redirect: 'manual' })
  const asset = await assetResponse.text()
  if (
    assetResponse.status !== 200
    || !(assetResponse.headers.get('content-type') ?? '').includes('javascript')
    || !asset.includes(marker)
  ) {
    throw new Error(`The deployed ${label} is missing or does not match Phase 5A`)
  }
}

await verifyPracticalPythonAsset(
  /assets\/PythonDataToolsRoute-[A-Za-z0-9_-]+\.js/u,
  'python-data-tools-course-',
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

console.log(`Live verification passed for Phase 5A assets, sitemap, robots, social previews, apex, www redirect, headers, ${canonicalRoutes.length} canonical routes, and ${legacyRoutes.length} legacy routes.`)
