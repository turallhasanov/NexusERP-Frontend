import { Navigate, Outlet } from 'react-router-dom'
import { routes } from '@/lib/routes'
import { useAuthStore } from '@/store/auth-store'

export function RequireCompany() {
  const { activeCompanyId } = useAuthStore()

  if (!activeCompanyId) {
    return <Navigate to={routes.selectCompany} replace />
  }

  return <Outlet />
}
