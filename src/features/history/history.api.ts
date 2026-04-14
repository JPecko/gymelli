import { supabase } from '@/shared/lib/supabase'
import type { RawVolumeSession, RawPRSet } from './history.types'

export async function getVolumeStats(limitDays = 90): Promise<RawVolumeSession[]> {
  const since = new Date()
  since.setDate(since.getDate() - limitDays)

  const { data, error } = await supabase
    .from('workout_sessions')
    .select(`
      id,
      started_at,
      finished_at,
      workout_session_exercises (
        exercise_sets ( weight_kg, reps )
      )
    `)
    .not('finished_at', 'is', null)
    .gte('started_at', since.toISOString())
    .order('started_at', { ascending: true })

  if (error) throw error
  return (data ?? []) as unknown as RawVolumeSession[]
}

export async function getPersonalRecords(): Promise<RawPRSet[]> {
  const { data, error } = await supabase
    .from('exercise_sets')
    .select(`
      weight_kg,
      reps,
      logged_at,
      workout_session_exercises!inner (
        exercise_id,
        exercises!inner ( name )
      )
    `)
    .not('weight_kg', 'is', null)
    .gt('weight_kg', 0)
    .order('weight_kg', { ascending: false })
    .limit(2000)

  if (error) throw error
  return (data ?? []) as unknown as RawPRSet[]
}
