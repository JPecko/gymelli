import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '@/app/layouts/AppLayout'
import { SessionLayout } from '@/app/layouts/SessionLayout'
import { RequireAuth } from './RequireAuth'
import { WorkoutSummaryPage } from '@/pages/WorkoutSummaryPage'
import { LoginPage } from '@/pages/LoginPage'
import { SignUpPage } from '@/pages/SignUpPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { WorkoutsPage } from '@/pages/WorkoutsPage'
import { WorkoutSetupPage } from '@/pages/WorkoutSetupPage'
import { WorkoutSessionPage } from '@/pages/WorkoutSessionPage'
import { ExercisesPage } from '@/pages/ExercisesPage'
import { ExerciseDetailPage } from '@/pages/ExerciseDetailPage'
import { TemplatesPage } from '@/pages/TemplatesPage'
import { TemplateEditorPage } from '@/pages/TemplateEditorPage'
import { HistoryPage } from '@/pages/HistoryPage'
import { ProfilePage } from '@/pages/ProfilePage'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/signup',
    element: <SignUpPage />,
  },
  {
    path: '/',
    element: <RequireAuth><AppLayout /></RequireAuth>,
    children: [
      { index: true,           element: <DashboardPage /> },
      { path: 'workouts',      element: <WorkoutsPage /> },
      { path: 'workouts/new',  element: <WorkoutSetupPage /> },
      { path: 'exercises',     element: <ExercisesPage /> },
      { path: 'exercises/:id', element: <ExerciseDetailPage /> },
      { path: 'templates',          element: <TemplatesPage /> },
      { path: 'templates/new',      element: <TemplateEditorPage /> },
      { path: 'templates/:id/edit', element: <TemplateEditorPage /> },
      { path: 'history',            element: <HistoryPage /> },
      { path: 'profile',            element: <ProfilePage /> },
    ],
  },
  {
    path: '/workouts/session/:sessionId',
    element: <RequireAuth><SessionLayout /></RequireAuth>,
    children: [
      { index: true, element: <WorkoutSessionPage /> },
      { path: 'summary', element: <WorkoutSummaryPage /> },
    ],
  },
])
