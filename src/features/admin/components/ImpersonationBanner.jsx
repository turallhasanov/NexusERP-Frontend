import { useNavigate } from 'react-router-dom'
import { fromApiDate } from '@/lib/date'
import { routes } from '@/lib/routes'
import { styles } from '@/lib/styles'
import { stopImpersonation, useAuthStore } from '@/store/auth-store'

function formatTime(value) {
  const date = new Date(fromApiDate(value))
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' })
}

// Top of the regular app while a platform admin views a company: which company, that it is read-only,
// and the way back to the admin panel.
export function ImpersonationBanner() {
  const navigate = useNavigate()
  const { impersonation } = useAuthStore()

  if (!impersonation) {
    return null
  }

  const until = formatTime(impersonation.expiresAt)

  function handleReturn() {
    stopImpersonation()
    navigate(routes.adminTenants, { replace: true })
  }

  return (
    <div className={styles.impersonationBanner} role="status">
      <p>
        <strong>Baxış rejimi:</strong> «{impersonation.company.name}» — dəyişikliklər bloklanıb
        {until ? `, ${until}-dək etibarlıdır` : ''}.
      </p>
      <button type="button" className={styles.impersonationAction} onClick={handleReturn}>
        Admin panelə qayıt
      </button>
    </div>
  )
}
