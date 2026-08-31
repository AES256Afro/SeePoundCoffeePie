export type AcademyPathId = 'LM-100' | 'RVF-PATH'
export type AcademyCourseId = 'LM-101' | 'RVF-100'
export type AcademyModuleId = 'LM-101-M1' | 'LM-101-M2' | 'RVF-100-M1'
export type AcademyUnitId =
  | 'LM-101-U1'
  | 'LM-101-U2'
  | 'LM-101-U3'
  | 'LM-101-U4'
  | 'LM-101-U5'
  | 'LML-101'
  | 'RVF-101'
  | 'RVF-102'
export type AcademyConceptId =
  | 'model-versus-rule'
  | 'model-inputs-and-outputs'
  | 'model-parameters'
  | 'model-and-application-boundaries'
  | 'model-capability-and-failure'
  | 'model-recognition'
  | 'software-is-built-in-steps'
  | 'execution-does-not-prove-correctness'
export type AcademyPreparationPageId =
  | 'LM-101-P1'
  | 'LM-101-P2'
  | 'RVF-100-P1'
  | 'RVF-100-P2'

export type AcademyPreparationKind = 'start' | 'refresher' | 'short-context'

interface AcademyRecordMetadata {
  id: string
  slug: string
  title: string
  summary: string
  outcome: string
  time: string
  activity: string
  platform: string
  access: 'open'
}

export interface AcademyPath extends AcademyRecordMetadata {
  id: AcademyPathId
  courseIds: readonly AcademyCourseId[]
}

export interface AcademyPreparationDestination {
  kind: 'unit' | 'preparation-page'
  id: AcademyUnitId | AcademyPreparationPageId
}

export interface AcademyOptionalPreparationChoice {
  id: string
  kind: AcademyPreparationKind
  label: string
  summary: string
  destination: AcademyPreparationDestination
}

export interface AcademyCourse extends AcademyRecordMetadata {
  id: AcademyCourseId
  pathId: AcademyPathId
  moduleIds: readonly AcademyModuleId[]
  optionalPreparation: readonly AcademyOptionalPreparationChoice[]
}

export interface AcademyModule extends AcademyRecordMetadata {
  id: AcademyModuleId
  pathId: AcademyPathId
  courseId: AcademyCourseId
  unitIds: readonly AcademyUnitId[]
}

export interface AcademyUnit extends AcademyRecordMetadata {
  id: AcademyUnitId
  pathId: AcademyPathId
  courseId: AcademyCourseId
  moduleId: AcademyModuleId
  conceptId: AcademyConceptId
  xp: number
}

export interface AcademyPreparationPage extends AcademyRecordMetadata {
  id: AcademyPreparationPageId
  pathId: AcademyPathId
  courseId: AcademyCourseId
  returnUnitId: AcademyUnitId
  content: readonly string[]
}

const browserReadingPlatform = 'Any current browser. No account, installation, or local change is required.'

export const academyPaths: readonly AcademyPath[] = Object.freeze([
  {
    id: 'LM-100',
    slug: 'models-from-zero',
    title: 'Models from zero',
    summary: 'Learn what models are before choosing, running, or comparing one.',
    outcome: 'Explain where a model fits inside a computer system and what its output can and cannot prove.',
    time: '2 hours for the published course',
    activity: 'Read short explanations, inspect prepared examples, and check your understanding.',
    platform: browserReadingPlatform,
    access: 'open',
    courseIds: ['LM-101'],
  },
  {
    id: 'RVF-PATH',
    slug: 'reality-versus-fiction',
    title: 'Reality versus fiction',
    summary: 'Compare familiar technology claims with the work and evidence behind real systems.',
    outcome: 'Separate a dramatic claim from what the available evidence actually supports.',
    time: '30 minutes for the published course',
    activity: 'Read a claim, inspect missing steps, and choose the evidence that supports a conclusion.',
    platform: browserReadingPlatform,
    access: 'open',
    courseIds: ['RVF-100'],
  },
])

export const academyCourses: readonly AcademyCourse[] = Object.freeze([
  {
    id: 'LM-101',
    slug: 'what-a-model-is',
    pathId: 'LM-100',
    title: 'What a model is',
    summary: 'Begin with ordinary rules, then identify the learned numerical part of a larger application.',
    outcome: 'Distinguish a model from ordinary code, stored records, and the application around it.',
    time: '90 to 120 minutes',
    activity: 'Read prepared examples, answer short checks, and complete one classification activity.',
    platform: browserReadingPlatform,
    access: 'open',
    moduleIds: ['LM-101-M1', 'LM-101-M2'],
    optionalPreparation: [
      {
        id: 'LM-101-START',
        kind: 'start',
        label: 'Start now',
        summary: 'Open the first unit. Every needed word is explained on the page.',
        destination: { kind: 'unit', id: 'LM-101-U1' },
      },
      {
        id: 'LM-101-REFRESHER',
        kind: 'refresher',
        label: 'Review a refresher',
        summary: 'Review a few computer words, then return to the first unit.',
        destination: { kind: 'preparation-page', id: 'LM-101-P1' },
      },
      {
        id: 'LM-101-CONTEXT',
        kind: 'short-context',
        label: 'Read the short context',
        summary: 'Read one page about why models are only one part of an application.',
        destination: { kind: 'preparation-page', id: 'LM-101-P2' },
      },
    ],
  },
  {
    id: 'RVF-100',
    slug: 'programming-on-screen-and-at-work',
    pathId: 'RVF-PATH',
    title: 'Programming on screen and at work',
    summary: 'Compare fast on-screen programming with the smaller steps used to build dependable software.',
    outcome: 'Explain why typing, colorful text, and one successful run are not enough evidence of quality.',
    time: '20 to 30 minutes',
    activity: 'Read two comparisons and inspect prepared evidence. No code runner is used.',
    platform: browserReadingPlatform,
    access: 'open',
    moduleIds: ['RVF-100-M1'],
    optionalPreparation: [
      {
        id: 'RVF-100-START',
        kind: 'start',
        label: 'Start now',
        summary: 'Open the first unit. It explains each software word before using it.',
        destination: { kind: 'unit', id: 'RVF-101' },
      },
      {
        id: 'RVF-100-REFRESHER',
        kind: 'refresher',
        label: 'Review a refresher',
        summary: 'Review the difference between code, a program, and an application.',
        destination: { kind: 'preparation-page', id: 'RVF-100-P1' },
      },
      {
        id: 'RVF-100-CONTEXT',
        kind: 'short-context',
        label: 'Read the short context',
        summary: 'Read one page about the steps around writing code.',
        destination: { kind: 'preparation-page', id: 'RVF-100-P2' },
      },
    ],
  },
])

export const academyModules: readonly AcademyModule[] = Object.freeze([
  {
    id: 'LM-101-M1',
    slug: 'learned-behavior',
    pathId: 'LM-100',
    courseId: 'LM-101',
    title: 'Learned behavior',
    summary: 'Start with ordinary rules, inputs, outputs, and the numbers adjusted from examples.',
    outcome: 'Identify which part of a simple system is a model.',
    time: '40 to 55 minutes',
    activity: 'Read and classify prepared examples.',
    platform: browserReadingPlatform,
    access: 'open',
    unitIds: ['LM-101-U1', 'LM-101-U2', 'LM-101-U3'],
  },
  {
    id: 'LM-101-M2',
    slug: 'capability-and-limits',
    pathId: 'LM-100',
    courseId: 'LM-101',
    title: 'Capability and limits',
    summary: 'Separate a model from the application around it and examine why outputs can be wrong.',
    outcome: 'Describe a model without treating it as a database, a complete product, or a person.',
    time: '50 to 65 minutes',
    activity: 'Inspect prepared system maps and complete a classification activity.',
    platform: browserReadingPlatform,
    access: 'open',
    unitIds: ['LM-101-U4', 'LM-101-U5', 'LML-101'],
  },
  {
    id: 'RVF-100-M1',
    slug: 'build-and-execution',
    pathId: 'RVF-PATH',
    courseId: 'RVF-100',
    title: 'Build and execution',
    summary: 'Compare rapid typing and a first run with the evidence needed for dependable software.',
    outcome: 'Name the steps and checks hidden by a short programming scene.',
    time: '20 to 30 minutes',
    activity: 'Order prepared work steps and compare different kinds of evidence.',
    platform: browserReadingPlatform,
    access: 'open',
    unitIds: ['RVF-101', 'RVF-102'],
  },
])

export const academyUnits: readonly AcademyUnit[] = Object.freeze([
  {
    id: 'LM-101-U1',
    slug: 'model-and-rule',
    pathId: 'LM-100',
    courseId: 'LM-101',
    moduleId: 'LM-101-M1',
    title: 'A model and an ordinary rule',
    summary: 'Compare a rule written by a person with numerical behavior adjusted from examples.',
    outcome: 'Choose whether a described behavior is an ordinary rule, a learned model, or not explained well enough.',
    time: '12 minutes',
    activity: 'Read and classify four prepared examples.',
    platform: browserReadingPlatform,
    access: 'open',
    conceptId: 'model-versus-rule',
    xp: 12,
  },
  {
    id: 'LM-101-U2',
    slug: 'inputs-and-outputs',
    pathId: 'LM-100',
    courseId: 'LM-101',
    moduleId: 'LM-101-M1',
    title: 'Inputs and outputs',
    summary: 'Follow information into a model and identify what comes back out.',
    outcome: 'Label the input and output in a prepared model example.',
    time: '12 minutes',
    activity: 'Inspect two prepared system maps and answer a short check.',
    platform: browserReadingPlatform,
    access: 'open',
    conceptId: 'model-inputs-and-outputs',
    xp: 12,
  },
  {
    id: 'LM-101-U3',
    slug: 'parameters-are-adjusted-numbers',
    pathId: 'LM-100',
    courseId: 'LM-101',
    moduleId: 'LM-101-M1',
    title: 'Parameters are adjusted numbers',
    summary: 'Learn what a parameter means without using the parameter count as a quality score.',
    outcome: 'Explain that parameters are adjusted numerical values inside a model.',
    time: '14 minutes',
    activity: 'Read a plain comparison and check which claims a parameter count supports.',
    platform: browserReadingPlatform,
    access: 'open',
    conceptId: 'model-parameters',
    xp: 14,
  },
  {
    id: 'LM-101-U4',
    slug: 'model-application-and-database',
    pathId: 'LM-100',
    courseId: 'LM-101',
    moduleId: 'LM-101-M2',
    title: 'Model, application, and database',
    summary: 'Separate learned behavior from stored records and the software around both.',
    outcome: 'Point to the model, application code, and stored records in a prepared system map.',
    time: '16 minutes',
    activity: 'Label the parts of a prepared application diagram.',
    platform: browserReadingPlatform,
    access: 'open',
    conceptId: 'model-and-application-boundaries',
    xp: 16,
  },
  {
    id: 'LM-101-U5',
    slug: 'capability-and-failure',
    pathId: 'LM-100',
    courseId: 'LM-101',
    moduleId: 'LM-101-M2',
    title: 'Capability and failure',
    summary: 'Examine why a fluent or confident output can still be incomplete or wrong.',
    outcome: 'Name one supported capability, one limit, and one check for a prepared example.',
    time: '16 minutes',
    activity: 'Classify prepared failures before choosing a useful next check.',
    platform: browserReadingPlatform,
    access: 'open',
    conceptId: 'model-capability-and-failure',
    xp: 16,
  },
  {
    id: 'LML-101',
    slug: 'model-or-not',
    pathId: 'LM-100',
    courseId: 'LM-101',
    moduleId: 'LM-101-M2',
    title: 'Model or Not',
    summary: 'Use prepared evidence to distinguish ordinary rules, learned models, and systems that need more information.',
    outcome: 'Classify each prepared system and explain which evidence supports the choice.',
    time: '25 minutes',
    activity: 'Complete a prepared classification and concept map. Nothing runs on this page.',
    platform: browserReadingPlatform,
    access: 'open',
    conceptId: 'model-recognition',
    xp: 24,
  },
  {
    id: 'RVF-101',
    slug: 'complete-program-in-one-burst',
    pathId: 'RVF-PATH',
    courseId: 'RVF-100',
    moduleId: 'RVF-100-M1',
    title: 'A complete program appears in one burst of typing',
    summary: 'Compare a rapid programming scene with the work already present and the checks still needed.',
    outcome: 'Put prepared software work steps in a sensible order and name what each step proves.',
    time: '12 minutes',
    activity: 'Order prepared cards. No code execution is required.',
    platform: browserReadingPlatform,
    access: 'open',
    conceptId: 'software-is-built-in-steps',
    xp: 14,
  },
  {
    id: 'RVF-102',
    slug: 'code-works-first-time',
    pathId: 'RVF-PATH',
    courseId: 'RVF-100',
    moduleId: 'RVF-100-M1',
    title: 'Code works correctly the first time',
    summary: 'Separate successful execution from evidence that a program behaves correctly.',
    outcome: 'Distinguish a syntax error, a runtime error, and a logic error in prepared examples.',
    time: '12 minutes',
    activity: 'Read three prepared results and choose what each result shows.',
    platform: browserReadingPlatform,
    access: 'open',
    conceptId: 'execution-does-not-prove-correctness',
    xp: 14,
  },
])

export const academyPreparationPages: readonly AcademyPreparationPage[] = Object.freeze([
  {
    id: 'LM-101-P1',
    slug: 'computer-words-refresher',
    pathId: 'LM-100',
    courseId: 'LM-101',
    returnUnitId: 'LM-101-U1',
    title: 'Computer words refresher',
    summary: 'Review six words used to describe the parts of a computer system.',
    outcome: 'Recognize input, output, program, application, data, and file when they appear in the course.',
    time: '5 minutes',
    activity: 'Read a short definition for each word.',
    platform: browserReadingPlatform,
    access: 'open',
    content: [
      'An input is information given to a system. An output is information returned by a system.',
      'A program is a set of computer instructions. An application is software assembled to help a person do a task.',
      'Data is information represented so a computer can store or use it. A file is one named collection of stored data.',
      'You may return to the course now. The first unit repeats the words it needs.',
    ],
  },
  {
    id: 'LM-101-P2',
    slug: 'model-context',
    pathId: 'LM-100',
    courseId: 'LM-101',
    returnUnitId: 'LM-101-U1',
    title: 'Where a model fits',
    summary: 'Read the shortest useful context for the first unit.',
    outcome: 'Know that a model is one part of a larger application.',
    time: '3 minutes',
    activity: 'Read four short statements.',
    platform: browserReadingPlatform,
    access: 'open',
    content: [
      'A person gives information to an application. The application prepares that information for a model.',
      'The model transforms the prepared input into an output. The application decides how to show or use that output.',
      'Accounts, buttons, stored records, logs, and network connections are separate parts of the application.',
      'The course begins by comparing an ordinary written rule with behavior adjusted from examples.',
    ],
  },
  {
    id: 'RVF-100-P1',
    slug: 'software-work-refresher',
    pathId: 'RVF-PATH',
    courseId: 'RVF-100',
    returnUnitId: 'RVF-101',
    title: 'Code, program, and application',
    summary: 'Review three words that are often treated as if they mean the same thing.',
    outcome: 'Distinguish source code, a program, and the larger application around it.',
    time: '4 minutes',
    activity: 'Read three short definitions and one comparison.',
    platform: browserReadingPlatform,
    access: 'open',
    content: [
      'Source code is text written in a programming language.',
      'A program is a set of instructions a computer can carry out after the language tools prepare or interpret them.',
      'An application can include programs, screens, stored data, settings, help, and connections to other services.',
      'Writing code is one part of building and maintaining an application.',
    ],
  },
  {
    id: 'RVF-100-P2',
    slug: 'build-and-execution-context',
    pathId: 'RVF-PATH',
    courseId: 'RVF-100',
    returnUnitId: 'RVF-101',
    title: 'The steps around code',
    summary: 'See why a short programming scene leaves out useful work.',
    outcome: 'Recognize that a first working result and a dependable release are different claims.',
    time: '3 minutes',
    activity: 'Read one short sequence and its evidence boundary.',
    platform: browserReadingPlatform,
    access: 'open',
    content: [
      'A small change usually begins by understanding the requested result and inspecting the existing system.',
      'The programmer changes one behavior, runs a relevant check, reviews the difference, and records what remains uncertain.',
      'A result on one computer proves only that the observed case worked in that environment.',
      'Security, accessibility, deployment, monitoring, and recovery need their own evidence.',
    ],
  },
])

export const academyPathIds: readonly AcademyPathId[] = Object.freeze(academyPaths.map((path) => path.id))
export const academyCourseIds: readonly AcademyCourseId[] = Object.freeze(academyCourses.map((course) => course.id))
export const academyModuleIds: readonly AcademyModuleId[] = Object.freeze(academyModules.map((module) => module.id))
export const academyUnitIds: readonly AcademyUnitId[] = Object.freeze(academyUnits.map((unit) => unit.id))
export const academyConceptIds: readonly AcademyConceptId[] = Object.freeze(academyUnits.map((unit) => unit.conceptId))
export const academyPreparationPageIds: readonly AcademyPreparationPageId[] = Object.freeze(
  academyPreparationPages.map((page) => page.id),
)
export const academyModuleUnitIds: Readonly<Record<AcademyModuleId, readonly AcademyUnitId[]>> = Object.freeze(
  Object.fromEntries(academyModules.map((module) => [module.id, Object.freeze([...module.unitIds])])) as Record<
    AcademyModuleId,
    readonly AcademyUnitId[]
  >,
)

const pathById = new Map(academyPaths.map((path) => [path.id, path]))
const pathBySlug = new Map(academyPaths.map((path) => [path.slug, path]))
const courseById = new Map(academyCourses.map((course) => [course.id, course]))
const courseBySlug = new Map(academyCourses.map((course) => [course.slug, course]))
const moduleById = new Map(academyModules.map((module) => [module.id, module]))
const moduleBySlug = new Map(academyModules.map((module) => [module.slug, module]))
const unitById = new Map(academyUnits.map((unit) => [unit.id, unit]))
const unitBySlug = new Map(academyUnits.map((unit) => [unit.slug, unit]))
const preparationPageById = new Map(academyPreparationPages.map((page) => [page.id, page]))
const preparationPageBySlug = new Map(academyPreparationPages.map((page) => [page.slug, page]))

export function academyPathForId(id: string): AcademyPath | undefined {
  return pathById.get(id as AcademyPathId)
}

export function academyPathForSlug(slug: string): AcademyPath | undefined {
  return pathBySlug.get(slug)
}

export function academyCourseForId(id: string): AcademyCourse | undefined {
  return courseById.get(id as AcademyCourseId)
}

export function academyCourseForSlug(slug: string): AcademyCourse | undefined {
  return courseBySlug.get(slug)
}

export function academyModuleForId(id: string): AcademyModule | undefined {
  return moduleById.get(id as AcademyModuleId)
}

export function academyModuleForSlug(slug: string): AcademyModule | undefined {
  return moduleBySlug.get(slug)
}

export function academyUnitForId(id: string): AcademyUnit | undefined {
  return unitById.get(id as AcademyUnitId)
}

export function academyUnitForSlug(slug: string): AcademyUnit | undefined {
  return unitBySlug.get(slug)
}

export function academyPreparationPageForId(id: string): AcademyPreparationPage | undefined {
  return preparationPageById.get(id as AcademyPreparationPageId)
}

export function academyPreparationPageForSlug(slug: string): AcademyPreparationPage | undefined {
  return preparationPageBySlug.get(slug)
}

export function academyPathOwnsCourse(pathId: string, courseId: string): boolean {
  return academyCourseForId(courseId)?.pathId === pathId
}

export function academyCourseOwnsModule(courseId: string, moduleId: string): boolean {
  return academyModuleForId(moduleId)?.courseId === courseId
}

export function academyModuleOwnsUnit(moduleId: string, unitId: string): boolean {
  return academyUnitForId(unitId)?.moduleId === moduleId
}

export function academyCourseOwnsPreparationPage(courseId: string, pageId: string): boolean {
  return academyPreparationPageForId(pageId)?.courseId === courseId
}

export function academyCourseForRoute(pathSlug: string, courseSlug: string): AcademyCourse | undefined {
  const path = academyPathForSlug(pathSlug)
  const course = academyCourseForSlug(courseSlug)
  return path && course && academyPathOwnsCourse(path.id, course.id) ? course : undefined
}

export function academyModuleForRoute(
  pathSlug: string,
  courseSlug: string,
  moduleSlug: string,
): AcademyModule | undefined {
  const course = academyCourseForRoute(pathSlug, courseSlug)
  const module = academyModuleForSlug(moduleSlug)
  return course && module && academyCourseOwnsModule(course.id, module.id) ? module : undefined
}

export function academyUnitForRoute(
  pathSlug: string,
  courseSlug: string,
  moduleSlug: string,
  unitSlug: string,
): AcademyUnit | undefined {
  const module = academyModuleForRoute(pathSlug, courseSlug, moduleSlug)
  const unit = academyUnitForSlug(unitSlug)
  return module && unit && academyModuleOwnsUnit(module.id, unit.id) ? unit : undefined
}

export function academyPreparationPageForRoute(
  pathSlug: string,
  courseSlug: string,
  pageSlug: string,
): AcademyPreparationPage | undefined {
  const course = academyCourseForRoute(pathSlug, courseSlug)
  const page = academyPreparationPageForSlug(pageSlug)
  return course && page && academyCourseOwnsPreparationPage(course.id, page.id) ? page : undefined
}

export const academyManifest = Object.freeze({
  paths: academyPaths,
  courses: academyCourses,
  modules: academyModules,
  units: academyUnits,
  preparationPages: academyPreparationPages,
})

function assertNonEmpty(value: string, field: string, owner: string): void {
  if (value.trim().length === 0) throw new Error(`Empty academy ${field}: ${owner}.`)
}

function assertUnique(values: readonly string[], kind: string): void {
  if (new Set(values).size !== values.length) throw new Error(`Duplicate academy ${kind}.`)
}

function validateAcademyManifest(): void {
  const records: readonly AcademyRecordMetadata[] = [
    ...academyPaths,
    ...academyCourses,
    ...academyModules,
    ...academyUnits,
    ...academyPreparationPages,
  ]

  assertUnique(records.map((record) => record.id), 'ID')
  assertUnique(records.map((record) => record.slug), 'slug')
  assertUnique(academyConceptIds, 'concept ID')
  assertUnique(academyCourses.flatMap((course) => course.optionalPreparation.map((choice) => choice.id)), 'preparation choice ID')

  for (const record of records) {
    for (const [field, value] of Object.entries({
      id: record.id,
      slug: record.slug,
      title: record.title,
      summary: record.summary,
      outcome: record.outcome,
      time: record.time,
      activity: record.activity,
      platform: record.platform,
    })) {
      assertNonEmpty(value, field, record.id)
    }
  }

  for (const path of academyPaths) {
    if (path.courseIds.length === 0) throw new Error(`Academy path has no courses: ${path.id}.`)
    for (const courseId of path.courseIds) {
      if (!academyPathOwnsCourse(path.id, courseId)) throw new Error(`Academy path does not own course: ${courseId}.`)
    }
  }

  for (const course of academyCourses) {
    if (!academyPathForId(course.pathId)?.courseIds.includes(course.id)) {
      throw new Error(`Academy course has no path owner: ${course.id}.`)
    }
    if (course.moduleIds.length === 0) throw new Error(`Academy course has no modules: ${course.id}.`)
    for (const moduleId of course.moduleIds) {
      if (!academyCourseOwnsModule(course.id, moduleId)) throw new Error(`Academy course does not own module: ${moduleId}.`)
    }

    const preparationKinds = course.optionalPreparation.map((choice) => choice.kind)
    if (
      course.optionalPreparation.length !== 3
      || preparationKinds[0] !== 'start'
      || preparationKinds[1] !== 'refresher'
      || preparationKinds[2] !== 'short-context'
    ) {
      throw new Error(`Academy course has invalid optional preparation: ${course.id}.`)
    }

    for (const choice of course.optionalPreparation) {
      assertNonEmpty(choice.id, 'preparation choice ID', course.id)
      assertNonEmpty(choice.label, 'preparation label', choice.id)
      assertNonEmpty(choice.summary, 'preparation summary', choice.id)
      if (choice.destination.kind === 'unit') {
        if (academyUnitForId(choice.destination.id)?.courseId !== course.id) {
          throw new Error(`Academy preparation unit belongs to another course: ${choice.id}.`)
        }
      } else if (!academyCourseOwnsPreparationPage(course.id, choice.destination.id)) {
        throw new Error(`Academy preparation page belongs to another course: ${choice.id}.`)
      }
    }
  }

  for (const module of academyModules) {
    const course = academyCourseForId(module.courseId)
    if (!course || module.pathId !== course.pathId || !course.moduleIds.includes(module.id)) {
      throw new Error(`Academy module has no course owner: ${module.id}.`)
    }
    if (module.unitIds.length === 0) throw new Error(`Academy module has no units: ${module.id}.`)
    for (const unitId of module.unitIds) {
      if (!academyModuleOwnsUnit(module.id, unitId)) throw new Error(`Academy module does not own unit: ${unitId}.`)
    }
  }

  for (const unit of academyUnits) {
    const module = academyModuleForId(unit.moduleId)
    if (
      !module
      || unit.courseId !== module.courseId
      || unit.pathId !== module.pathId
      || !module.unitIds.includes(unit.id)
    ) {
      throw new Error(`Academy unit has no module owner: ${unit.id}.`)
    }
    if (!Number.isInteger(unit.xp) || unit.xp <= 0) throw new Error(`Invalid academy unit XP: ${unit.id}.`)
  }

  for (const page of academyPreparationPages) {
    const course = academyCourseForId(page.courseId)
    const returnUnit = academyUnitForId(page.returnUnitId)
    if (!course || page.pathId !== course.pathId || returnUnit?.courseId !== page.courseId) {
      throw new Error(`Academy preparation page has no course owner: ${page.id}.`)
    }
    if (page.content.length === 0) throw new Error(`Academy preparation page has no content: ${page.id}.`)
    page.content.forEach((paragraph, index) => assertNonEmpty(paragraph, `content ${index + 1}`, page.id))
  }
}

validateAcademyManifest()
