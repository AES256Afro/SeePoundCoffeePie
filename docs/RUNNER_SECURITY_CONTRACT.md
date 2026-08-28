# Isolated Runner Security Contract

## Current boundary

The runner implements real server-side execution for 100 registered assignments: 48 editable foundation exercises, 12 editable Practical Python: Data Tools exercises, and 40 editable guided-project checkpoints across Python, C++, C#, and Java. Choice, prediction, and ordering questions stay in the browser because they do not execute code. Editable Python, C++, C#, and Java source goes through the versioned request contract, a scoped control API, a bounded Durable Object queue, and a fresh Cloudflare Sandbox VM. The VM is destroyed after every result.

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
- `stdin`: optional UTF-8 text, at most 4,000 bytes;
- `purpose`: optional `run` or `check`, defaulting to `check` for older clients.

The request cannot select an executable, compiler path, command-line flag, package, filesystem path, environment variable, image, network destination, mount, working directory, expected result, structural test, or protected test case. Those are server-owned policy. Unknown fields are rejected instead of ignored so later client mistakes cannot silently weaken the boundary.

`purpose` changes presentation, not authority. A project `run` uses the learner's supplied input once and returns no grading tests. A `check` ignores caller-supplied input where the assignment owns protected cases. Protected grading is an assignment-level capability, so it can serve a guided project or an academy capstone without making the browser an assessment authority. Completion is awarded only when the returned official tests all pass.

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
- For a protected multi-case project check, create a different fresh VM for every case. Write source and one server-owned input from trusted coordinator data, collect the bounded result, and destroy that VM before acquiring the next one. The supervisor also clears learner-owned workspace and temporary paths before and after its one execution as defense in depth.
- Preserve the Coffee Counter Python project analyzer in `runner/supervisor.py` as its own version 1 straight-line grammar. It parses the exact protected source bytes under Python's execution encoding rules and fails closed on parse errors, conditionals, loops, imports, functions, exception handling, early exits, line-continuation tricks, parser-encoding disagreements, unsupported calls, name shadowing, duplicate required assignments, and malformed analysis. Practical Python must not broaden or reinterpret these established facts.
- Grade the Supply Tracker capstone only through the server-owned `python-data-tools-supply-tracker-v1` profile. Before learner execution, the coordinator invokes the fixed command `/usr/bin/python3 -I -B /opt/runner/PythonDataToolsAnalyzer.py /workspace/source.txt` with a 5-second trusted-analyzer timeout. The profile string and command are selected by server assignment policy and never come from the request. The analyzer reads the unchanged `/workspace/source.txt` bytes, accepts UTF-8 source only, applies source, AST-node, and AST-depth bounds, and never executes learner code.
- Accept Supply Tracker analysis only as an exact-key, size-bounded JSON object containing version, profile, analyzed and parsed state, plus six Boolean facts: authored frame, `normalize_name`, `add_stock`, `total_stock`, `low_stock`, and the supplied harness. Missing output, malformed JSON, an extra key, an unknown profile, oversized output, timeout, command failure, or an `analyzed: false` envelope becomes `system_error`. A valid `parsed: false` envelope grants no structural credit and learner execution still determines the language outcome. Analysis output remains coordinator-internal.
- Install `PythonDataToolsAnalyzer.py` with root-only mode 0500 only in `Dockerfile.runner.python`. Image checks must prove the trusted coordinator can invoke it, the learner identity cannot read or execute it, and it is absent from C++, C#, and Java images. The shared supervisor remains unchanged and continues to be copied into every language image.
- Parse the exact protected C++ source with the pinned Clang front end, the exact protected C# 12 source with the pinned Roslyn compiler assemblies, and the exact protected Java source with the pinned Java compiler analyzer. Each analyzer accepts only its project's taught program shape, emits a bounded internal fact frame, rejects directives and disguised or unsupported structures, and fails closed when syntax or policy does not match. Never place compiler-derived facts in the public runner result.
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

Cloudflare Workers Observability retains the structured runner events used for detailed investigation. The production failure query selects only the `see-pound-coffee-pie` service and matches `runner.system_error`, `runner.interrupted`, or a failed cleanup marker. Capacity and abuse investigation uses the separate `runner.rejected` event. The repository's scheduled `Production runner monitor` performs the core real grant, queue, four-language sandbox, output, and assignment-check probe every six hours. It also runs the protected Python Data Tools integrity probe against hardcoded-output, comment, unreachable-code, encoding, alias, and authentic sources. A failure is a failed GitHub Actions workflow run, which is visible in the repository and reaches the owner through the existing failed-workflow-only GitHub and email notification setting. The probes use fixed synthetic source committed with the monitor, not learner source.

## Result contract

Every result uses one explicit outcome:

- `completed`: the program finished within every limit;
- `compile_error`: the toolchain rejected the source before execution;
- `runtime_error`: execution began and the learner program failed;
- `limit_exceeded`: a host-enforced resource ceiling stopped the run;
- `system_error`: academy infrastructure failed and the learner should not be blamed.

The result includes capped `stdout` and `stderr`, a nullable exit code, host-measured duration, and a `truncated` flag. It never returns host paths, environment variables, internal addresses, container identifiers, stack traces from the control plane, or secret values.

Protected assignment checks add visible and hidden test summaries. The browser receives the visible example's output and generic protected-check pass or fail messages. It never receives hidden input, hidden expected output, hidden case identifiers, a reference solution, an assessment profile, trusted Python, C++, C#, or Java analysis facts, or a diagnostic string produced only by a hidden case. Each test summary contains only name, visibility, pass state, and a learner-facing message. Completed results expire after 15 minutes. Source and standard input exist only in the queued record and one-use sandbox during that short run lifecycle; they are not copied into learner progress, project history, analytics, or operational logs.

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

The repeatable local image matrix is `./scripts/check-runner-image.sh`. It includes the legacy supervisor tests, the Supply Tracker and Practical C++ analyzer adversarial suites, authentic isolated analyzer invocations, file-mode and image-placement checks, all four language images, resource-limit fixtures, network denial, and repeated-case cleanup. The core platform gate is `node scripts/check-runner-staging.mjs <staging-origin>`. Supply Tracker adds `node scripts/check-runner-python-data-tools.mjs <staging-origin>` and the matching production command. After Practical C++ is published, its dedicated deployed gate is `node scripts/check-runner-cpp-collections.mjs <academy-origin>`. It uses the public API to reject learner-source attacks and to accept the reviewed solution without logging grants, guest cookies, run identifiers, source, or response bodies. It scans the grant response after establishing the learner cookie, so the grant cannot carry that credential in literal or common encoded forms. Internal wrong-profile and malformed-envelope failures remain covered by coordinator fault-injection tests because public clients cannot provide analyzer output. The ongoing production probes are `node scripts/check-runner-smoke.mjs https://seepoundcoffeepie.com`, `node scripts/check-runner-python-data-tools.mjs https://seepoundcoffeepie.com`, and, after publication, `node scripts/check-runner-cpp-collections.mjs https://seepoundcoffeepie.com`. Passing unit tests for the TypeScript contract proves only request validation and grading logic. It does not prove process isolation, sandbox cleanup, platform behavior, or production readiness.

A forward Practical C++ production runner release additionally requires `npm run prove:runner:cpp:staging` on the exact clean, remote, CI-passed commit. That guarded command starts from a paused staging checker, opens one enablement window for the fixed site, platform, project, C++, C#, Java, and Python Data Tools regression sequence, and always returns staging to paused in `finally`. It records a strict mode-0600 proof only under `.git` after the active Worker metadata and complete four-container snapshot remain unchanged. Production rejects a missing, malformed, unsuccessful, stale, different-commit, different-Worker, different-snapshot, or different-C++-digest proof, and repeats the live paused staging comparison immediately before mutation. Dry runs remain local and do not consume or require this evidence.
