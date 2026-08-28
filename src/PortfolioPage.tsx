import { ArrowLeft, ArrowRight, CheckCircle2, Download, FileCode2, LockKeyhole, Shield, TriangleAlert } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent, type ReactNode } from 'react'
import { projectManifestByRoute } from './data/project-manifests'
import { foundationTrackMetadataByLanguage } from './data/foundation-track-metadata'
import { loadProjectDraft } from './lib/project-drafts'
import {
  createPortfolioExport,
  type PortfolioSnapshot,
} from './lib/portfolio-export'
import { projectPath } from './lib/routes'
import type { LanguageId, LearnerProgress } from './types'

interface PortfolioPageProps {
  language: LanguageId
  onNavigate: (path: string) => void
  progress: LearnerProgress
  projectId: string
}

const portfolioIntegrityNote = 'This file is a project sample, not a certificate. It shows the displayed name and code currently saved in this browser. The code may have changed since the last project check. SeePoundCoffeePie has not verified the learner\'s identity, who wrote the code, whether the code is original, or whether it still works.'

function preparationMessage(message: string): string {
  return message
    .replace('Add a callsign', 'Add a displayed name')
    .replace('The callsign', 'The displayed name')
    .replace('The final source', 'The saved code')
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
      languageLabel: foundationTrackMetadataByLanguage(language)?.shortName ?? language,
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
      setDownloadStatus('Review the displayed name and code, then select the confirmation box.')
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
    setDownloadStatus(`Your download started: ${prepared.filename}.`)
  }

  return (
    <main className="portfolio-page workshop-page" id="main-content" tabIndex={-1}>
      <PortfolioLink className="back-link" onNavigate={onNavigate} to="/profile">
        <ArrowLeft size={16} /> Back to profile
      </PortfolioLink>

      <header className="portfolio-hero">
        <div>
          <h1 ref={headingRef} tabIndex={-1}>{project.title} portfolio</h1>
          <p>Review and download a copy of this completed project. Your code is not published or uploaded from this page.</p>
        </div>
        <div className="portfolio-hero__identity">
          <FileCode2 aria-hidden="true" />
          <span><small>Displayed name</small><b><bdi dir="auto">{progress.callsign}</bdi></b></span>
        </div>
      </header>

      {!completion.projectMarkedComplete || !completion.allCheckpointsComplete ? (
        <section className="portfolio-state" aria-labelledby="portfolio-state-title">
          <LockKeyhole aria-hidden="true" />
          <div>
            <p className="eyebrow">Project still in progress</p>
            <h2 id="portfolio-state-title">Finish the project before preparing a portfolio copy.</h2>
            <p>{completion.completedCount} of {project.checkpoints.length} steps are complete. A saved draft or bookmark does not finish a step.</p>
            <PortfolioLink className="primary-action" onNavigate={onNavigate} to={nextProjectPath}>
              {completion.completedCount > 0 ? 'Resume the project' : 'Open the project'} <ArrowRight size={17} />
            </PortfolioLink>
          </div>
        </section>
      ) : completion.source === null ? (
        <section className="portfolio-state" aria-labelledby="portfolio-state-title">
          <TriangleAlert aria-hidden="true" />
          <div>
            <p className="eyebrow">Code not found in this browser</p>
            <h2 id="portfolio-state-title">This browser knows the project is complete, but it does not have your final code.</h2>
            <p>Project code is saved only in the browser where you wrote it. Open the final step there, or add the code again in this browser.</p>
            <PortfolioLink className="primary-action" onNavigate={onNavigate} to={nextProjectPath}>
              Open the final step <ArrowRight size={17} />
            </PortfolioLink>
          </div>
        </section>
      ) : prepared && !prepared.ok ? (
        <section className="portfolio-state" aria-labelledby="portfolio-state-title">
          <TriangleAlert aria-hidden="true" />
          <div>
            <p className="eyebrow">Portfolio copy unavailable</p>
            <h2 id="portfolio-state-title">Check your saved code first.</h2>
            <p>{preparationMessage(prepared.message)}</p>
            <PortfolioLink className="primary-action" onNavigate={onNavigate} to={nextProjectPath}>
              Review the final step <ArrowRight size={17} />
            </PortfolioLink>
          </div>
        </section>
      ) : ready && snapshot ? (
        <>
          <section className="portfolio-local-notice" aria-labelledby="portfolio-local-title">
            <Shield aria-hidden="true" />
            <div>
              <h2 id="portfolio-local-title">This page does not upload your code.</h2>
              <p>Sharing or bookmarking this address does not share your code. Another browser cannot get the code from this page. The app may still check whether you are signed in, but downloading the portfolio page does not send your code anywhere.</p>
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
              <p className="eyebrow">Code to download</p>
              <h2 id="portfolio-source-title">{project.downloadFileName}</h2>
              <p>This is the code currently saved for the final step in this browser. It may differ from the code used in your last check.</p>
              <pre aria-label={`Code for ${project.downloadFileName}`}><code>{snapshot.source}</code></pre>
            </section>
          </div>

          <section className="portfolio-disclosure" aria-labelledby="portfolio-disclosure-title">
            <p className="eyebrow">Before you download</p>
            <h2 id="portfolio-disclosure-title">Check what the file contains.</h2>
            <ul>
              <li>The downloaded file includes the displayed name and exact code shown above.</li>
              <li>Review comments and text in the code. They may contain a name, password, secret, or other personal information.</li>
              <li>Anyone who receives the file can read, copy, and share it.</li>
            </ul>
            <details>
              <summary>Technical privacy details</summary>
              <ul>
                <li>The app does not add your GitHub login, account email, access tokens, IP address, points, streak, review schedule, program output, check history, or practice answers.</li>
                <li>Your displayed name and code are included exactly as shown, so they may contain personal or sensitive information.</li>
                <li>The downloaded page is one HTML file with no scripts. Downloading it does not upload your code.</li>
              </ul>
            </details>
            <div className="portfolio-certificate-note"><TriangleAlert aria-hidden="true" /><p>{portfolioIntegrityNote}</p></div>
            <label className="portfolio-confirmation">
              <input
                checked={confirmed}
                onChange={(event) => setReviewedKey(event.target.checked ? reviewKey : null)}
                type="checkbox"
              />
              <span>I reviewed the displayed name and code above and understand that the file is not a certificate.</span>
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
