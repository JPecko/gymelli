import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import { useSession } from '@/features/workouts/hooks/useSession'
import { useWorkoutSession } from '@/features/workouts/hooks/useWorkoutSession'
import { useLiveWorkoutScore } from '@/features/workouts/hooks/useLiveWorkoutScore'
import { useElapsedTime } from '@/shared/hooks/useElapsedTime'
import { useProfile } from '@/features/auth/hooks/useProfile'
import { ExerciseBlock } from '@/features/workouts/components/ExerciseBlock'
import { RestTimer } from '@/features/workouts/components/RestTimer'
import { Button, IconButton, ConfirmSheet } from '@/shared/components'
import type { WorkoutSession } from '@/features/workouts'
import styles from './WorkoutSessionPage.module.scss'

export function WorkoutSessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const session = useSession(sessionId)

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
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [showFinishConfirm, setShowFinishConfirm] = useState(false)

  const {
    exercises,
    active_index,
    is_loading,
    is_finishing,
    rest_timer_active,
    rest_timer_duration,
    total_rest_seconds,
    goToExercise,
    updateDraftSet,
    confirmSet,
    addSet,
    removeSet,
    finishWorkout,
    dismissRestTimer,
  } = useWorkoutSession(session)

  const elapsed = useElapsedTime(session.started_at)
  const { profile } = useProfile()
  const liveScore = useLiveWorkoutScore({
    exercises,
    started_at: session.started_at,
    total_rest_seconds,
    body_weight_kg: profile?.body_weight_kg ?? null,
    sex: profile?.sex ?? null,
  })

  async function handleFinish() {
    await finishWorkout()
    onFinish()
  }

  async function confirmFinish() {
    setShowFinishConfirm(false)
    await handleFinish()
  }

  const activeExercise = exercises[active_index]
  const isFirst = active_index === 0
  const isLast = active_index === exercises.length - 1

  return (
    <div className={styles.page}>
      {/* ── Header ─────────────────────────────────────────────── */}
      <header className={styles.header}>
        <IconButton size="sm" onClick={() => setShowCancelConfirm(true)} aria-label="Cancel workout">
          ✕
        </IconButton>

        <div className={styles.headerCenter}>
          <span className={styles.timer}>{elapsed}</span>
          {exercises.length > 0 && (
            <p className={styles.progress}>
              {active_index + 1} of {exercises.length}
            </p>
          )}
        </div>

        {liveScore ? (
          <div className={styles.liveScore}>
            <span className={styles.liveScoreValue} data-label={liveScore.label}>
              {liveScore.score}
            </span>
            <span className={styles.liveScoreLabel}>{liveScore.label}</span>
          </div>
        ) : (
          <div className={styles.headerSpacer} aria-hidden="true" />
        )}
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
            onSwipeLeft={!isLast ? () => goToExercise(active_index + 1) : undefined}
            onSwipeRight={!isFirst ? () => goToExercise(active_index - 1) : undefined}
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
        <Button variant="secondary" size="lg" fullWidth onClick={() => setShowFinishConfirm(true)} disabled={is_finishing}>
          {is_finishing ? 'Finishing...' : 'Finish Workout'}
        </Button>
      </footer>

      {rest_timer_active && (
        <RestTimer durationSeconds={rest_timer_duration} onDismiss={dismissRestTimer} />
      )}

      {showCancelConfirm && (
        <ConfirmSheet
          message="Abandon this workout? Progress will not be saved."
          confirmLabel="Abandon"
          variant="destructive"
          onConfirm={onCancel}
          onCancel={() => setShowCancelConfirm(false)}
        />
      )}

      {showFinishConfirm && (
        <ConfirmSheet
          message="Finish workout and save results?"
          confirmLabel="Finish Workout"
          variant="primary"
          onConfirm={confirmFinish}
          onCancel={() => setShowFinishConfirm(false)}
        />
      )}
    </div>
  )
}
