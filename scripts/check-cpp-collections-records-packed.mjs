import { readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'

const projectRoot = fileURLToPath(new URL('../', import.meta.url))
const candidatePath = path.join(
  projectRoot,
  'src/data/cpp-collections-records-course-packed.generated.json',
)

export const cppCollectionsRecordsPackedBudgets = Object.freeze({
  raw: 54_000,
  gzip: 15_000,
})

export function measureCppCollectionsRecordsPackedCandidate() {
  const output = readFileSync(candidatePath)
  return Object.freeze({
    raw: statSync(candidatePath).size,
    gzip: gzipSync(output).byteLength,
  })
}

export function checkCppCollectionsRecordsPackedCandidate() {
  const sizes = measureCppCollectionsRecordsPackedCandidate()
  console.log(
    `Practical C++ packed data candidate: ${sizes.raw.toLocaleString('en-US')} bytes raw, `
    + `${sizes.gzip.toLocaleString('en-US')} bytes gzip.`,
  )
  if (sizes.raw > cppCollectionsRecordsPackedBudgets.raw) {
    throw new Error(
      `Practical C++ packed candidate exceeds the fixed ${cppCollectionsRecordsPackedBudgets.raw} byte raw limit.`,
    )
  }
  if (sizes.gzip > cppCollectionsRecordsPackedBudgets.gzip) {
    throw new Error(
      `Practical C++ packed candidate exceeds the fixed ${cppCollectionsRecordsPackedBudgets.gzip} byte gzip limit.`,
    )
  }
  return sizes
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : ''
if (invokedPath === fileURLToPath(import.meta.url)) checkCppCollectionsRecordsPackedCandidate()
