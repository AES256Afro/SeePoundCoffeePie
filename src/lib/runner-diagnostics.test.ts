import { describe, expect, it } from 'vitest'
import { explainRunnerResult, sanitizeRunnerOutput } from './runner-diagnostics'

describe('beginner runner diagnostics', () => {
  it('removes terminal instructions and shows the same filenames as the editors', () => {
    expect(sanitizeRunnerOutput('\u001b[31m/workspace/mission.py:2: error\u001b[0m'))
      .toBe('main.py:2: error')
    expect(sanitizeRunnerOutput('/workspace/mission.cpp:3: error'))
      .toBe('main.cpp:3: error')
    expect(sanitizeRunnerOutput('/workspace/Main.java:4: error'))
      .toBe('Main.java:4: error')
    expect(sanitizeRunnerOutput('/workspace/Program.cs:5: error'))
      .toBe('Program.cs:5: error')
  })

  it('explains common language errors without replacing the raw message', () => {
    expect(explainRunnerResult('python', 'compile_error', 'mission.py, line 2\nSyntaxError: invalid syntax', null))
      .toMatchObject({
        title: 'Python could not read one instruction',
        line: 2,
      })

    expect(explainRunnerResult('csharp', 'compile_error', 'Program.cs(4,1): error CS1002: ; expected', null))
      .toMatchObject({ title: 'C# expected a semicolon', line: 4 })
  })

  it.each([
    {
      stderr: "main.cpp:12: error: expected '}'",
      expected: {
        title: 'C++ expected a closing brace',
        explanation: 'An opening brace starts a group of instructions, and C++ needs a matching closing brace to end that group.',
        suggestion: 'Count the opening and closing braces around the reported line.',
        line: 12,
      },
    },
    {
      stderr: "main.cpp:8: error: expected ';'",
      expected: {
        title: 'C++ expected a semicolon',
        explanation: 'Most C++ instructions end with a semicolon. It tells C++ where that instruction stops.',
        suggestion: 'Look at the reported line and the line just above it for a missing semicolon.',
        line: 8,
      },
    },
  ])('returns only public diagnostic fields for $stderr', ({ stderr, expected }) => {
    const diagnostic = explainRunnerResult('cpp', 'compile_error', stderr, null)

    expect(diagnostic).toEqual(expected)
    expect(Object.keys(diagnostic).sort()).toEqual([
      'explanation',
      'line',
      'suggestion',
      'title',
    ])
    expect(diagnostic).not.toHaveProperty('pattern')
  })

  it('does not blame the learner for infrastructure failures', () => {
    expect(explainRunnerResult('java', 'system_error', '', null).explanation)
      .toContain('service problem')
  })

  it('explains safety stops without system measurements or security jargon', () => {
    const result = explainRunnerResult('python', 'limit_exceeded', 'main.py:7: stopped', 'memory')

    expect(result).toMatchObject({
      title: 'The code checker stopped the program',
      explanation: 'The program tried to use too much memory for one check.',
      line: 7,
    })
    expect(`${result.title} ${result.explanation} ${result.suggestion}`)
      .not.toMatch(/sandbox|MiB|diagnostic output|runaway/iu)
  })

  it('describes a successful check without exposing security implementation details', () => {
    const result = explainRunnerResult('cpp', 'completed', '', null)

    expect(result).toMatchObject({
      title: 'The program ran',
      explanation: 'The code checker ran your code and collected what it printed.',
    })
    expect(`${result.title} ${result.explanation} ${result.suggestion}`)
      .not.toMatch(/sandbox|isolated|compiler|interpreter/iu)
  })
})
