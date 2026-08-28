import type { Exercise, LanguageId, LanguageTrack, Mission } from '../types'
import { durableCurriculumV1 } from './durable-curriculum-v1'
import { foundationTrackMetadataByLanguage } from './foundation-track-metadata'

type FoundationExercise = Omit<Exercise, 'id' | 'conceptId' | 'xp'>

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

const pythonExercises: FoundationExercise[] = [
  {
    eyebrow: 'Orientation 1 of 5',
    title: 'Meet the console',
    explanation:
      'A program is a list of instructions for a computer. The console is the text window where your program can report what it did.',
    analogy:
      'Think of it as a text message sent by the program. The program writes the message, and the console shows it to you.',
    type: 'choice',
    prompt: 'What job does the console do?',
    choices: [
      { id: 'a', label: 'Shows text from the program', detail: 'A place to see the program speak.' },
      { id: 'b', label: 'Fixes every mistake automatically', detail: 'The console can show an error, but it does not fix the code for you.' },
      { id: 'c', label: 'Stores every file forever', detail: 'That would be storage, not the console.' },
    ],
    correctChoice: 'a',
    hint: 'Look for the answer that describes a text window.',
    recap: 'The console displays text and other information produced by your program.',
  },
  {
    eyebrow: 'Transmission 2 of 5',
    title: 'Print your first message',
    explanation:
      'Python uses print to show text in the Output box. Text goes inside quotation marks so Python knows it is a message, not another instruction.',
    analogy:
      'Think of print as a label maker. The words inside quotation marks are the label it produces.',
    type: 'code',
    prompt: 'Replace the blank with print so the Output box shows Signal online.',
    starterCode: '# Show a message\n_____("Signal online")',
    focus: 'Replace the one _____ blank with print. Leave the message and its punctuation in place.',
    codeGuide: [
      { code: '# Show a message', plain: 'A line beginning with # is a comment for humans. Python ignores it when the program runs.' },
      { code: 'print', plain: 'This is a built-in Python instruction that shows something in the Output box.' },
      { code: '("Signal online")', plain: 'Parentheses hold what print should use. Quotation marks tell Python that Signal online is text.' },
    ],
    checks: [
      { pattern: 'print\\s*\\(\\s*["\\\']Signal online["\\\']\\s*\\)', message: 'Use print, then put the exact message inside parentheses.' },
    ],
    output: 'Signal online',
    hint: 'The command is print("Signal online"). Type it exactly, including the parentheses.',
    recap: 'Use print("message") whenever a Python program needs to display text.',
  },
  {
    eyebrow: 'Cargo label 3 of 5',
    title: 'Store text in a variable',
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
  },
  {
    eyebrow: 'Supply count 4 of 5',
    title: 'Store a number in a variable',
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
  },
  {
    eyebrow: 'Bridge check 5 of 5',
    title: 'Print values from variables',
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
  },
]

const cppExercises: FoundationExercise[] = [
  {
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
  },
  {
    eyebrow: 'Status line 2 of 5',
    title: 'Print your first message',
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
  },
  {
    eyebrow: 'Core registry 3 of 5',
    title: 'Store text in a variable',
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
  },
  {
    eyebrow: 'Charge test 4 of 5',
    title: 'Store a number in a variable',
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
  },
  {
    eyebrow: 'Ignition check 5 of 5',
    title: 'Print values from variables',
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
  },
]

const csharpExercises: FoundationExercise[] = [
  {
    eyebrow: 'Shield school 1 of 5',
    title: 'Meet the .NET runtime',
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
  },
  {
    eyebrow: 'Status line 2 of 5',
    title: 'Print your first message',
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
  },
  {
    eyebrow: 'Shield registry 3 of 5',
    title: 'Store text in a variable',
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
  },
  {
    eyebrow: 'Power test 4 of 5',
    title: 'Store a number in a variable',
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
  },
  {
    eyebrow: 'Tactical check 5 of 5',
    title: 'Print values from variables',
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
  },
]

const javaExercises: FoundationExercise[] = [
  {
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
  },
  {
    eyebrow: 'Galley report 2 of 5',
    title: 'Print your first message',
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
  },
  {
    eyebrow: 'Blend registry 3 of 5',
    title: 'Store text in a variable',
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
  },
  {
    eyebrow: 'Supply count 4 of 5',
    title: 'Store a number in a variable',
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
  },
  {
    eyebrow: 'Morning watch 5 of 5',
    title: 'Print values from variables',
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
  },
]

const pythonSignalProtocolExercises: FoundationExercise[] = [
  {
    eyebrow: 'Memory ping 1 of 5',
    title: 'Predict what the code displays',
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
  },
  {
    eyebrow: 'Decision school 2 of 5',
    title: 'Meet a true-or-false value',
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
  },
  {
    eyebrow: 'Route planner 3 of 5',
    title: 'Put the branches in order',
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
  },
  {
    eyebrow: 'Diagnostic 4 of 5',
    title: 'Fix the condition',
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
  },
  {
    eyebrow: 'Signal protocol 5 of 5',
    title: 'Choose the matching branch',
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
  },
]

const cppHullLogicExercises: FoundationExercise[] = [
  {
    eyebrow: 'Memory ping 1 of 5',
    title: 'Predict what the code displays',
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
  },
  {
    eyebrow: 'Damage control 2 of 5',
    title: 'Meet a true-or-false value',
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
  },
  {
    eyebrow: 'Repair routes 3 of 5',
    title: 'Put the branches in order',
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
  },
  {
    eyebrow: 'Diagnostic 4 of 5',
    title: 'Fix the condition',
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
  },
  {
    eyebrow: 'Hull logic 5 of 5',
    title: 'Choose the matching branch',
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
  },
]

const csharpCommandLogicExercises: FoundationExercise[] = [
  {
    eyebrow: 'Memory ping 1 of 5',
    title: 'Predict what the code displays',
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
  },
  {
    eyebrow: 'Command school 2 of 5',
    title: 'Meet a true-or-false value',
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
  },
  {
    eyebrow: 'Tactical routes 3 of 5',
    title: 'Put the branches in order',
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
  },
  {
    eyebrow: 'Diagnostic 4 of 5',
    title: 'Fix the condition',
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
  },
  {
    eyebrow: 'Command logic 5 of 5',
    title: 'Choose the matching branch',
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
  },
]

const javaRoutingOrdersExercises: FoundationExercise[] = [
  {
    eyebrow: 'Memory ping 1 of 5',
    title: 'Predict what the code displays',
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
  },
  {
    eyebrow: 'Routing school 2 of 5',
    title: 'Meet a true-or-false value',
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
  },
  {
    eyebrow: 'Supply routes 3 of 5',
    title: 'Put the branches in order',
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
  },
  {
    eyebrow: 'Diagnostic 4 of 5',
    title: 'Fix the condition',
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
  },
  {
    eyebrow: 'Routing orders 5 of 5',
    title: 'Choose the matching branch',
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
  },
]

const pythonCargoLogicExercises: FoundationExercise[] = [
  {
    eyebrow: 'Memory ping 1 of 5',
    title: 'Predict what the condition does',
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
  },
  {
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
  },
  {
    eyebrow: 'Locker address 3 of 5',
    title: 'Read the first item',
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
  },
  {
    eyebrow: 'Manifest repair 4 of 5',
    title: 'Fix the last position',
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
  },
  {
    eyebrow: 'Cargo report 5 of 5',
    title: 'Read the first and last items',
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
  },
]

const cppCargoArrayExercises: FoundationExercise[] = [
  {
    eyebrow: 'Memory ping 1 of 5',
    title: 'Predict what the condition does',
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
  },
  {
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
  },
  {
    eyebrow: 'Rack address 3 of 5',
    title: 'Read the first item',
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
  },
  {
    eyebrow: 'Rack repair 4 of 5',
    title: 'Fix the last position',
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
  },
  {
    eyebrow: 'Forge report 5 of 5',
    title: 'Read the first and last items',
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
  },
]

const csharpCrewRosterExercises: FoundationExercise[] = [
  {
    eyebrow: 'Memory ping 1 of 5',
    title: 'Predict what the condition does',
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
  },
  {
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
  },
  {
    eyebrow: 'Roster address 3 of 5',
    title: 'Read the first item',
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
  },
  {
    eyebrow: 'Roster repair 4 of 5',
    title: 'Fix the last position',
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
  },
  {
    eyebrow: 'Bridge report 5 of 5',
    title: 'Read the first and last items',
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
  },
]

const javaCrewArrayExercises: FoundationExercise[] = [
  {
    eyebrow: 'Memory ping 1 of 5',
    title: 'Predict what the condition does',
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
  },
  {
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
  },
  {
    eyebrow: 'Roster address 3 of 5',
    title: 'Read the first item',
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
  },
  {
    eyebrow: 'Roster repair 4 of 5',
    title: 'Fix the last position',
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
  },
  {
    eyebrow: 'Guild report 5 of 5',
    title: 'Read the first and last items',
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
  },
]

const pythonLoopingOrbitExercises: FoundationExercise[] = [
  {
    eyebrow: 'Memory ping 1 of 5',
    title: 'Read an item by position',
    explanation:
      'Begin with a familiar list. Python starts list indexes at zero, so index 1 retrieves the second item from this three-item manifest.',
    analogy:
      'The cargo computer follows the address plate 1 to the middle locker in a row labeled 0, 1, and 2.',
    type: 'prediction',
    prompt: 'What will this familiar list lookup display?',
    displayCode: 'cargo = ["crystal", "medkit", "map"]\nprint(cargo[1])',
    choices: [
      { id: 'a', label: 'medkit', detail: 'Index 1 is the second position.' },
      { id: 'b', label: 'crystal', detail: 'That item is at index 0.' },
      { id: 'c', label: 'map', detail: 'That item is at index 2.' },
    ],
    correctChoice: 'a',
    output: 'medkit',
    hint: 'Count the list positions as 0, 1, and 2.',
    recap: 'Index 1 retrieves the second item from a zero-based Python list.',
  },
  {
    eyebrow: 'Orbit school 2 of 5',
    title: 'Meet a loop',
    explanation:
      'A loop repeats a group of instructions. A Python for loop can visit each item in a list so you do not copy the same print command again and again.',
    analogy:
      'The scanner follows one checklist around every moon in orbit instead of receiving a separate handwritten order for each moon.',
    type: 'choice',
    prompt: 'Why use a loop to inspect the cargo list?',
    choices: [
      { id: 'a', label: 'To repeat one action for each item', detail: 'The loop visits the collection one value at a time.' },
      { id: 'b', label: 'To erase the list after one item', detail: 'The list remains available after the loop.' },
      { id: 'c', label: 'To make every item identical', detail: 'A loop can process different values with one instruction shape.' },
    ],
    correctChoice: 'a',
    hint: 'Look for the answer about one instruction working across several items.',
    recap: 'A loop repeats a useful action without copying the same code for every list item.',
  },
  {
    eyebrow: 'Scanner pass 3 of 5',
    title: 'Trace two loop passes',
    explanation:
      'On each pass, item temporarily holds the next list value. The indented print instruction runs once for crystal and once for map.',
    analogy:
      'One inspection badge is handed to each artifact in turn. The scanner reads whichever artifact currently wears it.',
    type: 'prediction',
    prompt: 'What two lines will this loop display?',
    displayCode: 'cargo = ["crystal", "map"]\n\nfor item in cargo:\n    print(item)',
    choices: [
      { id: 'a', label: 'crystal then map', detail: 'The loop visits both values in list order.' },
      { id: 'b', label: 'item then item', detail: 'item retrieves the current stored value, not its own label.' },
      { id: 'c', label: 'Only crystal', detail: 'The loop continues to the second list item.' },
    ],
    correctChoice: 'a',
    output: 'crystal\nmap',
    hint: 'Trace the first pass with item as crystal, then the second with item as map.',
    recap: 'A Python for loop visits every list value in order and runs its indented body each time.',
  },
  {
    eyebrow: 'Flight plan 4 of 5',
    title: 'Put the loop in order',
    explanation:
      'Python must create the list before a loop can visit it. The for line opens the repeated route, and the indented instruction forms its body.',
    analogy:
      'Load the manifest, begin the orbit, then run the scanner inside that orbit. The order makes the flight plan possible.',
    type: 'ordering',
    prompt: 'Arrange the pieces into a complete cargo scan.',
    orderItems: [
      { id: 'print', code: '    print(item)' },
      { id: 'list', code: 'cargo = ["crystal", "medkit", "map"]' },
      { id: 'loop', code: 'for item in cargo:' },
    ],
    correctOrder: ['list', 'loop', 'print'],
    incorrectMessage: 'Create cargo first, open the for loop second, then place the indented print instruction inside it.',
    output: 'crystal\nmedkit\nmap',
    hint: 'The list must exist before the for line can visit it.',
    recap: 'Create the collection, open the loop, then indent the instruction that repeats.',
  },
  {
    eyebrow: 'Orbit report 5 of 5',
    title: 'Process every item',
    explanation:
      'The for loop needs the collection it should visit. Once cargo fills that blank, item receives each stored value and the same report line runs three times.',
    analogy:
      'Connect the scanner route to the cargo manifest. One sweep then reports every artifact without three copied commands.',
    type: 'code',
    prompt: 'Replace the blank so the loop visits every item in cargo.',
    starterCode: 'cargo = ["crystal", "medkit", "map"]\n\nfor item in _____:\n    print("Scanned:", item)',
    focus: 'Replace the one _____ blank with cargo. Leave item as the temporary name for each value.',
    codeGuide: [
      { code: 'cargo = [...]', plain: 'This familiar list stores all three manifest values under one collection name.' },
      { code: 'for item in cargo:', plain: 'Read this as “for each item in cargo.” The colon opens the indented loop body.' },
      { code: 'item', plain: 'This temporary loop variable holds one current list value, then the next, until the list is finished.' },
      { code: '    print("Scanned:", item)', plain: 'Indentation places this report inside the loop, so it runs once for every current item.' },
    ],
    checks: [
      { pattern: 'for\\s+item\\s+in\\s+cargo\\s*:', message: 'Put cargo after in so the loop knows which list to visit.' },
      { pattern: '\\n\\s+print\\s*\\(\\s*["\\\']Scanned:["\\\']\\s*,\\s*item\\s*\\)', message: 'Keep the indented print command using the temporary item variable.' },
    ],
    output: 'Scanned: crystal\nScanned: medkit\nScanned: map',
    hint: 'The loop header should read for item in cargo:',
    recap: 'A Python for loop can visit every list item with one indented instruction body.',
  },
]

const cppEngineLoopExercises: FoundationExercise[] = [
  {
    eyebrow: 'Memory ping 1 of 5',
    title: 'Read an item by position',
    explanation:
      'Begin with a familiar array. C++ starts indexes at zero, so index 1 retrieves the second part from this three-slot rack.',
    analogy:
      'The engine-room computer follows address 1 to the middle bay in a rack labeled 0, 1, and 2.',
    type: 'prediction',
    prompt: 'What will this familiar array lookup display?',
    displayCode: 'std::string parts[3] = {"crystal", "coupler", "rune"};\nstd::cout << parts[1];',
    choices: [
      { id: 'a', label: 'coupler', detail: 'Index 1 is the second position.' },
      { id: 'b', label: 'crystal', detail: 'That part is at index 0.' },
      { id: 'c', label: 'rune', detail: 'That part is at index 2.' },
    ],
    correctChoice: 'a',
    output: 'coupler',
    hint: 'Count the array positions as 0, 1, and 2.',
    recap: 'Index 1 retrieves the second item from a zero-based C++ array.',
  },
  {
    eyebrow: 'Engine cycle 2 of 5',
    title: 'Meet a loop',
    explanation:
      'A loop repeats a group of instructions. A range-based C++ for loop can visit every array value without copying the output line for each part.',
    analogy:
      'One maintenance arm follows the same inspection movement over every bay in the parts rack.',
    type: 'choice',
    prompt: 'Why use a loop to inspect the parts array?',
    choices: [
      { id: 'a', label: 'To repeat one action for each part', detail: 'The loop visits the array one value at a time.' },
      { id: 'b', label: 'To change every part into a number', detail: 'The array continues to hold text values.' },
      { id: 'c', label: 'To remove the array type', detail: 'The loop works with the array’s declared string values.' },
    ],
    correctChoice: 'a',
    hint: 'Look for the answer about one instruction working across several array values.',
    recap: 'A C++ loop repeats an action without copying the same code for every array item.',
  },
  {
    eyebrow: 'Inspection pass 3 of 5',
    title: 'Trace two loop passes',
    explanation:
      'On each pass, part temporarily holds the next array value. The brace-group output runs once for crystal and once for rune.',
    analogy:
      'A single inspection tag moves from the first component to the second. The display reads the component currently carrying it.',
    type: 'prediction',
    prompt: 'What two lines will this loop display?',
    displayCode: 'std::string parts[2] = {"crystal", "rune"};\n\nfor (std::string part : parts) {\n    std::cout << part << "\\n";\n}',
    choices: [
      { id: 'a', label: 'crystal then rune', detail: 'The loop visits both values in array order.' },
      { id: 'b', label: 'part then part', detail: 'part retrieves the current stored value.' },
      { id: 'c', label: 'Only crystal', detail: 'The loop continues to the second value.' },
    ],
    correctChoice: 'a',
    output: 'crystal\nrune',
    hint: 'Trace one pass with part as crystal, then another with part as rune.',
    recap: 'A range-based C++ for loop visits every array value in order.',
  },
  {
    eyebrow: 'Work order 4 of 5',
    title: 'Put the loop in order',
    explanation:
      'C++ must create the array before the loop uses it. The for line opens a brace group, the output goes inside, and the final brace closes the repeated work.',
    analogy:
      'Load the parts rack, start the maintenance arm, inspect inside its cycle, then close the work boundary.',
    type: 'ordering',
    prompt: 'Arrange the pieces into a complete parts inspection.',
    orderItems: [
      { id: 'print', code: '    std::cout << part << "\\n";' },
      { id: 'end', code: '}' },
      { id: 'array', code: 'std::string parts[3] = {"crystal", "coupler", "rune"};' },
      { id: 'loop', code: 'for (std::string part : parts) {' },
    ],
    correctOrder: ['array', 'loop', 'print', 'end'],
    incorrectMessage: 'Create parts first, open the for loop, place the output inside its braces, then close the final brace.',
    output: 'crystal\ncoupler\nrune',
    hint: 'The array comes first and the final closing brace comes last.',
    recap: 'Create the array, open the loop, run its body, then close the loop brace.',
  },
  {
    eyebrow: 'Engine report 5 of 5',
    title: 'Process every item',
    explanation:
      'The range-based for loop needs the array it should visit. Once parts fills the blank, part receives each string and the same report runs three times.',
    analogy:
      'Connect the maintenance arm to the named rack. One cycle then checks every component without copied commands.',
    type: 'code',
    prompt: 'Replace the blank so the loop visits every value in parts.',
    starterCode: '#include <iostream>\n#include <string>\n\nint main() {\n    std::string parts[3] = {"crystal", "coupler", "rune"};\n\n    for (std::string part : _____) {\n        std::cout << "Checked: " << part << "\\n";\n    }\n    return 0;\n}',
    focus: 'Replace the one _____ blank with parts. Leave part as the temporary name for each value.',
    codeGuide: [
      ...cppProgramFrame,
      { code: 'std::string parts[3]', plain: 'This familiar array stores three text values in one fixed, ordered collection.' },
      { code: 'for (std::string part : parts)', plain: 'Read this as “for each string called part from parts.” The colon separates the temporary value name from the collection.' },
      { code: 'part', plain: 'This temporary loop variable holds one current array value, then the next, until the array is finished.' },
      { code: '{ ... }', plain: 'The braces group the output instruction that repeats once for every current part.' },
    ],
    checks: [
      { pattern: 'for\\s*\\(\\s*std::string\\s+part\\s*:\\s*parts\\s*\\)', message: 'Put parts after the colon so the loop knows which array to visit.' },
      { pattern: 'std::cout\\s*<<\\s*"Checked: "\\s*<<\\s*part', message: 'Keep the output instruction using the temporary part variable.' },
    ],
    output: 'Checked: crystal\nChecked: coupler\nChecked: rune',
    hint: 'The loop header should read for (std::string part : parts) {',
    recap: 'A range-based C++ for loop visits every array value with one brace-group body.',
  },
]

const csharpPatrolLoopExercises: FoundationExercise[] = [
  {
    eyebrow: 'Memory ping 1 of 5',
    title: 'Read an item by position',
    explanation:
      'Begin with a familiar array. C# starts indexes at zero, so index 1 retrieves the second officer from this three-name roster.',
    analogy:
      'The bridge computer follows address 1 to the middle station in a row labeled 0, 1, and 2.',
    type: 'prediction',
    prompt: 'What will this familiar array lookup display?',
    displayCode: 'string[] crew = { "Mira", "Tov", "Pip" };\nConsole.WriteLine(crew[1]);',
    choices: [
      { id: 'a', label: 'Tov', detail: 'Index 1 is the second position.' },
      { id: 'b', label: 'Mira', detail: 'That name is at index 0.' },
      { id: 'c', label: 'Pip', detail: 'That name is at index 2.' },
    ],
    correctChoice: 'a',
    output: 'Tov',
    hint: 'Count the array positions as 0, 1, and 2.',
    recap: 'Index 1 retrieves the second item from a zero-based C# array.',
  },
  {
    eyebrow: 'Patrol school 2 of 5',
    title: 'Meet a loop',
    explanation:
      'A loop repeats a group of instructions. A C# foreach loop can visit every array value without copying one report command per crew member.',
    analogy:
      'The captain reads one roll-call order down the entire duty roster instead of issuing a separate order for each officer.',
    type: 'choice',
    prompt: 'Why use a loop for the crew roster?',
    choices: [
      { id: 'a', label: 'To repeat one action for each officer', detail: 'The loop visits the array one value at a time.' },
      { id: 'b', label: 'To remove every officer after reading', detail: 'The roster remains available after the loop.' },
      { id: 'c', label: 'To make all names identical', detail: 'One instruction can process different names.' },
    ],
    correctChoice: 'a',
    hint: 'Look for the answer about one instruction working across the roster.',
    recap: 'A C# loop repeats an action without copying the same code for every array item.',
  },
  {
    eyebrow: 'Roll call 3 of 5',
    title: 'Trace two loop passes',
    explanation:
      'On each pass, name temporarily holds the next array value. The brace-group output runs once for Mira and once for Pip.',
    analogy:
      'One speaking token moves from the first officer to the second. The bridge hears whoever currently holds it.',
    type: 'prediction',
    prompt: 'What two lines will this loop display?',
    displayCode: 'string[] crew = { "Mira", "Pip" };\n\nforeach (string name in crew)\n{\n    Console.WriteLine(name);\n}',
    choices: [
      { id: 'a', label: 'Mira then Pip', detail: 'The loop visits both names in array order.' },
      { id: 'b', label: 'name then name', detail: 'name retrieves the current stored value.' },
      { id: 'c', label: 'Only Mira', detail: 'The loop continues to the second value.' },
    ],
    correctChoice: 'a',
    output: 'Mira\nPip',
    hint: 'Trace one pass with name as Mira, then another with name as Pip.',
    recap: 'A C# foreach loop visits every array value in order.',
  },
  {
    eyebrow: 'Patrol order 4 of 5',
    title: 'Put the loop in order',
    explanation:
      'C# must create the array before foreach uses it. The loop line opens a brace group, the report goes inside, and the final brace closes the repeated work.',
    analogy:
      'Load the roster, begin roll call, speak inside the patrol cycle, then close the command boundary.',
    type: 'ordering',
    prompt: 'Arrange the pieces into a complete crew roll call.',
    orderItems: [
      { id: 'print', code: '    Console.WriteLine(name);' },
      { id: 'end', code: '}' },
      { id: 'array', code: 'string[] crew = { "Mira", "Tov", "Pip" };' },
      { id: 'loop', code: 'foreach (string name in crew) {' },
    ],
    correctOrder: ['array', 'loop', 'print', 'end'],
    incorrectMessage: 'Create crew first, open foreach, place the output inside its braces, then close the final brace.',
    output: 'Mira\nTov\nPip',
    hint: 'The array comes first and the final closing brace comes last.',
    recap: 'Create the array, open foreach, run its body, then close the loop brace.',
  },
  {
    eyebrow: 'Patrol report 5 of 5',
    title: 'Process every item',
    explanation:
      'The foreach loop needs the array it should visit. Once crew fills the blank, name receives each string and the same report runs three times.',
    analogy:
      'Connect roll call to the named duty roster. One command then checks every station without copied orders.',
    type: 'code',
    prompt: 'Replace the blank so foreach visits every value in crew.',
    starterCode: 'string[] crew = { "Mira", "Tov", "Pip" };\n\nforeach (string name in _____)\n{\n    Console.WriteLine($"Ready: {name}");\n}',
    focus: 'Replace the one _____ blank with crew. Leave name as the temporary label for each value.',
    codeGuide: [
      { code: 'string[] crew', plain: 'This familiar array stores three text values in one ordered collection.' },
      { code: 'foreach (string name in crew)', plain: 'Read this as “for each string called name in crew.” Parentheses hold the loop description.' },
      { code: 'name', plain: 'This temporary loop variable holds one current array value, then the next, until the array is finished.' },
      { code: '{ ... }', plain: 'The braces group the interpolated output instruction that repeats for every current name.' },
    ],
    checks: [
      { pattern: 'foreach\\s*\\(\\s*string\\s+name\\s+in\\s+crew\\s*\\)', message: 'Put crew after in so foreach knows which array to visit.' },
      { pattern: 'Console\\.WriteLine\\s*\\(\\s*\\$"Ready: \\{name\\}"\\s*\\)\\s*;', message: 'Keep the output instruction using the temporary name variable.' },
    ],
    output: 'Ready: Mira\nReady: Tov\nReady: Pip',
    hint: 'The loop header should read foreach (string name in crew)',
    recap: 'A C# foreach loop visits every array value with one brace-group body.',
  },
]

const javaRepeatBrewExercises: FoundationExercise[] = [
  {
    eyebrow: 'Memory ping 1 of 5',
    title: 'Read an item by position',
    explanation:
      'Begin with a familiar array. Java starts indexes at zero, so index 1 retrieves the second droid from this three-name roster.',
    analogy:
      'The service computer follows address 1 to the middle station in a row labeled 0, 1, and 2.',
    type: 'prediction',
    prompt: 'What will this familiar array lookup display?',
    displayCode: 'String[] droids = { "MOP-1", "BEEP-7", "HEX-3" };\nSystem.out.println(droids[1]);',
    choices: [
      { id: 'a', label: 'BEEP-7', detail: 'Index 1 is the second position.' },
      { id: 'b', label: 'MOP-1', detail: 'That droid is at index 0.' },
      { id: 'c', label: 'HEX-3', detail: 'That droid is at index 2.' },
    ],
    correctChoice: 'a',
    output: 'BEEP-7',
    hint: 'Count the array positions as 0, 1, and 2.',
    recap: 'Index 1 retrieves the second item from a zero-based Java array.',
  },
  {
    eyebrow: 'Automation school 2 of 5',
    title: 'Meet a loop',
    explanation:
      'A loop repeats a group of instructions. A Java enhanced for loop can visit every array value without copying one report command per droid.',
    analogy:
      'The galley supervisor reads one service order down the entire droid roster instead of writing three separate orders.',
    type: 'choice',
    prompt: 'Why use a loop for the droid roster?',
    choices: [
      { id: 'a', label: 'To repeat one action for each droid', detail: 'The loop visits the array one value at a time.' },
      { id: 'b', label: 'To delete the roster after one droid', detail: 'The array remains available after the loop.' },
      { id: 'c', label: 'To rename every droid the same thing', detail: 'One instruction can process different stored names.' },
    ],
    correctChoice: 'a',
    hint: 'Look for the answer about one instruction working across the roster.',
    recap: 'A Java loop repeats an action without copying the same code for every array item.',
  },
  {
    eyebrow: 'Service pass 3 of 5',
    title: 'Trace two loop passes',
    explanation:
      'On each pass, droid temporarily holds the next array value. The brace-group output runs once for MOP-1 and once for HEX-3.',
    analogy:
      'One service badge moves from the first droid to the second. The console reads whichever droid currently carries it.',
    type: 'prediction',
    prompt: 'What two lines will this loop display?',
    displayCode: 'String[] droids = { "MOP-1", "HEX-3" };\n\nfor (String droid : droids) {\n    System.out.println(droid);\n}',
    choices: [
      { id: 'a', label: 'MOP-1 then HEX-3', detail: 'The loop visits both names in array order.' },
      { id: 'b', label: 'droid then droid', detail: 'droid retrieves the current stored value.' },
      { id: 'c', label: 'Only MOP-1', detail: 'The loop continues to the second value.' },
    ],
    correctChoice: 'a',
    output: 'MOP-1\nHEX-3',
    hint: 'Trace one pass with droid as MOP-1, then another with droid as HEX-3.',
    recap: 'A Java enhanced for loop visits every array value in order.',
  },
  {
    eyebrow: 'Service order 4 of 5',
    title: 'Put the loop in order',
    explanation:
      'Java must create the array before the loop uses it. The for line opens a brace group, the report goes inside, and the final brace closes the repeated work.',
    analogy:
      'Load the roster, start the service cycle, report inside that cycle, then close the command boundary.',
    type: 'ordering',
    prompt: 'Arrange the pieces into a complete droid check.',
    orderItems: [
      { id: 'print', code: '    System.out.println(droid);' },
      { id: 'end', code: '}' },
      { id: 'array', code: 'String[] droids = { "MOP-1", "BEEP-7", "HEX-3" };' },
      { id: 'loop', code: 'for (String droid : droids) {' },
    ],
    correctOrder: ['array', 'loop', 'print', 'end'],
    incorrectMessage: 'Create droids first, open the for loop, place the output inside its braces, then close the final brace.',
    output: 'MOP-1\nBEEP-7\nHEX-3',
    hint: 'The array comes first and the final closing brace comes last.',
    recap: 'Create the array, open the for loop, run its body, then close the loop brace.',
  },
  {
    eyebrow: 'Guild report 5 of 5',
    title: 'Process every item',
    explanation:
      'The enhanced for loop needs the array it should visit. Once droids fills the blank, droid receives each string and the same report runs three times.',
    analogy:
      'Connect the service cycle to the named roster. One command then checks every droid without copied orders.',
    type: 'code',
    prompt: 'Replace the blank so the loop visits every value in droids.',
    starterCode: 'public class Main {\n    public static void main(String[] args) {\n        String[] droids = { "MOP-1", "BEEP-7", "HEX-3" };\n\n        for (String droid : _____) {\n            System.out.println("Checked: " + droid);\n        }\n    }\n}',
    focus: 'Replace the one _____ blank with droids. Leave droid as the temporary name for each value.',
    codeGuide: [
      ...javaProgramFrame,
      { code: 'String[] droids', plain: 'This familiar array stores three text values in one ordered collection.' },
      { code: 'for (String droid : droids)', plain: 'Read this as “for each String called droid from droids.” The colon separates the temporary value name from the collection.' },
      { code: 'droid', plain: 'This temporary loop variable holds one current array value, then the next, until the array is finished.' },
      { code: '{ ... }', plain: 'The braces group the output instruction that repeats for every current droid.' },
    ],
    checks: [
      { pattern: 'for\\s*\\(\\s*String\\s+droid\\s*:\\s*droids\\s*\\)', message: 'Put droids after the colon so the loop knows which array to visit.' },
      { pattern: 'System\\.out\\.println\\s*\\(\\s*"Checked: "\\s*\\+\\s*droid\\s*\\)\\s*;', message: 'Keep the output instruction using the temporary droid variable.' },
    ],
    output: 'Checked: MOP-1\nChecked: BEEP-7\nChecked: HEX-3',
    hint: 'The loop header should read for (String droid : droids) {',
    recap: 'A Java enhanced for loop visits every array value with one brace-group body.',
  },
]

const pythonFunctionFoundryExercises: FoundationExercise[] = [
  {
    eyebrow: 'Memory ping 1 of 5',
    title: 'Trace a loop',
    explanation:
      'Begin with a familiar loop. Python gives item each list value in order, then runs the indented print instruction once per value.',
    analogy:
      'The scanner hands one reusable badge to crystal, then map, reporting whichever artifact currently holds it.',
    type: 'prediction',
    prompt: 'What two lines will this familiar loop display?',
    displayCode: 'cargo = ["crystal", "map"]\n\nfor item in cargo:\n    print("Scanned:", item)',
    choices: [
      { id: 'a', label: 'Scanned: crystal then Scanned: map', detail: 'The loop visits both values in order.' },
      { id: 'b', label: 'Scanned: item twice', detail: 'item retrieves each current value.' },
      { id: 'c', label: 'Only Scanned: crystal', detail: 'The loop continues through the whole list.' },
    ],
    correctChoice: 'a',
    output: 'Scanned: crystal\nScanned: map',
    hint: 'Trace one pass for crystal and a second pass for map.',
    recap: 'A Python for loop runs its indented body once for every list item.',
  },
  {
    eyebrow: 'Foundry school 2 of 5',
    title: 'Meet a function',
    explanation:
      'A function gives a reusable name to a group of instructions. Define the job once, then call its name whenever the program needs that job.',
    analogy:
      'The foundry builds one dependable console control. The crew can press its name many times instead of rebuilding the mechanism.',
    type: 'choice',
    prompt: 'Why place a repeated job inside a function?',
    choices: [
      { id: 'a', label: 'To name and reuse the job', detail: 'One definition can be called whenever it is needed.' },
      { id: 'b', label: 'To hide the job from Python forever', detail: 'Calling the function runs its instructions.' },
      { id: 'c', label: 'To make every function run automatically', detail: 'A definition waits until the program calls it.' },
    ],
    correctChoice: 'a',
    hint: 'Look for the answer about defining once and using again.',
    recap: 'A function packages a job under one reusable name.',
  },
  {
    eyebrow: 'Control test 3 of 5',
    title: 'Trace a function call',
    explanation:
      'The parameter item is a temporary input name inside announce. Calling announce with crystal places that text into item for this run.',
    analogy:
      'The function is a message console with one input slot. This call slides crystal into that slot before the console speaks.',
    type: 'prediction',
    prompt: 'What will this function call display?',
    displayCode: 'def announce(item):\n    print("Ready:", item)\n\nannounce("crystal")',
    choices: [
      { id: 'a', label: 'Ready: crystal', detail: 'The argument crystal becomes the parameter item.' },
      { id: 'b', label: 'Ready: item', detail: 'item retrieves the input value instead of printing its label.' },
      { id: 'c', label: 'Nothing', detail: 'The final line calls the function.' },
    ],
    correctChoice: 'a',
    output: 'Ready: crystal',
    hint: 'Move the argument "crystal" into the parameter named item.',
    recap: 'A call supplies an argument, and the function receives it through a parameter.',
  },
  {
    eyebrow: 'Assembly plan 4 of 5',
    title: 'Put the function in order',
    explanation:
      'Python must run the function definition before it reaches the call. The indented instruction belongs inside the definition, and the unindented call uses it afterward.',
    analogy:
      'Forge the console control, install its inner mechanism, then press it. A control cannot be used before it exists.',
    type: 'ordering',
    prompt: 'Arrange the pieces into a defined and called function.',
    orderItems: [
      { id: 'call', code: 'announce("crystal")' },
      { id: 'body', code: '    print("Ready:", item)' },
      { id: 'define', code: 'def announce(item):' },
    ],
    correctOrder: ['define', 'body', 'call'],
    incorrectMessage: 'Define announce first, place the indented print inside it, then call announce afterward.',
    output: 'Ready: crystal',
    hint: 'The def line comes first. The unindented call comes last.',
    recap: 'Python reads the definition before the later call uses that reusable job.',
  },
  {
    eyebrow: 'Foundry report 5 of 5',
    title: 'Call the function for every item',
    explanation:
      'The loop already gives item one cargo value per pass. Passing item into report lets one reusable function format every value in the manifest.',
    analogy:
      'The orbit hands each artifact to the same reporting console. The console performs one dependable job for every arrival.',
    type: 'code',
    prompt: 'Replace the blank so each loop pass reports the current item.',
    starterCode: 'def report(current_item):\n    print("Checked:", current_item)\n\ncargo = ["crystal", "medkit", "map"]\n\nfor item in cargo:\n    report(_____)',
    focus: 'Replace the one _____ blank with item, the loop variable holding the current cargo value.',
    codeGuide: [
      { code: 'def report(current_item):', plain: 'def creates a function named report. current_item is its temporary input parameter.' },
      { code: 'print("Checked:", current_item)', plain: 'This indented function body uses the value received through the parameter.' },
      { code: 'for item in cargo:', plain: 'The familiar loop gives item one cargo value during each pass.' },
      { code: 'report(item)', plain: 'This call sends the current loop value into report, where it becomes current_item.' },
    ],
    checks: [
      { pattern: 'report\\s*\\(\\s*item\\s*\\)', message: 'Pass item into report so the function receives the current loop value.' },
      { pattern: 'def\\s+report\\s*\\(\\s*current_item\\s*\\)\\s*:', message: 'Keep the report definition and its current_item parameter in place.' },
    ],
    output: 'Checked: crystal\nChecked: medkit\nChecked: map',
    hint: 'The call inside the loop should be report(item).',
    recap: 'A loop can call one reusable Python function with a different current value each time.',
  },
]

const cppCommandFunctionExercises: FoundationExercise[] = [
  {
    eyebrow: 'Memory ping 1 of 5',
    title: 'Trace a loop',
    explanation:
      'Begin with a familiar range-based loop. C++ gives part each array value in order, then runs the brace-group output once per value.',
    analogy:
      'The maintenance arm hands one inspection badge to crystal, then rune, displaying the component that currently holds it.',
    type: 'prediction',
    prompt: 'What two lines will this familiar loop display?',
    displayCode: 'std::string parts[2] = {"crystal", "rune"};\n\nfor (std::string part : parts) {\n    std::cout << "Checked: " << part << "\\n";\n}',
    choices: [
      { id: 'a', label: 'Checked: crystal then Checked: rune', detail: 'The loop visits both values in order.' },
      { id: 'b', label: 'Checked: part twice', detail: 'part retrieves each current value.' },
      { id: 'c', label: 'Only Checked: crystal', detail: 'The loop continues through the array.' },
    ],
    correctChoice: 'a',
    output: 'Checked: crystal\nChecked: rune',
    hint: 'Trace one pass for crystal and a second pass for rune.',
    recap: 'A range-based C++ for loop runs its brace-group body for every array value.',
  },
  {
    eyebrow: 'Command school 2 of 5',
    title: 'Meet a function',
    explanation:
      'A function gives a reusable name to a group of instructions. Define the operation once, then call its name whenever engineering needs that operation.',
    analogy:
      'Engineering builds one dependable control module. The crew can activate its name many times instead of rewiring the system.',
    type: 'choice',
    prompt: 'Why place a repeated operation inside a function?',
    choices: [
      { id: 'a', label: 'To name and reuse the operation', detail: 'One definition can be called whenever it is needed.' },
      { id: 'b', label: 'To make the compiler ignore it forever', detail: 'Calling the function runs its instructions.' },
      { id: 'c', label: 'To make it run before main automatically', detail: 'A definition waits until code calls it.' },
    ],
    correctChoice: 'a',
    hint: 'Look for the answer about defining once and using again.',
    recap: 'A C++ function packages an operation under one reusable name.',
  },
  {
    eyebrow: 'Module test 3 of 5',
    title: 'Trace a function call',
    explanation:
      'The parameter part is a temporary input name inside announce. Calling announce with crystal places that text into part for this run.',
    analogy:
      'The function module has one labeled input port. The call connects crystal to that port before the module reports.',
    type: 'prediction',
    prompt: 'What will this function call display?',
    displayCode: 'void announce(std::string part) {\n    std::cout << "Ready: " << part;\n}\n\nannounce("crystal");',
    choices: [
      { id: 'a', label: 'Ready: crystal', detail: 'The argument crystal becomes the parameter part.' },
      { id: 'b', label: 'Ready: part', detail: 'part retrieves the input value.' },
      { id: 'c', label: 'Nothing', detail: 'The final instruction calls the function.' },
    ],
    correctChoice: 'a',
    output: 'Ready: crystal',
    hint: 'Move the argument "crystal" into the parameter named part.',
    recap: 'A C++ call supplies an argument, and the function receives it through a typed parameter.',
  },
  {
    eyebrow: 'Module plan 4 of 5',
    title: 'Put the function in order',
    explanation:
      'The function definition must be available before the supplied main program calls it. Its output instruction sits inside braces, followed by the closing brace and later call.',
    analogy:
      'Build the module, install its inner circuit, close its casing, then activate it from the engine room.',
    type: 'ordering',
    prompt: 'Arrange the reusable function pieces before their call.',
    orderItems: [
      { id: 'call', code: 'announce("crystal");' },
      { id: 'end', code: '}' },
      { id: 'body', code: '    std::cout << "Ready: " << part;' },
      { id: 'define', code: 'void announce(std::string part) {' },
    ],
    correctOrder: ['define', 'body', 'end', 'call'],
    incorrectMessage: 'Open the announce definition, place its output inside, close the brace, then call announce afterward.',
    output: 'Ready: crystal',
    hint: 'The void announce line comes first. The call ending in a semicolon comes last.',
    recap: 'C++ needs the function definition available before later code calls it.',
  },
  {
    eyebrow: 'Command report 5 of 5',
    title: 'Call the function for every item',
    explanation:
      'The loop already gives part one array value per pass. Passing part into report lets one reusable function format every component in the rack.',
    analogy:
      'The maintenance cycle feeds each component into the same reporting module. One dependable circuit handles every arrival.',
    type: 'code',
    prompt: 'Replace the blank so each loop pass reports the current part.',
    starterCode: '#include <iostream>\n#include <string>\n\nvoid report(std::string currentPart) {\n    std::cout << "Checked: " << currentPart << "\\n";\n}\n\nint main() {\n    std::string parts[3] = {"crystal", "coupler", "rune"};\n\n    for (std::string part : parts) {\n        report(_____);\n    }\n    return 0;\n}',
    focus: 'Replace the one _____ blank with part, the loop variable holding the current array value.',
    codeGuide: [
      ...cppProgramFrame,
      { code: 'void report(std::string currentPart)', plain: 'void says this function returns no value. currentPart is a typed temporary input parameter.' },
      { code: 'for (std::string part : parts)', plain: 'The familiar loop gives part one array value during each pass.' },
      { code: 'report(part);', plain: 'This call sends the current loop value into report, where it becomes currentPart.' },
    ],
    checks: [
      { pattern: 'report\\s*\\(\\s*part\\s*\\)\\s*;', message: 'Pass part into report so the function receives the current loop value.' },
      { pattern: 'void\\s+report\\s*\\(\\s*std::string\\s+currentPart\\s*\\)', message: 'Keep the report definition and its typed currentPart parameter in place.' },
    ],
    output: 'Checked: crystal\nChecked: coupler\nChecked: rune',
    hint: 'The call inside the loop should be report(part);',
    recap: 'A C++ loop can call one reusable function with a different current value each time.',
  },
]

const csharpCommandMethodExercises: FoundationExercise[] = [
  {
    eyebrow: 'Memory ping 1 of 5',
    title: 'Trace a loop',
    explanation:
      'Begin with a familiar foreach loop. C# gives name each array value in order, then runs the brace-group output once per value.',
    analogy:
      'The bridge hands one speaking token to Mira, then Pip, reporting whichever officer currently holds it.',
    type: 'prediction',
    prompt: 'What two lines will this familiar loop display?',
    displayCode: 'string[] crew = { "Mira", "Pip" };\n\nforeach (string name in crew)\n{\n    Console.WriteLine($"Ready: {name}");\n}',
    choices: [
      { id: 'a', label: 'Ready: Mira then Ready: Pip', detail: 'The loop visits both names in order.' },
      { id: 'b', label: 'Ready: name twice', detail: 'name retrieves each current value.' },
      { id: 'c', label: 'Only Ready: Mira', detail: 'The loop continues through the roster.' },
    ],
    correctChoice: 'a',
    output: 'Ready: Mira\nReady: Pip',
    hint: 'Trace one pass for Mira and a second pass for Pip.',
    recap: 'A C# foreach loop runs its brace-group body for every array value.',
  },
  {
    eyebrow: 'Command school 2 of 5',
    title: 'Meet a method',
    explanation:
      'A method gives a reusable name to a group of instructions. Define the command once, then call its name whenever the program needs that command.',
    analogy:
      'The command deck installs one dependable control. The captain can activate its name many times instead of rebuilding the order.',
    type: 'choice',
    prompt: 'Why place a repeated command inside a method?',
    choices: [
      { id: 'a', label: 'To name and reuse the command', detail: 'One definition can be called whenever it is needed.' },
      { id: 'b', label: 'To make C# ignore the command forever', detail: 'Calling the method runs its instructions.' },
      { id: 'c', label: 'To make every method run automatically', detail: 'A definition waits until the program calls it.' },
    ],
    correctChoice: 'a',
    hint: 'Look for the answer about defining once and using again.',
    recap: 'A C# method packages a command under one reusable name.',
  },
  {
    eyebrow: 'Control test 3 of 5',
    title: 'Trace a method call',
    explanation:
      'The parameter name is a temporary input inside Announce. Calling Announce with Mira places that text into name for this run.',
    analogy:
      'The method is a command console with one labeled input slot. This call slides Mira into that slot before it speaks.',
    type: 'prediction',
    prompt: 'What will this method call display?',
    displayCode: 'void Announce(string name)\n{\n    Console.WriteLine($"Ready: {name}");\n}\n\nAnnounce("Mira");',
    choices: [
      { id: 'a', label: 'Ready: Mira', detail: 'The argument Mira becomes the parameter name.' },
      { id: 'b', label: 'Ready: name', detail: 'name retrieves the input value.' },
      { id: 'c', label: 'Nothing', detail: 'The final instruction calls the method.' },
    ],
    correctChoice: 'a',
    output: 'Ready: Mira',
    hint: 'Move the argument "Mira" into the parameter named name.',
    recap: 'A C# call supplies an argument, and the method receives it through a typed parameter.',
  },
  {
    eyebrow: 'Command plan 4 of 5',
    title: 'Put the method in order',
    explanation:
      'The local method definition must be available before the later call. Its output instruction sits inside braces, followed by the closing brace and call.',
    analogy:
      'Install the command control, place its operation inside, close the panel, then activate it from the bridge.',
    type: 'ordering',
    prompt: 'Arrange the reusable method pieces before their call.',
    orderItems: [
      { id: 'call', code: 'Announce("Mira");' },
      { id: 'end', code: '}' },
      { id: 'body', code: '    Console.WriteLine($"Ready: {name}");' },
      { id: 'define', code: 'void Announce(string name) {' },
    ],
    correctOrder: ['define', 'body', 'end', 'call'],
    incorrectMessage: 'Open the Announce definition, place its output inside, close the brace, then call Announce afterward.',
    output: 'Ready: Mira',
    hint: 'The void Announce line comes first. The call ending in a semicolon comes last.',
    recap: 'C# reads the local method definition before the later call uses it.',
  },
  {
    eyebrow: 'Command report 5 of 5',
    title: 'Call the method for every item',
    explanation:
      'The loop already gives name one roster value per pass. Passing name into Report lets one reusable method format every officer in the array.',
    analogy:
      'Roll call feeds each officer into the same command console. One dependable control handles every arrival.',
    type: 'code',
    prompt: 'Replace the blank so each loop pass reports the current name.',
    starterCode: 'void Report(string currentName)\n{\n    Console.WriteLine($"Checked: {currentName}");\n}\n\nstring[] crew = { "Mira", "Tov", "Pip" };\n\nforeach (string name in crew)\n{\n    Report(_____);\n}',
    focus: 'Replace the one _____ blank with name, the loop variable holding the current roster value.',
    codeGuide: [
      { code: 'void Report(string currentName)', plain: 'void says this method returns no value. currentName is its typed temporary input parameter.' },
      { code: 'Console.WriteLine($"Checked: {currentName}");', plain: 'This brace-group method body uses the value received through the parameter.' },
      { code: 'foreach (string name in crew)', plain: 'The familiar loop gives name one roster value during each pass.' },
      { code: 'Report(name);', plain: 'This call sends the current loop value into Report, where it becomes currentName.' },
    ],
    checks: [
      { pattern: 'Report\\s*\\(\\s*name\\s*\\)\\s*;', message: 'Pass name into Report so the method receives the current loop value.' },
      { pattern: 'void\\s+Report\\s*\\(\\s*string\\s+currentName\\s*\\)', message: 'Keep the Report definition and its typed currentName parameter in place.' },
    ],
    output: 'Checked: Mira\nChecked: Tov\nChecked: Pip',
    hint: 'The call inside the loop should be Report(name);',
    recap: 'A C# loop can call one reusable method with a different current value each time.',
  },
]

const javaDroidRoutineExercises: FoundationExercise[] = [
  {
    eyebrow: 'Memory ping 1 of 5',
    title: 'Trace a loop',
    explanation:
      'Begin with a familiar enhanced for loop. Java gives droid each array value in order, then runs the brace-group output once per value.',
    analogy:
      'The guild hands one service badge to MOP-1, then HEX-3, reporting whichever droid currently holds it.',
    type: 'prediction',
    prompt: 'What two lines will this familiar loop display?',
    displayCode: 'String[] droids = { "MOP-1", "HEX-3" };\n\nfor (String droid : droids) {\n    System.out.println("Checked: " + droid);\n}',
    choices: [
      { id: 'a', label: 'Checked: MOP-1 then Checked: HEX-3', detail: 'The loop visits both names in order.' },
      { id: 'b', label: 'Checked: droid twice', detail: 'droid retrieves each current value.' },
      { id: 'c', label: 'Only Checked: MOP-1', detail: 'The loop continues through the array.' },
    ],
    correctChoice: 'a',
    output: 'Checked: MOP-1\nChecked: HEX-3',
    hint: 'Trace one pass for MOP-1 and a second pass for HEX-3.',
    recap: 'A Java enhanced for loop runs its brace-group body for every array value.',
  },
  {
    eyebrow: 'Routine school 2 of 5',
    title: 'Meet a method',
    explanation:
      'A method gives a reusable name to a group of instructions. Define the routine once, then call its name whenever the Java program needs that routine.',
    analogy:
      'The droid blueprint installs one dependable behavior module. The guild can activate its name many times instead of rebuilding it.',
    type: 'choice',
    prompt: 'Why place a repeated routine inside a method?',
    choices: [
      { id: 'a', label: 'To name and reuse the routine', detail: 'One definition can be called whenever it is needed.' },
      { id: 'b', label: 'To make the JVM ignore it forever', detail: 'Calling the method runs its instructions.' },
      { id: 'c', label: 'To make every method run automatically', detail: 'A definition waits until the program calls it.' },
    ],
    correctChoice: 'a',
    hint: 'Look for the answer about defining once and using again.',
    recap: 'A Java method packages a routine under one reusable name.',
  },
  {
    eyebrow: 'Routine test 3 of 5',
    title: 'Trace a method call',
    explanation:
      'The parameter droid is a temporary input inside announce. Calling announce with MOP-1 places that text into droid for this run.',
    analogy:
      'The method module has one labeled input port. The call connects MOP-1 to that port before the module reports.',
    type: 'prediction',
    prompt: 'What will this method call display?',
    displayCode: 'static void announce(String droid) {\n    System.out.println("Ready: " + droid);\n}\n\nannounce("MOP-1");',
    choices: [
      { id: 'a', label: 'Ready: MOP-1', detail: 'The argument MOP-1 becomes the parameter droid.' },
      { id: 'b', label: 'Ready: droid', detail: 'droid retrieves the input value.' },
      { id: 'c', label: 'Nothing', detail: 'The final instruction calls the method.' },
    ],
    correctChoice: 'a',
    output: 'Ready: MOP-1',
    hint: 'Move the argument "MOP-1" into the parameter named droid.',
    recap: 'A Java call supplies an argument, and the method receives it through a typed parameter.',
  },
  {
    eyebrow: 'Blueprint plan 4 of 5',
    title: 'Put the method in order',
    explanation:
      'The static method definition belongs in the supplied class before main calls it. Its output sits inside braces, followed by the closing brace and later call.',
    analogy:
      'Install the behavior module, place its operation inside, close the casing, then activate it from the launch routine.',
    type: 'ordering',
    prompt: 'Arrange the reusable method pieces before their call.',
    orderItems: [
      { id: 'call', code: 'announce("MOP-1");' },
      { id: 'end', code: '}' },
      { id: 'body', code: '    System.out.println("Ready: " + droid);' },
      { id: 'define', code: 'static void announce(String droid) {' },
    ],
    correctOrder: ['define', 'body', 'end', 'call'],
    incorrectMessage: 'Open the announce definition, place its output inside, close the brace, then call announce afterward.',
    output: 'Ready: MOP-1',
    hint: 'The static void announce line comes first. The call ending in a semicolon comes last.',
    recap: 'Java keeps the method definition in its class before main later calls it.',
  },
  {
    eyebrow: 'Blueprint report 5 of 5',
    title: 'Call the method for every item',
    explanation:
      'The loop already gives droid one roster value per pass. Passing droid into report lets one reusable method format every service unit in the array.',
    analogy:
      'The service cycle feeds each droid into the same behavior module. One dependable routine handles every arrival.',
    type: 'code',
    prompt: 'Replace the blank so each loop pass reports the current droid.',
    starterCode: 'public class Main {\n    static void report(String currentDroid) {\n        System.out.println("Checked: " + currentDroid);\n    }\n\n    public static void main(String[] args) {\n        String[] droids = { "MOP-1", "BEEP-7", "HEX-3" };\n\n        for (String droid : droids) {\n            report(_____);\n        }\n    }\n}',
    focus: 'Replace the one _____ blank with droid, the loop variable holding the current roster value.',
    codeGuide: [
      ...javaProgramFrame,
      { code: 'static void report(String currentDroid)', plain: 'static lets main call this class method directly. void says it returns no value, and currentDroid is its typed input parameter.' },
      { code: 'for (String droid : droids)', plain: 'The familiar loop gives droid one array value during each pass.' },
      { code: 'report(droid);', plain: 'This call sends the current loop value into report, where it becomes currentDroid.' },
    ],
    checks: [
      { pattern: 'report\\s*\\(\\s*droid\\s*\\)\\s*;', message: 'Pass droid into report so the method receives the current loop value.' },
      { pattern: 'static\\s+void\\s+report\\s*\\(\\s*String\\s+currentDroid\\s*\\)', message: 'Keep the report definition and its typed currentDroid parameter in place.' },
    ],
    output: 'Checked: MOP-1\nChecked: BEEP-7\nChecked: HEX-3',
    hint: 'The call inside the loop should be report(droid);',
    recap: 'A Java loop can call one reusable method with a different current value each time.',
  },
]

const pythonVoidWyrmExercises: FoundationExercise[] = [
  {
    eyebrow: 'Systems recall 1 of 5',
    title: 'Trace a complete program',
    explanation:
      'This program combines a list, a loop, and a condition you already know. The loop visits both hazards, but the indented print runs only when the current value equals wyrm.',
    analogy:
      'A scanner sweeps every contact, while the alarm sounds only for the contact that matches the danger profile.',
    type: 'prediction',
    prompt: 'Which line reaches the console?',
    displayCode: 'hazards = ["mist", "wyrm"]\n\nfor hazard in hazards:\n    if hazard == "wyrm":\n        print("Alert:", hazard)',
    choices: [
      { id: 'a', label: 'Alert: wyrm', detail: 'Only wyrm makes the comparison true.' },
      { id: 'b', label: 'Alert: mist then Alert: wyrm', detail: 'The loop visits both, but the condition filters the output.' },
      { id: 'c', label: 'Nothing', detail: 'The second list value makes the condition true.' },
    ],
    correctChoice: 'a',
    output: 'Alert: wyrm',
    hint: 'Trace the condition once with mist and once with wyrm.',
    recap: 'A condition inside a loop can choose which visited values trigger an action.',
  },
  {
    eyebrow: 'Captain plan 2 of 5',
    title: 'Plan the parts of a program',
    explanation:
      'A larger program is still made from small familiar jobs. A list stores the contacts, a loop visits them, and a function gives the repeated report a reusable name.',
    analogy:
      'The captain does not issue one enormous order. Cargo, patrol, and communications each receive one clear responsibility.',
    type: 'choice',
    prompt: 'Which plan gives each programming tool one clear job?',
    choices: [
      { id: 'a', label: 'List stores, loop visits, function reports', detail: 'Each tool handles the job it was designed to do.' },
      { id: 'b', label: 'Function stores every value automatically', detail: 'A function runs a job; it does not replace the list.' },
      { id: 'c', label: 'Loop invents the contacts', detail: 'A loop visits values that the program already has.' },
    ],
    correctChoice: 'a',
    hint: 'Match storage, repetition, and reusable work to the tool that performs each job.',
    recap: 'Plan a program as several small responsibilities that work together.',
  },
  {
    eyebrow: 'Flight plan 3 of 5',
    title: 'Put the program in order',
    explanation:
      'Python first defines the reusable report, then creates the list, then loops through it. The indented call belongs inside the loop so every current value reaches the function.',
    analogy:
      'Install the alarm, load the sensor contacts, begin the sweep, then send each contact through the installed alarm.',
    type: 'ordering',
    prompt: 'Arrange the pieces into a complete reusable scan.',
    orderItems: [
      { id: 'call', code: '    report(hazard)' },
      { id: 'list', code: 'hazards = ["mist", "wyrm"]' },
      { id: 'body', code: '    print("Scanned:", hazard)' },
      { id: 'loop', code: 'for hazard in hazards:' },
      { id: 'define', code: 'def report(hazard):' },
    ],
    correctOrder: ['define', 'body', 'list', 'loop', 'call'],
    incorrectMessage: 'Define report with its indented body, create the list, open the loop, then call report inside that loop.',
    output: 'Scanned: mist\nScanned: wyrm',
    hint: 'Build the function before the list and loop use it.',
    recap: 'Definitions come before calls, and indentation shows which instructions belong inside each structure.',
  },
  {
    eyebrow: 'Damage control 4 of 5',
    title: 'Fix the comparison',
    explanation:
      'The equals sign stores a value, while two equals signs compare values. An if question needs the comparison operator == so Python can produce true or false.',
    analogy:
      'The scanner must ask whether the contact matches wyrm. A cargo transfer order cannot answer that question.',
    type: 'bugfix',
    prompt: 'Repair the comparison so the function reports the wyrm.',
    starterCode: 'def report(hazard):\n    if hazard = "wyrm":\n        print("Alert:", hazard)\n\nreport("wyrm")',
    focus: 'Change the single = in the if line to ==. Do not change the function or its call.',
    codeGuide: [
      { code: '=', plain: 'One equals sign stores a value. It is not the comparison question needed by this if statement.' },
      { code: '==', plain: 'Two equals signs ask whether the values match and produce either true or false.' },
      { code: 'if hazard == "wyrm":', plain: 'The colon opens the indented route that runs only when the comparison is true.' },
    ],
    checks: [
      { pattern: 'if\\s+hazard\\s*==\\s*["\\\']wyrm["\\\']\\s*:', message: 'Use == in the if line so Python compares hazard with "wyrm".' },
      { pattern: 'report\\s*\\(\\s*["\\\']wyrm["\\\']\\s*\\)', message: 'Keep report("wyrm") so the repaired function is called.' },
    ],
    output: 'Alert: wyrm',
    hint: 'The repaired question is if hazard == "wyrm":',
    recap: 'Use = to store a value and == to compare two values.',
  },
  {
    eyebrow: 'Captain trial 5 of 5',
    title: 'Build a complete program',
    explanation:
      'This final program already contains every structure. Connect the loop to hazards and pass its current hazard into report. The function decides which contact triggers the alarm.',
    analogy:
      'The ship sweeps its complete sensor list and routes each contact through one reusable threat console.',
    type: 'code',
    prompt: 'Replace both blanks to scan every hazard through the report function.',
    starterCode: 'def report(current_hazard):\n    if current_hazard == "wyrm":\n        print("Alert:", current_hazard)\n\nhazards = ["mist", "wyrm", "moon"]\n\nfor hazard in _____:\n    report(_____)',
    focus: 'Replace only the two _____ blanks: first with hazards, then with hazard.',
    codeGuide: [
      { code: 'def report(current_hazard):', plain: 'This defines a reusable job with one temporary input parameter named current_hazard.' },
      { code: 'if current_hazard == "wyrm":', plain: 'The function reports only the input value that matches the danger name.' },
      { code: 'for hazard in hazards:', plain: 'The loop retrieves one value at a time from the complete hazards list.' },
      { code: 'report(hazard)', plain: 'The call sends the current loop value into the function for inspection.' },
    ],
    checks: [
      { pattern: 'for\\s+hazard\\s+in\\s+hazards\\s*:', message: 'Put hazards after in so the loop visits the complete list.' },
      { pattern: 'report\\s*\\(\\s*hazard\\s*\\)', message: 'Pass hazard into report so the function receives the current loop value.' },
      { pattern: 'if\\s+current_hazard\\s*==\\s*["\\\']wyrm["\\\']\\s*:', message: 'Keep the comparison inside report so only the wyrm triggers the alert.' },
    ],
    output: 'Alert: wyrm',
    hint: 'The final two lines should read for hazard in hazards: and report(hazard).',
    recap: 'You combined storage, repetition, decisions, and a reusable function into one working Python system.',
  },
]

const cppTitanForgeExercises: FoundationExercise[] = [
  {
    eyebrow: 'Systems recall 1 of 5',
    title: 'Trace a complete program',
    explanation:
      'This C++ program combines an array, a loop, and a condition. The loop visits both parts, but std::cout runs only when the current part equals cracked seal.',
    analogy:
      'An inspection arm checks every component, while the repair alarm speaks only for the component matching the fault record.',
    type: 'prediction',
    prompt: 'Which line reaches the console?',
    displayCode: 'std::string parts[] = { "stable plate", "cracked seal" };\n\nfor (std::string part : parts) {\n    if (part == "cracked seal") {\n        std::cout << "Repair: " << part;\n    }\n}',
    choices: [
      { id: 'a', label: 'Repair: cracked seal', detail: 'Only cracked seal makes the comparison true.' },
      { id: 'b', label: 'Both parts are reported', detail: 'The loop visits both, but the condition filters the output.' },
      { id: 'c', label: 'Nothing', detail: 'The second array value makes the condition true.' },
    ],
    correctChoice: 'a',
    output: 'Repair: cracked seal',
    hint: 'Trace the condition once for each array value.',
    recap: 'A condition inside a loop can select which inspected values trigger an action.',
  },
  {
    eyebrow: 'Engineer plan 2 of 5',
    title: 'Plan the parts of a program',
    explanation:
      'A larger C++ program is still made from small familiar jobs. An array stores parts, a loop visits them, and a function gives the repeated inspection a reusable name.',
    analogy:
      'The chief engineer divides one repair order between storage racks, an inspection arm, and a reusable diagnostic module.',
    type: 'choice',
    prompt: 'Which plan gives each programming tool one clear job?',
    choices: [
      { id: 'a', label: 'Array stores, loop visits, function inspects', detail: 'Each tool handles the responsibility it was designed for.' },
      { id: 'b', label: 'Function becomes the entire array', detail: 'A function runs a job; it does not replace stored values.' },
      { id: 'c', label: 'Loop invents every part', detail: 'A loop visits values that the program already has.' },
    ],
    correctChoice: 'a',
    hint: 'Match storage, repetition, and reusable work to their separate tools.',
    recap: 'Plan a larger program as several small responsibilities that cooperate.',
  },
  {
    eyebrow: 'Forge plan 3 of 5',
    title: 'Put the program in order',
    explanation:
      'C++ defines the reusable inspect function before main calls it. Inside main, create the array before the loop and place the function call inside the loop braces.',
    analogy:
      'Install the diagnostic module, load the parts rack, begin inspection, then feed each current part into the module.',
    type: 'ordering',
    prompt: 'Arrange the pieces into the working center of a repair scan.',
    orderItems: [
      { id: 'call', code: '    inspect(part);' },
      { id: 'array', code: 'std::string parts[] = { "plate", "seal" };' },
      { id: 'end', code: '}' },
      { id: 'loop', code: 'for (std::string part : parts) {' },
      { id: 'define', code: 'void inspect(std::string part) { /* report part */ }' },
    ],
    correctOrder: ['define', 'array', 'loop', 'call', 'end'],
    incorrectMessage: 'Define inspect first, create the array, open the loop, call inspect inside it, then close the loop brace.',
    output: 'plate\nseal',
    hint: 'Build the function before the array and loop use it.',
    recap: 'C++ definitions come before calls, and braces group the instructions that a loop repeats.',
  },
  {
    eyebrow: 'Damage control 4 of 5',
    title: 'Fix the comparison',
    explanation:
      'One equals sign stores a value, while two equals signs compare values. An if question needs == so C++ can decide whether part matches cracked seal.',
    analogy:
      'The diagnostic must ask whether a part matches the fault record. A reassignment order cannot answer that question.',
    type: 'bugfix',
    prompt: 'Repair the comparison so the function reports the cracked seal.',
    starterCode: 'void inspect(std::string part) {\n    if (part = "cracked seal") {\n        std::cout << "Repair: " << part;\n    }\n}\n\ninspect("cracked seal");',
    focus: 'Change the single = in the if line to ==. Do not change the function or its call.',
    codeGuide: [
      { code: '=', plain: 'One equals sign assigns or stores a value. It is not the comparison needed by this if statement.' },
      { code: '==', plain: 'Two equals signs compare values and produce the true or false answer that if needs.' },
      { code: 'if (part == "cracked seal")', plain: 'Parentheses hold the question, while braces surround the route taken when it is true.' },
    ],
    checks: [
      { pattern: 'if\\s*\\(\\s*part\\s*==\\s*"cracked seal"\\s*\\)', message: 'Use == inside the if parentheses so C++ compares the two text values.' },
      { pattern: 'inspect\\s*\\(\\s*"cracked seal"\\s*\\)\\s*;', message: 'Keep the inspect call so the repaired function receives a part.' },
    ],
    output: 'Repair: cracked seal',
    hint: 'The repaired question is if (part == "cracked seal") {',
    recap: 'Use = to store a value and == to compare two values in C++.',
  },
  {
    eyebrow: 'Engineer trial 5 of 5',
    title: 'Build a complete program',
    explanation:
      'The final simulator already contains every structure. Connect the loop to parts and pass its current part into inspect. The function decides which component needs repair.',
    analogy:
      'The forge moves every component past one reusable diagnostic station and raises an alarm only for the damaged one.',
    type: 'code',
    prompt: 'Replace both blanks to inspect every part in the array.',
    starterCode: '#include <iostream>\n#include <string>\n\nvoid inspect(std::string currentPart) {\n    if (currentPart == "cracked seal") {\n        std::cout << "Repair: " << currentPart;\n    }\n}\n\nint main() {\n    std::string parts[] = { "stable plate", "cracked seal", "charged core" };\n\n    for (std::string part : _____) {\n        inspect(_____);\n    }\n    return 0;\n}',
    focus: 'Replace only the two _____ blanks: first with parts, then with part.',
    codeGuide: [
      ...cppProgramFrame,
      { code: 'void inspect(std::string currentPart)', plain: 'void says this function returns no value. currentPart is its typed temporary input parameter.' },
      { code: 'for (std::string part : parts)', plain: 'The range-based loop retrieves one text value at a time from the complete array.' },
      { code: 'inspect(part);', plain: 'This call sends the current loop value into the reusable inspection function.' },
    ],
    checks: [
      { pattern: 'for\\s*\\(\\s*std::string\\s+part\\s*:\\s*parts\\s*\\)', message: 'Put parts after the colon so the loop visits the complete array.' },
      { pattern: 'inspect\\s*\\(\\s*part\\s*\\)\\s*;', message: 'Pass part into inspect so the function receives the current loop value.' },
      { pattern: 'currentPart\\s*==\\s*"cracked seal"', message: 'Keep the comparison in inspect so only the cracked seal triggers the repair report.' },
    ],
    output: 'Repair: cracked seal',
    hint: 'The loop header ends with : parts, and its body calls inspect(part);',
    recap: 'You combined typed storage, repetition, decisions, and a reusable function into one working C++ system.',
  },
]

const csharpCaptainsTrialExercises: FoundationExercise[] = [
  {
    eyebrow: 'Systems recall 1 of 5',
    title: 'Trace a complete program',
    explanation:
      'This C# program combines an array, a foreach loop, and a condition. The loop visits both officers, but the output runs only when the current name equals Pip.',
    analogy:
      'The bridge checks every badge, while the scout signal opens only for the officer assigned to reconnaissance.',
    type: 'prediction',
    prompt: 'Which line reaches the console?',
    displayCode: 'string[] crew = { "Mira", "Pip" };\n\nforeach (string name in crew)\n{\n    if (name == "Pip")\n    {\n        Console.WriteLine($"Scout: {name}");\n    }\n}',
    choices: [
      { id: 'a', label: 'Scout: Pip', detail: 'Only Pip makes the comparison true.' },
      { id: 'b', label: 'Both officers are reported', detail: 'The loop visits both, but the condition filters the output.' },
      { id: 'c', label: 'Nothing', detail: 'The second array value makes the condition true.' },
    ],
    correctChoice: 'a',
    output: 'Scout: Pip',
    hint: 'Trace the comparison once for Mira and once for Pip.',
    recap: 'A condition inside a foreach loop can select which roster values trigger an action.',
  },
  {
    eyebrow: 'Captain plan 2 of 5',
    title: 'Plan the parts of a program',
    explanation:
      'A larger C# program is still made from small familiar jobs. An array stores officers, a loop visits them, and a method gives the repeated order a reusable name.',
    analogy:
      'A captain delegates roster, patrol, and reporting duties instead of giving the bridge one impossible command.',
    type: 'choice',
    prompt: 'Which plan gives each programming tool one clear job?',
    choices: [
      { id: 'a', label: 'Array stores, loop visits, method reports', detail: 'Each tool handles the responsibility it was designed for.' },
      { id: 'b', label: 'Method becomes the entire roster', detail: 'A method runs a job; it does not replace stored values.' },
      { id: 'c', label: 'Loop invents every officer', detail: 'A loop visits values that the program already has.' },
    ],
    correctChoice: 'a',
    hint: 'Match storage, repetition, and reusable work to their separate tools.',
    recap: 'Plan a larger program as several small responsibilities that cooperate.',
  },
  {
    eyebrow: 'Command plan 3 of 5',
    title: 'Put the program in order',
    explanation:
      'C# defines the reusable Report method before the later loop calls it. Create the array before foreach, and place the method call inside the loop braces.',
    analogy:
      'Install the report control, load the crew manifest, begin roll call, then feed each current officer into the control.',
    type: 'ordering',
    prompt: 'Arrange the pieces into a complete reusable crew report.',
    orderItems: [
      { id: 'call', code: '    Report(name);' },
      { id: 'array', code: 'string[] crew = { "Mira", "Pip" };' },
      { id: 'end', code: '}' },
      { id: 'loop', code: 'foreach (string name in crew) {' },
      { id: 'define', code: 'void Report(string name) { Console.WriteLine(name); }' },
    ],
    correctOrder: ['define', 'array', 'loop', 'call', 'end'],
    incorrectMessage: 'Define Report first, create the array, open foreach, call Report inside it, then close the loop brace.',
    output: 'Mira\nPip',
    hint: 'Build the method before the array and loop use it.',
    recap: 'C# method definitions come before calls, and braces group the instructions that a loop repeats.',
  },
  {
    eyebrow: 'Command repair 4 of 5',
    title: 'Fix the comparison',
    explanation:
      'One equals sign stores a value, while two equals signs compare values. An if question needs == so C# can decide whether the current name matches Pip.',
    analogy:
      'The bridge must ask whether this officer is the scout. Reassigning the badge cannot answer that question.',
    type: 'bugfix',
    prompt: 'Repair the comparison so the method reports the scout.',
    starterCode: 'void Report(string name)\n{\n    if (name = "Pip")\n    {\n        Console.WriteLine($"Scout: {name}");\n    }\n}\n\nReport("Pip");',
    focus: 'Change the single = in the if line to ==. Do not change the method or its call.',
    codeGuide: [
      { code: '=', plain: 'One equals sign assigns or stores a value. It is not the comparison needed by this if statement.' },
      { code: '==', plain: 'Two equals signs compare values and produce the true or false answer that if needs.' },
      { code: 'if (name == "Pip")', plain: 'Parentheses hold the question, while braces surround the route taken when it is true.' },
    ],
    checks: [
      { pattern: 'if\\s*\\(\\s*name\\s*==\\s*"Pip"\\s*\\)', message: 'Use == inside the if parentheses so C# compares the two text values.' },
      { pattern: 'Report\\s*\\(\\s*"Pip"\\s*\\)\\s*;', message: 'Keep the Report call so the repaired method receives an officer name.' },
    ],
    output: 'Scout: Pip',
    hint: 'The repaired question is if (name == "Pip")',
    recap: 'Use = to store a value and == to compare two values in C#.',
  },
  {
    eyebrow: 'Captain trial 5 of 5',
    title: 'Build a complete program',
    explanation:
      'The final simulation already contains every structure. Connect foreach to crew and pass its current name into Report. The method decides which officer receives the scout order.',
    analogy:
      'Roll call moves every officer past one reusable command station and dispatches only the matching scout.',
    type: 'code',
    prompt: 'Replace both blanks to process every officer in the array.',
    starterCode: 'void Report(string currentName)\n{\n    if (currentName == "Pip")\n    {\n        Console.WriteLine($"Scout: {currentName}");\n    }\n}\n\nstring[] crew = { "Mira", "Tov", "Pip" };\n\nforeach (string name in _____)\n{\n    Report(_____);\n}',
    focus: 'Replace only the two _____ blanks: first with crew, then with name.',
    codeGuide: [
      { code: 'void Report(string currentName)', plain: 'void says this method returns no value. currentName is its typed temporary input parameter.' },
      { code: 'if (currentName == "Pip")', plain: 'The method reports only the input value that matches the scout name.' },
      { code: 'foreach (string name in crew)', plain: 'The loop retrieves one text value at a time from the complete crew array.' },
      { code: 'Report(name);', plain: 'The call sends the current loop value into the reusable command method.' },
    ],
    checks: [
      { pattern: 'foreach\\s*\\(\\s*string\\s+name\\s+in\\s+crew\\s*\\)', message: 'Put crew after in so foreach visits the complete array.' },
      { pattern: 'Report\\s*\\(\\s*name\\s*\\)\\s*;', message: 'Pass name into Report so the method receives the current loop value.' },
      { pattern: 'currentName\\s*==\\s*"Pip"', message: 'Keep the comparison in Report so only Pip receives the scout order.' },
    ],
    output: 'Scout: Pip',
    hint: 'The foreach header ends with in crew, and its body calls Report(name);',
    recap: 'You combined typed storage, repetition, decisions, and a reusable method into one working C# system.',
  },
]

const javaNebulaTrialExercises: FoundationExercise[] = [
  {
    eyebrow: 'Systems recall 1 of 5',
    title: 'Trace a complete program',
    explanation:
      'This Java program combines an array, an enhanced for loop, and a condition. The loop visits both levels, but the output runs only when the current level is below 30.',
    analogy:
      'A service scanner checks every battery, while the warning lamp opens only for a reading below the safe line.',
    type: 'prediction',
    prompt: 'Which line reaches the console?',
    displayCode: 'int[] levels = { 80, 25 };\n\nfor (int level : levels) {\n    if (level < 30) {\n        System.out.println("Low: " + level);\n    }\n}',
    choices: [
      { id: 'a', label: 'Low: 25', detail: 'Only 25 is below 30.' },
      { id: 'b', label: 'Low: 80 then Low: 25', detail: 'The loop visits both, but the condition filters the output.' },
      { id: 'c', label: 'Nothing', detail: 'The second array value makes the condition true.' },
    ],
    correctChoice: 'a',
    output: 'Low: 25',
    hint: 'Compare each battery level with 30, one loop pass at a time.',
    recap: 'A condition inside an enhanced for loop can select which array values trigger an action.',
  },
  {
    eyebrow: 'Guild plan 2 of 5',
    title: 'Plan the parts of a program',
    explanation:
      'A larger Java program is still made from small familiar jobs. An array stores levels, a loop visits them, and a method gives the repeated inspection a reusable name.',
    analogy:
      'The guild divides one expedition order between storage racks, a service cycle, and a reusable diagnostic module.',
    type: 'choice',
    prompt: 'Which plan gives each programming tool one clear job?',
    choices: [
      { id: 'a', label: 'Array stores, loop visits, method inspects', detail: 'Each tool handles the responsibility it was designed for.' },
      { id: 'b', label: 'Method becomes the entire array', detail: 'A method runs a job; it does not replace stored values.' },
      { id: 'c', label: 'Loop invents each battery level', detail: 'A loop visits values that the program already has.' },
    ],
    correctChoice: 'a',
    hint: 'Match storage, repetition, and reusable work to their separate tools.',
    recap: 'Plan a larger program as several small responsibilities that cooperate.',
  },
  {
    eyebrow: 'Expedition plan 3 of 5',
    title: 'Put the program in order',
    explanation:
      'Java keeps the reusable inspect method in the class before main calls it. Inside main, create the array before the loop and place the method call inside the loop braces.',
    analogy:
      'Install the diagnostic behavior, load the battery readings, begin the service cycle, then feed each reading into the module.',
    type: 'ordering',
    prompt: 'Arrange the pieces into the working center of a battery scan.',
    orderItems: [
      { id: 'call', code: '    inspect(level);' },
      { id: 'array', code: 'int[] levels = { 80, 25 };' },
      { id: 'end', code: '}' },
      { id: 'loop', code: 'for (int level : levels) {' },
      { id: 'define', code: 'static void inspect(int level) { /* report level */ }' },
    ],
    correctOrder: ['define', 'array', 'loop', 'call', 'end'],
    incorrectMessage: 'Define inspect first, create the array, open the loop, call inspect inside it, then close the loop brace.',
    output: '80\n25',
    hint: 'Build the method before the array and loop use it.',
    recap: 'Java method definitions live in the class, and braces group the instructions that a loop repeats.',
  },
  {
    eyebrow: 'Service repair 4 of 5',
    title: 'Fix the comparison',
    explanation:
      'One equals sign stores a value, while two equals signs compare values. An if question needs == so Java can decide whether the current level equals 25.',
    analogy:
      'The diagnostic must ask whether this reading matches the fault record. Replacing the reading cannot answer that question.',
    type: 'bugfix',
    prompt: 'Repair the comparison so the method reports the low battery.',
    starterCode: 'static void inspect(int level) {\n    if (level = 25) {\n        System.out.println("Low: " + level);\n    }\n}\n\ninspect(25);',
    focus: 'Change the single = in the if line to ==. Do not change the method or its call.',
    codeGuide: [
      { code: '=', plain: 'One equals sign assigns or stores a value. It is not the comparison needed by this if statement.' },
      { code: '==', plain: 'Two equals signs compare values and produce the true or false answer that if needs.' },
      { code: 'if (level == 25)', plain: 'Parentheses hold the question, while braces surround the route taken when it is true.' },
    ],
    checks: [
      { pattern: 'if\\s*\\(\\s*level\\s*==\\s*25\\s*\\)', message: 'Use == inside the if parentheses so Java compares level with 25.' },
      { pattern: 'inspect\\s*\\(\\s*25\\s*\\)\\s*;', message: 'Keep the inspect call so the repaired method receives a battery level.' },
    ],
    output: 'Low: 25',
    hint: 'The repaired question is if (level == 25) {',
    recap: 'Use = to store a value and == to compare two values in Java.',
  },
  {
    eyebrow: 'Systems trial 5 of 5',
    title: 'Build a complete program',
    explanation:
      'The final planner already contains every structure. Connect the enhanced for loop to levels and pass its current level into inspect. The method decides which reading needs attention.',
    analogy:
      'The expedition checks every stored battery reading through one reusable service module before entering the nebula.',
    type: 'code',
    prompt: 'Replace both blanks to inspect every battery level in the array.',
    starterCode: 'public class Main {\n    static void inspect(int currentLevel) {\n        if (currentLevel < 30) {\n            System.out.println("Low: " + currentLevel);\n        }\n    }\n\n    public static void main(String[] args) {\n        int[] levels = { 80, 25, 60 };\n\n        for (int level : _____) {\n            inspect(_____);\n        }\n    }\n}',
    focus: 'Replace only the two _____ blanks: first with levels, then with level.',
    codeGuide: [
      ...javaProgramFrame,
      { code: 'static void inspect(int currentLevel)', plain: 'static lets main call this method directly. currentLevel is its typed temporary input parameter.' },
      { code: 'if (currentLevel < 30)', plain: 'The method reports only an input number that falls below the safe battery threshold.' },
      { code: 'for (int level : levels)', plain: 'The enhanced for loop retrieves one integer at a time from the complete array.' },
      { code: 'inspect(level);', plain: 'The call sends the current loop value into the reusable inspection method.' },
    ],
    checks: [
      { pattern: 'for\\s*\\(\\s*int\\s+level\\s*:\\s*levels\\s*\\)', message: 'Put levels after the colon so the loop visits the complete array.' },
      { pattern: 'inspect\\s*\\(\\s*level\\s*\\)\\s*;', message: 'Pass level into inspect so the method receives the current loop value.' },
      { pattern: 'currentLevel\\s*<\\s*30', message: 'Keep the comparison in inspect so only a low battery triggers the report.' },
    ],
    output: 'Low: 25',
    hint: 'The loop header ends with : levels, and its body calls inspect(level);',
    recap: 'You combined typed storage, repetition, decisions, and a reusable method into one working Java system.',
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
  exercises: FoundationExercise[] = [],
): Mission => {
  const lessonMetadata = durableCurriculumV1[
    `${language}/${id}` as keyof typeof durableCurriculumV1
  ]
  if (!lessonMetadata || lessonMetadata.length !== exercises.length) {
    throw new Error(`Foundation lesson metadata does not match: ${language}/${id}.`)
  }
  return {
    id,
    language,
    chapter,
    title,
    subtitle,
    description,
    duration: exercises.length ? '8 min' : 'Coming soon',
    icon,
    status,
    exercises: exercises.map((exercise, index) => {
      const metadata = lessonMetadata[index]
      return {
        ...exercise,
        id: metadata[0],
        conceptId: metadata[1],
        xp: metadata[2],
      }
    }),
  }
}

function foundationTrackDetails(language: LanguageId) {
  const metadata = foundationTrackMetadataByLanguage(language)
  if (!metadata) throw new Error(`Foundation metadata is missing: ${language}.`)
  const {
    accent,
    accentSoft,
    capstoneDescription,
    capstoneTitle,
    description,
    id,
    shortName,
  } = metadata
  return {
    capstoneDescription,
    capstoneTitle,
    summary: { accent, accentSoft, description, id, shortName },
  }
}

const pythonTrack = foundationTrackDetails('python')
const cppTrack = foundationTrackDetails('cpp')
const csharpTrack = foundationTrackDetails('csharp')
const javaTrack = foundationTrackDetails('java')

export const tracks: LanguageTrack[] = [
  {
    ...pythonTrack.summary,
    name: 'Python Flight School',
    role: 'Explorer path',
    missions: [
      mission('py-first-spark', 'python', 1, 'Code and variables', 'Read and change simple code', 'Show text and numbers, then store values under clear names.', 'signal', 'available', pythonExercises),
      mission('py-signal-protocol', 'python', 2, 'Conditions', 'Make a decision', 'Use true and false values with if statements to choose what happens.', 'satellite', 'locked', pythonSignalProtocolExercises),
      mission('py-cargo-logic', 'python', 3, 'Lists', 'Store several values', 'Keep several values in one ordered list and read them by position.', 'package', 'locked', pythonCargoLogicExercises),
      mission('py-looping-orbit', 'python', 4, 'Loops', 'Repeat an instruction', 'Visit every list item without copying the same instruction.', 'terminal', 'locked', pythonLoopingOrbitExercises),
      mission('py-function-foundry', 'python', 5, 'Functions', 'Reuse working code', 'Give a group of instructions a name, pass in values, and return an answer.', 'shield', 'locked', pythonFunctionFoundryExercises),
      mission('py-void-wyrm', 'python', 6, pythonTrack.capstoneTitle, 'Use the ideas together', pythonTrack.capstoneDescription, 'crown', 'locked', pythonVoidWyrmExercises),
    ],
  },
  {
    ...cppTrack.summary,
    name: 'C++ Engineering Corps',
    role: 'Engineer path',
    missions: [
      mission('cpp-reactor', 'cpp', 1, 'Code and variables', 'Read and compile simple code', 'See how C++ code becomes a program, show output, and store text and numbers.', 'signal', 'available', cppExercises),
      mission('cpp-hull-logic', 'cpp', 2, 'Conditions', 'Make a decision', 'Use true and false values with if statements to choose what happens.', 'shield', 'locked', cppHullLogicExercises),
      mission('cpp-cargo-array', 'cpp', 3, 'Arrays', 'Store several values', 'Keep several values in one ordered array and read them by position.', 'package', 'locked', cppCargoArrayExercises),
      mission('cpp-engine-loop', 'cpp', 4, 'Loops', 'Repeat an instruction', 'Visit every array item without copying the same instruction.', 'terminal', 'locked', cppEngineLoopExercises),
      mission('cpp-command-function', 'cpp', 5, 'Functions', 'Reuse working code', 'Give a group of instructions a name, pass in values, and return an answer.', 'satellite', 'locked', cppCommandFunctionExercises),
      mission('cpp-titan-forge', 'cpp', 6, cppTrack.capstoneTitle, 'Use the ideas together', cppTrack.capstoneDescription, 'crown', 'locked', cppTitanForgeExercises),
    ],
  },
  {
    ...csharpTrack.summary,
    name: 'C# Command Academy',
    role: 'Captain path',
    missions: [
      mission('cs-shield', 'csharp', 1, 'Code and variables', 'Read and run simple code', 'Run a simple C# program, show output, and store text and numbers.', 'signal', 'available', csharpExercises),
      mission('cs-command-logic', 'csharp', 2, 'Conditions', 'Make a decision', 'Use true and false values with if statements to choose what happens.', 'shield', 'locked', csharpCommandLogicExercises),
      mission('cs-crew-roster', 'csharp', 3, 'Arrays', 'Store several values', 'Keep several values in one ordered array and read them by position.', 'package', 'locked', csharpCrewRosterExercises),
      mission('cs-patrol-loop', 'csharp', 4, 'Loops', 'Repeat an instruction', 'Visit every array item without copying the same instruction.', 'satellite', 'locked', csharpPatrolLoopExercises),
      mission('cs-command-method', 'csharp', 5, 'Methods', 'Reuse working code', 'Give a group of instructions a name and pass in the values it needs.', 'terminal', 'locked', csharpCommandMethodExercises),
      mission('cs-captains-trial', 'csharp', 6, csharpTrack.capstoneTitle, 'Use the ideas together', csharpTrack.capstoneDescription, 'crown', 'locked', csharpCaptainsTrialExercises),
    ],
  },
  {
    ...javaTrack.summary,
    name: 'Java Systems Guild',
    role: 'Builder path',
    missions: [
      mission('java-coffee-protocol', 'java', 1, 'Code and variables', 'Read and run simple code', 'Run a simple Java program, show output, and store text and numbers.', 'signal', 'available', javaExercises),
      mission('java-routing-orders', 'java', 2, 'Conditions', 'Make a decision', 'Use true and false values with if statements to choose what happens.', 'satellite', 'locked', javaRoutingOrdersExercises),
      mission('java-crew-array', 'java', 3, 'Arrays', 'Store several values', 'Keep several values in one ordered array and read them by position.', 'package', 'locked', javaCrewArrayExercises),
      mission('java-repeat-brew', 'java', 4, 'Loops', 'Repeat an instruction', 'Visit every array item without copying the same instruction.', 'terminal', 'locked', javaRepeatBrewExercises),
      mission('java-droid-routine', 'java', 5, 'Methods', 'Reuse working code', 'Give a group of instructions a name and pass in the values it needs.', 'shield', 'locked', javaDroidRoutineExercises),
      mission('java-nebula-trial', 'java', 6, javaTrack.capstoneTitle, 'Use the ideas together', javaTrack.capstoneDescription, 'crown', 'locked', javaNebulaTrialExercises),
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
