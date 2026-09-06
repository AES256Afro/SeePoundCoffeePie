# Core programming course review

## Scope

Reviewed the teaching sequence, explanations, prompts, examples, and lesson ownership for the six published programming courses: four Foundations courses, Practical Python: Data Tools, and Practical C++: Collections and Records. Together these contain 36 modules and 180 lessons.

This is a targeted improvement pass, not a claim that every lesson was rewritten or every program was compiled on a live runner. The Local LLM rebuild is separate. Planned Linux, networking, and cybersecurity catalogs and the four separate guided projects were not rewritten in this pass.

## Problems corrected

1. Introductory code guides existed in the data but were not rendered when a lesson had an introductory guide. This hid the Java setup explanation. The existing definitions disclosure now includes the authored code walkthrough. It adds no extra closed section before the editor.
2. Choice questions could contain displayCode, but the player rendered it only for prediction questions. Five Practical C++ questions now show their supplied examples, including return values, vectors, records, references, and totals.
3. Some C++ explanations said every shown line belonged inside main even when the example included a helper definition. The first returned-value prediction now shows a complete program, and mixed excerpts identify which pieces belong outside or inside main.
4. The first C++ and Java function-call predictions now show helpers in their actual surrounding programs, instead of placing a call directly after a helper without showing main.
5. C# function lessons called top-level local functions methods without distinguishing them. Their explanations and module-5 lesson titles now use function, with an explanation of the difference from a method declared in a class. Durable lesson IDs are unchanged.
6. The detailed walkthrough and familiar comparison no longer occupy the full lesson column by default. They remain available through native keyboard-operable disclosures. The task and primary explanation stay visible.

## Teaching improvements by course

| Course | Changes |
| --- | --- |
| Python Foundations | Names referring to values, colon and indentation in decisions, how for assigns each current item, definition versus call, parameter versus argument. |
| C++ Foundations | Header purpose, main and return type, loop colon and copied current value, invalid indexes and undefined behavior, complete first helper-call example. |
| C# Foundations | Runtime and library definitions, project-provided System access, top-level statements, interpolation, foreach syntax, invalid-index errors, local functions versus class methods. |
| Java Foundations | Source, compiler, bytecode and JVM; public/class/static/void/main/String[] args; concatenation versus addition; loop syntax and empty arrays; invalid-index errors; complete first method-call example. |
| Practical Python | Expressions and returned values; f-strings as an alternative to earlier output; whitespace; string methods returning results without modifying the original; append changing a list and returning None; dictionary keys, defaults, and filtering; running-total trace. |
| Practical C++ | Returned answers versus output, correct placement of definitions and calls, struct fields and initialization punctuation, references in their surrounding code, declaration versus definition ordering. |

## Repetition and continuity

The six courses teach different languages or later skills. They were not merged or removed. A new module's short recall question still revisits an earlier idea, followed by explanation, prediction, repair or ordering, and use. That repetition is intentional practice, unlike duplicating whole course pages.

The audit checks that all 30 authored explanations within each course are distinct. This catches exact duplicated lesson bodies, not every possible conceptual overlap. Qualitative wording and sequencing review is still necessary.

No lesson IDs, concept IDs, XP values, saved completion mappings, grading contracts, or expected outputs were changed. Existing course access rules were not broadened or tightened. No production deployment or live runner execution was performed.

## Regression coverage

- All 180 lesson URLs round-trip to their owning course, module, and lesson.
- Continue advances from the first to the second lesson in every one of the 36 modules in component tests, using a stateful parent as the application does.
- Browser checks cover Continue, refreshed deep links, and browser Back in all six courses.
- Introductory walkthroughs exist for all four languages and remain closed by default.
- Practical C++ choice-question examples render verbatim from the authored data.
- Java setup explanations can be opened and closed using the keyboard at 320 CSS pixels.
- Existing narrow-width and zoom-equivalent tests retain their editor-position and document-height limits. Their definition selectors distinguish glossary terms from the newly visible code examples.

The checks use local fixtures. They do not start Cloudflare training containers, invoke hosted models, or consume cloud model credits. Passing automated accessibility checks is not a claim of human assistive-technology review.

Final local verification: 91 test files with 1,128 passing tests; 82 passing Chromium browser tests. TypeScript and production build, lint, learner-language and text-style checks, deterministic foundation and Practical C++ content checks, curriculum validation, bundle limits, and git diff whitespace checks passed. Java lesson layouts were also inspected visually at desktop and narrow widths. These are local results, not deployment evidence.

## Technical references checked

- [Python data structures](https://docs.python.org/3/tutorial/datastructures.html): list methods, mutation, returned None, and dictionary behavior.
- [Microsoft: C# top-level statements](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/program-structure/top-level-statements): program structure and local functions.
- [Java getting started](https://dev.java/learn/getting-started/): source files, compilation, runtime, and entry-point examples.
- [C++ working draft: function definitions](https://eel.is/c++draft/dcl.fct.def.general): permitted function-definition scope.

## Next useful teaching pass

Review the four standalone guided projects with the same standard. In particular, test the transition from completing supplied blanks to choosing a small program's structure independently. Include an empty collection, a boundary value, and an unexpected input where appropriate, while explaining each case before assessing it. Do not add another introductory course that repeats these foundations.
