import { NavLink, useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import { APP_VERSION } from '@/shared/lib/version'
import styles from './SideNav.module.scss'

const navItems = [
  { to: '/',          label: 'Home',      icon: '⌂' },
  { to: '/templates', label: 'Workouts',  icon: '☰' },
  { to: '/exercises', label: 'Exercises', icon: '◈' },
  { to: '/history',   label: 'History',   icon: '◷' },
]

export function SideNav() {
  const navigate = useNavigate()

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <img
          src="/gymelli-wordmark.svg"
          alt="Gymelli"
          className={styles.logoImage}
        />
      </div>

      <nav className={styles.nav}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => clsx(styles.item, isActive && styles.active)}
          >
            <span className={styles.icon}>{item.icon}</span>
            <span className={styles.label}>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className={styles.footer}>
        <button
          className={styles.startButton}
          onClick={() => navigate('/workouts')}
        >
          <span>+</span>
          Start Workout
        </button>
        <p className={styles.version}>v{APP_VERSION}</p>
      </div>
    </aside>
  )
}
