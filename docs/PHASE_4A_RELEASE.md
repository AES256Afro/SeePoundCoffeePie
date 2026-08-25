# Phase 4A Python Project Studio Release

Release date: 2026-08-25

## Outcome

Phase 4A adds the first full guided project after a foundation course. A learner who completes Python Foundations can open `Your First Interactive Program`, move through 12 short checkpoints, and build a downloadable Coffee Counter program that asks questions, stores answers, converts text, calculates a total, and prints a personalized result.

The project does not assume that the learner already understands words such as string, variable, integer, prompt, conversion, f-string, traceback, or test case. Each term appears with a plain-language definition before the learner must use it. Early checkpoints contain one small blank. Later checkpoints ask for a complete line. The final two checkpoints remove fill-in markers and ask the learner to assemble familiar pieces.

Phase 4A is intentionally one production-quality Python project, not four thin language reskins. The shared project route, workspace, persistence, assessment, progress, and accessibility contracts now exist for later C++, C#, and Java projects.

## Learner path

The project follows this sequence:

1. Use `print` to display a string.
2. Predict how quotation marks affect displayed text.
3. Store and retrieve a string variable.
4. Store an integer without quotation marks.
5. Multiply two integer variables.
6. Use `input` and store its return value.
7. Recognize that `input` returns string text.
8. Convert digit text with `int()`.
9. Build a report with an f-string.
10. Run faulty code, read a `ValueError` traceback, and repair the data.
11. Write complete conversion, calculation, and report lines without blanks.
12. Build the complete interactive Coffee Counter and pass changing input cases.

The 12 checkpoints contain 10 editable Python exercises and two retrieval questions. They award their authored XP once. Completing the final checkpoint records the project once, awards 50 star shards once, and advances the streak once. Reopening or rechecking completed work cannot award the same checkpoint or project reward again.

## Bookmarkable interface

The project overview is:

```text
/projects/python/first-interactive-program
```

Each checkpoint has an exact route:

```text
/projects/python/first-interactive-program/:checkpoint-id
```

The overview appears as the featured guided project in the catalog and after the Python course outline. Python Foundations remains the prerequisite. A locked learner can see the project outcome, vocabulary progression, checkpoint names, and objectives before the editor becomes available. An unavailable later checkpoint fails safely to the overview. An unknown checkpoint uses the normal not-found page.

The first-load academy bundle carries only a small public project manifest for navigation, records, and titles. The full 12-checkpoint teaching curriculum and project studio load when the learner opens a project route. The release gate enforces separate first-load and total bundle budgets and scans every emitted browser asset for private assessment markers.

The desktop workspace has two deliberate regions:

- a reading pane for the objective, new words, explanation, analogy, and written requirements;
- a task pane for the one current job, code-shape guide, editor, input, console, checks, hint, and next action.

At narrow widths these regions become one reading order. The interface keeps normal browser Tab behavior, supports Control or Command plus Enter for an official check, announces runner state without reading arbitrary program output aloud, keeps the active control focusable while a run is pending, and scrolls the current checkpoint marker into view after a deep link.

## Run and Check are different

`Run` is an experiment. It executes the current source once with the learner's practice input and does not return grading tests or change checkpoint progress.

`Check checkpoint` is the official assessment. It first applies the learner-visible requirements locally, then asks the isolated server runner to enforce the assignment-owned output and structural checks. Only a completed result with at least one returned test and every returned test passing awards completion.

This distinction lets an absolute beginner try values freely without turning every experiment into a failure record. It also prevents a caller from selecting `run` and receiving official credit without official tests.

## Final-project assessment boundary

The final Coffee Counter check uses:

- one visible input and expected output shown to the learner;
- three server-owned input and output cases whose values are not shipped to the browser;
- six server-owned code-shape requirements covering the price, both `input` calls, `int` conversion, multiplication, and the final f-string.

Private cases, server-owned structural requirements, and the reference solution live in `src/data/python-interactive-project.server.ts`. The client curriculum module does not import that module. A regression test verifies the source boundary, and the production asset scan verifies that private names, case identifiers, expected results, unique reference lines, and the complete solution do not appear in emitted browser JavaScript or CSS.

An official multi-case check uses a different fresh Cloudflare Sandbox VM for every visible or protected case. The trusted coordinator writes the same source and one server-owned input into each isolated VM, collects the bounded result, and destroys that VM before starting the next case. Processes, memory, sockets, and files therefore cannot cross a case boundary. The trusted supervisor also removes learner-controlled workspace and temporary paths before and after its one execution as defense in depth.

The six final code requirements are evaluated from Python's parsed abstract syntax tree inside the trusted supervisor, before learner code runs. The supervisor parses the exact source bytes with the same encoding-cookie rules used by Python execution, accepts only the small straight-line statement and expression grammar taught by this project, records bounded structural facts, and returns those facts only to the coordinator. Comments and ordinary string contents are not executable syntax. Conditional suites, loops, functions, imports, exception handling, early exits, line-continuation tricks, parser-encoding disagreements, name shadowing, unsupported calls, and duplicate required assignments fail closed. The coordinator validates the analysis schema, requires exactly one correct assignment for each required name, and checks direct f-string fields. The analysis never enters the public runner result.

If a private case fails, the result contains only the visible example output, a generic private-case summary, and a beginner-safe diagnostic. It does not return the private input, expected output, case identity, reference solution, or private-case stderr.

## Data and privacy boundary

Project code is deliberately separate from synchronized learner progress.

Browser-local project draft storage contains only source text keyed by project and checkpoint. Reset removes one checkpoint draft without erasing other project work or completion. A finished source file can be downloaded as `coffee-counter.py`.

Browser-local official-check history contains only:

- checkpoint identifier;
- check time;
- pass or fail;
- passed-check count;
- total-check count.

History is capped at 20 entries. It contains no source, standard input, stdout, stderr, diagnostic text, account data, or raw answer. It is not synchronized.

The version 1 learner record adds only:

- `completedProjectCheckpoints`;
- `completedProjects`;
- ordinary aggregate concept progress and earned rewards.

Old version 1 browser, backup, and remote records that omit the new arrays migrate to empty arrays. Unknown or duplicate project completion identifiers are rejected from backups and remote records. Conservative synchronization unions known completion identifiers while keeping the existing maximum-value strategy for XP, shards, streak, and concept aggregates. Source and detailed check history never enter D1, backup JSON, or synchronization requests.

## Assessment integrity and repetition

All authored code requirements are now enforced by the server runner in addition to the visible output. Printing a memorized output while omitting the required variables, conversion, or calculation does not pass.

Choice and prediction answers use a stable exercise-specific ordering instead of leaving the correct answer in a repeated authoring position. The mapping from each answer ID to its explanation remains unchanged, so evaluation and accessibility labels continue to use the authored answer rather than a display position.

Project checkpoints update the same spaced concept model used by foundation lessons. A correct first completion strengthens that project concept. The first failed official attempt records one incorrect retrieval for an incomplete checkpoint. Repeated clicking during the same visit does not create a stream of duplicate failures.

## Verification contract

The local release gate must pass:

```bash
npm run check:release
npm run deploy:dry-run
```

The runner boundary must pass:

```bash
npm run check:runner:image
npm run check:runner:staging
npm run check:runner:project:staging
npm run check:runner:production
npm run check:runner:project:production
npm run check:runner:smoke
```

Automated coverage includes:

- all 12 authored checkpoints and their beginner-content schema;
- all editable project runner assignments;
- rejection of memorized visible output when required code is missing;
- fail-closed Python AST analysis for comments, string decoys, unreachable suites, explicit line continuations, early exits, unsupported control flow, name shadowing, and duplicate assignments;
- visible and private multi-case aggregation;
- private-case result scrubbing;
- workspace rewrite counts for every protected case;
- run versus check request validation and client forwarding;
- project route parsing and canonical-link generation;
- locked, unlocked, unavailable, and unknown project routes;
- browser-local draft recovery and bounded summary history;
- idempotent XP and project rewards;
- old-record migration, backup validation, and conservative cross-device merge;
- correct-answer display positions across the authored curriculum;
- hidden-assessment exclusion from the client source module and production assets.

The browser gate covers the open desktop overview, desktop split workspace, and a 390 CSS-pixel overview and editor flow. It verifies no horizontal overflow, visible Run, Reset, Download, Hint, and Check controls, a readable 16-pixel mobile editor, accessible route headings, and current-checkpoint navigation.

## Deployment and recovery

The runner kill switch remains independent from static learning and accounts. Pause new production runs before deploying Worker code, deploy and verify the site while execution is paused, then re-enable the runner only after the staging and production regression gates pass.

This release does not require a new D1 migration because the synchronized record remains version 1 JSON inside the existing row. If the project UI or assessment must be rolled back, restore the previous compatible Worker version. Do not delete the D1 database, rotate `LEARNER_DATA_SECRET`, or remove existing project completion arrays from learner records. Older code already ignores additional JSON fields, and the current validators migrate missing fields safely.

If multi-case grading fails while the rest of the academy is healthy, disable the runner through `RUNNER_CONFIG`. The project overview, reading material, local drafts, downloads, accounts, and foundation lessons remain available while new live runs are paused.

## Release evidence

Phase 4A source commit `008b3ae2955d18a695adfbf83b3a519474c4ba6c` was published to `main` after the complete local and staging gates passed. GitHub CI run `32901475235` then passed tests, lint, production build, and bundle budgets.

The controlled staging release used Worker version `843c121d-dea0-46df-8cc4-814ba17019b7`. The staging runner stayed paused during deployment, was enabled only for the test window, passed the four-language platform gate and the complete project-security probe, then returned to `enabled: false`.

Production Worker version `7aa76bb5-b421-403b-81c8-381e4a06319e` was deployed with new execution paused. The final container applications reported `ready` on these reviewed images:

- Python: `sha256:23dd12f3cf2a7755503dd5fafa448223fb73ae21983aff868a3053ca2068f20d`
- C++: `sha256:31713701bff59b15efe60d39a4f6b9be9ae92941d578e868c4a8c66683ab362b`
- C#: `sha256:d13b7702eba2c4eed379898082b6dfae9f9e6212b526476da4115f9342a38a7b`
- Java: `sha256:ef20124667fb996348ab5b978fc920bdd35bf8fa644154f07f2ed4312b116077`

The first production probe ran before every container application had finished provisioning. The new coordinator rejected the older Python supervisor response as a `system_error`, and the safety trap immediately paused execution. After all four applications reported `ready` on version 2 and the expected digests, the complete production gate passed: four-language execution, seccomp network denial, CPU, memory, output, and storage ceilings, case isolation, authorization, project practice mode, protected behavioral cases, unreachable-code regressions, exact-byte source-encoding regression, the valid ten-check Coffee Counter assessment, and the final smoke probe. Production execution was then restored to `enabled: true` and a final smoke probe passed.

The production browser pass verified the public project overview at normal desktop size and at a 390 by 844 CSS-pixel viewport. The mobile page retained a 16-pixel body font, a distinct 42.9-pixel project heading, no horizontal overflow, an accessible expandable navigation menu, and no browser console warnings or errors. Live verification also passed the social preview, apex domain, `www` redirect, security headers, 17 canonical routes, and two legacy routes.
