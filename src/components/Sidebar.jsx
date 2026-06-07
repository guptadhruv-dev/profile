import { useEffect, useState } from 'react';
import SectionButton from './SectionButton';
import Divider from './Divider';
import Links from './Links';
import ThemeToggle from './ThemeToggle';
import name from '../assets/name.svg';

const avatarModules = import.meta.glob(
  '../assets/avatar.{png,jpg,jpeg,webp,svg,gif,avif}',
  { eager: true, import: 'default' }
);
const avatarSrc = Object.values(avatarModules)[0] ?? null;

const M            = 'var(--motion-duration) var(--motion-ease)';
const MOBILE_QUERY = '(max-width: 767px)';
const TOP_BTN_SIZE = 32;
const TOP_GAP      = 20;
const CONTENT_GAP  = 'clamp(12px, 2vh, 20px)';
const IDENTITY_MAX_WIDTH = 200;

function detectMobile() {
  return typeof window !== 'undefined' && window.matchMedia(MOBILE_QUERY).matches;
}

function fadeTransition(visible) {
  return `opacity ${M}, transform ${M}, visibility 0s linear ${visible ? '0s' : 'var(--motion-duration)'}`;
}

export default function Sidebar({ activeSection, onNavClick, sections = [] }) {
  const [isMobile,  setIsMobile]  = useState(detectMobile);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    const onChange = (e) => {
      setIsMobile(e.matches);
      setCollapsed(e.matches);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const toggleSidebar = () => setCollapsed((v) => !v);

  const navigate = (id) => {
    onNavClick(id);
    if (isMobile && !collapsed) setCollapsed(true);
  };

  const expandedWidth = isMobile ? '100vw' : 'var(--sidebar-width)';
  const sidebarWidth  = collapsed ? 'var(--sidebar-collapsed-width)' : expandedWidth;
  const morphTransition = `top ${M}, left ${M}, transform ${M}`;

  const PAD_X      = collapsed ? 15 : 25;
  const linksWidth = collapsed ? '100%' : `calc(${expandedWidth} - ${PAD_X * 2}px)`;
  const linksAlign = isMobile || collapsed ? 'center' : 'flex-start';

  return (
    <aside
      style={{
        width:           sidebarWidth,
        minWidth:        sidebarWidth,
        height:          '100vh',
        position:        'sticky',
        top:             0,
        backgroundColor: 'var(--color-bg-secondary)',
        display:         'flex',
        flexDirection:   'column',
        justifyContent:  'space-evenly',
        alignItems:      'center',
        padding:         `45px ${PAD_X}px`,
        flexShrink:      0,
        zIndex:          10,
        overflow:        'hidden',
        gap:             '25px',
        transition:      `width ${M}, min-width ${M}, padding ${M}`,
      }}
    >
      <div style={{
        position:   'relative',
        width:      '100%',
        height:     collapsed ? TOP_BTN_SIZE * 2 + TOP_GAP : TOP_BTN_SIZE,
        flexShrink: 0,
        transition: `height ${M}`,
      }}>
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{
            position:       'absolute',
            top:            0,
            left:           collapsed ? '50%' : 0,
            transform:      collapsed ? 'translateX(-50%)' : 'translateX(0)',
            display:        'inline-flex',
            alignItems:     'center',
            justifyContent: 'center',
            width:          TOP_BTN_SIZE,
            height:         TOP_BTN_SIZE,
            padding:        0,
            background:     'transparent',
            border:         'none',
            borderRadius:   6,
            cursor:         'pointer',
            color:          'var(--color-fg-secondary)',
            transition:     `${morphTransition}, color ${M}`,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-fg-primary)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-fg-secondary)'; }}
        >
          <span style={{ display: 'inline-grid', placeItems: 'center' }}>
            <span
              className="material-symbols-outlined"
              aria-hidden="true"
              style={{
                gridArea:              '1 / 1',
                fontSize:              '24px',
                lineHeight:            1,
                opacity:               collapsed ? 0 : 1,
                transform:             collapsed ? 'rotate(-90deg) scale(0.7)' : 'rotate(0deg) scale(1)',
                transition:            `opacity ${M}, transform ${M}`,
                fontVariationSettings: `'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24`,
              }}
            >
              chevron_left
            </span>
            <span
              className="material-symbols-outlined"
              aria-hidden="true"
              style={{
                gridArea:              '1 / 1',
                fontSize:              '24px',
                lineHeight:            1,
                opacity:               collapsed ? 1 : 0,
                transform:             collapsed ? 'rotate(0deg) scale(1)' : 'rotate(90deg) scale(0.7)',
                transition:            `opacity ${M}, transform ${M}`,
                fontVariationSettings: `'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24`,
              }}
            >
              menu
            </span>
          </span>
        </button>

        <div style={{
          position:   'absolute',
          top:        collapsed ? TOP_BTN_SIZE + TOP_GAP : 0,
          left:       collapsed ? '50%' : '100%',
          transform:  collapsed ? 'translateX(-50%)' : 'translateX(-100%)',
          transition: morphTransition,
        }}>
          <ThemeToggle />
        </div>
      </div>

      <div style={{
        position:  'relative',
        width:     '100%',
        flex:      1,
        minHeight: 0,
      }}>
        <div
          style={{
            position:       'absolute',
            inset:          0,
            display:        'flex',
            flexDirection:  'column',
            justifyContent: 'space-evenly',
            alignItems:     'center',
            gap:            CONTENT_GAP,
            opacity:        collapsed ? 0 : 1,
            transform:      collapsed ? 'translateY(-22px) scale(0.94)' : 'translateY(0) scale(1)',
            visibility:     collapsed ? 'hidden' : 'visible',
            pointerEvents:  collapsed ? 'none' : 'auto',
            overflow:       'hidden',
            transition:     fadeTransition(!collapsed),
          }}
        >
          <div
            style={{
              width:         '100%',
              maxWidth:      IDENTITY_MAX_WIDTH,
              minHeight:     0,
              flex:          '0 1 auto',
              display:       'flex',
              flexDirection: 'column',
              alignItems:    'center',
              gap:           CONTENT_GAP,
            }}
          >
            <div style={{
              width:           '100%',
              maxWidth:        '150px',
              aspectRatio:     '1/1',
              flexShrink:      0,
              borderRadius:    '14px',
              overflow:        'hidden',
              backgroundColor: avatarSrc ? 'transparent' : 'var(--color-fg-secondary)',
              opacity:         avatarSrc ? 1 : 0.15,
            }}>
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt="Dhruv Gupta"
                  style={{
                    width:     '100%',
                    height:    '100%',
                    objectFit: 'cover',
                    display:   'block',
                  }}
                />
              ) : null}
            </div>
            <div
              role="img"
              aria-label="Dhruv Gupta"
              style={{
                width:              '100%',
                maxWidth:           '150px',
                aspectRatio:        '172 / 96',
                backgroundColor:    'var(--color-fg-primary)',
                WebkitMaskImage:    `url(${name})`,
                maskImage:          `url(${name})`,
                WebkitMaskRepeat:   'no-repeat',
                maskRepeat:         'no-repeat',
                WebkitMaskPosition: 'center',
                maskPosition:       'center',
                WebkitMaskSize:     'contain',
                maskSize:           'contain',
              }}
            />
          </div>

          <Divider style={{ flexShrink: 0, width: '100%' }} />

          <nav
            style={{
              display:       'flex',
              flexDirection: 'column',
              alignItems:    'stretch',
              gap:           CONTENT_GAP,
              width:         '100%',
              flexShrink:    0,
            }}
          >
            {sections.map(({ id, label }) => (
              <SectionButton
                key={id}
                label={label}
                isActive={activeSection === id}
                onClick={() => navigate(id)}
                align={isMobile ? 'center' : 'left'}
              />
            ))}
          </nav>

          <Divider style={{ flexShrink: 0, width: '100%' }} />
        </div>

        <nav
          style={{
            position:       'absolute',
            inset:          0,
            display:        'flex',
            flexDirection:  'column',
            alignItems:     'center',
            justifyContent: 'center',
            gap:            CONTENT_GAP,
            width:          '100%',
            opacity:        collapsed ? 1 : 0,
            transform:      collapsed ? 'translateY(0) scale(1)' : 'translateY(22px) scale(0.94)',
            visibility:     collapsed ? 'visible' : 'hidden',
            pointerEvents:  collapsed ? 'auto' : 'none',
            overflow:       'hidden',
            transition:     fadeTransition(collapsed),
          }}
        >
          <Divider style={{ flexShrink: 0, width: '100%' }} />
          <div style={{
            display:        'flex',
            flexDirection:  'column',
            alignItems:     'center',
            justifyContent: 'center',
            gap:            CONTENT_GAP,
            width:          '100%',
            minHeight:      0,
            flex:           '0 1 auto',
          }}>
            {sections.map(({ id, label }) => (
              <SectionButton
                key={id}
                label={(label || id).charAt(0).toUpperCase()}
                isActive={activeSection === id}
                onClick={() => navigate(id)}
                align="center"
              />
            ))}
          </div>
          <Divider style={{ flexShrink: 0, width: '100%' }} />
        </nav>
      </div>

      <div style={{ width: linksWidth, alignSelf: linksAlign, flexShrink: 0 }}>
        <Links vertical={collapsed} center={isMobile || collapsed} />
      </div>
    </aside>
  );
}
