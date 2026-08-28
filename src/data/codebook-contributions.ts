import type { LanguageId } from '../types'

export interface CodebookEntry {
  term: string
  plain: string
  ship: string
  keywords: string[]
  examples?: Partial<Record<LanguageId, string>>
  unlockAfter?: 1 | 2 | 3 | 4 | 5
  unlockAfterMissionIds?: Partial<Record<LanguageId, string>>
}

export interface NewCodebookEntry {
  term: string
  plain: string
  ship: string
  keywords: string[]
}

interface CodebookContributionExample {
  language: LanguageId
  example: string
  unlockAfterMissionId: string
}

export type CodebookContribution =
  | ({ kind: 'extend'; targetTerm: string } & CodebookContributionExample)
  | ({ kind: 'add'; entry: NewCodebookEntry } & CodebookContributionExample)

export type CodebookMissionOwnership = (
  language: LanguageId,
  missionId: string,
) => boolean

function normalizedTerm(term: string): string {
  return term.trim().toLocaleLowerCase()
}

function cloneCodebookEntry(entry: CodebookEntry): CodebookEntry {
  return {
    ...entry,
    keywords: [...entry.keywords],
    examples: entry.examples ? { ...entry.examples } : undefined,
    unlockAfterMissionIds: entry.unlockAfterMissionIds
      ? { ...entry.unlockAfterMissionIds }
      : undefined,
  }
}

function assertContributionText(value: string, label: string): void {
  if (!value.trim()) throw new Error(`Codebook contribution ${label} must not be empty.`)
}

export function mergeCodebookContributions(
  entries: readonly CodebookEntry[],
  contributions: readonly CodebookContribution[],
  ownsMission: CodebookMissionOwnership,
): CodebookEntry[] {
  const merged = entries.map(cloneCodebookEntry)
  const entryIndexByTerm = new Map<string, number>()

  merged.forEach((entry, index) => {
    const key = normalizedTerm(entry.term)
    if (!key || entryIndexByTerm.has(key)) {
      throw new Error(`Duplicate Codebook term: ${entry.term}.`)
    }
    entryIndexByTerm.set(key, index)
  })

  for (const contribution of contributions) {
    assertContributionText(contribution.example, 'example')
    assertContributionText(contribution.unlockAfterMissionId, 'mission ID')
    if (!ownsMission(contribution.language, contribution.unlockAfterMissionId)) {
      throw new Error(
        `Mission ${contribution.unlockAfterMissionId} is not owned by ${contribution.language}.`,
      )
    }

    const targetTerm = contribution.kind === 'extend'
      ? contribution.targetTerm
      : contribution.entry.term
    const targetKey = normalizedTerm(targetTerm)
    const existingIndex = entryIndexByTerm.get(targetKey)

    if (contribution.kind === 'add') {
      if (!targetKey || existingIndex !== undefined) {
        throw new Error(`Duplicate Codebook term: ${targetTerm}.`)
      }
      assertContributionText(contribution.entry.plain, 'plain definition')
      assertContributionText(contribution.entry.ship, 'analogy')
      if (contribution.entry.keywords.length === 0) {
        throw new Error('Codebook contribution keywords must not be empty.')
      }
      const entry: CodebookEntry = {
        ...contribution.entry,
        keywords: [...contribution.entry.keywords],
        examples: { [contribution.language]: contribution.example },
        unlockAfterMissionIds: {
          [contribution.language]: contribution.unlockAfterMissionId,
        },
      }
      entryIndexByTerm.set(targetKey, merged.length)
      merged.push(entry)
      continue
    }

    if (existingIndex === undefined) {
      throw new Error(`Unknown Codebook target: ${contribution.targetTerm}.`)
    }
    const entry = merged[existingIndex]
    if (entry.examples?.[contribution.language] !== undefined) {
      throw new Error(
        `${entry.term} already has a ${contribution.language} Codebook example.`,
      )
    }
    if (entry.unlockAfterMissionIds?.[contribution.language] !== undefined) {
      throw new Error(
        `${entry.term} already has a ${contribution.language} Codebook unlock.`,
      )
    }
    entry.examples = {
      ...entry.examples,
      [contribution.language]: contribution.example,
    }
    entry.unlockAfterMissionIds = {
      ...entry.unlockAfterMissionIds,
      [contribution.language]: contribution.unlockAfterMissionId,
    }
  }

  return merged
}
