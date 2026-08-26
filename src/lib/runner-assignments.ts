import { tracks } from '../data/curriculum'
import { cppCompiledProject } from '../data/cpp-compiled-project'
import { cppCompiledProjectServerAssessment } from '../data/cpp-compiled-project.server'
import { csharpWorkshopProject } from '../data/csharp-workshop-project'
import { csharpWorkshopProjectServerAssessment } from '../data/csharp-workshop-project.server'
import { pythonInteractiveProject } from '../data/python-interactive-project'
import { pythonInteractiveProjectServerAssessment } from '../data/python-interactive-project.server'
import type {
  ServerOwnedProjectAssessment,
  ServerOwnedProjectStructuralCheck,
} from '../data/project-assessment'
import type { Exercise, LanguageId } from '../types'
import { evaluateExerciseChecks } from './evaluator'
import type { RunnerOutcome, RunnerPurpose, RunnerTestResult } from './runner-contract'

export type RunnerAssignmentKind = 'academy' | 'project'

export interface RunnerAssignment {
  exerciseId: string
  language: LanguageId
  expectedOutput: string
  exercise: Exercise
  kind: RunnerAssignmentKind
  projectCheckStdin?: string
  projectAssessment?: ServerOwnedProjectAssessment
}

export interface RunnerProjectCaseExecution {
  outcome: RunnerOutcome
  stdout: string
}

export type PythonAssignmentFact =
  | { target: string; occurrence: number; kind: 'integer'; value: number }
  | { target: string; occurrence: number; kind: 'string' }
  | { target: string; occurrence: number; kind: 'name'; name: string }
  | { target: string; occurrence: number; kind: 'input' }
  | { target: string; occurrence: number; kind: 'int_name'; name: string }
  | { target: string; occurrence: number; kind: 'multiply_names'; names: [string, string] }
  | { target: string; occurrence: number; kind: 'unsupported' }

export interface PythonPrintFStringFact {
  occurrence: number
  fields: string[]
}

export interface PythonAnalysis {
  version: 1
  parsed: boolean
  straight_line: boolean
  assignments: PythonAssignmentFact[]
  print_fstrings: PythonPrintFStringFact[]
}

export type CppDeclarationFact =
  | { target: string; occurrence: number; statement: number; kind: 'integer'; value: number }
  | { target: string; occurrence: number; statement: number; kind: 'string' }
  | { target: string; occurrence: number; statement: number; kind: 'multiply_names'; names: [string, string] }
  | { target: string; occurrence: number; statement: number; kind: 'unsupported' }

export interface CppInputFact {
  occurrence: number
  statement: number
  kind: 'getline_cin' | 'cin_extract'
  target: string
}

export interface CppCoutChainFact {
  occurrence: number
  statement: number
  fields: string[]
}

export interface CppAnalysis {
  version: 1
  analyzed: boolean
  parsed: boolean
  straight_line: boolean
  headers: string[]
  main_signature: boolean
  returns_zero: boolean
  declarations: CppDeclarationFact[]
  inputs: CppInputFact[]
  cout_chains: CppCoutChainFact[]
}

export interface CsharpInterpolationFact {
  parts: string[]
  fields: string[]
}

export interface CsharpParameterFact {
  position: number
  name: string
  type: string
}

export interface CsharpLocalFunctionFact {
  occurrence: number
  statement: number
  name: string
  return_type: string
  parameters: CsharpParameterFact[]
  interpolation: CsharpInterpolationFact
}

export interface CsharpArrayFact {
  occurrence: number
  statement: number
  target: string
  element_type: string
  values: string[]
}

export interface CsharpInputFact {
  occurrence: number
  statement: number
  target: string
  kind: 'read_line_coalesce_string' | 'int_parse_read_line_coalesce_string'
  fallback: string
}

export interface CsharpWriteFact {
  occurrence: number
  statement: number
  text: string
}

export interface CsharpConditionalFact {
  occurrence: number
  statement: number
  left: string
  operator: '>='
  right: number
  when_true: string
  when_false: string
}

export interface CsharpForeachFact {
  occurrence: number
  statement: number
  element_type: string
  target: string
  collection: string
  interpolation: CsharpInterpolationFact
}

export interface CsharpCallFact {
  occurrence: number
  statement: number
  target: string
  arguments: string[]
}

export interface CsharpAnalysis {
  version: 1
  analyzed: boolean
  parsed: boolean
  straight_line: boolean
  usings: string[]
  local_functions: CsharpLocalFunctionFact[]
  arrays: CsharpArrayFact[]
  inputs: CsharpInputFact[]
  writes: CsharpWriteFact[]
  conditionals: CsharpConditionalFact[]
  foreach_loops: CsharpForeachFact[]
  calls: CsharpCallFact[]
}

export type ProjectStructuralAnalysis = PythonAnalysis | CppAnalysis | CsharpAnalysis

export interface RunnerProjectEvaluation {
  tests: RunnerTestResult[]
  visibleStdout: string
}

const assignments = new Map<string, RunnerAssignment>()

for (const track of tracks) {
  for (const mission of track.missions) {
    for (const exercise of mission.exercises) {
      if ((exercise.type !== 'code' && exercise.type !== 'bugfix') || exercise.output === undefined) continue
      assignments.set(exercise.id, {
        exerciseId: exercise.id,
        language: track.id,
        expectedOutput: exercise.output,
        exercise,
        kind: 'academy',
      })
    }
  }
}

for (const checkpoint of pythonInteractiveProject.checkpoints) {
  const { exercise } = checkpoint
  if ((exercise.type !== 'code' && exercise.type !== 'bugfix') || exercise.output === undefined) continue
  assignments.set(exercise.id, {
    exerciseId: exercise.id,
    language: pythonInteractiveProject.language,
    expectedOutput: exercise.output,
    exercise,
    kind: 'project',
    projectCheckStdin: checkpoint.practiceStdin ?? '',
    ...(exercise.id === 'project-py-final'
      ? { projectAssessment: pythonInteractiveProjectServerAssessment }
      : {}),
  })
}

for (const checkpoint of cppCompiledProject.checkpoints) {
  const { exercise } = checkpoint
  if ((exercise.type !== 'code' && exercise.type !== 'bugfix') || exercise.output === undefined) continue
  assignments.set(exercise.id, {
    exerciseId: exercise.id,
    language: cppCompiledProject.language,
    expectedOutput: exercise.output,
    exercise,
    kind: 'project',
    projectCheckStdin: checkpoint.practiceStdin ?? '',
    ...(exercise.id === 'project-cpp-final'
      ? { projectAssessment: cppCompiledProjectServerAssessment }
      : {}),
  })
}

for (const checkpoint of csharpWorkshopProject.checkpoints) {
  const { exercise } = checkpoint
  if ((exercise.type !== 'code' && exercise.type !== 'bugfix') || exercise.output === undefined) continue
  assignments.set(exercise.id, {
    exerciseId: exercise.id,
    language: csharpWorkshopProject.language,
    expectedOutput: exercise.output,
    exercise,
    kind: 'project',
    projectCheckStdin: checkpoint.practiceStdin ?? '',
    ...(exercise.id === 'project-csharp-final'
      ? { projectAssessment: csharpWorkshopProjectServerAssessment }
      : {}),
  })
}

export function findRunnerAssignment(exerciseId: string): RunnerAssignment | undefined {
  return assignments.get(exerciseId)
}

export function runnerAssignmentCount(): number {
  return assignments.size
}

function normalizedOutput(value: string): string {
  return value.replaceAll('\r\n', '\n').trimEnd()
}

function checkPythonAnalysisFact(
  analysis: PythonAnalysis,
  check: ServerOwnedProjectStructuralCheck,
): boolean {
  switch (check.validation) {
    case 'python-print-f-string':
      return analysis.print_fstrings.some((fact) => (
        check.requiredFields.every((field) => fact.fields.includes(field))
      ))
    case 'python-assignment-integer':
    case 'python-assignment-input':
    case 'python-assignment-int-name':
    case 'python-assignment-multiply-names': {
      const assignments = analysis.assignments.filter((fact) => fact.target === check.target)
      if (assignments.length !== 1 || assignments[0].occurrence !== 1) return false
      const fact = assignments[0]
      if (check.validation === 'python-assignment-integer') {
        return fact.kind === 'integer' && fact.value === check.value
      }
      if (check.validation === 'python-assignment-input') return fact.kind === 'input'
      if (check.validation === 'python-assignment-int-name') {
        return fact.kind === 'int_name' && fact.name === check.name
      }
      return fact.kind === 'multiply_names'
        && fact.names[0] === check.names[0]
        && fact.names[1] === check.names[1]
    }
    default:
      return false
  }
}

function oneCppDeclaration(analysis: CppAnalysis, target: string): CppDeclarationFact | null {
  const declarations = analysis.declarations.filter((fact) => fact.target === target)
  return declarations.length === 1 && declarations[0].occurrence === 1
    ? declarations[0]
    : null
}

function oneCppInput(
  analysis: CppAnalysis,
  target: string,
  kind: CppInputFact['kind'],
): CppInputFact | null {
  const inputs = analysis.inputs.filter((fact) => fact.target === target)
  return inputs.length === 1 && inputs[0].kind === kind
    ? inputs[0]
    : null
}

function hasAuthoredCppFactFrame(analysis: CppAnalysis): boolean {
  const declarationStatements = [1, 4, 7, 9]
  const inputStatements = [5, 8]
  const coutStatements = [2, 3, 6, 10]
  return analysis.declarations.length === declarationStatements.length
    && analysis.declarations.every((fact, index) => (
      fact.statement === declarationStatements[index]
    ))
    && analysis.inputs.length === inputStatements.length
    && analysis.inputs.every((fact, index) => (
      fact.occurrence === index + 1 && fact.statement === inputStatements[index]
    ))
    && analysis.cout_chains.length === coutStatements.length
    && analysis.cout_chains.every((fact, index) => (
      fact.occurrence === index + 1
      && fact.statement === coutStatements[index]
      && (index === coutStatements.length - 1 || fact.fields.length === 0)
    ))
}

function checkCppAnalysisFact(
  analysis: CppAnalysis,
  check: ServerOwnedProjectStructuralCheck,
): boolean {
  switch (check.validation) {
    case 'cpp-required-headers':
      return analysis.headers.length === check.headers.length
        && check.headers.every((header, index) => analysis.headers[index] === header)
    case 'cpp-main-return-zero':
      return analysis.main_signature && analysis.returns_zero
    case 'cpp-declaration-integer': {
      const fact = oneCppDeclaration(analysis, check.target)
      return fact?.kind === 'integer'
        && fact.value === check.value
        && fact.statement === check.statement
    }
    case 'cpp-declaration-string': {
      const fact = oneCppDeclaration(analysis, check.target)
      return fact?.kind === 'string' && fact.statement === check.statement
    }
    case 'cpp-getline': {
      const fact = oneCppInput(analysis, check.target, 'getline_cin')
      return fact?.occurrence === 1 && fact.statement === check.statement
    }
    case 'cpp-integer-extraction': {
      const declaration = oneCppDeclaration(analysis, check.target)
      const input = oneCppInput(analysis, check.target, 'cin_extract')
      return declaration?.kind === 'integer'
        && declaration.value === check.initialValue
        && declaration.statement === check.declarationStatement
        && input?.occurrence === 2
        && input.statement === check.inputStatement
    }
    case 'cpp-declaration-multiply-names': {
      const fact = oneCppDeclaration(analysis, check.target)
      return fact?.kind === 'multiply_names'
        && fact.names[0] === check.names[0]
        && fact.names[1] === check.names[1]
        && fact.statement === check.statement
    }
    case 'cpp-output-chain':
      return analysis.cout_chains.some((fact) => (
        fact.occurrence === 4
        && fact.statement === check.statement
        && fact.fields.length === check.requiredFields.length
        && check.requiredFields.every((field, index) => fact.fields[index] === field)
      ))
    default:
      return false
  }
}

function sameStrings(actual: readonly string[], expected: readonly string[]): boolean {
  return actual.length === expected.length
    && actual.every((value, index) => value === expected[index])
}

function hasAuthoredCsharpFactFrame(analysis: CsharpAnalysis): boolean {
  return analysis.local_functions.length === 1
    && analysis.local_functions[0].occurrence === 1
    && analysis.local_functions[0].statement === 1
    && analysis.arrays.length === 1
    && analysis.arrays[0].occurrence === 1
    && analysis.arrays[0].statement === 2
    && analysis.writes.length === 2
    && analysis.writes.every((fact, index) => (
      fact.occurrence === index + 1
      && fact.statement === [3, 5][index]
    ))
    && analysis.inputs.length === 2
    && analysis.inputs.every((fact, index) => (
      fact.occurrence === index + 1
      && fact.statement === [4, 6][index]
    ))
    && analysis.conditionals.length === 1
    && analysis.conditionals[0].occurrence === 1
    && analysis.conditionals[0].statement === 7
    && analysis.foreach_loops.length === 1
    && analysis.foreach_loops[0].occurrence === 1
    && analysis.foreach_loops[0].statement === 8
    && analysis.calls.length === 1
    && analysis.calls[0].occurrence === 1
    && analysis.calls[0].statement === 9
}

function checkCsharpAnalysisFact(
  analysis: CsharpAnalysis,
  check: ServerOwnedProjectStructuralCheck,
): boolean {
  switch (check.validation) {
    case 'csharp-using-system':
      return sameStrings(analysis.usings, ['System'])
    case 'csharp-print-badge': {
      const fact = analysis.local_functions[0]
      return Boolean(fact)
        && fact.name === 'PrintBadge'
        && fact.return_type === 'void'
        && fact.parameters.length === 2
        && fact.parameters[0].position === 1
        && fact.parameters[0].name === 'name'
        && fact.parameters[0].type === 'string'
        && fact.parameters[1].position === 2
        && fact.parameters[1].name === 'visits'
        && fact.parameters[1].type === 'int'
        && sameStrings(fact.interpolation.parts, ['Badge: ', ' | Visits: ', ''])
        && sameStrings(fact.interpolation.fields, ['name', 'visits'])
    }
    case 'csharp-areas-array': {
      const fact = analysis.arrays[0]
      return Boolean(fact)
        && fact.target === 'areas'
        && fact.element_type === 'string'
        && sameStrings(fact.values, ['Studio', 'Lab', 'Library'])
    }
    case 'csharp-console-inputs': {
      const [nameInput, visitInput] = analysis.inputs
      const [namePrompt, visitPrompt] = analysis.writes
      return Boolean(nameInput && visitInput && namePrompt && visitPrompt)
        && namePrompt.text === 'What is your name?'
        && nameInput.target === 'guestName'
        && nameInput.kind === 'read_line_coalesce_string'
        && nameInput.fallback === ''
        && visitPrompt.text === 'How many visits have you completed?'
        && visitInput.target === 'visitCount'
        && visitInput.kind === 'int_parse_read_line_coalesce_string'
        && visitInput.fallback === '0'
    }
    case 'csharp-membership-branch': {
      const fact = analysis.conditionals[0]
      return Boolean(fact)
        && fact.left === 'visitCount'
        && fact.operator === '>='
        && fact.right === 3
        && fact.when_true === 'Access: Member'
        && fact.when_false === 'Access: Guest'
    }
    case 'csharp-area-foreach': {
      const fact = analysis.foreach_loops[0]
      return Boolean(fact)
        && fact.element_type === 'string'
        && fact.target === 'area'
        && fact.collection === 'areas'
        && sameStrings(fact.interpolation.parts, ['Area: ', ''])
        && sameStrings(fact.interpolation.fields, ['area'])
    }
    case 'csharp-print-badge-call': {
      const fact = analysis.calls[0]
      return Boolean(fact)
        && fact.target === 'PrintBadge'
        && sameStrings(fact.arguments, ['guestName', 'visitCount'])
    }
    case 'csharp-top-level-order':
      return hasAuthoredCsharpFactFrame(analysis)
    default:
      return false
  }
}

export function evaluateProjectStructuralChecks(
  assessment: ServerOwnedProjectAssessment,
  analysis: ProjectStructuralAnalysis | null | undefined,
): Array<{ passed: boolean; message: string }> {
  const trustedPython = assessment.language === 'python'
    && analysis !== null
    && analysis !== undefined
    && !('analyzed' in analysis)
    && analysis.version === 1
    && analysis.parsed
    && analysis.straight_line
  const trustedCpp = assessment.language === 'cpp'
    && analysis !== null
    && analysis !== undefined
    && 'analyzed' in analysis
    && 'headers' in analysis
    && analysis.version === 1
    && analysis.analyzed
    && analysis.parsed
    && analysis.straight_line
    && hasAuthoredCppFactFrame(analysis)
  const trustedCsharp = assessment.language === 'csharp'
    && analysis !== null
    && analysis !== undefined
    && 'analyzed' in analysis
    && 'local_functions' in analysis
    && analysis.version === 1
    && analysis.analyzed
    && analysis.parsed
    && analysis.straight_line
    && hasAuthoredCsharpFactFrame(analysis)
  return assessment.structuralChecks.map((check) => ({
    passed: trustedPython
      ? checkPythonAnalysisFact(analysis, check)
      : trustedCpp
        ? checkCppAnalysisFact(analysis, check)
        : trustedCsharp
          ? checkCsharpAnalysisFact(analysis, check)
          : false,
    message: check.message,
  }))
}

export function runnerInputCases(
  assignment: RunnerAssignment,
  purpose: RunnerPurpose,
  callerStdin: string,
): string[] {
  if (assignment.kind !== 'project') return [callerStdin]
  if (purpose === 'run') return [callerStdin]
  if (assignment.projectAssessment) {
    return assignment.projectAssessment.testCases.map((testCase) => testCase.stdin)
  }
  return [assignment.projectCheckStdin ?? '']
}

export function aggregateRunnerDurationMs(durations: number[]): number {
  return durations.reduce((total, duration) => {
    const safeDuration = Number.isFinite(duration) && duration > 0
      ? Math.round(duration)
      : 0
    return Math.min(Number.MAX_SAFE_INTEGER, total + safeDuration)
  }, 0)
}

export function evaluateProjectRunnerAssignment(
  assignment: RunnerAssignment,
  executions: RunnerProjectCaseExecution[],
  analysis: ProjectStructuralAnalysis | null | undefined,
): RunnerProjectEvaluation {
  const assessment = assignment.projectAssessment
  if (!assessment) return { tests: [], visibleStdout: '' }

  let hiddenCaseNumber = 0
  const caseTests: RunnerTestResult[] = assessment.testCases.map((testCase, index) => {
    const execution = executions[index]
    const completed = execution?.outcome === 'completed'
    const outputMatches = completed
      && normalizedOutput(execution.stdout) === normalizedOutput(testCase.expectedStdout)
    const hiddenNumber = testCase.visibility === 'hidden' ? ++hiddenCaseNumber : 0
    const name = testCase.visibility === 'visible'
      ? 'Visible project example'
      : `Hidden project case ${hiddenNumber}`

    return {
      name,
      visibility: testCase.visibility,
      passed: outputMatches,
      message: outputMatches
        ? testCase.visibility === 'visible'
          ? 'Your program produced the expected result for the visible example.'
          : 'Your program passed this hidden input case.'
        : execution
          ? testCase.visibility === 'visible'
            ? 'Your program did not produce the expected result for the visible example.'
            : 'Your program did not pass this hidden input case.'
          : 'This case could not run because an earlier case did not finish.',
    }
  })
  const structuralResults = evaluateProjectStructuralChecks(assessment, analysis)
  const structuralTests: RunnerTestResult[] = structuralResults.map((check, index) => ({
    name: `Required project code ${index + 1} of ${structuralResults.length}`,
    visibility: 'hidden',
    passed: check.passed,
    message: check.passed
      ? 'This required part of the project is present in your code.'
      : check.message,
  }))
  const visibleIndex = assessment.testCases.findIndex((testCase) => testCase.visibility === 'visible')

  return {
    tests: [...caseTests, ...structuralTests],
    visibleStdout: visibleIndex >= 0 ? executions[visibleIndex]?.stdout ?? '' : '',
  }
}

export function evaluateRunnerAssignment(
  assignment: RunnerAssignment,
  outcome: RunnerOutcome,
  stdout: string,
  source: string,
): RunnerTestResult[] {
  const completed = outcome === 'completed'
  const outputMatches = completed
    && normalizedOutput(stdout) === normalizedOutput(assignment.expectedOutput)
  const scaffoldComplete = !source.includes('_____')
  const authoredCheckResults = evaluateExerciseChecks(assignment.exercise, source)
  const requiredCodeTests: RunnerTestResult[] = authoredCheckResults.map((check, index) => ({
    name: authoredCheckResults.length === 1
      ? 'Required lesson code'
      : `Required lesson code ${index + 1} of ${authoredCheckResults.length}`,
    visibility: 'hidden',
    passed: check.passed,
    message: check.passed
      ? 'This required part of the lesson is present in your code.'
      : check.message,
  }))

  return [
    {
      name: 'Visible console check',
      visibility: 'visible',
      passed: outputMatches,
      message: outputMatches
        ? `The real console output matched: ${assignment.expectedOutput}`
        : `The assignment asked for this exact visible output: ${assignment.expectedOutput}`,
    },
    {
      name: 'Complete the supplied scaffold',
      visibility: 'hidden',
      passed: scaffoldComplete,
      message: scaffoldComplete
        ? 'Every blank identified in the task was completed.'
        : 'At least one supplied _____ blank still needs an answer.',
    },
    {
      name: 'Finish without a language error',
      visibility: 'hidden',
      passed: completed,
      message: completed
        ? 'The program finished normally inside the isolated runner.'
        : 'The same requirement also needs the program to compile and finish normally.',
    },
    ...requiredCodeTests,
  ]
}
