import { describe, expect, it } from 'vitest'
import {
  academyPath,
  codebookPath,
  missionPath,
  parseAppRoute,
  practiceMissionPath,
  practicePath,
} from './routes'

describe('bookmarkable application routes', () => {
  it('builds stable clean URLs for every learner area', () => {
    expect(academyPath('cpp')).toBe('/academy/cpp')
    expect(practicePath('csharp')).toBe('/practice/csharp')
    expect(codebookPath('java')).toBe('/codebook/java')
    expect(missionPath('python', 'py-first-spark')).toBe('/academy/python/missions/py-first-spark')
    expect(practiceMissionPath('java', 'java-routing-orders', ['java-booleans'])).toBe(
      '/practice/java/missions/java-routing-orders?concepts=java-booleans',
    )
  })

  it('keeps the public home page separate from cadet intake', () => {
    expect(parseAppRoute('/').page).toBe('home')
    expect(parseAppRoute('/start').page).toBe('start')
  })

  it('parses academy pages and focused practice lessons', () => {
    expect(parseAppRoute('/academy/cpp')).toMatchObject({ page: 'academy', language: 'cpp' })
    expect(parseAppRoute('/practice/java/missions/java-routing-orders', '?concepts=java-booleans,java-if')).toEqual({
      page: 'lesson',
      language: 'java',
      missionId: 'java-routing-orders',
      practice: true,
      conceptIds: ['java-booleans', 'java-if'],
    })
  })

  it('rejects misspelled languages and unknown paths', () => {
    expect(parseAppRoute('/academy/ruby').page).toBe('not-found')
    expect(parseAppRoute('/anything-else').page).toBe('not-found')
  })
})
