# Public-site deployment boundary

Status: active release procedure.

The website and the four runner images share one Wrangler configuration, but they do not need to change together. A routine interface or lesson-copy release updates the Worker and static assets without building or updating any runner image.

The first Practical C++ publication is an intentional runner release, not a routine public-site release. Its guarded wrapper uploads `dist`, Worker code, the published 112-assignment registry, and the reviewed C++ image together. It must be the only initial Practical C++ mutation in each environment. The latest recorded live baseline remains the five-course compatibility release until that procedure finishes.

## Safe default commands

Use these commands for normal website work after the environment already has the reviewed runner set required by the selected source:

```bash
npm run deploy:staging:dry-run
npm run deploy:staging
npm run deploy:dry-run
npm run deploy
```

Both actual deployment commands run the complete release gate and then use the pinned Wrangler option:

```text
--containers-rollout none
```

Wrangler defines this option as deploying the Worker without building or updating Containers. The wrapper does not offer `immediate` or `gradual` as public-site options.

## Fail-closed checks

An actual public-site deployment stops unless all of these are true:

1. The pinned Wrangler installation supports the reviewed container-free option.
2. The checkout is clean and is on `main`.
3. Local `main` and `origin/main` resolve to the same commit.
4. The selected environment's code checker is paused in `RUNNER_CONFIG`.
5. The four expected runner applications are unique, ready, digest-pinned, and match their reviewed instance counts.
6. The deployment uses strict remote-change checking without interactive input, so a conflict cannot be accepted at a prompt.
7. Wrangler reports exactly one new Worker version ID, that exact version becomes active, and its tag and message match the release commit.
8. The runner KV value and public status endpoint both remain paused after the deployment.
9. The same complete container snapshot remains unchanged across three post-deployment reads.
10. Old hashed assets remain available for 15 minutes so an already-open page is not broken during rollout.

Before uploading the site, the wrapper records each runner application's ID, image, application version, reported instance count, and update time. It compares that baseline with three post-deployment reads over a short stability window and fails if any value changes. It prints the previous active Worker version before upload and prints an exact rollback command on every post-upload proof failure.

`npm run check:public-site-deploy` verifies the package commands, pinned Wrangler capability, four-image configuration, and private C++ analyzer marker. CI runs this check on every pull request and every push to `main`.

## What a public-site deployment changes

A public-site deployment may change:

- the Worker code in `src/worker.ts` and its server-only imported modules;
- the built browser files in `dist`;
- the active Worker version;
- the static-asset manifest.

The wrapper mechanically compares:

- runner application IDs and images;
- runner application versions and reported instance counts;
- runner application update times.

The wrapper requires `RUNNER_CONFIG.enabled` to be `false` before upload, reads it again after deployment, and confirms that the public status endpoint remains paused. It does not change or restore runner state itself. The public-site command does not run D1 migrations or secret-update commands. Reviewers must separately confirm that a routine site diff does not change the public runner assignment allowlist. Any intentional change to D1 migrations, secrets, runner state, or runner assignment policy is a separate release action outside this procedure.

The ordinary production command means public site only. Do not use it for the first Practical C++ publication and do not replace it with a raw `wrangler deploy` command.

## Routine staging sequence

This sequence is for site-only changes after the required runner images and assignment registry are already established. Use the dedicated Practical C++ sequence below for the initial six-course publication.

1. Commit the reviewed change to `main`, push it, and wait for CI.
2. Record `npx wrangler deployments status --json --config wrangler.staging.jsonc`.
3. Confirm `npx wrangler kv key get enabled --binding RUNNER_CONFIG --remote --config wrangler.staging.jsonc` returns `false`.
4. Run `npm run deploy:staging`.
5. Record the new Worker version printed by the wrapper.
6. Run `npm run check:site:staging` while the code checker remains paused.
7. Test the signed-out introduction, catalog, one foundation lesson, and one project at desktop and mobile sizes.
8. Open one controlled runner window by setting `RUNNER_CONFIG.enabled` to `true`. Run `npm run check:site:staging:enabled`, `npm run check:runner:staging`, `npm run check:runner:project:staging`, `npm run check:runner:cpp-project:staging`, `npm run check:runner:cpp-collections:staging`, `npm run check:runner:csharp-project:staging`, `npm run check:runner:java-project:staging`, and `npm run check:runner:python-data-tools:staging`. Then immediately set `RUNNER_CONFIG.enabled` back to `false`. If any check fails, pause the checker before investigating.
9. Confirm the wrapper reports all four staging runner applications unchanged, then confirm `RUNNER_CONFIG.enabled` is `false`.

## Routine production sequence

This sequence is for site-only changes after the guarded Practical C++ release is complete. It is not the initial course-publication procedure.

1. Review the staging Worker version, automated output, container snapshot, and browser notes together.
2. Record `npx wrangler deployments status --json`.
3. Record the current runner state, then pause new checks with `npx wrangler kv key put enabled false --binding RUNNER_CONFIG --remote`.
4. Confirm `npx wrangler kv key get enabled --binding RUNNER_CONFIG --remote` returns `false`.
5. Run `npm run deploy`.
6. Record the new Worker version printed by the wrapper.
7. Run `npm run check:live:paused` while the code checker remains paused. This requires a configured paused checker, confirms executable assignments cannot receive grants while paused, and confirms all 18 teaching-only Practical C++ IDs still return not found without issuing a grant or guest cookie.
8. Repeat the signed-out desktop and mobile browser checks on the custom domain.
9. Confirm the wrapper reports all four production runner applications unchanged.
10. If the pre-release value recorded in step 3 was `true`, open one controlled runner window by setting `RUNNER_CONFIG.enabled` to `true`. Run `npm run check:live`, `npm run check:runner:production`, `npm run check:runner:project:production`, `npm run check:runner:cpp-project:production`, `npm run check:runner:cpp-collections:production`, `npm run check:runner:csharp-project:production`, `npm run check:runner:java-project:production`, and `npm run check:runner:python-data-tools:production`. The live check requires valid grants for the reviewed Python assignment and all 12 runner-backed Practical C++ assignments before the full regressions begin. If the recorded value was already `false`, do not enable the checker and record that execution remains untested until the separate pause reason is resolved; the paused check still proves executable grants are closed and all 18 teaching-only Practical C++ IDs remain unavailable.
11. If any regression fails, set `RUNNER_CONFIG.enabled` to `false` immediately. If every applicable check passes, restore the exact pre-release value recorded in step 3. Never enable a checker that was already paused for another reason.

## Rollback

The wrapper prints the previous and current Worker version IDs. Keep the code checker paused during rollback. To return website traffic to the previous reviewed Worker without changing container images, use:

```bash
npx wrangler rollback <previous-version-id> --yes --message "Restore the previous active Worker version"
```

For staging, add:

```text
--config wrangler.staging.jsonc
```

Record `npx wrangler containers list --json` before and after a rollback, adding `--config wrangler.staging.jsonc` for staging, and verify that the same four runner application IDs, images, versions, reported instance counts, and update times remain unchanged.

Never roll production below the production compatibility floors recorded in the [Phase 5A release](PHASE_5A_RELEASE.md) and the [Phase 5B compatibility release](PHASE_5B_COMPATIBILITY_RELEASE.md). After a rollback, verify that a record containing the reserved Phase 5B identifiers can still be read and saved without loss. Run the live check that matches the restored source surface, then run the complete environment-specific runner regression set during a controlled enabled window.

## Intentional runner releases

A runner-image change is a different release type. It requires the applicable course release record, image checks, a staging runner enablement window, authentic and adversarial assessment probes, image-digest review, and a production rollback plan. The ordinary `npm run deploy` and `npm run deploy:staging` commands still freeze every container image.

Practical C++ has its own reviewed wrapper and no other runner image release shares it:

```bash
npm run deploy:runner:cpp:staging:dry-run
npm run deploy:runner:cpp:staging
npm run prove:runner:cpp:staging
npm run deploy:runner:cpp:production:dry-run
npm run deploy:runner:cpp:production
```

The dry-run commands compile the Worker and build every configured container locally because Wrangler requires Docker even for an `immediate` container dry run. They do not read or change remote runner state, and they do not require a recorded staging proof. The actual commands run the complete release gate first, then stop unless the checkout is clean, on `main`, and matches both `origin/main` and the live remote `main` ref. The actual wrapper also runs the four-image validation with a prefix derived from that exact commit. It repeats the clean-main and live-ref proof immediately before upload. For the upload, it creates a temporary mode-0600 configuration in which only C++ uses `Dockerfile.runner.cpp`; Python, C#, and Java are pinned to their exact live digest URIs after exact Cloudflare registry, account, and repository validation. The same upload carries the built six-course site, Worker code, and published runner registry. The file is removed after Wrangler exits.

The first pre-upload reads have one narrow compatibility allowance for the already-live Worker. They may accept only the exact legacy three-field status containing `enabled: false`, API version 1, and the reviewed language order, and only while the independent KV read is exactly `false`. Extra fields, missing languages, a different language order, another version, or `enabled: true` stop the release. After the upload, the complete current status with `configured: true`, `enabled: false`, and `paused: true` is mandatory. The legacy allowance is never used for staging proof or for production's same-commit staging validation.

The wrapper is intentionally narrower than a raw Wrangler command. It:

1. accepts exactly `staging` or `production` and one optional `--dry-run` flag;
2. pins the server registry to `src/data/runner-publication.with-cpp.ts`;
3. uses strict Wrangler deployment with `--containers-rollout immediate`;
4. records the full source commit in both the Worker tag and message;
5. requires `RUNNER_CONFIG.enabled` to be `false` in KV and requires the public runner status endpoint to report paused before upload;
6. records the active Worker version and the complete four-application snapshot before upload;
7. rechecks the pause controls, clean Git proof, active Worker, and complete container snapshot immediately before upload;
8. for production, requires a passed staging regression proof recorded within the previous 24 hours for the exact clean, remote, CI-verified commit; revalidates its active staging Worker metadata, complete four-container snapshot, C++ digest, and paused state against live staging immediately before upload; and requires production C++ to reach that proven digest;
9. builds a temporary mode-0600 upload configuration that leaves only the C++ Dockerfile buildable and pins Python, C#, and Java to their exact live same-account, same-repository digest URIs;
10. prints versioned rollback evidence containing the candidate and previous Worker IDs, release commit, environment, and complete before snapshot;
11. waits for the exact Worker version created by Wrangler to become active and verifies its commit metadata;
12. polls until all four applications are ready and the same completed snapshot appears twice, then rechecks that the exact candidate Worker is still active with the same commit metadata;
13. requires Python, C#, and Java application IDs, images, versions, instance counts, and update times to remain unchanged;
14. requires the C++ application ID and instance count to remain stable while its digest, application version, and update time advance; and
15. checks KV and the public status endpoint again before reporting success.

Wrangler output is captured rather than copied into the release log. The wrapper prints only release metadata, Worker version IDs, and container snapshots. It never prints secret values or source submitted by learners.

`npm run prove:runner:cpp:staging` is the only reviewed command that records the staging regression proof. It accepts no environment or override arguments. It first requires a clean `main` checkout that matches local `origin/main` and the live remote ref, then requires a successful completed GitHub `CI` push run for that exact commit. Staging must begin paused in both KV and the public status endpoint. The command invalidates any older local proof, binds the active staging Worker version and exact commit tag/message to the complete four-application snapshot, opens one KV enablement window, and runs this fixed sequence:

1. `npm run check:site:staging:enabled`
2. `npm run check:runner:staging`
3. `npm run check:runner:project:staging`
4. `npm run check:runner:cpp-project:staging`
5. `npm run check:runner:cpp-collections:staging`
6. `npm run check:runner:csharp-project:staging`
7. `npm run check:runner:java-project:staging`
8. `npm run check:runner:python-data-tools:staging`

The command always attempts to set staging back to paused in `finally`, then proves both KV and the public endpoint are paused. It refuses to record evidence if any check fails or if the Worker version, its commit metadata, or any application ID, digest, application version, instance count, or update time changes. Only after the final paused proof succeeds does it atomically write `.git/cpp-runner-staging-regression-proof.json` with mode `0600`. The strict version-1 record contains only the commit, successful CI run number, Worker version and commit metadata, four safe container records and their fingerprint, the C++ digest, fixed check list, passed status, and completion timestamp. It contains no credentials, cookies, grants, learner source, analyzer output, or captured command output. The file is local release evidence, is not committed, and expires after 24 hours.

### Practical C++ staging sequence

1. Confirm Docker is available. The actual release wrapper reruns the commit-bound four-image check; `npm run check:runner:image` remains available as an earlier diagnostic.
2. Commit the exact release tree to `main`, push it, and wait for hosted CI to pass.
3. Pause staging with `npx wrangler kv key put enabled false --binding RUNNER_CONFIG --remote --config wrangler.staging.jsonc`.
4. Confirm both KV and `https://see-pound-coffee-pie-phase2-staging.chris-c39.workers.dev/api/runner/status` report paused.
5. Run `npm run deploy:runner:cpp:staging:dry-run`.
6. Run `npm run deploy:runner:cpp:staging` from the same clean commit.
7. Save the before and after snapshots, both Worker version IDs, and the exact rollback-evidence JSON printed by the wrapper. Keep the JSON outside the repository so it does not make the release checkout dirty.
8. Keep staging paused while checking the static site and the published assignment boundary.
9. Run `npm run prove:runner:cpp:staging`. It opens the one controlled runner window, runs every fixed staging check, pauses in `finally`, proves the public endpoint paused, and records the mode-0600 local proof only after the Worker and all four containers remain unchanged.
10. Do not run `npm run deploy:site:staging` after step 6. A second Worker upload would change the version bound to the proof.
11. Do not continue to production unless the recorded proof exists and remains fresh, the C++ analyzer probes, adversarial cases, four-language regressions, container readiness, and manual browser checks all pass.

### Practical C++ production sequence

1. Review the staging commit, Worker versions, container snapshots, check output, and browser notes together.
2. Confirm production will use the exact same commit that passed staging.
3. Record the existing production runner state, then pause production with `npx wrangler kv key put enabled false --binding RUNNER_CONFIG --remote`.
4. Confirm both KV and `https://seepoundcoffeepie.com/api/runner/status` report paused.
5. Run `npm run deploy:runner:cpp:production:dry-run`.
6. Within 24 hours of the successful recorded staging run, run `npm run deploy:runner:cpp:production` from the same clean commit. The command refuses to mutate production if the local proof is missing, malformed, stale, unsuccessful, for another commit or Worker, or no longer matches the live paused staging Worker and complete four-container snapshot.
7. Save the before and after snapshots, both Worker version IDs, and the exact rollback-evidence JSON printed by the wrapper. Immediately before upload, the production command rereads the proof, repeats the live staging pause, metadata, snapshot, and digest checks, and carries the proven C++ digest into the production rollout proof.
8. Keep production paused while running `npm run check:live:paused` and the signed-out browser checks.
9. If production was enabled before the release, open one controlled runner window and run the complete production regression set, including `npm run check:runner:cpp-collections:production`. Pause immediately if any check fails.
10. Restore the exact pre-release runner state only after every applicable check passes. Never enable a runner that was already paused for another reason.
11. Do not add a routine site deployment to this sequence. The guarded production upload is the site, Worker, registry, and image publication.

### Runner-image rollback

The forward wrapper prints a direct Worker rollback command only when it can prove that its own candidate is still active. If another Worker superseded the candidate, it prints no command and requires coordination with the active release owner. A Worker rollback does not restore or prove any container image digest.

Save each forward release's exact rollback-evidence JSON outside the repository. The reviewed exact-digest wrapper consumes that file and generates a temporary mode-0600 Wrangler configuration that pins all four applications to the recorded `registry.cloudflare.com/...@sha256:...` URIs. It does not rebuild an old Dockerfile. Run staging first from a clean reviewed `main`:

```bash
npm run rollback:runner:images:staging:dry-run -- /absolute/path/to/staging-rollback-evidence.json
npm run rollback:runner:images:staging -- /absolute/path/to/staging-rollback-evidence.json
```

After the staging rollback and its runner regressions pass, use the same clean commit for production:

```bash
npm run rollback:runner:images:production:dry-run -- /absolute/path/to/production-rollback-evidence.json
npm run rollback:runner:images:production -- /absolute/path/to/production-rollback-evidence.json
```

The actual rollback stops unless both pause controls agree, clean `main` matches local and live `origin/main`, the evidence candidate is still active, that candidate carries the forward release's exact commit metadata, all four application IDs and instance counts still match the evidence, every target uses the exact current Cloudflare registry account and repository, and at least one digest needs restoration. It repeats the pause, Worker, metadata, snapshot, and Git proofs immediately before upload. Production additionally requires the active staging rollback metadata to bind the same rollback-source commit, exact forward release commit, and fingerprint of the exact four per-class target digests. The active staging containers must have that exact four-digest target set, and the complete staging proof is repeated immediately before production upload.

The rollback uses strict immediate rollout and the published runner alias, creates a new Worker version tagged with the exact rollback commit, and waits for two identical ready snapshots. Every target image must equal its recorded digest. An application whose image did not need restoration must remain completely unchanged; each restored application must keep its ID and instance count while its application version and update time advance. The temporary configuration is removed after Wrangler exits.

On rollback failure, a direct Worker rollback command is printed only if that exact rollback candidate remains active. If it was superseded, no command is printed. Keep execution paused and preserve the complete pre-rollback snapshot in either case.

Any source or permanent configuration restoration must be a reviewed commit on `main`, pushed to `origin/main` after the applicable checks pass. Do not deploy from a detached, dirty, or unpushed historical checkout. Do not reopen execution until the Worker and all four images are a known compatible set, all four applications are ready at the expected instance counts, and the complete environment-specific runner regression set passes. Do not delete D1 data, rotate secrets, or change learner records as part of this rollback.
