import { useState, useEffect } from 'react'
import {
  getSessionById,
  getSessionExercises,
  getSetsForSessionExercise,
  getPreviousSetsForExercise,
  updateSessionCalories,
} from '../workouts.api'
import { useWorkoutScore, type WorkoutScore } from './useWorkoutScore'
import { useProfile } from '@/features/auth/hooks/useProfile'
import { getExerciseById } from '@/features/exercises/exercises.api'
import type { WorkoutSession, WorkoutSessionExercise, ExerciseSet } from '../workouts.types'
import type { Exercise } from '@/features/exercises/exercises.types'
import type { Profile } from '@/features/auth/auth.types'

export interface SummarySet {
  set_number: number
  weight_kg: number | null
  reps: number | null
}

export interface SummaryExercise {
  exercise: Exercise
  sets: SummarySet[]
  is_pr: boolean
}

export interface SummaryData {
  session: WorkoutSession
  exercises: SummaryExercise[]
  total_volume_kg: number
  total_sets: number
  duration_seconds: number
}

function maxWeight(sets: Array<{ weight_kg: number | null }>): number {
  return Math.max(0, ...sets.map((s) => s.weight_kg ?? 0))
}

export function useWorkoutSummary(sessionId: string | undefined): {
  data: SummaryData | null
  calories: number | null
  score: WorkoutScore
  profile: Profile | null
  handleCaloriesSave: (value: number | null) => Promise<void>
} {
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

          return {
            exercise,
            sets: sets.map((s) => ({ set_number: s.set_number, weight_kg: s.weight_kg, reps: s.reps })),
            is_pr: maxWeight(sets) > 0 && maxWeight(sets) > maxWeight(previousSets),
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
    total_rest_seconds: data?.session.total_rest_seconds ?? null,
  })

  async function handleCaloriesSave(value: number | null) {
    setCalories(value)
    if (sessionId) await updateSessionCalories(sessionId, value)
  }

  return { data, calories, score, profile, handleCaloriesSave }
}
