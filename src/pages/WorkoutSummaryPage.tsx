import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { deleteSession } from '@/features/workouts/workouts.api'
import { useWorkoutSummary, type SummarySet } from '@/features/workouts/hooks/useWorkoutSummary'
import { WorkoutScoreCard } from '@/features/workouts/components/WorkoutScoreCard'
import { Button, Badge, SetsCard, ConfirmSheet } from '@/shared/components'
import { formatDuration, formatVolumeFull } from '@/shared/lib/formatters'
import type { TrackingType } from '@/features/exercises/exercises.types'
import styles from './WorkoutSummaryPage.module.scss'

function toDisplaySet(s: SummarySet, tracking: TrackingType) {
  if (tracking === 'reps_only') return { set_number: s.set_number, weight_kg: null, reps: s.reps }
  if (tracking === 'duration')  return { set_number: s.set_number, weight_kg: null, reps: s.duration_seconds }
  if (tracking === 'distance')  return { set_number: s.set_number, weight_kg: s.distance_km, reps: null }
  return { set_number: s.set_number, weight_kg: s.weight_kg, reps: s.reps }
}

export function WorkoutSummaryPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const { data, calories, score, profile, handleCaloriesSave } = useWorkoutSummary(sessionId)

  if (!data) return <div className={styles.loading}>Loading summary...</div>

  const { exercises, total_volume_kg, total_sets, duration_seconds } = data

  return (
    <div className={styles.page}>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <div className={styles.hero}>
        <div className={styles.checkmark}>✓</div>
        <h1 className={styles.heroTitle}>Workout Complete</h1>
      </div>

      {/* ── Stats row ─────────────────────────────────────────────── */}
      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{formatDuration(duration_seconds)}</span>
          <span className={styles.statLabel}>Duration</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.stat}>
          <span className={styles.statValue}>{formatVolumeFull(total_volume_kg)}</span>
          <span className={styles.statLabel}>Volume</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.stat}>
          <span className={styles.statValue}>{total_sets}</span>
          <span className={styles.statLabel}>Sets</span>
        </div>
      </div>

      {/* ── Score card ────────────────────────────────────────────── */}
      <WorkoutScoreCard
        score={score}
        calories={calories}
        onCaloriesSave={handleCaloriesSave}
        showBodyWeightNudge={profile != null && profile.body_weight_kg == null}
      />

      {/* ── Exercise list ─────────────────────────────────────────── */}
      <div className={styles.exercises}>
        {exercises.map(({ exercise, sets, is_pr }) => (
          <SetsCard
            key={exercise.id}
            header={
              <>
                <p className={styles.exerciseName}>{exercise.name}</p>
                {is_pr && <Badge variant="gold">PR</Badge>}
              </>
            }
            sets={sets.map((s) => toDisplaySet(s, exercise.tracking_type))}
          />
        ))}
      </div>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className={styles.footer}>
        <Button variant="primary" size="lg" fullWidth onClick={() => navigate('/')}>
          Done
        </Button>
        <button className={styles.deleteBtn} onClick={() => setShowDeleteConfirm(true)}>
          Delete workout
        </button>
      </footer>

      {showDeleteConfirm && (
        <ConfirmSheet
          message="Delete this workout? This cannot be undone."
          confirmLabel="Delete workout"
          variant="destructive"
          onConfirm={async () => {
            if (sessionId) await deleteSession(sessionId)
            navigate('/')
          }}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  )
}
