import { readFileSync } from 'node:fs'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { controlledCodebookContributions as baseCodebookContributions } from './codebook-publication.base'
import { controlledCodebookContributions as candidateCodebookContributions } from './codebook-publication.with-cpp'
import {
  codebookEntries,
  codebookExampleState,
  codebookMatches,
} from './codebook'
import { basePublishedContinuingCourseRegistrations } from './continuing-course-publications.base'
import {
  candidateCppContinuingCourseRegistration,
  controlledContinuingCourseRegistrations,
} from './continuing-course-publications.with-cpp'
import { courseDefinitions } from './course-registry'
import { foundationMissionLessonIds } from './foundation-curriculum-index'
import { createLearningSurface } from './learning-surface'
import {
  publishedLearningSequences,
} from './learning-sequence'
import { trackById } from './curriculum'
import { initialProgress } from '../lib/progress'
import { createAppRouteParser, parseAppRoute } from '../lib/routes'

const candidatePayload = JSON.parse(readFileSync(
  new URL('./cpp-collections-records-course-packed.generated.json', import.meta.url),
  'utf8',
)) as unknown

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn(async () => Response.json(candidatePayload)))
})

afterEach(() => {
  vi.unstubAllGlobals()
})

const candidateCourseId = candidateCppContinuingCourseRegistration.definition.id
const foundationCourseDefinitions = courseDefinitions.filter((definition) => (
  definition.kind === 'foundation'
))
const candidateLearningSequences = publishedLearningSequences
const candidateSurface = createLearningSurface({
  foundationCourseDefinitions,
  foundationModuleLessonIds: foundationMissionLessonIds,
  learningSequences: candidateLearningSequences,
  continuingCourseRegistrations: controlledContinuingCourseRegistrations,
})
const candidateCodebookChanges = [
  {
    kind: 'extend',
    term: 'Return value',
    example: 'int total = subtotal(4, 3);',
    unlockAfterMissionId: 'cpp-records-return-values',
  },
  {
    kind: 'add',
    term: 'Vector',
    example: 'std::vector<std::string> parts = {"bolts", "seals"};',
    unlockAfterMissionId: 'cpp-records-vectors',
  },
  {
    kind: 'add',
    term: 'Element type',
    example: 'std::vector<std::string> parts;  // std::string is the element type',
    unlockAfterMissionId: 'cpp-records-vectors',
  },
  {
    kind: 'add',
    term: 'Member function',
    example: 'parts.push_back("bolts");',
    unlockAfterMissionId: 'cpp-records-vectors',
  },
  {
    kind: 'extend',
    term: 'Length',
    example: 'std::cout << parts.size();',
    unlockAfterMissionId: 'cpp-records-vectors',
  },
  {
    kind: 'add',
    term: 'Record',
    example: 'Part part{"bolts", 4};',
    unlockAfterMissionId: 'cpp-records-structs',
  },
  {
    kind: 'add',
    term: 'Struct',
    example: 'struct Part { std::string name; int quantity; };',
    unlockAfterMissionId: 'cpp-records-structs',
  },
  {
    kind: 'add',
    term: 'Field',
    example: 'std::cout << part.name << ": " << part.quantity;',
    unlockAfterMissionId: 'cpp-records-structs',
  },
  {
    kind: 'add',
    term: 'Reference',
    example: 'for (Part& part : parts) { part.quantity = part.quantity + 1; }',
    unlockAfterMissionId: 'cpp-records-updates',
  },
  {
    kind: 'extend',
    term: 'Accumulator',
    example: 'int total = 0;\nfor (Part part : parts) { total = total + part.quantity; }',
    unlockAfterMissionId: 'cpp-records-summaries',
  },
  {
    kind: 'extend',
    term: 'Filter',
    example: 'if (part.quantity < limit) { names.push_back(part.name); }',
    unlockAfterMissionId: 'cpp-records-summaries',
  },
] as const
const mergedCandidateCodebookEntries = codebookEntries

describe('controlled Practical C++ production publication', () => {
  it('keeps the base source fail closed while production publishes six courses', () => {
    expect(basePublishedContinuingCourseRegistrations.map((entry) => entry.definition.id))
      .toEqual(['python-data-tools'])
    expect(baseCodebookContributions).toEqual([])
    expect(courseDefinitions.map((definition) => definition.id)).toContain(candidateCourseId)

    expect(candidateSurface.courseDefinitions.map((definition) => definition.id)).toEqual([
      'python-foundations',
      'cpp-foundations',
      'csharp-foundations',
      'java-foundations',
      'python-data-tools',
      candidateCourseId,
    ])
    expect(candidateSurface.continuingCourseIdsForLanguage('cpp')).toEqual([candidateCourseId])
  })

  it('validates all six published modules and thirty lessons against loaded content', async () => {
    const content = await candidateSurface.continuingCourseContentRequest(candidateCourseId)
    expect(content?.missions).toHaveLength(6)
    expect(content?.missions.flatMap((mission) => mission.exercises)).toHaveLength(30)
    expect(content?.missions.map((mission) => mission.id)).toEqual(
      candidateCppContinuingCourseRegistration.definition.missionIds,
    )
    expect(content?.missions.map((mission) => mission.title)).toEqual(
      candidateCppContinuingCourseRegistration.definition.moduleTitles,
    )
  })

  it('requires both earlier C++ units before the published course becomes available', () => {
    const empty = initialProgress('cpp')
    expect(candidateSurface.missingCoursePrerequisites(candidateCourseId, empty)).toHaveLength(2)
    expect(candidateSurface.courseIsAvailable(candidateCourseId, empty)).toBe(false)

    const ready = {
      ...empty,
      completedMissions: [...candidateSurface.courseDefinition('cpp-foundations')!.missionIds],
      completedProjects: ['first-compiled-program'],
    }
    expect(candidateSurface.missingCoursePrerequisites(candidateCourseId, ready)).toEqual([])
    expect(candidateSurface.courseIsAvailable(candidateCourseId, ready)).toBe(true)
  })

  it('resolves the published course and lesson URLs through production ownership', () => {
    const parseCandidateRoute = createAppRouteParser(candidateSurface)
    const lessonPath = '/learn/cpp-collections-records/cpp-records-return-values/cpprecords1-retrieve-call'

    expect(parseCandidateRoute('/courses/cpp-collections-records')).toMatchObject({
      page: 'course',
      courseId: candidateCourseId,
      language: 'cpp',
    })
    expect(parseCandidateRoute(lessonPath)).toMatchObject({
      page: 'lesson',
      courseId: candidateCourseId,
      missionId: 'cpp-records-return-values',
      exerciseId: 'cpprecords1-retrieve-call',
    })
    expect(parseAppRoute('/courses/cpp-collections-records')).toEqual(
      parseCandidateRoute('/courses/cpp-collections-records'),
    )
    expect(parseAppRoute(lessonPath)).toEqual(parseCandidateRoute(lessonPath))
  })

  it('defines the exact eleven published Code Reference changes', () => {
    expect(candidateCodebookContributions.map((contribution) => ({
      kind: contribution.kind,
      term: contribution.kind === 'add' ? contribution.entry.term : contribution.targetTerm,
      example: contribution.example,
      unlockAfterMissionId: contribution.unlockAfterMissionId,
    }))).toEqual(candidateCodebookChanges)
    expect(candidateCodebookContributions).toHaveLength(11)
    const candidateTerms = mergedCandidateCodebookEntries.filter((entry) => (
      entry.unlockAfterMissionIds?.cpp?.startsWith('cpp-records-')
    )).map((entry) => entry.term)
    expect(candidateTerms).toHaveLength(11)
    expect([...candidateTerms].sort()).toEqual(
      candidateCodebookChanges.map((change) => change.term).sort(),
    )
    expect(mergedCandidateCodebookEntries.some((entry) => (
      entry.term === 'Reference parameter'
    ))).toBe(false)
  })

  it('keeps every published example locked to its exact C++ mission', () => {
    const cpp = trackById('cpp')
    const allFoundationMissions = cpp.missions.map((mission) => mission.id)
    const allPythonContinuingMissions = candidateSurface
      .courseDefinition('python-data-tools')!
      .missionIds

    for (const change of candidateCodebookChanges) {
      const entry = mergedCandidateCodebookEntries.find((candidate) => (
        candidate.term === change.term
      ))
      expect(entry, `${change.term} must be present in the candidate Code Reference`).toBeTruthy()
      if (!entry) continue

      expect(entry.examples?.cpp).toBe(change.example)
      expect(entry.unlockAfterMissionIds?.cpp).toBe(change.unlockAfterMissionId)
      expect(codebookMatches(entry, change.term, 'cpp')).toBe(true)
      expect(entry.plain.length).toBeGreaterThan(50)
      expect(entry.ship.length).toBeGreaterThan(45)
      expect(entry.keywords.length).toBeGreaterThanOrEqual(3)
      expect(codebookExampleState(entry, cpp, [])).toBe('locked')
      expect(codebookExampleState(entry, cpp, allFoundationMissions)).toBe('locked')
      expect(codebookExampleState(entry, cpp, [...allPythonContinuingMissions])).toBe('locked')
      expect(codebookExampleState(entry, cpp, [change.unlockAfterMissionId])).toBe('unlocked')
    }
  })

  it('does not mutate Practical Python examples or foundation unlock behavior', () => {
    const python = trackById('python')
    const practicalPythonMissionIds = candidateSurface
      .courseDefinition('python-data-tools')!
      .missionIds
    const pythonCompletionSets = [
      [] as string[],
      python.missions.map((mission) => mission.id),
      ...practicalPythonMissionIds.map((missionId) => [missionId]),
    ]

    for (const sourceEntry of codebookEntries) {
      const mergedEntry = mergedCandidateCodebookEntries.find((entry) => (
        entry.term === sourceEntry.term
      ))
      expect(mergedEntry).toBeTruthy()
      if (!mergedEntry) continue
      expect(mergedEntry.examples?.python).toBe(sourceEntry.examples?.python)
      expect(mergedEntry.unlockAfterMissionIds?.python).toBe(
        sourceEntry.unlockAfterMissionIds?.python,
      )
      for (const completedMissionIds of pythonCompletionSets) {
        expect(codebookExampleState(mergedEntry, python, completedMissionIds)).toBe(
          codebookExampleState(sourceEntry, python, completedMissionIds),
        )
      }
    }

    for (const track of [
      trackById('python'),
      trackById('cpp'),
      trackById('csharp'),
      trackById('java'),
    ]) {
      const completionSets = track.missions.map((_mission, index) => (
        track.missions.slice(0, index + 1).map((mission) => mission.id)
      ))
      for (const sourceEntry of codebookEntries.filter((entry) => entry.unlockAfter)) {
        const mergedEntry = mergedCandidateCodebookEntries.find((entry) => (
          entry.term === sourceEntry.term
        ))
        if (!mergedEntry) throw new Error(`${sourceEntry.term} is missing after candidate merge.`)
        for (const completedMissionIds of [[], ...completionSets]) {
          expect(codebookExampleState(mergedEntry, track, completedMissionIds)).toBe(
            codebookExampleState(sourceEntry, track, completedMissionIds),
          )
        }
      }
    }

    expect(JSON.stringify(codebookEntries)).toContain('cpp-records-')
    expect(JSON.stringify(baseCodebookContributions)).not.toContain('cpp-records-')
  })
})
