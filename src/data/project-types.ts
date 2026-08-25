import type { Exercise, LanguageId } from '../types'

export type ProjectScaffoldingLevel = 'guided' | 'supported' | 'independent'

export interface ProjectTerm {
  term: string
  meaning: string
}

export interface ProjectTestCase {
  id: string
  name: string
  visibility: 'visible' | 'hidden'
  stdin: string
  expectedStdout: string
  purpose: string
}

export interface ExpectedFirstRun {
  outcome: 'compile_error' | 'runtime_error'
  diagnosticTitle: string
  explanation: string
}

export interface ProjectAssessmentSummary {
  visibleTestCase: ProjectTestCase
  hiddenTestCount: number
  structuralCheckCount: number
}

export interface GuidedProjectCheckpoint {
  id: string
  order: number
  title: string
  objective: string
  scaffolding: ProjectScaffoldingLevel
  newTerms: ProjectTerm[]
  exercise: Exercise
  practiceStdin?: string
  requirements?: string[]
  expectedFirstRun?: ExpectedFirstRun
  assessmentSummary?: ProjectAssessmentSummary
}

export interface ProjectOverviewStep {
  title: string
  description: string
}

export interface GuidedProjectCheckpointManifest {
  id: string
  order: number
  title: string
  conceptId: string
  xp: number
}

export interface GuidedProjectManifest {
  id: string
  language: LanguageId
  title: string
  subtitle: string
  description: string
  outcome: string
  duration: string
  route: string
  studioLabel: string
  sourcePrivacyLabel: string
  downloadFileName: string
  downloadLabel: string
  prerequisiteTitle: string
  prerequisiteDescription: string
  overviewTitle: string
  overviewSteps: ProjectOverviewStep[]
  completionDescription: string
  checkpoints: readonly GuidedProjectCheckpointManifest[]
}

export interface GuidedProject extends Omit<GuidedProjectManifest, 'checkpoints'> {
  checkpoints: GuidedProjectCheckpoint[]
}
