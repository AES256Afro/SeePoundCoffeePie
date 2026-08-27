import { describe, expect, it } from 'vitest'
import { tracks } from './curriculum'
import { codebookEntries, codebookExampleState, codebookMatches } from './codebook'

describe('progression-aware codebook', () => {
  const python = tracks.find((track) => track.id === 'python') ?? tracks[0]
  const java = tracks.find((track) => track.id === 'java') ?? tracks[0]

  const dataToolsMissionUnlocks = [
    ['py-data-return-values', ['Return value']],
    ['py-data-text-cleanup', ['String method', 'Text normalization']],
    ['py-data-list-tools', ['List mutation', 'Length', 'Membership test']],
    ['py-data-dictionaries', ['Dictionary', 'Key and value', 'Default value']],
    ['py-data-summaries', ['Accumulator', 'Filter']],
  ] as const

  it('searches plain language, keywords, and active-language code', () => {
    const condition = codebookEntries.find((entry) => entry.term === 'Condition')
    const consoleEntry = codebookEntries.find((entry) => entry.term === 'Console')
    if (!condition || !consoleEntry) throw new Error('Required codebook entries are missing')

    expect(codebookMatches(condition, 'make a decision', 'java')).toBe(true)
    expect(codebookMatches(condition, 'podCount < 6', 'java')).toBe(true)
    expect(codebookMatches(consoleEntry, 'terminal', 'java')).toBe(true)
    expect(codebookMatches(consoleEntry, 'shieldPower', 'java')).toBe(false)
  })

  it('preserves numeric foundation unlocks across all five module stages', () => {
    const variable = codebookEntries.find((entry) => entry.term === 'Variable')
    const condition = codebookEntries.find((entry) => entry.term === 'Condition')
    const index = codebookEntries.find((entry) => entry.term === 'Index')
    const loop = codebookEntries.find((entry) => entry.term === 'Loop')
    const parameter = codebookEntries.find((entry) => entry.term === 'Parameter')
    if (!variable || !condition || !index || !loop || !parameter) throw new Error('Required codebook entries are missing')

    expect(codebookExampleState(variable, java, [])).toBe('locked')
    expect(codebookExampleState(variable, java, ['java-coffee-protocol'])).toBe('unlocked')
    expect(codebookExampleState(condition, java, ['java-coffee-protocol'])).toBe('locked')
    expect(codebookExampleState(condition, java, ['java-coffee-protocol', 'java-routing-orders'])).toBe('unlocked')
    expect(codebookExampleState(index, java, ['java-coffee-protocol', 'java-routing-orders'])).toBe('locked')
    expect(codebookExampleState(index, java, ['java-coffee-protocol', 'java-routing-orders', 'java-crew-array'])).toBe('unlocked')
    expect(codebookExampleState(loop, java, ['java-coffee-protocol', 'java-routing-orders', 'java-crew-array'])).toBe('locked')
    expect(codebookExampleState(loop, java, ['java-coffee-protocol', 'java-routing-orders', 'java-crew-array', 'java-repeat-brew'])).toBe('unlocked')
    expect(codebookExampleState(parameter, java, ['java-coffee-protocol', 'java-routing-orders', 'java-crew-array', 'java-repeat-brew'])).toBe('locked')
    expect(codebookExampleState(parameter, java, ['java-coffee-protocol', 'java-routing-orders', 'java-crew-array', 'java-repeat-brew', 'java-droid-routine'])).toBe('unlocked')
  })

  it.each(dataToolsMissionUnlocks)(
    'unlocks the Data Tools concepts owned by %s only after that mission',
    (missionId, terms) => {
      for (const term of terms) {
        const entry = codebookEntries.find((candidate) => candidate.term === term)
        if (!entry) throw new Error(`${term} is missing`)

        expect(entry.unlockAfter).toBeUndefined()
        expect(entry.unlockAfterMissionId).toBe(missionId)
        expect(codebookExampleState(entry, python, [])).toBe('locked')
        expect(codebookExampleState(entry, python, ['py-first-spark'])).toBe('locked')
        expect(codebookExampleState(entry, python, [missionId])).toBe('unlocked')
      }
    },
  )

  it('adds all eleven beginner-friendly Data Tools concepts with Python examples', () => {
    const expectedTerms = dataToolsMissionUnlocks.flatMap(([, terms]) => terms)
    expect(expectedTerms).toHaveLength(11)

    for (const term of expectedTerms) {
      const entry = codebookEntries.find((candidate) => candidate.term === term)
      expect(entry, `${term} must be available in the Codebook`).toBeTruthy()
      expect(entry?.examples?.python, `${term} needs a Python example`).toBeTruthy()
      expect(entry?.plain.length, `${term} needs a beginner-friendly definition`).toBeGreaterThan(80)
      expect(entry?.ship.length, `${term} needs a concrete analogy`).toBeGreaterThan(70)
    }
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
    expect(codebookEntries.length).toBeGreaterThanOrEqual(50)
    for (const entry of codebookEntries) expect(entry.keywords.length).toBeGreaterThanOrEqual(3)
  })

  it('defines the words a true beginner encounters before learning language syntax', () => {
    const requiredTerms = [
      'Instruction or statement',
      'Input',
      'Output',
      'Value',
      'Literal',
      'Data type',
      'Identifier',
      'Assignment',
      'Expression',
      'Error',
      'Bug',
      'Debugging',
      'Case sensitivity',
      'Block or body',
      'Indentation',
      'Built-in or standard library tool',
    ]

    for (const term of requiredTerms) {
      const entry = codebookEntries.find((candidate) => candidate.term === term)
      expect(entry, `${term} must be available in the Codebook`).toBeTruthy()
      expect(entry?.plain.length).toBeGreaterThan(60)
      expect(entry?.ship.length).toBeGreaterThan(50)
    }

    const debugging = codebookEntries.find((entry) => entry.term === 'Debugging')
    const error = codebookEntries.find((entry) => entry.term === 'Error')
    expect(debugging && codebookMatches(debugging, 'troubleshoot', 'python')).toBe(true)
    expect(error?.plain).toContain('not a judgment')
  })

  it('contains no em dash in learner-facing Codebook data', () => {
    expect(JSON.stringify(codebookEntries)).not.toContain(String.fromCodePoint(0x2014))
  })
})
