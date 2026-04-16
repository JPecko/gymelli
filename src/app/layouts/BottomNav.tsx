import { NavLink, useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import { HomeIcon, ProgramsIcon, ExercisesIcon, ProgressIcon, PlusIcon } from './NavIcons'
import styles from './BottomNav.module.scss'

const navItems = [
  { to: '/',          label: 'Home',      Icon: HomeIcon,      end: true },
  { to: '/templates', label: 'Programs',  Icon: ProgramsIcon,  end: false },
  { to: '/exercises', label: 'Exercises', Icon: ExercisesIcon, end: false },
  { to: '/history',   label: 'Progress',  Icon: ProgressIcon,  end: false },
]

export function BottomNav() {
  const navigate = useNavigate()

  return (
    <nav className={styles.nav}>
      {navItems.slice(0, 2).map(({ to, label, Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) => clsx(styles.item, isActive && styles.active)}
        >
          {({ isActive }) => (
            <>
              <span className={styles.icon}><Icon /></span>
              <span className={styles.label}>{label}</span>
              {isActive && <span className={styles.dot} aria-hidden />}
            </>
          )}
        </NavLink>
      ))}

      <button
        className={styles.fab}
        onClick={() => navigate('/workouts')}
        aria-label="Start workout"
      >
        <PlusIcon />
      </button>

      {navItems.slice(2).map(({ to, label, Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) => clsx(styles.item, isActive && styles.active)}
        >
          {({ isActive }) => (
            <>
              <span className={styles.icon}><Icon /></span>
              <span className={styles.label}>{label}</span>
              {isActive && <span className={styles.dot} aria-hidden />}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
