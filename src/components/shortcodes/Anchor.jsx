import { readProps } from './props';

export default function Anchor({ node }) {
  const { id, label } = readProps(node);
  if (typeof id !== 'string' || id.length === 0) return null;

  return (
    <span id={id} className="ref-target">
      {typeof label === 'string' ? label : null}
    </span>
  );
}
