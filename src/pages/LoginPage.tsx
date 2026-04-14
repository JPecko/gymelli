import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signInWithEmail } from '@/features/auth'
import { AuthCard } from '@/features/auth/components/AuthCard'
import { Button, Input } from '@/shared/components'
import styles from '@/features/auth/components/AuthForm.module.scss'

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
    <AuthCard>
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
    </AuthCard>
  )
}
