import path from 'node:path'

export const practicalCppCandidateJsonPattern = (
  /^assets\/cpp-collections-records-course-packed\.generated-[A-Za-z0-9_-]{6,}\.json$/u
)

function contentsAsBuffer(contents) {
  return Buffer.isBuffer(contents) ? contents : Buffer.from(contents)
}

export function inspectPracticalCppCandidateAssets({
  assets,
  authoredTeachingData,
  initialAssetNames,
  privateMarkers,
}) {
  const candidateTeachingAssets = [...assets].filter(([name]) => (
    practicalCppCandidateJsonPattern.test(name)
  ))
  if (candidateTeachingAssets.length !== 1) {
    throw new Error(
      'The complete Practical C++ candidate app must emit exactly one content-hashed teaching-data JSON asset.',
    )
  }

  const [candidateTeachingAssetName, candidateTeachingAssetContents] = candidateTeachingAssets[0]
  if (!contentsAsBuffer(candidateTeachingAssetContents).equals(contentsAsBuffer(authoredTeachingData))) {
    throw new Error(
      'The complete Practical C++ candidate app emitted teaching data that differs from the reviewed generated source.',
    )
  }

  const candidateTeachingAssetBaseName = path.basename(candidateTeachingAssetName)
  const owningJavaScriptAssets = [...assets].filter(([name, contents]) => (
    name.endsWith('.js')
    && contentsAsBuffer(contents).includes(candidateTeachingAssetBaseName)
  ))
  if (owningJavaScriptAssets.length !== 1) {
    throw new Error(
      'Exactly one JavaScript loader asset must own the Practical C++ teaching-data URL.',
    )
  }
  const [owningJavaScriptAssetName] = owningJavaScriptAssets[0]
  if (
    initialAssetNames.has(candidateTeachingAssetName)
    || initialAssetNames.has(candidateTeachingAssetBaseName)
    || initialAssetNames.has(owningJavaScriptAssetName)
    || initialAssetNames.has(path.basename(owningJavaScriptAssetName))
  ) {
    throw new Error('The Practical C++ teaching data must remain behind one lazy JavaScript loader.')
  }

  const privateMarkerLeaks = []
  for (const [name, contents] of assets) {
    if (!/\.(?:css|html|js|json)$/u.test(name)) continue
    const text = contentsAsBuffer(contents).toString('utf8')
    for (const marker of privateMarkers) {
      if (marker && text.includes(marker)) privateMarkerLeaks.push({ marker, name })
    }
  }
  if (privateMarkerLeaks.length > 0) {
    const firstLeak = privateMarkerLeaks[0]
    throw new Error(
      `Private Practical C++ server marker ${firstLeak.marker} appeared in ${firstLeak.name}.`,
    )
  }

  return Object.freeze({
    candidateTeachingAssetName,
    owningJavaScriptAssetName,
  })
}
