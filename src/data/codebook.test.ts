import { describe, expect, it } from 'vitest'
import { tracks } from './curriculum'
import { codebookEntries, codebookExampleState, codebookMatches } from './codebook'

describe('progression-aware codebook', () => {
  const java = tracks.find((track) => track.id === 'java') ?? tracks[0]

  it('searches plain language, aliases, and active-language code', () => {
    const condition = codebookEntries.find((entry) => entry.term === 'Condition')
    const consoleEntry = codebookEntries.find((entry) => entry.term === 'Console')
    if (!condition || !consoleEntry) throw new Error('Required codebook entries are missing')

    expect(codebookMatches(condition, 'sensor question', 'java')).toBe(true)
    expect(codebookMatches(condition, 'podCount < 6', 'java')).toBe(true)
    expect(codebookMatches(consoleEntry, 'terminal', 'java')).toBe(true)
    expect(codebookMatches(consoleEntry, 'shieldPower', 'java')).toBe(false)
  })

  it('unlocks examples only after the lesson that introduces them', () => {
    const variable = codebookEntries.find((entry) => entry.term === 'Variable')
    const condition = codebookEntries.find((entry) => entry.term === 'Condition')
    const index = codebookEntries.find((entry) => entry.term === 'Index')
    const loop = codebookEntries.find((entry) => entry.term === 'Loop')
    if (!variable || !condition || !index || !loop) throw new Error('Required codebook entries are missing')

    expect(codebookExampleState(variable, java, [])).toBe('locked')
    expect(codebookExampleState(variable, java, ['java-coffee-protocol'])).toBe('unlocked')
    expect(codebookExampleState(condition, java, ['java-coffee-protocol'])).toBe('locked')
    expect(codebookExampleState(condition, java, ['java-coffee-protocol', 'java-routing-orders'])).toBe('unlocked')
    expect(codebookExampleState(index, java, ['java-coffee-protocol', 'java-routing-orders'])).toBe('locked')
    expect(codebookExampleState(index, java, ['java-coffee-protocol', 'java-routing-orders', 'java-crew-array'])).toBe('unlocked')
    expect(codebookExampleState(loop, java, ['java-coffee-protocol', 'java-routing-orders', 'java-crew-array'])).toBe('locked')
    expect(codebookExampleState(loop, java, ['java-coffee-protocol', 'java-routing-orders', 'java-crew-array', 'java-repeat-brew'])).toBe('unlocked')
  })

  it('does not pretend every term has an example in every language', () => {
    const classEntry = codebookEntries.find((entry) => entry.term === 'Class')
    if (!classEntry) throw new Error('Class entry is missing')

    expect(codebookExampleState(classEntry, java, ['java-coffee-protocol'])).toBe('unlocked')
    expect(codebookExampleState(classEntry, tracks[0], ['py-first-spark'])).toBe('unavailable')
  })

  it('keeps terms and keywords unique enough for stable search results', () => {
    const normalizedTerms = codebookEntries.map((entry) => entry.term.toLocaleLowerCase())
    expect(new Set(normalizedTerms).size).toBe(normalizedTerms.length)
    expect(codebookEntries.length).toBeGreaterThanOrEqual(30)
    for (const entry of codebookEntries) expect(entry.keywords.length).toBeGreaterThanOrEqual(3)
  })
})
