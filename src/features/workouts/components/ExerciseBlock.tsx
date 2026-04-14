import { Button, SwipeableItem } from '@/shared/components'
import { SetRow } from './SetRow'
import type { SessionExerciseState } from '../hooks/useWorkoutSession'
import styles from './ExerciseBlock.module.scss'

interface ExerciseBlockProps {
  state: SessionExerciseState
  onConfirmSet: (setIdx: number) => void
  onUpdateSet: (setIdx: number, field: 'weight_kg' | 'reps', value: number | null) => void
  onAddSet: () => void
  onRemoveSet: (setIdx: number) => void
}

export function ExerciseBlock({ state, onConfirmSet, onUpdateSet, onAddSet, onRemoveSet }: ExerciseBlockProps) {
  const { exercise, sets, previous_sets } = state

  const prevSummary = previous_sets
    .slice(0, 5)
    .map((s) => `${s.weight_kg ?? '—'}×${s.reps ?? '—'}`)
    .join('  ·  ')

  return (
    <div className={styles.block}>
      <div className={styles.header}>
        <h2 className={styles.name}>{exercise.name}</h2>
        <p className={styles.type}>{exercise.type}</p>
        {prevSummary && (
          <p className={styles.prevSummary}>
            <span className={styles.prevLabel}>Last </span>
            {prevSummary}
          </p>
        )}
      </div>

      <div className={styles.setTable}>
        <div className={styles.tableHeader}>
          <span>#</span>
          <span>PREV</span>
          <span>KG</span>
          <span>REPS</span>
          <span />
        </div>
        <div className={styles.setList}>
          {sets.map((set, i) => (
            <SwipeableItem key={i} onDelete={() => onRemoveSet(i)} deleteLabel={`Remove set ${i + 1}`}>
              <SetRow
                index={i}
                set={set}
                previousSet={previous_sets[i]}
                onConfirm={() => onConfirmSet(i)}
                onUpdate={(field, value) => onUpdateSet(i, field, value)}
              />
            </SwipeableItem>
          ))}
        </div>
      </div>

      <Button variant="ghost" fullWidth className={styles.addSet} onClick={onAddSet}>
        + Add Set
      </Button>
    </div>
  )
}
