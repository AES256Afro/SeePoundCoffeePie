import type { LanguageId } from '../types'

export type DurableFoundationLessonMetadata = readonly [
  id: string,
  conceptId: string,
  xp: number,
]

const introXp = [8, 12, 14, 14, 22] as const
const lessonXp = [8, 10, 14, 16, 22] as const
const capstoneXp = [10, 12, 16, 18, 29] as const

const introConceptTail = ['variables', 'variables', 'output-and-variables'] as const
const introConceptPrefixes: Readonly<Record<LanguageId, readonly string[]>> = {
  python: ['console', 'print'],
  cpp: ['compiler', 'output'],
  csharp: ['runtime', 'output'],
  java: ['runtime', 'output'],
}
const lessonConceptPatterns = {
  decisions: ['output-and-variables', 'booleans', 'conditions', 'comparisons', 'conditions'],
  collections: ['conditions', 'collections', 'indexes', 'indexes', 'collections-and-indexes'],
  loops: ['collections-and-indexes', 'loops', 'iteration', 'iteration', 'loops-and-collections'],
  functions: ['loops-and-collections', 'functions', 'parameters-and-calls', 'function-order', 'functions-and-loops'],
  capstone: ['conditions', 'program-planning', 'capstone-assembly', 'capstone-repair', 'capstone'],
} as const

function durableMission(
  language: LanguageId,
  lessonIds: readonly string[],
  conceptSuffixes: readonly string[],
  xpValues: readonly number[],
): readonly DurableFoundationLessonMetadata[] {
  if (lessonIds.length !== conceptSuffixes.length || lessonIds.length !== xpValues.length) {
    throw new Error(`Durable foundation metadata does not match: ${language}.`)
  }
  return Object.freeze(lessonIds.map((id, index) => Object.freeze([
    id,
    `${language}-${conceptSuffixes[index]}`,
    xpValues[index],
  ] as DurableFoundationLessonMetadata)))
}

function introConcepts(language: LanguageId): readonly string[] {
  return [...introConceptPrefixes[language], ...introConceptTail]
}

// Persisted mission and lesson identifiers, their concepts, and their awards
// are one learner-record API. Change this manifest only through an explicit
// versioned data migration.
export const durableCurriculumV1 = Object.freeze({
  'python/py-first-spark': durableMission('python', ['py-console', 'py-print', 'py-string', 'py-number', 'py-launch'], introConcepts('python'), introXp),
  'python/py-signal-protocol': durableMission('python', ['py2-retrieve-output', 'py2-boolean', 'py2-order-route', 'py2-fix-comparison', 'py2-signal-decision'], lessonConceptPatterns.decisions, lessonXp),
  'python/py-cargo-logic': durableMission('python', ['py3-retrieve-route', 'py3-list-purpose', 'py3-first-index', 'py3-fix-index', 'py3-cargo-report'], lessonConceptPatterns.collections, lessonXp),
  'python/py-looping-orbit': durableMission('python', ['py4-retrieve-index', 'py4-loop-purpose', 'py4-predict-loop', 'py4-order-loop', 'py4-scan-manifest'], lessonConceptPatterns.loops, lessonXp),
  'python/py-function-foundry': durableMission('python', ['py5-retrieve-loop', 'py5-function-purpose', 'py5-predict-call', 'py5-order-function', 'py5-report-each'], lessonConceptPatterns.functions, lessonXp),
  'python/py-void-wyrm': durableMission('python', ['py6-trace-threat', 'py6-plan-system', 'py6-order-system', 'py6-repair-filter', 'py6-void-wyrm'], lessonConceptPatterns.capstone, capstoneXp),
  'cpp/cpp-reactor': durableMission('cpp', ['cpp-compiler', 'cpp-output', 'cpp-string', 'cpp-number', 'cpp-reactor-report'], introConcepts('cpp'), introXp),
  'cpp/cpp-hull-logic': durableMission('cpp', ['cpp2-retrieve-output', 'cpp2-boolean', 'cpp2-order-repair', 'cpp2-fix-comparison', 'cpp2-hull-decision'], lessonConceptPatterns.decisions, lessonXp),
  'cpp/cpp-cargo-array': durableMission('cpp', ['cpp3-retrieve-route', 'cpp3-array-purpose', 'cpp3-first-index', 'cpp3-fix-index', 'cpp3-parts-report'], lessonConceptPatterns.collections, lessonXp),
  'cpp/cpp-engine-loop': durableMission('cpp', ['cpp4-retrieve-index', 'cpp4-loop-purpose', 'cpp4-predict-loop', 'cpp4-order-loop', 'cpp4-inspect-parts'], lessonConceptPatterns.loops, lessonXp),
  'cpp/cpp-command-function': durableMission('cpp', ['cpp5-retrieve-loop', 'cpp5-function-purpose', 'cpp5-predict-call', 'cpp5-order-function', 'cpp5-report-each'], lessonConceptPatterns.functions, lessonXp),
  'cpp/cpp-titan-forge': durableMission('cpp', ['cpp6-trace-damage', 'cpp6-plan-system', 'cpp6-order-system', 'cpp6-repair-filter', 'cpp6-titan-forge'], lessonConceptPatterns.capstone, capstoneXp),
  'csharp/cs-shield': durableMission('csharp', ['cs-dotnet', 'cs-output', 'cs-string', 'cs-number', 'cs-shield-report'], introConcepts('csharp'), introXp),
  'csharp/cs-command-logic': durableMission('csharp', ['cs2-retrieve-output', 'cs2-boolean', 'cs2-order-command', 'cs2-fix-comparison', 'cs2-shield-decision'], lessonConceptPatterns.decisions, lessonXp),
  'csharp/cs-crew-roster': durableMission('csharp', ['cs3-retrieve-route', 'cs3-array-purpose', 'cs3-first-index', 'cs3-fix-index', 'cs3-roster-report'], lessonConceptPatterns.collections, lessonXp),
  'csharp/cs-patrol-loop': durableMission('csharp', ['cs4-retrieve-index', 'cs4-loop-purpose', 'cs4-predict-loop', 'cs4-order-loop', 'cs4-call-roster'], lessonConceptPatterns.loops, lessonXp),
  'csharp/cs-command-method': durableMission('csharp', ['cs5-retrieve-loop', 'cs5-method-purpose', 'cs5-predict-call', 'cs5-order-method', 'cs5-report-each'], lessonConceptPatterns.functions, lessonXp),
  'csharp/cs-captains-trial': durableMission('csharp', ['cs6-trace-scout', 'cs6-plan-system', 'cs6-order-system', 'cs6-repair-scout', 'cs6-captains-trial'], lessonConceptPatterns.capstone, capstoneXp),
  'java/java-coffee-protocol': durableMission('java', ['java-jvm', 'java-output', 'java-string', 'java-number', 'java-galley-report'], introConcepts('java'), introXp),
  'java/java-routing-orders': durableMission('java', ['java2-retrieve-output', 'java2-boolean', 'java2-order-route', 'java2-fix-comparison', 'java2-pod-decision'], lessonConceptPatterns.decisions, lessonXp),
  'java/java-crew-array': durableMission('java', ['java3-retrieve-route', 'java3-array-purpose', 'java3-first-index', 'java3-fix-index', 'java3-roster-report'], lessonConceptPatterns.collections, lessonXp),
  'java/java-repeat-brew': durableMission('java', ['java4-retrieve-index', 'java4-loop-purpose', 'java4-predict-loop', 'java4-order-loop', 'java4-check-roster'], lessonConceptPatterns.loops, lessonXp),
  'java/java-droid-routine': durableMission('java', ['java5-retrieve-loop', 'java5-method-purpose', 'java5-predict-call', 'java5-order-method', 'java5-report-each'], lessonConceptPatterns.functions, lessonXp),
  'java/java-nebula-trial': durableMission('java', ['java6-trace-power', 'java6-plan-system', 'java6-order-system', 'java6-repair-power', 'java6-nebula-trial'], lessonConceptPatterns.capstone, capstoneXp),
})
