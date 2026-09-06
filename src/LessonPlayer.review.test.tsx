// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LessonPlayer } from './LessonPlayer'
import { useState } from 'react'
import { tracks } from './data/curriculum'
import { pythonDataToolsCourse } from './data/python-data-tools-course'
import { cppCollectionsRecordsDraftModules } from './data/cpp-collections-records-course-draft'
import { initialProgress } from './lib/progress'
import type { Mission } from './types'

const missions = [...tracks.flatMap((track) => track.missions), ...pythonDataToolsCourse.missions, ...cppCollectionsRecordsDraftModules]
afterEach(cleanup)

function mount(mission: Mission, initialExerciseId = mission.exercises[0].id) {
  const changed = vi.fn()
  function Harness() {
    const [exerciseId, setExerciseId] = useState(initialExerciseId)
    const [progress, setProgress] = useState(() => initialProgress(mission.language))
    return <LessonPlayer mission={mission} initialExerciseId={exerciseId}
      progress={progress} onProgress={setProgress}
      onExerciseChange={(id) => { changed(id); setExerciseId(id) }} onExit={vi.fn()} />
  }
  render(<Harness />)
  return changed
}

describe('core lesson reading and navigation', () => {
  it.each(tracks)('makes $id setup explanations available without expanding them by default', (track) => {
    const mission = track.missions[0]
    mount(mission, mission.exercises[1].id)
    const summary = screen.getByText('Words and code explained', { selector: 'summary' })
    const details = summary.closest('details')!
    expect(details.open).toBe(false)
    // The introductory guide used to prevent these authored explanations from rendering at all.
    for (const item of mission.exercises[1].codeGuide!) {
      expect(within(details).getByText(item.plain)).toBeInTheDocument()
    }
  })

  it.each(cppCollectionsRecordsDraftModules.filter((mission) => mission.exercises[1].displayCode))('shows the question example in $id', (mission) => {
    const exercise = mission.exercises[1]
    mount(mission, exercise.id)
    expect(screen.getByLabelText('Code to predict').querySelector('code')!.textContent).toBe(exercise.displayCode)
  })

  it.each(missions)('Continue changes the lesson, not just the scroll position, in $id', (mission) => {
    const changed = mount(mission)
    const first = mission.exercises[0]
    const correct = first.choices!.find((choice) => choice.id === first.correctChoice)!
    fireEvent.click(screen.getAllByRole('radio').find((radio) => (radio as HTMLInputElement).value === correct.id)!)
    fireEvent.click(document.querySelector('.exercise-actions > .primary-action')!)
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    expect(changed).toHaveBeenLastCalledWith(mission.exercises[1].id)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(mission.exercises[1].title)
  })
})
