import { Outlet, useLocation, useMatches } from 'react-router-dom'
import { useRef, type CSSProperties } from 'react'
import { BottomNav } from './BottomNav'
import { MobileHeader } from './MobileHeader'
import { SideNav } from './SideNav'
import { useTopbarState } from './useTopbarState'
import type { MobileHeaderConfig } from './mobileHeader.config'
import styles from './AppLayout.module.scss'

export function AppLayout() {
  const location = useLocation()
  const matches = useMatches()
  const scrollerRef = useRef<HTMLElement | null>(null)
  const mobileHeader = [...matches]
    .reverse()
    .map((m) => (m.handle as { mobileHeader?: MobileHeaderConfig } | undefined)?.mobileHeader)
    .find((h): h is MobileHeaderConfig => h !== undefined)
  const topbarState = useTopbarState({ pathname: location.pathname, scrollerRef })
  const stickyOffset = topbarState === 'floating' ? 'var(--mobile-topbar-total-height)' : '0px'
  const contentStyle = { ['--mobile-sticky-offset' as string]: stickyOffset } as CSSProperties

  return (
    <div className={styles.root}>
      <SideNav />
      {topbarState === 'floating' && (
        <MobileHeader config={mobileHeader} floating />
      )}
      <main className={styles.main} ref={scrollerRef}>
        <div className={styles.content} style={contentStyle}>
          {topbarState === 'in-flow' && (
            <MobileHeader config={mobileHeader} />
          )}
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
