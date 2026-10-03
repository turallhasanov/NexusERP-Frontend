import { useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui/badge.tsx'
import { routes } from '@/lib/routes.ts'
import { styles } from '@/lib/styles.ts'
import { setAuthUser, useAuthStore } from '@/store/auth-store.ts'
import { USER_ROLE_LABELS } from '@/types/auth.ts'

export function Header() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  function handleLogout() {
    setAuthUser(null)
    navigate(routes.login, { replace: true })
  }

  return (
    <header className={styles.header}>
      <p className={styles.headerMeta}>Bu gün</p>
      {user ? (
        <div className={styles.headerUser}>
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
