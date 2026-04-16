import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import styles from './ExerciseCard.module.scss'

type ExerciseCardProps = {
  name: string
  meta: string
  muscleGroupName: string
  type: 'compound' | 'isolation'
} & (
  | { exerciseId: string; selected?: never; onToggle?: never }
  | { exerciseId?: never; selected: boolean; onToggle: () => void }
)

function toSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export function ExerciseCard({
  name,
  meta,
  muscleGroupName,
  type,
  exerciseId,
  selected,
  onToggle,
}: ExerciseCardProps) {
  const navigate = useNavigate()
  const [imgFailed, setImgFailed] = useState(false)
  const slug = toSlug(name)
  const isPicker = onToggle !== undefined

  function handleClick() {
    if (isPicker) onToggle()
    else navigate(`/exercises/${exerciseId}`)
  }

  return (
    <button
      className={clsx(styles.card, isPicker && selected && styles.selected)}
      onClick={handleClick}
    >
      <div className={styles.imageWrap}>
        {imgFailed ? (
          <div className={styles.placeholder}>
            <span className={styles.placeholderLabel}>{muscleGroupName}</span>
          </div>
        ) : (
          <img
            className={styles.image}
            src={`/images/exercises/${slug}.png`}
            alt={name}
            onError={() => setImgFailed(true)}
          />
        )}
        {isPicker && (
          <span className={clsx(styles.checkOverlay, selected && styles.checkOverlaySelected)}>
            ✓
          </span>
        )}
      </div>

      <div className={styles.info}>
        <p className={styles.name}>{name}</p>
        <p className={styles.meta}>{meta}</p>
        <p className={styles.type}>{type}</p>
      </div>
    </button>
  )
}
