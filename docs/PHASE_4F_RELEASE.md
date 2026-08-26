# Phase 4F Durable Lesson Progress and Portfolio Release

Release date: 2026-08-26

## Outcome

Phase 4F records progress at the level a learner actually sees. A completed lesson stays complete, a partially completed module resumes at its first unfinished lesson, and a completed project says `Review project` instead of implying that more completion work remains.

The release also adds a deliberate portfolio handoff for each guided project. A learner can review the exact final source currently saved in one browser and download a self-contained HTML snapshot. The route does not publish source, and the downloaded file is explicitly not a certificate, identity claim, or proof of authorship.

## Durable lesson completion

The version 1 learner record now includes:

```text
completedLessons: string[]
```

Each value is an existing authored exercise identifier. Those identifiers were already globally unique and were already used by routes, curriculum lookup, and protected runner assignments. Phase 4F treats them as a durable storage contract and verifies that every lesson belongs to exactly one track and one module.

Normal first-time lesson success records the lesson identifier and awards the lesson's authored XP once. Opening a credited lesson again can strengthen the aggregate concept record, but it awards zero replay XP. Adaptive Practice and completed-module replay remain zero-reward flows.

Course pages now show:

- `Complete` for credited lessons;
- `Next lesson` for the first unfinished lesson in the active module;
- `Start lesson` for later available lessons;
- completed lesson counts as the primary course and module measurement;
- percentage only as a secondary summary.

## Module closure recovery

Lesson credit and module completion are separate facts. The module completion record still controls prerequisite unlocking, Practice eligibility, and the one-time shard reward.

If all five lesson identifiers are present but the module identifier is missing, the expanded module shows `Every lesson is complete` and an explicit `Finish module` action. That action closes the module and awards its shard reward once. Refreshing, reopening, or selecting the action again cannot duplicate the reward.

This recovery state handles a learner who exits after the final lesson succeeds but before the module closing action is recorded. It does not silently treat partial lesson progress as a completed module, and it does not unlock Practice early.

## Version 1 compatibility and rolling upgrades

Phase 4F keeps learner record version 1, backup version 1, and the current D1 table. No D1 migration or secret change is required.

An older browser, backup, or D1 record can omit `completedLessons`. The strict parser accepts that omission and infers every lesson inside an already completed module. Reading an old D1 row does not rewrite it. The inferred field is stored on the next normal save.

Old records cannot reconstruct a partial module because that information was not stored before Phase 4F. They still preserve every completed module exactly. New partial progress becomes durable after the first Phase 4F lesson success.

A browser tab still running the pre-Phase 4F client can save record version 1 without knowing the new field. When that payload updates an existing D1 row, the Worker preserves the server's current lesson identifiers and unions them with any lesson closure inferred from the incoming mission record. Current clients always send `completedLessons`, including an explicit empty array when progress is intentionally cleared. This prevents a rolling client upgrade from erasing partial lesson progress.

The browser also keeps the allowlisted lesson identifiers in a small separate local completion journal. A pre-Phase 4F tab can still overwrite the older main browser record, but it does not know this journal key. The current client unions the journal into the normalized record on load. A current reset writes an explicit empty journal, so intentional clearing still works. The journal stores only authored lesson identifiers and never stores source, answers, console output, account identity, or authentication data.

Unknown and duplicate lesson identifiers fail strict backup, synchronization, and Worker validation. Tolerant browser recovery filters them. Synchronization unions known partial lesson identifiers across devices, closes lessons implied by completed modules, and compares equivalent sets in canonical order.

## Honest project progress

Project pages now distinguish three different ideas:

1. `Checkpoint N of 12` is the learner's current position.
2. `N of 12 complete` is durable completion.
3. Percentage is a secondary visual summary derived from durable completion.

The checkpoint navigator is an ordered list inside a named navigation region. Each item exposes complete, current, not complete, or locked state in text. A completed project uses `Review project`; an unfinished project uses `Start project` or `Continue project`.

The change does not alter checkpoint identifiers, assessment behavior, draft keys, XP, project rewards, or runner isolation.

## Browser-local portfolio preview

Each matching project has one allowlisted route:

```text
/portfolio/python/first-interactive-program
/portfolio/cpp/first-compiled-program
/portfolio/csharp/workshop-check-in
/portfolio/java/picnic-planner
```

An unknown project, a cross-language project pairing, an extra path segment, or a query string does not open a portfolio page.

The preview becomes available only when:

- the project identifier is recorded as complete;
- all 12 known checkpoint identifiers are complete;
- the final checkpoint source exists in this browser;
- the source and project summary pass the export validator.

Project source remains in browser-local draft storage and never enters D1, progress backup JSON, account synchronization, or the route. Sharing or bookmarking a portfolio URL shares only the route. Another browser does not receive the source.

The page can still perform the application's normal private session check. The export action itself performs no network request, storage write, or automatic download.

## Export security and privacy boundary

The exporter accepts a narrow value object containing:

- displayed callsign;
- public language and project labels;
- public project summary text;
- final source filename;
- exact final source from the current browser.

It does not receive the authentication user, GitHub login, account email, token, IP address, XP, streak, review schedule, console output, check history, practice input, or the full learner record. The app does not add those values to the file. A callsign or source can still contain personal information or a credential, so the learner is told to review both before download.

The learner must select a confirmation tied to the exact current project, callsign, filename, and source. If synchronized data changes the reviewed callsign, or the source changes, the confirmation no longer enables download.

The generated document:

- escapes every dynamic value as text;
- contains no script, link, image, frame, form, object, embed, base element, event handler, or remote resource;
- uses a restrictive Content Security Policy and `no-referrer` policy;
- uses only fixed system-font CSS with no URL or import;
- derives a bounded ASCII filename from an allowlisted project slug;
- rejects blank source, null bytes, invisible bidirectional controls, source over 20,000 UTF-8 bytes, and total HTML over 256 KiB;
- states that source may have changed after the last project check;
- states that the file is not a certificate and does not verify identity, authorship, originality, or current correctness.

Legitimate Unicode text remains supported. Invisible directional formatting and isolation controls are rejected because they can make displayed source appear in a different order than the compiler or interpreter reads it.

## Accessibility and responsive behavior

The portfolio heading receives focus after route navigation. Incomplete, missing-source, invalid-source, and ready states have explicit headings and next actions. The source has a visible label, the consent control is a native checkbox, the download is a native button, and status text uses a polite live region.

Desktop uses an open summary and source layout. At 920 CSS pixels it becomes one column, and at 700 CSS pixels the project identity moves below the heading. The route's JavaScript and CSS load only when a portfolio page opens.

## Performance boundary

The first-load JavaScript budget remains 485 kB raw and 132 kB gzip. Portfolio JavaScript and CSS are emitted as separate lazy assets with dedicated caps:

```text
portfolio JavaScript: 15 kB raw, 6 kB gzip
portfolio CSS: 4.5 kB raw, 1.5 kB gzip
```

The shared CSS budget increases only for visible lesson state, module recovery, and project progress semantics that appear outside the portfolio route.

## Verification contract

The local release gate must pass:

```bash
npm run check:release
npm run deploy:dry-run
```

Automated coverage includes:

- first lesson completion followed by exit, reload, and resume at the next lesson;
- credited lesson replay with zero XP and continued concept strengthening;
- five credited lessons followed by explicit module closure and one-time shards;
- old local, backup, remote, and D1 version 1 records that omit the lesson field;
- a pre-Phase 4F save that cannot erase partial lesson progress already in D1;
- a pre-Phase 4F browser-tab write that cannot erase partial lesson progress in the separate local journal;
- unknown and duplicate lesson rejection;
- cross-device partial lesson union and canonical equality;
- Practice remaining locked until module completion;
- global lesson and mission identifier ownership;
- separate project position, completion, percentage, and checkpoint states;
- all four completed project handoffs;
- strict portfolio routes and malformed route rejection;
- incomplete, missing-source, invalid-source, and ready portfolio states;
- consent reset when reviewed content changes;
- hostile HTML, metadata, source, path, Unicode, control, byte-limit, and active-element cases;
- no network or storage writes during export generation and download.

Production verification must cover the four portfolio routes, direct refresh, route titles, lazy assets, desktop and mobile layout, focus, consent, a downloaded offline file, application console, and horizontal overflow.

## Deployment and recovery

Phase 4F changes client and Worker application code only. It does not change a runner assignment, supervisor, compiler, runtime image, D1 table, binding, or secret.

Deploy the Worker normally after the release gate and dry run pass. No D1 migration command is needed. The full runner regression still runs because lesson replay and project review continue to use existing assignments.

Rollback restores the prior compatible Worker version. Do not delete the D1 database, rotate `LEARNER_DATA_SECRET`, or remove lesson identifiers from records. A previous client ignores the added JSON field, and the Phase 4F Worker protects it from older version 1 writes during a rolling upgrade.

## Verified release evidence

### Source and continuous integration

- Runtime source commit: `11ecb36021fae2e3903e7e0802d5cf14e5f7bd02`
- GitHub `origin/main` matched that exact commit before deployment.
- GitHub Actions run [32970508057](https://github.com/AES256Afro/SeePoundCoffeePie/actions/runs/32970508057) passed against that commit.
- The independent security, learner-data, and learner-experience reviews reported no remaining P0, P1, or P2 findings.

### Exact local release gate

`npm run check:release` passed on the runtime source commit with 42 test files and 476 tests. The gate also passed lint, social-preview validation, the production build, the project lazy-load boundary, and every bundle cap.

Measured release bundles were:

```text
initial JavaScript: 478.65 kB raw, 131.12 kB gzip
initial CSS: 71.25 kB raw, 13.20 kB gzip
total JavaScript: 681.28 kB raw, 190.68 kB gzip
total CSS: 74.87 kB raw, 14.31 kB gzip
portfolio JavaScript: 14.10 kB raw, 5.16 kB gzip
portfolio CSS: 3.62 kB raw, 1.11 kB gzip
```

`npm run deploy:dry-run` passed with the expected Worker bindings and all four container images. `npm run check:runner:image` passed Python, C++, C#, Java, CPU, output, memory, disk, network, and cleanup checks against the local runner images.

### Staging

- Staging Worker version: `289d6296-43c4-42b2-8c12-867e2fe7ef4b`
- The four-language runner and isolation suite passed.
- The protected Python, C++, C#, and Java project suites passed.
- Direct Java course refresh retained Java course context, navigation, module expansion, focus, responsive width, and a clean browser console.
- The staging runner returned to `enabled: false` after verification and was confirmed through the public status endpoint.

### Production

- Production Worker version: `ed2a16f5-55cf-4b7f-90b4-c846cebce461`
- Lesson execution was set to `enabled: false` before deployment while the public site continued returning HTTP 200.
- The live verifier passed social previews, the apex domain, the `www` redirect, security headers, 28 canonical routes, and 2 legacy routes.
- All four portfolio routes returned HTTP 200.
- The four-language production runner suite passed Python, C++, C#, and Java execution plus network, CPU, isolation, output, memory, disk, diagnostics, saturation, and authorization controls.
- The protected Python project passed all 10 checks, C++ passed all 12 checks, C# passed all 12 public-safe checks, and Java passed all 13 public-safe checks.
- The final production runner smoke test passed. Execution was restored only after every suite succeeded. Cloudflare KV and the public status endpoint then both reported `enabled: true` with all four languages.

Production browser verification covered the Java course and portfolio routes at 1280 and 390 CSS pixels. The Java course retained the Java selector, Java Practice and Codebook links, expanded first module, route-specific title, heading focus, and zero document overflow. The incomplete portfolio state stayed private and prevented export. A query attempting to add a callsign failed closed as a not-found route. Portfolio CSS loaded only on the portfolio route, and the browser console remained free of errors and warnings.

The ready-state portfolio flow was also exercised against an isolated local production build. The consent gate produced the 4,112-byte `seepoundcoffeepie-first-interactive-program-portfolio.html` test artifact with SHA-256 `4e4d4b4a2171281f8502bbb4f9348d709265d4da556e879a30632200f0f1d531`. Static verification confirmed that the exact reviewed callsign and source were present, the disclosure and Content Security Policy were present, and no scripts, event handlers, external links, frames, forms, or remote resources were present. The in-app browser blocks navigation to `file:` URLs, so offline rendering in that browser surface was not claimed; the downloaded file itself was generated and inspected as a standalone artifact.

No D1 migration, binding change, runner image change, or secret change was required for this release.
