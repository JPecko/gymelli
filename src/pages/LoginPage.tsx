import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signInWithEmail } from '@/features/auth'
import { Button, Input } from '@/shared/components'
import styles from './AuthPage.module.scss'

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await signInWithEmail(email, password)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.')
      setLoading(false)
    }
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
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />

          {error && <p className={styles.error}>{error}</p>}

          <Button type="submit" variant="primary" fullWidth disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <p className={styles.footer}>
          Don't have an account?{' '}
          <Link to="/signup" className={styles.link}>Create one</Link>
        </p>
      </div>
    </div>
  )
}
