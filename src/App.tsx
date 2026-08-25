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
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from 'react'
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
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
  Flame,
  Gem,
  GitFork as Github,
  Home,
  LibraryBig,
  LockKeyhole,
  LogOut,
  Menu,
  MessageCircleQuestion,
  Orbit,
  RefreshCw,
  RotateCcw,
  Search,
  Settings,
  Shield,
  Sparkles,
  TerminalSquare,
  Trophy,
  Trash2,
  Upload,
  UserRound,
  X,
  Zap,
} from 'lucide-react'
import { codebookEntries, codebookExampleState, codebookMatches } from './data/codebook'
import { trackById, tracks } from './data/curriculum'
import { pythonInteractiveProjectManifest as pythonInteractiveProject } from './data/python-interactive-project-manifest'
import { buildCourseCards, buildCourseModel, type CourseCardModel } from './lib/course-model'
import { orderedChoices } from './lib/choice-order'
import { evaluateExercise } from './lib/evaluator'
import { missionAvailability } from './lib/missions'
import { buildPracticeExercises, conceptDisplayName, recommendPractice } from './lib/practice'
import { parseProgressBackup, serializeProgressBackup } from './lib/progress-backup'
import {
  completeMission,
  dateKey,
  initialProgress,
  isDue,
  loadProgress,
  recordAttempt,
  saveProgress,
} from './lib/progress'
import { buildReviewQueue, resetReviewAnswers } from './lib/review'
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
import { runExercise, type RunnerClientStatus } from './lib/runner-client'
import type { RunnerResult } from './lib/runner-contract'
import {
  codebookPath,
  coursePath,
  coursesPath,
  homePath,
  lessonPath,
  pagePath,
  parseAppRoute,
  practiceMissionPath,
  practicePath,
  projectPath,
} from './lib/routes'
import type {
  AuthUser,
  EvaluationResult,
  LanguageId,
  LearnerProgress,
  Mission,
} from './types'

type ViewId = 'home' | 'courses' | 'path' | 'practice' | 'spellbook' | 'profile' | 'settings'

const ProjectStudio = lazy(async () => {
  const module = await import('./ProjectStudio')
  return { default: module.ProjectStudio }
})

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

function LanguageSymbol({ language, size = 'medium' }: { language: LanguageId; size?: 'small' | 'medium' | 'large' }) {
  const className = `language-symbol language-symbol--${language} language-symbol--${size}`
  if (language === 'cpp') return <span className={className} aria-label="C++"><Eye aria-hidden="true" /></span>
  if (language === 'csharp') return <span className={className} aria-label="C#">#</span>
  if (language === 'java') return <span className={className} aria-label="Java"><Coffee aria-hidden="true" /></span>
  return <span className={className} aria-label="Python">π</span>
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
              <LanguageSymbol language={track.id} size="small" />
              <span className="sr-only">Active course</span>
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

function CourseSymbol({ course, size = 'medium' }: { course: Pick<CourseCardModel, 'id' | 'title'>; size?: 'small' | 'medium' | 'large' }) {
  return <LanguageSymbol language={course.id} size={size} />
}

function CourseCard({ course }: { course: CourseCardModel }) {
  const status = course.status === 'complete'
    ? 'Course complete'
    : course.status === 'in-progress'
      ? `${course.completedModuleCount} of ${course.moduleCount} modules complete`
      : 'Ready when you are'
  return (
    <article className={`course-card course-card--${course.id}`}>
      <div className="course-card__heading">
        <CourseSymbol course={course} size="large" />
        <div><span>{course.level} course</span><h2>{course.title}</h2></div>
      </div>
      <p>{course.description}</p>
      <dl>
        <div><dt>What you will make</dt><dd>{course.outcome}</dd></div>
        <div><dt>Course size</dt><dd>{course.moduleCount} modules, {course.lessonCount} short lessons</dd></div>
      </dl>
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
  const [filter, setFilter] = useState<'all' | 'foundations' | 'projects'>('all')
  const showFoundations = filter !== 'projects'
  const showProjects = filter !== 'foundations'
  return (
    <main className="workshop-page course-catalog">
      <header className="workshop-page-heading">
        <p className="eyebrow">Course catalog</p>
        <h1>Choose a foundation. Explore every course.</h1>
        <p>Each course begins at the beginning. You can switch languages whenever you like without losing work in another course.</p>
      </header>
      <nav className="catalog-filters" aria-label="Course filters">
        <button aria-pressed={filter === 'all'} className={filter === 'all' ? 'is-active' : ''} onClick={() => setFilter('all')} type="button">All courses</button>
        <button aria-pressed={filter === 'foundations'} className={filter === 'foundations' ? 'is-active' : ''} onClick={() => setFilter('foundations')} type="button">Foundations</button>
        <button aria-pressed={filter === 'projects'} className={filter === 'projects' ? 'is-active' : ''} onClick={() => setFilter('projects')} type="button">Guided projects</button>
      </nav>
      {showFoundations && <section className="course-grid" aria-label="Foundation courses">
        {courses.map((course) => <CourseCard course={course} key={course.id} />)}
      </section>}
      {showProjects && <section className="guided-project-list" aria-labelledby="guided-projects-title">
        <div className="section-heading-open">
          <div><p className="eyebrow">Build something complete</p><h2 id="guided-projects-title">Guided projects</h2></div>
          <p>Start with small checkpoints, then finish with a program you can download and keep.</p>
        </div>
        <AppLink className="guided-project-row guided-project-row--featured" to={projectPath('python', pythonInteractiveProject.id)}>
          <LanguageSymbol language="python" />
          <span><small>Python project studio · 12 checkpoints</small><b>{pythonInteractiveProject.title}</b><p>{pythonInteractiveProject.subtitle}</p></span>
          <strong>Open project <ArrowRight size={16} /></strong>
        </AppLink>
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

function LearnerHome({ progress }: { progress: LearnerProgress }) {
  const courses = buildCourseCards(progress)
  const activeCourse = buildCourseModel(trackById(progress.activeLanguage), progress)
  const reviewsDue = Object.values(progress.conceptProgress).filter((concept) => isDue(concept)).length
  const projectReady = activeCourse.id === 'python' && activeCourse.status === 'complete'
  const completedProjectCheckpointCount = pythonInteractiveProject.checkpoints.filter((checkpoint) => (
    progress.completedProjectCheckpoints.includes(checkpoint.id)
  )).length
  const nextProjectCheckpoint = pythonInteractiveProject.checkpoints.find((checkpoint) => (
    !progress.completedProjectCheckpoints.includes(checkpoint.id)
  ))
  const projectComplete = progress.completedProjects.includes(pythonInteractiveProject.id)
  const continueTo = projectReady
    ? completedProjectCheckpointCount > 0 && nextProjectCheckpoint && !projectComplete
      ? projectPath('python', pythonInteractiveProject.id, nextProjectCheckpoint.id)
      : projectPath('python', pythonInteractiveProject.id)
    : activeCourse.currentModuleId && activeCourse.currentLessonId
      ? lessonPath(activeCourse.id, activeCourse.currentModuleId, activeCourse.currentLessonId)
      : coursePath(activeCourse.id)
  const continueEyebrow = projectReady
    ? projectComplete ? 'Project complete' : completedProjectCheckpointCount > 0 ? 'Continue your project' : 'Your next step'
    : 'Continue learning'
  const continueTitle = projectReady
    ? pythonInteractiveProject.title
    : activeCourse.currentLessonTitle ?? activeCourse.title
  const continueDescription = projectReady
    ? projectComplete
      ? 'Your Coffee Counter is complete. Reopen any checkpoint, download the program again, or explain how each piece works.'
      : completedProjectCheckpointCount > 0
        ? `${completedProjectCheckpointCount} of ${pythonInteractiveProject.checkpoints.length} checkpoints complete. Your browser saved the code for your next small step.`
        : pythonInteractiveProject.subtitle
    : activeCourse.currentModuleTitle
      ? `${activeCourse.title}, Module ${activeCourse.modules.find((item) => item.id === activeCourse.currentModuleId)?.number}: ${activeCourse.currentModuleTitle}`
      : activeCourse.outcome
  const continueAction = projectReady
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

      <section className={`continue-panel continue-panel--${activeCourse.id}`}>
        <CourseSymbol course={activeCourse} size="large" />
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
          <p>{reviewsDue === 0 ? 'Reviews appear after you learn a concept.' : 'Bring these ideas back before they become fuzzy.'}</p>
          <AppLink to={practicePath(progress.activeLanguage)}>{reviewsDue === 0 ? 'See how practice works' : 'Start a short review'} <ArrowRight size={16} /></AppLink>
        </section>
      </div>

      <section className="home-course-list" aria-labelledby="my-courses-title">
        <div className="section-heading-open"><div><p className="eyebrow">Your courses</p><h2 id="my-courses-title">Four ways to learn the same foundations</h2></div><AppLink to={coursesPath()}>Browse all courses <ArrowRight size={16} /></AppLink></div>
        {courses.map((course) => (
          <AppLink className="home-course-row" key={course.id} to={coursePath(course.id)}>
            <CourseSymbol course={course} />
            <span><b>{course.title}</b><small>{course.status === 'not-started' ? 'Not started' : `${course.completedModuleCount} of ${course.moduleCount} modules complete`}</small></span>
            <i aria-label={`${course.title} progress`} aria-valuemax={100} aria-valuemin={0} aria-valuenow={course.progressPercent} role="progressbar"><b style={{ width: `${course.progressPercent}%` }} /></i>
            <strong>{course.actionLabel} <ArrowRight size={15} /></strong>
          </AppLink>
        ))}
      </section>
    </main>
  )
}

function MissionPath({ progress }: { progress: LearnerProgress }) {
  const track = trackById(progress.activeLanguage)
  const course = buildCourseModel(track, progress)
  const [expandedModule, setExpandedModule] = useState(course.currentModuleId ?? course.modules[0]?.id ?? '')
  const currentModule = course.modules.find((module) => module.id === course.currentModuleId)
  const currentLesson = currentModule?.lessons.find((lesson) => lesson.id === course.currentLessonId)
  const continueTo = currentModule && currentLesson
    ? lessonPath(track.id, currentModule.id, currentLesson.id)
    : coursePath(track.id)

  return (
    <main className="workshop-page course-outline">
      <AppLink className="back-link" to={coursesPath()}><ArrowLeft size={16} /> All courses</AppLink>
      <header className={`course-hero course-hero--${track.id}`}>
        <CourseSymbol course={course} size="large" />
        <div><p className="eyebrow">Beginner course</p><h1>{course.title}</h1><p>{course.description}</p><span>{course.moduleCount} modules · {course.lessonCount} short lessons · {course.level}</span></div>
        <div className="course-hero__action"><b>{course.progressPercent}% complete</b><i aria-label={`${course.title} progress`} aria-valuemax={100} aria-valuemin={0} aria-valuenow={course.progressPercent} role="progressbar"><span style={{ width: `${course.progressPercent}%` }} /></i><AppLink className="primary-action" to={continueTo}>{course.actionLabel} <ArrowRight size={17} /></AppLink></div>
      </header>

      <section className="course-modules" aria-labelledby="course-content-title">
        <div className="section-heading-open"><div><p className="eyebrow">Course outline</p><h2 id="course-content-title">What you will learn</h2></div><p>Open a module to see its five short lessons.</p></div>
        {course.modules.map((module) => {
          const expanded = expandedModule === module.id
          return (
            <article className={`module-row ${module.completed ? 'is-complete' : ''} ${module.current ? 'is-current' : ''}`} key={module.id}>
              <button className="module-row__summary" aria-controls={`module-${module.id}-lessons`} aria-expanded={expanded} onClick={() => setExpandedModule(expanded ? '' : module.id)}>
                <span className="module-number">{module.completed ? <Check size={17} /> : module.availability === 'available' ? module.number : <LockKeyhole size={15} />}</span>
                <span><small>{module.kind === 'guided-project' ? 'Guided project' : `Module ${module.number}`}</small><b>{module.title}</b><p>{module.description}</p></span>
                <strong>{module.completedLessonCount} / {module.lessonCount} lessons</strong>
                <ChevronDown size={19} />
              </button>
              <div className="module-lessons" hidden={!expanded} id={`module-${module.id}-lessons`}>
                  {module.lessons.map((lesson) => {
                    const canOpen = module.availability === 'available'
                    return canOpen ? (
                      <AppLink aria-current={lesson.current ? 'step' : undefined} className={lesson.current ? 'is-current' : ''} key={lesson.id} to={lessonPath(track.id, module.id, lesson.id)}>
                        <span>{lesson.completed ? <Check size={15} /> : lesson.number}</span><b>{lesson.title}</b><small>{lesson.type === 'bugfix' ? 'Debugging' : lesson.type === 'choice' ? 'Guided check' : lesson.type === 'prediction' ? 'Prediction' : lesson.type === 'ordering' ? 'Ordering' : 'Code exercise'}</small><ArrowRight size={15} />
                      </AppLink>
                    ) : (
                      <div className="is-locked" key={lesson.id}><span><LockKeyhole size={13} /></span><b>{lesson.title}</b><small>{module.availability === 'available' ? 'Complete this module in order' : 'Complete the previous module first'}</small></div>
                    )
                  })}
              </div>
            </article>
          )
        })}
      </section>
      {track.id === 'python' && (
        <section className="course-project-next" aria-labelledby="course-project-next-title">
          <LanguageSymbol language="python" size="large" />
          <div>
            <p className="eyebrow">After the foundations</p>
            <h2 id="course-project-next-title">{pythonInteractiveProject.title}</h2>
            <p>{pythonInteractiveProject.subtitle}</p>
            <span>{pythonInteractiveProject.checkpoints.length} checkpoints · {pythonInteractiveProject.duration} · downloadable Python file</span>
          </div>
          <AppLink className="primary-action" to={projectPath('python', pythonInteractiveProject.id)}>
            {progress.completedProjects.includes(pythonInteractiveProject.id)
              ? 'Review project'
              : course.status === 'complete' ? 'Open project' : 'Preview project'} <ArrowRight size={17} />
          </AppLink>
        </section>
      )}
    </main>
  )
}

function PracticeBay({ progress, onStart }: { progress: LearnerProgress; onStart: (mission: Mission, conceptIds: string[]) => void }) {
  const track = trackById(progress.activeLanguage)
  const recommendation = recommendPractice(track, progress)
  const { coveredConceptIds, dueConcepts, mission, mode } = recommendation
  const dueLabel = `${dueConcepts.length} ${dueConcepts.length === 1 ? 'concept is' : 'concepts are'} ready`
  const heroTitle = mode === 'start' ? 'Your first mission is ready' : mode === 'due' ? dueLabel : 'Your orbit is clear'
  const heroText = mode === 'start'
    ? `Begin with ${mission.title}. Reviews appear here after you have practiced a concept.`
    : mode === 'due'
      ? `Replay ${mission.title}. It is the best completed mission for ${coveredConceptIds.length} of the ${dueConcepts.length} concepts due in ${track.shortName}.`
      : `Nothing in ${track.shortName} is due yet. ${mission.title} is available if you want an extra pass.`
  const actionLabel = mode === 'start' ? `Start ${mission.title}` : mode === 'due' ? `Review ${mission.title}` : `Practice ${mission.title}`

  return (
    <main className="content-page">
      <div className="page-heading page-heading--simple">
        <div><p className="kicker"><Orbit size={14} /> SPACED PRACTICE</p><h1>Memory orbit</h1><p>Short reviews return when they can do the most good.</p></div>
      </div>
      <section className="practice-hero">
        <div className="practice-orbit"><Orbit /><span>{dueConcepts.length}</span></div>
        <div>
          <small>{mode === 'due' ? `BEST MATCH · MISSION ${String(mission.chapter).padStart(2, '0')}` : 'REVIEW QUEUE'}</small>
          <h2>{heroTitle}</h2>
          <p>{heroText}</p>
        </div>
        <button className="primary-action" onClick={() => onStart(mission, mode === 'due' ? coveredConceptIds : [])}><RotateCcw size={17} /> {actionLabel}</button>
      </section>
      <div className="section-label"><span>HOW REVIEWS WORK</span><i /></div>
      <div className="explain-grid">
        <article><span>01</span><h3>Learn it</h3><p>Meet one idea in plain language, then use it immediately.</p></article>
        <article><span>02</span><h3>Retrieve it</h3><p>Bring the idea back from memory instead of only rereading it.</p></article>
        <article><span>03</span><h3>Space it</h3><p>Correct answers wait longer. Struggles return sooner and more gently.</p></article>
      </div>
      {dueConcepts.length > 0 && (
        <section className="concept-list">
          <h2>Due concepts</h2>
          {dueConcepts.map(({ id, missionTitles, progress: concept }) => (
            <div key={id}>
              <Code2 />
              <span>
                <b>{conceptDisplayName(track, id)}</b>
                <small>Learned in {missionTitles.join(' and ')} · Memory strength {concept.strength} of 5</small>
              </span>
              <strong>{coveredConceptIds.includes(id) ? 'IN REVIEW' : 'WAITING'}</strong>
            </div>
          ))}
        </section>
      )}
    </main>
  )
}

function Codebook({ progress }: { progress: LearnerProgress }) {
  const [query, setQuery] = useState('')
  const track = trackById(progress.activeLanguage)
  const filteredEntries = useMemo(
    () => codebookEntries.filter((entry) => codebookMatches(entry, query, track.id)),
    [query, track.id],
  )
  const entriesWithExamples = codebookEntries.filter((entry) => entry.examples?.[track.id])
  const unlockedExamples = entriesWithExamples.filter((entry) => (
    codebookExampleState(entry, track, progress.completedMissions) === 'unlocked'
  )).length

  return (
    <main className="content-page">
      <div className="page-heading page-heading--simple">
        <div><p className="kicker"><LibraryBig size={14} /> PLAIN-LANGUAGE REFERENCE</p><h1>Cadet codebook</h1><p>Search every definition now. Code examples unlock after you learn them in a mission.</p></div>
      </div>
      <section className="codebook-tools" aria-label="Codebook controls">
        <label className="codebook-search">
          <Search size={18} />
          <span className="sr-only">Search the codebook</span>
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search variable, true, braces, ==..." />
          {query && <button onClick={() => setQuery('')} aria-label="Clear codebook search"><X size={15} /></button>}
        </label>
        <div className="codebook-unlocks">
          <small>{track.shortName.toUpperCase()} EXAMPLES</small>
          <b>{unlockedExamples} of {entriesWithExamples.length} unlocked</b>
          <span>Complete lessons to reveal syntax you have already met.</span>
        </div>
      </section>
      {filteredEntries.length > 0 ? (
        <div className="glossary-grid">
          {filteredEntries.map((item, index) => {
            const exampleState = codebookExampleState(item, track, progress.completedMissions)
            const example = item.examples?.[track.id]
            const requiredMission = item.unlockAfter ? track.missions[item.unlockAfter - 1] : undefined
            return (
              <article key={item.term}>
                <span className="glossary-number">{String(index + 1).padStart(2, '0')}</span>
                <Code2 size={21} />
                <h2>{item.term}</h2>
                <p>{item.plain}</p>
                <div className="glossary-analogy"><Sparkles size={15} /><span><b>On the ship</b>{item.ship}</span></div>
                {exampleState === 'unlocked' && example && (
                  <div className="glossary-example"><small>{track.shortName.toUpperCase()} EXAMPLE</small><code>{example}</code></div>
                )}
                {exampleState === 'locked' && (
                  <div className="glossary-example-lock"><LockKeyhole size={15} /><span><b>EXAMPLE LOCKED</b>Complete {requiredMission?.title ?? 'the introducing mission'} to reveal it.</span></div>
                )}
              </article>
            )
          })}
        </div>
      ) : (
        <section className="codebook-empty">
          <Search size={28} />
          <h2>No codebook term matches “{query}”</h2>
          <p>Try a plain word such as text, number, decision, output, or braces.</p>
          <button className="secondary-action" onClick={() => setQuery('')}>Clear search</button>
        </section>
      )}
    </main>
  )
}

interface CadetRecordProps {
  onOpenTrack: (language: LanguageId) => void
  progress: LearnerProgress
  recordLocation: string
}

function CadetRecord({ onOpenTrack, progress, recordLocation }: CadetRecordProps) {
  const concepts = Object.values(progress.conceptProgress)
  const answers = concepts.reduce((sum, item) => sum + item.correct + item.incorrect, 0)
  const accuracy = answers ? Math.round((concepts.reduce((sum, item) => sum + item.correct, 0) / answers) * 100) : 0

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
          <div><small>FOUR FOUNDATION COURSES</small><h2 id="course-records-title">Course records</h2></div>
          <p>Each language keeps its own ordered course record. Open any foundation without erasing progress in the others.</p>
        </div>
        <div className="station-records__grid">
          {tracks.map((track) => {
            const completed = track.missions.filter((mission) => progress.completedMissions.includes(mission.id)).length
            const percent = Math.round((completed / track.missions.length) * 100)
            const active = progress.activeLanguage === track.id
            return (
              <article key={track.id} style={{ '--station-accent': track.accent } as React.CSSProperties}>
                <div className="station-records__name"><LanguageSymbol language={track.id} size="small" /><span><b>{track.shortName} Foundations</b><small>{track.role}</small></span></div>
                <div className="station-records__count"><b>{completed} / {track.missions.length}</b><small>missions complete</small></div>
                <div className="station-records__bar" aria-label={`${track.shortName} ${percent}% complete`} aria-valuemax={100} aria-valuemin={0} aria-valuenow={percent} role="progressbar"><span style={{ width: `${percent}%` }} /></div>
                <button className="secondary-action" onClick={() => onOpenTrack(track.id)}>
                  {active ? 'View active course' : `Open ${track.shortName} Foundations`} <ArrowRight size={15} />
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
        <div><small>LEARNING PROGRESS</small><h2>Reset learning progress</h2><p>Resetting removes the learner name, XP, mission completion, and review history from this browser. When account synchronization is active, the reset becomes the new synchronized copy too.</p></div>
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

interface LessonPlayerProps {
  initialExerciseId?: string
  mission: Mission
  onExerciseChange?: (exerciseId: string) => void
  practiceConceptIds?: string[]
  progress: LearnerProgress
  onProgress: (progress: LearnerProgress) => void
  onExit: () => void
}

function LessonPlayer({ initialExerciseId, mission, onExerciseChange, practiceConceptIds, progress, onProgress, onExit }: LessonPlayerProps) {
  const initialStep = Math.max(0, mission.exercises.findIndex((item) => item.id === initialExerciseId))
  const [step, setStep] = useState(initialStep)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [feedback, setFeedback] = useState<EvaluationResult | null>(null)
  const [runnerBusy, setRunnerBusy] = useState(false)
  const [runnerStatus, setRunnerStatus] = useState<RunnerClientStatus | null>(null)
  const [runnerResult, setRunnerResult] = useState<RunnerResult | null>(null)
  const [runnerFailure, setRunnerFailure] = useState(false)
  const [credited, setCredited] = useState<string[]>([])
  const [hintOpen, setHintOpen] = useState(false)
  const [finished, setFinished] = useState(false)
  const [mistakes, setMistakes] = useState<string[]>([])
  const [reviewQueue, setReviewQueue] = useState<string[]>([])
  const [reviewIndex, setReviewIndex] = useState(0)
  const [orderingAnnouncement, setOrderingAnnouncement] = useState('')
  const lessonHeadingRef = useRef<HTMLHeadingElement>(null)
  const completionHeadingRef = useRef<HTMLHeadingElement>(null)
  const [missionAlreadyComplete] = useState(() => progress.completedMissions.includes(mission.id))
  const practiceMode = practiceConceptIds !== undefined
  const sessionExercises = practiceMode
    ? buildPracticeExercises(mission, practiceConceptIds)
    : mission.exercises
  const reviewing = reviewQueue.length > 0
  const routeStep = !practiceMode && initialExerciseId
    ? sessionExercises.findIndex((item) => item.id === initialExerciseId)
    : -1
  const activeStep = !reviewing && routeStep >= 0 ? routeStep : step
  const exercise = reviewing
    ? sessionExercises.find((item) => item.id === reviewQueue[reviewIndex])
    : sessionExercises[activeStep]
  const totalXp = sessionExercises.reduce((sum, item) => sum + item.xp, 0)
  const earnedXp = sessionExercises.filter((item) => credited.includes(item.id)).reduce((sum, item) => sum + item.xp, 0)
  const progressPercent = reviewing
    ? ((reviewIndex + 1) / reviewQueue.length) * 100
    : ((activeStep + 1) / sessionExercises.length) * 100

  useEffect(() => {
    const timer = window.setTimeout(() => lessonHeadingRef.current?.focus({ preventScroll: true }), 0)
    return () => window.clearTimeout(timer)
  }, [exercise?.id, reviewIndex, reviewing])

  useEffect(() => {
    if (!finished) return
    const timer = window.setTimeout(() => completionHeadingRef.current?.focus({ preventScroll: true }), 0)
    return () => window.clearTimeout(timer)
  }, [finished])

  if (!exercise) return null

  const initialOrder = exercise.orderItems?.map((item) => item.id).join('|') ?? ''
  const answer = answers[exercise.id]
    ?? (exercise.type === 'ordering' ? initialOrder : exercise.starterCode)
    ?? ''
  const orderedIds = exercise.type === 'ordering'
    ? answer.split('|').filter(Boolean)
    : []
  const blankCount = exercise.starterCode?.match(/_____/gu)?.length ?? 0
  const choiceExercise = exercise.type === 'choice' || exercise.type === 'prediction'
  const displayChoices = choiceExercise ? orderedChoices(exercise) : []
  const editableExercise = exercise.type === 'code' || exercise.type === 'bugfix'
  const taskLabel = reviewing
    ? 'TRY IT ONCE MORE'
    : exercise.type === 'choice'
      ? 'GUIDED CHECK'
      : exercise.type === 'prediction'
        ? 'PREDICT THE OUTPUT'
        : exercise.type === 'ordering'
          ? 'PUT IT IN ORDER'
          : exercise.type === 'bugfix'
            ? 'DEBUGGING TASK'
            : 'YOUR TASK'
  const checkActionLabel = editableExercise
    ? 'Run check'
      : exercise.type === 'ordering' ? 'Check order' : 'Check answer'
  const hasUnfinishedLessons = !missionAlreadyComplete
    && sessionExercises.some((item) => !credited.includes(item.id))

  const setAnswer = (value: string) => {
    setAnswers((current) => ({ ...current, [exercise.id]: value }))
    if (feedback && !feedback.correct) setFeedback(null)
    setRunnerResult(null)
    setRunnerStatus(null)
    setRunnerFailure(false)
  }

  const moveOrderItem = (index: number, direction: -1 | 1) => {
    const destination = index + direction
    if (destination < 0 || destination >= orderedIds.length) return
    const reordered = [...orderedIds]
    ;[reordered[index], reordered[destination]] = [reordered[destination], reordered[index]]
    setAnswer(reordered.join('|'))
    const movedItem = exercise.orderItems?.find((item) => item.id === reordered[destination])
    setOrderingAnnouncement(`${movedItem?.code ?? 'Code line'} moved to position ${destination + 1} of ${reordered.length}.`)
  }

  const recordEvaluation = (result: EvaluationResult, countFailure = true) => {
    setFeedback(result)
    if (!result.correct) {
      if (countFailure && !reviewing && !mistakes.includes(exercise.id)) {
        setMistakes((current) => [...current, exercise.id])
        onProgress(recordAttempt(progress, exercise.conceptId, false, 0))
      }
      return
    }

    if (reviewing) {
      onProgress(recordAttempt(progress, exercise.conceptId, true, 0))
    } else if (!credited.includes(exercise.id)) {
      setCredited((current) => [...current, exercise.id])
      onProgress(recordAttempt(progress, exercise.conceptId, true, exercise.xp))
    }
  }

  const checkAnswer = async () => {
    setRunnerFailure(false)
    if (!editableExercise) {
      recordEvaluation(evaluateExercise(exercise, answer))
      return
    }

    const localCheck = evaluateExercise(exercise, answer)
    if (!answer.trim() || answer.includes('_____')) {
      recordEvaluation(localCheck)
      return
    }

    setRunnerBusy(true)
    setRunnerResult(null)
    try {
      const result = await runExercise(exercise.id, mission.language, answer, setRunnerStatus)
      setRunnerResult(result)
      const correct = result.outcome === 'completed'
        && result.tests.length > 0
        && result.tests.every((test) => test.passed)
      setRunnerFailure(result.outcome === 'system_error')
      recordEvaluation({
        correct,
        message: correct
          ? exercise.recap
          : `${result.diagnostic.explanation} ${result.diagnostic.suggestion}`,
        output: result.stdout,
      }, result.outcome !== 'system_error')
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : 'The isolated runner could not be reached. Your code was not marked wrong.'
      setRunnerFailure(true)
      setFeedback({ correct: false, message })
    } finally {
      setRunnerBusy(false)
      setRunnerStatus(null)
    }
  }

  const finishSession = () => {
    if (!practiceMode) onProgress(completeMission(progress, mission.id))
    setFinished(true)
  }

  const continueLesson = () => {
    if (reviewing) {
      if (reviewIndex === reviewQueue.length - 1) {
        finishSession()
        return
      }
      setReviewIndex((current) => current + 1)
      setFeedback(null)
      setRunnerResult(null)
      setRunnerStatus(null)
      setRunnerFailure(false)
      setHintOpen(false)
      return
    }

    if (activeStep === sessionExercises.length - 1) {
      const queue = buildReviewQueue(mistakes, sessionExercises.map((item) => item.id))
      if (queue.length > 0) {
        setAnswers((current) => resetReviewAnswers(current, queue))
        setReviewQueue(queue)
        setReviewIndex(0)
        setFeedback(null)
        setRunnerResult(null)
        setRunnerStatus(null)
        setRunnerFailure(false)
        setHintOpen(false)
        return
      }
      if (!practiceMode && hasUnfinishedLessons) {
        const nextUnfinished = sessionExercises.find((item) => !credited.includes(item.id))
        const nextStep = nextUnfinished ? sessionExercises.findIndex((item) => item.id === nextUnfinished.id) : -1
        if (nextUnfinished && nextStep >= 0) {
          setStep(nextStep)
          onExerciseChange?.(nextUnfinished.id)
          setFeedback(null)
          setRunnerResult(null)
          setRunnerStatus(null)
          setRunnerFailure(false)
          setHintOpen(false)
          return
        }
      }
      finishSession()
      return
    }
    const nextExercise = sessionExercises[activeStep + 1]
    setStep(activeStep + 1)
    if (nextExercise) onExerciseChange?.(nextExercise.id)
    setFeedback(null)
    setRunnerResult(null)
    setRunnerStatus(null)
    setHintOpen(false)
  }

  const handleEditorKeyDown = (event: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Enter' || (!event.ctrlKey && !event.metaKey)) return
    event.preventDefault()
    if (feedback?.correct) continueLesson()
    else void checkAnswer()
  }

  if (finished) {
    const reviewedConcepts = [...new Set(sessionExercises.map((item) => item.conceptId.split('-').slice(1).join(' ')))]
    const awardedShards = practiceMode || missionAlreadyComplete ? 0 : 25
    return (
      <div className="lesson-overlay">
        <main className="mission-complete" id="main-content" tabIndex={-1}>
          <div className="completion-burst" aria-hidden="true"><Sparkles /><span><Check /></span></div>
          <p className="kicker">{practiceMode ? 'PRACTICE COMPLETE' : 'MISSION COMPLETE'}</p>
          <h1 ref={completionHeadingRef} tabIndex={-1}>{mission.title}</h1>
          <p>{practiceMode ? 'You brought the idea back from memory and strengthened it for next time.' : 'You turned unfamiliar symbols into a working report. That is programming.'}</p>
          <div className="completion-stats">
            <div><Zap /><b>{earnedXp || totalXp}</b><span>XP earned</span></div>
            {practiceMode
              ? <div><Orbit /><b>{reviewedConcepts.length}</b><span>concepts reviewed</span></div>
              : <div><Gem /><b>{awardedShards}</b><span>star shards</span></div>}
            <div><RotateCcw /><b>{reviewQueue.length}</b><span>mistakes repaired</span></div>
          </div>
          <div className="what-learned"><h2>{practiceMode ? 'Memory strengthened' : 'Systems now familiar'}</h2><div>{reviewedConcepts.map((concept) => <span key={concept}><Check size={14} /> {concept}</span>)}</div></div>
          <button className="primary-action primary-action--wide" onClick={onExit}>Return to {practiceMode ? 'Practice Bay' : 'mission path'} <ArrowRight size={18} /></button>
        </main>
      </div>
    )
  }

  return (
    <div className="lesson-overlay">
      <header className="lesson-header">
        <button onClick={onExit} className="icon-button" aria-label="Exit lesson"><X /></button>
        <div className="lesson-progress" aria-label="Lesson progress" aria-valuemax={100} aria-valuemin={0} aria-valuenow={Math.round(progressPercent)} role="progressbar"><i style={{ width: `${progressPercent}%` }} /></div>
        <div className="lesson-step"><b>{reviewing ? reviewIndex + 1 : activeStep + 1}</b><span>/ {reviewing ? reviewQueue.length : sessionExercises.length}</span></div>
        <div className="lesson-xp"><Zap size={17} /> {earnedXp} XP</div>
      </header>

      <main className="lesson-layout" id="main-content" tabIndex={-1}>
        {practiceMode && !reviewing && (
          <section className="memory-repair" aria-label="Focused practice round">
            <Orbit size={22} />
            <div>
              <small>FOCUSED REVIEW · {activeStep + 1} OF {sessionExercises.length}</small>
              <h2>Only the concepts that need another pass.</h2>
              <p>This short session uses exercises from {mission.title}. Correct answers strengthen the next review interval.</p>
            </div>
            <span>SHORT SESSION</span>
          </section>
        )}
        {reviewing && (
          <section className="memory-repair" aria-label="Memory repair round">
            <RotateCcw size={22} />
            <div>
              <small>MEMORY REPAIR · {reviewIndex + 1} OF {reviewQueue.length}</small>
              <h2>This one is coming back so it can stick.</h2>
              <p>You already corrected it once. Now try it again from a clean starting point. Reread the explanation and use the hint whenever you want.</p>
            </div>
            <span>NO XP LOST</span>
          </section>
        )}
        <section className="lesson-briefing">
          <p className="kicker">{exercise.eyebrow}</p>
          <h1 ref={lessonHeadingRef} tabIndex={-1}>{exercise.title}</h1>
          <p className="lesson-explanation">{exercise.explanation}</p>
          <div className="analogy-card">
            <span className="mentor-avatar"><b>π</b><i /></span>
            <div><small>PIE-314 · SHIPBOARD VERSION</small><p>{exercise.analogy}</p></div>
          </div>
          <div className="micro-rule"><BookOpen size={18} /><div><b>New words are never a test</b><p>Reread the explanation or open the codebook whenever you need it.</p></div></div>
        </section>

        <section className="exercise-panel">
          <div className="exercise-panel__head">
            <div><small>{taskLabel}</small><h2>{exercise.prompt}</h2></div>
            <span>{reviewing ? <><RotateCcw size={14} /> REVIEW</> : <><Trophy size={14} /> {exercise.xp} XP</>}</span>
          </div>

          {choiceExercise ? (
            <div>
              {exercise.type === 'prediction' && exercise.displayCode && (
                <div className="prediction-code" aria-label="Code to predict">
                  <div><Code2 size={15} /> READ THIS CODE</div>
                  <pre><code>{exercise.displayCode}</code></pre>
                </div>
              )}
              <div className="guided-check-note">
                <BookOpen size={17} />
                <p><b>This is not a prior-knowledge test.</b> {exercise.type === 'prediction' ? 'Read the code from top to bottom and use the explanation on the left.' : 'The answer was just explained on the left.'} Reread it as often as you need, then choose the sentence that matches.</p>
              </div>
              <fieldset className="choice-list">
                <legend className="sr-only">{exercise.prompt}</legend>
                {displayChoices.map((choice, index) => (
                  <label
                    className={answer === choice.id ? 'is-selected' : ''}
                    key={choice.id}
                  >
                    <input
                      checked={answer === choice.id}
                      className="sr-only"
                      disabled={feedback?.correct}
                      name={`answer-${exercise.id}`}
                      onChange={() => setAnswer(choice.id)}
                      type="radio"
                      value={choice.id}
                    />
                    <span aria-hidden="true">{String.fromCharCode(65 + index)}</span>
                    <div><b>{choice.label}</b><small>{choice.detail}</small></div>
                    <i aria-hidden="true">{answer === choice.id && <Check size={16} />}</i>
                  </label>
                ))}
              </fieldset>
              {feedback?.correct && exercise.output && <div className="exercise-result"><TerminalSquare size={15} /><span><b>RESULT</b><code>{exercise.output}</code></span></div>}
            </div>
          ) : exercise.type === 'ordering' ? (
            <div>
              <div className="guided-check-note">
                <BookOpen size={17} />
                <p><b>The computer reads from top to bottom.</b> Use the arrow buttons to place each piece where the computer should meet it. You can change the order as often as you need.</p>
              </div>
              <ol className="ordering-list" aria-label="Code pieces to order">
                {orderedIds.map((id, index) => {
                  const item = exercise.orderItems?.find((candidate) => candidate.id === id)
                  if (!item) return null
                  return (
                    <li key={item.id}>
                      <span>{index + 1}</span>
                      <code>{item.code}</code>
                      <div>
                        <button onClick={() => moveOrderItem(index, -1)} disabled={index === 0} aria-label={`Move ${item.code} up`}><ArrowUp size={16} /></button>
                        <button onClick={() => moveOrderItem(index, 1)} disabled={index === orderedIds.length - 1} aria-label={`Move ${item.code} down`}><ArrowDown size={16} /></button>
                      </div>
                    </li>
                  )
                })}
              </ol>
              <p aria-live="polite" className="sr-only" role="status">{orderingAnnouncement}</p>
              {feedback?.correct && exercise.output && <div className="exercise-result"><TerminalSquare size={15} /><span><b>RESULT</b><code>{exercise.output}</code></span></div>}
            </div>
          ) : editableExercise ? (
            <div>
              <section className="code-onramp" aria-label="Code walkthrough">
                <div className="code-focus">
                  <Compass size={19} />
                  <div>
                    <small>YOUR ONE JOB ON THIS SCREEN</small>
                    <b>{exercise.focus ?? `Replace the ${blankCount === 1 ? 'one' : blankCount} _____ ${blankCount === 1 ? 'blank' : 'blanks'}.`}</b>
                    <p>Everything else is supplied scaffolding. Read it if you are curious, but you are not expected to memorize or rewrite it yet.</p>
                  </div>
                </div>
                {exercise.codeGuide && exercise.codeGuide.length > 0 && (
                  <div className="code-guide">
                    <div className="code-guide__head">
                      <small>DEMYSTIFY THE CODE</small>
                      <h3>Read each piece like a sentence</h3>
                    </div>
                    <div className="code-guide__items">
                      {exercise.codeGuide.map((item) => (
                        <article key={`${exercise.id}-${item.code}`}>
                          <code>{item.code}</code>
                          <p>{item.plain}</p>
                        </article>
                      ))}
                    </div>
                  </div>
                )}
              </section>
              <div className="code-workspace">
                <div className="editor-bar"><span><Code2 size={15} /> {mission.language === 'python' ? 'mission.py' : mission.language === 'cpp' ? 'mission.cpp' : mission.language === 'java' ? 'Mission.java' : 'Mission.cs'}</span><small>LIVE ISOLATED RUNNER</small></div>
                <div className="editor-body">
                  <div className="line-numbers" aria-hidden="true">{answer.split('\n').map((_, index) => <span key={index}>{index + 1}</span>)}</div>
                  <textarea
                    aria-label="Code editor"
                    aria-keyshortcuts="Control+Enter Meta+Enter"
                    value={answer}
                    onChange={(event) => setAnswer(event.target.value)}
                    onKeyDown={handleEditorKeyDown}
                    spellCheck={false}
                    disabled={feedback?.correct || runnerBusy}
                  />
                </div>
                <div className="console-pane" aria-live="polite">
                  <div><TerminalSquare size={14} /> REAL CONSOLE OUTPUT</div>
                  <pre>{runnerBusy
                    ? runnerStatus === 'running' ? 'Your program is running inside a fresh isolated sandbox...' : 'Preparing a fresh isolated sandbox...'
                    : runnerResult
                      ? runnerResult.stdout || runnerResult.stderr || '(The program finished without printing any text.)'
                      : 'Nothing has run yet. Complete your one small change, then select Run check.'}</pre>
                </div>
                {runnerResult && (
                  <section className="runner-report" aria-label="Real runner report">
                    <div className="runner-report__summary">
                      <span className={runnerResult.outcome === 'completed' ? 'is-good' : 'is-alert'}>
                        {runnerResult.diagnostic.title}
                      </span>
                      <small>{runnerResult.durationMs} ms · fresh sandbox destroyed after run</small>
                    </div>
                    <div className="runner-tests">
                      {runnerResult.tests.map((test) => (
                        <article key={`${runnerResult.runId}-${test.name}`}>
                          {test.passed ? <CheckCircle2 size={15} /> : <MessageCircleQuestion size={15} />}
                          <span><b>{test.name}</b><small>{test.message}</small></span>
                          <i>{test.visibility === 'hidden' ? 'HIDDEN CHECK' : 'VISIBLE CHECK'}</i>
                        </article>
                      ))}
                    </div>
                    {runnerResult.stderr && (
                      <details>
                        <summary>Show the language's exact message</summary>
                        <pre>{runnerResult.stderr}</pre>
                      </details>
                    )}
                  </section>
                )}
                <div className="editor-shortcuts" aria-label="Code editor keyboard controls">
                  <span>KEYBOARD</span>
                  <p><kbd>Ctrl</kbd> or <kbd>⌘</kbd> + <kbd>Enter</kbd> runs the check. <kbd>Tab</kbd> moves out of the editor normally.</p>
                </div>
              </div>
            </div>
          ) : null}

          <button className="hint-toggle" aria-controls="lesson-hint" aria-expanded={hintOpen} onClick={() => setHintOpen((open) => !open)}><CircleHelp size={17} /> {hintOpen ? 'Hide hint' : 'I need a hint'}</button>
          {hintOpen && <div className="hint-box" id="lesson-hint"><Sparkles size={16} /><span><b>Small nudge</b>{exercise.hint}</span></div>}

          {feedback && (
            <div aria-live="polite" className={`feedback-box ${runnerFailure ? 'is-neutral' : feedback.correct ? 'is-correct' : 'is-wrong'}`} role="status">
              {feedback.correct ? <CheckCircle2 /> : runnerFailure ? <CircleHelp /> : <MessageCircleQuestion />}
              <div><b>{feedback.correct ? 'System online' : runnerFailure ? 'Runner unavailable' : 'Let’s inspect that'}</b><p>{feedback.message}</p></div>
            </div>
          )}

          <div className="exercise-actions">
            {!reviewing && activeStep > 0 && !feedback?.correct && <button className="secondary-action" onClick={() => { const previous = sessionExercises[activeStep - 1]; setStep(activeStep - 1); setFeedback(null); setRunnerFailure(false); if (previous) onExerciseChange?.(previous.id) }}><ArrowLeft size={17} /> Back</button>}
            <button className="primary-action" disabled={runnerBusy} onClick={feedback?.correct ? continueLesson : () => { void checkAnswer() }}>
              {feedback?.correct
                ? reviewing
                  ? reviewIndex === reviewQueue.length - 1 ? 'Complete memory repair' : 'Next review'
                  : activeStep === sessionExercises.length - 1
                    ? mistakes.length > 0
                      ? 'Repair missed concepts'
                      : practiceMode
                        ? 'Finish practice'
                        : hasUnfinishedLessons
                          ? 'Complete remaining lessons'
                          : 'Finish mission'
                    : 'Continue'
                : runnerBusy
                  ? runnerStatus === 'running' ? 'Running your code...' : 'Launching sandbox...'
                  : checkActionLabel}
              {feedback?.correct && <ArrowRight size={18} />}
            </button>
          </div>
          <p className="simulator-note">Editable code runs on the server in a new network-blocked sandbox. The sandbox is destroyed after every check. Choice and ordering questions stay in your browser because they do not execute code.</p>
        </section>
      </main>
    </div>
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
  const [progress, setProgress] = useState<LearnerProgress>(() => {
    const loaded = loadProgress()
    const initialRoute = parseAppRoute(window.location.pathname, window.location.search)
    if (initialRoute.language && ['academy', 'practice', 'codebook', 'lesson', 'project'].includes(initialRoute.page)) {
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
  const progressRef = useRef(progress)
  const syncEnabledRef = useRef(false)
  const syncRevisionRef = useRef(0)
  const syncedSnapshotRef = useRef<string | null>(null)

  const view: ViewId = route.page === 'home'
    ? 'home'
    : route.page === 'courses' || route.page === 'course' || route.page === 'academy' || route.page === 'project'
      ? 'courses'
      : route.page === 'practice' || (route.page === 'lesson' && route.practice)
    ? 'practice'
    : route.page === 'codebook'
      ? 'spellbook'
      : route.page === 'profile'
        ? 'profile'
        : route.page === 'settings'
          ? 'settings'
          : 'path'

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

    const track = route.language ? trackById(route.language) : null
    const mission = track?.missions.find((item) => item.id === route.missionId)
    const exercise = mission?.exercises.find((item) => item.id === route.exerciseId)
    const projectCheckpoint = route.page === 'project'
      ? pythonInteractiveProject.checkpoints.find((item) => item.id === route.checkpointId)
      : undefined
    const pageTitle = route.page === 'home'
      ? 'Learning Home'
      : route.page === 'start'
        ? 'Beginner Intake'
        : route.page === 'courses'
          ? 'Courses'
          : route.page === 'course' || route.page === 'academy'
            ? track ? `${track.shortName} Foundations` : 'Course'
        : route.page === 'practice'
          ? `${track?.shortName} Practice Bay`
          : route.page === 'codebook'
            ? `${track?.shortName} Codebook`
            : route.page === 'profile'
              ? 'Learner Record'
              : route.page === 'settings'
                ? 'Settings'
                : route.page === 'project'
                  ? projectCheckpoint?.title ?? pythonInteractiveProject.title
                : route.page === 'lesson'
                  ? exercise?.title ?? mission?.title
                  : 'Page not found'
    document.title = `${pageTitle ?? 'Academy'} | SeePoundCoffeePie`
  }, [route.checkpointId, route.exerciseId, route.language, route.missionId, route.page])

  useEffect(() => {
    const handleNavigation = () => {
      const nextLocation = readBrowserLocation()
      const nextRoute = parseAppRoute(nextLocation.pathname, nextLocation.search)
      setLocation(nextLocation)
      if (nextRoute.language && ['academy', 'practice', 'codebook', 'lesson', 'project'].includes(nextRoute.page)) {
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
    if (route.language && ['academy', 'practice', 'codebook', 'lesson', 'project'].includes(route.page)) {
      return { ...dailyProgress, activeLanguage: route.language }
    }
    return dailyProgress
  }, [progress, route.language, route.page])

  const updateProgress = (nextProgress: LearnerProgress) => setProgress(nextProgress)

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
      ? 'Reset all SeePoundCoffeePie progress? The empty record will replace the synchronized account copy and return this browser to cadet intake.'
      : 'Reset all local SeePoundCoffeePie progress and return to cadet intake?'
    if (window.confirm(message)) {
      setProgress(initialProgress())
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

  if (route.page === 'lesson') {
    const track = trackById(route.language ?? progress.activeLanguage)
    const missionIndex = track.missions.findIndex((mission) => mission.id === route.missionId)
    const mission = track.missions[missionIndex]
    const available = mission && mission.language === track.id
      && missionAvailability(track, missionIndex, progress.completedMissions) === 'available'

    const routeExercise = route.exerciseId
      ? mission?.exercises.find((exercise) => exercise.id === route.exerciseId)
      : undefined
    if (!mission || mission.language !== track.id || (route.exerciseId && !routeExercise)) {
      return <NotFoundPage progress={normalizedProgress} />
    }

    const practiceConceptIds = route.conceptIds.filter((conceptId) => (
      mission.exercises.some((exercise) => exercise.conceptId === conceptId)
    ))

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
                <h1>{mission.title} is still ahead</h1>
                <p>Complete {prerequisite?.title ?? 'the earlier course work'} first. The course keeps the steps in order so each new idea has a foundation.</p>
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
      </>
    )
  }

  if (route.page === 'project') {
    const checkpointExists = !route.checkpointId || pythonInteractiveProject.checkpoints.some((checkpoint) => (
      checkpoint.id === route.checkpointId
    ))
    if (
      route.language !== pythonInteractiveProject.language
      || route.projectId !== pythonInteractiveProject.id
      || !checkpointExists
    ) {
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
            navigateTo(language === 'python'
              ? projectPath('python', pythonInteractiveProject.id)
              : coursePath(language))
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
              onNavigate={navigateTo}
              onProgress={updateProgress}
              progress={normalizedProgress}
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
            navigateTo(coursePath(language))
          } else if (route.page === 'practice' || route.page === 'codebook') {
            navigateTo(pagePath(route.page, language))
          }
        }}
        onSignIn={signIn}
      >
        {route.page === 'home' && <LearnerHome progress={normalizedProgress} />}
        {route.page === 'courses' && <CourseCatalog progress={normalizedProgress} />}
        {(route.page === 'course' || route.page === 'academy') && (
          <MissionPath
            progress={route.language ? { ...normalizedProgress, activeLanguage: route.language } : normalizedProgress}
          />
        )}
        {route.page === 'practice' && <PracticeBay progress={normalizedProgress} onStart={(mission, practiceConceptIds) => navigateTo(practiceMissionPath(mission.language, mission.id, practiceConceptIds))} />}
        {route.page === 'codebook' && <Codebook progress={normalizedProgress} />}
        {route.page === 'profile' && (
          <CadetRecord
            onOpenTrack={(language) => {
              setProgress((current) => ({ ...current, activeLanguage: language }))
              navigateTo(coursePath(language))
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
