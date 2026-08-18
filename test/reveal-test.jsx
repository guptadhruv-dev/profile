import { act, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Reveal from '../src/components/content-reveal'

const originalIntersectionObserver = globalThis.IntersectionObserver

afterEach(() => {
  globalThis.IntersectionObserver = originalIntersectionObserver
  vi.restoreAllMocks()
})

function captureObserverOptions() {
  const observerOptions = []
  globalThis.IntersectionObserver = class {
    constructor(callback, options) {
      observerOptions.push(options)
    }
    observe() {}
    disconnect() {}
  }
  return observerOptions
}

describe('section reveal', () => {
  it('uses a threshold that stays reachable for sections taller than the viewport', () => {
    const observerOptions = captureObserverOptions()
    render(<Reveal className="prose">content</Reveal>)

    expect(observerOptions).toHaveLength(1)
    expect(observerOptions[0].threshold).toBe(0)
    expect(observerOptions[0].rootMargin).toBeTruthy()
  })

  it('reveals content when intersection is reported', () => {
    let observerCallback = null
    globalThis.IntersectionObserver = class {
      constructor(callback) {
        observerCallback = callback
      }
      observe() {}
      disconnect() {}
    }
    const { container } = render(<Reveal className="prose">content</Reveal>)
    const revealElement = container.querySelector('.reveal')

    expect(revealElement).not.toHaveClass('is-visible')
    act(() => observerCallback([{ isIntersecting: true }]))
    expect(revealElement).toHaveClass('is-visible')
  })
})
