# SeePoundCoffeePie milestone roadmap

Last reviewed: 2026-08-30

This is the working order for the product. It is intentionally longer than a feature list. Each milestone has a visible result, a verification rule, and a dependency position. A later milestone does not justify weakening an earlier safety, teaching, accessibility, or privacy requirement.

`MILESTONES.md` is the canonical status ledger. A school blueprint may use local work-package labels for authoring convenience, but those labels do not create a second completion system. Before work begins, each milestone receives an owner, explicit dependencies, a concrete deliverable, acceptance evidence, and a rollback or data-migration note when applicable. A topic inventory alone cannot be marked complete.

## Roadmap rules

- Teach before decorating. A screen should spend most of its space helping a beginner understand or practice something.
- Use plain language. Explain a new term before relying on it.
- Preserve existing lesson, module, project, concept, route, and learner-record identifiers.
- Keep drafts outside the public catalog until they satisfy the publication contract. Once a course is published, keep its outline, units, exercises, and lab guidance visible and directly open. Do not use locked cards, teaser routes, or artificial access gates.
- Treat preparation paths as optional refreshers and introductions. A learner may start anywhere; recommended preparation supplies context and never locks content, labs, completion, or browsing.
- Keep public-site deployment separate from runner-image deployment.
- Treat automated checks, browser checks, and a real beginner review as different kinds of evidence.
- Finish one release slice before beginning the next slice that depends on it.
- Add capabilities to shared registries and contracts rather than copying a one-off implementation.
- Do not add subscriptions, advertising, paid random rewards, public profiles, or social pressure as default product behavior.

## Current baseline

The latest documented live production baseline is the 2026-08-26 Phase 5B compatibility release. It has five courses, 30 modules, 150 lessons, four guided projects, and 100 editable runner assignments. The live site also has the OAuth flow, synchronized learner record, four runner toolchains, adaptive Practice, Code Reference, portfolio exports, and bookmarkable routes.

The current source-controlled publication candidate selects the complete Practical C++ course. It has six courses, 36 modules, 180 lessons, four guided projects, and 112 editable runner assignments. Practical C++ contributes 12 runner-backed lessons and 18 teaching-only lessons that must never receive execution grants. The last tested application baseline before this academy-roadmap expansion was commit `8f9ab85b376e9925c2b9c5786d26eae266654a59`; it matched the local and remote `main` refs and passed hosted CI in [run 33206908058](https://github.com/AES256Afro/SeePoundCoffeePie/actions/runs/33206908058). Later roadmap changes require a new exact-commit CI result. Source and CI evidence is not staging or production deployment evidence. M009 and M010 remain incomplete until staging, manual accessibility and beginner review, and production verification pass for the same reviewed release.

- **M000, roadmap contract:** Keep this file aligned with completed release records, current source, and live evidence. Every new milestone needs an owner, dependency position, acceptance rule, and rollback or recovery note when it changes persistent data or production behavior.

## Decisions that need an owner answer

- **D01, voice and narration (resolved 2026-08-30):** Voice input, recorded narration, and microphone features are out of scope. Reopen only after an explicit owner decision and an accessible text-first review; no current milestone depends on pronunciation.
- **D02, learner age floor:** Decide whether the product is explicitly adult-oriented, teen-friendly, or suitable for younger learners. Needed before analytics, community, and privacy expansion.
- **D03, account policy:** Decide whether email sign-in is ever needed or GitHub plus guest use remains the complete account model.
- **D04, progress portability (resolved 2026-08-30):** Provide a private human-readable transcript in addition to the existing machine-readable backup. It must distinguish completion, assessment, self-attested lab work, checked evidence, human review, and issued credentials.
- **D05, optional help:** Decide whether future contextual help is entirely local and authored, server-generated, or can use an AI provider only after explicit opt-in.
- **D06, community boundary:** Decide whether community means read-only examples, private cohorts, or public discussion. No public posting should be built without moderation and privacy plans.
- **D07, certificates (resolved 2026-08-30):** Provide completion records, applied skill credentials, and later professional certificates as separate evidence levels. Completion alone does not certify competence. Applied credentials require server-owned assessment and declared lab evidence. Broader certificates require multiple assessed skills and an integrative capstone.
- **D08, native tools (resolved 2026-08-30):** Give first-class access guidance for Linux, Windows through WSL or a virtual machine, macOS native tools where equivalent, and Linux virtual machines on macOS where Linux-specific behavior matters. Keep reading-only routes available when hardware permits no lab.
- **D09, sustainability:** Decide whether the product remains donation-supported, accepts sponsorship, or offers paid human review or other services. Published teaching material must remain open and may not be hidden behind payment.
- **D10, accessibility review:** Identify at least one keyboard-only user and one screen-reader user for release-candidate reviews.

## Phase 5B: publish Practical C++ safely

This phase records the existing continuing-course release model. Its `prerequisite` wording describes current source and historical evidence. M102 and M103 later replace that access behavior with open routes and optional recommended preparation without rewriting the dated release record.

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

- **M053, lesson schema v2:** Define required learning goal, recommended preparation, new terms, retrieval target, activity type, feedback, hint, and assessment fields. Recommended preparation is advisory metadata and cannot hide a route or prevent completion.
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

## Phase 16: open academy architecture

These are product-development dependencies, not learner access gates. All published material remains visible and directly open.

The shared product contract and detailed school inventories are indexed in the [academy curriculum expansion](docs/curriculum/README.md). The Linux, networking, cybersecurity, and local-model plans are content blueprints, not claims of live publication.

This phase extends existing contracts rather than replacing them: M113 reuses M028 route identity, M107 extends M053 authoring, M117 extends M088 glossary behavior, and later refreshers reuse the M069, M070, and M076 foundations. Existing identifiers and proven behavior remain compatible.

- **M101, academy expansion contract:** Adopt the Linux, networking, cybersecurity, local-model, and optional-preparation schools in one source-controlled product contract. Complete when scope, processing boundaries, open-access rules, evidence claims, and ownership are unambiguous.
- **M102, open published catalog:** Remove `locked`, teaser, and artificial coming-soon behavior from published learning surfaces. Complete when a learner can open every published path, course, module, unit, exercise, and lab guide directly, including through a guessed valid canonical URL.
- **M103, optional preparation model:** Replace access-style prerequisites with optional preparation paths and short context summaries. Complete when every recommendation offers `Start now`, `Review refresher`, and `Read short context`, and no choice affects access or completion.
- **M104, learning-domain registry:** Add generic domain identities for programming, Linux, networking, cybersecurity, local models, and preparation. Complete when a non-programming course validates without claiming a language runtime.
- **M105, generic identifier contracts:** Define stable path, course, module, unit, lab, assessment, and credential identifiers without a fixed six-course union. Complete when duplicates, ambiguous ownership, malformed slugs, and invalid references fail the build.
- **M106, legacy programming adapter:** Present every existing programming course through the generic academy registry while preserving all current IDs, routes, progress, Practice ownership, Code Reference ownership, projects, and runner grants.
- **M107, learning-unit schema:** Add article, worked-example, diagram, knowledge-check, local-lab, case-study, reference, history, and assessment-preparation units. Complete when each type has a clear completion rule and inert content contract.
- **M108, static content compiler:** Compile authored Markdown-like source and metadata into validated, versioned, lazy-loaded JSON. Complete when authored scripts cannot execute in the browser and one school does not enter another school's initial bundle.
- **M109, source-reference contract:** Require primary sources, source labels, review dates, version scope, and claim ownership for technical content. Complete when missing or malformed references fail publication rather than becoming untraceable prose.
- **M110, freshness policy:** Define current, review-due, legacy, and retired content states. Complete when tool-specific instructions display tested versions and stale material is reviewed or labeled before release.
- **M111, academy catalog filters:** Add URL-addressable filters for school, path, level, duration, reading-only, lab, operating system, hardware lane, offline capability, assessment, and credential applicability. Complete when filters remain usable by keyboard and at 200 percent zoom.
- **M112, learning-path pages:** Add open path outlines with outcomes, suggested preparation, course order, alternate entries, lab requirements, and credential relationships. Complete when paths are useful without forcing the learner to follow the listed order.
- **M113, breadcrumb and route identity:** Add school, path, course, module, unit, lab, assessment, transcript, and credential routes with complete breadcrumbs. Complete when Back, Forward, refresh, bookmark, and shared links preserve the exact location.
- **M114, module pages:** Give each module a bookmarkable outline with objectives, new terms, units, exercises, labs, estimated time, references, and last review date. Complete when modules do not require a large decorative header or unnecessary scroll.
- **M115, reading-first unit renderer:** Build a teaching page for definitions, explanations, examples, comparisons, procedures, warnings, sources, and previous or next navigation. Complete when no code runner or model runtime loads unless a programming exercise explicitly needs it.
- **M116, visual teaching primitives:** Add accessible directory trees, timelines, packet journeys, evidence boards, state diagrams, comparison tables, annotated terminals, and model lifecycle maps. Complete when every visual has a useful static and screen-reader equivalent.
- **M117, shared glossary:** Add short definitions, examples, related terms, first-use links, and school-specific meanings. Complete when a beginner can open a term without losing lesson position and an author can detect an unexplained abbreviation.
- **M118, history and context interludes:** Add short `Then and now`, `Design decision`, `Case file`, and `Reality check` units between demanding practical sections. Complete when interludes teach relevant context and do not become filler or marketing copy.
- **M119, original guide system:** Introduce Mara Venn, the Maintainer, and the supporting original cast under a written originality contract. Complete when names, art, dialogue, clothing, plots, and compositions do not copy a television property and every appearance adds teaching value.
- **M120, academy surface release gate:** Test catalog scale, lazy loading, routes, accessibility, browser history, search, filtering, open access, bundle privacy, and draft exclusion with representative material from every domain before publishing the generic shell.

## Phase 17: local labs, assessments, transcripts, and credentials

M121 through M132 can proceed before the account and age decisions. M133 through M140 are a separate credential track and do not block open lessons, exercises, ordinary lab guides, or browser-local completion records. M136, M138, and M139 cannot begin until D02 and D03 resolve age, consent, account recovery, retention, deletion, reviewer access, and public-name behavior.

- **M121, shared lab risk classes:** Adopt L0 reading, L1 inspection, L2 disposable user-space change, L3 controlled system change, and L4 isolated security or infrastructure simulation. Complete when every lab declares one class and the required recovery controls.
- **M122, lab-manifest schema:** Define stable ownership, supported access lanes, time, privilege, CPU, memory, storage, download, network, source, license, preflight, success, cleanup, evidence, checksum, and review fields. Reject incomplete manifests at build time.
- **M123, Windows native and WSL lanes:** Provide tested Windows-native inspection and bounded local practice plus WSL setup, filesystem, user, networking, editor, update, backup, and removal guidance. Complete when commands are labeled by PowerShell, Command Prompt, graphical Windows tool, or Linux shell, and destructive unregister steps carry explicit data-loss warnings.
- **M124, disposable virtual-machine lane:** Provide Windows and macOS Linux-VM routes with resource planning, NAT or isolation defaults, snapshots, shared-folder warnings, graceful shutdown, reset, and deletion. Complete with a native walkthrough on each claimed host.
- **M125, macOS native lane:** Document shared Unix concepts and Linux-specific differences. Complete when Linux-specific kernel, service, firewall, package, and filesystem labs route to a Linux VM rather than pretending macOS is Linux.
- **M126, existing Linux lane:** Use read-only inspection first, dedicated users or environments for changes, distribution and release scope, and explicit rollback. Complete when no lab assumes the learner can reinstall the host.
- **M127, learner-controlled remote lane:** Add optional remote-server labs with cost, identity, firewall, authentication, exposure, teardown, and deletion guidance. Complete when no foundation requires a paid external service.
- **M128, reproducible lab archives:** Build immutable archives with manifests, platform requirements, starter files, checks, expected schemas, cleanup, evidence templates, licenses, security notes, and checksums. Complete when a clean rebuild produces the expected file set, a canonical internal file inventory, and the same final archive hash recorded in an external sidecar or publication index.
- **M129, local preflight standard:** Give every native lab safe checks for platform, architecture, versions, privilege, memory, storage, network boundary, authorization, recovery point, and cleanup understanding. A failed preflight must route to repair, another lane, reading mode, or safe stop.
- **M130, recovery and cleanup standard:** Require snapshots, backups, bounded targets, teardown, service stop, file removal, port verification, and cost verification as appropriate. Complete when cleanup cannot resolve to a home directory, filesystem root, wildcard, or unrelated resource.
- **M131, cybersecurity authorization record:** Require owner, learner, purpose, included and excluded systems, allowed and prohibited actions, network boundary, time window, recovery owner, and retention for every L4 lab. Reject public or unrelated targets.
- **M132, local-model compute boundary:** Add bundle and dependency checks proving the site does not perform model inference, training, dataset processing, model download, or third-party model calls. Complete when only explanations, ordinary assessments, manifests, and credential records cross the web boundary.
- **M133, progress schema v4:** Add generic path, course, module, unit, lab, and review records while preserving old records, backups, synchronization, deletion, and conflict merge. Unknown and revoked IDs must fail closed without erasing valid new fields.
- **M134, human-readable transcript:** Add a private transcript that distinguishes reading completion, assessment result, self-attested lab, checked manifest, human-reviewed lab, applied credential, and professional certificate. Complete when export is understandable without exposing raw attempts or private artifacts.
- **M135, assessment blueprint contract:** Define objectives, item classes, difficulty, selection, passing rules, retakes, accommodations, feedback, versioning, and retirement for each scored assessment. Complete when a credential can point to the exact skills measured.
- **M136, server-owned assessment service:** Store answer keys and scoring server-side, bind attempts to versions, rate-limit starts and submissions, and retain only the documented result data. Complete when browser assets and progress uploads cannot forge a pass.
- **M137, evidence-manifest verifier:** Validate permitted schemas, challenges, versions, hashes, and consistency without receiving forbidden artifacts. Complete when the interface previews every uploaded field and explains that a manifest alone does not prove authorship or legal identity.
- **M138, credential storage:** Add immutable course-completion snapshots, assessment attempts, lab evidence metadata, review decisions, issued credentials, verification policies, and revocations outside mutable learner-progress JSON.
- **M139, private and public verification:** Keep credentials private by default and add explicit public opt-in using unguessable IDs. Complete when a public page exposes only approved name, title, skills, evidence class, dates, versions, and status.
- **M140, credential integrity gate:** Verify issuance, expiration, legacy status, privacy, deletion choices, revocation, appeal, assessment secrecy, rubric use, and wording. Do not use accredited, licensed, industry-certified, or legal-identity claims without an independent basis.

## Phase 18: optional preparation and refresher paths

- **M141, computer-basics refresher:** Explain hardware, software, operating systems, programs, processes, services, local machines, virtual machines, containers, and remote servers with inspectable examples.
- **M142, resource-basics refresher:** Explain CPU, memory, accelerator memory, unified memory, storage, network, temperature, and utilization. Complete when learners can match an observed constraint to the relevant resource without guessing.
- **M143, operating-system refresher:** Explain kernel, user space, account, administrator, service, driver, update, package, and application. Compare Windows, macOS, and Linux without ranking them as universally best.
- **M144, files-and-folders refresher:** Teach files, directories, names, extensions, hidden files, metadata, copies, moves, links, deletion, backups, and restore checks.
- **M145, path-comparison refresher:** Compare Windows drive letters and backslashes with Unix roots and forward slashes. Complete when learners can translate concrete paths and identify which operating system owns a file.
- **M146, command-line refresher:** Teach terminal, shell, prompt, command, option, argument, quoting, current directory, input, output, exit status, help, history, pipes, redirection, and stopping a command.
- **M147, technical-reading refresher:** Teach placeholders, version scope, requirements, examples, notes, warnings, release notes, primary sources, and experiment records. Complete when learners can distinguish a command to copy from a placeholder to replace.
- **M148, troubleshooting refresher:** Teach reproduce, expected versus observed, exact error, safe diagnostic, one change, confirmation, rollback, and the difference between workaround and repair.
- **M149, virtualization-concepts refresher:** Explain host, guest, hypervisor, virtual CPU, memory, disk, firmware, network, image, snapshot, clone, and teardown.
- **M150, WSL orientation:** Explain what WSL provides, what remains Windows, WSL 1 versus WSL 2 at a conceptual level, Linux distributions, file placement, networking, and when a full VM is clearer.
- **M151, safe-VM workshop:** Guide creation, snapshot, restoration, shutdown, export, and deletion of a disposable Linux VM without beginning the full Linux course.
- **M152, users-and-privilege refresher:** Explain identity, standard user, administrator, root, sudo, ownership, permissions, authentication, authorization, and least privilege.
- **M153, software-installation refresher:** Compare installers, app stores, package repositories, package managers, dependencies, signatures, checksums, updates, removal, and leftovers.
- **M154, Git-and-reproducibility refresher:** Teach repository, change, snapshot, commit, branch, remote, configuration, lock file, checksum, manifest, and clean rebuild.
- **M155, programming-concepts refresher:** Explain instructions, values, variables, decisions, repetition, functions, structured data, errors, tests, scripts, and dependencies without requiring one specific language.
- **M156, binary-and-units refresher:** Teach powers of two, bits, bytes, prefixes, binary place value, masks, ratios, rates, and unit conversion for networking, storage, and model memory.
- **M157, networking-context refresher:** Explain two computers communicating, names, addresses, packets, ports, services, routers, switches, DNS, DHCP, latency, bandwidth, and loss.
- **M158, everyday-security refresher:** Teach updates, backups, password managers, multi-factor authentication, phishing recognition, safe downloads, device encryption, screen locks, recovery codes, and privacy.
- **M159, lab-safety refresher:** Teach authorization, scope, snapshots, backups, checksums, isolation, secrets, administrator warnings, stop conditions, cleanup, evidence, and recovery.
- **M160, preparation-choice validation:** Test the refresher model with beginners and experienced learners. Complete when both can start any course immediately, find relevant context, dismiss recommendations, and return without progress or access penalties.

## Phase 19: Linux and Open Systems school

The school ranges M161 through M330 group scope by domain. They are not a command to finish one multi-year school before starting the next. After the shared foundation, publish one reviewed foundation slice in this order: Linux, networking, cybersecurity, and local models. Deeper school waves can then proceed in parallel when their explicit concept, lab, safety, and platform dependencies are ready.

- **M161, Linux school map:** Publish the open beginner-to-advanced path map, use cases, optional preparation, platform lanes, labs, capstones, and credential relationships without ranking learners or locking content.
- **M162, Unix and Linux history:** Teach time-sharing, Unix, BSD, GNU, the Linux kernel, distributions, open-source collaboration, servers, desktops, mobile systems, embedded systems, cloud, and containers with a dated visual timeline.
- **M163, kernel, user space, and distribution:** Explain what Linux names, what a distribution adds, and why a desktop environment is separate. Complete when learners stop treating every component as the kernel.
- **M164, why organizations use Linux:** Teach availability, automation, cloud and container ecosystems, hardware breadth, observability, support options, licensing, and control alongside migration, staffing, compatibility, governance, and maintenance costs. Use current evidence without claiming every company is abandoning Windows.
- **M165, distribution families and communities:** Compare Debian, Ubuntu, Fedora, Red Hat, Arch, openSUSE, Linux Mint, immutable systems, and specialist distributions by governance, release model, package system, support, documentation, audience, and tradeoffs.
- **M166, choose a distribution workshop:** Build a needs-based decision guide for learning, desktop use, gaming, development, servers, older hardware, stability, experimentation, and enterprise support. Time-stamp recommendations and avoid one universal winner.
- **M167, Linux through WSL setup:** Guide a Windows learner through installation, user creation, updates, file placement, terminal use, editor connection, networking context, backup, repair, and safe removal.
- **M168, Linux VM on Windows setup:** Guide a snapshot-capable VM with resource planning, image verification, NAT, display, shared-folder warnings, updates, and reset.
- **M169, Linux VM on macOS setup:** Provide Intel and Apple Silicon routes, architecture-matched images, resource planning, snapshots, networking, and reset.
- **M170, live media and native-install planning:** Explain firmware, architecture, secure boot, partitioning, encryption, drivers, backups, live environments, dual boot, and recovery without making native installation the beginner default.
- **M171, Windows migration inventory:** Record applications, games, devices, files, accounts, licenses, browser data, password managers, cloud storage, printers, accessibility needs, and recovery dependencies before recommending a move.
- **M172, compatibility and replacement plan:** Classify each Windows dependency as native Linux, web, compatibility layer, virtual machine, remote access, replacement, or blocker. Complete when uncertainty and testing status remain visible.
- **M173, migration backup and rollback:** Create verified backups, recovery media, credential recovery, data-format checks, and a return plan before any operating-system change.
- **M174, staged Windows-to-Linux migration:** Move through reading, WSL, disposable VM, live media, secondary machine or dual boot, and optional full migration. Include 7-day and 30-day checklists and a clear stop path.
- **M175, Linux desktop foundations:** Teach sessions, desktop environments, panels, launchers, settings, displays, input, audio, files, printers, accessibility, sleep, updates, and recovery without assuming one desktop.
- **M176, gaming on Linux:** Teach Steam, Proton, Wine concepts, native games, launchers, drivers, controllers, game saves, anti-cheat limitations, compatibility research, performance checks, Flatpak permissions, and rollback. Avoid promising that every game works.
- **M177, terminal and shell foundations:** Teach terminal versus shell, Bash basics, prompt, current directory, commands, quoting, expansion, history, completion, help, and safe interruption.
- **M178, documentation and help:** Teach manual pages, `--help`, info pages, distribution documentation, project documentation, logs, release notes, and trustworthy search habits.
- **M179, Linux root directory map:** Build the expandable `/` explorer and explain the Filesystem Hierarchy Standard, real-world differences, persistent versus generated data, ownership, and risk.
- **M180, configuration under `/etc`:** Explain system-wide configuration, defaults, drop-in directories, host identity, services, networks, users, backups, and why editing generated files can fail.
- **M181, users under `/home` and `/root`:** Explain personal data, configuration, caches, service accounts, root's separate home, privacy, quotas, and backup choices.
- **M182, changing data under `/var`:** Explain logs, caches, spools, queues, databases, websites, package state, variable growth, capacity failures, and why `/var` is commonly separated on servers.
- **M183, programs under `/usr`, `/bin`, and `/sbin`:** Explain historical separation, modern merged `/usr`, executable search paths, administrator tools, libraries, read-only system images, and distribution differences.
- **M184, temporary and runtime state:** Explain `/tmp`, `/var/tmp`, `/run`, sockets, process identifiers, boots, cleanup, permissions, sticky bits, and why runtime state is not ordinary permanent data.
- **M185, devices and kernel views:** Explain `/dev`, `/proc`, and `/sys` as device nodes and kernel-provided views rather than normal stored files. Use read-only inspection labs first.
- **M186, optional and mounted content:** Explain `/opt`, `/srv`, `/mnt`, `/media`, application data, served data, manual mounts, removable media, and why local conventions vary.
- **M187, Linux versus Windows filesystem concepts:** Compare one root with drive letters, mount points with assigned drives, case sensitivity, executable permission with extensions, hidden names with attributes, links, metadata, and path translation.
- **M188, ownership and permissions:** Teach users, groups, read, write, execute, directory permissions, modes, symbolic notation, umask, ACL concepts, sudo, and least privilege through a disposable lab.
- **M189, filesystems, inodes, and links:** Explain filenames, directory entries, inodes, hard links, symbolic links, deletion, open files, metadata, and capacity without requiring kernel-development knowledge.
- **M190, text tools and pipelines:** Teach standard input, standard output, standard error, pipes, redirection, grep, sort, cut, head, tail, find, and safe composition using transparent sample data.
- **M191, processes, jobs, and signals:** Teach process identity, parent and child, foreground and background, resource use, signals, jobs, clean shutdown, forced termination, and visible failure symptoms.
- **M192, services and systemd:** Explain boot targets, units, dependencies, service state, logs, enable versus start, timers, drop-ins, reload, restart, rollback, and non-systemd context.
- **M193, packages and repositories:** Compare package formats, repositories, metadata, signatures, dependencies, updates, holds, removal, Flatpak, Snap, source builds, and third-party-repository risk.
- **M194, disks, partitions, and filesystems:** Explain blocks, partition tables, filesystems, labels, identifiers, capacity, encryption, swap, and destructive boundaries with image-backed labs.
- **M195, mounts and persistent mount configuration:** Teach mount points, temporary mounts, `/etc/fstab`, identifiers, network filesystems, permissions, failure recovery, and boot risk inside a disposable VM.
- **M196, logs and the journal:** Teach log purpose, timestamps, severity, rotation, journal queries, application logs, disk growth, privacy, and a repeatable evidence-first diagnosis.
- **M197, users, groups, sudo, and service identities:** Create, inspect, lock, and remove lab identities safely. Explain login shells, home ownership, group access, sudo policy, and why services should not run as root by default.
- **M198, SSH and remote administration:** Teach keys, host verification, known hosts, agent use, server configuration, least privilege, port forwarding concepts, logging, recovery, and the danger of exposing password login casually.
- **M199, Linux networking:** Teach interfaces, addresses, routes, DNS, sockets, ports, NetworkManager and system tools, name resolution, and read-only troubleshooting before configuration changes.
- **M200, Linux firewalling:** Teach host firewall purpose, connection state, default policy, loopback, local services, logging, recovery, and distribution tools inside an isolated VM.
- **M201, build a Linux server:** Guide requirements, distribution choice, installation, storage, users, SSH, updates, firewall, time, logs, backups, monitoring, documentation, and recovery before adding an application.
- **M202, web-service lab:** Deploy a small static or local web service, bind safely, inspect logs, add service management, verify firewall behavior, update, back up, roll back, and remove it.
- **M203, database-service lab:** Explain database files, service identity, local binding, authentication, backup, restore, capacity, logs, updates, and removal using non-sensitive sample data.
- **M204, file-sharing lab:** Compare local files, SMB, NFS, permissions, identities, firewall boundaries, client paths, backups, and recovery on an isolated network.
- **M205, containers on Linux:** Explain image, container, layer, registry, namespace, cgroup, volume, network, rootless operation, resource limits, supply-chain risk, cleanup, and when a VM is the stronger boundary.
- **M206, shell scripting and automation:** Teach variables, quoting, conditionals, loops, functions, exit handling, logs, dry runs, idempotence, tests, and bounded file changes.
- **M207, backup and restore operations:** Compare file copies, snapshots, archives, database dumps, off-site copies, retention, encryption, restore tests, recovery time, and recovery-point goals.
- **M208, performance and observability:** Teach load, CPU, memory, storage, I/O, network, processes, logs, bottlenecks, baselines, and measured change without cargo-cult tuning.
- **M209, boot, kernel, and recovery:** Explain firmware, bootloader, kernel, initramfs, root filesystem, init, emergency modes, kernel modules, updates, rollback, rescue media, and evidence preservation.
- **M210, Linux credentials and release gate:** Pilot Linux Foundations, Linux Desktop and Migration, Linux Server Operator, and Linux Administrator credentials. Complete only after open routes, labs, platform walkthroughs, assessments, capstones, recovery, accessibility, and source freshness pass.

## Phase 20: Networking school, from first packet to BGP

- **M211, networking school map and history:** Publish open paths from first principles through advanced routing, alongside a timeline from early packet networks and Ethernet through the modern Internet, Wi-Fi, cloud networks, and IPv6.
- **M212, signals and media:** Teach electrical, optical, and radio signals; copper, fiber, and wireless media; duplex; interference; attenuation; connectors; transceivers; and the difference between a signal problem and a protocol problem.
- **M213, Ethernet foundations:** Explain frames, source and destination addresses, EtherType, payload, frame check sequence, link speed, duplex, collision history, switching, and why Ethernet changed over time.
- **M214, Wi-Fi foundations:** Explain radio channels, bands, access points, stations, association, authentication, interference, signal strength, roaming, security modes, and why advertised speed differs from useful throughput.
- **M215, MAC addresses and local delivery:** Teach unicast, multicast, broadcast, address learning, neighbor relationships, interface identity, privacy addresses, and the limits of treating a MAC address as a person or permanent identity.
- **M216, packets and IP:** Explain packet headers, source, destination, hop limits, fragmentation history, routing decisions, and why IP offers best-effort delivery rather than a guaranteed conversation.
- **M217, TCP, UDP, and transport behavior:** Teach connection setup, reliability, ordering, flow and congestion control, datagrams, checksums, retransmission, latency, and application tradeoffs using packet timelines.
- **M218, ports, sockets, and services:** Explain listening and established sockets, client ephemeral ports, server ports, local and remote endpoints, loopback, bind addresses, and why a port is not an application or a security policy.
- **M219, layered network models:** Use the TCP/IP and OSI models as troubleshooting maps rather than memorization contests. Complete when learners can place a symptom at several plausible layers and test safely.
- **M220, binary and masks for networks:** Reuse the optional binary refresher, then teach bit boundaries, prefixes, masks, ranges, powers of two, and visual address grouping without requiring mental tricks.
- **M221, IPv4 addressing:** Teach public, private, loopback, link-local, network, host, broadcast, prefix, gateway, and interface addresses. Explain historical classes as history, not current design guidance.
- **M222, subnetting practice system:** Add visual, repeated subnet exercises from tiny local networks through variable-size designs. Include estimation, exact calculation, error explanations, and reference aids rather than speed pressure.
- **M223, ARP and IPv6 neighbor discovery:** Trace address resolution, caches, requests, replies, duplicate detection, and spoofing risk inside an isolated network.
- **M224, DHCP:** Explain discovery, offer, request, acknowledgment, leases, options, reservations, relays, failure symptoms, rogue service risk, and packet inspection.
- **M225, DNS:** Teach labels, zones, authoritative servers, recursion, caching, records, TTL, negative answers, DNSSEC concepts, split views, privacy, and a complete name-resolution troubleshooting path.
- **M226, switching:** Teach forwarding tables, flooding, unknown unicast, broadcasts, port states, link aggregation, speed and duplex mismatch, and switch evidence using safe emulation.
- **M227, VLANs and trunks:** Explain segmentation, access and tagged links, native VLAN risks, inter-VLAN routing, management networks, and why VLANs are not complete security boundaries.
- **M228, loops and spanning tree:** Show why Layer 2 loops can multiply traffic, how spanning-tree families select paths, what blocked links do, and how to recover in a simulated topology.
- **M229, routing tables:** Teach connected, static, learned, default, and more-specific routes; administrative preference; metrics; next hops; recursive lookup; and longest-prefix matching through visual decisions.
- **M230, static-routing labs:** Build two-router and multi-router isolated networks, inspect forward and return paths, create and repair missing or asymmetric routes, and document the final table.
- **M231, NAT and address translation:** Explain source and destination translation, state, port mapping, private addressing, inbound reachability, hairpin behavior, carrier-grade NAT, troubleshooting, and why NAT is not a substitute for a firewall.
- **M232, network firewalls:** Teach zones, interfaces, state, rules, order, default action, logging, egress, ingress, application context, change review, rollback, and verification with synthetic traffic.
- **M233, VPN concepts and labs:** Compare encrypted tunnels, remote access, site-to-site, full and split routing, identity, keys, DNS, route conflicts, kill switches, performance, and recovery in learner-owned environments.
- **M234, IPv6 foundations:** Teach address notation, prefixes, link-local, global, unique local, multicast, neighbor discovery, router advertisements, DHCPv6 context, privacy, dual stack, transition, firewalling, and why IPv6 is not simply larger IPv4.
- **M235, Linux network tools:** Teach `ip`, `ss`, `ping`, `tracepath`, `dig`, `resolvectl`, `ethtool`, `nmcli`, logs, and safe capture tools by question rather than command memorization.
- **M236, packet-capture literacy:** Teach capture points, filters, timestamps, layers, streams, checksums, encrypted payload limits, privacy, bounded retention, and how to avoid collecting unrelated traffic.
- **M237, network troubleshooting method:** Establish scope, map the path, confirm physical or virtual link, inspect local configuration, resolve names, test routes and ports, capture only when needed, change one item, verify, and restore temporary settings.
- **M238, symptom-based diagnosis labs:** Provide broken-link, wrong-address, duplicate-address, DHCP, DNS, VLAN, route, MTU, firewall, latency, loss, and application-listener scenarios with visible evidence and repair checks.
- **M239, dynamic-routing concepts:** Explain neighbor relationships, advertisements, topology or distance information, convergence, metrics, redistribution, filtering, failure domains, and why routing protocols exist.
- **M240, OSPF path:** Teach areas, neighbors, link-state advertisements, costs, designated routers, summarization, authentication context, convergence, and failure diagnosis in an isolated emulator.
- **M241, BGP foundations:** Explain autonomous systems, external and internal BGP, network-layer reachability, path attributes, best-path policy, sessions, advertisements, and why BGP is policy-driven rather than shortest-path routing.
- **M242, BGP policy and traffic engineering:** Teach import and export policy, local preference, AS paths, communities, MED context, filtering, aggregation, default routes, and the risk of unintended transit without touching the public Internet.
- **M243, route leaks, hijacks, and RPKI:** Use public incident history and isolated simulations to explain origin mistakes, overly broad announcements, route filtering, prefix limits, route-origin authorization, monitoring, containment, and recovery.
- **M244, isolated BGP lab:** Build a multi-AS topology with containerized or virtual routers, establish sessions, announce lab prefixes, apply policy, create a controlled leak, detect it, contain it, restore the baseline, and save evidence.
- **M245, resilience and high availability:** Teach redundancy, shared failure, first-hop redundancy, link aggregation, multi-homing, health checks, failover, convergence, capacity during failure, and testing rather than assuming redundancy works.
- **M246, proxies and load balancing:** Explain forward and reverse proxies, Layer 4 and Layer 7 balancing, health checks, sessions, TLS termination, source addresses, retries, timeouts, and observable failure modes.
- **M247, cloud and virtual networking:** Teach virtual networks, subnets, route tables, security groups, gateways, load balancers, private endpoints, peering, transit, hybrid links, cost, and provider-specific differences through an optional external lane and a local simulation.
- **M248, network automation:** Teach inventory, source of truth, templates, APIs, structured configuration, validation, dry runs, diffs, idempotence, staged change, backup, rollback, and secret handling using disposable devices.
- **M249, observability and network design capstone:** Build a requirements-led design with diagrams, addressing, segmentation, routing, DNS, DHCP, security, monitoring, capacity, failure tests, operations, costs, and migration. Require the learner to defend tradeoffs.
- **M250, networking credentials and release gate:** Pilot Network Foundations, Network Technician, Linux Networking, Network Automation, and Advanced Routing and BGP credentials after open access, simulations, safety, platform parity, assessments, capstones, accessibility, and source review pass.

## Phase 21: Cybersecurity school, defensive and evidence-led

- **M251, cybersecurity school map and ethics:** Publish the open paths, work roles, defensive focus, authorization rules, lab boundaries, evidence classes, and credential claims. Complete when no page treats cybersecurity as secret commands or permission to target others.
- **M252, security history:** Teach early computer security, phone networks, worms, viruses, Internet growth, cryptography policy, firewalls, identity, web security, major defensive turning points, cloud, supply chains, ransomware, and modern resilience through dated case studies.
- **M253, threat, vulnerability, likelihood, and impact:** Define security risk in plain language and practice separating an asset, threat, vulnerability, exposure, control, event, and consequence.
- **M254, assets and data:** Inventory people, devices, accounts, software, services, networks, data, suppliers, and business processes. Classify sensitivity, ownership, location, dependency, and recovery priority.
- **M255, threat modeling:** Draw data flows, trust boundaries, actors, entry points, abuse cases, assumptions, controls, and residual risk. Complete when a model includes normal operation and recovery, not only attacks.
- **M256, authorization and scope workshop:** Build a written rules-of-engagement record for a fictional or local lab. Distinguish ownership, permission, included systems, excluded actions, time, communication, stop conditions, and evidence retention.
- **M257, personal security foundations:** Teach updates, backups, device encryption, screen locks, password managers, multi-factor authentication, recovery codes, privacy settings, safe downloads, account recovery, and family or small-team support.
- **M258, passwords and phishing-resistant authentication:** Explain password storage, unique passwords, managers, one-time codes, push fatigue, security keys, passkeys, recovery, service risks, and deployment tradeoffs without collecting real credentials.
- **M259, identity and access management:** Teach identities, accounts, authentication, authorization, roles, groups, least privilege, joiner-mover-leaver processes, service identities, federation, single sign-on, conditional access concepts, logs, and recovery.
- **M260, operating-system hardening:** Build a baseline around supported versions, updates, accounts, services, applications, storage encryption, firewall, logging, backups, recovery, and documented exceptions rather than one universal checklist.
- **M261, Linux security:** Teach permissions, sudo, service identities, SSH, packages, repositories, signatures, firewalling, mandatory-access-control concepts, logs, integrity, backups, containers, and hardening with reversible local labs.
- **M262, Windows and macOS security context:** Explain platform-native identity, update, encryption, firewall, application-control, logging, recovery, and management concepts so Linux-focused learners can recognize cross-platform differences.
- **M263, network defense:** Teach asset discovery within scope, segmentation, secure management, DNS and DHCP protection, egress, remote access, monitoring, encrypted traffic limits, and response through isolated topologies.
- **M264, firewall and segmentation design:** Build zones, trust boundaries, required flows, default policy, management access, logs, change review, verification, exception expiry, and rollback for a fictional small organization.
- **M265, wireless security:** Teach radio boundaries, authentication modes, encryption, guest networks, management, rogue access points, client isolation, enterprise identity context, monitoring, and safe home or lab configuration.
- **M266, how the web works for defenders:** Explain browser, URL, DNS, HTTP, TLS, cookies, sessions, origins, storage, APIs, servers, databases, proxies, and logs before introducing web-security failures.
- **M267, common web risks:** Teach injection, broken access control, authentication failures, unsafe design, configuration, vulnerable components, integrity, logging, request forgery, and server-side request risks through purpose-built local applications and mitigations.
- **M268, secure coding foundations:** Teach input boundaries, output encoding, parameterized data access, authentication, authorization checks, secrets, errors, dependencies, tests, code review, and safe defaults in the existing programming schools.
- **M269, secrets and key management:** Explain secrets, tokens, passwords, API keys, private keys, certificates, storage, environment boundaries, rotation, revocation, logging risks, CI use, and emergency response without exposing real values.
- **M270, cryptography foundations:** Explain goals, keys, randomness, hashing, message authentication, symmetric and asymmetric encryption, signatures, key exchange, and common misuse without turning mathematics into unexplained magic.
- **M271, PKI and TLS:** Teach certificates, names, chains, roots, intermediates, private keys, handshake context, validation, expiration, revocation limits, automation, and diagnosis using learner-owned services.
- **M272, privacy and data protection:** Teach data minimization, purpose, consent, access, retention, deletion, encryption, logs, metadata, backups, sharing, incident impact, and jurisdiction awareness without pretending one course is legal advice.
- **M273, vulnerability management:** Teach inventory, advisories, CVEs, severity, exploitability, exposure, prioritization, ownership, remediation, mitigation, verification, exceptions, and reporting using synthetic inventories.
- **M274, patch and configuration management:** Teach supported versions, baselines, change review, test groups, maintenance windows, rollback, drift, emergency updates, and evidence that a repair actually reached the intended system.
- **M275, software supply-chain security:** Teach source trust, packages, transitive dependencies, signatures, checksums, SBOMs, build provenance, CI permissions, secrets, releases, update channels, maintainer risk, and incident response.
- **M276, logging foundations:** Teach event purpose, timestamps, identity, source, severity, structure, normalization, retention, privacy, integrity, clock synchronization, missing evidence, and why more logs are not automatically better.
- **M277, detection and SIEM concepts:** Teach collection, parsing, enrichment, baselines, rules, queries, correlation, dashboards, cases, retention, cost, false positives, and tuning using synthetic events.
- **M278, alert triage:** Practice acknowledge, scope, evidence, hypothesis, priority, enrichment, containment decision, escalation, documentation, and closure. Require a visible distinction between fact and inference.
- **M279, threat intelligence:** Teach indicators, behaviors, tactics, sources, confidence, timeliness, sharing, bias, context, operational value, and expiration. Do not treat an IP address or hash as proof of an actor.
- **M280, incident-response lifecycle:** Teach preparation, detection, analysis, containment, eradication, recovery, communication, evidence, legal or organizational escalation, and lessons learned through fictional incidents.
- **M281, containment and eradication labs:** Isolate purpose-built hosts, disable lab identities, block synthetic indicators, preserve evidence, remove the intended cause, verify clean state, and avoid destroying the information needed to understand the event.
- **M282, recovery and post-incident improvement:** Restore from trusted sources, rotate affected secrets, validate business function, monitor recurrence, communicate limits, record timeline, assign improvements, and verify that backups actually work.
- **M283, digital-forensics foundations:** Teach evidence questions, order of volatility, images, hashes, timelines, filesystem and log artifacts, chain-of-custody concepts, privacy, tooling limits, and reporting through prepared or synthetic evidence.
- **M284, malware concepts for defenders:** Explain delivery, execution, persistence, command and control, privilege, collection, impact, indicators, sandboxing, and response at a conceptual or prepared-artifact level. Do not distribute live malware or destructive payloads.
- **M285, social-engineering defense:** Teach persuasion, urgency, authority, pretexting, phishing, support fraud, business-email compromise, verification channels, reporting, and blame-free response without teaching real-world targeting or delivery.
- **M286, email security:** Explain message flow, domains, headers, SPF, DKIM, DMARC, filtering, links, attachments, impersonation, reporting, quarantine, and recovery using synthetic messages and learner-owned domains only where authorized.
- **M287, cloud-security foundations:** Teach shared responsibility, identity, public exposure, storage, networks, keys, logs, configuration, backups, cost, and deletion across provider-neutral concepts before optional provider labs.
- **M288, container and orchestration security:** Teach image trust, runtime identity, capabilities, secrets, networks, storage, resource limits, host boundaries, orchestration control planes, policies, logs, updates, and recovery in disposable environments.
- **M289, endpoint defense:** Teach inventory, prevention, application control, host firewall, behavior detection, isolation, evidence, user impact, false positives, updates, and recovery without presenting one product as universal.
- **M290, mobile, IoT, and operational-technology context:** Explain constrained devices, long lifecycles, radios, physical access, safety, vendor support, segmentation, monitoring, update limits, and why ordinary desktop assumptions may fail.
- **M291, governance with NIST CSF 2.0:** Use Govern, Identify, Protect, Detect, Respond, and Recover to organize outcomes, profiles, ownership, measurement, and improvement without turning framework labels into rote memorization.
- **M292, cybersecurity work-role map:** Use the current NICE Framework as a reference for tasks, knowledge, skills, roles, and career exploration. Keep role paths open and avoid promising employment from course completion.
- **M293, defensive challenge range:** Add local, purpose-built challenges for log analysis, hardening, detection, incident handling, secure configuration, and recovery. Every challenge includes authorization, evidence, mitigation, cleanup, and a non-competitive learning route.
- **M294, integrated cyber capstone:** Secure and operate a fictional small organization's Linux services and network, detect a bounded synthetic incident, contain it, recover, and present the evidence, decisions, residual risk, and improvement plan.
- **M295, cybersecurity credentials and release gate:** Pilot Security Foundations, Linux Security, Network Defender, Security Operations, Incident Response, and Security Engineer credentials after ethics, open access, safe labs, assessments, review, accessibility, source freshness, and recovery pass.

## Phase 22: Local Models and LLMs school

- **M296, local-model school boundary:** Publish the open school map and enforce that inference, downloads, data processing, fine-tuning, training, and GPU work occur only in learner-controlled environments.
- **M297, LLM foundations path:** Teach ordinary software versus learned systems, examples, parameters, weights, checkpoints, uncertainty, and when not to use an LLM without requiring model-capable hardware.
- **M298, tokens and model lifecycle:** Teach tokenization, context, next-token generation, pretraining, supervised adaptation, preference tuning, evaluation, quantization, deployment, and retirement with one connected visual map.
- **M299, responsible-use foundations:** Teach bias, privacy, rights, attribution, limitations, environmental and hardware cost, human review, failure boundaries, and non-AI alternatives.
- **M300, local-lab foundations:** Reuse files, command line, Python, environments, tensors, Git, manifests, checksums, and reproducibility refreshers to build a clean local-model experiment folder.
- **M301, hardware and model-fit planning:** Teach parameters, precision, quantization, CPU memory, accelerator memory, unified memory, storage, context, cache, batch, and sequence effects. Complete when a preflight, not a broad tier, makes the final lab decision.
- **M302, model repositories, revisions, and licenses:** Teach base, instruction, and chat models; tokenizers; weight and quantized formats; exact revisions; checksums; model cards; licenses; restrictions; and download planning.
- **M303, local runtime path:** Provide reviewed llama.cpp, Ollama, MLX, and other appropriate variants without making one tool the conceptual curriculum. Record exact tested versions and platform claims.
- **M304, first offline inference:** Guide download review, checksum, local execution, expected output, resource observation, network disconnection test, logs, stop, cleanup, and result explanation.
- **M305, prompts, templates, context, and sampling:** Teach roles, chat templates, stop sequences, context budgets, temperature, probability controls, seeds, repeatability, injection risk, and the difference between changing input and changing weights.
- **M306, local inference measurement and diagnosis:** Teach load time, time to first token, throughput, memory, quality comparisons, out-of-memory symptoms, template mismatches, format errors, logs, and evidence-led repairs.
- **M307, data purpose, rights, and provenance:** Define the intended behavior, source inventory, permission, consent, sensitive information, use restrictions, deletion, and lineage before building a training set.
- **M308, model-data formats:** Teach text, instruction-response, conversation roles, chat templates, preference pairs, structured records, schemas, validation, and why format must match the training objective.
- **M309, cleaning and private-information removal:** Teach normalization, quality sampling, exact and near duplicates, synthetic private-information detection, labeling guidance, rejection records, and reversible transformations.
- **M310, splits, leakage, and dataset cards:** Teach train, validation, and test splits; benchmark contamination; lineage; versions; checksums; license metadata; limitations; and responsible dataset cards.
- **M311, evaluation foundations:** Define task, baseline, acceptance criteria, deterministic cases, failure categories, structured checks, and held-out evidence before changing a model.
- **M312, metrics and human evaluation:** Teach perplexity context, task metrics, semantic comparisons, blind review, rubrics, evaluator agreement, uncertainty, model-judge risks, and honest reports.
- **M313, safety and regression evaluation:** Build bounded misuse, privacy, refusal, over-refusal, hallucination, retained-capability, latency, memory, and quality tests that compare the changed model with its baseline.
- **M314, local retrieval path:** Teach when to use retrieval, document ingestion, chunking, embeddings, indexing, ranking, retrieval measurement, source citations, deletion, and rebuilding.
- **M315, retrieval security:** Teach document-level access, prompt injection, poisoned indexes, untrusted content, citation coverage, secrets, logs, and recovery through local synthetic documents.
- **M316, decide whether to fine-tune:** Compare ordinary code, prompting, retrieval, supervised adaptation, preference tuning, and training from scratch by goal, evidence, data, cost, risk, and maintenance.
- **M317, training concepts without mystery:** Teach loss, gradients, optimizers, learning rate, batch, gradient accumulation, epochs, schedules, precision, overfitting, checkpoints, and validation with small inspectable traces.
- **M318, LoRA and QLoRA path:** Teach adapters, target modules, rank, scaling, dropout, quantized bases, memory tradeoffs, checkpoints, tool versions, and low-resource versus standard lab lanes.
- **M319, controlled fine-tuning experiments:** Compare one variable at a time, record seeds and configs, stop and resume, inspect curves, preserve the baseline, diagnose overfitting, and reproduce a run from a clean environment.
- **M320, fine-tuning capstone:** Adapt a small model for one narrow non-sensitive task, demonstrate measured improvement, disclose regressions and limitations, and publish a model card without uploading weights to SeePoundCoffeePie.
- **M321, tokenizers and small-model training:** Teach vocabulary design, embeddings, positions, attention, feed-forward layers, normalization, causal masking, data pipelines, loss, optimization, validation, and tiny from-scratch training.
- **M322, scaling and ablation labs:** Compare tokenizer, context, model size, data budget, and component choices under controlled budgets. Record negative results, compute, energy context, and deviations.
- **M323, preference-tuning path:** Teach chosen and rejected examples, annotator guidance, ambiguity, reward concepts, direct preference methods, safety tuning, sycophancy, refusal, over-refusal, and retained capabilities.
- **M324, quantization and performance path:** Teach precision, calibration context, model conversion, quality loss, cache, context, batching, concurrency, latency, throughput, resource limits, and rollback artifacts.
- **M325, package and serve locally:** Teach adapters, merging, model formats, local APIs, loopback defaults, authentication, streaming, queues, cancellation, timeouts, resource limits, logs, health, updates, rollback, and removal.
- **M326, local-model security and privacy:** Threat-model models, datasets, packages, retrieval, tools, secrets, logs, network exposure, licenses, telemetry, retention, incident response, and responsible release.
- **M327, distributed training and reproducible research:** Teach data parallelism, sharding, communication, distributed checkpoints, failed-worker recovery, experiment tracking, hypotheses, controlled comparisons, and research replication in H4 or learner-selected environments.
- **M328, local-model specializations:** Add code, multimodal, multilingual, domain adaptation, local agents, Apple Silicon, NVIDIA, and small-model research paths only after shared safety, data, evaluation, and reproducibility foundations exist.
- **M329, local-model credential sequence:** Pilot Local AI Foundations, Run a Local Model, Prepare LLM Data, Evaluate a Local Model, Fine-Tune with LoRA or QLoRA, Responsible Release, Local Model Service, and later broader practitioner credentials.
- **M330, local-model release gate:** Verify no model runtime in browser bundles, open routes, lab archives, hardware disclosures, platform walkthroughs, source and license freshness, assessment secrecy, credential wording, accessibility, cleanup, and no forbidden artifact collection.

## Phase 23: integrated paths, capstones, and academy scale

M331 through M342 assemble existing course and path IDs. They add cross-school ordering, context bridges, and capstones, not duplicate foundation courses. M343 through M347 depend on the applicable reviewed school slices and the M121 through M140 lab, evidence, privacy, and credential contracts they actually use. A broader credential waits for M210, M250, M295, and M330; open integrated teaching does not.

- **M331, Linux desktop and migration path:** Combine computer refreshers, distribution choice, desktop, compatibility, gaming, staged migration, backup, and rollback into an open path for Windows users exploring Linux.
- **M332, Linux server operator path:** Combine Linux foundations, services, networking, SSH, firewall, storage, logs, backups, monitoring, automation, and recovery into a role-oriented path and capstone.
- **M333, Linux administrator path:** Combine advanced storage, identities, packages, service management, performance, boot, kernel, security, automation, incident response, and documented operations.
- **M334, network technician path:** Combine physical media, Ethernet, Wi-Fi, addressing, DHCP, DNS, switching, tools, packet capture, documentation, and symptom-led troubleshooting.
- **M335, network engineer path:** Add subnet design, VLANs, routing, IPv6, firewalls, VPNs, resilience, load balancing, cloud networking, automation, observability, and a requirements-led design.
- **M336, advanced routing and BGP path:** Combine dynamic routing, OSPF, BGP, policy, route leaks, RPKI, resilience, simulation, monitoring, incident response, and a multi-AS capstone.
- **M337, cyber defender path:** Combine personal, identity, OS, Linux, network, web, data, vulnerability, logging, detection, and recovery skills around defensive outcomes.
- **M338, security operations and incident response path:** Combine telemetry, SIEM, triage, threat intelligence, containment, forensics, recovery, communication, and post-incident improvement.
- **M339, security engineer path:** Combine threat modeling, identity, platform, network, application, cloud, supply chain, cryptography, governance, architecture, and an integrative design review.
- **M340, local model operator path:** Combine computer and Linux context, hardware planning, model artifacts, local runtimes, inference, prompts, measurement, troubleshooting, privacy, and offline operation.
- **M341, LLM data and evaluation path:** Combine rights, provenance, formats, cleaning, splits, cards, baselines, metrics, human review, safety, leakage, and reproducible reporting.
- **M342, local LLM engineer path:** Combine data, evaluation, retrieval, adaptation, performance, serving, security, licensing, rollback, and a learner-controlled integrative capstone.
- **M343, Linux and networking integrated lab:** Build, address, secure, observe, diagnose, back up, and recover a small multi-host Linux network in disposable environments.
- **M344, networking and cybersecurity integrated lab:** Segment a fictional organization, define allowed flows, collect bounded telemetry, detect a synthetic event, contain it, restore service, and defend the design.
- **M345, Linux and local-model integrated lab:** Prepare a Linux model host, verify artifacts, run offline inference, measure resources, bind a private service safely, monitor it, roll back, and document limitations.
- **M346, private home-lab path:** Combine virtualization, Linux, storage, networking, DNS, remote access, backups, monitoring, security, model services, power and cost, documentation, and recovery without requiring public exposure.
- **M347, small-organization capstone:** Design and operate a fictional small organization's Linux services, network, security controls, and optional local-model service with budgets, migration, monitoring, incidents, recovery, and handoff documentation.
- **M348, transcript and portfolio evidence:** Let learners export private, human-readable learning and project records that distinguish completion, assessment, self-attestation, deterministic checks, human review, and current or legacy credentials.
- **M349, assessment fairness and maintenance:** Review item quality, objective coverage, accessibility, accommodations, bias, ambiguity, retakes, appeals, drift, compromise, and retirement on a documented cycle without grading by LLM.
- **M350, academy-scale release:** Declare the expansion stable only after shared architecture, open access, optional refreshers, cross-platform labs, Linux, networking, cybersecurity, local models, credentials, maintenance ownership, accessibility, privacy, security, staging, production, and recovery have durable evidence.

## Immediate working order

M001 through M008 are implemented in the publication-candidate source. The source now selects the complete six-course application and exact 112-assignment runner registry. The last tested application baseline before this academy-roadmap expansion was commit `8f9ab85b376e9925c2b9c5786d26eae266654a59`; hosted GitHub Actions `CI` run [33206908058](https://github.com/AES256Afro/SeePoundCoffeePie/actions/runs/33206908058) passed for that exact commit. Roadmap-only commits after that baseline still require their own exact-commit hosted CI before release.

The active release order remains the controlled M009 staging deployment and regression proof, the recorded manual beginner and accessibility review, and then M010 production. Both release milestones require more than a passing local build or hosted CI job. Academy implementation begins with M101 after the current release is either completed or deliberately closed. M101 through M120 establish the shared open academy. M121 through M132 and M141 through M160 establish lab safety, platform routes, model boundaries, and optional preparation before the first school foundation slices. M133 through M140 proceed separately after D02 and D03 and do not delay open teaching.

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

The dated local gate recorded 78 Vitest files and 808 tests, 11 of 11 candidate Chromium cases, and 15 of 15 five-course Chromium cases. The browser coverage is now being carried by the ordinary production-dist harness rather than a second candidate server. The exact source commit and hosted CI result for that dated checkpoint are recorded separately in the [Phase 5B browser gate record](docs/PHASE_5B_BROWSER_GATE.md). Manual keyboard and screen-reader review, 200 percent zoom, reduced-motion review, other browsers, runner-image execution, staging, and production still need their own evidence.

## Explicit exclusions for the current release horizon

- No partial Practical C++ catalog card or coming-soon route.
- No public leaderboard, learner ranking, or streak punishment.
- No automatic sharing of code, progress, identity, or portfolio work.
- No broad AI tutor added before the authored teaching and privacy gates.
- No native package installation from the browser.
- No raw secret values in documentation, logs, tests, screenshots, or support packets.
