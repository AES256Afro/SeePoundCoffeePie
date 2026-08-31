import { describe, expect, it } from 'vitest'
import { academyUnitIds, type AcademyUnitId } from './academy-manifest'
import {
  academyAnatomyLabels,
  academyContentForUnit,
  academyContentObservedAt,
  academyContentReviewDueAt,
  academyContentValidationErrors,
  academySourceRecords,
  academySourcesForUnit,
  academyUnitContent,
  assertValidAcademyContent,
  realitySectionLabels,
  type AcademySourceRecord,
  type AcademyUnitContent,
} from './academy-content'

function mutableContent(): AcademyUnitContent[] {
  return structuredClone(academyUnitContent) as AcademyUnitContent[]
}

function mutableSources(): AcademySourceRecord[] {
  return structuredClone(academySourceRecords) as AcademySourceRecord[]
}

describe('academy learner-facing content', () => {
  it('covers the exact eight manifest units in manifest order', () => {
    expect(academyUnitContent.map((unit) => unit.unitId)).toEqual(academyUnitIds)
    expect(academyUnitContent.slice(0, 6).map((unit) => unit.unitId)).toEqual([
      'LM-101-U1',
      'LM-101-U2',
      'LM-101-U3',
      'LM-101-U4',
      'LM-101-U5',
      'LML-101',
    ])
    expect(academyUnitContent.slice(6).map((unit) => unit.unitId)).toEqual([
      'RVF-101',
      'RVF-102',
    ])
    expect(academyContentValidationErrors()).toEqual([])
    expect(() => assertValidAcademyContent()).not.toThrow()
  })

  it('uses the full stable anatomy in order and defines words before examples', () => {
    for (const unit of academyUnitContent) {
      expect(unit.anatomyOrder, unit.unitId).toEqual(academyAnatomyLabels)
      expect(unit.anatomyOrder.indexOf('Words on this page')).toBeLessThan(
        unit.anatomyOrder.indexOf('Concrete example'),
      )
      expect(unit.anatomyOrder.indexOf('Expected result and recovery')).toBeLessThan(
        unit.anatomyOrder.indexOf('Feedback and retry'),
      )
      expect(unit.words.length, unit.unitId).toBeGreaterThanOrEqual(3)
      for (const word of unit.words) {
        expect(word.term.trim()).not.toBe('')
        expect(word.definition.trim()).not.toBe('')
        expect(word.example.trim()).not.toBe('')
      }
      expect(unit.explanationSteps.length, unit.unitId).toBeGreaterThanOrEqual(4)
      expect(unit.recap.length, unit.unitId).toBeGreaterThanOrEqual(2)
      expect(unit.notClaimed.length, unit.unitId).toBeGreaterThanOrEqual(2)
    }
  })

  it('publishes complete Model or Not prepared evidence and direct recovery', () => {
    const lab = academyContentForUnit('LML-101')
    expect(lab.anatomyKind).toBe('prepared-lab')
    expect(lab.practice.id).toBe('lml-101-model-or-not')
    expect(lab.practice.preparedEvidence).toHaveLength(6)
    expect(lab.practice.steps).toHaveLength(7)
    expect(lab.practice.expectedResult).toContain('1 ordinary rule')
    expect(lab.practice.expectedResult).toContain('3 not enough information')
    expect(lab.practice.recovery).toContain('Restarting the page is unnecessary')
    expect(lab.notClaimed).toContain('The lab ran or evaluated any software or model.')
  })

  it('keeps every activity L0, browser-only, prepared, and free of page-side operations', () => {
    for (const unit of academyUnitContent) {
      expect(unit.boundary.riskClass, unit.unitId).toBe('L0')
      expect(unit.scope.environment, unit.unitId).toBe('browser-only prepared evidence')
      expect(unit.scope.changes, unit.unitId).toBe('No files, accounts, devices, networks, or services change.')
      expect(unit.boundary.statement, unit.unitId).toBe(
        'This page shows prepared text only. It does not run code, a model, inference, or training. Inference means using a model to produce an output. Training means adjusting a model from examples.',
      )
      expect(Object.values(unit.boundary.pageOperations), unit.unitId).toEqual([
        false,
        false,
        false,
        false,
        false,
        false,
      ])
      expect(unit.practice.preparedEvidence.length, unit.unitId).toBeGreaterThan(0)
      expect(unit.practice.expectedResult.trim(), unit.unitId).not.toBe('')
      expect(unit.practice.recovery.trim(), unit.unitId).not.toBe('')
    }
  })

  it('keeps access open and preparation optional', () => {
    for (const unit of academyUnitContent) {
      expect(unit.access, unit.unitId).toBe('open')
      expect(unit.preparation.startNow).toContain('Every fact needed')
      expect(unit.preparation.refresher).toContain('optional')
      expect(unit.preparation.shortContext).toContain('return here')
    }
  })

  it('contains no learner-segmentation or access-gate fields', () => {
    const forbiddenKeys = new Set([
      'prerequisite',
      'prerequisites',
      'lock',
      'locked',
      'profile',
      'learnerprofile',
      'learnertype',
      'diagnosis',
      'disability',
    ])
    const collectKeys = (value: unknown): string[] => {
      if (Array.isArray(value)) return value.flatMap(collectKeys)
      if (!value || typeof value !== 'object') return []
      return Object.entries(value).flatMap(([key, child]) => [key.toLowerCase(), ...collectKeys(child)])
    }

    expect(collectKeys({ academyUnitContent, academySourceRecords })).not.toEqual(
      expect.arrayContaining([...forbiddenKeys]),
    )
  })

  it('gives answer-specific feedback for every choice and always permits retry', () => {
    for (const unit of academyUnitContent) {
      const check = unit.knowledgeCheck
      expect(check.choices.length, unit.unitId).toBeGreaterThanOrEqual(2)
      expect(check.choices.filter((choice) => choice.correct), unit.unitId).toHaveLength(1)
      expect(check.retry.trim(), unit.unitId).not.toBe('')
      for (const choice of check.choices) {
        expect(choice.feedback.trim().length, `${unit.unitId}.${choice.id}`).toBeGreaterThan(12)
      }
    }
  })

  it('uses exactly the seven canonical sections for both reality comparisons', () => {
    for (const unitId of ['RVF-101', 'RVF-102'] as const) {
      const unit = academyContentForUnit(unitId)
      expect(unit.anatomyKind).toBe('reality-comparison')
      expect(unit.beforeWeCompare?.choices).toEqual([
        'Start now',
        'Review a refresher',
        'Read the short context',
      ])
      expect(unit.beforeWeCompare?.requirements).toContain('No installation')
      expect(unit.realitySections?.map((section) => section.label)).toEqual(realitySectionLabels)
      expect(unit.realitySections).toHaveLength(7)
      expect(unit.realitySections?.every((section) => section.paragraphs.every(Boolean))).toBe(true)
      expect(unit.practice.id).toMatch(/^rvf-10[12]-l0$/)
      expect(unit.practice.expectedResult.trim()).not.toBe('')
      expect(unit.practice.recovery.trim()).not.toBe('')
      expect(unit.stopResume.savedFact.trim()).not.toBe('')
    }
  })

  it('keeps original claim records separate from official reality evidence', () => {
    for (const unitId of ['RVF-101', 'RVF-102'] as const) {
      const unit = academyContentForUnit(unitId)
      const sources = academySourcesForUnit(unitId)
      expect(unit.claimRecord?.claimType).toBe('original-scene')
      expect(unit.claimRecord?.rightsNotes).toContain('Original paraphrased')
      expect(unit.sourceIds).not.toContain(unit.claimRecord?.id)
      expect(sources.length).toBeGreaterThanOrEqual(2)
      expect(sources.every((source) => source.evidenceKind === 'reality-source')).toBe(true)
    }
  })

  it('uses reviewed, scoped, official source records with visible limits and rights notes', () => {
    expect(academySourceRecords.map((source) => source.id)).toEqual([
      'source-nist-ai-rmf-airc',
      'source-nist-sp-800-218',
      'source-python-errors-exceptions',
    ])
    for (const source of academySourceRecords) {
      expect(source.observedAt).toBe(academyContentObservedAt)
      expect(source.reviewDueAt).toBe(academyContentReviewDueAt)
      expect(source.observedAt).toBe('2026-08-31')
      expect(source.reviewDueAt).toBe('2027-02-28')
      expect(source.url).toMatch(/^https:\/\/(?:airc\.nist\.gov|csrc\.nist\.gov|docs\.python\.org)\//)
      expect(source.supports.trim().length).toBeGreaterThan(20)
      expect(source.scope.trim().length).toBeGreaterThan(20)
      expect(source.limits.trim().length).toBeGreaterThan(20)
      expect(source.rightsNotes.trim().length).toBeGreaterThan(20)
      expect(source.rightsNotes).toContain('No')
    }
  })

  it('contains no learner diagnosis, learner category, em dash, external runtime task, or advanced-model spillover', () => {
    const text = JSON.stringify({ academyUnitContent, academySourceRecords })
    expect(text).not.toContain(String.fromCodePoint(0x2014))
    expect(text).not.toMatch(/\b(?:adhd|audhd|autism|autistic|diagnosis|diagnosed|neurodivergent|learner category|medicalized path)\b/i)
    expect(text).not.toMatch(/\b(?:open|launch) (?:a |the )?(?:terminal|shell)|\b(?:install|download) (?:the |a )?(?:runtime|model|package)|\brun (?:this|the following) command|\benter (?:an |your )?(?:api key|password|credential)/i)
    expect(text).not.toMatch(/\b(?:quantization|quantized|fine-tuning|model families|local model|hosted model)\b/i)
  })

  it('fails closed when coverage, anatomy, access, boundaries, feedback, or evidence are weakened', () => {
    const missingUnit = mutableContent().slice(0, -1)
    expect(academyContentValidationErrors(missingUnit, academySourceRecords)).toContain(
      'Academy content must cover every manifest unit in manifest order.',
    )

    const badAnatomy = mutableContent()
    badAnatomy[0].anatomyOrder = [...academyAnatomyLabels].reverse()
    expect(academyContentValidationErrors(badAnatomy, academySourceRecords)).toContain(
      'Academy unit LM-101-U1 has an invalid anatomy order.',
    )

    const hidden = mutableContent()
    hidden[0].access = 'closed' as 'open'
    expect(academyContentValidationErrors(hidden, academySourceRecords)).toContain(
      'Academy unit LM-101-U1 must remain open.',
    )

    const segmented = mutableContent()
    ;(segmented[0] as unknown as { prerequisites: string[] }).prerequisites = ['earlier-course']
    expect(academyContentValidationErrors(segmented, academySourceRecords)).toContain(
      'Academy content contains a learner-segmentation or access-gate field.',
    )

    const activePage = mutableContent()
    ;(activePage[0].boundary.pageOperations as unknown as { model: boolean }).model = true
    expect(academyContentValidationErrors(activePage, academySourceRecords)).toContain(
      'Academy unit LM-101-U1 must remain L0 browser-only prepared study.',
    )

    const noFeedback = mutableContent()
    noFeedback[0].knowledgeCheck.choices[0].feedback = ''
    expect(academyContentValidationErrors(noFeedback, academySourceRecords)).toContain(
      'Academy unit LM-101-U1 lacks immediate answer-specific feedback and retry.',
    )

    const missingSource = mutableSources().slice(1)
    expect(academyContentValidationErrors(academyUnitContent, missingSource)).toContain(
      'Academy content must retain the exact reviewed source register.',
    )
    expect(academyContentValidationErrors(academyUnitContent, missingSource)).toContain(
      'Academy unit LM-101-U1 has a missing source record.',
    )
  })

  it('fails closed for forbidden language and malformed source dates', () => {
    const categorized = mutableContent()
    categorized[0].recap = [...categorized[0].recap, 'diagnosis']
    expect(academyContentValidationErrors(categorized, academySourceRecords)).toContain(
      'Academy content contains forbidden diagnosis or learner-category language.',
    )

    const dated = mutableSources()
    dated[0].reviewDueAt = '2027-01-01' as typeof academyContentReviewDueAt
    expect(academyContentValidationErrors(academyUnitContent, dated)).toContain(
      'Academy source source-nist-ai-rmf-airc has an invalid review date.',
    )

    const unapproved = mutableSources()
    unapproved[0].url = 'https://example.com/summary'
    expect(academyContentValidationErrors(academyUnitContent, unapproved)).toContain(
      'Academy source source-nist-ai-rmf-airc is not an approved official source.',
    )
  })

  it('throws when a caller requests content outside the typed manifest boundary', () => {
    expect(() => academyContentForUnit('missing-unit' as AcademyUnitId)).toThrow(
      'Academy content is missing for unit missing-unit.',
    )
  })
})
