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
  MessageCircleQuestion,
  RotateCcw,
  Sparkles,
  TerminalSquare,
  X,
} from 'lucide-react'
import './learning-workspace.css'
import { orderedChoices } from './lib/choice-order'
import { evaluateExercise } from './lib/evaluator'
import { buildPracticeExercises, type AdaptivePracticeSession } from './lib/practice'
import { completeMission, recordAttempt, recordLessonSuccess } from './lib/progress'
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

function learnerCheckName(name: string): string {
  return name.replace(/^(?:Visible|Hidden|Protected)\s+/u, '')
}

const conceptLabels: Record<string, string> = {
  'output and variables': 'using variables in output',
  'collections and indexes': 'collection positions',
  'loops and collections': 'looping through a collection',
  'functions and loops': 'reusing code in a loop',
  'parameters and calls': 'passing values into reusable code',
  'function order': 'when reusable code is defined',
  'program planning': 'planning a program',
  'capstone assembly': 'putting a program together',
  'capstone repair': 'fixing a complete program',
  capstone: 'building a complete program',
  compiler: 'how C++ code becomes a program',
  runtime: 'how a program starts',
  indexes: 'positions in a collection',
  iteration: 'one pass through a loop',
  'data tool assembly': 'putting the data tool together',
  'data tool capstone': 'building the complete data tool',
  'data tool debugging': 'fixing the data tool',
  'f strings': 'formatted text',
}

function plainConceptLabel(conceptId: string): string {
  const withoutOwner = conceptId.replace(/^(?:project-)?(?:python|cpp|csharp|java)-/u, '')
  const words = withoutOwner.replaceAll('-', ' ')
  return conceptLabels[words] ?? words
}

export function LessonPlayer({ initialExerciseId, mission, onExerciseChange, onPracticeComplete, practiceConceptIds, practiceSession, progress, onProgress, onExit }: LessonPlayerProps) {
  const practiceMode = practiceSession !== undefined || practiceConceptIds !== undefined
  const sessionExercises = practiceSession
    ? practiceSession.items.map((item) => item.exercise)
    : practiceConceptIds !== undefined
      ? buildPracticeExercises(mission, practiceConceptIds)
      : mission.exercises
  const missionWasComplete = progress.completedMissions.includes(mission.id)
  const initiallyCredited = !practiceMode && !missionWasComplete
    ? sessionExercises.filter((exercise) => progress.completedLessons.includes(exercise.id)).map((exercise) => exercise.id)
    : []
  const initialStep = Math.max(0, sessionExercises.findIndex((item) => item.id === initialExerciseId))
  const [step, setStep] = useState(initialStep)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [feedback, setFeedback] = useState<EvaluationResult | null>(null)
  const [runnerBusy, setRunnerBusy] = useState(false)
  const [runnerStatus, setRunnerStatus] = useState<RunnerClientStatus | null>(null)
  const [runnerResult, setRunnerResult] = useState<RunnerResult | null>(null)
  const [runnerFailure, setRunnerFailure] = useState(false)
  const [credited, setCredited] = useState<string[]>(initiallyCredited)
  const [recordedSuccesses, setRecordedSuccesses] = useState<string[]>([])
  const [hintOpen, setHintOpen] = useState(false)
  const [finished, setFinished] = useState(false)
  const [mistakes, setMistakes] = useState<string[]>([])
  const [reviewQueue, setReviewQueue] = useState<string[]>([])
  const [reviewIndex, setReviewIndex] = useState(0)
  const [orderingAnnouncement, setOrderingAnnouncement] = useState('')
  const lessonHeadingRef = useRef<HTMLHeadingElement>(null)
  const completionHeadingRef = useRef<HTMLHeadingElement>(null)
  const [missionAlreadyComplete] = useState(missionWasComplete)
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
  const runnerAbortControllerRef = useRef<AbortController | null>(null)
  const abortRunnerRequest = () => {
    runnerRequestIdRef.current += 1
    runnerAbortControllerRef.current?.abort()
    runnerAbortControllerRef.current = null
  }
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
  const progressPercent = reviewing
    ? ((reviewIndex + 1) / reviewQueue.length) * 100
    : ((activeStep + 1) / sessionExercises.length) * 100

  useLayoutEffect(() => {
    runnerRequestIdRef.current += 1
    runnerAbortControllerRef.current?.abort()
    runnerAbortControllerRef.current = null
    return () => {
      runnerRequestIdRef.current += 1
      runnerAbortControllerRef.current?.abort()
      runnerAbortControllerRef.current = null
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
    ? 'Try again'
    : editableExercise
      ? 'Task'
      : 'Question'
  const checkActionLabel = editableExercise
    ? 'Check my code'
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
    } else if (!recordedSuccesses.includes(exercise.id)) {
      setRecordedSuccesses((current) => [...current, exercise.id])
      if (!credited.includes(exercise.id)) {
        setCredited((current) => [...current, exercise.id])
      }
      const lessonWasComplete = progress.completedLessons.includes(exercise.id)
      if (rewardsDisabled || lessonWasComplete) {
        onProgress((current) => recordAttempt(current, exercise.conceptId, true, 0))
      } else {
        onProgress((current) => recordLessonSuccess(current, {
          id: exercise.id,
          conceptId: exercise.conceptId,
          xp: exercise.xp,
        }))
      }
    }
  }

  const checkAnswer = async () => {
    if (runnerBusy) return
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

    abortRunnerRequest()
    const requestId = runnerRequestIdRef.current + 1
    runnerRequestIdRef.current = requestId
    const controller = new AbortController()
    runnerAbortControllerRef.current = controller
    const isCurrentRunnerRequest = () => runnerRequestIdRef.current === requestId
    setFeedback(null)
    setRunnerBusy(true)
    setRunnerResult(null)
    try {
      const result = await runExercise(exercise.id, mission.language, answer, (status) => {
        if (isCurrentRunnerRequest()) setRunnerStatus(status)
      }, { signal: controller.signal })
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
      if (!isCurrentRunnerRequest() || controller.signal.aborted) return
      const message = error instanceof Error
        ? error.message
        : 'The isolated runner could not be reached. Your code was not marked wrong.'
      setRunnerFailure(true)
      setFeedback({ correct: false, message })
    } finally {
      if (isCurrentRunnerRequest()) {
        if (runnerAbortControllerRef.current === controller) runnerAbortControllerRef.current = null
        setRunnerBusy(false)
        setRunnerStatus(null)
      }
    }
  }

  const finishSession = () => {
    abortRunnerRequest()
    if (practiceMode) onPracticeComplete?.()
    else onProgress((current) => completeMission(current, mission.id))
    setFinished(true)
  }

  const showExercise = (index: number) => {
    abortRunnerRequest()
    setStep(index)
    const nextExercise = sessionExercises[index]
    if (nextExercise) onExerciseChange?.(nextExercise.id)
    resetExerciseUi()
  }

  const startReview = (queue: string[]) => {
    abortRunnerRequest()
    setAnswers((current) => resetReviewAnswers(current, queue))
    setReviewQueue(queue)
    setReviewIndex(0)
    resetExerciseUi()
  }

  const continueLesson = () => {
    abortRunnerRequest()
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
    abortRunnerRequest()
    setStep(activeStep - 1)
    resetExerciseUi()
    onExerciseChange?.(previous.id)
  }

  const exitLesson = () => {
    abortRunnerRequest()
    onExit()
  }

  const handleEditorKeyDown = (event: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Enter' || (!event.ctrlKey && !event.metaKey)) return
    event.preventDefault()
    if (feedback?.correct) continueLesson()
    else void checkAnswer()
  }

  if (finished) {
    const reviewedConcepts = [...new Set(sessionExercises.map((item) => plainConceptLabel(item.conceptId)))]
    return (
      <div className="lesson-overlay">
        <main className="mission-complete" id="main-content" tabIndex={-1}>
          <div className="completion-burst" aria-hidden="true"><Sparkles /><span><Check /></span></div>
          <p className="kicker">{practiceMode ? 'Practice complete' : 'Module complete'}</p>
          <h1 ref={completionHeadingRef} tabIndex={-1}>{practiceMode ? 'Review complete' : mission.title}</h1>
          <p>{practiceMode ? `You practiced ${reviewedConcepts.join(', ')}. You may see these ideas again in a later Practice session.` : 'You completed every lesson in this module.'}</p>
          <div className="completion-stats">
            {practiceMode
              ? <><div><CheckCircle2 /><b>{sessionExercises.length}</b><span>questions completed</span></div><div><BookOpen /><b>{reviewedConcepts.length}</b><span>ideas reviewed</span></div></>
              : <><div><CheckCircle2 /><b>{sessionExercises.length}</b><span>lessons completed</span></div><div><BookOpen /><b>{reviewedConcepts.length}</b><span>ideas reviewed</span></div></>}
            <div><RotateCcw /><b>{reviewQueue.length}</b><span>questions retried</span></div>
          </div>
          <div className="what-learned"><h2>{practiceMode ? 'Reviewed in this session' : 'Reviewed in this module'}</h2><div>{reviewedConcepts.map((concept) => <span key={concept}><Check size={14} /> {concept}</span>)}</div></div>
          <button className="primary-action primary-action--wide" onClick={exitLesson}>Return to {practiceMode ? 'Practice' : 'course'} <ArrowRight size={18} /></button>
        </main>
      </div>
    )
  }

  return (
    <div className="lesson-overlay">
      <header className="lesson-header">
        <button onClick={exitLesson} className="icon-button" aria-label={practiceMode ? 'Exit practice' : 'Exit lesson'}><X /></button>
        <div className="lesson-progress" aria-label={practiceMode ? 'Practice progress' : 'Lesson progress'} aria-valuemax={100} aria-valuemin={0} aria-valuenow={Math.round(progressPercent)} aria-valuetext={`${reviewing ? 'Retry question' : practiceMode ? 'Question' : 'Lesson'} ${reviewing ? reviewIndex + 1 : activeStep + 1} of ${reviewing ? reviewQueue.length : sessionExercises.length}`} role="progressbar"><i style={{ width: `${progressPercent}%` }} /></div>
        <div className="lesson-step"><b>{reviewing ? reviewIndex + 1 : activeStep + 1}</b><span>/ {reviewing ? reviewQueue.length : sessionExercises.length}</span></div>
      </header>

      <main className={`lesson-layout${practiceMode || reviewing ? ' lesson-layout--with-banner' : ''}`} id="main-content" tabIndex={-1}>
        {practiceMode && !reviewing && (
          <section className="memory-repair" aria-label="Focused practice round">
            <BookOpen size={22} />
            <div>
              <small>Practice, question {activeStep + 1} of {sessionExercises.length}</small>
              <h2>Review a completed lesson.</h2>
              <p>{practiceSession
                ? `This question comes from ${practiceSession.items.find((item) => item.exercise.id === exercise.id)?.missionTitle ?? 'your course'}. You may see this idea again in a later Practice session.`
                : `This question comes from ${mission.title}. You may see this idea again in a later Practice session.`}</p>
            </div>
          </section>
        )}
        {reviewing && (
          <section className="memory-repair" aria-label="Review round">
            <RotateCcw size={22} />
            <div>
              <small>Try again, question {reviewIndex + 1} of {reviewQueue.length}</small>
              <h2>Try this question again.</h2>
              <p>Start again, reread the explanation, and use the hint whenever you want.</p>
            </div>
          </section>
        )}
        <section aria-labelledby="lesson" className="lesson-briefing" tabIndex={0}>
          <h1 id="lesson" ref={lessonHeadingRef} tabIndex={-1}>{exercise.title}</h1>
          <p className="lesson-explanation">{exercise.explanation}</p>
          <div className="analogy-card">
            <small>Another way to think about it</small>
            <p>{exercise.analogy}</p>
          </div>
          {editableExercise && (
            <section className="code-onramp" aria-label="Code walkthrough">
              <div className="code-focus">
                <div>
                  <small>Change this</small>
                  <b>{exercise.focus ?? `Replace the ${blankCount === 1 ? 'one' : blankCount} _____ ${blankCount === 1 ? 'blank' : 'blanks'}.`}</b>
                  <p>Only this part needs editing. The rest is already written for you.</p>
                </div>
              </div>
              {exercise.codeGuide && exercise.codeGuide.length > 0 && (
                <div className="code-guide">
                  <div className="code-guide__head">
                    <h2>What the code means</h2>
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
          )}
        </section>

        <section className="exercise-panel">
          <div className="exercise-panel__head">
            <div><small>{taskLabel}</small><h2>{exercise.prompt}</h2></div>
          </div>

          {choiceExercise ? (
            <div>
              {exercise.type === 'prediction' && exercise.displayCode && (
                <div className="prediction-code" aria-label="Code to predict">
                  <div><Code2 size={15} /> Code to read</div>
                  <pre><code>{exercise.displayCode}</code></pre>
                </div>
              )}
              <div className="guided-check-note">
                <BookOpen size={17} />
                <p>{exercise.type === 'prediction' ? 'Read the code from top to bottom. Use the explanation on the left when you need it.' : 'Use the explanation on the left. You can reread it before choosing.'}</p>
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
              {feedback?.correct && exercise.output && <div className="exercise-result"><TerminalSquare size={15} /><span><b>Result</b><code>{exercise.output}</code></span></div>}
            </div>
          ) : exercise.type === 'ordering' ? (
            <div>
              <div className="guided-check-note">
                <BookOpen size={17} />
                <p>Use the arrow buttons to put the pieces in the order the computer should read them.</p>
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
              {feedback?.correct && exercise.output && <div className="exercise-result"><TerminalSquare size={15} /><span><b>Result</b><code>{exercise.output}</code></span></div>}
            </div>
          ) : editableExercise ? (
            <div>
              <div className="code-workspace">
                <div className="editor-bar"><span><Code2 size={15} /> {mission.language === 'python' ? 'main.py' : mission.language === 'cpp' ? 'main.cpp' : mission.language === 'java' ? 'Main.java' : 'Program.cs'}</span></div>
                <div className="editor-body">
                  <div className="line-numbers" aria-hidden="true">{answer.split('\n').map((_, index) => <span key={index}>{index + 1}</span>)}</div>
                  <textarea
                    aria-busy={runnerBusy}
                    aria-label="Code editor"
                    aria-keyshortcuts="Control+Enter Meta+Enter"
                    autoCapitalize="off"
                    autoCorrect="off"
                    value={answer}
                    onChange={(event) => setAnswer(event.target.value)}
                    onKeyDown={handleEditorKeyDown}
                    spellCheck={false}
                    wrap="off"
                    readOnly={feedback?.correct || runnerBusy}
                  />
                </div>
                {runnerBusy && <p className="sr-only" role="status">
                  {runnerStatus === 'running' ? 'Your program is running.' : 'Getting your code ready.'}
                </p>}
                <div className="console-pane">
                  <div><TerminalSquare size={14} /> Output</div>
                  <pre>{runnerBusy
                    ? runnerStatus === 'running' ? 'Your program is running...' : 'Getting your code ready...'
                    : runnerResult
                      ? runnerResult.stdout || runnerResult.stderr || '(The program finished without printing any text.)'
                      : 'Run your code to see what it prints.'}</pre>
                </div>
                {runnerResult && (
                  <section className="runner-report" aria-label="Run results">
                    <div className="runner-report__summary">
                      <span className={runnerResult.outcome === 'completed' ? 'is-good' : 'is-alert'}>
                        {runnerResult.diagnostic.title}
                      </span>
                    </div>
                    <div className="runner-tests">
                      {runnerResult.tests.map((test) => (
                        <article key={`${runnerResult.runId}-${test.name}`}>
                          {test.passed ? <CheckCircle2 size={15} /> : <MessageCircleQuestion size={15} />}
                          <span><b>{learnerCheckName(test.name)}</b><small>{test.message}</small></span>
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
                  <span>Keyboard</span>
                  <p><kbd>Ctrl</kbd> or <kbd>⌘</kbd> + <kbd>Enter</kbd> runs the check. <kbd>Tab</kbd> moves out of the editor normally.</p>
                </div>
              </div>
            </div>
          ) : null}

          <button className="hint-toggle" aria-controls="lesson-hint" aria-expanded={hintOpen} onClick={() => setHintOpen((open) => !open)}><CircleHelp size={17} /> {hintOpen ? 'Hide hint' : 'I need a hint'}</button>
          {hintOpen && <div className="hint-box" id="lesson-hint"><Sparkles size={16} /><span><b>Hint</b>{exercise.hint}</span></div>}

          {feedback && (
            <div aria-live="polite" className={`feedback-box ${runnerFailure ? 'is-neutral' : feedback.correct ? 'is-correct' : 'is-wrong'}`} role="status">
              {feedback.correct ? <CheckCircle2 /> : runnerFailure ? <CircleHelp /> : <MessageCircleQuestion />}
              <div><b>{feedback.correct ? 'Correct' : runnerFailure ? 'Could not run code' : 'Try again'}</b><p>{feedback.message}</p></div>
            </div>
          )}

          <div className="exercise-actions">
            {!reviewing && activeStep > 0 && !feedback?.correct && <button className="secondary-action" onClick={returnToPreviousExercise}><ArrowLeft size={17} /> Back</button>}
            <button
              aria-disabled={runnerBusy}
              className="primary-action"
              onClick={feedback?.correct ? continueLesson : () => { void checkAnswer() }}
            >
              {feedback?.correct
                ? reviewing
                  ? reviewIndex === reviewQueue.length - 1 ? 'Finish review' : 'Next review'
                  : practiceMode
                    ? nextUncreditedStep >= 0
                      ? 'Continue'
                      : mistakes.length > 0
                        ? 'Review missed questions'
                        : 'Finish practice'
                    : activeStep === sessionExercises.length - 1
                      ? hasUnfinishedLessons
                        ? 'Complete remaining lessons'
                        : mistakes.length > 0
                        ? 'Review missed questions'
                        : 'Finish module'
                      : 'Continue'
                : runnerBusy
                  ? runnerStatus === 'running' ? 'Running your code...' : 'Getting ready...'
                  : checkActionLabel}
              {feedback?.correct && <ArrowRight size={18} />}
            </button>
          </div>
          {editableExercise && <details className="run-safety-note"><summary>How code runs safely</summary><p>Your code runs in a clean workspace that is deleted after each check.</p></details>}
        </section>
      </main>
    </div>
  )
}

export default LessonPlayer
