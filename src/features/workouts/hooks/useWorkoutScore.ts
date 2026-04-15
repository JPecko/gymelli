import { useMemo } from 'react'

export interface WorkoutScoreInput {
  total_volume_kg: number
  duration_seconds: number
  exercise_count: number
  pr_count: number
  calories_burned: number | null
  body_weight_kg: number | null
  sex: 'M' | 'F' | null
  total_rest_seconds: number | null
}

export interface WorkoutScore {
  score: number  // 0–100
  label: 'Poor' | 'Fair' | 'Good' | 'Great' | 'Elite'
  volume_score: number
  density_score: number
  progress_score: number
  calorie_score: number | null  // null when no calories provided
}

const SEX_VOLUME_FACTOR = { M: 1, F: 1.15 } as const

function toLabel(score: number): WorkoutScore['label'] {
  if (score >= 81) return 'Elite'
  if (score >= 61) return 'Great'
  if (score >= 41) return 'Good'
  if (score >= 21) return 'Fair'
  return 'Poor'
}

export function computeWorkoutScore(input: WorkoutScoreInput): WorkoutScore {
  const { total_volume_kg, duration_seconds, exercise_count, pr_count,
          calories_burned, body_weight_kg, sex, total_rest_seconds } = input
  const duration_minutes = duration_seconds / 60

  // ── Volume score (0–100) ────────────────────────────────────────────────
  // Target: 50× body weight in relative volume (e.g. 75 kg person → 3 750 kg)
  const sex_factor = sex ? SEX_VOLUME_FACTOR[sex] : 1
  const volume_raw =
    body_weight_kg && body_weight_kg > 0
      ? ((total_volume_kg / body_weight_kg) / 50) * 100 * sex_factor
      : (total_volume_kg / 3500) * 100 * sex_factor
  const volume_score = Math.min(100, Math.max(0, Math.round(volume_raw)))

  // ── Density score (0–100) ───────────────────────────────────────────────
  // Measures net work time relative to a 30-min benchmark.
  // Formula: work_seconds / max(duration_seconds, 1800) × 100
  // - Short sessions (< 30 min) are penalised because denominator stays at 1800
  // - Longer sessions are judged on actual work/rest ratio
  // - When total_rest_seconds is null (legacy sessions) we assume 0 rest
  const rest_s = total_rest_seconds ?? 0
  const work_s = Math.max(0, duration_seconds - rest_s)
  const density_raw = (work_s / Math.max(duration_seconds, 1800)) * 100
  const density_score = Math.min(100, Math.max(0, Math.round(density_raw)))

  // ── Progress score (0–100) ─────────────────────────────────────────────
  const progress_score =
    exercise_count > 0 ? Math.round((pr_count / exercise_count) * 100) : 0

  // ── Calorie score (0–100, optional) ────────────────────────────────────
  // Target: 5 kcal per kg of body weight per hour
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
  // Without calories: Volume 40% + Density  30% + Progress 30%
  const raw =
    calorie_score != null
      ? volume_score * 0.35 + calorie_score * 0.35 + progress_score * 0.30
      : volume_score * 0.40 + density_score * 0.30 + progress_score * 0.30

  const score = Math.min(100, Math.max(0, Math.round(raw)))

  return { score, label: toLabel(score), volume_score, density_score, progress_score, calorie_score }
}

export function useWorkoutScore(input: WorkoutScoreInput): WorkoutScore {
  return useMemo(
    () => computeWorkoutScore(input),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [input.total_volume_kg, input.duration_seconds, input.exercise_count, input.pr_count,
     input.calories_burned, input.body_weight_kg, input.sex, input.total_rest_seconds],
  )
}
