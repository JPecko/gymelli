import { supabase } from '@/shared/lib/supabase'
import type { RawDashboardSession } from './dashboard.types'

export async function getDashboardData(limitDays = 60): Promise<RawDashboardSession[]> {
  const since = new Date()
  since.setDate(since.getDate() - limitDays)

  const { data, error } = await supabase
    .from('workout_sessions')
    .select(`
      id,
      started_at,
      finished_at,
      template_id,
      workout_session_exercises (
        order_index,
        exercises ( name ),
        exercise_sets ( weight_kg, reps )
      )
    `)
    .not('finished_at', 'is', null)
    .gte('started_at', since.toISOString())
    .order('started_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as unknown as RawDashboardSession[]
}
