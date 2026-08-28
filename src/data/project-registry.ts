import { projectManifests, projectRouteKey } from './project-manifests'
import type { GuidedProject } from './project-types'
import type { LanguageId } from '../types'

export interface GuidedProjectLoader {
  language: LanguageId
  load: () => Promise<GuidedProject>
  projectId: string
}

export const guidedProjectLoaders: readonly GuidedProjectLoader[] = [
  {
    language: 'python',
    projectId: 'first-interactive-program',
    load: async () => {
      const module = await import('./python-interactive-project')
      return module.pythonInteractiveProject
    },
  },
  {
    language: 'cpp',
    projectId: 'first-compiled-program',
    load: async () => {
      const module = await import('./cpp-compiled-project')
      return module.cppCompiledProject
    },
  },
  {
    language: 'csharp',
    projectId: 'workshop-check-in',
    load: async () => {
      const module = await import('./csharp-workshop-project')
      return module.csharpWorkshopProject
    },
  },
  {
    language: 'java',
    projectId: 'picnic-planner',
    load: async () => {
      const module = await import('./java-picnic-project')
      return module.javaPicnicProject
    },
  },
]

const loaderByRoute = new Map<string, GuidedProjectLoader>()

guidedProjectLoaders.forEach((registration) => {
  const key = projectRouteKey(registration.language, registration.projectId)
  if (loaderByRoute.has(key)) throw new Error(`Duplicate project loader: ${key}.`)
  loaderByRoute.set(key, registration)
})

const manifestRouteKeys = new Set(
  projectManifests.map((manifest) => projectRouteKey(manifest.language, manifest.id)),
)
if (
  loaderByRoute.size !== manifestRouteKeys.size
  || [...manifestRouteKeys].some((key) => !loaderByRoute.has(key))
  || [...loaderByRoute.keys()].some((key) => !manifestRouteKeys.has(key))
) {
  throw new Error('Published project loaders must exactly match published project manifests.')
}

export async function loadGuidedProject(
  language: LanguageId,
  projectId: string,
): Promise<GuidedProject | undefined> {
  const registration = loaderByRoute.get(projectRouteKey(language, projectId))
  if (!registration) return undefined

  const project = await registration.load()
  return project.language === language && project.id === projectId ? project : undefined
}
