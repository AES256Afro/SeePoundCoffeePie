import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const projectRoot = fileURLToPath(new URL('../', import.meta.url))
const authoredCoursePath = path.join(
  projectRoot,
  'src/data/cpp-collections-records-course-draft.ts',
)
const defaultOutputPath = path.join(
  projectRoot,
  'src/data/cpp-collections-records-course-packed.generated.json',
)
const absent = 1
const stringSlot = 0
const delimiter = '~'
const defaultWordCount = 122
const wordPattern = /[A-Za-z_][A-Za-z0-9_:-]*/gu

const expectedExerciseTypes = [
  'prediction',
  'choice',
  'prediction',
  'bugfix',
  'code',
  'prediction',
  'choice',
  'prediction',
  'bugfix',
  'code',
  'prediction',
  'choice',
  'prediction',
  'bugfix',
  'code',
  'prediction',
  'choice',
  'prediction',
  'bugfix',
  'code',
  'prediction',
  'choice',
  'ordering',
  'bugfix',
  'code',
  'prediction',
  'choice',
  'ordering',
  'bugfix',
  'code',
]
const expectedXpByPosition = [8, 10, 14, 16, 22]
const expectedDurations = ['8 min', '8 min', '8 min', '9 min', '9 min', '11 min']
const expectedIcons = ['terminal', 'package', 'package', 'terminal', 'package', 'crown']

function fail(message) {
  throw new Error(`Cannot pack Practical C++ safely: ${message}`)
}

function assert(condition, message) {
  if (!condition) fail(message)
}

function assertAbsent(exercise, keys) {
  for (const key of keys) {
    assert(exercise[key] === undefined, `${exercise.id} unexpectedly defines ${key}.`)
  }
}

function packChoices(exercise) {
  assert(Array.isArray(exercise.choices) && exercise.choices.length === 3, `${exercise.id} needs three choices.`)
  assert(exercise.correctChoice === 'a', `${exercise.id} no longer uses choice a as its answer.`)
  return exercise.choices.map((choice, index) => {
    assert(choice.id === 'abc'[index], `${exercise.id} choice IDs must remain a, b, c in order.`)
    assert(typeof choice.detail === 'string', `${exercise.id} choice ${choice.id} needs its explanation.`)
    return [choice.label, choice.detail]
  })
}

function packGuide(exercise) {
  assert(Array.isArray(exercise.codeGuide) && exercise.codeGuide.length > 0, `${exercise.id} needs a code guide.`)
  return exercise.codeGuide.map((entry) => [entry.code, entry.plain])
}

function packChecks(exercise) {
  assert(Array.isArray(exercise.checks) && exercise.checks.length > 0, `${exercise.id} needs checks.`)
  return exercise.checks.map((check) => {
    assert(check.flags === undefined, `${exercise.id} added check flags that the packed schema does not encode.`)
    return [check.pattern, check.message]
  })
}

function packExercise(exercise, exerciseIndex) {
  const expectedType = expectedExerciseTypes[exerciseIndex]
  const expectedXp = expectedXpByPosition[exerciseIndex % expectedXpByPosition.length]
  assert(exercise.type === expectedType, `${exercise.id} changed type from the reviewed ${expectedType}.`)
  assert(exercise.xp === expectedXp, `${exercise.id} changed XP from the reviewed ${expectedXp}.`)

  const common = [
    exercise.id,
    exercise.conceptId,
    exercise.eyebrow,
    exercise.title,
    exercise.explanation,
    exercise.analogy,
    exercise.prompt,
    exercise.hint,
    exercise.recap,
  ]

  if (exercise.type === 'prediction') {
    assert(typeof exercise.displayCode === 'string', `${exercise.id} needs display code.`)
    assert(typeof exercise.output === 'string', `${exercise.id} needs expected output.`)
    assertAbsent(exercise, ['starterCode', 'focus', 'codeGuide', 'orderItems', 'correctOrder', 'incorrectMessage', 'checks'])
    return [...common, exercise.displayCode, packChoices(exercise), exercise.output]
  }

  if (exercise.type === 'choice') {
    assertAbsent(exercise, ['starterCode', 'focus', 'codeGuide', 'orderItems', 'correctOrder', 'incorrectMessage', 'checks', 'output'])
    return [
      ...common,
      exercise.displayCode ?? absent,
      packChoices(exercise),
    ]
  }

  if (exercise.type === 'ordering') {
    assert(Array.isArray(exercise.orderItems) && exercise.orderItems.length > 0, `${exercise.id} needs order items.`)
    assert(Array.isArray(exercise.correctOrder) && exercise.correctOrder.length > 0, `${exercise.id} needs a correct order.`)
    assert(typeof exercise.incorrectMessage === 'string', `${exercise.id} needs incorrect-order guidance.`)
    assert(typeof exercise.output === 'string', `${exercise.id} needs expected output.`)
    assertAbsent(exercise, ['displayCode', 'starterCode', 'focus', 'codeGuide', 'choices', 'correctChoice', 'checks'])
    return [
      ...common,
      exercise.orderItems.map((item) => [item.id, item.code]),
      exercise.correctOrder,
      exercise.incorrectMessage,
      exercise.output,
    ]
  }

  assert(exercise.type === 'bugfix' || exercise.type === 'code', `${exercise.id} has an unsupported type.`)
  assert(typeof exercise.starterCode === 'string', `${exercise.id} needs starter code.`)
  assert(typeof exercise.focus === 'string', `${exercise.id} needs a focus boundary.`)
  assert(typeof exercise.output === 'string', `${exercise.id} needs expected output.`)
  assertAbsent(exercise, ['displayCode', 'choices', 'correctChoice', 'orderItems', 'correctOrder', 'incorrectMessage'])
  return [
    ...common,
    exercise.starterCode,
    exercise.focus,
    packGuide(exercise),
    packChecks(exercise),
    exercise.output,
  ]
}

function normalizedCourse(modules) {
  assert(modules.length === 6, `expected six modules, received ${modules.length}.`)

  const moduleRows = modules.map((module, moduleIndex) => {
    assert(module.language === 'cpp', `${module.id} changed language.`)
    assert(module.chapter === moduleIndex + 1, `${module.id} changed chapter order.`)
    assert(module.status === (moduleIndex === 0 ? 'available' : 'locked'), `${module.id} changed draft status.`)
    assert(module.duration === expectedDurations[moduleIndex], `${module.id} changed duration.`)
    assert(module.icon === expectedIcons[moduleIndex], `${module.id} changed icon.`)
    assert(module.exercises.length === 5, `${module.id} must keep five exercises.`)
    return [module.id, module.title, module.subtitle, module.description]
  })
  const exercises = modules.flatMap((module) => module.exercises)
  assert(exercises.length === expectedExerciseTypes.length, `expected thirty exercises, received ${exercises.length}.`)

  return [
    moduleRows,
    modules.map((module, moduleIndex) => module.exercises.map((exercise, exerciseIndex) => (
      packExercise(exercise, moduleIndex * 5 + exerciseIndex)
    ))),
  ]
}

function stringsIn(value, result = []) {
  if (typeof value === 'string') result.push(value)
  else if (Array.isArray(value)) value.forEach((entry) => stringsIn(entry, result))
  return result
}

function wordDictionary(strings, limit) {
  const counts = new Map()
  for (const value of strings) {
    for (const word of value.match(wordPattern) ?? []) {
      counts.set(word, (counts.get(word) ?? 0) + 1)
    }
  }
  const firstOccurrence = new Map(
    [...counts.keys()].map((word, index) => [word, index]),
  )

  return [...counts.entries()]
    .map(([word, count]) => ({
      count,
      score: count * (word.length - 1) - word.length - 3,
      word,
    }))
    .filter(({ count, score, word }) => count > 1 && score > 0 && word.length > 1)
    .sort((left, right) => (
      right.score - left.score
      || right.count - left.count
      || right.word.length - left.word.length
      || (left.word < right.word ? -1 : left.word > right.word ? 1 : 0)
    ))
    .slice(0, limit)
    .map(({ word }) => word)
    .sort((left, right) => firstOccurrence.get(left) - firstOccurrence.get(right))
}

function encodeStrings(value, dictionaryIndex, encodedStrings) {
  if (typeof value === 'string') {
    const encoded = value.replace(wordPattern, (word) => {
      const index = dictionaryIndex.get(word)
      return index === undefined ? word : String.fromCodePoint(0x100 + index)
    })
    assert(!encoded.includes(delimiter), `a teaching string contains the reserved ${delimiter} delimiter.`)
    encodedStrings.push(encoded)
    return stringSlot
  }
  if (Array.isArray(value)) return value.map((entry) => encodeStrings(entry, dictionaryIndex, encodedStrings))
  return value
}

function packedPayload(dictionary, encodedStrings, shape) {
  return `${JSON.stringify({
    version: 1,
    words: dictionary,
    strings: encodedStrings.join(delimiter),
    shape,
  })}\n`
}

export async function renderPackedCoursePayload({ wordCount = defaultWordCount } = {}) {
  assert(Number.isInteger(wordCount) && wordCount > 0 && wordCount <= 200, 'word count must be between 1 and 200.')
  const sourceUrl = `${pathToFileURL(authoredCoursePath).href}?packed=${Date.now()}`
  const authored = await import(sourceUrl)
  const normalized = normalizedCourse(authored.cppCollectionsRecordsDraftModules)
  const sourceStrings = stringsIn(normalized)
  for (const value of sourceStrings) {
    for (const character of value) {
      const codePoint = character.codePointAt(0)
      assert(codePoint < 0x100 || codePoint >= 0x200, 'authored text contains a reserved dictionary token.')
    }
  }
  const dictionary = wordDictionary(sourceStrings, wordCount)
  assert(dictionary.length === wordCount, `only ${dictionary.length} useful dictionary words were found.`)
  const encodedStrings = []
  const dictionaryIndex = new Map(dictionary.map((word, index) => [word, index]))
  const shape = encodeStrings(normalized, dictionaryIndex, encodedStrings)
  return packedPayload(dictionary, encodedStrings, shape)
}

function parsedArguments(argv) {
  let check = false
  let outputPath = defaultOutputPath
  let wordCount = defaultWordCount
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index]
    if (argument === '--check') check = true
    else if (argument === '--output') outputPath = path.resolve(argv[++index] ?? '')
    else if (argument === '--words') wordCount = Number(argv[++index])
    else fail(`unknown generator argument ${argument}.`)
  }
  return { check, outputPath, wordCount }
}

export async function runGenerator(argv = process.argv.slice(2)) {
  const { check, outputPath, wordCount } = parsedArguments(argv)
  const generated = await renderPackedCoursePayload({ wordCount })
  if (check) {
    const current = readFileSync(outputPath, 'utf8')
    assert(current === generated, `${path.relative(projectRoot, outputPath)} is stale. Run npm run generate:cpp-content-candidate.`)
    console.log(`Packed Practical C++ candidate is deterministic (${Buffer.byteLength(current)} source bytes).`)
    return
  }
  writeFileSync(outputPath, generated, 'utf8')
  console.log(`Generated ${path.relative(projectRoot, outputPath)} with ${wordCount} dictionary words.`)
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : ''
if (invokedPath === fileURLToPath(import.meta.url)) await runGenerator()
