# Phase 3 Accounts and Durable Learning Data Release

Release date: 2026-08-25

## Outcome

Phase 3 turns optional GitHub identity verification into an optional private synchronization account. A learner can still use every academy lesson as a guest. Signing in does not upload browser progress automatically when a choice could replace data. The learner first chooses whether to save the browser record, use an existing account record, or conservatively combine the two.

The browser remains an offline-safe working copy. A signed-in learner who enables synchronization receives automatic revisioned saves, cross-device loading, visible synchronization state, conflict choices, portable JSON backup and restore, and a control that permanently deletes the server-side learning record without deleting the browser copy.

## What the account stores

One D1 row represents one GitHub-authenticated learner. The row contains:

- a pseudonymous owner key derived from the GitHub account ID with a dedicated server secret;
- record schema version and optimistic-concurrency revision;
- callsign and selected language station;
- daily goal, XP, daily XP and its date;
- star shards, streak, and last study date;
- completed mission identifiers;
- per-concept memory strength, aggregate correct and incorrect counts, and the next review date;
- onboarding completion state;
- row creation and update timestamps.

The D1 row does not contain the raw GitHub account ID. The dedicated `LEARNER_DATA_SECRET` keeps the pseudonymous owner mapping stable when the unrelated session-signing secret is rotated. This data secret must not be rotated without a planned record-remapping migration. Losing or casually rotating it would make existing rows unreachable.

The synchronized record is a personal learning record, not an authoritative competitive score. The current product has no leaderboard, public profile, or reward marketplace. Client-originated XP and completion values must not later be reused for competitive or financial decisions without a separate server-authoritative event design.

## What the account does not store

The account synchronization path does not retain:

- submitted source code or standard input;
- raw exercise-attempt events or answer text;
- GitHub access tokens, email addresses, names, avatars, followers, repositories, or private GitHub scopes;
- passwords;
- raw IP addresses;
- browser history, device fingerprint, advertising identifier, or precise location;
- age, birthday, school, classroom, parent, or social-graph data.

GitHub login and display name remain in the signed, seven-day `HttpOnly` session cookie so the interface can identify the current session. The OAuth access token is revoked immediately after the GitHub identity response, as in Phase 2. The database keeps only the pseudonymous owner key and the validated learning record.

Runner retention remains separate. Editable source and standard input exist only while an isolated run is pending, and capped results expire after 15 minutes. They are never copied into the Phase 3 learner database.

## Guest migration and cross-device behavior

The first synchronized load uses these rules:

1. A guest keeps learning in browser storage without an account.
2. After sign-in, the browser checks for an account record.
3. If only the browser has meaningful progress, the learner may save it or decide later. No upload occurs before that choice.
4. If only the account has meaningful progress, the browser adopts that record.
5. If both records match, synchronization starts without another prompt.
6. If both records differ, the learner chooses the browser copy, the account copy, or a conservative combination. Nothing is overwritten before that choice.
7. Once enabled, browser changes are saved after a short delay. The last confirmed revision is sent with every write.
8. If another device writes first, D1 rejects the stale revision with HTTP 409 and returns the newer account record. Automatic writes pause while the learner chooses how to continue.

The conservative combination unions completed missions and keeps the highest XP, shards, streak, concept strength, and aggregate answer counts. It keeps the stronger concept review schedule rather than adding reward totals, which prevents ordinary two-device merging from double-awarding progress. The local callsign, active station, and daily goal remain the learner's immediate preferences.

When the network is unavailable or a save fails, the current browser record remains intact. The interface reports the local or offline state and retries after the browser returns online. Signing out disables synchronization but does not erase either copy.

## Backup, restore, reset, and deletion

The existing version 1 JSON backup remains the learner-controlled portability path. Both backup restore and server writes use the same strict validator. Unknown languages, missions, concepts, malformed dates, duplicate missions, unsafe counts, oversized payloads, and unsupported versions are rejected before persistence.

Restoring while synchronization is active requires confirmation. The validated restored record first replaces the browser copy, then becomes the next account revision. Resetting learning progress follows the same rule: it resets the browser copy, and if synchronization is active the empty learning record becomes the synchronized copy.

`DELETE /api/progress` requires all of the following:

- a valid signed-in session;
- an exact same-origin request;
- JSON confirmation containing `DELETE MY LEARNING DATA`.

Deletion permanently removes the D1 row and disables automatic synchronization in that browser. It deliberately keeps the browser copy so an accidental account-data deletion does not destroy the learner's only remaining record. The settings page says this before confirmation. A learner may separately reset the browser copy, sign out of SeePoundCoffeePie, or revoke the OAuth App in GitHub.

There is no separate SeePoundCoffeePie profile table in this phase. Therefore, deleting the synchronized learning row deletes all durable SeePoundCoffeePie account data. It does not delete or modify the learner's GitHub account.

## API and storage contract

All responses are JSON. `GET` is read-only. Mutating methods require the canonical same origin.

| Method | Path | Purpose | Important responses |
| --- | --- | --- | --- |
| `GET` | `/api/progress` | Read the current account record | `200` with a record or `null`, `401` when signed out |
| `PUT` | `/api/progress` | Create or replace one validated revision | `200` with the new revision, `409` with the newer record, `413` when oversized |
| `DELETE` | `/api/progress` | Delete the durable learning row | `200` with records removed, `400` for missing confirmation |

The request and stored record format are both version 1. D1 uses a single `learner_progress` table. Conditional updates and `INSERT OR IGNORE` enforce optimistic concurrency even when two devices race between reading and writing. The server returns the latest safe record on a conflict, including `null` when another device deleted the row.

Database migrations are explicit and separate from Worker deployment:

```bash
npm run d1:migrate:local
npm run d1:migrate:staging
npm run d1:migrate:production
```

Wrangler records applied migrations and takes a platform backup before a remote migration. Apply a compatible database migration before deploying Worker code that requires it.

## Privacy retention and child-safety requirements

The current alpha retains a synchronized learning row until the learner deletes it. Logout and session expiry do not delete the row because cross-device return is the feature being provided. The product does not use account data for advertising, data brokerage, public discovery, or model training.

The current academy is not designed to collect child identity or social data. Before adding classrooms, direct messages, public profiles, friend lists, shared code, age fields, parent accounts, teacher dashboards, or behavioral advertising, the product must complete a separate privacy and child-safety review. That review must define the intended age audience, consent and guardian flows where applicable, minimum necessary fields, retention periods, moderation and reporting, access and correction, export and deletion, staff access, incident handling, and jurisdiction-specific obligations. No social-data schema should be deployed before that review is approved.

Operational logs must not include progress JSON, callsigns, GitHub identifiers, cookies, source code, raw IP addresses, or OAuth tokens. Application errors return general learner-safe messages. D1 inspection and production access remain limited to authorized operators.

## Repeatable verification

Run the full application release gate:

```bash
npm run check:release
```

Validate the Worker bundle and bindings without publishing:

```bash
npm run deploy:dry-run
```

Apply the local migration, then verify the storage API and UI with the automated tests:

```bash
npm run d1:migrate:local
npm test
```

After staging and production deployment, verify the public application and unchanged isolated runner:

```bash
npm run check:runner:staging
npm run check:runner:production
npm run check:live
npm run check:runner:smoke
```

The automated coverage includes authenticated creation, reads, revisioned updates, deletion, authentication failure, same-origin enforcement, strict validation, conflict responses, cross-user isolation, guest migration choice, account-copy selection, automatic save, and deletion that preserves the browser copy.

## Recovery and rollback

If a new Worker cannot read or write records after release, keep the D1 database in place and roll the Worker back to the last compatible version. Do not delete or recreate the database as a rollback step. Use a D1 backup or a reviewed forward migration if the schema itself is damaged.

Do not rotate `LEARNER_DATA_SECRET` during routine session-secret rotation. If that secret must change, first design and test a migration that can map every existing pseudonymous owner key to its replacement. Without that mapping, the safe response is to leave the data secret unchanged and rotate only `SESSION_SECRET`.

The real runner still has its independent KV kill switch. Pause it during a production Worker deployment and re-enable it only after the four-language production check passes. Account synchronization and the static academy remain available while execution is paused.

## Release evidence

### Local and publication gate

- `npm run check:release`: 17 test files and 175 tests passed; lint, social-preview verification, TypeScript, production build, and bundle budgets passed.
- `npm run deploy:dry-run`: the Worker, assets, D1, KV, Durable Objects, and all four container bindings validated before publication.
- `npm run d1:migrate:local`: migration `0001_learner_progress.sql` applied successfully.
- Published source commit: `e8f37357f5828d8d360749031dd70cf82739fa18` on `main`.
- GitHub Actions CI run `32859579411` passed for the published commit.

### Isolated staging gate

- Staging D1 database `see-pound-coffee-pie-learners-staging` applied migration `0001_learner_progress.sql`; a direct query returned zero learner records before testing.
- A separate staging `LEARNER_DATA_SECRET` was installed without exposing its value.
- Staging Worker version: `9f055860-49c8-4e4d-8eae-a7fe47c9757f`.
- A signed-out live `GET /api/progress` returned HTTP 401, proving the deployed route, D1 binding, and fail-closed authentication boundary were active without creating a row.
- `npm run check:runner:staging` passed Python, C++, C#, Java, network denial, CPU, memory, allocated storage, output caps, cross-run filesystem and secret isolation, sanitized diagnostics, per-learner pending saturation, and cross-user authorization.
- The staging runner switch was returned to `enabled=false` after the regression gate.

### Production gate

- Production D1 database `see-pound-coffee-pie-learners` applied migration `0001_learner_progress.sql`; a direct query returned zero learner records before the first learner choice.
- Production secrets list contained `GITHUB_CLIENT_SECRET`, `SESSION_SECRET`, and the new dedicated `LEARNER_DATA_SECRET`; no secret value was read or recorded.
- The production runner was paused before Worker deployment and its public status returned `enabled=false` during the rollout.
- Production Worker version: `aee06b92-4623-45bc-8470-7469977c2bc8`.
- The production signed-out account endpoint returned HTTP 401 instead of an exception. The normal session endpoint remained healthy.
- `npm run check:live` passed the apex domain, `www` redirect, security headers, social preview, and all bookmarkable SPA routes.
- The runner was re-enabled after site and account checks. `npm run check:runner:production` then passed the complete four-language and isolation regression gate, and `npm run check:runner:smoke` passed a separate production run in 24 ms.
- A real production Chrome session loaded `/settings` while signed in as the existing learner. It showed the first-sync permission dialog over the learner's intact 34 XP browser record, offered both `Save progress to account` and `Decide later`, rendered the storage and deletion explanations, and produced no browser console errors.
- The browser save was deliberately not selected as part of automated release work because it would transmit the learner's personal progress into the production account. That final learner choice remains explicit by product design.

The deployed application bundle comes from source commit `e8f37357f5828d8d360749031dd70cf82739fa18`. A later documentation-only evidence commit does not change that Worker bundle.
