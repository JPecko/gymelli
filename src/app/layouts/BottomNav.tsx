import { NavLink, useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import styles from './BottomNav.module.scss'

const navItems = [
  { to: '/',          label: 'Home',      icon: '⌂' },
  { to: '/templates', label: 'Workouts',  icon: '☰' },
  { to: '/exercises', label: 'Exercises', icon: '◈' },
  { to: '/history',   label: 'History',   icon: '◷' },
]

export function BottomNav() {
  const navigate = useNavigate()

  return (
    <nav className={styles.nav}>
      {navItems.slice(0, 2).map((item) => (
        <NavItem key={item.to} {...item} />
      ))}

      <button
        className={styles.startButton}
        onClick={() => navigate('/workouts')}
        aria-label="Start workout"
      >
        <span className={styles.startIcon}>+</span>
      </button>

      {navItems.slice(2).map((item) => (
        <NavItem key={item.to} {...item} />
      ))}
    </nav>
  )
}

function NavItem({ to, label, icon }: { to: string; label: string; icon: string }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) => clsx(styles.item, isActive && styles.active)}
    >
      <span className={styles.icon}>{icon}</span>
      <span className={styles.label}>{label}</span>
    </NavLink>
  )
}
