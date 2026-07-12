import { describe, expect, it } from 'vitest'
import { createContentSection, parseContentManifest, parseFrontmatter } from '../src/lib/content'

describe('content manifest validation', () => {
  it('accepts unique kebab-case markdown filenames', () => {
    expect(parseContentManifest('["overview.md","work-history.md"]')).toEqual([
      'overview.md',
      'work-history.md',
    ])
  })

  it.each([
    'not-json',
    '{}',
    '["../secret.md"]',
    '["Overview.md"]',
    '["overview.md","overview.md"]',
  ])('rejects unsafe manifest input', (manifest) => {
    expect(() => parseContentManifest(manifest)).toThrow()
  })
})

describe('frontmatter parsing', () => {
  it('casts supported metadata and preserves content', () => {
    const parsedContent = parseFrontmatter(
      '---\nlabel: "Overview"\nrank: 2.5\nvisible: true\n---\n# Hello',
    )
    expect(parsedContent).toEqual({
      metadata: { label: 'Overview', rank: 2.5, visible: true },
      content: '# Hello',
    })
  })

  it('creates a safe section fallback', () => {
    expect(createContentSection('work-history.md', '# Work', 4)).toMatchObject({
      id: 'work-history',
      label: 'work-history',
      rank: 4,
      content: '# Work',
    })
  })
})
