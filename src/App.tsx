import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
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
  Flame,
  Gem,
  LibraryBig,
  LockKeyhole,
  Menu,
  MessageCircleQuestion,
  Orbit,
  Play,
  Radio,
  RotateCcw,
  Satellite,
  Settings,
  Shield,
  Sparkles,
  TerminalSquare,
  Trophy,
  UserRound,
  X,
  Zap,
} from 'lucide-react'
import { trackById, tracks } from './data/curriculum'
import { evaluateExercise } from './lib/evaluator'
import {
  completeMission,
  dateKey,
  initialProgress,
  isDue,
  loadProgress,
  recordAttempt,
  saveProgress,
} from './lib/progress'
import type {
  EvaluationResult,
  LanguageId,
  LearnerProgress,
  Mission,
} from './types'

type ViewId = 'path' | 'practice' | 'spellbook' | 'profile'

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

const glossary = [
  {
    term: 'Program',
    plain: 'A sequence of instructions a computer follows.',
    ship: 'Like a flight plan, except every step must be precise.',
  },
  {
    term: 'Console',
    plain: 'A text area where a program can show messages and results.',
    ship: 'The program’s intercom and status display.',
  },
  {
    term: 'Variable',
    plain: 'A named place that stores a value so you can use it later.',
    ship: 'A labeled cargo locker for one useful piece of information.',
  },
  {
    term: 'String',
    plain: 'A text value, usually surrounded by quotation marks.',
    ship: 'Words entered in the ship log, such as a vessel name.',
  },
  {
    term: 'Integer',
    plain: 'A whole number with no decimal part.',
    ship: 'A count of crew, power cells, shields, or very patient goats.',
  },
  {
    term: 'Compiler',
    plain: 'A tool that checks and translates source code before it runs.',
    ship: 'An engineering translator that turns orders into machine signals.',
  },
]

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

function Onboarding({ onComplete }: { onComplete: (progress: LearnerProgress) => void }) {
  const [language, setLanguage] = useState<LanguageId>('python')
  const [callsign, setCallsign] = useState('')
  const [goal, setGoal] = useState(10)
  const selectedTrack = trackById(language)

  const finish = () => {
    onComplete({
      ...initialProgress(language),
      callsign: callsign.trim() || 'Cadet',
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
            placeholder="Cadet name or callsign"
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
          <p className="fine-print"><Shield size={13} /> Progress stays in this browser for this prototype.</p>
        </div>
      </section>
    </main>
  )
}

interface ShellProps {
  progress: LearnerProgress
  view: ViewId
  setView: (view: ViewId) => void
  onLanguageChange: (language: LanguageId) => void
  children: React.ReactNode
}

function AppShell({ progress, view, setView, onLanguageChange, children }: ShellProps) {
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
          <div className="profile-chip">{progress.callsign.slice(0, 1).toUpperCase()}</div>
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
              const available = item.status === 'available'
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
                        {!available && <span>Complete earlier training to unlock</span>}
                      </div>
                    </div>
                    <button
                      className={available ? 'mission-play' : 'mission-lock'}
                      onClick={() => available && onStart(item)}
                      disabled={!available}
                      aria-label={available ? `${complete ? 'Replay' : 'Start'} ${item.title}` : `${item.title} locked`}
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

function PracticeBay({ progress, onStart }: { progress: LearnerProgress; onStart: (mission: Mission) => void }) {
  const dueConcepts = Object.entries(progress.conceptProgress).filter(([, concept]) => isDue(concept))
  const starterMission = trackById(progress.activeLanguage).missions[0]

  return (
    <main className="content-page">
      <div className="page-heading page-heading--simple">
        <div><p className="kicker"><Orbit size={14} /> SPACED PRACTICE</p><h1>Memory orbit</h1><p>Short reviews return when they can do the most good.</p></div>
      </div>
      <section className="practice-hero">
        <div className="practice-orbit"><Orbit /><span>{dueConcepts.length}</span></div>
        <div>
          <small>REVIEW QUEUE</small>
          <h2>{dueConcepts.length ? `${dueConcepts.length} concepts are ready` : 'Your orbit is clear'}</h2>
          <p>{dueConcepts.length ? 'Replay the first mission to reinforce the concepts currently due.' : 'Complete a mission and any shaky concepts will return here for another pass.'}</p>
        </div>
        <button className="primary-action" onClick={() => onStart(starterMission)}><RotateCcw size={17} /> {progress.completedMissions.includes(starterMission.id) ? 'Practice mission' : 'Start first mission'}</button>
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
          {dueConcepts.map(([id, concept]) => (
            <div key={id}><Code2 /><span><b>{id.replaceAll('-', ' ')}</b><small>Memory strength {concept.strength} of 5</small></span><strong>READY</strong></div>
          ))}
        </section>
      )}
    </main>
  )
}

function Codebook() {
  return (
    <main className="content-page">
      <div className="page-heading page-heading--simple">
        <div><p className="kicker"><LibraryBig size={14} /> PLAIN-LANGUAGE REFERENCE</p><h1>Cadet codebook</h1><p>Every term comes with a definition and a shipboard analogy.</p></div>
      </div>
      <div className="glossary-grid">
        {glossary.map((item, index) => (
          <article key={item.term}>
            <span className="glossary-number">{String(index + 1).padStart(2, '0')}</span>
            <Code2 size={21} />
            <h2>{item.term}</h2>
            <p>{item.plain}</p>
            <div><Sparkles size={15} /><span><b>On the ship</b>{item.ship}</span></div>
          </article>
        ))}
      </div>
    </main>
  )
}

function CadetRecord({ progress, onReset }: { progress: LearnerProgress; onReset: () => void }) {
  const concepts = Object.values(progress.conceptProgress)
  const answers = concepts.reduce((sum, item) => sum + item.correct + item.incorrect, 0)
  const accuracy = answers ? Math.round((concepts.reduce((sum, item) => sum + item.correct, 0) / answers) * 100) : 0

  return (
    <main className="content-page">
      <div className="page-heading page-heading--simple"><div><p className="kicker"><UserRound size={14} /> CADET RECORD</p><h1>{progress.callsign}</h1><p>Commission progress stored on this device.</p></div></div>
      <div className="record-grid">
        <article><Zap /><span><b>{progress.xp}</b><small>Total XP</small></span></article>
        <article><Flame /><span><b>{progress.streak}</b><small>Day streak</small></span></article>
        <article><Trophy /><span><b>{progress.completedMissions.length}</b><small>Missions</small></span></article>
        <article><CheckCircle2 /><span><b>{accuracy}%</b><small>Accuracy</small></span></article>
      </div>
      <section className="settings-panel">
        <div><h2>Prototype controls</h2><p>Resetting removes the learner name, XP, mission completion, and review history from this browser.</p></div>
        <button className="danger-button" onClick={onReset}><RotateCcw size={16} /> Reset local progress</button>
      </section>
    </main>
  )
}

interface LessonPlayerProps {
  mission: Mission
  progress: LearnerProgress
  onProgress: (progress: LearnerProgress) => void
  onExit: () => void
}

function LessonPlayer({ mission, progress, onProgress, onExit }: LessonPlayerProps) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [feedback, setFeedback] = useState<EvaluationResult | null>(null)
  const [credited, setCredited] = useState<string[]>([])
  const [hintOpen, setHintOpen] = useState(false)
  const [finished, setFinished] = useState(false)
  const [mistakes, setMistakes] = useState<string[]>([])
  const exercise = mission.exercises[step]
  const answer = answers[exercise?.id] ?? exercise?.starterCode ?? ''
  const totalXp = mission.exercises.reduce((sum, item) => sum + item.xp, 0)
  const earnedXp = mission.exercises.filter((item) => credited.includes(item.id)).reduce((sum, item) => sum + item.xp, 0)

  if (!exercise) return null

  const setAnswer = (value: string) => {
    setAnswers((current) => ({ ...current, [exercise.id]: value }))
    if (feedback && !feedback.correct) setFeedback(null)
  }

  const checkAnswer = () => {
    const result = evaluateExercise(exercise, answer)
    setFeedback(result)
    if (!result.correct) {
      if (!mistakes.includes(exercise.id)) {
        setMistakes((current) => [...current, exercise.id])
        onProgress(recordAttempt(progress, exercise.conceptId, false, 0))
      }
      return
    }

    if (!credited.includes(exercise.id)) {
      setCredited((current) => [...current, exercise.id])
      onProgress(recordAttempt(progress, exercise.conceptId, true, exercise.xp))
    }
  }

  const continueLesson = () => {
    if (step === mission.exercises.length - 1) {
      onProgress(completeMission(progress, mission.id))
      setFinished(true)
      return
    }
    setStep((current) => current + 1)
    setFeedback(null)
    setHintOpen(false)
  }

  if (finished) {
    return (
      <div className="lesson-overlay">
        <main className="mission-complete">
          <div className="completion-burst" aria-hidden="true"><Sparkles /><span><Check /></span></div>
          <p className="kicker">MISSION COMPLETE</p>
          <h1>{mission.title}</h1>
          <p>You turned unfamiliar symbols into a working report. That is programming.</p>
          <div className="completion-stats">
            <div><Zap /><b>{earnedXp || totalXp}</b><span>XP earned</span></div>
            <div><Gem /><b>25</b><span>star shards</span></div>
            <div><RotateCcw /><b>{mistakes.length}</b><span>review items</span></div>
          </div>
          <div className="what-learned"><h2>Systems now familiar</h2><div>{[...new Set(mission.exercises.map((item) => item.conceptId.split('-').slice(1).join(' ')))].map((concept) => <span key={concept}><Check size={14} /> {concept}</span>)}</div></div>
          <button className="primary-action primary-action--wide" onClick={onExit}>Return to mission path <ArrowRight size={18} /></button>
        </main>
      </div>
    )
  }

  return (
    <div className="lesson-overlay">
      <header className="lesson-header">
        <button onClick={onExit} className="icon-button" aria-label="Exit lesson"><X /></button>
        <div className="lesson-progress"><i style={{ width: `${((step + 1) / mission.exercises.length) * 100}%` }} /></div>
        <div className="lesson-step"><b>{step + 1}</b><span>/ {mission.exercises.length}</span></div>
        <div className="lesson-xp"><Zap size={17} /> {earnedXp} XP</div>
      </header>

      <main className="lesson-layout">
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
            <div><small>YOUR TASK</small><h2>{exercise.prompt}</h2></div>
            <span><Trophy size={14} /> {exercise.xp} XP</span>
          </div>

          {exercise.type === 'choice' ? (
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
          ) : (
            <div className="code-workspace">
              <div className="editor-bar"><span><Code2 size={15} /> {mission.language === 'python' ? 'mission.py' : mission.language === 'cpp' ? 'mission.cpp' : mission.language === 'java' ? 'Mission.java' : 'Mission.cs'}</span><small>TRAINING SIMULATOR</small></div>
              <div className="editor-body">
                <div className="line-numbers">{answer.split('\n').map((_, index) => <span key={index}>{index + 1}</span>)}</div>
                <textarea
                  aria-label="Code editor"
                  value={answer}
                  onChange={(event) => setAnswer(event.target.value)}
                  spellCheck={false}
                  disabled={feedback?.correct}
                />
              </div>
              <div className="console-pane">
                <div><TerminalSquare size={14} /> SIMULATED OUTPUT</div>
                <pre>{feedback?.correct ? feedback.output : 'Run the check to see your program’s result.'}</pre>
              </div>
            </div>
          )}

          <button className="hint-toggle" onClick={() => setHintOpen((open) => !open)}><CircleHelp size={17} /> {hintOpen ? 'Hide hint' : 'I need a hint'}</button>
          {hintOpen && <div className="hint-box"><Sparkles size={16} /><span><b>Small nudge</b>{exercise.hint}</span></div>}

          {feedback && (
            <div className={`feedback-box ${feedback.correct ? 'is-correct' : 'is-wrong'}`}>
              {feedback.correct ? <CheckCircle2 /> : <MessageCircleQuestion />}
              <div><b>{feedback.correct ? 'System online' : 'Let’s inspect that'}</b><p>{feedback.message}</p></div>
            </div>
          )}

          <div className="exercise-actions">
            {step > 0 && !feedback?.correct && <button className="secondary-action" onClick={() => { setStep((current) => current - 1); setFeedback(null) }}><ArrowLeft size={17} /> Back</button>}
            <button className="primary-action" onClick={feedback?.correct ? continueLesson : checkAnswer}>
              {feedback?.correct ? (step === mission.exercises.length - 1 ? 'Finish mission' : 'Continue') : exercise.type === 'choice' ? 'Check answer' : 'Run check'}
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
  const [activeMission, setActiveMission] = useState<Mission | null>(null)

  useEffect(() => {
    saveProgress(progress)
  }, [progress])

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 })
  }, [progress.onboardingComplete, view])

  const normalizedProgress = useMemo(() => {
    if (progress.dailyXpDate === dateKey(new Date())) return progress
    return { ...progress, dailyXp: 0 }
  }, [progress])

  const updateProgress = (nextProgress: LearnerProgress) => setProgress(nextProgress)

  const reset = () => {
    if (window.confirm('Reset all local SeePoundCoffeePie progress and return to cadet intake?')) {
      setProgress(initialProgress())
      setView('path')
    }
  }

  if (!progress.onboardingComplete) {
    return <Onboarding onComplete={setProgress} />
  }

  return (
    <>
      <AppShell
        progress={normalizedProgress}
        view={view}
        setView={setView}
        onLanguageChange={(language) => setProgress((current) => ({ ...current, activeLanguage: language }))}
      >
        {view === 'path' && <MissionPath progress={normalizedProgress} onStart={setActiveMission} />}
        {view === 'practice' && <PracticeBay progress={normalizedProgress} onStart={setActiveMission} />}
        {view === 'spellbook' && <Codebook />}
        {view === 'profile' && <CadetRecord progress={normalizedProgress} onReset={reset} />}
      </AppShell>
      {activeMission && (
        <LessonPlayer
          mission={activeMission}
          progress={progress}
          onProgress={updateProgress}
          onExit={() => setActiveMission(null)}
        />
      )}
    </>
  )
}

export default App
