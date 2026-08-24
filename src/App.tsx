import { useEffect, useMemo, useRef, useState, type ChangeEvent, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  BookOpen,
  Box,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Clock3,
  Code2,
  Coffee,
  Compass,
  Crown,
  Download,
  Flame,
  Gem,
  GitFork as Github,
  Keyboard,
  LibraryBig,
  LockKeyhole,
  LogOut,
  Menu,
  MessageCircleQuestion,
  Orbit,
  Play,
  Radio,
  RotateCcw,
  Satellite,
  Search,
  Settings,
  Shield,
  Sparkles,
  TerminalSquare,
  Trophy,
  Upload,
  UserRound,
  X,
  Zap,
} from 'lucide-react'
import { codebookEntries, codebookExampleState, codebookMatches } from './data/codebook'
import { trackById, tracks } from './data/curriculum'
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
import type {
  AuthUser,
  EvaluationResult,
  LanguageId,
  LearnerProgress,
  Mission,
} from './types'

type ViewId = 'path' | 'practice' | 'spellbook' | 'profile'

interface ActiveLesson {
  mission: Mission
  practiceConceptIds?: string[]
}

const missionIcons = {
  signal: Radio,
  terminal: TerminalSquare,
  satellite: Satellite,
  shield: Shield,
  package: Box,
  crown: Crown,
}

const languageSnippets: Record<LanguageId, string> = {
  python: 'print("Hello, cosmos!")',
  cpp: 'std::cout << "Hello, cosmos!";',
  csharp: 'Console.WriteLine("Hello, cosmos!");',
  java: 'System.out.println("Hello, cosmos!");',
}

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`brand ${compact ? 'brand--compact' : ''}`} aria-label="SeePoundCoffeePie home">
      <span className="brand__mark" aria-hidden="true">
        <span>C</span><b>#</b><em><Coffee size={10} /></em><i>π</i>
      </span>
      {!compact && (
        <span className="brand__name">
          <b>SeePoundCoffeePie</b>
          <small>CODE ACADEMY</small>
        </span>
      )}
    </div>
  )
}

interface OnboardingProps {
  authReady: boolean
  authUser: AuthUser | null
  onComplete: (progress: LearnerProgress) => void
  onSignIn: () => void
}

function Onboarding({ authReady, authUser, onComplete, onSignIn }: OnboardingProps) {
  const [language, setLanguage] = useState<LanguageId>('python')
  const [callsign, setCallsign] = useState('')
  const [goal, setGoal] = useState(10)
  const selectedTrack = trackById(language)

  const finish = () => {
    onComplete({
      ...initialProgress(language),
      callsign: callsign.trim() || authUser?.name || authUser?.login || 'Cadet',
      dailyGoal: goal,
      onboardingComplete: true,
    })
  }

  return (
    <main className="onboarding">
      <section className="onboarding__story">
        <div className="starfield" aria-hidden="true" />
        <BrandMark />
        <div className="hero-copy">
          <p className="kicker"><Sparkles size={15} /> No experience required</p>
          <h1>Learn code.<br /><span>Run the ship.</span></h1>
          <p>
            Your first programming lesson starts with one clear instruction. No jargon dumps.
            No setup maze. Just small missions, patient explanations, and lots of practice.
          </p>
          <div className="hero-console" aria-label="Example code">
            <div className="console-dots"><i /><i /><i /></div>
            <code>{languageSnippets[language]}</code>
            <span className="console-result">› Hello, cosmos!</span>
          </div>
        </div>
        <div className="orbit-illustration" aria-hidden="true">
          <div className="orbit-ring orbit-ring--one" />
          <div className="orbit-ring orbit-ring--two" />
          <div className="orbit-planet" />
          <div className="orbit-ship"><span /><i /></div>
        </div>
        <p className="story-note">An original space-fantasy learning adventure</p>
      </section>

      <section className="onboarding__form">
        <div className="setup-card">
          <div className="step-count">CADET INTAKE · 3 QUICK CHOICES</div>
          <h2>Choose your first station</h2>
          <p className="setup-intro">You can explore every path later. Python is our gentlest starting point.</p>

          <div className={`github-intake ${authUser ? 'is-connected' : ''}`}>
            <span><Github size={21} /></span>
            <div>
              <b>{authUser ? `Signed in as ${authUser.login}` : 'Optional GitHub sign-in'}</b>
              <p>{authUser ? 'GitHub verified your cadet identity.' : 'Verify your identity now. You can also begin without an account.'}</p>
            </div>
            {!authUser && (
              <button type="button" onClick={onSignIn} disabled={!authReady}>
                <Github size={16} /> {authReady ? 'Sign in' : 'Checking'}
              </button>
            )}
          </div>

          <div className="track-picker" role="radiogroup" aria-label="Programming language">
            {tracks.map((track) => (
              <button
                className={`track-option ${language === track.id ? 'is-selected' : ''}`}
                key={track.id}
                onClick={() => setLanguage(track.id)}
                role="radio"
                aria-checked={language === track.id}
                style={{ '--track-accent': track.accent } as React.CSSProperties}
              >
                <span className="track-option__radio">{language === track.id && <Check size={14} />}</span>
                <span className="track-option__text">
                  <b>{track.shortName}</b>
                  <small>{track.role}</small>
                </span>
                {track.id === 'python' && <span className="recommended">BEST FIRST STEP</span>}
              </button>
            ))}
          </div>

          <div className="selection-description">
            <Code2 size={19} />
            <span><b>{selectedTrack.name}</b>{selectedTrack.description}</span>
          </div>

          <label className="field-label" htmlFor="callsign">What should the crew call you?</label>
          <input
            id="callsign"
            className="text-input"
            value={callsign}
            onChange={(event) => setCallsign(event.target.value)}
            placeholder={authUser ? authUser.name || authUser.login : 'Cadet name or callsign'}
            maxLength={24}
          />

          <fieldset className="goal-picker">
            <legend>Daily training goal</legend>
            {[5, 10, 15].map((minutes) => (
              <button
                key={minutes}
                className={goal === minutes ? 'is-selected' : ''}
                onClick={() => setGoal(minutes)}
                type="button"
              >
                <Clock3 size={16} />
                <b>{minutes} min</b>
                <span>{minutes === 5 ? 'Gentle' : minutes === 10 ? 'Steady' : 'Focused'}</span>
              </button>
            ))}
          </fieldset>

          <button className="primary-action primary-action--wide" onClick={finish}>
            Begin your commission <ArrowRight size={18} />
          </button>
          <p className="fine-print"><Shield size={13} /> Course progress stays in this browser. GitHub only verifies identity for now.</p>
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
  setView: (view: ViewId) => void
  onLanguageChange: (language: LanguageId) => void
  onSignIn: () => void
  children: React.ReactNode
}

function AppShell({ authReady, authUser, progress, view, setView, onLanguageChange, onSignIn, children }: ShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const track = trackById(progress.activeLanguage)
  const navItems: Array<{ id: ViewId; label: string; icon: typeof Compass }> = [
    { id: 'path', label: 'Mission path', icon: Compass },
    { id: 'practice', label: 'Practice bay', icon: Orbit },
    { id: 'spellbook', label: 'Codebook', icon: LibraryBig },
    { id: 'profile', label: 'Cadet record', icon: UserRound },
  ]

  const selectView = (nextView: ViewId) => {
    setView(nextView)
    setMobileNavOpen(false)
  }

  return (
    <div className="app-shell" style={{ '--accent': track.accent, '--accent-soft': track.accentSoft } as React.CSSProperties}>
      <aside className={`sidebar ${mobileNavOpen ? 'is-open' : ''}`}>
        <div className="sidebar__top">
          <BrandMark />
          <button className="mobile-close" onClick={() => setMobileNavOpen(false)} aria-label="Close navigation"><X /></button>
        </div>
        <nav>
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <button key={item.id} className={view === item.id ? 'is-active' : ''} onClick={() => selectView(item.id)}>
                <Icon size={20} /><span>{item.label}</span>
              </button>
            )
          })}
        </nav>
        <div className="mentor-mini">
          <span className="mentor-avatar"><b>π</b><i /></span>
          <div><small>YOUR GUIDE</small><b>PIE-314</b><p>Confused is a normal stop on the route.</p></div>
        </div>
        <button className="sidebar-settings" onClick={() => selectView('profile')}><Settings size={18} /> Settings</button>
      </aside>

      <div className="app-frame">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setMobileNavOpen(true)} aria-label="Open navigation"><Menu /></button>
          <div className="track-switcher">
            <span style={{ background: track.accent }}><Code2 size={17} /></span>
            <label>
              <small>ACTIVE STATION</small>
              <select value={progress.activeLanguage} onChange={(event) => onLanguageChange(event.target.value as LanguageId)}>
                {tracks.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </label>
            <ChevronDown size={16} />
          </div>
          <div className="top-stats">
            <span title="Study streak"><Flame size={19} /><b>{progress.streak}</b><small>day streak</small></span>
            <span title="Experience points"><Zap size={19} /><b>{progress.xp}</b><small>XP</small></span>
            <span title="Star shards"><Gem size={19} /><b>{progress.starShards}</b><small>shards</small></span>
          </div>
          {authUser ? (
            <button className="identity-chip" onClick={() => selectView('profile')} title={`Signed in as ${authUser.login}`}>
              <Github size={15} /><span>{authUser.login}</span>
            </button>
          ) : (
            <button className="github-topbar" onClick={onSignIn} disabled={!authReady}>
              <Github size={16} /><span>{authReady ? 'Sign in' : 'Checking'}</span>
            </button>
          )}
          <button className="profile-chip" onClick={() => selectView('profile')} aria-label="Open cadet record">{progress.callsign.slice(0, 1).toUpperCase()}</button>
        </header>
        {children}
      </div>
      {mobileNavOpen && <button className="nav-scrim" onClick={() => setMobileNavOpen(false)} aria-label="Close navigation" />}
    </div>
  )
}

function ProgressRing({ value, label }: { value: number; label: string }) {
  const safe = Math.min(100, Math.max(0, value))
  return (
    <div className="progress-ring" style={{ '--ring-value': `${safe * 3.6}deg` } as React.CSSProperties}>
      <div><b>{safe}%</b><span>{label}</span></div>
    </div>
  )
}

function MissionPath({ progress, onStart }: { progress: LearnerProgress; onStart: (mission: Mission) => void }) {
  const track = trackById(progress.activeLanguage)
  const completedCount = track.missions.filter((item) => progress.completedMissions.includes(item.id)).length
  const trackPercent = Math.round((completedCount / track.missions.length) * 100)

  return (
    <div className="dashboard-grid">
      <main className="path-column">
        <div className="page-heading">
          <div>
            <p className="kicker"><Radio size={14} /> LIVE TRAINING ROUTE</p>
            <h1>{track.name}</h1>
            <p>{track.description}</p>
          </div>
          <ProgressRing value={trackPercent} label="charted" />
        </div>

        <section className="sector-card">
          <div className="sector-card__heading">
            <div><small>SECTOR 01</small><h2>Launch fundamentals</h2><p>Learn the pieces every program is built from.</p></div>
            <span>6 MISSIONS</span>
          </div>
          <div className="mission-path">
            <div className="path-line" aria-hidden="true" />
            {track.missions.map((item, index) => {
              const Icon = missionIcons[item.icon]
              const complete = progress.completedMissions.includes(item.id)
              const availability = missionAvailability(track, index, progress.completedMissions)
              const available = availability === 'available'
              const prerequisite = track.missions[index - 1]
              const lockedMessage = availability === 'coming-soon'
                ? 'Coming soon'
                : `Complete ${prerequisite?.title ?? 'earlier training'} to unlock`
              return (
                <article className={`mission-row ${available ? 'is-available' : 'is-locked'} ${complete ? 'is-complete' : ''}`} key={item.id}>
                  <div className="mission-node">
                    {complete ? <Check size={24} /> : available ? <Icon size={23} /> : <LockKeyhole size={18} />}
                  </div>
                  <div className="mission-card">
                    <div className="mission-card__content">
                      <div className="mission-number">MISSION {String(index + 1).padStart(2, '0')}</div>
                      <h3>{item.title}</h3>
                      <b className="mission-subtitle">{item.subtitle}</b>
                      <p>{item.description}</p>
                      <div className="mission-meta">
                        <span><Clock3 size={14} /> {item.duration}</span>
                        {available && <span><Trophy size={14} /> {item.exercises.reduce((sum, exercise) => sum + exercise.xp, 0)} XP</span>}
                        {!available && <span>{lockedMessage}</span>}
                      </div>
                    </div>
                    <button
                      className={available ? 'mission-play' : 'mission-lock'}
                      onClick={() => available && onStart(item)}
                      disabled={!available}
                      aria-label={available ? `${complete ? 'Replay' : 'Start'} ${item.title}` : `${item.title} ${availability === 'coming-soon' ? 'coming soon' : 'locked'}`}
                    >
                      {available ? (complete ? <RotateCcw /> : <Play fill="currentColor" />) : <LockKeyhole />}
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      </main>

      <aside className="dashboard-rail">
        <section className="brief-card">
          <div className="brief-card__top"><span className="mentor-avatar mentor-avatar--large"><b>π</b><i /></span><div><small>CAPTAIN’S BRIEF</small><h3>Welcome, {progress.callsign}</h3></div></div>
          <p>One mission is enough for today. I’ll explain every new symbol before you need it.</p>
          <div className="guide-quote"><MessageCircleQuestion size={17} /> “Questions are diagnostics, not failures.”</div>
        </section>

        <section className="daily-card">
          <div className="rail-title"><span><Zap size={17} /> DAILY SYSTEMS</span><b>{Math.min(progress.dailyXp, progress.dailyGoal)} / {progress.dailyGoal} XP</b></div>
          <div className="daily-progress"><i style={{ width: `${Math.min(100, (progress.dailyXp / progress.dailyGoal) * 100)}%` }} /></div>
          <p>{progress.dailyXp >= progress.dailyGoal ? 'Daily goal complete. Nicely flown.' : `${progress.dailyGoal - progress.dailyXp} XP until today’s goal is complete.`}</p>
        </section>

        <section className="review-card">
          <div className="rail-title"><span><Orbit size={17} /> MEMORY ORBIT</span><span className="status-dot">READY</span></div>
          <div className="review-visual"><Orbit size={44} /><span>{Object.values(progress.conceptProgress).filter((concept) => isDue(concept)).length}</span></div>
          <h3>Reviews waiting</h3>
          <p>Concepts return just before they drift out of memory.</p>
        </section>

        <section className="principle-card">
          <BookOpen size={19} />
          <div><b>Today’s rule</b><p>Read a little. Type a little. Explain it back. Repeat later.</p></div>
        </section>
      </aside>
    </div>
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
  authBusy: boolean
  authUser: AuthUser | null
  onLogout: () => void
  onDownloadBackup: () => string
  onOpenTrack: (language: LanguageId) => void
  onReset: () => void
  onRestoreBackup: (text: string) => string
  onSignIn: () => void
  progress: LearnerProgress
}

function CadetRecord({ authBusy, authUser, onDownloadBackup, onLogout, onOpenTrack, onReset, onRestoreBackup, onSignIn, progress }: CadetRecordProps) {
  const concepts = Object.values(progress.conceptProgress)
  const answers = concepts.reduce((sum, item) => sum + item.correct + item.incorrect, 0)
  const accuracy = answers ? Math.round((concepts.reduce((sum, item) => sum + item.correct, 0) / answers) * 100) : 0
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

  return (
    <main className="content-page">
      <div className="page-heading page-heading--simple"><div><p className="kicker"><UserRound size={14} /> CADET RECORD</p><h1>{progress.callsign}</h1><p>Commission progress stored on this device.</p></div></div>
      <div className="record-grid">
        <article><Zap /><span><b>{progress.xp}</b><small>Total XP</small></span></article>
        <article><Flame /><span><b>{progress.streak}</b><small>Day streak</small></span></article>
        <article><Trophy /><span><b>{progress.completedMissions.length}</b><small>Missions</small></span></article>
        <article><CheckCircle2 /><span><b>{accuracy}%</b><small>Accuracy</small></span></article>
      </div>
      <section className="station-records" aria-labelledby="station-records-title">
        <div className="station-records__heading">
          <div><small>FOUR LEARNING ROUTES</small><h2 id="station-records-title">Station records</h2></div>
          <p>Each language keeps its own ordered mission path. Open any station without erasing progress in the others.</p>
        </div>
        <div className="station-records__grid">
          {tracks.map((track) => {
            const completed = track.missions.filter((mission) => progress.completedMissions.includes(mission.id)).length
            const percent = Math.round((completed / track.missions.length) * 100)
            const active = progress.activeLanguage === track.id
            return (
              <article key={track.id} style={{ '--station-accent': track.accent } as React.CSSProperties}>
                <div className="station-records__name"><Code2 size={18} /><span><b>{track.shortName}</b><small>{track.role}</small></span></div>
                <div className="station-records__count"><b>{completed} / {track.missions.length}</b><small>missions complete</small></div>
                <div className="station-records__bar" aria-label={`${track.shortName} ${percent}% complete`}><span style={{ width: `${percent}%` }} /></div>
                <button className="secondary-action" onClick={() => onOpenTrack(track.id)}>
                  {active ? 'View active mission path' : `Open ${track.shortName} mission path`} <ArrowRight size={15} />
                </button>
              </article>
            )
          })}
        </div>
      </section>
      <section className="account-panel">
        <span className="account-panel__icon"><Github size={24} /></span>
        <div>
          <small>GITHUB IDENTITY</small>
          <h2>{authUser ? `Signed in as ${authUser.login}` : 'No account connected'}</h2>
          <p>
            {authUser
              ? 'Your identity is verified. Lessons, XP, and review history still stay only in this browser.'
              : 'Sign in to verify your identity. This phase does not upload or synchronize course progress.'}
          </p>
        </div>
        {authUser ? (
          <button className="secondary-action" onClick={onLogout} disabled={authBusy}>
            <LogOut size={16} /> {authBusy ? 'Signing out' : 'Sign out'}
          </button>
        ) : (
          <button className="secondary-action" onClick={onSignIn} disabled={authBusy}>
            <Github size={16} /> Sign in with GitHub
          </button>
        )}
      </section>
      <section className="backup-panel">
        <span className="account-panel__icon"><Download size={24} /></span>
        <div>
          <small>LOCAL PROGRESS BACKUP</small>
          <h2>Keep a copy before changing browsers</h2>
          <p>Download your callsign, XP, missions, streak, and review schedule as a JSON file. Restoring validates every value before replacing anything on this device. No course data is uploaded.</p>
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
      <section className="settings-panel">
        <div><h2>Prototype controls</h2><p>Resetting removes the learner name, XP, mission completion, and review history from this browser.</p></div>
        <button className="danger-button" onClick={onReset}><RotateCcw size={16} /> Reset local progress</button>
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

interface LessonPlayerProps {
  mission: Mission
  practiceConceptIds?: string[]
  progress: LearnerProgress
  onProgress: (progress: LearnerProgress) => void
  onExit: () => void
}

function LessonPlayer({ mission, practiceConceptIds, progress, onProgress, onExit }: LessonPlayerProps) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [feedback, setFeedback] = useState<EvaluationResult | null>(null)
  const [credited, setCredited] = useState<string[]>([])
  const [hintOpen, setHintOpen] = useState(false)
  const [finished, setFinished] = useState(false)
  const [mistakes, setMistakes] = useState<string[]>([])
  const [reviewQueue, setReviewQueue] = useState<string[]>([])
  const [reviewIndex, setReviewIndex] = useState(0)
  const [missionAlreadyComplete] = useState(() => progress.completedMissions.includes(mission.id))
  const practiceMode = practiceConceptIds !== undefined
  const sessionExercises = practiceMode
    ? buildPracticeExercises(mission, practiceConceptIds)
    : mission.exercises
  const reviewing = reviewQueue.length > 0
  const exercise = reviewing
    ? sessionExercises.find((item) => item.id === reviewQueue[reviewIndex])
    : sessionExercises[step]
  const totalXp = sessionExercises.reduce((sum, item) => sum + item.xp, 0)
  const earnedXp = sessionExercises.filter((item) => credited.includes(item.id)).reduce((sum, item) => sum + item.xp, 0)
  const progressPercent = reviewing
    ? ((reviewIndex + 1) / reviewQueue.length) * 100
    : ((step + 1) / sessionExercises.length) * 100

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

  const setAnswer = (value: string) => {
    setAnswers((current) => ({ ...current, [exercise.id]: value }))
    if (feedback && !feedback.correct) setFeedback(null)
  }

  const moveOrderItem = (index: number, direction: -1 | 1) => {
    const destination = index + direction
    if (destination < 0 || destination >= orderedIds.length) return
    const reordered = [...orderedIds]
    ;[reordered[index], reordered[destination]] = [reordered[destination], reordered[index]]
    setAnswer(reordered.join('|'))
  }

  const checkAnswer = () => {
    const result = evaluateExercise(exercise, answer)
    setFeedback(result)
    if (!result.correct) {
      if (!reviewing && !mistakes.includes(exercise.id)) {
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
      setHintOpen(false)
      return
    }

    if (step === sessionExercises.length - 1) {
      const queue = buildReviewQueue(mistakes, sessionExercises.map((item) => item.id))
      if (queue.length > 0) {
        setAnswers((current) => resetReviewAnswers(current, queue))
        setReviewQueue(queue)
        setReviewIndex(0)
        setFeedback(null)
        setHintOpen(false)
        return
      }
      finishSession()
      return
    }
    setStep((current) => current + 1)
    setFeedback(null)
    setHintOpen(false)
  }

  const handleEditorKeyDown = (event: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Enter' || (!event.ctrlKey && !event.metaKey)) return
    event.preventDefault()
    if (feedback?.correct) continueLesson()
    else checkAnswer()
  }

  if (finished) {
    const reviewedConcepts = [...new Set(sessionExercises.map((item) => item.conceptId.split('-').slice(1).join(' ')))]
    const awardedShards = practiceMode || missionAlreadyComplete ? 0 : 25
    return (
      <div className="lesson-overlay">
        <main className="mission-complete">
          <div className="completion-burst" aria-hidden="true"><Sparkles /><span><Check /></span></div>
          <p className="kicker">{practiceMode ? 'PRACTICE COMPLETE' : 'MISSION COMPLETE'}</p>
          <h1>{mission.title}</h1>
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
        <div className="lesson-progress"><i style={{ width: `${progressPercent}%` }} /></div>
        <div className="lesson-step"><b>{reviewing ? reviewIndex + 1 : step + 1}</b><span>/ {reviewing ? reviewQueue.length : sessionExercises.length}</span></div>
        <div className="lesson-xp"><Zap size={17} /> {earnedXp} XP</div>
      </header>

      <main className="lesson-layout">
        {practiceMode && !reviewing && (
          <section className="memory-repair" aria-label="Focused practice round">
            <Orbit size={22} />
            <div>
              <small>FOCUSED REVIEW · {step + 1} OF {sessionExercises.length}</small>
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
          <h1>{exercise.title}</h1>
          <p className="lesson-explanation">{exercise.explanation}</p>
          <div className="analogy-card">
            <span className="mentor-avatar"><b>π</b><i /></span>
            <div><small>PIE-314 · SHIPBOARD VERSION</small><p>{exercise.analogy}</p></div>
          </div>
          <div className="micro-rule"><BookOpen size={18} /><div><b>New words are never a test</b><p>Hover, reread, and use the codebook whenever you need it.</p></div></div>
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
              <div className="choice-list">
                {exercise.choices?.map((choice, index) => (
                  <button
                    className={answer === choice.id ? 'is-selected' : ''}
                    key={choice.id}
                    onClick={() => setAnswer(choice.id)}
                    disabled={feedback?.correct}
                  >
                    <span>{String.fromCharCode(65 + index)}</span>
                    <div><b>{choice.label}</b><small>{choice.detail}</small></div>
                    <i>{answer === choice.id && <Check size={16} />}</i>
                  </button>
                ))}
              </div>
              {feedback?.correct && exercise.output && <div className="exercise-result"><TerminalSquare size={15} /><span><b>RESULT</b><code>{exercise.output}</code></span></div>}
            </div>
          ) : exercise.type === 'ordering' ? (
            <div>
              <div className="guided-check-note">
                <BookOpen size={17} />
                <p><b>The computer reads from top to bottom.</b> Use the arrow buttons to place each piece where the computer should meet it. You can change the order as often as you need.</p>
              </div>
              <div className="ordering-list" aria-label="Code pieces to order">
                {orderedIds.map((id, index) => {
                  const item = exercise.orderItems?.find((candidate) => candidate.id === id)
                  if (!item) return null
                  return (
                    <article key={item.id}>
                      <span>{index + 1}</span>
                      <code>{item.code}</code>
                      <div>
                        <button onClick={() => moveOrderItem(index, -1)} disabled={index === 0} aria-label={`Move ${item.code} up`}><ArrowUp size={16} /></button>
                        <button onClick={() => moveOrderItem(index, 1)} disabled={index === orderedIds.length - 1} aria-label={`Move ${item.code} down`}><ArrowDown size={16} /></button>
                      </div>
                    </article>
                  )
                })}
              </div>
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
                <div className="editor-bar"><span><Code2 size={15} /> {mission.language === 'python' ? 'mission.py' : mission.language === 'cpp' ? 'mission.cpp' : mission.language === 'java' ? 'Mission.java' : 'Mission.cs'}</span><small>TRAINING SIMULATOR</small></div>
                <div className="editor-body">
                  <div className="line-numbers">{answer.split('\n').map((_, index) => <span key={index}>{index + 1}</span>)}</div>
                  <textarea
                    aria-label="Code editor"
                    aria-keyshortcuts="Control+Enter Meta+Enter"
                    value={answer}
                    onChange={(event) => setAnswer(event.target.value)}
                    onKeyDown={handleEditorKeyDown}
                    spellCheck={false}
                    disabled={feedback?.correct}
                  />
                </div>
                <div className="console-pane">
                  <div><TerminalSquare size={14} /> SIMULATED OUTPUT</div>
                  <pre>{feedback?.correct ? feedback.output : 'Nothing has run yet. Complete your one small change, then select Run check.'}</pre>
                </div>
                <div className="editor-shortcuts" aria-label="Code editor keyboard controls">
                  <span><Keyboard size={14} /> KEYBOARD</span>
                  <p><kbd>Ctrl</kbd> or <kbd>⌘</kbd> + <kbd>Enter</kbd> runs the check. <kbd>Tab</kbd> moves out of the editor normally.</p>
                </div>
              </div>
            </div>
          ) : null}

          <button className="hint-toggle" aria-expanded={hintOpen} onClick={() => setHintOpen((open) => !open)}><CircleHelp size={17} /> {hintOpen ? 'Hide hint' : 'I need a hint'}</button>
          {hintOpen && <div className="hint-box"><Sparkles size={16} /><span><b>Small nudge</b>{exercise.hint}</span></div>}

          {feedback && (
            <div className={`feedback-box ${feedback.correct ? 'is-correct' : 'is-wrong'}`}>
              {feedback.correct ? <CheckCircle2 /> : <MessageCircleQuestion />}
              <div><b>{feedback.correct ? 'System online' : 'Let’s inspect that'}</b><p>{feedback.message}</p></div>
            </div>
          )}

          <div className="exercise-actions">
            {!reviewing && step > 0 && !feedback?.correct && <button className="secondary-action" onClick={() => { setStep((current) => current - 1); setFeedback(null) }}><ArrowLeft size={17} /> Back</button>}
            <button className="primary-action" onClick={feedback?.correct ? continueLesson : checkAnswer}>
              {feedback?.correct
                ? reviewing
                  ? reviewIndex === reviewQueue.length - 1 ? 'Complete memory repair' : 'Next review'
                  : step === sessionExercises.length - 1
                    ? mistakes.length > 0 ? 'Repair missed concepts' : practiceMode ? 'Finish practice' : 'Finish mission'
                    : 'Continue'
                : checkActionLabel}
              {feedback?.correct ? <ArrowRight size={18} /> : <Play size={16} fill="currentColor" />}
            </button>
          </div>
          <p className="simulator-note">This first prototype checks each beginner task locally. A sandboxed compiler service is planned for open-ended projects.</p>
        </section>
      </main>
    </div>
  )
}

function App() {
  const [progress, setProgress] = useState<LearnerProgress>(() => loadProgress())
  const [view, setView] = useState<ViewId>('path')
  const [activeLesson, setActiveLesson] = useState<ActiveLesson | null>(null)
  const [authUser, setAuthUser] = useState<AuthUser | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [authBusy, setAuthBusy] = useState(false)
  const [authNotice, setAuthNotice] = useState<string | null>(() => authNoticeFromLocation())

  useEffect(() => {
    saveProgress(progress)
  }, [progress])

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 })
  }, [progress.onboardingComplete, view])

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
        if (active && session?.authenticated) setAuthUser(session.user)
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setAuthReady(true)
      })

    return () => { active = false }
  }, [])

  const normalizedProgress = useMemo(() => {
    if (progress.dailyXpDate === dateKey(new Date())) return progress
    return { ...progress, dailyXp: 0 }
  }, [progress])

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
      setAuthUser(null)
      setAuthNotice('Signed out. Your local course progress is still here.')
    } catch {
      setAuthNotice('Sign-out could not be completed. Please try again.')
    } finally {
      setAuthBusy(false)
    }
  }

  const reset = () => {
    if (window.confirm('Reset all local SeePoundCoffeePie progress and return to cadet intake?')) {
      setProgress(initialProgress())
      setView('path')
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
    if (!window.confirm('Replace this browser’s current SeePoundCoffeePie progress with the selected backup?')) {
      return 'Restore cancelled. Your current progress was not changed.'
    }

    setProgress(result.progress)
    setView('profile')
    const exported = new Date(result.exportedAt).toLocaleString()
    return `Progress restored from the backup created ${exported}.`
  }

  if (!progress.onboardingComplete) {
    return (
      <>
        {authNotice && <AuthNotice message={authNotice} onDismiss={() => setAuthNotice(null)} />}
        <Onboarding
          authReady={authReady}
          authUser={authUser}
          onComplete={setProgress}
          onSignIn={signIn}
        />
      </>
    )
  }

  return (
    <>
      {authNotice && <AuthNotice message={authNotice} onDismiss={() => setAuthNotice(null)} />}
      <AppShell
        authReady={authReady}
        authUser={authUser}
        progress={normalizedProgress}
        view={view}
        setView={setView}
        onLanguageChange={(language) => setProgress((current) => ({ ...current, activeLanguage: language }))}
        onSignIn={signIn}
      >
        {view === 'path' && <MissionPath progress={normalizedProgress} onStart={(mission) => setActiveLesson({ mission })} />}
        {view === 'practice' && <PracticeBay progress={normalizedProgress} onStart={(mission, practiceConceptIds) => setActiveLesson({ mission, practiceConceptIds })} />}
        {view === 'spellbook' && <Codebook progress={normalizedProgress} />}
        {view === 'profile' && (
          <CadetRecord
            authBusy={authBusy}
            authUser={authUser}
            onDownloadBackup={downloadProgressBackup}
            onLogout={logout}
            onOpenTrack={(language) => {
              setProgress((current) => ({ ...current, activeLanguage: language }))
              setView('path')
            }}
            onReset={reset}
            onRestoreBackup={restoreProgressBackup}
            onSignIn={signIn}
            progress={normalizedProgress}
          />
        )}
      </AppShell>
      {activeLesson && (
        <LessonPlayer
          mission={activeLesson.mission}
          practiceConceptIds={activeLesson.practiceConceptIds}
          progress={progress}
          onProgress={updateProgress}
          onExit={() => setActiveLesson(null)}
        />
      )}
    </>
  )
}

export default App
