import { Navigate, Outlet } from 'react-router-dom'
import { homeRoute } from '@/lib/home-route'
import { useAuthStore } from '@/store/auth-store'

export function RequireCompany() {
  const auth = useAuthStore()

  // Company users go to the company page; platform admins (who have no company) to the admin panel.
  if (!auth.activeCompanyId) {
    return <Navigate to={homeRoute(auth)} replace />
  }

  return <Outlet />
}
