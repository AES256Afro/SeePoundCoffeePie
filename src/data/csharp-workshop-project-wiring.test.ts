/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { build } from 'vite'
import { parseAppRoute, projectPath } from '../lib/routes'
import { projectManifestByRoute } from './project-manifests'
import { loadGuidedProject } from './project-registry'
import { csharpWorkshopProjectServerAssessment } from './csharp-workshop-project.server'

const publicManifestSource = readFileSync(
  new URL('./csharp-workshop-project-manifest.ts', import.meta.url),
  'utf8',
)
const publicCurriculumSource = readFileSync(
  new URL('./csharp-workshop-project.ts', import.meta.url),
  'utf8',
)
const publicProjectSource = `${publicManifestSource}\n${publicCurriculumSource}`

const privateMarkers = csharpWorkshopProjectServerAssessment.testCases
  .filter((testCase) => testCase.visibility === 'hidden')
  .flatMap((testCase) => {
    const [privateName] = testCase.stdin.trimEnd().split('\n')
    return [testCase.id, privateName, testCase.stdin, testCase.expectedStdout]
  })

describe('Phase 4C C# project public wiring', () => {
  it('resolves one C# manifest through the public project registry', () => {
    const manifest = projectManifestByRoute('csharp', 'workshop-check-in')

    expect(manifest).toMatchObject({
      id: 'workshop-check-in',
      language: 'csharp',
      route: '/projects/csharp/workshop-check-in',
      title: 'Community Workshop Check-In',
      downloadFileName: 'community-workshop-check-in.cs',
    })
    expect(manifest?.checkpoints).toHaveLength(12)
    expect(projectManifestByRoute('csharp', 'first-interactive-program')).toBeUndefined()
  })

  it('loads the complete project through the real asynchronous loader', async () => {
    const project = await loadGuidedProject('csharp', 'workshop-check-in')

    expect(project).toBeDefined()
    expect(project?.id).toBe('workshop-check-in')
    expect(project?.language).toBe('csharp')
    expect(project?.checkpoints).toHaveLength(12)
    expect(project?.checkpoints.map((checkpoint) => checkpoint.order)).toEqual(
      Array.from({ length: 12 }, (_, index) => index + 1),
    )
    await expect(loadGuidedProject('csharp', 'missing-project')).resolves.toBeUndefined()
  })

  it('parses the bookmarkable C# overview and final-checkpoint deep links', () => {
    expect(projectPath('csharp', 'workshop-check-in')).toBe('/projects/csharp/workshop-check-in')
    expect(projectPath('csharp', 'workshop-check-in', 'project-csharp-final')).toBe(
      '/projects/csharp/workshop-check-in/project-csharp-final',
    )
    expect(parseAppRoute('/projects/csharp/workshop-check-in')).toEqual({
      page: 'project',
      language: 'csharp',
      projectId: 'workshop-check-in',
      checkpointId: undefined,
      conceptIds: [],
    })
    expect(parseAppRoute('/projects/csharp/workshop-check-in/project-csharp-final')).toEqual({
      page: 'project',
      language: 'csharp',
      projectId: 'workshop-check-in',
      checkpointId: 'project-csharp-final',
      conceptIds: [],
    })
  })

  it('keeps the twelve-checkpoint manifest and public final summary aligned', async () => {
    const manifest = projectManifestByRoute('csharp', 'workshop-check-in')
    const project = await loadGuidedProject('csharp', 'workshop-check-in')
    const finalCheckpoint = project?.checkpoints.at(-1)

    expect(project?.checkpoints.map((checkpoint) => ({
      id: checkpoint.id,
      order: checkpoint.order,
      title: checkpoint.title,
      conceptId: checkpoint.exercise.conceptId,
      xp: checkpoint.exercise.xp,
    }))).toEqual(manifest?.checkpoints)
    expect(finalCheckpoint?.id).toBe('project-csharp-final')
    expect(finalCheckpoint?.assessmentSummary).toEqual({
      visibleTestCase: {
        id: 'final-visible-returning-member',
        name: 'A returning workshop member',
        visibility: 'visible',
        stdin: 'Alex Kim\n4\n',
        expectedStdout: [
          'What is your name?',
          'How many visits have you completed?',
          'Access: Member',
          'Area: Studio',
          'Area: Lab',
          'Area: Library',
          'Badge: Alex Kim | Visits: 4',
        ].join('\n'),
        purpose: 'Shows one complete returning-member check-in before the official check uses other visitor details.',
      },
      hiddenTestCount: 3,
      structuralCheckCount: 8,
    })
    expect(finalCheckpoint?.practiceStdin).toBe(finalCheckpoint?.assessmentSummary?.visibleTestCase.stdin)
  })

  it('keeps server-owned cases and the complete reference solution out of public source', () => {
    expect(publicProjectSource).not.toContain(csharpWorkshopProjectServerAssessment.referenceSolution)
    expect(publicProjectSource).not.toContain('hiddenTestCases')
    expect(publicProjectSource).not.toContain('referenceSolution')

    for (const marker of privateMarkers) {
      expect(publicProjectSource, `public C# source must not contain ${JSON.stringify(marker)}`).not.toContain(marker)
    }
  })

  it('keeps server-only markers out of the emitted C# production chunk', async () => {
    const result = await build({
      logLevel: 'silent',
      build: {
        write: false,
      },
    })
    const outputs = (Array.isArray(result) ? result : [result])
      .flatMap((output) => ('output' in output ? output.output : []))
    const chunks = outputs.filter((output) => output.type === 'chunk')
    const csharpChunks = chunks.filter((output) => (
      output.type === 'chunk'
      && output.facadeModuleId?.endsWith('/src/data/csharp-workshop-project.ts')
    ))

    expect(csharpChunks).toHaveLength(1)
    const emittedCsharp = csharpChunks[0].type === 'chunk' ? csharpChunks[0].code : ''
    const emittedProductionAssets = outputs.map((output) => (
      output.type === 'chunk' ? output.code : String(output.source)
    )).join('\n')
    const emittedModuleIds = chunks.flatMap((output) => (
      output.type === 'chunk' ? Object.keys(output.modules) : []
    ))
    expect(emittedCsharp).toContain('Community Workshop Check-In')
    expect(emittedModuleIds.some((moduleId) => (
      moduleId.endsWith('/src/data/csharp-workshop-project.server.ts')
    ))).toBe(false)
    expect(emittedProductionAssets).not.toContain(csharpWorkshopProjectServerAssessment.referenceSolution)
    expect(emittedProductionAssets).not.toContain(
      JSON.stringify(csharpWorkshopProjectServerAssessment.referenceSolution),
    )

    for (const marker of privateMarkers) {
      expect(
        emittedProductionAssets,
        `production assets must not contain ${JSON.stringify(marker)}`,
      ).not.toContain(marker)
    }
  }, 30_000)
})
