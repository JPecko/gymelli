import { Outlet } from 'react-router-dom'
import { BottomNav } from './BottomNav'
import { SideNav } from './SideNav'
import styles from './AppLayout.module.scss'

export function AppLayout() {
  return (
    <div className={styles.root}>
      <SideNav />
      <main className={styles.main}>
        <div className={styles.content}>
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
