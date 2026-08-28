import { defineConfig } from 'vite'

import { createSiteViteConfig } from '../vite.config.ts'
import { controlledPublicationSelector } from './controlled-publication-selector.mjs'
import { practicalCppCandidatePublication } from './practical-cpp-candidate-publication.mjs'
import { controlledPracticalCppSitemap } from './practical-cpp-candidate-sitemap.mjs'

export default defineConfig(async (environment) => {
  const config = createSiteViteConfig(environment, [
    controlledPublicationSelector(practicalCppCandidatePublication.sources),
    controlledPracticalCppSitemap(practicalCppCandidatePublication.routes),
  ])
  return {
    ...config,
    build: {
      ...config.build,
      emptyOutDir: true,
      outDir: '.vite/practical-cpp-candidate-default',
    },
  }
})
