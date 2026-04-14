import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import { useWorkoutSession } from '@/features/workouts/hooks/useWorkoutSession'
import { getSessionById } from '@/features/workouts'
import { useElapsedTime } from '@/shared/hooks/useElapsedTime'
import { ExerciseBlock } from '@/features/workouts/components/ExerciseBlock'
import { RestTimer } from '@/features/workouts/components/RestTimer'
import { Button, IconButton } from '@/shared/components'
import type { WorkoutSession } from '@/features/workouts'
import styles from './WorkoutSessionPage.module.scss'

export function WorkoutSessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const [session, setSession] = useState<WorkoutSession | null>(null)

  useEffect(() => {
    if (!sessionId) return
    getSessionById(sessionId).then(setSession)
  }, [sessionId])

  if (!session) {
    return <div className={styles.loading}>Loading session...</div>
  }

  return (
    <SessionView
      session={session}
      onCancel={() => navigate('/')}
      onFinish={() => navigate(`/workouts/session/${sessionId}/summary`)}
    />
  )
}

// ─── Inner component — hook called unconditionally ───────────────────────────

interface SessionViewProps {
  session: WorkoutSession
  onCancel: () => void
  onFinish: () => void
}

function SessionView({ session, onCancel, onFinish }: SessionViewProps) {
  const {
    exercises,
    active_index,
    is_loading,
    is_finishing,
    rest_timer_active,
    rest_timer_duration,
    goToExercise,
    updateDraftSet,
    confirmSet,
    addSet,
    removeSet,
    finishWorkout,
    dismissRestTimer,
  } = useWorkoutSession(session)

  const elapsed = useElapsedTime(session.started_at)

  async function handleFinish() {
    await finishWorkout()
    onFinish()
  }

  const activeExercise = exercises[active_index]
  const isFirst = active_index === 0
  const isLast = active_index === exercises.length - 1

  return (
    <div className={styles.page}>
      {/* ── Header ─────────────────────────────────────────────── */}
      <header className={styles.header}>
        <IconButton size="sm" onClick={onCancel} aria-label="Cancel workout">
          ✕
        </IconButton>

        <div className={styles.headerCenter}>
          <p className={styles.workoutTitle}>Workout</p>
          {exercises.length > 0 && (
            <p className={styles.progress}>
              {active_index + 1} of {exercises.length}
            </p>
          )}
        </div>

        <span className={styles.timer}>{elapsed}</span>
      </header>

      {/* ── Scrollable content ──────────────────────────────────── */}
      <div className={styles.content}>
        {is_loading && <p className={styles.state}>Loading exercises...</p>}

        {!is_loading && exercises.length === 0 && (
          <p className={styles.state}>No exercises in this session.</p>
        )}

        {activeExercise && (
          <ExerciseBlock
            state={activeExercise}
            onConfirmSet={(i) => confirmSet(active_index, i)}
            onUpdateSet={(i, field, value) => updateDraftSet(active_index, i, field, value)}
            onAddSet={() => addSet(active_index)}
            onRemoveSet={(i) => removeSet(active_index, i)}
          />
        )}

        {exercises.length > 1 && (
          <div className={styles.switcher}>
            <Button
              variant="ghost"
              size="sm"
              className={clsx(styles.switchBtn, isFirst && styles.switchBtnHidden)}
              onClick={() => goToExercise(active_index - 1)}
              disabled={isFirst}
            >
              ← Prev
            </Button>

            <div className={styles.dots}>
              {exercises.map((_, i) => (
                <button
                  key={i}
                  className={clsx(styles.dot, i === active_index && styles.dotActive)}
                  onClick={() => goToExercise(i)}
                  aria-label={`Go to exercise ${i + 1}`}
                />
              ))}
            </div>

            <Button
              variant="ghost"
              size="sm"
              className={clsx(styles.switchBtn, isLast && styles.switchBtnHidden)}
              onClick={() => goToExercise(active_index + 1)}
              disabled={isLast}
            >
              Next →
            </Button>
          </div>
        )}
      </div>

      {/* ── Sticky footer ───────────────────────────────────────── */}
      <footer className={styles.footer}>
        <Button variant="secondary" size="lg" fullWidth onClick={handleFinish} disabled={is_finishing}>
          {is_finishing ? 'Finishing...' : 'Finish Workout'}
        </Button>
      </footer>

      {rest_timer_active && (
        <RestTimer durationSeconds={rest_timer_duration} onDismiss={dismissRestTimer} />
      )}
    </div>
  )
}
