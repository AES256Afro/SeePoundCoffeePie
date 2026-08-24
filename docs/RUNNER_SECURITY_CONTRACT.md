# Isolated Runner Security Contract

## Current boundary

SeePoundCoffeePie does not execute arbitrary learner code in production today. The current training simulator checks narrowly authored syntax patterns in the browser and displays an authored expected result. It is suitable for the guided Phase 1 exercises, but it is not a compiler or security boundary.

The first Phase 2 deliverable is therefore a contract, not a pretend compiler. `src/lib/runner-contract.ts` fixes the only request fields a future runner may accept and rejects oversized, malformed, or command-bearing input before it reaches a language toolchain.

No `/api/run` route should be enabled until every release gate in this document has evidence.

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

Cloudflare serves the application and can host the control API, but the public Worker must never evaluate code or forward it to a general-purpose shell. The execution service is a separate trust boundary with separate credentials and no access to OAuth or session secrets.

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
| CPU time | 2 seconds | Host or sandbox supervisor |
| Wall time | 5 seconds | Host or sandbox supervisor |
| Memory | 128 MiB | Sandbox cgroup or equivalent |
| Processes | 32 | Sandbox process limit |
| Writable storage | 1 MiB | One-use temporary filesystem quota |
| Standard output | 64,000 bytes | Streaming supervisor with truncation |
| Standard error | 64,000 bytes | Streaming supervisor with truncation |
| Network | None | Deny at the sandbox boundary |

The in-process program cannot be trusted to measure or stop itself. A host-side supervisor must terminate the whole isolation unit when any limit is reached and must report `limit_exceeded` without exposing host details.

## Required isolation controls

- Start one clean isolation unit per run. Never reuse a learner-writable filesystem between users or attempts.
- Run as an unprivileged identity with no host user namespace, Docker socket, device access, cloud metadata route, or secret-bearing environment variables.
- Mount the toolchain and root filesystem read-only. Give the process only a size-limited temporary working directory.
- Deny inbound and outbound network access, including DNS. Course exercises must not need package downloads.
- Use pinned, digest-addressed runner images and pinned compiler or runtime versions. Rebuild them through reviewed CI with vulnerability scanning and a software bill of materials.
- Select compiler commands and flags from a server-side language table. Never concatenate learner input into a shell command. Invoke executables with an argument array and pass source through a fixed file.
- Cap output while it is produced. Escape it as text in the interface so terminal control sequences and HTML cannot become interface instructions.
- Destroy the isolation unit and writable storage after every outcome, including timeout, compiler crash, queue cancellation, and control-plane error.
- Keep the execution service unable to read GitHub OAuth secrets, site session secrets, learner cookies, or another run's results.

## Abuse, privacy, and operations

- Require a short-lived, same-origin run grant tied to a lesson or project and enforce per-user, per-IP, and global concurrency limits.
- Apply queue backpressure. A full queue returns a retryable response instead of starting unbounded work.
- Use opaque random run IDs. Authorize every status and result read; knowing an ID is not authorization.
- Do not log source code, standard input, or full compiler output by default. Operational logs should contain run ID, language, image digest, outcome, duration, limit reached, and coarse byte counts.
- Keep results only long enough for the learner workflow. Document the exact retention window before launch and provide deletion behavior for account removal.
- Separate beginner explanations from raw diagnostics. Preserve the original compiler message under a disclosure, but strip host paths and infrastructure details first.
- Alert on isolation failures, cleanup failures, rising timeout rates, unusual output volume, queue saturation, and repeated rejected command fields.

## Result contract

Every result uses one explicit outcome:

- `completed`: the program finished within every limit;
- `compile_error`: the toolchain rejected the source before execution;
- `runtime_error`: execution began and the learner program failed;
- `limit_exceeded`: a host-enforced resource ceiling stopped the run;
- `system_error`: academy infrastructure failed and the learner should not be blamed.

The result includes capped `stdout` and `stderr`, a nullable exit code, host-measured duration, and a `truncated` flag. It never returns host paths, environment variables, internal addresses, container identifiers, stack traces from the control plane, or secret values.

## Release gates

Real execution remains disabled until all of these are demonstrated in an isolated staging environment:

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

Passing unit tests for the TypeScript contract proves only request validation. It does not prove process isolation, sandbox cleanup, platform behavior, or production readiness.
