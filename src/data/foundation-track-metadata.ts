import type { LanguageId } from '../types'

export interface FoundationTrackMetadata {
  accent: string
  accentSoft: string
  capstoneDescription: string
  capstoneTitle: string
  description: string
  id: LanguageId
  missionTitles: readonly string[]
  shortName: string
}

const defineTrackMetadata = (
  id: LanguageId,
  shortName: string,
  description: string | null,
  accent: string,
  accentSoft: string,
  capstoneDescription: string,
  collectionTitle: 'Arrays' | 'Lists',
  routineTitle: 'Functions' | 'Methods',
): Readonly<FoundationTrackMetadata> => Object.freeze({
  id,
  shortName,
  description: description ?? `Write simple ${shortName} programs, show results, and store different kinds of values.`,
  accent,
  accentSoft,
  capstoneTitle: `Build a complete ${shortName} program`,
  capstoneDescription,
  missionTitles: Object.freeze([
    'Code and variables',
    'Conditions',
    collectionTitle,
    'Loops',
    routineTitle,
    `Build a complete ${shortName} program`,
  ]),
})

const consoleCapstoneDescription = 'Combine types, decisions, arrays, loops, and methods in one console program.'

export const foundationTrackMetadata: readonly FoundationTrackMetadata[] = Object.freeze([
  defineTrackMetadata(
    'python',
    'Python',
    'Start with short instructions and learn the basic ideas used in programs.',
    '#f2c14e',
    '#332c19',
    'Combine stored values, decisions, lists, loops, and functions in one program.',
    'Lists',
    'Functions',
  ),
  defineTrackMetadata(
    'cpp',
    'C++',
    'See how C++ code becomes a program, show results, and store different kinds of values.',
    '#79d6ff',
    '#15303a',
    'Combine types, decisions, arrays, loops, and functions in one compiled program.',
    'Arrays',
    'Functions',
  ),
  defineTrackMetadata(
    'csharp',
    'C#',
    null,
    '#cf9cff',
    '#2d1d39',
    consoleCapstoneDescription,
    'Arrays',
    'Methods',
  ),
  defineTrackMetadata(
    'java',
    'Java',
    null,
    '#ff936b',
    '#3a2118',
    consoleCapstoneDescription,
    'Arrays',
    'Methods',
  ),
])

const metadataByLanguage = new Map(
  foundationTrackMetadata.map((metadata) => [metadata.id, metadata]),
)

export function foundationTrackMetadataByLanguage(
  language: LanguageId,
): FoundationTrackMetadata | undefined {
  return metadataByLanguage.get(language)
}
