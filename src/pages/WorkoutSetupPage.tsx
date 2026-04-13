import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { startSession, addSessionExercise } from '@/features/workouts'
import { ExercisePicker } from '@/features/workouts/components/ExercisePicker'
import type { Exercise } from '@/features/exercises/exercises.types'
import { Button } from '@/shared/components'
import styles from './WorkoutSetupPage.module.scss'

export function WorkoutSetupPage() {
  const navigate = useNavigate()
  const [selected, setSelected] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(false)

  function handleToggle(exercise: Exercise) {
    setSelected((prev) =>
      prev.find((e) => e.id === exercise.id)
        ? prev.filter((e) => e.id !== exercise.id)
        : [...prev, exercise],
    )
  }

  async function handleStart() {
    if (selected.length === 0 || loading) return
    setLoading(true)
    try {
      const session = await startSession(null)
      await Promise.all(selected.map((ex, i) => addSessionExercise(session.id, ex.id, i)))
      navigate(`/workouts/session/${session.id}`)
    } catch {
      setLoading(false)
    }
  }

  const ctaLabel = loading
    ? 'Starting...'
    : selected.length > 0
      ? `Start (${selected.length})`
      : 'Start'

  return (
    <div className={styles.page}>
      {/* ── Header ──────────────────────────────────────────────── */}
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/workouts')}>
          ← Back
        </button>
        <h1 className={styles.title}>New Workout</h1>
        <Button
          variant="primary"
          size="sm"
          onClick={handleStart}
          disabled={selected.length === 0 || loading}
        >
          {ctaLabel}
        </Button>
      </header>

      {/* ── Selected pills ──────────────────────────────────────── */}
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

      {/* ── Exercise picker ─────────────────────────────────────── */}
      <div className={styles.content}>
        <ExercisePicker
          selectedIds={selected.map((e) => e.id)}
          onToggle={handleToggle}
        />
      </div>
    </div>
  )
}
