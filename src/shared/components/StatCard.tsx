import clsx from 'clsx'
import styles from './StatCard.module.scss'

interface StatCardProps {
  label: string
  value: string | number
  unit?: string
  accent?: boolean
}

export function StatCard({ label, value, unit, accent = false }: StatCardProps) {
  return (
    <div className={styles.card}>
      <span className={clsx(styles.value, accent && styles.accent)}>
        {value}
        {unit && <span className={styles.unit}>{unit}</span>}
      </span>
      <span className={styles.label}>{label}</span>
    </div>
  )
}
