import { expect, test } from './fixtures'

const firstEditableLessonPath = '/learn/python-foundations/py-first-spark/py-print'
const firstEditableLessons = [
  {
    expectedOutput: 'Signal online',
    language: 'python',
    path: firstEditableLessonPath,
    term: 'print',
  },
  {
    expectedOutput: 'Reactor online',
    language: 'cpp',
    path: '/learn/cpp-foundations/cpp-reactor/cpp-output',
    term: 'std::cout',
  },
  {
    expectedOutput: 'Shields online',
    language: 'csharp',
    path: '/learn/csharp-foundations/cs-shield/cs-output',
    term: 'Console.WriteLine',
  },
  {
    expectedOutput: 'Coffee online',
    language: 'java',
    path: '/learn/java-foundations/java-coffee-protocol/java-output',
    term: 'System.out.println',
  },
] as const

function documentFitsViewport(): boolean {
  return document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1
}

test('a direct lesson URL exposes its guide and follows the keyboard order without running code', async ({
  page,
  seedProgress,
}) => {
  const runnerRequests: string[] = []
  page.on('request', (request) => {
    const url = new URL(request.url())
    if (url.pathname.startsWith('/api/runner/')) {
      runnerRequests.push(`${request.method()} ${url.pathname}`)
    }
  })

  await seedProgress()
  await page.goto(firstEditableLessonPath)

  const heading = page.getByRole('heading', {
    level: 1,
    name: 'Print your first message',
  })
  await expect(heading).toBeVisible()
  await expect(heading).toBeFocused()
  await expect(page).toHaveURL(new RegExp(`${firstEditableLessonPath}$`, 'u'))

  const guide = page.getByRole('region', { name: 'Lesson guide' })
  await expect(guide).toBeVisible()
  for (const label of [
    'Goal',
    'Context',
    'Starting point',
    'Words on this page',
    'Steps',
    'Expected result',
    'Recovery',
  ]) {
    await expect(guide.locator('dt', { hasText: label })).toBeVisible()
  }
  await expect(guide.getByLabel('Expected output')).toHaveText('Signal online')
  await expect(page.locator('.console-pane > div').first()).toContainText('Your output')
  await expect(page.getByText('Select Check my code to see what your program prints.')).toBeVisible()

  const primaryActions = page.locator('#main-content .exercise-actions > .primary-action')
  await expect(primaryActions).toHaveCount(1)
  await expect(primaryActions).toHaveText('Check my code')

  const editor = page.getByRole('textbox', { name: 'Code editor' })
  const suppliedCode = await editor.inputValue()
  await editor.focus()
  await page.keyboard.press('Tab')
  await expect(page.getByRole('button', { name: 'I need a hint' })).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(page.getByRole('button', { name: 'Restore supplied code' })).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(page.getByRole('button', { name: 'Back' })).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(page.getByRole('button', { name: 'Check my code' })).toBeFocused()

  await expect(editor).toHaveValue(suppliedCode)
  await expect(page.getByRole('region', { name: 'Run results' })).toHaveCount(0)
  expect(runnerRequests).toEqual([])
})

test.describe('lesson clarity reflow', () => {
  test.use({
    hasTouch: true,
    isMobile: true,
    viewport: { height: 900, width: 320 },
  })

  for (const lesson of firstEditableLessons) {
    test(`keeps the ${lesson.language} guide and current action usable at 320 CSS pixels`, async ({
      page,
      seedProgress,
    }) => {
      await seedProgress({ activeLanguage: lesson.language })
      await page.goto(lesson.path)

      const guide = page.getByRole('region', { name: 'Lesson guide' })
      const primary = page.getByRole('button', { name: 'Check my code' })
      const editor = page.getByRole('textbox', { name: 'Code editor' })
      await expect(guide).toBeVisible()
      await expect(guide.getByLabel('Expected output')).toHaveText(lesson.expectedOutput)
      await expect(guide.locator('dt', { hasText: 'Recovery' })).toBeVisible()
      await expect(editor).toBeVisible()
      const defaultLayout = await editor.evaluate((element) => ({
        documentHeight: document.documentElement.scrollHeight,
        editorTop: element.getBoundingClientRect().top + window.scrollY,
        viewportHeight: window.innerHeight,
      }))
      expect(defaultLayout.editorTop).toBeLessThanOrEqual(defaultLayout.viewportHeight * 2)
      expect(defaultLayout.documentHeight).toBeLessThanOrEqual(defaultLayout.viewportHeight * 3)
      await guide.getByText(/\d+ definitions with examples/iu).click()
      await guide.getByText('Wrong answer, changed code, or failed check').click()
      await expect(guide.getByText(lesson.term, { exact: true })).toBeVisible()
      await expect(guide.getByText(/Select Restore supplied code/iu)).toBeVisible()
      await expect(page.getByRole('button', { name: 'Restore supplied code' })).toBeVisible()
      await primary.scrollIntoViewIfNeeded()
      await expect(primary).toBeVisible()

      expect(await page.evaluate(documentFitsViewport)).toBe(true)
      await expect(page.getByRole('region', { name: 'Run results' })).toHaveCount(0)
    })
  }
})

test('reflows the lesson at a 200 percent browser-zoom equivalent', async ({
  page,
  seedProgress,
}) => {
  await page.setViewportSize({ height: 360, width: 640 })
  await seedProgress()
  await page.goto(firstEditableLessonPath)
  await expect(page.getByRole('heading', { level: 1, name: 'Print your first message' })).toBeVisible()
  expect(await page.evaluate(() => ({ height: window.innerHeight, width: window.innerWidth }))).toEqual({
    height: 360,
    width: 640,
  })
  const guide = page.getByRole('region', { name: 'Lesson guide' })
  const primary = page.getByRole('button', { name: 'Check my code' })
  await expect(guide).toBeVisible()
  await expect(guide.getByLabel('Expected output')).toHaveText('Signal online')
  await expect(guide.locator('dt', { hasText: 'Recovery' })).toBeVisible()
  await guide.getByText(/\d+ definitions with examples/iu).click()
  await guide.getByText('Wrong answer, changed code, or failed check').click()
  await expect(guide.getByText('print', { exact: true })).toBeVisible()
  await expect(guide.getByText(/Select Restore supplied code, then replace only/iu)).toBeVisible()
  await primary.scrollIntoViewIfNeeded()
  await expect(primary).toBeVisible()

  expect(await primary.evaluate((element) => (
    element.scrollWidth <= element.clientWidth + 1
    && element.scrollHeight <= element.clientHeight + 1
  ))).toBe(true)
  expect(await page.evaluate(documentFitsViewport)).toBe(true)
  await expect(page.getByRole('region', { name: 'Run results' })).toHaveCount(0)
})
