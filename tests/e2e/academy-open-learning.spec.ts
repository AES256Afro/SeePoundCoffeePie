import AxeBuilder from '@axe-core/playwright'

import { expect, test, type Page } from './fixtures'

const progressKey = 'see-pound-coffee-pie-progress-v3'

const modelPath = '/paths/models-from-zero'
const modelCoursePath = `${modelPath}/what-a-model-is`
const modelModulePath = `${modelCoursePath}/learned-behavior`
const modelUnitPath = `${modelModulePath}/model-and-rule`
const modelRefresherPath = `${modelCoursePath}/preparation/computer-words-refresher`
const modelContextPath = `${modelCoursePath}/preparation/model-context`

function watchExecutionRequests(page: Page): string[] {
  const requests: string[] = []

  page.on('request', (request) => {
    const pathname = new URL(request.url()).pathname
    if (/^\/api\/(?:runner|models?|training|inference)(?:\/|$)/iu.test(pathname)) {
      requests.push(`${request.method()} ${pathname}`)
    }
  })

  return requests
}

async function savedProgress(page: Page): Promise<{
  completedLessons: string[]
  completedMissions: string[]
  xp: number
}> {
  return page.evaluate((key) => {
    const stored = window.localStorage.getItem(key)
    if (!stored) throw new Error(`Missing browser progress at ${key}.`)
    const parsed = JSON.parse(stored) as {
      completedLessons: string[]
      completedMissions: string[]
      xp: number
    }
    return {
      completedLessons: parsed.completedLessons,
      completedMissions: parsed.completedMissions,
      xp: parsed.xp,
    }
  }, progressKey)
}

test('a guest can open every academy route level directly without onboarding', async ({
  page,
  seedProgress,
}) => {
  await seedProgress({ onboardingComplete: false })
  const executionRequests = watchExecutionRequests(page)

  await page.goto(modelCoursePath)
  await expect(page.getByRole('heading', { level: 1, name: 'What a model is' })).toBeVisible()
  await expect(page).toHaveURL(modelCoursePath)

  await page.goto(modelModulePath)
  await expect(page.getByRole('heading', { level: 1, name: 'Learned behavior' })).toBeVisible()
  await expect(page).toHaveURL(modelModulePath)

  await page.goto(modelUnitPath)
  await expect(page.getByRole('heading', { level: 1, name: 'A model and an ordinary rule' })).toBeVisible()
  await expect(page).toHaveURL(modelUnitPath)

  await page.goto(modelRefresherPath)
  await expect(page.getByRole('heading', { level: 1, name: 'Computer words refresher' })).toBeVisible()
  await expect(page).toHaveURL(modelRefresherPath)

  expect(executionRequests, 'academy reading must not contact a runner or model endpoint').toEqual([])
})

test('academy links preserve canonical bookmark, refresh, and Back navigation', async ({
  page,
  seedProgress,
}) => {
  await seedProgress({ onboardingComplete: false })
  await page.goto(modelCoursePath)

  await page.getByRole('link', { name: /^View module/iu }).first().click()
  await expect(page).toHaveURL(modelModulePath)
  await page.getByRole('link', { name: /A model and an ordinary rule/iu }).click()
  await expect(page).toHaveURL(modelUnitPath)

  await page.reload()
  await expect(page).toHaveURL(modelUnitPath)
  await expect(page.getByRole('heading', { level: 1, name: 'A model and an ordinary rule' })).toBeVisible()

  await page.getByRole('navigation', { name: 'Breadcrumb' })
    .getByRole('link', { exact: true, name: 'What a model is' })
    .click()
  await expect(page).toHaveURL(modelCoursePath)

  await page.goBack()
  await expect(page).toHaveURL(modelUnitPath)
  await expect(page.getByRole('heading', { level: 1, name: 'A model and an ordinary rule' })).toBeVisible()
})

test('optional preparation offers three equal choices and does not gate or record progress', async ({
  page,
  seedProgress,
}) => {
  await seedProgress({ onboardingComplete: false })
  await page.goto(modelCoursePath)

  const preparation = page.getByRole('region', { name: 'Choose how to begin' })
  await expect(preparation).toContainText(
    'All three choices are optional ways into the same course. You may start immediately, and no choice unlocks or blocks another page.',
  )
  await expect(preparation.getByRole('link', { name: /^Start now/iu })).toHaveAttribute('href', modelUnitPath)
  await expect(preparation.getByRole('link', { name: /^Review a refresher/iu })).toHaveAttribute('href', modelRefresherPath)
  await expect(preparation.getByRole('link', { name: /^Read the short context/iu })).toHaveAttribute('href', modelContextPath)
  await expect(page.getByText('Lesson locked')).toHaveCount(0)

  const before = await savedProgress(page)
  await preparation.getByRole('link', { name: /^Review a refresher/iu }).click()
  await expect(page).toHaveURL(modelRefresherPath)
  await expect(page.getByText('This page is optional. Reading it does not change access or progress.')).toBeVisible()
  expect(await savedProgress(page)).toEqual(before)

  await page.getByRole('link', { name: 'Open the first unit' }).click()
  await expect(page).toHaveURL(modelUnitPath)
  await expect(page.getByRole('heading', { level: 1, name: 'A model and an ordinary rule' })).toBeVisible()
})

test('the knowledge check supports keyboard retry, records only a correct answer, and shows dated evidence', async ({
  page,
  seedProgress,
}) => {
  await seedProgress({ onboardingComplete: false })
  const executionRequests = watchExecutionRequests(page)
  await page.goto(modelUnitPath)

  const wrongChoice = page.getByRole('radio', { name: 'It must use a learned model.' })
  await wrongChoice.focus()
  await page.keyboard.press('Space')
  await expect(wrongChoice).toHaveAttribute('aria-checked', 'true')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('radio', { name: 'It must use one ordinary rule.' })).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(page.getByRole('radio', { name: 'There is not enough information.' })).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(page.getByRole('button', { name: 'Check answer' })).toBeFocused()
  await page.keyboard.press('Enter')

  const wrongFeedback = page.getByRole('status').filter({ hasText: 'Not yet' })
  await expect(wrongFeedback).toContainText(
    'The result alone does not reveal the mechanism. Recommendations can use rules, records, models, or a mixture.',
  )
  await expect(wrongFeedback).toContainText(
    'Choose again. Look only at what the description proves, not what similar websites might use.',
  )
  expect((await savedProgress(page)).completedLessons).not.toContain('LM-101-U1')

  const retry = page.getByRole('button', { name: 'Try again' })
  await retry.focus()
  await page.keyboard.press('Enter')
  const correctChoice = page.getByRole('radio', { name: 'There is not enough information.' })
  await correctChoice.focus()
  await page.keyboard.press('Space')
  await page.keyboard.press('Tab')
  await page.keyboard.press('Enter')

  await expect(page.getByRole('status').filter({ hasText: 'Correct' })).toContainText(
    'Ask for evidence about the mechanism before naming it.',
  )
  await expect(page.getByText('Unit complete')).toBeVisible()
  expect((await savedProgress(page)).completedLessons).toContain('LM-101-U1')

  const evidence = page.locator('#unit-sources')
  await expect(evidence.getByRole('heading', { name: 'Sources and evidence limits' })).toBeVisible()
  await expect(evidence.getByText(/Observed 2026-08-31 · Review by 2027-02-28/iu)).toBeVisible()
  await expect(evidence.getByRole('link', {
    name: 'Artificial Intelligence Risk Management Framework resource page',
  })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Prepared evidence' })).toBeVisible()
  expect(executionRequests, 'the prepared check must not contact a runner or model endpoint').toEqual([])
})

test('an academy unit fits a 320px viewport and passes the scoped WCAG A and AA scan', async ({
  page,
  seedProgress,
}) => {
  await seedProgress({ onboardingComplete: false })
  await page.setViewportSize({ height: 760, width: 320 })
  await page.goto(modelUnitPath)
  await expect(page.getByRole('heading', { level: 1, name: 'A model and an ordinary rule' })).toBeVisible()

  const pageWidths = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }))
  expect(pageWidths.scrollWidth, 'the page must not overflow horizontally at 320px').toBeLessThanOrEqual(
    pageWidths.clientWidth,
  )

  const results = await new AxeBuilder({ page })
    .include('#main-content')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()
  const violations = results.violations.map((violation) => ({
    help: violation.help,
    id: violation.id,
    impact: violation.impact,
    targets: violation.nodes.flatMap((node) => node.target),
  }))
  expect(violations, 'WCAG A/AA violations inside #main-content').toEqual([])
})
