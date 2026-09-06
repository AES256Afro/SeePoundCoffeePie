# Guided project review, September 6, 2026

## Work window and boundaries

Approved four-hour window: 18:27 to 22:27 UTC, September 6 (1:27 to 5:27 PM America/Chicago).
Work in `/Users/chris/Projects/SeePoundCoffeePie`. Keep this session local. No commits, pushes, deployments, paid services, hosted model calls, or live Cloudflare runner checks. Preserve the pre-existing LLM and core-course changes.

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

Next: milestone 2, then compact the existing project guides for milestone 3. Read ProjectStudio and the existing project tests first. Preserve course IDs, assessment requirements, and server-owned tests. Do not claim production or real language execution from mocked browser tests.

Scheduled follow-up: `seepoundcoffeepie-four-hour-course-improvements`, attached to this task, every 15 minutes. At or after 22:27 UTC pause it and provide a final handoff instead of beginning more work.
