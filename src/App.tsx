import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type Dispatch,
  type SetStateAction,
} from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Clock3,
  Cloud,
  Coffee,
  Compass,
  Download,
  Eye,
  Flame,
  GitFork as Github,
  Home,
  LibraryBig,
  LockKeyhole,
  LogOut,
  Menu,
  RefreshCw,
  RotateCcw,
  Settings,
  Shield,
  TerminalSquare,
  Trophy,
  Trash2,
  Upload,
  UserRound,
  X,
  Zap,
} from 'lucide-react'
import {
  courseDefinition,
  courseDefinitions,
  courseIsAvailable,
  courseMissionLessonIds,
  foundationCourseId,
} from './data/course-registry'
import { foundationCourseContentRequestForLanguage } from './data/foundation-course-loaders'
import {
  foundationTrackMetadata,
  foundationTrackMetadataByLanguage,
} from './data/foundation-track-metadata'
import { publishedContinuingCourseContentRequest } from './data/published-continuing-course-loaders'
import { publishedContinuingCourseManifest } from './data/published-continuing-course-manifests'
import {
  publishedContinuingCourseIdsForLanguage,
  publishedLearningUnitsForLanguage,
  publishedProjectUnitAfterCourse,
} from './data/learning-sequence'
import {
  loadPracticeTrackForSurface,
  type PracticePublicationSurface,
  type PracticeTrackLoadResult,
} from './data/practice-publication'
import {
  projectManifestByRoute,
  projectManifests,
} from './data/project-manifests'
import {
  buildCourseCards,
  buildCourseModel,
  lessonActivityLabel,
  type CourseCardModel,
} from './lib/course-model'
import { missionAvailability } from './lib/missions'
import {
  conceptDisplayName,
  recommendPractice,
  type AdaptivePracticeSession,
} from './lib/practice'
import {
  clearPracticeSession,
  loadOrCreatePracticeSession,
  practiceSessionStorage,
} from './lib/practice-session'
import { parseProgressBackup, serializeProgressBackup } from './lib/progress-backup'
import {
  completeMission,
  dateKey,
  initialProgress,
  loadProgress,
  saveProgress,
} from './lib/progress'
import {
  deleteRemoteProgress,
  fetchRemoteProgress,
  hasMeaningfulProgress,
  mergeLearnerProgress,
  progressRecordsMatch,
  saveRemoteProgress,
  type ProgressSyncState,
  type RemoteProgressRecord,
} from './lib/progress-sync'
import {
  codebookPath,
  coursePath,
  coursesPath,
  homePath,
  lessonPath,
  pagePath,
  parseAppRoute,
  practicePath,
  practiceSessionPath,
  projectPath,
  type AppRoute,
  type RoutePage,
} from './lib/routes'
import { RouteLink as AppLink, RouteNotFoundPage } from './RouteNotFoundPage'
import type {
  AuthUser,
  CourseId,
  LanguageId,
  LanguageTrack,
  LearnerProgress,
  Mission,
} from './types'

type ViewId = 'home' | 'courses' | 'path' | 'practice' | 'spellbook' | 'profile' | 'settings'

const ProjectStudio = lazy(async () => {
  const module = await import('./ProjectStudio')
  return { default: module.ProjectStudio }
})

const PortfolioPage = lazy(async () => {
  const module = await import('./PortfolioPage')
  return { default: module.PortfolioPage }
})

const LessonPlayer = lazy(async () => {
  const module = await import('./LessonPlayer')
  return { default: module.LessonPlayer }
})

const ContinuingCoursePage = lazy(async () => {
  const module = await import('./PythonDataToolsRoute')
  return { default: module.ContinuingCoursePage }
})

const ContinuingCourseLessonPage = lazy(async () => {
  const module = await import('./PythonDataToolsRoute')
  return { default: module.ContinuingCourseLessonPage }
})

const CodebookRoute = lazy(async () => {
  const module = await import('./CodebookRoute')
  return { default: module.CodebookRoute }
})

function LessonPlayerFallback({ practice = false }: { practice?: boolean }) {
  return (
    <div className="lesson-overlay">
      <main className="route-message-page" aria-busy="true" id="main-content" tabIndex={-1}>
        <section className="route-message-card">
          <h1>Loading {practice ? 'practice' : 'lesson'}</h1>
        </section>
      </main>
    </div>
  )
}

function FoundationLoadFailure({ insideShell = false }: { insideShell?: boolean }) {
  return (
    <main className={insideShell ? 'content-page' : 'route-message-page'} id="main-content" tabIndex={-1}>
      <section className={`route-message-card${insideShell ? ' route-message-card--inside' : ''}`}>
        <h1>Course could not load</h1>
        <p>Your progress is saved. Reload the page to try again.</p>
        <button className="primary-action" onClick={() => window.location.reload()} type="button">Reload page</button>
      </section>
    </main>
  )
}

function PracticeLoadFailure({ insideShell = false }: { insideShell?: boolean }) {
  return (
    <main className={insideShell ? 'content-page' : 'route-message-page'} id="main-content" tabIndex={-1}>
      <section className={`route-message-card${insideShell ? ' route-message-card--inside' : ''}`}>
        <h1>Practice could not load</h1>
        <p>Your progress is saved. Reload the page to try loading the course questions again.</p>
        <button className="primary-action" onClick={() => window.location.reload()} type="button">Reload page</button>
      </section>
    </main>
  )
}

const languageSnippets: Record<LanguageId, string> = {
  python: 'print("Hello!")',
  cpp: 'std::cout << "Hello!";',
  csharp: 'Console.WriteLine("Hello!");',
  java: 'System.out.println("Hello!");',
}

const publishedPracticeSurface: PracticePublicationSurface = {
  continuingCourseIdsForLanguage: publishedContinuingCourseIdsForLanguage,
  continuingCourseContentRequest: publishedContinuingCourseContentRequest,
  courseDefinition: (courseId) => courseDefinitions.find((course) => course.id === courseId),
  courseIsAvailable: (courseId, progress) => courseIsAvailable(courseId as CourseId, progress),
}

interface BrowserLocation {
  pathname: string
  search: string
}

const languageContextPages: ReadonlySet<RoutePage> = new Set([
  'academy',
  'course',
  'practice',
  'practice-session',
  'codebook',
  'lesson',
  'project',
  'portfolio',
])

const languagePreferencePages: ReadonlySet<RoutePage> = new Set(
  [...languageContextPages].filter((page) => page !== 'course'),
)

function routeHasLanguageContext(page: RoutePage): boolean {
  return languageContextPages.has(page)
}

function routeSetsLanguagePreference(route: AppRoute): boolean {
  return languagePreferencePages.has(route.page)
    && !(route.page === 'lesson' && route.courseId)
}

function readBrowserLocation(): BrowserLocation {
  return { pathname: window.location.pathname, search: window.location.search }
}

function navigateTo(to: string, replace = false) {
  window.history[replace ? 'replaceState' : 'pushState']({}, '', to)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

function LanguageSymbol({
  decorative = false,
  language,
  size = 'medium',
}: {
  decorative?: boolean
  language: LanguageId
  size?: 'small' | 'medium' | 'large'
}) {
  const className = `language-symbol language-symbol--${language} language-symbol--${size}`
  const accessibility = decorative
    ? { 'aria-hidden': true as const }
    : {
        'aria-label': language === 'cpp' ? 'C++' : language === 'csharp' ? 'C#' : language === 'java' ? 'Java' : 'Python',
        role: 'img' as const,
      }
  if (language === 'cpp') return <span className={className} {...accessibility}><Eye aria-hidden="true" /></span>
  if (language === 'csharp') return <span className={className} {...accessibility}>#</span>
  if (language === 'java') return <span className={className} {...accessibility}><Coffee aria-hidden="true" /></span>
  return <span className={className} {...accessibility}>π</span>
}

function trackMetadata(language: LanguageId) {
  const metadata = foundationTrackMetadataByLanguage(language)
  if (!metadata) throw new Error(`Unknown public language: ${language}.`)
  return metadata
}

function SymbolStrip({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`symbol-strip ${compact ? 'symbol-strip--compact' : ''}`} aria-label="C++, C#, Java, and Python">
      <LanguageSymbol language="cpp" size="small" />
      <LanguageSymbol language="csharp" size="small" />
      <LanguageSymbol language="java" size="small" />
      <LanguageSymbol language="python" size="small" />
    </span>
  )
}

function BrandMark({ compact = false, to = '/' }: { compact?: boolean; to?: string }) {
  return (
    <AppLink className={`brand ${compact ? 'brand--compact' : ''}`} aria-label="SeePoundCoffeePie home" to={to}>
      <SymbolStrip compact={compact} />
      {!compact && (
        <span className="brand__name">
          <b>SeePoundCoffeePie</b>
          <small>Learn programming from the beginning</small>
        </span>
      )}
    </AppLink>
  )
}

function LaunchStory({ language }: { language: LanguageId }) {
  const track = trackMetadata(language)
  return (
    <section className="onboarding__story">
      <BrandMark />
      <div className="hero-copy">
        <h1>Your first programming lesson</h1>
        <p>
          We explain every new word, symbol, and punctuation mark before you use it.
          In each short lesson, you make one change, run the code, and read the result.
          Earlier ideas return in short reviews.
        </p>
        <div className="hero-console" aria-label={`${track.shortName} example code`}>
          <span className="hero-console__label"><LanguageSymbol language={language} size="small" /> A first line in {track.shortName}</span>
          <code>{languageSnippets[language]}</code>
          <span className="console-result">Hello!</span>
        </div>
      </div>
      <div className="brand-meaning" aria-label="What the name means">
        <p>The name is the course list.</p>
        <div><LanguageSymbol language="cpp" /><span><b>See</b><small>C++</small></span></div>
        <div><LanguageSymbol language="csharp" /><span><b>Pound</b><small>C#</small></span></div>
        <div><LanguageSymbol language="java" /><span><b>Coffee</b><small>Java</small></span></div>
        <div><LanguageSymbol language="python" /><span><b>Pie</b><small>Python</small></span></div>
      </div>
    </section>
  )
}

interface LandingPageProps {
  authReady: boolean
  authUser: AuthUser | null
  progress: LearnerProgress
  onSignIn: () => void
}

function LandingPage({ authReady, authUser, progress, onSignIn }: LandingPageProps) {
  const [previewLanguage, setPreviewLanguage] = useState<LanguageId>(progress.activeLanguage)
  const continuePath = homePath()

  return (
    <main className="onboarding landing-page" id="main-content" tabIndex={-1}>
      <LaunchStory language={previewLanguage} />
      <section className="onboarding__form landing-page__overview">
        <div className="landing-card">
          <h2>Learn Python, C++, C#, or Java from the beginning</h2>
          <p className="setup-intro">
            SeePoundCoffeePie teaches Python, C++, C#, and Java from the first building block.
            You do not need to know what code is, what a variable means, or why punctuation matters.
            We explain each piece before asking you to use it.
          </p>

          <div className="landing-promises" id="how-it-works" aria-label="How lessons work">
            <article><CircleHelp size={20} /><span><b>Plain explanations</b><small>Each new word, symbol, and code shape is explained before you use it.</small></span></article>
            <article><TerminalSquare size={20} /><span><b>Write and run code</b><small>Make one small change, run it, read the result, and fix mistakes with help.</small></span></article>
            <article><RotateCcw size={20} /><span><b>Short reviews</b><small>Completed ideas return in a few questions so you can remember them.</small></span></article>
          </div>

          <div className="landing-section-heading">
            <div><small>COURSES</small><h3>Choose a language to preview</h3></div>
            <p>You can try every language. Your first choice does not limit the others.</p>
          </div>
          <div className="landing-schools">
            {foundationTrackMetadata.map((track) => (
              <AppLink
                className={previewLanguage === track.id ? 'is-selected' : ''}
                key={track.id}
                onFocus={() => setPreviewLanguage(track.id)}
                onMouseEnter={() => setPreviewLanguage(track.id)}
                style={{ '--track-accent': track.accent } as React.CSSProperties}
                to={coursePath(track.id)}
              >
                <LanguageSymbol language={track.id} size="small" />
                <span><b>{track.shortName}</b><small>Beginner course</small></span>
              </AppLink>
            ))}
          </div>

          <div className="landing-actions">
            {progress.onboardingComplete ? (
              <AppLink className="primary-action" to={continuePath}>Continue as {progress.callsign} <ArrowRight size={18} /></AppLink>
            ) : (
              <AppLink className="primary-action" to="/start">Start from the beginning <ArrowRight size={18} /></AppLink>
            )}
            <a className="secondary-action" href="#how-it-works">How lessons work</a>
          </div>

          <div className={`github-intake landing-identity ${authUser ? 'is-connected' : ''}`}>
            <span><Github size={21} /></span>
            <div>
              <b>{authUser ? `Signed in as ${authUser.login}` : 'GitHub sign-in is optional'}</b>
              <p>{authUser ? 'GitHub is connected. Your progress can be saved to your account.' : 'Start as a guest, or sign in to carry progress between devices.'}</p>
            </div>
            {!authUser && <button type="button" onClick={onSignIn} disabled={!authReady}><Github size={16} /> {authReady ? 'Sign in' : 'Checking'}</button>}
          </div>
        </div>
      </section>
    </main>
  )
}

interface OnboardingProps {
  authReady: boolean
  authUser: AuthUser | null
  initialLanguage: LanguageId
  onComplete: (progress: LearnerProgress) => void
  onSignIn: () => void
}

function Onboarding({ authReady, authUser, initialLanguage, onComplete, onSignIn }: OnboardingProps) {
  const [language, setLanguage] = useState<LanguageId>(initialLanguage)
  const [callsign, setCallsign] = useState('')
  const [goal, setGoal] = useState(10)
  const [step, setStep] = useState(0)
  const [experience, setExperience] = useState('new')
  const [interest, setInterest] = useState('understand')
  const intakeCardRef = useRef<HTMLDivElement>(null)
  const selectedTrack = trackMetadata(language)
  const recommendation: LanguageId = interest === 'games'
    ? 'csharp'
    : interest === 'apps'
      ? 'java'
      : interest === 'systems'
        ? 'cpp'
        : 'python'

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const heading = intakeCardRef.current?.querySelector<HTMLElement>('.intake-question legend, .intake-question h2')
      if (!heading) return
      heading.tabIndex = -1
      heading.focus({ preventScroll: true })
    }, 0)
    return () => window.clearTimeout(timer)
  }, [step])

  const nextStep = () => {
    if (step === 1) setLanguage(recommendation)
    setStep((current) => Math.min(3, current + 1))
  }

  const finish = () => {
    onComplete({
      ...initialProgress(language),
      callsign: callsign.trim() || authUser?.name || authUser?.login || 'Learner',
      dailyGoal: goal,
      onboardingComplete: true,
    })
  }

  return (
    <main className="onboarding intake-page" id="main-content" tabIndex={-1}>
      <LaunchStory language={language} />

      <section className="onboarding__form intake-form">
        <div className="setup-card intake-card" ref={intakeCardRef}>
          <div className="intake-progress" aria-label={`Question ${step + 1} of 4`}>
            <span>Question {step + 1} of 4</span>
            <div aria-hidden="true">{[0, 1, 2, 3].map((item) => <i className={item <= step ? 'is-filled' : ''} key={item} />)}</div>
          </div>

          {step === 0 && (
            <fieldset className="intake-question">
              <legend>How familiar does programming feel right now?</legend>
              <p>There is no placement test. This only helps us choose how much context to give you.</p>
              {[
                ['new', 'Completely new', 'I do not know what code is yet.'],
                ['tried', 'I have tried a little', 'I have copied or changed a few lines before.'],
                ['built', 'I have built something small', 'I know a few basics but want a careful foundation.'],
                ['unsure', "I am not sure yet", 'Start gently and let the lessons adjust.'],
              ].map(([value, label, detail]) => (
                <label className={`intake-option ${experience === value ? 'is-selected' : ''}`} key={value}>
                  <input type="radio" name="experience" value={value} checked={experience === value} onChange={() => setExperience(value)} />
                  <span><b>{label}</b><small>{detail}</small></span><i>{experience === value && <Check size={16} />}</i>
                </label>
              ))}
            </fieldset>
          )}

          {step === 1 && (
            <fieldset className="intake-question">
              <legend>What sounds most interesting to you?</legend>
              <p>You can learn every language later. This answer only shapes the first recommendation.</p>
              {[
                ['understand', 'Understand how programming works', 'Learn the shared ideas with the gentlest syntax.'],
                ['games', 'Make games and interactive things', 'Build structured programs that can grow into game logic.'],
                ['apps', 'Build apps and useful services', 'Learn a portable language used in many large systems.'],
                ['systems', 'Understand computers more deeply', 'See types, memory, and compiled programs more explicitly.'],
                ['unsure', "I am not sure yet", 'Begin with the clearest general-purpose path.'],
              ].map(([value, label, detail]) => (
                <label className={`intake-option ${interest === value ? 'is-selected' : ''}`} key={value}>
                  <input type="radio" name="interest" value={value} checked={interest === value} onChange={() => setInterest(value)} />
                  <span><b>{label}</b><small>{detail}</small></span><i>{interest === value && <Check size={16} />}</i>
                </label>
              ))}
            </fieldset>
          )}

          {step === 2 && (
            <fieldset className="intake-question">
              <legend>Choose your first foundation course</legend>
              <p><b>{trackMetadata(recommendation).shortName} is our suggestion.</b> It matches your answer, but it does not lock you in.</p>
              <div className="intake-course-options">
                {foundationTrackMetadata.map((track) => (
                  <label className={`intake-course-option ${language === track.id ? 'is-selected' : ''}`} key={track.id}>
                    <input type="radio" name="language" value={track.id} checked={language === track.id} onChange={() => setLanguage(track.id)} />
                    <LanguageSymbol language={track.id} />
                    <span><b>{track.shortName} Foundations</b><small>{track.description}</small></span>
                    {track.id === recommendation && <em>Recommended</em>}
                  </label>
                ))}
              </div>
              <div className="selection-description"><BookOpen size={19} /><span><b>{selectedTrack.shortName} Foundations</b>{selectedTrack.description}</span></div>
            </fieldset>
          )}

          {step === 3 && (
            <div className="intake-question intake-finish">
              <h2>Choose your settings</h2>
              <p>Choose a name and a small daily point goal. These settings do not change which lessons you can open.</p>
              <div className={`github-intake ${authUser ? 'is-connected' : ''}`}>
                <span><Github size={21} /></span>
                <div><b>{authUser ? `Signed in as ${authUser.login}` : 'GitHub sign-in is optional'}</b><p>{authUser ? 'You will choose which progress to save to your account.' : 'Stay a guest, or sign in to carry progress between devices.'}</p></div>
                {!authUser && <button type="button" onClick={onSignIn} disabled={!authReady}><Github size={16} /> {authReady ? 'Sign in' : 'Checking'}</button>}
              </div>
              <label className="field-label" htmlFor="callsign">What should we call you?</label>
              <input id="callsign" className="text-input" value={callsign} onChange={(event) => setCallsign(event.target.value)} placeholder={authUser ? authUser.name || authUser.login : 'Your name or nickname'} maxLength={24} />
              <fieldset className="goal-picker">
                <legend>Daily point goal</legend>
                <div>
                  {[5, 10, 15].map((points) => (
                    <button key={points} className={goal === points ? 'is-selected' : ''} aria-pressed={goal === points} onClick={() => setGoal(points)} type="button"><Clock3 size={16} /><b>{points} points</b><span>{points === 5 ? 'Short' : points === 10 ? 'Regular' : 'Longer'}</span></button>
                  ))}
                </div>
              </fieldset>
            </div>
          )}

          <div className="intake-actions">
            <div>{step > 0 && <button className="secondary-action" type="button" onClick={() => setStep((current) => current - 1)}><ArrowLeft size={17} /> Back</button>}<AppLink className="text-action" to={coursesPath()}>Browse courses instead</AppLink></div>
            {step < 3 ? <button className="primary-action" type="button" onClick={nextStep}>Continue <ArrowRight size={17} /></button> : <button className="primary-action" type="button" onClick={finish}>Start learning <ArrowRight size={17} /></button>}
          </div>
          <p className="fine-print"><Shield size={13} /> Guest progress stays in this browser. Sign-in remains optional.</p>
        </div>
      </section>
    </main>
  )
}

interface ShellProps {
  authReady: boolean
  authUser: AuthUser | null
  progress: LearnerProgress
  view: ViewId
  onLanguageChange: (language: LanguageId) => void
  onSignIn: () => void
  children: React.ReactNode
}

function AppShell({ authReady, authUser, progress, view, onLanguageChange, onSignIn, children }: ShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const mobileMenuRef = useRef<HTMLButtonElement>(null)
  const track = trackMetadata(progress.activeLanguage)
  const navItems: Array<{ id: ViewId; label: string; icon: typeof Compass; to: string }> = [
    { id: 'home', label: 'Home', icon: Home, to: homePath() },
    { id: 'courses', label: 'Courses', icon: BookOpen, to: coursesPath() },
    { id: 'practice', label: 'Practice', icon: RotateCcw, to: practicePath(progress.activeLanguage) },
    { id: 'spellbook', label: 'Code reference', icon: LibraryBig, to: codebookPath(progress.activeLanguage) },
  ]

  useEffect(() => {
    if (!mobileNavOpen) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setMobileNavOpen(false)
      mobileMenuRef.current?.focus()
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [mobileNavOpen])

  return (
    <div className="app-shell workshop-shell" style={{ '--accent': track.accent, '--accent-soft': track.accentSoft } as React.CSSProperties}>
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <header className="workshop-topbar">
        <div className="workshop-topbar__inner">
          <BrandMark to={homePath()} />
          <button
            aria-controls="primary-navigation"
            aria-expanded={mobileNavOpen}
            aria-label={mobileNavOpen ? 'Close navigation' : 'Open navigation'}
            className="mobile-menu"
            onClick={() => setMobileNavOpen((open) => !open)}
            ref={mobileMenuRef}
          ><Menu /></button>
          <nav className={`workshop-nav ${mobileNavOpen ? 'is-open' : ''}`} id="primary-navigation" aria-label="Primary navigation">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <AppLink
                key={item.id}
                aria-current={view === item.id ? 'page' : undefined}
                className={view === item.id ? 'is-active' : ''}
                onClick={() => setMobileNavOpen(false)}
                to={item.to}
              >
                <Icon size={17} aria-hidden="true" /><span>{item.label}</span>
              </AppLink>
            )
          })}
          </nav>
          <div className="workshop-topbar__tools">
            <label className="track-switcher">
              <LanguageSymbol decorative language={track.id} size="small" />
              <select aria-label="Active language" value={progress.activeLanguage} onChange={(event) => onLanguageChange(event.target.value as LanguageId)}>
                {foundationTrackMetadata.map((item) => <option key={item.id} value={item.id}>{item.shortName}</option>)}
              </select>
              <ChevronDown size={14} aria-hidden="true" />
            </label>
            <span aria-label={`${progress.streak} day study streak`} className="workshop-stat"><Flame size={16} aria-hidden="true" /><b>{progress.streak}</b></span>
            <span aria-label={`${progress.xp} points`} className="workshop-stat"><Zap size={16} aria-hidden="true" /><b>{progress.xp} points</b></span>
            {authUser ? (
            <AppLink aria-current={view === 'profile' ? 'page' : undefined} className={`identity-chip ${view === 'profile' ? 'is-active' : ''}`} to="/profile" aria-label={`Learner record for ${authUser.login}`} title={`Signed in as ${authUser.login}`}>
              <Github size={15} aria-hidden="true" /><span>{authUser.login}</span>
            </AppLink>
          ) : (
            <button className="github-topbar" onClick={onSignIn} disabled={!authReady}>
              <Github size={16} aria-hidden="true" /><span>{authReady ? 'Sign in' : 'Checking'}</span>
            </button>
          )}
            {!authUser && <AppLink
              aria-current={view === 'profile' ? 'page' : undefined}
              className={`workshop-profile-link ${view === 'profile' ? 'is-active' : ''}`}
              to="/profile"
              aria-label="Learner record"
            ><UserRound size={18} /></AppLink>}
            <AppLink
              aria-current={view === 'settings' ? 'page' : undefined}
              className={`workshop-settings-link ${view === 'settings' ? 'is-active' : ''}`}
              to="/settings"
              aria-label="Settings"
            ><Settings size={18} /></AppLink>
          </div>
        </div>
      </header>
      <div className="app-frame">
        {children}
      </div>
    </div>
  )
}

function CourseSymbol({ course, size = 'medium' }: { course: Pick<CourseCardModel, 'language' | 'title'>; size?: 'small' | 'medium' | 'large' }) {
  return <LanguageSymbol language={course.language} size={size} />
}

function CourseCard({ course }: { course: CourseCardModel }) {
  const status = course.availability === 'locked'
    ? `Complete the ${course.missingPrerequisites.length === 1 ? 'item' : 'items'} below to start`
    : course.status === 'complete'
    ? 'Course complete'
    : course.status === 'in-progress'
      ? `${course.completedLessonCount} of ${course.lessonCount} lessons complete`
      : 'Not started'
  return (
    <article className={`course-card course-card--${course.language} course-card--${course.kind} ${course.availability === 'locked' ? 'course-card--locked' : ''}`}>
      <div className="course-card__heading">
        <CourseSymbol course={course} size="large" />
        <div><span>{course.level} course</span><h2>{course.title}</h2></div>
      </div>
      <p>{course.description}</p>
      <dl>
        <div><dt>What you will make</dt><dd>{course.outcome}</dd></div>
        <div><dt>Course size</dt><dd>{course.moduleCount} modules, {course.lessonCount} short lessons</dd></div>
      </dl>
      {course.missingPrerequisites.length > 0 && (
        <div className="course-card__prerequisites">
          <b><LockKeyhole size={15} /> Before you start</b>
          <ul>{course.missingPrerequisites.map((prerequisite) => (
            <li key={`${prerequisite.kind}:${prerequisite.id}`}>{prerequisite.label}</li>
          ))}</ul>
        </div>
      )}
      <div className="course-card__progress">
        <span><b>{status}</b><small>{course.progressPercent}%</small></span>
        <i aria-label={`${course.title} progress`} aria-valuemax={100} aria-valuemin={0} aria-valuenow={course.progressPercent} role="progressbar"><b style={{ width: `${course.progressPercent}%` }} /></i>
      </div>
      <AppLink className="primary-action" to={coursePath(course.id)}>{course.actionLabel} <ArrowRight size={17} /></AppLink>
    </article>
  )
}

function CourseCatalog({ progress }: { progress: LearnerProgress }) {
  const courses = buildCourseCards(progress)
  const foundationCourseCount = courses.filter((course) => course.kind === 'foundation').length
  const continuingCourses = courses.filter((course) => course.kind === 'continuing')
  const continuingCourseCopy = continuingCourses.length === 1
    ? `${continuingCourses[0].shortName} lists the earlier work you need before starting.`
    : 'Each next-step course lists the earlier work you need before starting.'
  const [filter, setFilter] = useState<'all' | 'foundations' | 'continuing' | 'projects'>('all')
  const filteredCourses = filter === 'foundations'
    ? courses.filter((course) => course.kind === 'foundation')
    : filter === 'continuing'
      ? courses.filter((course) => course.kind === 'continuing')
      : courses
  const showCourses = filter !== 'projects'
  const showProjects = filter === 'projects'
  return (
    <main className="workshop-page course-catalog" id="main-content" tabIndex={-1}>
      <header className="workshop-page-heading">
        <h1>Choose a course</h1>
        <p>The {foundationCourseCount} foundation {foundationCourseCount === 1 ? 'course starts' : 'courses start'} from the beginning. {continuingCourseCopy} Your progress is saved separately for each course.</p>
      </header>
      <nav className="catalog-filters" aria-label="Course filters">
        <button aria-pressed={filter === 'all'} className={filter === 'all' ? 'is-active' : ''} onClick={() => setFilter('all')} type="button">All courses</button>
        <button aria-pressed={filter === 'foundations'} className={filter === 'foundations' ? 'is-active' : ''} onClick={() => setFilter('foundations')} type="button">Foundation courses</button>
        <button aria-pressed={filter === 'continuing'} className={filter === 'continuing' ? 'is-active' : ''} onClick={() => setFilter('continuing')} type="button">Later courses</button>
        <button aria-pressed={filter === 'projects'} className={filter === 'projects' ? 'is-active' : ''} onClick={() => setFilter('projects')} type="button">Projects</button>
      </nav>
      {showCourses && <section className="course-grid" aria-label="Courses">
        {filteredCourses.map((course) => <CourseCard course={course} key={course.id} />)}
      </section>}
      {showProjects && <section className="guided-project-list" aria-labelledby="guided-projects-title">
        <div className="section-heading-open">
          <div><p className="eyebrow">Use what you learned</p><h2 id="guided-projects-title">Projects</h2></div>
          <p>Build a complete program in small steps, then download and keep it.</p>
        </div>
        {projectManifests.map((project) => (
          <AppLink
            className="guided-project-row guided-project-row--featured"
            key={`${project.language}-${project.id}`}
            to={projectPath(project.language, project.id)}
          >
            <LanguageSymbol language={project.language} />
            <span><small>{trackMetadata(project.language).shortName} project · {project.checkpoints.length} project steps</small><b>{project.title}</b><p>{project.subtitle}</p></span>
            <strong>Open project <ArrowRight size={16} /></strong>
          </AppLink>
        ))}
        {foundationTrackMetadata.map((track) => {
          const definition = courseDefinition(foundationCourseId(track.id))
          const capstoneMissionId = definition.missionIds.at(-1)
          if (!capstoneMissionId) return null
          return (
            <AppLink className="guided-project-row guided-project-row--capstone" key={capstoneMissionId} to={coursePath(track.id)}>
              <LanguageSymbol language={track.id} />
              <span><small>{track.shortName} final project</small><b>{track.capstoneTitle}</b><p>{track.capstoneDescription}</p></span>
              <strong>{courseMissionLessonIds(definition.id, capstoneMissionId).length} steps <ArrowRight size={16} /></strong>
            </AppLink>
          )
        })}
      </section>}
    </main>
  )
}

function countLanguageDueConcepts(
  track: LanguageTrack,
  progress: LearnerProgress,
  now = new Date(),
): number {
  const completedMissions = new Set(progress.completedMissions)
  const conceptIds = new Set<string>()
  track.missions.forEach((mission) => {
    if (!completedMissions.has(mission.id)) return
    mission.exercises.forEach((exercise) => conceptIds.add(exercise.conceptId))
  })
  publishedContinuingCourseIdsForLanguage(track.id).forEach((courseId) => {
    if (!courseIsAvailable(courseId, progress)) return
    const manifest = publishedContinuingCourseManifest(courseId)
    if (!manifest) return
    for (const module of manifest.modules) {
      if (!completedMissions.has(module.id)) break
      module.conceptIds.forEach((conceptId) => conceptIds.add(conceptId))
    }
  })
  const today = dateKey(now)
  return [...conceptIds].filter((conceptId) => {
    const concept = progress.conceptProgress[conceptId]
    return !concept || concept.dueAt <= today
  }).length
}

function LearnerHome({ progress, track: activeTrack }: { progress: LearnerProgress; track: LanguageTrack }) {
  const courses = buildCourseCards(progress)
  const activeCourse = buildCourseModel(activeTrack, progress)
  const reviewsDue = countLanguageDueConcepts(activeTrack, progress)
  const coursesById = new Map(courses.map((course) => [course.id, course]))
  let readyProject = undefined as (typeof projectManifests)[number] | undefined
  let continuingCourse = undefined as CourseCardModel | undefined

  for (const unit of publishedLearningUnitsForLanguage(progress.activeLanguage)) {
    if (unit.kind === 'project') {
      const project = projectManifestByRoute(progress.activeLanguage, unit.projectId)
      if (!project) break
      readyProject = project
      if (!progress.completedProjects.includes(project.id)) break
      continue
    }

    const course = coursesById.get(unit.courseId)
    if (!course) break
    if (unit.stage === 'foundation') {
      if (course.status !== 'complete') break
      continue
    }
    if (course.availability !== 'available') break
    continuingCourse = course
    if (course.status !== 'complete') break
  }

  const completedProjectCheckpointCount = readyProject?.checkpoints.filter((checkpoint) => (
    progress.completedProjectCheckpoints.includes(checkpoint.id)
  )).length ?? 0
  const nextProjectCheckpoint = readyProject?.checkpoints.find((checkpoint) => (
    !progress.completedProjectCheckpoints.includes(checkpoint.id)
  ))
  const projectComplete = readyProject
    ? progress.completedProjects.includes(readyProject.id)
    : false
  const continueCourse = continuingCourse ?? activeCourse
  const continueTo = continuingCourse
    ? continuingCourse.currentModuleId && continuingCourse.currentLessonId
      ? lessonPath(continuingCourse.id, continuingCourse.currentModuleId, continuingCourse.currentLessonId)
      : coursePath(continuingCourse.id)
    : readyProject
    ? completedProjectCheckpointCount > 0 && nextProjectCheckpoint && !projectComplete
      ? projectPath(readyProject.language, readyProject.id, nextProjectCheckpoint.id)
      : projectPath(readyProject.language, readyProject.id)
    : activeCourse.currentModuleId && activeCourse.currentLessonId
      ? lessonPath(activeCourse.id, activeCourse.currentModuleId, activeCourse.currentLessonId)
      : coursePath(activeCourse.id)
  const continueEyebrow = continuingCourse
    ? continuingCourse.status === 'complete'
      ? 'Course complete'
      : continuingCourse.status === 'in-progress'
        ? `Continue ${continuingCourse.shortName}`
        : 'Your next course'
    : readyProject
    ? projectComplete ? 'Project complete' : completedProjectCheckpointCount > 0 ? 'Continue your project' : 'Your next step'
    : 'Continue learning'
  const continueTitle = continuingCourse
    ? continuingCourse.title
    : readyProject
    ? readyProject.title
    : activeCourse.currentLessonTitle ?? activeCourse.title
  const continueDescription = continuingCourse
    ? continuingCourse.currentModuleTitle
      ? `Next module: ${continuingCourse.currentModuleTitle}.`
      : continuingCourse.outcome
    : readyProject
    ? projectComplete
      ? readyProject.completionDescription
      : completedProjectCheckpointCount > 0
        ? `${completedProjectCheckpointCount} of ${readyProject.checkpoints.length} project steps complete. Your browser saved the code for your next step.`
        : readyProject.subtitle
    : activeCourse.currentModuleTitle
      ? `${activeCourse.title}, Module ${activeCourse.modules.find((item) => item.id === activeCourse.currentModuleId)?.number}: ${activeCourse.currentModuleTitle}`
      : activeCourse.outcome
  const continueAction = continuingCourse
    ? continuingCourse.status === 'complete'
      ? 'Review course'
      : continuingCourse.status === 'in-progress'
        ? 'Continue course'
        : 'Start course'
    : readyProject
    ? projectComplete ? 'Review project' : completedProjectCheckpointCount > 0 ? 'Continue project' : 'Start project'
    : activeCourse.status === 'complete' ? 'Review course' : 'Continue lesson'
  const today = new Date()
  const days = Array.from({ length: 7 }, (_, offset) => {
    const date = new Date(today)
    date.setDate(today.getDate() - (6 - offset))
    return {
      key: dateKey(date),
      label: date.toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 2),
      today: offset === 6,
    }
  })

  return (
    <main className="workshop-page learner-home" id="main-content" tabIndex={-1}>
      <header className="learner-welcome">
        <div><h1>Welcome back, {progress.callsign}.</h1></div>
        <div className="daily-goal-open"><span>{Math.min(progress.dailyXp, progress.dailyGoal)} / {progress.dailyGoal} points today</span><i aria-label="Daily point goal" aria-valuemax={progress.dailyGoal} aria-valuemin={0} aria-valuenow={Math.min(progress.dailyXp, progress.dailyGoal)} role="progressbar"><b style={{ width: `${Math.min(100, (progress.dailyXp / progress.dailyGoal) * 100)}%` }} /></i></div>
      </header>

      <section className={`continue-panel continue-panel--${continueCourse.language}`}>
        <CourseSymbol course={continueCourse} size="large" />
        <div>
          <p className="eyebrow">{continueEyebrow}</p>
          <h2>{continueTitle}</h2>
          <p>{continueDescription}</p>
        </div>
        <AppLink className="primary-action" to={continueTo}>{continueAction} <ArrowRight size={17} /></AppLink>
      </section>

      <div className="learner-home-grid">
        <section className="activity-panel" aria-labelledby="activity-title">
          <div className="section-heading-open"><div><h2 id="activity-title">This week</h2></div><b>{progress.streak} day streak</b></div>
          <div className="activity-days">
            {days.map((day) => <div className={day.today && progress.dailyXp > 0 ? 'has-study' : ''} key={day.key}><span>{day.label}</span><i>{day.today && progress.dailyXp > 0 ? <Check size={15} /> : ''}</i></div>)}
          </div>
          <p>Only today’s activity is available.</p>
        </section>
        <section className="review-open" aria-labelledby="review-title">
          <div><RotateCcw size={22} /><span><p className="eyebrow">Practice</p><h2 id="review-title">{reviewsDue === 0 ? 'Nothing to review yet' : `${reviewsDue} ${reviewsDue === 1 ? 'idea is' : 'ideas are'} ready`}</h2></span></div>
          <p>{reviewsDue === 0 ? 'Practice starts after you finish a module.' : 'Review a few ideas you learned earlier.'}</p>
          <AppLink to={practicePath(progress.activeLanguage)}>{reviewsDue === 0 ? 'Open practice' : 'Start practice'} <ArrowRight size={16} /></AppLink>
        </section>
      </div>

      <section className="home-course-list" aria-labelledby="my-courses-title">
        <div className="section-heading-open"><div><h2 id="my-courses-title">Your courses</h2></div><AppLink to={coursesPath()}>Browse all courses <ArrowRight size={16} /></AppLink></div>
        {courses.map((course) => (
          <AppLink className={`home-course-row ${course.availability === 'locked' ? 'is-locked' : ''}`} key={course.id} to={coursePath(course.id)}>
            <CourseSymbol course={course} />
            <span><b>{course.title}</b><small>{course.availability === 'locked' ? 'Complete earlier work first' : course.status === 'not-started' ? 'Not started' : `${course.completedLessonCount} of ${course.lessonCount} lessons complete`}</small></span>
            <i aria-label={`${course.title} progress`} aria-valuemax={100} aria-valuemin={0} aria-valuenow={course.progressPercent} role="progressbar"><b style={{ width: `${course.progressPercent}%` }} /></i>
            <strong>{course.actionLabel} <ArrowRight size={15} /></strong>
          </AppLink>
        ))}
      </section>
    </main>
  )
}

function MissionPath({
  onProgress,
  progress,
  track,
}: {
  onProgress: Dispatch<SetStateAction<LearnerProgress>>
  progress: LearnerProgress
  track: LanguageTrack
}) {
  const course = buildCourseModel(track, progress)
  const [expandedModule, setExpandedModule] = useState(course.currentModuleId ?? course.modules[0]?.id ?? '')
  const [completionNotice, setCompletionNotice] = useState('')
  const [focusModuleId, setFocusModuleId] = useState<string | null>(null)
  const moduleSummaryRefs = useRef(new Map<string, HTMLButtonElement>())
  const currentModule = course.modules.find((module) => module.id === course.currentModuleId)
  const currentLesson = currentModule?.lessons.find((lesson) => lesson.id === course.currentLessonId)
  const continueTo = currentModule && currentLesson
    ? lessonPath(track.id, currentModule.id, currentLesson.id)
    : coursePath(track.id)
  const guidedProjectUnit = publishedProjectUnitAfterCourse(track.id, course.id)
  const guidedProject = guidedProjectUnit
    ? projectManifestByRoute(track.id, guidedProjectUnit.projectId)
    : undefined

  useEffect(() => {
    if (!focusModuleId) return
    const timer = window.setTimeout(() => {
      moduleSummaryRefs.current.get(focusModuleId)?.focus({ preventScroll: true })
      setFocusModuleId(null)
    }, 0)
    return () => window.clearTimeout(timer)
  }, [course.currentModuleId, focusModuleId])

  const handleFinishModule = (moduleId: string) => {
    const moduleIndex = course.modules.findIndex((module) => module.id === moduleId)
    const nextModule = course.modules[moduleIndex + 1]
    const focusTarget = nextModule ?? course.modules[moduleIndex]
    setExpandedModule(focusTarget?.id ?? '')
    setFocusModuleId(focusTarget?.id ?? null)
    setCompletionNotice(nextModule
      ? `Module complete. Module ${nextModule.number} is ready.`
      : 'Module complete. The final project is ready.')
    onProgress((current) => completeMission(current, moduleId))
  }

  return (
    <main className="workshop-page course-outline" id="main-content" tabIndex={-1}>
      <AppLink className="back-link" to={coursesPath()}><ArrowLeft size={16} /> All courses</AppLink>
      <header className={`course-hero course-hero--${track.id}`}>
        <CourseSymbol course={course} size="large" />
        <div><p className="eyebrow">Beginner course</p><h1>{course.title}</h1><p>{course.description}</p><span>{course.moduleCount} modules · {course.lessonCount} short lessons · {course.level}</span></div>
        <div className="course-hero__action"><b>{course.completedLessonCount} of {course.lessonCount} lessons complete</b><small>{course.progressPercent}% of course</small><i aria-label={`${course.title} progress`} aria-valuemax={100} aria-valuemin={0} aria-valuenow={course.progressPercent} role="progressbar"><span style={{ width: `${course.progressPercent}%` }} /></i><AppLink className="primary-action" to={continueTo}>{course.actionLabel} <ArrowRight size={17} /></AppLink></div>
      </header>

      <section className="course-modules" aria-labelledby="course-content-title">
        <div className="section-heading-open"><div><h2 id="course-content-title">Modules</h2></div><p>Open a module to see its lessons.</p></div>
        {completionNotice && <p className="module-completion-status" role="status">{completionNotice}</p>}
        {course.modules.map((module) => {
          const expanded = expandedModule === module.id
          const readyToFinish = !module.completed
            && module.availability === 'available'
            && module.completedLessonCount === module.lessonCount
          return (
            <article className={`module-row ${module.completed ? 'is-complete' : ''} ${module.current ? 'is-current' : ''}`} key={module.id}>
              <button
                className="module-row__summary"
                aria-controls={`module-${module.id}-lessons`}
                aria-expanded={expanded}
                onClick={() => setExpandedModule(expanded ? '' : module.id)}
                ref={(node) => {
                  if (node) moduleSummaryRefs.current.set(module.id, node)
                  else moduleSummaryRefs.current.delete(module.id)
                }}
              >
                <span className="module-number">{module.completed ? <Check size={17} /> : module.availability === 'available' ? module.number : <LockKeyhole size={15} />}</span>
                <span><small>{module.kind === 'guided-project' ? 'Final project' : `Module ${module.number}`}</small><b>{module.title}</b><p>{module.description}</p></span>
                <strong>{module.completedLessonCount} of {module.lessonCount} lessons complete</strong>
                <ChevronDown size={19} />
              </button>
              <div className="module-lessons" hidden={!expanded} id={`module-${module.id}-lessons`}>
                  {module.lessons.map((lesson) => {
                    const canOpen = module.availability === 'available'
                    return canOpen ? (
                      <AppLink aria-current={lesson.current ? 'step' : undefined} className={lesson.current ? 'is-current' : ''} key={lesson.id} to={lessonPath(track.id, module.id, lesson.id)}>
                        <span>{lesson.completed ? <Check size={15} /> : lesson.number}</span><b>{lesson.title}</b><small>{lesson.completed ? 'Complete' : lesson.current ? 'Next lesson' : 'Start lesson'} · {lessonActivityLabel(lesson.type)}</small><ArrowRight size={15} />
                      </AppLink>
                    ) : (
                      <div className="is-locked" key={lesson.id}><span><LockKeyhole size={13} /></span><b>{lesson.title}</b><small>{module.availability === 'available' ? 'Complete this module in order' : 'Complete the previous module first'}</small></div>
                    )
                  })}
              </div>
              {expanded && readyToFinish && (
                <div className="module-finish-callout">
                  <span>
                    <b>Every lesson is complete.</b>
                    <small>Finish this module to continue.</small>
                  </span>
                  <button className="primary-action" onClick={() => handleFinishModule(module.id)}>Finish module <ArrowRight size={17} /></button>
                </div>
              )}
            </article>
          )
        })}
      </section>
      {guidedProject && (
        <section className="course-project-next" aria-labelledby="course-project-next-title">
          <LanguageSymbol language={guidedProject.language} size="large" />
          <div>
            <p className="eyebrow">Final project</p>
            <h2 id="course-project-next-title">{guidedProject.title}</h2>
            <p>{guidedProject.subtitle}</p>
            <span>{guidedProject.checkpoints.length} project steps · {guidedProject.duration} · {guidedProject.downloadLabel}</span>
          </div>
          <AppLink className="primary-action" to={projectPath(guidedProject.language, guidedProject.id)}>
            {progress.completedProjects.includes(guidedProject.id)
              ? 'Review project'
              : course.status === 'complete' ? 'Open project' : 'Preview project'} <ArrowRight size={17} />
          </AppLink>
        </section>
      )}
    </main>
  )
}

function reviewDateLabel(value: string | null): string | null {
  if (!value) return null
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
  })
}

function practiceReasonLabel(item: AdaptivePracticeSession['items'][number], today: string): string {
  if (item.reason === 'weak') return 'Needs practice'
  if (item.reason === 'fresh') return 'Recently learned'
  return item.progress.dueAt < today ? 'Review now' : 'Review today'
}

function PracticeBay({ progress, trackOverride: track }: { progress: LearnerProgress; trackOverride: LanguageTrack }) {
  const recommendation = recommendPractice(track, progress)
  const { deferredDueCount, dueConcepts, items, mode, nextReviewAt, starterMission } = recommendation
  const questionCount = items.length
  const estimatedMinutes = Math.max(2, questionCount * 2)
  const firstLesson = starterMission.exercises[0]
  const nextReviewLabel = reviewDateLabel(nextReviewAt)
  const heroTitle = mode === 'start'
    ? 'Finish a module to use Practice'
    : mode === 'due'
      ? 'A review is ready'
      : 'No review is due'
  const heroText = mode === 'start'
    ? `Start with ${firstLesson?.title ?? starterMission.title}. Practice uses questions from modules you complete.`
    : mode === 'due'
      ? `These ${questionCount} questions come from modules you completed.${deferredDueCount > 0 ? ` Another ${deferredDueCount} ${deferredDueCount === 1 ? 'question will' : 'questions will'} appear in a later set.` : ''}`
      : mode === 'weak'
        ? 'No review is due, but you can still practice a few completed lessons.'
        : `No review is due.${nextReviewLabel ? ` The next review is ${nextReviewLabel}.` : ''} You can still practice now.`

  useEffect(() => {
    clearPracticeSession(track.id, practiceSessionStorage())
  }, [track.id])

  return (
    <main className="content-page" id="main-content" tabIndex={-1}>
      <div className="page-heading page-heading--simple">
        <div><p className="kicker"><RotateCcw size={14} /> Review</p><h1>Practice</h1><p>Answer a few questions from modules you completed.</p></div>
      </div>
      <section className="practice-hero">
        <LanguageSymbol language={track.id} size="large" />
        <div>
          <small>{mode === 'start' ? 'Finish one module first' : `${questionCount} ${questionCount === 1 ? 'question' : 'questions'} · about ${estimatedMinutes} minutes`}</small>
          <h2>{heroTitle}</h2>
          <p>{heroText}</p>
        </div>
        {mode === 'start' && firstLesson ? (
          <AppLink className="primary-action" to={lessonPath(track.id, starterMission.id, firstLesson.id)}>
            Start your first lesson <ArrowRight size={17} />
          </AppLink>
        ) : (
          <AppLink className="primary-action" to={practiceSessionPath(track.id)}>
            {mode === 'due' ? `Start ${questionCount}-question review` : `Practice ${questionCount} familiar ${questionCount === 1 ? 'idea' : 'ideas'}`} <ArrowRight size={17} />
          </AppLink>
        )}
      </section>
      {items.length > 0 && (
        <section className="practice-plan" aria-labelledby="practice-plan-title">
          <div className="section-heading-open">
            <div><h2 id="practice-plan-title">Questions</h2></div>
            <p>Every question comes from a completed {track.shortName} module.</p>
          </div>
          <ol aria-label="Practice questions" role="list">
            {items.map((item, index) => (
              <li key={item.exercise.id}>
                <span>{index + 1}</span>
                <div>
                  <b>{conceptDisplayName(track, item.conceptId)}</b>
                  <small>From {item.missionTitle}</small>
                </div>
                <strong>{practiceReasonLabel(item, recommendation.generatedFor)}</strong>
              </li>
            ))}
          </ol>
          <p className="practice-plan__note">
            Practice does not change course completion or rewards.
            {deferredDueCount > 0 && ` The remaining ${deferredDueCount} ${deferredDueCount === 1 ? 'question will' : 'questions will'} appear in a later set.`}
          </p>
        </section>
      )}
      {dueConcepts.length > 0 && (
        <details className="practice-plain-note">
          <summary>How Practice chooses questions</summary>
          <p>Practice uses questions from completed modules. Your answers help choose later practice questions. Practice answers and code are not added to your saved learning record.</p>
        </details>
      )}
    </main>
  )
}

interface PracticeSessionRouteProps {
  onNavigate: (path: string) => void
  onProgress: Dispatch<SetStateAction<LearnerProgress>>
  practiceStep: number
  progress: LearnerProgress
  trackOverride: LanguageTrack
}

function PracticeSessionRoute({ onNavigate, onProgress, practiceStep, progress, trackOverride }: PracticeSessionRouteProps) {
  const track = trackOverride
  const [session] = useState(() => loadOrCreatePracticeSession(
    track,
    progress,
    practiceSessionStorage(),
  ))
  const mission = useMemo<Mission>(() => ({
    id: `${track.id}-adaptive-practice`,
    language: track.id,
    chapter: 0,
    title: `${track.shortName} review`,
    subtitle: 'A short review from completed modules',
    description: 'Authored exercises selected from completed course material.',
    duration: `${Math.max(2, session.items.length * 2)} min`,
    icon: 'terminal',
    status: 'available',
    exercises: session.items.map((item) => item.exercise),
  }), [session.items, track.id, track.shortName])
  const activeItem = session.items[practiceStep - 1]

  if (session.items.length === 0 || !activeItem) {
    return (
      <main className="route-message-page" id="main-content" tabIndex={-1}>
        <BrandMark />
        <section className="route-message-card">
          <p className="kicker"><RotateCcw size={15} /> Practice</p>
          <h1>{session.items.length === 0 ? 'Finish a module before starting practice' : 'That review step is no longer available'}</h1>
          <p>{session.items.length === 0
            ? 'Practice uses only ideas from modules you have already completed.'
            : 'The saved review set is shorter than this address expects. Build a fresh set from the Practice page.'}</p>
          <AppLink className="primary-action" to={practicePath(track.id)}>Back to Practice <ArrowRight size={17} /></AppLink>
        </section>
      </main>
    )
  }

  return (
    <Suspense fallback={<LessonPlayerFallback practice />}>
      <LessonPlayer
        initialExerciseId={activeItem.exercise.id}
        mission={mission}
        onExerciseChange={(exerciseId) => {
          const nextIndex = session.items.findIndex((item) => item.exercise.id === exerciseId)
          if (nextIndex >= 0) onNavigate(practiceSessionPath(track.id, nextIndex + 1))
        }}
        onPracticeComplete={() => clearPracticeSession(track.id, practiceSessionStorage())}
        practiceSession={session}
        progress={progress}
        onProgress={onProgress}
        onExit={() => onNavigate(practicePath(track.id))}
      />
    </Suspense>
  )
}

interface CadetRecordProps {
  onOpenCourse: (courseId: CourseId, language: LanguageId) => void
  progress: LearnerProgress
  recordLocation: string
}

function CadetRecord({ onOpenCourse, progress, recordLocation }: CadetRecordProps) {
  const concepts = Object.values(progress.conceptProgress)
  const answers = concepts.reduce((sum, item) => sum + item.correct + item.incorrect, 0)
  const accuracy = answers ? Math.round((concepts.reduce((sum, item) => sum + item.correct, 0) / answers) * 100) : 0
  const courses = buildCourseCards(progress)
  const continuingCourses = courses.filter((course) => course.kind === 'continuing')
  const courseRecordDescription = continuingCourses.length === 1
    ? `${continuingCourses[0].shortName} progress is tracked separately from its beginner course.`
    : 'Later-course progress is tracked separately from beginner courses.'

  return (
    <main className="content-page" id="main-content" tabIndex={-1}>
      <div className="page-heading page-heading--simple"><div><p className="kicker"><UserRound size={14} /> LEARNER RECORD</p><h1>{progress.callsign}</h1><p>{recordLocation}</p></div></div>
      <div className="record-grid">
        <article><Zap /><span><b>{progress.xp}</b><small>Total points</small></span></article>
        <article><Flame /><span><b>{progress.streak}</b><small>Day streak</small></span></article>
        <article><Trophy /><span><b>{progress.completedMissions.length}</b><small>Modules</small></span></article>
        <article><CheckCircle2 /><span><b>{accuracy}%</b><small>Accuracy</small></span></article>
      </div>
      <section className="station-records" aria-labelledby="course-records-title">
        <div className="station-records__heading">
          <div><h2 id="course-records-title">Courses</h2></div>
          <p>{courses.length} courses. {courseRecordDescription}</p>
        </div>
        <div className="station-records__grid">
          {courses.map((course) => {
            const track = trackMetadata(course.language)
            return (
              <article key={course.id} style={{ '--station-accent': track.accent } as React.CSSProperties}>
                <div className="station-records__name"><LanguageSymbol language={course.language} size="small" /><span><b>{course.title}</b><small>{course.kind === 'foundation' ? 'Beginner course' : 'Continuing course'}</small></span></div>
                <div className="station-records__count"><b>{course.completedModuleCount} / {course.moduleCount}</b><small>modules complete</small></div>
                <div className="station-records__bar" aria-label={`${course.title} ${course.progressPercent}% complete`} aria-valuemax={100} aria-valuemin={0} aria-valuenow={course.progressPercent} role="progressbar"><span style={{ width: `${course.progressPercent}%` }} /></div>
                <button className="secondary-action" onClick={() => onOpenCourse(course.id, course.language)}>
                  {course.actionLabel} <ArrowRight size={15} />
                </button>
              </article>
            )
          })}
        </div>
      </section>
    </main>
  )
}

interface SettingsPageProps {
  authBusy: boolean
  authUser: AuthUser | null
  onDeleteAccountData: () => void
  onDailyGoalChange: (goal: number) => void
  onLogout: () => void
  onDownloadBackup: () => string
  onReset: () => void
  onRestoreBackup: (text: string) => string
  onSignIn: () => void
  onSyncNow: () => void
  progress: LearnerProgress
  syncBusy: boolean
  syncMessage: string
  syncState: ProgressSyncState
  syncUpdatedAt: string | null
}

function SettingsPage({
  authBusy,
  authUser,
  onDailyGoalChange,
  onDeleteAccountData,
  onDownloadBackup,
  onLogout,
  onReset,
  onRestoreBackup,
  onSignIn,
  onSyncNow,
  progress,
  syncBusy,
  syncMessage,
  syncState,
  syncUpdatedAt,
}: SettingsPageProps) {
  const restoreInput = useRef<HTMLInputElement>(null)
  const [backupMessage, setBackupMessage] = useState('')

  const restoreFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    try {
      setBackupMessage(onRestoreBackup(await file.text()))
    } catch {
      setBackupMessage('That backup file could not be read. Your current progress was not changed.')
    }
  }

  const accountDescription = !authUser
    ? 'Sign in to save your progress to your account and continue on another device.'
    : syncState === 'synced'
      ? `Your progress is saved to your account${syncUpdatedAt ? ` as of ${new Date(syncUpdatedAt).toLocaleString()}` : ''}.`
      : syncState === 'needs-choice'
        ? 'Choose which progress to keep, or combine the progress from this browser and your account.'
        : syncState === 'offline'
          ? 'Your account could not be reached. Your progress is still saved in this browser.'
          : syncState === 'local-only'
            ? 'Your progress is saved in this browser. Save it to your account when you are ready.'
            : syncState === 'saving' || syncState === 'checking'
              ? 'Checking your account and saving your progress.'
              : 'Your account needs attention. Your progress is still saved in this browser.'

  return (
    <main className="content-page" id="main-content" tabIndex={-1}>
      <div className="page-heading page-heading--simple">
        <div><h1>Settings</h1><p>Your account, daily goal, backup, and learning data.</p></div>
      </div>
      <section className="account-panel">
        <span className="account-panel__icon"><Github size={24} /></span>
        <div>
          <small>GitHub account</small>
          <h2>{authUser ? `Signed in as ${authUser.login}` : 'No account connected'}</h2>
          <p>{accountDescription}</p>
          {authUser && syncMessage && <p className="account-panel__status" role="status">{syncMessage}</p>}
        </div>
        {authUser ? (
          <div className="account-panel__actions">
            <button className="secondary-action" onClick={onSyncNow} disabled={syncBusy || syncState === 'needs-choice'}>
              <RefreshCw size={16} /> {syncBusy ? 'Saving' : 'Save to account'}
            </button>
            <button className="secondary-action" onClick={onLogout} disabled={authBusy}>
              <LogOut size={16} /> {authBusy ? 'Signing out' : 'Sign out'}
            </button>
          </div>
        ) : (
          <button className="secondary-action" onClick={onSignIn} disabled={authBusy}>
            <Github size={16} /> Sign in with GitHub
          </button>
        )}
      </section>
      <section className="training-goal-panel" aria-labelledby="training-goal-title">
        <div>
          <h2 id="training-goal-title">Daily goal</h2>
          <p>The goal is a reminder, not a deadline. Missing it never locks a lesson or removes progress.</p>
        </div>
        <div className="training-goal-panel__options" aria-label="Daily study goal">
          {[5, 10, 15].map((goal) => (
            <button
              key={goal}
              className="secondary-action"
              aria-pressed={progress.dailyGoal === goal}
              onClick={() => onDailyGoalChange(goal)}
            >
              <Clock3 size={15} /> {goal} points
            </button>
          ))}
        </div>
      </section>
      <section className="backup-panel">
        <span className="account-panel__icon"><Download size={24} /></span>
        <div>
          <h2>Progress backup</h2>
          <p>A backup is a small .json text file that this site can read. It contains your learner name, points, completed modules, study streak, and review schedule. Keep it somewhere you control. Restoring checks the file before replacing progress in this browser. If you save progress to your account, the restored progress is saved there too.</p>
          {backupMessage && <p className="backup-panel__status" role="status">{backupMessage}</p>}
        </div>
        <div className="backup-panel__actions">
          <button className="secondary-action" onClick={() => setBackupMessage(onDownloadBackup())}>
            <Download size={16} /> Download backup file
          </button>
          <button className="secondary-action" onClick={() => restoreInput.current?.click()}>
            <Upload size={16} /> Restore from file
          </button>
          <input
            ref={restoreInput}
            className="sr-only"
            type="file"
            accept="application/json,.json"
            aria-label="Choose progress backup file"
            onChange={restoreFile}
          />
        </div>
      </section>
      {authUser && (
        <section className="settings-panel settings-panel--danger">
          <div>
            <h2>Delete progress saved to your account</h2>
            <p>This permanently removes the learning progress saved to your account. It does not delete the progress in this browser, your GitHub account, or your GitHub sign-in permission.</p>
          </div>
          <button className="danger-button" onClick={onDeleteAccountData} disabled={syncBusy}>
            <Trash2 size={16} /> Delete saved account progress
          </button>
        </section>
      )}
      <section className="settings-panel">
        <div><h2>Reset learning progress</h2><p>Resetting removes your learner name, course and project completion, points, study streak, daily goal, and review schedule from this browser. Saved project code and check summaries stay in this browser. If you save progress to your account, the reset is saved there too.</p></div>
        <button className="danger-button" onClick={onReset}><RotateCcw size={16} /> Reset learning progress</button>
      </section>
    </main>
  )
}

function authNoticeFromLocation(): string | null {
  const url = new URL(window.location.href)
  if (url.searchParams.get('auth') === 'success') return 'Signed in with GitHub.'
  if (url.searchParams.get('auth') !== 'error') return null

  const reason = url.searchParams.get('reason')
  if (reason === 'cancelled') return 'GitHub sign-in was cancelled. Your progress in this browser was not changed.'
  if (reason === 'not-configured') return 'GitHub sign-in is not configured yet.'
  return 'GitHub sign-in could not be completed. Please try again.'
}

function AuthNotice({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div className="auth-notice" role="status">
      <Github size={18} />
      <span>{message}</span>
      <button onClick={onDismiss} aria-label="Dismiss sign-in message"><X size={16} /></button>
    </div>
  )
}

interface SyncChoiceDialogProps {
  busy: boolean
  local: LearnerProgress
  onChoose: (choice: 'combine' | 'local' | 'remote') => void
  onLater: () => void
  remote: RemoteProgressRecord | null
}

function SyncChoiceDialog({ busy, local, onChoose, onLater, remote }: SyncChoiceDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (typeof dialog.showModal === 'function') dialog.showModal()
    else dialog.setAttribute('open', '')
    return () => {
      if (typeof dialog.close === 'function' && dialog.open) dialog.close()
    }
  }, [])

  return (
    <dialog
      aria-labelledby="sync-dialog-title"
      className="sync-dialog-backdrop"
      onCancel={(event) => {
        event.preventDefault()
        if (!busy) onLater()
      }}
      ref={dialogRef}
    >
      <section className="sync-dialog">
        <div className="sync-dialog__icon"><Cloud size={26} /></div>
        <div>
          <p className="kicker">SAVE PROGRESS</p>
          <h2 id="sync-dialog-title">{remote ? 'Choose which progress to keep' : 'Save this browser’s progress to your account?'}</h2>
          <p>
            {remote
              ? 'This browser and your account have different progress. Nothing will be replaced until you choose.'
              : 'Your completed modules, points, study streak, settings, and review schedule can follow you to another signed-in device.'}
          </p>
        </div>
        {remote && (
          <div className="sync-dialog__records">
            <article><small>THIS BROWSER</small><b>{local.xp} points · {local.completedMissions.length} modules</b><span>{local.callsign || 'Unnamed learner'}</span></article>
            <article><small>SAVED ACCOUNT</small><b>{remote.progress.xp} points · {remote.progress.completedMissions.length} modules</b><span>Updated {new Date(remote.updatedAt).toLocaleString()}</span></article>
          </div>
        )}
        <div className="sync-dialog__actions">
          {remote ? (
            <>
              <button autoFocus className="primary-action" onClick={() => onChoose('combine')} disabled={busy}>Combine both</button>
              <button className="secondary-action" onClick={() => onChoose('local')} disabled={busy}>Use progress from this browser</button>
              <button className="secondary-action" onClick={() => onChoose('remote')} disabled={busy}>Use progress saved to account</button>
            </>
          ) : (
            <button autoFocus className="primary-action" onClick={() => onChoose('local')} disabled={busy}>Save progress to account</button>
          )}
          <button className="text-action" onClick={onLater} disabled={busy}>Decide later</button>
        </div>
        <p className="sync-dialog__fine-print">
          <Shield size={14} /> SeePoundCoffeePie stores only your learning progress. It does not retain submitted code, GitHub tokens, email, or raw IP addresses here.
        </p>
      </section>
    </dialog>
  )
}

function NotFoundPage({ progress }: { progress: LearnerProgress }) {
  return <RouteNotFoundPage brand={<BrandMark />} progress={progress} />
}

function AppContent() {
  const [location, setLocation] = useState<BrowserLocation>(readBrowserLocation)
  const route = useMemo(() => parseAppRoute(location.pathname, location.search), [location.pathname, location.search])
  const routedCourse = useMemo(
    () => route.courseId ? courseDefinition(route.courseId) : null,
    [route.courseId],
  )
  const [progress, setProgress] = useState<LearnerProgress>(() => {
    const loaded = loadProgress()
    const initialRoute = parseAppRoute(window.location.pathname, window.location.search)
    if (initialRoute.language && routeSetsLanguagePreference(initialRoute)) {
      return { ...loaded, activeLanguage: initialRoute.language }
    }
    return loaded
  })
  const [authUser, setAuthUser] = useState<AuthUser | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [authBusy, setAuthBusy] = useState(false)
  const [authNotice, setAuthNotice] = useState<string | null>(() => authNoticeFromLocation())
  const [syncBusy, setSyncBusy] = useState(false)
  const [syncChoice, setSyncChoice] = useState<RemoteProgressRecord | null | undefined>(undefined)
  const [syncMessage, setSyncMessage] = useState('')
  const [syncRecord, setSyncRecord] = useState<RemoteProgressRecord | null>(null)
  const [syncState, setSyncState] = useState<ProgressSyncState>('guest')
  const [practicePublication, setPracticePublication] = useState<{
    key: string
    result: PracticeTrackLoadResult
  } | null>(null)
  const [foundationTracks, setFoundationTracks] = useState<Partial<Record<LanguageId, LanguageTrack | null>>>({})
  const progressRef = useRef(progress)
  const syncEnabledRef = useRef(false)
  const syncRevisionRef = useRef(0)
  const syncedSnapshotRef = useRef<string | null>(null)

  const view: ViewId = route.page === 'home'
    ? 'home'
    : route.page === 'courses' || route.page === 'course' || route.page === 'academy' || route.page === 'project'
      ? 'courses'
      : route.page === 'practice' || route.page === 'practice-session' || (route.page === 'lesson' && route.practice)
    ? 'practice'
    : route.page === 'codebook'
      ? 'spellbook'
      : route.page === 'profile' || route.page === 'portfolio'
        ? 'profile'
        : route.page === 'settings'
          ? 'settings'
          : 'path'

  const foundationTrackLanguage = route.page === 'home'
    || route.page === 'academy'
    || route.page === 'practice'
    || route.page === 'practice-session'
    || (route.page === 'course' && routedCourse?.kind === 'foundation')
    || (route.page === 'lesson' && routedCourse?.kind !== 'continuing')
    ? route.language ?? routedCourse?.language ?? progress.activeLanguage
    : null
  const foundationTrackRequest = useMemo(() => (
    foundationTrackLanguage
      ? foundationCourseContentRequestForLanguage(foundationTrackLanguage)
      : undefined
  ), [foundationTrackLanguage])
  const foundationTrack = foundationTrackLanguage
    ? foundationTracks[foundationTrackLanguage]
    : undefined

  useEffect(() => {
    if (
      !foundationTrackLanguage
      || !foundationTrackRequest
      || Object.prototype.hasOwnProperty.call(foundationTracks, foundationTrackLanguage)
    ) return
    let active = true
    void foundationTrackRequest.then((content) => {
      if (!active) return
      setFoundationTracks((current) => ({
        ...current,
        [foundationTrackLanguage]: content?.track ?? null,
      }))
    })
    return () => { active = false }
  }, [foundationTrackLanguage, foundationTrackRequest, foundationTracks])

  const practicePublicationKey = useMemo(() => (
    foundationTrack && (route.page === 'practice' || route.page === 'practice-session')
      ? JSON.stringify([
          foundationTrack.id,
          progress.completedMissions,
          progress.completedProjects,
        ])
      : null
  ), [foundationTrack, progress.completedMissions, progress.completedProjects, route.page])
  const currentPracticePublication = practicePublication?.key === practicePublicationKey
    ? practicePublication.result
    : null
  const practiceTrack = currentPracticePublication?.ok
    ? currentPracticePublication.track
    : null
  const practiceLoadFailed = currentPracticePublication?.ok === false
  useEffect(() => {
    if (!practicePublicationKey || !foundationTrack) return
    let active = true
    void loadPracticeTrackForSurface(
      publishedPracticeSurface,
      foundationTrack,
      progress,
    ).then((result) => {
      if (active) setPracticePublication({ key: practicePublicationKey, result })
    })
    return () => { active = false }
  }, [foundationTrack, practicePublicationKey, progress])

  useEffect(() => {
    progressRef.current = progress
    saveProgress(progress)
  }, [progress])

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 })
    const timer = window.setTimeout(() => {
      const main = document.getElementById('main-content')
      const heading = main?.querySelector<HTMLElement>('h1')
      if (!heading) return
      heading.tabIndex = -1
      heading.focus({ preventScroll: true })
    }, 0)
    return () => window.clearTimeout(timer)
  }, [foundationTrack, location.pathname, location.search, practiceLoadFailed])

  useEffect(() => {
    if (route.page === 'landing') {
      document.title = 'SeePoundCoffeePie | Programming from the beginning.'
      return
    }
    if (route.page === 'lesson' && routedCourse?.kind === 'continuing') return

    const summary = route.language ? trackMetadata(route.language) : null
    const track = route.language && foundationTrack?.id === route.language ? foundationTrack : null
    const mission = routedCourse?.kind === 'continuing'
      ? null
      : track?.missions.find((item) => item.id === route.missionId)
    const exercise = mission?.exercises.find((item) => item.id === route.exerciseId)
    const routeProject = (route.page === 'project' || route.page === 'portfolio') && route.language && route.projectId
      ? projectManifestByRoute(route.language, route.projectId)
      : undefined
    const projectCheckpoint = routeProject?.checkpoints.find((item) => item.id === route.checkpointId)
    const pageTitle = route.page === 'home'
      ? 'Learning Home'
      : route.page === 'start'
        ? 'Beginner Intake'
        : route.page === 'courses'
          ? 'Courses'
          : route.page === 'course' || route.page === 'academy'
            ? routedCourse?.title ?? (summary ? `${summary.shortName} Foundations` : 'Course')
        : route.page === 'practice' || route.page === 'practice-session'
          ? practiceLoadFailed ? 'Practice could not load' : `${summary?.shortName} Practice`
          : route.page === 'codebook'
          ? `${summary?.shortName} Code reference`
            : route.page === 'profile'
              ? 'Learner Record'
              : route.page === 'settings'
                ? 'Settings'
                : route.page === 'project'
                  ? projectCheckpoint?.title ?? routeProject?.title ?? 'Project'
                : route.page === 'portfolio'
                  ? routeProject ? `${routeProject.title} Portfolio` : 'Portfolio'
                : route.page === 'lesson'
                  ? routedCourse?.kind === 'continuing'
                    ? routedCourse.title
                    : exercise?.title ?? mission?.title
                  : 'Page not found'
    document.title = `${pageTitle ?? 'Learn'} | SeePoundCoffeePie`
  }, [foundationTrack, practiceLoadFailed, route.checkpointId, route.exerciseId, route.language, route.missionId, route.page, route.projectId, routedCourse])

  useEffect(() => {
    const handleNavigation = () => {
      const nextLocation = readBrowserLocation()
      const nextRoute = parseAppRoute(nextLocation.pathname, nextLocation.search)
      setLocation(nextLocation)
      if (nextRoute.language && routeSetsLanguagePreference(nextRoute)) {
        setProgress((current) => current.activeLanguage === nextRoute.language
          ? current
          : { ...current, activeLanguage: nextRoute.language ?? current.activeLanguage })
      }
    }

    window.addEventListener('popstate', handleNavigation)
    return () => window.removeEventListener('popstate', handleNavigation)
  }, [])

  const markSynced = useCallback((record: RemoteProgressRecord) => {
    syncEnabledRef.current = true
    syncRevisionRef.current = record.revision
    syncedSnapshotRef.current = JSON.stringify(record.progress)
    setSyncRecord(record)
    setSyncChoice(undefined)
    setSyncState('synced')
    setSyncMessage(`Progress saved to your account at ${new Date(record.updatedAt).toLocaleTimeString()}.`)
  }, [])

  const saveAccountProgress = useCallback(async (
    nextProgress: LearnerProgress,
    revision: number,
  ) => {
    setSyncBusy(true)
    setSyncState('saving')
    setSyncMessage('Saving your progress to your account.')
    try {
      const result = await saveRemoteProgress(nextProgress, revision)
      if (result.ok) {
        markSynced(result.record)
        return true
      }
      if (result.conflicted) {
        syncEnabledRef.current = false
        setSyncChoice(result.conflict)
        setSyncState('needs-choice')
        setSyncMessage('Another device saved a newer record. Choose how to continue before anything is replaced.')
        return false
      }
      throw new Error(result.message)
    } catch (error) {
      setSyncState(navigator.onLine ? 'error' : 'offline')
      setSyncMessage(error instanceof Error ? error.message : 'Your progress is saved in this browser, but it could not be saved to your account yet.')
      return false
    } finally {
      setSyncBusy(false)
    }
  }, [markSynced])

  useEffect(() => {
    if (!authUser) return

    const controller = new AbortController()
    fetchRemoteProgress(controller.signal)
      .then((remote) => {
        if (controller.signal.aborted) return
        const local = progressRef.current
        if (!remote) {
          syncRevisionRef.current = 0
          if (hasMeaningfulProgress(local)) {
            syncEnabledRef.current = false
            setSyncChoice(null)
            setSyncState('needs-choice')
            setSyncMessage('Choose when to save this browser’s progress to the account.')
          } else {
            syncEnabledRef.current = true
            syncedSnapshotRef.current = JSON.stringify(local)
            setSyncRecord(null)
            setSyncState('synced')
            setSyncMessage('Account connected. New learning progress will be saved automatically.')
          }
          return
        }
        if (!hasMeaningfulProgress(local)) {
          setProgress(remote.progress)
          markSynced(remote)
          return
        }
        if (progressRecordsMatch(local, remote.progress)) {
          markSynced(remote)
          return
        }
        syncEnabledRef.current = false
        setSyncRecord(remote)
        setSyncChoice(remote)
        setSyncState('needs-choice')
        setSyncMessage('This browser and the account have different progress. Choose how to continue.')
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setSyncState(navigator.onLine ? 'error' : 'offline')
        setSyncMessage(error instanceof Error ? error.message : 'Your account progress could not be checked. Your progress is still saved in this browser.')
      })

    return () => controller.abort()
  }, [authUser, markSynced])

  useEffect(() => {
    if (!authUser || syncState !== 'synced' || !syncEnabledRef.current) return
    const serialized = JSON.stringify(progress)
    if (serialized === syncedSnapshotRef.current) return
    const timer = window.setTimeout(() => {
      void saveAccountProgress(progress, syncRevisionRef.current)
    }, 800)
    return () => window.clearTimeout(timer)
  }, [authUser, progress, saveAccountProgress, syncState])

  useEffect(() => {
    const retryWhenOnline = () => {
      if (authUser && syncEnabledRef.current && syncState === 'offline') setSyncState('synced')
    }
    window.addEventListener('online', retryWhenOnline)
    return () => window.removeEventListener('online', retryWhenOnline)
  }, [authUser, syncState])

  useEffect(() => {
    const url = new URL(window.location.href)
    if (url.searchParams.has('auth') || url.searchParams.has('reason')) {
      url.searchParams.delete('auth')
      url.searchParams.delete('reason')
      window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`)
    }
  }, [])

  useEffect(() => {
    let active = true
    fetch('/api/auth/session', {
      credentials: 'same-origin',
      headers: { Accept: 'application/json' },
    })
      .then(async (response) => {
        if (!response.ok || !response.headers.get('Content-Type')?.includes('application/json')) return null
        return response.json() as Promise<{ authenticated: boolean; user: AuthUser | null }>
      })
      .then((session) => {
        if (active && session?.authenticated) {
          setSyncState('checking')
          setSyncMessage('Checking for progress saved to your account.')
          setAuthUser(session.user)
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setAuthReady(true)
      })

    return () => { active = false }
  }, [])

  const normalizedProgress = useMemo(() => {
    const dailyProgress = progress.dailyXpDate === dateKey(new Date()) ? progress : { ...progress, dailyXp: 0 }
    if (route.language && routeHasLanguageContext(route.page)) {
      return { ...dailyProgress, activeLanguage: route.language }
    }
    return dailyProgress
  }, [progress, route.language, route.page])

  const updateProgress: Dispatch<SetStateAction<LearnerProgress>> = setProgress

  const signIn = () => {
    window.location.assign('/api/auth/github/start')
  }

  const logout = async () => {
    setAuthBusy(true)
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { Accept: 'application/json' },
      })
      if (!response.ok) throw new Error('Logout failed')
      syncEnabledRef.current = false
      syncRevisionRef.current = 0
      syncedSnapshotRef.current = null
      setSyncChoice(undefined)
      setSyncRecord(null)
      setSyncMessage('')
      setSyncState('guest')
      setAuthUser(null)
      setAuthNotice('Signed out. Your learning progress is still saved in this browser.')
    } catch {
      setAuthNotice('Sign-out could not be completed. Please try again.')
    } finally {
      setAuthBusy(false)
    }
  }

  const reset = () => {
    const message = syncEnabledRef.current
      ? 'Reset all SeePoundCoffeePie learning progress? The reset will also be saved to your account, and this browser will return to beginner intake. Saved project code and check summaries will stay in this browser.'
      : 'Reset all SeePoundCoffeePie learning progress in this browser and return to beginner intake? Saved project code and check summaries will stay in this browser.'
    if (window.confirm(message)) {
      const sessionStorage = practiceSessionStorage()
      foundationTrackMetadata.forEach((track) => clearPracticeSession(track.id, sessionStorage))
      const resetProgress = initialProgress()
      saveProgress(resetProgress, { reset: true })
      setProgress(resetProgress)
      navigateTo('/start')
    }
  }

  const downloadProgressBackup = () => {
    const contents = serializeProgressBackup(progress)
    const url = URL.createObjectURL(new Blob([contents], { type: 'application/json' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `seepoundcoffeepie-progress-${dateKey(new Date())}.json`
    document.body.append(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 0)
    return 'Backup file downloaded. Keep it somewhere you control.'
  }

  const restoreProgressBackup = (text: string) => {
    const result = parseProgressBackup(text)
    if (!result.ok) return result.message
    const restoreQuestion = syncEnabledRef.current
      ? 'Replace your current SeePoundCoffeePie progress with this backup and save the restored progress to your account?'
      : 'Replace this browser’s current SeePoundCoffeePie progress with the selected backup?'
    if (!window.confirm(restoreQuestion)) {
      return 'Restore cancelled. Your current progress was not changed.'
    }

    setProgress(result.progress)
    const exported = new Date(result.exportedAt).toLocaleString()
    return `Progress restored from the backup created ${exported}.`
  }

  const completeOnboarding = (nextProgress: LearnerProgress) => {
    setProgress((current) => current.onboardingComplete
      ? {
          ...current,
          activeLanguage: nextProgress.activeLanguage,
          callsign: nextProgress.callsign,
          dailyGoal: nextProgress.dailyGoal,
        }
      : nextProgress)
    navigateTo(homePath())
  }

  const chooseSyncRecord = async (choice: 'combine' | 'local' | 'remote') => {
    const remote = syncChoice ?? null
    if (choice === 'remote' && remote) {
      setProgress(remote.progress)
      markSynced(remote)
      setAuthNotice('This browser now uses the progress saved to your account.')
      return
    }
    const selected = choice === 'combine' && remote
      ? mergeLearnerProgress(progressRef.current, remote.progress)
      : progressRef.current
    if (choice === 'combine') setProgress(selected)
    const saved = await saveAccountProgress(selected, remote?.revision ?? 0)
    if (saved) {
      setAuthNotice(choice === 'combine'
        ? 'Progress from this browser and your account was combined and saved.'
        : 'This browser’s progress is now saved to your account.')
    }
  }

  const deferSyncChoice = () => {
    syncEnabledRef.current = false
    setSyncChoice(undefined)
    setSyncState('local-only')
    setSyncMessage('Your progress is saved in this browser. It is not being saved to your account.')
  }

  const syncNow = () => {
    if (syncState === 'needs-choice') return
    void saveAccountProgress(progressRef.current, syncRevisionRef.current)
  }

  const deleteAccountData = async () => {
    if (!window.confirm('Permanently delete the learning progress saved to your account? The progress in this browser will remain.')) return
    setSyncBusy(true)
    try {
      await deleteRemoteProgress()
      syncEnabledRef.current = false
      syncRevisionRef.current = 0
      syncedSnapshotRef.current = null
      setSyncRecord(null)
      setSyncChoice(undefined)
      setSyncState('local-only')
      setSyncMessage('Progress saved to your account was deleted. Your progress remains in this browser.')
      setAuthNotice('Saved account progress deleted. Your progress in this browser was not removed.')
    } catch (error) {
      setSyncState(navigator.onLine ? 'error' : 'offline')
      setSyncMessage(error instanceof Error ? error.message : 'Account learning data could not be deleted.')
    } finally {
      setSyncBusy(false)
    }
  }

  const syncDialog = syncChoice !== undefined ? (
    <SyncChoiceDialog
      busy={syncBusy}
      local={progress}
      onChoose={(choice) => { void chooseSyncRecord(choice) }}
      onLater={deferSyncChoice}
      remote={syncChoice}
    />
  ) : null

  const recordLocation = authUser && (syncState === 'synced' || syncState === 'saving')
    ? 'Your progress is saved in this browser and to your account.'
    : authUser
      ? 'Your progress is saved in this browser, but there is a problem saving it to your account.'
      : 'Your progress is saved in this browser. Sign in to save it to your account.'

  if (route.page === 'landing') {
    return (
      <>
        {authNotice && <AuthNotice message={authNotice} onDismiss={() => setAuthNotice(null)} />}
        {syncDialog}
        <LandingPage authReady={authReady} authUser={authUser} onSignIn={signIn} progress={normalizedProgress} />
      </>
    )
  }

  if (route.page === 'not-found') {
    return <NotFoundPage progress={normalizedProgress} />
  }

  const publicCoursePage = route.page === 'courses' || route.page === 'course'
  if (route.page === 'start' || (!progress.onboardingComplete && !publicCoursePage)) {
    return (
      <>
        {authNotice && <AuthNotice message={authNotice} onDismiss={() => setAuthNotice(null)} />}
        {syncDialog}
        <Onboarding
          authReady={authReady}
          authUser={authUser}
          initialLanguage={route.language ?? progress.activeLanguage}
          onComplete={completeOnboarding}
          onSignIn={signIn}
        />
      </>
    )
  }

  if (route.page === 'practice-session') {
    const language = route.language ?? progress.activeLanguage
    if (foundationTrack === null) return <FoundationLoadFailure />
    if (practiceLoadFailed) return <PracticeLoadFailure />
    if (!practiceTrack) return <LessonPlayerFallback practice />
    return (
      <>
        {authNotice && <AuthNotice message={authNotice} onDismiss={() => setAuthNotice(null)} />}
        {syncDialog}
        <PracticeSessionRoute
          key={`practice-session-${language}:${practicePublicationKey ?? 'base'}`}
          onNavigate={navigateTo}
          onProgress={updateProgress}
          practiceStep={route.practiceStep ?? 1}
          progress={{ ...normalizedProgress, activeLanguage: language }}
          trackOverride={practiceTrack}
        />
      </>
    )
  }

  if (
    route.page === 'lesson'
    && routedCourse?.kind === 'continuing'
    && route.courseId
    && route.missionId
    && route.exerciseId
  ) {
    return (
      <>
        {authNotice && <AuthNotice message={authNotice} onDismiss={() => setAuthNotice(null)} />}
        {syncDialog}
        <Suspense fallback={<LessonPlayerFallback />}>
          <ContinuingCourseLessonPage
            courseId={route.courseId}
            exerciseId={route.exerciseId}
            missionId={route.missionId}
            onNavigate={navigateTo}
            onProgress={updateProgress}
            progress={normalizedProgress}
          />
        </Suspense>
      </>
    )
  }

  if (route.page === 'lesson') {
    if (foundationTrack === undefined) return <LessonPlayerFallback practice={route.practice} />
    if (foundationTrack === null) return <FoundationLoadFailure />
    const track = foundationTrack
    const missionIndex = track.missions.findIndex((mission) => mission.id === route.missionId)
    const mission = track.missions[missionIndex]
    const available = mission && mission.language === track.id
      && (route.practice
        ? progress.completedMissions.includes(mission.id)
        : missionAvailability(track, missionIndex, progress.completedMissions) === 'available')

    const routeExercise = route.exerciseId
      ? mission?.exercises.find((exercise) => exercise.id === route.exerciseId)
      : undefined
    if (!mission || mission.language !== track.id || (route.exerciseId && !routeExercise)) {
      return <NotFoundPage progress={normalizedProgress} />
    }

    const missionConceptIds = new Set(mission.exercises.map((exercise) => exercise.conceptId))
    const requestedConceptsAreKnown = route.conceptIds.every((conceptId) => missionConceptIds.has(conceptId))

    if (route.practice && !requestedConceptsAreKnown) {
      return <NotFoundPage progress={normalizedProgress} />
    }

    const practiceConceptIds = route.conceptIds

    if (!available) {
      const prerequisite = track.missions[missionIndex - 1]
      return (
        <>
          {authNotice && <AuthNotice message={authNotice} onDismiss={() => setAuthNotice(null)} />}
          {syncDialog}
          <AppShell
            authReady={authReady}
            authUser={authUser}
            progress={normalizedProgress}
            view={view}
            onLanguageChange={(language) => {
              setProgress((current) => ({ ...current, activeLanguage: language }))
              navigateTo(coursePath(language))
            }}
            onSignIn={signIn}
          >
            <main className="content-page" id="main-content" tabIndex={-1}>
              <section className="route-message-card route-message-card--inside">
                <p className="kicker"><LockKeyhole size={15} /> Module locked</p>
                <h1>{route.practice ? `Complete ${mission.title} before reviewing it` : `${mission.title} is still ahead`}</h1>
                <p>{route.practice
                  ? 'Practice only uses modules you have finished. Return to the course and complete this module in the normal lesson flow first.'
                  : `Complete ${prerequisite?.title ?? 'the earlier course work'} first. The course keeps the steps in order so each new idea has a foundation.`}</p>
                <AppLink className="primary-action" to={coursePath(track.id)}>Return to {track.shortName} Foundations</AppLink>
              </section>
            </main>
          </AppShell>
        </>
      )
    }

    return (
      <>
        {authNotice && <AuthNotice message={authNotice} onDismiss={() => setAuthNotice(null)} />}
        {syncDialog}
        <Suspense fallback={<LessonPlayerFallback practice={route.practice} />}>
          <LessonPlayer
            key={`${route.practice ? 'practice' : 'academy'}-${mission.id}-${practiceConceptIds.join('-')}`}
            initialExerciseId={route.practice ? undefined : routeExercise?.id}
            mission={mission}
            onExerciseChange={route.practice ? undefined : (exerciseId) => navigateTo(lessonPath(track.id, mission.id, exerciseId))}
            practiceConceptIds={route.practice ? practiceConceptIds : undefined}
            progress={progress}
            onProgress={updateProgress}
            onExit={() => navigateTo(route.practice ? practicePath(track.id) : coursePath(track.id))}
          />
        </Suspense>
      </>
    )
  }

  if (route.page === 'portfolio') {
    const routeProject = route.language && route.projectId
      ? projectManifestByRoute(route.language, route.projectId)
      : undefined
    if (!routeProject || !route.language || !route.projectId) {
      return <NotFoundPage progress={normalizedProgress} />
    }

    return (
      <>
        {authNotice && <AuthNotice message={authNotice} onDismiss={() => setAuthNotice(null)} />}
        {syncDialog}
        <AppShell
          authReady={authReady}
          authUser={authUser}
          progress={normalizedProgress}
          view={view}
          onLanguageChange={(language) => {
            setProgress((current) => ({ ...current, activeLanguage: language }))
            navigateTo(coursePath(language))
          }}
          onSignIn={signIn}
        >
          <Suspense fallback={(
            <main className="content-page" aria-busy="true" id="main-content" tabIndex={-1}>
              <section className="route-message-card route-message-card--inside">
                <h1>Loading portfolio</h1>
              </section>
            </main>
          )}>
            <PortfolioPage
              key={`${route.language}:${route.projectId}`}
              language={route.language}
              onNavigate={navigateTo}
              progress={normalizedProgress}
              projectId={route.projectId}
            />
          </Suspense>
        </AppShell>
      </>
    )
  }

  if (route.page === 'project') {
    const routeProject = route.language && route.projectId
      ? projectManifestByRoute(route.language, route.projectId)
      : undefined
    const checkpointExists = !route.checkpointId || routeProject?.checkpoints.some((checkpoint) => (
      checkpoint.id === route.checkpointId
    ))
    if (!routeProject || !checkpointExists) {
      return <NotFoundPage progress={normalizedProgress} />
    }

    return (
      <>
        {authNotice && <AuthNotice message={authNotice} onDismiss={() => setAuthNotice(null)} />}
        {syncDialog}
        <AppShell
          authReady={authReady}
          authUser={authUser}
          progress={normalizedProgress}
          view={view}
          onLanguageChange={(language) => {
            setProgress((current) => ({ ...current, activeLanguage: language }))
            navigateTo(coursePath(language))
          }}
          onSignIn={signIn}
        >
          <Suspense fallback={(
            <main className="content-page" aria-busy="true" id="main-content" tabIndex={-1}>
              <section className="route-message-card route-message-card--inside">
                <h1>Loading project</h1>
              </section>
            </main>
          )}>
            <ProjectStudio
              checkpointId={route.checkpointId}
              language={routeProject.language}
              onNavigate={navigateTo}
              onProgress={updateProgress}
              progress={normalizedProgress}
              projectId={routeProject.id}
            />
          </Suspense>
        </AppShell>
      </>
    )
  }

  return (
    <>
      {authNotice && <AuthNotice message={authNotice} onDismiss={() => setAuthNotice(null)} />}
      {syncDialog}
      <AppShell
        authReady={authReady}
        authUser={authUser}
        progress={normalizedProgress}
        view={view}
        onLanguageChange={(language) => {
          setProgress((current) => ({ ...current, activeLanguage: language }))
          if (route.page === 'course' || route.page === 'academy') {
            navigateTo(coursePath(foundationCourseId(language)))
          } else if (route.page === 'practice' || route.page === 'codebook') {
            navigateTo(pagePath(route.page, language))
          }
        }}
        onSignIn={signIn}
      >
        {route.page === 'home' && (foundationTrack === null
          ? <FoundationLoadFailure insideShell />
          : foundationTrack
            ? <LearnerHome progress={normalizedProgress} track={foundationTrack} />
            : <main className="content-page" aria-busy="true" id="main-content" tabIndex={-1}><section className="route-message-card route-message-card--inside"><h1>Loading your course</h1></section></main>)}
        {route.page === 'courses' && <CourseCatalog progress={normalizedProgress} />}
        {route.page === 'course' && route.courseId && routedCourse?.kind === 'continuing' && (
          <Suspense fallback={(
            <main className="content-page" aria-busy="true" id="main-content" tabIndex={-1}>
              <section className="route-message-card route-message-card--inside">
                <h1>Loading course</h1>
              </section>
            </main>
          )}>
            <ContinuingCoursePage
              courseId={route.courseId}
              onNavigate={navigateTo}
              onProgress={updateProgress}
              progress={normalizedProgress}
            />
          </Suspense>
        )}
        {(route.page === 'academy' || (route.page === 'course' && routedCourse?.kind === 'foundation')) && (
          foundationTrack === null
            ? <FoundationLoadFailure insideShell />
            : foundationTrack
              ? <MissionPath
                key={`course:${route.courseId ?? route.language ?? normalizedProgress.activeLanguage}`}
                onProgress={updateProgress}
                progress={route.language ? { ...normalizedProgress, activeLanguage: route.language } : normalizedProgress}
                track={foundationTrack}
              />
              : <main className="content-page" aria-busy="true" id="main-content" tabIndex={-1}><section className="route-message-card route-message-card--inside"><h1>Loading course</h1></section></main>
        )}
        {route.page === 'practice' && (foundationTrack === null
          ? <FoundationLoadFailure insideShell />
          : practiceLoadFailed
            ? <PracticeLoadFailure insideShell />
          : practiceTrack
            ? <PracticeBay progress={normalizedProgress} trackOverride={practiceTrack} />
            : <main className="content-page" aria-busy="true" id="main-content" tabIndex={-1}><section className="route-message-card route-message-card--inside"><h1>Loading practice</h1></section></main>)}
        {route.page === 'codebook' && (
          <Suspense fallback={<main className="content-page" aria-busy="true" id="main-content" tabIndex={-1}><section className="route-message-card route-message-card--inside"><h1>Loading code reference</h1></section></main>}>
            <CodebookRoute progress={normalizedProgress} />
          </Suspense>
        )}
        {route.page === 'profile' && (
          <CadetRecord
            onOpenCourse={(courseId, language) => {
              setProgress((current) => ({ ...current, activeLanguage: language }))
              navigateTo(coursePath(courseId))
            }}
            progress={normalizedProgress}
            recordLocation={recordLocation}
          />
        )}
        {route.page === 'settings' && (
          <SettingsPage
            authBusy={authBusy}
            authUser={authUser}
            onDeleteAccountData={() => { void deleteAccountData() }}
            onDailyGoalChange={(dailyGoal) => setProgress((current) => ({ ...current, dailyGoal }))}
            onDownloadBackup={downloadProgressBackup}
            onLogout={logout}
            onReset={reset}
            onRestoreBackup={restoreProgressBackup}
            onSignIn={signIn}
            onSyncNow={syncNow}
            progress={normalizedProgress}
            syncBusy={syncBusy}
            syncMessage={syncMessage}
            syncState={syncState}
            syncUpdatedAt={syncRecord?.updatedAt ?? null}
          />
        )}
      </AppShell>
    </>
  )
}

function App() {
  return <AppContent />
}

export default App
