import { useState } from 'react'
import { Button, ConfirmSheet } from '@/shared/components'
import { toSlug } from '@/features/exercises/exercises.utils'
import { SetRow } from './SetRow'
import type { SessionExerciseState } from '../hooks/useWorkoutSession'
import type { TrackingType } from '@/features/exercises/exercises.types'
import styles from './ExerciseBlock.module.scss'

interface ExerciseBlockProps {
  state: SessionExerciseState
  showPrevChevron?: boolean
  showNextChevron?: boolean
  onStartSet: (setIdx: number) => void
  onConfirmSet: (setIdx: number) => void
  onUpdateSet: (setIdx: number, field: Parameters<typeof SetRow>[0]['onUpdate'] extends (f: infer F, v: number | null) => void ? F : never, value: number | null) => void
  onAddSet: () => void
  onRemoveSet: (setIdx: number) => void
}

const COL1_LABEL: Record<TrackingType, string> = {
  weight_reps: 'KG',
  reps_only:   'KG',
  duration:    '—',
  distance:    'KM',
}

const COL2_LABEL: Record<TrackingType, string> = {
  weight_reps: 'REPS',
  reps_only:   'REPS',
  duration:    'SEC',
  distance:    '—',
}

export function ExerciseBlock({
  state, showPrevChevron, showNextChevron, onStartSet, onConfirmSet, onUpdateSet, onAddSet, onRemoveSet,
}: ExerciseBlockProps) {
  const { exercise, sets, previous_sets } = state
  const tracking = exercise.tracking_type
  const [pendingDeleteSetIdx, setPendingDeleteSetIdx] = useState<number | null>(null)
  const [imgFailed, setImgFailed] = useState(false)

  const prevSummary = previous_sets
    .slice(0, 5)
    .map((s) => {
      if (tracking === 'weight_reps') return `${s.weight_kg ?? '—'}×${s.reps ?? '—'}`
      if (tracking === 'reps_only')   return `${s.reps ?? '—'}`
      if (tracking === 'duration')    return s.duration_seconds != null ? `${s.duration_seconds}s` : '—'
      return s.distance_km != null ? `${s.distance_km}km` : '—'
    })
    .join('  ·  ')

  const completedCount = sets.filter((s) => s.is_completed).length
  const totalSets = sets.length

  return (
    <div className={styles.block}>
      {showPrevChevron && <span className={styles.chevronLeft} aria-hidden>‹</span>}
      {showNextChevron && <span className={styles.chevronRight} aria-hidden>›</span>}

      <div className={styles.header}>
        <div className={styles.headerTop}>
          <h2 className={styles.name}>{exercise.name}</h2>
          {completedCount > 0 && (
            <span className={styles.progress}>{completedCount}/{totalSets}</span>
          )}
        </div>
        <p className={styles.type}>{exercise.type}</p>
        {prevSummary && (
          <p className={styles.prevSummary}>
            <span className={styles.prevLabel}>Last </span>
            {prevSummary}
          </p>
        )}
        {tracking === 'reps_only' && (
          <p className={styles.bwHint}>Weight = effective body weight for volume scoring</p>
        )}
      </div>

      {imgFailed ? (
        <div className={styles.imgPlaceholder} aria-hidden="true">
          {exercise.name[0]}
        </div>
      ) : (
        <img
          className={styles.img}
          src={exercise.image_url ?? `/images/exercises/${toSlug(exercise.name)}.png`}
          alt={`${exercise.name} demonstration`}
          onError={() => setImgFailed(true)}
        />
      )}

      <div className={styles.setTable}>
        <div className={styles.tableHeader}>
          <span>#</span>
          <span>{COL1_LABEL[tracking]}</span>
          <span>{COL2_LABEL[tracking]}</span>
          <span />
          <span />
        </div>
        <div className={styles.setList}>
          {sets.map((set, i) => (
            <SetRow
              key={i}
              index={i}
              set={set}
              previousSet={previous_sets[i]}
              trackingType={tracking}
              onStart={() => onStartSet(i)}
              onConfirm={() => onConfirmSet(i)}
              onDelete={() => setPendingDeleteSetIdx(i)}
              onUpdate={(field, value) => onUpdateSet(i, field, value)}
            />
          ))}
        </div>
      </div>

      <Button variant="ghost" fullWidth className={styles.addSet} onClick={onAddSet}>
        + Add Set
      </Button>

      {pendingDeleteSetIdx !== null && (
        <ConfirmSheet
          message={`Remove set ${pendingDeleteSetIdx + 1}?`}
          confirmLabel="Remove"
          variant="destructive"
          onConfirm={() => {
            onRemoveSet(pendingDeleteSetIdx)
            setPendingDeleteSetIdx(null)
          }}
          onCancel={() => setPendingDeleteSetIdx(null)}
        />
      )}
    </div>
  )
}
