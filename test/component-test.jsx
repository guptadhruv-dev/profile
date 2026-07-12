import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Sidebar from '../src/components/profile-sidebar'
import Links from '../src/components/profile-links'
import ThemeProvider from '../src/components/theme-provider'
import ThemeToggle from '../src/components/theme-toggle'

afterEach(() => {
  document.documentElement.style.removeProperty('--is-mobile')
  document.documentElement.className = ''
  delete window.localStorage
  vi.restoreAllMocks()
})

describe('theme controls', () => {
  it('toggles the document theme and persists it', () => {
    document.documentElement.dataset.themeStorageKey = 'theme-mode'
    document.documentElement.classList.add('dark')
    const setStoredTheme = vi.fn()
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: { setItem: setStoredTheme },
    })
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Switch to light mode' }))
    expect(document.documentElement).toHaveClass('light')
    expect(setStoredTheme).toHaveBeenLastCalledWith('theme-mode', 'light')
  })

  it('continues when storage is unavailable', () => {
    document.documentElement.dataset.themeStorageKey = 'theme-mode'
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: {
        setItem() {
          throw new Error('blocked')
        },
      },
    })
    expect(() =>
      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>,
      ),
    ).not.toThrow()
  })
})

describe('sidebar navigation', () => {
  const sections = [
    { id: 'overview', label: 'Overview', vars: { icon: 'home' } },
    { id: 'work-history', label: 'Work History', vars: { icon: 'work' } },
  ]

  it('marks the active section and handles navigation', () => {
    const handleNavigation = vi.fn()
    render(
      <ThemeProvider>
        <Sidebar activeSection="overview" onNavClick={handleNavigation} sections={sections} />
      </ThemeProvider>,
    )

    expect(screen.getByRole('button', { name: /Overview/ })).toHaveAttribute('aria-current', 'page')
    fireEvent.click(screen.getByRole('button', { name: /Work History/ }))
    expect(handleNavigation).toHaveBeenCalledWith('work-history')
  })

  it('opens and closes mobile navigation with accessible disclosure state', () => {
    document.documentElement.style.setProperty('--is-mobile', '1')
    render(
      <ThemeProvider>
        <Sidebar activeSection="overview" onNavClick={vi.fn()} sections={sections} />
      </ThemeProvider>,
    )

    const openButton = screen.getByRole('button', { name: 'Open navigation' })
    expect(openButton).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(openButton)
    expect(openButton).toHaveAttribute('aria-expanded', 'true')
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(openButton).toHaveAttribute('aria-expanded', 'false')
    expect(openButton).toHaveFocus()
  })
})

describe('profile links', () => {
  it('provides quoted mask URLs for SVG assets', () => {
    render(<Links />)

    for (const linkLabel of ['GitHub', 'LinkedIn']) {
      const iconElement = screen.getByRole('link', { name: linkLabel }).querySelector('.is-asset')
      const maskUrl = iconElement.style.getPropertyValue('--link-icon')
      expect(maskUrl).toMatch(/^url\(".+"\)$/)
    }
  })
})
