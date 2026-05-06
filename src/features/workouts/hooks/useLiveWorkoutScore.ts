import { useState, useEffect, useMemo } from 'react'
import type { SessionExerciseState } from './useWorkoutSession'
import { computeWorkoutScore, type WorkoutScore } from './useWorkoutScore'

interface LiveScoreOptions {
  exercises: SessionExerciseState[]
  started_at: string
  total_rest_seconds: number
  body_weight_kg: number | null
  sex: 'M' | 'F' | null
}

export function useLiveWorkoutScore({
  exercises,
  started_at,
  total_rest_seconds,
  body_weight_kg,
  sex,
}: LiveScoreOptions): WorkoutScore | null {
  const [duration_seconds, setDurationSeconds] = useState(
    () => Math.floor((Date.now() - new Date(started_at).getTime()) / 1000),
  )

  useEffect(() => {
    const interval = setInterval(() => {
      setDurationSeconds(Math.floor((Date.now() - new Date(started_at).getTime()) / 1000))
    }, 10_000)
    return () => clearInterval(interval)
  }, [started_at])

  return useMemo(() => {
    let total_volume_kg = 0
    let pr_count = 0
    let has_confirmed = false

    for (const ex of exercises) {
      const confirmed = ex.sets.filter((s) => s.is_completed)
      if (confirmed.length === 0) continue
      has_confirmed = true

      const tracking = ex.exercise.tracking_type

      for (const s of confirmed) {
        if (s.weight_kg != null && s.reps != null) {
          total_volume_kg += s.weight_kg * s.reps
        }
      }

      const maxThis =
        tracking === 'reps_only'   ? Math.max(0, ...confirmed.map((s) => s.reps ?? 0))
        : tracking === 'duration'  ? Math.max(0, ...confirmed.map((s) => s.duration_seconds ?? 0))
        : tracking === 'distance'  ? Math.max(0, ...confirmed.map((s) => s.distance_km ?? 0))
        : Math.max(0, ...confirmed.map((s) => s.weight_kg ?? 0))

      const maxPrev =
        tracking === 'reps_only'   ? Math.max(0, ...ex.previous_sets.map((s) => s.reps ?? 0))
        : tracking === 'duration'  ? Math.max(0, ...ex.previous_sets.map((s) => s.duration_seconds ?? 0))
        : tracking === 'distance'  ? Math.max(0, ...ex.previous_sets.map((s) => s.distance_km ?? 0))
        : Math.max(0, ...ex.previous_sets.map((s) => s.weight_kg ?? 0))

      if (maxThis > maxPrev && maxThis > 0) pr_count++
    }

    if (!has_confirmed) return null

    return computeWorkoutScore({
      total_volume_kg,
      duration_seconds,
      exercise_count: exercises.length,
      pr_count,
      calories_burned: null,
      body_weight_kg,
      sex,
      total_rest_seconds,
    })
  }, [exercises, duration_seconds, body_weight_kg, sex, total_rest_seconds])
}
