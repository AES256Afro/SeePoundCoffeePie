import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Circle,
  CircleHelp,
  Clock3,
  Code2,
  Coffee,
  Download,
  Eye,
  FileCode2,
  Hash,
  LockKeyhole,
  Play,
  RefreshCw,
  RotateCcw,
  TerminalSquare,
  Trophy,
  Zap,
} from 'lucide-react'
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type AnchorHTMLAttributes,
  type Dispatch,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type SetStateAction,
} from 'react'
import { loadGuidedProject } from './data/project-registry'
import type { GuidedProject, GuidedProjectCheckpoint } from './data/project-types'
import { trackById } from './data/curriculum'
import { orderedChoices } from './lib/choice-order'
import { evaluateExercise } from './lib/evaluator'
import {
  loadProjectDraft,
  resetProjectDraft,
  saveProjectDraft,
} from './lib/project-drafts'
import {
  loadProjectHistory,
  recordProjectCheck,
  type ProjectCheckSummary,
} from './lib/project-history'
import {
  completeProject,
  completeProjectCheckpoint,
  recordAttempt,
} from './lib/progress'
import { coursePath, portfolioPath, projectPath } from './lib/routes'
import { runExercise, type RunnerClientStatus } from './lib/runner-client'
import type { RunnerResult } from './lib/runner-contract'
import type { EvaluationResult, LearnerProgress } from './types'
import type { LanguageId } from './types'

interface ProjectStudioProps {
  checkpointId?: string
  language: LanguageId
  onNavigate: (path: string) => void
  onProgress: Dispatch<SetStateAction<LearnerProgress>>
  progress: LearnerProgress
  projectId: string
}

interface ProjectContentProps extends Omit<ProjectStudioProps, 'checkpointId' | 'language' | 'projectId'> {
  project: GuidedProject
}

interface StudioLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  onNavigate: (path: string) => void
  to: string
}

function StudioLink({ children, onClick, onNavigate, target, to, ...props }: StudioLinkProps) {
  const follow = (event: ReactMouseEvent<HTMLAnchorElement>) => {
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
    onNavigate(to)
  }
  return <a {...props} href={to} onClick={follow} target={target}>{children}</a>
}

function projectUnlocked(progress: LearnerProgress, project: GuidedProject): boolean {
  return trackById(project.language).missions.every((mission) => progress.completedMissions.includes(mission.id))
}

function checkpointAvailable(
  project: GuidedProject,
  checkpoint: GuidedProjectCheckpoint,
  completedCheckpointIds: string[],
): boolean {
  if (checkpoint.order === 1) return true
  const previous = project.checkpoints[checkpoint.order - 2]
  return Boolean(previous && completedCheckpointIds.includes(previous.id))
}

function nextProjectCheckpoint(project: GuidedProject, progress: LearnerProgress): GuidedProjectCheckpoint {
  return project.checkpoints.find((checkpoint) => (
    !progress.completedProjectCheckpoints.includes(checkpoint.id)
  )) ?? project.checkpoints[0]
}

function scaffoldingLabel(value: GuidedProjectCheckpoint['scaffolding']): string {
  if (value === 'guided') return 'Guided'
  if (value === 'supported') return 'Some support'
  return 'Independent'
}

function downloadSource(project: GuidedProject, source: string) {
  const type = {
    cpp: 'text/x-c++src;charset=utf-8',
    csharp: 'text/x-csharp;charset=utf-8',
    java: 'text/x-java-source;charset=utf-8',
    python: 'text/x-python;charset=utf-8',
  }[project.language]
  const url = URL.createObjectURL(new Blob([`${source.trimEnd()}\n`], { type }))
  const link = document.createElement('a')
  link.href = url
  link.download = project.downloadFileName
  document.body.append(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
}

function ProjectOverview({ onNavigate, progress, project }: Pick<ProjectContentProps, 'onNavigate' | 'progress' | 'project'>) {
  const unlocked = projectUnlocked(progress, project)
  const completedCount = project.checkpoints.filter((checkpoint) => (
    progress.completedProjectCheckpoints.includes(checkpoint.id)
  )).length
  const completed = progress.completedProjects.includes(project.id)
  const nextCheckpoint = nextProjectCheckpoint(project, progress)
  const finalCheckpoint = project.checkpoints.at(-1)
  const finalDraft = finalCheckpoint ? loadProjectDraft(project.id, finalCheckpoint.id) : null
  const percent = Math.round((completedCount / project.checkpoints.length) * 100)

  return (
    <main className="project-overview workshop-page">
      <StudioLink className="back-link" onNavigate={onNavigate} to={coursePath(project.language)}>
        <ArrowLeft size={16} /> {trackById(project.language).shortName} Foundations
      </StudioLink>

      <header className="project-overview__hero">
        <div className="project-overview__mark">
          {project.language === 'cpp'
            ? <Eye aria-hidden="true" />
            : project.language === 'csharp'
              ? <Hash aria-hidden="true" />
              : project.language === 'java'
                ? <Coffee aria-hidden="true" />
                : <Code2 aria-hidden="true" />}
        </div>
        <div>
          <p className="eyebrow">{project.studioLabel}</p>
          <h1>{project.title}</h1>
          <p>{project.subtitle}</p>
          <div className="project-overview__facts">
            <span><Clock3 size={15} /> {project.duration}</span>
            <span><BookOpen size={15} /> {project.checkpoints.length} checkpoints</span>
            <span><Eye size={15} /> {project.sourcePrivacyLabel}</span>
          </div>
        </div>
        <div className="project-overview__action">
          <strong>{completedCount} of {project.checkpoints.length} checkpoints complete</strong>
          <small>{percent}% of project</small>
          <span
            aria-label="Project progress"
            aria-valuemax={100}
            aria-valuemin={0}
            aria-valuenow={percent}
            aria-valuetext={`${completedCount} of ${project.checkpoints.length} checkpoints complete`}
            role="progressbar"
          >
            <i style={{ width: `${percent}%` }} />
          </span>
          {unlocked ? (
            <StudioLink
              className="primary-action"
              onNavigate={onNavigate}
              to={projectPath(project.language, project.id, nextCheckpoint.id)}
            >
              {completed ? 'Review project' : completedCount > 0 ? 'Continue project' : 'Start project'} <ArrowRight size={17} />
            </StudioLink>
          ) : (
            <StudioLink className="primary-action" onNavigate={onNavigate} to={coursePath(project.language)}>
              Continue {trackById(project.language).shortName} Foundations <ArrowRight size={17} />
            </StudioLink>
          )}
          {completed && finalDraft && (
            <button className="secondary-action" onClick={() => downloadSource(project, finalDraft)} type="button">
              <Download size={16} /> Download {project.downloadFileName}
            </button>
          )}
          {completed && (
            <StudioLink
              className="secondary-action"
              onNavigate={onNavigate}
              to={portfolioPath(project.language, project.id)}
            >
              <FileCode2 size={16} /> Prepare portfolio page
            </StudioLink>
          )}
        </div>
      </header>

      {!unlocked && (
        <section className="project-prerequisite" aria-labelledby="project-prerequisite-title">
          <LockKeyhole aria-hidden="true" />
          <div>
            <p className="eyebrow">One foundation first</p>
            <h2 id="project-prerequisite-title">{project.prerequisiteTitle}</h2>
            <p>{project.prerequisiteDescription}</p>
          </div>
        </section>
      )}

      <div className="project-overview__body">
        <section aria-labelledby="project-outcome-title" className="project-outcome">
          <p className="eyebrow">What you will make</p>
          <h2 id="project-outcome-title">{project.overviewTitle}</h2>
          <p>{project.description}</p>
          <ol>
            {project.overviewSteps.map((step) => (
              <li key={step.title}><b>{step.title}</b><span>{step.description}</span></li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="project-checkpoints-title" className="project-checkpoint-list">
          <div className="section-heading-open">
            <div><p className="eyebrow">Project plan</p><h2 id="project-checkpoints-title">Twelve small checkpoints</h2></div>
            <p>Each checkpoint introduces its words before asking you to use them.</p>
          </div>
          <ol>
            {project.checkpoints.map((checkpoint) => {
              const done = progress.completedProjectCheckpoints.includes(checkpoint.id)
              const available = unlocked && checkpointAvailable(project, checkpoint, progress.completedProjectCheckpoints)
              const body = (
                <>
                  <span className="project-checkpoint-list__number" aria-hidden="true">
                    {done ? <Check size={16} /> : available ? checkpoint.order : <LockKeyhole size={14} />}
                  </span>
                  <span><small>{scaffoldingLabel(checkpoint.scaffolding)}</small><b>{checkpoint.title}</b><p>{checkpoint.objective}</p></span>
                  <strong>{done ? 'Completed' : available ? 'Open' : 'Locked'} {available && <ArrowRight size={15} />}</strong>
                </>
              )
              return (
                <li className={done ? 'is-complete' : ''} key={checkpoint.id}>
                  {available ? (
                    <StudioLink onNavigate={onNavigate} to={projectPath(project.language, project.id, checkpoint.id)}>
                      {body}
                    </StudioLink>
                  ) : <div>{body}</div>}
                </li>
              )
            })}
          </ol>
        </section>
      </div>
    </main>
  )
}

interface CheckpointWorkspaceProps extends ProjectContentProps {
  checkpoint: GuidedProjectCheckpoint
}

function CheckpointWorkspace({ checkpoint, onNavigate, onProgress, progress, project }: CheckpointWorkspaceProps) {
  const exercise = checkpoint.exercise
  const editable = exercise.type === 'code' || exercise.type === 'bugfix'
  const choices = useMemo(() => orderedChoices(exercise), [exercise])
  const initialAnswer = editable
    ? loadProjectDraft(project.id, checkpoint.id) ?? exercise.starterCode ?? ''
    : ''
  const [answer, setAnswer] = useState(initialAnswer)
  const [practiceInput, setPracticeInput] = useState(checkpoint.practiceStdin ?? '')
  const [feedback, setFeedback] = useState<EvaluationResult | null>(null)
  const [runnerResult, setRunnerResult] = useState<RunnerResult | null>(null)
  const [runnerStatus, setRunnerStatus] = useState<RunnerClientStatus | null>(null)
  const [runnerBusy, setRunnerBusy] = useState(false)
  const [runnerPurpose, setRunnerPurpose] = useState<'run' | 'check' | null>(null)
  const [runnerAnnouncement, setRunnerAnnouncement] = useState('')
  const [history, setHistory] = useState<ProjectCheckSummary[]>(() => loadProjectHistory(project.id))
  const failedRecorded = useRef(false)
  const runnerRequestIdRef = useRef(0)
  const stepperRef = useRef<HTMLElement>(null)
  const alreadyComplete = progress.completedProjectCheckpoints.includes(checkpoint.id)
  const finalCheckpoint = checkpoint.order === project.checkpoints.length
  const nextCheckpoint = project.checkpoints[checkpoint.order]
  const completedCheckpointCount = project.checkpoints.filter((item) => (
    progress.completedProjectCheckpoints.includes(item.id)
  )).length
  const completionPercent = Math.round((completedCheckpointCount / project.checkpoints.length) * 100)

  useEffect(() => {
    const currentStep = stepperRef.current?.querySelector<HTMLElement>('[aria-current="step"]')
    if (typeof currentStep?.scrollIntoView === 'function') {
      currentStep.scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'center' })
    }
  }, [checkpoint.id])

  useLayoutEffect(() => () => {
    runnerRequestIdRef.current += 1
  }, [])

  const updateAnswer = (value: string) => {
    setAnswer(value)
    if (editable) saveProjectDraft(project.id, checkpoint.id, value)
    if (feedback && !feedback.correct) setFeedback(null)
    setRunnerResult(null)
    setRunnerPurpose(null)
    setRunnerAnnouncement('')
  }

  const recordFailure = () => {
    if (failedRecorded.current || alreadyComplete) return
    failedRecorded.current = true
    onProgress((current) => recordAttempt(current, exercise.conceptId, false, 0))
  }

  const awardCheckpoint = () => {
    onProgress((current) => {
      let next = completeProjectCheckpoint(current, project.id, checkpoint.id)
      if (finalCheckpoint) next = completeProject(next, project.id)
      return next
    })
  }

  const checkCheckpoint = async () => {
    if (runnerBusy) return
    if (!editable) {
      const local = evaluateExercise(exercise, answer)
      setFeedback(local)
      if (local.correct) awardCheckpoint()
      else recordFailure()
      return
    }

    const local = evaluateExercise(exercise, answer)
    if (!local.correct || answer.includes('_____')) {
      setFeedback(local)
      recordFailure()
      return
    }

    const requestId = runnerRequestIdRef.current + 1
    runnerRequestIdRef.current = requestId
    const isCurrentRunnerRequest = () => runnerRequestIdRef.current === requestId
    setRunnerBusy(true)
    setRunnerPurpose('check')
    setRunnerResult(null)
    setRunnerAnnouncement('Preparing the official checkpoint check.')
    try {
      const result = await runExercise(
        exercise.id,
        project.language,
        answer,
        (status) => {
          if (isCurrentRunnerRequest()) setRunnerStatus(status)
        },
        { purpose: 'check' },
      )
      if (!isCurrentRunnerRequest()) return
      setRunnerResult(result)
      const passed = result.outcome === 'completed'
        && result.tests.length > 0
        && result.tests.every((test) => test.passed)
      const summary: ProjectCheckSummary = {
        checkpointId: checkpoint.id,
        checkedAt: new Date().toISOString(),
        passed,
        passedChecks: result.tests.filter((test) => test.passed).length,
        totalChecks: Math.max(1, result.tests.length),
      }
      if (result.outcome !== 'system_error') {
        recordProjectCheck(project.id, summary)
        setHistory(loadProjectHistory(project.id))
      }
      const failedCheck = result.tests.find((test) => !test.passed)
      setFeedback({
        correct: passed,
        message: passed
          ? exercise.recap
          : failedCheck?.message
            ?? `${result.diagnostic.explanation} ${result.diagnostic.suggestion}`,
        output: result.stdout,
      })
      setRunnerAnnouncement(result.outcome === 'system_error'
        ? 'The official checkpoint check could not finish. Your progress was not changed.'
        : 'Official checkpoint check complete. Results are available below.')
      if (passed) awardCheckpoint()
      else if (result.outcome !== 'system_error') recordFailure()
    } catch (error) {
      if (!isCurrentRunnerRequest()) return
      setFeedback({
        correct: false,
        message: error instanceof Error
          ? error.message
          : 'The isolated runner could not be reached. Your code was not marked wrong.',
      })
      setRunnerAnnouncement('The official checkpoint check could not finish. Your progress was not changed.')
    } finally {
      if (isCurrentRunnerRequest()) {
        setRunnerBusy(false)
        setRunnerStatus(null)
      }
    }
  }

  const runPractice = async () => {
    if (runnerBusy) return
    if (!editable || !answer.trim()) {
      setFeedback({ correct: false, message: 'The editor is empty. Add an instruction before running the program.' })
      return
    }
    const requestId = runnerRequestIdRef.current + 1
    runnerRequestIdRef.current = requestId
    const isCurrentRunnerRequest = () => runnerRequestIdRef.current === requestId
    setRunnerBusy(true)
    setRunnerPurpose('run')
    setRunnerResult(null)
    setFeedback(null)
    setRunnerAnnouncement('Preparing a practice run.')
    try {
      const result = await runExercise(
        exercise.id,
        project.language,
        answer,
        (status) => {
          if (isCurrentRunnerRequest()) setRunnerStatus(status)
        },
        { purpose: 'run', stdin: practiceInput },
      )
      if (!isCurrentRunnerRequest()) return
      setRunnerResult(result)
      setRunnerAnnouncement('Practice run complete. Output is available in the program console.')
    } catch (error) {
      if (!isCurrentRunnerRequest()) return
      setFeedback({
        correct: false,
        message: error instanceof Error
          ? error.message
          : 'The practice run could not start. Your checkpoint progress was not changed.',
      })
      setRunnerAnnouncement('The practice run could not finish. Your checkpoint progress was not changed.')
    } finally {
      if (isCurrentRunnerRequest()) {
        setRunnerBusy(false)
        setRunnerStatus(null)
      }
    }
  }

  const resetDraft = () => {
    if (!window.confirm('Reset only this checkpoint to its starting code? Other project drafts and completed checkpoints will stay unchanged.')) return
    runnerRequestIdRef.current += 1
    resetProjectDraft(project.id, checkpoint.id)
    setAnswer(exercise.starterCode ?? '')
    setFeedback(null)
    setRunnerBusy(false)
    setRunnerStatus(null)
    setRunnerResult(null)
    setRunnerPurpose(null)
    setRunnerAnnouncement('Checkpoint reset. Any earlier runner result will be ignored.')
  }

  const continueProject = () => {
    if (nextCheckpoint) {
      onNavigate(projectPath(project.language, project.id, nextCheckpoint.id))
      return
    }
    onNavigate(projectPath(project.language, project.id))
  }

  const handleEditorKeyDown = (event: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Enter' || (!event.ctrlKey && !event.metaKey)) return
    event.preventDefault()
    void checkCheckpoint()
  }

  return (
    <main className="project-workspace">
      <header className="project-workspace__header">
        <StudioLink aria-label="Back to project overview" className="icon-button" onNavigate={onNavigate} to={projectPath(project.language, project.id)}>
          <ArrowLeft />
        </StudioLink>
        <div>
          <small>{project.studioLabel}</small>
          <b>{project.title}</b>
        </div>
        <div className="project-workspace__completion">
          <span
            aria-label="Project completion"
            aria-valuemax={100}
            aria-valuemin={0}
            aria-valuenow={completionPercent}
            aria-valuetext={`${completedCheckpointCount} of ${project.checkpoints.length} checkpoints complete`}
            className="project-workspace__progress"
            role="progressbar"
          >
            <i style={{ width: `${completionPercent}%` }} />
          </span>
          <small>{completedCheckpointCount} of {project.checkpoints.length} complete</small>
        </div>
        <strong>Checkpoint {checkpoint.order} of {project.checkpoints.length}</strong>
        <span><Zap size={15} /> {checkpoint.exercise.xp} XP</span>
      </header>

      <nav aria-label="Project checkpoints" className="project-stepper" ref={stepperRef}>
        <ol>
          {project.checkpoints.map((step) => {
            const done = progress.completedProjectCheckpoints.includes(step.id)
            const current = step.id === checkpoint.id
            const available = checkpointAvailable(project, step, progress.completedProjectCheckpoints) || done
            return (
              <li key={step.id}>
                {available ? (
                  <StudioLink
                    aria-current={current ? 'step' : undefined}
                    aria-label={`Checkpoint ${step.order}: ${step.title}. ${current ? 'Current checkpoint, ' : ''}${done ? 'complete' : 'not complete'}.`}
                    className={`${current ? 'is-current' : ''} ${done ? 'is-complete' : ''}`}
                    onNavigate={onNavigate}
                    to={projectPath(project.language, project.id, step.id)}
                  >
                    {done ? <Check size={13} /> : step.order}
                  </StudioLink>
                ) : (
                  <span>
                    <LockKeyhole aria-hidden="true" size={12} />
                    <span className="sr-only">Checkpoint {step.order}: {step.title}. Locked.</span>
                  </span>
                )}
              </li>
            )
          })}
        </ol>
      </nav>

      <div className="project-workspace__layout">
        <section className="project-briefing">
          <p className="kicker">Checkpoint {checkpoint.order} · {scaffoldingLabel(checkpoint.scaffolding)}</p>
          <h1>{checkpoint.title}</h1>
          <p className="project-objective">{checkpoint.objective}</p>

          {checkpoint.newTerms.length > 0 && (
            <section className="project-terms" aria-labelledby="project-terms-title">
              <p className="eyebrow">Words before code</p>
              <h2 id="project-terms-title">Nothing hidden behind jargon</h2>
              <dl>
                {checkpoint.newTerms.map((item) => (
                  <div key={item.term}><dt>{item.term}</dt><dd>{item.meaning}</dd></div>
                ))}
              </dl>
            </section>
          )}

          <section className="project-explanation" aria-labelledby="project-explanation-title">
            <p className="eyebrow">What is happening</p>
            <h2 id="project-explanation-title">{exercise.title}</h2>
            <p>{exercise.explanation}</p>
            <div><CircleHelp size={19} /><p><b>A useful comparison</b>{exercise.analogy}</p></div>
          </section>

          {checkpoint.requirements && (
            <section className="project-requirements" aria-labelledby="project-requirements-title">
              <p className="eyebrow">Plain-language requirements</p>
              <h2 id="project-requirements-title">Build one piece at a time</h2>
              <ol>{checkpoint.requirements.map((requirement) => <li key={requirement}>{requirement}</li>)}</ol>
            </section>
          )}
        </section>

        <section className="project-task" aria-labelledby="project-task-title">
          <header>
            <div><p className="eyebrow">Your checkpoint</p><h2 id="project-task-title">{exercise.prompt}</h2></div>
            <span>{alreadyComplete ? <><Check size={14} /> Complete</> : <><Trophy size={14} /> {exercise.xp} XP</>}</span>
          </header>

          <div className="project-one-job">
            <CheckCircle2 size={19} />
            <div><small>Your one job</small><p>{exercise.focus ?? exercise.prompt}</p></div>
          </div>

          {(exercise.type === 'choice' || exercise.type === 'prediction') ? (
            <div className="project-guided-answer">
              {exercise.displayCode && <pre aria-label="Code to predict"><code>{exercise.displayCode}</code></pre>}
              <fieldset className="choice-list">
                <legend className="sr-only">{exercise.prompt}</legend>
                {choices.map((choice, index) => (
                  <label className={answer === choice.id ? 'is-selected' : ''} key={choice.id}>
                    <input
                      checked={answer === choice.id}
                      className="sr-only"
                      disabled={feedback?.correct}
                      name={`project-answer-${exercise.id}`}
                      onChange={() => updateAnswer(choice.id)}
                      type="radio"
                    />
                    <span aria-hidden="true">{String.fromCharCode(65 + index)}</span>
                    <div><b>{choice.label}</b><small>{choice.detail}</small></div>
                    <i aria-hidden="true">{answer === choice.id && <Check size={16} />}</i>
                  </label>
                ))}
              </fieldset>
            </div>
          ) : (
            <>
              <div className="project-code-guide">
                <div><BookOpen size={16} /><b>Read each symbol before editing</b></div>
                <dl>
                  {exercise.codeGuide?.map((item) => (
                    <div key={`${checkpoint.id}-${item.code}`}><dt><code>{item.code}</code></dt><dd>{item.plain}</dd></div>
                  ))}
                </dl>
              </div>

              <div aria-busy={runnerBusy} className="project-code-workspace">
                <div className="project-editor-bar"><span><Code2 size={15} /> {project.downloadFileName}</span><small>Saved in this browser</small></div>
                <textarea
                  aria-keyshortcuts="Control+Enter Meta+Enter"
                  aria-label="Project code editor"
                  onChange={(event) => updateAnswer(event.target.value)}
                  onKeyDown={handleEditorKeyDown}
                  readOnly={runnerBusy}
                  spellCheck={false}
                  value={answer}
                />
                {(checkpoint.practiceStdin !== undefined || finalCheckpoint) && (
                  <label className="project-input">
                    <span>
                      <TerminalSquare size={15} />
                      <b>Practice input</b>
                      <small id={`project-input-help-${checkpoint.id}`}>One answer per line. Run uses this box; Check uses protected server examples.</small>
                    </span>
                    <textarea
                      aria-label="Practice program input"
                      aria-describedby={`project-input-help-${checkpoint.id}`}
                      onChange={(event) => setPracticeInput(event.target.value)}
                      readOnly={runnerBusy}
                      spellCheck={false}
                      value={practiceInput}
                    />
                  </label>
                )}
                <section aria-busy={runnerBusy} className="project-console" aria-label="Program console">
                  <div><TerminalSquare size={15} /><b>{runnerPurpose === 'check' ? 'Official check console' : 'Practice console'}</b></div>
                  <pre>{runnerBusy
                    ? runnerStatus === 'running' ? 'Running inside a fresh isolated sandbox...' : 'Preparing a fresh isolated sandbox...'
                    : runnerResult
                      ? runnerResult.stdout
                        || (runnerResult.outcome === 'completed'
                          ? '(The program finished without displaying text.)'
                          : 'The program stopped before it produced ordinary console output. Read the friendly explanation below.')
                      : 'Nothing has run yet. Use Run to experiment, or Check checkpoint when you are ready.'}</pre>
                </section>
                {runnerResult && runnerResult.outcome !== 'completed' && (
                  <section aria-label="Friendly language diagnostic" className="runner-report project-run-report">
                    <div className="runner-report__summary">
                      <span className="is-alert">{runnerResult.diagnostic.title}</span>
                      <small>{runnerResult.diagnostic.line
                        ? `Look near line ${runnerResult.diagnostic.line}`
                        : `${runnerResult.durationMs} ms in a fresh sandbox`}</small>
                    </div>
                    <div className="project-run-report__guidance">
                      <p>{runnerResult.diagnostic.explanation}</p>
                      <p><b>Try next:</b> {runnerResult.diagnostic.suggestion}</p>
                    </div>
                    {runnerResult.stderr && (
                      <details>
                        <summary>Show the language's exact message</summary>
                        <pre>{runnerResult.stderr}</pre>
                      </details>
                    )}
                  </section>
                )}
              </div>

              <div className="project-run-actions">
                <button aria-disabled={runnerBusy} className="secondary-action" onClick={() => { void runPractice() }} type="button">
                  <Play size={16} /> Run
                </button>
                <button className="secondary-action" onClick={resetDraft} type="button">
                  <RefreshCw size={16} /> Reset checkpoint
                </button>
                <button className="secondary-action" disabled={!answer.trim()} onClick={() => downloadSource(project, answer)} type="button">
                  <Download size={16} /> Download {project.downloadFileName.slice(project.downloadFileName.lastIndexOf('.'))}
                </button>
              </div>
            </>
          )}

          {runnerResult && runnerPurpose === 'check' && (
            <section className="project-check-report" aria-label="Checkpoint test report">
              <div><b>{runnerResult.tests.filter((test) => test.passed).length} of {runnerResult.tests.length} checks passed</b><small>Only summaries are kept in this browser. Source and console output are not added to history.</small></div>
              <ol>
                {runnerResult.tests.map((test) => (
                  <li className={test.passed ? 'is-passed' : ''} key={`${runnerResult.runId}-${test.name}`}>
                    {test.passed ? <Check size={15} /> : <Circle size={15} />}
                    <span><b>{test.name}</b><small>{test.message}</small></span>
                    <i>{test.visibility}</i>
                  </li>
                ))}
              </ol>
            </section>
          )}

          <details className="project-hint">
            <summary><CircleHelp size={17} /> I need a hint</summary>
            <p>{exercise.hint}</p>
          </details>

          {feedback && (
            <section aria-live="polite" className={`feedback-box ${feedback.correct ? 'is-correct' : 'is-wrong'}`} role="status">
              {feedback.correct ? <CheckCircle2 /> : <CircleHelp />}
              <div><b>{feedback.correct ? 'Checkpoint complete' : 'Let’s inspect that'}</b><p>{feedback.message}</p></div>
            </section>
          )}

          <p aria-live="polite" className="sr-only" role="status">{runnerAnnouncement}</p>

          <div className="project-submit-row">
            {feedback?.correct ? (
              <button className="primary-action" onClick={continueProject} type="button">
                {nextCheckpoint ? 'Continue to next checkpoint' : 'Finish project'} <ArrowRight size={17} />
              </button>
            ) : (
              <button aria-disabled={runnerBusy} className="primary-action" onClick={() => { void checkCheckpoint() }} type="button">
                {runnerBusy ? 'Checking safely...' : editable ? 'Check checkpoint' : 'Check answer'} <ArrowRight size={17} />
              </button>
            )}
          </div>

          {history.length > 0 && (
            <details className="project-history">
              <summary><RotateCcw size={16} /> Recent official checks</summary>
              <ol>
                {history.slice(0, 5).map((entry, index) => (
                  <li key={`${entry.checkedAt}-${entry.checkpointId}-${index}`}>
                    <span>{entry.passed ? <Check size={14} /> : <Circle size={14} />}{entry.checkpointId.replace(/^project-(?:py|cpp)-/u, '')}</span>
                    <b>{entry.passedChecks} / {entry.totalChecks}</b>
                    <time dateTime={entry.checkedAt}>{new Date(entry.checkedAt).toLocaleString()}</time>
                  </li>
                ))}
              </ol>
            </details>
          )}
        </section>
      </div>
    </main>
  )
}

export function ProjectStudio({ checkpointId, language, onNavigate, onProgress, progress, projectId }: ProjectStudioProps) {
  const projectKey = `${language}:${projectId}`
  const [loadedProject, setLoadedProject] = useState<{
    failed: boolean
    key: string
    project: GuidedProject | null
  } | null>(null)
  const [loadAttempt, setLoadAttempt] = useState(0)
  const project = loadedProject?.key === projectKey ? loadedProject.project : null
  const loadFailed = loadedProject?.key === projectKey && loadedProject.failed

  useEffect(() => {
    let current = true
    void loadGuidedProject(language, projectId).then((loaded) => {
      if (current) setLoadedProject({ failed: false, key: `${language}:${projectId}`, project: loaded ?? null })
    }).catch(() => {
      if (current) setLoadedProject({ failed: true, key: `${language}:${projectId}`, project: null })
    })
    return () => {
      current = false
    }
  }, [language, loadAttempt, projectId])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const heading = document.getElementById('main-content')?.querySelector<HTMLElement>('h1')
      if (!heading) return
      heading.tabIndex = -1
      heading.focus({ preventScroll: true })
    }, 0)
    return () => window.clearTimeout(timer)
  }, [checkpointId, project])

  if (loadFailed) {
    return (
      <main className="content-page">
        <section className="route-message-card route-message-card--inside" role="alert">
          <p className="kicker"><CircleHelp size={15} /> Project studio</p>
          <h1>The project notes did not finish loading</h1>
          <p>Your saved progress and code are still in this browser. Check the connection, then try opening the project again.</p>
          <div className="route-message-actions">
            <button className="primary-action" onClick={() => setLoadAttempt((attempt) => attempt + 1)} type="button">
              Try again <RefreshCw size={16} />
            </button>
            <StudioLink className="secondary-action" onNavigate={onNavigate} to={coursePath(language)}>
              Back to {trackById(language).shortName} Foundations
            </StudioLink>
          </div>
        </section>
      </main>
    )
  }

  if (!project) {
    return (
      <main aria-busy="true" className="content-page">
        <section className="route-message-card route-message-card--inside">
          <p className="kicker"><Code2 size={15} /> Project studio</p>
          <h1>Opening your project</h1>
          <p>Loading the lesson notes, editor, and your browser-saved draft.</p>
        </section>
      </main>
    )
  }
  if (!checkpointId) return <ProjectOverview onNavigate={onNavigate} progress={progress} project={project} />
  const checkpoint = project.checkpoints.find((item) => item.id === checkpointId)
  if (!checkpoint) return null
  const unlocked = projectUnlocked(progress, project)
  const available = checkpointAvailable(project, checkpoint, progress.completedProjectCheckpoints)
    || progress.completedProjectCheckpoints.includes(checkpoint.id)

  if (!unlocked || !available) return <ProjectOverview onNavigate={onNavigate} progress={progress} project={project} />
  return (
    <CheckpointWorkspace
      checkpoint={checkpoint}
      key={checkpoint.id}
      onNavigate={onNavigate}
      onProgress={onProgress}
      progress={progress}
      project={project}
    />
  )
}
