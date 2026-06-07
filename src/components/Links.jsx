import { GithubLogo, LinkedinLogo, EnvelopeSimple, DownloadSimple } from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { transition } from '../motion';

const links = [
  { Icon: GithubLogo,     href: 'https://github.com/guptadhruv-dev',                 label: 'GitHub'   },
  { Icon: LinkedinLogo,   href: 'https://www.linkedin.com/in/dhruv-g-1343a5317',     label: 'LinkedIn' },
  { Icon: EnvelopeSimple, href: 'mailto:connect@guptadhruv.dev',                     label: 'Email'    },
  { Icon: DownloadSimple, href: '/Resume.pdf',                                       label: 'Resume'   },
];

const M         = 'var(--motion-duration) var(--motion-ease)';
const ICON_SIZE = 24;
const ROW_GAP   = 18;

export default function Links({ vertical = false, center = false }) {
  return (
    <motion.div
      layout
      transition={transition}
      style={{
        display:        'flex',
        flexDirection:  vertical ? 'column' : 'row',
        flexWrap:       'wrap',
        justifyContent: center ? 'center' : 'flex-start',
        alignItems:     'center',
        width:          '100%',
        gap:            `${ROW_GAP}px`,
      }}
    >
      {links.map(({ Icon, href, label }) => (
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
      ))}
    </motion.div>
  );
}
