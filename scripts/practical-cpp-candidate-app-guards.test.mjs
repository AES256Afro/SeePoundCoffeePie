import { describe, expect, it } from 'vitest'

import {
  inspectPracticalCppCandidateAssets,
} from './practical-cpp-candidate-app-guards.mjs'

const candidateName = 'assets/cpp-collections-records-course-packed.generated-Abc_123.json'
const candidateContents = Buffer.from('{"version":1}')

function candidateAssets(overrides = []) {
  return new Map([
    ['index.html', '<script src="/assets/index.js"></script>'],
    ['assets/index.js', 'import("./cpp-loader.js")'],
    ['assets/cpp-loader.js', `const teachingData = "${candidateName.split('/').at(-1)}"`],
    [candidateName, candidateContents],
    ...overrides,
  ])
}

function inspect(assets, initialAssetNames = new Set(['index.js'])) {
  return inspectPracticalCppCandidateAssets({
    assets,
    authoredTeachingData: candidateContents,
    initialAssetNames,
    privateMarkers: ['server-only-profile'],
  })
}

describe('complete Practical C++ candidate app bundle guards', () => {
  it('accepts one exact JSON asset owned by one lazy loader', () => {
    expect(inspect(candidateAssets())).toEqual({
      candidateTeachingAssetName: candidateName,
      owningJavaScriptAssetName: 'assets/cpp-loader.js',
    })
  })

  it('rejects duplicate, changed, initial, or multiply owned candidate data', () => {
    expect(() => inspect(candidateAssets([
      ['assets/cpp-collections-records-course-packed.generated-Second1.json', candidateContents],
    ]))).toThrow(/exactly one content-hashed/iu)

    expect(() => inspect(candidateAssets([
      [candidateName, '{"version":2}'],
    ]))).toThrow(/differs from the reviewed generated source/iu)

    expect(() => inspect(candidateAssets(), new Set(['index.js', 'cpp-loader.js'])))
      .toThrow(/behind one lazy JavaScript loader/iu)

    expect(() => inspect(candidateAssets([
      ['assets/second-loader.js', `fetch("${candidateName.split('/').at(-1)}")`],
    ]))).toThrow(/Exactly one JavaScript loader asset/iu)
  })

  it('rejects a private server marker in any browser asset', () => {
    expect(() => inspect(candidateAssets([
      [
        'assets/cpp-loader.js',
        `const teachingData = "${candidateName.split('/').at(-1)}"; const profile = "server-only-profile"`,
      ],
    ]))).toThrow(/Private Practical C\+\+ server marker/iu)
  })
})
