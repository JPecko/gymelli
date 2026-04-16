import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getTemplatesWithExercises } from '@/features/templates/templates.api'
import { TemplateCard } from '@/features/templates/components/TemplateCard'
import type { TemplateListItem } from '@/features/templates/templates.types'
import { Button } from '@/shared/components'
import styles from './TemplatesPage.module.scss'

export function TemplatesPage() {
  const navigate = useNavigate()
  const [templates, setTemplates] = useState<TemplateListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getTemplatesWithExercises().then((data) => {
      setTemplates(data)
      setIsLoading(false)
    })
  }, [])

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Programs</h1>
        <Button variant="primary" size="sm" onClick={() => navigate('/templates/new')}>
          + New
        </Button>
      </header>

      {isLoading && <p className={styles.state}>Loading...</p>}

      {!isLoading && templates.length === 0 && (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>No templates yet</p>
          <p className={styles.emptyText}>
            Create a template to quickly start a workout with your favourite exercises.
          </p>
          <Button variant="secondary" onClick={() => navigate('/templates/new')}>
            Create your first template
          </Button>
        </div>
      )}

      {!isLoading && templates.length > 0 && (
        <div className={styles.list}>
          {templates.map((t) => (
            <TemplateCard key={t.id} template={t} />
          ))}
        </div>
      )}
    </div>
  )
}
