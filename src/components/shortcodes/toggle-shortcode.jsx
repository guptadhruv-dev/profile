import { Children, useId, useState } from 'react'
import { readProps } from './shortcode-props'
import Icon from './icon-shortcode'

export default function Toggle({ node, children }) {
  const properties = readProps(node)
  const [isOpen, setIsOpen] = useState(properties.default === 'open')
  const contentId = useId()
  const childElements = Children.toArray(children)
  const header = childElements[0] ?? null
  const body = childElements.slice(1)

  return (
    <div className="sc-toggle">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={contentId}
        onClick={() => setIsOpen((currentValue) => !currentValue)}
        className={`sc-toggle-header${isOpen ? ' is-open' : ''}`}
      >
        <Icon name="chevron_right" weight={600} className="sc-toggle-icon" />
        <span className="sc-toggle-title">{header}</span>
      </button>

      <div
        id={contentId}
        aria-hidden={!isOpen}
        className={`sc-toggle-panel${isOpen ? ' is-open' : ''}`}
      >
        <div className="sc-toggle-clip">
          <div className="sc-toggle-body">{body}</div>
        </div>
      </div>
    </div>
  )
}
