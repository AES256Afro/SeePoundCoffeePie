import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

import {
  academyCourses,
  academyModules,
  academyPaths,
  academyPreparationPages,
  academyUnits,
} from './academy-manifest'
import {
  academyCoursePath,
  academyModulePath,
  academyPreparationPath,
  academyUnitPath,
  learningPathPath,
} from '../lib/routes'

const productionOrigin = 'https://seepoundcoffeepie.com'
const publicSitemap = readFileSync(
  new URL('../../public/sitemap.xml', import.meta.url),
  'utf8',
)

function sitemapLocations(sitemap: string): string[] {
  return [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/gu)].map((match) => match[1])
}

const expectedAcademyPaths = [
  ...academyPaths.map((path) => learningPathPath(path.id)),
  ...academyCourses.map((course) => academyCoursePath(course.pathId, course.id)),
  ...academyModules.map((module) => academyModulePath(
    module.pathId,
    module.courseId,
    module.id,
  )),
  ...academyUnits.map((unit) => academyUnitPath(
    unit.pathId,
    unit.courseId,
    unit.moduleId,
    unit.id,
  )),
  ...academyPreparationPages.map((page) => academyPreparationPath(
    page.pathId,
    page.courseId,
    page.id,
  )),
]

const expectedAcademyUrls = expectedAcademyPaths.map((path) => `${productionOrigin}${path}`)
const locations = sitemapLocations(publicSitemap)
const academyLocations = locations.filter((location) => location.startsWith(`${productionOrigin}/paths/`))

describe('academy sitemap', () => {
  it('publishes every current academy path, course, module, unit, and preparation page exactly once', () => {
    expect(expectedAcademyPaths).toHaveLength(19)
    expect(new Set(expectedAcademyPaths).size).toBe(expectedAcademyPaths.length)
    expect([...academyLocations].sort()).toEqual([...expectedAcademyUrls].sort())
  })

  it('keeps every checked-in sitemap location unique and canonical', () => {
    expect(new Set(locations).size).toBe(locations.length)
    expect(locations.every((location) => (
      location === `${productionOrigin}/`
      || (location.startsWith(`${productionOrigin}/`) && !location.endsWith('/'))
    ))).toBe(true)
  })

  it('leaves Practical C++ publication to the controlled build projection', () => {
    expect(locations).not.toContain(`${productionOrigin}/courses/cpp-collections-records`)
    expect(locations.some((location) => (
      location.startsWith(`${productionOrigin}/learn/cpp-collections-records/`)
    ))).toBe(false)
  })
})
