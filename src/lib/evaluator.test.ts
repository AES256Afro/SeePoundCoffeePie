import { describe, expect, it } from 'vitest'
import { findExercise } from '../data/curriculum'
import { evaluateExercise } from './evaluator'

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
})
