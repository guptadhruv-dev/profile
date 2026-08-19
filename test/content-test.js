import { describe, expect, it } from 'vitest'
import {
  createContentSection,
  createSectionShell,
  hasStableOrdering,
  parseContentManifest,
  parseFrontmatter,
} from '../src/lib/content'

describe('content manifest validation', () => {
  it('accepts unique kebab-case markdown filenames', () => {
    expect(parseContentManifest('["overview.md","work-history.md"]')).toEqual([
      { filename: 'overview.md', rank: null, label: null, icon: null },
      { filename: 'work-history.md', rank: null, label: null, icon: null },
    ])
  })

  it('accepts descriptors alongside legacy filenames', () => {
    const descriptors = parseContentManifest(
      '[{"file":"overview.md","rank":1,"label":"Overview","icon":"home"},"work-history.md"]',
    )

    expect(descriptors).toEqual([
      { filename: 'overview.md', rank: 1, label: 'Overview', icon: 'home' },
      { filename: 'work-history.md', rank: null, label: null, icon: null },
    ])
    expect(hasStableOrdering(descriptors)).toBe(false)
    expect(hasStableOrdering(descriptors.slice(0, 1))).toBe(true)
  })

  it.each([
    '[{"file":"overview.md","rank":"first"}]',
    '[{"file":"overview.md","label":"  "}]',
    '[{"file":"overview.md","icon":"Home Icon"}]',
    '[{"file":"../secret.md","rank":1}]',
    '[{"rank":1}]',
    '[["overview.md"]]',
    '[null]',
  ])('rejects malformed descriptors', (manifest) => {
    expect(() => parseContentManifest(manifest)).toThrow()
  })

  it('builds a navigable shell before the body arrives', () => {
    const [descriptor] = parseContentManifest(
      '[{"file":"work-history.md","rank":2,"label":"Work","icon":"work"}]',
    )

    expect(createSectionShell(descriptor, 0)).toEqual({
      id: 'work-history',
      label: 'Work',
      rank: 2,
      vars: { icon: 'work' },
      content: null,
    })
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
    const legacyDescriptor = { filename: 'work-history.md', rank: null, label: null, icon: null }

    expect(createContentSection(legacyDescriptor, '# Work', 4)).toMatchObject({
      id: 'work-history',
      label: 'work-history',
      rank: 4,
      content: '# Work',
    })
  })

  it('lets descriptor metadata win over frontmatter so shells never change', () => {
    const descriptor = { filename: 'work-history.md', rank: 2, label: 'Work', icon: 'work' }
    const body = '---\nrank: 9\nlabel: Late Label\nicon: badge\n---\n# Work'

    expect(createContentSection(descriptor, body, 4)).toMatchObject({
      label: 'Work',
      rank: 2,
      vars: { icon: 'work', rank: 9 },
    })
  })
})
