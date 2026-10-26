import { routes } from '@/lib/routes'
import { isSuperAdmin } from '@/types/auth'

// Where a signed-in user lands: platform admins on the admin panel (unless they are viewing a company),
// everyone else on the dashboard once a company is active, or on the company page before that.
export function homeRoute({ user, activeCompanyId }) {
  if (activeCompanyId) {
    return routes.dashboard
  }

  return isSuperAdmin(user) ? routes.admin : routes.selectCompany
}
