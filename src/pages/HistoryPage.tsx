import { useHistoryStats } from '@/features/history/hooks/useHistoryStats'
import { VolumeChart } from '@/features/history/components/VolumeChart'
import { PRItem } from '@/features/history/components/PRItem'
import { StatCard } from '@/shared/components'
import styles from './HistoryPage.module.scss'

function formatVolume(kg: number): string {
  return kg >= 1000 ? `${(kg / 1000).toFixed(1)}k` : `${kg}`
}

export function HistoryPage() {
  const { total_sessions, total_volume_kg, current_streak, weekly_volume, personal_records, is_loading } =
    useHistoryStats()

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Progress</h1>
      </header>

      {is_loading ? (
        <p className={styles.state}>Loading...</p>
      ) : (
        <>
          {/* ── Summary stats ───────────────────────────────── */}
          <div className={styles.stats}>
            <StatCard label="Sessions" value={total_sessions} />
            <StatCard label="Volume" value={formatVolume(total_volume_kg)} unit="kg" accent />
            <StatCard label="Streak" value={current_streak} unit="d" />
          </div>

          {/* ── Weekly volume chart ─────────────────────────── */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Weekly Volume</h2>
            <VolumeChart weeks={weekly_volume} />
          </section>

          {/* ── Personal records ────────────────────────────── */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Personal Records</h2>
            {personal_records.length === 0 ? (
              <p className={styles.empty}>No sets logged yet.</p>
            ) : (
              <div className={styles.prList}>
                {personal_records.map((pr) => (
                  <PRItem key={pr.exercise_id} pr={pr} />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}
