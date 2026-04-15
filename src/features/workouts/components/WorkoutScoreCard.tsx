import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Input } from '@/shared/components'
import type { WorkoutScore } from '../hooks/useWorkoutScore'
import styles from './WorkoutScoreCard.module.scss'

interface Props {
  score: WorkoutScore
  calories: number | null
  onCaloriesSave: (value: number | null) => void
  showBodyWeightNudge: boolean
}

export function WorkoutScoreCard({ score, calories, onCaloriesSave, showBodyWeightNudge }: Props) {
  const navigate = useNavigate()
  const [caloriesInput, setCaloriesInput] = useState(calories != null ? String(calories) : '')

  function handleCaloriesBlur() {
    const trimmed = caloriesInput.trim()
    const value = trimmed !== '' ? Math.round(parseFloat(trimmed)) : null
    if (!isNaN(value ?? 0)) onCaloriesSave(value)
  }

  const breakdown = score.calorie_score != null
    ? [
        { label: 'Vol', value: score.volume_score },
        { label: 'Cal', value: score.calorie_score },
        { label: 'Prog', value: score.progress_score },
      ]
    : [
        { label: 'Vol', value: score.volume_score },
        { label: 'Eff', value: score.efficiency_score },
        { label: 'Prog', value: score.progress_score },
      ]

  return (
    <div className={styles.card}>
      <div className={styles.scoreRow}>
        <div className={styles.scoreLeft}>
          <span className={styles.scoreNumber}>{score.score}</span>
          <span className={styles.scoreMax}>/100</span>
        </div>
        <span className={styles.scoreLabel} data-label={score.label}>{score.label}</span>
      </div>

      <div className={styles.breakdown}>
        {breakdown.map(({ label, value }) => (
          <div key={label} className={styles.breakdownItem}>
            <span className={styles.breakdownValue}>{value}</span>
            <span className={styles.breakdownLabel}>{label}</span>
          </div>
        ))}
      </div>

      <div className={styles.calories}>
        <Input
          label="Calories burned (kcal)"
          id="calories"
          type="number"
          inputMode="numeric"
          value={caloriesInput}
          onChange={(e) => setCaloriesInput(e.target.value)}
          onBlur={handleCaloriesBlur}
          placeholder="From smartwatch (optional)"
        />
      </div>

      {showBodyWeightNudge && (
        <button type="button" className={styles.nudge} onClick={() => navigate('/profile')}>
          Add body weight in Profile for a more accurate score →
        </button>
      )}
    </div>
  )
}
