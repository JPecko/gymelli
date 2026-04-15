import { useState, useEffect } from 'react'
import clsx from 'clsx'
import { useNavigate } from 'react-router-dom'
import { useProfile } from '@/features/auth/hooks/useProfile'
import { signOut } from '@/features/auth'
import { Button, Input } from '@/shared/components'
import styles from './ProfilePage.module.scss'

export function ProfilePage() {
  const navigate = useNavigate()
  const { profile, is_loading, is_saving, error, saved, saveDisplayName, saveBodyStats } = useProfile()
  const [name, setName] = useState('')
  const [bodyWeight, setBodyWeight] = useState('')
  const [sex, setSex] = useState<'M' | 'F' | null>(null)

  useEffect(() => {
    if (profile) {
      setName(profile.display_name ?? '')
      setBodyWeight(profile.body_weight_kg != null ? String(profile.body_weight_kg) : '')
      setSex(profile.sex)
    }
  }, [profile])

  async function handleSignOut() {
    await signOut()
    navigate('/login', { replace: true })
  }

  const bodyWeightChanged = bodyWeight !== (profile?.body_weight_kg != null ? String(profile.body_weight_kg) : '')
  const sexChanged = sex !== (profile?.sex ?? null)
  const bodyStatsChanged = bodyWeightChanged || sexChanged

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
        <h2 className={styles.sectionTitle}>Body stats</h2>
        <p className={styles.sectionHint}>Used to calculate workout score and calorie estimates.</p>

        <Input
          label="Body weight (kg)"
          id="body-weight"
          type="number"
          inputMode="decimal"
          value={bodyWeight}
          onChange={(e) => setBodyWeight(e.target.value)}
          placeholder="e.g. 75"
        />

        <div className={styles.field}>
          <span className={styles.fieldLabel}>Sex</span>
          <div className={styles.sexToggle}>
            <button
              type="button"
              className={clsx(styles.sexOption, sex === 'M' && styles.sexOptionActive)}
              onClick={() => setSex(sex === 'M' ? null : 'M')}
            >
              Male
            </button>
            <button
              type="button"
              className={clsx(styles.sexOption, sex === 'F' && styles.sexOptionActive)}
              onClick={() => setSex(sex === 'F' ? null : 'F')}
            >
              Female
            </button>
          </div>
        </div>

        <Button
          variant="primary"
          fullWidth
          disabled={is_saving || !bodyStatsChanged}
          onClick={() => {
            const kg = bodyWeight.trim() !== '' ? parseFloat(bodyWeight) : null
            saveBodyStats(kg, sex)
          }}
        >
          {is_saving ? 'Saving...' : 'Save body stats'}
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
