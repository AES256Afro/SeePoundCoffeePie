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

The browser and component gates together cover the project catalog, C++ overview, compiler-guidance state, desktop split workspace, and a 390 CSS-pixel editor flow. The browser gate verifies readable scale, no horizontal overflow, a 16-pixel mobile body size, mobile navigation, route-heading focus, direct deep links, and a clean application console on fresh navigation. Component coverage verifies the unlocked C++ editor, visible Run and Check controls, the friendly compiler explanation, and the optional exact-message disclosure.

## Deployment and recovery

This release changes the C++ runner image as well as Worker code. Keep new execution paused while deploying. Wait for the new C++ container application to report ready on the reviewed digest before opening the staging test window or restoring production execution.

No D1 migration or secret rotation is required. If C++ structural grading fails while the academy is otherwise healthy, disable the runner through `RUNNER_CONFIG`. Static lessons, project reading material, local drafts, downloads, accounts, and existing progress remain available while new live runs are paused.

Rollback restores the previous compatible Worker version and the previous reviewed C++ container image. Do not delete the D1 database, rotate `LEARNER_DATA_SECRET`, or remove existing project completion arrays.

## Release evidence

### Source and continuous integration

- Source commit: `9477f4b9d3c617bdeeb67d3c794682322363373a`
- GitHub CI run: [32909200678](https://github.com/AES256Afro/SeePoundCoffeePie/actions/runs/32909200678)
- CI result: passed in 51 seconds, including tests, lint, production build, and bundle budgets
- Local release result: 25 test files and 299 tests passed, followed by lint, social-preview validation, production build, project bundle-boundary checks, and private-marker scans
- Initial JavaScript bundle: 476.37 kB raw and 128.68 kB gzip in the deployment build
- Total route-loaded JavaScript: 560.98 kB raw and 152.64 kB gzip in the deployment build
- CSS: 69.00 kB raw and 12.88 kB gzip in the deployment build
- Wrangler production dry run: passed
- Four-image container gate: passed for Python, C++, C#, and Java
- Trusted analyzer tests: 14 of 14 C++ cases and 11 of 11 Python cases passed
- Runtime versions: GCC 11.4 for C++20 execution and pinned Clang 14.0.0 for trusted C++20 structure analysis

### Staging rollout

- Staging Worker version: `f59c59b7-52e7-4e4b-a4f7-51a3ec8039ad`
- Python image: `sha256:5bb8ff1c6f69998bdb4d5a5fccb9ea06482cbb52a48daf2aa4b462165c3c62f6`
- C++ image: `sha256:8d1b30d86576d11d8c29e0888a2793e59118f52396f69bd32cc809f866336132`
- C# image: `sha256:a5fc44d215a3e1514738774e08d5e57b6f6205d0e99fb0603346630730fedee8`
- Java image: `sha256:12befcd642bd1cd72b8e8058712eb977b9ce2e16e43041b83bc7069dc59c29e4`
- Container state before tests: all four staging applications were version 14, `ready`, and configured with two instances
- Platform boundary: all four languages, seccomp network denial, CPU cutoff, process-tree memory cutoff, disk and output limits, diagnostic sanitization, run isolation, queue saturation, and learner authorization passed
- Python guided project: practice separation, behavior aliases, commented-code decoys, early exits, explicit line continuations, encoding identity, and all 10 final checks passed
- C++ guided project: practice separation, behavior aliases, six missing authored structures, early return, macro expansion, private-result scrubbing, and all 12 final checks passed
- Final staging runner state: `enabled: false`

### Production rollout

- Production Worker version: `0df84e61-3057-4ec7-8c5e-8672f750da9d`
- Production container images: the same four reviewed digests used in staging
- Container state before enabling execution: all four production applications were version 3 at the exact reviewed digest, with four healthy instances, zero failed instances, and no health errors
- The Python list view briefly showed the previously promoted digest while the version 3 desired state was rolling out. The per-application record already showed the reviewed digest and healthy instances, and the views converged without a second deployment.
- Live platform boundary: all four language runs and every isolation, quota, authorization, and sanitization probe passed
- Live Python project: all integrity probes and all 10 final checks passed
- Live C++ project: all integrity probes and all 12 final checks passed
- Production smoke run: passed in 37 ms
- Public-site verification: social previews, apex domain, `www` redirect, security headers, 19 canonical routes, and two legacy routes passed
- Final production runner state: `enabled: true`

### Production browser evidence

The browser check used the deployed route at `https://seepoundcoffeepie.com/projects/cpp/first-compiled-program`.

- Desktop viewport: 1703 by 839 CSS pixels
- Desktop body and heading sizes: 17 pixels and 69.6 pixels
- Phone viewport: exactly 390 by 844 CSS pixels
- Phone body and heading sizes: 16 pixels and 42.9 pixels
- Horizontal overflow: none at either viewport
- Mobile navigation: opened with `aria-expanded="true"`, moved focus to the `Close navigation` button, and preserved the 390-pixel document width
- Direct route: correct page title and `Your First Compiled Program` heading were visible
- Fresh-navigation application log: no warnings or errors
- A Chrome extension emitted its own `Receiving end does not exist` connection message only after the local progress-comparison dialog was dismissed. The message did not reproduce on a fresh page navigation and was not emitted by an academy asset.

The C++ project is intentionally locked until C++ Foundations is complete. The production browser check therefore verifies the public overview and prerequisite handoff. Component tests verify the unlocked editor, compiler explanation, Run control, official Check control, and exact diagnostic disclosure.
