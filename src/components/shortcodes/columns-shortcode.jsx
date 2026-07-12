import { Children, isValidElement } from 'react'
import Column from './column-shortcode'
import { cssSize, cssStyle, readProps } from './shortcode-props'
import { joinClassNames } from '../../lib/class-names'

const flexibleColumnSize = 'minmax(0, 1fr)'
const contentColumnSize = 'max-content'

function columnTrackSize(value) {
  if (value === undefined || value === null || value === '') return flexibleColumnSize
  const normalizedValue = String(value).trim().toLowerCase()
  if (normalizedValue === 'fit' || normalizedValue === 'content') return contentColumnSize
  if (normalizedValue === 'full' || normalizedValue === 'fill') return flexibleColumnSize
  return cssSize(value, flexibleColumnSize)
}

export default function Columns({ node, children }) {
  const { separator, style: rawStyle } = readProps(node)
  const columns = Children.toArray(children).filter(
    (child) => isValidElement(child) && child.type === Column,
  )
  const hasSeparator = typeof separator === 'string' && separator.length > 0
  const columnTemplate = columns
    .flatMap((column, columnIndex) => {
      const trackSize = columnTrackSize(readProps(column.props?.node).width)
      return hasSeparator && columnIndex < columns.length - 1
        ? [trackSize, contentColumnSize]
        : [trackSize]
    })
    .join(' ')
  const columnItems = columns.flatMap((column, columnIndex) =>
    hasSeparator && columnIndex < columns.length - 1
      ? [
          column,
          <span className="sc-column-separator" aria-hidden="true" key={`separator-${columnIndex}`}>
            {separator}
          </span>,
        ]
      : [column],
  )
  const style = {
    '--num-cols': columns.length || 2,
    '--column-template': columnTemplate || undefined,
    ...cssStyle(rawStyle),
  }

  return (
    <div
      className={joinClassNames('sc-columns', hasSeparator && 'sc-columns--separated')}
      style={style}
    >
      {columnItems}
    </div>
  )
}
