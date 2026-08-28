import {
  durableCurriculumV1,
  type DurableFoundationLessonMetadata,
} from './durable-curriculum-v1'
import type { LanguageId } from '../types'

export interface FoundationCurriculumEntry {
  language: LanguageId
  lessonIds: readonly string[]
  lessons: readonly DurableFoundationLessonMetadata[]
  missionId: string
}

const foundationLanguages: ReadonlySet<string> = new Set(['python', 'cpp', 'csharp', 'java'])

export const foundationCurriculumEntries: readonly FoundationCurriculumEntry[] = Object.freeze(
  Object.entries(durableCurriculumV1).map(([owner, lessons]) => {
    const [language, missionId] = owner.split('/')
    if (!language || !missionId || !foundationLanguages.has(language)) {
      throw new Error(`Invalid durable foundation owner: ${owner}.`)
    }
    return Object.freeze({
      language: language as LanguageId,
      lessonIds: Object.freeze(lessons.map(([id]) => id)),
      lessons,
      missionId,
    })
  }),
)

export const foundationLessonMetadata: readonly DurableFoundationLessonMetadata[] = Object.freeze(
  foundationCurriculumEntries.flatMap((entry) => entry.lessons),
)

export const foundationMissionIds: ReadonlySet<string> = new Set(
  foundationCurriculumEntries.map((entry) => entry.missionId),
)

export const foundationLessonIds: ReadonlySet<string> = new Set(
  foundationLessonMetadata.map(([id]) => id),
)

export const foundationLessonMetadataById: ReadonlyMap<
  string,
  DurableFoundationLessonMetadata
> = new Map(foundationLessonMetadata.map((lesson) => [lesson[0], lesson]))

export const foundationMissionLessonIds: ReadonlyMap<string, readonly string[]> = new Map(
  foundationCurriculumEntries.map((entry) => [entry.missionId, entry.lessonIds]),
)

if (
  foundationMissionIds.size !== foundationCurriculumEntries.length
  || foundationLessonMetadataById.size !== foundationLessonMetadata.length
) {
  throw new Error('Durable foundation mission and lesson IDs must be globally unique.')
}

export function foundationEntriesForLanguage(
  language: LanguageId,
): readonly FoundationCurriculumEntry[] {
  return foundationCurriculumEntries.filter((entry) => entry.language === language)
}
