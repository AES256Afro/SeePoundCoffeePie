import {
  mergeCodebookContributions,
  type CodebookContribution,
  type CodebookEntry,
  type CodebookMissionOwnership,
} from './codebook-contributions'

export const controlledCodebookContributions: readonly CodebookContribution[] = Object.freeze([
  {
    kind: 'extend',
    targetTerm: 'Return value',
    language: 'cpp',
    example: 'int total = subtotal(4, 3);',
    unlockAfterMissionId: 'cpp-records-return-values',
  },
  {
    kind: 'add',
    entry: {
      term: 'Vector',
      plain: 'A C++ collection that stores values of one element type in order and can grow as values are added.',
      ship: 'A numbered row of matching storage slots that can add another slot when a new item arrives.',
      keywords: ['collection', 'ordered', 'grow', 'push back', 'element'],
    },
    language: 'cpp',
    example: 'std::vector<std::string> parts = {"bolts", "seals"};',
    unlockAfterMissionId: 'cpp-records-vectors',
  },
  {
    kind: 'add',
    entry: {
      term: 'Element type',
      plain: 'The type every element in a collection must have. In std::vector<std::string>, std::string is the element type.',
      ship: 'A labeled workshop tray accepts one kind of part, so every item placed in it must match that label.',
      keywords: ['collection', 'element', 'type', 'vector', 'angle brackets'],
    },
    language: 'cpp',
    example: 'std::vector<std::string> parts;  // std::string is the element type',
    unlockAfterMissionId: 'cpp-records-vectors',
  },
  {
    kind: 'add',
    entry: {
      term: 'Member function',
      plain: 'A named operation supplied by a value’s type and called through that value with a dot, such as push_back on a vector.',
      ship: 'A control attached to one workshop tray performs a job that belongs to that tray.',
      keywords: ['method', 'dot', 'call', 'push back', 'vector operation'],
    },
    language: 'cpp',
    example: 'parts.push_back("bolts");',
    unlockAfterMissionId: 'cpp-records-vectors',
  },
  {
    kind: 'extend',
    targetTerm: 'Length',
    language: 'cpp',
    example: 'std::cout << parts.size();',
    unlockAfterMissionId: 'cpp-records-vectors',
  },
  {
    kind: 'add',
    entry: {
      term: 'Record',
      plain: 'One value that keeps several related pieces of information together under named fields.',
      ship: 'One workshop inventory card keeps a part name and its quantity together instead of using loose notes.',
      keywords: ['related values', 'fields', 'data', 'part', 'struct value'],
    },
    language: 'cpp',
    example: 'Part part{"bolts", 4};',
    unlockAfterMissionId: 'cpp-records-structs',
  },
  {
    kind: 'add',
    entry: {
      term: 'Struct',
      plain: 'A C++ definition for a record shape that keeps several named fields together as one value.',
      ship: 'A workshop card template with named spaces for a part name, price, and quantity.',
      keywords: ['record', 'fields', 'user-defined type', 'related values'],
    },
    language: 'cpp',
    example: 'struct Part { std::string name; int quantity; };',
    unlockAfterMissionId: 'cpp-records-structs',
  },
  {
    kind: 'add',
    entry: {
      term: 'Field',
      plain: 'A named piece of information inside a record. The dot operator selects one field from one record value.',
      ship: 'A labeled space on a workshop inventory card holds one detail, such as the part name or quantity.',
      keywords: ['record', 'named value', 'dot', 'member', 'quantity'],
    },
    language: 'cpp',
    example: 'std::cout << part.name << ": " << part.quantity;',
    unlockAfterMissionId: 'cpp-records-structs',
  },
  {
    kind: 'add',
    entry: {
      term: 'Reference',
      plain: 'Another name for an existing C++ value. An ampersand in a declaration lets an update reach the original value instead of a copy.',
      ship: 'A repair ticket points to the original machine, so the mechanic changes that machine instead of a duplicate model.',
      keywords: ['original value', 'ampersand', 'copy', 'update', 'alias'],
    },
    language: 'cpp',
    example: 'for (Part& part : parts) { part.quantity = part.quantity + 1; }',
    unlockAfterMissionId: 'cpp-records-updates',
  },
  {
    kind: 'extend',
    targetTerm: 'Accumulator',
    language: 'cpp',
    example: 'int total = 0;\nfor (Part part : parts) { total = total + part.quantity; }',
    unlockAfterMissionId: 'cpp-records-summaries',
  },
  {
    kind: 'extend',
    targetTerm: 'Filter',
    language: 'cpp',
    example: 'if (part.quantity < limit) { names.push_back(part.name); }',
    unlockAfterMissionId: 'cpp-records-summaries',
  },
])

export function applyControlledCodebookContributions(
  entries: CodebookEntry[],
  ownsMission: CodebookMissionOwnership,
): CodebookEntry[] {
  return mergeCodebookContributions(entries, controlledCodebookContributions, ownsMission)
}
