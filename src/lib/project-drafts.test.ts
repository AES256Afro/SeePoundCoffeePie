import { describe, expect, it } from 'vitest'
import {
  loadProjectDraft,
  PROJECT_DRAFT_SCHEMA_VERSION,
  PROJECT_DRAFT_STORAGE_KEY,
  resetProjectDraft,
  saveProjectDraft,
} from './project-drafts'

type DraftStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

function createMemoryStorage(): DraftStorage & { values: Map<string, string> } {
  const values = new Map<string, string>()
  return {
    values,
    getItem(key) {
      return values.get(key) ?? null
    },
    setItem(key, value) {
      values.set(key, value)
    },
    removeItem(key) {
      values.delete(key)
    },
  }
}

describe('browser-local project drafts', () => {
  it('keeps source drafts separate for every project checkpoint', () => {
    const storage = createMemoryStorage()

    expect(saveProjectDraft('first-interactive-program', 'plan', 'name = "Ada"', storage)).toBe(true)
    expect(saveProjectDraft('first-interactive-program', 'greeting', 'print("Hello")', storage)).toBe(true)

    expect(loadProjectDraft('first-interactive-program', 'plan', storage)).toBe('name = "Ada"')
    expect(loadProjectDraft('first-interactive-program', 'greeting', storage)).toBe('print("Hello")')
    expect(loadProjectDraft('first-interactive-program', 'missing', storage)).toBeNull()
  })

  it('resets one checkpoint without deleting another and removes an empty record', () => {
    const storage = createMemoryStorage()
    saveProjectDraft('first-interactive-program', 'plan', 'plan source', storage)
    saveProjectDraft('first-interactive-program', 'greeting', 'greeting source', storage)

    expect(resetProjectDraft('first-interactive-program', 'plan', storage)).toBe(true)
    expect(loadProjectDraft('first-interactive-program', 'plan', storage)).toBeNull()
    expect(loadProjectDraft('first-interactive-program', 'greeting', storage)).toBe('greeting source')

    expect(resetProjectDraft('first-interactive-program', 'greeting', storage)).toBe(true)
    expect(storage.getItem(PROJECT_DRAFT_STORAGE_KEY)).toBeNull()
  })

  it('tolerates malformed and unsupported records and repairs them on save', () => {
    const storage = createMemoryStorage()
    storage.setItem(PROJECT_DRAFT_STORAGE_KEY, '{not json')

    expect(loadProjectDraft('first-interactive-program', 'plan', storage)).toBeNull()
    expect(saveProjectDraft('first-interactive-program', 'plan', 'safe source', storage)).toBe(true)
    expect(loadProjectDraft('first-interactive-program', 'plan', storage)).toBe('safe source')

    storage.setItem(PROJECT_DRAFT_STORAGE_KEY, JSON.stringify({ version: 99, drafts: {} }))
    expect(loadProjectDraft('first-interactive-program', 'plan', storage)).toBeNull()
  })

  it('stores only the schema version and source drafts, never output or account data', () => {
    const storage = createMemoryStorage()
    const progressKey = 'see-pound-coffee-pie-progress'
    storage.setItem(progressKey, '{"callsign":"Private learner"}')
    storage.setItem(PROJECT_DRAFT_STORAGE_KEY, JSON.stringify({
      version: PROJECT_DRAFT_SCHEMA_VERSION,
      drafts: {
        legacy: {
          source: 'print("kept")',
          testOutput: 'must be dropped',
          account: { login: 'must be dropped' },
        },
      },
    }))

    saveProjectDraft('first-interactive-program', 'plan', 'print("draft")', storage)

    const stored = JSON.parse(storage.getItem(PROJECT_DRAFT_STORAGE_KEY) ?? '{}')
    expect(Object.keys(stored)).toEqual(['version', 'drafts'])
    expect(stored.version).toBe(PROJECT_DRAFT_SCHEMA_VERSION)
    expect(Object.values(stored.drafts).every((draft) => (
      Object.keys(draft as object).length === 1 && typeof (draft as { source?: unknown }).source === 'string'
    ))).toBe(true)
    expect(JSON.stringify(stored)).not.toContain('testOutput')
    expect(JSON.stringify(stored)).not.toContain('account')
    expect(storage.getItem(progressKey)).toBe('{"callsign":"Private learner"}')
  })

  it('fails safely when storage is unavailable or throws', () => {
    const throwingStorage: DraftStorage = {
      getItem() {
        throw new Error('blocked')
      },
      setItem() {
        throw new Error('blocked')
      },
      removeItem() {
        throw new Error('blocked')
      },
    }

    expect(loadProjectDraft('first-interactive-program', 'plan', throwingStorage)).toBeNull()
    expect(saveProjectDraft('first-interactive-program', 'plan', 'source', throwingStorage)).toBe(false)
    expect(resetProjectDraft('first-interactive-program', 'plan', throwingStorage)).toBe(false)
    expect(loadProjectDraft('', 'plan', null)).toBeNull()
  })
})
