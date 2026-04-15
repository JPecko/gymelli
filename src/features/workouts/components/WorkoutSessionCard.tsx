import { useNavigate } from 'react-router-dom'
import type { SessionHistoryItem } from '../workouts.types'
import type { WorkoutScore } from '../hooks/useWorkoutScore'
import styles from './WorkoutSessionCard.module.scss'

interface WorkoutSessionCardProps {
  session: SessionHistoryItem
  score?: WorkoutScore
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

function formatDuration(seconds: number): string {
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

function formatExercises(names: string[]): string {
  if (names.length <= 3) return names.join(' · ')
  return `${names.slice(0, 3).join(' · ')} +${names.length - 3}`
}

export function WorkoutSessionCard({ session, score }: WorkoutSessionCardProps) {
  const navigate = useNavigate()

  return (
    <button
      className={styles.card}
      onClick={() => navigate(`/workouts/session/${session.id}/summary`)}
    >
      <div className={styles.top}>
        <span className={styles.date}>{formatDate(session.started_at)}</span>
        <span className={styles.duration}>{formatDuration(session.duration_seconds)}</span>
      </div>

      <p className={styles.exercises}>
        {session.exercise_names.length > 0
          ? formatExercises(session.exercise_names)
          : 'No exercises logged'}
      </p>

      <div className={styles.bottom}>
        <p className={styles.meta}>
          {session.exercise_names.length} exercise{session.exercise_names.length !== 1 ? 's' : ''}
          {session.total_sets > 0 && ` · ${session.total_sets} sets`}
        </p>
        {score != null && (
          <span className={styles.score} data-label={score.label}>
            {score.score} <span className={styles.scoreLabel}>{score.label}</span>
          </span>
        )}
      </div>
    </button>
  )
}
