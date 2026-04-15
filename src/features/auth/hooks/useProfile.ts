import { useState, useEffect } from 'react'
import { getProfile, updateProfile } from '../auth.api'
import type { Profile } from '../auth.types'

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [is_loading, setIsLoading] = useState(true)
  const [is_saving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    getProfile()
      .then(setProfile)
      .finally(() => setIsLoading(false))
  }, [])

  async function saveDisplayName(name: string) {
    setIsSaving(true)
    setError(null)
    setSaved(false)
    try {
      const updated = await updateProfile({ display_name: name.trim() })
      setProfile(updated)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save.')
    } finally {
      setIsSaving(false)
    }
  }

  async function saveBodyStats(body_weight_kg: number | null, sex: 'M' | 'F' | null) {
    setIsSaving(true)
    setError(null)
    setSaved(false)
    try {
      const updated = await updateProfile({ body_weight_kg, sex })
      setProfile(updated)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save.')
    } finally {
      setIsSaving(false)
    }
  }

  return { profile, is_loading, is_saving, error, saved, saveDisplayName, saveBodyStats }
}
