import { Navigate } from 'react-router-dom'
import { Card } from '@/components/ui/card.tsx'
import { LoginForm } from '@/features/auth/components/LoginForm.tsx'
import { useDocumentTitle } from '@/hooks/use-document-title.ts'
import { APP_NAME } from '@/lib/constants.ts'
import { routes } from '@/lib/routes.ts'
import { styles } from '@/lib/styles.ts'
import { useAuthStore } from '@/store/auth-store.ts'

export function LoginPage() {
  const { user } = useAuthStore()
  useDocumentTitle('Giriş')

  if (user) {
    return <Navigate to={routes.dashboard} replace />
  }

  return (
    <div className={styles.loginPanel}>
      <p className={styles.loginBrand}>{APP_NAME}</p>
      <Card>
        <div className={styles.page}>
          <header>
            <h1 className={styles.pageTitle}>Giriş</h1>
            <p className={styles.pageDescription}>Hesabınızla davam edin.</p>
          </header>
          <LoginForm />
        </div>
      </Card>
    </div>
  )
}
