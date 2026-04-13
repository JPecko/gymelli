import clsx from 'clsx'
import styles from './Badge.module.scss'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'gold'
}

export function Badge({ children, variant = 'default' }: BadgeProps) {
  return (
    <span className={clsx(styles.badge, variant === 'gold' && styles.gold)}>
      {children}
    </span>
  )
}
