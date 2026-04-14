import type { ReactNode } from 'react'
import styles from './AuthCard.module.scss'

interface AuthCardProps {
  children: ReactNode
}

export function AuthCard({ children }: AuthCardProps) {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <img src="/gymelli-gold-stacked-logo.svg" alt="Gymelli" className={styles.logo} />
        </div>
        {children}
      </div>
    </div>
  )
}
