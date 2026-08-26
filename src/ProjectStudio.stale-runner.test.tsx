// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useEffect, useState } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ProjectStudio } from './ProjectStudio'
import { trackById } from './data/curriculum'
import { pythonInteractiveProject } from './data/python-interactive-project'
import { loadProjectHistory } from './lib/project-history'
import { initialProgress, saveProgress } from './lib/progress'
import { runExercise } from './lib/runner-client'
import type { LearnerProgress } from './types'

vi.mock('./lib/runner-client', () => ({
  runExercise: vi.fn(),
}))

type RunResult = Awaited<ReturnType<typeof runExercise>>

const projectId = pythonInteractiveProject.id
const pythonMissionIds = trackById('python').missions.map((mission) => mission.id)

function createMemoryStorage(): Storage {
  const values = new Map<string, string>()
  return {
    get length() { return values.size },
    clear() { values.clear() },
    getItem(key) { return values.get(key) ?? null },
    key(index) { return [...values.keys()][index] ?? null },
    removeItem(key) { values.delete(key) },
    setItem(key, value) { values.set(key, String(value)) },
  }
}

function successfulRun(runId: string): RunResult {
  return {
    version: 1,
    runId,
    outcome: 'completed',
    stdout: 'Coffee counter ready.\n',
    stderr: '',
    exitCode: 0,
    durationMs: 18,
    truncated: false,
    limit: null,
    tests: [
      { name: 'Visible checkpoint check', visibility: 'visible', passed: true, message: 'The output matched.' },
      { name: 'Protected checkpoint check', visibility: 'hidden', passed: true, message: 'The program finished.' },
    ],
    diagnostic: { title: 'Program finished', explanation: 'The program ran.', suggestion: 'Continue.', line: null },
  }
}

function projectProgress(completedProjectCheckpoints: string[] = []): LearnerProgress {
  return {
    ...initialProgress('python'),
    callsign: 'Project Cadet',
    onboardingComplete: true,
    completedMissions: pythonMissionIds,
    completedProjectCheckpoints,
  }
}

interface ProjectHarnessProps {
  initialCheckpointId: string
  startingProgress: LearnerProgress
}

function ProjectHarness({ initialCheckpointId, startingProgress }: ProjectHarnessProps) {
  const [checkpointId, setCheckpointId] = useState<string | undefined>(initialCheckpointId)
  const [progress, setProgress] = useState(startingProgress)

  useEffect(() => saveProgress(progress), [progress])

  return (
    <>
      <output aria-label="Harness progress">{JSON.stringify(progress)}</output>
      <ProjectStudio
        checkpointId={checkpointId}
        language="python"
        onNavigate={(path) => setCheckpointId(path.split('/').filter(Boolean)[3])}
        onProgress={setProgress}
        progress={progress}
        projectId={projectId}
      />
    </>
  )
}

function delayedRunner() {
  let finish!: (result: RunResult) => void
  const result = new Promise<RunResult>((resolve) => {
    finish = resolve
  })
  vi.mocked(runExercise).mockImplementationOnce((_exerciseId, _language, _source, onStatus) => {
    onStatus?.('running')
    return result
  })
  return { finish, result }
}

async function beginFirstCheckpointCheck() {
  expect(await screen.findByRole('heading', { level: 1, name: 'Let the program speak' })).toBeTruthy()
  fireEvent.change(screen.getByRole('textbox', { name: 'Project code editor' }), {
    target: { value: '# A comment for the learner\nprint("Coffee counter ready.")' },
  })
  fireEvent.click(screen.getByRole('button', { name: /Check checkpoint/iu }))
  await waitFor(() => expect(screen.getByRole('button', { name: 'Checking safely...' })).toBeTruthy())
}

describe('ProjectStudio stale runner protection', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: createMemoryStorage(),
    })
    window.localStorage.clear()
    vi.mocked(runExercise).mockReset()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('ignores a delayed checkpoint pass after navigating to another checkpoint', async () => {
    const completed = pythonInteractiveProject.checkpoints.slice(0, 2).map((checkpoint) => checkpoint.id)
    const pending = delayedRunner()
    render(
      <ProjectHarness
        initialCheckpointId="project-py-variable"
        startingProgress={projectProgress(completed)}
      />,
    )

    expect(await screen.findByRole('heading', { level: 1, name: 'Give a value a name' })).toBeTruthy()
    fireEvent.change(screen.getByRole('textbox', { name: 'Project code editor' }), {
      target: { value: 'customer_name = "Maya"\n\nprint(customer_name)' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Check checkpoint/iu }))
    fireEvent.click(screen.getByRole('link', { name: /Checkpoint 1: Let the program speak, complete/iu }))

    expect(await screen.findByRole('heading', { level: 1, name: 'Let the program speak' })).toBeTruthy()
    await act(async () => {
      pending.finish(successfulRun('run_stale_checkpoint_navigation_123'))
      await pending.result
    })

    const progress = JSON.parse(screen.getByLabelText('Harness progress').textContent ?? '{}') as LearnerProgress
    expect(progress.completedProjectCheckpoints).toEqual(completed)
    expect(progress.xp).toBe(0)
    expect(progress.conceptProgress).not.toHaveProperty('project-python-variables')
    expect(loadProjectHistory(projectId)).toEqual([])
    expect(screen.queryByText('Checkpoint complete')).toBeNull()
  })

  it('lets reset cancel an in-flight check without accepting its later result', async () => {
    const pending = delayedRunner()
    render(
      <ProjectHarness
        initialCheckpointId="project-py-print"
        startingProgress={projectProgress()}
      />,
    )

    await beginFirstCheckpointCheck()
    fireEvent.click(screen.getByRole('button', { name: 'Reset checkpoint' }))

    expect((screen.getByRole('textbox', { name: 'Project code editor' }) as HTMLTextAreaElement).value).toContain('_____')
    expect(screen.getByRole('button', { name: /Check checkpoint/iu })).toBeTruthy()
    await act(async () => {
      pending.finish(successfulRun('run_stale_checkpoint_reset_123456'))
      await pending.result
    })

    const progress = JSON.parse(screen.getByLabelText('Harness progress').textContent ?? '{}') as LearnerProgress
    expect(progress.completedProjectCheckpoints).toEqual([])
    expect(progress.xp).toBe(0)
    expect(progress.conceptProgress).toEqual({})
    expect(loadProjectHistory(projectId)).toEqual([])
    expect(screen.queryByText('Checkpoint complete')).toBeNull()
    expect(screen.queryByLabelText('Checkpoint test report')).toBeNull()
  })

  it('ignores a delayed checkpoint pass after leaving for the project overview', async () => {
    const pending = delayedRunner()
    render(
      <ProjectHarness
        initialCheckpointId="project-py-print"
        startingProgress={projectProgress()}
      />,
    )

    await beginFirstCheckpointCheck()
    fireEvent.click(screen.getByRole('link', { name: 'Back to project overview' }))
    expect(await screen.findByRole('heading', { name: pythonInteractiveProject.title })).toBeTruthy()

    await act(async () => {
      pending.finish(successfulRun('run_stale_project_overview_1234567'))
      await pending.result
    })

    const progress = JSON.parse(screen.getByLabelText('Harness progress').textContent ?? '{}') as LearnerProgress
    expect(progress.completedProjectCheckpoints).toEqual([])
    expect(progress.xp).toBe(0)
    expect(progress.conceptProgress).toEqual({})
    expect(loadProjectHistory(projectId)).toEqual([])
    expect(screen.queryByText('Checkpoint complete')).toBeNull()
  })

  it('does not write progress or history after the project workspace unmounts', async () => {
    const pending = delayedRunner()
    const onProgress = vi.fn()
    const rendered = render(
      <ProjectStudio
        checkpointId="project-py-print"
        language="python"
        onNavigate={vi.fn()}
        onProgress={onProgress}
        progress={projectProgress()}
        projectId={projectId}
      />,
    )

    await beginFirstCheckpointCheck()
    rendered.unmount()
    await act(async () => {
      pending.finish(successfulRun('run_stale_project_exit_123456789'))
      await pending.result
    })

    expect(onProgress).not.toHaveBeenCalled()
    expect(loadProjectHistory(projectId)).toEqual([])
  })
})
