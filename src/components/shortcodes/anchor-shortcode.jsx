import { readProps } from './shortcode-props'

const validAnchorIdentifierPattern = /^[A-Za-z][A-Za-z0-9_-]*$/

export default function Anchor({ node }) {
  const { id, label } = readProps(node)
  if (typeof id !== 'string' || !validAnchorIdentifierPattern.test(id)) return null

  return (
    <span id={id} className="ref-target">
      {typeof label === 'string' ? label : null}
    </span>
  )
}
