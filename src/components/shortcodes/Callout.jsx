import { readProps, toIconName } from './props';

const TYPES = {
  info:    { icon: 'info' },
  tip:     { icon: 'lightbulb' },
  warning: { icon: 'warning' },
  danger:  { icon: 'error' },
  note:    { icon: 'note' },
};

export default function Callout({ node, children }) {
  const { type, icon } = readProps(node);
  const variant  = TYPES[type] ? type : 'note';
  const accent   = `var(--accent-${variant})`;
  const iconName = toIconName(icon) ?? TYPES[variant].icon;

  return (
    <div
      style={{
        display:         'flex',
        gap:             '0.7em',
        margin:          '1em 0',
        padding:         '0.85em 1em',
        borderRadius:    '10px',
        background:      `color-mix(in srgb, ${accent} 10%, transparent)`,
        border:          `1px solid color-mix(in srgb, ${accent} 30%, transparent)`,
      }}
    >
      <span
        className="material-symbols-outlined"
        aria-hidden="true"
        style={{
          color:                 accent,
          fontSize:              '1.3em',
          alignSelf:             'center',
          flexShrink:            0,
          fontVariationSettings: `'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24`,
        }}
      >
        {iconName}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        {children}
      </div>
    </div>
  );
}
