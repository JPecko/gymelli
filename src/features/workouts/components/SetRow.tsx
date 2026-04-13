import clsx from 'clsx'
import { IconButton } from '@/shared/components'
import type { DraftSet } from '../hooks/useWorkoutSession'
import type { ExerciseSet } from '../workouts.types'
import styles from './SetRow.module.scss'

interface SetRowProps {
  index: number
  set: DraftSet
  previousSet: ExerciseSet | undefined
  onConfirm: () => void
  onUpdate: (field: 'weight_kg' | 'reps', value: number) => void
}

export function SetRow({ index, set, previousSet, onConfirm, onUpdate }: SetRowProps) {
  const prevLabel = previousSet
    ? `${previousSet.weight_kg ?? '—'}×${previousSet.reps ?? '—'}`
    : '—'

  return (
    <div className={clsx(styles.row, set.is_completed && styles.completed)}>
      <span className={styles.index}>{index + 1}</span>

      <span className={styles.prev}>{prevLabel}</span>

      <input
        type="number"
        className={clsx(styles.field, set.is_completed && styles.fieldDone)}
        value={set.weight_kg ?? ''}
        onChange={(e) => onUpdate('weight_kg', parseFloat(e.target.value))}
        disabled={set.is_completed}
        placeholder="—"
        min={0}
        step={2.5}
        inputMode="decimal"
        aria-label={`Set ${index + 1} weight`}
      />

      <input
        type="number"
        className={clsx(styles.field, set.is_completed && styles.fieldDone)}
        value={set.reps ?? ''}
        onChange={(e) => onUpdate('reps', parseInt(e.target.value, 10))}
        disabled={set.is_completed}
        placeholder="—"
        min={0}
        step={1}
        inputMode="numeric"
        aria-label={`Set ${index + 1} reps`}
      />

      <IconButton
        done={set.is_completed}
        onClick={onConfirm}
        disabled={set.is_completed}
        aria-label={`Complete set ${index + 1}`}
      >
        ✓
      </IconButton>
    </div>
  )
}
