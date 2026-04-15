import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { startSession, addSessionExercise } from '@/features/workouts'
import { Button } from '@/shared/components'
import type { TemplateListItem } from '../templates.types'
import styles from './TemplateCard.module.scss'

interface TemplateCardProps {
  template: TemplateListItem
}

export function TemplateCard({ template }: TemplateCardProps) {
  const navigate = useNavigate()
  const [isStarting, setIsStarting] = useState(false)

  const sorted = [...template.workout_template_exercises].sort(
    (a, b) => a.order_index - b.order_index,
  )
  const exerciseNames = sorted.map((te) => te.exercises?.name ?? '').filter(Boolean)
  const preview =
    exerciseNames.slice(0, 3).join(', ') +
    (exerciseNames.length > 3 ? ` +${exerciseNames.length - 3}` : '')

  async function handleStart(e: React.MouseEvent) {
    e.stopPropagation()
    if (isStarting) return
    setIsStarting(true)
    try {
      const session = await startSession(template.id)
      await Promise.all(
        sorted.map((te, i) => addSessionExercise(session.id, te.exercise_id, i, te.rest_seconds)),
      )
      const templateDefaults = Object.fromEntries(
        sorted.map((te) => [te.exercise_id, { sets: te.default_sets, reps: te.default_reps }]),
      )
      navigate(`/workouts/session/${session.id}`, { state: { templateDefaults } })
    } catch {
      setIsStarting(false)
    }
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
