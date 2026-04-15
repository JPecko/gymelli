import { supabase } from '@/shared/lib/supabase'
import type { WorkoutSession, WorkoutSessionExercise, ExerciseSet, SessionHistoryItem } from './workouts.types'

export async function getSessionById(id: string): Promise<WorkoutSession> {
  const { data, error } = await supabase
    .from('workout_sessions')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function getSessionHistory(limit = 20): Promise<SessionHistoryItem[]> {
  const { data, error } = await supabase
    .from('workout_sessions')
    .select(`
      id,
      started_at,
      finished_at,
      calories_burned,
      total_rest_seconds,
      workout_session_exercises (
        order_index,
        exercises ( name ),
        exercise_sets ( weight_kg, reps )
      )
    `)
    .not('finished_at', 'is', null)
    .order('started_at', { ascending: false })
    .limit(limit)

  if (error) throw error

  return (data ?? []).map((session) => {
    const sessionExercises = (session.workout_session_exercises ?? []) as unknown as Array<{
      order_index: number
      exercises: { name: string } | null
      exercise_sets: Array<{ weight_kg: number | null; reps: number | null }>
    }>

    const sorted = [...sessionExercises].sort((a, b) => a.order_index - b.order_index)
    const allSets = sorted.flatMap((se) => se.exercise_sets ?? [])

    return {
      id: session.id,
      started_at: session.started_at,
      finished_at: session.finished_at as string,
      exercise_names: sorted.map((se) => se.exercises?.name ?? '').filter(Boolean),
      duration_seconds: Math.floor(
        (new Date(session.finished_at as string).getTime() - new Date(session.started_at).getTime()) / 1000,
      ),
      total_sets: allSets.length,
      total_volume_kg: allSets.reduce((acc, s) => acc + (s.weight_kg ?? 0) * (s.reps ?? 0), 0),
      calories_burned: (session as unknown as { calories_burned: number | null }).calories_burned,
      total_rest_seconds: (session as unknown as { total_rest_seconds: number | null }).total_rest_seconds,
    }
  })
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

export async function finishSession(sessionId: string, totalRestSeconds: number): Promise<void> {
  const { error } = await supabase
    .from('workout_sessions')
    .update({ finished_at: new Date().toISOString(), total_rest_seconds: totalRestSeconds })
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

export async function updateSessionCalories(sessionId: string, calories: number | null): Promise<void> {
  const { error } = await supabase
    .from('workout_sessions')
    .update({ calories_burned: calories })
    .eq('id', sessionId)

  if (error) throw error
}

export async function deleteSet(setId: string): Promise<void> {
  const { error } = await supabase.from('exercise_sets').delete().eq('id', setId)
  if (error) throw error
}

export async function deleteSessionExercise(sessionExerciseId: string): Promise<void> {
  const { error } = await supabase
    .from('workout_session_exercises')
    .delete()
    .eq('id', sessionExerciseId)

  if (error) throw error
}

export async function addSessionExercise(
  sessionId: string,
  exerciseId: string,
  orderIndex: number,
  restSeconds?: number | null,
): Promise<WorkoutSessionExercise> {
  const { data, error } = await supabase
    .from('workout_session_exercises')
    .insert({
      session_id: sessionId,
      exercise_id: exerciseId,
      order_index: orderIndex,
      is_completed: false,
      rest_seconds: restSeconds ?? null,
    })
    .select()
    .single()

  if (error) throw error
  return data
}
