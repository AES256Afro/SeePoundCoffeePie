/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { build } from 'vite'
import {
  PYTHON_DATA_TOOLS_ASSESSMENT_PROFILE,
  pythonDataToolsServerAssessment,
} from './python-data-tools.server'

const publicCourseSource = readFileSync(
  new URL('./python-data-tools-course.ts', import.meta.url),
  'utf8',
)

const serverOnlyMarkers = [
  PYTHON_DATA_TOOLS_ASSESSMENT_PROFILE,
  pythonDataToolsServerAssessment.testCases[0].id,
  pythonDataToolsServerAssessment.structuralChecks[0].message,
]

describe('Python Data Tools assessment bundle boundary', () => {
  it('keeps the server module and trusted profile out of public course source', () => {
    expect(publicCourseSource).not.toContain('python-data-tools.server')
    expect(publicCourseSource).not.toContain('analysisProfile')
    expect(publicCourseSource).not.toContain('structuralChecks')
    for (const marker of serverOnlyMarkers) expect(publicCourseSource).not.toContain(marker)
  })

  it('keeps server-owned assessment code out of all emitted browser assets', async () => {
    const result = await build({
      logLevel: 'silent',
      build: {
        write: false,
      },
    })
    const outputs = (Array.isArray(result) ? result : [result])
      .flatMap((output) => ('output' in output ? output.output : []))
    const chunks = outputs.filter((output) => output.type === 'chunk')
    const emittedModuleIds = chunks.flatMap((output) => (
      output.type === 'chunk' ? Object.keys(output.modules) : []
    ))
    const emittedAssets = outputs.map((output) => (
      output.type === 'chunk' ? output.code : String(output.source)
    )).join('\n')

    expect(emittedModuleIds.some((moduleId) => (
      moduleId.endsWith('/src/data/python-data-tools.server.ts')
    ))).toBe(false)
    for (const marker of serverOnlyMarkers) expect(emittedAssets).not.toContain(marker)
  }, 30_000)
})
