import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import SectionButton from './section-button'
import Links from './profile-links'
import ThemeToggle from './theme-toggle'
import Icon from './shortcodes/icon-shortcode'
import { proxyProfileAssetUrl } from '../lib/proxy'
import { useCssFlag, useMediaQuery } from '../lib/media'
import { joinClassNames } from '../lib/class-names'

const avatarUrl = proxyProfileAssetUrl('media/profile.png')
const mobileCssFlag = '--is-mobile'
const shortHeightQuery = '(max-height: 38rem)'
const sidebarIdentifier = 'profile-sidebar'

function NavigationList({ sections, activeSection, onNavClick, iconOnly, isMobile }) {
  return (
    <>
      <div className="divider" />
      <div className="sb-navlist">
        {sections.map(({ id, label, vars }) => (
          <SectionButton
            key={id}
            label={label || id}
            icon={vars?.icon}
            iconOnly={iconOnly}
            isActive={activeSection === id}
            onClick={() => onNavClick(id)}
            align={iconOnly || isMobile ? 'center' : 'left'}
          />
        ))}
      </div>
      <div className="divider" />
    </>
  )
}

function numericCssValue(value) {
  const numericValue = Number.parseFloat(value)
  return Number.isFinite(numericValue) ? numericValue : 0
}

export default function Sidebar({ activeSection, onNavClick, sections = [] }) {
  const isMobile = useCssFlag(mobileCssFlag)
  const hasShortHeight = useMediaQuery(shortHeightQuery)
  const [isCollapsed, setIsCollapsed] = useState(isMobile)
  const [contentWidth, setContentWidth] = useState(0)
  const [hasAvatarError, setHasAvatarError] = useState(false)
  const sidebarRef = useRef(null)
  const expandedNavigationRef = useRef(null)
  const railNavigationRef = useRef(null)
  const mobileOpenButtonRef = useRef(null)
  const sidebarToggleButtonRef = useRef(null)

  useEffect(() => {
    setIsCollapsed(isMobile)
  }, [isMobile])

  useEffect(() => {
    if (!isMobile || isCollapsed) return undefined
    sidebarToggleButtonRef.current?.focus()

    const handleKeyDown = (event) => {
      if (event.key !== 'Escape') return
      setIsCollapsed(true)
      mobileOpenButtonRef.current?.focus()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isCollapsed, isMobile])

  const navigate = (sectionId) => {
    onNavClick(sectionId)
    if (isMobile) setIsCollapsed(true)
  }

  const showRail = isCollapsed && !isMobile
  const sidebarClassName = joinClassNames(
    'sb-aside',
    isMobile && 'is-mobile',
    showRail && 'is-collapsed',
    isMobile && isCollapsed && 'is-hidden',
  )

  useLayoutEffect(() => {
    const sidebar = sidebarRef.current
    const navigation = (showRail ? railNavigationRef : expandedNavigationRef).current
    if (!sidebar || !navigation) return undefined

    const updateWidth = () => {
      const navigationList = navigation.querySelector('.sb-navlist')
      const navigationStyle = navigationList ? getComputedStyle(navigationList) : null
      const navigationWidth = navigationList
        ? navigationList.getBoundingClientRect().width +
          numericCssValue(navigationStyle.marginLeft) +
          numericCssValue(navigationStyle.marginRight)
        : 0
      const controlsWidth =
        sidebar.querySelector('.sb-toggle-btn')?.getBoundingClientRect().width ?? 0
      const sidebarStyle = getComputedStyle(sidebar)
      const horizontalPadding =
        numericCssValue(sidebarStyle.paddingLeft) + numericCssValue(sidebarStyle.paddingRight)

      setContentWidth(Math.ceil(Math.max(navigationWidth, controlsWidth) + horizontalPadding))
    }

    if (typeof ResizeObserver === 'function') {
      const resizeObserver = new ResizeObserver(updateWidth)
      resizeObserver.observe(navigation)
      updateWidth()
      return () => resizeObserver.disconnect()
    }

    window.addEventListener('resize', updateWidth)
    updateWidth()
    return () => window.removeEventListener('resize', updateWidth)
  }, [sections, showRail])

  const toggleLabel = isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'

  return (
    <>
      {isMobile && (
        <button
          ref={mobileOpenButtonRef}
          type="button"
          onClick={() => setIsCollapsed(false)}
          aria-label="Open navigation"
          aria-controls={sidebarIdentifier}
          aria-expanded={!isCollapsed}
          className={joinClassNames('sb-mobile-open', isCollapsed && 'is-visible')}
        >
          <Icon name="menu" size="1.5rem" />
        </button>
      )}

      <aside
        id={sidebarIdentifier}
        ref={sidebarRef}
        className={sidebarClassName}
        aria-hidden={isMobile && isCollapsed ? 'true' : undefined}
        inert={isMobile && isCollapsed ? '' : undefined}
        style={contentWidth ? { '--sb-content-width': `${contentWidth}px` } : undefined}
      >
        <div className={joinClassNames('sb-top', showRail && 'is-rail')}>
          <button
            ref={sidebarToggleButtonRef}
            type="button"
            onClick={() => {
              setIsCollapsed((currentValue) => !currentValue)
              if (isMobile) mobileOpenButtonRef.current?.focus()
            }}
            aria-label={toggleLabel}
            title={toggleLabel}
            aria-controls={sidebarIdentifier}
            aria-expanded={!isCollapsed}
            className="sb-toggle-btn hover-fg"
          >
            <span className="sb-toggle-icons">
              <Icon
                name="chevron_left"
                weight={400}
                size="1.65em"
                className="sb-icon-crossfade sb-icon-open"
              />
              <Icon name="menu" weight={400} className="sb-icon-crossfade sb-icon-rail" />
            </span>
          </button>

          <div className="sb-theme-slot">
            <ThemeToggle />
          </div>
        </div>

        <div className="sb-body-region">
          <div
            ref={expandedNavigationRef}
            className={joinClassNames('sb-panel sb-panel-expanded', !showRail && 'is-visible')}
            aria-hidden={showRail ? 'true' : undefined}
            inert={showRail ? '' : undefined}
          >
            {!hasShortHeight && !hasAvatarError && avatarUrl && (
              <div className="sb-identity">
                <div className="sb-avatar">
                  <img src={avatarUrl} alt="Dhruv Gupta" onError={() => setHasAvatarError(true)} />
                </div>
              </div>
            )}

            <nav className="sb-nav-expanded" aria-label="Profile sections">
              <NavigationList
                sections={sections}
                activeSection={activeSection}
                onNavClick={navigate}
                iconOnly={false}
                isMobile={isMobile}
              />
            </nav>
          </div>

          <nav
            ref={railNavigationRef}
            className={joinClassNames('sb-panel sb-panel-rail', showRail && 'is-visible')}
            aria-label="Profile sections"
            aria-hidden={!showRail ? 'true' : undefined}
            inert={!showRail ? '' : undefined}
          >
            <NavigationList
              sections={sections}
              activeSection={activeSection}
              onNavClick={navigate}
              iconOnly
              isMobile={isMobile}
            />
          </nav>
        </div>

        <div className={joinClassNames('sb-links-slot', showRail && 'is-rail')}>
          <div
            className={joinClassNames('sb-links-panel', !showRail && 'is-visible')}
            aria-hidden={showRail ? 'true' : undefined}
            inert={showRail ? '' : undefined}
          >
            <Links />
          </div>
          <div
            className={joinClassNames('sb-links-panel', showRail && 'is-visible')}
            aria-hidden={!showRail ? 'true' : undefined}
            inert={!showRail ? '' : undefined}
          >
            <Links vertical />
          </div>
        </div>
      </aside>
    </>
  )
}
