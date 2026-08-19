import { act, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from '../src/profile-app'
import ThemeProvider from '../src/components/theme-provider'
import { scrollToAnchor } from '../src/lib/scroll'

const originalIntersectionObserver = globalThis.IntersectionObserver
const sectionMarkdown = {
  '/overview.md': '# Overview heading',
  '/contact.md': '# Contact heading\n\n:anchor{id="deepTarget" label="Deep target"}',
}
const descriptorManifest = JSON.stringify([
  { file: 'overview.md', rank: 1, label: 'Overview', icon: 'home' },
  { file: 'contact.md', rank: 2, label: 'Contact', icon: 'mail' },
])

afterEach(() => {
  globalThis.IntersectionObserver = originalIntersectionObserver
  vi.restoreAllMocks()
})

function stubEnvironment() {
  globalThis.IntersectionObserver = class {
    observe() {}
    disconnect() {}
  }
  const scrollIntoView = vi.fn()
  Element.prototype.scrollIntoView = scrollIntoView

  vi.spyOn(globalThis, 'fetch').mockImplementation((requestUrl) => {
    const contentPath = new URL(String(requestUrl), 'https://profile.test').searchParams.get('path')
    if (contentPath === '/index.json') return Promise.resolve(new Response(descriptorManifest))
    const markdown = sectionMarkdown[contentPath]
    return markdown
      ? Promise.resolve(new Response(markdown))
      : Promise.resolve(new Response('missing', { status: 404 }))
  })

  return scrollIntoView
}

describe('sidebar navigation with deferred sections', () => {
  it('mounts the target section before scrolling to it', async () => {
    const scrollIntoView = stubEnvironment()
    const { container } = render(
      <ThemeProvider>
        <App />
      </ThemeProvider>,
    )

    await screen.findByRole('heading', { name: 'Overview heading' })
    expect(screen.queryByRole('heading', { name: 'Contact heading' })).toBeNull()
    expect(container.querySelectorAll('.section-pending')).toHaveLength(1)

    screen.getByRole('button', { name: 'Contact' }).click()

    await screen.findByRole('heading', { name: 'Contact heading' })
    expect(container.querySelectorAll('.section-pending')).toHaveLength(0)
    await waitFor(() => expect(scrollIntoView).toHaveBeenCalled())

    const contactPane = container.querySelector('section#contact')
    expect(contactPane.textContent).toContain('Contact heading')
    expect(scrollIntoView.mock.instances[0]).toBe(contactPane)
  })
  it('derives the mount lead from the measured scroll-root height', async () => {
    const observerOptions = []
    globalThis.IntersectionObserver = class {
      constructor(callback, options) {
        observerOptions.push(options)
      }
      observe() {}
      disconnect() {}
    }
    Element.prototype.scrollIntoView = vi.fn()
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
      height: 700,
      width: 320,
      top: 0,
      left: 0,
      bottom: 700,
      right: 320,
    })
    vi.spyOn(globalThis, 'fetch').mockImplementation((requestUrl) => {
      const contentPath = new URL(String(requestUrl), 'https://profile.test').searchParams.get(
        'path',
      )
      if (contentPath === '/index.json') return Promise.resolve(new Response(descriptorManifest))
      return Promise.resolve(new Response(sectionMarkdown[contentPath] ?? '# Body'))
    })

    render(
      <ThemeProvider>
        <App />
      </ThemeProvider>,
    )
    await screen.findByRole('heading', { name: 'Overview heading' })

    const paneMargins = observerOptions
      .map((options) => options.rootMargin)
      .filter((rootMargin) => rootMargin?.endsWith('px 0px 700px 0px'))
    expect(paneMargins).toContain('700px 0px 700px 0px')
    expect(observerOptions.some((options) => String(options.rootMargin).includes('100%'))).toBe(
      false,
    )
  })

  it('scrolls again on a repeated navigation request', async () => {
    const scrollIntoView = stubEnvironment()
    render(
      <ThemeProvider>
        <App />
      </ThemeProvider>,
    )
    await screen.findByRole('heading', { name: 'Overview heading' })

    screen.getByRole('button', { name: 'Contact' }).click()
    await waitFor(() => expect(scrollIntoView).toHaveBeenCalledTimes(1))
    screen.getByRole('button', { name: 'Contact' }).click()
    await waitFor(() => expect(scrollIntoView).toHaveBeenCalledTimes(2))
  })

  it('waits for the destination body before scrolling to it', async () => {
    let resolveContactBody
    const contactBody = new Promise((resolve) => {
      resolveContactBody = resolve
    })
    globalThis.IntersectionObserver = class {
      observe() {}
      disconnect() {}
    }
    const scrollIntoView = vi.fn()
    Element.prototype.scrollIntoView = scrollIntoView
    vi.spyOn(globalThis, 'fetch').mockImplementation((requestUrl) => {
      const contentPath = new URL(String(requestUrl), 'https://profile.test').searchParams.get(
        'path',
      )
      if (contentPath === '/index.json') return Promise.resolve(new Response(descriptorManifest))
      if (contentPath === '/contact.md') return contactBody
      return Promise.resolve(new Response(sectionMarkdown[contentPath]))
    })

    const { container } = render(
      <ThemeProvider>
        <App />
      </ThemeProvider>,
    )
    await screen.findByRole('heading', { name: 'Overview heading' })

    screen.getByRole('button', { name: 'Contact' }).click()
    await waitFor(() => expect(container.querySelector('section#contact')).not.toBeNull())
    expect(scrollIntoView).not.toHaveBeenCalled()

    await act(async () => {
      resolveContactBody(new Response(sectionMarkdown['/contact.md']))
      await contactBody
    })

    await screen.findByRole('heading', { name: 'Contact heading' })
    await waitFor(() => expect(scrollIntoView).toHaveBeenCalled())
  })

  it('rescues repeated references into deferred sections', async () => {
    stubEnvironment()
    const scrollSpy = vi.fn()
    Element.prototype.scrollIntoView = scrollSpy
    render(
      <ThemeProvider>
        <App />
      </ThemeProvider>,
    )
    await screen.findByRole('heading', { name: 'Overview heading' })

    expect(screen.queryByText('Deep target')).toBeNull()
    act(() => scrollToAnchor('deepTarget'))
    await waitFor(() => expect(screen.getByText('Deep target')).toBeInTheDocument())

    const callsAfterFirstRescue = scrollSpy.mock.calls.length
    act(() => scrollToAnchor('deepTarget'))
    await waitFor(() => expect(scrollSpy.mock.calls.length).toBeGreaterThan(callsAfterFirstRescue))
  })
  it('does not scroll until every forced predecessor body has committed', async () => {
    let resolveMiddleBody
    const middleBody = new Promise((resolve) => {
      resolveMiddleBody = resolve
    })
    globalThis.IntersectionObserver = class {
      observe() {}
      disconnect() {}
    }
    const scrollIntoView = vi.fn()
    Element.prototype.scrollIntoView = scrollIntoView
    vi.spyOn(globalThis, 'fetch').mockImplementation((requestUrl) => {
      const contentPath = new URL(String(requestUrl), 'https://profile.test').searchParams.get(
        'path',
      )
      if (contentPath === '/index.json') {
        return Promise.resolve(
          new Response(
            JSON.stringify([
              { file: 'overview.md', rank: 1, label: 'Overview' },
              { file: 'middle.md', rank: 2, label: 'Middle' },
              { file: 'contact.md', rank: 3, label: 'Contact' },
            ]),
          ),
        )
      }
      if (contentPath === '/middle.md') return middleBody
      if (contentPath === '/contact.md') return Promise.resolve(new Response('# Contact heading'))
      return Promise.resolve(new Response('# Overview heading'))
    })

    render(
      <ThemeProvider>
        <App />
      </ThemeProvider>,
    )
    await screen.findByRole('heading', { name: 'Overview heading' })

    screen.getByRole('button', { name: 'Contact' }).click()
    await screen.findByRole('heading', { name: 'Contact heading' })
    expect(scrollIntoView).not.toHaveBeenCalled()

    await act(async () => {
      resolveMiddleBody(new Response('# Middle heading'))
      await middleBody
    })

    await screen.findByRole('heading', { name: 'Middle heading' })
    await waitFor(() => expect(scrollIntoView).toHaveBeenCalled())
  })

  it('requests only the first body plus one lookahead on a cold load', async () => {
    const requestedPaths = []
    globalThis.IntersectionObserver = class {
      observe() {}
      disconnect() {}
    }
    Element.prototype.scrollIntoView = vi.fn()
    vi.spyOn(globalThis, 'fetch').mockImplementation((requestUrl) => {
      const contentPath = new URL(String(requestUrl), 'https://profile.test').searchParams.get(
        'path',
      )
      requestedPaths.push(contentPath)
      if (contentPath === '/index.json') {
        return Promise.resolve(
          new Response(
            JSON.stringify([
              { file: 'overview.md', rank: 1, label: 'Overview' },
              { file: 'middle.md', rank: 2, label: 'Middle' },
              { file: 'contact.md', rank: 3, label: 'Contact' },
            ]),
          ),
        )
      }
      return Promise.resolve(new Response(`# ${contentPath} heading`))
    })

    render(
      <ThemeProvider>
        <App />
      </ThemeProvider>,
    )
    await waitFor(() => expect(requestedPaths).toContain('/middle.md'))

    expect(requestedPaths).toContain('/overview.md')
    expect(requestedPaths).not.toContain('/contact.md')
  })
})
