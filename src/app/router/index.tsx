import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '@/app/layouts/AppLayout'
import { DashboardPage } from '@/pages/DashboardPage'
import { WorkoutsPage } from '@/pages/WorkoutsPage'
import { WorkoutSessionPage } from '@/pages/WorkoutSessionPage'
import { ExercisesPage } from '@/pages/ExercisesPage'
import { ExerciseDetailPage } from '@/pages/ExerciseDetailPage'
import { TemplatesPage } from '@/pages/TemplatesPage'
import { HistoryPage } from '@/pages/HistoryPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true,                        element: <DashboardPage /> },
      { path: 'workouts',                   element: <WorkoutsPage /> },
      { path: 'workouts/session/:sessionId',element: <WorkoutSessionPage /> },
      { path: 'exercises',                  element: <ExercisesPage /> },
      { path: 'exercises/:id',              element: <ExerciseDetailPage /> },
      { path: 'templates',                  element: <TemplatesPage /> },
      { path: 'history',                    element: <HistoryPage /> },
    ],
  },
])
