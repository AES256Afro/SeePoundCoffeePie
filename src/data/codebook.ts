import type { LanguageId, LanguageTrack } from '../types'

export interface CodebookEntry {
  term: string
  plain: string
  ship: string
  keywords: string[]
  examples?: Partial<Record<LanguageId, string>>
  unlockAfter?: 1 | 2 | 3 | 4 | 5
}

export type ExampleState = 'unavailable' | 'locked' | 'unlocked'

export const codebookEntries: CodebookEntry[] = [
  {
    term: 'Program',
    plain: 'A sequence of instructions a computer follows.',
    ship: 'Like a flight plan, except every step must be precise.',
    keywords: ['instruction', 'application', 'code'],
    unlockAfter: 1,
    examples: {
      python: 'ship_name = "Wayfarer"\nprint(ship_name)',
      cpp: 'int charge = 80;\nstd::cout << charge;',
      csharp: 'int strength = 100;\nConsole.WriteLine(strength);',
      java: 'int podCount = 12;\nSystem.out.println(podCount);',
    },
  },
  {
    term: 'Instruction or statement',
    plain: 'One complete action written for the computer. A program is made from many small instructions.',
    ship: 'One line in a flight checklist, such as report the fuel level or open a channel.',
    keywords: ['line of code', 'statement', 'command', 'action', 'step'],
    unlockAfter: 1,
    examples: {
      python: 'print("Ready")',
      cpp: 'std::cout << "Ready";',
      csharp: 'Console.WriteLine("Ready");',
      java: 'System.out.println("Ready");',
    },
  },
  {
    term: 'Console',
    plain: 'A text area where a program can show messages and results.',
    ship: 'The program’s intercom and status display.',
    keywords: ['output', 'terminal', 'display', 'print'],
    unlockAfter: 1,
    examples: {
      python: 'print("Signal online")',
      cpp: 'std::cout << "Reactor online";',
      csharp: 'Console.WriteLine("Shields online");',
      java: 'System.out.println("Coffee online");',
    },
  },
  {
    term: 'Variable',
    plain: 'A named place that stores a value so you can use it later.',
    ship: 'A labeled cargo locker for one useful piece of information.',
    keywords: ['store', 'memory', 'assignment', 'label'],
    unlockAfter: 1,
    examples: {
      python: 'ship_name = "Wayfarer"',
      cpp: 'std::string core_name = "Ember";',
      csharp: 'string shieldName = "Aegis";',
      java: 'String blendName = "Nebula Roast";',
    },
  },
  {
    term: 'String',
    plain: 'A text value, usually surrounded by quotation marks.',
    ship: 'Words entered in the ship log, such as a vessel name.',
    keywords: ['text', 'quotes', 'characters'],
    unlockAfter: 1,
    examples: {
      python: 'message = "Signal online"',
      cpp: 'std::string message = "Reactor online";',
      csharp: 'string message = "Shields online";',
      java: 'String message = "Coffee online";',
    },
  },
  {
    term: 'Integer',
    plain: 'A whole number with no decimal part.',
    ship: 'A count of crew, power cells, shields, or very patient goats.',
    keywords: ['int', 'number', 'whole number', 'count'],
    unlockAfter: 1,
    examples: {
      python: 'power_cells = 3',
      cpp: 'int charge = 80;',
      csharp: 'int strength = 100;',
      java: 'int podCount = 12;',
    },
  },
  {
    term: 'Value',
    plain: 'A piece of information a program can store or use, such as text, a number, or true and false.',
    ship: 'The actual cargo inside a labeled locker, not the locker label itself.',
    keywords: ['data', 'information', 'stored', 'text', 'number'],
    unlockAfter: 1,
    examples: {
      python: '"Wayfarer"  # a text value\n3  # a number value',
      cpp: '"Ember"  // a text value\n80  // a number value',
      csharp: '"Aegis"  // a text value\n100  // a number value',
      java: '"Nebula Roast"  // a text value\n12  // a number value',
    },
  },
  {
    term: 'Data type',
    plain: 'A category that tells the language what kind of value something is and which operations make sense for it.',
    ship: 'A cargo classification that distinguishes words, whole numbers, and yes-or-no status readings.',
    keywords: ['type', 'kind of value', 'string', 'integer', 'int'],
    unlockAfter: 1,
    examples: {
      python: 'ship_name = "Wayfarer"  # text\npower_cells = 3  # integer',
      cpp: 'std::string coreName = "Ember";\nint charge = 80;',
      csharp: 'string shieldName = "Aegis";\nint strength = 100;',
      java: 'String blendName = "Nebula Roast";\nint podCount = 12;',
    },
  },
  {
    term: 'Identifier',
    plain: 'A name a programmer gives to something in code, such as a variable, function, method, or class.',
    ship: 'The readable label printed on a locker, control, or blueprint folder so the crew can refer to it.',
    keywords: ['name', 'label', 'variable name', 'function name', 'class name'],
    unlockAfter: 1,
    examples: {
      python: 'ship_name  # an identifier',
      cpp: 'coreName  // an identifier',
      csharp: 'shieldName  // an identifier',
      java: 'blendName  // an identifier',
    },
  },
  {
    term: 'Assignment',
    plain: 'An instruction that stores a value under a variable name. In these lessons, one equals sign performs assignment.',
    ship: 'Placing cargo into a labeled locker so the crew can retrieve it by that label later.',
    keywords: ['store', 'equals sign', '=', 'variable', 'set'],
    unlockAfter: 1,
    examples: {
      python: 'power_cells = 3',
      cpp: 'int charge = 80;',
      csharp: 'int strength = 100;',
      java: 'int podCount = 12;',
    },
  },
  {
    term: 'Expression',
    plain: 'Code that produces a value. It may retrieve one value, combine several values, or ask a true-or-false question.',
    ship: 'A small console calculation that turns current readings into one result the next instruction can use.',
    keywords: ['produces a value', 'calculation', 'comparison', 'operator', 'result'],
    unlockAfter: 2,
    examples: {
      python: 'signal_strength >= 60',
      cpp: 'hullIntegrity < 50',
      csharp: 'shieldPower >= 80',
      java: 'podCount < 6',
    },
  },
  {
    term: 'Compiler',
    plain: 'A tool that checks and translates source code before it runs.',
    ship: 'An engineering translator that turns orders into machine signals.',
    keywords: ['translate', 'build', 'machine code', 'error'],
  },
  {
    term: 'Runtime',
    plain: 'The supporting system that executes a program while it is running.',
    ship: 'The live ship infrastructure that carries written orders to working systems.',
    keywords: ['execute', 'JVM', '.NET', 'run'],
  },
  {
    term: 'Source code',
    plain: 'The human-readable instructions a programmer writes.',
    ship: 'The flight plan before the computer turns it into action.',
    keywords: ['file', 'instructions', 'programmer'],
  },
  {
    term: 'Syntax',
    plain: 'The spelling and punctuation rules a programming language expects.',
    ship: 'The command format that keeps “open the airlock” from becoming a guessing game.',
    keywords: ['grammar', 'punctuation', 'structure', 'error'],
  },
  {
    term: 'Error',
    plain: 'A problem that prevents code from being understood, built, or run as intended. The message is a diagnostic clue, not a judgment about the programmer.',
    ship: 'A console warning that points toward the checklist step or system reading that needs inspection.',
    keywords: ['mistake', 'message', 'compiler error', 'runtime error', 'diagnostic'],
  },
  {
    term: 'Bug',
    plain: 'Code that runs differently from what the programmer intended. A bug is a problem to investigate, not proof that someone cannot program.',
    ship: 'A ship system following its written orders perfectly while those orders produce the wrong operational result.',
    keywords: ['defect', 'wrong result', 'problem', 'mistake', 'unexpected behavior'],
  },
  {
    term: 'Debugging',
    plain: 'The process of finding why code behaves unexpectedly, testing one idea, and making a focused repair.',
    ship: 'Damage control checking one circuit at a time instead of replacing the whole ship.',
    keywords: ['fix', 'repair', 'inspect', 'troubleshoot', 'bug'],
  },
  {
    term: 'Keyword',
    plain: 'A word reserved by a language for a special job, such as class or int.',
    ship: 'A command word the computer already knows, so you cannot reuse it as a cargo label.',
    keywords: ['reserved', 'if', 'else', 'class', 'int'],
  },
  {
    term: 'Comment',
    plain: 'A note for people reading the code. The computer ignores it when the program runs.',
    ship: 'A mechanic’s note in the margin of the repair manual.',
    keywords: ['note', 'ignore', 'documentation'],
    unlockAfter: 1,
    examples: {
      python: '# Tell the bridge our signal is ready',
      cpp: '// Tell engineering the reactor is ready',
      csharp: '// Tell the captain the shields are ready',
      java: '// Tell the galley the coffee is ready',
    },
  },
  {
    term: 'Parentheses ( )',
    plain: 'Symbols that often hold information given to a function, method, or condition.',
    ship: 'The cargo bay attached to an instruction, carrying what that instruction needs.',
    keywords: ['round brackets', 'argument', 'condition'],
    unlockAfter: 1,
    examples: {
      python: 'print("Signal online")',
      cpp: 'if (charge > 50) {',
      csharp: 'Console.WriteLine("Ready");',
      java: 'System.out.println("Ready");',
    },
  },
  {
    term: 'Braces { }',
    plain: 'Symbols that surround a related group of code in languages such as C++, C#, and Java.',
    ship: 'Bulkhead doors showing where one room of instructions begins and ends.',
    keywords: ['curly brackets', 'block', 'group'],
    unlockAfter: 2,
    examples: {
      cpp: 'if (charge > 50) {\n    std::cout << "Ready";\n}',
      csharp: 'if (strength > 50) {\n    Console.WriteLine("Ready");\n}',
      java: 'if (podCount > 6) {\n    System.out.println("Ready");\n}',
    },
  },
  {
    term: 'Semicolon ;',
    plain: 'A symbol that ends many instructions in C++, C#, and Java.',
    ship: 'The full stop at the end of an engineering order.',
    keywords: ['statement', 'end', 'punctuation'],
    unlockAfter: 1,
    examples: {
      cpp: 'int charge = 80;',
      csharp: 'int strength = 100;',
      java: 'int podCount = 12;',
    },
  },
  {
    term: 'Function or method',
    plain: 'A named piece of code that performs a job when it is called.',
    ship: 'A reusable console control, such as print or WriteLine.',
    keywords: ['call', 'operation', 'print', 'method'],
    unlockAfter: 1,
    examples: {
      python: 'print("Ready")',
      cpp: 'std::cout << "Ready";',
      csharp: 'Console.WriteLine("Ready");',
      java: 'System.out.println("Ready");',
    },
  },
  {
    term: 'Built-in or standard library tool',
    plain: 'A useful operation supplied by the language or its standard tools, so a beginner can call it without writing its inner machinery first.',
    ship: 'A control already installed on the bridge. The crew learns how to use it before learning how every circuit inside was built.',
    keywords: ['built in', 'standard library', 'provided', 'print', 'console output'],
    unlockAfter: 1,
    examples: {
      python: 'print("Ready")',
      cpp: 'std::cout << "Ready";',
      csharp: 'Console.WriteLine("Ready");',
      java: 'System.out.println("Ready");',
    },
  },
  {
    term: 'Argument',
    plain: 'A value supplied to a function or method so it knows what to work with.',
    ship: 'The coordinates handed to navigation before telling it to plot a route.',
    keywords: ['parameter', 'input', 'value'],
    unlockAfter: 1,
    examples: {
      python: 'print("Ready")  # "Ready" is the argument',
      csharp: 'Console.WriteLine("Ready"); // text is the argument',
      java: 'System.out.println("Ready"); // text is the argument',
    },
  },
  {
    term: 'Operator',
    plain: 'A symbol that performs an action, such as + for adding numbers or joining text.',
    ship: 'A small control between two readings that tells the system how to combine them.',
    keywords: ['plus', 'comparison', 'equals', 'symbol'],
    unlockAfter: 1,
    examples: {
      python: 'total = 2 + 3',
      cpp: 'int total = 2 + 3;',
      csharp: 'int total = 2 + 3;',
      java: 'int total = 2 + 3;',
    },
  },
  {
    term: 'Entry point',
    plain: 'The place where a program begins running. Java and C++ commonly call it main.',
    ship: 'The first checklist the computer opens when the launch sequence begins.',
    keywords: ['main', 'start', 'launch'],
    unlockAfter: 1,
    examples: {
      cpp: 'int main() {\n    return 0;\n}',
      java: 'public static void main(String[] args) {\n}',
    },
  },
  {
    term: 'Class',
    plain: 'A named container used to organize related code and describe kinds of things.',
    ship: 'A blueprint folder that keeps one system’s data and operations together.',
    keywords: ['object', 'container', 'blueprint', 'Main'],
    unlockAfter: 1,
    examples: {
      java: 'public class Main {\n}',
    },
  },
  {
    term: 'Boolean',
    plain: 'A value with exactly two possibilities: true or false.',
    ship: 'A status lamp with only two states: lit or dark, yes or no.',
    keywords: ['bool', 'true', 'false', 'yes', 'no'],
    unlockAfter: 2,
    examples: {
      python: 'signal_found = True',
      cpp: 'bool breachFound = true;',
      csharp: 'bool shieldsReady = true;',
      java: 'boolean podsReady = true;',
    },
  },
  {
    term: 'Condition',
    plain: 'A question that evaluates to true or false so a program can make a decision.',
    ship: 'A sensor question that chooses which operational route opens next.',
    keywords: ['decision', 'if', 'true', 'false', 'branch'],
    unlockAfter: 2,
    examples: {
      python: 'signal_strength >= 60',
      cpp: 'hullIntegrity < 50',
      csharp: 'shieldPower >= 80',
      java: 'podCount < 6',
    },
  },
  {
    term: 'Comparison operator',
    plain: 'A symbol or symbol pair that compares values and produces true or false.',
    ship: 'A gauge test such as below minimum, at least enough, or exactly equal.',
    keywords: ['equal', 'less than', 'greater than', '==', '<', '>='],
    unlockAfter: 2,
    examples: {
      python: 'clearance == 7',
      cpp: 'hullIntegrity == 40',
      csharp: 'alertLevel == 3',
      java: 'deckNumber == 4',
    },
  },
  {
    term: 'if and else',
    plain: 'Keywords that choose between a true route and an alternate false route.',
    ship: 'One sensor reading opens one of two hatches, never both at the same time.',
    keywords: ['branch', 'decision', 'condition', 'route'],
    unlockAfter: 2,
    examples: {
      python: 'if signal_strength >= 60:\n    print("Accept")\nelse:\n    print("Scan")',
      cpp: 'if (hullIntegrity < 50) {\n    std::cout << "Patch";\n} else {\n    std::cout << "Stable";\n}',
      csharp: 'if (shieldPower >= 80) {\n    Console.WriteLine("Hold");\n} else {\n    Console.WriteLine("Divert");\n}',
      java: 'if (podCount < 6) {\n    System.out.println("Restock");\n} else {\n    System.out.println("Ready");\n}',
    },
  },
  {
    term: 'Collection',
    plain: 'One value that keeps several related values together.',
    ship: 'A named manifest that holds a whole row of related cargo or crew entries.',
    keywords: ['group', 'multiple values', 'list', 'array', 'container'],
    unlockAfter: 3,
    examples: {
      python: 'cargo = ["crystal", "medkit", "map"]',
      cpp: 'std::string parts[3] = {"crystal", "coupler", "rune"};',
      csharp: 'string[] crew = { "Mira", "Tov", "Pip" };',
      java: 'String[] droids = { "MOP-1", "BEEP-7", "HEX-3" };',
    },
  },
  {
    term: 'List',
    plain: 'An ordered collection that can keep several values under one name.',
    ship: 'A cargo manifest whose entries remain in a known order.',
    keywords: ['collection', 'square brackets', 'items', 'ordered'],
    unlockAfter: 3,
    examples: {
      python: 'cargo = ["crystal", "medkit", "map"]',
    },
  },
  {
    term: 'Array',
    plain: 'An ordered collection whose positions are accessed with indexes.',
    ship: 'A numbered rack with one name and a specific slot for each item.',
    keywords: ['collection', 'square brackets', 'fixed size', 'items', 'elements'],
    unlockAfter: 3,
    examples: {
      cpp: 'std::string parts[3] = {"crystal", "coupler", "rune"};',
      csharp: 'string[] crew = { "Mira", "Tov", "Pip" };',
      java: 'String[] droids = { "MOP-1", "BEEP-7", "HEX-3" };',
    },
  },
  {
    term: 'Index',
    plain: 'A number used as the position address of an item in an ordered collection.',
    ship: 'The bay number the manifest computer uses to find one exact locker.',
    keywords: ['position', 'address', 'zero', '[0]', '[2]'],
    unlockAfter: 3,
    examples: {
      python: 'cargo[0]',
      cpp: 'parts[0]',
      csharp: 'crew[0]',
      java: 'droids[0]',
    },
  },
  {
    term: 'Zero-based indexing',
    plain: 'A position system where the first item is at index 0, the second at 1, and the third at 2.',
    ship: 'A rack whose address plates begin with bay 0 instead of bay 1.',
    keywords: ['zero', 'first item', 'off by one', 'position', 'index 0'],
    unlockAfter: 3,
    examples: {
      python: 'cargo[0]  # first item',
      cpp: 'parts[0]  // first item',
      csharp: 'crew[0]  // first item',
      java: 'droids[0]  // first item',
    },
  },
  {
    term: 'Loop',
    plain: 'A structure that repeats a group of instructions.',
    ship: 'One inspection order sent around every station in a patrol route.',
    keywords: ['repeat', 'for', 'foreach', 'cycle', 'body'],
    unlockAfter: 4,
    examples: {
      python: 'for item in cargo:\n    print(item)',
      cpp: 'for (std::string part : parts) {\n    std::cout << part;\n}',
      csharp: 'foreach (string name in crew) {\n    Console.WriteLine(name);\n}',
      java: 'for (String droid : droids) {\n    System.out.println(droid);\n}',
    },
  },
  {
    term: 'Iteration',
    plain: 'One pass through a loop. A loop over three items performs three iterations.',
    ship: 'One completed stop on a repeating orbital scan.',
    keywords: ['pass', 'repeat', 'cycle', 'each item'],
    unlockAfter: 4,
    examples: {
      python: 'item  # one cargo value during this iteration',
      cpp: 'part  // one array value during this iteration',
      csharp: 'name  // one crew value during this iteration',
      java: 'droid  // one roster value during this iteration',
    },
  },
  {
    term: 'Loop variable',
    plain: 'A temporary name that holds the current value during one loop iteration.',
    ship: 'A reusable inspection badge handed to one crew member or cargo item at a time.',
    keywords: ['temporary', 'current item', 'for each', 'iteration'],
    unlockAfter: 4,
    examples: {
      python: 'for item in cargo:  # item is the loop variable',
      cpp: 'for (std::string part : parts)  // part is temporary',
      csharp: 'foreach (string name in crew)  // name is temporary',
      java: 'for (String droid : droids)  // droid is temporary',
    },
  },
  {
    term: 'Function definition',
    plain: 'The code that gives a reusable job its name, inputs, and instructions.',
    ship: 'The blueprint for a control module before anyone activates it.',
    keywords: ['define', 'method', 'def', 'void', 'reusable'],
    unlockAfter: 5,
    examples: {
      python: 'def report(item):\n    print(item)',
      cpp: 'void report(std::string part) {\n    std::cout << part;\n}',
      csharp: 'void Report(string name) {\n    Console.WriteLine(name);\n}',
      java: 'static void report(String droid) {\n    System.out.println(droid);\n}',
    },
  },
  {
    term: 'Parameter',
    plain: 'A temporary input name written in a function or method definition.',
    ship: 'A labeled input port waiting for the next value a caller sends.',
    keywords: ['input', 'argument', 'temporary name', 'function', 'method'],
    unlockAfter: 5,
    examples: {
      python: 'def report(item):  # item is a parameter',
      cpp: 'void report(std::string part)  // part is a parameter',
      csharp: 'void Report(string name)  // name is a parameter',
      java: 'static void report(String droid)  // droid is a parameter',
    },
  },
  {
    term: 'Function call',
    plain: 'An instruction that runs a named function or method and can supply argument values.',
    ship: 'Pressing an installed control and handing it the value for this activation.',
    keywords: ['call', 'run', 'invoke', 'argument', 'parentheses'],
    unlockAfter: 5,
    examples: {
      python: 'report(item)',
      cpp: 'report(part);',
      csharp: 'Report(name);',
      java: 'report(droid);',
    },
  },
]

export function codebookExampleState(
  entry: CodebookEntry,
  track: LanguageTrack,
  completedMissionIds: string[],
): ExampleState {
  if (!entry.examples?.[track.id]) return 'unavailable'
  if (!entry.unlockAfter) return 'unlocked'

  const requiredMission = track.missions[entry.unlockAfter - 1]
  return requiredMission && completedMissionIds.includes(requiredMission.id)
    ? 'unlocked'
    : 'locked'
}

export function codebookMatches(entry: CodebookEntry, query: string, language: LanguageId): boolean {
  const normalized = query.trim().toLocaleLowerCase()
  if (!normalized) return true

  const searchable = [
    entry.term,
    entry.plain,
    entry.ship,
    ...entry.keywords,
    entry.examples?.[language] ?? '',
  ].join(' ').toLocaleLowerCase()
  return searchable.includes(normalized)
}
