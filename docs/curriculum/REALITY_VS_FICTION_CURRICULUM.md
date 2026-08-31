# Reality versus fiction curriculum

Last reviewed: 2026-08-30

## Status

This document defines an optional cross-school learning path for SeePoundCoffeePie. It is a curriculum and authoring specification, not a claim that these courses, exercises, or assessments are already published.

The path uses familiar scenes and common technology claims as starting points. It then replaces the dramatic shortcut with a plain, testable explanation. The goal is not to score entertainment for accuracy. The goal is to help a beginner notice what a story leaves out, identify the real concept underneath it, and ask better questions at work or while learning.

## Access and placement

Every published course, module, comparison, exercise, explanation, and source note in this path is visible and directly open.

- The path is optional context and never a prerequisite.
- It does not lock or unlock another course, lab, assessment, credential, or certificate.
- A learner may open any comparison directly from a bookmark.
- A guest may read every published comparison and complete every A0 self-check.
- Signing in adds private progress synchronization. It does not reveal otherwise hidden teaching.
- A suggested refresher always appears beside `Start now` and `Read the short context`.
- A learner may hide the fiction framing and read only the technical explanation.
- No countdown, streak, life, payment, or certificate requirement controls access.

This is a cross-school learning path, not a sixth technical school. The underlying instruction remains in the Programming, Linux, Networking, Cybersecurity, and Local Models and LLMs schools. Reality-versus-fiction units link to those explanations instead of copying a second version of them.

## What the path teaches

A learner should leave this path able to:

1. Separate a claim, an observation, an inference, and an unknown.
2. Explain why a dramatic scene may contain one plausible detail while omitting ten important steps.
3. Name the real computing concept underneath a popular claim.
4. Choose a safe way to inspect evidence without changing a system.
5. Recognize when a claim needs a date, version, platform, source, or test condition.
6. Avoid treating fluency, speed, confidence, or visual drama as proof.
7. State a professional next step in plain language.

## Non-negotiable authoring rules

- Use plain language before technical vocabulary.
- Describe a scene pattern in one or two sentences. Do not retell an episode or reproduce a script.
- Do not use copied dialogue, copyrighted screenshots, actor likenesses, logos, title treatments, music, or character names as lesson decoration.
- A named film, show, book, game, advertisement, article, or social post needs a precise source record and only the minimum paraphrase needed for teaching.
- Do not mock a beginner for believing a common claim.
- Do not imply that entertainment has an obligation to be a training manual.
- Do not turn a cybersecurity comparison into instructions for intrusion, credential theft, evasion, persistence, malware, public scanning, or retaliation.
- Do not require a terminal, model download, virtual machine, paid account, cloud service, or powerful computer for the core comparison.
- Do not present one operating system, language, security product, network design, or model as universally best.
- Do not call an inference a fact.
- Do not use sales language, artificial urgency, or fear to keep a learner on the page.
- Do not use an LLM to grade a credential or claim that an LLM verified a fact merely because it produced a fluent answer.

## One comparison, one bookmarkable unit

### No-assumed-knowledge context

The scene is allowed to be familiar. The technical idea is not assumed to be familiar.

This path follows the academy-wide [No assumed knowledge standard](NO_ASSUMED_KNOWLEDGE_STANDARD.md). The requirements below apply that shared standard to claim comparisons. They do not create a separate learner category or course mode.

Before the seven comparison sections, every unit shows a small `Before we compare` block with:

- one sentence stating what the learner will be able to explain;
- two to five plain-language term definitions;
- the platform or system boundary in the example;
- what is prepared for the learner and what, if anything, they will do;
- `Start now`, `Review a refresher`, and `Read the short context` as equal choices;
- a clear statement when no installation, account, terminal, model, or local change is needed.

`Start now` includes the minimum context on the same page. It must not send the learner away to earn access or hunt through another course.

Before authoring a comparison, the writer performs a hidden-context check:

1. List every word needed to understand the claim.
2. List every layer needed to understand the explanation.
3. List every permission, identity, platform, data, or network assumption.
4. Define each necessary item in the unit or link it as optional deeper study after giving the minimum explanation in place.
5. Remove any joke, analogy, acronym, or character reference that becomes a second prerequisite.
6. Ask a reviewer with no subject experience to identify the first sentence they cannot explain.
7. Repair that sentence before publication.

Examples of commonly hidden context include what a file is, what a program is, why a user account has permissions, what a network packet represents, what a server does, what a token is in an AI lesson, and why a source date matters. None of these is treated as obvious.

Every comparison uses the same seven visible sections in this order:

1. **The claim or scene:** A short paraphrase of what the learner may have seen or heard.
2. **What is plausible:** The part that could happen under stated conditions.
3. **What is exaggerated or missing:** The hidden time, people, tools, permissions, failures, tradeoffs, or uncertainty.
4. **The real underlying concept:** The accurate mental model, with new terms defined before use.
5. **Safe exercise or observation:** An L0 activity using prepared evidence. An optional L1 route may be linked separately.
6. **Defensive or professional takeaway:** What a careful learner or practitioner would do next.
7. **Short knowledge check:** One question with immediate answer-specific feedback and another attempt.

The labels remain stable across all five subjects. A learner should not have to learn a new page structure for each school.

### Unit size and stopping points

- One comparison takes about 5 to 8 minutes.
- The claim appears in no more than two short paragraphs.
- The core technical explanation aims for 250 to 450 words before optional detail.
- One diagram, trace, table, or worked example may replace part of the prose.
- The exercise contains one decision or observation, not a long task list.
- The knowledge check contains one main idea.
- After every two comparisons, the page shows `Stop here and return later` and saves the exact position.
- A course page shows the current comparison and the next comparison without a large decorative header.
- Optional detail opens in place and does not force the learner through extra scrolling.

Short, predictable segments, reduced distraction, and explicit stopping points are the default design for every learner. They are not a separate course mode or learner label.

## Evidence and source contract

Every published comparison carries two separate evidence records:

1. **Claim evidence:** Where the scene or popular claim came from.
2. **Reality evidence:** What supports the technical explanation.

A true statement about one version, platform, organization, benchmark, model, or historical moment must not be widened into a universal statement.

### Required evidence fields

| Field | Requirement |
| --- | --- |
| `comparisonId` | Stable identifier that does not change when the title changes |
| `claimType` | `specific-work`, `specific-public-claim`, `recurring-scene-pattern`, or `common-misconception` |
| `claimSources` | Exact work, episode, chapter, scene, advertisement, article, post, or a documented set of examples |
| `claimDate` | Release or publication date when known |
| `claimObservedAt` | Date the author opened or observed the source |
| `realitySources` | Direct links or citations supporting the underlying concept and limits |
| `sourceVersions` | Standard number, software version, document revision, model revision, or edition where relevant |
| `platformScope` | Windows, WSL, macOS, Linux, browser-only, or another explicit environment |
| `evidenceLabel` | `documented`, `supported-inference`, `illustrative`, `disputed`, or `outdated` |
| `lastVerifiedAt` | Date a human author opened the sources and checked the public explanation |
| `reviewDueAt` | Date by which volatile claims must be checked again |
| `verificationNotes` | Conditions, uncertainty, conflicts, and what was not verified |
| `rightsNotes` | Whether the lesson uses only paraphrase, licensed media, public-domain material, or another reviewed basis |

`lastVerifiedAt` means a named reviewer opened the cited material and checked the wording. It must not be filled automatically from a build date.

### Source preference

Use the strongest available source for the type of claim:

1. An applicable standard, specification, protocol document, official manual, upstream project documentation, model card, dataset card, security advisory, or research paper.
2. A government, standards body, university, or established nonprofit technical source.
3. A vendor source for that vendor's own behavior, clearly labeled as a vendor statement.
4. A careful secondary explanation when primary material is unavailable or unsuitable for a beginner.
5. A community report only when it is the subject of the lesson or no stronger evidence exists, with uncertainty shown.

An LLM answer, search-result summary, social-media repetition count, promotional benchmark, dramatic reenactment, or unsourced infographic is not reality evidence by itself.

### Freshness rules

- Version-sensitive software, model, compatibility, platform, and product claims are reviewed at least every 180 days.
- Active security guidance, advisories, threat claims, and tool-specific defensive behavior are reviewed at least every 90 days.
- Benchmark and hardware-fit claims include the exact test conditions and are reviewed at least every 90 days while used as current guidance.
- Standards and historical claims are checked when the cited edition changes or during the annual curriculum review.
- A comparison that misses its review date remains directly readable with a visible `Review overdue` label. Remove or replace any active safety instruction until it is rechecked.
- If a comparison becomes unsafe or unsupported, keep its canonical route open as a dated withdrawal record. Explain what changed, preserve safe historical context, and link to the corrected deeper study. Do not replace it with a locked or hidden card.
- When reality changes, preserve the old explanation only as dated history. Do not silently edit the date away.

### Publication evidence review

Before publication, another reviewer must be able to answer yes to each question:

- Can I locate the source of the claim?
- Does the lesson paraphrase only what is needed?
- Can I locate the sources for the technical explanation?
- Does each source support the sentence attached to it?
- Are date, version, platform, and test conditions visible where they matter?
- Are facts, interpretations, and unknowns labeled separately?
- Does the safe exercise avoid proving more than it observes?
- Does the takeaway point toward authorized, reversible, professional behavior?
- Does the knowledge-check feedback explain why, rather than only showing correct or incorrect?

## Lab and assessment boundary

The core path uses the shared [Lab, assessment, and credential standard](LAB_ASSESSMENT_CREDENTIAL_STANDARD.md).

- Every core exercise is L0 reading and planning.
- Prepared logs, code, diagrams, route tables, benchmark summaries, model cards, and configuration excerpts use synthetic or redistribution-safe data.
- An optional L1 observation may be offered only through a separate lab page with platform-specific instructions.
- Every optional observation has a browser-only prepared-evidence alternative.
- No comparison requires administrator access.
- No comparison asks for real credentials, private logs, proprietary code, packet captures, private prompts, model weights, or training data.
- Cybersecurity activities remain conceptual and defensive.
- Network activities do not scan or contact public targets.
- AI activities do not run inference or training on the site.
- A0 self-check answers stay open and appear immediately after an attempt.
- Completion records may record reading and practice. They do not claim professional competence.

## Course map

| Course | Subject | Core comparisons | Typical time | Canonical deeper study |
| --- | --- | ---: | ---: | --- |
| RVF-100 | Programming on screen and at work | 6 | 45 to 60 minutes | Programming schools and beginner soft landing |
| RVF-200 | Linux claims and operating-system reality | 8 | 60 to 80 minutes | [Linux curriculum](LINUX_CURRICULUM.md) |
| RVF-300 | Cybersecurity drama and defensive reality | 8 | 60 to 80 minutes | [Cybersecurity curriculum](CYBERSECURITY_CURRICULUM.md) |
| RVF-400 | Network shortcuts and packet reality | 8 | 60 to 80 minutes | [Networking curriculum](NETWORKING_CURRICULUM.md) |
| RVF-500 | AI and local-model claims | 9 | 70 to 90 minutes | [Local models and LLM curriculum](LOCAL_MODELS_LLM_CURRICULUM.md) |

Suggested preparation for every course is none. Each unit may link to an optional refresher and a short context page. None of those links changes access.

### Hierarchy and module stopping points

The academy hierarchy remains `Learning path > Course > Module > Unit`.

- This document defines one optional learning path.
- RVF-100 through RVF-500 are courses.
- Each row below is a module with its own bookmarkable outline and durable stopping point.
- Each numbered comparison is one bookmarkable unit with the complete seven-part structure.
- A module may contain one comparison when combining it with another would create two unrelated goals.

| Course | Module | Comparison units |
| --- | --- | --- |
| RVF-100 | Build and execution | RVF-101 and RVF-102 |
| RVF-100 | Layers and error evidence | RVF-103 and RVF-104 |
| RVF-100 | Generated code and maintainability | RVF-105 and RVF-106 |
| RVF-200 | Interface and privilege | RVF-201 and RVF-202 |
| RVF-200 | Security and total cost | RVF-203 and RVF-204 |
| RVF-200 | Filesystem and distribution choice | RVF-205 and RVF-206 |
| RVF-200 | Adoption and compatibility | RVF-207 and RVF-208 |
| RVF-300 | Authentication and authorization scope | RVF-301 and RVF-302 |
| RVF-300 | Attribution and distributed evidence | RVF-303 and RVF-304 |
| RVF-300 | Control boundaries | RVF-305 and RVF-306 |
| RVF-300 | Response and coordinated work | RVF-307 and RVF-308 |
| RVF-400 | Local links and observed identity | RVF-401 and RVF-402 |
| RVF-400 | Privacy boundaries | RVF-403 and RVF-404 |
| RVF-400 | Performance and service checks | RVF-405 and RVF-406 |
| RVF-400 | Translation and routing policy | RVF-407 and RVF-408 |
| RVF-500 | Model behavior and fit | RVF-501 and RVF-502 |
| RVF-500 | Privacy and method choice | RVF-503 and RVF-504 |
| RVF-500 | Grounding and sampling | RVF-505 and RVF-506 |
| RVF-500 | Evaluation and training scale | RVF-507 and RVF-508 |
| RVF-500 | Quantization tradeoffs | RVF-509 |

At the end of every module, the learner sees a recap, `Stop here`, `Continue to the next module`, and `Open deeper study`. `Stop here` saves the exact unit and section. It does not reduce progress or start a deadline.

## RVF-100: Programming on screen and at work

**Outcome:** Explain how real software is planned, written, checked, changed, and maintained without treating typing speed or dramatic output as evidence of quality.

**Platform:** `reading-only` on any current browser-capable device.

### RVF-101: A complete program appears in one burst of typing

1. **The claim or scene:** One person types continuously for a minute and produces a complete working system.
2. **What is plausible:** An experienced programmer can write a familiar small function quickly, especially when libraries and an existing project already provide most of the system.
3. **What is exaggerated or missing:** The scene usually omits requirements, design, dependencies, failed attempts, tests, review, security checks, deployment, documentation, and the work already present in the project.
4. **The real underlying concept:** Software development is iterative. A feature is divided into smaller behaviors, each behavior is changed and checked, and the result is reviewed in the context of a larger system.
5. **Safe exercise or observation:** Put prepared cards for a small login-message change in a sensible order: understand request, inspect current code, change one behavior, run a test, review the difference, and document the result.
6. **Defensive or professional takeaway:** Ask what was changed, what was checked, what assumptions remain, and how the change can be reversed. Do not use typing speed as a quality measure.
7. **Short knowledge check:** Which evidence best supports that a feature is ready: fast typing, many lines, a passing reviewed test tied to the requirement, or colorful terminal output? Expected idea: the reviewed evidence tied to the requirement.

### RVF-102: Code works correctly the first time

1. **The claim or scene:** The first run produces the intended result with no error, test failure, or unexpected behavior.
2. **What is plausible:** Very small, familiar examples sometimes work on the first run.
3. **What is exaggerated or missing:** Correct syntax does not prove correct behavior. Real programs meet unexpected input, platform differences, dependency changes, ambiguous requirements, and mistakes.
4. **The real underlying concept:** Syntax errors prevent a language tool from understanding code. Runtime errors happen while a program runs. Logic errors produce a valid but wrong result. Testing and observation help distinguish them.
5. **Safe exercise or observation:** Read three prepared examples and label one syntax error, one runtime error, and one logic error. No code runner is required.
6. **Defensive or professional takeaway:** Treat errors as evidence. Read the location and message, reproduce the behavior, change one cause, and check again.
7. **Short knowledge check:** A program runs but calculates the wrong total. Is that proof of correct code? Expected idea: no; successful execution does not rule out a logic error.

### RVF-103: One programming language controls the whole system

1. **The claim or scene:** Knowing one language is shown as direct control over every device, application, network, and service.
2. **What is plausible:** One language can automate many tasks when the operating system, libraries, permissions, and service interfaces support it.
3. **What is exaggerated or missing:** A language cannot bypass missing permissions, undocumented hardware, network boundaries, incompatible runtimes, or an absent service interface merely because code was written.
4. **The real underlying concept:** Programs work through layers: language, runtime or compiler, libraries, operating system, device drivers, protocols, and authorized service interfaces.
5. **Safe exercise or observation:** Match six prepared tasks to the layer that actually performs the work, such as opening a file, resolving a name, drawing a window, or sending a request.
6. **Defensive or professional takeaway:** Identify the responsible layer and its permission boundary before choosing a language or tool.
7. **Short knowledge check:** What usually lets a program request work from another service: the language name alone or an authorized interface with defined behavior? Expected idea: the authorized interface.

### RVF-104: Error messages are meaningless noise

1. **The claim or scene:** A wall of red text means the computer failed mysteriously and the only response is random typing or a restart.
2. **What is plausible:** Error messages can be dense, poorly written, or followed by less useful secondary messages.
3. **What is exaggerated or missing:** Many messages include a source location, failed operation, expected value, actual value, or named dependency. Restarting may hide a symptom without identifying the cause.
4. **The real underlying concept:** An error message is structured evidence from a compiler, runtime, operating system, library, or service. The first relevant cause often explains later effects.
5. **Safe exercise or observation:** Highlight the tool name, file, line, operation, and plain-language clue in a prepared error message.
6. **Defensive or professional takeaway:** Record the exact message, identify which layer produced it, check the first actionable cause, and avoid changing several things at once.
7. **Short knowledge check:** What should a learner preserve before asking for help: a paraphrase from memory or the exact message and the action that produced it? Expected idea: the exact evidence and reproduction step.

### RVF-105: AI-generated code is finished software

1. **The claim or scene:** A prompt produces a complete application that can be trusted and released without human inspection.
2. **What is plausible:** A coding model can draft familiar patterns, explain an example, transform bounded text, or help create tests.
3. **What is exaggerated or missing:** The output may misunderstand the requirement, invent an interface, use an insecure pattern, miss edge cases, copy incompatible assumptions, or produce code with unclear rights and dependencies.
4. **The real underlying concept:** Generated code is an unverified proposal. It needs the same requirement check, review, tests, security review, dependency review, and maintenance ownership as other code.
5. **Safe exercise or observation:** Compare a prepared requirement with a short generated function and mark one correct behavior, one unsupported assumption, and one missing test.
6. **Defensive or professional takeaway:** Keep human ownership. Review the difference, test meaningful cases, verify dependencies and licenses, and reject output that cannot be explained.
7. **Short knowledge check:** What changes generated code from a suggestion into acceptable project code? Expected idea: evidence that it meets the requirement and project standards after human review.

### RVF-106: More code means a more advanced solution

1. **The claim or scene:** A large screen of dense code is treated as evidence that the program is powerful or the programmer is skilled.
2. **What is plausible:** Some problems genuinely require substantial code and careful handling of many cases.
3. **What is exaggerated or missing:** Extra code can add defects, duplicated logic, hidden state, maintenance cost, and attack surface. A smaller solution is not automatically better either.
4. **The real underlying concept:** Code is a maintenance responsibility. Quality depends on clear behavior, appropriate design, tests, readability, performance needs, and controlled complexity.
5. **Safe exercise or observation:** Compare two prepared solutions to the same small requirement and identify duplication, named intent, testability, and one tradeoff in each.
6. **Defensive or professional takeaway:** Prefer the simplest solution that clearly meets the requirement and its safety, performance, and maintenance constraints.
7. **Short knowledge check:** Can line count alone determine which solution is better? Expected idea: no; quality depends on behavior and constraints.

**Stopping point:** The learner may stop here with RVF-100 recorded independently. No other course depends on it.

## RVF-200: Linux claims and operating-system reality

**Outcome:** Replace common Linux myths with a practical model of users, permissions, software sources, files, distributions, compatibility, and maintenance.

**Platform:** Core units are `reading-only`. Optional L1 observations must offer separate Windows, WSL, macOS, and Linux routes plus prepared output.

### RVF-201: A terminal is a hacker screen

1. **The claim or scene:** Dark windows full of text are presented as proof that someone is hacking or using a special hidden operating system.
2. **What is plausible:** Administrators, developers, defenders, researchers, and attackers may all use command-line tools because text commands are precise and repeatable.
3. **What is exaggerated or missing:** A terminal is an interface, not an intent. Ordinary tasks include navigating files, reading logs, installing reviewed software, and managing services.
4. **The real underlying concept:** A terminal displays text and accepts input. A shell reads commands. The operating system and each program decide what those commands can do under the current account's permissions.
5. **Safe exercise or observation:** Label the terminal, shell prompt, command, argument, output, and exit status in a prepared screenshot made for the course.
6. **Defensive or professional takeaway:** Ask what command ran, under which account, against which target, and with what result. The visual style proves none of those facts.
7. **Short knowledge check:** Does opening a terminal grant extra permission? Expected idea: no; permissions come from the account and system controls.

### RVF-202: `sudo` or root is needed for every Linux task

1. **The claim or scene:** Every command is prefixed with `sudo`, or root access is treated as normal working mode.
2. **What is plausible:** Some system-wide changes legitimately require administrative permission.
3. **What is exaggerated or missing:** Reading personal files, editing a project, running many programs, and most learning tasks should not require root. Unnecessary privilege increases the effect of mistakes.
4. **The real underlying concept:** Linux separates users, groups, ownership, permissions, capabilities, and administrative policy. Least privilege means using only the authority needed for one task.
5. **Safe exercise or observation:** Classify prepared tasks as standard-user work, read-only inspection, or a controlled administrative change. Explain why.
6. **Defensive or professional takeaway:** Inspect first. Use an ordinary account by default, understand the exact administrative action, capture the prior state, and keep a rollback route.
7. **Short knowledge check:** Why avoid routine root use? Expected idea: it reduces the chance and impact of an error or compromised program.

### RVF-203: Linux is automatically secure

1. **The claim or scene:** Installing Linux is presented as a complete security control that removes the need for updates, safe configuration, backups, or account protection.
2. **What is plausible:** Linux provides mature permission, isolation, update, logging, and security-control mechanisms, and many distributions have useful secure defaults.
3. **What is exaggerated or missing:** Unsupported software, exposed services, weak credentials, excessive privilege, unsafe packages, missing backups, and poor operations can make any platform unsafe.
4. **The real underlying concept:** Security is an ongoing system of inventory, supported software, configuration, identity, updates, network boundaries, observation, recovery, and ownership.
5. **Safe exercise or observation:** Review two synthetic server summaries and identify which evidence matters more than the operating-system label.
6. **Defensive or professional takeaway:** Verify the actual version, services, users, exposure, update status, logs, and recovery plan. Do not use a platform name as a security conclusion.
7. **Short knowledge check:** Which is stronger evidence: `runs Linux` or `supported version, limited services, current updates, tested backup`? Expected idea: the specific verified controls.

### RVF-204: Free software has no cost

1. **The claim or scene:** A zero license price is treated as zero total cost.
2. **What is plausible:** Linux and open-source software can reduce licensing barriers and let learners inspect, modify, and redistribute software under its license terms.
3. **What is exaggerated or missing:** Hardware, migration, training, support, integration, downtime, governance, security maintenance, and staff time still have costs.
4. **The real underlying concept:** Total cost includes acquisition, operation, support, change, risk, recovery, and retirement. Open source describes rights under a license, not the absence of responsibility.
5. **Safe exercise or observation:** Build a prepared two-column decision record that separates license cost from migration and operating costs.
6. **Defensive or professional takeaway:** Compare complete workload needs and support ownership. A good decision may still choose Linux, Windows, macOS, or a mixed environment.
7. **Short knowledge check:** Does a zero license fee remove support and maintenance work? Expected idea: no.

### RVF-205: The Linux directory tree is arbitrary

1. **The claim or scene:** Names such as `/etc`, `/var`, `/usr`, and `/bin` are treated as random historical clutter that no one can explain.
2. **What is plausible:** The names are compact, history influenced them, distributions differ, and merged `/usr` makes a simplified diagram incomplete.
3. **What is exaggerated or missing:** Many locations express useful boundaries between configuration, variable data, user data, runtime state, devices, pseudo-filesystems, optional software, and mounted storage.
4. **The real underlying concept:** The filesystem hierarchy helps people and software predict ownership, persistence, backup needs, and package behavior. Standards guide it, but real systems include links and distribution choices.
5. **Safe exercise or observation:** Place synthetic configuration, logs, uploads, cache, runtime sockets, user documents, and optional application files into a prepared directory tree.
6. **Defensive or professional takeaway:** Ask who writes a path, whether it persists, whether a package owns it, whether it belongs in backup, and whether the distribution documents a difference.
7. **Short knowledge check:** Which location normally fits changing service logs better: `/etc` or `/var`? Expected idea: `/var`, while exact subpaths remain distribution and service specific.

### RVF-206: One Linux distribution is best for everyone

1. **The claim or scene:** A ranking or confident recommendation declares one distribution the universal winner.
2. **What is plausible:** A distribution may fit a defined workload, support model, hardware set, learning goal, or software need very well.
3. **What is exaggerated or missing:** Release cadence, support lifetime, package availability, hardware support, administration model, community, commercial support, and migration needs differ.
4. **The real underlying concept:** Distribution choice is a requirements decision. The best fit depends on a named user, workload, support owner, lifecycle, and recovery plan.
5. **Safe exercise or observation:** Choose among three fictional distribution profiles for a home learner, a stable server, and a current-hardware desktop. State the missing evidence.
6. **Defensive or professional takeaway:** Define requirements before naming a distribution, pilot the workload, and keep a rollback route.
7. **Short knowledge check:** What should come first: a distribution ranking or a workload and support inventory? Expected idea: the inventory.

### RVF-207: Every organization is abandoning Windows for Linux

1. **The claim or scene:** A headline or discussion turns growth in one workload into a claim that all organizations are replacing Windows everywhere.
2. **What is plausible:** Linux is common in servers, cloud systems, containers, embedded devices, networking, development, security, and research. Some organizations do migrate specific workloads.
3. **What is exaggerated or missing:** Desktop applications, identity, device management, staff skills, vendor support, regulation, hardware, and existing investments often produce mixed estates or a decision to remain on another platform.
4. **The real underlying concept:** Adoption statistics describe a measured population, date, and method. Workload migration is a staged technical and organizational decision, not a universal trend line.
5. **Safe exercise or observation:** Read the title, sample, date, population, and method from a prepared survey excerpt, then rewrite one overbroad conclusion accurately.
6. **Defensive or professional takeaway:** Cite the measured population and date. Pilot one workload, measure results, and preserve a rollback choice.
7. **Short knowledge check:** Can cloud-container adoption prove that every desktop is moving to Linux? Expected idea: no; the populations and workloads differ.

### RVF-208: Linux gaming never works, or always works now

1. **The claim or scene:** Linux gaming is described as either impossible or completely identical to Windows for every game and device.
2. **What is plausible:** Many games run well through native builds or compatibility layers, and support has improved. Some games, anti-cheat systems, launchers, media components, controllers, and drivers still differ.
3. **What is exaggerated or missing:** Compatibility changes over time and depends on exact game build, distribution, kernel, driver, hardware, launcher, anti-cheat policy, and user tolerance for repair.
4. **The real underlying concept:** Compatibility is a testable matrix, not a permanent yes or no. A migration plan must identify critical games and peripherals before changing the main computer.
5. **Safe exercise or observation:** Complete a prepared compatibility worksheet for three fictional games using dated official requirements and clearly labeled community evidence.
6. **Defensive or professional takeaway:** Verify each critical workload, test from a live environment or spare installation where appropriate, back up data, and keep the current system until the pilot succeeds.
7. **Short knowledge check:** What makes a compatibility report useful: `works for me` or exact date, hardware, software versions, settings, and observed result? Expected idea: the dated conditions and evidence.

**Stopping point:** The learner may stop here with RVF-200 recorded independently. The Linux School remains directly open whether or not this course is complete.

## RVF-300: Cybersecurity drama and defensive reality

**Outcome:** Recognize dramatic security shortcuts, identify the evidence and authorization they omit, and choose a safe defensive next step.

**Platform:** `reading-only`. All evidence is synthetic or prepared. There is no active exploitation route in this course.

### RVF-301: A password is cracked instantly from a login screen

1. **The claim or scene:** A character watches rapidly changing text and discovers a password in seconds without knowing how the system stores or verifies it.
2. **What is plausible:** Weak or reused credentials can be exposed through prior breaches, unsafe recovery, poor storage, phishing, guessing, or an already compromised device.
3. **What is exaggerated or missing:** Rate limits, multi-factor authentication, password hashing, account lockout, identity logs, network position, authorization, computing cost, and the distinction between online and offline conditions are omitted.
4. **The real underlying concept:** Authentication verifies a claim about identity. Defensive strength depends on the full path: credential creation, storage, recovery, rate control, additional factors, session handling, monitoring, and user support.
5. **Safe exercise or observation:** Compare three synthetic authentication designs and identify defensive controls and recovery weaknesses. Do not test passwords.
6. **Defensive or professional takeaway:** Use unique credentials, a password manager, phishing-resistant authentication where available, safe recovery, and monitoring. Never attempt credential access without explicit authorization.
7. **Short knowledge check:** Does a strong password alone protect an unsafe recovery process? Expected idea: no; recovery is part of the authentication system.

### RVF-302: One command hacks any target

1. **The claim or scene:** A single generic command immediately gives complete control of any named target.
2. **What is plausible:** Automation can combine several known steps against a specifically vulnerable, reachable, and permitted lab system.
3. **What is exaggerated or missing:** Asset discovery, versions, configuration, access path, authentication, defenses, scope, failed attempts, evidence, consequences, and legal authorization determine what is possible and allowed.
4. **The real underlying concept:** Security findings are conditional. A weakness needs an affected asset, reachable path, relevant configuration, and impact. A tool result is not the same as verified control of a system.
5. **Safe exercise or observation:** Review a synthetic finding and mark the target, claimed condition, missing evidence, possible impact, and safe verification owner.
6. **Defensive or professional takeaway:** Start with ownership and scope. Reproduce only in a purpose-built isolated lab, preserve evidence, repair the condition, and verify the repair.
7. **Short knowledge check:** What must be established before technical testing: dramatic urgency or owner, authorization, target, allowed actions, and stop conditions? Expected idea: the written boundary.

### RVF-303: An attacker can be identified immediately

1. **The claim or scene:** One IP address, username, language setting, or tool name reveals the person or government responsible.
2. **What is plausible:** Evidence can connect events to accounts, infrastructure, tools, behaviors, and time periods. Several independent sources can support a bounded attribution judgment.
3. **What is exaggerated or missing:** Shared services, compromised hosts, VPNs, relays, copied tools, false flags, clock errors, incomplete logs, and jurisdiction make identity claims difficult.
4. **The real underlying concept:** Attribution is an evidence assessment with confidence and alternatives. An indicator shows an observed connection, not necessarily who controlled the endpoint or why.
5. **Safe exercise or observation:** Rank the strength of synthetic evidence and separate `observed`, `inferred`, and `unknown` statements.
6. **Defensive or professional takeaway:** Act on confirmed risk without overstating identity. Record sources, confidence, competing explanations, and what evidence could change the conclusion.
7. **Short knowledge check:** Is an IP address by itself proof of a person's identity? Expected idea: no.

### RVF-304: Deleting one log erases all evidence

1. **The claim or scene:** Removing a visible history file makes an event impossible to investigate.
2. **What is plausible:** Missing or altered logs can remove useful evidence and make reconstruction harder.
3. **What is exaggerated or missing:** Identity providers, endpoints, applications, network devices, remote collectors, backups, caches, file metadata, and other systems may record related events. Missing data can itself be relevant.
4. **The real underlying concept:** An activity crosses several systems and may leave distributed evidence. Good logging has defined sources, time synchronization, access control, retention, integrity, and known gaps.
5. **Safe exercise or observation:** Reconstruct a synthetic timeline from five sources after one source is removed. Mark what remains provable and what becomes uncertain.
6. **Defensive or professional takeaway:** Centralize appropriate logs, protect them, minimize sensitive data, test collection, and document gaps before an incident.
7. **Short knowledge check:** If one log is missing, should an investigator claim there is no evidence? Expected idea: no; inspect other sources and state the limitation.

### RVF-305: Antivirus catches every threat

1. **The claim or scene:** A green shield proves a device is safe, or one alert explains the entire incident.
2. **What is plausible:** Endpoint protection can prevent or detect many known and behavioral threats and can provide valuable investigation evidence.
3. **What is exaggerated or missing:** Coverage, configuration, update state, disabled sensors, unsupported behavior, false positives, false negatives, identity abuse, cloud activity, and recovery still matter.
4. **The real underlying concept:** Defense uses layers: prevention, least privilege, updates, identity, network boundaries, application control, observation, backups, response, and recovery.
5. **Safe exercise or observation:** Map a synthetic incident across controls and identify which control prevented, detected, limited, or recovered from each effect.
6. **Defensive or professional takeaway:** Verify sensor health and coverage, investigate evidence in context, and keep tested recovery rather than relying on one product state.
7. **Short knowledge check:** What does a green status prove? Expected idea: only the defined checks of that product at that time, not complete safety.

### RVF-306: Encryption or an air gap makes a system invulnerable

1. **The claim or scene:** Encrypted data or a disconnected network is treated as protection from every threat.
2. **What is plausible:** Encryption can protect confidentiality and integrity in defined states. Isolation can remove many network paths.
3. **What is exaggerated or missing:** Keys, endpoints, users, software updates, removable media, backups, physical access, configuration, metadata, availability, and operational work remain attack or failure paths.
4. **The real underlying concept:** A control addresses a threat model. It has assumptions, boundaries, dependencies, failure modes, and recovery needs.
5. **Safe exercise or observation:** For a fictional offline archive, identify what encryption protects, what it does not protect, who holds keys, how updates arrive, and how recovery is tested.
6. **Defensive or professional takeaway:** State the control goal and boundary. Protect keys and endpoints, control transfer paths, and verify recovery.
7. **Short knowledge check:** Does encryption by itself prevent an authorized user from deleting a file? Expected idea: no; confidentiality and authorization or availability are different concerns.

### RVF-307: A defender should hack back

1. **The claim or scene:** Retaliating against suspected attacker infrastructure is shown as the fast, decisive, or heroic response.
2. **What is plausible:** Defenders may block infrastructure, preserve evidence, coordinate with providers, notify affected parties, and support authorized law-enforcement or legal processes.
3. **What is exaggerated or missing:** Attribution can be wrong, infrastructure may belong to another victim, actions may exceed authority, evidence may be damaged, and escalation can harm unrelated people.
4. **The real underlying concept:** Incident response prioritizes safety, scope, containment, evidence, recovery, communication, and authorized coordination.
5. **Safe exercise or observation:** Choose a safe next action in a synthetic incident from options including isolate, preserve, notify, block, recover, or retaliate. Explain the authorization boundary.
6. **Defensive or professional takeaway:** Contain what you own, document evidence, coordinate through approved channels, and do not access another system without explicit legal authority.
7. **Short knowledge check:** Why can retaliation hit a victim instead of an attacker? Expected idea: observed infrastructure may be compromised or shared, and attribution is uncertain.

### RVF-308: Cyber defense is a lone-genius job

1. **The claim or scene:** One person performs every investigation, technical change, legal decision, communication, and recovery step alone.
2. **What is plausible:** In a small organization, one person may initially notice a problem and perform several roles.
3. **What is exaggerated or missing:** Safe response needs system owners, identity and network knowledge, service operators, leadership, privacy or legal context, communications, vendors, and recovery owners.
4. **The real underlying concept:** Security is coordinated work with defined decision rights, handoffs, evidence, and accountability. Expertise includes asking for help and stating uncertainty.
5. **Safe exercise or observation:** Assign roles for a fictional service outage and incident. Identify who can authorize containment, restore data, contact users, and preserve records.
6. **Defensive or professional takeaway:** Build contacts and playbooks before an incident. Record who owns each decision and how work is handed off.
7. **Short knowledge check:** What is a strong response behavior when evidence crosses your role boundary? Expected idea: preserve it and escalate to the authorized owner with a clear handoff.

**Stopping point:** The learner may stop here with RVF-300 recorded independently. No active security lab is required.

## RVF-400: Network shortcuts and packet reality

**Outcome:** Explain what common network indicators do and do not prove, then trace a problem through the correct layer without contacting an outside target.

**Platform:** `reading-only`. Prepared diagrams, packet summaries, route tables, and service checks use documentation addresses and synthetic names.

### RVF-401: Full Wi-Fi bars mean the Internet works

1. **The claim or scene:** Strong signal bars are treated as proof that every site and service is reachable.
2. **What is plausible:** Strong bars may indicate a good radio signal between a device and a nearby access point.
3. **What is exaggerated or missing:** Association, authentication, local addressing, gateway reachability, DNS, routing, firewall policy, upstream service, and application behavior are separate stages.
4. **The real underlying concept:** A network path crosses layers and devices. Evidence at one link does not prove the complete end-to-end service.
5. **Safe exercise or observation:** Trace a prepared request through radio, access point, address assignment, gateway, DNS, route, and service. Mark the failure indicated by each symptom.
6. **Defensive or professional takeaway:** Test the path one boundary at a time and state exactly what each successful check proves.
7. **Short knowledge check:** What do strong bars most directly describe: local radio signal or end-to-end application health? Expected idea: local radio signal.

### RVF-402: An IP address identifies one person

1. **The claim or scene:** A single address is treated as a permanent identity and precise physical location for one individual.
2. **What is plausible:** An address can identify a network endpoint or translated connection observed at a time, and provider records may add context under lawful process.
3. **What is exaggerated or missing:** Addresses change and may be shared through NAT, carrier networks, proxies, VPNs, cloud services, compromised systems, and public access points. Location databases are estimates.
4. **The real underlying concept:** An IP address is a routing identifier within a version, prefix, time, and observation point. Identity requires other evidence.
5. **Safe exercise or observation:** Review four synthetic connection records and identify which additional time, account, device, translation, and provider evidence would be needed.
6. **Defensive or professional takeaway:** Retain timestamps and observation context, minimize personal claims, and do not label a person from an address alone.
7. **Short knowledge check:** Can two people appear behind one public address? Expected idea: yes, through address sharing such as NAT or provider systems.

### RVF-403: A VPN makes a user anonymous and safe

1. **The claim or scene:** Turning on a VPN is shown as hiding all identity, preventing tracking, and securing every device behavior.
2. **What is plausible:** A VPN can encrypt traffic between a device and the VPN endpoint and can change which public address an outside service observes.
3. **What is exaggerated or missing:** The VPN provider, account login, cookies, browser fingerprint, malware, endpoint security, DNS choices, split routes, service logs, and behavior can still reveal or expose information.
4. **The real underlying concept:** A tunnel changes the path and trust boundary. It moves some visibility from the local network or provider to the VPN operator and does not repair the endpoint or application.
5. **Safe exercise or observation:** Compare prepared before-and-after path diagrams and mark who can observe each segment and which risks remain unchanged.
6. **Defensive or professional takeaway:** Define the threat model, verify routes and DNS behavior, evaluate the provider and endpoint, and do not promise anonymity.
7. **Short knowledge check:** What does a VPN primarily change: every source of identity or the protected path to a tunnel endpoint? Expected idea: the path.

### RVF-404: Incognito mode hides activity from the network

1. **The claim or scene:** A private browser window is treated as invisible browsing.
2. **What is plausible:** Private mode normally limits which local browsing history, cookies, and form data remain after the session, depending on the browser.
3. **What is exaggerated or missing:** Sites, accounts, DNS services, local network administrators, Internet providers, VPN operators, and managed-device tools may still observe relevant metadata or activity.
4. **The real underlying concept:** Local browser storage, network transport, account identity, and remote service logs are different boundaries.
5. **Safe exercise or observation:** Sort prepared evidence into `stored on this browser`, `visible on the network path`, and `stored by the remote service`.
6. **Defensive or professional takeaway:** Use private mode for its documented local-storage purpose, not as an anonymity claim.
7. **Short knowledge check:** Does closing a private window delete a remote service's account log? Expected idea: no.

### RVF-405: Bandwidth is the same thing as speed

1. **The claim or scene:** A high advertised link rate is treated as proof that every interaction will feel instant.
2. **What is plausible:** More available throughput can reduce transfer time for sufficiently large transfers and multiple simultaneous flows.
3. **What is exaggerated or missing:** Latency, loss, jitter, congestion, server response, protocol behavior, Wi-Fi conditions, and application design affect experience.
4. **The real underlying concept:** Bandwidth is capacity over time. Latency is delay. Throughput is achieved data rate. Jitter is variation in delay. Loss and retries consume time and capacity.
5. **Safe exercise or observation:** Match video streaming, a large download, a game input, and a voice call to the measurements most likely to matter.
6. **Defensive or professional takeaway:** Measure the symptom-relevant quantity and record the path and time. Do not recommend a bigger plan before identifying the constraint.
7. **Short knowledge check:** Which matters most for a tiny interactive request: only maximum capacity or also round-trip delay? Expected idea: delay also matters.

### RVF-406: A successful ping proves the service works

1. **The claim or scene:** One successful ping is treated as proof that a website, game, database, or application is healthy.
2. **What is plausible:** A reply can show that a specific ICMP exchange reached an endpoint and returned under the tested conditions.
3. **What is exaggerated or missing:** DNS, TCP or UDP ports, TLS, authentication, application dependencies, content, policy, and reverse-path behavior may differ. Some healthy systems do not answer ping.
4. **The real underlying concept:** Each test checks a particular protocol, layer, address, direction, and moment. Application health needs an application-relevant check.
5. **Safe exercise or observation:** Given four prepared test results, state what each proves and what it leaves unknown.
6. **Defensive or professional takeaway:** Choose the least invasive test that matches the user's symptom, then move one layer at a time.
7. **Short knowledge check:** Can a host answer ping while its web service is stopped? Expected idea: yes.

### RVF-407: NAT is a firewall

1. **The claim or scene:** Private addressing and address translation are presented as a complete security policy.
2. **What is plausible:** Some translation devices create state for outbound connections and do not accept an unsolicited inbound flow without a mapping.
3. **What is exaggerated or missing:** Port forwarding, automatic mapping, internal threats, outbound connections, application flaws, IPv6, device exposure, and policy logging require explicit consideration.
4. **The real underlying concept:** NAT translates address or port information. A firewall applies an allow or deny policy with direction, state, service, identity or zone context, logging, and review.
5. **Safe exercise or observation:** Compare a prepared translation table with a firewall rule set and identify the different questions each answers.
6. **Defensive or professional takeaway:** Write explicit policy, verify both address families and directions, review automatic exposure, and log decisions that matter.
7. **Short knowledge check:** Does translating an address define which application traffic is authorized? Expected idea: no; translation and security policy are different functions.

### RVF-408: BGP chooses the shortest physical route

1. **The claim or scene:** Internet routing is shown as a map algorithm that always selects the geographically shortest or fastest line.
2. **What is plausible:** Routers compare available routes and apply an ordered decision process. Path length information can influence that choice.
3. **What is exaggerated or missing:** Import policy, local preference, business relationships, route validity, filtering, aggregation, communities, failures, and available advertisements shape the selected path. Geography is not the core BGP metric.
4. **The real underlying concept:** BGP exchanges reachability between autonomous systems and applies policy. The selected control-plane path may not be physically shortest, fastest, symmetric, or permanent.
5. **Safe exercise or observation:** Choose a route from a prepared three-provider table after applying explicit local policy and explain why a shorter-looking route was not selected.
6. **Defensive or professional takeaway:** Document policy, validate advertisements, filter routes, monitor changes, and test actual data-plane behavior in an isolated simulation.
7. **Short knowledge check:** Why might an autonomous system prefer a longer AS path? Expected idea: local policy or business and resilience requirements can take priority.

**Stopping point:** The learner may stop here with RVF-400 recorded independently. No packet capture or live network test is required.

## RVF-500: AI and local-model claims

**Outcome:** Replace anthropomorphic and product-style AI claims with a model of data, tokens, training, inference, evaluation, privacy boundaries, and measured fit.

**Platform:** `reading-only` and L0 prepared evidence. No model download, inference, fine-tuning, training, GPU, cloud account, or private prompt is required.

### RVF-501: A language model knows and understands like a person

1. **The claim or scene:** Fluent first-person text is treated as proof of human-like knowledge, intention, experience, or understanding.
2. **What is plausible:** A language model can produce useful language patterns, follow many instructions, summarize supplied text, and solve some tasks under tested conditions.
3. **What is exaggerated or missing:** Fluency does not prove consciousness, grounded experience, stable beliefs, current facts, intent, source awareness, or reliable reasoning. Behavior depends on training, input, system design, and sampling.
4. **The real underlying concept:** A language model processes tokens and predicts continuations from learned parameters and current context. A complete application may add retrieval, tools, rules, memory stores, and human review.
5. **Safe exercise or observation:** Label which parts of a prepared assistant diagram belong to the model, prompt, retrieval index, tool, ordinary code, and external database.
6. **Defensive or professional takeaway:** Describe observed capability precisely, verify important claims outside the model, and keep a non-AI fallback for high-impact decisions.
7. **Short knowledge check:** Does confident wording prove that the model checked a source? Expected idea: no.

### RVF-502: A larger model is always better

1. **The claim or scene:** Parameter count is used as a universal ranking for quality, safety, speed, cost, and task fit.
2. **What is plausible:** More capacity can improve some capabilities when data, training, architecture, and evaluation are appropriate.
3. **What is exaggerated or missing:** Task, data, architecture, adaptation, quantization, runtime, context, latency, memory, energy, license, privacy, and failure tolerance affect usefulness.
4. **The real underlying concept:** Model selection is a measured requirements decision. A baseline and representative evaluation cases matter more than one broad size label.
5. **Safe exercise or observation:** Choose between three synthetic model cards for an offline classification task with fixed memory, latency, license, and accuracy requirements.
6. **Defensive or professional takeaway:** Define acceptance criteria, test the smallest plausible candidates, record failures and resources, and preserve the unchanged baseline.
7. **Short knowledge check:** Can parameter count alone identify the best model for a laptop task? Expected idea: no.

### RVF-503: Running locally makes a model automatically private

1. **The claim or scene:** A `local` label is treated as proof that no data leaves the computer and no sensitive record remains.
2. **What is plausible:** A verified offline local runtime can keep inference on a learner-controlled device and reduce dependence on an outside service.
3. **What is exaggerated or missing:** Desktop applications, update checks, telemetry, model downloads, plugins, retrieval stores, logs, crash reports, network binding, backups, and operating-system services may still handle data.
4. **The real underlying concept:** Privacy is a data-flow property. It depends on components, network behavior, storage, retention, permissions, software provenance, and deletion.
5. **Safe exercise or observation:** Draw the data path for a prepared local assistant and mark inputs, local files, network-capable components, logs, backups, and deletion points.
6. **Defensive or professional takeaway:** Verify runtime and plugin behavior, bind services to loopback by default, inspect documented telemetry, minimize data, and test offline operation.
7. **Short knowledge check:** Is `installed on my computer` enough evidence that nothing is transmitted? Expected idea: no; the data path and network behavior must be checked.

### RVF-504: Fine-tuning gives a model current factual knowledge

1. **The claim or scene:** Adding examples through fine-tuning is treated as a reliable live database update.
2. **What is plausible:** Fine-tuning can change behavior, style, format, task performance, or response tendencies for a defined distribution.
3. **What is exaggerated or missing:** It does not create a guaranteed, citeable, easily updated fact store. New examples can be learned incompletely, conflict with existing behavior, or cause regressions.
4. **The real underlying concept:** Ordinary code, a database, prompt context, retrieval, fine-tuning, and training solve different problems. Current reference material often belongs in an updateable source with retrieval and verification.
5. **Safe exercise or observation:** Classify five prepared needs as ordinary code, prompt instruction, retrieval, fine-tuning, or training, and explain one tradeoff.
6. **Defensive or professional takeaway:** Choose the least complex method that satisfies update, citation, privacy, latency, and maintenance needs. Evaluate against an unchanged baseline.
7. **Short knowledge check:** Which method more directly supports updating a cited policy document tomorrow: retraining weights or updating a controlled retrieval source? Expected idea: the controlled source.

### RVF-505: Retrieval guarantees truthful answers

1. **The claim or scene:** Connecting a model to documents is presented as eliminating hallucination and making every answer correct.
2. **What is plausible:** Retrieval can supply relevant current text and make source-linked answers possible.
3. **What is exaggerated or missing:** Retrieval can miss the right document, rank the wrong passage, expose unauthorized content, accept poisoned text, lose context, or produce an answer not supported by the cited passage.
4. **The real underlying concept:** A retrieval system has ingestion, permissions, chunking, indexing, ranking, context assembly, generation, citation, evaluation, update, and deletion stages.
5. **Safe exercise or observation:** Inspect three prepared answers and source excerpts. Mark citation coverage, unsupported statements, retrieval misses, and access-policy concerns.
6. **Defensive or professional takeaway:** Measure retrieval separately from answer quality, enforce source access, show citations, test hostile documents, and preserve an `I do not know` route.
7. **Short knowledge check:** Can a cited answer still be unsupported? Expected idea: yes, when the source does not entail the claim or the answer adds material.

### RVF-506: Temperature fixes hallucinations

1. **The claim or scene:** One sampling slider is presented as a truth control.
2. **What is plausible:** Lower temperature often makes token selection less variable under the same prompt and model. It can improve repeatability for some tasks.
3. **What is exaggerated or missing:** A deterministic output can still be false. Training limits, missing context, ambiguous instructions, retrieval failures, tool errors, and evaluation design remain.
4. **The real underlying concept:** Sampling controls how output is selected from model probabilities. Factual reliability needs task design, evidence, tools where appropriate, checks, and human review.
5. **Safe exercise or observation:** Compare prepared outputs from repeated runs and classify variability separately from correctness.
6. **Defensive or professional takeaway:** Tune sampling for the task, but verify facts and structured requirements independently.
7. **Short knowledge check:** If a false answer repeats exactly at temperature zero, has it become true? Expected idea: no.

### RVF-507: One benchmark proves which model is best

1. **The claim or scene:** A leaderboard position or single score is treated as complete proof of real-world quality.
2. **What is plausible:** A well-designed benchmark can compare defined behavior under controlled conditions.
3. **What is exaggerated or missing:** Dataset leakage, narrow tasks, unclear prompts, model-judge bias, hardware differences, statistical variation, omitted failures, cost, latency, safety, and license may limit the conclusion.
4. **The real underlying concept:** Evaluation starts with a use case, acceptance criteria, baseline, held-out cases, failure categories, test conditions, uncertainty, and reproducibility.
5. **Safe exercise or observation:** Critique a synthetic leaderboard using its task coverage, sample size, test conditions, judge, dates, and missing operational measures.
6. **Defensive or professional takeaway:** Use several representative measures and inspect failures. State what the evaluation does and does not support.
7. **Short knowledge check:** What must be known before applying a benchmark to a local use case? Expected idea: whether its tasks, conditions, and measures match the requirements.

### RVF-508: A production model can be trained from scratch in minutes

1. **The claim or scene:** A few files and a progress bar produce a capable general model with no data, compute, evaluation, or release work.
2. **What is plausible:** A tiny educational model can train quickly on a small dataset and make the training loop visible. Adapters can also change a small model under bounded conditions.
3. **What is exaggerated or missing:** Data rights, collection, tokenization, architecture, compute, checkpoints, failed runs, validation, safety, evaluation, packaging, hardware, energy, documentation, and maintenance dominate serious work.
4. **The real underlying concept:** A small demonstration, fine-tuning, adapter training, continued pretraining, and full pretraining are different activities with different goals and costs.
5. **Safe exercise or observation:** Match four prepared experiment descriptions to tiny demonstration, adapter tuning, continued training, or from-scratch training. Estimate only the categories of resources required.
6. **Defensive or professional takeaway:** Name the training method precisely, state hardware and data conditions, budget for failure and evaluation, and do not widen a toy result into a production claim.
7. **Short knowledge check:** Does a tiny model learning a toy pattern prove that a general assistant can be trained the same way? Expected idea: no.

### RVF-509: Quantization is free compression with no tradeoff

1. **The claim or scene:** Reducing numerical precision is described as making a model smaller and faster with identical behavior in every task.
2. **What is plausible:** Quantization can reduce storage and memory and may improve performance enough to make local inference practical.
3. **What is exaggerated or missing:** Quality changes vary by method, model, layer, task, runtime, hardware, context, and calibration. Conversion and format compatibility can also fail.
4. **The real underlying concept:** Quantization represents model values with lower precision. It exchanges some numerical detail for resource savings and must be measured against the original baseline.
5. **Safe exercise or observation:** Compare a prepared table of size, memory, speed, and task results for several quantizations. Choose one for a stated requirement and explain the uncertainty.
6. **Defensive or professional takeaway:** Record the exact artifact and runtime, test representative cases, inspect failed categories, and keep the baseline available for comparison or rollback.
7. **Short knowledge check:** Can file size alone prove that a quantized model preserves required quality? Expected idea: no.

**Stopping point:** The learner may stop here with RVF-500 recorded independently. The Local Models and LLMs School remains directly open without this course or any model-capable hardware.

## Cross-course exercises

These exercises remain optional, open, and L0.

### Claim dissection

Choose one claim from any course and fill in:

- what was directly shown or stated;
- what the audience was asked to infer;
- what conditions would need to be true;
- which source could verify each condition;
- one safe observation;
- one conclusion the evidence would not support.

### Same pattern, different school

Compare one pattern across subjects:

| Pattern | Programming | Linux | Cybersecurity | Networking | AI |
| --- | --- | --- | --- | --- | --- |
| Visual confidence as proof | Dense code | Terminal output | Attack map | Signal bars | Fluent answer |
| One control solves everything | One language | Operating-system label | Antivirus | VPN or NAT | Retrieval or temperature |
| Speed as competence | Fast typing | One command | Instant compromise | Lowest-looking path | Fast benchmark |
| Missing boundary | Runtime and permission | User and privilege | Authorization and scope | Protocol and observation point | Data flow and evaluation |

The learner identifies the evidence needed before accepting each conclusion.

### Evidence repair

The learner receives a short claim with no date, version, source, or platform. They rewrite it so that another person could test or challenge it. Full credit is possible when the honest result is `not enough evidence yet`.

### Final optional project: Build a reality notebook

Choose three claims from at least two subjects. For each claim:

1. Record the exact source or label it as a recurring scene pattern.
2. Record the release or publication date and the date you observed it.
3. Paraphrase only the part needed for the lesson.
4. Find at least one strong reality source.
5. Separate the plausible part from what is missing.
6. Define the real concept in plain language.
7. Design an L0 safe observation.
8. State a professional takeaway.
9. Write one knowledge check and answer-specific feedback.
10. Record uncertainty and the next review date.

This project may receive an ordinary completion record. It does not establish professional skill, legal identity, authorship, or independent verification.

## Feedback rules

Knowledge-check feedback uses this sequence:

1. State what the learner noticed correctly.
2. Name the missing distinction without blame.
3. Reconnect the answer to the evidence on the page.
4. Offer another attempt with one changed example.
5. Leave the explanation visible after completion.

Avoid feedback such as `Obviously`, `Everyone knows`, `Wrong again`, `You fell for it`, or `Only beginners think this`. The lesson corrects a model of the system, not the learner's worth.

## Page and visual design

- Use a readable teaching column with a second evidence area only when the screen is wide enough.
- On narrow screens, show claim, explanation, evidence, exercise, and check in that order.
- Keep the seven stable section labels visible in a small progress list.
- Use a two-state evidence marker such as `shown` and `inferred`, plus a separate `unknown` state. Color is not the only signal.
- Do not use green falling code, anonymous hoodie portraits, glitch effects, flashing lights, spaceships, or space stations.
- Do not recreate a film or television frame.
- Prefer original diagrams, timelines, annotated prepared output, decision trees, and source cards.
- Keep source date and review status near the claim, not in a hidden footer.
- Every diagram has useful alt text and a text equivalent.
- Every control works with a keyboard at 200 percent zoom without two-direction scrolling.
- Motion is unnecessary for the core explanation. If a packet or lifecycle animation is added, include step controls and a static equivalent.

## Authoring data model

A future content registry should represent a comparison separately from a normal prose block:

```json
{
  "comparisonId": "rvf-net-401",
  "courseId": "rvf-400",
  "title": "Full Wi-Fi bars mean the Internet works",
  "subject": "networking",
  "claimType": "common-misconception",
  "claim": "Strong signal bars prove that every Internet service is reachable.",
  "plausible": ["Bars may summarize radio signal between a device and an access point."],
  "missing": ["Addressing, DNS, routing, policy, upstream reachability, and the service remain untested."],
  "concepts": ["local link", "layered network path", "end-to-end service"],
  "exerciseId": "rvf-net-401-exercise",
  "knowledgeCheckId": "rvf-net-401-check",
  "takeaway": "Test one boundary at a time and state what each result proves.",
  "canonicalLinks": [],
  "riskClass": "L0",
  "supportedLanes": ["reading-only"],
  "platformScope": "browser-only prepared evidence",
  "claimDate": null,
  "claimSources": [
    {
      "recordId": "rvf-net-401-claim-set",
      "note": "Reviewed examples supporting the common-misconception label."
    }
  ],
  "realitySources": [
    {
      "title": "Requirements for Internet Hosts - Communication Layers",
      "url": "https://www.rfc-editor.org/rfc/rfc1122",
      "version": "RFC 1122",
      "observedAt": "2026-08-30",
      "supports": "The layered host communication model, not a product-specific signal indicator."
    }
  ],
  "evidenceLabel": "illustrative",
  "claimObservedAt": "2026-08-30",
  "lastVerifiedAt": "2026-08-30",
  "reviewDueAt": "2027-02-26",
  "verificationNotes": "Illustrative schema. Production review also checks current platform documentation for each signal indicator shown.",
  "rightsNotes": "Paraphrased common misconception; no third-party media used."
}
```

Arrays hold versioned source records rather than bare URLs. The registry rejects a public comparison when:

- any of the seven teaching sections is empty;
- no immediate A0 feedback exists;
- a specific claim lacks a claim source;
- a technical claim lacks reality evidence;
- a date-sensitive claim lacks a version or review date;
- `reviewDueAt` is earlier than the publication date;
- the core exercise is above L0;
- a cybersecurity exercise includes an active technique;
- a canonical deeper-study link points to hidden or unavailable content;
- the unit depends on voice, audio, video, or microphone access;
- third-party media lacks a reviewed rights record.

## Maintenance ownership

Each published comparison has:

- one subject owner who understands the underlying concept;
- one editor who checks plain language and the seven-part structure;
- one source reviewer who verifies links, dates, versions, and claim scope;
- a safety reviewer for every cybersecurity comparison and any dual-use material;
- an accessibility review before release;
- a recorded next review date;
- a withdrawal owner who can publish a dated withdrawal record for unsafe or unsupported material without hiding the route or breaking canonical deeper-study links.

Course-level totals are generated from the registry. They are not copied into several files by hand.

## Initial publication sequence

1. Publish the shared comparison component and evidence record with two low-risk programming examples.
2. Verify direct routes, keyboard use, 200 percent zoom, narrow-screen order, source display, and stopping-point persistence.
3. Add two Linux and two networking comparisons using only prepared evidence.
4. Complete an independent safety review before publishing the first cybersecurity comparison.
5. Add two L0 AI comparisons with no runtime or provider dependency.
6. Conduct a beginner review focused on whether the learner can separate `plausible`, `missing`, and `unknown`.
7. Expand one course at a time, with source dates and canonical links checked in the release gate.
8. Publish the optional reality-notebook project only after the source-entry form and rights guidance are usable without hidden instructions.

## Related plans

- [Curriculum blueprint index](README.md)
- [Academy expansion blueprint](ACADEMY_EXPANSION_BLUEPRINT.md)
- [No assumed knowledge standard](NO_ASSUMED_KNOWLEDGE_STANDARD.md)
- [Linux curriculum](LINUX_CURRICULUM.md)
- [Networking curriculum](NETWORKING_CURRICULUM.md)
- [Cybersecurity curriculum](CYBERSECURITY_CURRICULUM.md)
- [Local models and LLM curriculum](LOCAL_MODELS_LLM_CURRICULUM.md)
- [Lab, assessment, and credential standard](LAB_ASSESSMENT_CREDENTIAL_STANDARD.md)
- [Milestone roadmap](../../MILESTONES.md)
