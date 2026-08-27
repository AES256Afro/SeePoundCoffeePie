# Teaching-first public site release

Release date: 2026-08-27

Status: released. The teaching-first interface is live on staging and production. The four deployed runner images were not changed. `Practical C++: Collections and Records` remains unpublished.

## Outcome

This release gives teaching more room and removes unnecessary presentation copy.

- `/` always explains what SeePoundCoffeePie is before asking the visitor to begin, even when that browser already has saved progress.
- The catalog, course outlines, lessons, projects, learner record, Code reference, and settings use clearer type sizes and simpler page structure.
- Lesson and project pages separate the explanation, task, code, and result so a beginner can tell what to read and what to change.
- Longer teaching pages still scroll when their content requires it, but the interface does not add sideways movement or unnecessary stacked panels.
- Existing learner progress, account behavior, direct links, browser Back and Forward navigation, and bookmarkable routes remain in place.

## Release identity

| Item | Recorded value |
| --- | --- |
| Runtime source commit | `d11a9db0a585c7663a34dca1ffaad23b59ee8fd9` |
| Successful runtime CI | [GitHub Actions run 33069295167](https://github.com/AES256Afro/SeePoundCoffeePie/actions/runs/33069295167) |
| Staging Worker | `13a2ec40-137d-4b46-959a-0d51200cce78` to `9bc9cdef-22d8-46ed-afb2-3ac828271d19` |
| Production Worker | `571495f3-3997-45f8-b1e2-d34a97f526dc` to `7f4ce5f8-a341-4030-8953-8623e8a55508` |
| Staging runner final state | `enabled: false` |
| Production runner final state | `enabled: true` |
| D1 migration | None |
| Secret update | None |
| Runner-image release | None |

Both deployed Worker versions use the tag `public-site-d11a9db0a585` and the message `Public site only from d11a9db0a585; runner images preserved.`

## Automated verification

- The local release gate passed 56 test files and 642 tests before deployment.
- Lint, text style across 217 tracked and release-candidate files, social-preview validation, the production build, server-only assessment privacy, public-site deployment safeguards, and bundle budgets passed.
- The local runner-image gate passed for Python, C++, C#, and Java. It covered compilers, invalid code, CPU, memory, storage, output and network limits, repeated cleanup, protected project checks, and the private C++ analyzer tests. No image was uploaded.
- Production and staging public-site dry runs passed with runner images excluded.
- GitHub Actions run 33069295167 passed against the exact runtime commit.

## Staging verification

- The public-site deployment changed only the active Worker and browser assets. The runner stayed paused.
- The deployment wrapper confirmed that all four runner application IDs, image digests, application versions, instance counts, and update times stayed unchanged across three post-deployment reads.
- The paused site check covered the teaching-first entry, a 20-file JavaScript dependency graph, six representative routes, the account shell, runner status, and sitemap.
- Browser checks covered `/`, `/courses`, `/learn/python-foundations/py-first-spark/py-console`, and `/projects/python/first-interactive-program` at desktop and 390 by 844. Each direct route loaded with the expected title and heading. None had horizontal overflow. Refresh, Back, and Forward worked, and the browser reported no errors or warnings.
- During one controlled enabled window, the site check and all six runner suites passed: the four-language safety suite, foundation project suite, Practical Python suite, C++ project suite, C# project suite, and Java project suite.
- All 30 reserved unpublished C++ assignment IDs returned `404` while the runner was enabled.
- The runner was returned to `enabled: false`. KV, the public status endpoint, the active Worker version, and two later container reads all confirmed the expected final state.

## Production verification

- Production began at Worker `571495f3-3997-45f8-b1e2-d34a97f526dc` with the runner enabled. The runner was paused before upload and both KV and the public status endpoint confirmed the pause.
- The public-site deployment activated Worker `7f4ce5f8-a341-4030-8953-8623e8a55508` without building, uploading, updating, or assigning a runner image.
- The deployment wrapper confirmed that all four production runner applications remained unchanged across three post-deployment reads.
- The paused live check passed the 20-file JavaScript graph, sitemap, robots, social preview, apex and `www` behavior, response headers, 30 canonical routes, 2 legacy routes, and both unpublished C++ route boundaries.
- Browser checks covered the same four direct routes at 1280 by 720 and 390 by 844 on `seepoundcoffeepie.com`. None had horizontal overflow. The lesson fit one desktop screen and used 1.28 phone screens. Refresh, Back, and Forward worked, and the browser reported no errors or warnings.
- During one controlled enabled window, the conclusive live check, all six runner suites, and a direct production smoke run passed.
- All 30 reserved unpublished C++ assignment IDs returned `404` while the runner was enabled.
- Production was restored to its recorded pre-release state, `enabled: true`, only after every check passed. KV and the public status endpoint both confirmed the restored state.

## Runner applications stayed unchanged

The production and staging applications kept these image digests throughout the release:

| Runner | Image digest | Production application | Staging application |
| --- | --- | --- | --- |
| Java | `sha256:d1dc1b42eb2610584b0f49caf899ab904aee47400fb0ab6f5d3fbe601e1b4537` | `a03a8f30-8b5a-4b86-ba11-9e3a647b2009`, version 5, 4 instances | `a034f00b-65ee-480a-b00d-a84079239669`, version 16, 2 instances |
| C# | `sha256:9422500277240286911dbadc76bcf112e6fc0dfde1dde81d8cf645006b85167c` | `a0315891-2922-4b77-935f-b356e5884084`, version 5, 4 instances | `a032edb0-0d37-4ed6-9fbb-f1887faa9adb`, version 16, 2 instances |
| C++ | `sha256:7d4b292ab94a1ef1d5f2e2095908b0c79bc321f381fd3ccf26e1292541901e58` | `a034b76c-c7be-4611-9b25-f4fd38f7e27e`, version 5, 4 instances | `a03bcac3-2204-4577-b0b1-97f0ec286849`, version 16, 2 instances |
| Python | `sha256:da8296ec951f3cfab6faf71b95eeb6d58733f088f745a7f38e8a6837a8441315` | `a03e6617-f636-4ec5-a18a-8585c7888e40`, version 6, 4 instances | `a030a91f-c4c6-4fcb-ac35-575ecc740c6e`, version 19, 2 instances |

The source commit contains a private C++ analyzer and a local C++ Dockerfile change so the unpublished course can be tested safely. Those source changes were not released as runner images. The public-site deployments used Wrangler's `--containers-rollout none` mode, which leaves container images and running instances unchanged. See Cloudflare's [container rollout documentation](https://developers.cloudflare.com/containers/platform-details/rollouts/).

## Unpublished C++ boundary

`Practical C++: Collections and Records` remains unavailable to learners:

- no public course registry entry or catalog card;
- no public course or lesson route;
- no Practice or Code reference entry;
- no sitemap entry;
- no public runner assignment;
- no unpublished teaching or analyzer marker in the deployed JavaScript graph;
- direct course and lesson paths render the ordinary not-found page;
- all 30 reserved assignment IDs return `404` when the runner is enabled.

## Verification correction

The first paused production check found an outdated assumption in the release checker. The deployed teaching file was present and byte-for-byte identical on the custom domain and Worker address, but Vite referenced it as a lazy relative import instead of an entry-file `assets/` path. The checker now selects one unique asset from the complete deployed JavaScript graph and verifies its teaching marker there. A focused regression test covers this layout.

## Recovery

Keep the code checker paused during any rollback. Cloudflare documents that connected resources are not changed during a Worker rollback, but the runner application snapshot must still be compared before and after the action. See Cloudflare's [Worker rollback documentation](https://developers.cloudflare.com/workers/versions-and-deployments/rollbacks/).

Production must not roll below the compatibility floors in [PHASE_5A_RELEASE.md](PHASE_5A_RELEASE.md) and [PHASE_5B_COMPATIBILITY_RELEASE.md](PHASE_5B_COMPATIBILITY_RELEASE.md). The complete public-site deployment and rollback procedure is in [PUBLIC_SITE_DEPLOYMENT.md](PUBLIC_SITE_DEPLOYMENT.md).
