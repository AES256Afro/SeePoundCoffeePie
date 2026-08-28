import AxeBuilder from '@axe-core/playwright'

import { CPP_FOUNDATION_MISSION_IDS, expect, test, type Page } from './fixtures'

const practicalCppPrerequisites = {
  activeLanguage: 'cpp' as const,
  completedMissions: [...CPP_FOUNDATION_MISSION_IDS],
  completedProjects: ['first-compiled-program'],
}

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

test('a Practical C++ lesson passes the scoped WCAG A and AA gate', async ({ page, seedProgress }) => {
  await seedProgress(practicalCppPrerequisites)
  await page.goto(
    '/learn/cpp-collections-records/cpp-records-return-values/cpprecords1-retrieve-call',
  )
  await expect(page.getByRole('heading', {
    exact: true,
    level: 1,
    name: 'Trace a familiar function call',
  })).toBeVisible()

  await expectNoAccessibilityViolations(page)
})

test('the Practical C++ course passes the scoped WCAG A and AA gate', async ({ page, seedProgress }) => {
  await seedProgress(practicalCppPrerequisites)
  await page.goto('/courses/cpp-collections-records')
  await expect(page.getByRole('heading', {
    level: 1,
    name: 'Practical C++: Collections and Records',
  })).toBeVisible()

  await expectNoAccessibilityViolations(page)
})

test('an editable Practical C++ lesson passes the scoped WCAG A and AA gate', async ({ page, seedProgress }) => {
  await seedProgress(practicalCppPrerequisites)
  await page.goto(
    '/learn/cpp-collections-records/cpp-records-return-values/cpprecords1-fix-return',
  )
  await expect(page.getByRole('heading', {
    exact: true,
    level: 1,
    name: 'Repair the returned subtotal',
  })).toBeVisible()

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
