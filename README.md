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

- a complete cadet intake flow with language and daily-goal selection;
- four language stations: Python, C++, C#, and Java;
- one fully playable five-step beginner mission for each language;
- plain-language explanations and shipboard analogies;
- multiple-choice orientation and editable code exercises;
- immediate, specific feedback and optional hints;
- a local training simulator for deterministic beginner challenges;
- XP, daily goal, streak, star-shard, mission-completion, and accuracy tracking;
- a spaced-review scheduler that weighs correct and incorrect attempts;
- a Practice Bay, Codebook reference foundation, and Cadet Record;
- local browser persistence with a visible reset control;
- responsive layouts for desktop, tablet, and mobile;
- keyboard focus states and reduced-motion support.
- optional GitHub identity verification with a secure, server-side OAuth flow.

Planned missions are visible but intentionally locked. This makes the scope of the academy understandable without pretending unfinished curriculum is available.

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

The production bundle is written to `dist/`.

## Production hosting

The production site is deployed as a Cloudflare Worker with Static Assets:

- canonical domain: [https://seepoundcoffeepie.com](https://seepoundcoffeepie.com)
- `www` redirects to the canonical apex domain;
- unknown navigation paths return the React application shell;
- hashed assets receive immutable caching;
- HTML is revalidated and served with browser security headers.

Run a configuration-only deployment check with:

```bash
npm run deploy:dry-run
```

Deploy the current checkout with:

```bash
npm run deploy
```

Verify the live apex domain, `www` redirect, security headers, and SPA fallback with:

```bash
npm run check:live
```

## GitHub sign-in

Production uses a GitHub OAuth App with these exact public settings:

- application name: `SeePoundCoffeePie`
- homepage URL: `https://seepoundcoffeepie.com`
- authorization callback URL: `https://seepoundcoffeepie.com/api/auth/github/callback`

The Worker requires three encrypted Cloudflare secrets:

```bash
npx wrangler secret put GITHUB_CLIENT_ID
npx wrangler secret put GITHUB_CLIENT_SECRET
openssl rand -base64 48 | npx wrangler secret put SESSION_SECRET
```

For local Worker testing, copy `.dev.vars.example` to `.dev.vars` and fill in local values. The real `.dev.vars` file is ignored by Git.

The authorization flow uses an exact callback, a cryptographic state value, PKCE with SHA-256, short-lived secure cookies, and a signed seven-day `HttpOnly` session. It requests no private GitHub scopes. After GitHub returns the public account ID and login, the Worker revokes the temporary GitHub grant and does not store the access token. Logging out clears the signed site session and requires a same-origin request.

GitHub sign-in currently verifies identity only. Course progress, XP, streaks, and review history remain in the learner's browser and are neither uploaded nor synchronized.

## How the prototype checks code

The first missions use a local, deterministic training simulator. It checks whether the learner used the required beginner syntax, then shows the expected console output. It does not execute arbitrary code.

This boundary is visible inside every code lesson. Open-ended projects will require a sandboxed server-side compiler service with CPU, memory, time, filesystem, and network limits. JavaScript `eval`, unsandboxed child processes, and client-side claims of secure code execution are not acceptable substitutes.

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

## Research references

- [Boot.dev: bite-sized lessons followed by full projects](https://www.boot.dev/about)
- [Boot.dev Training Grounds: practice formats and spaced repetition](https://www.boot.dev/training)
- [Duolingo: ordered learning paths and spaced repetition](https://blog.duolingo.com/new-duolingo-home-screen-design/)
- [Duolingo: how spaced repetition supports long-term memory](https://blog.duolingo.com/spaced-repetition-for-learning/)
- [Duolingo: streaks as habit support](https://blog.duolingo.com/how-duolingo-streak-builds-habit/)

These references informed the learning mechanics, not the product’s creative expression.
