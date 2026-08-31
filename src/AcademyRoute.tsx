import { useMemo, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  FileText,
  RotateCcw,
} from 'lucide-react'
import {
  academyContentForUnit,
  academySourcesForUnit,
} from './data/academy-content'
import {
  academyCourseForId,
  academyModuleForId,
  academyPathForId,
  academyPreparationPageForId,
  academyUnitForId,
  type AcademyCourse,
  type AcademyCourseId,
  type AcademyModule,
  type AcademyModuleId,
  type AcademyPath,
  type AcademyPathId,
  type AcademyPreparationPageId,
  type AcademyUnit,
  type AcademyUnitId,
} from './data/academy-manifest'
import { completeMission, recordLessonSuccess } from './lib/progress'
import {
  academyCoursePath,
  academyModulePath,
  academyPreparationPath,
  academyUnitPath,
  coursesPath,
  learningPathPath,
} from './lib/routes'
import { RouteLink } from './RouteNotFoundPage'
import type { LearnerProgress } from './types'
import './academy-route.css'

interface AcademyRouteProps {
  academyCourseId?: AcademyCourseId
  academyModuleId?: AcademyModuleId
  academyPathId?: AcademyPathId
  academyPreparationPageId?: AcademyPreparationPageId
  academyUnitId?: AcademyUnitId
  onNavigate?: (path: string) => void
  onProgress: (progress: LearnerProgress) => void
  progress: LearnerProgress
}

interface AcademyRouteRecords {
  course?: AcademyCourse
  module?: AcademyModule
  path?: AcademyPath
  unit?: AcademyUnit
}

function completedUnitCount(unitIds: readonly AcademyUnitId[], progress: LearnerProgress): number {
  const completed = new Set(progress.completedLessons)
  return unitIds.filter((unitId) => completed.has(unitId)).length
}

function AcademyFacts({ activity, platform, time }: Pick<AcademyPath, 'activity' | 'platform' | 'time'>) {
  return (
    <div className="academy-facts" aria-label="Learning activity details">
      <span><Clock3 aria-hidden="true" size={15} /> {time}</span>
      <span><BookOpen aria-hidden="true" size={15} /> {activity}</span>
      <span><FileText aria-hidden="true" size={15} /> {platform}</span>
    </div>
  )
}

function AcademyBreadcrumbs({ course, module, onNavigate, path }: AcademyRouteRecords & Pick<AcademyRouteProps, 'onNavigate'>) {
  return (
    <nav className="academy-breadcrumbs" aria-label="Breadcrumb">
      <RouteLink onNavigate={onNavigate} to={coursesPath()}>Courses</RouteLink>
      {path && <><span aria-hidden="true">/</span><RouteLink onNavigate={onNavigate} to={learningPathPath(path.id)}>{path.title}</RouteLink></>}
      {course && path && <><span aria-hidden="true">/</span><RouteLink onNavigate={onNavigate} to={academyCoursePath(path.id, course.id)}>{course.title}</RouteLink></>}
      {module && path && course && <><span aria-hidden="true">/</span><RouteLink onNavigate={onNavigate} to={academyModulePath(path.id, course.id, module.id)}>{module.title}</RouteLink></>}
    </nav>
  )
}

function PathPage({ onNavigate, path, progress }: { onNavigate?: (path: string) => void; path: AcademyPath; progress: LearnerProgress }) {
  const courses = path.courseIds.map((courseId) => academyCourseForId(courseId)).filter((course): course is AcademyCourse => Boolean(course))
  return (
    <main className="academy-page" id="main-content" tabIndex={-1}>
      <AcademyBreadcrumbs onNavigate={onNavigate} path={path} />
      <header className="academy-heading">
        <p className="eyebrow">Open learning path</p>
        <h1>{path.title}</h1>
        <p>{path.summary}</p>
        <AcademyFacts activity={path.activity} platform={path.platform} time={path.time} />
      </header>
      <section aria-labelledby="path-courses-title">
        <div className="section-heading-open">
          <div><h2 id="path-courses-title">Courses in this path</h2></div>
          <p>Open any course. Nothing on this page must be completed first.</p>
        </div>
        <div className="academy-card-grid">
          {courses.map((course) => {
            const unitIds = course.moduleIds.flatMap((moduleId) => academyModuleForId(moduleId)?.unitIds ?? [])
            const completed = completedUnitCount(unitIds, progress)
            return (
              <article className="academy-card" key={course.id}>
                <small>Course reference {course.id} · Open course</small>
                <h2>{course.title}</h2>
                <p>{course.summary}</p>
                <div className="academy-card__meta">
                  <span>{course.time}</span>
                  <span>{completed} of {unitIds.length} units complete</span>
                </div>
                <RouteLink className="primary-action" onNavigate={onNavigate} to={academyCoursePath(path.id, course.id)}>
                  Open course <ArrowRight aria-hidden="true" size={17} />
                </RouteLink>
              </article>
            )
          })}
        </div>
      </section>
    </main>
  )
}

function preparationDestination(path: AcademyPath, course: AcademyCourse, choice: AcademyCourse['optionalPreparation'][number]): string {
  if (choice.destination.kind === 'preparation-page') {
    return academyPreparationPath(path.id, course.id, choice.destination.id as AcademyPreparationPageId)
  }
  const unit = academyUnitForId(choice.destination.id as AcademyUnitId)
  if (!unit) throw new Error(`Academy preparation destination is missing: ${choice.destination.id}`)
  return academyUnitPath(path.id, course.id, unit.moduleId, unit.id)
}

function OptionalPreparation({ course, onNavigate, path }: { course: AcademyCourse; onNavigate?: (path: string) => void; path: AcademyPath }) {
  return (
    <section className="academy-preparation" aria-labelledby="optional-preparation-title">
      <div className="academy-preparation__heading">
        <h2 id="optional-preparation-title">Choose how to begin</h2>
        <p>All three choices are optional ways into the same course. You may start immediately, and no choice unlocks or blocks another page.</p>
      </div>
      <div className="academy-preparation__choices">
        {course.optionalPreparation.map((choice) => (
          <RouteLink key={choice.id} onNavigate={onNavigate} to={preparationDestination(path, course, choice)}>
            <b>{choice.label}</b>
            <span>{choice.summary}</span>
          </RouteLink>
        ))}
      </div>
    </section>
  )
}

function CoursePage({ course, onNavigate, path, progress }: { course: AcademyCourse; onNavigate?: (path: string) => void; path: AcademyPath; progress: LearnerProgress }) {
  const modules = course.moduleIds.map((moduleId) => academyModuleForId(moduleId)).filter((module): module is AcademyModule => Boolean(module))
  const courseUnitIds = modules.flatMap((module) => module.unitIds)
  const completed = completedUnitCount(courseUnitIds, progress)
  return (
    <main className="academy-page" id="main-content" tabIndex={-1}>
      <AcademyBreadcrumbs course={course} onNavigate={onNavigate} path={path} />
      <header className="academy-heading">
        <p className="eyebrow">Course reference {course.id} · Open course</p>
        <h1>{course.title}</h1>
        <p>{course.summary}</p>
        <AcademyFacts activity={course.activity} platform={course.platform} time={course.time} />
      </header>
      <section className="academy-unit-summary" aria-label="Course outcome">
        <b>By the end</b>
        <p>{course.outcome}</p>
        <p>{completed} of {courseUnitIds.length} units complete. Completion is recorded, but every unit remains open.</p>
      </section>
      <OptionalPreparation course={course} onNavigate={onNavigate} path={path} />
      <section aria-labelledby="course-modules-title">
        <div className="section-heading-open">
          <div><h2 id="course-modules-title">Course outline</h2></div>
          <p>Open any module or unit. The order is a suggestion, not an access requirement.</p>
        </div>
        <div className="academy-module-grid">
          {modules.map((module, index) => {
            const moduleCompleted = completedUnitCount(module.unitIds, progress)
            return (
              <article className="academy-module-card" key={module.id}>
                <small>Module {index + 1} · {moduleCompleted} of {module.unitIds.length} units complete</small>
                <h2>{module.title}</h2>
                <p>{module.summary}</p>
                <div className="academy-module-card__meta"><span>{module.time}</span><span>{module.activity}</span></div>
                <RouteLink className="primary-action" onNavigate={onNavigate} to={academyModulePath(path.id, course.id, module.id)}>
                  View module <ArrowRight aria-hidden="true" size={17} />
                </RouteLink>
              </article>
            )
          })}
        </div>
      </section>
    </main>
  )
}

function ModulePage({ course, module, onNavigate, path, progress }: { course: AcademyCourse; module: AcademyModule; onNavigate?: (path: string) => void; path: AcademyPath; progress: LearnerProgress }) {
  const units = module.unitIds.map((unitId) => academyUnitForId(unitId)).filter((unit): unit is AcademyUnit => Boolean(unit))
  const completed = new Set(progress.completedLessons)
  return (
    <main className="academy-page" id="main-content" tabIndex={-1}>
      <AcademyBreadcrumbs course={course} module={module} onNavigate={onNavigate} path={path} />
      <header className="academy-heading">
        <p className="eyebrow">Open module</p>
        <h1>{module.title}</h1>
        <p>{module.summary}</p>
        <AcademyFacts activity={module.activity} platform={module.platform} time={module.time} />
      </header>
      <section className="academy-unit-summary" aria-label="Module outcome"><b>By the end</b><p>{module.outcome}</p></section>
      <section aria-labelledby="module-units-title">
        <div className="section-heading-open">
          <div><h2 id="module-units-title">Units</h2></div>
          <p>Each unit defines its words before using them. You can open the units in any order.</p>
        </div>
        <ol className="academy-list">
          {units.map((unit, index) => (
            <li key={unit.id}>
              <RouteLink onNavigate={onNavigate} to={academyUnitPath(path.id, course.id, module.id, unit.id)}>
                <span className="academy-list__number">{completed.has(unit.id) ? <Check aria-label="Complete" size={17} /> : index + 1}</span>
                <span className="academy-list__copy"><small>{unit.time} · Unit reference {unit.id}</small><b>{unit.title}</b><span>{unit.summary}</span></span>
                <small>{completed.has(unit.id) ? 'Complete' : 'Open unit'} <ArrowRight aria-hidden="true" size={15} /></small>
              </RouteLink>
            </li>
          ))}
        </ol>
      </section>
    </main>
  )
}

function PreparationPage({ course, onNavigate, pageId, path }: { course: AcademyCourse; onNavigate?: (path: string) => void; pageId: AcademyPreparationPageId; path: AcademyPath }) {
  const page = academyPreparationPageForId(pageId)
  if (!page) return null
  const returnUnit = academyUnitForId(page.returnUnitId)
  if (!returnUnit) return null
  return (
    <main className="academy-page academy-preparation-page" id="main-content" tabIndex={-1}>
      <AcademyBreadcrumbs course={course} onNavigate={onNavigate} path={path} />
      <article className="academy-reading">
        <header className="academy-heading">
          <p className="eyebrow">Optional reading</p>
          <h1>{page.title}</h1>
          <p>{page.summary}</p>
          <AcademyFacts activity={page.activity} platform={page.platform} time={page.time} />
        </header>
        <section className="academy-unit-summary"><b>Why this page exists</b><p>{page.outcome}</p><p>This page is optional. Reading it does not change access or progress.</p></section>
        <section className="academy-section" aria-labelledby="preparation-reading-title">
          <h2 id="preparation-reading-title">Short explanation</h2>
          {page.content.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </section>
        <div className="academy-next-actions">
          <RouteLink className="secondary-action" onNavigate={onNavigate} to={academyCoursePath(path.id, course.id)}><ArrowLeft aria-hidden="true" size={17} /> Course outline</RouteLink>
          <RouteLink className="primary-action" onNavigate={onNavigate} to={academyUnitPath(path.id, course.id, returnUnit.moduleId, returnUnit.id)}>Open the first unit <ArrowRight aria-hidden="true" size={17} /></RouteLink>
        </div>
      </article>
    </main>
  )
}

const unitSectionLinks = [
  ['unit-start', 'Before you begin'],
  ['unit-words', 'Words on this page'],
  ['unit-example', 'Example and prediction'],
  ['unit-result', 'Prepared result'],
  ['unit-explanation', 'Step-by-step explanation'],
  ['unit-practice', 'Practice'],
  ['unit-check', 'Knowledge check'],
  ['unit-recap', 'Recap and limits'],
  ['unit-sources', 'Sources'],
  ['unit-stop', 'Stop and resume'],
] as const

function ContentParagraphs({ paragraphs }: { paragraphs: readonly string[] }) {
  return <>{paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</>
}

function UnitPage({ course, module, onNavigate, path, progress, unit, onProgress }: { course: AcademyCourse; module: AcademyModule; onNavigate?: (path: string) => void; path: AcademyPath; progress: LearnerProgress; unit: AcademyUnit; onProgress: (progress: LearnerProgress) => void }) {
  const content = academyContentForUnit(unit.id)
  const sources = academySourcesForUnit(unit.id)
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null)
  const [checked, setChecked] = useState(false)
  const [mobileSectionsOpen, setMobileSectionsOpen] = useState(false)
  const choices = content.knowledgeCheck.choices
  const selectedChoice = choices.find((choice) => choice.id === selectedChoiceId)
  const completed = progress.completedLessons.includes(unit.id)
  const allCourseUnits = course.moduleIds.flatMap((moduleId) => academyModuleForId(moduleId)?.unitIds ?? [])
  const unitIndex = allCourseUnits.indexOf(unit.id)
  const previousUnit = unitIndex > 0 ? academyUnitForId(allCourseUnits[unitIndex - 1]) : undefined
  const nextUnit = unitIndex >= 0 && unitIndex < allCourseUnits.length - 1 ? academyUnitForId(allCourseUnits[unitIndex + 1]) : undefined

  const checkAnswer = () => {
    if (!selectedChoice) return
    setChecked(true)
    if (!selectedChoice.correct) return
    let nextProgress = completed ? progress : recordLessonSuccess(progress, unit)
    const moduleReady = module.unitIds.every((unitId) => nextProgress.completedLessons.includes(unitId))
    if (moduleReady && !nextProgress.completedMissions.includes(module.id)) {
      nextProgress = completeMission(nextProgress, module.id)
    }
    if (nextProgress !== progress) onProgress(nextProgress)
  }

  const resetCheck = () => {
    setSelectedChoiceId(null)
    setChecked(false)
  }

  return (
    <main className="academy-page academy-unit-page" id="main-content" tabIndex={-1}>
      <AcademyBreadcrumbs course={course} module={module} onNavigate={onNavigate} path={path} />
      <header className="academy-heading">
        <p className="eyebrow">Unit reference {unit.id} · Open unit</p>
        <h1>{unit.title}</h1>
        <p>{unit.summary}</p>
        <AcademyFacts activity={unit.activity} platform={unit.platform} time={unit.time} />
      </header>
      <div className="academy-unit-layout">
        <nav className="academy-unit-nav" aria-label="Sections on this page">
          <b className="academy-unit-nav__desktop-title">On this page</b>
          <button
            aria-expanded={mobileSectionsOpen}
            className="academy-unit-nav__toggle"
            onClick={() => setMobileSectionsOpen((open) => !open)}
            type="button"
          >On this page <ChevronDown aria-hidden="true" size={17} /></button>
          <ol className={mobileSectionsOpen ? 'is-open' : undefined}>{unitSectionLinks.map(([id, label]) => <li key={id}><a href={`#${id}`} onClick={() => setMobileSectionsOpen(false)}>{label}</a></li>)}</ol>
        </nav>
        <article className="academy-reading">
          {completed && <p className="academy-unit-summary" role="status"><b><CheckCircle2 aria-hidden="true" size={17} /> Unit complete</b>You can read or answer again. The page remains open.</p>}
          <section className="academy-section" id="unit-start">
            <h2>Before you begin</h2>
            <dl className="academy-terms">
              <div><dt>Where you are</dt><dd>{content.location}</dd></div>
              <div><dt>Goal</dt><dd>{content.goal}</dd></div>
              <div><dt>Why it matters</dt><dd>{content.purpose}</dd></div>
              <div><dt>Time</dt><dd>{content.scope.estimatedTime}</dd></div>
              <div><dt>Actions</dt><dd>{content.scope.requiredActions} required actions: read the prepared material and answer one check.</dd></div>
              <div><dt>What changes</dt><dd>{content.scope.changes}</dd></div>
            </dl>
            <div className="academy-unit-summary">
              <b>Nothing is assumed</b>
              <p>{content.preparation.startNow}</p>
              <p>{content.preparation.refresher}</p>
              <p>{content.preparation.shortContext}</p>
            </div>
            <p><b>Page boundary:</b> {content.boundary.statement}</p>
            {content.beforeWeCompare && (
              <div className="academy-evidence-grid" aria-label="Before we compare">
                <article className="academy-evidence-card"><b>Outcome</b><p>{content.beforeWeCompare.outcome}</p></article>
                <article className="academy-evidence-card"><b>System boundary</b><p>{content.beforeWeCompare.systemBoundary}</p></article>
                <article className="academy-evidence-card"><b>Prepared material</b><p>{content.beforeWeCompare.prepared}</p></article>
                <article className="academy-evidence-card"><b>Your action</b><p>{content.beforeWeCompare.learnerAction}</p></article>
                <article className="academy-evidence-card"><b>What you need</b><p>{content.beforeWeCompare.requirements}</p></article>
                <article className="academy-evidence-card"><b>Ways to begin</b><p>{content.beforeWeCompare.choices.join(', ')}. These are choices, not access requirements.</p></article>
              </div>
            )}
          </section>

          <section className="academy-section" id="unit-words">
            <h2>Words on this page</h2>
            <p>Read these definitions before the example. You do not need to memorize them.</p>
            <dl className="academy-terms">
              {content.words.map((word) => <div key={word.term}><dt>{word.term}</dt><dd>{word.definition} Example: {word.example}</dd></div>)}
            </dl>
          </section>

          {content.realitySections && (
            <section className="academy-section" aria-labelledby="reality-comparison-title">
              <h2 id="reality-comparison-title">Reality and fiction comparison</h2>
              {content.realitySections.map((section) => <div key={section.label}><h3>{section.label}</h3><ContentParagraphs paragraphs={section.paragraphs} /></div>)}
            </section>
          )}

          <section className="academy-section" id="unit-example">
            <h2>Concrete example and prediction</h2>
            <div className="academy-example">{content.example.input}</div>
            <p><b>Question:</b> {content.example.question}</p>
            <p><b>Predict before revealing the result:</b> {content.prediction}</p>
          </section>

          <section className="academy-section" id="unit-result">
            <h2>Prepared result</h2>
            <p>{content.preparedResult}</p>
          </section>

          <section className="academy-section" id="unit-explanation">
            <h2>Step-by-step explanation</h2>
            <ol>{content.explanationSteps.map((step) => <li key={step}>{step}</li>)}</ol>
          </section>

          <section className="academy-section" id="unit-practice">
            <h2>{content.practice.title}</h2>
            <p>{content.practice.prompt}</p>
            <h3>Prepared evidence</h3>
            <ul>{content.practice.preparedEvidence.map((evidence) => <li key={evidence}>{evidence}</li>)}</ul>
            <h3>What to do</h3>
            <ol>{content.practice.steps.map((step) => <li key={step}>{step}</li>)}</ol>
            <div className="academy-evidence-grid">
              <article className="academy-evidence-card"><b>Expected result</b><p>{content.practice.expectedResult}</p><small>{content.practice.acceptableVariation}</small></article>
              <article className="academy-evidence-card"><b>If your result differs</b><p>{content.practice.recovery}</p></article>
            </div>
          </section>

          <section className="academy-section" id="unit-check">
            <h2>Short knowledge check</h2>
            <div className="academy-check">
              <fieldset>
                <legend>{content.knowledgeCheck.prompt}</legend>
                <div className="academy-check__choices" role="radiogroup">
                  {choices.map((choice, index) => (
                    <button
                      aria-checked={selectedChoiceId === choice.id}
                      className={`academy-check__choice${selectedChoiceId === choice.id ? ' is-selected' : ''}`}
                      disabled={checked}
                      key={choice.id}
                      onClick={() => setSelectedChoiceId(choice.id)}
                      role="radio"
                      type="button"
                    ><span>{index + 1}</span><span>{choice.label}</span></button>
                  ))}
                </div>
              </fieldset>
              <div className="academy-check__actions">
                {!checked && <button className="primary-action" disabled={!selectedChoice} onClick={checkAnswer} type="button">Check answer</button>}
                {checked && !selectedChoice?.correct && <button className="secondary-action" onClick={resetCheck} type="button"><RotateCcw aria-hidden="true" size={16} /> Try again</button>}
              </div>
              {checked && selectedChoice && (
                <div className={`academy-feedback${selectedChoice.correct ? '' : ' is-incorrect'}`} role="status">
                  <b>{selectedChoice.correct ? 'Correct' : 'Not yet'}</b>
                  <p>{selectedChoice.feedback}</p>
                  {!selectedChoice.correct && <p>{content.knowledgeCheck.retry}</p>}
                </div>
              )}
            </div>
          </section>

          <section className="academy-section" id="unit-recap">
            <h2>Recap and limits</h2>
            <h3>What this unit established</h3>
            <ul>{content.recap.map((item) => <li key={item}>{item}</li>)}</ul>
            <h3>What this unit did not claim</h3>
            <ul>{content.notClaimed.map((item) => <li key={item}>{item}</li>)}</ul>
          </section>

          <section className="academy-section" id="unit-sources">
            <h2>Sources and evidence limits</h2>
            <p>These records show what each source supports and what it does not prove.</p>
            {content.claimRecord && (
              <article className="academy-unit-summary">
                <b>Fictional claim record</b>
                <p>{content.claimRecord.note}</p>
                <p><small>Created for this lesson · {content.claimRecord.observedAt} · {content.claimRecord.rightsNotes}</small></p>
              </article>
            )}
            <div className="academy-evidence-grid">
              {sources.map((source) => (
                <article className="academy-evidence-card" key={source.id}>
                  <small>{source.publisher} · {source.version} · Observed {source.observedAt} · Review by {source.reviewDueAt}</small>
                  <h3><a href={source.url} rel="noreferrer" target="_blank">{source.title}</a></h3>
                  <p><b>Supports:</b> {source.supports}</p>
                  <p><b>Scope:</b> {source.scope}</p>
                  <p><b>Does not prove:</b> {source.limits}</p>
                  <p><b>Use on this page:</b> {source.rightsNotes}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="academy-section" id="unit-stop">
            <div className="academy-stop">
              <h2>Stop here if you want</h2>
              <p><b>Keep this fact:</b> {content.stopResume.savedFact}</p>
              <p><b>When you return, ask:</b> {content.stopResume.returnQuestion}</p>
              <p>{content.stopResume.nextChoice}</p>
            </div>
          </section>

          <div className="academy-next-actions">
            {previousUnit ? <RouteLink className="secondary-action" onNavigate={onNavigate} to={academyUnitPath(path.id, course.id, previousUnit.moduleId, previousUnit.id)}><ArrowLeft aria-hidden="true" size={17} /> Previous unit</RouteLink> : <RouteLink className="secondary-action" onNavigate={onNavigate} to={academyModulePath(path.id, course.id, module.id)}><ArrowLeft aria-hidden="true" size={17} /> Module outline</RouteLink>}
            {nextUnit ? <RouteLink className="primary-action" onNavigate={onNavigate} to={academyUnitPath(path.id, course.id, nextUnit.moduleId, nextUnit.id)}>Next unit <ArrowRight aria-hidden="true" size={17} /></RouteLink> : <RouteLink className="primary-action" onNavigate={onNavigate} to={academyCoursePath(path.id, course.id)}>Course outline <ArrowRight aria-hidden="true" size={17} /></RouteLink>}
          </div>
        </article>
      </div>
    </main>
  )
}

export function AcademyRoute(props: AcademyRouteProps) {
  const records = useMemo<AcademyRouteRecords>(() => ({
    path: props.academyPathId ? academyPathForId(props.academyPathId) : undefined,
    course: props.academyCourseId ? academyCourseForId(props.academyCourseId) : undefined,
    module: props.academyModuleId ? academyModuleForId(props.academyModuleId) : undefined,
    unit: props.academyUnitId ? academyUnitForId(props.academyUnitId) : undefined,
  }), [props.academyCourseId, props.academyModuleId, props.academyPathId, props.academyUnitId])

  if (!records.path) return null
  if (props.academyUnitId && records.course && records.module && records.unit) {
    return <UnitPage course={records.course} module={records.module} onNavigate={props.onNavigate} onProgress={props.onProgress} path={records.path} progress={props.progress} unit={records.unit} />
  }
  if (props.academyPreparationPageId && records.course) {
    return <PreparationPage course={records.course} onNavigate={props.onNavigate} pageId={props.academyPreparationPageId} path={records.path} />
  }
  if (props.academyModuleId && records.course && records.module) {
    return <ModulePage course={records.course} module={records.module} onNavigate={props.onNavigate} path={records.path} progress={props.progress} />
  }
  if (props.academyCourseId && records.course) {
    return <CoursePage course={records.course} onNavigate={props.onNavigate} path={records.path} progress={props.progress} />
  }
  return <PathPage onNavigate={props.onNavigate} path={records.path} progress={props.progress} />
}
