import { Navigate, Outlet } from 'react-router-dom'
import { useCompany } from '@/features/company/api/use-company'
import { routes } from '@/lib/routes'

export function RequireCompany() {
  const { company } = useCompany()

  if (!company) {
    return <Navigate to={routes.setup} replace />
  }

  return <Outlet />
}
