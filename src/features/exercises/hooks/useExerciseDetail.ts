import { useState, useEffect } from 'react'
import {
  getExerciseById,
  getMuscleGroups,
  getEquipment,
  getExerciseHistory,
  getExercisePR,
  type ExercisePR,
} from '../exercises.api'
import { deleteSessionExercise } from '@/features/workouts/workouts.api'
import type { Exercise, MuscleGroup, Equipment, ExerciseHistorySession } from '../exercises.types'

export interface ExerciseDetailState {
  exercise: Exercise
  muscleGroupName: string
  equipmentName: string | null
  history: ExerciseHistorySession[]
  pr: ExercisePR | null
}

export function useExerciseDetail(exerciseId: string | undefined) {
  const [state, setState] = useState<ExerciseDetailState | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!exerciseId) return

    Promise.all([
      getExerciseById(exerciseId),
      getMuscleGroups(),
      getEquipment(),
      getExerciseHistory(exerciseId),
    ]).then(async ([exercise, muscleGroups, equipment, history]) => {
      const pr = await getExercisePR(exerciseId, exercise.tracking_type)
      const mgMap = new Map<string, MuscleGroup>(muscleGroups.map((mg) => [mg.id, mg]))
      const equipMap = new Map<string, Equipment>(equipment.map((e) => [e.id, e]))

      setState({
        exercise,
        muscleGroupName: mgMap.get(exercise.muscle_group_id)?.name ?? '',
        equipmentName: exercise.equipment_id ? (equipMap.get(exercise.equipment_id)?.name ?? null) : null,
        history,
        pr,
      })
      setIsLoading(false)
    })
  }, [exerciseId])

  function handleDeleteSession(sessionExerciseId: string) {
    setState((prev) =>
      prev ? { ...prev, history: prev.history.filter((s) => s.session_exercise_id !== sessionExerciseId) } : prev,
    )
    deleteSessionExercise(sessionExerciseId).catch(() => {
      if (exerciseId) {
        getExerciseHistory(exerciseId).then((history) =>
          setState((prev) => (prev ? { ...prev, history } : prev)),
        )
      }
    })
  }

  return { state, isLoading, handleDeleteSession }
}
