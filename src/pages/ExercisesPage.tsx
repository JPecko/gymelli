import { useState, useEffect } from 'react'
import { getExercises, getMuscleGroups, getEquipment } from '@/features/exercises/exercises.api'
import type { Exercise, MuscleGroup, Equipment } from '@/features/exercises/exercises.types'
import { ExerciseCard } from '@/features/exercises/components/ExerciseCard'
import styles from './ExercisesPage.module.scss'

interface ExerciseWithMeta extends Exercise {
  muscle_group_name: string
  equipment_name: string | null
}

export function ExercisesPage() {
  const [exercises, setExercises] = useState<ExerciseWithMeta[]>([])
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    Promise.all([getExercises(), getMuscleGroups(), getEquipment()]).then(
      ([exs, mgs, equip]: [Exercise[], MuscleGroup[], Equipment[]]) => {
        const mgMap = new Map(mgs.map((mg) => [mg.id, mg]))
        const equipMap = new Map(equip.map((e) => [e.id, e]))

        setExercises(
          exs.map((ex) => ({
            ...ex,
            muscle_group_name: mgMap.get(ex.muscle_group_id)?.name ?? '',
            equipment_name: ex.equipment_id ? (equipMap.get(ex.equipment_id)?.name ?? null) : null,
          })),
        )
        setIsLoading(false)
      },
    )
  }, [])

  const filtered = query
    ? exercises.filter((ex) => ex.name.toLowerCase().includes(query.toLowerCase()))
    : exercises

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Exercises</h1>
      </header>

      <div className={styles.searchWrap}>
        <input
          className={styles.search}
          type="search"
          placeholder="Search exercises..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search exercises"
        />
      </div>

      {isLoading && <p className={styles.state}>Loading...</p>}

      {!isLoading && filtered.length === 0 && (
        <p className={styles.state}>No exercises found.</p>
      )}

      {!isLoading && filtered.length > 0 && (
        <div className={styles.grid}>
          {filtered.map((ex) => (
            <ExerciseCard
              key={ex.id}
              exercise={ex}
              muscleGroupName={ex.muscle_group_name}
              equipmentName={ex.equipment_name}
            />
          ))}
        </div>
      )}
    </div>
  )
}
