import type { GuidedProjectCheckpointManifest, GuidedProjectManifest } from './project-types'

export type PythonProjectCheckpointManifest = GuidedProjectCheckpointManifest

/**
 * Small, public project index used by navigation and learner records.
 * The full teaching copy loads only when a learner opens the project studio.
 */
export const pythonInteractiveProjectManifest = {
  id: 'first-interactive-program',
  language: 'python',
  title: 'Your First Interactive Program',
  subtitle: 'Build a coffee order calculator that listens, remembers, calculates, and replies.',
  description:
    'You start with one familiar line and grow it into a complete interactive Python program. Each step explains the new pieces before asking you to use them.',
  outcome:
    'By the end, you can explain how input becomes stored text, convert that text to an integer, calculate a total, and report the result with an f-string.',
  duration: '35-50 minutes',
  route: '/projects/python/first-interactive-program',
  studioLabel: 'Python project',
  sourcePrivacyLabel: 'Code stays in this browser',
  downloadFileName: 'coffee-counter.py',
  downloadLabel: 'downloadable Python file',
  prerequisiteTitle: 'Complete Python Foundations to start this project.',
  prerequisiteDescription:
    'You can view the steps now. Complete Python Foundations to open the editor.',
  overviewTitle: 'A coffee counter that listens and calculates',
  overviewSteps: [
    { title: 'Ask', description: 'Collect a customer name and cup count with input.' },
    { title: 'Remember', description: 'Store those answers in clearly named variables.' },
    { title: 'Calculate', description: 'Convert the count and multiply it by the price.' },
    { title: 'Reply', description: 'Build a personal receipt with an f-string.' },
  ],
  completionDescription:
    'Your Coffee Counter is complete. Reopen any step, download the program again, or explain how each piece works.',
  checkpoints: [
    { id: 'project-py-print', order: 1, title: 'Let the program speak', conceptId: 'project-python-print', xp: 8 },
    { id: 'project-py-string', order: 2, title: 'Recognize the text', conceptId: 'project-python-strings', xp: 8 },
    { id: 'project-py-variable', order: 3, title: 'Give a value a name', conceptId: 'project-python-variables', xp: 10 },
    { id: 'project-py-integer', order: 4, title: 'Store a whole number', conceptId: 'project-python-integers', xp: 10 },
    { id: 'project-py-arithmetic', order: 5, title: 'Calculate an order total', conceptId: 'project-python-arithmetic', xp: 14 },
    { id: 'project-py-input', order: 6, title: 'Ask the customer', conceptId: 'project-python-input', xp: 14 },
    { id: 'project-py-input-text', order: 7, title: 'Notice what input returns', conceptId: 'project-python-input-as-text', xp: 12 },
    { id: 'project-py-conversion', order: 8, title: 'Convert the typed count', conceptId: 'project-python-int-conversion', xp: 18 },
    { id: 'project-py-f-string', order: 9, title: 'Write a personal report', conceptId: 'project-python-f-strings', xp: 18 },
    { id: 'project-py-traceback', order: 10, title: 'Read your first traceback', conceptId: 'project-python-traceback', xp: 20 },
    { id: 'project-py-assembly', order: 11, title: 'Connect the pieces', conceptId: 'project-python-assembly', xp: 24 },
    { id: 'project-py-final', order: 12, title: 'Build the Coffee Counter', conceptId: 'project-python-final-interactive-program', xp: 40 },
  ] satisfies GuidedProjectCheckpointManifest[],
} as const satisfies GuidedProjectManifest
