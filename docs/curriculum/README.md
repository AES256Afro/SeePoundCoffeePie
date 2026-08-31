# Academy curriculum expansion

Last reviewed: 2026-08-30

This folder contains the long-range curriculum and implementation plans for expanding SeePoundCoffeePie beyond its current programming courses.

These documents are plans, not claims that the courses are live. A course enters the public catalog only when it has useful reviewed teaching material. Once published, its course page, units, exercises, lab guide, and reference material remain visible and directly open.

## The access rule

Recommended preparation is an offer of help, not a prerequisite gate. The learner may use it as an introduction before a new subject, as a refresher for something previously learned, or skip it and start the selected course immediately.

When a course uses an earlier idea, the learner chooses one of three actions:

1. **Start now** and receive explanations in the course.
2. **Review a refresher** with a short, focused practice set.
3. **Read the short context** and return to the course.

None of these choices changes access, progress eligibility, or the ability to complete the course. Credential requirements can require assessed evidence before a credential is issued, but they never hide the teaching material.

## Document map

| Document | Purpose |
| --- | --- |
| [Academy expansion blueprint](ACADEMY_EXPANSION_BLUEPRINT.md) | Shared product model, open access, optional preparation, cross-platform access, visual teaching systems, and development order |
| [Linux curriculum](LINUX_CURRICULUM.md) | Beginner-to-advanced Linux, directory tree, desktop, gaming, Windows migration, servers, administration, recovery, and operations |
| [Networking curriculum](NETWORKING_CURRICULUM.md) | First packet through Ethernet, Wi-Fi, IPv4, IPv6, services, switching, routing, automation, cloud networking, BGP, and architecture |
| [Cybersecurity curriculum](CYBERSECURITY_CURRICULUM.md) | Personal safety through defensive engineering, security operations, incident response, forensics, governance, and recovery |
| [Local Models and LLMs curriculum](LOCAL_MODELS_LLM_CURRICULUM.md) | Model foundations, local inference, data, evaluation, retrieval, fine-tuning, small-model training, serving, privacy, and reproducibility |
| [Lab, assessment, and credential standard](LAB_ASSESSMENT_CREDENTIAL_STANDARD.md) | Learner-controlled lab boundary, platform lanes, risk classes, evidence, assessment, transcript, and credential rules |
| [Milestone roadmap](../../MILESTONES.md) | Dependency-ordered implementation plan from M000 through M350 |

## Planned curriculum scale

| School | Planned scope |
| --- | --- |
| Linux and Open Systems | 15 learning paths, 87 courses, about 420 to 500 modules, at least 191 labs and capstones |
| Networking | 1 optional preparation bench, 15 large courses, 132 modules, 8 integrated capstones, and 8 reusable lab topologies |
| Cybersecurity | 23 learning paths, 219 courses, 1,100 to 1,400 modules, 350 or more guided labs, and 23 path capstones |
| Local Models and LLMs | 13 core paths, 60 to 65 courses, 280 to 340 modules, at least 70 guided labs, and 13 path capstones |
| Optional Preparation and Refreshers | Short introductions and focused review paths shared across all schools |

The academy target allows 450 to 600 unique courses because the detailed school inventories already exceed the earlier 250-course estimate. A course can appear in several suggested learning paths without being duplicated.

## Where practical work happens

The site teaches, provides ordinary knowledge exercises, packages lab materials, records progress, and issues evidence-based credentials. It does not run a learner's operating-system commands, network emulation, cybersecurity tooling, model inference, datasets, or model training in the browser.

Practical work runs only in a learner-controlled environment:

- Windows native tools, WSL, or a disposable Linux virtual machine;
- macOS native tools or a disposable Linux virtual machine;
- an existing Linux system with safe read-only work first;
- a learner-controlled remote server or cloud environment when explicitly chosen;
- a reading, prepared-evidence, or browser-simulation route when hardware or policy prevents a native lab.

Linux is the common reference environment because it is broadly available and works well for server, networking, security, container, and model labs. It is not a requirement to begin, and the plans keep Windows and macOS routes visible wherever their behavior can teach the same outcome honestly.

## Implementation order

1. Finish the current Practical C++ release gate without mixing it with academy architecture work.
2. Build the generic academy registry, open routes, learning hierarchy, and scalable catalog.
3. Add optional preparation choices, platform access lanes, lab manifests, recovery, transcripts, assessment boundaries, and credential records.
4. Publish a reviewed Linux foundation slice and the shared visual systems.
5. Publish networking foundations and safe local simulations.
6. Publish cybersecurity foundations and the isolated defensive lab environment.
7. Publish local-model foundations, no-compute lessons, and learner-controlled local labs.
8. Expand each school in reviewed waves, then add integrated paths, capstones, and broader certificate programs.

The order above is a development sequence. It never becomes a learner access sequence.

After the four foundation slices, deeper school work can proceed in parallel when its actual dependencies are ready. The numeric school ranges in `MILESTONES.md` group related scope; they do not require the complete Linux catalog before the first networking course, or the complete networking catalog before the first cybersecurity course.

## Canonical milestone crosswalk

`MILESTONES.md` is the only completion ledger. School-specific labels are work-package references and cannot be marked complete independently.

| School plan | Canonical roadmap range |
| --- | --- |
| Linux `LNX-M001` through `LNX-M078` | M161 through M210 |
| Networking Slices 1 through 6 | M211 through M250 |
| Cybersecurity `CYB-M001` through `CYB-M070` | M251 through M295 |
| Local Models Releases A through G | M296 through M330 |
| Cross-school paths and capstones | M331 through M350 |

Each implementation issue links one local work package to one or more canonical milestones and records the owner, dependencies, deliverable, acceptance evidence, and rollback or migration note. This prevents two documents from reporting different completion states.
