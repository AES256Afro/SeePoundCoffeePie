import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = fileURLToPath(new URL('../', import.meta.url))

export const controlledPublicationSelectorSourcePaths = Object.freeze({
  continuingCourses: 'src/data/controlled-continuing-course-publication.ts',
  codebookContributions: 'src/data/controlled-codebook-publication.ts',
  runnerAssignments: 'src/data/controlled-runner-publication.ts',
})

const publicationKeys = Object.freeze(Object.keys(controlledPublicationSelectorSourcePaths))

function selectedPath(sources, key) {
  const source = sources?.[key]
  if (typeof source !== 'string' || source.length === 0) {
    throw new Error(`Controlled publication source ${key} is missing.`)
  }
  const selected = path.resolve(projectRoot, source)
  const relative = path.relative(projectRoot, selected)
  if (relative.length === 0 || relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Controlled publication source ${key} must stay inside the project.`)
  }
  return selected
}

export function controlledPublicationAppSelection(sources) {
  if (!sources || typeof sources !== 'object' || Array.isArray(sources)) {
    throw new Error('Controlled publication sources must be an object.')
  }
  const suppliedKeys = Object.keys(sources).sort()
  const expectedKeys = [...publicationKeys].sort()
  if (
    suppliedKeys.length !== expectedKeys.length
    || suppliedKeys.some((key, index) => key !== expectedKeys[index])
  ) {
    throw new Error('Controlled publication sources must contain the exact reviewed source set.')
  }

  return Object.freeze(Object.fromEntries(publicationKeys.map((key) => [
    key,
    Object.freeze({
      selector: path.join(projectRoot, controlledPublicationSelectorSourcePaths[key]),
      selected: selectedPath(sources, key),
    }),
  ])))
}

function normalizedSourcePath(moduleId) {
  return path.normalize(moduleId.split(/[?#]/u, 1)[0])
}

export function controlledPublicationReplacement(selection, moduleId) {
  if (typeof moduleId !== 'string' || moduleId.length === 0) return null
  const source = normalizedSourcePath(moduleId)
  return Object.values(selection).find(({ selector }) => (
    path.normalize(selector) === source
  ))?.selected ?? null
}

/**
 * Resolves each checked-in fail-closed facade to the complete source set
 * chosen by the source-controlled release catalog before Vite builds it.
 */
export function controlledPublicationSelector(
  sources,
  name = 'controlled-publication-selector',
) {
  const selection = controlledPublicationAppSelection(sources)
  return {
    name,
    enforce: 'pre',
    async resolveId(source, importer, options) {
      const directReplacement = controlledPublicationReplacement(selection, source)
      if (directReplacement) return directReplacement

      const resolved = await this.resolve(source, importer, {
        ...options,
        skipSelf: true,
      })
      if (!resolved) return null
      return controlledPublicationReplacement(selection, resolved.id)
    },
  }
}
