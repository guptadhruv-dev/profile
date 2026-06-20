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
const ICON_SIZE = 22;
const MIN_GAP   = 10;

export default function Links({ vertical = false }) {
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
      <motion.div layout transition={transition} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: MIN_GAP, flexShrink: 0 }}>
        {links.map(iconEl)}
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      transition={transition}
      style={{
        display:        'flex',
        flexWrap:       'wrap',
        justifyContent: 'space-between',
        columnGap:      MIN_GAP,
        rowGap:         MIN_GAP,
        width:          '100%',
        flexShrink:     0,
      }}
    >
      {links.map(iconEl)}
    </motion.div>
  );
}
