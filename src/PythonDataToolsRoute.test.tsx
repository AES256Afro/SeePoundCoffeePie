// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import {
  Suspense,
  type Dispatch,
  type PropsWithChildren,
  type ReactNode,
  type SetStateAction,
} from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  ContinuingCoursePage,
  PythonDataToolsCoursePage,
  PythonDataToolsLessonPage,
} from './PythonDataToolsRoute'
import { courseDefinition } from './data/course-registry'
import { trackById } from './data/curriculum'
import { pythonDataToolsCourse } from './data/python-data-tools-course'
import { initialProgress } from './lib/progress'
import type { CourseId, LearnerProgress, Mission } from './types'

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

function ContinuingCourseBoundary({ children }: PropsWithChildren) {
  return <Suspense fallback={<p>Opening course content</p>}>{children}</Suspense>
}

async function renderCourse(element: ReactNode) {
  let result: unknown
  await act(async () => {
    result = render(element, { wrapper: ContinuingCourseBoundary })
  })
  if (!result) throw new Error('Expected the continuing course route to render.')
  return result as ReturnType<typeof render>
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

    await renderCourse(
      <PythonDataToolsCoursePage
        onNavigate={onNavigate}
        onProgress={progressDispatcher()}
        progress={initialProgress('python')}
      />,
    )

    const courseHeading = await screen.findByRole('heading', {
      level: 1,
      name: 'Practical Python: Data Tools',
    })
    expect(courseHeading).toBeTruthy()
    expect(screen.getByText('Python course')).toBeTruthy()
    expect(screen.getByText('Complete both items below to start')).toBeTruthy()
    expect(screen.getByRole('heading', {
      name: 'Complete these first',
    })).toBeTruthy()
    expect(screen.getByText('You can view the modules now. Complete both items below to open the lessons.')).toBeTruthy()
    expect(screen.getByText('Complete the modules in order.')).toBeTruthy()
    expect(screen.getAllByRole('button')).toHaveLength(6)
    for (const title of definition.moduleTitles) {
      expect(screen.getByText(title)).toBeTruthy()
    }

    const foundationsItem = screen.getByText('Complete Python Foundations').closest('li')
    const projectItem = screen.getByText('Complete Your First Interactive Program').closest('li')
    if (!foundationsItem || !projectItem) throw new Error('Expected both prerequisite list items.')
    const foundationsLink = within(foundationsItem).getByRole('link', { name: /Open course/iu })
    const projectLink = within(projectItem).getByRole('link', { name: /Open project/iu })

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
      expect(document.activeElement).toBe(courseHeading)
    })
  })

  it('starts an available course at its first authored lesson', async () => {
    const onNavigate = vi.fn<(path: string) => void>()

    await renderCourse(
      <PythonDataToolsCoursePage
        onNavigate={onNavigate}
        onProgress={progressDispatcher()}
        progress={progressWithPrerequisites()}
      />,
    )

    const start = await screen.findByRole('link', { name: /Start course/iu })
    expect(screen.queryByText('Complete both items below to start')).toBeNull()
    expect(screen.queryByRole('heading', {
      name: 'Complete these first',
    })).toBeNull()
    expect(start.getAttribute('href')).toBe(
      '/learn/python-data-tools/py-data-return-values/pydata1-retrieve-call',
    )

    fireEvent.click(start)

    expect(onNavigate).toHaveBeenCalledOnce()
    expect(onNavigate).toHaveBeenCalledWith(
      '/learn/python-data-tools/py-data-return-values/pydata1-retrieve-call',
    )
  })

  it('shows a module description only while that module is open', async () => {
    const firstMission = pythonDataToolsCourse.missions[0]
    const secondMission = pythonDataToolsCourse.missions[1]

    await renderCourse(
      <PythonDataToolsCoursePage
        onNavigate={vi.fn()}
        onProgress={progressDispatcher()}
        progress={initialProgress('python')}
      />,
    )

    expect(await screen.findByText(firstMission.description)).toBeTruthy()
    expect(screen.queryByText(secondMission.description)).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: new RegExp(secondMission.title, 'iu') }))

    expect(screen.queryByText(firstMission.description)).toBeNull()
    expect(screen.getByText(secondMission.description)).toBeTruthy()
  })

  it('requires the prior module before opening a later lesson', async () => {
    const firstMission = pythonDataToolsCourse.missions[0]
    const secondMission = pythonDataToolsCourse.missions[1]
    const exercise = secondMission.exercises.at(-1)
    if (!exercise) throw new Error('Expected the final lesson in the second module.')
    const onProgress = progressDispatcher()
    const onNavigate = vi.fn<(path: string) => void>()
    const ready = progressWithPrerequisites()
    const { rerender } = await renderCourse(
      <PythonDataToolsLessonPage
        exerciseId={exercise.id}
        missionId={secondMission.id}
        onNavigate={onNavigate}
        onProgress={onProgress}
        progress={ready}
      />,
    )

    expect(await screen.findByRole('heading', {
      name: `${exercise.title} is still ahead`,
    })).toBeTruthy()
    expect(screen.getByText(
      'Complete Functions That Return Answers first. Each module uses ideas from the one before it.',
    )).toBeTruthy()
    expect(screen.queryByRole('main', { name: 'Mock lesson player' })).toBeNull()

    await act(async () => {
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
    })

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

    await renderCourse(
      <PythonDataToolsLessonPage
        exerciseId={exercise.id}
        missionId={mission.id}
        onNavigate={vi.fn()}
        onProgress={onProgress}
        progress={progress}
      />,
    )

    expect(await screen.findByText('Lesson locked')).toBeTruthy()
    expect(screen.getByRole('heading', {
      name: `${exercise.title} is still ahead`,
    })).toBeTruthy()
    expect(screen.queryByRole('main', { name: 'Mock lesson player' })).toBeNull()
    await waitFor(() => {
      expect(document.title).toBe('Build normalize_name | SeePoundCoffeePie')
    })
    expect(onProgress).not.toHaveBeenCalled()

    cleanup()
    await renderCourse(
      <PythonDataToolsCoursePage
        onNavigate={vi.fn()}
        onProgress={onProgress}
        progress={progress}
      />,
    )

    expect(await screen.findByText('Complete both items below to start')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /Cleaning and Normalizing Text/iu }))
    const lockedLesson = screen.getByText(exercise.title).closest<HTMLElement>('.is-locked')
    if (!lockedLesson) throw new Error('Expected the recorded lesson to remain a locked outline row.')
    expect(within(lockedLesson).getByText('Complete both items below first')).toBeTruthy()
    expect(within(lockedLesson).queryByRole('link')).toBeNull()
  })

  it('offers module completion only after all five lessons and sends the progress update', async () => {
    const mission = pythonDataToolsCourse.missions[0]
    const lessonIds = mission.exercises.map((exercise) => exercise.id)
    const onProgress = progressDispatcher()
    const fourLessons = progressWithPrerequisites({
      completedLessons: lessonIds.slice(0, 4),
    })
    const { rerender } = await renderCourse(
      <PythonDataToolsCoursePage
        onNavigate={vi.fn()}
        onProgress={onProgress}
        progress={fourLessons}
      />,
    )

    expect(await screen.findByText('4 of 5 lessons complete')).toBeTruthy()
    expect(screen.queryByRole('button', { name: /Finish module/iu })).toBeNull()
    expect(onProgress).not.toHaveBeenCalled()

    const allLessons = progressWithPrerequisites({ completedLessons: lessonIds })
    await act(async () => {
      rerender(
        <PythonDataToolsCoursePage
          onNavigate={vi.fn()}
          onProgress={onProgress}
          progress={allLessons}
        />,
      )
    })

    expect(await screen.findByText('5 of 5 lessons complete')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /Finish module/iu }))

    expect(onProgress).toHaveBeenCalledOnce()
    const update = onProgress.mock.calls[0]?.[0]
    if (typeof update !== 'function') throw new Error('Expected a functional progress update.')
    const completed = update(allLessons)
    expect(completed.completedMissions).toEqual([...foundationMissionIds, mission.id])
    expect(completed.completedLessons).toEqual(lessonIds)
    expect(completed.starShards).toBe(25)
    expect(screen.getByRole('status').textContent).toBe(
      'Module complete. Module 2 is now available.',
    )
  })

  it('keeps the concrete Supply Tracker completion message', async () => {
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

    await renderCourse(
      <PythonDataToolsCoursePage
        onNavigate={vi.fn()}
        onProgress={progressDispatcher()}
        progress={progress}
      />,
    )

    fireEvent.click(await screen.findByRole('button', { name: /Finish module/iu }))
    expect(screen.getByRole('status').textContent).toBe(
      'Course complete. Your Supply Tracker is ready to review.',
    )
  })

  it('uses the normal not-found page when a continuing course has no loader', async () => {
    await renderCourse(
      <ContinuingCoursePage
        courseId={'cpp-collections-records' as CourseId}
        onNavigate={vi.fn()}
        onProgress={progressDispatcher()}
        progress={initialProgress('python')}
      />,
    )

    expect(screen.getByRole('heading', {
      level: 1,
      name: 'We could not find that page',
    })).toBeTruthy()
    expect(screen.getByRole('link', { name: /Go to the start page/iu }).getAttribute('href')).toBe('/')
  })
})
