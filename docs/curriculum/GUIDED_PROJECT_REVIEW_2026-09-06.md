# Guided project review, September 6, 2026

## Work window and boundaries

Approved four-hour window: 18:27 to 22:27 UTC, September 6 (1:27 to 5:27 PM America/Chicago).
Work in `/Users/chris/Projects/SeePoundCoffeePie`. Keep new development local unless the user requests another release. No paid services, hosted model calls, or live Cloudflare runner checks. Preserve existing changes.

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

The user has now explicitly requested that all pending changes be pushed to production. Milestones 2 and 3 are the release scope. There are no runner, grading-policy, database, or secret changes. Use the site-only deployment wrapper, verify staging and production, preserve every container image, and restore production execution to its recorded pre-release state. Actual hosted execution tests are excluded to respect the user's cost constraint. Do not count pending milestone 4 as completed or published.

Scheduled follow-up: `seepoundcoffeepie-four-hour-course-improvements`, attached to this task, every 15 minutes. At or after 22:27 UTC pause it and provide a final handoff instead of beginning more work.
