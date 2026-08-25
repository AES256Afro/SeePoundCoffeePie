export const PROJECT_HISTORY_SCHEMA_VERSION = 1 as const
export const PROJECT_HISTORY_STORAGE_KEY = 'see-pound-coffee-pie-project-history'
export const PROJECT_HISTORY_LIMIT = 20

export interface ProjectCheckSummary {
  checkpointId: string
  checkedAt: string
  passed: boolean
  passedChecks: number
  totalChecks: number
}

type HistoryStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

interface StoredProjectHistory {
  version: typeof PROJECT_HISTORY_SCHEMA_VERSION
  projects: Record<string, ProjectCheckSummary[]>
}

function browserStorage(): HistoryStorage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage
  } catch {
    return null
  }
}

function validId(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= 200
}

function validSummary(value: unknown): value is ProjectCheckSummary {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const summary = value as Partial<ProjectCheckSummary>
  return validId(summary.checkpointId)
    && typeof summary.checkedAt === 'string'
    && Number.isFinite(Date.parse(summary.checkedAt))
    && typeof summary.passed === 'boolean'
    && Number.isSafeInteger(summary.passedChecks)
    && Number(summary.passedChecks) >= 0
    && Number.isSafeInteger(summary.totalChecks)
    && Number(summary.totalChecks) > 0
    && Number(summary.passedChecks) <= Number(summary.totalChecks)
}

function emptyRecord(): StoredProjectHistory {
  return {
    version: PROJECT_HISTORY_SCHEMA_VERSION,
    projects: Object.create(null) as Record<string, ProjectCheckSummary[]>,
  }
}

function parseRecord(raw: string | null): StoredProjectHistory {
  if (!raw) return emptyRecord()
  try {
    const value: unknown = JSON.parse(raw)
    if (!value || typeof value !== 'object' || Array.isArray(value)) return emptyRecord()
    const record = value as { version?: unknown; projects?: unknown }
    if (record.version !== PROJECT_HISTORY_SCHEMA_VERSION || !record.projects || typeof record.projects !== 'object' || Array.isArray(record.projects)) {
      return emptyRecord()
    }
    const projects = Object.create(null) as Record<string, ProjectCheckSummary[]>
    for (const [projectId, entries] of Object.entries(record.projects)) {
      if (!validId(projectId) || !Array.isArray(entries)) continue
      projects[projectId] = entries.filter(validSummary).slice(0, PROJECT_HISTORY_LIMIT).map((entry) => ({ ...entry }))
    }
    return { version: PROJECT_HISTORY_SCHEMA_VERSION, projects }
  } catch {
    return emptyRecord()
  }
}

function readRecord(storage: HistoryStorage): StoredProjectHistory {
  try {
    return parseRecord(storage.getItem(PROJECT_HISTORY_STORAGE_KEY))
  } catch {
    return emptyRecord()
  }
}

export function loadProjectHistory(
  projectId: string,
  storage: HistoryStorage | null = browserStorage(),
): ProjectCheckSummary[] {
  if (!storage || !validId(projectId)) return []
  return (readRecord(storage).projects[projectId] ?? []).map((entry) => ({ ...entry }))
}

export function recordProjectCheck(
  projectId: string,
  summary: ProjectCheckSummary,
  storage: HistoryStorage | null = browserStorage(),
): boolean {
  if (!storage || !validId(projectId) || !validSummary(summary)) return false
  const record = readRecord(storage)
  const existing = record.projects[projectId] ?? []
  record.projects[projectId] = [{ ...summary }, ...existing].slice(0, PROJECT_HISTORY_LIMIT)
  try {
    storage.setItem(PROJECT_HISTORY_STORAGE_KEY, JSON.stringify(record))
    return true
  } catch {
    return false
  }
}

export function clearProjectHistory(
  projectId: string,
  storage: HistoryStorage | null = browserStorage(),
): boolean {
  if (!storage || !validId(projectId)) return false
  const record = readRecord(storage)
  delete record.projects[projectId]
  try {
    if (Object.keys(record.projects).length === 0) storage.removeItem(PROJECT_HISTORY_STORAGE_KEY)
    else storage.setItem(PROJECT_HISTORY_STORAGE_KEY, JSON.stringify(record))
    return true
  } catch {
    return false
  }
}
