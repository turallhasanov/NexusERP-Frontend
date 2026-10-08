import { Navigate } from 'react-router-dom'
import { BrandLockup } from '@/components/brand/BrandLockup'
import { Card } from '@/components/ui/card'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { useCompany } from '@/features/company/api/use-company'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { routes } from '@/lib/routes'
import { styles } from '@/lib/styles'
import { useAuthStore } from '@/store/auth-store'

export function LoginPage() {
  const { user } = useAuthStore()
  const { company } = useCompany()
  useDocumentTitle('Giriş')

  if (user) {
    return <Navigate to={company ? routes.dashboard : routes.setup} replace />
  }

  return (
    <div className={styles.loginPanel}>
      <div className={styles.loginBrand}>
        <BrandLockup align="center" />
      </div>
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
