import { NavLink, useNavigate } from 'react-router-dom'
import clsx from 'clsx'
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
        <span className={styles.logoText}>Gymelli</span>
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
      </div>
    </aside>
  )
}
