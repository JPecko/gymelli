import { useState, useEffect } from 'react'
import { getExerciseGoal, upsertExerciseGoal, deleteExerciseGoal } from '../exercises.api'
import type { ExerciseGoal, TrackingType } from '../exercises.types'

export function useExerciseGoal(exerciseId: string, trackingType: TrackingType) {
  const [goal, setGoal] = useState<ExerciseGoal | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    getExerciseGoal(exerciseId)
      .then(setGoal)
      .finally(() => setIsLoading(false))
  }, [exerciseId])

  async function saveGoal(values: {
    target_weight_kg?: number | null
    target_reps?: number | null
    target_duration_seconds?: number | null
    target_distance_km?: number | null
    note?: string | null
    target_date?: string | null
  }) {
    setIsSaving(true)
    try {
      const updated = await upsertExerciseGoal(exerciseId, {
        target_weight_kg: values.target_weight_kg ?? null,
        target_reps: values.target_reps ?? null,
        target_duration_seconds: values.target_duration_seconds ?? null,
        target_distance_km: values.target_distance_km ?? null,
        note: values.note ?? null,
        target_date: values.target_date ?? null,
      })
      setGoal(updated)
    } finally {
      setIsSaving(false)
    }
  }

  async function removeGoal() {
    await deleteExerciseGoal(exerciseId)
    setGoal(null)
  }

  // What metric label to show based on tracking type
  const primaryLabel =
    trackingType === 'weight_reps' ? 'kg'
    : trackingType === 'reps_only' ? 'reps'
    : trackingType === 'duration'  ? 'sec'
    : 'km'

  return { goal, isLoading, isSaving, saveGoal, removeGoal, primaryLabel }
}
