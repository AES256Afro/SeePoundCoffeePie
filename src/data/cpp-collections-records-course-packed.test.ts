import { readFileSync } from 'node:fs'
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  cppCollectionsRecordsDraftModules as authoredModules,
} from './cpp-collections-records-course-draft'
import {
  decodeCppCollectionsRecordsCourse as decodePackedCourse,
  loadCppCollectionsRecordsCourse as loadPackedCourse,
} from './cpp-collections-records-course-packed'
import { cppCollectionsRecordsManifest } from './cpp-collections-records-manifest'

const decodeCppCollectionsRecordsCourse = (value: unknown) => (
  decodePackedCourse(value, cppCollectionsRecordsManifest)
)
const loadCppCollectionsRecordsCourse = () => (
  loadPackedCourse(cppCollectionsRecordsManifest)
)

const generatedPayload = JSON.parse(readFileSync(
  new URL('./cpp-collections-records-course-packed.generated.json', import.meta.url),
  'utf8',
)) as unknown

interface MutablePackedPayload {
  version: number
  words: string[]
  strings: string
  shape: unknown
  unexpected?: boolean
}

function payloadCopy(): MutablePackedPayload {
  return structuredClone(generatedPayload) as MutablePackedPayload
}

function stringSlotShape(payload: MutablePackedPayload): unknown {
  let stringIndex = 0
  const visit = (value: unknown): unknown => {
    if (value === 0) {
      const index = stringIndex
      stringIndex += 1
      return index
    }
    if (value === 1) return 1
    if (!Array.isArray(value)) throw new Error('Test payload shape is invalid.')
    return value.map(visit)
  }
  return visit(payload.shape)
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('Practical C++ packed course data', () => {
  it('reconstructs every authored module and exercise without changing the teaching data', () => {
    expect(decodeCppCollectionsRecordsCourse(generatedPayload)).toEqual(authoredModules)
  })

  it('fails closed for malformed or unsupported data', () => {
    expect(() => decodeCppCollectionsRecordsCourse(null)).toThrow('unreadable')
    expect(() => decodeCppCollectionsRecordsCourse({
      version: 2,
      words: [],
      strings: '',
      shape: [],
    })).toThrow('unsupported shape')
  })

  it('requires the exact payload schema and bounded packed shape', () => {
    const extraKey = payloadCopy()
    extraKey.unexpected = true
    expect(() => decodeCppCollectionsRecordsCourse(extraKey)).toThrow('unsupported shape')

    const tooDeep = payloadCopy()
    let shape: unknown = 0
    for (let depth = 0; depth < 9; depth += 1) shape = [shape]
    tooDeep.shape = shape
    expect(() => decodeCppCollectionsRecordsCourse(tooDeep)).toThrow('unsupported shape')

    const tooManyNodes = payloadCopy()
    tooManyNodes.shape = Array.from({ length: 5_001 }, () => 1)
    expect(() => decodeCppCollectionsRecordsCourse(tooManyNodes)).toThrow('unsupported shape')

    const unsupportedScalar = payloadCopy()
    unsupportedScalar.shape = [2]
    expect(() => decodeCppCollectionsRecordsCourse(unsupportedScalar)).toThrow('unsupported shape')

    const wrongExerciseWidth = payloadCopy()
    const root = wrongExerciseWidth.shape as unknown[]
    const exerciseModules = root[1] as unknown[]
    const firstModule = exerciseModules[0] as unknown[]
    const firstExercise = firstModule[0] as unknown[]
    firstExercise.push(1)
    expect(() => decodeCppCollectionsRecordsCourse(wrongExerciseWidth)).toThrow('invalid exercise record')
  })

  it('rejects dictionary expansion beyond the decoded text budget', () => {
    const expansionBomb = payloadCopy()
    expansionBomb.words[0] = 'x'.repeat(32)
    expansionBomb.strings = `${'Ā'.repeat(2_000)}~${Array.from({ length: 706 }, () => 'x').join('~')}`
    expect(() => decodeCppCollectionsRecordsCourse(expansionBomb)).toThrow('decoded text limit')
  })

  it('rejects unknown dictionary tokens and an incorrect string-slot count', () => {
    const unknownToken = payloadCopy()
    const firstDelimiter = unknownToken.strings.indexOf('~')
    unknownToken.strings = `${String.fromCharCode(0x100 + unknownToken.words.length)}${unknownToken.strings.slice(firstDelimiter)}`
    expect(() => decodeCppCollectionsRecordsCourse(unknownToken)).toThrow('unknown word token')

    const missingSlot = payloadCopy()
    missingSlot.strings = missingSlot.strings.slice(0, missingSlot.strings.lastIndexOf('~'))
    expect(() => decodeCppCollectionsRecordsCourse(missingSlot)).toThrow('unexpected string count')
  })

  it('rejects invalid checks and ordering lists that are not exact permutations', () => {
    const invalidCheck = payloadCopy()
    const checkShape = stringSlotShape(invalidCheck) as unknown[]
    const checkExerciseModules = checkShape[1] as unknown[]
    const firstExercises = checkExerciseModules[0] as unknown[]
    const firstBugfix = firstExercises[3] as unknown[]
    const firstCheck = (firstBugfix[12] as unknown[])[0] as unknown[]
    const invalidCheckSlots = invalidCheck.strings.split('~')
    invalidCheckSlots[firstCheck[0] as number] = '['
    invalidCheck.strings = invalidCheckSlots.join('~')
    expect(() => decodeCppCollectionsRecordsCourse(invalidCheck)).toThrow('invalid code check')

    const invalidOrder = payloadCopy()
    const orderShape = stringSlotShape(invalidOrder) as unknown[]
    const orderExerciseModules = orderShape[1] as unknown[]
    const fifthModuleExercises = orderExerciseModules[4] as unknown[]
    const orderingExercise = fifthModuleExercises[2] as unknown[]
    const correctOrder = orderingExercise[10] as number[]
    const invalidOrderSlots = invalidOrder.strings.split('~')
    invalidOrderSlots[correctOrder[0]] = invalidOrderSlots[correctOrder[1]]
    invalidOrder.strings = invalidOrderSlots.join('~')
    expect(() => decodeCppCollectionsRecordsCourse(invalidOrder)).toThrow('invalid ordering exercise')
  })

  it('binds decoded module and lesson identifiers to the durable manifest', () => {
    const changedModule = payloadCopy()
    const firstDelimiter = changedModule.strings.indexOf('~')
    changedModule.strings = `changed-module${changedModule.strings.slice(firstDelimiter)}`
    expect(() => decodeCppCollectionsRecordsCourse(changedModule)).toThrow('incomplete module')

    const changedLesson = payloadCopy()
    const shape = stringSlotShape(changedLesson) as unknown[]
    const exerciseModules = shape[1] as unknown[]
    const firstModule = exerciseModules[0] as unknown[]
    const firstExercise = firstModule[0] as number[]
    const changedLessonSlots = changedLesson.strings.split('~')
    changedLessonSlots[firstExercise[0]] = 'changed-lesson'
    changedLesson.strings = changedLessonSlots.join('~')
    expect(() => decodeCppCollectionsRecordsCourse(changedLesson)).toThrow('durable lesson manifest')
  })

  it('loads only a successful JSON response within the fixed byte limit', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json(generatedPayload)))
    await expect(loadCppCollectionsRecordsCourse()).resolves.toEqual(authoredModules)
    expect(fetch).toHaveBeenCalledWith(expect.any(String), {
      credentials: 'omit',
      redirect: 'error',
    })
  })

  it.each([
    [
      'a non-JSON response',
      new Response('{}', { headers: { 'Content-Type': 'text/plain' } }),
      'unexpected content type',
    ],
    [
      'an oversized declared length',
      new Response('{}', {
        headers: {
          'Content-Length': '54001',
          'Content-Type': 'application/json',
        },
      }),
      'size limit',
    ],
    [
      'an invalid declared length',
      new Response('{}', {
        headers: {
          'Content-Length': 'not-a-number',
          'Content-Type': 'application/json',
        },
      }),
      'invalid content length',
    ],
    [
      'an oversized response body',
      new Response('x'.repeat(54_001), { headers: { 'Content-Type': 'application/json' } }),
      'size limit',
    ],
    [
      'invalid JSON',
      new Response('{', { headers: { 'Content-Type': 'application/json' } }),
      'unreadable',
    ],
    [
      'an unsuccessful response',
      new Response('{}', { status: 404, headers: { 'Content-Type': 'application/json' } }),
      'could not be loaded',
    ],
    [
      'a missing content type',
      new Response('{}'),
      'unexpected content type',
    ],
  ])('fails closed for %s', async (_label, response, message) => {
    vi.stubGlobal('fetch', vi.fn(async () => response))
    await expect(loadCppCollectionsRecordsCourse()).rejects.toThrow(message)
  })

  it('accepts a case-variant JSON media type with a parameter', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(generatedPayload), {
      headers: { 'Content-Type': 'Application/JSON; Charset=UTF-8' },
    })))
    await expect(loadCppCollectionsRecordsCourse()).resolves.toEqual(authoredModules)
  })

  it('rejects invalid UTF-8 before parsing JSON', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(new Uint8Array([0xff]), {
      headers: { 'Content-Type': 'application/json' },
    })))
    await expect(loadCppCollectionsRecordsCourse()).rejects.toThrow('unreadable')
  })

  it('cancels a streaming response as soon as it crosses the raw byte limit', async () => {
    const cancel = vi.fn()
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new Uint8Array(54_001))
      },
      cancel,
    })
    vi.stubGlobal('fetch', vi.fn(async () => new Response(stream, {
      headers: { 'Content-Type': 'application/json' },
    })))

    await expect(loadCppCollectionsRecordsCourse()).rejects.toThrow('size limit')
    expect(cancel).toHaveBeenCalledOnce()
  })
})
