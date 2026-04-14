import type { PersonalRecord } from '../history.types'
import styles from './PRItem.module.scss'

interface PRItemProps {
  pr: PersonalRecord
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

export function PRItem({ pr }: PRItemProps) {
  const setLabel = pr.reps ? `${pr.weight_kg} kg × ${pr.reps}` : `${pr.weight_kg} kg`

  return (
    <div className={styles.row}>
      <span className={styles.name}>{pr.exercise_name}</span>
      <span className={styles.set}>{setLabel}</span>
      <span className={styles.date}>{formatDate(pr.set_date)}</span>
    </div>
  )
}
