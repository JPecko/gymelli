import { useRef, useState, useEffect, useCallback } from 'react'
import clsx from 'clsx'
import styles from './SwipeableItem.module.scss'

interface SwipeableItemProps {
  children: React.ReactNode
  onDelete: () => void
  deleteLabel?: string
}

const REVEAL_WIDTH = 80
const SNAP_THRESHOLD = 40

export function SwipeableItem({ children, onDelete, deleteLabel = 'Delete' }: SwipeableItemProps) {
  const [offset, setOffset] = useState(0)
  const [isRevealed, setIsRevealed] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const startXRef = useRef<number | null>(null)
  const startYRef = useRef<number | null>(null)
  const offsetRef = useRef(0)
  const isRevealedRef = useRef(false)

  // Keep refs in sync with state so non-passive handlers have current values
  useEffect(() => { offsetRef.current = offset }, [offset])
  useEffect(() => { isRevealedRef.current = isRevealed }, [isRevealed])

  const handleDelete = useCallback(() => {
    setOffset(0)
    setIsRevealed(false)
    onDelete()
  }, [onDelete])

  useEffect(() => {
    const el = contentRef.current
    if (!el) return

    function onTouchStart(e: TouchEvent) {
      startXRef.current = e.touches[0].clientX
      startYRef.current = e.touches[0].clientY
      setIsDragging(true)
    }

    function onTouchMove(e: TouchEvent) {
      if (startXRef.current === null || startYRef.current === null) return
      const dx = startXRef.current - e.touches[0].clientX
      const dy = Math.abs(e.touches[0].clientY - startYRef.current)

      if (Math.abs(dx) > dy) {
        // Horizontal gesture — take ownership and block page scroll
        e.preventDefault()
        e.stopPropagation()
        if (dx > 0) {
          setOffset(Math.min(dx, REVEAL_WIDTH))
        } else if (isRevealedRef.current) {
          setOffset(Math.max(REVEAL_WIDTH + dx, 0))
        }
      }
    }

    function onTouchEnd(e: TouchEvent) {
      setIsDragging(false)
      startXRef.current = null
      startYRef.current = null
      const current = offsetRef.current
      if (isRevealedRef.current || current > 0) e.stopPropagation()
      if (current > SNAP_THRESHOLD) {
        setOffset(REVEAL_WIDTH)
        setIsRevealed(true)
      } else {
        setOffset(0)
        setIsRevealed(false)
      }
    }

    // passive: false is required so preventDefault() works on touchmove
    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    el.addEventListener('touchend', onTouchEnd, { passive: true })

    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('touchend', onTouchEnd)
    }
  }, [])

  return (
    <div className={styles.wrapper}>
      <div className={styles.deleteAction}>
        <button className={styles.deleteBtn} onClick={handleDelete} aria-label={deleteLabel}>
          Delete
        </button>
      </div>

      <div
        ref={contentRef}
        className={clsx(styles.content, !isDragging && styles.animated)}
        style={{ transform: `translateX(-${offset}px)` }}
      >
        {children}

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
