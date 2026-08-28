import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

import { cppCollectionsRecordsManifest } from '../src/data/cpp-collections-records-manifest.ts'
import {
  unpublishedCppCoursePath,
  unpublishedCppLessonPrefix,
  unpublishedCppLessonPath,
} from './unpublished-cpp-release-boundary.mjs'

const productionOrigin = 'https://seepoundcoffeepie.com'

export const practicalCppCandidateCourseUrl = `${productionOrigin}${unpublishedCppCoursePath}`
export const practicalCppCandidateLessonUrls = Object.freeze(
  Object.entries(cppCollectionsRecordsManifest).flatMap(([moduleId, lessons]) => (
    lessons.map(({ id }) => `${productionOrigin}${unpublishedCppLessonPrefix}${moduleId}/${id}`)
  )),
)
export const practicalCppCandidateRepresentativeLessonUrls = Object.freeze([
  practicalCppCandidateLessonUrls[0],
  practicalCppCandidateLessonUrls[Math.floor(practicalCppCandidateLessonUrls.length / 2)],
  practicalCppCandidateLessonUrls.at(-1),
])

const practicalCppCandidateUrls = Object.freeze([
  practicalCppCandidateCourseUrl,
  ...practicalCppCandidateLessonUrls,
])

function sitemapLocations(sitemap) {
  return [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/gu)].map((match) => match[1])
}

export function renderPracticalCppCandidateSitemap(publicSitemap) {
  if (typeof publicSitemap !== 'string' || !publicSitemap.includes('<urlset ')) {
    throw new Error('The public sitemap is not a supported sitemap document.')
  }
  const closingTag = '</urlset>'
  if (publicSitemap.split(closingTag).length !== 2) {
    throw new Error('The public sitemap must contain exactly one closing urlset tag.')
  }
  const publicLocations = new Set(sitemapLocations(publicSitemap))
  if (practicalCppCandidateUrls.some((url) => publicLocations.has(url))) {
    throw new Error('The public sitemap already contains a Practical C++ candidate URL.')
  }

  const candidateEntries = practicalCppCandidateUrls.map((url) => (
    `  <url>\n    <loc>${url}</loc>\n  </url>`
  )).join('\n')
  return publicSitemap.replace(closingTag, `${candidateEntries}\n${closingTag}`)
}

export function inspectPracticalCppCandidateSitemap(candidateSitemap) {
  const locations = sitemapLocations(candidateSitemap)
  for (const expectedUrl of practicalCppCandidateUrls) {
    if (locations.filter((url) => url === expectedUrl).length !== 1) {
      throw new Error(`The candidate sitemap must contain ${expectedUrl} exactly once.`)
    }
  }
  const emittedCandidateLessons = locations.filter((url) => (
    url.startsWith(`${productionOrigin}${unpublishedCppLessonPrefix}`)
  ))
  if (
    emittedCandidateLessons.length !== practicalCppCandidateLessonUrls.length
    || emittedCandidateLessons.some((url) => !practicalCppCandidateLessonUrls.includes(url))
  ) {
    throw new Error('The candidate sitemap does not contain the exact canonical Practical C++ lessons.')
  }
  return Object.freeze({
    courseUrl: practicalCppCandidateCourseUrl,
    lessonCount: practicalCppCandidateLessonUrls.length,
    representativeLessonUrls: practicalCppCandidateRepresentativeLessonUrls,
  })
}

export function practicalCppCandidateSitemap() {
  let publicDirectory
  let outputDirectory
  return {
    name: 'practical-cpp-candidate-sitemap',
    apply: 'build',
    configResolved(config) {
      if (config.publicDir === false) {
        throw new Error('The Practical C++ candidate build requires the public directory.')
      }
      publicDirectory = config.publicDir
      outputDirectory = config.build.outDir
    },
    async closeBundle() {
      if (!publicDirectory || !outputDirectory) {
        throw new Error('The Practical C++ candidate sitemap build paths were not resolved.')
      }
      const source = await readFile(path.join(publicDirectory, 'sitemap.xml'), 'utf8')
      await writeFile(
        path.join(outputDirectory, 'sitemap.xml'),
        renderPracticalCppCandidateSitemap(source),
      )
    },
  }
}

/**
 * Keeps the checked-in sitemap unchanged. The exact published route projection
 * enables the complete canonical course sitemap in build output through the
 * same source-controlled state that selects application and Worker sources.
 */
export function controlledPracticalCppSitemap(routes) {
  if (!Array.isArray(routes)) {
    throw new Error('Controlled Practical C++ sitemap routes must be an array.')
  }
  if (routes.length === 0) {
    return { name: 'controlled-practical-cpp-sitemap', apply: 'build' }
  }
  if (
    routes.length !== 2
    || routes[0] !== unpublishedCppCoursePath
    || routes[1] !== unpublishedCppLessonPath
  ) {
    throw new Error('Controlled Practical C++ sitemap routes do not match the reviewed projection.')
  }
  return {
    ...practicalCppCandidateSitemap(),
    name: 'controlled-practical-cpp-sitemap',
  }
}
