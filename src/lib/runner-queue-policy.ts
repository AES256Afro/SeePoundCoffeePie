export function shouldAdvanceDrainAlarm(nextAlarm: number | null, drainAt: number): boolean {
  return nextAlarm === null || nextAlarm > drainAt
}

export function isRunnerRecordStale(
  status: 'queued' | 'running',
  createdAt: number,
  startedAt: number | null,
  now: number,
  staleAfterMs: number,
): boolean {
  const referenceTime = status === 'running' ? (startedAt ?? createdAt) : createdAt
  return referenceTime <= now - staleAfterMs
}
