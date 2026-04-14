import styles from './WeightProgressChart.module.scss'

interface ChartPoint {
  label: string
  weight_kg: number
}

interface WeightProgressChartProps {
  points: ChartPoint[]
}

export function WeightProgressChart({ points }: WeightProgressChartProps) {
  const max = Math.max(...points.map((p) => p.weight_kg), 1)

  return (
    <div className={styles.chart}>
      {points.map((point, i) => {
        const heightPct = (point.weight_kg / max) * 100
        const isLatest = i === points.length - 1
        return (
          <div key={i} className={styles.column}>
            <div className={styles.barWrap}>
              <span className={styles.barValue}>{point.weight_kg}</span>
              <div
                className={styles.bar}
                style={{ height: `${Math.max(heightPct, 4)}%` }}
                data-latest={isLatest || undefined}
              />
            </div>
            <span className={styles.label}>{point.label}</span>
          </div>
        )
      })}
    </div>
  )
}
