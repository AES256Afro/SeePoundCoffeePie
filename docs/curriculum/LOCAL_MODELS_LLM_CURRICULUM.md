# Local Models and LLMs curriculum

Last reviewed: 2026-08-30

## School purpose

This school teaches what language models are, how to run them locally, how to prepare and evaluate data, how to adapt or train small models, and how to operate local model systems safely.

SeePoundCoffeePie provides the education, progress record, assessments, lab downloads, and credential records. It does not run inference, process learner datasets, fine-tune models, train models, host weights, or supply shared GPU compute.

Actual model work happens on a learner-controlled computer, home server, workstation, institution-managed lab, or explicitly chosen external environment.

All published content is visible and directly open. Suggested preparation is an optional refresher, never a gate.

## Scale target

- 13 core learning paths
- 60 to 65 courses
- 280 to 340 modules
- 700 to 900 units
- At least 70 guided labs
- 13 path capstones
- At least 7 applied credentials
- 5 later specialization paths

## Teaching rules

- Define every new term before relying on it.
- Separate ordinary software, machine learning, and language-model behavior.
- Explain why a method exists before teaching a library call.
- Use small, inspectable examples before large model workflows.
- Keep tool-neutral concepts separate from versioned tool instructions.
- State hardware, storage, download, and time estimates before every lab.
- Give a no-compute learning route wherever the learning goal permits it.
- Never promise that a model fits based only on a broad hardware category.
- Verify actual model, quantization, context, batch, runtime, and tool versions in the lab preflight.
- Compare a changed model with an unchanged baseline.
- Treat failed or negative results as useful evidence.
- Require license, data-rights, privacy, safety, and reproducibility work throughout the curriculum.
- Do not use an LLM to grade an applied credential.

## Course entry and unit design

Every course that suggests earlier knowledge presents three equal choices:

1. **Start now.** Open the course immediately and define the required terms in place.
2. **Review a refresher.** Open a short practice set for the specific ideas used here.
3. **Read the short context.** Read one bookmarkable page with the terms, assumptions, one diagram, and one worked example.

The learner can dismiss the preparation panel. None of the choices changes access, completion, assessment eligibility, or the ability to return later. Each `Optional refreshers` line in this blueprint compiles to that complete panel; it is never displayed alone as a prerequisite warning.

Each bookmarkable unit teaches one main idea in about 5 to 15 minutes and uses this shape:

1. **What this helps you do:** one plain outcome, without a marketing header.
2. **New words:** short definitions before abbreviations or library names appear.
3. **Why this exists:** the problem, earlier approach, and important tradeoff.
4. **Small example:** an inspectable case before a real model workflow.
5. **Predict:** one low-pressure question about what should happen.
6. **Observe:** a diagram, prepared trace, table, log, metric, or small result.
7. **Try it:** a knowledge exercise or an optional learner-controlled lab step.
8. **Explain the result:** distinguish observation, inference, and uncertainty.
9. **Stop or clean up:** save the exact position and remove temporary resources.
10. **Return later:** one retrieval prompt using a different example.

Applied and advanced units add a command or configuration explainer with:

- which shell or tool receives the command;
- what each meaningful option and placeholder does;
- which files, processes, ports, downloads, and hardware resources it may affect;
- expected output and normal variation;
- common failure messages in plain language;
- a safe stop, retry, rollback, and cleanup route.

After about 35 to 50 minutes of concentrated work, the course provides a saved stopping point, a brief recap, and a clear next step. It does not use countdowns, overdue labels, or streak pressure.

Teaching pages use a readable text column and reserve wider space for diagrams, comparisons, model-lifecycle maps, logs, tables, and code. Decorative dashboards and large sales-style headers do not take space from instruction. Every diagram has a useful text equivalent; all controls work by keyboard; color is never the only signal; motion can be paused or removed; 200 percent zoom and narrow screens do not require two-direction scrolling; and no unit requires voice, audio, or video.

## Original local-model guide

**Tess Rowan** is a model-testing researcher who helps learners turn vague claims into small reproducible comparisons. Tess works from an ordinary lab notebook, keeps the unchanged baseline visible, and is most interested in failed cases that reveal a limit. She is direct and patient, but does not use Mara's incident language, Rin's system-repair role, or Mira's network-workshop framing. Tess appears only when a short note helps a learner read evidence, choose a baseline, or document uncertainty. She is not a sales voice or a decoration on every page.

## Optional preparation paths

These appear as `Start now`, `Review refresher`, and `Read short context` choices.

- Computer basics
- Files and folders
- Command-line foundations
- Python foundations
- Virtual environments and packages
- Git and reproducibility
- Math for computing
- Linux foundations
- Networking basics
- Security and lab safety

None of these restrict access.

## Platform and hardware lanes

Platform support and hardware capacity are separate decisions. A machine that appears to have enough memory may still lack a supported runtime, driver, architecture, or training library.

Every local-model lab follows the [Lab, assessment, and credential standard](LAB_ASSESSMENT_CREDENTIAL_STANDARD.md) and declares an exact tested platform and H0 through H4 capacity combination.

| Platform route | Shared manifest lane | Normal use and limits |
| --- | --- | --- |
| No-compute lesson or prepared trace | `reading-only` | Any current browser-capable device; L0 explanations, planning, calculations, prepared results, and safety cases |
| Windows native | `windows-native` | Verified native runtimes and L1 or bounded L2 work only; PowerShell and Command Prompt instructions are labeled separately |
| Windows with WSL | `windows-wsl` | Linux command-line workflows on Windows; filesystems, networking, drivers, and accelerators are not assumed identical to a separate Linux host |
| Windows Linux VM | `windows-vm` | CPU demonstrations and reproducible Linux environments; accelerator passthrough is supported only when the exact lab verifies it |
| macOS Apple Silicon | `macos-native` | Native Apple Silicon runtimes and unified-memory workflows, with exact chip, operating-system, and tool versions |
| macOS Intel | `macos-native` | CPU and supported accelerator workflows only where separately tested; an Apple Silicon result is not accepted as Intel evidence |
| macOS Linux VM | `macos-linux-vm` | Linux-specific CPU workflows and environment practice; no assumed GPU passthrough |
| Linux CPU | `linux-native` or `linux-vm` | CPU inference, data, evaluation, tiny demonstrations, and environment work according to the lab preflight |
| Linux NVIDIA | `linux-native` or `linux-vm` | Accelerator work only with exact tested driver, runtime, library, model, precision, and memory requirements |
| Linux AMD or another accelerator | `linux-native` or `linux-vm` | Offered only for lab and tool combinations verified on that accelerator stack |
| Institution-managed environment | `institution-managed-lab` | The institution states identity, data, network, retention, cost, and cleanup boundaries |
| Learner-controlled external compute | `learner-selected-external-compute` | Optional for larger work; begins with identity, budget, storage, network, data, shutdown, and deletion controls |

No foundation course requires a paid account, an accelerator, or a model download.

| Capacity class | Typical environment | Suitable work |
|---|---|---|
| H0 | Any current computer or tablet | Reading, prepared traces, planning, memory calculations, license analysis, safety cases |
| H1 | About 16 GB system memory and 25 to 50 GB free disk | Small quantized inference, tokenization, data work, evaluation subsets, tiny demonstrations |
| H2 | About 8 to 12 GB VRAM, or 16 to 32 GB unified memory | Small-model adapters, practical evaluation, retrieval, local inference |
| H3 | About 16 to 24 GB VRAM, or 32 to 64 GB unified memory | Larger inference, substantial adapter work, small-model training |
| H4 | At least 48 GB aggregate accelerator memory | Distributed training and advanced research labs |

These lanes are routing guidance only. Architecture, precision, context, batch size, sequence length, cache, runtime, and operating-system overhead all affect actual fit.

## Path 1: Understand language models

Level: absolute beginner

Optional refreshers: none

Hardware: H0

Target: 4 courses, 18 to 24 modules, 60 to 80 units

### Course 1.1: AI, machine learning, and language models

Modules:

1. Ordinary software and learned systems
2. Examples, patterns, and predictions
3. What a model stores
4. What a language model does
5. What a language model does not know
6. When not to use an LLM

Exercises:

- Classify tasks as ordinary software, machine learning, or language-model work.
- Identify a deterministic rule that should remain normal code.
- Separate stored model behavior from a database lookup.
- Explain one limitation without using the word `magic`.

### Course 1.2: Tokens, context, and generation

Modules:

1. Text becomes tokens
2. Vocabulary and token identifiers
3. Context as current working input
4. Predicting the next token
5. Sampling settings
6. Why fluent output may be false

Exercises:

- Split prepared text using several simplified tokenizers.
- Compare character, word, and subword representations.
- Estimate how prompt and output share a context budget.
- Predict the effect of a low or high temperature setting.

### Course 1.3: The model lifecycle

Modules:

1. Data collection and rights
2. Pretraining
3. Supervised fine-tuning
4. Preference tuning
5. Evaluation
6. Quantization and packaging
7. Inference and retirement

### Course 1.4: Responsible and realistic use

Modules:

1. Uncertainty and hallucination
2. Bias and representation
3. Privacy and confidential information
4. Attribution and licenses
5. Environmental and hardware cost
6. Human review and non-AI fallbacks

Capstone:

- Produce a plain-language plan for one harmless local model use case. Include its data flow, boundaries, risks, limits, evaluation plan, and non-AI fallback.

## Path 2: Build a local model lab

Level: beginner

Optional refreshers: Path 1, computer basics, files and folders

Hardware: H0 to H1

Target: 5 courses, 20 to 25 modules, at least 8 labs

### Course 2.1: Files, terminals, and processes

- Paths and current directories
- Commands, options, arguments, input, output, and exit status
- Processes and resource use
- Configuration and log files
- Stopping and recovering

### Course 2.2: Python for model experiments

- Scripts and notebooks
- Values, collections, loops, and functions
- Reading structured data
- Importing packages
- Errors and small tests

### Course 2.3: Environments and dependencies

- System Python and project Python
- Virtual environments
- Package versions
- Lock files
- Native dependencies
- Rebuilding from a clean environment

### Course 2.4: Math and tensors without mystery

- Scalars, vectors, matrices, and tensors
- Shapes and dimensions
- Data types and precision
- Probability and distributions
- Seeds and repeatability
- Loss as a measured error signal

### Course 2.5: Reproducible experiment folders

- Configuration files
- Input and output folders
- Checksums
- Version control
- Experiment notes
- Redacted environment reports

Labs:

1. Inventory a computer without uploading the report.
2. Create and remove an isolated Python environment.
3. Run a small tensor operation.
4. Record memory, storage, and accelerator information safely.
5. Save a deterministic experiment.
6. Verify downloaded starter files by checksum.
7. Reproduce a provided result from a clean folder.
8. Create a redacted environment report.

Capstone:

- Build a clean, documented, reproducible local lab from a provided manifest.

## Path 3: Run models locally

Level: beginner to intermediate

Optional refreshers: Paths 1 and 2

Hardware: H1, with H2 recommended for standard labs

Target: 5 courses and at least 8 labs

### Course 3.1: Estimate hardware and storage

- Parameters and approximate storage
- Precision and quantization
- CPU memory, accelerator memory, and unified memory
- Context and cache costs
- Disk space and download budgets
- Why broad model-size labels are not guarantees

### Course 3.2: Model repositories and artifacts

- Base, instruction, and chat models
- Tokenizer files
- Weight formats
- Quantized formats
- Revisions and checksums
- Model cards
- Licenses and use restrictions

### Course 3.3: Local inference runtimes

- Runtime responsibilities
- CPU and accelerator backends
- Command-line and desktop interfaces
- Local service interfaces
- Offline behavior
- Loopback and network exposure

Versioned lab variants may cover llama.cpp, Ollama, MLX, and other reviewed local runtimes. The concepts remain tool-neutral.

### Course 3.4: Prompt templates, context, and sampling

- System and user roles
- Chat templates
- Stop sequences
- Temperature and probability controls
- Seeds and repeatability
- Context pressure
- Prompt injection as an input risk

### Course 3.5: Benchmark and troubleshoot inference

- Load time
- Time to first token
- Tokens per second
- Memory use
- Quality comparisons
- Out-of-memory symptoms
- Format and template mismatches
- Log-first diagnosis

Labs:

1. Compare three model cards.
2. Estimate whether three models are plausible for one machine.
3. Verify a model artifact revision and checksum.
4. Run a first offline inference.
5. Compare two quantization levels.
6. Compare deterministic and creative sampling.
7. Measure speed and memory.
8. Diagnose a deliberately broken configuration.
9. Confirm that a selected workflow functions without network access.

Capstone:

- Recommend and justify a model, runtime, quantization, and context setting for one machine and bounded use case.

## Path 4: Prepare data for language models

Level: intermediate

Optional refreshers: Paths 1 and 2

Hardware: H1

Target: 5 courses and at least 8 labs

### Courses

1. Define a model task and its data needs
2. Data rights, provenance, consent, and permitted use
3. Text, instruction, conversation, and preference formats
4. Cleaning, normalization, deduplication, and private-information removal
5. Splits, leakage, versioning, and dataset cards

Key modules:

- Collection purpose
- Source and rights inventories
- Copyright and contract boundaries
- Personal and sensitive information
- Consent and deletion
- Instruction and response structure
- Conversation roles
- Exact and near duplication
- Quality sampling
- Labeling guidance
- Train, validation, and test splits
- Benchmark contamination
- Dataset lineage
- Dataset cards

Labs:

1. Build a source and rights inventory.
2. Convert a small approved source set into a documented structure.
3. Find exact and near duplicates.
4. Find and remove synthetic private information.
5. Design a labeling guide.
6. Detect deliberate split leakage.
7. Write a dataset card.
8. Create a versioned, checksummed dataset release.

Capstone:

- Create a small, legally usable, privacy-reviewed training dataset with a complete dataset card and reproducibility record.

## Path 5: Evaluate language models

Level: intermediate

Optional refreshers: Paths 1 through 3

Hardware: H1 to H2

Target: 5 courses and at least 7 labs

### Courses

1. Define success and establish a baseline
2. Build deterministic evaluation cases
3. Use metrics without mistaking them for truth
4. Conduct human and pairwise evaluation
5. Test safety, security, and regressions

Key modules:

- Task definitions
- Acceptance criteria
- Baselines
- Exact and structured-output checks
- Perplexity and its limits
- Semantic metrics
- Risks of model-based judges
- Blind comparisons
- Rubric design
- Evaluator agreement
- Confidence and uncertainty
- Regression suites
- Adversarial and misuse cases
- Failure categories

Labs:

1. Create a 30-case evaluation set.
2. Compare a base model with an instruction model.
3. Design a blind pairwise rubric.
4. Measure evaluator disagreement.
5. Find deliberate evaluation leakage.
6. Run a small safety evaluation.
7. Build a repeatable regression report.

Capstone:

- Evaluate two local models for one bounded task and defend a recommendation with evidence, uncertainty, and visible failed cases.

## Path 6: Local retrieval and grounded generation

Level: intermediate

Optional refreshers: Paths 3 and 5, Networking Basics refresher

Hardware: H1 to H2

Target: 4 courses and at least 7 labs

### Courses

1. Decide when retrieval is appropriate
2. Ingest, split, embed, and index documents
3. Measure retrieval quality
4. Generate grounded answers with citations and protections

Key modules:

- Retrieval compared with fine-tuning
- Chunk size and overlap
- Embeddings
- Sparse and dense retrieval
- Ranking and reranking
- Recall and precision
- Citation coverage
- Access control
- Prompt injection in retrieved documents
- Poisoned indexes
- Data deletion and index rebuilding

Labs:

1. Build a small offline document index.
2. Compare chunking strategies.
3. Measure retrieval quality.
4. Add source citations.
5. Test a malicious synthetic document.
6. Enforce document-level access.
7. Delete a source and verify that it is no longer retrieved.

Capstone:

- Build and document a private local reference assistant with retrieval tests, citation requirements, and a removal procedure.

## Path 7: Fine-tune with LoRA and QLoRA

Level: intermediate to advanced

Optional refreshers: Paths 3, 4, and 5

Hardware: H2, with a bounded H1 micro-lab

Target: 6 courses and at least 11 labs

### Courses

1. Decide whether to fine-tune
2. Loss, gradients, optimizers, batches, and epochs
3. Supervised fine-tuning data
4. Adapters, LoRA, and parameter-efficient methods
5. Controlled experiments, checkpoints, and recovery
6. Evaluate, merge, export, and document an adapter

Key modules:

- Capability compared with behavior
- SFT objectives
- Learning rate
- Batch size and gradient accumulation
- Overfitting
- Chat templates
- Target modules
- Rank and scaling
- Quantized base models
- Checkpoint integrity
- Resume behavior
- Seeds and reproducibility
- Hyperparameter comparisons
- Adapter merging
- License compatibility
- Model cards

Labs:

1. Estimate memory before starting.
2. Overfit a tiny dataset intentionally.
3. Diagnose the overfit result.
4. Run a micro LoRA job.
5. Compare two ranks.
6. Compare two learning rates.
7. Stop and resume from a checkpoint.
8. Compare with the unchanged base model.
9. Merge and unmerge an adapter.
10. Export a local inference artifact.
11. Reproduce one run from a clean environment.

Capstone:

- Fine-tune a small model for a narrow, non-sensitive task and demonstrate a measured improvement without unacceptable regression.

## Path 8: Train a small language model from scratch

Level: advanced

Optional refreshers: Paths 2, 4, and 5; Path 7 is helpful

Hardware: H2 to H3, with tiny H1 demonstrations

Target: 6 courses and at least 12 labs

### Courses

1. Design and train a tokenizer
2. Understand transformer components
3. Build a streaming data pipeline
4. Implement and verify a training loop
5. Optimize and checkpoint training
6. Run scaling, ablation, and release experiments

Key modules:

- Character, word, subword, and byte tokenization
- Vocabulary design
- Embeddings and positions
- Attention
- Feed-forward layers
- Residual connections and normalization
- Causal masking
- Batching and sequence packing
- Loss and backpropagation
- Optimizers and schedules
- Mixed precision
- Gradient clipping
- Checkpoint integrity
- Validation curves
- Scaling experiments
- Ablation design
- Compute and energy records

Labs:

1. Compare two tokenizers.
2. Implement a small attention calculation.
3. Trace tensor shapes through a transformer block.
4. Train a tiny character model.
5. Train a small token model.
6. Resume a stopped run.
7. Compare context sizes.
8. Compare model sizes under a fixed data budget.
9. Remove one component and measure the effect.
10. Plot training and validation curves.
11. Reproduce a run from its manifest.
12. Produce a complete release record.

Capstone:

- Train a small language model from scratch and publish a reproducible technical report. Weights do not need to be uploaded to SeePoundCoffeePie.

## Path 9: Preference tuning and behavior

Level: advanced

Optional refreshers: Paths 5, 7, and 12

Hardware: H2 to H3

Target: 4 courses and at least 7 labs

### Courses

1. Define behavior goals and failure boundaries
2. Build preference data
3. Understand reward models and direct preference methods
4. Evaluate helpfulness, refusal, drift, and retained capability

Modules include chosen and rejected responses, annotator guidance, preference ambiguity, reward-model concepts, direct preference optimization, safety tuning, over-refusal, sycophancy, capability regression, and distribution shift.

Capstone:

- Adapt one small model's behavior and document both improvements and regressions.

## Path 10: Quantization and performance

Level: advanced

Optional refreshers: Paths 3 and 5

Hardware: H2 to H3

Target: 5 courses and at least 9 labs

### Courses

1. Profile model loading and generation
2. Understand precision, quantization, and calibration
3. Convert and validate model formats
4. Tune context, cache, batching, and concurrency
5. Explore distillation and speculative methods

Capstone:

- Produce an optimized local model package with measured quality, speed, memory, and recovery tradeoffs.

## Path 11: Serve and operate local models

Level: advanced

Optional refreshers: Paths 3, 10, and 12; Networking Basics refresher

Hardware: H2 or higher

Target: 5 courses and at least 9 labs

### Courses

1. Expose a local inference interface safely
2. Streaming, queues, concurrency, cancellation, and limits
3. Reproducible service packaging
4. Authentication, network boundaries, and resource controls
5. Monitoring, upgrades, rollback, and recovery

Every network service lab binds to loopback by default. A learner must receive a separate warning and security checklist before any LAN exposure.

Capstone:

- Operate a private local model service with access control, health checks, resource limits, monitoring, backup, rollback, and recovery instructions.

## Path 12: Security, privacy, licensing, and responsible release

Level: beginner through advanced

Optional refreshers: Path 1; advanced units may link to Path 3

Hardware: H0 to H1

Target: 5 courses and at least 9 labs

This path appears throughout every applied credential.

### Courses

1. Threat-model a local model system
2. Secure model, dataset, and package supply chains
3. Defend retrieval and tool-using systems
4. Protect privacy, secrets, logs, and learner data
5. Read licenses and create responsible release records

Capstone:

- Review a proposed local model release and produce an approve, revise, or reject decision with evidence.

## Path 13: Distributed training and reproducible research

Level: advanced

Optional refreshers: Paths 8, 10, and 12

Hardware: H4 or an explicitly chosen external environment

Target: 5 courses and at least 8 labs

### Courses

1. Distributed-training strategies
2. Data parallelism, sharding, and checkpointing
3. Memory, communication, and failure recovery
4. Experiment tracking and ablations
5. Replicate and critique a published result

Capstone:

- Reproduce a bounded published experiment or conduct a small original ablation with a complete record of deviations and negative results.

## Specialization paths

### Code models

- Source-code rights
- Secret removal
- Code tokenization
- Fill-in-the-middle objectives
- Unit-test evaluation
- Insecure code generation
- Repository-scale context

### Multimodal local models

- Image-text data
- Encoders and projectors
- Vision-language prompting
- Adapter training
- Image privacy and consent
- Accessibility and caption quality

### Multilingual models

- Cross-language tokenization
- Low-resource data
- Translation contamination
- Culture-specific evaluation
- Dialect and representation risks

### Domain adaptation

- Domain vocabulary
- Confidentiality and rights
- Expert labeling
- High-stakes limitations
- Domain-specific evaluation
- Refusal and escalation boundaries

### Local agents and tool use

- Structured output
- Tool schemas
- Permission boundaries
- Sandboxing
- Prompt injection
- State and memory
- Failure recovery
- Tool-use evaluation

## Exercise catalog

- Match a term to a concrete example.
- Put a model lifecycle in order.
- Read a model or dataset card.
- Compare two licenses.
- Estimate memory and disk use.
- Choose prompting, retrieval, adaptation, training, or ordinary code.
- Identify data leakage.
- Inspect a training curve.
- Diagnose an out-of-memory log.
- Find a bad data split.
- Predict the effect of a configuration change.
- Compare two evaluation reports.
- Critique a misleading benchmark.
- Repair a reproducibility manifest.
- Build a threat model.
- Redact synthetic private information.
- Review a release.
- Write a dataset, model, or system card.
- Defend a technical choice in writing.

## Credential sequence

Credential requirements control issuance only. Every related explanation, unit, lab guide, rubric, and capstone remains open before and after an attempt.

| Record or credential | Honest claim | Minimum evidence direction |
| --- | --- | --- |
| Local AI Foundations completion record | The learner completed the defined foundation material | Versioned unit and exercise completion; no independent-skill claim |
| Applied Skill: Run a Local Model | The learner can select, verify, run, observe, stop, and remove one bounded local model workflow | Server-owned knowledge check plus a minimal redacted manifest proving model revision, runtime, resource observation, network state, and cleanup |
| Applied Skill: Prepare LLM Training Data | The learner can build a rights-aware, validated, reproducible dataset for one declared purpose | Knowledge check plus schema, provenance summary, validation report, split checks, data card, and deletion plan; no raw dataset upload |
| Applied Skill: Evaluate a Local Model | The learner can define a baseline, use held-out cases, classify failures, and report uncertainty | Knowledge check plus evaluation design, versioned aggregate results, failure categories, and limitations; no prompts containing private information |
| Applied Skill: Build and Evaluate Local Retrieval | The learner can ingest, retrieve, measure, cite, update, and delete one bounded local document collection | Knowledge check plus source inventory, access policy, chunking and retrieval configuration, aggregate evaluation, citation review, injection tests, rebuild, and deletion proof; no source documents uploaded |
| Applied Skill: Fine-Tune with LoRA or QLoRA | The learner can plan, run, resume, compare, and clean up a controlled adapter experiment | Knowledge check plus configuration, hashes, resource record, checkpoint policy, baseline comparison, and reproducibility result; no weights or private data upload |
| Applied Skill: Release a Local Model Responsibly | The learner can document intended use, rights, risks, evaluation, limitations, rollback, and retirement | Reviewed model or system card, license and provenance record, safety evaluation, threat model, release checklist, and rollback plan |
| Applied Skill: Operate a Private Local Model Service | The learner can expose a local service deliberately, constrain it, observe it, recover it, and remove it | Knowledge check plus redacted service manifest, bind and access policy, health and failure checks, resource limits, log policy, rollback, and cleanup proof |
| Local LLM Practitioner certificate | The learner demonstrated several applied local-model capabilities in one integrated project | A declared subset of applied credentials, server-owned assessment, integrative capstone, human review, appeal path, and versioned issuance record |
| Advanced Local LLM Engineer certificate | The learner demonstrated advanced data, adaptation, evaluation, systems, and research skills | Multiple advanced applied credentials, reproducible capstone, independent review, calibrated rubric, appeal and revocation support; offered only after the assessment infrastructure exists |

The evidence service accepts only the disclosed minimal manifest fields. It does not receive model weights, adapters, raw training data, private prompts, complete logs, secrets, or private repositories. A manifest can support a skills claim but does not prove authorship or legal identity by itself.

## First publication sequence

### Release A: Foundations

- Paths 1 and 2
- 9 courses
- 40 to 50 modules
- 120 to 160 units
- 8 small local labs
- Completion records only

### Release B: Local model operator

- Path 3
- First model-running labs
- Evidence manifest pilot
- First applied skill pilot

### Release C: Data and evaluation

- Paths 4 and 5
- Dataset and model cards
- Human-review workflow

### Release D: Fine-tuning

- Path 7
- Low-resource and standard routes
- Checkpoint and recovery exercises

### Release E: Systems

- Paths 6, 10, 11, and 12
- Retrieval, performance, serving, security, licensing, and operations

### Release F: Advanced work

- Paths 8, 9, and 13
- From-scratch training, preference tuning, and distributed research

### Release G: Specializations

- Code, multimodal, multilingual, domain, and local-agent paths

## Source and freshness requirements

- Technical claims use primary documentation where possible.
- Every tool-specific lab records tested versions and a review date.
- Model and dataset references use exact revisions.
- A compatibility statement expires when its test window does.
- Hardware recommendations are rechecked against the exact lab.
- Removed or obsolete tooling remains in a clearly marked history unit rather than silently disappearing.
- A negative or unverified result is labeled honestly.

Core references include:

- [Hugging Face fine-tuning documentation](https://huggingface.co/docs/transformers/training)
- [Hugging Face PEFT documentation](https://huggingface.co/docs/transformers/peft)
- [Hugging Face TRL documentation](https://huggingface.co/docs/trl/index)
- [Hugging Face Dataset Cards](https://huggingface.co/docs/hub/datasets-cards)
- [llama.cpp](https://github.com/ggml-org/llama.cpp)
- [NIST AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework)
