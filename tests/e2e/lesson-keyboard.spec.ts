import { CPP_FOUNDATION_MISSION_IDS, expect, test } from './fixtures'

test('Tab leaves the code editor without changing code or invoking the runner', async ({ page, seedProgress }) => {
  await seedProgress()
  await page.goto('/learn/python-foundations/py-first-spark/py-print')

  const editor = page.getByRole('textbox', { name: 'Code editor' })
  const code = '# Show a message\nprint("Signal online")'
  await editor.fill(code)
  await editor.focus()
  await page.keyboard.press('Tab')

  await expect(editor).toHaveValue(code)
  await expect(editor).not.toBeFocused()
  await expect(page.getByRole('button', { name: 'I need a hint' })).toBeFocused()
})

test('Tab leaves the Practical C++ editor without changing code or invoking the runner', async ({ page, seedProgress }) => {
  await seedProgress({
    activeLanguage: 'cpp',
    completedMissions: [...CPP_FOUNDATION_MISSION_IDS],
    completedProjects: ['first-compiled-program'],
  })
  await page.goto(
    '/learn/cpp-collections-records/cpp-records-return-values/cpprecords1-fix-return',
  )

  const editor = page.getByRole('textbox', { name: 'Code editor' })
  const code = await editor.inputValue()
  await editor.focus()
  await page.keyboard.press('Tab')

  await expect(editor).toHaveValue(code)
  await expect(editor).not.toBeFocused()
  await expect(page.getByRole('button', { name: 'I need a hint' })).toBeFocused()
  await expect(page.getByRole('region', { name: 'Run results' })).toHaveCount(0)
})
