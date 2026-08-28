import packedCourseUrl from './cpp-collections-records-course-packed.generated.json?url'
import type { CppCollectionsRecordsManifest } from './cpp-collections-records-manifest'
import type { Exercise, Mission } from '../types'

const MAX_PACKED_COURSE_BYTES = 54_000
const EXPECTED_DICTIONARY_WORDS = 122
const EXPECTED_STRING_SLOTS = 707
const MAX_DICTIONARY_WORD_CHARACTERS = 32
const MAX_DICTIONARY_CHARACTERS = 2_048
const MAX_PACKED_STRING_CHARACTERS = 40_000
const MAX_DECODED_STRING_CHARACTERS = 60_000
const MAX_DECODED_STRING_SLOT_CHARACTERS = 2_048
const MAX_PACKED_DEPTH = 8
const MAX_PACKED_NODES = 5_000
const MAX_PACKED_LIST_ITEMS = 12

function invalidCourseData(reason: string): never {
  throw new Error(reason)
}

interface PackedCoursePayload {
  version: 1
  words: string[]
  strings: string
  shape: unknown
}

function parsePayload(value: unknown): PackedCoursePayload {
  if (!value || typeof value !== 'object') {
    invalidCourseData('unreadable')
  }
  const payload = value as Partial<PackedCoursePayload>
  const keys = Object.keys(value)
  if (
    keys.length !== 4
    || payload.version !== 1
    || !Array.isArray(payload.words)
    || payload.words.length !== EXPECTED_DICTIONARY_WORDS
    || payload.words.some((word) => (
      typeof word !== 'string'
      || !word.length
      || word.length > MAX_DICTIONARY_WORD_CHARACTERS
    ))
    || new Set(payload.words).size !== payload.words.length
    || payload.words.join('').length > MAX_DICTIONARY_CHARACTERS
    || typeof payload.strings !== 'string'
    || payload.strings.length > MAX_PACKED_STRING_CHARACTERS
  ) {
    invalidCourseData('unsupported shape')
  }
  return payload as PackedCoursePayload
}

function stringRow(value: unknown): string[] {
  if (!Array.isArray(value) || value.some((entry) => typeof entry !== 'string')) {
    invalidCourseData('invalid')
  }
  return value
}

function requiredString(value: unknown): string {
  if (typeof value !== 'string' || !value.length) {
    invalidCourseData('invalid')
  }
  return value
}

function pairs(value: unknown): string[][] {
  if (!Array.isArray(value) || value.length > MAX_PACKED_LIST_ITEMS) {
    invalidCourseData('invalid')
  }
  const rows = value.map(stringRow)
  if (rows.some((row) => row.length !== 2 || !row[0] || !row[1])) {
    invalidCourseData('invalid')
  }
  return rows
}

function exerciseFromRow(row: unknown, index: number, moduleIndex: number): Exercise {
  if (!Array.isArray(row)) invalidCourseData('invalid')
  const type = index === 2 && moduleIndex > 3
    ? 'ordering'
    : (['prediction', 'choice', 'prediction', 'bugfix', 'code'] as const)[index]
  const expectedLength = index < 2 ? 12 - index : index === 2 ? (moduleIndex < 4 ? 12 : 13) : 14
  if (row.length !== expectedLength) {
    invalidCourseData('invalid exercise record')
  }
  const [id, conceptId, eyebrow, title, explanation, analogy, prompt, hint, recap] = row
  const result: Exercise = {
    id: requiredString(id),
    conceptId: requiredString(conceptId),
    eyebrow: requiredString(eyebrow),
    title: requiredString(title),
    explanation: requiredString(explanation),
    analogy: requiredString(analogy),
    type,
    prompt: requiredString(prompt),
    hint: requiredString(hint),
    recap: requiredString(recap),
    xp: [8, 10, 14, 16, 22][index],
  }

  if (type === 'prediction' || type === 'choice') {
    if (row[9] !== 1) result.displayCode = requiredString(row[9])
    const choices = pairs(row[10])
    if (choices.length !== 3) {
      invalidCourseData('invalid')
    }
    result.choices = choices.map(
      ([label, detail], choiceIndex) => ({
        id: 'abc'[choiceIndex],
        label,
        detail,
      }),
    )
    result.correctChoice = 'a'
    if (row.length === 12) result.output = requiredString(row[11])
  } else if (type === 'ordering') {
    const orderItems = pairs(row[9])
    const correctOrder = stringRow(row[10])
    const itemIds = orderItems.map(([itemId]) => itemId)
    if (
      !orderItems.length
      || new Set(itemIds).size !== itemIds.length
      || correctOrder.length !== orderItems.length
      || new Set(correctOrder).size !== correctOrder.length
      || correctOrder.some((itemId) => !itemIds.includes(itemId))
    ) {
      invalidCourseData('invalid ordering exercise')
    }
    result.orderItems = orderItems.map(([itemId, code]) => ({
      id: itemId,
      code,
    }))
    result.correctOrder = correctOrder
    result.incorrectMessage = requiredString(row[11])
    result.output = requiredString(row[12])
  } else {
    result.starterCode = requiredString(row[9])
    result.focus = requiredString(row[10])
    const codeGuide = pairs(row[11])
    const checks = pairs(row[12])
    if (!codeGuide.length || !checks.length) {
      invalidCourseData('invalid')
    }
    result.codeGuide = codeGuide.map(([code, plain]) => ({
      code,
      plain,
    }))
    result.checks = checks.map(([pattern, message]) => {
      try {
        RegExp(pattern)
      } catch {
        invalidCourseData('invalid code check')
      }
      return { pattern, message }
    })
    result.output = requiredString(row[13])
  }
  return result
}

export function decodeCppCollectionsRecordsCourse(
  value: unknown,
  cppCollectionsRecordsManifest: CppCollectionsRecordsManifest,
): readonly Mission[] {
  const payload = parsePayload(value)
  const strings = payload.strings.split('~')
  let totalLength = 0
  for (let index = 0; index < strings.length; index += 1) {
    const encoded = strings[index]
    if (!encoded) {
      invalidCourseData('invalid')
    }
    let decoded = ''
    for (const character of encoded) {
      const code = character.charCodeAt(0)
      const part = code >> 8 === 1
        ? payload.words[code - 0x100]
        : character
      if (part === undefined) {
        invalidCourseData('unknown word token')
      }
      decoded += part
      totalLength += part.length
      if (
        decoded.length > MAX_DECODED_STRING_SLOT_CHARACTERS
        || totalLength > MAX_DECODED_STRING_CHARACTERS
      ) {
        invalidCourseData('decoded text limit exceeded')
      }
    }
    strings[index] = decoded
  }
  if (strings.length !== EXPECTED_STRING_SLOTS) {
    invalidCourseData('unexpected string count')
  }
  let stringIndex = 0
  let packedNodes = 0
  const unpack = (packed: unknown, depth: number): unknown => {
    if (++packedNodes > MAX_PACKED_NODES || depth > MAX_PACKED_DEPTH) {
      invalidCourseData('unsupported shape')
    }
    if (packed === 0) {
      const value = strings[stringIndex]
      if (value === undefined) invalidCourseData('invalid')
      stringIndex += 1
      return value
    }
    if (packed === 1) return 1
    if (!Array.isArray(packed)) invalidCourseData('unsupported shape')
    return packed.map((child) => unpack(child, depth + 1))
  }
  const data = unpack(payload.shape, 0)
  if (stringIndex !== strings.length || !Array.isArray(data) || data.length !== 2) {
    invalidCourseData('invalid')
  }
  const [moduleData, exerciseData] = data
  if (
    !Array.isArray(moduleData)
    || !Array.isArray(exerciseData)
    || moduleData.length !== 6
    || exerciseData.length !== 6
  ) {
    invalidCourseData('invalid')
  }

  const missionIds = Object.keys(cppCollectionsRecordsManifest)
  if (missionIds.length !== moduleData.length) {
    invalidCourseData('invalid')
  }

  return moduleData.map((moduleRow, index) => {
    const moduleValues = stringRow(moduleRow)
    if (moduleValues.length !== 4) {
      invalidCourseData('invalid')
    }
    const [id, title, subtitle, description] = moduleValues
    const exercises = exerciseData[index]
    const expectedLessons = cppCollectionsRecordsManifest[
      missionIds[index] as keyof typeof cppCollectionsRecordsManifest
    ]
    if (
      !id
      || id !== missionIds[index]
      || !title
      || !subtitle
      || !description
      || !Array.isArray(exercises)
      || exercises.length !== 5
      || !expectedLessons
      || expectedLessons.length !== exercises.length
    ) {
      invalidCourseData('incomplete module')
    }
    const decodedExercises = exercises.map((exercise, exerciseIndex) => {
      const decoded = exerciseFromRow(exercise, exerciseIndex, index)
      const expected = expectedLessons[exerciseIndex]
      if (
        !expected
        || decoded.id !== expected.id
        || decoded.conceptId !== expected.conceptId
        || decoded.xp !== expected.xp
      ) {
        invalidCourseData('durable lesson manifest mismatch')
      }
      return decoded
    })
    return {
      id,
      language: 'cpp',
      chapter: index + 1,
      title,
      subtitle,
      description,
      duration: index < 3 ? '8 min' : index < 5 ? '9 min' : '11 min',
      icon: index % 3 === 0 ? 'terminal' : index === 5 ? 'crown' : 'package',
      status: index ? 'locked' : 'available',
      exercises: decodedExercises,
    }
  })
}

export async function loadCppCollectionsRecordsCourse(
  cppCollectionsRecordsManifest: CppCollectionsRecordsManifest,
): Promise<readonly Mission[]> {
  if (packedCourseUrl[0] !== '/' || !packedCourseUrl[1] || packedCourseUrl[1] === '/') {
    invalidCourseData('invalid')
  }
  const response = await fetch(packedCourseUrl, {
    credentials: 'omit',
    redirect: 'error',
  })
  if (!response.ok) invalidCourseData('could not be loaded')
  if (!/^\s*application\/json\s*(;|$)/i.test(response.headers.get('Content-Type') ?? '')) {
    invalidCourseData('unexpected content type')
  }
  const contentLength = response.headers.get('Content-Length')
  if (contentLength != null) {
    const declaredLength = +contentLength
    if (!Number.isSafeInteger(declaredLength) || declaredLength < 0) {
      invalidCourseData('invalid content length')
    }
    if (declaredLength > MAX_PACKED_COURSE_BYTES) {
      invalidCourseData('size limit exceeded')
    }
  }
  if (!response.body) invalidCourseData('invalid')
  const reader = response.body.getReader()
  const buffer = new Uint8Array(MAX_PACKED_COURSE_BYTES)
  let total = 0
  try {
    while (true) {
      const { done, value: chunk } = await reader.read()
      if (done) break
      const nextTotal = total + chunk.byteLength
      if (nextTotal > MAX_PACKED_COURSE_BYTES) {
        await reader.cancel()
        invalidCourseData('size limit exceeded')
      }
      buffer.set(chunk, total)
      total = nextTotal
    }
  } finally {
    reader.releaseLock()
  }
  let value: unknown
  try {
    value = JSON.parse(
      new TextDecoder(undefined, { fatal: true }).decode(buffer.subarray(0, total)),
    ) as unknown
  } catch {
    invalidCourseData('unreadable')
  }
  return decodeCppCollectionsRecordsCourse(value, cppCollectionsRecordsManifest)
}
