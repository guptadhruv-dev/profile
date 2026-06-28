import { Children, isValidElement } from 'react'

export default function Column({ children }) {
  const items = Children.toArray(children).filter(
    (child) => isValidElement(child) && typeof child.type !== 'string',
  )
  return <div className="sc-col">{items}</div>
}
