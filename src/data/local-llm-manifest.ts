// Metadata only: lesson prose stays behind the academy route's lazy import.
export const localLlmCourses = [
  ['LM-101', 'what-a-model-is', 'Local LLMs: what they do', 'Explain what runs on your computer, choose useful tasks, and recognize unreliable answers.'],
  ['LLM-102', 'choose-and-run-a-local-llm', 'Choose and run a local LLM', 'Read a model card, estimate memory, and plan a private first run.'],
  ['LLM-103', 'use-and-test-local-llms', 'Use and test local LLMs', 'Build repeatable writing, extraction, and coding workflows with checks.'],
  ['LLM-104', 'give-an-llm-your-documents', 'Give an LLM your documents', 'Choose context or document retrieval, then check whether answers use the evidence.'],
  ['LLM-105', 'train-open-weight-models', 'Train open-weight models', 'Choose a training method, prepare examples, and evaluate a small fine-tuning experiment.'],
  ['LLM-106', 'build-a-language-model', 'Build a language model from scratch', 'Follow the training loop, design a small experiment, and package a model honestly.'],
] as const

export const localLlmPreparation: Record<string, readonly [readonly string[], readonly string[]]> = {
  'LLM-102': [
    ['Disk storage keeps a model file when the machine is off. Working memory holds information while software is running. They are not interchangeable.', 'A runtime is the software that loads and uses a model. The runtime must support the model architecture and file format.', 'A gigabyte is roughly a billion bytes. Estimates of weight storage leave out other memory the runtime needs.'],
    ['Choose a model for a specific task and machine, not from its name alone.', 'This course connects a model card to permissions, compatibility, memory, and a small first-run plan.', 'You can complete the prepared sizing and setup exercises without installing anything.'],
  ],
  'LLM-103': [
    ['A prompt contains the instructions and input material supplied for a request. It does not normally update weights.', 'A baseline is a simple starting approach you compare changes against.', 'A tool is a separate operation an application can execute. A model suggesting an operation is not authorization to run it.'],
    ['A model that can produce text still needs a well-defined job and a checking method.', 'Start with inputs whose answers you can inspect. Then vary one setting or instruction at a time.', 'This course moves from a single prompt to a repeatable workflow with measured failures.'],
  ],
  'LLM-104': [
    ['Context is the information sent with a request. It can include a question and a document passage.', 'Retrieval means finding relevant stored information. It does not mean changing the language model weights.', 'A source reference identifies where a claim came from. Check the actual passage before accepting the claim.'],
    ['A language model does not automatically know the contents of your files.', 'For a short note, supplying its text may be enough. For a larger collection, search can select useful passages.', 'This course follows the evidence from document to answer, including what happens when evidence is absent or should not be accessible.'],
  ],
  'LLM-105': [
    ['Training adjusts numerical values from examples. Inference uses learned values to produce output.', 'A dataset is a collection of examples. A target is the answer or next token that an example asks the model to learn.', 'Validation examples help you make development choices. A final test remains separate from training and those choices.'],
    ['Adapt an existing model only when a simpler prompt or document-retrieval approach does not meet the measured need.', 'The experiment needs permissions, clean examples, a compatible training setup, resource limits, and a baseline.', 'This course teaches how to choose and evaluate the experiment. Reading it does not start a training job.'],
  ],
  'LLM-106': [
    ['A token ID is a number representing one piece of text. The tokenizer defines that representation.', 'Loss measures prediction error under a chosen objective. It is not an intelligence score.', 'A checkpoint stores a model state. From-scratch training starts without pretrained weights; adapting a checkpoint starts with them.'],
    ['A small from-scratch model can teach the training process without being a useful assistant.', 'The optional character-counting baseline needs no model download. A tiny transformer is a separate, more demanding neural-network experiment.', 'The goal is a controlled change you can explain, measured against held-out text, with honest limits on the resulting artifact.'],
  ],
}

// Existing first-course URLs stay valid. New lesson IDs separate this rewrite
// from credit earned on the retired generic classification exercises.
export const localLlmLessons = [
  ['LLM-101-U1', 'LM-101', 'LLM-101-M1', 'model-and-rule', 'What a local LLM actually does', 'Follow text through a language model without treating it as a search engine.'],
  ['LLM-101-U2', 'LM-101', 'LLM-101-M1', 'inputs-and-outputs', 'Tokens and the context window', 'Explain why a long conversation can lose earlier details.'],
  ['LLM-101-U3', 'LM-101', 'LLM-101-M1', 'parameters-are-adjusted-numbers', 'Weights, training, and using a model', 'Separate changing a model from giving it a prompt.'],
  ['LLM-101-U4', 'LM-101', 'LLM-101-M2', 'model-application-and-database', 'The model file and the app around it', 'Identify the weights, tokenizer, runtime, interface, and optional tools.'],
  ['LLM-101-U5', 'LM-101', 'LLM-101-M2', 'capability-and-failure', 'Useful jobs for a local LLM', 'Pick a bounded task with an answer you can check.'],
  ['LLM-101-U6', 'LM-101', 'LLM-101-M2', 'model-or-not', 'Local AI: reality versus fiction', 'Compare local and hosted use without assuming either is automatically better.'],
  ['LLM-102-U1', 'LLM-102', 'LLM-102-M1', 'read-a-model-card', 'Read a model card before downloading', 'Compare model types, permissions, formats, and intended uses.'],
  ['LLM-102-U2', 'LLM-102', 'LLM-102-M1', 'memory-and-quantization', 'Memory and quantization', 'Estimate weight storage and leave space for the rest of the work.'],
  ['LLM-102-U3', 'LLM-102', 'LLM-102-M1', 'plan-your-first-local-run', 'Your first local run', 'Prepare a small test, verify where it runs, and know how to stop.'],
  ['LLM-103-U1', 'LLM-103', 'LLM-103-M1', 'repeatable-prompts', 'Turn a task into a repeatable prompt', 'Give an input, an instruction, an output format, and a way to handle missing facts.'],
  ['LLM-103-U2', 'LLM-103', 'LLM-103-M1', 'tools-with-boundaries', 'Coding help and tools with boundaries', 'Use suggestions without granting uncontrolled access to your computer.'],
  ['LLM-103-U3', 'LLM-103', 'LLM-103-M1', 'test-before-you-trust', 'Test before you trust', 'Compare candidates on your own examples, time, and error tolerance.'],
  ['LLM-104-U1', 'LLM-104', 'LLM-104-M1', 'context-retrieval-or-training', 'Context, retrieval, or training?', 'Choose the simplest way to supply knowledge without confusing it with training.'],
  ['LLM-104-U2', 'LLM-104', 'LLM-104-M1', 'build-a-document-search', 'Build a document search', 'Trace a question through chunks, search, source text, and a grounded answer.'],
  ['LLM-104-U3', 'LLM-104', 'LLM-104-M1', 'test-document-answers', 'Test document answers and access', 'Handle missing, conflicting, private, and malicious source text.'],
  ['LLM-105-U1', 'LLM-105', 'LLM-105-M1', 'training-methods', 'The different ways models are trained', 'Distinguish pretraining, continued pretraining, supervised tuning, and preference training.'],
  ['LLM-105-U2', 'LLM-105', 'LLM-105-M1', 'prepare-training-data', 'Prepare examples without teaching the test', 'Clean, split, and document a small training dataset.'],
  ['LLM-105-U3', 'LLM-105', 'LLM-105-M1', 'lora-qlora-and-full-tuning', 'LoRA, QLoRA, and full fine-tuning', 'Plan a bounded adaptation experiment and judge it against the unchanged model.'],
  ['LLM-106-U1', 'LLM-106', 'LLM-106-M1', 'inside-the-training-loop', 'Inside the training loop', 'Follow token IDs, predictions, loss, gradients, and weight updates.'],
  ['LLM-106-U2', 'LLM-106', 'LLM-106-M1', 'train-a-tiny-language-model', 'Train a tiny language model', 'Design a from-scratch learning experiment without promising a useful assistant.'],
  ['LLM-106-U3', 'LLM-106', 'LLM-106-M1', 'package-and-improve-your-model', 'Package and improve your model', 'Keep the files, evaluation, permissions, and limits needed to build on your work.'],
] as const
