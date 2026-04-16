import { NavLink, useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import { APP_VERSION } from '@/shared/lib/version'
import { HomeIcon, ProgramsIcon, ExercisesIcon, ProgressIcon, ProfileIcon, PlusIcon } from './NavIcons'
import styles from './SideNav.module.scss'

const navItems = [
  { to: '/',          label: 'Home',      Icon: HomeIcon,      end: true },
  { to: '/templates', label: 'Programs',  Icon: ProgramsIcon,  end: false },
  { to: '/exercises', label: 'Exercises', Icon: ExercisesIcon, end: false },
  { to: '/history',   label: 'Progress',  Icon: ProgressIcon,  end: false },
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
        {navItems.map(({ to, label, Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => clsx(styles.item, isActive && styles.active)}
          >
            <span className={styles.icon}><Icon /></span>
            <span className={styles.label}>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className={styles.footer}>
        <button
          className={styles.startButton}
          onClick={() => navigate('/workouts')}
        >
          <PlusIcon />
          Start Workout
        </button>

        <NavLink
          to="/profile"
          className={({ isActive }) => clsx(styles.profileLink, isActive && styles.active)}
        >
          <span className={styles.icon}><ProfileIcon /></span>
          <span className={styles.label}>Profile</span>
        </NavLink>

        <p className={styles.version}>v{APP_VERSION}</p>
      </div>
    </aside>
  )
}
