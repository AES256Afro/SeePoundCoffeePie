interface AssetFetcher {
  fetch(request: Request): Promise<Response>
}

interface WorkerEnv {
  ASSETS: AssetFetcher
}

const CANONICAL_HOST = 'seepoundcoffeepie.com'

export async function handleRequest(request: Request, env: WorkerEnv): Promise<Response> {
  const url = new URL(request.url)

  if (url.protocol !== 'https:' || url.hostname === `www.${CANONICAL_HOST}`) {
    url.protocol = 'https:'
    url.hostname = CANONICAL_HOST
    return Response.redirect(url.toString(), 308)
  }

  const response = await env.ASSETS.fetch(request)
  const headers = new Headers(response.headers)

  headers.set(
    'Content-Security-Policy',
    "default-src 'self'; base-uri 'self'; connect-src 'self'; font-src 'self'; form-action 'self'; frame-ancestors 'none'; img-src 'self' data:; object-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; upgrade-insecure-requests",
  )
  headers.set('Cross-Origin-Opener-Policy', 'same-origin')
  headers.set('Permissions-Policy', 'camera=(), geolocation=(), microphone=()')
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  headers.set('Strict-Transport-Security', 'max-age=15552000')
  headers.set('X-Content-Type-Options', 'nosniff')
  headers.set('X-Frame-Options', 'DENY')

  if (url.pathname.startsWith('/assets/')) {
    headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  } else if (headers.get('Content-Type')?.includes('text/html')) {
    headers.set('Cache-Control', 'public, max-age=0, must-revalidate')
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

export default {
  fetch: handleRequest,
}
