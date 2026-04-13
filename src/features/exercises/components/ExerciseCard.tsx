import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Exercise } from '../exercises.types'
import styles from './ExerciseCard.module.scss'

interface ExerciseCardProps {
  exercise: Exercise
  muscleGroupName: string
  equipmentName: string | null
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

export function ExerciseCard({ exercise, muscleGroupName, equipmentName }: ExerciseCardProps) {
  const navigate = useNavigate()
  const [imgFailed, setImgFailed] = useState(false)
  const slug = toSlug(exercise.name)
  const meta = [muscleGroupName, equipmentName].filter(Boolean).join(' · ')

  return (
    <button className={styles.card} onClick={() => navigate(`/exercises/${exercise.id}`)}>
      <div className={styles.imageWrap}>
        {imgFailed ? (
          <div className={styles.placeholder}>
            <span className={styles.placeholderLabel}>{muscleGroupName}</span>
          </div>
        ) : (
          <img
            className={styles.image}
            src={`/images/exercises/${slug}.png`}
            alt={exercise.name}
            onError={() => setImgFailed(true)}
          />
        )}
        <span className={styles.badge}>{exercise.type}</span>
      </div>

      <div className={styles.info}>
        <p className={styles.name}>{exercise.name}</p>
        <p className={styles.meta}>{meta}</p>
      </div>
    </button>
  )
}
