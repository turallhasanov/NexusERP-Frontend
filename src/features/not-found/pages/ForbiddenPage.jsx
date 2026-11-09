import { ButtonLink } from '@/components/ui/button-link'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { companyHome } from '@/lib/access'
import { styles } from '@/lib/styles'
import { useAuthStore } from '@/store/auth-store'

// "Yetkisiz giriş": shown inside the app shell when the user's role may not open the requested page.
export function ForbiddenPage() {
  const { user } = useAuthStore()
  useDocumentTitle('İcazəniz yoxdur')

  return (
    <main className={styles.notFoundCard} role="alert">
      <p className={styles.notFoundCode} aria-hidden="true">
        403
      </p>
      <h1 className={styles.notFoundTitle}>İcazəniz yoxdur</h1>
      <p className={styles.notFoundText}>Bu səhifəyə baxmaq üçün səlahiyyətiniz çatmır. Lazım olarsa, administratorla əlaqə saxlayın.</p>
      <div className={styles.notFoundActions}>
        <ButtonLink to={companyHome(user)} replace>
          Ana səhifəyə qayıt
        </ButtonLink>
      </div>
    </main>
  )
}
