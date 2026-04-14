import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProfile } from '@/features/auth/hooks/useProfile'
import { signOut } from '@/features/auth'
import { Button, Input } from '@/shared/components'
import styles from './ProfilePage.module.scss'

export function ProfilePage() {
  const navigate = useNavigate()
  const { profile, is_loading, is_saving, error, saved, saveDisplayName } = useProfile()
  const [name, setName] = useState('')

  useEffect(() => {
    if (profile) setName(profile.display_name ?? '')
  }, [profile])

  async function handleSignOut() {
    await signOut()
    navigate('/login', { replace: true })
  }

  if (is_loading) return <div className={styles.page}><p className={styles.state}>Loading...</p></div>

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Profile</h1>
      </header>

      <section className={styles.section}>
        <Input
          label="Display name"
          id="display-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
        />
        <Input
          label="Email"
          id="email"
          type="email"
          value={profile?.email ?? ''}
          readOnly
        />
        {error && <p className={styles.error}>{error}</p>}
        {saved && <p className={styles.success}>Saved!</p>}
        <Button
          variant="primary"
          fullWidth
          disabled={is_saving || name.trim() === (profile?.display_name ?? '')}
          onClick={() => saveDisplayName(name)}
        >
          {is_saving ? 'Saving...' : 'Save changes'}
        </Button>
      </section>

      <div className={styles.divider} />

      <section className={styles.section}>
        <Button variant="ghost" fullWidth onClick={handleSignOut}>
          Sign out
        </Button>
      </section>
    </div>
  )
}
