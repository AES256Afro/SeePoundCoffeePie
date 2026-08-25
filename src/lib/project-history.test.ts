import { describe, expect, it } from 'vitest'
import {
  clearProjectHistory,
  loadProjectHistory,
  PROJECT_HISTORY_LIMIT,
  PROJECT_HISTORY_STORAGE_KEY,
  recordProjectCheck,
} from './project-history'

type HistoryStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

function memoryStorage(): HistoryStorage & { values: Map<string, string> } {
  const values = new Map<string, string>()
  return {
    values,
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  }
}

describe('local project check history', () => {
  it('retains bounded summaries without source, console text, or runner messages', () => {
    const storage = memoryStorage()
    for (let index = 0; index < PROJECT_HISTORY_LIMIT + 4; index += 1) {
      expect(recordProjectCheck('first-interactive-program', {
        checkpointId: `checkpoint-${index}`,
        checkedAt: new Date(Date.UTC(2026, 7, 25, 12, index)).toISOString(),
        passed: index % 2 === 0,
        passedChecks: index % 2 === 0 ? 4 : 2,
        totalChecks: 4,
      }, storage)).toBe(true)
    }

    const history = loadProjectHistory('first-interactive-program', storage)
    expect(history).toHaveLength(PROJECT_HISTORY_LIMIT)
    expect(history[0].checkpointId).toBe(`checkpoint-${PROJECT_HISTORY_LIMIT + 3}`)
    const raw = storage.getItem(PROJECT_HISTORY_STORAGE_KEY) ?? ''
    expect(raw).not.toContain('source')
    expect(raw).not.toContain('stdout')
    expect(raw).not.toContain('message')
  })

  it('ignores malformed records, returns copies, and clears only the requested project', () => {
    const storage = memoryStorage()
    storage.setItem(PROJECT_HISTORY_STORAGE_KEY, '{broken')
    expect(loadProjectHistory('first-interactive-program', storage)).toEqual([])

    const summary = {
      checkpointId: 'ask-for-name',
      checkedAt: '2026-08-25T12:00:00.000Z',
      passed: true,
      passedChecks: 3,
      totalChecks: 3,
    }
    recordProjectCheck('first-interactive-program', summary, storage)
    recordProjectCheck('another-project', summary, storage)
    const loaded = loadProjectHistory('first-interactive-program', storage)
    loaded[0].checkpointId = 'changed-outside-store'
    expect(loadProjectHistory('first-interactive-program', storage)[0].checkpointId).toBe('ask-for-name')

    expect(clearProjectHistory('first-interactive-program', storage)).toBe(true)
    expect(loadProjectHistory('first-interactive-program', storage)).toEqual([])
    expect(loadProjectHistory('another-project', storage)).toHaveLength(1)
  })

  it('rejects unsafe summaries and unavailable storage without throwing', () => {
    const storage = memoryStorage()
    expect(recordProjectCheck('', {
      checkpointId: 'one',
      checkedAt: 'not-a-date',
      passed: true,
      passedChecks: 2,
      totalChecks: 1,
    }, storage)).toBe(false)
    expect(loadProjectHistory('first-interactive-program', null)).toEqual([])
    expect(clearProjectHistory('first-interactive-program', null)).toBe(false)
  })
})
