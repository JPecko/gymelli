import clsx from 'clsx'
import type { Equipment, MuscleGroup } from '../exercises.types'
import styles from './ExerciseFilters.module.scss'

interface ExerciseFiltersProps {
  muscleGroups?: MuscleGroup[]
  activeMuscleGroupId?: string | null
  onMuscleGroupChange?: (id: string | null) => void
  equipment?: Equipment[]
  activeEquipmentId?: string | null
  onEquipmentChange?: (id: string | null) => void
}

export function ExerciseFilters({
  muscleGroups = [],
  activeMuscleGroupId = null,
  onMuscleGroupChange,
  equipment = [],
  activeEquipmentId = null,
  onEquipmentChange,
}: ExerciseFiltersProps) {
  return (
    <div className={styles.filters}>
      {muscleGroups.length > 0 && onMuscleGroupChange && (
        <div className={styles.chips}>
          <button
            type="button"
            className={clsx(styles.chip, activeMuscleGroupId === null && styles.active)}
            onClick={() => onMuscleGroupChange(null)}
          >
            All
          </button>
          {muscleGroups.map((mg) => (
            <button
              key={mg.id}
              type="button"
              className={clsx(styles.chip, activeMuscleGroupId === mg.id && styles.active)}
              onClick={() => onMuscleGroupChange(mg.id)}
            >
              {mg.name}
            </button>
          ))}
        </div>
      )}

      {equipment.length > 0 && onEquipmentChange && (
        <div className={styles.chips}>
          <button
            type="button"
            className={clsx(styles.chip, activeEquipmentId === null && styles.active)}
            onClick={() => onEquipmentChange(null)}
          >
            All
          </button>
          {equipment.map((eq) => (
            <button
              key={eq.id}
              type="button"
              className={clsx(styles.chip, activeEquipmentId === eq.id && styles.active)}
              onClick={() => onEquipmentChange(eq.id)}
            >
              {eq.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
