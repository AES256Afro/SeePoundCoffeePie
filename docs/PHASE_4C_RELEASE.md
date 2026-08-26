# Phase 4C C# Workshop Project Release

Release date: 2026-08-25

## Outcome

Phase 4C adds the first complete C# project after C# Foundations. A learner who completes that course can open `Community Workshop Check-In`, move through 12 short checkpoints, and build a downloadable front-desk program that reads a visitor name, parses a visit count, decides an access level, lists three workshop areas, and prints a badge through a reusable method.

The project begins before the learner is expected to understand .NET vocabulary. It explains source code, the compiler, .NET, the runtime, and top-level instructions in plain language. Later checkpoints introduce `using System;`, `Console`, `Console.ReadLine()`, `null`, `??`, `int.Parse`, interpolation, arrays, `if` and `else`, `foreach`, methods, parameters, arguments, and calls before those ideas appear in an independent task.

The theme is a practical community workshop rather than a space scene. It gives the learner a familiar purpose for every stored value and keeps the completed program small enough to explain from top to bottom.

## Learner path

The C# project follows this sequence:

1. Follow C# source through the compiler and .NET runtime.
2. Display a welcome line with `Console.WriteLine`.
3. Read a complete name with `Console.ReadLine() ?? ""`.
4. Convert digit text with `int.Parse` and a parseable fallback.
5. Retrieve two stored values with string interpolation.
6. Store the three workshop areas in a string array.
7. Choose Member or Guest access with `if` and `else`.
8. Visit every stored area with `foreach`.
9. Define and call `PrintBadge` with typed parameters.
10. Retrieve the dependency order for the full program.
11. Connect the prepared method and array without fill-in blanks.
12. Build the complete check-in program and pass changing visitor cases.

The project contains 10 editable C# checkpoints, one choice exercise, and one ordering exercise. Early work changes one blank. Later work writes complete structures. The final two checkpoints ask the learner to assemble familiar pieces without hidden starter logic.

Completing a checkpoint awards its authored XP once. Completing the final checkpoint records the project once, awards the project reward once, and advances the streak once. Project progress remains independent across Python, C++, and C#.

## Bookmarkable interface

The project overview is:

```text
/projects/csharp/workshop-check-in
```

Each checkpoint has an exact route:

```text
/projects/csharp/workshop-check-in/:checkpoint-id
```

The project appears in the guided-project catalog and after the C# course outline. A C# graduate sees it as the next learning step. A learner who has not completed C# Foundations can still inspect the outcome, vocabulary progression, checkpoint names, and objectives before the editor unlocks.

The project reuses the open workshop layout. On desktop, the explanation and task remain distinct reading regions. On narrow screens, they become one readable sequence. The C# identity uses the `#` symbol, and the completed draft downloads as `community-workshop-check-in.cs` with a C# source MIME type.

The initial application bundle contains only the small public project manifest. Opening the route loads the C# teaching curriculum as its own chunk. Server assessment values and the trusted analysis never enter the browser build.

## Beginner-facing runtime guidance

The learner sees a deliberate distinction between source, compilation, and execution:

- source code is the readable text the learner writes;
- the C# compiler checks and prepares that source;
- the .NET runtime carries out the prepared instructions;
- top-level instructions let a small modern C# file begin useful work without first introducing a `Program` class and `Main` method.

`Run` is an experiment with the learner's practice input. `Check checkpoint` is the official assessment with assignment-owned cases and structural requirements. A practice run returns no grading tests and cannot complete progress.

When compilation or execution fails, the workspace presents a short beginner-safe explanation and one concrete next action. The language's exact message remains available separately for a learner who wants the technical detail.

## Final-project assessment boundary

The final Community Workshop Check-In uses:

- one visible case with `Alex Kim` and four visits;
- three server-owned behavior cases covering zero visits, the value just below member access, and the exact member boundary;
- eight server-owned structural requirements.

The structural requirements verify:

1. the exact `using System;` directive;
2. the `PrintBadge` signature and interpolated method body;
3. the exact string array and area order;
4. both prompts, input declarations, fallback values, and numeric parse shape;
5. the exact `visitCount >= 3` branch and both access messages;
6. the typed `foreach` loop and interpolated area output;
7. the final `PrintBadge(guestName, visitCount)` call;
8. the exact nine-statement top-level order and fact counts.

Private cases, structural check messages, and the reference solution live in `src/data/csharp-workshop-project.server.ts`. The public curriculum does not import that module. The browser bundle gate scans all emitted JavaScript and CSS for private case identifiers, names, standard input, expected output, and raw or encoded reference source.

The same pinned .NET 8.0.130 SDK used to compile learner C# also supplies the Roslyn assemblies used by the trusted analyzer. Before the first official project case runs, the analyzer parses the exact `Program.cs` source as C# 12. It accepts only the deliberately small program shape taught by the project and returns a bounded JSON fact frame to the Worker coordinator.

The analyzer does not award credit from comments, strings, disabled source, directives, aliases, added types, extra methods, helper calls, casts, parenthesized substitutes, duplicate statements, moved statements, or early exits. Unsupported or malformed source fails closed. The coordinator validates every root key, fact key, occurrence, statement position, identifier, type, text length, list bound, and analyzed-state invariant before evaluating a requirement.

Trusted Roslyn facts are never included in the public runner result. A protected behavior failure returns only a generic hidden-case summary. It does not return private input, expected output, case identity, reference source, or hidden-case error text.

Every behavior case runs in a separate fresh Cloudflare Sandbox VM. Source, standard input, processes, memory, sockets, and files cannot cross between cases.

## Data and privacy boundary

The existing Phase 4 data boundary remains unchanged:

- source drafts stay in browser-local storage, keyed by project and checkpoint;
- official-check history stores only checkpoint ID, time, pass or fail, and check counts;
- synchronized progress stores only known completion identifiers and aggregate learning progress;
- source, standard input, console output, compiler messages, trusted facts, and raw answers never enter D1, backup JSON, or synchronization requests.

The learner record remains version 1. C# project and checkpoint identifiers are globally unique, so no D1 migration is required. Older records that omit project arrays still migrate to empty arrays.

## Verification contract

The local release gate must pass:

```bash
npm run check:release
npm run deploy:dry-run
npm run check:runner:image
```

The staging and production runner boundary must pass:

```bash
npm run check:runner:staging
npm run check:runner:project:staging
npm run check:runner:cpp-project:staging
npm run check:runner:csharp-project:staging
npm run check:runner:production
npm run check:runner:project:production
npm run check:runner:cpp-project:production
npm run check:runner:csharp-project:production
npm run check:runner:smoke
```

Automated coverage includes:

- all 12 public checkpoints and the beginner-content schema;
- exactly 10 editable C# runner assignments;
- manifest lookup, route parsing, dynamic curriculum loading, and final deep links;
- catalog, course handoff, unlocked overview, checkpoint editor, C# runner forwarding, and `.cs` download behavior;
- one visible and three protected behavior cases;
- all eight trusted structural requirements;
- hardcoded visible output rejection;
- fail-closed coordinator parsing for missing, malformed, unexpected, oversized, or wrongly analyzed fact envelopes;
- fail-closed Roslyn analysis for directives, disabled text, extra members, alternate helpers, control flow, aliases, casts, reordered statements, decoys, duplicates, and early exits;
- ordinary C# practice execution with an empty analysis sentinel;
- private case, reference solution, and trusted fact exclusion from public modules, assets, and results;
- Python and C++ analyzer regression coverage;
- full four-language container and isolation checks.

## Deployment and recovery

This release changes the C# runner image and Worker code. Keep new execution paused while deploying. Wait for the reviewed C# container image to report ready before opening the staging test window or restoring production execution.

No D1 migration or secret rotation is required. If C# structural grading fails while the rest of the academy remains healthy, disable the runner through `RUNNER_CONFIG`. Static lessons, project reading material, local drafts, downloads, accounts, and existing progress remain available while new live runs are paused.

Rollback restores the previous compatible Worker version and reviewed C# image. Do not delete the D1 database, rotate `LEARNER_DATA_SECRET`, or remove existing project completion arrays.

## Release evidence

### Source and continuous integration

- Source commit: `566f2d8ee3a9fda7c8b501964f2044d9b50321d6`
- GitHub CI run: [32915624546](https://github.com/AES256Afro/SeePoundCoffeePie/actions/runs/32915624546)
- CI result: passed in 1 minute, including tests, lint, production build, and bundle budgets
- Local release result: 31 test files and 342 tests passed, followed by lint, social-preview validation, production build, project bundle-boundary checks, and private-marker scans
- Initial JavaScript bundle: 479.63 kB raw and 128.33 kB gzip
- Total route-loaded JavaScript: 601.97 kB raw and 162.61 kB gzip
- CSS: 69.01 kB raw and 12.86 kB gzip
- Wrangler 4.126.0 production dry run: passed
- Full four-image gate: passed for Python, C++, C#, and Java
- Trusted analyzer suites: Python 11 of 11, C++ 14 of 14, and C# 16 of 16 passed
- Runtime versions: .NET SDK 8.0.130 and Roslyn C# compiler 4.8.0-7.25569.25

The independent C# analyzer review found and corrected two issues before release. Canonical token checks now reject verbatim identifiers, Unicode-escaped identifiers, escaped equivalent strings, verbatim strings, and raw strings. Unsupported grammar now returns an empty `analyzed: true`, `parsed: false` sentinel instead of partial facts.

The final local C# image was `linux/amd64`, 675,987,007 bytes, with OCI image ID `sha256:c80f9a6b562c6695e903a21f0b9d42528c104b40011f934a873288bdd1fe7096` and manifest `sha256:02dee97d9e1b8a23431b36e0a52b016ef6f446455ba429de88919145bc0465a1`. The compiled analyzer hash was `sha256:fcee0f5d680e935048a7ce217ee9aa0d44b45d184b7c48606787dfe76ab3e032`.

### Staging rollout

- Staging Worker version: `e6e0aeb0-96d1-496b-8560-09a3d671c6ba`
- Python image: `sha256:5a17c13b4a55684e3ca92832b2a2dca3ad5f0981a429acd4447343f3bd0f14ae`
- C++ image: `sha256:a63c441350477786b19136f3833e8805ca483bc03c57cc8c30926e48c2a439f8`
- C# image: `sha256:02dee97d9e1b8a23431b36e0a52b016ef6f446455ba429de88919145bc0465a1`
- Java image: `sha256:7b58a8ddf1936d820e5e3aac57bd29d3d5c05c68417b98abb0197eee65d06ac9`
- All four staging applications reached version 15 with two healthy instances, zero failed instances, and no health errors before tests began.
- The platform boundary passed all four languages, seccomp network denial, CPU cutoff, process-tree memory cutoff, disk and output limits, diagnostic sanitization, run isolation, queue saturation, and learner authorization.
- The protected Python project passed its practice, behavior, parser-integrity, and 10-check final gates.
- The protected C++ project passed its practice, behavior, early-return, macro-expansion, and 12-check final gates.
- The protected C# project rejected visible-output hardcoding and passed all 12 public-safe behavior and structural checks.
- The project route returned HTTP 200 while execution was paused.
- Final staging runner state: `enabled: false`, confirmed by KV and the public status endpoint.

### Production rollout

- Production Worker version: `21646830-c3d7-4c4f-9c42-408a78f5477d`
- Production container images: the same four reviewed digests used in staging
- All four production applications reached version 4 with four healthy instances, zero failed instances, and no health errors before execution was restored.
- Production stayed paused while the control plane moved from the previous version 3 images to the new version 4 digests. The static academy remained available with HTTP 200 throughout the pause.
- The live platform boundary passed all four language runs and every isolation, quota, authorization, and sanitization probe.
- The live protected Python project passed all integrity probes and all 10 final checks.
- The live protected C++ project passed all integrity probes and all 12 final checks.
- The live protected C# project rejected visible-output hardcoding and passed all 12 public-safe checks.
- The separate production smoke run passed in 33 ms.
- Public-site verification passed social previews, apex domain, `www` redirect, security headers, 21 canonical routes, and two legacy routes.
- Final production runner state: `enabled: true`, confirmed by KV and the public status endpoint.

### Production browser evidence

The browser check used the deployed route at `https://seepoundcoffeepie.com/projects/csharp/workshop-check-in`.

- Desktop viewport: 1703 by 839 CSS pixels
- Desktop body and heading sizes: 17 pixels and 69.6 pixels
- Phone viewport: exactly 390 by 844 CSS pixels
- Phone body and heading sizes: 16 pixels and 42.9 pixels
- Horizontal overflow: none at either viewport
- Mobile navigation: opened with `aria-expanded="true"`, moved focus to the `Close navigation` button, and preserved the 390-pixel document width
- Direct route: the page title and `Community Workshop Check-In` heading were correct
- Fresh-navigation application log: no warnings or errors before optional account-record synchronization
- Later log entries were emitted by installed Chrome extensions, including Grammarly, and not by an academy asset

The C# project is intentionally locked until C# Foundations is complete. The production browser check therefore verifies the public overview and prerequisite handoff. Component tests verify the unlocked editor, C# runner language, Run and Check controls, direct final-checkpoint route, and `.cs` download.
