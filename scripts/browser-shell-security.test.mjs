import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'

import { describe, expect, it } from 'vitest'

const sourceHtml = await readFile(new URL('../index.html', import.meta.url), 'utf8')
const inlineScripts = [...sourceHtml.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/giu)]
  .filter(([, attributes]) => !/\bsrc\s*=/iu.test(attributes))

describe('browser shell security contract', () => {
  it('keeps exactly one small inline theme bootstrap', () => {
    expect(inlineScripts).toHaveLength(1)
    expect(inlineScripts[0]?.[2]).toContain("localStorage.getItem(key)")
    expect(inlineScripts[0]?.[2]).toContain('document.documentElement.dataset.theme = theme')
    expect(inlineScripts[0]?.[2]).not.toContain('fetch(')
    expect(inlineScripts[0]?.[2].length).toBeLessThan(500)
  })

  it('pins the exact inline bootstrap to the CSP-approved SHA-256 hash', () => {
    const body = inlineScripts[0]?.[2] ?? ''
    const hash = createHash('sha256').update(body).digest('base64')

    expect(`sha256-${hash}`).toBe('sha256-1UhOgK3ZAMe2zV4ermcAVblEtWHVcZCamA1+mPo6zKw=')
  })
})
