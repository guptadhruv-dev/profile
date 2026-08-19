import { render, screen, waitFor } from '@testing-library/react'
import { readFile } from 'node:fs/promises'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import Section from '../src/components/content-section'
import { shortcodeComponents } from '../src/components/shortcodes'

const galleryMarkdown =
  '::gallery{images=\'["exp1.png","exp2.png"]\' width="600" aspect="16/9" align="center"}'

const originalIntersectionObserver = globalThis.IntersectionObserver
const originalResizeObserver = globalThis.ResizeObserver

beforeAll(() => {
  globalThis.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return []
    }
  }
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent: () => false,
  })
})

afterAll(() => {
  globalThis.IntersectionObserver = originalIntersectionObserver
  globalThis.ResizeObserver = originalResizeObserver
  delete window.matchMedia
})

describe('gallery code split', () => {
  it('gives the loading fallback the same height reservation as the carousel', async () => {
    const stylesheet = await readFile('src/index.css', 'utf8')
    const viewportRule = /\.sc-gallery-viewport\s*\{([^}]*)\}/.exec(stylesheet)[1]
    const slideImageRule = /\.sc-gallery-slide img\s*\{([^}]*)\}/.exec(stylesheet)[1]
    const pendingRule = /\.sc-gallery-pending\s*\{([^}]*)\}/.exec(stylesheet)?.[1]

    expect(pendingRule).toBeTruthy()
    for (const declaration of [
      'aspect-ratio: var(--gallery-aspect',
      'height: var(--gallery-height',
    ]) {
      expect(viewportRule).toContain(declaration)
      expect(pendingRule).toContain(declaration)
    }
    expect(slideImageRule).toContain('min-height: var(--gallery-min-height')
    expect(pendingRule).toContain('min-height: var(--gallery-min-height')
  })

  it('keeps the shortcode registry key set stable', () => {
    expect(Object.keys(shortcodeComponents)).toContain('shortcode-gallery')
  })

  it('reserves the gallery box before the carousel chunk arrives, then renders slides', async () => {
    const { container } = render(<Section content={galleryMarkdown} />)

    const reservedBox = container.querySelector('.sc-gallery')
    const reservingChild = container.querySelector('.sc-gallery-pending')
    expect(reservedBox).not.toBeNull()
    expect(reservedBox.getAttribute('style')).toContain('--gallery-aspect')
    expect(reservingChild).not.toBeNull()
    expect(reservedBox.contains(reservingChild)).toBe(true)
    expect(container.querySelectorAll('.sc-gallery-slide')).toHaveLength(0)

    await waitFor(() => expect(container.querySelectorAll('.sc-gallery-slide')).toHaveLength(2), {
      timeout: 5000,
    })
    expect(container.innerHTML).toContain('sc-gallery-viewport')
    expect(screen.getByLabelText('Next image')).toBeInTheDocument()
    for (const slideImage of container.querySelectorAll('.sc-gallery-slide img')) {
      expect(slideImage).toHaveAttribute('loading', 'lazy')
    }
  })
})
