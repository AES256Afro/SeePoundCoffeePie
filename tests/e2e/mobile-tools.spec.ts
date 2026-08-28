import { expect, test } from './fixtures'

test.describe('mobile navigation and language controls', () => {
  test.use({
    hasTouch: true,
    isMobile: true,
    viewport: { width: 390, height: 844 },
  })

  test('keeps navigation, language switching, and the page width usable', async ({ page, seedProgress }) => {
    await seedProgress()
    await page.goto('/courses/python-foundations')

    const language = page.getByRole('combobox', { name: 'Active language' })
    await expect(language).toBeVisible()
    await language.selectOption('java')
    await expect(page).toHaveURL(/\/courses\/java-foundations$/u)
    await expect(page.getByRole('heading', { level: 1, name: 'Java Foundations' })).toBeVisible()

    const openNavigation = page.getByRole('button', { name: 'Open navigation' })
    await expect(openNavigation).toHaveAttribute('aria-expanded', 'false')
    await openNavigation.click()
    const closeNavigation = page.getByRole('button', { name: 'Close navigation' })
    await expect(closeNavigation).toHaveAttribute('aria-expanded', 'true')

    await page.keyboard.press('Escape')
    await expect(openNavigation).toBeFocused()
    await expect(openNavigation).toHaveAttribute('aria-expanded', 'false')

    await openNavigation.click()
    await page.getByRole('navigation', { name: 'Primary navigation' }).getByRole('link', { name: 'Practice' }).click()
    await expect(page).toHaveURL(/\/practice\/java$/u)
    await expect(page.getByRole('heading', { level: 1, name: 'Practice' })).toBeVisible()
    await expect(openNavigation).toHaveAttribute('aria-expanded', 'false')

    const hasNoHorizontalOverflow = await page.evaluate(() => (
      document.documentElement.scrollWidth <= window.innerWidth + 1
    ))
    expect(hasNoHorizontalOverflow).toBe(true)
  })
})

test('Practice advances through the safe first choice without calling the runner', async ({ page, seedProgress }) => {
  await seedProgress({ completedMissions: ['py-first-spark'] })
  await page.goto('/practice/python')

  await expect(page.getByRole('heading', { level: 1, name: 'Practice' })).toBeVisible()
  const questions = page.getByRole('list', { name: 'Practice questions' })
  await expect(questions.getByRole('listitem')).toHaveCount(2)

  await page.getByRole('link', { name: 'Start 2-question review' }).click()
  await expect(page.getByRole('heading', { name: 'Meet the console' })).toBeVisible()
  const correctAnswer = page.getByRole('radio', { name: /Shows text from the program/iu })
  await page.getByText('Shows text from the program', { exact: true }).click()
  await expect(correctAnswer).toBeChecked()
  await page.getByRole('button', { name: 'Check answer' }).click()
  await page.getByRole('button', { name: 'Continue' }).click()

  await expect(page.getByRole('progressbar', { name: 'Practice progress' })).toHaveAttribute(
    'aria-valuetext',
    'Question 2 of 2',
  )
})

test('Code Reference searches and reveals an unlocked completed-module example', async ({ page, seedProgress }) => {
  await seedProgress({ completedMissions: ['py-first-spark'] })
  await page.goto('/codebook/python')

  await expect(page.getByRole('heading', { level: 1, name: 'Code reference' })).toBeVisible()
  await page.getByRole('searchbox', { name: 'Search the code reference' }).fill('variable')
  await page.getByRole('heading', { exact: true, name: 'Variable' }).click()
  await expect(page.getByText('ship_name = "Wayfarer"', { exact: true })).toBeVisible()
})
