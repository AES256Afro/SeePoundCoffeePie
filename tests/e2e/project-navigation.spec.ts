import { expect, test } from './fixtures'
import { tracks } from '../../src/data/curriculum'
import { pythonInteractiveProject } from '../../src/data/python-interactive-project'
import { cppCompiledProject } from '../../src/data/cpp-compiled-project'
import { csharpWorkshopProject } from '../../src/data/csharp-workshop-project'
import { javaPicnicProject } from '../../src/data/java-picnic-project'

for (const project of [pythonInteractiveProject, cppCompiledProject, csharpWorkshopProject, javaPicnicProject]) {
  test(`${project.language}: all checkpoints have real URLs, Back works, and drafts survive reload`, async ({ page, seedProgress }) => {
    await seedProgress({
      completedMissions: tracks.flatMap((track) => track.missions.map((mission) => mission.id)),
      completedProjectCheckpoints: project.checkpoints.slice(0, -1).map((step) => step.id),
    }, { preserveOnReload: true })
    await page.goto(`${project.route}/${project.checkpoints[0].id}`)
    for (const checkpoint of project.checkpoints) {
      await page.getByRole('link', { name: new RegExp(`^Step ${checkpoint.order}:`) }).click()
      await expect(page).toHaveURL(new RegExp(`/${checkpoint.id}$`))
      await expect(page.getByRole('heading', { level: 1, name: checkpoint.title })).toBeVisible()
      if (checkpoint.exercise.type === 'ordering') {
        await expect(page.getByRole('list', { name: 'Project jobs to order' })).toBeVisible()
        await expect(page.getByRole('textbox', { name: 'Project code editor' })).toHaveCount(0)
      }
    }
    const editable = project.checkpoints.filter((step) => ['code', 'bugfix'].includes(step.exercise.type)).slice(0, 2)
    await page.getByRole('link', { name: new RegExp(`^Step ${editable[0].order}:`) }).click()
    await page.getByRole('textbox', { name: 'Project code editor' }).fill('My saved draft')
    await page.getByRole('link', { name: new RegExp(`^Step ${editable[1].order}:`) }).click()
    await expect(page.getByRole('textbox', { name: 'Project code editor' })).toHaveValue(editable[1].exercise.starterCode!)
    await page.goBack()
    await expect(page).toHaveURL(new RegExp(`/${editable[0].id}$`))
    await expect(page.getByRole('textbox', { name: 'Project code editor' })).toHaveValue('My saved draft')
    await page.reload()
    await expect(page.getByRole('textbox', { name: 'Project code editor' })).toHaveValue('My saved draft')
  })
}

for (const project of [csharpWorkshopProject, javaPicnicProject]) {
  test(`${project.language}: arrange project jobs by keyboard and continue to assembly`, async ({ page, seedProgress }) => {
    await page.setViewportSize({ width: 375, height: 900 })
    await seedProgress({
      completedMissions: tracks.flatMap((track) => track.missions.map((mission) => mission.id)),
      completedProjectCheckpoints: project.checkpoints.slice(0, 9).map((step) => step.id),
    }, { preserveOnReload: true })
    const checkpoint = project.checkpoints[9]
    await page.goto(`${project.route}/${checkpoint.id}`)
    const list = page.getByRole('list', { name: 'Project jobs to order' })
    await page.getByRole('button', { name: 'Check order' }).click()
    await expect(page.getByText('Check this part', { exact: true })).toBeVisible()
    for (const [destination, id] of checkpoint.exercise.correctOrder!.entries()) {
      const item = checkpoint.exercise.orderItems!.find((candidate) => candidate.id === id)!
      let position = (await list.getByRole('listitem').allTextContents()).findIndex((text) => text.includes(item.code))
      while (position-- > destination) {
        await page.getByRole('button', { name: `Move ${item.code} up`, exact: true }).focus()
        await page.keyboard.press('Enter')
      }
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true)
    await page.screenshot({ path: `/tmp/spcp-project-order-${project.language}.png` })
    await page.getByRole('button', { name: 'Check order' }).click()
    await page.getByRole('button', { name: 'Next step' }).click()
    await expect(page).toHaveURL(new RegExp(`/${project.checkpoints[10].id}$`))
    await expect(page.getByRole('heading', { level: 1, name: project.checkpoints[10].title })).toBeVisible()
    await page.reload()
    await expect(page.getByRole('heading', { level: 1, name: project.checkpoints[10].title })).toBeVisible()
  })
}
