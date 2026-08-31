# No assumed knowledge standard

Last reviewed: 2026-08-30

Status: platform-wide design, content, and release contract

## Purpose

This standard defines how SeePoundCoffeePie lessons, exercises, labs, assessments, and progress views provide beginner clarity and cognitive accessibility. It requires predictable structure, clear scope, low sensory load, short learning sections, and reliable ways to stop and resume.

The platform does not create a special course, catalog category, profile, or learning track for this standard. It applies to every learner and every school. SeePoundCoffeePie must not infer, request, verify, or store a health or disability label in order to provide these features. Presentation and focus controls are ordinary learning and accessibility choices available to everyone.

The standard applies to:

- public catalog and path pages;
- course and module outlines;
- reading units and programming lessons;
- exercises and Practice sessions;
- local lab guides and downloadable lab packs;
- formative and credential assessments;
- progress, review, transcript, and resumption views;
- desktop, tablet, narrow-screen, keyboard, screen-reader, zoom, high-contrast, and reduced-motion use.

This standard extends the existing [academy expansion blueprint](ACADEMY_EXPANSION_BLUEPRINT.md), [lab, assessment, and credential standard](LAB_ASSESSMENT_CREDENTIAL_STANDARD.md), [open learning workshop UI direction](../UI_REDESIGN_MOCKUPS.md), and [milestone roadmap](../../MILESTONES.md). If two rules appear to conflict, the safer lab rule, stronger accessibility rule, and open-access promise take priority.

## Core rule: never assume prior knowledge

Do not require the learner to know an idea merely because it is common to an experienced practitioner, appeared in an earlier course, or seems basic to the author.

Before a required action, supply or link all of the following without blocking the learner:

1. **Term:** Define every word, abbreviation, symbol, and interface label needed for the action.
2. **Purpose:** Explain why the learner is doing the action and what decision or result it supports.
3. **Context:** State where the learner is, what has already happened, and what remains unchanged.
4. **Input:** Identify exactly what the learner starts with, including files, values, commands, tools, accounts, or machine state.
5. **Action:** Give one clear instruction at a time and label the environment where it occurs.
6. **Expected output:** Show what the learner should observe and what acceptable variation may look like.
7. **Recovery:** Explain how to stop, undo, restore, or ask for more context before the learner can cause loss.

If the complete explanation would interrupt the current task, show the minimum context beside the task and link a short refresher plus optional depth. `Start now` always remains available. The context link cannot become a prerequisite, route guard, or completion condition.

No instruction may rely only on phrases such as `as before`, `as usual`, `the normal way`, `use your environment`, or `fix the error`. Restate the needed fact, name the environment, and provide a safe next check.

## Learner protections

- Every published learning page remains directly open.
- Optional preparation is context, not an access gate.
- Progress describes what happened. It does not grant permission to learn.
- A learner can leave and return without losing completed work or the place where work stopped.
- Formative mistakes do not reduce access, remove earned progress, or trigger shame-based messages.
- The platform does not require a streak, public ranking, countdown, voice recording, camera, or public profile.
- A learner can use the default view or choose quieter and more focused views without changing the learning outcome.
- Safety instructions, authorization boundaries, stop conditions, and recovery steps are never hidden as optional detail.
- Assessment adjustments may change time, presentation, input method, or break structure. They do not remove the skill being assessed.
- A preference for a focus view, larger text, reduced motion, or more context is not stored as a health or disability label.

## Design rules

### 1. Keep the page structure predictable

Every teaching page uses the same top-to-bottom order:

1. Location in the course
2. Goal
3. Scope and estimated time
4. Optional preparation or a short context link, when relevant
5. Example or observation
6. Explanation
7. One task
8. Feedback or expected checkpoint
9. Recap
10. Save point and next choice

The interaction may differ by unit type, but the location, goal, scope, task, recap, and next choice remain in the same relative positions.

Required behavior:

- Use one unique page title and one `h1`.
- Show `Course > Module > Unit` as text, not icon-only navigation.
- Show the unit position, such as `Unit 3 of 8`.
- Keep Back, Forward, refresh, bookmarks, and shared links on the exact unit.
- Do not move the primary action between the top, side, and bottom on similar pages.
- Do not replace a familiar control with a new icon when an ordinary text label works.
- Preserve disclosure state, checklist state, editor work, and focus-view preference when it is safe and private to do so.

### 2. Present one clear action at a time

At each decision point, one action receives the strongest visual emphasis. Other available actions remain visible as ordinary buttons or links.

Examples:

- Before code runs, `Run code` is primary and `Reset` is secondary.
- After output appears, `Check answer` may become primary while `Run code` remains available.
- After a unit is complete, `Next unit` is primary while `Review this unit` and `Stop here` remain secondary.
- During a lab preflight, `Continue to recovery point` is primary. The procedure does not compete for attention before preflight passes.

Rules:

- Use a verb and object in the label: `Run code`, `Check answer`, `Save this step`, or `Return to course`.
- Do not use vague labels such as `Go`, `Submit`, `Proceed`, or `Okay` when a clearer label fits.
- Never show two equally emphasized actions that lead to different outcomes.
- Do not make a secondary action visually dominant because it is destructive or promotional.
- A destructive action uses a clear warning, names what will be lost, and requires confirmation only when the loss cannot be undone.
- Keyboard focus moves to the result or an announced status after an action. It does not jump to unrelated navigation.

### 3. Reveal depth gradually

Progressive disclosure means showing the information needed for the current decision first and keeping extra depth one deliberate action away.

Always visible:

- the goal;
- the current task;
- required terms;
- the expected result;
- safety boundaries;
- stop conditions;
- the primary action;
- the next choice.

Suitable for an optional disclosure:

- a longer historical explanation;
- a second worked example;
- formal terminology after a plain explanation;
- implementation detail not needed for the current task;
- a complete diagnostic trace after a plain-language summary;
- an optional extension.

Disclosure controls must:

- use a descriptive label such as `Read why this happens`;
- expose whether they are open or closed to assistive technology;
- work by keyboard;
- retain their state during the current unit;
- return focus to the control when closed;
- avoid nesting more than two disclosure levels.

Do not hide a required instruction, assessed fact, warning, authorization rule, or recovery step inside a closed disclosure.

### 4. Show scope before work begins

The learner sees the following before beginning a unit or lab:

- one-sentence goal;
- estimated time as a range;
- number of required steps or questions;
- activity type;
- whether work happens in the browser or on the learner's machine;
- files, services, accounts, networks, or model artifacts that may change;
- saved stopping points;
- optional depth that can add time.

Use estimates such as `About 8 to 12 minutes` or `Three stages, about 35 to 50 minutes`. State the assumption behind a lab estimate when download, hardware, or platform speed can change it.

Time is planning information, not pressure:

- no countdown for ordinary learning;
- no overdue label;
- no punishment for stopping;
- no completion claim based only on time spent;
- no statement that another learner should finish in the same time.

### 5. Keep learning chunks short and coherent

A normal unit teaches one main idea.

Targets:

- 5 to 12 minutes for a normal reading or exercise unit;
- no more than 15 estimated minutes without a visible section checkpoint;
- one main learning goal;
- one to three new terms as the usual range;
- no more than five new terms without an explicit vocabulary preview;
- one required practice action;
- one recap;
- one clear next choice.

A concept should not be split merely to create more pages. A long unit should be split when it contains two goals, two independent decisions, more than one substantial example, or a natural stopping point.

A lab may be longer, but it is divided into stages of about 10 to 20 minutes. After about 35 to 50 minutes of concentrated work, provide a stable stopping point, recap, and resumption note.

### 6. Put examples before abstraction

The default teaching order is:

1. Show one concrete input, action, or situation.
2. Ask the learner to notice or predict one result.
3. Show the result.
4. Name the idea.
5. Explain the rule in plain language.
6. Change one part of the example.
7. Ask the learner to apply the idea.
8. Show one boundary or counterexample when it prevents a likely misunderstanding.

Examples must be small enough to inspect. Do not change several variables at once. Do not introduce an unrelated story, fictional system, or visual merely to decorate the concept.

When formal notation matters, place it after the concrete example and define every symbol. Plain language supports the formal explanation. It does not replace necessary technical accuracy.

### 7. Use literal and specific language

Required writing behavior:

- Use direct sentences and active voice when practical.
- Put the condition before the action: `If the output says X, select Y.`
- Give one instruction per numbered step.
- Name the object instead of relying on `it`, `this`, or `that` when the reference could be unclear.
- Expand an abbreviation before using it alone.
- State whether text is an example, a placeholder, a command to copy, or output to compare.
- Label the operating system, shell, language, and version when they affect an instruction.
- Explain an implied step instead of expecting the learner to infer it.
- Keep paragraphs focused on one point.

Avoid in required instructions:

- idioms;
- sarcasm;
- rhetorical questions;
- double negatives;
- metaphor as the only explanation;
- vague time words such as `soon` or `quickly`;
- unexplained humor;
- claims that a task is `easy`, `obvious`, `simple`, or `trivial`;
- `just` or `simply` when the omitted detail is part of the work;
- phrases that assume the learner remembers an earlier unit.

Copy validation flags, but does not automatically reject, sentences longer than 25 words and paragraphs longer than 90 words. A reviewer decides whether technical accuracy requires the length or whether the text should be divided.

### 8. Make glossary help local and reversible

Every necessary technical term has:

- a one-sentence plain definition;
- one concrete example;
- its expanded form when it is an abbreviation;
- related terms when the distinction matters;
- school-specific meanings when the same word is used differently elsewhere.

At first use in a unit, a term opens a local definition without replacing the page. The learner can close the definition and return to the same reading position and keyboard focus.

Glossary rules:

- Define a term before an assessed use.
- Do not link every repeated use after the first clear definition on a page.
- Distinguish code tokens from concepts.
- Keep required definitions available offline with the unit when the lab pack needs them.
- Do not use a tooltip that requires hover.
- Do not place essential definitions only in title attributes or icon labels.
- Do not turn a glossary entry into a second full lesson. Link optional depth separately.

### 9. Retain context across pages and interruptions

Every unit answers four questions without requiring memory of the previous page:

1. Where am I?
2. What am I doing now?
3. What do I need from earlier work?
4. What happens after this?

Use:

- breadcrumbs;
- unit position;
- a one-sentence link to the previous idea;
- a visible current goal;
- named input and expected output;
- a saved state label;
- a clear next step.

Do not begin with `As you remember` or `As discussed earlier` without restating the needed fact or linking a short context panel.

When a learner returns, show a resumption card:

```text
You stopped in Stage 2: Check the service log.

Saved: the configuration file was copied. The service was not changed.
Next: compare the prepared log line with your local output.

[Resume Stage 2]
[Review the last checkpoint]
[Open recovery steps]
```

The system must not guess the state of a learner-controlled machine. For a local lab, the learner selects the last confirmed checkpoint and runs the provided safe verification before continuing.

### 10. Support recap and spaced repetition

Each unit ends with:

- the main idea in one sentence;
- two to four facts or steps worth remembering;
- one short retrieval question;
- a plain explanation of where the idea returns.

New foundational ideas should return in varied forms:

- once within the next three units;
- once in the next relevant module or Practice set;
- once after a delay when the learner uses scheduled review.

The exact schedule is adjusted from documented learning evidence, not an inferred learner category. A returned item explains why it appeared and what a correct response changes. The learner may choose five-minute, ten-minute, due-only, or topic-based review. A late review does not remove progress or display blame.

Repetition changes the task shape. It can move from recognition to prediction, ordering, diagnosis, repair, or a small independent use. It must not repeat the same answer pattern until the learner memorizes the screen rather than the idea.

### 11. Make errors recoverable and neutral

An error message uses this order:

1. **What happened:** A literal one-sentence summary.
2. **What stayed safe:** State whether work, progress, files, or services were preserved.
3. **Where to look:** Identify the field, line, step, request, or local checkpoint.
4. **What to check next:** Give one safe diagnostic or correction.
5. **Try again:** Preserve the learner's work when possible.
6. **Technical details:** Keep the exact error available under a descriptive disclosure.

Example:

```text
The check could not read the program output.

Your code is still in the editor, and this attempt did not change progress.
Run the code once and compare the first output line with the expected line below.

[Run code]
[Show technical details]
```

Rules:

- Describe the result, not the learner.
- Do not say `You failed`, `careless mistake`, or `You should know this`.
- Do not erase input after an error.
- Keep Undo or a known-good reset available.
- State exactly what Reset removes before it runs.
- Do not use color, an icon, or a sound as the only error signal.
- Do not announce the same live error repeatedly to a screen reader while the learner types.
- A formative attempt is unlimited and does not reduce points or access.
- Credential assessments follow their declared scoring and retake rules without shame-based copy.

### 12. Keep feedback close, specific, and useful

Feedback appears next to the answer, editor, output, or step it explains.

For a correct result, feedback states:

- what was correct;
- why it worked;
- what part matters for the next task.

For a result that is not yet correct, feedback states:

- what the system observed;
- one part that already matches when applicable;
- the smallest useful next check;
- how to open a hint or worked explanation;
- whether another attempt changes any record.

Do not use praise as a substitute for explanation. Do not use exaggerated celebration, confetti, flashing color, or a reward interruption. A short confirmation such as `The output matches` is enough.

Hint ladders use three levels:

1. Reminder of the relevant idea
2. Specific clue tied to the current work
3. Worked explanation

Opening a formative hint does not silently reduce a score. Any credential-assessment hint or support rule is declared before the attempt.

## Presentation and sensory restraint

### Visual restraint

- Use solid colors rather than gradients, glows, glass effects, or animated backgrounds.
- Use whitespace to separate ideas.
- Do not place every paragraph inside a card.
- Do not use a marketing hero inside a course or lesson.
- Keep progress quiet: plain counts and thin lines are enough.
- Use animation only when it teaches a change that a static sequence cannot explain as clearly.
- Provide Pause, Restart, and a static equivalent for instructional animation.
- Do not autoplay audio, video, animation, or scrolling.
- Do not use flashing content, pulsing controls, parallax, particles, or celebratory motion.
- Do not use persistent chat bubbles, rotating tips, badges, or reward counters around the lesson.
- Use restrained risk color and pair it with text and an icon.
- Mark decorative images so screen readers ignore them.
- Keep alerts visible only as long as they remain relevant, with a way to dismiss noncritical alerts.

### Reduced motion

The interface respects `prefers-reduced-motion` without requiring an account setting. A visible setting may also select reduced motion manually.

With reduced motion enabled:

- navigation changes immediately or with a simple fade of no more than 100 milliseconds;
- progress does not animate through intermediate values;
- accordions do not slide;
- focus does not use smooth scrolling;
- diagrams use static steps;
- success and error states do not bounce, pulse, shake, or flash;
- no information is lost.

Motion that represents a process must also have a static step list and text status.

### Focus views

Focus views are optional, reversible presentations of the same page. They do not create separate content or change completion rules.

Required modes:

- **Default view:** Normal course navigation, lesson, and activity.
- **Reading focus:** Keeps location, lesson text, glossary, and next action. It hides secondary catalog navigation and decorative material.
- **Practice focus:** Keeps location, current task, editor or exercise, output, feedback, and exit control. It reduces the reading pane to the current goal and required example.

Rules:

- The focus-view control has a text label.
- Exit is always visible and keyboard reachable.
- Focus view never hides safety, authorization, stop, or recovery information.
- The selected view is remembered privately and can be reset.
- The route remains bookmarkable and does not fork learner progress.
- A screen reader receives the same content hierarchy and controls, not a reduced substitute.

## Typography, scaling, and whitespace

### Type

- Teaching body text is at least 18 CSS pixels at the default scale.
- Teaching body line height is 1.55 to 1.75.
- Code and terminal text are at least 16 CSS pixels with at least 1.5 line height.
- Interface labels are at least 16 CSS pixels unless a tested browser or operating-system control supplies an equivalent accessible scale.
- Paragraph lines normally remain between 45 and 75 characters, with about 65 as the target.
- Use sentence case for headings, labels, and buttons.
- Limit serif type to major headings. Use a readable sans serif for instructions and controls and a clear monospace face for code.
- Do not use long passages in italics, all caps, centered text, or justified text.
- Do not encode meaning through font weight alone.

### Scale and reflow

- Text can be resized to at least 200 percent without losing content or controls.
- Reading pages and ordinary controls reflow at a viewport equivalent to 320 CSS pixels without two-direction page scrolling.
- Code, a wide table, or a technical diagram may scroll inside its labeled region when two-dimensional layout is necessary. The whole page must not scroll sideways because of that region.
- Provide a linear text or list equivalent for a wide visual.
- Sticky headers and action bars must not cover focused controls, headings, feedback, or the current code line.
- Do not use a fixed page height for teaching content.
- Do not shrink text at narrow widths to preserve a desktop arrangement.
- User font, spacing, contrast, and zoom changes must not hide controls or truncate meaning.

### Whitespace

- Use at least one body-line of vertical space between separate ideas.
- Keep related labels, controls, feedback, and help visually close.
- Separate a new section more strongly than a new paragraph.
- Avoid repeated borders when space and headings already show structure.
- Do not leave a learner guessing whether a large blank area contains unloaded content.
- On a split lesson workspace, give reading and practice independent, labeled regions and avoid forcing both to share one type scale.

The W3C reflow guidance explains why content should remain usable at a width equivalent to 320 CSS pixels and why fixed content must not obscure the active area. This standard uses that guidance as a design check, not as a claim that a release conforms until the required review is complete.

Reference: [Understanding WCAG 2.2 Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)

## Keyboard and screen-reader access

### Keyboard

- Every public learning flow is completable without a pointer.
- Provide a skip link to the teaching content and another to the current activity when both regions are present.
- Use native controls before custom controls.
- Keep focus order aligned with the reading and task order.
- Show a visible focus indicator with sufficient separation from the control.
- Do not trap focus in the editor, output, dialog, disclosure, or focus view.
- Provide a documented way to leave the code editor. `Tab` moves out normally unless the learner has deliberately enabled indentation behavior.
- `Ctrl+Enter` or `Command+Enter` may run the current check when the shortcut is displayed next to the action.
- Do not require a single-character shortcut. Any such shortcut must be disabled by default or be removable and remappable.
- Provide button alternatives for drag, swipe, hover, and pointer-only interactions.
- After a dialog closes, return focus to the control that opened it unless the confirmed action created a more useful next location.
- Touch and pointer targets for primary actions should be at least 44 by 44 CSS pixels.

### Screen reader

- Use page landmarks and a logical heading outline.
- Announce route changes by updating the document title and moving focus to the new page heading or a purposeful start point.
- Give controls names that include their effect and, when needed, their target.
- Identify code language, line numbers, editable state, and error line without reading decorative syntax tokens separately.
- Give every diagram a concise summary and a complete structured alternative.
- Use real lists and tables when the relationships are lists or tables.
- Announce status changes without taking focus when the learner only needs confirmation.
- Reserve urgent alerts for information that requires immediate action.
- Announce progress as plain text, such as `Question 2 of 6`, without reading every decorative state.
- Pair errors, warnings, correct answers, and selected states with text, not color alone.
- Keep glossary disclosures, hints, and technical details in the expected reading order.

W3C guidance requires status messages to be programmatically available without forcing a focus change and requires keyboard focus order to preserve meaning and operation.

References:

- [Understanding WCAG 2.2 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages)
- [Understanding WCAG 2.2 Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html)

## Breaks, resumption, and saved progress

### Breaks

- Offer `Stop here` at stable checkpoints.
- Do not show break reminders as warnings or overdue notices.
- A reminder may appear after 35 to 50 minutes of concentrated work, but it remains dismissible.
- Before a local-lab break, confirm that no unsafe operation is running, no unintended public listener remains open, and the environment is at a documented checkpoint.
- If work cannot stop safely, state the short safe-stop sequence and estimated time before the activity begins.
- After a break, show the goal and last confirmed state before the next command or question.

### Saved progress

Save separately:

- unit read or completed state;
- formative exercise state;
- current question or lab stage;
- editor draft when the privacy model permits it;
- disclosure and checklist state;
- last confirmed local-lab checkpoint as learner-selected information;
- review scheduling state;
- assessment attempt state under the assessment policy.

Rules:

- Do not mark a unit complete only because the learner scrolled to the bottom or spent a set amount of time.
- Save after a meaningful learner action and before route changes.
- Show `Saved` with a useful timestamp when persistence is not immediate or may fail.
- Explain whether state is browser-local, synchronized to an account, or retained only during the current attempt.
- Preserve valid progress when two devices conflict and present a clear, reversible resolution.
- Let a learner correct accidental completion without resetting unrelated work.
- Do not save raw local commands, source, environment variables, datasets, private prompts, or shell history unless a separate explicit evidence policy permits a bounded artifact.
- A completion checkbox is never proof of competence.

## Checklists

Use a checklist for a bounded set of actions, not for every paragraph.

A checklist item:

- begins with an observable verb;
- names the object or state;
- contains one action or one verification;
- explains how the learner knows it is complete;
- remains editable until the stage is submitted or closed;
- does not disappear when checked.

Group long checklists into stages. The preferred group size is three to seven items. Show `3 of 5 checked` as neutral state, not a score.

Checklist rules:

- Preserve state during resumption.
- Allow Undo or uncheck.
- Do not place a required safety check below an action that depends on it.
- Do not use a checked box as evidence that a command succeeded.
- Pair self-attested completion with an explicit label.
- Expose checked state, group name, and item text to screen readers.
- Avoid a single checklist that mixes setup, learning, cleanup, and optional extension.

## Lab standard for attention, context, and safety

Every lab continues to use the L0 through L4 risk classes and the complete required structure in the [lab, assessment, and credential standard](LAB_ASSESSMENT_CREDENTIAL_STANDARD.md).

Additional requirements:

- Divide the lab into named stages with independent goals.
- Give each stage an estimated time and step count.
- Keep one change and one expected checkpoint together.
- Show the prompt, command, and expected output as visibly different content.
- Label every command by operating system, shell, user privilege, and target environment.
- Explain placeholders directly above the command.
- Provide a copy control only when copied text is safe without hidden substitution.
- Keep the current scope and target visible during L3 and L4 work.
- Show the recovery point before the first change.
- Put a stable save point after every risky or lengthy stage.
- Troubleshoot by visible symptom, not a long undifferentiated list.
- State stop conditions before a learner reaches them.
- Keep cleanup as a required stage, not an optional footer.
- Verify cleanup, stopped services, closed ports, deleted remote resources, and ended costs where applicable.
- Never use speed, uninterrupted completion, or command count as a competence measure unless the published objective specifically requires it.

## Assessment flexibility without lower outcomes

The assessed outcome remains fixed. The path used to understand the question, enter the answer, manage time, and take a break can vary.

Allowed forms of flexibility include:

- more time or an untimed formative activity;
- scheduled or learner-chosen breaks at safe boundaries;
- one question per page;
- a visible question count and answered, unanswered, and flagged states;
- keyboard, screen-reader, zoom, high-contrast, and reduced-motion use;
- text equivalents for diagrams and structured alternatives for visual relationships;
- an accessible editor or a compatible local-file route when source editing is the outcome;
- a tested alternate lab lane when it demonstrates the same skill;
- plain-language clarification that does not reveal the protected answer;
- resumption after a documented interruption when the assessment policy permits it;
- a private accommodation workflow for credential assessments.

The following do lower or change an outcome and cannot be called an accommodation for the same assessment:

- removing the skill being measured;
- replacing a required practical result with a completion checkbox;
- supplying the answer or the exact repair;
- accepting a different security boundary;
- waiving authorization, evidence, recovery, or cleanup requirements;
- grading a different objective under the same credential title.

Assessment rules:

- State the objective, format, approximate time, number of items or stages, break policy, retake policy, feedback timing, and evidence boundary before an attempt.
- Do not use a timer unless time is part of the published skill. When it is, document the reason and accommodation path.
- Formative work has unlimited attempts and immediate explanatory feedback.
- Credential assessments protect answer keys and may delay detailed feedback according to the declared integrity policy.
- Do not score spelling, typing speed, handwriting, eye contact, voice, camera behavior, or communication style unless that exact skill is a published outcome.
- No assessment requires voice or video.
- Human review uses a published rubric and an appeal route.
- Assessment events do not store a health or disability label.

## Required lesson template

### Author metadata

Every unit source contains:

```text
unitId:
courseId:
moduleId:
title:
unitType:
goal:
purpose:
context:
inputs:
expectedOutput:
estimatedMinutes:
requiredActions:
newTerms:
retrievalTargets:
optionalPreparation:
primaryAction:
completionRule:
feedbackPattern:
savedState:
recovery:
references:
lastReviewed:
```

`optionalPreparation` may be empty. When present, it compiles to the complete `Start now`, `Review a refresher`, and `Read the short context` choice. It never becomes a route guard.

### Learner-visible template

```text
[Course > Module > Unit]
[Unit n of total] [Saved state]

# Unit title

Goal
One learner-visible result.

Why this matters
The purpose of the idea or action without a sales claim.

Plan
About x to y minutes. n required actions. Activity type.

Starting point
The exact inputs, files, values, tools, account state, or machine state used here.

Optional context, when needed
[Start now] [Review a refresher] [Read the short context]

Example
One concrete situation, input, command trace, or program.

Notice
One prompt that directs attention to the important part.

Explanation
Plain rule, new terms, and why the result occurs.

Your task
One required action with one primary control.

Expected result
The output or visible state to compare, including acceptable variation.

Feedback
Observed result, explanation, safe next check, and optional hint ladder.

Recap
One main idea, two to four details, and one retrieval question.

Save point
What is saved and what the learner can safely do next.

Recovery
How to undo, restore, or return to the last confirmed state.

[Next unit]
[Stop here]
[Optional deeper explanation]
```

Required lesson checks:

- The example appears before the general rule unless the reviewer records why another order is clearer.
- Every new term is defined before the task depends on it.
- The purpose, context, starting input, expected output, and recovery path are explicit.
- The required action is visible without opening optional depth.
- The page has one emphasized primary action for the current state.
- The recap can be understood without rereading the entire page.
- Back, Next, Stop, and resumption behavior are present and tested.

## Required lab template

The lab source includes every field required by `lab-manifest.json` and the shared 21-part lab-page contract. The learner-facing lab uses this staged structure:

```text
# Lab title

Goal
One observable result.

Plan
Total time range, stage count, supported lanes, risk class, resources, and downloads.

Boundaries
What changes, what does not change, target, authorization, privacy, and license limits.

Optional preparation
[Start now] [Review a refresher] [Read the short context]

Preflight checklist
Platform, versions, privilege, resources, network, target, authorization, and cleanup understanding.

Recovery point
Snapshot, backup, copy, branch, or recorded current state. Include verification.

## Stage n: Plain stage name
Goal:
Estimated time:
Starting state:
Steps:
Expected checkpoint:
If the result differs:
Stop condition:
Saved state:

## Verification
Confirm the intended result without relying on a checkbox alone.

## Cleanup
Remove temporary resources and verify services, ports, files, remote resources, and costs.

## Evidence and reflection
Retain only the declared minimal evidence. Explain what changed and why.

## Optional extension
Advanced work with its own time, risk, and recovery information.
```

Each stage must be independently understandable after an interruption. It restates the target and starting state rather than relying on memory of an earlier page.

## Prohibited patterns

| Pattern | Why it is prohibited | Use instead |
| --- | --- | --- |
| Assuming an earlier course, common setup, or familiar term | Hides the information needed to begin or recover | Define the term, purpose, context, input, expected output, and recovery path |
| Locked published course or prerequisite redirect | Preparation becomes a permission system | `Start now`, refresher, and short context |
| Marketing hero inside learning content | Delays the goal and consumes teaching space | Page title, goal, and scope |
| Several equally prominent buttons | Makes the next decision unclear | One primary action and visible secondary actions |
| Dense dashboard or card wall | Gives unrelated status equal weight | A short outline or grouped rows |
| Text wall without headings or checkpoints | Hides structure and stopping points | Focused sections and a saved checkpoint |
| Tiny labels or all-caps metadata | Reduces readability and hierarchy | Sentence-case labels at the interface scale |
| Required instruction inside hover, tooltip, or closed disclosure | Makes necessary context easy to miss | Visible instruction and optional depth separately |
| Autoplay, flashing, pulsing, particles, parallax, or confetti | Adds sensory load without teaching | Static state and restrained confirmation |
| Countdown, streak warning, overdue state, or lost reward | Turns planning into pressure | Neutral time estimate and private review choices |
| `Easy`, `obvious`, `trivial`, `just`, or `simply` as reassurance | Can hide a missing explanation or blame difficulty on the learner | Name the exact action and support available |
| Vague error followed by `Try again` | Does not support diagnosis or recovery | Observed result, preserved state, and one next check |
| Reset that silently erases work | Makes experimentation unsafe | Name the loss, confirm when needed, and provide Undo |
| Color-only or icon-only state | Hides meaning from some learners | Text, shape, and programmatic state |
| Automatic context change after selection | Interrupts reading and keyboard position | Explicit Apply or Continue action |
| Endless page with no stable stop | Makes interruption costly | Short units and saved checkpoints |
| Checklist used as proof of competence | Confuses self-report with verified evidence | Label the evidence class and verify the outcome |
| Timed learning by default | Measures pace rather than the stated skill | Untimed formative work and declared assessment timing |
| Surprise assessment rule | Makes planning and accommodation impossible | Show format, time, breaks, retakes, and evidence first |
| Forced voice, video, eye contact, or camera | Adds an unrelated participation requirement | Text and accessible interaction routes |
| Chat bubble, rotating tip, or mascot interruption | Competes with the active task | Optional help in a consistent location |
| Safety or recovery as optional detail | Can turn a learning interruption into real loss | Keep boundaries, stop, and recovery visible |
| Inferring learner identity, health, or disability from behavior | Creates an unsupported and private label | User-controlled preferences available to everyone |

## Content QA rubric

Score each dimension from 0 to 3:

- **0, harmful or missing:** The content is absent, unsafe, inaccessible, or contradicts the standard.
- **1, partial:** The intent is visible, but important details, consistency, or evidence are missing.
- **2, meets the standard:** Required behavior and content are present and reviewable.
- **3, verified and strong:** The requirement is present, tested in its relevant modes, and has recorded evidence.

| Dimension | A score of 2 requires |
| --- | --- |
| Purpose and scope | One goal, purpose, context, inputs, expected output, recovery path, visible time range, step count or unit position, activity type, and completion rule |
| Predictable structure | Canonical page order, stable navigation, one `h1`, breadcrumbs, and a clear next choice |
| Chunking and depth | One main idea, bounded required content, checkpoints, and optional depth separated from the task |
| Language and glossary | Literal instructions, defined terms, expanded abbreviations, labeled examples, and no shame or marketing copy |
| Example and practice | Concrete example before abstraction, one required practice action, and an explained result |
| Feedback and recovery | Preserved work, observed state, one next check, Undo or reset explanation, and useful technical detail |
| Context and resumption | Saved state, last confirmed checkpoint, resume summary, and no guessed local-machine state |
| Review and memory | Recap, retrieval prompt, varied return plan, and a neutral explanation of scheduled review |
| Sensory and focus controls | Restrained page, no autoplay or flashing, reduced-motion behavior, and reversible focus view |
| Typography and reflow | Required text scales, readable line length, whitespace, 200 percent text resize, and 320 CSS pixel reflow |
| Keyboard and screen reader | Logical focus, named controls, usable disclosures, status announcements, route focus, and visual alternatives |
| Safety and assessment | Correct lab risk controls or assessment policy, open access, evidence honesty, and equivalent-outcome flexibility |

Release threshold:

- total score of at least 30 out of 36;
- no dimension below 2;
- `Keyboard and screen reader` must score 3 for a public release candidate;
- `Safety and assessment` must score 3 for any L2 through L4 lab or credential assessment;
- any score of 0 blocks publication;
- a reviewer records the reason, evidence, and repair owner for every score below 3.

The score is a review aid, not a claim that every learner will have the same experience.

## Measurable release gates

### Authoring gate

Automated validation must confirm:

- 100 percent of published units contain every required metadata field;
- 100 percent have one goal, purpose, context, inputs, expected output, recovery path, estimated time, required action count, primary action, recap, completion rule, and saved-state description;
- 100 percent of optional preparation references compile to all three choices and never to a route guard;
- 100 percent of introduced abbreviations are expanded before assessed use;
- 100 percent of glossary references resolve;
- 100 percent of labs declare a risk class, supported lane, requirements, preflight, recovery, stop conditions, verification, and cleanup;
- no published content contains a locked-state learner path, forced voice requirement, prohibited public-target lab, or health or disability field;
- copy review flags sentences over 25 words, paragraphs over 90 words, unexplained abbreviations, marketing claims, and shame terms for human review;
- every diagram, animation, table, and code interaction declares its accessible equivalent.

### Layout and interaction gate

Representative catalog, course, module, lesson, exercise, lab, Practice, assessment, progress, and Settings routes must pass:

- desktop, tablet, 390-pixel, and 320 CSS pixel equivalent layouts;
- at least 200 percent text resize without loss of content or control;
- no two-direction page scrolling except inside a labeled, necessary code, table, or diagram region;
- default, reading-focus, practice-focus, reduced-motion, high-contrast, long-error, long-glossary, and resumed-state fixtures;
- one visually strongest action at each captured decision state;
- no fixed region covering focus, feedback, code, or navigation;
- browser Back, Forward, refresh, bookmark, and direct route preservation;
- saved checklist, disclosure, editor, and unit-state restoration where the privacy contract permits;
- no initial bundle loading a native runner, model runtime, or unrelated school content.

### Keyboard gate

A manual keyboard review must complete each representative flow with:

- skip links;
- visible and logical focus;
- no trap;
- editor entry and exit;
- disclosure, glossary, hint, checklist, dialog, and focus-view operation;
- Run and Check as distinct actions;
- Back, Stop, resume, and Next behavior;
- error recovery without erased work;
- destructive-action confirmation and cancellation.

Record browser, operating system, viewport, input method, route, result, and issue owner.

### Screen-reader gate

A manual screen-reader review must verify at least one desktop and one mobile or narrow-screen combination for:

- page title and route announcement;
- landmarks and headings;
- course, module, and unit position;
- control names and states;
- code language and editable context;
- question and step count;
- glossary and disclosure behavior;
- status, success, warning, and error messages;
- diagram, timeline, directory tree, packet path, evidence board, and model-map alternatives where present;
- resumption and saved-state text;
- no repeated or irrelevant live announcements.

Automated accessibility checks supplement this review. They do not replace it.

### Reduced-motion and sensory gate

- `prefers-reduced-motion: reduce` removes every nonessential transition and animation.
- No route autoplays audio, video, scrolling, or animation.
- No state flashes, pulses, shakes, bounces, or uses confetti.
- Color is not the only cue in every tested state.
- Focus modes hide only secondary interface and remain reversible.
- A static equivalent is available before an instructional animation begins.

### Resumption gate

Tests interrupt and restore:

- a reading unit before completion;
- an unanswered and a partially answered formative exercise;
- code with an existing output and error;
- a checklist with mixed states;
- a lab before preflight, after recovery, and after a stage checkpoint;
- a synchronized learner record with a conflicting browser copy;
- a permitted assessment break.

The restored page must state the last confirmed state, preserve permitted work, identify anything that cannot be known, and offer Resume, Review checkpoint, and Stop or recovery choices.

### Assessment gate

Every scored assessment records and tests:

- fixed outcome and blueprint;
- item or stage count;
- estimated time and any justified timer;
- break and resumption rules;
- keyboard, screen-reader, zoom, high-contrast, and reduced-motion support;
- equivalent presentation and input routes;
- retake, feedback, review, and appeal policy;
- server-owned answer and scoring boundary;
- no health or disability field, voice requirement, or unrelated behavior score;
- identical credential claim for every approved route that measures the same outcome.

### Learner review gate

Before a major learning-shell release:

- at least two compensated, opt-in reviewers complete representative tasks using the cognitive-accessibility checklist;
- at least one fresh beginner completes the same tasks;
- no health or disability disclosure is requested or retained;
- only the minimum review notes and agreed attribution are retained;
- reviewers test default and chosen focus settings rather than being assigned one assumed mode;
- findings are recorded by task, observed barrier, severity, proposed repair, owner, and retest result;
- unresolved blockers prevent release;
- unperformed reviews are reported as unverified, not passed.

This small review is a release gate, not proof that the product works for every learner. Continued feedback and maintenance remain required.

## Recommended milestone hooks

Do not create a separate completion ledger for this standard. Attach its requirements and evidence to the existing milestones:

| Area | Existing milestones |
| --- | --- |
| First-minute orientation, error reassurance, optional depth | M011 through M020 |
| Teaching layout, scale, whitespace, position, and feedback | M021 through M030 |
| Recap, retrieval, spaced review, confidence, and practice controls | M031 through M040 |
| Lesson schema, copy review, accessibility authoring, and release templates | M053 through M060 |
| Local troubleshooting and recoverable handoff | M076 through M084 |
| Keyboard, screen reader, zoom, glossary, and accessibility release evidence | M085 through M090 |
| Hint ladder and misconception feedback | M091 and M092 |
| Privacy-safe learning measures and maintenance | M097 through M100 |
| Optional preparation, unit renderer, routes, module pages, glossary, and surface gate | M103, M107, and M113 through M120 |
| Lab classes, manifests, platform lanes, preflight, recovery, and cleanup | M121 through M132 |
| Assessment blueprints, evidence, integrity, and fairness | M135 through M140 and M349 |
| Optional-preparation learner validation | M160 |
| Universal cross-school implementation and release gate | M351 through M366 |
| Core and expanded academy evidence | M350 and M410 |

Recommended ownership rule: M101 uses the core rule while defining the academy contract, and M351 owns formal adoption of this document. Each later milestone owns only the relevant implementation and evidence. M090 remains the accessibility release gate for the current programming platform, M120 applies the standard to the generic academy shell, M350 requires durable core-academy evidence, and M410 requires the expanded academy evidence.

## External guidance

This standard uses the W3C cognitive accessibility guidance as a design reference, especially its emphasis on familiar structure, clear purpose, literal language, short sections, visible steps, whitespace, error prevention, recovery, focus, and user testing. That guidance supplements WCAG and does not itself create a conformance claim.

References:

- [Making Content Usable for People with Cognitive and Learning Disabilities](https://www.w3.org/TR/coga-usable/)
- [W3C cognitive and learning accessibility overview](https://www.w3.org/WAI/people-use-web/abilities-barriers/cognitive/)
- [Use Clear Step-by-step Instructions](https://www.w3.org/WAI/WCAG2/supplemental/patterns/o4p07-step-instructions/)

## Publication statement

A course, unit, lab, or assessment does not satisfy this standard because its author intended it to be supportive. It satisfies the standard only when the required structure is present, automated checks pass, manual access reviews are recorded, relevant lived-experience review is complete, and unresolved blockers have an owner or prevent release.

Meeting this standard does not mean every learner will prefer the same presentation. The platform must keep choices visible, reversible, private, and available without requiring a label.
