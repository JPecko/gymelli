import clsx from 'clsx'
import styles from './ExercisePickerItem.module.scss'

interface ExercisePickerItemProps {
  name: string
  meta: string
  type: 'compound' | 'isolation'
  selected: boolean
  onToggle: () => void
}

export function ExercisePickerItem({ name, meta, type, selected, onToggle }: ExercisePickerItemProps) {
  return (
    <button
      className={clsx(styles.item, selected && styles.selected)}
      onClick={onToggle}
    >
      <span className={clsx(styles.check, selected && styles.checkSelected)}>
        {selected && '✓'}
      </span>

      <div className={styles.info}>
        <span className={styles.name}>{name}</span>
        <span className={styles.meta}>{meta}</span>
      </div>

      <span className={clsx(styles.type, type === 'compound' && styles.compound)}>
        {type}
      </span>
    </button>
  )
}
