# Phase 4D Java Picnic Project Release

Release date: 2026-08-25

## Outcome

Phase 4D adds the first complete Java project after Java Foundations and completes the first guided-project pass across all four language schools. A learner can open `Community Picnic Planner`, move through 12 short checkpoints, and build a downloadable `Main.java` program that reads an organizer name, parses a guest count, chooses a table size, lists three supplies, and prints a final summary through a reusable static method.

The project starts before the learner is expected to understand Java vocabulary. It explains `.java` source, `javac`, `.class` bytecode, the JVM, `public class Main`, `public static void main(String[] args)`, case sensitivity, parentheses, brackets, braces, and semicolons before asking the learner to edit source.

The theme is a practical community picnic. Each stored value has a familiar purpose, and the completed program is small enough for a new learner to explain from the first import to the final method call.

## Learner path

The Java project follows this sequence:

1. Follow `Main.java` through `javac`, bytecode, and the JVM.
2. Display a welcome line with `System.out.println`.
3. Create a `Scanner` and read a complete organizer name.
4. Convert a complete line of digit text with `Integer.parseInt`.
5. Join stored values into a picnic summary with string concatenation.
6. Store Blankets, Cups, and Napkins in a `String[]`.
7. Choose a large or small table with `if` and `else`.
8. Visit every supply with an enhanced `for` loop.
9. Define and call `printPicnic` with typed parameters.
10. Retrieve the dependency order for the complete Java program.
11. Connect the prepared method and `main` workflow without fill-in blanks.
12. Build the complete picnic planner and pass changing organizer cases.

The project contains 10 editable Java checkpoints, one choice exercise, and one ordering exercise. Early checkpoints change one bounded part of supplied source. Later checkpoints write complete structures. The final two checkpoints assemble familiar pieces without hidden starter logic.

## Bookmarkable interface

The project overview is:

```text
/projects/java/picnic-planner
```

Each checkpoint has an exact route:

```text
/projects/java/picnic-planner/:checkpoint-id
```

The project appears in the guided-project catalog and after the Java course outline. A Java graduate sees it as the next step. A learner who has not completed Java Foundations can still inspect the outcome, vocabulary progression, checkpoint titles, and objectives before the editor unlocks.

The project reuses the open workshop layout. Explanation, vocabulary, task, editor, practice input, and console output retain distinct visual sizes and reading roles. On narrow screens, the split workspace becomes one readable sequence. The overview uses the Java coffee symbol, and the completed draft downloads as `Main.java` with a Java source MIME type.

The initial application bundle contains only the small public project manifest. Opening the route loads the complete Java teaching curriculum as its own chunk. Server assessment values and trusted compiler-tree facts never enter the browser build.

## Beginner-facing runtime guidance

The learner sees a deliberate distinction between source, compilation, and execution:

- `Main.java` is the readable source file;
- `javac` checks the source and produces `Main.class` bytecode;
- the JVM carries out that bytecode;
- `public class Main` is the required top-level program container;
- `public static void main(String[] args)` is the entry point where execution begins.

`Run` is an experiment with learner-supplied practice input. `Check checkpoint` is the official assessment with assignment-owned cases and structural requirements. Practice runs return no grading tests and cannot complete progress.

When compilation or execution fails, the workspace presents a short beginner-safe explanation and one concrete next action. The exact Java diagnostic remains available separately for learners who want the technical detail.

## Final-project assessment boundary

The final Community Picnic Planner uses:

- one visible case with `Alex Kim` and 10 guests;
- three server-owned cases covering one guest, seven guests, and the exact eight-guest large-table boundary;
- nine server-owned structural requirements.

The structural requirements verify:

1. the exact `java.util.Scanner` import;
2. one public `Main` class and one exact `main` entry point;
3. the `printPicnic` signature and concatenated method output;
4. one `Scanner scanner` created from `System.in` as the first statement;
5. the exact `supplies` array and item order;
6. both prompts, complete-line reads, and numeric parse shape;
7. the exact `guestCount >= 8` branch and both table messages;
8. the enhanced `for` loop and current-supply output;
9. the exact two-member class frame, nine-statement `main` order, and final method call.

Private cases, structural messages, and the reference solution live in `src/data/java-picnic-project.server.ts`. The public curriculum does not import that module. The browser bundle gate scans emitted JavaScript and CSS for private case identifiers, names, standard input, expected output, and raw or encoded reference source.

The pinned OpenJDK 21 compiler used for learner code also provides the trusted compiler tree used by `JavaProjectAnalyzer`. Before the first official project case runs, the analyzer parses and attributes the exact `/workspace/Main.java` source. It accepts only the deliberately small Java grammar taught by the project and returns a bounded JSON fact frame to the Worker coordinator.

The analyzer does not award credit from comments, Unicode escapes, alternate literals, additional imports or types, fields, constructors, initializer blocks, extra methods, overloads, alternate input methods, helper calls, casts, parenthesized substitutes, duplicate statements, moved statements, additional control flow, or early exits. Unsupported or malformed source fails closed. The coordinator validates every root key, fact key, occurrence, member position, statement position, identifier, type, text length, list bound, and analyzed-state invariant before evaluating a requirement.

Trusted Java facts are never included in the public runner result. A protected behavior failure returns only a generic hidden-case summary. It does not return private input, expected output, case identity, reference source, or hidden-case error text.

Every behavior case runs in a separate fresh Cloudflare Sandbox VM. Source, standard input, processes, memory, sockets, and files cannot cross between cases.

## Data and privacy boundary

The existing Phase 4 data boundary remains unchanged:

- source drafts stay in browser-local storage, keyed by project and checkpoint;
- official-check history stores only checkpoint ID, time, pass or fail, and check counts;
- synchronized progress stores only known completion identifiers and aggregate learning progress;
- source, standard input, console output, compiler messages, trusted facts, and raw answers never enter D1, backup JSON, or synchronization requests.

The learner record remains version 1. Java project and checkpoint identifiers are globally unique, so no D1 migration is required. Older records that omit project arrays still migrate to empty arrays.

## Verification contract

The local release gate must pass:

```bash
npm run check:release
npm run deploy:dry-run
npm run check:runner:image
```

The staging and production runner boundary must pass:

```bash
npm run check:runner:staging
npm run check:runner:project:staging
npm run check:runner:cpp-project:staging
npm run check:runner:csharp-project:staging
npm run check:runner:java-project:staging
npm run check:runner:production
npm run check:runner:project:production
npm run check:runner:cpp-project:production
npm run check:runner:csharp-project:production
npm run check:runner:java-project:production
npm run check:runner:smoke
```

Automated coverage includes:

- all 12 public checkpoints and the beginner-content schema;
- exactly 10 editable Java runner assignments;
- manifest lookup, route parsing, dynamic curriculum loading, and final deep links;
- catalog, course handoff, locked overview, unlocked editor, Java runner forwarding, and `Main.java` download behavior;
- one visible and three protected behavior cases;
- all nine trusted structural requirements;
- hardcoded visible output rejection;
- fail-closed coordinator parsing for missing, malformed, unexpected, oversized, or wrongly analyzed fact envelopes;
- fail-closed compiler-tree analysis for Unicode escapes, alternate imports, extra members, alternate expressions, control flow, moved statements, decoys, duplicates, and early exits;
- ordinary Java practice execution with an empty analysis sentinel;
- private case, reference solution, and trusted fact exclusion from public modules, assets, and results;
- Python, C++, and C# analyzer regression coverage;
- complete four-language container and isolation checks.

## Deployment and recovery

This release changes the Java runner image and Worker code. Keep new execution paused while deploying. Wait for the reviewed Java container image to report ready before opening the staging test window or restoring production execution.

No D1 migration or secret rotation is required. If Java structural grading fails while the rest of the academy remains healthy, disable the runner through `RUNNER_CONFIG`. Static lessons, project reading material, local drafts, downloads, accounts, and existing progress remain available while new live runs are paused.

Rollback restores the previous compatible Worker version and reviewed Java image. Do not delete the D1 database, rotate `LEARNER_DATA_SECRET`, or remove existing project completion arrays.

## Release evidence

Source, CI, staging, production, image, runner, route, and browser evidence will be appended here after every release gate passes.
