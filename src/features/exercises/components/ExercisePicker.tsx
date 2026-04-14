import { useState, useEffect } from 'react'
import { getExercises, getMuscleGroups, getEquipment } from '@/features/exercises/exercises.api'
import type { Exercise, MuscleGroup, Equipment } from '@/features/exercises/exercises.types'
import { SearchField } from '@/shared/components'
import { ExercisePickerItem } from './ExercisePickerItem'
import styles from './ExercisePicker.module.scss'

interface ExerciseWithMeta extends Exercise {
  muscle_group_name: string
  equipment_name: string | null
}

interface ExercisePickerProps {
  selectedIds: string[]
  onToggle: (exercise: Exercise) => void
}

export function ExercisePicker({ selectedIds, onToggle }: ExercisePickerProps) {
  const [exercises, setExercises] = useState<ExerciseWithMeta[]>([])
  const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>([])
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    Promise.all([getExercises(), getMuscleGroups(), getEquipment()]).then(
      ([exs, mgs, equip]) => {
        const equipMap = new Map<string, Equipment>(equip.map((e) => [e.id, e]))
        const mgMap = new Map<string, MuscleGroup>(mgs.map((mg) => [mg.id, mg]))

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

  const filtered = query
    ? exercises.filter((ex) => ex.name.toLowerCase().includes(query.toLowerCase()))
    : exercises

  const grouped = muscleGroups
    .map((mg) => ({
      muscleGroup: mg,
      exercises: filtered.filter((ex) => ex.muscle_group_id === mg.id),
    }))
    .filter((g) => g.exercises.length > 0)

  return (
    <div className={styles.picker}>
      <div className={styles.searchWrap}>
        <SearchField
          placeholder="Search exercises..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search exercises"
        />
      </div>

      {isLoading && <p className={styles.state}>Loading exercises...</p>}

      {!isLoading && grouped.length === 0 && (
        <p className={styles.state}>No exercises found.</p>
      )}

      <div className={styles.list}>
        {grouped.map(({ muscleGroup, exercises: groupExs }) => (
          <div key={muscleGroup.id} className={styles.group}>
            <p className={styles.groupLabel}>{muscleGroup.name}</p>
            {groupExs.map((ex) => {
              const meta = [ex.muscle_group_name, ex.equipment_name].filter(Boolean).join(' · ')
              return (
                <ExercisePickerItem
                  key={ex.id}
                  name={ex.name}
                  meta={meta}
                  type={ex.type}
                  selected={selectedIds.includes(ex.id)}
                  onToggle={() => onToggle(ex)}
                />
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
