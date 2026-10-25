import { Navigate, Outlet } from 'react-router-dom'
import { hasSeenSplash } from '@/features/splash/lib/splash-seen'
import { routes } from '@/lib/routes'
import { useAuthStore } from '@/store/auth-store'

export function RequireAuth() {
  const { token } = useAuthStore()

  if (!token) {
    // A visitor's first stop in a tab session is the splash, which then continues to /login.
    return <Navigate to={hasSeenSplash() ? routes.login : routes.welcome} replace />
  }

  return <Outlet />
}
