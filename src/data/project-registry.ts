import type { GuidedProject } from './project-types'
import type { LanguageId } from '../types'

export async function loadGuidedProject(
  language: LanguageId,
  projectId: string,
): Promise<GuidedProject | undefined> {
  if (language === 'python' && projectId === 'first-interactive-program') {
    const module = await import('./python-interactive-project')
    return module.pythonInteractiveProject
  }
  if (language === 'cpp' && projectId === 'first-compiled-program') {
    const module = await import('./cpp-compiled-project')
    return module.cppCompiledProject
  }
  return undefined
}
