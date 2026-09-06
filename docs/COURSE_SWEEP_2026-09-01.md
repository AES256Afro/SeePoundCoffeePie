# 2026-09-01 course and curriculum sweep

Reviewed: 2026-09-01

This record is a full sweep of the course material and course plans, with extra depth on the Linux school and the Local Models and LLMs school. It compares the project's stated goals with what the source actually contains, lists concrete defects with file and line references, and feeds the Phase 28 milestones in [MILESTONES.md](../MILESTONES.md). It is review evidence, not a release record.

Method: every curriculum planning artifact was read in full (the Linux, Local Models, Networking, Cybersecurity, Reality versus Fiction, no-assumed-knowledge, and lab standards documents, both first-release packets, the blueprint, and the roadmap), the shipped open-academy slice was audited against its own packets and validator, the programming lesson source was spot checked, and the automated gates were run fresh.

## Evidence collected during this sweep

- `npm test`: 89 files, 1,071 tests, all passing.
- `npm run check:academy-curriculum`: passing; 9 planning artifacts, 70 relative links, 144 canonical declarations, 0 duplicate IDs.
- Repository history: first commit 2026-08-24, 93 commits by 2026-08-31. The whole project is about one week old, which makes the plan-to-capacity question below the central risk.

## Verdict: does the project match its stated goals?

Mostly yes, and unusually so, at the level of what has actually shipped.

- The stated teaching identity (teach from zero, define every term, one action at a time, expected result, recovery path, no hype, no locked teasers in the academy model) is genuinely implemented in the shipped material. The foundation programming lessons carry real on-ramps with term definitions, numbered steps, acceptable variation, and named recovery actions ([curriculum.ts](../src/data/curriculum.ts) lines 67 to 118 are a representative example). The shipped open-academy slice enforces its 14-part unit anatomy with a fail-closed validator at module load ([academy-content.ts](../src/data/academy-content.ts) lines 850 to 1009), which is stronger enforcement than most real products apply to content.
- The honesty discipline is the project's strongest asset. Plans are labeled plans, source evidence is separated from staging and production evidence, and dated release records avoid claiming later changes.
- The mismatches are not mismatches of direction. They are (1) arithmetic and drift: the planning documents disagree with each other and sometimes with themselves; (2) one overstated shipped claim ("first complete course" for a course at 2 of its 6 specified units); (3) technical currency gaps in the LLM blueprint and topic gaps in the Linux blueprint that contradict the roadmap's own milestone text; and (4) scale: the plan targets 8,000 to 12,000 units while roughly 2 percent exists, with no authoring-capacity statement anywhere.

## Findings 1: shipped programming courses

Spot checks found the six programming courses consistent with the teaching standard and with the release records. No defects were logged against lesson content in this sweep. The known access-gate exception (Practical Python and Practical C++ completion gates) is correctly documented as legacy behavior in the root README and the roadmap, but not in the product blueprint; see Findings 5.

## Findings 2: Linux school blueprint

Source: [LINUX_CURRICULUM.md](curriculum/LINUX_CURRICULUM.md). Overall a disciplined, safety-literate blueprint whose directory atlas and platform-lane design are accurate and careful. Defects, in priority order:

1. Arithmetic self-contradiction. Line 575 claims about 450 to 650 total hours, but the 15 per-path estimates sum to 822 to 1,144 hours. The module claim (420 to 500 at line 569) also undershoots the roughly 600 modules its own course tables imply.
2. Dual milestone systems with no crosswalk. The blueprint uses LNX-M001 through LNX-M078; the roadmap uses M161 through M210. Neither file references the other's IDs, and they already disagree: M210 names four credentials (Linux Foundations, Linux Desktop and Migration, Linux Server Operator, Linux Administrator) while the blueprint defines three with different names (Desktop Practitioner, System Administrator, Systems Engineer, lines 1421 to 1448).
3. Roadmap-required topics with no blueprint home: hard and symbolic links plus inode semantics (M189; the terms appear nowhere in the blueprint), a documentation-and-help course (M178; promised by the blueprint's own LNX-M033 but absent from the LNX-300 table), sticky bit (M184), quotas (M181), package holds (M193), SMB and NFS by name (M204), SSH port forwarding (M198), and shell history, completion, and safe interruption (M177). Text editors (nano first, vi survival) are missing entirely, even though later labs edit files under `/etc`.
4. The L0 to L4 risk-class promise is unimplemented. Line 213 says every practical item declares a shared risk class, but the required lab-label list (lines 245 to 263), the entire lab inventory, and the lab-safety acceptance criteria never carry the field.
5. A real WSL safety hazard is unnamed. WSL auto-mounts the host drive under `/mnt/c`, so a destructive lab command inside WSL can destroy host files. The isolation rules (lines 237 to 242) treat WSL as a default isolation lane and never mention the mount.
6. Beginner bootstrap breaks in the first path. LNX-000 declares no preparation, yet LNX-003 and LNX-004 (lines 600 to 601) require shell commands and checksum verification three paths before the shell is taught.
7. Inventory bookkeeping: 14 completion records for 15 paths (lines 1322 to 1335); the Windows comparison course (lines 546 to 561) has no course ID or path home; lab totals appear as both "at least 150" (line 571) and 191 (line 1242).
8. LNX-800 recommends preparation from the Networking school, which publishes later in the roadmap order, with no self-contained fallback.
9. Unroadmapped scope: LNX-1405 and LNX-1406 (fleet compliance, high availability, eBPF, a 100-host estate capstone) have no corresponding roadmap milestone.
10. Missing infrastructure decisions: no document decides the reviewed hypervisors, firewall front end, container runtime, or pinned distribution releases that version-tested labs require, and nothing plans the lab-package build pipeline or the recurring retest matrix the freshness policy demands.

## Findings 3: Local Models and LLMs school blueprint

Source: [LOCAL_MODELS_LLM_CURRICULUM.md](curriculum/LOCAL_MODELS_LLM_CURRICULUM.md). The product boundary, open-access rules, freshness process, and honest-limits framing are exemplary, and the core fundamentals (fit arithmetic, precision table, GGUF framing, safetensors, LoRA and QLoRA, retrieval-versus-training distinctions) checked out as correct. Defects, in priority order:

1. The milestone alignment table (lines 1970 to 2003) is wrong. Roughly 20 of 35 rows mislabel canonical milestones from M308 onward (for example the table's "M312, LoRA and QLoRA" is actually M318 in the ledger). The blueprint says the ledger is canonical, so the table must be rewritten and its references made checkable.
2. Mixture-of-experts models are entirely absent. By late 2026 a large share of commonly run local models are MoE, and the blueprint's central fit heuristic (parameters times bits over eight) is wrong for them without the total-versus-active parameter distinction. This also weakens the M399 estimator.
3. FP8 is missing despite M396 requiring it, along with FP4 microscaling context. The precision primer jumps from BF16 to INT8.
4. Importance-matrix calibration and IQ-series quants are missing despite M398 requiring importance-matrix context. Learners will meet these names in their first real repository browse. Also, line 377's claim that the M in Q4_K_M does not mean medium is itself wrong (S, M, and L are size tiers of the tensor-mix recipe; the correct caution is that M is not a certified quality tier), and K-quant effective bits per weight run above the nominal number on every row, not just Q6_K, which biases the taught fit math low by 15 to 25 percent.
5. KV-cache estimation is named but never taught, although long-context local use is frequently cache-bound and M396 plus M399 both require cache awareness.
6. Sequencing: the live LoRA training lab (LML-704) precedes the course that teaches loss, gradients, and optimizers (LM-803), inverting the ledger's M317-before-M318 order.
7. Numbers disagree: total hours are claimed as 320 to 480 (line 140) but sum to 392 to 633; extension labs appear as 35 or more (line 136), at least 35 for 100 total (line 1401), and 45 for 110 total (line 1418).
8. Phase 26 (local versus hosted comparison, M383 to M407) has no owning path. Its conceptual half re-teaches LM-100 and LM-1000 material, while M389, M390, M392, M394, M402, M404, and M405 have no curriculum home at all, and the M402 learner-side consent flow touches the product boundary and is undesigned.
9. Credential granularity mismatch: M329 names about eight credentials; the blueprint defines three.
10. The L0 no-compute guarantee has a gap: line 453 requires an L0 or L1 alternative, but L1 involves the learner's own machine, and several core labs list L1 as their floor, while Phase 26 requires an L0 prepared no-compute route for everything.
11. LM-1303 packs ten specialization branches into one course with a lab spanning L0 through L4; M328 says these arrive only after shared foundations, so they should be staged as future waves.

## Findings 4: published open-academy slice

Sources: [academy-manifest.ts](../src/data/academy-manifest.ts), [academy-content.ts](../src/data/academy-content.ts), [AcademyRoute.tsx](../src/AcademyRoute.tsx), and the two course packets. The slice (8 units, about 6,100 words) is structurally excellent, technically honest, and its enforcement machinery is ahead of its prose. Defects:

1. Two sources of truth for time disagree by up to 2x: manifest units say 12 to 25 minutes while content scope says about 7 to 18 minutes for the same units. Only the manifest value renders today, so the conflict is latent.
2. RVF-102 promises the learner will distinguish syntax, runtime, and logic errors (manifest line 360) but ships no runtime-error artifact among its four evidence records.
3. RVF-101's manifest outcome describes an ordering exercise; the shipped practice is a category sort. One of the two must change.
4. The term "learned model" is used in choices without "learn" ever being defined; the packet's definition ("adjust numbers using examples. It does not mean human understanding") was dropped, losing the course's best anti-anthropomorphism line.
5. LM-101-U1 leads with the compressed abstraction ("numerical behavior adjusted from examples") after the packet's concrete plant-photograph on-ramp was cut, violating the example-before-abstraction rule.
6. Source records drift from the packet's required schema: `observedAt` instead of `lastVerifiedAt` with a named reviewer, no evidence label, no platform scope; the review window is 181 days where the rule says at most 180; all six LM units share one generic NIST AI RMF source that does not sit near the specific claims; the two-source rule applies only to reality comparisons.
7. In all 8 knowledge checks the correct answer is the most hedged option, so a learner can pass by pattern-matching caution.
8. The interface places the page-boundary statement, preparation choices, and stop-and-resume content inside collapsed disclosures, while the packet says required instruction and stop conditions are never hidden in a closed disclosure.

## Findings 5: cross-document consistency

1. The completion-gate tension is handled in the root README and roadmap but not in [PRODUCT_BLUEPRINT.md](PRODUCT_BLUEPRINT.md), which presents conjunctive prerequisites as permanent design and whose release gate requires enforcement that M103 will remove. The no-assumed-knowledge standard also asserts every published page is directly open while the legacy locks remain.
2. The root README calls the shipped RVF-100 "its first complete course" while the Reality versus Fiction curriculum specifies RVF-100 as 6 comparisons in 3 modules and the shipped registry has 1 module with 2 units. The check validates the doc and the manifest separately and never compares them, so the drift is invisible to CI.
3. Counts drift across restatements: the curriculum README states 110 Local Models labs as fact where the school doc makes 110 conditional; Linux labs appear as 150, 176, and 191; the networking module count mixes categories; "Releases A through G" in the crosswalk matches nothing in the LM doc's waves 1 through 7.
4. The blueprint's long-range aggregates all exceed the summed school inventories with no derivation: 450 to 600 courses versus about 397 documented, 8,000 to 12,000 units versus about 4,700 to 6,500 declared, 750 or more labs versus about 640.
5. The academy execution boundary ("the site must not run a virtual machine or container") is never reconciled with the programming runner, which runs learner code in Cloudflare Sandbox VMs under its own contract. One carve-out sentence is missing everywhere.
6. The shared lab contract is restated at different lengths (18-part versus 21-part page shape, 7 versus 11 access lanes, two package layouts), and the LLM-grading rule appears at three different strengths across three documents.
7. `check:academy-curriculum` covers only 9 artifacts; the Linux, Networking, Cybersecurity, and lab-standard documents are outside it, and the root README overstates the check's coverage.
8. Metadata: three school docs carry no review date; the roadmap requires per-milestone owners and none are recorded; decisions D02, D03, D09, and D10 block the credential track and the clarity release gates and remain unowned.
9. Naming drift: Phase 5A versus 5B for the same live baseline, Cadet Record versus Learner Record, points versus XP, path capstones versus portfolio projects.

## Scope realism

Documented inventories sum to roughly 397 courses, 2,050 to 2,500 modules, and 630 to 650 labs across the five schools, against blueprint targets of 450 to 600 courses and 8,000 to 12,000 units. Shipped teaching today is 180 programming lessons plus 8 reading units, roughly 2 percent of the unit target. At a conservative 3 to 5 authoring hours per reviewed unit the target represents 25,000 to 60,000 hours, and the review cadences already promised (six-month Linux lab reviews, quarterly LLM tool reviews, monthly lab integrity checks) are a permanent staffing commitment no document costs out. The plans are honest about status but silent about feasibility. A one-page capacity and triage statement would make the roadmap trustworthy at its edges, not just its center.

## Prioritized suggestions

1. Fix truth-in-labeling first: the RVF-100 "first complete course" claim, the PRODUCT_BLUEPRINT gate contradiction, and the runner carve-out sentence. These are cheap and protect the project's most valuable property, its honesty discipline.
2. Make the counts self-verifying: one generated or CI-compared source of truth for every inventory number, with the check extended to all planning artifacts and to registry-versus-doc comparison.
3. Repair the two school blueprints' internal arithmetic and their roadmap crosswalks before any further authoring builds on them (Linux hours and credential names; LLM alignment table).
4. Close the technical currency gaps in the LLM blueprint (MoE, FP8 and FP4, imatrix and IQ quants, KV-cache math) since they contradict M396 through M399 as written and would mislead 2026 learners.
5. Close the Linux topic gaps the roadmap already requires (editors, links and inodes, help course, sticky bit, quotas, holds, SMB and NFS, port forwarding) and implement the L0 to L4 lab labels plus the WSL `/mnt/c` warning.
6. Fix the published slice's eight authoring defects; they are small, and the slice is the template every future school copies.
7. Write the authoring-capacity and triage statement, and record owners for milestones and the blocking decisions.
8. Decide reference lab toolchains and the low-spec learner floor (new decisions D11 and D12) before lab authoring scales.

## Milestones added by this sweep

Phase 28 (M411 through M430) and decisions D11 and D12 in [MILESTONES.md](../MILESTONES.md) track these findings: M411 to M417 for consistency and truth repairs, M418 to M422 for the Linux blueprint, M423 to M426 for the Local Models blueprint, M427 to M429 for the published slice, and M430 for lab-package and retest infrastructure.

## Repairs applied later on 2026-09-01

The same day, source-level repairs landed for most Phase 28 milestones. This addendum records what changed so the findings above stay readable as the original review.

- Published slice (M427 to M429): the manifest and content time estimates now agree, with a test asserting per-unit equality; the error-kinds unit gained the missing runtime exception artifact, so syntax, runtime, and logic errors are all shown; the first comparison's practice became the documented build-order card exercise; the `Learn` definition returned to the first unit's word list with its "does not mean human understanding" line; a condensed plant-photograph narrative now precedes the model definition; three knowledge checks gained an over-hedged wrong option so the most cautious answer is no longer always correct; the page boundary, before-we-compare block, recap, limits, and stop-and-resume content render visibly instead of inside collapsed disclosures; every unit now cites at least two official sources (a NIST CSRC machine-learning definition was verified live and added for the model units); source records carry an evidence label, were re-verified on 2026-09-01 (the Python 3.14.7 version note was confirmed accurate), and sit inside an exact 180-day review window enforced by a test.
- Linux blueprint (M418 to M422): totals now equal the sum of their parts (89 courses, about 620 to 700 modules, about 830 to 1,160 hours, 191 labs and capstones); the missing topics were added (editors, links and inodes, help and documentation course, sticky bit, quotas, package holds, SMB and NFS, port forwarding, shell history and interruption); every lab family carries an L0 to L4 risk-class range and the WSL lane warns about `/mnt` host-drive exposure; an LNX-M to M161-M210 crosswalk table exists; certificates adopt the M210 names; the first path's command steps carry embedded micro-lessons or a graphical route.
- Local Models blueprint (M423 to M425): the milestone alignment table was rewritten against the ledger with exact titles; mixture-of-experts sizing, FP8 and FP4 context, importance-matrix and IQ quants, corrected K-quant naming and effective bits, and a worked KV-cache estimate were added; hours and lab counts were reconciled; training concepts now precede the live LoRA lab; the final course's ten specializations are staged as future waves; every lab declares an L0 prepared route.
- Comparison path (M426): the proposed [local versus hosted comparison path](curriculum/LOCAL_VS_HOSTED_COMPARISON_PATH.md) gives every Phase 26 milestone an owned home, designs the fair-comparison consent flow, and proposes the credential reconciliation.
- Consistency and truth (M411 to M417): the README no longer calls the partial reality course complete, and a test fails if a partial course is described as complete; the product blueprint carries the legacy-gate caveat, a conditional release gate, the baseline-name reconciliation, and an academy-expansion section; `check:academy-curriculum` now validates 14 planning artifacts including a Linux inventory assertion; the execution-boundary carve-out sentence exists in the lab standard and curriculum README; the capacity and triage statement is in the roadmap; every school document carries a review date.
- Verification after the repairs: 1,075 unit tests, lint, text-style, learner-language, academy-curriculum, bundle budgets, and the academy Chromium suite with its WCAG scan all pass. None of this is staging or production evidence.

## Lesson audit applied later on 2026-09-01

After the planning repairs, three independent audits reviewed all 240 authored lessons: the Python and C++ foundation tracks (with behavior claims compiled against a real clang++ and check regexes executed in Node), the C# and Java foundation tracks, and the two continuing courses. The verdict was strongly positive: outputs are real, terms are defined before use, recaps stay inside what was taught, and the file shows deliberate cross-language care (Java's `==` lessons are correctly restricted to primitives; C++ out-of-bounds behavior is described honestly). Nine genuine grading or output defects and a set of accuracy issues were found and fixed the same day:

- Grading and output bugs fixed: the C++ and Java capstone ordering exercises claimed output that their comment-only function bodies could not produce (real print bodies restored); two C# fill-in checks accepted swapped blanks (now anchored to their labels); the Practical Python mixed-key bugfix never manifested its bug with the supplied call order, so the runner would have passed the unfixed program (call order swapped: buggy now prints 3, fixed prints 5); one Practical Python check regex passed a program that copied instead of moved the accumulator reset (anchored to the loop body); three ordering exercises rejected fully valid arrangements (cards whose relative order the language does not force were merged, leaving a single valid order, and the ordering-piece floor in the course test moved from five to four to allow it).
- Honesty and accuracy fixes: the C++ assignment-in-condition lesson now states that C++ accepts the faulty `=` and treats the assigned value as true (verified by compilation), while the C# and Java versions state the opposite compiler behavior; four define-before-call explanations stopped claiming ordering rules that C# local functions and Java class methods do not have; two mission blurbs stopped promising `return` values their modules never teach; four branch-ordering exercises now state the assumed variable value their claimed output depends on and define the comparison operator they use early; the Practical C++ reset bugfix now says its starter does not compile and why; thirteen C++ fragment lessons now say their lines run inside the supplied main frame; Python Boolean values are capitalized as `True` and `False`; smaller gaps (argument defined at first use, `static` framed at first sight, unsized array syntax explained, a duplicate eyebrow label, an ambiguous hint) were closed.
- Deliberately deferred, tracked as a follow-up task: quote-pair backreferences in foundation check regexes (the runner's real execution already catches mismatched quotes) and whether Practical C++ should accept the `+=` update form its checks currently reject.

All content regeneration (packed foundation curriculum, packed Practical C++ JSON) and the complete gate list pass after these fixes; bundle caps were consciously raised with dated comments where reviewed teaching text grew.
