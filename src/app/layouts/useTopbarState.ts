import { useEffect, useRef, useState, type RefObject } from 'react'
import {
  MOBILE_TOPBAR_BREAKPOINT,
  TOPBAR_SCROLL_CONFIG,
  type TopbarState,
} from './mobileHeader.config'

interface UseTopbarStateParams {
  pathname: string
  scrollerRef?: RefObject<HTMLElement | null>
}

export function useTopbarState({ pathname, scrollerRef }: UseTopbarStateParams): TopbarState {
  const [topbarState, setTopbarState] = useState<TopbarState>('in-flow')
  const frameRef = useRef<number | null>(null)
  const lastScrollTopRef = useRef(0)
  const directionRef = useRef<'up' | 'down' | null>(null)
  const distanceRef = useRef(0)
  const stateRef = useRef<TopbarState>('in-flow')

  useEffect(() => {
    stateRef.current = topbarState
  }, [topbarState])

  useEffect(() => {
    const isMobile = window.matchMedia(MOBILE_TOPBAR_BREAKPOINT).matches
    const scroller = scrollerRef?.current

    if (!isMobile || !scroller) {
      setTopbarState('in-flow')
      stateRef.current = 'in-flow'
      directionRef.current = null
      distanceRef.current = 0
      lastScrollTopRef.current = 0
      return
    }

    const setState = (nextState: TopbarState) => {
      setTopbarState(nextState)
      stateRef.current = nextState
      directionRef.current = null
      distanceRef.current = 0
    }

    const reset = () => {
      directionRef.current = null
      distanceRef.current = 0
      setState('in-flow')
      lastScrollTopRef.current = scroller.scrollTop
    }

    reset()

    const onScroll = () => {
      if (frameRef.current !== null) return

      frameRef.current = window.requestAnimationFrame(() => {
        frameRef.current = null

        const currentTop = scroller.scrollTop
        const delta = currentTop - lastScrollTopRef.current
        const currentState = stateRef.current

        if (Math.abs(delta) < TOPBAR_SCROLL_CONFIG.minDelta) return

        if (currentTop <= TOPBAR_SCROLL_CONFIG.inFlowTop) {
          reset()
          return
        }

        const nextDirection: 'up' | 'down' = delta > 0 ? 'down' : 'up'

        if (directionRef.current !== nextDirection) {
          directionRef.current = nextDirection
          distanceRef.current = Math.abs(delta)
        } else {
          distanceRef.current += Math.abs(delta)
        }

        if (currentState === 'in-flow') {
          if (nextDirection === 'down' && distanceRef.current >= TOPBAR_SCROLL_CONFIG.hideDelta) {
            setState('hidden')
          }
        } else if (currentState === 'hidden') {
          if (
            nextDirection === 'up' &&
            currentTop > TOPBAR_SCROLL_CONFIG.inFlowTop &&
            distanceRef.current >= TOPBAR_SCROLL_CONFIG.showDelta
          ) {
            setState('floating')
          }
        } else if (currentState === 'floating') {
          if (nextDirection === 'down' && distanceRef.current >= TOPBAR_SCROLL_CONFIG.hideDelta) {
            setState('hidden')
          }
        }

        lastScrollTopRef.current = currentTop
      })
    }

    scroller.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      scroller.removeEventListener('scroll', onScroll)
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current)
      }
      frameRef.current = null
      directionRef.current = null
      distanceRef.current = 0
      stateRef.current = 'in-flow'
    }
  }, [pathname, scrollerRef])

  return topbarState
}
