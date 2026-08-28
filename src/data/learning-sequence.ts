import type { CourseId, LanguageId } from '../types'
import { controlledContinuingCourseRegistrations } from './controlled-continuing-course-publication'

export interface PublishedCourseLearningUnit {
  courseId: CourseId
  kind: 'course'
  stage: 'foundation' | 'continuing'
}

export interface PublishedProjectLearningUnit {
  kind: 'project'
  prerequisiteCourseId: CourseId
  projectId: string
}

export type PublishedLearningUnit = PublishedCourseLearningUnit | PublishedProjectLearningUnit

export interface PublishedLanguageLearningSequence {
  language: LanguageId
  units: readonly PublishedLearningUnit[]
}

const supportedLanguages: readonly LanguageId[] = ['python', 'cpp', 'csharp', 'java']
const noCourseIds: readonly CourseId[] = Object.freeze([])
const noProjectUnits: readonly PublishedProjectLearningUnit[] = Object.freeze([])
const noUnits: readonly PublishedLearningUnit[] = Object.freeze([])

function unitKey(language: LanguageId, unit: PublishedLearningUnit): string {
  return unit.kind === 'course'
    ? `course:${unit.courseId}`
    : `project:${language}:${unit.projectId}`
}

export function definePublishedLearningSequences(
  sequences: readonly PublishedLanguageLearningSequence[],
): readonly PublishedLanguageLearningSequence[] {
  const languages = new Set<LanguageId>()
  const globalUnits = new Set<string>()

  const validated = sequences.map((sequence) => {
    if (languages.has(sequence.language)) {
      throw new Error(`Duplicate learning sequence for ${sequence.language}.`)
    }
    languages.add(sequence.language)

    if (sequence.units.length === 0) {
      throw new Error(`Learning sequence for ${sequence.language} is empty.`)
    }
    const foundations = sequence.units.filter((unit) => (
      unit.kind === 'course' && unit.stage === 'foundation'
    ))
    if (foundations.length !== 1 || sequence.units[0] !== foundations[0]) {
      throw new Error(`Learning sequence for ${sequence.language} must start with one foundation course.`)
    }

    const earlierCourses = new Set<CourseId>()
    const frozenUnits = sequence.units.map((unit) => {
      const key = unitKey(sequence.language, unit)
      if (globalUnits.has(key)) throw new Error(`Duplicate published learning unit: ${key}.`)
      globalUnits.add(key)

      if (unit.kind === 'course') {
        earlierCourses.add(unit.courseId)
      } else if (!earlierCourses.has(unit.prerequisiteCourseId)) {
        throw new Error(
          `Project ${sequence.language}/${unit.projectId} must follow its prerequisite course.`,
        )
      }
      return Object.freeze({ ...unit })
    })

    return Object.freeze({
      language: sequence.language,
      units: Object.freeze(frozenUnits),
    })
  })

  return Object.freeze(validated)
}

const foundationAndProjectLearningSequences: readonly PublishedLanguageLearningSequence[] = [
  {
    language: 'python',
    units: [
      { kind: 'course', stage: 'foundation', courseId: 'python-foundations' },
      {
        kind: 'project',
        projectId: 'first-interactive-program',
        prerequisiteCourseId: 'python-foundations',
      },
    ],
  },
  {
    language: 'cpp',
    units: [
      { kind: 'course', stage: 'foundation', courseId: 'cpp-foundations' },
      {
        kind: 'project',
        projectId: 'first-compiled-program',
        prerequisiteCourseId: 'cpp-foundations',
      },
    ],
  },
  {
    language: 'csharp',
    units: [
      { kind: 'course', stage: 'foundation', courseId: 'csharp-foundations' },
      {
        kind: 'project',
        projectId: 'workshop-check-in',
        prerequisiteCourseId: 'csharp-foundations',
      },
    ],
  },
  {
    language: 'java',
    units: [
      { kind: 'course', stage: 'foundation', courseId: 'java-foundations' },
      {
        kind: 'project',
        projectId: 'picnic-planner',
        prerequisiteCourseId: 'java-foundations',
      },
    ],
  },
]

function learningSequencesWithContinuingCourses(
  sequences: readonly PublishedLanguageLearningSequence[],
): readonly PublishedLanguageLearningSequence[] {
  const unitsByLanguage = new Map<LanguageId, PublishedLearningUnit[]>(
    sequences.map((sequence) => [sequence.language, [...sequence.units]]),
  )

  for (const registration of controlledContinuingCourseRegistrations) {
    if (
      registration.definition.language !== registration.language
      || registration.sequenceAfter.language !== registration.language
      || registration.manifest.courseId !== registration.definition.id
    ) {
      throw new Error(`Invalid continuing-course registration: ${registration.definition.id}.`)
    }
    const units = unitsByLanguage.get(registration.language)
    if (!units) throw new Error(`Missing learning sequence: ${registration.language}.`)
    const anchorIndex = units.findIndex((unit) => (
      unit.kind === 'project'
      && unit.projectId === registration.sequenceAfter.projectId
    ))
    if (anchorIndex < 0) {
      throw new Error(`Missing continuing-course anchor: ${registration.definition.id}.`)
    }
    const nextContinuingIndex = units.findIndex((unit, index) => (
      index > anchorIndex
      && unit.kind === 'course'
      && unit.stage === 'continuing'
    ))
    const insertAt = nextContinuingIndex < 0 ? anchorIndex + 1 : nextContinuingIndex + 1
    units.splice(insertAt, 0, {
      kind: 'course',
      stage: 'continuing',
      courseId: registration.definition.id,
    })
  }

  return sequences.map((sequence) => ({
    language: sequence.language,
    units: unitsByLanguage.get(sequence.language) ?? [],
  }))
}

export const publishedLearningSequences = definePublishedLearningSequences(
  learningSequencesWithContinuingCourses(foundationAndProjectLearningSequences),
)

const sequenceByLanguage = new Map(
  publishedLearningSequences.map((sequence) => [sequence.language, sequence]),
)

if (supportedLanguages.some((language) => !sequenceByLanguage.has(language))) {
  throw new Error('Every public language needs an explicit learning sequence.')
}

export function publishedLearningUnitsForLanguage(
  language: LanguageId,
): readonly PublishedLearningUnit[] {
  return sequenceByLanguage.get(language)?.units ?? noUnits
}

export function publishedFoundationCourseId(language: LanguageId): CourseId | undefined {
  const unit = publishedLearningUnitsForLanguage(language).find((candidate) => (
    candidate.kind === 'course' && candidate.stage === 'foundation'
  ))
  return unit?.kind === 'course' ? unit.courseId : undefined
}

export function publishedContinuingCourseIdsForLanguage(
  language: LanguageId,
): readonly CourseId[] {
  const sequence = sequenceByLanguage.get(language)
  if (!sequence) return noCourseIds
  return sequence.units.flatMap((unit) => (
    unit.kind === 'course' && unit.stage === 'continuing' ? [unit.courseId] : []
  ))
}

export function publishedProjectUnitsForLanguage(
  language: LanguageId,
): readonly PublishedProjectLearningUnit[] {
  const sequence = sequenceByLanguage.get(language)
  if (!sequence) return noProjectUnits
  return sequence.units.filter((unit): unit is PublishedProjectLearningUnit => unit.kind === 'project')
}

export function publishedProjectUnit(
  language: LanguageId,
  projectId: string,
): PublishedProjectLearningUnit | undefined {
  return publishedProjectUnitsForLanguage(language).find((unit) => unit.projectId === projectId)
}

export function publishedProjectUnitAfterCourse(
  language: LanguageId,
  courseId: CourseId,
): PublishedProjectLearningUnit | undefined {
  const units = publishedLearningUnitsForLanguage(language)
  const courseIndex = units.findIndex((unit) => (
    unit.kind === 'course' && unit.courseId === courseId
  ))
  const nextUnit = courseIndex >= 0 ? units[courseIndex + 1] : undefined
  return nextUnit?.kind === 'project' ? nextUnit : undefined
}
