import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  PYTHON_DATA_TOOLS_ASSESSMENT_PROFILE,
  pythonDataToolsServerAssessment,
} from './python-data-tools.server'
import { pythonDataToolsCourse } from './python-data-tools-course'

const analyzerReferenceSource = readFileSync(
  new URL('../../runner/fixtures/python-data-tools-reference.python.txt', import.meta.url),
  'utf8',
).trimEnd()

describe('server-owned Python Data Tools assessment', () => {
  it('uses one visible fixed-data case and six protected structural requirements', () => {
    expect(pythonDataToolsServerAssessment).toMatchObject({
      language: 'python',
      analysisProfile: PYTHON_DATA_TOOLS_ASSESSMENT_PROFILE,
    })
    expect(pythonDataToolsServerAssessment).not.toHaveProperty('referenceSolution')
    expect(pythonDataToolsServerAssessment.testCases).toEqual([
      expect.objectContaining({
        id: 'supply-tracker-visible-report',
        visibility: 'visible',
        stdin: '',
        expectedStdout: 'Products: 2\nTotal units: 17\nRestock: markers',
      }),
    ])
    expect(pythonDataToolsServerAssessment.structuralChecks.map((check) => check.validation)).toEqual([
      'python-data-tools-authored-frame',
      'python-data-tools-normalize-name',
      'python-data-tools-add-stock',
      'python-data-tools-total-stock',
      'python-data-tools-low-stock',
      'python-data-tools-harness',
    ])
    expect(pythonDataToolsServerAssessment.structuralChecks.every((check) => (
      check.message.length > 0 && !check.message.includes('hidden')
    ))).toBe(true)
  })

  it('matches the public capstone output without importing public regex checks into the assessment', () => {
    const capstone = pythonDataToolsCourse.missions
      .flatMap((mission) => mission.exercises)
      .find((exercise) => exercise.id === 'pydata6-supply-tracker')

    expect(capstone).toBeDefined()
    expect(pythonDataToolsServerAssessment.testCases[0].expectedStdout).toBe(capstone?.output)
    expect(capstone?.checks).toHaveLength(5)
    expect(JSON.stringify(pythonDataToolsServerAssessment)).not.toContain('pattern')
    expect(JSON.stringify(pythonDataToolsServerAssessment)).not.toContain('_____')
  })

  it('keeps the image fixture equal to the five completed learner-facing blanks', () => {
    const capstone = pythonDataToolsCourse.missions
      .flatMap((mission) => mission.exercises)
      .find((exercise) => exercise.id === 'pydata6-supply-tracker')
    const answers = [
      'normalize_name(name)',
      'inventory.get(clean_name, 0)',
      'current + amount',
      'amount',
      'names.append(name)',
    ]
    const completed = answers.reduce((source, answer) => source.replace('_____', answer), (
      capstone?.starterCode ?? ''
    ))

    expect(completed).toBe(analyzerReferenceSource)
  })
})
