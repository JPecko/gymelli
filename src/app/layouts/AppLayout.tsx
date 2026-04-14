import { Outlet, NavLink, useLocation, useMatches } from 'react-router-dom'
import { useRef, type CSSProperties } from 'react'
import { BottomNav } from './BottomNav'
import { MobileHeader } from './MobileHeader'
import { SideNav } from './SideNav'
import { ProfileIcon } from './NavIcons'
import { useTopbarState } from './useTopbarState'
import type { MobileHeaderConfig } from './mobileHeader.config'
import styles from './AppLayout.module.scss'

export function AppLayout() {
  const location = useLocation()
  const matches = useMatches()
  const scrollerRef = useRef<HTMLElement | null>(null)
  const current = [...matches].reverse().find((match) => {
    const handle = match.handle as { mobileHeader?: MobileHeaderConfig } | undefined
    return Boolean(handle?.mobileHeader)
  })
  const mobileHeader = (current?.handle as { mobileHeader?: MobileHeaderConfig } | undefined)?.mobileHeader
  const topbarState = useTopbarState({ pathname: location.pathname, scrollerRef })
  const stickyOffset = topbarState === 'floating' ? 'var(--mobile-topbar-total-height)' : '0px'
  const contentStyle = { ['--mobile-sticky-offset' as string]: stickyOffset } as CSSProperties

  return (
    <div className={styles.root}>
      <SideNav />
      {mobileHeader && topbarState === 'floating' && (
        <MobileHeader config={mobileHeader} floating />
      )}
      <NavLink
        to="/profile"
        className={({ isActive }) =>
          [styles.profileButton, isActive ? styles.profileButtonActive : ''].filter(Boolean).join(' ')
        }
        aria-label="Profile"
      >
        <ProfileIcon />
      </NavLink>
      <main className={styles.main} ref={scrollerRef}>
        <div className={styles.content} style={contentStyle}>
          {mobileHeader && topbarState === 'in-flow' && (
            <MobileHeader config={mobileHeader} />
          )}
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
