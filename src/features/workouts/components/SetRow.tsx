import clsx from 'clsx'
import { IconButton, StepperInput } from '@/shared/components'
import type { DraftSet } from '../hooks/useWorkoutSession'
import type { ExerciseSet } from '../workouts.types'
import type { TrackingType } from '@/features/exercises/exercises.types'
import styles from './SetRow.module.scss'

interface SetRowProps {
  index: number
  set: DraftSet
  previousSet: ExerciseSet | undefined
  trackingType: TrackingType
  onConfirm: () => void
  onUpdate: (field: keyof Pick<DraftSet, 'weight_kg' | 'reps' | 'duration_seconds' | 'distance_km'>, value: number | null) => void
}

function prevLabel(prev: ExerciseSet | undefined, tracking: TrackingType): string {
  if (!prev) return '—'
  if (tracking === 'weight_reps') return `${prev.weight_kg ?? '—'}×${prev.reps ?? '—'}`
  if (tracking === 'reps_only')   return prev.reps != null ? `${prev.reps}` : '—'
  if (tracking === 'duration')    return prev.duration_seconds != null ? `${prev.duration_seconds}s` : '—'
  return prev.distance_km != null ? `${prev.distance_km}km` : '—'
}

export function SetRow({ index, set, previousSet, trackingType, onConfirm, onUpdate }: SetRowProps) {
  const isWeightReps = trackingType === 'weight_reps'
  const isRepsOnly   = trackingType === 'reps_only'
  const isDuration   = trackingType === 'duration'
  const isDistance   = trackingType === 'distance'

  return (
    <div className={clsx(styles.row, set.is_completed && styles.completed)} data-tracking={trackingType}>
      <span className={styles.index}>{index + 1}</span>

      <span className={styles.prev}>{prevLabel(previousSet, trackingType)}</span>

      {(isWeightReps || isDistance) && (
        <StepperInput
          value={isWeightReps ? set.weight_kg : set.distance_km}
          onChange={(v) => onUpdate(isWeightReps ? 'weight_kg' : 'distance_km', v)}
          step={isWeightReps ? 2.5 : 0.5}
          min={0}
          disabled={set.is_completed}
          inputMode="decimal"
          aria-label={`Set ${index + 1} ${isWeightReps ? 'weight' : 'distance'}`}
        />
      )}

      {isRepsOnly && <div className={styles.empty} />}

      {isDuration && <div className={styles.empty} />}

      {(isWeightReps || isRepsOnly) && (
        <StepperInput
          value={isWeightReps ? set.reps : set.reps}
          onChange={(v) => onUpdate('reps', v)}
          step={1}
          min={0}
          disabled={set.is_completed}
          inputMode="numeric"
          aria-label={`Set ${index + 1} reps`}
        />
      )}

      {isDuration && (
        <StepperInput
          value={set.duration_seconds}
          onChange={(v) => onUpdate('duration_seconds', v)}
          step={5}
          min={0}
          disabled={set.is_completed}
          inputMode="numeric"
          aria-label={`Set ${index + 1} duration`}
        />
      )}

      {isDistance && <div className={styles.empty} />}

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
