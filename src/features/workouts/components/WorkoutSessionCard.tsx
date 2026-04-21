import { useNavigate } from 'react-router-dom'
import { ScoreRing } from '@/shared/components'
import { formatDateCard, formatDuration } from '@/shared/lib/formatters'
import type { SessionHistoryItem } from '../workouts.types'
import type { WorkoutScore } from '../hooks/useWorkoutScore'
import styles from './WorkoutSessionCard.module.scss'

interface WorkoutSessionCardProps {
  session: SessionHistoryItem
  score?: WorkoutScore
  scoreSize?: number
}

function formatExercises(names: string[]): string {
  if (names.length <= 3) return names.join(' · ')
  return `${names.slice(0, 3).join(' · ')} +${names.length - 3}`
}

export function WorkoutSessionCard({ session, score, scoreSize = 52 }: WorkoutSessionCardProps) {
  const navigate = useNavigate()

  return (
    <button
      className={styles.card}
      onClick={() => navigate(`/workouts/session/${session.id}/summary`)}
    >
      <div className={styles.main}>
        <div className={styles.top}>
          <span className={styles.date}>{formatDateCard(session.started_at)}</span>
          <span className={styles.duration}>{formatDuration(session.duration_seconds)}</span>
        </div>

        <p className={styles.exercises}>
          {session.exercise_names.length > 0
            ? formatExercises(session.exercise_names)
            : 'No exercises logged'}
        </p>

        <p className={styles.meta}>
          {session.exercise_names.length} exercise{session.exercise_names.length !== 1 ? 's' : ''}
          {session.total_sets > 0 && ` · ${session.total_sets} sets`}
        </p>
      </div>

      {score != null && (
        <div className={styles.scoreCol}>
          <ScoreRing score={score.score} label={score.label} size={scoreSize} />
        </div>
      )}
    </button>
  )
}
