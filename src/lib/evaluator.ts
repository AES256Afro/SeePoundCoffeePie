import type { EvaluationResult, Exercise } from '../types'

export function evaluateExercise(exercise: Exercise, answer: string): EvaluationResult {
  if (exercise.type === 'choice' || exercise.type === 'prediction') {
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

  if (exercise.type === 'ordering') {
    const order = answer.split('|').filter(Boolean)
    if (!order.length) {
      return { correct: false, message: 'Move the code pieces into an order before checking them.' }
    }

    const correct = order.length === exercise.correctOrder?.length
      && order.every((id, index) => id === exercise.correctOrder?.[index])
    return {
      correct,
      message: correct
        ? exercise.recap
        : exercise.incorrectMessage ?? 'The computer reads these pieces from top to bottom. Follow the condition first, then each possible route.',
      output: correct ? exercise.output : undefined,
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
