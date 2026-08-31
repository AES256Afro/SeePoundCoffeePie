# Cybersecurity School Curriculum Blueprint

## Status

This document defines the intended cybersecurity school for SeePoundCoffeePie. It is a curriculum and product blueprint, not a claim that the courses, labs, assessments, or credentials already exist.

The school is deliberately large. It begins with personal safety and the meaning of cybersecurity, then builds through computers, Linux, networks, identity, applications, cloud systems, monitoring, incident response, forensics, risk, and advanced defensive validation. A learner who has never opened a terminal can begin here. An experienced administrator can open an advanced course directly.

## School promise

The Cybersecurity School helps a learner answer four questions:

1. What am I protecting?
2. What could go wrong?
3. What evidence would tell me something changed?
4. How can I reduce harm and recover safely?

It teaches protection, investigation, recovery, and responsible decision-making. It does not train learners to target strangers, evade accountability, steal credentials, deploy malware, or damage systems.

## Non-negotiable product rules

### Every published course is open

All published cybersecurity learning remains visible, searchable, bookmarkable, and available to every learner.

- No course is hidden because another course is incomplete.
- No lesson is locked behind XP, a streak, a certificate, an account, or payment.
- No lab is withheld because a learner skipped an earlier course.
- No assessment is used as a key that unlocks teaching material.
- A guest can browse the complete published catalog and read every published lesson.
- A signed-in learner gains synchronization, a transcript, and credential records, not access to otherwise hidden teaching.

Prior learning is presented only as **recommended preparation**. Every course page offers three equal actions:

1. **Start now**
2. **Review a refresher**
3. **Read the short context summary**

The context summary defines the minimum terms needed to begin the selected course. A refresher links to useful material, but never redirects the learner against their choice. Advanced pages may warn that a local lab is difficult or requires particular equipment. The warning describes risk and likely friction; it does not block the page.

### Learning happens on the site; authorized practice happens locally

The website provides explanations, diagrams, exercises, lab instructions, downloads, progress records, assessments, and credential verification. Hands-on system activity happens only in a learner-owned and deliberately isolated lab.

The site does not:

- scan the learner's computer or network;
- run security tools against public systems;
- accept a host name and attack it;
- download or execute malware;
- ask for real credentials, private keys, access tokens, or production logs;
- silently launch a local command, virtual machine, container, or network request;
- upload a packet capture, disk image, memory image, source repository, or private dataset by default.

### Defensive work comes first

Potentially dual-use concepts are taught from the defender's point of view. The learner studies what evidence a behavior creates, how to prevent it, how to detect it, and how to recover from it. Any adversary behavior used in a lab is simulated with benign artifacts in an isolated environment.

### No voice requirement

The complete school works without voice input, voice output, audio narration, or microphone permission. Character dialogue is written text. Videos, if ever added, require captions and a complete text equivalent. No assessed material exists only in audio or video.

### Plain language before vocabulary

Every term is defined before it is used as assumed knowledge. The learner is never told to "just harden the box," "pivot," "drop into a shell," "check IAM," or "look at the SIEM" without an explanation of the words, the purpose, and the safe action.

## Who this school serves

The school supports several learners without splitting the catalog into separate locked editions:

- a person who wants to secure personal accounts and devices;
- a programming learner who wants to understand secure software;
- a Windows user preparing to use Linux or WSL;
- a macOS user learning Unix-like tools;
- a new Linux administrator;
- a help desk or support technician moving toward security work;
- a network or cloud administrator adding defensive depth;
- an aspiring security analyst, incident responder, or forensic examiner;
- a developer learning secure design and code review;
- a manager who needs to understand risk, evidence, recovery, and governance;
- an experienced learner who wants a focused refresher or applied assessment.

The interface asks what the learner wants to accomplish, not what title they think they already deserve.

## Relationship to the Linux and Networking schools

Cybersecurity depends on operating-system and networking knowledge, but it should not duplicate two other large schools.

The shared model is:

- **Linux School:** how Linux works, how to use it, how to administer it, and how to migrate to it;
- **Networking School:** how devices communicate, how networks are designed, and how routing works from a home network through BGP;
- **Cybersecurity School:** how to identify assets and risk, reduce exposure, observe behavior, investigate change, respond, and recover.

Cybersecurity courses link to Linux and Networking refreshers when those explanations are useful. Each cybersecurity course still includes a short context summary so a learner may continue immediately.

Example:

> This lab uses Linux file permissions. You can start now with the five-minute permissions summary, or open the full Linux Ownership and Permissions course in another tab.

Cross-school links are recommendations, not gates. Course completion in one school never controls visibility or access in another.

## Curriculum scale

The planned full catalog contains 23 learning paths and 219 named courses. That is a multi-year content inventory and sequencing plan, not a promise to release everything at once.

| Measure | Full catalog target |
| --- | ---: |
| Learning paths | 23 |
| Courses | 219 |
| Modules | 1,100 to 1,400 |
| Short learning units | 3,500 to 5,000 |
| Guided local labs | 350 or more |
| Larger projects | 50 or more |
| Path capstones | 23 |
| Applied skill credentials | 12 to 16 |
| Broad professional certificates | 2, after assessment maturity |

A normal course is 6 to 14 hours. A few foundation courses are shorter. Advanced investigation and capstone courses may take 15 to 25 hours. Courses are broken into sessions that can be stopped cleanly.

## The learning rhythm

Long courses should feel substantial without becoming a wall of text. Each module follows a predictable rhythm:

1. **The situation:** a short, concrete problem.
2. **What you already know:** a brief retrieval prompt, with an immediate summary available.
3. **New words:** plain definitions and pronunciation where useful.
4. **History and reason:** what problem led people to create the idea or control.
5. **How it works:** a diagram, explanation, and worked example.
6. **What normal looks like:** a baseline before suspicious behavior is discussed.
7. **What can go wrong:** mistakes, failures, and abuse at a safe level of detail.
8. **What a defender does:** prevention, observation, verification, response, and recovery.
9. **Exercise:** one small decision or analysis task.
10. **Guided lab:** optional local practice when the topic benefits from it.
11. **Debrief:** what changed, what evidence was created, and how to undo the lab.
12. **History break or case note:** a short contextual interlude.
13. **Return to the work:** a focused practice set or next module.

Units are normally 5 to 15 minutes. Modules are normally 35 to 70 minutes. A module checkpoint offers a natural break and saves the exact reading and lab position. No countdown or streak pressure is added.

## Original cyber-thriller mentor

### Mara Venn, overnight incident coordinator

Mara Venn is an original SeePoundCoffeePie character. She was a repair technician and systems administrator before becoming the overnight incident coordinator for the fictional Cedar Junction Cooperative. She works carefully, writes down what she can prove, and is willing to say "I do not know yet."

Her recurring questions are:

- What do we know?
- What are we assuming?
- What evidence would separate the two?
- Who could be harmed by this decision?
- Can we undo the next step?
- Who owns this system, and did they authorize the work?

Mara is not a criminal antihero. She does not break into strangers' systems, celebrate damage, or treat victims as foolish. Her stories create a grounded cyber-thriller atmosphere through uncertainty, time pressure, incomplete evidence, and difficult defensive choices.

### Visual identity

Mara should remain visually and narratively distinct from copyrighted television characters:

- blue or rust-colored work jacket, not a black hooded sweatshirt;
- paper incident notebook, small flashlight, and repair tools;
- an operations desk, repair bench, library, clinic, apartment, or community data room;
- warm desk light against cool nighttime surroundings;
- no mask, vigilante organization, inherited company plot, hallucinated alter ego, or copied story event;
- no copied actor likeness, dialogue cadence, title treatment, symbols, or fictional company names.

Character art supports the lesson but does not dominate the page. A learner can hide narrative panels without losing instructional content.

### How Mara appears

- **Case note:** two to four paragraphs that frame a problem.
- **Evidence board:** a clean diagram showing facts, assumptions, and unanswered questions.
- **Pause point:** a question before the explanation is revealed.
- **Debrief:** the defensive decision and the evidence supporting it.
- **Post-incident note:** what the organization changes afterward.

All dialogue is text. There is no required voice performance.

### Long-running case series

The course catalog can reuse one fictional organization without forcing a linear story:

1. **The Quiet Login:** an account behaves differently from its baseline.
2. **The Missing Copy:** a backup exists on paper but cannot be restored.
3. **The Wrong Name:** DNS sends users somewhere unexpected.
4. **The Trusted Update:** a legitimate software channel becomes part of an investigation.
5. **The Open Cabinet:** physical access changes the meaning of a technical control.
6. **The Shared Account:** convenience makes accountability impossible.
7. **The Silent Sensor:** monitoring fails before the service does.
8. **The Public Folder:** a cloud storage policy exposes synthetic records.
9. **The Friday Change:** an urgent deployment bypasses review.
10. **The Long Recovery:** operations resume before every question has an answer.

Each case is self-contained. Opening an advanced case does not require completing earlier cases.

## Safety and authorization contract

Every practical lab starts with a visible contract:

> Use only the provided local lab and systems you own or are explicitly authorized to test. Do not point these commands or tools at a school, employer, public website, neighbor, or other third party. Stop if the lab network is not isolated or if the target is not the one named in the instructions.

The learner confirms the target, boundary, and recovery plan before an active lab begins.

### Allowed lab environments

- a learner-owned virtual machine;
- a learner-owned host-only virtual network;
- an intentionally vulnerable local image supplied for the lab;
- a local container network with no public port exposure;
- a clearly identified personal cloud sandbox when the lab explicitly covers cloud work, the learner owns the account, and cost limits are shown;
- a provided static packet capture, log set, disk image, memory image, configuration archive, or source repository containing synthetic data.

### Disallowed targets

- public IP addresses or domains not owned by the learner;
- school or employer systems without written authorization;
- production services;
- another person's account or device;
- live credential stores;
- public Wi-Fi participants;
- real victims, leaked databases, or stolen data;
- systems found through internet search engines;
- third-party bug bounty targets unless the platform later adds a separately reviewed, program-specific course.

### Content boundaries

The core catalog does not provide:

- instructions for stealing or replaying real credentials;
- malware deployment or persistence instructions;
- ransomware construction;
- destructive wipers;
- covert command-and-control infrastructure;
- public-target exploitation walkthroughs;
- evasion instructions intended to defeat investigators;
- instructions to conceal unauthorized access;
- mass scanning of public address space;
- social engineering scripts aimed at real people;
- weaponized proof-of-concept code for current vulnerabilities.

The school may explain that these behaviors exist, how defenders observe them, and which controls reduce their impact. Advanced labs use benign simulators and prerecorded artifacts.

### Shared lab risk classes

The Cybersecurity School uses the academy-wide L0 through L4 classes from the [Lab, assessment, and credential standard](LAB_ASSESSMENT_CREDENTIAL_STANDARD.md). It does not create a second safety scale.

| Class | Meaning | Default protections |
| --- | --- | --- |
| L0: Reading and planning | Examine text, diagrams, prepared configurations, logs, or captures | No system changes |
| L1: Inspection | Run safe inventory and observation commands | Learner-owned system; no privilege elevation unless explained |
| L2: Disposable user-space change | Change files or run a local process that can be removed without altering host-wide configuration | Bounded target, expected result, stop step, and cleanup |
| L3: Controlled system change | Change a service, account, firewall, package, mount, boot setting, or other host-wide state | Snapshot or backup, before-state capture, console or recovery route, exact rollback |
| L4: Isolated security or infrastructure simulation | Generate benign suspicious activity, corrupt synthetic data, or practice destructive recovery | Disposable isolated environment, verified reset, explicit scope, stop conditions, and confirmation |

L4 is never the default path. An L0 or L1 alternative is always provided.

### Every lab manifest includes

The fields below extend the canonical [Lab, assessment, and credential standard](LAB_ASSESSMENT_CREDENTIAL_STANDARD.md). Supported environments use its `reading-only`, `windows-native`, `windows-wsl`, `windows-vm`, `macos-native`, `macos-linux-vm`, `linux-native`, `linux-vm`, `learner-remote-server`, `institution-managed-lab`, or `learner-selected-external-compute` lane identifiers. If a local rule conflicts with the shared standard, the shared standard wins.

- lab ID and content version;
- learning goal;
- authorization scope;
- risk class;
- supported operating systems;
- tested virtual-machine or container versions;
- CPU, memory, disk, and network needs;
- expected download size and approximate time;
- expected cost, with a zero-cost route whenever practical;
- data classification;
- ports and network boundaries;
- exact targets the learner may interact with;
- snapshot or backup instructions;
- preflight checks;
- expected intermediate checkpoints;
- stop conditions;
- troubleshooting by visible symptom;
- cleanup and rollback;
- evidence the learner may keep;
- items that must not be uploaded;
- last technical review date;
- sources and licenses.

### Default virtual lab

The common defensive range is called **Cedar Lab**. It uses synthetic people, systems, and records.

| Machine | Purpose | Default connectivity |
| --- | --- | --- |
| Cedar Workstation | Normal user and support tasks | Internal lab network only |
| Cedar Server | Linux services, identity examples, logs, and backups | Internal lab network only |
| Cedar Sensor | Packet and log observation | Internal lab network only |
| Cedar Target | Intentionally misconfigured or vulnerable service | Internal lab network only |

The default network is host-only. Bridged networking is never the beginner default. Internet access, when needed to install a signed package, is enabled for that step and then removed. Every lab begins from a named snapshot and ends with verification that the lab is stopped or restored.

Windows learners receive WSL and virtual-machine routes. macOS learners receive Apple Silicon and Intel notes where they differ. Linux learners receive KVM or another supported local route. The course never assumes that a learner can buy a second computer or a paid cloud subscription.

## Exercises and assessments

### Formative exercise types

- choose the safest next action;
- separate a fact from an assumption;
- identify an asset, threat, vulnerability, control, and consequence;
- put events in chronological order;
- trace a packet, process, login, or trust decision through a diagram;
- match a log entry to the system that produced it;
- compare a secure and insecure configuration;
- choose a useful source of evidence;
- prioritize vulnerabilities using business and environmental context;
- redact private information from a support bundle;
- identify a misleading metric;
- find a missing recovery step;
- write an incident update in plain language;
- classify data and choose an appropriate handling rule;
- review a small code or infrastructure change;
- build a threat model from a simple system diagram;
- explain why a control can fail;
- choose a rollback point;
- conduct a tabletop decision;
- revisit a missed concept later in a different form.

Wrong answers produce a specific explanation and another attempt. They do not consume lives, block the lesson, or reduce access.

### Guided lab pattern

1. State the goal and safety boundary.
2. Draw the environment.
3. Capture the starting state.
4. Predict what the learner expects to observe.
5. Perform one bounded action.
6. Observe and record the result.
7. Explain the evidence.
8. Make one reversible defensive change.
9. Repeat the observation.
10. Restore or clean up.
11. Verify cleanup.
12. Write a short conclusion.

### Assessment integrity without hidden teaching

All teaching material remains open. Assessments are also reachable without completing another course. Assessment answer keys, scoring rules, and rotating item variants may remain server-side so a credential has meaning. This protects the assessment, not the curriculum.

An assessment page always shows:

- the skills being assessed;
- the evidence expected;
- the grading rubric;
- allowed tools and references;
- time expectations;
- privacy boundaries;
- retake policy;
- what the credential does and does not prove.

## Curriculum map

The catalog is grouped into five bands for orientation. A learner may open any band at any time.

| Band | Purpose | Paths |
| --- | --- | --- |
| A. Understand and protect | Personal safety, history, computer basics, and security thinking | CYB-00 through CYB-03 |
| B. Build and operate | Linux, networks, identity, endpoints, and vulnerability work | CYB-04 through CYB-09 |
| C. Observe and respond | Monitoring, intelligence, incident response, forensics, and recovery | CYB-10 through CYB-14 |
| D. Design secure systems | Software, web, cloud, cryptography, data, and architecture | CYB-15 through CYB-20 |
| E. Lead and validate | Governance, security programs, and advanced defensive validation | CYB-21 and CYB-22 |

## CYB-00: Cybersecurity orientation and history

**Outcome:** Explain what cybersecurity protects, how the field developed, what ethical authorization means, and how defensive work differs from dramatic fiction.

Courses:

1. **CYB-0001, What Cybersecurity Is:** assets, people, systems, data, risk, safety, privacy, resilience, and recovery.
2. **CYB-0002, A History of Shared Computers:** mainframes, time sharing, early access controls, passwords, audit trails, and why multi-user systems changed security.
3. **CYB-0003, From Phone Networks to the Internet:** early network exploration, worms, viruses, firewalls, public networks, the web, and the controls each period produced.
4. **CYB-0004, The Modern Threat Landscape:** cybercrime, espionage, disruption, insider risk, supply-chain failures, ransomware, cloud mistakes, and AI-assisted work without hype.
5. **CYB-0005, Permission, Ethics, and Law:** ownership, authorization, scope, evidence, disclosure, employment boundaries, and when to stop.
6. **CYB-0006, How Security Work Is Organized:** governance, protection, detection, response, recovery, roles, handoffs, and communication.

Guided work:

- build a personal asset map;
- distinguish a vulnerability from a threat and an incident;
- turn five dramatic fictional scenes into realistic defensive questions;
- place major defensive developments on a timeline;
- inspect a sample authorization letter and mark unclear scope;
- write a stop-work decision for an ambiguous request.

Capstone: Create a plain-language security and recovery plan for a fictional community organization.

## CYB-01: Personal digital safety

**Outcome:** Protect personal accounts, devices, communications, and important data without becoming dependent on fear or security products.

Courses:

1. **CYB-0101, Your Personal Threat Model:** likely risks, realistic priorities, safety planning, and avoiding paranoia.
2. **CYB-0102, Passwords and Password Managers:** unique passwords, vaults, recovery, passphrases, breaches, and safe migration.
3. **CYB-0103, Multi-Factor Authentication and Passkeys:** factors, phishing resistance, recovery codes, device loss, and account recovery.
4. **CYB-0104, Safer Browsing and Messaging:** links, attachments, downloads, impersonation, QR codes, browser isolation, and reporting.
5. **CYB-0105, Device Updates and Backups:** patching, encryption, screen locks, recovery media, backup types, and restore tests.
6. **CYB-0106, Home Network and Wi-Fi Safety:** router administration, wireless encryption, guest networks, updates, DNS, and connected devices.
7. **CYB-0107, Privacy and Data Brokerage:** permissions, metadata, location, public records, breach exposure, deletion, and realistic limits.
8. **CYB-0108, Travel, Loss, and Emergency Recovery:** public charging, border considerations, lost devices, emergency contacts, and recovery drills.

Labs:

- create an account inventory without uploading it;
- build an account-recovery packet;
- configure a synthetic password-manager vault;
- recognize simulated phishing cues;
- test a backup restore with harmless files;
- audit a home router using a read-only checklist;
- create a lost-device response card.

Capstone: Complete a personal security improvement plan, perform three chosen improvements, and document how each change can be recovered or undone.

## CYB-02: Security thinking and risk

**Outcome:** Reason about risk before selecting tools or controls.

Courses:

1. **CYB-0201, Assets, Threats, Vulnerabilities, and Controls**
2. **CYB-0202, Confidentiality, Integrity, Availability, Safety, and Privacy**
3. **CYB-0203, Trust Boundaries and Data Flows**
4. **CYB-0204, Defense in Depth and Failure Modes**
5. **CYB-0205, Likelihood, Impact, and Uncertainty**
6. **CYB-0206, Threat Modeling for Beginners**
7. **CYB-0207, Usability, Accessibility, and Human Error**
8. **CYB-0208, Security Claims and Evidence**

Labs and exercises:

- draw a trust-boundary diagram for a home file-sharing setup;
- find single points of failure;
- compare a preventive, detective, corrective, and recovery control;
- identify unsafe assumptions in a product claim;
- write a small risk register;
- choose proportionate controls for a neighborhood clinic scenario;
- conduct a tabletop exercise in which a protective control fails.

Capstone: Threat-model a small application and produce an improvement plan with owners, evidence, rollback, and residual risk.

## CYB-03: Computers and operating systems for defenders

**Outcome:** Understand enough computer and operating-system behavior to explain where security evidence and boundaries come from.

Courses:

1. **CYB-0301, Hardware, Firmware, Operating Systems, and Applications**
2. **CYB-0302, Processes, Threads, Memory, and Files**
3. **CYB-0303, Users, Groups, Privileges, and Services**
4. **CYB-0304, Storage, File Systems, and Metadata**
5. **CYB-0305, Startup, Shutdown, and Persistence Concepts**
6. **CYB-0306, Virtual Machines, Containers, and Isolation**
7. **CYB-0307, Time, Clocks, and Event Ordering**
8. **CYB-0308, Windows, macOS, and Linux Evidence Compared**

Labs:

- map one application from click to process to file access;
- compare user and administrator actions;
- inspect synthetic process and service listings;
- compare file metadata after copy and move operations;
- build the first isolated Cedar Lab virtual machine;
- observe how an incorrect clock changes an incident timeline.

Capstone: Explain an unfamiliar workstation using a system map that shows users, processes, storage, services, privileges, and evidence sources.

## CYB-04: Linux for defenders

**Outcome:** Use Linux safely as a security workstation and understand its security controls, evidence, and recovery paths.

Recommended preparation: Linux School foundation material. The course still supplies a short command-line, directory, ownership, and service summary for learners who start here.

Courses:

1. **CYB-0401, Linux Security Orientation:** kernel, user space, distributions, packages, shells, and the security implications of each layer.
2. **CYB-0402, Users, Groups, Ownership, and Permissions:** numeric and symbolic permissions, default permissions, special bits, ACLs, and safe verification.
3. **CYB-0403, Privilege and Administrative Boundaries:** root, `sudo`, service accounts, least privilege, and auditability.
4. **CYB-0404, Processes, Services, and Startup:** process trees, signals, `systemd`, unit files, scheduled work, and persistence indicators.
5. **CYB-0405, Linux Logs and Journals:** system journal, authentication records, service logs, rotation, time, and evidence preservation.
6. **CYB-0406, Packages, Repositories, and Software Trust:** signed metadata, package sources, updates, dependency risk, and rollback planning.
7. **CYB-0407, Linux Network Exposure:** sockets, local addresses, listening services, firewall concepts, DNS configuration, and verification.
8. **CYB-0408, Mandatory Access and Sandboxing:** SELinux, AppArmor, namespaces, capabilities, seccomp, and why multiple boundaries exist.
9. **CYB-0409, Linux Hardening Without Breaking the Host:** baseline, change plan, safe configuration, validation, and repair.
10. **CYB-0410, Linux Incident Triage:** users, processes, services, files, logs, network state, and volatile evidence.

Labs:

- explain every field in a long directory listing;
- trace permission checks from user to group to other;
- create and remove a least-privilege lab user;
- compare a process tree before and after starting a service;
- find the log evidence for a synthetic failed login;
- verify a package source and record its signing path;
- inventory listening services without scanning another host;
- apply one reversible firewall rule in an isolated VM;
- observe an AppArmor or SELinux denial in a provided trace;
- harden a disposable Linux server and prove the service still works;
- collect a read-only triage bundle and then destroy the lab copy.

Capstone: Establish a secure, observable Linux service in Cedar Lab, document every change, test recovery, and explain the remaining risks.

## CYB-05: Network security foundations

**Outcome:** Observe and protect network communication while understanding what each control can and cannot see.

Recommended preparation: Networking School foundations. A packet, address, port, protocol, route, DNS, and TLS context summary is always available on the course page.

Courses:

1. **CYB-0501, Packets as Evidence:** headers, payloads, encapsulation, timestamps, captures, and privacy.
2. **CYB-0502, Network Boundaries and Segmentation:** zones, trust, routing, VLAN concepts, guest networks, and failure modes.
3. **CYB-0503, Firewalls and Policy:** state, direction, source, destination, service, defaults, logging, and change control.
4. **CYB-0504, DNS Security:** resolution, caching, filtering, logging, spoofing concepts, DNSSEC context, and incident clues.
5. **CYB-0505, DHCP, Addressing, and Neighbor Discovery:** leases, address conflicts, ARP and NDP concepts, inventories, and anomalies.
6. **CYB-0506, TLS and Encrypted Network Sessions:** certificates, names, trust chains, metadata, inspection tradeoffs, and failures.
7. **CYB-0507, Wireless Security:** authentication, encryption, guest access, management, roaming, and monitoring boundaries.
8. **CYB-0508, VPNs, Tunnels, and Remote Access:** threat models, split routes, identity, device trust, logging, and recovery.
9. **CYB-0509, Network Detection and Flow Records:** baselines, flow, packet evidence, limits, and retention.
10. **CYB-0510, Routing Security Context:** route trust, prefix ownership, BGP incidents, filtering, RPKI concepts, and escalation.

Labs:

- annotate a supplied packet capture;
- reconstruct a DNS lookup;
- compare allowed and blocked connection logs;
- write and test a host-only firewall policy;
- segment Cedar Lab into user, server, and sensor zones;
- inspect a synthetic certificate chain;
- compare tunnel routes before and after a local VPN connection;
- identify a simulated DNS change from logs;
- build a normal traffic baseline before reviewing an anomaly;
- analyze a sanitized route-leak case without connecting to BGP peers.

Capstone: Design and validate a small segmented network with a written policy, observable controls, remote-access plan, and recovery procedure.

## CYB-06: Identity and access management

**Outcome:** Design and operate identity controls that support people, devices, services, and recovery.

Courses:

1. **CYB-0601, Identity, Accounts, Credentials, and Sessions**
2. **CYB-0602, Authentication Factors, Passkeys, and Recovery**
3. **CYB-0603, Authorization, Roles, Attributes, and Policy**
4. **CYB-0604, Least Privilege and Privileged Access**
5. **CYB-0605, Service Accounts, Tokens, Keys, and Workload Identity**
6. **CYB-0606, Directories, Federation, and Single Sign-On**
7. **CYB-0607, Identity Lifecycle: Join, Change, Leave**
8. **CYB-0608, Identity Monitoring and Investigation**
9. **CYB-0609, Recovery Without Creating a Back Door**

Labs:

- diagram an authentication and authorization flow;
- compare password, passkey, recovery, and federation events;
- design roles for a fictional clinic;
- find excessive access in a synthetic entitlement report;
- rotate a disposable service credential;
- investigate a simulated impossible-travel alert using provided evidence;
- disable a departing account and verify every dependent access path;
- write a safe account-recovery procedure.

Capstone: Build an identity lifecycle and access-review plan for Cedar Junction, including emergency access, monitoring, recovery, and removal.

## CYB-07: Endpoint and device defense

**Outcome:** Establish, observe, maintain, and recover personal and organizational devices.

Courses:

1. **CYB-0701, Endpoint Baselines and Inventory**
2. **CYB-0702, Secure Configuration and Change Control**
3. **CYB-0703, Updates, Patching, and Reboots**
4. **CYB-0704, Disk Encryption, Secure Boot, and Recovery Keys**
5. **CYB-0705, Application Control and Browser Protection**
6. **CYB-0706, Endpoint Detection Concepts and Telemetry**
7. **CYB-0707, Removable Media and Peripheral Risk**
8. **CYB-0708, Mobile Device Security**
9. **CYB-0709, Windows, macOS, and Linux Hardening Compared**
10. **CYB-0710, Rebuild, Restore, and Return to Service**

Labs:

- create a minimal asset record;
- compare a baseline to a changed configuration;
- plan a patch ring with rollback;
- verify synthetic disk-encryption status;
- investigate a benign endpoint alert;
- review browser extension permissions;
- build a removable-media policy;
- validate a restored workstation before returning it to use.

Capstone: Baseline, harden, monitor, and recover a disposable workstation while preserving a complete change and evidence record.

## CYB-08: Vulnerability management

**Outcome:** Find, understand, prioritize, repair, and verify weaknesses without reducing security to a scanner score.

Courses:

1. **CYB-0801, Bugs, Misconfigurations, Exposures, and Vulnerabilities**
2. **CYB-0802, CVE, CWE, Advisories, and Affected Versions**
3. **CYB-0803, Safe Asset Discovery and Authorized Scanning**
4. **CYB-0804, Severity, CVSS, Threat, and Environmental Context**
5. **CYB-0805, Prioritization Beyond the Highest Number**
6. **CYB-0806, Remediation, Mitigation, Acceptance, and Exceptions**
7. **CYB-0807, Patch Validation and Regression Risk**
8. **CYB-0808, Dependency and Supply-Chain Vulnerabilities**
9. **CYB-0809, Reporting Without Overclaiming**

Labs:

- distinguish an exposure, misconfiguration, and vulnerability;
- verify whether a synthetic inventory is affected by an advisory;
- run an authenticated scanner only against Cedar Lab;
- calculate and explain a supplied CVSS v4 vector;
- reprioritize findings using asset importance and known exposure;
- write remediation and compensating-control plans;
- patch a disposable service and prove the finding is gone;
- review a software bill of materials;
- write a concise owner-facing vulnerability report.

Capstone: Operate one full vulnerability cycle for Cedar Lab from inventory through verified remediation and exception review.

## CYB-09: Security architecture and resilient foundations

**Outcome:** Design systems that reduce trust, limit harm, remain observable, and can recover.

Courses:

1. **CYB-0901, Security Requirements and Abuse Cases**
2. **CYB-0902, Secure Defaults and Least Functionality**
3. **CYB-0903, Trust Boundaries and Zero Trust Concepts**
4. **CYB-0904, Segmentation, Isolation, and Blast Radius**
5. **CYB-0905, Secrets, Keys, and Configuration Boundaries**
6. **CYB-0906, Availability, Backups, and Resilience**
7. **CYB-0907, Administrative Planes and Break-Glass Access**
8. **CYB-0908, Third Parties and Supply-Chain Trust**
9. **CYB-0909, Architecture Review and Decision Records**

Labs:

- turn user needs into security requirements;
- identify unsafe defaults in a fictional service;
- reduce a system's blast radius on paper;
- separate data, management, and monitoring paths;
- replace a hard-coded synthetic secret;
- test a recovery design during a tabletop;
- write an architecture decision record with rejected options.

Capstone: Produce and defend a resilient architecture for a small public-facing service.

## CYB-10: Logging, monitoring, and security operations

**Outcome:** Build useful telemetry, recognize meaningful change, investigate alerts, and improve detections without treating every event as an incident.

Courses:

1. **CYB-1001, Events, Logs, Metrics, Traces, and Alerts**
2. **CYB-1002, Time, Identity, Host, Network, and Application Context**
3. **CYB-1003, Log Collection, Parsing, Storage, and Retention**
4. **CYB-1004, Baselines and Normal Behavior**
5. **CYB-1005, Detection Logic and Testable Hypotheses**
6. **CYB-1006, Alert Triage and Case Management**
7. **CYB-1007, SIEM Concepts Without Product Dependence**
8. **CYB-1008, Detection Gaps, False Positives, and False Negatives**
9. **CYB-1009, Security Operations Communication and Handoffs**
10. **CYB-1010, Measuring Detection Quality**

Labs:

- explain a single authentication event field by field;
- normalize three supplied log formats;
- correct a timezone error in an incident timeline;
- establish a one-day Cedar Lab baseline;
- write and test a simple defensive detection against synthetic data;
- triage a mixed queue of benign, suspicious, and incomplete alerts;
- document why an alert is closed, escalated, or monitored;
- identify a logging gap after a simulated service change;
- tune a noisy rule without hiding the target behavior;
- hand off a case using a complete, plain-language summary.

Capstone: Build a small, product-neutral monitoring plan and investigate a multi-source anomaly from first alert through documented disposition.

## CYB-11: Threat intelligence and adversary behavior for defenders

**Outcome:** Use source-evaluated intelligence and adversary behavior models to improve defensive decisions, without turning a behavior catalog into an attack recipe.

Courses:

1. **CYB-1101, Information, Evidence, Intelligence, and Decisions**
2. **CYB-1102, Intelligence Requirements and Collection Plans**
3. **CYB-1103, Source Reliability, Confidence, and Bias**
4. **CYB-1104, Indicators, Behaviors, and Their Limits**
5. **CYB-1105, MITRE ATT&CK as a Defensive Vocabulary**
6. **CYB-1106, Campaign, Actor, Tool, and Technique Claims**
7. **CYB-1107, Sharing, Classification, and Traffic Light Protocol Context**
8. **CYB-1108, Turning Intelligence into a Detection or Control Change**
9. **CYB-1109, Measuring Whether Intelligence Helped**

Labs:

- score the reliability and confidence of supplied claims;
- distinguish an indicator from a behavior;
- map a sanitized incident narrative to defensive ATT&CK concepts;
- reject an unsupported actor attribution;
- write an intelligence requirement for a small organization;
- convert a public advisory into inventory, monitoring, and remediation actions;
- produce a short intelligence note with sources, uncertainty, and an expiration date.

Capstone: Produce and defend an intelligence-to-action brief for a fictional organization with a specific exposure.

## CYB-12: Threat hunting

**Outcome:** Form a testable hypothesis, collect appropriate evidence, examine it safely, and communicate both positive and negative findings.

Courses:

1. **CYB-1201, What Threat Hunting Is and Is Not**
2. **CYB-1202, Questions, Hypotheses, and Scoping**
3. **CYB-1203, Data Sources and Visibility Gaps**
4. **CYB-1204, Host-Based Hunts**
5. **CYB-1205, Network-Based Hunts**
6. **CYB-1206, Identity and Cloud Hunts**
7. **CYB-1207, Pivoting Between Evidence Without Scope Creep**
8. **CYB-1208, Negative Results and Residual Uncertainty**
9. **CYB-1209, Turning a Hunt into Durable Detection**

Labs:

- turn a vague suspicion into a bounded hypothesis;
- identify which data could answer the question;
- hunt through a supplied endpoint dataset;
- correlate host, identity, DNS, and flow records;
- stop a hunt when evidence leaves the authorized boundary;
- document a negative result honestly;
- convert a useful hunt step into a repeatable detection test.

Capstone: Conduct a complete hunt across the synthetic Cedar Junction dataset and produce a reproducible notebook, findings, visibility gaps, and recommended changes.

## CYB-13: Incident response and crisis coordination

**Outcome:** Prepare for, identify, contain, eradicate, recover from, and learn from an incident while protecting people and evidence.

Courses:

1. **CYB-1301, Incident Response Before the Incident**
2. **CYB-1302, Detection, Declaration, Severity, and Roles**
3. **CYB-1303, Scoping and Evidence Preservation**
4. **CYB-1304, Containment Decisions and Business Tradeoffs**
5. **CYB-1305, Eradication and Root Cause**
6. **CYB-1306, Recovery, Validation, and Heightened Monitoring**
7. **CYB-1307, Technical and Executive Communication**
8. **CYB-1308, Legal, Privacy, Insurance, and External Coordination Context**
9. **CYB-1309, Post-Incident Review Without Blame**
10. **CYB-1310, Playbooks, Tabletop Exercises, and Improvement Tracking**

Labs:

- build an incident contact and decision matrix;
- declare and classify a synthetic incident;
- create a timestamped case record;
- compare containment options for a critical service;
- preserve supplied evidence while documenting hashes and handling;
- coordinate technical and nontechnical updates;
- recover Cedar Lab from a known clean state;
- conduct a blameless review and assign measurable improvements;
- run a tabletop for a failed identity provider or unavailable backup.

Capstone: Lead a complete Cedar Junction incident exercise with decisions, evidence, communications, recovery validation, and a post-incident improvement plan.

## CYB-14: Digital forensics

**Outcome:** Preserve, examine, correlate, and report digital evidence while clearly separating observation, interpretation, and conclusion.

Courses:

1. **CYB-1401, Forensic Purpose, Scope, Ethics, and Evidence Integrity**
2. **CYB-1402, Acquisition, Hashing, Documentation, and Chain of Custody**
3. **CYB-1403, File-System and Storage Evidence**
4. **CYB-1404, Windows Artifact Foundations**
5. **CYB-1405, Linux Artifact Foundations**
6. **CYB-1406, macOS Artifact Foundations**
7. **CYB-1407, Memory and Volatile Evidence Concepts**
8. **CYB-1408, Browser, Email, and Application Artifacts**
9. **CYB-1409, Network and Cloud Evidence**
10. **CYB-1410, Timelines, Correlation, and Clock Problems**
11. **CYB-1411, Forensic Reporting and Testimony Context**

Labs:

- verify a provided image without mounting it read-write;
- complete an evidence receipt and handling log;
- recover synthetic file history from a prepared image;
- identify relevant Windows, Linux, and macOS artifacts in static datasets;
- build a timeline from several time zones;
- correlate browser, identity, and network evidence;
- mark unsupported conclusions in a poor report;
- write findings that another examiner can reproduce.

Capstone: Examine a synthetic multi-system case, preserve a reproducible record, and produce a report that distinguishes fact, interpretation, limitation, and conclusion.

## CYB-15: Secure software foundations

**Outcome:** Design, implement, review, test, release, and maintain software with security treated as part of normal engineering.

Courses:

1. **CYB-1501, Secure Development Lifecycle for Beginners**
2. **CYB-1502, Requirements, Abuse Cases, and Trust Boundaries**
3. **CYB-1503, Input, Output, Types, and Validation**
4. **CYB-1504, Errors, Logging, and Information Exposure**
5. **CYB-1505, Authentication and Authorization in Applications**
6. **CYB-1506, Secrets and Configuration**
7. **CYB-1507, Dependencies, Builds, and Software Supply Chains**
8. **CYB-1508, Code Review and Security Tests**
9. **CYB-1509, Release, Rollback, and Vulnerability Response**
10. **CYB-1510, Memory Safety and Language Tradeoffs**

Labs:

- draw a data flow for a small application;
- add boundaries and abuse cases to a feature request;
- repair a safe input-validation flaw in a local toy program;
- redact sensitive data from synthetic logs;
- find an authorization mistake in provided pseudocode;
- remove a synthetic secret from source control history in a disposable repository;
- review a dependency update and its provenance;
- write a regression test for a repaired flaw;
- prepare a safe release and rollback note.

Capstone: Perform a security review of a small local application, repair selected findings, test them, and publish a transparent residual-risk record.

## CYB-16: Web and API security

**Outcome:** Explain and defend browser, server, session, and API trust boundaries using safe local examples.

Courses:

1. **CYB-1601, The Browser, Server, Origin, and Request Boundary**
2. **CYB-1602, HTTP, Headers, Cookies, Sessions, and Caches**
3. **CYB-1603, Input Handling and Injection Families**
4. **CYB-1604, Browser Content and Cross-Site Scripting Defense**
5. **CYB-1605, Request Forgery, Origins, and State Changes**
6. **CYB-1606, Access Control and Object-Level Authorization**
7. **CYB-1607, API Keys, OAuth, Tokens, and Scope**
8. **CYB-1608, Uploads, Parsers, and Resource Limits**
9. **CYB-1609, Security Headers and Browser Protections**
10. **CYB-1610, Web Logging, Testing, and Incident Clues**

Labs:

- inspect a synthetic request and response;
- compare secure and insecure cookie attributes;
- repair a local toy injection flaw without attacking a public service;
- encode output correctly in a provided small application;
- add request-origin protection to a local state-changing route;
- find a broken authorization check in an isolated API;
- restrict a disposable token's scope;
- add file type, size, and processing limits to a toy upload route;
- verify security headers;
- write a test and monitoring event for each repair.

Capstone: Review and harden a local web application against a published rubric based on secure design and current OWASP guidance.

## CYB-17: Cloud, container, and infrastructure security

**Outcome:** Secure cloud and container environments through identity, configuration, network boundaries, logging, cost control, and recoverable automation.

Courses:

1. **CYB-1701, Cloud Responsibility, Regions, Accounts, and Projects**
2. **CYB-1702, Cloud Identity and Short-Lived Access**
3. **CYB-1703, Virtual Networks, Gateways, and Public Exposure**
4. **CYB-1704, Object Storage, Databases, and Data Boundaries**
5. **CYB-1705, Compute Images, Functions, and Managed Services**
6. **CYB-1706, Cloud Logs, Configuration History, and Alerts**
7. **CYB-1707, Containers, Images, Registries, and Runtime Boundaries**
8. **CYB-1708, Kubernetes Security Concepts**
9. **CYB-1709, Infrastructure as Code and Policy Checks**
10. **CYB-1710, Cloud Incident Response and Recovery**
11. **CYB-1711, Cost, Cleanup, and Avoiding Orphaned Resources**

Labs:

- map shared responsibility for three service models;
- replace a long-lived synthetic key with a short-lived lab identity;
- find public exposure in a static cloud configuration;
- repair a local object-storage policy simulation;
- inspect a container image bill of materials;
- run a rootless local container with reduced privileges;
- review a Kubernetes manifest without creating a cluster;
- test infrastructure policy against provided configuration;
- investigate a synthetic cloud audit trail;
- execute and verify a complete cleanup plan.

Cloud labs default to local simulations. A real cloud sandbox is an optional route with a budget, region, resource list, cost estimate, and one-command inventory plus explicit deletion verification.

Capstone: Design, deploy in a chosen sandbox or simulate locally, observe, and fully remove a small cloud service while preserving a security and cost record.

## CYB-18: Cryptography and public key infrastructure

**Outcome:** Choose and operate cryptographic building blocks safely without pretending that implementing new cryptography is a beginner task.

Courses:

1. **CYB-1801, What Cryptography Can and Cannot Do**
2. **CYB-1802, Randomness, Entropy, Nonces, and Salts**
3. **CYB-1803, Hashes and Message Authentication**
4. **CYB-1804, Symmetric Encryption and Authenticated Encryption**
5. **CYB-1805, Public Keys, Signatures, and Key Exchange**
6. **CYB-1806, Certificates, Authorities, Chains, and Revocation**
7. **CYB-1807, Key Storage, Rotation, Backup, and Destruction**
8. **CYB-1808, Password Storage and Derivation**
9. **CYB-1809, TLS Failure Diagnosis**
10. **CYB-1810, Cryptographic Agility and Post-Quantum Context**

Labs:

- compare encoding, hashing, encryption, and signing;
- detect unsafe nonce reuse in prepared examples;
- verify a file digest and a message authentication code;
- encrypt and decrypt harmless local text using a supported tool;
- create a disposable key pair and verify a signature;
- inspect a local certificate chain;
- rotate and revoke lab credentials;
- compare a safe password record to common unsafe forms;
- diagnose a supplied TLS failure;
- build a cryptographic inventory and migration plan.

The school does not ask learners to design an original cipher or deploy hand-written cryptography in production.

Capstone: Create a key and certificate lifecycle for a small internal service, demonstrate rotation and recovery, and explain trust and failure boundaries.

## CYB-19: Data security and privacy engineering

**Outcome:** Find, classify, minimize, protect, retain, share, and delete data according to real needs and clear promises.

Courses:

1. **CYB-1901, Data Inventory, Ownership, and Classification**
2. **CYB-1902, Collection, Purpose, and Data Minimization**
3. **CYB-1903, Storage, Encryption, Backup, and Access**
4. **CYB-1904, Retention, Deletion, and Legal Hold Context**
5. **CYB-1905, Data Sharing, Vendors, and Transfers**
6. **CYB-1906, De-Identification and Re-Identification Risk**
7. **CYB-1907, Privacy Threat Modeling**
8. **CYB-1908, Logging and Telemetry Without Unnecessary Surveillance**
9. **CYB-1909, Data Incident Scoping and Notification Context**

Labs:

- build a data-flow and ownership inventory;
- remove unnecessary fields from a fictional form;
- classify a synthetic dataset;
- write access, retention, and deletion rules;
- review a vendor data-flow statement;
- test deletion across a simulated primary copy and backup catalog;
- find re-identification risk in a small synthetic dataset;
- redesign telemetry to preserve utility while reducing personal data;
- scope a fictional data exposure without overcounting or understating it.

Capstone: Complete a privacy and data-security review for a small service from collection through deletion and incident response.

## CYB-20: Backup, recovery, and resilience engineering

**Outcome:** Build recoverable services and prove that restoration works before an emergency.

Courses:

1. **CYB-2001, Availability, Resilience, Continuity, and Recovery**
2. **CYB-2002, Recovery Objectives and Business Priorities**
3. **CYB-2003, Backup Types, Copies, Isolation, and Immutability**
4. **CYB-2004, Restore Testing and Data Validation**
5. **CYB-2005, High Availability and Its Hidden Dependencies**
6. **CYB-2006, Ransomware-Resilient Recovery**
7. **CYB-2007, Disaster Recovery Sites and Cloud Recovery Context**
8. **CYB-2008, Crisis Operations and Manual Workarounds**
9. **CYB-2009, Return to Normal and Recovery Review**

Labs:

- choose recovery objectives for several services;
- construct a 3-2-1-style backup design and explain its limits;
- detect a backup job that succeeded without protecting useful data;
- restore and validate a small synthetic service;
- identify shared dependencies in an availability diagram;
- recover Cedar Lab after synthetic encryption of disposable data;
- operate a tabletop manual workaround;
- prove that restored identities, logs, and monitoring are trustworthy.

Capstone: Design and run a documented recovery exercise with measured restoration, data checks, communications, and improvement actions.

## CYB-21: Governance, risk, compliance, and security programs

**Outcome:** Build a security program that turns business needs and risk into owned, measurable, reviewable work.

Courses:

1. **CYB-2101, Governance, Accountability, and Decision Rights**
2. **CYB-2102, Policies, Standards, Procedures, and Guidelines**
3. **CYB-2103, Risk Registers, Treatment, and Acceptance**
4. **CYB-2104, NIST Cybersecurity Framework 2.0**
5. **CYB-2105, CIS Controls and Prioritized Safeguards**
6. **CYB-2106, Regulations, Contracts, and Compliance Evidence**
7. **CYB-2107, Audit, Evidence, Findings, and Corrective Action**
8. **CYB-2108, Third-Party and Supply-Chain Risk**
9. **CYB-2109, Security Metrics That Support Decisions**
10. **CYB-2110, Budget, Roadmaps, Ownership, and Exceptions**
11. **CYB-2111, Security Awareness Without Blame or Tricks**
12. **CYB-2112, Building and Sustaining a Small Security Program**

Labs:

- map a fictional organization to NIST CSF 2.0 outcomes;
- prioritize CISA Cross-Sector Cybersecurity Performance Goals;
- write a short policy and its supporting procedure;
- review a control and evidence package;
- identify compliance theater;
- record a risk acceptance with an owner and expiration;
- evaluate a fictional service provider;
- create a metric with a decision attached;
- build a one-year security improvement roadmap;
- conduct a tabletop for an executive team.

Capstone: Create a right-sized security program for Cedar Junction with governance, current and target profiles, prioritized improvements, owners, evidence, incident readiness, and recovery.

## CYB-22: Advanced defensive validation and special environments

**Outcome:** Validate whether security controls work in isolated environments and adapt defensive methods to specialized systems.

Courses:

1. **CYB-2201, Defensive Validation, Control Testing, and Purple-Team Concepts**
2. **CYB-2202, Safe Adversary Simulation with Benign Test Actions**
3. **CYB-2203, Detection Engineering as Tested Software**
4. **CYB-2204, Security Automation and Guardrails**
5. **CYB-2205, Deception and Canary Concepts**
6. **CYB-2206, Operational Technology and Safety Boundaries**
7. **CYB-2207, Internet of Things and Embedded Device Security**
8. **CYB-2208, Mobile Application and Device Ecosystems**
9. **CYB-2209, Software and Firmware Supply-Chain Validation**
10. **CYB-2210, AI System Security and Model Risk Context**
11. **CYB-2211, Research Reproduction and Responsible Disclosure**
12. **CYB-2212, Building a Defensible Security Lab**

Labs:

- define a safe test objective and success condition;
- execute a benign, documented test action in Cedar Lab;
- confirm prevention, detection, alerting, response, and cleanup separately;
- unit-test a detection against positive and negative fixtures;
- add approval and dry-run safeguards to a small defensive automation;
- detect interaction with a harmless canary file;
- analyze static OT, IoT, mobile, and firmware evidence without connecting to live equipment;
- reproduce a historical defensive finding from a fully patched, offline image;
- write a responsible-disclosure decision and communication plan.

This path does not provide unrestricted offensive tradecraft. It teaches authorization, bounded validation, defensive evidence, and cleanup.

Capstone: Plan and conduct a controlled defensive validation exercise, measure each control layer, restore the environment, and publish a safe report with no reusable attack package.

## Suggested learner routes

Routes are recommendations displayed on the catalog. They never determine access.

### Everyday protection route

CYB-00, CYB-01, selected CYB-06, CYB-07, CYB-20

### New security analyst route

CYB-00, CYB-02, CYB-03, CYB-04, CYB-05, CYB-06, CYB-10, CYB-11, CYB-13

### Incident response and forensics route

CYB-00, CYB-02, CYB-03, CYB-04, CYB-05, CYB-10, CYB-13, CYB-14, CYB-20

### Secure developer route

Suggested order: Programming foundations, CYB-02, CYB-06, CYB-09, CYB-15, CYB-16, CYB-17, CYB-18

### Cloud defender route

CYB-02, CYB-04, CYB-05, CYB-06, CYB-09, CYB-10, CYB-17, CYB-20

### Security administrator route

CYB-02, CYB-03, CYB-04, CYB-05, CYB-06, CYB-07, CYB-08, CYB-10, CYB-20

### Security program leader route

CYB-00, CYB-01, CYB-02, CYB-09, CYB-13, CYB-19, CYB-20, CYB-21

### Advanced defensive engineer route

CYB-04 through CYB-18 as relevant, then CYB-22

Every route page includes **Start anywhere** and **Browse all courses** above the recommended sequence.

## Course-page information architecture

Every course page should use teaching space, not sales language.

### Top of page

- course title;
- one-sentence purpose;
- what the learner will be able to do;
- difficulty and expected time;
- lab requirements and risk class;
- supported platforms;
- recommended preparation, clearly labeled optional;
- Start now, Review a refresher, and Read the short context summary;
- last technical review date.

### Course body

- module list with outcomes and estimated time;
- lab list with equipment and safety information;
- concepts introduced;
- history interludes;
- capstone and rubric;
- sources;
- change history;
- credential relationship, if any.

### Progress display

Progress is descriptive, not a lock:

- 18 of 42 units read;
- 3 of 7 practice sets completed;
- 2 of 5 labs marked complete;
- capstone not attempted;
- last activity date;
- optional review due.

The learner can open unit 42 when unit 1 is untouched.

## Visual and interaction direction

### Page layout

- readable teaching column of approximately 65 to 75 characters;
- wider workspace only for diagrams, tables, timelines, code, packets, and logs;
- distinct scales for page title, module title, lesson heading, body text, labels, and code;
- whitespace used to separate ideas;
- compact persistent breadcrumb and previous or next controls;
- no oversized promotional hero inside a course;
- no wall of identical rounded cards;
- no artificial terminal texture behind normal reading;
- no neon glow, glitch animation, fake surveillance overlay, or flashing alert effect;
- no required horizontal scrolling at 200 percent zoom;
- independent instruction and workspace panes only where keeping both visible materially helps.

### Purposeful visual types

| Concept | Preferred visual |
| --- | --- |
| Sequence of events | Timeline |
| Trust and data movement | Data-flow diagram |
| Network communication | Packet journey or topology |
| Identity decision | Authentication and authorization flow |
| System ownership | Asset and responsibility map |
| Evidence and uncertainty | Facts, assumptions, questions board |
| Control coverage | Layered system diagram |
| Configuration change | Before and after diff |
| Investigation | Correlated event table and timeline |
| Recovery | State transition and dependency map |
| Risk decision | Small matrix plus written reasoning |

Every visual has a text explanation. Color is never the only carrier of meaning. Diagrams remain legible in light and dark themes, at 200 percent zoom, and in high-contrast mode.

### Three-column evidence view

Many defensive lessons can use one repeated visual:

| Normal | Changed or suspicious | How to verify |
| --- | --- | --- |
| Known user signs in from a usual device | Same account signs in from a new location and device | Check identity events, device enrollment, recent support actions, and the user's report |

This keeps the teaching grounded in evidence rather than dramatic conclusions.

### Historical interludes

History is part of the technical explanation, not decoration. An interlude should answer:

- What did systems look like at the time?
- What failed or changed?
- Which control or practice emerged?
- What did that control fail to solve?
- Where does the idea still appear today?

After a short interlude, a **Back to the work** marker returns to the current task. History sections are readable in 5 to 12 minutes and may be bookmarked independently.

## Credentials

Credentials record demonstrated outcomes. They do not control course access.

### Completion records

Available for each learning path when the learner completes its authored units and formative checks. A completion record states that the material was completed. It does not claim independent skill verification.

### Applied skill credentials

Initial candidates:

- Personal Digital Safety
- Linux Security Operator
- Network Defense Technician
- Identity and Access Technician
- Vulnerability Management Practitioner
- Security Monitoring Analyst
- Incident Response Coordinator
- Digital Forensics Foundations
- Secure Software Reviewer
- Cloud Security Operator
- Recovery and Resilience Operator
- Cybersecurity Program Foundations

Each applied credential requires:

- an open assessment blueprint;
- a server-scored knowledge assessment;
- one or more guided local labs;
- an applied scenario;
- a published rubric;
- a redacted evidence package or reviewer-verified work sample;
- explicit identity and authorship limitations;
- course and assessment versioning;
- an issue date and review or renewal policy.

### Broad certificates

Broad certificates are deferred until multiple applied assessments have been reviewed and the evidence process is reliable.

Potential future certificates:

- **Cyber Defense Practitioner:** broad protection, monitoring, incident response, recovery, and communication.
- **Secure Systems Practitioner:** Linux, networks, identity, applications, cloud, cryptography, and resilient design.

These require several applied assessments, an integrative capstone, broad knowledge assessment, and independent review. The platform must not call a learner a certified professional based only on page completion.

### Public verification

Credential visibility is private by default. An opt-in public verification page may display:

- credential name;
- learner-selected display name;
- credential ID;
- issue date;
- current, expired, legacy, or revoked status;
- skills assessed;
- assessment version;
- evidence level;
- issuer;
- a statement of limitations.

It does not reveal raw lab output, private progress, account details, legal identity, home network information, hardware identifiers, or assessment answers.

## Progress, evidence, and privacy

### Progress data

The platform may store:

- unit, exercise, lab, project, assessment, and path identifiers;
- completion timestamps;
- bounded answer aggregates;
- review scheduling state;
- rubric results;
- credential records;
- learner-created bookmarks and private notes when explicitly saved.

### Data the platform should not store by default

- commands typed in local labs;
- source IP inventories;
- packet captures;
- disk or memory images;
- raw security logs;
- real account names;
- credentials, private keys, tokens, or recovery codes;
- vulnerability scan results from non-lab systems;
- home router configuration exports;
- private source code;
- cloud account exports;
- unredacted forensic reports.

### Lab evidence package

When evidence is needed for a credential, the learner receives a local redaction checklist. The smallest acceptable package is preferred:

```text
evidence/
├── assessment-manifest.json
├── lab-version.txt
├── environment-summary-redacted.json
├── checksums.txt
├── findings-summary.md
├── decision-log.md
├── recovery-verification.md
└── learner-attestation.md
```

The learner sees every file and field before upload. Automated checking validates structure and consistency only. It does not pretend to prove authorship. Judgment-heavy capstones require a reviewer.

## Source and maintenance rules

Security material changes. Each course must identify its sources, affected tool versions, and last review date.

### Primary framework map

- [NIST Cybersecurity Framework 2.0](https://www.nist.gov/cyberframework) provides the concurrent Govern, Identify, Protect, Detect, Respond, and Recover outcomes used across the school.
- [NICE Workforce Framework for Cybersecurity](https://www.nist.gov/itl/applied-cybersecurity/nice/nice-framework-resource-center/getting-started) provides Task, Knowledge, and Skill language for mapping assessed capabilities to real work.
- [CISA Cross-Sector Cybersecurity Performance Goals](https://www.cisa.gov/cross-sector-cybersecurity-performance-goals) provide a prioritized baseline of high-impact outcomes.
- [CIS Controls v8.1](https://www.cisecurity.org/controls/cis-controls-list) provide practical and prioritized safeguards.
- [MITRE ATT&CK](https://attack.mitre.org/resources/) provides a behavior vocabulary based on real-world observations. The school uses it for defensive understanding, detection, and coverage analysis, not as a step-by-step intrusion curriculum.
- [OWASP Top 10](https://owasp.org/www-project-top-ten/) provides a current awareness baseline for web application risks.
- [NIST SP 800-61 Revision 3](https://csrc.nist.gov/pubs/sp/800/61/r3/final) provides current incident-response guidance aligned with CSF 2.0.
- [NIST SP 800-63-4](https://csrc.nist.gov/pubs/sp/800/63/4/final) provides current digital identity, authentication, and federation guidance.
- [FIRST CVSS v4.0](https://www.first.org/cvss/v4.0/) provides the current scoring specification and guidance taught in vulnerability management.
- [CISA Secure by Design](https://www.cisa.gov/securebydesign) supports the principle that product makers should take responsibility for customer security outcomes.

Frameworks are references, not complete lesson plans. Course authors translate them into plain language, cite the exact version, state where guidance is nonbinding, and avoid presenting one framework as universal law.

### Content review cadence

| Content type | Minimum review |
| --- | --- |
| Personal safety and identity recommendations | Every 6 months |
| Tool installation and operating-system procedures | Every supported major release, and at least every 6 months |
| Cloud, container, and application-security procedures | Every 6 months |
| Framework and standards mapping | When the source changes, and at least annually |
| Historical context | Annually for sources and links |
| Lab images and dependencies | Monthly vulnerability scan, quarterly rebuild |
| Assessment item banks | Quarterly quality and exposure review |
| Credential rubrics | Annual industry and reviewer calibration |

Broken links, withdrawn standards, unpatched lab images, unsupported package versions, or unclear authorization steps fail the relevant content release.

## Implementation milestones

Implementation dependencies below describe how the team builds safely. They do not create learner-facing content gates.

### Phase CYB-A: Charter, safety, and open catalog

- **CYB-M001, school charter:** Publish the purpose, audience, defensive boundary, privacy boundary, and no-voice rule. Complete when every proposed activity is classified as on-site learning, local lab work, or credential assessment.
- **CYB-M002, open-content contract:** Remove completion-based access checks from the generic course contract. Complete when every published course, unit, lab page, and assessment can be opened directly by a guest.
- **CYB-M003, preparation choices:** Add Start now, Review a refresher, and Read the short context summary to every course that recommends earlier material. Complete when no choice silently redirects or blocks the learner.
- **CYB-M004, authorization contract:** Define ownership, permission, scope, stop conditions, and evidence handling. Complete when active labs cannot be published without these fields.
- **CYB-M005, content-risk classification:** Apply the shared L0 through L4 risk classes and disallowed-content review. Complete when every lab and dual-use unit has an owner-approved classification.
- **CYB-M006, original narrative bible:** Finalize Mara Venn, Cedar Junction, visual boundaries, recurring case patterns, and legal-distinctness review.
- **CYB-M007, source governance:** Add source version, last review, affected tools, and maintenance owner to the content schema.

### Phase CYB-B: Generic curriculum and reading experience

- **CYB-M008, cybersecurity domain schema:** Add domain, path, course, module, unit, lab, project, assessment, and credential definitions without assigning a programming runtime.
- **CYB-M009, stable identifiers:** Define permanent IDs and migration rules before publishing progress-bearing content.
- **CYB-M010, static content compiler:** Compile inert authored content and reject scripts, duplicate IDs, missing terms, broken routes, missing sources, and missing safety data.
- **CYB-M011, course and path routes:** Add bookmarkable school, path, course, module, unit, lab, project, assessment, transcript, credential, and verification routes.
- **CYB-M012, breadcrumb system:** Keep school, path, course, module, and unit position visible without a large header.
- **CYB-M013, reading-first unit template:** Implement goals, new words, history, explanation, worked example, visual, exercise, lab, debrief, sources, and next action.
- **CYB-M014, long-course resume:** Save exact unit, section, exercise, and local lab checklist position for guest and signed-in learners.
- **CYB-M015, context summary and refresher panel:** Supply enough context to start an advanced course directly.
- **CYB-M016, visual system:** Implement timelines, data flows, topologies, evidence boards, configuration diffs, and accessible text alternatives.
- **CYB-M017, formative exercise library:** Add decision, ordering, classification, correlation, timeline, scope, redaction, risk, communication, and recovery exercises.

### Phase CYB-C: Cedar Lab foundation

- **CYB-M018, lab manifest:** Define system, network, data, cost, safety, preflight, snapshot, stop, cleanup, and verification fields.
- **CYB-M019, cross-platform lab preflight:** Provide Windows, WSL, macOS, and Linux checks with plain repair instructions.
- **CYB-M020, Cedar Lab network:** Build a host-only workstation, server, sensor, and intentionally misconfigured target design.
- **CYB-M021, signed lab artifacts:** Publish checksums, provenance, licenses, dependency inventory, and reproducible build instructions.
- **CYB-M022, snapshot and reset:** Supply named starting snapshots, local reset scripts, and cleanup verification.
- **CYB-M023, synthetic organization data:** Build reusable accounts, logs, files, traffic, support tickets, and business context containing no real people or secrets.
- **CYB-M024, safe activity simulators:** Create benign login, file, process, DNS, service, and policy-change generators with no public target support.
- **CYB-M025, lab observability:** Make the expected process, log, packet, file, and alert evidence available without exposing hidden grading answers.
- **CYB-M026, read-only lab alternatives:** Ensure every L2 through L4 lab has a static trace, capture, image, or configuration path.
- **CYB-M027, lab release gate:** Verify isolation, public-port absence, cleanup, artifact integrity, supported hosts, and fresh-machine instructions.

### Phase CYB-D: Foundations release

- **CYB-M028, orientation and history path:** Author CYB-00 with complete source review and original case notes.
- **CYB-M029, personal safety path:** Author CYB-01 with recovery-first exercises and no product sponsorship.
- **CYB-M030, security thinking path:** Author CYB-02 with threat modeling, risk, and evidence exercises.
- **CYB-M031, computer foundations path:** Author CYB-03 and the first Cedar Lab build.
- **CYB-M032, first beginner review:** Have true beginners complete the first 90 minutes without outside help. Record confusion rather than coaching around it.
- **CYB-M033, foundation completion records:** Issue honest completion records that make no independent skill claim.

### Phase CYB-E: Systems and infrastructure release

- **CYB-M034, Linux defense path:** Author CYB-04 and coordinate shared topics with the Linux School.
- **CYB-M035, network defense path:** Author CYB-05 and coordinate packet, routing, DNS, VPN, and BGP context with the Networking School.
- **CYB-M036, identity path:** Author CYB-06 with current digital-identity sources and recovery scenarios.
- **CYB-M037, endpoint path:** Author CYB-07 for Windows, macOS, Linux, and mobile devices.
- **CYB-M038, vulnerability path:** Author CYB-08 with CVSS v4, prioritization, remediation, and verification.
- **CYB-M039, architecture path:** Author CYB-09 with resilient design and decision records.
- **CYB-M040, systems skill pilots:** Pilot Linux Security Operator, Network Defense Technician, Identity and Access Technician, and Vulnerability Management Practitioner assessments.

### Phase CYB-F: Detection, response, and forensics release

- **CYB-M041, monitoring path:** Author CYB-10 with product-neutral log fixtures and tested detection exercises.
- **CYB-M042, intelligence path:** Author CYB-11 with source confidence, uncertainty, and defensive ATT&CK use.
- **CYB-M043, hunting path:** Author CYB-12 with bounded hypotheses and negative-result reporting.
- **CYB-M044, incident response path:** Author CYB-13 against current NIST guidance.
- **CYB-M045, forensics path:** Author CYB-14 with static synthetic images and reproducible examiner steps.
- **CYB-M046, integrated case dataset:** Publish one multi-source Cedar Junction case across endpoint, identity, network, application, and cloud records.
- **CYB-M047, operations skill pilots:** Pilot Security Monitoring Analyst, Incident Response Coordinator, and Digital Forensics Foundations assessments.

### Phase CYB-G: Secure systems release

- **CYB-M048, secure software path:** Author CYB-15 with safe toy repositories and repair-focused work.
- **CYB-M049, web and API path:** Author CYB-16 with local-only targets and current OWASP mapping.
- **CYB-M050, cloud and container path:** Author CYB-17 with local simulations first and verified cost cleanup for optional cloud work.
- **CYB-M051, cryptography path:** Author CYB-18 using supported libraries and tools, never original production cryptography.
- **CYB-M052, data and privacy path:** Author CYB-19 with minimization, telemetry, retention, and deletion exercises.
- **CYB-M053, resilience path:** Author CYB-20 with measurable restore and return-to-service labs.
- **CYB-M054, systems skill pilots:** Pilot Secure Software Reviewer, Cloud Security Operator, and Recovery and Resilience Operator assessments.

### Phase CYB-H: Programs and advanced validation

- **CYB-M055, governance path:** Author CYB-21 with CSF 2.0, CISA goals, CIS Controls, evidence, ownership, and decision-oriented metrics.
- **CYB-M056, advanced validation path:** Author CYB-22 with benign tests, read-only alternatives, explicit scope, and cleanup.
- **CYB-M057, special-environment modules:** Add OT, IoT, mobile, firmware, and AI-system security only with expert content review.
- **CYB-M058, professional certificate blueprint:** Publish assessed skills, evidence, identity limitations, reviewer rules, renewal, revocation, and appeals before issuing a broad certificate.
- **CYB-M059, reviewer calibration:** Use scored example submissions and disagreement review before live human assessment.
- **CYB-M060, professional certificate pilot:** Pilot with a small cohort and independent review. Do not issue a broad production certificate until evidence quality is acceptable.

### Phase CYB-I: Quality, access, and durable operation

- **CYB-M061, keyboard and screen-reader completion:** Complete all reading, exercise, lab-instruction, assessment, transcript, and credential flows without a pointer or audio.
- **CYB-M062, large-text and reflow gate:** Verify 200 percent zoom, narrow mobile, and no unnecessary two-direction scrolling.
- **CYB-M063, lab platform matrix:** Run every published lab on each claimed host route or narrow the claim.
- **CYB-M064, monthly artifact gate:** Scan and rebuild lab artifacts, remove unsupported dependencies, and publish changed checksums.
- **CYB-M065, content freshness dashboard:** Show owners, last review, next review, failing links, withdrawn references, and unsupported tool versions.
- **CYB-M066, assessment security:** Keep answer keys and rotating variants out of browser bundles while leaving all teaching open.
- **CYB-M067, credential integrity:** Verify server-owned issuance, privacy-default verification, revocation, expiry, versioning, and audit records.
- **CYB-M068, privacy and deletion drill:** Prove that progress, evidence, and public credential visibility can be exported, hidden, and deleted as promised.
- **CYB-M069, incident plan for the school:** Prepare for a compromised lab artifact, exposed answer bank, credential error, unsafe lesson, or malicious link.
- **CYB-M070, annual curriculum review:** Reconcile learner reports, framework changes, job-task mapping, lab safety, accessibility, and assessment validity.

## Release waves

The school should grow in complete, usable waves rather than appearing as a grid of empty course cards.

| Wave | Published scope | Minimum complete evidence |
| --- | --- | --- |
| 1. Safe beginning | CYB-00 through CYB-03 | Open direct routes, 25 or more exercises, first Cedar Lab build, beginner review |
| 2. Secure systems basics | CYB-04 through CYB-09 | Cross-platform labs, isolation proof, systems capstones, four skill pilots |
| 3. Observe and recover | CYB-10 through CYB-14 | Integrated synthetic case, evidence handling, incident and forensic reviews |
| 4. Design and build safely | CYB-15 through CYB-20 | Local-only application targets, cloud cleanup proof, restore evidence |
| 5. Lead and validate | CYB-21 and CYB-22 | Governance capstone, safe validation boundary, expert review |
| 6. Broad credentials | Integrated assessments | Published blueprint, calibrated reviewers, appeal and revocation flow |

A wave can contain many published courses. Once a course is published, it is open. Draft work stays in the authoring environment until it meets the safety and quality gate; it is not presented to learners as a locked course.

## Definition of done for one course

A cybersecurity course is complete only when:

- its purpose and outcomes are plain and measurable;
- all published units are readable without an account;
- recommended preparation is optional and offers all three entry choices;
- every new term is defined before use;
- historical claims have sources;
- current technical claims name affected versions and review dates;
- every visual has a text equivalent;
- every exercise has misconception-aware feedback;
- every active lab has authorization, isolation, preflight, snapshot, stop, cleanup, and verification steps;
- every active lab has a read-only alternative;
- no command or tool in this curriculum can accept a public or third-party target;
- no real credential, private data, or third-party system is needed;
- expected results and common failures are documented;
- desktop, mobile, keyboard, screen-reader, reduced-motion, high-contrast, and 200 percent zoom reviews are recorded;
- sources, licenses, and content ownership are recorded;
- a fresh learner can stop and resume without losing place;
- browser Back, Forward, refresh, direct link, and bookmark behavior work;
- the final capstone has a published rubric;
- completion wording and credential wording are honest;
- a second reviewer checks safety, clarity, and technical accuracy.

## Immediate first slice

The first implementation should establish the open-school foundation rather than rush to advanced attack material:

1. CYB-M001 through CYB-M017 for policy, schema, routes, reading, visuals, context summaries, and exercises.
2. CYB-M018 through CYB-M027 for Cedar Lab, isolation, synthetic data, and cleanup.
3. CYB-0001, CYB-0005, CYB-0101, CYB-0102, CYB-0103, CYB-0201, CYB-0203, CYB-0208, CYB-0301, and CYB-0306 as the first ten complete courses.
4. One complete case, The Quiet Login, across reading, exercise, static evidence, local lab, and debrief.
5. A complete guest journey that opens any course directly, chooses Start now, saves local progress, and never encounters a content lock.

That slice proves the cybersecurity teaching and safety model before the catalog expands. It reuses the shared M101 through M140 academy and lab contracts and contributes additional defensive patterns for later cross-school work. It is not a prerequisite for Linux, Networking, or Local Models.
