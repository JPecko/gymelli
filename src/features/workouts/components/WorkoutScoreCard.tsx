import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Input, ScoreRing } from '@/shared/components'
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
        { label: 'Work', value: score.density_score },
        { label: 'Prog', value: score.progress_score },
      ]

  return (
    <div className={styles.card}>
      {/* ── Score ring ────────────────────────────────────────── */}
      <div className={styles.ringWrap}>
        <ScoreRing score={score.score} label={score.label} size={80} />
      </div>

      {/* ── Sub-score breakdown ───────────────────────────────── */}
      <div className={styles.breakdown}>
        {breakdown.map(({ label, value }) => (
          <div key={label} className={styles.breakdownItem}>
            <span className={styles.breakdownValue}>{value}</span>
            <span className={styles.breakdownLabel}>{label}</span>
          </div>
        ))}
      </div>

      {/* ── Calories input ───────────────────────────────────── */}
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

      {showBodyWeightNudge && (
        <button type="button" className={styles.nudge} onClick={() => navigate('/profile')}>
          Add body weight in Profile for a more accurate score →
        </button>
      )}
    </div>
  )
}
