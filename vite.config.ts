import react from '@vitejs/plugin-react'
import type { ConfigEnv, PluginOption, UserConfig } from 'vite'
import { configDefaults, defineConfig } from 'vitest/config'
import { loadEnv } from 'vite'

import {
  productionControlledPublication,
} from './scripts/controlled-course-publication.mjs'
import { controlledPublicationSelector } from './scripts/controlled-publication-selector.mjs'
import { controlledPracticalCppSitemap } from './scripts/practical-cpp-candidate-sitemap.mjs'

const productionOrigin = 'https://seepoundcoffeepie.com'
const upstreamGuestCookie = '__Host-spp_runner_guest'
const localGuestCookie = 'spp_dev_runner_guest'

function safeRunnerOrigin(value: string | undefined): string {
  const url = new URL(value || productionOrigin)
  if (url.protocol !== 'https:' || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('SPCP_DEV_RUNNER_ORIGIN must be an HTTPS origin without a path, query, or hash.')
  }
  return url.origin
}

export function createSiteViteConfig(
  { mode }: ConfigEnv,
  publicationPlugins: PluginOption[] = [
    controlledPublicationSelector(productionControlledPublication.sources),
    controlledPracticalCppSitemap(productionControlledPublication.routes),
  ],
): UserConfig {
  const environment = loadEnv(mode, process.cwd(), 'SPCP_')
  const runnerOrigin = safeRunnerOrigin(environment.SPCP_DEV_RUNNER_ORIGIN)

  return {
    plugins: [react(), ...publicationPlugins],
    test: {
      exclude: [
        ...configDefaults.exclude,
        'tests/e2e/**',
      ],
    },
    server: {
      host: '127.0.0.1',
      port: 4173,
      proxy: {
        '/api/runner': {
          target: runnerOrigin,
          changeOrigin: true,
          secure: true,
          configure(proxy) {
            proxy.on('proxyReq', (proxyRequest, request) => {
              proxyRequest.setHeader('Origin', runnerOrigin)
              const localCookie = request.headers.cookie
                ?.split(';')
                .map((part) => part.trim())
                .find((part) => part.startsWith(`${localGuestCookie}=`))
              if (localCookie) {
                proxyRequest.setHeader('Cookie', localCookie.replace(localGuestCookie, upstreamGuestCookie))
              } else {
                proxyRequest.removeHeader('Cookie')
              }
            })
            proxy.on('proxyRes', (proxyResponse) => {
              const cookies = proxyResponse.headers['set-cookie']
              if (!cookies) return
              proxyResponse.headers['set-cookie'] = cookies.map((cookie) => (
                cookie
                  .replace(upstreamGuestCookie, localGuestCookie)
                  .replace(/;\s*Secure/giu, '')
              ))
            })
          },
        },
      },
    },
  }
}

export default defineConfig((environment) => createSiteViteConfig(environment))
