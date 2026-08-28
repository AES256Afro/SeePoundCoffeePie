import type { Plugin } from 'vite'

import type { ControlledPublicationSources } from './controlled-course-publication.mjs'

export type ControlledPublicationKey = keyof ControlledPublicationSources

export interface ControlledPublicationSelectionEntry {
  readonly selector: string
  readonly selected: string
}

export type ControlledPublicationAppSelection = Readonly<
  Record<ControlledPublicationKey, ControlledPublicationSelectionEntry>
>

export const controlledPublicationSelectorSourcePaths: Readonly<
  Record<ControlledPublicationKey, string>
>

export function controlledPublicationAppSelection(
  sources: ControlledPublicationSources,
): ControlledPublicationAppSelection

export function controlledPublicationReplacement(
  selection: ControlledPublicationAppSelection,
  moduleId: unknown,
): string | null

export function controlledPublicationSelector(
  sources: ControlledPublicationSources,
  name?: string,
): Plugin
