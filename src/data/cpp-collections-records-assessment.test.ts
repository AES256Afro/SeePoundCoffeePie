/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { build } from 'vite'
import {
  CPP_COLLECTIONS_RECORDS_ASSESSMENT_PROFILE,
  cppCollectionsRecordsServerAssessment,
} from './cpp-collections-records.server'
import {
  evaluateRunnerStructuralChecks,
  findRunnerAssignment,
  registerRunnerAssignment,
  type CppCollectionsAnalysis,
  type RunnerAssignment,
} from '../lib/runner-assignments'

const expectedOutput = 'Parts: 3\nTotal units: 17\nLow stock: seals'

function analysis(overrides: Partial<CppCollectionsAnalysis> = {}): CppCollectionsAnalysis {
  return {
    version: 1,
    profile: CPP_COLLECTIONS_RECORDS_ASSESSMENT_PROFILE,
    analyzed: true,
    parsed: true,
    authored_frame: true,
    part_record: true,
    restock: true,
    total_units: true,
    low_stock: true,
    supplied_harness: true,
    ...overrides,
  }
}

function privateAssignment(language: RunnerAssignment['language'] = 'cpp'): RunnerAssignment {
  return {
    exerciseId: 'private-cpp-collections-assessment',
    language,
    kind: 'academy',
    expectedOutput,
    assessment: cppCollectionsRecordsServerAssessment,
    exercise: {
      id: 'private-cpp-collections-assessment',
      conceptId: 'private-cpp-collections-assessment',
      eyebrow: 'Private runner test',
      title: 'Private runner test',
      explanation: 'Server-only test assignment.',
      analogy: 'Server-only test assignment.',
      type: 'code',
      prompt: 'Complete the private test.',
      starterCode: 'int main() { return 0; }',
      focus: 'Complete the private test.',
      codeGuide: [],
      checks: [],
      output: expectedOutput,
      hint: 'Private test.',
      recap: 'Private test.',
      xp: 0,
    },
  }
}

describe('private C++ collections assessment', () => {
  it('locks one visible case and six closed structural checks', () => {
    expect(cppCollectionsRecordsServerAssessment).toMatchObject({
      language: 'cpp',
      analysisProfile: CPP_COLLECTIONS_RECORDS_ASSESSMENT_PROFILE,
    })
    expect(cppCollectionsRecordsServerAssessment.testCases).toEqual([
      expect.objectContaining({ visibility: 'visible', stdin: '', expectedStdout: expectedOutput }),
    ])
    expect(cppCollectionsRecordsServerAssessment.structuralChecks).toHaveLength(6)
    expect(new Set(cppCollectionsRecordsServerAssessment.structuralChecks.map((check) => (
      check.validation
    ))).size).toBe(6)
  })

  it('maps every closed analyzer fact to exactly one protected requirement', () => {
    const facts: Array<keyof Pick<
      CppCollectionsAnalysis,
      'authored_frame' | 'part_record' | 'restock' | 'total_units' | 'low_stock' | 'supplied_harness'
    >> = ['authored_frame', 'part_record', 'restock', 'total_units', 'low_stock', 'supplied_harness']

    expect(evaluateRunnerStructuralChecks(
      cppCollectionsRecordsServerAssessment,
      analysis(),
    ).every((result) => result.passed)).toBe(true)
    for (const [index, fact] of facts.entries()) {
      const results = evaluateRunnerStructuralChecks(
        cppCollectionsRecordsServerAssessment,
        analysis({ [fact]: false }),
      )
      expect(results.map((result) => result.passed)).toEqual(
        facts.map((_candidate, candidateIndex) => candidateIndex !== index),
      )
    }
  })

  it('fails closed on missing, wrong-profile, unparsed, or unanalyzed evidence', () => {
    const unavailable = [
      null,
      analysis({ profile: 'wrong-profile' as CppCollectionsAnalysis['profile'] }),
      analysis({ parsed: false }),
      analysis({ analyzed: false }),
    ]
    for (const value of unavailable) {
      expect(evaluateRunnerStructuralChecks(
        cppCollectionsRecordsServerAssessment,
        value,
      ).every((result) => !result.passed)).toBe(true)
    }
  })

  it('allows the private profile only on a C++ assignment', () => {
    const registry = new Map<string, RunnerAssignment>()
    registerRunnerAssignment(registry, privateAssignment())
    expect(registry.size).toBe(1)
    expect(() => registerRunnerAssignment(
      new Map<string, RunnerAssignment>(),
      privateAssignment('python'),
    )).toThrow('mismatched assessment language')
  })

  it('publishes the protected capstone only through its C++ runner assignment', () => {
    expect(findRunnerAssignment('cpprecords6-workshop-stock-report')).toMatchObject({
      exerciseId: 'cpprecords6-workshop-stock-report',
      language: 'cpp',
      kind: 'academy',
      assessment: cppCollectionsRecordsServerAssessment,
    })
  })
})

const publicCourseSource = readFileSync(
  new URL('./cpp-collections-records-course-draft.ts', import.meta.url),
  'utf8',
)
const serverOnlyMarkers = [
  CPP_COLLECTIONS_RECORDS_ASSESSMENT_PROFILE,
  cppCollectionsRecordsServerAssessment.testCases[0].id,
  cppCollectionsRecordsServerAssessment.structuralChecks[0].message,
]

describe('private C++ collections assessment bundle boundary', () => {
  it('keeps trusted wiring out of published teaching source', () => {
    expect(publicCourseSource).not.toContain('cpp-collections-records.server')
    expect(publicCourseSource).not.toContain('analysisProfile')
    for (const marker of serverOnlyMarkers) expect(publicCourseSource).not.toContain(marker)
  })

  it('keeps the server assessment and analyzer contract out of browser assets', async () => {
    const result = await build({ logLevel: 'silent', build: { write: false } })
    const outputs = (Array.isArray(result) ? result : [result])
      .flatMap((output) => ('output' in output ? output.output : []))
    const chunks = outputs.filter((output) => output.type === 'chunk')
    const moduleIds = chunks.flatMap((output) => (
      output.type === 'chunk' ? Object.keys(output.modules) : []
    ))
    const assets = outputs.map((output) => (
      output.type === 'chunk' ? output.code : String(output.source)
    )).join('\n')

    expect(moduleIds.some((moduleId) => (
      moduleId.endsWith('/src/data/cpp-collections-records.server.ts')
    ))).toBe(false)
    for (const marker of serverOnlyMarkers) expect(assets).not.toContain(marker)
    expect(assets).not.toContain('CppCollectionsAnalyzer.py')
  }, 30_000)
})
