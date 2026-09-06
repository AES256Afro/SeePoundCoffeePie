// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ProjectStudio } from './ProjectStudio'
import { pythonInteractiveProject } from './data/python-interactive-project'
import { cppCompiledProject } from './data/cpp-compiled-project'
import { csharpWorkshopProject } from './data/csharp-workshop-project'
import { javaPicnicProject } from './data/java-picnic-project'
import { trackById } from './data/curriculum'
import { initialProgress } from './lib/progress'
import type { GuidedProject } from './data/project-types'

const projects = [pythonInteractiveProject, cppCompiledProject, csharpWorkshopProject, javaPicnicProject]
afterEach(cleanup)

function mount(project: GuidedProject, index = 11) {
  const progress = {
    ...initialProgress(project.language),
    onboardingComplete: true,
    completedMissions: trackById(project.language).missions.map((mission) => mission.id),
    completedProjectCheckpoints: project.checkpoints.slice(0, index).map((checkpoint) => checkpoint.id),
  }
  render(<ProjectStudio language={project.language} projectId={project.id}
    checkpointId={project.checkpoints[index].id} progress={progress}
    onProgress={vi.fn()} onNavigate={vi.fn()} />)
}

describe('guided project planning and output', () => {
  it.each(projects)('$language final step offers optional planning and exact output without calling a runner', async (project) => {
    mount(project)
    await screen.findByRole('heading', { level: 1, name: project.checkpoints[11].title })
    const plan = screen.getByText('Plan and test your program', { selector: 'summary' }).closest('details')!
    expect(plan.open).toBe(false)
    const help = project.checkpoints[11].planningHelp!
    expect(help.steps).toHaveLength(2)
    expect(help.experiments).toHaveLength(2)
    expect(within(plan).getByText(help.inputScope)).toBeInTheDocument()
    const expected = screen.getByLabelText('Expected program output')
    expect(expected.textContent).toBe(project.checkpoints[11].assessmentSummary!.visibleTestCase.expectedStdout)
    expect(expected.closest('details')!.open).toBe(false)
    expect(screen.getByRole('textbox', { name: 'Run input' })).toHaveValue(project.checkpoints[11].practiceStdin)
    expect(screen.getByRole('textbox', { name: 'Project code editor' })).toHaveValue(project.checkpoints[11].exercise.starterCode)
  })

  it('explains the intentional Python conversion error beside the target output', async () => {
    mount(pythonInteractiveProject, 9)
    await screen.findByRole('heading', { level: 1, name: pythonInteractiveProject.checkpoints[9].title })
    expect(screen.getByText('The starter is deliberately unfinished.')).toBeInTheDocument()
    expect(screen.getByLabelText('Expected program output').textContent).toBe(pythonInteractiveProject.checkpoints[9].exercise.output)
    expect(screen.queryByText('Plan and test your program')).not.toBeInTheDocument()
  })

  it('distinguishes C# null fallback from validating numeric input', () => {
    expect(csharpWorkshopProject.checkpoints[3].exercise.explanation).toContain('FormatException')
    expect(csharpWorkshopProject.checkpoints[3].exercise.explanation).not.toContain('always receives an int')
    expect(csharpWorkshopProject.checkpoints[9].exercise.explanation).toContain('not a language requirement')
    expect(csharpWorkshopProject.checkpoints[8].newTerms.some((term) => term.term === 'local function')).toBe(true)
  })
})
