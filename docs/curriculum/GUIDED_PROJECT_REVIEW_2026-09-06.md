# Guided project review, September 6, 2026

## Work window and boundaries

Approved four-hour window: 18:27 to 22:27 UTC, September 6 (1:27 to 5:27 PM America/Chicago).
Work in `~/Projects/SeePoundCoffeePie`. Keep new development local unless the user requests another release. No paid services, hosted model calls, or live Cloudflare runner checks. Preserve existing changes.

The user requested publication after milestone 1. That release is complete: commit `8781c2bae26d07566192b2a38ea146a19ef03022`, production Worker `49d859e1-fbc8-45f8-8153-28d4689dd1ab`, GitHub CI successful, 86 local browser tests passed, staging and production browser checks passed. All four container images stayed unchanged. Production execution was restored to its prior enabled state; staging remains paused. Do not repeat the release.

## Milestones

1. Review all four final guided projects. Add optional planning, concrete input experiments, truthful input limits, and expected output. Correct misleading C# input and function explanations.
2. Check all 48 checkpoint transitions, browser history, saved drafts, and final completion. Fix reproducible defects without weakening assessment checks.
3. Reduce unnecessary project scrolling and review small-screen keyboard use. Keep explanations available, not repeated across permanently open panels.
4. Review input handling lessons and assess the next practice after each project. Add useful follow-up teaching only where a real gap exists, with clear scope and no hidden prerequisites.
5. Run local unit, browser, build, lint, language, and bundle checks. Record actual evidence and leave a safe stopping point by the deadline.

## Findings and changes in progress

- All four final projects already require complete code, not just blank replacement. Preserve that progression and stable checkpoint IDs.
- The shared project UI did not show authored expected output. Learners should not have to guess the exact report formatting before an official check. Add a closed, optional expected-output disclosure for editable steps, including intentional starter-error context where authored.
- Add optional final-project planning help: identify fixed and changing values, order the jobs, predict different inputs, and state what this small program does not validate yet.
- C# incorrectly promised `visitCount` always receives an integer when using `int.Parse(Console.ReadLine() ?? "0")`. A missing line gets the fallback; malformed text can still throw. Correct that distinction.
- Explain PrintBadge as a local function in the top-level C# program, and distinguish the project's preferred definition order from a C# language requirement.

## Sources checked

- [Microsoft Learn: local functions](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/classes-and-structs/local-functions), particularly declaration placement and calls.
- [Microsoft Learn: converting strings to numbers](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/types/how-to-convert-a-string-to-a-number), including invalid or empty input and Parse exceptions.
- Existing server-owned project tests were inspected to keep proposed input examples within the taught task. Do not expose private test identities or change grading just to match new prose.

## Validation and next action

Milestone 1 completed locally at approximately 18:37 UTC.

- All 92 unit-test files passed: 1,134 tests.
- Four new Chromium tests passed at 375px width: keyboard opening and closing of optional help, exact final output, no document-width overflow, and reload preserving the checkpoint/editor starter.
- Build, lint, text-style, learner-language, bundle budget, and `git diff --check` passed.
- Total JavaScript 904.33 kB raw against 910 kB budget. Learning workspace CSS 32.47 kB against 32.50 kB budget. Do not expand budgets merely to fit added prose or styles.
- New tests: `src/ProjectStudio.review.test.tsx` and `tests/e2e/project-planning.spec.ts`.
- Inspected `/tmp/spcp-project-planning-csharp.png`. New details work, but the permanently expanded existing symbol guide and repeated project headings still make the mobile page too long. This is evidence for milestone 3, not a claim that the overall layout is finished.
- No live runners, commits, pushes, or deployments performed. Built preview at port 4198 can serve the new local build after reload.

## Milestone 2: navigation and drafts

Implemented locally after the release, approximately 19:24 UTC:

- Found and fixed a progression blocker: C# and Java checkpoint 10 were ordering exercises, but ProjectStudio only distinguished multiple-choice tasks from code. Ordering tasks incorrectly received a code editor and could not be answered through proper controls.
- Added arrow-button ordering using the existing styles, clear move announcements, disabled boundary controls, a non-solved starting order, and a Check order action. Neither exercise calls a runner.
- Editing code after a successful check now clears the stale success feedback. Previously the Finish/Next action could remain visible for a changed answer. Earned historical completion is preserved; the current editor result must be checked again.
- Added 14 unit tests covering all 48 checkpoint destinations and their correct task controls, both ordering completions and next-step navigation, draft isolation/remounting for all four projects, and final completion back to the overview. The final-completion responses are local mocks, not evidence of actual language execution.
- Added six Chromium tests covering all 48 deep-link destinations, browser Back, persisted drafts on reload, and keyboard-only ordering completion at 375px.
- Added an opt-in `preserveOnReload` setting to the browser seed fixture. The default fixture clears storage on every navigation; persistence tests now seed once so they test actual saved progress and drafts rather than overwrite them on reload. Existing tests keep their prior default.
- All 93 unit-test files passed: 1,148 tests. Ten targeted browser tests passed, including the four milestone-1 planning checks.
- Build, bundle privacy, size budget, lint, and text-style checks passed. JavaScript is 905.52 kB raw against the unchanged 910 kB cap. No new CSS was needed.
- Inspected `/tmp/spcp-project-order-csharp.png`: keyboard focus and 44px arrow controls are visible and fit the narrow screen. The sticky header is translucent over scrolled content, and the overall page remains lengthy. Address those under milestone 3.
- Full browser rerun passed: 92 Chromium tests in 1.5 minutes. Output is `/tmp/spcp-project-navigation-full-e2e.log`. Milestone 2 is complete locally.

## Milestone 3: compact project layout

- Removed the repeated objective paragraph. The task and main explanation remain visible.
- Kept code definitions and the familiar comparison in closed, keyboard-accessible disclosures, with separate planning and expected-output help preserved.
- Made the site and project headers opaque so scrolled text does not show through them. Reduced the oversized task heading without shrinking the teaching text.
- At 375px width, the first Python project page decreased from 2,865 to 2,292px tall, and the final project from 3,679 to 2,871px. The editors moved up by approximately 573 and 808px respectively. Both pages retain a 375px document width.
- Inspected the final-project mobile screenshot. The code guide control, editor, input area, and opaque headers fit the screen; long code lines remain scrollable inside the editor.
- Extended all four project planning browser tests to check keyboard opening and closing of the new disclosures and opaque header backgrounds.
- Complete release gate passed: 93 unit-test files, 1,148 tests, 92 Chromium tests, build, lint, curriculum, learner-language, text-style, social preview, assessment privacy, deployment boundary, and unchanged bundle budgets.

## Milestones 2 and 3 release checkpoint

The user's second publication request was completed on September 6. Commit `db963db5cce3919b16a7d0a686258891da970e5f` is pushed to main. GitHub CI run `34056017866` succeeded. Staging Worker `1e072fda-64a1-4450-8c03-e79df490db8b` and production Worker `9511ef68-cab3-4452-b5a4-ef4e17904d1c` passed site checks and desktop/mobile browser checks, including the repaired C# ordering step advancing to assembly. A first production browser attempt timed out on the LLM path; a fresh diagnostic and the complete rerun passed. The production entry asset, sitemap, and both LLM downloads matched the build byte-for-byte.

All four runner application snapshots remained unchanged. Production execution was restored to its recorded enabled state, and the final enabled status/grant check passed. Staging remains paused. No actual hosted execution, database migration, secret changes, or paid model calls were made. This is the current released baseline; do not repeat either release.

## Milestone 4: input limits and optional follow-up practice

Completed locally in the 20:13 UTC follow-up, after the second release:

- Reviewed all four projects' name input, number input, and final-project input limits. Python and Java introduced conversion without explaining failed conversion early enough. C++ initialization could be mistaken for proof of successful input. The C# name analogy blurred an empty answer and missing input.
- Added short explanations where these ideas first appear. Python distinguishes text conversion from deciding whether a negative cup count makes sense. Java names and explains NumberFormatException. C++ distinguishes attempted extraction, failed input, and partially consumed decimal text. C# keeps empty and missing cases separate.
- Added `public/learning-labs/project-input-practice.md`, an optional four-language workbook. It provides prediction tables, answer notes, blank versus ended-input context, conversion versus allowed-range rules, a break, retrieval questions, and one suggested extension in a separate copy of the learner's program.
- Added one closed disclosure to each project overview with a real download link. It is available even before course completion. No new prerequisite, completion record, grading requirement, runtime dependency, service, or hosted processing was added.
- The workbook can be completed on paper. Local execution is optional, and instructions explicitly keep graded source unchanged. It does not ask learners to trigger platform code checks.
- Checked official Python input/int, Oracle Integer.parseInt/Scanner, Microsoft Console.ReadLine/conversion, and Microsoft C++ input-stream references, linked beside the relevant workbook sections.
- Ran small local Python and C++ probes. Python rejected the decimal string, word, and empty string with ValueError. C++ read 4 from 4.5 and left .5 unread; word extraction set the failure state. A Java compiler was unavailable, and no dotnet command was installed. Java/C# examples are documentation-checked, not claimed as runtime-tested. No toolchains were installed.
- All 93 unit-test files passed: 1,154 tests. Fourteen targeted Chromium cases passed, including all 48 checkpoint routes, narrow-screen keyboard help, and downloads from all four project overviews without prerequisite completion. Downloaded bytes match the authored workbook, not an HTML fallback.
- Build, lint, text-style, learner-language, assessment-bundle privacy, bundle budgets, and diff whitespace checks passed. Total JavaScript is 906.51 kB against the unchanged 910 kB budget. Initial JavaScript remains 360.61 kB. The workbook is a separate static download and does not enlarge the first-load teaching bundle.
- After mobile visual review, changed the plain download link to the existing bordered secondary-action style with a download icon. Rebuilt and reran all eight planning/download browser cases successfully; the final screenshot confirms the control is distinct and fits the narrow page.
- Browser screenshot: `/tmp/spcp-input-workbook-java.png`. Unit log: `/tmp/spcp-project-input-full-unit.log`. Targeted browser log: `/tmp/spcp-project-input-browser.log`.

## Milestone 5: draft safety and complete local regression

Completed in the 20:37 UTC follow-up:

- Found a reproducible false save claim: ProjectStudio ignored the boolean returned by `saveProjectDraft` and always displayed Saved in this browser. Reset also ignored persistence failure and showed starter code even if the old saved draft remained.
- Added explicit starting, saved, unsaved, and reset-failure states. A failed save retains the editor text and shows an alert telling the learner to download a copy before leaving. A later successful edit clears the alert. The existing download action remains available.
- A failed reset now leaves the editor, result, and running work unchanged instead of claiming success. A successful reset still cancels stale execution and restores starter code. No storage schema, grading, runner, or progress rules changed.
- Added five unit tests for save failure/recovery in all four projects and reset failure/retry. Existing stale-runner tests still pass.
- Added four 375px Chromium cases that inject a draft-storage failure, verify the warning, download and compare the exact unsaved source, restore storage, edit again, then reload to verify the recovered draft. These tests use no hosted execution.
- Complete `npm run check:release` passed: 93 unit files, 1,159 tests, 100 Chromium cases, build, lint, content checks, assessment privacy, deployment-boundary checks, and unchanged bundle limits. Full output: `/tmp/spcp-milestone5-release-gate.log`.
- Total JavaScript is 907.10 kB against the unchanged 910 kB cap; initial JavaScript remains 360.61 kB. No CSS or service was added for the warning. The extra workbook remains a separate static download.
- Screenshot: `/tmp/spcp-draft-warning-csharp.png`. All milestone-4 and milestone-5 changes remain uncommitted and local after released commit `db963db`.
- The first screenshot scroll placed the warning above the sticky bars. Corrected the browser test's screenshot positioning to center the warning, added an explicit bounding-box check below the stepper, and reran all four storage-failure browser cases successfully. The final screenshot visibly shows the full warning and Not saved status. This changed test positioning only, not application behavior.

## Follow-up: preserve unreadable saved records

Completed in the 20:59 UTC follow-up:

- Confirmed the remaining draft-storage risk with failing regression tests before changing implementation: six cases failed against the old save/reset behavior.
- Saving no longer replaces an unreadable record with an empty record. Resetting one checkpoint no longer deletes the entire unreadable record. Unknown schema versions, invalid JSON, invalid draft maps, partial damage, and failed reads all refuse mutation.
- Reading remains tolerant enough to retrieve an intact checkpoint beside a damaged entry. Writing requires every source entry to be readable, so it cannot silently discard a damaged entry belonging to another checkpoint. Existing valid records still save/reset normally, and the existing source-only serialization boundary remains intact.
- Added unit checks for exact-byte preservation, read failure with writable storage, and salvaging an intact draft without rewriting the record. Added three Chromium cases for invalid JSON, a newer format, and a partly damaged record, verifying both save and reset warnings preserve the raw record and current editor contents.
- No automatic repair or destructive clear-storage action was added. The existing warning and source download are the safe fallback. A dedicated recovery/export interface is a possible future milestone, not part of this change.
- Complete local release gate passed: 93 test files, 1,165 unit tests, 103 Chromium tests, build, lint, content checks, privacy, deployment boundary, and bundle budgets. Log: `/tmp/spcp-draft-preservation-release.log`. Total JavaScript is 907.18 kB against the unchanged 910 kB cap; initial JavaScript remains 360.61 kB.
- Nothing was committed, pushed, deployed, or run on Cloudflare. Released baseline remains `db963db`; the input-practice and draft-safety changes remain local.

All five planned milestones and the identified follow-up defect are now implemented and locally verified. No known required implementation item remains in this bounded work list. Preserve this candidate rather than inventing additional scope or rerunning completed checks. A later publication still requires an explicit user request. Do not change services, runner state, or courses merely to fill the remaining time. At 22:27 UTC pause the heartbeat and summarize the final local/live split.

Scheduled follow-up: `seepoundcoffeepie-four-hour-course-improvements`, attached to this task, every 15 minutes. At or after 22:27 UTC pause it and provide a final handoff instead of beginning more work.

## Final handoff

The first received follow-up after the deadline arrived at 22:57 UTC. No new implementation or test runs were started. The scheduled follow-up was paused through the app and its stored status was verified as PAUSED.

All planned work and the identified draft-preservation follow-up are complete. The latest recorded full local check remains 1,165 unit tests and 103 browser tests passing. Source changes and the workbook are preserved locally, uncommitted, after `db963db`. Nothing was deployed during this final handoff. The latest release completed in this work window was `db963db`, with its staging and production evidence recorded above. Publishing the later input-practice and draft-safety changes remains a separate user-authorized action.
