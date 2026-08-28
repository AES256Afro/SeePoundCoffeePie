import type { Plugin } from 'vite'

export interface PracticalCppCandidateSitemapEvidence {
  readonly courseUrl: string
  readonly lessonCount: number
  readonly representativeLessonUrls: readonly string[]
}

export const practicalCppCandidateCourseUrl: string
export const practicalCppCandidateLessonUrls: readonly string[]
export const practicalCppCandidateRepresentativeLessonUrls: readonly string[]

export function renderPracticalCppCandidateSitemap(publicSitemap: unknown): string
export function inspectPracticalCppCandidateSitemap(
  candidateSitemap: string,
): PracticalCppCandidateSitemapEvidence
export function practicalCppCandidateSitemap(): Plugin
export function controlledPracticalCppSitemap(routes: unknown): Plugin
