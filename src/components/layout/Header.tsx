import { Badge } from '@/components/ui/badge.tsx'
import { useAuthStore } from '@/store/auth-store.ts'
import { styles } from '@/lib/styles.ts'
import { USER_ROLE_LABELS } from '@/types/auth.ts'

export function Header() {
  const { user } = useAuthStore()

  return (
    <header className={styles.header}>
      <p className={styles.headerMeta}>Bu gün</p>
      {user ? (
        <div className={styles.headerUser}>
          <span>{user.name}</span>
          <Badge>{USER_ROLE_LABELS[user.role]}</Badge>
        </div>
      ) : null}
    </header>
  )
}
