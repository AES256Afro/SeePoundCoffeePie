# SeePoundCoffeePie academy expansion blueprint

Last reviewed: 2026-08-30

## Purpose

SeePoundCoffeePie is expanding from four programming-language schools into a broad technical learning platform. The long-range catalog includes programming, Linux, networking, cybersecurity, local models and LLMs, optional preparation, and optional cross-school learning paths such as Reality versus Fiction.

This blueprint defines how those subjects fit together. It is a product and curriculum contract, not finished course content and not production-release evidence.

The [No assumed knowledge standard](NO_ASSUMED_KNOWLEDGE_STANDARD.md) applies across that complete catalog. It is not a course, learner category, diagnosis field, accessibility badge, or medicalized path. It is the ordinary authoring, interface, accessibility, and release standard for every learner.

## Non-negotiable learner promises

- Every published course, module, unit, exercise, and lab guide is visible and directly open.
- A learner may start anywhere.
- Preparation paths are optional refreshers and introductions. They never lock teaching content.
- A harder page offers `Start now`, `Review a refresher`, and `Read the short context` rather than blocking the learner.
- Progress is information for the learner, not a permission system.
- Credential requirements may identify assessed work, but those requirements never hide the teaching material.
- Draft content stays outside the public catalog until it is complete enough to teach. Once published, it is not presented as locked or coming soon.
- The site teaches and records learning. Native operating-system work, network emulation, security labs, model inference, and model training run only in learner-controlled environments.
- No voice, microphone, or recorded narration is required.
- Use plain language, readable pages, useful diagrams, restrained color, and enough whitespace to understand the material.
- Never assume that a learner already knows an earlier course, common setup, interface convention, technical term, symbol, or abbreviation.
- Before a required action, define the terms, explain the purpose and context, identify the input, show the expected output, and provide recovery.
- Explain why a system was designed a certain way, not only which command to type.
- Show how to stop, recover, and undo changes before asking a beginner to change a machine.
- Use history and case studies to restore context between demanding practical sections.
- Reality-versus-fiction teaching remains optional cross-school context. It never becomes required preparation or a sixth technical school.

## The academy map

```text
SeePoundCoffeePie Academy
|
+-- Programming
|   +-- Python
|   +-- C++
|   +-- C#
|   +-- Java
|
+-- Linux and Open Systems
|
+-- Networking
|
+-- Cybersecurity
|
+-- Local Models and LLMs
|
+-- Cross-school Learning Paths
|   +-- Reality versus Fiction
|
+-- Optional Preparation and Refreshers
    +-- Computer basics
    +-- Files and folders
    +-- Command line
    +-- Technical reading
    +-- Troubleshooting
    +-- Virtual machines and WSL
    +-- Programming concepts
    +-- Math for computing
    +-- Networking basics
    +-- Security and lab safety
    +-- Git and reproducibility
```

These are separate learning domains. Linux, networking, cybersecurity, and local-model material must not be disguised as Python courses just because Python may appear in some labs. Reality versus Fiction links across those schools without copying their full technical instruction.

The no-assumed-knowledge standard does not appear as a node in this map because it is not learner content. It changes how every node is written, displayed, reviewed, and released. The platform never asks a learner to select or disclose a cognitive, medical, or disability category to receive clear teaching.

## Learning hierarchy

```text
School
+-- Learning path
    +-- Course
        +-- Module
            +-- Unit
                +-- Explanation
                +-- Worked example
                +-- Knowledge exercise
                +-- Optional local lab
                +-- Reflection or troubleshooting analysis
                +-- Summary
```

Definitions:

- **School:** A broad subject catalog.
- **Learning path:** An ordered suggestion for learning a larger capability.
- **Course:** A substantial subject with a clear outcome.
- **Module:** A focused part of a course.
- **Unit:** One bookmarkable teaching page. The current programming interface may label a unit as a lesson; new schemas use `unit` as the stable cross-school term.
- **Exercise:** An activity for recall, comparison, prediction, diagnosis, design, or practice.
- **Lab:** Guided work performed in a learner-controlled environment.
- **Project:** A deliverable composed of several skills or labs.
- **Capstone:** Independent work assessed against a published rubric.
- **Completion record:** A record of completed learning material, not a claim of professional competence.
- **Applied skill credential:** Evidence of one assessed practical capability.
- **Professional certificate:** Evidence across several applied capabilities and an integrative assessment.

The hierarchy takes inspiration from the way Microsoft Learn organizes units, modules, and learning paths, but SeePoundCoffeePie will use original content, visual design, terminology where needed, and assessment rules.

Reference: [Microsoft Learn content and resource types](https://learn.microsoft.com/en-ie/training/support/learn-content-types)

The universal clarity standard applies to every level of the hierarchy but adds no extra level. Reality versus Fiction uses the same hierarchy: one optional cross-school learning path contains five courses, each course contains modules, and each comparison is one bookmarkable unit.

## Universal no-assumed-knowledge standard

Every required action must provide or link the complete starting context without blocking the learner:

1. **Term:** Define every needed word, abbreviation, symbol, and interface label.
2. **Purpose:** Explain why the learner is doing the action.
3. **Context:** State where the learner is, what already happened, and what remains unchanged.
4. **Input:** Identify the exact files, values, commands, tools, accounts, or machine state used here.
5. **Action:** Give one clear instruction at a time and label its environment.
6. **Expected output:** Show what the learner should observe and what acceptable variation may look like.
7. **Recovery:** Explain how to stop, undo, restore, or request more context before loss occurs.

The complete [No assumed knowledge standard](NO_ASSUMED_KNOWLEDGE_STANDARD.md) defines predictable page anatomy, one clear action, optional depth, literal language, local glossary behavior, examples before abstraction, calm feedback, sensory restraint, focus views, scaling, keyboard and screen-reader access, saved progress, lab stages, assessment flexibility, required templates, prohibited patterns, a content review rubric, and measurable release gates.

It applies to everyone without creating a separate mode of learning. It must not produce:

- a catalog course;
- a learner category or recommended identity;
- a profile, transcript, analytics, or assessment diagnosis field;
- a request for medical or disability proof;
- a path that lowers the intended learning outcome;
- an access gate for learners who skip optional context.

If a lesson would become too long, keep the minimum context beside the task and provide an optional refresher and optional deeper explanation. `Start now` remains available, and the task still names its purpose, input, expected output, and recovery path.

## Open access and optional preparation

### Preparation is context, not a gate

Course metadata may contain recommended preparation, but the interface must never translate it into `locked`, `unavailable`, or `complete this first`.

The preparation panel uses this pattern:

```text
This course uses a few ideas from IP addressing.

[Start this course now]
[Review IP addressing]
[Read the 10-minute context]
```

The learner may dismiss the panel. The choice is remembered privately so it is not shown repeatedly.

### What the short context contains

The short context is not a fake replacement for a full foundation. It explains only enough to understand the current unit:

- the terms used on the page;
- one concrete example;
- one small diagram;
- the assumption the lesson makes;
- a link to the complete refresher path;
- a note explaining where the idea will return later.

### What is never blocked

- Catalog discovery
- Course outlines
- Unit pages
- Exercises
- Lab instructions and downloads
- History interludes
- Glossary pages
- Reference pages
- Bookmarks
- Completion

An assessment can require defined work before issuing a credential. That is an evidence rule, not a content lock.

## Optional preparation and refresher catalog

### Computer basics

For learners who need the machine itself demystified:

- hardware, software, and operating systems;
- CPU, memory, storage, and graphics processors;
- files, folders, programs, processes, and services;
- local machine, virtual machine, container, and remote server;
- user account, administrator, and permissions;
- installing, updating, and removing software;
- what a terminal is and what it is not;
- how to copy an error without exposing private information.

### Files and folders

- path, root, drive, directory, filename, and extension;
- absolute and relative paths;
- Windows drive letters and backslashes;
- Unix roots and forward slashes;
- hidden files;
- ownership and permissions;
- safe copy, move, rename, and delete behavior;
- backups and restore tests.

### Command-line foundations

- terminal, shell, prompt, command, option, argument, input, output, and exit status;
- current directory;
- quoting and spaces;
- help pages;
- history;
- pipes and redirection;
- environment variables;
- stopping a command;
- reading a visible error before changing anything.

### Technical reading

- how to read documentation;
- how to recognize prerequisites and version scope;
- command placeholders;
- warning and note conventions;
- examples versus requirements;
- release notes and change logs;
- primary sources versus summaries;
- how to record what was tried.

### Troubleshooting

- reproduce the problem;
- state the expected and observed result;
- record the exact error;
- change one variable;
- use the safest diagnostic first;
- confirm the repair;
- undo temporary changes;
- distinguish a workaround from a root-cause repair.

### Virtual machines, WSL, and disposable labs

- host and guest operating systems;
- virtual CPU, memory, disk, and network;
- snapshots and checkpoints;
- WSL compared with a traditional virtual machine;
- shared folders and their risks;
- network isolation;
- clean reset and deletion;
- when dual boot is and is not justified.

### Programming concepts

- instructions and execution;
- variables and values;
- conditions and repetition;
- functions;
- files and structured data;
- errors and tests;
- packages and dependencies;
- scripts as repeatable documentation.

### Math for computing

- place value and binary;
- powers of two;
- units and prefixes;
- ratios and percentages;
- coordinates and vectors;
- probability and uncertainty;
- logarithms as a later optional topic;
- reading a chart without inventing certainty.

### Networking basics

- two computers exchanging information;
- names and addresses;
- packets;
- local and remote networks;
- ports and services;
- routers and switches;
- DNS and DHCP;
- latency, bandwidth, and loss.

### Security and lab safety

- authorization;
- scope;
- least privilege;
- private information and secrets;
- updates and backups;
- safe downloads;
- checksums;
- isolated targets;
- stop conditions;
- evidence and cleanup.

### Git and reproducibility

- repository, snapshot, commit, branch, and remote;
- configuration files;
- lock files;
- checksums;
- versioned lab manifests;
- experiment notes;
- rebuilding a result from a clean folder.

## Optional Reality versus Fiction path

The [Reality versus Fiction curriculum](REALITY_VS_FICTION_CURRICULUM.md) is one optional cross-school learning path. It contains five courses and 39 core comparison units across programming, Linux, cybersecurity, networking, and local models. It is not a technical school, required orientation, or prerequisite for deeper study.

Each comparison begins with a familiar scene pattern, common myth, marketing statement, or public technology claim. It then uses the same visible order:

1. The claim or scene
2. What is plausible
3. What is exaggerated or missing
4. The real underlying concept
5. Safe exercise or observation
6. Defensive or professional takeaway
7. Short knowledge check

The core comparison is L0 reading and planning. It uses prepared, synthetic, or redistribution-safe evidence, requires no installation, and keeps an optional L1 observation separate. Cybersecurity comparisons remain conceptual, authorized, isolated, and defensive. A learner may hide the fiction framing and read the complete technical explanation.

The path teaches evidence and context rather than scoring entertainment for accuracy. It does not copy dialogue, screenshots, actors, character names, logos, music, episode plots, or recognizable compositions. A named public work or claim receives a dated source record and only the minimum paraphrase needed to teach.

The [Reality Checks first-release packet](course-packets/REALITY_CHECKS_FIRST_RELEASE.md) is an authoring starting packet. It is not a complete course, live teaching, or publication-ready content.

## Cross-platform access lanes

Linux is the common reference environment because it is widely available on servers, clouds, virtual machines, inexpensive hardware, Windows through WSL, and macOS through a virtual machine. Linux is a recommendation and shared reference, not a requirement to replace a learner's current operating system.

Every applicable lab must declare supported access lanes.

### Lane A: Reading only

- Any current desktop, laptop, or tablet
- Prepared command traces and screenshots
- Interactive diagrams and knowledge exercises
- No installation required

### Lane B: Windows native

- Windows remains the operating system being inspected or changed
- PowerShell, Command Prompt, Windows Terminal, and graphical tools are labeled precisely
- L1 inspection and carefully bounded L2 local changes
- No Linux command is presented as a Windows command
- WSL and virtual-machine alternatives remain separate because their filesystems, networking, services, and kernels differ

### Lane C: Windows with WSL

- Windows remains installed
- Linux command-line environment through WSL
- Clear distinction between Windows and Linux filesystems
- Explicit guidance for paths, permissions, networking, and cleanup

Microsoft documents WSL as a way to run Linux applications and command-line tools directly on Windows without a traditional virtual-machine or dual-boot setup.

Reference: [Install WSL](https://learn.microsoft.com/en-us/windows/wsl/install)

### Lane D: Disposable Linux virtual machine

- Windows, macOS, or Linux host
- Snapshot before the lab
- NAT or isolated networking by default
- No required host changes beyond installing the chosen virtual-machine product
- Full reset path

### Lane E: macOS native tools

- Teach shared Unix concepts and macOS differences honestly
- Do not pretend macOS is Linux
- Use a Linux VM when a lesson depends on Linux-specific kernel, filesystem, package, service, or networking behavior

### Lane F: Existing Linux machine

- Prefer non-destructive inspection first
- Use a dedicated user, container, or virtual machine for risky exercises
- Never assume the learner can reinstall the host

### Lane G: Learner-controlled remote server

- Optional, never the only route for foundations
- Explicit cost, identity, network, deletion, and recovery warnings
- Firewall and authentication before public exposure
- Teardown instructions and cost verification

## Why Linux is the common reference environment

The Linux school must avoid the simplistic claim that organizations move to Linux because it is free or automatically secure. The course should examine several real reasons and their tradeoffs:

- broad server and cloud availability;
- automation and remote administration;
- container and cloud-native ecosystems;
- transparent configuration and logs;
- hardware and deployment flexibility;
- open-source collaboration and inspectability;
- stable server distributions and commercial support options;
- lower licensing barriers in some deployments;
- common tooling across development, operations, security, networking, and local AI.

It must also teach the costs:

- migration work;
- staff skills;
- application compatibility;
- support and lifecycle planning;
- hardware-driver differences;
- governance and supply-chain responsibilities;
- fragmented advice across distributions;
- the fact that open source does not remove maintenance or security work.

Current cloud-native adoption data can provide context, but it must not be presented as proof that every organization is abandoning Windows. The 2025 CNCF survey reported very broad Kubernetes adoption and evaluation, while Linux Foundation research also warned that production open-source use often outpaces governance and security maturity.

References:

- [CNCF Annual Survey 2024](https://www.cncf.io/wp-content/uploads/2025/04/cncf_annual_survey24_031225a.pdf)
- [2025 World of Open Source report](https://www.linuxfoundation.org/hubfs/Research%20Reports/2025GlobalSpotlight_Oct-27-2025%20V4.pdf)

## Shared lab contract

All schools use the same lab shape:

1. Goal
2. Why the lab matters
3. New terms
4. Optional preparation links
5. Supported access lanes
6. Time, memory, storage, and download estimates
7. Authorization and scope
8. Safety and privacy preflight
9. Snapshot, backup, or recovery point
10. Step-by-step activity
11. Expected checkpoints
12. What may differ on another machine
13. Troubleshooting by visible symptom
14. Stop and recover
15. Clean up
16. Evidence to retain
17. Reflection questions
18. Optional extension

Every downloadable lab pack is versioned and immutable:

```text
lab-name/
+-- README.md
+-- LAB.md
+-- lab-manifest.json
+-- requirements/
|   +-- linux.md
|   +-- macos.md
|   +-- windows.md
+-- starter/
+-- configs/
+-- checks/
+-- expected/
+-- cleanup/
+-- evidence-template/
+-- LICENSES.md
+-- SECURITY.md
+-- checksums.txt
```

The package must not contain secrets, hidden uploads, proprietary material without redistribution rights, destructive cleanup, undisclosed network dependencies, or certificate answers.

## Cybersecurity lab boundary

Cybersecurity education is defensive-first and authorization-first.

- Labs use learner-owned machines, disposable virtual machines, purpose-built local targets, or institution-controlled ranges.
- The learner defines the target, owner, authorization, and network boundary before a practical exercise.
- No public target scanning, credential attacks, phishing delivery, persistence, stealth, destructive payloads, data theft, denial of service, or malware deployment.
- Potentially dangerous mechanisms are explained at the level needed to recognize, detect, contain, and repair them.
- Any attack simulation must be bounded, observable, reversible, and paired with detection and mitigation.
- Every lab ends with cleanup, evidence review, and restoration.

The curriculum may use fictional incidents, case files, and attack-chain diagrams. Those examples must not become instructions for harming real systems.

Reference frameworks include:

- [NIST Cybersecurity Framework 2.0](https://www.nist.gov/cyberframework)
- [NIST NICE Workforce Framework](https://www.nist.gov/itl/applied-cybersecurity/nice/nice-framework-resource-center)
- [CISA Cross-Sector Cybersecurity Performance Goals](https://www.cisa.gov/cybersecurity-performance-goals)

## Local-model processing boundary

SeePoundCoffeePie may provide:

- explanations and diagrams;
- prepared examples and output;
- knowledge exercises;
- lab downloads;
- progress records;
- deterministic manifest validation;
- assessments and credentials.

SeePoundCoffeePie must not:

- run model inference;
- download model weights into the website runtime;
- process learner datasets;
- fine-tune or train a model;
- accept model weights or full checkpoints;
- accept private prompt histories;
- silently use an external model provider;
- use an LLM to grade a credential submission.

Actual model work happens on the learner's computer, home server, workstation, institution-managed environment, or an external environment the learner explicitly chooses.

## Original guide character and visual theme

### The character

The recurring guide is **Mara Venn, the Maintainer**.

Mara is an original fictional systems investigator and former repair technician who works the night shift as incident coordinator for the fictional Cedar Junction Cooperative. `The Maintainer` is her academy role, not a separate biography. She is calm, skeptical, practical, and concerned with evidence. Her recurring question is: `What do we actually know?`

Mara is the main cybersecurity guide and appears outside that school only when authorization, evidence, or incident recovery crosses subject boundaries. She is not a universal mascot placed on every page.

She is not a vigilante, criminal mastermind, masked revolutionary, or copy of a television character. She does not use quotations, names, logos, plot lines, costumes, or recognizable visual compositions from an existing show.

Her role is to:

- pause a lesson when a hidden assumption appears;
- separate evidence from guesses;
- explain the historical reason behind an odd design;
- show a safe diagnostic before a risky change;
- write short post-incident notes;
- remind the learner to define authorization and scope;
- admit uncertainty and check documentation;
- return the learner to the practical work.

### Supporting cast

- **Rin Calder:** Linux systems caretaker who makes an unfamiliar machine inspectable and repairable.
- **Mira Patch:** Network steward who explains packet flow, labels assumptions, and maps failure domains.
- **Sana Bell:** Incident responder who teaches containment, evidence, and recovery.
- **Tess Rowan:** Local-model researcher who insists on baselines and reproducibility.

The cast provides different viewpoints without turning lessons into fan fiction.

### Visual direction

- Editorial diagrams, annotated terminals, maps, timelines, evidence boards, and system cutaways
- Warm paper, charcoal, muted blue, amber, and restrained red for risk
- No green falling-code effect
- No anonymous black-hoodie portrait
- No glitch-heavy decoration
- No spaceship or space-station focus
- No flashing lights
- No decorative panel when a diagram or explanation would teach more
- A static equivalent for every animation
- Useful alt text and high contrast

### Recurring lesson breaks

- **Field note:** One practical observation from Mara
- **Then and now:** A short history interlude
- **Case file:** A fictional incident analyzed from evidence
- **Design decision:** Why a protocol, directory, or tool works this way
- **Reality check:** What media often simplifies
- **Recovery point:** Save, snapshot, or record state before continuing
- **Back to the work:** A concise return to the next practical task

These breaks should restore attention and context. They must not interrupt every page or become marketing copy.

## Visual teaching systems

### Linux directory explorer

An expandable directory tree should let the learner open `/`, `/etc`, `/home`, `/var`, `/usr`, `/bin`, `/sbin`, `/tmp`, `/run`, `/dev`, `/proc`, `/sys`, `/opt`, `/srv`, `/mnt`, and `/media`.

Each location shows:

- its plain-language purpose;
- why it exists;
- whether it contains persistent or generated information;
- who normally writes there;
- common examples;
- risks;
- the closest Windows concept, when one exists;
- important distribution differences;
- a short inspection exercise.

The course must also explain merged `/usr`, symbolic links, pseudo-filesystems, distribution-specific layouts, the Filesystem Hierarchy Standard, and why real machines do not always match a simplified diagram.

Reference: [Filesystem Hierarchy Standard 3.0](https://refspecs.linuxfoundation.org/FHS_3.0/fhs/index.html)

### Packet journey explorer

Show one request traveling through:

- application;
- socket;
- transport;
- IP;
- local interface;
- switch;
- router;
- DNS where relevant;
- firewall and NAT where relevant;
- remote service;
- return path.

The learner can reveal headers and decisions gradually. Subnetting, routing tables, VLANs, IPv6, and BGP reuse the same visual language.

### Security evidence board

Show:

- asset;
- identity;
- trust boundary;
- event;
- evidence;
- hypothesis;
- containment;
- repair;
- recovery;
- unresolved questions.

The board must visibly distinguish a confirmed fact from an inference.

### Model lifecycle map

Show:

- source data;
- rights and consent;
- preparation;
- tokenizer;
- training or adaptation;
- checkpoint;
- evaluation;
- quantization;
- local deployment;
- monitoring;
- retirement.

The page indicates which steps happen on the site and which happen only in the learner's environment.

### Reality comparison board

Show one claim without making visual confidence look like proof:

- the claim or short scene pattern;
- directly shown evidence;
- a plausible part;
- missing people, permissions, systems, time, failed attempts, and recovery;
- the real mechanism;
- uncertainty and unknowns;
- one safe observation;
- the next professional action;
- source date and review state.

Use separate text labels for `shown`, `source statement`, `reconstruction`, `inference`, `disputed`, and `unknown`. Color is not the only signal. A time-compression view shows the real sequence as a static ordered list before any optional visual treatment. The complete board remains readable in a single-column text order.

## Credential model

### Completion record

Records completion of published learning material. It does not claim professional competence, legal identity, authorship, or independent verification.

### Applied skill credential

Requires:

- an identity-linked learner account;
- a versioned server-scored knowledge assessment;
- one or more practical labs;
- an evidence classification such as self-attested, deterministically checked, or human reviewed;
- a capstone assessed with a published rubric;
- explicit wording about what was and was not verified.

### Professional certificate

Requires:

- several applied skill credentials;
- a broader assessment blueprint;
- an integrative capstone;
- a reproducibility or recovery package;
- independent review for judgment-heavy work;
- a public skills outline;
- version, issue, renewal, expiration, and revocation rules.

Microsoft's current distinction between narrower scenario-based Applied Skills and broader role-based certifications is a useful structural reference.

References:

- [Microsoft Applied Skills](https://learn.microsoft.com/en-us/credentials/applied-skills/)
- [Microsoft Credentials](https://learn.microsoft.com/en-us/credentials/)

## Long-range scale target

This is an architecture target, not a promise to publish incomplete material.

- 5 major schools, optional preparation, and optional cross-school learning paths
- 75 or more learning paths
- 450 to 600 unique courses
- 2,500 to 3,500 modules
- 8,000 to 12,000 units
- 750 or more guided labs
- 80 or more capstones
- 30 or more applied skill credentials
- 6 or more broad professional certificate programs

Courses may appear in more than one learning path. Reuse is preferable to duplicating nearly identical foundations.

The no-assumed-knowledge standard does not add a school, path, course, module, unit, or credential to these totals. Reality versus Fiction contributes one optional cross-school path, five courses, 39 core comparison units, and one optional source-based project without duplicating the deeper school instruction it links.

## Development order versus learner choice

The roadmap now spans M000 through M410. Its academy implementation sequence is:

1. Generic academy structure, open-access rules, and shared no-assumed-knowledge authoring behavior
2. Optional preparation, cross-platform lab access, and assessment boundaries
3. Linux foundations and administration
4. Networking foundations through advanced routing
5. Cybersecurity foundations through defensive operations
6. Local models and LLMs
7. Core integrated paths, capstones, credentials, and the M350 core academy release
8. Cross-school no-assumed-knowledge controls and release evidence through M366
9. The optional Reality versus Fiction path through M382
10. The local-versus-hosted model comparison path through M407
11. The selected overview image, cross-cutting curriculum index, and M410 expanded academy release

This order controls product risk and reuses shared material. It does not determine what a learner is allowed to open.

Linux is developed early because it provides a low-cost, widely available reference environment for networking, cybersecurity, server, container, and local-model labs. Windows and macOS learners remain first-class participants through WSL, virtual machines, native tools, and clearly documented differences.

The no-assumed-knowledge standard should shape new authored material before M351 is declared complete. M351 through M366 make the shared controls, review evidence, and cross-school release gate explicit; their later roadmap numbers do not permit earlier courses to assume hidden knowledge.

The first authoring packets are:

- [Reality Checks](course-packets/REALITY_CHECKS_FIRST_RELEASE.md), linked to M118 and M367 through M382;
- [Models From Zero](course-packets/MODELS_FROM_ZERO_FIRST_RELEASE.md), linked to M296 through M306 and M383 through M407.

These packets are authored starting points, not public-release claims and not separate completion ledgers.

## Related curriculum plans

- [Curriculum blueprint index](README.md)
- [No assumed knowledge standard](NO_ASSUMED_KNOWLEDGE_STANDARD.md)
- [Linux curriculum](LINUX_CURRICULUM.md)
- [Networking curriculum](NETWORKING_CURRICULUM.md)
- [Cybersecurity curriculum](CYBERSECURITY_CURRICULUM.md)
- [Local models and LLM curriculum](LOCAL_MODELS_LLM_CURRICULUM.md)
- [Reality versus Fiction curriculum](REALITY_VS_FICTION_CURRICULUM.md)
- [Lab, assessment, and credential standard](LAB_ASSESSMENT_CREDENTIAL_STANDARD.md)
- [Reality Checks first-release packet](course-packets/REALITY_CHECKS_FIRST_RELEASE.md)
- [Models From Zero first-release packet](course-packets/MODELS_FROM_ZERO_FIRST_RELEASE.md)
- [Milestone roadmap M000 through M410](../../MILESTONES.md)
