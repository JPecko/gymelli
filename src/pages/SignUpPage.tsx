import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signUp } from '@/features/auth'
import { Button, Input } from '@/shared/components'
import styles from './AuthPage.module.scss'

export function SignUpPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setLoading(true)

    try {
      const { requiresConfirmation } = await signUp(email, password)
      if (requiresConfirmation) {
        setDone(true)
      } else {
        navigate('/', { replace: true })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed.')
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.brand}>
            <img src="/gymelli-wordmark.svg" alt="Gymelli" className={styles.logo} />
          </div>
          <div className={styles.confirmation}>
            <p className={styles.confirmTitle}>Check your email</p>
            <p className={styles.confirmText}>
              We sent a confirmation link to <strong>{email}</strong>.<br />
              Click it to activate your account.
            </p>
            <Link to="/login" className={styles.link}>Back to sign in</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <img src="/gymelli-wordmark.svg" alt="Gymelli" className={styles.logo} />
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <Input
            label="Email"
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />

          <Input
            label="Password"
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 8 characters"
            autoComplete="new-password"
            required
          />

          <Input
            label="Confirm password"
            id="confirm"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Repeat password"
            autoComplete="new-password"
            required
          />

          {error && <p className={styles.error}>{error}</p>}

          <Button type="submit" variant="primary" fullWidth disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </Button>
        </form>

        <p className={styles.footer}>
          Already have an account?{' '}
          <Link to="/login" className={styles.link}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
