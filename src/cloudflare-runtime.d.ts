interface DurableObjectStub<T = unknown> {
  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>
  readonly __durableObjectClass?: T
}

interface DurableObjectId {
  readonly __durableObjectIdBrand: unique symbol
}

interface DurableObjectNamespace<T = unknown> {
  idFromName(name: string): DurableObjectId
  get(id: DurableObjectId): DurableObjectStub<T>
  getByName(name: string): DurableObjectStub<T>
}

interface DurableObjectListOptions {
  prefix?: string
}

interface DurableObjectStorage {
  get<T = unknown>(key: string): Promise<T | undefined>
  put<T>(key: string, value: T): Promise<void>
  put<T>(entries: Record<string, T>): Promise<void>
  delete(key: string | string[]): Promise<boolean | number>
  list<T = unknown>(options?: DurableObjectListOptions): Promise<Map<string, T>>
  getAlarm(): Promise<number | null>
  setAlarm(scheduledTime: number | Date): Promise<void>
}

interface DurableObjectState {
  storage: DurableObjectStorage
  waitUntil(promise: Promise<unknown>): void
}

interface KVNamespace {
  get(key: string): Promise<string | null>
}

interface D1ResultMeta {
  changes: number
}

interface D1Result {
  success: boolean
  meta: D1ResultMeta
}

interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement
  first<T = Record<string, unknown>>(): Promise<T | null>
  run(): Promise<D1Result>
}

interface D1Database {
  prepare(query: string): D1PreparedStatement
}
