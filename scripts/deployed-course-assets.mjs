import { assetNamesReferencedByHtml } from './bundle-release-guards.mjs'
import { uniqueDeployedJavaScriptAssetByPath } from './deployed-javascript-graph.mjs'

const publishedCourseRegistryContracts = [
  ['python-data-tools', 'Practical Python: Data Tools'],
  ['cpp-collections-records', 'Practical C++: Collections and Records'],
]

const practicalPythonAssets = [
  {
    label: 'Practical Python route asset',
    markers: ['Course complete.', 'python-data-tools-course-'],
    pattern: /\/assets\/PythonDataToolsRoute-[A-Za-z0-9_-]+\.js$/u,
  },
  {
    label: 'Practical Python teaching-content asset',
    markers: ['Products: 2'],
    pattern: /\/assets\/python-data-tools-course-[A-Za-z0-9_-]+\.js$/u,
  },
]

export function assertReviewedApplicationEntry({
  asset,
  contentType,
  httpStatus,
  label,
  requiredMarkers = [],
}) {
  if (
    httpStatus !== 200
    || !contentType.includes('javascript')
    || requiredMarkers.some((marker) => !asset.includes(marker))
  ) {
    throw new Error(`${label} application entry is unavailable or does not match the reviewed shell.`)
  }
}

export function assertReviewedInitialCourseRegistry({ assets, html, label }) {
  const initialAssetNames = assetNamesReferencedByHtml(html, 'js')
  if (initialAssetNames.size === 0) {
    throw new Error(`${label} shell does not name any initial JavaScript assets.`)
  }

  const initialAssets = new Map()
  for (const assetName of initialAssetNames) {
    const matches = [...assets].filter(([assetUrl]) => (
      new URL(assetUrl).pathname.endsWith(`/assets/${assetName}`)
    ))
    if (matches.length !== 1) {
      throw new Error(`${label} initial JavaScript asset ${assetName} is missing or ambiguous.`)
    }
    initialAssets.set(matches[0][0], matches[0][1])
  }

  for (const markers of publishedCourseRegistryContracts) {
    if (![...initialAssets.values()].some((asset) => (
      markers.every((marker) => asset.includes(marker))
    ))) {
      throw new Error(
        `${label} initial JavaScript graph is missing the reviewed ${markers[1]} registry.`,
      )
    }
  }

  return new Set(initialAssets.keys())
}

export function assertReviewedPracticalPythonAssets(assets, label, initialAssetUrls) {
  for (const assetContract of practicalPythonAssets) {
    const deployedAsset = uniqueDeployedJavaScriptAssetByPath(
      assets,
      assetContract.pattern,
    )
    if (!deployedAsset) {
      throw new Error(
        `${label} JavaScript graph does not contain one unique ${assetContract.label}.`,
      )
    }

    const [assetUrl, asset] = deployedAsset
    if (initialAssetUrls.has(assetUrl)) {
      throw new Error(`${label} ${assetContract.label} entered the initial JavaScript graph.`)
    }
    if (!assetContract.markers.some((marker) => asset.includes(marker))) {
      throw new Error(
        `${label} ${assetContract.label} is missing or does not match Phase 5A.`,
      )
    }
  }
}
