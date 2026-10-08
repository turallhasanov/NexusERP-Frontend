import { Navigate, useNavigate } from 'react-router-dom'
import { BrandLockup } from '@/components/brand/BrandLockup'
import { Card } from '@/components/ui/card'
import { CompanyForm } from '@/features/company/components/CompanyForm'
import { useCompany } from '@/features/company/api/use-company'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { routes } from '@/lib/routes'
import { styles } from '@/lib/styles'
import { setAuthUser } from '@/store/auth-store'

export function CompanySetupPage() {
  const navigate = useNavigate()
  const { company } = useCompany()
  useDocumentTitle('Şirkət yarat')

  if (company) {
    return <Navigate to={routes.dashboard} replace />
  }

  function handleLogout() {
    setAuthUser(null)
    navigate(routes.login, { replace: true })
  }

  return (
    <div className={styles.loginPanel}>
      <div className={styles.loginBrand}>
        <BrandLockup align="center" />
      </div>
      <Card>
        <div className={styles.page}>
          <header>
            <h1 className={styles.pageTitle}>Şirkət yarat</h1>
            <p className={styles.pageDescription}>Modulları açmaq üçün şirkətinizi qeyd edin.</p>
          </header>
          <CompanyForm />
          <button type="button" className={styles.headerAction} onClick={handleLogout}>
            Çıxış
          </button>
        </div>
      </Card>
    </div>
  )
}
