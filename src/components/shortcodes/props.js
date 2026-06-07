export function readProps(node) {
  const raw = node?.properties?.dataProps;
  if (typeof raw !== 'string') return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function sizeStyle(width, align) {
  const style = {};
  if (width !== undefined && width !== null && width !== '') {
    style.width = '100%';
    style.maxWidth = typeof width === 'number' ? `${width}px` : String(width);
  }
  if (align === 'center')     { style.marginLeft = 'auto'; style.marginRight = 'auto'; }
  else if (align === 'right') { style.marginLeft = 'auto'; style.marginRight = '0'; }
  else if (align === 'left')  { style.marginRight = 'auto'; }
  return style;
}

export function toIconName(value) {
  if (typeof value !== 'string' || value.length === 0) return null;
  return value.trim().toLowerCase().replace(/\s+/g, '_');
}

const ACCENT_NAMES = new Set(['info', 'tip', 'warning', 'danger', 'note']);

export function resolveColor(color, fallback = 'var(--color-fg-secondary)') {
  if (typeof color !== 'string' || color.length === 0) return fallback;
  if (color === 'primary')   return 'var(--color-fg-primary)';
  if (color === 'secondary') return 'var(--color-fg-secondary)';
  if (ACCENT_NAMES.has(color)) return `var(--accent-${color})`;
  return color;
}
