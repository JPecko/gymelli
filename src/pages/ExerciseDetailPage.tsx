import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  getExerciseById,
  getMuscleGroups,
  getEquipment,
  getExerciseHistory,
} from '@/features/exercises/exercises.api'
import type { Exercise, MuscleGroup, Equipment, ExerciseHistorySession } from '@/features/exercises/exercises.types'
import { deleteSessionExercise } from '@/features/workouts/workouts.api'
import { SwipeableItem, Badge, SetsCard } from '@/shared/components'
import styles from './ExerciseDetailPage.module.scss'

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

interface PageState {
  exercise: Exercise
  muscleGroupName: string
  equipmentName: string | null
  history: ExerciseHistorySession[]
}

export function ExerciseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [state, setState] = useState<PageState | null>(null)
  const [imgFailed, setImgFailed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!id) return

    Promise.all([
      getExerciseById(id),
      getMuscleGroups(),
      getEquipment(),
      getExerciseHistory(id),
    ]).then(([exercise, muscleGroups, equipment, history]: [Exercise, MuscleGroup[], Equipment[], ExerciseHistorySession[]]) => {
      const mgMap = new Map(muscleGroups.map((mg) => [mg.id, mg]))
      const equipMap = new Map(equipment.map((e) => [e.id, e]))

      setState({
        exercise,
        muscleGroupName: mgMap.get(exercise.muscle_group_id)?.name ?? '',
        equipmentName: exercise.equipment_id ? (equipMap.get(exercise.equipment_id)?.name ?? null) : null,
        history,
      })
      setIsLoading(false)
    })
  }, [id])

  function handleDeleteSession(sessionExerciseId: string) {
    setState((prev) =>
      prev
        ? { ...prev, history: prev.history.filter((s) => s.session_exercise_id !== sessionExerciseId) }
        : prev,
    )
    deleteSessionExercise(sessionExerciseId).catch(() => {
      if (id) getExerciseHistory(id).then((history) => setState((prev) => prev ? { ...prev, history } : prev))
    })
  }

  if (isLoading || !state) {
    return <div className={styles.loading}>Loading...</div>
  }

  const { exercise, muscleGroupName, equipmentName, history } = state
  const slug = toSlug(exercise.name)
  const meta = [muscleGroupName, equipmentName].filter(Boolean).join(' · ')

  return (
    <div className={styles.page}>
      {/* ── Back ──────────────────────────────────────────────── */}
      <button className={styles.backBtn} onClick={() => navigate('/exercises')}>
        ← Exercises
      </button>

      {/* ── Image ─────────────────────────────────────────────── */}
      <div className={styles.imageWrap}>
        {imgFailed ? (
          <div className={styles.placeholder}>
            <span className={styles.placeholderLabel}>{muscleGroupName}</span>
          </div>
        ) : (
          <img
            className={styles.image}
            src={`/images/exercises/${slug}.png`}
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

      {/* ── Instructions ──────────────────────────────────────── */}
      {exercise.instructions && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Instructions</h2>
          <p className={styles.instructions}>{exercise.instructions}</p>
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
                  sets={session.sets}
                />
              </SwipeableItem>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
