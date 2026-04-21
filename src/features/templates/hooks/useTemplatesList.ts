import { useState, useEffect } from 'react'
import { getTemplatesWithExercises } from '../templates.api'
import type { TemplateListItem } from '../templates.types'

export function useTemplatesList(): { templates: TemplateListItem[]; isLoading: boolean } {
  const [templates, setTemplates] = useState<TemplateListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getTemplatesWithExercises().then((data) => {
      setTemplates(data)
      setIsLoading(false)
    })
  }, [])

  return { templates, isLoading }
}
