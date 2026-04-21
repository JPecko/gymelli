export interface RawDashboardSession {
  id: string
  started_at: string
  finished_at: string
  template_id: string | null
  calories_burned: number | null
  total_rest_seconds: number | null
  pr_count: number
  workout_session_exercises: Array<{
    order_index: number
    exercises: { name: string } | null
    exercise_sets: Array<{ weight_kg: number | null; reps: number | null }>
  }>
}

export interface DashboardLastSession {
  id: string
  started_at: string
  finished_at: string
  template_id: string | null
  exercise_names: string[]
  duration_seconds: number
  total_sets: number
  total_volume_kg: number
  calories_burned: number | null
  total_rest_seconds: number | null
  pr_count: number
}

export interface DashboardData {
  streak: number
  this_week_volume_kg: number
  last_session: DashboardLastSession | null
}
