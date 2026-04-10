import { supabase } from '@/shared/lib/supabase'
import type { WorkoutTemplate, WorkoutTemplateExercise } from './templates.types'

export async function getTemplates(): Promise<WorkoutTemplate[]> {
  const { data, error } = await supabase
    .from('workout_templates')
    .select('*')
    .order('name')

  if (error) throw error
  return data
}

export async function getTemplateExercises(templateId: string): Promise<WorkoutTemplateExercise[]> {
  const { data, error } = await supabase
    .from('workout_template_exercises')
    .select('*')
    .eq('template_id', templateId)
    .order('order_index')

  if (error) throw error
  return data
}
