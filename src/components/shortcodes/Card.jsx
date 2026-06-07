import { readProps, toIconName } from './props';

export default function Card({ node, children }) {
  const { title, icon, href } = readProps(node);
  const iconName = toIconName(icon);

  const isLink    = typeof href === 'string' && href.length > 0;
  const Tag       = isLink ? 'a' : 'div';
  const linkProps = isLink
    ? { href, ...(href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {}) }
    : {};

  return (
    <Tag className="sc-card" {...linkProps}>
      {(title || iconName) && (
        <div className="sc-card-title">
          {iconName && (
            <span
              className="material-symbols-outlined"
              aria-hidden="true"
              style={{
                fontSize:              '1.2em',
                fontVariationSettings: `'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 24`,
              }}
            >
              {iconName}
            </span>
          )}
          {title}
        </div>
      )}
      {children}
    </Tag>
  );
}
