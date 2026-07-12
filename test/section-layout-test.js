import { readFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'

const stylesheet = await readFile('src/index.css', 'utf8')

function readRuleBodies(selectorPattern) {
  return [...stylesheet.matchAll(new RegExp(`${selectorPattern}\\s*\\{([^}]*)\\}`, 'g'))].map(
    (ruleMatch) => ruleMatch[1],
  )
}

describe('section scrolling layout', () => {
  it('snaps at content-sized section boundaries without dead viewport space', () => {
    const scrollContainerRules = readRuleBodies('\\.content-scroll')
    const sectionRule = readRuleBodies('\\.section-pane')[0]
    const sectionBoundaryRule = readRuleBodies('\\.section-pane \\+ \\.section-pane')[0]

    expect(
      scrollContainerRules.some((ruleBody) => ruleBody.includes('scroll-snap-type: y mandatory')),
    ).toBe(true)
    expect(sectionRule).toContain('scroll-snap-align: start')
    expect(sectionRule).toContain('scroll-snap-stop: always')
    expect(sectionRule).not.toContain('min-height')
    expect(sectionBoundaryRule).toContain('border-block-start')
  })
})
