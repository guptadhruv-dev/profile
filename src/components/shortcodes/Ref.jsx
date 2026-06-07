import { readProps, toIconName } from './props';
import { scrollToAnchor } from '../../scrollToAnchor';

export default function Ref({ node }) {
  const { to, label, icon } = readProps(node);
  if (typeof to !== 'string' || to.length === 0) return null;

  const text     = typeof label === 'string' && label.length ? label : to;
  const iconName = toIconName(icon);

  const onClick = (e) => {
    e.preventDefault();
    scrollToAnchor(to);
  };

  return (
    <a href={`#${to}`} className="sc-ref" onClick={onClick}>
      {text}
      {iconName && (
        <span
          className="material-symbols-outlined"
          aria-hidden="true"
          style={{
            fontSize:              '0.95em',
            fontVariationSettings: `'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 20`,
          }}
        >
          {iconName}
        </span>
      )}
    </a>
  );
}
