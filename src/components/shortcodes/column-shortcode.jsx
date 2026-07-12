import { cssStyle, normalizeAlignment, readProps } from './shortcode-props'
import { joinClassNames } from '../../lib/class-names'

export default function Column({ node, children }) {
  const { align, style: rawStyle } = readProps(node)
  const normalizedAlignment = normalizeAlignment(align)
  const className = joinClassNames(
    'sc-col',
    normalizedAlignment && `sc-col--align-${normalizedAlignment}`,
  )
  const columnStyle = cssStyle(rawStyle)

  return (
    <div className={className} style={Object.keys(columnStyle).length ? columnStyle : undefined}>
      {children}
    </div>
  )
}
