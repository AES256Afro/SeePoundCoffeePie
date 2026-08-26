import {
  lazy,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type AnchorHTMLAttributes,
  type Dispatch,
  type MouseEvent,
  type SetStateAction,
} from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  LockKeyhole,
} from 'lucide-react'
import { pythonDataToolsCourse } from './data/python-data-tools-course'
import {
  courseDefinition,
  courseIsAvailable,
  missingCoursePrerequisites,
} from './data/course-registry'
import { completeMission } from './lib/progress'
import { coursePath, coursesPath, lessonPath } from './lib/routes'
import type { LearnerProgress, Mission } from './types'
import './python-data-tools.css'

const LessonPlayer = lazy(async () => {
  const module = await import('./LessonPlayer')
  return { default: module.LessonPlayer }
})

interface NavigateLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  onNavigate: (path: string) => void
  to: string
}

function NavigateLink({ children, onNavigate, onClick, to, ...props }: NavigateLinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event)
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    onNavigate(to)
  }
  return <a {...props} href={to} onClick={handleClick}>{children}</a>
}

function percent(completed: number, total: number): number {
  return total > 0 ? Math.round((completed / total) * 100) : 0
}

function exerciseLabel(type: Mission['exercises'][number]['type']): string {
  if (type === 'bugfix') return 'Debugging'
  if (type === 'choice') return 'Guided check'
  if (type === 'prediction') return 'Prediction'
  if (type === 'ordering') return 'Ordering'
  return 'Code exercise'
}

function LoadingLesson() {
  return (
    <div className="lesson-overlay">
      <main className="route-message-page" aria-busy="true" id="main-content" tabIndex={-1}>
        <section className="route-message-card">
          <p className="kicker"><BookOpen size={15} /> Practical Python</p>
          <h1>Opening your lesson</h1>
          <p>Loading the explanation, exercise, and code workspace.</p>
        </section>
      </main>
    </div>
  )
}

interface CoursePageProps {
  onNavigate: (path: string) => void
  onProgress: Dispatch<SetStateAction<LearnerProgress>>
  progress: LearnerProgress
}

export function PythonDataToolsCoursePage({ onNavigate, onProgress, progress }: CoursePageProps) {
  const definition = courseDefinition('python-data-tools')
  const prerequisiteReady = courseIsAvailable(definition.id, progress)
  const missing = missingCoursePrerequisites(definition.id, progress)
  const completedMissions = new Set(progress.completedMissions)
  const completedLessons = new Set(progress.completedLessons)
  const completedModuleCount = definition.missionIds.filter((id) => completedMissions.has(id)).length
  const completedLessonCount = definition.lessonIds.filter((id) => completedLessons.has(id)).length
  const courseComplete = completedModuleCount === definition.missionIds.length
  const hasActivity = completedModuleCount > 0 || completedLessonCount > 0
  const currentModuleIndex = courseComplete
    ? -1
    : pythonDataToolsCourse.missions.findIndex((mission) => !completedMissions.has(mission.id))
  const currentModule = pythonDataToolsCourse.missions[currentModuleIndex]
  const currentLesson = currentModule?.exercises.find((exercise) => !completedLessons.has(exercise.id))
    ?? currentModule?.exercises.at(-1)
  const [expandedModule, setExpandedModule] = useState(currentModule?.id ?? pythonDataToolsCourse.missions[0]?.id ?? '')
  const [completionNotice, setCompletionNotice] = useState('')
  const [focusModuleId, setFocusModuleId] = useState<string | null>(null)
  const moduleSummaryRefs = useRef(new Map<string, HTMLButtonElement>())
  const continueTo = currentModule && currentLesson
    ? lessonPath(definition.id, currentModule.id, currentLesson.id)
    : coursePath(definition.id)

  useEffect(() => {
    document.title = `${definition.title} | SeePoundCoffeePie`
  }, [definition.title])

  useEffect(() => {
    if (!focusModuleId) return
    const timer = window.setTimeout(() => {
      moduleSummaryRefs.current.get(focusModuleId)?.focus({ preventScroll: true })
      setFocusModuleId(null)
    }, 0)
    return () => window.clearTimeout(timer)
  }, [focusModuleId])

  const finishModule = (missionId: string) => {
    const index = pythonDataToolsCourse.missions.findIndex((mission) => mission.id === missionId)
    const next = pythonDataToolsCourse.missions[index + 1]
    const focusTarget = next ?? pythonDataToolsCourse.missions[index]
    setExpandedModule(focusTarget?.id ?? '')
    setFocusModuleId(focusTarget?.id ?? null)
    setCompletionNotice(next
      ? `Module completed. 25 star shards saved. Module ${index + 2} is now available.`
      : 'Course completed. 25 star shards saved. Your Supply Tracker is ready to review.')
    onProgress((current) => completeMission(current, missionId))
  }

  return (
    <main className="workshop-page course-outline">
      <NavigateLink className="back-link" onNavigate={onNavigate} to={coursesPath()}><ArrowLeft size={16} /> All courses</NavigateLink>
      <header className="course-hero course-hero--python course-hero--continuing">
        <span aria-label="Python" className="language-symbol language-symbol--python language-symbol--large">π</span>
        <div>
          <p className="eyebrow">Next-step Python course</p>
          <h1>{definition.title}</h1>
          <p>{definition.description}</p>
          <span>{definition.missionIds.length} modules · {definition.lessonIds.length} short lessons · {definition.level}</span>
        </div>
        <div className="course-hero__action">
          <b>{completedLessonCount} of {definition.lessonIds.length} lessons complete</b>
          <small>{percent(completedLessonCount, definition.lessonIds.length)}% of course</small>
          <i aria-label={`${definition.title} progress`} aria-valuemax={100} aria-valuemin={0} aria-valuenow={percent(completedLessonCount, definition.lessonIds.length)} role="progressbar"><span style={{ width: `${percent(completedLessonCount, definition.lessonIds.length)}%` }} /></i>
          {prerequisiteReady ? (
            <NavigateLink className="primary-action" onNavigate={onNavigate} to={continueTo}>
              {courseComplete ? 'Review course' : hasActivity ? 'Continue course' : 'Start course'} <ArrowRight size={17} />
            </NavigateLink>
          ) : <span className="course-locked-label"><LockKeyhole size={15} /> Finish both prerequisites to start</span>}
        </div>
      </header>

      {!prerequisiteReady && (
        <section className="course-prerequisites" aria-labelledby="data-tools-prerequisites">
          <div><p className="eyebrow">Before you begin</p><h2 id="data-tools-prerequisites">Two earlier steps make this course feel gentle</h2><p>You can preview every module now. Lessons unlock after both steps are complete.</p></div>
          <ol>
            {definition.prerequisites.map((prerequisite) => {
              const incomplete = missing.some((item) => item.kind === prerequisite.kind && item.id === prerequisite.id)
              const path = prerequisite.kind === 'course' ? coursePath(prerequisite.id) : prerequisite.path
              return <li className={incomplete ? '' : 'is-complete'} key={`${prerequisite.kind}:${prerequisite.id}`}><span>{incomplete ? <LockKeyhole size={15} /> : <Check size={15} />}</span><b>{prerequisite.label}</b><NavigateLink onNavigate={onNavigate} to={path}>{incomplete ? 'Open step' : 'Review'} <ArrowRight size={14} /></NavigateLink></li>
            })}
          </ol>
        </section>
      )}

      <section className="course-modules" aria-labelledby="data-tools-content-title">
        <div className="section-heading-open"><div><p className="eyebrow">Course outline</p><h2 id="data-tools-content-title">What you will learn</h2></div><p>Open a module to preview its five short lessons.</p></div>
        {completionNotice && <p className="module-completion-status" role="status">{completionNotice}</p>}
        {pythonDataToolsCourse.missions.map((mission, moduleIndex) => {
          const moduleComplete = completedMissions.has(mission.id)
          const previousComplete = moduleIndex === 0 || completedMissions.has(pythonDataToolsCourse.missions[moduleIndex - 1].id)
          const moduleAvailable = prerequisiteReady && previousComplete
          const moduleCompletedLessons = mission.exercises.filter((exercise) => completedLessons.has(exercise.id)).length
          const expanded = expandedModule === mission.id
          const current = moduleIndex === currentModuleIndex
          const readyToFinish = prerequisiteReady && moduleAvailable && !moduleComplete && moduleCompletedLessons === mission.exercises.length
          return (
            <article className={`module-row ${moduleComplete ? 'is-complete' : ''} ${current ? 'is-current' : ''}`} key={mission.id}>
              <button
                aria-controls={`module-${mission.id}-lessons`}
                aria-expanded={expanded}
                className="module-row__summary"
                onClick={() => setExpandedModule(expanded ? '' : mission.id)}
                ref={(node) => {
                  if (node) moduleSummaryRefs.current.set(mission.id, node)
                  else moduleSummaryRefs.current.delete(mission.id)
                }}
              >
                <span className="module-number">{moduleComplete ? <Check size={17} /> : moduleAvailable ? moduleIndex + 1 : <LockKeyhole size={15} />}</span>
                <span><small>{moduleIndex === 5 ? 'Guided capstone' : `Module ${moduleIndex + 1}`}</small><b>{definition.moduleTitles[moduleIndex]}</b><p>{mission.description}</p></span>
                <strong>{moduleCompletedLessons} of {mission.exercises.length} lessons complete</strong>
                <ChevronDown size={19} />
              </button>
              <div className="module-lessons" hidden={!expanded} id={`module-${mission.id}-lessons`}>
                {mission.exercises.map((exercise, lessonIndex) => {
                  const completed = completedLessons.has(exercise.id)
                  const canOpen = moduleAvailable
                  return canOpen ? (
                    <NavigateLink
                      aria-current={current && currentLesson?.id === exercise.id ? 'step' : undefined}
                      className={current && currentLesson?.id === exercise.id ? 'is-current' : ''}
                      key={exercise.id}
                      onNavigate={onNavigate}
                      to={lessonPath(definition.id, mission.id, exercise.id)}
                    >
                      <span>{completed ? <Check size={15} /> : lessonIndex + 1}</span><b>{exercise.title}</b><small>{completed ? 'Complete' : current && currentLesson?.id === exercise.id ? 'Next lesson' : 'Start lesson'} · {exerciseLabel(exercise.type)}</small><ArrowRight size={15} />
                    </NavigateLink>
                  ) : <div className="is-locked" key={exercise.id}><span><LockKeyhole size={13} /></span><b>{exercise.title}</b><small>{prerequisiteReady ? 'Complete the previous module first' : 'Complete both course prerequisites first'}</small></div>
                })}
              </div>
              {expanded && readyToFinish && <div className="module-finish-callout"><span><b>Every lesson is complete.</b><small>Finish this module to save the module reward and unlock what comes next.</small></span><button className="primary-action" onClick={() => finishModule(mission.id)}>Finish module <ArrowRight size={17} /></button></div>}
            </article>
          )
        })}
      </section>
    </main>
  )
}

interface LessonPageProps {
  exerciseId: string
  missionId: string
  onNavigate: (path: string) => void
  onProgress: Dispatch<SetStateAction<LearnerProgress>>
  progress: LearnerProgress
}

export function PythonDataToolsLessonPage({ exerciseId, missionId, onNavigate, onProgress, progress }: LessonPageProps) {
  const definition = courseDefinition('python-data-tools')
  const missionIndex = pythonDataToolsCourse.missions.findIndex((mission) => mission.id === missionId)
  const mission = pythonDataToolsCourse.missions[missionIndex]
  const exercise = mission?.exercises.find((candidate) => candidate.id === exerciseId)
  const prerequisiteReady = courseIsAvailable(definition.id, progress)
  const previousComplete = missionIndex === 0 || progress.completedMissions.includes(pythonDataToolsCourse.missions[missionIndex - 1]?.id)
  const available = Boolean(mission && exercise && prerequisiteReady && previousComplete)
  const missing = useMemo(() => missingCoursePrerequisites(definition.id, progress), [definition.id, progress])

  useEffect(() => {
    document.title = `${exercise?.title ?? definition.title} | SeePoundCoffeePie`
  }, [definition.title, exercise?.title])

  if (!mission || !exercise) {
    return <main className="route-message-page"><section className="route-message-card"><h1>Lesson not found</h1><NavigateLink className="primary-action" onNavigate={onNavigate} to={coursePath(definition.id)}>Return to the course</NavigateLink></section></main>
  }

  if (!available) {
    return (
      <main className="route-message-page" id="main-content" tabIndex={-1}>
        <section className="route-message-card">
          <p className="kicker"><LockKeyhole size={15} /> Lesson locked</p>
          <h1>{exercise.title} is still ahead</h1>
          <p>{!prerequisiteReady
            ? 'Complete Python Foundations and Your First Interactive Program before starting this course.'
            : `Complete ${pythonDataToolsCourse.missions[missionIndex - 1]?.title ?? 'the previous module'} first. Each module retrieves ideas that the next one uses.`}</p>
          {!prerequisiteReady && <ul className="locked-route-prerequisites">{missing.map((item) => (
            <li key={`${item.kind}:${item.id}`}>
              <NavigateLink onNavigate={onNavigate} to={item.kind === 'course' ? coursePath(item.id) : item.path}>{item.label}</NavigateLink>
            </li>
          ))}</ul>}
          <NavigateLink className="primary-action" onNavigate={onNavigate} to={coursePath(definition.id)}>Return to Practical Python</NavigateLink>
        </section>
      </main>
    )
  }

  return (
    <Suspense fallback={<LoadingLesson />}>
      <LessonPlayer
        initialExerciseId={exercise.id}
        key={`python-data-tools-${mission.id}`}
        mission={mission}
        onExerciseChange={(nextExerciseId) => onNavigate(lessonPath(definition.id, mission.id, nextExerciseId))}
        onExit={() => onNavigate(coursePath(definition.id))}
        onProgress={onProgress}
        progress={progress}
      />
    </Suspense>
  )
}
