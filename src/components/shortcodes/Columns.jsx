import { Children, isValidElement } from 'react';
import Column from './Column';

export default function Columns({ children }) {
  const cols = Children.toArray(children).filter(
    child => isValidElement(child) && child.type === Column
  );
  const maxCards = Math.max(1, ...cols.map(col =>
    Children.toArray(col.props?.children ?? []).filter(
      child => isValidElement(child) && typeof child.type !== 'string'
    ).length
  ));
  return (
    <div
      className="sc-columns"
      style={{ '--num-cols': cols.length || 2, '--col-span': maxCards }}
    >
      {cols}
    </div>
  );
}
