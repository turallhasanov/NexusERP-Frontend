import { Navigate, Outlet } from 'react-router-dom'
import { PendingApprovalPage } from '@/features/auth/pages/PendingApprovalPage'
import { homeRoute } from '@/lib/home-route'
import { useAuthStore } from '@/store/auth-store'
import { isPendingApproval } from '@/types/auth'

export function RequireCompany() {
  const auth = useAuthStore()

  // Company users go to the company page; platform admins (who have no company) to the admin panel.
  if (!auth.activeCompanyId) {
    return <Navigate to={homeRoute(auth)} replace />
  }

  // Not approved yet: no sidebar, no module, only the notice. The API refuses their data requests with 403 as well.
  if (isPendingApproval(auth.user)) {
    return <PendingApprovalPage />
  }

  return <Outlet />
}
