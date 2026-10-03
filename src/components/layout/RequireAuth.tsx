import { Navigate, Outlet } from 'react-router-dom'
import { routes } from '@/lib/routes.ts'
import { useAuthStore } from '@/store/auth-store.ts'

export function RequireAuth() {
  const { user } = useAuthStore()

  if (!user) {
    return <Navigate to={routes.login} replace />
  }

  return <Outlet />
}
