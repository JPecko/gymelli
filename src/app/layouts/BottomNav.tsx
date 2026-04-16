import { NavLink, useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import { HomeIcon, ProgramsIcon, ProgressIcon, ProfileIcon, PlusIcon } from './NavIcons'
import styles from './BottomNav.module.scss'

const navLeft = [
  { to: '/',          label: 'Home',     Icon: HomeIcon,     end: true  },
  { to: '/templates', label: 'Programs', Icon: ProgramsIcon, end: false },
]
const navRight = [
  { to: '/history',  label: 'Progress', Icon: ProgressIcon, end: false },
  { to: '/profile',  label: 'Profile',  Icon: ProfileIcon,  end: false },
]

function NavItem({ to, label, Icon, end }: { to: string; label: string; Icon: React.FC; end: boolean }) {
  return (
    <NavLink
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
  )
}

export function BottomNav() {
  const navigate = useNavigate()

  return (
    <nav className={styles.nav}>
      {navLeft.map((item) => <NavItem key={item.to} {...item} />)}

      <button
        className={styles.fab}
        onClick={() => navigate('/workouts')}
        aria-label="Start workout"
      >
        <PlusIcon />
      </button>

      {navRight.map((item) => <NavItem key={item.to} {...item} />)}
    </nav>
  )
}
