# Phase 1 Learning Foundation Release

## Outcome

Phase 1 is complete. SeePoundCoffeePie now has one sequential beginner sector in each of its four language tracks:

- Python Flight School;
- C++ Engineering Corps;
- C# Command Academy;
- Java Systems Guild.

The release contains 24 playable missions and 120 authored exercises. Every track follows the same conceptual route while using language-appropriate syntax and original story details.

## Curriculum map

| Mission | Learning job | Exercise rhythm |
| --- | --- | --- |
| 1 | Program, console, output, text, numbers, variables, and supplied language framing | Gentle orientation and guided code edits |
| 2 | Booleans, comparisons, `if`, and `else` | Predict, explain, order, repair, apply |
| 3 | Lists or arrays and zero-based indexing | Retrieve, explain, predict, repair, apply |
| 4 | Loops and loop variables | Retrieve, explain, predict, assemble, apply |
| 5 | Reusable functions or methods, parameters, arguments, definitions, and calls | Retrieve, explain, predict, assemble, apply |
| 6 | Combine storage, decisions, collections, loops, and reusable code | Trace, plan, assemble, repair, complete a capstone |

The authored exercise inventory is:

- 24 explanation choices;
- 32 output predictions;
- 16 code-ordering exercises;
- 12 bug-repair exercises;
- 36 guided code exercises.

## Beginner protections

- Every exercise names one learning job and explains it before checking an answer.
- Shipboard analogies make abstract terms concrete without replacing the real programming definition.
- Editable exercises distinguish the learner's change from supplied scaffolding and explain unfamiliar code line by line.
- Wrong answers receive concept-specific feedback, do not consume lives, and return in an end-of-mission memory-repair round.
- Repaired answers strengthen review memory without awarding duplicate exercise XP.
- Mission completion and star shards are idempotent on replay.
- Ctrl+Enter or Command+Enter runs an editor check, while Tab remains normal browser navigation.
- Hints expose expanded state to assistive technology, focus states remain visible, and reduced motion is supported.
- Desktop, tablet, and 390-pixel mobile layouts are part of the release gate.

## Learning continuity

- Mission availability is ordered separately within every language track.
- The Practice Bay selects the completed mission covering the most concepts due in the active language and builds one exercise per due concept.
- The 44-term Codebook searches plain definitions, analogies, keywords, and active-language examples, revealing examples only after their introducing mission.
- The Cadet Record shows separate completion for all four stations and links directly back to each mission path.
- Daily goals can be changed between 5, 10, and 15 XP without locking lessons or removing progress.
- A versioned JSON backup preserves callsign, language, goals, XP, shards, streak, completed missions, and concept review state.
- Restore rejects malformed JSON, unknown missions or concepts, duplicate completions, invalid dates, unsafe counts, unsupported languages, and oversized files before changing local progress.

GitHub sign-in verifies identity only. It does not upload or synchronize learning data. This is stated in the interface beside both account and backup controls.

## Verification evidence

The final automated suite covers curriculum structure, exercise evaluation, mission locks, review scheduling, adaptive practice, memory repair, progress backup validation, React keyboard interactions, restore behavior, Worker security, and OAuth behavior.

Run the complete local gate with:

```bash
npm run check:release
```

The release gate requires:

- all Vitest files and tests pass;
- ESLint reports no issues;
- TypeScript and the Vite production build succeed;
- emitted JavaScript, CSS, and HTML remain inside the checked raw and gzip bundle budgets;
- `git diff --check` reports no whitespace errors;
- the repository contains no U+2014 em dash characters;
- a full Java route completes each newly authored mission in the browser;
- Mission 6 demonstrates wrong-answer feedback, memory repair, keyboard submission, and one-time rewards;
- the final mission, completion screen, station records, and backup controls remain usable at 390 CSS pixels;
- the production first lesson, mission locks, station records, and backup surface match the local release;
- `npm run check:live` passes for the apex domain, `www` redirect, security headers, and SPA fallback;
- local `main`, GitHub `main`, and the deployed checkpoint are verified after publication.

Automated checks do not prove that every story, explanation, or interaction feels right to a first-time learner. Structured beginner observation remains a separate product requirement.

## Honest execution boundary

The Phase 1 training simulator performs deterministic checks for constrained authored exercises. It does not execute arbitrary learner code and is not described as a compiler.

The first Phase 2 design milestone is complete in [the isolated runner security contract](RUNNER_SECURITY_CONTRACT.md). Production execution remains disabled until separate isolation, resource enforcement, privacy, abuse prevention, cleanup, and staging escape tests meet every documented gate.

## Next milestone

Phase 2 should implement the control API and one isolated Python runner in staging. It must use the existing version 1 request validator, server-owned toolchain commands, a network-denied one-use sandbox, host-enforced limits, short-lived authorized results, and a production kill switch. Java follows only after the Python isolation and cleanup evidence is repeatable.
