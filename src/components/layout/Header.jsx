import { useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { routes } from '@/lib/routes'
import { styles } from '@/lib/styles'
import { signOut } from '@/features/auth/api/sign-out'
import { stopImpersonation, useAuthStore } from '@/store/auth-store'
import { isSuperAdmin, USER_ROLE_LABELS } from '@/types/auth'

export function Header() {
  const navigate = useNavigate()
  const { user, impersonation } = useAuthStore()
  // A platform admin only reaches company pages through a company view, where `user` carries the company
  // role ("admin"); the admin's own account waits in impersonation.adminUser.
  const showAdminPanel = isSuperAdmin(user) || isSuperAdmin(impersonation?.adminUser)

  function handleLogout() {
    signOut()
    navigate(routes.login, { replace: true })
  }

  // RequireSuperAdmin bounces an active company view, so end it before going to the admin panel.
  function handleAdminPanel() {
    if (impersonation) {
      stopImpersonation()
    }
    navigate(routes.admin)
  }

  return (
    <header className={styles.header}>
      <p className={styles.headerMeta}>Bu gün</p>
      {user ? (
        <div className={styles.headerUser}>
          {showAdminPanel ? (
            <button type="button" className={styles.headerAdminButton} onClick={handleAdminPanel}>
              <span aria-hidden="true">🛡️</span>
              Admin Panel
            </button>
          ) : null}
          <span>{user.name}</span>
          <Badge>{USER_ROLE_LABELS[user.role]}</Badge>
          <button type="button" className={styles.headerAction} onClick={handleLogout}>
            Çıxış
          </button>
        </div>
      ) : null}
    </header>
  )
}
