import type { PersonalRecord } from '../history.types'
import { formatDateShort } from '@/shared/lib/formatters'
import styles from './PRItem.module.scss'

interface PRItemProps {
  pr: PersonalRecord
}

export function PRItem({ pr }: PRItemProps) {
  const setLabel = pr.reps ? `${pr.weight_kg} kg × ${pr.reps}` : `${pr.weight_kg} kg`

  return (
    <div className={styles.row}>
      <span className={styles.name}>{pr.exercise_name}</span>
      <span className={styles.set}>{setLabel}</span>
      <span className={styles.date}>{formatDateShort(pr.set_date)}</span>
    </div>
  )
}
