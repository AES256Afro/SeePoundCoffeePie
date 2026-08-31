// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AcademyRoute } from './AcademyRoute'
import { academyContentForUnit, academySourcesForUnit } from './data/academy-content'
import {
  academyModuleForId,
  academyUnitForId,
  type AcademyPreparationPageId,
  type AcademyUnitId,
} from './data/academy-manifest'
import { initialProgress } from './lib/progress'
import { academyPreparationPath, academyUnitPath } from './lib/routes'
import type { LearnerProgress } from './types'

describe('open academy route', () => {
  afterEach(cleanup)

  it('renders a complete open course for a guest and offers three optional ways to begin', () => {
    const onNavigate = vi.fn()
    const onProgress = vi.fn()

    const { container } = render(
      <AcademyRoute
        academyCourseId="LM-101"
        academyPathId="LM-100"
        onNavigate={onNavigate}
        onProgress={onProgress}
        progress={initialProgress('python')}
      />,
    )

    expect(screen.getByRole('heading', { level: 1, name: 'What a model is' })).toBeInTheDocument()
    expect(screen.getByText('0 of 6 units complete. Completion is recorded, but every unit remains open.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Start now/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Review a refresher/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Read the short context/i })).toBeInTheDocument()
    expect(container.textContent).not.toMatch(/\b(?:locked|prerequisite|sign in to continue)\b/i)

    fireEvent.click(screen.getByRole('link', { name: /Review a refresher/i }))

    expect(onNavigate).toHaveBeenCalledWith(
      academyPreparationPath('LM-100', 'LM-101', 'LM-101-P1'),
    )
    expect(onProgress).not.toHaveBeenCalled()
  })

  it('keeps optional preparation reading separate from learner progress', () => {
    const onNavigate = vi.fn()
    const onProgress = vi.fn()

    render(
      <AcademyRoute
        academyCourseId="LM-101"
        academyPathId="LM-100"
        academyPreparationPageId={'LM-101-P1' satisfies AcademyPreparationPageId}
        onNavigate={onNavigate}
        onProgress={onProgress}
        progress={initialProgress('python')}
      />,
    )

    expect(screen.getByRole('heading', { level: 1, name: 'Computer words refresher' })).toBeInTheDocument()
    expect(screen.getByText('This page is optional. Reading it does not change access or progress.')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('link', { name: /Open the first unit/i }))

    expect(onNavigate).toHaveBeenCalledOnce()
    expect(onProgress).not.toHaveBeenCalled()
  })

  it('shows the definitions, goal, expected result, recovery, and scoped sources on a unit page', () => {
    const unitId: AcademyUnitId = 'LM-101-U1'
    const content = academyContentForUnit(unitId)
    const source = academySourcesForUnit(unitId)[0]

    render(
      <AcademyRoute
        academyCourseId="LM-101"
        academyModuleId="LM-101-M1"
        academyPathId="LM-100"
        academyUnitId={unitId}
        onProgress={vi.fn()}
        progress={initialProgress('python')}
      />,
    )

    expect(screen.getByRole('heading', { level: 1, name: academyUnitForId(unitId)?.title })).toBeInTheDocument()
    expect(screen.getByText(content.goal)).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Words on this page' })).toBeInTheDocument()
    expect(screen.getByText('Input')).toBeInTheDocument()
    expect(screen.getByText(content.practice.expectedResult)).toBeInTheDocument()
    expect(screen.getByText(content.practice.recovery)).toBeInTheDocument()
    const sourcesSummary = screen.getByText(`Sources and evidence limits (${academySourcesForUnit(unitId).length})`)
    expect(sourcesSummary.closest('details')).not.toHaveAttribute('open')
    fireEvent.click(sourcesSummary)
    const sourceLink = screen.getByRole('link', { name: source.title })
    const sourceCard = sourceLink.closest('article')
    expect(sourceLink).toHaveAttribute('href', source.url)
    expect(sourceCard).not.toBeNull()
    expect(sourceCard).toHaveTextContent(`Supports: ${source.supports}`)
    expect(sourceCard).toHaveTextContent(`Does not prove: ${source.limits}`)
  })

  it('uses six learner stages and keeps optional detail out of the main reading flow', () => {
    render(
      <AcademyRoute
        academyCourseId="LM-101"
        academyModuleId="LM-101-M1"
        academyPathId="LM-100"
        academyUnitId="LM-101-U1"
        onProgress={vi.fn()}
        progress={initialProgress('python')}
      />,
    )

    const sectionNavigation = screen.getByRole('navigation', { name: 'Sections on this page' })
    expect(within(sectionNavigation).getAllByRole('link').map((link) => link.textContent)).toEqual([
      'Start',
      'Words',
      'Example',
      'Try it',
      'Check',
      'Review and continue',
    ])
    expect(screen.getByRole('heading', { level: 2, name: 'Start here' })).toBeInTheDocument()
    expect(screen.getAllByText('12 minutes')).toHaveLength(1)
    expect(screen.getByRole('heading', { level: 2, name: 'Work through an example' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 2, name: 'Prepared result' })).not.toBeInTheDocument()
    expect(screen.getByText('Need a refresher or more context?').closest('details')).not.toHaveAttribute('open')
    expect(screen.getByText('Limits of this lesson').closest('details')).not.toHaveAttribute('open')
    expect(screen.getByText('Pause and return later').closest('details')).not.toHaveAttribute('open')
  })

  it('makes the current position and next destination explicit', () => {
    const unitId: AcademyUnitId = 'LM-101-U1'
    const nextUnit = academyUnitForId('LM-101-U2')
    if (!nextUnit) throw new Error('LM-101-U2 is missing from the academy manifest.')

    render(
      <AcademyRoute
        academyCourseId="LM-101"
        academyModuleId="LM-101-M1"
        academyPathId="LM-100"
        academyUnitId={unitId}
        onProgress={vi.fn()}
        progress={initialProgress('python')}
      />,
    )

    expect(screen.getByText('Unit 1 of 6 · Unit reference LM-101-U1')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: `Next unit: ${nextUnit.title}` })).toHaveAttribute(
      'href',
      academyUnitPath('LM-100', 'LM-101', nextUnit.moduleId, nextUnit.id),
    )
  })

  it('resets unit-only interaction state when navigation opens another unit', () => {
    const firstContent = academyContentForUnit('LM-101-U1')
    const incorrectIndex = firstContent.knowledgeCheck.choices.findIndex((choice) => !choice.correct)
    const commonProps = {
      academyCourseId: 'LM-101' as const,
      academyModuleId: 'LM-101-M1' as const,
      academyPathId: 'LM-100' as const,
      onProgress: vi.fn(),
      progress: initialProgress('python'),
    }
    const { rerender } = render(<AcademyRoute {...commonProps} academyUnitId="LM-101-U1" />)

    fireEvent.click(within(screen.getByRole('radiogroup')).getAllByRole('radio')[incorrectIndex])
    fireEvent.click(screen.getByRole('button', { name: 'Check answer' }))
    expect(screen.getByRole('status')).toHaveTextContent('Not yet')

    rerender(<AcademyRoute {...commonProps} academyUnitId="LM-101-U2" />)

    expect(screen.getByRole('heading', { level: 1, name: academyUnitForId('LM-101-U2')?.title })).toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Check answer' })).toBeDisabled()
    expect(within(screen.getByRole('radiogroup')).getAllByRole('radio').every((choice) => !choice.hasAttribute('disabled'))).toBe(true)
  })

  it('gives answer-specific feedback, permits a retry, and writes no progress for an incorrect answer', () => {
    const unitId: AcademyUnitId = 'LM-101-U1'
    const content = academyContentForUnit(unitId)
    const incorrectIndex = content.knowledgeCheck.choices.findIndex((choice) => !choice.correct)
    const incorrectChoice = content.knowledgeCheck.choices[incorrectIndex]
    const onProgress = vi.fn()

    render(
      <AcademyRoute
        academyCourseId="LM-101"
        academyModuleId="LM-101-M1"
        academyPathId="LM-100"
        academyUnitId={unitId}
        onProgress={onProgress}
        progress={initialProgress('python')}
      />,
    )

    const choices = within(screen.getByRole('radiogroup')).getAllByRole('radio')
    fireEvent.click(choices[incorrectIndex])
    fireEvent.click(screen.getByRole('button', { name: 'Check answer' }))

    expect(screen.getByRole('status')).toHaveTextContent('Not yet')
    expect(screen.getByRole('status')).toHaveTextContent(incorrectChoice.feedback)
    expect(screen.getByRole('status')).toHaveTextContent(content.knowledgeCheck.retry)
    expect(onProgress).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(within(screen.getByRole('radiogroup')).getAllByRole('radio').every((choice) => !choice.hasAttribute('disabled'))).toBe(true)
  })

  it('records a correct unit without completing an unfinished module', () => {
    const unitId: AcademyUnitId = 'LM-101-U1'
    const content = academyContentForUnit(unitId)
    const correctIndex = content.knowledgeCheck.choices.findIndex((choice) => choice.correct)
    const onProgress = vi.fn<(progress: LearnerProgress) => void>()

    render(
      <AcademyRoute
        academyCourseId="LM-101"
        academyModuleId="LM-101-M1"
        academyPathId="LM-100"
        academyUnitId={unitId}
        onProgress={onProgress}
        progress={initialProgress('python')}
      />,
    )

    fireEvent.click(within(screen.getByRole('radiogroup')).getAllByRole('radio')[correctIndex])
    fireEvent.click(screen.getByRole('button', { name: 'Check answer' }))

    expect(screen.getByRole('status')).toHaveTextContent('Correct')
    expect(within(screen.getByRole('status')).getByRole('link', { name: 'Continue: Inputs and outputs' })).toHaveAttribute(
      'href',
      academyUnitPath('LM-100', 'LM-101', 'LM-101-M1', 'LM-101-U2'),
    )
    expect(onProgress).toHaveBeenCalledOnce()
    expect(onProgress.mock.calls[0][0]).toMatchObject({
      completedLessons: ['LM-101-U1'],
      completedMissions: [],
      starShards: 0,
    })
  })

  it('completes a module only when its final open unit is answered correctly', () => {
    const module = academyModuleForId('LM-101-M1')
    const unitId: AcademyUnitId = 'LM-101-U3'
    const content = academyContentForUnit(unitId)
    const correctIndex = content.knowledgeCheck.choices.findIndex((choice) => choice.correct)
    const onProgress = vi.fn<(progress: LearnerProgress) => void>()
    if (!module) throw new Error('LM-101-M1 is missing from the academy manifest.')

    render(
      <AcademyRoute
        academyCourseId="LM-101"
        academyModuleId={module.id}
        academyPathId="LM-100"
        academyUnitId={unitId}
        onProgress={onProgress}
        progress={{
          ...initialProgress('python'),
          completedLessons: ['LM-101-U1', 'LM-101-U2'],
        }}
      />,
    )

    fireEvent.click(within(screen.getByRole('radiogroup')).getAllByRole('radio')[correctIndex])
    fireEvent.click(screen.getByRole('button', { name: 'Check answer' }))

    expect(onProgress).toHaveBeenCalledOnce()
    expect(onProgress.mock.calls[0][0]).toMatchObject({
      completedLessons: module.unitIds,
      completedMissions: [module.id],
      starShards: 25,
    })
  })
})
