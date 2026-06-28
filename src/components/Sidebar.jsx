import { useEffect, useState } from 'react'
import SectionButton from './SectionButton'
import Divider from './Divider'
import Links from './Links'
import ThemeToggle from './ThemeToggle'
import Icon from './shortcodes/Icon'
import name from '../assets/name.svg'
import { M } from '../motion'

const avatarModules = import.meta.glob('../assets/avatar.{png,jpg,jpeg,webp,svg,gif,avif}', {
  eager: true,
  import: 'default',
})
const avatarSrc = Object.values(avatarModules)[0] ?? null

const MOBILE_QUERY = '(max-width: 767px)'
const SHORT_HEIGHT_QUERY = '(max-height: 38rem)'
const TOP_GAP = 20
const DRAWER_WIDTH = 'min(80vw, 300px)'
const IDENTITY_MEDIA_HEIGHT = 'clamp(7rem, 34vh, 15.5rem)'

function detectMobile() {
  return typeof window !== 'undefined' && window.matchMedia(MOBILE_QUERY).matches
}

function detectShortHeight() {
  return typeof window !== 'undefined' && window.matchMedia(SHORT_HEIGHT_QUERY).matches
}

function fadeTransition(visible) {
  return `opacity ${M}, transform ${M}, visibility 0s linear ${visible ? '0s' : 'var(--motion-duration)'}`
}

function NavList({ sections, activeSection, onNavClick, variant, isMobile }) {
  const iconOnly = variant === 'rail'
  return (
    <>
      <Divider style={{ flexShrink: 0, width: '100%' }} />
      <div className="sb-navlist"
          style={{ padding: '1.0rem 0' }}
      >
        {sections.map(({ id, label, vars }) => (
          <SectionButton
            key={id}
            label={label || id}
            icon={vars?.icon}
            iconOnly={iconOnly}
            isActive={activeSection === id}
            onClick={() => onNavClick(id)}
            align={iconOnly ? 'center' : isMobile ? 'center' : 'left'}
          />
        ))}
      </div>
      <Divider style={{ flexShrink: 0, width: '100%' }} />
    </>
  )
}

export default function Sidebar({ activeSection, onNavClick, onLayoutTransition, sections = [] }) {
  const [isMobile, setIsMobile] = useState(detectMobile)
  const [isShortHeight, setIsShortHeight] = useState(detectShortHeight)
  const [collapsed, setCollapsed] = useState(detectMobile)

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY)
    const onChange = (e) => {
      setIsMobile(e.matches)
      setCollapsed(e.matches)
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    const mq = window.matchMedia(SHORT_HEIGHT_QUERY)
    const onChange = (e) => setIsShortHeight(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const setCollapsedWithLayoutTransition = (value) => {
    onLayoutTransition?.()
    setCollapsed(value)
  }

  const toggleSidebar = () => {
    onLayoutTransition?.()
    setCollapsed((v) => !v)
  }

  const navigate = (id) => {
    onNavClick(id)
    if (isMobile && !collapsed) setCollapsedWithLayoutTransition(true)
  }

  const showRail = collapsed && !isMobile
  const sidebarWidth = isMobile
    ? DRAWER_WIDTH
    : collapsed
      ? 'var(--sidebar-collapsed-width)'
      : 'var(--sidebar-width)'
  const PAD_X = isMobile ? 22 : showRail ? 15 : 20

  return (
    <>
      {isMobile && (
        <button
          type="button"
          onClick={() => setCollapsedWithLayoutTransition(false)}
          aria-label="Open menu"
          className="sb-mobile-open"
          style={{
            opacity: collapsed ? 1 : 0,
            pointerEvents: collapsed ? 'auto' : 'none',
          }}
        >
          <Icon name="menu" style={{ fontSize: '1.5rem' }} />
        </button>
      )}

      {isMobile && (
        <div
          aria-hidden="true"
          onClick={() => setCollapsedWithLayoutTransition(true)}
          className="sb-mobile-backdrop"
          style={{
            opacity: collapsed ? 0 : 1,
            pointerEvents: collapsed ? 'none' : 'auto',
          }}
        />
      )}

      <aside
        className="sb-aside"
        style={{
          width: sidebarWidth,
          minWidth: sidebarWidth,
          position: isMobile ? 'fixed' : 'sticky',
          transform: isMobile && collapsed ? 'translateX(-100%)' : 'translateX(0)',
          padding: `45px ${PAD_X}px`,
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: showRail ? `calc(4rem + ${TOP_GAP}px)` : '2rem',
            flexShrink: 0,
            transition: `height ${M}`,
          }}
        >
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="sb-toggle-btn hover-fg"
            style={{
              left: showRail ? '50%' : 0,
              transform: showRail ? 'translateX(-50%)' : 'translateX(0)',
            }}
          >
            <span style={{ display: 'inline-grid', placeItems: 'center' }}>
              <Icon
                name="chevron_left"
                weight={400}
                className="sb-icon-crossfade"
                style={{
                  fontSize: '1.625rem',
                  opacity: showRail ? 0 : 1,
                  transform: showRail ? 'rotate(-90deg) scale(0.7)' : 'rotate(0deg) scale(1)',
                }}
              />
              <Icon
                name="menu"
                weight={400}
                className="sb-icon-crossfade"
                style={{
                  fontSize: '1.5rem',
                  opacity: showRail ? 1 : 0,
                  transform: showRail ? 'rotate(0deg) scale(1)' : 'rotate(90deg) scale(0.7)',
                }}
              />
            </span>
          </button>

          <div
            className="sb-theme-slot"
            style={{
              top: showRail ? `calc(2rem + ${TOP_GAP}px)` : 0,
              left: showRail ? '50%' : '100%',
              transform: showRail ? 'translateX(-50%)' : 'translateX(-100%)',
            }}
          >
            <ThemeToggle />
          </div>
        </div>

        <div className="sb-body-region">
          <div
            className="sb-panel sb-panel-expanded"
            style={{
              opacity: showRail ? 0 : 1,
              transform: showRail ? 'translateY(-22px) scale(0.94)' : 'translateY(0) scale(1)',
              visibility: showRail ? 'hidden' : 'visible',
              pointerEvents: showRail ? 'none' : 'auto',
              transition: fadeTransition(!showRail),
            }}
          >
            {!isShortHeight && (
              <div
                className="sb-identity"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  flexShrink: 1,
                  height: IDENTITY_MEDIA_HEIGHT,
                  maxHeight: '100%',
                  maxWidth: '12.5rem',
                  minHeight: 0,
                  gap: 'clamp(0.375rem, 1.25vh, 0.9rem)',
                }}
              >
                <div
                  className="sb-avatar"
                  style={{
                    opacity: avatarSrc ? 1 : 0.15,
                    flex: '172 1 0',
                    width: 'auto',
                    maxWidth: '100%',
                    minHeight: 0,
                    justifyContent: 'center',
                  }}
                >
                  {avatarSrc ? (
                    <img
                      src={avatarSrc}
                      alt="Dhruv Gupta"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                      }}
                    />
                  ) : null}
                </div>
                <div
                  role="img"
                  aria-label="Dhruv Gupta"
                  className="sb-name"
                  style={{
                    '--name-url': `url(${name})`,
                    flex: '96 1 0',
                    width: 'auto',
                    maxWidth: '100%',
                    minHeight: 0,
                  }}
                />
              </div>
            )}

            <nav className="sb-nav-expanded">
              <NavList
                sections={sections}
                activeSection={activeSection}
                onNavClick={navigate}
                variant="expanded"
                isMobile={isMobile}
              />
            </nav>
          </div>

          <nav
            className="sb-panel sb-panel-rail"
            style={{
              opacity: showRail ? 1 : 0,
              transform: showRail ? 'translateY(0) scale(1)' : 'translateY(22px) scale(0.94)',
              visibility: showRail ? 'visible' : 'hidden',
              pointerEvents: showRail ? 'auto' : 'none',
              transition: fadeTransition(showRail),
            }}
          >
            <NavList
              sections={sections}
              activeSection={activeSection}
              onNavClick={navigate}
              variant="rail"
              isMobile={isMobile}
            />
          </nav>
        </div>

        <div
          className="sb-links-slot"
          style={{
            height: showRail ? 'calc(5.5rem + 30px)' : '1.375rem',
          }}
        >
          <Links vertical={showRail} />
        </div>
      </aside>
    </>
  )
}
