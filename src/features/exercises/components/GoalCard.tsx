import type { ExerciseGoal } from '../exercises.types'
import type { TrackingType } from '../exercises.types'
import { formatDate, formatSetDuration } from '@/shared/lib/formatters'
import styles from './GoalCard.module.scss'

interface GoalCardProps {
  goal: ExerciseGoal
  tracking: TrackingType
  onEdit: () => void
  onRemove: () => void
}

export function GoalCard({ goal, tracking, onEdit, onRemove }: GoalCardProps) {
  const parts: string[] = []
  if (tracking === 'weight_reps' && goal.target_weight_kg != null) parts.push(`${goal.target_weight_kg} kg`)
  if ((tracking === 'weight_reps' || tracking === 'reps_only') && goal.target_reps != null) parts.push(`${goal.target_reps} reps`)
  if (tracking === 'duration' && goal.target_duration_seconds != null) parts.push(formatSetDuration(goal.target_duration_seconds))
  if (tracking === 'distance' && goal.target_distance_km != null) parts.push(`${goal.target_distance_km} km`)
  if (goal.target_date) parts.push(`by ${formatDate(goal.target_date)}`)

  return (
    <div className={styles.card}>
      <p className={styles.value}>{parts.join(' · ') || '—'}</p>
      {goal.note && <p className={styles.note}>{goal.note}</p>}
      <div className={styles.actions}>
        <button className={styles.action} onClick={onEdit}>Edit</button>
        <button className={styles.action} data-danger onClick={onRemove}>Remove</button>
      </div>
    </div>
  )
}
