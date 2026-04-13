import { supabase } from '@/shared/lib/supabase'
import type { WorkoutSession, WorkoutSessionExercise, ExerciseSet } from './workouts.types'

export async function getSessionById(id: string): Promise<WorkoutSession> {
  const { data, error } = await supabase
    .from('workout_sessions')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function getActiveSessions(): Promise<WorkoutSession[]> {
  const { data, error } = await supabase
    .from('workout_sessions')
    .select('*')
    .is('finished_at', null)
    .order('started_at', { ascending: false })

  if (error) throw error
  return data
}

export async function startSession(templateId: string | null): Promise<WorkoutSession> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('workout_sessions')
    .insert({ profile_id: user.id, template_id: templateId, started_at: new Date().toISOString() })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function finishSession(sessionId: string): Promise<void> {
  const { error } = await supabase
    .from('workout_sessions')
    .update({ finished_at: new Date().toISOString() })
    .eq('id', sessionId)

  if (error) throw error
}

export async function getSessionExercises(sessionId: string): Promise<WorkoutSessionExercise[]> {
  const { data, error } = await supabase
    .from('workout_session_exercises')
    .select('*')
    .eq('session_id', sessionId)
    .order('order_index')

  if (error) throw error
  return data
}

export async function logSet(set: Omit<ExerciseSet, 'id' | 'logged_at'>): Promise<ExerciseSet> {
  const { data, error } = await supabase
    .from('exercise_sets')
    .insert({ ...set, logged_at: new Date().toISOString() })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getSetsForSessionExercise(sessionExerciseId: string): Promise<ExerciseSet[]> {
  const { data, error } = await supabase
    .from('exercise_sets')
    .select('*')
    .eq('session_exercise_id', sessionExerciseId)
    .order('set_number')

  if (error) throw error
  return data
}

export async function getPreviousSetsForExercise(
  exerciseId: string,
  currentSessionId: string,
): Promise<ExerciseSet[]> {
  const { data: sessionExercises } = await supabase
    .from('workout_session_exercises')
    .select('id, session_id')
    .eq('exercise_id', exerciseId)
    .neq('session_id', currentSessionId)

  if (!sessionExercises?.length) return []

  const { data: latestSession } = await supabase
    .from('workout_sessions')
    .select('id')
    .in('id', sessionExercises.map((se) => se.session_id))
    .not('finished_at', 'is', null)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!latestSession) return []

  const se = sessionExercises.find((s) => s.session_id === latestSession.id)
  if (!se) return []

  const { data, error } = await supabase
    .from('exercise_sets')
    .select('*')
    .eq('session_exercise_id', se.id)
    .order('set_number')

  if (error) return []
  return data ?? []
}

export async function deleteSet(setId: string): Promise<void> {
  const { error } = await supabase.from('exercise_sets').delete().eq('id', setId)
  if (error) throw error
}
