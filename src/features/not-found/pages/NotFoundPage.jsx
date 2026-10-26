import { useNavigate } from 'react-router-dom'
import { BrandLockup } from '@/components/brand/BrandLockup'
import { Button } from '@/components/ui/button'
import { ButtonLink } from '@/components/ui/button-link'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { homeRoute } from '@/lib/home-route'
import { routes } from '@/lib/routes'
import { styles } from '@/lib/styles'
import { useAuthStore } from '@/store/auth-store'

// Any URL no route matches. Rendered inside AuthShell, so it sits on the same glass surface as sign-in.
export function NotFoundPage() {
  const navigate = useNavigate()
  const auth = useAuthStore()
  // Signed in: the user's own home (/admin for platform admins, / for company users); otherwise sign-in.
  const home = auth.token ? homeRoute(auth) : routes.login
  useDocumentTitle('Səhifə tapılmadı')

  function goBack() {
    // React Router numbers its history entries; at 0 this tab has nowhere in the app to go back to.
    if (window.history.state?.idx > 0) {
      navigate(-1)
    } else {
      navigate(home, { replace: true })
    }
  }

  return (
    <div className={styles.notFoundPanel}>
      <div className={styles.loginBrand}>
        <BrandLockup align="center" />
      </div>
      <main className={styles.notFoundCard}>
        <p className={styles.notFoundCode} aria-hidden="true">
          404
        </p>
        <h1 className={styles.notFoundTitle}>Səhifə tapılmadı</h1>
        <p className={styles.notFoundText}>Axtardığınız səhifə mövcud deyil, silinib və ya ünvan səhv daxil edilib.</p>
        <div className={styles.notFoundActions}>
          <Button variant="outline" onClick={goBack}>
            Geri dön
          </Button>
          <ButtonLink to={home} replace>
            Ana səhifəyə qayıt
          </ButtonLink>
        </div>
      </main>
    </div>
  )
}
