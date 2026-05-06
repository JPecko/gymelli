import { useState, useEffect, useCallback } from 'react'
import { useSwipeGesture } from '@/shared/hooks/useSwipeGesture'

type SlideDir = 'left' | 'right' | null

export function useExerciseNavigation(
  exerciseCount: number,
  activeIndex: number,
  goToExercise: (idx: number) => void,
) {
  const [slideDir, setSlideDir] = useState<SlideDir>(null)

  useEffect(() => {
    if (!slideDir) return
    const t = setTimeout(() => setSlideDir(null), 280)
    return () => clearTimeout(t)
  }, [slideDir])

  const navigateTo = useCallback((idx: number) => {
    setSlideDir(idx > activeIndex ? 'left' : 'right')
    goToExercise(idx)
  }, [activeIndex, goToExercise])

  const canGoPrev = exerciseCount > 1 && activeIndex > 0
  const canGoNext = exerciseCount > 1 && activeIndex < exerciseCount - 1

  const swipeHandlers = useSwipeGesture({
    onSwipeLeft:  canGoNext ? () => navigateTo(activeIndex + 1) : undefined,
    onSwipeRight: canGoPrev ? () => navigateTo(activeIndex - 1) : undefined,
    threshold: 60,
  })

  return { navigateTo, slideDir, swipeHandlers }
}
