import { useState, useMemo } from 'react'
import { BODYWEIGHT_ID, type ExerciseWithMeta } from './useExercisesWithMeta'

interface FilterState {
  filtered: ExerciseWithMeta[]
  query: string
  setQuery: (q: string) => void
  activeMuscleGroupId: string | null
  setActiveMuscleGroupId: (id: string | null) => void
  activeEquipmentId: string | null
  setActiveEquipmentId: (id: string | null) => void
}

export function useExerciseFilter(exercises: ExerciseWithMeta[]): FilterState {
  const [query, setQuery] = useState('')
  const [activeMuscleGroupId, setActiveMuscleGroupId] = useState<string | null>(null)
  const [activeEquipmentId, setActiveEquipmentId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    let result = exercises

    if (query) {
      const q = query.toLowerCase()
      result = result.filter(
        (ex) =>
          ex.name.toLowerCase().includes(q) ||
          ex.muscle_group_name.toLowerCase().includes(q) ||
          (ex.equipment_name?.toLowerCase().includes(q) ?? false) ||
          ex.type.toLowerCase().includes(q),
      )
    }

    if (activeMuscleGroupId) {
      result = result.filter((ex) => ex.muscle_group_id === activeMuscleGroupId)
    }

    if (activeEquipmentId) {
      result =
        activeEquipmentId === BODYWEIGHT_ID
          ? result.filter((ex) => ex.equipment_id === null)
          : result.filter((ex) => ex.equipment_id === activeEquipmentId)
    }

    return result
  }, [exercises, query, activeMuscleGroupId, activeEquipmentId])

  return {
    filtered,
    query,
    setQuery,
    activeMuscleGroupId,
    setActiveMuscleGroupId,
    activeEquipmentId,
    setActiveEquipmentId,
  }
}
