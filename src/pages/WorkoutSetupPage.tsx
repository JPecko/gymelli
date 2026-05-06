import { useState } from 'react'
import { useStartWorkoutSession } from '@/features/workouts/hooks/useStartWorkoutSession'
import { ExercisePicker } from '@/features/exercises/components/ExercisePicker'
import type { Exercise } from '@/features/exercises/exercises.types'
import { Button, BottomBar } from '@/shared/components'
import styles from './WorkoutSetupPage.module.scss'

export function WorkoutSetupPage() {
  const [selected, setSelected] = useState<Exercise[]>([])
  const { start, isStarting } = useStartWorkoutSession()

  function handleToggle(exercise: Exercise) {
    setSelected((prev) =>
      prev.find((e) => e.id === exercise.id)
        ? prev.filter((e) => e.id !== exercise.id)
        : [...prev, exercise],
    )
  }

  const ctaLabel = isStarting ? 'Starting...' : selected.length > 0 ? `Start (${selected.length})` : 'Start'

  return (
    <div className={styles.page}>
      {selected.length > 0 && (
        <div className={styles.pillsWrap}>
          <div className={styles.pills}>
            {selected.map((ex) => (
              <button
                key={ex.id}
                className={styles.pill}
                onClick={() => handleToggle(ex)}
              >
                {ex.name} ×
              </button>
            ))}
          </div>
        </div>
      )}

      <div className={styles.content}>
        <ExercisePicker
          selectedIds={selected.map((e) => e.id)}
          onToggle={handleToggle}
        />
      </div>

      <BottomBar>
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={() => start(null, selected.map((ex) => ({ exercise_id: ex.id })))}
          disabled={selected.length === 0 || isStarting}
        >
          {ctaLabel}
        </Button>
      </BottomBar>
    </div>
  )
}
