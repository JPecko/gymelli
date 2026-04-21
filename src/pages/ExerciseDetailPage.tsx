import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useExerciseDetail } from '@/features/exercises/hooks/useExerciseDetail'
import { useExerciseGoal } from '@/features/exercises/hooks/useExerciseGoal'
import { GoalCard } from '@/features/exercises/components/GoalCard'
import { GoalForm } from '@/features/exercises/components/GoalForm'
import { WeightProgressChart } from '@/features/exercises/components/WeightProgressChart'
import { toSlug } from '@/features/exercises/exercises.utils'
import { formatDate, formatDateShort, formatSetDuration } from '@/shared/lib/formatters'
import type { TrackingType } from '@/features/exercises/exercises.types'
import { SwipeableItem, Badge, SetsCard, StatCard } from '@/shared/components'
import styles from './ExerciseDetailPage.module.scss'

function prLabel(pr: NonNullable<ReturnType<typeof useExerciseDetail>['state']>['pr'], t: TrackingType): string {
  if (!pr) return '—'
  if (t === 'weight_reps') return pr.weight_kg != null ? `${pr.weight_kg} kg` : '—'
  if (t === 'reps_only')   return pr.reps != null ? `${pr.reps} reps` : '—'
  if (t === 'duration')    return pr.duration_seconds != null ? formatSetDuration(pr.duration_seconds) : '—'
  return pr.distance_km != null ? `${pr.distance_km} km` : '—'
}

function trackingTypeReps(
  s: { weight_kg: number | null; reps: number | null; duration_seconds: number | null; distance_km: number | null },
  tracking: TrackingType,
): number | null {
  if (tracking === 'reps_only') return s.reps
  if (tracking === 'duration')  return s.duration_seconds
  if (tracking === 'distance')  return s.distance_km != null ? Math.round(s.distance_km * 100) / 100 : null
  return s.reps
}

export function ExerciseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [imgFailed, setImgFailed] = useState(false)
  const [showGoalEdit, setShowGoalEdit] = useState(false)

  const { state, isLoading, handleDeleteSession } = useExerciseDetail(id)
  const { goal, isSaving: isSavingGoal, saveGoal, removeGoal } = useExerciseGoal(
    id ?? '',
    state?.exercise.tracking_type ?? 'weight_reps',
  )

  if (isLoading || !state) return <div className={styles.loading}>Loading...</div>

  const { exercise, muscleGroupName, equipmentName, history, pr } = state
  const tracking = exercise.tracking_type
  const slug = toSlug(exercise.name)
  const meta = [muscleGroupName, equipmentName].filter(Boolean).join(' · ')

  const chartPoints = [...history].reverse().map((s) => {
    const value =
      tracking === 'weight_reps' ? Math.max(...s.sets.map((set) => set.weight_kg ?? 0), 0)
      : tracking === 'reps_only' ? Math.max(...s.sets.map((set) => set.reps ?? 0), 0)
      : tracking === 'duration'  ? Math.max(...s.sets.map((set) => set.duration_seconds ?? 0), 0)
      : Math.max(...s.sets.map((set) => set.distance_km ?? 0), 0)
    return { label: formatDateShort(s.started_at), weight_kg: value }
  }).filter((p) => p.weight_kg > 0)

  return (
    <div className={styles.page}>
      {/* ── Desktop back + edit ───────────────────────────────── */}
      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={() => navigate('/exercises')}>← Exercises</button>
        <button className={styles.editBtn} onClick={() => navigate(`/exercises/${id}/edit`)}>Edit</button>
      </div>

      {/* ── Image ─────────────────────────────────────────────── */}
      <div className={styles.imageWrap}>
        {imgFailed ? (
          <div className={styles.placeholder}>
            <span className={styles.placeholderLabel}>{muscleGroupName}</span>
          </div>
        ) : (
          <img
            className={styles.image}
            src={exercise.image_url ?? `/images/exercises/${slug}.png`}
            alt={exercise.name}
            onError={() => setImgFailed(true)}
          />
        )}
      </div>

      {/* ── Header ────────────────────────────────────────────── */}
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>{exercise.name}</h1>
          <Badge>{exercise.type}</Badge>
        </div>
        <p className={styles.meta}>{meta}</p>
      </div>

      {/* ── Edit button (mobile) ───────────────────────────────── */}
      <button className={styles.editBtnMobile} onClick={() => navigate(`/exercises/${id}/edit`)}>
        Edit exercise
      </button>

      {/* ── Instructions ──────────────────────────────────────── */}
      {exercise.instructions && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Instructions</h2>
          <p className={styles.instructions}>{exercise.instructions}</p>
        </section>
      )}

      {/* ── Stats ─────────────────────────────────────────────── */}
      {history.length > 0 && (
        <div className={styles.stats}>
          <StatCard label="Sessions" value={history.length} />
          {pr && <StatCard label="Best" value={prLabel(pr, tracking)} accent />}
        </div>
      )}

      {/* ── Goal ──────────────────────────────────────────────── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Goal</h2>
          <button className={styles.goalEditLink} onClick={() => setShowGoalEdit((v) => !v)}>
            {goal ? 'Edit' : '+ Set goal'}
          </button>
        </div>

        {goal && !showGoalEdit && (
          <GoalCard goal={goal} tracking={tracking} onEdit={() => setShowGoalEdit(true)} onRemove={removeGoal} />
        )}

        {showGoalEdit && (
          <GoalForm
            goal={goal}
            tracking={tracking}
            isSaving={isSavingGoal}
            onSave={async (values) => { await saveGoal(values); setShowGoalEdit(false) }}
            onCancel={() => setShowGoalEdit(false)}
          />
        )}

        {!goal && !showGoalEdit && (
          <p className={styles.empty}>No goal set yet.</p>
        )}
      </section>

      {/* ── Progress ──────────────────────────────────────────── */}
      {chartPoints.length > 1 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Progress</h2>
          <WeightProgressChart points={chartPoints} />
        </section>
      )}

      {/* ── History ───────────────────────────────────────────── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>History</h2>
        {history.length === 0 ? (
          <p className={styles.empty}>No sessions logged yet.</p>
        ) : (
          <div className={styles.history}>
            {history.map((session) => (
              <SwipeableItem
                key={session.session_exercise_id}
                onDelete={() => handleDeleteSession(session.session_exercise_id)}
                deleteLabel="Delete session"
              >
                <SetsCard
                  header={<p className={styles.sessionDate}>{formatDate(session.started_at)}</p>}
                  sets={session.sets.map((s) => ({
                    set_number: s.set_number,
                    weight_kg: s.weight_kg,
                    reps: trackingTypeReps(s, tracking),
                  }))}
                />
              </SwipeableItem>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
