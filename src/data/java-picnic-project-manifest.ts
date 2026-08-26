import type { GuidedProjectCheckpointManifest, GuidedProjectManifest } from './project-types'

/**
 * Small, public project index used by navigation and learner records.
 * The full teaching copy loads only when a learner opens the project studio.
 */
export const javaPicnicProjectManifest = {
  id: 'picnic-planner',
  language: 'java',
  title: 'Community Picnic Planner',
  subtitle: 'Build a friendly picnic plan that asks, decides, lists supplies, and prints one reusable summary.',
  description:
    'This project turns familiar Java pieces into a useful picnic helper. The learner follows a .java file through javac and the JVM, collects two answers with Scanner, makes a table decision, visits an array, and calls a static summary method.',
  outcome:
    'By the end, the learner can explain how javac turns Java source into bytecode for the JVM, read complete console lines with Scanner, parse a whole number, choose with if and else, visit an array with an enhanced for loop, and pass arguments into a static method.',
  duration: '50-70 minutes',
  route: '/projects/java/picnic-planner',
  studioLabel: 'Java project studio',
  sourcePrivacyLabel: 'Source stays in this browser',
  downloadFileName: 'Main.java',
  downloadLabel: 'downloadable .java source file',
  prerequisiteTitle: 'Finish Java Foundations, then plan a community picnic.',
  prerequisiteDescription:
    'You can preview every checkpoint below now. The editor unlocks after the six foundation modules introduce the Java shapes this project retrieves and connects.',
  overviewTitle: 'A picnic helper that listens, decides, packs, and shares',
  overviewSteps: [
    { title: 'Ask', description: 'Read an organizer name and guest count as complete console lines.' },
    { title: 'Decide', description: 'Choose a small or large table from the stored guest count.' },
    { title: 'Pack', description: 'Visit every item in the picnic supply array with one enhanced for loop.' },
    { title: 'Share', description: 'Pass the organizer details into a reusable static summary method.' },
  ],
  completionDescription:
    'Your Community Picnic Planner is complete. Reopen a checkpoint, download Main.java again, or explain how each answer reaches the table choice and final summary.',
  checkpoints: [
    { id: 'project-java-build-path', order: 1, title: 'Follow Java from source to picnic', conceptId: 'project-java-compile-run-cycle', xp: 8 },
    { id: 'project-java-output', order: 2, title: 'Welcome the organizer', conceptId: 'project-java-console-output', xp: 10 },
    { id: 'project-java-name-input', order: 3, title: 'Read a complete name', conceptId: 'project-java-scanner-line-input', xp: 14 },
    { id: 'project-java-number-input', order: 4, title: 'Turn guest digits into a number', conceptId: 'project-java-integer-parsing', xp: 16 },
    { id: 'project-java-summary-line', order: 5, title: 'Print a personal picnic summary', conceptId: 'project-java-string-concatenation', xp: 16 },
    { id: 'project-java-array', order: 6, title: 'Store the picnic supplies', conceptId: 'project-java-string-array', xp: 16 },
    { id: 'project-java-table', order: 7, title: 'Choose the table size', conceptId: 'project-java-if-else', xp: 18 },
    { id: 'project-java-foreach', order: 8, title: 'List every supply', conceptId: 'project-java-enhanced-for', xp: 18 },
    { id: 'project-java-method', order: 9, title: 'Package the picnic summary', conceptId: 'project-java-static-method-parameters', xp: 20 },
    { id: 'project-java-order', order: 10, title: 'Put the picnic workflow in order', conceptId: 'project-java-program-order', xp: 20 },
    { id: 'project-java-assembly', order: 11, title: 'Connect the picnic helper', conceptId: 'project-java-assembly', xp: 26 },
    { id: 'project-java-final', order: 12, title: 'Plan the Community Picnic', conceptId: 'project-java-final-picnic-planner', xp: 40 },
  ] satisfies GuidedProjectCheckpointManifest[],
} as const satisfies GuidedProjectManifest
