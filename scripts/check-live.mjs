const canonical = 'https://seepoundcoffeepie.com/'
const expectedTitle = '<title>SeePoundCoffeePie | Learn code. Run the ship.</title>'

const response = await fetch(canonical, { redirect: 'manual' })
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

const wwwResponse = await fetch('https://www.seepoundcoffeepie.com/path-check?source=verify', {
  redirect: 'manual',
})
if (
  wwwResponse.status !== 308
  || wwwResponse.headers.get('location') !== 'https://seepoundcoffeepie.com/path-check?source=verify'
) {
  throw new Error('The www hostname did not redirect to the canonical apex domain')
}

const spaResponse = await fetch('https://seepoundcoffeepie.com/mission-path', {
  redirect: 'manual',
})
if (spaResponse.status !== 200 || !(await spaResponse.text()).includes(expectedTitle)) {
  throw new Error('SPA navigation fallback did not return the application shell')
}

console.log('Live verification passed for apex, www redirect, headers, and SPA fallback.')
