import type { Exercise, LanguageId, LanguageTrack, Mission } from '../types'

const cppProgramFrame = [
  {
    code: '#include <iostream>',
    plain: 'This asks C++ to bring in its console-output toolbox. It is provided scaffolding, so you can recognize it without memorizing it.',
  },
  {
    code: 'int main() {',
    plain: 'main is the starting doorway of this program. The opening brace { begins its group of instructions. You will study return values later.',
  },
  {
    code: 'return 0; and }',
    plain: 'return 0 reports a normal finish. The closing brace } shuts the group opened above. Both lines are already supplied.',
  },
]

const javaProgramFrame = [
  {
    code: 'public class Main {',
    plain: 'A class is a named program container. This simulator expects the name Main. public lets Java reach it, and { opens the container.',
  },
  {
    code: 'public static void main(String[] args)',
    plain: 'This is Java’s starting doorway. public makes it reachable, static lets it start without first building an object, void says it returns no value, and String[] args can receive launch words. You do not need to memorize this line yet.',
  },
  {
    code: '{ and }',
    plain: 'Braces mark where a group begins and ends, like opening and closing the walls of a room. The simulator supplies these braces for you.',
  },
]

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
    focus: 'Replace the one _____ blank with print. Leave the message and its punctuation in place.',
    codeGuide: [
      { code: '# Tell the bridge...', plain: 'A line beginning with # is a comment for humans. Python ignores it when the program runs.' },
      { code: 'print', plain: 'This is a built-in Python instruction that sends something to the console.' },
      { code: '("Signal online")', plain: 'Parentheses hold what print should use. Quotation marks tell Python that Signal online is text.' },
    ],
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
    focus: 'Replace the one _____ blank with the quoted text "Wayfarer".',
    codeGuide: [
      { code: 'ship_name', plain: 'This is a variable name: a human-readable label for a value kept in memory.' },
      { code: '=', plain: 'Here, the equals sign means “store the value on the right under the label on the left.”' },
      { code: '"Wayfarer"', plain: 'Quotation marks make this a string, which is programming’s word for a piece of text.' },
      { code: 'print(ship_name)', plain: 'Using the label without quotes retrieves the stored value. Quoting "ship_name" would print the label itself.' },
    ],
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
    focus: 'Replace the one _____ blank with the number 3, without quotation marks.',
    codeGuide: [
      { code: 'power_cells', plain: 'This variable name describes what the stored number counts. Clear names make code easier to read.' },
      { code: '= 3', plain: 'The equals sign stores the whole number 3 under that name.' },
      { code: '3 versus "3"', plain: '3 is a number that can be used in arithmetic. "3" is text containing the character 3.' },
      { code: 'print(power_cells)', plain: 'Python looks inside the variable and sends its current value to the console.' },
    ],
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
    focus: 'Replace only the two _____ blanks: first with ship_name, then with power_cells.',
    codeGuide: [
      { code: 'ship_name = "Wayfarer"', plain: 'This stores text under the label ship_name. The value is already waiting for you.' },
      { code: 'power_cells = 3', plain: 'This stores a whole number under the label power_cells.' },
      { code: 'print("Ship:", ship_name)', plain: 'A comma lets print place the fixed label and the variable’s value on the same output line.' },
      { code: 'print("Cells:", power_cells)', plain: 'The same pattern is reused. Repetition is how a new code shape becomes familiar.' },
    ],
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
    focus: 'Replace the one _____ blank with std::cout. The program frame around it is already supplied.',
    codeGuide: [
      ...cppProgramFrame,
      { code: 'std::cout <<', plain: 'std::cout is C++’s console output stream. The << symbols point the value on their right toward that stream.' },
      { code: '"Reactor online";', plain: 'Quotation marks identify text. The semicolon ; is a full stop that ends this C++ instruction.' },
    ],
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
    focus: 'Replace the one _____ blank with the quoted text "Ember".',
    codeGuide: [
      ...cppProgramFrame,
      { code: 'std::string', plain: 'This type tells C++ that the variable will hold text. std names the standard toolbox where string lives.' },
      { code: 'core_name = "Ember";', plain: 'core_name is the label, = stores a value, quotes mark text, and ; ends the instruction.' },
      { code: 'std::cout << core_name;', plain: 'Without quotation marks, core_name means “retrieve the value stored under this label.”' },
    ],
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
    focus: 'Replace the one _____ blank with int, the C++ type for a whole number.',
    codeGuide: [
      ...cppProgramFrame,
      { code: 'int', plain: 'int is short for integer, a whole number with no decimal part.' },
      { code: 'charge = 80;', plain: 'charge is the variable label. The equals sign stores the number 80, and the semicolon ends the instruction.' },
      { code: 'std::cout << charge;', plain: 'This retrieves the stored number and routes it to the console.' },
    ],
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
    focus: 'Replace only the two _____ blanks: first with core_name, then with charge.',
    codeGuide: [
      ...cppProgramFrame,
      { code: 'std::string core_name = "Ember";', plain: 'This complete instruction stores text. Type, label, value, and semicolon each have one job.' },
      { code: 'int charge = 80;', plain: 'This uses the same shape to store a number instead of text.' },
      { code: 'std::cout << ... << ...;', plain: 'Each << adds the next text or stored value to one output line. Read the chain from left to right.' },
    ],
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
    focus: 'Replace the one _____ blank with Console.WriteLine. Keep the message, parentheses, and semicolon.',
    codeGuide: [
      { code: 'Console', plain: 'Console is a built-in C# tool representing the text window where a program can communicate.' },
      { code: '.', plain: 'The dot means “use something belonging to the item on the left.” Here, use a Console operation.' },
      { code: 'WriteLine', plain: 'This operation writes a value and then moves the console to a new line.' },
      { code: '("Shields online");', plain: 'Parentheses hold the message, quotes mark it as text, and the semicolon ends the instruction.' },
    ],
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
    focus: 'Replace the one _____ blank with the quoted text "Aegis".',
    codeGuide: [
      { code: 'string', plain: 'This type tells C# that the variable will hold text.' },
      { code: 'shieldName', plain: 'This is the variable’s label. The capital N is a common readable style called camel case.' },
      { code: '= "Aegis";', plain: 'The equals sign stores the quoted text, and the semicolon closes the instruction.' },
      { code: 'Console.WriteLine(shieldName);', plain: 'Without quotes, shieldName retrieves its stored value and sends that value to the console.' },
    ],
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
    focus: 'Replace the one _____ blank with int, the C# type for a whole number.',
    codeGuide: [
      { code: 'int', plain: 'int is short for integer, a whole number without a decimal part.' },
      { code: 'strength', plain: 'This is the descriptive variable label used to find the stored number later.' },
      { code: '= 100;', plain: 'The equals sign stores 100. It has no quotes because this is numeric data, not text.' },
      { code: 'Console.WriteLine(strength);', plain: 'C# retrieves the number stored under strength and displays it.' },
    ],
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
    focus: 'Replace only the two _____ blanks: first with shieldName, then with strength.',
    codeGuide: [
      { code: 'string shieldName = "Aegis";', plain: 'This stores text under a descriptive variable label.' },
      { code: 'int strength = 100;', plain: 'This follows the same type, label, value pattern for a whole number.' },
      { code: '$"..."', plain: 'The $ turns the quoted text into a template that can include live variable values.' },
      { code: '{shieldName}', plain: 'Braces inside this text template mark a place where C# should insert a stored value. These braces are different from braces that group code.' },
    ],
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
    focus: 'Replace the one _____ blank with System.out.println. The long setup lines are provided, not a test.',
    codeGuide: [
      ...javaProgramFrame,
      { code: 'System.out.println', plain: 'System is Java’s connection to the running computer, out is its standard output channel, and println sends one line through it.' },
      { code: '("Coffee online");', plain: 'Parentheses hold the message, quotes mark it as text, and the semicolon ends the Java instruction.' },
    ],
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
    focus: 'Replace the one _____ blank with the quoted text "Nebula Roast". Leave the Java program frame alone.',
    codeGuide: [
      ...javaProgramFrame,
      { code: 'String', plain: 'This type tells Java that the variable will hold text. Its capital S matters because Java is case-sensitive.' },
      { code: 'blendName = "Nebula Roast";', plain: 'blendName is the label, = stores a value, quotes mark text, and ; ends the instruction.' },
      { code: 'System.out.println(blendName);', plain: 'Because blendName has no quotes here, Java retrieves its stored text instead of printing the label itself.' },
    ],
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
    focus: 'Replace the one _____ blank with int, Java’s type for a whole number.',
    codeGuide: [
      ...javaProgramFrame,
      { code: 'int', plain: 'int is short for integer, a whole number with no decimal part.' },
      { code: 'podCount = 12;', plain: 'podCount is the label. The equals sign stores the number 12, and the semicolon ends the instruction.' },
      { code: '12 versus "12"', plain: '12 is numeric data that Java can calculate with. "12" would be two text characters.' },
    ],
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
    prompt: 'Replace only the two blanks so the report uses the stored blend name and pod count.',
    starterCode: 'public class Main {\n    public static void main(String[] args) {\n        String blendName = "Nebula Roast";\n        int podCount = 12;\n\n        System.out.println("Blend: " + _____\n            + " | Pods: " + _____);\n    }\n}',
    focus: 'Replace the first _____ with blendName and the second with podCount. Do not rewrite the surrounding program.',
    codeGuide: [
      ...javaProgramFrame,
      { code: 'String blendName = "Nebula Roast";', plain: 'This complete instruction stores text under the label blendName. It is already done for you.' },
      { code: 'int podCount = 12;', plain: 'This complete instruction stores a whole number under podCount. It is also already done.' },
      { code: '+', plain: 'Between text pieces, + joins them into one longer message. Read this output line from left to right, one piece at a time.' },
      { code: 'System.out.println(...)', plain: 'println displays everything inside its parentheses. The line wraps on screen only to make it easier to read.' },
    ],
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

const pythonSignalProtocolExercises: Exercise[] = [
  {
    id: 'py2-retrieve-output',
    conceptId: 'python-output-and-variables',
    eyebrow: 'Memory ping 1 of 5',
    title: 'Read an old signal',
    explanation:
      'Before learning a new tool, retrieve one familiar pattern. Python stores Wayfarer under ship_name, then print reads that stored value.',
    analogy:
      'The bridge does not repaint the ship’s name on every console. It reads the current name from the labeled registry.',
    type: 'prediction',
    prompt: 'What line will this familiar code display?',
    displayCode: 'ship_name = "Wayfarer"\nprint("Ship:", ship_name)',
    choices: [
      { id: 'a', label: 'Ship: Wayfarer', detail: 'The fixed label and stored value appear together.' },
      { id: 'b', label: 'Ship: ship_name', detail: 'Without quotes, Python retrieves the value instead of printing the variable label.' },
      { id: 'c', label: 'Nothing', detail: 'The print instruction sends a line to the console.' },
    ],
    correctChoice: 'a',
    output: 'Ship: Wayfarer',
    hint: 'Read the assignment first. What value is stored under ship_name?',
    recap: 'Python reads the stored value Wayfarer when print uses ship_name without quotation marks.',
    xp: 8,
  },
  {
    id: 'py2-boolean',
    conceptId: 'python-booleans',
    eyebrow: 'Decision school 2 of 5',
    title: 'Meet a true-or-false question',
    explanation:
      'A Boolean is a value with only two possibilities: True or False. A condition is a question the program can answer with one of those Boolean values.',
    analogy:
      'A sensor question such as “Is the signal stronger than 50?” has only two useful answers: yes or no.',
    type: 'choice',
    prompt: 'What kind of answer does a condition produce?',
    choices: [
      { id: 'a', label: 'True or False', detail: 'That two-way answer is a Boolean.' },
      { id: 'b', label: 'Every number at once', detail: 'A condition can compare numbers, but its answer is still True or False.' },
      { id: 'c', label: 'A random instruction', detail: 'The program evaluates the exact question you write.' },
    ],
    correctChoice: 'a',
    hint: 'Think of a question that can be answered yes or no.',
    recap: 'A condition evaluates to a Boolean value: True or False.',
    xp: 10,
  },
  {
    id: 'py2-order-route',
    conceptId: 'python-conditions',
    eyebrow: 'Route planner 3 of 5',
    title: 'Put both signal routes in order',
    explanation:
      'Python uses if to open the route taken when a condition is True. else opens the other route. Indented lines belong to the route directly above them.',
    analogy:
      'The comm officer checks one sensor reading, then sends the signal through either the strong-signal hatch or the keep-scanning hatch.',
    type: 'ordering',
    prompt: 'Arrange the pieces so Python chooses one clear signal response.',
    orderItems: [
      { id: 'scan', code: '    print("Keep scanning")' },
      { id: 'if', code: 'if signal_strength > 50:' },
      { id: 'else', code: 'else:' },
      { id: 'accept', code: '    print("Signal accepted")' },
    ],
    correctOrder: ['if', 'accept', 'else', 'scan'],
    incorrectMessage: 'Start with the if question. Its indented instruction comes next, followed by else and the other indented instruction.',
    output: 'Signal accepted',
    hint: 'The if line asks first. Each indented print belongs beneath the route that should trigger it.',
    recap: 'Python reads the if route first and the else route second. Indentation shows which instruction belongs to each route.',
    xp: 14,
  },
  {
    id: 'py2-fix-comparison',
    conceptId: 'python-comparisons',
    eyebrow: 'Diagnostic 4 of 5',
    title: 'Repair the docking question',
    explanation:
      'One equals sign stores a value. Two equals signs ask whether two values match. This program needs a question, so its condition must use ==.',
    analogy:
      'A cargo officer can either replace the clearance badge with = or inspect whether it matches with ==. Docking needs the inspection.',
    type: 'bugfix',
    prompt: 'Change the faulty condition so it compares clearance with 7.',
    starterCode: 'clearance = 7\n\nif clearance = 7:\n    print("Docking approved")',
    focus: 'Find the single = inside the if line and change it to ==. Leave the assignment on line 1 alone.',
    codeGuide: [
      { code: 'clearance = 7', plain: 'This is an assignment. One equals sign stores the number 7 under the variable name clearance.' },
      { code: 'clearance == 7', plain: 'This is a comparison. Two equals signs ask whether the stored value and 7 match.' },
      { code: 'if ...:', plain: 'if checks the Boolean answer. The colon opens the indented route used when that answer is True.' },
    ],
    checks: [
      { pattern: 'if\\s+clearance\\s*==\\s*7\\s*:', message: 'Use == in the if line so Python compares instead of assigning.' },
    ],
    output: 'Docking approved',
    hint: 'The repaired line is if clearance == 7:',
    recap: 'Use = to store a value and == to ask whether two values are equal.',
    xp: 16,
  },
  {
    id: 'py2-signal-decision',
    conceptId: 'python-conditions',
    eyebrow: 'Signal protocol 5 of 5',
    title: 'Route the mysterious transmission',
    explanation:
      'A comparison can ask whether one number is greater than or equal to another. The >= operator means “at least.” The if statement uses that True-or-False answer to choose a route.',
    analogy:
      'The receiver needs at least 60 units of strength. A reading of 60 or more opens the secure channel.',
    type: 'code',
    prompt: 'Replace the blank with a condition that accepts strength values of 60 or more.',
    starterCode: 'signal_strength = 72\n\nif _____:\n    print("Signal accepted")\nelse:\n    print("Keep scanning")',
    focus: 'Replace the one _____ blank with signal_strength >= 60. The colon and both routes are supplied.',
    codeGuide: [
      { code: 'signal_strength = 72', plain: 'This familiar assignment stores the sensor’s whole-number reading in a clearly named variable.' },
      { code: '>=', plain: 'This comparison means “greater than or equal to.” It includes the boundary value 60.' },
      { code: 'if condition:', plain: 'Python evaluates the condition. When it is True, the first indented print runs.' },
      { code: 'else:', plain: 'else provides the fallback route used when the condition is False.' },
    ],
    checks: [
      { pattern: 'if\\s+signal_strength\\s*>=\\s*60\\s*:', message: 'Use signal_strength >= 60 between if and the supplied colon.' },
    ],
    output: 'Signal accepted',
    hint: 'Write signal_strength >= 60 in the blank. Read >= as “at least.”',
    recap: 'An if statement chooses a route from a Boolean condition. >= includes values above and exactly on the boundary.',
    xp: 22,
  },
]

const cppHullLogicExercises: Exercise[] = [
  {
    id: 'cpp2-retrieve-output',
    conceptId: 'cpp-output-and-variables',
    eyebrow: 'Memory ping 1 of 5',
    title: 'Read the reactor display',
    explanation:
      'Retrieve a familiar C++ pattern first. The variable stores 80, and std::cout routes the label and stored number to the console from left to right.',
    analogy:
      'The bridge display combines a fixed gauge label with the reactor’s current stored reading.',
    type: 'prediction',
    prompt: 'What will this familiar code display?',
    displayCode: 'int charge = 80;\nstd::cout << "Charge: " << charge;',
    choices: [
      { id: 'a', label: 'Charge: 80', detail: 'The output chain includes both the fixed text and stored number.' },
      { id: 'b', label: 'Charge: charge', detail: 'Without quotation marks, charge retrieves its numeric value.' },
      { id: 'c', label: '80Charge:', detail: 'std::cout follows the chain from left to right.' },
    ],
    correctChoice: 'a',
    output: 'Charge: 80',
    hint: 'Follow each << from left to right.',
    recap: 'C++ sends each chained value to std::cout from left to right.',
    xp: 8,
  },
  {
    id: 'cpp2-boolean',
    conceptId: 'cpp-booleans',
    eyebrow: 'Damage control 2 of 5',
    title: 'Ask a two-way question',
    explanation:
      'A C++ condition produces a Boolean answer: true or false. The program can use that answer to decide which instructions should run.',
    analogy:
      'The hull sensor answers one operational question: is integrity below the safe threshold, yes or no?',
    type: 'choice',
    prompt: 'What are the two possible Boolean values in C++?',
    choices: [
      { id: 'a', label: 'true and false', detail: 'C++ writes these Boolean values in lowercase.' },
      { id: 'b', label: 'open and close only', detail: 'Those could be meanings in a story, but the language values are true and false.' },
      { id: 'c', label: 'Every integer', detail: 'A comparison may inspect integers, but its result is Boolean.' },
    ],
    correctChoice: 'a',
    hint: 'The two values mean yes and no, written as C++ keywords.',
    recap: 'C++ Boolean values are true and false.',
    xp: 10,
  },
  {
    id: 'cpp2-order-repair',
    conceptId: 'cpp-conditions',
    eyebrow: 'Repair routes 3 of 5',
    title: 'Assemble the hull decision',
    explanation:
      'C++ places a condition inside parentheses after if. Braces group the instructions for the true route and the else route.',
    analogy:
      'Damage control reads the gauge, opens one sealed procedure, or moves to the alternate procedure.',
    type: 'ordering',
    prompt: 'Arrange the pieces into a complete two-route hull decision.',
    orderItems: [
      { id: 'low', code: '    std::cout << "Patch outer hull";' },
      { id: 'if', code: 'if (hullIntegrity < 50) {' },
      { id: 'else', code: '} else {' },
      { id: 'safe', code: '    std::cout << "Hull stable";' },
      { id: 'end', code: '}' },
    ],
    correctOrder: ['if', 'low', 'else', 'safe', 'end'],
    incorrectMessage: 'Open the if block first, place its output inside, open the else block, place its output inside, then close the final brace.',
    output: 'Patch outer hull',
    hint: 'The first piece begins with if. The last piece is the final closing brace.',
    recap: 'C++ uses parentheses around a condition and braces around each route’s instructions.',
    xp: 14,
  },
  {
    id: 'cpp2-fix-comparison',
    conceptId: 'cpp-comparisons',
    eyebrow: 'Diagnostic 4 of 5',
    title: 'Repair the integrity check',
    explanation:
      'In C++, one equals sign assigns a value. Two equals signs compare values. An if condition needs the comparison == when it asks whether values match.',
    analogy:
      'Damage control must inspect the gauge, not overwrite the gauge while asking the question.',
    type: 'bugfix',
    prompt: 'Repair the if condition so it compares hullIntegrity with 40.',
    starterCode: '#include <iostream>\n\nint main() {\n    int hullIntegrity = 40;\n\n    if (hullIntegrity = 40) {\n        std::cout << "Breach located";\n    }\n    return 0;\n}',
    focus: 'Change the single = inside the if parentheses to ==. Leave the earlier assignment unchanged.',
    codeGuide: [
      ...cppProgramFrame,
      { code: 'int hullIntegrity = 40;', plain: 'This assignment stores 40 in a whole-number variable. One equals sign is correct here.' },
      { code: 'hullIntegrity == 40', plain: 'Two equals signs compare the stored reading with 40 and produce true or false.' },
      { code: 'if (...) { ... }', plain: 'Parentheses hold the condition. Braces group the instruction that runs when the condition is true.' },
    ],
    checks: [
      { pattern: 'if\\s*\\(\\s*hullIntegrity\\s*==\\s*40\\s*\\)', message: 'Use == inside the if parentheses to compare the two values.' },
    ],
    output: 'Breach located',
    hint: 'The repaired condition is if (hullIntegrity == 40) {',
    recap: 'In C++, = assigns and == compares.',
    xp: 16,
  },
  {
    id: 'cpp2-hull-decision',
    conceptId: 'cpp-conditions',
    eyebrow: 'Hull logic 5 of 5',
    title: 'Choose the repair route',
    explanation:
      'The < operator asks whether the value on the left is less than the value on the right. The if and else blocks use that Boolean answer to choose one repair report.',
    analogy:
      'Below 50 means the hull needs a patch. A reading of 50 or more stays on the stable route.',
    type: 'code',
    prompt: 'Replace the blank with a condition that detects integrity below 50.',
    starterCode: '#include <iostream>\n\nint main() {\n    int hullIntegrity = 35;\n\n    if (_____) {\n        std::cout << "Patch outer hull";\n    } else {\n        std::cout << "Hull stable";\n    }\n    return 0;\n}',
    focus: 'Replace the one _____ blank with hullIntegrity < 50. The parentheses and both brace groups are supplied.',
    codeGuide: [
      ...cppProgramFrame,
      { code: 'hullIntegrity < 50', plain: 'The < symbol asks whether the current reading is less than 50. Its answer is true for 35.' },
      { code: 'if (...) {', plain: 'if evaluates the condition in parentheses. The opening brace begins the true route.' },
      { code: '} else {', plain: 'else opens the alternate route used when the condition is false.' },
    ],
    checks: [
      { pattern: 'if\\s*\\(\\s*hullIntegrity\\s*<\\s*50\\s*\\)', message: 'Put hullIntegrity < 50 inside the supplied if parentheses.' },
    ],
    output: 'Patch outer hull',
    hint: 'Write hullIntegrity < 50 in the blank. Read < as “is less than.”',
    recap: 'A C++ if statement runs one brace group when its condition is true and the else group when it is false.',
    xp: 22,
  },
]

const csharpCommandLogicExercises: Exercise[] = [
  {
    id: 'cs2-retrieve-output',
    conceptId: 'csharp-output-and-variables',
    eyebrow: 'Memory ping 1 of 5',
    title: 'Read the shield report',
    explanation:
      'Retrieve a familiar C# pattern. The $ makes a text template, and {strength} inserts the current stored number into that text.',
    analogy:
      'The tactical display keeps its label fixed while a live shield gauge fills the marked slot.',
    type: 'prediction',
    prompt: 'What will this familiar code display?',
    displayCode: 'int strength = 100;\nConsole.WriteLine($"Strength: {strength}");',
    choices: [
      { id: 'a', label: 'Strength: 100', detail: 'The braces insert the value stored under strength.' },
      { id: 'b', label: 'Strength: {strength}', detail: 'The leading $ tells C# to replace the braced name with its value.' },
      { id: 'c', label: 'strength = 100', detail: 'The assignment stores data, while Console.WriteLine controls the displayed message.' },
    ],
    correctChoice: 'a',
    output: 'Strength: 100',
    hint: 'The $ and braces make this a live text template.',
    recap: 'C# string interpolation replaces {strength} with the stored value 100.',
    xp: 8,
  },
  {
    id: 'cs2-boolean',
    conceptId: 'csharp-booleans',
    eyebrow: 'Command school 2 of 5',
    title: 'Ask a command question',
    explanation:
      'A C# Boolean has one of two values: true or false. Conditions create Boolean answers that an if statement can use to make a decision.',
    analogy:
      'The captain asks whether shield power is at least the combat threshold. The tactical system answers yes or no.',
    type: 'choice',
    prompt: 'Which pair contains the C# Boolean values?',
    choices: [
      { id: 'a', label: 'true and false', detail: 'C# writes both Boolean keywords in lowercase.' },
      { id: 'b', label: 'yes and no', detail: 'Those are the plain-language meanings, but the C# keywords are true and false.' },
      { id: 'c', label: '1 through 100', detail: 'A condition can inspect numbers, but its answer is Boolean.' },
    ],
    correctChoice: 'a',
    hint: 'The language keywords are the lowercase forms of true and false.',
    recap: 'C# Boolean values are true and false.',
    xp: 10,
  },
  {
    id: 'cs2-order-command',
    conceptId: 'csharp-conditions',
    eyebrow: 'Tactical routes 3 of 5',
    title: 'Assemble the shield decision',
    explanation:
      'C# places a condition in parentheses after if. Braces group the true route, and else opens the route used when the answer is false.',
    analogy:
      'One shield reading sends the crew either to hold formation or divert power.',
    type: 'ordering',
    prompt: 'Arrange the pieces into a complete two-route shield command.',
    orderItems: [
      { id: 'divert', code: '    Console.WriteLine("Divert power");' },
      { id: 'if', code: 'if (shieldPower >= 80) {' },
      { id: 'else', code: '} else {' },
      { id: 'hold', code: '    Console.WriteLine("Hold formation");' },
      { id: 'end', code: '}' },
    ],
    correctOrder: ['if', 'hold', 'else', 'divert', 'end'],
    incorrectMessage: 'Begin with if, place its command inside the first braces, open else, place the alternate command inside, then close the final brace.',
    output: 'Hold formation',
    hint: 'The if line comes first. The final closing brace comes last.',
    recap: 'C# uses parentheses for the condition and braces for the two instruction routes.',
    xp: 14,
  },
  {
    id: 'cs2-fix-comparison',
    conceptId: 'csharp-comparisons',
    eyebrow: 'Diagnostic 4 of 5',
    title: 'Repair the alert check',
    explanation:
      'One equals sign assigns a value in C#. Two equals signs compare two values and produce true or false. The if condition needs ==.',
    analogy:
      'The tactical officer must compare the alert level, not replace it while checking it.',
    type: 'bugfix',
    prompt: 'Repair the condition so it compares alertLevel with 3.',
    starterCode: 'int alertLevel = 3;\n\nif (alertLevel = 3) {\n    Console.WriteLine("Battle stations");\n}',
    focus: 'Change the single = inside the if parentheses to ==. Leave the assignment on line 1 unchanged.',
    codeGuide: [
      { code: 'int alertLevel = 3;', plain: 'This assignment stores the whole number 3. One equals sign is correct in a storage instruction.' },
      { code: 'alertLevel == 3', plain: 'Two equals signs compare the stored value with 3 and produce a Boolean answer.' },
      { code: 'if (...) { ... }', plain: 'Parentheses hold the question. Braces group the command used when the answer is true.' },
    ],
    checks: [
      { pattern: 'if\\s*\\(\\s*alertLevel\\s*==\\s*3\\s*\\)', message: 'Use == inside the if parentheses to compare alertLevel with 3.' },
    ],
    output: 'Battle stations',
    hint: 'The repaired condition is if (alertLevel == 3) {',
    recap: 'In C#, = assigns and == compares.',
    xp: 16,
  },
  {
    id: 'cs2-shield-decision',
    conceptId: 'csharp-conditions',
    eyebrow: 'Command logic 5 of 5',
    title: 'Choose under pressure',
    explanation:
      'The >= operator means “greater than or equal to.” It lets the boundary value count. An if statement uses that Boolean result to choose exactly one command route.',
    analogy:
      'Shield power of 80 or higher can hold formation. Anything lower diverts reserve power.',
    type: 'code',
    prompt: 'Replace the blank with a condition that accepts shield power of 80 or more.',
    starterCode: 'int shieldPower = 84;\n\nif (_____) {\n    Console.WriteLine("Hold formation");\n} else {\n    Console.WriteLine("Divert power");\n}',
    focus: 'Replace the one _____ blank with shieldPower >= 80. The parentheses and both brace groups are supplied.',
    codeGuide: [
      { code: 'int shieldPower = 84;', plain: 'This familiar declaration stores a whole-number shield reading in a descriptive variable.' },
      { code: '>=', plain: 'This comparison means “greater than or equal to.” It includes 80 as well as higher readings.' },
      { code: 'if (...) {', plain: 'if evaluates the question inside the parentheses and opens the true route with a brace.' },
      { code: '} else {', plain: 'else opens the alternate route used when the condition is false.' },
    ],
    checks: [
      { pattern: 'if\\s*\\(\\s*shieldPower\\s*>=\\s*80\\s*\\)', message: 'Put shieldPower >= 80 inside the supplied if parentheses.' },
    ],
    output: 'Hold formation',
    hint: 'Write shieldPower >= 80 in the blank. Read >= as “at least.”',
    recap: 'A C# if statement selects one brace group from a Boolean condition.',
    xp: 22,
  },
]

const javaRoutingOrdersExercises: Exercise[] = [
  {
    id: 'java2-retrieve-output',
    conceptId: 'java-output-and-variables',
    eyebrow: 'Memory ping 1 of 5',
    title: 'Read the galley count',
    explanation:
      'Retrieve a familiar Java pattern. The + operator joins the fixed label with the number stored under podCount.',
    analogy:
      'The galley display couples a label car to a live inventory car and shows them as one report.',
    type: 'prediction',
    prompt: 'What will this familiar code display?',
    displayCode: 'int podCount = 12;\nSystem.out.println("Pods: " + podCount);',
    choices: [
      { id: 'a', label: 'Pods: 12', detail: 'Java joins the text with the stored numeric value.' },
      { id: 'b', label: 'Pods: podCount', detail: 'Without quotes, podCount retrieves its stored value.' },
      { id: 'c', label: '24', detail: 'Here + joins text and a value instead of performing number addition.' },
    ],
    correctChoice: 'a',
    output: 'Pods: 12',
    hint: 'Read the assignment, then follow the pieces joined by +.',
    recap: 'Java joins the label and stored pod count into Pods: 12.',
    xp: 8,
  },
  {
    id: 'java2-boolean',
    conceptId: 'java-booleans',
    eyebrow: 'Routing school 2 of 5',
    title: 'Ask a routing question',
    explanation:
      'A Java Boolean has one of two values: true or false. A condition produces that two-way answer so the program can choose what happens next.',
    analogy:
      'The supply lift asks whether the pod count is below the reserve threshold. The answer is yes or no.',
    type: 'choice',
    prompt: 'Which pair contains Java’s Boolean values?',
    choices: [
      { id: 'a', label: 'true and false', detail: 'Java writes these two Boolean keywords in lowercase.' },
      { id: 'b', label: 'up and down', detail: 'Those can describe lift directions, but the language values are true and false.' },
      { id: 'c', label: 'Any two strings', detail: 'Text can be compared, but a condition’s result is Boolean.' },
    ],
    correctChoice: 'a',
    hint: 'The two Java keywords mean yes and no.',
    recap: 'Java Boolean values are true and false.',
    xp: 10,
  },
  {
    id: 'java2-order-route',
    conceptId: 'java-conditions',
    eyebrow: 'Supply routes 3 of 5',
    title: 'Assemble the pod routing order',
    explanation:
      'Java puts a condition inside parentheses after if. Braces group the instructions for the true route, and else opens the alternate route.',
    analogy:
      'The lift reads inventory once, then travels either to the reserve deck or the ready rack.',
    type: 'ordering',
    prompt: 'Arrange the pieces into a complete two-route supply decision.',
    orderItems: [
      { id: 'ready', code: '    System.out.println("Send to ready rack");' },
      { id: 'if', code: 'if (podCount < 6) {' },
      { id: 'else', code: '} else {' },
      { id: 'reserve', code: '    System.out.println("Restock reserve");' },
      { id: 'end', code: '}' },
    ],
    correctOrder: ['if', 'reserve', 'else', 'ready', 'end'],
    incorrectMessage: 'Begin with if, place its route inside the first braces, open else, place the alternate route inside, then close the final brace.',
    output: 'Restock reserve',
    hint: 'The if line comes first. The final closing brace comes last.',
    recap: 'Java uses parentheses for the Boolean condition and braces to group both routes.',
    xp: 14,
  },
  {
    id: 'java2-fix-comparison',
    conceptId: 'java-comparisons',
    eyebrow: 'Diagnostic 4 of 5',
    title: 'Repair the deck check',
    explanation:
      'In Java, one equals sign assigns a value. Two equals signs compare primitive values such as integers. The if condition needs the comparison ==.',
    analogy:
      'The routing computer must inspect the deck number, not overwrite it while deciding where to stop.',
    type: 'bugfix',
    prompt: 'Repair the condition so it compares deckNumber with 4.',
    starterCode: 'public class Main {\n    public static void main(String[] args) {\n        int deckNumber = 4;\n\n        if (deckNumber = 4) {\n            System.out.println("Galley deck");\n        }\n    }\n}',
    focus: 'Change the single = inside the if parentheses to ==. Leave the earlier assignment unchanged.',
    codeGuide: [
      ...javaProgramFrame,
      { code: 'int deckNumber = 4;', plain: 'This assignment stores the whole number 4. One equals sign is correct in this instruction.' },
      { code: 'deckNumber == 4', plain: 'Two equals signs compare the stored integer with 4 and produce true or false.' },
      { code: 'if (...) { ... }', plain: 'Parentheses hold the condition. Braces group the instruction that runs when it is true.' },
    ],
    checks: [
      { pattern: 'if\\s*\\(\\s*deckNumber\\s*==\\s*4\\s*\\)', message: 'Use == inside the if parentheses to compare deckNumber with 4.' },
    ],
    output: 'Galley deck',
    hint: 'The repaired condition is if (deckNumber == 4) {',
    recap: 'In Java, = assigns and == compares primitive values such as integers.',
    xp: 16,
  },
  {
    id: 'java2-pod-decision',
    conceptId: 'java-conditions',
    eyebrow: 'Routing orders 5 of 5',
    title: 'Send pods to the right deck',
    explanation:
      'The < operator asks whether the value on the left is less than the value on the right. Java’s if and else blocks use that Boolean answer to choose one route.',
    analogy:
      'Fewer than six pods triggers a reserve restock. Six or more pods can move to the ready rack.',
    type: 'code',
    prompt: 'Replace the blank with a condition that detects fewer than 6 pods.',
    starterCode: 'public class Main {\n    public static void main(String[] args) {\n        int podCount = 4;\n\n        if (_____) {\n            System.out.println("Restock reserve");\n        } else {\n            System.out.println("Send to ready rack");\n        }\n    }\n}',
    focus: 'Replace the one _____ blank with podCount < 6. The parentheses and Java program frame are supplied.',
    codeGuide: [
      ...javaProgramFrame,
      { code: 'int podCount = 4;', plain: 'This familiar declaration stores a whole-number inventory reading.' },
      { code: 'podCount < 6', plain: 'The < symbol asks whether the stored count is less than 6. The answer is true for 4.' },
      { code: 'if (...) {', plain: 'if evaluates the question inside the parentheses and opens the true route.' },
      { code: '} else {', plain: 'else opens the alternate route used when the condition is false.' },
    ],
    checks: [
      { pattern: 'if\\s*\\(\\s*podCount\\s*<\\s*6\\s*\\)', message: 'Put podCount < 6 inside the supplied if parentheses.' },
    ],
    output: 'Restock reserve',
    hint: 'Write podCount < 6 in the blank. Read < as “is less than.”',
    recap: 'A Java if statement selects one brace group from a Boolean condition.',
    xp: 22,
  },
]

const pythonCargoLogicExercises: Exercise[] = [
  {
    id: 'py3-retrieve-route',
    conceptId: 'python-conditions',
    eyebrow: 'Memory ping 1 of 5',
    title: 'Recall the cargo route',
    explanation:
      'Begin with a familiar decision. Python checks whether the cargo count is below three, then runs only the matching indented route.',
    analogy:
      'The quartermaster reads one gauge. A low count opens the restock hatch; any other count sends the hold onward.',
    type: 'prediction',
    prompt: 'What will this familiar condition display?',
    displayCode: 'cargo_count = 2\n\nif cargo_count < 3:\n    print("Restock hold")\nelse:\n    print("Hold ready")',
    choices: [
      { id: 'a', label: 'Restock hold', detail: 'Two is less than three, so the first route runs.' },
      { id: 'b', label: 'Hold ready', detail: 'That route would run for three or more crates.' },
      { id: 'c', label: 'Both messages', detail: 'if and else choose one route, not both.' },
    ],
    correctChoice: 'a',
    output: 'Restock hold',
    hint: 'Read 2 < 3 as “is two less than three?”',
    recap: 'A true Python if condition runs its indented route and skips else.',
    xp: 8,
  },
  {
    id: 'py3-list-purpose',
    conceptId: 'python-collections',
    eyebrow: 'Hold registry 2 of 5',
    title: 'Meet a list',
    explanation:
      'A Python list keeps several values together under one variable name. Square brackets surround the items, and commas separate them.',
    analogy:
      'Instead of building one locker label per artifact, the cargo manifest keeps an ordered row inside one named container.',
    type: 'choice',
    prompt: 'Why use a list for the cargo manifest?',
    choices: [
      { id: 'a', label: 'To keep several related values together', detail: 'One ordered collection can hold the full manifest.' },
      { id: 'b', label: 'To hide every value forever', detail: 'A program can retrieve each item by its position.' },
      { id: 'c', label: 'To make Python ignore the cargo', detail: 'The list exists so the program can use the values.' },
    ],
    correctChoice: 'a',
    hint: 'Look for the answer about one container holding several related items.',
    recap: 'A Python list is an ordered collection written with square brackets and comma-separated items.',
    xp: 10,
  },
  {
    id: 'py3-first-index',
    conceptId: 'python-indexes',
    eyebrow: 'Locker address 3 of 5',
    title: 'Open position zero',
    explanation:
      'List positions are called indexes. Python starts counting those positions at zero, so index 0 retrieves the first item.',
    analogy:
      'The manifest computer labels its first slot 0, its second slot 1, and its third slot 2. That is the system’s map.',
    type: 'prediction',
    prompt: 'What does cargo[0] retrieve?',
    displayCode: 'cargo = ["crystal", "medkit", "map"]\nprint(cargo[0])',
    choices: [
      { id: 'a', label: 'crystal', detail: 'Index 0 is the first list position.' },
      { id: 'b', label: 'medkit', detail: 'That item is at index 1.' },
      { id: 'c', label: 'map', detail: 'That item is at index 2.' },
    ],
    correctChoice: 'a',
    output: 'crystal',
    hint: 'Python begins list indexes at 0, not 1.',
    recap: 'Use list_name[0] to retrieve the first item from a Python list.',
    xp: 14,
  },
  {
    id: 'py3-fix-index',
    conceptId: 'python-indexes',
    eyebrow: 'Manifest repair 4 of 5',
    title: 'Repair the last-slot address',
    explanation:
      'A three-item list has indexes 0, 1, and 2. Index 3 points one position beyond the list, so Python cannot retrieve an item there.',
    analogy:
      'The manifest has three lockers, but their addresses begin at zero. The last real locker is 2, not 3.',
    type: 'bugfix',
    prompt: 'Repair the index so the program displays map.',
    starterCode: 'cargo = ["crystal", "medkit", "map"]\n\nprint(cargo[3])',
    focus: 'Change the index 3 inside cargo[3] to 2. Leave the three list items in place.',
    codeGuide: [
      { code: 'cargo = [...]', plain: 'This stores three text values together in one ordered Python list.' },
      { code: '0, 1, 2', plain: 'These are the three valid indexes because Python starts counting positions at zero.' },
      { code: 'cargo[2]', plain: 'Square brackets after the variable name ask for the item at index 2, which is the third item.' },
    ],
    checks: [
      { pattern: 'print\\s*\\(\\s*cargo\\s*\\[\\s*2\\s*\\]\\s*\\)', message: 'Use index 2 to retrieve the third and final list item.' },
    ],
    output: 'map',
    hint: 'The three positions are 0, 1, and 2. Replace cargo[3] with cargo[2].',
    recap: 'For three items, index 2 is the final valid position because indexing starts at zero.',
    xp: 16,
  },
  {
    id: 'py3-cargo-report',
    conceptId: 'python-collections-and-indexes',
    eyebrow: 'Cargo report 5 of 5',
    title: 'Report the first and last relics',
    explanation:
      'A list lets one variable hold the whole manifest. Add an index in square brackets whenever you need one particular item.',
    analogy:
      'The bridge asks for the items at the two ends of the cargo row. Their manifest addresses are 0 and 2.',
    type: 'code',
    prompt: 'Replace both blanks so the report displays the first and last cargo items.',
    starterCode: 'cargo = ["crystal", "medkit", "map"]\n\nprint("First:", _____)\nprint("Last:", _____)',
    focus: 'Replace the first _____ with cargo[0] and the second with cargo[2].',
    codeGuide: [
      { code: 'cargo = ["crystal", "medkit", "map"]', plain: 'Square brackets create one ordered list containing three strings.' },
      { code: 'cargo[0]', plain: 'Index 0 retrieves crystal, the first value in the list.' },
      { code: 'cargo[2]', plain: 'Index 2 retrieves map, the third and final value in this three-item list.' },
      { code: 'print("First:", cargo[0])', plain: 'The comma lets print place a fixed label beside the retrieved list item.' },
    ],
    checks: [
      { pattern: 'print\\s*\\(\\s*["\\\']First:["\\\']\\s*,\\s*cargo\\s*\\[\\s*0\\s*\\]\\s*\\)', message: 'Use cargo[0] in the first print command.' },
      { pattern: 'print\\s*\\(\\s*["\\\']Last:["\\\']\\s*,\\s*cargo\\s*\\[\\s*2\\s*\\]\\s*\\)', message: 'Use cargo[2] in the second print command.' },
    ],
    output: 'First: crystal\nLast: map',
    hint: 'The two blanks are cargo[0] and cargo[2], in that order.',
    recap: 'A Python list keeps related values together, and a zero-based index retrieves one item.',
    xp: 22,
  },
]

const cppCargoArrayExercises: Exercise[] = [
  {
    id: 'cpp3-retrieve-route',
    conceptId: 'cpp-conditions',
    eyebrow: 'Memory ping 1 of 5',
    title: 'Recall the repair route',
    explanation:
      'Begin with a familiar decision. C++ compares the crate count with three and runs only the brace group selected by that condition.',
    analogy:
      'The engine room routes a small parts load to restocking and a full load straight to the forge.',
    type: 'prediction',
    prompt: 'What will this familiar C++ condition display?',
    displayCode: 'int crateCount = 2;\n\nif (crateCount < 3) {\n    std::cout << "Restock parts";\n} else {\n    std::cout << "Forge ready";\n}',
    choices: [
      { id: 'a', label: 'Restock parts', detail: 'Two is less than three, so the first brace group runs.' },
      { id: 'b', label: 'Forge ready', detail: 'That route would run for three or more crates.' },
      { id: 'c', label: 'Both messages', detail: 'if and else select one route.' },
    ],
    correctChoice: 'a',
    output: 'Restock parts',
    hint: 'The comparison 2 < 3 is true.',
    recap: 'A true C++ if condition runs its first brace group and skips else.',
    xp: 8,
  },
  {
    id: 'cpp3-array-purpose',
    conceptId: 'cpp-collections',
    eyebrow: 'Parts rack 2 of 5',
    title: 'Meet an array',
    explanation:
      'A C++ array keeps a fixed number of same-type values together under one name. Braces contain the starting items, separated by commas.',
    analogy:
      'A three-slot parts rack has one label and three ordered bays. Every bay in this rack holds the same kind of cargo.',
    type: 'choice',
    prompt: 'Why use an array for these engine parts?',
    choices: [
      { id: 'a', label: 'To keep related same-type values together', detail: 'One ordered rack can hold all three part names.' },
      { id: 'b', label: 'To remove every type rule', detail: 'A C++ array has one declared item type.' },
      { id: 'c', label: 'To make the values unordered', detail: 'Each array item has a stable position.' },
    ],
    correctChoice: 'a',
    hint: 'Look for the answer about an ordered group with one item type.',
    recap: 'A C++ array stores a fixed ordered group of values that share one type.',
    xp: 10,
  },
  {
    id: 'cpp3-first-index',
    conceptId: 'cpp-indexes',
    eyebrow: 'Rack address 3 of 5',
    title: 'Open position zero',
    explanation:
      'C++ array positions are indexes, and they start at zero. Index 0 retrieves the first item from the array.',
    analogy:
      'The engineering rack labels its first bay 0, then 1, then 2. The labels are addresses, not a count of parts.',
    type: 'prediction',
    prompt: 'What does parts[0] send to the console?',
    displayCode: 'std::string parts[3] = {"crystal", "coupler", "rune"};\nstd::cout << parts[0];',
    choices: [
      { id: 'a', label: 'crystal', detail: 'Index 0 is the first array position.' },
      { id: 'b', label: 'coupler', detail: 'That value is at index 1.' },
      { id: 'c', label: 'rune', detail: 'That value is at index 2.' },
    ],
    correctChoice: 'a',
    output: 'crystal',
    hint: 'C++ begins array indexes at 0, not 1.',
    recap: 'Use arrayName[0] to retrieve the first value in a C++ array.',
    xp: 14,
  },
  {
    id: 'cpp3-fix-index',
    conceptId: 'cpp-indexes',
    eyebrow: 'Rack repair 4 of 5',
    title: 'Repair the final-bay address',
    explanation:
      'A three-item C++ array has valid indexes 0, 1, and 2. Index 3 is outside the array and must not be read.',
    analogy:
      'The parts rack has three bays, but its zero-based address plate makes the final real bay number 2.',
    type: 'bugfix',
    prompt: 'Repair the index so the program displays rune.',
    starterCode: '#include <iostream>\n#include <string>\n\nint main() {\n    std::string parts[3] = {"crystal", "coupler", "rune"};\n    std::cout << parts[3];\n    return 0;\n}',
    focus: 'Change the index 3 inside parts[3] to 2. Leave the array size and values unchanged.',
    codeGuide: [
      ...cppProgramFrame,
      { code: '#include <string>', plain: 'This supplied line brings in the std::string text type used by the array.' },
      { code: 'std::string parts[3]', plain: 'This declares an array named parts with exactly three text slots.' },
      { code: 'parts[2]', plain: 'Index 2 retrieves the third item because C++ starts array positions at zero.' },
    ],
    checks: [
      { pattern: 'std::cout\\s*<<\\s*parts\\s*\\[\\s*2\\s*\\]\\s*;', message: 'Use index 2 to read the third and final array item.' },
    ],
    output: 'rune',
    hint: 'The three positions are 0, 1, and 2. Replace parts[3] with parts[2].',
    recap: 'A three-item C++ array ends at index 2 because array indexing starts at zero.',
    xp: 16,
  },
  {
    id: 'cpp3-parts-report',
    conceptId: 'cpp-collections-and-indexes',
    eyebrow: 'Forge report 5 of 5',
    title: 'Report the end parts',
    explanation:
      'The array keeps all three part names under one label. Square brackets select the particular slot that an output instruction needs.',
    analogy:
      'The chief engineer asks for the parts at both ends of the rack. Their addresses are 0 and 2.',
    type: 'code',
    prompt: 'Replace both blanks so the report displays the first and last parts.',
    starterCode: '#include <iostream>\n#include <string>\n\nint main() {\n    std::string parts[3] = {"crystal", "coupler", "rune"};\n\n    std::cout << "First: " << _____ << "\\n";\n    std::cout << "Last: " << _____ << "\\n";\n    return 0;\n}',
    focus: 'Replace the first _____ with parts[0] and the second with parts[2].',
    codeGuide: [
      ...cppProgramFrame,
      { code: 'std::string parts[3]', plain: 'The type comes first, parts is the array name, and [3] reserves three ordered text slots.' },
      { code: '{"crystal", "coupler", "rune"}', plain: 'Braces hold the three starting values, and commas separate one item from the next.' },
      { code: 'parts[0] and parts[2]', plain: 'These indexes retrieve the first and third values from the zero-based array.' },
      { code: '"\\n"', plain: 'This text escape moves the console to a new line after each part report.' },
    ],
    checks: [
      { pattern: '"First: "\\s*<<\\s*parts\\s*\\[\\s*0\\s*\\]', message: 'Send parts[0] after the First label.' },
      { pattern: '"Last: "\\s*<<\\s*parts\\s*\\[\\s*2\\s*\\]', message: 'Send parts[2] after the Last label.' },
    ],
    output: 'First: crystal\nLast: rune',
    hint: 'The two blanks are parts[0] and parts[2], in that order.',
    recap: 'A C++ array groups same-type values, and a zero-based index retrieves one slot.',
    xp: 22,
  },
]

const csharpCrewRosterExercises: Exercise[] = [
  {
    id: 'cs3-retrieve-route',
    conceptId: 'csharp-conditions',
    eyebrow: 'Memory ping 1 of 5',
    title: 'Recall the watch route',
    explanation:
      'Begin with a familiar decision. C# checks whether fewer than three officers are ready and runs only the selected brace group.',
    analogy:
      'A short bridge watch opens the reserve roster. A full watch continues to the command deck.',
    type: 'prediction',
    prompt: 'What will this familiar C# condition display?',
    displayCode: 'int crewCount = 2;\n\nif (crewCount < 3)\n{\n    Console.WriteLine("Call reserves");\n}\nelse\n{\n    Console.WriteLine("Watch ready");\n}',
    choices: [
      { id: 'a', label: 'Call reserves', detail: 'Two is less than three, so the first brace group runs.' },
      { id: 'b', label: 'Watch ready', detail: 'That route would run for three or more officers.' },
      { id: 'c', label: 'Both messages', detail: 'if and else select one route.' },
    ],
    correctChoice: 'a',
    output: 'Call reserves',
    hint: 'The comparison 2 < 3 is true.',
    recap: 'A true C# if condition runs the first brace group and skips else.',
    xp: 8,
  },
  {
    id: 'cs3-array-purpose',
    conceptId: 'csharp-collections',
    eyebrow: 'Roster registry 2 of 5',
    title: 'Meet an array',
    explanation:
      'A C# array keeps several same-type values together under one name. Square brackets after the type mark it as an array.',
    analogy:
      'The captain uses one ordered duty roster instead of a separate clipboard for every crew member.',
    type: 'choice',
    prompt: 'Why use an array for this bridge roster?',
    choices: [
      { id: 'a', label: 'To keep related same-type values together', detail: 'One ordered roster can hold all three names.' },
      { id: 'b', label: 'To erase the order of the names', detail: 'Every array item has a stable position.' },
      { id: 'c', label: 'To remove the string type', detail: 'The string[] type explains what every slot holds.' },
    ],
    correctChoice: 'a',
    hint: 'Look for the answer about one ordered group of related names.',
    recap: 'A C# array stores an ordered group of values that share one declared type.',
    xp: 10,
  },
  {
    id: 'cs3-first-index',
    conceptId: 'csharp-indexes',
    eyebrow: 'Roster address 3 of 5',
    title: 'Call position zero',
    explanation:
      'C# array positions are indexes, and they start at zero. Index 0 retrieves the first crew name.',
    analogy:
      'The bridge roster labels its first station 0, followed by stations 1 and 2. These are computer addresses.',
    type: 'prediction',
    prompt: 'What does crew[0] display?',
    displayCode: 'string[] crew = { "Mira", "Tov", "Pip" };\nConsole.WriteLine(crew[0]);',
    choices: [
      { id: 'a', label: 'Mira', detail: 'Index 0 is the first array position.' },
      { id: 'b', label: 'Tov', detail: 'That name is at index 1.' },
      { id: 'c', label: 'Pip', detail: 'That name is at index 2.' },
    ],
    correctChoice: 'a',
    output: 'Mira',
    hint: 'C# begins array indexes at 0, not 1.',
    recap: 'Use arrayName[0] to retrieve the first value in a C# array.',
    xp: 14,
  },
  {
    id: 'cs3-fix-index',
    conceptId: 'csharp-indexes',
    eyebrow: 'Roster repair 4 of 5',
    title: 'Repair the final-station address',
    explanation:
      'A three-item C# array has valid indexes 0, 1, and 2. Index 3 is one position beyond the roster.',
    analogy:
      'There are three bridge stations, but their zero-based plates make the final real station number 2.',
    type: 'bugfix',
    prompt: 'Repair the index so the program displays Pip.',
    starterCode: 'string[] crew = { "Mira", "Tov", "Pip" };\n\nConsole.WriteLine(crew[3]);',
    focus: 'Change the index 3 inside crew[3] to 2. Leave the three crew names in place.',
    codeGuide: [
      { code: 'string[]', plain: 'The string type holds text, and the empty square brackets mark this variable as an array.' },
      { code: '{ "Mira", "Tov", "Pip" }', plain: 'Braces contain the three starting names, separated by commas.' },
      { code: 'crew[2]', plain: 'Index 2 retrieves the third name because C# starts array positions at zero.' },
    ],
    checks: [
      { pattern: 'Console\\.WriteLine\\s*\\(\\s*crew\\s*\\[\\s*2\\s*\\]\\s*\\)\\s*;', message: 'Use index 2 to retrieve the third and final crew name.' },
    ],
    output: 'Pip',
    hint: 'The three positions are 0, 1, and 2. Replace crew[3] with crew[2].',
    recap: 'A three-item C# array ends at index 2 because indexing starts at zero.',
    xp: 16,
  },
  {
    id: 'cs3-roster-report',
    conceptId: 'csharp-collections-and-indexes',
    eyebrow: 'Bridge report 5 of 5',
    title: 'Report the first and last officers',
    explanation:
      'The array stores the entire bridge roster under one name. Add a zero-based index whenever the report needs one crew member.',
    analogy:
      'The captain asks who stands at both ends of the command row. Their roster addresses are 0 and 2.',
    type: 'code',
    prompt: 'Replace both blanks so the report displays the first and last crew names.',
    starterCode: 'string[] crew = { "Mira", "Tov", "Pip" };\n\nConsole.WriteLine($"First: {_____}");\nConsole.WriteLine($"Last: {_____}");',
    focus: 'Replace the first _____ with crew[0] and the second with crew[2].',
    codeGuide: [
      { code: 'string[] crew', plain: 'string[] is the array type, and crew is the one name for the complete roster.' },
      { code: '{ "Mira", "Tov", "Pip" }', plain: 'The braces initialize three ordered string values, separated by commas.' },
      { code: 'crew[0] and crew[2]', plain: 'These zero-based indexes retrieve the first and third crew names.' },
      { code: '$"First: {crew[0]}"', plain: 'The $ creates an interpolated string, and the braces insert the selected array item.' },
    ],
    checks: [
      { pattern: '\\{\\s*crew\\s*\\[\\s*0\\s*\\]\\s*\\}', message: 'Put crew[0] inside the first interpolated braces.' },
      { pattern: '\\{\\s*crew\\s*\\[\\s*2\\s*\\]\\s*\\}', message: 'Put crew[2] inside the second interpolated braces.' },
    ],
    output: 'First: Mira\nLast: Pip',
    hint: 'The two blanks are crew[0] and crew[2], in that order.',
    recap: 'A C# array groups related values, and a zero-based index retrieves one element.',
    xp: 22,
  },
]

const javaCrewArrayExercises: Exercise[] = [
  {
    id: 'java3-retrieve-route',
    conceptId: 'java-conditions',
    eyebrow: 'Memory ping 1 of 5',
    title: 'Recall the lift route',
    explanation:
      'Begin with a familiar decision. Java checks whether fewer than three droids are ready and runs only the selected brace group.',
    analogy:
      'A short service watch calls the reserve droids. A full watch sends the lift to its normal route.',
    type: 'prediction',
    prompt: 'What will this familiar Java condition display?',
    displayCode: 'int droidCount = 2;\n\nif (droidCount < 3) {\n    System.out.println("Call reserves");\n} else {\n    System.out.println("Watch ready");\n}',
    choices: [
      { id: 'a', label: 'Call reserves', detail: 'Two is less than three, so the first brace group runs.' },
      { id: 'b', label: 'Watch ready', detail: 'That route would run for three or more droids.' },
      { id: 'c', label: 'Both messages', detail: 'if and else select one route.' },
    ],
    correctChoice: 'a',
    output: 'Call reserves',
    hint: 'The comparison 2 < 3 is true.',
    recap: 'A true Java if condition runs the first brace group and skips else.',
    xp: 8,
  },
  {
    id: 'java3-array-purpose',
    conceptId: 'java-collections',
    eyebrow: 'Watch registry 2 of 5',
    title: 'Meet an array',
    explanation:
      'A Java array keeps several same-type values together under one name. Square brackets after the type mark the variable as an array.',
    analogy:
      'The service guild keeps one ordered watch roster instead of a separate tablet for every droid.',
    type: 'choice',
    prompt: 'Why use an array for this droid roster?',
    choices: [
      { id: 'a', label: 'To keep related same-type values together', detail: 'One ordered roster can hold all three droid names.' },
      { id: 'b', label: 'To make Java forget every type', detail: 'The String[] type applies to every slot.' },
      { id: 'c', label: 'To erase the order of the names', detail: 'Every array item has a stable position.' },
    ],
    correctChoice: 'a',
    hint: 'Look for the answer about one ordered group of related names.',
    recap: 'A Java array stores an ordered group of values that share one declared type.',
    xp: 10,
  },
  {
    id: 'java3-first-index',
    conceptId: 'java-indexes',
    eyebrow: 'Roster address 3 of 5',
    title: 'Call position zero',
    explanation:
      'Java array positions are indexes, and they start at zero. Index 0 retrieves the first droid name.',
    analogy:
      'The service roster labels its first station 0, followed by stations 1 and 2. These are computer addresses.',
    type: 'prediction',
    prompt: 'What does droids[0] display?',
    displayCode: 'String[] droids = { "MOP-1", "BEEP-7", "HEX-3" };\nSystem.out.println(droids[0]);',
    choices: [
      { id: 'a', label: 'MOP-1', detail: 'Index 0 is the first array position.' },
      { id: 'b', label: 'BEEP-7', detail: 'That name is at index 1.' },
      { id: 'c', label: 'HEX-3', detail: 'That name is at index 2.' },
    ],
    correctChoice: 'a',
    output: 'MOP-1',
    hint: 'Java begins array indexes at 0, not 1.',
    recap: 'Use arrayName[0] to retrieve the first value in a Java array.',
    xp: 14,
  },
  {
    id: 'java3-fix-index',
    conceptId: 'java-indexes',
    eyebrow: 'Roster repair 4 of 5',
    title: 'Repair the final-station address',
    explanation:
      'A three-item Java array has valid indexes 0, 1, and 2. Index 3 is one position beyond the roster.',
    analogy:
      'There are three service stations, but their zero-based plates make the final real station number 2.',
    type: 'bugfix',
    prompt: 'Repair the index so the program displays HEX-3.',
    starterCode: 'public class Main {\n    public static void main(String[] args) {\n        String[] droids = { "MOP-1", "BEEP-7", "HEX-3" };\n        System.out.println(droids[3]);\n    }\n}',
    focus: 'Change the index 3 inside droids[3] to 2. Leave the three droid names in place.',
    codeGuide: [
      ...javaProgramFrame,
      { code: 'String[]', plain: 'The String type holds text, and the empty square brackets mark this variable as an array.' },
      { code: '{ "MOP-1", "BEEP-7", "HEX-3" }', plain: 'Braces contain the three starting names, separated by commas.' },
      { code: 'droids[2]', plain: 'Index 2 retrieves the third name because Java starts array positions at zero.' },
    ],
    checks: [
      { pattern: 'System\\.out\\.println\\s*\\(\\s*droids\\s*\\[\\s*2\\s*\\]\\s*\\)\\s*;', message: 'Use index 2 to retrieve the third and final droid name.' },
    ],
    output: 'HEX-3',
    hint: 'The three positions are 0, 1, and 2. Replace droids[3] with droids[2].',
    recap: 'A three-item Java array ends at index 2 because indexing starts at zero.',
    xp: 16,
  },
  {
    id: 'java3-roster-report',
    conceptId: 'java-collections-and-indexes',
    eyebrow: 'Guild report 5 of 5',
    title: 'Report the first and last droids',
    explanation:
      'The Java array stores the complete watch roster under one name. Add a zero-based index whenever the report needs one droid.',
    analogy:
      'The guild master asks who stands at both ends of the service row. Their roster addresses are 0 and 2.',
    type: 'code',
    prompt: 'Replace both blanks so the report displays the first and last droid names.',
    starterCode: 'public class Main {\n    public static void main(String[] args) {\n        String[] droids = { "MOP-1", "BEEP-7", "HEX-3" };\n\n        System.out.println("First: " + _____);\n        System.out.println("Last: " + _____);\n    }\n}',
    focus: 'Replace the first _____ with droids[0] and the second with droids[2]. Leave the Java program frame alone.',
    codeGuide: [
      ...javaProgramFrame,
      { code: 'String[] droids', plain: 'String[] is the array type, and droids is the one name for the complete roster.' },
      { code: '{ "MOP-1", "BEEP-7", "HEX-3" }', plain: 'The braces initialize three ordered string values, separated by commas.' },
      { code: 'droids[0] and droids[2]', plain: 'These zero-based indexes retrieve the first and third droid names.' },
      { code: '"First: " + droids[0]', plain: 'The + operator joins the fixed label to the selected array value.' },
    ],
    checks: [
      { pattern: '"First: "\\s*\\+\\s*droids\\s*\\[\\s*0\\s*\\]', message: 'Join droids[0] after the First label.' },
      { pattern: '"Last: "\\s*\\+\\s*droids\\s*\\[\\s*2\\s*\\]', message: 'Join droids[2] after the Last label.' },
    ],
    output: 'First: MOP-1\nLast: HEX-3',
    hint: 'The two blanks are droids[0] and droids[2], in that order.',
    recap: 'A Java array groups related values, and a zero-based index retrieves one element.',
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
      mission('py-signal-protocol', 'python', 2, 'Signal Protocol', 'Make decisions', 'Booleans and if statements route a mysterious transmission.', 'satellite', 'locked', pythonSignalProtocolExercises),
      mission('py-cargo-logic', 'python', 3, 'Cargo Logic', 'Organize the hold', 'Lists keep a nearly unlimited cargo manifest under control.', 'package', 'locked', pythonCargoLogicExercises),
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
      mission('cpp-hull-logic', 'cpp', 2, 'Hull Logic', 'Choose a repair route', 'Conditions help the damage-control system choose what happens next.', 'shield', 'locked', cppHullLogicExercises),
      mission('cpp-cargo-array', 'cpp', 3, 'Cargo Array', 'Address every part', 'Arrays keep an ordered expedition manifest under one name.', 'package', 'locked', cppCargoArrayExercises),
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
      mission('cs-command-logic', 'csharp', 2, 'Command Logic', 'Choose under pressure', 'Conditions let your ship respond to changing situations.', 'shield', 'locked', csharpCommandLogicExercises),
      mission('cs-crew-roster', 'csharp', 3, 'Crew Roster', 'Manage the manifest', 'Arrays organize specialists, familiars, and one suspicious goat.', 'package', 'locked', csharpCrewRosterExercises),
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
      mission('java-routing-orders', 'java', 2, 'Routing Orders', 'Choose the right deck', 'Conditions send supplies to the places that need them.', 'satellite', 'locked', javaRoutingOrdersExercises),
      mission('java-crew-array', 'java', 3, 'Crew Array', 'Organize the watch', 'Arrays keep a growing service-droid manifest in order.', 'package', 'locked', javaCrewArrayExercises),
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
