import { cppCompiledProjectManifest } from './cpp-compiled-project-manifest'
import { csharpWorkshopProjectManifest } from './csharp-workshop-project-manifest'
import { javaPicnicProjectManifest } from './java-picnic-project-manifest'
import {
  publishedLearningSequences,
  publishedProjectUnitsForLanguage,
} from './learning-sequence'
import { pythonInteractiveProjectManifest } from './python-interactive-project-manifest'
import type { GuidedProjectManifest } from './project-types'
import type { LanguageId } from '../types'

const registeredProjectManifests: readonly GuidedProjectManifest[] = [
  pythonInteractiveProjectManifest,
  cppCompiledProjectManifest,
  csharpWorkshopProjectManifest,
  javaPicnicProjectManifest,
]

export function projectRouteKey(language: LanguageId, projectId: string): string {
  return `${language}:${projectId}`
}

export function orderProjectManifestsForLearningSequence(
  manifests: readonly GuidedProjectManifest[],
): readonly GuidedProjectManifest[] {
  const byRoute = new Map<string, GuidedProjectManifest>()
  manifests.forEach((manifest) => {
    const key = projectRouteKey(manifest.language, manifest.id)
    if (byRoute.has(key)) throw new Error(`Duplicate project manifest: ${key}.`)
    byRoute.set(key, manifest)
  })

  const ordered = publishedLearningSequences.flatMap((sequence) => (
    publishedProjectUnitsForLanguage(sequence.language).map((unit) => {
      const key = projectRouteKey(sequence.language, unit.projectId)
      const manifest = byRoute.get(key)
      if (!manifest) throw new Error(`Published project manifest is missing: ${key}.`)
      byRoute.delete(key)
      return manifest
    })
  ))

  if (byRoute.size > 0) {
    throw new Error(`Project manifest is not in the public learning sequence: ${byRoute.keys().next().value}.`)
  }
  return Object.freeze(ordered)
}

export const projectManifests = orderProjectManifestsForLearningSequence(
  registeredProjectManifests,
)

const projectManifestsByRoute = new Map(
  projectManifests.map((manifest) => [projectRouteKey(manifest.language, manifest.id), manifest]),
)

export function projectManifestByRoute(
  language: LanguageId,
  projectId: string,
): GuidedProjectManifest | undefined {
  return projectManifestsByRoute.get(projectRouteKey(language, projectId))
}

export function projectManifestsForLanguage(
  language: LanguageId,
): readonly GuidedProjectManifest[] {
  return publishedProjectUnitsForLanguage(language).flatMap((unit) => {
    const manifest = projectManifestByRoute(language, unit.projectId)
    return manifest ? [manifest] : []
  })
}
