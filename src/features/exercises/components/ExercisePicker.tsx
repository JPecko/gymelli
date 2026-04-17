import { useMemo } from 'react'
import type { Exercise } from '@/features/exercises/exercises.types'
import { SearchField, CardGrid } from '@/shared/components'
import { useExercisesWithMeta } from '../hooks/useExercisesWithMeta'
import { useExerciseFilter } from '../hooks/useExerciseFilter'
import { ExerciseCard } from './ExerciseCard'
import { ExerciseFilters } from './ExerciseFilters'
import styles from './ExercisePicker.module.scss'

interface ExercisePickerProps {
  selectedIds: string[]
  onToggle: (exercise: Exercise) => void
}

export function ExercisePicker({ selectedIds, onToggle }: ExercisePickerProps) {
  const { exercises, muscleGroups, equipment, isLoading } = useExercisesWithMeta()
  const {
    filtered,
    query,
    setQuery,
    activeMuscleGroupId,
    setActiveMuscleGroupId,
    activeEquipmentId,
    setActiveEquipmentId,
  } = useExerciseFilter(exercises)
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds])

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
          placeholder="Search by name, muscle, equipment..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search exercises"
        />
        <ExerciseFilters
          muscleGroups={muscleGroups}
          activeMuscleGroupId={activeMuscleGroupId}
          onMuscleGroupChange={setActiveMuscleGroupId}
          equipment={equipment}
          activeEquipmentId={activeEquipmentId}
          onEquipmentChange={setActiveEquipmentId}
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
            <CardGrid>
              {groupExs.map((ex) => {
                const meta = [ex.muscle_group_name, ex.equipment_name].filter(Boolean).join(' · ')
                return (
                  <ExerciseCard
                    key={ex.id}
                    name={ex.name}
                    meta={meta}
                    muscleGroupName={ex.muscle_group_name}
                    type={ex.type}
                    selected={selectedSet.has(ex.id)}
                    onToggle={() => onToggle(ex)}
                  />
                )
              })}
            </CardGrid>
          </div>
        ))}
      </div>
    </div>
  )
}
