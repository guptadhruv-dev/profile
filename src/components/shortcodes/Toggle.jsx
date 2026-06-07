import { useState, useId, Children } from 'react';
import { readProps } from './props';

export default function Toggle({ node, children }) {
  const props      = readProps(node);
  const startsOpen = props.default === 'open';
  const [open, setOpen] = useState(startsOpen);
  const contentId  = useId();

  const childArray = Children.toArray(children);
  const header     = childArray[0] ?? null;
  const body       = childArray.slice(1);

  const toggle = () => setOpen(v => !v);
  const onKey  = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } };

  return (
    <div style={{ margin: '12px 0' }}>
      <div
        role="button"
        tabIndex={0}
        aria-expanded={open}
        aria-controls={contentId}
        onClick={toggle}
        onKeyDown={onKey}
        style={{
          display:    'flex',
          alignItems: 'center',
          gap:        '0.4em',
          cursor:     'pointer',
          userSelect: 'none',
        }}
      >
        <span
          className="material-symbols-outlined"
          aria-hidden="true"
          style={{
            fontSize:              '1.5em',
            color:                 'var(--color-fg-secondary)',
            flexShrink:            0,
            transform:             open ? 'rotate(90deg)' : 'rotate(0deg)',
            transition:            'transform var(--motion-duration) var(--motion-ease)',
            fontVariationSettings: `'FILL' 0, 'wght' 600, 'GRAD' 0, 'opsz' 24`,
          }}
        >
          chevron_right
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          {header}
        </div>
      </div>

      <div
        id={contentId}
        aria-hidden={!open}
        style={{
          display:          'grid',
          gridTemplateRows: open ? '1fr' : '0fr',
          transition:       'grid-template-rows var(--motion-duration) var(--motion-ease)',
        }}
      >
        <div style={{ overflow: 'hidden', minHeight: 0 }}>
          <div style={{ paddingLeft: '1.5em' }}>
            {body}
          </div>
        </div>
      </div>
    </div>
  );
}
