import type { Exercise, LanguageId, LanguageTrack, Mission } from '../types'

const pythonExercises: Exercise[] = [
  {
    id: 'py-console',
    conceptId: 'python-console',
    eyebrow: 'Orientation 1 of 5',
    title: 'Meet the console',
    explanation:
      'A program is a list of instructions for a computer. The console is the text window where your program can report what it did.',
    analogy:
      'Think of it as the ship intercom. Your code speaks, and the console lets the crew hear it.',
    type: 'choice',
    prompt: 'What job does the console do in this mission?',
    choices: [
      { id: 'a', label: 'Shows text from the program', detail: 'A place to see the program speak.' },
      { id: 'b', label: 'Repairs the ship automatically', detail: 'Useful, but code has to tell it how.' },
      { id: 'c', label: 'Stores every file forever', detail: 'That would be storage, not the console.' },
    ],
    correctChoice: 'a',
    hint: 'Look for the answer that describes a text window.',
    recap: 'The console displays text and other information produced by your program.',
    xp: 8,
  },
  {
    id: 'py-print',
    conceptId: 'python-print',
    eyebrow: 'Transmission 2 of 5',
    title: 'Send your first signal',
    explanation:
      'Python uses the print command to place text in the console. Text goes inside quotation marks so Python knows it is a message, not another instruction.',
    analogy:
      'The word print opens the comm channel. The quoted words are the message traveling through it.',
    type: 'code',
    prompt: 'Replace the blank with a command that displays Signal online.',
    starterCode: '# Tell the bridge our signal is ready\n_____("Signal online")',
    checks: [
      { pattern: 'print\\s*\\(\\s*["\\\']Signal online["\\\']\\s*\\)', message: 'Use print, then put the exact message inside parentheses.' },
    ],
    output: 'Signal online',
    hint: 'The command is print("Signal online"). Type it exactly, including the parentheses.',
    recap: 'Use print("message") whenever a Python program needs to display text.',
    xp: 12,
  },
  {
    id: 'py-string',
    conceptId: 'python-variables',
    eyebrow: 'Cargo label 3 of 5',
    title: 'Name the survey ship',
    explanation:
      'A variable is a labeled container in the computer’s memory. You choose the label, then store a value after an equals sign.',
    analogy:
      'A cargo locker labeled ship_name can hold the text Wayfarer. The label helps you find that value again.',
    type: 'code',
    prompt: 'Create a variable named ship_name and store the text Wayfarer in it.',
    starterCode: '# Store the ship name below\nship_name = _____\n\nprint(ship_name)',
    checks: [
      { pattern: 'ship_name\\s*=\\s*["\\\']Wayfarer["\\\']', message: 'Put the text "Wayfarer" after the equals sign. Text needs quotation marks.' },
      { pattern: 'print\\s*\\(\\s*ship_name\\s*\\)', message: 'Keep print(ship_name) so the simulator can inspect the locker.' },
    ],
    output: 'Wayfarer',
    hint: 'A complete assignment looks like ship_name = "Wayfarer".',
    recap: 'A text value is called a string. Python strings can use double or single quotation marks.',
    xp: 14,
  },
  {
    id: 'py-number',
    conceptId: 'python-variables',
    eyebrow: 'Supply count 4 of 5',
    title: 'Count the power cells',
    explanation:
      'Variables can hold numbers too. Whole numbers are called integers. Unlike text, an integer does not use quotation marks.',
    analogy:
      'A crate label might say power_cells, while the number 3 tells the quartermaster exactly how many are inside.',
    type: 'code',
    prompt: 'Store the number 3 in a variable named power_cells.',
    starterCode: '# Numbers do not need quotation marks\npower_cells = _____\n\nprint(power_cells)',
    checks: [
      { pattern: 'power_cells\\s*=\\s*3(?:\\s|$)', message: 'Assign the number 3 to power_cells without quotation marks.' },
      { pattern: 'print\\s*\\(\\s*power_cells\\s*\\)', message: 'Keep print(power_cells) so the count reaches the bridge.' },
    ],
    output: '3',
    hint: 'Write power_cells = 3. A number is not surrounded by quotation marks.',
    recap: 'An integer is a whole number. Python can store it directly in a variable.',
    xp: 14,
  },
  {
    id: 'py-launch',
    conceptId: 'python-output-and-variables',
    eyebrow: 'Bridge check 5 of 5',
    title: 'Complete the departure report',
    explanation:
      'Now combine the ideas. Store two values, then report them. Programmers build larger systems by joining small instructions that each make sense.',
    analogy:
      'This is your first captain’s log: identify the ship, count its supplies, and send both facts to the bridge.',
    type: 'code',
    prompt: 'Replace both blanks. The report must display the ship name and cell count.',
    starterCode: 'ship_name = "Wayfarer"\npower_cells = 3\n\nprint("Ship:", _____)\nprint("Cells:", _____)',
    checks: [
      { pattern: 'print\\s*\\(\\s*["\\\']Ship:["\\\']\\s*,\\s*ship_name\\s*\\)', message: 'Use ship_name in the first print command.' },
      { pattern: 'print\\s*\\(\\s*["\\\']Cells:["\\\']\\s*,\\s*power_cells\\s*\\)', message: 'Use power_cells in the second print command.' },
    ],
    output: 'Ship: Wayfarer\nCells: 3',
    hint: 'The blanks need the variable labels ship_name and power_cells, not their values.',
    recap: 'You can reuse a variable by writing its name. Python reads the value stored under that label.',
    xp: 22,
  },
]

const cppExercises: Exercise[] = [
  {
    id: 'cpp-compiler',
    conceptId: 'cpp-compiler',
    eyebrow: 'Reactor school 1 of 5',
    title: 'Meet the compiler',
    explanation:
      'C++ code is translated by a compiler before the computer runs it. The compiler checks the structure and turns your instructions into a form the machine understands.',
    analogy:
      'You write an engineering order. The compiler translates it into the reactor’s precise control signals.',
    type: 'choice',
    prompt: 'What does a C++ compiler do?',
    choices: [
      { id: 'a', label: 'Translates code for the machine', detail: 'It also catches many structural mistakes.' },
      { id: 'b', label: 'Draws the user interface', detail: 'A program can draw a UI, but that is not the compiler’s job.' },
      { id: 'c', label: 'Invents the program for you', detail: 'You remain the engineer.' },
    ],
    correctChoice: 'a',
    hint: 'Think about the translator between your instructions and the computer.',
    recap: 'A compiler checks and translates C++ source code before it runs.',
    xp: 8,
  },
  {
    id: 'cpp-output',
    conceptId: 'cpp-output',
    eyebrow: 'Status line 2 of 5',
    title: 'Wake the reactor',
    explanation:
      'C++ sends text to the console with std::cout. The << symbols point the message toward the console, and a semicolon ends the instruction.',
    analogy:
      'std::cout is the status display. The arrows route a message into it, while the semicolon closes the work order.',
    type: 'code',
    prompt: 'Complete the instruction so the reactor reports Reactor online.',
    starterCode: '#include <iostream>\n\nint main() {\n    _____ << "Reactor online";\n    return 0;\n}',
    checks: [
      { pattern: 'std::cout\\s*<<\\s*"Reactor online"\\s*;', message: 'Use std::cout, the << symbols, the message, and a final semicolon.' },
    ],
    output: 'Reactor online',
    hint: 'The full line is std::cout << "Reactor online";',
    recap: 'C++ statements usually end with a semicolon. std::cout displays console output.',
    xp: 12,
  },
  {
    id: 'cpp-string',
    conceptId: 'cpp-variables',
    eyebrow: 'Core registry 3 of 5',
    title: 'Name the rune core',
    explanation:
      'C++ asks you to state what kind of value a variable will hold. std::string means text, followed by the variable name and its value.',
    analogy:
      'Before using a storage bay, engineering marks both its cargo type and its label: text cargo, core_name bay.',
    type: 'code',
    prompt: 'Create a text variable named core_name with the value Ember.',
    starterCode: '#include <iostream>\n#include <string>\n\nint main() {\n    std::string core_name = _____;\n    std::cout << core_name;\n    return 0;\n}',
    checks: [
      { pattern: 'std::string\\s+core_name\\s*=\\s*"Ember"\\s*;', message: 'Place "Ember" after the equals sign and keep the semicolon.' },
    ],
    output: 'Ember',
    hint: 'The assignment is std::string core_name = "Ember";',
    recap: 'C++ variable declarations include a type, a name, a value, and a semicolon.',
    xp: 14,
  },
  {
    id: 'cpp-number',
    conceptId: 'cpp-variables',
    eyebrow: 'Charge test 4 of 5',
    title: 'Set the reactor charge',
    explanation:
      'The int type stores whole numbers. Giving every variable a type helps C++ know how that value can be used.',
    analogy:
      'The reactor console reserves a numeric gauge for charge. It would reject a ship name because that is the wrong cargo type.',
    type: 'code',
    prompt: 'Declare an integer named charge and set it to 80.',
    starterCode: '#include <iostream>\n\nint main() {\n    _____ charge = 80;\n    std::cout << charge;\n    return 0;\n}',
    checks: [
      { pattern: 'int\\s+charge\\s*=\\s*80\\s*;', message: 'Use the int type before the variable named charge.' },
    ],
    output: '80',
    hint: 'A whole-number declaration begins with int: int charge = 80;',
    recap: 'Use int for whole numbers such as counts, levels, and scores.',
    xp: 14,
  },
  {
    id: 'cpp-reactor-report',
    conceptId: 'cpp-output-and-variables',
    eyebrow: 'Ignition check 5 of 5',
    title: 'File the reactor report',
    explanation:
      'A useful program combines stored data and output. You can chain several values into std::cout with more << symbols.',
    analogy:
      'Each << is another section of conduit, routing labels and live readings onto one bridge display.',
    type: 'code',
    prompt: 'Use both variables to produce Core: Ember | Charge: 80.',
    starterCode: '#include <iostream>\n#include <string>\n\nint main() {\n    std::string core_name = "Ember";\n    int charge = 80;\n\n    std::cout << "Core: " << _____\n              << " | Charge: " << _____;\n    return 0;\n}',
    checks: [
      { pattern: '<<\\s*core_name\\s*<<', message: 'Route the core_name variable between the two text sections.' },
      { pattern: '<<\\s*charge\\s*;', message: 'Route the charge variable at the end, before the semicolon.' },
    ],
    output: 'Core: Ember | Charge: 80',
    hint: 'The first blank is core_name. The second blank is charge.',
    recap: 'Chain text and variables with << to build a C++ console report.',
    xp: 22,
  },
]

const csharpExercises: Exercise[] = [
  {
    id: 'cs-dotnet',
    conceptId: 'csharp-runtime',
    eyebrow: 'Shield school 1 of 5',
    title: 'From order to action',
    explanation:
      'C# runs with .NET, a platform that supplies the runtime and useful building blocks. You write C# instructions, and .NET helps execute them on the computer.',
    analogy:
      '.NET is the ship infrastructure beneath your console. It carries your command to the right system.',
    type: 'choice',
    prompt: 'What does .NET provide for a C# program?',
    choices: [
      { id: 'a', label: 'A platform that runs the program', detail: 'It also includes many reusable libraries.' },
      { id: 'b', label: 'A replacement for every line of code', detail: 'You still write the program’s instructions.' },
      { id: 'c', label: 'Only a paint color', detail: 'The name contains a dot, but it is a software platform.' },
    ],
    correctChoice: 'a',
    hint: 'Choose the answer describing the system beneath a C# program.',
    recap: 'C# works with .NET, which provides a runtime and reusable libraries.',
    xp: 8,
  },
  {
    id: 'cs-output',
    conceptId: 'csharp-output',
    eyebrow: 'Status line 2 of 5',
    title: 'Raise the shields',
    explanation:
      'C# displays a line of text with Console.WriteLine. Parentheses hold the message, quotation marks identify text, and a semicolon ends the instruction.',
    analogy:
      'Console.WriteLine opens the tactical display, posts one complete status line, and then moves to the next row.',
    type: 'code',
    prompt: 'Complete the command so the console displays Shields online.',
    starterCode: '_____("Shields online");',
    checks: [
      { pattern: 'Console\\.WriteLine\\s*\\(\\s*"Shields online"\\s*\\)\\s*;', message: 'Use Console.WriteLine with parentheses and a final semicolon.' },
    ],
    output: 'Shields online',
    hint: 'The complete command is Console.WriteLine("Shields online");',
    recap: 'Console.WriteLine displays a line of text in a C# console program.',
    xp: 12,
  },
  {
    id: 'cs-string',
    conceptId: 'csharp-variables',
    eyebrow: 'Shield registry 3 of 5',
    title: 'Name the shield array',
    explanation:
      'C# variables have a type. The string type stores text. It comes before your variable name so C# knows what belongs in that container.',
    analogy:
      'The array registry needs two labels: the cargo type is string, and the locker name is shieldName.',
    type: 'code',
    prompt: 'Create a string named shieldName and store Aegis in it.',
    starterCode: 'string shieldName = _____;\n\nConsole.WriteLine(shieldName);',
    checks: [
      { pattern: 'string\\s+shieldName\\s*=\\s*"Aegis"\\s*;', message: 'Put the quoted text "Aegis" after the equals sign.' },
    ],
    output: 'Aegis',
    hint: 'The declaration is string shieldName = "Aegis";',
    recap: 'A C# text variable starts with the string type and ends with a semicolon.',
    xp: 14,
  },
  {
    id: 'cs-number',
    conceptId: 'csharp-variables',
    eyebrow: 'Power test 4 of 5',
    title: 'Set shield strength',
    explanation:
      'The int type stores whole numbers in C#. Number values do not need quotation marks.',
    analogy:
      'Shield strength is a numeric dial, so its container is marked int instead of string.',
    type: 'code',
    prompt: 'Declare an integer named strength and set it to 100.',
    starterCode: '_____ strength = 100;\n\nConsole.WriteLine(strength);',
    checks: [
      { pattern: 'int\\s+strength\\s*=\\s*100\\s*;', message: 'Use the int type before the variable named strength.' },
    ],
    output: '100',
    hint: 'A whole-number declaration begins with int: int strength = 100;',
    recap: 'Use int for whole-number values in C#.',
    xp: 14,
  },
  {
    id: 'cs-shield-report',
    conceptId: 'csharp-output-and-variables',
    eyebrow: 'Tactical check 5 of 5',
    title: 'Complete the shield report',
    explanation:
      'C# can place variables directly inside text with string interpolation. Start the text with $, then wrap each variable name in braces.',
    analogy:
      'The $ marks a smart report template. Each pair of braces is a live gauge inserted into the sentence.',
    type: 'code',
    prompt: 'Fill both blanks so the report uses the stored name and strength.',
    starterCode: 'string shieldName = "Aegis";\nint strength = 100;\n\nConsole.WriteLine($"Shield: {_____} | Strength: {_____}");',
    checks: [
      { pattern: '\\{\\s*shieldName\\s*\\}', message: 'Put shieldName inside the first pair of braces.' },
      { pattern: '\\{\\s*strength\\s*\\}', message: 'Put strength inside the second pair of braces.' },
    ],
    output: 'Shield: Aegis | Strength: 100',
    hint: 'The first blank is shieldName. The second is strength.',
    recap: 'String interpolation inserts values with {variableName} inside text that begins with $.',
    xp: 22,
  },
]

const javaExercises: Exercise[] = [
  {
    id: 'java-jvm',
    conceptId: 'java-runtime',
    eyebrow: 'Galley systems 1 of 5',
    title: 'Meet the Java runtime',
    explanation:
      'Java source code is compiled into a portable form that the Java Virtual Machine, or JVM, can run. This helps the same program work on many kinds of computer.',
    analogy:
      'You write one galley recipe. The JVM is a universal kitchen station that knows how to prepare it aboard different ships.',
    type: 'choice',
    prompt: 'What is the JVM’s job in a Java program?',
    choices: [
      { id: 'a', label: 'Runs compiled Java instructions', detail: 'It provides a common system across many computers.' },
      { id: 'b', label: 'Only keeps coffee warm', detail: 'A critical duty, but Java can do quite a bit more.' },
      { id: 'c', label: 'Names every variable for you', detail: 'Programmers still choose clear variable names.' },
    ],
    correctChoice: 'a',
    hint: 'Look for the answer about running Java instructions on different computers.',
    recap: 'The JVM runs compiled Java instructions and helps Java programs stay portable.',
    xp: 8,
  },
  {
    id: 'java-output',
    conceptId: 'java-output',
    eyebrow: 'Galley report 2 of 5',
    title: 'Start the coffee protocol',
    explanation:
      'Java displays a line with System.out.println. The message goes in parentheses and quotation marks, then a semicolon closes the instruction.',
    analogy:
      'System.out.println sends one complete status note from the galley to the ship console.',
    type: 'code',
    prompt: 'Complete the command so the console displays Coffee online.',
    starterCode: 'public class Main {\n    public static void main(String[] args) {\n        _____("Coffee online");\n    }\n}',
    checks: [
      { pattern: 'System\\.out\\.println\\s*\\(\\s*"Coffee online"\\s*\\)\\s*;', message: 'Use System.out.println with parentheses and a final semicolon.' },
    ],
    output: 'Coffee online',
    hint: 'The full command is System.out.println("Coffee online");',
    recap: 'System.out.println displays one line of text in a Java console program.',
    xp: 12,
  },
  {
    id: 'java-string',
    conceptId: 'java-variables',
    eyebrow: 'Blend registry 3 of 5',
    title: 'Name the expedition blend',
    explanation:
      'Java variables have a type. String means text, followed by the variable name and the value you want to store.',
    analogy:
      'The galley canister has both a cargo type, String, and a useful label, blendName.',
    type: 'code',
    prompt: 'Create a String named blendName and store Nebula Roast in it.',
    starterCode: 'public class Main {\n    public static void main(String[] args) {\n        String blendName = _____;\n        System.out.println(blendName);\n    }\n}',
    checks: [
      { pattern: 'String\\s+blendName\\s*=\\s*"Nebula Roast"\\s*;', message: 'Put the quoted text "Nebula Roast" after the equals sign.' },
    ],
    output: 'Nebula Roast',
    hint: 'The declaration is String blendName = "Nebula Roast";',
    recap: 'A Java text variable uses the capitalized String type and ends with a semicolon.',
    xp: 14,
  },
  {
    id: 'java-number',
    conceptId: 'java-variables',
    eyebrow: 'Supply count 4 of 5',
    title: 'Count the coffee pods',
    explanation:
      'The int type stores whole numbers in Java. The number does not use quotation marks because it is numeric data, not text.',
    analogy:
      'A numeric inventory gauge stores the pod count. The label podCount makes its purpose obvious.',
    type: 'code',
    prompt: 'Declare an integer named podCount and set it to 12.',
    starterCode: 'public class Main {\n    public static void main(String[] args) {\n        _____ podCount = 12;\n        System.out.println(podCount);\n    }\n}',
    checks: [
      { pattern: 'int\\s+podCount\\s*=\\s*12\\s*;', message: 'Use the int type before the variable named podCount.' },
    ],
    output: '12',
    hint: 'A whole-number declaration begins with int: int podCount = 12;',
    recap: 'Java uses int for whole numbers such as counts, scores, and system levels.',
    xp: 14,
  },
  {
    id: 'java-galley-report',
    conceptId: 'java-output-and-variables',
    eyebrow: 'Morning watch 5 of 5',
    title: 'Complete the galley report',
    explanation:
      'Java joins text and variables with the + operator. This is called concatenation when the pieces form one text message.',
    analogy:
      'Each + couples another car onto the report train: a label, a stored value, another label, and another value.',
    type: 'code',
    prompt: 'Fill both blanks so the report uses the stored blend name and pod count.',
    starterCode: 'public class Main {\n    public static void main(String[] args) {\n        String blendName = "Nebula Roast";\n        int podCount = 12;\n\n        System.out.println("Blend: " + _____\n            + " | Pods: " + _____);\n    }\n}',
    checks: [
      { pattern: '\\+\\s*blendName', message: 'Join the blendName variable after the first + symbol.' },
      { pattern: '\\+\\s*podCount\\s*\\)', message: 'Join the podCount variable before the closing parenthesis.' },
    ],
    output: 'Blend: Nebula Roast | Pods: 12',
    hint: 'The first blank is blendName. The second blank is podCount.',
    recap: 'Use + to join text and stored values in a beginner Java console message.',
    xp: 22,
  },
]

const mission = (
  id: string,
  language: LanguageId,
  chapter: number,
  title: string,
  subtitle: string,
  description: string,
  icon: Mission['icon'],
  status: Mission['status'],
  exercises: Exercise[] = [],
): Mission => ({
  id,
  language,
  chapter,
  title,
  subtitle,
  description,
  duration: exercises.length ? '8 min' : 'Coming soon',
  icon,
  status,
  exercises,
})

export const tracks: LanguageTrack[] = [
  {
    id: 'python',
    name: 'Python Flight School',
    shortName: 'Python',
    role: 'Explorer path',
    description: 'The clearest first route into programming. Learn the ideas with gentle syntax.',
    accent: '#f2c14e',
    accentSoft: '#332c19',
    missions: [
      mission('py-first-spark', 'python', 1, 'First Spark', 'Wake the Wayfarer', 'Console output, text, numbers, and your first variables.', 'signal', 'available', pythonExercises),
      mission('py-signal-protocol', 'python', 2, 'Signal Protocol', 'Make decisions', 'Booleans and if statements route a mysterious transmission.', 'satellite', 'locked'),
      mission('py-cargo-logic', 'python', 3, 'Cargo Logic', 'Organize the hold', 'Lists keep a nearly unlimited cargo manifest under control.', 'package', 'locked'),
      mission('py-looping-orbit', 'python', 4, 'Looping Orbit', 'Repeat with purpose', 'Loops scan moons without repeating every command by hand.', 'terminal', 'locked'),
      mission('py-function-foundry', 'python', 5, 'Function Foundry', 'Build reusable tools', 'Functions turn a working idea into a dependable ship system.', 'shield', 'locked'),
      mission('py-void-wyrm', 'python', 6, 'The Void Wyrm', 'Captain trial', 'Combine your systems in a complete text adventure.', 'crown', 'locked'),
    ],
  },
  {
    id: 'cpp',
    name: 'C++ Engineering Corps',
    shortName: 'C++',
    role: 'Engineer path',
    description: 'Learn how high-performance programs are assembled, one explicit part at a time.',
    accent: '#79d6ff',
    accentSoft: '#15303a',
    missions: [
      mission('cpp-reactor', 'cpp', 1, 'Reactor Wake', 'Light the rune core', 'Compilers, output, types, and variables from an engine room in the dark.', 'signal', 'available', cppExercises),
      mission('cpp-hull-logic', 'cpp', 2, 'Hull Logic', 'Choose a repair route', 'Conditions help the damage-control system choose what happens next.', 'shield', 'locked'),
      mission('cpp-cargo-array', 'cpp', 3, 'Cargo Array', 'Count every crate', 'Arrays and loops process a full expedition manifest.', 'package', 'locked'),
      mission('cpp-command-functions', 'cpp', 4, 'Command Functions', 'Make tools reusable', 'Break a complicated repair procedure into clear operations.', 'terminal', 'locked'),
      mission('cpp-fleet-model', 'cpp', 5, 'Fleet Model', 'Design ship objects', 'Classes describe ships, shuttles, and eccentric maintenance drones.', 'satellite', 'locked'),
      mission('cpp-titan-forge', 'cpp', 6, 'Titan Forge', 'Engineer trial', 'Build a tactical simulator from the systems you mastered.', 'crown', 'locked'),
    ],
  },
  {
    id: 'csharp',
    name: 'C# Command Academy',
    shortName: 'C#',
    role: 'Captain path',
    description: 'Build structured programs and prepare for apps, services, and game development.',
    accent: '#cf9cff',
    accentSoft: '#2d1d39',
    missions: [
      mission('cs-shield', 'csharp', 1, 'Shield Handshake', 'Bring the Aegis online', '.NET, console output, types, variables, and a tactical report.', 'signal', 'available', csharpExercises),
      mission('cs-command-logic', 'csharp', 2, 'Command Logic', 'Choose under pressure', 'Conditions let your ship respond to changing situations.', 'shield', 'locked'),
      mission('cs-crew-roster', 'csharp', 3, 'Crew Roster', 'Manage the manifest', 'Collections organize specialists, familiars, and one suspicious goat.', 'package', 'locked'),
      mission('cs-patrol-loop', 'csharp', 4, 'Patrol Loop', 'Scan the frontier', 'Loops repeat sensor work without exhausting the ensigns.', 'satellite', 'locked'),
      mission('cs-object-fleet', 'csharp', 5, 'Object Fleet', 'Model a living ship', 'Classes and objects organize a growing command system.', 'terminal', 'locked'),
      mission('cs-captains-trial', 'csharp', 6, 'Captain’s Trial', 'Command simulation', 'Build a small encounter system with everything you learned.', 'crown', 'locked'),
    ],
  },
  {
    id: 'java',
    name: 'Java Systems Guild',
    shortName: 'Java',
    role: 'Builder path',
    description: 'Learn portable, structured programming through ship systems and dependable tools.',
    accent: '#ff936b',
    accentSoft: '#3a2118',
    missions: [
      mission('java-coffee-protocol', 'java', 1, 'Coffee Protocol', 'Wake the morning watch', 'The JVM, console output, types, variables, and an essential galley report.', 'signal', 'available', javaExercises),
      mission('java-routing-orders', 'java', 2, 'Routing Orders', 'Choose the right deck', 'Conditions send supplies to the places that need them.', 'satellite', 'locked'),
      mission('java-crew-array', 'java', 3, 'Crew Array', 'Organize the watch', 'Arrays and lists keep a growing crew manifest in order.', 'package', 'locked'),
      mission('java-repeat-brew', 'java', 4, 'Repeat Brew', 'Automate the routine', 'Loops repeat safe procedures without copying instructions.', 'terminal', 'locked'),
      mission('java-droid-blueprint', 'java', 5, 'Droid Blueprint', 'Model a helper', 'Classes and objects describe the ship’s tiny service droids.', 'shield', 'locked'),
      mission('java-nebula-trial', 'java', 6, 'Nebula Trial', 'Systems trial', 'Combine your tools into a complete expedition planner.', 'crown', 'locked'),
    ],
  },
]

export const trackById = (id: LanguageId) => tracks.find((track) => track.id === id) ?? tracks[0]

export const findExercise = (exerciseId: string) => {
  for (const track of tracks) {
    for (const currentMission of track.missions) {
      const exercise = currentMission.exercises.find((item) => item.id === exerciseId)
      if (exercise) return exercise
    }
  }
  return undefined
}
