import { readFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'

const stylesheet = await readFile('src/index.css', 'utf8')

function readRuleBodies(selectorPattern) {
  return [...stylesheet.matchAll(new RegExp(`${selectorPattern}\\s*\\{([^}]*)\\}`, 'g'))].map(
    (ruleMatch) => ruleMatch[1],
  )
}

function hasDeclaration(ruleBodies, declaration) {
  return ruleBodies.some((ruleBody) => ruleBody.includes(declaration))
}

describe('section scrolling layout', () => {
  it('scrolls freely without snapping', () => {
    expect(stylesheet).not.toContain('scroll-snap-type')
    expect(stylesheet).not.toContain('scroll-snap-align')
    expect(stylesheet).not.toContain('scroll-snap-stop')
  })

  it('keeps smooth scrolling for navigation and honours reduced motion', () => {
    const scrollContainerRules = readRuleBodies('\\.content-scroll')

    expect(hasDeclaration(scrollContainerRules, 'scroll-behavior: smooth')).toBe(true)
    expect(hasDeclaration(scrollContainerRules, 'scroll-behavior: auto')).toBe(true)
    expect(hasDeclaration(scrollContainerRules, 'height: 100dvh')).toBe(true)
  })

  it('separates sections without trailing a border after the last one', () => {
    const sectionRules = readRuleBodies('(?<![+\\w-])\\.section-pane')
    const sectionBoundaryRules = readRuleBodies('\\.section-pane:not\\(:last-child\\)')

    expect(hasDeclaration(sectionRules, 'min-height')).toBe(false)
    expect(hasDeclaration(sectionRules, 'border-block')).toBe(false)
    expect(hasDeclaration(sectionBoundaryRules, 'border-block-end')).toBe(true)
  })
})
