# Public-site deployment boundary

Status: active release procedure.

The website and the four runner images share one Wrangler configuration, but they do not need to change together. A routine interface or lesson-copy release must update the Worker and static assets without building or updating any runner image.

This boundary is especially important while `Dockerfile.runner.cpp` contains the unpublished Phase 5B analyzer. The analyzer belongs in local and controlled runner-image verification. It must not enter a routine public-site release.

## Safe default commands

Use these commands for normal website work:

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

It requires `RUNNER_CONFIG.enabled` to be `false` before deployment, but it does not snapshot that value afterward. The public-site command does not run D1 migrations or secret-update commands. Reviewers must separately confirm that a routine site diff does not change the public runner assignment allowlist. Any intentional change to D1 migrations, secrets, runner state, or runner assignment policy is a separate release action outside this procedure.

The ordinary production command now means public site only. Do not replace it with a raw `wrangler deploy` command.

## Staging sequence

1. Commit the reviewed change to `main`, push it, and wait for CI.
2. Record `npx wrangler deployments status --json --config wrangler.staging.jsonc`.
3. Confirm `npx wrangler kv key get enabled --binding RUNNER_CONFIG --remote --config wrangler.staging.jsonc` returns `false`.
4. Run `npm run deploy:staging`.
5. Record the new Worker version printed by the wrapper.
6. Run `npm run check:site:staging` while the code checker remains paused.
7. Test the signed-out introduction, catalog, one foundation lesson, and one project at desktop and mobile sizes.
8. Open one controlled runner window by setting `RUNNER_CONFIG.enabled` to `true`. Run `npm run check:site:staging:enabled`, `npm run check:runner:staging`, `npm run check:runner:project:staging`, `npm run check:runner:cpp-project:staging`, `npm run check:runner:csharp-project:staging`, `npm run check:runner:java-project:staging`, and `npm run check:runner:python-data-tools:staging`. Then immediately set `RUNNER_CONFIG.enabled` back to `false`. If any check fails, pause the checker before investigating.
9. Confirm the wrapper reports all four staging runner applications unchanged, then confirm `RUNNER_CONFIG.enabled` is `false`.

## Production sequence

1. Review the staging Worker version, automated output, container snapshot, and browser notes together.
2. Record `npx wrangler deployments status --json`.
3. Record the current runner state, then pause new checks with `npx wrangler kv key put enabled false --binding RUNNER_CONFIG --remote`.
4. Confirm `npx wrangler kv key get enabled --binding RUNNER_CONFIG --remote` returns `false`.
5. Run `npm run deploy`.
6. Record the new Worker version printed by the wrapper.
7. Run `npm run check:live:paused` while the code checker remains paused. This verifies the site but states clearly that runner-assignment absence is not yet proven.
8. Repeat the signed-out desktop and mobile browser checks on the custom domain.
9. Confirm the wrapper reports all four production runner applications unchanged.
10. If the pre-release value recorded in step 3 was `true`, open one controlled runner window by setting `RUNNER_CONFIG.enabled` to `true`. Run `npm run check:live`, `npm run check:runner:production`, `npm run check:runner:project:production`, `npm run check:runner:cpp-project:production`, `npm run check:runner:csharp-project:production`, `npm run check:runner:java-project:production`, and `npm run check:runner:python-data-tools:production`. If the recorded value was already `false`, do not enable the checker and record that assignment absence remains unproven until the separate pause reason is resolved.
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

Never roll production below the production compatibility floors recorded in the [Phase 5A release](PHASE_5A_RELEASE.md) and the [Phase 5B compatibility release](PHASE_5B_COMPATIBILITY_RELEASE.md). After a rollback, rerun `npm run check:live`, verify that a record containing the reserved Phase 5B identifiers can still be read and saved without loss, confirm the unpublished C++ routes and assignments remain unavailable, and run the full production runner regression set during a controlled enabled window.

## Intentional runner releases

A runner-image change is a different release type. It requires the applicable course release record, image checks, staging runner enablement window, authentic and adversarial assessment probes, image-digest review, and production rollback plan. There is deliberately no convenient package-script alias that turns a routine website release into a container rollout.
