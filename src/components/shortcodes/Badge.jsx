import { readProps, resolveColor, toIconName } from './props';

export default function Badge({ node }) {
  const { label, color, icon } = readProps(node);
  if (typeof label !== 'string' || label.length === 0) return null;

  const tint     = resolveColor(color, 'var(--color-fg-secondary)');
  const iconName = toIconName(icon);

  return (
    <span
      style={{
        display:       'inline-flex',
        alignItems:    'center',
        gap:           '0.3em',
        padding:       '0.075em 0.5em',
        borderRadius:  '10px',
        fontSize:      '0.85em',
        fontWeight:    500,
        whiteSpace:    'nowrap',
        verticalAlign: 'middle',
        color:         tint,
        background:    `color-mix(in srgb, ${tint} 14%, transparent)`,
        border:        `1px solid color-mix(in srgb, ${tint} 32%, transparent)`,
        alignSelf:     'center',
      }}
    >
      {iconName && (
        <span
          className="material-symbols-outlined"
          aria-hidden="true"
          style={{
            fontSize:              '1.1em',
            fontVariationSettings: `'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20`,
          }}
        >
          {iconName}
        </span>
      )}
      {label}
    </span>
  );
}
