import { useMemo, useState } from 'react'
import {
  Code2,
  LockKeyhole,
  Search,
  X,
} from 'lucide-react'
import { codebookEntries, codebookExampleState, codebookMatches } from './data/codebook'
import { courseDefinition } from './data/course-registry'
import { trackById } from './data/curriculum'
import type { LearnerProgress } from './types'

export function CodebookRoute({ progress }: { progress: LearnerProgress }) {
  const [query, setQuery] = useState('')
  const [visibleCount, setVisibleCount] = useState(16)
  const track = trackById(progress.activeLanguage)
  const filteredEntries = useMemo(
    () => codebookEntries.filter((entry) => codebookMatches(entry, query, track.id)),
    [query, track.id],
  )
  const entriesWithExamples = codebookEntries.filter((entry) => entry.examples?.[track.id])
  const unlockedExamples = entriesWithExamples.filter((entry) => (
    codebookExampleState(entry, track, progress.completedMissions) === 'unlocked'
  )).length
  const visibleEntries = query.trim()
    ? filteredEntries
    : filteredEntries.slice(0, visibleCount)

  return (
    <main className="content-page">
      <div className="page-heading page-heading--simple">
        <div><h1>Code reference</h1><p>Search definitions at any time. Examples appear after the related lesson.</p></div>
      </div>
      <section className="codebook-tools" aria-label="Code reference controls">
        <label className="codebook-search">
          <Search size={18} />
          <span className="sr-only">Search the code reference</span>
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search variable, true, braces, ==..." />
          {query && <button onClick={() => setQuery('')} aria-label="Clear code reference search"><X size={15} /></button>}
        </label>
        <div className="codebook-unlocks">
          <small>{track.shortName} examples</small>
          <b>{unlockedExamples} of {entriesWithExamples.length} available</b>
          <span>Examples appear as you complete lessons.</span>
        </div>
      </section>
      {filteredEntries.length > 0 ? (
        <>
        <div className="glossary-grid">
          {visibleEntries.map((item, index) => {
            const exampleState = codebookExampleState(item, track, progress.completedMissions)
            const example = item.examples?.[track.id]
            const requiredMission = item.unlockAfter ? track.missions[item.unlockAfter - 1] : undefined
            const dataToolsDefinition = item.unlockAfterMissionId
              ? courseDefinition('python-data-tools')
              : undefined
            const dataToolsModuleIndex = dataToolsDefinition && item.unlockAfterMissionId
              ? dataToolsDefinition.missionIds.indexOf(item.unlockAfterMissionId)
              : -1
            const requiredLabel = dataToolsModuleIndex >= 0
              ? dataToolsDefinition?.moduleTitles[dataToolsModuleIndex]
              : requiredMission?.title
            return (
              <details className="glossary-entry" key={item.term}>
                <summary>
                  <span className="glossary-number">{String(index + 1).padStart(2, '0')}</span>
                  <Code2 aria-hidden="true" size={20} />
                  <span>
                    <h2>{item.term}</h2>
                    <p>{item.plain}</p>
                  </span>
                </summary>
                <div className="glossary-entry__content">
                  {exampleState === 'unlocked' && example && (
                    <div className="glossary-example"><small>{track.shortName} example</small><code>{example}</code></div>
                  )}
                  {exampleState === 'locked' && (
                    <div className="glossary-example-lock"><LockKeyhole size={15} /><span><b>Example not available yet</b>Complete {requiredLabel ?? 'the related module'} to see it.</span></div>
                  )}
                </div>
              </details>
            )
          })}
        </div>
        {!query.trim() && visibleEntries.length < filteredEntries.length && (
          <div className="codebook-more section-heading-open">
            <p>Showing {visibleEntries.length} of {filteredEntries.length} definitions.</p>
            <button className="secondary-action" onClick={() => setVisibleCount((current) => current + 16)}>
              Show more definitions
            </button>
          </div>
        )}
        </>
      ) : (
        <section className="codebook-empty">
          <Search size={28} />
          <h2>No definition matches “{query}”</h2>
          <p>Try a plain word such as text, number, decision, output, or braces.</p>
          <button className="secondary-action" onClick={() => setQuery('')}>Clear search</button>
        </section>
      )}
    </main>
  )
}
