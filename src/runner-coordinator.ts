import { getSandbox, Sandbox } from '@cloudflare/sandbox'
import type { LanguageId } from './types'
import {
  aggregateRunnerDurationMs,
  evaluateProjectRunnerAssignment,
  evaluateRunnerAssignment,
  findRunnerAssignment,
  runnerInputCases,
  type CsharpAnalysis,
  type CsharpArrayFact,
  type CsharpCallFact,
  type CsharpConditionalFact,
  type CsharpForeachFact,
  type CsharpInputFact,
  type CsharpInterpolationFact,
  type CsharpLocalFunctionFact,
  type CsharpParameterFact,
  type CsharpWriteFact,
  type CppAnalysis,
  type CppDeclarationFact,
  type JavaAnalysis,
  type JavaArrayFact,
  type JavaCallFact,
  type JavaConditionalFact,
  type JavaForeachFact,
  type JavaInputFact,
  type JavaMainFact,
  type JavaOutputFact,
  type JavaParameterFact,
  type JavaScannerFact,
  type JavaStaticMethodFact,
  type JavaWriteFact,
  type PythonAnalysis,
  type PythonAssignmentFact,
} from './lib/runner-assignments'
import {
  RUNNER_API_VERSION,
  type RunnerPending,
  type RunnerPurpose,
  type RunnerRequest,
  type RunnerResult,
  validateRunnerRequest,
} from './lib/runner-contract'
import { explainRunnerResult, sanitizeRunnerOutput } from './lib/runner-diagnostics'
import { isRunnerRecordStale, shouldAdvanceDrainAlarm } from './lib/runner-queue-policy'

const RUN_RECORD_PREFIX = 'run:'
const RUN_OUTPUT_PREFIX = 'output:'
const RUN_ERROR_PREFIX = 'error:'
const QUEUE_KEY = 'queue'
const RESULT_TTL_MS = 15 * 60 * 1000
const QUEUE_LIMIT = 32
const CONCURRENT_LIMIT = 4
const USER_PENDING_LIMIT = 2
const RATE_WINDOW_MS = 60_000
const RATE_LIMITS = { global: 60, owner: 10, ip: 20 } as const
const POLL_AFTER_MS = 650
const SUPERVISOR_TIMEOUT_MS = 20_000
const DESTROY_TIMEOUT_MS = 8_000
const STALE_RUN_MS = 2 * 60_000
const textEncoder = new TextEncoder()

interface RunnerCoordinatorEnv {
  RUNNER_PYTHON: DurableObjectNamespace<RunnerPythonSandbox>
  RUNNER_CPP: DurableObjectNamespace<RunnerCppSandbox>
  RUNNER_CSHARP: DurableObjectNamespace<RunnerCsharpSandbox>
  RUNNER_JAVA: DurableObjectNamespace<RunnerJavaSandbox>
}

interface StoredQueuedRun {
  id: string
  ownerId: string
  ipHash: string
  exerciseId: string
  language: LanguageId
  source: string
  stdin: string
  purpose?: RunnerPurpose
  status: 'queued' | 'running'
  createdAt: number
  startedAt: number | null
  attempts: number
}

interface StoredCompletedRun {
  id: string
  ownerId: string
  exerciseId: string
  language: LanguageId
  status: 'complete'
  createdAt: number
  completedAt: number
  expiresAt: number
  result: Omit<RunnerResult, 'stdout' | 'stderr'>
}

type StoredRun = StoredQueuedRun | StoredCompletedRun

interface SubmitPayload {
  runId: string
  ownerId: string
  ipHash: string
  exerciseId: string
  request: RunnerRequest
}

interface SupervisorResult {
  outcome: RunnerResult['outcome']
  stdout: string
  stderr: string
  exit_code: number | null
  duration_ms: number
  truncated: boolean
  limit: string | null
  phase?: 'compile' | 'runtime'
  allocated_bytes?: number
  python_analysis?: PythonAnalysis
  cpp_analysis?: CppAnalysis
  csharp_analysis?: CsharpAnalysis
  java_analysis?: JavaAnalysis
}

function json(body: unknown, status = 200): Response {
  return Response.json(body, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}

function isSubmitPayload(value: unknown): value is SubmitPayload {
  if (!value || typeof value !== 'object') return false
  const payload = value as Partial<SubmitPayload>
  return typeof payload.runId === 'string'
    && /^[a-zA-Z0-9_-]{20,80}$/u.test(payload.runId)
    && typeof payload.ownerId === 'string'
    && payload.ownerId.length >= 16
    && typeof payload.ipHash === 'string'
    && payload.ipHash.length >= 16
    && typeof payload.exerciseId === 'string'
    && Boolean(payload.request)
    && typeof payload.request?.source === 'string'
    && typeof payload.request?.stdin !== 'number'
}

function isBoundedAnalysisName(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= 128
}

function isPositiveBoundedInteger(value: unknown, maximum: number): value is number {
  return Number.isInteger(value) && Number(value) >= 1 && Number(value) <= maximum
}

function hasExactKeys(value: object, expectedKeys: readonly string[]): boolean {
  const keys = Object.keys(value)
  return keys.length === expectedKeys.length
    && expectedKeys.every((key) => Object.prototype.hasOwnProperty.call(value, key))
}

function isPythonAssignmentFact(value: unknown): value is PythonAssignmentFact {
  if (!value || typeof value !== 'object') return false
  const fact = value as Partial<PythonAssignmentFact>
  if (
    !isBoundedAnalysisName(fact.target)
    || !isPositiveBoundedInteger(fact.occurrence, 64)
    || !['integer', 'string', 'name', 'input', 'int_name', 'multiply_names', 'unsupported'].includes(fact.kind ?? '')
  ) return false

  switch (fact.kind) {
    case 'integer':
      return Number.isSafeInteger(fact.value)
    case 'name':
    case 'int_name':
      return isBoundedAnalysisName(fact.name)
    case 'multiply_names':
      return Array.isArray(fact.names)
        && fact.names.length === 2
        && fact.names.every(isBoundedAnalysisName)
        && fact.names[0] <= fact.names[1]
    case 'string':
    case 'input':
    case 'unsupported':
      return true
    default:
      return false
  }
}

function parsePythonAnalysis(value: unknown): PythonAnalysis | null {
  if (!value || typeof value !== 'object') return null
  const analysis = value as Partial<PythonAnalysis>
  if (
    analysis.version !== 1
    || typeof analysis.parsed !== 'boolean'
    || typeof analysis.straight_line !== 'boolean'
    || !Array.isArray(analysis.assignments)
    || analysis.assignments.length > 64
    || !analysis.assignments.every(isPythonAssignmentFact)
    || !Array.isArray(analysis.print_fstrings)
    || analysis.print_fstrings.length > 32
  ) return null

  if (!analysis.parsed && (
    analysis.straight_line
    || analysis.assignments.length > 0
    || analysis.print_fstrings.length > 0
  )) return null

  const targetOccurrences = new Map<string, number>()
  for (const fact of analysis.assignments) {
    const expectedOccurrence = (targetOccurrences.get(fact.target) ?? 0) + 1
    if (fact.occurrence !== expectedOccurrence) return null
    targetOccurrences.set(fact.target, expectedOccurrence)
  }

  for (const [index, fact] of analysis.print_fstrings.entries()) {
    if (
      !fact
      || typeof fact !== 'object'
      || fact.occurrence !== index + 1
      || !Array.isArray(fact.fields)
      || fact.fields.length > 16
      || !fact.fields.every(isBoundedAnalysisName)
    ) return null
  }

  return analysis as PythonAnalysis
}

function isCppAnalysisName(value: unknown): value is string {
  return isBoundedAnalysisName(value) && /^[A-Za-z_][A-Za-z0-9_]*$/u.test(value)
}

function isCppDeclarationFact(value: unknown): value is CppDeclarationFact {
  if (!value || typeof value !== 'object') return false
  const fact = value as Partial<CppDeclarationFact>
  if (
    !isCppAnalysisName(fact.target)
    || !isPositiveBoundedInteger(fact.occurrence, 32)
    || !isPositiveBoundedInteger(fact.statement, Number.MAX_SAFE_INTEGER)
    || !['integer', 'string', 'multiply_names', 'unsupported'].includes(fact.kind ?? '')
  ) return false

  switch (fact.kind) {
    case 'integer':
      return hasExactKeys(value, ['target', 'occurrence', 'statement', 'kind', 'value'])
        && Number.isSafeInteger(fact.value)
    case 'multiply_names':
      return hasExactKeys(value, ['target', 'occurrence', 'statement', 'kind', 'names'])
        && Array.isArray(fact.names)
        && fact.names.length === 2
        && fact.names.every(isCppAnalysisName)
        && fact.names[0] <= fact.names[1]
    case 'string':
    case 'unsupported':
      return hasExactKeys(value, ['target', 'occurrence', 'statement', 'kind'])
    default:
      return false
  }
}

function parseCppAnalysis(value: unknown): CppAnalysis | null {
  if (!value || typeof value !== 'object') return null
  if (!hasExactKeys(value, [
    'version',
    'analyzed',
    'parsed',
    'straight_line',
    'headers',
    'main_signature',
    'returns_zero',
    'declarations',
    'inputs',
    'cout_chains',
  ])) return null
  const analysis = value as Partial<CppAnalysis>
  if (
    analysis.version !== 1
    || typeof analysis.analyzed !== 'boolean'
    || typeof analysis.parsed !== 'boolean'
    || typeof analysis.straight_line !== 'boolean'
    || !Array.isArray(analysis.headers)
    || analysis.headers.length > 2
    || !analysis.headers.every((header) => header === 'iostream' || header === 'string')
    || new Set(analysis.headers).size !== analysis.headers.length
    || typeof analysis.main_signature !== 'boolean'
    || typeof analysis.returns_zero !== 'boolean'
    || !Array.isArray(analysis.declarations)
    || analysis.declarations.length > 32
    || !analysis.declarations.every(isCppDeclarationFact)
    || !Array.isArray(analysis.inputs)
    || analysis.inputs.length > 16
    || !Array.isArray(analysis.cout_chains)
    || analysis.cout_chains.length > 16
  ) return null

  const targetOccurrences = new Map<string, number>()
  for (const fact of analysis.declarations) {
    const expectedOccurrence = (targetOccurrences.get(fact.target) ?? 0) + 1
    if (fact.occurrence !== expectedOccurrence) return null
    targetOccurrences.set(fact.target, expectedOccurrence)
  }

  for (const [index, fact] of analysis.inputs.entries()) {
    if (
      !fact
      || typeof fact !== 'object'
      || !hasExactKeys(fact, ['occurrence', 'statement', 'kind', 'target'])
      || fact.occurrence !== index + 1
      || !isPositiveBoundedInteger(fact.statement, Number.MAX_SAFE_INTEGER)
      || !['getline_cin', 'cin_extract'].includes(fact.kind)
      || !isCppAnalysisName(fact.target)
    ) return null
  }

  for (const [index, fact] of analysis.cout_chains.entries()) {
    if (
      !fact
      || typeof fact !== 'object'
      || !hasExactKeys(fact, ['occurrence', 'statement', 'fields'])
      || fact.occurrence !== index + 1
      || !isPositiveBoundedInteger(fact.statement, Number.MAX_SAFE_INTEGER)
      || !Array.isArray(fact.fields)
      || fact.fields.length > 16
      || !fact.fields.every(isCppAnalysisName)
    ) return null
  }

  const identifierBudget = analysis.declarations.reduce((total, fact) => (
    total
      + fact.target.length
      + (fact.kind === 'multiply_names' ? fact.names[0].length + fact.names[1].length : 0)
  ), 0)
    + analysis.inputs.reduce((total, fact) => total + fact.target.length, 0)
    + analysis.cout_chains.reduce((total, fact) => (
      total + fact.fields.reduce((fieldTotal, field) => fieldTotal + field.length, 0)
    ), 0)
  if (identifierBudget > 4096) return null

  const hasFacts = analysis.headers.length > 0
    || analysis.main_signature
    || analysis.returns_zero
    || analysis.declarations.length > 0
    || analysis.inputs.length > 0
    || analysis.cout_chains.length > 0
  if (!analysis.analyzed && (analysis.parsed || analysis.straight_line || hasFacts)) return null
  if (!analysis.parsed && (analysis.straight_line || hasFacts)) return null
  if (analysis.straight_line && (!analysis.main_signature || !analysis.returns_zero)) return null

  const declarations = analysis.declarations.map((fact): CppDeclarationFact => {
    if (fact.kind === 'integer') {
      return {
        target: fact.target,
        occurrence: fact.occurrence,
        statement: fact.statement,
        kind: fact.kind,
        value: fact.value,
      }
    }
    if (fact.kind === 'multiply_names') {
      return {
        target: fact.target,
        occurrence: fact.occurrence,
        statement: fact.statement,
        kind: fact.kind,
        names: [fact.names[0], fact.names[1]],
      }
    }
    return {
      target: fact.target,
      occurrence: fact.occurrence,
      statement: fact.statement,
      kind: fact.kind,
    }
  })

  return {
    version: 1,
    analyzed: analysis.analyzed,
    parsed: analysis.parsed,
    straight_line: analysis.straight_line,
    headers: [...analysis.headers],
    main_signature: analysis.main_signature,
    returns_zero: analysis.returns_zero,
    declarations,
    inputs: analysis.inputs.map((fact) => ({
      occurrence: fact.occurrence,
      statement: fact.statement,
      kind: fact.kind,
      target: fact.target,
    })),
    cout_chains: analysis.cout_chains.map((fact) => ({
      occurrence: fact.occurrence,
      statement: fact.statement,
      fields: [...fact.fields],
    })),
  }
}

function isBoundedAnalysisText(value: unknown, maximum = 256): value is string {
  return typeof value === 'string' && value.length <= maximum
}

function isCsharpValueType(value: unknown): value is 'string' | 'int' {
  return value === 'string' || value === 'int'
}

function isCsharpReturnType(value: unknown): value is 'void' | 'string' | 'int' {
  return value === 'void' || isCsharpValueType(value)
}

function isCsharpInputKind(value: unknown): value is CsharpInputFact['kind'] {
  return value === 'read_line_coalesce_string'
    || value === 'int_parse_read_line_coalesce_string'
}

function parseCsharpInterpolation(value: unknown): CsharpInterpolationFact | null {
  if (!value || typeof value !== 'object' || !hasExactKeys(value, ['parts', 'fields'])) return null
  const interpolation = value as Partial<CsharpInterpolationFact>
  if (
    !Array.isArray(interpolation.parts)
    || interpolation.parts.length > 16
    || !interpolation.parts.every((part) => isBoundedAnalysisText(part))
    || !Array.isArray(interpolation.fields)
    || interpolation.fields.length > 16
    || !interpolation.fields.every(isCppAnalysisName)
    || interpolation.parts.length !== interpolation.fields.length + 1
  ) return null
  return { parts: [...interpolation.parts], fields: [...interpolation.fields] }
}

function parseCsharpParameter(value: unknown): CsharpParameterFact | null {
  if (!value || typeof value !== 'object' || !hasExactKeys(value, ['position', 'name', 'type'])) return null
  const parameter = value as Partial<CsharpParameterFact>
  if (
    !isPositiveBoundedInteger(parameter.position, 16)
    || !isCppAnalysisName(parameter.name)
    || !isCsharpValueType(parameter.type)
  ) return null
  return { position: parameter.position, name: parameter.name, type: parameter.type }
}

function parseCsharpLocalFunction(value: unknown): CsharpLocalFunctionFact | null {
  if (!value || typeof value !== 'object' || !hasExactKeys(value, [
    'occurrence',
    'statement',
    'name',
    'return_type',
    'parameters',
    'interpolation',
  ])) return null
  const fact = value as Partial<CsharpLocalFunctionFact>
  const parameters = Array.isArray(fact.parameters)
    ? fact.parameters.map(parseCsharpParameter)
    : []
  const interpolation = parseCsharpInterpolation(fact.interpolation)
  if (
    !isPositiveBoundedInteger(fact.occurrence, 16)
    || !isPositiveBoundedInteger(fact.statement, Number.MAX_SAFE_INTEGER)
    || !isCppAnalysisName(fact.name)
    || !isCsharpReturnType(fact.return_type)
    || !Array.isArray(fact.parameters)
    || fact.parameters.length > 8
    || parameters.some((parameter) => !parameter)
    || parameters.some((parameter, index) => parameter?.position !== index + 1)
    || !interpolation
  ) return null
  return {
    occurrence: fact.occurrence,
    statement: fact.statement,
    name: fact.name,
    return_type: fact.return_type,
    parameters: parameters as CsharpParameterFact[],
    interpolation,
  }
}

function parseCsharpArray(value: unknown): CsharpArrayFact | null {
  if (!value || typeof value !== 'object' || !hasExactKeys(value, [
    'occurrence', 'statement', 'target', 'element_type', 'values',
  ])) return null
  const fact = value as Partial<CsharpArrayFact>
  if (
    !isPositiveBoundedInteger(fact.occurrence, 16)
    || !isPositiveBoundedInteger(fact.statement, Number.MAX_SAFE_INTEGER)
    || !isCppAnalysisName(fact.target)
    || !isCsharpValueType(fact.element_type)
    || !Array.isArray(fact.values)
    || fact.values.length > 32
    || !fact.values.every((item) => isBoundedAnalysisText(item))
  ) return null
  return {
    occurrence: fact.occurrence,
    statement: fact.statement,
    target: fact.target,
    element_type: fact.element_type,
    values: [...fact.values],
  }
}

function parseCsharpInput(value: unknown): CsharpInputFact | null {
  if (!value || typeof value !== 'object' || !hasExactKeys(value, [
    'occurrence', 'statement', 'target', 'kind', 'fallback',
  ])) return null
  const fact = value as Partial<CsharpInputFact>
  if (
    !isPositiveBoundedInteger(fact.occurrence, 16)
    || !isPositiveBoundedInteger(fact.statement, Number.MAX_SAFE_INTEGER)
    || !isCppAnalysisName(fact.target)
    || !isCsharpInputKind(fact.kind)
    || !isBoundedAnalysisText(fact.fallback)
  ) return null
  return {
    occurrence: fact.occurrence,
    statement: fact.statement,
    target: fact.target,
    kind: fact.kind,
    fallback: fact.fallback,
  }
}

function parseCsharpWrite(value: unknown): CsharpWriteFact | null {
  if (!value || typeof value !== 'object' || !hasExactKeys(value, [
    'occurrence', 'statement', 'text',
  ])) return null
  const fact = value as Partial<CsharpWriteFact>
  if (
    !isPositiveBoundedInteger(fact.occurrence, 32)
    || !isPositiveBoundedInteger(fact.statement, Number.MAX_SAFE_INTEGER)
    || !isBoundedAnalysisText(fact.text, 512)
  ) return null
  return { occurrence: fact.occurrence, statement: fact.statement, text: fact.text }
}

function parseCsharpConditional(value: unknown): CsharpConditionalFact | null {
  if (!value || typeof value !== 'object' || !hasExactKeys(value, [
    'occurrence', 'statement', 'left', 'operator', 'right', 'when_true', 'when_false',
  ])) return null
  const fact = value as Partial<CsharpConditionalFact>
  if (
    !isPositiveBoundedInteger(fact.occurrence, 16)
    || !isPositiveBoundedInteger(fact.statement, Number.MAX_SAFE_INTEGER)
    || !isCppAnalysisName(fact.left)
    || fact.operator !== '>='
    || typeof fact.right !== 'number'
    || !Number.isSafeInteger(fact.right)
    || !isBoundedAnalysisText(fact.when_true, 512)
    || !isBoundedAnalysisText(fact.when_false, 512)
  ) return null
  return {
    occurrence: fact.occurrence,
    statement: fact.statement,
    left: fact.left,
    operator: '>=',
    right: fact.right,
    when_true: fact.when_true,
    when_false: fact.when_false,
  }
}

function parseCsharpForeach(value: unknown): CsharpForeachFact | null {
  if (!value || typeof value !== 'object' || !hasExactKeys(value, [
    'occurrence', 'statement', 'element_type', 'target', 'collection', 'interpolation',
  ])) return null
  const fact = value as Partial<CsharpForeachFact>
  const interpolation = parseCsharpInterpolation(fact.interpolation)
  if (
    !isPositiveBoundedInteger(fact.occurrence, 16)
    || !isPositiveBoundedInteger(fact.statement, Number.MAX_SAFE_INTEGER)
    || !isCsharpValueType(fact.element_type)
    || !isCppAnalysisName(fact.target)
    || !isCppAnalysisName(fact.collection)
    || !interpolation
  ) return null
  return {
    occurrence: fact.occurrence,
    statement: fact.statement,
    element_type: fact.element_type,
    target: fact.target,
    collection: fact.collection,
    interpolation,
  }
}

function parseCsharpCall(value: unknown): CsharpCallFact | null {
  if (!value || typeof value !== 'object' || !hasExactKeys(value, [
    'occurrence', 'statement', 'target', 'arguments',
  ])) return null
  const fact = value as Partial<CsharpCallFact>
  if (
    !isPositiveBoundedInteger(fact.occurrence, 16)
    || !isPositiveBoundedInteger(fact.statement, Number.MAX_SAFE_INTEGER)
    || !isCppAnalysisName(fact.target)
    || !Array.isArray(fact.arguments)
    || fact.arguments.length > 16
    || !fact.arguments.every(isCppAnalysisName)
  ) return null
  return {
    occurrence: fact.occurrence,
    statement: fact.statement,
    target: fact.target,
    arguments: [...fact.arguments],
  }
}

function parseCsharpAnalysis(value: unknown): CsharpAnalysis | null {
  if (!value || typeof value !== 'object' || !hasExactKeys(value, [
    'version',
    'analyzed',
    'parsed',
    'straight_line',
    'usings',
    'local_functions',
    'arrays',
    'inputs',
    'writes',
    'conditionals',
    'foreach_loops',
    'calls',
  ])) return null
  const analysis = value as Partial<CsharpAnalysis>
  const localFunctions = Array.isArray(analysis.local_functions)
    ? analysis.local_functions.map(parseCsharpLocalFunction)
    : []
  const arrays = Array.isArray(analysis.arrays) ? analysis.arrays.map(parseCsharpArray) : []
  const inputs = Array.isArray(analysis.inputs) ? analysis.inputs.map(parseCsharpInput) : []
  const writes = Array.isArray(analysis.writes) ? analysis.writes.map(parseCsharpWrite) : []
  const conditionals = Array.isArray(analysis.conditionals)
    ? analysis.conditionals.map(parseCsharpConditional)
    : []
  const foreachLoops = Array.isArray(analysis.foreach_loops)
    ? analysis.foreach_loops.map(parseCsharpForeach)
    : []
  const calls = Array.isArray(analysis.calls) ? analysis.calls.map(parseCsharpCall) : []
  if (
    analysis.version !== 1
    || typeof analysis.analyzed !== 'boolean'
    || typeof analysis.parsed !== 'boolean'
    || typeof analysis.straight_line !== 'boolean'
    || !Array.isArray(analysis.usings)
    || analysis.usings.length > 8
    || !analysis.usings.every((usingName) => usingName === 'System')
    || new Set(analysis.usings).size !== analysis.usings.length
    || !Array.isArray(analysis.local_functions)
    || analysis.local_functions.length > 8
    || localFunctions.some((fact) => !fact)
    || !Array.isArray(analysis.arrays)
    || analysis.arrays.length > 16
    || arrays.some((fact) => !fact)
    || !Array.isArray(analysis.inputs)
    || analysis.inputs.length > 16
    || inputs.some((fact) => !fact)
    || !Array.isArray(analysis.writes)
    || analysis.writes.length > 32
    || writes.some((fact) => !fact)
    || !Array.isArray(analysis.conditionals)
    || analysis.conditionals.length > 16
    || conditionals.some((fact) => !fact)
    || !Array.isArray(analysis.foreach_loops)
    || analysis.foreach_loops.length > 16
    || foreachLoops.some((fact) => !fact)
    || !Array.isArray(analysis.calls)
    || analysis.calls.length > 16
    || calls.some((fact) => !fact)
  ) return null

  for (const facts of [localFunctions, arrays, inputs, writes, conditionals, foreachLoops, calls]) {
    if (facts.some((fact, index) => fact?.occurrence !== index + 1)) return null
  }

  const allFacts = [localFunctions, arrays, inputs, writes, conditionals, foreachLoops, calls]
  const hasFacts = analysis.usings.length > 0 || allFacts.some((facts) => facts.length > 0)
  if (!analysis.analyzed && (analysis.parsed || analysis.straight_line || hasFacts)) return null
  if (!analysis.parsed && (analysis.straight_line || hasFacts)) return null

  const textBudget = JSON.stringify(value).length
  if (textBudget > 32_768) return null

  return {
    version: 1,
    analyzed: analysis.analyzed,
    parsed: analysis.parsed,
    straight_line: analysis.straight_line,
    usings: [...analysis.usings],
    local_functions: localFunctions as CsharpLocalFunctionFact[],
    arrays: arrays as CsharpArrayFact[],
    inputs: inputs as CsharpInputFact[],
    writes: writes as CsharpWriteFact[],
    conditionals: conditionals as CsharpConditionalFact[],
    foreach_loops: foreachLoops as CsharpForeachFact[],
    calls: calls as CsharpCallFact[],
  }
}

function isJavaValueType(value: unknown): value is 'String' | 'int' {
  return value === 'String' || value === 'int'
}

function parseJavaOutput(value: unknown): JavaOutputFact | null {
  if (!value || typeof value !== 'object' || !hasExactKeys(value, ['parts', 'fields'])) return null
  const output = value as Partial<JavaOutputFact>
  if (
    !Array.isArray(output.parts)
    || output.parts.length > 16
    || !output.parts.every((part) => isBoundedAnalysisText(part))
    || !Array.isArray(output.fields)
    || output.fields.length > 16
    || !output.fields.every(isCppAnalysisName)
    || output.parts.length !== output.fields.length + 1
  ) return null
  return { parts: [...output.parts], fields: [...output.fields] }
}

function parseJavaParameter(value: unknown): JavaParameterFact | null {
  if (!value || typeof value !== 'object' || !hasExactKeys(value, ['position', 'name', 'type'])) return null
  const parameter = value as Partial<JavaParameterFact>
  if (
    !isPositiveBoundedInteger(parameter.position, 8)
    || !isCppAnalysisName(parameter.name)
    || !isJavaValueType(parameter.type)
  ) return null
  return { position: parameter.position, name: parameter.name, type: parameter.type }
}

function parseJavaMain(value: unknown): JavaMainFact | null {
  if (!value || typeof value !== 'object' || !hasExactKeys(value, ['occurrence', 'member'])) return null
  const fact = value as Partial<JavaMainFact>
  if (
    !isPositiveBoundedInteger(fact.occurrence, 4)
    || !isPositiveBoundedInteger(fact.member, 8)
  ) return null
  return { occurrence: fact.occurrence, member: fact.member }
}

function parseJavaStaticMethod(value: unknown): JavaStaticMethodFact | null {
  if (!value || typeof value !== 'object' || !hasExactKeys(value, [
    'occurrence', 'member', 'name', 'return_type', 'parameters', 'output',
  ])) return null
  const fact = value as Partial<JavaStaticMethodFact>
  const parameters = Array.isArray(fact.parameters) ? fact.parameters.map(parseJavaParameter) : []
  const output = parseJavaOutput(fact.output)
  if (
    !isPositiveBoundedInteger(fact.occurrence, 8)
    || !isPositiveBoundedInteger(fact.member, 8)
    || !isCppAnalysisName(fact.name)
    || fact.return_type !== 'void'
    || !Array.isArray(fact.parameters)
    || fact.parameters.length > 8
    || parameters.some((parameter) => !parameter)
    || parameters.some((parameter, index) => parameter?.position !== index + 1)
    || !output
  ) return null
  return {
    occurrence: fact.occurrence,
    member: fact.member,
    name: fact.name,
    return_type: 'void',
    parameters: parameters as JavaParameterFact[],
    output,
  }
}

function parseJavaScanner(value: unknown): JavaScannerFact | null {
  if (!value || typeof value !== 'object' || !hasExactKeys(value, [
    'occurrence', 'statement', 'target', 'kind',
  ])) return null
  const fact = value as Partial<JavaScannerFact>
  if (
    !isPositiveBoundedInteger(fact.occurrence, 8)
    || !isPositiveBoundedInteger(fact.statement, Number.MAX_SAFE_INTEGER)
    || !isCppAnalysisName(fact.target)
    || fact.kind !== 'scanner_system_in'
  ) return null
  return {
    occurrence: fact.occurrence,
    statement: fact.statement,
    target: fact.target,
    kind: 'scanner_system_in',
  }
}

function parseJavaArray(value: unknown): JavaArrayFact | null {
  if (!value || typeof value !== 'object' || !hasExactKeys(value, [
    'occurrence', 'statement', 'target', 'element_type', 'values',
  ])) return null
  const fact = value as Partial<JavaArrayFact>
  if (
    !isPositiveBoundedInteger(fact.occurrence, 16)
    || !isPositiveBoundedInteger(fact.statement, Number.MAX_SAFE_INTEGER)
    || !isCppAnalysisName(fact.target)
    || !isJavaValueType(fact.element_type)
    || !Array.isArray(fact.values)
    || fact.values.length > 32
    || !fact.values.every((item) => isBoundedAnalysisText(item))
  ) return null
  return {
    occurrence: fact.occurrence,
    statement: fact.statement,
    target: fact.target,
    element_type: fact.element_type,
    values: [...fact.values],
  }
}

function parseJavaInput(value: unknown): JavaInputFact | null {
  if (!value || typeof value !== 'object' || !hasExactKeys(value, [
    'occurrence', 'statement', 'target', 'kind', 'receiver',
  ])) return null
  const fact = value as Partial<JavaInputFact>
  if (
    !isPositiveBoundedInteger(fact.occurrence, 16)
    || !isPositiveBoundedInteger(fact.statement, Number.MAX_SAFE_INTEGER)
    || !isCppAnalysisName(fact.target)
    || (fact.kind !== 'scanner_next_line' && fact.kind !== 'integer_parse_scanner_next_line')
    || !isCppAnalysisName(fact.receiver)
  ) return null
  return {
    occurrence: fact.occurrence,
    statement: fact.statement,
    target: fact.target,
    kind: fact.kind,
    receiver: fact.receiver,
  }
}

function parseJavaWrite(value: unknown): JavaWriteFact | null {
  if (!value || typeof value !== 'object' || !hasExactKeys(value, [
    'occurrence', 'statement', 'text',
  ])) return null
  const fact = value as Partial<JavaWriteFact>
  if (
    !isPositiveBoundedInteger(fact.occurrence, 32)
    || !isPositiveBoundedInteger(fact.statement, Number.MAX_SAFE_INTEGER)
    || !isBoundedAnalysisText(fact.text, 512)
  ) return null
  return { occurrence: fact.occurrence, statement: fact.statement, text: fact.text }
}

function parseJavaConditional(value: unknown): JavaConditionalFact | null {
  if (!value || typeof value !== 'object' || !hasExactKeys(value, [
    'occurrence', 'statement', 'left', 'operator', 'right', 'when_true', 'when_false',
  ])) return null
  const fact = value as Partial<JavaConditionalFact>
  if (
    !isPositiveBoundedInteger(fact.occurrence, 16)
    || !isPositiveBoundedInteger(fact.statement, Number.MAX_SAFE_INTEGER)
    || !isCppAnalysisName(fact.left)
    || fact.operator !== '>='
    || !Number.isSafeInteger(fact.right)
    || !isBoundedAnalysisText(fact.when_true, 512)
    || !isBoundedAnalysisText(fact.when_false, 512)
  ) return null
  return {
    occurrence: fact.occurrence,
    statement: fact.statement,
    left: fact.left,
    operator: '>=',
    right: fact.right as number,
    when_true: fact.when_true,
    when_false: fact.when_false,
  }
}

function parseJavaForeach(value: unknown): JavaForeachFact | null {
  if (!value || typeof value !== 'object' || !hasExactKeys(value, [
    'occurrence', 'statement', 'element_type', 'target', 'collection', 'output',
  ])) return null
  const fact = value as Partial<JavaForeachFact>
  const output = parseJavaOutput(fact.output)
  if (
    !isPositiveBoundedInteger(fact.occurrence, 16)
    || !isPositiveBoundedInteger(fact.statement, Number.MAX_SAFE_INTEGER)
    || !isJavaValueType(fact.element_type)
    || !isCppAnalysisName(fact.target)
    || !isCppAnalysisName(fact.collection)
    || !output
  ) return null
  return {
    occurrence: fact.occurrence,
    statement: fact.statement,
    element_type: fact.element_type,
    target: fact.target,
    collection: fact.collection,
    output,
  }
}

function parseJavaCall(value: unknown): JavaCallFact | null {
  if (!value || typeof value !== 'object' || !hasExactKeys(value, [
    'occurrence', 'statement', 'target', 'arguments',
  ])) return null
  const fact = value as Partial<JavaCallFact>
  if (
    !isPositiveBoundedInteger(fact.occurrence, 16)
    || !isPositiveBoundedInteger(fact.statement, Number.MAX_SAFE_INTEGER)
    || !isCppAnalysisName(fact.target)
    || !Array.isArray(fact.arguments)
    || fact.arguments.length > 16
    || !fact.arguments.every(isCppAnalysisName)
  ) return null
  return {
    occurrence: fact.occurrence,
    statement: fact.statement,
    target: fact.target,
    arguments: [...fact.arguments],
  }
}

function parseJavaAnalysis(value: unknown): JavaAnalysis | null {
  if (!value || typeof value !== 'object' || !hasExactKeys(value, [
    'version',
    'analyzed',
    'parsed',
    'straight_line',
    'imports',
    'class_signature',
    'main_methods',
    'static_methods',
    'scanner_declarations',
    'arrays',
    'inputs',
    'writes',
    'conditionals',
    'foreach_loops',
    'calls',
  ])) return null
  const analysis = value as Partial<JavaAnalysis>
  const mainMethods = Array.isArray(analysis.main_methods) ? analysis.main_methods.map(parseJavaMain) : []
  const staticMethods = Array.isArray(analysis.static_methods)
    ? analysis.static_methods.map(parseJavaStaticMethod)
    : []
  const scanners = Array.isArray(analysis.scanner_declarations)
    ? analysis.scanner_declarations.map(parseJavaScanner)
    : []
  const arrays = Array.isArray(analysis.arrays) ? analysis.arrays.map(parseJavaArray) : []
  const inputs = Array.isArray(analysis.inputs) ? analysis.inputs.map(parseJavaInput) : []
  const writes = Array.isArray(analysis.writes) ? analysis.writes.map(parseJavaWrite) : []
  const conditionals = Array.isArray(analysis.conditionals)
    ? analysis.conditionals.map(parseJavaConditional)
    : []
  const foreachLoops = Array.isArray(analysis.foreach_loops)
    ? analysis.foreach_loops.map(parseJavaForeach)
    : []
  const calls = Array.isArray(analysis.calls) ? analysis.calls.map(parseJavaCall) : []
  if (
    analysis.version !== 1
    || typeof analysis.analyzed !== 'boolean'
    || typeof analysis.parsed !== 'boolean'
    || typeof analysis.straight_line !== 'boolean'
    || !Array.isArray(analysis.imports)
    || analysis.imports.length > 4
    || !analysis.imports.every((entry) => entry === 'java.util.Scanner')
    || new Set(analysis.imports).size !== analysis.imports.length
    || typeof analysis.class_signature !== 'boolean'
    || !Array.isArray(analysis.main_methods)
    || analysis.main_methods.length > 4
    || mainMethods.some((fact) => !fact)
    || !Array.isArray(analysis.static_methods)
    || analysis.static_methods.length > 8
    || staticMethods.some((fact) => !fact)
    || !Array.isArray(analysis.scanner_declarations)
    || analysis.scanner_declarations.length > 8
    || scanners.some((fact) => !fact)
    || !Array.isArray(analysis.arrays)
    || analysis.arrays.length > 16
    || arrays.some((fact) => !fact)
    || !Array.isArray(analysis.inputs)
    || analysis.inputs.length > 16
    || inputs.some((fact) => !fact)
    || !Array.isArray(analysis.writes)
    || analysis.writes.length > 32
    || writes.some((fact) => !fact)
    || !Array.isArray(analysis.conditionals)
    || analysis.conditionals.length > 16
    || conditionals.some((fact) => !fact)
    || !Array.isArray(analysis.foreach_loops)
    || analysis.foreach_loops.length > 16
    || foreachLoops.some((fact) => !fact)
    || !Array.isArray(analysis.calls)
    || analysis.calls.length > 16
    || calls.some((fact) => !fact)
  ) return null

  for (const facts of [
    mainMethods,
    staticMethods,
    scanners,
    arrays,
    inputs,
    writes,
    conditionals,
    foreachLoops,
    calls,
  ]) {
    if (facts.some((fact, index) => fact?.occurrence !== index + 1)) return null
  }

  const allFacts = [
    mainMethods,
    staticMethods,
    scanners,
    arrays,
    inputs,
    writes,
    conditionals,
    foreachLoops,
    calls,
  ]
  const hasFacts = analysis.imports.length > 0
    || analysis.class_signature
    || allFacts.some((facts) => facts.length > 0)
  if (!analysis.analyzed && (analysis.parsed || analysis.straight_line || hasFacts)) return null
  if (analysis.parsed && !analysis.straight_line) return null
  if (!analysis.parsed && (analysis.straight_line || hasFacts)) return null
  if (analysis.straight_line && (
    analysis.imports.length !== 1
    || !analysis.class_signature
    || mainMethods.length !== 1
    || staticMethods.length !== 1
    || scanners.length !== 1
    || arrays.length !== 1
    || inputs.length !== 2
    || writes.length !== 2
    || conditionals.length !== 1
    || foreachLoops.length !== 1
    || calls.length !== 1
  )) return null
  if (JSON.stringify(value).length > 32_768) return null

  return {
    version: 1,
    analyzed: analysis.analyzed,
    parsed: analysis.parsed,
    straight_line: analysis.straight_line,
    imports: [...analysis.imports],
    class_signature: analysis.class_signature,
    main_methods: mainMethods as JavaMainFact[],
    static_methods: staticMethods as JavaStaticMethodFact[],
    scanner_declarations: scanners as JavaScannerFact[],
    arrays: arrays as JavaArrayFact[],
    inputs: inputs as JavaInputFact[],
    writes: writes as JavaWriteFact[],
    conditionals: conditionals as JavaConditionalFact[],
    foreach_loops: foreachLoops as JavaForeachFact[],
    calls: calls as JavaCallFact[],
  }
}

function parseSupervisorResult(
  value: string,
  language: LanguageId,
  projectAnalysisRequested = false,
): SupervisorResult | null {
  try {
    const result = JSON.parse(value) as Partial<SupervisorResult>
    if (
      !['completed', 'compile_error', 'runtime_error', 'limit_exceeded', 'system_error'].includes(result.outcome ?? '')
      || typeof result.stdout !== 'string'
      || typeof result.stderr !== 'string'
      || (typeof result.exit_code !== 'number' && result.exit_code !== null)
      || typeof result.duration_ms !== 'number'
      || typeof result.truncated !== 'boolean'
      || (typeof result.limit !== 'string' && result.limit !== null)
    ) return null
    const pythonAnalysis = result.python_analysis === undefined
      ? null
      : parsePythonAnalysis(result.python_analysis)
    if (result.python_analysis !== undefined && !pythonAnalysis) return null
    if (language === 'python' && !pythonAnalysis) return null
    if (language !== 'python' && result.python_analysis !== undefined) return null
    const cppAnalysis = result.cpp_analysis === undefined
      ? null
      : parseCppAnalysis(result.cpp_analysis)
    if (result.cpp_analysis !== undefined && !cppAnalysis) return null
    if (language === 'cpp' && (!cppAnalysis || cppAnalysis.analyzed !== projectAnalysisRequested)) return null
    if (language !== 'cpp' && result.cpp_analysis !== undefined) return null
    const csharpAnalysis = result.csharp_analysis === undefined
      ? null
      : parseCsharpAnalysis(result.csharp_analysis)
    if (result.csharp_analysis !== undefined && !csharpAnalysis) return null
    if (language === 'csharp' && (
      !csharpAnalysis || csharpAnalysis.analyzed !== projectAnalysisRequested
    )) return null
    if (language !== 'csharp' && result.csharp_analysis !== undefined) return null
    const javaAnalysis = result.java_analysis === undefined
      ? null
      : parseJavaAnalysis(result.java_analysis)
    if (result.java_analysis !== undefined && !javaAnalysis) return null
    if (language === 'java' && (
      !javaAnalysis || javaAnalysis.analyzed !== projectAnalysisRequested
    )) return null
    if (language !== 'java' && result.java_analysis !== undefined) return null
    return {
      ...result as SupervisorResult,
      ...(pythonAnalysis ? { python_analysis: pythonAnalysis } : {}),
      ...(cppAnalysis ? { cpp_analysis: cppAnalysis } : {}),
      ...(csharpAnalysis ? { csharp_analysis: csharpAnalysis } : {}),
      ...(javaAnalysis ? { java_analysis: javaAnalysis } : {}),
    }
  } catch {
    return null
  }
}

function supervisorSystemError(durationMs = 0): SupervisorResult {
  return {
    outcome: 'system_error',
    stdout: '',
    stderr: '',
    exit_code: null,
    duration_ms: durationMs,
    truncated: false,
    limit: null,
  }
}

async function withTimeout<T>(promise: Promise<T>, milliseconds: number): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<never>((_resolve, reject) => {
    timeoutId = setTimeout(() => reject(new Error('operation timed out')), milliseconds)
  })
  try {
    return await Promise.race([promise, timeout])
  } finally {
    if (timeoutId !== undefined) clearTimeout(timeoutId)
  }
}

export class RunnerPythonSandbox extends Sandbox<RunnerCoordinatorEnv> {
  enableInternet = false
  sleepAfter = '1m'
}

export class RunnerCppSandbox extends Sandbox<RunnerCoordinatorEnv> {
  enableInternet = false
  sleepAfter = '1m'
}

export class RunnerCsharpSandbox extends Sandbox<RunnerCoordinatorEnv> {
  enableInternet = false
  sleepAfter = '1m'
}

export class RunnerJavaSandbox extends Sandbox<RunnerCoordinatorEnv> {
  enableInternet = false
  sleepAfter = '1m'
}

export class RunnerCoordinator {
  private readonly state: DurableObjectState
  private readonly env: RunnerCoordinatorEnv
  private draining = false

  constructor(state: DurableObjectState, env: RunnerCoordinatorEnv) {
    this.state = state
    this.env = env
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url)
    if (request.method === 'POST' && url.pathname === '/submit') return this.submit(request)
    if (request.method === 'GET' && url.pathname.startsWith('/result/')) {
      return this.result(url.pathname.slice('/result/'.length), request.headers.get('X-Runner-Owner'))
    }
    return json({ error: 'Runner coordinator endpoint not found.' }, 404)
  }

  async alarm(): Promise<void> {
    if (this.draining) return
    this.draining = true
    try {
      await this.cleanupExpired()
      const queue = await this.state.storage.get<string[]>(QUEUE_KEY) ?? []
      const batch = queue.slice(0, CONCURRENT_LIMIT)
      if (!batch.length) {
        await this.scheduleCleanupAlarm()
        return
      }

      await this.state.storage.put(QUEUE_KEY, queue.slice(batch.length))
      const records = await Promise.all(batch.map((runId) => this.state.storage.get<StoredRun>(`${RUN_RECORD_PREFIX}${runId}`)))
      const runnable: StoredQueuedRun[] = []
      for (const record of records) {
        if (!record || record.status === 'complete') continue
        const running: StoredQueuedRun = {
          ...record,
          status: 'running',
          startedAt: Date.now(),
          attempts: record.attempts + 1,
        }
        await this.state.storage.put(`${RUN_RECORD_PREFIX}${record.id}`, running)
        runnable.push(running)
      }

      if (runnable.length) await this.state.storage.setAlarm(Date.now() + STALE_RUN_MS)
      await Promise.all(runnable.map((record) => this.execute(record)))
      const remaining = await this.state.storage.get<string[]>(QUEUE_KEY) ?? []
      if (remaining.length) await this.state.storage.setAlarm(Date.now() + 25)
      else await this.scheduleCleanupAlarm()
    } finally {
      this.draining = false
    }
  }

  private async submit(request: Request): Promise<Response> {
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return json({ error: 'Invalid internal runner request.' }, 400)
    }
    if (!isSubmitPayload(body)) return json({ error: 'Invalid internal runner request.' }, 400)
    const validated = validateRunnerRequest(body.request)
    if (!validated.ok) return json({ error: 'Invalid internal runner request.' }, 400)

    const assignment = findRunnerAssignment(body.exerciseId)
    if (!assignment || assignment.language !== validated.request.language) {
      return json({ error: 'The exercise does not match the selected language.' }, 400)
    }

    const now = Date.now()
    const existing = await this.state.storage.get<StoredRun>(`${RUN_RECORD_PREFIX}${body.runId}`)
    if (existing) return json({ error: 'Run identifier already exists.' }, 409)

    const queue = await this.state.storage.get<string[]>(QUEUE_KEY) ?? []
    if (queue.length >= QUEUE_LIMIT) {
      console.warn(JSON.stringify({ event: 'runner.rejected', reason: 'queue_full', queueDepth: queue.length }))
      return json({ error: 'The training queue is full. Try again shortly.', retryable: true }, 503)
    }

    const records = await this.state.storage.list<StoredRun>({ prefix: RUN_RECORD_PREFIX })
    const ownerPending = [...records.values()].filter((record) => record.ownerId === body.ownerId && record.status !== 'complete').length
    if (ownerPending >= USER_PENDING_LIMIT) {
      console.warn(JSON.stringify({ event: 'runner.rejected', reason: 'learner_pending_limit' }))
      return json({ error: 'Two runs are already waiting for this learner.', retryable: true }, 429)
    }

    const rateResponse = await this.applyRateLimits(body.ownerId, body.ipHash, now)
    if (rateResponse) return rateResponse

    const record: StoredQueuedRun = {
      id: body.runId,
      ownerId: body.ownerId,
      ipHash: body.ipHash,
      exerciseId: body.exerciseId,
      language: validated.request.language,
      source: validated.request.source,
      stdin: validated.request.stdin ?? '',
      purpose: validated.request.purpose ?? 'check',
      status: 'queued',
      createdAt: now,
      startedAt: null,
      attempts: 0,
    }
    await this.state.storage.put({
      [`${RUN_RECORD_PREFIX}${body.runId}`]: record,
      [QUEUE_KEY]: [...queue, body.runId],
    })
    const nextAlarm = await this.state.storage.getAlarm()
    const drainAt = Date.now() + 10
    if (shouldAdvanceDrainAlarm(nextAlarm, drainAt)) await this.state.storage.setAlarm(drainAt)
    console.info(JSON.stringify({
      event: 'runner.queued',
      runId: body.runId,
      language: validated.request.language,
      queueDepth: queue.length + 1,
      sourceBytes: textEncoder.encode(validated.request.source).byteLength,
      stdinBytes: textEncoder.encode(validated.request.stdin ?? '').byteLength,
      purpose: validated.request.purpose ?? 'check',
    }))

    return json({
      version: RUNNER_API_VERSION,
      runId: body.runId,
      status: 'queued',
      pollAfterMs: POLL_AFTER_MS,
    })
  }

  private async result(runId: string, ownerId: string | null): Promise<Response> {
    if (!/^[a-zA-Z0-9_-]{20,80}$/u.test(runId) || !ownerId) {
      return json({ error: 'Run not found.' }, 404)
    }
    const record = await this.state.storage.get<StoredRun>(`${RUN_RECORD_PREFIX}${runId}`)
    if (!record || record.ownerId !== ownerId || (record.status === 'complete' && record.expiresAt <= Date.now())) {
      return json({ error: 'Run not found.' }, 404)
    }
    if (
      record.status !== 'complete'
      && isRunnerRecordStale(record.status, record.createdAt, record.startedAt, Date.now(), STALE_RUN_MS)
    ) {
      const failed = this.systemErrorResult(record, Date.now())
      await this.state.storage.put(`${RUN_RECORD_PREFIX}${record.id}`, failed)
      console.error(JSON.stringify({
        event: 'runner.interrupted',
        runId: record.id,
        language: record.language,
        previousStatus: record.status,
      }))
      return json({ ...failed.result, stdout: '', stderr: '' })
    }
    if (record.status !== 'complete') {
      const pending: RunnerPending = {
        version: RUNNER_API_VERSION,
        runId,
        status: record.status,
        pollAfterMs: POLL_AFTER_MS,
      }
      return json(pending)
    }

    const [stdout, stderr] = await Promise.all([
      this.state.storage.get<string>(`${RUN_OUTPUT_PREFIX}${runId}`),
      this.state.storage.get<string>(`${RUN_ERROR_PREFIX}${runId}`),
    ])
    return json({ ...record.result, stdout: stdout ?? '', stderr: stderr ?? '' })
  }

  private async execute(record: StoredQueuedRun): Promise<void> {
    const assignment = findRunnerAssignment(record.exerciseId)
    const purpose = record.purpose ?? 'check'
    const inputs = assignment
      ? runnerInputCases(assignment, purpose, record.stdin)
      : [record.stdin]
    const officialProjectAssessment = assignment?.kind === 'project'
      && purpose === 'check'
      && assignment.projectAssessment
      ? assignment.projectAssessment
      : null
    let supervisorRuns: SupervisorResult[] = []
    let cleanupSucceeded = true
    for (const [caseIndex, stdin] of inputs.entries()) {
      // Every protected case gets a different VM. Learner-created processes,
      // memory, sockets, and files therefore cannot cross a case boundary.
      const sandbox = getSandbox(
        this.sandboxNamespace(record.language),
        `run-${record.id}-case-${caseIndex + 1}`,
        {
          sleepAfter: '1m',
          normalizeId: true,
          labels: { workload: 'learner-code', language: record.language },
        },
      )
      try {
        await sandbox.writeFile('/workspace/source.txt', record.source)
        await sandbox.writeFile('/workspace/stdin.txt', stdin)
        const projectAnalysisRequested = (
          officialProjectAssessment?.language === 'cpp'
          || officialProjectAssessment?.language === 'csharp'
          || officialProjectAssessment?.language === 'java'
        ) && caseIndex === 0
        const supervisorCommand = `/opt/runner/supervisor.py ${record.language}${
          projectAnalysisRequested ? ' --project-analysis' : ''
        }`
        const execution = await sandbox.exec(supervisorCommand, {
          timeout: SUPERVISOR_TIMEOUT_MS,
        })
        const supervisor = execution.success
          ? parseSupervisorResult(execution.stdout, record.language, projectAnalysisRequested)
          : null
        const safeSupervisor = supervisor ?? supervisorSystemError()
        supervisorRuns.push(safeSupervisor)
      } catch {
        supervisorRuns.push(supervisorSystemError())
      } finally {
        try {
          await withTimeout(sandbox.destroy(), DESTROY_TIMEOUT_MS)
        } catch {
          cleanupSucceeded = false
        }
      }
      if (!cleanupSucceeded || supervisorRuns.at(-1)?.outcome !== 'completed') break
    }

    if (!cleanupSucceeded) {
      supervisorRuns = [supervisorSystemError(aggregateRunnerDurationMs(
        supervisorRuns.map((supervisor) => supervisor.duration_ms),
      ))]
    } else if (!supervisorRuns.length) {
      supervisorRuns = [supervisorSystemError()]
    }

    const sanitizedRuns = supervisorRuns.map((supervisor) => ({
      ...supervisor,
      stdout: sanitizeRunnerOutput(supervisor.stdout),
      stderr: sanitizeRunnerOutput(supervisor.stderr),
    }))
    const failureIndex = sanitizedRuns.findIndex((supervisor) => supervisor.outcome !== 'completed')
    const representativeIndex = failureIndex >= 0 ? failureIndex : 0
    const representative = sanitizedRuns[representativeIndex] ?? supervisorSystemError()
    const projectEvaluation = officialProjectAssessment && assignment
      ? evaluateProjectRunnerAssignment(
          assignment,
          sanitizedRuns.map((supervisor) => ({
            outcome: supervisor.outcome,
            stdout: supervisor.stdout,
          })),
          officialProjectAssessment.language === 'cpp'
            ? sanitizedRuns[0]?.cpp_analysis
            : officialProjectAssessment.language === 'csharp'
              ? sanitizedRuns[0]?.csharp_analysis
              : officialProjectAssessment.language === 'java'
                ? sanitizedRuns[0]?.java_analysis
                : sanitizedRuns[0]?.python_analysis,
        )
      : null
    const projectPracticeRun = assignment?.kind === 'project' && purpose === 'run'
    const tests = projectPracticeRun
      ? []
      : projectEvaluation
        ? projectEvaluation.tests
        : assignment
          ? evaluateRunnerAssignment(
              assignment,
              representative.outcome,
              sanitizedRuns[0]?.stdout ?? '',
              record.source,
            )
          : []
    const visibleCaseIndex = officialProjectAssessment?.testCases.findIndex((testCase) => (
      testCase.visibility === 'visible'
    )) ?? -1
    const stdout = projectEvaluation
      ? projectEvaluation.visibleStdout
      : sanitizedRuns[0]?.stdout ?? ''
    const stderr = projectEvaluation && representativeIndex !== visibleCaseIndex
      ? ''
      : representative.stderr
    const durationMs = aggregateRunnerDurationMs(
      sanitizedRuns.map((supervisor) => supervisor.duration_ms),
    )
    const result: RunnerResult = {
      version: RUNNER_API_VERSION,
      runId: record.id,
      outcome: representative.outcome,
      stdout,
      stderr,
      exitCode: representative.exit_code,
      durationMs,
      truncated: sanitizedRuns.some((supervisor) => supervisor.truncated),
      limit: representative.limit,
      tests,
      diagnostic: explainRunnerResult(record.language, representative.outcome, stderr, representative.limit),
    }
    const now = Date.now()
    const completed: StoredCompletedRun = {
      id: record.id,
      ownerId: record.ownerId,
      exerciseId: record.exerciseId,
      language: record.language,
      status: 'complete',
      createdAt: record.createdAt,
      completedAt: now,
      expiresAt: now + RESULT_TTL_MS,
      result: withoutOutput(result),
    }
    await this.state.storage.put({
      [`${RUN_RECORD_PREFIX}${record.id}`]: completed,
      [`${RUN_OUTPUT_PREFIX}${record.id}`]: stdout,
      [`${RUN_ERROR_PREFIX}${record.id}`]: stderr,
    })
    const completionEvent = JSON.stringify({
      event: representative.outcome === 'system_error' ? 'runner.system_error' : 'runner.complete',
      runId: record.id,
      language: record.language,
      outcome: representative.outcome,
      durationMs: result.durationMs,
      limit: result.limit,
      phase: representative.phase ?? 'unknown',
      allocatedBytes: representative.allocated_bytes ?? null,
      stdoutBytes: textEncoder.encode(stdout).byteLength,
      stderrBytes: textEncoder.encode(stderr).byteLength,
      cleanupSucceeded,
      caseCount: sanitizedRuns.length,
      purpose,
    })
    if (representative.outcome === 'system_error') console.error(completionEvent)
    else console.info(completionEvent)
  }

  private sandboxNamespace(language: LanguageId): DurableObjectNamespace<Sandbox<RunnerCoordinatorEnv>> {
    switch (language) {
      case 'python': return this.env.RUNNER_PYTHON
      case 'cpp': return this.env.RUNNER_CPP
      case 'csharp': return this.env.RUNNER_CSHARP
      case 'java': return this.env.RUNNER_JAVA
    }
  }

  private async applyRateLimits(ownerId: string, ipHash: string, now: number): Promise<Response | null> {
    const definitions = [
      { key: 'rate:global', limit: RATE_LIMITS.global },
      { key: `rate:owner:${ownerId}`, limit: RATE_LIMITS.owner },
      { key: `rate:ip:${ipHash}`, limit: RATE_LIMITS.ip },
    ]
    const windows = await Promise.all(definitions.map(async (definition) => ({
      ...definition,
      active: (await this.state.storage.get<number[]>(definition.key) ?? [])
        .filter((timestamp) => timestamp > now - RATE_WINDOW_MS),
    })))
    for (const window of windows) {
      if (window.active.length >= window.limit) {
        console.warn(JSON.stringify({ event: 'runner.rejected', reason: 'rate_limit', scope: window.key.split(':')[1] }))
        return json({ error: 'The runner is receiving too many requests. Try again in one minute.', retryable: true }, 429)
      }
    }
    await this.state.storage.put(Object.fromEntries(
      windows.map((window) => [window.key, [...window.active, now]]),
    ))
    return null
  }

  private async cleanupExpired(): Promise<void> {
    const records = await this.state.storage.list<StoredRun>({ prefix: RUN_RECORD_PREFIX })
    const keys: string[] = []
    const now = Date.now()
    for (const [key, record] of records) {
      if (record.status === 'complete' && record.expiresAt <= now) {
        keys.push(key, `${RUN_OUTPUT_PREFIX}${record.id}`, `${RUN_ERROR_PREFIX}${record.id}`)
      } else if (
        record.status !== 'complete'
        && isRunnerRecordStale(record.status, record.createdAt, record.startedAt, now, STALE_RUN_MS)
      ) {
        console.error(JSON.stringify({
          event: 'runner.interrupted',
          runId: record.id,
          language: record.language,
          previousStatus: record.status,
        }))
        await this.state.storage.put(`${RUN_RECORD_PREFIX}${record.id}`, this.systemErrorResult(record, now))
      }
    }
    if (keys.length) await this.state.storage.delete(keys)
  }

  private async scheduleCleanupAlarm(): Promise<void> {
    const records = await this.state.storage.list<StoredRun>({ prefix: RUN_RECORD_PREFIX })
    const expirations = [...records.values()]
      .map((record) => record.status === 'complete'
        ? record.expiresAt
        : (record.status === 'running' ? (record.startedAt ?? record.createdAt) : record.createdAt) + STALE_RUN_MS)
    if (expirations.length) await this.state.storage.setAlarm(Math.min(...expirations))
  }

  private systemErrorResult(record: StoredQueuedRun, now: number): StoredCompletedRun {
    return {
      id: record.id,
      ownerId: record.ownerId,
      exerciseId: record.exerciseId,
      language: record.language,
      status: 'complete',
      createdAt: record.createdAt,
      completedAt: now,
      expiresAt: now + RESULT_TTL_MS,
      result: {
        version: RUNNER_API_VERSION,
        runId: record.id,
        outcome: 'system_error',
        exitCode: null,
        durationMs: 0,
        truncated: false,
        limit: null,
        tests: [],
        diagnostic: explainRunnerResult(record.language, 'system_error', '', null),
      },
    }
  }
}

function withoutOutput(result: RunnerResult): Omit<RunnerResult, 'stdout' | 'stderr'> {
  return {
    version: result.version,
    runId: result.runId,
    outcome: result.outcome,
    exitCode: result.exitCode,
    durationMs: result.durationMs,
    truncated: result.truncated,
    limit: result.limit,
    tests: result.tests,
    diagnostic: result.diagnostic,
  }
}
