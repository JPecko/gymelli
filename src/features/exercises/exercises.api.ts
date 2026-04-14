import { supabase } from '@/shared/lib/supabase'
import type { Exercise, MuscleGroup, Equipment, ExerciseHistorySession } from './exercises.types'

export async function getExercises(): Promise<Exercise[]> {
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .order('name')

  if (error) throw error
  return data
}

export async function getExercisesByIds(ids: string[]): Promise<Exercise[]> {
  if (ids.length === 0) return []
  const { data, error } = await supabase.from('exercises').select('*').in('id', ids)
  if (error) throw error
  return data
}

export async function getExerciseById(id: string): Promise<Exercise> {
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function getMuscleGroups(): Promise<MuscleGroup[]> {
  const { data, error } = await supabase
    .from('muscle_groups')
    .select('*')
    .order('name')

  if (error) throw error
  return data
}

export async function getEquipment(): Promise<Equipment[]> {
  const { data, error } = await supabase
    .from('equipment')
    .select('*')
    .order('name')

  if (error) throw error
  return data
}

export async function getExercisePR(
  exerciseId: string,
): Promise<{ weight_kg: number; reps: number | null } | null> {
  const { data: ses } = await supabase
    .from('workout_session_exercises')
    .select('id')
    .eq('exercise_id', exerciseId)

  if (!ses?.length) return null

  const { data } = await supabase
    .from('exercise_sets')
    .select('weight_kg, reps')
    .in('session_exercise_id', ses.map((se) => se.id))
    .not('weight_kg', 'is', null)
    .order('weight_kg', { ascending: false })
    .limit(1)
    .single()

  return (data as { weight_kg: number; reps: number | null } | null) ?? null
}

export async function getExerciseHistory(exerciseId: string): Promise<ExerciseHistorySession[]> {
  // 1. All session_exercises for this exercise
  const { data: sessionExercises } = await supabase
    .from('workout_session_exercises')
    .select('id, session_id')
    .eq('exercise_id', exerciseId)

  if (!sessionExercises?.length) return []

  // 2. Finished sessions in descending order (last 10)
  const { data: sessions } = await supabase
    .from('workout_sessions')
    .select('id, started_at')
    .in('id', sessionExercises.map((se) => se.session_id))
    .not('finished_at', 'is', null)
    .order('started_at', { ascending: false })
    .limit(10)

  if (!sessions?.length) return []

  // 3. Sets for each relevant session_exercise
  const sessionIds = new Set(sessions.map((s) => s.id))
  const relevantSEs = sessionExercises.filter((se) => sessionIds.has(se.session_id))

  const { data: sets } = await supabase
    .from('exercise_sets')
    .select('id, session_exercise_id, set_number, weight_kg, reps')
    .in('session_exercise_id', relevantSEs.map((se) => se.id))
    .order('set_number')

  return sessions.map((session) => {
    const se = relevantSEs.find((s) => s.session_id === session.id)
    return {
      session_exercise_id: se?.id ?? '',
      session_id: session.id,
      started_at: session.started_at,
      sets: (sets ?? []).filter((s) => s.session_exercise_id === se?.id),
    }
  })
}
