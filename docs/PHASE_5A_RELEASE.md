# Phase 5A Practical Python Data Tools Release

Release date: pending controlled rollout

Release status: pre-release. The compatibility floor is deployed, but the final Phase 5A content release and production learner QA are not yet verified. Replace the three marked content-release placeholders only with deployment evidence from the final published commit.

## Outcome

Phase 5A adds `Practical Python: Data Tools`, the academy's first complete continuing course and its second complete Python course. It gives a beginner who has finished the first Python path a practical next step without jumping to packages, files, web APIs, databases, or object-oriented design.

The learner outcome is concrete: build and explain a small Supply Tracker that cleans inconsistent item names, combines quantities, totals all units, and identifies items that need restocking.

The course contains:

- 6 ordered modules;
- 30 authored lessons;
- 10 prediction exercises, 6 explanation choices, 2 ordering exercises, 6 bug repairs, and 6 guided code exercises;
- 12 runner-backed editable exercises;
- 420 possible first-completion XP, with 70 XP in each module;
- one final guided capstone using fixed in-memory data.

Normal replay, memory repair, and adaptive Practice remain zero-reward flows. Completing the same lesson or module again cannot award the course XP or module shards twice.

## Course sequence and durable identifiers

The persisted module and lesson identifiers are part of the learner-record compatibility contract. They must not be renamed after release.

| Module | Durable module ID | Learner capability | XP |
| --- | --- | --- | ---: |
| 1. Functions That Return Answers | `py-data-return-values` | Retrieve parameters and calls, then return and reuse calculated answers. | 70 |
| 2. Cleaning and Normalizing Text | `py-data-text-cleanup` | Use string methods to trim and standardize inconsistent labels. | 70 |
| 3. Lists That Grow and Change | `py-data-list-tools` | Append values, count items, and prevent duplicates with membership tests. | 70 |
| 4. Dictionaries and Named Data | `py-data-dictionaries` | Store, find, default, and update quantities under meaningful keys. | 70 |
| 5. Totals and Filters | `py-data-summaries` | Accumulate totals and collect only entries that match a condition. | 70 |
| 6. Supply Tracker | `py-data-supply-tracker` | Plan, debug, assemble, and check one complete data tool. | 70 |

The 30 durable lesson identifiers are:

- `py-data-return-values`: `pydata1-retrieve-call`, `pydata1-return-purpose`, `pydata1-predict-result`, `pydata1-fix-return`, `pydata1-subtotal`;
- `py-data-text-cleanup`: `pydata2-retrieve-format`, `pydata2-strip-purpose`, `pydata2-predict-cleanup`, `pydata2-fix-method-call`, `pydata2-normalize-name`;
- `py-data-list-tools`: `pydata3-retrieve-loop`, `pydata3-append-purpose`, `pydata3-predict-length`, `pydata3-fix-membership`, `pydata3-add-unique`;
- `py-data-dictionaries`: `pydata4-retrieve-list-change`, `pydata4-dictionary-purpose`, `pydata4-predict-lookup`, `pydata4-fix-missing-key`, `pydata4-add-stock`;
- `py-data-summaries`: `pydata5-retrieve-update`, `pydata5-accumulator-purpose`, `pydata5-order-total`, `pydata5-fix-total-reset`, `pydata5-low-stock`;
- `py-data-supply-tracker`: `pydata6-trace-stock-update`, `pydata6-plan-tracker`, `pydata6-order-tracker`, `pydata6-fix-normalized-key`, `pydata6-supply-tracker`.

Modules 1 through 4 use the sequence prediction, choice, prediction, bug repair, and guided code. Modules 5 and 6 use prediction, choice, ordering, bug repair, and guided code. Every module begins by retrieving a concept used earlier. Later modules also retrieve returned values, formatting, loops, list changes, and dictionary updates before depending on them.

The intentionally deferred concepts are file input and output, CSV or JSON parsing, package installation, third-party libraries, APIs, databases, exceptions, classes, comprehensions, lambdas, generators, decorators, and type hints. The Supply Tracker is useful because it combines familiar pieces into a reliable report, not because it adds another layer of setup.

## Conjunctive prerequisite boundary

The `python-data-tools` course is available only when both of these facts are true:

1. every module in `python-foundations` is complete;
2. the `first-interactive-program` project is complete at `/projects/python/first-interactive-program`.

Completing only one prerequisite must leave the course locked. The catalog card and locked course page may show the course outcome, six module titles, and both missing prerequisites, but they must not open a lesson or award progress. A direct Practical Python lesson URL must enforce the same two requirements. The first module unlocks only after both prerequisites are complete, and each later module still requires the previous Practical Python module.

This boundary is deliberate. Python Foundations introduces the syntax spine. `Your First Interactive Program` proves that the learner can assemble and check a small multi-line program. Practical Python can then consolidate those skills into reusable functions and changing collections without pretending either earlier experience is optional.

## Course identity and runtime language

`CourseId` and `LanguageId` solve different problems:

- `python-data-tools` is the `CourseId`. It owns the catalog entry, prerequisite rules, course route, module IDs, lesson IDs, progress presentation, and completion state.
- `python` is the runtime language. It owns the runner toolchain, language-wide Practice set, Codebook example language, and existing Python learning preference.

The foundation course remains `python-foundations`, also with runtime language `python`. Code must not use a course ID as a runner language or create a second Python language track to represent continuing curriculum. The canonical course route is `/courses/python-data-tools`, and its lesson routes use `/learn/python-data-tools/:module-id/:lesson-id`.

The compact course registry and Phase 5A manifest contain titles, ownership, prerequisites, lesson IDs, concept IDs, and XP needed by shared application and progress code. They intentionally omit the complete teaching copy so the initial browser bundle does not acquire all 30 lessons.

## Language-wide Practice and explicit Codebook unlocks

Python Practice is course-aware and language-wide. When a Python Practice page or session opens, it lazily combines the Python Foundations missions with the Practical Python missions, then applies the existing eligibility rules:

- only completed modules are eligible;
- at most five unique authored exercises appear in one set;
- at most two exercises come from one module;
- due concepts come first, weaker future concepts follow, and a familiar item can fill an optional refresh slot;
- unfinished Practical Python modules, project checkpoints, other languages, unknown IDs, and duplicate concepts remain excluded;
- Practice updates concept strength and review timing but awards no XP, shards, lesson completion, or module completion.

The Codebook adds 11 beginner definitions with Python examples. Their examples unlock by exact introducing mission ID, not by a numeric module position that could refer to Python Foundations:

| Introducing mission | Codebook examples unlocked |
| --- | --- |
| `py-data-return-values` | Return value |
| `py-data-text-cleanup` | String method; Text normalization |
| `py-data-list-tools` | List mutation; Length; Membership test |
| `py-data-dictionaries` | Dictionary; Key and value; Default value |
| `py-data-summaries` | Accumulator; Filter |

Definitions remain searchable before their examples unlock. Completing a foundation module with the same ordinal position must not unlock one of these Practical Python examples.

## Local V2 compatibility floor

Phase 5A adds globally unique mission, lesson, and concept identifiers to the existing progress object. The synchronized learner record, backup format, runner request, and D1 table remain version 1. No D1 migration, binding change, or secret rotation is required.

Browser persistence advances to these authoritative V2 local keys:

```text
see-pound-coffee-pie-progress-v2
see-pound-coffee-pie-completed-lessons-v2
```

The current client reads the V2 keys first and falls back to the earlier `see-pound-coffee-pie-progress` and `see-pound-coffee-pie-completed-lessons-v1` keys when a V2 record does not exist. During the rolling compatibility window, it writes the validated record and lesson journal to both generations. An already-open older tab can still change a legacy key, but it cannot overwrite the authoritative V2 record. Reset deliberately writes an empty validated record to both generations.

The compact Phase 5A manifest is included in tolerant local recovery, strict backup and Worker parsing, module-to-lesson closure, cross-device merge, and canonical comparison. Unknown or duplicate IDs still fail strict backup, synchronization, and Worker validation. Tolerant local recovery filters unknown values rather than discarding all known progress.

### Minimum compatible source and Worker versions

The compatibility floor was published before the teaching content rollout:

- compatibility source commit: `077e0ff`;
- minimum compatible staging Worker version: `3bff5e2d-48a2-494b-9dce-894375da9a8b`;
- minimum compatible production Worker version: `b1efbd9d-521d-47e4-b6d2-022f705d267f`.

These versions understand and preserve the Phase 5A progress identifiers. They are rollback floors, not evidence that the course content or protected Supply Tracker runner is released. Once a learner can save Phase 5A progress, staging must not roll back below the stated staging version and production must not roll back below the stated production version. A pre-floor Worker can reject or omit the new identifiers during strict validation and synchronization.

If the final course or runner release needs rollback, keep the Worker at its environment's compatibility floor or a newer compatible version. The course UI or runner can remain unavailable while progress stays intact. Do not restore a pre-floor Worker, delete the D1 database, edit saved records, rotate `LEARNER_DATA_SECRET`, or remove the V2 browser keys as a rollback step.

## Runner and Supply Tracker assessment boundary

The runner registry contains exactly 100 editable assignments after Phase 5A:

```text
48 foundation lesson assignments
12 Practical Python lesson assignments
40 guided-project checkpoint assignments
100 total assignments
```

The 12 Practical Python assignments are the six bug repairs and six guided code exercises. Choice, prediction, and ordering lessons remain deterministic browser interactions because they do not execute source.

The final assignment is `pydata6-supply-tracker`. The learner fills five stated expressions inside four supplied functions and a fixed report harness. It takes no standard input and uses only the in-memory deliveries shown in the lesson. Its exact visible output is:

```text
Products: 2
Total units: 17
Restock: markers
```

The public lesson checks the five expressions the learner was explicitly asked to supply:

1. `clean_name = normalize_name(name)`;
2. `current = inventory.get(clean_name, 0)`;
3. `inventory[clean_name] = current + amount`;
4. `total += amount`;
5. `names.append(name)`.

Exact output and public expression checks are necessary but are not sufficient for capstone completion. The Worker attaches the server-owned `python-data-tools-supply-tracker-v1` assessment profile. Before learner execution, the coordinator runs the fixed, read-only `PythonDataToolsAnalyzer.py` against the unchanged source bytes. The analyzer parses bounded UTF-8 Python source without executing it and returns only a bounded internal fact envelope.

Protected grading verifies:

- the exact four-function authored frame and taught statement order;
- `normalize_name` directly returns `name.strip().lower()`;
- `add_stock` normalizes the name, uses `get(clean_name, 0)`, updates the normalized key, and returns its updated quantity;
- `total_stock` initializes one accumulator, visits `inventory.values()`, adds each amount, and returns after the loop;
- `low_stock` appends each below-limit name and returns the completed list;
- the supplied inventory, three stock updates, report prints, and low-stock loop remain unchanged and reachable.

Comments, unreachable statements, aliases, added functions, moved harness statements, duplicate decoys, unsupported control flow, malformed source, and alternate structures outside the taught capstone frame cannot earn structural credit. The assessment profile, trusted facts, internal diagnostics, and analyzer command never enter the public browser bundle or runner result. A malformed, missing, timed-out, oversized, or unexpected analyzer envelope fails closed as infrastructure error rather than blaming the learner.

Because the lesson intentionally has fixed in-memory data and no `stdin`, it has one visible behavior case rather than varying hidden input cases. The protected AST contract supplies the independent structural evidence. This boundary is suitable for the tightly scaffolded lesson but should not be generalized to a future open-ended project without server-owned varying input or a broader reviewed assessment design.

The analyzer is installed with root-only mode 0500 only in the pinned Python runner image. The full image gate must verify its adversarial suite, authentic trusted invocation, learner read and execute denial, file mode, image placement, network denial, resource limits, and cleanup while preserving the established Python project analyzer and all C++, C#, and Java regressions.

## Lazy loading and bundle budgets

Phase 5A keeps four distinct on-demand boundaries:

1. `PythonDataToolsRoute` contains the course and lesson route shells.
2. `python-data-tools-course` contains the complete 30-lesson teaching copy.
3. `PythonDataToolsRoute` CSS contains course-only outline, prerequisite, module, lesson, and responsive rules.
4. `CodebookRoute` contains the searchable Codebook and its 11 new Practical Python entries.

The initial application retains only the compact course and progress manifests plus shared catalog, home, and profile states. Python Practice loads the full Practical Python course only when it needs to build a language-wide Python set. The course-specific CSS is imported from the lazy route rather than the initial stylesheet.

The initial budgets remain unchanged from Phase 4F. The approved Phase 5A limits are:

| Asset scope | Raw limit | Gzip limit |
| --- | ---: | ---: |
| Initial JavaScript | 485.00 kB | 132.00 kB |
| Initial CSS | 72.50 kB | 13.50 kB |
| Practical Python route JavaScript | 11.00 kB | 4.00 kB |
| Practical Python teaching content | 50.00 kB | 14.00 kB |
| Practical Python route CSS | 10.00 kB | 2.20 kB |
| Codebook route JavaScript | 30.00 kB | 10.00 kB |
| Total JavaScript | 765.00 kB | 218.00 kB |
| Total CSS | 87.00 kB | 17.50 kB |

A pre-release local `npm run check:bundle` snapshot passed with:

| Asset scope | Raw measurement | Gzip measurement |
| --- | ---: | ---: |
| Initial JavaScript | 470.49 kB | 127.80 kB |
| Initial CSS | 72.37 kB | 13.46 kB |
| Practical Python route JavaScript | 9.65 kB | 3.38 kB |
| Practical Python teaching content | 46.41 kB | 12.76 kB |
| Practical Python route CSS | 9.23 kB | 1.88 kB |
| Codebook route JavaScript | 28.36 kB | 9.08 kB |
| Total JavaScript | 758.19 kB | 212.98 kB |
| Total CSS | 85.22 kB | 16.45 kB |

This snapshot is local integration evidence, not production release evidence. The final content commit must rebuild from a clean dependency install and pass every cap again. Initial CSS has little remaining headroom, so unrelated shared styling must not be added during release cleanup without a reviewed budget decision or another correct lazy split.

## Automated verification contract

Before either deployment, the final content commit must pass:

```bash
npm run check:release
npm run deploy:dry-run
npm run deploy:staging:dry-run
npm run check:runner:image
git diff --check
```

The release gate must cover:

- six modules, 30 globally unique lessons, exact manifest parity, exact 420 XP, and the planned exercise mix;
- complete beginner explanations, analogies, prompts, code guides, hints, recaps, and output for all editable lessons;
- conjunctive prerequisite handling with neither, either one, and both requirements complete;
- strict course, module, lesson, legacy-route, direct-refresh, and malformed-route behavior;
- one-time lesson XP, one-time module shards, module closure recovery, replay, memory repair, reset, and resume;
- V2 local priority, legacy fallback, dual writes, backup version 1, remote record version 1, and cross-device union of every Phase 5A ID;
- Python Practice aggregation across both courses, completed-module eligibility, deterministic bounds, and zero rewards;
- all 11 explicit Codebook mission unlocks and foundation unlock regressions;
- exactly 100 runner assignments and all 12 Practical Python assignment lookups;
- public final output and expressions, protected Supply Tracker AST facts, adversarial rejection, analyzer protocol failure, and browser-bundle privacy;
- all existing foundation, project, runner, authentication, synchronization, portfolio, and four-language analyzer regressions;
- exact lazy assets and raw and gzip bundle caps;
- the repository-wide U+2014 exclusion.

Passing TypeScript or unit tests does not prove the runner image, Cloudflare Sandbox isolation, browser interaction, 390-pixel layout, deployment state, or production progress safety. Those remain separate gates.

## Learner QA checklist

Run this checklist in a clean browser profile and again with a realistic existing learner record.

### Catalog and prerequisites

- Confirm the catalog shows four foundation courses and one continuing Practical Python course with distinct complete, continue, and locked states.
- With neither prerequisite complete, confirm the Practical Python card and outline name both requirements and keep every lesson locked.
- Complete only Python Foundations and confirm the project requirement remains visible and the course remains locked.
- Complete only `Your First Interactive Program` in a prepared test record and confirm Python Foundations remains visible and the course remains locked.
- Complete both requirements and confirm the first module opens without changing the active runtime language away from Python.
- Open a direct Practical Python lesson URL before and after prerequisites. Confirm it fails closed while locked and opens the exact lesson after unlock.

### Course learning flow

- Complete all 30 lessons in order, including every choice, prediction, ordering, bug repair, and guided code interaction.
- Confirm each explanation defines its new term before use and distinguishes the learner's edit from supplied code.
- Run and check all 12 editable exercises against the deployed isolated Python runner.
- Confirm a wrong answer gives specific feedback and the hint reveals only the next useful step.
- Exit and refresh after a credited lesson. Confirm the course resumes at the first unfinished lesson.
- Finish each fifth lesson, close the module, and confirm only the next module unlocks.
- Confirm the course adds exactly 420 first-completion XP. Replay credited lessons, completed modules, and memory repair, then confirm no duplicate XP or shards.
- Complete `pydata6-supply-tracker` and confirm the exact three-line visible output and all protected checks pass for the authentic solution.
- Submit hardcoded output, comment-only decoys, unreachable code, aliases, moved harness statements, and malformed source. Confirm none earns capstone completion or exposes analyzer details.

### Practice, Codebook, and persistence

- Before any Practical Python module completes, confirm Python Practice contains only eligible Python Foundations work.
- Complete one Practical Python module and confirm its concepts can join Python Practice while the next incomplete module remains excluded.
- Confirm one set has at most five items and at most two from one module, stays Python-only, and awards no XP or shards.
- Confirm the 11 new Codebook definitions are searchable. Verify each Python example remains locked until its exact introducing mission completes, then unlocks without a page reload error.
- Refresh, close and reopen the browser, export and restore a version 1 backup, and merge two test devices. Confirm all known Phase 5A lesson, module, concept, XP, and review data survives.
- Keep an older application tab open during the V2 test. Save from that tab, then reload the current client and confirm the authoritative Phase 5A progress is not erased.

### Routes, accessibility, and responsive behavior

- Open, refresh, bookmark, and use Back and Forward on `/courses/python-data-tools` and representative first, middle, and final lesson routes.
- Confirm the document title and heading focus match the course or lesson after every lazy route transition.
- At desktop width, confirm the prerequisite panel, module rows, lesson rows, action hierarchy, editor, and feedback remain readable without decorative clutter.
- At 390 CSS pixels, confirm the course and lesson flow becomes one readable column with no clipped text, overlapping controls, or horizontal document overflow.
- Complete a lesson with keyboard controls, including Ctrl+Enter on Windows or Linux or Command+Enter on macOS. Confirm Tab can leave the editor and status changes are announced.
- Confirm reduced-motion behavior, visible focus, native button semantics, lock text, complete text, and contrast remain intact.

## Controlled staging rollout

Do not deploy Phase 5A content to staging until its current Worker is at or above the compatibility floor `3bff5e2d-48a2-494b-9dce-894375da9a8b`.

Use the staging binding, not a copied namespace identifier, for every kill-switch operation:

```bash
npx wrangler kv key get enabled --binding RUNNER_CONFIG --remote --config wrangler.staging.jsonc
npx wrangler kv key put enabled false --binding RUNNER_CONFIG --remote --config wrangler.staging.jsonc
npx wrangler kv key put enabled true --binding RUNNER_CONFIG --remote --config wrangler.staging.jsonc
npx wrangler kv key put enabled false --binding RUNNER_CONFIG --remote --config wrangler.staging.jsonc
curl -fsS https://see-pound-coffee-pie-phase2-staging.chris-c39.workers.dev/api/runner/status
```

The first command reads the stored state. The next three commands pause execution, open the controlled runner test window, and close it again. The final status request must agree with the intended stored state.

1. Publish the reviewed final content commit to `main` and confirm CI tests that exact commit.
2. Record the final commit in the release-evidence placeholder below.
3. Disable new staging execution through the documented `RUNNER_CONFIG` kill switch. Confirm the static academy remains available and the public status endpoint reports disabled.
4. Deploy the final staging Worker and reviewed Python runner image from the same content commit. Wait for the Python container application to report ready with no health errors. Confirm the other three language images and bindings remain expected.
5. Record the final staging content-release Worker version below. Do not overwrite the compatibility-floor value with it.
6. Run the static and browser learner checklist while execution is still paused, including prerequisites, direct refresh, lazy assets, desktop, and 390-pixel behavior.
7. Open a controlled runner test window and run:

```bash
npm run check:runner:staging
npm run check:runner:project:staging
npm run check:runner:cpp-project:staging
npm run check:runner:csharp-project:staging
npm run check:runner:java-project:staging
npm run check:runner:python-data-tools:staging
```

8. Confirm the Supply Tracker probe rejects hardcoded output and adversarial source, accepts the authentic solution, returns the exact visible output, and never returns its profile or AST facts.
9. Return staging execution to disabled after the test window. Confirm both configuration storage and the public status endpoint agree.
10. Do not begin production until the source commit, Worker version, image digest, automated output, and learner QA notes have been reviewed together.

## Controlled production rollout

Do not deploy Phase 5A content to production until its current Worker is at or above the compatibility floor `b1efbd9d-521d-47e4-b6d2-022f705d267f`.

Use the production binding for the controlled production window:

```bash
npx wrangler kv key get enabled --binding RUNNER_CONFIG --remote --config wrangler.jsonc
npx wrangler kv key put enabled false --binding RUNNER_CONFIG --remote --config wrangler.jsonc
npx wrangler kv key put enabled true --binding RUNNER_CONFIG --remote --config wrangler.jsonc
curl -fsS https://seepoundcoffeepie.com/api/runner/status
```

The production runner must remain paused until the deployed Worker and all four images are ready. Restore `enabled` to `true` only for the controlled probes, then leave it enabled only after every production gate passes.

1. Confirm production is healthy, the compatibility floor is still active, and the final source commit exactly matches the staging-reviewed commit.
2. Disable new production execution while leaving static lessons, accounts, progress, Practice, Codebook, portfolios, and project drafts available.
3. Deploy the exact reviewed Worker and Python image. Wait for every container application to report ready and verify that the Python image digest matches staging.
4. Record the production content-release Worker version below.
5. While execution is paused, run `npm run check:live` and verify canonical course and lesson routes, direct refresh, security headers, lazy assets, desktop layout, 390-pixel layout, focus, console, and horizontal overflow.
6. Open a controlled production runner window and run:

```bash
npm run check:runner:production
npm run check:runner:project:production
npm run check:runner:cpp-project:production
npm run check:runner:csharp-project:production
npm run check:runner:java-project:production
npm run check:runner:python-data-tools:production
npm run check:runner:smoke
```

7. Repeat the authentic Supply Tracker browser completion against production and confirm the 420-XP course total, final completion state, Python Practice eligibility, and Codebook unlocks.
8. Restore normal production execution only after every platform, project, Supply Tracker, browser, and smoke check passes. Confirm both configuration storage and the public status endpoint report the intended enabled state.
9. If any protected assessment, isolation, persistence, route, or learner-facing regression remains, keep execution disabled and use the rollback procedure below.

## Recovery and rollback

Runner failure and static-site failure have separate containment paths:

- For a Python analyzer, image, or coordinator failure, disable new execution. Keep the static academy, accounts, existing progress, Practice, Codebook, and local drafts available while the runner is repaired or the reviewed image is restored.
- For a course route or teaching-content failure, restore the previous reviewed content while keeping the environment's Worker at its stated compatibility floor or newer. Saved Phase 5A identifiers may become temporarily invisible to the older UI, but the compatible Worker must continue to preserve them.
- For a synchronization problem, stop the rollout and avoid new writes until the fault is understood. Do not repair the incident by deleting D1, rewriting learner JSON, removing Phase 5A IDs, rotating secrets, or restoring a pre-floor Worker.
- After rollback, rerun the platform and existing project regression suites, verify the runner's final enabled or disabled state, and test that a record containing Phase 5A IDs can still be read and saved without loss.

The staging rollback floor is `3bff5e2d-48a2-494b-9dce-894375da9a8b`. The production rollback floor is `b1efbd9d-521d-47e4-b6d2-022f705d267f`. Never select an older Worker after Phase 5A learner writes are possible.

## Release evidence to complete

The following values are intentionally unresolved and do not constitute deployment claims:

- final Phase 5A content commit: `<PHASE_5A_CONTENT_COMMIT>`;
- staging content-release Worker version: `<PHASE_5A_STAGING_WORKER_VERSION>`;
- production content-release Worker version: `<PHASE_5A_PRODUCTION_WORKER_VERSION>`.

Before changing the release status at the top of this file, replace those placeholders with exact values and add the matching CI run, bundle output, Python image digest, staging and production runner output, live-route output, and learner browser QA evidence. The final content commit must match `origin/main`, staging and production must run the reviewed content, and the production runner's final enabled state must be confirmed separately.
