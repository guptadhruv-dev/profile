import { externalLinkProps, proxyProfileAssetUrl } from '../lib/proxy'
import Icon from './shortcodes/icon-shortcode'
import github from '../assets/icons/github.svg?no-inline'
import linkedin from '../assets/icons/linkedin.svg?no-inline'

function cssUrl(assetUrl) {
  return `url(${JSON.stringify(assetUrl)})`
}

const profileLinks = [
  { asset: github, href: 'https://github.com/guptadhruv-dev', label: 'GitHub' },
  { asset: linkedin, href: 'https://www.linkedin.com/in/dhruv-g-1343a5317', label: 'LinkedIn' },
  { icon: 'Mail', href: 'mailto:connect@guptadhruv.dev', label: 'Email' },
  {
    icon: 'Sim Card Download',
    href: proxyProfileAssetUrl('documents/resume.pdf'),
    label: 'Resume',
  },
]

export default function Links({ vertical = false }) {
  return (
    <div className={`links${vertical ? ' links--vertical' : ''}`}>
      {profileLinks.map(({ asset, icon, href, label }) => (
        <a
          key={label}
          href={href}
          aria-label={label}
          title={label}
          {...externalLinkProps(href)}
          className="link-button hover-link"
        >
          <span
            className={`link-button-icon${asset ? ' is-asset' : ''}`}
            style={asset ? { '--link-icon': cssUrl(asset) } : undefined}
            aria-hidden="true"
          >
            {!asset && <Icon name={icon} fill />}
          </span>
        </a>
      ))}
    </div>
  )
}
