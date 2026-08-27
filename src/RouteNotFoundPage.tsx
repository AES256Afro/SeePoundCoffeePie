import { ArrowRight, Compass } from 'lucide-react'
import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from 'react'
import { homePath } from './lib/routes'
import type { LearnerProgress } from './types'

interface RouteLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  onNavigate?: (path: string) => void
  to: string
}

export function RouteLink({ children, onClick, onNavigate, target, to, ...props }: RouteLinkProps) {
  const follow = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event)
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || target === '_blank') return
    event.preventDefault()
    if (onNavigate) onNavigate(to)
    else {
      window.history.pushState({}, '', to)
      window.dispatchEvent(new PopStateEvent('popstate'))
    }
  }
  return <a {...props} href={to} onClick={follow} target={target}>{children}</a>
}

interface RouteNotFoundPageProps {
  brand?: ReactNode
  onNavigate?: (path: string) => void
  progress: Pick<LearnerProgress, 'onboardingComplete'>
}

export function RouteNotFoundPage({ brand, onNavigate, progress }: RouteNotFoundPageProps) {
  return (
    <main className="route-message-page" id="main-content" tabIndex={-1}>
      {brand}
      <section className="route-message-card">
        <p className="kicker"><Compass size={15} /> Page not found</p>
        <h1>We could not find that page</h1>
        <p>The address may be incomplete, outdated, or mistyped. Use one of the links below to continue.</p>
        <div className="landing-actions">
          <RouteLink className="primary-action" onNavigate={onNavigate} to="/">Go to the start page <ArrowRight size={17} /></RouteLink>
          {progress.onboardingComplete && <RouteLink className="secondary-action" onNavigate={onNavigate} to={homePath()}>Go to learning home</RouteLink>}
        </div>
      </section>
    </main>
  )
}
