// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import type { Dispatch, SetStateAction } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  PythonDataToolsCoursePage,
  PythonDataToolsLessonPage,
} from './PythonDataToolsRoute'
import { courseDefinition } from './data/course-registry'
import { trackById } from './data/curriculum'
import { pythonDataToolsCourse } from './data/python-data-tools-course'
import { initialProgress } from './lib/progress'
import type { LearnerProgress, Mission } from './types'

interface MockLessonPlayerProps {
  initialExerciseId?: string
  mission: Mission
  onProgress: Dispatch<SetStateAction<LearnerProgress>>
}

vi.mock('./LessonPlayer', () => ({
  LessonPlayer: ({
    initialExerciseId,
    mission,
    onProgress,
  }: MockLessonPlayerProps) => (
    <main aria-label="Mock lesson player">
      <h1>Lesson player: {initialExerciseId}</h1>
      <p>Mission: {mission.id}</p>
      <button
        onClick={() => onProgress((current) => ({
          ...current,
          callsign: `Reviewed ${initialExerciseId}`,
        }))}
      >
        Record mock progress
      </button>
    </main>
  ),
}))

const definition = courseDefinition('python-data-tools')
const foundationMissionIds = trackById('python').missions.map((mission) => mission.id)
const projectId = 'first-interactive-program'

function progressWithPrerequisites(
  overrides: Partial<LearnerProgress> = {},
): LearnerProgress {
  return {
    ...initialProgress('python'),
    completedMissions: [...foundationMissionIds],
    completedProjects: [projectId],
    ...overrides,
  }
}

function progressDispatcher() {
  return vi.fn<(value: SetStateAction<LearnerProgress>) => void>()
}

describe('Practical Python route components', () => {
  beforeEach(() => {
    document.title = 'Test document'
  })

  afterEach(() => {
    cleanup()
    document.title = ''
    vi.clearAllMocks()
  })

  it('previews the locked course and routes both prerequisite links', async () => {
    const onNavigate = vi.fn<(path: string) => void>()

    render(
      <PythonDataToolsCoursePage
        onNavigate={onNavigate}
        onProgress={progressDispatcher()}
        progress={initialProgress('python')}
      />,
    )

    expect(screen.getByRole('heading', {
      level: 1,
      name: 'Practical Python: Data Tools',
    })).toBeTruthy()
    expect(screen.getByText('Finish both prerequisites to start')).toBeTruthy()
    expect(screen.getByRole('heading', {
      name: 'Two earlier steps make this course feel gentle',
    })).toBeTruthy()
    expect(screen.getAllByRole('button')).toHaveLength(6)
    for (const title of definition.moduleTitles) {
      expect(screen.getByText(title)).toBeTruthy()
    }

    const foundationsItem = screen.getByText('Complete Python Foundations').closest('li')
    const projectItem = screen.getByText('Complete Your First Interactive Program').closest('li')
    if (!foundationsItem || !projectItem) throw new Error('Expected both prerequisite list items.')
    const foundationsLink = within(foundationsItem).getByRole('link', { name: /Open step/iu })
    const projectLink = within(projectItem).getByRole('link', { name: /Open step/iu })

    expect(foundationsLink.getAttribute('href')).toBe('/courses/python-foundations')
    expect(projectLink.getAttribute('href')).toBe('/projects/python/first-interactive-program')
    fireEvent.click(foundationsLink)
    fireEvent.click(projectLink)
    expect(onNavigate.mock.calls).toEqual([
      ['/courses/python-foundations'],
      ['/projects/python/first-interactive-program'],
    ])
    await waitFor(() => {
      expect(document.title).toBe('Practical Python: Data Tools | SeePoundCoffeePie')
    })
  })

  it('starts an available course at its first authored lesson', () => {
    const onNavigate = vi.fn<(path: string) => void>()

    render(
      <PythonDataToolsCoursePage
        onNavigate={onNavigate}
        onProgress={progressDispatcher()}
        progress={progressWithPrerequisites()}
      />,
    )

    expect(screen.queryByText('Finish both prerequisites to start')).toBeNull()
    expect(screen.queryByRole('heading', {
      name: 'Two earlier steps make this course feel gentle',
    })).toBeNull()
    const start = screen.getByRole('link', { name: /Start course/iu })
    expect(start.getAttribute('href')).toBe(
      '/learn/python-data-tools/py-data-return-values/pydata1-retrieve-call',
    )

    fireEvent.click(start)

    expect(onNavigate).toHaveBeenCalledOnce()
    expect(onNavigate).toHaveBeenCalledWith(
      '/learn/python-data-tools/py-data-return-values/pydata1-retrieve-call',
    )
  })

  it('requires the prior module before opening a later lesson', async () => {
    const firstMission = pythonDataToolsCourse.missions[0]
    const secondMission = pythonDataToolsCourse.missions[1]
    const exercise = secondMission.exercises.at(-1)
    if (!exercise) throw new Error('Expected the final lesson in the second module.')
    const onProgress = progressDispatcher()
    const onNavigate = vi.fn<(path: string) => void>()
    const ready = progressWithPrerequisites()
    const { rerender } = render(
      <PythonDataToolsLessonPage
        exerciseId={exercise.id}
        missionId={secondMission.id}
        onNavigate={onNavigate}
        onProgress={onProgress}
        progress={ready}
      />,
    )

    expect(screen.getByRole('heading', {
      name: `${exercise.title} is still ahead`,
    })).toBeTruthy()
    expect(screen.getByText(
      'Complete Functions That Return Answers first. Each module retrieves ideas that the next one uses.',
    )).toBeTruthy()
    expect(screen.queryByRole('main', { name: 'Mock lesson player' })).toBeNull()

    rerender(
      <PythonDataToolsLessonPage
        exerciseId={exercise.id}
        missionId={secondMission.id}
        onNavigate={onNavigate}
        onProgress={onProgress}
        progress={progressWithPrerequisites({
          completedMissions: [...foundationMissionIds, firstMission.id],
        })}
      />,
    )

    expect(await screen.findByRole('heading', {
      name: `Lesson player: ${exercise.id}`,
    })).toBeTruthy()
    expect(screen.getByText(`Mission: ${secondMission.id}`)).toBeTruthy()
  })

  it('keeps a recorded lesson locked when current prerequisites are missing', async () => {
    const mission = pythonDataToolsCourse.missions[1]
    const exercise = mission.exercises.find((candidate) => (
      candidate.id === 'pydata2-normalize-name'
    ))
    if (!exercise) throw new Error('Expected the normalize_name lesson.')
    const progress = {
      ...initialProgress('python'),
      completedLessons: [exercise.id],
    }
    const onProgress = progressDispatcher()

    render(
      <PythonDataToolsLessonPage
        exerciseId={exercise.id}
        missionId={mission.id}
        onNavigate={vi.fn()}
        onProgress={onProgress}
        progress={progress}
      />,
    )

    expect(screen.getByText('Lesson locked')).toBeTruthy()
    expect(screen.getByRole('heading', {
      name: `${exercise.title} is still ahead`,
    })).toBeTruthy()
    expect(screen.queryByRole('main', { name: 'Mock lesson player' })).toBeNull()
    await waitFor(() => {
      expect(document.title).toBe('Build normalize_name | SeePoundCoffeePie')
    })
    expect(onProgress).not.toHaveBeenCalled()

    cleanup()
    render(
      <PythonDataToolsCoursePage
        onNavigate={vi.fn()}
        onProgress={onProgress}
        progress={progress}
      />,
    )

    expect(screen.getByText('Finish both prerequisites to start')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /Cleaning and Normalizing Text/iu }))
    const lockedLesson = screen.getByText(exercise.title).closest<HTMLElement>('.is-locked')
    if (!lockedLesson) throw new Error('Expected the recorded lesson to remain a locked outline row.')
    expect(within(lockedLesson).getByText('Complete both course prerequisites first')).toBeTruthy()
    expect(within(lockedLesson).queryByRole('link')).toBeNull()
  })

  it('offers module completion only after all five lessons and sends the progress update', () => {
    const mission = pythonDataToolsCourse.missions[0]
    const lessonIds = mission.exercises.map((exercise) => exercise.id)
    const onProgress = progressDispatcher()
    const fourLessons = progressWithPrerequisites({
      completedLessons: lessonIds.slice(0, 4),
    })
    const { rerender } = render(
      <PythonDataToolsCoursePage
        onNavigate={vi.fn()}
        onProgress={onProgress}
        progress={fourLessons}
      />,
    )

    expect(screen.getByText('4 of 5 lessons complete')).toBeTruthy()
    expect(screen.queryByRole('button', { name: /Finish module/iu })).toBeNull()
    expect(onProgress).not.toHaveBeenCalled()

    const allLessons = progressWithPrerequisites({ completedLessons: lessonIds })
    rerender(
      <PythonDataToolsCoursePage
        onNavigate={vi.fn()}
        onProgress={onProgress}
        progress={allLessons}
      />,
    )

    expect(screen.getByText('5 of 5 lessons complete')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /Finish module/iu }))

    expect(onProgress).toHaveBeenCalledOnce()
    const update = onProgress.mock.calls[0]?.[0]
    if (typeof update !== 'function') throw new Error('Expected a functional progress update.')
    const completed = update(allLessons)
    expect(completed.completedMissions).toEqual([...foundationMissionIds, mission.id])
    expect(completed.completedLessons).toEqual(lessonIds)
    expect(completed.starShards).toBe(25)
    expect(screen.getByRole('status').textContent).toBe(
      'Module completed. 25 star shards saved. Module 2 is now available.',
    )
  })

  it('keeps the concrete Supply Tracker completion message', () => {
    const finalMission = pythonDataToolsCourse.missions.at(-1)
    if (!finalMission) throw new Error('Expected the final Practical Python module.')
    const priorMissionIds = pythonDataToolsCourse.missions.slice(0, -1).map((mission) => mission.id)
    const allLessonIds = pythonDataToolsCourse.missions.flatMap((mission) => (
      mission.exercises.map((exercise) => exercise.id)
    ))
    const progress = progressWithPrerequisites({
      completedLessons: allLessonIds,
      completedMissions: [...foundationMissionIds, ...priorMissionIds],
    })

    render(
      <PythonDataToolsCoursePage
        onNavigate={vi.fn()}
        onProgress={progressDispatcher()}
        progress={progress}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /Finish module/iu }))
    expect(screen.getByRole('status').textContent).toBe(
      'Course completed. 25 star shards saved. Your Supply Tracker is ready to review.',
    )
  })
})
