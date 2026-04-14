import clsx from 'clsx'
import { IconButton, StepperInput } from '@/shared/components'
import type { DraftSet } from '../hooks/useWorkoutSession'
import type { ExerciseSet } from '../workouts.types'
import styles from './SetRow.module.scss'

interface SetRowProps {
  index: number
  set: DraftSet
  previousSet: ExerciseSet | undefined
  onConfirm: () => void
  onUpdate: (field: 'weight_kg' | 'reps', value: number | null) => void
}

export function SetRow({ index, set, previousSet, onConfirm, onUpdate }: SetRowProps) {
  const prevLabel = previousSet
    ? `${previousSet.weight_kg ?? '—'}×${previousSet.reps ?? '—'}`
    : '—'

  return (
    <div className={clsx(styles.row, set.is_completed && styles.completed)}>
      <span className={styles.index}>{index + 1}</span>

      <span className={styles.prev}>{prevLabel}</span>

      <StepperInput
        value={set.weight_kg}
        onChange={(v) => onUpdate('weight_kg', v)}
        step={2.5}
        min={0}
        disabled={set.is_completed}
        inputMode="decimal"
        aria-label={`Set ${index + 1} weight`}
      />

      <StepperInput
        value={set.reps}
        onChange={(v) => onUpdate('reps', v)}
        step={1}
        min={0}
        disabled={set.is_completed}
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
