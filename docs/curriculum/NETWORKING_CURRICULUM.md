# Open Networking Workshop Curriculum Blueprint

<!-- markdownlint-disable MD013 MD024 -->

- **Product:** SeePoundCoffeePie
- **Curriculum family:** Networking
- **Audience:** Absolute beginners through practicing network engineers
- **Access model:** Every published course, module, unit, lab, refresher, and capstone is visible and available from the first visit
- **Recorded:** 2026-08-30
- **Status:** Curriculum blueprint, not a claim of implemented or deployed units

This document sometimes uses `lesson` as the plain-language interface label for an academy `unit`. A unit is the stable, bookmarkable teaching page under one module. It is not another layer in the curriculum hierarchy.

## Product promise

The Open Networking Workshop helps a learner move from “the internet is a box I connect to” to “I can explain, build, observe, troubleshoot, secure, automate, and design a network.” It begins before command lines, binary, or protocol names. It eventually reaches enterprise and cloud design, BGP policy, resilience, observability, and defensible operations.

The course teaches causes and tradeoffs, not a list of acronyms. A learner should understand why packet switching replaced assumptions inherited from circuit-switched systems, why Ethernet and Wi-Fi arbitrate access differently, why DNS is distributed, why DHCP exists, why IPv4 subnetting and NAT became common, why IPv6 changes address planning, why routers exchange only selected knowledge, and why BGP is a policy protocol rather than a shortest-path calculator.

At the end, a learner should be able to:

- draw and explain a packet journey from an application to a remote service and back;
- distinguish a physical, link, network, transport, name-resolution, and application problem;
- configure and verify small Ethernet, Wi-Fi, IPv4, IPv6, routed, segmented, and encrypted networks;
- read routing tables, address plans, DNS answers, DHCP leases, socket state, firewall policy, and packet captures;
- troubleshoot with evidence instead of trying random commands;
- automate a bounded network change with validation and rollback;
- reason about cloud, container, hybrid, and internet routing without treating vendor diagrams as magic;
- design for security, accessibility, capacity, failure, observability, recovery, cost, and human operation;
- produce a portfolio of sanitized diagrams, decision records, configurations, tests, and incident reports;
- choose an optional certification bridge without turning the curriculum into exam trivia.

## Non-negotiable access contract

Networking has dependencies, but this curriculum has no locked doors.

- Every course card is open from the beginning.
- Every lesson has a stable, bookmarkable route.
- No completion record, quiz score, account, subscription, credential, or previous course is required to open later material.
- “Helpful before this lesson” is information, not enforcement.
- The optional Preparation Bench is never a prerequisite.
- A learner may follow the recommended order, jump to a work problem, revisit one concept, or begin with a capstone and work backward.
- Starting advanced material does not erase progress or silently redirect the learner into foundations.
- Hints, worked examples, context summaries, glossaries, and reference pages remain available during practice and assessment.
- Challenge work is optional and never required to see the next lesson.
- Vendor-specific overlays are optional. The complete conceptual and lab path works with open protocols and freely available operating-system tools.

### Three entry choices for harder material

Every applied or advanced course, module, lab, and capstone begins with the same three visible choices:

1. **Start now.** Open the material immediately. New terms are defined in place, and the first activity is diagnostic rather than punitive.
2. **Review refresher.** Open a short, targeted practice set covering only the ideas used here. Completing it is optional and does not change access.
3. **Read short context summary.** Open a one-page explanation of the packet journey, vocabulary, assumptions, and expected lab shape, then continue when ready.

The interface must never rename these choices to imply a gate. “Required prerequisite,” “unlock,” “you are not ready,” and equivalent blocking language do not belong in this curriculum.

## The learner we design for

The primary learner may:

- have never configured a network;
- know Wi-Fi only as the icon used to get online;
- be unsure what a file, terminal, adapter, address, port, packet, process, or virtual machine is;
- use Windows, macOS, Linux, a school-managed computer, a low-power computer, or only a browser;
- be unable to install a hypervisor, capture driver, or vendor simulator;
- be anxious about disconnecting a household or workplace;
- use a keyboard, screen reader, magnification, voice control, captions, or reduced-motion settings;
- want a help-desk foundation, a network-engineering career, cloud context, security depth, or enough understanding to operate their own systems.

The curriculum does not assume access to commercial switches, routers, wireless controllers, cloud credits, multiple computers, or a home router the learner is allowed to change.

## Original recurring mentor theme

Mira Patch is the course-specific Network Steward. She is an original character who runs a practical community technology workshop. Her tools are a paper network map, a cable labeler, a small tester, and a change notebook. She is calm, curious, and willing to say “we do not know yet.” She never uses fear, secret-agent framing, or humiliation.

Mira appears in four recurring lesson elements:

- **Map before change:** record the known path, owner, expected result, and rollback before touching configuration.
- **Bench note:** explain why a protocol or operational habit exists and what problem its designers were trying to solve.
- **Evidence check:** compare an observation with a prediction before choosing the next action.
- **Leave it safer:** restore the lab, remove temporary access, save a sanitized artifact, and record what remains uncertain.

The visual direction is legally and creatively distinct: clean line art, ordinary workshop clothing, labeled diagrams, muted blue and warm amber accents, and no masks, hoods, neon “hacker” rooms, franchise uniforms, licensed symbols, copied catchphrases, or borrowed lore. The mentor supports the lesson without turning networking into a role-playing story.

## Teaching model

### The unit rhythm

Every teaching unit uses this sequence:

1. **Orient.** State the real problem in plain language.
2. **Trace the history.** Explain what came before, what failed to scale, and why the current mechanism was adopted.
3. **Name the pieces.** Define every new term, field, symbol, unit, and command before relying on it.
4. **Predict.** Ask what should happen and make clear that the prediction is practice, not proof of prior knowledge.
5. **Observe.** Inspect a diagram, table, host command, packet capture, log, or simulated event.
6. **Build or change.** Make one bounded change in a learner-controlled environment.
7. **Verify.** Test both the intended success and one safe failure condition.
8. **Explain.** Describe the path and evidence without hiding behind acronyms.
9. **Restore.** Roll back temporary state or destroy the disposable lab.
10. **Retrieve later.** Revisit the idea through a different scenario.

### Understanding before memorization

Numbers and names matter in operations, but memory follows meaning.

- Port numbers are introduced by watching a client choose a service endpoint, not by assigning a port-number list.
- The OSI model is taught as a useful diagnostic and communication model, then compared honestly with the TCP/IP stack and real implementations.
- Binary is introduced only when it solves an address-boundary question. Learners may use a visual bit ruler while building intuition.
- Subnetting begins with ownership and reachability questions, then uses arithmetic, binary, and CIDR notation as alternate views of the same boundary.
- Protocol fields are tied to decisions a host or network device must make.
- Timers, metrics, priorities, and path attributes are taught through convergence and policy outcomes.
- Vendor commands are examples of expressing a model. They are never presented as the model itself.

### Evidence levels

Progress can record several kinds of evidence without using one quiz as a gate:

| Evidence | Learner demonstration |
| --- | --- |
| Recognize | Identify a component, field, or symptom with context available |
| Explain | Describe why it exists and what decision it supports |
| Trace | Follow state or a packet across layers and devices |
| Configure | Make a bounded change from a reviewed plan |
| Verify | Prove intended and unintended behavior with suitable observations |
| Diagnose | Localize a fault and rule out alternatives with evidence |
| Design | Defend a choice, tradeoff, failure model, and rollback |
| Teach back | Explain the idea to a new learner without unexplained jargon |

## Defensive lab and ethics contract

All hands-on work is defensive, learner-controlled, reversible, and scoped to systems the learner owns or has explicit permission to administer.

### Allowed targets

- the learner’s own loopback interface;
- disposable processes and containers started for the lesson;
- isolated virtual machines and network namespaces;
- a host-only or internal virtual network created for the lab;
- a spare, factory-reset device the learner owns and can recover;
- a cloud account, project, subscription, or lab tenant owned by the learner, with budget controls and explicit cleanup;
- documentation address ranges and reserved names used only inside simulations;
- an instructor-provided sandbox that states its authorization boundary.

### Default lab addressing

Examples use ranges intended for private use or documentation:

- RFC 1918 private IPv4 ranges for isolated labs;
- `192.0.2.0/24`, `198.51.100.0/24`, and `203.0.113.0/24` for written examples;
- `2001:db8::/32` for written IPv6 examples;
- `.test`, `example.com`, `example.net`, and `example.org` for names;
- private autonomous system numbers for isolated BGP labs.

No lesson instructs a learner to announce documentation prefixes, private autonomous system numbers, or lab routes to the public internet.

### Prohibited or tightly bounded activity

- Do not scan public addresses, neighboring devices, school networks, workplace networks, hotel networks, or another person’s wireless network.
- Do not capture another person’s traffic or enable promiscuous monitoring on a shared network.
- Do not perform deauthentication, evil-twin, credential interception, ARP poisoning, DNS poisoning, route hijacking, denial of service, or password attacks on a real network.
- Do not bypass an organization’s access controls, monitoring, filtering, or acceptable-use policy.
- Do not bridge an intentionally vulnerable lab to a physical LAN or the public internet.
- Do not alter a household gateway unless the learner owns it, understands who depends on it, exports or records the prior state, and has a recovery path.
- Do not expose a cloud lab publicly unless the lesson explicitly requires a temporary endpoint and supplies an allowlist, time limit, verification, and deletion step.
- Do not upload packet captures, configuration files, tokens, certificates, internal names, public addresses, or customer data as course evidence.

Security lessons may explain attacks so a learner can recognize and prevent them. Any demonstration uses generated traffic, a browser simulation, or an isolated lab with a clearly stated defensive objective. The course does not provide an operational playbook for harming third-party systems.

### Change safety checklist

Before any configuration lab, the learner records:

1. What system do I own or have permission to change?
2. Who or what could lose connectivity?
3. What is the current state?
4. What single change am I making?
5. How will I know it worked?
6. How will I know it caused harm?
7. How will I restore the old state if the network path disappears?
8. What temporary files, credentials, rules, routes, interfaces, or cloud resources must be removed?

## Accessible practice routes

Every practical activity declares one required learning outcome and offers equivalent routes. A learner is assessed on the evidence and explanation, not on owning a particular platform. Browser simulations are L0 interactive exercises, not native labs, and the interface labels them accordingly.

| Route | Best for | Default tools | Important limits |
| --- | --- | --- | --- |
| Browser-only interactive exercise | Locked-down devices, first exposure, screen-reader-friendly packet traces | Keyboard-operable topology, text event log, CIDR ruler, route table, DNS and DHCP simulators | This is an L0 exercise, not a native lab; simulation must label where real implementations vary |
| Windows native | Learners using Windows without WSL or admin rights | Settings, Task Manager, `ipconfig`, `ping`, `tracert`, `arp`, `route print`, `netstat`, `nslookup`, `Resolve-DnsName`, `Test-NetConnection`, `Get-NetIPConfiguration`, `Get-NetRoute` | Packet capture drivers and Hyper-V may require admin rights; always provide a no-admin alternative |
| Windows with WSL 2 | Linux command practice on Windows | `ip`, `ss`, `ping`, `tracepath`, `dig`, `curl`, Python, Linux services | WSL 2 usually sits behind a virtualized NAT path; it does not faithfully expose every Windows LAN broadcast or Layer 2 behavior |
| macOS native | Host observation and small client/server labs | System Settings, `networksetup`, `ifconfig`, `route`, `netstat`, `scutil --dns`, `dig`, `ping`, `traceroute`, `nc`, `lsof`, `tcpdump` | Some commands require `sudo`; the unit provides sample output or a browser exercise when elevation is unavailable |
| Linux native | Complete host, namespace, firewall, routing, and automation labs | `iproute2`, `ss`, `resolvectl`, `dig`, `curl`, `nc`, `tcpdump`, `ethtool`, `bridge`, `nft`, network namespaces | Distribution network managers differ; lessons identify NetworkManager, systemd-networkd, Netplan, and direct `ip` changes separately |
| Isolated Linux VM | Consistent labs on Windows, macOS, or Linux | UTM, Hyper-V, VirtualBox, VMware, or another trusted hypervisor with a course image | Use host-only or internal networking by default; snapshots and console access are required before routing or firewall changes |
| Container or namespace topology | Fast multi-node labs with low resource use | Linux namespaces, containers, bridges, FRRouting, optional Containerlab | Containers share a host kernel and are not the same boundary as VMs; use a Linux VM on platforms where host networking is abstracted |
| Physical practice kit | Cabling, link state, switch ports, access points, and recovery | Spare switch, access point, cables, labels, inexpensive tester | Never require purchases; use only owned spare equipment disconnected from a production network |
| Learner-owned cloud sandbox | VPC/VNet concepts, managed routing, private services, load balancers, hybrid design | One provider’s free or low-cost account, CLI optional | Begin with budget alerts, least privilege, no real data, no broad inbound access, and an itemized destroy checklist |

### Shared lab-standard integration

Published labs follow the [Lab, assessment, and credential standard](LAB_ASSESSMENT_CREDENTIAL_STANDARD.md). The website teaches, simulates, packages, and records learning. It does not run native commands, start virtual machines, scan a network, or apply a configuration on the learner’s computer. Native procedures run only after the learner deliberately downloads or follows them in a controlled environment.

Networking routes map to the shared access lanes this way:

| Networking route | Shared manifest lane | Normal risk class |
| --- | --- | --- |
| Browser simulation, prepared trace, or planning exercise | `reading-only` | L0 |
| Windows native observation or bounded local practice | `windows-native` | L1 or L2 |
| WSL practice | `windows-wsl` | L1 or L2 |
| Linux VM on Windows | `windows-vm` | L1 through L4 according to the change |
| macOS host observation | `macos-native` | L1 or bounded L2 |
| Linux VM on macOS | `macos-linux-vm` | L1 through L4 according to the change |
| Linux host or namespace lab | `linux-native` | L1 through L4 according to the change |
| Disposable Linux VM | `linux-vm` | L1 through L4 according to the change |
| Learner-owned remote or cloud environment | `learner-remote-server` or `learner-selected-external-compute` | L1 through L4 according to the change |
| School or employer-provided authorized sandbox | `institution-managed-lab` | Declared by the lab owner |

L0 is reading and planning. L1 is inspection. L2 is a disposable user-space change. L3 is a controlled system change with recovery. L4 is an isolated advanced infrastructure or security simulation with explicit scope. A learner always has an L0 or L1 route even when an applied credential separately requires higher-risk lab evidence.

### Accessibility requirements for every lab

- Every topology has a text equivalent listing nodes, interfaces, links, addresses, roles, and direction of traffic.
- Animations have pause, step, restart, and reduced-motion modes.
- Packet fields and cable states are never distinguished by color alone.
- Command examples are copyable text, not screenshots.
- Expected output includes a plain-language explanation and a compact machine-readable table where practical.
- Interactive diagrams are fully keyboard operable and expose relationships to assistive technology.
- Timed convergence demonstrations can be slowed, stepped, or read as an event transcript.
- Packet captures include a prepared, sanitized fixture so capture permissions are never required to learn analysis.
- No activity records voice or requires a microphone. Optional video, if later approved, includes captions and a complete text equivalent.
- Learners may submit a written trace, structured checklist, or accessible text-described diagram for equivalent evidence.
- No lab depends solely on dragging cables, positioning nodes, or reading tiny monospace text.

## Recommended map, not a lock sequence

In the academy hierarchy, each value in the first column is a suggested learning path. N1 through N15 are courses inside those paths; N1.1-style items are modules; and their learner-facing lessons compile to stable units. The same course may appear in more than one suggested path without being duplicated.

The tables below are authoring inventories. Learner pages render one readable unit at a time and do not reproduce a dense four-column table at narrow widths or 200 percent zoom.

| Learning path | Course | Main outcome | Typical practice range |
| --- | --- | --- | --- |
| Optional preparation | P0. Preparation Bench | Files, terminals, units, diagrams, VMs, and safe change habits | 3 to 8 hours, only where useful |
| Foundations | N1. Networks From Zero | Explain a complete packet journey without unexplained jargon | 10 to 16 hours |
| Foundations | N2. Ethernet and Switching | Build and diagnose a small switched LAN | 14 to 22 hours |
| Foundations | N3. Wi-Fi and Radio Networks | Plan, secure, and troubleshoot a small wireless LAN | 12 to 20 hours |
| Addressing and services | N4. IPv4 and Subnetting | Create and defend an IPv4 address plan | 18 to 30 hours |
| Addressing and services | N5. Transport, DNS, DHCP, and Core Services | Trace how applications find and reach services | 18 to 28 hours |
| Connectivity and control | N6. Routing and WANs | Configure and explain routed paths and convergence | 20 to 32 hours |
| Connectivity and control | N7. VLANs, Firewalls, and VPNs | Segment and protect a network with testable policy | 22 to 36 hours |
| Modern addressing | N8. IPv6 in Practice | Operate and troubleshoot a dual-stack network | 16 to 28 hours |
| Systems operations | N9. Linux and Host Networking | Inspect and control the host network stack | 20 to 34 hours |
| Systems operations | N10. Troubleshooting and Packet Analysis | Diagnose faults through a repeatable evidence process | 24 to 40 hours |
| Programmability | N11. Network Automation | Make validated, reviewable, reversible changes | 22 to 38 hours |
| Platforms | N12. Cloud, Containers, and Hybrid Networks | Relate virtual networking to the same packet fundamentals | 24 to 42 hours |
| Internet routing | N13. Advanced Routing and BGP | Build policy-driven multi-AS routing in isolation | 26 to 46 hours |
| Architecture | N14. Resilience, Observability, Security, and Design | Design and operate a measurable, recoverable network | 28 to 50 hours |
| Portfolio | N15. Network Steward Studio | Complete integrated capstones and optional credential bridges | Flexible, project based |

Time ranges are planning aids, not deadlines. The interface does not show a countdown, overdue state, or pace warning.

## P0. Preparation Bench

This entire shelf is optional. Every later course includes the context needed to start without it.

| Module | Lessons and outcomes | Optional practice |
| --- | --- | --- |
| P0.1 Computers without mystery | Hardware, operating system, application, process, file, folder, memory, storage, adapter, and service | Label the pieces involved when a browser opens a page |
| P0.2 Terminal without fear | Prompt, command, option, argument, path, current directory, copy and paste, stopping a command, reading exit status | Run harmless identity and help commands on the chosen platform |
| P0.3 Numbers and units | Bits, bytes, decimal and binary prefixes, seconds, milliseconds, bandwidth, throughput, latency, and percentages | Compare file size, link rate, and transfer time without pretending they are identical |
| P0.4 Reading technical diagrams | Nodes, links, labels, legends, physical versus logical diagrams, and direction | Convert an inaccessible picture into a text topology |
| P0.5 Virtual lab basics | VM, snapshot, console, virtual adapter, NAT, host-only network, internal network, and safe shutdown | Create or inspect a disposable VM without bridging it to the LAN |
| P0.6 Change and evidence habits | Baseline, hypothesis, one change at a time, rollback, timestamp, and sanitized notes | Complete Mira’s change-safety checklist |

## N1. Networks From Zero

### Purpose

This course answers the first question: what actually happens when one program communicates with another? It uses a browser request, a local printer, a game session, and a voice call as contrasting examples.

### Entry choices

- **Start now:** begin with two devices and one message. No command line or binary is assumed.
- **Review refresher:** revisit processes, adapters, bits, bytes, and diagrams from the optional Preparation Bench.
- **Read short context summary:** read one page that defines endpoint, link, network, protocol, packet, client, server, and service.

| Module | Guiding ideas and historical reason | Core lessons | Evidence and lab |
| --- | --- | --- | --- |
| N1.1 Why networks exist | Sharing information and resources required agreed signals, addressing, timing, and error handling long before modern computers | Local versus remote, sender and receiver, shared rules, client and server roles, peer communication | Draw and narrate the path for a local file share and a public website |
| N1.2 Circuits and packets | Telephone networks reserved a path. Computer traffic is bursty, so packet switching allowed links to be shared and paths to recover | Circuit switching, packet switching, store and forward, best effort, delay, loss, reordering | Step through a browser simulation where packets take two paths |
| N1.3 Network pieces | Different devices make different decisions | Host, interface, cable, radio, access point, switch, router, modem, firewall, name server, service | Match each device to the information it examines and the decision it makes |
| N1.4 Layers as working agreements | Layering let technologies evolve without redesigning every application. The OSI model became a shared vocabulary; the internet stack became the deployed system | Physical, link, internet/network, transport, application; service versus implementation; encapsulation | Expand and collapse one message through a text-accessible encapsulation view |
| N1.5 A packet journey | Applications do not send directly to “the internet”; hosts resolve names, choose routes, frame packets, and use local links | Name, address, route, next hop, frame, packet, segment/datagram, response | Predict and then inspect the events for opening `https://example.com` |
| N1.6 Performance is several things | “Fast” can mean low delay, high capacity, little loss, or stable timing | Latency, bandwidth, throughput, goodput, loss, jitter, queueing | Compare three links and choose one for backup, gaming, and voice with reasons |
| N1.7 Foundation studio | A correct map is more useful than a memorized acronym list | Physical and logical maps, assumptions, unknowns, evidence | Produce a plain-language packet journey and a glossary for a new learner |

## N2. Ethernet and Switching

### Entry choices

- **Start now:** open a simulated three-host LAN and watch the first frame.
- **Review refresher:** revisit links, frames, addresses, encapsulation, and shared-media access.
- **Read short context summary:** read how Ethernet moved from shared coaxial cable and collisions to switched full-duplex links while preserving the frame model.

| Module | Guiding ideas and historical reason | Core lessons | Evidence and lab |
| --- | --- | --- | --- |
| N2.1 Signals and media | A link must turn bits into physical changes that survive distance and interference | Copper pairs, fiber, radio contrast, connectors, duplex, speed negotiation, attenuation, electromagnetic interference, transceivers | Select media for four environments and explain distance, interference, cost, and recovery tradeoffs |
| N2.2 Ethernet’s shared beginning | Early Ethernet shared a collision domain and used CSMA/CD. Switched full-duplex Ethernet removed collisions on ordinary links but kept familiar framing | Shared bus, hubs, collisions, CSMA/CD history, point-to-point switching, duplex mismatch | Compare hub and switch event transcripts; diagnose a duplex symptom from counters |
| N2.3 Frames and MAC addresses | A local link needs delivery identifiers independent of routable location | Preamble at a conceptual level, source and destination MAC, EtherType, payload, frame check sequence, unicast, multicast, broadcast | Annotate a sanitized Ethernet frame and explain which fields change at a router |
| N2.4 How a switch learns | Bridges learned source locations so every frame did not need to reach every port | MAC address table, learning, forwarding, flooding, filtering, aging, unknown unicast | Build a switch table by stepping through six frames; predict each egress port |
| N2.5 Broadcast domains and loops | Redundant Layer 2 paths improve availability but uncontrolled loops duplicate frames indefinitely | Collision versus broadcast domain, loop symptoms, bridge protocol data units, Spanning Tree purpose, root and blocked paths, convergence | Create a safe simulated loop, read the storm transcript, then choose a stable tree |
| N2.6 Links between switches | Larger LANs need clear link roles, aggregation, monitoring, and fault boundaries | Access and infrastructure links, link aggregation concept, LACP purpose, MTU, LLDP, interface counters | Inspect two-switch topology data and identify a bad cable, wrong speed, and oversubscribed uplink |
| N2.7 Switched LAN lab | Design should be verified from hosts and switches | Port plan, labels, management separation preview, rollback | Explore a three-switch browser simulation, or build the isolated topology in namespaces or owned lab gear; prove reachability, learning, and loop prevention in the selected route |

## N3. Wi-Fi and Radio Networks

### Entry choices

- **Start now:** begin with one client, one access point, and a channel map.
- **Review refresher:** revisit frames, shared media, interference, throughput, and access control.
- **Read short context summary:** read why radios cannot reliably detect collisions while transmitting, why Wi-Fi uses collision avoidance, and why signal strength alone does not prove capacity or quality.

| Module | Guiding ideas and historical reason | Core lessons | Evidence and lab |
| --- | --- | --- | --- |
| N3.1 Radio without magic | Wireless links encode data onto shared radio spectrum that is affected by distance, materials, noise, and competing transmitters | Frequency, channel, width, signal, noise, signal-to-noise ratio, attenuation, reflection, interference | Read an accessible floor description and predict weak or noisy areas |
| N3.2 Wi-Fi access to shared airtime | A wireless station may not hear every other station, so Wi-Fi coordinates and avoids collisions instead of using Ethernet’s old collision detection | CSMA/CA, listen and wait, random backoff, acknowledgments, hidden nodes, airtime fairness | Step through two stations contending for airtime and explain why one slow client can consume time |
| N3.3 Joining a network | Discovery, authentication, association, and address configuration are separate events | SSID, BSSID, beacon, probe at a conceptual level, authentication, association, roaming, captive portal distinction | Order the events from selecting a network to reaching a named service |
| N3.4 Bands and channel plans | New bands and wider channels increase options but do not remove interference, regulation, or client constraints | 2.4, 5, and 6 GHz characteristics, non-overlapping plans, channel width, DFS concept, transmit power, regulatory domain | Create a small home or classroom channel plan from a provided scan fixture |
| N3.5 Wi-Fi security history | Open and WEP networks exposed traffic or weak keys. WPA generations improved encryption, authentication, and management-frame protection | Personal versus enterprise authentication, WPA2 and WPA3 concepts, 802.1X and RADIUS preview, protected management frames, guest isolation | Choose a secure configuration for a home, community room, and managed office; explain legacy-client tradeoffs |
| N3.6 Capacity, roaming, and design | Coverage, capacity, roaming, and reliability are different design targets | Cell size, minimum data rates concept, channel reuse, sticky clients, backhaul, mesh tradeoffs, controller-managed versus standalone | Place access points in a text-described venue and defend channel, power, and backhaul choices |
| N3.7 Wireless troubleshooting | The Wi-Fi icon hides many distinct failure stages | No radio, cannot join, cannot authenticate, no address, no route, DNS failure, interference, saturation | Diagnose six sanitized client and AP observations without touching a shared real network |

Real radio labs are passive and limited to the learner’s own network. Deauthentication, evil-twin, credential capture, and interference generation are outside the lab boundary.

## N4. IPv4 and Subnetting

### Entry choices

- **Start now:** use a visual address ruler and answer “local or through a router?” before doing arithmetic.
- **Review refresher:** revisit bits, place value, frames, broadcast domains, and next hops.
- **Read short context summary:** read how a best-effort internetwork needed globally meaningful addresses, how classful allocation wasted space, and how subnet masks and CIDR made address boundaries flexible.

| Module | Guiding ideas and historical reason | Core lessons | Evidence and lab |
| --- | --- | --- | --- |
| N4.1 What an IP address means | A MAC address identifies delivery on a link; an IP address identifies an interface’s location in an internetwork | IPv4 dotted decimal, interface addresses, network and host portions, source and destination, uniqueness within scope | Explain why moving a host can require a new IP address while its hardware address stays the same |
| N4.2 Masks before math tricks | A host needs a repeatable rule for deciding whether a destination is local | Mask as boundary, prefix length, bitwise AND with a visual overlay, network address, broadcast address, usable host convention | Decide local versus routed for ten address pairs using a bit ruler |
| N4.3 Binary that solves a problem | Binary matters because address boundaries are bit boundaries | Powers of two, octet conversion, boundary values, block size, prefix-to-mask conversion | Convert only the values needed for a set of real address plans, with tools available |
| N4.4 Subnetting by requirements | Subnetting separates ownership, policy, broadcast scope, and failure domains | Required subnets, required addresses, equal-size subnets, variable-length subnet masks, allocation order, growth space | Build a non-overlapping plan for a small organization and prove every boundary |
| N4.5 CIDR and aggregation | Classful routes grew badly. CIDR allowed allocation and routing by arbitrary prefixes and enabled aggregation | Classful history, CIDR, summarization, longest-prefix match preview, overlap, holes in an aggregate | Summarize a set of contiguous prefixes and identify when a summary would claim another owner’s space |
| N4.6 Neighbor resolution and ICMP | A host needs a link-layer destination for a local next hop and feedback when delivery fails | ARP request and reply, cache, default gateway resolution, ICMP echo, unreachable, time exceeded, Path MTU Discovery concept | Read an ARP table and packet trace; explain why ping can fail while an application works and the reverse |
| N4.7 Private space and NAT | IPv4 scarcity and administrative convenience drove private addressing and widespread translation, but NAT is not an encryption or trust boundary | Public and private scope, static and dynamic translation, port translation, state, inbound mapping, hairpinning concept, overlapping networks | Trace a translated flow in both directions and distinguish NAT from firewall policy |
| N4.8 Address plan studio | Address plans are operational documents, not one-time math answers | Inventory, DHCP ranges, static reservations, infrastructure ranges, growth, summaries, documentation | Produce a reviewed IPv4 plan, validation table, and change-safe migration sketch |

Subnet exercises always show the meaning of an answer. Speed drills and “magic number” tricks may be optional review tools, but they are not the teaching foundation.

## N5. Transport, DNS, DHCP, and Core Services

### Entry choices

- **Start now:** follow one application request from a process to a named service.
- **Review refresher:** revisit addressing, routes, packet loss, encapsulation, and client/server roles.
- **Read short context summary:** read how ports distinguish services, how TCP and UDP make different delivery promises, why a shared hosts file stopped scaling, and why automatic address configuration replaced repeated manual entry.

| Module | Guiding ideas and historical reason | Core lessons | Evidence and lab |
| --- | --- | --- | --- |
| N5.1 Processes, sockets, and ports | One host runs many communicating programs, so transport endpoints include addresses and port numbers | Client and server process, socket, listening, ephemeral port, service port, flow tuple, multiplexing | Match local socket output to a diagram and identify listener, client, and established flow |
| N5.2 UDP | Some applications value low overhead, timing, multicast support, or their own reliability logic | Datagram service, no handshake, loss and ordering responsibility, checksum, suitable and unsuitable uses | Compare generated DNS-like requests over a lossy simulation and state what the application must handle |
| N5.3 TCP | Applications needed a reusable reliable byte stream across an unreliable packet network | Three-way handshake, sequence and acknowledgment, retransmission, flow control, congestion control concept, orderly close, reset | Step through a sanitized TCP trace and localize a failed handshake, retransmission, and receiver limitation |
| N5.4 Modern transports and encryption context | Deployment constraints encouraged encrypted transports over UDP and user-space evolution | TLS purpose, certificate identity at a conceptual level, QUIC and HTTP/3 motivation, encryption versus reachability | Compare TCP plus TLS with QUIC without claiming one is always faster |
| N5.5 DNS as a distributed database | A single shared host-name file could not scale with the internet, so naming became hierarchical, delegated, cached, and distributed | Stub resolver, recursive resolver, root, top-level domain, authoritative server, zones, delegation, records, TTL, positive and negative caching | Trace a cold and warm lookup for `www.example.com`; identify which system is authoritative for each answer |
| N5.6 DNS operations and security | DNS failures often resemble network outages, and trust depends on knowing answer source and scope | A, AAAA, CNAME, MX, TXT, PTR, NS, SOA concepts, split-horizon DNS, forwarding, DNSSEC purpose, encrypted DNS tradeoffs | Use `dig` or `Resolve-DnsName` against public examples and a prepared fixture; diagnose stale cache and missing delegation |
| N5.7 DHCP | Manual address entry was repetitive and error prone. BOOTP and then DHCP added reusable, leased configuration | Discover, offer, request, acknowledgment, lease, renewal, relay, options, reservation, scope exhaustion, rogue-server risk | Step through the lease process and diagnose no offer, wrong option, duplicate address, and exhausted pool |
| N5.8 Time and service dependencies | Logs, certificates, authentication, leases, and distributed systems depend on trustworthy time | NTP purpose, strata concept, drift, monotonic versus wall time at a high level, safe time sources | Explain a certificate or log-correlation failure caused by time without changing a real system clock |
| N5.9 Service path studio | A working service requires several independent layers | Name lookup, route, transport, encryption, application response, cache | Build and verify a local HTTP service on loopback or an isolated lab, then diagnose five injected faults |

Port-number recall is reference practice. Assessment asks what a socket is doing, which side listens, what evidence proves the transport state, and whether the application actually succeeded.

## N6. Routing and WANs

### Entry choices

- **Start now:** inspect a three-row routing table and choose the most specific route.
- **Review refresher:** revisit prefixes, default gateways, ARP or neighbor resolution, ICMP, and packet lifetime.
- **Read short context summary:** read why routers forward from local tables, why static routes are useful but limited, and why dynamic protocols trade control, convergence, overhead, and scale.

| Module | Guiding ideas and historical reason | Core lessons | Evidence and lab |
| --- | --- | --- | --- |
| N6.1 Forwarding one packet | A router makes a local next-hop decision rather than planning the packet’s entire journey | Ingress, destination lookup, longest-prefix match, directly connected route, next hop, egress, TTL/hop limit, MTU | Walk a packet through three routers and update only the fields that actually change |
| N6.2 Reading routing tables | Multiple sources may offer routes, and selection needs a deterministic policy | Prefix, next hop, interface, metric, preference or administrative distance concept, recursive lookup, default route, discard route | Select active routes from a mixed table and explain ties and more-specific exceptions |
| N6.3 Static routing | Static routes are predictable and quiet but require human maintenance | Connected, static, floating static, summary, default, reachability tracking concept, black holes and loops | Configure or simulate a two-router path, remove a link, and verify both failure and rollback |
| N6.4 Dynamic routing families | Early distance-vector approaches exchanged reachability estimates; link-state approaches built a topology view; each carries different failure and scale behavior | Distance vector, count-to-infinity intuition, split horizon concept, link state, neighbors, flooding, shortest-path calculation, areas preview | Compare convergence event logs for a distance-vector and link-state topology |
| N6.5 OSPF in a small network | An open link-state protocol supports fast intra-domain routing and hierarchical scale | Router ID, neighbor states at a useful level, cost, designated router purpose, link-state database, SPF, area 0, passive interface, summarization concept | Build an isolated three-router OSPF lab with FRRouting or simulation; verify neighbor, route, failover, and recovery |
| N6.6 WAN service models | Organizations connect sites across providers with different ownership, guarantees, and encapsulation | Leased line history, broadband, Metro Ethernet, MPLS at a conceptual level, internet VPN, SD-WAN policy and overlay concept, last mile, demarcation | Choose connectivity for three branches and explain availability, control, cost, and observability |
| N6.7 Multicast and group delivery | Sending one copy to every receiver wastes capacity, while flooding reaches uninterested hosts. Multicast separates group membership from routed distribution | Broadcast, unicast, multicast, IGMP and MLD membership concepts, snooping, rendezvous and distribution trees, PIM at a conceptual level, source-specific multicast | Trace a generated group join and stream; diagnose an unwanted flood and a missing routed group without touching a shared network |
| N6.8 Performance and path behavior | Forward and return paths can differ, and queueing or MTU faults can break only some traffic | Asymmetric routing, traceroute limits, MTU and MSS, fragmentation history, queueing, classification, marking, shaping versus policing, quality-of-service purpose | Diagnose a prepared path-MTU black hole and a saturated WAN queue from packet and metric evidence |
| N6.9 Routed network studio | Routing design combines address ownership, failure, and operations | Address plan, static and dynamic boundary, summaries, multicast needs, management reachability, rollback | Build a four-router isolated topology and deliver a route table, test matrix, failure drill, and short operations note |

## N7. VLANs, Firewalls, and VPNs

### Entry choices

- **Start now:** separate one flat LAN into two policy zones in a visual lab.
- **Review refresher:** revisit switch forwarding, broadcast domains, prefixes, routing, ports, and connection state.
- **Read short context summary:** read why logical LANs reduced the need for one physical switch per group, why firewalls moved from stateless packet checks to connection-aware and application-aware controls, and why VPNs create protected overlays across untrusted transport.

| Module | Guiding ideas and historical reason | Core lessons | Evidence and lab |
| --- | --- | --- | --- |
| N7.1 Segmentation as a design tool | Separating trust, failure, broadcast, and administrative ownership reduces accidental reachability | Zone, segment, trust boundary, least privilege, east-west and north-south traffic, management plane | Turn a plain-language requirement into a zone and flow matrix before selecting technology |
| N7.2 VLANs and tagging | IEEE 802.1Q tagging allowed several logical broadcast domains to share switching infrastructure | VLAN identity, access port, tagged link, native or untagged handling, allowed VLAN list, voice and management examples, mismatch risks | Trace tagged and untagged frames across two switches and diagnose a missing allowed VLAN |
| N7.3 Inter-VLAN routing | Segments communicate only through a Layer 3 policy point | Switched virtual interface concept, router-on-a-stick history, default gateway per VLAN, Layer 3 switch, DHCP relay | Build two VLANs in simulation or an isolated Linux bridge lab and prove both allowed and denied paths |
| N7.4 Loop and first-hop resilience | Segmentation interacts with spanning trees and default gateways | Per-VLAN tree concept, root placement, gateway redundancy, active and standby roles, split brain at a high level | Choose root and gateway placement for a two-switch design and explain failure behavior |
| N7.5 Firewall reasoning | A firewall enforces an explicit policy; its mere presence does not make a network secure | Stateless ACL, stateful session, zones, rule order, default deny, established return traffic, application proxy concept, host versus network firewall | Convert a service-flow matrix into minimal rules, test them, and identify shadowed or overly broad policy |
| N7.6 NAT and publishing services | Translation and security policy are separate, even when one device performs both | Source and destination NAT, port forwarding, reverse proxy distinction, inbound exposure, egress control, logs | Trace an inbound published service and show where firewall approval, translation, route, and listener each matter |
| N7.7 VPN foundations | Encryption protects traffic over an untrusted path but still requires identity, routing, policy, and key lifecycle | Tunnel versus transport concept, site-to-site versus remote access, IPsec components at a conceptual level, TLS VPN, modern lightweight tunnel protocols, full versus split tunnel | Build an isolated two-site tunnel or simulation and prove confidentiality scope, routes, and permitted services |
| N7.8 Network identity and access | Shared passwords and port location alone do not express who or what should connect, so managed networks combine authentication, authorization, accounting, and device posture | AAA, 802.1X, supplicant, authenticator, RADIUS, TACACS-style administrative control, network access control, guest onboarding, device certificates, fallback and recovery risks | Design an owned-lab access flow and diagnose failed identity, authorization, VLAN assignment, and accounting evidence from fixtures |
| N7.9 Detection and application controls | Packet filters cannot understand every application or detect every malicious pattern, so layered controls observe different contexts | IDS versus IPS, network detection, proxy, secure web gateway, web application firewall, DNS filtering, encrypted-traffic limits, false positives, privacy | Place controls on a text topology and explain what each can observe, prevent, miss, and log without generating attack traffic |
| N7.10 Defensive architecture lab | A secure design must remain operable and recoverable | Administrative access, bastion or jump-host concept, management-plane isolation, logging, break-glass path, certificate and key rotation, fail closed versus fail open | Design a small organization with user, server, guest, lab, and management zones; deliver policy, tests, and rollback |

Attack mechanics are introduced only to explain defensive controls. Real traffic interception, wireless attacks, route poisoning, and denial of service are not performed.

## N8. IPv6 in Practice

### Entry choices

- **Start now:** read and compress one IPv6 address, then decide its scope.
- **Review refresher:** revisit prefixes, routing, ICMP, DHCP, DNS, multicast, and NAT’s actual role.
- **Read short context summary:** read how IPv4 address exhaustion, routing growth, autoconfiguration goals, and protocol cleanup shaped IPv6, and why IPv6 is more than “larger addresses.”

| Module | Guiding ideas and historical reason | Core lessons | Evidence and lab |
| --- | --- | --- | --- |
| N8.1 Address notation and scale | A 128-bit address needs readable hexadecimal notation and consistent compression rules | Hexadecimal, hextets, zero compression, prefix length, subnet ID and interface identifier concepts | Expand, compress, compare, and place addresses without speed pressure |
| N8.2 Address types and scope | IPv6 replaces broadcast with scoped multicast and provides several address roles | Global unicast, link-local, unique local, loopback, unspecified, multicast, anycast concept, solicited-node multicast | Classify addresses and explain whether routers may forward them |
| N8.3 Neighbor Discovery | IPv6 uses ICMPv6 for router and neighbor discovery, duplicate detection, and reachability | Router solicitation and advertisement, neighbor solicitation and advertisement, duplicate address detection, neighbor cache, ICMPv6 importance | Step through joining a link and resolve a neighbor in a sanitized capture |
| N8.4 SLAAC and DHCPv6 | IPv6 separates router discovery, address formation, and additional configuration, creating several valid operating models | SLAAC, stable and temporary addresses, router-advertisement flags, stateless and stateful DHCPv6, DNS configuration options, lease and privacy tradeoffs | Choose and test an addressing model for clients, servers, and managed endpoints |
| N8.5 IPv6 subnet planning | Abundant address space changes the goal from conservation to hierarchy, clarity, and growth | Allocation hierarchy, common LAN prefix practice, summarization, point-to-point choices, address management, reverse DNS | Build an IPv6 plan that can summarize by site and function |
| N8.6 IPv6 routing and security | Familiar routing and policy concepts remain, but control traffic and extension behavior differ | Default routes, OSPFv3 concept, firewall parity, ICMPv6 allowances, extension headers at a high level, rogue RA defense, first-hop security | Audit a dual-stack rule set and find where IPv6 accidentally bypasses an IPv4-only policy |
| N8.7 Transition and dual stack | The internet cannot change in one event, so coexistence and translation mechanisms bridge different deployment states | Dual stack, happy-eyeballs concept, tunneling history, NAT64 and DNS64 concept, IPv6-only service considerations | Diagnose a service that works over IPv4 but not IPv6, then the reverse |
| N8.8 Dual-stack studio | A production design needs equivalent names, routes, policy, monitoring, and rollback on both families | AAAA records, address selection, path comparison, logs, parity tests | Build an isolated dual-stack service and provide an IPv4/IPv6 verification matrix |

## N9. Linux and Host Networking

### Entry choices

- **Start now:** inspect one interface, one address, one route, one resolver, and one listening socket.
- **Review refresher:** revisit interfaces, prefixes, neighbors, routing tables, DNS, ports, and firewall state.
- **Read short context summary:** read how the kernel, device drivers, network namespaces, user-space services, and configuration managers share responsibility for a Linux host’s network.

| Module | Guiding ideas and historical reason | Core lessons | Evidence and lab |
| --- | --- | --- | --- |
| N9.1 The host network stack | A host is a router for its own local processes and sometimes for other interfaces | Kernel path, interface, loopback, address, neighbor table, routes, sockets, resolver, packet filter | Produce a five-part host baseline using `ip`, `ss`, and resolver tools or prepared output |
| N9.2 Interfaces and links | Modern `iproute2` exposes kernel networking objects more consistently than older one-purpose tools | `ip link`, `ip address`, `ip neighbor`, link state, MTU, MAC, virtual interfaces, temporary versus persistent changes | Add and remove an address on a disposable namespace or VM; prove restoration |
| N9.3 Routes and policy | Linux supports multiple tables and rules because source, mark, and workload context can affect path choice | `ip route`, connected and default routes, metrics, multiple tables, policy routing concept, reverse-path filtering | Diagnose a wrong default route and a source-specific path in an isolated lab |
| N9.4 Name resolution | Applications may use libraries and local policy rather than directly querying a DNS server | `/etc/hosts`, NSS concept, `/etc/resolv.conf`, systemd-resolved, search domains, caching, `getent`, `resolvectl`, `dig` | Explain why `dig` and an application can disagree; fix a lab-only search-domain problem |
| N9.5 Listening and connecting | A process must bind to the intended address and port, and several layers can still block reachability | `ss`, `lsof`, loopback versus wildcard bind, IPv4 and IPv6 listeners, local client tests, service manager | Start a local service, test loopback and namespace reachability, then diagnose a wrong bind address |
| N9.6 Namespaces, bridges, and virtual Ethernet | Linux network namespaces make separate stacks possible and underpin many container systems | Namespace, veth pair, bridge, forwarding, namespace DNS, lifecycle | Build two namespaces and a bridge, then add a router namespace without exposing the topology externally |
| N9.7 Linux routing and NAT | A general-purpose host can forward and filter, but forwarding must be explicit and observable | Forwarding switch, routes, nftables chains, connection tracking, source NAT, destination NAT, persistence | Build a disposable routed lab and prove policy in both directions |
| N9.8 Persistent configuration | Runtime commands and configuration managers serve different purposes | NetworkManager, systemd-networkd, Netplan, distribution differences, idempotence, console recovery | Translate one reviewed runtime state into a persistent configuration for a VM, then revert from the console |
| N9.9 Host hardening | The smallest listening and forwarding surface is easier to defend | Unused listeners, management exposure, SSH key context, host firewall, updates, logs, time, backups | Produce a sanitized host network inventory and least-access rule set |

Windows and macOS comparison cards accompany every Linux module. They name the equivalent observation and explain where the operating systems differ rather than presenting Linux as the only valid network stack.

## N10. Troubleshooting and Packet Analysis

### Entry choices

- **Start now:** take one symptom and build a timeline before running a command.
- **Review refresher:** revisit packet layers, address selection, routes, DNS, transport state, and service dependencies.
- **Read short context summary:** read why random changes destroy evidence, why symptoms can appear far from causes, and how a baseline plus one testable hypothesis shortens incidents.

### The troubleshooting loop

1. State the user-visible symptom and affected scope.
2. Record when it began and what changed.
3. Identify a known-good comparison.
4. Draw the expected path.
5. Choose the lowest-risk observation that can separate two hypotheses.
6. Make one reversible change only when evidence supports it.
7. Verify success, regression risk, and monitoring.
8. Restore temporary tools and record remaining uncertainty.

| Module | Guiding ideas | Core lessons | Evidence and lab |
| --- | --- | --- | --- |
| N10.1 Scope and timeline | One host, one subnet, one site, one service, one protocol family, or everyone implies different starting points | Incident intake, affected and unaffected matrix, change history, baseline, reproduction, time synchronization | Turn a vague “network is down” ticket into a bounded problem statement |
| N10.2 Layer and path isolation | The layer model is a question generator, not a ritual to always start at Layer 1 | Top-down, bottom-up, divide-and-conquer, follow-the-path, local versus remote, control versus data plane | Select the next observation for ten scenarios and justify information gain and risk |
| N10.3 Host tools | Commands answer different questions and can mislead when treated as universal truth | Link and address state, neighbor cache, route lookup, resolver path, sockets, process binding, firewall counters | Diagnose injected Windows, macOS, and Linux host faults from equivalent output sets |
| N10.4 Reachability tools | ICMP and hop traces reveal selected behavior, not complete application health | Ping limits, traceroute mechanisms, path asymmetry, filtering, PMTU, `Test-NetConnection`, TCP connection probes | Compare a successful ping with failed HTTPS and a failed ping with working HTTPS |
| N10.5 Packet capture fundamentals | A capture is a timestamped observation at one location, not an omniscient record | Capture point, interface, direction, filter, snap length concept, offload artifacts, encryption, privacy, ring buffers | Analyze prepared ARP, DNS, DHCP, TCP, TLS, and ICMP fixtures without capturing third-party traffic |
| N10.6 Reading protocol conversations | State emerges across several packets and systems | Display versus capture filters, streams, retransmissions, resets, DNS timing, DHCP state, duplicate addresses | Annotate a failed TCP handshake and a slow DNS-dependent connection |
| N10.7 Switching and wireless incidents | Errors, loops, negotiation, channel contention, and authentication produce distinct evidence | Interface counters, MAC movement, spanning-tree change, duplex symptoms, wireless association stages, signal versus airtime | Diagnose a loop, bad link, congested AP, and authentication failure from sanitized telemetry |
| N10.8 Routing and firewall incidents | The forward path, return path, route selection, translation, state, and policy must agree | Missing route, more-specific route, asymmetric stateful firewall, NAT mismatch, ACL order, tunnel route, MTU | Repair a multi-node isolated incident and prove both positive and negative flows |
| N10.9 DNS and DHCP incidents | Shared infrastructure failures can affect many applications while basic IP tests still work | Scope exhaustion, relay failure, wrong options, stale cache, missing delegation, split DNS, DNSSEC validation symptom | Lead an incident from user report through evidence, repair, and post-incident note |
| N10.10 Performance diagnosis | Utilization, queueing, loss, retransmission, server time, and client rendering are different | Baselines, percentiles, latency under load, jitter, goodput, error and discard counters, application timing | Separate a bandwidth bottleneck, packet loss, slow server, and slow DNS using provided metrics |

## N11. Network Automation

### Entry choices

- **Start now:** transform one device fact from text into structured data and validate it.
- **Review refresher:** revisit files, terminal commands, variables, loops, functions, JSON, and Git through an optional networking-focused refresher.
- **Read short context summary:** read why manual command repetition becomes inconsistent at scale, why automation without validation magnifies mistakes, and why intended state, observed state, and rollback must remain separate.

This course assumes no prior programming course completion. It links to optional SeePoundCoffeePie Python lessons but defines the required syntax locally.

| Module | Guiding ideas and historical reason | Core lessons | Evidence and lab |
| --- | --- | --- | --- |
| N11.1 From procedure to repeatable change | Runbooks reduce variation; code can make them testable but can also repeat an error rapidly | Input, output, precondition, postcondition, idempotence, dry run, rollback, blast radius | Turn a manual interface audit into a structured procedure before writing code |
| N11.2 Structured network data | Screen scraping is fragile, so APIs and data models expose named fields | JSON, YAML, CSV limits, dictionaries and lists, schema, types, missing values, units | Parse a provided inventory and reject duplicate addresses and invalid prefixes |
| N11.3 Python for network evidence | Small programs can normalize facts, compare state, and create reports | Variables, conditions, loops, functions, files, exceptions, standard library IP address handling | Build an address-plan validator with tests and plain-language errors |
| N11.4 APIs and authentication | Remote management evolved from interactive CLI and SNMP toward structured interfaces, but identity and authorization remain essential | HTTP request and response, REST constraints, RPC concept, token handling, TLS verification, pagination, rate limits, read versus write scope | Query a local mock device API with a read-only token; never log the token |
| N11.5 Data models and configuration interfaces | Vendor-neutral models seek consistent structure while devices retain implementation differences | YANG concept, NETCONF, RESTCONF, gNMI overview, candidate configuration, transaction, commit and rollback | Compare a CLI diff with a modeled change and choose safer validation points |
| N11.6 Template and inventory automation | Separating data from rendered configuration improves review and reuse | Inventory, variables, template, deterministic output, escaping, secrets boundary, golden configuration risks | Render configurations for three lab routers, then detect unsafe or inconsistent input before deployment |
| N11.7 Automation frameworks | Tools coordinate connection, state, and execution but do not remove protocol knowledge | Ansible concepts, vendor collections, SSH libraries, NAPALM-style abstraction, concurrency and rate control | Apply a read-only fact-gathering playbook to local lab nodes and produce a sanitized report |
| N11.8 Validation and testing | A successful command is not proof that intended traffic works | Unit tests, schema tests, lint, preflight, canary, reachability tests, negative tests, diff review, post-change monitoring | Build a change pipeline that stops on an invalid plan and restores a failed canary |
| N11.9 Source control and secrets | Configuration history aids review and recovery, while credentials and private topology require protection | Commit, branch, review, signed change record concept, `.gitignore`, secret store, redaction, artifact retention | Commit only sanitized lab artifacts in a disposable repository and prove secrets are absent |
| N11.10 Automation studio | Safe automation is a control system, not a typing shortcut | Desired state, observed state, drift, reconciliation, approval, maintenance window, human override | Automate one bounded lab change with dry run, approval, canary, tests, rollback, and report |

## N12. Cloud, Containers, and Hybrid Networks

### Entry choices

- **Start now:** trace a packet across a virtual network without assuming a physical switch is visible.
- **Review refresher:** revisit prefixes, routing tables, NAT, DNS, firewalls, load balancing, VPNs, and Linux namespaces.
- **Read short context summary:** read how virtualization turned many network functions into software-managed objects, why cloud route and security models differ by provider, and which physical-network truths still apply.

| Module | Guiding ideas and historical reason | Core lessons | Evidence and lab |
| --- | --- | --- | --- |
| N12.1 Virtual networks are still networks | APIs hide cabling and devices, but addresses, routes, policy, state, failure, and ownership remain | VPC/VNet concept, region, zone, subnet, virtual NIC, route table, control plane, data plane, shared responsibility | Map cloud objects to familiar packet decisions and identify where the provider owns evidence |
| N12.2 Cloud address and route planning | Cloud ranges must coexist with on-premises, partners, clusters, and future regions | Non-overlap, regional versus zonal scope, route propagation, custom routes, default egress, peering limits, transitive routing | Design a provider-neutral three-environment address plan with growth and hybrid space |
| N12.3 Cloud security controls | Instance, subnet, and service-level controls may be stateful or stateless and apply at different points | Security groups, network security groups, network ACL concepts, managed firewalls, identity-aware access, egress, flow logs | Translate one policy into two provider models and test positive and negative flows in simulation |
| N12.4 NAT, load balancing, and private services | Managed services separate frontend, health, routing, backend, and lifecycle decisions | Internet gateway concept, managed NAT, public and private load balancers, Layer 4 versus Layer 7, health checks, private endpoint, service endpoint, DNS integration | Trace client traffic through a load balancer and diagnose unhealthy backend, route, and firewall failures |
| N12.5 Cloud DNS and service discovery | Dynamic workloads and private zones require controlled naming across scopes | Public and private zones, split horizon, forwarding, resolver endpoints, service discovery, TTL and failover tradeoffs | Design name resolution for cloud, on-premises, and remote clients without creating a loop |
| N12.6 Containers and orchestration networking | Containers use namespaces and virtual links; orchestration adds workload addressing, services, policy, and overlays | Container bridge and NAT, Container Network Interface concept, pod and service addresses, overlay, ingress, egress, network policy, service mesh at a high level | Build a local container or namespace service and trace host, container, and published-port paths |
| N12.7 Overlays, fabrics, and software-defined control | Large virtual networks separate an IP underlay from logical tenant networks and centralize parts of intent, while forwarding remains distributed | Underlay and overlay, tunnel endpoint, VRF, VXLAN, EVPN as a BGP control-plane concept, leaf-spine fabric, software-defined networking, controller failure and source-of-truth needs | Trace one tenant packet through an overlay and diagnose wrong route-target, MTU, and endpoint-learning fixtures |
| N12.8 Hybrid and multicloud | Private and encrypted connectivity must reconcile routing, DNS, MTU, identity, failure, and cost across owners | Site-to-site VPN, dedicated connection concept, BGP handoff, redundant tunnels, route preference, overlapping ranges, cloud transit hub | Design a dual-tunnel hybrid link and explain failover, asymmetric risk, monitoring, and cost |
| N12.9 Cloud observability and cost | Abstracted infrastructure increases dependence on provider metrics, logs, tests, and billing visibility | Flow logs, connectivity tests, route analyzer, load-balancer logs, NAT port metrics, egress cost, cross-zone cost, quotas | Diagnose a prepared cloud incident and identify which evidence requires provider control-plane access |
| N12.10 Safe cloud lab | A lab is complete only when access and billable resources are removed | Budget alert, least-privilege identity, tags, no real data, private-by-default service, deletion inventory | Build a minimal private network or complete the provider-neutral simulator, verify it, then destroy and confirm zero remaining resources |

No paid cloud activity is required. Provider-specific labs always have a browser simulation or local virtual equivalent.

## N13. Advanced Routing and BGP

### Entry choices

- **Start now:** connect three isolated autonomous systems and choose a route by policy.
- **Review refresher:** revisit longest-prefix match, static routing, OSPF, route preference, summarization, filtering, and failure convergence.
- **Read short context summary:** read why one global link-state database would not scale across independently governed networks, and why BGP exchanges reachable prefixes with policy attributes instead of promising the physically shortest route.

| Module | Guiding ideas and historical reason | Core lessons | Evidence and lab |
| --- | --- | --- | --- |
| N13.1 Interior routing at larger scale | A first OSPF area is not the whole enterprise routing problem. Larger networks need hierarchy, policy boundaries, rapid failure detection, and careful exchange between route sources | Multi-area OSPF, IS-IS purpose and level hierarchy, BFD, route redistribution risks, route tagging, VRFs, route leaking, loop prevention | Compare OSPF and IS-IS topology models, then contain a redistribution loop in an isolated fixture |
| N13.2 Autonomous systems and policy | The internet connects networks with independent business, security, and engineering goals | Autonomous system, ASN, prefix ownership, peering, transit, customer, provider, settlement-free concept, import and export policy | Label relationships in a small internet model and predict allowed route advertisements |
| N13.3 BGP sessions and route exchange | BGP uses long-lived sessions to exchange incremental reachability and attributes | eBGP, iBGP, neighbor, OPEN and KEEPALIVE concepts, UPDATE, withdrawal, network statement versus redistribution, next hop | Establish an isolated FRRouting session or simulation and verify advertised and accepted prefixes |
| N13.4 Path selection | BGP chooses according to configured policy and attributes, then applies deterministic tie-breaks | Local preference, AS path, origin at a useful level, MED, next hop, weight as vendor-specific, communities, best-path process | Compare candidate paths and explain which policy decision wins before technical tie-breaks |
| N13.5 Policy and filtering | Safe routing depends more on what is rejected than on what is learned | Prefix lists, route maps or policies, maximum prefixes, default-only customer, bogon and documentation prefix filtering, communities, local-pref policy | Write and test an explicit import/export matrix in a lab with a deliberate leak |
| N13.6 iBGP scale | Full-mesh iBGP does not scale, so route reflection and confederation concepts reduce sessions with tradeoffs | Split-horizon rule for iBGP, full mesh, route reflector, cluster, path visibility, confederation overview | Design route-reflector placement and identify a hidden-path risk |
| N13.7 Multihoming and traffic engineering | Inbound and outbound traffic respond to different levers and external policy | Dual providers, local preference, selective advertisements, prepending limits, more-specific routes, communities, default routes, failure convergence | Design a multihomed site and state what can and cannot be guaranteed |
| N13.8 Internet routing security | Incorrect or malicious announcements can redirect or black-hole traffic, so origin validation and filtering matter | Route leaks, hijacks, RPKI, ROA, route-origin validation states, IRR context, MANRS principles, BGPsec overview | Validate a prepared route set against ROAs and contain an invalid announcement in the lab |
| N13.9 Internet services at scale | BGP and DNS support anycast and distributed services when health and policy are designed carefully | Anycast, route withdrawal, global load distribution, DNS delegation, DDoS absorption concept, route-server and IXP concepts | Compare anycast and DNS-based distribution for a service with failure and state requirements |
| N13.10 Mini-internet studio | Internet routing is a policy system operated by people | Address and ASN plan, relationships, filters, monitoring, change review, incident response | Build five isolated ASes, introduce a route leak, detect it, contain it, restore service, and write a post-incident review |

The BGP lab is fully isolated. It uses private ASNs and documentation prefixes, has no bridged adapter, and cannot announce routes to the public internet.

## N14. Resilience, Observability, Security, and Design

### Entry choices

- **Start now:** begin with one service objective and one failure-domain map.
- **Review refresher:** revisit routes, switching loops, gateways, stateful firewalls, DNS, load balancers, BGP, packet analysis, and automation validation.
- **Read short context summary:** read why adding a second device does not automatically create resilience, why monitoring must represent user outcomes, and why secure network design includes recovery and operator behavior.

| Module | Guiding ideas and historical reason | Core lessons | Evidence and lab |
| --- | --- | --- | --- |
| N14.1 Requirements before topology | Design begins with users, applications, data, constraints, and failure tolerance | Functional and nonfunctional requirements, availability, latency, throughput, privacy, compliance context, operations skill, budget | Turn a fictional organization brief into testable requirements and explicit unknowns |
| N14.2 Failure domains and redundancy | Redundant parts can share the same power, provider, conduit, software bug, policy, or operator | Component, link, node, rack, room, site, region, provider, control-plane and fate-sharing failures | Draw a failure-domain map and find three false redundancies |
| N14.3 Convergence and high availability | Detection, decision, programming, and application recovery each consume time | Failure detection, timers, first-hop redundancy, link aggregation, ECMP, state synchronization, active-active and active-standby, graceful degradation | Create a convergence budget and test a simulated link, node, and site failure |
| N14.4 Capacity and performance design | Average utilization hides bursts, queueing, growth, and failure-state load | Baseline, peak, percentile, headroom, oversubscription, bandwidth-delay product concept, queueing, quality of service, capacity under failure | Size a campus uplink and WAN pair for normal and degraded operation with assumptions visible |
| N14.5 Observability history and signals | Reachability checks alone cannot explain health. Operations evolved through logs, SNMP, flows, active probes, and streaming telemetry | Metrics, logs, traces in network context, SNMP purpose and limits, syslog, flow records, packet sampling, telemetry, synthetic tests, event correlation | Design a minimum observability set that proves user path, device health, policy, capacity, and time |
| N14.6 Service objectives and alerting | Alerts should represent actionable risk to a service, not every changing counter | SLI, SLO, error budget concept, symptoms versus causes, thresholds, anomaly context, alert routing, maintenance suppression, runbook link | Write three actionable alerts and reject noisy or privacy-invasive alternatives |
| N14.7 Network security architecture | Strong security combines identity, segmentation, cryptography, hardened management, detection, and recovery | Threat model, asset and trust boundary, least privilege, defense in depth, zero-trust principles, control/management/data-plane protection, secure protocols, certificate lifecycle | Threat-model a network design and map each mitigation to prevention, detection, response, and recovery |
| N14.8 DDoS and abuse resilience | Availability attacks exploit finite bandwidth, connection state, application work, or dependencies | Volumetric, protocol, and application-layer categories, upstream coordination, rate limits, anycast, scrubbing concept, caches, graceful degradation | Design a defensive response plan without generating attack traffic |
| N14.9 Change and configuration safety | Many outages are valid commands applied to the wrong scope or without adequate validation | Intent, peer review, maintenance window, canary, staged rollout, configuration archive, out-of-band access, rollback, freeze, post-change monitoring | Review a risky change plan, reduce blast radius, and run it through an isolated digital twin |
| N14.10 Architecture patterns | Campus, branch, data center, cloud, and remote-access networks emphasize different constraints | Hierarchical campus, leaf-spine concept, hub-and-spoke, transit, service insertion, management network, out-of-band, edge patterns | Compare two designs and state which requirement would change the decision |
| N14.11 Source of truth, documentation, and handoff | A network that only its designer understands is not safely operable, and stale duplicate inventories make automation dangerous | Source of truth, IP address management, inventory ownership, physical and logical diagrams, address and VLAN plan, circuit inventory, policy matrix, dependencies, owners, runbooks, recovery, decision records | Reconcile conflicting inventory fixtures, choose an authoritative owner for each field, and produce an accessible operations packet another learner can follow |
| N14.12 Design review | Good design makes assumptions and tradeoffs inspectable | Requirements traceability, failure review, threat review, capacity review, operations review, cost review, migration plan | Defend a complete design, respond to new constraints, and record accepted risk |

## N15. Network Steward Studio

### Entry choices

- **Start now:** choose any capstone and use its first checkpoint to discover needed context.
- **Review refresher:** select a generated refresher by topic, platform, or evidence type.
- **Read short context summary:** open the capstone’s one-page topology, goals, constraints, safety boundary, and artifact checklist.

Every capstone is open. Suggested earlier courses are links, not gates.

### Capstone A: Explain the packet

Audience: early learner.

Build a complete, accessible trace for a browser reaching a named HTTPS service through Wi-Fi or Ethernet. Include name resolution, local delivery, routing, transport, encryption context, application response, and one likely failure at each layer. The artifact may be a text trace, narrated diagram, or structured event table.

### Capstone B: Community workshop LAN

Audience: foundational to associate.

Design an owned or simulated network for a small community workshop with staff, guest, classroom, printer, lab, and management needs. Create Ethernet and Wi-Fi plans, IPv4 and IPv6 addressing, DHCP and DNS behavior, VLANs, routing, firewall policy, monitoring, and recovery instructions. Prove required flows and denied flows.

### Capstone C: Three-site routed organization

Audience: associate.

Build a headquarters and two-branch topology in isolated VMs or simulation. Use an interior routing protocol, redundant site connectivity, summarized address plans, a site-to-site VPN model, service dependencies, and failure tests. Record convergence evidence and a rollback.

### Capstone D: The slow service incident

Audience: operations.

Investigate a prepared incident where user reports, DNS delay, packet loss, queueing, server response time, and a recent change create competing hypotheses. Deliver a timeline, evidence table, root cause, contributing factors, repair, validation, and blameless prevention actions.

### Capstone E: Safe automation change

Audience: associate to professional.

Create an inventory and address-plan validator, render or generate a bounded configuration change, run preflight checks, apply to one isolated canary, test positive and negative flows, detect an injected failure, roll back, and produce a redacted change report. No production credentials or systems are involved.

### Capstone F: Dual-stack cloud service

Audience: cloud and platform.

Design or build a private-by-default service with dual-stack addressing, route and security policy, private name resolution, controlled egress, load-balancer health, observability, and a deletion inventory. A provider-neutral simulator and local namespace route provide full alternatives to a paid cloud account.

### Capstone G: Mini internet

Audience: advanced routing.

Build five isolated autonomous systems with customer, provider, and peer relationships. Implement explicit import and export policy, origin validation fixtures, monitoring, and maximum-prefix controls. Inject a route leak inside the lab, detect it, contain it, restore correct routing, and write the incident review.

### Capstone H: Resilient learning center design

Audience: architecture.

Respond to a complete request for a multi-building learning center with wired and wireless access, accessibility technology, public classes, private administration, local services, cloud applications, remote staff, guest access, budget limits, privacy requirements, and limited on-site support. Deliver requirements, alternatives, decision records, physical and logical diagrams, address plan, security policy, failure-domain analysis, observability plan, migration stages, acceptance tests, rollback, and a first-year operations plan.

## Lab topology library

Reusable topologies keep setup predictable while letting scenarios grow.

| Topology | Nodes | Used for | Safety boundary |
| --- | --- | --- | --- |
| T0 Loopback pair | One host, two local processes | Sockets, ports, DNS fixture, HTTP, TLS context | Loopback only |
| T1 Pocket LAN | Two endpoints and one switch or bridge | Ethernet, ARP, IPv4, IPv6, captures | Host-only or browser simulation |
| T2 Split LAN | Two client segments and one router/firewall | Subnetting, VLANs, DHCP relay, firewall policy | Isolated namespace or VM network |
| T3 Routed triangle | Three routers and three edge networks | Static routes, OSPF, convergence, MTU | No bridged or public interfaces |
| T4 Two sites | Two routed sites and an untrusted transit segment | VPN, NAT, WAN failure, hybrid concepts | Generated traffic only |
| T5 Service stack | Client, resolver, load balancer, two servers | DNS, transport, health checks, observability | Local containers or simulation |
| T6 Cloud mirror | On-premises segment, virtual network, private service, transit | Cloud routes, private endpoints, hybrid DNS | Simulator, local VM, or owned cloud sandbox |
| T7 Mini internet | Five autonomous systems, route collector, service prefix | BGP policy, leaks, RPKI fixtures, anycast | Private ASNs and documentation prefixes only |

Each topology ships with:

- a text topology;
- an accessible diagram;
- a browser simulation;
- a Linux namespace or VM recipe where technically suitable;
- expected baseline state;
- fault-injection toggles;
- positive and negative test cases;
- reset and destroy commands;
- a sanitized evidence fixture;
- resource estimates;
- Windows, WSL, macOS, and Linux notes.

## Exercise and assessment design

### Exercise forms

- predict the next packet or state transition;
- order a protocol conversation;
- annotate a frame, packet, route, lease, answer, or socket;
- choose the observation that best separates two hypotheses;
- correct an address plan without overlaps;
- build a route or policy table from plain-language requirements;
- compare two designs and defend a tradeoff;
- find unsafe scope, missing rollback, or leaked secret in a change plan;
- interpret a sanitized packet capture, log set, or telemetry timeline;
- configure a disposable lab;
- test allowed and denied behavior;
- diagnose an injected fault;
- explain the mechanism to a new learner;
- create an accessible operations artifact.

### Feedback rules

Feedback names the specific reasoning gap and the next smallest useful check.

Good feedback:

> The destination is outside the host’s `/27`, so the host sends the frame to its default gateway. Recheck the first 27 bits with the address ruler. You do not need to calculate every host address.

Poor feedback:

> Wrong subnet. Review CIDR.

Feedback must distinguish:

- a concept misunderstanding;
- a harmless command typo;
- a platform-specific command difference;
- a permissions or installation limitation;
- an infrastructure failure;
- an unsafe target or scope;
- an observation that is inconclusive rather than incorrect.

### Authentic assessment

No final assessment is only a timed multiple-choice test. A complete course assessment combines:

- a plain-language explanation;
- a trace or state interpretation;
- one bounded configuration or simulation;
- positive and negative verification;
- a fault diagnosis;
- a safety and rollback note;
- a transfer question using a different topology.

Reference sheets remain available. The important evidence is whether the learner can find, interpret, apply, and verify information.

### Privacy of learner evidence

- Lab source, captures, configurations, cloud identifiers, and detailed command history remain local by default.
- Progress synchronization stores completion and aggregate learning evidence, not packet contents or infrastructure secrets.
- Portfolio export is explicit and runs a redaction checklist.
- The interface warns before including public IP addresses, internal names, usernames, device serials, MAC addresses, certificates, tokens, customer information, or organization diagrams.
- Prepared fixtures use invented names, documentation ranges, and generated traffic.

## Practice and retrieval plan

Practice is organized by concept, not by vendor command.

| Concept family | Retrieval progression |
| --- | --- |
| Packet path | Name the next step, trace a new application, diagnose a missing step, explain asymmetric evidence |
| Addressing | Local versus routed, prefix boundary, allocate subnets, summarize safely, migrate dual stack |
| Switching | Learn and forward, identify broadcast scope, prevent loops, place redundant paths |
| Wireless | Join sequence, choose channels, interpret airtime, troubleshoot authentication and roaming |
| Services | Match socket state, trace DNS, trace DHCP, isolate application from transport failure |
| Routing | Choose longest match, interpret source and preference, predict convergence, write policy |
| Security | Translate required flows, minimize rules, verify denial, model trust and recovery |
| Operations | Establish scope, choose observation, interpret capture, validate fix, write incident note |
| Automation | Validate data, render intent, preflight, canary, detect drift, roll back |
| Design | Gather requirements, expose assumptions, map failure, size capacity, defend tradeoffs |

Wrong answers never consume lives or access. Missed ideas return sooner with a different scenario. Practice awards no special authority to modify real networks.

## Credential bridges

Credentials are optional evidence goals. They do not unlock content. External exam names and objectives change, so SeePoundCoffeePie should maintain versioned crosswalks separately and review them against official vendor material at least twice a year. The curriculum does not guarantee an exam result.

### SeePoundCoffeePie evidence and credentials

The academy keeps three claims separate:

- **Completion record:** the learner opened and completed defined teaching material. This does not claim independent practical competence.
- **Applied skill credential:** the learner passed server-owned knowledge checks and supplied the minimum declared evidence for one bounded practical capability.
- **Professional certificate:** the learner demonstrated several applied capabilities and completed an integrative capstone against a published rubric.

Potential networking applied skill credentials are:

1. Trace and explain an application packet journey.
2. Plan and validate an IPv4 and IPv6 address space.
3. Build and verify a segmented small network.
4. Diagnose a host, DNS, DHCP, route, firewall, and transport incident.
5. Operate a Linux network stack safely.
6. Automate a bounded network change with preflight, canary, tests, and rollback.
7. Design and verify a private-by-default cloud or hybrid network.
8. Implement and contain BGP policy in an isolated mini internet.
9. Design a resilient, observable, and recoverable service network.

A future **SeePoundCoffeePie Network Steward Certificate** can combine a reviewed subset of those credentials with Capstone H. Its requirements control only certificate issuance. Every lesson, lab instruction, rubric, and capstone remains open before and after assessment. A browser checkbox is never competence evidence, full packet captures and private configurations are not uploaded, and public verification is opt-in under the shared credential standard.

### External credential bridges

| Learner goal | Suggested curriculum evidence | Optional external bridge |
| --- | --- | --- |
| Entry-level network support | N1 through N5, selected N7 and N10 labs, Capstones A and B | [Cisco Certified Support Technician Networking](https://www.cisco.com/site/us/en/learn/training-certifications/certifications/support-technician/index.html) or the current CompTIA Network+ objectives |
| Associate network administration | N1 through N10, Capstones B, C, and D | [Cisco CCNA](https://www.cisco.com/site/us/en/learn/training-certifications/certifications/enterprise/ccna/index.html) |
| Junos operations | Vendor-neutral foundation plus an optional Junos CLI and configuration overlay | [JNCIA-Junos](https://www.juniper.net/us/en/training/certification/tracks/junos/jncia-junos.html) |
| Enterprise routing | N6, N7, N10, N11, N13, N14, and Capstone G | Current CCNP Enterprise core or routing concentration objectives, checked at study time |
| Linux or platform operations | N5, N8, N9, N10, N11, and local service capstones | Current Linux administration credentials, with networking used as practical evidence rather than a question dump |
| Azure networking | N6 through N12 and N14, Capstones C, F, and H | [Microsoft Certified: Azure Network Engineer Associate](https://learn.microsoft.com/en-us/credentials/certifications/azure-network-engineer-associate/) |
| Google Cloud networking | N6 through N14, especially cloud observability and hybrid routing | [Google Professional Cloud Network Engineer](https://cloud.google.com/learn/certification/cloud-network-engineer) |
| AWS networking | Provider-neutral cloud, hybrid, routing, security, and observability outcomes | Use current AWS learning plans. [AWS Certified Advanced Networking Specialty retired on 2026-08-25](https://aws.amazon.com/certification/certified-advanced-networking-specialty/), so it must not be presented as an active target without a newly verified replacement |

Credential mode may add objective tags, terminology comparison, and exam-style question practice. It must not:

- hide ordinary lessons behind an exam purchase;
- replace labs with memorization;
- copy protected exam questions;
- imply affiliation or endorsement;
- require one vendor’s hardware or paid simulator;
- keep a retired exam marked current;
- turn an optional preparation suggestion into a prerequisite.

## Vendor-neutral core and optional overlays

The main curriculum teaches behaviors and standards. Optional overlays show how a platform expresses them.

Potential overlays include:

- Cisco IOS XE-style operational and configuration workflows;
- Junos candidate configuration, compare, commit, and rollback workflows;
- FRRouting for open routing labs;
- Linux bridge, namespace, nftables, and routing workflows;
- Windows client and server network administration;
- macOS client diagnostics;
- Azure, Google Cloud, and AWS object mappings;
- Kubernetes network policy and service exposure;
- Ansible and modeled management interfaces.

An overlay lesson begins with the vendor-neutral intent, labels proprietary behavior, identifies licensing or account requirements, provides a no-cost alternative, and ends with the same verification evidence.

## Content architecture for SeePoundCoffeePie

### Course presentation

Each course outline should show:

- the practical outcome;
- the recommended context, labeled optional;
- the three entry choices;
- modules and lessons, all open;
- supported lab routes;
- expected local resource use;
- safety boundary;
- evidence types;
- capstone connections;
- credential tags that are informational and dated.

### Unit presentation

Each unit workspace should include:

- **Question:** the real problem being solved;
- **Why this exists:** the historical constraint or failure that shaped the mechanism;
- **Packet or state map:** an accessible text and visual trace;
- **Terms in use:** only vocabulary needed now;
- **Predict:** a low-stakes prompt;
- **Observe:** prepared evidence before configuration;
- **Choose your practice route:** browser exercise, platform-native lab, VM, namespace/container, physical kit, or learner-controlled cloud where applicable;
- **Change:** one bounded learner action;
- **Verify:** expected success and safe failure tests;
- **Explain back:** a short transfer prompt;
- **Restore:** exact cleanup and rollback;
- **Bench note:** Mira’s concise operational or historical context;
- **Reference:** protocol standards, platform documentation, and commands used;
- **Review later:** concept-based retrieval, never an access gate.

### Navigation and progress

- Direct routes must open exact lessons and labs without redirecting to an earlier course.
- A learner can mark a lesson “reading,” “practicing,” “comfortable,” or “needs review.”
- Completion records evidence already demonstrated but do not control access.
- The recommended next lesson can use the dependency map, learner goal, platform, and confidence while always offering “choose another topic.”
- Platform selection filters instructions but never hides the browser exercise or another platform's notes.
- Switching platforms does not reset progress.
- Credential mode and career goals are optional filters, not separate locked courses.

## Suggested implementation slices

The curriculum is large. Implementation should proceed through complete, runnable vertical slices rather than creating empty cards for every course.

### Slice 1: Packet journey foundation

- N1.1 through N1.5;
- browser packet trace with text event log;
- Windows, macOS, and Linux observation cards;
- mentor components and three-choice entry panel;
- no installation required;
- Capstone A starter.

### Slice 2: Pocket LAN

- N2 switching foundations;
- N4 local-versus-routed addressing;
- T1 browser and Linux namespace topology;
- prepared Ethernet, ARP, and ICMP capture fixtures;
- accessible switch-table and CIDR tools.

### Slice 3: Core services

- TCP and UDP observation;
- DNS and DHCP history and traces;
- T5 local service stack;
- fault injection for listener, DNS, address, route, and firewall cases.

### Slice 4: Routed and segmented organization

- N6 static routing and OSPF foundation;
- N7 VLAN and firewall policy;
- T2 and T3 resettable labs;
- Capstones B and C;
- safe configuration and rollback evidence.

### Slice 5: Operations

- N9 host networking;
- N10 troubleshooting loop and prepared packet captures;
- equivalent Windows, WSL, macOS, Linux, and browser evidence;
- Capstone D incident workflow.

### Slice 6: Modern network engineering

- IPv6 and dual stack;
- automation validation;
- cloud and container mappings;
- BGP mini internet;
- resilience and observability;
- Capstones E through H.

Each slice requires curriculum QA, accessibility review, lab reset verification, privacy review, and platform testing before publication claims.

## Quality gates

### Curriculum gate

- Every new term is defined before use.
- Every protocol lesson answers what problem it solved, what came before, and what tradeoff remains.
- Every numeric fact is either derived, observed, or clearly labeled reference material.
- Examples use documentation ranges, private labs, reserved names, and generated identities.
- No section implies that NAT alone is a firewall, ping alone proves a service is healthy, a VPN makes an endpoint trusted, or redundancy automatically creates resilience.
- Vendor behavior is labeled and compared with the standard or conceptual model.
- Advanced topics retain the three entry choices.
- Optional preparation is never implemented as a lock.

### Lab safety gate

- The authorization scope is visible before commands.
- Default networking is loopback, namespace, host-only, internal, or simulated.
- Bridged, public, and cloud paths require an explicit reason and a safer alternative.
- Reset and cleanup are tested, not merely documented.
- Firewall and routing labs retain console or snapshot recovery.
- Cloud labs start with cost and identity controls and end with resource deletion verification.
- BGP labs cannot reach the public control plane.
- Capture fixtures contain no real learner, customer, token, certificate, or internal-infrastructure data.

### Accessibility gate

- Automated checks cover headings, labels, focus order, landmarks, names, states, contrast, and reduced motion.
- A human keyboard review completes the lesson, lab route selection, simulator, hint, verification, and cleanup.
- A screen-reader review completes at least one packet trace, topology, command-output explanation, and fault diagnosis.
- Diagrams have equivalent text topology and ordered event data.
- Content remains usable at 200 percent browser zoom and at 390 CSS pixels.
- No required evidence depends on color, dragging, precise pointer movement, audio, or animation speed.

### Technical gate

- Commands are tested on the stated operating-system versions or clearly labeled illustrative.
- Prepared output matches the lesson version and tool.
- Namespace, VM, and container reset scripts are idempotent and fail closed.
- Address plans have automated overlap and range validation.
- Routing and firewall labs test intended allow and deny cases.
- Packet fixtures have a documented generation recipe and privacy review.
- Cloud instructions are reviewed for current names, quotas, defaults, and deletion behavior before release.
- Credential mappings show a review date and link to current official objectives.

### Evidence gate

Automated tests and a successful local lab do not prove every route or platform. Release evidence distinguishes:

- curriculum source review;
- browser simulation tests;
- Windows native review;
- WSL review;
- macOS review;
- Linux review;
- VM and namespace reset testing;
- physical-device testing, if claimed;
- cloud-provider testing, if claimed;
- keyboard and screen-reader review;
- staging behavior;
- production behavior.

An unperformed platform or accessibility review remains unverified.

## Maintenance policy

Networking principles endure, but commands, wireless generations, operating systems, cloud services, and credentials change.

- Review external credential mappings twice a year and immediately after a vendor announces retirement.
- Review cloud labs quarterly for service names, pricing, quotas, identity defaults, public exposure defaults, and cleanup.
- Review OS commands against supported Windows, macOS, and Linux versions at least annually.
- Review security recommendations when protocol guidance or major platform defaults change.
- Keep historical explanations, but label practices that are legacy, transitional, unsafe, or context-dependent.
- Preserve old lesson identifiers when updating content so learner evidence remains valid.
- Version prepared packet captures and configuration fixtures.
- Record the standard, implementation, tool version, and last verification date near platform-specific instructions.
- Treat learner reports about unclear scope, unexpected cost, lost connectivity, inaccessible diagrams, or unsafe defaults as release blockers for the affected lab.

## Standards and authoritative reference shelf

The learner-facing course should link to short explanations first and make full standards available for deeper study.

Core stable references include:

- [RFC 1122, Requirements for Internet Hosts](https://www.rfc-editor.org/rfc/rfc1122)
- [RFC 1918, Address Allocation for Private Internets](https://www.rfc-editor.org/rfc/rfc1918)
- [RFC 4632, Classless Inter-domain Routing](https://www.rfc-editor.org/rfc/rfc4632)
- [RFC 5737, IPv4 Address Blocks for Documentation](https://www.rfc-editor.org/rfc/rfc5737)
- [RFC 3849, IPv6 Address Prefix Reserved for Documentation](https://www.rfc-editor.org/rfc/rfc3849)
- [RFC 8200, Internet Protocol Version 6](https://www.rfc-editor.org/rfc/rfc8200)
- [RFC 4861, Neighbor Discovery for IPv6](https://www.rfc-editor.org/rfc/rfc4861)
- [RFC 4862, IPv6 Stateless Address Autoconfiguration](https://www.rfc-editor.org/rfc/rfc4862)
- [RFC 8415, DHCP for IPv6](https://www.rfc-editor.org/rfc/rfc8415)
- [RFC 9293, Transmission Control Protocol](https://www.rfc-editor.org/rfc/rfc9293)
- [RFC 768, User Datagram Protocol](https://www.rfc-editor.org/rfc/rfc768)
- [RFC 1034, Domain Names Concepts and Facilities](https://www.rfc-editor.org/rfc/rfc1034) and [RFC 1035, Domain Names Implementation and Specification](https://www.rfc-editor.org/rfc/rfc1035)
- [RFC 2131, Dynamic Host Configuration Protocol](https://www.rfc-editor.org/rfc/rfc2131)
- [RFC 2328, OSPF Version 2](https://www.rfc-editor.org/rfc/rfc2328)
- [RFC 4271, Border Gateway Protocol 4](https://www.rfc-editor.org/rfc/rfc4271)
- [RFC 8446, TLS 1.3](https://www.rfc-editor.org/rfc/rfc8446)
- [RFC 9000, QUIC](https://www.rfc-editor.org/rfc/rfc9000)
- IEEE 802.3 Ethernet and IEEE 802.11 wireless LAN standards, with accessible course summaries before standards text
- official operating-system manuals and cloud-provider documentation for version-specific commands and services

The course explains that standards describe contracts and allowed behavior, while a real implementation may add platform-specific defaults, limits, or interfaces. Learners verify the implementation they operate.

## Definition of curriculum-ready

This blueprint is ready to move into course production when reviewers agree that:

- the open-access contract is represented in the data and route model;
- the three entry choices are a reusable component for every harder section;
- the original Mira Patch mentor theme is legally distinct and subordinate to teaching;
- the first vertical slice has a complete lesson, lab, feedback, accessibility, reset, and privacy design;
- browser, Windows, WSL, macOS, Linux, VM, and cloud alternatives are represented honestly rather than all being claimed complete;
- every hands-on target is learner-controlled or explicitly authorized;
- the recommended sequence remains guidance rather than enforcement;
- history and design reasons are part of lesson content, not an appendix learners can easily miss;
- capstones measure explanation, construction, verification, troubleshooting, safety, and design;
- credential bridges are optional, dated, and separable from the vendor-neutral curriculum;
- no course requires paid hardware, paid cloud use, a proprietary simulator, or another SeePoundCoffeePie course to open and learn.
