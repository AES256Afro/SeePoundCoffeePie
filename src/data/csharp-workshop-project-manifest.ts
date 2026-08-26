import type { GuidedProjectCheckpointManifest, GuidedProjectManifest } from './project-types'

/**
 * Small, public project index used by navigation and learner records.
 * The full teaching copy loads only when a learner opens the project studio.
 */
export const csharpWorkshopProjectManifest = {
  id: 'workshop-check-in',
  language: 'csharp',
  title: 'Community Workshop Check-In',
  subtitle: 'Build a welcoming check-in program that asks, decides, lists available areas, and prints a visitor badge.',
  description:
    'This project turns familiar C# pieces into a useful front-desk program. The learner follows source through .NET, collects two answers, makes an access decision, visits an array with a loop, and calls a reusable badge method.',
  outcome:
    'By the end, the learner can explain how .NET builds and runs C# source, read console input safely, parse a whole number, choose with if and else, visit an array with foreach, and pass values into a method.',
  duration: '45-65 minutes',
  route: '/projects/csharp/workshop-check-in',
  studioLabel: 'C# project studio',
  sourcePrivacyLabel: 'Source stays in this browser',
  downloadFileName: 'community-workshop-check-in.cs',
  downloadLabel: 'downloadable C# source file',
  prerequisiteTitle: 'Finish C# Foundations, then run the community welcome desk.',
  prerequisiteDescription:
    'You can preview every checkpoint below now. The editor unlocks after the six foundation modules introduce the C# shapes this project retrieves and connects.',
  overviewTitle: 'A check-in desk that listens, decides, repeats, and welcomes',
  overviewSteps: [
    { title: 'Ask', description: 'Read a visitor name and completed visit count from the console.' },
    { title: 'Decide', description: 'Choose member or guest access from the stored visit count.' },
    { title: 'List', description: 'Visit each available workshop area with one foreach loop.' },
    { title: 'Welcome', description: 'Pass the visitor details into a reusable badge method.' },
  ],
  completionDescription:
    'Your Community Workshop Check-In is complete. Reopen a checkpoint, download the C# source again, or explain how each stored value reaches the final badge.',
  checkpoints: [
    { id: 'project-csharp-dotnet-path', order: 1, title: 'Follow C# from source to screen', conceptId: 'project-csharp-dotnet-build-run', xp: 8 },
    { id: 'project-csharp-output', order: 2, title: 'Write a welcome line', conceptId: 'project-csharp-console-output', xp: 10 },
    { id: 'project-csharp-name-input', order: 3, title: 'Read a name safely', conceptId: 'project-csharp-readline-fallback', xp: 14 },
    { id: 'project-csharp-number-input', order: 4, title: 'Turn typed digits into a number', conceptId: 'project-csharp-integer-parsing', xp: 16 },
    { id: 'project-csharp-interpolation', order: 5, title: 'Print a personal badge', conceptId: 'project-csharp-string-interpolation', xp: 16 },
    { id: 'project-csharp-array', order: 6, title: 'Store the workshop areas', conceptId: 'project-csharp-string-array', xp: 16 },
    { id: 'project-csharp-access', order: 7, title: 'Choose member or guest access', conceptId: 'project-csharp-if-else', xp: 18 },
    { id: 'project-csharp-foreach', order: 8, title: 'List every open area', conceptId: 'project-csharp-foreach', xp: 18 },
    { id: 'project-csharp-method', order: 9, title: 'Package the badge printer', conceptId: 'project-csharp-method-parameters', xp: 20 },
    { id: 'project-csharp-order', order: 10, title: 'Put the desk workflow in order', conceptId: 'project-csharp-program-order', xp: 20 },
    { id: 'project-csharp-assembly', order: 11, title: 'Connect the check-in desk', conceptId: 'project-csharp-assembly', xp: 26 },
    { id: 'project-csharp-final', order: 12, title: 'Open the Community Workshop', conceptId: 'project-csharp-final-check-in', xp: 40 },
  ] satisfies GuidedProjectCheckpointManifest[],
} as const satisfies GuidedProjectManifest
