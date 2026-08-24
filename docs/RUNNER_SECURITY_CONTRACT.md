# Isolated Runner Security Contract

## Current boundary

Phase 2 implements real server-side execution for the academy's 48 editable exercises. Choice, prediction, and ordering questions stay in the browser because they do not execute code. Editable Python, C++, C#, and Java source goes through the versioned request contract, a scoped control API, a bounded Durable Object queue, and a fresh Cloudflare Sandbox VM. The VM is destroyed after every result.

`src/lib/runner-contract.ts` fixes the only request fields the runner accepts and rejects oversized, malformed, null-bearing, or command-bearing input before it reaches a language toolchain. Production can pause new runs through the `RUNNER_CONFIG` KV kill switch without taking the static academy or GitHub sign-in offline.

## Trust boundaries

```text
Learner browser
    |
    | HTTPS JSON with code and optional text input
    v
Control API
    | validates size, shape, identity, quota, and lesson policy
    | never invokes a compiler directly
    v
Bounded queue
    | carries an opaque run ID and validated payload
    v
One-use isolated runner
    | starts from a pinned image with no learner-controlled command line
    | compiles or interprets with fixed server-owned arguments
    | returns capped output, then destroys its writable state
    v
Result store
    | short retention, opaque IDs, learner-scoped access
    v
Learner browser
```

The public Worker never evaluates code and never accepts a shell command. It sends validated source to a Durable Object coordinator. The coordinator selects a fixed supervisor invocation, and the learner process receives a minimal environment that contains no OAuth or session secrets.

## Fixed request contract

The version 1 request contains only:

- `version`: exactly `1`;
- `language`: `python`, `cpp`, `csharp`, or `java`;
- `source`: non-empty UTF-8 text, at most 20,000 bytes;
- `stdin`: optional UTF-8 text, at most 4,000 bytes.

The request cannot select an executable, compiler path, command-line flag, package, filesystem path, environment variable, image, network destination, mount, or working directory. Those are server-owned policy. Unknown fields are rejected instead of ignored so later client mistakes cannot silently weaken the boundary.

## Execution limits

Every run must enforce all limits outside the learner process:

| Resource | Version 1 ceiling | Enforcement requirement |
| --- | ---: | --- |
| Source | 20,000 bytes | Control API before queueing |
| Standard input | 4,000 bytes | Control API before queueing |
| Runtime CPU time | 2 seconds | Sandbox supervisor with `RLIMIT_CPU` |
| Compile CPU time | 4 seconds | Sandbox supervisor with `RLIMIT_CPU` |
| Runtime wall time | 5 seconds | Sandbox supervisor |
| Compile wall time | 8 seconds | Sandbox supervisor |
| Runtime memory | 256 MiB | Process-tree measurement plus runtime heap cap |
| Compile memory | 768 MiB | Process-tree measurement inside a 1 GiB VM |
| Runtime processes | 32 | Sandbox supervisor with `RLIMIT_NPROC` |
| Compile processes | 128 | Sandbox supervisor with `RLIMIT_NPROC` |
| Runtime writable storage | 32 MiB | Allocated blocks in learner-owned workspace and temporary files |
| Compile writable storage | 128 MiB | Allocated blocks in compiler workspace and temporary files |
| Standard output | 64,000 bytes | Streaming supervisor with truncation |
| Standard error | 64,000 bytes | Streaming supervisor with truncation |
| Network | None | Deny at the sandbox boundary plus runtime seccomp |

The supervisor measures physically allocated blocks so sparse bookkeeping files do not consume the quota at their larger logical length. Python, C++, and Java runtime files also have a 32 MiB logical per-file ceiling. CoreCLR creates a very large sparse logical file during startup in Cloudflare's Firecracker environment, so C# relies on the same 32 MiB physical-block monitor without the redundant logical-length ceiling. The trusted compilation phase raises its inherited soft file-length limit only to the platform's existing hard limit because managed toolchains also create large sparse files. Actual runtime and compiler storage remains capped at 32 MiB and 128 MiB respectively inside the fixed ephemeral disk.

The in-process program cannot be trusted to measure or stop itself. A host-side supervisor must terminate the whole isolation unit when any limit is reached and must report `limit_exceeded` without exposing host details.

## Required isolation controls

- Start one clean isolation unit per run. Never reuse a learner-writable filesystem between users or attempts.
- Run as an unprivileged identity with no host user namespace, Docker socket, device access, cloud metadata route, or secret-bearing environment variables.
- Mount the toolchain and root filesystem read-only. Give the process only a size-limited temporary working directory.
- Deny inbound and outbound network access, including DNS, at the VM boundary. Course exercises must not need package downloads. Apply a second socket-syscall restriction to the learner runtime; trusted managed compiler hosts may use local system-probing socket families while still having no VM network route.
- Use pinned, digest-addressed runner images and pinned compiler or runtime versions. Rebuild them through reviewed CI with vulnerability scanning and a software bill of materials.
- Select compiler commands and flags from a server-side language table. Never concatenate learner input into a shell command. Invoke executables with an argument array and pass source through a fixed file.
- Cap output while it is produced. Escape it as text in the interface so terminal control sequences and HTML cannot become interface instructions.
- Destroy the isolation unit and writable storage after every outcome, including timeout, compiler crash, queue cancellation, and control-plane error.
- Keep the execution service unable to read GitHub OAuth secrets, site session secrets, learner cookies, or another run's results.

## Abuse, privacy, and operations

- Require a short-lived, same-origin run grant tied to a lesson or project and enforce per-user, per-IP, and global concurrency limits.
- Apply queue backpressure. A full queue returns a retryable response instead of starting unbounded work.
- Use opaque random run IDs. Authorize every status and result read; knowing an ID is not authorization.
- Do not log source code, standard input, or full compiler output. Operational events contain opaque run ID, language, outcome, duration, execution phase, limit reached, allocated writable bytes, cleanup status, and coarse output byte counts. The container application configuration separately records the deployed image digest.
- Keep results only long enough for the learner workflow. Document the exact retention window before launch and provide deletion behavior for account removal.
- Separate beginner explanations from raw diagnostics. Preserve the original compiler message under a disclosure, but strip host paths and infrastructure details first.
- Alert on isolation failures, cleanup failures, rising timeout rates, unusual output volume, queue saturation, and repeated rejected command fields.

Cloudflare Workers Observability retains the structured runner events used for detailed investigation. The production failure query selects only the `see-pound-coffee-pie` service and matches `runner.system_error`, `runner.interrupted`, or a failed cleanup marker. Capacity and abuse investigation uses the separate `runner.rejected` event. The repository's scheduled `Production runner monitor` performs a real grant, queue, Python sandbox, output, and assignment-check probe every six hours. A failure is a failed GitHub Actions workflow run, which is visible in the repository and eligible for the repository owner's configured Actions notifications. The probe uses fixed synthetic source committed with the monitor, not learner source.

## Result contract

Every result uses one explicit outcome:

- `completed`: the program finished within every limit;
- `compile_error`: the toolchain rejected the source before execution;
- `runtime_error`: execution began and the learner program failed;
- `limit_exceeded`: a host-enforced resource ceiling stopped the run;
- `system_error`: academy infrastructure failed and the learner should not be blamed.

The result includes capped `stdout` and `stderr`, a nullable exit code, host-measured duration, and a `truncated` flag. It never returns host paths, environment variables, internal addresses, container identifiers, stack traces from the control plane, or secret values.

## Release gates

Real execution is enabled only after these controls are demonstrated in an isolated staging environment:

1. The request validator rejects malformed bodies, unexpected command fields, null bytes, and byte-limit violations.
2. Each language has a pinned image, fixed invocation table, and a documented supported language version.
3. Test programs cannot reach the network, host filesystem, process namespace, cloud metadata, another run, or secret-bearing environment variables.
4. Infinite loops, fork attempts, memory growth, disk growth, and output floods terminate at the documented limits.
5. Cancellation and every failure path destroy writable state and the isolation unit.
6. Result authorization prevents cross-user reads, including guessed or leaked run IDs.
7. Load tests prove queue and global concurrency limits fail closed under saturation.
8. Security logs and alerts work without retaining learner source by default.
9. A human browser test shows compile errors in beginner language while preserving sanitized raw diagnostics.
10. Production has a tested kill switch that disables new runs without taking the static academy offline.

The repeatable local image matrix is `./scripts/check-runner-image.sh`. The platform gate is `node scripts/check-runner-staging.mjs <staging-origin>`. The ongoing production probe is `node scripts/check-runner-smoke.mjs https://seepoundcoffeepie.com`. Passing unit tests for the TypeScript contract proves only request validation. It does not prove process isolation, sandbox cleanup, platform behavior, or production readiness.
