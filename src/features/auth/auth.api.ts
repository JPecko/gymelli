import { supabase } from '@/shared/lib/supabase'
import type { Profile } from './auth.types'

export async function getProfile(): Promise<Profile | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) throw error
  return data
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) throw error
  // session is null when email confirmation is required
  return { user: data.user, requiresConfirmation: !data.session }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}
