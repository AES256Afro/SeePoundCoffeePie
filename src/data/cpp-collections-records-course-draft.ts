import type { Exercise, Mission } from '../types'

const returnValueExercises: Exercise[] = [
  {
    id: 'cpprecords1-retrieve-call',
    conceptId: 'cpp-parameters-and-calls',
    eyebrow: 'Memory check 1 of 5',
    title: 'Trace a familiar function call',
    explanation:
      'A C++ function definition names a reusable job. Its typed parameter is a temporary input name, and a later call supplies the argument value used for that run.',
    analogy:
      'A workshop label maker has one input slot. The call places bolts into that slot, and the saved job uses that value while it prints the label.',
    type: 'prediction',
    prompt: 'What line will this familiar function call display?',
    displayCode:
      'void label_part(std::string part) {\n    std::cout << "Part: " << part;\n}\n\nlabel_part("bolts");',
    choices: [
      {
        id: 'a',
        label: 'Part: bolts',
        detail: 'The argument "bolts" becomes the parameter part during this call.',
      },
      {
        id: 'b',
        label: 'Part: part',
        detail: 'The parameter name retrieves its current argument value instead of displaying its own label.',
      },
      {
        id: 'c',
        label: 'Nothing',
        detail: 'The final line calls the function, so the output instruction inside its braces runs.',
      },
    ],
    correctChoice: 'a',
    output: 'Part: bolts',
    hint: 'Move the argument "bolts" into the temporary parameter named part, then read the output instruction.',
    recap: 'A function call supplies an argument, and the function uses that value through its typed parameter.',
    xp: 8,
  },
  {
    id: 'cpprecords1-return-purpose',
    conceptId: 'cpp-return-values',
    eyebrow: 'Function workshop 2 of 5',
    title: 'Meet a returned answer',
    explanation:
      'You have already seen return 0; at the end of main, where zero reports a normal finish to the operating system. A helper function can also return a useful value to the code that called it. The type before the function name promises what kind of answer it will send back. Here, int promises one whole number.',
    analogy:
      'A workshop calculator has a label promising a whole-number result. After it finishes the job, return places that result in the caller’s hand.',
    type: 'choice',
    prompt: 'What does return total; do inside this helper function whose promised result type is int?',
    displayCode: 'int part_total(int price, int quantity) {\n    int total = price * quantity;\n    return total;\n}',
    choices: [
      {
        id: 'a',
        label: 'Sends the whole-number value in total back to the caller',
        detail: 'The calling code can store, display, compare, or calculate with that returned value.',
      },
      {
        id: 'b',
        label: 'Displays total in the console automatically',
        detail: 'Console output still needs std::cout. return hands a value back without displaying it.',
      },
      {
        id: 'c',
        label: 'Runs the function again from the beginning',
        detail: 'return finishes this call and hands its result back. It does not repeat the function.',
      },
    ],
    correctChoice: 'a',
    hint: 'Choose the answer about handing one finished whole number back to the code that called the function.',
    recap: 'A typed C++ function promises a result type, and return sends a matching value back to its caller.',
    xp: 10,
  },
  {
    id: 'cpprecords1-predict-result',
    conceptId: 'cpp-return-values',
    eyebrow: 'Result path 3 of 5',
    title: 'Use a returned result',
    explanation:
      'A call to a non-void function is an expression because it produces a value. C++ finishes the call first, then stores its returned result in the variable on the left of the equals sign.',
    analogy:
      'The doubling tool finishes its calculation before the stock clerk writes the result on the card labeled total_units.',
    type: 'prediction',
    prompt: 'What number reaches the console?',
    displayCode:
      'int double_units(int units) {\n    return units * 2;\n}\n\nint total_units = double_units(4);\nstd::cout << total_units;',
    choices: [
      {
        id: 'a',
        label: '8',
        detail: 'double_units(4) returns 4 times 2, and total_units stores that result.',
      },
      {
        id: 'b',
        label: '4',
        detail: 'Four enters through units, but the function returns the calculated value.',
      },
      {
        id: 'c',
        label: 'units * 2',
        detail: 'C++ evaluates the multiplication instead of displaying the written expression.',
      },
    ],
    correctChoice: 'a',
    output: '8',
    hint: 'Run the function in your head first. units is 4, so what does units * 2 produce?',
    recap: 'A returned value can become the value of an assignment such as int total_units = double_units(4);.',
    xp: 14,
  },
  {
    id: 'cpprecords1-fix-return',
    conceptId: 'cpp-return-values',
    eyebrow: 'Debugging bench 4 of 5',
    title: 'Repair the returned subtotal',
    explanation:
      'This function calculates the correct subtotal and stores it in total, but its return statement sends the original price back instead. The caller therefore receives the wrong whole number.',
    analogy:
      'A stock clerk calculates the full box price correctly, then hands over the price of one item. The repair belongs on the handoff line.',
    type: 'bugfix',
    prompt: 'Repair the return statement so the function sends back the calculated subtotal.',
    starterCode:
      '#include <iostream>\n\nint subtotal(int price, int quantity) {\n    int total = price * quantity;\n    return price;\n}\n\nint main() {\n    std::cout << subtotal(4, 3);\n    return 0;\n}',
    focus: 'Change return price; to return total;. Keep the calculation and supplied call in place.',
    codeGuide: [
      {
        code: 'int subtotal(int price, int quantity)',
        plain: 'The first int promises that this function sends back one whole number. The two typed parameters receive the values from each call.',
      },
      {
        code: 'int total = price * quantity;',
        plain: 'This calculates the subtotal and stores the finished whole number under the local name total.',
      },
      {
        code: 'return price;',
        plain: 'This is the faulty handoff. It sends back only the price of one item instead of the value that was just calculated.',
      },
      {
        code: 'return total;',
        plain: 'This repaired statement sends the calculated subtotal back to the std::cout instruction that called the function.',
      },
    ],
    checks: [
      {
        pattern: 'return\\s+total\\s*;',
        message: 'Return the calculated variable named total, followed by a semicolon.',
      },
      {
        pattern: 'int\\s+total\\s*=\\s*price\\s*\\*\\s*quantity\\s*;',
        message: 'Keep the supplied integer calculation that multiplies price by quantity.',
      },
      {
        pattern: 'std::cout\\s*<<\\s*subtotal\\s*\\(\\s*4\\s*,\\s*3\\s*\\)\\s*;',
        message: 'Keep the supplied call so its returned result reaches the console.',
      },
    ],
    output: '12',
    hint: 'The correct result is already stored under total. Return that variable by name, then end the statement with a semicolon.',
    recap: 'Return the variable holding the completed result so the caller receives the value the function calculated.',
    xp: 16,
  },
  {
    id: 'cpprecords1-part-total',
    conceptId: 'cpp-returned-calculations',
    eyebrow: 'Reusable calculation 5 of 5',
    title: 'Build a reusable part total',
    explanation:
      'A useful calculation function receives the typed values it needs and returns one matching answer. Different calls can reuse the same function with different prices and quantities.',
    analogy:
      'One checkout rule can calculate many workshop orders. The clerk changes the numbers placed in the two input slots instead of rebuilding the rule.',
    type: 'code',
    prompt: 'Complete the function so both calls receive the correct subtotal.',
    starterCode:
      '#include <iostream>\n\nint subtotal(int price, int quantity) {\n    _____\n}\n\nint main() {\n    int first_total = subtotal(4, 3);\n    int second_total = subtotal(2, 5);\n\n    std::cout << first_total << "\\n";\n    std::cout << second_total << "\\n";\n    return 0;\n}',
    focus: 'Replace the one _____ blank with return price * quantity; as one complete C++ statement.',
    codeGuide: [
      {
        code: 'int subtotal(int price, int quantity)',
        plain: 'The first int promises a whole-number result. price and quantity are typed temporary input parameters.',
      },
      {
        code: 'price * quantity',
        plain: 'The multiplication expression calculates the subtotal for the current call.',
      },
      {
        code: 'return price * quantity;',
        plain: 'return hands the calculated number back to the caller. The semicolon ends the C++ statement.',
      },
      {
        code: 'int first_total = subtotal(4, 3);',
        plain: 'C++ finishes subtotal(4, 3) first, then stores its returned integer in first_total. The next line reuses the same job with different arguments.',
      },
    ],
    checks: [
      {
        pattern: 'int\\s+subtotal\\s*\\(\\s*int\\s+price\\s*,\\s*int\\s+quantity\\s*\\)',
        message: 'Keep subtotal as an integer-returning function with its two typed parameters.',
      },
      {
        pattern: 'return\\s+price\\s*\\*\\s*quantity\\s*;',
        message: 'Return price multiplied by quantity, then end the statement with a semicolon.',
      },
      {
        pattern: 'int\\s+first_total\\s*=\\s*subtotal\\s*\\(\\s*4\\s*,\\s*3\\s*\\)\\s*;',
        message: 'Keep the first supplied call and the integer variable that stores its result.',
      },
      {
        pattern: 'int\\s+second_total\\s*=\\s*subtotal\\s*\\(\\s*2\\s*,\\s*5\\s*\\)\\s*;',
        message: 'Keep the second supplied call so the same function proves it can handle different arguments.',
      },
    ],
    output: '12\n10',
    hint: 'The complete indented statement is return price * quantity;.',
    recap: 'A typed function can return a calculated value. Different calls can store and reuse different results from the same function.',
    xp: 22,
  },
]

const vectorExercises: Exercise[] = [
  {
    id: 'cpprecords2-retrieve-array',
    conceptId: 'cpp-collections-and-indexes',
    eyebrow: 'Memory check 1 of 5',
    title: 'Recall a fixed parts array',
    explanation:
      'A fixed C++ array keeps a known number of same-type values under one name. A familiar range-based loop gives part one array value during each pass.',
    analogy:
      'A two-slot shelf has room for exactly two labeled bins. The inspection walk visits the first bin and then the second.',
    type: 'prediction',
    prompt: 'What two lines will this familiar array loop display?',
    displayCode:
      'std::string parts[2] = {"bolts", "seals"};\n\nfor (std::string part : parts) {\n    std::cout << part << "\\n";\n}',
    choices: [
      {
        id: 'a',
        label: 'bolts then seals',
        detail: 'The loop visits both array elements in their stored order.',
      },
      {
        id: 'b',
        label: 'part twice',
        detail: 'The loop variable part retrieves the current stored value instead of displaying its own name.',
      },
      {
        id: 'c',
        label: 'Only bolts',
        detail: 'The range-based loop continues until it has visited every value in the array.',
      },
    ],
    correctChoice: 'a',
    output: 'bolts\nseals',
    hint: 'Trace one pass with bolts in part, followed by a second pass with seals in part.',
    recap: 'A fixed array stores a known number of same-type elements, and a range-based loop can visit each one.',
    xp: 8,
  },
  {
    id: 'cpprecords2-vector-purpose',
    conceptId: 'cpp-vectors',
    eyebrow: 'Collection workshop 2 of 5',
    title: 'Meet a growable collection',
    explanation:
      'A vector is a standard C++ collection that can grow after it is created. In #include <vector>, the angle brackets name the header the compiler must load. In std::vector<std::string>, the angle brackets name the element type the vector may store. The dot in parts.push_back(...) means use a member function that belongs to parts. A member function is a named job supplied by that value’s type.',
    analogy:
      'A fixed shelf has a set number of spaces. A workshop cart can accept another matching bin when one arrives. Its labeled controls belong to the cart and perform jobs such as adding a bin or counting the bins.',
    type: 'choice',
    prompt: 'Why would this program use a vector instead of a fixed array?',
    displayCode:
      '#include <vector>\n\nstd::vector<std::string> parts = {"bolts"};\nparts.push_back("seals");',
    choices: [
      {
        id: 'a',
        label: 'The collection can receive another string after it is created',
        detail: 'push_back adds another value whose type matches the vector’s declared element type.',
      },
      {
        id: 'b',
        label: 'The vector lets every item have a different unrelated type',
        detail: 'This vector’s element type is std::string, so every stored element must be text.',
      },
      {
        id: 'c',
        label: 'The compiler no longer needs the vector header',
        detail: 'The vector header supplies the standard vector definition and remains required.',
      },
    ],
    correctChoice: 'a',
    hint: 'Look for the answer about adding another same-type value after the collection already exists.',
    recap: 'std::vector<ElementType> is a growable standard collection. A dot starts a member-function call on one particular value.',
    xp: 10,
  },
  {
    id: 'cpprecords2-predict-growth',
    conceptId: 'cpp-vector-growth',
    eyebrow: 'Growth trace 3 of 5',
    title: 'Follow a vector as it grows',
    explanation:
      'The push_back member function adds one value at the back of a vector. The size member function returns the current number of stored elements. Both jobs use a dot because they belong to the vector value named parts.',
    analogy:
      'The cart begins with two bins. The push-back control adds one more at the end, and the count display then reports all three bins.',
    type: 'prediction',
    prompt: 'What number reaches the console after the vector grows?',
    displayCode:
      'std::vector<std::string> parts = {"bolts", "seals"};\nparts.push_back("cables");\nstd::cout << parts.size();',
    choices: [
      {
        id: 'a',
        label: '3',
        detail: 'The vector begins with two strings, then push_back adds cables as the third.',
      },
      {
        id: 'b',
        label: '2',
        detail: 'Two is the starting size before the push_back call adds another element.',
      },
      {
        id: 'c',
        label: 'cables',
        detail: 'size returns the element count, not the last stored string.',
      },
    ],
    correctChoice: 'a',
    output: '3',
    hint: 'Count the two starting strings, then include the one string added by push_back.',
    recap: 'push_back adds one matching element at the end of a vector, and size returns its current element count.',
    xp: 14,
  },
  {
    id: 'cpprecords2-fix-push-back',
    conceptId: 'cpp-vector-growth',
    eyebrow: 'Debugging bench 4 of 5',
    title: 'Repair the vector update',
    explanation:
      'The program intends to call push_back with the string "seals", but square brackets do not form a function call. A member-function call needs parentheses around its argument and a semicolon after the complete statement.',
    analogy:
      'The cart’s add control expects a bin placed in its round input slot. The current work order points at the wrong-shaped slot, so the compiler stops and marks the problem.',
    type: 'bugfix',
    prompt: 'Replace the square brackets with parentheses so the program adds seals and compiles.',
    starterCode:
      '#include <iostream>\n#include <string>\n#include <vector>\n\nint main() {\n    std::vector<std::string> parts = {"bolts"};\n    parts.push_back["seals"];\n\n    for (std::string part : parts) {\n        std::cout << part << "\\n";\n    }\n    return 0;\n}',
    focus: 'Change only parts.push_back["seals"]; to parts.push_back("seals");. Keep the supplied vector and output loop in place.',
    codeGuide: [
      {
        code: '#include <vector>',
        plain: 'This header supplies the standard vector type. These angle brackets name a header for the compiler.',
      },
      {
        code: 'std::vector<std::string> parts',
        plain: 'This declares parts as a vector whose element type is std::string. These angle brackets name the stored value type.',
      },
      {
        code: 'parts.push_back["seals"];',
        plain: 'This is the faulty line. Square brackets are not the parentheses required for this member-function call.',
      },
      {
        code: 'parts.push_back("seals");',
        plain: 'The dot selects the push_back member function, parentheses hold its string argument, and the semicolon ends the statement.',
      },
    ],
    checks: [
      {
        pattern: 'std::vector\\s*<\\s*std::string\\s*>\\s+parts\\s*=\\s*\\{\\s*"bolts"\\s*\\}\\s*;',
        message: 'Keep the supplied vector of strings and its starting bolts element.',
      },
      {
        pattern: 'parts\\.push_back\\s*\\(\\s*"seals"\\s*\\)\\s*;',
        message: 'Call parts.push_back with "seals" inside parentheses, then add the final semicolon.',
      },
      {
        pattern: 'for\\s*\\(\\s*std::string\\s+part\\s*:\\s*parts\\s*\\)',
        message: 'Keep the supplied range-based loop so every vector element reaches the console.',
      },
    ],
    output: 'bolts\nseals',
    hint: 'A member-function call uses the shape name.member(argument);. Here it is parts.push_back("seals");.',
    recap: 'Use parentheses for a member-function call: parts.push_back("seals"); adds one string to the vector.',
    xp: 16,
  },
  {
    id: 'cpprecords2-add-parts',
    conceptId: 'cpp-vector-functions',
    eyebrow: 'Growable list 5 of 5',
    title: 'Add parts to a vector',
    explanation:
      'A vector can receive several values through separate push_back calls. This lesson keeps both edits directly inside main. Reference parameters arrive later, after the course has explained what a reference means.',
    analogy:
      'The workshop cart already carries bolts. Use its add control twice, once for seals and once for cables, before the stock clerk counts and reads every bin.',
    type: 'code',
    prompt: 'Complete both statements so the vector stores bolts, seals, and cables in that order.',
    starterCode:
      '#include <iostream>\n#include <string>\n#include <vector>\n\nint main() {\n    std::vector<std::string> parts = {"bolts"};\n    parts.push_back(_____);\n    parts._____("cables");\n\n    std::cout << "Parts: " << parts.size() << "\\n";\n    for (std::string part : parts) {\n        std::cout << part << "\\n";\n    }\n    return 0;\n}',
    focus: 'Replace the first _____ with the quoted string "seals" and the second _____ with the member-function name push_back.',
    codeGuide: [
      {
        code: 'std::vector<std::string> parts = {"bolts"};',
        plain: 'The vector begins with one string element. Its element type allows more std::string values to be added later.',
      },
      {
        code: 'parts.push_back("seals");',
        plain: 'The first completed call adds seals at the back of the vector.',
      },
      {
        code: 'parts.push_back("cables");',
        plain: 'The second completed call reuses the same member function and adds cables after seals.',
      },
      {
        code: 'parts.size()',
        plain: 'The supplied size call returns 3 after both additions. The range-based loop then reports the three strings in order.',
      },
    ],
    checks: [
      {
        pattern: 'std::vector\\s*<\\s*std::string\\s*>\\s+parts\\s*=\\s*\\{\\s*"bolts"\\s*\\}\\s*;',
        message: 'Keep the supplied vector of strings with bolts as its starting element.',
      },
      {
        pattern: 'parts\\.push_back\\s*\\(\\s*"seals"\\s*\\)\\s*;',
        message: 'Use push_back with the quoted string "seals" in the first incomplete statement.',
      },
      {
        pattern: 'parts\\.push_back\\s*\\(\\s*"cables"\\s*\\)\\s*;',
        message: 'Use the member-function name push_back in the second incomplete statement.',
      },
      {
        pattern: 'std::cout\\s*<<\\s*"Parts: "\\s*<<\\s*parts\\.size\\s*\\(\\s*\\)',
        message: 'Keep the supplied size report so the console shows the final vector count.',
      },
    ],
    output: 'Parts: 3\nbolts\nseals\ncables',
    hint: 'The two complete statements are parts.push_back("seals"); and parts.push_back("cables");.',
    recap: 'Separate push_back calls can add several same-type values, and a vector preserves their insertion order.',
    xp: 22,
  },
]

// This authored module remains outside the public course registry and runner
// registry until all six modules, runner assignments, and release gates pass.
export const cppCollectionsRecordsReturnValuesModule: Mission = {
  id: 'cpp-records-return-values',
  language: 'cpp',
  chapter: 1,
  title: 'Functions that return answers',
  subtitle: 'Hand a useful result back',
  description: 'Extend familiar functions so their calculated answers can be stored and reused.',
  duration: '8 min',
  icon: 'terminal',
  status: 'available',
  exercises: returnValueExercises,
}

export const cppCollectionsRecordsVectorsModule: Mission = {
  id: 'cpp-records-vectors',
  language: 'cpp',
  chapter: 2,
  title: 'Vectors that grow and change',
  subtitle: 'Add another matching value',
  description: 'Move from a fixed array to a standard collection that can receive more values.',
  duration: '8 min',
  icon: 'package',
  status: 'locked',
  exercises: vectorExercises,
}

export const cppCollectionsRecordsDraftModules: readonly Mission[] = [
  cppCollectionsRecordsReturnValuesModule,
  cppCollectionsRecordsVectorsModule,
]
