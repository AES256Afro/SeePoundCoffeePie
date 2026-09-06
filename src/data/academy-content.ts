import { makeLocalLlmContent } from './local-llm-lessons'
import { localLlmSources } from './local-llm-sources'
import { academyUnitIds, type AcademyUnitId } from './academy-manifest'

export const academyContentObservedAt = '2026-09-06'
export const academyContentReviewDueAt = '2027-02-28'

export const academyAnatomyLabels = [
  'Location',
  'Goal and purpose',
  'Scope',
  'Preparation choices',
  'Words on this page',
  'Concrete example',
  'Prediction',
  'Prepared result',
  'Step-by-step explanation',
  'Practice',
  'Expected result and recovery',
  'Feedback and retry',
  'Recap and limits',
  'Stop and resume',
] as const

export const realitySectionLabels = [
  'The claim or scene',
  'What is plausible',
  'What is exaggerated or missing',
  'The real underlying concept',
  'Safe exercise or observation',
  'Defensive or professional takeaway',
  'Short knowledge check',
] as const

export type AcademyAnatomyLabel = (typeof academyAnatomyLabels)[number]
export type RealitySectionLabel = (typeof realitySectionLabels)[number]

export type AcademyEvidenceLabel = 'documented' | 'supported-inference' | 'illustrative' | 'disputed' | 'outdated'

export interface AcademySourceRecord {
  id: string
  evidenceKind: 'reality-source'
  evidenceLabel: AcademyEvidenceLabel
  publisher: string
  title: string
  url: string
  version: string
  observedAt: typeof academyContentObservedAt
  reviewDueAt: typeof academyContentReviewDueAt
  supports: string
  scope: string
  limits: string
  rightsNotes: string
}

export interface AcademyWord {
  term: string
  definition: string
  example: string
}

export interface AcademyChoice {
  id: string
  label: string
  correct: boolean
  feedback: string
}

export interface AcademyKnowledgeCheck {
  prompt: string
  choices: readonly AcademyChoice[]
  retry: string
}

export interface AcademyPractice {
  id: string
  title: string
  prompt: string
  preparedEvidence: readonly string[]
  steps: readonly string[]
  expectedResult: string
  acceptableVariation: string
  recovery: string
}

export interface AcademyRealitySection {
  label: RealitySectionLabel
  paragraphs: readonly string[]
}

export interface AcademyClaimRecord {
  id: string
  claimType: 'original-scene'
  note: string
  observedAt: typeof academyContentObservedAt
  rightsNotes: string
}

export interface AcademyUnitContent {
  unitId: AcademyUnitId
  anatomyKind: 'concept' | 'prepared-lab' | 'reality-comparison'
  anatomyOrder: readonly AcademyAnatomyLabel[]
  location: string
  goal: string
  purpose: string
  scope: {
    estimatedTime: string
    requiredActions: number
    activityType: 'reading-and-check' | 'prepared-classification-lab'
    environment: 'browser-only prepared evidence'
    changes: 'No files, accounts, devices, networks, or services change.'
  }
  access: 'open'
  boundary: {
    riskClass: 'L0'
    statement: 'This page shows prepared text only. It does not run code, a model, inference, or training. Inference means using a model to produce an output. Training means adjusting a model from examples.'
    pageOperations: {
      code: false
      model: false
      inference: false
      training: false
      networkContact: false
      deviceChange: false
    }
  }
  preparation: {
    startNow: string
    refresher: string
    shortContext: string
  }
  words: readonly AcademyWord[]
  example: {
    input: string
    question: string
  }
  prediction: string
  preparedResult: string
  explanationSteps: readonly string[]
  practice: AcademyPractice
  knowledgeCheck: AcademyKnowledgeCheck
  recap: readonly string[]
  notClaimed: readonly string[]
  stopResume: {
    savedFact: string
    returnQuestion: string
    nextChoice: string
  }
  sourceIds: readonly string[]
  beforeWeCompare?: {
    outcome: string
    systemBoundary: string
    prepared: string
    learnerAction: string
    requirements: string
    choices: readonly ['Start now', 'Review a refresher', 'Read the short context']
  }
  realitySections?: readonly AcademyRealitySection[]
  claimRecord?: AcademyClaimRecord
}

const browserBoundary = {
  riskClass: 'L0',
  statement: 'This page shows prepared text only. It does not run code, a model, inference, or training. Inference means using a model to produce an output. Training means adjusting a model from examples.',
  pageOperations: {
    code: false,
    model: false,
    inference: false,
    training: false,
    networkContact: false,
    deviceChange: false,
  },
} as const

const openAccess = 'open' as const

const sharedPreparation = {
  startNow: 'Start now. Every fact needed for this activity appears on this page.',
  refresher: 'Review a refresher if you want a shorter explanation of the computer words first. The refresher is optional.',
  shortContext: 'Read the short context if you want to see how this idea fits the course. You can return here without losing your place.',
} as const

export const academySourceRecords: readonly AcademySourceRecord[] = Object.freeze([
  ...localLlmSources,
  {
    id: 'source-nist-ai-rmf-airc',
    evidenceKind: 'reality-source',
    evidenceLabel: 'documented',
    publisher: 'National Institute of Standards and Technology',
    title: 'Artificial Intelligence Risk Management Framework resource page',
    url: 'https://airc.nist.gov/airmf-resources/airmf/',
    version: 'Artificial Intelligence Risk Management Framework 1.0 resource view; revision noted as in progress',
    observedAt: academyContentObservedAt,
    reviewDueAt: academyContentReviewDueAt,
    supports: 'Artificial intelligence products and systems have a lifecycle, a context of use, people, processes, and risks beyond a model output.',
    scope: 'Durable introductory concepts about artificial intelligence systems, trustworthiness, context, and risk management.',
    limits: 'The framework does not define one universal model architecture, prove that a particular output is correct, or evaluate a named product on this page.',
    rightsNotes: 'Short original paraphrase of an official United States government source. No National Institute of Standards and Technology image or long quotation is reproduced.',
  },
  {
    id: 'source-nist-csrc-machine-learning',
    evidenceKind: 'reality-source',
    evidenceLabel: 'documented',
    publisher: 'National Institute of Standards and Technology',
    title: 'Computer Security Resource Center glossary: machine learning',
    url: 'https://csrc.nist.gov/glossary/term/machine_learning',
    version: 'Glossary entry citing NIST Special Publication 800-55 volume 1',
    observedAt: academyContentObservedAt,
    reviewDueAt: academyContentReviewDueAt,
    supports: 'Machine learning develops and uses computer systems that adapt and learn from data, which is the adjusted-from-examples behavior this course calls a model.',
    scope: 'A short official definition of machine learning used to anchor the course definition of learned numerical behavior.',
    limits: 'The glossary entry does not define parameters, describe any particular architecture, or evaluate a named product, and learning from data does not mean human understanding.',
    rightsNotes: 'Short original paraphrase of an official United States government glossary entry. No long quotation is reproduced.',
  },
  {
    id: 'source-nist-sp-800-218',
    evidenceKind: 'reality-source',
    evidenceLabel: 'documented',
    publisher: 'National Institute of Standards and Technology',
    title: 'Secure Software Development Framework version 1.1',
    url: 'https://csrc.nist.gov/pubs/sp/800/218/final',
    version: 'Secure Software Development Framework 1.1, official publication number SP 800-218, final, February 2022',
    observedAt: academyContentObservedAt,
    reviewDueAt: academyContentReviewDueAt,
    supports: 'Dependable software work includes security practices throughout development rather than relying on a single burst of typing or one final check.',
    scope: 'High-level secure software development practices and shared vocabulary for software producers and purchasers.',
    limits: 'The framework is not a time estimate, a complete product checklist, or proof that one specific application is secure.',
    rightsNotes: 'Short original paraphrase of an official United States government publication. No diagram or long quotation is reproduced.',
  },
  {
    id: 'source-python-errors-exceptions',
    evidenceKind: 'reality-source',
    evidenceLabel: 'documented',
    publisher: 'Python Software Foundation',
    title: 'Python tutorial: Errors and Exceptions',
    url: 'https://docs.python.org/3/tutorial/errors.html',
    version: 'Python 3 documentation observed with the 3.14.7 page heading',
    observedAt: academyContentObservedAt,
    reviewDueAt: academyContentReviewDueAt,
    supports: 'A syntax error reports where parsing noticed a problem, while an exception can occur when syntactically valid code executes.',
    scope: 'Prepared Python examples that distinguish parsing from execution and show how an error message narrows a repair.',
    limits: 'The tutorial does not prove that a program without an error message meets its requirements, passes tests, or is safe to release.',
    rightsNotes: 'Short original paraphrase of official Python documentation. No documentation example is copied into the lesson.',
  },
])

const softwareSourceIds = ['source-nist-sp-800-218', 'source-python-errors-exceptions'] as const

const sharedScope = (requiredActions: number, activityType: AcademyUnitContent['scope']['activityType']) => ({
  estimatedTime: 'About 7 to 10 minutes',
  requiredActions,
  activityType,
  environment: 'browser-only prepared evidence',
  changes: 'No files, accounts, devices, networks, or services change.',
} as const)

const comparisonScope = {
  ...sharedScope(2, 'reading-and-check'),
  estimatedTime: 'About 10 to 15 minutes',
} as const

function beforeWeCompare(outcome: string, systemBoundary: string, learnerAction: string) {
  return {
    outcome,
    systemBoundary,
    prepared: 'The page supplies an original scene, a short work record, and all evidence needed for the exercise.',
    learnerAction,
    requirements: 'L0 means a reading activity that uses only supplied evidence. No installation, account, terminal, model, network contact, or change on your device is needed.',
    choices: ['Start now', 'Review a refresher', 'Read the short context'],
  } as const
}

const rvf101: AcademyUnitContent = {
  unitId: 'RVF-101',
  anatomyKind: 'reality-comparison',
  anatomyOrder: academyAnatomyLabels,
  location: 'Reality versus fiction > Programming on screen and at work > Build and execution > Comparison 1 of 2',
  goal: 'Separate a fast prototype from a dependable released application.',
  purpose: 'The comparison gives you plain names for the work that happens around typing code.',
  scope: comparisonScope,
  access: openAccess,
  boundary: browserBoundary,
  preparation: sharedPreparation,
  beforeWeCompare: beforeWeCompare(
    'Explain which parts of a complete application can happen quickly and which claims still need evidence.',
    'The example covers a small browser application from a written need through a controlled release. It does not operate a real service.',
    'Put five prepared work-step cards in a sensible build order and name what each step proves.',
  ),
  words: [
    { term: 'Prototype', definition: 'An early version used to explore whether an idea can work.', example: 'A form that saves one sample record on one computer can be a prototype.' },
    { term: 'Requirement', definition: 'A written statement of a result or condition the software must meet.', example: 'Only an authorized staff member can read a customer address is a requirement.' },
    { term: 'Test', definition: 'A controlled check that compares observed behavior with an expected result.', example: 'A test can check that an empty name field produces a clear message.' },
    { term: 'Release', definition: 'A specific software version made available in a defined environment.', example: 'Version 1.0 placed on the production service is a release.' },
    { term: 'Rollback', definition: 'A planned way to return to a known earlier version when a release causes a problem.', example: 'Restore version 0.9 and verify the health page is one rollback plan.' },
  ],
  example: {
    input: 'Original scene: one developer types for six hours, does not run or review the work, and announces that a secure production application is complete.',
    question: 'Which result could the scene support, and which larger claims still need evidence?',
  },
  prediction: 'Choose one: useful prototype, verified production service, or neither result could ever happen.',
  preparedResult: 'A useful prototype is plausible. The scene does not support claims about correct requirements, security, tests, accessibility, deployment, monitoring, backup, or rollback.',
  explanationSteps: [
    'A focused developer can assemble a narrow first version quickly.',
    'A first version still needs a stated purpose and boundaries before reviewers can judge it.',
    'Running and observing the software supplies evidence that typing alone cannot provide.',
    'Tests, human review, security work, and accessibility checks examine different requirements.',
    'A controlled release needs identity, configuration, monitoring, ownership, and a repair or rollback path.',
    'Prototype, tested build, staging release, and production service are separate claims.',
  ],
  practice: {
    id: 'rvf-101-l0',
    title: 'Prepared L0 build-order cards',
    prompt: 'Put the five prepared work-step cards in a sensible build order, then name what each step proves.',
    preparedEvidence: [
      'Card A: A test and a human review examine the changed behavior against the written need.',
      'Card B: A written need names who is served and what must be true.',
      'Card C: A small first slice of the application displays on one computer.',
      'Card D: A controlled release places a named version where people can use it, with a rollback plan.',
      'Card E: The developer observes the running slice and records what worked and what failed.',
    ],
    steps: [
      'Put the five cards in a sensible build order.',
      'For each card, name what that step proves and what it cannot prove yet.',
      'Compare your order and reasons with the expected result.',
    ],
    expectedResult: 'B, C, E, A, D. The written need comes first because every later step is judged against it. A small slice makes the idea observable, observation supplies evidence typing cannot, a test and review examine the changed behavior, and a controlled release comes last because it depends on the earlier evidence and needs a rollback plan.',
    acceptableVariation: 'Observation, testing, and review can interleave in real work. An order that keeps the written need first and the controlled release last, with a stated reason, is acceptable.',
    recovery: 'If the release card came first, ask what evidence would exist on release day. Each earlier card supplies evidence the release decision needs. Reorder so every card can point at the evidence it depends on.',
  },
  knowledgeCheck: {
    prompt: 'A demo works on the developer’s computer. Which claim is supported?',
    choices: [
      { id: 'a', label: 'The demo ran in one environment.', correct: true, feedback: 'Correct. That observation is useful but narrow.' },
      { id: 'b', label: 'The application is secure and ready for every user.', correct: false, feedback: 'One local run does not test security, accessibility, deployment, scale, or recovery.' },
      { id: 'c', label: 'The application has a tested rollback.', correct: false, feedback: 'A rollback needs its own plan and evidence. The local demo does not provide it.' },
    ],
    retry: 'Choose again. Select only the claim directly supported by the observation.',
  },
  recap: ['Fast prototypes can be valuable.', 'A dependable release includes evidence around the code.', 'Name the exact result that is ready.'],
  notClaimed: ['A prototype has no value.', 'Every application needs the same process or team size.', 'Following one framework guarantees security.'],
  stopResume: {
    savedFact: 'A prototype, tested build, staging release, and production service are separate evidence claims.',
    returnQuestion: 'What result was actually observed, in which environment, and under which conditions?',
    nextChoice: 'Continue to Code works the first time, or stop here.',
  },
  sourceIds: softwareSourceIds,
  claimRecord: {
    id: 'rvf-101-original-scene',
    claimType: 'original-scene',
    note: 'Original composite scene based on a recurring programming shortcut. It is not copied from a named work.',
    observedAt: academyContentObservedAt,
    rightsNotes: 'Original paraphrased teaching scene with no third-party names, dialogue, image, costume, or branding.',
  },
  realitySections: [
    { label: 'The claim or scene', paragraphs: ['One uninterrupted burst of typing produces a secure production application. The work is announced as complete without a run, review, or release check.'] },
    { label: 'What is plausible', paragraphs: ['An experienced developer can build a narrow prototype quickly. Existing libraries and a small, known need can shorten the first working slice.'] },
    { label: 'What is exaggerated or missing', paragraphs: ['The scene omits requirements, data boundaries, execution, tests, review, accessibility, deployment identity, configuration, monitoring, backup, rollback, ownership, and maintenance.'] },
    { label: 'The real underlying concept', paragraphs: ['Useful software grows through evidence: written need, small design, first slice, observed behavior, tests and review, controlled release, monitoring, and repair. Each stage answers a different question.'] },
    { label: 'Safe exercise or observation', paragraphs: ['Use the prepared L0 work-step cards on this page. Put them in a sensible build order and name what each step proves. Nothing is executed and no external service is contacted.'] },
    { label: 'Defensive or professional takeaway', paragraphs: ['Ask what result is actually ready and what evidence supports that statement. Keep prototype, tested build, staging release, and production service separate.'] },
    { label: 'Short knowledge check', paragraphs: ['Choose the narrow statement supported by one local demo. Every choice gives a specific explanation and another attempt remains available.'] },
  ],
}

const rvf102: AcademyUnitContent = {
  unitId: 'RVF-102',
  anatomyKind: 'reality-comparison',
  anatomyOrder: academyAnatomyLabels,
  location: 'Reality versus fiction > Programming on screen and at work > Build and execution > Comparison 2 of 2',
  goal: 'Distinguish typing, parsing, execution, output, and requirement checks.',
  purpose: 'The comparison shows why code color or the absence of an error message is not the same as a correct result.',
  scope: comparisonScope,
  access: openAccess,
  boundary: browserBoundary,
  preparation: sharedPreparation,
  beforeWeCompare: beforeWeCompare(
    'Explain what an editor view, parser result, exception report, program output, and test result each prove.',
    'The example uses prepared Python-like text and prepared messages. It does not execute Python or any other program.',
    'Match five prepared artifacts with the limited claim each one supports.',
  ),
  words: [
    { term: 'Editor', definition: 'A tool used to read and change text, including source code.', example: 'An editor can color words without executing them.' },
    { term: 'Syntax', definition: 'The structural rules for writing valid statements in a programming language.', example: 'A missing colon can break Python statement syntax.' },
    { term: 'Parser', definition: 'Software that reads text according to a language’s syntax.', example: 'A parser can report where it noticed invalid structure.' },
    { term: 'Execution', definition: 'The act of a computer carrying out program instructions.', example: 'Execution can produce output or an exception.' },
    { term: 'Exception', definition: 'A reported problem that occurs while otherwise valid code is being executed.', example: 'Dividing a number by zero can cause an exception.' },
    { term: 'Requirement', definition: 'A written result or condition the program must meet.', example: 'The total must include tax is a requirement.' },
  ],
  example: {
    input: 'Prepared editor view: total = price + tax is colored. Prepared output: Total: 12. Prepared requirement: price 10 plus tax 3 must produce 13.',
    question: 'Does the colored editor view or completed execution prove that the requirement was met?',
  },
  prediction: 'Choose yes or no before reading the prepared result.',
  preparedResult: 'No. The editor color proves only how the editor displayed text. The output proves that an execution produced 12. The written requirement expects 13, so the observed result does not meet it.',
  explanationSteps: [
    'Typing creates or changes text.',
    'Editor coloring helps a person read but does not show that a parser accepted the text.',
    'A parser can report invalid syntax. The place it notices a problem may be after the place that needs repair.',
    'Syntactically valid code can still produce an exception during execution.',
    'Execution without an exception can still produce the wrong output.',
    'A test compares observed behavior with an expected requirement. One passing test supports only the condition it checked.',
  ],
  practice: {
    id: 'rvf-102-l0',
    title: 'Prepared L0 evidence ladder',
    prompt: 'Match five artifacts with what each artifact supports. One shows a syntax error, one shows a runtime exception, and one shows a logic error that produced no message at all.',
    preparedEvidence: [
      'Editor screenshot: words appear in several colors.',
      'Parser message: SyntaxError, problem detected near line 2.',
      'Exception report: ZeroDivisionError while line 4 divided by an amount of zero. Execution stopped there.',
      'Execution output: Total: 12.',
      'Test result: expected 13, received 12, failed.',
    ],
    steps: ['Match editor display, syntax report, exception report, observed output, and requirement comparison.', 'Name which artifact shows a syntax error, which shows a runtime exception, and which reveals a logic error.', 'Compare the matches with the expected result.'],
    expectedResult: 'The screenshot proves display only. The syntax report proves the parser detected invalid structure near a location before anything executed. The exception report proves execution began and then stopped at a reported operation: a runtime error in otherwise valid syntax. The output proves one execution finished and returned 12. The failed test reveals the logic error: the program ran without any message, yet the result did not match the stated expectation of 13.',
    acceptableVariation: 'You may say the parser location is a starting point rather than the exact repair, and you may call the exception a runtime error. Keep each claim no broader than its artifact.',
    recovery: 'If one artifact seems to prove everything, cover the other four and ask what can be observed from that one artifact alone. Then narrow the claim. If the exception and the syntax report seem the same, check which one required execution to begin.',
  },
  knowledgeCheck: {
    prompt: 'A program finishes without an error message. What does that prove?',
    choices: [
      { id: 'a', label: 'That execution finished without a reported unhandled error in that run.', correct: true, feedback: 'Correct. This is useful evidence about one run, but it is not proof of every requirement.' },
      { id: 'b', label: 'That every requirement is met.', correct: false, feedback: 'A program can finish and still calculate the wrong result or miss a required case.' },
      { id: 'c', label: 'That the editor colors are correct.', correct: false, feedback: 'Execution and editor display are different concerns.' },
      { id: 'd', label: 'Nothing at all, because a clean run is meaningless.', correct: false, feedback: 'Too strong in the other direction. One finished run is real, narrow evidence about that run. Careful claims are small, not empty.' },
    ],
    retry: 'Choose again. Select the narrow statement that describes only the observed run.',
  },
  recap: ['Display, parsing, execution, output, and tests are different evidence layers.', 'An error location is a place to inspect, not a complete repair.', 'Correctness is measured against stated requirements.'],
  notClaimed: ['Every error is a syntax error.', 'A parser always points at the exact character to change.', 'One passing test proves a complete application is correct.'],
  stopResume: {
    savedFact: 'Ask what each artifact directly proves: display, syntax, execution, output, or requirement comparison.',
    returnQuestion: 'Which evidence layer are you looking at now?',
    nextChoice: 'Review either comparison, or return to the open Reality versus fiction outline.',
  },
  sourceIds: softwareSourceIds,
  claimRecord: {
    id: 'rvf-102-original-scene',
    claimType: 'original-scene',
    note: 'Original composite scene about code appearing correct immediately. It is not copied from a named work.',
    observedAt: academyContentObservedAt,
    rightsNotes: 'Original paraphrased teaching scene with no third-party names, dialogue, image, costume, or branding.',
  },
  realitySections: [
    { label: 'The claim or scene', paragraphs: ['A developer types code while colored text appears. The first run shows no error message, so everyone treats the program as complete and correct.'] },
    { label: 'What is plausible', paragraphs: ['Small code can work on an early attempt. Familiar tools and a narrow requirement can reduce mistakes.'] },
    { label: 'What is exaggerated or missing', paragraphs: ['Color is editor display, not execution. No error message does not check the expected output, missing cases, security, accessibility, or the conditions of another environment.'] },
    { label: 'The real underlying concept', paragraphs: ['Typing, parsing, execution, output, and testing are separate evidence layers. A careful conclusion says which layer was observed and which questions remain open.'] },
    { label: 'Safe exercise or observation', paragraphs: ['Use the prepared L0 evidence ladder. Match each artifact with the claim it directly supports. The page runs no code.'] },
    { label: 'Defensive or professional takeaway', paragraphs: ['Preserve the error, output, test condition, environment, and attempted repair. State what the evidence supports before changing the program.'] },
    { label: 'Short knowledge check', paragraphs: ['Choose what one run without an error message proves. Each answer receives specific feedback and you can try again.'] },
  ],
}

export const academyUnitContent: readonly AcademyUnitContent[] = Object.freeze([
  ...makeLocalLlmContent({ anatomyOrder: academyAnatomyLabels, boundary: browserBoundary, preparation: sharedPreparation }),
  rvf101,
  rvf102,
])

const sourceById = new Map(academySourceRecords.map((source) => [source.id, source]))
const contentByUnitId = new Map(academyUnitContent.map((content) => [content.unitId, content]))

export function academyContentForUnit(unitId: AcademyUnitId): AcademyUnitContent {
  const content = contentByUnitId.get(unitId)
  if (!content) throw new Error(`Academy content is missing for unit ${unitId}.`)
  return content
}

export function academySourcesForUnit(unitId: AcademyUnitId): readonly AcademySourceRecord[] {
  return academyContentForUnit(unitId).sourceIds.map((sourceId) => {
    const source = sourceById.get(sourceId)
    if (!source) throw new Error(`Academy source ${sourceId} is missing for unit ${unitId}.`)
    return source
  })
}

function hasExactOrder<T>(actual: readonly T[], expected: readonly T[]): boolean {
  return actual.length === expected.length && actual.every((value, index) => value === expected[index])
}

function stringsFrom(value: unknown): string {
  return JSON.stringify(value)
}

function objectKeys(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(objectKeys)
  if (!value || typeof value !== 'object') return []
  return Object.entries(value).flatMap(([key, child]) => [key.toLowerCase(), ...objectKeys(child)])
}

export function academyContentValidationErrors(
  content: readonly AcademyUnitContent[] = academyUnitContent,
  sources: readonly AcademySourceRecord[] = academySourceRecords,
): string[] {
  const errors: string[] = []
  const unitIds = content.map((unit) => unit.unitId)
  const expectedIds = [...academyUnitIds]
  const sourceIds = sources.map((source) => source.id)
  const expectedSourceIds = [
    ...localLlmSources.map((source) => source.id),
    'source-nist-ai-rmf-airc',
    'source-nist-csrc-machine-learning',
    'source-nist-sp-800-218',
    'source-python-errors-exceptions',
  ]
  const allowedEvidenceLabels = new Set(['documented', 'supported-inference', 'illustrative', 'disputed', 'outdated'])

  const forbiddenRecordKeys = new Set([
    'prerequisite',
    'prerequisites',
    'lock',
    'locked',
    'profile',
    'learnerprofile',
    'learnertype',
    'diagnosis',
    'disability',
  ])
  if (objectKeys({ content, sources }).some((key) => forbiddenRecordKeys.has(key))) {
    errors.push('Academy content contains a learner-segmentation or access-gate field.')
  }

  if (!hasExactOrder(unitIds, expectedIds)) errors.push('Academy content must cover every manifest unit in manifest order.')
  if (new Set(unitIds).size !== unitIds.length) errors.push('Academy content contains duplicate unit IDs.')
  if (!hasExactOrder(sourceIds, expectedSourceIds)) errors.push('Academy content must retain the exact reviewed source register.')
  if (new Set(sourceIds).size !== sourceIds.length) errors.push('Academy content contains duplicate source IDs.')

  for (const source of sources) {
    if (source.observedAt !== academyContentObservedAt || source.reviewDueAt !== academyContentReviewDueAt) {
      errors.push(`Academy source ${source.id} has an invalid review date.`)
    }
    if (!allowedEvidenceLabels.has(source.evidenceLabel)) {
      errors.push(`Academy source ${source.id} has an invalid evidence label.`)
    }
    if (!/^https:\/\/(?:airc\.nist\.gov|csrc\.nist\.gov|docs\.python\.org|huggingface\.co|github\.com|docs\.ollama\.com|sbert\.net)\//u.test(source.url)) {
      errors.push(`Academy source ${source.id} is not an approved official source.`)
    }
    for (const field of ['version', 'supports', 'scope', 'limits', 'rightsNotes'] as const) {
      if (source[field].trim().length < 20) errors.push(`Academy source ${source.id} has an incomplete ${field} field.`)
    }
  }

  for (const unit of content) {
    if (!hasExactOrder(unit.anatomyOrder, academyAnatomyLabels)) {
      errors.push(`Academy unit ${unit.unitId} has an invalid anatomy order.`)
    }
    if (unit.access !== 'open') {
      errors.push(`Academy unit ${unit.unitId} must remain open.`)
    }
    if (
      unit.boundary.riskClass !== 'L0'
      || unit.scope.environment !== 'browser-only prepared evidence'
      || Object.values(unit.boundary.pageOperations).some(Boolean)
      || unit.boundary.statement !== browserBoundary.statement
    ) {
      errors.push(`Academy unit ${unit.unitId} must remain L0 browser-only prepared study.`)
    }
    if (
      unit.preparation.startNow.trim() === ''
      || unit.preparation.refresher.trim() === ''
      || unit.preparation.shortContext.trim() === ''
      || !unit.preparation.refresher.includes('optional')
    ) {
      errors.push(`Academy unit ${unit.unitId} has invalid optional preparation copy.`)
    }
    if (
      unit.words.length < 3
      || unit.explanationSteps.length < 4
      || unit.practice.steps.length < 2
      || unit.practice.expectedResult.trim() === ''
      || unit.practice.recovery.trim() === ''
      || unit.recap.length < 2
      || unit.notClaimed.length < 2
      || unit.stopResume.savedFact.trim() === ''
    ) {
      errors.push(`Academy unit ${unit.unitId} has incomplete required teaching anatomy.`)
    }
    if (
      unit.knowledgeCheck.choices.length < 2
      || unit.knowledgeCheck.choices.filter((choice) => choice.correct).length !== 1
      || unit.knowledgeCheck.choices.some((choice) => choice.feedback.trim().length < 12)
      || unit.knowledgeCheck.retry.trim() === ''
    ) {
      errors.push(`Academy unit ${unit.unitId} lacks immediate answer-specific feedback and retry.`)
    }
    if (unit.sourceIds.length === 0 || unit.sourceIds.some((sourceId) => !sourceIds.includes(sourceId))) {
      errors.push(`Academy unit ${unit.unitId} has a missing source record.`)
    }
    if (unit.sourceIds.length < 2) {
      errors.push(`Academy unit ${unit.unitId} needs at least two official source records.`)
    }

    if (unit.anatomyKind === 'reality-comparison') {
      if (
        !unit.beforeWeCompare
        || !unit.claimRecord
        || !unit.realitySections
        || !hasExactOrder(unit.realitySections.map((section) => section.label), realitySectionLabels)
        || unit.realitySections.some((section) => (
          section.paragraphs.length === 0
          || section.paragraphs.some((paragraph) => paragraph.trim() === '')
        ))
      ) {
        errors.push(`Reality comparison ${unit.unitId} is missing its canonical seven-section structure.`)
      }
      if (
        unit.beforeWeCompare
        && !hasExactOrder(unit.beforeWeCompare.choices, [
          'Start now',
          'Review a refresher',
          'Read the short context',
        ])
      ) {
        errors.push(`Reality comparison ${unit.unitId} has invalid preparation choices.`)
      }
      if (
        unit.claimRecord
        && (
          unit.claimRecord.observedAt !== academyContentObservedAt
          || unit.claimRecord.note.trim() === ''
          || unit.claimRecord.rightsNotes.trim() === ''
        )
      ) {
        errors.push(`Reality comparison ${unit.unitId} has an incomplete claim record.`)
      }
      if (unit.claimRecord && unit.sourceIds.includes(unit.claimRecord.id)) {
        errors.push(`Reality comparison ${unit.unitId} must separate claim and reality evidence.`)
      }
      if (unit.sourceIds.length < 2) {
        errors.push(`Reality comparison ${unit.unitId} needs at least two official reality sources.`)
      }
    } else if (unit.beforeWeCompare || unit.claimRecord || unit.realitySections) {
      errors.push(`Concept unit ${unit.unitId} must not contain reality-comparison records.`)
    }
  }

  const serialized = stringsFrom({ content, sources })
  const forbiddenPatterns = [
    { label: 'em dash', pattern: /\u2014/u },
    { label: 'diagnosis or learner-category language', pattern: /\b(?:ADHD|AuDHD|autis(?:m|tic)|diagnos(?:is|ed)|neurodivergent|learner category|medicalized path)\b/iu },
    { label: 'external runtime instruction', pattern: /\b(?:open|launch) (?:a |the )?(?:terminal|shell)|\b(?:install|download) (?:the |a )?(?:runtime|model|package)|\brun (?:this|the following) command|\benter (?:an |your )?(?:API key|password|credential)/iu },
  ]
  for (const forbidden of forbiddenPatterns) {
    if (forbidden.pattern.test(serialized)) errors.push(`Academy content contains forbidden ${forbidden.label}.`)
  }

  return errors
}

export function assertValidAcademyContent(
  content: readonly AcademyUnitContent[] = academyUnitContent,
  sources: readonly AcademySourceRecord[] = academySourceRecords,
): void {
  const errors = academyContentValidationErrors(content, sources)
  if (errors.length > 0) throw new Error(errors.join('\n'))
}

assertValidAcademyContent()
