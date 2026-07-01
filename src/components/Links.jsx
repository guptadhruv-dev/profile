import { motion } from 'framer-motion'
import { transition, M } from '../motion'
import { externalLinkProps, proxyFileUrl } from '../shared'
import Icon from './shortcodes/Icon'

const links = [
  { icon: 'code', href: 'https://github.com/guptadhruv-dev', label: 'GitHub' },
  { icon: 'work', href: 'https://www.linkedin.com/in/dhruv-g-1343a5317', label: 'LinkedIn' },
  { icon: 'mail', href: 'mailto:connect@guptadhruv.dev', label: 'Email' },
  { icon: 'download', href: proxyFileUrl('data', '/Documents/Resume.pdf'), label: 'Resume' },
]

const LINK_SIZE = '1.25rem'
const ICON_SIZE = '1.375rem'
const GAP = '0.625rem'

export default function Links({ vertical = false }) {
  const iconEl = ({ icon, href, label }) => (
    <motion.a
      transition={transition}
      key={label}
      href={href}
      aria-label={label}
      title={label}
      {...externalLinkProps(href)}
      className="hover-link"
      style={{
        position: 'relative',
        zIndex: 2,

        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',

        width: LINK_SIZE,
        height: LINK_SIZE,
        minWidth: LINK_SIZE,
        minHeight: LINK_SIZE,
        padding: 0,
        boxSizing: 'border-box',

        color: 'var(--color-fg-secondary)',
        backgroundColor: 'transparent',
        borderRadius: '999px',
        textDecoration: 'none',
        lineHeight: 1,
        flexShrink: 0,
        overflow: 'visible',

        transition: `color ${M}, background-color ${M}, opacity ${M}, transform ${M}`,
      }}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
    >
      <span
        aria-hidden="true"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',

          width: ICON_SIZE,
          height: ICON_SIZE,
          fontSize: ICON_SIZE,
          lineHeight: 1,

          position: 'relative',
          zIndex: 3,
          flexShrink: 0,
          overflow: 'visible',
        }}
      >
        <Icon name={icon} size={ICON_SIZE} />
      </span>
    </motion.a>
  )

  return (
    <motion.div
      transition={transition}
      style={{
        position: 'relative',
        zIndex: 10,

        display: 'flex',
        flexDirection: vertical ? 'column' : 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        gap: GAP,

        width: vertical ? 'auto' : '100%',
        flexShrink: 0,
        overflow: 'visible',
      }}
    >
      {links.map(iconEl)}
    </motion.div>
  )
}
