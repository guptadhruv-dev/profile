import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Section from '../src/components/content-section'

describe('remote markdown rendering', () => {
  it('preserves safe prose and strips executable HTML', async () => {
    const { container } = render(
      <Section
        id="overview"
        content={
          '<div style="text-align: justify" onclick="alert(1)">Safe<br>text</div><script>alert(1)</script>'
        }
      />,
    )

    const proseBlock = container.querySelector('div[style]')
    expect(proseBlock).toHaveStyle({ textAlign: 'justify' })
    expect(proseBlock).not.toHaveAttribute('onclick')
    expect(container.querySelector('script')).toBeNull()
    expect(screen.getByText(/Safe/)).toBeInTheDocument()
  })

  it('renders known directives and drops unsafe links', () => {
    const { container } = render(
      <Section id="overview" content={':badge{label="React"}\n\n[unsafe](javascript:alert(1))'} />,
    )
    expect(container.querySelector('.sc-badge')).toHaveTextContent('React')
    expect(container.querySelector('a')).toBeNull()
    expect(screen.getByText('unsafe')).toBeInTheDocument()
  })

  it('permits only proxied profile-bucket images inside sections', () => {
    const { container } = render(
      <Section
        id="overview"
        content={
          '<img src="EXP1.PNG" srcset="https://example.com/bypass.png 2x" alt="Experience"><img src="https://example.com/external.png" alt="External">'
        }
      />,
    )

    const sectionImage = screen.getByRole('img', { name: 'Experience' })
    expect(sectionImage).toHaveAttribute(
      'src',
      '/api/proxy?target=profile&path=%2Fmedia%2Fsections%2Fexp1.png',
    )
    expect(sectionImage).not.toHaveAttribute('srcset')
    expect(container.querySelector('img[alt="External"]')).toBeNull()
  })

  it('uses native disclosure controls for toggles', () => {
    render(<Section id="overview" content={':::toggle\n## Details\nBody content\n:::'} />)
    const toggleButton = screen.getByRole('button', { name: /Details/ })
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(toggleButton)
    expect(toggleButton).toHaveAttribute('aria-expanded', 'true')
  })

  it('loads explicit syntax highlighting without interpreting source code as HTML', async () => {
    const { container } = render(
      <Section
        id="overview"
        content={'```javascript\nconst markup = "<img src=x onerror=alert(1)>"\n```'}
      />,
    )

    await waitFor(() => expect(container.querySelector('code')).toHaveClass('hljs'))
    expect(container.querySelector('code img')).toBeNull()
    expect(container.querySelector('code')).toHaveTextContent('<img src=x onerror=alert(1)>')
  })
})
