import { Navigate, Outlet } from 'react-router-dom'
import { routes } from '@/lib/routes'
import { useAuthStore } from '@/store/auth-store'
import { isCompanyManager } from '@/types/auth'

// Company management pages: admins and IT admins only. The API enforces the same rule; this guard keeps
// staff who open the URL directly on a page that works for them. Sits inside RequireCompany.
export function RequireCompanyManager() {
  const { user } = useAuthStore()

  if (!isCompanyManager(user)) {
    return <Navigate to={routes.dashboard} replace />
  }

  return <Outlet />
}
