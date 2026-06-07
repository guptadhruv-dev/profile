const M = 'var(--motion-duration) var(--motion-ease)';

export default function SectionButton({ label, isActive, onClick, align = 'start' }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily:    'var(--font-family)',
        fontSize:      '22px',
        fontWeight:    isActive ? '800' : '600',
        color:         isActive ? 'var(--color-fg-primary)' : 'var(--color-fg-secondary)',
        background:    'none',
        border:        'none',
        cursor:        'pointer',
        padding:       '0',
        textAlign:     align,
        transition:    `color ${M}, opacity ${M}, font-weight ${M}`,
        display:       'block',
        width:         '100%',
        fontVariant:    'all-small-caps',
      }}
      onMouseEnter={e => {
        if (!isActive) e.target.style.color = 'var(--color-fg-primary)';
      }}
      onMouseLeave={e => {
        if (!isActive) e.target.style.color = 'var(--color-fg-secondary)';
      }}
    >
      {label}
    </button>
  );
}
