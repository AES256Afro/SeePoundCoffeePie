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

const structExercises: Exercise[] = [
  {
    id: 'cpprecords3-retrieve-types',
    conceptId: 'cpp-variables',
    eyebrow: 'Memory check 1 of 5',
    title: 'Recall typed storage',
    explanation:
      'C++ records a type when a variable is declared. std::string tells the compiler to expect text, while int tells it to expect a whole number. The equals sign initializes each new variable by giving it a starting value.',
    analogy:
      'A workshop form has a text box for a part name and a numbered box for its quantity. Each label tells the clerk what kind of value belongs in that space.',
    type: 'prediction',
    prompt: 'What line will the two typed variables produce when they are displayed together?',
    displayCode:
      'std::string part_name = "bolts";\nint quantity = 4;\n\nstd::cout << part_name << ": " << quantity;',
    choices: [
      {
        id: 'a',
        label: 'bolts: 4',
        detail: 'part_name stores the text bolts, and quantity stores the whole number 4.',
      },
      {
        id: 'b',
        label: 'part_name: quantity',
        detail: 'C++ retrieves the values stored by the variable names instead of printing the names themselves.',
      },
      {
        id: 'c',
        label: '4: bolts',
        detail: 'The output instruction reads part_name first and quantity second.',
      },
    ],
    correctChoice: 'a',
    output: 'bolts: 4',
    hint: 'Replace each variable name in the output instruction with the starting value stored under that name.',
    recap: 'A declaration gives a variable a type, and initialization supplies the starting value that its name retrieves later.',
    xp: 8,
  },
  {
    id: 'cpprecords3-struct-purpose',
    conceptId: 'cpp-structs',
    eyebrow: 'Record workshop 2 of 5',
    title: 'Meet a record shape',
    explanation:
      'A record keeps related values together. In C++, struct defines a reusable user-defined type for that record shape. Each named variable inside the struct is a field. Part part{"bolts", 4}; uses aggregate initialization: the braces provide one starting value for each field in the order those fields were defined.',
    analogy:
      'Instead of carrying a loose name card and quantity card, the workshop uses one Part form with two labeled fields. Every completed Part form follows the same shape.',
    type: 'choice',
    prompt: 'What job does the Part struct perform in this program?',
    displayCode:
      'struct Part {\n    std::string name;\n    int quantity;\n};\n\nPart part{"bolts", 4};',
    choices: [
      {
        id: 'a',
        label: 'Defines one reusable record type with name and quantity fields',
        detail: 'Part becomes a user-defined type, and each Part value keeps its related name and quantity together.',
      },
      {
        id: 'b',
        label: 'Displays bolts and 4 automatically',
        detail: 'The struct and initialization create a value. Console output still needs a separate std::cout instruction.',
      },
      {
        id: 'c',
        label: 'Creates two unrelated global variables',
        detail: 'name and quantity are fields of each Part record rather than unrelated values floating outside it.',
      },
    ],
    correctChoice: 'a',
    hint: 'Choose the answer about defining one named shape that can keep two related values together.',
    recap: 'A struct defines a reusable record type. Its fields name the related values, and aggregate-initialization braces supply their starting values in order.',
    xp: 10,
  },
  {
    id: 'cpprecords3-predict-fields',
    conceptId: 'cpp-struct-fields',
    eyebrow: 'Field trace 3 of 5',
    title: 'Read a part record',
    explanation:
      'The dot operator selects one field from one record value. part.name reads the text field named name from part, while part.quantity reads the whole-number field named quantity from that same Part record.',
    analogy:
      'The dot acts like pointing to one labeled box on a completed Part form. Pointing to the name box retrieves bolts, and pointing to the quantity box retrieves 4.',
    type: 'prediction',
    prompt: 'What line reaches the console when both fields are read with the dot operator?',
    displayCode:
      'struct Part {\n    std::string name;\n    int quantity;\n};\n\nPart part{"bolts", 4};\nstd::cout << part.name << ": " << part.quantity;',
    choices: [
      {
        id: 'a',
        label: 'bolts: 4',
        detail: 'The two dot expressions retrieve the name and quantity stored in part.',
      },
      {
        id: 'b',
        label: 'name: quantity',
        detail: 'name and quantity are field labels. The dot expressions retrieve their stored values.',
      },
      {
        id: 'c',
        label: 'Part: bolts',
        detail: 'Part is the record type, but the output instruction reads the two fields from the value named part.',
      },
    ],
    correctChoice: 'a',
    output: 'bolts: 4',
    hint: 'Read the aggregate values in field order, then replace part.name and part.quantity with those stored values.',
    recap: 'Use record.field to select a field from one record value. The dot connects the particular record to the field being read.',
    xp: 14,
  },
  {
    id: 'cpprecords3-fix-field-access',
    conceptId: 'cpp-struct-fields',
    eyebrow: 'Debugging bench 4 of 5',
    title: 'Repair the field name',
    explanation:
      'The supplied Part struct defines fields named name and quantity. The output instruction asks for part.label, but Part has no field named label, so the compiler cannot complete that access. The record and its stored values are already correct.',
    analogy:
      'The clerk asks for the label box on a form that only has name and quantity boxes. Correcting the requested box name is enough to finish the lookup.',
    type: 'bugfix',
    prompt: 'Repair the field access so the program displays the stored part name and compiles.',
    starterCode:
      '#include <iostream>\n#include <string>\n\nstruct Part {\n    std::string name;\n    int quantity;\n};\n\nint main() {\n    Part part{"bolts", 4};\n    std::cout << part.label;\n    return 0;\n}',
    focus: 'Change only part.label to part.name. Keep the supplied struct definition and initialized Part value unchanged.',
    codeGuide: [
      {
        code: 'struct Part { ... };',
        plain: 'This supplied definition creates the Part record type. The semicolon after the closing brace finishes the type definition.',
      },
      {
        code: 'Part part{"bolts", 4};',
        plain: 'This creates one Part value. The braces initialize name with bolts and quantity with 4 in the defined field order.',
      },
      {
        code: 'part.label',
        plain: 'This is the faulty access because the supplied Part shape has no field named label.',
      },
      {
        code: 'part.name',
        plain: 'This repaired dot expression selects the existing text field named name from the record named part.',
      },
    ],
    checks: [
      {
        pattern: 'struct\\s+Part\\s*\\{\\s*std::string\\s+name\\s*;\\s*int\\s+quantity\\s*;\\s*\\}\\s*;',
        message: 'Keep the supplied Part struct with its name and quantity fields.',
      },
      {
        pattern: 'Part\\s+part\\s*\\{\\s*"bolts"\\s*,\\s*4\\s*\\}\\s*;',
        message: 'Keep the supplied Part value initialized with bolts and quantity 4.',
      },
      {
        pattern: 'std::cout\\s*<<\\s*part\\.name\\s*;',
        message: 'Use the dot operator to display the existing name field from part.',
      },
    ],
    output: 'bolts',
    hint: 'Look inside the Part definition for the exact field that stores text, then use that name after part and the dot.',
    recap: 'A field access must use a field name defined by the record type. part.name reads the supplied Part record’s name field.',
    xp: 16,
  },
  {
    id: 'cpprecords3-build-part-record',
    conceptId: 'cpp-record-construction',
    eyebrow: 'Inventory record 5 of 5',
    title: 'Build and store a part record',
    explanation:
      'A vector can use a user-defined record as its element type. First, aggregate initialization creates one complete Part value. Then push_back appends a copy of that value to the vector. This lesson deliberately uses no reference syntax yet.',
    analogy:
      'Complete one Part form with a name and quantity, then place a copy of that finished form in the inventory tray. The tray now holds one complete record.',
    type: 'code',
    prompt: 'Complete the two field values so the Part record stores bolts and quantity 4 before it enters the vector.',
    starterCode:
      '#include <iostream>\n#include <string>\n#include <vector>\n\nstruct Part {\n    std::string name;\n    int quantity;\n};\n\nint main() {\n    std::vector<Part> parts;\n    Part part{_____, _____};\n    parts.push_back(part);\n\n    for (Part stored_part : parts) {\n        std::cout << stored_part.name << ": " << stored_part.quantity << "\\n";\n    }\n    return 0;\n}',
    focus: 'Replace the first _____ with the quoted string "bolts" and the second _____ with the whole number 4. Do not change the supplied vector or loop.',
    codeGuide: [
      {
        code: 'std::vector<Part> parts;',
        plain: 'This declares a growable vector whose element type is the user-defined Part record. It begins empty.',
      },
      {
        code: 'Part part{"bolts", 4};',
        plain: 'This completed aggregate initialization creates one Part. The first value initializes name, and the second initializes quantity.',
      },
      {
        code: 'parts.push_back(part);',
        plain: 'The supplied member-function call appends a copy of the completed Part value to the vector.',
      },
      {
        code: 'for (Part stored_part : parts)',
        plain: 'The supplied range-based loop visits the vector record by record. It does not use a reference, which arrives in the next module.',
      },
    ],
    checks: [
      {
        pattern: 'std::vector\\s*<\\s*Part\\s*>\\s+parts\\s*;',
        message: 'Keep the supplied empty vector whose element type is Part.',
      },
      {
        pattern: 'Part\\s+part\\s*\\{\\s*"bolts"\\s*,\\s*4\\s*\\}\\s*;',
        message: 'Initialize part with the quoted name "bolts" followed by the whole number 4.',
      },
      {
        pattern: 'parts\\.push_back\\s*\\(\\s*part\\s*\\)\\s*;',
        message: 'Keep the supplied push_back call that stores the completed Part in the vector.',
      },
      {
        pattern: 'for\\s*\\(\\s*Part\\s+stored_part\\s*:\\s*parts\\s*\\)',
        message: 'Keep the supplied copy-based loop that reports each stored Part record.',
      },
    ],
    output: 'bolts: 4',
    hint: 'Inside the braces, write the two field values in their defined order: "bolts" first, followed by 4.',
    recap: 'A vector can store records as its elements. Create a complete Part with aggregate initialization, then append it with push_back.',
    xp: 22,
  },
]

const recordUpdateExercises: Exercise[] = [
  {
    id: 'cpprecords4-retrieve-vector-loop',
    conceptId: 'cpp-vector-functions',
    eyebrow: 'Memory check 1 of 5',
    title: 'Recall a vector loop',
    explanation:
      'A vector of Part records can be visited with the familiar range-based loop. On each pass, the copy-based loop variable part receives one record, and the dot operator reads that record’s name and quantity fields.',
    analogy:
      'The clerk copies each inventory form onto a reading card, reports its two fields, then moves to the next form in the tray.',
    type: 'prediction',
    prompt: 'What two lines will this read-only loop display from the supplied vector?',
    displayCode:
      'std::vector<Part> parts = {{"bolts", 4}, {"seals", 2}};\n\nfor (Part part : parts) {\n    std::cout << part.name << ": " << part.quantity << "\\n";\n}',
    choices: [
      {
        id: 'a',
        label: 'bolts: 4 then seals: 2',
        detail: 'The loop visits both records in order and reads the two fields from each copied record.',
      },
      {
        id: 'b',
        label: 'Part twice',
        detail: 'Part names the record type. The dot expressions retrieve the values stored in each record.',
      },
      {
        id: 'c',
        label: 'Only bolts: 4',
        detail: 'A range-based loop continues until it has visited both vector elements.',
      },
    ],
    correctChoice: 'a',
    output: 'bolts: 4\nseals: 2',
    hint: 'Trace one pass using the bolts record, then a second pass using the seals record.',
    recap: 'A range-based loop can visit a vector of records, and the dot operator reads fields from the current record.',
    xp: 8,
  },
  {
    id: 'cpprecords4-reference-purpose',
    conceptId: 'cpp-references',
    eyebrow: 'Update workshop 2 of 5',
    title: 'Meet a reference',
    explanation:
      'A normal Part parameter or loop variable receives a copy, so changing it does not change the original record. An ampersand in a declaration, such as Part& part, makes part a reference: another name for the original Part. The same declaration shape works for a function parameter and a range-based loop variable.',
    analogy:
      'Writing on a photocopy leaves the inventory form unchanged. A reference is permission to write on the original form through another temporary name.',
    type: 'choice',
    prompt: 'Why does this code place an ampersand after Part in both declarations?',
    displayCode:
      'void add_one(Part& part) {\n    part.quantity = part.quantity + 1;\n}\n\nfor (Part& part : parts) {\n    add_one(part);\n}',
    choices: [
      {
        id: 'a',
        label: 'Each part name refers to an original record instead of a copy',
        detail: 'The loop reaches each stored Part, and the function parameter continues referring to that same original record.',
      },
      {
        id: 'b',
        label: 'The ampersand adds one to the quantity',
        detail: 'The assignment performs the addition. The ampersand controls whether the original record or a copy is updated.',
      },
      {
        id: 'c',
        label: 'The ampersand displays the changed record',
        detail: 'A reference does not print anything. Output still requires a separate std::cout instruction.',
      },
    ],
    correctChoice: 'a',
    hint: 'Choose the answer that contrasts another name for the original Part with an independent copied Part.',
    recap: 'Part& declares a reference to an original Part. Updating a field through that name changes the original record rather than a temporary copy.',
    xp: 10,
  },
  {
    id: 'cpprecords4-predict-update',
    conceptId: 'cpp-reference-updates',
    eyebrow: 'Reference trace 3 of 5',
    title: 'Follow an original record update',
    explanation:
      'The range-based loop variable is declared as Part& current, so current refers to the original vector element during that pass. Assigning a new quantity through current therefore changes the quantity stored inside parts.',
    analogy:
      'The clerk writes two more units directly on the original bolts form. Reading that same form afterward reveals the updated quantity.',
    type: 'prediction',
    prompt: 'What line reaches the console after the reference loop updates the stored record?',
    displayCode:
      'std::vector<Part> parts = {{"bolts", 4}};\n\nfor (Part& current : parts) {\n    current.quantity = current.quantity + 2;\n}\n\nstd::cout << parts[0].name << ": " << parts[0].quantity;',
    choices: [
      {
        id: 'a',
        label: 'bolts: 6',
        detail: 'current refers to the original vector element, so adding 2 changes its stored quantity from 4 to 6.',
      },
      {
        id: 'b',
        label: 'bolts: 4',
        detail: 'That result would come from changing a copy. The ampersand makes current a reference to the original.',
      },
      {
        id: 'c',
        label: 'current: 2',
        detail: 'The assignment updates a field value, and the output reads the stored record through parts[0].',
      },
    ],
    correctChoice: 'a',
    output: 'bolts: 6',
    hint: 'Because current is a reference, begin with the original quantity 4 and add 2 to that stored value.',
    recap: 'A reference loop variable can update an original vector element. Later reads through the vector observe the changed field value.',
    xp: 14,
  },
  {
    id: 'cpprecords4-fix-copy-update',
    conceptId: 'cpp-reference-updates',
    eyebrow: 'Debugging bench 4 of 5',
    title: 'Repair the copy mistake',
    explanation:
      'The loop currently declares Part current without an ampersand, so each pass changes only a temporary copy. The program compiles, but the original record in parts remains unchanged. Adding the reference marker connects current to that stored record.',
    analogy:
      'The clerk correctly adds three on a photocopy, then throws the copy away. Marking current as a reference moves the same edit onto the original inventory form.',
    type: 'bugfix',
    prompt: 'Add the missing reference marker so the loop changes the original bolts quantity from 4 to 7.',
    starterCode:
      '#include <iostream>\n#include <string>\n#include <vector>\n\nstruct Part {\n    std::string name;\n    int quantity;\n};\n\nint main() {\n    std::vector<Part> parts = {{"bolts", 4}};\n\n    for (Part current : parts) {\n        current.quantity = current.quantity + 3;\n    }\n\n    std::cout << parts[0].name << ": " << parts[0].quantity;\n    return 0;\n}',
    focus: 'Change only Part current to Part& current in the supplied loop header. Keep the update and final vector report unchanged.',
    codeGuide: [
      {
        code: 'for (Part current : parts)',
        plain: 'This faulty header copies each Part into current. Updating that copy cannot change the original vector element.',
      },
      {
        code: 'for (Part& current : parts)',
        plain: 'The ampersand declares current as another name for the original Part visited during each loop pass.',
      },
      {
        code: 'current.quantity = current.quantity + 3;',
        plain: 'This supplied assignment reads the original quantity through the reference, adds 3, and stores the result back in that field.',
      },
      {
        code: 'parts[0].quantity',
        plain: 'The final output reads the original vector record, proving whether the loop updated stored data or only a copy.',
      },
    ],
    checks: [
      {
        pattern: 'std::vector\\s*<\\s*Part\\s*>\\s+parts\\s*=\\s*\\{\\s*\\{\\s*"bolts"\\s*,\\s*4\\s*\\}\\s*\\}\\s*;',
        message: 'Keep the supplied vector containing the bolts record with quantity 4.',
      },
      {
        pattern: 'for\\s*\\(\\s*Part\\s*&\\s*current\\s*:\\s*parts\\s*\\)',
        message: 'Add an ampersand after Part so current refers to each original vector record.',
      },
      {
        pattern: 'current\\.quantity\\s*=\\s*current\\.quantity\\s*\\+\\s*3\\s*;',
        message: 'Keep the supplied expanded update that adds 3 to the current quantity.',
      },
      {
        pattern: 'std::cout\\s*<<\\s*parts\\s*\\[\\s*0\\s*\\]\\.name\\s*<<\\s*": "\\s*<<\\s*parts\\s*\\[\\s*0\\s*\\]\\.quantity\\s*;',
        message: 'Keep the supplied final report that reads the original vector element.',
      },
    ],
    output: 'bolts: 7',
    hint: 'Place one ampersand between the type Part and the loop variable current: Part& current.',
    recap: 'Without &, a range-based loop changes a copy. Declaring Part& current lets the same assignment update the original stored record.',
    xp: 16,
  },
  {
    id: 'cpprecords4-restock-part',
    conceptId: 'cpp-record-updates',
    eyebrow: 'Restock helper 5 of 5',
    title: 'Restock a named part',
    explanation:
      'A function can receive a reference to an entire vector as std::vector<Part>& parts. That means the function works with the caller’s original collection. Inside it, Part& part refers to each original record. The condition finds the matching name, and the assignment adds the supplied amount to that record’s quantity.',
    analogy:
      'The restock helper receives the original inventory tray, checks each original form for the requested name, then writes the delivered amount into the matching quantity field.',
    type: 'code',
    prompt: 'Complete the matching condition and quantity assignment so the function adds 3 seals to the original record.',
    starterCode:
      '#include <iostream>\n#include <string>\n#include <vector>\n\nstruct Part {\n    std::string name;\n    int quantity;\n};\n\nvoid restock(std::vector<Part>& parts, std::string target, int amount) {\n    for (Part& part : parts) {\n        if (_____) {\n            _____;\n        }\n    }\n}\n\nint main() {\n    std::vector<Part> parts = {{"bolts", 4}, {"seals", 2}};\n    restock(parts, "seals", 3);\n    std::cout << parts[1].name << ": " << parts[1].quantity;\n    return 0;\n}',
    focus: 'Replace the first _____ with part.name == target and the second _____ with part.quantity = part.quantity + amount. Keep both reference declarations in place.',
    codeGuide: [
      {
        code: 'std::vector<Part>& parts',
        plain: 'This is a reference parameter for the whole vector. The function name parts refers to the caller’s original collection instead of a copied vector.',
      },
      {
        code: 'for (Part& part : parts)',
        plain: 'This reference loop variable refers to each original Part record so a field assignment can persist after the loop.',
      },
      {
        code: 'if (part.name == target)',
        plain: 'The completed condition compares the current record’s name with the requested target name. The body runs only for a match.',
      },
      {
        code: 'part.quantity = part.quantity + amount;',
        plain: 'The completed expanded assignment reads the matching quantity, adds the supplied amount, and stores the result in the original field.',
      },
      {
        code: 'restock(parts, "seals", 3);',
        plain: 'This supplied call passes the original vector, the target name seals, and the amount 3 into the helper.',
      },
    ],
    checks: [
      {
        pattern: 'void\\s+restock\\s*\\(\\s*std::vector\\s*<\\s*Part\\s*>\\s*&\\s*parts\\s*,\\s*std::string\\s+target\\s*,\\s*int\\s+amount\\s*\\)',
        message: 'Keep the supplied restock function and its vector reference parameter.',
      },
      {
        pattern: 'for\\s*\\(\\s*Part\\s*&\\s*part\\s*:\\s*parts\\s*\\)',
        message: 'Keep the supplied Part reference loop so updates reach the original records.',
      },
      {
        pattern: 'if\\s*\\(\\s*part\\.name\\s*==\\s*target\\s*\\)',
        message: 'Compare the current part name with target inside the supplied if condition.',
      },
      {
        pattern: 'part\\.quantity\\s*=\\s*part\\.quantity\\s*\\+\\s*amount\\s*;',
        message: 'Add amount to the current quantity with the expanded assignment shown in the lesson.',
      },
      {
        pattern: 'restock\\s*\\(\\s*parts\\s*,\\s*"seals"\\s*,\\s*3\\s*\\)\\s*;',
        message: 'Keep the supplied call that restocks seals by 3.',
      },
    ],
    output: 'seals: 5',
    hint: 'First compare part.name with target using ==. Then assign part.quantity + amount back to part.quantity.',
    recap: 'A vector reference parameter gives a helper access to the original collection, and a Part reference loop can update the matching original record.',
    xp: 22,
  },
]

// These authored modules remain outside the public course registry and runner
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

export const cppCollectionsRecordsStructsModule: Mission = {
  id: 'cpp-records-structs',
  language: 'cpp',
  chapter: 3,
  title: 'Records with struct',
  subtitle: 'Keep related values together',
  description: 'Define a small record shape, create one Part, and store that record in a vector.',
  duration: '8 min',
  icon: 'package',
  status: 'locked',
  exercises: structExercises,
}

export const cppCollectionsRecordsUpdatesModule: Mission = {
  id: 'cpp-records-updates',
  language: 'cpp',
  chapter: 4,
  title: 'Updating stored records',
  subtitle: 'Change the original, not a copy',
  description: 'Use references to find and update original Part records inside a vector.',
  duration: '9 min',
  icon: 'terminal',
  status: 'locked',
  exercises: recordUpdateExercises,
}

export const cppCollectionsRecordsDraftModules: readonly Mission[] = [
  cppCollectionsRecordsReturnValuesModule,
  cppCollectionsRecordsVectorsModule,
  cppCollectionsRecordsStructsModule,
  cppCollectionsRecordsUpdatesModule,
]
