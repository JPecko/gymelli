import { SetRow } from './SetRow'
import styles from './SetsCard.module.scss'

interface SetEntry {
  set_number: number
  weight_kg: number | null
  reps: number | null
}

interface SetsCardProps {
  header: React.ReactNode
  sets: SetEntry[]
  emptyMessage?: string
}

export function SetsCard({ header, sets, emptyMessage = 'No sets recorded.' }: SetsCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>{header}</div>
      <div className={styles.body}>
        {sets.length === 0 ? (
          <p className={styles.empty}>{emptyMessage}</p>
        ) : (
          sets.map((set) => (
            <SetRow
              key={set.set_number}
              setNumber={set.set_number}
              weight_kg={set.weight_kg}
              reps={set.reps}
            />
          ))
        )}
      </div>
    </div>
  )
}
