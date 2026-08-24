import { describe, expect, it } from 'vitest'
import { buildReviewQueue, resetReviewAnswers } from './review'

describe('lesson review helpers', () => {
  it('returns each missed exercise once in the original teaching order', () => {
    expect(buildReviewQueue(
      ['variables', 'console', 'variables', 'unknown'],
      ['console', 'output', 'variables', 'report'],
    )).toEqual(['console', 'variables'])
  })

  it('clears only review answers so the learner retrieves them again', () => {
    const original = {
      console: 'a',
      output: 'print("Signal online")',
      variables: 'ship_name = "Wayfarer"',
    }

    expect(resetReviewAnswers(original, ['console', 'variables'])).toEqual({
      output: 'print("Signal online")',
    })
    expect(original).toHaveProperty('console', 'a')
  })
})
