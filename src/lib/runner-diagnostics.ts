import type { LanguageId } from '../types'
import type { RunnerDiagnostic, RunnerOutcome } from './runner-contract'

// The control characters are the ANSI escape and bell delimiters being removed.
// eslint-disable-next-line no-control-regex
const ANSI_ESCAPE = /\u001B(?:\[[0-?]*[ -/]*[@-~]|\][^\u0007]*(?:\u0007|\u001B\\))/gu
const HOST_PATHS = [
  [/\/workspace\/(?:source\.txt|mission\.py)/gu, 'main.py'],
  [/\/workspace\/mission\.cpp/gu, 'main.cpp'],
  [/\/workspace\/Main\.java/gu, 'Main.java'],
  [/\/workspace\/(?:Program\.cs|Cadet\.csproj)/gu, 'Program.cs'],
  [/\/workspace(?:\/[^\s:)]*)?/gu, 'the lesson workspace'],
  [/\/tmp\/[^\s:)]*/gu, 'a temporary file'],
] as const

export function sanitizeRunnerOutput(value: string, maximumBytes = 64_000): string {
  let sanitized = value.replace(ANSI_ESCAPE, '')
  for (const [pattern, replacement] of HOST_PATHS) sanitized = sanitized.replace(pattern, replacement)
  sanitized = sanitized.replaceAll('\0', '')

  const bytes = new TextEncoder().encode(sanitized)
  if (bytes.byteLength <= maximumBytes) return sanitized
  return `${new TextDecoder().decode(bytes.slice(0, maximumBytes))}\n[Output stopped at the safety limit.]`
}

interface DiagnosticRule {
  pattern: RegExp
  title: string
  explanation: string
  suggestion: string
}

const rules: Record<LanguageId, DiagnosticRule[]> = {
  python: [
    {
      pattern: /IndentationError|unexpected indent|expected an indented block/iu,
      title: 'Python found an indentation problem',
      explanation: 'Python uses leading spaces to show which instructions belong inside a condition, loop, or function.',
      suggestion: 'Compare the spaces at the start of nearby lines. Instructions in the same group should line up.',
    },
    {
      pattern: /SyntaxError|unterminated string|was never closed|invalid syntax/iu,
      title: 'Python could not read one instruction',
      explanation: 'A punctuation mark, quote, parenthesis, or other required piece is missing or out of place.',
      suggestion: 'Start at the reported line and compare it with the supplied example one symbol at a time.',
    },
    {
      pattern: /NameError|is not defined/iu,
      title: 'Python does not know that name yet',
      explanation: 'The program tried to use a variable or function name that has not been created with that exact spelling.',
      suggestion: 'Check capitalization and spelling, then make sure the name is created before the line that uses it.',
    },
    {
      pattern: /TypeError/iu,
      title: 'Python received the wrong kind of value',
      explanation: 'The instruction is valid Python, but the values used by it do not work together in this form.',
      suggestion: 'Check which values are text, whole numbers, or collections, then reread what the instruction expects.',
    },
  ],
  cpp: [
    {
      pattern: /expected ['‘’`]?;|expected ‘;’/iu,
      title: 'C++ expected a semicolon',
      explanation: 'Most C++ instructions end with a semicolon. It tells C++ where that instruction stops.',
      suggestion: 'Look at the reported line and the line just above it for a missing semicolon.',
    },
    {
      pattern: /was not declared|not declared in this scope/iu,
      title: 'C++ does not know that name yet',
      explanation: 'C++ found a name that was not created earlier with the same spelling and capitalization.',
      suggestion: 'Check the variable name, its capital letters, and whether it is created before this line.',
    },
    {
      pattern: /expected ['‘’`]?\}|expected ‘\}’/iu,
      title: 'C++ expected a closing brace',
      explanation: 'An opening brace starts a group of instructions, and C++ needs a matching closing brace to end that group.',
      suggestion: 'Count the opening and closing braces around the reported line.',
    },
  ],
  csharp: [
    {
      pattern: /CS1002|; expected/iu,
      title: 'C# expected a semicolon',
      explanation: 'Most C# instructions end with a semicolon. It marks the end of one complete instruction.',
      suggestion: 'Check the end of the reported line and the line immediately above it.',
    },
    {
      pattern: /CS0103|does not exist in the current context/iu,
      title: 'C# does not know that name here',
      explanation: 'The code used a variable or method name that is missing, misspelled, or outside the current group.',
      suggestion: 'Check the spelling and capitalization, then make sure the name is created before it is used.',
    },
    {
      pattern: /CS0029|cannot implicitly convert type/iu,
      title: 'C# found a value of the wrong type',
      explanation: 'The value on the right does not match the kind of value the variable on the left was declared to hold.',
      suggestion: 'Compare the declared type with the value. Text uses string, while whole numbers use int.',
    },
  ],
  java: [
    {
      pattern: /';' expected/iu,
      title: 'Java expected a semicolon',
      explanation: 'Most Java instructions end with a semicolon so Java can see where the instruction stops.',
      suggestion: 'Look at the reported line and the line directly above it for a missing semicolon.',
    },
    {
      pattern: /cannot find symbol/iu,
      title: 'Java cannot find that name',
      explanation: 'Java found a variable, method, or class name that was not created with that exact spelling.',
      suggestion: 'Check capitalization and spelling, then make sure the name is created before the reported line.',
    },
    {
      pattern: /reached end of file while parsing|class, interface, enum, or record expected/iu,
      title: 'Java found an unmatched brace',
      explanation: 'A brace starts or closes a group of instructions. Java could not match the groups in this program.',
      suggestion: 'Count each opening brace and make sure it has one closing brace.',
    },
  ],
}

function reportedLine(diagnostic: string): number | null {
  const match = diagnostic.match(/(?:line\s+|\.(?:py|cpp|java):|\.cs\()(\d+)/iu)
  if (!match) return null
  const line = Number(match[1])
  return Number.isSafeInteger(line) && line > 0 ? line : null
}

export function explainRunnerResult(
  language: LanguageId,
  outcome: RunnerOutcome,
  stderr: string,
  limit: string | null,
): RunnerDiagnostic {
  const line = reportedLine(stderr)

  if (outcome === 'completed') {
    return {
      title: 'The program ran',
      explanation: 'The code checker ran your code and collected what it printed.',
      suggestion: 'Compare the output with the check below.',
      line: null,
    }
  }

  if (outcome === 'limit_exceeded') {
    const detail: Record<string, string> = {
      wall_time: 'The program was still running after five seconds.',
      cpu_time: 'The program did too much work for one check.',
      memory: 'The program tried to use too much memory for one check.',
      writable_storage: 'The program tried to save too much temporary data for one check.',
      stdout_output: 'The program printed too much output for one check.',
      stderr_output: 'The program reported too many errors at once.',
    }
    return {
      title: 'The code checker stopped the program',
      explanation: detail[limit ?? ''] ?? 'The program reached a safety limit.',
      suggestion: 'Look for a loop that does not end, the same print instruction running many times, too many saved files, or a very large list or string.',
      line,
    }
  }

  if (outcome === 'system_error') {
    return {
      title: 'The code checker had a problem',
      explanation: 'This was a service problem, not proof that your code is wrong.',
      suggestion: 'Wait a moment and run the same code again. No points or progress were removed.',
      line: null,
    }
  }

  const diagnostic = stderr || ''
  const matched = rules[language].find((rule) => rule.pattern.test(diagnostic))
  if (matched) return { ...matched, line }

  return {
    title: outcome === 'compile_error' ? 'The language could not read this code yet' : 'The program stopped while it was running',
    explanation: outcome === 'compile_error'
      ? 'A required word or punctuation mark may be missing or out of place.'
      : 'The code was valid enough to start, but an instruction failed while the program was running.',
    suggestion: 'Read the first error below, start at its line number, and compare that line with the example.',
    line,
  }
}
