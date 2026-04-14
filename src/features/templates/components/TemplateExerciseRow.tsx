import { IconButton, StepperInput } from '@/shared/components'
import type { DraftExercise } from '../hooks/useTemplateEditor'
import styles from './TemplateExerciseRow.module.scss'

interface TemplateExerciseRowProps {
  draft: DraftExercise
  index: number
  total: number
  onMoveUp: () => void
  onMoveDown: () => void
  onRemove: () => void
  onUpdateDefault: (field: 'default_sets' | 'default_reps' | 'rest_seconds', value: number) => void
}

export function TemplateExerciseRow({
  draft,
  index,
  total,
  onMoveUp,
  onMoveDown,
  onRemove,
  onUpdateDefault,
}: TemplateExerciseRowProps) {
  return (
    <div className={styles.row}>
      <div className={styles.top}>
        <p className={styles.name}>{draft.exercise.name}</p>
        <div className={styles.actions}>
          <IconButton size="sm" onClick={onMoveUp} disabled={index === 0} aria-label="Move up">
            ↑
          </IconButton>
          <IconButton
            size="sm"
            onClick={onMoveDown}
            disabled={index === total - 1}
            aria-label="Move down"
          >
            ↓
          </IconButton>
          <IconButton size="sm" onClick={onRemove} aria-label="Remove exercise">
            ×
          </IconButton>
        </div>
      </div>

      <div className={styles.defaults}>
        <div className={styles.field}>
          <span className={styles.label}>Sets</span>
          <StepperInput
            value={draft.default_sets}
            onChange={(v) => onUpdateDefault('default_sets', v ?? 1)}
            step={1}
            min={1}
            inputMode="numeric"
            aria-label="Default sets"
          />
        </div>
        <div className={styles.field}>
          <span className={styles.label}>Reps</span>
          <StepperInput
            value={draft.default_reps}
            onChange={(v) => onUpdateDefault('default_reps', v ?? 1)}
            step={1}
            min={1}
            inputMode="numeric"
            aria-label="Default reps"
          />
        </div>
        <div className={styles.field}>
          <span className={styles.label}>Rest (s)</span>
          <StepperInput
            value={draft.rest_seconds}
            onChange={(v) => onUpdateDefault('rest_seconds', v ?? 0)}
            step={15}
            min={0}
            inputMode="numeric"
            aria-label="Rest seconds"
          />
        </div>
      </div>
    </div>
  )
}
