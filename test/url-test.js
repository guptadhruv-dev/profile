import { describe, expect, it } from 'vitest'
import {
  externalLinkProps,
  proxyProfileAssetUrl,
  proxyProfileAssetVariantUrl,
  proxyProtectedUrl,
  proxySectionMediaUrl,
  proxySectionMediaVariantUrl,
  safeUrl,
} from '../src/lib/proxy'

describe('URL policy', () => {
  it('allows expected link and media URLs', () => {
    expect(safeUrl('/profile', 'link')).toBe('/profile')
    expect(safeUrl('mailto:test@example.com', 'link')).toBe('mailto:test@example.com')
    expect(safeUrl('https://example.com/image.png', 'media')).toBe('https://example.com/image.png')
  })

  it.each([
    'javascript:alert(1)',
    'data:text/html,test',
    '//example.com',
    'https://user:pass@example.com',
  ])('rejects unsafe URLs', (unsafeUrl) => {
    expect(safeUrl(unsafeUrl, 'link')).toBeNull()
  })

  it('requires HTTPS embeds', () => {
    expect(safeUrl('https://player.example.com/video', 'embed')).toBeTruthy()
    expect(safeUrl('http://player.example.com/video', 'embed')).toBeNull()
    expect(safeUrl('/video', 'embed')).toBeNull()
  })

  it('proxies protected origins and hardens external links', () => {
    expect(proxyProtectedUrl('https://data.guptadhruv.dev/Media/Profile.png', 'media')).toBe(
      '/api/proxy?target=profile&path=%2Fmedia%2Fprofile.png',
    )
    expect(externalLinkProps('https://example.com')).toEqual({
      target: '_blank',
      rel: 'noopener noreferrer',
    })
  })

  it('routes section media exclusively through the profile proxy', () => {
    expect(proxySectionMediaUrl('EXP_01.PNG')).toBe(
      '/api/proxy?target=profile&path=%2Fmedia%2Fsections%2Fexp_01.png',
    )
    expect(proxySectionMediaUrl('https://data.guptadhruv.dev/Media/Sections/EXP_02.png')).toBe(
      '/api/proxy?target=profile&path=%2Fmedia%2Fsections%2Fexp_02.png',
    )
    expect(proxySectionMediaUrl('media/projects/PROJECT_01.PNG')).toBe(
      '/api/proxy?target=profile&path=%2Fmedia%2Fprojects%2Fproject_01.png',
    )
    expect(proxySectionMediaUrl('https://example.com/image.png')).toBeNull()
    expect(proxySectionMediaUrl('../secret.png')).toBeNull()
  })

  it('resolves general profile assets from the bucket root', () => {
    expect(proxyProfileAssetUrl('DOCUMENTS/RESUME.PDF')).toBe(
      '/api/proxy?target=profile&path=%2Fdocuments%2Fresume.pdf',
    )
  })
  it('prefers an avif variant of every webp asset and leaves other formats alone', () => {
    expect(proxySectionMediaVariantUrl('exp1.webp')).toBe(
      '/api/proxy?target=profile&path=%2Fmedia%2Fsections%2Fexp1.avif',
    )
    expect(proxySectionMediaVariantUrl('EXP_01.WEBP')).toBe(
      '/api/proxy?target=profile&path=%2Fmedia%2Fsections%2Fexp_01.avif',
    )
    expect(proxyProfileAssetVariantUrl('media/profile.webp')).toBe(
      '/api/proxy?target=profile&path=%2Fmedia%2Fprofile.avif',
    )
    expect(proxySectionMediaVariantUrl('legacy.png')).toBeNull()
    expect(proxySectionMediaVariantUrl('already.avif')).toBeNull()
  })

  it('applies the same path validation to variants as to the baseline asset', () => {
    expect(proxySectionMediaVariantUrl('../secret.webp')).toBeNull()
    expect(proxySectionMediaVariantUrl('https://example.com/image.webp')).toBeNull()
    expect(proxySectionMediaVariantUrl(null)).toBeNull()
  })
})
