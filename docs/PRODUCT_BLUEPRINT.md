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

The current local simulator is appropriate for a first vertical slice with constrained tasks. It is not a general compiler. Open-ended execution needs isolated, ephemeral workers with:

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
| XP | Makes effort visible | Awarded once per correctly completed step in a mission session |
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
3. **Cargo Array:** arrays, vectors, and loops
4. **Command Functions:** parameters, return values, and decomposition
5. **Fleet Model:** classes, objects, and state
6. **Titan Forge:** guided tactical simulator

### Pound: C# Command Academy

1. **Shield Handshake:** .NET, `Console.WriteLine`, strings, integers, variables
2. **Command Logic:** booleans and conditions
3. **Crew Roster:** arrays, lists, and iteration
4. **Patrol Loop:** loops and repeated work
5. **Object Fleet:** classes, objects, and methods
6. **Captain’s Trial:** guided encounter system

### Coffee: Java Systems Guild

1. **Coffee Protocol:** JVM, `System.out.println`, strings, integers, variables
2. **Routing Orders:** booleans and conditions
3. **Crew Array:** arrays, lists, and iteration
4. **Repeat Brew:** loops and automation
5. **Droid Blueprint:** classes, objects, and methods
6. **Nebula Trial:** guided expedition planner

### Pie: Python Flight School

1. **First Spark:** console, `print`, strings, integers, variables
2. **Signal Protocol:** booleans and conditions
3. **Cargo Logic:** lists and structured data
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

### Phase 1: Learning foundation

- Author missions 2 through 6 for all four tracks.
- Add output prediction, ordering, and bug-fix exercise components.
- Add immediate end-of-mission mistake review before the completion ceremony.
- Add concept-level Codebook search and examples unlocked by completed lessons.
- Add accessible keyboard shortcuts inside the editor.
- Add unit, interaction, and curriculum-schema tests.

### Phase 2: Real execution

- Design the isolated runner API and threat model.
- Add Python and Java workers first, then C# and C++.
- Stream compile errors through a beginner-focused explanation layer.
- Keep raw compiler output available under a disclosure for learners who want it.
- Add hidden and visible tests without hiding the assignment requirements.

### Phase 3: Accounts and durable learning data

- Add authentication with a guest-to-account migration path.
- Store progress, attempts, review schedules, settings, and achievements server-side.
- Sync between desktop and mobile.
- Add export and account deletion controls.
- Define privacy retention and child-safety requirements before collecting social data.

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
