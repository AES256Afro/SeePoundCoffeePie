import { describe, expect, it } from 'vitest'
import { explainRunnerResult, sanitizeRunnerOutput } from './runner-diagnostics'

describe('beginner runner diagnostics', () => {
  it('removes terminal instructions and host paths from raw diagnostics', () => {
    expect(sanitizeRunnerOutput('\u001b[31m/workspace/mission.cpp:3: error\u001b[0m'))
      .toBe('mission.cpp:3: error')
  })

  it('explains common language errors without replacing the raw message', () => {
    expect(explainRunnerResult('python', 'compile_error', 'mission.py, line 2\nSyntaxError: invalid syntax', null))
      .toMatchObject({
        title: 'Python could not read one instruction',
        line: 2,
      })

    expect(explainRunnerResult('csharp', 'compile_error', 'Program.cs(4,1): error CS1002: ; expected', null).title)
      .toBe('C# expected a semicolon')
  })

  it('does not blame the learner for infrastructure failures', () => {
    expect(explainRunnerResult('java', 'system_error', '', null).explanation)
      .toContain('infrastructure failure')
  })
})
