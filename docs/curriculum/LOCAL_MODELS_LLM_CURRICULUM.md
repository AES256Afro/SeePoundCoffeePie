# Local Models and Language Models Curriculum Blueprint

## Status

This document defines the intended Local Models and Language Models school for SeePoundCoffeePie. It is a curriculum, lab, assessment, and product blueprint. It does not claim that every described course, lab, project, assessment, or credential is already published.

The school is designed for an absolute beginner who may not know what a model, token, terminal, graphics processor, or gigabyte is. It also provides direct entry points for developers, system administrators, data practitioners, and experienced model operators.

Every published learning page remains open. Practical model work runs only in a learner-controlled environment. SeePoundCoffeePie teaches, supplies prepared examples and versioned lab packages, records progress, and validates deliberately submitted evidence. It does not run a model, train a model, inspect local hardware, read local prompts, or process a learner's dataset in the page.

## School purpose

The school helps a learner answer six questions:

1. What is a model, and what is it actually doing?
2. Which kind of model fits the task?
3. Should the workload run locally, through a cloud service, or on an organization-managed platform?
4. Can the available hardware run it safely and usefully?
5. How will quality, privacy, cost, licensing, and failure be measured?
6. How can the work be reproduced, maintained, explained, and stopped?

The curriculum begins before product names. It teaches the model, data, task, hardware, runtime, and evidence boundaries first. Named tools then become concrete examples of those boundaries.

## Learner promise

A learner who starts at the first unit should not need prior knowledge of artificial intelligence, programming, Linux, statistics, or computer hardware.

This curriculum applies the academy-wide [No assumed knowledge standard](NO_ASSUMED_KNOWLEDGE_STANDARD.md) to every learner. It does not create a special learner label, diagnosis, catalog category, or access mode.

On first use, each important term receives:

1. a plain definition;
2. the reason the idea exists;
3. one everyday example;
4. one technical example;
5. a common misunderstanding;
6. a safe way to observe it;
7. a later retrieval question.

The school does not present a model as a mind, a database, an oracle, or a compressed copy of the internet. It does not promise that local use makes a workload private, cheap, accurate, unbiased, secure, or legally usable. Each of those is a separate question with evidence.

## Non-negotiable open-access rule

All published paths, courses, modules, units, labs, projects, assessment blueprints, rubrics, and source notes are directly visible.

- No course is locked by completion, points, a streak, a certificate, an account, or payment.
- No advanced unit is hidden because an earlier course is incomplete.
- A guest can read every published teaching page and download every public lab package.
- A signed-in learner gains synchronized progress, private notes, submissions, and credential records. Signing in does not unlock otherwise hidden teaching.
- Assessment answer keys and rotating item variants may remain server-side. That protects an assessment, not the curriculum.

Every course with recommended preparation displays three equal actions:

1. **Start now**
2. **Review a refresher**
3. **Read the short context summary**

Preparation is advice. It is never an access gate.

## Product and computation boundary

### What the website may do

- render lessons, diagrams, worked examples, prepared traces, and static model outputs;
- provide inert, versioned, checksummed lab packages;
- provide hardware-sizing worksheets that run on disclosed learner-entered numbers;
- score authored knowledge checks;
- store progress, bookmarks, assessment results, and credential records;
- receive a learner-selected, redacted evidence manifest when an assessment requires it;
- validate the structure and consistency of that manifest;
- link to current upstream documentation and model repositories.

### What the website must not do

- run inference in the browser or on the site server for these courses;
- imply that a page demo executed a local or remote model when it displays prepared output;
- inspect the learner's processor, memory, graphics hardware, files, running processes, or network;
- download model weights onto the learner's computer;
- launch Ollama, llama.cpp, LM Studio, Python, a shell, a container, or a virtual machine;
- train, fine-tune, quantize, convert, merge, or serve a model;
- accept raw model weights, checkpoints, adapters, private datasets, private prompts, embeddings, or vector indexes;
- silently send prompts or learner data to an external provider;
- claim a local lab succeeded only because the learner opened or checked off a page.

All model execution and data processing happen only after the learner deliberately follows instructions in a learner-owned or explicitly authorized environment.

### Required label for prepared demonstrations

Every page that displays a canned completion, token stream, embedding, retrieval result, benchmark, training curve, or failure trace includes:

> Prepared example. No model is running on this page. Your text and files are not being sent to a model by this example.

If a future feature uses a provider, browser runtime, or hosted model, it requires a separate reviewed product boundary, explicit disclosure, data flow, consent, retention policy, cost policy, and milestone approval. This curriculum does not assume that feature exists.

## What a model is

A model is a learned mathematical mapping from an input to an output. During training, a learning process adjusts many numeric settings called parameters so that the model becomes better at a defined objective on examples. During inference, software uses the learned parameters to calculate an output for a new input.

A language model commonly estimates which token is likely to come next. A token is a piece of text chosen by a tokenizer, not necessarily a word. Repeating that next-token calculation can produce a sentence, code, structured text, or an incorrect answer that still sounds fluent.

This definition is deliberately modest:

- A model can reproduce patterns without understanding them as a person does.
- Parameters are learned numbers, not rows in a fact database.
- A larger parameter count does not prove better quality for every task.
- A longer context window does not guarantee that every included detail will be used correctly.
- Fluent output is not evidence of factual accuracy.
- A local file is not proof of lawful provenance or safe behavior.

## First-hour route

The first hour is useful even if the learner never installs a runtime.

| Segment | Learner question | Activity | Checkpoint |
| --- | --- | --- | --- |
| 0 to 10 minutes | What is a model? | Compare a rule, a lookup table, and a learned model | Explain the difference in one sentence |
| 10 to 20 minutes | What does a language model receive? | Split a prepared sentence into example tokens | Explain why tokens are not always words |
| 20 to 30 minutes | What happens when it answers? | Step through prepared next-token probabilities | Separate generation from retrieval |
| 30 to 40 minutes | What are local, cloud, and managed models? | Trace three data-flow diagrams | Identify who receives the prompt in each |
| 40 to 50 minutes | Can my computer run one? | Read RAM, VRAM, unified-memory, and disk examples | Name which figures are estimates |
| 50 to 60 minutes | What can go wrong? | Review five believable but false outputs | Write one verification step |

At 30 minutes and 50 minutes, the page displays a genuine stopping point. Progress is saved. There is no countdown, overdue state, or penalty for taking a break.

## Curriculum scale

The complete school is intentionally substantial:

| Measure | Full catalog target |
| --- | ---: |
| Open learning paths | 13 |
| Substantial courses | 65 |
| Modules | 340 to 420 |
| Short learning units | 950 to 1,250 |
| Core guided labs | 65, one per course |
| Additional guided and challenge labs | 35 or more |
| Path portfolio projects | 13 |
| Integrated capstones | 5 |
| Applied skill credentials | 3 |
| Complete guided study | About 320 to 480 hours |

Time ranges are planning aids, not deadlines. A learner may complete only the route relevant to a local writing assistant, a private retrieval system, a model evaluation role, a small fine-tuning experiment, or research preparation.

## Learning rhythm

Courses use a predictable Microsoft Learn-style hierarchy:

~~~text
School
  Learning path
    Course
      Module
        Short unit
        Exercise
        Guided lab
        Checkpoint
~~~

### Standard module rhythm

1. **Situation:** one concrete problem.
2. **Context check:** one retrieval question with an immediate explanation option and no assumption that an earlier detail was retained.
3. **New words:** plain definitions before abbreviations.
4. **Why the idea exists:** historical or design context.
5. **How it works:** explanation, diagram, and prepared example.
6. **Predict:** choose an outcome before it is revealed.
7. **Practice:** use a static exercise or learner-run lab.
8. **Verify:** compare independent evidence.
9. **Reality check:** separate a common story from observable behavior.
10. **Recover:** clean up, roll back, or record why no change occurred.
11. **Checkpoint:** explain the skill without copying the lesson.
12. **Break:** save the exact place and offer a clear next action.

Typical timing:

- 5 to 15 minutes per reading or exercise unit;
- 30 to 60 minutes per module;
- 45 to 120 minutes per guided lab, divided into checkpoints;
- a visible break after about 35 to 50 minutes of concentrated work;
- a new session begins with a short recap, not an assumption that details were retained.

Breaks are part of careful technical work. They are not rewards that can be lost.

## Optional preparation and refresher paths

Every item in this table is optional. Each advanced course still defines the minimum context required to start.

| Refresher | Plain outcome | Typical time | Related school |
| --- | --- | ---: | --- |
| P0.1 Computer pieces | Distinguish processor, memory, storage, program, process, file, and network service | 30 to 60 minutes | Computer and Linux foundations |
| P0.2 Files and folders | Navigate a folder, recognize an extension, extract an archive, and keep an original copy | 30 to 60 minutes | Linux foundations |
| P0.3 Terminal without fear | Read a prompt, command, option, argument, path, exit status, and stop command | 45 to 90 minutes | Linux School |
| P0.4 Numbers and units | Use bits, bytes, decimal and binary prefixes, rates, percentages, and simple multiplication | 45 to 90 minutes | Computer foundations |
| P0.5 Python reading | Read a variable, list, function call, loop, import, error, and configuration file | 2 to 4 hours | Programming foundations |
| P0.6 Data tables | Distinguish row, column, field, record, missing value, label, split, and duplicate | 60 to 120 minutes | Data foundations |
| P0.7 Probability intuition | Interpret likelihood, average, distribution, sample, variation, and uncertainty | 2 to 4 hours | Math refresher |
| P0.8 Vectors and matrices | Treat a vector as an ordered list of numbers and a matrix as a rectangular arrangement | 2 to 4 hours | Math refresher |
| P0.9 Linux process basics | Inspect files, processes, memory, storage, ports, and logs without changing the host | 2 to 4 hours | Linux School |
| P0.10 Privacy and licensing | Identify personal data, permission, purpose, retention, license, and attribution | 60 to 120 minutes | Cybersecurity School |

### Entry routes

- **I only want to understand models:** Path 1, then the reading-only units in Paths 5 and 12.
- **I want to run a model privately on my computer:** Paths 1, 2, 3, 5, and 12.
- **I want retrieval over my own documents:** Paths 1 through 6, then Path 12.
- **I want to fine-tune:** Paths 1 through 7, with Paths 4 and 5 treated as essential preparation even though they remain open choices.
- **I want to train a tiny model to learn how training works:** Paths 1, 2, 4, 5, and 8.
- **I operate systems:** Paths 1 through 3, then 5, 10, 11, and 12.
- **I want research depth:** Open any course directly, or use Paths 1, 4, 5, 7 through 10, and 13 as a suggested sequence.

## Learner-controlled environment lanes

| Lane | Environment | Best for | Important limits |
| --- | --- | --- | --- |
| A: Read and reason | Any browser-capable device | Concepts, prepared traces, sizing, data-flow work, licensing, evaluation design | No live model behavior |
| B: Windows native | Windows with a named supported runtime | Desktop workflows, CPU or supported GPU inference | Backend, driver, and file-path behavior vary |
| C: Windows with WSL | Supported Windows and WSL distribution | Python, Linux-oriented tools, scripting, some accelerator workflows | WSL is not identical to a conventional Linux host |
| D: macOS native | Intel or Apple Silicon Mac | Desktop runtimes, llama.cpp-style work, supported Apple acceleration | Intel and Apple Silicon claims must be tested separately |
| E: Linux native | Supported Linux distribution | Broad runtime, GPU, serving, data, and training work | Highest chance of affecting a daily-use host |
| F: Disposable VM or container | Learner-owned isolated environment | CPU labs, service operation, recovery, and reproducibility | Accelerator access and performance may differ from native use |
| G: Organization-managed lab | Explicitly approved institutional environment | Shared hardware and governed data | Organization policy and administrators control the boundary |
| H: Learner-selected external compute | Deliberately provisioned hosted machine | Optional larger experiments | Can create cost, data exposure, public services, and cleanup work |

The course declares one or more canonical manifest lanes from the shared lab standard: reading-only, windows-native, windows-wsl, windows-vm, macos-native, macos-linux-vm, linux-native, linux-vm, learner-remote-server, institution-managed-lab, or learner-selected-external-compute.

No lane is called universally best. The correct lane depends on workload, hardware, privacy, accessibility, cost, policy, and maintenance ownership.

## Core decision maps

### Local, public cloud, and organization-managed hosting

| Question | Local on learner hardware | Public cloud or model API | Organization-managed or corporate-hosted |
| --- | --- | --- | --- |
| Who operates compute? | Learner or local administrator | Provider | Organization or contracted operator |
| Who may receive prompts? | Local software and any configured integrations | Provider and listed subprocessors under its terms | Organization systems and approved vendors |
| Up-front cost | Existing or purchased hardware | Usually none beyond setup | Existing platform or project cost |
| Ongoing cost | Power, maintenance, storage, and time | Requests, tokens, storage, egress, or reservation | Infrastructure, staff, support, and governance |
| Latency | No internet round trip, but hardware may be slow | Network and queue latency plus fast provider hardware | Depends on location, capacity, and platform |
| Quality range | Limited by models and hardware the learner can operate | May include larger or specialized proprietary models | Depends on approved catalog and tuning |
| Control | High control over files, versions, and network behavior | Limited to provider controls and contract | High policy control, but not necessarily learner control |
| Privacy | Can keep data on one machine if every component is offline and trusted | Data leaves the machine unless a specific architecture says otherwise | Can meet stronger governance, but access and logging must be checked |
| Maintenance | Learner owns updates, compatibility, security, and backups | Provider owns much of the platform | Shared across platform, security, legal, and product teams |
| Offline use | Possible after all required artifacts are present | Usually unavailable | Possible only if the platform supports it |
| Failure mode | Local resource limits or misconfiguration | Provider outage, quota, account, policy, or network | Capacity, identity, platform, policy, or operational failure |

**Reality versus fiction:** Local does not automatically mean private. A desktop application can send analytics, check licenses, fetch models, call a remote API, or expose a local service. Privacy is established by the full data flow and verified network behavior.

**Reality versus fiction:** Cloud does not automatically mean careless. A governed hosted system can have strong contractual, access, retention, and audit controls. The learner must examine the exact service and configuration.

### Open source, open weights, and proprietary

| Label | What may be available | What the learner still must inspect |
| --- | --- | --- |
| Open-source software | Runtime or training code under an approved software license | Version, dependencies, security, maintenance, and whether model weights are included |
| Open weights | Downloadable learned parameters under a weight license | Use restrictions, redistribution, attribution, acceptable-use terms, data disclosures, and missing training code |
| Open model project | A project may publish code, weights, documentation, and some data information | Each component can have a different license and completeness |
| Source-available | Source can be viewed under terms that may not meet an open-source definition | Modification, redistribution, commercial use, field-of-use, and service restrictions |
| Proprietary model | Weights and training details are not generally distributed | Provider terms, data use, retention, security, output rights, quality, cost, and exit plan |

The course never substitutes the word open for a license review.

## Model and task taxonomy

Model type, input modality, output modality, training stage, architecture, file format, quantization, and runtime are different properties. Course pages keep them separate.

| Model or artifact type | Plain purpose | Typical input and output | Important caution |
| --- | --- | --- | --- |
| Base language model | Continue token patterns learned during pretraining | Tokens to next-token probabilities | Not automatically a safe or cooperative chat assistant |
| Instruct model | Follow a request format after instruction-oriented post-training | Instruction and context to response | Can follow a harmful, mistaken, or ambiguous request |
| Reasoning-oriented model | Spend more computation or use post-training intended to improve multi-step performance | Problem and context to answer, sometimes with internal or visible intermediate text | The label is not proof of consciousness, truth, or human-like reasoning |
| Chat model | Take messages with roles and a chat template | System, user, and assistant messages to assistant message | Wrong chat template can degrade behavior |
| Code model | Generate, explain, or transform code-like text | Text or code to text or code | Generated code still requires review, tests, licenses, and security checks |
| Embedding model | Map an item to a numeric vector for comparison | Text, image, or another item to vector | Similar vectors are not proof of truth or permission |
| Reranker | Score a query and candidate together to reorder results | Query plus candidate to relevance score | Usually slower than vector search and still can rank badly |
| Vision-language model | Combine image information with language tasks | Image and text to text or structured output | Can miss visual details and inherits image privacy concerns |
| Image generation model | Generate or transform images | Text and optional image to image | Different task and safety boundary from a vision-language model |
| Speech recognition model | Convert audio to text or labels | Audio to text | Accent, noise, consent, and sensitive speech matter |
| Speech synthesis model | Generate speech-like audio | Text and optional voice conditioning to audio | Voice rights, impersonation, and disclosure matter |
| Multimodal model | Accept or produce more than one modality | Some combination of text, image, audio, or video | Supported modality does not mean equal quality across all inputs |
| Classifier | Assign labels or scores | Item to class or probability | A confidence score is not a guarantee |
| Adapter | Store a smaller learned change applied to a compatible base model | Base plus adapter to modified behavior | Requires the exact compatible base, tokenizer, and license |

## Training, fine-tuning, and inference

| Activity | Plain description | What changes | Typical risk |
| --- | --- | --- | --- |
| Training from scratch | Begin with untrained or randomly initialized parameters and learn from a large example set | Most or all model parameters | High data, compute, cost, and engineering demand |
| Continued pretraining | Continue the base learning objective on more domain text or data | Many model parameters or selected components | Can shift capability and overwrite useful behavior |
| Supervised fine-tuning | Train on example inputs paired with desired outputs | All parameters or a selected subset | Can memorize, overfit, or amplify dataset problems |
| Adapter tuning | Train small added matrices or selected components, such as LoRA | Adapter parameters, not usually the whole base | Compatibility and evaluation still matter |
| QLoRA | Keep a quantized base for memory efficiency while training LoRA adapters with higher-precision computation where needed | Adapter parameters | Quantized loading does not make training free or risk-free |
| Preference tuning | Train behavior from comparisons or preference signals | Model or adapter behavior | Preferences can encode narrow or harmful judgments |
| Inference | Use fixed learned parameters to calculate outputs | No trained parameters change during ordinary use | Output can still be wrong, unsafe, private, or expensive |
| Retrieval-augmented generation | Retrieve external material and place selected content in the prompt before inference | Index and prompt change; model weights need not change | Retrieval can miss, leak, or inject misleading material |

**Reality versus fiction:** Prompting is not training. A prompt can change the current input and context, but it does not normally rewrite the stored weights.

**Reality versus fiction:** Retrieval is not fine-tuning. Retrieval supplies selected external context at inference time. Fine-tuning changes learned parameters or adapters.

**Reality versus fiction:** Fine-tuning is not a reliable way to insert frequently changing facts. Retrieval, tools, or ordinary databases are often better fits.

## Hardware in plain language

| Resource | Plain purpose | Model-work examples | Common misunderstanding |
| --- | --- | --- | --- |
| CPU | General-purpose processor | Tokenization, data preparation, control flow, and inference | CPU inference can work, but possible does not mean fast |
| GPU | Highly parallel processor with its own or shared memory | Matrix operations for inference and training | A GPU name alone does not establish usable memory or software support |
| NPU | Specialized accelerator for supported neural operations | Selected local inference workloads | An NPU cannot run every model or runtime merely because it is an AI accelerator |
| RAM | Main system working memory | Runtime, model layers, context cache, data, operating system | Installed RAM is not all available to one process |
| VRAM | Memory attached to a discrete GPU | Weights, activations, context cache, temporary buffers | Weight file size is not the complete VRAM requirement |
| Unified memory | One memory pool shared by CPU and integrated GPU on some systems | Weights and runtime buffers without a separate VRAM pool | The operating system and applications still use the same pool |
| Storage | Durable file space | Weights, datasets, caches, checkpoints, environments, logs | A downloaded model may require extra temporary and conversion space |
| Memory bandwidth | Rate at which data moves through memory | Often important to token generation speed | Processor core count alone does not predict inference speed |

### Sizing worksheet

For a first rough estimate:

~~~text
raw weight bytes = parameter count x bits per stored weight / 8
~~~

If parameter count is written in billions and decimal gigabytes are acceptable:

~~~text
raw weight GB is approximately parameter billions x bits per weight / 8
~~~

Examples:

| Parameter count | FP32 raw weights | FP16 or BF16 raw weights | INT8 ideal raw weights | INT4 ideal raw weights |
| ---: | ---: | ---: | ---: | ---: |
| 1 billion | 4 GB | 2 GB | 1 GB | 0.5 GB |
| 3 billion | 12 GB | 6 GB | 3 GB | 1.5 GB |
| 7 billion | 28 GB | 14 GB | 7 GB | 3.5 GB |
| 13 billion | 52 GB | 26 GB | 13 GB | 6.5 GB |
| 32 billion | 128 GB | 64 GB | 32 GB | 16 GB |
| 70 billion | 280 GB | 140 GB | 70 GB | 35 GB |

These are arithmetic examples, not fit promises. Actual requirements can be higher because of:

- scales, metadata, tensor alignment, and mixed quantization;
- tokenizer and runtime state;
- context or key-value cache;
- batch size and simultaneous requests;
- activations, gradients, optimizer state, and master weights during training;
- graphics-driver and compute-library reservations;
- operating-system and other application use;
- partial GPU offload and duplicated buffers;
- conversion, checkpoint, cache, and temporary disk space.

Every active lab uses a preflight measurement on the exact machine, artifact, runtime, context length, and concurrency. A broad label such as low, medium, or high hardware is not evidence of fit.

## Number formats and quantization primer

Quantization stores or computes some values with fewer bits or a narrower numeric representation. It can reduce file size and memory use and may improve speed on compatible hardware. It can also reduce quality, change numerical behavior, or make a model incompatible with a runtime.

| Name | Approximate storage per value | Plain explanation | Common use and caution |
| --- | ---: | --- | --- |
| FP32 | 4 bytes | 32-bit floating point with broad precision and range | Common reference or training format; large for local inference |
| FP16 | 2 bytes | 16-bit floating point with less range and precision than FP32 | Common accelerator format; some operations need care |
| BF16 | 2 bytes | 16-bit floating point with a wide exponent range and fewer precision bits | Often useful for training on supported hardware |
| INT8 | 1 byte in the ideal simple case | 8-bit integer representation plus quantization information | Often a quality and memory compromise, but implementation matters |
| INT4 | 0.5 byte in the ideal simple case | 4-bit integer representation plus grouping and scale information | Much smaller; quality and backend support must be measured |

The simple byte figures describe the core value width. Real files include scales, group data, metadata, and tensors that may use different formats.

### Common GGUF-style names

GGUF is a container format used by llama.cpp and compatible tools. GGUF is not itself one quantization level.

| Example label | Beginner reading | Important limit |
| --- | --- | --- |
| F16 or BF16 | Most weight tensors use a 16-bit floating format | Exact tensor types are recorded in the file |
| Q8_0 | A common 8-bit block quantization | Not byte-for-byte identical to generic INT8 |
| Q6_K | A K-family quant near six bits per weight on average | Actual bits per weight and speed depend on tensor mix and backend |
| Q5_K_M | A mixed K-family quant around five bits | M indicates a mixed choice for selected tensors, not medium quality |
| Q4_K_M | A widely encountered mixed K-family quant around four bits | It is a filename convention, not a universal best choice |
| Q4_0 | An older or simpler four-bit block scheme | Can differ materially from Q4_K_M |
| Q3_K_M | A smaller mixed K-family quant around three bits | More compression can increase quality loss |
| Q2_K | A very small K-family quant around two bits | Fit can improve while task quality becomes unacceptable |

The course teaches learners to inspect the exact model card, quantization method, converter version, runtime version, tensor inventory, and evaluation results. It does not rank a quant by label alone.

**Reality versus fiction:** A 4-bit model is not necessarily four times faster than a 16-bit model. Memory traffic, kernels, offload, context, batching, and hardware support affect speed.

**Reality versus fiction:** Quantization cannot add knowledge or repair a weak base model. It changes representation and sometimes execution behavior.

**Reality versus fiction:** A smaller file fitting in RAM does not prove the full runtime fits. Context cache and runtime buffers still matter.

## Artifacts, formats, and runtimes

### Common artifact files

| Artifact | Purpose | Security and compatibility question |
| --- | --- | --- |
| Model card | Documents intended use, limits, training context, evaluation, and license | Is it complete, current, and specific to this revision? |
| Configuration | Describes architecture and settings | Does the runtime support this architecture and configuration? |
| Tokenizer files | Define how input becomes token identifiers | Is this the exact tokenizer required by the weights? |
| Chat template | Defines message roles and serialization | Does the runtime apply the intended template? |
| Safetensors weights | Store tensors in a format designed to avoid arbitrary code execution during loading | Are all required shards present and from the expected revision? |
| Framework checkpoint | Stores weights and sometimes optimizer or training state | Can loading it execute serialized code, and is the source trusted? |
| GGUF file | Packages tensors and metadata for llama.cpp-style runtimes | Which architecture, quantization, tokenizer metadata, and runtime version are required? |
| Adapter files | Store LoRA or another learned delta | Which exact base revision, target modules, rank, and license apply? |
| ONNX model | Represents a computation graph for compatible runtimes | Are all operators supported by the selected execution provider? |
| MLX or platform-specific artifact | Supports a particular framework or accelerator ecosystem | Is conversion documented and is the platform supported? |
| Dataset card | Documents collection, fields, rights, limitations, and intended use | Are provenance, consent, license, and sensitive data handled honestly? |
| Evaluation manifest | Records tasks, prompts, references, metrics, environment, and results | Can another person reproduce the comparison? |

### Runtime roles

| Runtime or interface | Role in the curriculum | Maintenance note |
| --- | --- | --- |
| llama.cpp-style command line | Makes model file, context, offload, threads, sampling, and local-server behavior visible | Commands and flags require versioned testing |
| Ollama-style model manager and service | Teaches local pulling or importing, model recipes, API use, inventory, removal, and the distinction between local and configured cloud routes | Tags, manifests, APIs, local and cloud routes, and defaults require current review |
| LM Studio-style desktop workflow | Teaches graphical discovery, download, load, chat, local server, logs, and cleanup | Screens and bundled runtimes change and require dated instructions |
| Transformers-style Python workflow | Teaches explicit tokenizer, model, device, precision, generation, and evaluation code | Dependency and accelerator matrices must be pinned |
| MLX-style Apple workflow | Teaches a platform-specific route on supported Apple hardware | It is an optional lane, not a universal replacement |

These are tool families and implementation examples. The curriculum does not declare a permanent best application or recommend a specific live model by default. Any named model used in a lab is a version-pinned example with a review date, license check, artifact hash or revision, resource measurement, and a replacement plan.

## Download, trust, and verification baseline

Before a learner downloads weights:

1. Start from the publisher's or project's documented repository.
2. Record the organization, repository, exact revision or commit, and access date.
3. Read the model card, license, intended use, known limits, and required files.
4. Confirm the architecture and runtime compatibility.
5. Estimate download size, installed size, working disk, RAM or VRAM, and cleanup space.
6. Prefer formats that do not rely on arbitrary code execution during loading.
7. Review whether custom code or remote code execution is requested. Do not enable it casually.
8. Download through a documented client or browser path.
9. Verify publisher-provided checksums or a locally recorded manifest when available.
10. Inventory every file and record its size and digest.
11. Run the first load offline or with network observation where the lab supports it.
12. Remove the artifact through a documented cleanup path when the experiment is finished.

The absence of a publisher checksum is recorded as a provenance limitation. A learner-created checksum proves that a later file matches the file the learner downloaded. It does not prove that the original file was trustworthy.

## Lab safety contract

The school uses the academy-wide risk classes:

| Class | Local-model meaning | Default protection |
| --- | --- | --- |
| L0 | Read prepared traces, diagrams, cards, manifests, and results | No local changes or model execution |
| L1 | Inspect hardware, storage, files, processes, versions, or network state | Read-only commands and no private output submission |
| L2 | Download a bounded artifact or run a removable user-space model process | Exact target, resource limit, stop step, cleanup, and synthetic inputs |
| L3 | Install drivers, change a service, train, quantize, or expose a local API | Snapshot or backup, before state, recovery route, resource and port limits |
| L4 | Multi-system, distributed, adversarial, or organization-managed experiment | Isolated authorized environment, budget, administrator approval, reset, and independent review |

Every L2 through L4 lab has an L0 or L1 prepared alternative. No learner needs expensive hardware to understand the concept or complete ordinary course reading.

### Every lab page includes

- goal and why it matters;
- new terms;
- exact supported environment and tested versions;
- reading-only alternative;
- risk class and authorization scope;
- what will and will not change;
- CPU, GPU or NPU, RAM, VRAM or unified memory, disk, download, network, time, and possible cost;
- license and data classification;
- preflight measurements;
- snapshot, backup, or rebuild route;
- step-by-step procedure with expected results;
- named checkpoints and natural breaks;
- resource ceilings and stop conditions;
- troubleshooting by symptom;
- independent final verification;
- cleanup and artifact-retention choice;
- minimal evidence;
- information that must never be uploaded;
- sources, licenses, last review date, and maintenance owner.

### Stop conditions

A lab stops before execution when:

- the target file, model, repository, revision, adapter base, disk path, or environment differs from the instructions;
- available memory or disk is below the measured requirement;
- a download, license, or cost is not understood;
- the runtime asks to execute unreviewed remote code;
- the intended loopback service binds to a non-loopback address;
- a dataset contains real private, regulated, confidential, or unlicensed material;
- thermal, stability, memory-pressure, storage, quota, or billing warnings appear;
- a learner cannot name the cleanup or recovery route.

## Curriculum map

The 13 paths below contain exactly 65 substantial courses. Course IDs remain stable even when units are revised.

| Path | Courses | Main outcome | Typical complete-path time |
| --- | ---: | --- | ---: |
| LM-100: Models from zero | 6 | Explain model types, inputs, outputs, lifecycle, core vocabulary, and deployment choices | 20 to 30 hours |
| LM-200: Build a safe local lab | 5 | Measure hardware, choose a lane, and create a reproducible environment | 22 to 34 hours |
| LM-300: Run models locally | 6 | Obtain, verify, run, compare, and remove local model artifacts | 30 to 48 hours |
| LM-400: Prepare data responsibly | 5 | Create a rights-aware, reproducible dataset pipeline | 28 to 45 hours |
| LM-500: Evaluate models honestly | 5 | Build a task-specific evaluation and make an evidence-based decision | 30 to 48 hours |
| LM-600: Retrieval and grounded generation | 4 | Build and evaluate a private retrieval pipeline | 26 to 42 hours |
| LM-700: LoRA, QLoRA, and adaptation | 6 | Decide whether to tune, run a bounded adapter experiment, and compare it fairly | 40 to 64 hours |
| LM-800: Train a tiny model from scratch | 6 | Understand and perform a small educational training loop | 44 to 72 hours |
| LM-900: Preference and behavior tuning | 4 | Understand preference data and evaluate behavior changes | 28 to 46 hours |
| LM-1000: Quantization and performance | 5 | Choose and validate a representation against fit, speed, and quality | 32 to 52 hours |
| LM-1100: Serve and operate local models | 5 | Run a private service with limits, observation, upgrades, and recovery | 34 to 56 hours |
| LM-1200: Security, licensing, and responsible release | 5 | Threat-model data and artifacts and produce an honest release record | 30 to 48 hours |
| LM-1300: Research and specialization studio | 3 | Read distributed systems work and complete a bounded specialization project | 28 to 48 hours |

No learner must finish all 65 courses. Each path opens directly and provides a five-minute context page.

## Path LM-100: Models from zero

**Outcome:** Explain what different models do, how training differs from use, what the main vocabulary means, and where data goes under local, public-cloud, and organization-managed designs.

**Recommended preparation:** None.

**Start-now promise:** Every example is static and uses plain language before notation.

| Course | Module sequence | Core guided lab and evidence |
| --- | --- | --- |
| LM-101: What a model is | Rules, lookup tables, and learned mappings; inputs and outputs; parameters as learned numeric settings; prediction and generation; capability and failure | **LML-101 Model or Not:** classify 20 systems and explain the evidence in a one-page concept map, L0, E1 |
| LM-102: Model families and modalities | Predictive and generative tasks; text; vision; image generation; audio; multimodal systems; classifiers and structured prediction | **LML-102 Task to Model:** choose suitable model families for eight scenarios and name one limitation for each, L0, E1 |
| LM-103: Training, fine-tuning, and inference | Objective and examples; training from scratch; continued pretraining; supervised tuning; adapter tuning; preference tuning; inference; retrieval | **LML-103 Lifecycle Sort:** place prepared actions and artifacts on a lifecycle map, L0, E1 |
| LM-104: Parameters, tokens, context, and sampling | Parameters and parameter count; tokenizers; token identifiers; context window; attention intuition; next-token probabilities; temperature and sampling | **LML-104 Token Walk:** inspect prepared tokenizations and step through a generated sequence, L0, E1 |
| LM-105: Embeddings, search, and reranking | Vectors without mystery; similarity; embedding models; vector search; candidate retrieval; rerankers; limits of distance | **LML-105 Neighborhood Map:** compare prepared vectors, retrieve candidates, rerank them, and explain one mismatch, L0, E1 |
| LM-106: Model access and deployment choices | Base, instruct, chat, reasoning, code, embedding, reranker, vision, and audio models; local versus public API versus corporate hosting; open source, open weights, source-available, and proprietary | **LML-106 Data-Flow Decision:** trace prompt and artifact custody for three architectures and write a conditional choice, L0, E1 |

### Reality checks

- A next-token model can write a correct explanation and a confident fabrication through the same mechanism.
- A parameter is not a stored sentence that can be opened and read.
- An embedding is useful for comparison, but it is not a secret semantic truth.
- A reasoning label describes a model and product behavior. It does not prove awareness.
- Vision support does not guarantee reliable counting, reading, spatial reasoning, or safety-critical inspection.
- Audio support does not grant permission to record, transcribe, clone, or retain a person's voice.

### Breaks and checkpoint

After LM-103, the path offers a **lifecycle break**. The learner returns by labeling inference, retrieval, fine-tuning, and training from scratch in a new scenario.

The path checkpoint requires the learner to:

- explain a model without using the word intelligence;
- distinguish seven model roles;
- explain why a token is not necessarily a word;
- trace where a prompt goes in three deployment patterns;
- name one claim that still requires evaluation.

### Portfolio project 1: Model choice memo

Choose a fictional task, compare at least three model families and three hosting approaches, identify data and license boundaries, reject at least one poor fit, and make a conditional recommendation. A good project may conclude that a rule, search index, or ordinary software is better than a model.

## Path LM-200: Build a safe local lab

**Outcome:** Understand the local computer, measure resources, estimate fit, and create a reproducible experiment folder with a tested return path.

**Recommended preparation:** LM-101 through LM-106 are useful. P0.1 through P0.4 are available.

**Start-now promise:** Prepared inventories support the full reasoning route without a compatible computer.

| Course | Module sequence | Core guided lab and evidence |
| --- | --- | --- |
| LM-201: Files, programs, processes, and terminals | File and folder; archive and checksum; program and process; terminal and shell; command anatomy; paths; exit status; safe stop | **LML-201 Read Before Run:** annotate a command and prepared process trace, then perform only harmless inspection in a chosen lane, L0 or L1, E1 |
| LM-202: CPU, GPU, NPU, and accelerators | General and parallel compute; cores and threads; discrete and integrated graphics; NPU limits; drivers; compute backends; architecture compatibility | **LML-202 Compute Inventory:** produce a redacted hardware and backend inventory and label observations versus assumptions, L1, E1 |
| LM-203: RAM, VRAM, unified memory, disk, and fit | Working versus durable memory; raw-weight arithmetic; runtime overhead; context cache; batch and concurrency; training multipliers; disk headroom | **LML-203 Fit Worksheet:** estimate three artifacts, compare to a prepared or local inventory, then record a safe no-go threshold, L0 or L1, E1 |
| LM-204: Python, environments, and dependencies | Interpreter; package; environment; version pin; lock file; driver and library layers; reproducibility; uninstall | **LML-204 Disposable Environment:** create, inspect, export, and remove a version-pinned user-space environment, L2, E2 |
| LM-205: Experiment folders, baselines, and recovery | Source register; configuration; input fixture; output; logs; hashes; manifest; baseline; one change; rollback; cleanup | **LML-205 Recovery Drill:** build an experiment skeleton, create a known-good checkpoint, make a harmless change, and restore it, L2, E2 |

### Reality checks

- A processor marketed for AI is not evidence that the selected runtime can use it.
- Total installed memory is not the same as memory available to the workload.
- Unified memory can make larger workloads possible, but it remains shared with the operating system and other applications.
- A model file that fits on disk may not fit in working memory.
- Training memory is not estimated by weight size alone. Gradients, optimizer state, activations, batches, and temporary buffers can dominate.

### Breaks and checkpoint

LM-203 ends with a **hardware planning break**. The learner returns by checking a deliberately misleading fit estimate.

The path checkpoint requires:

- an exact hardware inventory or supplied equivalent;
- a raw-weight calculation labeled as an estimate;
- an overhead and context allowance;
- an environment creation and removal record;
- a known-good baseline and recovery test.

### Portfolio project 2: Local lab readiness packet

Create a redacted system inventory, three model-fit estimates, a chosen lane, a storage plan, an environment manifest, a recovery route, and a conditional go or no-go decision. The project receives full credit for a justified no-go decision.

## Path LM-300: Run models locally

**Outcome:** Find a lawful and compatible artifact, verify what was obtained, run a bounded offline inference workflow through several interface styles, compare results, and clean up completely.

**Recommended preparation:** LM-200 or the short hardware, files, and terminal context summaries.

**Start-now promise:** Every runtime course includes prepared screenshots, transcripts, manifests, and outputs. Installing a runtime is optional.

| Course | Module sequence | Core guided lab and evidence |
| --- | --- | --- |
| LM-301: Repositories, publishers, and model cards | Repository and revision; publisher and uploader; model card; intended use; architecture; license; files; community conversion; trust boundary | **LML-301 Repository Review:** audit two prepared repositories and explain which facts are verified, claimed, missing, or stale, L0, E1 |
| LM-302: Weights, tokenizers, templates, and formats | Weight shards; safetensors; framework checkpoints; GGUF; configuration; tokenizer; vocabulary; special tokens; chat template; adapters; compatibility | **LML-302 Artifact Map:** assemble a complete artifact set from a prepared file inventory and diagnose three missing or mismatched parts, L0, E1 |
| LM-303: Download, verify, inventory, and remove | Exact revision; file selection; download clients; partial downloads; checksum; digest limitations; safe loading; cache location; disk headroom; removal | **LML-303 Verified Download:** download one small version-pinned teaching artifact or use a fixture, create a digest manifest, and remove it, L1 or L2, E2 |
| LM-304: llama.cpp-style command-line inference | Binary and backend; model path; prompt and chat template; context; threads; GPU layers; sampling; streaming; logs; exit and cleanup | **LML-304 Visible Inference:** run or inspect a small local command-line session with synthetic prompts and record configuration, timing, memory, output, and stop behavior, L2, E2 |
| LM-305: Ollama-style managed local workflow | Local service; model manifest or recipe; local versus configured cloud route; pull and import; tags; run; API; inventory; storage; stop; delete; network observation | **LML-305 Managed Runtime:** use a pinned local workflow or prepared trace to load, query, inventory, stop, and remove an example model, L2, E2 |
| LM-306: LM Studio-style desktop workflow and runtime comparison | Graphical catalog and side loading; load settings; chat template; local server; logs; model storage; offline check; compare desktop, managed, command-line, and Python routes | **LML-306 Three Interfaces:** complete one live or prepared task through three interface styles and compare transparency, accessibility, control, and cleanup, L0 or L2, E2 |

### Tool-specific lab contract

Named runtime labs record:

- exact application and embedded-runtime versions;
- operating system and architecture;
- installation source;
- model repository and immutable revision;
- file names, sizes, and hashes;
- model license and conversion provenance;
- network access before, during, and after setup;
- default bind address and port if a service exists;
- effective chat template, context, sampling, and stop settings;
- measured first-load and steady-state memory;
- measured prompt and generation timing;
- storage and cache locations;
- stop, unload, uninstall, and artifact removal steps;
- last successful technical review date.

Screens and flags are expected to change. A tool lab is unpublished or labeled legacy when its tested version is no longer available or safe.

### Offline proof exercise

The learner distinguishes:

1. **Downloaded for offline use:** required files appear to be present.
2. **Runs without internet:** a test inference completes while the environment has no external network route.
3. **Makes no unexpected network attempt:** operating-system or lab observation finds no unapproved connection attempt during the test window.
4. **Private for the intended use:** local storage, logs, extensions, backups, accounts, and other processes also meet the stated privacy plan.

One result does not prove the others.

### Reality checks

- A model repository's popularity count is not a security, quality, or license review.
- A community conversion can be useful, but it adds another publisher, toolchain, and provenance step.
- Safetensors reduces a class of unsafe deserialization behavior. It does not make the values, license, model behavior, or surrounding software safe.
- A local API on all network interfaces is not private merely because the model file is local.
- A tool known for local use may also offer cloud routes. The lab verifies the exact model location and request destination instead of trusting the product category.
- A desktop application's simple interface does not remove the need to record settings.
- A successful prompt is not a benchmark.

### Breaks and checkpoint

LM-303 ends with an **artifact trust break**. The learner returns by finding a mismatched tokenizer and an incomplete download in prepared manifests.

The path checkpoint requires the learner to:

- identify publisher, repository, exact revision, license, architecture, and artifact format;
- verify or honestly qualify file integrity;
- run or inspect equivalent inference in at least two interface styles;
- prove the service and process stopped;
- find and deliberately keep or remove model storage;
- state exactly what the offline test did and did not prove.

### Portfolio project 3: Reproducible local inference comparison

Choose one version-pinned teaching artifact and one synthetic prompt set. Compare a command-line, managed-service, desktop, or Python route using the same task. Record settings, quality notes, timing, memory, network behavior, accessibility, failure handling, and cleanup. Recommend a workflow conditionally rather than naming a universal winner.

## Path LM-400: Prepare data responsibly

**Outcome:** Define a dataset purpose, establish rights and provenance, inspect and transform data reproducibly, prevent evaluation leakage, and publish a useful data record without exposing private content.

**Recommended preparation:** LM-103, LM-104, P0.6, and P0.10 are useful.

**Start-now promise:** A complete synthetic dataset and prepared data profiles support every course.

| Course | Module sequence | Core guided lab and evidence |
| --- | --- | --- |
| LM-401: What a dataset is | Example, field, feature, label, instruction, response, preference pair, document, split, schema, missing value, duplicate, distribution | **LML-401 Dataset Anatomy:** label a synthetic text dataset and explain what one row can and cannot represent, L0, E1 |
| LM-402: Purpose, rights, consent, and provenance | Intended task; collection source; permission; consent; copyright; license; terms; personal and sensitive data; lineage; withdrawal; retention | **LML-402 Rights Gate:** accept, reject, or quarantine prepared sources and document the reason without making legal claims, L0, E1 |
| LM-403: Inspect, clean, filter, and deduplicate | Profiling; encoding; normalization; missing data; exact and near duplicate; contamination; harmful content; personally identifying information; quality samples | **LML-403 Reversible Cleaning:** run or inspect a staged cleaning pipeline on synthetic data and compare every removal count, L1 or L2, E2 |
| LM-404: Split, tokenize, pack, and batch | Train, validation, and test roles; grouping and leakage; tokenization; truncation; padding; sequence packing; batches; seeds; shuffled order | **LML-404 Leak-Free Split:** build a grouped split, tokenize it, and prove that related examples did not cross the chosen boundary, L2, E2 |
| LM-405: Version and document a data pipeline | Raw, interim, and processed zones; immutable source; scripts; configuration; environment; checksums; statistics; data card; change log; deletion | **LML-405 Data Build:** rebuild a tiny processed dataset from source fixtures and produce matching manifests and a data card, L2, E2 |

### Data provenance minimum

Every dataset used in an active lab records:

| Field | Required question |
| --- | --- |
| Purpose | What exact training, tuning, retrieval, or evaluation task is this data for? |
| Origin | Who created or collected it, where, when, and by what process? |
| Rights | What license, permission, contract, consent, or statutory basis is claimed? |
| People | Could it include personal, sensitive, confidential, or regulated information? |
| Transformations | What was normalized, filtered, generated, labeled, translated, or removed? |
| Review | Which claims were verified, sampled, or left unknown? |
| Splits | How were related examples kept from leaking across train and evaluation sets? |
| Retention | Which source, processed copy, cache, and backup is retained, and for how long? |
| Withdrawal | How would a disputed source or record be removed and downstream artifacts traced? |
| License compatibility | Do data, code, base model, adapter, and intended release terms coexist? |

This is an engineering record, not legal advice. Unclear rights are a stop condition for publication or credential work.

### Synthetic and generated data

Generated text is not automatically clean or owned without restriction. Its provenance includes:

- generating system and version where disclosure is permitted;
- prompt or generation procedure using only safe synthetic inputs;
- sampling and filtering settings;
- human review method;
- known duplication or memorization checks;
- license and terms analysis;
- reasons generated data is appropriate for the task;
- separation from evaluation data.

### Reality checks

- Publicly reachable does not mean licensed for model training.
- Removing names does not guarantee that people cannot be identified.
- More data can make a model worse when the examples are irrelevant, duplicated, contradictory, or harmful.
- A random split can leak near-duplicates, documents from the same source, or later events into evaluation.
- Cleaning is a set of documented decisions. It is not an objective removal of all bad data.
- Synthetic data can reproduce the generator's mistakes and narrow the variety of real examples.

### Breaks and checkpoint

LM-402 ends with a **rights and purpose break**. No transformation begins until the learner can explain what use is authorized.

The path checkpoint requires:

- a clear purpose and schema;
- source and rights records;
- private-data and retention decisions;
- before and after profiles;
- a leakage-resistant split;
- deterministic or fully recorded transformations;
- a data card and deletion route.

### Portfolio project 4: Traceable tiny dataset

Build a small synthetic or clearly licensed dataset for one narrow task. Preserve the raw fixture, implement a repeatable transformation, create grouped train, validation, and test splits, measure duplicates and lengths, document rights and limits, and rebuild it from an empty processed folder.

## Path LM-500: Evaluate models honestly

**Outcome:** Turn a real task into a representative evaluation, compare against a meaningful baseline, measure quality and operational behavior, and communicate uncertainty without ranking theater.

**Recommended preparation:** LM-100 is useful. Data-course summaries are supplied.

**Start-now promise:** Prepared outputs support evaluation before the learner can run a model.

| Course | Module sequence | Core guided lab and evidence |
| --- | --- | --- |
| LM-501: Evaluation starts with a decision | User and task; success and harm; acceptance threshold; baseline; test population; excluded use; evaluation plan | **LML-501 Decision First:** turn a vague best-model request into a task, baseline, measures, threshold, and decision rule, L0, E1 |
| LM-502: Build a representative test set | Cases and strata; normal, edge, adversarial, and abstain cases; independence from training; references; versioning; sampling limits | **LML-502 Golden Set:** create a 30-case synthetic set with coverage labels and a leakage check, L0 or L2, E2 |
| LM-503: Metrics and human rubrics | Exact match; accuracy; precision and recall; ranking measures; semantic measures; calibration; pairwise comparison; rubric; reviewer agreement | **LML-503 Score and Disagree:** score prepared outputs with two metrics and a rubric, then identify where measures conflict, L0, E1 |
| LM-504: Factuality, safety, robustness, and refusal | Unsupported claims; citations; retrieval faithfulness; prompt variation; injection; harmful output; privacy; bias; abstention; over-refusal | **LML-504 Stress Set:** test or inspect outputs across controlled variations and record failures without turning it into public-target testing, L0 or L2, E2 |
| LM-505: Operational evaluation and decision memo | Quality, latency, time to first token, throughput, memory, energy context, failure rate, cost, maintainability; uncertainty; regression gate | **LML-505 Reproducible Comparison:** compare two configurations against a baseline and issue a conditional ship, revise, or reject decision, L2, E2 |

### Evaluation terms in plain language

| Term | Meaning |
| --- | --- |
| Baseline | The current method or simplest reasonable alternative that a new system must beat or justify replacing |
| Test case | One defined input, expected behavior, metadata, and scoring method |
| Metric | A numeric summary of one property, not the whole meaning of quality |
| Rubric | Written criteria used to make a judgment repeatable |
| Regression | A previously acceptable behavior becoming worse after a change |
| Variance | Results changing across samples, seeds, prompts, hardware, or time |
| Confidence interval | A range that communicates sampling uncertainty under stated assumptions |
| Calibration | How well stated confidence matches observed correctness |
| Abstention | The system declines or asks for help when it should not answer |
| Contamination | Evaluation content or close variants appeared in training, tuning, prompt examples, or model selection |

### Honest benchmark contract

A benchmark record includes:

- exact task and target user;
- baseline and reason it was chosen;
- model repository, revision, format, quant, runtime, and settings;
- prompt and chat-template version;
- test-set provenance and contamination caveat;
- hardware, software, concurrency, context, and cache state;
- warm-up and measurement procedure;
- raw per-case results or an authorized redacted equivalent;
- aggregate metrics with sample count;
- failures, exclusions, and missing cases;
- known uncertainty and conflicts among measures;
- date and owner;
- a decision, not only a leaderboard.

### Reality checks

- A public benchmark score does not establish fitness for the learner's task.
- A judge model can be inconsistent, biased, sensitive to ordering, or trained on related data.
- A high average can hide severe failures in a small but important group.
- Temperature zero does not guarantee identical output across all runtimes and hardware.
- Longer or more confident answers are not automatically better.
- A model can pass an evaluation because the test leaked, the metric was weak, or cases were selected after seeing results.

### Breaks and checkpoint

LM-503 ends with a **measurement break**. The return exercise shows two systems whose winner changes with the chosen metric.

The path checkpoint requires:

- one task and baseline;
- a versioned representative test set;
- at least one objective measure and one published rubric where judgment is needed;
- operational measures;
- per-case failure review;
- uncertainty and contamination notes;
- a clear decision threshold and result.

### Portfolio project 5: Model evaluation card

Evaluate a fixed set of prepared outputs or learner-run local configurations for one narrow task. Publish the task definition, baseline, test set, metrics, rubric, raw or safely summarized results, failure taxonomy, operational measurements, limitations, and decision.

## Path LM-600: Retrieval and grounded generation

**Outcome:** Explain and build a small retrieval-augmented generation pipeline, evaluate every stage, and protect the document and prompt boundaries.

**Recommended preparation:** LM-104, LM-105, LM-400, and LM-500 are useful.

**Start-now promise:** A complete prepared corpus, vector table, ranking trace, and generated answers support an L0 route.

| Course | Module sequence | Core guided lab and evidence |
| --- | --- | --- |
| LM-601: Why retrieval exists | Knowledge freshness; source of truth; database, search, and model roles; retrieve then generate; citations; when not to use generation | **LML-601 Pipeline Trace:** follow one question through source, chunk, vector, candidates, reranking, prompt, answer, and citation, L0, E1 |
| LM-602: Documents, chunks, embeddings, and indexes | Ingestion; parsing; metadata; chunk boundaries; overlap; embedding model; vector index; lexical search; hybrid search; updates and deletion | **LML-602 Build an Index:** create or inspect a small local index from synthetic documents and prove one update and one deletion, L1 or L2, E2 |
| LM-603: Retrieve, rerank, prompt, and cite | Query transformation; filters; top-k; reranker; context budget; ordering; lost-in-the-middle behavior; answer contract; citations; abstention | **LML-603 Grounded Answer:** compare retrieval-only, vector-plus-reranker, and generated responses with source links, L2, E2 |
| LM-604: Evaluate and secure retrieval systems | Retrieval recall; ranking; faithfulness; answer relevance; citation correctness; prompt injection in documents; access control; private indexes; stale data | **LML-604 RAG Failure Lab:** diagnose misses, bad chunks, poisoning, access leakage, unsupported synthesis, and stale results in an isolated fixture, L0 or L2, E2 |

### Retrieval system boundaries

~~~text
Authorized source
  -> parser
  -> chunks and metadata
  -> embedding model
  -> index
  -> candidate retrieval
  -> optional reranker
  -> selected context
  -> generator
  -> answer and source references
~~~

Each arrow has an owner, version, data classification, failure mode, and deletion behavior. The website teaches this flow but does not receive, parse, embed, index, retrieve, or generate over learner documents.

### Reality checks

- Retrieval does not guarantee that the correct passage is found.
- A relevant passage in the prompt does not guarantee that the model uses it faithfully.
- A citation-looking string is not proof that the cited source supports the sentence.
- Vector similarity is one retrieval signal, not a substitute for permissions or metadata filters.
- RAG can leak information when the index, filter, cache, logs, or generated response crosses an access boundary.
- If exact lookup and display solve the task, generation may add unnecessary error.

### Breaks and checkpoint

LM-602 ends with an **index integrity break**. The return exercise asks why a deleted source still appears through a stale chunk or cache.

The path checkpoint requires:

- a source and data-flow map;
- documented parser and chunk choices;
- retrieval and reranking measurements;
- answer and citation rubric;
- document-injection and access-control test;
- update, deletion, rebuild, and cleanup proof.

### Portfolio project 6: Private grounded reference assistant

Use a synthetic or clearly licensed small document set. Build a local retrieval pipeline, compare lexical and vector retrieval, add an optional reranker, generate only when justified, require source references, measure retrieval and answer quality separately, and demonstrate deletion and full cleanup.

## Path LM-700: LoRA, QLoRA, and adaptation

**Outcome:** Decide whether behavior should be changed through prompts, retrieval, software, or training, then run a bounded adapter experiment and compare it against an unchanged baseline.

**Recommended preparation:** LM-200, LM-400, and LM-500 are strongly recommended because adaptation without resource, data, and evaluation plans is not interpretable.

**Start-now promise:** Prepared configuration, memory, loss, checkpoint, adapter, and evaluation traces support every concept.

| Course | Module sequence | Core guided lab and evidence |
| --- | --- | --- |
| LM-701: Should this task be fine-tuned? | Stable behavior versus fresh facts; prompt baseline; retrieval; tools; rules; model selection; full tuning; adapter tuning; decision matrix | **LML-701 Adaptation Gate:** select prompt, retrieval, software, adapter, full tune, or no model for ten cases and defend the boundary, L0, E1 |
| LM-702: LoRA from first principles | Frozen base; matrices and tensors; low-rank update; rank; alpha or scaling; dropout; target modules; trainable-parameter count; adapter artifact | **LML-702 Adapter Anatomy:** calculate shapes and trainable parameters for a tiny prepared layer and inspect an adapter manifest, L0, E1 |
| LM-703: QLoRA and memory-efficient tuning | Quantized base loading; higher-precision compute; adapter gradients; optimizer; paging concepts; memory tradeoffs; supported backends; common failures | **LML-703 Memory Plan:** compare full tuning, LoRA, and QLoRA estimates for a teaching model and establish stop thresholds, L0 or L1, E1 |
| LM-704: Run a bounded adapter experiment | Environment; exact base; data; collator; batch and accumulation; learning rate; seed; schedule; checkpoints; logs; stop and resume | **LML-704 Tiny LoRA Run:** train or inspect a tiny adapter on synthetic data with resource ceilings, checkpoints, and full cleanup, L3, E2 |
| LM-705: Evaluate, diagnose, and repeat | Unchanged baseline; held-out cases; loss curves; overfit; underfit; memorization probes; regression; ablation; one-change experiments | **LML-705 Adapter Comparison:** compare base and adapter per case, find regressions, and decide keep, revise, or discard, L2, E2 |
| LM-706: Package, merge, publish, and roll back | Adapter versus merged artifact; compatibility; tokenizer and template; merge precision; model and adapter cards; licenses; rollback; deprecation | **LML-706 Release Candidate:** create a local adapter release record or prepared equivalent, verify loading against the exact base, and restore the prior version, L2 or L3, E2 |

### LoRA in plain language

A large layer can be pictured as a grid of learned numbers. Full fine-tuning can adjust the entire grid. Low-Rank Adaptation, commonly called LoRA, keeps the original grid unchanged and learns two much smaller grids whose product represents an update. Rank controls the width of that smaller path.

This can reduce trainable parameters and optimizer memory. It does not mean:

- the base model is absent from memory;
- every task can be learned with a small adapter;
- a larger rank is always better;
- the adapter works with a different base revision;
- the adapter license overrides the base license;
- training data can be forgotten after release.

### QLoRA in plain language

QLoRA commonly keeps the frozen base weights in a low-bit representation to reduce memory while training LoRA adapter parameters using a training setup that preserves more precision where required. The Q refers to quantization of the base loading path. It does not mean the adapter training arithmetic is simply INT4 everywhere.

Backend support, quantization scheme, optimizer, batch, sequence length, rank, checkpointing, and hardware all affect actual memory and speed. The lab measures instead of promising a multiplier.

### Safe experiment contract

Every tuning lab defines:

- the question one experiment answers;
- exact base repository and revision;
- tokenizer and template;
- dataset version, rights, split, and sensitive-data classification;
- environment and hardware;
- trainable modules and parameter count;
- seed and determinism limits;
- effective batch, sequence length, optimizer, learning rate, schedule, and steps;
- memory, temperature, time, disk, and cost ceilings;
- checkpoint interval and resume test;
- unchanged baseline and held-out evaluation;
- memorization and regression probes;
- cleanup and artifact-retention decision;
- release and license conditions.

### Reality checks

- Fine-tuning can make average behavior look better while causing severe regressions elsewhere.
- Lower training loss does not prove better real-task quality.
- An adapter can memorize private examples even though its file is smaller than the base.
- QLoRA reduces some memory demands. It does not make an unsuitable computer safe or fast.
- Merging an adapter changes packaging, not evidence quality.
- A fine-tune that copies the desired answers from the evaluation set has not learned a general capability.

### Breaks and checkpoint

LM-703 ends with a **go or no-go break**. The learner may stop with a decision to use prompts, retrieval, rules, or a different base. That is a successful outcome.

LM-704 includes checkpoints after preflight, first evaluation, first saved adapter, resume proof, and cleanup. A learner never waits through an unexplained long run.

The path checkpoint requires:

- an adaptation decision memo;
- exact base and data provenance;
- resource plan and stop conditions;
- one reproducible adapter experiment or complete trace analysis;
- base-versus-adapter evaluation;
- regression and memorization review;
- compatibility, license, release, and rollback record.

### Portfolio project 7: Bounded adapter study

Choose one narrow synthetic or clearly licensed task. Establish a prompt or retrieval baseline, train or analyze at least two small LoRA configurations, change one meaningful variable at a time, compare held-out results and resource use, test resume and rollback, and make a keep, revise, or discard decision.

## Path LM-800: Train a tiny model from scratch

**Outcome:** Understand the complete training loop by building a deliberately small educational model whose limits are visible.

**Recommended preparation:** LM-104, LM-200, LM-400, and LM-500. P0.5 through P0.8 provide optional refreshers.

**Start-now promise:** The path includes a tiny paper-and-pencil route and prepared CPU traces. It does not require a modern GPU.

| Course | Module sequence | Core guided lab and evidence |
| --- | --- | --- |
| LM-801: Why train from scratch? | Educational purpose; new architecture; language or domain coverage; control and cost; why most learners should not train a general model; tiny scope | **LML-801 Training Decision:** compare training, tuning, retrieval, and existing models for six cases, L0, E1 |
| LM-802: Build a tokenizer and training corpus | Characters, bytes, subwords, vocabulary; unknown tokens; normalization; frequency; tokenizer training; corpus split; coverage and bias | **LML-802 Tiny Tokenizer:** train or inspect a tokenizer on a synthetic corpus and compare sequence lengths and failures, L2, E2 |
| LM-803: Architecture, tensors, loss, and optimizer | Embeddings; positions; attention; feed-forward layers; residual paths; normalization; logits; cross-entropy intuition; gradients; optimizer | **LML-803 Forward Pass:** calculate a very small prepared forward step and trace tensor shapes without advanced calculus, L0, E1 |
| LM-804: Training loop, batches, and checkpoints | Initialize; batch; forward pass; loss; backward pass; update; epoch and step; validation; checkpoint; seed; resume; early stop | **LML-804 Loop Trace:** inspect a complete tiny training run, locate each state change, and recover from an interrupted checkpoint, L0 or L2, E2 |
| LM-805: Run a tiny educational training job | Environment; resource ceiling; small architecture; data loader; logging; validation; sampling; checkpoint; resume; cleanup | **LML-805 Tiny Model:** train or follow a prepared run small enough for the declared lane, then generate samples and restore from a checkpoint, L3, E2 |
| LM-806: Diagnose, compare, and report | Loss plateaus; divergence; overfit; underfit; data bugs; tokenizer mismatch; gradient issues; seeds; ablations; limits; reproducibility report | **LML-806 Broken Runs:** diagnose six prepared failures and reproduce one corrected run, L0 or L2, E2 |

### Training concepts without hidden math

| Term | Plain definition | Why it exists |
| --- | --- | --- |
| Tensor | A numbered arrangement of values with a defined shape and data type | Model operations need consistent numeric structures |
| Embedding layer | A table that maps token identifiers to learned vectors | Numeric operations cannot work directly on words |
| Attention | A mechanism that combines information from token positions using learned comparisons | Each position needs a way to use relevant context |
| Logit | An unnormalized score for an output choice | The model produces scores before converting them to probabilities |
| Loss | A number summarizing disagreement with the training objective | The optimizer needs a direction for improvement |
| Gradient | The local direction and sensitivity of loss to a parameter | It guides a small parameter update |
| Learning rate | A scale applied to updates | Steps that are too large or small can prevent useful learning |
| Batch | A group of examples processed for one update calculation | It makes computation and gradient estimates manageable |
| Epoch | One pass through the chosen training examples | It is a counting unit, not proof of sufficient learning |
| Checkpoint | Saved model and, when needed, optimizer and progress state | A run can be evaluated, resumed, or rolled back |
| Validation set | Held-out examples used to guide choices during development | Training loss alone cannot show generalization |
| Test set | A more protected held-out set used for final evaluation | Repeated tuning on it turns it into development data |

Calculus, linear algebra, and probability extensions are available beside the plain explanation. They are never silently assumed.

### Honest limit

The from-scratch lab is for learning the mechanism. A tiny model trained on a tiny corpus does not become a useful general assistant. The course celebrates interpretability and reproducibility, not fluent output.

### Reality checks

- Training from scratch is not the normal next step after running a local model.
- Seeing the entire corpus once does not mean a model memorized or understood it.
- A smooth loss curve can coexist with useless generations.
- More epochs can increase overfitting rather than capability.
- Repeating a run with one seed is reproducibility evidence for that setup, not proof that all platforms match.
- A checkpoint without tokenizer, configuration, data record, code, and environment may be unusable.

### Breaks and checkpoint

LM-803 ends with a **math and shapes break**. The return page redefines every symbol used in the next training-loop diagram.

LM-805 has stopping points after environment validation, first batch, first checkpoint, first validation, resume proof, and cleanup. Resource ceilings stop the run automatically or instruct the learner to stop.

The path checkpoint requires:

- a justified educational purpose;
- documented corpus and tokenizer;
- architecture and parameter count;
- complete training configuration;
- checkpoint and resume proof;
- training and validation traces;
- samples labeled honestly;
- reproducibility and limitation report.

### Portfolio project 8: Tiny model laboratory report

Train or reproduce a deliberately tiny model on synthetic or clearly licensed material. Change one factor such as tokenizer vocabulary, context length, width, learning rate, or corpus composition. Compare both runs, explain tensor shapes and losses, prove checkpoint recovery, and state why the result is not a general-purpose model.

## Path LM-900: Preference and behavior tuning

**Outcome:** Understand how preference signals change behavior, distinguish major approaches, identify whose preferences are represented, and evaluate both desired changes and side effects.

**Recommended preparation:** LM-700 and the evaluation context summary.

**Start-now promise:** All concepts can be learned from prepared comparison data and traces.

| Course | Module sequence | Core guided lab and evidence |
| --- | --- | --- |
| LM-901: Preference data and annotator judgment | Prompt; candidate responses; chosen and rejected; rubric; annotator; disagreement; cultural and accessibility context; privacy; quality review | **LML-901 Preference Audit:** inspect a synthetic comparison dataset, measure disagreement, and rewrite an ambiguous rubric, L0, E1 |
| LM-902: Supervised and preference objectives | Demonstration versus comparison; supervised fine-tuning; reward-model concept; direct preference methods; reference model; objective intuition; over-optimization | **LML-902 Objective Map:** connect each dataset field to a prepared training objective and identify missing assumptions, L0, E1 |
| LM-903: DPO, reward learning, and reinforcement context | Direct Preference Optimization at concept level; reward scores; policy and reference; reinforcement-learning vocabulary; exploration; instability; compute and evaluation | **LML-903 Trace Comparison:** compare prepared supervised, DPO-style, and reward-guided traces without presenting one as universally superior, L0, E1 |
| LM-904: Behavior evaluation and release | Helpfulness; factuality; refusal; tone; format; bias; manipulation; sycophancy; over-refusal; red-team fixtures; rollback; release notes | **LML-904 Behavior Gate:** evaluate a prepared base and adapted model across desired, neutral, and regression cases, L0 or L2, E2 |

### Whose preference?

Every preference project names:

- who wrote the prompt set;
- who supplied comparisons;
- the instructions they received;
- which languages, cultures, abilities, roles, and risks were represented or absent;
- how disagreement was recorded;
- whether workers consented to the data use and how it was governed;
- what behavior the project intentionally changed;
- what the resulting scores do not establish.

### Reality checks

- Preference tuning does not discover one objective definition of good behavior.
- A reward score can be exploited by a model or overfit by a training process.
- More refusals can reduce harm in some cases and make a system unusable in others.
- A polite answer can be manipulative, evasive, or false.
- Preference data can contain private material and labor concerns.
- A behavior improvement on English prompts does not establish the same result in another language.

### Breaks and checkpoint

LM-902 ends with a **people and objectives break**. The return exercise asks the learner to identify missing stakeholders in a preference-data plan.

The path checkpoint requires:

- data provenance and annotator context;
- an explained objective;
- base and adapted comparisons;
- desired, neutral, safety, and regression cases;
- disagreement and uncertainty;
- an explicit rollback decision.

### Portfolio project 9: Preference data and behavior review

Create a small synthetic comparison set for one bounded behavior, publish the rubric, record disagreement, inspect a prepared or learner-run adaptation trace, compare behavior against an unchanged baseline, and document both improvements and regressions. Training is optional; evidence quality is not.

## Path LM-1000: Quantization and performance

**Outcome:** Explain numeric representations, inspect quantized artifacts, estimate and measure fit, and choose a configuration using quality and operational evidence.

**Recommended preparation:** LM-203, LM-302, LM-304, and LM-500.

**Start-now promise:** Prepared tensor inventories, GGUF metadata, memory traces, and benchmark outputs support a complete L0 route.

| Course | Module sequence | Core guided lab and evidence |
| --- | --- | --- |
| LM-1001: Bits, floating point, and integer representations | Bit and byte; sign, range, and precision; FP32; FP16; BF16; INT8; INT4; rounding; overflow; scale and zero point | **LML-1001 Number Lab:** encode and round a tiny set of values using prepared examples and explain lost information, L0, E1 |
| LM-1002: Quantization methods and GGUF names | Per-tensor, per-channel, block and group concepts; post-training quantization; calibration; weight-only and activation quantization; GGUF; Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0, Q3_K_M, Q2_K | **LML-1002 Read the File:** inspect prepared metadata and explain why three similarly named files differ, L0, E1 |
| LM-1003: Convert and quantize reproducibly | Source weights; converter; output type; calibration where required; hashes; logs; validation; numerical comparison; artifact card; cleanup | **LML-1003 Quant Build:** convert or inspect a tiny supported artifact, produce a versioned manifest, and verify that it loads, L2 or L3, E2 |
| LM-1004: Context cache, throughput, latency, and offload | Prompt processing; time to first token; tokens per second; context cache; context length; batch; concurrency; CPU threads; GPU offload; memory bandwidth; thermal behavior | **LML-1004 Performance Trace:** vary one setting at a time and record timing, memory, temperature context, and quality, L1 or L2, E2 |
| LM-1005: Choose a quant and hardware fit | Raw size; measured working memory; quality by task; backend support; energy and noise context; disk; startup; portability; decision threshold | **LML-1005 Quant Decision:** compare at least three precisions or provided traces and issue a conditional fit recommendation, L0 or L2, E2 |

### Quant evaluation matrix

| Dimension | Question |
| --- | --- |
| Compatibility | Does the exact runtime and backend load every tensor type? |
| Integrity | Does the artifact match the recorded revision and hash? |
| Fit | What are measured peak RAM, VRAM or unified memory, and disk use? |
| Startup | How long do load and first response take? |
| Prompt processing | How quickly is supplied context processed? |
| Generation | What is steady-state output rate under a stated sampling setup? |
| Quality | How does the quant perform per case on the target evaluation? |
| Long context | How do memory, latency, and correctness change at relevant lengths? |
| Concurrency | What happens with more than one request or batch item? |
| Stability | Are there crashes, corrupt outputs, thermal throttling, or backend fallbacks? |
| Maintainability | Can the artifact be rebuilt or replaced from documented inputs? |

### Reality checks

- FP16 and BF16 use the same number of bits but have different range and precision tradeoffs.
- INT8 and Q8_0 are not interchangeable names for one universal representation.
- Q4_K_M describes a particular family and tensor mix. The M does not certify medium quality.
- A lower-bit quant can occasionally score similarly or even better on a small test by chance. That does not mean compression improved the underlying model.
- Tokens per second without context length, prompt size, batch, hardware, backend, and settings is not a useful comparison.
- A long advertised context length is a capability claim, not proof of reliable recall across that length.

### Breaks and checkpoint

LM-1002 ends with a **names are not evidence break**. The learner returns by inspecting metadata rather than choosing from a filename.

LM-1004 has a checkpoint after each single-variable trial and a required cooldown or rest point during sustained measurement.

The path checkpoint requires:

- an explanation of FP32, FP16, BF16, INT8, and INT4;
- correct interpretation and limits of common GGUF names;
- a reproducible conversion or artifact record;
- measured fit and performance;
- task-specific quality comparison;
- a choice with explicit no-go thresholds.

### Portfolio project 10: Quantization tradeoff report

Compare three representations of the same versioned model, or use supplied traces where hardware is unavailable. Hold prompt set and runtime configuration constant where possible. Report file size, peak working memory, prompt and generation timing, per-case quality, failures, backend compatibility, and a justified selection.

## Path LM-1100: Serve and operate local models

**Outcome:** Expose a model to an authorized local application through a bounded service, observe its behavior and resource use, update it safely, and recover or remove it.

**Recommended preparation:** LM-300, LM-500, LM-1000, Linux process and networking basics, and Cybersecurity authorization basics are useful.

**Start-now promise:** Prepared process, socket, request, log, capacity, and incident traces support the whole reasoning route.

| Course | Module sequence | Core guided lab and evidence |
| --- | --- | --- |
| LM-1101: From process to local API | Process; standard input and output; request and response; endpoint; JSON; streaming; client and server; timeout; cancellation; error | **LML-1101 API Trace:** annotate a prepared local request from client through model process to response and failure handling, L0, E1 |
| LM-1102: Bind addresses, access, and secrets | Loopback; private and public address; port; firewall; origin; authentication; token storage; least privilege; transport encryption context | **LML-1102 Loopback Service:** run or inspect a loopback-only synthetic service, verify its listener, reject an unauthenticated nonlocal route, and stop it, L2 or L3, E2 |
| LM-1103: Service lifecycle, templates, and logs | Model load and unload; chat template; default generation settings; configuration; service user; startup; health; structured logs; prompt privacy; retention | **LML-1103 Operate a Service:** install or inspect a private service definition, start it, verify health, rotate a safe setting, review logs, and remove it, L3, E2 |
| LM-1104: Capacity, queues, and observability | Time to first token; throughput; concurrent requests; batch; queue; context memory; cancellation; rate limit; metrics; alert; capacity test | **LML-1104 Capacity Envelope:** measure or analyze one-user and multi-request behavior, then set limits before instability, L1 or L3, E2 |
| LM-1105: Upgrade, back up, roll back, and retire | Version and artifact pin; canary; compatibility; configuration and adapter backup; data retention; rollback; cache rebuild; decommission; verification | **LML-1105 Upgrade Drill:** update a cloned or prepared local service, detect a regression, restore the previous version, and verify cleanup, L3, E2 |

### Local service exposure ladder

1. One process reads a synthetic prompt from a local file.
2. One process accepts input through standard input.
3. A service listens on loopback only.
4. A named local application connects to that loopback service.
5. Authentication and request limits are added even inside a shared machine where needed.
6. A private lab network is considered only after threat model, firewall, identity, encryption, logs, and recovery.
7. Public exposure is outside beginner labs and requires a separately reviewed architecture.

The curriculum never begins by binding a model server to all interfaces.

### Operational data policy

Prompts, retrieved passages, generated output, model identifiers, user identifiers, and timing can all appear in logs or traces. Each service lab sets:

- fields collected;
- purpose;
- access;
- redaction;
- retention;
- rotation;
- deletion;
- debugging exception;
- incident handling.

The default learning lab uses synthetic prompts and disables prompt-body logging when the runtime permits it.

### Reality checks

- Loopback reduces network exposure. It does not isolate users or processes on the same machine.
- An OpenAI-compatible API describes an interface shape, not identical model behavior.
- A health endpoint can report that a process is alive while model output is broken.
- More concurrency can reduce per-user speed and trigger memory failure.
- Restarting a failed service is not root-cause analysis.
- A local service still needs versioning, updates, backups, and retirement.

### Breaks and checkpoint

LM-1102 ends with an **exposure break**. The return exercise asks the learner to identify a service accidentally bound to every interface.

LM-1104 includes checkpoints at idle, one request, controlled concurrency, first queue, limit activation, and cleanup.

The path checkpoint requires:

- process and request data flow;
- verified listener and access boundary;
- versioned model, runtime, template, and defaults;
- privacy-aware logging;
- measured capacity limits;
- health and quality checks;
- successful rollback and decommission proof.

### Portfolio project 11: Private local model service

Operate a model or supplied service fixture for one authorized local client. Bind it to loopback, document access and log policy, set context and concurrency limits, create health and quality checks, perform a version update, trigger a safe regression, roll back, and fully decommission the lab.

## Path LM-1200: Security, licensing, and responsible release

**Outcome:** Threat-model the full model system, distinguish component licenses, trace data and artifact provenance, handle untrusted content safely, and publish limitations that a user can act on.

**Recommended preparation:** None for the first course. Practical reviews benefit from LM-300, LM-400, and LM-1100.

**Start-now promise:** Static architectures, cards, manifests, terms, and incident cases support every course.

| Course | Module sequence | Core guided lab and evidence |
| --- | --- | --- |
| LM-1201: Threat model a local model system | Assets; actors; trust boundaries; prompt and document privacy; local users; plugins and tools; model server; logs; backups; physical access; recovery | **LML-1201 Threat Map:** build a data-flow and threat model for a local assistant and prioritize controls, L0, E1 |
| LM-1202: Licenses for code, weights, data, and output | Copyright and contract context; software license; weight license; dataset license; model terms; attribution; redistribution; commercial and field restrictions; output uncertainty | **LML-1202 License Stack:** inspect a prepared release and identify compatible, unclear, and conflicting component obligations, L0, E1 |
| LM-1203: Data and model provenance | Source records; consent; lineage; transformations; base and adapter relation; conversion; quantization; hashes; model card; data card; bill of materials | **LML-1203 Provenance Graph:** trace a prepared artifact back through adapter, base, data, code, and converter, then identify missing links, L0, E1 |
| LM-1204: Artifact, prompt, retrieval, and supply-chain security | Unsafe serialization; custom code; dependency risk; parser bugs; prompt injection; tool injection; poisoned documents; model theft; local API exposure; updates | **LML-1204 Safe Intake:** review a suspicious model bundle and retrieval fixture in an isolated prepared case, rejecting unsafe load steps, L0 or L4, E2 |
| LM-1205: Honest limits and responsible release | Intended user and task; excluded use; safety and quality evaluation; privacy; accessibility; known failures; monitoring; incident contact; version; deprecation; withdrawal | **LML-1205 Release Review:** approve, revise, or block a fictional local-model release using a published checklist, L0, E1 |

### Threats considered

- untrusted model or dataset files exploiting a parser or loader;
- arbitrary code requested by a repository;
- compromised dependencies or installation source;
- private prompts or documents written to logs, caches, shell history, backups, or telemetry;
- a local API exposed to the network;
- another local user accessing model inputs or outputs;
- document or prompt injection causing tool or retrieval misuse;
- an agent or tool taking an action without sufficient scope or confirmation;
- poisoned or manipulated training, tuning, evaluation, or retrieval data;
- license or consent claims that cannot be substantiated;
- checkpoints or adapters leaking memorized data;
- resource exhaustion, thermal instability, denial of service, or uncontrolled cost;
- generated code, medical, legal, financial, security, or operational advice being trusted without expert verification;
- a false claim that local execution proves privacy, safety, authorship, or accuracy.

### License stack

A releasable system may include separate terms for:

1. training code;
2. runtime code;
3. base weights;
4. adapter weights;
5. tokenizer;
6. dataset;
7. generated or human-authored evaluation set;
8. model conversion;
9. user interface;
10. third-party libraries;
11. output and downstream use.

The course teaches how to record terms and identify when qualified legal review is needed. It does not give legal advice or claim that one license cancels another.

### Responsible release card

Every portfolio release record includes:

- exact artifact and component versions;
- intended tasks, users, and environments;
- excluded and safety-critical uses;
- source and transformation history;
- licenses and unresolved terms;
- data provenance and privacy classification;
- hardware and runtime requirements;
- evaluation design, results, sample counts, and limitations;
- quantization and conversion information;
- security review and network behavior;
- known failure modes and examples;
- monitoring, feedback, incident, rollback, retirement, and deletion processes;
- last review and owner.

### Honest limits taught repeatedly

- A model cannot verify its own output merely by saying it is confident.
- A local model can reveal or transform private data through logs, integrations, outputs, or other users.
- No general-purpose model is correct for every language, culture, task, or accessibility need.
- Model behavior can change with prompt wording, template, sampling, context, quant, runtime, or hardware.
- Evaluation reduces uncertainty. It does not prove the absence of failures.
- A model should not replace qualified judgment in a safety-critical decision merely because it runs offline.
- An agent with tools can cause real changes. Model uncertainty becomes operational risk.
- Deleting a visible model file does not prove that caches, backups, logs, indexes, or derived adapters are gone.

### Reality checks

- Open weights are not the same as open-source software.
- A restrictive but downloadable model is still restricted.
- A hash verifies sameness to a known value, not safety or lawful origin.
- Prompt injection is not solved by telling a model to ignore bad instructions.
- A model card is evidence about disclosed claims, not an independent audit.
- A responsible release can be a decision not to release.

### Breaks and checkpoint

LM-1202 ends with a **license boundary break**. The learner returns by separating the licenses for code, weights, data, and adapter.

LM-1204 provides only prepared evidence or a fully isolated, benign fixture. It never instructs the learner to load a suspicious public artifact.

The path checkpoint requires:

- an architecture and data-flow threat model;
- a component license stack;
- provenance graph;
- artifact and dependency inventory;
- privacy and logging plan;
- quality and safety evidence;
- known limits, incident route, rollback, retirement, and deletion plan.

### Portfolio project 12: Responsible local-model release review

Review a fictional or learner-created local system. Produce a threat model, license and provenance stack, privacy inventory, evaluation summary, known-limit card, supply-chain record, incident and rollback plan, and a final approve, revise, block, or retire decision.

## Path LM-1300: Research and specialization studio

**Outcome:** Understand why larger training uses multiple devices, reproduce a bounded research claim, and apply the complete curriculum to one specialized modality or task.

**Recommended preparation:** Relevant prior paths. Every course supplies a direct context summary.

**Start-now promise:** Prepared diagrams, traces, papers, and artifacts support learners without clusters or specialized hardware.

| Course | Module sequence | Core guided lab and evidence |
| --- | --- | --- |
| LM-1301: Distributed training and scaling concepts | Device and worker; data parallel; model and tensor parallel; pipeline; sharding; collective communication; gradient accumulation; checkpointing; failures; efficiency; cost and energy context | **LML-1301 Distributed Trace:** step through a prepared four-worker training timeline, diagnose a failed worker and communication bottleneck, and choose a recovery, L0, E1 |
| LM-1302: Reproduce a research claim | Research question; paper reading; claim and evidence; repository; environment; data and license; seed; baseline; ablation; statistics; negative result; artifact preservation | **LML-1302 Reproduction Packet:** reproduce a tiny published or supplied claim, or audit a prepared attempt, and report matches, differences, and uncertainty, L0 or L2, E2 |
| LM-1303: Specialization studio | Code; vision-language; image generation; speech recognition; speech synthesis; multimodal; multilingual; domain adaptation; embedding and reranking; local agents and tool use | **LML-1303 Specialization Project:** complete one bounded project with modality-specific privacy, quality, license, accessibility, and safety tests, L0 through L4, E2 or E3 |

### Distributed training boundaries

The course explains:

- why one model or batch may not fit one device;
- which state is copied, split, or communicated;
- why communication can dominate;
- how synchronization and stragglers affect progress;
- why a multi-device job can fail partially;
- how checkpoints and resumability change at scale;
- why cost, energy, identity, data placement, and cleanup need explicit ownership.

It does not ask a beginner to rent a cluster. Any external-compute lane has an estimated maximum spend, expiration, inventory command, access-control plan, and deletion verification. L0 analysis is always available.

### Specialization branches

| Branch | Additional concepts | Required caution |
| --- | --- | --- |
| Code models | Repository context, syntax, build and tests, dependency provenance, licenses, secrets, vulnerability review | Generated code is untrusted until reviewed and tested |
| Vision-language | Image encoding, resolution, crops, optical text, multiple images, spatial tasks | Images can contain people, locations, documents, and hidden metadata |
| Image generation | Latent representation, conditioning, sampler, seed, guidance, edit and inpaint concepts | Rights, consent, impersonation, provenance, and disclosure |
| Speech recognition | Sampling rate, channels, segmentation, timestamps, language, diarization | Recording permission, sensitive speech, accent and noise performance |
| Speech synthesis | Text normalization, speaker conditioning, prosody, watermark and disclosure context | Voice rights and impersonation controls |
| Multimodal systems | Modality encoder, projector, fusion, alignment, context packaging | One modality can inject or obscure instructions in another |
| Multilingual models | Script, tokenizer coverage, translation, code switching, dialect, locale-specific evaluation | English results do not transfer automatically |
| Domain adaptation | Terminology, specialized corpus, experts, safety boundaries, drift | Domain fluency can hide incorrect expert claims |
| Embedding and reranking | Query and document encoders, vector dimension, similarity, cross-encoder scoring | Ranking quality and access control are separate |
| Agents and tool use | Tool schema, state, planning, permission, confirmation, idempotence, sandbox, audit, stop | Model output must not silently become an authorized action |

### Reality checks

- More devices do not guarantee proportional speed.
- Reproducing a number does not validate every claim in a paper.
- Failure to reproduce can arise from missing details, environment drift, statistical variation, or an incorrect claim.
- A multimodal model does not share one uniform ability across text, images, and audio.
- A code model that passes one test may still create insecure or unlicensed code.
- An agent is a system around a model. Giving it tools changes the risk more than giving it a longer prompt.

### Breaks and checkpoint

LM-1301 includes a **scale without a cluster break** after the first communication timeline.

LM-1302 pauses after environment reconstruction, baseline, first comparison, and negative-result review.

The path checkpoint requires:

- a correct distributed-training data and communication diagram;
- a reproducible claim with source, environment, data, and statistics;
- a specialization project with modality-specific evaluation;
- an honest negative-result section;
- license, privacy, safety, resource, cleanup, and maintenance notes.

### Portfolio project 13: Reproducible specialization study

Choose one specialization and one narrow claim. Establish a baseline, use synthetic or clearly authorized data, record exact artifacts and environment, evaluate task quality and modality-specific risks, reproduce or fail to reproduce the claim honestly, and publish a self-contained research packet.

## Core guided lab inventory

Each of the 65 courses above has one named core lab. The complete catalog adds at least 35 extension labs for a minimum of 100 maintained guided labs.

| Lab family | Core labs | Extension target | Representative extensions |
| --- | ---: | ---: | --- |
| Foundations and model taxonomy | 6 | 3 | Tokenizer comparison; generation probability walk; modality failure review |
| Hardware and environment | 5 | 4 | CPU thread measurement; GPU backend fallback; context-cache estimate; full environment rebuild |
| Artifact and local runtime | 6 | 5 | Sharded download recovery; template mismatch; llama.cpp server; Ollama import; LM Studio offline observation |
| Data and provenance | 5 | 4 | Near-duplicate audit; sensitive-data quarantine; temporal split; deletion propagation |
| Evaluation | 5 | 5 | Calibration; pairwise-order bias; multilingual slice; regression suite; benchmark reproduction |
| Retrieval | 4 | 4 | Chunk-size comparison; hybrid search; reranker tradeoff; injection and access filters |
| LoRA and QLoRA | 6 | 4 | Rank comparison; target-module ablation; resume after interruption; adapter compatibility |
| Tiny training | 6 | 3 | Tokenizer ablation; controlled overfit; data bug diagnosis |
| Preference and behavior | 4 | 2 | Annotator disagreement; over-refusal regression |
| Quantization and performance | 5 | 3 | Context scaling; CPU and GPU offload; thermal or sustained-run trace |
| Serving and operations | 5 | 3 | Client cancellation; log redaction; backup and restore |
| Security and release | 5 | 3 | Unsafe serialization case; model bill of materials; deletion drill |
| Research and specialization | 3 | 2 | Distributed checkpoint failure; modality-specific accessibility evaluation |
| **Total** | **65** | **45** | **110 maintained labs when the full extension target is met** |

### Lab package structure

~~~text
local-model-lab-id/
  README.md
  LAB.md
  lab-manifest.json
  requirements/
  starter/
  fixtures/
  prepared-trace/
  scripts/
  checks/
  expected/
  recovery/
  cleanup/
  evidence-template/
  MODEL_SOURCES.md
  DATA_SOURCES.md
  LICENSES.md
  SECURITY.md
  LIMITS.md
  checksums.txt
~~~

Scripts use a review, plan, or dry-run mode where a change is possible. A package contains no private data, secret, unlicensed model weight, restricted dataset, malicious payload, public target, or hidden provider call.

### Beginner lab sequence

1. State the goal in one sentence.
2. Define every new word used in the preflight.
3. Show the system and data-flow diagram.
4. Name what the website does and what the learner's environment does.
5. Identify files, processes, ports, data, memory, disk, and possible cost.
6. Verify license, source, revision, and checksum information.
7. Capture the starting state.
8. Verify recovery and cleanup.
9. Predict the first result.
10. Run or inspect one bounded step.
11. Compare actual and expected evidence.
12. Stop at the named checkpoint.
13. Continue only within resource ceilings.
14. Perform an independent final verification.
15. Undo, retain, or quarantine each artifact deliberately.
16. Verify process, service, port, storage, and external resource cleanup.
17. Record what the evidence proves and does not prove.

## Exercise and feedback system

Exercises teach decisions and mental models before commands.

| Exercise family | Learner task | What it reveals |
| --- | --- | --- |
| Term in context | Match a word to a concrete system, artifact, or event | Whether vocabulary has observable meaning |
| Model or not | Separate learned behavior from rules, search, storage, and ordinary software | Whether the learner is overusing the word model |
| Type the task | Choose base, instruct, reasoning, embedding, reranker, vision, audio, classifier, or no model | Whether model role matches the task |
| Lifecycle ordering | Arrange source, train, adapt, evaluate, quantize, deploy, monitor, and retire | Whether stages and artifacts are distinct |
| Data-flow trace | Follow prompts, documents, weights, logs, and responses across trust boundaries | Privacy and ownership |
| Predict before run | Estimate memory, tokens, output, or failure before seeing a trace | Mental model and calibration |
| Read the manifest | Find revision, format, tokenizer, license, hash, runtime, and missing fields | Artifact literacy |
| Hardware fit | Calculate raw weights, add measured overhead, and make a go or no-go decision | Resource reasoning |
| Find the leak | Identify train-test contamination, private data, logging, retrieval, or access leakage | Data and privacy awareness |
| Read a curve | Interpret loss, validation, memory, latency, and throughput traces | Measurement literacy |
| Choose the baseline | Select a simple alternative that represents current practice | Whether a comparison is meaningful |
| Score per case | Apply a metric or rubric and inspect failures behind an average | Evaluation discipline |
| One-change experiment | Choose one variable, hold others fixed, and predict the effect | Causal reasoning |
| Diagnose the mismatch | Find tokenizer, template, adapter, format, backend, or revision errors | Systems understanding |
| Reality versus fiction | Rewrite a claim into a testable statement | Resistance to hype |
| License stack | Assign obligations and uncertainties to code, weights, data, and output | Component-level governance |
| Threat and recovery | Select an attack or failure, control, evidence source, and rollback | Operational safety |
| Teach it back | Explain a term to a beginner without substituting another undefined term | Durable comprehension |
| Decision memo | Recommend, reject, defer, or narrow a model system | Practical judgment |
| Evidence audit | State what a manifest, hash, benchmark, log, or certificate proves and does not prove | Honest claims |

### Feedback contract

Every formative response provides:

1. what the learner noticed correctly;
2. the exact missing or confused distinction;
3. the evidence that resolves it;
4. a short plain-language restatement;
5. one concrete example;
6. an optional refresher;
7. another attempt.

The interface does not respond with only "Wrong", "Try again", or "You should know this". Missed items return later in a different example. No life, point, streak, or content access is lost.

### Retrieval schedule

- A new term returns in the next unit as recognition.
- It returns later in the course as prediction or diagnosis.
- It returns in the path project as a decision.
- It returns in another path as a changed context.
- A learner can open the source lesson during formative work.
- Protected assessments disclose skills and format but not answer keys.

## Reality-versus-fiction callout library

Course authors place a callout at least once per module when a common belief could produce a bad decision. The callout is short, specific, and testable. The optional cross-school [Reality versus fiction curriculum](REALITY_VS_FICTION_CURRICULUM.md) can link into these deeper local-model explanations without duplicating or gating them.

| Fiction or shortcut | Reality to teach | Observable check |
| --- | --- | --- |
| The model searched the internet | Ordinary generation uses current context and learned parameters unless a retrieval or network tool is explicitly connected | Inspect system data flow and network or tool events |
| The model remembered my last chat | Continuity requires the application to resend or retrieve saved state | Clear context and inspect request payload in a safe fixture |
| One token equals one word | Tokenizers can split words, combine spaces, or use bytes and subwords | Compare two tokenizers on the same text |
| Context is memory forever | Context is bounded input to a request or session, not permanent weight storage | Start a clean session and inspect included messages |
| More parameters always wins | Task, data, post-training, inference settings, and constraints affect quality | Run a representative task evaluation |
| Local means no network | A local application can still fetch, update, log, or call external services | Use an offline and network-observation test |
| Open weights means open source | Code, weights, data, and documentation can have different access and licenses | Build the component license stack |
| A model card proves safety | A card reports claims and evidence selected by its publisher | Compare disclosures to independent task tests |
| Quantization makes a model smarter | Quantization changes representation, not learned knowledge | Compare the same task per case before and after |
| Q4_K_M is always the best quant | Fit and quality depend on model, task, runtime, and hardware | Evaluate multiple representations under one plan |
| The file fits, so it runs | Working memory also includes cache, buffers, runtime, and other processes | Measure peak memory during the exact workload |
| A GPU makes every operation faster | Transfer, unsupported kernels, small workloads, and fallback can erase gains | Inspect backend use and profile the same case |
| An NPU runs any AI model | NPUs support selected operators, types, shapes, and toolchains | Check the runtime's exact support matrix |
| Temperature zero is deterministic | Kernels, parallelism, versions, and tie behavior can still differ | Repeat under recorded conditions |
| Fine-tuning adds new facts reliably | Fine-tuning changes behavior and can memorize, distort, or forget | Compare to retrieval and test held-out facts |
| RAG guarantees grounded answers | Retrieval and synthesis can each fail | Measure retrieval, faithfulness, and citations separately |
| An embedding understands meaning | It maps items using patterns learned for a particular objective | Inspect nearest-neighbor failures |
| A high score means production ready | Benchmarks can be narrow, contaminated, or operationally irrelevant | Test the target task and failure costs |
| Training loss tells the whole story | Training loss measures one objective on seen batches | Compare validation, test, and real-task behavior |
| A checkpoint is a complete experiment | Reproduction also needs code, tokenizer, data, environment, and configuration | Rebuild from the manifest |
| A local API is safe by default | Bind address, authentication, local users, logs, and tools determine exposure | Inspect listeners, requests, and access controls |
| Deleting the visible file removes the model | Caches, copies, checkpoints, adapters, backups, and logs can remain | Follow the deletion inventory |
| Reasoning text proves the real thought process | Visible intermediate text is generated output and may be incomplete or misleading | Score final behavior and consistency, not a consciousness claim |
| A multimodal model sees like a person | It transforms encoded inputs and can miss text, count, layout, audio, or context | Use modality-specific test sets |
| An agent can decide safely on its own | Tool access turns model uncertainty into system actions | Require scope, confirmation, idempotence, audit, and stop |

## Portfolio structure

The 13 path projects are open, versioned, and independently useful:

| Project | Main artifact | Evidence level |
| --- | --- | --- |
| 1. Model choice memo | Task, model-role, hosting, data, and license decision | E1 |
| 2. Local lab readiness packet | Hardware, fit, environment, recovery, and no-go thresholds | E1 or E2 |
| 3. Reproducible local inference comparison | Artifact, runtime, settings, measurements, and cleanup | E2 |
| 4. Traceable tiny dataset | Source, rights, pipeline, splits, data card, and rebuild | E2 |
| 5. Model evaluation card | Task, baseline, cases, metrics, rubric, failures, and decision | E2 |
| 6. Private grounded reference assistant | Source-to-answer flow, retrieval evaluation, security, and deletion | E2 |
| 7. Bounded adapter study | Base, data, LoRA or QLoRA experiment, evaluation, and rollback | E2 |
| 8. Tiny model laboratory report | Tokenizer, architecture, training, checkpoint, comparison, and limits | E2 |
| 9. Preference data and behavior review | Rubric, comparisons, disagreement, regressions, and decision | E1 or E2 |
| 10. Quantization tradeoff report | Artifact metadata, fit, speed, quality, and selection | E2 |
| 11. Private local model service | Exposure, capacity, logs, update, rollback, and decommission | E2 |
| 12. Responsible release review | Threat, licenses, provenance, privacy, evaluation, and release decision | E1 or E3 |
| 13. Reproducible specialization study | Claim, environment, task evidence, risk, and negative result | E2 or E3 |

### Integrated capstones

1. **Local Model Operator:** choose, verify, run, evaluate, and remove a model in a learner-controlled environment.
2. **Private Knowledge System:** build, evaluate, secure, update, and delete a retrieval-based local reference system.
3. **Adapter Experiment:** justify adaptation, prepare data, train a small adapter, compare it to the base, and roll back.
4. **Local Model Service:** operate a bounded service through a change, capacity event, incident, recovery, and retirement.
5. **Research Reproduction:** reproduce or honestly fail to reproduce a bounded claim and publish all required context.

A capstone can earn full credit for rejecting a model, stopping an unsafe run, failing to improve a baseline, or failing to reproduce a claim when the method and evidence are sound.

## Progress, evidence, assessments, and credentials

### Shared evidence levels

The school uses the academy-wide evidence classes:

| Level | Meaning here | Honest claim |
| --- | --- | --- |
| E0 | Page or unit completion only | The learner opened or completed authored material |
| E1 | Learner attestation, authored exercises, or structured planning work | The learner completed the declared learning activity |
| E2 | Deterministic manifest and result checks from a learner-run lab | The submitted evidence is consistent with the declared bounded task |
| E3 | Human review under a published rubric | A reviewer judged the submitted work against the listed outcomes |
| E4 | Future controlled environment with independent observation | The task occurred in the controlled environment under its published protocol |

No E2 check claims legal identity, independent authorship, absence of omitted failures, or broad professional competence.

### Progress data the platform may store

- school, path, course, module, unit, exercise, lab, and project identifiers;
- completion and attempt timestamps;
- bounded authored answers and rubric results;
- content, lab, and assessment versions;
- learner-created bookmarks and private notes when explicitly saved;
- redacted evidence manifest fields the learner deliberately submits;
- credential issuance, state, and verification records.

### Data the platform must not collect by default

- model weights, checkpoints, adapters, tokenizer files, or quantized artifacts;
- datasets, document corpora, vector indexes, embeddings, or retrieved passages;
- private prompts, generated responses, full transcripts, or chat history;
- raw training, service, shell, system, GPU, or network logs;
- source repositories;
- account names, home directory paths, device identifiers, or public addresses;
- credentials, tokens, keys, cookies, recovery codes, or provider secrets;
- proprietary evaluation cases or assessment answers;
- employer or client data.

### Minimal assessment manifest

~~~text
evidence/
  assessment-manifest.json
  curriculum-version.txt
  lab-version.txt
  environment-summary-redacted.json
  artifact-source-manifest.json
  configuration-redacted.json
  results-summary.json
  checksums.txt
  decision-log.md
  recovery-and-cleanup.md
  limits.md
  learner-attestation.md
~~~

The learner sees and approves every field before submission. Paths and identifiers are redacted or replaced with learner-selected labels. Raw prompts and outputs are included only when the assessment uses supplied synthetic fixtures and the learner explicitly selects them.

### Completion records

- Models From Zero
- Safe Local Model Lab
- Local Inference Workflows
- Responsible Model Data
- Model Evaluation Foundations
- Local Retrieval Systems
- LoRA and QLoRA Foundations
- Tiny Model Training Foundations
- Preference and Behavior Foundations
- Quantization and Performance
- Local Model Service Operations
- Model Security and Responsible Release
- Model Research and Specialization

These records mean that required units and formative work were completed. They are not applied-skill certifications.

### Applied skill credential 1: Local Model Operator

Assessed outcomes:

- define the task and select an appropriate model role;
- inventory hardware and establish fit thresholds;
- inspect repository, revision, format, tokenizer, template, and license;
- verify and inventory a bounded artifact;
- run a versioned local workflow with synthetic inputs;
- measure task quality, memory, timing, and failure;
- verify network and service boundaries;
- stop and clean up completely;
- explain what the evidence does and does not prove.

Minimum evidence:

- server-scored knowledge assessment;
- E2 local lab manifest;
- reproducible evaluation summary;
- recovery and cleanup proof;
- reviewer spot check for one decision memo before production issuance.

### Applied skill credential 2: Local Model Data and Evaluation Practitioner

Assessed outcomes:

- define purpose, schema, rights, provenance, retention, and withdrawal;
- profile, clean, split, tokenize, and version a small dataset;
- prevent known evaluation leakage and document remaining risk;
- define a representative task evaluation and baseline;
- apply metrics and a human rubric appropriately;
- analyze per-case failures, robustness, and uncertainty;
- make an evidence-based release decision.

Minimum evidence:

- server-scored knowledge assessment;
- E2 data-build and evaluation manifests;
- data card and model evaluation card;
- E3 review of one integrated decision.

### Applied skill credential 3: Local Model Engineer

Assessed outcomes:

- choose prompt, retrieval, adapter tuning, quantization, or ordinary software appropriately;
- conduct a bounded LoRA or QLoRA experiment;
- measure quality and resource changes against an unchanged baseline;
- operate a private service with access, logs, capacity, update, rollback, and retirement;
- threat-model artifacts, data, retrieval, prompts, and tools;
- record component licenses and provenance;
- communicate known limits and stop an unsafe release.

Minimum evidence:

- current Local Model Operator and Data and Evaluation outcomes, or equivalent assessment evidence;
- E2 adapter and service lab manifests;
- E3 integrated capstone review;
- published rubric, reviewer calibration, appeal, revocation, and version policy.

### Credential wording and verification

Credential pages state:

- exact credential and assessment version;
- issue date and current, legacy, expired, or revoked state;
- skills assessed;
- evidence level;
- reviewer level where applicable;
- identity and authorship limits;
- environment and task limits;
- expiration or review policy;
- issuer and verification ID.

Credentials are private by default. Public verification is explicit and reveals no hardware identity, raw lab content, account data, private prompt, model artifact, dataset, or assessment answer. The names do not imply government accreditation, professional licensure, or equivalence to a third-party certification.

## Course and unit information architecture

### Course page

Every course page contains:

- title and one-sentence purpose;
- concrete explain and do outcomes;
- separate reading, exercise, and lab time estimates;
- **Start now**, **Review a refresher**, and **Read the short context summary**;
- supported environment lanes and reading-only route;
- hardware, software, storage, network, possible cost, and accessibility needs;
- new terms;
- module and lab inventory;
- risk classes and data boundary;
- named break and checkpoint locations;
- portfolio relationship and public rubric;
- exact version, last technical review, sources, and known limitations;
- adjacent Linux, Networking, Cybersecurity, Programming, Math, and Data links.

### Module page

Each module includes:

1. situation;
2. new terms;
3. optional hidden-prerequisite links;
4. why the idea exists;
5. explanation;
6. accessible visual and text equivalent;
7. worked example;
8. reality-versus-fiction callout;
9. prediction or diagnosis exercise;
10. guided practice or prepared trace;
11. verification and recovery;
12. common failures;
13. retrieval round;
14. checkpoint and break;
15. next action;
16. sources and review date.

### Short unit page

~~~text
Breadcrumbs and saved position
Course and module context
Unit title
What you will understand or do
New words
Explanation
Diagram or worked example
One small exercise
Specific feedback
Reality check
Optional deeper detail
Previous | Save and take a break | Next
Sources, version, and last review
~~~

The lesson receives most of the page area. There is no marketing hero, generic inspiration copy, chat box, giant progress decoration, decorative terminal wall, or grid of indistinguishable cards competing with the teaching.

## Visual and accessibility system

### Required visual types

| Concept | Preferred visual |
| --- | --- |
| Model lifecycle | Source, rights, preparation, tokenizer, training, checkpoint, evaluation, quantization, deployment, monitoring, retirement |
| Site boundary | Website teaching and prepared examples beside learner-controlled execution and data |
| Generation | Token input, probability distribution, sampled next token, repeated sequence |
| Context | Token budget showing instructions, conversation, retrieved material, and output allowance |
| Model taxonomy | Task, modality, training stage, artifact, quantization, and runtime as separate axes |
| Hardware | CPU, RAM, GPU or NPU, VRAM or unified memory, storage, and data movement |
| Memory fit | Raw weights, runtime, context cache, batch, operating system, and headroom |
| Data provenance | Origin, rights, transformations, splits, artifacts, release, withdrawal |
| Evaluation | Task, baseline, cases, measures, failures, threshold, and decision |
| Retrieval | Source, chunk, embedding, index, candidate, reranker, prompt, answer, citation |
| LoRA | Frozen base path plus two smaller learned matrices |
| Training | Batch, forward, loss, backward, update, validation, checkpoint |
| Quantization | Source values, grouped representation, scale, reconstruction, error |
| Service | Client, loopback listener, runtime, model, logs, limits, and stop |
| Security | Trust boundaries, assets, actors, threats, controls, evidence, recovery |

Every visual has:

- a complete text equivalent;
- labels that do not rely on color;
- keyboard access and visible focus;
- reading order exposed to assistive technology;
- 200 percent zoom and narrow-screen behavior;
- reduced-motion support;
- pause, step, replay, and event transcript for animation;
- no flashing, rapidly streaming decorative tokens, or tiny fixed-width text;
- a printable or downloadable text version.

Prepared token streams are controllable and never pretend to be live model execution.

### Accessibility beyond rendering

- Command examples are copyable text with prompt, typed input, and output separated.
- Mathematical notation is paired with plain language and a worked numeric example.
- Tables reflow into labeled records without horizontal scrolling when practical.
- Audio and vision courses do not require microphone, camera, hearing, or sight.
- Prepared transcripts, captions, descriptions, and synthetic fixtures provide equivalent routes.
- Long labs have save points and restart instructions.
- Learners can use a written explanation, structured manifest, or accessible text-described diagram where it demonstrates the same outcome.
- No assessment depends on dragging, color sorting, timed typing, voice, or memorizing a long command.

## Source, example, and freshness policy

Local-model software, model repositories, licenses, hardware support, and recommended security practices change quickly. The school separates durable concepts from versioned examples.

### Source register

Each course maintains:

- primary specification, project, framework, or vendor documentation;
- exact relevant version or revision;
- publication or access date;
- claim supported;
- whether the source is normative documentation, a vendor claim, a paper, a benchmark, a community report, or local test evidence;
- tested operating system, hardware, runtime, artifact, and configuration;
- license and attribution notes;
- volatile screenshots, commands, URLs, formats, and model names;
- last review, next review, and owner;
- known contradiction or missing evidence.

### Source preference

Use primary sources for technical behavior:

- upstream runtime and framework documentation;
- format specifications and implementation records;
- model and dataset cards from the actual publisher and revision;
- licenses and terms from their authoritative location;
- peer-reviewed paper or author-published research artifact for a research claim;
- hardware-vendor documentation for supported features, clearly labeled as vendor documentation;
- NIST and other appropriate standards bodies for risk and security frameworks.

Community reports can reveal compatibility and failure cases. They do not replace a support statement or controlled test. Vendor quality, cost, performance, security, and privacy claims are labeled as claims until independently checked for the course's task.

### Named model policy

The core curriculum teaches model roles and selection criteria without maintaining a live best-model list.

A lab may name a model only when:

- it is a version-pinned teaching example;
- repository, revision, license, architecture, tokenizer, template, files, and resource measurements are recorded;
- the lesson states that the example requires refresh before reuse;
- a synthetic or otherwise authorized task is used;
- a prepared no-download route exists;
- the model can be replaced without changing the learning objective;
- no ranking or recommendation is implied beyond the measured task and date.

Pages never say "download the latest", "choose the most popular", or "use the best current model" without an explicit current research and review workflow.

### Review cadence

| Content type | Minimum review |
| --- | --- |
| Tool installation, user interface, command, and runtime API | Every supported major release and at least every 3 months |
| Named model, repository, file, license, or resource measurement | Every 3 months and before a lab rebuild |
| Driver, accelerator, operating-system, and backend support | Every 3 months and after a declared platform release |
| Security and unsafe-loading guidance | Every 3 months and after a relevant advisory |
| Privacy, provider, or organization-managed data-flow example | Every 6 months and whenever terms or architecture change |
| Data, model, and software license explanation | Every 6 months and when the authoritative terms change |
| Research paper and benchmark reproduction | Annually, with environment preservation |
| Durable conceptual and historical unit | Annually for sources and broken links |
| Lab artifact | Monthly integrity and vulnerability check, quarterly clean rebuild |
| Assessment item bank | Quarterly exposure and quality review |
| Credential rubric | Annual reviewer and task calibration |

An unsupported runtime, withdrawn model, changed license, broken artifact, missing hash, unsafe dependency, or unverified platform claim fails the relevant lab release.

### Primary starting references

- [NIST AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework)
- [NIST AI 600-1, Generative Artificial Intelligence Profile](https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence)
- [Hugging Face model cards documentation](https://huggingface.co/docs/hub/model-cards)
- [Hugging Face dataset cards documentation](https://huggingface.co/docs/hub/datasets-cards)
- [Safetensors documentation](https://huggingface.co/docs/safetensors/)
- [PyTorch documentation](https://pytorch.org/docs/stable/index.html)
- [Transformers documentation](https://huggingface.co/docs/transformers/)
- [PEFT documentation](https://huggingface.co/docs/peft/)
- [TRL documentation](https://huggingface.co/docs/trl/)
- [llama.cpp repository and documentation](https://github.com/ggml-org/llama.cpp)
- [GGUF format documentation in the ggml project](https://github.com/ggml-org/ggml/blob/master/docs/gguf.md)
- [Ollama documentation](https://docs.ollama.com/)
- [LM Studio documentation](https://lmstudio.ai/docs/)
- [MLX documentation](https://ml-explore.github.io/mlx/build/html/index.html)

Links are starting points, not blanket endorsements. Course authors cite the exact page and version relevant to a claim.

## Cross-school integration

Local Models uses concepts from other schools without making them locks.

### Linux School

- LM-201 links to terminal, paths, files, processes, exit status, and safe command reading.
- LM-204 links to packages, environments, permissions, storage, and dependency ownership.
- LM-303 links to checksums, archives, storage, and clean removal.
- LM-1100 links to processes, service users, sockets, logs, firewall, backups, and recovery.
- Every link has a short local-model context page for learners who start here.

### Networking School

- LM-106 and LM-1201 link to data flows, clients, servers, addresses, ports, latency, and trust boundaries.
- LM-303 uses network observation only on learner-owned environments.
- LM-1102 links to loopback, private and public addresses, routing, firewall, transport encryption, and exposure.
- Distributed-training concepts link to latency, bandwidth, congestion, failure, and topology.

### Cybersecurity School

- Artifact intake links to trusted sources, dependency risk, unsafe serialization, and least privilege.
- Retrieval and agent courses link to prompt injection, tool scope, authorization, logs, and incident response.
- Data courses link to classification, privacy, retention, deletion, and supply-chain provenance.
- Service courses link to identity, secrets, bind addresses, patching, monitoring, backup, and recovery.
- No security lab uses a public target or a real secret.

### Programming, Math, and Data

- Python, variables, functions, environments, errors, and tests are explained locally and linked to deeper programming study.
- Vectors, matrices, probability, averages, distributions, and gradients receive plain local definitions and optional math extensions.
- Data tables, schemas, cleaning, splitting, sampling, and versioning receive complete context and links to deeper data study.
- Learners are never redirected away from the selected course because a prerequisite is incomplete.

### Academy platform

- The [No assumed knowledge standard](NO_ASSUMED_KNOWLEDGE_STANDARD.md) applies universally, including to advanced research and systems work.
- The [Reality versus fiction curriculum](REALITY_VS_FICTION_CURRICULUM.md) may link to these courses as optional context. It does not duplicate or unlock them.
- The shared content hierarchy, direct routes, breadcrumb, bookmark, resume, source, progress, lab, evidence, assessment, and credential contracts are reused.
- The school adds no browser-side Python or general-purpose execution.
- Prepared examples remain inert authored content.
- Progress writes remain bounded server-owned actions.
- Protected assessment answers never enter browser bundles.
- MILESTONES.md remains the canonical implementation ledger. This document explains curriculum detail and does not create a competing backlog.

## Alignment to canonical milestones M296 through M330

| Canonical milestone | Curriculum coverage |
| --- | --- |
| M296, school boundary | Non-negotiable open access, product and computation boundary, prepared-example label |
| M297, foundations | LM-100 and first-hour route |
| M298, model lifecycle | LM-103 plus lifecycle visual and paths LM-400 through LM-1200 |
| M299, responsible use | LM-106, LM-500, LM-1200, and reality callouts |
| M300, local lab foundation | LM-200 and shared lab contract |
| M301, hardware fit | LM-202, LM-203, sizing worksheet, and LM-1005 |
| M302, repositories and licenses | LM-301 through LM-303 and LM-1202 through LM-1204 |
| M303, local runtimes | LM-304 through LM-306 |
| M304, offline inference | LM-303 through LM-306 and four-part offline proof |
| M305, prompts, templates, context, and sampling | LM-104, LM-302, LM-304 through LM-306 |
| M306, measurement | LM-505, LM-1004, and benchmark contract |
| M307, data | LM-400 |
| M308, evaluation | LM-500 |
| M309, retrieval | LM-600 |
| M310, fine-tuning decision | LM-701 |
| M311, training concepts | LM-800 |
| M312, LoRA and QLoRA | LM-702 through LM-706 |
| M313, controlled experiments | LM-205, LM-505, LM-705, LM-806, and shared experiment records |
| M314, small training | LM-805 and LM-806 |
| M315, preference work | LM-900 |
| M316, quantization and performance | LM-1000 |
| M317, local serving | LM-1100 |
| M318, security and privacy | LM-1200 plus boundaries across every path |
| M319, distributed and reproducible research | LM-1301 and LM-1302 |
| M320, specializations | LM-1303 |
| M321 through M323, skill credentials | Local Model Operator, Data and Evaluation Practitioner, Local Model Engineer |
| M324 through M327, evidence and integrity | Shared E0 through E4 levels, minimal manifest, rubrics, privacy, and verification |
| M328, Linux integration | Explicit Linux bridge map and shared learner lanes |
| M329, cross-school integration | Networking, Cybersecurity, Programming, Math, Data, and academy contracts |
| M330, release gate | Definition of done, release waves, technical review, accessibility, and safety gates |

## Release waves

The school grows through complete, useful waves. Draft course names do not appear as locked cards in the learner catalog.

| Wave | Published scope | Minimum complete evidence |
| --- | --- | --- |
| 1. Understand models | LM-101 through LM-106 | Open direct routes, no-assumed-knowledge review, prepared-example labels, 6 labs, project 1 |
| 2. Safe local operator | LM-201 through LM-306 | Platform preflights, artifact verification, tool-version testing, offline proof, 11 more labs, projects 2 and 3 |
| 3. Data and evaluation | LM-401 through LM-505 | Rights and provenance review, synthetic dataset, evaluation fixtures, 10 labs, projects 4 and 5 |
| 4. Retrieval and adaptation | LM-601 through LM-706 | Local-only retrieval fixture, data deletion, adapter safety, base comparison, 10 labs, projects 6 and 7 |
| 5. Training and behavior | LM-801 through LM-904 | Tiny CPU-compatible route, checkpoint recovery, preference-governance review, 10 labs, projects 8 and 9 |
| 6. Performance and operations | LM-1001 through LM-1105 | Quant artifact records, platform measurements, loopback service, upgrade and rollback, 10 labs, projects 10 and 11 |
| 7. Responsible release and research | LM-1201 through LM-1303 | Threat and license reviews, reproducible research packet, modality safety, 8 labs, projects 12 and 13 |
| 8. Credentials | Three integrated assessments | Public blueprints and rubrics, privacy review, calibrated checks and reviewers, appeals and revocation |

Once a course is published, it remains directly open. A legacy version can remain available for credential verification without being presented as current instruction.

## Definition of done for one course

A course is ready only when:

- every published page is reachable directly without an account or prior completion;
- all three entry choices work;
- a true beginner can identify the purpose without unexplained jargon;
- every new term and hidden prerequisite is defined or linked to an immediate context summary;
- examples show why the idea exists and where the analogy fails;
- the website versus learner-environment boundary is explicit;
- prepared outputs are labeled as prepared and inert;
- named tools and models are versioned, dated examples with no permanent best claim;
- every visual has a complete accessible text equivalent;
- exercises include specific feedback and another attempt;
- natural breaks and resumable checkpoints are present;
- each active lab follows the shared risk, preflight, recovery, stop, cleanup, and evidence contracts;
- every L2 through L4 lab has a prepared L0 or L1 route;
- no lab needs a real secret, private dataset, public target, or paid service;
- no command silently installs, phones home, exposes a listener, or runs unreviewed remote code;
- exact platform, artifact, environment, and resource claims were tested;
- expected results and common failure symptoms are documented;
- source, license, provenance, content version, review date, and owner are recorded;
- assessment teaching remains open and protected answers remain server-side;
- credential wording matches evidence;
- keyboard, screen reader, contrast, reduced motion, high-contrast, narrow-screen, print, and 200 percent zoom reviews pass;
- a second reviewer checks clarity, technical accuracy, license context, privacy, safety, and honest limits.

## School acceptance criteria

### Beginner-first teaching

- The first path assumes no AI, programming, terminal, hardware, math, or statistics knowledge.
- Every model family and modality is explained through concrete inputs, outputs, uses, and limitations.
- Training, inference, fine-tuning, prompting, retrieval, and preference work are never used as synonyms.
- Parameters, tokens, context windows, embeddings, vectors, rerankers, tensors, gradients, and checkpoints receive plain definitions.
- CPU, GPU, NPU, RAM, VRAM, unified memory, storage, and memory bandwidth are distinguished.
- At least one beginner review observes the first 90 minutes without coaching around confusing language.

### Technical completeness

- Base, instruct, reasoning, chat, code, embedding, reranker, vision, image-generation, audio, multimodal, classifier, and adapter roles are covered.
- Local, public-cloud, and organization-managed deployment tradeoffs cover privacy, cost, latency, control, quality, maintenance, offline use, and failure.
- Open source, open weights, source-available, open-model project, and proprietary terms remain distinct.
- FP32, FP16, BF16, INT8, INT4, GGUF, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0, Q3_K_M, and Q2_K are explained without universal quality promises.
- Hardware sizing separates raw weights from runtime, context, batching, concurrency, training state, and headroom.
- Formats, tokenizers, templates, adapters, runtimes, downloading, verification, safe loading, and cleanup are taught.
- llama.cpp-style, Ollama-style, LM Studio-style, Python, and optional MLX workflows are versioned examples.
- Evaluation, RAG, LoRA, QLoRA, tiny training, preference work, quantization, serving, research, and specializations all include honest stop conditions.

### Safety, rights, and privacy

- The site never implies page-side or site-side model computation for prepared examples.
- Lab data is synthetic or clearly authorized.
- Model, data, code, tokenizer, adapter, converter, runtime, and output terms are recorded separately.
- Provenance and withdrawal reach derived datasets, indexes, adapters, checkpoints, quants, caches, and releases.
- Local privacy claims require a complete data flow, not only a local model file.
- Services begin on loopback and public exposure is not a beginner default.
- Unsafe serialization, custom code, prompt injection, retrieval poisoning, supply chain, logs, resource exhaustion, and tool actions are included in threat models.
- Every experiment can stop without losing the original source or an understood recovery route.

### Evidence and credentials

- Every path has a portfolio project and public rubric.
- Completion, applied skill, and professional or broad claims remain distinct.
- Evidence uses the shared E0 through E4 scale.
- Raw private lab content is not collected by default.
- Automated checks state their limits.
- Judgment-heavy work uses calibrated human review.
- Credentials are private by default and versioned.
- A failed experiment or no-go decision can receive full credit when evidence and reasoning are sound.

### Open and accessible platform

- All 65 course pages can be opened without completing another course.
- Direct links, refresh, Back, Forward, bookmarks, and saved position work at school, path, course, module, unit, lab, and project levels.
- Lesson content occupies the primary page area.
- No information depends only on color, animation, audio, video, hover, drag, or timed response.
- A no-compute reading route exists for all courses.
- Windows, WSL, Intel Mac, Apple Silicon Mac, Linux, VM, and external-compute claims are tested separately or omitted.

## Definition of success

This school succeeds when a learner can say:

- I can explain what a model is without describing it as magic or a mind.
- I can distinguish model roles and choose when not to use one.
- I know the difference between training, fine-tuning, inference, prompting, and retrieval.
- I can explain parameters, tokens, context, embeddings, and rerankers.
- I can trace where my prompt, files, weights, logs, and output go.
- I can compare local, hosted, and organization-managed choices honestly.
- I can estimate memory, then verify actual fit instead of trusting a file size.
- I understand common precisions and quant names without treating one label as universally best.
- I can verify an artifact, run it through a bounded local workflow, measure it, stop it, and remove it.
- I can prepare authorized data and prevent known evaluation leakage.
- I can build a representative evaluation and look behind an average score.
- I can decide whether retrieval, LoRA, QLoRA, ordinary software, or no change fits the task.
- I can run or analyze a tiny training experiment and explain why it is tiny.
- I can operate a local service without accidentally publishing it.
- I can identify license, provenance, privacy, security, and maintenance gaps.
- I can report a negative result without turning it into a success story.
- I know what my completion record or credential proves and what it does not.

The deeper success is that a local model stops looking like one mysterious download. It becomes a system of data, learned parameters, artifacts, runtime, hardware, prompts, evaluation, people, licenses, operations, and evidence that the learner can inspect, question, change carefully, verify, recover, and retire.
