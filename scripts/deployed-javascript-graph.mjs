const javaScriptChunkSpecifierPattern = /\b(?:from|import)\s*(?:\(\s*)?(["'`])([^"'`\r\n]+?\.js(?:[?#][^"'`\r\n]*)?)\1/gu

export function deployedJavaScriptChunkUrls(asset, assetUrl, allowedOrigin) {
  const chunkUrls = new Set()

  for (const match of asset.matchAll(javaScriptChunkSpecifierPattern)) {
    const specifier = match[2]
    let chunkUrl
    try {
      chunkUrl = new URL(specifier.startsWith('assets/') ? `/${specifier}` : specifier, assetUrl)
    } catch {
      continue
    }

    if (
      chunkUrl.origin !== allowedOrigin
      || !chunkUrl.pathname.startsWith('/assets/')
      || !chunkUrl.pathname.endsWith('.js')
    ) {
      continue
    }

    chunkUrl.hash = ''
    chunkUrls.add(chunkUrl.href)
  }

  return chunkUrls
}

export async function inspectDeployedJavaScriptChunkGraph({
  allowedOrigin,
  entryAsset,
  entryAssetUrl,
  maxAssets = 250,
  request,
}) {
  const assets = new Map([[entryAssetUrl.href, entryAsset]])
  const pendingUrls = [
    ...deployedJavaScriptChunkUrls(entryAsset, entryAssetUrl, allowedOrigin),
  ]

  while (pendingUrls.length > 0) {
    const assetUrl = new URL(pendingUrls.pop())
    if (assets.has(assetUrl.href)) continue
    if (assets.size >= maxAssets) {
      throw new Error(`The deployed JavaScript chunk graph exceeded the ${maxAssets}-asset inspection limit`)
    }

    const assetResponse = await request(assetUrl, { redirect: 'manual' })
    const asset = await assetResponse.text()
    if (
      assetResponse.status !== 200
      || !(assetResponse.headers.get('content-type') ?? '').includes('javascript')
    ) {
      throw new Error(`The deployed JavaScript chunk graph contains an unavailable asset: ${assetUrl.pathname}`)
    }

    assets.set(assetUrl.href, asset)
    for (const chunkUrl of deployedJavaScriptChunkUrls(asset, assetUrl, allowedOrigin)) {
      if (!assets.has(chunkUrl)) pendingUrls.push(chunkUrl)
    }
  }

  return assets
}
