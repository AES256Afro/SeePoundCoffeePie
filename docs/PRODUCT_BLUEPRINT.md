# SeePoundCoffeePie Product Blueprint

## Product promise

SeePoundCoffeePie helps an absolute beginner move from “code looks like punctuation” to “I can read, explain, change, test, and build a small program.”

The academy should feel like joining the engineering and command crew of a strange living starship. Space operations provide the structure. Fantasy technology, eccentric crew problems, and dry workplace humor keep the examples memorable. The stories are original and do not depend on a licensed universe.

## The learner we design for

The primary learner:

- has never written code;
- may not know what a file, console, variable, compiler, runtime, or function is;
- may be anxious about breaking something;
- needs the next useful action to be obvious;
- benefits from seeing the same concept in different forms;
- needs permission to reread, use hints, and make mistakes;
- wants visible progress but should not be punished out of learning.

Nothing in the first sector assumes prior command-line, IDE, Git, or computer-science experience.

## Core learning loop

Every lesson uses the same seven-part rhythm:

1. **Orient.** Name one new concept in plain language.
2. **Relate.** Connect it to a shipboard analogy.
3. **Unmask.** Separate the learner’s one small job from supplied scaffolding, then decode every unfamiliar line and symbol in plain language.
4. **Predict.** Ask the learner what the instruction should do, while making clear that the answer was just taught and prior knowledge is not expected.
5. **Type.** Make the learner edit only the relevant code before asking them to build larger structures.
6. **Explain.** Give immediate feedback that identifies the specific missing piece.
7. **Retrieve later.** Schedule the concept according to memory strength and past mistakes.

The learner does not watch a long lecture before touching code. Larger projects arrive after enough small pieces have become familiar.

## Deliberate product choices

### Guided path

The mission map determines the next recommended lesson. A true beginner should not need to understand a curriculum before they can begin one.

### No mistake tax

Wrong answers do not consume hearts, lives, energy, or paid currency. A mistake produces a specific explanation, another attempt, and an earlier review date. The system rewards returning and learning, not avoiding risk.

Before the current missions award completion, each exercise missed during that run returns in a short memory-repair round. The answer is reset so the learner retrieves it again, all teaching material remains available, and the repaired answer strengthens memory without awarding the exercise XP twice.

The current Practice Bay keeps review queues separate by language. It recommends the completed mission that covers the greatest number of concepts due now, uses lower memory strength to break close matches, and creates one focused exercise for each covered concept. A clear queue still offers the latest completed mission as optional practice. Focused completion strengthens review intervals and awards exercise XP, but it does not award mission completion or star shards again.

### Helpful hints without answer dumping

PIE-314 is the academy guide. In the current build it supplies authored hints and analogies. A future conversational guide should know the current lesson, the learner’s code, prior attempts, and the concept being taught. It should ask diagnostic questions and reveal one step at a time. It must not silently replace the learner’s code with the solution.

### Ceremony is not assumed knowledge

C++, C#, and Java often need program framing before a beginner can run one useful instruction. That framing must never appear as unexplained noise. The lesson first labels the learner’s exact edit, then identifies the rest as supplied scaffolding, and finally decodes the frame line by line. Long forms such as Java’s `public static void main(String[] args)` are recognized before they are memorized and revisited before the learner must construct them independently.

The interface should repeatedly distinguish these three things:

- **Your job now:** the smallest code change the learner is expected to make;
- **Provided for now:** valid surrounding code the learner may read but does not need to reproduce;
- **Why it exists:** a plain-language explanation of each word and symbol, available before the editor.

### Practice that changes shape

Later sectors should revisit a concept through several exercise forms:

- predict the output;
- choose the accurate explanation;
- complete one missing line;
- reorder instructions;
- fix a bug;
- write a small solution from a blank editor;
- explain why a solution works;
- use the concept inside a guided project.

### Honest execution boundary

Editable exercises now run in isolated, ephemeral workers. Choice, prediction, and ordering exercises remain deterministic browser interactions because they do not execute code. The real runner provides:

- language-specific toolchains;
- strict execution timeouts;
- CPU and memory limits;
- no outbound network by default;
- a disposable filesystem;
- output-size limits;
- server-side test cases;
- abuse controls and observability;
- no learner secrets inside the worker.

## Progression system

| System | Learner purpose | Current behavior |
| --- | --- | --- |
| XP | Makes effort visible | Awarded once per correctly completed step in a mission or focused-practice session |
| Daily goal | Creates a small finish line | Learner chooses 5, 10, or 15 minutes, represented by an XP target in the prototype |
| Streak | Supports a return habit | Advances when a mission is completed on a new consecutive day |
| Star shards | Marks meaningful completion | Awarded once per mission, not on replay |
| Memory strength | Controls review timing | Correct answers increase the interval; mistakes shorten it |
| Mission badges | Show demonstrated capability | Mission completion appears on the path and cadet record |

Competitive leaderboards are not part of the first product. They can motivate some learners but can also reward speed and XP optimization over understanding. Cooperative crew goals are a better future experiment.

## Four-track curriculum

The first sector uses the same conceptual spine across languages so learners can compare syntax without losing the underlying idea.

### See: C++ Engineering Corps

1. **Reactor Wake:** compiler, `std::cout`, strings, integers, variables
2. **Hull Logic:** booleans and conditions
3. **Cargo Array:** arrays and zero-based indexing
4. **Engine Loop:** range-based loops and repeated work
5. **Command Function:** functions, parameters, and calls
6. **Titan Forge:** guided tactical simulator

### Pound: C# Command Academy

1. **Shield Handshake:** .NET, `Console.WriteLine`, strings, integers, variables
2. **Command Logic:** booleans and conditions
3. **Crew Roster:** arrays and zero-based indexing
4. **Patrol Loop:** loops and repeated work
5. **Command Method:** methods, parameters, and calls
6. **Captain’s Trial:** guided encounter system

### Coffee: Java Systems Guild

1. **Coffee Protocol:** JVM, `System.out.println`, strings, integers, variables
2. **Routing Orders:** booleans and conditions
3. **Crew Array:** arrays and zero-based indexing
4. **Repeat Brew:** loops and automation
5. **Droid Routine:** methods, parameters, and calls
6. **Nebula Trial:** guided expedition planner

### Pie: Python Flight School

1. **First Spark:** console, `print`, strings, integers, variables
2. **Signal Protocol:** booleans and conditions
3. **Cargo Logic:** lists and zero-based indexing
4. **Looping Orbit:** loops and iteration
5. **Function Foundry:** parameters, return values, and decomposition
6. **The Void Wyrm:** guided text adventure

Python remains the recommended first route because its first useful instructions require less ceremony. The academy never presents the other paths as inferior. Their explicit structure can be valuable to a learner who wants systems, enterprise, or game-development context.

## Content rules

Every authored lesson must:

- define a term before asking the learner to use it;
- explain each new symbol that matters;
- show expected output;
- use a concrete, beginner-readable variable name;
- include one misconception-aware error message;
- include a hint that reveals the smallest useful next step;
- include retrieval practice after the initial encounter;
- avoid unexplained setup, package, framework, or command-line work;
- separate required syntax from optional style conventions;
- never use humiliation, countdown pressure, or loss of paid resources.

## Delivery roadmap

### Phase 1: Learning foundation (complete)

- Six sequential, five-step missions are playable in all four language tracks.
- Output prediction, explanation choices, code ordering, bug repair, and guided code editing all have authored curriculum coverage.
- The concept-level Codebook unlocks examples with progression and supports search in the active language.
- The editor documents Ctrl or Command plus Enter, preserves normal Tab navigation, and exposes hint state to assistive technology.
- Unit, React interaction, curriculum-schema, desktop browser, and 390-pixel mobile checks cover the learning foundation.
- Each Mission 6 capstone retrieves and combines storage, conditions, collections, loops, and reusable code without introducing another syntax burden.

### Phase 2: Real execution (complete)

- The isolated runner is implemented behind the version 1 request contract and [runner security threat model](RUNNER_SECURITY_CONTRACT.md).
- Python, C++, C#, and Java use pinned toolchains and fixed server-owned commands in one-use sandbox VMs.
- Compile and runtime failures pass through a beginner-focused explanation layer.
- Sanitized raw compiler output remains available under a disclosure for learners who want it.
- Every editable exercise has a visible output check and hidden checks that restate requirements already shown to the learner.
- The release evidence and operations guide are recorded in [the Phase 2 release](PHASE_2_RELEASE.md).

### Phase 3: Accounts and durable learning data (complete)

- Optional GitHub authentication now offers an explicit guest-to-account migration choice without making an account necessary for learning.
- One versioned private Cadet Record stores progress, aggregate answer counts, review schedules, settings, and achievements in D1 without retaining source code, GitHub tokens, email, raw IP addresses, or social data.
- Revisioned automatic saves, offline-safe browser storage, conservative merging, and visible conflict choices synchronize progress across signed-in desktop and mobile browsers.
- The validated JSON backup and restore flow works with account synchronization, while settings provide separate server-data deletion and learning-progress reset controls.
- The [Phase 3 release record](PHASE_3_RELEASE.md) defines the data contract, retention, privacy boundary, child-safety gate, deployment order, verification, and recovery requirements.

### Phase 4: Projects and adaptive practice

- Add guided projects after each sector.
- Generate practice from mastered and weak concepts with strict curriculum constraints.
- Add project checkpoints, test history, and a portfolio export.
- Experiment with cooperative crew missions before competitive leaderboards.

## Release gates

A lesson is ready only when:

- an absolute beginner can explain its learning goal after completion;
- every required term is introduced before use;
- valid alternate syntax is accepted when appropriate;
- incorrect answers receive specific, actionable feedback;
- keyboard-only completion works;
- the mobile layout remains usable at 390 CSS pixels wide;
- progress cannot be awarded twice by repeating the same completion action;
- automated tests pass;
- a human completes the lesson in a real browser.
