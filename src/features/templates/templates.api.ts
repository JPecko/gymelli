import { supabase } from '@/shared/lib/supabase'
import type { WorkoutTemplate, WorkoutTemplateExercise, TemplateListItem } from './templates.types'

export async function getTemplatesWithExercises(): Promise<TemplateListItem[]> {
  const { data, error } = await supabase
    .from('workout_templates')
    .select(`
      *,
      workout_template_exercises (
        exercise_id,
        order_index,
        exercises ( name )
      )
    `)
    .order('name')

  if (error) throw error
  return (data ?? []) as unknown as TemplateListItem[]
}

export async function getTemplateById(id: string): Promise<WorkoutTemplate> {
  const { data, error } = await supabase
    .from('workout_templates')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

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

export async function createTemplate(
  name: string,
  description?: string | null,
): Promise<WorkoutTemplate> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('workout_templates')
    .insert({ profile_id: user.id, name, description: description ?? null })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateTemplate(
  id: string,
  name: string,
  description?: string | null,
): Promise<WorkoutTemplate> {
  const { data, error } = await supabase
    .from('workout_templates')
    .update({ name, description: description ?? null })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteTemplate(id: string): Promise<void> {
  const { error } = await supabase.from('workout_templates').delete().eq('id', id)
  if (error) throw error
}

export async function addTemplateExercise(
  templateId: string,
  exerciseId: string,
  orderIndex: number,
  defaults?: { default_sets?: number; default_reps?: number; rest_seconds?: number },
): Promise<WorkoutTemplateExercise> {
  const { data, error } = await supabase
    .from('workout_template_exercises')
    .insert({
      template_id: templateId,
      exercise_id: exerciseId,
      order_index: orderIndex,
      default_sets: defaults?.default_sets ?? null,
      default_reps: defaults?.default_reps ?? null,
      rest_seconds: defaults?.rest_seconds ?? null,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function removeTemplateExercise(id: string): Promise<void> {
  const { error } = await supabase.from('workout_template_exercises').delete().eq('id', id)
  if (error) throw error
}
