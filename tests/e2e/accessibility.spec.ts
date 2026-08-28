import AxeBuilder from '@axe-core/playwright'

import { expect, test, type Page } from './fixtures'

async function expectNoAccessibilityViolations(page: Page): Promise<void> {
  const results = await new AxeBuilder({ page })
    .include('#main-content')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()
  const summary = results.violations.map((violation) => ({
    help: violation.help,
    id: violation.id,
    impact: violation.impact,
    targets: violation.nodes.flatMap((node) => node.target),
  }))

  expect(summary, 'WCAG A/AA violations inside #main-content').toEqual([])
}

test('Courses passes the scoped WCAG A and AA gate', async ({ page, seedProgress }) => {
  await seedProgress()
  await page.goto('/courses')
  await expect(page.getByRole('heading', { level: 1, name: 'Choose a course' })).toBeVisible()

  await expectNoAccessibilityViolations(page)
})

test('a lesson passes the scoped WCAG A and AA gate', async ({ page, seedProgress }) => {
  await seedProgress()
  await page.goto('/learn/python-foundations/py-first-spark/py-console')
  await expect(page.getByRole('heading', { level: 1, name: 'Meet the console' })).toBeVisible()

  await expectNoAccessibilityViolations(page)
})

test('Practice passes the scoped WCAG A and AA gate', async ({ page, seedProgress }) => {
  await seedProgress({ completedMissions: ['py-first-spark'] })
  await page.goto('/practice/python')
  await expect(page.getByRole('heading', { level: 1, name: 'Practice' })).toBeVisible()

  await expectNoAccessibilityViolations(page)
})

test('Code Reference passes the scoped WCAG A and AA gate', async ({ page, seedProgress }) => {
  await seedProgress({ completedMissions: ['py-first-spark'] })
  await page.goto('/codebook/python')
  await expect(page.getByRole('heading', { level: 1, name: 'Code reference' })).toBeVisible()

  await expectNoAccessibilityViolations(page)
})
