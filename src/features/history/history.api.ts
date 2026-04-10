import { supabase } from '@/shared/lib/supabase'

export async function getRecentSessions(limit = 20) {
  const { data, error } = await supabase
    .from('workout_sessions')
    .select(`
      id,
      started_at,
      finished_at,
      workout_templates ( name )
    `)
    .not('finished_at', 'is', null)
    .order('started_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}
