import { useState } from 'react'
import { act, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import * as proxyModule from '../src/lib/proxy'
import Section from '../src/components/content-section'

function SectionHost({ content, vars }) {
  const [activeSection, setActiveSection] = useState('overview')

  return (
    <div>
      <button type="button" onClick={() => setActiveSection(`${activeSection}-next`)}>
        change active section
      </button>
      <span data-testid="active">{activeSection}</span>
      <Section id="overview" content={content} vars={vars} />
    </div>
  )
}

describe('section rendering cost', () => {
  it('does not re-run the markdown pipeline when only sibling state changes', async () => {
    const mediaSpy = vi.spyOn(proxyModule, 'proxySectionMediaUrl')
    const sharedVars = { label: 'Overview' }
    const content = '# Overview\n\n![shot](exp1.png)\n'

    render(<SectionHost content={content} vars={sharedVars} />)
    await screen.findByRole('heading', { name: 'Overview' })

    const callsAfterFirstRender = mediaSpy.mock.calls.length
    expect(callsAfterFirstRender).toBeGreaterThan(0)

    await act(async () => {
      screen.getByRole('button', { name: 'change active section' }).click()
    })

    expect(screen.getByTestId('active')).toHaveTextContent('overview-next')
    expect(mediaSpy.mock.calls.length).toBe(callsAfterFirstRender)

    mediaSpy.mockRestore()
  })
})
