import { expect, test } from './fixtures'
import { tracks } from '../../src/data/curriculum'
import { pythonInteractiveProject } from '../../src/data/python-interactive-project'
import { cppCompiledProject } from '../../src/data/cpp-compiled-project'
import { csharpWorkshopProject } from '../../src/data/csharp-workshop-project'
import { javaPicnicProject } from '../../src/data/java-picnic-project'

for (const project of [pythonInteractiveProject, cppCompiledProject, csharpWorkshopProject, javaPicnicProject]) {
  test(`${project.language}: optional final-project help works with a narrow keyboard layout`, async ({ page, seedProgress }) => {
    await page.setViewportSize({ width: 375, height: 900 })
    await seedProgress({
      completedMissions: tracks.flatMap((track) => track.missions.map((mission) => mission.id)),
      completedProjectCheckpoints: project.checkpoints.slice(0, -1).map((checkpoint) => checkpoint.id),
    })
    const final = project.checkpoints[11]
    await page.goto(`${project.route}/${final.id}`)
    await expect(page.getByRole('heading', { level: 1, name: final.title })).toBeVisible()
    for (const label of ['What the code means', 'A familiar comparison']) {
      const guide = page.locator('details').filter({ has: page.locator('summary', { hasText: label }) })
      await expect(guide).not.toHaveAttribute('open', '')
      await guide.locator('summary').focus()
      await page.keyboard.press('Enter')
      await expect(guide).toHaveAttribute('open', '')
      await guide.locator('summary').focus()
      await page.keyboard.press('Enter')
      await expect(guide).not.toHaveAttribute('open', '')
    }
    for (const selector of ['.workshop-topbar', '.project-workspace__header']) {
      const background = await page.locator(selector).evaluate((element) => getComputedStyle(element).backgroundColor)
      expect(background).toMatch(/^rgb\(/)
    }
    const plan = page.locator('details').filter({ has: page.locator('summary', { hasText: 'Plan and test your program' }) })
    await expect(plan).not.toHaveAttribute('open', '')
    await plan.locator('summary').focus()
    await page.keyboard.press('Enter')
    await expect(plan.getByText(final.planningHelp!.inputScope)).toBeVisible()
    await plan.locator('summary').focus()
    await page.keyboard.press('Enter')
    const expected = page.locator('details').filter({ has: page.locator('summary', { hasText: 'Expected output after your changes' }) })
    await expected.locator('summary').focus()
    await page.keyboard.press('Enter')
    await expect(expected.getByLabel('Expected program output')).toHaveText(final.exercise.output!)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true)
    await page.screenshot({ path: `/tmp/spcp-project-planning-${project.language}.png`, fullPage: true })
    await page.reload()
    await expect(expected).not.toHaveAttribute('open', '')
    await expect(page.getByRole('textbox', { name: 'Project code editor' })).toHaveValue(final.exercise.starterCode!)
  })
}
