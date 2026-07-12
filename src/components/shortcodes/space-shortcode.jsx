import { cssSize, readProps } from './shortcode-props'

const namedSpaceSizes = Object.freeze({
  xs: 'var(--space-xs)',
  sm: 'var(--space-sm)',
  md: 'var(--space-md)',
  lg: 'var(--space-lg)',
  xl: 'var(--space-xl)',
})
const defaultSpaceSizeCss = namedSpaceSizes.md

export default function Space({ node }) {
  const { size = 'md' } = readProps(node)
  const spaceSize = namedSpaceSizes[size] ?? cssSize(size, defaultSpaceSizeCss)

  return <div className="sc-space" style={{ '--space-size': spaceSize }} aria-hidden="true" />
}
