import { Suspense } from 'react'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import SectionPane from '../src/components/section-pane'
import LazyImage from '../src/components/lazy-image'
import MarkdownSection from '../src/components/content-section'

const originalIntersectionObserver = globalThis.IntersectionObserver
const mountLeadPixels = 640
const mountRootMargin = '640px 0px 640px 0px'

afterEach(() => {
  globalThis.IntersectionObserver = originalIntersectionObserver
  vi.restoreAllMocks()
})

function stubIntersectionObserver() {
  const observerCallbacks = []
  const observerOptions = []
  globalThis.IntersectionObserver = class {
    constructor(callback, options) {
      observerCallbacks.push(callback)
      observerOptions.push(options)
    }
    observe() {}
    disconnect() {}
  }
  return { observerCallbacks, observerOptions }
}

function renderPane(paneProps) {
  return render(
    <Suspense fallback={<span>rendering</span>}>
      <SectionPane
        id="overview"
        content="# Overview"
        vars={{}}
        mountLeadPixels={mountLeadPixels}
        {...paneProps}
      />
    </Suspense>,
  )
}

describe('deferred section mounting', () => {
  it('renders the first section immediately', async () => {
    stubIntersectionObserver()
    const { container } = renderPane({ isEager: true })

    await screen.findByRole('heading', { name: 'Overview' })
    expect(container.querySelector('.section-pending')).toBeNull()
  })

  it('does not observe until the scroll root has been measured', () => {
    const { observerOptions } = stubIntersectionObserver()
    renderPane({ mountLeadPixels: 0 })

    expect(observerOptions).toEqual([])
  })

  it('reserves the pane and its id before the markdown pipeline runs', () => {
    stubIntersectionObserver()
    const { container } = renderPane({})

    const pane = container.querySelector('section#overview.section-pane')
    expect(pane).not.toBeNull()
    expect(container.querySelector('.section-pending')).not.toBeNull()
    expect(screen.queryByRole('heading', { name: 'Overview' })).toBeNull()
  })

  it('mounts on approach and never reverts to the placeholder', async () => {
    const { observerCallbacks, observerOptions } = stubIntersectionObserver()
    const { container, rerender } = renderPane({})

    expect(observerOptions[0].rootMargin).toBe(mountRootMargin)
    expect(observerOptions[0].threshold).toBe(0)

    await act(async () => observerCallbacks[0]([{ isIntersecting: true }]))
    await screen.findByRole('heading', { name: 'Overview' })
    expect(container.querySelector('.section-pending')).toBeNull()

    rerender(
      <Suspense fallback={<span>rendering</span>}>
        <SectionPane
          id="overview"
          content="# Overview"
          vars={{}}
          mountLeadPixels={mountLeadPixels}
        />
      </Suspense>,
    )
    expect(container.querySelector('.section-pending')).toBeNull()
    expect(screen.getByRole('heading', { name: 'Overview' })).toBeInTheDocument()
  })

  it('mounts without observing when navigation forces it', async () => {
    const { observerOptions } = stubIntersectionObserver()
    renderPane({ isForced: true })

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Overview' })).toBeVisible())
    expect(observerOptions.filter((options) => options.rootMargin === mountRootMargin)).toEqual([])
  })
  it('keeps a mounted body when forcing is withdrawn', async () => {
    stubIntersectionObserver()
    const { container, rerender } = render(
      <Suspense fallback={<span>rendering</span>}>
        <SectionPane
          id="overview"
          content="# Overview"
          vars={{}}
          mountLeadPixels={mountLeadPixels}
          isForced
        />
      </Suspense>,
    )
    await screen.findByRole('heading', { name: 'Overview' })

    rerender(
      <Suspense fallback={<span>rendering</span>}>
        <SectionPane
          id="overview"
          content="# Overview"
          vars={{}}
          mountLeadPixels={mountLeadPixels}
          isForced={false}
          isEager={false}
        />
      </Suspense>,
    )

    expect(container.querySelector('.section-pending')).toBeNull()
    expect(screen.getByRole('heading', { name: 'Overview' })).toBeInTheDocument()
  })

  it('keeps the placeholder while a mounted pane is still waiting for its body', () => {
    stubIntersectionObserver()
    const { container } = renderPane({ isEager: true, content: null })

    expect(container.querySelector('section#overview.section-pane')).not.toBeNull()
    expect(container.querySelector('.section-pending')).not.toBeNull()
  })
})

describe('lazy images', () => {
  it('defers offscreen images and prioritises eager ones', () => {
    const { container, rerender } = render(<LazyImage src="/api/proxy?path=%2Fa.png" alt="a" />)
    const image = container.querySelector('img')

    expect(image).toHaveAttribute('loading', 'lazy')
    expect(image).toHaveAttribute('decoding', 'async')
    expect(image).toHaveAttribute('fetchpriority', 'low')

    rerender(<LazyImage src="/api/proxy?path=%2Fa.png" alt="a" isEager />)
    expect(container.querySelector('img')).toHaveAttribute('loading', 'eager')
    expect(container.querySelector('img')).toHaveAttribute('fetchpriority', 'high')
  })

  it('renders nothing without a source', () => {
    const { container } = render(<LazyImage src={null} alt="" />)
    expect(container.querySelector('img')).toBeNull()
  })
  it('falls back to the base image when a modern variant cannot be loaded', () => {
    const handleError = vi.fn()
    const { container } = render(
      <LazyImage
        src="/api/proxy?path=%2Fa.webp"
        sources={['/api/proxy?path=%2Fa.avif']}
        alt="a"
        onError={handleError}
      />,
    )

    expect(container.querySelector('picture source')).toHaveAttribute('type', 'image/avif')

    fireEvent.error(container.querySelector('img'))

    expect(container.querySelector('picture')).toBeNull()
    expect(container.querySelector('img')).toHaveAttribute('src', '/api/proxy?path=%2Fa.webp')
    expect(handleError).not.toHaveBeenCalled()

    fireEvent.error(container.querySelector('img'))
    expect(handleError).toHaveBeenCalledOnce()
  })

  it('offers avif ahead of the webp baseline at markdown image sites', () => {
    const { container } = render(<MarkdownSection content={'![shot](exp1.webp)'} />)
    const source = container.querySelector('picture source')

    expect(source).toHaveAttribute('type', 'image/avif')
    expect(source.getAttribute('srcset')).toContain('exp1.avif')
    expect(container.querySelector('picture img').getAttribute('src')).toContain('exp1.webp')
  })

  it('ignores variants whose format cannot be identified', () => {
    const { container } = render(
      <LazyImage src="/api/proxy?path=%2Fa.webp" sources={['/api/proxy?path=%2Fa.unknown']} />,
    )

    expect(container.querySelector('picture')).toBeNull()
    expect(container.querySelector('img')).toHaveAttribute('src', '/api/proxy?path=%2Fa.webp')
  })
})
