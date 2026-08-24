import { Resolver } from 'node:dns/promises'
import { request as httpsRequest } from 'node:https'

const canonical = 'https://seepoundcoffeepie.com/'
const expectedTitle = '<title>SeePoundCoffeePie | Learn code. Run the ship.</title>'

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

for (const route of ['/academy/python', '/practice/java', '/codebook/csharp', '/profile', '/settings', '/academy/python/missions/py-first-spark']) {
  const spaResponse = await requestWithFreshDns(`https://seepoundcoffeepie.com${route}`, {
    redirect: 'manual',
  })
  if (spaResponse.status !== 200 || !(await spaResponse.text()).includes(expectedTitle)) {
    throw new Error(`SPA navigation fallback did not return the application shell for ${route}`)
  }
}

console.log('Live verification passed for apex, www redirect, headers, and all bookmarkable SPA routes.')
