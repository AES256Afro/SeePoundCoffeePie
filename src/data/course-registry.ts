import { controlledContinuingCourseRegistrations } from './controlled-continuing-course-publication'
import {
  foundationEntriesForLanguage,
  foundationMissionLessonIds,
} from './foundation-curriculum-index'
import { publishedFoundationCourseId } from './learning-sequence'
import type { CourseId, LanguageId, LearnerProgress } from '../types'

export type CourseSymbol = 'pi' | 'eye' | 'hash' | 'coffee'
export type CourseKind = 'foundation' | 'continuing'
export type CourseModuleKind = 'lessons' | 'capstone' | 'guided-project'

export type CoursePrerequisite =
  | { kind: 'course'; id: CourseId; label: string }
  | { kind: 'project'; id: string; label: string; path: string }

export interface CourseDefinition {
  id: CourseId
  slug: CourseId
  language: LanguageId
  shortName: string
  title: string
  description: string
  outcome: string
  kind: CourseKind
  level: string
  symbol: CourseSymbol
  symbolLabel: string
  completionReviewLabel?: string
  missionIds: readonly string[]
  lessonIds: readonly string[]
  moduleTitles: readonly string[]
  moduleKinds: readonly CourseModuleKind[]
  prerequisites: readonly CoursePrerequisite[]
}

function foundationOwnership(language: LanguageId): { missionIds: string[]; lessonIds: string[] } {
  const entries = foundationEntriesForLanguage(language)
  return {
    missionIds: entries.map((entry) => entry.missionId),
    lessonIds: entries.flatMap((entry) => entry.lessonIds),
  }
}

const sharedFoundationTitles = [
  'Reading code and variables',
  'Decisions',
  'Collections',
  'Loops',
  'Functions',
  'Build a complete program',
] as const

const foundationKinds = [
  'lessons',
  'lessons',
  'lessons',
  'lessons',
  'lessons',
  'guided-project',
] as const

const python = foundationOwnership('python')
const cpp = foundationOwnership('cpp')
const csharp = foundationOwnership('csharp')
const java = foundationOwnership('java')
export const foundationCourseDefinitions: readonly CourseDefinition[] = Object.freeze([
  {
    id: 'python-foundations',
    slug: 'python-foundations',
    language: 'python',
    shortName: 'Python',
    title: 'Python Foundations',
    description: 'Start with short Python instructions, plain explanations, and small code changes.',
    outcome: 'Write readable scripts and build a complete text program.',
    kind: 'foundation',
    level: 'Beginner',
    symbol: 'pi',
    symbolLabel: 'Pi',
    missionIds: python.missionIds,
    lessonIds: python.lessonIds,
    moduleTitles: sharedFoundationTitles,
    moduleKinds: foundationKinds,
    prerequisites: [],
  },
  {
    id: 'cpp-foundations',
    slug: 'cpp-foundations',
    language: 'cpp',
    shortName: 'C++',
    title: 'C++ Foundations',
    description: 'See how C++ code becomes a program, show results, and store different kinds of values.',
    outcome: 'Build a small C++ program from beginning to end.',
    kind: 'foundation',
    level: 'Beginner',
    symbol: 'eye',
    symbolLabel: 'Eye',
    missionIds: cpp.missionIds,
    lessonIds: cpp.lessonIds,
    moduleTitles: sharedFoundationTitles,
    moduleKinds: foundationKinds,
    prerequisites: [],
  },
  {
    id: 'csharp-foundations',
    slug: 'csharp-foundations',
    language: 'csharp',
    shortName: 'C#',
    title: 'C# Foundations',
    description: 'Write simple C# programs, show results, and store different kinds of values.',
    outcome: 'Build one complete C# program.',
    kind: 'foundation',
    level: 'Beginner',
    symbol: 'hash',
    symbolLabel: 'Hash mark',
    missionIds: csharp.missionIds,
    lessonIds: csharp.lessonIds,
    moduleTitles: [...sharedFoundationTitles.slice(0, 4), 'Methods', 'Build a complete program'],
    moduleKinds: foundationKinds,
    prerequisites: [],
  },
  {
    id: 'java-foundations',
    slug: 'java-foundations',
    language: 'java',
    shortName: 'Java',
    title: 'Java Foundations',
    description: 'Write simple Java programs, show results, and store different kinds of values.',
    outcome: 'Build one complete Java program.',
    kind: 'foundation',
    level: 'Beginner',
    symbol: 'coffee',
    symbolLabel: 'Coffee cup',
    missionIds: java.missionIds,
    lessonIds: java.lessonIds,
    moduleTitles: [...sharedFoundationTitles.slice(0, 4), 'Methods', 'Build a complete program'],
    moduleKinds: foundationKinds,
    prerequisites: [],
  },
])

export const courseDefinitions: readonly CourseDefinition[] = Object.freeze([
  ...foundationCourseDefinitions,
  ...controlledContinuingCourseRegistrations.map((registration) => registration.definition),
])

const continuingRegistrationByCourseId = new Map(
  controlledContinuingCourseRegistrations.map((registration) => [
    registration.definition.id,
    registration,
  ]),
)

for (const registration of controlledContinuingCourseRegistrations) {
  const moduleIds = registration.manifest.modules.map((module) => module.id)
  const lessonIds = registration.manifest.modules.flatMap((module) => module.lessonIds)
  if (
    registration.definition.kind !== 'continuing'
    || registration.definition.language !== registration.language
    || registration.manifest.courseId !== registration.definition.id
    || moduleIds.length !== registration.definition.missionIds.length
    || moduleIds.some((moduleId, index) => moduleId !== registration.definition.missionIds[index])
    || lessonIds.length !== registration.definition.lessonIds.length
    || lessonIds.some((lessonId, index) => lessonId !== registration.definition.lessonIds[index])
  ) {
    throw new Error(`Invalid continuing-course definition: ${registration.definition.id}.`)
  }
}

const definitionsById = new Map(courseDefinitions.map((course) => [course.id, course]))
const definitionsBySlug = new Map<string, CourseDefinition>(courseDefinitions.map((course) => [course.slug, course]))

export function foundationCourseId(language: LanguageId): CourseId {
  const courseId = publishedFoundationCourseId(language)
  if (!courseId) throw new Error(`No published foundation course for ${language}.`)
  return courseId
}

export function courseDefinition(courseId: CourseId): CourseDefinition {
  const definition = definitionsById.get(courseId)
  if (!definition) throw new Error(`Unknown course: ${courseId}`)
  return definition
}

export function courseDefinitionForSlug(slug: string): CourseDefinition | undefined {
  return definitionsBySlug.get(slug)
}

export function courseIsComplete(courseId: CourseId, progress: LearnerProgress): boolean {
  const definition = courseDefinition(courseId)
  return definition.missionIds.length > 0
    && definition.missionIds.every((missionId) => progress.completedMissions.includes(missionId))
}

export function missingCoursePrerequisites(
  courseId: CourseId,
  progress: LearnerProgress,
): CoursePrerequisite[] {
  return courseDefinition(courseId).prerequisites.filter((prerequisite) => (
    prerequisite.kind === 'course'
      ? !courseIsComplete(prerequisite.id, progress)
      : !progress.completedProjects.includes(prerequisite.id)
  ))
}

export function courseIsAvailable(courseId: CourseId, progress: LearnerProgress): boolean {
  return missingCoursePrerequisites(courseId, progress).length === 0
}

export function courseOwnsMission(courseId: CourseId, missionId: string): boolean {
  return courseDefinition(courseId).missionIds.includes(missionId)
}

export function courseOwnsLesson(courseId: CourseId, lessonId: string): boolean {
  return courseDefinition(courseId).lessonIds.includes(lessonId)
}

export function courseMissionLessonIds(
  courseId: CourseId,
  missionId: string,
): readonly string[] {
  const course = courseDefinition(courseId)
  if (!course.missionIds.includes(missionId)) return []
  if (course.kind === 'continuing') {
    return continuingRegistrationByCourseId.get(courseId)?.manifest.modules.find((module) => (
      module.id === missionId
    ))?.lessonIds ?? []
  }
  return foundationMissionLessonIds.get(missionId) ?? []
}

export function courseMissionOwnsLesson(
  courseId: CourseId,
  missionId: string,
  lessonId: string,
): boolean {
  return courseMissionLessonIds(courseId, missionId).includes(lessonId)
}
