import { Outlet, useMatches } from 'react-router-dom'
import { BottomNav } from './BottomNav'
import { MobileHeader } from './MobileHeader'
import { SideNav } from './SideNav'
import type { MobileHeaderConfig } from './mobileHeader.config'
import styles from './AppLayout.module.scss'

export function AppLayout() {
  const matches = useMatches()
  const mobileHeader = [...matches]
    .reverse()
    .map((m) => (m.handle as { mobileHeader?: MobileHeaderConfig } | undefined)?.mobileHeader)
    .find((h): h is MobileHeaderConfig => h !== undefined)

  return (
    <div className={styles.root}>
      <SideNav />
      <main className={styles.main}>
        <div className={styles.content}>
          <MobileHeader config={mobileHeader} />
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
