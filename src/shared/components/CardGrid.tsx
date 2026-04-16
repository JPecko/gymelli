import clsx from 'clsx'
import styles from './CardGrid.module.scss'

interface CardGridProps {
  children: React.ReactNode
  className?: string
}

export function CardGrid({ children, className }: CardGridProps) {
  return <div className={clsx(styles.grid, className)}>{children}</div>
}
