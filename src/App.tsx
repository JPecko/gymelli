import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from '@/features/auth'
import { router } from './app/router'
import { UpdateBanner } from './app/UpdateBanner'

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <UpdateBanner />
    </AuthProvider>
  )
}
