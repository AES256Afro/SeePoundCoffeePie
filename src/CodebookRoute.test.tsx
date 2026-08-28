// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { CodebookRoute } from './CodebookRoute'
import { initialProgress } from './lib/progress'

describe('Codebook route unlock labels', () => {
  afterEach(cleanup)

  it('keeps the Practical Python example tied to its exact module title', () => {
    render(<CodebookRoute progress={initialProgress('python')} />)

    fireEvent.change(screen.getByRole('searchbox', {
      name: 'Search the code reference',
    }), {
      target: { value: 'return value' },
    })

    const lockHeading = screen.getByText('Example not available yet')
    expect(lockHeading.closest('.glossary-example-lock')?.textContent).toContain(
      'Complete Functions that return answers to see it.',
    )
  })
})
