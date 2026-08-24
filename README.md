# SeePoundCoffeePie

SeePoundCoffeePie is a story-driven coding academy for people who have never programmed before.

The name is the curriculum:

- **See** = C++
- **Pound** = C#
- **Coffee** = Java
- **Pie** = Python

The product teaches programming through short, guided space-fantasy missions. Every new term is explained in plain language, reinforced with an analogy, used immediately, and scheduled to return for later practice.

## What is runnable today

The current vertical slice includes:

- a public launch page that always explains the academy before asking a visitor to choose a school;
- a complete cadet intake flow with language and daily-goal selection;
- four language stations: Python, C++, C#, and Java;
- six fully playable five-step beginner missions for each language;
- plain-language explanations and shipboard analogies;
- guided choices, output prediction, code ordering, bug repair, and editable code exercises;
- immediate, specific feedback and optional hints;
- an end-of-mission memory-repair round that repeats missed concepts without duplicate XP;
- real isolated execution for all 48 editable Python, C++, C#, and Java exercises;
- XP, adjustable daily goal, streak, star-shard, mission-completion, and accuracy tracking;
- a spaced-review scheduler that weighs correct and incorrect attempts;
- a Practice Bay that recommends the completed mission covering the most due concepts, then builds one focused exercise per due concept;
- a searchable 50-term beginner Codebook and a Cadet Record with progression-unlocked examples and separate progress for all four stations;
- validated local JSON backup and restore for course progress;
- local browser persistence with a visible reset control;
- responsive layouts for desktop, tablet, and mobile;
- keyboard focus states, reduced-motion support, and a documented Ctrl or Command plus Enter editor shortcut;
- optional GitHub identity verification with a secure, server-side OAuth flow.

## Bookmarkable pages

The academy uses clean application URLs instead of separate `.html` files. Cloudflare returns the React application shell for each route, so these pages can be opened directly, refreshed, shared, or bookmarked:

- `/` is the public launch page and is never skipped because of saved progress;
- `/start` is cadet intake;
- `/academy/python`, `/academy/cpp`, `/academy/csharp`, and `/academy/java` are the four mission paths;
- `/practice/:language` is the selected school’s Practice Bay;
- `/codebook/:language` is the selected school’s Codebook;
- `/profile` is the Cadet Record;
- `/settings` contains GitHub identity, training-goal, local-backup, and reset controls;
- `/academy/:language/missions/:mission-id` is an individual lesson;
- focused Practice Bay lessons use `/practice/:language/missions/:mission-id` and preserve the review concepts in the query string.

The browser Back and Forward buttons follow these routes normally. Selecting another active station updates language-specific page URLs without erasing progress in the other schools.

Each mission unlocks only after the previous mission is complete in the same language. Mission 2 retrieves output and variable skills before introducing Booleans, comparisons, `if`, and `else`. Mission 3 retrieves that decision work before introducing collections, arrays or lists, and zero-based indexing. Mission 4 retrieves an indexed item before explaining loops, tracing repeated output, assembling a loop, and applying it to the whole collection. Mission 5 retrieves that loop before introducing reusable functions or methods, parameters, arguments, definitions, and calls. Mission 6 then combines storage, conditions, collections, loops, and reusable code in an integrative capstone without adding another syntax burden.

The current curriculum totals 24 playable missions and 120 authored exercises across the four language stations.

Inside editable code exercises, press Ctrl+Enter on Windows or Linux, or Command+Enter on macOS, to run the same check as the visible button. Tab keeps its normal browser behavior so keyboard learners can leave the editor without getting trapped.

## Run locally

Requirements: a current Node.js LTS release and npm.

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:4173](http://127.0.0.1:4173).

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

The runner has a separate Docker and operating-system boundary check. It builds all four pinned images and verifies successful programs, compiler errors, CPU, memory, storage, output, and network denial:

```bash
npm run check:runner:image
```

The production bundle is written to `dist/`.
`npm run check:bundle` enforces raw and gzip budgets for the emitted JavaScript, CSS, and HTML so curriculum growth cannot silently create an oversized first load.
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
```

Deploy the current checkout with:

```bash
npm run deploy
```

Verify the live social preview, apex domain, `www` redirect, security headers, and SPA fallback with:

```bash
npm run check:live
```

## GitHub sign-in

Production uses a GitHub OAuth App with these exact public settings:

- application name: `SeePoundCoffeePie`
- homepage URL: `https://seepoundcoffeepie.com`
- authorization callback URL: `https://seepoundcoffeepie.com/api/auth/github/callback`

The GitHub client ID is a public identifier, so it is stored as the `GITHUB_CLIENT_ID` text variable in `wrangler.jsonc`. The Worker requires two encrypted Cloudflare secrets:

```bash
npx wrangler secret put GITHUB_CLIENT_SECRET
openssl rand -base64 48 | npx wrangler secret put SESSION_SECRET
```

For local Worker testing, copy `.dev.vars.example` to `.dev.vars` and fill in local values. The real `.dev.vars` file is ignored by Git.

The authorization flow uses an exact callback, a cryptographic state value, PKCE with SHA-256, short-lived secure cookies, and a signed seven-day `HttpOnly` session. It requests no private GitHub scopes. After GitHub returns the public account ID and login, the Worker revokes the temporary GitHub grant and does not store the access token. Logging out clears the signed site session and requires a same-origin request.

GitHub sign-in currently verifies identity only. Course progress, XP, streaks, and review history remain in the learner's browser and are neither uploaded nor synchronized. The Cadet Record can download that local data as a versioned JSON backup and restore it after validating every mission, concept, count, date, and language value.

## How editable code runs

The 48 editable academy exercises use real server-side Python, C++, C#, and Java toolchains. The browser requests a five-minute lesson-scoped run grant, submits only the versioned language, source, and optional text input fields, then polls an opaque learner-owned result ID. Learners cannot choose an executable, command, compiler flag, package, image, path, mount, or network destination.

Every attempt starts in a fresh Cloudflare Sandbox VM with a pinned base image and fixed server-owned toolchain commands. A trusted supervisor drops privileges, blocks socket syscalls, measures the whole process tree, caps CPU, wall time, memory, processes, writable storage, stdout, and stderr, and destroys the VM after the result. Compile errors are translated into beginner language while sanitized raw diagnostics remain available under a disclosure.

The production runner can be paused independently of the academy and GitHub sign-in. Deployment and kill-switch instructions, supported language versions, staging and production verification commands, rollback steps, and known boundaries are in the Phase 2 release record.

Choice, prediction, and ordering questions remain local because they do not execute code. The complete boundary, exact limits, abuse controls, retention policy, and repeatable validation commands are in the [isolated runner security contract](docs/RUNNER_SECURITY_CONTRACT.md) and [Phase 2 release record](docs/PHASE_2_RELEASE.md).

## Product direction

The learning loop draws on broad, well-supported product patterns:

- short explanations followed by hands-on work;
- ordered progression instead of making a beginner choose what comes next;
- immediate feedback;
- retrieval practice and spaced repetition;
- streaks and small rewards for habit support;
- larger guided projects after the foundational micro-skills.

SeePoundCoffeePie keeps its own interface, narrative, mentor, terminology, missions, rewards, and course content. It does not copy another product’s branding or lesson material.

Read the full [product and curriculum blueprint](docs/PRODUCT_BLUEPRINT.md).
The verified Phase 1 scope and handoff are recorded in the [Phase 1 learning foundation release](docs/PHASE_1_RELEASE.md).

## Research references

- [Boot.dev: bite-sized lessons followed by full projects](https://www.boot.dev/about)
- [Boot.dev Training Grounds: practice formats and spaced repetition](https://www.boot.dev/training)
- [Duolingo: ordered learning paths and spaced repetition](https://blog.duolingo.com/new-duolingo-home-screen-design/)
- [Duolingo: how spaced repetition supports long-term memory](https://blog.duolingo.com/spaced-repetition-for-learning/)
- [Duolingo: streaks as habit support](https://blog.duolingo.com/how-duolingo-streak-builds-habit/)

These references informed the learning mechanics, not the product’s creative expression.
