import {
  lazy,
  Suspense,
  use,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  Coffee,
  Eye,
  LockKeyhole,
} from 'lucide-react'
import {
  courseDefinition,
  courseIsAvailable,
  missingCoursePrerequisites,
  type CourseDefinition,
} from './data/course-registry'
import {
  publishedContinuingCourseContentRequest,
  type ContinuingCourseContent,
} from './data/published-continuing-course-loaders'
import { completeMission } from './lib/progress'
import { lessonActivityLabel } from './lib/course-model'
import { coursePath, coursesPath, lessonPath } from './lib/routes'
import { RouteLink as NavigateLink, RouteNotFoundPage } from './RouteNotFoundPage'
import type { CourseId, LearnerProgress } from './types'

const LessonPlayer = lazy(async () => {
  const module = await import('./LessonPlayer')
  return { default: module.LessonPlayer }
})

const languageLabels: Record<CourseDefinition['language'], string> = {
  cpp: 'C++',
  csharp: 'C#',
  java: 'Java',
  python: 'Python',
}

function courseSymbol(definition: CourseDefinition) {
  if (definition.symbol === 'hash') return '#'
  if (definition.symbol === 'eye') return <Eye aria-hidden />
  if (definition.symbol === 'coffee') return <Coffee aria-hidden />
  return 'π'
}

function useRouteHeading(title: string) {
  useEffect(() => {
    document.title = `${title} | SeePoundCoffeePie`
    document.querySelector<HTMLElement>('h1')?.focus({ preventScroll: true })
  }, [title])
}

function prerequisiteSentence(definition: CourseDefinition): string {
  const labels = definition.prerequisites.map((prerequisite) => (
    prerequisite.label.replace(/^Complete\s+/, '')
  ))
  if (!labels.length) return 'This course is ready to begin.'
  if (labels.length === 1) return `Complete ${labels[0]} before starting this course.`
  return `Complete ${labels.slice(0, -1).join(', ')} and ${labels.at(-1)} before starting this course.`
}

function RouteMessagePage({ busy, children }: { busy?: boolean; children: ReactNode }) {
  return (
    <main aria-busy={busy} className="route-message-page" id="main-content" tabIndex={-1}>
      <section className="route-message-card">{children}</section>
    </main>
  )
}

function LoadingLesson({ definition }: { definition: CourseDefinition }) {
  return (
    <div className="lesson-overlay">
      <RouteMessagePage busy>
        <p className="kicker"><BookOpen size={15} /> {definition.shortName}</p>
        <h1>Opening your lesson</h1>
        <p>Loading the explanation, exercise, and code workspace.</p>
      </RouteMessagePage>
    </div>
  )
}

function ContinuingCourseLoadFailure({ courseId }: { courseId: CourseId }) {
  const definition = courseDefinition(courseId)
  const failureTitle = `${definition.shortName} could not load`
  useRouteHeading(failureTitle)
  return (
    <RouteMessagePage>
      <h1 tabIndex={-1}>{failureTitle}</h1>
      <p>Your progress is saved. Check your connection, then try loading the course again.</p>
      <button className="primary-action" onClick={() => location.reload()}>Try again</button>
    </RouteMessagePage>
  )
}

interface CoursePageProps {
  onNavigate: (path: string) => void
  onProgress: Dispatch<SetStateAction<LearnerProgress>>
  progress: LearnerProgress
}

interface ContinuingCoursePageProps extends CoursePageProps {
  courseId: CourseId
}

interface ContinuingCoursePageContentProps extends ContinuingCoursePageProps {
  course: ContinuingCourseContent
}

function ContinuingCoursePageContent({ course, courseId, onNavigate, onProgress, progress }: ContinuingCoursePageContentProps) {
  const definition = courseDefinition(courseId)
  const prerequisiteCount = definition.prerequisites.length
  const singlePrerequisite = prerequisiteCount === 1
  const prerequisiteQuantity = singlePrerequisite ? 'the' : prerequisiteCount === 2 ? 'both' : `all ${prerequisiteCount}`
  const prerequisiteReady = courseIsAvailable(definition.id, progress)
  const missing = missingCoursePrerequisites(definition.id, progress)
  const completedMissions = new Set(progress.completedMissions)
  const completedLessons = new Set(progress.completedLessons)
  const moduleCount = definition.missionIds.length
  const lessonCount = definition.lessonIds.length
  const completedModuleCount = definition.missionIds.filter((id) => completedMissions.has(id)).length
  const completedLessonCount = definition.lessonIds.filter((id) => completedLessons.has(id)).length
  const completionPercent = lessonCount ? Math.round((completedLessonCount / lessonCount) * 100) : 0
  const courseComplete = completedModuleCount === moduleCount
  const hasActivity = Boolean(completedModuleCount || completedLessonCount)
  const currentModuleIndex = courseComplete
    ? -1
    : course.missions.findIndex((mission) => !completedMissions.has(mission.id))
  const currentModule = course.missions[currentModuleIndex]
  const currentLesson = currentModule?.exercises.find((exercise) => !completedLessons.has(exercise.id))
    ?? currentModule?.exercises.at(-1)
  const [expandedModule, setExpandedModule] = useState(currentModule?.id ?? course.missions[0]?.id ?? '')
  const [completionNotice, setCompletionNotice] = useState('')
  const [focusModuleId, setFocusModuleId] = useState<string | null>(null)
  useRouteHeading(definition.title)
  const moduleSummaryRefs = useRef(new Map<string, HTMLButtonElement>())
  const continueTo = currentModule && currentLesson
    ? lessonPath(definition.id, currentModule.id, currentLesson.id)
    : coursePath(definition.id)

  useEffect(() => {
    if (!focusModuleId) return
    const timer = setTimeout(() => {
      moduleSummaryRefs.current.get(focusModuleId)?.focus({ preventScroll: true })
      setFocusModuleId(null)
    }, 0)
    return () => clearTimeout(timer)
  }, [focusModuleId])

  const finishModule = (missionId: string) => {
    const index = course.missions.findIndex((mission) => mission.id === missionId)
    const next = course.missions[index + 1]
    const focusTarget = next ?? course.missions[index]
    setExpandedModule(focusTarget?.id ?? '')
    setFocusModuleId(focusTarget?.id ?? null)
    setCompletionNotice(next
      ? `Module complete. Module ${index + 2} is now available.`
      : `Course complete. ${definition.completionReviewLabel ?? definition.title} is ready to review.`)
    onProgress((current) => completeMission(current, missionId))
  }

  return (
    <main className="workshop-page course-outline" id="main-content" tabIndex={-1}>
      <NavigateLink className="back-link" onNavigate={onNavigate} to={coursesPath()}><ArrowLeft size={16} /> All courses</NavigateLink>
      <header className={`course-hero course-hero--${definition.language} course-hero--continuing`}>
        <span aria-hidden="true" className={`language-symbol language-symbol--${definition.language} language-symbol--large`}>{courseSymbol(definition)}</span>
        <div>
          <p className="eyebrow">{languageLabels[definition.language]} course</p>
          <h1 tabIndex={-1}>{definition.title}</h1>
          <p>{definition.description}</p>
          <span>{moduleCount} modules · {lessonCount} lessons · {definition.level} · {prerequisiteSentence(definition)}</span>
        </div>
        <div className="course-hero__action">
          <b>{completedLessonCount} of {lessonCount} lessons complete</b>
          <small>{completionPercent}% of course</small>
          <i aria-label={`${definition.title} progress`} aria-valuemax={100} aria-valuemin={0} aria-valuenow={completionPercent} role="progressbar"><span style={{ width: `${completionPercent}%` }} /></i>
          {prerequisiteReady ? (
            <NavigateLink className="primary-action" onNavigate={onNavigate} to={continueTo}>
              {courseComplete ? 'Review course' : hasActivity ? 'Continue course' : 'Start course'} <ArrowRight size={17} />
            </NavigateLink>
          ) : <span className="course-locked-label"><LockKeyhole size={15} /> Complete {prerequisiteQuantity} item{singlePrerequisite ? '' : 's'} below to start</span>}
        </div>
      </header>

      {!prerequisiteReady && (
        <section className="course-prerequisites" aria-labelledby={`${definition.id}-prerequisites`}>
          <div><h2 id={`${definition.id}-prerequisites`}>Complete these first</h2><p>You can view the modules now. Complete {singlePrerequisite ? 'the item below' : prerequisiteQuantity === 'both' ? 'both items below' : `all ${prerequisiteCount} items below`} to open the lessons.</p></div>
          <ol>
            {definition.prerequisites.map((prerequisite) => {
              const incomplete = missing.some((item) => item.kind === prerequisite.kind && item.id === prerequisite.id)
              const path = prerequisite.kind === 'course' ? coursePath(prerequisite.id) : prerequisite.path
              const openLabel = prerequisite.kind === 'course' ? 'Open course' : 'Open project'
              return <li className={incomplete ? '' : 'is-complete'} key={`${prerequisite.kind}:${prerequisite.id}`}><span>{incomplete ? <LockKeyhole size={15} /> : <Check size={15} />}</span><b>{prerequisite.label}</b><NavigateLink onNavigate={onNavigate} to={path}>{openLabel} <ArrowRight size={14} /></NavigateLink></li>
            })}
          </ol>
        </section>
      )}

      <section className="course-modules" aria-labelledby={`${definition.id}-content-title`}>
        <div className="section-heading-open"><div><h2 id={`${definition.id}-content-title`}>Modules</h2></div><p>Complete the modules in order.</p></div>
        {completionNotice && <p className="module-completion-status" role="status">{completionNotice}</p>}
        {course.missions.map((mission, moduleIndex) => {
          const moduleComplete = completedMissions.has(mission.id)
          const previousComplete = moduleIndex === 0 || completedMissions.has(course.missions[moduleIndex - 1].id)
          const moduleAvailable = prerequisiteReady && previousComplete
          const moduleCompletedLessons = mission.exercises.filter((exercise) => completedLessons.has(exercise.id)).length
          const expanded = expandedModule === mission.id
          const current = moduleIndex === currentModuleIndex
          const readyToFinish = prerequisiteReady && moduleAvailable && !moduleComplete && moduleCompletedLessons === mission.exercises.length
          const moduleLabel = definition.moduleKinds[moduleIndex] === 'capstone' ? 'Final project' : `Module ${moduleIndex + 1}`
          const moduleLock = moduleAvailable ? '' : prerequisiteReady
            ? '. Locked. Complete previous module.'
            : '. Locked. Complete prerequisites.'
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
                <span><small>{moduleLabel}</small><b>{definition.moduleTitles[moduleIndex]}</b>{moduleLock}{expanded && <p>{mission.description}</p>}</span>
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
                      <span>{completed ? <Check size={15} /> : lessonIndex + 1}</span><b>{exercise.title}</b><small>{completed ? 'Complete' : current && currentLesson?.id === exercise.id ? 'Next lesson' : 'Start lesson'} · {lessonActivityLabel(exercise.type)}</small><ArrowRight size={15} />
                    </NavigateLink>
                  ) : <div className="is-locked" key={exercise.id}><span><LockKeyhole size={13} /></span><b>{exercise.title}</b><small>{prerequisiteReady ? 'Complete the previous module first' : `Complete ${prerequisiteQuantity} item${singlePrerequisite ? '' : 's'} below first`}</small></div>
                })}
              </div>
              {expanded && readyToFinish && <div className="module-finish-callout"><span><b>Every lesson is complete.</b><small>Finish this module to open the next one.</small></span><button className="primary-action" onClick={() => finishModule(mission.id)}>Finish module <ArrowRight size={17} /></button></div>}
            </article>
          )
        })}
      </section>
    </main>
  )
}

export function ContinuingCoursePage(props: ContinuingCoursePageProps) {
  const request = publishedContinuingCourseContentRequest(props.courseId)
  const course = request ? use(request) : null
  return course
    ? <ContinuingCoursePageContent {...props} course={course} />
    : request
      ? <ContinuingCourseLoadFailure courseId={props.courseId} />
      : <RouteNotFoundPage onNavigate={props.onNavigate} progress={props.progress} />
}

interface LessonPageProps {
  exerciseId: string
  missionId: string
  onNavigate: (path: string) => void
  onProgress: Dispatch<SetStateAction<LearnerProgress>>
  progress: LearnerProgress
}

interface ContinuingCourseLessonPageProps extends LessonPageProps {
  courseId: CourseId
}

interface ContinuingCourseLessonPageContentProps extends ContinuingCourseLessonPageProps {
  course: ContinuingCourseContent
}

function ContinuingCourseLessonPageContent({
  course,
  courseId,
  exerciseId,
  missionId,
  onNavigate,
  onProgress,
  progress,
}: ContinuingCourseLessonPageContentProps) {
  const definition = courseDefinition(courseId)
  const missionIndex = course.missions.findIndex((mission) => mission.id === missionId)
  const mission = course.missions[missionIndex]
  const exercise = mission?.exercises.find((candidate) => candidate.id === exerciseId)
  const prerequisiteReady = courseIsAvailable(definition.id, progress)
  const previousComplete = missionIndex === 0 || progress.completedMissions.includes(course.missions[missionIndex - 1]?.id)
  const available = Boolean(mission && exercise && prerequisiteReady && previousComplete)
  const missing = useMemo(() => missingCoursePrerequisites(definition.id, progress), [definition.id, progress])
  useRouteHeading(exercise?.title ?? definition.title)

  if (!mission || !exercise) {
    return <RouteMessagePage><h1 tabIndex={-1}>Lesson not found</h1><NavigateLink className="primary-action" onNavigate={onNavigate} to={coursePath(definition.id)}>Return to the course</NavigateLink></RouteMessagePage>
  }

  if (!available) {
    return (
      <RouteMessagePage>
        <p className="kicker"><LockKeyhole size={15} /> Lesson locked</p>
        <h1 tabIndex={-1}>{exercise.title} is still ahead</h1>
        <p>{!prerequisiteReady
          ? prerequisiteSentence(definition)
          : `Complete ${course.missions[missionIndex - 1]?.title ?? 'the previous module'} first. Each module uses ideas from the one before it.`}</p>
        {!prerequisiteReady && <ul className="locked-route-prerequisites">{missing.map((item) => (
          <li key={`${item.kind}:${item.id}`}>
            <NavigateLink onNavigate={onNavigate} to={item.kind === 'course' ? coursePath(item.id) : item.path}>{item.label}</NavigateLink>
          </li>
        ))}</ul>}
        <NavigateLink className="primary-action" onNavigate={onNavigate} to={coursePath(definition.id)}>Return to {definition.shortName}</NavigateLink>
      </RouteMessagePage>
    )
  }

  return (
    <Suspense fallback={<LoadingLesson definition={definition} />}>
      <LessonPlayer
        initialExerciseId={exercise.id}
        key={`${definition.id}-${mission.id}`}
        mission={mission}
        onExerciseChange={(nextExerciseId) => onNavigate(lessonPath(definition.id, mission.id, nextExerciseId))}
        onExit={() => onNavigate(coursePath(definition.id))}
        onProgress={onProgress}
        progress={progress}
      />
    </Suspense>
  )
}

export function ContinuingCourseLessonPage(props: ContinuingCourseLessonPageProps) {
  const request = publishedContinuingCourseContentRequest(props.courseId)
  const course = request ? use(request) : null
  return course
    ? <ContinuingCourseLessonPageContent {...props} course={course} />
    : request
      ? <ContinuingCourseLoadFailure courseId={props.courseId} />
      : <RouteNotFoundPage onNavigate={props.onNavigate} progress={props.progress} />
}

export function PythonDataToolsCoursePage(props: CoursePageProps) {
  return <ContinuingCoursePage {...props} courseId="python-data-tools" />
}

export function PythonDataToolsLessonPage(props: LessonPageProps) {
  return <ContinuingCourseLessonPage {...props} courseId="python-data-tools" />
}
