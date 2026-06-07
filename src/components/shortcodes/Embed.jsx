import { readProps, sizeStyle } from './props';

export default function Embed({ node }) {
  const { type, id, src, title, width, align } = readProps(node);

  let url = null;
  if (type === 'youtube' && typeof id === 'string' && id.length) {
    url = `https://www.youtube-nocookie.com/embed/${id}`;
  } else if (typeof src === 'string' && src.length) {
    url = src;
  }
  if (!url) return null;

  const style = sizeStyle(width ?? 640, align ?? 'left');

  return (
    <div className="sc-embed" style={style}>
      <iframe
        src={url}
        title={title || 'Embedded content'}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
}
