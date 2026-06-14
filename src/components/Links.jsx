import { useEffect, useRef, useState } from 'react';
import { GithubLogo, LinkedinLogo, EnvelopeSimple, DownloadSimple } from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { transition } from '../motion';

const links = [
  { Icon: GithubLogo,     href: 'https://github.com/guptadhruv-dev',                 label: 'GitHub'   },
  { Icon: LinkedinLogo,   href: 'https://www.linkedin.com/in/dhruv-g-1343a5317',     label: 'LinkedIn' },
  { Icon: EnvelopeSimple, href: 'mailto:connect@guptadhruv.dev',                     label: 'Email'    },
  { Icon: DownloadSimple, href: '/DhruvGupta-Resume.pdf',                            label: 'Resume'   },
];

const M         = 'var(--motion-duration) var(--motion-ease)';
const ICON_SIZE = 24;
const GAP       = 10;
const N         = links.length;

function balancedCols(containerWidth) {
  const maxPerRow = Math.max(1, Math.floor((containerWidth + GAP) / (ICON_SIZE + GAP)));
  if (maxPerRow >= N) return N;
  const rows = Math.ceil(N / maxPerRow);
  return Math.ceil(N / rows);
}

export default function Links({ vertical = false, center = false }) {
  const containerRef = useRef(null);
  const [cols, setCols] = useState(N);

  useEffect(() => {
    if (vertical) return;
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setCols(balancedCols(el.clientWidth)));
    ro.observe(el);
    setCols(balancedCols(el.clientWidth));
    return () => ro.disconnect();
  }, [vertical]);

  const iconEl = ({ Icon, href, label }) => (
    <motion.a
      layout
      transition={transition}
      key={label}
      href={href}
      aria-label={label}
      target={href.startsWith('mailto') ? undefined : '_blank'}
      rel="noreferrer"
      style={{
        width:          ICON_SIZE,
        height:         ICON_SIZE,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        color:          'var(--color-fg-secondary)',
        transition:     `color ${M}`,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-fg-primary)')}
      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-fg-secondary)')}
    >
      <Icon size={ICON_SIZE} weight="fill" />
    </motion.a>
  );

  if (vertical) {
    return (
      <motion.div layout transition={transition} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: GAP }}>
        {links.map(iconEl)}
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={containerRef}
      layout
      transition={transition}
      style={{
        display:             'grid',
        gridTemplateColumns: `repeat(${cols}, ${ICON_SIZE}px)`,
        justifyContent:      center ? 'center' : 'start',
        gap:                 GAP,
        width:               '100%',
      }}
    >
      {links.map(iconEl)}
    </motion.div>
  );
}
