import { supabase } from '@/shared/lib/supabase'
import type { Exercise, MuscleGroup, Equipment, ExerciseHistorySession, ExerciseGoal, TrackingType } from './exercises.types'

export interface ExercisePayload {
  name: string
  muscle_group_id: string
  equipment_id: string | null
  type: 'compound' | 'isolation'
  tracking_type: TrackingType
  instructions: string | null
  image_url?: string | null
}

export async function createExercise(payload: ExercisePayload): Promise<Exercise> {
  const { data, error } = await supabase
    .from('exercises')
    .insert(payload)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateExercise(id: string, payload: Partial<ExercisePayload>): Promise<Exercise> {
  const { data, error } = await supabase
    .from('exercises')
    .update(payload)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function uploadExerciseImage(file: File): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'png'
  const path = `${crypto.randomUUID()}.${ext}`

  const { error } = await supabase.storage
    .from('exercise-images')
    .upload(path, file, { upsert: true })

  if (error) throw error

  const { data } = supabase.storage.from('exercise-images').getPublicUrl(path)
  return data.publicUrl
}

export async function getExerciseGoal(exerciseId: string): Promise<ExerciseGoal | null> {
  const { data } = await supabase
    .from('exercise_goals')
    .select('*')
    .eq('exercise_id', exerciseId)
    .maybeSingle()

  return data ?? null
}

export async function upsertExerciseGoal(
  exerciseId: string,
  goal: Omit<ExerciseGoal, 'id' | 'user_id' | 'exercise_id' | 'created_at'>,
): Promise<ExerciseGoal> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('exercise_goals')
    .upsert({ ...goal, user_id: user.id, exercise_id: exerciseId }, { onConflict: 'user_id,exercise_id' })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteExerciseGoal(exerciseId: string): Promise<void> {
  const { error } = await supabase
    .from('exercise_goals')
    .delete()
    .eq('exercise_id', exerciseId)

  if (error) throw error
}

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

export interface ExercisePR {
  weight_kg: number | null
  reps: number | null
  duration_seconds: number | null
  distance_km: number | null
}

export async function getExercisePR(
  exerciseId: string,
  trackingType: TrackingType = 'weight_reps',
): Promise<ExercisePR | null> {
  const { data: ses } = await supabase
    .from('workout_session_exercises')
    .select('id')
    .eq('exercise_id', exerciseId)

  if (!ses?.length) return null

  const seIds = ses.map((se) => se.id)

  if (trackingType === 'weight_reps') {
    const { data } = await supabase
      .from('exercise_sets')
      .select('weight_kg, reps, duration_seconds, distance_km')
      .in('session_exercise_id', seIds)
      .not('weight_kg', 'is', null)
      .order('weight_kg', { ascending: false })
      .limit(1)
      .maybeSingle()
    return data ?? null
  }

  if (trackingType === 'reps_only') {
    const { data } = await supabase
      .from('exercise_sets')
      .select('weight_kg, reps, duration_seconds, distance_km')
      .in('session_exercise_id', seIds)
      .not('reps', 'is', null)
      .order('reps', { ascending: false })
      .limit(1)
      .maybeSingle()
    return data ?? null
  }

  if (trackingType === 'duration') {
    const { data } = await supabase
      .from('exercise_sets')
      .select('weight_kg, reps, duration_seconds, distance_km')
      .in('session_exercise_id', seIds)
      .not('duration_seconds', 'is', null)
      .order('duration_seconds', { ascending: false })
      .limit(1)
      .maybeSingle()
    return data ?? null
  }

  // distance
  const { data } = await supabase
    .from('exercise_sets')
    .select('weight_kg, reps, duration_seconds, distance_km')
    .in('session_exercise_id', seIds)
    .not('distance_km', 'is', null)
    .order('distance_km', { ascending: false })
    .limit(1)
    .maybeSingle()
  return data ?? null
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
    .select('id, session_exercise_id, set_number, weight_kg, reps, duration_seconds, distance_km')
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
