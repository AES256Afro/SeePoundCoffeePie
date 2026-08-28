import type {
  CodebookContribution,
  CodebookEntry,
  CodebookMissionOwnership,
} from './codebook-contributions'

export const controlledCodebookContributions: readonly CodebookContribution[] = Object.freeze([])

export function applyControlledCodebookContributions(
  entries: CodebookEntry[],
  _ownsMission: CodebookMissionOwnership,
): CodebookEntry[] {
  void _ownsMission
  return entries
}
