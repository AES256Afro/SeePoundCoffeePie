# Lab, assessment, and credential standard

Last reviewed: 2026-08-30

## Purpose

This standard applies to Linux, networking, cybersecurity, local-model, and future native-tool courses. It keeps hands-on work safe, accessible, recoverable, and honest.

The website provides education, lab instructions, downloads, progress, assessments, transcripts, and credential verification. Native work runs only in a learner-controlled environment.

## Open learning policy

- All published teaching content is visible and open.
- Suggested preparation is optional context, never an access requirement.
- A learner can open a path, course, module, unit, exercise, or lab in any order.
- A hard unit may recommend a refresher, but it always retains `Start now`.
- Credential requirements control only issuance of a credential. They do not hide the associated learning material.
- Do not publish locked cards, countdowns, teaser modules, or artificial scarcity.
- Drafts remain outside the catalog until they satisfy the publication contract.

## Lab execution boundary

The site may:

- explain a lab;
- show prepared commands and prepared output;
- provide diagrams and checklists;
- provide a versioned downloadable lab pack;
- show file checksums;
- record a learner's completion choice;
- score authored knowledge assessments;
- accept a minimal evidence manifest after explicit review and consent;
- verify manifest structure and hashes;
- issue a credential after server-owned requirements pass.

The site must not:

- execute native commands;
- install operating systems, packages, drivers, runtimes, or models;
- probe local hardware or files;
- open local services;
- scan networks;
- run a virtual machine or container;
- run model inference or training;
- accept model weights or full checkpoints;
- accept raw private datasets or prompt histories;
- collect shell history or complete environment-variable output;
- make destructive changes to a learner's computer;
- silently send material to a third-party provider;
- treat a browser checkbox as proof of competence.

## Supported access lanes

Every lab manifest identifies one or more lanes:

- `reading-only`
- `windows-native`
- `windows-wsl`
- `windows-vm`
- `macos-native`
- `macos-linux-vm`
- `linux-native`
- `linux-vm`
- `learner-remote-server`
- `institution-managed-lab`
- `learner-selected-external-compute`

The manifest explains meaningful differences. It does not claim that macOS is Linux or that WSL behaves identically to a separate Linux host.

## Lab risk classes

### L0: Reading and planning

- No local command required
- Prepared traces and diagrams
- Suitable for any device
- No machine change

### L1: Inspection

- Read-only local commands
- No administrator access by default
- No persistent configuration change
- Examples: inspect paths, interfaces, processes, logs available to the current user, model metadata

### L2: Disposable user-space change

- Creates files or installs dependencies inside a dedicated project, virtual environment, user account, container, or disposable VM
- Includes cleanup
- No host service or network exposure by default

### L3: Controlled system change

- May change a service, firewall, virtual disk, package set, or network inside a snapshot-protected VM or dedicated lab host
- Requires explicit recovery point
- Requires an administrator warning
- Never the first practical experience in a subject

### L4: Isolated security simulation or advanced infrastructure

- Uses purpose-built targets and isolated networks
- Requires written authorization and scope
- Includes evidence, detection, containment, restoration, and teardown
- Must not reach public targets or production systems

No SeePoundCoffeePie lab instructs a learner to perform uncontrolled, host-targeted, unauthorized, covert, or harmful destructive activity. A reviewed recovery lab may change or delete only synthetic data inside an identified disposable environment with a verified reset path.

## Required lab-page structure

1. **Goal:** One sentence describing the learner-visible result.
2. **Why this matters:** Practical context without marketing language.
3. **What changes:** Files, packages, services, networks, storage, or accounts affected.
4. **What does not change:** Important boundaries.
5. **New terms:** Plain definitions.
6. **Optional preparation:** Links to refreshers, plus `Start now`.
7. **Supported lanes:** Operating systems and environments.
8. **Requirements:** CPU, memory, storage, downloads, network, privileges, and time.
9. **Authorization and scope:** Especially for networking and security.
10. **Privacy and license check:** Data, models, packages, and logs.
11. **Recovery point:** Snapshot, backup, branch, copy, or documented current state.
12. **Preflight:** Safe checks that decide whether to continue.
13. **Procedure:** One change at a time, with expected checkpoints.
14. **What may differ:** Version and platform variations.
15. **Troubleshooting:** Branches based on visible symptoms.
16. **Stop conditions:** When to stop rather than guess.
17. **Verification:** Confirm the intended result.
18. **Cleanup:** Remove temporary resources and confirm recovery.
19. **Evidence:** Minimal artifacts worth retaining.
20. **Reflection:** Explain what happened and why.
21. **Optional extension:** Clearly separated advanced work.

## Lab manifest

Each archive contains `lab-manifest.json` with at least:

```json
{
  "schemaVersion": 1,
  "labId": "linux-filesystem-map",
  "labVersion": "1.0.0",
  "title": "Map a Linux filesystem",
  "schoolId": "linux",
  "pathIds": ["linux-foundations"],
  "courseId": "linux-files-and-directories",
  "moduleId": "filesystem-hierarchy",
  "unitId": "inspect-root-directories",
  "riskClass": "L1",
  "supportedLanes": ["windows-wsl", "macos-linux-vm", "linux-native"],
  "estimatedMinutes": 35,
  "requirements": {
    "cpu": "Any supported 64-bit CPU",
    "memoryMiB": 2048,
    "freeDiskMiB": 512,
    "accelerator": "none",
    "network": "not required after archive download",
    "privilege": "standard user"
  },
  "testedEnvironments": [],
  "downloads": [],
  "preflightChecks": [],
  "successChecks": [],
  "cleanupSteps": [],
  "evidencePolicyId": "self-check-only",
  "lastReviewedAt": "2026-08-30"
}
```

Tool-specific labs add exact versions, sources, revisions, licenses, download sizes, and checksums.

## Download package contract

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

Required publication checks:

- Archive build is reproducible.
- The final archive hash is recorded in an external `.sha256` sidecar or publication index. It is never embedded inside the archive it hashes.
- `checksums.txt` records the included-file hashes under a defined canonical order and does not list itself.
- Every included file is expected.
- No secret, access token, private key, personal path, or environment dump is present.
- Every dependency and redistributed sample has a source and license.
- Scripts default to dry run when a host-level change is possible.
- Scripts reject unsupported platforms rather than guessing.
- Cleanup targets are explicit and bounded.
- No unresolved environment variable, wildcard, home directory, filesystem root, or broad recursive deletion is accepted as a destructive target.
- Network listeners bind to loopback unless the lab specifically teaches controlled exposure.
- Containers do not receive the host Docker socket unless a separately reviewed advanced lab makes the risk explicit.
- Security targets are local and purpose-built.
- Expected results do not expose certificate answers.

## Safety preflight

A preflight should answer:

- Am I on the intended operating system and architecture?
- Is this a disposable VM, project folder, or dedicated lab host where required?
- Do I have a recovery point?
- Is there enough memory and storage?
- Are required tool versions present?
- Is the intended target inside the authorized scope?
- Is the network boundary correct?
- Are downloads from the documented source and revision?
- Do checksums match?
- Am I about to use administrator privileges?
- Do I understand the cleanup step?

If a check fails, the lab explains whether the learner can use another lane, take a reading route, repair the environment, or stop safely.

## Platform rules

### Windows native

- Explain whether a command runs in PowerShell, Command Prompt, Windows Terminal, or a graphical Windows tool.
- Use L1 inspection and carefully bounded L2 user-space changes by default.
- Identify administrator requirements before a step begins.
- State which files, services, firewall rules, adapters, routes, scheduled tasks, or registry values may change.
- Capture the prior value and provide an exact rollback for every changed Windows setting.
- Keep WSL and virtual-machine routes separate because they do not prove native Windows behavior.

### Windows with WSL

- Explain whether a command runs in Windows or the WSL Linux shell.
- Show which filesystem owns the project.
- Explain `/mnt/c` and Windows drive paths before using them.
- Warn about path, permission, line-ending, antivirus, and performance differences.
- Do not use WSL as proof that a workflow works on a separate Linux server.
- Provide unregister or cleanup guidance only after warning that it deletes the selected distribution.

### Windows virtual machines

- Default to NAT or isolated networking.
- Require a snapshot before L3 or L4 work.
- Explain disk-image location and size.
- Explain graceful shutdown before deletion.
- Do not enable host folder sharing for security labs unless required and risk-reviewed.

### macOS

- Explain shared Unix concepts and Linux-specific differences.
- Use a Linux VM for systemd, Linux kernel, Linux firewall, package, filesystem, and other Linux-specific behavior.
- Distinguish Intel and Apple Silicon requirements.
- Avoid claiming that an exported or built artifact was interactively tested on both architectures unless it was.

### Linux

- Inspect before changing.
- Prefer a dedicated user, project, container, or virtual machine.
- State distribution and release scope.
- Explain package manager and service-manager differences.
- Never assume the learner can reinstall the host.

### Remote servers

- Require authentication and firewall guidance before service exposure.
- Explain ongoing cost and deletion.
- Avoid using the public Internet as an experimental security target.
- Record provider, region, operating-system image, and teardown result without retaining account secrets.

## Cybersecurity authorization record

Every L4 lab begins with:

```text
Target owner:
Authorized learner:
Purpose:
Included systems:
Excluded systems:
Allowed actions:
Prohibited actions:
Network boundary:
Start time:
Stop time:
Recovery owner:
Evidence retention:
```

The default target is an isolated, purpose-built local lab. A learner cannot substitute a public website, employer system, school system, neighbor's network, or unrelated Internet address.

## Exercise types

Formative exercises include:

- choice with explanation;
- matching;
- ordering;
- prediction;
- diagram labeling;
- command reading;
- configuration reading;
- compare and contrast;
- diagnosis from a log;
- select the safest next check;
- identify an assumption;
- estimate resources;
- draw a data flow;
- build a threat model;
- write a recovery plan;
- critique a design;
- repair a manifest;
- reflect on a result.

Formative answers are included in browser teaching assets and therefore are not credential-grade evidence.

## Assessment classes

### A0: Self-check

- Immediate answer and explanation
- Unlimited attempts
- No credential claim

### A1: Course knowledge assessment

- Server-owned question bank
- Versioned objective blueprint
- Randomized selection by objective
- Server-side scoring
- No browser-shipped answer key
- Accessible format and documented accommodations
- Stored score summary and version

### A2: Applied lab assessment

- Scenario with a published skills outline
- Learner-controlled lab environment
- Required result and reasoning
- Minimal evidence policy
- Deterministic checks where appropriate
- Human review for judgment-heavy work
- Retake and feedback policy

### A3: Professional assessment

- Several competency areas
- Independent tasks and integrative capstone
- Published assessment blueprint without disclosing protected items
- Identity and integrity policy
- Review and appeal path
- Renewal policy

## Server-owned assessment requirements

- Authentication is required for a credential assessment.
- Questions and answer keys remain server-side.
- The browser receives only the selected attempt items.
- Attempts are bound to an assessment version.
- Rate limits, cooldowns, retakes, abandonment, and accessibility accommodations are defined.
- Raw free-text answers are not retained without a documented need and consent.
- Scores are stored in separate server-owned records, not mutable learner-progress JSON.
- Assessment events do not contain secrets, code, private prompts, or lab data unless the evidence policy explicitly requires a bounded artifact.
- No LLM makes the final grading decision.
- Human reviewers see only the evidence needed for the rubric.

## Evidence classes

### E0: No evidence

The learner reads or practices. Only ordinary progress is recorded.

### E1: Self-attested completion

The learner states that a lab was completed. The transcript says `self-attested`.

### E2: Deterministically checked manifest

A local verifier produces a small manifest. The site validates its schema, challenge, versions, hashes, and assertions. This verifies the manifest, not legal identity, authorship, or every claimed underlying action.

### E3: Human-reviewed submission

A reviewer applies a published rubric to a bounded evidence package. The credential records the review class and policy version.

### E4: Controlled assessment environment

An institution or assessment provider controls the environment and scoring. This is a future capability and must not be claimed before it exists.

## Minimal evidence rules

Potentially acceptable:

```text
credential-manifest.json
environment-redacted.txt
tool-and-revision.json
checksums.txt
configuration.json
metrics.csv
evaluation-summary.md
dataset-card.md
model-card.md
system-card.md
network-diagram.svg
incident-summary.md
recovery-steps.md
```

Not accepted by default:

- Model weights
- Full checkpoints
- Raw private datasets
- Complete prompt histories
- Access tokens
- Private keys
- Unredacted environment variables
- Browser cookies
- Shell history
- Proprietary documents
- Whole source repositories
- Hardware serial numbers
- Unbounded packet captures
- Real credentials or credential databases
- Malware samples

Before upload, the interface shows the exact file list, sizes, extracted metadata, and retention policy. The learner confirms each file.

## Credential tiers

### Completion record

Wording:

> This account completed the listed learning material and formative activities.

It does not claim:

- legal identity;
- independent authorship;
- professional competence;
- an observed lab;
- current tool expertise.

### Applied skill credential

Requires:

- identity-linked learner account;
- required A1 assessment results;
- specified practical work;
- declared evidence class;
- capstone or scenario result;
- published rubric;
- server-owned issuance decision;
- exact content, assessment, lab, and policy versions.

### Professional certificate

Requires:

- multiple applied skill credentials;
- broader role or capability blueprint;
- integrative capstone;
- reproducibility, security, or recovery package as appropriate;
- independent review;
- public skills outline;
- renewal and revocation policy.

Do not use `accredited`, `licensed`, `industry certified`, or similar claims unless an independent basis makes them true.

## Credential record

Each issued record contains:

- opaque public credential identifier;
- pseudonymous owner identifier;
- learner-approved display name snapshot;
- credential title;
- skills assessed;
- courses, paths, assessments, and labs included;
- content and tool versions;
- evidence class;
- human-review status;
- issue date;
- optional current-through or expiration date;
- renewal policy;
- verification-policy version;
- private or public status;
- current, expired, legacy, or revoked state.

Public verification is opt-in and shows only the approved display name, credential, skills, issue date, versions, and status.

GitHub sign-in verifies connection to a GitHub account. It does not verify government or legal identity.

## Persistence boundary

Ordinary learner progress remains mutable and learner-centered. Assessment and credential evidence is server-owned.

Separate storage is required for:

- assessment attempts;
- objective-level score summaries;
- course-completion snapshots;
- lab evidence metadata;
- review decisions;
- credentials;
- credential revocations;
- verification-policy versions.

Credential issuance rechecks authoritative records. It never trusts a browser field saying `credentialEarned: true`.

## Deletion and retention

- Learning progress can be deleted through the existing account-data flow after the schema is updated.
- Credential deletion behavior is a separate explicit choice.
- A learner can make a credential private without deleting the learning record.
- If a public credential is revoked or removed, its public page reveals no private reason.
- Raw assessment responses are retained only as long as required by the published policy.
- Lab files remain learner-controlled unless the learner explicitly uploads a permitted evidence package.
- Evidence-retention periods are visible before upload.

## Release evidence

A lab or credential feature is not complete from a passing build alone.

Required evidence may include:

- content validation;
- archive reproducibility;
- checksum verification;
- primary-source and license review;
- platform-specific dry run;
- native walkthrough on each claimed platform;
- recovery and cleanup walkthrough;
- browser and route checks;
- keyboard, screen-reader, zoom, and reduced-motion review;
- privacy and bundle checks;
- assessment secrecy review;
- credential issuance, verification, privacy, and revocation tests;
- fresh-beginner review.

State unperformed checks as unverified.
