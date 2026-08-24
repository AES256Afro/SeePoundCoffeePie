import { readFile } from 'node:fs/promises'

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8')
const image = await readFile(new URL('../public/social-card-v4.jpg', import.meta.url))

const requiredMetadata = [
  '<meta property="og:site_name" content="SeePoundCoffeePie" />',
  '<meta property="og:image" content="https://seepoundcoffeepie.com/social-card-v4.jpg" />',
  '<meta property="og:image:type" content="image/jpeg" />',
  '<meta property="og:image:width" content="1200" />',
  '<meta property="og:image:height" content="630" />',
  '<meta name="twitter:card" content="summary_large_image" />',
  '<meta name="twitter:image" content="https://seepoundcoffeepie.com/social-card-v4.jpg" />',
]

for (const metadata of requiredMetadata) {
  if (!html.includes(metadata)) {
    throw new Error(`Missing social preview metadata: ${metadata}`)
  }
}

function readJpegDimensions(bytes) {
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) {
    throw new Error('The social preview asset is not a JPEG image')
  }

  let offset = 2
  while (offset + 8 < bytes.length) {
    if (bytes[offset] !== 0xff) {
      offset += 1
      continue
    }

    const marker = bytes[offset + 1]
    offset += 2

    if (marker === 0xd8 || marker === 0xd9) continue

    const segmentLength = bytes.readUInt16BE(offset)
    const isStartOfFrame = [0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf]
      .includes(marker)

    if (isStartOfFrame) {
      return {
        height: bytes.readUInt16BE(offset + 3),
        width: bytes.readUInt16BE(offset + 5),
      }
    }

    offset += segmentLength
  }

  throw new Error('Could not find JPEG dimensions in the social preview asset')
}

const dimensions = readJpegDimensions(image)
if (dimensions.width !== 1200 || dimensions.height !== 630) {
  throw new Error(`Expected social-card-v4.jpg to be 1200x630, received ${dimensions.width}x${dimensions.height}`)
}

if (image.byteLength < 100_000) {
  throw new Error('The social preview image is unexpectedly small and may be incomplete')
}

console.log('Social preview metadata and 1200x630 image verification passed.')
