import { Navigate, Outlet } from 'react-router-dom'
import { homeRoute } from '@/lib/home-route'
import { useAuthStore } from '@/store/auth-store'
import { isSuperAdmin } from '@/types/auth'

// Admin panel routes: platform admins only. The server enforces the same rule on /api/admin; this guard
// only keeps everyone else (and an admin who is viewing a company) on pages that will work for them.
// Sits inside RequireAuth, so there is always a token here.
export function RequireSuperAdmin() {
  const auth = useAuthStore()

  if (!isSuperAdmin(auth.user) || auth.impersonation) {
    return <Navigate to={homeRoute(auth)} replace />
  }

  return <Outlet />
}
