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
  onStart: () => void
  onConfirm: () => void
  onDelete: () => void
  onUpdate: (field: keyof Pick<DraftSet, 'weight_kg' | 'reps' | 'duration_seconds' | 'distance_km'>, value: number | null) => void
}

function prevLabel(prev: ExerciseSet | undefined, tracking: TrackingType): string {
  if (!prev) return '—'
  if (tracking === 'weight_reps') return `${prev.weight_kg ?? '—'}×${prev.reps ?? '—'}`
  if (tracking === 'reps_only')   return prev.reps != null ? `${prev.reps}` : '—'
  if (tracking === 'duration')    return prev.duration_seconds != null ? `${prev.duration_seconds}s` : '—'
  return prev.distance_km != null ? `${prev.distance_km}km` : '—'
}

export function SetRow({ index, set, previousSet, trackingType, onStart, onConfirm, onDelete, onUpdate }: SetRowProps) {
  const isWeightReps = trackingType === 'weight_reps'
  const isRepsOnly   = trackingType === 'reps_only'
  const isDuration   = trackingType === 'duration'
  const isDistance   = trackingType === 'distance'

  const showWeightCol = isWeightReps || isRepsOnly || isDistance
  const isActive    = set.is_active && !set.is_completed
  const isCompleted = set.is_completed

  let actionBtn: React.ReactNode
  if (isCompleted) {
    actionBtn = (
      <IconButton size="sm" done disabled aria-label={`Set ${index + 1} done`}>✓</IconButton>
    )
  } else if (isActive) {
    actionBtn = (
      <IconButton size="sm" className={styles.doneBtn} onClick={onConfirm} aria-label={`Complete set ${index + 1}`}>✓</IconButton>
    )
  } else {
    actionBtn = (
      <IconButton size="sm" className={styles.startBtn} onClick={onStart} aria-label={`Start set ${index + 1}`}>▷</IconButton>
    )
  }

  return (
    <div className={clsx(styles.row, isActive && styles.active, isCompleted && styles.completed)} data-tracking={trackingType}>

      {/* # + prev stacked */}
      <div className={styles.indexCell}>
        <span className={clsx(styles.index, isCompleted && styles.indexDone, isActive && styles.indexActive)}>
          {index + 1}
        </span>
        <span className={styles.prev}>{prevLabel(previousSet, trackingType)}</span>
      </div>

      {showWeightCol ? (
        <StepperInput
          value={isDistance ? set.distance_km : set.weight_kg}
          onChange={(v) => onUpdate(isDistance ? 'distance_km' : 'weight_kg', v)}
          step={isRepsOnly ? 1 : isWeightReps ? 2.5 : 0.5}
          min={0}
          disabled={isCompleted}
          inputMode="decimal"
          aria-label={`Set ${index + 1} ${isDistance ? 'distance' : 'weight'}`}
        />
      ) : (
        <div className={styles.empty} />
      )}

      {(isWeightReps || isRepsOnly) ? (
        <StepperInput
          value={set.reps}
          onChange={(v) => onUpdate('reps', v)}
          step={1}
          min={0}
          disabled={isCompleted}
          inputMode="numeric"
          aria-label={`Set ${index + 1} reps`}
        />
      ) : isDuration ? (
        <StepperInput
          value={set.duration_seconds}
          onChange={(v) => onUpdate('duration_seconds', v)}
          step={5}
          min={0}
          disabled={isCompleted}
          inputMode="numeric"
          aria-label={`Set ${index + 1} duration`}
        />
      ) : (
        <div className={styles.empty} />
      )}

      {actionBtn}

      <button
        className={styles.deleteBtn}
        onClick={onDelete}
        aria-label={`Remove set ${index + 1}`}
        tabIndex={-1}
      >
        ×
      </button>
    </div>
  )
}
