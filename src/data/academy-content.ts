import { academyUnitIds, type AcademyUnitId } from './academy-manifest'

export const academyContentObservedAt = '2026-08-31'
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

export interface AcademySourceRecord {
  id: string
  evidenceKind: 'reality-source'
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
  {
    id: 'source-nist-ai-rmf-airc',
    evidenceKind: 'reality-source',
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
    id: 'source-nist-sp-800-218',
    evidenceKind: 'reality-source',
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

const lmSourceIds = ['source-nist-ai-rmf-airc'] as const
const softwareSourceIds = ['source-nist-sp-800-218', 'source-python-errors-exceptions'] as const

const sharedScope = (requiredActions: number, activityType: AcademyUnitContent['scope']['activityType']) => ({
  estimatedTime: 'About 7 to 10 minutes',
  requiredActions,
  activityType,
  environment: 'browser-only prepared evidence',
  changes: 'No files, accounts, devices, networks, or services change.',
} as const)

const lm101Unit1: AcademyUnitContent = {
  unitId: 'LM-101-U1',
  anatomyKind: 'concept',
  anatomyOrder: academyAnatomyLabels,
  location: 'Models from zero > What a model is > Learned behavior > Unit 1 of 6',
  goal: 'Tell the difference between an ordinary written rule and a learned model.',
  purpose: 'This distinction helps you identify which part of a system was written directly and which part was adjusted from examples.',
  scope: sharedScope(2, 'reading-and-check'),
  access: openAccess,
  boundary: browserBoundary,
  preparation: sharedPreparation,
  words: [
    { term: 'Input', definition: 'Information given to a system.', example: 'A room temperature of 16 degrees Celsius can be an input.' },
    { term: 'Output', definition: 'Information returned by a system.', example: 'The words cold room can be an output.' },
    { term: 'Rule', definition: 'An instruction written directly by a programmer.', example: 'Return cold room when the temperature is below 18.' },
    { term: 'Example', definition: 'One observed input and result that shows a pattern.', example: 'A plant photograph paired with its verified species name is one example.' },
    { term: 'Model', definition: 'Numerical behavior adjusted from examples so it can transform an input into an output.', example: 'A plant photograph model can return possible species and scores.' },
    { term: 'Artificial intelligence (AI)', definition: 'A broad label for computer systems designed to perform tasks associated with reasoning, recognition, prediction, or language.', example: 'The label AI does not explain whether a particular feature uses rules, a model, stored records, or several parts together.' },
  ],
  example: {
    input: 'Prepared rule: when temperature is below 18 degrees Celsius, return cold room. Otherwise, return comfortable room.',
    question: 'For an input of 16 degrees Celsius, which part determines the output?',
  },
  prediction: 'Choose before reading the result: the written boundary of 18, a learned model, or not enough information.',
  preparedResult: 'The written boundary determines the result. A programmer supplied the exact rule, so this example does not require a learned model.',
  explanationSteps: [
    'The input is 16 degrees Celsius.',
    'The program compares 16 with the written boundary of 18.',
    'Because 16 is below 18, the program returns cold room.',
    'A learned model differs because adjustment from examples supplies part of the numerical behavior instead of a person writing every decision boundary.',
    'A system can combine ordinary rules and one or more models. The label AI does not tell you which parts it contains.',
  ],
  practice: {
    id: 'lm101-u1-practice',
    title: 'Classify a prepared system description',
    prompt: 'A file-renaming tool always replaces each space with an underscore. Classify the described behavior.',
    preparedEvidence: ['The replacement is stated exactly.', 'The description does not mention examples or adjusted numerical behavior.'],
    steps: ['Choose ordinary rule, learned model, or not enough information.', 'Compare your choice with the expected result.'],
    expectedResult: 'Ordinary rule. The programmer can state the exact replacement directly.',
    acceptableVariation: 'An answer that says no model is needed is also correct when it points to the exact written replacement.',
    recovery: 'If you chose learned model, find the exact transformation in the description. When the complete transformation is already written, classify this case as an ordinary rule.',
  },
  knowledgeCheck: {
    prompt: 'A website recommends a book, but the description does not explain how. What can you conclude?',
    choices: [
      { id: 'a', label: 'It must use a learned model.', correct: false, feedback: 'The result alone does not reveal the mechanism. Recommendations can use rules, records, models, or a mixture.' },
      { id: 'b', label: 'It must use one ordinary rule.', correct: false, feedback: 'The description does not show an exact rule. More than one design could produce the result.' },
      { id: 'c', label: 'There is not enough information.', correct: true, feedback: 'Correct. Ask for evidence about the mechanism before naming it.' },
    ],
    retry: 'Choose again. Look only at what the description proves, not what similar websites might use.',
  },
  recap: ['A rule is written directly.', 'A model is numerical behavior adjusted from examples.', 'A complete application may use both.'],
  notClaimed: ['Every complicated program uses a model.', 'Every model is a large language model.', 'Learned behavior is automatically correct or intelligent.'],
  stopResume: {
    savedFact: 'A model is learned numerical behavior that changes an input into an output.',
    returnQuestion: 'Was the important decision written directly, adjusted from examples, or not described?',
    nextChoice: 'Continue to Inputs and outputs, or stop here and return to this saved fact.',
  },
  sourceIds: lmSourceIds,
}

const lm101Unit2: AcademyUnitContent = {
  unitId: 'LM-101-U2',
  anatomyKind: 'concept',
  anatomyOrder: academyAnatomyLabels,
  location: 'Models from zero > What a model is > Learned behavior > Unit 2 of 6',
  goal: 'Identify the input and output in a prepared model example.',
  purpose: 'Clear input and output labels prevent a description from treating every part of an application as the model.',
  scope: sharedScope(2, 'reading-and-check'),
  access: openAccess,
  boundary: browserBoundary,
  preparation: sharedPreparation,
  words: [
    { term: 'Model', definition: 'Numerical behavior adjusted from examples so it can transform an input into an output.', example: 'A support-message model can return possible labels and scores.' },
    { term: 'Input', definition: 'Information supplied for one use of a system.', example: 'The text of a short support message can be an input.' },
    { term: 'Output', definition: 'Information the system returns for that input.', example: 'A label such as billing question can be an output.' },
    { term: 'Transform', definition: 'To receive one form of information and produce another form.', example: 'The model transforms message text into label scores.' },
    { term: 'Score', definition: 'A number that helps compare possible outputs.', example: 'Billing question may receive a higher score than account closure.' },
  ],
  example: {
    input: 'Prepared support message: I was charged twice for the same order. Prepared outputs: billing question, score 0.91; account closure, score 0.03.',
    question: 'Which text is the input, and which information is the output?',
  },
  prediction: 'Name the input and output before reading the prepared result.',
  preparedResult: 'The customer message is the input. The two labels and their scores are the output. The upload box and results panel would belong to the application around the model.',
  explanationSteps: [
    'The system begins with the message supplied for this example.',
    'The model transforms that message into numbers associated with possible labels.',
    'The returned labels and scores are outputs, not proof that the first label is correct.',
    'Application code can select a label, format the numbers, and show them to a person.',
    'Naming the boundary lets you ask what the model actually received and what it actually returned.',
  ],
  practice: {
    id: 'lm101-u2-practice',
    title: 'Trace one prepared input and output',
    prompt: 'A photograph sorter receives photo-27.jpg and returns oak 0.76 and maple 0.18. Identify the input and output.',
    preparedEvidence: ['The filename represents the supplied photograph.', 'The species labels and numbers are returned after the transformation.'],
    steps: ['Write or choose the input.', 'Write or choose the output.', 'Check that you did not include an interface part in either answer.'],
    expectedResult: 'Input: the photograph represented by photo-27.jpg. Output: oak 0.76 and maple 0.18.',
    acceptableVariation: 'Calling the returned numbers scores or estimates is acceptable. Do not call either score a verified fact.',
    recovery: 'If you included the upload button, remove it. The button helps the application collect the input but is not the input itself.',
  },
  knowledgeCheck: {
    prompt: 'A model returns spam 0.62 and not spam 0.38. What does the output contain?',
    choices: [
      { id: 'a', label: 'Two labels and two scores.', correct: true, feedback: 'Correct. The output reports alternatives and numbers used to compare them.' },
      { id: 'b', label: 'A guaranteed fact that the message is spam.', correct: false, feedback: 'A score is not a guarantee. The result still needs interpretation and an appropriate decision rule.' },
      { id: 'c', label: 'The complete email application.', correct: false, feedback: 'The output is information returned by one component, not the whole application.' },
    ],
    retry: 'Choose again. Separate returned information from certainty and from the surrounding application.',
  },
  recap: ['An input crosses into a model.', 'An output crosses back out.', 'Interface controls can prepare or display information without being the model.'],
  notClaimed: ['An output is guaranteed to be correct.', 'Every output must be text.', 'A model receives every piece of information that the application stores.'],
  stopResume: {
    savedFact: 'Input goes into the model boundary. Output comes back from that boundary.',
    returnQuestion: 'What exact information crossed into and out of the model?',
    nextChoice: 'Continue to Adjusted numbers, or stop here and return to this trace.',
  },
  sourceIds: lmSourceIds,
}

const lm101Unit3: AcademyUnitContent = {
  unitId: 'LM-101-U3',
  anatomyKind: 'concept',
  anatomyOrder: academyAnatomyLabels,
  location: 'Models from zero > What a model is > Learned behavior > Unit 3 of 6',
  goal: 'Explain that a parameter is an adjusted number inside a model.',
  purpose: 'This removes the mystery from the word parameter without pretending that one number explains a complete model.',
  scope: sharedScope(2, 'reading-and-check'),
  access: openAccess,
  boundary: browserBoundary,
  preparation: sharedPreparation,
  words: [
    { term: 'Model', definition: 'Numerical behavior adjusted from examples so it can transform an input into an output.', example: 'A deliberately small model can combine feature values with parameters.' },
    { term: 'Parameter', definition: 'A number inside a model whose value was adjusted while the model was prepared.', example: 'A small prepared example can use a parameter of 0.7 to give one input feature more influence.' },
    { term: 'Feature', definition: 'A measurable part of an input used by a model.', example: 'Message length can be one feature in a small text classifier.' },
    { term: 'Influence', definition: 'How much one part contributes to a result in the prepared example.', example: 'A larger parameter can give one feature more influence, depending on the calculation.' },
  ],
  example: {
    input: 'Prepared calculation: feature A is 2, its parameter is 0.7, feature B is 1, and its parameter is 0.2. Prepared result: 2 times 0.7 plus 1 times 0.2 equals 1.6.',
    question: 'Which numbers are parameters in this deliberately small example?',
  },
  prediction: 'Choose before reading the result: 2 and 1, 0.7 and 0.2, or 1.6 only.',
  preparedResult: 'The parameters are 0.7 and 0.2. The values 2 and 1 describe this input. The value 1.6 is the calculated result.',
  explanationSteps: [
    'The two feature values come from the prepared input.',
    'Each feature value is combined with its associated parameter.',
    'The products are added to produce the prepared result.',
    'Real models can contain many parameters and more complicated calculations.',
    'A parameter is still a number. The large count and complex arrangement do not turn it into a stored sentence or a person-like memory.',
  ],
  practice: {
    id: 'lm101-u3-practice',
    title: 'Label prepared numbers by role',
    prompt: 'Prepared calculation: input feature 3 times parameter 0.4 produces contribution 1.2. Label each number.',
    preparedEvidence: ['The feature describes this input.', 'The parameter belongs to the prepared model example.', 'The contribution is the result of the multiplication.'],
    steps: ['Label 3.', 'Label 0.4.', 'Label 1.2.'],
    expectedResult: '3 is the feature value, 0.4 is the parameter, and 1.2 is the contribution.',
    acceptableVariation: 'Input value is acceptable for feature value, and calculated result is acceptable for contribution.',
    recovery: 'If you labeled 3 as the parameter, look for the number that the prompt explicitly says belongs to the prepared model example.',
  },
  knowledgeCheck: {
    prompt: 'Which statement best describes a parameter?',
    choices: [
      { id: 'a', label: 'An adjusted number inside a model.', correct: true, feedback: 'Correct. A parameter is numerical, even when a model contains many of them.' },
      { id: 'b', label: 'A complete record copied from a database.', correct: false, feedback: 'A database record and a model parameter serve different roles. A parameter is a number used in model behavior.' },
      { id: 'c', label: 'A guarantee that the output is correct.', correct: false, feedback: 'Parameters help produce an output, but their presence does not guarantee correctness.' },
    ],
    retry: 'Choose again. Look for the answer that describes what the item is, not what someone hopes the model will do.',
  },
  recap: ['A parameter is an adjusted number.', 'Input values and parameters have different roles.', 'A calculated result is not itself proof of correctness.'],
  notClaimed: ['One prepared arithmetic example describes every model calculation.', 'A parameter stores a dependable database record.', 'More parameters always produce a better result.'],
  stopResume: {
    savedFact: 'A parameter is a number inside a model, not a hidden sentence or a person-like memory.',
    returnQuestion: 'Which numbers describe the input, and which numbers belong to the model?',
    nextChoice: 'Continue to Model, application, and database, or stop here.',
  },
  sourceIds: lmSourceIds,
}

const lm101Unit4: AcademyUnitContent = {
  unitId: 'LM-101-U4',
  anatomyKind: 'concept',
  anatomyOrder: academyAnatomyLabels,
  location: 'Models from zero > What a model is > Capability and limits > Unit 4 of 6',
  goal: 'Separate a model from the application, database, and search around it.',
  purpose: 'This helps you ask which component produced, stored, retrieved, or displayed each piece of information.',
  scope: sharedScope(2, 'reading-and-check'),
  access: openAccess,
  boundary: browserBoundary,
  preparation: sharedPreparation,
  words: [
    { term: 'Application', definition: 'Software that combines an interface and ordinary instructions to perform a task.', example: 'A support tool can collect a question, request a model output, and show a result.' },
    { term: 'Database', definition: 'A system that stores organized records so software can retrieve or change them.', example: 'A customer record can store an order number and delivery status.' },
    { term: 'Search', definition: 'A process that finds candidate records or documents that match a request.', example: 'A search can find a return-policy document before an answer is written.' },
    { term: 'Model', definition: 'Numerical behavior adjusted from examples that transforms an input into an output.', example: 'A model can produce wording from the question and prepared document text.' },
  ],
  example: {
    input: 'Prepared system trace: an application receives order 417; a database returns shipped Tuesday; the application gives that record to a model; the model returns a draft sentence; the application shows the sentence.',
    question: 'Which component stored the shipment record, and which component produced the draft wording?',
  },
  prediction: 'Name the database role and model role before reading the prepared result.',
  preparedResult: 'The database stored and returned the shipment record. The model produced the draft wording. The application moved information between the parts and displayed the result.',
  explanationSteps: [
    'The application receives the person’s request and decides what work to request.',
    'The database retrieves a specific stored record.',
    'The model receives prepared input that includes the question and record.',
    'The model returns draft wording rather than changing the stored order record.',
    'The application displays the draft and can apply ordinary checks or require review.',
    'A fluent sentence does not prove that a record exists. Evidence must remain tied to the retrieved record.',
  ],
  practice: {
    id: 'lm101-u4-practice',
    title: 'Assign each prepared action to a component',
    prompt: 'Classify three actions: stores a return date, finds the matching policy, writes a short draft explanation.',
    preparedEvidence: ['A stored date is an organized record.', 'Finding a matching policy is retrieval.', 'Draft wording is generated output in this example.'],
    steps: ['Assign database to one action.', 'Assign search to one action.', 'Assign model to one action.'],
    expectedResult: 'Database stores the return date. Search finds the policy. Model writes the draft explanation.',
    acceptableVariation: 'You may say the application asks each component to do its work. Keep the three component roles separate.',
    recovery: 'If you assigned storage to the model, return to the database definition. A model result is not a dependable record lookup by default.',
  },
  knowledgeCheck: {
    prompt: 'A fluent answer names an order date. What proves that the date exists in the customer record?',
    choices: [
      { id: 'a', label: 'The answer sounds confident.', correct: false, feedback: 'Confident wording is a presentation quality, not record evidence.' },
      { id: 'b', label: 'A traceable database record returned for the correct order.', correct: true, feedback: 'Correct. The stored record supplies evidence when the identity and retrieval are also correct.' },
      { id: 'c', label: 'The application contains a model.', correct: false, feedback: 'A model can produce wording without proving that a particular record exists.' },
    ],
    retry: 'Choose again. Look for evidence tied to the stored customer record.',
  },
  recap: ['Applications coordinate parts.', 'Databases store records.', 'Search retrieves candidates.', 'Models transform prepared inputs into outputs.'],
  notClaimed: ['Every application contains all four parts.', 'A model output is a reliable database record.', 'Search and a model are interchangeable.'],
  stopResume: {
    savedFact: 'Ask which component stored, retrieved, transformed, and displayed the information.',
    returnQuestion: 'Which component can supply traceable record evidence?',
    nextChoice: 'Continue to Capability and failure, or stop here.',
  },
  sourceIds: lmSourceIds,
}

const lm101Unit5: AcademyUnitContent = {
  unitId: 'LM-101-U5',
  anatomyKind: 'concept',
  anatomyOrder: academyAnatomyLabels,
  location: 'Models from zero > What a model is > Capability and limits > Unit 5 of 6',
  goal: 'Classify why a prepared model output could be wrong before choosing a response.',
  purpose: 'A useful repair begins with the actual failure boundary, not the automatic assumption that one larger component will solve every problem.',
  scope: sharedScope(2, 'reading-and-check'),
  access: openAccess,
  boundary: browserBoundary,
  preparation: sharedPreparation,
  words: [
    { term: 'Model', definition: 'Numerical behavior adjusted from examples so it can transform an input into an output.', example: 'A model can return draft wording for an application to review.' },
    { term: 'Application', definition: 'Software that combines an interface and ordinary instructions to perform a task.', example: 'An application can collect a request, prepare input, and display an output.' },
    { term: 'Capability', definition: 'A task a system can perform under stated conditions.', example: 'Sorting clear product photographs into five known groups can be one tested capability.' },
    { term: 'Failure', definition: 'A result that does not meet the stated need or condition.', example: 'Returning the wrong product group for a dark photograph is a failure.' },
    { term: 'Ambiguous', definition: 'Having more than one reasonable meaning.', example: 'The request make it lighter could refer to color, weight, or file size.' },
    { term: 'Missing information', definition: 'A needed fact that was not supplied to the system.', example: 'A delivery answer cannot use a destination date that the input does not contain.' },
  ],
  example: {
    input: 'Prepared request: Make the page lighter. Prepared output: the application reduces image file size. The person wanted a brighter background color.',
    question: 'Which failure description best fits: ambiguous request, missing record, or display problem?',
  },
  prediction: 'Choose one failure description before reading the result.',
  preparedResult: 'Ambiguous request fits best. The word lighter had more than one reasonable meaning, and the request did not select one.',
  explanationSteps: [
    'Begin with the stated need and the actual result.',
    'Check whether the input has one clear meaning and contains the needed information.',
    'Check whether the correct records or other prepared evidence reached the component that needed them.',
    'Check whether the application changed, filtered, or displayed the output incorrectly.',
    'State what is known and unknown before selecting a repair.',
    'A different component may help in one case, but size alone is not a universal explanation.',
  ],
  practice: {
    id: 'lm101-u5-practice',
    title: 'Classify a prepared failure',
    prompt: 'A delivery-answer system has the correct order number but receives no destination or carrier update. It returns a confident arrival date.',
    preparedEvidence: ['The order identity is present.', 'The facts needed to support an arrival date are absent.', 'The wording sounds confident, but no record supports the date.'],
    steps: ['Choose ambiguous request, missing information, or display problem.', 'Name one safe response.'],
    expectedResult: 'Missing information. A safe response states that the date cannot be supported and requests or retrieves the missing delivery facts.',
    acceptableVariation: 'Insufficient evidence is acceptable wording for missing information.',
    recovery: 'If you chose display problem, ask whether changing the screen would supply the missing delivery facts. It would not.',
  },
  knowledgeCheck: {
    prompt: 'What should happen before selecting a repair for a wrong output?',
    choices: [
      { id: 'a', label: 'Classify the likely failure boundary and state the evidence.', correct: true, feedback: 'Correct. The repair should address the observed cause and uncertainty.' },
      { id: 'b', label: 'Assume every wrong output needs a larger model.', correct: false, feedback: 'Size does not supply missing facts, clarify an ambiguous request, or repair application logic by itself.' },
      { id: 'c', label: 'Hide the result and record no evidence.', correct: false, feedback: 'That prevents review and does not explain or correct the failure.' },
    ],
    retry: 'Choose again. Select the action that preserves evidence and narrows the cause.',
  },
  recap: ['Capabilities need stated conditions.', 'Failures can begin in the input, evidence, model behavior, tools, application, or expected answer.', 'Classify before repairing.'],
  notClaimed: ['One cause explains every wrong output.', 'Fluent wording is evidence of correctness.', 'A larger model always fixes a failure.'],
  stopResume: {
    savedFact: 'A wrong output is a symptom. Find the boundary and missing evidence before choosing a repair.',
    returnQuestion: 'Was the request clear, were needed facts present, and did the application preserve the result correctly?',
    nextChoice: 'Continue to the Model or Not prepared lab, or stop here.',
  },
  sourceIds: lmSourceIds,
}

const lm101Lab: AcademyUnitContent = {
  unitId: 'LML-101',
  anatomyKind: 'prepared-lab',
  anatomyOrder: academyAnatomyLabels,
  location: 'Models from zero > What a model is > Capability and limits > Prepared lab 6 of 6',
  goal: 'Classify six prepared system descriptions and explain what the evidence supports.',
  purpose: 'This lab combines rule, model, application, database, search, input, output, and uncertainty without requiring any software operation.',
  scope: {
    estimatedTime: 'About 12 to 18 minutes',
    requiredActions: 7,
    activityType: 'prepared-classification-lab',
    environment: 'browser-only prepared evidence',
    changes: 'No files, accounts, devices, networks, or services change.',
  },
  access: openAccess,
  boundary: browserBoundary,
  preparation: sharedPreparation,
  words: [
    { term: 'Rule', definition: 'An instruction written directly by a programmer.', example: 'Always replace spaces with underscores is a rule.' },
    { term: 'Model', definition: 'Numerical behavior adjusted from examples so it can transform an input into an output.', example: 'A photo sorter adjusted from labeled examples can be a model.' },
    { term: 'Application', definition: 'Software that coordinates an interface, ordinary instructions, and any other parts needed for a task.', example: 'An application can pass prepared text to a model and display the result.' },
    { term: 'Database', definition: 'A system that stores organized records for later retrieval or change.', example: 'A database can return a customer record by order number.' },
    { term: 'Search', definition: 'A process that finds candidate records or documents that match a request.', example: 'Search can return three policy documents containing a phrase.' },
    { term: 'Classification', definition: 'Placing an item into a defined group using stated evidence.', example: 'A thermostat description can be classified as ordinary rule.' },
    { term: 'Evidence', definition: 'Information that supports a conclusion.', example: 'The sentence always replaces spaces with underscores supports an ordinary-rule classification.' },
    { term: 'Uncertainty', definition: 'A clear statement that the available evidence does not settle the answer.', example: 'Not enough information is the correct result when the mechanism is not described.' },
    { term: 'Concept map', definition: 'A small text or visual map showing how named parts connect.', example: 'Person to application to model to application to output is a concept map.' },
  ],
  example: {
    input: 'Worked item: a thermostat turns on below a temperature selected by the user.',
    question: 'Classify the mechanism and name the evidence.',
  },
  prediction: 'Choose ordinary rule, learned model, or not enough information.',
  preparedResult: 'Ordinary rule. The user supplies the exact boundary and the program follows it.',
  explanationSteps: [
    'Read only the supplied description.',
    'Underline an exact written transformation when one appears.',
    'Look for a statement that numerical behavior was adjusted from examples.',
    'Choose not enough information when neither mechanism is supported.',
    'Separate storage, search, interface, and display work from model work.',
    'Keep uncertainty instead of guessing from a product label.',
  ],
  practice: {
    id: 'lml-101-model-or-not',
    title: 'Model or Not',
    prompt: 'Classify all six prepared descriptions, then complete the small concept map.',
    preparedEvidence: [
      'A calculator returns 4 for 2 plus 2 by following arithmetic instructions.',
      'A photo sorter uses numerical behavior adjusted from labeled photographs.',
      'A store recommends a book, but the description gives no mechanism.',
      'A database returns the customer record with order number 417.',
      'A search finds three policy documents containing the requested phrase.',
      'An application gives prepared document text to a model and displays the returned draft.',
    ],
    steps: [
      'Classify item 1 as ordinary rule, learned model, or not enough information.',
      'Classify item 2 using the same three choices.',
      'Classify item 3 using the same three choices.',
      'Label item 4 as database retrieval rather than a model conclusion.',
      'Label item 5 as search rather than generated wording.',
      'For item 6, place application before and after model in the concept map.',
      'Compare all six responses with the prepared result.',
    ],
    expectedResult: '1 ordinary rule; 2 learned model; 3 not enough information; 4 database retrieval; 5 search; 6 person or request to application to model to application to displayed draft.',
    acceptableVariation: 'The concept map may put prepared document retrieval before the model. It must keep the application, model, and displayed output as separate parts.',
    recovery: 'If a classification differs, return to the exact sentence that describes the mechanism. If the sentence does not settle the mechanism, use not enough information. Restarting the page is unnecessary.',
  },
  knowledgeCheck: {
    prompt: 'Which lab response shows the strongest use of evidence?',
    choices: [
      { id: 'a', label: 'It sounds advanced, so it must use a model.', correct: false, feedback: 'A product’s appearance does not identify its mechanism.' },
      { id: 'b', label: 'The description states an exact replacement, so ordinary rule is supported.', correct: true, feedback: 'Correct. The conclusion points to evidence in the prepared description.' },
      { id: 'c', label: 'I have seen similar products, so the answer is certain.', correct: false, feedback: 'Similarity can suggest a question, but it does not replace evidence about this system.' },
    ],
    retry: 'Choose again. Pick the response that connects a conclusion to a supplied fact.',
  },
  recap: ['Use descriptions as evidence.', 'Keep system components separate.', 'Not enough information is a valid and useful conclusion.'],
  notClaimed: ['Completing this prepared lab proves professional competence.', 'A product name reveals its internal design.', 'The lab ran or evaluated any software or model.'],
  stopResume: {
    savedFact: 'Classify the mechanism only when the description supports it.',
    returnQuestion: 'What exact sentence supports each classification?',
    nextChoice: 'Review any unit in What a model is, or return to the open course outline.',
  },
  sourceIds: lmSourceIds,
}

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
  scope: sharedScope(2, 'reading-and-check'),
  access: openAccess,
  boundary: browserBoundary,
  preparation: sharedPreparation,
  beforeWeCompare: beforeWeCompare(
    'Explain which parts of a complete application can happen quickly and which claims still need evidence.',
    'The example covers a small browser application from a written need through a controlled release. It does not operate a real service.',
    'Sort prepared work records into prototype evidence and release evidence.',
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
    title: 'Prepared L0 release-evidence sort',
    prompt: 'Sort each prepared record into prototype evidence, release evidence, or evidence needed in both stages.',
    preparedEvidence: [
      'The form displayed once on the developer’s computer.',
      'The written requirement says customer addresses need authorized access.',
      'A test shows an unauthorized account cannot read an address in the reviewed build.',
      'The staging release has a named rollback version and a health check.',
      'A keyboard review found that every form field has a usable label.',
    ],
    steps: ['Sort all five records.', 'Compare the result with the expected result.'],
    expectedResult: 'Local display is prototype evidence. The written requirement is needed in both stages. The access test, rollback evidence, health check, and keyboard review support release readiness but still do not prove every production condition.',
    acceptableVariation: 'You may place the keyboard review in both when you explain that accessibility should begin before release. Do not treat one review as proof of every requirement.',
    recovery: 'If every item went into one group, ask what each record directly observed. Move records that describe only one environment or one requirement into the narrower group.',
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
    { label: 'Safe exercise or observation', paragraphs: ['Use the prepared L0 work records on this page. Sort what each record proves. Nothing is executed and no external service is contacted.'] },
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
  scope: sharedScope(2, 'reading-and-check'),
  access: openAccess,
  boundary: browserBoundary,
  preparation: sharedPreparation,
  beforeWeCompare: beforeWeCompare(
    'Explain what an editor view, parser result, program output, and test result each prove.',
    'The example uses prepared Python-like text and prepared messages. It does not execute Python or any other program.',
    'Match four prepared artifacts with the limited claim each one supports.',
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
    prompt: 'Match four artifacts with what each artifact supports.',
    preparedEvidence: [
      'Editor screenshot: words appear in several colors.',
      'Parser message: SyntaxError, problem detected near line 2.',
      'Execution output: Total: 12.',
      'Test result: expected 13, received 12, failed.',
    ],
    steps: ['Match editor display, syntax report, observed output, and requirement comparison.', 'Compare the matches with the expected result.'],
    expectedResult: 'The screenshot proves display only. The syntax report proves the parser detected invalid structure near a location. The output proves one execution returned 12. The failed test proves that result did not match the stated expectation of 13.',
    acceptableVariation: 'You may say the parser location is a starting point rather than the exact repair. Keep each claim no broader than its artifact.',
    recovery: 'If one artifact seems to prove everything, cover the other three and ask what can be observed from that one artifact alone. Then narrow the claim.',
  },
  knowledgeCheck: {
    prompt: 'A program finishes without an error message. What does that prove?',
    choices: [
      { id: 'a', label: 'That execution finished without a reported unhandled error in that run.', correct: true, feedback: 'Correct. This is useful evidence about one run, but it is not proof of every requirement.' },
      { id: 'b', label: 'That every requirement is met.', correct: false, feedback: 'A program can finish and still calculate the wrong result or miss a required case.' },
      { id: 'c', label: 'That the editor colors are correct.', correct: false, feedback: 'Execution and editor display are different concerns.' },
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
  lm101Unit1,
  lm101Unit2,
  lm101Unit3,
  lm101Unit4,
  lm101Unit5,
  lm101Lab,
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
    'source-nist-ai-rmf-airc',
    'source-nist-sp-800-218',
    'source-python-errors-exceptions',
  ]

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
    if (!/^https:\/\/(?:airc\.nist\.gov|csrc\.nist\.gov|docs\.python\.org)\//u.test(source.url)) {
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
    { label: 'out-of-scope advanced model topic', pattern: /\b(?:quantization|quantized|fine-tuning|model families|local model|hosted model)\b/iu },
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
