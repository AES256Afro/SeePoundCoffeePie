import type { GuidedProjectCheckpointManifest, GuidedProjectManifest } from './project-types'

/**
 * Small, public project index used by navigation and learner records.
 * The full teaching copy loads only when a learner opens the project studio.
 */
export const cppCompiledProjectManifest = {
  id: 'first-compiled-program',
  language: 'cpp',
  title: 'Your First Compiled Program',
  subtitle: 'Build an observation scorecard that compiles, asks two questions, calculates focus points, and reports what it saw.',
  description:
    'This project opens the C++ build process one piece at a time. You follow source code through the compiler, read a first error, collect typed input, and connect the pieces into a complete Observation Desk program.',
  outcome:
    'By the end, you can explain how C++ source becomes a running program, recognize the main frame, read a basic compiler error, collect text and numeric input, calculate with typed variables, and build a console report.',
  duration: '40-60 minutes',
  route: '/projects/cpp/first-compiled-program',
  studioLabel: 'C++ project',
  sourcePrivacyLabel: 'Code stays in this browser',
  downloadFileName: 'observation-desk.cpp',
  downloadLabel: 'downloadable C++ source file',
  prerequisiteTitle: 'Complete C++ Foundations to start this project.',
  prerequisiteDescription:
    'You can view the steps now. Complete C++ Foundations to open the editor.',
  overviewTitle: 'An observation desk that compiles, listens, and calculates',
  overviewSteps: [
    { title: 'Compile', description: 'See how human-readable source becomes a program the computer can run.' },
    { title: 'Ask', description: 'Read a full observer name and a whole-number detail count.' },
    { title: 'Calculate', description: 'Multiply the detail count by a fixed focus-point value.' },
    { title: 'Report', description: 'Chain text and typed values into one personal observation summary.' },
  ],
  completionDescription:
    'Your Observation Desk is complete. Reopen any step, download the C++ source again, or explain what the compiler does before main begins.',
  checkpoints: [
    { id: 'project-cpp-compiler-path', order: 1, title: 'Turn source into a program', conceptId: 'project-cpp-compile-run-cycle', xp: 8 },
    { id: 'project-cpp-program-frame', order: 2, title: 'Find the starting doorway', conceptId: 'project-cpp-program-frame', xp: 8 },
    { id: 'project-cpp-output', order: 3, title: 'Send one clear line', conceptId: 'project-cpp-console-output', xp: 12 },
    { id: 'project-cpp-semicolon', order: 4, title: 'Read your first compiler message', conceptId: 'project-cpp-compile-diagnostic', xp: 14 },
    { id: 'project-cpp-string', order: 5, title: "Store the observer's name", conceptId: 'project-cpp-string-declaration', xp: 14 },
    { id: 'project-cpp-integer', order: 6, title: 'Store a whole-number rule', conceptId: 'project-cpp-integer-declaration', xp: 14 },
    { id: 'project-cpp-arithmetic', order: 7, title: 'Calculate focus points', conceptId: 'project-cpp-arithmetic', xp: 16 },
    { id: 'project-cpp-line-input', order: 8, title: 'Read a full name', conceptId: 'project-cpp-getline-input', xp: 18 },
    { id: 'project-cpp-number-input', order: 9, title: 'Read a number', conceptId: 'project-cpp-stream-extraction', xp: 18 },
    { id: 'project-cpp-report', order: 10, title: 'Build the observation report', conceptId: 'project-cpp-output-chain', xp: 20 },
    { id: 'project-cpp-assembly', order: 11, title: 'Connect the pieces', conceptId: 'project-cpp-assembly', xp: 24 },
    { id: 'project-cpp-final', order: 12, title: 'Build the Observation Desk', conceptId: 'project-cpp-final-compiled-program', xp: 40 },
  ] satisfies GuidedProjectCheckpointManifest[],
} as const satisfies GuidedProjectManifest
