import { useRef, useState } from 'react'
import clsx from 'clsx'
import styles from './SwipeableItem.module.scss'

interface SwipeableItemProps {
  children: React.ReactNode
  onDelete: () => void
  deleteLabel?: string
}

const REVEAL_WIDTH = 80   // px — delete button width
const SNAP_THRESHOLD = 40 // px — minimum swipe to snap open

export function SwipeableItem({ children, onDelete, deleteLabel = 'Delete' }: SwipeableItemProps) {
  const [offset, setOffset] = useState(0)
  const [isRevealed, setIsRevealed] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const startXRef = useRef<number | null>(null)
  const startYRef = useRef<number | null>(null)

  function handleTouchStart(e: React.TouchEvent) {
    startXRef.current = e.touches[0].clientX
    startYRef.current = e.touches[0].clientY
    setIsDragging(true)
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (startXRef.current === null || startYRef.current === null) return
    const dx = startXRef.current - e.touches[0].clientX
    const dy = Math.abs(e.touches[0].clientY - startYRef.current)

    // Only handle horizontal gestures — stop propagation so parent swipe handlers don't fire
    if (Math.abs(dx) > dy) {
      e.stopPropagation()
      if (dx > 0) {
        setOffset(Math.min(dx, REVEAL_WIDTH))
      } else if (isRevealed) {
        setOffset(Math.max(REVEAL_WIDTH + dx, 0))
      }
    }
  }

  function handleTouchEnd(e: React.TouchEvent) {
    setIsDragging(false)
    startXRef.current = null
    startYRef.current = null
    if (isRevealed || offset > 0) e.stopPropagation()
    if (offset > SNAP_THRESHOLD) {
      setOffset(REVEAL_WIDTH)
      setIsRevealed(true)
    } else {
      setOffset(0)
      setIsRevealed(false)
    }
  }

  function handleDelete() {
    setOffset(0)
    setIsRevealed(false)
    onDelete()
  }

  return (
    <div className={styles.wrapper}>
      {/* Delete action — revealed behind the item on touch */}
      <div className={styles.deleteAction}>
        <button className={styles.deleteBtn} onClick={handleDelete} aria-label={deleteLabel}>
          Delete
        </button>
      </div>

      {/* Main content */}
      <div
        className={clsx(styles.content, !isDragging && styles.animated)}
        style={{ transform: `translateX(-${offset}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}

        {/* Desktop: delete button visible on hover */}
        <button
          className={styles.desktopDelete}
          onClick={handleDelete}
          aria-label={deleteLabel}
        >
          ✕
        </button>
      </div>
    </div>
  )
}
