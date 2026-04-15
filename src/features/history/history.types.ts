export interface VolumeWeek {
  week_label: string   // e.g. "Apr 7"
  week_start: string   // ISO date string (Monday)
  volume_kg: number
  session_count: number
}

export interface PersonalRecord {
  exercise_id: string
  exercise_name: string
  weight_kg: number
  reps: number | null
  set_date: string     // ISO date string
}

// Raw shape returned by getVolumeStats nested query
export interface RawVolumeSession {
  id: string
  started_at: string
  finished_at: string
  workout_session_exercises: Array<{
    exercise_sets: Array<{
      weight_kg: number | null
      reps: number | null
    }>
  }>
}

// Raw shape returned by getPersonalRecords nested query
export interface RawPRSet {
  weight_kg: number
  reps: number | null
  logged_at: string
  workout_session_exercises: {
    exercise_id: string
    exercises: { name: string } | null
    workout_sessions: { finished_at: string | null } | null
  } | null
}
