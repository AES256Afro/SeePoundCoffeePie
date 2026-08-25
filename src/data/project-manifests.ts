import { cppCompiledProjectManifest } from './cpp-compiled-project-manifest'
import { pythonInteractiveProjectManifest } from './python-interactive-project-manifest'
import type { GuidedProjectManifest } from './project-types'
import type { LanguageId } from '../types'

export const projectManifests: readonly GuidedProjectManifest[] = [
  pythonInteractiveProjectManifest,
  cppCompiledProjectManifest,
]

export function projectManifestByRoute(
  language: LanguageId,
  projectId: string,
): GuidedProjectManifest | undefined {
  return projectManifests.find((project) => (
    project.language === language && project.id === projectId
  ))
}

export function projectManifestForLanguage(
  language: LanguageId,
): GuidedProjectManifest | undefined {
  return projectManifests.find((project) => project.language === language)
}
