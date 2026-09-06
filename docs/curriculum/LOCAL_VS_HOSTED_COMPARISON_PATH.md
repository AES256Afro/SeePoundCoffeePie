# Local versus hosted comparison path

Last reviewed: 2026-09-01

## Status

This document is a proposed path blueprint, not live content. Nothing described here is published, and no count in the canonical school inventory changes because this document exists.

It defines one additional learning path inside the Local Models and LLMs school described in [LOCAL_MODELS_LLM_CURRICULUM.md](LOCAL_MODELS_LLM_CURRICULUM.md). Its purpose is to give the Phase 26 roadmap milestones (M383 through M407 in [MILESTONES.md](../../MILESTONES.md)) an owned curriculum home, as required by milestone M426 and by finding items 8 and 9 in the Local Models section of the [2026-09-01 course sweep](../COURSE_SWEEP_2026-09-01.md).

Scope rule: this path does not duplicate LM-100 or LM-1000 teaching. Where a Phase 26 milestone is already covered by an existing course or section of the school blueprint, the crosswalk below points there and this path references that location. This path authors new courses only for the milestones that have no current home.

All rules of the parent school apply unchanged: the open-access rule, the product and computation boundary, the [No assumed knowledge standard](NO_ASSUMED_KNOWLEDGE_STANDARD.md), and the [Lab, assessment, and credential standard](LAB_ASSESSMENT_CREDENTIAL_STANDARD.md) with its L0 through L4 risk classes, A0 through A3 assessment classes, E0 through E4 evidence classes, and eleven access lanes. Every course displays the three equal actions: **Start now**, **Review a refresher**, and **Read the short context summary**. Preparation is advice, never a gate. Every lab has an L0 prepared, no-compute route.

This path never declares local or hosted systems universally better. It teaches learners to state requirements first and then compare with evidence. Provider behavior changes, so every provider example in this path carries a date and a review-by date.

## Milestone crosswalk: M383 through M407

Convention per M423: each row cites the canonical milestone ID with its exact ledger title, so a renamed or renumbered milestone is detectable.

| Milestone (exact ledger title) | Owned curriculum location | Home type |
| --- | --- | --- |
| M383, what a model is | LM-101: What a model is | Existing course |
| M384, model families and modalities | LM-102: Model families and modalities | Existing course |
| M385, model roles | LM-106: Model access and deployment choices (model-role modules) | Existing course |
| M386, weights, parameters, checkpoints, and artifacts | LM-302: Weights, tokenizers, templates, and formats | Existing course |
| M387, tokens, context, memory, and retrieval | LM-104: Parameters, tokens, context, and sampling | Existing course |
| M388, deployment-shape map | LM-106: Model access and deployment choices; deepened by LM-1401 module 1 | Existing course |
| M389, local-versus-hosted data-flow lab | LM-1401 (this path) | New course |
| M390, provider-claim verification | LM-1402 (this path) | New course |
| M391, privacy and security tradeoffs | LM-1201: Threat model a local model system, plus the school's hosting decision map; exercised again in LM-1401 and LM-1404 | Existing course |
| M392, cost and capacity tradeoffs | LM-1403 (this path) | New course |
| M393, quality and capability tradeoffs | LM-501 through LM-505 (Evaluate models honestly); applied comparatively in LM-1405 | Existing path |
| M394, reliability and control tradeoffs | LM-1404 (this path) | New course |
| M395, open source, open weights, and proprietary | School section `Open source, open weights, and proprietary`, plus LM-1202: Licenses for code, weights, data, and output | Existing section |
| M396, precision without mystery | School section `Number formats and quantization primer`, plus LM-1001: Bits, floating point, and integer representations | Existing section |
| M397, quantization and quants | Same primer, plus LM-1002: Quantization methods and GGUF names | Existing section |
| M398, quant-name reading | School section `Common GGUF-style names`, plus LM-1002 | Existing section |
| M399, model-fit estimator | LM-203: RAM, VRAM, unified memory, disk, and fit, plus the school's `Sizing worksheet` | Existing course |
| M400, formats and runtimes | LM-302, plus the school's `Artifacts, formats, and runtimes` section | Existing course |
| M401, first local model lab | LM-303: Download, verify, inventory, and remove, plus LM-304: llama.cpp-style command-line inference | Existing courses |
| M402, fair local-versus-hosted comparison lab | LM-1405 (this path), with the consent flow specified below | New course |
| M403, choose the simplest sufficient system | LM-701: Should this task be fine-tuned? (adaptation gate decision matrix) | Existing course |
| M404, migration and portability | LM-1406 (this path) | New course |
| M405, local-and-hosted design capstone | LM-1407 (this path) | New course |
| M406, model-comparison credential | Credential reconciliation section of this document | This document |
| M407, model-comparison release gate | Release gate section of this document | This document |

Existing-home rows depend on the M423 and M424 blueprint repairs landing in the parent document; this crosswalk cites the ledger, not the parent document's current alignment table.

## Path LM-1400: Local versus hosted in practice

**Reservation notice:** the path ID LM-1400 and course IDs LM-1401 through LM-1407 are reserved. They are not yet part of the canonical 13-path, 65-course school inventory. Joining that inventory is a later counted change under M411 inventory rules and is not claimed by this document.

**Outcome:** map real data flows, verify provider claims with dated evidence, compare cost, reliability, and quality fairly, plan migration and exit, and defend a deployment decision for a bounded fictional use case.

**Recommended preparation:** LM-100 (Models from zero) supplies the vocabulary; LM-500 supplies evaluation habits; LM-203 supplies fit arithmetic. All are optional refreshers with short context summaries in place.

**Start-now promise:** every course in this path is fully completable from prepared, dated, synthetic evidence on any browser-capable device. No account with any provider, no installation, and no model-capable hardware is required for any core route.

| Course | Milestone | Core lab | Risk class |
| --- | --- | --- | --- |
| LM-1401: Data-flow mapping, local and hosted | M389 | LML-1401 Two-System Data Map | L0 |
| LM-1402: Verifying provider claims | M390 | LML-1402 Claim Audit | L0 |
| LM-1403: Cost and capacity over time | M392 | LML-1403 Cost Worksheet | L0 |
| LM-1404: Reliability, control, and repair ownership | M394 | LML-1404 Failure Ledger | L0 |
| LM-1405: The fair comparison lab | M402 | LML-1405 Fair Trial | L0 or L2 |
| LM-1406: Migration, portability, and exit plans | M404 | LML-1406 Exit Drill | L0, optional L2 |
| LM-1407: Comparison design capstone | M405 | LML-1407 Comparison Capstone | L0 |

### LM-1401: Data-flow mapping, local and hosted

**Purpose:** map where input, output, files, retrieval sources, logs, telemetry, identity, network hops, retention, deletion, support access, and backups actually go in one local and one hosted design, and never infer privacy from the word `local` or `enterprise` alone.

**Recommended preparation:** LM-101 and LM-106, or their short context summaries. P0.10 privacy and licensing refresher is available.

| Module | One-line scope |
| --- | --- |
| 1. Eight deployment shapes, one control question | Revisit the LM-106 shape map and ask who controls each layer |
| 2. Visible flows | Input, output, files, and retrieval sources as traceable arrows |
| 3. Quiet flows | Logs, telemetry, crash reports, identity, and update checks |
| 4. Network hops | Where a prompt travels and where it can be stored or read in transit |
| 5. Retention, deletion, support access, and backups | Four separate questions with four separate answers |
| 6. Words that are not evidence | Why `local`, `private`, `enterprise`, and `on-premises` prove nothing alone |
| 7. Drawing the map | A legend, an annotated example, and a completeness checklist |

**Core lab, LML-1401 Two-System Data Map (L0, E1):** using prepared synthetic evidence (configuration files, redacted synthetic network summaries, and dated fictional terms excerpts), draw one data-flow map for a local desktop design and one for a hosted API design, then list what the evidence cannot show. The L0 prepared route is the core route; there is no higher-risk variant.

**Start-now promise:** all evidence is prepared and synthetic. No capture tool, account, or install.

### LM-1402: Verifying provider claims

**Purpose:** read current official terms rather than marketing pages: product tier, training-use statement, retention, regional processing, abuse monitoring, stateful features, subprocessors, deletion, encryption, and contractual scope. Provider behavior changes; date every example.

**Recommended preparation:** LM-1401. P0.10 is available as an optional refresher.

| Module | One-line scope |
| --- | --- |
| 1. Marketing page versus terms document | Which document binds, and how to find the current one |
| 2. Product and tier boundaries | The same provider can apply different rules to different products |
| 3. Training-use statements | What `we do not train on your data` does and does not cover |
| 4. Retention, deletion, and abuse monitoring | Windows, exceptions, and who can look |
| 5. Regional processing, subprocessors, and encryption | Claims that require named locations and named parties |
| 6. Stateful features | History, memory, connectors, and telemetry as separate data flows |
| 7. The dated claim register | Source, exact quote, date read, and review-by date for every claim |

**Core lab, LML-1402 Claim Audit (L0, E1):** audit a complete fictional provider terms packet, dated 2026-09-01, and extract ten claims into a dated claim register, marking each claim verified, ambiguous, or unsupported by the packet. An optional extension repeats the audit against one real provider's current public terms in the learner's own browser; that extension is dated on the day it is done and is never scored against the fictional answer key, because real terms change.

**Start-now promise:** the core audit is self-contained in the fictional packet. No provider account.

### LM-1403: Cost and capacity over time

**Purpose:** compare hardware purchase, electricity, storage, time, maintenance, idle capacity, per-token or subscription pricing, staff, data movement, support, scaling, and shutdown, and separate a short experiment from sustained operation.

**Recommended preparation:** LM-203 or the hardware context summary. P0.4 numbers and units refresher is available.

| Module | One-line scope |
| --- | --- |
| 1. Two different questions | Costing a weekend experiment versus costing a two-year service |
| 2. Local cost lines | Purchase, electricity, storage, maintenance, and the learner's time |
| 3. Idle capacity | Hardware paid for while nothing runs, and when that is acceptable |
| 4. Hosted cost lines | Per-token, subscription, reservation, data movement, and support |
| 5. Staff and attention | Operating effort as a real cost on both sides |
| 6. Scaling and shutdown | What growth costs, and what stopping costs, on each side |
| 7. The worked comparison | Stated assumptions, yearly totals, uncertainty range, break-even statement |

**Core lab, LML-1403 Cost Worksheet (L0, E1):** complete a worked local-versus-hosted cost comparison for one fictional use case using supplied example prices dated 2026-09-01, producing yearly totals, an uncertainty range, and a break-even statement. Learners with current real prices may substitute them and must date them. Prices are teaching examples, not market claims.

**Start-now promise:** the worksheet ships with dated example prices. No purchase, quote, or account.

### LM-1404: Reliability, control, and repair ownership

**Purpose:** compare offline operation, internet dependency, service limits, queues, outages, version changes, model retirement, local hardware failure, backups, rollback, and observability, and name who owns each repair.

**Recommended preparation:** the LM-300 offline proof exercise is the reference for offline claims. LM-1105 upgrade and rollback material is an optional refresher.

| Module | One-line scope |
| --- | --- |
| 1. Availability is a chain | Model, runtime, machine, network, provider, and account as links |
| 2. Offline operation | What it requires, and the four separate things an offline test proves |
| 3. Hosted interruptions | Outages, queues, quotas, rate limits, and account actions |
| 4. Silent change | Hosted model versions, behavior drift, deprecation, and retirement |
| 5. Local failure | Hardware, disk, driver, and update breakage on the learner's side |
| 6. Backups, rollback, and pinning | What each side can restore, and to what version |
| 7. The repair-ownership table | For each failure: who can fix it, with what access, and how fast |

**Core lab, LML-1404 Failure Ledger (L0, E1):** given prepared, dated incident timelines for one local and one hosted design, complete a repair-ownership table covering at least eight failure modes and write a recovery plan for two of them, naming the owner, the access required, and the learner's fallback while the repair is out of their hands.

**Start-now promise:** all incidents are prepared and fictional. Nothing is run or broken.

### LM-1405: The fair comparison lab

**Purpose:** compare systems with one harmless synthetic task set, equivalent instructions, recorded model and service versions, repeated trials, a quality rubric, latency records, and a resource or price record, and refuse to crown a winner without stated requirements.

**Recommended preparation:** LM-501 through LM-503, or the evaluation context summary. LM-304 helps learners who choose the live local route.

| Module | One-line scope |
| --- | --- |
| 1. What makes a comparison unfair | Different prompts, versions, attempt counts, and undisclosed retries |
| 2. The synthetic task set | Harmless, private-data-free tasks with a written scoring rubric |
| 3. Equivalent instructions and recorded versions | Same inputs, and exact model and service versions with dates |
| 4. Repeated trials | Variation between runs, honest aggregation, and reporting failures |
| 5. Latency, resource, and price records | What to measure, what to record, and what stays an estimate |
| 6. The consent preflight | The written preflight required before any optional hosted request |
| 7. Reporting without a crown | Requirements first, evidence second, a conditional conclusion last |

**Core lab, LML-1405 Fair Trial (L0 or L2, E1 or E2):**

- **L0 prepared route (core, complete on its own):** score two complete prepared trial records, one local and one hosted, both synthetic, versioned, and dated, using the rubric, and write the full comparison report. No system runs and no request is sent.
- **L2 learner-run route (optional):** run the local side on the learner's own machine with the synthetic task set, following the LM-304 lab contract, and record versions, trials, latency, and resources (E2 manifest). Including a hosted provider is a further optional step governed entirely by the consent flow below; without it, the learner compares their local results against the prepared hosted record.

**Start-now promise:** the prepared route contains complete recorded trials for both sides, so the whole comparison skill is learnable with no hardware and no provider.

### LM-1406: Migration, portability, and exit plans

**Purpose:** keep prompts, test sets, data, embeddings, adapters, interfaces, logs, and configuration exportable; identify provider-specific features; pin versions; run replacement tests; and write an exit plan, without claiming every model is interchangeable.

**Recommended preparation:** LM-1405 rubric work carries over. LM-302 format context is an optional refresher.

| Module | One-line scope |
| --- | --- |
| 1. What portability promises | Exportability and tested replacements, never interchangeable models |
| 2. The export inventory | Prompts, test sets, data, embeddings, adapters, configuration, logs |
| 3. Provider-specific features | Convenience features that quietly resist export |
| 4. Version pinning on both sides | Pinned local artifacts and pinned or pinnable hosted versions |
| 5. The replacement test | Rerun the same test set on the candidate before switching |
| 6. What does not transfer | Embeddings and adapters are bound to their models |
| 7. The exit plan | A trigger, a budget, a responsible person, and a rehearsal date |

**Core lab, LML-1406 Exit Drill (L0, E1; optional L2 extension, E2):** from a prepared fictional deployment record, produce an export inventory, identify three elements that will not move cleanly, design a replacement test, and write an exit plan with a named trigger. The optional L2 extension runs the replacement test locally against synthetic fixtures.

**Start-now promise:** the fictional deployment record is complete on the page. No live system needed.

### LM-1407: Comparison design capstone

**Purpose:** choose a fictional personal, school, or small-organization use case, compare at least three deployment shapes, map data, evaluate quality, estimate cost and hardware, threat-model both sides, choose or reject a system, and document a fallback.

**Recommended preparation:** LM-1401 through LM-1406. LM-1201 threat modeling is an optional refresher; its short context summary is supplied.

| Module | One-line scope |
| --- | --- |
| 1. A bounded fictional use case | Users, tasks, data classes, and written requirements |
| 2. Three or more deployment shapes | Selecting comparison candidates from the LM-106 shape map |
| 3. Assembling the evidence | Data map, quality evaluation, cost estimate, and fit estimate |
| 4. Threat modeling both sides | Applying the LM-1201 method to each candidate |
| 5. The decision memo | Choose, reject, or defer, with evidence and stated requirements |
| 6. The fallback | What happens when the chosen system fails, changes, or retires |

**Core lab, LML-1407 Comparison Capstone (L0, E1; E3 when submitted for credential review):** assemble the complete design packet from prepared and self-produced synthetic evidence. Measurements from earlier optional live labs may be imported but are never required. A well-defended decision to use no model system at all receives full credit.

**Start-now promise:** the entire capstone is completable as design work with prepared evidence.

### Path reality checks

Following the parent school's convention, these callouts recur across the path:

- A model running on your own computer is not automatically private. Privacy is established by the full data flow and verified network behavior, not by the word `local`.
- A hosted service is not automatically careless. A governed hosted system can carry strong contractual, access, retention, and audit controls; the learner must examine the exact service, tier, and configuration.
- A provider terms page read last year is not evidence about today. Provider behavior changes; only a dated reading counts.
- A price per token is not a total cost, and a purchased computer is not a free one. Idle capacity, electricity, maintenance, and attention are real cost lines.
- A benchmark run once, on one prompt, with unrecorded versions, is an anecdote, not a comparison.
- The ability to export files is not the ability to switch. Only a replacement test on the same task set shows what a candidate system actually does.
- Neither local nor hosted is universally better. A comparison without stated requirements has no correct answer.

### Breaks and checkpoint

LM-1402 ends with a **dated-evidence break**. The learner returns by spotting the undated claim in a prepared claim register.

LM-1405 places a checkpoint after each scored trial batch, and the optional hosted leg always begins at a fresh checkpoint so the consent preflight is never rushed at the end of a session.

The path checkpoint requires the learner to:

- trace where a prompt and its logs go in one local and one hosted design;
- state where a provider's training-use and retention claims come from, with dates;
- present one cost comparison with assumptions and an uncertainty range;
- name the repair owner for two failure modes on each side;
- explain why one prepared comparison is unfair and repair its design;
- state an exit trigger and the test that would validate a replacement.

### Portfolio project: Deployment decision dossier

The LM-1407 capstone packet is this path's portfolio project: the fictional use case, the data maps, the quality evaluation, the cost estimate, the threat models, the decision memo, and the fallback plan, assembled as one reviewable dossier. A dossier that rejects every model system with evidence receives full credit, matching the parent school's portfolio rule.

### Honest evidence limits

Evidence in this path proves less than it appears to, and the path says so on every relevant page:

- An E1 summary attests that the learner reports a result; it does not verify the result.
- An E2 manifest verifies consistency of a declared bounded task, not authorship, completeness, or absence of omitted failures.
- A prepared hosted trial record teaches the comparison method; it is not a measurement of any real provider today.
- A cost worksheet with dated example prices teaches the arithmetic; real procurement requires current quotes.
- No completion in this path claims professional competence, legal review, or a guarantee that a chosen system will keep behaving as measured.

## The M402 consent flow

The fair comparison lab touches the product boundary, so this section specifies the learner-side consent flow. It restates and does not weaken the boundary in [LOCAL_MODELS_LLM_CURRICULUM.md](LOCAL_MODELS_LLM_CURRICULUM.md):

- SeePoundCoffeePie never sends prompts, task content, or learner data to any model provider, and never proxies, brokers, or relays a provider request.
- The site never holds, requests, or receives provider credentials, API keys, or account identifiers.
- The comparison lab runs entirely in the learner's environment. The site teaches the procedure and receives, at most, an optional self-attested result summary (E1): rubric scores, timing figures, price paid, and the dates and versions recorded. Raw provider outputs are not collected by default.
- The hosted leg is optional. Skipping it never lowers a score, blocks completion, or hides content; the L0 prepared route is a complete route.

If a learner chooses to include a hosted provider, the lab guide has the learner make the request from their own account, on their own device, only after completing this written preflight:

1. **Provider and product:** name the provider and the exact product and tier, because terms differ per product.
2. **Exact content:** write out the exact synthetic content to be sent, in full, and confirm it contains no personal, private, confidential, employer, or license-restricted material.
3. **Terms and retention:** locate the currently applicable terms and record, with the date read, the training-use statement and the retention and deletion scope that will apply to this request (the LM-1402 skill).
4. **Processing scope:** note the stated processing region and any listed subprocessors relevant to the request, or record that the terms do not state them.
5. **Account:** confirm the account is the learner's own and that no credential is ever entered into SeePoundCoffeePie.
6. **Cost:** state the pricing basis, an estimated cost for the planned trials, and a spending cap.
7. **Stop option:** record the explicit option to stop here. Stopping completes the lab by the prepared route with full credit.
8. **Consent statement:** write and date a one-sentence consent statement naming items 1 through 7.

After any request, the learner records the date, the model and service version identifiers, latency, and price, and may submit the optional E1 summary. Provider behavior changes; every recorded claim carries its date.

## Credential reconciliation: M406 and the M329 mismatch

**Proposal, requires owner decision.** This section proposes a reconciliation without editing the ledger or the parent blueprint.

The ledger's M329, local-model credential sequence, names about eight credentials: Local AI Foundations, Run a Local Model, Prepare LLM Data, Evaluate a Local Model, Fine-Tune with LoRA or QLoRA, Responsible Release, Local Model Service, and later broader practitioner credentials. The school blueprint defines three applied skill credentials plus thirteen completion records. This path adds the M406 model-comparison credential as a fourth applied credential.

Proposed fourth applied credential, **Model Comparison Practitioner (M406)**. Assessed outcomes follow the ledger exactly: explain model types, read a quant name, calculate a fit range, map local and hosted data flows, evaluate equivalent outputs, and defend a decision with evidence. Assessment: an A1 knowledge assessment plus an A2 applied assessment built on LML-1405 and LML-1407, with an E2 manifest where a live local trial was run, E1 otherwise, and E3 human review of the capstone decision memo. Credential requirements control issuance only; all teaching, lab guidance, skills outlines, and rubrics remain directly open, and no LLM makes the final grading decision.

Proposed mapping of the M329 names:

| M329 name | Proposed record type | Proposed home |
| --- | --- | --- |
| Local AI Foundations | Completion record | `Models From Zero` completion record (LM-100) |
| Run a Local Model | Applied credential | Applied credential 1: Local Model Operator |
| Prepare LLM Data | Assessed outcome group inside a credential | Data outcomes of applied credential 2: Local Model Data and Evaluation Practitioner; course completion remains the `Responsible Model Data` record |
| Evaluate a Local Model | Assessed outcome group inside a credential | Evaluation outcomes of applied credential 2; course completion remains the `Model Evaluation Foundations` record |
| Fine-Tune with LoRA or QLoRA | Completion record plus assessed outcome group | `LoRA and QLoRA Foundations` record; assessed inside applied credential 3: Local Model Engineer |
| Responsible Release | Completion record plus assessed outcome group | `Model Security and Responsible Release` record; assessed inside applied credential 3 |
| Local Model Service | Completion record plus assessed outcome group | `Local Model Service Operations` record; assessed inside applied credential 3 |
| Later broader practitioner credentials | Credential tier | Applied credential 3 as the integrative practitioner credential, plus Model Comparison Practitioner (M406, this path) as a separate applied credential |

In plain terms: three of the M329 names (Run a Local Model, and the two practitioner-scale groupings) are credential-level, the rest are either completion records or assessed outcome groups inside the three existing applied credentials, and the comparison credential is a genuinely new fourth credential rather than a rename. Recommendation: the ledger adopts this mapping by revising M329's wording to reference the three applied credentials, the completion records, and the fourth comparison credential, so both documents name the same records. Until the owner decides, the blueprint's three credentials and this document's proposed fourth remain the working set, and no credential is piloted under an unreconciled name.

## Release gate

Publication of any unit in this path depends on the applicable M351 through M366 clarity gates and on M407, model-comparison release gate, per the roadmap. Before release, M407 verifies plain-language beginner review, L0 prepared no-compute access, open routes, optional context without access gates, Windows, WSL, macOS, and Linux claims where a live lane exists, exact tool and source versions, provider-claim freshness, local lab preflight and cleanup, no browser-side model processing, no voice requirement, the no-assumed-knowledge standard, assessment integrity, accessibility, and honest limits. The M406 credential additionally waits for the applicable M133 through M140 identity, assessment, evidence, privacy, and credential decisions; those credential dependencies do not delay open teaching.
