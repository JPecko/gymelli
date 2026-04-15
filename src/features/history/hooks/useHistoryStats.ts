import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { getVolumeStats, getPersonalRecords } from '../history.api'
import { buildLast8Weeks, getWeekStart, computeStreak } from '../history.utils'
import type { VolumeWeek, PersonalRecord } from '../history.types'

export interface HistoryStats {
  total_sessions: number
  total_volume_kg: number
  current_streak: number
  weekly_volume: VolumeWeek[]
  personal_records: PersonalRecord[]
  is_loading: boolean
}

export function useHistoryStats(): HistoryStats {
  const { key } = useLocation()
  const [stats, setStats] = useState<HistoryStats>({
    total_sessions: 0,
    total_volume_kg: 0,
    current_streak: 0,
    weekly_volume: buildLast8Weeks(),
    personal_records: [],
    is_loading: true,
  })

  useEffect(() => {
    setStats((prev) => ({ ...prev, is_loading: true }))
    Promise.all([getVolumeStats(90), getPersonalRecords()]).then(([sessions, rawPRs]) => {
      // ── Volume + weekly breakdown ────────────────────────────
      let totalVolume = 0
      const weeks = buildLast8Weeks()

      for (const session of sessions) {
        const sessionWeekStart = getWeekStart(new Date(session.started_at))
        const matchIdx = weeks.findLastIndex(
          (w) => w.week_start <= sessionWeekStart.toISOString(),
        )

        let sessionVolume = 0
        for (const se of session.workout_session_exercises) {
          for (const set of se.exercise_sets) {
            if (set.weight_kg && set.reps) sessionVolume += set.weight_kg * set.reps
          }
        }
        totalVolume += sessionVolume

        if (matchIdx >= 0) {
          weeks[matchIdx].volume_kg += sessionVolume
          weeks[matchIdx].session_count += 1
        }
      }

      // ── PRs — first occurrence per exercise (sorted by weight desc) ──
      const prMap = new Map<string, PersonalRecord>()
      for (const row of rawPRs) {
        const se = row.workout_session_exercises
        if (!se) continue
        if (!se.workout_sessions?.finished_at) continue
        if (!prMap.has(se.exercise_id)) {
          prMap.set(se.exercise_id, {
            exercise_id: se.exercise_id,
            exercise_name: se.exercises?.name ?? '',
            weight_kg: row.weight_kg,
            reps: row.reps,
            set_date: row.logged_at,
          })
        }
      }

      const personalRecords = Array.from(prMap.values()).sort(
        (a, b) => new Date(b.set_date).getTime() - new Date(a.set_date).getTime(),
      )

      setStats({
        total_sessions: sessions.length,
        total_volume_kg: Math.round(totalVolume),
        current_streak: computeStreak(sessions.map((s) => s.started_at)),
        weekly_volume: weeks,
        personal_records: personalRecords,
        is_loading: false,
      })
    })
  }, [key])

  return stats
}
