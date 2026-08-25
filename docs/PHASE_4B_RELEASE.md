# Phase 4B C++ Project Studio Release

Release date: 2026-08-25

## Outcome

Phase 4B proves that the guided-project system works across languages by adding the first complete C++ project after C++ Foundations. A learner who completes that course can open `Your First Compiled Program`, move through 12 short checkpoints, and build a downloadable Observation Desk program that includes headers, enters `main`, writes console output, stores text and whole numbers, reads a full name, reads an integer, calculates a score, and returns a successful exit code.

The project begins before C++ syntax feels familiar. It explains what source code is, why C++ needs a compiler, what a header contributes, why execution begins in `main`, what `std::` means, why statements end with semicolons, and what `return 0;` tells the operating system. The learner sees one new idea at a time, practices it in a small exercise, and retrieves earlier ideas again before assembling the complete program.

Phase 4B also turns the Python-only project implementation into a reusable project platform. Public manifests, route loading, bookmarkable checkpoints, draft storage, completion records, downloads, course handoffs, and server-owned assessments now select a project by language and project identifier. Python and C++ keep separate teaching bundles and separate local drafts.

## Learner path

The C++ project follows this sequence:

1. Turn source code into a runnable program.
2. Find the program's starting doorway in `main`.
3. Send one line of text with `std::cout`.
4. Read and repair a first compiler message.
5. Store an observer's full name in `std::string`.
6. Store a whole-number scoring rule in an `int`.
7. Calculate focus points by multiplying two named integers.
8. Read a full name with `std::getline`.
9. Read a number with `std::cin`.
10. Build a report with a chained `std::cout` statement.
11. Connect the familiar pieces without fill-in markers.
12. Build the complete Observation Desk and pass changing input cases.

The 12 checkpoints contain 10 editable C++ exercises and two retrieval questions. Completing a checkpoint awards its authored XP once. Completing the final checkpoint records the C++ project once, awards its project reward once, and advances the streak once. Python and C++ project progress remain independent.

## Bookmarkable interface

The project overview is:

```text
/projects/cpp/first-compiled-program
```

Each checkpoint has an exact route:

```text
/projects/cpp/first-compiled-program/:checkpoint-id
```

The overview appears in the project catalog and after the C++ course outline. C++ Foundations remains the prerequisite. A locked learner can inspect the outcome, vocabulary progression, checkpoint names, and objectives before the editor becomes available.

The initial academy bundle contains only small public project manifests. Opening a project route loads the shared studio and only that project's teaching curriculum. Visiting the academy or a Python project does not download the C++ teaching module. The release gate verifies those split boundaries and scans every emitted browser asset for selected server-owned identifiers, hidden-case names, and private values.

## Beginner-facing compiler guidance

C++ compiler output is useful but can be overwhelming for a first-time programmer. The project studio therefore presents a short explanation first:

- what kind of problem the runner found;
- which source line is likely involved;
- one concrete next action in beginner language.

The original compiler message remains available in a disclosure for learners who want the exact technical detail. The console does not lead with a wall of raw diagnostics.

`Run` remains an experiment with the learner's own input. `Check checkpoint` remains the official assignment-owned assessment. A practice run cannot return grading checks or complete progress.

## Final-project assessment boundary

The final Observation Desk check uses:

- one visible input and expected output shown to the learner;
- three server-owned input and output cases whose values are not shipped to the browser;
- eight server-owned code-shape requirements.

Those requirements verify the two required headers, the `int main()` program frame, `return 0;`, the scoring-rule integer, the observer-name string, full-line name input, integer extraction, named multiplication, and the final output chain.

Private cases, structural requirements, and the reference solution live in `src/data/cpp-compiled-project.server.ts`. The public curriculum does not import that module. The browser bundle scan checks every emitted asset for selected server-owned identifiers, hidden-case names, and private values.

The actual program is compiled and executed in C++20 mode with the same pinned GCC 11 toolchain used by ordinary C++ exercises. Before the first official project case runs, a trusted pinned Clang 14 front end parses the exact source file in C++20 mode into a bounded abstract syntax tree. The runner accepts only the deliberately small straight-line grammar taught by the project and records only the structural facts needed by the coordinator.

Comments, string literals, preprocessor-disabled branches, macros, added functions, early returns, unsupported control flow, duplicate required declarations, renamed substitutes, and source-location tricks do not satisfy a requirement. Parse failures and unsupported syntax fail closed. The trusted analysis is never returned in the public runner result.

Every visible or protected behavior case still runs in a fresh Cloudflare Sandbox VM. Source, standard input, process state, memory, sockets, and files cannot cross from one case to another. A hidden-case failure returns only a generic protected-case summary and a beginner-safe diagnostic.

## Data and privacy boundary

The Phase 4A data boundary remains unchanged:

- source drafts stay in browser-local storage and are keyed by project and checkpoint;
- official-check history stores only checkpoint ID, time, pass or fail, and check counts;
- synchronized progress stores only known completion identifiers and aggregate learning progress;
- source, standard input, console output, compiler messages, and raw answers never enter D1, backup JSON, or synchronization requests.

The existing learner record remains version 1. Project and checkpoint identifiers are globally unique, so C++ progress fits the existing validated arrays without a D1 migration. Old records that omit those arrays still migrate to empty arrays.

## Verification contract

The local release gate must pass:

```bash
npm run check:release
npm run deploy:dry-run
npm run check:runner:image
```

The live runner boundary must pass on staging and production:

```bash
npm run check:runner:staging
npm run check:runner:project:staging
npm run check:runner:cpp-project:staging
npm run check:runner:production
npm run check:runner:project:production
npm run check:runner:cpp-project:production
npm run check:runner:smoke
```

Automated coverage includes:

- all 12 authored C++ checkpoints and their beginner-content schema;
- all editable Python and C++ project runner assignments;
- separate Python and C++ routes, drafts, checkpoints, completions, and rewards;
- public-manifest first loading and language-specific curriculum chunk loading;
- a valid four-case and eight-structure final C++ assessment;
- rejection of behavior-equivalent programs that omit the required authored structure;
- fail-closed Clang analysis for macros, inactive preprocessor branches, extra functions, unsupported control flow, early exits, duplicate declarations, and source-location tricks;
- private-case and trusted-analysis result scrubbing;
- practice-run separation from official assessment;
- old-record migration, backup validation, and conservative cross-device merge;
- hidden-assessment exclusion from public source modules and production assets.

The browser and component gates together cover the project catalog, C++ overview, compiler-guidance state, desktop split workspace, and a 390 CSS-pixel editor flow. The browser gate verifies readable scale, no horizontal overflow, a 16-pixel mobile body size, mobile navigation, route-heading focus, direct deep links, and a clean console. Component coverage verifies the unlocked C++ editor, visible Run and Check controls, the friendly compiler explanation, and the optional exact-message disclosure.

## Deployment and recovery

This release changes the C++ runner image as well as Worker code. Keep new execution paused while deploying. Wait for the new C++ container application to report ready on the reviewed digest before opening the staging test window or restoring production execution.

No D1 migration or secret rotation is required. If C++ structural grading fails while the academy is otherwise healthy, disable the runner through `RUNNER_CONFIG`. Static lessons, project reading material, local drafts, downloads, accounts, and existing progress remain available while new live runs are paused.

Rollback restores the previous compatible Worker version and the previous reviewed C++ container image. Do not delete the D1 database, rotate `LEARNER_DATA_SECRET`, or remove existing project completion arrays.

## Release evidence

Release identifiers, reviewed container digests, continuous-integration results, live runner results, and production browser evidence are added here after the controlled staging and production rollout completes.
