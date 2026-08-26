# Phase 5B Compatibility Release

Release date: 2026-08-26

Status: released compatibility floor. `Practical C++: Collections and Records` remains unpublished.

## Release identity

| Item | Recorded value |
| --- | --- |
| Source commit | `46175bfaf1f5c2005bdbbb3a183c58aa6551aebd` |
| Successful CI run | [GitHub Actions run 33018242185](https://github.com/AES256Afro/SeePoundCoffeePie/actions/runs/33018242185) |
| Staging Worker version | `13a2ec40-137d-4b46-959a-0d51200cce78` |
| Staging origin | `https://see-pound-coffee-pie-phase2-staging.chris-c39.workers.dev` |
| Production Worker version | `571495f3-3997-45f8-b1e2-d34a97f526dc` |
| Production origin | `https://seepoundcoffeepie.com` |

## What this release establishes

- The continuing-course route, ownership, resume, and Practice plumbing is driven by course data. Practical Python remains the only published continuing course.
- A compact Phase 5B manifest reserves 6 module IDs, 30 lesson IDs, concept links, and XP values without shipping the unpublished teaching draft to a browser.
- Local progress uses V3 keys while independently recovering healthy V2 or legacy records. Additions from an already-open older tab are reconciled instead of discarded.
- Completion journals reconcile independently, and an explicit reset barrier prevents stale older-tab progress from undoing a learner-requested reset.
- Worker progress validation, remote sync, and backup handling recognize the reserved identifiers without changing the record, backup, sync, or D1 schema version from version 1.
- Modules 1 through 4 are fully authored in hidden source: 20 lessons, 280 possible first-completion XP, and 8 editable C++ exercises.
- The compatibility-only Modules 5 and 6 identifiers are reserved, but their teaching content is not authored or publishable yet.
- Course pages now focus their final lazy-loaded heading, which preserves understandable keyboard and screen-reader navigation after a direct route change.

## Publication boundary

The future C++ course is not available to learners in this release.

- It has no `CourseId` entry in the public registry.
- It has no catalog card, course route, lesson route, Practice item, Codebook example, sitemap entry, or runner assignment.
- The production bundle check forbids the course ID and unique teaching sentences from emitted browser assets.
- Direct course and lesson URLs render the normal not-found page.
- The enabled production runner rejected all 30 reserved exercise IDs with `404`.

This boundary lets progress compatibility reach every current client before any learner can earn or sync the new identifiers.

## Verification evidence

### Automated release checks

- `npm run check:release` passed in CI: 51 test files and 592 tests, lint, text style, social-preview verification, TypeScript, production build, project-bundle privacy checks, and bundle budgets.
- All 8 authored editable C++ solutions passed C++20 syntax checks. Their public checks accepted the taught repair and rejected the supplied incorrect source.
- Production `npm run check:live` passed Phase 5A assets, sitemap, robots, social previews, apex and `www` behavior, security headers, 30 canonical routes, and 2 legacy routes.
- A published production C++ exercise completed successfully in the live runner.
- The Practical Python Supply Tracker production suite rejected hardcoded output, comment decoys, unreachable required code, encoding disagreement, and behavior aliases. Its correct solution passed all 7 checks.
- All 30 reserved Phase 5B exercise identifiers returned `404` from the live production grant endpoint.
- A signed-out production progress request returned `401`, preserving the account boundary.

### Browser checks

Staging and production were checked at 1280 pixels and at a 390 by 844 mobile viewport.

- `/` rendered the public launch page and focused its main heading.
- `/courses` rendered the catalog, included Practical Python, and omitted the future C++ course.
- `/courses/python-data-tools` rendered all 6 modules, fit the viewport, and focused the final lazy-loaded `Practical Python: Data Tools` heading.
- `/courses/cpp-collections-records` rendered the normal not-found page.
- `/learn/cpp-collections-records/cpp-records-return-values/cpprecords1-retrieve-call` rendered the normal not-found page.
- No checked page exposed the hidden course ID, Workshop Stock Report teaching marker, or hidden lesson marker.
- No checked desktop or mobile page produced horizontal overflow.

### Deployment checks

- Production and staging dry runs passed before deployment.
- No D1 migration was required or applied.
- The four existing runner container definitions were unchanged.
- Staging remained paused for live execution during browser verification.
- Production execution was enabled through its runtime control setting. The fallback `RUNNER_ENABLED` value remained `false`, so the runtime control remains the deliberate source of the production state.

## Bundle record

| Surface | Raw | Gzip |
| --- | ---: | ---: |
| Initial JavaScript | 475.35 kB | 128.83 kB |
| Initial CSS | 72.37 kB | 13.46 kB |
| Total JavaScript | 764.00 kB | 214.28 kB |
| Total CSS | 85.22 kB | 16.45 kB |
| Practical Python route JavaScript | 10.62 kB | 3.69 kB |
| Practical Python teaching content | 46.41 kB | 12.76 kB |
| Practical Python route CSS | 9.23 kB | 1.88 kB |
| Codebook route JavaScript | 28.35 kB | 9.07 kB |

The total JavaScript and initial CSS budgets have little remaining room. New published continuing courses need per-course lazy content loading and recovered bundle headroom before publication.

## Rollback rule

Do not deploy a client or Worker older than source commit `46175bfaf1f5c2005bdbbb3a183c58aa6551aebd` after Phase 5B identifiers may have entered learner progress, backups, or remote sync.

If a later Phase 5B presentation or assessment change must be withdrawn, use a forward fix that keeps the compact identifier manifest and progress compatibility. It is safe to remove or disable a public catalog card, route, or runner assignment while preserving those identifiers. It is not safe to remove the compatibility floor and silently discard already-synced progress.

## Work remaining before publication

1. Author and validate the complete teaching content for Modules 5 and 6.
2. Add per-course lazy content loaders so the public entry bundle does not import every continuing course.
3. Recover bundle headroom before adding another public route and teaching chunk.
4. Generalize Python-specific Home and Profile course counts, next-step copy, prerequisite copy, and module-count assumptions.
5. Build a server-owned C++ course analyzer and adversarial assessment suite without exposing protected checks to the browser.
6. Complete manual keyboard, assistive-technology, responsive, and multi-browser checks for every hidden lesson before publication.
7. Add the catalog card, routes, Practice items, Codebook examples, sitemap entries, and runner assignments only after every publication blocker passes.
