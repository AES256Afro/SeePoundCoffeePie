import path from 'node:path'

export const practicalCppCandidateJsonPattern = (
  /^assets\/cpp-collections-records-course-packed\.generated-[A-Za-z0-9_-]{6,}\.json$/u
)

function contentsAsBuffer(contents) {
  return Buffer.isBuffer(contents) ? contents : Buffer.from(contents)
}

function sourceLiteralPropertyValues(source, property, minimumCount) {
  const expression = new RegExp(`\\b${property}:\\s*'([^'\\\\]*)'`, 'gu')
  const values = [...source.matchAll(expression)].map((match) => match[1])
  if (values.length < minimumCount) {
    throw new Error(
      `The Practical C++ server assessment no longer exposes the reviewed ${property} marker set.`,
    )
  }
  return values
}

export function practicalCppServerOwnedMarkers({ catalogMarkers, serverAssessmentSource }) {
  if (!Array.isArray(catalogMarkers) || catalogMarkers.length !== 4) {
    throw new Error('The Practical C++ private marker catalog is incomplete.')
  }
  if (typeof serverAssessmentSource !== 'string' || serverAssessmentSource.length === 0) {
    throw new Error('The Practical C++ server assessment source is unreadable.')
  }
  return Object.freeze([...new Set([
    ...catalogMarkers,
    ...sourceLiteralPropertyValues(serverAssessmentSource, 'validation', 6),
    ...sourceLiteralPropertyValues(serverAssessmentSource, 'message', 6),
    ...sourceLiteralPropertyValues(serverAssessmentSource, 'id', 1),
    ...sourceLiteralPropertyValues(serverAssessmentSource, 'name', 1),
    ...sourceLiteralPropertyValues(serverAssessmentSource, 'purpose', 1),
    'authored_frame',
    'part_record',
    'supplied_harness',
  ])])
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
