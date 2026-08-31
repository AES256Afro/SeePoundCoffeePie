# Reality Checks first-release course packet

Last reviewed: 2026-08-30

Status: authoring blueprint; not live and not publication-ready until the source records and reviews below are complete

Canonical roadmap: M118 and M367 through M382

## Purpose

Technology is often presented through compressed stories, confident marketing, short videos, folklore, or advice that omits the conditions that made it work. This course teaches learners how to slow a claim down and recover the real system underneath it.

It is not a collection of television trivia. It does not require familiarity with a particular film, show, game, company, or product. Each fictional scene is original and short enough to understand on the page.

The same reasoning works on:

- a dramatic programming scene;
- a Linux claim in a forum;
- a cybersecurity thriller;
- a networking shortcut used to explain an outage;
- a vendor statement;
- an AI demonstration;
- a confident coworker saying a task is `just one command`.

## Course outcome

The learner can:

1. separate a claim from the evidence offered for it;
2. identify what part of a fictional or marketing claim is plausible;
3. identify missing people, permissions, systems, time, failures, and recovery;
4. explain the underlying technical mechanism in plain language;
5. label observation, source statement, reconstruction, inference, and unknown;
6. propose a safe way to learn or verify the concept;
7. state a defensive or professional takeaway;
8. conclude `not enough information` when the evidence does not support certainty.

## Course shape and access

This first-release packet is one interdisciplinary course with 5 modules, 35 core comparison units, 5 module checks, and 1 final transfer self-check. It has one module for each domain: programming, Linux, defensive cybersecurity, networking, and AI or local models.

The 5 module checks and final transfer check are A0 self-checks. They provide immediate answer-specific feedback, allow another attempt, and make no credential or professional-competence claim.

This packet is not the complete optional Reality versus Fiction path. The [canonical specification](../REALITY_VS_FICTION_CURRICULUM.md) defines 5 courses, 20 modules, and 39 core comparison units. The authoring IDs in this packet must be mapped to, merged with, or replaced by canonical registry IDs before publication. The implementation must not publish duplicate versions of the same comparison or report the packet totals as the full-path totals.

The packet is not live course content. When a unit is published, its course outline, explanation, exercise, source note, and A0 self-check remain directly open to guests and signed-in learners. No earlier course, assessment, payment, streak, or credential unlocks it. Suggested preparation appears only as optional context beside `Start now`.

Before every comparison, a `Before we compare` block shows:

- one sentence stating what the learner will be able to explain;
- two to five plain-language definitions;
- the platform or system boundary in the example;
- what is prepared and what the learner will do;
- whether any installation, account, terminal, model, network contact, or local change is needed;
- `Start now`, `Review a refresher`, and `Read the short context` without an access gate.

Every required action defines its terms, purpose, context, input, expected result, and recovery. This behavior follows the [No assumed knowledge standard](../NO_ASSUMED_KNOWLEDGE_STANDARD.md). It is not a separate course, learner category, diagnosis field, or medicalized path.

## The comparison pattern

Every unit uses the same visible sections:

1. **The claim or scene:** The exact fictional statement or a short original scene.
2. **What is plausible:** The part that could happen under stated conditions.
3. **What is exaggerated or missing:** Hidden time, people, access, setup, tools, permissions, failures, tradeoffs, uncertainty, and recovery.
4. **The real underlying concept:** The accurate mechanism, with every new term defined before use.
5. **Safe exercise or observation:** One L0 reading or planning activity using prepared evidence.
6. **Defensive or professional takeaway:** What a careful learner, developer, operator, or defender should do next.
7. **Short knowledge check:** One question with immediate answer-specific feedback and another attempt.

Claim sources, reality sources, evidence labels, scope, limits, and review dates remain visible with the unit. They are publication records, not an eighth teaching section. The summaries below are authoring briefs. Each public unit must expand its brief into the complete seven-section pattern.

Cybersecurity cases never provide a real-target attack procedure. Core work uses prepared synthetic evidence and remains conceptual and defensive. Any optional L1 observation appears on a separate lab page, uses an isolated learner-owned environment, and has a browser-only prepared-evidence route. No activity uses real credentials, public scanning, exploitation, evasion, persistence, malware, or retaliation. Every risky case includes prevention, detection, containment, recovery, cleanup, and authorization.

## Module 1: Programming on screen and at work

### PRG-RF-01: The complete application in one night

The claim or scene:

> One developer types continuously for six hours and delivers a secure production application that has never been run or reviewed.

What is plausible:

- an experienced developer can build a small prototype quickly;
- existing libraries and templates can save time;
- a narrowly scoped internal tool may need little code;
- focused work can produce a useful demonstration.

What is exaggerated or missing:

- requirements and decisions about what the application should do;
- data and privacy boundaries;
- dependency and license review;
- local execution and debugging;
- automated tests and human checks;
- accessibility and browser review;
- deployment identity and secrets;
- monitoring, backups, rollback, and ownership;
- user feedback and maintenance.

The real underlying concept:

```text
need
 -> written requirements
 -> small design
 -> first working slice
 -> run and observe
 -> tests and review
 -> deployment plan
 -> controlled release
 -> monitoring and repair
```

The first working slice may be fast. The complete dependable system includes work around the code.

Safe exercise or observation:

Give the learner a 20-line fictional web form and ask them to list what is needed before collecting real customer information. No code execution is required.

Defensive or professional takeaway:

Ask `What result is actually ready?` A prototype, tested build, staging release, and production service are separate claims.

Short knowledge check:

A demo works on the developer's laptop. Which statement is supported?

- The demo ran in one environment.
- It is not yet evidence of security, accessibility, scaling, or production recovery.

### PRG-RF-02: Green code on the screen means it worked

Teach syntax highlighting versus parsing, compilation, execution, input, output, and tests. Colored text is a display feature, not execution evidence.

Safe exercise: compare an editor screenshot, compiler result, test result, and running-program output. Label what each proves and does not prove.

### PRG-RF-03: The compiler error identifies the complete repair

Teach that a tool reports where it noticed a problem, which may differ from where the mistake began. Define line, column, token, parser, compiler, diagnostic, warning, and error before the exercise.

Safe exercise: read a prepared missing-semicolon diagnostic and inspect the current and previous lines.

### PRG-RF-04: Fast typing means strong programming

Compare typing speed with problem definition, reading, decomposition, naming, testing, debugging, reviewing, explaining, and maintaining. The learner evaluates two prepared work logs rather than taking a speed test.

### PRG-RF-05: One language is best for every job

Compare runtime, ecosystem, team knowledge, deployment, safety model, performance, libraries, platform support, maintenance, and existing systems. A language can be a strong choice without being a universal winner.

### PRG-RF-06: Generated code is finished code

Teach specification gaps, invented APIs, security boundaries, dependency freshness, tests, licenses, generated-code review, and human ownership. The learner reviews a short harmless generated function with a visible requirement and tests it on paper.

Module check: analyze a new fictional coding montage and build the missing production timeline.

## Module 2: Linux myths and real systems

### LNX-RF-01: Linux is a black terminal screen

The claim or scene:

> Linux is a text-only operating system used only by expert hackers and server administrators.

What is plausible:

- Linux servers are often administered through a shell;
- command-line tools are useful for automation and remote systems;
- some Linux installations intentionally have no graphical desktop.

What is exaggerated or missing:

- Linux distributions can include complete graphical desktops;
- desktop environments and applications are separate choices from the kernel;
- Linux appears in phones, appliances, embedded devices, cloud systems, game hardware, and scientific systems;
- a terminal is one interface, not the operating system itself.

The real underlying concept:

```text
hardware
  -> Linux kernel
  -> system services and libraries
  -> graphical desktop, command line, applications, or a mixture
```

Safe exercise or observation:

Sort prepared screenshots and component descriptions into kernel, distribution, desktop environment, shell, terminal application, service, and ordinary application.

Defensive or professional takeaway:

Name the layer. `Linux problem` is usually too broad to guide a repair.

### LNX-RF-02: One copied command repairs every Linux machine

Teach distribution, release, package manager, shell, user, privilege, current directory, service manager, configuration, and hardware differences. Reconstruct `just run this` into inspect, scope, backup, change, verify, and rollback.

### LNX-RF-03: Linux cannot get malware

Teach vulnerabilities, malicious packages, stolen credentials, unsafe scripts, exposed services, supply chains, browser risks, permissions, patching, monitoring, backups, and recovery. Linux changes some controls and attack paths; it does not remove risk.

### LNX-RF-04: Gaming on Linux never works

Teach native games, compatibility layers, Proton, Wine, graphics drivers, anti-cheat, launchers, controllers, codecs, game-specific research, save backups, and rollback. Avoid both `nothing works` and `everything works`.

### LNX-RF-05: Free software has no cost

Separate license price from hardware, migration, compatibility, training, support, operations, downtime, governance, and maintenance. The learner builds a total-cost table for a fictional five-computer office.

### LNX-RF-06: Companies are all moving away from Windows

Teach workload-specific adoption, mixed estates, servers, cloud, containers, desktops, applications, identity, support, staffing, compliance, contracts, and migration risk. Require current evidence and forbid universal trend claims from one survey or anecdote.

### LNX-RF-07: Root can fix anything safely

Teach root privilege, capability, ownership, system boundaries, irreversible changes, auditability, service identities, least privilege, and why permission to change something does not prove the change is correct.

Short knowledge check:

Does opening a terminal prove that Linux has no graphical desktop? Expected idea: no; a terminal is one interface, while a Linux system may also provide a graphical desktop and ordinary applications.

Module check: evaluate a fictional migration recommendation and separate verified fit, assumption, blocker, pilot, cost, and rollback.

## Module 3: Cybersecurity fiction and defensive reality

### CYB-RF-01: The instant intrusion

The claim or scene:

> An investigator types three commands, enters an unknown company's network, finds the correct server, becomes administrator, copies the needed file, and leaves without detection in 45 seconds.

What is plausible:

- exposed services and serious vulnerabilities can create rapid compromise;
- stolen credentials or an existing foothold can skip earlier steps;
- automation can make a known action fast;
- poor segmentation can increase impact.

What is exaggerated or missing:

- authorization and legal scope;
- target discovery and validation;
- version and exposure evidence;
- identity and authentication conditions;
- network path and filtering;
- privileges;
- endpoint and service behavior;
- monitoring and alerts;
- data location and access controls;
- mistakes, false leads, and failed attempts;
- evidence left behind;
- containment, recovery, and affected people.

The real underlying concept:

A compromise is a chain of conditions, access, actions, observations, and consequences. A short scene may begin after earlier access or discovery, but the omitted evidence still matters. A defender can reduce the chance and effect of compromise without knowing who caused it.

Safe exercise or observation:

```text
written authorization
 -> known isolated target
 -> baseline evidence
 -> synthetic event
 -> logs and detection
 -> bounded containment
 -> recovery
 -> explanation and cleanup
```

The learner orders this prepared defensive timeline and identifies where authorization, observation, containment, recovery, and cleanup occur. The course does not recreate intrusion steps against a real target.

Defensive or professional takeaway:

Defenders reduce the chance that one failure becomes complete control. Inventory, patching, identity, least privilege, segmentation, logs, backups, detection, and practiced recovery work together.

Short knowledge check:

Does a rapid compromise scene prove that no earlier access or preparation existed? Expected idea: no; the scene alone does not establish the starting conditions, permissions, or earlier activity.

### CYB-RF-02: The IP address proves who did it

Teach address assignment, shared addresses, NAT, VPNs, proxies, compromised devices, cloud services, timestamps, log quality, account evidence, alternate explanations, and confidence. An address is one clue, not a person.

### CYB-RF-03: Every password can be cracked instantly

Teach online versus offline guessing, rate limits, lockouts, password storage, hashing, salts, credential reuse, phishing, password managers, multi-factor authentication, hardware, time, and uncertainty. Do not include real credential targets or cracking instructions.

### CYB-RF-04: Encryption is broken by typing faster

Teach algorithm, key, implementation, endpoint, random number generation, configuration, protocol, certificate, credential, and operational failures. Many practical incidents bypass or misuse encryption rather than defeating sound mathematics directly.

### CYB-RF-05: Deleting one log removes every trace

Teach endpoints, applications, identity systems, network devices, cloud control planes, backups, clocks, central collection, retention, missing logs, tampering alerts, and evidence limits. More logs are not automatically complete or trustworthy.

### CYB-RF-06: One laptop takes over critical infrastructure

Teach zones, control systems, safety systems, engineering workstations, remote access, suppliers, physical process, interlocks, human operation, long lifecycles, and safety consequences at a conceptual level. Avoid operational instructions.

### CYB-RF-07: The defender knows the attacker immediately

Teach hypothesis, triage, confidence, attribution limits, threat intelligence, confirmation bias, containment decisions, communication, and why response can proceed before attribution is complete.

Module check: analyze a prepared fictional incident board and label facts, interpretations, unknowns, defensive priorities, and prohibited conclusions.

## Module 4: Network shortcuts and packet reality

### NET-RF-01: Full Wi-Fi bars mean the Internet works

The claim or scene:

> The device shows a strong Wi-Fi signal, so every Internet service must be reachable.

What is plausible:

- strong signal can improve the radio link between the device and access point;
- a working local link is one required part of many Internet connections.

What is exaggerated or missing:

- joining the intended network and receiving valid network settings;
- a working route beyond the access point;
- name resolution when a name is used;
- reachable upstream networks;
- the destination service, its port, and its own dependencies;
- authentication, filtering, and service health.

The real underlying concept:

```text
device
 -> local radio link
 -> local network configuration
 -> gateway and routing
 -> name resolution, when needed
 -> destination network
 -> destination service
```

Safe exercise or observation:

Give the learner a prepared status sheet in which Wi-Fi is connected, the local gateway responds, name resolution fails, and a service can still be reached by a prepared address. Ask which layer each observation supports. The activity sends no traffic.

Defensive or professional takeaway:

Test one layer at a time. A signal indicator reports the local radio link, not the full service path.

Short knowledge check:

A device has full Wi-Fi bars but name resolution fails. Do the bars prove that a named website must load? Expected idea: no; the bars describe the local radio link, while name resolution and other service layers can still fail.

### NET-RF-02: An IP address identifies one person

Teach address assignment, DHCP, shared devices, NAT, carrier-grade NAT, VPNs, proxies, cloud systems, compromised hosts, timestamps, account records, and log quality. An address observed at a time is evidence about a network endpoint or intermediary, not automatic proof of a person.

### NET-RF-03: A VPN makes a user anonymous and safe

Teach the tunnel's endpoints, what the local network can see, what the VPN operator can see, identity still supplied to sites, cookies and browser state, malware, account activity, DNS behavior, logging, policy, and trust transfer. A VPN changes parts of the path; it does not remove every identifier or risk.

### NET-RF-04: Incognito mode hides activity from the network

Teach the difference between local browser history and network visibility. Private browsing can reduce data retained in that browser session while Internet providers, organization networks, destination services, accounts, extensions, downloads, and device monitoring may still observe or retain activity.

### NET-RF-05: Bandwidth is the same thing as speed

Define bandwidth, throughput, latency, jitter, packet loss, server response time, and application work before comparison. Use prepared measurements to show that a high-capacity link can still feel slow when latency, loss, congestion, or the service dominates the wait.

### NET-RF-06: A successful ping proves the service works

Teach that a prepared ping result can support IP reachability and round-trip observations for one protocol while DNS, transport ports, TLS, authentication, application dependencies, or the application itself can still fail. The learner orders checks for a fictional web service without probing a public target.

### NET-RF-07: NAT is a firewall

Teach address translation and traffic filtering as separate jobs. Translation can affect unsolicited inbound paths, but rules, state, forwarding, exposed services, IPv6 behavior, host controls, and configuration determine the protection. The exercise compares prepared translation and firewall tables rather than changing a network.

### NET-RF-08: BGP chooses the shortest physical route

Define autonomous system, route announcement, policy, local preference, path attributes, peering, transit, and physical distance. BGP selects a permitted route using policy and attributes; the chosen path is not guaranteed to be the geographically shortest or lowest-latency path.

Module check: explain a fictional service outage by separating local link, addressing, naming, routing, transport, security, and application evidence. Full credit is available for `not enough information` when the prepared observations do not locate the fault.

## Module 5: AI and model claims

### AI-RF-01: The model knows and remembers everything

Separate learned weights, current context, saved conversation history, external retrieval, tools, application storage, and provider features. The learner labels a system diagram instead of debating human consciousness.

### AI-RF-02: Local means private and cloud means public

Teach local telemetry, malware, file permissions, exposed ports, logs, backups, and package sources alongside hosted identity, contract, retention, region, monitoring, encryption, and deletion. Require the exact product and configuration.

### AI-RF-03: The model contains a searchable copy of the Internet

Teach learned numerical patterns, retrieval, search indexes, databases, memorization risk, stale information, citations, and why fluent recall is not a dependable record lookup.

### AI-RF-04: A quant is a smaller personality

Teach precision, quantization recipe, mixed tensor types, file conversion, compatibility, possible quality change, and the difference between changing stored representation and training new behavior.

### AI-RF-05: Bigger models are always better

Teach task fit, data, architecture, specialization, latency, memory, cost, privacy, evaluation, reliability, maintenance, and ordinary alternatives. The learner compares task results, not parameter counts alone.

### AI-RF-06: Uploading documents trains the model

Separate file storage, search indexing, embeddings, retrieval, context injection, prompt caching, fine-tuning, and pretraining. Require the actual product documentation before claiming that weights changed.

### AI-RF-07: A corporate AI account has one universal data policy

Teach product tier, contract, administrator settings, stateful features, retention, training use, regional processing, monitoring, subprocessors, support access, connected sources, and effective date. A statement about one provider product cannot be copied to another.

Module check: evaluate a fictional model advertisement using the same claim, evidence, missing context, safe test, and decision pattern.

## Final transfer self-check

This is an open A0 self-check, not a credential assessment. The learner receives five new claims, one from each domain. For each claim, they complete:

```text
Claim:
Direct observation or supplied evidence:
Source statement:
Assumption or inference:
Unknown or missing evidence:
What might be plausible:
What is exaggerated or unsupported:
Underlying mechanism:
Risk or consequence:
Safe verification:
Defensive or professional takeaway:
Confidence and reason:
Source scope, version, and review date:
```

The self-check gives immediate answer-specific feedback and another attempt. A supported response can conclude that the claim is accurate, partly accurate, misleading, false, or not currently decidable. The rubric checks separation of evidence from assumption, not agreement with a predetermined dramatic verdict. The completion record says only that practice occurred. It does not claim professional competence or issue a credential.

## Publication requirements

- This packet does not yet contain completed unit-level source records. It cannot be published until each record is populated and reviewed.
- Each claim is original or a general trope. Do not copy dialogue, plot, visual composition, names, costumes, or branding from an existing work.
- A primary source supports current technical behavior where possible.
- Product, tool, version, jurisdiction, and date scope remain visible.
- Security content stays conceptual, defensive, synthetic, and authorized.
- Every risky case includes prevention, detection, containment, recovery, and cleanup.
- No required instruction is hidden inside the fictional framing.
- Every new term is defined before use.
- A plain text order conveys everything shown visually.
- A learner can stop after any case and resume with the claim and current section visible.
- The final review includes a programming educator, Linux practitioner, defensive-security reviewer, networking practitioner, model-systems reviewer, accessibility reviewer, and a beginner who is not coached around missing context.

Each comparison has a source record with these required fields:

| Field | Required content |
| --- | --- |
| `comparisonId` | Stable canonical ID |
| `claimType` | Fictional scene, advertisement, vendor claim, common myth, or another plain category |
| `claimSources` | Original-scene record or the minimum precise source needed for a named public claim |
| `claimDate` | Release or publication date when known |
| `claimObservedAt` | Date the author opened or observed the claim source |
| `realitySources` | Direct references supporting the mechanism and its limits |
| `sourceVersions` | Standard, software, document, model, or edition versions where relevant |
| `platformScope` | Exact environment such as browser-only, Windows, WSL, macOS, or Linux |
| `evidenceLabel` | `documented`, `supported-inference`, `illustrative`, `disputed`, or `outdated` |
| `lastVerifiedAt` | Date a named human reviewer opened the sources and checked the explanation |
| `reviewDueAt` | Next required review date |
| `verificationNotes` | Conditions, uncertainty, conflicts, and unverified claims |
| `rightsNotes` | Paraphrase, licensed media, public-domain material, or another reviewed basis |

`lastVerifiedAt` is not a build date. A named reviewer must open the cited material, check that each source supports the attached statement, and record any conflict or limit.

Freshness rules:

- Review version-sensitive software, model, compatibility, platform, and product claims at least every 180 days.
- Review active security guidance, advisories, tool-specific defensive behavior, benchmark claims, and hardware-fit claims at least every 90 days. Benchmark and fit records include exact test conditions.
- Review standards and historical claims when the cited edition changes or during the annual curriculum review.
- Keep an overdue comparison directly readable with a visible `Review overdue` label, but remove active safety instructions until they are rechecked.
- Keep an unsafe, unsupported, or withdrawn comparison at its canonical route as a dated withdrawal record with safe context and a link to corrected study. Never replace it with a locked or hidden card.
