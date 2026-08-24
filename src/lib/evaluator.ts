import type { EvaluationResult, Exercise } from '../types'

export function evaluateExercise(exercise: Exercise, answer: string): EvaluationResult {
  if (exercise.type === 'choice') {
    if (!answer) {
      return { correct: false, message: 'Choose one answer before checking it.' }
    }

    const correct = answer === exercise.correctChoice
    return {
      correct,
      message: correct
        ? exercise.recap
        : 'That answer does not match the console’s job. Read the explanation once more and try again.',
    }
  }

  if (!answer.trim()) {
    return { correct: false, message: 'The editor is empty. Add your instruction, then run the check.' }
  }

  for (const check of exercise.checks ?? []) {
    const expression = new RegExp(check.pattern, check.flags)
    if (!expression.test(answer)) {
      return { correct: false, message: check.message }
    }
  }

  return {
    correct: true,
    message: exercise.recap,
    output: exercise.output,
  }
}
