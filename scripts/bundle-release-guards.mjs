import { readdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const REQUIRED_INITIAL_HEADROOM = 0.15

export async function assertNoEmittedSourceMaps(root) {
  const rootPath = root instanceof URL ? fileURLToPath(root) : root
  const sourceMapPaths = []

  async function inspectDirectory(directoryPath) {
    const entries = await readdir(directoryPath, { withFileTypes: true })

    await Promise.all(entries.map(async (entry) => {
      const entryPath = path.join(directoryPath, entry.name)
      if (entry.isDirectory()) {
        await inspectDirectory(entryPath)
      } else if (entry.name.toLowerCase().endsWith('.map')) {
        sourceMapPaths.push(path.relative(rootPath, entryPath))
      }
    }))
  }

  await inspectDirectory(rootPath)

  if (sourceMapPaths.length > 0) {
    throw new Error(
      `The production browser bundle emitted source maps: ${sourceMapPaths.sort().join(', ')}.`,
    )
  }
}

export function assetNamesReferencedByHtml(html, extension) {
  const references = new Set(
    [...html.matchAll(/(?:src|href)="[^"]*\/([^/"?]+\.(?:js|css))(?:\?[^" ]*)?"/giu)]
      .map((match) => match[1]),
  )
  return new Set([...references].filter((name) => name.endsWith(`.${extension}`)))
}

export function headroomFraction(size, limit) {
  return (limit - size) / limit
}

export function assetNamesContainingAllMarkers(fileContents, markers, extension) {
  return [...fileContents.entries()]
    .filter(([name, contents]) => (
      name.endsWith(`.${extension}`)
      && markers.every((marker) => contents.includes(marker))
    ))
    .map(([name]) => name)
}

export function assetHasExpectedPlacement(assetName, initialAssetNames, placement) {
  const isInitial = initialAssetNames.has(assetName)
  return placement === 'initial' ? isInitial : !isInitial
}
