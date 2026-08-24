import type { EvaluationResult, Exercise } from '../types'

export function evaluateExercise(exercise: Exercise, answer: string): EvaluationResult {
  if (exercise.type === 'choice') {
    if (!answer) {
      return { correct: false, message: 'Choose one answer before checking it.' }
    }

    const correct = answer === exercise.correctChoice
    const selectedChoice = exercise.choices?.find((choice) => choice.id === answer)
    return {
      correct,
      message: correct
        ? exercise.recap
        : `${selectedChoice?.detail ?? 'That answer does not match the concept being taught.'} Reread the explanation above and try once more.`,
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
