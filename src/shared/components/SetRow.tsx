import styles from './SetRow.module.scss'

interface SetRowProps {
  setNumber: number
  weight_kg: number | null
  reps: number | null
}

export function SetRow({ setNumber, weight_kg, reps }: SetRowProps) {
  const value = [
    weight_kg != null ? `${weight_kg} kg` : '—',
    reps != null ? `× ${reps}` : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={styles.row}>
      <span className={styles.number}>Set {setNumber}</span>
      <span className={styles.value}>{value}</span>
    </div>
  )
}
