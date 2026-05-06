import { useState, useEffect, useRef } from 'react'
import { updateEffectiveBwFactor } from '../exercises.api'

export function useEffectiveBwFactor(exerciseId: string, initialFactor: number | null) {
  const [factor, setFactor] = useState<number | null>(initialFactor)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setFactor(initialFactor)
  }, [initialFactor])

  function setAndSave(value: number | null) {
    setFactor(value)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      updateEffectiveBwFactor(exerciseId, value).catch(() => {})
    }, 600)
  }

  return { factor, setAndSave }
}
