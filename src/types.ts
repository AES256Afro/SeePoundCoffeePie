export type LanguageId = 'python' | 'cpp' | 'csharp' | 'java'

export type ExerciseType = 'choice' | 'code'

export interface CodeCheck {
  pattern: string
  message: string
  flags?: string
}

export interface Exercise {
  id: string
  conceptId: string
  eyebrow: string
  title: string
  explanation: string
  analogy: string
  type: ExerciseType
  prompt: string
  starterCode?: string
  choices?: Array<{ id: string; label: string; detail?: string }>
  correctChoice?: string
  checks?: CodeCheck[]
  output?: string
  hint: string
  recap: string
  xp: number
}

export interface Mission {
  id: string
  language: LanguageId
  chapter: number
  title: string
  subtitle: string
  description: string
  duration: string
  icon: 'signal' | 'terminal' | 'satellite' | 'shield' | 'package' | 'crown'
  status: 'available' | 'locked' | 'coming-soon'
  exercises: Exercise[]
}

export interface LanguageTrack {
  id: LanguageId
  name: string
  shortName: string
  role: string
  description: string
  accent: string
  accentSoft: string
  missions: Mission[]
}

export interface ConceptProgress {
  strength: number
  correct: number
  incorrect: number
  dueAt: string
}

export interface LearnerProgress {
  callsign: string
  activeLanguage: LanguageId
  dailyGoal: number
  xp: number
  dailyXp: number
  dailyXpDate: string | null
  starShards: number
  streak: number
  lastStudyDate: string | null
  completedMissions: string[]
  conceptProgress: Record<string, ConceptProgress>
  onboardingComplete: boolean
}

export interface EvaluationResult {
  correct: boolean
  message: string
  output?: string
}
