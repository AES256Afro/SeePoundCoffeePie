import type { EvaluationResult, Exercise } from '../types'

export interface ExerciseCheckResult {
  passed: boolean
  message: string
}

export function evaluateExerciseChecks(
  exercise: Pick<Exercise, 'checks'>,
  answer: string,
): ExerciseCheckResult[] {
  return (exercise.checks ?? []).map((check) => ({
    passed: new RegExp(check.pattern, check.flags).test(answer),
    message: check.message,
  }))
}

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

  const failedCheck = evaluateExerciseChecks(exercise, answer).find((check) => !check.passed)
  if (failedCheck) {
    return { correct: false, message: failedCheck.message }
  }

  return {
    correct: true,
    message: exercise.recap,
    output: exercise.output,
  }
}
