export interface WorkoutTemplate {
  id: string
  profile_id: string
  name: string
  description: string | null
}

export interface WorkoutTemplateExercise {
  id: string
  template_id: string
  exercise_id: string
  order_index: number
  default_sets: number | null
  default_reps: number | null
  rest_seconds: number | null
}
