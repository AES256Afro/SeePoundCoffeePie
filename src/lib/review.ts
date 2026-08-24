export function buildReviewQueue(missedIds: string[], exerciseIds: string[]): string[] {
  const missed = new Set(missedIds)
  return exerciseIds.filter((id) => missed.has(id))
}

export function resetReviewAnswers(
  answers: Record<string, string>,
  reviewIds: string[],
): Record<string, string> {
  const reset = { ...answers }
  for (const id of reviewIds) delete reset[id]
  return reset
}
