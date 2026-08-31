# Models From Zero first-release learning-path authoring blueprint

Last reviewed: 2026-08-30

Status: authoring blueprint; not live and not publication-ready

Canonical home: `LM-100: Models from zero`, containing `LM-101` through `LM-106`

Roadmap relationship: foundational authoring toward M296 through M306. Deferred appendices also collect notes relevant to M383 through M407, LM-200 and LM-300 local labs, and LM-1000 quantization. This packet does not complete any of those milestone ranges.

## What this path is for

This working packet explains models before asking the learner to install, download, run, compare, or train one.

It assumes the learner may not know:

- what artificial intelligence (AI) means;
- what machine learning means;
- what a model is;
- what an application is;
- what a server or cloud service is;
- what local means;
- what a parameter, weight, token, context window, checkpoint, embedding, runtime, or quant is;
- how computer memory differs from storage;
- why the same model can appear in several files or sizes;
- why a consumer chat product and a managed enterprise application programming interface (API) can use related models while having different data rules;
- why a local program can still contact the Internet;
- why a hosted system can still have strong privacy controls;
- why no deployment choice is automatically safe, private, cheap, fast, or good.

Every term above is defined locally before it appears inside learner-visible instruction. This authoring packet may name later concepts while describing scope, but the published page may not rely on that author-facing summary as the definition.

In the planned implementation, the site will provide explanations, diagrams, ordinary knowledge exercises, prepared evidence, progress, and assessment. It will not run a model, inspect the learner's hardware, process prompts through a third-party model, download model files, or receive learner datasets. Optional practical work happens only in a learner-controlled environment.

## Path outcome

After completing the authored material, the learner can:

1. explain what a model is without calling it a database, person, or magic program;
2. distinguish an ordinary program, learned model, application, search system, and provider-hosted service;
3. identify several model families and select a family based on a task;
4. distinguish training from inference, retrieval, and common adaptation stages;
5. explain parameters, weights, checkpoints, tokenizers, tokens, context, and sampling in plain language;
6. explain how embeddings, candidate retrieval, and reranking serve different jobs;
7. treat base, instruction, chat, reasoning, code, vision, audio, embedding, and reranker labels as clues that require a model-card check;
8. compare consumer chat, provider API, managed enterprise service, organization-controlled cloud deployment, private hosted service, and local execution;
9. map where input, output, logs, files, identity, and network traffic go;
10. distinguish open-source code, open weights, source-available material, and proprietary components by the actual rights and evidence.

Deferred appendices support later outcomes: explain precision and quantization, read quant labels, estimate a model-fit range, run a reviewed learner-controlled lab, compare local and provider-hosted options fairly, choose a simpler non-LLM system when appropriate, and document a decision, fallback, and review date. Those outcomes do not become LM-100 completion requirements.

## Canonical LM-100 course map

The learning path contains exactly these six courses. Each course and guided lab remains directly open. The complete-path planning estimate is 20 to 30 hours, with natural stopping points after each module and course. Time is planning information, not a deadline.

| Course | Main content | Required core guided lab |
| --- | --- | --- |
| `LM-101: What a model is` | Rules, lookup tables, learned mappings, inputs, outputs, parameters, prediction, generation, capability, and failure | `LML-101 Model or Not`, L0 prepared classification and concept map, E1 self-attested completion |
| `LM-102: Model families and modalities` | Predictive and generative tasks; text, vision, image, audio, multimodal, classifier, and structured-prediction systems | `LML-102 Task to Model`, L0 prepared task selection and limitations, E1 |
| `LM-103: Training, fine-tuning, and inference` | Training from scratch, continued pretraining, supervised tuning, adapter tuning, preference tuning, inference, and retrieval | `LML-103 Lifecycle Sort`, L0 prepared action-and-artifact map, E1 |
| `LM-104: Parameters, tokens, context, and sampling` | Parameters, tokenizers, token IDs, context window, attention intuition, next-token probability, temperature, and sampling | `LML-104 Token Walk`, L0 prepared tokenization and sequence trace, E1 |
| `LM-105: Embeddings, search, and reranking` | Vectors, similarity, embedding models, candidate retrieval, rerankers, and limits of distance | `LML-105 Neighborhood Map`, L0 prepared retrieval and reranking comparison, E1 |
| `LM-106: Model access and deployment choices` | Model roles; local, public API, and organization-managed designs; open-source, open-weight, source-available, and proprietary boundaries | `LML-106 Data-Flow Decision`, L0 prepared custody map and conditional choice, E1 |

The six guided labs above are the canonical LM-100 lab inventory. They use prepared evidence and no execution. The current body contains 40 working unit outlines and 6 draft formative checks gathered before this hierarchy was fixed. Those numbers are authoring inventory, not public registry totals. Authors must merge, split, and relocate the notes under `LM-101` through `LM-106`, assign stable module and unit IDs, and generate final counts from the registry.

Precision, detailed quant-name reading, hardware-fit calculation, an active local-model lab, a live local-versus-hosted comparison, and the design capstone do not count toward LM-100 completion. They remain useful deferred notes for LM-1000, LM-200 or LM-300, and Phase 26. Their draft time estimates are not the canonical LM-100 path estimate.

## Course access and publication boundary

This is the authoring blueprint for the canonical `LM-100: Models from zero` path, not the complete Local Models and LLMs school. Only the six-course map above defines its current path identity. The working outlines below are source notes and must not create a second `Models From Zero` path or completion record.

The packet is not live course content. When reviewed material is published, every path, course, module, unit, prepared example, guided-lab brief, assessment outline, rubric, and source note remains directly open. A guest can read the teaching and use its A0 self-checks. Signing in may synchronize private progress, but it does not reveal hidden teaching.

No earlier course, assessment, payment, streak, or credential unlocks a unit. `Start now` includes the minimum context on the same page. Optional computer, file, command-line, arithmetic, or privacy refreshers appear beside it and never become route guards or completion conditions.

The L0 prepared, no-compute route is complete by itself. The optional local lab runs only in a learner-controlled environment and is not required to finish the reading material. These rules follow the [No assumed knowledge standard](../NO_ASSUMED_KNOWLEDGE_STANDARD.md) and the [Local Models and LLM curriculum](../LOCAL_MODELS_LLM_CURRICULUM.md). They do not create a learner category, diagnosis field, or medicalized path.

## Authoring allocation

| Working outline group | Canonical destination |
| --- | --- |
| Group 1, what a model is | Primarily LM-101; move lifecycle material to LM-103 and system-map material to LM-106 |
| Group 2, different kinds of models | LM-102, LM-105, and the model-role portion of LM-106 |
| Group 3, files and parts around a model | LM-103, LM-104, and LM-106; deeper repository and runtime detail moves to LM-300 |
| Group 4, local, hosted, cloud, and organization-managed use | LM-106, with detailed equivalent-system evaluation deferred to Phase 26 |
| Group 5, precision, quantization, and fit | Deferred appendix for LM-1000, except token and context foundations that belong in LM-104 |
| Group 6, choose and verify a system | Basic choice belongs in LM-106; active local labs and comparison capstones are deferred to LM-200, LM-300, and Phase 26 |

## Orientation words

These short definitions support the packet map. Published units still repeat the required definition at first use.

- **Artificial intelligence (AI):** A broad label for computer systems intended to perform tasks such as prediction, generation, perception, or decision support. The label alone does not explain the method or ability.
- **Machine learning:** A way to build model behavior by adjusting numerical parameters from examples or feedback instead of writing every decision rule directly.
- **Large language model (LLM):** A language model with many learned parameters and substantial language-oriented training. `Large` has no single fixed parameter threshold.
- **Application programming interface (API):** A documented way for one program to send a request to another program or service and receive a response.
- **Application:** Software that combines an interface, ordinary code, data, and sometimes one or more models or external services to perform a task.
- **Server:** A program or computer that accepts requests and returns data or performs work under defined access and network rules.
- **Cloud service:** A service reached across a network and operated on remote infrastructure. The phrase does not identify the exact owner, contract, location, or data rules.
- **Tensor:** A structured collection of numbers used in model computation. A scalar is one number, a vector is a one-dimensional collection, and a matrix is a two-dimensional collection.
- **Checksum:** A value calculated from file bytes and used to detect whether the bytes match an expected file. It does not prove that the expected file is safe or appropriately licensed.
- **Telemetry:** Operational information that software records or sends about use, performance, failures, or the environment.
- **Loopback:** A network boundary that sends traffic back to the same computer, commonly represented by `127.0.0.1` for Internet Protocol version 4. A loopback bind is not reachable from another computer unless another component forwards it.

## Stable unit structure

Every unit uses this order:

1. `Course > Module > Unit`, unit position, and one page title
2. One-sentence goal and purpose
3. Estimated time, number of required actions, activity type, and browser or learner-machine boundary
4. `Start now` beside optional preparation and short context
5. Words introduced on this page
6. One concrete input, question, or example
7. One prediction
8. One prepared result or learner observation
9. The idea named and explained step by step
10. One required practice action
11. Expected result, acceptable variation, and recovery
12. Immediate answer-specific feedback and another attempt
13. Recap and what the page did not claim
14. Saved stopping point and one clear next choice

The page never hides required instruction, safety boundaries, stop conditions, or recovery inside a tooltip, animation, video, or closed disclosure. Additional depth can use a disclosure after the complete beginner explanation. At any decision point, one action has primary emphasis and its label states the action, such as `Check answer` or `Continue to the next unit`.

## Working outline group 1: What is a model?

Allocation: primarily LM-101. Move Unit 1.2 to LM-103 and Unit 1.4 to LM-106 during course authoring.

### Unit 1.1: A model is learned numerical behavior

#### What this helps you understand

You will be able to recognize the model inside an AI application without confusing it with the entire application.

#### Words introduced on this page

- **Input:** Information given to a system.
- **Output:** Information returned by a system.
- **Rule:** An instruction written directly by a programmer.
- **Example:** One observed input and result used to show a pattern.
- **Learn:** In this course, adjust numbers using examples. It does not mean human understanding.
- **Model:** Learned numerical behavior that transforms an input into an output.

#### Start with an ordinary rule

Imagine a program that decides whether a room is cold:

```text
if temperature is below 18 degrees Celsius:
    output "cold"
otherwise:
    output "not cold"
```

A person wrote the important boundary, `18 degrees`, directly into the program. The computer follows that rule.

Now imagine a system that sorts thousands of plant photographs by species. A programmer could try to write rules about leaf shape, color, stem, lighting, camera angle, and background. Those rules would become difficult to write and maintain.

A machine-learning process instead adjusts many numbers using labeled examples. The resulting numerical behavior is the model. When the model receives a new photograph, it produces an output such as a list of possible species and scores.

The model is not the camera, upload button, website, image file, account, database, or screen. Those parts may belong to the application around the model.

#### The small system map

```text
person chooses a photograph
            |
            v
application prepares the input
            |
            v
model transforms the input
            |
            v
application shows the output
```

#### Predict

A calculator returns `4` for `2 + 2` by following arithmetic rules. Does that require a learned model?

- No. Ordinary code can perform this exact calculation.
- A model could be placed around a calculator, but the arithmetic itself does not need one.

#### Practice

For each system, choose `ordinary rule`, `learned model`, or `not enough information`:

1. A file-renaming tool always replaces spaces with underscores.
2. A photo tool groups faces that appear to belong to the same person.
3. A website recommends a book, but the description does not explain how.
4. A thermostat turns on below a temperature chosen by the user.

Answers:

1. Ordinary rule. The transformation is stated exactly.
2. Learned model is likely because visual similarity is being estimated, but the application may also use ordinary rules.
3. Not enough information. Recommendations can use hand-written rules, learned models, or both.
4. Ordinary rule. The user supplies the boundary and the program follows it.

#### What this page did not claim

- A model is not automatically an LLM.
- A model is not automatically intelligent.
- Learned behavior is not guaranteed to be correct.
- A model does not replace the surrounding application.
- A complicated system may combine several models and ordinary programs.

#### Stop here if needed

Saved fact: a model is one part of a system. It is learned numerical behavior that turns an input into an output.

Return question: which part of the plant example was the model, and which parts belonged to the application?

### Unit 1.2: Training and using are different activities

New words:

- **Training:** Adjusting model values using examples and an objective.
- **Inference:** Using an already prepared model to produce an output.
- **Objective:** A measurable direction used while adjusting a model.
- **Dataset:** An organized collection of examples and related information.

Plain comparison:

```text
Training
examples + objective + repeated adjustment -> model checkpoint

Inference
new input + model checkpoint -> output
```

Training usually needs more computation, data handling, time, and experiment control than inference. Downloading a model and asking it a question is inference. It is not training the base model.

Some products save conversation history, retrieve documents, adapt a small set of extra weights, or collect feedback. None of those actions should be casually described as `the model learned from this conversation` unless the system's documented process actually changes model parameters.

Practice:

- Opening a local model file and generating text: inference.
- Adjusting an adapter from labeled examples: training or fine-tuning.
- Adding a document to a search index: data indexing, not model training.
- Saving a chat transcript: storage, not model training.

### Unit 1.3: A model is not a database

A database stores records that can be retrieved. A generative language model stores learned numerical relationships. It may reproduce some information from training, but it does not provide a dependable record lookup by default.

A system can combine both:

```text
question
   |
   +--> search or database retrieves records
   |            |
   |            v
   +------> selected records join the prompt
                         |
                         v
                    language model
                         |
                         v
                     response
```

The application must preserve the distinction between retrieved evidence and generated wording. A fluent sentence is not proof that a record exists.

### Unit 1.4: A model is not the whole AI product

Identify the layers:

1. interface;
2. account and identity;
3. ordinary application code;
4. prompt or input preparation;
5. model runtime or provider API;
6. one or more models;
7. tools, search, or databases;
8. logs and monitoring;
9. safety and access controls;
10. storage and deletion.

The lesson uses a layer-toggle diagram. Turning off the model layer does not erase the other product layers. Replacing one model may not replace the application's storage or business rules.

### Unit 1.5: Why models can be wrong

Introduce these causes separately:

- the task is ambiguous;
- the input lacks needed information;
- the examples used to prepare the model do not cover the situation well;
- the model learns a pattern that does not hold here;
- generation introduces variation;
- the application uses the wrong prompt or template;
- retrieved information is missing, stale, or untrusted;
- a tool fails;
- the model is compressed or converted in a way that changes behavior;
- the expected answer itself is disputed.

The learner classifies a failure before choosing a repair. `Use a bigger model` is not accepted as a universal diagnosis.

### Unit 1.6: Reality check, the model is not a person in a box

Claim: `The model thinks, remembers every conversation, and looks things up before answering.`

What may be plausible:

- the complete application may store conversation history;
- the application may retrieve documents or call tools;
- the model may produce intermediate text intended to improve an answer;
- human-like wording can make the interaction easier.

What is missing:

- which component stored the history;
- whether storage is optional;
- what the model received in its current context;
- whether a database or tool was called;
- what evidence supports the answer;
- which model and application version produced it.

What to remember: human-like language describes an interface experience. It does not reveal the system architecture by itself.

Draft formative check: label a prepared AI application diagram and explain one thing the model does and three things handled by other components.

## Working outline group 2: Different kinds of models

Allocation: LM-102 for model families and modalities, LM-105 for embeddings and reranking, and LM-106 for model-role labels.

### Unit 2.1: Models are built for tasks

Introduce task, input type, output type, training objective, evaluation, and operating boundary. The learner starts from the job, not from a brand or model leaderboard.

### Unit 2.2: Classification and regression

- Classification chooses among categories or scores categories.
- Regression estimates a number.
- Neither term promises correctness.
- A threshold that turns a score into an action may be ordinary application code.

### Unit 2.3: Generative models

Compare text generation, image generation, audio generation, and code generation. Explain that generated output continues a learned pattern and must still be evaluated for the task.

### Unit 2.4: Embedding models

An embedding model turns an input into a list of numbers designed so certain relationships can be compared. The list is not a readable summary. The application decides how to store, compare, filter, authorize, and delete embeddings.

### Unit 2.5: Rerankers and retrieval systems

A retriever finds candidates. A reranker reorders candidates using a more detailed comparison. A generator may then write an answer. These are different jobs and may use different models.

### Unit 2.6: Language, code, vision, audio, and multimodal models

Define **modality** as a kind of input or output, such as text, image, audio, or video. A multimodal model handles more than one modality. The label does not specify every supported combination, size limit, or quality level.

### Unit 2.7: Base, instruction, chat, and reasoning-oriented models

- **Base model:** A checkpoint primarily prepared by broad pretraining.
- **Instruction-tuned model:** A model adapted to follow requests in a desired format.
- **Chat model:** A model and template prepared for role-based conversation.
- **Reasoning-oriented model:** A product or model intended to spend additional computation or intermediate work on some tasks.

The exact labels differ among publishers. The model card, configuration, prompt template, evaluation, and license are stronger evidence than a filename adjective.

Draft formative check: choose a model family for five harmless tasks and identify where ordinary code or a database is still needed.

## Working outline group 3: Files and parts around a model

Allocation: LM-103 for checkpoint lifecycle, LM-104 for parameters and tokenizers, and LM-106 for model access and artifact boundaries. Deeper repository, conversion, and runtime work moves to LM-300.

### Unit 3.1: Parameters and weights

A parameter is an adjustable numerical value inside a model. A weight is a common kind of parameter. `Eight billion parameters` describes a count, not file size, memory use, speed, context length, truthfulness, or task quality.

### Unit 3.2: Checkpoints

A checkpoint is a saved state from model preparation. It may contain model weights and sometimes training state. A checkpoint can be a collection of files rather than one file.

### Unit 3.3: Tokenizers and input processors

Text models need a tokenizer that maps text pieces to numeric identifiers. Image and audio models may need processors that resize, normalize, sample, or otherwise prepare input. The processor must match the model.

### Unit 3.4: Configuration and prompt templates

Configuration describes architecture and runtime details. A prompt or chat template arranges roles and control markers in the form expected by a model. A template mismatch can cause poor behavior even when the weight file loads successfully.

### Unit 3.5: Model cards, licenses, revisions, and checksums

The learner practices finding:

- publisher and repository;
- intended use;
- limitations;
- architecture;
- model or file revision;
- tokenizer;
- prompt template;
- license and use restrictions;
- evaluation notes;
- file size;
- checksum or trusted content identifier;
- conversion or quantization author.

`Open weights`, `open source`, and `free to download` are not treated as synonyms.

The learner checks code, weights, training data, documentation, trademark terms, acceptable-use terms, redistribution rights, and service terms separately. One open component does not make every component open, and access to weights does not prove that training code or training data is available.

### Unit 3.6: Formats and runtimes

Define:

- **format:** How model information is arranged in files;
- **runtime:** Software that loads the model and performs inference;
- **conversion:** Reading one supported representation and writing another;
- **adapter:** A smaller set of learned changes used with a compatible base model;
- **GGUF:** A model file format designed for GGML-based inference runtimes;
- **safetensors:** A tensor storage format commonly used with machine-learning frameworks.

The artifact comparison distinguishes a framework checkpoint, `safetensors` shards, GGUF files, adapters, tokenizer files, configuration, and prompt templates. Each artifact records its exact base, revision, compatibility, and license relationship.

Later LM-300 authoring compares one reviewed llama.cpp command-line lane, one reviewed Ollama-style manager lane, and one reviewed MLX lane where the platform supports it. These are replaceable tool-family examples, not permanent recommendations. Renaming a file does not convert its contents. A runtime supporting one model architecture or quant type does not prove it supports every file with the same extension.

Draft formative check: read a prepared repository card and assemble the complete artifact record without downloading a model.

## Working outline group 4: Local, hosted, cloud, and organization-managed use

Allocation: LM-106 for deployment shapes and custody. Detailed equivalent-output and provider comparison work remains deferred to Phase 26.

### Unit 4.1: Local describes location, not every boundary

For this packet, **local execution** means inference runs on a learner- or organization-controlled device inside the stated local-device or local-network boundary. An organization-controlled cloud deployment is recorded as a separate shape. No external inference provider receives the prompt unless the data-flow map explicitly shows that transfer. The application may still:

- download models or updates;
- check a license;
- send telemetry;
- expose a network port;
- load untrusted packages;
- store prompts in logs;
- allow other local users to read files;
- use cloud retrieval or tools.

Local operation can support offline use and direct control, but those outcomes must be verified.

### Unit 4.2: Hosted describes a service boundary

A **provider-hosted execution** crosses a network boundary to infrastructure operated by an external provider. A local runtime can also expose a service interface, so `service` alone does not mean provider-hosted.

The deployment-shape map distinguishes:

- a local desktop application;
- a local command-line runtime;
- an isolated offline runtime;
- a consumer chat product;
- a provider API;
- a managed enterprise or education service;
- a model deployed inside an organization's cloud account;
- a private service run by the organization on rented infrastructure;

These shapes can have different identity, retention, training-use, region, support, monitoring, deletion, and repair rules even when they use a related model family.

### Unit 4.3: Consumer and organization-managed products are not the same contract

**Organization-managed** describes governance: the organization controls identity, policy, contracts, and approved configuration. It does not identify the inference location. The underlying runtime may be provider-hosted, organization-operated in a cloud account, or operated on local infrastructure.

The learner compares only current official documentation and records:

- exact product and tier;
- who signed the agreement;
- whether inputs or outputs are used to improve models by default;
- retention and deletion behavior;
- stateful feature storage;
- identity and administrator controls;
- regional processing and storage;
- abuse monitoring and possible review;
- subprocessors;
- logging and audit options;
- effective date and review date.

The course never turns a provider statement into a universal promise covering another product or future date.

### Unit 4.4: Draw the data flow

For each option, draw:

```text
person
  -> interface
  -> identity and policy
  -> input preparation
  -> retrieval or tools, if any
  -> runtime and model
  -> output handling
  -> logs, storage, monitoring, and deletion
```

Label the owner, machine, network boundary, data category, retention, and unknowns at every step.

### Unit 4.5: Compare privacy and security

Local questions:

- Who can access the machine and model files?
- Is storage encrypted and backed up?
- Does the application contact the Internet?
- Is a service listening beyond loopback?
- Are model and package sources verified?
- Where are prompts, outputs, and logs stored?
- Who applies security updates?

Hosted questions:

- Which product and contract apply?
- Who can authenticate and authorize users?
- What is stored, where, and for how long?
- What monitoring or review can occur?
- Are keys, logs, and connected data sources protected?
- How are incidents, deletion, export, and service retirement handled?

### Unit 4.6: Compare cost, capacity, and maintenance

Local costs may include hardware, power, storage, cooling, setup, maintenance, backups, and operator time. Hosted costs may include subscription, request, token, storage, retrieval, network, support, and staff integration costs. Free tiers and sunk hardware costs are labeled rather than treated as zero.

### Unit 4.7: Compare quality, speed, reliability, and control

Use the same task set and rubric. Record model and service version, settings, context, latency, failures, rate limits, offline behavior, update policy, reproducibility, rollback, and repair owner.

Draft formative check: complete a data-flow and responsibility table for one local desktop tool and one organization-managed provider-hosted service.

## Deferred appendix A: Precision, quantization, and model fit

Canonical destination: LM-1000, except foundational token and context material that belongs in LM-104. These outlines do not count toward LM-100 completion.

### Unit 5.1: Computers store numbers in formats

Introduce bit, byte, integer, and floating-point number before the format names.

One byte contains eight bits. A representation with more bits can normally preserve more possible values or detail, but actual quality also depends on the format and how it is used.

### Unit 5.2: FP32, FP16, BF16, FP8, INT8, and INT4

Beginner reference:

| Label | Simple meaning | Approximate storage per value | Important context |
| --- | --- | ---: | --- |
| FP32 | 32-bit floating-point value | 4 bytes | Common high-precision reference, not always required for inference |
| FP16 | 16-bit floating-point value | 2 bytes | Smaller range behavior differs from BF16 |
| BF16 | 16-bit floating-point value with a wider exponent range | 2 bytes | Often used in modern training and inference where supported |
| FP8 | An 8-bit floating-point family | About 1 byte before metadata | Several FP8 formats exist; hardware and software support and intended use must be checked |
| INT8 | 8-bit integer value | 1 byte | Needs scales or other information to represent model values |
| INT4 | About 4 bits per quantized value | About 0.5 byte before metadata | Usually stored in blocks with scales and possible mixed precision |

Training precision, stored weight precision, computation precision, activation precision, and attention-cache precision can differ. A model described as `4-bit` may still use higher precision for some tensors or calculations.

### Unit 5.3: Quantization

Quantization represents model values with fewer bits or a different numerical scheme. It can reduce file size and memory use and may improve speed on compatible hardware. It can also change output quality, and the speed result depends on runtime and hardware support.

A quantized model is normally derived from an existing checkpoint. Quantization does not create a new training history or personality by itself.

### Unit 5.4: What people mean by a quant

In local-model communities, a `quant` commonly means one particular quantized build of a model. Two quants may differ by:

- quantization method;
- approximate bits per weight;
- treatment of important tensors;
- calibration or importance data;
- conversion tool and version;
- source checkpoint and revision;
- tokenizer or metadata;
- file sharding;
- runtime compatibility.

The learner checks the complete artifact record rather than selecting only by a short suffix.

### Unit 5.5: Read common GGUF quant names

Plain first reading:

- `Q4_0`: a four-bit-family GGML quantization recipe with its own block structure.
- `Q4_K_S`: a K-family recipe in the four-bit range. `S` distinguishes a particular tensor mix; it does not mean a small model.
- `Q4_K_M`: a K-family recipe in the four-bit range. `M` identifies a mixed-tensor recipe in llama.cpp-style naming; it does not mean medium model or medium quality.
- `Q5_K_M`: a K-family recipe in the five-bit range with its own mixed-tensor choice.
- `Q6_K`: a K-quant recipe in the six-bit family.
- `Q8_0`: an eight-bit-family recipe.
- `Q3_K_M`: a smaller K-family recipe in the three-bit range with mixed tensor choices.
- `Q2_K`: a very compressed K-family recipe in the two-bit range.

The number is a broad clue, not the exact average file bits, speed, memory, or quality. `S`, `M`, and other suffixes distinguish recipe-specific tensor choices. They are not universal quality grades or model-size classes. Exact tensor treatment, compatibility, and behavior must be checked against the converter and runtime version's primary documentation and source.

`Q4_K_M` does not mean `version 4`, `quality level 4`, `four billion parameters`, or `medium-size model`.

An **importance matrix** is optional measurement data that compatible quantization methods can use to estimate where quantization error matters more for a sampled workload. The source data, converter version, supported quant type, and whether an importance matrix was used belong in the artifact record. A quant filename alone does not prove that one was used.

### Unit 5.6: Rough weight-memory calculation

A simplified lower-bound estimate is:

```text
parameter count x stored bits per parameter / 8 = raw weight bytes
```

For a fictional 8-billion-parameter model:

| Simplified representation | Raw weight estimate |
| --- | ---: |
| 16 bits | about 16 GB |
| 8 bits | about 8 GB |
| 4 bits | about 4 GB |

This is not a promise that the model fits. The estimate leaves out or simplifies:

- file and block metadata;
- mixed tensor types;
- runtime buffers;
- context and attention cache;
- input and output length;
- batch and concurrency;
- model architecture details;
- graphics-driver or operating-system use;
- CPU and accelerator offload;
- memory fragmentation;
- application overhead.

The fit worksheet produces three separate values:

1. a raw-weight floor from parameter count and stored representation;
2. a planning range that adds stated runtime, context, cache, application, batch, concurrency, and safety headroom;
3. a measured correction from the exact supported learner-controlled lane or a clearly labeled L0 prepared trace.

CPU memory, accelerator memory, unified memory, partial offload, storage, and download size remain separate. The result is `worth preflighting`, `does not meet the declared floor`, or `not enough information`. It is never an unsupported `will run` promise. Only an active local lab measures the learner's machine.

### Unit 5.7: Context and cache also use memory

Longer context can increase attention-cache memory. Runtime, architecture, cache precision, number of layers, hidden dimensions, batch, and parallel requests affect the actual amount. `The weights fit` is therefore not the same as `the complete workload fits`.

### Unit 5.8: Choose a quant by evidence

Decision order:

1. confirm the exact base model and revision;
2. confirm the runtime supports the architecture and quant type;
3. define the task and quality rubric;
4. calculate a fit range;
5. preserve memory for context and the application;
6. verify artifact source and checksum;
7. run a small comparison;
8. record quality, speed, memory, and failures;
9. keep the previous working artifact for rollback.

Draft formative check: explain a `Q4_K_M` filename, calculate a rough weight floor, list four missing memory costs, and refuse to declare it the universal best quant.

## Working outline group 6 and deferred appendix B: Choose and verify a system

Allocation: ordinary-system choice and deployment decision belong in LM-106. The active local lab, live local-versus-hosted comparison, and design capstone remain deferred to LM-200, LM-300, and Phase 26.

### Unit 6.1: Start with the task

Record user, input, expected output, accuracy need, response time, volume, data sensitivity, offline need, budget, maintenance owner, failure consequence, and non-AI alternative.

### Unit 6.2: Consider simpler systems

Compare:

- a written procedure;
- ordinary code;
- a database query;
- keyword or structured search;
- a classifier or task-specific model;
- retrieval plus an interface;
- a local generative model;
- a hosted generative model;
- no automated system.

Rejecting an LLM can be the correct result.

### Unit 6.3: Build the comparison rubric

Required fields:

- task success;
- dangerous or misleading failure;
- unsupported claim rate;
- source use;
- privacy boundary;
- latency;
- capacity;
- direct and operating cost;
- setup and maintenance;
- offline behavior;
- export and replacement;
- accessibility;
- human review;
- fallback.

### Unit 6.4: Optional first local-model lab

The optional practical route is an L2 lab on a learner-controlled machine. A complete L0 reading route uses prepared logs, manifests, outputs, resource measurements, and cleanup evidence. The lab manifest supplies exact tested versions and a small reviewed model example at publication time. It includes:

1. reading-only alternative with prepared logs and outputs;
2. separate reviewed Windows-native, Windows Subsystem for Linux (WSL), Intel macOS, Apple Silicon macOS, and Linux lanes where supported, with unsupported combinations labeled rather than guessed;
3. exact tested operating-system, architecture, runtime, and tool versions for each supported lane;
4. learner-owned authorization boundary and a statement that no public or third-party target is involved;
5. stated files, processes, ports, network contacts, settings, and machine state that may and may not change;
6. CPU, accelerator, memory, storage, download, network, time, power, and possible cost preflight;
7. recovery point before the first change;
8. model card, license, revision, file, and checksum review;
9. runtime source, package source, dependency, and version review;
10. loopback bind, telemetry, and offline-test boundaries;
11. resource ceilings, expected results, and stop conditions for download, load, inference, temperature, memory pressure, disk use, and unexpected network contact;
12. one harmless offline inference task using synthetic text;
13. observed memory, latency, output, and network-state record;
14. troubleshooting by observed symptom without escalating privilege or changing several causes at once;
15. safe stop, rollback, removal, cache, process, port, and file verification;
16. minimal permitted evidence, prohibited private evidence, maintenance owner, and independent cleanup check.

The site never receives the prompt, output, model, hardware inventory, log, provider key, or full command history. An active L2 lane follows the estimate with a measured preflight on the learner-controlled machine. The L0 route compares the estimate with clearly labeled prepared measurements and never claims to inspect the learner's hardware.

### Unit 6.5: Fair local-versus-hosted comparison

Use the same harmless synthetic task set, repeated-trial plan, and scoring rubric. Do not claim the model versions are identical. Record model and service versions, settings, system instructions, tools, safety controls, context, latency, failures, resource or price evidence, update behavior, and reproducibility limits. Do not declare a winner without stated task requirements.

The hosted lane is optional and has a prepared-results route that requires no account, API key, payment, or network request. Before any learner chooses to make a provider request, show the exact product and tier, data sent, retention and training-use scope, likely cost, deletion limits, and consent choice. Send no private, personal, proprietary, or learner-course content. The site does not proxy the request or receive the prompt or output.

### Unit 6.6: Decision and review

Write:

- the selected system or decision not to deploy;
- the evidence supporting it;
- known unknowns;
- rejected options and why;
- data flow;
- security and privacy responsibilities;
- budget and capacity;
- failure and fallback;
- export or replacement plan;
- next review date.

The portability inventory records prompts, system instructions, test sets, learner-owned data, embeddings, indexes, adapters, interfaces, logs, configuration, model and provider versions, proprietary features, export formats, replacement tests, rollback, deletion, and rebuild requirements. It labels what can move directly, what needs conversion, what cannot be exported, and what must be rebuilt.

Draft formative check: compare three prepared system designs for one harmless task, select the simplest sufficient option or reject all three, and support the decision with task fit, data flow, cost, failure, maintenance, and review evidence.

## Deferred appendix C: Phase 26 design capstone

Scenario: a fictional 18-person community repair cooperative wants help searching equipment manuals and drafting repair summaries. Some manuals are public. Internal work orders contain names, contact information, and device details.

The learner compares at least three designs:

1. ordinary document search with no generative model;
2. a local model system;
3. an organization-managed provider-hosted model or API system.

The submission includes:

- a plain-language task statement;
- model-family choice or rejection;
- complete component map;
- data-flow maps;
- current provider and local-tool evidence;
- privacy and security comparison;
- rough local fit calculation;
- quant interpretation where applicable;
- equivalent evaluation set;
- cost and maintenance estimate;
- accessibility and human-review route;
- failure, fallback, export, and review plan;
- a section named `What I still do not know`.

The capstone can earn full credit by choosing search or a hosted service, by choosing local execution, or by recommending no deployment. The quality of the evidence and reasoning matters more than the product choice.

## Assessment rules

- The 6 draft formative checks are open A0 self-check notes with immediate answer-specific feedback, unlimited attempts, and no credential claim. They do not replace the six canonical LM-100 guided labs or define the final assessment count.
- The `Models From Zero` completion record can describe completed teaching and formative practice only. It does not claim applied or professional competence.
- The capstone teaching brief and rubric remain directly open. A learner can use them without entering a credential assessment.
- Any future model-comparison credential is a separate M406 release with server-owned assessment records, a public blueprint and rubric, human review for judgment-heavy work, appeal and privacy policies, and explicit versioning. This packet does not issue that credential.
- No hidden vocabulary.
- Every scored item names the skill it measures.
- `Not enough information` is available when evidence is genuinely incomplete.
- A learner may pause between sections without losing completed responses.
- Retakes change surface examples while preserving the same objective.
- The site does not use an LLM to grade the credential.
- A future credential requires deterministic knowledge checks and a published human-review rubric for the decision artifact.
- Private prompts, outputs, datasets, logs, model files, and hardware inventories are not uploaded.

## Content acceptance tests

Before publication:

- every published path, course, module, unit, guided-lab brief, assessment outline, rubric, and source note has a direct open route;
- a reviewer who has never run a model can explain every bold term;
- no instruction uses a term before its definition or context link;
- `local`, `cloud`, `hosted`, `organization-managed`, `open`, `model`, `training`, and `quant` are never used as self-explanatory safety or quality claims;
- every diagram has a complete text equivalent;
- every calculation shows units and omitted costs;
- every provider-specific claim has an official source, product scope, effective or review date, and freshness owner;
- every tool-specific instruction has an exact tested version and platform;
- every local lab has preflight, safe stop, cleanup, and reading-only routes;
- no model code, provider SDK, provider key, inference request, model artifact, or learner data enters the browser bundle;
- no unit, lab, assessment, or credential requires voice, microphone, camera, public profile, countdown, or streak;
- the page passes keyboard, screen-reader, reduced-motion, 200 percent zoom, narrow-screen, interruption-and-resume, and deliberate-error reviews;
- a real beginner can state what to do next and why without help from an unstated prerequisite.

## Publication source and review requirements

The reference shelf below is a starting point for authors. It is not a completed unit-level source register. Before publication, every current claim, named tool, provider example, model example, command, compatibility statement, and measurement has a record containing:

- source link and the exact claim it supports;
- source type, such as specification, upstream documentation, vendor statement, paper, benchmark, community report, or local test evidence;
- exact document, product, operating-system, tool, runtime, model, artifact, and configuration version or revision where relevant;
- publication or access date;
- platform, hardware, task, settings, and test conditions;
- license, attribution, and rights notes;
- known contradiction, uncertainty, or missing evidence;
- named review owner, `lastReviewedAt`, and `reviewDueAt`.

A named reviewer must open each required source and check the attached wording. A build date is not a review date. Vendor quality, cost, performance, security, and privacy statements stay labeled as vendor claims until the course has independent evidence for the stated task and conditions.

Minimum review cadence:

| Content type | Minimum review |
| --- | --- |
| Tool installation, interface, command, and runtime API | Every supported major release and at least every 3 months |
| Named model, repository, file, license, or resource measurement | Every 3 months and before a lab rebuild |
| Driver, accelerator, operating-system, and backend support | Every 3 months and after a declared platform release |
| Security and unsafe-loading guidance | Every 3 months and after a relevant advisory |
| Privacy, provider, or organization-managed data-flow example | Every 6 months and whenever terms or architecture change |
| Data, model, and software license explanation | Every 6 months and when authoritative terms change |
| Research paper and benchmark reproduction | Annually, with the environment preserved |
| Durable conceptual and historical unit | Annually for sources and broken links |
| Lab artifact | Monthly integrity and vulnerability check, plus a quarterly clean rebuild |

A named model can appear in a lab only as a version-pinned, replaceable teaching example with repository, revision, license, architecture, tokenizer, template, files, checksum, measurements, and a prepared no-download route. The course does not maintain a live best-model list.

An unsupported runtime, withdrawn model, changed license, broken artifact, missing checksum, unsafe dependency, or unverified platform claim fails the relevant lab release. Keep the affected teaching route open with a visible dated status and safe explanation. Remove unsafe active instructions until reviewed; do not turn the course into a locked or hidden card.

## Primary reference shelf

These references support author review. Course pages cite the exact source nearest the relevant claim and show a review date.

- [Hugging Face model cards](https://huggingface.co/docs/hub/main/model-cards)
- [Hugging Face repository licenses](https://huggingface.co/docs/hub/repositories-licenses)
- [Hugging Face quantization concepts](https://huggingface.co/docs/transformers/quantization/concept_guide)
- [Hugging Face Transformers quantization](https://huggingface.co/docs/transformers/main_classes/quantization)
- [Hugging Face safetensors documentation](https://huggingface.co/docs/safetensors/index)
- [GGUF format documentation at reviewed ggml commit `36da571`](https://github.com/ggml-org/ggml/blob/36da57138425487184aa1da2eee2cde155909c6f/docs/gguf.md)
- [llama.cpp quantization tool at reviewed commit `9723942`](https://github.com/ggml-org/llama.cpp/blob/9723942adc518b43c4b95dc4dce6906903eb5e09/tools/quantize/README.md)
- [llama.cpp quantization source options at reviewed commit `9723942`](https://github.com/ggml-org/llama.cpp/blob/9723942adc518b43c4b95dc4dce6906903eb5e09/tools/quantize/quantize.cpp)
- [NIST AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework)
- [NIST Generative AI Profile](https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence)
- [OpenAI business data privacy](https://openai.com/business-data/)
- [Microsoft Foundry model data, privacy, and security](https://learn.microsoft.com/en-us/azure/foundry/responsible-ai/openai/data-privacy)

The pinned repository commits above record the source state used for this 2026-08-30 authoring review. They are not permanent recommendations. Provider pages are examples of current product-specific claims, not endorsements and not permanent guarantees. Authors recheck them before every publication that relies on them.
