import { expect, PYTHON_FOUNDATION_MISSION_IDS, test } from './fixtures'

const practicalPythonCoursePath = '/courses/python-data-tools'
const practicalPythonLessonPath = '/learn/python-data-tools/py-data-return-values/pydata1-retrieve-call'
const practicalCppCoursePath = '/courses/cpp-collections-records'

test('the published catalog exposes all six reviewed courses', async ({ page, seedProgress }) => {
  await seedProgress()
  await page.goto('/courses')

  await expect(page.getByRole('heading', { level: 1, name: 'Choose a course' })).toBeVisible()
  const catalog = page.getByRole('region', { name: 'Courses' })
  await expect(catalog.getByRole('article')).toHaveCount(6)
  await expect(catalog.getByRole('heading', { name: 'Python Foundations' })).toBeVisible()
  await expect(catalog.getByRole('heading', { name: 'C++ Foundations' })).toBeVisible()
  await expect(catalog.getByRole('heading', { name: 'C# Foundations' })).toBeVisible()
  await expect(catalog.getByRole('heading', { name: 'Java Foundations' })).toBeVisible()
  await expect(catalog.getByRole('heading', { name: 'Practical Python: Data Tools' })).toBeVisible()
  await expect(catalog.getByRole('heading', { name: 'Practical C++: Collections and Records' })).toBeVisible()
  await expect(catalog.locator(`a[href="${practicalCppCoursePath}"]`)).toHaveCount(1)
})

test('the Practical Python outline explains both prerequisites while locked', async ({ page, seedProgress }) => {
  await seedProgress()
  await page.goto(practicalPythonCoursePath)

  await expect(page.getByRole('heading', { level: 1, name: 'Practical Python: Data Tools' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Complete these first' })).toBeVisible()
  await expect(page.getByText('Complete Python Foundations', { exact: true })).toBeVisible()
  await expect(page.getByText('Complete Your First Interactive Program', { exact: true })).toBeVisible()
  await expect(page.getByRole('region', { name: 'Modules' }).getByRole('button')).toHaveCount(6)
  await expect(page.getByRole('link', { name: /^Start course/iu })).toHaveCount(0)
})

test('a published foundation lesson opens from its canonical direct URL', async ({ page, seedProgress }) => {
  await seedProgress()
  await page.goto('/learn/python-foundations/py-first-spark/py-print')

  await expect(page.getByRole('heading', { level: 1, name: 'Print your first message' })).toBeVisible()
  await expect(page.getByRole('textbox', { name: 'Code editor' })).toBeVisible()
  await expect(page).toHaveURL(/\/learn\/python-foundations\/py-first-spark\/py-print$/u)
})

test('a direct Practical Python lesson stays locked until both prerequisites are complete', async ({ page, seedProgress }) => {
  await seedProgress()
  await page.goto(practicalPythonLessonPath)

  await expect(page.getByRole('heading', { level: 1, name: 'Trace a familiar function call is still ahead' })).toBeVisible()
  await expect(page.getByRole('link', { exact: true, name: 'Complete Python Foundations' })).toBeVisible()
  await expect(page.getByRole('link', { exact: true, name: 'Complete Your First Interactive Program' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Return to Practical Python' })).toHaveAttribute(
    'href',
    practicalPythonCoursePath,
  )
})

test('a direct Practical Python lesson opens after both prerequisites are complete', async ({ page, seedProgress }) => {
  await seedProgress({
    completedMissions: [...PYTHON_FOUNDATION_MISSION_IDS],
    completedProjects: ['first-interactive-program'],
  })
  await page.goto(practicalPythonLessonPath)

  await expect(page.getByRole('heading', { level: 1, name: 'Trace a familiar function call' })).toBeVisible()
  await expect(page.getByText('Lesson locked')).toHaveCount(0)
})
