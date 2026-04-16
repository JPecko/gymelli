import { useState, useEffect } from 'react'
import { getExercises, getMuscleGroups, getEquipment } from '../exercises.api'
import type { Exercise, MuscleGroup, Equipment } from '../exercises.types'

export interface ExerciseWithMeta extends Exercise {
  muscle_group_name: string
  equipment_name: string | null
}

interface Result {
  exercises: ExerciseWithMeta[]
  muscleGroups: MuscleGroup[]
  isLoading: boolean
}

export function useExercisesWithMeta(): Result {
  const [exercises, setExercises] = useState<ExerciseWithMeta[]>([])
  const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    Promise.all([getExercises(), getMuscleGroups(), getEquipment()]).then(
      ([exs, mgs, equip]: [Exercise[], MuscleGroup[], Equipment[]]) => {
        const mgMap = new Map<string, MuscleGroup>(mgs.map((mg) => [mg.id, mg]))
        const equipMap = new Map<string, Equipment>(equip.map((e) => [e.id, e]))

        setExercises(
          exs.map((ex) => ({
            ...ex,
            muscle_group_name: mgMap.get(ex.muscle_group_id)?.name ?? '',
            equipment_name: ex.equipment_id ? (equipMap.get(ex.equipment_id)?.name ?? null) : null,
          })),
        )
        setMuscleGroups(mgs)
        setIsLoading(false)
      },
    )
  }, [])

  return { exercises, muscleGroups, isLoading }
}
