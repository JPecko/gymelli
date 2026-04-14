import { Outlet, NavLink } from 'react-router-dom'
import { BottomNav } from './BottomNav'
import { SideNav } from './SideNav'
import { ProfileIcon } from './NavIcons'
import styles from './AppLayout.module.scss'

export function AppLayout() {
  return (
    <div className={styles.root}>
      <SideNav />
      <NavLink
        to="/profile"
        className={({ isActive }) =>
          [styles.profileButton, isActive ? styles.profileButtonActive : ''].filter(Boolean).join(' ')
        }
        aria-label="Profile"
      >
        <ProfileIcon />
      </NavLink>
      <main className={styles.main}>
        <div className={styles.content}>
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
