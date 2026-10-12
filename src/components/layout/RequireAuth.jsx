import { Navigate, Outlet } from 'react-router-dom'
import { routes } from '@/lib/routes'
import { useAuthStore } from '@/store/auth-store'

export function RequireAuth() {
  const { token } = useAuthStore()

  if (!token) {
    return <Navigate to={routes.login} replace />
  }

  return <Outlet />
}
