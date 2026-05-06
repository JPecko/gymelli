import { useNavigate } from 'react-router-dom'
import { useStartWorkoutSession } from '@/features/workouts/hooks/useStartWorkoutSession'
import { Button } from '@/shared/components'
import type { TemplateListItem } from '../templates.types'
import styles from './TemplateCard.module.scss'

interface TemplateCardProps {
  template: TemplateListItem
}

export function TemplateCard({ template }: TemplateCardProps) {
  const navigate = useNavigate()
  const { start, isStarting } = useStartWorkoutSession()

  const sorted = [...template.workout_template_exercises].sort(
    (a, b) => a.order_index - b.order_index,
  )
  const exerciseNames = sorted.map((te) => te.exercises?.name ?? '').filter(Boolean)
  const preview =
    exerciseNames.slice(0, 3).join(', ') +
    (exerciseNames.length > 3 ? ` +${exerciseNames.length - 3}` : '')

  function handleStart(e: React.MouseEvent) {
    e.stopPropagation()
    start(template.id, sorted.map((te) => ({
      exercise_id: te.exercise_id,
      rest_seconds: te.rest_seconds,
      default_sets: te.default_sets,
      default_reps: te.default_reps,
    })))
  }

  return (
    <div
      className={styles.card}
      onClick={() => navigate(`/templates/${template.id}/edit`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/templates/${template.id}/edit`)}
    >
      <div className={styles.info}>
        <p className={styles.name}>{template.name}</p>
        {preview && <p className={styles.preview}>{preview}</p>}
        <p className={styles.count}>
          {exerciseNames.length} exercise{exerciseNames.length !== 1 ? 's' : ''}
        </p>
      </div>
      <Button variant="primary" size="sm" onClick={handleStart} disabled={isStarting}>
        {isStarting ? '...' : 'Start'}
      </Button>
    </div>
  )
}
