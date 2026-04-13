export interface Exercise {
  id: string
  name: string
  muscle_group_id: string
  equipment_id: string | null
  type: 'compound' | 'isolation'
  instructions: string | null
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
}

export interface ExerciseHistorySession {
  session_exercise_id: string
  session_id: string
  started_at: string
  sets: ExerciseHistorySet[]
}
