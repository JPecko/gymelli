import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDashboard } from '@/features/dashboard/hooks/useDashboard'
import { getTemplatesWithExercises } from '@/features/templates/templates.api'
import { TemplateCard } from '@/features/templates/components/TemplateCard'
import { WorkoutSessionCard } from '@/features/workouts/components/WorkoutSessionCard'
import { computeWorkoutScore } from '@/features/workouts/hooks/useWorkoutScore'
import { useProfile } from '@/features/auth/hooks/useProfile'
import { StatCard, Button } from '@/shared/components'
import type { TemplateListItem } from '@/features/templates/templates.types'
import type { SessionHistoryItem } from '@/features/workouts/workouts.types'
import styles from './DashboardPage.module.scss'

function formatVolume(kg: number): string {
  return kg >= 1000 ? `${(kg / 1000).toFixed(1)}k` : `${kg}`
}

export function DashboardPage() {
  const navigate = useNavigate()
  const { streak, this_week_volume_kg, last_session, is_loading } = useDashboard()
  const [templates, setTemplates] = useState<TemplateListItem[]>([])
  const { profile } = useProfile()

  useEffect(() => {
    getTemplatesWithExercises().then(setTemplates)
  }, [])

  const suggestedTemplate =
    templates.find((t) => t.id === last_session?.template_id) ?? templates[0] ?? null

  const lastSessionItem: SessionHistoryItem | null = last_session
    ? {
        id: last_session.id,
        started_at: last_session.started_at,
        finished_at: last_session.finished_at,
        exercise_names: last_session.exercise_names,
        duration_seconds: last_session.duration_seconds,
        total_sets: last_session.total_sets,
        total_volume_kg: last_session.total_volume_kg,
        calories_burned: last_session.calories_burned,
        total_rest_seconds: last_session.total_rest_seconds,
      }
    : null

  const lastSessionScore = useMemo(() => {
    if (!last_session) return undefined
    return computeWorkoutScore({
      total_volume_kg: last_session.total_volume_kg,
      duration_seconds: last_session.duration_seconds,
      exercise_count: last_session.exercise_names.length,
      pr_count: 0,
      calories_burned: last_session.calories_burned,
      body_weight_kg: profile?.body_weight_kg ?? null,
      sex: profile?.sex ?? null,
      total_rest_seconds: last_session.total_rest_seconds,
    })
  }, [last_session, profile?.body_weight_kg, profile?.sex])

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Home</h1>
      </header>

      {is_loading ? (
        <p className={styles.state}>Loading...</p>
      ) : (
        <>
          {/* ── Stats ───────────────────────────────────────── */}
          <div className={styles.stats}>
            <StatCard label="Streak" value={streak} unit="d" accent={streak > 0} />
            <StatCard label="This week" value={formatVolume(this_week_volume_kg)} unit="kg" />
          </div>

          {/* ── Quick start ─────────────────────────────────── */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Quick Start</h2>
            {suggestedTemplate ? (
              <TemplateCard template={suggestedTemplate} />
            ) : (
              <Button variant="secondary" fullWidth onClick={() => navigate('/workouts/new')}>
                + New Workout
              </Button>
            )}
          </section>

          {/* ── Last session ────────────────────────────────── */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Last Session</h2>
            {lastSessionItem ? (
              <WorkoutSessionCard session={lastSessionItem} score={lastSessionScore} scoreSize={64} />
            ) : (
              <p className={styles.empty}>No sessions yet. Start your first workout!</p>
            )}
          </section>
        </>
      )}
    </div>
  )
}
