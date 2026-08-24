# Phase 2 Real Execution Release

Release date: 2026-08-24

## Outcome

Phase 2 replaces pattern-matched editable exercises with real Python, C++, C#, and Java execution. All 48 editable exercises run through the same versioned request contract, lesson-scoped authorization, bounded queue, one-use VM, server-owned assignment checks, and beginner diagnostic layer. Choice, prediction, and ordering exercises remain in the browser because they do not execute code.

## Supported toolchains

| Academy station | Runner command | Supported version |
| --- | --- | --- |
| Pie, Python | CPython isolated mode | Python 3.10.12 |
| See, C++ | GNU C++ with C++20 | g++ 11.4.0 |
| Pound, C# | Roslyn compiler plus .NET runtime | C# 12, .NET SDK 8.0.130, runtime 8.0.30 |
| Coffee, Java | `javac` and JVM | OpenJDK 21.0.11 |

Each image uses a digest-pinned Cloudflare Sandbox base. Package versions, compiler paths, flags, source filename, output filename, working directory, and runtime invocation are fixed in the image and trusted supervisor. A learner supplies source text and optional standard input, never a shell command or toolchain option.

## Request and result path

1. The browser requests a five-minute signed grant for one authored exercise.
2. The Worker binds the grant to the signed-in GitHub user or a signed guest cookie.
3. Both the public Worker and internal coordinator validate the version 1 request.
4. The Durable Object enforces per-learner, per-IP, global rate, queue, and pending limits.
5. A language-specific Sandbox VM receives fixed `source.txt` and `stdin.txt` files.
6. The supervisor drops to UID 10001, installs the socket syscall policy, applies process limits, and invokes the fixed toolchain.
7. Output is capped and sanitized. Server-owned visible and hidden assignment checks run outside learner code.
8. The VM is destroyed before the result can be reported as successful.
9. The learner-scoped result expires after 15 minutes. Interrupted queued or running records lose their source and become a system error after two minutes.

The complete request schema, resource ceilings, threat boundaries, and release gates are in [RUNNER_SECURITY_CONTRACT.md](RUNNER_SECURITY_CONTRACT.md).

## Learning behavior

- The editor reports `queued`, `running`, and completion states instead of pretending a local string check is execution.
- Successful programs show their actual console output and assignment checks.
- Compile and runtime failures receive a plain-language title, explanation, suggestion, and line number when one is safe to infer.
- Sanitized raw output is available under a disclosure for learners who want to inspect the original toolchain message.
- Host paths, terminal control sequences, null characters, infrastructure exceptions, and secret values are not shown.
- Infrastructure failures do not count as learner mistakes or weaken a concept's review schedule.

Visible output checks use the output already shown in the lesson. Hidden checks verify that the supplied scaffold remains present and that the program finishes normally. They do not add an unstated requirement.

## Abuse, isolation, and privacy controls

- Queue capacity: 32 waiting runs.
- Coordinator concurrency: four active runs across languages.
- Per-learner pending cap: two.
- One-minute rate windows: 10 per learner, 20 per IP hash, 60 globally.
- Source: 20,000 UTF-8 bytes. Standard input: 4,000 UTF-8 bytes.
- Output: 64,000 bytes separately for stdout and stderr.
- Runtime: 2 seconds CPU, 5 seconds wall time, 256 MiB memory, 32 processes, 32 MiB allocated writable storage. Python, C++, and Java also use a 32 MiB logical per-file ceiling. C# omits that redundant logical ceiling because CoreCLR creates a large sparse startup file, while its physical allocation remains under the same monitored 32 MiB budget.
- Compilation: 4 seconds CPU, 8 seconds wall time, 768 MiB memory, 128 processes, 128 MiB allocated writable storage.
- Network: Sandbox internet disabled for the whole VM plus a learner-runtime seccomp rule that permits only local Unix sockets.
- Isolation: a new opaque Sandbox ID and fresh writable filesystem for every attempt, followed by `destroy()` on every outcome.
- Secrets: OAuth and session secrets never enter the learner process environment.
- Retention: source and standard input exist only in a pending run record. Completed results retain capped output for 15 minutes. Raw IP addresses are never stored by the runner.

Operational logs are enabled for the Worker and container applications. The coordinator emits structured queue, completion, limit, interruption, cleanup, and rejection events. Application code does not log source, standard input, cookies, raw IPs, or raw compiler output.

The repository also contains a scheduled production monitor. Every six hours it requests a real lesson grant, queues a fixed synthetic Python program, waits for a fresh sandbox, and verifies the exact output plus every server-owned assignment check. A failure produces a failed GitHub Actions run, remains visible in the repository's Actions history, and can use GitHub's Actions email or web notifications. The monitor never submits learner code or credentials. Run the same check on demand with `npm run check:runner:smoke`.

## Repeatable verification

Run the normal application gate:

```bash
npm run check:release
```

Build and exercise all four local runner images:

```bash
npm run check:runner:image
```

Verify the isolated staging deployment:

```bash
npm run check:runner:staging
```

Verify production after a release:

```bash
npm run check:runner:production
npm run check:live
```

The platform script verifies all four languages, network denial, CPU, memory, writable-storage and output ceilings, compile diagnostics, cross-run filesystem and secret isolation, cross-user authorization, and the two-pending-run learner limit.

## Release evidence

### Local gate

- `npm run check:release`: 15 test files and 158 tests passed; lint, TypeScript, production build, and bundle budgets passed.
- `npm run check:runner:image`: all 12 image checks passed across four successful programs, three compiler failures, CPU, output, memory, allocated-storage, and network-denial fixtures.
- `wrangler deploy --dry-run`: production Worker, assets, Durable Object migrations, KV binding, and all four container bindings validated before publication.

### Isolated staging gate

- Staging Worker version: `4926fe2c-3f89-42a2-b4ec-1fe5b6887d72`.
- Python image: `sha256:12aa2a07eafbae5a3d20505a8386a233c25e14f958fedb954da9dd8f4a6a1f41`.
- C++ image: `sha256:5d47a2a465beee2e9792d85f0a4634db78e406bd6380736f79f546fc5399ef6c`.
- C# image: `sha256:3728fa64ae72d19eb1c701558be090ec0e1ff7ee7c73e4475f75c174dfeaaa7d`.
- Java image: `sha256:45cd6fb203594bc0e3634c4b6da34faf8f10524f7d41511ae08ae5d2bb7221d0`.
- `npm run check:runner:staging`: all four languages, seccomp socket denial, CPU, memory, allocated storage, output cap, cross-run filesystem and secret isolation, sanitized diagnostics, per-learner pending saturation, and cross-user result authorization passed.
- Live tail inspection showed structured `runner.queued`, `runner.complete`, rejection, and limit events containing only opaque run metadata, phase, coarse byte counts, allocated bytes, and cleanup state. Application events contained no learner source, standard input, raw compiler output, cookie, or raw IP.
- A real browser completed the first editable Python exercise after first observing a syntax failure. The interface displayed an authored beginner explanation, line-specific sanitized Python details under a disclosure, actual successful output, visible and hidden assignment checks, the destroyed-sandbox confirmation, and no browser console errors.

### Production gate

- Published source commit: `2c47f0d1e6334d67cf8c5bed429f66db17a1e3b1` on `main`.
- Production Worker version: `2c85b0ba-e4ef-4c55-91c4-e6c24a275704`.
- Python container application: `a03e6617-f636-4ec5-a18a-8585c7888e40`, image `sha256:12aa2a07eafbae5a3d20505a8386a233c25e14f958fedb954da9dd8f4a6a1f41`.
- C++ container application: `a034b76c-c7be-4611-9b25-f4fd38f7e27e`, image `sha256:5d47a2a465beee2e9792d85f0a4634db78e406bd6380736f79f546fc5399ef6c`.
- C# container application: `a0315891-2922-4b77-935f-b356e5884084`, image `sha256:3728fa64ae72d19eb1c701558be090ec0e1ff7ee7c73e4475f75c174dfeaaa7d`.
- Java container application: `a03a8f30-8b5a-4b86-ba11-9e3a647b2009`, image `sha256:45cd6fb203594bc0e3634c4b6da34faf8f10524f7d41511ae08ae5d2bb7221d0`.
- Cloudflare reported four of four healthy instances for every container application. Each application used the intended digest, Firecracker isolation, a private network, no public IPv4 or IPv6 address, and application logs.
- The production kill-switch drill set `enabled=false`, confirmed that `/api/runner/status` reported execution paused, and confirmed the academy homepage still returned HTTP 200. The switch was then set to `true` and its public state was verified before runner testing.
- `npm run check:runner:production` passed Python, C++, C#, Java, socket syscall denial, CPU, memory, allocated storage, output, cross-run filesystem and secret isolation, sanitized compiler diagnostics, the two-pending-run cap, and cross-user result authorization. The verification wrapper would have disabled the kill switch automatically on any failure.
- `npm run check:live` passed the apex domain, `www` redirect, production security headers, and SPA fallback.
- A production browser first submitted invalid Python and received a line-specific beginner explanation plus a sanitized raw `mission.py` diagnostic. The corrected program returned its real output, passed its visible and hidden checks, confirmed destruction of the fresh sandbox, and produced no browser console errors.
- `npm run check:runner:smoke` then passed a separate production grant, queue, execution, output, and assignment-check probe. The scheduled GitHub monitor runs this probe every six hours.
- GitHub Actions run `32761075273` executed the published monitor from commit `a52d2516f95ba486b51424a98ee18ad3ef0a5352` and passed its remote production smoke-test job in 10 seconds.

The deployment above contains the immutable application tree from source commit `2c47f0d1e6334d67cf8c5bed429f66db17a1e3b1`. The release-evidence and monitor documentation commit does not change the deployed Worker bundle.

### Operational queries and alerting

Cloudflare Workers Observability is enabled for the Worker and containers. The reusable production failure query is:

```text
$workers.scriptName = "see-pound-coffee-pie" AND regex($metadata.message, "runner.(system_error|interrupted)|cleanupFailed")
```

The query matches the coordinator's system-error and stale-interruption events plus any failed sandbox cleanup without containing learner source. A separate search for `runner.rejected` shows queue, pending, and rate-limit rejections for abuse and capacity investigation.

The account's Cloudflare Notifications catalog was reviewed at release time. It did not offer the documented Workers Observability notification type. Its only scheduled-query notification belonged to Log Explorer, and this account had no Log Explorer dataset. Phase 2 did not accept new Cloudflare pricing terms or activate a separate paid logging product to work around that account limitation. Ongoing alerting therefore uses the repository's `Production runner monitor` workflow, while Cloudflare remains the source for detailed privacy-preserving operational events. The repository owner's existing GitHub Actions setting was verified to send both GitHub and email notifications for failed workflows only, so a scheduled production failure reaches the operator without another subscription change.

## Kill switch and recovery

The static academy and GitHub sign-in stay available when execution is paused. When the `enabled` KV key exists, it is the operational switch. If that key is absent, the deployed `RUNNER_ENABLED` variable is the fallback and defaults to `false` in this release.

Pause new production runs:

```bash
npx wrangler kv key put enabled false --namespace-id 2aeb513663da4186a9aba4dec27790de --remote
```

Re-enable only after a healthy deployment and runner verification:

```bash
npx wrangler kv key put enabled true --namespace-id 2aeb513663da4186a9aba4dec27790de --remote
```

Confirm the public state:

```bash
curl -fsS https://seepoundcoffeepie.com/api/runner/status
```

If a release fails, set the KV switch to `false` first. Then roll the Worker back in Cloudflare or redeploy the last known-good Git commit. Do not re-enable execution until the four-language production gate passes. Existing completed results remain readable until their short expiry even while new runs are paused.

## Deployment sequence

1. Keep production KV `enabled` set to `false`.
2. Run the local application and image gates.
3. Deploy staging and wait until every container application reports `ready` with the intended image digest.
4. Run the full staging platform gate and perform the browser exercise check.
5. Commit and push the exact tested tree to `main`.
6. Deploy that commit to production while the KV switch remains off.
7. Confirm the production Worker and all four container applications are healthy.
8. Set production KV `enabled` to `true`.
9. Run the production runner and live-site gates.
10. If any production check fails, disable the KV switch immediately.

## Deliberate boundaries

- The runner supports academy exercises, not arbitrary packages, package installation, user-selected command flags, long jobs, servers, graphics, or network programs.
- Each run is stateless. A program cannot save a file for its next attempt.
- Course progress still lives in the browser. GitHub verifies identity but does not yet synchronize learning data.
- Choice, prediction, and ordering exercises do not invoke a server runner.
- Toolchain upgrades require a reviewed image change and a complete local, staging, and production rerun.
