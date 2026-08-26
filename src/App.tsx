import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type AnchorHTMLAttributes,
  type ChangeEvent,
  type Dispatch,
  type MouseEvent as ReactMouseEvent,
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
  Code2,
  Coffee,
  Compass,
  Download,
  Eye,
  FileCode2,
  Flame,
  GitFork as Github,
  Home,
  LibraryBig,
  LockKeyhole,
  LogOut,
  Menu,
  Orbit,
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
import { courseDefinition, foundationCourseId } from './data/course-registry'
import { trackById, tracks } from './data/curriculum'
import { pythonDataToolsManifest } from './data/python-data-tools-manifest'
import {
  projectManifestByRoute,
  projectManifestForLanguage,
  projectManifests,
} from './data/project-manifests'
import { buildCourseCards, buildCourseModel, type CourseCardModel } from './lib/course-model'
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
  type RoutePage,
} from './lib/routes'
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

const continuingPracticeLoaders: Partial<Record<LanguageId, () => Promise<Mission[]>>> = {
  python: async () => {
    const module = await import('./data/python-data-tools-course')
    return module.pythonDataToolsCourse.missions
  },
}

function LessonPlayerFallback({ practice = false }: { practice?: boolean }) {
  return (
    <div className="lesson-overlay">
      <main className="route-message-page" aria-busy="true" id="main-content" tabIndex={-1}>
        <section className="route-message-card">
          <p className="kicker"><BookOpen size={15} /> {practice ? 'Practice' : 'Lesson'}</p>
          <h1>Opening your {practice ? 'practice set' : 'lesson'}</h1>
          <p>Loading the explanation, exercise, and code workspace.</p>
        </section>
      </main>
    </div>
  )
}

const languageSnippets: Record<LanguageId, string> = {
  python: 'print("Hello, cosmos!")',
  cpp: 'std::cout << "Hello, cosmos!";',
  csharp: 'Console.WriteLine("Hello, cosmos!");',
  java: 'System.out.println("Hello, cosmos!");',
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

function routeSetsLanguagePreference(page: RoutePage): boolean {
  return languagePreferencePages.has(page)
}

function readBrowserLocation(): BrowserLocation {
  return { pathname: window.location.pathname, search: window.location.search }
}

function navigateTo(to: string, replace = false) {
  window.history[replace ? 'replaceState' : 'pushState']({}, '', to)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

interface AppLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  to: string
}

function AppLink({ children, onClick, target, to, ...props }: AppLinkProps) {
  const followLink = (event: ReactMouseEvent<HTMLAnchorElement>) => {
    onClick?.(event)
    if (
      event.defaultPrevented
      || event.button !== 0
      || event.metaKey
      || event.ctrlKey
      || event.shiftKey
      || event.altKey
      || target === '_blank'
    ) return

    event.preventDefault()
    navigateTo(to)
  }

  return <a {...props} href={to} onClick={followLink} target={target}>{children}</a>
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
    : { 'aria-label': language === 'cpp' ? 'C++' : language === 'csharp' ? 'C#' : language === 'java' ? 'Java' : 'Python' }
  if (language === 'cpp') return <span className={className} {...accessibility}><Eye aria-hidden="true" /></span>
  if (language === 'csharp') return <span className={className} {...accessibility}>#</span>
  if (language === 'java') return <span className={className} {...accessibility}><Coffee aria-hidden="true" /></span>
  return <span className={className} {...accessibility}>π</span>
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
  const track = trackById(language)
  return (
    <section className="onboarding__story">
      <BrandMark />
      <div className="hero-copy">
        <p className="kicker"><BookOpen size={15} /> No experience required</p>
        <h1>Programming starts with one small idea.</h1>
        <p>
          We explain the words, symbols, punctuation, and hidden assumptions that most courses skip.
          Then you use each idea in a short lesson and meet it again before it fades.
        </p>
        <div className="hero-console" aria-label={`${track.shortName} example code`}>
          <span className="hero-console__label"><LanguageSymbol language={language} size="small" /> A first line in {track.shortName}</span>
          <code>{languageSnippets[language]}</code>
          <span className="console-result">Hello, cosmos!</span>
        </div>
      </div>
      <div className="brand-meaning" aria-label="What the name means">
        <p>The name is the course list.</p>
        <div><LanguageSymbol language="cpp" /><span><b>See</b><small>C++</small></span></div>
        <div><LanguageSymbol language="csharp" /><span><b>Pound</b><small>C#</small></span></div>
        <div><LanguageSymbol language="java" /><span><b>Coffee</b><small>Java</small></span></div>
        <div><LanguageSymbol language="python" /><span><b>Pie</b><small>Python</small></span></div>
      </div>
      <p className="story-note">Four beginner courses. One patient way to learn.</p>
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
          <p className="kicker"><Compass size={15} /> Welcome aboard</p>
          <h2>The code academy for absolute beginners</h2>
          <p className="setup-intro">
            SeePoundCoffeePie teaches Python, C++, C#, and Java from the first building block.
            You do not need to know what code is, what a variable means, or why punctuation matters.
            We explain each piece before asking you to use it.
          </p>

          <div className="landing-promises" id="how-it-works" aria-label="How the academy teaches">
            <article><CircleHelp size={20} /><span><b>Mystery removed</b><small>Every new word, symbol, and code shape gets a plain-language explanation.</small></span></article>
            <article><TerminalSquare size={20} /><span><b>Practice it for real</b><small>Type code, run it safely, see what happened, and repair mistakes with guidance.</small></span></article>
            <article><Orbit size={20} /><span><b>Remember it later</b><small>Short reviews bring ideas back before they drift out of memory.</small></span></article>
          </div>

          <div className="landing-section-heading">
            <div><small>FOUR SCHOOLS, ONE FOUNDATION</small><h3>Preview a learning path</h3></div>
            <p>You can visit every school. Your first choice does not lock you in.</p>
          </div>
          <div className="landing-schools">
            {tracks.map((track) => (
              <AppLink
                className={previewLanguage === track.id ? 'is-selected' : ''}
                key={track.id}
                onFocus={() => setPreviewLanguage(track.id)}
                onMouseEnter={() => setPreviewLanguage(track.id)}
                style={{ '--track-accent': track.accent } as React.CSSProperties}
                to={coursePath(track.id)}
              >
                <Code2 size={18} />
                <span><b>{track.shortName}</b><small>{track.role}</small></span>
                {track.id === 'python' && <em>GENTLE START</em>}
              </AppLink>
            ))}
          </div>

          <div className="landing-actions">
            {progress.onboardingComplete ? (
              <AppLink className="primary-action" to={continuePath}>Continue as {progress.callsign} <ArrowRight size={18} /></AppLink>
            ) : (
              <AppLink className="primary-action" to="/start">Start from the beginning <ArrowRight size={18} /></AppLink>
            )}
            <a className="secondary-action" href="#how-it-works">How the academy works</a>
          </div>

          <div className={`github-intake landing-identity ${authUser ? 'is-connected' : ''}`}>
            <span><Github size={21} /></span>
            <div>
              <b>{authUser ? `Signed in as ${authUser.login}` : 'GitHub sign-in is optional'}</b>
              <p>{authUser ? 'Your identity is verified and your Cadet Record can synchronize.' : 'Start as a guest, or sign in to carry progress between devices.'}</p>
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
  const selectedTrack = trackById(language)
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
      callsign: callsign.trim() || authUser?.name || authUser?.login || 'Cadet',
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
              <p><b>{trackById(recommendation).shortName} is our suggestion.</b> It matches your answer, but it does not lock you in.</p>
              <div className="intake-course-options">
                {tracks.map((track) => (
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
              <h2>Make the learning space yours</h2>
              <p>Choose a name and a small daily XP target. Neither choice changes what you are allowed to learn.</p>
              <div className={`github-intake ${authUser ? 'is-connected' : ''}`}>
                <span><Github size={21} /></span>
                <div><b>{authUser ? `Signed in as ${authUser.login}` : 'GitHub sign-in is optional'}</b><p>{authUser ? 'You will choose how existing progress is synchronized.' : 'Stay a guest, or sign in to carry progress between devices.'}</p></div>
                {!authUser && <button type="button" onClick={onSignIn} disabled={!authReady}><Github size={16} /> {authReady ? 'Sign in' : 'Checking'}</button>}
              </div>
              <label className="field-label" htmlFor="callsign">What should we call you?</label>
              <input id="callsign" className="text-input" value={callsign} onChange={(event) => setCallsign(event.target.value)} placeholder={authUser ? authUser.name || authUser.login : 'Your name or nickname'} maxLength={24} />
              <fieldset className="goal-picker">
                <legend>Daily XP goal</legend>
                <div>
                  {[5, 10, 15].map((xp) => (
                    <button key={xp} className={goal === xp ? 'is-selected' : ''} aria-pressed={goal === xp} onClick={() => setGoal(xp)} type="button"><Clock3 size={16} /><b>{xp} XP</b><span>{xp === 5 ? 'Gentle' : xp === 10 ? 'Steady' : 'Focused'}</span></button>
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
  const track = trackById(progress.activeLanguage)
  const navItems: Array<{ id: ViewId; label: string; icon: typeof Compass; to: string }> = [
    { id: 'home', label: 'Home', icon: Home, to: homePath() },
    { id: 'courses', label: 'Courses', icon: BookOpen, to: coursesPath() },
    { id: 'practice', label: 'Practice', icon: RotateCcw, to: practicePath(progress.activeLanguage) },
    { id: 'spellbook', label: 'Codebook', icon: LibraryBig, to: codebookPath(progress.activeLanguage) },
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
              <span className="sr-only">Active language</span>
              <select value={progress.activeLanguage} onChange={(event) => onLanguageChange(event.target.value as LanguageId)}>
                {tracks.map((item) => <option key={item.id} value={item.id}>{item.shortName}</option>)}
              </select>
              <ChevronDown size={14} aria-hidden="true" />
            </label>
            <span aria-label={`${progress.streak} day study streak`} className="workshop-stat"><Flame size={16} aria-hidden="true" /><b>{progress.streak}</b></span>
            <span aria-label={`${progress.xp} experience points`} className="workshop-stat"><Zap size={16} aria-hidden="true" /><b>{progress.xp} XP</b></span>
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
      <div className="app-frame" id="main-content" tabIndex={-1}>
        {children}
      </div>
    </div>
  )
}

function CourseSymbol({ course, size = 'medium' }: { course: Pick<CourseCardModel, 'language' | 'title'>; size?: 'small' | 'medium' | 'large' }) {
  return <LanguageSymbol language={course.language} size={size} />
}

function lowerFirst(value: string): string {
  return value ? `${value[0].toLocaleLowerCase()}${value.slice(1)}` : value
}

function CourseCard({ course }: { course: CourseCardModel }) {
  const status = course.availability === 'locked'
    ? 'Complete the prerequisites to start'
    : course.status === 'complete'
    ? 'Course complete'
    : course.status === 'in-progress'
      ? `${course.completedLessonCount} of ${course.lessonCount} lessons complete`
      : 'Ready when you are'
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
          <b><LockKeyhole size={15} /> Before you begin</b>
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
  const [filter, setFilter] = useState<'all' | 'foundations' | 'continuing' | 'projects'>('all')
  const filteredCourses = filter === 'foundations'
    ? courses.filter((course) => course.kind === 'foundation')
    : filter === 'continuing'
      ? courses.filter((course) => course.kind === 'continuing')
      : courses
  const showCourses = filter !== 'projects'
  const showProjects = filter === 'all' || filter === 'projects'
  return (
    <main className="workshop-page course-catalog">
      <header className="workshop-page-heading">
        <p className="eyebrow">Course catalog</p>
        <h1>Start with a foundation. Keep building from there.</h1>
        <p>The four foundation courses assume no experience. Practical Python unlocks after you finish its two earlier steps, and every course keeps its own progress.</p>
      </header>
      <nav className="catalog-filters" aria-label="Course filters">
        <button aria-pressed={filter === 'all'} className={filter === 'all' ? 'is-active' : ''} onClick={() => setFilter('all')} type="button">All courses</button>
        <button aria-pressed={filter === 'foundations'} className={filter === 'foundations' ? 'is-active' : ''} onClick={() => setFilter('foundations')} type="button">Foundations</button>
        <button aria-pressed={filter === 'continuing'} className={filter === 'continuing' ? 'is-active' : ''} onClick={() => setFilter('continuing')} type="button">Next-step courses</button>
        <button aria-pressed={filter === 'projects'} className={filter === 'projects' ? 'is-active' : ''} onClick={() => setFilter('projects')} type="button">Guided projects</button>
      </nav>
      {showCourses && <section className="course-grid" aria-label="Courses">
        {filteredCourses.map((course) => <CourseCard course={course} key={course.id} />)}
      </section>}
      {showProjects && <section className="guided-project-list" aria-labelledby="guided-projects-title">
        <div className="section-heading-open">
          <div><p className="eyebrow">Build something complete</p><h2 id="guided-projects-title">Guided projects</h2></div>
          <p>Start with small checkpoints, then finish with a program you can download and keep.</p>
        </div>
        {projectManifests.map((project) => (
          <AppLink
            className="guided-project-row guided-project-row--featured"
            key={`${project.language}-${project.id}`}
            to={projectPath(project.language, project.id)}
          >
            <LanguageSymbol language={project.language} />
            <span><small>{project.studioLabel} · {project.checkpoints.length} checkpoints</small><b>{project.title}</b><p>{project.subtitle}</p></span>
            <strong>Open project <ArrowRight size={16} /></strong>
          </AppLink>
        ))}
        {tracks.map((track) => {
          const project = track.missions.at(-1)
          if (!project) return null
          return (
            <AppLink className="guided-project-row guided-project-row--capstone" key={project.id} to={coursePath(track.id)}>
              <LanguageSymbol language={track.id} />
              <span><small>{track.shortName} foundation capstone</small><b>{project.title}</b><p>{project.description}</p></span>
              <strong>{project.exercises.length} lessons <ArrowRight size={16} /></strong>
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
  if (track.id === 'python') {
    Object.entries(pythonDataToolsManifest).forEach(([missionId, lessons]) => {
      if (!completedMissions.has(missionId)) return
      lessons.forEach((lesson) => conceptIds.add(lesson.conceptId))
    })
  }
  const today = dateKey(now)
  return [...conceptIds].filter((conceptId) => {
    const concept = progress.conceptProgress[conceptId]
    return !concept || concept.dueAt <= today
  }).length
}

function LearnerHome({ progress }: { progress: LearnerProgress }) {
  const courses = buildCourseCards(progress)
  const activeTrack = trackById(progress.activeLanguage)
  const activeCourse = buildCourseModel(activeTrack, progress)
  const reviewsDue = countLanguageDueConcepts(activeTrack, progress)
  const foundationProject = activeCourse.status === 'complete'
    ? projectManifestForLanguage(activeCourse.language)
    : undefined
  const completedProjectCheckpointCount = foundationProject?.checkpoints.filter((checkpoint) => (
    progress.completedProjectCheckpoints.includes(checkpoint.id)
  )).length ?? 0
  const nextProjectCheckpoint = foundationProject?.checkpoints.find((checkpoint) => (
    !progress.completedProjectCheckpoints.includes(checkpoint.id)
  ))
  const projectComplete = foundationProject
    ? progress.completedProjects.includes(foundationProject.id)
    : false
  const continuingCourse = courses.find((course) => (
    course.kind === 'continuing'
    && course.language === progress.activeLanguage
    && course.availability === 'available'
  ))
  const readyProject = foundationProject && !continuingCourse ? foundationProject : undefined
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
      ? `${continuingCourse.currentModuleTitle} is the next module in your ${lowerFirst(continuingCourse.shortName)} path.`
      : continuingCourse.outcome
    : readyProject
    ? projectComplete
      ? readyProject.completionDescription
      : completedProjectCheckpointCount > 0
        ? `${completedProjectCheckpointCount} of ${readyProject.checkpoints.length} checkpoints complete. Your browser saved the code for your next small step.`
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
    <main className="workshop-page learner-home">
      <header className="learner-welcome">
        <div><p className="eyebrow">Your learning home</p><h1>Welcome back, {progress.callsign}.</h1><p>One short lesson is enough to keep moving.</p></div>
        <div className="daily-goal-open"><span>{Math.min(progress.dailyXp, progress.dailyGoal)} / {progress.dailyGoal} XP today</span><i aria-label="Daily XP goal" aria-valuemax={progress.dailyGoal} aria-valuemin={0} aria-valuenow={Math.min(progress.dailyXp, progress.dailyGoal)} role="progressbar"><b style={{ width: `${Math.min(100, (progress.dailyXp / progress.dailyGoal) * 100)}%` }} /></i></div>
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
          <div className="section-heading-open"><div><p className="eyebrow">This week</p><h2 id="activity-title">A small, steady practice</h2></div><b>{progress.streak} day streak</b></div>
          <div className="activity-days">
            {days.map((day) => <div className={day.today && progress.dailyXp > 0 ? 'has-study' : ''} key={day.key}><span>{day.label}</span><i>{day.today && progress.dailyXp > 0 ? <Check size={15} /> : ''}</i></div>)}
          </div>
          <p>Only today is shown because earlier daily activity is not stored in your current learning record.</p>
        </section>
        <section className="review-open" aria-labelledby="review-title">
          <div><RotateCcw size={22} /><span><p className="eyebrow">Practice</p><h2 id="review-title">{reviewsDue === 0 ? 'Nothing is due yet' : `${reviewsDue} ${reviewsDue === 1 ? 'concept is' : 'concepts are'} ready`}</h2></span></div>
          <p>{reviewsDue === 0 ? 'Reviews appear after you finish a module.' : 'Bring these ideas back before they become fuzzy.'}</p>
          <AppLink to={practicePath(progress.activeLanguage)}>{reviewsDue === 0 ? 'See how practice works' : 'Start a short review'} <ArrowRight size={16} /></AppLink>
        </section>
      </div>

      <section className="home-course-list" aria-labelledby="my-courses-title">
        <div className="section-heading-open"><div><p className="eyebrow">Your courses</p><h2 id="my-courses-title">Five courses, one connected learning path</h2></div><AppLink to={coursesPath()}>Browse all courses <ArrowRight size={16} /></AppLink></div>
        {courses.map((course) => (
          <AppLink className={`home-course-row ${course.availability === 'locked' ? 'is-locked' : ''}`} key={course.id} to={coursePath(course.id)}>
            <CourseSymbol course={course} />
            <span><b>{course.title}</b><small>{course.availability === 'locked' ? 'Prerequisites required' : course.status === 'not-started' ? 'Not started' : `${course.completedLessonCount} of ${course.lessonCount} lessons complete`}</small></span>
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
}: {
  onProgress: Dispatch<SetStateAction<LearnerProgress>>
  progress: LearnerProgress
}) {
  const track = trackById(progress.activeLanguage)
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
  const guidedProject = projectManifestForLanguage(track.id)

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
      ? `Module completed. 25 star shards saved. Module ${nextModule.number} is now available.`
      : 'Module completed. 25 star shards saved. The guided project is now available.')
    onProgress((current) => completeMission(current, moduleId))
  }

  return (
    <main className="workshop-page course-outline">
      <AppLink className="back-link" to={coursesPath()}><ArrowLeft size={16} /> All courses</AppLink>
      <header className={`course-hero course-hero--${track.id}`}>
        <CourseSymbol course={course} size="large" />
        <div><p className="eyebrow">Beginner course</p><h1>{course.title}</h1><p>{course.description}</p><span>{course.moduleCount} modules · {course.lessonCount} short lessons · {course.level}</span></div>
        <div className="course-hero__action"><b>{course.completedLessonCount} of {course.lessonCount} lessons complete</b><small>{course.progressPercent}% of course</small><i aria-label={`${course.title} progress`} aria-valuemax={100} aria-valuemin={0} aria-valuenow={course.progressPercent} role="progressbar"><span style={{ width: `${course.progressPercent}%` }} /></i><AppLink className="primary-action" to={continueTo}>{course.actionLabel} <ArrowRight size={17} /></AppLink></div>
      </header>

      <section className="course-modules" aria-labelledby="course-content-title">
        <div className="section-heading-open"><div><p className="eyebrow">Course outline</p><h2 id="course-content-title">What you will learn</h2></div><p>Open a module to see its five short lessons.</p></div>
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
                <span><small>{module.kind === 'guided-project' ? 'Guided project' : `Module ${module.number}`}</small><b>{module.title}</b><p>{module.description}</p></span>
                <strong>{module.completedLessonCount} of {module.lessonCount} lessons complete</strong>
                <ChevronDown size={19} />
              </button>
              <div className="module-lessons" hidden={!expanded} id={`module-${module.id}-lessons`}>
                  {module.lessons.map((lesson) => {
                    const canOpen = module.availability === 'available'
                    return canOpen ? (
                      <AppLink aria-current={lesson.current ? 'step' : undefined} className={lesson.current ? 'is-current' : ''} key={lesson.id} to={lessonPath(track.id, module.id, lesson.id)}>
                        <span>{lesson.completed ? <Check size={15} /> : lesson.number}</span><b>{lesson.title}</b><small>{lesson.completed ? 'Complete' : lesson.current ? 'Next lesson' : 'Start lesson'} · {lesson.type === 'bugfix' ? 'Debugging' : lesson.type === 'choice' ? 'Guided check' : lesson.type === 'prediction' ? 'Prediction' : lesson.type === 'ordering' ? 'Ordering' : 'Code exercise'}</small><ArrowRight size={15} />
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
                    <small>Finish this module to save the module reward and unlock what comes next.</small>
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
            <p className="eyebrow">After the foundations</p>
            <h2 id="course-project-next-title">{guidedProject.title}</h2>
            <p>{guidedProject.subtitle}</p>
            <span>{guidedProject.checkpoints.length} checkpoints · {guidedProject.duration} · {guidedProject.downloadLabel}</span>
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
  if (item.reason === 'weak') return 'Could use another pass'
  if (item.reason === 'fresh') return 'Keep it fresh'
  return item.progress.dueAt < today ? 'Ready for review' : 'Due today'
}

function PracticeBay({ progress, trackOverride }: { progress: LearnerProgress; trackOverride?: LanguageTrack }) {
  const track = trackOverride ?? trackById(progress.activeLanguage)
  const recommendation = recommendPractice(track, progress)
  const { deferredDueCount, dueConcepts, items, mode, nextReviewAt, starterMission } = recommendation
  const questionCount = items.length
  const estimatedMinutes = Math.max(2, questionCount * 2)
  const firstLesson = starterMission.exercises[0]
  const nextReviewLabel = reviewDateLabel(nextReviewAt)
  const heroTitle = mode === 'start'
    ? 'Practice what you have learned'
    : mode === 'due'
      ? 'A short review is ready'
      : 'You are caught up for today'
  const heroText = mode === 'start'
    ? `Short reviews appear here after you finish a module. Start with ${firstLesson?.title ?? starterMission.title} first.`
    : mode === 'due'
      ? `These ${questionCount} questions bring back ideas from modules you already completed.${deferredDueCount > 0 ? ` Another ${deferredDueCount} ${deferredDueCount === 1 ? 'idea will' : 'ideas will'} wait for the next short set.` : ''}`
      : mode === 'weak'
        ? 'Nothing is due. A few ideas could use another gentle pass now, or you can wait for their scheduled review.'
        : `Nothing is due.${nextReviewLabel ? ` Your next scheduled review is ${nextReviewLabel}.` : ''} You can still take an optional refresher.`

  useEffect(() => {
    clearPracticeSession(track.id, practiceSessionStorage())
  }, [track.id])

  return (
    <main className="content-page">
      <div className="page-heading page-heading--simple">
        <div><p className="kicker"><RotateCcw size={14} /> SHORT REVIEW</p><h1>Practice</h1><p>A small set of familiar ideas, chosen from modules you have already completed.</p></div>
      </div>
      <section className="practice-hero">
        <LanguageSymbol language={track.id} size="large" />
        <div>
          <small>{mode === 'start' ? 'FIRST, FINISH ONE MODULE' : `${questionCount} ${questionCount === 1 ? 'QUESTION' : 'QUESTIONS'} · ABOUT ${estimatedMinutes} MINUTES`}</small>
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
            <div><p className="eyebrow">Your review plan</p><h2 id="practice-plan-title">What you will practice</h2></div>
            <p>No new concepts. Every question comes from a completed {track.shortName} module.</p>
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
            Practice changes only when these ideas return. It awards no XP or star shards.
            {deferredDueCount > 0 && ` This set stays short on purpose. The remaining ${deferredDueCount} due ${deferredDueCount === 1 ? 'idea' : 'ideas'} will be first in your next set.`}
          </p>
        </section>
      )}
      <div className="section-label"><span>HOW PRACTICE WORKS</span><i /></div>
      <div className="explain-grid">
        <article><span>01</span><h3>Learn it</h3><p>Meet one idea in plain language, then use it immediately.</p></article>
        <article><span>02</span><h3>Retrieve it</h3><p>Bring the idea back from memory instead of only rereading it.</p></article>
        <article><span>03</span><h3>Space it</h3><p>Correct answers wait longer. Struggles return sooner and more gently.</p></article>
      </div>
      {dueConcepts.length > 0 && (
        <section className="practice-plain-note">
          <BookOpen size={19} />
          <p><b>Why these questions?</b> {dueConcepts.length === 1 ? 'One idea is ready' : `${dueConcepts.length} ideas are ready`} to be recalled. We use your answers only to decide when these ideas should return. Practice answers and code are not added to your saved learning record.</p>
        </section>
      )}
    </main>
  )
}

interface PracticeSessionRouteProps {
  onNavigate: (path: string) => void
  onProgress: Dispatch<SetStateAction<LearnerProgress>>
  practiceStep: number
  progress: LearnerProgress
  trackOverride?: LanguageTrack
}

function PracticeSessionRoute({ onNavigate, onProgress, practiceStep, progress, trackOverride }: PracticeSessionRouteProps) {
  const track = trackOverride ?? trackById(progress.activeLanguage)
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

  return (
    <main className="content-page">
      <div className="page-heading page-heading--simple"><div><p className="kicker"><UserRound size={14} /> LEARNER RECORD</p><h1>{progress.callsign}</h1><p>{recordLocation}</p></div></div>
      <div className="record-grid">
        <article><Zap /><span><b>{progress.xp}</b><small>Total XP</small></span></article>
        <article><Flame /><span><b>{progress.streak}</b><small>Day streak</small></span></article>
        <article><Trophy /><span><b>{progress.completedMissions.length}</b><small>Missions</small></span></article>
        <article><CheckCircle2 /><span><b>{accuracy}%</b><small>Accuracy</small></span></article>
      </div>
      <section className="station-records" aria-labelledby="course-records-title">
        <div className="station-records__heading">
          <div><small>FIVE COURSE RECORDS</small><h2 id="course-records-title">Course records</h2></div>
          <p>Each course keeps its own ordered record. Python Foundations and Practical Python remain separate, so continuing never changes your foundation completion.</p>
        </div>
        <div className="station-records__grid">
          {courses.map((course) => {
            const track = trackById(course.language)
            return (
              <article key={course.id} style={{ '--station-accent': track.accent } as React.CSSProperties}>
                <div className="station-records__name"><LanguageSymbol language={course.language} size="small" /><span><b>{course.title}</b><small>{course.kind === 'foundation' ? `${track.role} foundation` : 'Next-step Python course'}</small></span></div>
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
    ? 'Sign in to create a private Cadet Record that can continue on another device.'
    : syncState === 'synced'
      ? `Your Cadet Record is synchronized${syncUpdatedAt ? ` as of ${new Date(syncUpdatedAt).toLocaleString()}` : ''}.`
      : syncState === 'needs-choice'
        ? 'Choose how this browser and the saved account record should be combined.'
        : syncState === 'offline'
          ? 'The account could not be reached. This browser copy is safe and can retry later.'
          : syncState === 'local-only'
            ? 'This browser copy is not currently synchronizing. You can start synchronization whenever you are ready.'
            : syncState === 'saving' || syncState === 'checking'
              ? 'Checking and saving your private Cadet Record.'
              : 'The account record needs attention. This browser copy has not been removed.'

  return (
    <main className="content-page">
      <div className="page-heading page-heading--simple">
        <div><p className="kicker"><Settings size={14} /> SETTINGS</p><h1>Academy settings</h1><p>Identity, synchronization, training pace, backups, and your stored learning data.</p></div>
      </div>
      <section className="account-panel">
        <span className="account-panel__icon"><Github size={24} /></span>
        <div>
          <small>{authUser ? 'ACCOUNT AND SYNC' : 'GITHUB ACCOUNT'}</small>
          <h2>{authUser ? `Signed in as ${authUser.login}` : 'No account connected'}</h2>
          <p>{accountDescription}</p>
          {authUser && syncMessage && <p className="account-panel__status" role="status">{syncMessage}</p>}
        </div>
        {authUser ? (
          <div className="account-panel__actions">
            <button className="secondary-action" onClick={onSyncNow} disabled={syncBusy || syncState === 'needs-choice'}>
              <RefreshCw size={16} /> {syncBusy ? 'Synchronizing' : 'Sync now'}
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
          <small>DAILY TRAINING GOAL</small>
          <h2 id="training-goal-title">Choose a pace that fits today</h2>
          <p>The goal is a gentle reminder, not a deadline. Missing it never locks a lesson, removes a streak already earned, or costs shards.</p>
        </div>
        <div className="training-goal-panel__options" aria-label="Daily training goal">
          {[5, 10, 15].map((goal) => (
            <button
              key={goal}
              className="secondary-action"
              aria-pressed={progress.dailyGoal === goal}
              onClick={() => onDailyGoalChange(goal)}
            >
              <Clock3 size={15} /> {goal} XP
            </button>
          ))}
        </div>
      </section>
      <section className="backup-panel">
        <span className="account-panel__icon"><Download size={24} /></span>
        <div>
          <small>PORTABLE PROGRESS BACKUP</small>
          <h2>Keep a copy that you control</h2>
          <p>Download your callsign, XP, missions, streak, and review schedule as a JSON file. Restoring validates every value before replacing this browser copy. If synchronization is active, the restored copy is then saved to the account.</p>
          {backupMessage && <p className="backup-panel__status" role="status">{backupMessage}</p>}
        </div>
        <div className="backup-panel__actions">
          <button className="secondary-action" onClick={() => setBackupMessage(onDownloadBackup())}>
            <Download size={16} /> Download backup
          </button>
          <button className="secondary-action" onClick={() => restoreInput.current?.click()}>
            <Upload size={16} /> Restore backup
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
            <small>ACCOUNT DATA CONTROL</small>
            <h2>Delete synchronized learning data</h2>
            <p>This permanently removes the server copy of your Cadet Record. It does not delete the copy in this browser, your GitHub account, or your GitHub authorization.</p>
          </div>
          <button className="danger-button" onClick={onDeleteAccountData} disabled={syncBusy}>
            <Trash2 size={16} /> Delete account learning data
          </button>
        </section>
      )}
      <section className="settings-panel">
        <div><small>LEARNING PROGRESS</small><h2>Reset learning progress</h2><p>Resetting removes your learner name, course and project completion, XP, shards, streak, training goal, and review schedule from this browser. Saved project code and local check summaries stay on this browser. When account synchronization is active, the empty learning record becomes the synchronized copy too.</p></div>
        <button className="danger-button" onClick={onReset}><RotateCcw size={16} /> Reset learning progress</button>
      </section>
    </main>
  )
}

function authNoticeFromLocation(): string | null {
  const url = new URL(window.location.href)
  if (url.searchParams.get('auth') === 'success') return 'GitHub identity verified. Welcome aboard.'
  if (url.searchParams.get('auth') !== 'error') return null

  const reason = url.searchParams.get('reason')
  if (reason === 'cancelled') return 'GitHub sign-in was cancelled. Your local progress was not changed.'
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
          <p className="kicker">PRIVATE CADET RECORD</p>
          <h2 id="sync-dialog-title">{remote ? 'Choose which progress to continue' : 'Save this browser’s progress to your account?'}</h2>
          <p>
            {remote
              ? 'This browser and your account contain different learning records. Nothing will be overwritten until you choose.'
              : 'Your current missions, XP, streak, settings, and review schedule can follow you to another signed-in device.'}
          </p>
        </div>
        {remote && (
          <div className="sync-dialog__records">
            <article><small>THIS BROWSER</small><b>{local.xp} XP · {local.completedMissions.length} missions</b><span>{local.callsign || 'Unnamed cadet'}</span></article>
            <article><small>SAVED ACCOUNT</small><b>{remote.progress.xp} XP · {remote.progress.completedMissions.length} missions</b><span>Updated {new Date(remote.updatedAt).toLocaleString()}</span></article>
          </div>
        )}
        <div className="sync-dialog__actions">
          {remote ? (
            <>
              <button autoFocus className="primary-action" onClick={() => onChoose('combine')} disabled={busy}>Combine safely</button>
              <button className="secondary-action" onClick={() => onChoose('local')} disabled={busy}>Use this browser</button>
              <button className="secondary-action" onClick={() => onChoose('remote')} disabled={busy}>Use saved account</button>
            </>
          ) : (
            <button autoFocus className="primary-action" onClick={() => onChoose('local')} disabled={busy}>Save progress to account</button>
          )}
          <button className="text-action" onClick={onLater} disabled={busy}>Decide later</button>
        </div>
        <p className="sync-dialog__fine-print">
          <Shield size={14} /> The academy stores the learning record only. It does not retain submitted code, GitHub tokens, email, or raw IP addresses here.
        </p>
      </section>
    </dialog>
  )
}

function NotFoundPage({ progress }: { progress: LearnerProgress }) {
  return (
    <main className="route-message-page" id="main-content" tabIndex={-1}>
      <BrandMark />
      <section className="route-message-card">
        <p className="kicker"><Compass size={15} /> Uncharted route</p>
        <h1>That page is not on the academy map</h1>
        <p>The address may be incomplete, outdated, or mistyped. The public introduction and your current academy route are still available.</p>
        <div className="landing-actions">
          <AppLink className="primary-action" to="/">Visit the launch page <ArrowRight size={17} /></AppLink>
          {progress.onboardingComplete && <AppLink className="secondary-action" to={homePath()}>Return to your learning home</AppLink>}
        </div>
      </section>
    </main>
  )
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
    if (initialRoute.language && routeSetsLanguagePreference(initialRoute.page)) {
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
  const [continuingPracticeMissions, setContinuingPracticeMissions] = useState<Partial<Record<LanguageId, Mission[]>>>({})
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

  const continuingPracticeLanguage = route.language
    && (route.page === 'practice' || route.page === 'practice-session')
    && continuingPracticeLoaders[route.language]
    ? route.language
    : null

  useEffect(() => {
    if (!continuingPracticeLanguage || continuingPracticeMissions[continuingPracticeLanguage]) return
    const loader = continuingPracticeLoaders[continuingPracticeLanguage]
    if (!loader) return
    let active = true
    void loader().then((missions) => {
      if (active) {
        setContinuingPracticeMissions((current) => ({
          ...current,
          [continuingPracticeLanguage]: missions,
        }))
      }
    })
    return () => { active = false }
  }, [continuingPracticeLanguage, continuingPracticeMissions])

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
  }, [location.pathname, location.search])

  useEffect(() => {
    if (route.page === 'landing') {
      document.title = 'SeePoundCoffeePie | Programming from the beginning.'
      return
    }
    if (route.page === 'lesson' && routedCourse?.kind === 'continuing') return

    const track = route.language ? trackById(route.language) : null
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
            ? routedCourse?.title ?? (track ? `${track.shortName} Foundations` : 'Course')
        : route.page === 'practice' || route.page === 'practice-session'
          ? `${track?.shortName} Practice`
          : route.page === 'codebook'
            ? `${track?.shortName} Codebook`
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
    document.title = `${pageTitle ?? 'Academy'} | SeePoundCoffeePie`
  }, [route.checkpointId, route.exerciseId, route.language, route.missionId, route.page, route.projectId, routedCourse])

  useEffect(() => {
    const handleNavigation = () => {
      const nextLocation = readBrowserLocation()
      const nextRoute = parseAppRoute(nextLocation.pathname, nextLocation.search)
      setLocation(nextLocation)
      if (nextRoute.language && routeSetsLanguagePreference(nextRoute.page)) {
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
    setSyncMessage(`Cadet Record synchronized at ${new Date(record.updatedAt).toLocaleTimeString()}.`)
  }, [])

  const saveAccountProgress = useCallback(async (
    nextProgress: LearnerProgress,
    revision: number,
  ) => {
    setSyncBusy(true)
    setSyncState('saving')
    setSyncMessage('Saving the latest Cadet Record to your account.')
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
      setSyncMessage(error instanceof Error ? error.message : 'This browser copy is safe, but it could not synchronize yet.')
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
            setSyncMessage('Account connected. New learning progress will synchronize automatically.')
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
        setSyncMessage(error instanceof Error ? error.message : 'The account record could not be checked. This browser copy is safe.')
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
          setSyncMessage('Checking for an existing Cadet Record.')
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

  const practiceTrack = useMemo<LanguageTrack | null>(() => {
    const foundation = trackById(normalizedProgress.activeLanguage)
    if (continuingPracticeLanguage !== foundation.id) return foundation
    const continuingMissions = continuingPracticeMissions[foundation.id]
    if (!continuingMissions) return null
    return { ...foundation, missions: [...foundation.missions, ...continuingMissions] }
  }, [continuingPracticeLanguage, continuingPracticeMissions, normalizedProgress.activeLanguage])

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
      setAuthNotice('Signed out. This browser copy of your Cadet Record is still here.')
    } catch {
      setAuthNotice('Sign-out could not be completed. Please try again.')
    } finally {
      setAuthBusy(false)
    }
  }

  const reset = () => {
    const message = syncEnabledRef.current
      ? 'Reset all SeePoundCoffeePie learning progress? The empty record will replace the synchronized account copy and return this browser to beginner intake. Saved project code and local check summaries will stay on this browser.'
      : 'Reset all local SeePoundCoffeePie learning progress and return to beginner intake? Saved project code and local check summaries will stay on this browser.'
    if (window.confirm(message)) {
      const sessionStorage = practiceSessionStorage()
      tracks.forEach((track) => clearPracticeSession(track.id, sessionStorage))
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
    return 'Backup downloaded. Keep the JSON file somewhere you control.'
  }

  const restoreProgressBackup = (text: string) => {
    const result = parseProgressBackup(text)
    if (!result.ok) return result.message
    const restoreQuestion = syncEnabledRef.current
      ? 'Replace the current SeePoundCoffeePie progress with this backup and synchronize the restored record to the account?'
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
      setAuthNotice('This browser now uses the Cadet Record saved in your account.')
      return
    }
    const selected = choice === 'combine' && remote
      ? mergeLearnerProgress(progressRef.current, remote.progress)
      : progressRef.current
    if (choice === 'combine') setProgress(selected)
    const saved = await saveAccountProgress(selected, remote?.revision ?? 0)
    if (saved) {
      setAuthNotice(choice === 'combine'
        ? 'The browser and account records were combined and synchronized.'
        : 'This browser’s Cadet Record is now saved to your account.')
    }
  }

  const deferSyncChoice = () => {
    syncEnabledRef.current = false
    setSyncChoice(undefined)
    setSyncState('local-only')
    setSyncMessage('Synchronization is paused by your choice. This browser copy remains available.')
  }

  const syncNow = () => {
    if (syncState === 'needs-choice') return
    void saveAccountProgress(progressRef.current, syncRevisionRef.current)
  }

  const deleteAccountData = async () => {
    if (!window.confirm('Permanently delete the synchronized Cadet Record from your account? The copy in this browser will remain.')) return
    setSyncBusy(true)
    try {
      await deleteRemoteProgress()
      syncEnabledRef.current = false
      syncRevisionRef.current = 0
      syncedSnapshotRef.current = null
      setSyncRecord(null)
      setSyncChoice(undefined)
      setSyncState('local-only')
      setSyncMessage('The synchronized learning record was deleted. This browser copy remains local.')
      setAuthNotice('Account learning data deleted. Your browser copy was not removed.')
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
    ? 'Your private Cadet Record is stored in this browser and synchronized to your account.'
    : authUser
      ? 'Your Cadet Record is stored in this browser. Account synchronization needs attention.'
      : 'Your Cadet Record is stored only in this browser until you choose to sign in.'

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
    if (!practiceTrack) return <LessonPlayerFallback practice />
    return (
      <>
        {authNotice && <AuthNotice message={authNotice} onDismiss={() => setAuthNotice(null)} />}
        {syncDialog}
        <PracticeSessionRoute
          key={`practice-session-${language}`}
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
    const track = trackById(route.language ?? progress.activeLanguage)
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
            <main className="content-page">
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
            <main className="content-page" aria-busy="true">
              <section className="route-message-card route-message-card--inside">
                <p className="kicker"><FileCode2 size={15} /> Portfolio preview</p>
                <h1>Preparing the private preview</h1>
                <p>Loading the project description and checking this browser for the final source.</p>
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
            <main className="content-page" aria-busy="true">
              <section className="route-message-card route-message-card--inside">
                <p className="kicker"><Coffee size={15} /> Project studio</p>
                <h1>Opening your project</h1>
                <p>Loading the lesson notes, editor, and your browser-saved draft.</p>
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
        {route.page === 'home' && <LearnerHome progress={normalizedProgress} />}
        {route.page === 'courses' && <CourseCatalog progress={normalizedProgress} />}
        {route.page === 'course' && route.courseId && routedCourse?.kind === 'continuing' && (
          <Suspense fallback={(
            <main className="content-page" aria-busy="true">
              <section className="route-message-card route-message-card--inside">
                <p className="kicker"><BookOpen size={15} /> {routedCourse.shortName}</p>
                <h1>Opening the course</h1>
                <p>Loading the six-module outline and its beginner-friendly lesson previews.</p>
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
          <MissionPath
            key={`course:${route.courseId ?? route.language ?? normalizedProgress.activeLanguage}`}
            onProgress={updateProgress}
            progress={route.language ? { ...normalizedProgress, activeLanguage: route.language } : normalizedProgress}
          />
        )}
        {route.page === 'practice' && (practiceTrack
          ? <PracticeBay progress={normalizedProgress} trackOverride={practiceTrack} />
          : <main className="content-page" aria-busy="true"><section className="route-message-card route-message-card--inside"><p className="kicker"><RotateCcw size={15} /> Practice</p><h1>Preparing your review</h1><p>Loading completed {trackById(normalizedProgress.activeLanguage).shortName} course material for this language-wide practice set.</p></section></main>)}
        {route.page === 'codebook' && (
          <Suspense fallback={<main className="content-page" aria-busy="true"><section className="route-message-card route-message-card--inside"><p className="kicker"><BookOpen size={15} /> Codebook</p><h1>Opening the reference</h1><p>Loading plain-language definitions and the examples you have unlocked.</p></section></main>}>
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
