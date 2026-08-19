import { act, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

const sectionModuleGate = { resolve: null }
const sectionModuleReady = new Promise((resolve) => {
  sectionModuleGate.resolve = resolve
})

vi.mock('../src/components/content-section', async () => {
  await sectionModuleReady
  const actualModule = await vi.importActual('../src/components/content-section')
  return actualModule
})

const { default: App } = await import('../src/profile-app')
const { default: ThemeProvider } = await import('../src/components/theme-provider')
const { scrollToAnchor } = await import('../src/lib/scroll')

const descriptorManifest = JSON.stringify([
  { file: 'overview.md', rank: 1, label: 'Overview' },
  { file: 'middle.md', rank: 2, label: 'Middle' },
  { file: 'contact.md', rank: 3, label: 'Contact' },
])
const sectionMarkdown = {
  '/overview.md': '# Overview heading',
  '/middle.md': '# Middle heading',
  '/contact.md': '# Contact heading\n\n:anchor{id="deepTarget" label="Deep target"}',
}
const originalIntersectionObserver = globalThis.IntersectionObserver

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
    return Promise.resolve(new Response(sectionMarkdown[contentPath] ?? '# Body'))
  })
  return scrollIntoView
}

describe('body commit while the section module is suspended', () => {
  it('does not scroll on fetched content alone, and rescues an anchor after the module commits', async () => {
    const scrollIntoView = stubEnvironment()
    const { container } = render(
      <ThemeProvider>
        <App />
      </ThemeProvider>,
    )

    await waitFor(() => expect(container.querySelectorAll('.section-pending').length).toBe(3))
    expect(screen.queryByRole('heading', { name: 'Overview heading' })).toBeNull()

    screen.getByRole('button', { name: 'Contact' }).click()
    await waitFor(() => expect(globalThis.fetch).toHaveBeenCalled())
    expect(container.querySelectorAll('.section-pending').length).toBe(3)
    expect(scrollIntoView).not.toHaveBeenCalled()

    act(() => scrollToAnchor('deepTarget'))
    expect(screen.queryByText('Deep target')).toBeNull()

    await act(async () => {
      sectionModuleGate.resolve()
      await sectionModuleReady
    })

    await screen.findByRole('heading', { name: 'Contact heading' })
    await waitFor(() => expect(container.querySelector('.section-pending')).toBeNull())
    await waitFor(() => expect(screen.getByText('Deep target')).toBeInTheDocument())
    await waitFor(() => expect(scrollIntoView.mock.instances.length).toBeGreaterThanOrEqual(2))

    const contactPane = container.querySelector('section#contact')
    const anchorTarget = container.querySelector('#deepTarget')
    expect(scrollIntoView.mock.instances).toContain(contactPane)
    expect(scrollIntoView.mock.instances).toContain(anchorTarget)
    expect(contactPane.contains(anchorTarget)).toBe(true)
    for (const scrollCall of scrollIntoView.mock.calls) {
      expect(scrollCall[0].behavior).toBe('smooth')
    }
  })
})
