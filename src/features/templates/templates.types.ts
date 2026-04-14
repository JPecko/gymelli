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

export interface TemplateListItem extends WorkoutTemplate {
  workout_template_exercises: Array<{
    exercise_id: string
    order_index: number
    rest_seconds: number | null
    exercises: { name: string } | null
  }>
}
