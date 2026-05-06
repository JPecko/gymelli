import type { ReactNode } from 'react'
import styles from './BottomBar.module.scss'

interface BottomBarProps {
  children: ReactNode
}

export function BottomBar({ children }: BottomBarProps) {
  return (
    <div className={styles.bar}>
      <div className={styles.inner}>{children}</div>
    </div>
  )
}
