import { useMemo, useState } from 'react'
import {
  Code2,
  LibraryBig,
  LockKeyhole,
  Search,
  Sparkles,
  X,
} from 'lucide-react'
import { codebookEntries, codebookExampleState, codebookMatches } from './data/codebook'
import { courseDefinition } from './data/course-registry'
import { trackById } from './data/curriculum'
import type { LearnerProgress } from './types'

export function CodebookRoute({ progress }: { progress: LearnerProgress }) {
  const [query, setQuery] = useState('')
  const track = trackById(progress.activeLanguage)
  const filteredEntries = useMemo(
    () => codebookEntries.filter((entry) => codebookMatches(entry, query, track.id)),
    [query, track.id],
  )
  const entriesWithExamples = codebookEntries.filter((entry) => entry.examples?.[track.id])
  const unlockedExamples = entriesWithExamples.filter((entry) => (
    codebookExampleState(entry, track, progress.completedMissions) === 'unlocked'
  )).length

  return (
    <main className="content-page">
      <div className="page-heading page-heading--simple">
        <div><p className="kicker"><LibraryBig size={14} /> PLAIN-LANGUAGE REFERENCE</p><h1>Cadet codebook</h1><p>Search every definition now. Code examples unlock after you learn them in a mission.</p></div>
      </div>
      <section className="codebook-tools" aria-label="Codebook controls">
        <label className="codebook-search">
          <Search size={18} />
          <span className="sr-only">Search the codebook</span>
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search variable, true, braces, ==..." />
          {query && <button onClick={() => setQuery('')} aria-label="Clear codebook search"><X size={15} /></button>}
        </label>
        <div className="codebook-unlocks">
          <small>{track.shortName.toUpperCase()} EXAMPLES</small>
          <b>{unlockedExamples} of {entriesWithExamples.length} unlocked</b>
          <span>Complete lessons to reveal syntax you have already met.</span>
        </div>
      </section>
      {filteredEntries.length > 0 ? (
        <div className="glossary-grid">
          {filteredEntries.map((item, index) => {
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
              <article key={item.term}>
                <span className="glossary-number">{String(index + 1).padStart(2, '0')}</span>
                <Code2 size={21} />
                <h2>{item.term}</h2>
                <p>{item.plain}</p>
                <div className="glossary-analogy"><Sparkles size={15} /><span><b>On the ship</b>{item.ship}</span></div>
                {exampleState === 'unlocked' && example && (
                  <div className="glossary-example"><small>{track.shortName.toUpperCase()} EXAMPLE</small><code>{example}</code></div>
                )}
                {exampleState === 'locked' && (
                  <div className="glossary-example-lock"><LockKeyhole size={15} /><span><b>EXAMPLE LOCKED</b>Complete {requiredLabel ?? 'the introducing mission'} to reveal it.</span></div>
                )}
              </article>
            )
          })}
        </div>
      ) : (
        <section className="codebook-empty">
          <Search size={28} />
          <h2>No codebook term matches “{query}”</h2>
          <p>Try a plain word such as text, number, decision, output, or braces.</p>
          <button className="secondary-action" onClick={() => setQuery('')}>Clear search</button>
        </section>
      )}
    </main>
  )
}
