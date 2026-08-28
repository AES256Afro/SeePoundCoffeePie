# SeePoundCoffeePie

SeePoundCoffeePie teaches programming from the beginning. It assumes the learner has never written code before.

The name is the curriculum:

- **See** = C++
- **Pound** = C#
- **Coffee** = Java
- **Pie** = Python

Lessons are short and guided across four foundation courses, Practical Python, and Practical C++. Each new term is explained in plain language, shown in a concrete example, used immediately, and revisited in later practice. Story-based exercises remain where they make an idea easier to understand or remember.

## What the repository includes

The current implementation includes:

- a public introduction that explains the site before asking a visitor to choose a course;
- a four-question beginner intake that asks one plain-language question at a time and recommends, but does not lock, a course;
- an open learner home with one continuation action, review priorities, and visible course progress;
- a bookmarkable course catalog and separate outlines for Python, C++, C#, and Java Foundations, `Practical Python: Data Tools`, and `Practical C++: Collections and Records`;
- six fully playable five-lesson modules in each of the six courses;
- four bookmarkable 12-step projects: Python's `Your First Interactive Program`, C++'s `Your First Compiled Program`, C#'s `Community Workshop Check-In`, and Java's `Community Picnic Planner`;
- a private portfolio preview for each completed project with a deliberate, script-free HTML download;
- plain-language explanations and concrete analogies;
- guided choices, output prediction, code ordering, bug repair, and editable code exercises;
- immediate, specific feedback and optional hints;
- an end-of-module retry round that brings missed ideas back once and awards no points;
- real isolated execution for 48 editable foundation lessons, 12 editable Practical Python lessons, and 12 editable Practical C++ lessons;
- points, an adjustable daily point goal, a study streak, lesson and module completion, and accuracy tracking;
- a spaced-review scheduler that weighs correct and incorrect attempts;
- language-wide Practice that builds a short review of up to five familiar questions from completed modules across every course in the selected language, starting with ideas that are due or need another pass and awarding no points or module-completion rewards;
- a searchable beginner Code Reference and a Learner Record with examples that appear after related lessons and separate progress for every course;
- validated local JSON backup and restore for course progress;
- offline-safe browser persistence with a visible reset control;
- optional private cross-device progress synchronization, conflict choices, and account-data deletion;
- responsive layouts for desktop, tablet, and mobile;
- keyboard focus states, reduced-motion support, and a documented Ctrl or Command plus Enter editor shortcut;
- optional GitHub identity verification with a secure, server-side OAuth flow.

## Bookmarkable pages

The site uses clean application URLs instead of separate `.html` files. Cloudflare returns the React application shell for each route, so these pages can be opened directly, refreshed, shared, or bookmarked:

- `/` is the public introduction and is never skipped because of saved progress;
- `/start` is beginner intake;
- `/home` is the learner home and continuation page;
- `/courses` is the complete course catalog;
- `/courses/python-foundations`, `/courses/cpp-foundations`, `/courses/csharp-foundations`, and `/courses/java-foundations` are the four foundation-course outlines;
- `/courses/python-data-tools` is the Practical Python outline. It can be previewed while locked and opens only after both Python Foundations and `/projects/python/first-interactive-program` are complete;
- `/courses/cpp-collections-records` is the Practical C++ outline. It can be previewed while locked and opens only after both C++ Foundations and `/projects/cpp/first-compiled-program` are complete;
- `/learn/:course-slug/:module-id/:lesson-id` is an exact lesson URL. For example, `/learn/python-foundations/py-first-spark/py-console` opens the first Python lesson directly;
- `/learn/python-data-tools/py-data-return-values/pydata1-retrieve-call` opens the first Practical Python lesson after both prerequisites are complete;
- `/learn/cpp-collections-records/cpp-records-return-values/cpprecords1-retrieve-call` opens the first Practical C++ lesson after both prerequisites are complete;
- `/projects/python/first-interactive-program` is the Python project overview, and adding a project-step ID opens that exact Python step;
- `/projects/cpp/first-compiled-program` is the C++ project overview, and adding a project-step ID opens that exact C++ step;
- `/projects/csharp/workshop-check-in` is the C# project overview, and adding a project-step ID opens that exact C# step;
- `/projects/java/picnic-planner` is the Java project overview, and adding a project-step ID opens that exact Java step;
- `/portfolio/:language/:project-id` is the browser-local portfolio preview for one matching completed project. The route is bookmarkable, but project source remains in the browser where it was written;
- `/practice/:language` is the selected language's Practice page and can draw from completed modules in more than one course;
- `/practice/:language/session` opens a private adaptive set assembled from completed modules;
- `/practice/:language/session/:step` preserves the current question while navigating inside the same open tab without exposing weak concept identifiers;
- `/codebook/:language` is the selected language's Code reference;
- `/profile` is the Learner Record;
- `/settings` contains GitHub identity, synchronization state, daily goal, backup, restore, account-data deletion, and reset controls;
- `/academy/:language` and `/academy/:language/missions/:mission-id` remain supported compatibility routes for existing bookmarks;
- older focused Practice bookmarks under `/practice/:language/missions/:mission-id` remain available only for completed missions. New adaptive sets keep the bounded exercise queue in tab-scoped session storage instead of putting learner weaknesses in the URL.

The browser Back and Forward buttons follow these routes normally. A bookmarked course controls the course selector, Practice link, and Code reference link on that page without silently replacing the learner's saved default course. A `CourseId` owns curriculum and routes, while its runtime `language` selects the toolchain, Practice pool, and Code reference examples. This allows `python-foundations` and `python-data-tools` to remain distinct courses without pretending Python is two execution languages. Selecting another active course does not erase progress in the other languages. Existing mission and exercise identifiers remain unchanged behind the course, module, and lesson presentation. Authored exercise identifiers also provide durable per-lesson completion, so a learner resumes at the first unfinished lesson without replaying credited work. A separate allowlisted browser-local lesson journal protects that partial progress from an already-open older tab that does not know the new field.

Each module unlocks only after the previous module is complete in the same language. Module 2 retrieves output and variable skills before introducing Booleans, comparisons, `if`, and `else`. Module 3 retrieves that decision work before introducing collections, arrays or lists, and zero-based indexing. Module 4 retrieves an indexed item before explaining loops, tracing repeated output, assembling a loop, and applying it to the whole collection. Module 5 retrieves that loop before introducing reusable functions or methods, parameters, arguments, definitions, and calls. Module 6 then combines storage, conditions, collections, loops, and reusable code in an integrative capstone without adding another syntax burden.

Practical Python begins only after the learner completes both Python Foundations and `Your First Interactive Program`. Its modules retrieve functions and formatting before introducing returned answers, text normalization, list mutation, dictionaries, accumulators, and filters. The final Supply Tracker combines those ideas with fixed in-memory data and no new input or package burden.

Practical C++ begins only after the learner completes both C++ Foundations and `Your First Compiled Program`. Its modules retrieve functions and collections before introducing returned helper values, vectors, records, references, record updates, accumulators, and filters. The final Workshop Stock Report uses fixed in-memory records and no files, packages, or network access.

The current source totals 36 playable modules and 180 authored lessons across six courses, plus four 12-step projects. The selected runner registry contains exactly 112 editable assignments: 48 foundation lessons, 12 Practical Python lessons, 12 Practical C++ lessons, and 40 project steps. The other 18 Practical C++ lessons use choices, predictions, or ordering in the browser and never request an execution grant.

These counts describe the source-controlled Practical C++ publication candidate. The last recorded live compatibility release still has five courses, 30 modules, 150 lessons, and 100 runner assignments. Staging and production publication remain separate release steps and are not claimed by this README.

Inside editable code exercises, press Ctrl+Enter on Windows or Linux, or Command+Enter on macOS, to run the same check as the visible button. Tab keeps its normal browser behavior so keyboard learners can leave the editor without getting trapped.

## Run locally

Requirements: a current Node.js LTS release and npm.

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:4173](http://127.0.0.1:4173).

The local Vite server proxies only `/api/runner/*` to the deployed isolated runner so editable exercises work during interface development. Source entered into a local editable exercise is therefore submitted to the same ephemeral, network-blocked runner used by the live site. OAuth and learner-record APIs are not proxied. To test against another HTTPS runner deployment, set `SPCP_DEV_RUNNER_ORIGIN` before starting Vite:

```bash
SPCP_DEV_RUNNER_ORIGIN=https://your-runner.example npm run dev
```

## Verify the project

```bash
npm test
npm run lint
npm run build
```

Or run the same complete local release gate with one command:

```bash
npm run check:release
```

`npm run test:e2e` builds the site and runs the ordinary six-course production artifact in Chromium against a loopback-only preview. The harness blocks service workers, live API access, and external origins. It covers both continuing-course prerequisite paths, canonical Practical C++ course and lesson routes, keyboard exit from the editor, navigation and language switching at 390 CSS pixels, Practice, Code Reference, and scoped WCAG A and AA checks on representative pages. Practical C++ now runs in this normal production-dist gate instead of a second candidate-only browser server. `npm run check:release` includes that browser gate.

Automated browser checks do not replace manual keyboard, screen-reader, 200 percent zoom, reduced-motion, multi-browser, staging, or production review. Those remain separate release evidence.

The runner has a separate Docker and operating-system boundary check. It builds all four pinned images and verifies successful programs, compiler errors, CPU, memory, storage, output, and network denial:

```bash
npm run check:runner:image
```

The production bundle is written to `dist/`.
`npm run check:bundle` enforces raw and gzip budgets for emitted JavaScript, CSS, HTML, and inert JSON teaching data, plus an aggregate transfer cap so moving bytes between file types cannot hide growth. It separately caps the lazy Portfolio and shared continuing-course route JavaScript, Practical Python and packed foundation teaching content, Code Reference JavaScript, the combined initial application stylesheet, and the lazy learning-workspace stylesheet. It also requires at least 15 percent raw and gzip headroom for initial JavaScript and CSS, so course growth cannot silently create an oversized first load.
`npm run check:foundation-content` verifies that the lazy packed foundation curriculum is deterministic and still matches the readable curriculum source. `npm run check:cpp-content-candidate` keeps its historical command name, but now verifies the source-selected publication: deterministic generated JSON, one lazy owning loader, the six-course application, the exact 112-assignment runner registry, the complete sitemap projection, fixed JavaScript, CSS, route, teaching-data, and aggregate limits, and absence of protected server markers.
`npm run check:project-bundle` recursively rejects emitted source maps, requires the Practical C++ teaching data behind its one lazy loader, and scans the production browser output for server-owned assessment material before a deployment wrapper can invoke Wrangler.
`npm run check:social-preview` verifies the Open Graph and large-card metadata plus the exact 1200 by 630 share image used by Discord and other social platforms.

## Production hosting

The production site is deployed as a Cloudflare Worker with Static Assets:

- canonical domain: [https://seepoundcoffeepie.com](https://seepoundcoffeepie.com)
- `www` redirects to the canonical apex domain;
- unknown navigation paths return the React application shell;
- hashed assets receive immutable caching;
- HTML is revalidated and served with browser security headers.
- shared links use a branded 1200 by 630 Open Graph image and large-card metadata.

Run a configuration-only deployment check with:

```bash
npm run deploy:dry-run
npm run deploy:staging:dry-run
```

For routine public-site work after a reviewed runner set is already live, deploy from a clean `main` checkout with:

```bash
npm run deploy
```

This public-site-only command runs the complete release gate, deploys Worker code and static browser assets with Wrangler's container-free rollout mode, and requires the selected environment's code checker to be paused. It compares each runner application's ID, image, version, reported instance count, and update time before and after deployment, and fails if any value changes. `npm run deploy:staging` applies the same checks to staging.

The first Practical C++ publication is not routine website work. Its guarded commands deploy the built site, Worker, published assignment registry, and reviewed C++ image together:

```bash
npm run deploy:runner:cpp:staging:dry-run
npm run deploy:runner:cpp:staging
npm run prove:runner:cpp:staging
npm run deploy:runner:cpp:production:dry-run
npm run deploy:runner:cpp:production
```

That guarded deployment must be the only initial publication mutation in each environment. Do not run `deploy:site:staging` after the guarded staging deployment because a second Worker upload would change the version used by the staging proof. Production must consume the fresh same-commit staging proof.

Do not replace the reviewed wrapper with a raw `wrangler deploy` command. Runner-image releases use a separate controlled procedure. See [Public-site deployment boundary](docs/PUBLIC_SITE_DEPLOYMENT.md).

Verify the live social preview, apex domain, `www` redirect, security headers, and SPA fallback with:

```bash
npm run check:live
```

After Practical C++ is deployed, the default live check requires the code checker to be fully configured and enabled. It verifies a known Python grant, all 12 runner-backed Practical C++ grants with the C++ language binding, and the 18 teaching-only Practical C++ exercise IDs that must always return not found. During a deliberately paused release, use `npm run check:live:paused`; it requires a configured paused checker, rejects executable grants with the expected paused response, and still proves that teaching-only IDs cannot cross the runner boundary. These source checks are expected to fail against the older five-course compatibility deployment until the guarded publication completes.

The DNS, TLS, WAF, cache, security-reporting, and intentional-exception state verified on 2026-08-27 is recorded in the [dated production domain security baseline](docs/PRODUCTION_DOMAIN_SECURITY_BASELINE_2026-08-27.md).

## GitHub sign-in

Production uses a GitHub OAuth App with these exact public settings:

- application name: `SeePoundCoffeePie`
- homepage URL: `https://seepoundcoffeepie.com`
- authorization callback URL: `https://seepoundcoffeepie.com/api/auth/github/callback`

The GitHub client ID is a public identifier, so it is stored as the `GITHUB_CLIENT_ID` text variable in `wrangler.jsonc`. The Worker requires two encrypted Cloudflare secrets:

```bash
npx wrangler secret put GITHUB_CLIENT_SECRET
openssl rand -base64 48 | npx wrangler secret put SESSION_SECRET
openssl rand -base64 48 | npx wrangler secret put LEARNER_DATA_SECRET
```

For local Worker testing, copy `.dev.vars.example` to `.dev.vars` and fill in local values. The real `.dev.vars` file is ignored by Git.

The authorization flow uses an exact callback, a cryptographic state value, PKCE with SHA-256, short-lived secure cookies, and a signed seven-day `HttpOnly` session. It requests no private GitHub scopes. After GitHub returns the public account ID and login, the Worker revokes the temporary GitHub grant and does not store the access token. Logging out clears the signed site session and requires a same-origin request.

GitHub sign-in verifies identity and can synchronize one private Learner Record after the learner explicitly chooses how to handle existing browser and account progress. Guests keep the complete browser-only experience. Signed-in learners can save or combine a browser record, use an existing account record, continue safely while offline, resolve revision conflicts, and delete the server copy without deleting the browser copy.

The synchronized record includes learning settings, points, streak, completed lessons, modules, projects, and project steps, aggregate answer counts, memory strength, and review dates. It does not retain submitted code, raw attempts, GitHub access tokens, email, raw IP addresses, or social data. A dedicated `LEARNER_DATA_SECRET` pseudonymizes the GitHub account ID and must remain stable across normal `SESSION_SECRET` rotations.

Apply the versioned D1 schema before deploying Worker code that uses it:

```bash
npm run d1:migrate:local
npm run d1:migrate:staging
npm run d1:migrate:production
```

The Learner Record can also download a versioned JSON backup and restore it after validating every lesson, module, project, project-step, concept, count, date, and language value. The complete storage contract, migration choices, conflict policy, deletion behavior, privacy boundary, retention policy, and recovery procedure are in the [Phase 3 release record](docs/PHASE_3_RELEASE.md).

## How editable code runs

The 48 editable foundation exercises, 12 editable Practical Python exercises, 12 editable Practical C++ exercises, and 40 editable project steps use real server-side Python, C++, C#, and Java toolchains. The browser requests a five-minute exercise-scoped run grant, submits only the versioned language, source, optional text input, and `run` or `check` purpose, then polls an opaque learner-owned result ID. Each grant and stored result is bound to grading-only assignment data and a checked revision of the grading implementation. The browser receives only a keyed opaque binding, not the protected revision. Changed, revoked, or legacy assignments fail closed before source acceptance, sandbox creation, or stored output return. Learners cannot choose an executable, command, compiler flag, package, image, path, mount, or network destination.

Every attempt starts in a fresh Cloudflare Sandbox VM with a pinned base image and fixed server-owned toolchain commands. A trusted supervisor drops privileges, blocks socket syscalls, measures the whole process tree, caps CPU, wall time, memory, processes, writable storage, stdout, and stderr, and destroys the VM after the result. Each final project check replaces caller-supplied input with one visible and three server-owned cases. Every case uses a different fresh VM. Python's parser, C++'s pinned compiler front end, C#'s pinned Roslyn parser, and Java's pinned compiler-tree analyzer verify the deliberately small program shapes taught by their projects. The Practical Python Supply Tracker has fixed in-memory data and uses a separate protected Python AST profile to verify the four taught functions, the supplied harness, and statement order. Comments, inactive code, early exits, aliases, Unicode escapes, added members, moved statements, and unsupported control flow cannot earn structural credit. The browser receives only visible output and pass summaries. Private inputs, reference solutions, assessment profiles, and internal syntax analysis stay out of the browser bundle and result. Language errors are translated into beginner language while sanitized raw diagnostics remain available under a disclosure.

The production runner can be paused independently of the learning site and GitHub sign-in. Deployment and kill-switch instructions, supported language versions, staging and production verification commands, rollback steps, and known boundaries are in the Phase 2 release record.

Choice, prediction, and ordering questions remain local because they do not execute code. The complete boundary, exact limits, abuse controls, retention policy, and repeatable validation commands are in the [isolated runner security contract](docs/RUNNER_SECURITY_CONTRACT.md) and [Phase 2 release record](docs/PHASE_2_RELEASE.md).

## Teaching approach

The teaching approach uses:

- short explanations followed by hands-on work;
- ordered progression instead of making a beginner choose what comes next;
- immediate feedback;
- retrieval practice and spaced repetition;
- streaks and small rewards for habit support;
- one complete guided project after each language's foundation course.

Read the full [product and curriculum blueprint](docs/PRODUCT_BLUEPRINT.md).
The dependency-ordered work ahead is maintained in the [milestone roadmap](MILESTONES.md).
The verified Phase 1 scope and handoff are recorded in the [Phase 1 learning foundation release](docs/PHASE_1_RELEASE.md).
The verified Phase 2 execution boundary is recorded in the [Phase 2 real execution release](docs/PHASE_2_RELEASE.md).
The Phase 3 account and durable-learning-data contract is recorded in the [Phase 3 release](docs/PHASE_3_RELEASE.md).
The Python project studio, protected assessment, local-draft boundary, and Phase 4A verification are recorded in the [Phase 4A release](docs/PHASE_4A_RELEASE.md). The multi-project registry and first compiled C++ project are recorded in the [Phase 4B release](docs/PHASE_4B_RELEASE.md). The first complete C# project and its trusted Roslyn grading boundary are recorded in the [Phase 4C release](docs/PHASE_4C_RELEASE.md). The Java picnic project, compiler-tree grading boundary, and final four-language project parity are recorded in the [Phase 4D release](docs/PHASE_4D_RELEASE.md). The bounded cross-module review selector, private same-tab session routing, zero-reward Practice flow, and progress-schema hardening are recorded in the [Phase 4E release](docs/PHASE_4E_RELEASE.md). Durable per-lesson resume, honest project completion semantics, and the private portfolio export boundary are recorded in the [Phase 4F release](docs/PHASE_4F_RELEASE.md).
The second Python course, two-part prerequisite, language-wide Practice pool, protected Supply Tracker grading, compatibility floor, lazy boundaries, and controlled rollout are recorded in the [Phase 5A release](docs/PHASE_5A_RELEASE.md).
The course, lesson, navigation, accessibility, and visual direction is recorded in the [Open Learning Workshop milestone](docs/UI_REDESIGN_MOCKUPS.md). Its 2026-08-25 release record includes the exact source commit, deployed Worker version, accessibility review, route checks, runner regressions, and production browser evidence for that historical release. It does not claim that later local changes have been deployed.

## Research references

- [Boot.dev: bite-sized lessons followed by full projects](https://www.boot.dev/about)
- [Boot.dev Training Grounds: practice formats and spaced repetition](https://www.boot.dev/training)
- [Duolingo: ordered learning paths and spaced repetition](https://blog.duolingo.com/new-duolingo-home-screen-design/)
- [Duolingo: how spaced repetition supports long-term memory](https://blog.duolingo.com/spaced-repetition-for-learning/)
- [Duolingo: streaks as habit support](https://blog.duolingo.com/how-duolingo-streak-builds-habit/)

These references informed the learning mechanics, not the product’s creative expression.
