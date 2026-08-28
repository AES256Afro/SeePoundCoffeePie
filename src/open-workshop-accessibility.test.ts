import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const initialStylesheet = readFileSync(new URL('./open-workshop.css', import.meta.url), 'utf8')
const learningStylesheet = readFileSync(new URL('./learning-workspace.css', import.meta.url), 'utf8')
const stylesheet = `${initialStylesheet}\n${learningStylesheet}`

function declarationsFor(selector: string, source = stylesheet): string {
  const start = source.indexOf(`${selector} {`)
  if (start < 0) throw new Error(`Missing ${selector} rule.`)
  const declarationsStart = source.indexOf('{', start) + 1
  const end = source.indexOf('}', declarationsStart)
  return source.slice(declarationsStart, end)
}

describe('small-screen learning workspace CSS', () => {
  it('keeps the mobile language select visible', () => {
    const mobileStart = initialStylesheet.indexOf('@media (max-width: 700px)')
    const mobileEnd = initialStylesheet.indexOf('@media (max-width: 420px)', mobileStart)
    const mobileRules = initialStylesheet.slice(mobileStart, mobileEnd)

    expect(mobileRules).not.toContain('.track-switcher select,\n  .track-switcher > svg:last-child {\n    display: none;')
    expect(mobileRules).toContain('.track-switcher select {\n    width: 100%;\n    min-width: 0;\n    display: block;')
  })

  it('uses readable editable code and keeps long lines inside the editor', () => {
    const lessonEditor = declarationsFor('.editor-body textarea', learningStylesheet)
    const projectEditor = declarationsFor('.project-code-workspace > textarea', learningStylesheet)
    const mobileStart = learningStylesheet.indexOf('@media (max-width: 700px)')
    const mobileEnd = learningStylesheet.indexOf('@media (max-width: 420px)', mobileStart)
    const mobileRules = learningStylesheet.slice(mobileStart, mobileEnd)

    for (const declarations of [lessonEditor, projectEditor]) {
      expect(declarations).toContain('overflow: auto;')
      expect(declarations).toContain('overscroll-behavior: contain;')
      expect(declarations).toContain('white-space: pre;')
    }
    expect(mobileRules).toContain('.editor-body textarea,\n  .prediction-code pre,\n  .ordering-list code {\n    font-size: 1rem;')
  })
})
