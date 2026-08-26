import { ArrowLeft, ArrowRight, CheckCircle2, Download, FileCode2, LockKeyhole, Shield, TriangleAlert } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent, type ReactNode } from 'react'
import { projectManifestByRoute } from './data/project-manifests'
import { trackById } from './data/curriculum'
import { loadProjectDraft } from './lib/project-drafts'
import {
  createPortfolioExport,
  PORTFOLIO_INTEGRITY_NOTE,
  type PortfolioSnapshot,
} from './lib/portfolio-export'
import { projectPath } from './lib/routes'
import type { LanguageId, LearnerProgress } from './types'
import './portfolio.css'

interface PortfolioPageProps {
  language: LanguageId
  onNavigate: (path: string) => void
  progress: LearnerProgress
  projectId: string
}

function PortfolioLink({
  children,
  className,
  onNavigate,
  to,
}: {
  children: ReactNode
  className?: string
  onNavigate: (path: string) => void
  to: string
}) {
  const follow = (event: ReactMouseEvent<HTMLAnchorElement>) => {
    if (
      event.button !== 0
      || event.metaKey
      || event.ctrlKey
      || event.shiftKey
      || event.altKey
    ) return
    event.preventDefault()
    onNavigate(to)
  }
  return <a className={className} href={to} onClick={follow}>{children}</a>
}

export function PortfolioPage({ language, onNavigate, progress, projectId }: PortfolioPageProps) {
  const project = projectManifestByRoute(language, projectId)
  const [reviewedKey, setReviewedKey] = useState<string | null>(null)
  const [downloadStatus, setDownloadStatus] = useState('')
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true })
  }, [])

  const completion = useMemo(() => {
    if (!project) return null
    const completedCount = project.checkpoints.filter((checkpoint) => (
      progress.completedProjectCheckpoints.includes(checkpoint.id)
    )).length
    const nextCheckpoint = project.checkpoints.find((checkpoint) => (
      !progress.completedProjectCheckpoints.includes(checkpoint.id)
    )) ?? project.checkpoints.at(-1)
    const allCheckpointsComplete = completedCount === project.checkpoints.length
    const projectMarkedComplete = progress.completedProjects.includes(project.id)
    const finalCheckpoint = project.checkpoints.at(-1)
    const source = finalCheckpoint ? loadProjectDraft(project.id, finalCheckpoint.id) : null
    return {
      allCheckpointsComplete,
      completedCount,
      finalCheckpoint,
      nextCheckpoint,
      projectMarkedComplete,
      source,
    }
  }, [progress.completedProjectCheckpoints, progress.completedProjects, project])

  if (!project || !completion) return null

  const snapshot: PortfolioSnapshot | null = completion.source === null
    ? null
    : {
      callsign: progress.callsign,
      languageLabel: trackById(language).shortName,
      projectTitle: project.title,
      subtitle: project.subtitle,
      description: project.description,
      outcome: project.outcome,
      overviewSteps: project.overviewSteps.map((step) => ({ ...step })),
      sourceFileName: project.downloadFileName,
      source: completion.source,
    }
  const prepared = snapshot ? createPortfolioExport(snapshot, project.id) : null
  const reviewKey = snapshot
    ? JSON.stringify([project.id, snapshot.callsign, snapshot.sourceFileName, snapshot.source])
    : ''
  const confirmed = reviewedKey === reviewKey
  const ready = completion.projectMarkedComplete
    && completion.allCheckpointsComplete
    && prepared?.ok === true
  const projectOverviewPath = projectPath(project.language, project.id)
  const nextProjectPath = completion.nextCheckpoint
    ? projectPath(project.language, project.id, completion.nextCheckpoint.id)
    : projectOverviewPath

  const download = () => {
    setDownloadStatus('')
    if (!confirmed) {
      setDownloadStatus('Review the current callsign and source, then select the confirmation box.')
      return
    }
    if (!prepared?.ok) {
      setDownloadStatus(prepared?.message ?? 'This browser could not prepare the portfolio page.')
      return
    }
    const url = URL.createObjectURL(new Blob([prepared.html], { type: prepared.mimeType }))
    const link = document.createElement('a')
    link.href = url
    link.download = prepared.filename
    document.body.append(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 0)
    setDownloadStatus(`Your browser started the download for ${prepared.filename}.`)
  }

  return (
    <main className="portfolio-page workshop-page">
      <PortfolioLink className="back-link" onNavigate={onNavigate} to="/profile">
        <ArrowLeft size={16} /> Back to learner record
      </PortfolioLink>

      <header className="portfolio-hero">
        <div>
          <p className="eyebrow">Portfolio preview</p>
          <h1 ref={headingRef} tabIndex={-1}>{project.title} portfolio preview</h1>
          <p>This page prepares a private, browser-local snapshot of one completed project. Nothing has been published.</p>
        </div>
        <div className="portfolio-hero__identity">
          <FileCode2 aria-hidden="true" />
          <span><small>Displayed callsign</small><b><bdi dir="auto">{progress.callsign}</bdi></b></span>
        </div>
      </header>

      {!completion.projectMarkedComplete || !completion.allCheckpointsComplete ? (
        <section className="portfolio-state" aria-labelledby="portfolio-state-title">
          <LockKeyhole aria-hidden="true" />
          <div>
            <p className="eyebrow">Project still in progress</p>
            <h2 id="portfolio-state-title">Finish the project before preparing a portfolio copy.</h2>
            <p>{completion.completedCount} of {project.checkpoints.length} checkpoints are complete in this learner record. A draft or bookmark alone does not count as completion.</p>
            <PortfolioLink className="primary-action" onNavigate={onNavigate} to={nextProjectPath}>
              {completion.completedCount > 0 ? 'Resume the project' : 'Open the project'} <ArrowRight size={17} />
            </PortfolioLink>
          </div>
        </section>
      ) : completion.source === null ? (
        <section className="portfolio-state" aria-labelledby="portfolio-state-title">
          <TriangleAlert aria-hidden="true" />
          <div>
            <p className="eyebrow">Final source missing here</p>
            <h2 id="portfolio-state-title">This browser has the completion record, but not the final source.</h2>
            <p>Project source is intentionally not synchronized between browsers. Open the final checkpoint on the browser where you wrote the project, or add the source again here.</p>
            <PortfolioLink className="primary-action" onNavigate={onNavigate} to={nextProjectPath}>
              Open the final checkpoint <ArrowRight size={17} />
            </PortfolioLink>
          </div>
        </section>
      ) : prepared && !prepared.ok ? (
        <section className="portfolio-state" aria-labelledby="portfolio-state-title">
          <TriangleAlert aria-hidden="true" />
          <div>
            <p className="eyebrow">Portfolio copy unavailable</p>
            <h2 id="portfolio-state-title">The current source needs attention first.</h2>
            <p>{prepared.message}</p>
            <PortfolioLink className="primary-action" onNavigate={onNavigate} to={nextProjectPath}>
              Review the final checkpoint <ArrowRight size={17} />
            </PortfolioLink>
          </div>
        </section>
      ) : ready && snapshot ? (
        <>
          <section className="portfolio-local-notice" aria-labelledby="portfolio-local-title">
            <Shield aria-hidden="true" />
            <div>
              <p className="eyebrow">Private preview</p>
              <h2 id="portfolio-local-title">This route does not publish or transfer your source.</h2>
              <p>Sharing or bookmarking this URL shares only the route. Another browser will not receive this source. The app can still check your private account session as it normally does, but the export action does not upload the source.</p>
            </div>
          </section>

          <div className="portfolio-layout">
            <section className="portfolio-summary" aria-labelledby="portfolio-summary-title">
              <p className="eyebrow">What I built</p>
              <h2 id="portfolio-summary-title">{project.overviewTitle}</h2>
              <p>{project.description}</p>
              <ol>
                {project.overviewSteps.map((step) => (
                  <li key={step.title}><CheckCircle2 aria-hidden="true" size={18} /><span><b>{step.title}</b><small>{step.description}</small></span></li>
                ))}
              </ol>
            </section>

            <section className="portfolio-source" aria-labelledby="portfolio-source-title">
              <p className="eyebrow">Current final source</p>
              <h2 id="portfolio-source-title">{project.downloadFileName}</h2>
              <p>This is the exact final-checkpoint source currently saved in this browser. It may be different from the source used during the last check.</p>
              <pre aria-label={`Final source for ${project.downloadFileName}`}><code>{snapshot.source}</code></pre>
            </section>
          </div>

          <section className="portfolio-disclosure" aria-labelledby="portfolio-disclosure-title">
            <p className="eyebrow">Before you download</p>
            <h2 id="portfolio-disclosure-title">Know exactly what leaves this browser.</h2>
            <ul>
              <li>The file includes the displayed callsign and the exact source shown above.</li>
              <li>Comments and text inside source code can contain names, credentials, or other personal information. Review them first.</li>
              <li>Anyone who receives the HTML file can read, copy, and redistribute it.</li>
              <li>The app does not add your GitHub login, account email, access tokens, IP address, XP, streak, review schedule, console output, check history, or practice input. Your displayed callsign and source are included exactly as shown, so those values may themselves contain personal or sensitive information.</li>
              <li>The download is a self-contained, script-free HTML file. The export action performs no upload.</li>
            </ul>
            <div className="portfolio-certificate-note"><TriangleAlert aria-hidden="true" /><p>{PORTFOLIO_INTEGRITY_NOTE}</p></div>
            <label className="portfolio-confirmation">
              <input
                checked={confirmed}
                onChange={(event) => setReviewedKey(event.target.checked ? reviewKey : null)}
                type="checkbox"
              />
              <span>I reviewed the callsign and source above and understand that the file is not a certificate.</span>
            </label>
            <button className="primary-action portfolio-download" disabled={!confirmed} onClick={download} type="button">
              <Download size={17} /> Download portfolio page
            </button>
            <p aria-live="polite" className="portfolio-download-status" role="status">{downloadStatus}</p>
          </section>
        </>
      ) : null}

      <footer className="portfolio-footer">
        <PortfolioLink onNavigate={onNavigate} to={projectOverviewPath}>Return to project overview</PortfolioLink>
      </footer>
    </main>
  )
}

export default PortfolioPage
