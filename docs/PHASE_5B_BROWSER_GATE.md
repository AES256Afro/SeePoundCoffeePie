# Phase 5B local browser gate record

Date: 2026-08-28

Status: historical local evidence from the 2026-08-28 unpublished-candidate checkpoint, followed by exact current source and hosted CI evidence. This is not staging or production evidence, and it does not claim a deployed Worker version.

## Purpose

The browser gate checks the built application in a real Chromium browser before a release can move to manual review. It is intentionally closed to live services so a local test cannot sign in, change learner data, submit source to the runner, or make unrelated internet requests.

## Recorded tools

- Node.js: 26.7.0
- npm: 11.19.0
- Playwright Test: 1.62.1
- Chromium revision: 1234
- Chromium version: 151.0.7922.34
- axe-core Playwright integration: 4.13.0

The exact Playwright and axe packages are pinned in the project lockfile. CI installs the matching Chromium build before running this gate.

## Isolation boundary

At the recorded checkpoint, the production harness served the five-course build on `127.0.0.1:4197`, while a candidate harness served the controlled six-course build on `127.0.0.1:4198`. Both tested built sites rather than Vite source modules. They:

- block service workers;
- fix the browser clock used by deterministic learner state;
- start from an explicit guest progress record and reset barrier;
- return an explicit guest response for the session endpoint;
- record and reject every other `/api/` request;
- record and abort every request to an external origin;
- record unexpected HTTP responses, request failures, page errors, and browser-console errors;
- require every test to finish with none of those unexpected failures.

The runner origin is an unreachable loopback HTTPS address. The suite does not exercise GitHub OAuth, progress synchronization, D1, Cloudflare Sandbox, or a deployed Worker.

## Recorded automated route and state matrix

The 15 five-course Chromium cases recorded at that checkpoint covered:

| Area | State or behavior checked |
| --- | --- |
| Course catalog | Exactly the five reviewed public courses appear |
| Practical Python | The outline names both prerequisites while locked |
| Foundation lesson | A canonical direct lesson URL opens |
| Practical Python lesson | Direct URL remains locked with neither prerequisite |
| Practical Python lesson | Direct URL opens after both prerequisites |
| Practical C++ course | Guessed private course URL returns not found |
| Practical C++ lesson | Guessed private lesson URL returns not found |
| Code editor | Tab exits to the hint without changing source or invoking the runner |
| Mobile | At 390 by 844 CSS pixels, navigation and language switching remain usable |
| Mobile | The document has no horizontal overflow |
| Practice | The safe first choice advances without calling the runner |
| Code Reference | Search works and a completed-module example unlocks |
| Accessibility | Courses passes the scoped WCAG A and AA check |
| Accessibility | A representative lesson passes the scoped WCAG A and AA check |
| Accessibility | Practice passes the scoped WCAG A and AA check |
| Accessibility | Code Reference passes the scoped WCAG A and AA check |

The two private-route checks are generated from one route matrix, so the Playwright reporter counts them as two cases. The four scoped axe checks belong to this production suite. No axe rule is disabled or excluded.

The 11 six-course candidate Chromium cases recorded at that checkpoint covered:

| Area | State or behavior checked |
| --- | --- |
| Course catalog | Exactly six cards appear and Practical C++ owns its canonical course link without loading teaching data |
| Prerequisites | The course and a direct lesson explain both missing requirements and remain locked |
| Same-page navigation | The course opens its first lesson in the same browser document with one cached teaching-data request |
| Lesson history | First, middle, and final lessons preserve canonical URLs, titles, focused headings, Back and Forward navigation, one browser document, and one cached teaching-data request |
| Language preference | Direct course and lesson history does not replace the saved language |
| Home and Learner Record | Compact records show the next course and six-course progress without loading teaching data |
| Portfolio | Candidate progress does not take ownership of the prerequisite project's portfolio route |
| Failure handling | A successful HTTP response containing malformed teaching data fails closed with a truthful, focused retry page and no partial outline |
| Practice | Authored Practical C++ questions join the C++ pool only after an eligible module is complete |
| Code Reference | All 11 exact module labels remain locked until their introducing modules are complete |
| Code Reference | All 11 reviewed C++ examples become available after the matching modules are complete |

## Recorded local results

The unpublished-candidate checkpoint passed:

- Vitest: 78 files, 808 tests;
- candidate Playwright: 11 of 11 cases;
- production Playwright: 15 of 15 cases;
- deterministic foundation and Practical C++ generation, complete candidate application and runner selection, and raw, gzip, category, and aggregate limits;
- TypeScript, ESLint, a 299-file repository text-style check, social-preview checks, production build, public-deployment boundary checks, server-owned browser-bundle checks, both local Wrangler dry runs with Docker disabled, and bundle budgets.

The bundle evidence recorded at that checkpoint was:

- production initial JavaScript: 332,089 bytes raw and 99,794 bytes gzip;
- production initial CSS: 53,329 bytes raw and 10,034 bytes gzip;
- production total JavaScript: 736,319 bytes raw and 214,421 bytes gzip;
- production total CSS: 83,132 bytes raw and 16,012 bytes gzip;
- production lazy packed foundation curriculum: 113,957 bytes raw and 28,661 bytes gzip;
- production emitted Practical C++ teaching data: 0 bytes;
- production aggregate transfer: 822,874 bytes raw and 231,491 bytes gzip;
- candidate initial JavaScript: 333,877 bytes raw and 100,008 bytes gzip;
- candidate total JavaScript: 747,504 bytes raw and 217,952 bytes gzip, leaving 48 gzip bytes under the unchanged cap;
- candidate total CSS: 83,132 bytes raw and 16,012 bytes gzip;
- candidate Practical C++ teaching JSON: 42,222 bytes raw and 14,300 bytes gzip;
- candidate aggregate transfer: 876,281 bytes raw and 249,320 bytes gzip;
- candidate Practical Python route shared by both continuing courses: 10,306 bytes raw and 3,617 bytes gzip;
- candidate Code Reference route: 34,269 bytes raw and 10,637 bytes gzip.

At that checkpoint, the five-course artifact contained no Practical C++ JSON, candidate title, or `with-cpp` module reference. A no-write inspection of its 121-module Vite graph found no candidate publication or packed-content module. The separate candidate artifact contained exactly one byte-identical teaching JSON asset behind one lazy owning loader, and none of the 20 reviewed private server markers appeared in either browser surface.

## Current publication gate

The current source selects the complete six-course application: 36 modules, 180 lessons, and 112 runner assignments. Practical C++ has exactly 12 runner-backed lessons and 18 teaching-only lessons. The teaching-only IDs must always return not found from the runner boundary.

Practical C++ browser coverage now runs against the ordinary production `dist` artifact. There is no second candidate-only Playwright server or candidate-only browser configuration. The merged route matrix covers the six-card catalog, both continuing-course prerequisite paths, canonical Practical C++ course and lesson routes, representative first, middle, and final lesson history, keyboard editor exit, 390-pixel navigation, Practice, Code Reference, malformed teaching data, and scoped accessibility checks.

## Exact current source and CI evidence

The reviewed publication-candidate commit is `3f7e709326cdeb9652d668ca5ee42fbbf2c48504`. At the time of this record:

- the checkout was clean on `main`;
- local `HEAD`, local `origin/main`, and the live remote `refs/heads/main` all matched that exact commit;
- the complete local release gate passed 83 Vitest files with 1,008 tests and 60 Playwright browser cases;
- deterministic Practical C++ generation produced one 42,222-byte lazy teaching asset;
- the publication boundary selected exactly 12 runner-backed Practical C++ assignments and kept the other 18 lessons teaching-only;
- the full six-course source, browser privacy scan, build, deployment contract, and bundle checks passed;
- hosted GitHub Actions `CI` push [run 33192113526](https://github.com/AES256Afro/SeePoundCoffeePie/actions/runs/33192113526) completed successfully for that exact commit.

These results finish the source and hosted CI prerequisites for M009. They do not prove that this commit or its reviewed C++ runner image is deployed to staging. The mode-0600 staging regression proof is still absent, the complete manual learner and accessibility walkthrough is still unrecorded, and `PHASE_5B_RELEASE.md` must not be created until the deployed evidence exists.

## What this does not prove

This automated gate does not prove:

- a complete manual keyboard walkthrough;
- screen-reader reading order and announcements;
- usability at 200 percent zoom;
- reduced-motion behavior under a real operating-system preference;
- Firefox, WebKit, Safari, Edge, or mobile-device behavior;
- runner image, analyzer, or Cloudflare Sandbox behavior;
- GitHub OAuth or private progress synchronization;
- staging or production routes, headers, assets, or data safety;
- beginner comprehension or teaching quality.

Those checks remain separate release gates. Local browser success must never be described as deployment evidence.

## Repeatable commands

Build and run the production browser gate:

```bash
npm run test:e2e
```

Run the already-built production browser gate:

```bash
npm run test:e2e:built
```

Run the Practical C++ content, application, and Worker publication checks. The command keeps its historical candidate name:

```bash
npm run check:cpp-content-candidate
```

Run the production-dist browser surface with every other local release check:

```bash
npm run check:release
```

On failure, Playwright writes its HTML report and test artifacts to ignored local directories. CI uploads those artifacts for a failed run. The hosted source gate above is tied to one exact reviewed commit. A later source change requires a new exact-commit CI record. Staging and production remain separate evidence even after hosted CI succeeds.
