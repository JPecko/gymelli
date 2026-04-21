export interface WorkoutSession {
  id: string
  profile_id: string
  template_id: string | null
  started_at: string
  finished_at: string | null
  notes: string | null
  calories_burned: number | null
  total_rest_seconds: number | null
}

export interface WorkoutSessionExercise {
  id: string
  session_id: string
  exercise_id: string
  order_index: number
  is_completed: boolean
  rest_seconds: number | null
  default_sets: number | null
  default_reps: number | null
}

export interface ExerciseSet {
  id: string
  session_exercise_id: string
  set_number: number
  weight_kg: number | null
  reps: number | null
  rpe: number | null
  duration_seconds: number | null
  distance_km: number | null
  logged_at: string
}

export interface SessionHistoryItem {
  id: string
  started_at: string
  finished_at: string
  exercise_names: string[]
  duration_seconds: number
  total_sets: number
  total_volume_kg: number
  calories_burned: number | null
  total_rest_seconds: number | null
}
