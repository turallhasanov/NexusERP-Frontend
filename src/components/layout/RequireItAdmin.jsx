import { Navigate, Outlet } from 'react-router-dom'
import { routes } from '@/lib/routes'
import { useAuthStore } from '@/store/auth-store'
import { isItAdmin } from '@/types/auth'

// IT-admin-only pages (the audit trail). The API returns 403 to everyone else; this keeps others who open the URL
// directly on a page that works for them. Sits inside RequireCompany.
export function RequireItAdmin() {
  const { user } = useAuthStore()

  if (!isItAdmin(user)) {
    return <Navigate to={routes.dashboard} replace />
  }

  return <Outlet />
}
