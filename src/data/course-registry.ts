import { durableCurriculumV1 } from './durable-curriculum-v1'
import {
  publishedContinuingCourseLessonIds,
  publishedContinuingCourseManifest,
} from './published-continuing-course-manifests'
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

const foundationCourseIds: Record<LanguageId, CourseId> = {
  python: 'python-foundations',
  cpp: 'cpp-foundations',
  csharp: 'csharp-foundations',
  java: 'java-foundations',
}

const foundationPrefixes: Record<LanguageId, string> = {
  python: 'python/',
  cpp: 'cpp/',
  csharp: 'csharp/',
  java: 'java/',
}

function foundationOwnership(language: LanguageId): { missionIds: string[]; lessonIds: string[] } {
  const prefix = foundationPrefixes[language]
  const entries = Object.entries(durableCurriculumV1).filter(([owner]) => owner.startsWith(prefix))
  return {
    missionIds: entries.map(([owner]) => owner.slice(prefix.length)),
    lessonIds: entries.flatMap(([, lessons]) => [...lessons]),
  }
}

const sharedFoundationTitles = [
  'Reading code and variables',
  'Decisions',
  'Collections',
  'Loops',
  'Functions',
  'Guided project',
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
const pythonDataTools = publishedContinuingCourseManifest('python-data-tools')

if (!pythonDataTools) throw new Error('Published Practical Python manifest is missing.')

export const courseDefinitions: readonly CourseDefinition[] = [
  {
    id: 'python-foundations',
    slug: 'python-foundations',
    language: 'python',
    shortName: 'Python',
    title: 'Python Foundations',
    description: 'The clearest first route into programming, with gentle syntax and patient explanations.',
    outcome: 'Write readable scripts and build a small text adventure.',
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
    description: 'Learn how compiled programs fit together while every symbol and build step is explained.',
    outcome: 'Understand compiled programs and build a tactical simulator.',
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
    description: 'Build structured console programs with the .NET basics unpacked one small idea at a time.',
    outcome: 'Build structured console programs and a small encounter system.',
    kind: 'foundation',
    level: 'Beginner',
    symbol: 'hash',
    symbolLabel: 'Hash mark',
    missionIds: csharp.missionIds,
    lessonIds: csharp.lessonIds,
    moduleTitles: [...sharedFoundationTitles.slice(0, 4), 'Methods', 'Guided project'],
    moduleKinds: foundationKinds,
    prerequisites: [],
  },
  {
    id: 'java-foundations',
    slug: 'java-foundations',
    language: 'java',
    shortName: 'Java',
    title: 'Java Foundations',
    description: 'Learn portable console programming with the extra structure translated into plain language.',
    outcome: 'Build portable console programs and an expedition planner.',
    kind: 'foundation',
    level: 'Beginner',
    symbol: 'coffee',
    symbolLabel: 'Coffee cup',
    missionIds: java.missionIds,
    lessonIds: java.lessonIds,
    moduleTitles: [...sharedFoundationTitles.slice(0, 4), 'Methods', 'Guided project'],
    moduleKinds: foundationKinds,
    prerequisites: [],
  },
  {
    id: 'python-data-tools',
    slug: 'python-data-tools',
    language: 'python',
    shortName: 'Practical Python',
    title: 'Practical Python: Data Tools',
    description: 'Turn familiar Python building blocks into useful tools that clean, organize, total, and filter information.',
    outcome: 'Build and explain a small Supply Tracker that turns inconsistent item names and quantities into a reliable report.',
    kind: 'continuing',
    level: 'Beginner II',
    symbol: 'pi',
    symbolLabel: 'Pi',
    completionReviewLabel: 'Your Supply Tracker',
    missionIds: pythonDataTools.modules.map((module) => module.id),
    lessonIds: pythonDataTools.modules.flatMap((module) => module.lessonIds),
    moduleTitles: [
      'Functions that return answers',
      'Cleaning and normalizing text',
      'Lists that grow and change',
      'Dictionaries and named data',
      'Totals and filters',
      'Supply Tracker capstone',
    ],
    moduleKinds: ['lessons', 'lessons', 'lessons', 'lessons', 'lessons', 'capstone'],
    prerequisites: [
      { kind: 'course', id: 'python-foundations', label: 'Complete Python Foundations' },
      {
        kind: 'project',
        id: 'first-interactive-program',
        label: 'Complete Your First Interactive Program',
        path: '/projects/python/first-interactive-program',
      },
    ],
  },
] as const

const definitionsById = new Map(courseDefinitions.map((course) => [course.id, course]))
const definitionsBySlug = new Map<string, CourseDefinition>(courseDefinitions.map((course) => [course.slug, course]))

export function foundationCourseId(language: LanguageId): CourseId {
  return foundationCourseIds[language]
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
    return publishedContinuingCourseLessonIds(courseId, missionId) ?? []
  }
  return durableCurriculumV1[`${course.language}/${missionId}` as keyof typeof durableCurriculumV1] ?? []
}

export function courseMissionOwnsLesson(
  courseId: CourseId,
  missionId: string,
  lessonId: string,
): boolean {
  return courseMissionLessonIds(courseId, missionId).includes(lessonId)
}
