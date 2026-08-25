export const PROJECT_DRAFT_SCHEMA_VERSION = 1 as const
export const PROJECT_DRAFT_STORAGE_KEY = 'see-pound-coffee-pie-project-drafts'

type DraftStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

interface StoredDraft {
  source: string
}

interface StoredProjectDrafts {
  version: typeof PROJECT_DRAFT_SCHEMA_VERSION
  drafts: Record<string, StoredDraft>
}

function browserStorage(): DraftStorage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage
  } catch {
    return null
  }
}

function validId(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= 200
}

function storageId(projectId: string, checkpointId: string): string {
  return `${encodeURIComponent(projectId)}::${encodeURIComponent(checkpointId)}`
}

function emptyRecord(): StoredProjectDrafts {
  return { version: PROJECT_DRAFT_SCHEMA_VERSION, drafts: Object.create(null) as Record<string, StoredDraft> }
}

function parseRecord(raw: string | null): StoredProjectDrafts | null {
  if (raw === null) return emptyRecord()

  try {
    const value: unknown = JSON.parse(raw)
    if (!value || typeof value !== 'object' || Array.isArray(value)) return null

    const record = value as { version?: unknown; drafts?: unknown }
    if (record.version !== PROJECT_DRAFT_SCHEMA_VERSION) return null
    if (!record.drafts || typeof record.drafts !== 'object' || Array.isArray(record.drafts)) return null

    const drafts = Object.create(null) as Record<string, StoredDraft>
    for (const [key, draft] of Object.entries(record.drafts)) {
      if (!draft || typeof draft !== 'object' || Array.isArray(draft)) continue
      const source = (draft as { source?: unknown }).source
      if (typeof source === 'string') drafts[key] = { source }
    }

    return { version: PROJECT_DRAFT_SCHEMA_VERSION, drafts }
  } catch {
    return null
  }
}

function readRecord(storage: DraftStorage): StoredProjectDrafts | null {
  try {
    return parseRecord(storage.getItem(PROJECT_DRAFT_STORAGE_KEY))
  } catch {
    return null
  }
}

export function loadProjectDraft(
  projectId: string,
  checkpointId: string,
  storage: DraftStorage | null = browserStorage(),
): string | null {
  if (!storage || !validId(projectId) || !validId(checkpointId)) return null
  const record = readRecord(storage)
  return record?.drafts[storageId(projectId, checkpointId)]?.source ?? null
}

export function saveProjectDraft(
  projectId: string,
  checkpointId: string,
  source: string,
  storage: DraftStorage | null = browserStorage(),
): boolean {
  if (!storage || !validId(projectId) || !validId(checkpointId) || typeof source !== 'string') return false

  const record = readRecord(storage) ?? emptyRecord()
  record.drafts[storageId(projectId, checkpointId)] = { source }

  try {
    storage.setItem(PROJECT_DRAFT_STORAGE_KEY, JSON.stringify(record))
    return true
  } catch {
    return false
  }
}

export function resetProjectDraft(
  projectId: string,
  checkpointId: string,
  storage: DraftStorage | null = browserStorage(),
): boolean {
  if (!storage || !validId(projectId) || !validId(checkpointId)) return false

  const record = readRecord(storage)
  try {
    if (!record) {
      storage.removeItem(PROJECT_DRAFT_STORAGE_KEY)
      return true
    }

    delete record.drafts[storageId(projectId, checkpointId)]
    if (Object.keys(record.drafts).length === 0) {
      storage.removeItem(PROJECT_DRAFT_STORAGE_KEY)
    } else {
      storage.setItem(PROJECT_DRAFT_STORAGE_KEY, JSON.stringify(record))
    }
    return true
  } catch {
    return false
  }
}
