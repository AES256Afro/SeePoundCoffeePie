# Open Learning Workshop UI Direction

Status: approved direction, implemented in the current release candidate, pending publication and live verification

Mockup set: [open-learning-workshop](mockups/open-learning-workshop)

## Milestone status

The Open Learning Workshop redesign now has a working implementation in the application checkout:

- a compact top navigation replaces the permanent course sidebar;
- the learner home, course catalog, four course outlines, intake, Practice, Codebook, learner record, and Settings share one readable visual system;
- the lesson workspace uses the approved explanation-and-work split while retaining the existing exercise engine and isolated runner;
- the existing track, mission, and exercise identifiers are presented as courses, modules, and lessons without migrating or inventing progress;
- `/home`, `/courses`, all four `/courses/:course-slug` pages, and exact `/learn/:course-slug/:module-id/:lesson-id` pages are directly addressable;
- legacy academy and mission URLs remain supported for saved bookmarks and compatibility;
- desktop and 390-pixel layouts are implemented, with reduced-motion and keyboard behavior retained.

The remaining release work is verification rather than another structural redesign: finish the automated release gate, complete keyboard and assistive-technology review, publish the Worker with the runner paused, exercise the new live route set, re-enable the runner, and run the production runner regression checks. This document does not claim the redesign is live until that evidence is recorded.

## Why this direction

The current interface gives too many surfaces equal visual weight. Nested panels, compact labels, decorative borders, dark green-on-green contrast, and persistent navigation compete with the lesson itself. That makes the academy feel generated and dashboard-like even when the learner only needs one explanation and one next action.

This direction borrows useful product structure from established course platforms without borrowing their brand:

- courses contain modules;
- modules contain short lessons;
- the learner home emphasizes one continuation action;
- the catalog makes all available courses easy to compare;
- the lesson view separates reading from doing;
- intake asks one plain-language question at a time.

SeePoundCoffeePie keeps its own identity through the four symbols: the eye for C++, `#` for C#, the coffee cup for Java, and `π` for Python.

## Visual principles

1. Reading comes first. Body copy is at least 18 pixels with generous line height and strong contrast.
2. Whitespace establishes hierarchy. Pages do not need a panel around every idea.
3. One primary action appears in each major section.
4. Navigation moves to a compact top bar. The persistent left sidebar is removed from primary course pages.
5. The palette is warm parchment, ink, teal, amber, brick, and violet. It uses solid colors, not gradients or glows.
6. Corners remain modest at 6 to 8 pixels. Pills are reserved for true compact controls, not general decoration.
7. Serif type is limited to major headings. Humanist sans serif carries instructions, labels, buttons, and explanations.
8. The language symbols provide personality. Space scenes, star fields, stations, mascots, and decorative technology do not carry the brand.
9. Metadata is written in normal sentence case. Tiny all-caps labels are removed.
10. Progress is visible but quiet. Thin lines and plain counts replace large reward widgets.

## Implemented information architecture

### Home

The signed-in learner sees one continuation action, a seven-day activity strip, concepts ready for review, their current courses, and the active course outline.

Canonical route: `/home`

### Courses

The catalog displays the four foundation courses first. Future guided projects can appear below them without turning the page into a dense marketplace.

Canonical route: `/courses`

Initial courses:

- Python Foundations
- C++ Foundations
- C# Foundations
- Java Foundations

### Course outline

Each course has six modules. A module expands to show its short lessons, duration, and current state. This replaces the current idea of one language school containing only a row of mission cards.

Canonical route: `/courses/:course-slug`

Initial foundation modules:

1. Reading code
2. Variables
3. Decisions
4. Collections
5. Loops and functions
6. Guided project

### Lesson workspace

The desktop workspace uses a 43/57 split:

- the left side explains one idea with normal document typography;
- the right side contains the editor and output;
- a thin top bar identifies course, module, and lesson;
- the bottom navigation provides Back and Next lesson;
- Run code and Check answer are distinct actions;
- Reset and Show hint remain secondary text actions.

Canonical route: `/learn/:course-slug/:module-id/:lesson-id`

The route uses the existing mission ID as the module ID and the existing exercise ID as the lesson ID. For example, `/learn/python-foundations/py-first-spark/py-console` opens the first lesson of Python Foundations without changing the stored progress schema.

Choice and prediction lessons can replace the editor with the relevant interaction while preserving the same reading pane and page structure.

### Practice and Codebook

Practice and Codebook remain first-class pages in the top navigation. Their internal layouts should use the same open document and row patterns rather than dense card grids.

Canonical routes:

- `/practice/:language`
- `/codebook/:language`

### Beginner intake

Intake asks one question per page, explains why it is being asked, and always provides `I'm not sure yet`. Recommendations do not lock the learner into a course.

Canonical route: `/start`

## Mockup notes

### 01 Course catalog

The catalog uses four large, comparable foundation-course surfaces rather than four schools in a dropdown. Each course exposes its outcome, size, beginner level, progress, and one action. Guided projects are secondary rows below the foundations.

### 02 Learner home

The learner home is intentionally not an analytics dashboard. It answers three questions: what should I continue, what needs review, and what else am I learning?

### 03 Course outline

The outline makes the curriculum legible before the learner begins. It also gives us a scalable structure for adding more courses without adding more top-level navigation concepts.

### 04 Lesson workspace

This is the highest-priority production redesign. It increases reading size, removes the surrounding dashboard shell, gives explanation and execution stable regions, and makes the learner's task obvious.

### 05 Beginner intake

The intake keeps the useful one-question rhythm from the reference product, but removes the mascot, fantasy background, sales treatment, and assumption that a beginner understands industry roles.

## Content model implications

The current curriculum can be migrated without rewriting every exercise immediately:

- track becomes course;
- current mission becomes module;
- each existing exercise becomes a lesson;
- the current Mission 6 capstone becomes the guided-project module;
- Practice continues to draw from completed lesson concepts;
- Codebook unlocks continue to follow demonstrated concepts.

This mapping lets the interface change first while preserving learner progress. A compatibility layer can translate existing completed mission IDs into course and module completion until the progress schema is deliberately upgraded.

## Implementation sequence

1. The shared top navigation, typography, colors, spacing, buttons, and row primitives are implemented.
2. The lesson workspace wraps the existing exercise engine and runner rather than replacing their behavior.
3. The course, module, and lesson presentation model retains stored progress IDs.
4. The course outline, catalog, and learner home are implemented as separate bookmarkable pages.
5. Intake uses four short recommendation questions and keeps course browsing optional.
6. Practice, Codebook, Settings, and the learner record use the shared visual system.
7. Desktop and 390-pixel browser layouts have been reviewed in the release candidate.
8. The complete automated, keyboard, assistive-technology, deployment, and production smoke gates remain required before the status changes to live.

## Prompt set used for the mockups

All five images were generated as high-fidelity 16:10 desktop UI concepts. The attached Boot.dev screens were designated as information-architecture references only. Every prompt required the SeePoundCoffeePie symbol order, a warm off-white editorial interface, high contrast, 18-pixel body copy, modest corners, flat colors, generous whitespace, and no copied branding.

Page-specific prompts requested:

- a two-column foundation-course catalog with secondary guided-project rows;
- a learner home with one continuation action, review queue, course rows, and module outline;
- a Python Foundations course page with six modules and an expanded Variables lesson list;
- a 43/57 explanation and code lesson workspace with beginner-oriented variable instruction;
- a one-question intake page that recommends a course without requiring programming knowledge.

Every prompt explicitly excluded star fields, spaceships, stations, mascots, glows, gradients, glassmorphism, fantasy textures, card soup, excessive pills, tiny uppercase labels, decorative analytics, and copied Boot.dev assets.
