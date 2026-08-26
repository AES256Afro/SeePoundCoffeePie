# Phase 4E Adaptive Practice Release

Release date: 2026-08-25

## Outcome

Phase 4E replaces the one-mission Practice recommendation with one short adaptive set drawn across completed foundation modules in the active language. The learner sees what will be reviewed, where each idea was learned, why it was selected, and how long the set should take before starting.

The review remains authored curriculum. It does not generate questions, invent syntax, infer project relationships from names, or introduce a concept from an unfinished module. The same exercise renderer, protected runner assignment, feedback, hint, and memory-repair behavior used by the foundation courses remains in place.

## Beginner-facing Practice page

`/practice/:language` now has four honest states:

1. A new learner sees `Practice what you have learned` and a real link to the first normal lesson. Reviews begin after the learner finishes that module. Practice does not launch a practice-mode copy that cannot complete the course.
2. A learner with scheduled ideas sees `A short review is ready`, the question count, an estimated time, and an ordered review plan.
3. A learner with no due ideas but a weak future idea sees `You are caught up for today` and an optional gentle pass.
4. A learner whose practiced ideas are strong sees the next scheduled date and an optional fresh review.

The review plan uses plain phrases such as `Due today`, `Ready for review`, `Could use another pass`, and `Keep it fresh`. It does not show raw scheduler strength, `BEST MATCH`, or `WAITING` labels.

The page uses the active language symbol and open document layout. The previous orbit graphic and space-focused page title are gone.

## Deterministic curriculum boundary

The selector is a pure curriculum decision based on:

- the active language track;
- completed foundation mission identifiers;
- the existing aggregate concept record;
- the learner's local calendar date;
- a maximum of five exercises;
- a maximum of two exercises from one mission.

Selection uses this stable order:

1. concepts due today or earlier;
2. future concepts with memory strength zero through two;
3. strong concepts kept fresh while space remains;
4. earlier review date;
5. lower strength;
6. more prior misses;
7. authored mission and exercise order;
8. concept identifier as the final tie breaker.

Every selected exercise and concept is unique. A concept with several completed authored exercises uses a deterministic local-date rotation. The same curriculum, record, and date produce the same set. No random number or current millisecond value affects selection.

Project checkpoint concepts remain outside this first adaptive set. Their concept identifiers do not map mechanically to foundation identifiers, and the final project assessments are too large for a short retrieval set. A later expansion must use explicit authored relationships and review-sized exercises.

## Bookmarking and ephemeral session state

The Practice overview is bookmarkable at:

```text
/practice/:language
```

The active review entry is bookmarkable at:

```text
/practice/:language/session
/practice/:language/session/:step
```

The URL contains the language and, during an open session, the numeric question position only. It does not expose due concept identifiers, answer identifiers, or a list of learner weaknesses in browser history, referrer data, or edge request logs.

The selected authored exercise identifiers are frozen in tab-scoped session storage while the review is open. Refreshing the same tab preserves the set and current step. Browser Back and Forward can restore the question position. A session URL opened in a new tab or after the ephemeral record is gone builds a new set from the current learning record, so it is a stable session entry rather than a permanent claim about one exact question. Completing or returning to the Practice overview clears the ephemeral set so the next review is built from the updated schedule.

The ephemeral record has a fixed version, language, and bounded exercise-ID array. It stores no answer, source code, standard input, standard output, compiler diagnostic, concept identifier, score, or durable session history. A malformed, duplicated, cross-language, overlong, future, or otherwise ineligible stored set is discarded and rebuilt from completed curriculum.

## Review integrity

Adaptive Practice awards zero XP and zero star shards. This prevents a learner from replaying one exercise for unbounded rewards without adding durable attempt history.

A correct adaptive answer updates only the existing aggregate concept values:

```text
strength
correct
incorrect
dueAt
```

An incorrect answer is recorded at most once for that exercise in the first pass. A missed item returns once in the memory-repair round. Runner infrastructure and transport failures do not weaken the concept or mark the learner wrong.

Legacy `/practice/:language/missions/:mission-id` bookmarks remain supported only for a mission already listed as complete. Legacy concept lists are allowlisted, deduplicated, bounded to five, and returned in authored order. A current unfinished mission cannot be unlocked by changing the URL.

Opening a valid later question URL does not credit earlier questions. The player searches circularly for the next unanswered exercise and can finish only after every exercise in the frozen set has been answered correctly in the current mounted session. Memory repair begins only after that gate passes.

The same sequencing guard protects normal first-time modules. Opening a module's final lesson directly cannot skip its earlier lessons, start memory repair early, or complete the module. After the visible lesson is answered, the player routes to the next unanswered lesson until the full authored module has been completed.

Completed-module replays remain useful retrieval practice, but they award zero XP and zero star shards. They can update aggregate memory strength and the next review date without duplicating rewards from the original module work.

## Record and synchronization hardening

Phase 4E keeps learner record version 1, backup version 1, and the existing D1 schema.

Browser-local progress now passes through a tolerant allowlisted normalizer before use. The normalizer:

- preserves valid older records that omit project arrays;
- defaults invalid scalar values safely;
- filters and deduplicates known completion identifiers;
- drops unknown or malformed concept entries;
- ignores unknown root properties;
- prevents null concepts, impossible dates, unsafe counts, and invalid strengths from reaching the scheduler.

Backup, synchronization, and Worker requests continue to use the strict version 1 parser. The shared parser prevents the browser, backup, and Worker contracts from drifting apart.

When two devices have the same memory strength but different review dates, synchronization now keeps the earlier date. The concept merge is deterministic regardless of which record is passed first. A genuinely stronger concept still owns its schedule. Callsign, active language, and daily goal remain intentionally local-preference fields during a merge.

Semantically equal synchronized records compare completion sets and concept entries in canonical order. A different JSON insertion order no longer creates a false conflict. Progress counters saturate at JavaScript's maximum safe integer instead of producing a record that the strict parser would later reject.

Session storage rejects empty, duplicated, oversized, overlong, or malformed exercise-ID arrays before attempting curriculum resolution. Legacy route parsing rejects repeated `concepts` query parameters. The scheduler uses the same true calendar-date validator as the durable record parser, so an impossible date such as February 31 falls back safely instead of influencing selection.

Resetting learning progress clears the frozen Practice queue for Python, C++, C#, and Java before returning to intake. Saved project drafts and their bounded local check summaries remain separate browser-local work, as the Settings explanation states.

Lesson and project progress callbacks now apply attempts and completions to the current React state through functional updates. A delayed runner result cannot reconstruct the record from an older captured snapshot and overwrite a newer local or synchronized change.

Lesson and project runner requests also carry lifecycle tokens. Navigating to another question or checkpoint, returning to an overview, leaving the player, unmounting the workspace, or resetting a project draft invalidates the old token. A late result cannot update feedback, history, concept progress, XP, checkpoint completion, or project completion after the learner has moved on. If browser storage refuses a write, the current in-memory learning session remains usable instead of crashing.

## Home and Practice consistency

The learner home now uses the same completed-foundation and active-language eligibility rule as Practice. A due Java concept no longer appears as a Python review count. Project concepts and other-language concepts do not inflate the destination count.

## Accessibility contract

The review plan is an ordered list with visible question numbers, source modules, and text reasons. The primary start control is a real link. It can be copied, opened in another tab, and used with ordinary browser navigation.

The lesson progress bar announces `Question N of M` through `aria-valuetext`, while the same position remains visible. Question headings receive focus after navigation. Choice fieldsets, ordering button names, hints, Control or Command plus Enter submission, and normal Tab movement remain available.

Runner status uses one concise status announcement. Console output itself is no longer an entire live region, which prevents a screen reader from automatically reading arbitrary program output as it changes.

## Data and privacy boundary

The durable learner record remains limited to settings, rewards, known completion identifiers, and aggregate concept progress. Adaptive Practice does not add:

- raw answers or answer identifiers;
- source code;
- standard input or output;
- compiler messages or protected runner facts;
- selected review queues;
- detailed attempt history;
- per-attempt timestamps;
- adaptive telemetry.

The existing record is a private learning aid, not authoritative proof of skill. It must not be used for public leaderboards, certificates, paid unlocks, employment claims, or security permissions.

## Verification contract

The local release gate must pass:

```bash
npm run check:release
npm run deploy:dry-run
npm run check:runner:image
```

Staging and production verification must cover:

```bash
npm run check:runner:staging
npm run check:runner:project:staging
npm run check:runner:cpp-project:staging
npm run check:runner:csharp-project:staging
npm run check:runner:java-project:staging
npm run check:runner:production
npm run check:runner:project:production
npm run check:runner:cpp-project:production
npm run check:runner:csharp-project:production
npm run check:runner:java-project:production
npm run check:runner:smoke
npm run check:live
```

Automated coverage includes:

- deterministic cross-mission selection in all four foundation languages;
- due, weak, fresh, and new-learner states;
- a five-item total cap and two-item per-mission cap;
- one exercise and one concept per set item;
- other-language, project, unfinished, unknown, and malformed data exclusion;
- frozen tab-scoped sessions with same-tab refresh, Back, Forward, and question-position coverage;
- direct later-step entry that still requires every earlier unanswered question before completion;
- tampered ephemeral and legacy route rejection;
- zero XP and zero shard adaptive completion, mistake repair, and completed-module replay;
- active-language home and Practice count agreement;
- malformed browser-record recovery and exact version 1 backup compatibility;
- deterministic equal-strength synchronization schedules;
- insertion-order-independent record matching and safe counter saturation;
- functional lesson and project progress updates;
- delayed runner responses ignored after Exit, normal lesson changes, legacy Practice Back navigation, project checkpoint changes, project overview, reset, and unmount;
- direct final-lesson entry that still requires every earlier unanswered first-time lesson before memory repair or module completion;
- browser-storage refusal handled without losing the active in-memory session;
- keyboard, focus, runner status, and completion behavior.

## Deployment and recovery

Phase 4E changes client and Worker application code only. It does not change a runner assignment, supervisor, compiler, runtime, image, D1 migration, secret, or durable record shape.

The full four-language runner regression still runs before and after release because adaptive sessions reuse ordinary foundation assignments. Rollback restores the prior Worker version. No database rollback, secret rotation, or learner-record conversion is required.
