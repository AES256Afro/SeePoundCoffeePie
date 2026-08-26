# Phase 5B Practical C++ Collections and Records Plan

Status: planned and unpublished. This document reserves the curriculum contract for the next continuing course. It does not publish a catalog card, route, lesson, runner assignment, Practice item, Codebook example, sitemap entry, or learner progress identifier by itself.

## Current implementation checkpoint

The 2026-08-26 contract-lock checkpoint contains the complete unpublished TypeScript plan plus the first two fully authored modules:

- all 6 module IDs, 30 lesson IDs, concept links, exercise types, XP, prerequisites, exclusions, publication blockers, and final-assessment requirements are mechanically validated;
- Modules 1 and 2 provide 10 complete beginner lessons and 140 possible first-completion XP in the hidden teaching draft;
- the 4 editable Module 1 and 2 authentic solutions pass local C++20 syntax checks, while their public checks accept the taught repair and reject the supplied incorrect source;
- the course and first lesson URLs still return not found, no draft lesson receives a runner assignment, and the course ID and a unique teaching marker are forbidden from every emitted production browser asset;
- `npm run check:release` passed 50 test files and 564 tests, lint, repository text style, social-preview verification, TypeScript, the production build, the server-owned bundle boundary, and every bundle budget;
- production and staging Wrangler dry runs passed with their expected bindings, asset package, and all four existing container definitions. No deployment was performed;
- the emitted production asset measurements remain identical to Phase 5A because neither draft file is reachable from a production import graph.

This is local source and build evidence only. No Phase 5B progress compatibility floor, runner assignment, route, staging release, or production release exists yet.

## Outcome

Phase 5B adds `Practical C++: Collections and Records`, the academy's second C++ course and its second continuing course. It follows C++ Foundations and `Your First Compiled Program` without assuming any programming knowledge beyond those two completed prerequisites.

The learner outcome is concrete: build and explain a small Workshop Stock Report that keeps several part records in a growable collection, updates the original quantity for one part, calculates the total number of units, selects parts below a restock limit, and prints a readable report.

The course is deliberately a workshop and inventory story, not a spaceship or station story. The theme supports the code without becoming a layer the learner must decode.

The finished course contains:

- 6 ordered modules;
- exactly 30 authored lessons;
- 10 prediction exercises, 6 explanation choices, 2 ordering exercises, 6 bug repairs, and 6 guided code exercises;
- 12 runner-backed editable exercises;
- 420 possible first-completion XP, with 70 XP in each module;
- one final guided capstone using fixed in-memory workshop data;
- language-wide C++ Practice integration after a module is complete;
- 11 new or extended Codebook definitions with exact mission-based C++ example unlocks.

Normal replay, memory repair, and adaptive Practice remain zero-reward flows. Completing the same lesson or module again cannot award course XP or module shards twice.

## Course identity and prerequisite boundary

| Field | Reserved value |
| --- | --- |
| Course ID | `cpp-collections-records` |
| Course slug | `cpp-collections-records` |
| Runtime language | `cpp` |
| Course title | Practical C++: Collections and Records |
| Short name | Practical C++ |
| Kind | Continuing |
| Level | Beginner II |
| Symbol | Eye |
| Canonical course route | `/courses/cpp-collections-records` |
| Canonical lesson route | `/learn/cpp-collections-records/:module-id/:lesson-id` |
| Foundation prerequisite | `cpp-foundations` |
| Project prerequisite | `first-compiled-program` at `/projects/cpp/first-compiled-program` |

The two prerequisites are conjunctive. A learner may start Phase 5B only when both of these facts are true:

1. every module in C++ Foundations is complete;
2. `Your First Compiled Program` is complete.

Completing only one prerequisite must leave the course locked. The catalog card and locked course page may explain the outcome, preview all six module titles, and link to both prerequisites, but they must not open a lesson or award progress. A direct lesson URL must enforce the same requirements. After both prerequisites are complete, only Module 1 is initially available. Each later module still requires the previous Phase 5B module.

`CourseId` and `LanguageId` remain separate:

- `cpp-collections-records` owns the catalog record, prerequisite rules, routes, module IDs, lesson IDs, progress display, and completion state.
- `cpp` owns the C++20 runner, the language-wide Practice pool, Codebook language selection, and the learner's C++ preference.

The implementation must never send `cpp-collections-records` to the runner as a language and must not create a second C++ language track.

## Beginner-first teaching contract

Every lesson follows these rules:

1. Name the familiar idea being retrieved before introducing the new idea.
2. Define a new word or symbol in plain language before the learner must interpret or edit it.
3. Identify supplied scaffolding separately from the learner's one small change.
4. Explain what the compiler does with the relevant code shape, not only what text to type.
5. Keep the visible edit narrow. A code exercise normally asks for one or two expressions or statements, not an unbounded blank file.
6. Use a concrete workshop, shelf, form, or inventory analogy. Do not require story knowledge to solve the code.
7. Give specific wrong-answer feedback and a hint that reveals only the next useful step.
8. End with a recap written so it can be retrieved in a later lesson.
9. Explain every new punctuation shape, including angle brackets, the dot, braces, and the ampersand, before expecting recall.
10. Do not describe compiler errors as learner failure. A diagnostic is evidence that points toward a repair.

Editable lessons must include complete starter code, a focused edit boundary, at least three code-guide entries, one or more valid public checks, exact expected output, a useful hint, and a retrieval-ready recap. The code guide must explain the surrounding `#include`, function frame, types, braces, and semicolons when those elements first appear in the course.

## Vocabulary before use

The vocabulary sequence is an acceptance requirement, not a suggestion.

| First teaching point | Terms and symbols that must be defined | First later lesson that may require them |
| --- | --- | --- |
| Module 1, Lesson 1 | function definition, parameter, argument, call, and `void`, retrieved from C++ Foundations | Module 1, Lesson 2 |
| Module 1, Lesson 2 | return type, `return` statement, return value, caller, and the difference between returning and printing | Module 1, Lesson 3 |
| Module 2, Lesson 1 | fixed-size array, element, range-based loop, and loop variable, retrieved from C++ Foundations | Module 2, Lesson 2 |
| Module 2, Lesson 2 | `#include <vector>`, vector, growable collection, element type, angle brackets, dot operator, and member-function call shape | Module 2, Lesson 3 |
| Module 2, Lesson 3 | the specific `push_back` and `size` member functions, defined before the prediction question | Module 2, Lesson 4 |
| Module 3, Lesson 1 | type, `std::string`, `int`, declaration, and initialization, retrieved from earlier work | Module 3, Lesson 2 |
| Module 3, Lesson 2 | record, `struct`, field, and the braces used for aggregate initialization | Module 3, Lesson 3 |
| Module 4, Lesson 2 | copy, reference, original value, and the `&` symbol in a parameter and range-based loop | Module 4, Lesson 3 |
| Module 5, Lesson 2 | accumulator, initialize once, and the expanded update `total = total + part.quantity` | Module 5, Lesson 3 |
| Module 5, Lesson 5 | filter and result collection | The editable part of Module 5, Lesson 5 |
| Module 6, Lesson 2 | helper responsibility and data flow | Module 6, Lesson 3 |

The course may show a term in a non-editable explanation at its first teaching point. It may not place that term into a prediction, bug repair, guided blank, or required answer before the definition appears.

## Durable curriculum map

The following module, lesson, and concept identifiers are reserved now. They become durable learner-record identifiers when the course is released and must not be renamed afterward.

The exercise rhythm for Modules 1 through 4 is prediction, choice, prediction, bug repair, and guided code. The rhythm for Modules 5 and 6 is prediction, choice, ordering, bug repair, and guided code. Every module awards `8 + 10 + 14 + 16 + 22 = 70` XP.

### Module 1: Functions that return answers

Durable module ID: `cpp-records-return-values`

Learner capability: distinguish displaying a value from returning it, trace a returned result into an assignment, and write a small typed function that returns a calculation.

| # | Durable lesson ID | Proposed title | Type | Concept ID | XP | Teaching and retrieval purpose |
| ---: | --- | --- | --- | --- | ---: | --- |
| 1 | `cpprecords1-retrieve-call` | Trace a familiar function call | Prediction | `cpp-parameters-and-calls` | 8 | Retrieves the typed parameter and argument flow from `cpp-command-function` and `cpp-titan-forge`. |
| 2 | `cpprecords1-return-purpose` | Meet a returned answer | Choice | `cpp-return-values` | 10 | Defines a typed return value and contrasts `return` with `std::cout` and a `void` function. |
| 3 | `cpprecords1-predict-result` | Use a returned result | Prediction | `cpp-return-values` | 14 | Traces a returned integer into a variable before that variable is printed. |
| 4 | `cpprecords1-fix-return` | Repair the returned subtotal | Bug repair | `cpp-return-values` | 16 | Repairs a function that calculates the right subtotal but returns the wrong variable. |
| 5 | `cpprecords1-part-total` | Build a reusable part total | Guided code | `cpp-returned-calculations` | 22 | Returns `quantity * unit_cost` from one reusable typed function and proves two calls can produce different answers. |

### Module 2: Vectors that grow and change

Durable module ID: `cpp-records-vectors`

Learner capability: explain why a vector can grow after it is created, add same-type values with `push_back`, count them with `size`, and visit them with the familiar range-based loop.

| # | Durable lesson ID | Proposed title | Type | Concept ID | XP | Teaching and retrieval purpose |
| ---: | --- | --- | --- | --- | ---: | --- |
| 1 | `cpprecords2-retrieve-array` | Recall a fixed parts array | Prediction | `cpp-collections-and-indexes` | 8 | Retrieves a fixed C++ array, zero-based indexing, and a range-based loop. |
| 2 | `cpprecords2-vector-purpose` | Meet a growable collection | Choice | `cpp-vectors` | 10 | Defines the vector header, vector, element type, angle brackets, dot operator, member-function call shape, and fixed-versus-growable distinction. |
| 3 | `cpprecords2-predict-growth` | Follow a vector as it grows | Prediction | `cpp-vector-growth` | 14 | Defines and traces the dot, `push_back`, and `size` before the learner edits them. |
| 4 | `cpprecords2-fix-push-back` | Repair the vector update | Bug repair | `cpp-vector-growth` | 16 | Repairs a missing call shape while preserving the vector's element type and supplied output loop. |
| 5 | `cpprecords2-add-parts` | Add parts to a vector | Guided code | `cpp-vector-functions` | 22 | Completes two statements directly inside `main` that append supplied names, with no reference parameter before Module 4. |

### Module 3: Records with `struct`

Durable module ID: `cpp-records-structs`

Learner capability: explain why related values belong in one record, define a small `struct`, initialize one `Part`, and retrieve its fields with the dot operator.

| # | Durable lesson ID | Proposed title | Type | Concept ID | XP | Teaching and retrieval purpose |
| ---: | --- | --- | --- | --- | ---: | --- |
| 1 | `cpprecords3-retrieve-types` | Recall typed storage | Prediction | `cpp-variables` | 8 | Retrieves `std::string`, `int`, declarations, initialization, and the reason C++ records each value's type. |
| 2 | `cpprecords3-struct-purpose` | Meet a record shape | Choice | `cpp-structs` | 10 | Defines a record, `struct`, field, and aggregate initialization before any field edit. |
| 3 | `cpprecords3-predict-fields` | Read a part record | Prediction | `cpp-struct-fields` | 14 | Traces `part.name` and `part.quantity` from one initialized `Part`. |
| 4 | `cpprecords3-fix-field-access` | Repair the field name | Bug repair | `cpp-struct-fields` | 16 | Corrects one field access while preserving the supplied `struct` and record value. |
| 5 | `cpprecords3-build-part-record` | Build and store a part record | Guided code | `cpp-record-construction` | 22 | Creates one `Part` and appends it to a vector, retrieving `cpp-vector-growth` without using a reference. |

### Module 4: Updating Stored Records

Durable module ID: `cpp-records-updates`

Learner capability: distinguish a copied loop value from a reference to the original record and write a small function that updates the matching `Part` in a vector.

| # | Durable lesson ID | Proposed title | Type | Concept ID | XP | Teaching and retrieval purpose |
| ---: | --- | --- | --- | --- | ---: | --- |
| 1 | `cpprecords4-retrieve-vector-loop` | Recall a vector loop | Prediction | `cpp-vector-functions` | 8 | Retrieves vectors, records, field access, and a read-only range-based loop without requiring reference syntax yet. |
| 2 | `cpprecords4-reference-purpose` | Meet a reference | Choice | `cpp-references` | 10 | Defines copy versus original, the `&` symbol, a reference parameter, and a reference loop variable. |
| 3 | `cpprecords4-predict-update` | Follow an original record update | Prediction | `cpp-reference-updates` | 14 | Traces an update made through `Part& part` and shows the changed quantity after the loop. |
| 4 | `cpprecords4-fix-copy-update` | Repair the copy mistake | Bug repair | `cpp-reference-updates` | 16 | Adds the missing `&` to a loop variable so the original vector record changes instead of only a temporary copy. |
| 5 | `cpprecords4-restock-part` | Restock a named part | Guided code | `cpp-record-updates` | 22 | Introduces `std::vector<Part>&` only after `Part&` is explained, then completes the matching condition and quantity update inside the supplied function. |

### Module 5: Totals and low-stock filters

Durable module ID: `cpp-records-summaries`

Learner capability: calculate one total across record fields and return a vector containing only the names whose quantities satisfy a low-stock condition.

| # | Durable lesson ID | Proposed title | Type | Concept ID | XP | Teaching and retrieval purpose |
| ---: | --- | --- | --- | --- | ---: | --- |
| 1 | `cpprecords5-retrieve-return` | Recall a returned calculation | Prediction | `cpp-returned-calculations` | 8 | Retrieves a returned integer from Module 1 and record-field access from Module 3. |
| 2 | `cpprecords5-accumulator-purpose` | Meet a running total | Choice | `cpp-accumulators` | 10 | Defines an accumulator, initialization before a loop, and updating during each pass. |
| 3 | `cpprecords5-order-total` | Put the total in order | Ordering | `cpp-record-aggregation` | 14 | Orders function header, accumulator, loop, expanded update, closing brace, and return into one coherent data flow. |
| 4 | `cpprecords5-fix-total-reset` | Keep the total between passes | Bug repair | `cpp-record-aggregation` | 16 | Moves a total initialization out of the loop so earlier quantities are not erased. |
| 5 | `cpprecords5-low-stock` | Collect low-stock names | Guided code | `cpp-filtering-records` | 22 | Completes a below-limit condition and `push_back` call in a function that returns a vector of matching names. |

### Module 6: Workshop Stock Report capstone

Durable module ID: `cpp-records-workshop-report`

Learner capability: plan, trace, repair, assemble, and check one complete in-memory C++ data tool made only from already taught structures.

| # | Durable lesson ID | Proposed title | Type | Concept ID | XP | Teaching and retrieval purpose |
| ---: | --- | --- | --- | --- | ---: | --- |
| 1 | `cpprecords6-trace-stock-update` | Trace a stock update | Prediction | `cpp-record-updates` | 8 | Retrieves the matching reference update from Module 4 before the capstone depends on it. |
| 2 | `cpprecords6-plan-report` | Assign each report job | Choice | `cpp-program-planning` | 10 | Retrieves the foundation planning idea and assigns storage, update, total, filter, and reporting responsibilities. |
| 3 | `cpprecords6-order-report` | Put the report flow in order | Ordering | `cpp-record-tool-assembly` | 14 | Orders record definition, helper definitions, collection creation, update, calculation, and output. |
| 4 | `cpprecords6-fix-low-stock-check` | Repair the low-stock boundary | Bug repair | `cpp-record-tool-debugging` | 16 | Repairs a reversed comparison and explains how equality follows the authored below-limit rule. |
| 5 | `cpprecords6-workshop-stock-report` | Build the Workshop Stock Report | Guided code | `cpp-record-tool-capstone` | 22 | Fills five explicit statements or expressions in the final supplied program and passes public behavior plus protected structural checks. |

## Exercise and XP totals

| Exercise type | Count | XP positions |
| --- | ---: | --- |
| Prediction | 10 | first lesson in every module and third lesson in Modules 1 through 4 |
| Choice | 6 | second lesson in every module |
| Ordering | 2 | third lesson in Modules 5 and 6 |
| Bug repair | 6 | fourth lesson in every module |
| Guided code | 6 | fifth lesson in every module |
| Total | 30 | 420 XP |

Every module uses the same XP pattern: 8, 10, 14, 16, and 22. The final course total is exactly 420 XP. Module completion keeps the existing one-time 25 star-shard award and existing replay semantics.

## Intentional exclusions

Phase 5B does not teach or require:

- raw pointers, `new`, `delete`, manual memory management, ownership, or smart pointers;
- pointer arithmetic, pointer and address expressions, C-style arrays beyond retrieval, C strings, or manual buffer management;
- `auto` type deduction, explicit iterators, iterator invalidation, algorithms from `<algorithm>`, ranges, views, or lambdas;
- custom template definitions beyond reading the supplied element type inside `std::vector<Part>` and `std::vector<std::string>`;
- `using namespace` directives, `const` references, compound assignment, move semantics, copy constructors, destructors, operator overloading, classes, inheritance, virtual functions, or header/source file separation;
- constructors or methods declared on a `struct`;
- exceptions, file input and output, package managers, build systems, third-party libraries, databases, APIs, or networking;
- sorting, maps, sets, nested vectors, recursion, or performance tuning;
- unbounded project input or a counted input loop.

Some of these are valuable later. They are deferred so references, records, and one growable collection can land gently. Read-only helper functions in this course accept the small fixed vector by value. The lesson explains that this makes a copy and is a deliberate beginner-sized tradeoff. A later course can introduce `const` references and explain how production C++ expresses read-only intent without copying.

## Final Workshop Stock Report contract

The final assignment is `cpprecords6-workshop-stock-report`. It has no standard input and uses only the fixed in-memory parts shown in the lesson. This avoids mixing a new counted-input protocol into the same lesson as records, vector updates, totals, and filtering.

The authored starter frame is:

```cpp
#include <iostream>
#include <string>
#include <vector>

struct Part {
    std::string name;
    int quantity;
};

void restock(std::vector<Part>& parts, std::string name, int amount) {
    for (Part& part : parts) {
        if (part.name == name) {
            _____
        }
    }
}

int total_units(std::vector<Part> parts) {
    int total = 0;
    for (Part part : parts) {
        _____
    }
    return total;
}

std::vector<std::string> low_stock(std::vector<Part> parts, int limit) {
    std::vector<std::string> names;
    for (Part part : parts) {
        if (_____) {
            _____
        }
    }
    return names;
}

int main() {
    std::vector<Part> parts = {
        {"bolts", 4},
        {"seals", 2},
        {"cables", 7}
    };

    restock(parts, "bolts", 3);
    restock(parts, "cables", 1);

    std::cout << "Parts: " << parts.size() << "\n";
    std::cout << "Total units: " << _____ << "\n";
    for (std::string name : low_stock(parts, 3)) {
        std::cout << "Low stock: " << name << "\n";
    }
    return 0;
}
```

The five learner edits are:

1. `part.quantity = part.quantity + amount;`
2. `total = total + part.quantity;`
3. `part.quantity < limit`
4. `names.push_back(part.name);`
5. `total_units(parts)`

Its exact visible output is:

```text
Parts: 3
Total units: 17
Low stock: seals
```

The public lesson checks those five stated edits and the exact visible output. Public regular-expression checks are guidance only. They are not sufficient to award the protected capstone completion.

## Runner assignment and assessment plan

Choice, prediction, and ordering exercises remain deterministic browser interactions because they do not execute source. The six bug repairs and six guided code lessons register with the existing isolated `cpp` runner.

| Runner assignment | Expected visible output | Assessment mode |
| --- | --- | --- |
| `cpprecords1-fix-return` | `12` | Public source checks plus exact output |
| `cpprecords1-part-total` | `12` then `10` | Public source checks plus exact output |
| `cpprecords2-fix-push-back` | `bolts` then `seals` | Public source checks plus exact output |
| `cpprecords2-add-parts` | count `3`, then `bolts`, `seals`, and `cables` | Public source checks plus exact output |
| `cpprecords3-fix-field-access` | `bolts` | Public source checks plus exact output |
| `cpprecords3-build-part-record` | `bolts: 4` | Public source checks plus exact output |
| `cpprecords4-fix-copy-update` | `bolts: 7` | Public source checks plus exact output |
| `cpprecords4-restock-part` | `seals: 5` | Public source checks plus exact output |
| `cpprecords5-fix-total-reset` | `14` | Public source checks plus exact output |
| `cpprecords5-low-stock` | `seals` then `clips` | Public source checks plus exact output |
| `cpprecords6-fix-low-stock-check` | `Low stock: seals` | Public source checks plus exact output |
| `cpprecords6-workshop-stock-report` | exact three-line final report | Public five-edit checks, exact output, and server-owned structural assessment |

After Phase 5B, the runner registry contains exactly 112 editable assignments:

```text
48 foundation lesson assignments
12 Practical Python lesson assignments
12 Practical C++ lesson assignments
40 guided-project checkpoint assignments
112 total assignments
```

The final assignment uses the server-owned assessment profile `cpp-collections-records-workshop-report-v1`. This requires a new dedicated analyzer rather than broadening the existing Phase 4B C++ project grammar in `runner/supervisor.py`.

The proposed analyzer boundary is:

- Install `CppCollectionsAnalyzer.py` only in `Dockerfile.runner.cpp` with root-only mode `0500`.
- Invoke it through the fixed trusted command `/usr/bin/python3 -I -B /opt/runner/CppCollectionsAnalyzer.py /workspace/source.txt` with a 5-second trusted-analyzer timeout.
- Have the analyzer invoke the pinned Clang 14 front end with a fixed server-owned argument list and parse the exact unchanged source bytes. It must not run learner code.
- Accept UTF-8 source only and enforce source-size, AST-node, AST-depth, output-size, and command-time bounds.
- Select the profile and command from server assignment policy. The request must never select an analyzer, command, profile, compiler flag, or expected result.
- Return one exact-key internal envelope containing `version`, `profile`, `analyzed`, `parsed`, and six Boolean facts: `authored_frame`, `part_record`, `restock`, `total_units`, `low_stock`, and `supplied_harness`.
- Treat missing output, malformed JSON, extra keys, a wrong profile, timeout, command failure, an oversized envelope, or `analyzed: false` as `system_error` so infrastructure failure is not blamed on the learner.
- Treat a valid `parsed: false` envelope as no structural credit while still allowing ordinary compiler behavior to explain syntax errors.
- Keep the profile, analyzer command, AST facts, internal diagnostic text, hidden expectations, and analyzer output out of the browser bundle and public runner result.

Protected grading verifies:

1. the three approved headers, one `Part` record, three taught helper functions, and one `main` function remain in the taught order;
2. `Part` has exactly the taught `std::string name` and `int quantity` fields;
3. `restock` receives the vector by reference, loops over `Part&`, matches `part.name` to `name`, and increases the matching quantity by `amount`;
4. `total_units` initializes one accumulator before the loop, adds each `part.quantity`, and returns the total after the loop;
5. `low_stock` initializes one names vector, uses the below-limit condition, pushes `part.name`, and returns after the loop;
6. the three supplied records, two restock calls, three report stages, and `return 0` remain unchanged and reachable.

The analyzer rejects hardcoded-only output, added or moved harness statements, duplicate decoys, renamed aliases, macros, pragmas, additional functions, unsupported control flow, unreachable required code, malformed source, and source-encoding disagreement. Comments and formatting may vary within explicit bounds. Authentic source must pass both the pinned g++ C++20 execution and the independent Clang-based structural facts.

The existing C++ Observation Desk analyzer and all Python, C#, and Java analyzers remain unchanged. Image tests must prove language separation, trusted invocation, learner read and execute denial, file mode, network denial, resource ceilings, output bounds, and cleanup.

## Practice integration

C++ Practice becomes course-aware and language-wide. When a C++ Practice page or session opens, it lazily combines C++ Foundations missions with completed eligible Practical C++ missions, then applies the existing rules:

- only completed modules are eligible;
- at most five unique authored exercises appear in one session;
- at most two exercises come from one module;
- duplicate exercise IDs and duplicate concept IDs remain excluded;
- due concepts come first, weaker concepts follow, and a familiar item may fill a refresh slot;
- unfinished Phase 5B modules, project checkpoints, non-C++ content, unknown IDs, and malformed stored sessions remain excluded;
- a stored session resolves only if every referenced exercise is still eligible;
- Practice updates concept strength and review timing but awards no XP, daily XP, shards, lesson completion, module completion, course completion, or project completion.

The full Phase 5B teaching copy must load only when a C++ Practice route needs it. Opening the landing page, home, catalog, a Python course, or a different language's Practice page must not fetch the C++ teaching-content chunk.

## Codebook integration

Definitions remain searchable before their examples unlock. A C++ example unlocks only after the exact introducing Phase 5B mission completes.

| Codebook term | Change | C++ example unlock |
| --- | --- | --- |
| Return value | Add a C++ example to the existing definition | `cpp-records-return-values` |
| Vector | Add a definition and C++ example | `cpp-records-vectors` |
| Element type | Add a definition and C++ example | `cpp-records-vectors` |
| Member function | Add a definition and C++ example using `push_back` | `cpp-records-vectors` |
| Length | Add a C++ `.size()` example to the existing definition | `cpp-records-vectors` |
| Record | Add a definition and C++ example | `cpp-records-structs` |
| Struct | Add a definition and C++ example | `cpp-records-structs` |
| Field | Add a definition and C++ example | `cpp-records-structs` |
| Reference | Add a definition and C++ example | `cpp-records-updates` |
| Accumulator | Add a C++ example to the existing definition | `cpp-records-summaries` |
| Filter | Add a C++ example to the existing definition | `cpp-records-summaries` |

The current single `unlockAfterMissionId` field cannot correctly represent a Python example and a C++ example introduced by different continuing courses. Phase 5B must add a language-specific form such as:

```ts
unlockAfterMissionIds?: Partial<Record<LanguageId, string>>
```

`codebookExampleState` must resolve the current language's exact mission ID first and preserve the existing ordinal `unlockAfter` behavior for foundation entries. Existing Practical Python entries should migrate to `{ python: missionId }` in the same tested change. Completing a Python mission must not unlock a C++ example, and completing a C++ foundation module at the same ordinal position must not unlock a continuing-course example.

## Progress and compatibility plan

The data shape does not change. `LearnerProgress`, synchronized record version 1, backup version 1, and the D1 table can remain at their current versions. No D1 migration, binding change, secret rotation, or account reset is required.

The known-ID closures must add all 6 module IDs, 30 lesson IDs, and the new concept IDs to:

- tolerant local recovery;
- strict backup parsing;
- strict Worker and synchronization parsing;
- module-to-lesson closure;
- cross-device merge and canonical comparison;
- course ownership and route validation;
- one-time XP and module completion logic.

Phase 5B should advance browser persistence to V3 because a currently open Phase 5A tab already reads and writes the V2 keys but does not understand the new Phase 5B identifiers:

```text
see-pound-coffee-pie-progress-v3
see-pound-coffee-pie-completed-lessons-v3
```

The Phase 5B client reads V3 first, falls back to V2 and then earlier legacy keys when V3 is absent, and writes the validated record and completion journal to V3 and the rolling compatibility keys. V3 remains authoritative. An older Phase 5A tab may change V2, but it cannot overwrite a valid V3 record on reload. Reset deliberately writes an empty validated record to every supported generation.

Before any Phase 5B lesson can save progress, staging and production Workers must be deployed at a recorded compatibility floor that recognizes and preserves every Phase 5B ID. A pre-floor Worker can reject or omit those IDs during strict synchronization. Once Phase 5B progress writes are possible, neither environment may roll back below its recorded compatibility floor.

Compatibility tests must cover:

- V3 priority over V2 and legacy data;
- V2 and legacy fallback when V3 is absent;
- rolling writes without allowing an older key to erase V3;
- tolerant filtering of unknown local IDs while preserving known values;
- strict rejection of unknown or duplicate backup and remote IDs;
- recovery of all 5 lesson IDs when a completed Phase 5B module is present;
- one-time XP, daily XP, shards, streaks, review state, reset, replay, memory repair, and resume;
- cross-device union of all Phase 5B IDs and concepts;
- a version 1 backup round trip containing completed Phase 5B work.

## Privacy contract

Phase 5B adds curriculum and runner policy, not a new category of learner data.

- Store lesson, module, project, XP, shard, streak, and concept-review identifiers only through the existing learner progress record.
- Do not store source, standard input, compiler output, public-check details, analyzer facts, or raw answers in progress, project history, backups, D1, Practice session history, or analytics.
- Keep code in the browser editor and the one-use runner lifecycle only. Source and standard input expire with the queued run and its 15-minute result window.
- Keep operational logs limited to opaque run ID, language, assignment, outcome, timing, resource phase, cleanup state, and coarse byte counts. Do not log source or full compiler output.
- Preserve same-origin short-lived grants, learner-scoped result reads, per-user and per-IP quotas, queue backpressure, network denial, fresh isolation, and the production kill switch.
- Do not add third-party analytics, advertising identifiers, social profiles, public learner comparisons, cooperative editing, or leaderboards as part of this phase.
- Do not expose the server-owned profile, analyzer source, AST envelope, hidden policy, internal paths, container identifiers, or secret-bearing environment variables to the browser.

Any future cooperative learning work remains blocked on a separate privacy, child-safety, and moderation review.

## Route, interface, and accessibility contract

Phase 5B uses the open workshop design already established for the catalog, outline, and lesson workspace. It should feel like a clear page, not a dense dashboard or a stack of equal-size cards.

Required route behavior:

- `/courses/cpp-collections-records` is canonical, bookmarkable, refresh-safe, and history-safe after release.
- Every lesson has one canonical route containing the course, module, and lesson IDs.
- Unknown course, module, lesson, extra segment, malformed escape, query-bearing lesson, or mismatched owner returns the normal not-found experience.
- Locked direct lesson routes show the lesson title, both missing prerequisites when relevant, and links to the required steps. They never render an editor.
- A bookmarked C++ course or lesson supplies page context without silently replacing the saved language preference.
- Document title, main heading, and focus update after every route transition, including Back and Forward navigation.

Implementation should extract or reuse the existing continuing-course outline behavior instead of copying a second large module component. The released Practical Python route must retain parity through tests before the shared component is used for C++. Continuing-course styling should be shared as one lazy asset, not copied into initial CSS or emitted twice.

Accessibility gates:

- One visible `h1` and one focused main heading after navigation.
- Native links for navigation and native buttons for disclosure and completion actions.
- `aria-expanded`, `aria-controls`, progressbar values, live status updates, and lock explanations remain accurate.
- Completion, current state, lock state, compiler outcome, and error state are never communicated by color alone.
- Every interactive target remains at least 44 CSS pixels in its smaller dimension.
- Keyboard learners can open modules, answer fixed-response exercises, edit code, run or check with Control+Enter or Command+Enter, leave the editor with Tab, reveal a hint, and return to the course.
- Visible focus, reduced-motion behavior, zoom to 200 percent, high-contrast text, and screen-reader reading order remain intact.
- At 390 CSS pixels, the course and lesson become one readable column with no clipped text, overlapping controls, or horizontal document overflow. The code editor may scroll internally for long C++ lines, but the document may not.
- Beginner compiler guidance stays visible before sanitized raw diagnostics, and both are associated with the run result.

## Lazy loading and bundle budgets

The Phase 5A release measured 470.49 kB raw and 127.80 kB gzip initial JavaScript, 72.37 kB raw and 13.46 kB gzip initial CSS, 758.19 kB raw and 212.98 kB gzip total JavaScript, and 85.22 kB raw and 16.45 kB gzip total CSS. Initial CSS and total JavaScript already have little headroom.

Phase 5B therefore requires these boundaries:

1. Keep only the compact Phase 5B manifest and course registry metadata in the initial application.
2. Put the course and lesson route shell in one lazy continuing-course route asset.
3. Put all 30 lessons of teaching copy in a separate lazy content asset.
4. Reuse one lazy continuing-course CSS asset across Practical Python and Practical C++.
5. Keep Codebook data on its existing lazy route.
6. Load the full Phase 5B course for C++ Practice only when that Practice route opens.
7. Keep every server assessment, profile, structural message, analyzer command, and trusted fact out of all browser assets.

Provisional hard caps for implementation are:

| Asset scope | Raw limit | Gzip limit |
| --- | ---: | ---: |
| Initial JavaScript | 485.00 kB | 132.00 kB |
| Initial CSS | 72.50 kB | 13.50 kB |
| Practical C++ route JavaScript | 11.00 kB | 4.00 kB |
| Practical C++ teaching content | 54.00 kB | 15.00 kB |
| Shared continuing-course CSS | 10.00 kB | 2.20 kB |
| Codebook route JavaScript | 38.00 kB | 12.00 kB |
| Total JavaScript | 835.00 kB | 240.00 kB |
| Total CSS | 87.00 kB | 17.50 kB |

The initial limits and total CSS limit do not move. The higher total JavaScript and Codebook limits are provisional ceilings for one complete reviewed course, not permission to add unrelated code. Record actual clean-build measurements before release. If an asset exceeds its cap, split or simplify it. Do not raise a cap automatically.

The bundle gate must assert exactly one matching route asset, one teaching-content asset, and one shared continuing-course CSS asset. It must also prove that the server-owned assessment strings and profile do not appear anywhere in `dist`.

## Staged implementation slices

### Slice 0: Contract lock

- Land this plan and an unpublished TypeScript manifest contract.
- Reserve all IDs, type order, concept links, XP, prerequisites, exclusions, and final output.
- Validate exact counts, uniqueness, repository-wide collisions, and the U+2014 exclusion.
- Do not import the unpublished manifest into the public course registry.

### Slice 1: Progress compatibility floor

- Add the compact manifest to progress, backup, synchronization, ownership, and closure code.
- Add V3 local keys with V2 and legacy fallback and rolling compatibility writes.
- Add strict and tolerant parser, merge, reset, replay, and older-tab tests.
- Publish a compatibility-only release after review. It includes the unchanged visible academy, V3 browser persistence, and the compatible Worker allowlists together because the normal deployment publishes `dist` with the Worker. Keep the course absent from routes, catalog, Practice, Codebook, runner assignments, sitemap, and production assets.
- Record staging and production Phase 5B Worker compatibility-floor versions.

### Slice 2: Modules 1 and 2 vertical slice

- Author the first 10 lessons with complete beginner support.
- Register the 4 editable assignments in test fixtures, not the public runner registry.
- Compile and run every editable authentic solution locally through the pinned C++20 command.
- Test return-value vocabulary before use, vector syntax before use, exact XP, and manifest parity.
- Keep the content unreachable from public application routes.

### Slice 3: Modules 3 and 4 vertical slice

- Author the next 10 lessons.
- Add record, struct, field, copy, and reference teaching in the specified order.
- Register and verify the next 4 editable assignments in unpublished fixtures.
- Add compiler-diagnostic cases for whole-record output and copy-versus-reference updates.
- Run retrieval, readability, keyboard, and 390-pixel local checks on the internal route harness.

### Slice 4: Modules 5 and 6 plus protected assessment

- Author the final 10 lessons and lock the exact capstone starter, five edits, and output.
- Add the final 4 editable assignments.
- Implement the dedicated analyzer, exact protocol, server-owned checks, coordinator wiring, image placement, and adversarial suite.
- Prove authentic source passes and hardcoded, commented, unreachable, aliased, moved-harness, malformed, and encoding-confused sources fail without leaking internal facts.
- Update the runner count contract from 100 to 112.

### Slice 5: Product integration behind the release boundary

- Add the `CourseId`, course definition, conjunctive prerequisites, strict route ownership, lazy route, and lazy content boundaries.
- Generalize the continuing-course outline while preserving Practical Python behavior.
- Add C++ Practice aggregation and exact Codebook unlocks.
- Add catalog, home continuation, profile, backup, route, sitemap, live-check, and bundle tests.
- Keep production publication disabled until every local release gate and manual learner check passes.

### Slice 6: Controlled release

- Publish a compatibility-safe final content commit and require hosted CI on that exact commit.
- Deploy to staging with the runner disabled, verify static routes and records, then open a controlled runner window.
- Complete the full learner walkthrough on desktop and 390-pixel layouts.
- Review commit, Worker version, C++ image digest, automated evidence, and manual notes together.
- Deploy the exact staging-reviewed commit and image to production through the existing kill-switch procedure.
- Record release evidence in a separate `PHASE_5B_RELEASE.md` only after production verification.

## No-public-exposure policy

Phase 5B must not appear to a production visitor until the complete course passes every release gate.

During Slices 0 through 4:

- keep the manifest explicitly unpublished;
- do not add the course to `courseDefinitions` or `CourseId` in production-facing code;
- do not register course or lesson routes;
- do not add a catalog card, home recommendation, sitemap URL, metadata, or social preview claim;
- do not add its lessons to Practice, Codebook example state, or public runner assignments;
- make a guessed production course or lesson URL return not found;
- do not deploy teaching-content chunks or the protected analyzer to production.

A compatibility-floor Worker may recognize the reserved progress identifiers before content release, but it must not expose the course or accept its runner assignments. That narrow deployment exists only to preserve future writes safely.

After all local gates pass, staging may expose the complete course for controlled QA. Staging execution stays disabled except during the documented test window. Production publication is one reviewed release of the complete catalog card, route, 30 lessons, Practice integration, Codebook examples, runner assignments, analyzer image, sitemap entry, and live checks. There is no public `coming soon` card and no partially populated course.

## Automated verification gates

The final implementation must pass:

```bash
npm run check:release
npm run deploy:dry-run
npm run deploy:staging:dry-run
npm run check:runner:image
git diff --check
```

The release gate must cover:

- exact course ID, runtime language, route, both prerequisites, six modules, 30 lessons, and global ID uniqueness;
- exact exercise mix, exact per-module XP, exact 420 course XP, and compact manifest parity;
- explanation, analogy, prompt, code guide, focused edit, valid public checks, expected output, hint, and recap quality floors;
- the vocabulary-before-use table and intentional-exclusion scan;
- neither prerequisite, either prerequisite alone, both prerequisites, ordered modules, and recorded-but-currently-locked lessons;
- canonical course and lesson routes, malformed routes, mismatched ownership, direct refresh, bookmark, Back, and Forward behavior;
- one-time XP and shards, module closure recovery, replay, memory repair, reset, resume, and course completion;
- V3 priority, V2 and legacy fallback, rolling writes, strict and tolerant parsing, backup version 1, remote version 1, and cross-device union;
- C++ Practice aggregation, completed-module eligibility, deterministic bounds, stored-session recovery, and zero rewards;
- all 11 Codebook changes, language-specific unlocks, and Practical Python and foundation regressions;
- exactly 112 runner assignments and all 12 Phase 5B lookups;
- all 12 authentic editable solutions through the fixed C++20 runner policy;
- exact capstone starter, five public edits, exact visible output, six protected facts, protocol failures, and adversarial rejection;
- analyzer root-only mode, language separation, browser-bundle privacy, network denial, resource ceilings, output bounds, and cleanup;
- every existing foundation, project, Practical Python, authentication, progress, Practice, Codebook, portfolio, route, runner, and analyzer regression;
- exact lazy assets and raw and gzip budgets;
- repository-wide text style, including no Unicode U+2014.

Add dedicated controlled probes:

```text
npm run check:runner:cpp-collections:staging
npm run check:runner:cpp-collections:production
```

The probe must reject hardcoded output, comment-only decoys, unreachable required code, behavior aliases, moved harness statements, malformed source, wrong profiles, and malformed analyzer envelopes while accepting the exact authentic solution. It must assert that no profile or structural fact appears in the response.

Passing TypeScript, unit tests, or a production build does not prove the runner image, Cloudflare Sandbox isolation, browser interaction, mobile layout, accessibility, deployed Worker compatibility, or live progress safety. Those remain separate gates.

## Manual learner QA

Run the complete checklist in a clean browser profile and again with a realistic existing learner record.

### Discovery and prerequisites

- Confirm production has four foundation courses and two continuing courses only after the complete release.
- With neither prerequisite complete, confirm the Practical C++ card and outline name both requirements and keep every lesson locked.
- Complete only C++ Foundations and confirm the compiled-project requirement remains visible.
- Complete only `Your First Compiled Program` in a prepared record and confirm C++ Foundations remains visible.
- Complete both and confirm Module 1 opens without changing the active runtime language away from C++.
- Open the first, middle, and final direct lesson URLs before and after prerequisites. Confirm they fail closed while locked and open exactly after unlock.
- Confirm an unknown or mismatched module and lesson pair returns not found.

### Course flow and beginner comprehension

- Complete all 30 lessons in order.
- Ask a first-time learner to explain `return`, vector angle brackets, `push_back`, record, field, copy, reference, `&`, accumulator, and filter before the first editable use of each term.
- Confirm supplied scaffolding and the learner's edit are visually and verbally distinct.
- Run and check all 12 editable exercises against the deployed isolated C++ runner.
- Confirm the first compiler error for each new shape has beginner guidance plus sanitized raw diagnostics.
- Confirm a wrong answer gives specific feedback and the hint reveals only the next useful step.
- Exit and refresh after a credited lesson. Confirm resume selects the first unfinished lesson.
- Finish each fifth lesson and confirm only the next module unlocks.
- Confirm exactly 420 first-completion XP and one module reward per module. Replay lessons, modules, memory repair, and Practice, then confirm no duplicate rewards.
- Complete the final Workshop Stock Report and confirm the exact three-line output plus all protected checks.
- Submit hardcoded output, comments, unreachable code, renamed aliases, extra helper functions, moved harness statements, and malformed source. Confirm none earns completion or exposes analyzer information.

### Practice, Codebook, and persistence

- Before a Phase 5B module completes, confirm C++ Practice contains only eligible C++ Foundations work.
- Complete one Phase 5B module and confirm its concepts can join C++ Practice while the next unfinished module remains excluded.
- Confirm one Practice set contains at most five items and at most two from one module, remains C++ only, and awards no rewards.
- Confirm all 11 definitions are searchable and each C++ example remains locked until its exact introducing mission completes.
- Confirm Python examples retain their existing exact unlock behavior.
- Refresh, close and reopen, export and restore a version 1 backup, and merge two test devices. Confirm every known Phase 5B lesson, module, concept, XP, and review value survives.
- Keep a Phase 5A application tab open during a V3 test. Save from that older tab, reload the Phase 5B client, and confirm authoritative Phase 5B progress is not erased.

### Routes, layout, and accessibility

- Open, refresh, bookmark, and use Back and Forward on the course route and representative first, middle, and final lesson routes.
- Confirm titles, heading focus, URL, and selected navigation context stay synchronized.
- At desktop width, confirm the prerequisite panel, module rows, lesson rows, editor, output, actions, hint, and feedback use a clear visual hierarchy.
- At 390 CSS pixels and 200 percent zoom, confirm one readable column, internal editor scrolling, and no document-level horizontal overflow.
- Complete representative fixed-response and code lessons using keyboard only.
- Confirm visible focus, reduced motion, screen-reader status announcements, semantic lock text, and contrast.
- Confirm browser console and network panel contain no route errors, repeated content loads, source logging, analyzer strings, or unexpected third-party requests.

## Staging and production gates

Before staging content:

1. Confirm the staging Worker is at or above the recorded Phase 5B compatibility floor.
2. Confirm the final source commit is clean, published to `main`, and passed hosted CI on that exact SHA.
3. Disable staging runner execution through the existing `RUNNER_CONFIG` binding.
4. Deploy the final Worker and reviewed C++ image from the same commit.
5. Verify static routes, progress compatibility, lazy assets, desktop, and 390-pixel behavior while execution remains paused.
6. Open one controlled runner window and run the platform, all four project, Practical Python, new Practical C++, and smoke suites.
7. Return staging to disabled and review the commit, Worker version, image digest, automated output, and learner notes together.

Before production content:

1. Confirm production is healthy and at or above its Phase 5B compatibility floor.
2. Confirm the exact staging-reviewed commit and C++ image digest are selected.
3. Disable production runner execution while leaving static lessons, accounts, progress, Practice, Codebook, portfolios, and drafts available.
4. Deploy and wait for all four container applications to report ready.
5. Run live route, security-header, sitemap, lazy-asset, desktop, 390-pixel, focus, console, and overflow checks while execution remains paused.
6. Open one controlled runner window and run the complete platform, project, Practical Python, Practical C++, and smoke suites.
7. Repeat the authentic Workshop Stock Report completion in the production browser and verify XP, completion, Practice eligibility, Codebook unlocks, backup, and sync.
8. Restore normal runner execution only after every gate passes and both KV storage and the public status endpoint agree.

## Recovery and rollback

- If the dedicated analyzer, C++ image, or coordinator fails, disable new execution and keep the static academy, accounts, progress, Practice, Codebook, and drafts available while repairing or restoring the reviewed image.
- If the course route or teaching copy fails, restore the previous reviewed content while keeping each Worker at its Phase 5B compatibility floor or newer. Saved IDs may be temporarily invisible, but compatible Workers must preserve them.
- If synchronization fails, stop the rollout and avoid new writes until the fault is understood. Do not delete D1, rewrite learner JSON, remove Phase 5B IDs, rotate secrets, or restore a pre-floor Worker as a repair.
- If V3 local persistence fails before production, do not publish the course. If it fails after publication, restore the latest V3-capable client instead of directing learners to clear storage.
- After rollback, rerun platform and existing-course regressions, verify the final runner enabled or disabled state, and prove a record containing every Phase 5B ID can still be read and saved without loss.

## Phase 5B definition of complete

Phase 5B is complete only when all of the following are true:

- the reserved identifiers, lesson order, vocabulary order, XP, and final capstone contract match this plan;
- all 30 lessons are authored, reviewed, and readable by an absolute beginner;
- all 12 editable exercises compile and run through the isolated C++20 runner;
- the protected final assessment accepts authentic source, rejects adversarial substitutes, and leaks no trusted facts;
- both prerequisites, ordered modules, routes, Practice, Codebook, progress V3, backups, sync, and lazy assets pass automated and manual gates;
- desktop, 390-pixel, keyboard, zoom, reduced-motion, focus, screen-reader status, and compiler-diagnostic checks pass;
- hosted CI, dry runs, runner-image checks, staging checks, and production checks pass on the exact released commit;
- staging and production Worker compatibility floors, content-release versions, C++ image digest, CI run, bundle measurements, and manual QA notes are recorded in `PHASE_5B_RELEASE.md`;
- production exposes the entire course at once, with no partial or coming-soon version having appeared earlier.
