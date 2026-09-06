import { expect, test } from './fixtures'
import { tracks } from '../../src/data/curriculum'
import { pythonDataToolsCourse } from '../../src/data/python-data-tools-course'
import { cppCollectionsRecordsDraftModules } from '../../src/data/cpp-collections-records-course-draft'

const cases = [
  ...tracks.map((track) => ({ course: `${track.id}-foundations`, mission: track.missions[0] })),
  { course: 'python-data-tools', mission: pythonDataToolsCourse.missions[0] },
  { course: 'cpp-collections-records', mission: cppCollectionsRecordsDraftModules[0] },
]

for (const { course, mission } of cases) {
  test(`${course}: Continue, reload, and browser Back preserve the actual lesson`, async ({ page, seedProgress }) => {
    await seedProgress({
      completedMissions: tracks.flatMap((track) => track.missions.map((item) => item.id)),
      completedProjects: ['first-interactive-program', 'first-compiled-program'],
    })
    const first = mission.exercises[0]
    const second = mission.exercises[1]
    const path = (id: string) => `/learn/${course}/${mission.id}/${id}`
    await page.goto(path(first.id))
    await expect(page.getByRole('heading', { level: 1, name: first.title })).toBeVisible()
    await page.locator(`.choice-list label:has(input[value="${first.correctChoice}"])`).click()
    await page.locator('.exercise-actions > .primary-action').click()
    await page.getByRole('button', { name: 'Continue', exact: true }).click()
    await expect(page).toHaveURL(new RegExp(`${path(second.id)}$`, 'u'))
    await expect(page.getByRole('heading', { level: 1, name: second.title })).toBeVisible()
    if (second.displayCode) {
      await expect(page.getByLabel('Code to predict').locator('code')).toHaveText(second.displayCode)
    }
    await page.reload()
    await expect(page.getByRole('heading', { level: 1, name: second.title })).toBeVisible()
    await page.goBack()
    await expect(page.getByRole('heading', { level: 1, name: first.title })).toBeVisible()
    await expect(page).toHaveURL(new RegExp(`${path(first.id)}$`, 'u'))
  })
}

test('Java setup is explained on demand at a narrow width', async ({ page, seedProgress }) => {
  await page.setViewportSize({ width: 320, height: 900 })
  await seedProgress()
  await page.goto('/learn/java-foundations/java-coffee-protocol/java-output')
  const walkthrough = page.locator('details:has(.code-guide__items)')
  await expect(walkthrough).not.toHaveAttribute('open', '')
  const toggle = walkthrough.locator('summary')
  await toggle.focus()
  await page.keyboard.press('Enter')
  await expect(walkthrough.getByText(/static lets Java call it/)).toBeVisible()
  await expect(walkthrough.getByText(/command-line text inputs/)).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true)
  await toggle.focus()
  await page.keyboard.press('Enter')
  await expect(walkthrough).not.toHaveAttribute('open', '')
})
