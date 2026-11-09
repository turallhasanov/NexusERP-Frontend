import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { ForbiddenPage } from '@/features/not-found/pages/ForbiddenPage'
import { canOpenPath, companyHome } from '@/lib/access'
import { routes } from '@/lib/routes'
import { useAuthStore } from '@/store/auth-store'

// Route guard for the company pages. An "İşçi" who types the URL of a page outside the warehouse module (/finance,
// /users, ...) gets the "İcazəniz yoxdur" screen instead of the page; the bare "/" just lands on their home.
// The API refuses the same requests with 403, this only stops the page from opening. Sits inside RequireCompany.
export function RequireModuleAccess() {
  const { user } = useAuthStore()
  const { pathname } = useLocation()

  if (canOpenPath(user, pathname)) {
    return <Outlet />
  }

  if (pathname === routes.dashboard) {
    return <Navigate to={companyHome(user)} replace />
  }

  return <ForbiddenPage />
}
