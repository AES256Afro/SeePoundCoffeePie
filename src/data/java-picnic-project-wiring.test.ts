/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { build } from 'vite'
import { parseAppRoute, projectPath } from '../lib/routes'
import { projectManifestByRoute } from './project-manifests'
import { loadGuidedProject } from './project-registry'
import { javaPicnicProjectServerAssessment } from './java-picnic-project.server'

const publicManifestSource = readFileSync(
  new URL('./java-picnic-project-manifest.ts', import.meta.url),
  'utf8',
)
const publicCurriculumSource = readFileSync(
  new URL('./java-picnic-project.ts', import.meta.url),
  'utf8',
)
const publicProjectSource = `${publicManifestSource}\n${publicCurriculumSource}`

const privateMarkers = javaPicnicProjectServerAssessment.testCases
  .filter((testCase) => testCase.visibility === 'hidden')
  .flatMap((testCase) => {
    const [privateName] = testCase.stdin.trimEnd().split('\n')
    return [testCase.id, testCase.name, privateName, testCase.stdin, testCase.expectedStdout]
  })

describe('Phase 4D Java project public wiring', () => {
  it('resolves one Java manifest through the public project registry', () => {
    const manifest = projectManifestByRoute('java', 'picnic-planner')

    expect(manifest).toMatchObject({
      id: 'picnic-planner',
      language: 'java',
      route: '/projects/java/picnic-planner',
      title: 'Community Picnic Planner',
      downloadFileName: 'Main.java',
    })
    expect(manifest?.checkpoints).toHaveLength(12)
    expect(projectManifestByRoute('java', 'first-interactive-program')).toBeUndefined()
  })

  it('loads the complete project through the real asynchronous loader', async () => {
    const project = await loadGuidedProject('java', 'picnic-planner')

    expect(project).toBeDefined()
    expect(project?.id).toBe('picnic-planner')
    expect(project?.language).toBe('java')
    expect(project?.checkpoints).toHaveLength(12)
    expect(project?.checkpoints.map((checkpoint) => checkpoint.order)).toEqual(
      Array.from({ length: 12 }, (_, index) => index + 1),
    )
    await expect(loadGuidedProject('java', 'missing-project')).resolves.toBeUndefined()
  })

  it('parses the bookmarkable Java overview and final-checkpoint deep links', () => {
    expect(projectPath('java', 'picnic-planner')).toBe('/projects/java/picnic-planner')
    expect(projectPath('java', 'picnic-planner', 'project-java-final')).toBe(
      '/projects/java/picnic-planner/project-java-final',
    )
    expect(parseAppRoute('/projects/java/picnic-planner')).toEqual({
      page: 'project',
      language: 'java',
      projectId: 'picnic-planner',
      checkpointId: undefined,
      conceptIds: [],
    })
    expect(parseAppRoute('/projects/java/picnic-planner/project-java-final')).toEqual({
      page: 'project',
      language: 'java',
      projectId: 'picnic-planner',
      checkpointId: 'project-java-final',
      conceptIds: [],
    })
  })

  it('keeps the twelve-checkpoint manifest and public final summary aligned', async () => {
    const manifest = projectManifestByRoute('java', 'picnic-planner')
    const project = await loadGuidedProject('java', 'picnic-planner')
    const finalCheckpoint = project?.checkpoints.at(-1)

    expect(project?.checkpoints.map((checkpoint) => ({
      id: checkpoint.id,
      order: checkpoint.order,
      title: checkpoint.title,
      conceptId: checkpoint.exercise.conceptId,
      xp: checkpoint.exercise.xp,
    }))).toEqual(manifest?.checkpoints)
    expect(finalCheckpoint?.id).toBe('project-java-final')
    expect(finalCheckpoint?.assessmentSummary).toEqual({
      visibleTestCase: {
        id: 'final-visible-ten-guests',
        name: 'A ten-person picnic',
        visibility: 'visible',
        stdin: 'Alex Kim\n10\n',
        expectedStdout: [
          'What is your name?',
          'How many guests are coming?',
          'Table: Large',
          'Supply: Blankets',
          'Supply: Cups',
          'Supply: Napkins',
          'Picnic: Alex Kim | Guests: 10',
        ].join('\n'),
        purpose: 'Shows one complete large-table plan before the official check uses other organizer details.',
      },
      hiddenTestCount: 3,
      structuralCheckCount: 9,
    })
    expect(finalCheckpoint?.practiceStdin).toBe(finalCheckpoint?.assessmentSummary?.visibleTestCase.stdin)
  })

  it('keeps server-owned cases and the complete reference solution out of public source', () => {
    expect(publicProjectSource).not.toContain(javaPicnicProjectServerAssessment.referenceSolution)
    expect(publicProjectSource).not.toContain('hiddenTestCases')
    expect(publicProjectSource).not.toContain('referenceSolution')

    for (const marker of privateMarkers) {
      expect(publicProjectSource, `public Java source must not contain ${JSON.stringify(marker)}`).not.toContain(marker)
    }
  })

  it('keeps server-only markers out of the emitted Java production chunk', async () => {
    const result = await build({
      logLevel: 'silent',
      build: {
        write: false,
      },
    })
    const outputs = (Array.isArray(result) ? result : [result])
      .flatMap((output) => ('output' in output ? output.output : []))
    const chunks = outputs.filter((output) => output.type === 'chunk')
    const javaChunks = chunks.filter((output) => (
      output.type === 'chunk'
      && output.facadeModuleId?.endsWith('/src/data/java-picnic-project.ts')
    ))

    expect(javaChunks).toHaveLength(1)
    const emittedJava = javaChunks[0].type === 'chunk' ? javaChunks[0].code : ''
    const emittedProductionAssets = outputs.map((output) => (
      output.type === 'chunk' ? output.code : String(output.source)
    )).join('\n')
    const emittedModuleIds = chunks.flatMap((output) => (
      output.type === 'chunk' ? Object.keys(output.modules) : []
    ))
    expect(emittedJava).toContain('Community Picnic Planner')
    expect(emittedModuleIds.some((moduleId) => (
      moduleId.endsWith('/src/data/java-picnic-project.server.ts')
    ))).toBe(false)
    expect(emittedProductionAssets).not.toContain(javaPicnicProjectServerAssessment.referenceSolution)
    expect(emittedProductionAssets).not.toContain(
      JSON.stringify(javaPicnicProjectServerAssessment.referenceSolution),
    )

    for (const marker of privateMarkers) {
      expect(
        emittedProductionAssets,
        `production assets must not contain ${JSON.stringify(marker)}`,
      ).not.toContain(marker)
    }
  }, 30_000)
})
