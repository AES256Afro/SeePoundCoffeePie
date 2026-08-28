import type { CourseDefinition, CoursePrerequisite } from './course-registry'
import type {
  PublishedLanguageLearningSequence,
  PublishedLearningUnit,
} from './learning-sequence'
import type {
  CourseId,
  LanguageId,
  LearnerProgress,
  Mission,
} from '../types'

export interface PublishedContinuingCourseModuleManifest {
  id: string
  lessonIds: readonly string[]
  conceptIds: readonly string[]
}

export interface PublishedContinuingCourseManifest {
  courseId: CourseId
  modules: readonly PublishedContinuingCourseModuleManifest[]
}

export interface ContinuingCourseContent {
  id: CourseId
  language: LanguageId
  missions: Mission[]
}

export interface PublishedContinuingCourseLoader {
  courseId: CourseId
  language: LanguageId
  load: () => Promise<ContinuingCourseContent>
}

export interface PublishedContinuingCourseRegistration {
  definition: CourseDefinition
  language: LanguageId
  manifest: PublishedContinuingCourseManifest
  sequenceAfter: {
    language: LanguageId
    projectId: string
  }
  loadContent: () => Promise<ContinuingCourseContent>
}

export interface LearningSurfaceInput {
  foundationCourseDefinitions: readonly CourseDefinition[]
  foundationModuleLessonIds: ReadonlyMap<string, readonly string[]>
  learningSequences: readonly PublishedLanguageLearningSequence[]
  continuingCourseRegistrations: readonly PublishedContinuingCourseRegistration[]
}

export interface LearningSurface {
  courseDefinitions: readonly CourseDefinition[]
  learningSequences: readonly PublishedLanguageLearningSequence[]
  continuingCourseManifests: readonly PublishedContinuingCourseManifest[]
  continuingCourseLoaders: readonly PublishedContinuingCourseLoader[]
  courseDefinition: (courseId: string) => CourseDefinition | undefined
  courseDefinitionForSlug: (slug: string) => CourseDefinition | undefined
  learningUnitsForLanguage: (language: LanguageId) => readonly PublishedLearningUnit[]
  foundationCourseId: (language: LanguageId) => CourseId | undefined
  continuingCourseIdsForLanguage: (language: LanguageId) => readonly CourseId[]
  continuingCourseManifest: (
    courseId: string,
  ) => PublishedContinuingCourseManifest | undefined
  continuingCourseLessonIds: (
    courseId: string,
    moduleId: string,
  ) => readonly string[] | undefined
  continuingCourseContentRequest: (
    courseId: string,
  ) => Promise<ContinuingCourseContent | null> | undefined
  continuingCourseModuleRequest: (
    courseId: string,
    moduleId: string,
  ) => Promise<Mission | null> | undefined
  continuingCourseContentRequestsForLanguage: (
    language: LanguageId,
  ) => readonly Promise<ContinuingCourseContent | null>[]
  courseIsComplete: (courseId: string, progress: LearnerProgress) => boolean
  missingCoursePrerequisites: (
    courseId: string,
    progress: LearnerProgress,
  ) => readonly CoursePrerequisite[]
  courseIsAvailable: (courseId: string, progress: LearnerProgress) => boolean
  courseOwnsMission: (courseId: string, missionId: string) => boolean
  courseOwnsLesson: (courseId: string, lessonId: string) => boolean
  courseMissionLessonIds: (courseId: string, missionId: string) => readonly string[]
  courseMissionOwnsLesson: (
    courseId: string,
    missionId: string,
    lessonId: string,
  ) => boolean
}

const noUnits: readonly PublishedLearningUnit[] = Object.freeze([])
const noPrerequisites: readonly CoursePrerequisite[] = Object.freeze([])
const noLessonIds: readonly string[] = Object.freeze([])

function assertUnique(
  values: readonly string[],
  label: string,
): void {
  const seen = new Set<string>()
  for (const value of values) {
    if (seen.has(value)) throw new Error(`Duplicate ${label}: ${value}.`)
    seen.add(value)
  }
}

function assertExactOrder(
  actual: readonly string[],
  expected: readonly string[],
  label: string,
): void {
  if (
    actual.length !== expected.length
    || actual.some((value, index) => value !== expected[index])
  ) {
    throw new Error(`${label} must match exactly and remain in the same order.`)
  }
}

function unitIndex(
  units: readonly PublishedLearningUnit[],
  prerequisite: CoursePrerequisite,
): number {
  return units.findIndex((unit) => (
    prerequisite.kind === 'course'
      ? unit.kind === 'course' && unit.courseId === prerequisite.id
      : unit.kind === 'project' && unit.projectId === prerequisite.id
  ))
}

function contentMatchesRegistration(
  content: ContinuingCourseContent,
  registration: PublishedContinuingCourseRegistration,
): boolean {
  if (
    content.id !== registration.definition.id
    || content.language !== registration.language
    || content.missions.length !== registration.manifest.modules.length
  ) return false

  return content.missions.every((mission, index) => {
    const module = registration.manifest.modules[index]
    return Boolean(
      module
      && mission.id === module.id
      && mission.language === registration.language
      && mission.exercises.length === module.lessonIds.length
      && mission.exercises.every((exercise, lessonIndex) => (
        exercise.id === module.lessonIds[lessonIndex]
      )),
    )
  })
}

export function createLearningSurface(input: LearningSurfaceInput): LearningSurface {
  const registrations = [...input.continuingCourseRegistrations]
  const courseDefinitions = Object.freeze([
    ...input.foundationCourseDefinitions,
    ...registrations.map((registration) => registration.definition),
  ])
  const learningSequences = Object.freeze([...input.learningSequences])

  for (const definition of input.foundationCourseDefinitions) {
    if (definition.kind !== 'foundation') {
      throw new Error(`Base course must be a foundation course: ${definition.id}.`)
    }
  }
  assertUnique(courseDefinitions.map((definition) => definition.id), 'course ID')
  assertUnique(courseDefinitions.map((definition) => definition.slug), 'course slug')
  assertUnique(courseDefinitions.flatMap((definition) => definition.missionIds), 'module ID')
  assertUnique(courseDefinitions.flatMap((definition) => definition.lessonIds), 'lesson ID')
  assertUnique(learningSequences.map((sequence) => sequence.language), 'learning sequence')

  for (const definition of input.foundationCourseDefinitions) {
    const indexedLessonIds = definition.missionIds.flatMap((missionId) => (
      input.foundationModuleLessonIds.get(missionId) ?? []
    ))
    assertExactOrder(
      definition.lessonIds,
      indexedLessonIds,
      `Foundation lesson ownership for ${definition.id}`,
    )
  }

  const definitionsById = new Map(courseDefinitions.map((definition) => [definition.id, definition]))
  const definitionsBySlug = new Map<string, CourseDefinition>(
    courseDefinitions.map((definition) => [definition.slug, definition]),
  )
  const sequencesByLanguage = new Map(
    learningSequences.map((sequence) => [sequence.language, sequence]),
  )
  const registrationsByCourseId = new Map(
    registrations.map((registration) => [registration.definition.id, registration]),
  )

  for (const registration of registrations) {
    const { definition, manifest, sequenceAfter } = registration
    if (definition.kind !== 'continuing') {
      throw new Error(`Continuing kind: ${definition.id}.`)
    }
    if (definition.language !== registration.language || sequenceAfter.language !== registration.language) {
      throw new Error(`Continuing language: ${definition.id}.`)
    }
    if (manifest.courseId !== definition.id) {
      throw new Error(`Continuing manifest course: ${definition.id}.`)
    }
  }

  const sequencedCourseIds: CourseId[] = []
  for (const sequence of learningSequences) {
    if (sequence.units.length === 0) {
      throw new Error(`Learning sequence for ${sequence.language} is empty.`)
    }
    const firstUnit = sequence.units[0]
    if (firstUnit?.kind !== 'course' || firstUnit.stage !== 'foundation') {
      throw new Error(`Learning sequence for ${sequence.language} must begin with a foundation course.`)
    }

    const earlierCourses = new Set<CourseId>()
    for (const unit of sequence.units) {
      if (unit.kind === 'course') {
        const definition = definitionsById.get(unit.courseId)
        if (!definition || definition.language !== sequence.language || definition.kind !== unit.stage) {
          throw new Error(`Course ${unit.courseId} does not match its learning sequence.`)
        }
        if (earlierCourses.has(unit.courseId)) {
          throw new Error(`Duplicate course in learning sequences: ${unit.courseId}.`)
        }
        earlierCourses.add(unit.courseId)
        sequencedCourseIds.push(unit.courseId)
      } else if (!earlierCourses.has(unit.prerequisiteCourseId)) {
        throw new Error(
          `Project ${sequence.language}/${unit.projectId} must follow its prerequisite course.`,
        )
      }
    }
  }
  assertUnique(sequencedCourseIds, 'course in learning sequences')
  assertExactOrder(
    [...sequencedCourseIds].sort(),
    courseDefinitions.map((definition) => definition.id).sort(),
    'Learning-sequence course coverage',
  )

  const manifestModuleIds: string[] = []
  const manifestLessonIds: string[] = []
  for (const registration of registrations) {
    const { definition, manifest, sequenceAfter } = registration
    const moduleIds = manifest.modules.map((module) => module.id)
    const lessonIds = manifest.modules.flatMap((module) => module.lessonIds)
    assertUnique(moduleIds, `module in ${definition.id}`)
    assertUnique(lessonIds, `lesson in ${definition.id}`)
    manifestModuleIds.push(...moduleIds)
    manifestLessonIds.push(...lessonIds)
    assertExactOrder(definition.missionIds, moduleIds, `Module order for ${definition.id}`)
    assertExactOrder(definition.lessonIds, lessonIds, `Lesson order for ${definition.id}`)

    const sequence = sequencesByLanguage.get(registration.language)
    if (!sequence) throw new Error(`Missing sequence: ${definition.id}.`)
    const anchorIndex = sequence.units.findIndex((unit) => (
      unit.kind === 'project' && unit.projectId === sequenceAfter.projectId
    ))
    if (anchorIndex < 0) {
      throw new Error(`Missing anchor: ${definition.id}/${sequenceAfter.projectId}.`)
    }
    const nextUnit = sequence.units[anchorIndex + 1]
    if (nextUnit?.kind !== 'course' || nextUnit.courseId !== definition.id) {
      throw new Error(`Anchor order: ${definition.id}.`)
    }
    const anchor = sequence.units[anchorIndex]
    const foundationPrerequisite = definition.prerequisites.find((item) => item.kind === 'course')
    const projectPrerequisite = definition.prerequisites.find((item) => (
      item.kind === 'project' && item.id === sequenceAfter.projectId
    ))
    if (
      anchor?.kind !== 'project'
      || !foundationPrerequisite
      || !projectPrerequisite
      || anchor.prerequisiteCourseId !== foundationPrerequisite.id
    ) {
      throw new Error(`Anchor prerequisites: ${definition.id}.`)
    }

    for (const prerequisite of definition.prerequisites) {
      const prerequisiteIndex = unitIndex(sequence.units, prerequisite)
      if (prerequisiteIndex < 0 || prerequisiteIndex >= anchorIndex + 1) {
        throw new Error(`Prerequisite order: ${definition.id}/${prerequisite.id}.`)
      }
    }
  }
  assertUnique(manifestModuleIds, 'continuing manifest module ID')
  assertUnique(manifestLessonIds, 'continuing manifest lesson ID')

  const continuingUnits = learningSequences.flatMap((sequence) => (
    sequence.units.flatMap((unit) => (
      unit.kind === 'course' && unit.stage === 'continuing' ? [unit.courseId] : []
    ))
  ))
  assertExactOrder(
    registrations.map((registration) => registration.definition.id),
    continuingUnits,
    'Continuing registration order',
  )

  const continuingCourseManifests = Object.freeze(
    registrations.map((registration) => registration.manifest),
  )
  const continuingCourseLoaders = Object.freeze(
    registrations.map((registration) => Object.freeze({
      courseId: registration.definition.id,
      language: registration.language,
      load: registration.loadContent,
    })),
  )
  const contentRequestByCourseId = new Map<string, Promise<ContinuingCourseContent | null>>()

  const courseDefinition = (courseId: string): CourseDefinition | undefined => (
    definitionsById.get(courseId as CourseId)
  )
  const learningUnitsForLanguage = (
    language: LanguageId,
  ): readonly PublishedLearningUnit[] => sequencesByLanguage.get(language)?.units ?? noUnits
  const continuingCourseIdsForLanguage = (language: LanguageId): readonly CourseId[] => (
    learningUnitsForLanguage(language).flatMap((unit) => (
      unit.kind === 'course' && unit.stage === 'continuing' ? [unit.courseId] : []
    ))
  )
  const continuingCourseManifest = (
    courseId: string,
  ): PublishedContinuingCourseManifest | undefined => (
    registrationsByCourseId.get(courseId as CourseId)?.manifest
  )
  const continuingCourseLessonIds = (
    courseId: string,
    moduleId: string,
  ): readonly string[] | undefined => continuingCourseManifest(courseId)?.modules.find((module) => (
    module.id === moduleId
  ))?.lessonIds

  const continuingCourseContentRequest = (
    courseId: string,
  ): Promise<ContinuingCourseContent | null> | undefined => {
    const cached = contentRequestByCourseId.get(courseId)
    if (cached) return cached
    const registration = registrationsByCourseId.get(courseId as CourseId)
    if (!registration) return undefined

    const request = Promise.resolve()
      .then(() => registration.loadContent())
      .then(
        (content) => contentMatchesRegistration(content, registration) ? content : null,
        () => null,
      )
    contentRequestByCourseId.set(courseId, request)
    return request
  }

  const continuingCourseModuleRequest = (
    courseId: string,
    moduleId: string,
  ): Promise<Mission | null> | undefined => {
    const registration = registrationsByCourseId.get(courseId as CourseId)
    if (!registration || !continuingCourseLessonIds(courseId, moduleId)) return undefined
    return continuingCourseContentRequest(courseId)?.then((content) => (
      content?.missions.find((mission) => mission.id === moduleId) ?? null
    ))
  }

  const continuingCourseContentRequestsForLanguage = (
    language: LanguageId,
  ): readonly Promise<ContinuingCourseContent | null>[] => (
    continuingCourseIdsForLanguage(language).flatMap((courseId) => {
      const request = continuingCourseContentRequest(courseId)
      return request ? [request] : []
    })
  )

  const courseIsComplete = (courseId: string, progress: LearnerProgress): boolean => {
    const definition = courseDefinition(courseId)
    return Boolean(
      definition
      && definition.missionIds.length > 0
      && definition.missionIds.every((missionId) => progress.completedMissions.includes(missionId)),
    )
  }
  const missingCoursePrerequisites = (
    courseId: string,
    progress: LearnerProgress,
  ): readonly CoursePrerequisite[] => {
    const definition = courseDefinition(courseId)
    if (!definition) return noPrerequisites
    return definition.prerequisites.filter((prerequisite) => (
      prerequisite.kind === 'course'
        ? !courseIsComplete(prerequisite.id, progress)
        : !progress.completedProjects.includes(prerequisite.id)
    ))
  }
  const courseMissionLessonIds = (
    courseId: string,
    missionId: string,
  ): readonly string[] => {
    const definition = courseDefinition(courseId)
    if (!definition?.missionIds.includes(missionId)) return noLessonIds
    if (definition.kind === 'continuing') {
      return continuingCourseLessonIds(courseId, missionId) ?? noLessonIds
    }
    return input.foundationModuleLessonIds.get(missionId) ?? noLessonIds
  }

  return Object.freeze({
    courseDefinitions,
    learningSequences,
    continuingCourseManifests,
    continuingCourseLoaders,
    courseDefinition,
    courseDefinitionForSlug: (slug: string) => definitionsBySlug.get(slug),
    learningUnitsForLanguage,
    foundationCourseId: (language: LanguageId) => {
      const unit = learningUnitsForLanguage(language).find((candidate) => (
        candidate.kind === 'course' && candidate.stage === 'foundation'
      ))
      return unit?.kind === 'course' ? unit.courseId : undefined
    },
    continuingCourseIdsForLanguage,
    continuingCourseManifest,
    continuingCourseLessonIds,
    continuingCourseContentRequest,
    continuingCourseModuleRequest,
    continuingCourseContentRequestsForLanguage,
    courseIsComplete,
    missingCoursePrerequisites,
    courseIsAvailable: (courseId: string, progress: LearnerProgress) => (
      Boolean(courseDefinition(courseId))
      && missingCoursePrerequisites(courseId, progress).length === 0
    ),
    courseOwnsMission: (courseId: string, missionId: string) => (
      courseDefinition(courseId)?.missionIds.includes(missionId) ?? false
    ),
    courseOwnsLesson: (courseId: string, lessonId: string) => (
      courseDefinition(courseId)?.lessonIds.includes(lessonId) ?? false
    ),
    courseMissionLessonIds,
    courseMissionOwnsLesson: (courseId: string, missionId: string, lessonId: string) => (
      courseMissionLessonIds(courseId, missionId).includes(lessonId)
    ),
  })
}
