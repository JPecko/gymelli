import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  getSessionById,
  getSessionExercises,
  getSetsForSessionExercise,
  getPreviousSetsForExercise,
  updateSessionCalories,
} from '@/features/workouts/workouts.api'
import { useWorkoutScore } from '@/features/workouts/hooks/useWorkoutScore'
import { WorkoutScoreCard } from '@/features/workouts/components/WorkoutScoreCard'
import { useProfile } from '@/features/auth/hooks/useProfile'
import { getExerciseById } from '@/features/exercises/exercises.api'
import type { WorkoutSession, WorkoutSessionExercise, ExerciseSet } from '@/features/workouts/workouts.types'
import type { Exercise } from '@/features/exercises/exercises.types'
import { Button, Badge, SetsCard } from '@/shared/components'
import styles from './WorkoutSummaryPage.module.scss'

interface SummarySet {
  set_number: number
  weight_kg: number | null
  reps: number | null
}

interface SummaryExercise {
  exercise: Exercise
  sets: SummarySet[]
  is_pr: boolean
}

interface SummaryData {
  session: WorkoutSession
  exercises: SummaryExercise[]
  total_volume_kg: number
  total_sets: number
  duration_seconds: number
}

function formatDuration(seconds: number): string {
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

function formatVolume(kg: number): string {
  return kg >= 1000
    ? `${(kg / 1000).toFixed(1)}t`
    : `${Math.round(kg).toLocaleString()} kg`
}

function maxWeight(sets: Array<{ weight_kg: number | null }>): number {
  return Math.max(0, ...sets.map((s) => s.weight_kg ?? 0))
}

export function WorkoutSummaryPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const [data, setData] = useState<SummaryData | null>(null)
  const [calories, setCalories] = useState<number | null>(null)
  const { profile } = useProfile()

  useEffect(() => {
    if (!sessionId) return

    async function load() {
      const session = await getSessionById(sessionId!)
      const sessionExercises: WorkoutSessionExercise[] = await getSessionExercises(sessionId!)

      const exercises: SummaryExercise[] = await Promise.all(
        sessionExercises.map(async (se) => {
          const [exercise, sets, previousSets]: [Exercise, ExerciseSet[], ExerciseSet[]] =
            await Promise.all([
              getExerciseById(se.exercise_id),
              getSetsForSessionExercise(se.id),
              getPreviousSetsForExercise(se.exercise_id, sessionId!),
            ])

          const is_pr = maxWeight(sets) > 0 && maxWeight(sets) > maxWeight(previousSets)

          return {
            exercise,
            sets: sets.map((s) => ({ set_number: s.set_number, weight_kg: s.weight_kg, reps: s.reps })),
            is_pr,
          }
        }),
      )

      const allSets = exercises.flatMap((e) => e.sets)

      setData({
        session,
        exercises,
        total_volume_kg: allSets.reduce((acc, s) => acc + (s.weight_kg ?? 0) * (s.reps ?? 0), 0),
        total_sets: allSets.length,
        duration_seconds: session.finished_at
          ? Math.floor(
              (new Date(session.finished_at).getTime() - new Date(session.started_at).getTime()) / 1000,
            )
          : 0,
      })
      setCalories(session.calories_burned)
    }

    load()
  }, [sessionId])

  const score = useWorkoutScore({
    total_volume_kg: data?.total_volume_kg ?? 0,
    duration_seconds: data?.duration_seconds ?? 0,
    exercise_count: data?.exercises.length ?? 0,
    pr_count: data?.exercises.filter((e) => e.is_pr).length ?? 0,
    calories_burned: calories,
    body_weight_kg: profile?.body_weight_kg ?? null,
    sex: profile?.sex ?? null,
  })

  async function handleCaloriesSave(value: number | null) {
    setCalories(value)
    if (sessionId) await updateSessionCalories(sessionId, value)
  }

  if (!data) {
    return <div className={styles.loading}>Loading summary...</div>
  }

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
          <span className={styles.statValue}>{formatVolume(total_volume_kg)}</span>
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
            sets={sets}
          />
        ))}
      </div>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className={styles.footer}>
        <Button variant="primary" size="lg" fullWidth onClick={() => navigate('/')}>
          Done
        </Button>
      </footer>
    </div>
  )
}
