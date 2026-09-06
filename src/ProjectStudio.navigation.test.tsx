// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { useState } from 'react'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ProjectStudio } from './ProjectStudio'
import { pythonInteractiveProject } from './data/python-interactive-project'
import { cppCompiledProject } from './data/cpp-compiled-project'
import { csharpWorkshopProject } from './data/csharp-workshop-project'
import { javaPicnicProject } from './data/java-picnic-project'
import { pythonInteractiveProjectServerAssessment } from './data/python-interactive-project.server'
import { cppCompiledProjectServerAssessment } from './data/cpp-compiled-project.server'
import { csharpWorkshopProjectServerAssessment } from './data/csharp-workshop-project.server'
import { javaPicnicProjectServerAssessment } from './data/java-picnic-project.server'
import { trackById } from './data/curriculum'
import { initialProgress } from './lib/progress'
import { runExercise } from './lib/runner-client'
import type { GuidedProject } from './data/project-types'
import type { RunnerResult } from './lib/runner-contract'

vi.mock('./lib/runner-client', () => ({ runExercise: vi.fn() }))
const projects = [pythonInteractiveProject, cppCompiledProject, csharpWorkshopProject, javaPicnicProject]
const assessments = [pythonInteractiveProjectServerAssessment, cppCompiledProjectServerAssessment, csharpWorkshopProjectServerAssessment, javaPicnicProjectServerAssessment]
beforeEach(() => {
  const values = new Map<string, string>()
  Object.defineProperty(window, 'localStorage', { configurable: true, value: {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  } })
  vi.mocked(runExercise).mockReset()
  vi.mocked(runExercise).mockResolvedValue({
    version: 1, runId: 'navigation_mock', outcome: 'completed', stdout: 'Example output', stderr: '',
    exitCode: 0, durationMs: 1, truncated: false, limit: null,
    tests: [{ name: 'Mock assessment', passed: true, visibility: 'visible', message: 'Passed' }],
    diagnostic: { title: 'Done', explanation: 'Local mock only.', suggestion: '', line: null },
  } as RunnerResult)
})
afterEach(cleanup)

function mount(project: GuidedProject, start = 0) {
  const navigated = vi.fn()
  function Harness() {
    const [checkpointId, setCheckpointId] = useState<string | undefined>(project.checkpoints[start].id)
    const [progress, setProgress] = useState(() => ({
      ...initialProgress(project.language), onboardingComplete: true,
      completedMissions: trackById(project.language).missions.map((mission) => mission.id),
      completedProjectCheckpoints: project.checkpoints.slice(0, -1).map((checkpoint) => checkpoint.id),
    }))
    return <ProjectStudio language={project.language} projectId={project.id}
      checkpointId={checkpointId} progress={progress} onProgress={setProgress}
      onNavigate={(path) => {
        navigated(path)
        setCheckpointId(path === project.route ? undefined : path.split('/').at(-1))
      }} />
  }
  const mounted = render(<Harness />)
  return { ...mounted, navigated }
}

describe('project checkpoint navigation', () => {
  it.each(projects)('$language exposes the correct task type at all 12 checkpoint destinations', async (project) => {
    mount(project)
    await screen.findByRole('heading', { level: 1, name: project.checkpoints[0].title })
    for (const checkpoint of project.checkpoints) {
      fireEvent.click(screen.getByRole('link', { name: new RegExp(`^Step ${checkpoint.order}:`) }))
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(checkpoint.title)
      if (checkpoint.exercise.type === 'ordering') {
        expect(screen.getByRole('list', { name: 'Project jobs to order' })).toBeInTheDocument()
        expect(screen.queryByRole('textbox', { name: 'Project code editor' })).not.toBeInTheDocument()
        expect(screen.queryByRole('button', { name: 'Run' })).not.toBeInTheDocument()
      } else if (['choice', 'prediction'].includes(checkpoint.exercise.type)) {
        expect(screen.getAllByRole('radio')).toHaveLength(checkpoint.exercise.choices!.length)
      } else {
        expect(screen.getByRole('textbox', { name: 'Project code editor' })).toHaveValue(checkpoint.exercise.starterCode)
      }
    }
    expect(runExercise).not.toHaveBeenCalled()
  })

  it.each([csharpWorkshopProject, javaPicnicProject])('$language ordering can be corrected and advances to assembly without a runner', async (project) => {
    const { navigated } = mount(project, 9)
    const checkpoint = project.checkpoints[9]
    await screen.findByRole('list', { name: 'Project jobs to order' })
    fireEvent.click(screen.getByRole('button', { name: 'Check order' }))
    expect(screen.getByText('Check this part')).toBeInTheDocument()
    for (const [destination, id] of checkpoint.exercise.correctOrder!.entries()) {
      const item = checkpoint.exercise.orderItems!.find((candidate) => candidate.id === id)!
      let position = within(screen.getByRole('list', { name: 'Project jobs to order' })).getAllByRole('listitem').findIndex((row) => row.textContent!.includes(item.code))
      while (position-- > destination) fireEvent.click(screen.getByRole('button', { name: `Move ${item.code} up` }))
    }
    fireEvent.click(screen.getByRole('button', { name: 'Check order' }))
    fireEvent.click(screen.getByRole('button', { name: 'Next step' }))
    expect(navigated).toHaveBeenLastCalledWith(`${project.route}/${project.checkpoints[10].id}`)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(project.checkpoints[10].title)
    expect(runExercise).not.toHaveBeenCalled()
  })

  it.each(projects)('$language drafts stay with their checkpoint when navigating and remounting', async (project) => {
    const editable = project.checkpoints.filter((step) => ['code', 'bugfix'].includes(step.exercise.type)).slice(0, 2)
    const start = project.checkpoints.indexOf(editable[0])
    const { unmount } = mount(project, start)
    await screen.findByRole('textbox', { name: 'Project code editor' })
    fireEvent.change(screen.getByRole('textbox', { name: 'Project code editor' }), { target: { value: 'My checkpoint draft' } })
    fireEvent.click(screen.getByRole('link', { name: new RegExp(`^Step ${editable[1].order}:`) }))
    expect(screen.getByRole('textbox', { name: 'Project code editor' })).toHaveValue(editable[1].exercise.starterCode)
    fireEvent.click(screen.getByRole('link', { name: new RegExp(`^Step ${editable[0].order}:`) }))
    expect(screen.getByRole('textbox', { name: 'Project code editor' })).toHaveValue('My checkpoint draft')
    unmount()
    mount(project, start)
    expect(await screen.findByRole('textbox', { name: 'Project code editor' })).toHaveValue('My checkpoint draft')
  })

  it.each(projects)('$language final completion returns to the project overview and invalidates stale feedback on edit', async (project) => {
    const { navigated } = mount(project, 11)
    const editor = await screen.findByRole('textbox', { name: 'Project code editor' })
    const solution = assessments[projects.indexOf(project)].referenceSolution
    fireEvent.change(editor, { target: { value: solution } })
    fireEvent.click(screen.getByRole('button', { name: 'Check work' }))
    await screen.findByRole('button', { name: 'Finish project' })
    fireEvent.change(editor, { target: { value: solution + '\n' } })
    expect(screen.queryByRole('button', { name: 'Finish project' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Check work' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Finish project' }))
    await waitFor(() => expect(navigated).toHaveBeenLastCalledWith(project.route))
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(project.title)
  })
})
