import { useNavigate } from 'react-router-dom'
import { ExercisesIcon, ProfileIcon } from './NavIcons'
import styles from './MoreSheet.module.scss'

interface MoreSheetProps {
  onClose: () => void
}

const items = [
  { to: '/exercises', label: 'Exercises', Icon: ExercisesIcon },
  { to: '/profile',   label: 'Profile',   Icon: ProfileIcon   },
]

export function MoreSheet({ onClose }: MoreSheetProps) {
  const navigate = useNavigate()

  function go(to: string) {
    onClose()
    navigate(to)
  }

  return (
    <>
      <div className={styles.backdrop} onClick={onClose} aria-hidden />
      <div className={styles.sheet} role="dialog" aria-label="More options">
        <div className={styles.handle} />
        {items.map(({ to, label, Icon }) => (
          <button key={to} className={styles.item} onClick={() => go(to)}>
            <span className={styles.icon}><Icon /></span>
            <span className={styles.label}>{label}</span>
          </button>
        ))}
      </div>
    </>
  )
}
