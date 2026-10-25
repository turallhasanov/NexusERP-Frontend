import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { impersonateTenant } from '@/features/admin/api/admin-api'
import { routes } from '@/lib/routes'
import { startImpersonation } from '@/store/auth-store'
import { showToast } from '@/store/toast-store'

// "Şirkətə keç": opens the company's own dashboard with a read-only token. The banner at the top of the
// app (ImpersonationBanner) brings the admin back.
export function useSwitchToTenant() {
  const navigate = useNavigate()
  const [pendingId, setPendingId] = useState(null)

  async function switchTo(tenantId) {
    setPendingId(tenantId)

    try {
      const { token, expiresAt, company } = await impersonateTenant(tenantId)
      startImpersonation({ token, company, expiresAt })
      navigate(routes.dashboard)
    } catch (error) {
      showToast(error.message, 'error')
      setPendingId(null)
    }
  }

  return { switchTo, pendingId }
}
