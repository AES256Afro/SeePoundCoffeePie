import { describe, expect, it } from 'vitest'

import {
  controlledPracticalCppSitemap,
  inspectPracticalCppCandidateSitemap,
  practicalCppCandidateCourseUrl,
  practicalCppCandidateLessonUrls,
  practicalCppCandidateRepresentativeLessonUrls,
  renderPracticalCppCandidateSitemap,
} from './practical-cpp-candidate-sitemap.mjs'
import {
  unpublishedCppCoursePath,
  unpublishedCppLessonPath,
} from './unpublished-cpp-release-boundary.mjs'

const publicSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://seepoundcoffeepie.com/</loc>
  </url>
</urlset>
`

describe('Practical C++ candidate sitemap', () => {
  it('projects the canonical course and all thirty canonical lessons', () => {
    const candidateSitemap = renderPracticalCppCandidateSitemap(publicSitemap)
    expect(inspectPracticalCppCandidateSitemap(candidateSitemap)).toEqual({
      courseUrl: practicalCppCandidateCourseUrl,
      lessonCount: 30,
      representativeLessonUrls: practicalCppCandidateRepresentativeLessonUrls,
    })
    expect(practicalCppCandidateLessonUrls).toHaveLength(30)
    expect(practicalCppCandidateRepresentativeLessonUrls).toEqual([
      'https://seepoundcoffeepie.com/learn/cpp-collections-records/cpp-records-return-values/cpprecords1-retrieve-call',
      'https://seepoundcoffeepie.com/learn/cpp-collections-records/cpp-records-updates/cpprecords4-retrieve-vector-loop',
      'https://seepoundcoffeepie.com/learn/cpp-collections-records/cpp-records-workshop-report/cpprecords6-workshop-stock-report',
    ])
  })

  it('fails closed for a malformed sitemap or an already published candidate URL', () => {
    expect(() => renderPracticalCppCandidateSitemap('<urlset></urlset>'))
      .toThrow(/supported sitemap/iu)
    expect(() => renderPracticalCppCandidateSitemap(
      publicSitemap.replace(
        '</urlset>',
        `  <url><loc>${practicalCppCandidateCourseUrl}</loc></url>\n</urlset>`,
      ),
    )).toThrow(/already contains/iu)
  })

  it('rejects missing, duplicate, or noncanonical candidate lesson URLs', () => {
    const candidateSitemap = renderPracticalCppCandidateSitemap(publicSitemap)
    const representative = practicalCppCandidateRepresentativeLessonUrls[1]
    expect(() => inspectPracticalCppCandidateSitemap(candidateSitemap.replace(
      `<loc>${representative}</loc>`,
      '',
    ))).toThrow(/exactly once/iu)
    expect(() => inspectPracticalCppCandidateSitemap(candidateSitemap.replace(
      '</urlset>',
      `  <url><loc>${representative}</loc></url>\n</urlset>`,
    ))).toThrow(/exactly once/iu)
    expect(() => inspectPracticalCppCandidateSitemap(candidateSitemap.replace(
      `<loc>${representative}</loc>`,
      `<loc>${representative}/extra</loc>`,
    ))).toThrow(/exactly once/iu)
  })

  it('keeps unpublished production unchanged and accepts only the reviewed route projection', () => {
    expect(controlledPracticalCppSitemap([])).toMatchObject({
      name: 'controlled-practical-cpp-sitemap',
      apply: 'build',
    })
    expect(controlledPracticalCppSitemap([
      unpublishedCppCoursePath,
      unpublishedCppLessonPath,
    ])).toMatchObject({
      name: 'controlled-practical-cpp-sitemap',
      apply: 'build',
      closeBundle: expect.any(Function),
    })
    expect(() => controlledPracticalCppSitemap([unpublishedCppCoursePath]))
      .toThrow(/reviewed projection/iu)
    expect(() => controlledPracticalCppSitemap('published'))
      .toThrow(/must be an array/iu)
  })
})
