import type { LanguageId, LanguageTrack } from '../types'

export interface CodebookEntry {
  term: string
  plain: string
  ship: string
  keywords: string[]
  examples?: Partial<Record<LanguageId, string>>
  unlockAfter?: 1 | 2 | 3 | 4 | 5
  unlockAfterMissionId?: string
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
    term: 'Input',
    plain: 'Information a program receives so it can work with a learner, file, sensor, service, or another part of the program.',
    ship: 'A reading or message arriving through an input port before the ship decides what to do with it.',
    keywords: ['receive', 'user input', 'read', 'argument', 'data in'],
  },
  {
    term: 'Output',
    plain: 'Information a program produces, such as console text, a saved result, a picture, or a signal sent to another system.',
    ship: 'A status report leaving the ship computer through the intercom or a display panel.',
    keywords: ['produce', 'display', 'print', 'result', 'data out'],
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
    term: 'Literal',
    plain: 'A value written directly in source code, such as 3, true, or "Ready", instead of retrieved through a variable name.',
    ship: 'The cargo itself written into the order, rather than a locker label that tells the crew where to retrieve it.',
    keywords: ['direct value', 'text literal', 'number literal', 'quotes', 'constant value'],
    unlockAfter: 1,
    examples: {
      python: '"Wayfarer"  # string literal\n3  # integer literal',
      cpp: '"Ember"  // string literal\n80  // integer literal',
      csharp: '"Aegis"  // string literal\n100  // integer literal',
      java: '"Nebula Roast"  // string literal\n12  // integer literal',
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
    term: 'Case sensitivity',
    plain: 'A rule where uppercase and lowercase letters make different names. Most programming languages treat cargo and Cargo as two identifiers.',
    ship: 'Locker CARGO and locker cargo have different exact labels, even when a human might read them as the same word.',
    keywords: ['uppercase', 'lowercase', 'capital letter', 'exact spelling', 'name mismatch'],
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
      python: '# Show a message',
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
    term: 'Block or body',
    plain: 'A group of instructions that belongs to a structure such as a condition, loop, function, method, or class.',
    ship: 'The complete set of orders inside one room of the checklist, bounded by indentation or bulkhead braces.',
    keywords: ['group', 'body', 'block', 'inside', 'nested'],
    unlockAfter: 2,
    examples: {
      python: 'if ready:\n    print("Launch")  # the indented line is the body',
      cpp: 'if (ready) {\n    std::cout << "Launch";\n}',
      csharp: 'if (ready) {\n    Console.WriteLine("Launch");\n}',
      java: 'if (ready) {\n    System.out.println("Launch");\n}',
    },
  },
  {
    term: 'Indentation',
    plain: 'Spaces at the beginning of a line. Python uses indentation to show which instructions belong inside a block.',
    ship: 'Orders moved inward on the checklist show that they belong beneath the condition or loop above them.',
    keywords: ['spaces', 'tab', 'Python block', 'inside', 'nesting'],
    unlockAfter: 2,
    examples: {
      python: 'if ready:\n    print("Launch")  # four leading spaces',
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
  {
    term: 'Return value',
    plain: 'A result a function sends back to the line that called it, so the program can store that result or use it in another calculation.',
    ship: 'A workshop control finishes its job and sends one useful reading back to the console that activated it.',
    keywords: ['return', 'result', 'function output', 'send back', 'calculation'],
    unlockAfterMissionId: 'py-data-return-values',
    examples: {
      python: 'def subtotal(price, quantity):\n    return price * quantity\n\ntotal = subtotal(4, 3)',
    },
  },
  {
    term: 'String method',
    plain: 'An operation attached to a text value with a dot, such as strip() or lower(), that produces a new text result.',
    ship: 'A cleanup control attached to a label can trim its extra spacing or make its lettering consistent.',
    keywords: ['text operation', 'dot', 'strip', 'lower', 'method call'],
    unlockAfterMissionId: 'py-data-text-cleanup',
    examples: {
      python: 'item_name = " Markers "\nclean_name = item_name.strip()',
    },
  },
  {
    term: 'Text normalization',
    plain: 'Changing text into one consistent form before comparing it or using it as a stored name, such as trimming spaces and using lowercase.',
    ship: 'The supply desk rewrites MARKERS, markers, and padded labels in one standard logbook format.',
    keywords: ['normalize', 'clean text', 'consistent', 'strip', 'lowercase'],
    unlockAfterMissionId: 'py-data-text-cleanup',
    examples: {
      python: 'clean_name = item_name.strip().lower()',
    },
  },
  {
    term: 'List mutation',
    plain: 'A change made to an existing list, such as adding an item with append(), so that list now contains updated items.',
    ship: 'A clerk adds another task to the same checklist instead of replacing the entire checklist.',
    keywords: ['change list', 'append', 'add item', 'update', 'mutable'],
    unlockAfterMissionId: 'py-data-list-tools',
    examples: {
      python: 'tasks = ["email"]\ntasks.append("backup")',
    },
  },
  {
    term: 'Length',
    plain: 'The number of items in a collection. Python uses len() to count the current items in a list, dictionary, string, or other collection.',
    ship: 'The manifest computer counts how many labeled entries are currently on the supply list.',
    keywords: ['len', 'count', 'number of items', 'size', 'collection'],
    unlockAfterMissionId: 'py-data-list-tools',
    examples: {
      python: 'task_count = len(tasks)',
    },
  },
  {
    term: 'Membership test',
    plain: 'A true-or-false check that asks whether a value is already inside a collection. Python commonly writes this check with in or not in.',
    ship: 'The clerk checks whether backup already appears on the task manifest before adding another copy.',
    keywords: ['in', 'not in', 'contains', 'already listed', 'boolean'],
    unlockAfterMissionId: 'py-data-list-tools',
    examples: {
      python: 'if "backup" in tasks:\n    print("Already listed")',
    },
  },
  {
    term: 'Dictionary',
    plain: 'A Python collection that stores values under named keys, so a program can find information by a useful label instead of a numbered position.',
    ship: 'A supply ledger pairs each item name with its current quantity, such as paper with 12 units.',
    keywords: ['dict', 'mapping', 'key', 'value', 'named data'],
    unlockAfterMissionId: 'py-data-dictionaries',
    examples: {
      python: 'inventory = {"paper": 12, "markers": 5}',
    },
  },
  {
    term: 'Key and value',
    plain: 'A dictionary entry has a key used to find it and a value stored under that key. In inventory["paper"], paper is the key and its quantity is the value.',
    ship: 'The ledger label identifies one supply, while the number beside that label records how many are available.',
    keywords: ['dictionary entry', 'lookup', 'mapping', 'label', 'stored amount'],
    unlockAfterMissionId: 'py-data-dictionaries',
    examples: {
      python: 'amount = inventory["paper"]  # key: "paper", value: 12',
    },
  },
  {
    term: 'Default value',
    plain: 'A fallback result used when requested data is missing. A dictionary get() call can return that fallback instead of stopping with a missing-key error.',
    ship: 'If the supply ledger has no markers entry yet, the clerk begins from the agreed quantity of zero.',
    keywords: ['fallback', 'get', 'missing key', 'starting value', 'zero'],
    unlockAfterMissionId: 'py-data-dictionaries',
    examples: {
      python: 'current = inventory.get("markers", 0)',
    },
  },
  {
    term: 'Accumulator',
    plain: 'A variable that keeps a running result while a loop works through several values. It is initialized before the loop and updated during each pass.',
    ship: 'A tally display starts at zero and adds each storage-bin quantity as the inspection moves along.',
    keywords: ['running total', 'total', 'loop', 'add up', 'initialize'],
    unlockAfterMissionId: 'py-data-summaries',
    examples: {
      python: 'total = 0\nfor amount in inventory.values():\n    total += amount',
    },
  },
  {
    term: 'Filter',
    plain: 'A rule that selects only the collection items that match a condition, leaving unrelated items out of the result.',
    ship: 'A supply report includes only bins below the restock limit instead of copying every bin into the alert list.',
    keywords: ['select', 'condition', 'matching items', 'subset', 'low stock'],
    unlockAfterMissionId: 'py-data-summaries',
    examples: {
      python: 'low = []\nfor name in inventory:\n    if inventory[name] < 6:\n        low.append(name)',
    },
  },
]

export function codebookExampleState(
  entry: CodebookEntry,
  track: LanguageTrack,
  completedMissionIds: string[],
): ExampleState {
  if (!entry.examples?.[track.id]) return 'unavailable'
  if (entry.unlockAfterMissionId) {
    return completedMissionIds.includes(entry.unlockAfterMissionId)
      ? 'unlocked'
      : 'locked'
  }
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
    ...entry.keywords,
    entry.examples?.[language] ?? '',
  ].join(' ').toLocaleLowerCase()
  return searchable.includes(normalized)
}
