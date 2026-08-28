# SeePoundCoffeePie milestone roadmap

Last reviewed: 2026-08-28

This is the working order for the product. It is intentionally longer than a feature list. Each milestone has a visible result, a verification rule, and a dependency position. A later milestone does not justify weakening an earlier safety, teaching, accessibility, or privacy requirement.

## Roadmap rules

- Teach before decorating. A screen should spend most of its space helping a beginner understand or practice something.
- Use plain language. Explain a new term before relying on it.
- Preserve existing lesson, module, project, concept, route, and learner-record identifiers.
- Keep unfinished courses completely private. Do not show partial catalog cards, routes, assignments, sitemap entries, or browser bundles.
- Keep public-site deployment separate from runner-image deployment.
- Treat automated checks, browser checks, and a real beginner review as different kinds of evidence.
- Finish one release slice before beginning the next slice that depends on it.
- Add capabilities to shared registries and contracts rather than copying a one-off implementation.
- Do not add subscriptions, advertising, paid random rewards, public profiles, or social pressure as default product behavior.

## Current baseline

The latest documented live production baseline is the 2026-08-26 Phase 5B compatibility release. It has five courses, 30 modules, 150 lessons, four guided projects, and 100 editable runner assignments. The live site also has the OAuth flow, synchronized learner record, four runner toolchains, adaptive Practice, Code Reference, portfolio exports, and bookmarkable routes.

The current source-controlled publication candidate selects the complete Practical C++ course. It has six courses, 36 modules, 180 lessons, four guided projects, and 112 editable runner assignments. Practical C++ contributes 12 runner-backed lessons and 18 teaching-only lessons that must never receive execution grants. The exact reviewed source commit `3f7e709326cdeb9652d668ca5ee42fbbf2c48504` is clean on `main`, matches the remote `main` ref, and passed hosted CI in [run 33192113526](https://github.com/AES256Afro/SeePoundCoffeePie/actions/runs/33192113526). This source and CI evidence is not staging or production deployment evidence. M009 and M010 remain incomplete until staging, manual accessibility and beginner review, and production verification pass for the same reviewed release.

- **M000, roadmap contract:** Keep this file aligned with completed release records, current source, and live evidence. Every new milestone needs an owner, dependency position, acceptance rule, and rollback or recovery note when it changes persistent data or production behavior.

## Decisions that need an owner answer

- **D01, product name pronunciation:** Decide the short spoken explanation for See, Pound, Coffee, and Pie. Needed before recorded audio or video.
- **D02, learner age floor:** Decide whether the product is explicitly adult-oriented, teen-friendly, or suitable for younger learners. Needed before analytics, community, and privacy expansion.
- **D03, account policy:** Decide whether email sign-in is ever needed or GitHub plus guest use remains the complete account model.
- **D04, progress portability:** Decide whether a learner should be able to export a human-readable transcript in addition to the existing machine-readable backup.
- **D05, optional help:** Decide whether future contextual help is entirely local and authored, server-generated, or can use an AI provider only after explicit opt-in.
- **D06, community boundary:** Decide whether community means read-only examples, private cohorts, or public discussion. No public posting should be built without moderation and privacy plans.
- **D07, certificates:** Decide whether completion certificates are useful and what they honestly certify.
- **D08, native tools:** Decide which desktop operating systems receive first-class setup guides after browser foundations.
- **D09, sustainability:** Decide whether the product remains free, accepts donations, or adds paid advanced material without weakening the beginner path.
- **D10, accessibility review:** Identify at least one keyboard-only user and one screen-reader user for release-candidate reviews.

## Phase 5B: publish Practical C++ safely

- **M001, production security baseline:** Record the current Cloudflare, OAuth, Worker, runner, disclosure, and repository-security settings in a dated document. Include intentional exceptions and repeatable checks. Complete when another maintainer can compare live state with the record without seeing secret values.
- **M002, fail-closed course release state:** Add one source-controlled catalog whose unknown and unpublished entries always resolve to unavailable. Complete when explicit unpublished fixtures exclude Practical C++ from public course types, definitions, loaders, routes, sitemap, browser content, and runner assignments while the reviewed published state selects the complete surface atomically.
- **M003, semantic and mobile repair:** Remove duplicate primary page regions, restore a usable mobile language control, keep editable code readable, and prevent exercise overflow. Complete when focused component tests and responsive browser checks pass.
- **M004, ordered continuing-course and project sequencing:** Replace first-match-by-language behavior with explicit ordered lists and exact-ID lookup. Reject duplicate or ambiguous order metadata. Complete when Home, Practice, project continuation, and existing Python behavior no longer depend on array order.
- **M005, controlled Practical C++ integration:** Add the course outline, prerequisite display, exact lesson routes, Practice ownership, and Code Reference ownership behind one source-controlled release state. Complete when both release states pass local tests and the reviewed publication selection exposes the whole course at once.
- **M006, protected assignment integration:** Register the exact 12 editable Practical C++ assignments through the protected publication boundary, keep the other 18 lesson IDs outside the runner, and add abort support so leaving a page cannot leave a stale 45-second poll running. Complete when visible and private cases pass, the 12 grants bind to C++, and all 18 teaching-only IDs fail closed.
- **M007, bundle headroom:** Reduce initial CSS and JavaScript enough to keep at least 15 percent headroom below release budgets. Preserve lazy teaching content. Complete when clean-build size checks pass with documented headroom rather than a few spare bytes.
- **M008, browser release gate:** Add Playwright coverage for catalog, prerequisites, all 30 direct lesson URLs, the exact 12 runner-backed and 18 teaching-only split, keyboard editing, mobile navigation, Practice, and Code Reference. Include an automated accessibility pass, but keep manual review separate.
- **M009, Practical C++ staging:** Publish the compatibility floor first, deploy the public integration to staging, run the full four-language regression plus Practical C++, and complete a beginner walkthrough. Complete only with recorded source, Worker, runner, and browser evidence.
- **M010, Practical C++ production:** Release the complete course in one controlled change, verify every canonical route and protected assignment, update monitoring, and record rollback instructions. Complete when production evidence is tied to the exact commit and deployment versions.

## Phase 6: beginner soft landing

- **M011, first-minute walkthrough:** Show what code is, what a programming language is, what an instruction is, and what Run does before asking the learner to edit syntax.
- **M012, computer model:** Explain program, source code, output, error, file, and memory with one concrete example and a check for understanding.
- **M013, punctuation tour:** Let learners point at quotes, parentheses, brackets, braces, commas, periods, colons, semicolons, and indentation before those marks are graded.
- **M014, editor tour:** Explain cursor, line number, selection, undo, keyboard focus, and how to leave the editor with the keyboard.
- **M015, reading order:** Teach how to read one short program from top to bottom, including the parts the learner does not need to understand yet.
- **M016, error reassurance:** Show that an error is information from a tool, not a personal failure. Practice identifying the line and the plain-language clue.
- **M017, copy then change:** Begin with one safe copy-and-run action, followed by one visible change and one prediction.
- **M018, vocabulary retrieval:** Revisit each new foundational word in a different format within the next three lessons.
- **M019, optional deeper explanation:** Let curious learners open a short explanation without making every learner scroll through it.
- **M020, soft-landing review:** Test the first 20 minutes with people who have never programmed. Complete when they can explain Run, output, variable, and error in their own words.

## Phase 7: teaching workspace and layout

- **M021, stable desktop workspace:** Keep instruction and activity visible together when the screen is wide enough. Avoid unnecessary page scrolling during one exercise.
- **M022, stable mobile workspace:** Use a clear sequence of explanation, task, editor, output, feedback, and next action. Keep the primary action easy to reach.
- **M023, scale system:** Define separate type and spacing scales for navigation, teaching text, code, feedback, and supporting detail.
- **M024, readable line length:** Keep teaching paragraphs narrow enough to read comfortably while allowing code and output to use wider space.
- **M025, whitespace budget:** Remove ornamental panels and repeated labels that consume teaching space. Use space to separate concepts, not to simulate a dashboard.
- **M026, persistent lesson position:** Keep course, module, lesson, and next action visible without a large decorative header.
- **M027, focused feedback:** Place feedback next to the action it explains. Keep technical detail available under a plain-language summary.
- **M028, route identity:** Give every course, module, lesson, project step, Practice session, Code Reference topic, Profile area, and Settings section a bookmarkable URL.
- **M029, theme accessibility:** Verify Hex, Terminal, and Schematic themes for contrast, focus, syntax highlighting, error states, and reduced motion.
- **M030, layout regression suite:** Capture representative desktop, tablet, narrow mobile, large-text, reduced-motion, and high-contrast states before each release.

## Phase 8: memory and practice

- **M031, activity ledger:** Store a bounded local history of completed learning actions so weekly activity shows actual days rather than only today.
- **M032, correction path:** Let learners undo an accidental completion or mistaken restore without resetting unrelated work.
- **M033, due-review explanation:** Explain why an item returned and what a successful review changes.
- **M034, lesson retrieval pairs:** Add a short recall prompt before re-showing an example learners have already seen.
- **M035, mixed review:** Mix syntax recognition, output prediction, code ordering, repair, and small edits instead of repeating one question shape.
- **M036, error-pattern review:** Bring back the learner's own missed concept without retaining submitted source code or raw attempts.
- **M037, confidence check:** Let learners mark an answer as guessed, unsure, or confident, then compare confidence with correctness privately.
- **M038, practice controls:** Offer five-minute, ten-minute, due-only, and chosen-topic sessions without implying that a streak is mandatory.
- **M039, mastery explanation:** Show what progress means, what it does not mean, and why a completed lesson may return for review.
- **M040, practice validation:** Measure recall after a delay and adjust scheduling rules only from documented evidence.

## Phase 9: security, privacy, and operations

- **M041, browser security gate:** Add repeatable checks for CSP, security headers, dependency risks, DOM injection, unsafe links, and exposed source-map or secret material.
- **M042, runner SBOM:** Produce an SBOM for each pinned runner image and retain it with release evidence.
- **M043, runner vulnerability gate:** Scan the exact image digests used in staging and production. Define severity thresholds and exception ownership.
- **M044, all-runner production monitor:** Exercise protected Python, C++, C#, and Java checks, not only generic smoke tests.
- **M045, abortable runner client:** Propagate cancellation through grant, submit, response reading, and polling requests. Stop browser work and ignore stale results when navigation makes them irrelevant. This does not cancel a job that the server already accepted; true server-side cancellation requires a separate authenticated API and abuse-control review.
- **M046, rate-limit evidence:** Record the actual production behavior for anonymous, signed-in, burst, and abusive runner requests.
- **M047, secret rotation drill:** Rotate session, learner-data, and OAuth secrets according to their different continuity requirements without exposing values.
- **M048, D1 backup and restore drill:** Prove a backup can be restored into an isolated database and validated before any production repair.
- **M049, bounded retention job:** Implement and monitor the documented D1 cleanup policy with a dry-run and reviewable deletion count.
- **M050, account deletion audit:** Verify server deletion, browser-copy behavior, reauthentication, retries, and user-facing confirmation.
- **M051, Cloudflare change record:** Track DNS, TLS, WAF, cache, bot, certificate, and Worker-security changes with dates and reasons.
- **M052, incident playbook:** Document pause, rollback, communication, evidence preservation, and safe recovery for public site, OAuth, sync, and runner incidents.

## Phase 10: curriculum authoring system

- **M053, lesson schema v2:** Define required learning goal, prerequisite, new terms, retrieval target, activity type, feedback, hint, and assessment fields.
- **M054, author validation:** Reject duplicate identifiers, unexplained new terms, missing answers, impossible routes, and inconsistent XP before build.
- **M055, preview workspace:** Let an author review one lesson at desktop and mobile sizes without publishing it.
- **M056, private fixtures:** Keep protected cases and reference solutions server-side while still giving authors a safe local test flow.
- **M057, copy review:** Add checks for jargon, marketing language, unexplained abbreviations, long sentences, and unsupported claims.
- **M058, accessibility authoring:** Require headings, labels, keyboard order, alt text when meaningful, and non-color feedback in authored content.
- **M059, curriculum diff:** Show added, changed, removed, and reused learner identifiers before a curriculum change can merge.
- **M060, course release template:** Generate a release checklist with compatibility, content, runner, browser, accessibility, staging, production, and rollback evidence.

## Phase 11: course coverage

- **M061, Practical C#: working with records:** Design a second C# course only after Practical C++ production evidence is stable.
- **M062, Practical Java: collections and objects:** Design a second Java course using the same continuing-course contracts.
- **M063, Practical Python project two:** Add a project that reads a provided local data file without introducing packages or accounts.
- **M064, Practical C++ project two:** Build a small inventory or log program using vectors, structs, functions, and safe file input.
- **M065, Practical C# project two:** Build a small records tool using lists, methods, and straightforward validation.
- **M066, Practical Java project two:** Build a small planner using lists, classes, and clear input validation.
- **M067, debugging foundations:** Teach reproduction, reading an error, narrowing the cause, changing one thing, and confirming the fix.
- **M068, testing foundations:** Teach examples, expected results, edge cases, and small automated checks without framework overload.
- **M069, files and folders:** Explain paths, extensions, current directory, saving, and safe file operations.
- **M070, command line foundation:** Introduce terminal, shell, prompt, command, argument, output, exit status, and current directory gently.
- **M071, Git concepts:** Teach snapshot, repository, change, commit, branch, remote, and conflict before memorizing commands.
- **M072, GitHub project publishing:** Guide a learner through publishing only code they intend to share, with secret and privacy checks.
- **M073, data structures bridge:** Compare arrays, lists, vectors, dictionaries, maps, records, structs, classes, and objects using familiar examples.
- **M074, algorithms bridge:** Teach sequence, search, count, filter, sort, and complexity through visible behavior before notation.
- **M075, course choice guide:** Explain what each course teaches, what it assumes, and what learners can do next without rankings or hype.

## Phase 12: leaving the browser safely

- **M076, local setup preflight:** Detect operating system and explain terminal, editor, compiler or interpreter, folder, and PATH before installation steps.
- **M077, Python local setup:** Provide tested macOS, Windows, and Linux instructions plus a hello-world verification and repair path.
- **M078, C++ local setup:** Provide tested compiler and editor paths with exact version and diagnostic checks.
- **M079, C# local setup:** Provide tested .NET SDK setup with project creation, run, build, and repair checks.
- **M080, Java local setup:** Provide tested JDK setup with source, compile, run, package, and version checks.
- **M081, editor handoff:** Teach files, save state, tabs, terminal, run command, formatting, and diagnostics in a common editor.
- **M082, downloadable starter projects:** Export minimal, readable projects with a README, expected output, and no hidden dependencies.
- **M083, local troubleshooting:** Branch by observable symptom, show safe diagnostics first, and explain how to undo a change.
- **M084, browser-to-local capstone:** Let learners rebuild one familiar browser project locally and compare the two environments.

## Phase 13: accessibility and language

- **M085, keyboard completion:** Complete every public learning flow with keyboard only, including editor exit, dialogs, themes, backup, and restore.
- **M086, screen-reader completion:** Verify landmarks, headings, labels, status announcements, code context, feedback, and route changes.
- **M087, 200 percent zoom:** Keep tasks, editor, output, feedback, and navigation usable without two-direction scrolling.
- **M088, plain-language glossary:** Link every necessary technical term to a short definition and example without interrupting the main lesson.
- **M089, localization foundation:** Separate authored strings, interface strings, code tokens, and examples so translation cannot change assessed syntax.
- **M090, accessibility release gate:** Require automated checks, manual keyboard review, screen-reader review, zoom review, and documented exceptions.

## Phase 14: optional help and cooperation

- **M091, authored hint ladder:** Provide a reminder, a more specific clue, and a worked explanation without taking away points by surprise.
- **M092, misconception library:** Map common beginner mistakes to small, human-written explanations and follow-up practice.
- **M093, private question export:** Let a learner copy a safe support packet with lesson context while excluding secrets, identity, and unrelated progress.
- **M094, example gallery:** Offer reviewed, read-only examples with explanations. Do not add public posting or ranking.
- **M095, private cohort mode:** Explore instructor-created groups only after consent, deletion, moderation, and data-minimization rules exist.
- **M096, optional AI help gate:** If approved by D05, require explicit opt-in, provider disclosure, source-code minimization, age-policy review, and a non-AI alternative.

## Phase 15: measurement and long-term stability

- **M097, privacy-safe learning metrics:** Define completion, delayed recall, hint use, retry recovery, abandonment, and accessibility failures without collecting source code or unnecessary identity.
- **M098, release scorecard:** Report current build, test, browser, accessibility, runner, security, bundle, staging, and production evidence in one place.
- **M099, curriculum maintenance cycle:** Review stale tool versions, broken links, confusing lessons, weak retrieval, and learner-reported issues on a documented schedule.
- **M100, stable 1.0 release:** Declare 1.0 only after all four foundations, the first four projects, Practice, learner records, local handoff, accessibility, security operations, and release evidence have durable owners.

## Immediate working order

M001 through M008 are implemented in the publication-candidate source. The source now selects the complete six-course application and exact 112-assignment runner registry. Commit `3f7e709326cdeb9652d668ca5ee42fbbf2c48504` is clean on `main`, matches the local and live remote `main` refs, and passed hosted CI in run 33192113526. The active order is now the guarded M009 staging deployment and regression proof from that exact commit, the recorded manual beginner and accessibility review, and then M010 production. Both release milestones require more than a passing local build or hosted CI job.

The 2026-08-28 unpublished M005 checkpoint exercised the complete course through the same controlled publication decision used by the build. It recorded six catalog cards, Home and Learner Record continuation, the real 6-module and 30-lesson Practical C++ outline, exact prerequisites, canonical same-page lesson navigation, cached lazy content, Practice aggregation, all 11 Code Reference entries, and a 43-URL sitemap projection. Its deterministic teaching JSON measured 42.222 kB raw and 14.300 kB gzip. The complete candidate application measured 747.504 kB raw and 217.952 kB gzip total JavaScript, 83.13 kB raw and 16.01 kB gzip total CSS, and 876.28 kB raw and 249.32 kB gzip aggregate transfer. Eleven candidate Chromium cases verified prerequisites, representative lesson history, cached teaching data, title and focus, Home, Learner Record, portfolio ownership, Practice, Code Reference, and malformed-data handling. Those numbers preserve dated local evidence from before the source publication flip. They do not prove the current commit, staging, or production.

Current M006 hardening binds every public runner grant and queued result to a deterministic SHA-256 revision of grading-only assignment data plus a checked revision of the evaluators, analyzers, runner images, coordinator, and Sandbox package. The browser receives only a keyed opaque binding. The Worker and coordinator recheck the underlying revision before accepting source, creating a sandbox, and returning stored output. Revoked, changed, or legacy work fails closed without exposing submitted source or stored output. Browser navigation, reset, exit, continue, and unmount cancel local grant, submit, response-reading, and polling work. The selected Worker source contains exactly 112 assignments, including the 12 runner-backed Practical C++ lessons. The other 18 Practical C++ lesson IDs are teaching-only and must return not found even when execution is enabled. Runner-image execution and a controlled staging window remain M009 evidence, not local proof.

The 2026-08-28 unpublished-candidate M007 bundle record was:

- initial JavaScript: 332.09 kB raw with 31.53 percent headroom, and 99.79 kB gzip with 24.40 percent headroom;
- initial CSS: 53.33 kB raw with 26.44 percent headroom, and 10.03 kB gzip with 25.67 percent headroom;
- total JavaScript: 736.32 kB raw with 3.75 percent headroom, and 214.42 kB gzip with 1.64 percent headroom;
- total CSS: 83.13 kB raw with 4.45 percent headroom, and 16.01 kB gzip with 8.50 percent headroom;
- lazy packed foundation curriculum: 113.957 kB raw and 28.661 kB gzip;
- emitted JSON teaching data: 0 kB in the five-course build used at that checkpoint;
- aggregate transfer: 822.87 kB raw with 9.67 percent headroom, and 231.49 kB gzip with 8.32 percent headroom.

At that checkpoint, the readable foundation curriculum compiled to one deterministic lazy packed asset instead of a large curriculum JavaScript module. The Practical C++ teaching data compiled to one deterministic lazy JSON asset measuring 42.222 kB raw and 14.300 kB gzip, while the five-course build emitted none of it. The current six-course source instead requires exactly one lazy, byte-identical Practical C++ JSON asset and rejects any protected server marker in browser output. Fresh measurements belong to the current release gate rather than this historical record.

The dated local gate recorded 78 Vitest files and 808 tests, 11 of 11 candidate Chromium cases, and 15 of 15 five-course Chromium cases. The browser coverage is now being carried by the ordinary production-dist harness rather than a second candidate server. The exact current source commit and hosted CI are recorded separately in the [Phase 5B browser gate record](docs/PHASE_5B_BROWSER_GATE.md). Manual keyboard and screen-reader review, 200 percent zoom, reduced-motion review, other browsers, runner-image execution, staging, and production still need their own evidence.

## Explicit exclusions for the current release horizon

- No partial Practical C++ catalog card or coming-soon route.
- No public leaderboard, learner ranking, or streak punishment.
- No automatic sharing of code, progress, identity, or portfolio work.
- No broad AI tutor added before the authored teaching and privacy gates.
- No native package installation from the browser.
- No raw secret values in documentation, logs, tests, screenshots, or support packets.
