import { useState } from 'react'
import { ExerciseCard } from '@/features/exercises/components/ExerciseCard'
import { useExercisesWithMeta } from '@/features/exercises/hooks/useExercisesWithMeta'
import { SearchField, CardGrid } from '@/shared/components'
import styles from './ExercisesPage.module.scss'

export function ExercisesPage() {
  const { exercises, isLoading } = useExercisesWithMeta()
  const [query, setQuery] = useState('')

  const filtered = query
    ? exercises.filter((ex) => ex.name.toLowerCase().includes(query.toLowerCase()))
    : exercises

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Exercises</h1>
      </header>

      <div className={styles.searchWrap}>
        <SearchField
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
