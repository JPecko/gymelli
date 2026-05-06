import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import { useSession } from '@/features/workouts/hooks/useSession'
import { useWorkoutSession } from '@/features/workouts/hooks/useWorkoutSession'
import { useLiveWorkoutScore } from '@/features/workouts/hooks/useLiveWorkoutScore'
import { useExerciseNavigation } from '@/features/workouts/hooks/useExerciseNavigation'
import { useElapsedTime } from '@/shared/hooks/useElapsedTime'
import { useProfile } from '@/features/auth/hooks/useProfile'
import { ExerciseBlock } from '@/features/workouts/components/ExerciseBlock'
import { RestTimer } from '@/features/workouts/components/RestTimer'
import { ExercisePicker } from '@/features/exercises/components/ExercisePicker'
import { Button, IconButton, ConfirmSheet } from '@/shared/components'
import type { WorkoutSession } from '@/features/workouts'
import type { Exercise } from '@/features/exercises/exercises.types'
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

// ─── SessionView ──────────────────────────────────────────────────────────────

interface SessionViewProps {
  session: WorkoutSession
  onCancel: () => void
  onFinish: () => void
}

function SessionView({ session, onCancel, onFinish }: SessionViewProps) {
  const [showCancelConfirm, setShowCancelConfirm]     = useState(false)
  const [showFinishConfirm, setShowFinishConfirm]     = useState(false)
  const [showExercisePicker, setShowExercisePicker]   = useState(false)

  const { profile } = useProfile()

  const {
    exercises, active_index, is_loading, is_finishing,
    rest_timer_active, rest_timer_duration, total_rest_seconds,
    goToExercise, updateDraftSet, startSet, confirmSet,
    addSet, removeSet, addExercise, finishWorkout, dismissRestTimer,
  } = useWorkoutSession(session, profile?.body_weight_kg ?? null)

  const elapsed   = useElapsedTime(session.started_at)
  const liveScore = useLiveWorkoutScore({
    exercises,
    started_at: session.started_at,
    total_rest_seconds,
    body_weight_kg: profile?.body_weight_kg ?? null,
    sex: profile?.sex ?? null,
  })

  const { navigateTo, slideDir, swipeHandlers } = useExerciseNavigation(
    exercises.length, active_index, goToExercise,
  )

  async function confirmFinish() {
    setShowFinishConfirm(false)
    await finishWorkout()
    onFinish()
  }

  const activeExercise = exercises[active_index]
  const isFirst = active_index === 0
  const isLast  = active_index === exercises.length - 1

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <IconButton size="sm" onClick={() => setShowCancelConfirm(true)} aria-label="Cancel workout">✕</IconButton>
        <div className={styles.headerCenter}>
          <span className={styles.timer}>{elapsed}</span>
          {exercises.length > 0 && (
            <p className={styles.progress}>{active_index + 1} of {exercises.length}</p>
          )}
        </div>
        {liveScore ? (
          <div className={styles.liveScore}>
            <span className={styles.liveScoreValue} data-label={liveScore.label}>{liveScore.score}</span>
            <span className={styles.liveScoreLabel}>{liveScore.label}</span>
          </div>
        ) : (
          <div className={styles.headerSpacer} aria-hidden="true" />
        )}
      </header>

      <div className={styles.content} {...swipeHandlers}>
        {is_loading && <p className={styles.state}>Loading exercises...</p>}
        {!is_loading && exercises.length === 0 && <p className={styles.state}>No exercises in this session.</p>}

        {activeExercise && (
          <div key={active_index} className={clsx(slideDir === 'left' && styles.slideLeft, slideDir === 'right' && styles.slideRight)}>
            <ExerciseBlock
              state={activeExercise}
              showPrevChevron={!isFirst}
              showNextChevron={!isLast}
              onStartSet={(i) => startSet(active_index, i)}
              onConfirmSet={(i) => confirmSet(active_index, i)}
              onUpdateSet={(i, field, value) => updateDraftSet(active_index, i, field, value)}
              onAddSet={() => addSet(active_index)}
              onRemoveSet={(i) => removeSet(active_index, i)}
            />
          </div>
        )}

        {exercises.length > 1 && (
          <ExerciseSwitcher exerciseCount={exercises.length} activeIndex={active_index} onNavigate={navigateTo} />
        )}

        <button className={styles.addExerciseBtn} onClick={() => setShowExercisePicker(true)}>
          + Add Exercise
        </button>
      </div>

      <footer className={styles.footer}>
        <Button variant="secondary" size="lg" fullWidth onClick={() => setShowFinishConfirm(true)} disabled={is_finishing}>
          {is_finishing ? 'Finishing...' : 'Finish Workout'}
        </Button>
      </footer>

      {rest_timer_active && <RestTimer durationSeconds={rest_timer_duration} onDismiss={dismissRestTimer} />}

      {showExercisePicker && (
        <AddExerciseOverlay
          alreadySelectedIds={exercises.map((e) => e.exercise.id)}
          onAdd={(id) => { addExercise(id); setShowExercisePicker(false) }}
          onClose={() => setShowExercisePicker(false)}
        />
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

// ─── ExerciseSwitcher ─────────────────────────────────────────────────────────

interface ExerciseSwitcherProps {
  exerciseCount: number
  activeIndex: number
  onNavigate: (idx: number) => void
}

function ExerciseSwitcher({ exerciseCount, activeIndex, onNavigate }: ExerciseSwitcherProps) {
  const isFirst = activeIndex === 0
  const isLast  = activeIndex === exerciseCount - 1

  return (
    <div className={styles.switcher}>
      <Button variant="ghost" size="sm" className={clsx(styles.switchBtn, isFirst && styles.switchBtnHidden)} onClick={() => onNavigate(activeIndex - 1)} disabled={isFirst}>
        ← Prev
      </Button>
      <div className={styles.dots}>
        {Array.from({ length: exerciseCount }, (_, i) => (
          <button key={i} className={clsx(styles.dot, i === activeIndex && styles.dotActive)} onClick={() => onNavigate(i)} aria-label={`Go to exercise ${i + 1}`} />
        ))}
      </div>
      <Button variant="ghost" size="sm" className={clsx(styles.switchBtn, isLast && styles.switchBtnHidden)} onClick={() => onNavigate(activeIndex + 1)} disabled={isLast}>
        Next →
      </Button>
    </div>
  )
}

// ─── AddExerciseOverlay ───────────────────────────────────────────────────────

interface AddExerciseOverlayProps {
  alreadySelectedIds: string[]
  onAdd: (exerciseId: string) => void
  onClose: () => void
}

function AddExerciseOverlay({ alreadySelectedIds, onAdd, onClose }: AddExerciseOverlayProps) {
  function handleToggle(ex: Exercise) {
    if (!alreadySelectedIds.includes(ex.id)) onAdd(ex.id)
  }

  return (
    <div className={styles.pickerOverlay}>
      <div className={styles.pickerHeader}>
        <p className={styles.pickerTitle}>Add Exercise</p>
        <IconButton size="sm" onClick={onClose} aria-label="Close">✕</IconButton>
      </div>
      <div className={styles.pickerBody}>
        <ExercisePicker selectedIds={alreadySelectedIds} onToggle={handleToggle} />
      </div>
    </div>
  )
}
