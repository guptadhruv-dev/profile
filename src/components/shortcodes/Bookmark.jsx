import { readProps, sizeStyle } from './props';

export default function Bookmark({ node }) {
  const { href, title, description, image, width, align } = readProps(node);
  if (typeof href !== 'string' || href.length === 0) return null;

  let host = href;
  try { host = new URL(href).hostname.replace(/^www\./, ''); } catch { host = href; }
  const external = href.startsWith('http');

  return (
    <a
      className="sc-bookmark"
      style={sizeStyle(width, align)}
      href={href}
      {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
    >
      <div className="sc-bookmark-text">
        {title && <div className="sc-bookmark-title">{title}</div>}
        {description && <div className="sc-bookmark-desc">{description}</div>}
        <div className="sc-bookmark-host">{host}</div>
      </div>
      {image && (
        <div className="sc-bookmark-image">
          <img src={image} alt="" loading="lazy" />
        </div>
      )}
    </a>
  );
}
