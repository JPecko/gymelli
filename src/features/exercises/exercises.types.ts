export type TrackingType = 'weight_reps' | 'reps_only' | 'duration' | 'distance'

export interface Exercise {
  id: string
  name: string
  muscle_group_id: string
  equipment_id: string | null
  type: 'compound' | 'isolation'
  tracking_type: TrackingType
  instructions: string | null
  image_url: string | null
}

export interface ExerciseGoal {
  id: string
  user_id: string
  exercise_id: string
  target_weight_kg: number | null
  target_reps: number | null
  target_duration_seconds: number | null
  target_distance_km: number | null
  note: string | null
  target_date: string | null
  created_at: string
}

export interface MuscleGroup {
  id: string
  name: string
}

export interface Equipment {
  id: string
  name: string
}

export interface ExerciseHistorySet {
  id: string
  set_number: number
  weight_kg: number | null
  reps: number | null
  duration_seconds: number | null
  distance_km: number | null
}

export interface ExerciseHistorySession {
  session_exercise_id: string
  session_id: string
  started_at: string
  sets: ExerciseHistorySet[]
}
