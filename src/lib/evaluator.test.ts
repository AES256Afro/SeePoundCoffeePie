import { describe, expect, it } from 'vitest'
import { findExercise } from '../data/curriculum'
import { evaluateExercise } from './evaluator'
import type { Exercise } from '../types'

function exercise(id: string) {
  const found = findExercise(id)
  if (!found) throw new Error(`Missing test exercise: ${id}`)
  return found
}

describe('evaluateExercise', () => {
  it('accepts the correct orientation choice', () => {
    expect(evaluateExercise(exercise('py-console'), 'a').correct).toBe(true)
  })

  it('asks the learner to choose before checking', () => {
    expect(evaluateExercise(exercise('py-console'), '')).toEqual({
      correct: false,
      message: 'Choose one answer before checking it.',
    })
  })

  it('explains the selected misconception instead of naming the wrong lesson', () => {
    const result = evaluateExercise(exercise('java-jvm'), 'b')
    expect(result).toEqual({
      correct: false,
      message: 'A critical duty, but Java can do quite a bit more. Reread the explanation above and try once more.',
    })
    expect(result.message).not.toContain('console’s job')
  })

  it('accepts a valid Python print instruction', () => {
    expect(evaluateExercise(exercise('py-print'), 'print("Signal online")')).toMatchObject({
      correct: true,
      output: 'Signal online',
    })
  })

  it('explains a missing Python command', () => {
    const result = evaluateExercise(exercise('py-print'), 'println("Signal online")')
    expect(result.correct).toBe(false)
    expect(result.message).toContain('Use print')
  })

  it('accepts the first C++ output task', () => {
    const answer = '#include <iostream>\nint main() { std::cout << "Reactor online"; return 0; }'
    expect(evaluateExercise(exercise('cpp-output'), answer).correct).toBe(true)
  })

  it('accepts the first C# output task', () => {
    expect(evaluateExercise(exercise('cs-output'), 'Console.WriteLine("Shields online");').correct).toBe(true)
  })

  it('accepts the first Java output task', () => {
    const answer = 'public class Main { public static void main(String[] args) { System.out.println("Coffee online"); } }'
    expect(evaluateExercise(exercise('java-output'), answer).correct).toBe(true)
  })

  it('checks every required part of a final report', () => {
    const incomplete = 'ship_name = "Wayfarer"\npower_cells = 3\nprint("Ship:", ship_name)'
    const result = evaluateExercise(exercise('py-launch'), incomplete)
    expect(result.correct).toBe(false)
    expect(result.message).toContain('power_cells')
  })

  it('checks output predictions through the authored answer choices', () => {
    const prediction: Exercise = {
      id: 'test-prediction',
      conceptId: 'test-output',
      eyebrow: 'Test',
      title: 'Predict',
      explanation: 'Read from top to bottom.',
      analogy: 'Follow the signal.',
      type: 'prediction',
      prompt: 'What appears?',
      choices: [{ id: 'a', label: 'Online' }, { id: 'b', label: 'Offline', detail: 'That is not the stored message.' }],
      correctChoice: 'a',
      hint: 'Read the print line.',
      recap: 'The stored message appears.',
      xp: 5,
    }

    expect(evaluateExercise(prediction, 'a').correct).toBe(true)
    expect(evaluateExercise(prediction, 'b')).toMatchObject({
      correct: false,
      message: 'That is not the stored message. Reread the explanation above and try once more.',
    })
  })

  it('checks ordered code pieces exactly from top to bottom', () => {
    const ordering: Exercise = {
      id: 'test-ordering',
      conceptId: 'test-conditions',
      eyebrow: 'Test',
      title: 'Order',
      explanation: 'Conditions come before their indented work.',
      analogy: 'Open the hatch before walking through it.',
      type: 'ordering',
      prompt: 'Order the pieces.',
      orderItems: [{ id: 'body', code: '    print("Go")' }, { id: 'if', code: 'if ready:' }],
      correctOrder: ['if', 'body'],
      hint: 'The if line opens the route.',
      recap: 'The condition comes before its indented instruction.',
      xp: 5,
    }

    expect(evaluateExercise(ordering, 'body|if').correct).toBe(false)
    expect(evaluateExercise(ordering, 'if|body')).toMatchObject({ correct: true })
  })

  it('checks bug fixes with the same deterministic syntax rules as editable code', () => {
    const bugfix: Exercise = {
      id: 'test-bugfix',
      conceptId: 'test-comparison',
      eyebrow: 'Test',
      title: 'Repair',
      explanation: 'Two equals signs compare values.',
      analogy: 'Inspect instead of replacing.',
      type: 'bugfix',
      prompt: 'Repair the comparison.',
      starterCode: 'if power = 5:',
      checks: [{ pattern: 'if\\s+power\\s*==\\s*5\\s*:', message: 'Use == to compare the values.' }],
      hint: 'Replace = with ==.',
      recap: 'The comparison now asks a question.',
      xp: 5,
    }

    expect(evaluateExercise(bugfix, 'if power = 5:').correct).toBe(false)
    expect(evaluateExercise(bugfix, 'if power == 5:').correct).toBe(true)
  })
})
