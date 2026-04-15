import styles from './ScoreRing.module.scss'

interface ScoreRingProps {
  score: number
  label: 'Poor' | 'Fair' | 'Good' | 'Great' | 'Elite'
  /** Diameter in px. Defaults to 48. */
  size?: number
  showLabel?: boolean
}

// Fixed viewBox geometry — scaled via CSS width/height
const CX = 24
const CY = 24
const R = 18
const STROKE_WIDTH = 3.5
const CIRCUMFERENCE = 2 * Math.PI * R   // ≈ 113.1
const ARC_LENGTH = CIRCUMFERENCE * 0.75  // 270° fill
const GAP_LENGTH = CIRCUMFERENCE * 0.25  // 90° gap at bottom

export function ScoreRing({ score, label, size = 48, showLabel = true }: ScoreRingProps) {
  const filled = ARC_LENGTH * Math.min(1, Math.max(0, score / 100))
  const trackDash = `${ARC_LENGTH} ${GAP_LENGTH}`
  const fillDash = `${filled} ${CIRCUMFERENCE - filled}`

  return (
    <div className={styles.root} style={{ width: size, flexShrink: 0 }}>
      <div className={styles.ringWrap} style={{ width: size, height: size }}>
        <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true">
          {/* Background track arc */}
          <circle
            className={styles.track}
            cx={CX} cy={CY} r={R}
            fill="none"
            strokeWidth={STROKE_WIDTH}
            strokeDasharray={trackDash}
            strokeLinecap="round"
            transform={`rotate(135 ${CX} ${CY})`}
          />
          {/* Filled arc */}
          {filled > 0 && (
            <circle
              className={styles.fill}
              data-label={label}
              cx={CX} cy={CY} r={R}
              fill="none"
              strokeWidth={STROKE_WIDTH}
              strokeDasharray={fillDash}
              strokeLinecap="round"
              transform={`rotate(135 ${CX} ${CY})`}
            />
          )}
        </svg>
        {/* Score number — HTML for reliable font rendering */}
        <span className={styles.number}>{score}</span>
      </div>

      {showLabel && (
        <span className={styles.label} data-label={label}>{label}</span>
      )}
    </div>
  )
}
