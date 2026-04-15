import { useMemo } from 'react'

export interface WorkoutScoreInput {
  total_volume_kg: number
  duration_seconds: number
  exercise_count: number
  pr_count: number
  calories_burned: number | null
  body_weight_kg: number | null
  sex: 'M' | 'F' | null
}

export interface WorkoutScore {
  score: number  // 0–100
  label: 'Poor' | 'Fair' | 'Good' | 'Great' | 'Elite'
  volume_score: number
  efficiency_score: number
  progress_score: number
  calorie_score: number | null  // null when no calories provided
}

// Female volume normalisation: strength standards are lower, so F scores are
// adjusted upward so the same relative effort yields the same score.
const SEX_VOLUME_FACTOR = { M: 1, F: 1.15 } as const

function toLabel(score: number): WorkoutScore['label'] {
  if (score >= 81) return 'Elite'
  if (score >= 61) return 'Great'
  if (score >= 41) return 'Good'
  if (score >= 21) return 'Fair'
  return 'Poor'
}

// Pure computation — exported so it can be used outside React (tests, etc.)
export function computeWorkoutScore(input: WorkoutScoreInput): WorkoutScore {
  const { total_volume_kg, duration_seconds, exercise_count, pr_count, calories_burned, body_weight_kg, sex } = input
  const duration_minutes = duration_seconds / 60

  // ── Volume score (0–100) ────────────────────────────────────────────────
  // Target: 50× body weight in relative volume (e.g. 75 kg person → 3 750 kg)
  // Fallback target when body weight unknown: 3 500 kg absolute volume
  const sex_factor = sex ? SEX_VOLUME_FACTOR[sex] : 1
  const volume_raw =
    body_weight_kg && body_weight_kg > 0
      ? ((total_volume_kg / body_weight_kg) / 50) * 100 * sex_factor
      : (total_volume_kg / 3500) * 100 * sex_factor
  const volume_score = Math.min(100, Math.max(0, Math.round(volume_raw)))

  // ── Efficiency score (0–100) ────────────────────────────────────────────
  // Volume density: kg lifted per minute. Target 60 kg/min = score 100.
  const vol_per_min = duration_minutes > 0 ? total_volume_kg / duration_minutes : 0
  const efficiency_score = Math.min(100, Math.max(0, Math.round((vol_per_min / 60) * 100)))

  // ── Progress score (0–100) ─────────────────────────────────────────────
  // Fraction of exercises that hit a new PR this session.
  const progress_score =
    exercise_count > 0 ? Math.round((pr_count / exercise_count) * 100) : 0

  // ── Calorie score (0–100, optional) ────────────────────────────────────
  // Target: 5 kcal per kg of body weight per hour (≈ 375 kcal for 75 kg / 1 h)
  // Fallback when body weight unknown: 400 kcal/hour
  let calorie_score: number | null = null
  if (calories_burned != null && calories_burned > 0 && duration_minutes > 0) {
    const target =
      body_weight_kg && body_weight_kg > 0
        ? body_weight_kg * (duration_minutes / 60) * 5
        : (duration_minutes / 60) * 400
    calorie_score = Math.min(100, Math.max(0, Math.round((calories_burned / target) * 100)))
  }

  // ── Weighted final score ────────────────────────────────────────────────
  // With calories:    Volume 35% + Calories 35% + Progress 30%
  // Without calories: Volume 40% + Efficiency 30% + Progress 30%
  const raw =
    calorie_score != null
      ? volume_score * 0.35 + calorie_score * 0.35 + progress_score * 0.30
      : volume_score * 0.40 + efficiency_score * 0.30 + progress_score * 0.30

  const score = Math.min(100, Math.max(0, Math.round(raw)))

  return { score, label: toLabel(score), volume_score, efficiency_score, progress_score, calorie_score }
}

export function useWorkoutScore(input: WorkoutScoreInput): WorkoutScore {
  return useMemo(
    () => computeWorkoutScore(input),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [input.total_volume_kg, input.duration_seconds, input.exercise_count, input.pr_count,
     input.calories_burned, input.body_weight_kg, input.sex],
  )
}
