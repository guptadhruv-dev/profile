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

export function resolveColor(color, fallback = 'var(--color-fg-secondary)') {
  if (typeof color !== 'string' || color.length === 0) return fallback;
  if (color === 'primary')   return 'var(--color-fg-primary)';
  if (color === 'secondary') return 'var(--color-fg-secondary)';
  return color;
}

export function resolveBadgeColor(color, fallback = 'var(--color-fg-secondary)') {
  if (typeof color !== 'string' || !/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(color)) {
    return fallback;
  }
  return color;
}
