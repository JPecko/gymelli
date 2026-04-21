import { useState, useEffect } from 'react'
import { getWeekStart, computeStreak } from '@/shared/lib/dates'
import { getDashboardData } from '../dashboard.api'
import type { DashboardData, DashboardLastSession } from '../dashboard.types'

export function useDashboard(): DashboardData & { is_loading: boolean } {
  const [data, setData] = useState<DashboardData & { is_loading: boolean }>({
    streak: 0,
    this_week_volume_kg: 0,
    last_session: null,
    is_loading: true,
  })

  useEffect(() => {
    getDashboardData(60).then((sessions) => {
      if (sessions.length === 0) {
        setData({ streak: 0, this_week_volume_kg: 0, last_session: null, is_loading: false })
        return
      }

      // ── Last session (first in desc order) ────────────────────
      const raw = sessions[0]
      const sorted = [...raw.workout_session_exercises].sort(
        (a, b) => a.order_index - b.order_index,
      )
      const allSets = sorted.flatMap((se) => se.exercise_sets)
      const lastSession: DashboardLastSession = {
        id: raw.id,
        started_at: raw.started_at,
        finished_at: raw.finished_at,
        template_id: raw.template_id,
        pr_count: raw.pr_count ?? 0,
        exercise_names: sorted.map((se) => se.exercises?.name ?? '').filter(Boolean),
        duration_seconds: Math.floor(
          (new Date(raw.finished_at).getTime() - new Date(raw.started_at).getTime()) / 1000,
        ),
        total_sets: allSets.length,
        total_volume_kg: allSets.reduce((acc, s) => acc + (s.weight_kg ?? 0) * (s.reps ?? 0), 0),
        calories_burned: raw.calories_burned,
        total_rest_seconds: raw.total_rest_seconds,
      }

      // ── This week's volume ────────────────────────────────────
      const weekStart = getWeekStart(new Date())
      let thisWeekVolume = 0
      for (const session of sessions) {
        if (new Date(session.started_at) < weekStart) continue
        for (const se of session.workout_session_exercises) {
          for (const set of se.exercise_sets) {
            if (set.weight_kg && set.reps) thisWeekVolume += set.weight_kg * set.reps
          }
        }
      }

      // ── Streak ────────────────────────────────────────────────
      const streak = computeStreak(sessions.map((s) => s.started_at))

      setData({
        streak,
        this_week_volume_kg: Math.round(thisWeekVolume),
        last_session: lastSession,
        is_loading: false,
      })
    })
  }, [])

  return data
}
