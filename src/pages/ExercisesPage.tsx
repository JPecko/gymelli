import { useNavigate } from 'react-router-dom'
import { useExercisesWithMeta } from '@/features/exercises/hooks/useExercisesWithMeta'
import { useExerciseFilter } from '@/features/exercises/hooks/useExerciseFilter'
import { ExerciseCard } from '@/features/exercises/components/ExerciseCard'
import { ExerciseFilters } from '@/features/exercises/components/ExerciseFilters'
import { SearchField, CardGrid } from '@/shared/components'
import styles from './ExercisesPage.module.scss'

export function ExercisesPage() {
  const navigate = useNavigate()
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

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Exercises</h1>
        <button className={styles.newBtn} onClick={() => navigate('/exercises/new')}>+ New</button>
      </header>

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

      {isLoading && <p className={styles.state}>Loading...</p>}

      {!isLoading && filtered.length === 0 && (
        <p className={styles.state}>No exercises found.</p>
      )}

      {!isLoading && filtered.length > 0 && (
        <CardGrid>
          {filtered.map((ex) => {
            const meta = [ex.muscle_group_name, ex.equipment_name].filter(Boolean).join(' · ')
            return (
              <ExerciseCard
                key={ex.id}
                exerciseId={ex.id}
                name={ex.name}
                meta={meta}
                muscleGroupName={ex.muscle_group_name}
                type={ex.type}
              />
            )
          })}
        </CardGrid>
      )}
    </div>
  )
}
