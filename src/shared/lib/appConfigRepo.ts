import { supabase } from './supabase'

/** Returns the remote app_version from app_config, or null on any failure. */
export async function getRemoteAppVersion(): Promise<string | null> {
  try {
    const { data } = await supabase
      .from('app_config')
      .select('value')
      .eq('key', 'app_version')
      .single()
    return (data as { value: string } | null)?.value ?? null
  } catch {
    return null
  }
}
