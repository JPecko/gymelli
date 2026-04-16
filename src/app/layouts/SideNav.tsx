import { useRef, useState } from 'react'
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
  { to: '/profile',   label: 'Profile',   Icon: ProfileIcon,   end: false },
]

export function SideNav() {
  const navigate = useNavigate()
  const navRef = useRef<HTMLElement>(null)
  const [scrolled, setScrolled] = useState(false)

  function handleScroll() {
    setScrolled((navRef.current?.scrollTop ?? 0) > 0)
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <img
          src="/gymelli-wordmark.svg"
          alt="Gymelli"
          className={styles.logoImage}
        />
        <p className={styles.version}>v{APP_VERSION}</p>
      </div>

      <div className={clsx(styles.navWrap, scrolled && styles.scrolled)}>
        <nav className={styles.nav} ref={navRef} onScroll={handleScroll}>
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
      </div>

      <div className={styles.footer}>
        <button
          className={styles.startButton}
          onClick={() => navigate('/workouts')}
        >
          <PlusIcon />
          Start Workout
        </button>
      </div>
    </aside>
  )
}
