import type {
  PrivateCourseReleaseEntry,
  PrivateCourseReleaseState,
} from './unpublished-cpp-release-boundary.mjs'

export interface ControlledPublicationSources {
  readonly continuingCourses: string
  readonly codebookContributions: string
  readonly runnerAssignments: string
}

export interface ControlledCoursePublication {
  readonly sources: ControlledPublicationSources
  readonly routes: readonly string[]
}

export function controlledPublicationSources(
  releaseState: unknown,
): ControlledPublicationSources

export function publicControlledCourseRoutes(
  releaseCatalog: unknown,
): readonly string[]

export function controlledCoursePublication(
  releaseCatalog: unknown,
): ControlledCoursePublication

export const productionControlledPublication: ControlledCoursePublication
export const productionControlledPublicationSources: ControlledPublicationSources
export const productionControlledCourseRoutes: readonly string[]

export type ControlledPrivateCourseEntry = PrivateCourseReleaseEntry
export type ControlledPrivateCourseState = PrivateCourseReleaseState
