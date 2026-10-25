import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { BrandLockup } from '@/components/brand/BrandLockup'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { signOut } from '@/features/auth/api/sign-out'
import { fetchCompany } from '@/features/company/api/fetch-company'
import { CompanyOnboarding } from '@/features/company/components/CompanyOnboarding'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { readTokenClaims } from '@/lib/jwt'
import { routes } from '@/lib/routes'
import { styles } from '@/lib/styles'
import { getAuthState, setActiveCompany, useAuthStore } from '@/store/auth-store'
import { setCompany } from '@/store/company-store'
import { isSuperAdmin } from '@/types/auth'

const PAGE_COPY = {
  loading: { title: 'Şirkət', description: 'Şirkət məlumatları yüklənir…' },
  create: { title: 'Şirkət', description: 'Yeni şirkət yaradın və ya dəvət kodu ilə mövcud şirkətə qoşulun.' },
  stale: {
    title: 'Yenidən daxil olun',
    description: 'Şirkətiniz bu sessiyadan sonra yaradılıb. Davam etmək üçün yenidən daxil olun.',
  },
  error: { title: 'Şirkət', description: '' },
}

// The backend gives each user at most one company (GET /api/company), so there is nothing to choose
// between: an existing company is selected automatically, otherwise the user creates one or joins one
// with an invite code here.
export function SelectCompanyPage() {
  const navigate = useNavigate()
  const { activeCompanyId, user } = useAuthStore()
  const platformAdmin = isSuperAdmin(user)
  const [status, setStatus] = useState({ step: 'loading' })
  const [attempt, setAttempt] = useState(0)
  useDocumentTitle('Şirkət')

  useEffect(() => {
    if (activeCompanyId || platformAdmin) {
      return undefined
    }

    let cancelled = false

    fetchCompany()
      .then((company) => {
        if (cancelled) {
          return
        }

        if (!company) {
          setStatus({ step: 'create' })
          return
        }

        // Company endpoints read the company from the token; a token issued before the company
        // existed has no companyId claim, and the API has no refresh, so a new login is needed.
        if (readTokenClaims(getAuthState().token)?.companyId !== company.id) {
          setStatus({ step: 'stale' })
          return
        }

        setCompany(company)
        setActiveCompany(company.id)
      })
      .catch((error) => {
        if (!cancelled) {
          setStatus({ step: 'error', error: error.message })
        }
      })

    return () => {
      cancelled = true
    }
  }, [activeCompanyId, platformAdmin, attempt])

  if (activeCompanyId) {
    return <Navigate to={routes.dashboard} replace />
  }

  // Platform admins belong to no company; they work from the admin panel.
  if (platformAdmin) {
    return <Navigate to={routes.admin} replace />
  }

  function handleLogout() {
    signOut()
    navigate(routes.login, { replace: true })
  }

  function handleRetry() {
    setStatus({ step: 'loading' })
    setAttempt((current) => current + 1)
  }

  const copy = PAGE_COPY[status.step]

  return (
    <div className={styles.loginPanel}>
      <div className={styles.loginBrand}>
        <BrandLockup align="center" />
      </div>
      <Card>
        <div className={styles.page}>
          <header>
            <h1 className={styles.pageTitle}>{copy.title}</h1>
            <p className={styles.pageDescription}>{status.error ?? copy.description}</p>
          </header>
          {status.step === 'create' ? <CompanyOnboarding /> : null}
          {status.step === 'error' ? <Button onClick={handleRetry}>Yenidən cəhd et</Button> : null}
          {status.step === 'stale' ? <Button onClick={handleLogout}>Yenidən daxil ol</Button> : null}
          {status.step === 'stale' ? null : (
            <button type="button" className={styles.headerAction} onClick={handleLogout}>
              Çıxış
            </button>
          )}
        </div>
      </Card>
    </div>
  )
}
