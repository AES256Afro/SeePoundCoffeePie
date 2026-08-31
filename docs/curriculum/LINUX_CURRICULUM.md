# Linux Curriculum Blueprint

Status: proposed curriculum architecture
Audience: absolute beginners through working systems administrators
Learning mode: reading, authored exercises, and learner-run local labs
Access rule: every course, module, unit, lab guide, and assessment outline remains visible and open

## Purpose

This curriculum gives a learner enough context to understand Linux, enough practice to use it without fear, and enough depth to administer real systems responsibly.

It does not begin with a wall of commands. It begins with the questions a new learner is already asking:

- What is Linux?
- Is Linux an operating system, a kernel, or both?
- Why do people use it?
- Why does a server not look like a Windows desktop?
- What is a distribution?
- Why are there so many distributions?
- Where did drive letters go?
- What do `/bin`, `/etc`, `/home`, `/usr`, and `/var` mean?
- Can I try it without erasing Windows or changing my Mac?
- Can I play games on it?
- Can I use it as a desktop, server, router, development machine, or model-training machine?
- How do I recover when I make a mistake?

The curriculum then moves from orientation to real operating-system work:

- desktop use;
- shell and file work;
- the filesystem hierarchy;
- users, groups, permissions, and security;
- packages, processes, services, and logs;
- storage, boot, recovery, and backups;
- networking on a Linux host;
- gaming and compatibility;
- Windows-to-Linux migration;
- server setup and operation;
- automation, containers, and virtual machines;
- troubleshooting, performance, and observability;
- kernel, platform, and enterprise concepts.

The result is not a collection of command recipes. Learners should be able to explain what a command changes, why the system was designed that way, how to verify the result, and how to undo or recover from the change.

## Product boundary

SeePoundCoffeePie teaches and records progress. It does not silently operate the learner's computer.

The site may:

- present lessons, diagrams, worked examples, exercises, and lab instructions;
- provide versioned, checksummed lab packages;
- score authored knowledge checks;
- record completion, assessment results, and credential records;
- validate a small, disclosed evidence manifest when a credential requires it.

The site must not:

- invoke a shell on the learner's machine;
- install or remove software;
- create a virtual machine;
- enable WSL;
- change firmware, partitions, boot order, firewall rules, or user accounts;
- read files from the learner's computer;
- scan the learner's network;
- receive shell history, private logs, passwords, keys, or unredacted configuration;
- upload a disk image or virtual machine;
- claim a local lab succeeded unless the evidence level supports that claim.

All host-changing actions occur only after the learner reviews and deliberately runs local instructions.

## Open access and recommended preparation

All courses are visible and unlocked from the first visit. A learner may always select **Start now**.

Prerequisites are guidance, never gates. A course outline may say:

> Recommended preparation: You will have an easier time if you already understand paths, users, and basic shell commands. You can still start now.

Every recommendation must include exact bridge links rather than a vague warning. Example:

- Revisit `Linux Basics > Paths and working directories`.
- Revisit `Accounts and Access > User, group, and other`.
- Revisit `Networking Foundations > IP addresses and ports`.
- Open the five-minute concept page `What sudo actually does`.
- Try the optional bridge lab `Read a service log without changing the service`.

Course pages show three actions:

1. **Start now**
2. **Review recommended preparation**
3. **Try a short bridge path**

Nothing is described as locked, forbidden, or unavailable because an earlier course is incomplete.

## Learner promise

The Linux school assumes no prior command-line, server, networking, security, or virtualization experience.

Every first use of a term must provide:

1. a plain definition;
2. why it exists;
3. one concrete example;
4. one Windows or macOS comparison when it helps;
5. a common misunderstanding;
6. a safe way to observe it;
7. a short retrieval question later.

The curriculum never treats fear as incompetence. A learner who is afraid of deleting the wrong file is noticing a real risk. The lesson must teach scope, verification, backup, rollback, and least privilege before teaching speed.

## Original guide character

### Rin Calder, systems caretaker

Rin Calder is an original guide written for SeePoundCoffeePie. Rin is a former night-shift systems caretaker who now helps small libraries, community studios, and local organizations keep their technology understandable and repairable.

Rin's manner is:

- observant;
- calm under pressure;
- skeptical of unexplained claims;
- protective of user data;
- patient with beginners;
- dryly funny without mocking the learner;
- willing to stop, document, and ask for authorization.

Rin does not resemble, quote, reference, or continue any copyrighted television character. Rin has no vigilante identity, no borrowed plot, no borrowed visual design, and no romanticized criminal behavior.

Visual direction:

- an ordinary work jacket rather than a signature costume;
- a small repair notebook, label maker, and flashlight;
- warm gray, paper, terminal green, and amber accents;
- no mask, hooded silhouette, glitch face, or television-show iconography;
- scenes centered on maintenance, investigation, recovery, and public service.

Rin appears in short, optional field notes:

> **Rin's field note:** A command that needs administrator access deserves a pause. First read it. Then name the files, service, account, or device it can change. Only then decide whether to run it.

Rin never supplies a magic answer. The character asks the learner to observe evidence and narrows the next step.

## Tone and learning rhythm

### Course rhythm

Long courses are broken into sessions that feel finishable:

1. **Orient:** What are we learning and why does it matter?
2. **History break:** What problem led to this design?
3. **Unpack:** Explain the parts and vocabulary.
4. **Observe:** Read output before changing anything.
5. **Practice:** Make one bounded change in a disposable environment.
6. **Verify:** Prove the result using a second source of evidence.
7. **Recover:** Undo, restore, or repair the change.
8. **Retrieve:** Answer a short question without copying the previous example.
9. **Rest:** Mark a natural stopping point and show the next action.

Recommended timing:

- 5 to 12 minutes per reading unit;
- 20 to 35 minutes per guided exercise;
- 35 to 60 minutes per lab session;
- a visible break after about 40 minutes of concentrated work;
- longer labs divided into snapshot checkpoints;
- a history or design interlude after a dense technical block;
- a recap at the start of the next session.

Breaks are not rewards that can be lost. They are part of sound learning and safe system work.

### No marketing language

Lesson copy should state what the learner will understand or do. Avoid claims such as:

- master Linux instantly;
- become unstoppable;
- industry-leading;
- revolutionize your workflow;
- enterprise-grade without defining what was tested;
- Linux is always more secure;
- every company is moving to Linux;
- Linux is free, therefore migration is free.

The curriculum teaches tradeoffs and evidence.

## Platform access lanes

A learner must be able to begin without replacing their operating system.

| Lane | Learner environment | Best for | Important limits |
|---|---|---|---|
| A: Read and reason | Any browser-capable device | History, concepts, diagrams, command reading, prepared traces, migration planning | No live Linux behavior |
| B: Windows with WSL | Supported Windows system with WSL | Shell, packages, files, development tools, many services | Boot, kernel modules, hardware, disk layout, and some network behavior differ from a conventional Linux machine |
| C: Disposable virtual machine | Windows, macOS, or Linux host | Recommended default for administration, storage, services, recovery, and security labs | Needs enough memory and disk; hardware acceleration support varies |
| D: Mac terminal plus Linux virtual machine | macOS | Unix concepts in Terminal, with Linux behavior taught inside a VM | macOS is Unix-like but is not Linux; package, service, filesystem, and kernel behavior differs |
| E: Native Linux installation | Compatible spare computer or deliberate migration | Desktop use, hardware, gaming, performance, and daily operation | Highest host impact; only after backup, compatibility, and recovery planning |
| F: Remote or cloud Linux | Deliberately provisioned learner account | Server administration and remote operations | Can create cost and public exposure; not the beginner default |

These learner-facing lanes map to the canonical [Lab, assessment, and credential standard](LAB_ASSESSMENT_CREDENTIAL_STANDARD.md):

| Linux curriculum lane | Shared manifest lane |
| --- | --- |
| A: Read and reason | `reading-only` |
| B: Windows with WSL | `windows-wsl` |
| C: Disposable VM on Windows | `windows-vm` |
| C: Disposable VM on macOS | `macos-linux-vm` |
| C: Disposable VM on Linux | `linux-vm` |
| D: Mac terminal plus Linux VM | `macos-native` and `macos-linux-vm` as declared by the activity |
| E: Native Linux installation | `linux-native` |
| F: Remote or cloud Linux | `learner-remote-server` or `learner-selected-external-compute` |

Every practical item also declares the shared L0 through L4 risk class. The shared standard wins if a local presentation rule conflicts with it.

Microsoft describes WSL as a way to use Linux distributions and command-line tools directly on Windows without a traditional virtual-machine or dual-boot setup. The course must also teach where WSL differs from a normal Linux installation rather than pretending the environments are identical. See [Install WSL](https://learn.microsoft.com/en-us/windows/wsl/install) and [Use systemd in WSL](https://learn.microsoft.com/en-us/windows/wsl/systemd).

### Default route

The recommended beginner route is:

1. complete reading-only orientation;
2. inventory the host without changing it;
3. choose WSL for low-friction shell work or a virtual machine for full operating-system labs;
4. create a disposable Linux environment;
5. take a snapshot;
6. complete the first guided lab;
7. deliberately break one harmless setting;
8. restore the snapshot;
9. decide whether native Linux is useful for the learner's goals.

No lesson presents dual boot or disk replacement as the first experiment.

## Lab safety contract

### Default isolation

All beginner and intermediate administration labs use one of these boundaries:

- a disposable virtual machine using NAT networking;
- WSL when the lab is explicitly compatible with WSL;
- a purpose-built container when the lesson concerns container user space;
- a private lab subnet containing only learner-owned virtual machines.

### Required lab labels

Every lab declares:

- supported host operating systems;
- supported Linux distributions and versions;
- whether WSL is supported;
- whether a virtual machine is required;
- CPU, memory, and free-disk guidance;
- estimated download size;
- estimated time;
- required network access;
- privileges required;
- files, accounts, services, interfaces, packages, and ports changed;
- whether a reboot is expected;
- checkpoint and rollback instructions;
- cleanup instructions;
- evidence retained;
- evidence never uploaded;
- last technical review date.

### Destructive-operation rules

Storage, boot, account, firewall, and recovery labs must:

- use a disposable virtual disk or disposable virtual machine;
- name the exact target before every destructive step;
- show a read-only inspection step first;
- require the learner to compare an identifier, size, and mount state;
- explain expected output and stop conditions;
- avoid unresolved shell variables and broad wildcards in destructive examples;
- never target the learner's host disk;
- never use a learner's home directory as a recursive deletion target;
- provide snapshot restore or rebuild instructions;
- include a deliberate abort exercise.

### Network and security rules

Network and security labs must:

- operate only on learner-owned virtual machines and an isolated lab network;
- use documentation-only examples for public addresses;
- prohibit scanning, credential testing, exploitation, interception, or disruption outside the lab;
- keep intentionally vulnerable targets inaccessible from the public internet;
- use NAT or host-only networking by default;
- explain authorization before introducing a security tool;
- collect no third-party traffic;
- include a cleanup and service-stop step;
- separate defensive administration from offensive security training.

### Command presentation

Commands are never shown without context. Each command block identifies:

- **Run as:** ordinary user or administrator;
- **Where:** host, WSL distribution, VM, container, or remote server;
- **Reads:** what the command observes;
- **Changes:** what the command can modify;
- **Expected result:** the important output or state;
- **Stop if:** an unsafe or unexpected condition appears;
- **Undo:** the rollback or restore action.

Do not teach `curl ... | sh`, unverified installation scripts, disabled signature checks, or copied commands with hidden placeholders.

## Visual system

The Linux school should feel spacious, readable, and technical without looking like a generic dark hacker screen.

### Primary visual forms

1. **Filesystem atlas**
   - An interactive but keyboard-accessible tree rooted at `/`.
   - Colors describe meaning, not decoration.
   - Static system content, variable state, configuration, runtime state, virtual kernel views, user data, and mount points each receive one consistent color.
   - Selecting a directory reveals purpose, history, common contents, permissions, Windows comparison, and a service example.

2. **Service anatomy map**
   - Program file in `/usr/bin` or `/usr/sbin`.
   - Configuration in `/etc`.
   - persistent state in `/var/lib`.
   - logs in `/var/log` or the journal.
   - runtime state in `/run`.
   - optional content in `/srv`.
   - user-specific configuration under the user's home directory.

3. **Boot timeline**
   - firmware;
   - boot manager or loader;
   - kernel and initramfs;
   - initial process;
   - services;
   - login;
   - desktop session or server prompt.

4. **Permission lens**
   - owner, group, and other;
   - read, write, and execute;
   - directory permissions shown separately from file permissions;
   - symbolic and numeric forms linked visually;
   - effective access traced through one real example.

5. **Storage stack**
   - physical or virtual device;
   - partition table;
   - partition;
   - optional encryption;
   - optional volume management;
   - filesystem;
   - mount point;
   - files and directories.

6. **Windows and Linux path comparison**
   - drive letters compared with one rooted tree;
   - `Program Files` compared with package-managed executable and library locations;
   - `AppData` compared with home-directory configuration, state, cache, and data conventions;
   - Registry concepts compared carefully with distributed text and binary configuration stores;
   - Windows services compared with system service managers;
   - devices compared with Linux device nodes and virtual filesystems.

7. **Evidence panel**
   - observation;
   - interpretation;
   - safe next check;
   - change;
   - verification;
   - rollback.

### Accessibility

Every visual must have:

- a complete text equivalent;
- labels that do not rely on color;
- meaningful keyboard order;
- visible focus;
- at least 200 percent zoom support;
- reduced-motion behavior;
- no flashing, glitch effect, or rapidly moving terminal text;
- readable diagrams on a narrow screen;
- downloadable plain-text or printable versions.

## Linux history and adoption framing

The history should connect technical decisions to the problems people faced, not turn into trivia.

Required threads:

- time-sharing and the Unix design tradition;
- small composable tools and text streams;
- the C language and portability;
- Unix fragmentation and standardization;
- the GNU Project and the free-software movement;
- the Linux kernel beginning in 1991;
- distributions, package repositories, and community governance;
- the web-server era;
- virtualization, cloud computing, containers, Android, embedded systems, and high-performance computing;
- modern desktop and gaming developments;
- current debates about packaging, immutable systems, init systems, licensing, and vendor control.

Use the [GNU system history](https://www.gnu.org/gnu/gnu-history.en.html), [Linux kernel documentation](https://docs.kernel.org/), distribution histories, standards, and original project records as primary sources. Explain the distinction between the Linux kernel and a complete Linux-based operating system without turning terminology into a loyalty test.

### Why organizations choose Linux

Do not begin from the claim that every company is moving from Windows to Linux. Many organizations run mixed estates. The learner should evaluate workloads.

Teach these possible drivers:

- availability across servers, clouds, appliances, development systems, and embedded hardware;
- automation-friendly interfaces and configuration;
- containers and common cloud tooling;
- the ability to inspect, modify, package, and redistribute source under each component's license;
- broad vendor and community ecosystems;
- hardware and deployment flexibility;
- long support windows offered by some distributions and vendors;
- reduced operating-system license cost in some situations;
- avoiding dependence on one desktop or server vendor;
- strong remote-administration and scripting traditions;
- a large body of existing server and infrastructure knowledge.

Teach these costs and reasons not to migrate:

- applications or peripherals with no supported Linux path;
- user retraining and support load;
- migration, integration, testing, and downtime costs;
- endpoint-management and identity changes;
- specialized Windows applications, macros, add-ins, or workflows;
- game anti-cheat and media-protection compatibility;
- firmware and hardware support gaps;
- accountability and support-contract requirements;
- distribution lifecycle and package-version choices;
- fragmented guidance and inconsistent third-party packages;
- the need for in-house Linux skill.

Every adoption case study ends with a decision matrix, a pilot plan, a rollback plan, and evidence that would justify either staying or moving. Vendor claims are labeled as vendor claims. Market-share numbers receive a source date, workload definition, and uncertainty note.

## Distribution and community map

The distribution course teaches selection, not team loyalty.

| Distribution or family | Governance and release idea | Often useful for | Beginner guidance |
|---|---|---|---|
| Ubuntu LTS and recognized flavors | Canonical-backed Ubuntu base with long-support releases; flavors provide community-maintained desktop choices | Broad hardware guidance, desktop, development, WSL, servers, and cloud images | Good first lab baseline when the exact supported release is stated |
| Linux Mint | Community desktop distribution based on Ubuntu or Debian, depending on edition | Familiar desktop migration and everyday use | Useful Windows-migration candidate after hardware and application checks |
| Debian Stable | Community-governed, conservative stable releases with broad package and architecture support | Servers, stable workstations, appliances, cloud images, and a base for other distributions | Good for learning stability and package policy; some desktop hardware may need extra attention |
| Fedora Workstation and Fedora KDE | Community distribution sponsored by Red Hat, with relatively current software and several purpose-built editions | Development, current desktop technology, containers, and learners interested in the Red Hat family | Good when the learner accepts a faster release rhythm |
| Red Hat Enterprise Linux family | Commercial enterprise distribution and compatible community rebuild ecosystems | Supported enterprise systems, regulated operations, and Red Hat-oriented administration skills | Teach support lifecycle, subscription, repositories, and compatible rebuild distinctions carefully |
| openSUSE Leap and Tumbleweed | Community distribution with stable-release and rolling-release choices | Desktop, development, administration, snapshots, and learners comparing release models | Good comparison for stable versus rolling approaches |
| Arch Linux | Community rolling release with a minimal, assemble-it-yourself design | Experienced learners who want current packages and direct configuration | Not the default first installation; excellent advanced learning environment after foundations |
| SteamOS | Valve's gaming-focused Linux system used on Steam Deck, with an appliance-like update model | Steam Deck gaming and a console-style Linux experience | Teach system mutability and desktop-mode boundaries before customization |
| Kali Linux | Debian-based specialist system for authorized security assessment | Isolated, authorized security labs | Not a beginner desktop or general-purpose Linux recommendation; Kali's own documentation says this directly |
| Tails and other privacy-focused live systems | Specialist designs that minimize persistence and focus on a specific threat model | Privacy education and constrained travel or investigation scenarios | Teach the threat model and limitations before tools |
| Immutable and image-based desktops | Base system delivered as versioned images, with applications and development environments separated | Rollback, consistent fleets, kiosk-like systems, and container-oriented development | Teach the different update and customization model before recommending it |

Selection exercises compare:

- community governance and corporate sponsorship;
- stable, fixed, rolling, and image-based release models;
- package freshness and support duration;
- desktop environment and distribution;
- package manager and repository policy;
- proprietary driver and codec handling;
- documentation and support options;
- hardware architecture;
- server, desktop, gaming, security, and embedded goals.

Use each project's current official documentation when authoring a recommendation. Useful starting points include [Debian's reasons to use Debian](https://www.debian.org/intro/why_debian), [Fedora Editions](https://www.fedoraproject.org/wiki/Editions), [Ubuntu documentation](https://docs.ubuntu.com/), [Arch Linux About](https://archlinux.org/about/), and [Kali's own selection warning](https://www.kali.org/docs/introduction/should-i-use-kali-linux/).

## Filesystem hierarchy deep dive

The filesystem course receives more space than a command cheat sheet because it explains where administrators look when something is running, configured, failing, or filling a disk.

The [Filesystem Hierarchy Standard](https://refspecs.linuxfoundation.org/FHS_3.0/fhs/index.html) is a historical and interoperability reference, not a promise that every distribution implements every directory exactly the same way. Modern systems may merge `/bin`, `/sbin`, and `/lib` into `/usr`, use a journal instead of plain-text logs for some services, or add distribution-specific locations.

### The organizing ideas

Before memorizing directories, learners examine four distinctions:

1. static content versus changing content;
2. shareable content versus host-specific content;
3. system-owned content versus administrator-owned or user-owned content;
4. persistent content versus runtime or virtual state.

### Directory atlas

| Path | Plain purpose | Why it exists | Windows comparison and caution |
|---|---|---|---|
| `/` | The root of the entire visible filesystem tree | Unix-like systems present filesystems and mounted devices inside one tree | Unlike `C:\`, root is not a particular drive letter |
| `/bin` | Essential user commands, often a link into `/usr/bin` on current systems | Historically kept commands needed for boot and recovery on the root filesystem | Somewhat overlaps command-line programs under Windows system locations, but packaging and layout differ |
| `/sbin` | Essential administration commands, often merged into `/usr/sbin` | Historically separated commands mainly used for system administration | The name is organization, not a security boundary |
| `/lib`, `/lib64` | Essential shared libraries and loader material, often merged into `/usr/lib` | Programs need shared code and a loader before they can start | Do not equate directly with Windows DLL folders |
| `/boot` | Bootloader, kernel, and early-boot files | Firmware and the boot process need a small, predictable set of startup files | Similar purpose to boot-related Windows partitions and files, but implementation differs |
| `/dev` | Device nodes and device-related interfaces | Many device interactions use file-like names | Not ordinary stored files; closer to named operating-system interfaces than a folder of device data |
| `/etc` | Host-specific system configuration | Administrators and services need a predictable configuration location | Some roles overlap Registry and machine-wide configuration, but Linux configuration is distributed across files and systems |
| `/home` | Ordinary users' home directories | Each user needs private files and per-user configuration | Similar in role to `C:\Users`, not identical in subdirectory conventions |
| `/root` | Home directory for the root account | The administrator account needs a home available even if ordinary home storage is unavailable | This is not the root of the filesystem |
| `/run` | Volatile runtime state such as process IDs, sockets, and current service information | Services need state that is valid only for the current boot | Usually memory-backed and cleared at boot; not a place for durable application data |
| `/tmp` | Temporary files | Programs need shared short-lived workspace | Contents may be cleared; a program must not treat it as durable storage |
| `/usr` | Most packaged user-space programs, libraries, and shared read-only data | Separates widely shareable system software from host-specific and variable state | The historical name is not a modern synonym for user home data |
| `/usr/bin` | Most user commands installed by the distribution | A common executable search location | Package-managed content should not be manually overwritten |
| `/usr/sbin` | Most non-essential administration commands | Keeps packaged administration utilities in a predictable location | Ordinary users may read or run many of these when authorized; location is not access control |
| `/usr/lib` | Libraries and package support material | Packaged programs need architecture-specific support files | Exact subdirectories vary by distribution and architecture |
| `/usr/share` | Architecture-independent shared data | Manuals, icons, locales, and other data can be shared across architectures | Not a general personal shared folder |
| `/usr/local` | Locally installed, administrator-managed software and data | Keeps local additions separate from distribution-managed files | Useful for avoiding collisions with package-manager ownership |
| `/opt` | Add-on application packages | Some third-party applications keep a self-contained hierarchy | May resemble a vendor application directory, but configuration and state often live elsewhere |
| `/var` | Persistent data expected to change while the system runs | Variable files were separated from more static software content | Think logs, queues, caches, databases, and service state rather than installed programs |
| `/var/log` | Logs when services write files there | Administrators need persistent event records | Some systems also or instead use a system journal |
| `/var/lib` | Persistent variable application and service state | Services need durable databases and state not owned by one user | Often the most important directory to understand before backing up or moving a service |
| `/var/cache` | Regenerable cached data | Saves work without making the cache the only copy | Deletion should not lose essential source data, but applications may need time to rebuild it |
| `/var/spool` | Queued work awaiting processing | Mail, printing, and jobs need durable queues | Queued data may be unique and should not be treated as disposable cache |
| `/var/tmp` | Temporary data intended to survive reboot longer than `/tmp` | Some work needs temporary persistence | Retention is policy-dependent, so it is still not permanent storage |
| `/srv` | Data served by this system | Administrators can group service content by purpose or protocol | Not every distribution or service uses it by default |
| `/media` | Mount points for removable media | Desktop systems need predictable removable-device locations | Similar user purpose to removable drives, but no drive letter is required |
| `/mnt` | Temporary or administrator-chosen mounts | Gives administrators a conventional place for temporary mounting | A convention, not the only valid mount location |
| `/proc` | Virtual view of processes and kernel information | The kernel exposes current state through file-like interfaces | Entries are generated, not ordinary disk files |
| `/sys` | Virtual view of devices, drivers, and kernel objects | User space needs a structured view of hardware and kernel objects | Writes can change live behavior and require careful guidance |
| `/lost+found` | Filesystem-recovery results on some filesystems | Recovery tools need a place for reconnected files | Files here need investigation and may have lost names or directory context |

### Service anatomy exercise

A learner receives a fictional service named `catalog-api` and maps:

```text
/usr/bin/catalog-api           program
/etc/catalog-api/config.toml   host configuration
/var/lib/catalog-api/          durable service state
/var/log/catalog-api/          file logs, if used
/run/catalog-api/              current-boot socket and process state
/srv/catalog-api/public/       deliberately served content, if chosen
/etc/systemd/system/           local service definition or override
```

The exercise then asks:

- Which locations belong in a backup?
- Which locations should be rebuilt instead?
- Which files are package-managed?
- Which state should disappear after reboot?
- Which directory can fill over time?
- What would a least-privileged service account need to write?
- What changes under a container or image-based deployment?

### Windows comparison course

The comparison must avoid false one-to-one mappings. It covers:

- one rooted namespace versus drive-letter-centered navigation;
- mount points versus assigning a new letter;
- case sensitivity and case preservation;
- `/` versus `\` path separators;
- executable permission versus filename extensions and file associations;
- package repositories versus independent installer packages;
- shared libraries and dynamic-link search behavior;
- service managers;
- user profiles and hidden dotfiles;
- machine configuration stored across files and databases;
- device nodes and virtual filesystems;
- text logs and structured journals versus Windows Event Log;
- access-control models, including where simple comparisons stop being accurate.

## Curriculum scale

The intended complete Linux school is deliberately large:

- 15 learning paths;
- 87 substantial courses;
- about 420 to 500 modules;
- about 1,200 to 1,500 reading and exercise units;
- at least 150 guided local labs;
- 15 path capstones;
- 12 applied-skill assessments;
- 3 broad certificate programs after assessment infrastructure is mature;
- about 450 to 650 hours for a learner who completes every route and extension.

No learner is expected to complete the entire catalog before using Linux. The catalog supports different goals:

- try Linux safely;
- move a personal desktop;
- learn Linux for programming or local models;
- set up a home server;
- operate production-like services;
- learn defensive security;
- prepare for deeper networking, cloud, DevOps, or platform work;
- study Linux internals.

## Path LNX-000: Get access without replacing your computer

Purpose: give every learner a safe Linux environment and teach them how to return to a known-good state.

Recommended preparation: none.
Start-now promise: every unit has a reading-only route.
Estimated full path time: 18 to 24 hours.

| Course | Modules | Guided work |
|---|---|---|
| LNX-001: What you are about to change | Host versus guest, files versus disks, administrator access, network exposure, backup versus snapshot | Label a diagram of the learner's host, guest, storage, and network boundaries |
| LNX-002: Choose an access route | Reading-only, WSL, virtual machine, Mac plus VM, native Linux, remote server | Complete a goal, hardware, risk, and accessibility decision worksheet |
| LNX-003: Windows Subsystem for Linux | Distribution installation, filesystems, Windows and Linux paths, processes, systemd, networking, backup and removal | Install or inspect a WSL distribution, create a file, export it, and remove a disposable test distribution |
| LNX-004: Your first Linux virtual machine | Hypervisor concepts, ISO verification, virtual hardware, NAT, guest tools, snapshots | Verify an image checksum, create an Ubuntu LTS VM, update it, snapshot it, and restore it |
| LNX-005: Mac, Linux, and Unix-like boundaries | Terminal, shell, POSIX heritage, package and service differences, virtualization on Intel and Apple Silicon | Compare the same read-only commands on macOS and a Linux guest and record where behavior differs |

Capstone: build a disposable Linux learning environment, produce a one-page environment map, prove snapshot recovery, and document how to delete the lab cleanly.

Suggested bridge paths:

- `Computer Basics > What is an operating system?`
- `Computer Basics > Files, folders, disks, and memory`
- `Safety Basics > Backups are not snapshots`
- `Networking Basics > Private and public addresses`

## Path LNX-100: History, purpose, communities, and adoption

Purpose: explain how Linux came to be, what a distribution contributes, and why people or organizations might choose it.

Recommended preparation: LNX-001 concepts.
Start-now promise: no live Linux system is required.
Estimated full path time: 24 to 32 hours.

| Course | Modules | Exercises and labs |
|---|---|---|
| LNX-101: Before Linux | Mainframes, time-sharing, Multics, Unix, C, pipes, portability, commercial Unix families | Put operating-system developments on a problem-and-response timeline |
| LNX-102: GNU, Linux, and free software | GNU Project, tools and libraries, Linux kernel, licensing, communities, kernel versus complete system | Inspect the license and source link for several installed or documented components |
| LNX-103: From kernel to distribution | Bootable system, installer, package archive, defaults, desktop, support, security team, release model | Assemble a paper distribution from component cards and explain each maintainer's job |
| LNX-104: Distribution families and release models | Debian, Ubuntu, Fedora and Red Hat, openSUSE, Arch, specialist systems, stable versus rolling versus image-based | Compare five learner scenarios and defend a distribution short list |
| LNX-105: Why organizations use Linux | Servers, cloud, containers, appliances, development, support choices, costs, constraints, mixed estates | Produce a pilot and rollback decision for a fictional 25-person organization |

History interludes:

- why Unix favored small tools;
- why C and portable interfaces mattered;
- why package repositories grew around distributions;
- why release cadence becomes a business decision;
- how volunteer, foundation, and corporate governance models differ;
- why the word `free` can describe freedom, price, or both, depending on context.

Capstone: prepare an evidence-labeled operating-system recommendation for a fictional organization that includes one Linux option, one stay-on-current-system option, workload fit, support ownership, training cost, security maintenance, pilot scope, and rollback.

Suggested bridge paths:

- `LNX-001 > Host, guest, and operating system`
- `Digital Literacy > Software licenses in plain language`
- `Security Foundations > Updates and support windows`

## Path LNX-200: Linux desktop and daily use

Purpose: make Linux usable as an ordinary personal computer before expecting administration skill.

Recommended preparation: LNX-002 or another Linux environment.
Start-now promise: prepared screenshots and simulated file trees support learners without a desktop VM.
Estimated full path time: 35 to 48 hours.

| Course | Modules | Guided work |
|---|---|---|
| LNX-201: Meet the desktop | Login, session, desktop environment, window manager, panels, launchers, workspaces, lock and logout | Complete a desktop scavenger hunt without changing system settings |
| LNX-202: Files and removable media | Home folder, file manager, hidden files, trash, mounts, removable media, safe eject | Organize a project folder, reveal hidden files, mount a disposable image, and eject it safely |
| LNX-203: Applications and updates | Software center, repositories, packages, sandboxed application formats, updates, restarts | Install and remove a harmless application through the graphical package tool and review the change list |
| LNX-204: Browsers, documents, media, and communication | Profiles, downloads, PDF tools, office compatibility, media codecs, printing, conferencing | Run a personal-workflow compatibility checklist using sample files |
| LNX-205: Accessibility, privacy, and desktop recovery | Magnification, screen readers, keyboard navigation, input methods, privacy controls, session recovery | Configure one accessibility need in a snapshot, document it, and restore the snapshot |

Capstone: set up a fictional learner desktop for browsing, documents, communication, backups, and one accessibility requirement. Provide a plain-language support sheet and restore plan.

Suggested bridge paths:

- `LNX-004 > Take and restore a snapshot`
- `LNX-104 > Desktop environments are not distributions`
- `Computer Basics > Where downloads go`

## Path LNX-300: Shell, commands, and text work

Purpose: teach the command line as a precise interface, not a rite of passage.

Recommended preparation: LNX-001 and an access lane.
Start-now promise: a command-reading route uses prepared output before any live command.
Estimated full path time: 45 to 60 hours.

| Course | Modules | Guided work |
|---|---|---|
| LNX-301: Terminal, shell, command, and process | Terminal emulator, prompt, shell, command parsing, arguments, options, exit status | Annotate prompts and commands, then run `pwd`, `whoami`, and `printf` in a disposable environment |
| LNX-302: Paths and navigation | Absolute and relative paths, `.`, `..`, home, working directory, quoting, case sensitivity | Navigate a prepared tree and predict the destination before each command |
| LNX-303: Inspect files safely | `ls`, `stat`, `file`, `wc`, `head`, `tail`, `less`, encodings, binary versus text | Identify unknown sample files using read-only tools |
| LNX-304: Create, copy, move, and remove | `mkdir`, `touch`, `cp`, `mv`, `rm`, recursion, overwrite behavior, trash differences | Build and reorganize a disposable tree, then restore it from an archive |
| LNX-305: Streams, pipes, and redirection | standard input, output, error, `|`, `>`, `>>`, file descriptors, `tee`, exit status | Build a report pipeline and demonstrate the difference between overwrite and append |
| LNX-306: Search and transform text | `grep`, `find`, `sort`, `uniq`, `cut`, `tr`, regular-expression basics, safe `xargs` use | Search a prepared log set and produce a deduplicated summary without altering sources |

Required hand-holding details:

- show which text belongs to the prompt and which text the learner types;
- explain spaces, quotes, hyphens, slashes, wildcards, pipes, and redirection before use;
- preview glob expansion before a modifying command;
- teach `--help`, manual pages, and command-specific documentation;
- distinguish shell built-ins from external programs;
- explain why copying a command from the internet is a trust decision.

Capstone: investigate a read-only fictional service archive, extract five facts through a transparent command pipeline, and produce a command journal that explains every token.

Suggested bridge paths:

- `LNX-301 > Read the prompt`
- `LNX-302 > Absolute and relative paths`
- `LNX-001 > Ordinary user and administrator`

## Path LNX-400: Filesystem atlas and data placement

Purpose: make the Linux directory tree understandable, predictable, and useful in diagnosis.

Recommended preparation: LNX-302 and LNX-303.
Start-now promise: the visual atlas and prepared service examples work without a live shell.
Estimated full path time: 55 to 75 hours.

| Course | Modules | Guided work |
|---|---|---|
| LNX-401: One tree, many filesystems | root, mount points, devices, filesystems, namespaces, drive-letter comparison | Trace three mounted devices through one directory tree |
| LNX-402: Root and essential directories | `/`, `/bin`, `/sbin`, `/lib`, `/boot`, `/dev`, `/etc`, `/root`, `/tmp`, `/run` | Inspect a read-only root tree and classify persistent, runtime, virtual, and configuration content |
| LNX-403: The `/usr` hierarchy | `/usr/bin`, `/usr/sbin`, `/usr/lib`, `/usr/share`, `/usr/local`, split-root history, merged `/usr` | Compare package-owned and locally installed files and explain collision risks |
| LNX-404: The `/var` hierarchy | `/var/lib`, `/var/log`, `/var/cache`, `/var/spool`, `/var/tmp`, growth and backup implications | Diagnose a simulated full `/var` and choose what may be cleaned, rotated, backed up, or left alone |
| LNX-405: Users, services, and mounted content | `/home`, `/srv`, `/opt`, `/media`, `/mnt`, application data conventions | Design a file layout for a small web service and a shared media workstation |
| LNX-406: Virtual files and modern variations | `/proc`, `/sys`, cgroups, `tmpfs`, containers, immutable systems, distribution-specific paths | Read prepared `/proc` and `/sys` evidence and explain why it is not ordinary disk data |

Filesystem exercises include:

- place 50 fictional files in the best directory and explain each decision;
- identify whether a path is likely package-owned, service-owned, administrator-owned, or user-owned;
- decide what belongs in a system backup;
- identify what should survive a reboot;
- compare a traditional layout with a merged `/usr` layout;
- map a Linux service to an equivalent Windows operational concept without claiming an exact mapping;
- diagnose a service from its executable, configuration, state, log, and runtime paths;
- identify incorrect examples such as permanent data in `/tmp` or manually edited files in package-owned locations.

Capstone: create a complete data-placement and backup design for a fictional photo-catalog service, including executable, configuration, state, logs, cache, uploads, runtime socket, service user, permissions, retention, and restoration order.

Suggested bridge paths:

- `LNX-302 > Absolute paths`
- `LNX-303 > stat and file types`
- `LNX-305 > Standard output and log capture`
- `Windows Migration > Drive letters and mount points`

## Path LNX-500: Accounts, permissions, and host security

Purpose: teach access control and system safety from the ordinary user's point of view through defensive administration.

Recommended preparation: LNX-302, LNX-401, and basic file inspection.
Start-now promise: every permission unit begins with a visual trace and prepared output.
Estimated full path time: 60 to 80 hours.

| Course | Modules | Guided work |
|---|---|---|
| LNX-501: Users, groups, and identity | UID, GID, account records, group membership, login identity, service accounts, root | Trace four accounts through prepared identity and process output |
| LNX-502: File and directory permissions | owner, group, other, read, write, execute, directory traversal, symbolic and numeric modes | Predict effective access before changing a disposable tree |
| LNX-503: Ownership and shared work | `chown`, `chgrp`, default ownership, setgid directories, umask, collaborative directories | Build a shared project folder, test access as two lab users, and repair a deliberate mistake |
| LNX-504: Administrator access and sudo | privilege boundaries, `sudo`, policy, authentication, environment, command scope, audit records | Read a proposed administrator command, name its scope, run a bounded change, and verify it |
| LNX-505: Extended access and mandatory controls | ACLs, capabilities, setuid and setgid, SELinux, AppArmor, namespaces, limits of simple mode bits | Compare traditional permissions with an ACL and one mandatory-control denial trace |
| LNX-506: Secure host baseline | updates, trusted repositories, least privilege, firewall, remote access, services, logs, backups, time, secure boot concepts | Apply and verify a baseline in a disposable server VM, then roll back one control and observe the difference |

Security truths the course repeats:

- Linux is not automatically secure because it is Linux.
- Open source does not mean every line has been reviewed or every package is safe.
- Administrator access is a capability to limit, not a badge of competence.
- A firewall does not repair an insecure service.
- Disabling a security control to make a tutorial work is a failure to diagnose.
- Backups, updates, support windows, service exposure, and recovery all belong to security.
- Kali Linux is a specialist security distribution, not a shortcut around Linux foundations.

Capstone: harden a fresh disposable server against a published baseline, document every deviation, verify remote access before closing an existing path, collect minimal evidence, and prove recovery from a bad configuration using the console or snapshot.

Suggested bridge paths:

- `LNX-303 > Read stat output`
- `LNX-401 > Filesystem objects and mount points`
- `Security Foundations > Threat, vulnerability, control, and risk`
- `Networking Foundations > Addresses, ports, and listening services`

## Path LNX-600: Software, processes, services, and logs

Purpose: explain what runs, how it was installed, who owns it, what starts it, and where to look when it fails.

Recommended preparation: LNX-303, LNX-402, and LNX-501.
Start-now promise: prepared process and service traces support a reading-only route.
Estimated full path time: 55 to 75 hours.

| Course | Modules | Guided work |
|---|---|---|
| LNX-601: Packages and repositories | package metadata, repositories, signatures, dependencies, upgrades, removal, configuration retention | Inspect package metadata, verify the configured source, install a harmless package, and remove it |
| LNX-602: Package families and application formats | Debian packages, RPM packages, source builds, Flatpak, Snap, AppImage, containers, trust and update ownership | Compare installation and update boundaries for one sample application |
| LNX-603: Processes and signals | process ID, parent, user, state, foreground, background, environment, signals, jobs | Start a harmless process, inspect it, stop it gracefully, and explain the evidence |
| LNX-604: Services and systemd | units, dependencies, enable versus start, status, service accounts, overrides, timers, targets | Install a tiny local service, start it, inspect it, add a bounded override, then remove it cleanly |
| LNX-605: Logs and the journal | timestamps, severity, structured fields, rotation, retention, privacy, clock accuracy | Follow a service event from action to process, status, journal entry, and file log where applicable |
| LNX-606: Scheduled and deferred work | systemd timers, cron, anacron concepts, one-shot jobs, missed schedules, output and failure handling | Schedule a local report, simulate a failure, find the evidence, and disable the schedule |

Capstone: take ownership of a fictional `catalog-api` service. Identify its package, process, account, configuration, persistent state, runtime state, logs, network listener, schedule, dependencies, update path, backup set, and clean removal process.

Suggested bridge paths:

- `LNX-404 > /var/lib and /var/log`
- `LNX-501 > Service accounts`
- `LNX-305 > Standard error and exit status`
- `LNX-506 > Trusted repositories`

## Path LNX-700: Storage, boot, backups, and recovery

Purpose: teach the layers under files and provide safe recovery habits before risky operations.

Recommended preparation: LNX-401, LNX-402, and LNX-502.
Start-now promise: all destructive work uses added disposable virtual disks or prepared traces.
Estimated full path time: 70 to 95 hours.

| Course | Modules | Guided work |
|---|---|---|
| LNX-701: Devices, partitions, and filesystems | block devices, names, stable identifiers, partition tables, partitions, filesystems, labels, UUIDs | Attach a disposable disk, identify it by size and stable ID, partition it, format it, and verify the target |
| LNX-702: Mounting and filesystem use | mount points, temporary mounts, persistent mount configuration, options, permissions, free space, inodes | Mount a disposable filesystem, make persistence explicit, simulate a bad entry, and recover without host impact |
| LNX-703: Encryption, volume management, and RAID concepts | threat model, LUKS concepts, logical volumes, snapshots, software RAID, redundancy versus backup | Build a disposable layered storage diagram and complete one guided encrypted-volume lab in a VM |
| LNX-704: Boot from firmware to login | UEFI, boot manager, loader, kernel, initramfs, root filesystem, PID 1, targets, display manager | Annotate a prepared boot log and repair a deliberately broken non-host VM boot entry |
| LNX-705: Backups and restores | source of truth, versioning, snapshots, archives, sync, off-system copy, encryption, retention, restore testing | Back up a sample service, delete its VM copy, restore it, and prove content and permissions |
| LNX-706: Recovery and rescue | console access, rescue media, single-user targets, failed mounts, full disk, password recovery policy, evidence preservation | Diagnose three broken VM snapshots and choose repair, rollback, or rebuild for each |

Storage safety ladder:

1. list devices;
2. identify the virtual target by size, bus, and stable identifier;
3. list mounts and active use;
4. snapshot the VM;
5. state the intended change in plain language;
6. run the bounded operation;
7. inspect the exit status and kernel or service evidence;
8. mount and verify using a test file;
9. reboot when the lesson concerns persistence;
10. restore or clean up.

Capstone: build a small server storage design using two disposable virtual disks. Define data, logs, cache, backup, retention, failure behavior, restore order, and growth alerts. Demonstrate one restore and one aborted unsafe operation.

Suggested bridge paths:

- `LNX-401 > One tree and mount points`
- `LNX-404 > Variable state and backup implications`
- `LNX-506 > Data protection and least privilege`
- `Computer Basics > Memory, storage, filesystem, and file`

## Path LNX-800: Networking on a Linux host

Purpose: connect the separate Networking school to the commands, configuration, services, and evidence visible on a Linux machine.

Recommended preparation: Networking Foundations through IP addresses and ports, plus LNX-301.
Start-now promise: prepared packet paths and command output support learners who have not completed Networking Foundations.
Estimated full path time: 65 to 90 hours.

| Course | Modules | Guided work |
|---|---|---|
| LNX-801: Interfaces, addresses, and routes | loopback, physical and virtual interfaces, link state, MAC, IPv4, IPv6, routes, metrics | Inspect a VM's interfaces and predict the route used for three destinations |
| LNX-802: Names and network configuration | hostnames, DNS client behavior, resolver configuration, DHCP, static settings, network managers | Trace a name from application request through configured resolver and returned address |
| LNX-803: Ports, sockets, and listening services | TCP, UDP, local sockets, bind addresses, ephemeral ports, clients and servers | Start a loopback-only service, inspect its socket, connect locally, and stop it |
| LNX-804: Linux network troubleshooting | link, address, route, DNS, transport, application, capture, firewall evidence | Diagnose six isolated failures using an evidence ladder rather than random commands |
| LNX-805: Host firewall and forwarding | ingress, egress, stateful filtering, zones, NAT concepts, forwarding, persistence, lockout recovery | Apply a narrow VM firewall rule, verify allowed and denied flows, and restore access through the VM console |
| LNX-806: Bridges, namespaces, containers, and VPN concepts | virtual Ethernet, bridge, namespace, container network, tunnel, route policy, MTU | Build a private two-namespace lab, observe traffic, and destroy the namespace cleanly |

Scope boundary:

- This path explains host networking and Linux tools.
- The Networking school teaches Ethernet, switching, routing, wireless, DNS, DHCP, TCP, IPv6, VPNs, firewalls, network design, dynamic routing, and BGP in greater depth.
- Links between the schools are recommendations, not gates.

Capstone: operate a three-VM private service network. Document addresses, routes, DNS, listeners, firewall policy, packet path, failure modes, evidence collection, and recovery. No VM receives an unsolicited public listener.

Suggested bridge paths:

- `Networking Foundations > What a network is`
- `Networking Foundations > IP address, subnet, gateway, and port`
- `LNX-603 > Processes`
- `LNX-506 > Listening services and exposure`

## Path LNX-900: Linux gaming, graphics, media, and devices

Purpose: give realistic guidance for gaming and daily hardware use without claiming universal compatibility.

Recommended preparation: LNX-201, LNX-203, and a native or spare Linux system for performance labs.
Start-now promise: compatibility planning and prepared diagnostics work without installing Linux.
Estimated full path time: 35 to 50 hours.

| Course | Modules | Guided work |
|---|---|---|
| LNX-901: Graphics and display stack | GPU, driver, kernel component, user-space driver, display server, desktop compositor, Vulkan, shader cache | Identify the layers in a prepared graphics diagnostic report |
| LNX-902: Native games, compatibility layers, and Steam Play | native builds, Wine concepts, Proton, prefixes, runtime libraries, controller input, save locations | Evaluate compatibility evidence for a sample game library and create a migration risk list |
| LNX-903: Steam Deck and appliance-style Linux | SteamOS concepts, game mode, desktop mode, immutable base, Flatpak, removable storage, updates | Build a reversible customization plan and identify which areas an update may replace |
| LNX-904: Performance and troubleshooting | frame time, CPU and GPU limits, shader compilation, drivers, overlays, logs, power profile | Compare two prepared performance traces and identify the next safe diagnostic step |
| LNX-905: Media, controllers, audio, and capture | codecs, DRM limits, PipeWire concepts, Bluetooth, game controllers, streaming, capture permissions | Diagnose a fictional controller and audio problem using layer-by-layer evidence |

The gaming course states plainly:

- compatibility changes over time;
- anti-cheat and DRM decisions can block a title even when the underlying game can run;
- user reports are useful evidence but are not vendor support promises;
- a game working once is not proof that multiplayer, updates, controllers, suspend, or anti-cheat will work;
- save files and cloud synchronization must be verified before migration;
- specialized competitive games may justify retaining Windows or using separate hardware;
- performance should be measured on the learner's actual hardware rather than inferred from screenshots.

Capstone: create a game-library migration report that classifies titles as supported, supported with conditions, unverified, or blocked. Include controller, save, mod, anti-cheat, streaming, and rollback plans.

Suggested bridge paths:

- `LNX-203 > Application sources and updates`
- `LNX-601 > Package trust`
- `LNX-701 > Storage devices`
- `Windows Migration > Inventory applications before changing an operating system`

## Path LNX-1000: Move from Windows to Linux safely

Purpose: guide a learner through evaluation, pilot, migration, daily operation, and rollback without pressuring them to erase Windows.

Recommended preparation: LNX-002, LNX-104, LNX-201, and LNX-705.
Start-now promise: the entire assessment and planning portion works on Windows before Linux is installed.
Estimated full path time: 45 to 70 hours, excluding the learner's file-transfer time.

| Course | Modules | Guided work |
|---|---|---|
| LNX-1001: Decide whether migration fits | goals, constraints, hardware, applications, peripherals, accessibility, support, cost, mixed-system options | Complete a keep, replace, or test decision for every important workflow |
| LNX-1002: Inventory Windows | files, accounts, installed apps, browsers, licenses, encryption, recovery keys, printers, games, cloud sync, specialized hardware | Produce a redacted migration inventory without uploading it |
| LNX-1003: Find Linux workflows | application alternatives, web applications, file formats, office documents, communication, development, creative work, Windows VM options | Test sample documents and workflows in a Linux VM and record losses or differences |
| LNX-1004: Protect data and a return path | verified backup, second copy, recovery media, firmware settings, BitLocker awareness, restore test, dual-boot risk | Restore sample personal data to a second location and prove the backup is readable |
| LNX-1005: Pilot and install | live session, VM pilot, distribution choice, hardware checks, installation concepts, accounts, updates, drivers | Run a seven-day VM or spare-device pilot with a daily friction log |
| LNX-1006: Settle in, support, and rollback | data restore, browsers, mail, office, printers, game saves, backups, updates, troubleshooting, revert or retain Windows | Complete a post-migration verification sheet and a 30-day support plan |

### Migration phases

#### Phase 1: Name the reason

The learner states the goal before choosing a distribution:

- avoid replacing otherwise useful hardware;
- create a development or local-model workstation;
- reduce dependence on a particular vendor;
- learn server administration;
- improve repairability or customization;
- build a gaming system;
- solve a privacy or workflow need;
- experiment without committing.

#### Phase 2: Inventory what must continue to work

The worksheet covers:

- user accounts and sign-in methods;
- accessibility requirements;
- local and cloud files;
- encryption and recovery keys;
- browsers, bookmarks, passwords, and extensions;
- email and calendar;
- office documents, fonts, macros, templates, and add-ins;
- creative and engineering applications;
- printers, scanners, cameras, audio devices, controllers, and specialty hardware;
- games, launchers, mods, anti-cheat, saves, and controllers;
- VPN, endpoint-security, device-management, and employer requirements;
- tax, legal, medical, educational, or other specialist applications;
- backup and restore tools.

#### Phase 3: Classify every requirement

Use these labels:

- works natively with supported Linux software;
- works through a browser;
- works with an acceptable alternative after file-format testing;
- works in a supported compatibility layer;
- works only in a Windows virtual machine;
- should remain on a separate Windows machine;
- unverified;
- blocked.

#### Phase 4: Build the return path

Before a native installation:

- make at least two copies of important data;
- keep one copy disconnected or separately protected;
- verify representative files;
- create Windows recovery media where appropriate;
- record encryption recovery information in an authorized secure location;
- export application data that cloud sync does not guarantee;
- confirm the learner can sign in to critical accounts from another device;
- document firmware and boot settings;
- define the exact condition that triggers rollback.

#### Phase 5: Pilot

Prefer, in order:

1. reading and compatibility research;
2. a virtual machine;
3. a live environment for hardware observation;
4. a spare machine or separate drive;
5. native replacement only after the learner accepts the evidence and risk.

Dual boot is presented as a storage and boot-management choice with failure modes, not as a harmless default.

#### Phase 6: Verify daily work

The learner tests:

- startup and shutdown;
- suspend and resume;
- Wi-Fi, wired networking, Bluetooth, VPN, and captive portals;
- external displays and scaling;
- sound input and output;
- webcam and conferencing;
- printing and scanning;
- encrypted storage;
- backup and restore;
- browser and document workflows;
- accessibility;
- games and controllers;
- updates and recovery.

Capstone: produce and execute a migration pilot for a fictional family computer or small office workstation. The capstone can conclude that migration is not currently appropriate and still receive full credit when the evidence is sound.

Suggested bridge paths:

- `LNX-104 > Choose a distribution by workload`
- `LNX-205 > Accessibility and recovery`
- `LNX-705 > Prove a restore`
- `LNX-902 > Gaming compatibility limits`

## Path LNX-1100: Build and operate a Linux server

Purpose: move from a disposable first server to a documented, monitored, backed-up service.

Recommended preparation: LNX-500, LNX-600, LNX-700, and LNX-800.
Start-now promise: the first course provides a bridge review and a fully private one-VM route.
Estimated full path time: 90 to 125 hours.

| Course | Modules | Guided work |
|---|---|---|
| LNX-1101: Plan a server | workload, users, data, availability, threat model, resource estimate, distribution and support, physical versus VM versus cloud | Write a one-page service definition and decide what failure the design must survive |
| LNX-1102: Install a private server | minimal install, accounts, hostname, time, updates, console, network, guest tools, snapshot | Build a NAT-only Ubuntu or Debian server VM and record a baseline |
| LNX-1103: Remote administration with SSH | keys, host identity, known hosts, agents, configuration, jump hosts, file transfer, lockout prevention | Create learner-owned keys, verify host identity, connect over a private lab network, and rotate the key |
| LNX-1104: Publish a web service safely | bind address, reverse proxy concept, TLS concept, DNS dependency, firewall, service account, content permissions | Publish a static site to the private lab network and verify that no public listener exists |
| LNX-1105: File, database, and application services | service selection, data ownership, client authentication, backups, upgrades, compatibility | Run a private file or application service using synthetic data and complete a restore |
| LNX-1106: Operations and maintenance | patching, configuration change, maintenance window, monitoring, capacity, logs, backup, restore, incident notes | Upgrade a cloned VM, compare state, deliberately roll back, then write a change record |
| LNX-1107: Reliability and recovery | dependency mapping, health checks, restart policy, degraded service, redundancy, recovery objectives, rebuild | Recover a failed service using documentation rather than command history |

Server examples should include:

- a static website;
- a small private web application;
- a file share;
- a local Git service concept;
- a media library concept;
- a game server concept;
- a local model service concept;
- a DNS filtering or internal name-service concept;
- a scheduled backup target;
- an observability collector.

Examples remain small, private, and synthetic. Public deployment appears only after DNS, TLS, firewall, updates, logging, authentication, backup, recovery, and cost are understood.

Capstone: operate a private, two-VM application for seven simulated maintenance events. Provide an architecture diagram, account list, port list, data map, backup inventory, restore proof, update plan, monitoring plan, incident log, and rebuild procedure.

Suggested bridge paths:

- `LNX-504 > Administrator access`
- `LNX-604 > Service lifecycle`
- `LNX-705 > Backup and restore`
- `LNX-803 > Listening services`
- `Cybersecurity Foundations > Threat model and least privilege`

## Path LNX-1200: Automation, containers, and repeatable systems

Purpose: turn documented manual work into reviewed, testable, and reversible automation.

Recommended preparation: LNX-300, LNX-600, and LNX-1100 concepts.
Start-now promise: every course offers a prepared-code reading route and a disposable VM route.
Estimated full path time: 70 to 100 hours.

| Course | Modules | Guided work |
|---|---|---|
| LNX-1201: Shell scripting foundations | interpreter, script file, variables, quoting, tests, branching, loops, functions, exit codes | Turn a five-command inspection checklist into a read-only script |
| LNX-1202: Safe and testable shell automation | strict modes and limits, validation, temporary files, cleanup traps, idempotence, dry run, logs | Build a dry-run-first configuration checker and test failure paths |
| LNX-1203: Configuration management concepts | desired state, inventory, templates, secrets, convergence, drift, review, rollback | Express a small server baseline as declarative data and compare two runs |
| LNX-1204: Containers from Linux primitives | image, container, process isolation, namespaces, cgroups, filesystem layers, registry trust | Inspect a rootless container and map its processes, mounts, network, and limits to host evidence |
| LNX-1205: Compose a local service | multi-container application, networks, volumes, health, dependency, secrets, update, cleanup | Run a loopback-only synthetic application, back up its volume, restore it, and remove all lab state |
| LNX-1206: Virtual machines, images, and infrastructure concepts | template, cloud image, initialization, immutable image, configuration at boot, artifact provenance | Build a reusable VM template and prove that a new instance can be recreated from documented input |

Automation rules:

- do the task manually and understand the state first;
- make inspection separate from mutation;
- provide dry run or plan output;
- validate exact targets;
- make repeat runs safe;
- stop on unexpected state;
- keep secrets out of scripts and logs;
- produce a change record;
- test failure and rollback;
- never use automation to hide a command the learner cannot explain.

Capstone: turn the LNX-1100 private service into a reproducible lab deployment. A fresh VM must reach the documented state, a second run must not cause unintended changes, failure must be visible, data must survive the expected replacement boundary, and removal must be complete.

Suggested bridge paths:

- `LNX-305 > Streams and exit status`
- `LNX-603 > Process and environment`
- `LNX-604 > Services`
- `Programming Foundations > Variables, conditions, loops, and functions`

## Path LNX-1300: Troubleshooting, performance, and observability

Purpose: replace guesswork with a repeatable evidence ladder.

Recommended preparation: LNX-600 through LNX-800 concepts.
Start-now promise: prepared incident bundles let any learner practice diagnosis without operating a server.
Estimated full path time: 70 to 95 hours.

| Course | Modules | Guided work |
|---|---|---|
| LNX-1301: A troubleshooting method | scope, timeline, expected versus observed, recent change, hypotheses, safe checks, minimal change, verification | Work through a prepared incident without being told which subsystem failed |
| LNX-1302: CPU, memory, and process pressure | load, utilization, run queue, memory pressure, cache, swap, process state, limits | Distinguish CPU, memory, and blocked-I/O cases from prepared traces |
| LNX-1303: Disk, filesystem, and I/O problems | space, inodes, latency, errors, mounts, read-only state, deleted-open files, growth | Recover a disposable VM from a full service-state filesystem |
| LNX-1304: Service, boot, and dependency failures | unit status, ordering, environment, permissions, port collision, configuration parsing, boot evidence | Diagnose and repair a service that fails for three different reasons |
| LNX-1305: Network and name-resolution failures | link, address, route, DNS, firewall, listening socket, TLS, application | Use a layer-by-layer checklist across two private VMs |
| LNX-1306: Observability and capacity | metrics, logs, traces, events, dashboards, alert quality, baselines, capacity, retention | Build a small local dashboard from synthetic metrics and explain every threshold |

The troubleshooting page always separates:

```text
Symptom
Known scope
Expected state
Observed evidence
Most likely explanations
Next least-invasive check
Change, if justified
Verification
Rollback or follow-up
```

Capstone: resolve a multi-symptom private-server incident. The learner must preserve evidence, avoid an attractive but incorrect fix, identify one contributing condition and one root cause, restore service, verify data, and write a clear incident report.

Suggested bridge paths:

- `LNX-603 > Process states`
- `LNX-605 > Logs and time`
- `LNX-706 > Repair, rollback, or rebuild`
- `LNX-804 > Network troubleshooting ladder`

## Path LNX-1400: Linux internals, platforms, and enterprise operation

Purpose: give advanced learners a coherent view of the kernel boundary, platform lifecycle, and large-fleet concerns.

Recommended preparation: substantial comfort with LNX-500 through LNX-1300.
Start-now promise: architecture readings and prepared traces remain open without advanced hardware.
Estimated full path time: 85 to 125 hours.

| Course | Modules | Guided work |
|---|---|---|
| LNX-1401: Kernel and user space | system calls, privilege levels, libraries, processes, virtual memory, interrupts, devices, stable user-space interfaces | Trace a simple file read from application call through user-space library and kernel boundary |
| LNX-1402: Memory, scheduling, and cgroups | pages, address spaces, cache, scheduler concepts, namespaces, cgroups, pressure, out-of-memory behavior | Apply a disposable resource limit and interpret the resulting evidence |
| LNX-1403: Kernel modules, devices, and eBPF concepts | modules, device discovery, udev, firmware, tracing, eBPF safety and scope | Inspect prepared module and trace evidence without loading unreviewed kernel code |
| LNX-1404: Filesystem and storage internals | VFS, page cache, journaling, copy-on-write, consistency, snapshots, network filesystems | Compare failure and recovery behavior across prepared filesystem cases |
| LNX-1405: Fleet lifecycle and compliance | inventory, patch channels, staging rings, configuration drift, support lifecycle, vulnerability response, audit evidence | Design a three-ring update and rollback policy for a fictional fleet |
| LNX-1406: High availability and platform engineering | failure domains, load balancing, clustering concepts, immutable replacement, service objectives, operational ownership | Review an architecture and remove complexity that does not serve its stated objective |

The advanced course uses current [Linux kernel documentation](https://docs.kernel.org/) as a primary reference and makes clear which interfaces are documented as stable, testing, obsolete, or internal.

Capstone: design the lifecycle of a 100-host fictional Linux service estate. Include image or installation ownership, package sources, identity, secrets, patch rings, configuration, observability, backup, recovery, capacity, vulnerability response, change approval, documentation, and decommissioning.

Suggested bridge paths:

- `LNX-603 > Processes and signals`
- `LNX-701 > Storage layers`
- `LNX-806 > Namespaces and cgroups`
- `LNX-1301 > Evidence-led troubleshooting`

## Exercises and retrieval design

Exercises should make learners interpret and decide before they memorize syntax.

### Exercise families

| Exercise type | Learner task | What it teaches |
|---|---|---|
| Vocabulary in context | Choose the plain definition that fits a screenshot or incident | Terms mean something observable |
| Command anatomy | Label command, subcommand, option, argument, path, redirection, and prompt | Commands are structured instructions, not incantations |
| Predict before running | Select the expected files, process, permission, or output | Mental models and safe habits |
| Read the evidence | Interpret prepared `stat`, process, service, route, mount, or log output | Observation before mutation |
| Path placement | Put a fictional file in the best directory and explain why | Filesystem hierarchy and ownership |
| Layer ordering | Put boot, storage, network, or service layers in order | Dependency reasoning |
| Find the unsafe assumption | Identify the unverified disk, broad wildcard, public listener, or missing backup | Risk recognition |
| Choose the next check | Select the least-invasive evidence-gathering action | Troubleshooting discipline |
| Compare systems | Map a Linux concept to Windows or macOS and identify where the analogy fails | Transfer without false equivalence |
| History cause and effect | Connect an old constraint or community choice to a modern convention | Context rather than trivia |
| Configuration review | Read a small configuration and predict effective behavior | Precise administration |
| Recovery choice | Choose repair, rollback, restore, rebuild, or escalation | Operational judgment |
| Decision memo | Recommend or reject a migration, distribution, or service design | Evidence-based tradeoffs |
| Teach it back | Explain a term to a fictional beginner without jargon | Durable understanding |

### Retrieval schedule

- A new concept returns in the next unit as a quick recognition check.
- It returns later in the same course as a prediction or application.
- It returns in a later path inside a realistic scenario.
- A missed item returns after the explanation, without points or lives being removed.
- A learner may open the source lesson during formative practice.
- Assessments disclose skills and format, but not protected answer keys.

### Feedback contract

Feedback identifies:

1. what the learner noticed correctly;
2. the exact missing distinction;
3. the evidence that resolves it;
4. a short restatement;
5. an optional bridge link;
6. another attempt.

Avoid feedback such as `Incorrect`, `Try again`, or `You should already know this` without a teaching explanation.

## Guided lab inventory

The full curriculum should contain at least 150 maintained labs. The table defines the minimum shape of the inventory, not an upper limit.

| Lab family | Minimum count | Representative labs |
|---|---:|---|
| Access and recovery | 10 | Choose a lane; verify an ISO; install WSL; export a WSL distribution; create a VM; snapshot; restore; clone; delete; record environment facts |
| Desktop and applications | 10 | Desktop tour; hidden files; removable image; software center; package removal; browser profile; document compatibility; accessibility; printer trace; session recovery |
| Shell and text | 16 | Prompt anatomy; paths; quoting; file inspection; copy and move; safe removal; output; error; pipelines; search; sort; deduplicate; archive; checksum; manual pages; command journal |
| Filesystem hierarchy | 14 | Root atlas; `/etc`; `/usr`; `/usr/local`; `/var/lib`; `/var/log`; `/var/cache`; `/run`; `/tmp`; `/proc`; `/sys`; service anatomy; full `/var`; backup map |
| Accounts and permissions | 14 | User identity; groups; file modes; directory modes; umask; shared directory; ownership; sudo scope; ACL; capability trace; service user; failed access; least privilege; baseline |
| Packages, processes, and services | 15 | Repository source; package metadata; install; remove; process tree; jobs; signals; environment; systemd service; override; timer; journal; rotation; dependency; clean removal |
| Storage, boot, and recovery | 15 | Identify disk; partition; filesystem; label and UUID; mount; persistent mount; bad mount recovery; encrypted volume; volume snapshot; boot log; broken boot; backup; restore; full disk; rescue |
| Host networking | 14 | Interface; address; route; DNS; socket; loopback service; two-VM service; firewall allow; firewall deny; console recovery; namespace; bridge; packet evidence; MTU case |
| Gaming and hardware | 8 | Graphics stack; driver evidence; compatibility inventory; save-data inventory; controller; audio; performance trace; SteamOS rollback plan |
| Windows migration | 10 | Goal worksheet; application inventory; file-format test; hardware evidence; backup proof; recovery media checklist; VM pilot; live-session checklist; friction log; rollback decision |
| Server administration | 18 | Plan; install; baseline; SSH key; host identity; key rotation; web service; reverse proxy concept; file service; database backup; application restore; update clone; maintenance; capacity; monitoring; incident; rebuild; decommission |
| Automation and containers | 12 | Read-only script; validated input; dry run; temporary files; cleanup; idempotence; configuration drift; rootless container; limits; local composition; volume restore; VM template |
| Troubleshooting | 12 | CPU; memory; I/O; space; inode; service; permission; DNS; route; firewall; TLS concept; multi-symptom incident |
| Internals and fleet work | 8 | System-call trace; memory map; cgroup limit; module evidence; device event; filesystem comparison; patch rings; platform design review |
| Integrated capstones | 15 | One capstone for each learning path |

Total minimum: 191 labs and capstones if all listed inventory targets are met.

### Lab package standard

Each downloadable lab package contains:

```text
linux-lab-id/
├── README.md
├── LAB.md
├── lab-manifest.json
├── requirements/
│   ├── windows-wsl.md
│   ├── windows-vm.md
│   ├── macos-vm.md
│   └── linux-host.md
├── starter/
├── fixtures/
├── scripts/
├── checks/
├── expected/
├── recovery/
├── cleanup/
├── evidence-template/
├── SOURCES.md
├── SECURITY.md
├── LICENSES.md
└── checksums.txt
```

Scripts must support a review or dry-run mode when they make changes. A lab package never contains a secret, copyrighted commercial software, unlicensed dataset, intentionally harmful payload, or live third-party target.

### Lab hand-holding sequence

Every beginner lab uses the same sequence:

1. State the goal in one sentence.
2. Show what will and will not change.
3. Identify the host, guest, account, disk, and network.
4. Check available memory and disk space.
5. Take or verify the recovery checkpoint.
6. Display the expected starting state.
7. Explain the first command token by token.
8. Run one small step.
9. Compare actual and expected evidence.
10. Explain why the evidence matters.
11. Continue in bounded steps.
12. Perform a final independent verification.
13. Undo or retain the change deliberately.
14. Clean up temporary resources.
15. Record what the learner could now explain to someone else.

## Windows, macOS, and Linux context policy

Linux remains the primary lab operating system because it is widely available at no operating-system license cost, runs in local virtual machines and many hosted environments, and is central to servers, containers, networking, security, and local-model work.

The curriculum still respects the learner's current operating system:

- Windows instructions explain PowerShell, WSL, Windows paths, host networking, virtualization settings, and recovery boundaries where needed.
- macOS instructions explain Terminal, Unix similarities, Apple Silicon architecture, virtualization, package differences, launch services, filesystem differences, and where Linux instructions do not apply.
- Linux-host instructions separate safe user-space labs from host administration.
- Each course marks concepts that transfer across all three systems.
- Comparative lessons never imply that Windows or macOS users are less technical.
- A course may conclude that the learner should keep the current host and use Linux through WSL, a VM, a remote lab, or a separate device.

## Certificate and assessment model

### Evidence levels

| Record | Honest claim | Evidence |
|---|---|---|
| Course completion | The learner completed required course units and formative work | Server-owned progress plus authored completion rules |
| Path completion | The learner completed the path's required courses and capstone submission | Progress, formative work, and submission record; no claim of independent skill verification |
| Applied skill credential | The learner demonstrated one bounded practical skill under a published rubric | Server-scored knowledge assessment, local lab evidence, and deterministic checks or human review as declared |
| Professional certificate | The learner demonstrated broad knowledge and practical skill across several domains | Multiple protected assessments, several applied credentials, integrative capstone, and independent review |

All teaching content and course outlines remain open. Credential issuance can require evidence without hiding or locking the learning material.

### Proposed completion records

- Linux Orientation
- Linux Desktop Foundations
- Shell and Files
- Linux Filesystem Atlas
- Accounts and Permissions
- Linux Services and Logs
- Storage and Recovery
- Linux Host Networking
- Linux Gaming and Compatibility
- Windows-to-Linux Migration Planning
- Linux Server Operations
- Linux Automation and Containers
- Linux Troubleshooting
- Linux Internals and Fleet Operations

### Proposed applied skill credentials

1. **Create and Recover a Linux Learning Environment**
   - create a bounded environment;
   - identify host and guest boundaries;
   - prove snapshot or export recovery;
   - remove the environment cleanly.

2. **Navigate and Explain the Linux Filesystem**
   - place files correctly;
   - explain `/etc`, `/usr`, `/var`, `/run`, `/proc`, and user data;
   - map a service's program, configuration, state, logs, and runtime files;
   - identify backup and cleanup implications.

3. **Manage Linux Access Safely**
   - create a least-privileged account or service account;
   - configure a shared directory;
   - diagnose effective access;
   - use administrator scope deliberately;
   - verify the final state.

4. **Operate a Linux Service**
   - install from a trusted source;
   - configure, start, inspect, and stop a service;
   - read logs;
   - back up its state;
   - remove it cleanly.

5. **Protect and Restore Linux Data**
   - define a backup set;
   - create a protected copy;
   - restore files and metadata;
   - prove the restore;
   - document recovery time and gaps.

6. **Troubleshoot a Linux Host**
   - scope an incident;
   - gather evidence;
   - test hypotheses with low-impact checks;
   - restore service;
   - verify and document the result.

7. **Plan a Windows-to-Linux Migration**
   - inventory requirements;
   - test critical workflows;
   - protect data and recovery;
   - pilot Linux;
   - recommend migrate, coexist, defer, or remain on Windows.

8. **Build a Private Linux Server**
   - plan and install a server;
   - secure access;
   - run one private service;
   - monitor and patch it;
   - back up, restore, and rebuild it.

9. **Automate a Linux Configuration Safely**
   - separate inspection and change;
   - validate targets;
   - provide dry-run behavior;
   - make repeat runs safe;
   - expose failures;
   - prove rollback or cleanup.

10. **Operate a Linux Gaming Workstation**
    - assess hardware and game compatibility;
    - configure supported software sources;
    - protect saves;
    - collect performance and failure evidence;
    - retain a fallback for blocked titles.

11. **Apply a Linux Host Security Baseline**
    - update through trusted sources;
    - reduce service exposure;
    - enforce least privilege;
    - configure and verify a firewall;
    - preserve recovery access;
    - document exceptions.

12. **Design a Maintainable Linux Fleet**
    - define lifecycle, update rings, configuration, evidence, recovery, and decommissioning;
    - compare mutable and image-based approaches;
    - identify failure domains and operational ownership.

### Proposed broad certificates

#### Linux Desktop Practitioner

Evidence includes:

- LNX-000 through LNX-400 completion;
- Linux desktop and shell assessments;
- filesystem applied skill;
- one migration or gaming capstone;
- accessibility and backup checks.

#### Linux System Administrator

Evidence includes:

- accounts, services, storage, networking, security, and server assessments;
- service operation, backup and restore, host baseline, and troubleshooting applied skills;
- a private-server capstone reviewed under a published rubric.

#### Linux Systems Engineer

Evidence includes:

- automation, containers, troubleshooting, internals, and fleet assessments;
- automation and maintainable-fleet applied skills;
- an integrative architecture and recovery capstone;
- independent review and current-version requirements.

These names must not imply accreditation, professional licensure, identity proof, or equivalence to a third-party Linux certification. The verification page states exactly what was assessed.

### Assessment rules

- Completion checks are separate from certification assessments.
- Assessment skill blueprints and rubrics are public.
- Protected answers and challenge variants are server-owned.
- A learner may retake an assessment after receiving skill-area feedback.
- Questions test interpretation and decisions, not obscure command flags.
- Practical evidence is redacted and minimized.
- Human-reviewed submissions display the review level.
- Automated verification never claims authorship.
- GitHub sign-in proves control of a GitHub account, not legal identity.
- Credentials are private by default and public only by explicit learner choice.
- Credentials include curriculum version, assessment version, issue date, current or legacy state, and verification ID.

## Content source and freshness policy

Each course maintains a source register containing:

- primary standard or project documentation;
- distribution documentation;
- software and support lifecycle page;
- tested version and environment;
- last review date;
- factual claims that are likely to change;
- screenshots that require replacement;
- commands and expected outputs that require retesting;
- license and attribution notes.

Rules:

- Prefer upstream project, standards body, vendor, and distribution documentation for technical behavior.
- Label vendor performance, security, cost, and adoption statements as vendor claims.
- Do not use a community popularity poll as proof that a distribution is best.
- Date market-share and adoption evidence and define what was counted.
- Never publish an installation command without testing the supported version named in the lab.
- Review distribution and software recommendations at least every six months.
- Review security, WSL, gaming compatibility, support lifecycle, and package-source guidance more frequently when upstream changes.
- Keep old course versions available to credential verification without presenting them as current guidance.

## Standard course and unit anatomy

### Course outline

Every course page includes:

- plain title and one-sentence purpose;
- what the learner will be able to explain and do;
- estimated reading, exercise, and lab time shown separately;
- supported access lanes;
- a visible **Start now** action;
- recommended preparation with exact bridge links;
- hardware, storage, and network needs;
- module list;
- lab list and risk labels;
- capstone or completion criteria;
- current content version and last review date;
- sources and known limitations;
- adjacent Linux, Networking, Cybersecurity, Programming, and Local Models paths.

### Module anatomy

Each module contains:

1. orientation;
2. vocabulary preview;
3. historical or design context;
4. main explanation;
5. visual model;
6. worked example;
7. prediction exercise;
8. guided practice;
9. verification and recovery;
10. common mistakes;
11. retrieval round;
12. stopping point;
13. bridge links;
14. sources.

### Unit page

The unit page prioritizes teaching space:

```text
Breadcrumbs
Course and module context
Unit title
What you will learn
New words
Explanation
Visual or worked example
One small exercise
Feedback
Optional deeper detail
Common mistakes
Previous | Take a break | Next
Sources and last review date
```

No marketing panel, oversized hero, decorative progress currency, or chat input competes with the lesson.

## Integration with Networking, Cybersecurity, Programming, and Local Models

Linux is the common lab operating system, but it is not a gate in front of other schools.

### Networking

- Networking Foundations links to LNX-801 for Linux interface observation.
- Linux Host Networking links back to full explanations of Ethernet, addressing, routing, DNS, TCP, and IPv6.
- Advanced Networking and BGP use a private Linux router lab only after the lab establishes authorization and routing isolation.
- A learner may start BGP now and receive a short bridge panel for IP addresses, subnets, routes, and Linux interface commands.

### Cybersecurity

- Cybersecurity Foundations links to LNX-500 for accounts, permissions, services, updates, logs, and host baselines.
- Security labs default to disposable Linux VMs because they can be cloned, isolated, observed, and reset.
- Kali appears only after ordinary Linux administration and authorization are explained, but its course remains open.
- Defensive Linux labs use synthetic data and private targets.
- Advanced security courses link to evidence preservation, logging, networking, scripting, and recovery units.

### Programming

- Shell scripting recommends programming concepts but explains its own syntax.
- C and C++ courses can link to processes, libraries, system calls, files, permissions, and build tools.
- Python courses can link to virtual environments, packages, services, and automation.
- Every bridge offers direct concept pages and **Start now**.

### Local models and LLMs

- Local-model hardware preparation links to Linux access lanes and storage planning.
- Local inference links to processes, permissions, services, sockets, and resource observation.
- Fine-tuning links to Python environments, storage capacity, process limits, logs, checkpoints, and recovery.
- Local model servers link to loopback binding, firewall rules, service users, logging, updates, and backups.
- Model labs run locally; SeePoundCoffeePie does not execute or receive the workload.

## Milestone sequence

The sequence orders implementation work. It never locks a released course behind an earlier path.

### Phase LNX-A: Architecture and safety

#### LNX-M001: Approve the Linux school boundary

Define teaching, progress, lab download, evidence, and credential boundaries. Complete when host changes and prohibited data are explicit.

#### LNX-M002: Approve the open-access rule

Remove prerequisite locks from the new architecture. Complete when every outline presents **Start now**, recommended preparation, and exact bridge links.

#### LNX-M003: Define the Linux content schema

Model school, path, course, module, unit, exercise, lab, capstone, assessment, source, and content version.

#### LNX-M004: Define access-lane metadata

Represent reading-only, WSL, VM, Mac plus VM, native Linux, and remote routes with explicit limitations.

#### LNX-M005: Define lab risk and change metadata

Represent privilege, host, guest, disk, files, accounts, services, ports, reboot, network scope, rollback, and cleanup.

#### LNX-M006: Define bridge-path behavior

Create reusable recommended-preparation cards with direct links and no access gate.

#### LNX-M007: Define content-source records

Add source type, upstream URL, reviewed version, review date, volatile-claim flags, license, and reviewer.

#### LNX-M008: Define credential evidence levels

Separate completion, path completion, applied skill, and professional certificate claims.

#### LNX-M009: Define original character and visual guide

Approve Rin Calder's role, language, appearance, accessibility behavior, and prohibited borrowed elements.

#### LNX-M010: Build curriculum validation

Fail a build for duplicate IDs, missing definitions, missing bridge targets, unsafe lab metadata, broken routes, missing source dates, and unexplained abbreviations.

### Phase LNX-B: Navigation and teaching surfaces

#### LNX-M011: Add the Linux school landing page

Show goals, learning paths, environment choices, time estimates, and current credentials without a marketing hero.

#### LNX-M012: Add path pages

Show course sequence, alternate routes, capstone, recommended preparation, and **Start now**.

#### LNX-M013: Add generic course pages

Show outcomes, modules, lab requirements, bridge links, review version, and exact bookmarkable routes.

#### LNX-M014: Add reading-first unit pages

Support definitions, diagrams, examples, comparisons, optional detail, sources, breaks, and navigation.

#### LNX-M015: Build breadcrumbs and resume behavior

Preserve exact school, path, course, module, and unit location through refresh, Back, Forward, and shared links.

#### LNX-M016: Build the filesystem atlas

Create the complete accessible directory-tree visual and text equivalent.

#### LNX-M017: Build the service anatomy visual

Connect executable, configuration, state, logs, runtime state, content, account, and network listener.

#### LNX-M018: Build comparison visuals

Add Windows and Linux path, service, package, account, and storage comparisons with explicit analogy limits.

#### LNX-M019: Build the evidence panel

Standardize observation, interpretation, next check, change, verification, and rollback.

#### LNX-M020: Complete accessibility gate

Verify keyboard, screen reader, reduced motion, contrast, narrow layout, text alternatives, and 200 percent zoom.

### Phase LNX-C: Safe access release

#### LNX-M021: Author LNX-001 and LNX-002

Release host versus guest, safety boundaries, and access-route selection.

#### LNX-M022: Author WSL route

Release current, version-tested WSL installation, inspection, backup, export, and removal guidance.

#### LNX-M023: Author virtual-machine route

Release version-tested VM creation, NAT, snapshot, restore, clone, and deletion labs.

#### LNX-M024: Author macOS bridge

Explain Unix similarities, Linux differences, architecture, terminal, and VM routes.

#### LNX-M025: Release access capstone

Require environment map, recovery proof, and cleanup proof.

#### LNX-M026: Run Windows access review

Complete a beginner walkthrough on supported Windows editions and record unsupported cases.

#### LNX-M027: Run Intel and Apple Silicon Mac review

Validate architecture-specific instructions separately.

#### LNX-M028: Run Linux-host review

Verify that lab instructions cannot accidentally target the host when a guest is required.

### Phase LNX-D: Context, desktop, and shell release

#### LNX-M029: Author Linux history course set

Publish the Unix, GNU, Linux, distribution, and community story using primary sources.

#### LNX-M030: Author adoption decision course

Publish balanced organization scenarios with pilot and rollback decisions.

#### LNX-M031: Author distribution selection course

Cover governance, family, release model, workload, support, and specialist-system cautions.

#### LNX-M032: Author desktop course set

Publish navigation, files, applications, communication, accessibility, privacy, and recovery.

#### LNX-M033: Author shell foundations

Publish prompt, command, path, file, stream, pipeline, search, and help courses.

#### LNX-M034: Release command-anatomy component

Make every token inspectable and explain prompt versus typed input.

#### LNX-M035: Release desktop and shell capstones

Verify ordinary daily use, recovery, read-only investigation, and explainability.

### Phase LNX-E: Filesystem, accounts, and security release

#### LNX-M036: Author root and essential directories

Publish `/`, `/bin`, `/sbin`, `/lib`, `/boot`, `/dev`, `/etc`, `/home`, `/root`, `/tmp`, and `/run`.

#### LNX-M037: Author `/usr` and merge history

Explain package-owned software, local administration, shared data, and modern merged layouts.

#### LNX-M038: Author `/var` deeply

Explain persistent state, logs, cache, queues, temporary persistence, growth, cleanup, and backup.

#### LNX-M039: Author virtual and mounted paths

Publish `/proc`, `/sys`, `/srv`, `/media`, `/mnt`, containers, and distribution variations.

#### LNX-M040: Author accounts and permissions

Publish identities, groups, modes, ownership, umask, shared directories, ACLs, and service accounts.

#### LNX-M041: Author administrator and host-security courses

Publish sudo scope, updates, service exposure, firewall, access controls, logs, backups, and exceptions.

#### LNX-M042: Release filesystem and security capstones

Require a service data map and verified least-privilege baseline.

### Phase LNX-F: Services, storage, and recovery release

#### LNX-M043: Author package and process courses

Publish repository trust, package formats, processes, jobs, signals, and environments.

#### LNX-M044: Author service and log courses

Publish systemd, timers, dependencies, journals, rotation, retention, and privacy.

#### LNX-M045: Author storage-stack courses

Publish device, partition, encryption, volume, filesystem, mount, and space concepts.

#### LNX-M046: Author boot and rescue courses

Publish firmware-to-login timeline, console access, boot evidence, rescue, rollback, and rebuild.

#### LNX-M047: Author backup and restore courses

Require actual restores and metadata verification rather than backup-command completion.

#### LNX-M048: Release services and recovery capstones

Require clean service ownership and one proven restore.

### Phase LNX-G: Networking, gaming, and migration release

#### LNX-M049: Author Linux host networking

Publish interfaces, addresses, routes, DNS, sockets, troubleshooting, firewall, namespaces, and bridges.

#### LNX-M050: Connect to Networking school

Add exact concept bridges for addressing, routing, DNS, TCP, IPv6, VPNs, firewalls, and BGP.

#### LNX-M051: Author Linux gaming courses

Publish graphics, drivers, compatibility layers, SteamOS, performance, controllers, audio, and evidence limits.

#### LNX-M052: Author Windows migration inventory

Publish application, data, account, hardware, accessibility, game, and recovery inventories.

#### LNX-M053: Author migration pilots

Publish VM, live-session, spare-device, dual-boot, native-install, verification, and rollback paths.

#### LNX-M054: Release migration and gaming capstones

Accept evidence-based decisions to coexist, defer, remain on Windows, or migrate.

### Phase LNX-H: Server and automation release

#### LNX-M055: Author server planning and installation

Publish workload, threat, support, resource, private installation, baseline, and console access.

#### LNX-M056: Author SSH and private service operation

Publish host identity, keys, rotation, services, bind addresses, file transfer, and lockout recovery.

#### LNX-M057: Author maintenance and reliability

Publish patching, monitoring, capacity, backup, update testing, incident notes, and rebuild.

#### LNX-M058: Author shell automation

Publish scripts, validation, dry run, temporary state, failure, cleanup, idempotence, and secrets boundaries.

#### LNX-M059: Author containers and configuration management

Publish namespaces, cgroups, rootless containers, images, volumes, networks, desired state, drift, and rollback.

#### LNX-M060: Release private-server automation capstone

Require reproducible deployment, repeat-run safety, visible failure, protected data, and complete cleanup.

### Phase LNX-I: Troubleshooting and advanced release

#### LNX-M061: Author the evidence-led troubleshooting method

Publish the common symptom, scope, hypothesis, check, change, verification, and follow-up pattern.

#### LNX-M062: Author resource and storage incidents

Publish CPU, memory, I/O, space, inode, mount, and process-pressure cases.

#### LNX-M063: Author service and network incidents

Publish service, permission, DNS, route, firewall, TLS, and dependency cases.

#### LNX-M064: Author observability and capacity

Publish metrics, logs, traces, events, baselines, thresholds, retention, and alert-quality lessons.

#### LNX-M065: Author kernel and user-space courses

Publish system calls, memory, scheduling, devices, modules, tracing, and interface-stability concepts.

#### LNX-M066: Author fleet and platform courses

Publish lifecycle, patch rings, drift, evidence, failure domains, service objectives, and decommissioning.

#### LNX-M067: Release troubleshooting and fleet capstones

Require an incident report and a maintainable fleet design.

### Phase LNX-J: Credentials and durable operation

#### LNX-M068: Release completion records

Issue versioned completion records without overstating skill verification.

#### LNX-M069: Pilot the first three applied skills

Pilot environment recovery, filesystem explanation, and service operation with published rubrics.

#### LNX-M070: Pilot security and recovery applied skills

Pilot host baseline, backup restore, and troubleshooting assessments.

#### LNX-M071: Pilot migration and gaming applied skills

Verify that evidence-based deferral or retention of Windows can earn full credit.

#### LNX-M072: Pilot server and automation applied skills

Require private service operation, recovery, reproducibility, and cleanup.

#### LNX-M073: Establish independent capstone review

Train reviewers, calibrate rubrics, measure disagreement, and expose review level on credentials.

#### LNX-M074: Launch Linux Desktop Practitioner

Launch only after assessment reliability, privacy, accessibility, and verification tests pass.

#### LNX-M075: Launch Linux System Administrator

Launch only after private-server, security, storage, networking, and incident assessments are stable.

#### LNX-M076: Launch Linux Systems Engineer

Launch only after advanced automation, fleet, and independent-review requirements are stable.

#### LNX-M077: Establish content maintenance rotation

Assign owners, review cadence, version retirement, lab rebuild, and security update responsibilities.

#### LNX-M078: Establish learner outcome review

Measure where learners stop, what they misunderstand, lab failure causes, accessibility barriers, and credential reliability without collecting private lab content.

## Acceptance criteria

### Curriculum completeness

- All 15 paths have approved outcomes, course maps, exercises, labs, capstones, bridge paths, source registers, and maintenance owners.
- Every first-use term has a plain definition, reason, example, misconception, observation, and retrieval item.
- History and design context are present in every major path, not isolated in one introductory article.
- Linux usage includes desktop, development, local models, servers, networking, gaming, security, embedded concepts, cloud concepts, containers, and fleet operation.
- Distribution guidance covers governance, release model, support, workload fit, and drawbacks.
- The filesystem atlas covers every path named in this blueprint and explains modern variations.
- The Windows migration route includes inventory, backup, recovery, pilot, verification, coexistence, and rollback.

### Open-access behavior

- Every course and unit can be opened directly without completing another course.
- Every course page has **Start now**.
- Recommended preparation is visibly advisory.
- Every recommendation provides exact concept links and a short bridge route.
- Refresh, Back, Forward, and shared URLs preserve the learner's location.
- Progress in one path never hides another path.

### Lab safety

- Every lab declares host, guest, user, privilege, target, network, storage, changes, stop conditions, rollback, cleanup, and evidence.
- All destructive storage and boot labs use disposable virtual devices or machines.
- All security and networking labs are private and isolated.
- No lab instructs a learner to attack, scan, intercept, or disrupt a third party.
- No lab package contains secrets or unverified remote-install pipelines.
- Every beginner lab has a tested restore or rebuild route.
- Windows, macOS Intel, macOS Apple Silicon, Linux host, WSL, and VM support claims are separately verified where declared.
- A working export or image is not treated as proof of native runtime behavior.

### Teaching quality

- Beginner review confirms that the first two paths assume no shell or virtualization knowledge.
- Commands identify prompt, account, environment, reads, changes, expected result, stop conditions, and undo.
- Wrong answers receive a specific explanation and another attempt.
- Exercises test reasoning, interpretation, and recovery rather than trivia.
- Long courses have explicit stopping points and recap units.
- No course uses a theme or character in a way that obscures the technical idea.
- Rin Calder remains an original supporting guide with no borrowed names, quotations, lore, visual identifiers, or story beats.

### Visual and accessibility quality

- The filesystem atlas, service map, boot timeline, permission lens, storage stack, and comparison visuals have full text equivalents.
- All learning pages pass keyboard, screen-reader, contrast, reduced-motion, narrow-screen, and 200 percent zoom review.
- No required information depends on color, hover, animation, sound, or voice.
- Lesson content receives most of the page area.
- A learner can print or download a clean text version.

### Evidence and accuracy

- Technical behavior is sourced primarily from standards and current upstream or distribution documentation.
- Volatile claims have a visible review date.
- Commands and expected output are tested against the exact declared environment.
- Adoption claims define workload and source rather than saying companies are simply moving to Linux.
- Distribution recommendations state tradeoffs and do not claim one universal best choice.
- Gaming compatibility statements are dated and distinguish community reports from vendor support.
- Security material states the authorization boundary before tool use.

### Credentials

- Completion, applied skill, and professional certificate claims are visibly distinct.
- Assessment skill blueprints and rubrics are public.
- Protected answers never enter browser bundles.
- Evidence collection is minimal, disclosed, and redacted.
- Public credential verification is opt-in.
- Credential pages state content version, assessment version, issue date, evidence level, reviewer level, and limitations.
- A credential is not issued solely because every page was opened.
- Automated evidence validation does not claim authorship or legal identity.

## Recommended first release slice

The first release should be large enough to help a real beginner but small enough to review carefully:

1. LNX-001 through LNX-005;
2. LNX-101 through LNX-105;
3. LNX-201 through LNX-205;
4. LNX-301 through LNX-306;
5. LNX-401 through LNX-406;
6. filesystem atlas, service map, boot timeline, and Windows comparison visuals;
7. at least 45 guided labs;
8. five path capstones;
9. completion records only;
10. no professional certificate claim yet.

The second release adds accounts, permissions, security, packages, processes, services, logs, storage, boot, backups, and recovery.

The third release adds Linux host networking, gaming, Windows migration, and the first applied-skill pilots.

The fourth release adds server operation, automation, containers, troubleshooting, internals, fleet work, and broader certificates after their assessment evidence is ready.

Future course plans may appear on a public academy roadmap. They do not appear as locked or coming-soon course cards. A course enters the catalog when it has enough reviewed teaching material to be useful, and every published route opens directly from that point forward.

## Definition of success

This curriculum succeeds when a learner can say:

- I know what Linux is and why people choose it.
- I can try it without erasing my current computer.
- I know what the main directories mean and why they exist.
- I can read a command before I run it.
- I can find a program, its configuration, its state, and its logs.
- I can explain users, groups, permissions, and administrator access.
- I can install, inspect, update, stop, start, back up, restore, and remove a service.
- I can troubleshoot from evidence rather than guessing.
- I can decide whether Linux fits my desktop, gaming, server, networking, security, programming, or local-model needs.
- I can plan a Windows migration and also recognize when not to migrate.
- I can recover from mistakes in a disposable environment.
- I understand what my credential verifies and what it does not.

The deeper success is that Linux stops looking like an unexplained wall of paths and commands. It becomes a system the learner can inspect, reason about, change carefully, verify, and repair.
