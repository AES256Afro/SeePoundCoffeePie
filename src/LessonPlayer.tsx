import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type Dispatch,
  type KeyboardEvent as ReactKeyboardEvent,
  type SetStateAction,
} from 'react'
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  BookOpen,
  Check,
  CheckCircle2,
  CircleHelp,
  Code2,
  Compass,
  Gem,
  MessageCircleQuestion,
  RotateCcw,
  Sparkles,
  TerminalSquare,
  Trophy,
  X,
  Zap,
} from 'lucide-react'
import { orderedChoices } from './lib/choice-order'
import { evaluateExercise } from './lib/evaluator'
import { buildPracticeExercises, type AdaptivePracticeSession } from './lib/practice'
import { completeMission, recordAttempt } from './lib/progress'
import { buildReviewQueue, resetReviewAnswers } from './lib/review'
import { runExercise, type RunnerClientStatus } from './lib/runner-client'
import type { RunnerResult } from './lib/runner-contract'
import type { EvaluationResult, LearnerProgress, Mission } from './types'

export interface LessonPlayerProps {
  initialExerciseId?: string
  mission: Mission
  onExerciseChange?: (exerciseId: string) => void
  onPracticeComplete?: () => void
  practiceConceptIds?: string[]
  practiceSession?: AdaptivePracticeSession
  progress: LearnerProgress
  onProgress: Dispatch<SetStateAction<LearnerProgress>>
  onExit: () => void
}

export function LessonPlayer({ initialExerciseId, mission, onExerciseChange, onPracticeComplete, practiceConceptIds, practiceSession, progress, onProgress, onExit }: LessonPlayerProps) {
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
  const practiceMode = practiceSession !== undefined || practiceConceptIds !== undefined
  const sessionExercises = practiceSession
    ? practiceSession.items.map((item) => item.exercise)
    : practiceConceptIds !== undefined
      ? buildPracticeExercises(mission, practiceConceptIds)
    : mission.exercises
  const reviewing = reviewQueue.length > 0
  const routeStep = initialExerciseId
    ? sessionExercises.findIndex((item) => item.id === initialExerciseId)
    : -1
  const activeStep = !reviewing && routeStep >= 0 ? routeStep : step
  const exercise = reviewing
    ? sessionExercises.find((item) => item.id === reviewQueue[reviewIndex])
    : sessionExercises[activeStep]
  const [renderedExerciseId, setRenderedExerciseId] = useState(exercise?.id)
  const runnerRequestIdRef = useRef(0)
  const resetExerciseUi = () => {
    setFeedback(null)
    setRunnerBusy(false)
    setRunnerResult(null)
    setRunnerStatus(null)
    setRunnerFailure(false)
    setHintOpen(false)
    setOrderingAnnouncement('')
  }
  if (renderedExerciseId !== exercise?.id) {
    setRenderedExerciseId(exercise?.id)
    resetExerciseUi()
  }
  const rewardsDisabled = practiceMode || missionAlreadyComplete
  const totalXp = rewardsDisabled ? 0 : sessionExercises.reduce((sum, item) => sum + item.xp, 0)
  const earnedXp = rewardsDisabled
    ? 0
    : sessionExercises.filter((item) => credited.includes(item.id)).reduce((sum, item) => sum + item.xp, 0)
  const progressPercent = reviewing
    ? ((reviewIndex + 1) / reviewQueue.length) * 100
    : ((activeStep + 1) / sessionExercises.length) * 100

  useLayoutEffect(() => {
    runnerRequestIdRef.current += 1
    return () => {
      runnerRequestIdRef.current += 1
    }
  }, [exercise?.id])

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
  const nextUncreditedStep = sessionExercises.length > 0
    ? sessionExercises
      .map((_, offset) => (activeStep + offset + 1) % sessionExercises.length)
      .find((index) => !credited.includes(sessionExercises[index].id)) ?? -1
    : -1

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
        onProgress((current) => recordAttempt(current, exercise.conceptId, false, 0))
      }
      return
    }

    if (reviewing) {
      onProgress((current) => recordAttempt(current, exercise.conceptId, true, 0))
    } else if (!credited.includes(exercise.id)) {
      setCredited((current) => [...current, exercise.id])
      onProgress((current) => recordAttempt(
        current,
        exercise.conceptId,
        true,
        rewardsDisabled ? 0 : exercise.xp,
      ))
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

    const requestId = runnerRequestIdRef.current + 1
    runnerRequestIdRef.current = requestId
    const isCurrentRunnerRequest = () => runnerRequestIdRef.current === requestId
    setFeedback(null)
    setRunnerBusy(true)
    setRunnerResult(null)
    try {
      const result = await runExercise(exercise.id, mission.language, answer, (status) => {
        if (isCurrentRunnerRequest()) setRunnerStatus(status)
      })
      if (!isCurrentRunnerRequest()) return
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
      if (!isCurrentRunnerRequest()) return
      const message = error instanceof Error
        ? error.message
        : 'The isolated runner could not be reached. Your code was not marked wrong.'
      setRunnerFailure(true)
      setFeedback({ correct: false, message })
    } finally {
      if (isCurrentRunnerRequest()) {
        setRunnerBusy(false)
        setRunnerStatus(null)
      }
    }
  }

  const finishSession = () => {
    if (practiceMode) onPracticeComplete?.()
    else onProgress((current) => completeMission(current, mission.id))
    setFinished(true)
  }

  const showExercise = (index: number) => {
    setStep(index)
    const nextExercise = sessionExercises[index]
    if (nextExercise) onExerciseChange?.(nextExercise.id)
    resetExerciseUi()
  }

  const startReview = (queue: string[]) => {
    setAnswers((current) => resetReviewAnswers(current, queue))
    setReviewQueue(queue)
    setReviewIndex(0)
    resetExerciseUi()
  }

  const continueLesson = () => {
    if (reviewing) {
      if (reviewIndex === reviewQueue.length - 1) {
        if (!practiceMode && !missionAlreadyComplete && nextUncreditedStep >= 0) {
          setReviewQueue([])
          setReviewIndex(0)
          showExercise(nextUncreditedStep)
          return
        }
        finishSession()
        return
      }
      setReviewIndex((current) => current + 1)
      resetExerciseUi()
      return
    }

    if (practiceMode) {
      if (nextUncreditedStep >= 0) {
        showExercise(nextUncreditedStep)
        return
      }
      const queue = buildReviewQueue(mistakes, sessionExercises.map((item) => item.id))
      if (queue.length > 0) {
        startReview(queue)
        return
      }
      finishSession()
      return
    }

    if (!missionAlreadyComplete && nextUncreditedStep >= 0) {
      showExercise(nextUncreditedStep)
      return
    }

    if (activeStep === sessionExercises.length - 1 || !missionAlreadyComplete) {
      const queue = buildReviewQueue(mistakes, sessionExercises.map((item) => item.id))
      if (queue.length > 0) {
        startReview(queue)
        return
      }
      finishSession()
      return
    }
    showExercise(activeStep + 1)
  }

  const returnToPreviousExercise = () => {
    const previous = sessionExercises[activeStep - 1]
    if (!previous) return
    runnerRequestIdRef.current += 1
    setStep(activeStep - 1)
    resetExerciseUi()
    onExerciseChange?.(previous.id)
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
          <h1 ref={completionHeadingRef} tabIndex={-1}>{practiceMode ? 'Review complete' : mission.title}</h1>
          <p>{practiceMode ? `You practiced ${reviewedConcepts.join(', ')}. Your answers helped decide when those ideas should return.` : 'You turned unfamiliar symbols into a working report. That is programming.'}</p>
          <div className="completion-stats">
            {practiceMode
              ? <><div><CheckCircle2 /><b>{sessionExercises.length}</b><span>questions completed</span></div><div><BookOpen /><b>{reviewedConcepts.length}</b><span>concepts reviewed</span></div></>
              : <><div><Zap /><b>{earnedXp || totalXp}</b><span>XP earned</span></div><div><Gem /><b>{awardedShards}</b><span>star shards</span></div></>}
            <div><RotateCcw /><b>{reviewQueue.length}</b><span>mistakes repaired</span></div>
          </div>
          <div className="what-learned"><h2>{practiceMode ? 'Memory strengthened' : 'Systems now familiar'}</h2><div>{reviewedConcepts.map((concept) => <span key={concept}><Check size={14} /> {concept}</span>)}</div></div>
          <button className="primary-action primary-action--wide" onClick={onExit}>Return to {practiceMode ? 'Practice' : 'mission path'} <ArrowRight size={18} /></button>
        </main>
      </div>
    )
  }

  return (
    <div className="lesson-overlay">
      <header className="lesson-header">
        <button onClick={onExit} className="icon-button" aria-label={practiceMode ? 'Exit practice' : 'Exit lesson'}><X /></button>
        <div className="lesson-progress" aria-label={practiceMode ? 'Practice progress' : 'Lesson progress'} aria-valuemax={100} aria-valuemin={0} aria-valuenow={Math.round(progressPercent)} aria-valuetext={`${reviewing ? 'Repair question' : practiceMode ? 'Question' : 'Lesson'} ${reviewing ? reviewIndex + 1 : activeStep + 1} of ${reviewing ? reviewQueue.length : sessionExercises.length}`} role="progressbar"><i style={{ width: `${progressPercent}%` }} /></div>
        <div className="lesson-step"><b>{reviewing ? reviewIndex + 1 : activeStep + 1}</b><span>/ {reviewing ? reviewQueue.length : sessionExercises.length}</span></div>
        <div className="lesson-xp">{practiceMode ? <><BookOpen size={17} /> Review</> : <><Zap size={17} /> {earnedXp} XP</>}</div>
      </header>

      <main className="lesson-layout" id="main-content" tabIndex={-1}>
        {practiceMode && !reviewing && (
          <section className="memory-repair" aria-label="Focused practice round">
            <BookOpen size={22} />
            <div>
              <small>PRACTICE · QUESTION {activeStep + 1} OF {sessionExercises.length}</small>
              <h2>A short set from modules you already completed.</h2>
              <p>{practiceSession
                ? `This question comes from ${practiceSession.items.find((item) => item.exercise.id === exercise.id)?.missionTitle ?? 'your course'}. A correct answer helps decide when this idea should return.`
                : `This short session uses exercises from ${mission.title}. A correct answer lets this idea wait longer before it returns.`}</p>
            </div>
            <span>FAMILIAR IDEA</span>
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
            <span>{reviewing
              ? <><RotateCcw size={14} /> REVIEW</>
              : practiceMode
                ? <><BookOpen size={14} /> PRACTICE</>
                : <><Trophy size={14} /> {exercise.xp} XP</>}</span>
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
              <ol className="ordering-list" aria-label="Code pieces to order" role="list">
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
                {runnerBusy && <p className="sr-only" role="status">
                  {runnerStatus === 'running' ? 'Your program is running.' : 'Preparing the code runner.'}
                </p>}
                <div className="console-pane">
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
            {!reviewing && activeStep > 0 && !feedback?.correct && <button className="secondary-action" onClick={returnToPreviousExercise}><ArrowLeft size={17} /> Back</button>}
            <button className="primary-action" disabled={runnerBusy} onClick={feedback?.correct ? continueLesson : () => { void checkAnswer() }}>
              {feedback?.correct
                ? reviewing
                  ? reviewIndex === reviewQueue.length - 1 ? 'Complete memory repair' : 'Next review'
                  : practiceMode
                    ? nextUncreditedStep >= 0
                      ? 'Continue'
                      : mistakes.length > 0
                        ? 'Repair missed concepts'
                        : 'Finish practice'
                    : activeStep === sessionExercises.length - 1
                      ? hasUnfinishedLessons
                        ? 'Complete remaining lessons'
                        : mistakes.length > 0
                          ? 'Repair missed concepts'
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

export default LessonPlayer
